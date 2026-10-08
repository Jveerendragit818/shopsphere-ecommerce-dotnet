using System.Text.Json;
using Microsoft.AspNetCore.Mvc;
using ShopSphere.Web.Models;

namespace ShopSphere.Web.Controllers;

public class CategoryController : Controller
{
    private readonly IWebHostEnvironment _environment;

    public CategoryController(IWebHostEnvironment environment)
    {
        _environment = environment;
    }

    public IActionResult Index()
    {
        var filePath = Path.Combine(
            _environment.ContentRootPath,
            "Data",
            "static",
            "categories.json"
        );

        if (!System.IO.File.Exists(filePath))
        {
            return View(new List<CategoryViewModel>());
        }

        var json = System.IO.File.ReadAllText(filePath);

        var categories = JsonSerializer.Deserialize<List<CategoryViewModel>>(
            json,
            new JsonSerializerOptions
            {
                PropertyNameCaseInsensitive = true
            }
        ) ?? new List<CategoryViewModel>();

        return View(categories);
    }
}