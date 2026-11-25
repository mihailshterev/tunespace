import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { getMusicNews } from "@/features/news/api/news.service";
import { useState } from "react";

const useMusicNews = (initialPage: number = 1, pageSize: number = 12) => {
  const [page, setPage] = useState(initialPage);

  const { data, isLoading, isError, error, refetch, isPlaceholderData } =
    useQuery({
      queryKey: ["musicNews", page, pageSize],
      queryFn: () => getMusicNews(page, pageSize),
      placeholderData: keepPreviousData,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000,
    });

  const nextPage = () => {
    if (
      !isPlaceholderData &&
      data &&
      page < Math.ceil(data.totalResults / pageSize)
    ) {
      setPage((prev) => prev + 1);
    }
  };

  const prevPage = () => {
    setPage((prev) => Math.max(prev - 1, 1));
  };

  return {
    news: data?.articles || [],
    totalResults: data?.totalResults || 0,
    isLoading,
    isError,
    error,
    refetch,
    pagination: {
      page,
      pageSize,
      nextPage,
      prevPage,
      hasMore: data ? page < Math.ceil(data.totalResults / pageSize) : false,
      hasPrevious: page > 1,
    },
  };
};

export default useMusicNews;
