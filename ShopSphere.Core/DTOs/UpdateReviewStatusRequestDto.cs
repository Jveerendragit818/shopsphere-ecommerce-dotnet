using System.ComponentModel.DataAnnotations;

namespace ShopSphere.Core.DTOs;

public sealed class UpdateReviewStatusRequestDto
{
    [Required]
    public string ReviewStatus { get; set; } = string.Empty;
}