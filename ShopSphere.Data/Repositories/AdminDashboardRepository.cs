using MySql.Data.MySqlClient;
using ShopSphere.Core.DTOs;
using ShopSphere.Core.Interfaces;
using ShopSphere.Data.Database;

namespace ShopSphere.Data.Repositories;

public sealed class AdminDashboardRepository : IAdminDashboardRepository
{
    private readonly MySqlConnectionFactory _connectionFactory;

    public AdminDashboardRepository(MySqlConnectionFactory connectionFactory)
    {
        _connectionFactory = connectionFactory;
    }

    public async Task<AdminDashboardSummaryDto> GetSummaryAsync()
    {
        const string sql = """
            SELECT
                (SELECT COUNT(*) FROM Customers) AS TotalCustomers,
                (SELECT COUNT(*) FROM Products) AS TotalProducts,
                (SELECT COUNT(*) FROM Orders) AS TotalOrders,
                (SELECT COALESCE(SUM(TotalAmount), 0)
                 FROM Orders WHERE PaymentStatus = 'Paid') AS Revenue,
                (SELECT COUNT(*) FROM Orders
                 WHERE OrderStatus = 'Confirmed') AS PendingOrders,
                (SELECT COUNT(*) FROM Inventory
                 WHERE StockQuantity <= LowStockThreshold) AS LowStockProducts,
                (SELECT COUNT(*) FROM Reviews) AS TotalReviews;
            """;

        await using var connection =
            await _connectionFactory.CreateOpenConnectionAsync();
        await using var command = new MySqlCommand(sql, connection);
        await using var reader = await command.ExecuteReaderAsync();

        if (!await reader.ReadAsync())
            throw new InvalidOperationException(
                "Dashboard summary could not be loaded.");

        return new AdminDashboardSummaryDto
        {
            TotalCustomers = reader.GetInt32(
                reader.GetOrdinal("TotalCustomers")),
            TotalProducts = reader.GetInt32(
                reader.GetOrdinal("TotalProducts")),
            TotalOrders = reader.GetInt32(
                reader.GetOrdinal("TotalOrders")),
            Revenue = reader.GetDecimal(reader.GetOrdinal("Revenue")),
            PendingOrders = reader.GetInt32(
                reader.GetOrdinal("PendingOrders")),
            LowStockProducts = reader.GetInt32(
                reader.GetOrdinal("LowStockProducts")),
            TotalReviews = reader.GetInt32(
                reader.GetOrdinal("TotalReviews"))
        };
    }

