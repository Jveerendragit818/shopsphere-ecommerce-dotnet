using ShopSphere.Core.DTOs;

namespace ShopSphere.Core.Interfaces;

public interface IAuthenticationService
{
    Task<AuthResponseDto> RegisterCustomerAsync(RegisterRequestDto request);
    Task<AuthResponseDto?> LoginCustomerAsync(LoginRequestDto request);
    Task<AuthResponseDto?> LoginAdminAsync(LoginRequestDto request);
}