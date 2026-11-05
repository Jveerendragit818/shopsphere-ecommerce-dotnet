using System.Data.Common;
using MySql.Data.MySqlClient;
using ShopSphere.Core.Entities;
using ShopSphere.Core.Interfaces;
using ShopSphere.Data.Database;

namespace ShopSphere.Data.Repositories;

public sealed class CategoryRepository : ICategoryRepository
{
    private readonly MySqlConnectionFactory _connectionFactory;

    public CategoryRepository(MySqlConnectionFactory connectionFactory)
    {
        _connectionFactory = connectionFactory;
    }

    public async Task<IReadOnlyList<Category>> GetAllAsync()
    {
        const string sql = """
            SELECT CategoryId, CategoryName, Description, ImageUrl,
                   ParentCategoryId, IsActive, CreatedAt
            FROM Categories
            ORDER BY CategoryName;
            """;

        await using var connection =
            await _connectionFactory.CreateOpenConnectionAsync();
        await using var command = new MySqlCommand(sql, connection);
        await using var reader = await command.ExecuteReaderAsync();

        var categories = new List<Category>();
        while (await reader.ReadAsync())
            categories.Add(ReadCategory(reader));

        return categories;
    }

    public async Task<Category?> GetByIdAsync(int categoryId)
    {
        const string sql = """
            SELECT CategoryId, CategoryName, Description, ImageUrl,
                   ParentCategoryId, IsActive, CreatedAt
            FROM Categories
            WHERE CategoryId = @CategoryId;
            """;

        await using var connection =
            await _connectionFactory.CreateOpenConnectionAsync();
        await using var command = new MySqlCommand(sql, connection);
        command.Parameters.AddWithValue("@CategoryId", categoryId);

        await using var reader = await command.ExecuteReaderAsync();
        return await reader.ReadAsync() ? ReadCategory(reader) : null;
    }

    public async Task<int> AddAsync(Category category)
    {
        const string sql = """
            INSERT INTO Categories
                (CategoryName, Description, ImageUrl, ParentCategoryId, IsActive)
            VALUES
                (@CategoryName, @Description, @ImageUrl, @ParentCategoryId, @IsActive);
            """;

        await using var connection =
            await _connectionFactory.CreateOpenConnectionAsync();
        await using var command = new MySqlCommand(sql, connection);
        AddCategoryParameters(command, category);
        await command.ExecuteNonQueryAsync();

        return checked((int)command.LastInsertedId);
    }

    public async Task<bool> UpdateAsync(Category category)
    {
        const string sql = """
            UPDATE Categories
            SET CategoryName = @CategoryName,
                Description = @Description,
                ImageUrl = @ImageUrl,
                ParentCategoryId = @ParentCategoryId,
                IsActive = @IsActive
            WHERE CategoryId = @CategoryId;
            """;

        await using var connection =
            await _connectionFactory.CreateOpenConnectionAsync();
        await using var command = new MySqlCommand(sql, connection);
        AddCategoryParameters(command, category);
        command.Parameters.AddWithValue("@CategoryId", category.CategoryId);

        return await command.ExecuteNonQueryAsync() > 0;
    }

    public async Task<bool> DeleteAsync(int categoryId)
    {
        const string sql = """
            UPDATE Categories
            SET IsActive = FALSE
            WHERE CategoryId = @CategoryId;
            """;

        await using var connection =
            await _connectionFactory.CreateOpenConnectionAsync();
        await using var command = new MySqlCommand(sql, connection);
        command.Parameters.AddWithValue("@CategoryId", categoryId);

        return await command.ExecuteNonQueryAsync() > 0;
    }

    private static void AddCategoryParameters(
        MySqlCommand command,
        Category category)
    {
        command.Parameters.AddWithValue("@CategoryName", category.CategoryName);
        command.Parameters.AddWithValue(
            "@Description", (object?)category.Description ?? DBNull.Value);
        command.Parameters.AddWithValue(
            "@ImageUrl", (object?)category.ImageUrl ?? DBNull.Value);
        command.Parameters.AddWithValue(
            "@ParentCategoryId", (object?)category.ParentCategoryId ?? DBNull.Value);
        command.Parameters.AddWithValue("@IsActive", category.IsActive);
    }

    private static Category ReadCategory(DbDataReader reader)
    {
        return new Category
        {
            CategoryId = GetInt32(reader, "CategoryId"),
            CategoryName = GetString(reader, "CategoryName"),
            Description = GetNullableString(reader, "Description"),
            ImageUrl = GetNullableString(reader, "ImageUrl"),
            ParentCategoryId = GetNullableInt32(reader, "ParentCategoryId"),
            IsActive = GetBoolean(reader, "IsActive"),
            CreatedAt = GetDateTime(reader, "CreatedAt")
        };
    }

    private static int GetInt32(DbDataReader reader, string name) =>
        reader.GetInt32(reader.GetOrdinal(name));

    private static int? GetNullableInt32(DbDataReader reader, string name)
    {
        var index = reader.GetOrdinal(name);
        return reader.IsDBNull(index) ? null : reader.GetInt32(index);
    }

    private static string GetString(DbDataReader reader, string name) =>
        reader.GetString(reader.GetOrdinal(name));

    private static string? GetNullableString(DbDataReader reader, string name)
    {
        var index = reader.GetOrdinal(name);
        return reader.IsDBNull(index) ? null : reader.GetString(index);
    }

    private static bool GetBoolean(DbDataReader reader, string name) =>
        reader.GetBoolean(reader.GetOrdinal(name));

    private static DateTime GetDateTime(DbDataReader reader, string name) =>
        reader.GetDateTime(reader.GetOrdinal(name));
}