import { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shared/ui/card";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import {
  Search,
  Plus,
  MessageSquare,
  Users,
  Music,
  Mic2,
  CalendarDays,
} from "lucide-react";
import { Badge } from "@/shared/ui/badge";
import useForumCategories from "@/features/forums/hooks/useForumCategories";
import { Link } from "react-router";

const ForumList = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const { categories, isLoading, error } = useForumCategories();

  const getIconForCategory = (iconName: string | null) => {
    switch (iconName) {
      case "music":
        return <Music className="h-5 w-5" />;
      case "mic":
        return <Mic2 className="h-5 w-5" />;
      case "calendar":
        return <CalendarDays className="h-5 w-5" />;
      case "users":
        return <Users className="h-5 w-5" />;
      default:
        return <MessageSquare className="h-5 w-5" />;
    }
  };

  const filteredCategories = categories
    ? categories.filter(
        (category) =>
          category.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          category.description.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  const pinnedCategories = filteredCategories.filter((c) => c.pinned);
  const regularCategories = filteredCategories.filter((c) => !c.pinned);

  if (isLoading) {
    return (
      <div className="container max-w-6xl mx-auto py-8">
        <div className="flex justify-center py-20">
          <p>Loading forums...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container max-w-6xl mx-auto py-8">
        <div className="flex justify-center py-20">
          <p>Error loading forums: {error.message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container max-w-6xl mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Community Forums</h1>
        <Link to="/forums/new-category">
          <Button>
            <Plus className="h-5 w-5 mr-2" />
            New Category
          </Button>
        </Link>
      </div>

      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <Input
          placeholder="Search forums..."
          className="pl-10"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="space-y-4 flex gap-2 flex-col">
        {pinnedCategories.length > 0 && (
          <div>
            {pinnedCategories.map((category) => (
              <Link key={category.id} to={`/forums/${category.id}`}>
                <Card className="hover:shadow-md transition-shadow border-2 border-primary bg-primary/5 relative">
                  <span className="absolute top-3 left-3 z-10">
                    <Badge
                      variant="secondary"
                      className="bg-primary text-white"
                    >
                      Pinned
                    </Badge>
                  </span>
                  <CardHeader className="flex flex-row items-center gap-4 pb-2">
                    <div className="bg-accent rounded-lg p-2">
                      {getIconForCategory(category.iconName)}
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-center">
                        <CardTitle>{category.name}</CardTitle>
                        <Badge variant="outline" className="ml-2">
                          {category.totalThreads} threads
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {category.description}
                      </p>
                    </div>
                  </CardHeader>
                  <CardContent className="pb-4 pt-0">
                    <div className="flex justify-end text-xs text-muted-foreground">
                      {category.totalPosts} posts
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}

        {regularCategories.map((category) => (
          <Link key={category.id} to={`/forums/${category.id}`}>
            <Card className="hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center gap-4 pb-2">
                <div className="bg-accent rounded-lg p-2">
                  {getIconForCategory(category.iconName)}
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-center">
                    <CardTitle>{category.name}</CardTitle>
                    <Badge variant="outline" className="ml-2">
                      {category.totalThreads} threads
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    {category.description}
                  </p>
                </div>
              </CardHeader>
              <CardContent className="pb-4 pt-0">
                <div className="flex justify-end text-xs text-muted-foreground">
                  {category.totalPosts} posts
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}

        {filteredCategories.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            No forums found matching your search
          </div>
        )}
      </div>
    </div>
  );
};

export default ForumList;
