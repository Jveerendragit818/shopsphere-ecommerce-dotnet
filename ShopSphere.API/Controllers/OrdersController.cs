using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ShopSphere.Core.DTOs;
using ShopSphere.Core.Interfaces;

namespace ShopSphere.API.Controllers;

[ApiController]
[Authorize(Roles = "Customer")]
[Route("api/orders")]
public sealed class OrdersController : ControllerBase
{
    private readonly IOrderService _orderService;
    private readonly ICustomerRepository _customerRepository;

    public OrdersController(
        IOrderService orderService,
        ICustomerRepository customerRepository)
    {
        _orderService = orderService;
        _customerRepository = customerRepository;
    }

    [HttpPost]
    public async Task<IActionResult> Checkout(CheckoutRequestDto request)
    {
        var customerId = await GetCustomerIdAsync();
        if (customerId is null)
            return NotFound(new { message = "Customer account was not found." });

        try
        {
            var order = await _orderService.CheckoutAsync(
                customerId.Value,
                request);

            return CreatedAtAction(
                nameof(GetOrder),
                new { orderId = order.OrderId },
                order);
        }
        catch (ArgumentException exception)
        {
            return BadRequest(new { message = exception.Message });
        }
        catch (InvalidOperationException exception)
        {
            return Conflict(new { message = exception.Message });
        }
    }

    [HttpGet]
    public async Task<IActionResult> GetOrders()
    {
        var customerId = await GetCustomerIdAsync();
        if (customerId is null)
            return NotFound(new { message = "Customer account was not found." });

        var orders =
            await _orderService.GetCustomerOrdersAsync(customerId.Value);

        return Ok(orders);
    }

    [HttpGet("{orderId:int}")]
    public async Task<IActionResult> GetOrder(int orderId)
    {
        var customerId = await GetCustomerIdAsync();
        if (customerId is null)
            return NotFound(new { message = "Customer account was not found." });

        var order = await _orderService.GetCustomerOrderAsync(
            customerId.Value,
            orderId);

        return order is null ? NotFound() : Ok(order);
    }

    [HttpGet("{orderId:int}/items")]
    public async Task<IActionResult> GetOrderItems(int orderId)
    {
        var customerId = await GetCustomerIdAsync();
        if (customerId is null)
            return NotFound(new { message = "Customer account was not found." });

        var order = await _orderService.GetCustomerOrderAsync(
            customerId.Value,
            orderId);

        if (order is null)
            return NotFound();

        var items = await _orderService.GetCustomerOrderItemsAsync(
            customerId.Value,
            orderId);

        return Ok(items);
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