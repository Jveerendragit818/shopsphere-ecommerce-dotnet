using System.ComponentModel.DataAnnotations;

namespace ShopSphere.Core.DTOs;

public sealed class CreateNotificationRequestDto
{
    [Range(1, int.MaxValue)]
    public int UserId { get; set; }

    [Required]
    public string Title { get; set; } = string.Empty;

    [Required]
    public string Message { get; set; } = string.Empty;

    public string? NotificationType { get; set; }
}