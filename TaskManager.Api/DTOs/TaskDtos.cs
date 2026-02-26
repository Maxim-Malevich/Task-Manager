using System.ComponentModel.DataAnnotations;

namespace TaskManager.Api.DTOs;

/// <summary>Response DTO for a task.</summary>
public record TaskResponse(
    int Id,
    string Title,
    string? Description,
    string Status,
    int UserId
);

/// <summary>Request DTO for creating a task. Class (not record) so System.Text.Json uses property binding, not constructor binding.</summary>
public class CreateTaskRequest
{
    [Required, MaxLength(200)]
    public string Title { get; set; } = string.Empty;

    [MaxLength(1000)]
    public string? Description { get; set; }

    /// <summary>"Pending", "InProgress", or "Completed"</summary>
    public string Status { get; set; } = "Pending";
}

/// <summary>Request DTO for updating a task.</summary>
public class UpdateTaskRequest
{
    [MaxLength(200)]
    public string? Title { get; set; }

    [MaxLength(1000)]
    public string? Description { get; set; }

    /// <summary>"Pending", "InProgress", or "Completed"</summary>
    public string? Status { get; set; }
}
