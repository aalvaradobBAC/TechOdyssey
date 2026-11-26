using TechOdyssey.Infrastructure.Persistence;

namespace TechOdyssey.Api.IntegrationTests;

public sealed class JsonGamificationStoreTests
{
    [Fact]
    public async Task M00CompletionAwardsPointsOnceAndSurvivesStoreRestart()
    {
        var directory = Path.Combine(
            Path.GetTempPath(),
            $"techodyssey-tests-{Guid.NewGuid():N}");

        try
        {
            var store = new JsonGamificationStore(directory);
            var account = await store.CreateAccountAsync("learner@example.com", "password-hash");

            Assert.NotNull(account);

            var initial = await store.GetProgressAsync(account.Id);
            Assert.Equal(0, initial.ExperiencePoints);
            Assert.Equal(1, initial.Level);

            var firstCompletion = await store.CompleteModuleAsync(account.Id, "rpg", "M00");
            Assert.Equal(100, firstCompletion.PointsAwarded);
            Assert.Equal(100, firstCompletion.Progress.ExperiencePoints);
            Assert.Contains("rpg/M00", firstCompletion.Progress.CompletedModules);

            var repeatedCompletion = await store.CompleteModuleAsync(account.Id, "rpg", "M00");
            Assert.Equal(0, repeatedCompletion.PointsAwarded);
            Assert.Equal(100, repeatedCompletion.Progress.ExperiencePoints);

            var restartedStore = new JsonGamificationStore(directory);
            var restored = await restartedStore.GetProgressAsync(account.Id);
            Assert.Equal(100, restored.ExperiencePoints);
            Assert.Equal(1, restored.Level);
            Assert.Contains("rpg/M00", restored.CompletedModules);

            var reset = await restartedStore.ResetPasswordAsync(
                account.Email,
                "replacement-password-hash");

            Assert.True(reset);
            var accountAfterReset = await restartedStore.FindAccountByIdAsync(account.Id);
            Assert.NotNull(accountAfterReset);
            Assert.Equal("replacement-password-hash", accountAfterReset.PasswordHash);
            Assert.Equal(account.PasswordVersion + 1, accountAfterReset.PasswordVersion);
            var progressAfterReset = await restartedStore.GetProgressAsync(account.Id);
            Assert.Equal(restored.ExperiencePoints, progressAfterReset.ExperiencePoints);
            Assert.Equal(restored.Level, progressAfterReset.Level);
            Assert.Equal(restored.CompletedModules, progressAfterReset.CompletedModules);
        }
        finally
        {
            if (Directory.Exists(directory))
            {
                Directory.Delete(directory, recursive: true);
            }
        }
    }

    [Fact]
    public async Task M01CompletionAwardsPointsOnceAndKeepsM00Progress()
    {
        var directory = Path.Combine(
            Path.GetTempPath(),
            $"techodyssey-tests-{Guid.NewGuid():N}");

        try
        {
            var store = new JsonGamificationStore(directory);
            var account = await store.CreateAccountAsync("learner@example.com", "password-hash");

            Assert.NotNull(account);

            var m00 = await store.CompleteModuleAsync(account.Id, "rpg", "M00");
            Assert.Equal(100, m00.PointsAwarded);

            var firstM01 = await store.CompleteModuleAsync(account.Id, "rpg", "M01");
            Assert.Equal(100, firstM01.PointsAwarded);
            Assert.Equal(200, firstM01.Progress.ExperiencePoints);
            Assert.Equal(1, firstM01.Progress.Level);
            Assert.Contains("rpg/M00", firstM01.Progress.CompletedModules);
            Assert.Contains("rpg/M01", firstM01.Progress.CompletedModules);

            var repeatedM01 = await store.CompleteModuleAsync(account.Id, "rpg", "M01");
            Assert.Equal(0, repeatedM01.PointsAwarded);
            Assert.Equal(200, repeatedM01.Progress.ExperiencePoints);

            Assert.True(await store.CompleteUnitAsync(account.Id, "rpg", "M01", "M01-S03"));
            Assert.Contains(
                "M01-S03",
                await store.GetCompletedUnitsAsync(account.Id, "rpg", "M01"));
        }
        finally
        {
            if (Directory.Exists(directory))
            {
                Directory.Delete(directory, recursive: true);
            }
        }
    }

