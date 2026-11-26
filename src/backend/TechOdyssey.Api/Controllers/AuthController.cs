using System.Security.Claims;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.Extensions.Options;
using TechOdyssey.Api.Models;
using TechOdyssey.Api.Security;
using TechOdyssey.Application.Abstractions;

namespace TechOdyssey.Api.Controllers;

[ApiController]
[Route("api/auth")]
public sealed class AuthController(
    IGamificationStore store,
    IOptions<AdminResetOptions> adminOptions) : ControllerBase
{
    [HttpPost("register")]
    [AllowAnonymous]
    [EnableRateLimiting("authentication")]
    public async Task<ActionResult<AuthResponse>> Register(
        CredentialsRequest request,
        CancellationToken cancellationToken)
    {
        var email = NormalizeEmail(request.Email);
        var account = await store.CreateAccountAsync(
            email,
            PasswordHasher.Hash(request.Password),
            cancellationToken);
        if (account is null)
        {
            return Conflict(new ProblemDetails
            {
                Title = "An account with this email already exists.",
                Status = StatusCodes.Status409Conflict
            });
        }

        return await CreateSessionAsync(account, cancellationToken);
    }

    [HttpPost("login")]
    [AllowAnonymous]
    [EnableRateLimiting("authentication")]
    public async Task<ActionResult<AuthResponse>> Login(
        CredentialsRequest request,
        CancellationToken cancellationToken)
    {
        var account = await store.FindAccountByEmailAsync(
            NormalizeEmail(request.Email),
            cancellationToken);
        if (account is null || !PasswordHasher.Verify(request.Password, account.PasswordHash))
        {
            return Unauthorized(new ProblemDetails
            {
                Title = "The email or password is incorrect.",
                Status = StatusCodes.Status401Unauthorized
            });
        }

        return await CreateSessionAsync(account, cancellationToken);
    }

    [HttpGet("me")]
    [Authorize]
    public async Task<ActionResult<AuthResponse>> Me(CancellationToken cancellationToken)
    {
        if (!TryGetUserId(out var userId))
        {
            return Unauthorized();
        }

        var email = User.FindFirstValue(ClaimTypes.Email);
        if (email is null)
        {
            return Unauthorized();
        }

        var progress = await store.GetProgressAsync(userId, cancellationToken);
        Response.Headers["Cache-Control"] = "no-store";
        return Ok(ToResponse(email, progress));
    }

    [HttpPost("logout")]
    [Authorize]
    public async Task<IActionResult> Logout()
    {
        await HttpContext.SignOutAsync(CookieAuthenticationDefaults.AuthenticationScheme);
        return NoContent();
    }

    private async Task<ActionResult<AuthResponse>> CreateSessionAsync(
        Application.Abstractions.LearnerAccount account,
        CancellationToken cancellationToken)
    {
        var claims = new[]
        {
            new Claim(ClaimTypes.NameIdentifier, account.Id.ToString()),
            new Claim(ClaimTypes.Email, account.Email),
            new Claim(ClaimTypes.Name, account.Email),
            new Claim("password_version", account.PasswordVersion.ToString(
                System.Globalization.CultureInfo.InvariantCulture))
        };
        var principal = new ClaimsPrincipal(
            new ClaimsIdentity(claims, CookieAuthenticationDefaults.AuthenticationScheme));
        var expiresAt = DateTimeOffset.UtcNow.AddDays(14);

        await HttpContext.SignInAsync(
            CookieAuthenticationDefaults.AuthenticationScheme,
            principal,
            new AuthenticationProperties
            {
                IsPersistent = true,
                ExpiresUtc = expiresAt
            });

        var progress = await store.GetProgressAsync(account.Id, cancellationToken);
        Response.Headers["Cache-Control"] = "no-store";
        return Ok(ToResponse(account.Email, progress));
    }

    private AuthResponse ToResponse(string email, LearnerProgress progress)
    {
        return new AuthResponse(
            email,
            progress.ExperiencePoints,
            progress.Level,
            progress.CompletedModules,
            adminOptions.Value.CanResetPasswordsFor(email));
    }

    private bool TryGetUserId(out Guid userId)
    {
        return Guid.TryParse(User.FindFirstValue(ClaimTypes.NameIdentifier), out userId);
    }

    private static string NormalizeEmail(string email)
    {
        return email.Trim().ToLowerInvariant();
    }
}

public sealed record AuthResponse(
    string Email,
    int ExperiencePoints,
    int Level,
    IReadOnlyList<string> CompletedModules,
    bool CanResetPasswords);
