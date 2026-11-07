using ShopSphere.Core.Entities;

namespace ShopSphere.Core.Interfaces;

public interface IWishlistService
{
    Task<Wishlist> GetOrCreateAsync(int customerId);
    Task<IReadOnlyList<WishlistItem>> GetItemsAsync(int customerId);
    Task<int> AddItemAsync(int customerId, int productId);
    Task<bool> RemoveItemAsync(int customerId, int wishlistItemId);
}