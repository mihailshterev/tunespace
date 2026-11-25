using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using TuneSpace.Core.Entities;
using TuneSpace.Infrastructure.Identity;

namespace TuneSpace.Infrastructure.Data;

public class TuneSpaceDbContext(DbContextOptions<TuneSpaceDbContext> options) : IdentityDbContext<User, ApplicationRole, Guid>(options)
{
    public DbSet<RefreshToken> RefreshTokens { get; set; } = null!;
    public DbSet<Band> Bands { get; set; } = null!;
    public DbSet<Follow> Follows { get; set; } = null!;
    public DbSet<BandFollow> BandFollows { get; set; } = null!;
    public DbSet<Notification> Notifications { get; set; } = null!;
    public DbSet<Chat> Chats { get; set; } = null!;
    public DbSet<Message> Messages { get; set; } = null!;
    public DbSet<BandChat> BandChats { get; set; } = null!;
    public DbSet<BandMessage> BandMessages { get; set; } = null!;
    public DbSet<MusicEvent> MusicEvents { get; set; } = null!;
    public DbSet<Merchandise> Merchandises { get; set; } = null!;
    public DbSet<ForumCategory> ForumCategories { get; set; } = null!;
    public DbSet<ForumThread> ForumThreads { get; set; } = null!;
    public DbSet<ForumPost> ForumPosts { get; set; } = null!;
    public DbSet<ForumPostLike> ForumPostLikes { get; set; } = null!;
    public DbSet<ArtistEmbedding> ArtistEmbeddings { get; set; } = null!;
    public DbSet<RecommendationContext> RecommendationContexts { get; set; } = null!;
    public DbSet<DynamicScoringWeights> DynamicScoringWeights { get; set; } = null!;
    public DbSet<GenreEvolution> GenreEvolutions { get; set; } = null!;
    public DbSet<RecommendationFeedback> RecommendationFeedbacks { get; set; } = null!;

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.HasPostgresExtension("vector");

        modelBuilder.Entity<ArtistEmbedding>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => e.ArtistName).IsUnique();
            entity.HasIndex(e => e.SpotifyId);
            entity.HasIndex(e => e.DataSource);
            entity.Property(e => e.Genres)
                .HasConversion(
                    v => string.Join(',', v),
                    v => v.Split(',', StringSplitOptions.RemoveEmptyEntries).ToList());

            entity.Property(e => e.Embedding)
                .HasColumnType("vector(384)");
        });

        modelBuilder.Entity<RecommendationContext>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => e.UserId).IsUnique();
            entity.Property(e => e.UserGenres)
                .HasConversion(
                    v => string.Join(',', v),
                    v => v.Split(',', StringSplitOptions.RemoveEmptyEntries).ToList());
            entity.Property(e => e.UserTopArtists)
                .HasConversion(
                    v => string.Join(',', v),
                    v => v.Split(',', StringSplitOptions.RemoveEmptyEntries).ToList());
            entity.Property(e => e.UserRecentlyPlayed)
                .HasConversion(
                    v => string.Join(',', v),
                    v => v.Split(',', StringSplitOptions.RemoveEmptyEntries).ToList());

            entity.Property(e => e.UserPreferenceEmbedding)
                .HasColumnType("vector(384)");
        });

        modelBuilder.Entity<DynamicScoringWeights>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => e.UserId).IsUnique();
        });

        modelBuilder.Entity<GenreEvolution>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => new { e.UserId, e.Genre }).IsUnique();
            entity.Property(e => e.MonthlyPreferences)
                .HasConversion(
                    v => System.Text.Json.JsonSerializer.Serialize(v, (System.Text.Json.JsonSerializerOptions?)null),
                    v => System.Text.Json.JsonSerializer.Deserialize<Dictionary<int, double>>(v, (System.Text.Json.JsonSerializerOptions?)null) ?? new Dictionary<int, double>());
            entity.Property(e => e.WeeklyPreferences)
                .HasConversion(
                    v => System.Text.Json.JsonSerializer.Serialize(v, (System.Text.Json.JsonSerializerOptions?)null),
                    v => System.Text.Json.JsonSerializer.Deserialize<Dictionary<DayOfWeek, double>>(v, (System.Text.Json.JsonSerializerOptions?)null) ?? new Dictionary<DayOfWeek, double>());
        });

        modelBuilder.Entity<RecommendationFeedback>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => e.UserId);
            entity.HasIndex(e => e.BandId);
            entity.HasIndex(e => e.RecommendedAt);
            entity.Property(e => e.RecommendedGenres)
                .HasConversion(
                    v => string.Join(',', v),
                    v => v.Split(',', StringSplitOptions.RemoveEmptyEntries).ToList());
            entity.Property(e => e.ScoringFactors)
                .HasConversion(
                    v => System.Text.Json.JsonSerializer.Serialize(v, (System.Text.Json.JsonSerializerOptions?)null),
                    v => System.Text.Json.JsonSerializer.Deserialize<Dictionary<string, double>>(v, (System.Text.Json.JsonSerializerOptions?)null) ?? new Dictionary<string, double>());
        });
    }
}
