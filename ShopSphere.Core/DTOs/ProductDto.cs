namespace ShopSphere.Core.DTOs;

public class ProductDto
{
    public int ProductId { get; set; }
    public int CategoryId { get; set; }
    public string ProductName { get; set; } = string.Empty;
    public string? CategoryName { get; set; }
    public string? Brand { get; set; }
    public string SKU { get; set; } = string.Empty;
    public string? Description { get; set; }
    public decimal Price { get; set; }
    public decimal? DiscountPrice { get; set; }
    public decimal AverageRating { get; set; }
    public int ReviewCount { get; set; }
    public int StockQuantity { get; set; }
    public string? ImagePath { get; set; }
    public bool IsFeatured { get; set; }
    public bool IsActive { get; set; }
}