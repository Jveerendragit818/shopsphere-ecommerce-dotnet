namespace ShopSphere.Core.Entities;

public class Review
{
    public int ReviewId { get; set; }
    public int ProductId { get; set; }
    public int CustomerId { get; set; }
    public byte Rating { get; set; }
    public string? ReviewTitle { get; set; }
    public string? ReviewText { get; set; }
    public string ReviewStatus { get; set; } = "Pending";
    public bool IsFeatured { get; set; }
    public DateTime CreatedAt { get; set; }
}