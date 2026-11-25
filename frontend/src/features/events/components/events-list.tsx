import EventCard from "./event-card";
import Loading from "@/shared/ui/loading";
import type MusicEvent from "@/features/events/types/music-event";

interface EventsListProps {
  events: MusicEvent[];
  isLoading: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  error: any;
  onEventSelect: (event: MusicEvent) => void;
  selectedEventId?: string;
  displayMode?: "list" | "grid";
}

const EventsList = ({
  events,
  isLoading,
  error,
  onEventSelect,
  selectedEventId,
  displayMode = "list",
}: EventsListProps) => {
  if (isLoading) {
    return (
      <div className="w-full flex items-center justify-center p-8">
        <Loading />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-destructive bg-destructive/10 rounded-lg text-center my-4">
        Unable to load events. Please try again later.
      </div>
    );
  }

  if (!events || events.length === 0) {
    return (
      <div className="p-6 text-muted-foreground bg-muted/10 rounded-lg text-center my-4">
        No events found.
      </div>
    );
  }

  return (
    <div
      className={`w-full ${
        displayMode === "grid"
          ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
          : "flex flex-col gap-4"
      } overflow-y-auto pr-2`}
      style={{ maxHeight: displayMode === "list" ? "70vh" : "auto" }}
    >
      {events.map((event) => (
        <div
          key={event.id}
          onClick={() => onEventSelect(event)}
          className="cursor-pointer"
        >
          <EventCard
            event={event}
            isSelected={event.id === selectedEventId}
            variant={displayMode === "grid" ? "compact" : "full"}
          />
        </div>
      ))}
    </div>
  );
};

export default EventsList;
