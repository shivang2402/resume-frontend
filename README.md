# Resume Forge — Frontend

> Dashboard-based resume management with AI-powered job matching and cold outreach

![Next.js](https://img.shields.io/badge/Next.js-16-000000?logo=nextdotjs&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.0-06B6D4?logo=tailwindcss&logoColor=white)

---

## Overview

Resume Forge Frontend is a Next.js 16 dashboard application for managing modular resume content. Users create sections with different "flavors" for targeting various job types, then combine them dynamically to generate tailored resumes as PDFs.

The application features a content library with version history, an application tracker, AI-powered job description analysis, and integrated cold outreach tools for networking during the job search.

**Core philosophy:** Instead of maintaining 5 separate resume documents, maintain one content library with flavor variants. Let AI help match the right sections to each job.

---

## Features

### Content Library
- Create and manage resume sections (experiences, projects, skills, education)
- Support for multiple **flavors** per section (e.g., `amazon:systems` vs `amazon:fullstack`)
- Automatic version history with ability to view/restore previous versions
- Bulk JSON import for migrating existing content
- AI-generated tags for each section (when Gemini key provided)

### Application Tracker
- Log every job application with company, role, and resume configuration
- Track status progression: applied → phone screen → interview → offer/rejected
- Store job descriptions and notes per application
- Filter and search applications

### PDF Generation
- Select which sections/flavors to include via checkbox interface
- Preview resume before generating
- Download generated PDFs directly
- Optionally log application on generate

### JD Matcher
- Paste a job description for AI analysis
- Automatically suggests best-matching sections and flavors
- Respects section priority configs (always include, never include)
- Highlights missing keywords not covered by your content
- One-click to configure resume based on suggestions

### Cold Outreach
- Generate personalized networking messages with AI
- Multiple writing styles: professional, semi-formal, casual, friend
- Save templates for reuse
- Manage conversation threads with contacts
- AI-powered reply generation for ongoing conversations
- Parse pasted conversations into structured messages

---

## Architecture

### Next.js 16 App Router

The application uses the new App Router with file-based routing:

```
src/app/
├── page.tsx              # Landing/login page
├── layout.tsx            # Root layout with providers
├── globals.css           # Global styles
├── login/page.tsx        # Login page
├── api/auth/[...nextauth]# NextAuth API route
└── dashboard/
    ├── layout.tsx        # Dashboard sidebar layout
    ├── page.tsx          # Overview dashboard
    ├── content/          # Content library
    ├── applications/     # Application tracker
    ├── generate/         # PDF builder
    ├── jd-matcher/       # JD analysis tool
    ├── outreach/         # Cold outreach manager
    └── settings/         # User settings
```

### Component Organization

```
src/components/
├── ui/                   # shadcn/ui primitives
│   ├── button.tsx
│   ├── card.tsx
│   ├── dialog.tsx
│   └── ...
├── outreach/             # Outreach-specific components
│   ├── threads-list.tsx
│   ├── thread-timeline.tsx
│   ├── message-stepper.tsx
│   └── ...
├── create-section-dialog.tsx
├── log-application-dialog.tsx
├── bulk-import-dialog.tsx
└── providers.tsx         # React Query provider
```

### API Layer

All backend communication flows through `src/lib/api.ts`:

```typescript
// Centralized fetch wrapper with automatic header injection
async function fetchAPI<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const headers = {
    "Content-Type": "application/json",
    "X-User-Id": USER_ID,
    // X-Gemini-API-Key automatically added from localStorage
  };
  // ...
}
```

Exported API clients: `sectionsAPI`, `applicationsAPI`, `generateAPI`, `authAPI`

---

## Pages & Routes

| Route | Page | Description |
|-------|------|-------------|
| `/` | Landing | Landing page with login button |
| `/login` | Login | OAuth login flow |
| `/dashboard` | Overview | Stats cards, quick actions, recent activity |
| `/dashboard/content` | Content Library | Browse all sections by type, tabbed interface |
| `/dashboard/content/[type]/[key]/[flavor]` | Section Detail | View/edit section with version history |
| `/dashboard/applications` | Application Tracker | Table of all logged applications |
| `/dashboard/generate` | PDF Generator | Configure and build resume PDFs |
| `/dashboard/jd-matcher` | JD Matcher | Paste JD for AI analysis and section matching |
| `/dashboard/outreach` | Outreach Hub | Templates, threads, message generation |
| `/dashboard/settings` | Settings | API key configuration, preferences |

---

## Key Components

### Section Management

| Component | Purpose |
|-----------|---------|
| `CreateSectionDialog` | Modal form for creating new sections with type, key, flavor, and content fields |
| `BulkImportDialog` | Import multiple sections via JSON paste |
| Content cards | Grid display of sections grouped by type/key/flavor |
| Version history | Timeline view of all versions with restore capability |

### Application Tracking

| Component | Purpose |
|-----------|---------|
| `LogApplicationDialog` | Form for logging new applications |
| Applications table | Sortable/filterable table with status badges |
| Status badges | Color-coded: blue (applied), yellow (phone), purple (interview), green (offer), red (rejected) |

### Outreach Components

| Component | Purpose |
|-----------|---------|
| `MessageStepper` | Multi-step wizard for generating outreach messages |
| `StepBasicInfo` | Company and contact information input |
| `StepContext` | Template selection, style/length options |
| `StepPreview` | Preview and refine generated message |
| `ThreadsList` | List of conversation threads |
| `ThreadTimeline` | Message history in a thread |
| `ReplyGenerator` | Generate AI replies for threads |
| `AddConversationModal` | Parse and import conversation dumps |
| `TemplateCard` | Display and manage saved templates |
| `ApiKeyModal` | Gemini API key configuration |

### UI Primitives (shadcn/ui)

Built on Radix UI primitives with Tailwind CSS styling:

- `Button`, `Card`, `Badge` — Display components
- `Dialog`, `AlertDialog` — Modal interactions
- `Tabs`, `Table` — Navigation and data display
- `Form`, `Input`, `Textarea`, `Select` — Form components
- `Checkbox`, `RadioGroup` — Selection controls
- `DropdownMenu` — Context menus
- `Skeleton` — Loading states
- `Collapsible` — Expandable sections

---

## State Management & API Layer

### React Query

Server state is managed with TanStack React Query (`@tanstack/react-query`):

```typescript
// Example usage pattern
const { data: sections, isLoading } = useQuery({
  queryKey: ['sections'],
  queryFn: () => sectionsAPI.list()
});
```

### API Client Pattern

The `api.ts` module provides typed API clients:

```typescript
export const sectionsAPI = {
  list: () => fetchAPI<Section[]>("/api/sections"),
  listByType: (type: string) => fetchAPI<Section[]>(`/api/sections/${type}`),
  create: (data: SectionCreate) => fetchAPI<Section>("/api/sections", {
    method: "POST",
    body: JSON.stringify(data)
  }),
  // ...
};
```

### BYOK Gemini Integration

The Gemini API key is stored in `localStorage` and automatically injected into requests:

```typescript
// In fetchAPI wrapper
if (typeof window !== "undefined") {
  const geminiKey = localStorage.getItem("gemini_api_key");
  if (geminiKey) {
    headers["X-Gemini-API-Key"] = geminiKey;
  }
}
```

Users configure their key in Settings → AI Configuration.

---

## UI Framework

### shadcn/ui

The UI is built with [shadcn/ui](https://ui.shadcn.com/), which provides:
- Radix UI primitives for accessibility
- Tailwind CSS for styling
- Copy-paste component model (components live in your codebase)

### Tailwind CSS 4

Styling uses Tailwind CSS 4 with:
- CSS variables for theming (`--primary`, `--muted`, etc.)
- `tw-animate-css` for animations
- Responsive breakpoints for desktop-first design

### Icons

Lucide React icons throughout:
- `FileText`, `Briefcase`, `FolderOpen` — Section types
- `Download`, `Plus`, `ArrowRight` — Actions
- `Sparkles`, `MessageSquare` — AI features
- `User`, `Settings`, `LogOut` — Navigation

---

## Project Structure

```
resume-frontend/
├── src/
│   ├── app/
│   │   ├── page.tsx                    # Landing page
│   │   ├── layout.tsx                  # Root layout
│   │   ├── globals.css                 # Global styles + CSS variables
│   │   ├── login/page.tsx              # Login page
│   │   ├── api/auth/[...nextauth]/     # NextAuth handler
│   │   └── dashboard/
│   │       ├── layout.tsx              # Sidebar navigation
│   │       ├── page.tsx                # Overview dashboard
│   │       ├── content/
│   │       │   ├── page.tsx            # Content library
│   │       │   └── [type]/[key]/[flavor]/ # Section detail
│   │       ├── applications/page.tsx   # Application tracker
│   │       ├── generate/page.tsx       # PDF generator
│   │       ├── jd-matcher/
│   │       │   ├── page.tsx            # JD analysis UI
│   │       │   ├── components/         # JD-specific components
│   │       │   └── hooks/              # JD-related hooks
│   │       ├── outreach/page.tsx       # Outreach hub
│   │       └── settings/page.tsx       # Settings page
│   ├── components/
│   │   ├── ui/                         # shadcn/ui components
│   │   │   ├── alert-dialog.tsx
│   │   │   ├── badge.tsx
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── checkbox.tsx
│   │   │   ├── collapsible.tsx
│   │   │   ├── dialog.tsx
│   │   │   ├── dropdown-menu.tsx
│   │   │   ├── form.tsx
│   │   │   ├── input.tsx
│   │   │   ├── label.tsx
│   │   │   ├── radio-group.tsx
│   │   │   ├── select.tsx
│   │   │   ├── skeleton.tsx
│   │   │   ├── table.tsx
│   │   │   ├── tabs.tsx
│   │   │   └── textarea.tsx
│   │   ├── outreach/                   # Outreach feature components
│   │   │   ├── add-conversation-modal.tsx
│   │   │   ├── api-key-modal.tsx
│   │   │   ├── empty-state.tsx
│   │   │   ├── message-stepper.tsx
│   │   │   ├── outreach-tabs.tsx
│   │   │   ├── reply-generator.tsx
│   │   │   ├── save-template-modal.tsx
│   │   │   ├── step-basic-info.tsx
│   │   │   ├── step-context.tsx
│   │   │   ├── step-preview.tsx
│   │   │   ├── template-card.tsx
│   │   │   ├── template-edit-modal.tsx
│   │   │   ├── templates-list.tsx
│   │   │   ├── thread-create-modal.tsx
│   │   │   ├── thread-header.tsx
│   │   │   ├── thread-item.tsx
│   │   │   ├── thread-timeline.tsx
│   │   │   └── threads-list.tsx
│   │   ├── create-section-dialog.tsx
│   │   ├── log-application-dialog.tsx
│   │   ├── bulk-import-dialog.tsx
│   │   └── providers.tsx               # QueryClientProvider
│   ├── lib/
│   │   ├── api.ts                      # API client + types
│   │   ├── utils.ts                    # cn() and utilities
│   │   └── api/
│   │       ├── jd-matcher.ts           # JD matcher API calls
│   │       └── outreach.ts             # Outreach API calls
│   └── types/
│       ├── jd-matcher.ts               # JD matcher types
│       └── outreach.ts                 # Outreach types
├── public/                             # Static assets
├── package.json                        # Dependencies
├── next.config.ts                      # Next.js config
├── tsconfig.json                       # TypeScript config
├── tailwind.config.ts                  # Tailwind config
├── postcss.config.mjs                  # PostCSS config
├── components.json                     # shadcn/ui config
└── .env.example                        # Environment template
```

---

## Setup & Installation

### Prerequisites

- Node.js 18+
- npm, yarn, or pnpm

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/YOUR_USERNAME/resume-frontend.git
   cd resume-frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Configure environment variables:**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your values
   ```

4. **Start the development server:**
   ```bash
   npm run dev
   ```

5. **Open in browser:** http://localhost:3000

### Connecting to Backend

Ensure the backend is running on `http://localhost:8000`. The frontend communicates via the `NEXT_PUBLIC_API_URL` environment variable.

---

## Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `NEXT_PUBLIC_API_URL` | Backend API base URL | `http://localhost:8000` |
| `NEXTAUTH_URL` | NextAuth callback URL | `http://localhost:3000` |
| `NEXTAUTH_SECRET` | NextAuth encryption secret | `your-nextauth-secret-min-32-chars` |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID | `123456789.apps.googleusercontent.com` |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret | `GOCSPX-xxxxxxxxxxxxx` |
| `GITHUB_CLIENT_ID` | GitHub OAuth client ID (optional) | `Ov23lixxxxxxxx` |
| `GITHUB_CLIENT_SECRET` | GitHub OAuth client secret (optional) | `xxxxxxxxxxxxxxxx` |
| `LINKEDIN_CLIENT_ID` | LinkedIn OAuth client ID (optional) | `xxxxxxxxxxxxxxxx` |
| `LINKEDIN_CLIENT_SECRET` | LinkedIn OAuth client secret (optional) | `xxxxxxxxxxxxxxxx` |

---

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server with hot reload |
| `npm run build` | Build production bundle |
| `npm run start` | Run production server |
| `npm run lint` | Run ESLint |

---

## License

MIT
