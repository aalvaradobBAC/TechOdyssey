using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TechOdyssey.Application.Abstractions;

namespace TechOdyssey.Api.Controllers;

[ApiController]
[Authorize]
[Route("api/progress")]
public sealed class ProgressController(IGamificationStore store) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<LearnerProgress>> Get(CancellationToken cancellationToken)
    {
        if (!TryGetUserId(out var userId))
        {
            return Unauthorized();
        }

        Response.Headers["Cache-Control"] = "no-store";
        return Ok(await store.GetProgressAsync(userId, cancellationToken));
    }

    [HttpPost("m00/complete")]
    public async Task<ActionResult<CompleteM00Response>> CompleteM00(
        CancellationToken cancellationToken)
    {
        if (!TryGetUserId(out var userId))
        {
            return Unauthorized();
        }

        var completion = await store.CompleteModuleAsync(
            userId,
            "rpg",
            "M00",
            cancellationToken);
        Response.Headers["Cache-Control"] = "no-store";
        return Ok(new CompleteM00Response(completion.PointsAwarded, completion.Progress));
    }

    [HttpPost("m01/complete")]
    public async Task<ActionResult<CompleteM01Response>> CompleteM01(
        CancellationToken cancellationToken)
    {
        if (!TryGetUserId(out var userId))
        {
            return Unauthorized();
        }

        var completion = await store.CompleteModuleAsync(
            userId,
            "rpg",
            "M01",
            cancellationToken);
        Response.Headers["Cache-Control"] = "no-store";
        return Ok(new CompleteM01Response(completion.PointsAwarded, completion.Progress));
    }

    [HttpPost("{technologyCode}/{moduleCode}/complete")]
    public async Task<ActionResult<CompleteModuleResponse>> CompleteModule(
        string technologyCode,
        string moduleCode,
        CancellationToken cancellationToken)
    {
        if (!TryGetUserId(out var userId))
        {
            return Unauthorized();
        }

        if (!IsValidCode(technologyCode) || !IsValidCode(moduleCode))
        {
            return BadRequest("Technology and module codes must be valid identifiers.");
        }

        var completion = await store.CompleteModuleAsync(
            userId,
            technologyCode,
            moduleCode,
            cancellationToken);
        Response.Headers["Cache-Control"] = "no-store";
        return Ok(new CompleteModuleResponse(completion.PointsAwarded, completion.Progress));
    }

    [HttpGet("{technologyCode}/{moduleCode}/units")]
    public async Task<ActionResult<CompletedUnitsResponse>> GetCompletedUnits(
        string technologyCode,
        string moduleCode,
        CancellationToken cancellationToken)
    {
        if (!TryGetUserId(out var userId))
        {
            return Unauthorized();
        }

        if (!IsValidCode(technologyCode) || !IsValidCode(moduleCode))
        {
            return BadRequest("Technology and module codes must be valid identifiers.");
        }

        var units = await store.GetCompletedUnitsAsync(
            userId,
            technologyCode,
            moduleCode,
            cancellationToken);
        Response.Headers["Cache-Control"] = "no-store";
        return Ok(new CompletedUnitsResponse(units));
    }

    [HttpPost("{technologyCode}/{moduleCode}/units/{unitCode}/complete")]
    public async Task<ActionResult<UnitCompletionResponse>> CompleteUnit(
        string technologyCode,
        string moduleCode,
        string unitCode,
        CancellationToken cancellationToken)
    {
        if (!TryGetUserId(out var userId))
        {
            return Unauthorized();
        }

        if (!IsValidCode(technologyCode)
            || !IsValidCode(moduleCode)
            || !IsValidCode(unitCode))
        {
            return BadRequest("Technology, module, and unit codes must be valid identifiers.");
        }

        var completed = await store.CompleteUnitAsync(
            userId,
            technologyCode,
            moduleCode,
            unitCode,
            cancellationToken);
        Response.Headers["Cache-Control"] = "no-store";
        return Ok(new UnitCompletionResponse(completed));
    }

    [HttpGet("m01/sections")]
    public async Task<ActionResult<M01SectionsResponse>> GetM01Sections(
        CancellationToken cancellationToken)
    {
        if (!TryGetUserId(out var userId))
        {
            return Unauthorized();
        }

        var sections = await store.GetCompletedUnitsAsync(
            userId,
            "rpg",
            "M01",
            cancellationToken);
        Response.Headers["Cache-Control"] = "no-store";
        return Ok(new M01SectionsResponse(sections));
    }

    [HttpPost("m01/sections/{sectionId}/complete")]
    public async Task<ActionResult<M01SectionCompletionResponse>> CompleteM01Section(
        string sectionId,
        CancellationToken cancellationToken)
    {
        if (!TryGetUserId(out var userId))
        {
            return Unauthorized();
        }

        var completed = await store.CompleteUnitAsync(
            userId,
            "rpg",
            "M01",
            sectionId,
            cancellationToken);
        Response.Headers["Cache-Control"] = "no-store";
        return Ok(new M01SectionCompletionResponse(completed));
    }

    private bool TryGetUserId(out Guid userId)
    {
        return Guid.TryParse(User.FindFirstValue(ClaimTypes.NameIdentifier), out userId);
    }

    private static bool IsValidCode(string code)
    {
        return code.Length is > 0 and <= 64
               && char.IsAsciiLetterOrDigit(code[0])
               && code.All(character =>
                   char.IsAsciiLetterOrDigit(character)
                   || character is '-' or '_');
    }
}

public sealed record CompleteM00Response(int PointsAwarded, LearnerProgress Progress);
public sealed record CompleteM01Response(int PointsAwarded, LearnerProgress Progress);
public sealed record CompleteModuleResponse(int PointsAwarded, LearnerProgress Progress);
public sealed record CompletedUnitsResponse(IReadOnlyList<string> CompletedUnits);
public sealed record UnitCompletionResponse(bool Completed);
public sealed record M01SectionsResponse(IReadOnlyList<string> CompletedSections);
public sealed record M01SectionCompletionResponse(bool Completed);
