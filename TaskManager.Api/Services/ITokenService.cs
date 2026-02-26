using TaskManager.Api.Entities;

namespace TaskManager.Api.Services;

/// <summary>Generates JWT tokens for authenticated users.</summary>
public interface ITokenService
{
    /// <summary>Creates a signed JWT token for the given <paramref name="user"/>.</summary>
    string CreateToken(User user);
}
