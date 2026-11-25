using Microsoft.Extensions.Logging.Abstractions;
using NSubstitute;
using TuneSpace.Application.Services;
using TuneSpace.Core.Entities;
using TuneSpace.Core.Enums;
using TuneSpace.Core.Interfaces.IRepositories;
using TuneSpace.Core.Interfaces.IServices;
using Xunit;

namespace TuneSpace.Tests.Unit.Services;

public class BandServiceTests
{
    private readonly IBandRepository _bandRepository = Substitute.For<IBandRepository>();
    private readonly IUserRepository _userRepository = Substitute.For<IUserRepository>();
    private readonly IBandService _bandService;

    public BandServiceTests()
    {
        _bandService = new BandService(_bandRepository, _userRepository, NullLogger<BandService>.Instance);
    }

    [Fact]
    public async Task GetBandByIdAsync_WithValidId_ShouldReturnBandResponse()
    {
        var bandId = Guid.NewGuid();
        var band = new Band
        {
            Id = bandId,
            Name = "Test Band",
            Description = "A test band",
            Genre = "Rock",
            Country = "USA",
            City = "New York",
            CoverImage = [1, 2, 3],
            SpotifyId = "spotify123",
            YouTubeEmbedId = "youtube123",
            Members =
            [
                new() { Id = Guid.NewGuid(), UserName = "member1", ProfilePicture = [4, 5, 6] },
                new() { Id = Guid.NewGuid(), UserName = "member2", ProfilePicture = null }
            ]
        };
        _bandRepository.GetBandByIdAsync(bandId).Returns(band);

        var result = await _bandService.GetBandByIdAsync(bandId);

        Assert.NotNull(result);
        Assert.Equal(bandId.ToString(), result.Id);
        Assert.Equal("Test Band", result.Name);
        Assert.Equal("A test band", result.Description);
        Assert.Equal("Rock", result.Genre);
        Assert.Equal("USA", result.Country);
        Assert.Equal("New York", result.City);
        Assert.Equal([1, 2, 3], result.CoverImage);
        Assert.Equal("spotify123", result.SpotifyId);
        Assert.Equal("youtube123", result.YouTubeEmbedId);
        Assert.NotNull(result.Members);
        Assert.Equal(2, result.Members.Count);
        Assert.Equal("member1", result.Members.First().Name);
        await _bandRepository.Received(1).GetBandByIdAsync(bandId);
    }

    [Fact]
    public async Task GetBandByIdAsync_WithInvalidId_ShouldReturnNull()
    {
        var bandId = Guid.NewGuid();
        _bandRepository.GetBandByIdAsync(bandId).Returns((Band?)null);

        var result = await _bandService.GetBandByIdAsync(bandId);

        Assert.Null(result);
        await _bandRepository.Received(1).GetBandByIdAsync(bandId);
    }

    [Fact]
    public async Task GetBandByNameAsync_WithValidName_ShouldReturnBandResponse()
    {
        var bandName = "Test Band";
        var band = new Band
        {
            Id = Guid.NewGuid(),
            Name = bandName,
            Description = "A test band",
            Genre = "Rock",
            Country = "USA",
            City = "New York"
        };
        _bandRepository.GetBandByNameAsync(bandName).Returns(band);

        var result = await _bandService.GetBandByNameAsync(bandName);

        Assert.NotNull(result);
        Assert.Equal(bandName, result.Name);
        Assert.Equal("A test band", result.Description);
        Assert.Equal("Rock", result.Genre);
        await _bandRepository.Received(1).GetBandByNameAsync(bandName);
    }

    [Fact]
    public async Task GetBandByNameAsync_WithInvalidName_ShouldReturnNull()
    {
        var bandName = "Non-existent Band";
        _bandRepository.GetBandByNameAsync(bandName).Returns((Band?)null);

        var result = await _bandService.GetBandByNameAsync(bandName);

        Assert.Null(result);
        await _bandRepository.Received(1).GetBandByNameAsync(bandName);
    }

