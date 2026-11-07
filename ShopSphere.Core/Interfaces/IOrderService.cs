using ShopSphere.Core.DTOs;
using ShopSphere.Core.Entities;

namespace ShopSphere.Core.Interfaces;

public interface IOrderService
{
    Task<Order> CheckoutAsync(
        int customerId,
        CheckoutRequestDto request);

    Task<IReadOnlyList<Order>> GetCustomerOrdersAsync(int customerId);

    Task<Order?> GetCustomerOrderAsync(int customerId, int orderId);

    Task<IReadOnlyList<OrderItem>> GetCustomerOrderItemsAsync(
        int customerId,
        int orderId);
}