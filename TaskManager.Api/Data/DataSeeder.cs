using TaskManager.Api.Entities;

namespace TaskManager.Api.Data;

/// <summary>Seeds the database with initial admin and regular users on startup.</summary>
public static class DataSeeder
{
    /// <summary>
    /// Creates seed users if none exist.
    /// </summary>
    /// <param name="context">The application database context.</param>
    public static async Task SeedAsync(AppDbContext context)
    {
        if (context.Users.Any())
        {
            return;
        }

        var users = new List<User>
        {
            new()
            {
                Email = "admin@taskmanager.com",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("Admin@123"),
                Role = "Admin"
            },
            new()
            {
                Email = "user@taskmanager.com",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("User@123"),
                Role = "User"
            }
        };

        await context.Users.AddRangeAsync(users);
        await context.SaveChangesAsync();
    }
}
