namespace ShopSphere.Web.Models;

public class CategoryViewModel
{
    public int Id { get; set; }
    public string Name { get; set; } = "";
    public string Description { get; set; } = "";
    public string Image { get; set; } = "";
    public int ProductCount { get; set; }
    public bool Featured { get; set; }
}