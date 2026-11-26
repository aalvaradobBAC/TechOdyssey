using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.Extensions.Options;
using TechOdyssey.Api.Models;
using TechOdyssey.Api.Security;
using TechOdyssey.Application.Abstractions;

namespace TechOdyssey.Api.Controllers;

[ApiController]
[Authorize]
[Route("api/admin")]
public sealed class AdminController(
    IGamificationStore store,
    IOptions<AdminResetOptions> adminOptions) : ControllerBase
{
    [HttpPost("recover-account")]
    [AllowAnonymous]
    [EnableRateLimiting("authentication")]
    public async Task<ActionResult<AdminAccountRecoveryResponse>> RecoverAdminAccount(
        AdminAccountRecoveryRequest request,
        [FromHeader(Name = "X-Admin-Reset-Key")] string? resetKey,
        CancellationToken cancellationToken)
    {
        var options = adminOptions.Value;
        if (!options.IsConfigured)
        {
            return StatusCode(StatusCodes.Status503ServiceUnavailable, new ProblemDetails
            {
                Title = "Administrator password recovery is not configured.",
                Status = StatusCodes.Status503ServiceUnavailable
            });
        }

        if (!options.HasValidSecret(resetKey))
        {
            return Forbid();
        }

        var reset = await store.ResetPasswordAsync(
            options.Email.Trim().ToLowerInvariant(),
            PasswordHasher.Hash(request.NewPassword),
            cancellationToken);
        if (!reset)
        {
            return NotFound(new ProblemDetails
            {
                Title = "The configured administrator account was not found.",
                Status = StatusCodes.Status404NotFound
            });
        }

        Response.Headers["Cache-Control"] = "no-store";
        return Ok(new AdminAccountRecoveryResponse(options.Email));
    }

    [HttpPost("password-reset")]
    [EnableRateLimiting("authentication")]
    public async Task<IActionResult> ResetPassword(
        AdminPasswordResetRequest request,
        [FromHeader(Name = "X-Admin-Reset-Key")] string? resetKey,
        CancellationToken cancellationToken)
    {
        var options = adminOptions.Value;
        if (!options.IsConfigured)
        {
            return StatusCode(StatusCodes.Status503ServiceUnavailable, new ProblemDetails
            {
                Title = "Administrator password reset is not configured.",
                Status = StatusCodes.Status503ServiceUnavailable
            });
        }

        var adminEmail = User.FindFirstValue(ClaimTypes.Email);
        if (adminEmail is null || !options.CanResetPasswordsFor(adminEmail))
        {
            return Forbid();
        }

        if (!options.HasValidSecret(resetKey))
        {
            return Forbid();
        }

        var targetEmail = request.TargetEmail.Trim().ToLowerInvariant();
        if (string.Equals(targetEmail, adminEmail, StringComparison.OrdinalIgnoreCase))
        {
            return BadRequest(new ProblemDetails
            {
                Title = "Use this recovery flow only for another user's account.",
                Status = StatusCodes.Status400BadRequest
            });
        }

        var reset = await store.ResetPasswordAsync(
            targetEmail,
            PasswordHasher.Hash(request.NewPassword),
            cancellationToken);
        if (!reset)
        {
            return NotFound(new ProblemDetails
            {
                Title = "The target account was not found.",
                Status = StatusCodes.Status404NotFound
            });
        }

        Response.Headers["Cache-Control"] = "no-store";
        return NoContent();
    }
}

public sealed record AdminAccountRecoveryResponse(string Email);
