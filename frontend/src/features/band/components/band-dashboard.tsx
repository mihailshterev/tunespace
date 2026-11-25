import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/ui/avatar";
import { Card, CardHeader, CardTitle, CardContent } from "@/shared/ui/card";
import { FaSpotify, FaYoutube } from "react-icons/fa";
import YouTubeEmbedDialog from "./youtube-embed-dialog";
import useAuth from "@/shared/auth/hooks/useAuth";
import useBandData from "@/features/band/hooks/useBandData";
import Loading from "@/shared/ui/loading";
import ConnectSpotifyDialog from "./connect-spotify-dialog";
import EditBandDialog from "./edit-band-dialog";
import { Users, CalendarDays, Music, Guitar } from "lucide-react";
import CreateDiscussionDialog from "@/features/forums/components/create-discussion-dialog";
import AddEventDialog from "@/features/events/components/add-event-dialog";
import useEvents from "@/features/events/hooks/useEvents";
import type UserType from "@/features/profile/types/user";
import { toast } from "sonner";
import AddMerchandiseDialog from "./add-merchandise-dialog";
import { BandMembers } from "./band-members";
import { DeleteBandSection } from "./delete-band-section";
import { getErrorMessage } from "@/shared/api/error-message";
import useMerchandise from "@/features/band/hooks/useMerchandise";
import BandFollowers from "./band-followers";
import BandMessagingDashboard from "./band-messaging-dashboard";
import { useBandFollow } from "@/features/band/hooks/useBandFollow";
import useBandChat from "@/features/band/hooks/useBandChat";
import { useSpotifyErrorHandler } from "@/shared/spotify/hooks/useSpotifyErrorHandler";
import SpotifyFallback from "@/shared/spotify/components/spotify-fallback";
import { Link } from "react-router";
import { BAND_MANAGER_ROLES, hasRole } from "@/shared/auth/permissions";

