import { useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  acceptBandInvitation,
  cancelBandInvitation,
  declineBandInvitation,
  getBandInvitations,
  getMyBandInvitations,
  inviteBandMember,
} from "@/features/band/api/band-invitation.service";
import { checkCurrentUser } from "@/shared/auth/api/auth.service";
import { CURRENT_USER_QUERY_KEY } from "@/shared/auth/hooks/useAuthSync";
import useAuth from "@/shared/auth/hooks/useAuth";
import useSocket from "@/shared/realtime/useSocket";
import { NotificationTypes } from "@/shared/utils/constants";

const MY_INVITATIONS_KEY = ["bandInvitations", "mine"] as const;
const bandInvitationsKey = (bandId: string) =>
  ["bandInvitations", "band", bandId] as const;

/** Changes whenever a band invitation notification arrives over the socket. */
const useInviteNotificationCount = () => {
  const { notifications } = useSocket();
  return notifications.filter((n) => n.type === NotificationTypes.BandInvite)
    .length;
};

/** The signed-in user's pending invitations, with accept and decline. */
export const useMyBandInvitations = () => {
  const queryClient = useQueryClient();
  const { auth, isAuthenticated, updateAuth } = useAuth();
  const inviteNotificationCount = useInviteNotificationCount();

  const { data: invitations = [], isLoading } = useQuery({
    queryKey: MY_INVITATIONS_KEY,
    queryFn: getMyBandInvitations,
    enabled: isAuthenticated,
  });

  useEffect(() => {
    if (inviteNotificationCount > 0) {
      queryClient.invalidateQueries({ queryKey: MY_INVITATIONS_KEY });
    }
  }, [inviteNotificationCount, queryClient]);

  const { mutateAsync: acceptInvitation } = useMutation({
    mutationFn: acceptBandInvitation,
    onSuccess: async () => {
      queryClient.invalidateQueries({ queryKey: MY_INVITATIONS_KEY });
      queryClient.invalidateQueries({ queryKey: ["band", auth?.id] });
      // Joining a band changes the user's role. Apply it before resolving so callers can
      // go straight to the band dashboard, which is only open to band roles.
      const currentUser = await queryClient.fetchQuery({
        queryKey: CURRENT_USER_QUERY_KEY,
        queryFn: checkCurrentUser,
        staleTime: 0,
      });
      if (currentUser?.role) {
        updateAuth({ role: currentUser.role });
      }
    },
  });

  const { mutateAsync: declineInvitation } = useMutation({
    mutationFn: declineBandInvitation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: MY_INVITATIONS_KEY });
    },
  });

  return { invitations, isLoading, acceptInvitation, declineInvitation };
};

/** A band's pending invitations, for band managers. */
export const useBandInvitations = (
  bandId: string | undefined,
  canManageBand: boolean,
) => {
  const queryClient = useQueryClient();
  const { auth } = useAuth();
  const inviteNotificationCount = useInviteNotificationCount();
  const enabled = !!bandId && canManageBand;

  const { data: invitations = [] } = useQuery({
    queryKey: bandInvitationsKey(bandId ?? ""),
    queryFn: () => getBandInvitations(bandId!),
    enabled,
  });

  // The inviter is notified when someone accepts or declines, so the list and members may have changed.
  useEffect(() => {
    if (enabled && inviteNotificationCount > 0) {
      queryClient.invalidateQueries({ queryKey: bandInvitationsKey(bandId!) });
      queryClient.invalidateQueries({ queryKey: ["band", auth?.id] });
    }
  }, [inviteNotificationCount, enabled, bandId, auth?.id, queryClient]);

  const refresh = () =>
    queryClient.invalidateQueries({ queryKey: bandInvitationsKey(bandId!) });

  const { mutateAsync: inviteMember } = useMutation({
    mutationFn: (userId: string) => inviteBandMember(bandId!, userId),
    onSuccess: refresh,
  });

  const { mutateAsync: cancelInvitation } = useMutation({
    mutationFn: (invitationId: string) =>
      cancelBandInvitation(bandId!, invitationId),
    onSuccess: refresh,
  });

  return { invitations, inviteMember, cancelInvitation };
};
