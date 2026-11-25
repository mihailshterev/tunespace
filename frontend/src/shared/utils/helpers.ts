export const extractArtistIdFromSpotifyLink = (url: string) => {
  const regex = /\/artist\/([a-zA-Z0-9]+)/;
  const match = url!.match(regex);
  return match ? match[1] : null;
};

export const getYouTubeVideoId = (url: string): string | null => {
  const regExp =
    /(?:youtube\.com\/(?:.*v=|.*\/|.*embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
  const match = url.match(regExp);
  return match ? match[1] : null;
};

export const isNullOrEmpty = (str: string | null | undefined): boolean => {
  return str === null || str === undefined || str.trim() === "";
};

export const getTimeAgo = (dateString: string | null): string => {
  if (!dateString) return "Recently";

  const publishedDate = new Date(dateString);
  const currentDate = new Date();

  const diffInSeconds = Math.floor(
    (currentDate.getTime() - publishedDate.getTime()) / 1000
  );

  if (diffInSeconds < 60) return "just now";

  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60)
    return `${diffInMinutes} minute${diffInMinutes > 1 ? "s" : ""} ago`;

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24)
    return `${diffInHours} hour${diffInHours > 1 ? "s" : ""} ago`;

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 30)
    return `${diffInDays} day${diffInDays > 1 ? "s" : ""} ago`;

  const diffInMonths = Math.floor(diffInDays / 30);
  if (diffInMonths < 12)
    return `${diffInMonths} month${diffInMonths > 1 ? "s" : ""} ago`;

  const diffInYears = Math.floor(diffInDays / 365);
  return `${diffInYears} year${diffInYears > 1 ? "s" : ""} ago`;
};

export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);

  const options: Intl.DateTimeFormatOptions = {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: false,
  };

  return new Intl.DateTimeFormat("en-US", options).format(date);
};

export const formatDate2 = (dateStr: string): string => {
  const date = new Date(dateStr);
  return new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
};

export const extractTimeFromDate = (dateStr: string): string => {
  if (!dateStr) return "";

  try {
    const date = new Date(dateStr);
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  } catch (error) {
    console.error("Error extracting time from date:", error);
    return "";
  }
};
