using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ShopSphere.Core.DTOs;
using ShopSphere.Core.Interfaces;

namespace ShopSphere.API.Controllers;

[ApiController]
[Authorize(Roles = "Admin")]
[Route("api/admin/notifications")]
public sealed class AdminNotificationsController : ControllerBase
{
    private readonly INotificationService _notificationService;

    public AdminNotificationsController(
        INotificationService notificationService)
    {
        _notificationService = notificationService;
    }

    [HttpPost]
    public async Task<IActionResult> Create(
        CreateNotificationRequestDto request)
    {
        try
        {
            var notificationId = await _notificationService.CreateAsync(
                request.UserId,
                request.Title,
                request.Message,
                request.NotificationType);

            return StatusCode(StatusCodes.Status201Created, new
            {
                notificationId,
                request.UserId,
                request.Title,
                request.Message,
                request.NotificationType,
                isRead = false
            });
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
}