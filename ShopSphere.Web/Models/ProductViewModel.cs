namespace ShopSphere.Web.Models;

public class ProductViewModel
{
    public int Id { get; set; }
    public string Name { get; set; } = "";
    public string Category { get; set; } = "";
    public string Brand { get; set; } = "";
    public decimal Price { get; set; }
    public decimal? OldPrice { get; set; }
    public decimal Rating { get; set; }
    public int ReviewCount { get; set; }
    public string Availability { get; set; } = "";
    public string Image { get; set; } = "";
    public string Description { get; set; } = "";
}