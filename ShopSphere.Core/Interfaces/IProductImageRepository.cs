using ShopSphere.Core.Entities;

namespace ShopSphere.Core.Interfaces;

public interface IProductImageRepository
{
    Task<IReadOnlyList<ProductImage>> GetByProductIdAsync(int productId);
    Task<int> AddAsync(ProductImage image);
    Task<bool> SetPrimaryAsync(int productId, int imageId);
    Task<bool> DeleteAsync(int imageId);
}