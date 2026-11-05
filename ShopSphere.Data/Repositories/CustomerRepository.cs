using System.Data.Common;
using MySql.Data.MySqlClient;
using ShopSphere.Core.Entities;
using ShopSphere.Core.Interfaces;
using ShopSphere.Data.Database;

namespace ShopSphere.Data.Repositories;

public sealed class CustomerRepository : ICustomerRepository
{
    private readonly MySqlConnectionFactory _connectionFactory;

    public CustomerRepository(MySqlConnectionFactory connectionFactory)
    {
        _connectionFactory = connectionFactory;
    }

    public async Task<IReadOnlyList<Customer>> GetAllAsync()
    {
        const string sql = """
            SELECT CustomerId, UserId
            FROM Customers
            ORDER BY CustomerId;
            """;

        await using var connection =
            await _connectionFactory.CreateOpenConnectionAsync();
        await using var command = new MySqlCommand(sql, connection);
        await using var reader = await command.ExecuteReaderAsync();

        var customers = new List<Customer>();
        while (await reader.ReadAsync())
            customers.Add(ReadCustomer(reader));

        return customers;
    }

    public async Task<Customer?> GetByIdAsync(int customerId)
    {
        const string sql = """
            SELECT CustomerId, UserId
            FROM Customers
            WHERE CustomerId = @CustomerId;
            """;

        await using var connection =
            await _connectionFactory.CreateOpenConnectionAsync();
        await using var command = new MySqlCommand(sql, connection);
        command.Parameters.AddWithValue("@CustomerId", customerId);

        await using var reader = await command.ExecuteReaderAsync();
        return await reader.ReadAsync() ? ReadCustomer(reader) : null;
    }

    public async Task<Customer?> GetByUserIdAsync(int userId)
    {
        const string sql = """
            SELECT CustomerId, UserId
            FROM Customers
            WHERE UserId = @UserId;
            """;

        await using var connection =
            await _connectionFactory.CreateOpenConnectionAsync();
        await using var command = new MySqlCommand(sql, connection);
        command.Parameters.AddWithValue("@UserId", userId);

        await using var reader = await command.ExecuteReaderAsync();
        return await reader.ReadAsync() ? ReadCustomer(reader) : null;
    }

    public async Task<int> AddAsync(Customer customer)
    {
        const string sql = """
            INSERT INTO Customers (UserId)
            VALUES (@UserId);
            """;

        await using var connection =
            await _connectionFactory.CreateOpenConnectionAsync();
        await using var command = new MySqlCommand(sql, connection);
        command.Parameters.AddWithValue("@UserId", customer.UserId);
        await command.ExecuteNonQueryAsync();

        return checked((int)command.LastInsertedId);
    }

    public async Task<bool> DeleteAsync(int customerId)
    {
        const string sql = """
            UPDATE Users AS u
            INNER JOIN Customers AS c ON c.UserId = u.UserId
            SET u.IsActive = FALSE
            WHERE c.CustomerId = @CustomerId;
            """;

        await using var connection =
            await _connectionFactory.CreateOpenConnectionAsync();
        await using var command = new MySqlCommand(sql, connection);
        command.Parameters.AddWithValue("@CustomerId", customerId);

        return await command.ExecuteNonQueryAsync() > 0;
    }

    private static Customer ReadCustomer(DbDataReader reader)
    {
        return new Customer
        {
            CustomerId = reader.GetInt32(reader.GetOrdinal("CustomerId")),
            UserId = reader.GetInt32(reader.GetOrdinal("UserId"))
        };
    }
}