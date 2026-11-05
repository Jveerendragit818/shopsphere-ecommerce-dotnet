using ShopSphere.Core.Entities;

namespace ShopSphere.Core.Interfaces;

public interface IPasswordHashingService
{
    string HashPassword(User user, string password);
    bool VerifyPassword(User user, string passwordHash, string providedPassword);
}