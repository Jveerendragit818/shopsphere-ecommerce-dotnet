using ShopSphere.Core.Entities;

namespace ShopSphere.Core.Interfaces;

public interface INotificationRepository
{
    Task<IReadOnlyList<Notification>> GetByUserIdAsync(int userId);
    Task<int> AddAsync(Notification notification);
    Task<bool> MarkAsReadAsync(int notificationId, int userId);
}