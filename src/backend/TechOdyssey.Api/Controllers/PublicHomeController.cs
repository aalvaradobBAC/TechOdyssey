using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using TechOdyssey.Api.Models;
using TechOdyssey.Application.Abstractions;

namespace TechOdyssey.Api.Controllers;

[ApiController]
[AllowAnonymous]
[Route("api/public")]
public sealed class PublicHomeController(
    IGamificationStore store,
    IOptions<PublicHomeOptions> options) : ControllerBase
{
    [HttpGet("home")]
    public async Task<ActionResult<PublicHomeResponse>> Get(CancellationToken cancellationToken)
    {
        var content = options.Value;
        var community = await store.GetCommunitySnapshotAsync(
            content.LeaderboardLimit,
            cancellationToken);
        var response = new PublicHomeResponse(
            content,
            new PublicHomeStatistics(
                community.ParticipantCount,
                community.CompletedModuleCount,
                community.TotalExperiencePoints,
                content.Technologies.Count(technology => technology.Status == "active")),
            community.Leaderboard,
            DateTimeOffset.UtcNow);
        Response.Headers["Cache-Control"] = "no-store";
        return Ok(response);
    }
}
