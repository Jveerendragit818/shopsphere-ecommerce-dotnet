using ShopSphere.Core.DTOs;
using ShopSphere.Core.Entities;
using ShopSphere.Core.Interfaces;

namespace ShopSphere.API.Services;

public sealed class CategoryService : ICategoryService
{
    private readonly ICategoryRepository _categoryRepository;

    public CategoryService(ICategoryRepository categoryRepository)
    {
        _categoryRepository = categoryRepository;
    }

    public async Task<IReadOnlyList<CategoryDto>> GetAllAsync()
    {
        var categories = await _categoryRepository.GetAllAsync();

        return categories
            .Where(category => category.IsActive)
            .Select(ToDto)
            .ToList();
    }

    public async Task<CategoryDto?> GetByIdAsync(int categoryId)
    {
        var category = await _categoryRepository.GetByIdAsync(categoryId);

        return category is null || !category.IsActive
            ? null
            : ToDto(category);
    }

    public async Task<int> AddAsync(CategoryDto category)
    {
        ValidateName(category.CategoryName);
        await ValidateParentAsync(category.ParentCategoryId);

        return await _categoryRepository.AddAsync(new Category
        {
            CategoryName = category.CategoryName.Trim(),
            Description = category.Description,
            ImageUrl = category.ImageUrl,
            ParentCategoryId = category.ParentCategoryId,
            IsActive = true
        });
    }

    public async Task<bool> UpdateAsync(int categoryId, CategoryDto category)
    {
        ValidateName(category.CategoryName);

        if (category.ParentCategoryId == categoryId)
            throw new ArgumentException("A category cannot be its own parent.");

        await ValidateParentAsync(category.ParentCategoryId);

        return await _categoryRepository.UpdateAsync(new Category
        {
            CategoryId = categoryId,
            CategoryName = category.CategoryName.Trim(),
            Description = category.Description,
            ImageUrl = category.ImageUrl,
            ParentCategoryId = category.ParentCategoryId,
            IsActive = category.IsActive
        });
    }

    public Task<bool> DeleteAsync(int categoryId)
    {
        return _categoryRepository.DeleteAsync(categoryId);
    }

    private async Task ValidateParentAsync(int? parentCategoryId)
    {
        if (parentCategoryId is null)
            return;

        var parent = await _categoryRepository.GetByIdAsync(parentCategoryId.Value);

        if (parent is null || !parent.IsActive)
            throw new ArgumentException("The parent category was not found.");
    }

    private static void ValidateName(string? name)
    {
        if (string.IsNullOrWhiteSpace(name) || name.Trim().Length > 100)
            throw new ArgumentException(
                "Category name is required and must be at most 100 characters.");
    }

    private static CategoryDto ToDto(Category category)
    {
        return new CategoryDto
        {
            CategoryId = category.CategoryId,
            CategoryName = category.CategoryName,
            Description = category.Description,
            ImageUrl = category.ImageUrl,
            ParentCategoryId = category.ParentCategoryId,
            IsActive = category.IsActive
        };
    }
}