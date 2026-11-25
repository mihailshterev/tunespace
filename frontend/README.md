# TuneSpace Frontend

The TuneSpace web client: a React 19 single-page app built with Vite, React Router, TanStack Query, Tailwind CSS and shadcn/ui.

## Getting started

Requires Node.js 24+ and pnpm (the pinned version is downloaded automatically).

```bash
pnpm install
pnpm dev
```

The app runs on http://localhost:5173. That port is fixed (`strictPort`), because the API's CORS policy only allows that origin.

The API is expected at `http://localhost:5053`. Override it in a `.env.local` file if needed:

```bash
VITE_API_URL=http://localhost:5053/api
VITE_SIGNALR_HUB_URL=http://localhost:5053/socket-hub
VITE_NEWS_API_KEY=your-newsapi-key
```

Only variables prefixed with `VITE_` reach the browser, and everything that does ends up in the public bundle, so never put secrets there.

## Scripts

| Script         | What it does                                 |
| -------------- | -------------------------------------------- |
| `pnpm dev`     | Start the dev server with hot module reload  |
| `pnpm build`   | Type-check (`tsc -b`) and build into `dist/` |
| `pnpm preview` | Serve the production build locally           |
| `pnpm lint`    | Run ESLint                                   |

## Structure

```
src/
├── main.tsx            # Entry point
├── app/                # App shell
│   ├── App.tsx
│   ├── routes/         # Route table, not-found page, lazily loaded pages
│   ├── layouts/        # Landing, app (sidebar + header) and bare layouts
│   ├── guards/         # ProtectedRoute, RedirectIfAuthenticated
│   ├── providers/      # Router, React Query, theme, SignalR, toasts
│   ├── components/     # Header, sidebar, logout overlay
│   └── styles/         # Global Tailwind styles
├── features/<name>/    # One folder per feature
│   ├── api/            # Service functions calling the API
│   ├── components/
│   ├── hooks/
│   ├── schemas/        # Zod schemas
│   ├── types/
│   ├── views/          # Routed pages
│   └── index.ts        # Exports the views
└── shared/             # Used across features; never imports from features/
    ├── api/            # HTTP client with automatic token refresh
    ├── auth/           # Auth store, hooks and service
    ├── realtime/       # SignalR provider
    ├── spotify/        # Spotify service, hooks, components and types
    ├── theme/          # Light/dark/system theme
    ├── forms/          # Zod resolver for react-hook-form
    ├── ui/             # shadcn/ui components
    ├── hooks/
    ├── types/
    └── utils/          # Constants, helpers, cn()
```

New shadcn/ui components are added to `src/shared/ui` (see `components.json`).
