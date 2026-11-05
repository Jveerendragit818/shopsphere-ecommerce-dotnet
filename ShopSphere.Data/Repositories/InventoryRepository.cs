using System.Data.Common;
using MySql.Data.MySqlClient;
using ShopSphere.Core.Entities;
using ShopSphere.Core.Interfaces;
using ShopSphere.Data.Database;

namespace ShopSphere.Data.Repositories;

public sealed class InventoryRepository : IInventoryRepository
{
    private readonly MySqlConnectionFactory _connectionFactory;

    public InventoryRepository(MySqlConnectionFactory connectionFactory)
    {
        _connectionFactory = connectionFactory;
    }

    public async Task<IReadOnlyList<Inventory>> GetAllAsync()
    {
        const string sql = """
            SELECT InventoryId, ProductId, StockQuantity,
                   LowStockThreshold, UpdatedAt
            FROM Inventory
            ORDER BY ProductId;
            """;

        await using var connection =
            await _connectionFactory.CreateOpenConnectionAsync();
        await using var command = new MySqlCommand(sql, connection);
        await using var reader = await command.ExecuteReaderAsync();

        var inventory = new List<Inventory>();
        while (await reader.ReadAsync())
            inventory.Add(ReadInventory(reader));

        return inventory;
    }

    public async Task<Inventory?> GetByProductIdAsync(int productId)
    {
        const string sql = """
            SELECT InventoryId, ProductId, StockQuantity,
                   LowStockThreshold, UpdatedAt
            FROM Inventory
            WHERE ProductId = @ProductId;
            """;

        await using var connection =
            await _connectionFactory.CreateOpenConnectionAsync();
        await using var command = new MySqlCommand(sql, connection);
        command.Parameters.AddWithValue("@ProductId", productId);

        await using var reader = await command.ExecuteReaderAsync();
        return await reader.ReadAsync() ? ReadInventory(reader) : null;
    }

    public async Task<bool> UpdateStockAsync(int productId, int stockQuantity)
    {
        if (stockQuantity < 0)
            throw new ArgumentOutOfRangeException(
                nameof(stockQuantity), "Stock quantity cannot be negative.");

        const string selectSql = """
            SELECT StockQuantity
            FROM Inventory
            WHERE ProductId = @ProductId
            FOR UPDATE;
            """;

        const string updateSql = """
            UPDATE Inventory
            SET StockQuantity = @StockQuantity
            WHERE ProductId = @ProductId;
            """;

        const string auditSql = """
            INSERT INTO AuditLogs
                (Action, EntityName, EntityId, Details)
            VALUES
                ('StockAdjusted', 'Inventory', @EntityId, @Details);
            """;

        await using var connection =
            await _connectionFactory.CreateOpenConnectionAsync();
        using var transaction = connection.BeginTransaction();

        try
        {
            await using var selectCommand =
                new MySqlCommand(selectSql, connection, transaction);
            selectCommand.Parameters.AddWithValue("@ProductId", productId);

            var currentValue = await selectCommand.ExecuteScalarAsync();
            if (currentValue is null || currentValue == DBNull.Value)
            {
                transaction.Rollback();
                return false;
            }

            var oldQuantity = Convert.ToInt32(currentValue);

            await using var updateCommand =
                new MySqlCommand(updateSql, connection, transaction);
            updateCommand.Parameters.AddWithValue("@ProductId", productId);
            updateCommand.Parameters.AddWithValue("@StockQuantity", stockQuantity);
            await updateCommand.ExecuteNonQueryAsync();

            await using var auditCommand =
                new MySqlCommand(auditSql, connection, transaction);
            auditCommand.Parameters.AddWithValue("@EntityId", productId.ToString());
            auditCommand.Parameters.AddWithValue(
                "@Details", $"Stock quantity changed from {oldQuantity} to {stockQuantity}.");
            await auditCommand.ExecuteNonQueryAsync();

            transaction.Commit();
            return true;
        }
        catch
        {
            transaction.Rollback();
            throw;
        }
    }

    private static Inventory ReadInventory(DbDataReader reader)
    {
        return new Inventory
        {
            InventoryId = reader.GetInt32(reader.GetOrdinal("InventoryId")),
            ProductId = reader.GetInt32(reader.GetOrdinal("ProductId")),
            StockQuantity = reader.GetInt32(reader.GetOrdinal("StockQuantity")),
            LowStockThreshold =
                reader.GetInt32(reader.GetOrdinal("LowStockThreshold")),
            UpdatedAt = reader.GetDateTime(reader.GetOrdinal("UpdatedAt"))
        };
    }
}