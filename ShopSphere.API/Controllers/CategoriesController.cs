using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ShopSphere.Core.DTOs;
using ShopSphere.Core.Interfaces;

namespace ShopSphere.API.Controllers;

[ApiController]
[Route("api/categories")]
public sealed class CategoriesController : ControllerBase
{
    private readonly ICategoryService _categoryService;

    public CategoriesController(ICategoryService categoryService)
    {
        _categoryService = categoryService;
    }

    [AllowAnonymous]
    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var categories = await _categoryService.GetAllAsync();
        return Ok(categories);
    }

    [AllowAnonymous]
    [HttpGet("{categoryId:int}")]
    public async Task<IActionResult> GetById(int categoryId)
    {
        var category = await _categoryService.GetByIdAsync(categoryId);

        return category is null
            ? NotFound()
            : Ok(category);
    }

    [Authorize(Roles = "Admin")]
    [HttpPost]
    public async Task<IActionResult> Create(CategoryDto category)
    {
        try
        {
            var categoryId = await _categoryService.AddAsync(category);
            var created = await _categoryService.GetByIdAsync(categoryId);

            return CreatedAtAction(
                nameof(GetById),
                new { categoryId },
                created);
        }
        catch (ArgumentException exception)
        {
            return BadRequest(new { message = exception.Message });
        }
    }

    [Authorize(Roles = "Admin")]
    [HttpPut("{categoryId:int}")]
    public async Task<IActionResult> Update(
        int categoryId,
        CategoryDto category)
    {
        try
        {
            var updated =
                await _categoryService.UpdateAsync(categoryId, category);

            return updated ? NoContent() : NotFound();
        }
        catch (ArgumentException exception)
        {
            return BadRequest(new { message = exception.Message });
        }
    }

    [Authorize(Roles = "Admin")]
    [HttpDelete("{categoryId:int}")]
    public async Task<IActionResult> Delete(int categoryId)
    {
        var deleted = await _categoryService.DeleteAsync(categoryId);

        return deleted ? NoContent() : NotFound();
    }
}