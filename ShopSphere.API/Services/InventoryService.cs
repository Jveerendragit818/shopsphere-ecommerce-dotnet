using ShopSphere.Core.Entities;
using ShopSphere.Core.Interfaces;

namespace ShopSphere.API.Services;

public sealed class InventoryService : IInventoryService
{
    private readonly IInventoryRepository _inventoryRepository;
    private readonly IAuditLogRepository _auditLogRepository;

    public InventoryService(
        IInventoryRepository inventoryRepository,
        IAuditLogRepository auditLogRepository)
    {
        _inventoryRepository = inventoryRepository;
        _auditLogRepository = auditLogRepository;
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

    public async Task<IReadOnlyList<AuditLog>> GetHistoryAsync(
        int productId,
        int count)
    {
        if (productId <= 0)
            throw new ArgumentOutOfRangeException(nameof(productId));
        if (count is < 1 or > 200)
            throw new ArgumentOutOfRangeException(nameof(count));

        return await _auditLogRepository.GetByEntityAsync(
            "Inventory", productId.ToString(), count);
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