import { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shared/ui/card";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/shared/ui/avatar";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { Users, Eye, EyeOff } from "lucide-react";
import { Skeleton } from "@/shared/ui/skeleton";
import { useBandFollow } from "@/features/band/hooks/useBandFollow";
import type { UserSearchResultResponse } from "@/features/profile/api/follow.service";

interface BandFollowersProps {
  bandId: string;
  showFollowersList?: boolean;
}

const BandFollowers = ({
  bandId,
  showFollowersList = false,
}: BandFollowersProps) => {
  const [showList, setShowList] = useState(showFollowersList);

  const { followerCount, isCheckingFollow, followers, isLoadingFollowers } =
    useBandFollow(bandId, { enableFollowers: showList });

  const isLoading = isCheckingFollow || isLoadingFollowers;

  const toggleShowList = () => {
    setShowList(!showList);
  };

  if (isLoading && followerCount === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            <Skeleton className="h-6 w-24" />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-8 w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-blue-900/20 to-transparent">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            <span>Followers</span>
            <Badge variant="secondary">{followerCount.toLocaleString()}</Badge>
          </div>
          {followerCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleShowList}
              className="gap-2"
            >
              {showList ? (
                <>
                  <EyeOff className="h-4 w-4" />
                  Hide
                </>
              ) : (
                <>
                  <Eye className="h-4 w-4" />
                  Show
                </>
              )}
            </Button>
          )}
        </CardTitle>
      </CardHeader>
      {showList && (
        <CardContent className="p-4">
          {followers.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {followers.map((follower: UserSearchResultResponse) => (
                <div
                  key={follower.id}
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-accent/50 transition-colors"
                >
                  <Avatar className="h-10 w-10">
                    <AvatarImage
                      src={`data:image/png;base64,${follower.profilePicture}`}
                      className="object-cover"
                    />
                    <AvatarFallback className="text-xs">
                      {follower?.name?.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm font-medium truncate">
                    {follower.name}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6">
              <Users className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">No followers yet</p>
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
};

export default BandFollowers;
