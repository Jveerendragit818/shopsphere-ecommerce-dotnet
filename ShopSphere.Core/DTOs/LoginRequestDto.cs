using System.ComponentModel.DataAnnotations;

namespace ShopSphere.Core.DTOs;

public class LoginRequestDto
{
    [Required]
    [EmailAddress]
    [StringLength(150)]
    public string Email { get; set; } = string.Empty;

    [Required]
    public string Password { get; set; } = string.Empty;
}