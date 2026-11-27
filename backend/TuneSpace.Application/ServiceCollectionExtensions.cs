using Microsoft.Extensions.DependencyInjection;
using TuneSpace.Application.BackgroundServices;
using TuneSpace.Application.Services;
using TuneSpace.Application.Services.AI;
using TuneSpace.Application.Services.MusicDiscovery;
using TuneSpace.Core.Interfaces.IInfrastructure;
using TuneSpace.Core.Interfaces.IServices;

namespace TuneSpace.Application;

public static class ServiceCollectionExtensions
{
    public static IServiceCollection AddApplicationServices(this IServiceCollection services)
    {
        services.AddSingleton<IApiThrottler, ApiThrottler>();
        services.AddSingleton<IBandCachingService, BandCachingService>();
        services.AddScoped<IAuthService, AuthService>();
        services.AddScoped<IEmailService, EmailService>();
        services.AddScoped<IUserService, UserService>();
        services.AddScoped<IUserManagementService, UserManagementService>();
        services.AddScoped<ISpotifyService, SpotifyService>();
        services.AddScoped<ITokenService, TokenService>();
        services.AddScoped<IBandService, BandService>();
        services.AddScoped<IBandInvitationService, BandInvitationService>();
        services.AddScoped<IMusicEventService, MusicEventService>();
        services.AddScoped<INotificationService, NotificationService>();
        services.AddScoped<IChatService, ChatService>();
        services.AddScoped<IForumService, ForumService>();
        services.AddScoped<IMerchandiseService, MerchandiseService>();
        services.AddScoped<IFollowService, FollowService>();
        services.AddScoped<IBandFollowService, BandFollowService>();
        services.AddScoped<IBandChatService, BandChatService>();
        services.AddScoped<IBandMessageService, BandMessageService>();
        services.AddScoped<IOAuthStateService, OAuthStateService>();
        services.AddScoped<IUserLocationService, UserLocationService>();
        services.AddHttpClient<IUserLocationService, UserLocationService>();

        return services;
    }

    public static IServiceCollection AddApplicationBackgroundServices(this IServiceCollection services)
    {
        services.AddHostedService<RefreshTokenCleanupService>();
        services.AddHostedService<AdaptiveLearningBackgroundService>();

        return services;
    }

    public static IServiceCollection AddRecommendationServices(this IServiceCollection services)
    {
        services.AddScoped<IMusicDiscoveryService, MusicDiscoveryService>();
        services.AddScoped<IDataEnrichmentService, DataEnrichmentService>();
        services.AddScoped<IArtistDiscoveryService, ArtistDiscoveryService>();
        services.AddScoped<IRecommendationScoringService, RecommendationScoringService>();
        services.AddSingleton<IEmbeddingService, EmbeddingService>();
        services.AddScoped<IVectorSearchService, VectorSearchService>();
        services.AddScoped<IAIRecommendationService, AIRecommendationService>();
        services.AddScoped<ICollaborativeFilteringService, CollaborativeFilteringService>();
        services.AddScoped<IAdaptiveLearningService, AdaptiveLearningService>();
        services.AddScoped<IAdaptiveRecommendationScoringService, AdaptiveRecommendationScoringService>();
        services.AddScoped<IEnhancedAIPromptService, EnhancedAIPromptService>();

        return services;
    }
}