    [Fact]
    public async Task M02CompletionAwardsPointsOnce()
    {
        var directory = Path.Combine(
            Path.GetTempPath(),
            $"techodyssey-tests-{Guid.NewGuid():N}");

        try
        {
            var store = new JsonGamificationStore(directory);
            var account = await store.CreateAccountAsync("learner@example.com", "password-hash");

            Assert.NotNull(account);

            var firstCompletion = await store.CompleteModuleAsync(account.Id, "rpg", "M02");
            Assert.Equal(100, firstCompletion.PointsAwarded);
            Assert.Equal(100, firstCompletion.Progress.ExperiencePoints);
            Assert.Contains("rpg/M02", firstCompletion.Progress.CompletedModules);

            var repeatedCompletion = await store.CompleteModuleAsync(account.Id, "rpg", "M02");
            Assert.Equal(0, repeatedCompletion.PointsAwarded);
            Assert.Equal(100, repeatedCompletion.Progress.ExperiencePoints);
        }
        finally
        {
            if (Directory.Exists(directory))
            {
                Directory.Delete(directory, recursive: true);
            }
        }
    }

    [Fact]
    public async Task M01SectionProgressIsIsolatedPerAccount()
    {
        var directory = Path.Combine(
            Path.GetTempPath(),
            $"techodyssey-tests-{Guid.NewGuid():N}");

        try
        {
            var store = new JsonGamificationStore(directory);
            var firstAccount = await store.CreateAccountAsync("first@example.com", "password-hash");
            var secondAccount = await store.CreateAccountAsync("second@example.com", "password-hash");

            Assert.NotNull(firstAccount);
            Assert.NotNull(secondAccount);

            Assert.True(await store.CompleteUnitAsync(
                firstAccount.Id,
                "rpg",
                "M01",
                "M01-S01"));

            Assert.Contains(
                "M01-S01",
                await store.GetCompletedUnitsAsync(firstAccount.Id, "rpg", "M01"));
            Assert.Empty(
                await store.GetCompletedUnitsAsync(secondAccount.Id, "rpg", "M01"));
        }
        finally
        {
            if (Directory.Exists(directory))
            {
                Directory.Delete(directory, recursive: true);
            }
        }
    }

    [Fact]
    public async Task ProgressIsScopedByTechnologyAndModule()
    {
        var directory = Path.Combine(
            Path.GetTempPath(),
            $"techodyssey-tests-{Guid.NewGuid():N}");

        try
        {
            var store = new JsonGamificationStore(directory);
            var account = await store.CreateAccountAsync("learner@example.com", "password-hash");

            Assert.NotNull(account);

            await store.CompleteUnitAsync(account.Id, "rpg", "M01", "unit-1");
            await store.CompleteUnitAsync(account.Id, "java", "M01", "unit-1");
            await store.CompleteModuleAsync(account.Id, "rpg", "M01");
            var otherTechnologyCompletion =
                await store.CompleteModuleAsync(account.Id, "java", "M01");
            Assert.Equal(0, otherTechnologyCompletion.PointsAwarded);

            Assert.Equal(["unit-1"], await store.GetCompletedUnitsAsync(
                account.Id,
                "rpg",
                "M01"));
            Assert.Equal(["unit-1"], await store.GetCompletedUnitsAsync(
                account.Id,
                "java",
                "M01"));
            Assert.Empty(await store.GetCompletedUnitsAsync(
                account.Id,
                "python",
                "M01"));
            Assert.Contains(
                "rpg/M01",
                (await store.GetProgressAsync(account.Id)).CompletedModules);
            Assert.Contains(
                "java/M01",
                (await store.GetProgressAsync(account.Id)).CompletedModules);
        }
        finally
        {
            if (Directory.Exists(directory))
            {
                Directory.Delete(directory, recursive: true);
            }
        }
    }

