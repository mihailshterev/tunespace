using TuneSpace.Core.Enums;

namespace TuneSpace.Core.Models;

public record UserAccessState(Roles Role, bool IsSuspended);
