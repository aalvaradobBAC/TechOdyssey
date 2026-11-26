using System.ComponentModel.DataAnnotations;

namespace TechOdyssey.Api.Models;

public sealed class CredentialsRequest
{
    [Required]
    [EmailAddress]
    [StringLength(254)]
    public string Email { get; init; } = string.Empty;

    [Required]
    [MinLength(12)]
    [MaxLength(128)]
    public string Password { get; init; } = string.Empty;
}
