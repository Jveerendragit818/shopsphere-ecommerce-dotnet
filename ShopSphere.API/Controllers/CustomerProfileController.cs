using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ShopSphere.Core.DTOs;
using ShopSphere.Core.Interfaces;

namespace ShopSphere.API.Controllers;

[ApiController]
[Authorize(Roles = "Customer")]
[Route("api/account/profile")]
public sealed class CustomerProfileController : ControllerBase
{
    private readonly ICustomerService _customerService;

    public CustomerProfileController(ICustomerService customerService)
    {
        _customerService = customerService;
    }

    [HttpGet]
    public async Task<IActionResult> GetProfile()
    {
        if (!TryGetUserId(out var userId))
            return Unauthorized();

        var profile = await _customerService.GetProfileAsync(userId);
        return profile is null ? NotFound() : Ok(profile);
    }

    [HttpPut]
    public async Task<IActionResult> UpdateProfile(
        UpdateCustomerProfileDto request)
    {
        if (!TryGetUserId(out var userId))
            return Unauthorized();

        try
        {
            var updated =
                await _customerService.UpdateProfileAsync(userId, request);

            return updated ? NoContent() : NotFound();
        }
        catch (InvalidOperationException exception)
        {
            return Conflict(new { message = exception.Message });
        }
    }

    private bool TryGetUserId(out int userId)
    {
        var userIdText = User.FindFirstValue(ClaimTypes.NameIdentifier);
        return int.TryParse(userIdText, out userId);
    }
}