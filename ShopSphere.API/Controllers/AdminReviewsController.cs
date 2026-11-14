using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ShopSphere.Core.DTOs;
using ShopSphere.Core.Interfaces;

namespace ShopSphere.API.Controllers;

[ApiController]
[Authorize(Roles = "Admin")]
[Route("api/admin/reviews")]
public sealed class AdminReviewsController : ControllerBase
{
    private readonly IReviewService _reviewService;

    public AdminReviewsController(IReviewService reviewService)
    {
        _reviewService = reviewService;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        return Ok(await _reviewService.GetAllAsync());
    }

    [HttpPut("{reviewId:int}/status")]
    public async Task<IActionResult> UpdateStatus(
        int reviewId,
        UpdateReviewStatusRequestDto request)
    {
        try
        {
            var updated = await _reviewService.UpdateStatusAsync(
                reviewId,
                request.ReviewStatus);

            return updated ? NoContent() : NotFound();
        }
        catch (ArgumentOutOfRangeException exception)
        {
            return BadRequest(new { message = exception.Message });
        }
        catch (ArgumentException exception)
        {
            return BadRequest(new { message = exception.Message });
        }
    }

    [HttpDelete("{reviewId:int}")]
    public async Task<IActionResult> Delete(int reviewId)
    {
        try
        {
            var deleted = await _reviewService.DeleteAsync(reviewId);
            return deleted ? NoContent() : NotFound();
        }
        catch (ArgumentOutOfRangeException exception)
        {
            return BadRequest(new { message = exception.Message });
        }
    }
}