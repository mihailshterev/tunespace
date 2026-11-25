import { useState } from "react";
import { Input } from "@/shared/ui/input";
import { Textarea } from "@/shared/ui/textarea";
import { Button } from "@/shared/ui/button";
import { toast } from "sonner";
import { MessagesSquare, Plus, ArrowLeft } from "lucide-react";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/shared/ui/select";
import { Music, Mic2, CalendarDays, Users, MessageSquare } from "lucide-react";
import useForumCategories from "@/features/forums/hooks/useForumCategories";
import { Link, useNavigate } from "react-router";

export function NewCategoryView() {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [iconName, setIconName] = useState("");
  const navigate = useNavigate();

  const { createForumCategory, isCreating } = useForumCategories();

  const iconOptions = [
    {
      value: "music",
      label: "Music",
      icon: <Music className="h-4 w-4 mr-2" />,
    },
    {
      value: "mic",
      label: "Mic",
      icon: <Mic2 className="h-4 w-4 mr-2" />,
    },
    {
      value: "calendar",
      label: "Calendar",
      icon: <CalendarDays className="h-4 w-4 mr-2" />,
    },
    {
      value: "users",
      label: "Users",
      icon: <Users className="h-4 w-4 mr-2" />,
    },
    {
      value: "message",
      label: "Message",
      icon: <MessageSquare className="h-4 w-4 mr-2" />,
    },
    {
      value: "discussion",
      label: "General / Other",
      icon: <MessagesSquare className="h-4 w-4 mr-2" />,
    },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await createForumCategory({ name, description, iconName });
      toast.success("Category created!");
      navigate("/forums");
    } catch {
      toast.error("Failed to create category");
    }
  };

  return (
    <div className="container max-w-xl mx-auto py-12">
      <div className="mb-6">
        <Link
          to="/forums"
          className="inline-flex items-center text-primary hover:text-primary/80 mb-2"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Forums
        </Link>
        <h1 className="text-3xl font-bold mb-6">Create New Forum Category</h1>
      </div>
      <form
        onSubmit={handleSubmit}
        className="space-y-5 bg-card p-6 rounded-xl border"
      >
        <div>
          <label className="block mb-1 font-medium">Name</label>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            placeholder="Category name"
          />
        </div>
        <div>
          <label className="block mb-1 font-medium">Description</label>
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
            placeholder="Describe this category"
          />
        </div>
        <div>
          <label className="block mb-1 font-medium">Icon</label>
          <Select value={iconName} onValueChange={setIconName}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select an icon" />
            </SelectTrigger>
            <SelectContent>
              {iconOptions.map((icon) => (
                <SelectItem key={icon.value} value={icon.value}>
                  <span className="flex items-center">
                    {icon.icon}
                    {icon.label}
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button type="submit" disabled={isCreating}>
          <Plus className="h-5 w-5 mr-2" />
          {isCreating ? "Creating..." : "Create Category"}
        </Button>
      </form>
    </div>
  );
}
