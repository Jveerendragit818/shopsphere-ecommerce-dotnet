using ShopSphere.Core.Entities;

namespace ShopSphere.Core.Interfaces;

public interface IInventoryRepository
{
    Task<IReadOnlyList<Inventory>> GetAllAsync();
    Task<Inventory?> GetByProductIdAsync(int productId);
    Task<bool> UpdateStockAsync(int productId, int stockQuantity);
}