using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ShopSphere.Core.DTOs;
using ShopSphere.Core.Interfaces;

namespace ShopSphere.API.Controllers;

[ApiController]
[Route("api/products")]
public sealed class ProductsController : ControllerBase
{
    private readonly IProductService _productService;

    public ProductsController(IProductService productService)
    {
        _productService = productService;
    }

    [AllowAnonymous]
    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var products = await _productService.GetAllAsync();
        return Ok(products);
    }

    [AllowAnonymous]
    [HttpGet("{productId:int}")]
    public async Task<IActionResult> GetById(int productId)
    {
        var product = await _productService.GetByIdAsync(productId);
        return product is null ? NotFound() : Ok(product);
    }

    [Authorize(Roles = "Admin")]
    [HttpPost]
    public async Task<IActionResult> Add(ProductDto product)
    {
        try
        {
            var productId = await _productService.AddAsync(product);
            return CreatedAtAction(
                nameof(GetById),
                new { productId },
                new { productId });
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

    [Authorize(Roles = "Admin")]
    [HttpPut("{productId:int}")]
    public async Task<IActionResult> Update(int productId, ProductDto product)
    {
        try
        {
            var updated = await _productService.UpdateAsync(productId, product);
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

    [Authorize(Roles = "Admin")]
    [HttpDelete("{productId:int}")]
    public async Task<IActionResult> Delete(int productId)
    {
        var deleted = await _productService.DeleteAsync(productId);
        return deleted ? NoContent() : NotFound();
    }
}