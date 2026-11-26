using System.Text.Json;
using TechOdyssey.Application.Abstractions;

namespace TechOdyssey.Infrastructure.Persistence;

public sealed class JsonGamificationStore : IGamificationStore
{
    private const int PointsPerLevel = 500;
    private const string LegacyTechnologyCode = "rpg";
    private const string LegacyM01ModuleCode = "M01";
    private static readonly IReadOnlyDictionary<string, int> ModuleCompletionRewards =
        new Dictionary<string, int>(StringComparer.Ordinal)
        {
            ["rpg/M00"] = 100,
            ["rpg/M01"] = 100,
            ["rpg/M02"] = 100
        };
    private static readonly UnixFileMode PrivateDirectoryMode =
        UnixFileMode.UserRead | UnixFileMode.UserWrite | UnixFileMode.UserExecute;
    private static readonly UnixFileMode PrivateFileMode =
        UnixFileMode.UserRead | UnixFileMode.UserWrite;

    private static readonly JsonSerializerOptions JsonOptions = new()
    {
        PropertyNameCaseInsensitive = true,
        WriteIndented = true
    };

    private readonly string _dataFilePath;
    private readonly SemaphoreSlim _gate = new(1, 1);

    public JsonGamificationStore(string dataDirectory)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(dataDirectory);
        _dataFilePath = Path.Combine(Path.GetFullPath(dataDirectory), "gamification.json");
    }

    public async Task<LearnerAccount?> FindAccountByEmailAsync(
        string email,
        CancellationToken cancellationToken = default)
    {
        await _gate.WaitAsync(cancellationToken);
        try
        {
            var document = await ReadDocumentAsync(cancellationToken);
            return document.Accounts.FirstOrDefault(
                account => string.Equals(account.Email, email, StringComparison.OrdinalIgnoreCase));
        }
        finally
        {
            _gate.Release();
        }
    }

    public async Task<LearnerAccount?> FindAccountByIdAsync(
        Guid userId,
        CancellationToken cancellationToken = default)
    {
        await _gate.WaitAsync(cancellationToken);
        try
        {
            var document = await ReadDocumentAsync(cancellationToken);
            return document.Accounts.FirstOrDefault(account => account.Id == userId);
        }
        finally
        {
            _gate.Release();
        }
    }

    public async Task<LearnerAccount?> CreateAccountAsync(
        string email,
        string passwordHash,
        CancellationToken cancellationToken = default)
    {
        await _gate.WaitAsync(cancellationToken);
        try
        {
            var document = await ReadDocumentAsync(cancellationToken);
            if (document.Accounts.Any(
                    account => string.Equals(account.Email, email, StringComparison.OrdinalIgnoreCase)))
            {
                return null;
            }

            var account = new LearnerAccount(Guid.NewGuid(), email, passwordHash);
            document.Accounts.Add(account);
            document.Progress.Add(new PersistedProgress { UserId = account.Id });
            await WriteDocumentAsync(document, cancellationToken);
            return account;
        }
        finally
        {
            _gate.Release();
        }
    }

    public async Task<bool> ResetPasswordAsync(
        string email,
        string passwordHash,
        CancellationToken cancellationToken = default)
    {
        await _gate.WaitAsync(cancellationToken);
        try
        {
            var document = await ReadDocumentAsync(cancellationToken);
            var accountIndex = document.Accounts.FindIndex(
                account => string.Equals(account.Email, email, StringComparison.OrdinalIgnoreCase));
            if (accountIndex < 0)
            {
                return false;
            }

            var account = document.Accounts[accountIndex];
            document.Accounts[accountIndex] = account with
            {
                PasswordHash = passwordHash,
                PasswordVersion = checked(account.PasswordVersion + 1)
            };
            await WriteDocumentAsync(document, cancellationToken);
            return true;
        }
        finally
        {
            _gate.Release();
        }
    }

    public async Task<LearnerProgress> GetProgressAsync(
        Guid userId,
        CancellationToken cancellationToken = default)
    {
        await _gate.WaitAsync(cancellationToken);
        try
        {
            var document = await ReadDocumentAsync(cancellationToken);
            var progress = document.Progress.FirstOrDefault(item => item.UserId == userId);
            return ToSnapshot(progress ?? new PersistedProgress { UserId = userId });
        }
        finally
        {
            _gate.Release();
        }
    }

    public async Task<CommunitySnapshot> GetCommunitySnapshotAsync(
        int leaderboardLimit,
        CancellationToken cancellationToken = default)
    {
        ArgumentOutOfRangeException.ThrowIfLessThan(leaderboardLimit, 1);
        ArgumentOutOfRangeException.ThrowIfGreaterThan(leaderboardLimit, 10);

        await _gate.WaitAsync(cancellationToken);
        try
        {
            var document = await ReadDocumentAsync(cancellationToken);
            var participants = document.Accounts
                .Select(account =>
                {
                    var progress = document.Progress.FirstOrDefault(
                        item => item.UserId == account.Id);
                    var snapshot = ToSnapshot(
                        progress ?? new PersistedProgress { UserId = account.Id });
                    return new LeaderboardEntry(
                        0,
                        account.Email,
                        snapshot.ExperiencePoints,
                        snapshot.Level,
                        snapshot.CompletedModules.Count);
                })
                .ToArray();
            var leaderboard = participants
                .OrderByDescending(participant => participant.ExperiencePoints)
                .ThenByDescending(participant => participant.CompletedModuleCount)
                .ThenBy(participant => participant.Email, StringComparer.OrdinalIgnoreCase)
                .Take(leaderboardLimit)
                .Select((participant, index) => participant with { Position = index + 1 })
                .ToArray();

            return new CommunitySnapshot(
                participants.Length,
                participants.Sum(participant => (long)participant.CompletedModuleCount),
                participants.Sum(participant => (long)participant.ExperiencePoints),
                leaderboard);
        }
        finally
        {
            _gate.Release();
        }
    }

    public async Task<ModuleCompletion> CompleteModuleAsync(
        Guid userId,
        string technologyCode,
        string moduleCode,
        CancellationToken cancellationToken = default)
    {
        await _gate.WaitAsync(cancellationToken);
        try
        {
            var document = await ReadDocumentAsync(cancellationToken);
            if (!document.Accounts.Any(account => account.Id == userId))
            {
                throw new InvalidOperationException("The authenticated learner account does not exist.");
            }

            var progress = document.Progress.FirstOrDefault(item => item.UserId == userId);
            if (progress is null)
            {
                progress = new PersistedProgress { UserId = userId };
                document.Progress.Add(progress);
            }

            var moduleKey = GetModuleKey(technologyCode, moduleCode);
            if (progress.CompletedModules.Contains(moduleKey, StringComparer.Ordinal)
                || IsLegacyModuleComplete(progress, technologyCode, moduleCode))
            {
                return new ModuleCompletion(ToSnapshot(progress), 0);
            }

            var pointsAwarded = ModuleCompletionRewards.GetValueOrDefault(moduleKey);
            progress.CompletedModules.Add(moduleKey);
            progress.ExperiencePoints += pointsAwarded;
            await WriteDocumentAsync(document, cancellationToken);
            return new ModuleCompletion(ToSnapshot(progress), pointsAwarded);
        }
        finally
        {
            _gate.Release();
        }
    }

    public async Task<IReadOnlyList<string>> GetCompletedUnitsAsync(
        Guid userId,
        string technologyCode,
        string moduleCode,
        CancellationToken cancellationToken = default)
    {
        await _gate.WaitAsync(cancellationToken);
        try
        {
            var document = await ReadDocumentAsync(cancellationToken);
            var progress = document.Progress.FirstOrDefault(item => item.UserId == userId);
            if (progress is null)
            {
                return [];
            }

            var unitPrefix = $"{GetModuleKey(technologyCode, moduleCode)}/";
            var units = progress.CompletedUnits
                .Where(unit => unit.StartsWith(unitPrefix, StringComparison.Ordinal))
                .Select(unit => unit[unitPrefix.Length..]);

            if (IsLegacyM01(technologyCode, moduleCode))
            {
                units = units.Concat(progress.M01CompletedSections);
            }

            return units.Distinct(StringComparer.Ordinal).ToArray();
        }
        finally
        {
            _gate.Release();
        }
    }

    public async Task<bool> CompleteUnitAsync(
        Guid userId,
        string technologyCode,
        string moduleCode,
        string unitCode,
        CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(unitCode))
        {
            return false;
        }

        await _gate.WaitAsync(cancellationToken);
        try
        {
            var document = await ReadDocumentAsync(cancellationToken);
            if (!document.Accounts.Any(account => account.Id == userId))
            {
                throw new InvalidOperationException("The authenticated learner account does not exist.");
            }

            var progress = document.Progress.FirstOrDefault(item => item.UserId == userId);
            if (progress is null)
            {
                progress = new PersistedProgress { UserId = userId };
                document.Progress.Add(progress);
            }

            var unitKey = GetUnitKey(technologyCode, moduleCode, unitCode);
            var isLegacyUnit = IsLegacyM01(technologyCode, moduleCode)
                               && progress.M01CompletedSections.Contains(
                                   unitCode,
                                   StringComparer.Ordinal);
            if (!progress.CompletedUnits.Contains(unitKey, StringComparer.Ordinal)
                && !isLegacyUnit)
            {
                progress.CompletedUnits.Add(unitKey);
                await WriteDocumentAsync(document, cancellationToken);
            }
            return true;
        }
        finally
        {
            _gate.Release();
        }
    }

    private async Task<StoreDocument> ReadDocumentAsync(CancellationToken cancellationToken)
    {
        if (!File.Exists(_dataFilePath))
        {
            return new StoreDocument();
        }

        await using var stream = new FileStream(
            _dataFilePath,
            FileMode.Open,
            FileAccess.Read,
            FileShare.Read,
            bufferSize: 4096,
            useAsync: true);

        return await JsonSerializer.DeserializeAsync<StoreDocument>(
                   stream,
                   JsonOptions,
                   cancellationToken)
               ?? throw new InvalidDataException("Gamification data file contains an empty JSON document.");
    }

    private async Task WriteDocumentAsync(
        StoreDocument document,
        CancellationToken cancellationToken)
    {
        var directory = Path.GetDirectoryName(_dataFilePath)
                        ?? throw new InvalidOperationException("Gamification data directory is invalid.");
        Directory.CreateDirectory(directory);
        if (!OperatingSystem.IsWindows())
        {
            File.SetUnixFileMode(directory, PrivateDirectoryMode);
        }

        var temporaryPath = $"{_dataFilePath}.{Guid.NewGuid():N}.tmp";
        try
        {
            var options = new FileStreamOptions
            {
                Mode = FileMode.CreateNew,
                Access = FileAccess.Write,
                Share = FileShare.None,
                Options = FileOptions.Asynchronous
            };
            if (!OperatingSystem.IsWindows())
            {
                options.UnixCreateMode = PrivateFileMode;
            }

            await using (var stream = new FileStream(temporaryPath, options))
            {
                await JsonSerializer.SerializeAsync(stream, document, JsonOptions, cancellationToken);
                await stream.FlushAsync(cancellationToken);
            }

            File.Move(temporaryPath, _dataFilePath, overwrite: true);
            if (!OperatingSystem.IsWindows())
            {
                File.SetUnixFileMode(_dataFilePath, PrivateFileMode);
            }
        }
        finally
        {
            if (File.Exists(temporaryPath))
            {
                File.Delete(temporaryPath);
            }
        }
    }

    private static LearnerProgress ToSnapshot(PersistedProgress progress)
    {
        return new LearnerProgress(
            progress.ExperiencePoints,
            1 + progress.ExperiencePoints / PointsPerLevel,
            progress.CompletedModules
                .Select(module => module.Contains('/')
                    ? module
                    : GetModuleKey(LegacyTechnologyCode, module))
                .Distinct(StringComparer.Ordinal)
                .ToArray());
    }

    private static string GetModuleKey(string technologyCode, string moduleCode)
    {
        return $"{technologyCode}/{moduleCode}";
    }

    private static string GetUnitKey(
        string technologyCode,
        string moduleCode,
        string unitCode)
    {
        return $"{GetModuleKey(technologyCode, moduleCode)}/{unitCode}";
    }

    private static bool IsLegacyModuleComplete(
        PersistedProgress progress,
        string technologyCode,
        string moduleCode)
    {
        return string.Equals(technologyCode, LegacyTechnologyCode, StringComparison.Ordinal)
               && progress.CompletedModules.Contains(moduleCode, StringComparer.Ordinal);
    }

    private static bool IsLegacyM01(string technologyCode, string moduleCode)
    {
        return string.Equals(technologyCode, LegacyTechnologyCode, StringComparison.Ordinal)
               && string.Equals(moduleCode, LegacyM01ModuleCode, StringComparison.Ordinal);
    }

    private sealed class StoreDocument
    {
        public List<LearnerAccount> Accounts { get; set; } = [];

        public List<PersistedProgress> Progress { get; set; } = [];
    }

    private sealed class PersistedProgress
    {
        public Guid UserId { get; set; }

        public int ExperiencePoints { get; set; }

        public List<string> CompletedModules { get; set; } = [];

        public List<string> CompletedUnits { get; set; } = [];

        public List<string> M01CompletedSections { get; set; } = [];
    }
}
