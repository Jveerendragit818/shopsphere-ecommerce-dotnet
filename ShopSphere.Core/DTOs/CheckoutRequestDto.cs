using System.ComponentModel.DataAnnotations;

namespace ShopSphere.Core.DTOs;

public sealed class CheckoutRequestDto
{
    [Range(1, int.MaxValue)]
    public int AddressId { get; set; }

    [Required]
    [RegularExpression("^(COD|Demo)$")]
    public string PaymentMethod { get; set; } = "COD";
}