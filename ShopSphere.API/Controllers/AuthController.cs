using System.Security.Claims;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ShopSphere.Core.DTOs;
using ShopSphereAuthenticationService =
    ShopSphere.Core.Interfaces.IAuthenticationService;

namespace ShopSphere.API.Controllers;

[ApiController]
[Route("api/auth")]
public sealed class AuthController : ControllerBase
{
    private const string DuplicateEmailMessage =
        "An account with this email already exists.";

    private readonly ShopSphereAuthenticationService _authenticationService;

    public AuthController(
        ShopSphereAuthenticationService authenticationService)
    {
        _authenticationService = authenticationService;
    }

    [AllowAnonymous]
    [HttpPost("register")]
    public async Task<IActionResult> Register(RegisterRequestDto request)
    {
        try
        {
            var response =
                await _authenticationService.RegisterCustomerAsync(request);

            await IssueCookieAsync(response, rememberMe: false);
            return StatusCode(StatusCodes.Status201Created, response);
        }
        catch (InvalidOperationException exception)
            when (exception.Message == DuplicateEmailMessage)
        {
            return Conflict(new { message = DuplicateEmailMessage });
        }
    }

    [AllowAnonymous]
    [HttpPost("login/customer")]
    public async Task<IActionResult> LoginCustomer(LoginRequestDto request)
    {
        var response =
            await _authenticationService.LoginCustomerAsync(request);

        if (response is null)
            return Unauthorized(new { message = "Invalid email or password." });

        await IssueCookieAsync(response, request.RememberMe);
        return Ok(response);
    }

    [AllowAnonymous]
    [HttpPost("login/admin")]
    public async Task<IActionResult> LoginAdmin(LoginRequestDto request)
    {
        var response =
            await _authenticationService.LoginAdminAsync(request);

        if (response is null)
            return Unauthorized(new { message = "Invalid email or password." });

        await IssueCookieAsync(response, request.RememberMe);
        return Ok(response);
    }

    [Authorize]
    [HttpPost("logout")]
    public async Task<IActionResult> Logout()
    {
        await HttpContext.SignOutAsync(
            CookieAuthenticationDefaults.AuthenticationScheme);

        return NoContent();
    }

    private Task IssueCookieAsync(
        AuthResponseDto response,
        bool rememberMe)
    {
        var user = response.User;

        var claims = new[]
        {
            new Claim(ClaimTypes.NameIdentifier, user.UserId.ToString()),
            new Claim(ClaimTypes.Name, user.FullName),
            new Claim(ClaimTypes.Email, user.Email),
            new Claim(ClaimTypes.Role, user.Role)
        };

        var identity = new ClaimsIdentity(
            claims,
            CookieAuthenticationDefaults.AuthenticationScheme);

        var principal = new ClaimsPrincipal(identity);

        var properties = new AuthenticationProperties
        {
            IsPersistent = rememberMe
        };

        if (rememberMe)
            properties.ExpiresUtc = DateTimeOffset.UtcNow.AddDays(14);

        return HttpContext.SignInAsync(
            CookieAuthenticationDefaults.AuthenticationScheme,
            principal,
            properties);
    }
}