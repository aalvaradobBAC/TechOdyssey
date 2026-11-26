using System.Security.Cryptography;
using System.Text;

namespace TechOdyssey.Api.Security;

public sealed class AdminResetOptions
{
    public const string SectionName = "Admin";

    public string Email { get; set; } = string.Empty;

    public string ResetSecret { get; set; } = string.Empty;

    public bool IsConfigured =>
        !string.IsNullOrWhiteSpace(Email)
        && Encoding.UTF8.GetByteCount(ResetSecret) >= 32;

    public bool CanResetPasswordsFor(string email)
    {
        return IsConfigured
               && string.Equals(email.Trim(), Email.Trim(), StringComparison.OrdinalIgnoreCase);
    }

    public bool HasValidSecret(string? suppliedSecret)
    {
        if (!IsConfigured || string.IsNullOrEmpty(suppliedSecret))
        {
            return false;
        }

        var expectedBytes = Encoding.UTF8.GetBytes(ResetSecret);
        var suppliedBytes = Encoding.UTF8.GetBytes(suppliedSecret);
        return expectedBytes.Length == suppliedBytes.Length
               && CryptographicOperations.FixedTimeEquals(expectedBytes, suppliedBytes);
    }
}
