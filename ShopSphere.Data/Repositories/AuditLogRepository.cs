using System.Data.Common;
using MySql.Data.MySqlClient;
using ShopSphere.Core.Entities;
using ShopSphere.Core.Interfaces;
using ShopSphere.Data.Database;

namespace ShopSphere.Data.Repositories;

public sealed class AuditLogRepository : IAuditLogRepository
{
    private readonly MySqlConnectionFactory _connectionFactory;

    public AuditLogRepository(MySqlConnectionFactory connectionFactory)
    {
        _connectionFactory = connectionFactory;
    }

    public async Task<IReadOnlyList<AuditLog>> GetRecentAsync(int count)
    {
        if (count <= 0)
            throw new ArgumentOutOfRangeException(
                nameof(count), "Count must be greater than zero.");

        const string sql = """
            SELECT AuditLogId, UserId, Action, EntityName, EntityId,
                   Details, CreatedAt
            FROM AuditLogs
            ORDER BY CreatedAt DESC
            LIMIT @Count;
            """;

        await using var connection =
            await _connectionFactory.CreateOpenConnectionAsync();
        await using var command = new MySqlCommand(sql, connection);
        command.Parameters.AddWithValue("@Count", count);
        await using var reader = await command.ExecuteReaderAsync();

        var logs = new List<AuditLog>();
        while (await reader.ReadAsync())
            logs.Add(ReadAuditLog(reader));

        return logs;
    }

    public async Task<int> AddAsync(AuditLog auditLog)
    {
        const string sql = """
            INSERT INTO AuditLogs
                (UserId, Action, EntityName, EntityId, Details)
            VALUES
                (@UserId, @Action, @EntityName, @EntityId, @Details);
            """;

        await using var connection =
            await _connectionFactory.CreateOpenConnectionAsync();
        await using var command = new MySqlCommand(sql, connection);
        command.Parameters.AddWithValue(
            "@UserId", (object?)auditLog.UserId ?? DBNull.Value);
        command.Parameters.AddWithValue("@Action", auditLog.Action);
        command.Parameters.AddWithValue("@EntityName", auditLog.EntityName);
        command.Parameters.AddWithValue(
            "@EntityId", (object?)auditLog.EntityId ?? DBNull.Value);
        command.Parameters.AddWithValue(
            "@Details", (object?)auditLog.Details ?? DBNull.Value);
        await command.ExecuteNonQueryAsync();

        return checked((int)command.LastInsertedId);
    }

    private static AuditLog ReadAuditLog(DbDataReader reader)
    {
        return new AuditLog
        {
            AuditLogId = reader.GetInt64(reader.GetOrdinal("AuditLogId")),
            UserId = GetNullableInt32(reader, "UserId"),
            Action = reader.GetString(reader.GetOrdinal("Action")),
            EntityName = reader.GetString(reader.GetOrdinal("EntityName")),
            EntityId = ReadNullableString(reader, "EntityId"),
            Details = ReadNullableString(reader, "Details"),
            CreatedAt = reader.GetDateTime(reader.GetOrdinal("CreatedAt"))
        };
    }

    private static int? GetNullableInt32(DbDataReader reader, string name)
    {
        var index = reader.GetOrdinal(name);
        return reader.IsDBNull(index) ? null : reader.GetInt32(index);
    }

    private static string? ReadNullableString(
        DbDataReader reader,
        string columnName)
    {
        var index = reader.GetOrdinal(columnName);
        return reader.IsDBNull(index) ? null : reader.GetString(index);
    }

    public async Task<IReadOnlyList<AuditLog>> GetByEntityAsync(
    string entityName,
    string entityId,
    int count)
    {
        if (count <= 0)
            throw new ArgumentOutOfRangeException(nameof(count));

        const string sql = """
        SELECT AuditLogId, UserId, Action, EntityName, EntityId,
               Details, CreatedAt
        FROM AuditLogs
        WHERE EntityName = @EntityName
          AND EntityId = @EntityId
        ORDER BY CreatedAt DESC
        LIMIT @Count;
        """;

        await using var connection =
            await _connectionFactory.CreateOpenConnectionAsync();
        await using var command = new MySqlCommand(sql, connection);
        command.Parameters.AddWithValue("@EntityName", entityName);
        command.Parameters.AddWithValue("@EntityId", entityId);
        command.Parameters.AddWithValue("@Count", count);

        await using var reader = await command.ExecuteReaderAsync();
        var logs = new List<AuditLog>();

        while (await reader.ReadAsync())
            logs.Add(ReadAuditLog(reader));

        return logs;
    }
}