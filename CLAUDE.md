# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Package Management
- **Install dependencies**: `npm install --legacy-peer-deps` or `bun install --legacy-peer-deps`
- **Note**: Always use `--legacy-peer-deps` flag due to peer dependency conflicts

### Development Server
- **Start dev server**: `npm run dev` or `bun dev`
- **Build production**: `npm run build` or `bun build`
- **Lint code**: `npm run lint` or `bun lint`

### Convex Backend
- **Start Convex dev**: `npx convex dev` or `bunx convex dev`
- **Deploy Convex**: `npx convex deploy` or `bunx convex deploy`
- **Set environment variables**: `npx convex env set KEY value` or `bunx convex env set KEY value`
- **Initialize auth**: `npx @convex-dev/auth` or `bunx @convex-dev/auth`

## Architecture Overview

### Tech Stack
- **Frontend**: Next.js 14.2.7 (App Router), React 18, TypeScript
- **Backend**: Convex (serverless backend-as-a-service)
- **Authentication**: @convex-dev/auth (supports Google OAuth, GitHub OAuth, credentials)
- **Styling**: Tailwind CSS with shadcn/ui components (Radix UI primitives)
- **State Management**: Jotai for global state
- **Rich Text**: Quill editor for message composition

### Project Structure

#### `/src` Directory
- **`/app`**: Next.js App Router pages and layouts
  - `/auth`: Authentication page
  - `/join/[workspaceId]`: Workspace invitation flow
  - `/workspace/[workspaceId]`: Main workspace UI
    - `/channel/[channelId]`: Channel-specific views
    - `/member/[memberId]`: Direct message views
    - `/_components`: Workspace-scoped UI components (sidebar, toolbar, etc.)

- **`/features`**: Feature-based modules with API hooks and components
  - Each feature has `/api` directory containing Convex mutation/query hooks
  - Pattern: `use-{action}-{entity}.ts` (e.g., `use-create-message.ts`)
  - Features: `auth`, `channels`, `conversations`, `members`, `messages`, `reactions`, `upload`, `workspaces`

- **`/components`**: Shared UI components
  - `/ui`: shadcn/ui primitive components (button, dialog, etc.)
  - Domain components: `message.tsx`, `editor.tsx`, `reactions.tsx`, etc.

- **`/hooks`**: Custom React hooks
  - URL-based hooks: `use-workspace-id.ts`, `use-channel-id.tsx`, `use-member-id.ts`
  - UI hooks: `use-confirm.tsx`, `use-panel.ts`

- **`/lib`**: Utility functions and configurations

- **`middleware.ts`**: Convex auth middleware for route protection

#### `/convex` Directory
Convex backend functions and schema:
- **`schema.ts`**: Database schema definitions (workspaces, members, channels, messages, conversations, reactions)
- **`auth.ts` & `auth.config.ts`**: Authentication configuration
- **Entity modules**: `workspaces.ts`, `channels.ts`, `messages.ts`, `members.ts`, etc.
  - Convex queries, mutations, and business logic
  - Pattern: Export typed functions with validators using `v` from `convex/values`

### Data Model
- **Workspaces**: Top-level organization units with join codes
- **Members**: User-workspace relationships with roles (admin/member)
- **Channels**: Public/private message channels within workspaces
- **Conversations**: Direct message threads between two members
- **Messages**: Support text, images, replies (threading), and reactions
- **Reactions**: Emoji reactions linked to messages
- **User Profiles** (Phase 2 prep): User type tracking (`human` or `ai-agent`) - defaults to 'human' for backward compatibility
- **Agents** (Phase 2 prep): Future bot configuration table - currently unused, structure validated for Phase 2

### Authentication Flow
1. Middleware checks authentication status (`/src/middleware.ts`)
2. Unauthenticated users redirected to `/auth`
3. Supports Google OAuth, GitHub OAuth, and email/password credentials
4. Auth state managed by `@convex-dev/auth` with Convex backend

### API Pattern
- **Frontend hooks** (`/src/features/*/api/use-*.ts`):
  - Wrap Convex `useMutation`/`useQuery` with consistent state management
  - Return: `{ mutate/data, error, isPending, isSuccess, isError, isSettled }`
  - Support callbacks: `onSuccess`, `onError`, `onSettled`, `throwError` option

