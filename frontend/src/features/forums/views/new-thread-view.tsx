import { useState } from "react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/shared/ui/card";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Textarea } from "@/shared/ui/textarea";
import { ArrowLeft, Send } from "lucide-react";
import useForumCategory from "@/features/forums/hooks/useForumCategory";
import useForumThreads from "@/features/forums/hooks/useForumThreads";
import { toast } from "sonner";
import { Link, useNavigate, useParams } from "react-router";

export function NewThreadView() {
  const params = useParams();
  const navigate = useNavigate();
  const categoryId = params.categoryId as string;

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  const { category, isLoading } = useForumCategory(categoryId);
  const { createThread, isCreating } = useForumThreads(categoryId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (title.trim() === "" || content.trim() === "") {
      toast("Please fill in all fields", {
        duration: 3000,
      });
      return;
    }

    try {
      await createThread({
        title,
        content,
        categoryId,
      });
      toast("Thread created successfully", {
        duration: 3000,
      });
      navigate(`/forums/${categoryId}`);
    } catch {
      toast("Failed to create thread. Please try again.", { duration: 3000 });
    }
  };

  if (isLoading) {
    return (
      <div className="container max-w-3xl mx-auto py-8">
        <div className="flex justify-center py-20">
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (!category) {
    return (
      <div className="container max-w-3xl mx-auto py-8">
        <div className="flex justify-center py-20">
          <p>Category not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container max-w-3xl mx-auto py-8">
      <Link
        to={`/forums/${categoryId}`}
        className="inline-flex items-center text-primary hover:text-primary/80 mb-4"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to {category.name}
      </Link>

      <Card>
        <CardHeader>
          <CardTitle>Create New Thread in {category.name}</CardTitle>
        </CardHeader>

        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="title" className="text-sm font-medium">
                Thread Title
              </label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter a descriptive title"
                disabled={isCreating}
                required
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="content" className="text-sm font-medium">
                Content
              </label>
              <Textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Share your thoughts, questions, or ideas..."
                className="min-h-[200px]"
                disabled={isCreating}
                required
              />
            </div>
          </CardContent>

          <CardFooter className="flex justify-between border-t py-4">
            <div className="text-sm text-muted-foreground">
              Please follow our community guidelines
            </div>
            <Button type="submit" disabled={isCreating}>
              {isCreating ? (
                "Creating thread..."
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Create Thread
                </>
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
