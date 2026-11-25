import L from "leaflet";

export const parseCoordinates = (
  location: string | null | undefined
): [number, number] | null => {
  if (!location) return null;

  const coordinates = location
    .split(",")
    .map((coord) => parseFloat(coord.trim()));
  if (
    coordinates.length === 2 &&
    !isNaN(coordinates[0]) &&
    !isNaN(coordinates[1])
  ) {
    return [coordinates[0], coordinates[1]];
  }

  return null;
};

export const createEventIcon = (isSelected = false) => {
  const svgIcon = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="36" height="36">
      <circle cx="12" cy="12" r="10" fill="${
        isSelected ? "#f43f5e" : "#3B82F6"
      }" stroke="${isSelected ? "#be123c" : "#1E40AF"}" stroke-width="2" />
      <path d="M8,10 L8,14 M12,8 L12,16 M16,10 L16,14 M6.5,16.5 C6.5,16.5 8.5,14.5 12,14.5 C15.5,14.5 17.5,16.5 17.5,16.5" 
        stroke="white" stroke-width="1.5" stroke-linecap="round" fill="none" />
    </svg>
  `;

  return L.divIcon({
    html: svgIcon,
    className: isSelected ? "event-marker selected" : "event-marker",
    iconSize: [36, 36],
    iconAnchor: [18, 36],
    popupAnchor: [0, -36],
  });
};

export const formatDate = (dateString: string): string => {
  if (!dateString) return "";

  try {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    return dateString;
  }
};

export const eventIcon = createEventIcon();
export const selectedEventIcon = createEventIcon(true);
