using System.Data.Common;
using MySql.Data.MySqlClient;
using ShopSphere.Core.Entities;
using ShopSphere.Core.Interfaces;
using ShopSphere.Data.Database;

namespace ShopSphere.Data.Repositories;

public sealed class ProductRepository : IProductRepository
{
    private readonly MySqlConnectionFactory _connectionFactory;

    public ProductRepository(MySqlConnectionFactory connectionFactory)
    {
        _connectionFactory = connectionFactory;
    }

    public async Task<IReadOnlyList<Product>> GetAllAsync()
    {
        const string sql = """
            SELECT ProductId, CategoryId, ProductName, Description, Brand,
                   SKU, Price, DiscountPrice, IsFeatured, IsActive,
                   CreatedAt, UpdatedAt
            FROM Products
            ORDER BY ProductId;
            """;

        await using var connection =
            await _connectionFactory.CreateOpenConnectionAsync();
        await using var command = new MySqlCommand(sql, connection);
        await using var reader = await command.ExecuteReaderAsync();

        var products = new List<Product>();
        while (await reader.ReadAsync())
            products.Add(ReadProduct(reader));

        return products;
    }

    public async Task<Product?> GetByIdAsync(int productId)
    {
        const string sql = """
            SELECT ProductId, CategoryId, ProductName, Description, Brand,
                   SKU, Price, DiscountPrice, IsFeatured, IsActive,
                   CreatedAt, UpdatedAt
            FROM Products
            WHERE ProductId = @ProductId;
            """;

        await using var connection =
            await _connectionFactory.CreateOpenConnectionAsync();
        await using var command = new MySqlCommand(sql, connection);
        command.Parameters.AddWithValue("@ProductId", productId);

        await using var reader = await command.ExecuteReaderAsync();
        return await reader.ReadAsync() ? ReadProduct(reader) : null;
    }

    public async Task<int> AddAsync(Product product)
    {
        const string productSql = """
            INSERT INTO Products
                (CategoryId, ProductName, Description, Brand, SKU, Price,
                 DiscountPrice, IsFeatured, IsActive)
            VALUES
                (@CategoryId, @ProductName, @Description, @Brand, @SKU, @Price,
                 @DiscountPrice, @IsFeatured, @IsActive);
            """;

        const string inventorySql = """
            INSERT INTO Inventory (ProductId)
            VALUES (@ProductId);
            """;

        await using var connection =
            await _connectionFactory.CreateOpenConnectionAsync();
        using var transaction = connection.BeginTransaction();

        try
        {
            await using var productCommand =
                new MySqlCommand(productSql, connection, transaction);
            AddProductParameters(productCommand, product);
            await productCommand.ExecuteNonQueryAsync();

            var productId = checked((int)productCommand.LastInsertedId);

            await using var inventoryCommand =
                new MySqlCommand(inventorySql, connection, transaction);
            inventoryCommand.Parameters.AddWithValue("@ProductId", productId);
            await inventoryCommand.ExecuteNonQueryAsync();

            transaction.Commit();
            return productId;
        }
        catch
        {
            transaction.Rollback();
            throw;
        }
    }

    public async Task<bool> UpdateAsync(Product product)
    {
        const string sql = """
            UPDATE Products
            SET CategoryId = @CategoryId,
                ProductName = @ProductName,
                Description = @Description,
                Brand = @Brand,
                SKU = @SKU,
                Price = @Price,
                DiscountPrice = @DiscountPrice,
                IsFeatured = @IsFeatured,
                IsActive = @IsActive,
                UpdatedAt = CURRENT_TIMESTAMP
            WHERE ProductId = @ProductId;
            """;

        await using var connection =
            await _connectionFactory.CreateOpenConnectionAsync();
        await using var command = new MySqlCommand(sql, connection);
        AddProductParameters(command, product);
        command.Parameters.AddWithValue("@ProductId", product.ProductId);

        return await command.ExecuteNonQueryAsync() > 0;
    }

    public async Task<bool> DeleteAsync(int productId)
    {
        const string sql = """
            UPDATE Products
            SET IsActive = FALSE,
                UpdatedAt = CURRENT_TIMESTAMP
            WHERE ProductId = @ProductId;
            """;

        await using var connection =
            await _connectionFactory.CreateOpenConnectionAsync();
        await using var command = new MySqlCommand(sql, connection);
        command.Parameters.AddWithValue("@ProductId", productId);

        return await command.ExecuteNonQueryAsync() > 0;
    }

    private static void AddProductParameters(
        MySqlCommand command,
        Product product)
    {
        command.Parameters.AddWithValue("@CategoryId", product.CategoryId);
        command.Parameters.AddWithValue("@ProductName", product.ProductName);
        command.Parameters.AddWithValue(
            "@Description", (object?)product.Description ?? DBNull.Value);
        command.Parameters.AddWithValue(
            "@Brand", (object?)product.Brand ?? DBNull.Value);
        command.Parameters.AddWithValue("@SKU", product.SKU);
        command.Parameters.AddWithValue("@Price", product.Price);
        command.Parameters.AddWithValue(
            "@DiscountPrice", (object?)product.DiscountPrice ?? DBNull.Value);
        command.Parameters.AddWithValue("@IsFeatured", product.IsFeatured);
        command.Parameters.AddWithValue("@IsActive", product.IsActive);
    }

    private static Product ReadProduct(DbDataReader reader)
    {
        return new Product
        {
            ProductId = GetInt32(reader, "ProductId"),
            CategoryId = GetInt32(reader, "CategoryId"),
            ProductName = GetString(reader, "ProductName"),
            Description = GetNullableString(reader, "Description"),
            Brand = GetNullableString(reader, "Brand"),
            SKU = GetString(reader, "SKU"),
            Price = GetDecimal(reader, "Price"),
            DiscountPrice = GetNullableDecimal(reader, "DiscountPrice"),
            IsFeatured = GetBoolean(reader, "IsFeatured"),
            IsActive = GetBoolean(reader, "IsActive"),
            CreatedAt = GetDateTime(reader, "CreatedAt"),
            UpdatedAt = GetNullableDateTime(reader, "UpdatedAt")
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

    private static decimal GetDecimal(DbDataReader reader, string name) =>
        reader.GetDecimal(reader.GetOrdinal(name));

    private static decimal? GetNullableDecimal(DbDataReader reader, string name)
    {
        var index = reader.GetOrdinal(name);
        return reader.IsDBNull(index) ? null : reader.GetDecimal(index);
    }

    private static bool GetBoolean(DbDataReader reader, string name) =>
        reader.GetBoolean(reader.GetOrdinal(name));

    private static DateTime GetDateTime(DbDataReader reader, string name) =>
        reader.GetDateTime(reader.GetOrdinal(name));

    private static DateTime? GetNullableDateTime(DbDataReader reader, string name)
    {
        var index = reader.GetOrdinal(name);
        return reader.IsDBNull(index) ? null : reader.GetDateTime(index);
    }
}