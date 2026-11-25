import { useState, useEffect, useRef } from "react";
import { MapContainer, TileLayer, ZoomControl } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet.markercluster/dist/MarkerCluster.css";
import "leaflet.markercluster/dist/MarkerCluster.Default.css";
import "leaflet.markercluster";
import type MusicEvent from "@/features/events/types/music-event";
import { parseCoordinates } from "@/features/events/components/map/map-utils";
import "./map/map-styles.css";
import MarkerCluster from "@/features/events/components/map/marker-cluster";
import ShareEventModal from "./share-event-modal";
import {
  FullscreenControl,
  LocationFilterControl,
  MapStyleControl,
} from "@/features/events/components/map/map-controls";

interface MapViewProps {
  events?: MusicEvent[];
  selectedEventId?: string;
  onEventClick?: (eventId: string) => void;
}

const MapView = ({
  events = [],
  selectedEventId,
  onEventClick,
}: MapViewProps) => {
  const mapRef = useRef<L.Map | null>(null);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(
    null
  );
  const [mapStyle, setMapStyle] = useState<string>(
    "https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png"
  );
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [eventToShare, setEventToShare] = useState<MusicEvent | null>(null);

  const validEvents = events.filter(
    (event) => parseCoordinates(event.location) !== null
  );

  const [useLocationFilter, setUseLocationFilter] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);

  const filteredEvents =
    useLocationFilter && selectedCountry
      ? validEvents.filter((event) => event.country === selectedCountry)
      : validEvents;

  const defaultLocation: [number, number] = [40.7128, -74.006];

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation([position.coords.latitude, position.coords.longitude]);
      },
      (error) => {
        console.warn(
          `Could not retrieve user location: ${error.message}. Using default location.`
        );
        if (validEvents.length > 0) {
          const firstEventCoords = parseCoordinates(validEvents[0].location);
          if (firstEventCoords) {
            setUserLocation(firstEventCoords);
          } else {
            setUserLocation([51.505, -0.09]);
          }
        } else {
          setUserLocation([51.505, -0.09]);
        }
      },
      { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
    );
  }, [validEvents]);

  const handleEventShare = (event: MusicEvent) => {
    setEventToShare(event);
    setShareModalOpen(true);
  };

  return (
    <div
      className={`map-container w-full h-full relative ${
        shareModalOpen ? "modal-open" : ""
      }`}
      style={{ height: "70vh", borderRadius: "12px", overflow: "hidden" }}
    >
      {(userLocation || filteredEvents.length > 0) && (
        <MapContainer
          center={userLocation || defaultLocation}
          zoom={13}
          style={{
            height: "100%",
            width: "100%",
          }}
          ref={(ref) => {
            if (ref) {
              mapRef.current = ref;
            }
          }}
          zoomControl={false}
        >
          <TileLayer
            url={mapStyle}
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors | Map tiles by <a href="https://stadiamaps.com/" target="_blank">Stadia Maps</a>'
          />
          <ZoomControl position="bottomleft" />
          <FullscreenControl />
          <LocationFilterControl
            useLocationFilter={useLocationFilter}
            setUseLocationFilter={setUseLocationFilter}
            setSelectedCountry={setSelectedCountry}
            validEvents={validEvents}
          />{" "}
          <MarkerCluster
            events={filteredEvents}
            selectedEventId={selectedEventId}
            onEventClick={onEventClick}
            onEventShare={handleEventShare}
          />
          <MapStyleControl setMapStyle={setMapStyle} />
        </MapContainer>
      )}

      {eventToShare && (
        <ShareEventModal
          isOpen={shareModalOpen}
          onClose={() => {
            setShareModalOpen(false);
            setEventToShare(null);
          }}
          event={eventToShare}
        />
      )}
    </div>
  );
};

export default MapView;
