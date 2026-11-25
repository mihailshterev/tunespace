import { Button } from "@/shared/ui/button";
import { Card, CardContent } from "@/shared/ui/card";
import { Music, Headphones, AudioLines } from "lucide-react";
import { ROUTES } from "@/shared/utils/constants";
import { toast } from "sonner";
import { Link, useNavigate } from "react-router";

interface BandChoiceProps {
  title?: string;
  subtitle?: string;
  description?: string;
}

const BandChoice = ({
  title = "Welcome to TuneSpace!",
  subtitle = "Are you an artist or part of a band?",
  description = "Create your artist profile to showcase music, connect with fans, and manage events. You can always set this up later from your dashboard.",
}: BandChoiceProps) => {
  const navigate = useNavigate();

  return (
    <div className="flex justify-center items-center gap-4">
      <Card className="overflow-hidden shadow-lg border-2 border-muted/20">
        <CardContent className="p-12">
          <div className="flex flex-col gap-8 justify-center items-center text-center max-w-md">
            <div className="flex justify-center items-center space-x-2 mb-4">
              <div className="animate-pulse">
                <Music className="h-8 w-8 text-primary/70" />
              </div>
              <div className="animate-pulse delay-150">
                <AudioLines className="h-8 w-8 text-purple-500/70" />
              </div>
              <div className="animate-pulse delay-300">
                <Headphones className="h-8 w-8 text-blue-500/70" />
              </div>
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-3 bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                {title}
              </h2>
              <p className="text-xl text-foreground font-semibold mb-2">
                {subtitle}
              </p>
              <p className="text-sm text-muted-foreground">{description}</p>
            </div>
            <div className="flex gap-4 w-full">
              <Button className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                <Link
                  to={ROUTES.BAND_REGISTER}
                  className="flex items-center gap-2"
                >
                  <Music className="h-4 w-4" />
                  Yes, create artist profile
                </Link>
              </Button>
              <Button
                onClick={() => {
                  navigate(ROUTES.HOME);
                  toast(
                    "Welcome to TuneSpace! Enjoy exploring music and connecting with artists.",
                    { duration: 5000 }
                  );
                }}
                variant="outline"
                className="flex-1 hover:bg-muted/50"
              >
                <Headphones className="h-4 w-4 mr-2" />
                No, just here for music
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BandChoice;
