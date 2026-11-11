using System.ComponentModel.DataAnnotations;

namespace ShopSphere.Core.DTOs;

public sealed class AddressRequestDto
{
    [Required]
    [StringLength(100)]
    public string FullName { get; set; } = string.Empty;

    [Required]
    [Phone]
    [StringLength(20)]
    public string Phone { get; set; } = string.Empty;

    [Required]
    [StringLength(255)]
    public string AddressLine1 { get; set; } = string.Empty;

    [StringLength(255)]
    public string? AddressLine2 { get; set; }

    [Required]
    [StringLength(100)]
    public string City { get; set; } = string.Empty;

    [Required]
    [StringLength(100)]
    public string State { get; set; } = string.Empty;

    [Required]
    [StringLength(20)]
    public string PostalCode { get; set; } = string.Empty;

    [Required]
    [StringLength(100)]
    public string Country { get; set; } = "India";

    [Required]
    [RegularExpression("^(Home|Work|Other)$")]
    public string AddressType { get; set; } = "Home";
}