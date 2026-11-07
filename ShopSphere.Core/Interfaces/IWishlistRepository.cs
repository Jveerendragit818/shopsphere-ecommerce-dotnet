using ShopSphere.Core.Entities;

namespace ShopSphere.Core.Interfaces;

public interface IWishlistRepository
{
    Task<Wishlist?> GetByCustomerIdAsync(int customerId);
    Task<IReadOnlyList<WishlistItem>> GetItemsAsync(int wishlistId);
    Task<int> AddItemAsync(WishlistItem item);
    Task<bool> RemoveItemAsync(int wishlistItemId);
    Task<Wishlist> GetOrCreateByCustomerIdAsync(int customerId);
}