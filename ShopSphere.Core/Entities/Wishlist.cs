namespace ShopSphere.Core.Entities;

public class Wishlist
{
    public int WishlistId { get; set; }
    public int CustomerId { get; set; }
    public DateTime CreatedAt { get; set; }
}