import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createThread, fetchThreads } from "@/features/forums/api/forum.service";

const useForumThreads = (categoryId: string) => {
  const queryClient = useQueryClient();

  const {
    data: threads = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["forumThreads", categoryId],
    queryFn: () => fetchThreads(categoryId),
    enabled: !!categoryId,
  });

  const createThreadMutation = useMutation({
    mutationFn: createThread,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["forumThreads", categoryId],
      });
      queryClient.invalidateQueries({
        queryKey: ["forumCategories"],
      });
    },
  });

  return {
    threads,
    isLoading,
    isError,
    error,
    refetch,
    createThread: createThreadMutation.mutateAsync,
    isCreating: createThreadMutation.isPending,
    createError: createThreadMutation.error,
    createSuccess: createThreadMutation.isSuccess,
    resetCreateStatus: createThreadMutation.reset,
  };
};

export default useForumThreads;
