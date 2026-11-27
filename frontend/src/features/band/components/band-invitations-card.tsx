import { useState } from "react";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import { Guitar } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/ui/avatar";
import { Button } from "@/shared/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { getErrorMessage } from "@/shared/api/error-message";
import { ROUTES } from "@/shared/utils/constants";
import { useMyBandInvitations } from "@/features/band/hooks/useBandInvitations";
import type BandInvitation from "@/features/band/types/band-invitation";

/**
 * Lists the signed-in user's pending band invitations so they can accept or decline them.
 * Renders nothing when there are none.
 */
export function BandInvitationsCard() {
  const navigate = useNavigate();
  const { invitations, acceptInvitation, declineInvitation } =
    useMyBandInvitations();
  const [busyId, setBusyId] = useState<string | null>(null);

  if (invitations.length === 0) {
    return null;
  }

  const accept = async (invitation: BandInvitation) => {
    setBusyId(invitation.id);
    try {
      await acceptInvitation(invitation.id);
      toast.success(`You joined ${invitation.bandName}!`);
      navigate(ROUTES.BAND_DASHBOARD);
    } catch (error) {
      toast.error(
        getErrorMessage(error, "The invitation couldn't be accepted."),
      );
    } finally {
      setBusyId(null);
    }
  };

  const decline = async (invitation: BandInvitation) => {
    setBusyId(invitation.id);
    try {
      await declineInvitation(invitation.id);
      toast(`Declined the invitation to ${invitation.bandName}`);
    } catch (error) {
      toast.error(
        getErrorMessage(error, "The invitation couldn't be declined."),
      );
    } finally {
      setBusyId(null);
    }
  };

  return (
    <Card className="mb-6 border-primary/30">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Guitar className="h-5 w-5 text-primary" />
          Band invitations
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {invitations.map((invitation) => (
          <div
            key={invitation.id}
            className="flex flex-wrap items-center gap-3 rounded-lg bg-primary/5 p-3"
          >
            <Avatar className="h-10 w-10 rounded-md">
              {invitation.bandCoverImage && (
                <AvatarImage
                  src={`data:image/jpeg;base64,${invitation.bandCoverImage}`}
                  className="object-cover"
                />
              )}
              <AvatarFallback className="rounded-md">
                {invitation.bandName.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium">
                {invitation.invitedByName ?? "A band manager"} invited you to
                join <span className="font-semibold">{invitation.bandName}</span>
              </p>
              <p className="text-xs text-muted-foreground">
                {formatDistanceToNow(new Date(invitation.createdAt), {
                  addSuffix: true,
                })}
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={busyId !== null}
                onClick={() => decline(invitation)}
              >
                Decline
              </Button>
              <Button
                size="sm"
                disabled={busyId !== null}
                onClick={() => accept(invitation)}
              >
                Accept
              </Button>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
