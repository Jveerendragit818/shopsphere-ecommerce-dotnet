using System.Net.Http.Json;
using System.Security.Claims;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ShopSphere.Core.DTOs;

namespace ShopSphere.Web.Controllers;

[Authorize(Roles = "Admin")]
public class AdminController : Controller
{
    private readonly IHttpClientFactory _httpClientFactory;

    public AdminController(IHttpClientFactory httpClientFactory)
    {
        _httpClientFactory = httpClientFactory;
    }

    [AllowAnonymous]
    [HttpGet("/admin/login")]
    public IActionResult Login()
    {
        return View();
    }

    [AllowAnonymous]
    [HttpPost("/admin/login")]
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
                "api/auth/login/admin",
                new LoginRequestDto
                {
                    Email = email,
                    Password = password,
                    RememberMe = rememberMe
                });

            if (!apiResponse.IsSuccessStatusCode)
            {
                ViewBag.LoginError = "Invalid admin email or password.";
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

            return RedirectToAction(nameof(Index));
        }
        catch (HttpRequestException)
        {
            ViewBag.LoginError =
                "ShopSphere admin sign-in is temporarily unavailable.";
            return View();
        }
    }

    [HttpGet("/admin")]
    public IActionResult Index()
    {
        return View();
    }

    [HttpGet("/admin/products")]
    public IActionResult Products()
    {
        return View();
    }

    [HttpGet("/admin/products-data")]
    public IActionResult ProductsData()
    {
        var path = Path.Combine(
            Directory.GetCurrentDirectory(),
            "Data",
            "static",
            "products.json");

        if (!System.IO.File.Exists(path))
            return NotFound();

        var json = System.IO.File.ReadAllText(path);
        return Content(json, "application/json");
    }

    [HttpGet("/admin/products/add")]
    public IActionResult AddProduct()
    {
        return View();
    }

    [HttpGet("/admin/products/edit")]
    public IActionResult EditProduct()
    {
        return View();
    }

    [HttpGet("/admin/inventory")]
    public IActionResult Inventory()
    {
        return View("~/Views/Admin/Inventory.cshtml");
    }

    [HttpGet("/admin/orders")]
    public IActionResult Orders()
    {
        return View("~/Views/Admin/Orders.cshtml");
    }

    [HttpGet("/admin/customers")]
    public IActionResult Customers()
    {
        return View("~/Views/Admin/Customers.cshtml");
    }

    [HttpGet("/admin/customers/details")]
    public IActionResult CustomerDetails()
    {
        return View("~/Views/Admin/CustomerDetails.cshtml");
    }

    [HttpGet("/admin/reviews")]
    public IActionResult Reviews()
    {
        return View("~/Views/Admin/Reviews.cshtml");
    }

    [HttpGet("/admin/reports")]
    public IActionResult Reports()
    {
        return View("~/Views/Admin/Reports.cshtml");
    }

    [HttpGet("/admin/notifications")]
    public IActionResult Notifications()
    {
        return View("~/Views/Admin/Notifications.cshtml");
    }

    [HttpGet("/admin/settings")]
    public IActionResult Settings()
    {
        return View("~/Views/Admin/Settings.cshtml");
    }

    [HttpGet("/admin/categories")]
    public IActionResult Categories()
    {
        return View("~/Views/Admin/Categories.cshtml");
    }
    [HttpPost("/admin/logout")]
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

        return RedirectToAction(nameof(Login));
    }
}