    [Fact]
    public async Task CommunitySnapshotAggregatesStatisticsAndReturnsTopTenWithoutCredentials()
    {
        var directory = Path.Combine(
            Path.GetTempPath(),
            $"techodyssey-tests-{Guid.NewGuid():N}");

        try
        {
            var store = new JsonGamificationStore(directory);
            for (var index = 0; index < 11; index++)
            {
                var account = await store.CreateAccountAsync(
                    $"player{index:D2}@example.com",
                    "password-hash");
                Assert.NotNull(account);

                await store.CompleteModuleAsync(account.Id, "rpg", "M00");
                if (index < 2)
                {
                    await store.CompleteModuleAsync(account.Id, "rpg", "M01");
                }
            }

            var community = await store.GetCommunitySnapshotAsync(10);

            Assert.Equal(11, community.ParticipantCount);
            Assert.Equal(13, community.CompletedModuleCount);
            Assert.Equal(1_300, community.TotalExperiencePoints);
            Assert.Equal(10, community.Leaderboard.Count);
            Assert.Equal("player00@example.com", community.Leaderboard[0].Email);
            Assert.Equal("player01@example.com", community.Leaderboard[1].Email);
            Assert.Equal(1, community.Leaderboard[0].Position);
            Assert.DoesNotContain(
                community.Leaderboard,
                participant => participant.Email == "player10@example.com");
        }
        finally
        {
            if (Directory.Exists(directory))
            {
                Directory.Delete(directory, recursive: true);
            }
        }
    }


    [Fact]
    public async Task AccountEmailIsUniqueIgnoringCase()
    {
        var directory = Path.Combine(
            Path.GetTempPath(),
            $"techodyssey-tests-{Guid.NewGuid():N}");

        try
        {
            var store = new JsonGamificationStore(directory);
            var first = await store.CreateAccountAsync("learner@example.com", "first-hash");
            var duplicate = await store.CreateAccountAsync("LEARNER@example.com", "second-hash");

            Assert.NotNull(first);
            Assert.Null(duplicate);
        }
        finally
        {
            if (Directory.Exists(directory))
            {
                Directory.Delete(directory, recursive: true);
            }
        }
    }

    [Fact]
    public async Task OlderAccountJsonDefaultsPasswordVersionAndCanBeReset()
    {
        var directory = Path.Combine(
            Path.GetTempPath(),
            $"techodyssey-tests-{Guid.NewGuid():N}");

        try
        {
            Directory.CreateDirectory(directory);
            var userId = Guid.NewGuid();
            await File.WriteAllTextAsync(
                Path.Combine(directory, "gamification.json"),
                $$"""
                {
                  "Accounts": [
                    {
                      "Id": "{{userId}}",
                      "Email": "learner@example.com",
                      "PasswordHash": "existing-password-hash"
                    }
                  ],
                  "Progress": [
                    {
                      "UserId": "{{userId}}",
                      "ExperiencePoints": 250,
                      "CompletedModules": ["M00", "M01"],
                      "M01CompletedSections": ["M01-S01"]
                    }
                  ]
                }
                """);

            var store = new JsonGamificationStore(directory);
            var account = await store.FindAccountByEmailAsync("learner@example.com");

            Assert.NotNull(account);
            Assert.Equal(0, account.PasswordVersion);
            Assert.True(await store.ResetPasswordAsync(
                account.Email,
                "replacement-password-hash"));

            var resetAccount = await store.FindAccountByIdAsync(userId);
            Assert.NotNull(resetAccount);
            Assert.Equal(1, resetAccount.PasswordVersion);
            var restoredProgress = await store.GetProgressAsync(userId);
            Assert.Equal(250, restoredProgress.ExperiencePoints);
            Assert.Contains("rpg/M00", restoredProgress.CompletedModules);
            Assert.Contains("rpg/M01", restoredProgress.CompletedModules);
            Assert.Contains(
                "M01-S01",
                await store.GetCompletedUnitsAsync(userId, "rpg", "M01"));
        }
        finally
        {
            if (Directory.Exists(directory))
            {
                Directory.Delete(directory, recursive: true);
            }
        }
    }
}
