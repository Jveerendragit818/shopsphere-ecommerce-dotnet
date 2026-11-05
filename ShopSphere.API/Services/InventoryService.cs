using ShopSphere.Core.Entities;
using ShopSphere.Core.Interfaces;

namespace ShopSphere.API.Services;

public sealed class InventoryService : IInventoryService
{
    private readonly IInventoryRepository _inventoryRepository;

    public InventoryService(IInventoryRepository inventoryRepository)
    {
        _inventoryRepository = inventoryRepository;
    }

    public Task<IReadOnlyList<Inventory>> GetAllAsync()
    {
        return _inventoryRepository.GetAllAsync();
    }

    public Task<Inventory?> GetByProductIdAsync(int productId)
    {
        if (productId <= 0)
            throw new ArgumentOutOfRangeException(nameof(productId));

        return _inventoryRepository.GetByProductIdAsync(productId);
    }

    public Task<bool> UpdateStockAsync(int productId, int stockQuantity)
    {
        if (productId <= 0)
            throw new ArgumentOutOfRangeException(nameof(productId));

        if (stockQuantity < 0)
            throw new ArgumentOutOfRangeException(nameof(stockQuantity));

        return _inventoryRepository.UpdateStockAsync(productId, stockQuantity);
    }
}