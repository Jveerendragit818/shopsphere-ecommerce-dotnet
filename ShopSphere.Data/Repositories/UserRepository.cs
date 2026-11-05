using System.Data.Common;
using MySql.Data.MySqlClient;
using ShopSphere.Core.Entities;
using ShopSphere.Core.Interfaces;
using ShopSphere.Data.Database;

namespace ShopSphere.Data.Repositories;

public sealed class UserRepository : IUserRepository
{
    private readonly MySqlConnectionFactory _connectionFactory;

    public UserRepository(MySqlConnectionFactory connectionFactory)
    {
        _connectionFactory = connectionFactory;
    }

    public async Task<User?> GetByIdAsync(int userId)
    {
        const string sql = """
            SELECT UserId, FullName, Email, Phone, PasswordHash, Role,
                   IsActive, CreatedAt, UpdatedAt
            FROM Users
            WHERE UserId = @UserId;
            """;

        await using var connection =
            await _connectionFactory.CreateOpenConnectionAsync();
        await using var command = new MySqlCommand(sql, connection);
        command.Parameters.AddWithValue("@UserId", userId);

        await using var reader = await command.ExecuteReaderAsync();
        return await reader.ReadAsync() ? ReadUser(reader) : null;
    }

    public async Task<User?> GetByEmailAsync(string email)
    {
        const string sql = """
            SELECT UserId, FullName, Email, Phone, PasswordHash, Role,
                   IsActive, CreatedAt, UpdatedAt
            FROM Users
            WHERE Email = @Email;
            """;

        await using var connection =
            await _connectionFactory.CreateOpenConnectionAsync();
        await using var command = new MySqlCommand(sql, connection);
        command.Parameters.AddWithValue("@Email", email);

        await using var reader = await command.ExecuteReaderAsync();
        return await reader.ReadAsync() ? ReadUser(reader) : null;
    }

    public async Task<int> AddAsync(User user)
    {
        const string sql = """
            INSERT INTO Users
                (FullName, Email, Phone, PasswordHash, Role, IsActive)
            VALUES
                (@FullName, @Email, @Phone, @PasswordHash, @Role, @IsActive);
            """;

        await using var connection =
            await _connectionFactory.CreateOpenConnectionAsync();
        await using var command = new MySqlCommand(sql, connection);
        AddUserParameters(command, user);
        await command.ExecuteNonQueryAsync();

        return checked((int)command.LastInsertedId);
    }

    public async Task<bool> UpdateAsync(User user)
    {
        const string sql = """
            UPDATE Users
            SET FullName = @FullName,
                Email = @Email,
                Phone = @Phone,
                PasswordHash = @PasswordHash,
                Role = @Role,
                IsActive = @IsActive,
                UpdatedAt = CURRENT_TIMESTAMP
            WHERE UserId = @UserId;
            """;

        await using var connection =
            await _connectionFactory.CreateOpenConnectionAsync();
        await using var command = new MySqlCommand(sql, connection);
        AddUserParameters(command, user);
        command.Parameters.AddWithValue("@UserId", user.UserId);

        return await command.ExecuteNonQueryAsync() > 0;
    }

    public async Task<int> AddCustomerAccountAsync(User user)
    {
        const string userSql = """
        INSERT INTO Users
            (FullName, Email, Phone, PasswordHash, Role, IsActive)
        VALUES
            (@FullName, @Email, @Phone, @PasswordHash, 'Customer', TRUE);
        """;

        const string customerSql = """
        INSERT INTO Customers (UserId)
        VALUES (@UserId);
        """;

        await using var connection =
            await _connectionFactory.CreateOpenConnectionAsync();
        using var transaction = connection.BeginTransaction();

        try
        {
            await using var userCommand =
                new MySqlCommand(userSql, connection, transaction);
            userCommand.Parameters.AddWithValue("@FullName", user.FullName);
            userCommand.Parameters.AddWithValue("@Email", user.Email);
            userCommand.Parameters.AddWithValue(
                "@Phone", (object?)user.Phone ?? DBNull.Value);
            userCommand.Parameters.AddWithValue("@PasswordHash", user.PasswordHash);
            await userCommand.ExecuteNonQueryAsync();

            var userId = checked((int)userCommand.LastInsertedId);

            await using var customerCommand =
                new MySqlCommand(customerSql, connection, transaction);
            customerCommand.Parameters.AddWithValue("@UserId", userId);
            await customerCommand.ExecuteNonQueryAsync();

            transaction.Commit();
            return userId;
        }
        catch
        {
            transaction.Rollback();
            throw;
        }
    }

    private static void AddUserParameters(MySqlCommand command, User user)
    {
        command.Parameters.AddWithValue("@FullName", user.FullName);
        command.Parameters.AddWithValue("@Email", user.Email);
        command.Parameters.AddWithValue(
            "@Phone", (object?)user.Phone ?? DBNull.Value);
        command.Parameters.AddWithValue("@PasswordHash", user.PasswordHash);
        command.Parameters.AddWithValue("@Role", user.Role);
        command.Parameters.AddWithValue("@IsActive", user.IsActive);
    }

    private static User ReadUser(DbDataReader reader)
    {
        var updatedAtIndex = reader.GetOrdinal("UpdatedAt");

        return new User
        {
            UserId = reader.GetInt32(reader.GetOrdinal("UserId")),
            FullName = reader.GetString(reader.GetOrdinal("FullName")),
            Email = reader.GetString(reader.GetOrdinal("Email")),
            Phone = ReadNullableString(reader, "Phone"),
            PasswordHash = reader.GetString(reader.GetOrdinal("PasswordHash")),
            Role = reader.GetString(reader.GetOrdinal("Role")),
            IsActive = reader.GetBoolean(reader.GetOrdinal("IsActive")),
            CreatedAt = reader.GetDateTime(reader.GetOrdinal("CreatedAt")),
            UpdatedAt = reader.IsDBNull(updatedAtIndex)
                ? null
                : reader.GetDateTime(updatedAtIndex)
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