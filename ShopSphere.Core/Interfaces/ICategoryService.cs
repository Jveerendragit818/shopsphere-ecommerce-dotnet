using ShopSphere.Core.DTOs;

namespace ShopSphere.Core.Interfaces;

public interface ICategoryService
{
    Task<IReadOnlyList<CategoryDto>> GetAllAsync();
    Task<CategoryDto?> GetByIdAsync(int categoryId);
    Task<int> AddAsync(CategoryDto category);
    Task<bool> UpdateAsync(int categoryId, CategoryDto category);
    Task<bool> DeleteAsync(int categoryId);
}