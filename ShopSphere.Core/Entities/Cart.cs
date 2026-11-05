namespace ShopSphere.Core.Entities;

public class Cart
{
    public int CartId { get; set; }
    public int CustomerId { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
}