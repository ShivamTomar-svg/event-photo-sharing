# Momento — Event Photo Sharing Frontend

Momento is a responsive web application for collaborative event photo sharing, built to pair with a Spring Boot backend, MySQL database, and secure photo storage.

---

## 1. Tech Stack

- **Framework**: React 19 + Vite 8 + TypeScript
- **Styling**: Tailwind CSS v3 with custom brand tokens:
  - Primary Pink: `#E83E8C`
  - Light Pink: `#FFF0F6`
  - Orange Accent: `#FF8A3D`
  - Background: `#FAFAFB`
  - Card/Surfaces: `#FFFFFF`
- **Typography**: Inter (Body) + Outfit (Headings) via Google Fonts
- **Icons**: Lucide React
- **Routing**: React Router v7
- **Architecture**: Modular layout, custom hooks, typed service layer, central API client

---

## 2. Project Structure

```text
frontend/
├── .env                  # Local environment file (VITE_API_BASE_URL)
├── .env.example          # Environment placeholder template
├── package.json          # Node dependencies and scripts
├── postcss.config.js     # PostCSS Tailwind plugins
├── tailwind.config.js    # Custom brand color palette & animations
├── tsconfig.json         # TypeScript configuration
├── vite.config.ts        # Vite dev server + proxy configuration
├── index.html            # Main HTML with SEO meta tags & fonts
└── src/
    ├── App.tsx           # Global app providers (Router, Auth, Toast)
    ├── main.tsx          # Application entry point
    ├── index.css         # Tailwind base styles and custom utilities
    ├── components/
    │   ├── common/
    │   │   ├── AuthenticatedImage.tsx # Secure blob loader with skeleton
    │   │   ├── Badge.tsx              # Status and role badges
    │   │   ├── Button.tsx             # Brand button variants & spinners
    │   │   ├── ConfirmationModal.tsx  # Destructive action modals
    │   │   ├── EmptyState.tsx         # Illustrated blank list states
    │   │   ├── Input.tsx              # Input with show/hide password
    │   │   ├── Modal.tsx              # Accessible dialog with backdrop blur
    │   │   └── Skeleton.tsx           # Animated loading placeholders
    │   ├── events/
    │   │   ├── CreateEventModal.tsx   # Modal for creating new events
    │   │   ├── EventCard.tsx          # Rich card with dynamic cover gradients
    │   │   └── InviteGuestModal.tsx   # Guest email invitations list & form
    │   ├── layout/
    │   │   ├── AppLayout.tsx          # Shell with Navbar, Outlet, Footer
    │   │   ├── Footer.tsx             # Platform footer with tech stack info
    │   │   ├── Navbar.tsx             # Responsive nav with dropdowns & badges
    │   │   └── ProtectedRoute.tsx     # Route protection & redirect
    │   └── photos/
    │       ├── PhotoCard.tsx          # Photo card with hover overlay & actions
    │       ├── PhotoGrid.tsx          # Responsive photo masonry/grid
    │       ├── PhotoLightbox.tsx      # Fullscreen viewer (keyboard/zoom/download)
    │       └── PhotoUploadModal.tsx   # Multi-file queue uploader (drag & drop)
    ├── context/
    │   ├── AuthContext.tsx            # User session, JWT persistence, login/logout
    │   └── ToastContext.tsx           # Floating toast notification system
    ├── hooks/
    │   └── usePhotoUrl.ts             # Authenticated photo blob fetcher & cache
    ├── lib/
    │   ├── api.ts                     # Central API client (Fetch + Bearer token)
    │   └── utils.ts                   # Date, file size formatters & gradient generators
    ├── pages/
    │   ├── DashboardPage.tsx          # Live event stats, recent events, RSVP banner
    │   ├── EventDetailPage.tsx        # Event header, actions, gallery, lightbox
    │   ├── EventsPage.tsx             # Search, sort, filter, and event directory
    │   ├── InvitationsPage.tsx        # RSVP management (Accept / Decline)
    │   ├── LandingPage.tsx            # Hero, feature highlights, mockups, footer
    │   ├── LoginPage.tsx              # Authenticated login with validation
    │   ├── NotFoundPage.tsx           # Friendly 404 page
    │   ├── ProfilePage.tsx            # Account overview & sign-out modal
    │   └── RegisterPage.tsx           # New account registration & auto-login
    ├── routes/
    │   └── AppRoutes.tsx              # Public and protected route tree
    ├── services/
    │   ├── authService.ts             # Auth & Health API calls
    │   ├── eventService.ts            # Events CRUD
    │   ├── invitationService.ts       # Invitations & RSVPs
    │   └── photoService.ts            # Photos upload, view blob, download, delete
    └── types/
        ├── auth.ts                    # User, Login, Register interfaces
        ├── event.ts                   # Event, CreateEvent, SortOption interfaces
        ├── invitation.ts              # Invitation interfaces
        └── photo.ts                   # PhotoItem, UploadProgress interfaces
```

