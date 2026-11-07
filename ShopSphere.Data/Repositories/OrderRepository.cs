using System.Data.Common;
using MySql.Data.MySqlClient;
using ShopSphere.Core.Entities;
using ShopSphere.Core.Interfaces;
using ShopSphere.Data.Database;

namespace ShopSphere.Data.Repositories;

public sealed class OrderRepository : IOrderRepository
{
    private readonly MySqlConnectionFactory _connectionFactory;

    public OrderRepository(MySqlConnectionFactory connectionFactory)
    {
        _connectionFactory = connectionFactory;
    }

    public async Task<IReadOnlyList<Order>> GetAllAsync()
    {
        const string sql = """
            SELECT OrderId, OrderNumber, CustomerId, AddressId, OrderDate,
                   Subtotal, ShippingFee, TotalAmount, OrderStatus,
                   PaymentStatus, ShippingAddressSnapshot
            FROM Orders
            ORDER BY OrderDate DESC;
            """;

        await using var connection =
            await _connectionFactory.CreateOpenConnectionAsync();
        await using var command = new MySqlCommand(sql, connection);
        await using var reader = await command.ExecuteReaderAsync();

        var orders = new List<Order>();
        while (await reader.ReadAsync())
            orders.Add(ReadOrder(reader));

        return orders;
    }

    public async Task<Order?> GetByIdAsync(int orderId)
    {
        const string sql = """
            SELECT OrderId, OrderNumber, CustomerId, AddressId, OrderDate,
                   Subtotal, ShippingFee, TotalAmount, OrderStatus,
                   PaymentStatus, ShippingAddressSnapshot
            FROM Orders
            WHERE OrderId = @OrderId;
            """;

        await using var connection =
            await _connectionFactory.CreateOpenConnectionAsync();
        await using var command = new MySqlCommand(sql, connection);
        command.Parameters.AddWithValue("@OrderId", orderId);

        await using var reader = await command.ExecuteReaderAsync();
        return await reader.ReadAsync() ? ReadOrder(reader) : null;
    }

    public async Task<IReadOnlyList<Order>> GetByCustomerIdAsync(int customerId)
    {
        const string sql = """
            SELECT OrderId, OrderNumber, CustomerId, AddressId, OrderDate,
                   Subtotal, ShippingFee, TotalAmount, OrderStatus,
                   PaymentStatus, ShippingAddressSnapshot
            FROM Orders
            WHERE CustomerId = @CustomerId
            ORDER BY OrderDate DESC;
            """;

        await using var connection =
            await _connectionFactory.CreateOpenConnectionAsync();
        await using var command = new MySqlCommand(sql, connection);
        command.Parameters.AddWithValue("@CustomerId", customerId);
        await using var reader = await command.ExecuteReaderAsync();

        var orders = new List<Order>();
        while (await reader.ReadAsync())
            orders.Add(ReadOrder(reader));

        return orders;
    }

    public async Task<IReadOnlyList<OrderItem>> GetItemsByOrderIdAsync(
    int orderId)
    {
        const string sql = """
        SELECT OrderItemId, OrderId, ProductId, ProductName, SKU,
               Quantity, UnitPrice, LineTotal
        FROM OrderItems
        WHERE OrderId = @OrderId
        ORDER BY OrderItemId;
        """;

        await using var connection =
            await _connectionFactory.CreateOpenConnectionAsync();
        await using var command = new MySqlCommand(sql, connection);
        command.Parameters.AddWithValue("@OrderId", orderId);

        await using var reader = await command.ExecuteReaderAsync();
        var items = new List<OrderItem>();

        while (await reader.ReadAsync())
        {
            var productIdIndex = reader.GetOrdinal("ProductId");
            var skuIndex = reader.GetOrdinal("SKU");

            items.Add(new OrderItem
            {
                OrderItemId = reader.GetInt32(reader.GetOrdinal("OrderItemId")),
                OrderId = reader.GetInt32(reader.GetOrdinal("OrderId")),
                ProductId = reader.IsDBNull(productIdIndex)
                    ? null
                    : reader.GetInt32(productIdIndex),
                ProductName = reader.GetString(reader.GetOrdinal("ProductName")),
                SKU = reader.IsDBNull(skuIndex)
                    ? null
                    : reader.GetString(skuIndex),
                Quantity = reader.GetInt32(reader.GetOrdinal("Quantity")),
                UnitPrice = reader.GetDecimal(reader.GetOrdinal("UnitPrice")),
                LineTotal = reader.GetDecimal(reader.GetOrdinal("LineTotal"))
            });
        }

        return items;
    }

