using ShopSphere.Core.Entities;
using ShopSphere.Core.Interfaces;

namespace ShopSphere.API.Services;

public sealed class CartService : ICartService
{
    private readonly ICartRepository _cartRepository;
    private readonly IProductRepository _productRepository;
    private readonly IInventoryRepository _inventoryRepository;

    public CartService(
        ICartRepository cartRepository,
        IProductRepository productRepository,
        IInventoryRepository inventoryRepository)
    {
        _cartRepository = cartRepository;
        _productRepository = productRepository;
        _inventoryRepository = inventoryRepository;
    }

    public Task<Cart> GetOrCreateAsync(int customerId)
    {
        ValidateCustomerId(customerId);
        return _cartRepository.GetOrCreateByCustomerIdAsync(customerId);
    }

    public async Task<IReadOnlyList<CartItem>> GetItemsAsync(int customerId)
    {
        var cart = await GetOrCreateAsync(customerId);
        return await _cartRepository.GetItemsAsync(cart.CartId);
    }

    public async Task<int> AddItemAsync(
        int customerId,
        int productId,
        int quantity)
    {
        ValidateCustomerId(customerId);
        if (productId <= 0)
            throw new ArgumentOutOfRangeException(nameof(productId));
        if (quantity <= 0)
            throw new ArgumentOutOfRangeException(nameof(quantity));

        var cart = await GetOrCreateAsync(customerId);
        var items = await _cartRepository.GetItemsAsync(cart.CartId);
        var existing = items.FirstOrDefault(x => x.ProductId == productId);
        var existingQuantity = existing?.Quantity ?? 0;

        await EnsureAvailableAsync(
            productId, quantity, existingQuantity);

        return await _cartRepository.AddItemAsync(new CartItem
        {
            CartId = cart.CartId,
            ProductId = productId,
            Quantity = quantity
        });
    }

    public async Task<bool> UpdateItemQuantityAsync(
        int customerId,
        int cartItemId,
        int quantity)
    {
        ValidateCustomerId(customerId);
        if (cartItemId <= 0)
            throw new ArgumentOutOfRangeException(nameof(cartItemId));
        if (quantity <= 0)
            throw new ArgumentOutOfRangeException(nameof(quantity));

        var cart = await GetOrCreateAsync(customerId);
        var items = await _cartRepository.GetItemsAsync(cart.CartId);
        var item = items.FirstOrDefault(x => x.CartItemId == cartItemId);

        if (item is null)
            return false;

        await EnsureAvailableAsync(item.ProductId, quantity);

        return await _cartRepository.UpdateItemQuantityAsync(
            cartItemId, quantity);
    }

    public async Task<bool> RemoveItemAsync(int customerId, int cartItemId)
    {
        ValidateCustomerId(customerId);
        if (cartItemId <= 0)
            throw new ArgumentOutOfRangeException(nameof(cartItemId));

        var cart = await GetOrCreateAsync(customerId);
        var items = await _cartRepository.GetItemsAsync(cart.CartId);

        return items.Any(x => x.CartItemId == cartItemId) &&
               await _cartRepository.RemoveItemAsync(cartItemId);
    }

    public async Task<bool> ClearAsync(int customerId)
    {
        var cart = await GetOrCreateAsync(customerId);
        return await _cartRepository.ClearAsync(cart.CartId);
    }

    private async Task EnsureAvailableAsync(
        int productId,
        int requestedQuantity,
        int existingQuantity = 0)
    {
        var product = await _productRepository.GetByIdAsync(productId);
        if (product is null || !product.IsActive)
            throw new InvalidOperationException("Product is not available.");

        var inventory =
            await _inventoryRepository.GetByProductIdAsync(productId);

        if (inventory is null ||
            (long)existingQuantity + requestedQuantity >
            inventory.StockQuantity)
        {
            throw new InvalidOperationException(
                "Requested quantity exceeds available stock.");
        }
    }

    private static void ValidateCustomerId(int customerId)
    {
        if (customerId <= 0)
            throw new ArgumentOutOfRangeException(nameof(customerId));
    }
}