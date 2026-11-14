using ShopSphere.Core.Entities;
using ShopSphere.Core.Interfaces;

namespace ShopSphere.API.Services;

public sealed class NotificationService : INotificationService
{
    private readonly INotificationRepository _notificationRepository;
    private readonly IUserRepository _userRepository;

    public NotificationService(
        INotificationRepository notificationRepository,
        IUserRepository userRepository)
    {
        _notificationRepository = notificationRepository;
        _userRepository = userRepository;
    }

    public Task<IReadOnlyList<Notification>> GetByUserIdAsync(int userId)
    {
        if (userId <= 0)
            throw new ArgumentOutOfRangeException(nameof(userId));

        return _notificationRepository.GetByUserIdAsync(userId);
    }

    public Task<bool> MarkAsReadAsync(int notificationId, int userId)
    {
        if (notificationId <= 0)
            throw new ArgumentOutOfRangeException(nameof(notificationId));

        if (userId <= 0)
            throw new ArgumentOutOfRangeException(nameof(userId));

        return _notificationRepository.MarkAsReadAsync(
            notificationId,
            userId);
    }

    public async Task<int> CreateAsync(
        int userId,
        string title,
        string message,
        string? notificationType)
    {
        if (userId <= 0)
            throw new ArgumentOutOfRangeException(nameof(userId));

        if (string.IsNullOrWhiteSpace(title))
            throw new ArgumentException("Title is required.", nameof(title));

        if (string.IsNullOrWhiteSpace(message))
            throw new ArgumentException("Message is required.", nameof(message));

        var user = await _userRepository.GetByIdAsync(userId);
        if (user is null)
            throw new InvalidOperationException("The user was not found.");

        return await _notificationRepository.AddAsync(new Notification
        {
            UserId = userId,
            Title = title.Trim(),
            Message = message.Trim(),
            NotificationType = string.IsNullOrWhiteSpace(notificationType)
                ? null
                : notificationType.Trim(),
            IsRead = false
        });
    }
}