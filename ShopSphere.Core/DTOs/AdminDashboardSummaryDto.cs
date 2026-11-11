namespace ShopSphere.Core.DTOs;

public sealed class AdminDashboardSummaryDto
{
    public int TotalCustomers { get; set; }
    public int TotalProducts { get; set; }
    public int TotalOrders { get; set; }
    public decimal Revenue { get; set; }
    public int PendingOrders { get; set; }
    public int LowStockProducts { get; set; }
    public int TotalReviews { get; set; }
}