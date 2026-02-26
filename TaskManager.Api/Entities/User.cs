namespace TaskManager.Api.Entities;

/// <summary>Represents an application user.</summary>
public class User
{
    public int Id { get; set; }

    public string Email { get; set; } = string.Empty;

    public string PasswordHash { get; set; } = string.Empty;

    /// <summary>Role of the user: "User" or "Admin".</summary>
    public string Role { get; set; } = "User";

    public ICollection<TaskItem> Tasks { get; set; } = new List<TaskItem>();
}
