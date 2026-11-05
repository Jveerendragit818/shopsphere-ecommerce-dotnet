using System.Data.Common;
using MySql.Data.MySqlClient;
using ShopSphere.Core.Entities;
using ShopSphere.Core.Interfaces;
using ShopSphere.Data.Database;

namespace ShopSphere.Data.Repositories;

public sealed class ReviewRepository : IReviewRepository
{
    private readonly MySqlConnectionFactory _connectionFactory;

    public ReviewRepository(MySqlConnectionFactory connectionFactory)
    {
        _connectionFactory = connectionFactory;
    }

    public async Task<IReadOnlyList<Review>> GetByProductIdAsync(int productId)
    {
        const string sql = """
            SELECT ReviewId, ProductId, CustomerId, Rating, ReviewTitle,
                   ReviewText, ReviewStatus, IsFeatured, CreatedAt
            FROM Reviews
            WHERE ProductId = @ProductId
            ORDER BY CreatedAt DESC;
            """;

        await using var connection =
            await _connectionFactory.CreateOpenConnectionAsync();
        await using var command = new MySqlCommand(sql, connection);
        command.Parameters.AddWithValue("@ProductId", productId);
        await using var reader = await command.ExecuteReaderAsync();

        var reviews = new List<Review>();
        while (await reader.ReadAsync())
            reviews.Add(ReadReview(reader));

        return reviews;
    }

    public async Task<IReadOnlyList<Review>> GetAllAsync()
    {
        const string sql = """
            SELECT ReviewId, ProductId, CustomerId, Rating, ReviewTitle,
                   ReviewText, ReviewStatus, IsFeatured, CreatedAt
            FROM Reviews
            ORDER BY CreatedAt DESC;
            """;

        await using var connection =
            await _connectionFactory.CreateOpenConnectionAsync();
        await using var command = new MySqlCommand(sql, connection);
        await using var reader = await command.ExecuteReaderAsync();

        var reviews = new List<Review>();
        while (await reader.ReadAsync())
            reviews.Add(ReadReview(reader));

        return reviews;
    }

    public async Task<int> AddAsync(Review review)
    {
        const string sql = """
            INSERT INTO Reviews
                (ProductId, CustomerId, Rating, ReviewTitle, ReviewText,
                 ReviewStatus, IsFeatured)
            VALUES
                (@ProductId, @CustomerId, @Rating, @ReviewTitle, @ReviewText,
                 @ReviewStatus, @IsFeatured);
            """;

        await using var connection =
            await _connectionFactory.CreateOpenConnectionAsync();
        await using var command = new MySqlCommand(sql, connection);
        command.Parameters.AddWithValue("@ProductId", review.ProductId);
        command.Parameters.AddWithValue("@CustomerId", review.CustomerId);
        command.Parameters.AddWithValue("@Rating", review.Rating);
        command.Parameters.AddWithValue(
            "@ReviewTitle", (object?)review.ReviewTitle ?? DBNull.Value);
        command.Parameters.AddWithValue(
            "@ReviewText", (object?)review.ReviewText ?? DBNull.Value);
        command.Parameters.AddWithValue("@ReviewStatus", review.ReviewStatus);
        command.Parameters.AddWithValue("@IsFeatured", review.IsFeatured);
        await command.ExecuteNonQueryAsync();

        return checked((int)command.LastInsertedId);
    }

    public async Task<bool> UpdateStatusAsync(
        int reviewId,
        string reviewStatus)
    {
        const string sql = """
            UPDATE Reviews
            SET ReviewStatus = @ReviewStatus
            WHERE ReviewId = @ReviewId;
            """;

        await using var connection =
            await _connectionFactory.CreateOpenConnectionAsync();
        await using var command = new MySqlCommand(sql, connection);
        command.Parameters.AddWithValue("@ReviewStatus", reviewStatus);
        command.Parameters.AddWithValue("@ReviewId", reviewId);

        return await command.ExecuteNonQueryAsync() > 0;
    }

    public async Task<bool> DeleteAsync(int reviewId)
    {
        const string sql = """
            DELETE FROM Reviews
            WHERE ReviewId = @ReviewId;
            """;

        await using var connection =
            await _connectionFactory.CreateOpenConnectionAsync();
        await using var command = new MySqlCommand(sql, connection);
        command.Parameters.AddWithValue("@ReviewId", reviewId);

        return await command.ExecuteNonQueryAsync() > 0;
    }

    private static Review ReadReview(DbDataReader reader)
    {
        return new Review
        {
            ReviewId = GetInt32(reader, "ReviewId"),
            ProductId = GetInt32(reader, "ProductId"),
            CustomerId = GetInt32(reader, "CustomerId"),
            Rating = reader.GetByte(reader.GetOrdinal("Rating")),
            ReviewTitle = GetNullableString(reader, "ReviewTitle"),
            ReviewText = GetNullableString(reader, "ReviewText"),
            ReviewStatus = GetString(reader, "ReviewStatus"),
            IsFeatured = reader.GetBoolean(reader.GetOrdinal("IsFeatured")),
            CreatedAt = reader.GetDateTime(reader.GetOrdinal("CreatedAt"))
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