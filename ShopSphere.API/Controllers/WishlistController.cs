using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ShopSphere.Core.Interfaces;

namespace ShopSphere.API.Controllers;

public sealed record AddWishlistItemRequest(int ProductId);

[ApiController]
[Authorize(Roles = "Customer")]
[Route("api/wishlist")]
public sealed class WishlistController : ControllerBase
{
    private readonly IWishlistService _wishlistService;
    private readonly ICustomerRepository _customerRepository;

    public WishlistController(
        IWishlistService wishlistService,
        ICustomerRepository customerRepository)
    {
        _wishlistService = wishlistService;
        _customerRepository = customerRepository;
    }

    [HttpGet]
    public async Task<IActionResult> GetWishlist()
    {
        var customerId = await GetCustomerIdAsync();
        if (customerId is null)
            return NotFound(new { message = "Customer account was not found." });

        var wishlist = await _wishlistService.GetOrCreateAsync(customerId.Value);
        var items = await _wishlistService.GetItemsAsync(customerId.Value);

        return Ok(new { wishlist.WishlistId, wishlist.CustomerId, items });
    }

    [HttpPost("items")]
    public async Task<IActionResult> AddItem(AddWishlistItemRequest request)
    {
        var customerId = await GetCustomerIdAsync();
        if (customerId is null)
            return NotFound(new { message = "Customer account was not found." });

        try
        {
            var wishlistItemId = await _wishlistService.AddItemAsync(
                customerId.Value,
                request.ProductId);

            return Created(
                "/api/wishlist",
                new { wishlistItemId });
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

    [HttpDelete("items/{wishlistItemId:int}")]
    public async Task<IActionResult> RemoveItem(int wishlistItemId)
    {
        var customerId = await GetCustomerIdAsync();
        if (customerId is null)
            return NotFound(new { message = "Customer account was not found." });   

        var removed = await _wishlistService.RemoveItemAsync(
            customerId.Value,
            wishlistItemId);

        return removed ? NoContent() : NotFound();
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