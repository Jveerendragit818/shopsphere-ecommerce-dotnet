using ShopSphere.Core.Entities;
using ShopSphere.Core.Interfaces;

namespace ShopSphere.API.Services;

public sealed class ProductImageService : IProductImageService
{
    private const long MaxFileSize = 5 * 1024 * 1024;

    private readonly IProductImageRepository _imageRepository;
    private readonly IProductRepository _productRepository;
    private readonly IWebHostEnvironment _environment;

    public ProductImageService(
        IProductImageRepository imageRepository,
        IProductRepository productRepository,
        IWebHostEnvironment environment)
    {
        _imageRepository = imageRepository;
        _productRepository = productRepository;
        _environment = environment;
    }

    public async Task<IReadOnlyList<ProductImage>> GetByProductIdAsync(
        int productId)
    {
        if (productId <= 0)
            throw new ArgumentOutOfRangeException(nameof(productId));

        return await _imageRepository.GetByProductIdAsync(productId);
    }

    public async Task<int> UploadAsync(
        int productId,
        Stream content,
        string fileName,
        string contentType,
        long fileSize,
        bool isPrimary,
        int displayOrder)
    {
        if (productId <= 0)
            throw new ArgumentOutOfRangeException(nameof(productId));
        if (content is null || !content.CanRead)
            throw new ArgumentException("A readable image file is required.");
        if (fileSize <= 0 || fileSize > MaxFileSize)
            throw new ArgumentException("Image size must be between 1 byte and 5 MB.");
        if (displayOrder < 0)
            throw new ArgumentOutOfRangeException(nameof(displayOrder));

        var product = await _productRepository.GetByIdAsync(productId);
        if (product is null)
            throw new InvalidOperationException("Product was not found.");

        var extension = Path.GetExtension(fileName).ToLowerInvariant();
        var expectedContentType = extension switch
        {
            ".jpg" or ".jpeg" => "image/jpeg",
            ".png" => "image/png",
            ".webp" => "image/webp",
            _ => throw new ArgumentException(
                "Only JPG, PNG, and WEBP images are allowed.")
        };

        if (!string.Equals(
                contentType,
                expectedContentType,
                StringComparison.OrdinalIgnoreCase))
        {
            throw new ArgumentException("The image file type is invalid.");
        }

        var existingImages =
            await _imageRepository.GetByProductIdAsync(productId);
        var makePrimary = isPrimary || existingImages.Count == 0;

        var fileNameOnDisk = $"{Guid.NewGuid():N}{extension}";
        var webRoot = _environment.WebRootPath;
        if (string.IsNullOrWhiteSpace(webRoot))
            webRoot = Path.Combine(_environment.ContentRootPath, "wwwroot");

        var uploadDirectory = Path.Combine(
            webRoot, "uploads", "products");
        Directory.CreateDirectory(uploadDirectory);

        var filePath = Path.Combine(uploadDirectory, fileNameOnDisk);
        var imageUrl = $"/uploads/products/{fileNameOnDisk}";

        try
        {
            await using (var destination = File.Create(filePath))
                await content.CopyToAsync(destination);

            return await _imageRepository.AddAsync(new ProductImage
            {
                ProductId = productId,
                ImageUrl = imageUrl,
                IsPrimary = makePrimary,
                DisplayOrder = displayOrder
            });
        }
        catch
        {
            if (File.Exists(filePath))
                File.Delete(filePath);

            throw;
        }
    }

    public Task<bool> SetPrimaryAsync(int productId, int imageId)
    {
        if (productId <= 0)
            throw new ArgumentOutOfRangeException(nameof(productId));
        if (imageId <= 0)
            throw new ArgumentOutOfRangeException(nameof(imageId));

        return _imageRepository.SetPrimaryAsync(productId, imageId);
    }

    public async Task<bool> DeleteAsync(int productId, int imageId)
    {
        if (productId <= 0)
            throw new ArgumentOutOfRangeException(nameof(productId));
        if (imageId <= 0)
            throw new ArgumentOutOfRangeException(nameof(imageId));

        var images = await _imageRepository.GetByProductIdAsync(productId);
        var image = images.FirstOrDefault(x => x.ImageId == imageId);
        if (image is null)
            return false;

        if (!await _imageRepository.DeleteAsync(imageId))
            return false;

        var fileName = Path.GetFileName(image.ImageUrl);
        var webRoot = _environment.WebRootPath;
        if (string.IsNullOrWhiteSpace(webRoot))
            webRoot = Path.Combine(_environment.ContentRootPath, "wwwroot");

        var filePath = Path.Combine(
            webRoot, "uploads", "products", fileName);

        if (File.Exists(filePath))
            File.Delete(filePath);

        return true;
    }
}