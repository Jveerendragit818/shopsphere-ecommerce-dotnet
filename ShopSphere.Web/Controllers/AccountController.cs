using System.Net.Http.Json;
using System.Security.Claims;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ShopSphere.Core.DTOs;
using ShopSphere.Web.Models;

namespace ShopSphere.Web.Controllers;

[Authorize(Roles = "Customer")]
public class AccountController : Controller
{
    private readonly IHttpClientFactory _httpClientFactory;

    public AccountController(IHttpClientFactory httpClientFactory)
    {
        _httpClientFactory = httpClientFactory;
    }

    [AllowAnonymous]
    [HttpGet]
    public IActionResult Login()
    {
        return View();
    }

    [AllowAnonymous]
    [HttpPost]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> Login(
        string email,
        string password,
        bool rememberMe)
    {
        ViewBag.Email = email;

        try
        {
            var client = _httpClientFactory.CreateClient("ShopSphereApi");
            using var apiResponse = await client.PostAsJsonAsync(
                "api/auth/login/customer",
                new LoginRequestDto
                {
                    Email = email,
                    Password = password,
                    RememberMe = rememberMe
                });

            if (!apiResponse.IsSuccessStatusCode)
            {
                ViewBag.LoginError = "Invalid email or password.";
                return View();
            }

            var authResponse =
                await apiResponse.Content.ReadFromJsonAsync<AuthResponseDto>();

            if (authResponse?.User is null)
            {
                ViewBag.LoginError = "The sign-in response was incomplete.";
                return View();
            }

            if (apiResponse.Headers.TryGetValues("Set-Cookie", out var cookies))
            {
                foreach (var cookie in cookies)
                    Response.Headers.Append("Set-Cookie", cookie);
            }

            var claims = new[]
            {
                new Claim(
                    ClaimTypes.NameIdentifier,
                    authResponse.User.UserId.ToString()),
                new Claim(ClaimTypes.Name, authResponse.User.FullName),
                new Claim(ClaimTypes.Email, authResponse.User.Email),
                new Claim(ClaimTypes.Role, authResponse.User.Role)
            };

            var identity = new ClaimsIdentity(
                claims,
                CookieAuthenticationDefaults.AuthenticationScheme);

            var properties = new AuthenticationProperties
            {
                IsPersistent = rememberMe
            };

            if (rememberMe)
                properties.ExpiresUtc = DateTimeOffset.UtcNow.AddDays(14);

            await HttpContext.SignInAsync(
                CookieAuthenticationDefaults.AuthenticationScheme,
                new ClaimsPrincipal(identity),
                properties);

            return RedirectToAction("Index", "Home");
        }
        catch (HttpRequestException)
        {
            ViewBag.LoginError =
                "ShopSphere sign-in is temporarily unavailable.";
            return View();
        }
    }

    [AllowAnonymous]
    [HttpGet]
    public IActionResult Register()
    {
        return View();
    }

    [AllowAnonymous]
    [HttpPost]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> Register(
        string fullName,
        string email,
        string phone,
        string password,
        string confirmPassword,
        bool terms)
    {
        ViewBag.FullName = fullName;
        ViewBag.Email = email;
        ViewBag.Phone = phone;

        if (string.IsNullOrWhiteSpace(fullName) ||
            string.IsNullOrWhiteSpace(email) ||
            string.IsNullOrWhiteSpace(phone) ||
            string.IsNullOrWhiteSpace(password) ||
            string.IsNullOrWhiteSpace(confirmPassword))
        {
            ViewBag.RegisterError = "Please fill in all required fields.";
            return View();
        }

        if (password != confirmPassword)
        {
            ViewBag.RegisterError = "Passwords do not match.";
            return View();
        }

        if (!terms)
        {
            ViewBag.RegisterError =
                "Please accept the terms and conditions.";
            return View();
        }

        try
        {
            var client = _httpClientFactory.CreateClient("ShopSphereApi");
            using var apiResponse = await client.PostAsJsonAsync(
                "api/auth/register",
                new RegisterRequestDto
                {
                    FullName = fullName,
                    Email = email,
                    Phone = phone,
                    Password = password,
                    ConfirmPassword = confirmPassword
                });

            if (apiResponse.StatusCode == System.Net.HttpStatusCode.Conflict)
            {
                ViewBag.RegisterError =
                    "An account with this email already exists.";
                return View();
            }

            if (!apiResponse.IsSuccessStatusCode)
            {
                var problem =
                    await apiResponse.Content.ReadFromJsonAsync<ValidationProblemDetails>();

                var validationMessage = problem?.Errors.Values
                    .SelectMany(messages => messages)
                    .FirstOrDefault();

                ViewBag.RegisterError = validationMessage
                    ?? $"Registration failed (API status {(int)apiResponse.StatusCode}).";

                return View();
            }

            TempData["RegisterMessage"] =
                "Account created successfully. You can now sign in.";
            return RedirectToAction("Login");
        }
        catch (HttpRequestException)
        {
            ViewBag.RegisterError =
                "ShopSphere registration is temporarily unavailable.";
            return View();
        }
    }

