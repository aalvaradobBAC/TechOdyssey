using System.ComponentModel.DataAnnotations;

namespace TechOdyssey.Api.Models;

public sealed class AdminPasswordResetRequest
{
    [Required]
    [EmailAddress]
    [StringLength(254)]
    public string TargetEmail { get; init; } = string.Empty;

    [Required]
    [MinLength(12)]
    [MaxLength(128)]
    public string NewPassword { get; init; } = string.Empty;
}
