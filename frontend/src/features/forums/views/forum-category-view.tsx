import { useState } from "react";
import { Card, CardContent } from "@/shared/ui/card";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/shared/ui/avatar";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Search, Plus, MessageSquare, ArrowLeft } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import useForumThreads from "@/features/forums/hooks/useForumThreads";
import useForumCategory from "@/features/forums/hooks/useForumCategory";
import { Link, useParams } from "react-router";

export function ForumCategoryView() {
  const params = useParams();
  const categoryId = params.categoryId as string;

  const [searchQuery, setSearchQuery] = useState("");

  const { category } = useForumCategory(categoryId);
  const { threads, isLoading } = useForumThreads(categoryId);

  const filteredThreads = threads.filter((thread) =>
    thread.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const sortedThreads = [...filteredThreads].sort((a, b) => {
    if (a.isPinned && !b.isPinned) {
      return -1;
    }
    if (!a.isPinned && b.isPinned) {
      return 1;
    }

    return (
      new Date(b.lastActivityAt).getTime() -
      new Date(a.lastActivityAt).getTime()
    );
  });

  if (isLoading) {
    return (
      <div className="container max-w-6xl mx-auto py-8">
        <div className="flex justify-center py-20">
          <p>Loading threads...</p>
        </div>
      </div>
    );
  }

  if (!category) {
    return (
      <div className="container max-w-6xl mx-auto py-8">
        <div className="flex justify-center py-20">
          <p>Forum category not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container max-w-6xl mx-auto py-8">
      <div className="mb-6">
        <Link
          to="/forums"
          className="inline-flex items-center text-primary hover:text-primary/80 mb-2"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Forums
        </Link>
        <h1 className="text-3xl font-bold">{category.name}</h1>
        <p className="text-muted-foreground">{category.description}</p>
      </div>

      <div className="flex justify-between items-center mb-6">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search threads..."
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <Link to={`/forums/${categoryId}/new`}>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            New Thread
          </Button>
        </Link>
      </div>

      <div className="space-y-2 flex gap-4 flex-col">
        {sortedThreads.length > 0 ? (
          sortedThreads.map((thread) => (
            <Link key={thread.id} to={`/forums/${categoryId}/${thread.id}`}>
              <Card
                className={`hover:shadow-md transition-shadow ${
                  thread.isPinned ? "border-l-4 border-l-primary" : ""
                }`}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <Avatar className="h-10 w-10">
                      <AvatarImage
                        src={`data:image/png;base64,${thread.authorAvatar}`}
                        className="object-cover"
                      />
                      <AvatarFallback>
                        {thread.authorName?.charAt(0)}
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <h3 className="font-semibold text-lg">
                          {thread.title}
                        </h3>
                        {thread.isPinned && (
                          <Badge variant="outline" className="text-xs">
                            Pinned
                          </Badge>
                        )}
                      </div>

                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                        <span>By {thread.authorName ?? ""}</span>
                        <span>
                          Started {formatDistanceToNow(thread.createdAt)} ago
                        </span>
                        <span>
                          Latest {formatDistanceToNow(thread.lastActivityAt)}{" "}
                          ago
                        </span>
                      </div>
                    </div>

                    <div className="flex gap-4 text-muted-foreground text-sm">
                      <div className="flex items-center gap-1">
                        <MessageSquare className="h-4 w-4" />
                        <span>{thread.repliesCount}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            No threads found matching your search
          </div>
        )}
      </div>
    </div>
  );
}
