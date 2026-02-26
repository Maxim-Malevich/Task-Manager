namespace TaskManager.Api.DTOs;

/// <summary>Response DTO for a user (no password hash exposed).</summary>
public record UserResponse(
    int Id,
    string Email,
    string Role
);
