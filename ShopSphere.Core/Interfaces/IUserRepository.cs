using ShopSphere.Core.Entities;

namespace ShopSphere.Core.Interfaces;

public interface IUserRepository
{
    Task<User?> GetByIdAsync(int userId);
    Task<User?> GetByEmailAsync(string email);
    Task<int> AddAsync(User user);
    Task<bool> UpdateAsync(User user);
    Task<int> AddCustomerAccountAsync(User user);
        
}