using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ShopSphere.Core.Interfaces;

namespace ShopSphere.API.Controllers;

[ApiController]
[Route("api/products/{productId:int}/images")]
public sealed class ProductImagesController : ControllerBase
{
    private readonly IProductImageService _imageService;

    public ProductImagesController(IProductImageService imageService)
    {
        _imageService = imageService;
    }

    [AllowAnonymous]
    [HttpGet]
    public async Task<IActionResult> GetForProduct(int productId)
    {
        if (productId <= 0)
            return BadRequest(new { message = "Product ID must be positive." });

        var images = await _imageService.GetByProductIdAsync(productId);
        return Ok(images);
    }

    [Authorize(Roles = "Admin")]
    [HttpPost]
    [Consumes("multipart/form-data")]
    public async Task<IActionResult> Upload(
        int productId,
        [FromForm] IFormFile? file,
        [FromForm] bool isPrimary = false,
        [FromForm] int displayOrder = 0)
    {
        if (file is null || file.Length == 0)
            return BadRequest(new { message = "Select an image file." });

        try
        {
            await using var stream = file.OpenReadStream();
            var imageId = await _imageService.UploadAsync(
                productId,
                stream,
                file.FileName,
                file.ContentType,
                file.Length,
                isPrimary,
                displayOrder);

            return CreatedAtAction(
                nameof(GetForProduct),
                new { productId },
                new { imageId });
        }
        catch (ArgumentException exception)
        {
            return BadRequest(new { message = exception.Message });
        }
        catch (InvalidOperationException exception)
        {
            return NotFound(new { message = exception.Message });
        }
    }

    [Authorize(Roles = "Admin")]
    [HttpPut("{imageId:int}/primary")]
    public async Task<IActionResult> SetPrimary(int productId, int imageId)
    {
        var updated =
            await _imageService.SetPrimaryAsync(productId, imageId);

        return updated ? NoContent() : NotFound();
    }

    [Authorize(Roles = "Admin")]
    [HttpDelete("{imageId:int}")]
    public async Task<IActionResult> Delete(int productId, int imageId)
    {
        var deleted = await _imageService.DeleteAsync(productId, imageId);
        return deleted ? NoContent() : NotFound();
    }
}