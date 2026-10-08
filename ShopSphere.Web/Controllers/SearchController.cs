using Microsoft.AspNetCore.Mvc;
using System.Text.Json;
using ShopSphere.Web.Models;

namespace ShopSphere.Web.Controllers
{
    public class SearchController : Controller
    {
        private readonly IWebHostEnvironment _environment;

        public SearchController(IWebHostEnvironment environment)
        {
            _environment = environment;
        }

        public IActionResult Index(string? query)
        {
            var products = LoadProducts();

            query = query?.Trim() ?? "";

            var results = string.IsNullOrWhiteSpace(query)
                ? products
                : products.Where(product =>
                    product.Name.Contains(query, StringComparison.OrdinalIgnoreCase) ||
                    product.Brand.Contains(query, StringComparison.OrdinalIgnoreCase) ||
                    product.Category.Contains(query, StringComparison.OrdinalIgnoreCase) ||
                    product.Description.Contains(query, StringComparison.OrdinalIgnoreCase)
                ).ToList();

            ViewBag.SearchQuery = query;

            return View(results);
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