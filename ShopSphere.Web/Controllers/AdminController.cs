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


}