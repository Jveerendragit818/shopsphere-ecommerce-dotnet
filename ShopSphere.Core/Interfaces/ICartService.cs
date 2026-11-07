using ShopSphere.Core.Entities;

namespace ShopSphere.Core.Interfaces;

public interface ICartService
{
    Task<Cart> GetOrCreateAsync(int customerId);
    Task<IReadOnlyList<CartItem>> GetItemsAsync(int customerId);
    Task<int> AddItemAsync(int customerId, int productId, int quantity);
    Task<bool> UpdateItemQuantityAsync(
        int customerId,
        int cartItemId,
        int quantity);
    Task<bool> RemoveItemAsync(int customerId, int cartItemId);
    Task<bool> ClearAsync(int customerId);
}