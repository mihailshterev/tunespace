namespace TuneSpace.Core.Entities;

/// <summary>
/// A pending invitation for a user to join a band. The user joins only when they accept it;
/// accepting or declining removes the invitation.
/// </summary>
public class BandInvitation
{
    public Guid Id { get; set; }
    public Guid BandId { get; set; }
    public Guid UserId { get; set; }
    public Guid? InvitedById { get; set; }
    public DateTime CreatedAt { get; set; }

    public Band Band { get; set; } = null!;
    public User User { get; set; } = null!;
    public User? InvitedBy { get; set; }
}
