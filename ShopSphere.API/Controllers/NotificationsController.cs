using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ShopSphere.Core.Interfaces;

namespace ShopSphere.API.Controllers;

[ApiController]
[Authorize]
[Route("api/notifications")]
public sealed class NotificationsController : ControllerBase
{
    private readonly INotificationService _notificationService;

    public NotificationsController(INotificationService notificationService)
    {
        _notificationService = notificationService;
    }

    [HttpGet]
    public async Task<IActionResult> GetMine()
    {
        if (!TryGetUserId(out var userId))
            return Unauthorized();

        return Ok(await _notificationService.GetByUserIdAsync(userId));
    }

    [HttpPut("{notificationId:int}/read")]
    public async Task<IActionResult> MarkAsRead(int notificationId)
    {
        if (!TryGetUserId(out var userId))
            return Unauthorized();

        try
        {
            var updated = await _notificationService.MarkAsReadAsync(
                notificationId,
                userId);

            return updated ? NoContent() : NotFound();
        }
        catch (ArgumentOutOfRangeException exception)
        {
            return BadRequest(new { message = exception.Message });
        }
    }

    private bool TryGetUserId(out int userId)
    {
        return int.TryParse(
            User.FindFirstValue(ClaimTypes.NameIdentifier),
            out userId);
    }
}