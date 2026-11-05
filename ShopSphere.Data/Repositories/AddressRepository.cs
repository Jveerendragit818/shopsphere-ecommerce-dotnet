using System.Data.Common;
using MySql.Data.MySqlClient;
using ShopSphere.Core.Entities;
using ShopSphere.Core.Interfaces;
using ShopSphere.Data.Database;

namespace ShopSphere.Data.Repositories;

public sealed class AddressRepository : IAddressRepository
{
    private readonly MySqlConnectionFactory _connectionFactory;

    public AddressRepository(MySqlConnectionFactory connectionFactory)
    {
        _connectionFactory = connectionFactory;
    }

    public async Task<IReadOnlyList<Address>> GetByCustomerIdAsync(int customerId)
    {
        const string sql = """
            SELECT AddressId, CustomerId, FullName, Phone, AddressLine1,
                   AddressLine2, City, State, PostalCode, Country,
                   AddressType, IsDefault
            FROM Addresses
            WHERE CustomerId = @CustomerId
            ORDER BY IsDefault DESC, AddressId;
            """;

        await using var connection =
            await _connectionFactory.CreateOpenConnectionAsync();
        await using var command = new MySqlCommand(sql, connection);
        command.Parameters.AddWithValue("@CustomerId", customerId);
        await using var reader = await command.ExecuteReaderAsync();

        var addresses = new List<Address>();
        while (await reader.ReadAsync())
            addresses.Add(ReadAddress(reader));

        return addresses;
    }

    public async Task<Address?> GetByIdAsync(int addressId)
    {
        const string sql = """
            SELECT AddressId, CustomerId, FullName, Phone, AddressLine1,
                   AddressLine2, City, State, PostalCode, Country,
                   AddressType, IsDefault
            FROM Addresses
            WHERE AddressId = @AddressId;
            """;

        await using var connection =
            await _connectionFactory.CreateOpenConnectionAsync();
        await using var command = new MySqlCommand(sql, connection);
        command.Parameters.AddWithValue("@AddressId", addressId);

        await using var reader = await command.ExecuteReaderAsync();
        return await reader.ReadAsync() ? ReadAddress(reader) : null;
    }

    public async Task<int> AddAsync(Address address)
    {
        const string sql = """
            INSERT INTO Addresses
                (CustomerId, FullName, Phone, AddressLine1, AddressLine2,
                 City, State, PostalCode, Country, AddressType, IsDefault)
            VALUES
                (@CustomerId, @FullName, @Phone, @AddressLine1, @AddressLine2,
                 @City, @State, @PostalCode, @Country, @AddressType, @IsDefault);
            """;

        await using var connection =
            await _connectionFactory.CreateOpenConnectionAsync();
        await using var command = new MySqlCommand(sql, connection);
        AddAddressParameters(command, address);
        await command.ExecuteNonQueryAsync();

        return checked((int)command.LastInsertedId);
    }

    public async Task<bool> UpdateAsync(Address address)
    {
        const string sql = """
            UPDATE Addresses
            SET FullName = @FullName,
                Phone = @Phone,
                AddressLine1 = @AddressLine1,
                AddressLine2 = @AddressLine2,
                City = @City,
                State = @State,
                PostalCode = @PostalCode,
                Country = @Country,
                AddressType = @AddressType,
                IsDefault = @IsDefault
            WHERE AddressId = @AddressId
              AND CustomerId = @CustomerId;
            """;

        await using var connection =
            await _connectionFactory.CreateOpenConnectionAsync();
        await using var command = new MySqlCommand(sql, connection);
        AddAddressParameters(command, address);
        command.Parameters.AddWithValue("@AddressId", address.AddressId);

        return await command.ExecuteNonQueryAsync() > 0;
    }

    public async Task<bool> DeleteAsync(int addressId)
    {
        const string sql = """
            DELETE FROM Addresses
            WHERE AddressId = @AddressId;
            """;

        await using var connection =
            await _connectionFactory.CreateOpenConnectionAsync();
        await using var command = new MySqlCommand(sql, connection);
        command.Parameters.AddWithValue("@AddressId", addressId);

        return await command.ExecuteNonQueryAsync() > 0;
    }

    public async Task<bool> SetDefaultAsync(int customerId, int addressId)
    {
        const string clearSql = """
            UPDATE Addresses
            SET IsDefault = FALSE
            WHERE CustomerId = @CustomerId;
            """;

        const string setSql = """
            UPDATE Addresses
            SET IsDefault = TRUE
            WHERE AddressId = @AddressId
              AND CustomerId = @CustomerId;
            """;

        await using var connection =
            await _connectionFactory.CreateOpenConnectionAsync();
        using var transaction = connection.BeginTransaction();

        try
        {
            await using var clearCommand =
                new MySqlCommand(clearSql, connection, transaction);
            clearCommand.Parameters.AddWithValue("@CustomerId", customerId);
            await clearCommand.ExecuteNonQueryAsync();

            await using var setCommand =
                new MySqlCommand(setSql, connection, transaction);
            setCommand.Parameters.AddWithValue("@AddressId", addressId);
            setCommand.Parameters.AddWithValue("@CustomerId", customerId);

            var updated = await setCommand.ExecuteNonQueryAsync() > 0;
            if (!updated)
            {
                transaction.Rollback();
                return false;
            }

            transaction.Commit();
            return true;
        }
        catch
        {
            transaction.Rollback();
            throw;
        }
    }

    private static void AddAddressParameters(
        MySqlCommand command,
        Address address)
    {
        command.Parameters.AddWithValue("@CustomerId", address.CustomerId);
        command.Parameters.AddWithValue("@FullName", address.FullName);
        command.Parameters.AddWithValue("@Phone", address.Phone);
        command.Parameters.AddWithValue("@AddressLine1", address.AddressLine1);
        command.Parameters.AddWithValue(
            "@AddressLine2", (object?)address.AddressLine2 ?? DBNull.Value);
        command.Parameters.AddWithValue("@City", address.City);
        command.Parameters.AddWithValue("@State", address.State);
        command.Parameters.AddWithValue("@PostalCode", address.PostalCode);
        command.Parameters.AddWithValue("@Country", address.Country);
        command.Parameters.AddWithValue("@AddressType", address.AddressType);
        command.Parameters.AddWithValue("@IsDefault", address.IsDefault);
    }

    private static Address ReadAddress(DbDataReader reader)
    {
        return new Address
        {
            AddressId = GetInt32(reader, "AddressId"),
            CustomerId = GetInt32(reader, "CustomerId"),
            FullName = GetString(reader, "FullName"),
            Phone = GetString(reader, "Phone"),
            AddressLine1 = GetString(reader, "AddressLine1"),
            AddressLine2 = GetNullableString(reader, "AddressLine2"),
            City = GetString(reader, "City"),
            State = GetString(reader, "State"),
            PostalCode = GetString(reader, "PostalCode"),
            Country = GetString(reader, "Country"),
            AddressType = GetString(reader, "AddressType"),
            IsDefault = reader.GetBoolean(reader.GetOrdinal("IsDefault"))
        };
    }

    private static int GetInt32(DbDataReader reader, string name) =>
        reader.GetInt32(reader.GetOrdinal(name));

    private static string GetString(DbDataReader reader, string name) =>
        reader.GetString(reader.GetOrdinal(name));

    private static string? GetNullableString(DbDataReader reader, string name)
    {
        var index = reader.GetOrdinal(name);
        return reader.IsDBNull(index) ? null : reader.GetString(index);
    }
}