---

## 3. Getting Started

### Prerequisites

- Node.js 18+ (tested on Node v24)
- npm 9+ (tested on npm 11)
- Running Spring Boot backend on `http://localhost:8085`

### Installation

```bash
cd frontend
npm install
```

### Running the Development Server

```bash
npm run dev
```

The frontend will start at **`http://localhost:5173/`**.

During development, Vite automatically proxies all `/api` requests to `http://localhost:8085` so CORS is bypassed seamlessly. In addition, the Spring Boot backend includes native CORS headers for direct communication.

### Production Build

```bash
npm run build
```

This compiles TypeScript, bundles assets, and outputs production files into `frontend/dist/`.

---

## 4. API Endpoints Used

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/api/health` | Backend status verification | No |
| `POST` | `/api/auth/register` | Register new user account | No |
| `POST` | `/api/auth/login` | Authenticate and obtain JWT token | No |
| `GET` | `/api/events` | List accessible events | Yes |
| `POST` | `/api/events` | Create new event | Yes |
| `GET` | `/api/events/{id}` | Get specific event details | Yes |
| `GET` | `/api/events/{id}/photos` | List all photos for event | Yes |
| `POST` | `/api/events/{id}/photos` | Upload photo (multipart `file`) | Yes |
| `GET` | `/api/events/{id}/photos/{photoId}/view` | Stream raw image bytes for preview | Yes |
| `GET` | `/api/events/{id}/photos/{photoId}/download` | Download attachment file | Yes |
| `DELETE` | `/api/events/{id}/photos/{photoId}` | Delete photo (host or uploader) | Yes |
| `GET` | `/api/events/{id}/invitations` | Get invitations for specific event | Yes |
| `POST` | `/api/events/{id}/invitations` | Invite a registered guest by email | Yes |
| `GET` | `/api/my-invitations` | Get invitations received by logged-in user | Yes |
| `PUT` | `/api/my-invitations/{id}/respond` | Respond to invitation (`ACCEPTED` / `REJECTED`) | Yes |

---

## 5. Backend Configuration Changes

In `SecurityConfig.java`:
- Added a `CorsConfigurationSource` bean allowing `http://localhost:*` and `http://127.0.0.1:*` origins with methods `GET, POST, PUT, DELETE, OPTIONS, PATCH`.
- Enabled `http.cors(cors -> cors.configurationSource(corsConfigurationSource()))`.
- Permitted HTTP `OPTIONS` requests (`requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()`) so browser preflight checks pass without 403 errors.

---

## 6. Security & Session Storage Trade-offs

- **JWT Storage**: Tokens are stored in browser `localStorage` and sent in the `Authorization: Bearer <token>` header on every API request.
- **Trade-off**: `localStorage` provides persistent sessions across page reloads without requiring server-side session cookies or cross-site cookie configuration. If XSS protection is needed in high-security environments, HttpOnly cookies can be adopted if the backend sets cookies directly.
- **Image Authentication**: Because the `/view` endpoint requires the JWT Bearer header, images are fetched as blobs via the authenticated API client and converted to local Object URLs with memory caching (`usePhotoUrl`).
