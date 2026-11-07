using MySql.Data.MySqlClient;
using ShopSphere.Core.Entities;
using ShopSphere.Core.Interfaces;
using ShopSphere.Data.Database;

namespace ShopSphere.Data.Repositories;

public sealed class WishlistRepository : IWishlistRepository
{
    private readonly MySqlConnectionFactory _connectionFactory;

    public WishlistRepository(MySqlConnectionFactory connectionFactory)
    {
        _connectionFactory = connectionFactory;
    }

    public async Task<Wishlist?> GetByCustomerIdAsync(int customerId)
    {
        const string sql = """
            SELECT WishlistId, CustomerId, CreatedAt
            FROM Wishlist
            WHERE CustomerId = @CustomerId;
            """;

        await using var connection =
            await _connectionFactory.CreateOpenConnectionAsync();
        await using var command = new MySqlCommand(sql, connection);
        command.Parameters.AddWithValue("@CustomerId", customerId);

        await using var reader = await command.ExecuteReaderAsync();
        if (!await reader.ReadAsync())
            return null;

        return new Wishlist
        {
            WishlistId = reader.GetInt32(reader.GetOrdinal("WishlistId")),
            CustomerId = reader.GetInt32(reader.GetOrdinal("CustomerId")),
            CreatedAt = reader.GetDateTime(reader.GetOrdinal("CreatedAt"))
        };
    }

    public async Task<Wishlist> GetOrCreateByCustomerIdAsync(int customerId)
    {
        const string sql = """
        INSERT INTO Wishlist (CustomerId, CreatedAt)
        VALUES (@CustomerId, CURRENT_TIMESTAMP)
        ON DUPLICATE KEY UPDATE WishlistId = LAST_INSERT_ID(WishlistId);
        """;

        await using var connection =
            await _connectionFactory.CreateOpenConnectionAsync();
        await using var command = new MySqlCommand(sql, connection);
        command.Parameters.AddWithValue("@CustomerId", customerId);
        await command.ExecuteNonQueryAsync();

        return await GetByCustomerIdAsync(customerId)
            ?? throw new InvalidOperationException("Wishlist could not be created.");
    }

    public async Task<IReadOnlyList<WishlistItem>> GetItemsAsync(int wishlistId)
    {
        const string sql = """
            SELECT WishlistItemId, WishlistId, ProductId, AddedAt
            FROM WishlistItems
            WHERE WishlistId = @WishlistId
            ORDER BY AddedAt DESC;
            """;

        await using var connection =
            await _connectionFactory.CreateOpenConnectionAsync();
        await using var command = new MySqlCommand(sql, connection);
        command.Parameters.AddWithValue("@WishlistId", wishlistId);

        await using var reader = await command.ExecuteReaderAsync();
        var items = new List<WishlistItem>();

        while (await reader.ReadAsync())
        {
            items.Add(new WishlistItem
            {
                WishlistItemId = reader.GetInt32(
                    reader.GetOrdinal("WishlistItemId")),
                WishlistId = reader.GetInt32(reader.GetOrdinal("WishlistId")),
                ProductId = reader.GetInt32(reader.GetOrdinal("ProductId")),
                AddedAt = reader.GetDateTime(reader.GetOrdinal("AddedAt"))
            });
        }

        return items;
    }

    public async Task<int> AddItemAsync(WishlistItem item)
    {
        const string sql = """
            INSERT INTO WishlistItems (WishlistId, ProductId)
            VALUES (@WishlistId, @ProductId)
            ON DUPLICATE KEY UPDATE
                WishlistItemId = LAST_INSERT_ID(WishlistItemId);
            """;

        await using var connection =
            await _connectionFactory.CreateOpenConnectionAsync();
        await using var command = new MySqlCommand(sql, connection);
        command.Parameters.AddWithValue("@WishlistId", item.WishlistId);
        command.Parameters.AddWithValue("@ProductId", item.ProductId);
        await command.ExecuteNonQueryAsync();

        return checked((int)command.LastInsertedId);
    }

    public async Task<bool> RemoveItemAsync(int wishlistItemId)
    {
        const string sql = """
            DELETE FROM WishlistItems
            WHERE WishlistItemId = @WishlistItemId;
            """;

        await using var connection =
            await _connectionFactory.CreateOpenConnectionAsync();
        await using var command = new MySqlCommand(sql, connection);
        command.Parameters.AddWithValue("@WishlistItemId", wishlistItemId);

        return await command.ExecuteNonQueryAsync() > 0;
    }
}