using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ShopSphere.Core.Interfaces;

namespace ShopSphere.API.Controllers;

public sealed record UpdateStockRequest(int StockQuantity);

[ApiController]
[Authorize(Roles = "Admin")]
[Route("api/inventory")]
public sealed class InventoryController : ControllerBase
{
    private readonly IInventoryService _inventoryService;

    public InventoryController(IInventoryService inventoryService)
    {
        _inventoryService = inventoryService;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var inventory = await _inventoryService.GetAllAsync();
        return Ok(inventory);
    }

    [HttpGet("{productId:int}")]
    public async Task<IActionResult> GetByProductId(int productId)
    {
        if (productId <= 0)
            return BadRequest(new { message = "Product ID must be positive." });

        var inventory =
            await _inventoryService.GetByProductIdAsync(productId);

        return inventory is null ? NotFound() : Ok(inventory);
    }

    [HttpPut("{productId:int}/stock")]
    public async Task<IActionResult> UpdateStock(
        int productId,
        UpdateStockRequest request)
    {
        if (productId <= 0 || request.StockQuantity < 0)
            return BadRequest(new
            {
                message = "Product ID must be positive and stock cannot be negative."
            });

        var updated = await _inventoryService.UpdateStockAsync(
            productId,
            request.StockQuantity);

        return updated ? NoContent() : NotFound();
    }

    [HttpGet("{productId:int}/history")]
    public async Task<IActionResult> GetHistory(
    int productId,
    [FromQuery] int count = 50)
    {
        var history =
            await _inventoryService.GetHistoryAsync(productId, count);

        return Ok(history);
    }
}   