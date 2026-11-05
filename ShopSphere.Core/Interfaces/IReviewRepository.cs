using ShopSphere.Core.Entities;

namespace ShopSphere.Core.Interfaces;

public interface IReviewRepository
{
    Task<IReadOnlyList<Review>> GetByProductIdAsync(int productId);
    Task<IReadOnlyList<Review>> GetAllAsync();
    Task<int> AddAsync(Review review);
    Task<bool> UpdateStatusAsync(int reviewId, string reviewStatus);
    Task<bool> DeleteAsync(int reviewId);
}