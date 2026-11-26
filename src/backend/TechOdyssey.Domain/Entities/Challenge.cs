namespace TechOdyssey.Domain.Entities;

public sealed class Challenge
{
    public Guid Id { get; init; } = Guid.NewGuid();

    public required string TechnologyCode { get; init; }

    public required string ModuleCode { get; init; }

    public required string Code { get; init; }

    public required string Title { get; set; }

    public string Description { get; set; } = string.Empty;

    public int ExperiencePoints { get; set; }

    public int MaximumExecutionSeconds { get; set; } = 10;

    public bool IsPublished { get; set; }
}
