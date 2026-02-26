using System.ComponentModel.DataAnnotations;

namespace TaskManager.Api.DTOs;

/// <summary>Request DTO for login.</summary>
public record LoginRequest(
    [Required, EmailAddress] string Email,
    [Required] string Password
);

/// <summary>Request DTO for registration.</summary>
public record RegisterRequest(
    [Required, EmailAddress] string Email,
    [Required, MinLength(6)] string Password
);

/// <summary>Returned on successful login or registration.</summary>
public record AuthResponse(
    string Token,
    string Email,
    string Role
);
