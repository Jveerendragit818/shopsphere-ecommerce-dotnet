using System.IO;
using ShopSphere.Core.Entities;

namespace ShopSphere.Core.Interfaces;

public interface IProductImageService
{
    Task<IReadOnlyList<ProductImage>> GetByProductIdAsync(int productId);

    Task<int> UploadAsync(
        int productId,
        Stream content,
        string fileName,
        string contentType,
        long fileSize,
        bool isPrimary,
        int displayOrder);

    Task<bool> SetPrimaryAsync(int productId, int imageId);
    Task<bool> DeleteAsync(int productId, int imageId);
}