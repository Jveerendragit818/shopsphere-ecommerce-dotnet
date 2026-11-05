using ShopSphere.Core.DTOs;

namespace ShopSphere.Core.Interfaces;

public interface IProductService
{
    Task<IReadOnlyList<ProductDto>> GetAllAsync();
    Task<ProductDto?> GetByIdAsync(int productId);
    Task<int> AddAsync(ProductDto product);
    Task<bool> UpdateAsync(int productId, ProductDto product);
    Task<bool> DeleteAsync(int productId);
}