    [AllowAnonymous]
    [HttpGet]
    public IActionResult ForgotPassword()
    {
        return View();
    }

    [AllowAnonymous]
    [HttpPost]
    [ValidateAntiForgeryToken]
    public IActionResult ForgotPassword(string email)
    {
        if (string.IsNullOrWhiteSpace(email))
        {
            ViewBag.ForgotError = "Please enter your email address.";
            return View();
        }

        ViewBag.ForgotSuccess =
            "Password reset instructions have been sent to your email.";
        ViewBag.Email = email;

        return View();
    }

    [HttpGet]
    [Route("account")]
    public IActionResult Index()
    {
        return View();
    }

    [HttpGet]
    [Route("account/profile")]
    public IActionResult Profile()
    {
        return View();
    }

    [HttpGet]
    [Route("account/addresses")]
    public IActionResult Addresses()
    {
        return View();
    }

    [HttpGet]
    [Route("account/wishlist")]
    public IActionResult Wishlist()
    {
        return View();
    }

    [HttpGet]
    [Route("account/orders")]
    public IActionResult Orders()
    {
        return View();
    }

    [HttpGet]
    [Route("account/orders/details")]
    public IActionResult OrderDetails(string orderId)
    {
        return View();
    }

    [HttpGet]
    [Route("account/orders/tracking")]
    public IActionResult OrderTracking(string orderId)
    {
        return View();
    }

    [HttpGet]
    [Route("account/reviews")]
    public IActionResult Reviews()
    {
        var products = LoadProducts();
        return View(products);
    }

    [HttpGet("/account/notifications")]
    public IActionResult Notifications()
    {
        return View();
    }

    [HttpGet("/account/security")]
    public IActionResult Security()
    {
        return View();
    }

    private List<ProductViewModel> LoadProducts()
    {
        var path = Path.Combine(
            Directory.GetCurrentDirectory(),
            "Data",
            "static",
            "products.json");

        if (!System.IO.File.Exists(path))
            return new List<ProductViewModel>();

        var json = System.IO.File.ReadAllText(path);

        return System.Text.Json.JsonSerializer.Deserialize<List<ProductViewModel>>(
            json,
            new System.Text.Json.JsonSerializerOptions
            {
                PropertyNameCaseInsensitive = true
            }) ?? new List<ProductViewModel>();
    }

    [HttpPost]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> Logout()
    {
        var apiCookie = Request.Cookies["ShopSphere.Auth"];

        if (!string.IsNullOrEmpty(apiCookie))
        {
            try
            {
                var client = _httpClientFactory.CreateClient("ShopSphereApi");
                using var request = new HttpRequestMessage(
                    HttpMethod.Post,
                    "api/auth/logout");

                request.Headers.TryAddWithoutValidation(
                    "Cookie",
                    $"ShopSphere.Auth={apiCookie}");

                using var response = await client.SendAsync(request);

                if (response.Headers.TryGetValues("Set-Cookie", out var cookies))
                {
                    foreach (var cookie in cookies)
                        Response.Headers.Append("Set-Cookie", cookie);
                }
            }
            catch (HttpRequestException)
            {
            }
        }

        await HttpContext.SignOutAsync(
            CookieAuthenticationDefaults.AuthenticationScheme);

        Response.Cookies.Delete(
            "ShopSphere.Auth",
            new CookieOptions
            {
                Path = "/",
                Secure = true,
                HttpOnly = true,
                SameSite = SameSiteMode.Lax
            });

        return RedirectToAction("Index", "Home");
    }
}