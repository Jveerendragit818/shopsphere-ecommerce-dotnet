namespace ShopSphere.Core.Entities;

public class WishlistItem
{
    public int WishlistItemId { get; set; }
    public int WishlistId { get; set; }
    public int ProductId { get; set; }
    public DateTime AddedAt { get; set; }
}