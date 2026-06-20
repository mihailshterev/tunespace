# TuneSpace - Technical Documentation

> _Discover the undiscovered. Connect with the underground._

A platform for promoting independent musical artists and building a community around the alternative music scene.

---

## Table of Contents

1. [Overview](#1-overview)
2. [The Problem and the Vision](#2-the-problem-and-the-vision)
3. [Target Audience](#3-target-audience)
4. [What Sets TuneSpace Apart](#4-what-sets-tunespace-apart)
5. [Feature Overview](#5-feature-overview)
6. [Technology Stack](#6-technology-stack)
7. [System Architecture](#7-system-architecture)
8. [Project Structure](#8-project-structure)
9. [Data Model](#9-data-model)
10. [The Music Discovery Engine](#10-the-music-discovery-engine)
11. [Key Workflows](#11-key-workflows)
12. [Real-Time Communication](#12-real-time-communication)
13. [Security](#13-security)
14. [API Reference](#14-api-reference)
15. [Non-Functional Characteristics](#15-non-functional-characteristics)
16. [Running the Project Locally](#16-running-the-project-locally)
17. [Testing](#17-testing)
18. [Future Roadmap](#18-future-roadmap)

---

## 1. Overview

TuneSpace is a full-stack music discovery and community platform built specifically to surface **underground and emerging artists** and connect them with **listeners who are looking for fresh, undiscovered talent**. Rather than being "yet another music platform," it acts as a social hub for underground music culture, combining an AI-assisted recommendation engine, real-time communication, community forums, live-event tooling, and a complete set of artist promotion features.

The system is composed of two applications:

- A **.NET 9 backend** that follows Clean Architecture and is split into four projects (API, Application, Core, Infrastructure) plus a dedicated test project. It exposes a REST API and a SignalR hub, persists data in PostgreSQL, and integrates with several external music services.
- A **Next.js 15 / React 19 frontend** written in TypeScript, using the App Router, Tailwind CSS with shadcn/ui components, TanStack Query for data fetching, and Zustand for client-side state.

The two halves communicate over HTTP (REST) for request/response operations and over WebSockets (SignalR) for real-time features such as chat and notifications.

---

## 2. The Problem and the Vision

In today's digital music landscape we face a paradox: we have access to more music than ever, yet discovering genuinely meaningful new artists has become harder. The modern industry is dominated by algorithmic recommendation systems that prioritize popularity metrics, stream counts, and commercial viability over artistic authenticity and innovation.

Traditional discovery methods - browsing record stores, word-of-mouth recommendations - have largely been replaced by systems that favor commercial success over artistic merit. This creates a disconnect between passionate music lovers who are searching for authentic experiences and underground artists who are creating innovative work but struggle to reach the right audience. Social media offers some promotional opportunities, but those platforms are not designed for music discovery and often force artists to become content creators rather than focus on their craft.

**TuneSpace addresses this directly.** Its mission is to connect music lovers with rising artists _before_ they become mainstream, fostering a community where authentic talent can thrive and where passionate listeners can find their next favorite band. Meaningful discovery requires more than sophisticated algorithms - it requires a community-driven approach that values artistic authenticity and the cultural significance of underground scenes.

The platform delivers on this vision through:

- **Intelligent music discovery** - an AI-assisted recommendation system that analyzes a user's Spotify listening history and combines data from multiple sources (Spotify, Last.fm, MusicBrainz, Bandcamp) to suggest artists that match the user's taste while encouraging meaningful exploration.
- **A focus on underground artists** - algorithms tuned to find talent early in an artist's journey, giving listeners early access before that music goes mainstream.
- **A living community** - integrated forums, real-time chat, and social features that create spaces for in-depth music discussion and authentic connection.
- **Live-event integration** - an events system that connects artists with local fans and promotes the live scene that is essential to underground culture.
- **Artist support tools** - comprehensive tooling for building a fan base, including profile management, merchandise, direct fan communication, and promotional opportunities.

---

## 3. Target Audience

TuneSpace is built around two primary user groups whose interaction forms the core of the experience.

### Music Enthusiasts

Passionate listeners who crave authentic, undiscovered talent and want to be part of an artist's journey from the very beginning. These users actively participate in discovery, share their finds with the community, and help shape the careers of rising artists.

### Independent (Underground) Artists

Musicians and bands creating authentic work who need a platform to reach an appreciative audience. TuneSpace gives these artists promotional tools, direct fan engagement, and a community that values artistic integrity over commercial success.

These two groups are reflected directly in the application's role model - see [Security](#13-security) for the `Listener`, `BandMember`, `BandAdmin`, and `Admin` roles.

---

## 4. What Sets TuneSpace Apart

Many platforms dominate the market and attract millions of users, but they tend to prioritize popular artists and rely on algorithmic recommendations that trap listeners in a narrow circle of well-known names and genres. TuneSpace differentiates itself by placing independent artists and discovery-minded listeners at the center.

- **Underground-first ranking.** The discovery engine actively rewards lesser-known artists with low popularity scores but high genre relevance, instead of reinforcing already-popular acts.
- **Multi-signal recommendations.** Rather than relying on a single algorithm, TuneSpace blends AI (vector search + an LLM), collaborative filtering, location-based discovery, and traditional similarity techniques.
- **Community at the core.** Forums, band-to-fan chat, follows, and event RSVPs are first-class features, not afterthoughts.
- **Artist enablement.** Bands get a dashboard, merchandise management, event promotion, and direct messaging with fans.

---

## 5. Feature Overview

### Account & Profile Management

- Registration with email verification.
- Login via email/password **or** Spotify OAuth.
- Profile editing and profile-picture upload.
- Follower / following relationships and counts.

### Music Discovery & Recommendations

- AI-assisted recommendations using vector embeddings and dedicated scoring/filtering algorithms.
- Spotify integration for browsing, searching, and sharing music.
- Personalized recommendations based on listening history.
- Browsing by genre and discovery of new artists and bands.

### Band & Artist Management

- Create and edit a band profile (name, description, genre, location, cover image, external links).
- Manage members and role assignments, and invite new members.
- Create and promote music events.
- Manage merchandise.
- Communicate directly with fans through band messaging.

### Event Management

- Create events with location and details (dates, ticketing).
- Filter and search events by location and date.
- Promote events through built-in tooling.
- Visualize event locations on an interactive map (Leaflet).

### Communication System

- Real-time user-to-user chat.
- Dedicated band-to-fan communication channels.
- Notifications for important events and messages.

### Social & Community Features

- Create and participate in forum discussions.
- Like and reply to posts (threaded, nested replies).
- Band-focused discussions, plus the ability to share artists/events as cards inside posts.

### User Interface & Accessibility

- Intuitive, accessible UI/UX.
- Mobile-responsive design with light/dark theming.

---

## 6. Technology Stack

The application is built on a modern stack chosen for scalability, performance, and maintainability.

### Frontend

| Technology                                    | Role                                                                                                                                                                                                                                                 |
| --------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Next.js 15** (App Router, Turbopack)        | Production-grade React framework: server components, file-based routing, code splitting, image optimization. Dev server runs on port **5173**.                                                                                                       |
| **React 19**                                  | Declarative, component-based UI library with concurrent rendering.                                                                                                                                                                                   |
| **TypeScript 5.8**                            | Static typing across the whole frontend for safety and maintainability.                                                                                                                                                                              |
| **Zustand 5**                                 | Minimal, boilerplate-free global state management (used for auth state).                                                                                                                                                                             |
| **TanStack Query 5**                          | Data fetching with caching, background updates, and synchronization.                                                                                                                                                                                 |
| **Custom Fetch HTTP client**                  | A typed wrapper over the native Fetch API with automatic JWT refresh and a request queue. (The project migrated away from Axios to this lightweight client - see [`frontend/src/services/http-client.ts`](../frontend/src/services/http-client.ts).) |
| **React Hook Form 7**                         | Efficient, low-re-render form handling.                                                                                                                                                                                                              |
| **Hookform Resolvers + Zod 3**                | Schema-based validation with type inference shared between runtime and compile time.                                                                                                                                                                 |
| **Tailwind CSS 3.4 + shadcn/ui (Radix UI)**   | Utility-first styling plus an accessible component library.                                                                                                                                                                                          |
| **Leaflet + React Leaflet (+ markercluster)** | Interactive maps for event locations.                                                                                                                                                                                                                |
| **@microsoft/signalr**                        | Client for real-time chat and notifications.                                                                                                                                                                                                         |
| **PostCSS**                                   | CSS transformation pipeline.                                                                                                                                                                                                                         |
| Supporting libraries                          | Embla Carousel, React Day Picker, Sonner (toasts), date-fns, next-themes, lucide-react / react-icons, jose.                                                                                                                                          |
| **pnpm**                                      | Package manager.                                                                                                                                                                                                                                     |

### Backend (.NET 9)

| Technology                                 | Role                                                                                                              |
| ------------------------------------------ | ----------------------------------------------------------------------------------------------------------------- |
| **C# / ASP.NET Core 9**                    | High-performance, cross-platform web API framework.                                                               |
| **Entity Framework Core 9**                | ORM with LINQ querying, change tracking, and migrations.                                                          |
| **PostgreSQL** (via **Npgsql**)            | Primary relational database (ACID, JSON/JSONB, extensibility).                                                    |
| **Pgvector.EntityFrameworkCore**           | EF Core provider for the `pgvector` extension, enabling vector-similarity search over 384-dimensional embeddings. |
| **Microsoft SignalR**                      | Real-time bidirectional communication (WebSockets / SSE / long polling).                                          |
| **ASP.NET Core Identity**                  | User identity, roles, password hashing, email confirmation, lockout.                                              |
| **JWT Bearer Authentication**              | Stateless access tokens, paired with persisted refresh tokens.                                                    |
| **ONNX Runtime + Microsoft.ML.Tokenizers** | On-device inference and tokenization for generating text embeddings.                                              |
| **Ollama** (`gemma3:1b`)                   | Local large-language-model used for RAG-based recommendation prompts.                                             |
| **FluentEmail (SMTP)**                     | Templated transactional email (registration, password reset, email change).                                       |
| **Microsoft.Extensions.Http.Resilience**   | Resilient HTTP calls (retries, circuit breakers, timeouts) for external APIs.                                     |
| **Serilog**                                | Structured logging with request logging.                                                                          |
| **Swashbuckle / Swagger**                  | API documentation and exploration (in Development).                                                               |

### External Integrations

- **Spotify Web API** - artist data, user listening history (recently played, top artists, followed artists), and OAuth authentication.
- **Bandcamp** - underground artist discovery and catalog data.
- **MusicBrainz** - comprehensive music metadata and local-artist discovery.
- **Last.fm** - similar-artist relationships and enriched metadata.
- **Ollama** - local LLM inference for AI recommendations.

### Development Environments

- **Visual Studio** / **Visual Studio Code** for application development.
- **pgAdmin** for PostgreSQL administration.

---

## 7. System Architecture

The backend follows **Clean Architecture**, with a strict dependency rule: source-code dependencies point inward, toward the core business logic. Inner layers never depend on outer layers, which keeps the domain independent of frameworks and databases and makes the system modular, testable, and maintainable.

```
┌──────────────────────────────────────────────────────────────┐
│  Presentation Layer  -  TuneSpace.Api  +  Frontend           │
│  • REST controllers, SignalR hub, middleware                 │
│  • React components, App Router pages, client-side state     │
├──────────────────────────────────────────────────────────────┤
│  Application Layer  -  TuneSpace.Application                  │
│  • Business services (use cases)                             │
│  • Background services (scheduled / long-running work)       │
├──────────────────────────────────────────────────────────────┤
│  Domain Layer  -  TuneSpace.Core                             │
│  • Entities, value models, enums                            │
│  • Interfaces (contracts), custom exceptions, DTOs          │
├──────────────────────────────────────────────────────────────┤
│  Infrastructure Layer  -  TuneSpace.Infrastructure          │
│  • EF Core DbContext, repositories, migrations              │
│  • External API clients, SignalR hub, identity, email       │
└──────────────────────────────────────────────────────────────┘
        Dependencies point inward  ⟶  toward the Domain
```

### Layer Responsibilities

**1. Presentation - [`TuneSpace.Api`](../backend/TuneSpace.Api) + Frontend**

- **Controllers** translate HTTP requests into service calls and shape responses.
- **SignalR hub** ([`SocketHub`](../backend/TuneSpace.Infrastructure/Hubs/SocketHub.cs)) provides real-time endpoints.
- **Middleware** handles authentication, logging, exception handling, and user-activity tracking.
- **Frontend** provides React components/pages and client-side state and caching.

**2. Application - [`TuneSpace.Application`](../backend/TuneSpace.Application)**

- **Services** implement the business logic and orchestrate repositories.
- **Background services** run long-lived, independent work (adaptive learning, refresh-token cleanup).

**3. Domain - [`TuneSpace.Core`](../backend/TuneSpace.Core)**

- **Entities** represent the core business objects.
- **Interfaces** define contracts for services, repositories, and clients (`IClients`, `IInfrastructure`, `IRepositories`, `IServices`), enabling dependency inversion.
- **Exceptions** and **Models** define domain-specific error conditions and value models.

**4. Infrastructure - [`TuneSpace.Infrastructure`](../backend/TuneSpace.Infrastructure)**

- **Repositories** implement data access and encapsulate EF Core queries.
- **Data** holds the [`TuneSpaceDbContext`](../backend/TuneSpace.Infrastructure/Data/TuneSpaceDbContext.cs) - the central mapping of entities to tables.
- **Clients** implement HTTP integrations with external services.
- **Identity**, **Migrations**, **Options**, **Seeding**, **Templates**, and infrastructure **Services** round out cross-cutting concerns.

### Application Bootstrapping

[`Program.cs`](../backend/TuneSpace.Api/Program.cs) wires the whole system together using the minimal-hosting model. It configures Serilog, CORS, controllers, Swagger, health checks, and registers each layer through dedicated extension methods (`AddOptions`, `AddDatabaseServices`, `AddRepositoryServices`, `AddInfrastructureServices`, `AddIdentityServices`, `AddHttpClientServices`, `AddRecommendationServices`, `AddApplicationServices`, etc.). On startup it seeds the required roles, maps controllers, exposes the SignalR hub at `/socket-hub`, and exposes a health endpoint at `/health`.

---

## 8. Project Structure

```
TuneSpace/
├── backend/
│   ├── TuneSpace.Api/             # Presentation: REST API + composition root
│   ├── TuneSpace.Application/     # Business logic & background services
│   ├── TuneSpace.Core/            # Domain entities, interfaces, DTOs
│   ├── TuneSpace.Infrastructure/  # Data access, external clients, identity
│   └── TuneSpace.Tests/           # Automated tests
├── frontend/
│   └── src/                       # Next.js application source
└── docs/                          # Project documentation
```

### Frontend ([`frontend/src`](../frontend/src))

| Folder       | Purpose                                                                                                                                                          |
| ------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `actions`    | Next.js server actions and form-handling logic.                                                                                                                  |
| `app`        | App Router routes, layouts, and pages.                                                                                                                           |
| `components` | Reusable React components (TSX), organized by domain (`auth`, `band`, `discovery`, `events`, `social`, `spotify`, `user`, plus a `shadcn` UI primitives folder). |
| `hooks`      | Custom React hooks, primarily for fetching and managing server data.                                                                                             |
| `interfaces` | TypeScript types and interfaces.                                                                                                                                 |
| `layouts`    | Layout wrappers (sidebar, header, etc.).                                                                                                                         |
| `lib`        | Helper libraries.                                                                                                                                                |
| `providers`  | React context providers.                                                                                                                                         |
| `schemas`    | Zod validation schemas.                                                                                                                                          |
| `services`   | API client functions, one file per domain, all built on the shared `http-client`.                                                                                |
| `stores`     | Zustand stores (e.g. `auth-store`).                                                                                                                              |
| `styles`     | Global Tailwind CSS styles.                                                                                                                                      |
| `utils`      | Helper functions and constants (API endpoints, route definitions).                                                                                               |

Route groups under `app/`:

- **`(landing)`** - public marketing and auth-entry pages: `login`, `signup`, `about`, `privacy`, `terms`, `copyright`.
- **`(root)`** - the authenticated application: `home`, `discover`, `band`, `events`, `forums`, `messages`, `news`, `notifications`, `profile`.
- **`auth`** - flow-completion pages: `confirm-email`, `confirm-email-change`, `email-confirmation-sent`, `forgot-password`, `reset-password`, `spotify-callback`, `spotify-connect-callback`.

Key config files: `next.config.ts`, `tailwind.config.ts`, `tsconfig.json`, `eslint.config.mjs`, `postcss.config.mjs`, `components.json` (shadcn/ui), and `.env`.

### Backend

**[`TuneSpace.Api`](../backend/TuneSpace.Api)** - the entry point for all HTTP requests.

- `Controllers` - one controller per domain (auth, users, bands, events, merchandise, forums, chat, band chat, follows, notifications, Spotify, music discovery).
- `DTOs` - request models that define the contract between client and API.
- `Extensions` - extension methods that add app-specific behavior to .NET types.
- `Infrastructure` - cross-cutting helpers supporting the API (including the global exception handler).
- `Middleware` - custom request-pipeline components (e.g. user-activity tracking).
- `Program.cs` - the composition root.

**[`TuneSpace.Application`](../backend/TuneSpace.Application)** - the heart of the business logic.

- `Services` - domain services. Notable sub-areas: `AI` (`AIRecommendationService`, `EnhancedAIPromptService`) and `MusicDiscovery` (`ArtistDiscoveryService`, `CollaborativeFilteringService`, `DataEnrichmentService`, `RecommendationScoringService`, `AdaptiveRecommendationScoringService`, `AdaptiveLearningService`, `BandCachingService`). Top-level services cover auth, users, bands, chat, forums, events, merchandise, notifications, Spotify, embeddings, vector search, tokens, and more.
- `BackgroundServices` - `AdaptiveLearningBackgroundService` and `RefreshTokenCleanupService`.
- `Common` - shared utilities used across services.
- `ServiceCollectionExtensions.cs` - registers all application-level services.

**[`TuneSpace.Core`](../backend/TuneSpace.Core)** - the framework-independent domain.

- `Entities`, `Enums`, `Exceptions`, `Models`, `Common`, and `DTOs` (with `Requests`/`Responses` sub-folders).
- `Interfaces` - the abstraction layer (`IClients`, `IInfrastructure`, `IRepositories`, `IServices`) that enables dependency inversion.

**[`TuneSpace.Infrastructure`](../backend/TuneSpace.Infrastructure)** - implementation details.

- `Clients` - `SpotifyClient`, `BandcampClient`, `MusicBrainzClient`, `LastFmClient`, `OllamaClient`.
- `Data` - the `TuneSpaceDbContext`.
- `Hubs` - `SocketHub` (SignalR).
- `Identity` - `ApplicationRole` extending the Identity framework.
- `Migrations` - EF Core schema migrations (version control for the database schema).
- `Options` - strongly-typed configuration classes (`Spotify`, `Jwt`, `Email`, `Database`, `Frontend`, `LastFm`, `Security`).
- `Repositories` - one repository per aggregate.
- `Seeding` - `RoleSeeder` for initial role creation.
- `Services` - infrastructure services (`EmailTemplateService`, `UrlBuilderService`).
- `Templates` - HTML email templates.

**[`TuneSpace.Tests`](../backend/TuneSpace.Tests)** - automated tests for backend logic (xUnit, Moq, FluentAssertions).

---

## 9. Data Model

PostgreSQL is the application database. Beyond ACID guarantees and strong data integrity, the decisive factor is the **`pgvector`** extension, which provides built-in vector-similarity search - making PostgreSQL an ideal fit for the AI-driven recommendation system that matches users to relevant artists and bands through vector embeddings.

The schema is defined by the [`TuneSpaceDbContext`](../backend/TuneSpace.Infrastructure/Data/TuneSpaceDbContext.cs), which extends `IdentityDbContext<User, ApplicationRole, Guid>` and registers the `vector` Postgres extension. The model groups into the following areas.

### Core User Management

- **AspNetUsers** (`User`) - the foundation, built on ASP.NET Identity. Holds authentication data, profile information, Spotify integration details (`SpotifyId`, `ExternalProvider`, `ExternalLoginLinkedAt`), the user's `Role`, a profile picture, and `LastActiveDate`. Backed by the standard ASP.NET Identity tables (roles, claims, logins, tokens).

### Music & Band Ecosystem

- **Bands** - registered bands with metadata: `Name`, `Description`, `Genre`, `Country`/`City`, cover image, and external platform links (`SpotifyId`, `YouTubeEmbedId`). A band has many members, events, merchandise items, followers, and chats.
- **MusicEvents** - concerts/performances tied to a band, with venue, dates, ticket info, and location coordinates.
- **Merchandises** - products tied to a band (images, descriptions, pricing).

### Social Features & Communication

- **Chats** / **Messages** - direct user-to-user conversations and the messages within them.
- **BandChats** / **BandMessages** - band-to-fan conversations and their messages (supporting both user→band and band→user messaging).
- **Follows** - user-to-user follow relationships.
- **BandFollows** - user-to-band follow relationships. Both carry timestamps for activity tracking.
- **Notifications** - system communication about events, updates, and social interactions.

### Forum System

A hierarchical discussion structure:

- **ForumCategories** - organize topics (name, description, icon, admin flags).
- **ForumThreads** - belong to a category, hold discussion topics and a view count.
- **ForumPosts** - support nested conversations via parent–child relationships for replies.
- **ForumPostLikes** - track per-post user engagement.

### Music Discovery (AI)

- **ArtistEmbeddings** - vector representations of artists using `pgvector`, storing **384-dimensional** embeddings (`vector(384)`) for similarity matching, alongside metadata: genres, location, popularity, follower counts, similar artists, image URL, and `DataSource` (e.g. Bandcamp/Spotify).
- **RecommendationContexts** - per-user preference data: genres, top artists, recently played tracks, and a personalized **preference embedding** (`vector(384)`).
- **DynamicScoringWeights** - per-user adjustable parameters that adapt the recommendation algorithm based on feedback.
- **GenreEvolutions** - track how a user's preferences shift over time (monthly/weekly preference maps stored as JSON).
- **RecommendationFeedbacks** - capture user interactions with recommendations, including the scoring factors that produced them.

### System Infrastructure

- **RefreshTokens** - secure token management with expiration tracking and revocation.
- **Notifications** - (see above) the cross-cutting user-notification table.

---

## 10. The Music Discovery Engine

The core innovation of TuneSpace is a **hybrid recommendation engine** that combines several complementary approaches instead of relying on a single algorithm. It is orchestrated by [`MusicDiscoveryService`](../backend/TuneSpace.Application/Services/MusicDiscoveryService.cs), which exposes both a standard mode and an "enhanced AI" mode.

### The Pipeline

The engine runs a carefully sequenced, six-stage process:

1. **User data collection** - gathers the user's Spotify listening history (recently played, followed artists, top artists).
2. **Genre analysis & enrichment** - analyzes and expands genres based on listening patterns.
3. **Multi-source aggregation** - fetches recommendations from several sources, in parallel.
4. **Data processing & enrichment** - enriches raw results and generates similar-artist suggestions.
5. **Adaptive scoring & ranking** - applies scoring algorithms with confidence boosting, using per-user adaptive weights when available (falling back to standard scoring otherwise).
6. **Final processing** - applies diversity algorithms, deduplication, and cooldown management so the same artists aren't repeatedly recommended.

### Recommendation Sources

The engine draws from multiple, complementary sources:

1. **Local band discovery** - uses MusicBrainz and Bandcamp to identify emerging local artists by geography and genre.
2. **Registered-band promotion** - prioritizes bands registered on the platform, creating value for the artist community.
3. **Underground discovery** - uses Spotify search to surface lesser-known artists with low popularity scores but high genre relevance.
4. **Similar-artist discovery** - uses Last.fm similarity to expand recommendation networks along acoustic/stylistic relationships.
5. **AI-enhanced recommendations** - uses a local large-language model (Ollama, `gemma3:1b`) with **Retrieval-Augmented Generation (RAG)**, grounded by vector search over artist embeddings.
6. **Collaborative filtering** - analyzes similarity between users to recommend artists liked by listeners with comparable behavior.

### The AI Subsystem

Within this hybrid approach, AI is one key component among several. The AI subsystem ([`AIRecommendationService`](../backend/TuneSpace.Application/Services/AI/AIRecommendationService.cs)) uses:

- **Vector embeddings** - 384-dimensional representations capturing semantic relationships among artists, genres, and user preferences, generated on-device with ONNX Runtime + ML Tokenizers ([`EmbeddingService`](../backend/TuneSpace.Application/Services/EmbeddingService.cs)) and stored/queried via `pgvector` ([`VectorSearchService`](../backend/TuneSpace.Application/Services/VectorSearchService.cs)).
- **Dynamic scoring weights** - recommendation scoring that adapts to feedback from user interactions.
- **Confidence scoring & explainable AI** - multi-dimensional evaluation, adaptive confidence calibration, and automatically generated explanations for recommendations.
- **Feedback processing** - tracking of user interactions with immediate updates to scoring parameters and success-rate analysis, continually refined by the `AdaptiveLearningBackgroundService`.

The result is comprehensive coverage of the discovery landscape - balancing AI innovation with proven recommendation techniques and personalization to deliver a high-quality discovery experience.

---

## 11. Key Workflows

### 11.1 Registration & Email Confirmation

When users first discover TuneSpace, they create an account through a simple form (email, username, password). The system validates the email immediately and provides feedback. Registration is handled securely with password hashing via ASP.NET Core Identity.

Users then receive an email containing a temporary confirmation link that activates their account, which guards against abuse. Throughout the flow the system provides clear messaging. After confirmation, users may optionally choose to create an **artist** profile.

Relevant endpoints: `POST /api/Auth/register`, `GET /api/Auth/confirm-email`, `POST /api/Auth/resend-confirmation`. Email is delivered with FluentEmail using HTML templates from the Infrastructure `Templates` folder.

### 11.2 Login & Spotify Integration

TuneSpace supports a dual authentication system: traditional email/password login **and** Spotify OAuth.

When a user chooses "Log in with Spotify," they are redirected to a Spotify authorization page. Regardless of method, all users receive secure JWT tokens with automatic refresh, providing a stable session across devices. The Spotify connection can also be linked to an existing account (`connect-spotify`), enabling listening-history-based personalization.

Relevant endpoints: `POST /api/Auth/login`, `POST /api/Auth/refresh-token`, `POST /api/Auth/spotify-oauth`, `POST /api/Auth/connect-spotify`, and the `SpotifyController` `login`/`connect`/`callback`/`connection-status` flow.

### 11.3 Band Registration & Management

Musicians use TuneSpace to create and manage bands and maintain a professional presence. Registration supports solo projects, existing groups registering together, or members invited to build a profile collaboratively.

After creation, the founder automatically receives the **administrator** role with full rights. Administrators can add members and assign roles (vocalist, guitarist, etc.) and define each member's access and edit capabilities. The band dashboard offers profile-customization tooling: uploading images, adding links, and editing the biography.

Event management is central: administrators create music events with descriptions, locations, dates, and ticket details. The platform includes promotion tooling through built-in social features, fan RSVP, and automatic notifications for upcoming concerts. A complete merchandise-management system lets administrators upload product images and descriptions and set prices.

Relevant endpoints: `POST /api/Band/register`, `POST /api/Band/add-member`, `PUT /api/Band/update`, the `MusicEvent` controller, and the `Merchandise` controller.

### 11.4 Band Chat

TuneSpace's real-time messaging system enables direct communication between fans and their favorite bands. Users start a private conversation with a band; messages are delivered instantly over SignalR WebSockets with push notifications and persistent chat history.

Fans can share impressions and bands can reply personally, building authentic connections. Bands get a convenient dashboard to manage conversations, receive new-message notifications, and communicate efficiently with their fans (including aggregate fan-chat statistics).

Relevant endpoints: the `BandChat` controller (`start`, `send-to-band`, `send-from-band`, message read/delete) plus the `SocketHub` for live delivery.

### 11.5 Forum Discussions

The community forum is a lively space where music fans discuss artists, genres, concerts, and experiences. Topics are organized by category, making it easy to find and create discussions. Conversations are structured into threads where anyone can reply and interact. Posts can be liked - which highlights valuable contributions - and the system sends notifications for new replies and likes to keep engagement high. Users can also share an artist directly into a forum thread as a rich card.

Relevant endpoints: the `Forum` controller (`categories`, `threads`, `posts`, `posts/{id}/like`, `threads/band/{bandId}`).

---

## 12. Real-Time Communication

Real-time features are powered by **SignalR**, exposed through [`SocketHub`](../backend/TuneSpace.Infrastructure/Hubs/SocketHub.cs) at `/socket-hub`. The hub is `[Authorize]`-protected, so only authenticated clients can connect.

On connection, the hub:

- Adds the connection to a **group keyed by the user's ID**, so the server can push notifications and messages directly to a specific user across all their devices/connections.
- Adds the user to **band groups** (`band_{bandId}`) for any band they belong to, enabling band-wide real-time delivery.

Clients can explicitly join/leave band groups (`JoinBandGroup` / `LeaveBandGroup`). On disconnect, the hub cleans up the user's group memberships. The frontend connects with `@microsoft/signalr`. This infrastructure backs user-to-user chat, band-to-fan chat, and live notifications.

---

## 13. Security

Security is enforced at multiple layers:

- **Authentication** - JWT bearer tokens for stateless API access. Tokens are short-lived (configurable; default 60 minutes per `appsettings.json`) and backed by persisted, revocable **refresh tokens** with expiration tracking. The `RefreshTokenCleanupService` removes expired tokens in the background.
- **Identity & password security** - ASP.NET Core Identity handles password hashing, account confirmation, and lockout after failed attempts.
- **Authorization & roles** - a role model with four roles, defined in [`Roles`](../backend/TuneSpace.Core/Enums/Roles.cs): `Admin`, `BandAdmin`, `BandMember`, `Listener`. Roles are seeded at startup via `RoleSeeder`.
- **External authentication** - Spotify OAuth, with secure OAuth-state handling (`OAuthStateService`).
- **Transport & CORS** - HTTPS redirection plus a CORS policy restricting origins to the configured frontend.
- **Session handling** - refresh tokens are managed securely; the frontend's HTTP client automatically refreshes expired access tokens and retries the original request transparently.
- **Centralized error handling** - a `GlobalExceptionHandler` with `ProblemDetails` ensures consistent, non-leaky error responses.
- **Secret management** - sensitive configuration (Spotify client secret, SMTP credentials, connection strings) is kept out of source control and supplied via user secrets / environment configuration.

---

## 14. API Reference

The REST API is organized into twelve controllers under the `/api/[controller]` route convention. The following summarizes the available endpoints.

### Auth - `/api/Auth`

`GET current-user` · `POST register` · `POST login` · `POST logout` · `POST refresh-token` · `POST spotify-oauth` · `POST connect-spotify` · `GET confirm-email` · `POST resend-confirmation` · `POST forgot-password` · `POST reset-password` · `POST request-email-change` · `POST confirm-email-change`

### User - `/api/User`

`GET {username}` · `GET search/{search}` · `GET {username}/profile-picture` · `GET {username}/profile` · `POST upload-profile-picture`

### Band - `/api/Band`

`GET {bandId}` · `GET user/{userId}` · `GET {bandId}/image` · `POST register` · `POST add-member` · `PUT update` · `DELETE {bandId}` · `GET {bandId}/followers` · `GET {bandId}/follower-count` · `GET {bandId}/is-following` · `POST {bandId}/follow` · `DELETE {bandId}/unfollow` · `GET user/{userId}/followed-bands` · `GET user/{userId}/followed-bands-count`

### MusicDiscovery - `/api/MusicDiscovery`

`GET recommendations` · `GET recommendations/enhanced` · `POST recommendations/preferences` · `POST recommendations/enhanced/preferences` · `POST feedback` · `POST feedback/batch`

### Spotify - `/api/Spotify`

`GET login` · `GET connect` · `GET callback` · `GET connection-status` · `GET profile` · `GET top-artists` · `GET top-songs` · `GET artist/{artistId}` · `GET artists/{artistIds}` · `GET listening-stats/today` · `GET listening-stats/this-week` · `GET search/{searchTerm}` · `GET search-artists/{searchTerm}` · `GET recently-played` · `GET followed-artists` · `POST refresh`

### MusicEvent - `/api/MusicEvent`

`GET` (all) · `GET band/{bandId}` · `GET {eventId}` · `GET band/{bandId}/upcoming` · `POST` · `PUT` · `DELETE {eventId}`

### Merchandise - `/api/Merchandise`

`GET {merchandiseId}` · `GET band/{bandId}` · `GET {merchandiseId}/image` · `POST create` · `PUT update` · `DELETE {merchandiseId}`

### Forum - `/api/Forum`

`GET categories` · `GET categories/{categoryId}` · `GET categories/{categoryId}/threads` · `GET threads/{threadId}` · `GET posts/{postId}` · `GET threads/band/{bandId}` · `POST categories` · `POST threads` · `POST posts` · `POST posts/{postId}/like` · `DELETE posts/{postId}/unlike`

### Chat - `/api/Chat`

`GET get-messages/{chatId}` · `GET get-chat/{chatId}` · `GET get-user-chats` · `POST create-chat` · `POST send-private-message` · `POST mark-as-read`

### BandChat - `/api/BandChat`

`GET user-chats` · `GET band-chats/{bandId}` · `GET {chatId}/messages` · `GET {chatId}/unread-count` · `GET {chatId}` · `GET check/{bandId}` · `POST start/{bandId}` · `POST {bandId}/send-to-band` · `POST {bandId}/send-from-band/{userId}` · `PUT messages/{messageId}/read` · `DELETE messages/{messageId}` · `DELETE {chatId}`

### Follow - `/api/Follow`

`GET {username}/followers` · `GET {username}/following` · `GET {username}/follower-count` · `GET {username}/following-count` · `GET {username}/is-following` · `POST {username}` · `DELETE {username}`

### Notification - `/api/Notification`

`GET {username}` · `POST send-notification` · `PUT mark-as-read/{notificationId}` · `PUT mark-all-as-read/{username}` · `DELETE {id}`

> In Development, the full, interactive API surface is available through Swagger UI.

---

## 15. Non-Functional Characteristics

- **Security** - secure authentication and access control, password hashing, and careful handling of personal data (see [Security](#13-security)).
- **Performance** - fast response times, optimized database operations (indexed embeddings and lookups), efficient resource management, caching strategies (`BandCachingService`, TanStack Query on the client), and a scalable architecture.
- **Maintainability** - comprehensive API documentation (Swagger) and code-level documentation, plus Clean Architecture's clear separation of concerns to ease future change.
- **Usability & accessibility** - accessible, responsive UI that adapts to different screen sizes and supports assistive technologies, with consistent design and fast page loads.
- **Compatibility** - modern browsers, mobile platforms, and standard web technologies; industry-standard API practices and reliable integration with external services through resilient HTTP communication.

---

## 16. Running the Project Locally

### Prerequisites

- **Backend:** .NET 9 SDK, PostgreSQL (with the `pgvector` extension available).
- **Frontend:** Node.js 20+, pnpm.
- **External:** a Spotify Developer account; a local Ollama instance running the `gemma3:1b` model for AI recommendations.

### Backend

```bash
cd backend
dotnet restore

# configure the PostgreSQL connection string in appsettings.json
dotnet ef database update

# provide Spotify credentials via user secrets
dotnet user-secrets set "Spotify:ClientId" "your-client-id"
dotnet user-secrets set "Spotify:ClientSecret" "your-client-secret"

dotnet run --project TuneSpace.Api
```

On startup the API seeds roles, exposes the REST endpoints, mounts the SignalR hub at `/socket-hub`, exposes `/health`, and (in Development) serves Swagger UI.

### Frontend

```bash
cd frontend
pnpm install
pnpm dev      # starts the dev server on http://localhost:5173
```

Configure the frontend `.env` (e.g. the API base URL) before starting.

---

## 17. Testing

Backend logic is covered by the **[`TuneSpace.Tests`](../backend/TuneSpace.Tests)** project, which provides automated tests to ensure reliability and correctness. The test stack uses **xUnit** as the test framework, **Moq** for mocking dependencies, **FluentAssertions** for expressive assertions, and `Microsoft.AspNetCore.Mvc.Testing` for integration-style tests against the API.

Run the suite with:

```bash
cd backend
dotnet test
```

---

## 18. Future Roadmap

Planned enhancements that extend the platform's value:

- **Music streaming** - direct playback and integration with additional streaming services (e.g. Apple Music, Tidal).
- **Ticketing & commerce** - built-in ticketing systems and expanded merchandise commerce.
- **Advanced analytics** - artist-performance insights and listener analytics based on user behavior.
- **Deeper AI & learning** - expanded AI functionality and stronger feedback-driven learning loops to continually improve recommendations.
- **Monetization** - artist-promotion tools and premium features.

---

## Conclusion

TuneSpace demonstrates a complete, innovative, and technologically modern approach to building a music platform enriched with AI. It integrates a layered architecture - Next.js on the frontend, a .NET 9 API for backend logic, and PostgreSQL with `pgvector` for storage and vector processing - into a stable, scalable foundation.

By combining personalized AI recommendations, underground-artist discovery, and intelligent matching of musical tastes with vector search and advanced algorithms, and by layering real-time SignalR communication onto a responsive web interface, TuneSpace becomes a dynamic, interactive environment for both fans and artists. Built around clean code, modularity, and clean architecture - and integrating Spotify, Bandcamp, Last.fm, and more - it not only solves real needs of the music community but also shows how technology can enrich and transform the way we discover and experience music.

---
