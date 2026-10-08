using System.Text.Json;
using Microsoft.AspNetCore.Mvc;
using ShopSphere.Web.Models;

namespace ShopSphere.Web.Controllers;

public class ProductController : Controller
{
    private readonly IWebHostEnvironment _environment;

    public ProductController(IWebHostEnvironment environment)
    {
        _environment = environment;
    }

    public IActionResult Index(string? category)
    {
        var products = LoadProducts();

        if (!string.IsNullOrWhiteSpace(category))
        {
            products = products
                .Where(x => x.Category.Equals(category, StringComparison.OrdinalIgnoreCase))
                .ToList();
        }

        ViewBag.SelectedCategory = category;

        return View(products);
    }

    public IActionResult Details(int id)
    {
        var products = LoadProducts();

        var product = products.FirstOrDefault(x => x.Id == id);

        if (product == null)
        {
            return NotFound();
        }

        var relatedProducts = products
            .Where(x => x.Id != id && x.Category == product.Category)
            .Take(4)
            .ToList();

        if (relatedProducts.Count < 4)
        {
            var additionalProducts = products
                .Where(x => x.Id != id && !relatedProducts.Any(r => r.Id == x.Id))
                .Take(4 - relatedProducts.Count)
                .ToList();

            relatedProducts.AddRange(additionalProducts);
        }

        var model = new ProductDetailsViewModel
        {
            Product = product,
            RelatedProducts = relatedProducts
        };

        return View(model);
    }

    private List<ProductViewModel> LoadProducts()
    {
        var filePath = Path.Combine(
            _environment.ContentRootPath,
            "Data",
            "static",
            "products.json"
        );

        if (!System.IO.File.Exists(filePath))
        {
            return new List<ProductViewModel>();
        }

        var json = System.IO.File.ReadAllText(filePath);

        return JsonSerializer.Deserialize<List<ProductViewModel>>(
            json,
            new JsonSerializerOptions
            {
                PropertyNameCaseInsensitive = true
            }
        ) ?? new List<ProductViewModel>();
    }
}