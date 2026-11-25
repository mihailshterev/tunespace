import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router";
import BandShowcase from "@/features/band/components/band-showcase";
import { getBandById } from "@/features/band/api/band.service";
import httpClient from "@/shared/api/http-client";
import Loading from "@/shared/ui/loading";
import { SPOTIFY_ENDPOINTS } from "@/shared/utils/constants";
import { NotFoundPage } from "@/app/routes/not-found-page";

export function BandShowcaseView() {
  const { bandId = "" } = useParams<{ bandId: string }>();

  const { data: band, isPending } = useQuery({
    queryKey: ["band-showcase", bandId],
    queryFn: () => getBandById(bandId),
    enabled: Boolean(bandId),
    retry: false,
  });

  // Spotify data is optional decoration: without a connected account the request fails and the page shows the band alone.
  const { data: spotifyData = null } = useQuery({
    queryKey: ["band-showcase-spotify", band?.spotifyId],
    queryFn: async () => {
      try {
        return (await httpClient.get(`${SPOTIFY_ENDPOINTS.ARTIST}/${band?.spotifyId}`)).data;
      } catch (error) {
        console.error("Failed to fetch Spotify data:", error);
        return null;
      }
    },
    enabled: Boolean(band?.spotifyId),
    retry: false,
  });

  if (isPending && bandId) {
    return <Loading />;
  }

  if (!band) {
    return <NotFoundPage />;
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <BandShowcase band={band} spotifyData={spotifyData} />
    </div>
  );
}
