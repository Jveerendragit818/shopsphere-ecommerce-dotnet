using System.Data.Common;
using MySql.Data.MySqlClient;
using ShopSphere.Core.Entities;
using ShopSphere.Core.Interfaces;
using ShopSphere.Data.Database;

namespace ShopSphere.Data.Repositories;

public sealed class ProductImageRepository : IProductImageRepository
{
    private readonly MySqlConnectionFactory _connectionFactory;

    public ProductImageRepository(MySqlConnectionFactory connectionFactory)
    {
        _connectionFactory = connectionFactory;
    }

    public async Task<IReadOnlyList<ProductImage>> GetByProductIdAsync(
        int productId)
    {
        const string sql = """
            SELECT ImageId, ProductId, ImageUrl, IsPrimary, DisplayOrder
            FROM ProductImages
            WHERE ProductId = @ProductId
            ORDER BY IsPrimary DESC, DisplayOrder, ImageId;
            """;

        await using var connection =
            await _connectionFactory.CreateOpenConnectionAsync();
        await using var command = new MySqlCommand(sql, connection);
        command.Parameters.AddWithValue("@ProductId", productId);

        await using var reader = await command.ExecuteReaderAsync();
        var images = new List<ProductImage>();

        while (await reader.ReadAsync())
            images.Add(ReadProductImage(reader));

        return images;
    }

    public async Task<int> AddAsync(ProductImage image)
    {
        const string clearPrimarySql = """
            UPDATE ProductImages
            SET IsPrimary = FALSE
            WHERE ProductId = @ProductId;
            """;

        const string insertSql = """
            INSERT INTO ProductImages
                (ProductId, ImageUrl, IsPrimary, DisplayOrder)
            VALUES
                (@ProductId, @ImageUrl, @IsPrimary, @DisplayOrder);
            """;

        await using var connection =
            await _connectionFactory.CreateOpenConnectionAsync();
        using var transaction = connection.BeginTransaction();

        try
        {
            if (image.IsPrimary)
            {
                await using var clearCommand =
                    new MySqlCommand(clearPrimarySql, connection, transaction);
                clearCommand.Parameters.AddWithValue(
                    "@ProductId", image.ProductId);
                await clearCommand.ExecuteNonQueryAsync();
            }

            await using var insertCommand =
                new MySqlCommand(insertSql, connection, transaction);
            insertCommand.Parameters.AddWithValue("@ProductId", image.ProductId);
            insertCommand.Parameters.AddWithValue("@ImageUrl", image.ImageUrl);
            insertCommand.Parameters.AddWithValue("@IsPrimary", image.IsPrimary);
            insertCommand.Parameters.AddWithValue(
                "@DisplayOrder", image.DisplayOrder);

            await insertCommand.ExecuteNonQueryAsync();
            var imageId = checked((int)insertCommand.LastInsertedId);

            transaction.Commit();
            return imageId;
        }
        catch
        {
            transaction.Rollback();
            throw;
        }
    }

    public async Task<bool> SetPrimaryAsync(int productId, int imageId)
    {
        const string existsSql = """
            SELECT COUNT(*)
            FROM ProductImages
            WHERE ProductId = @ProductId AND ImageId = @ImageId;
            """;

        const string clearSql = """
            UPDATE ProductImages
            SET IsPrimary = FALSE
            WHERE ProductId = @ProductId;
            """;

        const string setPrimarySql = """
            UPDATE ProductImages
            SET IsPrimary = TRUE
            WHERE ProductId = @ProductId AND ImageId = @ImageId;
            """;

        await using var connection =
            await _connectionFactory.CreateOpenConnectionAsync();
        using var transaction = connection.BeginTransaction();

        try
        {
            await using var existsCommand =
                new MySqlCommand(existsSql, connection, transaction);
            existsCommand.Parameters.AddWithValue("@ProductId", productId);
            existsCommand.Parameters.AddWithValue("@ImageId", imageId);

            var exists = Convert.ToInt32(
                await existsCommand.ExecuteScalarAsync()) > 0;

            if (!exists)
            {
                transaction.Rollback();
                return false;
            }

            await using var clearCommand =
                new MySqlCommand(clearSql, connection, transaction);
            clearCommand.Parameters.AddWithValue("@ProductId", productId);
            await clearCommand.ExecuteNonQueryAsync();

            await using var setPrimaryCommand =
                new MySqlCommand(setPrimarySql, connection, transaction);
            setPrimaryCommand.Parameters.AddWithValue("@ProductId", productId);
            setPrimaryCommand.Parameters.AddWithValue("@ImageId", imageId);
            await setPrimaryCommand.ExecuteNonQueryAsync();

            transaction.Commit();
            return true;
        }
        catch
        {
            transaction.Rollback();
            throw;
        }
    }

    public async Task<bool> DeleteAsync(int imageId)
    {
        const string sql = """
            DELETE FROM ProductImages
            WHERE ImageId = @ImageId;
            """;

        await using var connection =
            await _connectionFactory.CreateOpenConnectionAsync();
        await using var command = new MySqlCommand(sql, connection);
        command.Parameters.AddWithValue("@ImageId", imageId);

        return await command.ExecuteNonQueryAsync() > 0;
    }

    private static ProductImage ReadProductImage(DbDataReader reader)
    {
        return new ProductImage
        {
            ImageId = reader.GetInt32(reader.GetOrdinal("ImageId")),
            ProductId = reader.GetInt32(reader.GetOrdinal("ProductId")),
            ImageUrl = reader.GetString(reader.GetOrdinal("ImageUrl")),
            IsPrimary = reader.GetBoolean(reader.GetOrdinal("IsPrimary")),
            DisplayOrder = reader.GetInt32(reader.GetOrdinal("DisplayOrder"))
        };
    }
}