import { useState } from "react";
import useMusicNews from "@/features/news/hooks/useMusicNews";
import NewsCard from "@/features/news/components/news-card";
import Loading from "@/shared/ui/loading";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { FiSearch, FiRefreshCw } from "react-icons/fi";

export function NewsView() {
  const [searchTerm, setSearchTerm] = useState<string>("");
  const { news, totalResults, isLoading, isError, error, refetch, pagination } =
    useMusicNews();

  const filteredNews = searchTerm
    ? news.filter(
        (article) =>
          article.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          article.description?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : news;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[70vh]">
        <Loading />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] gap-4">
        <p className="text-xl text-destructive">Failed to load music news</p>
        <p className="text-sm text-muted-foreground">
          {error instanceof Error ? error.message : "An unknown error occurred"}
        </p>
        <Button onClick={() => refetch()} variant="outline">
          <FiRefreshCw className="mr-2" /> Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8 space-y-4">
        <h1 className="text-4xl font-bold">Music News</h1>
        <p className="text-muted-foreground">
          Stay updated with the latest happenings in the music world
        </p>

        <div className="relative max-w-md">
          <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search news..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>
      {filteredNews.length > 0 ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredNews.map((article, index) => (
              <NewsCard
                key={`${article.source.name}-${index}`}
                article={article}
              />
            ))}
          </div>
          <div className="mt-8 flex justify-between items-center">
            <p className="text-sm text-muted-foreground">
              Showing {(pagination.page - 1) * pagination.pageSize + 1} -{" "}
              {Math.min(pagination.page * pagination.pageSize, totalResults)} of{" "}
              {totalResults} articles
            </p>
            <div className="flex gap-4">
              <Button
                onClick={pagination.prevPage}
                disabled={!pagination.hasPrevious}
                variant="outline"
              >
                Previous
              </Button>
              <span className="flex items-center px-4 bg-secondary rounded">
                Page {pagination.page}
              </span>
              <Button
                onClick={pagination.nextPage}
                disabled={!pagination.hasMore}
                variant="outline"
              >
                Next
              </Button>
            </div>
          </div>
        </>
      ) : (
        <div className="flex flex-col items-center justify-center min-h-[40vh] gap-2">
          <p className="text-xl">No news articles found</p>
          {searchTerm && (
            <p className="text-muted-foreground">
              Try adjusting your search terms
            </p>
          )}
        </div>
      )}
    </div>
  );
}
