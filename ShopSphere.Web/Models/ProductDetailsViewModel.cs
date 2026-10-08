namespace ShopSphere.Web.Models;

public class ProductDetailsViewModel
{
    public ProductViewModel Product { get; set; } = new();
    public List<ProductViewModel> RelatedProducts { get; set; } = new();
}