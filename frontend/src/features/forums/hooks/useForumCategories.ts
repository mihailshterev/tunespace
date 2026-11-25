import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createForumCategory, fetchCategories } from "@/features/forums/api/forum.service";

const useForumCategories = () => {
  const queryClient = useQueryClient();

  const {
    data: categories,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["forumCategories"],
    queryFn: fetchCategories,
  });

  const createForumCategoryMutation = useMutation({
    mutationFn: createForumCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["forumCategories"],
      });
    },
  });

  return {
    categories,
    isLoading,
    isError,
    error,
    refetch,
    createForumCategory: createForumCategoryMutation.mutateAsync,
    isCreating: createForumCategoryMutation.isPending,
  };
};

export default useForumCategories;
