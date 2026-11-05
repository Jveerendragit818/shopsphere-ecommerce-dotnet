namespace ShopSphere.Core.DTOs;

public class ReviewDto
{
    public int ReviewId { get; set; }
    public int ProductId { get; set; }
    public int CustomerId { get; set; }
    public string? CustomerName { get; set; }
    public byte Rating { get; set; }
    public string? ReviewTitle { get; set; }
    public string? ReviewText { get; set; }
    public string ReviewStatus { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
}