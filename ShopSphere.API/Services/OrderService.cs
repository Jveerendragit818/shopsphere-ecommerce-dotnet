using System.Text.Json;
using ShopSphere.Core.DTOs;
using ShopSphere.Core.Entities;
using ShopSphere.Core.Interfaces;

namespace ShopSphere.API.Services;

public sealed class OrderService : IOrderService
{
    private const decimal ShippingFee = 0m;

    private readonly IOrderRepository _orderRepository;
    private readonly ICartService _cartService;
    private readonly IAddressRepository _addressRepository;
    private readonly IProductRepository _productRepository;

    public OrderService(
        IOrderRepository orderRepository,
        ICartService cartService,
        IAddressRepository addressRepository,
        IProductRepository productRepository)
    {
        _orderRepository = orderRepository;
        _cartService = cartService;
        _addressRepository = addressRepository;
        _productRepository = productRepository;
    }

    public async Task<Order> CheckoutAsync(
        int customerId,
        CheckoutRequestDto request)
    {
        ValidateCustomerId(customerId);

        if (request.PaymentMethod is not ("COD" or "Demo"))
            throw new ArgumentException(
                "Payment method must be COD or Demo.");

        var address = (await _addressRepository.GetByCustomerIdAsync(customerId))
            .FirstOrDefault(x => x.AddressId == request.AddressId);

        if (address is null)
            throw new InvalidOperationException(
                "The selected address was not found for this customer.");

        var cart = await _cartService.GetOrCreateAsync(customerId);
        var cartItems = await _cartService.GetItemsAsync(customerId);

        if (cartItems.Count == 0)
            throw new InvalidOperationException("The cart is empty.");

        var orderItems = new List<OrderItem>();

        foreach (var cartItem in cartItems)
        {
            var product =
                await _productRepository.GetByIdAsync(cartItem.ProductId);

            if (product is null || !product.IsActive)
                throw new InvalidOperationException(
                    $"Product {cartItem.ProductId} is not available.");

            var unitPrice = product.DiscountPrice ?? product.Price;

            orderItems.Add(new OrderItem
            {
                ProductId = product.ProductId,
                ProductName = product.ProductName,
                SKU = product.SKU,
                Quantity = cartItem.Quantity,
                UnitPrice = unitPrice,
                LineTotal = decimal.Round(unitPrice * cartItem.Quantity, 2)
            });
        }

        var subtotal = orderItems.Sum(x => x.LineTotal);
        var total = subtotal + ShippingFee;
        var isDemoPayment = request.PaymentMethod == "Demo";

        var order = new Order
        {
            OrderNumber =
                $"SS-{DateTime.UtcNow:yyyyMMddHHmmss}-{Guid.NewGuid().ToString("N")[..8].ToUpperInvariant()}",
            CustomerId = customerId,
            AddressId = address.AddressId,
            Subtotal = subtotal,
            ShippingFee = ShippingFee,
            TotalAmount = total,
            OrderStatus = "Confirmed",
            PaymentStatus = isDemoPayment ? "Paid" : "Pending",
            ShippingAddressSnapshot = JsonSerializer.Serialize(new
            {
                address.FullName,
                address.Phone,
                address.AddressLine1,
                address.AddressLine2,
                address.City,
                address.State,
                address.PostalCode,
                address.Country,
                address.AddressType
            })
        };

        var payment = new Payment
        {
            PaymentMethod = request.PaymentMethod,
            TransactionReference = isDemoPayment
                ? $"DEMO-{Guid.NewGuid():N}"
                : null,
            Amount = total,
            PaymentStatus = order.PaymentStatus,
            PaymentDate = isDemoPayment ? DateTime.UtcNow : null
        };

        var orderId = await _orderRepository.CreateAsync(
            order,
            orderItems,
            payment,
            cart.CartId);

        return await _orderRepository.GetByIdAsync(orderId)
            ?? throw new InvalidOperationException(
                "The order was created but could not be retrieved.");
    }

    public Task<IReadOnlyList<Order>> GetCustomerOrdersAsync(int customerId)
    {
        ValidateCustomerId(customerId);
        return _orderRepository.GetByCustomerIdAsync(customerId);
    }

    public async Task<Order?> GetCustomerOrderAsync(
        int customerId,
        int orderId)
    {
        ValidateCustomerId(customerId);
        if (orderId <= 0)
            throw new ArgumentOutOfRangeException(nameof(orderId));

        var order = await _orderRepository.GetByIdAsync(orderId);
        return order?.CustomerId == customerId ? order : null;
    }

    public async Task<IReadOnlyList<OrderItem>> GetCustomerOrderItemsAsync(
        int customerId,
        int orderId)
    {
        var order = await GetCustomerOrderAsync(customerId, orderId);
        if (order is null)
            return Array.Empty<OrderItem>();

        return await _orderRepository.GetItemsByOrderIdAsync(orderId);
    }

    private static void ValidateCustomerId(int customerId)
    {
        if (customerId <= 0)
            throw new ArgumentOutOfRangeException(nameof(customerId));
    }
}