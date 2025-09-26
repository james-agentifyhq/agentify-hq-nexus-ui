# Source Tree Structure

## Project Overview

```
agentify-hq-nexus/
├── src/                    # Frontend source code
├── convex/                 # Backend serverless functions
├── tests/                  # Test suites
├── docs/                   # Documentation
└── public/                 # Static assets
```

## Frontend Structure (`/src`)

### Application Routes (`/src/app`)
```
src/app/
├── auth/                   # Authentication page
├── join/[workspaceId]/    # Workspace invitation flow
├── workspace/[workspaceId]/ # Main workspace UI
│   ├── channel/[channelId]/     # Channel views
│   ├── member/[memberId]/       # Direct message views
│   └── _components/             # Workspace-scoped components
├── layout.tsx             # Root layout
├── page.tsx               # Landing/redirect page
└── globals.css            # Global styles
```

### Feature Modules (`/src/features`)
Feature-based architecture with API hooks and components:

```
src/features/
├── auth/
│   ├── api/               # Authentication hooks (use-current-user.ts)
│   └── components/        # Auth UI components
├── channels/
│   ├── api/               # Channel CRUD hooks
│   ├── components/        # Channel UI components
│   └── store/             # Channel state (create-channel-modal.ts)
├── conversations/
│   ├── api/               # DM conversation hooks
│   └── store/             # Conversation state
├── members/
│   ├── api/               # Member management hooks
│   └── components/        # Member UI components
├── messages/
│   ├── api/               # Message CRUD hooks (use-create-message.ts, etc.)
│   ├── components/        # Message UI (thread.tsx)
│   └── store/             # Parent message tracking
├── reactions/
│   ├── api/               # Reaction hooks
│   └── components/        # Reaction UI components
├── upload/
│   ├── api/               # File upload hooks
│   └── components/        # Upload UI components
└── workspaces/
    ├── api/               # Workspace CRUD hooks
    ├── components/        # Workspace UI components
    └── store/             # Workspace modals
```

### Shared Components (`/src/components`)
```
src/components/
├── ui/                    # shadcn/ui primitives (button, dialog, etc.)
├── editor.tsx             # Quill rich text editor
├── message.tsx            # Message display component
├── message-list.tsx       # Message list with virtualization
├── reactions.tsx          # Emoji reactions component
├── thread-bar.tsx         # Thread reply indicator
├── toolbar.tsx            # Message toolbar
└── modals.tsx             # Global modal manager
```

### Hooks (`/src/hooks`)
Custom React hooks for common functionality:
```
src/hooks/
├── use-workspace-id.ts    # Extract workspaceId from URL
├── use-channel-id.tsx     # Extract channelId from URL
├── use-member-id.ts       # Extract memberId from URL
├── use-confirm.tsx        # Confirmation dialog hook
└── use-panel.ts           # Side panel state (threads/profile)
```

### Utilities (`/src/lib`)
```
src/lib/
└── utils.ts               # Shared utility functions (cn, etc.)
```

## Backend Structure (`/convex`)

### Convex Functions
```
convex/
├── _generated/            # Auto-generated Convex types
│   ├── api.d.ts          # API exports
│   ├── dataModel.d.ts    # Database schema types
│   └── server.d.ts       # Server types
├── schema.ts              # Database schema definition
├── auth.ts                # Authentication logic
├── auth.config.ts         # Auth provider configuration
├── workspaces.ts          # Workspace queries/mutations
├── channels.ts            # Channel queries/mutations
├── members.ts             # Member queries/mutations
├── messages.ts            # Message queries/mutations
├── conversations.ts       # DM conversation queries/mutations
├── reactions.ts           # Reaction queries/mutations
├── users.ts               # User helper queries
├── upload.ts              # File upload handlers
└── http.ts                # HTTP endpoints
```

### Schema Tables
Defined in `convex/schema.ts`:
- **workspaces** - Workspace metadata and join codes
- **members** - User-workspace relationships with roles
- **channels** - Public/private channels
- **conversations** - Direct message threads
- **messages** - Text/image messages with threading
- **reactions** - Emoji reactions to messages
- **userProfiles** - User type tracking (human/ai-agent)
- **agents** - Future bot configuration (Phase 2)

