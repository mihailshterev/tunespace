import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getEvents,
  createEvent,
  getEventsByBandId,
} from "@/features/events/api/events.service";

const useEvents = (bandId: string) => {
  const queryClient = useQueryClient();

  const {
    data: events,
    isLoading: isEventsLoading,
    isError: isEventsError,
    error: eventsError,
  } = useQuery({
    queryKey: ["events"],
    queryFn: getEvents,
  });

  const {
    data: bandEvents,
    isLoading: isBandEventsLoading,
    isError: isBandEventsError,
    error: bandEventsError,
  } = useQuery({
    queryKey: ["bandEvents", bandId],
    queryFn: () => getEventsByBandId(bandId),
    enabled: !!bandId,
  });

  const {
    mutateAsync: addEvent,
    isPending: isCreating,
    isError: isCreateError,
    error: createError,
  } = useMutation({
    mutationFn: createEvent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bandEvents", bandId] });
    },
  });

  return {
    events,
    bandEvents,
    isLoading: isEventsLoading || isBandEventsLoading,
    isError: isEventsError || isBandEventsError,
    error: eventsError || bandEventsError,
    addEvent,
    isCreating,
    isCreateError,
    createError,
  };
};

export default useEvents;
