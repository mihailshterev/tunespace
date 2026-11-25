import { useEffect, useRef, useState } from "react";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/shared/ui/tabs";
import { Input } from "@/shared/ui/input";
import { Card } from "@/shared/ui/card";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/shared/ui/avatar";
import { Music, Search, User, X } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { useQuery } from "@tanstack/react-query";
import { getUsersByNameSearch } from "@/features/profile/api/user.service";
import { getSpotifySongsBySearch } from "@/shared/spotify/api/spotify.service";
import Loading from "@/shared/ui/loading";
import useSpotifyErrorHandler from "@/shared/spotify/hooks/useSpotifyErrorHandler";
import { BASE_URL, SPOTIFY_ENDPOINTS } from "@/shared/utils/constants";
import QuickShareButton from "@/features/discovery/components/quick-share-button";
import { useNavigate } from "react-router";

const HeaderSearchBar = () => {
  const [search, setSearch] = useState("");
  const [searchTab, setSearchTab] = useState<"songs" | "users">("songs");
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const navigate = useNavigate();
  const resultsRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const { parseSpotifyErrorSilent, isSpotifyConnected } =
    useSpotifyErrorHandler();

  const {
    data: searchSongs,
    isError: isSongsError,
    refetch: refetchSongs,
    isLoading: isSongsLoading,
  } = useQuery({
    queryKey: ["searchSongs", search],
    queryFn: () => getSpotifySongsBySearch(search),
    enabled: false,
    retry: (failureCount, error) => {
      const spotifyError = parseSpotifyErrorSilent(error);
      return spotifyError.type === "NETWORK_ERROR" && failureCount < 1;
    },
  });

  const {
    data: searchUsers,
    isError: isUsersError,
    error: usersError,
    refetch: refetchUsers,
    isLoading: isUsersLoading,
  } = useQuery({
    queryKey: ["searchUsers", search],
    queryFn: () => getUsersByNameSearch(search),
    enabled: false,
    retry: 1,
  });

  useEffect(() => {
    const queryDelay = setTimeout(() => {
      if (search !== "") {
        if (searchTab === "songs") {
          refetchSongs();
        } else {
          refetchUsers();
        }
        setSelectedIndex(-1);
      }
    }, 500);

    return () => clearTimeout(queryDelay);
  }, [search, searchTab, refetchSongs, refetchUsers]);

  const handleClearSearch = () => {
    setSearch("");
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    const results = searchTab === "songs" ? searchSongs : searchUsers;
    if (!results?.length) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < results.length - 1 ? prev + 1 : prev));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
    } else if (e.key === "Enter" && selectedIndex >= 0) {
      if (searchTab === "users" && searchUsers?.[selectedIndex]) {
        navigate(`/profile/${searchUsers[selectedIndex].name}`);
        setSearch("");
      } else {
        setSearch("");
      }
    } else if (e.key === "Escape") {
      setSearch("");
    }
  };

  useEffect(() => {
    if (selectedIndex >= 0 && resultsRef.current) {
      const selectedElement = resultsRef.current.children[
        selectedIndex
      ] as HTMLElement;
      if (selectedElement) {
        selectedElement.scrollIntoView({
          block: "nearest",
          behavior: "smooth",
        });
      }
    }
  }, [selectedIndex]);

  return (
    <div className="relative w-full max-w-xl ">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          ref={inputRef}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={handleKeyDown}
          className="pl-10 pr-10 focus-visible:ring-0 focus-visible:ring-offset-0"
          placeholder={
            searchTab === "songs" ? "Search songs..." : "Search users..."
          }
        />
        {search && (
          <Button
            variant="ghost"
            size="sm"
            className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
            onClick={handleClearSearch}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {search !== "" && (
        <Card
          className="w-full flex flex-col justify-center gap-2 
          mt-1 max-h-[600px] absolute 
          z-10 p-3 overflow-y-auto rounded-lg shadow-lg"
        >
          <Tabs
            value={searchTab}
            onValueChange={(value) => setSearchTab(value as "songs" | "users")}
          >
            <TabsList className="mb-2">
              <TabsTrigger value="songs" className="flex items-center gap-2">
                <Music className="h-4 w-4" />
                Songs
              </TabsTrigger>
              <TabsTrigger value="users" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Users
              </TabsTrigger>
            </TabsList>

            <TabsContent value="songs">
              <div ref={resultsRef} className="space-y-2">
                {isSongsLoading ? (
                  <div className="h-24 flex justify-center items-center">
                    <Loading />
                  </div>
                ) : searchSongs && searchSongs?.length > 0 ? (
                  searchSongs?.map((song, index) => (
                    <Card
                      key={index}
                      className={`p-3 flex items-center gap-3 hover:bg-accent transition-colors group ${
                        selectedIndex === index
                          ? "bg-accent border-primary"
                          : ""
                      }`}
                    >
                      <img
                        loading="lazy"
                        className="rounded shadow-sm"
                        src={song.albumArt}
                        alt={`${song.name} album art`}
                        width={50}
                        height={50}
                      />
                      <div
                        className="flex flex-col flex-1"
                        onClick={() => setSearch("")}
                      >
                        <span className="font-medium truncate text-wrap cursor-pointer">
                          {song.name}
                        </span>
                        <span className="text-sm text-muted-foreground truncate cursor-pointer">
                          {song.artist}
                        </span>
                      </div>
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                        {" "}
                        <QuickShareButton
                          song={{
                            title: song.name,
                            artist: song.artist,
                            spotifyUrl: `https://open.spotify.com/track/${song.id}`,
                            imageUrl: song.albumArt,
                          }}
                          variant="ghost"
                          size="sm"
                        />
                      </div>
                    </Card>
                  ))
                ) : searchSongs?.length === 0 ? (
                  <div className="p-4 text-center text-muted-foreground">
                    No songs found for &quot;{search}&quot;
                  </div>
                ) : isSongsError ? (
                  <div className="p-4 text-center">
                    {!isSpotifyConnected() ? (
                      <div className="text-amber-600">
                        <p className="font-medium">Spotify not connected</p>
                        <p className="text-sm text-muted-foreground">
                          Connect Spotify to search for songs
                        </p>
                        <Button
                          size="sm"
                          className="mt-2"
                          onClick={() =>
                            navigate(
                              `${BASE_URL}/${SPOTIFY_ENDPOINTS.CONNECT}`
                            )
                          }
                        >
                          Connect Spotify
                        </Button>
                      </div>
                    ) : (
                      <div className="text-destructive">
                        <p>Error searching songs</p>
                        <Button
                          size="sm"
                          variant="outline"
                          className="mt-2"
                          onClick={() => refetchSongs()}
                        >
                          Try Again
                        </Button>
                      </div>
                    )}
                  </div>
                ) : null}
              </div>
            </TabsContent>

            <TabsContent value="users">
              <div ref={resultsRef} className="space-y-2">
                {isUsersLoading ? (
                  <div className="h-24 flex justify-center items-center">
                    <Loading />
                  </div>
                ) : searchUsers && searchUsers.length > 0 ? (
                  searchUsers?.map((user, index) => (
                    <Card
                      key={index}
                      onClick={() => {
                        navigate(`/profile/${user.name}`);
                        setSearch("");
                      }}
                      className={`p-3 flex items-center gap-3 cursor-pointer hover:bg-accent transition-colors ${
                        selectedIndex === index
                          ? "bg-accent border-primary"
                          : ""
                      }`}
                    >
                      <Avatar>
                        <AvatarImage
                          src={`data:image/png;base64,${user.profilePicture}`}
                          className="object-cover"
                        />
                        <AvatarFallback>
                          {user.name.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col">
                        <span className="font-medium truncate">
                          {user.name}
                        </span>
                      </div>
                    </Card>
                  ))
                ) : searchUsers?.length === 0 ? (
                  <div className="p-4 text-center text-muted-foreground">
                    No users found for &quot;{search}&quot;
                  </div>
                ) : isUsersError ? (
                  <div className="p-4 text-center text-destructive">
                    Error: {usersError.message}
                  </div>
                ) : null}
              </div>
            </TabsContent>
          </Tabs>
        </Card>
      )}
    </div>
  );
};

export default HeaderSearchBar;
