namespace TuneSpace.Core.Exceptions;

/// <summary>
/// The request is valid but would leave the system in an inconsistent state (for example, a band
/// without anyone able to manage it). The message is safe to show to the user.
/// </summary>
public class ConflictException(string message) : Exception(message);
