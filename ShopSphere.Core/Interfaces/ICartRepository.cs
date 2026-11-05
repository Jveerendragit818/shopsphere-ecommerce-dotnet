using ShopSphere.Core.Entities;

namespace ShopSphere.Core.Interfaces;

public interface ICartRepository
{
    Task<Cart?> GetByCustomerIdAsync(int customerId);
    Task<IReadOnlyList<CartItem>> GetItemsAsync(int cartId);
    Task<int> AddItemAsync(CartItem item);
    Task<bool> UpdateItemQuantityAsync(int cartItemId, int quantity);
    Task<bool> RemoveItemAsync(int cartItemId);
    Task<bool> ClearAsync(int cartId);
}