## Testing Structure (`/tests`)

### Test Organization
```
tests/
├── e2e/                   # End-to-end tests (Playwright)
│   ├── fixtures/          # Test fixtures and setup
│   ├── authentication.spec.ts
│   ├── messaging.spec.ts
│   ├── direct-messages.spec.ts
│   └── workspace.spec.ts
├── unit/                  # Unit tests (Vitest)
│   └── convex/           # Convex function unit tests
├── setup.ts              # Test environment setup
└── README.md             # Testing documentation
```

### Test Reports
```
allure-results/           # Allure test results (raw)
allure-report/            # Allure HTML report
playwright-report/        # Playwright HTML report
test-results/             # Test artifacts (screenshots, videos)
```

## Documentation Structure (`/docs`)

```
docs/
├── architecture/
│   ├── coding-standards.md    # TypeScript best practices
│   ├── tech-stack.md          # Technology stack reference
│   └── source-tree.md         # This file
├── stories/
│   ├── story-1.1-future-proof-data-model.md
│   └── 1.2-mentions-notifications.md
├── qa/
│   └── gates/            # Quality gate results
├── prd.md                # Product requirements
├── testing-strategy.md   # TDD/BDD guidelines
├── testing-setup.md      # Test framework setup
├── TDD-SETUP.md          # TDD workflow setup
└── TDD-WORKFLOW-INTEGRATION.md
```

## Configuration Files (Root)

```
.
├── package.json              # Dependencies and scripts
├── tsconfig.json             # TypeScript configuration
├── next.config.mjs           # Next.js configuration
├── tailwind.config.ts        # Tailwind CSS config
├── postcss.config.mjs        # PostCSS config
├── components.json           # shadcn/ui config
├── playwright.config.ts      # Playwright E2E config
├── vitest.config.ts          # Vitest unit test config
├── CLAUDE.md                 # AI agent instructions
└── README.md                 # Project documentation
```

## Key Patterns

### File Naming Conventions
- **Components**: `PascalCase.tsx` (e.g., `MessageList.tsx`)
- **Hooks**: `use-kebab-case.ts` (e.g., `use-workspace-id.ts`)
- **API Hooks**: `use-{action}-{entity}.ts` (e.g., `use-create-message.ts`)
- **Convex Functions**: `{entity}.ts` (e.g., `messages.ts`)
- **Tests**: `{feature}.spec.ts` or `{feature}.test.ts`

### Import Path Aliases
- `@/` maps to `/src` directory
- Use absolute imports for shared code
- Example: `import { Button } from '@/components/ui/button'`

### API Hook Pattern
Location: `/src/features/{feature}/api/use-{action}-{entity}.ts`

Returns:
```typescript
{
  mutate/data,          // Mutation function or query data
  error,                // Error object
  isPending,            // Loading state
  isSuccess,            // Success state
  isError,              // Error state
  isSettled             // Completion state
}
```

### Convex Function Pattern
Location: `/convex/{entity}.ts`

Structure:
```typescript
import { v } from 'convex/values';
import { mutation, query } from './_generated/server';

export const create = mutation({
  args: { /* validators */ },
  handler: async (ctx, args) => { /* logic */ }
});

export const get = query({
  args: { /* validators */ },
  handler: async (ctx, args) => { /* logic */ }
});
```

## Development Workflow

### Local Development Files
```
.env.local                # Environment variables (git-ignored)
.next/                    # Next.js build output (git-ignored)
node_modules/             # Dependencies (git-ignored)
```

### Working with Features
1. Backend: Create/modify Convex functions in `/convex/{entity}.ts`
2. Frontend API: Create hooks in `/src/features/{feature}/api/`
3. Frontend UI: Create components in `/src/features/{feature}/components/`
4. Tests: Add tests in `/tests/unit/` or `/tests/e2e/`
5. Documentation: Update relevant docs in `/docs/`