    [Fact]
    public async Task GetBandByUserIdAsync_WithValidUserId_ShouldReturnBandResponse()
    {
        var userId = Guid.NewGuid().ToString();
        var band = new Band
        {
            Id = Guid.NewGuid(),
            Name = "User's Band",
            Description = "Band owned by user",
            Genre = "Pop",
            Country = "Canada",
            City = "Toronto"
        };
        _bandRepository.GetBandByUserIdAsync(userId).Returns(band);

        var result = await _bandService.GetBandByUserIdAsync(userId);

        Assert.NotNull(result);
        Assert.Equal("User's Band", result.Name);
        Assert.Equal("Band owned by user", result.Description);
        Assert.Equal("Pop", result.Genre);
        await _bandRepository.Received(1).GetBandByUserIdAsync(userId);
    }

    [Fact]
    public async Task GetBandByUserIdAsync_WithInvalidUserId_ShouldReturnNull()
    {
        var userId = Guid.NewGuid().ToString();
        _bandRepository.GetBandByUserIdAsync(userId).Returns((Band?)null);

        var result = await _bandService.GetBandByUserIdAsync(userId);

        Assert.Null(result);
        await _bandRepository.Received(1).GetBandByUserIdAsync(userId);
    }

    [Fact]
    public async Task GetBandImageAsync_WithValidBandId_ShouldReturnImageData()
    {
        var bandId = Guid.NewGuid();
        byte[] imageData = [1, 2, 3, 4, 5];
        var band = new Band { Id = bandId, Name = "Test Band", Genre = "Rock", CoverImage = imageData };
        _bandRepository.GetBandByIdAsync(bandId).Returns(band);

        var result = await _bandService.GetBandImageAsync(bandId);

        Assert.Equal(imageData, result);
        await _bandRepository.Received(1).GetBandByIdAsync(bandId);
    }

    [Fact]
    public async Task GetBandImageAsync_WithBandWithoutImage_ShouldReturnNull()
    {
        var bandId = Guid.NewGuid();
        var band = new Band { Id = bandId, Name = "Test Band", Genre = "Rock", CoverImage = null };
        _bandRepository.GetBandByIdAsync(bandId).Returns(band);

        var result = await _bandService.GetBandImageAsync(bandId);

        Assert.Null(result);
        await _bandRepository.Received(1).GetBandByIdAsync(bandId);
    }

    [Fact]
    public async Task GetBandImageAsync_WithInvalidBandId_ShouldReturnNull()
    {
        var bandId = Guid.NewGuid();
        _bandRepository.GetBandByIdAsync(bandId).Returns((Band?)null);

        var result = await _bandService.GetBandImageAsync(bandId);

        Assert.Null(result);
        await _bandRepository.Received(1).GetBandByIdAsync(bandId);
    }

    [Fact]
    public async Task GetBandMembersAsync_WithValidBandId_ShouldReturnMembersList()
    {
        var bandId = Guid.NewGuid();
        var band = new Band
        {
            Id = bandId,
            Name = "Test Band",
            Genre = "Rock",
            Members =
            [
                new() { Id = Guid.NewGuid(), UserName = "member1", Email = "member1@test.com", Role = Roles.BandMember },
                new() { Id = Guid.NewGuid(), UserName = "member2", Email = "member2@test.com", Role = Roles.BandAdmin },
                new() { Id = Guid.NewGuid(), UserName = "member3", Email = "member3@test.com", Role = Roles.BandMember }
            ]
        };
        _bandRepository.GetBandByIdAsync(bandId).Returns(band);

        var result = await _bandService.GetBandMembersAsync(bandId);

        Assert.Equal(["member1", "member2", "member3"], result.Select(m => m.Name));
        await _bandRepository.Received(1).GetBandByIdAsync(bandId);
    }

