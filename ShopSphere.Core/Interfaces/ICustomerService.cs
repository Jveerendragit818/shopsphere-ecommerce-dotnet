using ShopSphere.Core.DTOs;

namespace ShopSphere.Core.Interfaces;

public interface ICustomerService
{
    Task<CustomerProfileDto?> GetProfileAsync(int userId);
    Task<bool> UpdateProfileAsync(
        int userId,
        UpdateCustomerProfileDto request);
}