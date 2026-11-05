namespace ShopSphere.Core.Entities;

public class Order
{
    public int OrderId { get; set; }
    public string OrderNumber { get; set; } = string.Empty;
    public int CustomerId { get; set; }
    public int? AddressId { get; set; }
    public DateTime OrderDate { get; set; }
    public decimal Subtotal { get; set; }
    public decimal ShippingFee { get; set; }
    public decimal TotalAmount { get; set; }
    public string OrderStatus { get; set; } = "Confirmed";
    public string PaymentStatus { get; set; } = "Pending";
    public string ShippingAddressSnapshot { get; set; } = "{}";
}