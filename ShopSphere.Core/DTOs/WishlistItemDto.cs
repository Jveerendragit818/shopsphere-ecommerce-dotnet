namespace ShopSphere.Core.DTOs;

public class WishlistItemDto
{
    public int WishlistItemId { get; set; }
    public int ProductId { get; set; }
    public string ProductName { get; set; } = string.Empty;
    public string? ImagePath { get; set; }
    public decimal Price { get; set; }
    public decimal? DiscountPrice { get; set; }
    public bool IsAvailable { get; set; }
}