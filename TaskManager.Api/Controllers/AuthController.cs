using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TaskManager.Api.Data;
using TaskManager.Api.DTOs;
using TaskManager.Api.Entities;
using TaskManager.Api.Services;

namespace TaskManager.Api.Controllers;

/// <summary>Handles user registration and login, returning JWT tokens.</summary>
[ApiController]
[Route("api/[controller]")]
public class AuthController(AppDbContext db, ITokenService tokenService) : ControllerBase
{
    // ──────────────────────────────────────────────
    // POST /api/auth/register
    // ──────────────────────────────────────────────

    /// <summary>Registers a new user account with the "User" role.</summary>
    [HttpPost("register")]
    [ProducesResponseType<AuthResponse>(StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status409Conflict)]
    public async Task<IActionResult> Register([FromBody] RegisterRequest request)
    {
        var emailTaken = await db.Users.AnyAsync(u => u.Email == request.Email);
        if (emailTaken)
        {
            return Conflict("An account with that email already exists.");
        }

        var user = new User
        {
            Email = request.Email,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password),
            Role = "User"
        };

        db.Users.Add(user);
        await db.SaveChangesAsync();

        var token = tokenService.CreateToken(user);
        return CreatedAtAction(nameof(Register), new AuthResponse(token, user.Email, user.Role));
    }

    // ──────────────────────────────────────────────
    // POST /api/auth/login
    // ──────────────────────────────────────────────

    /// <summary>Authenticates a user and returns a JWT token.</summary>
    [HttpPost("login")]
    [ProducesResponseType<AuthResponse>(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> Login([FromBody] LoginRequest request)
    {
        var user = await db.Users.FirstOrDefaultAsync(u => u.Email == request.Email);

        // Use constant-time verification to prevent timing attacks
        if (user is null || !BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash))
        {
            return Unauthorized("Invalid email or password.");
        }

        var token = tokenService.CreateToken(user);
        return Ok(new AuthResponse(token, user.Email, user.Role));
    }
}
