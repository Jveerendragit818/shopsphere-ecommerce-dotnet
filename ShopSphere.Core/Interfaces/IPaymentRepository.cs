using ShopSphere.Core.Entities;

namespace ShopSphere.Core.Interfaces;

public interface IPaymentRepository
{
    Task<IReadOnlyList<Payment>> GetByOrderIdAsync(int orderId);
    Task<int> AddAsync(Payment payment);
    Task<bool> UpdateStatusAsync(int paymentId, string paymentStatus);
}