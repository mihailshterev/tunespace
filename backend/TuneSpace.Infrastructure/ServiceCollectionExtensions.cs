using System.IdentityModel.Tokens.Jwt;
using System.Net.Mail;
using System.Security.Claims;
using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Http.Resilience;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using Polly;
using TuneSpace.Core.Entities;
using TuneSpace.Core.Exceptions;
using TuneSpace.Core.Interfaces.IClients;
using TuneSpace.Core.Interfaces.IInfrastructure;
using TuneSpace.Core.Interfaces.IRepositories;
using TuneSpace.Core.Interfaces.IServices;
using TuneSpace.Infrastructure.Clients;
using TuneSpace.Infrastructure.Data;
using TuneSpace.Infrastructure.Identity;
using TuneSpace.Infrastructure.Options;
using TuneSpace.Infrastructure.Repositories;
using TuneSpace.Infrastructure.Services;

namespace TuneSpace.Infrastructure;

public static class ServiceCollectionExtensions
{
    public static IServiceCollection AddDatabaseServices(this IServiceCollection services)
    {
        services.AddDbContext<TuneSpaceDbContext>((provider, options) =>
            options.UseNpgsql(provider.GetRequiredService<IOptionsSnapshot<DatabaseOptions>>().Value.DefaultConnection,
            o => o.UseVector()));

        return services;
    }

    public static IServiceCollection AddCachingServices(this IServiceCollection services)
    {
        services.AddMemoryCache();
        return services;
    }

    /// <summary>
    /// Access tokens carry the role they were issued with and live for an hour. Re-check the user's
    /// current role and suspension on each request so admin changes apply immediately: suspended or
    /// deleted users are rejected and the role claim is replaced with the stored role.
    /// </summary>
    private static async Task ApplyCurrentAccessStateAsync(TokenValidatedContext context)
    {
        if (context.Principal?.Identity is not ClaimsIdentity identity)
        {
            context.Fail("Invalid token.");
            return;
        }

        var userIdValue = identity.FindFirst(ClaimTypes.NameIdentifier)?.Value
            ?? identity.FindFirst(JwtRegisteredClaimNames.Sub)?.Value;
        if (!Guid.TryParse(userIdValue, out var userId))
        {
            context.Fail("Invalid token claims.");
            return;
        }

        var accessStateProvider = context.HttpContext.RequestServices.GetRequiredService<IUserAccessStateProvider>();
        var state = await accessStateProvider.GetAsync(userId);
        if (state is null || state.IsSuspended)
        {
            context.Fail("Account is unavailable.");
            return;
        }

        var currentRole = state.Role.ToString();
        var roleClaims = identity.FindAll(identity.RoleClaimType).ToList();
        if (roleClaims.Count == 1 && roleClaims[0].Value == currentRole)
        {
            return;
        }

        foreach (var claim in roleClaims)
        {
            identity.RemoveClaim(claim);
        }
        identity.AddClaim(new Claim(identity.RoleClaimType, currentRole));
    }