const BandDashboard = () => {
  const { auth } = useAuth();
  const canManageBand = hasRole(auth?.role, BAND_MANAGER_ROLES);

  const { bandData, mutations, isBandLoading, isBandError, bandError } =
    useBandData(auth?.id || "");

  const { bandEvents } = useEvents(bandData?.band?.id || "");

  const {
    merchandise,
    isLoading: isMerchandiseLoading,
    refetch: refetchMerchandise,
  } = useMerchandise(bandData?.band?.id || "");

  const { followerCount } = useBandFollow(bandData?.band?.id || "");

  const { isSpotifyConnected } = useSpotifyErrorHandler();

  const { chatData } = useBandChat({
    bandId: bandData?.band?.id || "",
  });

  const bandChats = chatData?.bandChats || [];
  const messages = chatData?.messages || [];

  const totalNewMessages = bandChats.reduce((total) => {
    try {
      return (
        total +
        (messages?.filter((msg) => !msg.isRead && !msg.isFromBand).length || 0)
      );
    } catch (error) {
      console.error("Error calculating new messages:", error);
      return total;
    }
  }, 0);

  const totalUserMessages = bandChats.reduce((total) => {
    try {
      return total + (messages?.filter((msg) => !msg.isFromBand).length || 0);
    } catch (error) {
      console.error("Error calculating user messages:", error);
      return total;
    }
  }, 0);

  const totalBandResponses = bandChats.reduce((total) => {
    try {
      return total + (messages?.filter((msg) => msg.isFromBand).length || 0);
    } catch (error) {
      console.error("Error calculating band responses:", error);
      return total;
    }
  }, 0);

  const responseRate =
    totalUserMessages > 0
      ? Math.round((totalBandResponses / totalUserMessages) * 100)
      : 0;

  const [isSpotifyDialogOpen, setIsSpotifyDialogOpen] = useState(false);

  const handleSpotifyIdUpdate = async (spotifyId: string) => {
    try {
      const formData = new FormData();
      formData.append("id", bandData.band?.id || "");
      formData.append("spotifyId", spotifyId);

      await mutations.updateBandMutation(formData);

      toast("Spotify connection successful", { duration: 5000 });
      setIsSpotifyDialogOpen(false);
    } catch (error) {
      toast(
        `Failed to connect Spotify: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
        { duration: 5000 },
      );
      console.error("Spotify connection error:", error);
    }
  };

  const handleYouTubeEmbedIdUpdate = async (youTubeEmbedId: string) => {
    try {
      const formData = new FormData();
      formData.append("id", bandData.band?.id || "");
      formData.append("youTubeEmbedId", youTubeEmbedId);

      await mutations.updateBandMutation(formData);

      toast("YouTube video successfully embedded", { duration: 5000 });
    } catch (error) {
      toast(
        `Failed to update YouTube embed: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
        { duration: 5000 },
      );
      console.error("YouTube embed update error:", error);
    }
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleBandUpdate = async (updatedBand: any) => {
    try {
      if (!bandData?.band?.id) {
        throw new Error("Band ID is missing");
      }

      const formData = new FormData();
      formData.append("id", bandData.band.id);
      formData.append("name", updatedBand.name || "");
      formData.append("description", updatedBand.description || "");
      formData.append("genre", updatedBand.genre || "");
      formData.append("spotifyId", updatedBand.spotifyId || "");
      formData.append("youTubeEmbedId", updatedBand.youTubeEmbedId || "");

      if (updatedBand.picture) {
        formData.append("picture", updatedBand.picture);
      }

      await mutations.updateBandMutation(formData);

      toast("Band information updated successfully", { duration: 5000 });
    } catch (error) {
      toast(
        `Failed to update band: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
        { duration: 5000 },
      );
      console.error("Band update error:", error);
    }
  };

  const handleAddMember = async (user: UserType) => {
    try {
      if (!bandData?.band?.id) {
        throw new Error("Band ID is missing");
      }

      if (!user?.id) {
        throw new Error("User ID is missing");
      }

      await mutations.addMemberMutation({
        bandId: bandData.band.id,
        userId: user.id,
      });
      toast(`Added ${user.name} as a band member!`);
    } catch (error) {
      console.error("Error adding band member:", error);
      toast.error(
        getErrorMessage(error, "Failed to add member. Please try again."),
      );
    }
  };

  if (isBandLoading) {
    return <Loading />;
  }

  if (isBandError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600">
            Error Loading Band Data
          </h2>
          <p className="text-muted-foreground mt-2">
            {bandError instanceof Error
              ? bandError.message
              : "Failed to load band information. Please try again."}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/80"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!bandData?.band) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[600px] gap-8 p-8">
        <Card className="w-full max-w-2xl shadow-lg border-2 border-muted/20 bg-gradient-to-br from-purple-50/50 to-blue-50/50 dark:from-purple-950/20 dark:to-blue-950/20">
          <CardContent className="p-12 text-center">
            <div className="mb-8 flex justify-center">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full blur-xl opacity-20 animate-pulse"></div>
                <div className="relative bg-gradient-to-r from-purple-500 to-blue-500 p-6 rounded-full">
                  <Music className="h-16 w-16 text-white" />
                </div>
              </div>
            </div>

            <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              Start Your Musical Journey
            </h2>

            <p className="text-xl text-muted-foreground mb-2">
              No band found in your account yet
            </p>

            <p className="text-muted-foreground mb-8 max-w-lg mx-auto leading-relaxed">
              Create your band profile to connect with fans, share your music,
              manage events, and build your musical community on TuneSpace.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 items-center justify-center mb-8">
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-purple-500" />
                  <span>Connect with fans</span>
                </div>
              </div>
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Guitar className="h-4 w-4 text-blue-500" />
                  <span>Share your music</span>
                </div>
              </div>
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <CalendarDays className="h-4 w-4 text-green-500" />
                  <span>Manage events</span>
                </div>
              </div>
            </div>

            <Link to="/band/register">
              <button className="px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold rounded-lg shadow-lg transform transition-all duration-200 hover:shadow-xl">
                <div className="flex items-center gap-2">
                  <Music className="h-5 w-5" />
                  Create Your Band
                </div>
              </button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-start gap-6 py-8 w-full">
      <div className="flex flex-wrap justify-between items-center w-full mb-2">
        <h1 className="text-4xl font-bold">Band Dashboard</h1>
        {canManageBand && (
          <EditBandDialog
            band={bandData?.band}
            handleBandUpdate={handleBandUpdate}
          />
        )}
      </div>
      <Card className="w-full shadow-md border-2 border-muted/20">
        <CardHeader className="pb-0">
          <div className="flex flex-col lg:flex-row gap-8">
            <div className="flex flex-col items-center">
              <Avatar className="w-[220px] h-[220px] rounded-lg shadow-md border border-muted">
                <AvatarImage
                  src={`data:image/jpeg;base64,${bandData.band?.coverImage}`}
                  className="object-cover"
                />
                <AvatarFallback className="text-3xl font-semibold bg-secondary/30">
                  {bandData.band?.name?.substring(0, 2) || "BP"}
                </AvatarFallback>
              </Avatar>
            </div>
            <div className="flex flex-col gap-4 flex-1 min-w-0">
              <div className="max-w-full">
                <h2 className="text-3xl font-bold mb-1 break-words">
                  {bandData.band?.name || "Unknown Band"}
                </h2>
                <p className="text-xl font-medium text-muted-foreground break-words">
                  {bandData.band?.genre || "No genre specified"}
                </p>
                <p className="text-muted-foreground mt-1 break-words">
                  {bandData.band?.country && bandData.band?.city
                    ? `${bandData.band.country}, ${bandData.band.city}`
                    : "Location not specified"}
                </p>
                <p className="mt-4 text-lg break-words whitespace-pre-wrap overflow-hidden text-ellipsis max-w-full">
                  {bandData.band?.description || "No description available"}
                </p>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-8">
          <div className="mb-10">
            <h2 className="text-2xl font-bold mb-6">Media & Music</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="overflow-hidden h-full">
                <CardHeader className="bg-gradient-to-r from-red-900/20 to-transparent">
                  <CardTitle className="flex items-center gap-2">
                    <FaYoutube className="text-red-600" size={24} />
                    <span>Featured Video</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                  {bandData.band?.youTubeEmbedId ? (
                    <iframe
                      className="w-full aspect-video rounded-md shadow-sm"
                      src={`https://www.youtube.com/embed/${bandData.band?.youTubeEmbedId}`}
                      title="YouTube video"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      referrerPolicy="strict-origin-when-cross-origin"
                      allowFullScreen
                    ></iframe>
                  ) : (
                    <div className="h-[180px] flex flex-col items-center justify-center bg-muted/20 rounded-md">
                      <FaYoutube className="text-red-600 mb-2" size={32} />
                      <p className="text-muted-foreground mb-4">
                        No video added yet
                      </p>
                      {canManageBand && (
                        <YouTubeEmbedDialog
                          handleYouTubeEmbedIdUpdate={
                            handleYouTubeEmbedIdUpdate
                          }
                        />
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
              <Card className="overflow-hidden h-full">
                <CardHeader className="bg-gradient-to-r from-green-900/20 to-transparent">
                  <div className="flex items-center gap-3">
                    <FaSpotify className="text-[#1DB954]" size={28} />
                    <h3 className="font-semibold text-2xl">Spotify Stats</h3>
                  </div>
                </CardHeader>
                <CardContent className="p-4">
                  {bandData.spotifyProfile && isSpotifyConnected() ? (
                    <div className="flex flex-col gap-4">
                      <div className="flex gap-4 items-center">
                        <Avatar className="w-[100px] h-[100px]">
                          <AvatarImage
                            src={bandData.spotifyProfile?.images?.[0]?.url}
                            onError={(e) => {
                              console.error("Failed to load Spotify image");
                              e.currentTarget.style.display = "none";
                            }}
                            className="object-cover"
                          />
                          <AvatarFallback>SP</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">
                            Followers:{" "}
                            <span className="font-bold">
                              {bandData.spotifyProfile?.followers?.total?.toLocaleString() ||
                                "0"}
                            </span>
                          </p>
                          <p className="font-medium">
                            Popularity:{" "}
                            <span className="font-bold">
                              {bandData.spotifyProfile?.popularity || "0"}%
                            </span>
                          </p>
                        </div>
                      </div>
                      {bandData.band?.spotifyId ? (
                        <iframe
                          className="rounded-xl mt-2"
                          src={`https://open.spotify.com/embed/artist/${bandData.band.spotifyId}?utm_source=generator&theme=0`}
                          width="100%"
                          height="152"
                          allowFullScreen
                          allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                          loading="lazy"
                          onError={() =>
                            console.error("Failed to load Spotify embed")
                          }
                        ></iframe>
                      ) : (
                        <div className="text-center py-4 text-muted-foreground">
                          Spotify embed unavailable
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="h-[200px]">
                      <>
                        <SpotifyFallback
                          variant="stats"
                          title={`${
                            bandData.band?.spotifyId
                              ? "Spotify Stats"
                              : "Spotify Not Connected"
                          }`}
                          description={`${
                            !bandData.band?.spotifyId
                              ? "Connect your Spotify account to see band statistics and embed content"
                              : "Spotify artist profile added. Connect your Spotify account to view stats."
                          }`}
                          labelText={`${
                            bandData.band?.spotifyId ? "Connected" : ""
                          }`}
                          showExploreButton={false}
                          connectButtonDisabled={
                            !canManageBand ||
                            (!isSpotifyConnected() &&
                              !!bandData.band?.spotifyId)
                          }
                          onConnectSpotify={() => setIsSpotifyDialogOpen(true)}
                        />
                        {canManageBand && (
                          <ConnectSpotifyDialog
                            handleSpotifyIdUpdate={handleSpotifyIdUpdate}
                            open={isSpotifyDialogOpen}
                            onOpenChange={setIsSpotifyDialogOpen}
                          />
                        )}
                      </>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
          <div className="mb-10">
            <h2 className="text-2xl font-bold mb-6">Fan Community</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-purple-900/20 to-transparent">
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Users className="h-5 w-5" />
                      <span>Band Forum</span>
                    </CardTitle>
                    {canManageBand && (
                      <CreateDiscussionDialog
                        buttonText="New Discussion"
                        buttonVariant="outline"
                      />
                    )}
                  </div>
                </CardHeader>
                <CardContent className="p-4">
                  {bandData?.forumThreads?.map((thread) => (
                    <Link
                      key={thread.id}
                      to={`/forums/${thread.categoryName}/${thread.id}`}
                      className="block"
                    >
                      <div className="flex items-center p-3 border-b last:border-0 hover:bg-accent/40 rounded-md">
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium">{thread.title}</h4>
                          <div className="flex justify-between">
                            <span className="text-xs text-muted-foreground">
                              {thread.repliesCount} replies
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {new Date(thread.createdAt).toLocaleString(
                                "en-US",
                                {
                                  year: "numeric",
                                  month: "long",
                                  day: "numeric",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                  hour12: false,
                                },
                              )}
                            </span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                  <div className="mt-4 flex justify-center">
                    <Link to="/forums">
                      <span className="text-primary hover:text-primary/80">
                        View All Forums
                      </span>
                    </Link>
                  </div>
                </CardContent>
              </Card>

              <BandMessagingDashboard bandId={bandData.band?.id || ""} />
            </div>

            <div className="mt-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <BandFollowers
                  bandId={bandData.band?.id || ""}
                  showFollowersList={true}
                />

                <Card className="overflow-hidden">
                  <CardHeader className="bg-gradient-to-r from-amber-900/20 to-transparent">
                    <CardTitle className="flex items-center gap-2">
                      <Users className="h-5 w-5" />
                      <span>Fan Engagement</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <Card className="bg-accent/30">
                        <CardContent className="p-4 text-center">
                          <h4 className="text-2xl font-bold">
                            {followerCount
                              ? followerCount.toLocaleString()
                              : "0"}
                          </h4>
                          <p className="text-sm text-muted-foreground">
                            Total Followers
                          </p>
                        </CardContent>
                      </Card>
                      <Card className="bg-accent/30">
                        <CardContent className="p-4 text-center">
                          <h4 className="text-2xl font-bold">
                            {totalNewMessages}
                          </h4>
                          <p className="text-sm text-muted-foreground">
                            New Messages
                          </p>
                        </CardContent>
                      </Card>
                      <Card className="bg-accent/30">
                        <CardContent className="p-4 text-center">
                          <h4 className="text-2xl font-bold">
                            {responseRate}%
                          </h4>
                          <p className="text-sm text-muted-foreground">
                            Response Rate
                          </p>
                        </CardContent>
                      </Card>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
          <div className="mb-10">
            <h2 className="text-2xl font-bold mb-6">Events</h2>
            <Card className="mb-6 overflow-hidden border-muted/20">
              <CardHeader className="bg-muted/10 pb-2">
                <CardTitle className="flex items-center gap-2">
                  <CalendarDays className="h-5 w-5" />
                  <span>Upcoming Concerts</span>
                  {canManageBand && (
                    <AddEventDialog bandId={bandData.band?.id} />
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {bandEvents && bandEvents.length > 0 ? (
                    bandEvents.map((event, index) => (
                      <Card key={index} className="flex overflow-hidden">
                        <div className="bg-muted/20 w-[100px] flex items-center justify-center">
                          <div className="text-center">
                            {event.date ? (
                              <>
                                <div className="font-bold text-xl">
                                  {new Date(event.date).getDate()}
                                </div>
                                <div className="text-sm">
                                  {new Date(event.date)
                                    .toLocaleString("default", {
                                      month: "short",
                                    })
                                    .toUpperCase()}
                                </div>
                              </>
                            ) : (
                              <div className="text-sm text-muted-foreground">
                                No date
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="p-3 flex-1">
                          <h4 className="font-semibold">{event.venue}</h4>
                          <p className="text-sm">
                            {event.city}, {event.country}
                          </p>
                          <div className="flex justify-between items-center mt-2">
                            <span className="text-sm text-muted-foreground">
                              {event.date
                                ? new Date(event.date).toLocaleTimeString([], {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                    hour12: false,
                                  })
                                : "Time TBA"}
                            </span>
                            <button className="text-xs px-2 py-1 bg-primary/80 text-primary-foreground rounded">
                              Details
                            </button>
                          </div>
                        </div>
                      </Card>
                    ))
                  ) : (
                    <div className="col-span-full flex flex-col items-center justify-center p-8 text-center">
                      <p className="text-muted-foreground mb-4">
                        No events scheduled yet
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <BandMembers
              bandId={bandData.band?.id || ""}
              bandName={bandData.band?.name || ""}
              members={bandData.band?.members ?? []}
              currentUserId={auth?.id}
              canManageBand={canManageBand}
              onAddMember={handleAddMember}
              removeMember={mutations.removeMemberMutation}
              setMemberRole={mutations.setMemberRoleMutation}
            />
            <Card className="overflow-hidden border-muted/20">
              <CardHeader className="bg-muted/10 pb-2">
                <CardTitle className="flex items-center gap-2">
                  <span>Merchandise</span>
                  {canManageBand && (
                    <AddMerchandiseDialog
                      bandId={bandData?.band?.id || ""}
                      onMerchandiseAdded={refetchMerchandise}
                      trigger={
                        <button className="ml-auto text-sm px-3 py-1 bg-primary hover:bg-primary/80 text-primary-foreground rounded-md">
                          Add Item
                        </button>
                      }
                    />
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                {isMerchandiseLoading ? (
                  <div className="flex justify-center py-8">
                    <Loading />
                  </div>
                ) : merchandise && merchandise.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {merchandise.map((item) => (
                      <Card key={item.id} className="overflow-hidden">
                        <div className="aspect-square bg-muted/20 flex items-center justify-center">
                          {item.imageUrl ? (
                            <img
                              src={item.imageUrl}
                              alt={item.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            "No Image"
                          )}
                        </div>
                        <div className="p-3">
                          <div className="flex justify-between">
                            <h4 className="font-semibold">{item.name}</h4>
                            <span className="font-bold">
                              ${item.price.toFixed(2)}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">
                            {item.description || "No description"}
                          </p>
                        </div>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    No merchandise items yet. Add your first item!
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
      {canManageBand && bandData.band?.id && (
        <DeleteBandSection
          bandId={bandData.band.id}
          bandName={bandData.band.name}
          deleteBand={mutations.deleteBandMutation}
        />
      )}
    </div>
  );
};

export default BandDashboard;
