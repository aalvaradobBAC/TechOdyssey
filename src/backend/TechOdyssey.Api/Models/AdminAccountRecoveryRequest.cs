using System.ComponentModel.DataAnnotations;

namespace TechOdyssey.Api.Models;

public sealed class AdminAccountRecoveryRequest
{
    [Required]
    [MinLength(12)]
    [MaxLength(128)]
    public string NewPassword { get; init; } = string.Empty;
}