    public static IServiceCollection AddIdentityServices(this IServiceCollection services)
    {
        var jwtOptions = services.BuildServiceProvider().GetRequiredService<IOptionsSnapshot<JwtOptions>>().Value;

        services.AddAuthentication(options =>
        {
            options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
            options.DefaultScheme = JwtBearerDefaults.AuthenticationScheme;
            options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
        }).AddJwtBearer(options =>
        {
            options.SaveToken = true;
            options.RequireHttpsMetadata = false;
            options.TokenValidationParameters = new TokenValidationParameters
            {
                IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtOptions.Secret)),
                ValidateIssuer = true,
                ValidateAudience = true,
                ValidateLifetime = true,
                ValidateIssuerSigningKey = true,
                ValidIssuer = jwtOptions.Issuer,
                ValidAudience = jwtOptions.Audience,
                ClockSkew = TimeSpan.Zero
            };

            options.Events = new JwtBearerEvents
            {
                OnMessageReceived = context =>
                {
                    if (context.Request.Cookies.ContainsKey("AccessToken"))
                    {
                        context.Token = context.Request.Cookies["AccessToken"];
                    }

                    return Task.CompletedTask;
                },
                OnTokenValidated = ApplyCurrentAccessStateAsync
            };
        }).AddCookie(IdentityConstants.ApplicationScheme);

        services.AddAuthorizationBuilder();

        services.AddIdentityCore<User>(options =>
        {
            options.Password.RequireDigit = true;
            options.Password.RequireLowercase = true;
            options.Password.RequireUppercase = false;
            options.Password.RequireNonAlphanumeric = false;
            options.Password.RequiredLength = 6;
            options.User.RequireUniqueEmail = true;
        }).AddRoles<ApplicationRole>()
        .AddEntityFrameworkStores<TuneSpaceDbContext>()
        .AddDefaultTokenProviders();

        return services;
    }

    public static IServiceCollection AddEmailService(this IServiceCollection services)
    {
        var emailOptions = services.BuildServiceProvider().GetRequiredService<IOptionsSnapshot<EmailOptions>>().Value;

        var pickupDirectory = Path.Combine(Directory.GetCurrentDirectory(), "Emails");
        Directory.CreateDirectory(pickupDirectory);

        services.AddFluentEmail(emailOptions.FromEmail, emailOptions.FromName)
            .AddSmtpSender(() =>
            {
                return new SmtpClient(emailOptions?.SmtpHost ?? "localhost")
                {
                    //TODO: Set up gmail SMTP
                    //local emails for now
                    DeliveryMethod = SmtpDeliveryMethod.SpecifiedPickupDirectory,
                    PickupDirectoryLocation = pickupDirectory,
                    EnableSsl = false,
                };
            });

        services.AddScoped<IEmailTemplateService, EmailTemplateService>();

        return services;
    }

    public static IServiceCollection AddInfrastructureServices(this IServiceCollection services)
    {
        services.AddScoped<IUrlBuilderService, UrlBuilderService>();
        services.AddScoped<IUnitOfWork, UnitOfWork>();
        services.AddScoped<IUserAccessStateProvider, UserAccessStateProvider>();

        return services;
    }

    public static IServiceCollection AddRepositoryServices(this IServiceCollection services)
    {
        services.AddScoped<IUserRepository, UserRepository>();
        services.AddScoped<IBandRepository, BandRepository>();
        services.AddScoped<IMusicEventRepository, MusicEventRepository>();
        services.AddScoped<INotificationRepository, NotificationRepository>();
        services.AddScoped<IMessageRepository, MessageRepository>();
        services.AddScoped<IChatRepository, ChatRepository>();
        services.AddScoped<IForumRepository, ForumRepository>();
        services.AddScoped<IMerchandiseRepository, MerchandiseRepository>();
        services.AddScoped<IFollowRepository, FollowRepository>();
        services.AddScoped<IBandFollowRepository, BandFollowRepository>();
        services.AddScoped<IBandChatRepository, BandChatRepository>();
        services.AddScoped<IBandMessageRepository, BandMessageRepository>();
        services.AddScoped<IRefreshTokenRepository, RefreshTokenRepository>();
        services.AddScoped<IArtistEmbeddingRepository, ArtistEmbeddingRepository>();
        services.AddScoped<IRecommendationContextRepository, RecommendationContextRepository>();
        services.AddScoped<IRecommendationFeedbackRepository, RecommendationFeedbackRepository>();

        return services;
    }

    public static IServiceCollection AddHttpClientServices(this IServiceCollection services)
    {
        services.AddHttpClient<IOllamaClient, OllamaClient>();

        services.AddHttpClient<ILastFmClient, LastFmClient>(client =>
        {
            client.DefaultRequestHeaders.Add("User-Agent", "TuneSpace/1.0");
        })
        .AddResilienceHandler(
            "lastFmResiliencePipeline", pipeline =>
            {
                pipeline.AddRetry(new HttpRetryStrategyOptions
                {
                    MaxRetryAttempts = 3,
                    BackoffType = DelayBackoffType.Exponential,
                    UseJitter = true,
                    Delay = TimeSpan.FromMilliseconds(500),
                    ShouldHandle = args =>
                    {
                        if (args.Outcome.Exception is HttpRequestException or TaskCanceledException)
                        {
                            return ValueTask.FromResult(true);
                        }

                        if (args.Outcome.Result?.StatusCode is
                            System.Net.HttpStatusCode.TooManyRequests or
                            System.Net.HttpStatusCode.InternalServerError or
                            System.Net.HttpStatusCode.BadGateway or
                            System.Net.HttpStatusCode.ServiceUnavailable or
                            System.Net.HttpStatusCode.GatewayTimeout)
                        {
                            return ValueTask.FromResult(true);
                        }

                        return ValueTask.FromResult(false);
                    },
                    OnRetry = async args =>
                    {
                        if (args.Outcome.Result?.StatusCode == System.Net.HttpStatusCode.TooManyRequests &&
                            args.Outcome.Result.Headers.RetryAfter?.Delta is TimeSpan retryAfter)
                        {
                            await Task.Delay(retryAfter);
                        }
                    }
                });

                pipeline.AddCircuitBreaker(new HttpCircuitBreakerStrategyOptions
                {
                    FailureRatio = 0.5,
                    SamplingDuration = TimeSpan.FromMinutes(2),
                    MinimumThroughput = 10,
                    BreakDuration = TimeSpan.FromSeconds(30)
                });

                pipeline.AddTimeout(TimeSpan.FromSeconds(30));
            }
        );

        services.AddHttpClient<IMusicBrainzClient, MusicBrainzClient>(client =>
        {
            client.DefaultRequestHeaders.Add("User-Agent", "TuneSpace/1.0");
        })
        .AddResilienceHandler(
            "musicBrainzResiliencePipeline", pipeline =>
            {
                pipeline.AddRetry(new HttpRetryStrategyOptions
                {
                    MaxRetryAttempts = 3,
                    BackoffType = DelayBackoffType.Exponential,
                    UseJitter = true,
                    Delay = TimeSpan.FromMilliseconds(1000),
                    ShouldHandle = args =>
                    {
                        if (args.Outcome.Exception is HttpRequestException or TaskCanceledException)
                        {
                            return ValueTask.FromResult(true);
                        }

                        if (args.Outcome.Result?.StatusCode is
                            System.Net.HttpStatusCode.TooManyRequests or
                            System.Net.HttpStatusCode.InternalServerError or
                            System.Net.HttpStatusCode.BadGateway or
                            System.Net.HttpStatusCode.ServiceUnavailable or
                            System.Net.HttpStatusCode.GatewayTimeout)
                        {
                            return ValueTask.FromResult(true);
                        }

                        return ValueTask.FromResult(false);
                    },
                    OnRetry = async args =>
                    {
                        if (args.Outcome.Result?.StatusCode == System.Net.HttpStatusCode.TooManyRequests)
                        {
                            await Task.Delay(TimeSpan.FromSeconds(1));
                        }
                    }
                });

                pipeline.AddCircuitBreaker(new HttpCircuitBreakerStrategyOptions
                {
                    FailureRatio = 0.5,
                    SamplingDuration = TimeSpan.FromMinutes(2),
                    MinimumThroughput = 5,
                    BreakDuration = TimeSpan.FromMinutes(1)
                });

                pipeline.AddTimeout(TimeSpan.FromSeconds(30));
            }
        );

        services.AddHttpClient<ISpotifyClient, SpotifyClient>(client =>
        {
            client.BaseAddress = new Uri("https://api.spotify.com/v1/");
            client.DefaultRequestHeaders.Add("User-Agent", "TuneSpace/1.0");
        })
        .ConfigurePrimaryHttpMessageHandler(() =>
        {
            return new SocketsHttpHandler
            {
                MaxConnectionsPerServer = 10,
                PooledConnectionLifetime = TimeSpan.FromMinutes(15)
            };
        })
        .AddResilienceHandler(
            "spotifyResiliencePipeline", pipeline =>
            {
                pipeline.AddRetry(new HttpRetryStrategyOptions
                {
                    MaxRetryAttempts = 3,
                    BackoffType = DelayBackoffType.Exponential,
                    UseJitter = true,
                    Delay = TimeSpan.FromMilliseconds(500),
                    ShouldHandle = args =>
                    {
                        if (args.Outcome.Exception is SpotifyApiException)
                        {
                            return ValueTask.FromResult(false);
                        }

                        if (args.Outcome.Exception is HttpRequestException or TaskCanceledException)
                        {
                            return ValueTask.FromResult(true);
                        }

                        if (args.Outcome.Result?.StatusCode is
                            System.Net.HttpStatusCode.TooManyRequests or
                            System.Net.HttpStatusCode.InternalServerError or
                            System.Net.HttpStatusCode.BadGateway or
                            System.Net.HttpStatusCode.ServiceUnavailable or
                            System.Net.HttpStatusCode.GatewayTimeout)
                        {
                            return ValueTask.FromResult(true);
                        }

                        return ValueTask.FromResult(false);
                    },
                    OnRetry = async args =>
                    {
                        if (args.Outcome.Result?.StatusCode == System.Net.HttpStatusCode.TooManyRequests &&
                            args.Outcome.Result.Headers.RetryAfter?.Delta is TimeSpan retryAfter)
                        {
                            await Task.Delay(retryAfter);
                        }
                    }
                });

                pipeline.AddCircuitBreaker(new HttpCircuitBreakerStrategyOptions
                {
                    FailureRatio = 0.5,
                    SamplingDuration = TimeSpan.FromMinutes(2),
                    MinimumThroughput = 10,
                    BreakDuration = TimeSpan.FromSeconds(30)
                });

                pipeline.AddTimeout(TimeSpan.FromSeconds(30));
            }
        );

        services.AddHttpClient<IBandcampClient, BandcampClient>();

        return services;
    }

    public static IServiceCollection AddOptions(this IServiceCollection services, IConfiguration configuration)
    {
        services.Configure<JwtOptions>(configuration.GetSection("Jwt"));
        services.Configure<EmailOptions>(configuration.GetSection("Email"));
        services.Configure<FrontendOptions>(configuration.GetSection("Frontend"));
        services.Configure<DatabaseOptions>(configuration.GetSection("ConnectionStrings"));
        services.Configure<SpotifyOptions>(configuration.GetSection("Spotify"));
        services.Configure<LastFmOptions>(configuration.GetSection("LastFm"));
        services.Configure<SecurityOptions>(configuration.GetSection("Security"));
        services.Configure<AdminOptions>(configuration.GetSection("Admin"));

        return services;
    }
}
