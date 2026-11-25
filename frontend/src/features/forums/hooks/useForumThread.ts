import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createPost,
  fetchThread,
  likePost,
  unlikePost,
} from "@/features/forums/api/forum.service";

const useForumThread = (threadId: string) => {
  const queryClient = useQueryClient();

  const {
    data: thread,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["forumThread", threadId],
    queryFn: () => fetchThread(threadId),
    enabled: !!threadId,
  });

  const createPostMutation = useMutation({
    mutationFn: createPost,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["forumThread", threadId],
      });
    },
  });

  const likePostMutation = useMutation({
    mutationFn: likePost,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["forumThread", threadId],
      });
    },
  });

  const unlikePostMutation = useMutation({
    mutationFn: unlikePost,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["forumThread", threadId],
      });
    },
  });

  // TODO
  // const replyMutation = useMutation({
  //   mutationFn: async (content: string) => {
  //     return httpClient.post(
  //       `/api/forums/categories/${categoryId}/threads/${threadId}/reply`,
  //       {
  //         content,
  //       }
  //     );
  //   },
  //   onSuccess: () => {
  //     queryClient.invalidateQueries({
  //       queryKey: ["forumThread", categoryId, threadId],
  //     });
  //   },
  // });

  return {
    thread,
    isLoading,
    isError,
    error,
    refetch,
    likePost: likePostMutation.mutateAsync,
    unlikePost: unlikePostMutation.mutateAsync,
    createPost: createPostMutation.mutateAsync,
    isCreating: createPostMutation.isPending,
    isPending: likePostMutation.isPending || unlikePostMutation.isPending,
    // replyToThread: replyMutation.mutate,
    // isSubmitting: replyMutation.isPending,
  };
};

export default useForumThread;
