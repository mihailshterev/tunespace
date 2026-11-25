export const BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:5053/api";

export const SIGNALR_HUB_URL =
  import.meta.env.VITE_SIGNALR_HUB_URL ?? "http://localhost:5053/socket-hub";

export const ROUTES = {
  ROOT: "/",
  HOME: "/home",
  LOGIN: "/login",
  SIGNUP: "/signup",
  CONFIRM_EMAIL: "/auth/confirm-email",
  EMAIL_CONFIRMATION_SENT: "/auth/email-confirmation-sent",
  FORGOT_PASSWORD: "/auth/forgot-password",
  RESET_PASSWORD: "/auth/reset-password",
  TERMS: "/terms",
  PRIVACY: "/privacy",
  COPYRIGHT: "/copyright",
  ABOUT: "/about",
  DISCOVER: "/discover",
  NEWS: "/news",
  BAND_DASHBOARD: "/band/dashboard",
  EVENTS: "/events",
  PROFILE: "/profile",
  FORUMS: "/forums",
  MESSAGES: "/messages",
  BAND: "/band",
  BAND_REGISTER: "/band/register",
  ADMIN_USERS: "/admin/users",
} as const;

export const ENDPOINTS = {
  LOGIN: "Auth/login",
  LOGOUT: "Auth/logout",
  REFRESH_TOKEN: "Auth/refresh-token",
  CURRENT_USER: "Auth/current-user",
  CONNECT_SPOTIFY: "Auth/connect-spotify",
  REGISTER: "Auth/register",
  CONFIRM_EMAIL: "Auth/confirm-email",
  RESEND_CONFIRMATION: "Auth/resend-confirmation",
  FORGOT_PASSWORD: "Auth/forgot-password",
  RESET_PASSWORD: "Auth/reset-password",
  REQUEST_EMAIL_CHANGE: "Auth/request-email-change",
  CONFIRM_EMAIL_CHANGE: "Auth/confirm-email-change",
  SPOTIFY_OAUTH: "Auth/spotify-oauth",
  BANDREGISTER: "Band/register",
  BANDUPDATE: "Band/update",
  BAND: "Band",
  RECOMMENDATIONS: "MusicDiscovery/recommendations",
  ENHANCED_RECOMMENDATIONS: "MusicDiscovery/recommendations/enhanced",
  RECOMMENDATION_FEEDBACK: "MusicDiscovery/feedback",
  BATCH_RECOMMENDATION_FEEDBACK: "MusicDiscovery/feedback/batch",
  DISCOVER: "MusicDiscovery/discover",
  MUSIC_EVENTS: "MusicEvent",
  NOTIFICATION: "Notification",
  FORUM: "Forum",
  ADMIN: "Admin",
} as const;

export const SPOTIFY_ENDPOINTS = {
  LOGIN: "Spotify/login",
  CONNECTION_STATUS: "Spotify/connection-status",
  CONNECT: "Spotify/connect",
  REFRESH: "Spotify/refresh",
  SEARCH: "Spotify/search",
  SEARCH_ARTISTS: "Spotify/search-artists",
  PROFILE: "Spotify/profile",
  ARTIST: "Spotify/artist",
  ARTISTS: "Spotify/artists",
  RECENTLY_PLAYED: "Spotify/recently-played",
  FOLLOWED_ARTISTS: "Spotify/followed-artists",
  LISTENING_STATS_TODAY: "Spotify/listening-stats/today",
  LISTENING_STATS_THIS_WEEK: "Spotify/listening-stats/this-week",
} as const;

export const UserRole = {
  Admin: "Admin",
  BandAdmin: "BandAdmin",
  BandMember: "BandMember",
  Listener: "Listener",
} as const;

export type UserRole = (typeof UserRole)[keyof typeof UserRole];

export const NotificationTypes = {
  Follow: "Follow",
  Like: "Like",
  Message: "Message",
  Event: "Event",
  Music: "Music",
} as const;

export type NotificationTypes = (typeof NotificationTypes)[keyof typeof NotificationTypes];

