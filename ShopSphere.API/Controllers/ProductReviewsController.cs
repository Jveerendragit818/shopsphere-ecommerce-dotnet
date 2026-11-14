using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ShopSphere.Core.DTOs;
using ShopSphere.Core.Interfaces;

namespace ShopSphere.API.Controllers;

[ApiController]
[Route("api/products/{productId:int}/reviews")]
public sealed class ProductReviewsController : ControllerBase
{
    private readonly IReviewService _reviewService;

    public ProductReviewsController(IReviewService reviewService)
    {
        _reviewService = reviewService;
    }

    [AllowAnonymous]
    [HttpGet]
    public async Task<IActionResult> GetApproved(int productId)
    {
        try
        {
            return Ok(
                await _reviewService.GetApprovedByProductIdAsync(productId));
        }
        catch (ArgumentOutOfRangeException exception)
        {
            return BadRequest(new { message = exception.Message });
        }
    }

    [Authorize(Roles = "Customer")]
    [HttpPost]
    public async Task<IActionResult> Create(
        int productId,
        CreateReviewRequestDto request)
    {
        var userIdValue =
            User.FindFirstValue(ClaimTypes.NameIdentifier);

        if (!int.TryParse(userIdValue, out var userId))
            return Unauthorized();

        try
        {
            var reviewId = await _reviewService.AddForDeliveredProductAsync(
                userId,
                productId,
                request.Rating,
                request.ReviewTitle,
                request.ReviewText);

            return StatusCode(StatusCodes.Status201Created, new
            {
                reviewId,
                productId,
                request.Rating,
                reviewStatus = "Pending",
                message = "Review submitted for admin approval."
            });
        }
        catch (ArgumentOutOfRangeException exception)
        {
            return BadRequest(new { message = exception.Message });
        }
        catch (InvalidOperationException exception)
        {
            return BadRequest(new { message = exception.Message });
        }
    }
}