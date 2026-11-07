using ShopSphere.Core.Entities;
using ShopSphere.Core.Interfaces;

namespace ShopSphere.API.Services;

public sealed class WishlistService : IWishlistService
{
    private readonly IWishlistRepository _wishlistRepository;
    private readonly IProductRepository _productRepository;

    public WishlistService(
        IWishlistRepository wishlistRepository,
        IProductRepository productRepository)
    {
        _wishlistRepository = wishlistRepository;
        _productRepository = productRepository;
    }

    public Task<Wishlist> GetOrCreateAsync(int customerId)
    {
        ValidateCustomerId(customerId);
        return _wishlistRepository.GetOrCreateByCustomerIdAsync(customerId);
    }

    public async Task<IReadOnlyList<WishlistItem>> GetItemsAsync(
        int customerId)
    {
        var wishlist = await GetOrCreateAsync(customerId);
        return await _wishlistRepository.GetItemsAsync(wishlist.WishlistId);
    }

    public async Task<int> AddItemAsync(int customerId, int productId)
    {
        ValidateCustomerId(customerId);
        if (productId <= 0)
            throw new ArgumentOutOfRangeException(nameof(productId));

        var product = await _productRepository.GetByIdAsync(productId);
        if (product is null || !product.IsActive)
            throw new InvalidOperationException("Product is not available.");

        var wishlist = await GetOrCreateAsync(customerId);

        return await _wishlistRepository.AddItemAsync(new WishlistItem
        {
            WishlistId = wishlist.WishlistId,
            ProductId = productId
        });
    }

    public async Task<bool> RemoveItemAsync(
        int customerId,
        int wishlistItemId)
    {
        ValidateCustomerId(customerId);
        if (wishlistItemId <= 0)
            throw new ArgumentOutOfRangeException(nameof(wishlistItemId));

        var wishlist = await GetOrCreateAsync(customerId);
        var items =
            await _wishlistRepository.GetItemsAsync(wishlist.WishlistId);

        return items.Any(x => x.WishlistItemId == wishlistItemId) &&
               await _wishlistRepository.RemoveItemAsync(wishlistItemId);
    }

    private static void ValidateCustomerId(int customerId)
    {
        if (customerId <= 0)
            throw new ArgumentOutOfRangeException(nameof(customerId));
    }
}