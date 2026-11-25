import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/ui/avatar";
import { Card, CardHeader, CardTitle, CardContent } from "@/shared/ui/card";
import { Button } from "@/shared/ui/button";
import { Badge } from "@/shared/ui/badge";
import {
  Users,
  Calendar,
  MapPin,
  Music,
  Play,
  MessageCircle,
  Share,
  ArrowLeft,
} from "lucide-react";
import { FaSpotify, FaYoutube } from "react-icons/fa";
import type Band from "@/features/band/types/band";
import BandFollowButton from "./band-follow-button";
import BandFollowers from "./band-followers";
import QuickShareButton from "@/features/discovery/components/quick-share-button";
import { Link, useNavigate } from "react-router";

interface BandShowcaseProps {
  band: Band;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  spotifyData?: any;
}

interface TabType {
  id: string;
  label: string;
  icon: React.ReactNode;
}

const BandShowcase = ({ band, spotifyData }: BandShowcaseProps) => {
  const [activeTab, setActiveTab] = useState("overview");
  const navigate = useNavigate();

  const tabs: TabType[] = [
    { id: "overview", label: "Overview", icon: <Music className="h-4 w-4" /> },
    { id: "music", label: "Music", icon: <Play className="h-4 w-4" /> },
    { id: "events", label: "Events", icon: <Calendar className="h-4 w-4" /> },
    { id: "members", label: "Members", icon: <Users className="h-4 w-4" /> },
  ];

  const handleBack = () => {
    navigate("/discover");
  };

  const handleMessage = async () => {
    try {
      navigate(`/band/${band.id}/chat/new`);
    } catch (error) {
      console.error("Error starting band chat:", error);
    }
  };

  const formatFollowers = (count: number) => {
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
    if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
    return count.toString();
  };

  return (
    <div className="mx-auto space-y-6 py-8">
      <div className="flex justify-start">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleBack}
          className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Discovery
        </Button>
      </div>
      <div className="relative overflow-hidden rounded-lg bg-muted/30 border border-border">
        <div className="relative p-8 md:p-12">
          <div className="flex flex-col lg:flex-row gap-8 items-start">
            <div className="flex-shrink-0">
              <Avatar className="w-48 h-48 md:w-64 md:h-64 rounded-lg border border-border">
                <AvatarImage
                  src={
                    band.coverImage
                      ? `data:image/jpeg;base64,${band.coverImage}`
                      : spotifyData?.images?.[0]?.url
                  }
                  className="object-cover"
                />
                <AvatarFallback className="text-4xl font-bold bg-muted text-muted-foreground">
                  {band.name?.substring(0, 2) || "BA"}
                </AvatarFallback>
              </Avatar>
            </div>

            <div className="flex-1 space-y-6">
              <div className="space-y-4">
                <h1 className="text-4xl md:text-5xl font-bold text-foreground">
                  {band.name}
                </h1>
                <div className="flex flex-wrap items-center gap-3 mb-4">
                  <Badge variant="secondary" className="text-sm">
                    <Music className="h-3 w-3 mr-2" />
                    {band.genre}
                  </Badge>
                  {band.country && (
                    <div className="flex items-center text-muted-foreground">
                      <MapPin className="h-4 w-4 mr-2" />
                      <span className="font-medium">
                        {band.city}, {band.country}
                      </span>
                    </div>
                  )}
                </div>

                {band.description && (
                  <div className="bg-muted/50 rounded-lg p-4 border border-border">
                    <p className="text-muted-foreground leading-relaxed">
                      {band.description}
                    </p>
                  </div>
                )}
              </div>
              {spotifyData && (
                <div className="flex flex-wrap gap-6">
                  <div className="text-center p-4 rounded-lg bg-muted/50 border border-border">
                    <div className="text-2xl font-bold text-foreground">
                      {formatFollowers(spotifyData.followers?.total || 0)}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Followers
                    </div>
                  </div>
                  <div className="text-center p-4 rounded-lg bg-muted/50 border border-border">
                    <div className="text-2xl font-bold text-foreground">
                      {spotifyData.popularity || 0}%
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Popularity
                    </div>
                  </div>
                </div>
              )}
              <div className="flex flex-wrap gap-3">
                <BandFollowButton
                  bandId={band.id || ""}
                  variant="default"
                  size="default"
                  showText={true}
                />
                <Button
                  variant="outline"
                  className="hover:bg-muted/50"
                  onClick={() => handleMessage()}
                >
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Message
                </Button>{" "}
                <QuickShareButton
                  artist={{
                    id: band.id,
                    name: band.name,
                    location:
                      band.city && band.country
                        ? `${band.city}, ${band.country}`
                        : undefined,
                    genres: band.genre ? [band.genre] : [],
                    imageUrl: band.coverImage
                      ? `data:image/jpeg;base64,${band.coverImage}`
                      : spotifyData?.images?.[0]?.url,
                    externalUrl: band.spotifyId
                      ? `https://open.spotify.com/artist/${band.spotifyId}`
                      : undefined,
                    followers: spotifyData?.followers?.total,
                    popularity: spotifyData?.popularity,
                    isRegistered: true,
                  }}
                  variant="outline"
                  className="hover:bg-muted/50"
                >
                  <Share className="h-4 w-4 mr-2" />
                  Share
                </QuickShareButton>
              </div>
              <div className="flex gap-4">
                {band.spotifyId && (
                  <Link
                    to={`https://open.spotify.com/artist/${band.spotifyId}`}
                    target="_blank"
                    className="p-2 rounded-lg bg-[#1DB954]/10 text-[#1DB954] hover:bg-[#1DB954]/20"
                  >
                    <FaSpotify size={24} />
                  </Link>
                )}
                {band.youTubeEmbedId && (
                  <Link
                    to={`https://youtube.com/watch?v=${band.youTubeEmbedId}`}
                    target="_blank"
                    className="p-2 rounded-lg bg-red-600/10 text-red-600 hover:bg-red-600/20"
                  >
                    <FaYoutube size={24} />
                  </Link>
                )}
              </div>
            </div>
          </div>{" "}
        </div>
      </div>
      <div className="border-b border-border">
        <nav className="flex space-x-8 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 py-3 px-1 border-b-2 font-medium text-sm whitespace-nowrap transition-colors ${
                activeTab === tab.id
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </nav>
      </div>
      <div className="space-y-6">
        {activeTab === "overview" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              {" "}
              <Card className="border border-border">
                <CardHeader>
                  <CardTitle className="text-xl">About {band.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground leading-relaxed">
                    {band.description || "No description available."}
                  </p>
                </CardContent>
              </Card>
              {band.youTubeEmbedId && (
                <Card className="border border-border">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-xl">
                      <FaYoutube className="text-red-600" />
                      Featured Video
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="aspect-video rounded-lg overflow-hidden">
                      <iframe
                        className="w-full h-full"
                        src={`https://www.youtube.com/embed/${band.youTubeEmbedId}`}
                        title="YouTube video"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                        referrerPolicy="strict-origin-when-cross-origin"
                        allowFullScreen
                      />
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            <div className="space-y-6">
              {band.spotifyId && (
                <Card className="border border-border">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <FaSpotify className="text-[#1DB954]" />
                      Listen on Spotify
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="rounded-lg overflow-hidden">
                      <iframe
                        className="w-full"
                        src={`https://open.spotify.com/embed/artist/${band.spotifyId}?utm_source=generator&theme=0`}
                        width="100%"
                        height="352"
                        allowFullScreen
                        allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                        loading="lazy"
                      />
                    </div>
                  </CardContent>
                </Card>
              )}
              <Card className="border border-border">
                <CardHeader>
                  <CardTitle className="text-lg">Stats</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center p-3 rounded-lg bg-muted/50">
                    <span className="text-muted-foreground">Genre</span>
                    <Badge variant="secondary">{band.genre}</Badge>
                  </div>
                  <div className="flex justify-between items-center p-3 rounded-lg bg-muted/50">
                    <span className="text-muted-foreground">Location</span>
                    <span className="font-medium">
                      {band.city}, {band.country}
                    </span>
                  </div>
                  {band.members && (
                    <div className="flex justify-between items-center p-3 rounded-lg bg-muted/50">
                      <span className="text-muted-foreground">Members</span>
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-primary" />
                        <span className="font-medium">
                          {band.members.length}
                        </span>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
              <BandFollowers bandId={band.id || ""} showFollowersList={true} />
            </div>
          </div>
        )}

        {activeTab === "music" && (
          <div className="space-y-6">
            <Card className="border border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl">
                  <Music className="text-primary" />
                  Music & Releases
                </CardTitle>
              </CardHeader>
              <CardContent>
                {band.spotifyId ? (
                  <div className="rounded-lg overflow-hidden">
                    <iframe
                      className="w-full"
                      src={`https://open.spotify.com/embed/artist/${band.spotifyId}?utm_source=generator&theme=0`}
                      width="100%"
                      height="500"
                      allowFullScreen
                      allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                      loading="lazy"
                    />
                  </div>
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    <Music className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p className="text-lg font-medium mb-2">
                      No music available yet
                    </p>
                    <p className="text-sm">Check back later for new releases</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === "events" && (
          <div className="space-y-6">
            <Card className="border border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl">
                  <Calendar className="text-primary h-5 w-5" />
                  Upcoming Events
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12 text-muted-foreground">
                  <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium mb-2">No upcoming events</p>
                  <p className="text-sm">
                    Check back later for concert announcements
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === "members" && (
          <div className="space-y-6">
            <Card className="border border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl">
                  <Users className="text-primary h-5 w-5" />
                  Band Members
                </CardTitle>
              </CardHeader>
              <CardContent>
                {band.members && band.members.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {band.members.map((member, index) => (
                      <Card
                        key={member.id || index}
                        className="text-center border border-border hover:shadow-md transition-shadow"
                      >
                        <CardContent className="p-6">
                          <Avatar className="w-20 h-20 mx-auto mb-4 border border-border">
                            <AvatarImage
                              src={
                                member.profilePicture
                                  ? `data:image/jpeg;base64,${member.profilePicture}`
                                  : undefined
                              }
                              className="object-cover"
                            />
                            <AvatarFallback className="text-xl font-semibold bg-muted text-muted-foreground">
                              {member.name?.charAt(0) || "M"}
                            </AvatarFallback>
                          </Avatar>
                          <h3 className="font-bold text-lg mb-2 text-foreground">
                            {member.name}
                          </h3>
                          <Badge variant="secondary">Band Member</Badge>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p className="text-lg font-medium mb-2">
                      No members listed
                    </p>
                    <p className="text-sm">
                      Member information will appear here when available
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default BandShowcase;
