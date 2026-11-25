import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/shared/ui/dialog";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Textarea } from "@/shared/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";
import useForumCategories from "@/features/forums/hooks/useForumCategories";
import useForumThreads from "@/features/forums/hooks/useForumThreads";
import { Send } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router";

interface CreateDiscussionDialogProps {
  buttonText?: string;
  buttonVariant?:
    | "default"
    | "outline"
    | "secondary"
    | "ghost"
    | "destructive"
    | "link";
}

const CreateDiscussionDialog = ({
  buttonText = "Start Discussion",
  buttonVariant = "default",
}: CreateDiscussionDialogProps) => {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  const { categories, isLoading: isCategoriesLoading } = useForumCategories();
  const { createThread, isCreating } = useForumThreads(categoryId);

  const handleSubmit = async () => {
    if (title.trim() === "" || content.trim() === "" || !categoryId) {
      toast.error("Please fill in all fields");
      return;
    }

    try {
      await createThread({
        title,
        content,
        categoryId,
      });
      toast.success("Discussion created successfully");

      setIsOpen(false);
      setTitle("");
      setContent("");
      setCategoryId("");

      navigate(`/forums/${categoryId}`);
    } catch {
      toast.error("Failed to create discussion. Please try again.");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant={buttonVariant}>{buttonText}</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>Start a New Discussion</DialogTitle>
          <DialogDescription>
            Share your thoughts, ask questions, or start a conversation with the
            community.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <label htmlFor="category" className="text-right text-sm">
              Category
            </label>
            <Select value={categoryId} onValueChange={setCategoryId}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {isCategoriesLoading ? (
                  <SelectItem value="loading" disabled>
                    Loading categories...
                  </SelectItem>
                ) : categories && categories.length > 0 ? (
                  categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value="none" disabled>
                    No categories found
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <label htmlFor="title" className="text-right text-sm">
              Title
            </label>
            <Input
              id="title"
              className="col-span-3"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter a descriptive title"
            />
          </div>
          <div className="grid grid-cols-4 items-start gap-4">
            <label htmlFor="content" className="text-right text-sm">
              Content
            </label>
            <Textarea
              id="content"
              className="col-span-3 min-h-[120px]"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Share your thoughts, questions, or ideas..."
            />
          </div>
        </div>
        <DialogFooter>
          <Button type="submit" onClick={handleSubmit} disabled={isCreating}>
            {isCreating ? (
              "Creating..."
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                Create Discussion
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CreateDiscussionDialog;
