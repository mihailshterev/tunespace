import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  followBand,
  unfollowBand,
  isFollowingBand,
  getBandFollowerCount,
  getBandFollowers,
} from "@/features/band/api/band.service";
import type { UserSearchResultResponse } from "@/features/profile/api/follow.service";
import { toast } from "sonner";
import useAuth from "@/shared/auth/hooks/useAuth";

export const useBandFollow = (
  bandId: string,
  options?: { enableFollowers?: boolean }
) => {
  const { auth, isAuthenticated } = useAuth();
  const queryClient = useQueryClient();

  const { enableFollowers = false } = options || {};

  const { data: isFollowing = false, isLoading: isCheckingFollow } = useQuery({
    queryKey: ["bandFollow", bandId, auth?.id],
    queryFn: () => isFollowingBand(bandId),
    enabled: isAuthenticated && !!bandId,
  });

  const { data: followerCount = 0 } = useQuery({
    queryKey: ["bandFollowerCount", bandId],
    queryFn: () => getBandFollowerCount(bandId),
    enabled: !!bandId,
  });

  const {
    data: followers = [] as UserSearchResultResponse[],
    isLoading: isLoadingFollowers,
  } = useQuery({
    queryKey: ["bandFollowers", bandId],
    queryFn: () => getBandFollowers(bandId),
    enabled: !!bandId && enableFollowers,
  });

  const followMutation = useMutation({
    mutationFn: () => followBand(bandId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["bandFollow", bandId, auth?.id],
      });
      queryClient.invalidateQueries({
        queryKey: ["bandFollowerCount", bandId],
      });
      queryClient.invalidateQueries({ queryKey: ["bandFollowers", bandId] });
      queryClient.invalidateQueries({
        queryKey: ["userFollowedBands", auth?.id],
      });
      toast.success("Following band");
    },
    onError: (error) => {
      console.error("Error following band:", error);
      toast.error("Failed to follow band");
    },
  });

  const unfollowMutation = useMutation({
    mutationFn: () => unfollowBand(bandId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["bandFollow", bandId, auth?.id],
      });
      queryClient.invalidateQueries({
        queryKey: ["bandFollowerCount", bandId],
      });
      queryClient.invalidateQueries({ queryKey: ["bandFollowers", bandId] });
      queryClient.invalidateQueries({
        queryKey: ["userFollowedBands", auth?.id],
      });
      toast.success("Unfollowed band");
    },
    onError: (error) => {
      console.error("Error unfollowing band:", error);
      toast.error("Failed to unfollow band");
    },
  });
  const toggleFollow = () => {
    if (!isAuthenticated) {
      toast.error("Please log in to follow bands");
      return;
    }

    if (isFollowing) {
      unfollowMutation.mutate();
    } else {
      followMutation.mutate();
    }
  };

  return {
    isFollowing,
    followerCount,
    followers,
    isCheckingFollow,
    isLoadingFollowers,
    isLoading: followMutation.isPending || unfollowMutation.isPending,
    toggleFollow,
  };
};
