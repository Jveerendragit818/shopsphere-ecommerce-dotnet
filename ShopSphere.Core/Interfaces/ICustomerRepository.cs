using ShopSphere.Core.Entities;

namespace ShopSphere.Core.Interfaces;

public interface ICustomerRepository
{
    Task<IReadOnlyList<Customer>> GetAllAsync();
    Task<Customer?> GetByIdAsync(int customerId);
    Task<Customer?> GetByUserIdAsync(int userId);
    Task<int> AddAsync(Customer customer);
    Task<bool> DeleteAsync(int customerId);
}