using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.JsonWebTokens;
using Microsoft.IdentityModel.Tokens;
using TuneSpace.Core.Entities;
using TuneSpace.Core.Interfaces.IRepositories;
using TuneSpace.Core.Interfaces.IServices;
using TuneSpace.Infrastructure.Options;

namespace TuneSpace.Application.Services;

internal class TokenService(
    IRefreshTokenRepository refreshTokenRepository,
    IUserRepository userRepository,
    IOptions<JwtOptions> jwtOptions) : ITokenService
{
    private readonly IRefreshTokenRepository _refreshTokenRepository = refreshTokenRepository;
    private readonly IUserRepository _userRepository = userRepository;
    private readonly JwtOptions _jwtOptions = jwtOptions.Value;

    string ITokenService.GenerateAccessToken(User user)
    {
        var secretKey = _jwtOptions.Secret ?? throw new InvalidOperationException("JWT Token secret is not configured");
        var securityKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey));

        var credentials = new SigningCredentials(securityKey, SecurityAlgorithms.HmacSha256);

        var claimsIdentity = new ClaimsIdentity([
            new(JwtRegisteredClaimNames.Sub, user.Id.ToString()),
            new(JwtRegisteredClaimNames.Email, user.Email ?? string.Empty),
            new(ClaimTypes.Name, user.UserName ?? string.Empty),
            new(ClaimTypes.Role, user.Role.ToString()),
            new(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
        ]);

        var tokenHandler = new JsonWebTokenHandler();

        var tokenDescriptor = new SecurityTokenDescriptor
        {
            Subject = claimsIdentity,
            Expires = DateTime.UtcNow.AddMinutes(_jwtOptions.ExpiryMinutes),
            Issuer = _jwtOptions.Issuer,
            Audience = _jwtOptions.Audience,
            SigningCredentials = credentials
        };

        var token = tokenHandler.CreateToken(tokenDescriptor);

        return token;
    }

    string ITokenService.GenerateRefreshToken()
    {
        return Convert.ToBase64String(RandomNumberGenerator.GetBytes(64));
    }

    async Task<string> ITokenService.SaveRefreshTokenAsync(User user, string refreshToken)
    {
        var tokenHash = Convert.ToBase64String(SHA256.HashData(Encoding.UTF8.GetBytes(refreshToken)));

        var newToken = new RefreshToken
        {
            UserId = user.Id,
            TokenHash = tokenHash,
            Expiry = DateTime.UtcNow.AddDays(7),
        };

        await _refreshTokenRepository.InsertAsync(newToken);

        return refreshToken;
    }

    async Task<ClaimsPrincipal?> ITokenService.ValidateAccessTokenAsync(string token)
    {
        try
        {
            var secretKey = _jwtOptions.Secret ?? throw new InvalidOperationException("JWT Token secret is not configured");
            var securityKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey));

            var tokenHandler = new JsonWebTokenHandler();

            var validationParameters = new TokenValidationParameters
            {
                IssuerSigningKey = securityKey,
                ValidateIssuer = true,
                ValidateAudience = true,
                ValidateLifetime = true,
                ValidateIssuerSigningKey = true,
                ValidIssuer = _jwtOptions.Issuer,
                ValidAudience = _jwtOptions.Audience,
                ClockSkew = TimeSpan.Zero
            };

            var result = await tokenHandler.ValidateTokenAsync(token, validationParameters);

            if (result.IsValid)
            {
                return new ClaimsPrincipal(result.ClaimsIdentity);
            }

            return null;
        }
        catch
        {
            return null;
        }
    }

    async Task<User?> ITokenService.ValidateRefreshTokenAsync(string token)
    {
        var tokenHash = Convert.ToBase64String(SHA256.HashData(Encoding.UTF8.GetBytes(token)));
        var existingToken = await _refreshTokenRepository.GetByTokenAsync(tokenHash);

        if (existingToken is null || existingToken.Expiry < DateTime.UtcNow || existingToken.RevokedAt != null)
        {
            return null;
        }

        existingToken.RevokedAt = DateTime.UtcNow;
        await _refreshTokenRepository.UpdateAsync(existingToken);

        var user = await _userRepository.GetUserByIdAsync(existingToken.UserId.ToString());
        if (user is null || user.IsSuspended)
        {
            return null;
        }

        return user;
    }

    async Task ITokenService.RevokeRefreshTokenAsync(string token)
    {
        var tokenHash = Convert.ToBase64String(SHA256.HashData(Encoding.UTF8.GetBytes(token)));
        var existingToken = await _refreshTokenRepository.GetByTokenAsync(tokenHash);

        if (existingToken is not null && !existingToken.RevokedAt.HasValue)
        {
            existingToken.RevokedAt = DateTime.UtcNow;
            await _refreshTokenRepository.UpdateAsync(existingToken);
        }
    }
}
