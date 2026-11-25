import React, { useEffect, useState } from "react";
import { useMap } from "react-leaflet";
import type MusicEvent from "@/features/events/types/music-event";

export const FlyToLocation: React.FC<{
  lat: number;
  lng: number;
  zoom: number;
}> = ({ lat, lng, zoom }) => {
  const map = useMap();

  useEffect(() => {
    map.flyTo([lat, lng], zoom, {
      animate: true,
      duration: 1.5,
    });
  }, [lat, lng, zoom, map]);

  return null;
};

export const FullscreenControl: React.FC = () => {
  const map = useMap();
  const [isFullscreen, setIsFullscreen] = useState(false);

  const toggleFullscreen = () => {
    const container = map.getContainer();
    if (!isFullscreen) {
      if (container.requestFullscreen) {
        container.requestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
    setIsFullscreen(!isFullscreen);
  };

  return (
    <div className="leaflet-top leaflet-left" style={{ marginTop: "60px" }}>
      <div className="leaflet-control leaflet-bar">
        <a
          href="#"
          onClick={(e) => {
            e.preventDefault();
            toggleFullscreen();
          }}
          title="Toggle fullscreen"
          role="button"
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            width: "30px",
            height: "30px",
          }}
        >
          {isFullscreen ? "⤓" : "⤢"}
        </a>
      </div>
    </div>
  );
};

interface LocationFilterControlProps {
  useLocationFilter: boolean;
  setUseLocationFilter: React.Dispatch<React.SetStateAction<boolean>>;
  setSelectedCountry: React.Dispatch<React.SetStateAction<string | null>>;
  validEvents: MusicEvent[];
}

export const LocationFilterControl: React.FC<LocationFilterControlProps> = ({
  useLocationFilter,
  setUseLocationFilter,
  setSelectedCountry,
  validEvents,
}) => {
  const map = useMap();

  const handleLocationToggle = () => {
    setUseLocationFilter(!useLocationFilter);

    if (!useLocationFilter) {
      setSelectedCountry("Bulgaria");

      const bulgarianEvents = validEvents.filter(
        (e) => e.country === "Bulgaria"
      );
      if (bulgarianEvents.length > 0) {
        const center = [42.7249, 25.4827];
        map.setView(center as [number, number], 7);
      }
    }
  };

  return (
    <div
      className="leaflet-top leaflet-right"
      style={{ zIndex: 1000, marginTop: "10px", marginRight: "10px" }}
    >
      <div className="leaflet-control p-2 bg-card rounded-lg shadow-sm border border-border/40">
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">
            {useLocationFilter ? "Location: Bulgaria" : "Location: All"}
          </span>
          <button
            onClick={handleLocationToggle}
            className="flex items-center"
            aria-label="Toggle location-based filtering"
          >
            <div
              className={`w-10 h-5 rounded-full p-0.5 transition-colors ${
                useLocationFilter ? "bg-primary" : "bg-muted"
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full bg-white transition-transform transform ${
                  useLocationFilter ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

export const MapStyleControl: React.FC<{
  setMapStyle: (style: string) => void;
}> = ({ setMapStyle }) => {
  return (
    <div className="map-style-switcher">
      <select
        onChange={(e) => setMapStyle(e.target.value)}
        className="text-sm p-1 border rounded"
        defaultValue="https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png"
      >
        <option value="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png">
          Standard
        </option>
        <option value="https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png">
          Dark
        </option>
        <option value="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}">
          Satellite
        </option>
        <option value="https://tiles.stadiamaps.com/tiles/alidade_smooth/{z}/{x}/{y}{r}.png">
          Light
        </option>
      </select>
    </div>
  );
};
