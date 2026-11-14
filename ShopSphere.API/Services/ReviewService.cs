using ShopSphere.Core.Entities;
using ShopSphere.Core.Interfaces;

namespace ShopSphere.API.Services;

public sealed class ReviewService : IReviewService
{
    private readonly IReviewRepository _reviewRepository;
    private readonly ICustomerRepository _customerRepository;
    private readonly IOrderRepository _orderRepository;

    public ReviewService(
        IReviewRepository reviewRepository,
        ICustomerRepository customerRepository,
        IOrderRepository orderRepository)
    {
        _reviewRepository = reviewRepository;
        _customerRepository = customerRepository;
        _orderRepository = orderRepository;
    }

    public async Task<IReadOnlyList<Review>> GetApprovedByProductIdAsync(
        int productId)
    {
        if (productId <= 0)
            throw new ArgumentOutOfRangeException(nameof(productId));

        var reviews = await _reviewRepository.GetByProductIdAsync(productId);

        return reviews
            .Where(review =>
                string.Equals(
                    review.ReviewStatus,
                    "Approved",
                    StringComparison.OrdinalIgnoreCase))
            .ToList();
    }

    public Task<IReadOnlyList<Review>> GetAllAsync()
    {
        return _reviewRepository.GetAllAsync();
    }

    public async Task<int> AddForDeliveredProductAsync(
        int userId,
        int productId,
        byte rating,
        string? reviewTitle,
        string? reviewText)
    {
        if (userId <= 0)
            throw new ArgumentOutOfRangeException(nameof(userId));

        if (productId <= 0)
            throw new ArgumentOutOfRangeException(nameof(productId));

        if (rating is < 1 or > 5)
            throw new ArgumentOutOfRangeException(
                nameof(rating), "Rating must be between 1 and 5.");

        var customer = await _customerRepository.GetByUserIdAsync(userId);
        if (customer is null)
            throw new InvalidOperationException(
                "A customer account is required to submit a review.");

        var orders =
            await _orderRepository.GetByCustomerIdAsync(customer.CustomerId);

        var hasDeliveredProduct = false;

        foreach (var order in orders)
        {
            if (!string.Equals(
                    order.OrderStatus,
                    "Delivered",
                    StringComparison.OrdinalIgnoreCase))
            {
                continue;
            }

            var items =
                await _orderRepository.GetItemsByOrderIdAsync(order.OrderId);

            if (items.Any(item => item.ProductId == productId))
            {
                hasDeliveredProduct = true;
                break;
            }
        }

        if (!hasDeliveredProduct)
            throw new InvalidOperationException(
                "You can review a product after its order is delivered.");

        return await _reviewRepository.AddAsync(new Review
        {
            ProductId = productId,
            CustomerId = customer.CustomerId,
            Rating = rating,
            ReviewTitle = string.IsNullOrWhiteSpace(reviewTitle)
                ? null
                : reviewTitle.Trim(),
            ReviewText = string.IsNullOrWhiteSpace(reviewText)
                ? null
                : reviewText.Trim(),
            ReviewStatus = "Pending",
            IsFeatured = false
        });
    }

    public async Task<bool> UpdateStatusAsync(
        int reviewId,
        string reviewStatus)
    {
        if (reviewId <= 0)
            throw new ArgumentOutOfRangeException(nameof(reviewId));

        var allowedStatuses = new[] { "Pending", "Approved", "Rejected" };
        var normalizedStatus = allowedStatuses.FirstOrDefault(status =>
            string.Equals(
                status,
                reviewStatus?.Trim(),
                StringComparison.OrdinalIgnoreCase));

        if (normalizedStatus is null)
            throw new ArgumentException(
                "Review status must be Pending, Approved, or Rejected.",
                nameof(reviewStatus));

        return await _reviewRepository.UpdateStatusAsync(
            reviewId,
            normalizedStatus);
    }

    public Task<bool> DeleteAsync(int reviewId)
    {
        if (reviewId <= 0)
            throw new ArgumentOutOfRangeException(nameof(reviewId));

        return _reviewRepository.DeleteAsync(reviewId);
    }
}