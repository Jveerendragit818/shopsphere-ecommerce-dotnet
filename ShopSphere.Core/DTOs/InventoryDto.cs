namespace ShopSphere.Core.DTOs;

public class InventoryDto
{
    public int InventoryId { get; set; }
    public int ProductId { get; set; }
    public string? ProductName { get; set; }
    public int StockQuantity { get; set; }
    public int LowStockThreshold { get; set; }
    public DateTime UpdatedAt { get; set; }
    public bool IsLowStock => StockQuantity <= LowStockThreshold;
    public bool IsOutOfStock => StockQuantity == 0;
}