    [Fact]
    public async Task GetBandMembersAsync_WithBandWithoutMembers_ShouldReturnEmptyArray()
    {
        var bandId = Guid.NewGuid();
        var band = new Band { Id = bandId, Name = "Test Band", Genre = "Rock", Members = [] };
        _bandRepository.GetBandByIdAsync(bandId).Returns(band);

        var result = await _bandService.GetBandMembersAsync(bandId);

        Assert.Empty(result);
        await _bandRepository.Received(1).GetBandByIdAsync(bandId);
    }

    private (User user, Band band) SetupUserAndBand(Roles role, bool isMember)
    {
        var user = new User { Id = Guid.NewGuid(), UserName = "user", Role = role };
        var band = new Band
        {
            Id = Guid.NewGuid(),
            Name = "Test Band",
            Genre = "Rock",
            Members = isMember ? [user] : []
        };

        _userRepository.GetUserByIdAsync(user.Id.ToString()).Returns(user);
        _bandRepository.GetBandByIdAsync(band.Id).Returns(band);

        return (user, band);
    }

    [Theory]
    [InlineData(Roles.Admin, false, true)]
    [InlineData(Roles.Admin, true, true)]
    [InlineData(Roles.BandAdmin, true, true)]
    [InlineData(Roles.BandAdmin, false, false)]
    [InlineData(Roles.BandMember, true, false)]
    [InlineData(Roles.Listener, false, false)]
    public async Task CanManageBandAsync_ShouldDependOnRoleAndMembership(Roles role, bool isMember, bool expected)
    {
        var (user, band) = SetupUserAndBand(role, isMember);

        var result = await _bandService.CanManageBandAsync(user.Id, band.Id);

        Assert.Equal(expected, result);
    }

    [Fact]
    public async Task CanManageBandAsync_WithUnknownUser_ShouldReturnFalse()
    {
        _userRepository.GetUserByIdAsync(Arg.Any<string>()).Returns((User?)null);

        var result = await _bandService.CanManageBandAsync(Guid.NewGuid(), Guid.NewGuid());

        Assert.False(result);
    }

    [Fact]
    public async Task CanManageBandAsync_WithUnknownBand_ShouldReturnFalse()
    {
        var (user, _) = SetupUserAndBand(Roles.BandAdmin, isMember: true);

        var result = await _bandService.CanManageBandAsync(user.Id, Guid.NewGuid());

        Assert.False(result);
    }

    [Fact]
    public async Task AddMemberToBandAsync_WithListener_ShouldAddAndPromoteToBandMember()
    {
        var (user, band) = SetupUserAndBand(Roles.Listener, isMember: false);

        await _bandService.AddMemberToBandAsync(user.Id, band.Id);

        Assert.Contains(user, band.Members);
        Assert.Equal(Roles.BandMember, user.Role);
        await _userRepository.Received(1).UpdateUserAsync(user);
    }

    [Theory]
    [InlineData(Roles.Admin)]
    [InlineData(Roles.BandAdmin)]
    public async Task AddMemberToBandAsync_WithElevatedRole_ShouldNotDemoteUser(Roles role)
    {
        var (user, band) = SetupUserAndBand(role, isMember: false);

        await _bandService.AddMemberToBandAsync(user.Id, band.Id);

        Assert.Contains(user, band.Members);
        Assert.Equal(role, user.Role);
        await _userRepository.DidNotReceiveWithAnyArgs().UpdateUserAsync(default!);
    }

    [Fact]
    public async Task AddMemberToBandAsync_WithExistingMember_ShouldNotAddAgain()
    {
        var (user, band) = SetupUserAndBand(Roles.BandMember, isMember: true);

        await _bandService.AddMemberToBandAsync(user.Id, band.Id);

        Assert.Single(band.Members);
        await _bandRepository.DidNotReceiveWithAnyArgs().UpdateBandAsync(default!);
    }
}
