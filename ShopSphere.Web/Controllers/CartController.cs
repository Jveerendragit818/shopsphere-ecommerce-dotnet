using Microsoft.AspNetCore.Mvc;
using System.Text.Json;
using ShopSphere.Web.Models;

namespace ShopSphere.Web.Controllers
{
    public class CartController : Controller
    {
        private readonly IWebHostEnvironment _environment;

        public CartController(IWebHostEnvironment environment)
        {
            _environment = environment;
        }

        [HttpGet]
        public IActionResult Index()
        {
            var products = LoadProducts();
            return View(products);
        }

        private List<ProductViewModel> LoadProducts()
        {
            var path = Path.Combine(
                _environment.ContentRootPath,
                "Data",
                "static",
                "products.json"
            );

            if (!System.IO.File.Exists(path))
            {
                return new List<ProductViewModel>();
            }

            var json = System.IO.File.ReadAllText(path);

            return JsonSerializer.Deserialize<List<ProductViewModel>>(
                json,
                new JsonSerializerOptions
                {
                    PropertyNameCaseInsensitive = true
                }
            ) ?? new List<ProductViewModel>();
        }
    }
}