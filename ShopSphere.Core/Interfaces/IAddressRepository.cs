using ShopSphere.Core.Entities;

namespace ShopSphere.Core.Interfaces;

public interface IAddressRepository
{
    Task<IReadOnlyList<Address>> GetByCustomerIdAsync(int customerId);
    Task<Address?> GetByIdAsync(int addressId);
    Task<int> AddAsync(Address address);
    Task<bool> UpdateAsync(Address address);
    Task<bool> DeleteAsync(int addressId);
    Task<bool> SetDefaultAsync(int customerId, int addressId);
}