using ShopSphere.Core.DTOs;
using ShopSphere.Core.Entities;
using ShopSphere.Core.Interfaces;

namespace ShopSphere.API.Services;

public sealed class ProductService : IProductService
{
    private readonly IProductRepository _productRepository;
    private readonly ICategoryRepository _categoryRepository;
    private readonly IInventoryRepository _inventoryRepository;

    public ProductService(
        IProductRepository productRepository,
        ICategoryRepository categoryRepository,
        IInventoryRepository inventoryRepository)
    {
        _productRepository = productRepository;
        _categoryRepository = categoryRepository;
        _inventoryRepository = inventoryRepository;
    }

    public async Task<IReadOnlyList<ProductDto>> GetAllAsync()
    {
        var products = await _productRepository.GetAllAsync();
        var categories = await _categoryRepository.GetAllAsync();
        var inventory = await _inventoryRepository.GetAllAsync();

        var categoryMap = categories.ToDictionary(x => x.CategoryId);
        var inventoryMap = inventory.ToDictionary(x => x.ProductId);
        var result = new List<ProductDto>();

        foreach (var product in products)
        {
            if (!product.IsActive ||
                !categoryMap.TryGetValue(product.CategoryId, out var category) ||
                !category.IsActive)
            {
                continue;
            }

            inventoryMap.TryGetValue(product.ProductId, out var stock);
            result.Add(ToDto(product, category, stock));
        }

        return result;
    }

    public async Task<ProductDto?> GetByIdAsync(int productId)
    {
        var product = await _productRepository.GetByIdAsync(productId);
        if (product is null || !product.IsActive)
            return null;

        var category =
            await _categoryRepository.GetByIdAsync(product.CategoryId);

        if (category is null || !category.IsActive)
            return null;

        var stock =
            await _inventoryRepository.GetByProductIdAsync(productId);

        return ToDto(product, category, stock);
    }

    public async Task<int> AddAsync(ProductDto product)
    {
        await ValidateAsync(product);

        return await _productRepository.AddAsync(new Product
        {
            CategoryId = product.CategoryId,
            ProductName = product.ProductName.Trim(),
            Description = product.Description,
            Brand = product.Brand,
            SKU = product.SKU.Trim(),
            Price = product.Price,
            DiscountPrice = product.DiscountPrice,
            IsFeatured = product.IsFeatured,
            IsActive = true
        });
    }

    public async Task<bool> UpdateAsync(int productId, ProductDto product)
    {
        await ValidateAsync(product);

        return await _productRepository.UpdateAsync(new Product
        {
            ProductId = productId,
            CategoryId = product.CategoryId,
            ProductName = product.ProductName.Trim(),
            Description = product.Description,
            Brand = product.Brand,
            SKU = product.SKU.Trim(),
            Price = product.Price,
            DiscountPrice = product.DiscountPrice,
            IsFeatured = product.IsFeatured,
            IsActive = product.IsActive
        });
    }

    public Task<bool> DeleteAsync(int productId)
    {
        return _productRepository.DeleteAsync(productId);
    }

    private async Task ValidateAsync(ProductDto product)
    {
        if (string.IsNullOrWhiteSpace(product.ProductName) ||
            product.ProductName.Trim().Length > 200)
        {
            throw new ArgumentException(
                "Product name is required and must be at most 200 characters.");
        }

        if (string.IsNullOrWhiteSpace(product.SKU) ||
            product.SKU.Trim().Length > 80)
        {
            throw new ArgumentException(
                "SKU is required and must be at most 80 characters.");
        }

        if (product.Price < 0 ||
            (product.DiscountPrice.HasValue && product.DiscountPrice < 0))
        {
            throw new ArgumentException("Product prices cannot be negative.");
        }

        if (product.Brand?.Length > 100)
            throw new ArgumentException("Brand must be at most 100 characters.");

        var category =
            await _categoryRepository.GetByIdAsync(product.CategoryId);

        if (category is null || !category.IsActive)
            throw new ArgumentException("An active category is required.");
    }

    private static ProductDto ToDto(
        Product product,
        Category category,
        Inventory? inventory)
    {
        return new ProductDto
        {
            ProductId = product.ProductId,
            CategoryId = product.CategoryId,
            CategoryName = category.CategoryName,
            ProductName = product.ProductName,
            Brand = product.Brand,
            SKU = product.SKU,
            Description = product.Description,
            Price = product.Price,
            DiscountPrice = product.DiscountPrice,
            AverageRating = 0,
            ReviewCount = 0,
            StockQuantity = inventory?.StockQuantity ?? 0,
            ImagePath = null,
            IsFeatured = product.IsFeatured,
            IsActive = product.IsActive
        };
    }
}