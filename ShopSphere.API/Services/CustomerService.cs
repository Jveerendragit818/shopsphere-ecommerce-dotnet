using ShopSphere.Core.DTOs;
using ShopSphere.Core.Interfaces;

namespace ShopSphere.API.Services;

public sealed class CustomerService : ICustomerService
{
    private readonly IUserRepository _userRepository;
    private readonly ICustomerRepository _customerRepository;

    public CustomerService(
        IUserRepository userRepository,
        ICustomerRepository customerRepository)
    {
        _userRepository = userRepository;
        _customerRepository = customerRepository;
    }

    public async Task<CustomerProfileDto?> GetProfileAsync(int userId)
    {
        var customer = await _customerRepository.GetByUserIdAsync(userId);
        if (customer is null)
            return null;

        var user = await _userRepository.GetByIdAsync(userId);
        if (user is null)
            return null;

        return new CustomerProfileDto
        {
            UserId = user.UserId,
            FullName = user.FullName,
            Email = user.Email,
            Phone = user.Phone,
            CreatedAt = user.CreatedAt
        };
    }

    public async Task<bool> UpdateProfileAsync(
        int userId,
        UpdateCustomerProfileDto request)
    {
        var customer = await _customerRepository.GetByUserIdAsync(userId);
        if (customer is null)
            return false;

        var user = await _userRepository.GetByIdAsync(userId);
        if (user is null)
            return false;

        var email = request.Email.Trim();
        var existingUser = await _userRepository.GetByEmailAsync(email);

        if (existingUser is not null && existingUser.UserId != userId)
            throw new InvalidOperationException(
                "An account with this email already exists.");

        user.FullName = request.FullName.Trim();
        user.Email = email;
        user.Phone = string.IsNullOrWhiteSpace(request.Phone)
            ? null
            : request.Phone.Trim();

        return await _userRepository.UpdateAsync(user);
    }
}