    public async Task<AdminDashboardChartsDto> GetChartsAsync(
        DateTime? fromDate,
        DateTime? toDate,
        int? categoryId)
    {
        if (fromDate.HasValue && toDate.HasValue && fromDate > toDate)
            throw new ArgumentException(
                "From date must be before or equal to date.");

        if (categoryId.HasValue && categoryId.Value <= 0)
            throw new ArgumentOutOfRangeException(nameof(categoryId));

        var result = new AdminDashboardChartsDto();

        await using var connection =
            await _connectionFactory.CreateOpenConnectionAsync();

        const string salesSql = """
            SELECT DATE_FORMAT(o.OrderDate, '%Y-%m') AS Month,
                   COALESCE(SUM(o.TotalAmount), 0) AS Revenue
            FROM Orders o
            WHERE o.PaymentStatus = 'Paid'
              AND (@FromDate IS NULL OR o.OrderDate >= @FromDate)
              AND (@ToDate IS NULL
                   OR o.OrderDate < DATE_ADD(@ToDate, INTERVAL 1 DAY))
              AND (@CategoryId IS NULL OR EXISTS (
                  SELECT 1
                  FROM OrderItems oi
                  JOIN Products p ON p.ProductId = oi.ProductId
                  WHERE oi.OrderId = o.OrderId
                    AND p.CategoryId = @CategoryId
              ))
            GROUP BY DATE_FORMAT(o.OrderDate, '%Y-%m')
            ORDER BY Month;
            """;

        await using (var command = CreateFilterCommand(
            salesSql, connection, fromDate, toDate, categoryId))
        await using (var reader = await command.ExecuteReaderAsync())
        {
            var monthlySales = new List<MonthlySalesPointDto>();

            while (await reader.ReadAsync())
            {
                monthlySales.Add(new MonthlySalesPointDto
                {
                    Month = reader.GetString(reader.GetOrdinal("Month")),
                    Revenue = reader.GetDecimal(reader.GetOrdinal("Revenue"))
                });
            }

            result.MonthlySales = monthlySales;
        }

        const string statusSql = """
            SELECT o.OrderStatus, COUNT(DISTINCT o.OrderId) AS Count
            FROM Orders o
            WHERE (@FromDate IS NULL OR o.OrderDate >= @FromDate)
              AND (@ToDate IS NULL
                   OR o.OrderDate < DATE_ADD(@ToDate, INTERVAL 1 DAY))
              AND (@CategoryId IS NULL OR EXISTS (
                  SELECT 1
                  FROM OrderItems oi
                  JOIN Products p ON p.ProductId = oi.ProductId
                  WHERE oi.OrderId = o.OrderId
                    AND p.CategoryId = @CategoryId
              ))
            GROUP BY o.OrderStatus
            ORDER BY o.OrderStatus;
            """;

        await using (var command = CreateFilterCommand(
            statusSql, connection, fromDate, toDate, categoryId))
        await using (var reader = await command.ExecuteReaderAsync())
        {
            var statuses = new List<OrderStatusCountDto>();

            while (await reader.ReadAsync())
            {
                statuses.Add(new OrderStatusCountDto
                {
                    OrderStatus = reader.GetString(
                        reader.GetOrdinal("OrderStatus")),
                    Count = reader.GetInt32(reader.GetOrdinal("Count"))
                });
            }

            result.OrderStatuses = statuses;
        }

        const string topProductsSql = """
            SELECT p.ProductId, p.ProductName,
                   SUM(oi.Quantity) AS UnitsSold,
                   SUM(oi.LineTotal) AS Revenue
            FROM Orders o
            JOIN OrderItems oi ON oi.OrderId = o.OrderId
            JOIN Products p ON p.ProductId = oi.ProductId
            WHERE o.PaymentStatus = 'Paid'
              AND (@FromDate IS NULL OR o.OrderDate >= @FromDate)
              AND (@ToDate IS NULL
                   OR o.OrderDate < DATE_ADD(@ToDate, INTERVAL 1 DAY))
              AND (@CategoryId IS NULL OR p.CategoryId = @CategoryId)
            GROUP BY p.ProductId, p.ProductName
            ORDER BY UnitsSold DESC
            LIMIT 10;
            """;

        await using (var command = CreateFilterCommand(
            topProductsSql, connection, fromDate, toDate, categoryId))
        await using (var reader = await command.ExecuteReaderAsync())
        {
            var products = new List<TopProductDto>();

            while (await reader.ReadAsync())
            {
                products.Add(new TopProductDto
                {
                    ProductId = reader.GetInt32(
                        reader.GetOrdinal("ProductId")),
                    ProductName = reader.GetString(
                        reader.GetOrdinal("ProductName")),
                    UnitsSold = Convert.ToInt32(
                        reader.GetValue(reader.GetOrdinal("UnitsSold"))),
                    Revenue = reader.GetDecimal(reader.GetOrdinal("Revenue"))
                });
            }

            result.TopProducts = products;
        }

        const string categorySql = """
            SELECT c.CategoryId, c.CategoryName,
                   SUM(oi.Quantity) AS UnitsSold,
                   SUM(oi.LineTotal) AS Revenue
            FROM Orders o
            JOIN OrderItems oi ON oi.OrderId = o.OrderId
            JOIN Products p ON p.ProductId = oi.ProductId
            JOIN Categories c ON c.CategoryId = p.CategoryId
            WHERE o.PaymentStatus = 'Paid'
              AND (@FromDate IS NULL OR o.OrderDate >= @FromDate)
              AND (@ToDate IS NULL
                   OR o.OrderDate < DATE_ADD(@ToDate, INTERVAL 1 DAY))
              AND (@CategoryId IS NULL OR c.CategoryId = @CategoryId)
            GROUP BY c.CategoryId, c.CategoryName
            ORDER BY Revenue DESC;
            """;

        await using (var command = CreateFilterCommand(
            categorySql, connection, fromDate, toDate, categoryId))
        await using (var reader = await command.ExecuteReaderAsync())
        {
            var categories = new List<CategoryPerformanceDto>();

            while (await reader.ReadAsync())
            {
                categories.Add(new CategoryPerformanceDto
                {
                    CategoryId = reader.GetInt32(
                        reader.GetOrdinal("CategoryId")),
                    CategoryName = reader.GetString(
                        reader.GetOrdinal("CategoryName")),
                    UnitsSold = Convert.ToInt32(
                        reader.GetValue(reader.GetOrdinal("UnitsSold"))),
                    Revenue = reader.GetDecimal(reader.GetOrdinal("Revenue"))
                });
            }

            result.CategoryPerformance = categories;
        }

        const string inventorySql = """
            SELECT
                COALESCE(SUM(CASE
                    WHEN i.StockQuantity > i.LowStockThreshold
                    THEN 1 ELSE 0 END), 0) AS InStock,
                COALESCE(SUM(CASE
                    WHEN i.StockQuantity > 0
                     AND i.StockQuantity <= i.LowStockThreshold
                    THEN 1 ELSE 0 END), 0) AS LowStock,
                COALESCE(SUM(CASE
                    WHEN i.StockQuantity = 0
                    THEN 1 ELSE 0 END), 0) AS OutOfStock
            FROM Inventory i
            JOIN Products p ON p.ProductId = i.ProductId
            WHERE @CategoryId IS NULL
               OR p.CategoryId = @CategoryId;
            """;

        await using (var command = new MySqlCommand(inventorySql, connection))
        {
            command.Parameters.AddWithValue(
                "@CategoryId", (object?)categoryId ?? DBNull.Value);

            await using var reader = await command.ExecuteReaderAsync();

            if (await reader.ReadAsync())
            {
                result.InventoryStatus = new InventoryStatusDto
                {
                    InStock = Convert.ToInt32(reader["InStock"]),
                    LowStock = Convert.ToInt32(reader["LowStock"]),
                    OutOfStock = Convert.ToInt32(reader["OutOfStock"])
                };
            }
        }

        return result;
    }

    private static MySqlCommand CreateFilterCommand(
        string sql,
        MySqlConnection connection,
        DateTime? fromDate,
        DateTime? toDate,
        int? categoryId)
    {
        var command = new MySqlCommand(sql, connection);

        command.Parameters.AddWithValue(
            "@FromDate", (object?)fromDate ?? DBNull.Value);
        command.Parameters.AddWithValue(
            "@ToDate", (object?)toDate ?? DBNull.Value);
        command.Parameters.AddWithValue(
            "@CategoryId", (object?)categoryId ?? DBNull.Value);

        return command;
    }
}