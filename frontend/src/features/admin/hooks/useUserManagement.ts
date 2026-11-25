import { useEffect, useMemo } from "react";
import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { toast } from "sonner";
import { getErrorMessage } from "@/shared/api/error-message";
import { UserRole } from "@/shared/utils/constants";
import { deleteBand } from "@/features/band/api/band.service";
import {
  getManagedUsers,
  getProfilePictureBlob,
  getUserStats,
  setUserSuspended,
  updateUserRole,
} from "@/features/admin/api/user-management.service";
import type {
  ManagedUser,
  UserListFilters,
} from "@/features/admin/types/managed-user";

const ADMIN_USERS_KEY = ["admin", "users"] as const;

export const useManagedUsers = (filters: UserListFilters) =>
  useQuery({
    queryKey: [...ADMIN_USERS_KEY, "list", filters],
    queryFn: () => getManagedUsers(filters),
    placeholderData: keepPreviousData,
  });

export const useUserStats = () =>
  useQuery({
    queryKey: [...ADMIN_USERS_KEY, "stats"],
    queryFn: getUserStats,
  });

/** Loads a user's profile picture through the authenticated client and exposes it as an object URL. */
export const useUserAvatar = (username: string, enabled: boolean) => {
  const { data: blob } = useQuery({
    queryKey: ["user-avatar", username],
    queryFn: () => getProfilePictureBlob(username),
    enabled,
    staleTime: 5 * 60_000,
    retry: false,
  });

  const url = useMemo(
    () => (blob && blob.size > 0 ? URL.createObjectURL(blob) : undefined),
    [blob],
  );

  useEffect(
    () => () => {
      if (url) URL.revokeObjectURL(url);
    },
    [url],
  );

  return url;
};

const useInvalidateUsers = () => {
  const queryClient = useQueryClient();
  return () => {
    queryClient.invalidateQueries({ queryKey: ADMIN_USERS_KEY });
    queryClient.invalidateQueries({ queryKey: ["band"] });
  };
};

export const useChangeUserRole = () => {
  const invalidate = useInvalidateUsers();
  return useMutation({
    mutationFn: ({ userId, role }: { userId: string; role: UserRole }) =>
      updateUserRole(userId, role),
    onSuccess: (user) => {
      toast.success(`${user.username} is now ${user.role}`);
      invalidate();
    },
    onError: (error) =>
      toast.error(getErrorMessage(error, "Couldn't update the user's role")),
  });
};

/**
 * For a user who is the only member of their band: deletes the band (which returns its member to
 * Listener), then applies the requested role if it differs, e.g. a site admin demoted to Listener.
 */
export const useDeleteBandAndSetRole = () => {
  const invalidate = useInvalidateUsers();
  return useMutation({
    mutationFn: async ({ user, role }: { user: ManagedUser; role: UserRole }) => {
      if (!user.band) throw new Error("User has no band");
      await deleteBand(user.band.id);
      const roleAfterDelete =
        user.role === UserRole.Admin ? UserRole.Admin : UserRole.Listener;
      if (role !== roleAfterDelete) {
        await updateUserRole(user.id, role);
      }
      return { bandName: user.band.name, username: user.username };
    },
    onSuccess: ({ bandName, username }) => {
      toast.success(`${bandName} was deleted and ${username} updated`);
      invalidate();
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Couldn't delete the band"));
      invalidate();
    },
  });
};

export const useSetUserSuspended = () => {
  const invalidate = useInvalidateUsers();
  return useMutation({
    mutationFn: ({
      userId,
      suspended,
    }: {
      userId: string;
      suspended: boolean;
    }) => setUserSuspended(userId, suspended),
    onSuccess: (user) => {
      toast.success(
        user.isSuspended
          ? `${user.username} has been suspended`
          : `${user.username} has been restored`,
      );
      invalidate();
    },
    onError: (error) =>
      toast.error(getErrorMessage(error, "Couldn't update the account status")),
  });
};
