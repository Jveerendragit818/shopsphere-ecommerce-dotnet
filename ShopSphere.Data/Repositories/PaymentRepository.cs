using System.Data.Common;
using MySql.Data.MySqlClient;
using ShopSphere.Core.Entities;
using ShopSphere.Core.Interfaces;
using ShopSphere.Data.Database;

namespace ShopSphere.Data.Repositories;

public sealed class PaymentRepository : IPaymentRepository
{
    private readonly MySqlConnectionFactory _connectionFactory;

    public PaymentRepository(MySqlConnectionFactory connectionFactory)
    {
        _connectionFactory = connectionFactory;
    }

    public async Task<IReadOnlyList<Payment>> GetByOrderIdAsync(int orderId)
    {
        const string sql = """
            SELECT PaymentId, OrderId, PaymentMethod, TransactionReference,
                   Amount, PaymentStatus, PaymentDate, CreatedAt
            FROM Payments
            WHERE OrderId = @OrderId
            ORDER BY CreatedAt DESC;
            """;

        await using var connection =
            await _connectionFactory.CreateOpenConnectionAsync();
        await using var command = new MySqlCommand(sql, connection);
        command.Parameters.AddWithValue("@OrderId", orderId);
        await using var reader = await command.ExecuteReaderAsync();

        var payments = new List<Payment>();
        while (await reader.ReadAsync())
            payments.Add(ReadPayment(reader));

        return payments;
    }

    public async Task<int> AddAsync(Payment payment)
    {
        const string sql = """
            INSERT INTO Payments
                (OrderId, PaymentMethod, TransactionReference, Amount,
                 PaymentStatus, PaymentDate)
            VALUES
                (@OrderId, @PaymentMethod, @TransactionReference, @Amount,
                 @PaymentStatus, @PaymentDate);
            """;

        await using var connection =
            await _connectionFactory.CreateOpenConnectionAsync();
        await using var command = new MySqlCommand(sql, connection);
        command.Parameters.AddWithValue("@OrderId", payment.OrderId);
        command.Parameters.AddWithValue("@PaymentMethod", payment.PaymentMethod);
        command.Parameters.AddWithValue(
            "@TransactionReference",
            (object?)payment.TransactionReference ?? DBNull.Value);
        command.Parameters.AddWithValue("@Amount", payment.Amount);
        command.Parameters.AddWithValue("@PaymentStatus", payment.PaymentStatus);
        command.Parameters.AddWithValue(
            "@PaymentDate", (object?)payment.PaymentDate ?? DBNull.Value);
        await command.ExecuteNonQueryAsync();

        return checked((int)command.LastInsertedId);
    }

    public async Task<bool> UpdateStatusAsync(
        int paymentId,
        string paymentStatus)
    {
        const string sql = """
            UPDATE Payments
            SET PaymentStatus = @PaymentStatus
            WHERE PaymentId = @PaymentId;
            """;

        await using var connection =
            await _connectionFactory.CreateOpenConnectionAsync();
        await using var command = new MySqlCommand(sql, connection);
        command.Parameters.AddWithValue("@PaymentStatus", paymentStatus);
        command.Parameters.AddWithValue("@PaymentId", paymentId);

        return await command.ExecuteNonQueryAsync() > 0;
    }

    private static Payment ReadPayment(DbDataReader reader)
    {
        var paymentDateIndex = reader.GetOrdinal("PaymentDate");

        return new Payment
        {
            PaymentId = reader.GetInt32(reader.GetOrdinal("PaymentId")),
            OrderId = reader.GetInt32(reader.GetOrdinal("OrderId")),
            PaymentMethod = reader.GetString(reader.GetOrdinal("PaymentMethod")),
            TransactionReference = ReadNullableString(
                reader, "TransactionReference"),
            Amount = reader.GetDecimal(reader.GetOrdinal("Amount")),
            PaymentStatus = reader.GetString(reader.GetOrdinal("PaymentStatus")),
            PaymentDate = reader.IsDBNull(paymentDateIndex)
                ? null
                : reader.GetDateTime(paymentDateIndex),
            CreatedAt = reader.GetDateTime(reader.GetOrdinal("CreatedAt"))
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