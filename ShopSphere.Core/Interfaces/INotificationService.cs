using ShopSphere.Core.Entities;

namespace ShopSphere.Core.Interfaces;

public interface INotificationService
{
    Task<IReadOnlyList<Notification>> GetByUserIdAsync(int userId);
    Task<bool> MarkAsReadAsync(int notificationId, int userId);
    Task<int> CreateAsync(
        int userId,
        string title,
        string message,
        string? notificationType);
}