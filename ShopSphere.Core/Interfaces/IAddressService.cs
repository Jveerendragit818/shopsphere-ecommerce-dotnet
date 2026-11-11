using ShopSphere.Core.DTOs;
using ShopSphere.Core.Entities;

namespace ShopSphere.Core.Interfaces;

public interface IAddressService
{
    Task<IReadOnlyList<Address>> GetByCustomerIdAsync(int customerId);
    Task<int> AddAsync(int customerId, AddressRequestDto request);
    Task<bool> UpdateAsync(
        int customerId,
        int addressId,
        AddressRequestDto request);
    Task<bool> DeleteAsync(int customerId, int addressId);
    Task<bool> SetDefaultAsync(int customerId, int addressId);
}