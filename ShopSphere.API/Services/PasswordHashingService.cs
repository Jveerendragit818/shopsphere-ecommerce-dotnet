using Microsoft.AspNetCore.Identity;
using ShopSphere.Core.Entities;
using ShopSphere.Core.Interfaces;

namespace ShopSphere.API.Services;

public sealed class PasswordHashingService : IPasswordHashingService
{
    private readonly PasswordHasher<User> _passwordHasher = new();

    public string HashPassword(User user, string password)
    {
        return _passwordHasher.HashPassword(user, password);
    }

    public bool VerifyPassword(
        User user,
        string passwordHash,
        string providedPassword)
    {
        return _passwordHasher.VerifyHashedPassword(
            user, passwordHash, providedPassword)
            != PasswordVerificationResult.Failed;
    }
}