using ShopSphere.Core.Entities;

namespace ShopSphere.Core.Interfaces;

public interface IReviewService
{
    Task<IReadOnlyList<Review>> GetApprovedByProductIdAsync(int productId);
    Task<IReadOnlyList<Review>> GetAllAsync();
    Task<int> AddForDeliveredProductAsync(
        int userId,
        int productId,
        byte rating,
        string? reviewTitle,
        string? reviewText);
    Task<bool> UpdateStatusAsync(int reviewId, string reviewStatus);
    Task<bool> DeleteAsync(int reviewId);
}