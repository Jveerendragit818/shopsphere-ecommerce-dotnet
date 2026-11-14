using System.ComponentModel.DataAnnotations;

namespace ShopSphere.Core.DTOs;

public sealed class CreateReviewRequestDto
{
    [Range(1, 5)]
    public byte Rating { get; set; }

    public string? ReviewTitle { get; set; }

    public string? ReviewText { get; set; }
}