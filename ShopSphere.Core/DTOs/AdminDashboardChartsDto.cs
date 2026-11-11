namespace ShopSphere.Core.DTOs;

public sealed class AdminDashboardChartsDto
{
    public IReadOnlyList<MonthlySalesPointDto> MonthlySales { get; set; }
        = Array.Empty<MonthlySalesPointDto>();

    public IReadOnlyList<OrderStatusCountDto> OrderStatuses { get; set; }
        = Array.Empty<OrderStatusCountDto>();

    public IReadOnlyList<TopProductDto> TopProducts { get; set; }
        = Array.Empty<TopProductDto>();

    public IReadOnlyList<CategoryPerformanceDto> CategoryPerformance { get; set; }
        = Array.Empty<CategoryPerformanceDto>();

    public InventoryStatusDto InventoryStatus { get; set; } = new();
}

public sealed class MonthlySalesPointDto
{
    public string Month { get; set; } = string.Empty;
    public decimal Revenue { get; set; }
}

public sealed class OrderStatusCountDto
{
    public string OrderStatus { get; set; } = string.Empty;
    public int Count { get; set; }
}

public sealed class TopProductDto
{
    public int ProductId { get; set; }
    public string ProductName { get; set; } = string.Empty;
    public int UnitsSold { get; set; }
    public decimal Revenue { get; set; }
}

public sealed class CategoryPerformanceDto
{
    public int CategoryId { get; set; }
    public string CategoryName { get; set; } = string.Empty;
    public int UnitsSold { get; set; }
    public decimal Revenue { get; set; }
}

public sealed class InventoryStatusDto
{
    public int InStock { get; set; }
    public int LowStock { get; set; }
    public int OutOfStock { get; set; }
}