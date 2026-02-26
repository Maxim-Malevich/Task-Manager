namespace TaskManager.Api.Entities;

/// <summary>Represents a task assigned to a user.</summary>
public class TaskItem
{
    public int Id { get; set; }

    public string Title { get; set; } = string.Empty;

    public string Description { get; set; } = string.Empty;

    public TaskItemStatus Status { get; set; } = TaskItemStatus.Pending;

    /// <summary>Foreign key to the owning <see cref="User"/>.</summary>
    public int UserId { get; set; }

    public User User { get; set; } = null!;
}