- **Backend functions** (`/convex/*.ts`):
  - Use `query()`, `mutation()`, or `action()` from Convex
  - Define `args` with validators from `convex/values`
  - Access context: `ctx.db` (database), `ctx.auth` (authentication)

### Key Patterns
- **Path aliases**: Use `@/*` for imports from `/src` (configured in `tsconfig.json`)
- **Type safety**: Leverage Convex auto-generated types from `/convex/_generated`
- **Component composition**: Radix UI primitives wrapped with Tailwind variants
- **Real-time updates**: Convex provides automatic real-time subscriptions
- **File uploads**: Use Convex storage (`_storage`) for images and attachments

### Environment Variables
Required in `.env.local`:
- `NEXT_TELEMETRY_DISABLED=1`
- `CONVEX_DEPLOYMENT=dev:<deployment-name>`
- `NEXT_PUBLIC_CONVEX_URL=https://<deployment-name>.convex.cloud`

OAuth credentials set via Convex CLI:
- `AUTH_GOOGLE_CLIENT_ID`, `AUTH_GOOGLE_CLIENT_SECRET`
- `AUTH_GITHUB_ID`, `AUTH_GITHUB_SECRET`

### Development Workflow
1. Run Convex dev server: `npx convex dev` or `bunx convex dev`
2. Run Next.js dev server: `npm run dev` or `bun dev`
3. Both servers must be running for full functionality
4. Schema changes in `/convex/schema.ts` require Convex deployment
5. Frontend changes hot-reload automatically

### Testing Database Queries
- Use Convex dashboard (https://dashboard.convex.dev) to:
  - View real-time data
  - Run queries directly
  - Monitor function logs
  - Manage environment variables

## Testing Strategy

### TDD/BDD Approach

This project follows **Test-Driven Development (TDD)** with **Behavior-Driven Development (BDD)** principles:

1. **Write tests FIRST** (before implementation)
2. **Map Acceptance Criteria** to tests using Given-When-Then
3. **Red-Green-Refactor** cycle for all features

### Test Commands

**Unit/Integration Tests (Vitest)**:
```bash
npm run test:watch     # Auto-run on file changes (recommended during dev)
npm run test:ui        # Interactive browser UI
npm run test           # Single run (CI/pre-commit)
npm run test:coverage  # Coverage report
```

**E2E Tests (Playwright)**:
```bash
npm run test:e2e       # Run E2E tests
npm run test:e2e:ui    # Interactive mode
```

### Test Structure

- **Unit Tests**: `tests/unit/` - Fast, isolated function tests
- **Integration Tests**: `tests/integration/` - API/component integration
- **E2E Tests**: `tests/e2e/` - User journeys with Playwright

### Workflow

1. PO writes story with Given-When-Then acceptance criteria
2. Dev translates ACs to Vitest tests (RED phase)
3. Dev implements minimum code to pass (GREEN phase)
4. Dev refactors while tests ensure nothing breaks (REFACTOR phase)
5. QA validates test coverage and AC traceability

**See `docs/testing-strategy.md` for complete testing guidelines.**

## Phase 2 Preparation (Future-Proofing)

### User Type System
**Migration Note**: All existing users automatically default to `userType: 'human'` without database migration.

**Helper Functions** (`convex/users.ts`):
```typescript
// Get user type (defaults to 'human' for backward compatibility)
getUserType({ userId: Id<"users"> }): 'human' | 'ai-agent'

// Check if user is human
isHumanUser({ userId: Id<"users"> }): boolean
```

**Usage Example**:
```typescript
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';

const userType = useQuery(api.users.getUserType, { userId });
const isHuman = useQuery(api.users.isHumanUser, { userId });
```

### Schema Extensions (Story 1.1)
- **userProfiles table**: Tracks user types with `by_user_id` index
- **agents table**: Future bot configuration (unused in Phase 1)
- **Backward compatible**: No breaking changes to existing functionality
- **Performance**: New indexes only queried by new helper functions