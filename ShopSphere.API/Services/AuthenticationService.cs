using ShopSphere.Core.DTOs;
using ShopSphere.Core.Entities;
using ShopSphere.Core.Interfaces;

namespace ShopSphere.API.Services;

public sealed class AuthenticationService : IAuthenticationService
{
    private readonly IUserRepository _userRepository;
    private readonly IPasswordHashingService _passwordHashingService;

    public AuthenticationService(
        IUserRepository userRepository,
        IPasswordHashingService passwordHashingService)
    {
        _userRepository = userRepository;
        _passwordHashingService = passwordHashingService;
    }

    public async Task<AuthResponseDto> RegisterCustomerAsync(
        RegisterRequestDto request)
    {
        var email = request.Email.Trim();

        if (await _userRepository.GetByEmailAsync(email) is not null)
            throw new InvalidOperationException(
                "An account with this email already exists.");

        var user = new User
        {
            FullName = request.FullName.Trim(),
            Email = email,
            Phone = request.Phone?.Trim(),
            Role = "Customer",
            IsActive = true
        };

        user.PasswordHash =
            _passwordHashingService.HashPassword(user, request.Password);

        var userId = await _userRepository.AddCustomerAccountAsync(user);
        var savedUser = await _userRepository.GetByIdAsync(userId)
            ?? throw new InvalidOperationException(
                "The newly created account could not be loaded.");

        return CreateResponse(savedUser);
    }

    public async Task<AuthResponseDto?> LoginCustomerAsync(
        LoginRequestDto request)
    {
        var user = await _userRepository.GetByEmailAsync(request.Email.Trim());

        if (user is null ||
            !user.IsActive ||
            !string.Equals(user.Role, "Customer", StringComparison.OrdinalIgnoreCase) ||
            !_passwordHashingService.VerifyPassword(
                user, user.PasswordHash, request.Password))
        {
            return null;
        }

        return CreateResponse(user);
    }

    public async Task<AuthResponseDto?> LoginAdminAsync(
        LoginRequestDto request)
    {
        var user = await _userRepository.GetByEmailAsync(request.Email.Trim());

        if (user is null ||
            !user.IsActive ||
            !string.Equals(user.Role, "Admin", StringComparison.OrdinalIgnoreCase) ||
            !_passwordHashingService.VerifyPassword(
                user, user.PasswordHash, request.Password))
        {
            return null;
        }

        return CreateResponse(user);
    }

    private static AuthResponseDto CreateResponse(User user)
    {
        return new AuthResponseDto
        {
            User = new UserDto
            {
                UserId = user.UserId,
                FullName = user.FullName,
                Email = user.Email,
                Phone = user.Phone,
                Role = user.Role,
                IsActive = user.IsActive,
                CreatedAt = user.CreatedAt
            }
        };
    }
}