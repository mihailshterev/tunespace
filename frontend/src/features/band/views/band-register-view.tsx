import BandRegistrationForm from "@/features/band/components/band-registration-form";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/shared/ui/card";
import { Badge } from "@/shared/ui/badge";
import { Music, Users, Mic } from "lucide-react";
import Loading from "@/shared/ui/loading";
import useCountries from "@/features/band/hooks/useCountries";

export function BandRegisterView() {
  const { data: countryData, isPending } = useCountries();

  return (
    <div className="container mx-auto py-8 px-4 min-h-screen">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="h-12 w-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
              <Music className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-600">
              Create Your Band Profile
            </h1>
          </div>
          <p className="text-xl text-muted-foreground mb-6 max-w-3xl mx-auto">
            Join TuneSpace as a band and connect with fans, share your music,
            and grow your audience. Your journey to musical success starts here.
          </p>

          <div className="flex flex-wrap justify-center gap-4 mb-8">
            <Badge
              variant="secondary"
              className="flex items-center gap-2 py-2 px-4 text-sm"
            >
              <Users className="h-4 w-4" />
              Connect with fans
            </Badge>
            <Badge
              variant="secondary"
              className="flex items-center gap-2 py-2 px-4 text-sm"
            >
              <Mic className="h-4 w-4" />
              Share your music
            </Badge>
            <Badge
              variant="secondary"
              className="flex items-center gap-2 py-2 px-4 text-sm"
            >
              <Music className="h-4 w-4" />
              Promote events
            </Badge>
          </div>
        </div>

        <div className="flex justify-center">
          <Card className="w-full max-w-2xl shadow-lg border-2 border-muted/20">
            <CardHeader className="text-center pb-6">
              <CardTitle className="text-2xl font-bold">
                Band Information
              </CardTitle>
              <p className="text-muted-foreground">
                Tell us about your band to create your profile
              </p>
            </CardHeader>{" "}
            <CardContent>
              {isPending ? (
                <Loading />
              ) : (
                <BandRegistrationForm locationData={countryData} />
              )}
            </CardContent>
          </Card>
        </div>

        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="text-center p-6 border-purple-200/50 bg-gradient-to-br from-purple-50/80 to-violet-50/80 dark:from-purple-950/50 dark:to-violet-950/50">
            <div className="h-12 w-12 rounded-full bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center mx-auto mb-4">
              <Users className="h-6 w-6 text-white" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Build Your Fanbase</h3>
            <p className="text-muted-foreground text-sm">
              Connect directly with your fans through messaging, updates, and
              exclusive content sharing.
            </p>
          </Card>

          <Card className="text-center p-6 border-blue-200/50 bg-gradient-to-br from-blue-50/80 to-cyan-50/80 dark:from-blue-950/50 dark:to-cyan-950/50">
            <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center mx-auto mb-4">
              <Music className="h-6 w-6 text-white" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Share Your Music</h3>
            <p className="text-muted-foreground text-sm">
              Upload tracks, share Spotify links, and showcase your musical
              journey with the community.
            </p>
          </Card>

          <Card className="text-center p-6 border-green-200/50 bg-gradient-to-br from-green-50/80 to-emerald-50/80 dark:from-green-950/50 dark:to-emerald-950/50">
            <div className="h-12 w-12 rounded-full bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center mx-auto mb-4">
              <Mic className="h-6 w-6 text-white" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Promote Events</h3>
            <p className="text-muted-foreground text-sm">
              Announce concerts, share event details, and sell merchandise
              directly to your audience.
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
}
