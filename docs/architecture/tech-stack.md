# Tech Stack

## Core Technologies

### Frontend
- **Framework**: Next.js 14.2.7 (App Router)
- **UI Library**: React 18
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui (Radix UI primitives)
- **State Management**: Jotai for global state
- **Rich Text Editor**: Quill for message composition

### Backend
- **Platform**: Convex (serverless backend-as-a-service)
- **Authentication**: @convex-dev/auth
  - Supports: Google OAuth, GitHub OAuth, email/password
- **Real-time**: Convex automatic subscriptions
- **File Storage**: Convex Storage API

### Testing
- **Unit/Integration**: Vitest
- **E2E Testing**: Playwright
- **Test Reports**: Allure Reports
- **Coverage**: c8 (via Vitest)

### Development Tools
- **Package Manager**: npm or bun (use `--legacy-peer-deps`)
- **Linting**: ESLint
- **Type Checking**: TypeScript strict mode
- **Version Control**: Git

## Architecture Patterns

### Frontend Patterns
- **Routing**: Next.js App Router (file-based)
- **Data Fetching**: Convex `useQuery` and `useMutation` hooks
- **Component Library**: Feature-based modules in `/src/features`
- **Path Aliases**: `@/*` maps to `/src`

### Backend Patterns
- **Database**: Convex document database with typed schema
- **Functions**: `query()`, `mutation()`, `action()` from Convex
- **Validators**: `v` from `convex/values` for type safety
- **Indexes**: Defined in schema for optimized queries

### API Conventions
- **Frontend Hooks**: Located in `/src/features/{feature}/api/`
- **Pattern**: `use-{action}-{entity}.ts` (e.g., `use-create-message.ts`)
- **Return**: `{ mutate/data, error, isPending, isSuccess, isError, isSettled }`
- **Backend Functions**: Located in `/convex/{entity}.ts`

## Key Dependencies

### Production
```json
{
  "next": "14.2.7",
  "react": "^18",
  "convex": "^1.x",
  "@convex-dev/auth": "latest",
  "quill": "^2.x",
  "jotai": "^2.x",
  "@radix-ui/*": "latest",
  "tailwindcss": "^3.x"
}
```

### Development
```json
{
  "typescript": "^5",
  "vitest": "^2.x",
  "@playwright/test": "^1.x",
  "allure-playwright": "^3.x",
  "eslint": "^8",
  "@types/react": "^18"
}
```

## Environment Setup

### Required Environment Variables
```bash
# .env.local
NEXT_TELEMETRY_DISABLED=1
CONVEX_DEPLOYMENT=dev:<deployment-name>
NEXT_PUBLIC_CONVEX_URL=https://<deployment-name>.convex.cloud
```

### OAuth Configuration (via Convex CLI)
```bash
npx convex env set AUTH_GOOGLE_CLIENT_ID <value>
npx convex env set AUTH_GOOGLE_CLIENT_SECRET <value>
npx convex env set AUTH_GITHUB_ID <value>
npx convex env set AUTH_GITHUB_SECRET <value>
```

## Development Workflow

### Local Development
```bash
# Terminal 1: Start Convex dev server
npx convex dev

# Terminal 2: Start Next.js dev server
npm run dev
```

### Testing Workflow
```bash
npm run test:watch     # TDD mode (auto-run)
npm run test           # Single run
npm run test:e2e       # E2E tests
npm run test:coverage  # Coverage report
```

### Build & Deploy
```bash
npm run build          # Production build
npm run lint           # Lint check
npx convex deploy      # Deploy Convex backend
```

## Real-time Architecture

### Convex Real-time Features
- **Automatic Subscriptions**: `useQuery` provides live updates
- **Optimistic Updates**: Mutations trigger immediate re-queries
- **No Manual WebSockets**: Convex handles connection management
- **Sub-500ms Latency**: Real-time message delivery target

### Data Flow
```
User Action → Frontend Hook (useMutation) →
Convex Mutation → Database Update →
Real-time Query Re-run → UI Update
```