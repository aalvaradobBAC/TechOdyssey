namespace TechOdyssey.Domain.Entities;

public sealed class Technology
{
    public Guid Id { get; init; } = Guid.NewGuid();

    public required string Code { get; init; }

    public required string Name { get; set; }

    public string Description { get; set; } = string.Empty;

    public string Status { get; set; } = "planned";

    public string Color { get; set; } = "#2563EB";

    public string Icon { get; set; } = "code";

    public int Order { get; set; }

    public bool IsActive => Status == "active";
}
