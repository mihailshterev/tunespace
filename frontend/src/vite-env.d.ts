/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL?: string;
  readonly VITE_SIGNALR_HUB_URL?: string;
  readonly VITE_NEWS_API_KEY?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
