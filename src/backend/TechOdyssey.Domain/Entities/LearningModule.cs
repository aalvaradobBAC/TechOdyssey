namespace TechOdyssey.Domain.Entities;

public sealed class LearningModule
{
    public Guid Id { get; init; } = Guid.NewGuid();

    public required string TechnologyCode { get; init; }

    public required string Code { get; init; }

    public required string Title { get; set; }

    public string Description { get; set; } = string.Empty;

    public int Order { get; set; }

    public int RequiredScore { get; set; } = 80;

    public bool IsPublished { get; set; }
}
