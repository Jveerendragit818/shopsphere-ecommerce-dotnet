using Microsoft.AspNetCore.Mvc;
using ShopSphere.Web.Models;

namespace ShopSphere.Web.Controllers
{
    public class AccountController : Controller
    {


        [HttpGet]
        public IActionResult Login()
        {
            return View();
        }

        [HttpPost]
        public IActionResult Login(string email, string password, bool rememberMe)
        {
            if (email == "demo@shopsphere.com" && password == "1234")
            {
                TempData["LoginMessage"] = "Login successful.";
                return RedirectToAction("Index", "Home");
            }

            ViewBag.LoginError = "Invalid email or password.";
            ViewBag.Email = email;
            return View();
        }

        [HttpGet]
        public IActionResult Register()
        {
            return View();
        }

        [HttpPost]
        public IActionResult Register(string fullName, string email, string phone, string password, string confirmPassword, bool terms)
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
                ViewBag.RegisterError = "Please accept the terms and conditions.";
                return View();
            }

            TempData["RegisterMessage"] = "Account created successfully. You can now sign in.";
            return RedirectToAction("Login");
        }

        [HttpGet]
        public IActionResult ForgotPassword()
        {
            return View();
        }

        [HttpPost]
        public IActionResult ForgotPassword(string email)
        {
            if (string.IsNullOrWhiteSpace(email))
            {
                ViewBag.ForgotError = "Please enter your email address.";
                return View();
            }

            ViewBag.ForgotSuccess = "Password reset instructions have been sent to your email.";
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
        private List<ProductViewModel> LoadProducts()
        {
            var path = Path.Combine(
                Directory.GetCurrentDirectory(),
                "Data",
                "static",
                "products.json"
            );

            if (!System.IO.File.Exists(path))
            {
                return new List<ProductViewModel>();
            }

            var json = System.IO.File.ReadAllText(path);

            return System.Text.Json.JsonSerializer.Deserialize<List<ProductViewModel>>(
                json,
                new System.Text.Json.JsonSerializerOptions
                {
                    PropertyNameCaseInsensitive = true
                }
            ) ?? new List<ProductViewModel>();
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



    }
}
