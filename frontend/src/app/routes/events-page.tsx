import { lazy } from "react";

// Leaflet is only needed on the events page, so it loads with that page instead of with the app.
export const EventsPage = lazy(() => import("@/features/events").then((m) => ({ default: m.EventsPageView })));
