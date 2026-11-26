namespace TechOdyssey.Application.Abstractions;

public interface IGamificationStore
{
    Task<LearnerAccount?> FindAccountByEmailAsync(
        string email,
        CancellationToken cancellationToken = default);

    Task<LearnerAccount?> FindAccountByIdAsync(
        Guid userId,
        CancellationToken cancellationToken = default);

    Task<LearnerAccount?> CreateAccountAsync(
        string email,
        string passwordHash,
        CancellationToken cancellationToken = default);

    Task<bool> ResetPasswordAsync(
        string email,
        string passwordHash,
        CancellationToken cancellationToken = default);

    Task<LearnerProgress> GetProgressAsync(
        Guid userId,
        CancellationToken cancellationToken = default);

    Task<CommunitySnapshot> GetCommunitySnapshotAsync(
        int leaderboardLimit,
        CancellationToken cancellationToken = default);

    Task<ModuleCompletion> CompleteModuleAsync(
        Guid userId,
        string technologyCode,
        string moduleCode,
        CancellationToken cancellationToken = default);

    Task<IReadOnlyList<string>> GetCompletedUnitsAsync(
        Guid userId,
        string technologyCode,
        string moduleCode,
        CancellationToken cancellationToken = default);

    Task<bool> CompleteUnitAsync(
        Guid userId,
        string technologyCode,
        string moduleCode,
        string unitCode,
        CancellationToken cancellationToken = default);
}

public sealed record LearnerAccount(
    Guid Id,
    string Email,
    string PasswordHash,
    int PasswordVersion = 0);

public sealed record LearnerProgress(
    int ExperiencePoints,
    int Level,
    IReadOnlyList<string> CompletedModules);

public sealed record ModuleCompletion(LearnerProgress Progress, int PointsAwarded);

public sealed record CommunitySnapshot(
    int ParticipantCount,
    long CompletedModuleCount,
    long TotalExperiencePoints,
    IReadOnlyList<LeaderboardEntry> Leaderboard);

public sealed record LeaderboardEntry(
    int Position,
    string Email,
    int ExperiencePoints,
    int Level,
    int CompletedModuleCount);
