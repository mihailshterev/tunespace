import ForumThread from "@/features/forums/components/forum-thread";
import { ArrowLeft } from "lucide-react";
import useForumThread from "@/features/forums/hooks/useForumThread";
import { Link, useParams } from "react-router";

export function ForumThreadView() {
  const params = useParams();
  const categoryId = params.categoryId as string;
  const threadId = params.threadId as string;

  const { thread, isLoading } = useForumThread(threadId);

  if (isLoading) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex justify-center py-20">
          <p>Loading thread...</p>
        </div>
      </div>
    );
  }

  if (!thread) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex justify-center py-20">
          <p>Thread not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-6">
      <Link
        to={`/forums/${categoryId}`}
        className="inline-flex items-center text-primary hover:text-primary/80 ml-8 mt-8"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to {thread.categoryName}
      </Link>

      <ForumThread
        threadId={thread.id}
        title={thread.title}
        categoryName={thread.categoryName}
        posts={thread.posts}
      />
    </div>
  );
}
