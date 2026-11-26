namespace TechOdyssey.Application.Abstractions;

public interface ITechnologyRuntime
{
    string TechnologyCode { get; }

    Task<ValidationResult> ValidateAsync(
        ValidationRequest request,
        CancellationToken cancellationToken);
}

public sealed record ValidationRequest(
    string TechnologyCode,
    string ChallengeCode,
    string SourcePath,
    string SessionId);

public sealed record ValidationResult(
    bool Succeeded,
    int Score,
    IReadOnlyCollection<ValidationMessage> Messages);

public sealed record ValidationMessage(
    string Code,
    string Category,
    string Message,
    string? LearningHint);
