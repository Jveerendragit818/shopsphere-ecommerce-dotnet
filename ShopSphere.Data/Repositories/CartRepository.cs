using System.Data.Common;
using MySql.Data.MySqlClient;
using ShopSphere.Core.Entities;
using ShopSphere.Core.Interfaces;
using ShopSphere.Data.Database;

namespace ShopSphere.Data.Repositories;

public sealed class CartRepository : ICartRepository
{
    private readonly MySqlConnectionFactory _connectionFactory;

    public CartRepository(MySqlConnectionFactory connectionFactory)
    {
        _connectionFactory = connectionFactory;
    }

    public async Task<Cart?> GetByCustomerIdAsync(int customerId)
    {
        const string sql = """
            SELECT CartId, CustomerId, CreatedAt, UpdatedAt
            FROM Cart
            WHERE CustomerId = @CustomerId;
            """;

        await using var connection =
            await _connectionFactory.CreateOpenConnectionAsync();
        await using var command = new MySqlCommand(sql, connection);
        command.Parameters.AddWithValue("@CustomerId", customerId);

        await using var reader = await command.ExecuteReaderAsync();
        if (!await reader.ReadAsync())
            return null;

        var updatedAtIndex = reader.GetOrdinal("UpdatedAt");

        return new Cart
        {
            CartId = reader.GetInt32(reader.GetOrdinal("CartId")),
            CustomerId = reader.GetInt32(reader.GetOrdinal("CustomerId")),
            CreatedAt = reader.GetDateTime(reader.GetOrdinal("CreatedAt")),
            UpdatedAt = reader.IsDBNull(updatedAtIndex)
                ? null
                : reader.GetDateTime(updatedAtIndex)
        };
    }

    public async Task<Cart> GetOrCreateByCustomerIdAsync(int customerId)
    {
        const string sql = """
        INSERT INTO Cart (CustomerId, CreatedAt, UpdatedAt)
        VALUES (@CustomerId, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        ON DUPLICATE KEY UPDATE CartId = LAST_INSERT_ID(CartId);
        """;

        await using var connection =
            await _connectionFactory.CreateOpenConnectionAsync();
        await using var command = new MySqlCommand(sql, connection);
        command.Parameters.AddWithValue("@CustomerId", customerId);
        await command.ExecuteNonQueryAsync();

        return await GetByCustomerIdAsync(customerId)
            ?? throw new InvalidOperationException("Cart could not be created.");
    }

    public async Task<IReadOnlyList<CartItem>> GetItemsAsync(int cartId)
    {
        const string sql = """
            SELECT CartItemId, CartId, ProductId, Quantity, AddedAt
            FROM CartItems
            WHERE CartId = @CartId
            ORDER BY AddedAt DESC;
            """;

        await using var connection =
            await _connectionFactory.CreateOpenConnectionAsync();
        await using var command = new MySqlCommand(sql, connection);
        command.Parameters.AddWithValue("@CartId", cartId);

        await using var reader = await command.ExecuteReaderAsync();
        var items = new List<CartItem>();

        while (await reader.ReadAsync())
        {
            items.Add(new CartItem
            {
                CartItemId = reader.GetInt32(reader.GetOrdinal("CartItemId")),
                CartId = reader.GetInt32(reader.GetOrdinal("CartId")),
                ProductId = reader.GetInt32(reader.GetOrdinal("ProductId")),
                Quantity = reader.GetInt32(reader.GetOrdinal("Quantity")),
                AddedAt = reader.GetDateTime(reader.GetOrdinal("AddedAt"))
            });
        }

        return items;
    }

    public async Task<int> AddItemAsync(CartItem item)
    {
        const string sql = """
            INSERT INTO CartItems (CartId, ProductId, Quantity)
            VALUES (@CartId, @ProductId, @Quantity)
            ON DUPLICATE KEY UPDATE
                Quantity = Quantity + @Quantity,
                CartItemId = LAST_INSERT_ID(CartItemId);
            """;

        await using var connection =
            await _connectionFactory.CreateOpenConnectionAsync();
        await using var command = new MySqlCommand(sql, connection);
        command.Parameters.AddWithValue("@CartId", item.CartId);
        command.Parameters.AddWithValue("@ProductId", item.ProductId);
        command.Parameters.AddWithValue("@Quantity", item.Quantity);
        await command.ExecuteNonQueryAsync();

        return checked((int)command.LastInsertedId);
    }

    public async Task<bool> UpdateItemQuantityAsync(
        int cartItemId,
        int quantity)
    {
        if (quantity <= 0)
            throw new ArgumentOutOfRangeException(
                nameof(quantity), "Quantity must be greater than zero.");

        const string sql = """
            UPDATE CartItems
            SET Quantity = @Quantity
            WHERE CartItemId = @CartItemId;
            """;

        await using var connection =
            await _connectionFactory.CreateOpenConnectionAsync();
        await using var command = new MySqlCommand(sql, connection);
        command.Parameters.AddWithValue("@Quantity", quantity);
        command.Parameters.AddWithValue("@CartItemId", cartItemId);

        return await command.ExecuteNonQueryAsync() > 0;
    }

    public async Task<bool> RemoveItemAsync(int cartItemId)
    {
        const string sql = """
            DELETE FROM CartItems
            WHERE CartItemId = @CartItemId;
            """;

        await using var connection =
            await _connectionFactory.CreateOpenConnectionAsync();
        await using var command = new MySqlCommand(sql, connection);
        command.Parameters.AddWithValue("@CartItemId", cartItemId);

        return await command.ExecuteNonQueryAsync() > 0;
    }

    public async Task<bool> ClearAsync(int cartId)
    {
        const string sql = """
            DELETE FROM CartItems
            WHERE CartId = @CartId;
            """;

        await using var connection =
            await _connectionFactory.CreateOpenConnectionAsync();
        await using var command = new MySqlCommand(sql, connection);
        command.Parameters.AddWithValue("@CartId", cartId);

        return await command.ExecuteNonQueryAsync() >= 0;
    }
}