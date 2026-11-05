using System.Data.Common;
using MySql.Data.MySqlClient;
using ShopSphere.Core.Entities;
using ShopSphere.Core.Interfaces;
using ShopSphere.Data.Database;

namespace ShopSphere.Data.Repositories;

public sealed class NotificationRepository : INotificationRepository
{
    private readonly MySqlConnectionFactory _connectionFactory;

    public NotificationRepository(MySqlConnectionFactory connectionFactory)
    {
        _connectionFactory = connectionFactory;
    }

    public async Task<IReadOnlyList<Notification>> GetByUserIdAsync(int userId)
    {
        const string sql = """
            SELECT NotificationId, UserId, Title, Message, NotificationType,
                   IsRead, CreatedAt
            FROM Notifications
            WHERE UserId = @UserId
            ORDER BY CreatedAt DESC;
            """;

        await using var connection =
            await _connectionFactory.CreateOpenConnectionAsync();
        await using var command = new MySqlCommand(sql, connection);
        command.Parameters.AddWithValue("@UserId", userId);
        await using var reader = await command.ExecuteReaderAsync();

        var notifications = new List<Notification>();
        while (await reader.ReadAsync())
            notifications.Add(ReadNotification(reader));

        return notifications;
    }

    public async Task<int> AddAsync(Notification notification)
    {
        const string sql = """
            INSERT INTO Notifications
                (UserId, Title, Message, NotificationType, IsRead)
            VALUES
                (@UserId, @Title, @Message, @NotificationType, @IsRead);
            """;

        await using var connection =
            await _connectionFactory.CreateOpenConnectionAsync();
        await using var command = new MySqlCommand(sql, connection);
        command.Parameters.AddWithValue("@UserId", notification.UserId);
        command.Parameters.AddWithValue("@Title", notification.Title);
        command.Parameters.AddWithValue("@Message", notification.Message);
        command.Parameters.AddWithValue(
            "@NotificationType",
            (object?)notification.NotificationType ?? DBNull.Value);
        command.Parameters.AddWithValue("@IsRead", notification.IsRead);
        await command.ExecuteNonQueryAsync();

        return checked((int)command.LastInsertedId);
    }

    public async Task<bool> MarkAsReadAsync(int notificationId)
    {
        const string sql = """
            UPDATE Notifications
            SET IsRead = TRUE
            WHERE NotificationId = @NotificationId;
            """;

        await using var connection =
            await _connectionFactory.CreateOpenConnectionAsync();
        await using var command = new MySqlCommand(sql, connection);
        command.Parameters.AddWithValue("@NotificationId", notificationId);

        return await command.ExecuteNonQueryAsync() > 0;
    }

    private static Notification ReadNotification(DbDataReader reader)
    {
        return new Notification
        {
            NotificationId = reader.GetInt32(
                reader.GetOrdinal("NotificationId")),
            UserId = reader.GetInt32(reader.GetOrdinal("UserId")),
            Title = reader.GetString(reader.GetOrdinal("Title")),
            Message = reader.GetString(reader.GetOrdinal("Message")),
            NotificationType = ReadNullableString(reader, "NotificationType"),
            IsRead = reader.GetBoolean(reader.GetOrdinal("IsRead")),
            CreatedAt = reader.GetDateTime(reader.GetOrdinal("CreatedAt"))
        };
    }

    private static string? ReadNullableString(
        DbDataReader reader,
        string columnName)
    {
        var index = reader.GetOrdinal(columnName);
        return reader.IsDBNull(index) ? null : reader.GetString(index);
    }
}