import { useState, useEffect, useRef } from "react";
import { useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet.markercluster";
import type MusicEvent from "@/features/events/types/music-event";
import {
  parseCoordinates,
  eventIcon,
  selectedEventIcon,
  formatDate,
} from "./map-utils";
import { extractTimeFromDate } from "@/shared/utils/helpers";

interface MarkerClusterProps {
  events: MusicEvent[];
  selectedEventId?: string;
  onEventClick?: (eventId: string) => void;
  onEventShare?: (event: MusicEvent) => void;
}

const MarkerCluster = ({
  events,
  selectedEventId,
  onEventClick,
  onEventShare,
}: MarkerClusterProps) => {
  const map = useMap();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const previousSelectedEventId = useRef<string | undefined>(undefined);

  useEffect(() => {
    const checkDarkMode = () => {
      const isDarkMedia = window.matchMedia(
        "(prefers-color-scheme: dark)"
      ).matches;
      const isDarkClass = document.documentElement.classList.contains("dark");
      setIsDarkMode(isDarkMedia || isDarkClass);
    };

    checkDarkMode();

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = () => checkDarkMode();
    mediaQuery.addEventListener("change", handleChange);

    const observer = new MutationObserver(checkDarkMode);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => {
      mediaQuery.removeEventListener("change", handleChange);
      observer.disconnect();
    };
  }, []);

  useEffect(() => {
    const markers = L.markerClusterGroup({
      maxClusterRadius: 40,
      spiderfyOnMaxZoom: true,
      showCoverageOnHover: true,
      zoomToBoundsOnClick: true,
      animate: true,
      animateAddingMarkers: true,
      disableClusteringAtZoom: 17,
    });

    const cleanupFunctions: (() => void)[] = [];

    events.forEach((event) => {
      const coordinates = parseCoordinates(event.location);
      if (!coordinates) {
        return;
      }

      const isSelected = event.id === selectedEventId;
      const popupContent = `
        <div class="event-popup ${isDarkMode ? "dark-theme" : "light-theme"}">
          <h3 class="event-popup-title">${event.title}</h3>
          <div class="event-popup-band">${event.bandName}</div>
          <div class="event-popup-description">${event.description || ""}</div>
          <div class="event-popup-details">
            <div><strong>Date:</strong> ${formatDate(event.date)}</div>
            <div><strong>Time:</strong> ${extractTimeFromDate(event.date)}</div>
            <div><strong>Location:</strong> ${
              event.venueAddress?.split(",")[0]
            }, ${event.city}, ${event.country}</div>
            ${
              event.ticketPrice
                ? `<div><strong>Price:</strong> $${event.ticketPrice.toFixed(
                    2
                  )}</div>`
                : ""
            }
          </div>
          <div class="event-popup-actions">
            ${
              event.ticketUrl
                ? ""
                : // no tickets system yet
                  //? `<a href="${event.ticketUrl}" target="_blank" class="event-popup-button">Buy Tickets</a>`
                  ""
            }
            <button class="event-popup-share-button" data-event-id="${
              event.id
            }">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/>
                <polyline points="16,6 12,2 8,6"/>
                <line x1="12" y1="2" x2="12" y2="15"/>
              </svg>
              Share
            </button>
          </div>
        </div>
      `;

      const marker = L.marker([coordinates[0], coordinates[1]], {
        icon: isSelected ? selectedEventIcon : eventIcon,
      }).bindPopup(popupContent, {
        maxWidth: 300,
        className: isDarkMode
          ? "event-custom-popup dark-popup"
          : "event-custom-popup light-popup",
      });

      marker.on("click", (e: L.LeafletMouseEvent) => {
        L.DomEvent.stopPropagation(e);

        if (onEventClick) {
          onEventClick(event.id);
        }

        if (!marker.isPopupOpen()) {
          marker.openPopup();
        }

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const markerElement = (e.target as any)._icon;
        if (markerElement) {
          markerElement.style.filter = "brightness(1.3)";
          setTimeout(() => {
            markerElement.style.filter = "";
          }, 200);
        }
      });

      let shareClickHandler: ((e: Event) => void) | null = null;

      marker.on("popupopen", () => {
        const popupElement = marker.getPopup()?.getElement();
        if (popupElement) {
          popupElement.addEventListener("click", (e: Event) => {
            e.stopPropagation();
          });
        }

        const shareButton = document.querySelector(
          `[data-event-id="${event.id}"]`
        ) as HTMLElement;

        if (shareButton && onEventShare) {
          shareClickHandler = (e: Event) => {
            e.stopPropagation();
            onEventShare(event);
          };

          shareButton.addEventListener("click", shareClickHandler);
        }
      });

      marker.on("popupclose", () => {
        if (shareClickHandler) {
          const shareButton = document.querySelector(
            `[data-event-id="${event.id}"]`
          ) as HTMLElement;
          if (shareButton) {
            shareButton.removeEventListener("click", shareClickHandler);
          }
          shareClickHandler = null;
        }
      });

      cleanupFunctions.push(() => {
        if (shareClickHandler) {
          const shareButton = document.querySelector(
            `[data-event-id="${event.id}"]`
          ) as HTMLElement;
          if (shareButton) {
            shareButton.removeEventListener("click", shareClickHandler);
          }
        }
      });

      markers.addLayer(marker);
    });

    map.addLayer(markers);
    return () => {
      cleanupFunctions.forEach((cleanup) => cleanup());
      map.removeLayer(markers);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [events, onEventClick, onEventShare, isDarkMode]);

  useEffect(() => {
    if (selectedEventId !== previousSelectedEventId.current) {
      previousSelectedEventId.current = selectedEventId;

      if (selectedEventId) {
        const selectedEvent = events.find((e) => e.id === selectedEventId);
        if (selectedEvent) {
          const coordinates = parseCoordinates(selectedEvent.location);
          if (coordinates) {
            map.setView(coordinates, 15);

            setTimeout(() => {
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              map.eachLayer((layer: any) => {
                if (layer instanceof L.MarkerClusterGroup) {
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  layer.getLayers().forEach((marker: any) => {
                    const markerPosition = marker.getLatLng();
                    if (
                      markerPosition.lat === coordinates[0] &&
                      markerPosition.lng === coordinates[1]
                    ) {
                      marker.openPopup();
                    }
                  });
                }
              });
            }, 300);
          }
        }
      }
    }
  }, [selectedEventId, events, map]);

  return null;
};

export default MarkerCluster;
