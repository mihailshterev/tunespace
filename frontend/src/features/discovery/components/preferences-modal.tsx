import { useState, useEffect } from "react";
import { Button } from "@/shared/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/dialog";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { Badge } from "@/shared/ui/badge";
import { Separator } from "@/shared/ui/separator";
import { Music, MapPin, Plus, X, Users, Headphones } from "lucide-react";
import {
  getCurrentLocation,
  getLocationFromCoordinates,
} from "@/features/discovery/api/music-discovery.service";
import type { UserLocation, UserPreferences } from "@/features/discovery/types";

interface PreferencesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (preferences: UserPreferences) => void;
  isLoading?: boolean;
  initialPreferences?: UserPreferences | null;
}

const POPULAR_GENRES = [
  "rock",
  "metal",
  "pop",
  "jazz",
  "blues",
  "folk",
  "electronic",
  "punk",
  "indie",
  "alternative",
  "classical",
  "hip-hop",
  "country",
  "reggae",
  "grunge",
  "progressive",
  "ambient",
  "techno",
];

const PreferencesModal = ({
  isOpen,
  onClose,
  onSubmit,
  isLoading = false,
  initialPreferences,
}: PreferencesModalProps) => {
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [customGenre, setCustomGenre] = useState("");
  const [preferredArtists, setPreferredArtists] = useState<string[]>([]);
  const [customArtist, setCustomArtist] = useState("");
  const [location, setLocation] = useState<string>("");
  const [detectedLocation, setDetectedLocation] = useState<UserLocation | null>(
    null
  );
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);
  const [maxRecommendations, setMaxRecommendations] = useState<number>(20);

  useEffect(() => {
    if (isOpen && initialPreferences) {
      setSelectedGenres(initialPreferences.genres || []);
      setPreferredArtists(initialPreferences.preferredArtists || []);
      setLocation(initialPreferences.location || "");
      setMaxRecommendations(initialPreferences.maxRecommendations || 20);
    } else if (isOpen && !initialPreferences) {
      setSelectedGenres([]);
      setPreferredArtists([]);
      setLocation("");
      setMaxRecommendations(20);
    }
  }, [isOpen, initialPreferences]);

  const handleGenreToggle = (genre: string) => {
    setSelectedGenres((prev) =>
      prev.includes(genre) ? prev.filter((g) => g !== genre) : [...prev, genre]
    );
  };

  const handleAddCustomGenre = () => {
    const trimmedGenre = customGenre.trim().toLowerCase();
    if (trimmedGenre && !selectedGenres.includes(trimmedGenre)) {
      setSelectedGenres((prev) => [...prev, trimmedGenre]);
      setCustomGenre("");
    }
  };

  const handleRemoveGenre = (genre: string) => {
    setSelectedGenres((prev) => prev.filter((g) => g !== genre));
  };

  const handleAddCustomArtist = () => {
    const trimmedArtist = customArtist.trim();
    if (trimmedArtist && !preferredArtists.includes(trimmedArtist)) {
      setPreferredArtists((prev) => [...prev, trimmedArtist]);
      setCustomArtist("");
    }
  };

  const handleRemoveArtist = (artist: string) => {
    setPreferredArtists((prev) => prev.filter((a) => a !== artist));
  };

  const handleDetectLocation = async () => {
    setIsDetectingLocation(true);
    try {
      const coords = await getCurrentLocation();
      if (coords) {
        const locationData = await getLocationFromCoordinates(
          coords.latitude,
          coords.longitude
        );
        if (locationData) {
          setDetectedLocation(locationData);
          setLocation(`${locationData.city}, ${locationData.country}`);
        }
      }
    } catch (error) {
      console.error("Failed to detect location:", error);
    } finally {
      setIsDetectingLocation(false);
    }
  };

  const handleSubmit = () => {
    if (selectedGenres.length === 0) {
      return;
    }

    const preferences: UserPreferences = {
      genres: selectedGenres,
      location: location || undefined,
      preferredArtists:
        preferredArtists.length > 0 ? preferredArtists : undefined,
      maxRecommendations: maxRecommendations,
    };

    onSubmit(preferences);
  };

  const resetForm = () => {
    setSelectedGenres([]);
    setCustomGenre("");
    setPreferredArtists([]);
    setCustomArtist("");
    setLocation("");
    setDetectedLocation(null);
    setMaxRecommendations(20);
  };

  useEffect(() => {
    if (!isOpen) {
      resetForm();
    }
  }, [isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Music className="w-5 h-5" />
            Set Your Music Preferences
          </DialogTitle>
          <DialogDescription>
            Tell us about your music taste to get personalized recommendations.
            No Spotify account required!
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Preferred Genres *</CardTitle>
              <CardDescription>
                Select the genres you enjoy. You can add custom genres too.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-2">
                {POPULAR_GENRES.map((genre) => (
                  <Badge
                    key={genre}
                    variant={
                      selectedGenres.includes(genre) ? "default" : "outline"
                    }
                    className="cursor-pointer hover:scale-105 transition-transform"
                    onClick={() => handleGenreToggle(genre)}
                  >
                    {genre}
                  </Badge>
                ))}
              </div>

              <div className="flex gap-2">
                <Input
                  placeholder="Add custom genre..."
                  value={customGenre}
                  onChange={(e) => setCustomGenre(e.target.value)}
                  onKeyPress={(e) =>
                    e.key === "Enter" && handleAddCustomGenre()
                  }
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAddCustomGenre}
                  disabled={!customGenre.trim()}
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>

              {selectedGenres.length > 0 && (
                <div className="space-y-2">
                  <Label className="text-sm font-medium">
                    Selected Genres:
                  </Label>
                  <div className="flex flex-wrap gap-2">
                    {selectedGenres.map((genre) => (
                      <Badge
                        key={genre}
                        variant="default"
                        className="flex items-center gap-1"
                      >
                        {genre}
                        <X
                          className="w-3 h-3 cursor-pointer hover:text-red-500"
                          onClick={() => handleRemoveGenre(genre)}
                        />
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Users className="w-4 h-4" />
                Preferred Artists (Optional)
              </CardTitle>
              <CardDescription>
                Add artists you like to help us find similar recommendations.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Add artist name..."
                  value={customArtist}
                  onChange={(e) => setCustomArtist(e.target.value)}
                  onKeyPress={(e) =>
                    e.key === "Enter" && handleAddCustomArtist()
                  }
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAddCustomArtist}
                  disabled={!customArtist.trim()}
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>

              {preferredArtists.length > 0 && (
                <div className="space-y-2">
                  <Label className="text-sm font-medium">
                    Preferred Artists:
                  </Label>
                  <div className="flex flex-wrap gap-2">
                    {preferredArtists.map((artist) => (
                      <Badge
                        key={artist}
                        variant="secondary"
                        className="flex items-center gap-1"
                      >
                        {artist}
                        <X
                          className="w-3 h-3 cursor-pointer hover:text-red-500"
                          onClick={() => handleRemoveArtist(artist)}
                        />
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                Location (Optional)
              </CardTitle>
              <CardDescription>
                Help us find local bands and region-specific recommendations.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Enter city, country..."
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleDetectLocation}
                  disabled={isDetectingLocation}
                >
                  {isDetectingLocation ? "Detecting..." : "Auto-detect"}
                </Button>
              </div>

              {detectedLocation && (
                <div className="text-sm text-muted-foreground">
                  Detected: {detectedLocation.city}, {detectedLocation.country}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Headphones className="w-4 h-4" />
                Recommendation Settings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="maxRecs">
                  Maximum Recommendations: {maxRecommendations}
                </Label>
                <input
                  id="maxRecs"
                  type="range"
                  min="5"
                  max="50"
                  step="5"
                  value={maxRecommendations}
                  onChange={(e) =>
                    setMaxRecommendations(parseInt(e.target.value))
                  }
                  className="w-full"
                />
              </div>
            </CardContent>
          </Card>
        </div>

        <Separator />

        <div className="flex justify-between">
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={selectedGenres.length === 0 || isLoading}
          >
            {isLoading ? "Getting Recommendations..." : "Get Recommendations"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PreferencesModal;
