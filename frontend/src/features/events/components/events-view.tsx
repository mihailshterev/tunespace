import { useState } from "react";
import useEvents from "@/features/events/hooks/useEvents";
import MapView from "./map-view";
import EventsList from "./events-list";
import type MusicEvent from "@/features/events/types/music-event";
import { Tabs, TabsList, TabsTrigger } from "@/shared/ui/tabs";
import { MapIcon, ListIcon, SearchIcon } from "lucide-react";
import { Input } from "@/shared/ui/input";
import { Alert, AlertDescription, AlertTitle } from "@/shared/ui/alert";

const EventsView = () => {
  const { events, isLoading, isError, error } = useEvents("");
  const [selectedEvent, setSelectedEvent] = useState<MusicEvent | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"map" | "list">("map");

  const handleEventSelect = (event: MusicEvent) => {
    setSelectedEvent(event);
  };

  const handleEventClick = (eventId: string) => {
    const event = events?.find((e) => e.id === eventId) || null;
    if (event) {
      setSelectedEvent(event);
    }
  };

  const filteredEvents =
    events?.filter((event) => {
      if (!searchQuery) return true;

      const query = searchQuery.toLowerCase();
      return (
        event.title.toLowerCase().includes(query) ||
        (event.bandName && event.bandName.toLowerCase().includes(query)) ||
        (event.city && event.city.toLowerCase().includes(query)) ||
        (event.venue && event.venue.toLowerCase().includes(query)) ||
        (event.country && event.country.toLowerCase().includes(query))
      );
    }) || [];

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex flex-col gap-6">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/70">
              Upcoming Events
            </h1>
            <p className="text-muted-foreground">
              Discover live performances from your favorite artists around the
              world
            </p>
          </div>

          <div className="flex items-center gap-2 max-w-md w-full">
            <div className="relative flex-1">
              <SearchIcon
                size={18}
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground"
              />
              <Input
                placeholder="Search events, bands, locations..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Tabs
              defaultValue="map"
              className="w-auto"
              onValueChange={(v) => setViewMode(v as "map" | "list")}
            >
              <TabsList>
                <TabsTrigger value="map">
                  <MapIcon size={18} />
                </TabsTrigger>
                <TabsTrigger value="list">
                  <ListIcon size={18} />
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>

        {isError && (
          <Alert variant="destructive" className="mb-4">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>
              {error instanceof Error
                ? error.message
                : "Failed to load events. Please try again later."}
            </AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 gap-6">
          {viewMode === "map" && (
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              <div className="lg:col-span-3">
                <MapView
                  events={filteredEvents}
                  selectedEventId={selectedEvent?.id}
                  onEventClick={handleEventClick}
                />
              </div>
              <div className="lg:col-span-1">
                <EventsList
                  events={filteredEvents}
                  isLoading={isLoading}
                  error={error}
                  onEventSelect={handleEventSelect}
                  selectedEventId={selectedEvent?.id}
                />
              </div>
            </div>
          )}

          {viewMode === "list" && (
            <EventsList
              events={filteredEvents}
              isLoading={isLoading}
              error={error}
              onEventSelect={handleEventSelect}
              selectedEventId={selectedEvent?.id}
              displayMode="grid"
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default EventsView;