    public async Task<int> CreateAsync(
        Order order,
        IReadOnlyList<OrderItem> items,
        Payment payment,
        int cartId)
    {
        if (items.Count == 0)
            throw new ArgumentException("An order must contain at least one item.");
        if (cartId <= 0)
            throw new ArgumentOutOfRangeException(nameof(cartId));

        const string orderSql = """
            INSERT INTO Orders
                (OrderNumber, CustomerId, AddressId, Subtotal, ShippingFee,
                 TotalAmount, OrderStatus, PaymentStatus, ShippingAddressSnapshot)
            VALUES
                (@OrderNumber, @CustomerId, @AddressId, @Subtotal, @ShippingFee,
                 @TotalAmount, @OrderStatus, @PaymentStatus, @ShippingAddressSnapshot);
            """;

        const string itemSql = """
            INSERT INTO OrderItems
                (OrderId, ProductId, ProductName, SKU, Quantity, UnitPrice, LineTotal)
            VALUES
                (@OrderId, @ProductId, @ProductName, @SKU, @Quantity, @UnitPrice, @LineTotal);
            """;

        const string stockSql = """
            UPDATE Inventory
            SET StockQuantity = StockQuantity - @Quantity,
                UpdatedAt = CURRENT_TIMESTAMP
            WHERE ProductId = @ProductId
              AND StockQuantity >= @Quantity;
            """;

        const string paymentSql = """
            INSERT INTO Payments
                (OrderId, PaymentMethod, TransactionReference, Amount,
                 PaymentStatus, PaymentDate)
            VALUES
                (@OrderId, @PaymentMethod, @TransactionReference, @Amount,
                 @PaymentStatus, @PaymentDate);
            """;

        const string clearCartSql = """
            DELETE ci
            FROM CartItems ci
            INNER JOIN Cart c ON c.CartId = ci.CartId
            WHERE ci.CartId = @CartId
              AND c.CustomerId = @CustomerId;
            """;

        await using var connection =
            await _connectionFactory.CreateOpenConnectionAsync();
        using var transaction = connection.BeginTransaction();

        try
        {
            await using var orderCommand =
                new MySqlCommand(orderSql, connection, transaction);
            AddOrderParameters(orderCommand, order);
            await orderCommand.ExecuteNonQueryAsync();

            var orderId = checked((int)orderCommand.LastInsertedId);

            foreach (var item in items)
            {
                if (item.ProductId is not int productId || item.Quantity <= 0)
                    throw new InvalidOperationException(
                        "Order items must have a product and positive quantity.");

                await using var stockCommand =
                    new MySqlCommand(stockSql, connection, transaction);
                stockCommand.Parameters.AddWithValue("@ProductId", productId);
                stockCommand.Parameters.AddWithValue("@Quantity", item.Quantity);

                if (await stockCommand.ExecuteNonQueryAsync() != 1)
                    throw new InvalidOperationException(
                        $"Insufficient stock for product {productId}.");

                await using var itemCommand =
                    new MySqlCommand(itemSql, connection, transaction);
                itemCommand.Parameters.AddWithValue("@OrderId", orderId);
                itemCommand.Parameters.AddWithValue("@ProductId", productId);
                itemCommand.Parameters.AddWithValue("@ProductName", item.ProductName);
                itemCommand.Parameters.AddWithValue(
                    "@SKU", (object?)item.SKU ?? DBNull.Value);
                itemCommand.Parameters.AddWithValue("@Quantity", item.Quantity);
                itemCommand.Parameters.AddWithValue("@UnitPrice", item.UnitPrice);
                itemCommand.Parameters.AddWithValue("@LineTotal", item.LineTotal);

                await itemCommand.ExecuteNonQueryAsync();
            }

            await using var paymentCommand =
                new MySqlCommand(paymentSql, connection, transaction);
            paymentCommand.Parameters.AddWithValue("@OrderId", orderId);
            paymentCommand.Parameters.AddWithValue(
                "@PaymentMethod", payment.PaymentMethod);
            paymentCommand.Parameters.AddWithValue(
                "@TransactionReference",
                (object?)payment.TransactionReference ?? DBNull.Value);
            paymentCommand.Parameters.AddWithValue("@Amount", payment.Amount);
            paymentCommand.Parameters.AddWithValue(
                "@PaymentStatus", payment.PaymentStatus);
            paymentCommand.Parameters.AddWithValue(
                "@PaymentDate", (object?)payment.PaymentDate ?? DBNull.Value);

            await paymentCommand.ExecuteNonQueryAsync();

            await using var clearCartCommand =
                new MySqlCommand(clearCartSql, connection, transaction);
            clearCartCommand.Parameters.AddWithValue("@CartId", cartId);
            clearCartCommand.Parameters.AddWithValue(
                "@CustomerId", order.CustomerId);

            if (await clearCartCommand.ExecuteNonQueryAsync() != items.Count)
                throw new InvalidOperationException(
                    "The cart changed during checkout. Please try again.");

            transaction.Commit();
            return orderId;
        }
        catch
        {
            transaction.Rollback();
            throw;
        }
    }

