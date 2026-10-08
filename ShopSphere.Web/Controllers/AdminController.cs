using Microsoft.AspNetCore.Mvc;

namespace ShopSphere.Web.Controllers;

public class AdminController : Controller
{
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
        var path = Path.Combine(Directory.GetCurrentDirectory(), "Data", "static", "products.json");

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

}