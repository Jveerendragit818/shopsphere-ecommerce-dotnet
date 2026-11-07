using ShopSphere.Core.Entities;

namespace ShopSphere.Core.Interfaces;

public interface IOrderRepository
{
    Task<IReadOnlyList<Order>> GetAllAsync();
    Task<Order?> GetByIdAsync(int orderId);
    Task<IReadOnlyList<Order>> GetByCustomerIdAsync(int customerId);
    Task<int> CreateAsync(
        Order order,
        IReadOnlyList<OrderItem> items,
        Payment payment,
        int cartId);
    Task<bool> UpdateStatusAsync(int orderId, string orderStatus);
    Task<IReadOnlyList<OrderItem>> GetItemsByOrderIdAsync(int orderId);
}