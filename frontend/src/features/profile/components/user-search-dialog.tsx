import { useState, useEffect } from "react";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/shared/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/shared/ui/dialog";
import { Input } from "@/shared/ui/input";
import { Button } from "@/shared/ui/button";
import { Search, Loader2, User } from "lucide-react";
import { ScrollArea } from "@/shared/ui/scroll-area";
import type UserType from "@/features/profile/types/user";
import { getUsersByNameSearch } from "@/features/profile/api/user.service";
import { toast } from "sonner";

interface UserSearchDialogProps {
  trigger: React.ReactNode;
  title: string;
  onSelectUser: (user: UserType) => void;
  buttonText?: string;
}

const UserSearchDialog = ({
  trigger,
  title,
  onSelectUser,
  buttonText = "Select",
}: UserSearchDialogProps) => {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<UserType[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    const searchUsers = async () => {
      if (!searchQuery.trim()) {
        setSearchResults([]);
        return;
      }

      setIsSearching(true);
      try {
        const users = await getUsersByNameSearch(searchQuery);
        setSearchResults(users);
      } catch (error) {
        console.error("Error searching users:", error);
        toast("Failed to search for users. Please try again.");
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    };

    const timer = setTimeout(() => {
      if (searchQuery) searchUsers();
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleSelectUser = (user: UserType) => {
    onSelectUser(user);
    setOpen(false);
    setSearchQuery("");
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <div className="relative mt-2">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search for users..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <ScrollArea className="mt-2 max-h-72">
          {isSearching ? (
            <div className="flex justify-center py-4">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : searchResults.length > 0 ? (
            <div className="space-y-1">
              {searchResults.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between gap-3 p-3 rounded-md hover:bg-accent cursor-pointer"
                  onClick={() => handleSelectUser(user)}
                >
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage
                        src={`data:image/jpeg;base64,${user.profilePicture}`}
                        className="object-cover"
                      />
                      <AvatarFallback>
                        {user.name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{user.name}</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    {buttonText}
                  </Button>
                </div>
              ))}
            </div>
          ) : searchQuery ? (
            <div className="text-center py-4 text-muted-foreground">
              No users found
            </div>
          ) : (
            <div className="text-center py-4 text-muted-foreground">
              <User className="h-10 w-10 mx-auto mb-2 text-muted-foreground/50" />
              <p>Search for users</p>
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default UserSearchDialog;