    public async Task<bool> UpdateStatusAsync(int orderId, string orderStatus)
    {
        const string sql = """
            UPDATE Orders
            SET OrderStatus = @OrderStatus
            WHERE OrderId = @OrderId;
            """;

        await using var connection =
            await _connectionFactory.CreateOpenConnectionAsync();
        await using var command = new MySqlCommand(sql, connection);
        command.Parameters.AddWithValue("@OrderStatus", orderStatus);
        command.Parameters.AddWithValue("@OrderId", orderId);

        return await command.ExecuteNonQueryAsync() > 0;
    }

    private static void AddOrderParameters(
        MySqlCommand command,
        Order order)
    {
        command.Parameters.AddWithValue("@OrderNumber", order.OrderNumber);
        command.Parameters.AddWithValue("@CustomerId", order.CustomerId);
        command.Parameters.AddWithValue(
            "@AddressId", (object?)order.AddressId ?? DBNull.Value);
        command.Parameters.AddWithValue("@Subtotal", order.Subtotal);
        command.Parameters.AddWithValue("@ShippingFee", order.ShippingFee);
        command.Parameters.AddWithValue("@TotalAmount", order.TotalAmount);
        command.Parameters.AddWithValue("@OrderStatus", order.OrderStatus);
        command.Parameters.AddWithValue("@PaymentStatus", order.PaymentStatus);
        command.Parameters.AddWithValue(
            "@ShippingAddressSnapshot", order.ShippingAddressSnapshot);
    }

    private static Order ReadOrder(DbDataReader reader)
    {
        return new Order
        {
            OrderId = GetInt32(reader, "OrderId"),
            OrderNumber = GetString(reader, "OrderNumber"),
            CustomerId = GetInt32(reader, "CustomerId"),
            AddressId = GetNullableInt32(reader, "AddressId"),
            OrderDate = GetDateTime(reader, "OrderDate"),
            Subtotal = GetDecimal(reader, "Subtotal"),
            ShippingFee = GetDecimal(reader, "ShippingFee"),
            TotalAmount = GetDecimal(reader, "TotalAmount"),
            OrderStatus = GetString(reader, "OrderStatus"),
            PaymentStatus = GetString(reader, "PaymentStatus"),
            ShippingAddressSnapshot =
                GetString(reader, "ShippingAddressSnapshot")
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

    private static decimal GetDecimal(DbDataReader reader, string name) =>
        reader.GetDecimal(reader.GetOrdinal(name));

    private static DateTime GetDateTime(DbDataReader reader, string name) =>
        reader.GetDateTime(reader.GetOrdinal(name));
}