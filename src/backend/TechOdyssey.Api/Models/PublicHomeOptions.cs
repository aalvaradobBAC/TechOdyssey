namespace TechOdyssey.Api.Models;

public sealed class PublicHomeOptions
{
    public const string SectionName = "PublicHome";

    public int LeaderboardLimit { get; set; } = 10;

    public string HeroEyebrow { get; set; } = string.Empty;

    public string HeroTitle { get; set; } = string.Empty;

    public string HeroHighlight { get; set; } = string.Empty;

    public string HeroDescription { get; set; } = string.Empty;

    public string HeroCallToAction { get; set; } = string.Empty;

    public string HeroQuote { get; set; } = string.Empty;

    public string HeroQuoteAttribution { get; set; } = string.Empty;

    public List<PublicHomeBenefit> Benefits { get; set; } = [];

    public string TechnologyHeading { get; set; } = string.Empty;

    public string TechnologyDescription { get; set; } = string.Empty;

    public string CommunityHeading { get; set; } = string.Empty;

    public string ParticipantsLabel { get; set; } = string.Empty;

    public string CompletedModulesLabel { get; set; } = string.Empty;

    public string ExperiencePointsLabel { get; set; } = string.Empty;

    public string ActiveTechnologiesLabel { get; set; } = string.Empty;

    public string LeaderboardHeading { get; set; } = string.Empty;

    public string LeaderboardDescription { get; set; } = string.Empty;

    public string LeaderboardEmptyMessage { get; set; } = string.Empty;

    public string LearningStepsHeading { get; set; } = string.Empty;

    public List<PublicLearningStep> LearningSteps { get; set; } = [];

    public string ClosingHeading { get; set; } = string.Empty;

    public string ClosingDescription { get; set; } = string.Empty;

    public string ClosingCallToAction { get; set; } = string.Empty;

    public List<PublicTechnologyItem> Technologies { get; set; } = [];

    public bool IsValid()
    {
        return LeaderboardLimit is >= 1 and <= 10
               && !string.IsNullOrWhiteSpace(HeroEyebrow)
               && !string.IsNullOrWhiteSpace(HeroTitle)
               && !string.IsNullOrWhiteSpace(HeroHighlight)
               && !string.IsNullOrWhiteSpace(HeroDescription)
               && !string.IsNullOrWhiteSpace(HeroCallToAction)
               && !string.IsNullOrWhiteSpace(HeroQuote)
               && !string.IsNullOrWhiteSpace(HeroQuoteAttribution)
               && Benefits.Count > 0
               && Benefits.All(item =>
                   !string.IsNullOrWhiteSpace(item.Icon)
                   && !string.IsNullOrWhiteSpace(item.Title)
                   && !string.IsNullOrWhiteSpace(item.Description))
               && !string.IsNullOrWhiteSpace(TechnologyHeading)
               && !string.IsNullOrWhiteSpace(TechnologyDescription)
               && !string.IsNullOrWhiteSpace(CommunityHeading)
               && !string.IsNullOrWhiteSpace(ParticipantsLabel)
               && !string.IsNullOrWhiteSpace(CompletedModulesLabel)
               && !string.IsNullOrWhiteSpace(ExperiencePointsLabel)
               && !string.IsNullOrWhiteSpace(ActiveTechnologiesLabel)
               && !string.IsNullOrWhiteSpace(LeaderboardHeading)
               && !string.IsNullOrWhiteSpace(LeaderboardDescription)
               && !string.IsNullOrWhiteSpace(LeaderboardEmptyMessage)
               && !string.IsNullOrWhiteSpace(LearningStepsHeading)
               && !string.IsNullOrWhiteSpace(ClosingHeading)
               && !string.IsNullOrWhiteSpace(ClosingDescription)
               && !string.IsNullOrWhiteSpace(ClosingCallToAction)
               && Technologies.Count > 0
               && Technologies.Select(item => item.Code).Distinct(
                   StringComparer.OrdinalIgnoreCase).Count() == Technologies.Count
               && Technologies.All(item =>
                   !string.IsNullOrWhiteSpace(item.Code)
                   && !string.IsNullOrWhiteSpace(item.Name)
                   && !string.IsNullOrWhiteSpace(item.Status)
                   && !string.IsNullOrWhiteSpace(item.StatusLabel)
                   && !string.IsNullOrWhiteSpace(item.Description)
                   && (item.Status is "active" or "planned" or "maintenance")
                   && (item.Status != "active" || !string.IsNullOrWhiteSpace(item.Path)))
               && LearningSteps.Count > 0
               && LearningSteps.All(item =>
                   !string.IsNullOrWhiteSpace(item.Code)
                   && !string.IsNullOrWhiteSpace(item.Icon)
                   && !string.IsNullOrWhiteSpace(item.Title)
                   && !string.IsNullOrWhiteSpace(item.Description));
    }
}

public sealed class PublicHomeBenefit
{
    public string Icon { get; set; } = string.Empty;

    public string Title { get; set; } = string.Empty;

    public string Description { get; set; } = string.Empty;
}

public sealed class PublicLearningStep
{
    public string Code { get; set; } = string.Empty;

    public string Icon { get; set; } = string.Empty;

    public string Title { get; set; } = string.Empty;

    public string Description { get; set; } = string.Empty;
}

public sealed class PublicTechnologyItem
{
    public string Code { get; set; } = string.Empty;

    public string Name { get; set; } = string.Empty;

    public string Description { get; set; } = string.Empty;

    public string Status { get; set; } = string.Empty;

    public string StatusLabel { get; set; } = string.Empty;

    public string Color { get; set; } = string.Empty;

    public string Icon { get; set; } = string.Empty;

    public string Path { get; set; } = string.Empty;
}

public sealed record PublicHomeResponse(
    PublicHomeOptions Content,
    PublicHomeStatistics Statistics,
    IReadOnlyList<TechOdyssey.Application.Abstractions.LeaderboardEntry> Leaderboard,
    DateTimeOffset UpdatedAt);

public sealed record PublicHomeStatistics(
    int ParticipantCount,
    long CompletedModuleCount,
    long TotalExperiencePoints,
    int ActiveTechnologyCount);
