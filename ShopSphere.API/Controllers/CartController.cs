using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ShopSphere.Core.Interfaces;

namespace ShopSphere.API.Controllers;

public sealed record AddCartItemRequest(int ProductId, int Quantity);
public sealed record UpdateCartItemRequest(int Quantity);

[ApiController]
[Authorize(Roles = "Customer")]
[Route("api/cart")]
public sealed class CartController : ControllerBase
{
    private readonly ICartService _cartService;
    private readonly ICustomerRepository _customerRepository;

    public CartController(
        ICartService cartService,
        ICustomerRepository customerRepository)
    {
        _cartService = cartService;
        _customerRepository = customerRepository;
    }

    [HttpGet]
    public async Task<IActionResult> GetCart()
    {
        var customerId = await GetCustomerIdAsync();
        if (customerId is null)
            return NotFound(new { message = "Customer account was not found." });

        var cart = await _cartService.GetOrCreateAsync(customerId.Value);
        var items = await _cartService.GetItemsAsync(customerId.Value);

        return Ok(new { cart.CartId, cart.CustomerId, items });
    }

    [HttpPost("items")]
    public async Task<IActionResult> AddItem(AddCartItemRequest request)
    {
        var customerId = await GetCustomerIdAsync();
        if (customerId is null)
            return NotFound(new { message = "Customer account was not found." });

        try
        {
            var cartItemId = await _cartService.AddItemAsync(
                customerId.Value,
                request.ProductId,
                request.Quantity);

            return CreatedAtAction(
                nameof(GetCart),
                new { cartItemId });
        }
        catch (ArgumentException exception)
        {
            return BadRequest(new { message = exception.Message });
        }
        catch (InvalidOperationException exception)
        {
            return BadRequest(new { message = exception.Message });
        }
    }

    [HttpPut("items/{cartItemId:int}")]
    public async Task<IActionResult> UpdateItem(
        int cartItemId,
        UpdateCartItemRequest request)
    {
        var customerId = await GetCustomerIdAsync();
        if (customerId is null)
            return NotFound(new { message = "Customer account was not found." });

        try
        {
            var updated = await _cartService.UpdateItemQuantityAsync(
                customerId.Value,
                cartItemId,
                request.Quantity);

            return updated ? NoContent() : NotFound();
        }
        catch (ArgumentException exception)
        {
            return BadRequest(new { message = exception.Message });
        }
        catch (InvalidOperationException exception)
        {
            return BadRequest(new { message = exception.Message });
        }
    }

    [HttpDelete("items/{cartItemId:int}")]
    public async Task<IActionResult> RemoveItem(int cartItemId)
    {
        var customerId = await GetCustomerIdAsync();
        if (customerId is null)
            return NotFound(new { message = "Customer account was not found." });

        var removed =
            await _cartService.RemoveItemAsync(customerId.Value, cartItemId);

        return removed ? NoContent() : NotFound();
    }

    [HttpDelete]
    public async Task<IActionResult> ClearCart()
    {
        var customerId = await GetCustomerIdAsync();
        if (customerId is null)
            return NotFound(new { message = "Customer account was not found." });

        await _cartService.ClearAsync(customerId.Value);
        return NoContent();
    }

    private async Task<int?> GetCustomerIdAsync()
    {
        var userIdText = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (!int.TryParse(userIdText, out var userId))
            return null;

        var customer = await _customerRepository.GetByUserIdAsync(userId);
        return customer?.CustomerId;
    }
}