# Phase 1: Production-Ready Human Collaboration Platform - PRD

## Intro Project Analysis and Context

### Existing Project Overview

**Analysis Source:** IDE-based fresh analysis of codebase + UI screenshot review (September 2025)

#### Current Project State

The existing project is a **full-featured Slack clone** built with Next.js 14 and Convex serverless backend. The application provides real-time workspace collaboration with the following core capabilities:

- **Multi-workspace architecture**: Users can create and join multiple workspaces using secure join codes
- **Communication channels**: Public channels and private direct messages with threading support
- **Rich messaging**: Text formatting (bold, italic, strikethrough), emoji reactions, image uploads, message editing/deletion
- **User management**: OAuth authentication (Google, GitHub) and email/password, with workspace roles (admin/member)
- **Real-time synchronization**: Convex backend provides automatic live updates across all connected clients
- **Modern UI**: Slack-like interface with sidebar navigation, workspace switcher, threads/drafts section, and activity tracking

The codebase follows a feature-based architecture with clear separation between frontend (Next.js App Router) and backend (Convex functions), using TypeScript throughout for type safety.

### Available Documentation Analysis

**Using existing project analysis from codebase inspection.**

**Available Documentation:**
- ✅ Tech Stack Documentation (CLAUDE.md - comprehensive architecture overview)
- ✅ Source Tree/Architecture (well-organized feature modules in `/src/features`)
- ✅ API Documentation (Convex backend functions with validators)
- ✅ External API Documentation (Convex auth, storage patterns documented)
- ⚠️ Coding Standards (implicit through consistent patterns, not formalized)
- ❌ UX/UI Guidelines (not documented)
- ❌ Technical Debt Documentation (not documented)

**Recommendation**: The existing CLAUDE.md provides strong technical foundation. For Phase 1, we should formalize coding standards, document UX/UI guidelines, and track technical debt.

### Enhancement Scope Definition

**Enhancement Type:**
- ✅ **Bug Fix and Stability Improvements** (production-readiness)
- ✅ **New Feature Addition** (missing H2H collaboration features)
- ✅ **Performance/Scalability Improvements** (optimize existing features)
- ✅ **UI/UX Enhancement** (polish and consistency)
- 🔮 **Future-Proofing** (prepare for Phase 2 bot integration)

**Enhancement Description:**

Transform the current Slack clone prototype into a **production-ready human-to-human collaboration platform**. This phase focuses on solidifying existing features, fixing bugs, adding missing collaboration capabilities, and establishing a robust foundation for future AI agent integration (Phase 2).

**Impact Assessment:**
- ✅ **Moderate Impact** (refinements and additions to existing code)
- 🔮 **Future-Ready** (data model and API design prepare for bot users)

### Goals and Background Context

#### Goals

**Phase 1 (Current Focus):**
- Achieve production-ready stability and performance for H2H collaboration
- Complete missing Slack-like features (mentions, notifications, search, file sharing)
- Establish solid UX/UI guidelines and accessibility standards
- Prepare data model and APIs for future bot/agent integration
- Document technical debt and create improvement roadmap

**Future Phases (Reference Only):**
- Phase 2: Remote bot integration (Google Cloud Agent Engine + google-adk)
- Phase 3: MCP registry and A2A protocol integration
- Phase 4: Dev/Work mode toggle and local sandbox support

#### Background Context

The current Slack clone provides core collaboration features but lacks the polish, performance, and completeness required for production deployment. Phase 1 addresses these gaps while strategically preparing the platform for AI agent integration.

**Key Strategic Decision**: Future AI agents will be treated as **users with special type** (`userType: 'ai-agent'`) rather than a separate system. This means our user management, permissions, and interaction patterns must be extensible from the start.

**Agile Approach**: Each phase will have its own PRD. This document focuses exclusively on achieving production-ready H2H collaboration.

### Change Log

| Change | Date | Version | Description | Author |
|--------|------|---------|-------------|---------|
| Initial PRD Creation | 2025-09-23 | 0.1 | Phase 1 PRD: Production-ready H2H collaboration platform | John (PM) |

---

## Requirements

### Functional Requirements

#### Core Collaboration Features

**FR1**: Users can mention other workspace members using @username syntax in messages, triggering notifications
**FR2**: Users receive real-time notifications for mentions, DMs, and replies to their messages
**FR3**: Users can search messages, channels, and members across the entire workspace
**FR4**: Users can upload and share multiple file types (documents, images, videos) with preview support
**FR5**: Users can create and manage channel descriptions and topics
**FR6**: Users can pin important messages to channels for quick reference
**FR7**: Users can star/bookmark messages and channels for easy access
**FR8**: Users can set custom status messages and availability indicators
**FR9**: Admin users can manage workspace settings, member permissions, and channel visibility
**FR10**: Users can format messages with code blocks, quotes, and markdown support

#### User Experience Enhancements

**FR11**: Users can view presence indicators (online/offline/away) for all workspace members
**FR12**: Users receive typing indicators when others are composing messages
**FR13**: Users can customize notification preferences per channel and globally
**FR14**: Users can archive and unarchive channels to manage workspace clutter
**FR15**: Users can view message history with infinite scroll and lazy loading

#### Future-Proofing (Phase 2 Preparation)

**FR16**: System supports user types (human, ai-agent) with extensible metadata fields
**FR17**: API layer uses consistent patterns that work for both human and bot interactions
**FR18**: Message routing supports both synchronous (human) and asynchronous (bot) response patterns

### Non-Functional Requirements

**MVP Phase Focus: Development Speed + Reasonable Reliability**

**NFR1**: Platform must maintain real-time message delivery within 500ms under normal load
**NFR2**: _(Future Phase)_ System should support at least 100 concurrent users per workspace without performance degradation
**NFR3**: _(Future Phase)_ Search functionality should return results within 2 seconds for workspaces with 100,000+ messages
**NFR4**: File uploads must support files up to 100MB with progress indicators
**NFR5**: Application must achieve basic accessibility standards (keyboard navigation, screen reader support)
**NFR6**: Mobile responsive design must support viewports from 320px to desktop displays
**NFR7**: _(Future Phase)_ System should maintain 99.9% uptime for production deployments
**NFR8**: All user data must be encrypted at rest and in transit (Convex provides this by default)
**NFR9**: _(Future Phase)_ Authentication should support SSO and multi-factor authentication
**NFR10**: Platform must handle graceful degradation when Convex backend experiences issues

**MVP Priorities:**
- Real-time messaging performance (NFR1) - Critical for user experience
- Basic security (NFR8) - Non-negotiable, already handled by Convex
- Responsive design (NFR6) - Essential for early testing across devices
- File upload support (NFR4) - Core collaboration feature
- Graceful degradation (NFR10) - Prevents catastrophic failures
- Basic accessibility (NFR5) - Foundation for future WCAG compliance

**Deferred to Future Phases:**
- Enterprise-scale concurrency (NFR2)
- Advanced search performance (NFR3)
- 99.9% uptime SLA (NFR7)
- SSO/MFA authentication (NFR9)

### Compatibility Requirements

**CR1: Existing Data Integrity** - All existing workspaces, channels, messages, and user data must remain fully functional without migration
**CR2: API Backwards Compatibility** - Current Convex mutations and queries must maintain their interfaces for existing features
**CR3: UI/UX Consistency** - New features must match existing Slack-like design patterns and component library (shadcn/ui)
**CR4: Authentication Flow** - Existing OAuth providers (Google, GitHub) and email/password auth must continue working without changes
**CR5: Future Schema Extensibility** - Database schema changes must support adding `userType` field and `agents` table without breaking existing functionality

---

## Technical Constraints and Integration Requirements

### Existing Technology Stack

**Languages**: TypeScript
**Frameworks**: Next.js 14.2.7 (App Router), React 18, Tailwind CSS
**Database**: Convex (serverless backend with real-time subscriptions)
**Authentication**: @convex-dev/auth (Google OAuth, GitHub OAuth, email/password)
**UI Components**: shadcn/ui (Radix UI primitives)
**State Management**: Jotai
**Rich Text**: Quill editor
**Infrastructure**: Vercel (frontend), Convex Cloud (backend)
**External Dependencies**: Convex Storage for file uploads

### Integration Approach

**Database Integration Strategy:**
- Extend Convex schema with new tables for notifications, bookmarks, pins, file metadata
- Add `userType` field to users table (default: 'human', future: 'ai-agent')
- Create `agents` table for future Phase 2 (initially empty, no migrations needed)
- Use Convex indexes for search optimization and query performance

**API Integration Strategy:**
- Expand existing Convex mutations/queries following current patterns
- Maintain feature-based API organization (`/src/features/*/api/use-*.ts`)
- Implement webhook infrastructure for future bot event handling
- Design message API to support both synchronous (human) and async (bot) patterns

**Frontend Integration Strategy:**
- Build new features using existing shadcn/ui components
- Follow App Router patterns with server/client component separation
- Extend existing Jotai atoms for global state (notifications, search, presence)
- Maintain consistent URL structure and routing conventions

**Testing Integration Strategy:**
- Add unit tests for new Convex functions (Jest)
- Implement E2E tests for critical user flows (Playwright recommended)
- Use Convex's built-in testing utilities for backend validation
- Establish CI/CD pipeline with automated testing gates

### Code Organization and Standards

**File Structure Approach:**
- Continue feature-based module organization (`/src/features/{feature}/`)
- New features: `notifications/`, `search/`, `files/`, `bookmarks/`
- Shared components in `/src/components/` with clear naming conventions
- Convex backend functions in `/convex/{entity}.ts` matching frontend features

**Naming Conventions:**
- React components: PascalCase (`NotificationBadge.tsx`)
- Hooks: `use-{action}-{entity}.ts` (`use-create-notification.ts`)
- Convex functions: `{entity}.{action}` (`notifications.create`, `search.query`)
- Types: PascalCase with descriptive names (`NotificationPreferences`)

**Coding Standards:**
- TypeScript strict mode enabled
- ESLint + Prettier for code formatting
- Follow existing Convex validator patterns (`v` from `convex/values`)
- Component prop types defined with TypeScript interfaces
- Error handling with try-catch and user-friendly error messages

**Documentation Standards:**
- JSDoc comments for all exported functions and components
- README files for each new feature module
- Update CLAUDE.md with new architecture patterns
- Maintain changelog for all schema and API changes

### Deployment and Operations

**Build Process Integration:**
- Next.js build with static optimization where possible
- Convex deployment via `npx convex deploy`
- Environment variables managed through Vercel and Convex dashboard
- Build validation gates: TypeScript compilation, ESLint, unit tests

**Deployment Strategy:**
- Vercel for frontend with automatic preview deployments
- Convex Cloud for backend with separate dev/staging/prod environments
- Feature flags for gradual rollout of new capabilities
- Blue-green deployment pattern for zero-downtime updates

**Monitoring and Logging:**
- Convex built-in logging for backend function execution
- Frontend error tracking with Sentry or similar
- Performance monitoring with Web Vitals and Lighthouse CI
- User analytics for feature adoption and usage patterns

**Configuration Management:**
- Environment-specific configs in `.env.local` (dev) and Vercel dashboard (prod)
- Feature flags stored in Convex database for runtime toggling
- OAuth credentials managed via Convex CLI (`convex env set`)
- Secrets rotation policy and access control documentation

### Risk Assessment and Mitigation

**Technical Risks:**
- **Risk**: Convex query performance degradation with 100k+ messages
  **Mitigation**: Implement pagination, indexes, and search result caching
- **Risk**: File storage costs scaling with user adoption
  **Mitigation**: Set storage limits, implement file retention policies, consider CDN
- **Risk**: Real-time subscription overhead with many concurrent users
  **Mitigation**: Optimize subscription queries, implement connection pooling

**Integration Risks:**
- **Risk**: Breaking existing features when adding new database fields
  **Mitigation**: Thorough testing, gradual schema migrations, feature flags
- **Risk**: Authentication flow conflicts with new SSO requirements
  **Mitigation**: Extend @convex-dev/auth incrementally, maintain existing providers
- **Risk**: UI consistency breaking with new component additions
  **Mitigation**: Strict adherence to shadcn/ui patterns, component library audits

**Deployment Risks:**
- **Risk**: Downtime during Convex schema updates
  **Mitigation**: Use Convex's zero-downtime migration features, staging validation
- **Risk**: Environment config mismatches between dev/prod
  **Mitigation**: Infrastructure as code, automated config validation
- **Risk**: Rollback complexity for multi-component features
  **Mitigation**: Feature flags, database schema versioning, deployment runbooks

**Mitigation Strategies:**
- Comprehensive test coverage before production deployment
- Staged rollout with monitoring and quick rollback procedures
- Regular performance benchmarking and load testing
- Documentation of known issues and workarounds for support team

---

## Epic and Story Structure

### Epic Approach

**Epic Structure Decision**: Single comprehensive epic for Phase 1 with logically sequenced stories

**Rationale**:
- Phase 1 focuses on **production-ready H2H collaboration** - a cohesive goal best served by one epic
- Stories are sequenced to minimize risk to existing system (foundation → features → polish)
- Each story delivers incremental value while maintaining system integrity
- MVP approach favors focused delivery over multiple parallel epics

**Story Sequencing Strategy**:
1. **Foundation stories** - Data model extensions, future-proofing (FR16-FR18)
2. **Core features** - High-value collaboration features (mentions, notifications, search)
3. **UX enhancements** - Polish and user experience improvements
4. **Testing & validation** - Playwright + Allure setup, E2E test coverage

---

## Epic 1: Production-Ready Human Collaboration Platform

**Epic Goal**: Transform the existing Slack clone into a production-ready H2H collaboration platform with essential features, solid performance, and foundation for future AI agent integration (Phase 2).

**Integration Requirements**:
- Maintain backwards compatibility with existing workspaces, channels, messages, and users
- Extend Convex schema without breaking existing functionality
- Preserve current authentication flows and user experience patterns
- Prepare data model and APIs for Phase 2 bot integration

**Success Criteria**:
- All FR1-FR15 (core collaboration + UX) implemented and tested
- FR16-FR18 (future-proofing) data model extensions complete
- Playwright + Allure living documentation established
- MVP deployed to early customers for validation

---

### Story 1.1: Future-Proof Data Model Foundation

**As a** platform engineer,
**I want** to extend the data model to support user types and future bot integration,
**So that** Phase 2 bot features can be added without breaking changes.

#### Acceptance Criteria

1. **Given** the existing Convex schema, **when** I add a `userType` field to users table, **then** all existing users default to 'human' type without migration
2. **Given** the extended schema, **when** I create an `agents` table (initially unused), **then** it includes metadata fields for future bot configuration
3. **Given** the new data model, **when** existing features run, **then** no functionality breaks or performance degrades
4. **Given** API patterns, **when** I review message routing, **then** it supports both sync (human) and async (bot) response patterns

#### Integration Verification

**IV1**: All existing workspaces, channels, and messages remain fully functional after schema changes
**IV2**: User authentication and authorization work identically for all existing users
**IV3**: Real-time message delivery maintains <500ms performance with new schema

---

### Story 1.2: @Mentions and Notification System

**As a** workspace member,
**I want** to mention other users with @username and receive notifications,
**So that** I can get teammates' attention and stay informed of relevant messages.

#### Acceptance Criteria

1. **Given** I'm composing a message, **when** I type "@" followed by a username, **then** I see an autocomplete dropdown of workspace members
2. **Given** a message with @mention, **when** it's sent, **then** the mentioned user receives a real-time notification
3. **Given** I'm mentioned in a channel, **when** I view notifications, **then** I see the message preview, sender, and channel context
4. **Given** notification preferences, **when** I customize settings, **then** I can control @mention notifications per channel and globally
5. **Given** unread mentions, **when** I navigate the workspace, **then** I see a badge count on channels with unread mentions

#### Integration Verification

**IV1**: Existing message creation and editing flows work without regression
**IV2**: Real-time message delivery performance remains within 500ms
**IV3**: Notification data is properly indexed for fast retrieval across workspaces

---

### Story 1.3: Workspace-Wide Search

**As a** workspace member,
**I want** to search for messages, channels, and members across the workspace,
**So that** I can quickly find information without scrolling through history.

#### Acceptance Criteria

1. **Given** the search interface, **when** I enter a query, **then** I see results grouped by messages, channels, and members
2. **Given** search results, **when** I click a message result, **then** I navigate to that message with context (thread, channel)
3. **Given** search functionality, **when** I use filters (by channel, by user, by date), **then** results are refined accordingly
4. **Given** large workspaces, **when** search executes, **then** results appear within reasonable time for MVP (3-5 seconds acceptable)
5. **Given** permissions, **when** I search, **then** I only see results from channels I have access to

#### Integration Verification

**IV1**: Search indexing does not impact real-time message delivery performance
**IV2**: Existing channel and DM navigation remains unaffected
**IV3**: Database queries use proper Convex indexes for optimization

---

### Story 1.4: File Upload and Sharing

**As a** workspace member,
**I want** to upload and share files (documents, images, videos) in messages,
**So that** I can collaborate on work artifacts and share media.

#### Acceptance Criteria

1. **Given** the message composer, **when** I click the file upload button, **then** I can select multiple files up to 100MB each
2. **Given** file upload in progress, **when** uploading, **then** I see a progress indicator and can cancel the upload
3. **Given** a file is uploaded, **when** shared in a message, **then** recipients see a preview (images) or file icon (documents) with download option
4. **Given** image files, **when** clicked, **then** they open in a lightbox/modal for full viewing
5. **Given** file storage, **when** files are uploaded, **then** they're stored in Convex Storage with proper metadata

#### Integration Verification

**IV1**: Existing image message functionality (already supported) continues working
**IV2**: Message sending performance is not blocked by file uploads (async upload)
**IV3**: File storage costs are tracked and within acceptable limits for MVP

---

### Story 1.5: Message Pinning and Bookmarking

**As a** workspace member,
**I want** to pin important messages to channels and bookmark messages for myself,
**So that** I can quickly access critical information and personal references.

#### Acceptance Criteria

1. **Given** a message, **when** I click "Pin to channel" (admin/owner only), **then** it appears in the channel's pinned messages list
2. **Given** pinned messages, **when** I view the channel, **then** I see a "Pinned" indicator and can access the pinned messages panel
3. **Given** any message, **when** I click "Bookmark" (personal), **then** it's added to my personal bookmarks list
4. **Given** bookmarks, **when** I access my bookmarks view, **then** I see all bookmarked messages with channel context
5. **Given** a pinned/bookmarked message is deleted, **when** I view pins/bookmarks, **then** it's removed or marked as unavailable

#### Integration Verification

**IV1**: Message deletion and editing flows properly handle pinned/bookmarked references
**IV2**: Workspace switching maintains separate pins/bookmarks per workspace
**IV3**: Real-time updates reflect pin changes to all workspace members immediately

---

### Story 1.6: User Presence and Typing Indicators

**As a** workspace member,
**I want** to see who's online and when someone is typing,
**So that** I know when to expect responses and feel connected to my team.

#### Acceptance Criteria

1. **Given** workspace members, **when** I view the sidebar, **then** I see online/offline/away status indicators next to each member
2. **Given** a user is active, **when** they interact with the app, **then** their status updates to "online" in real-time
3. **Given** a user is typing in a channel/DM, **when** I'm viewing that conversation, **then** I see "{User} is typing..." indicator
4. **Given** typing indicators, **when** the user stops typing for 3 seconds, **then** the indicator disappears
5. **Given** presence data, **when** users go inactive (15+ mins), **then** their status changes to "away" automatically

#### Integration Verification

**IV1**: Presence updates do not cause performance degradation with multiple active users
**IV2**: Typing indicators work correctly in both channels and direct messages
**IV3**: Presence system gracefully handles network disconnections and reconnections

---

### Story 1.7: Enhanced Message Formatting

**As a** workspace member,
**I want** to format messages with code blocks, quotes, and markdown,
**So that** I can communicate technical information and structure clearly.

#### Acceptance Criteria

1. **Given** the Quill editor, **when** I use toolbar controls, **then** I can add code blocks with syntax highlighting
2. **Given** message composition, **when** I use markdown syntax (`, ```, >), **then** it renders correctly in the preview
3. **Given** code blocks, **when** viewing messages, **then** I see syntax-highlighted code with a "Copy" button
4. **Given** blockquotes, **when** used, **then** they render with visual distinction (left border, background color)
5. **Given** existing formatting (bold, italic, strikethrough), **when** combined with new features, **then** all work together without conflicts

#### Integration Verification

**IV1**: Existing Quill editor functionality remains intact
**IV2**: Message storage and retrieval handle new formatting structures correctly
**IV3**: Mobile responsive design accommodates code blocks and quotes without breaking layout

---

### Story 1.8: Channel Management Enhancements

**As a** workspace admin,
**I want** to manage channel descriptions, topics, and visibility settings,
**So that** I can organize the workspace effectively.

#### Acceptance Criteria

1. **Given** a channel I own/admin, **when** I edit channel settings, **then** I can set/update description and topic
2. **Given** channel settings, **when** I change visibility (public/private), **then** appropriate members see/lose access
3. **Given** a channel, **when** I archive it, **then** it moves to "Archived Channels" and becomes read-only
4. **Given** an archived channel, **when** I unarchive it, **then** it returns to active channels and allows new messages
5. **Given** channel management, **when** non-admin members view settings, **then** they see read-only information

#### Integration Verification

**IV1**: Existing channel creation and deletion flows remain functional
**IV2**: Channel permission changes propagate in real-time to all affected users
**IV3**: Archived channels maintain message history and search indexing

---

### Story 1.9: User Status and Availability

**As a** workspace member,
**I want** to set custom status messages and availability indicators,
**So that** teammates know my context and availability.

#### Acceptance Criteria

1. **Given** my user profile, **when** I set a custom status, **then** it appears next to my name throughout the workspace
2. **Given** status options, **when** I select a predefined status (🏖️ Vacationing, 🤒 Sick, 🎯 Focusing), **then** it displays with emoji and text
3. **Given** custom status, **when** I set an expiration time, **then** it automatically clears after the specified duration
4. **Given** status message, **when** other users view my profile or messages, **then** they see my current status
5. **Given** availability settings, **when** I set "Do Not Disturb", **then** I don't receive notification sounds/popups (but messages still arrive)

#### Integration Verification

**IV1**: User status updates sync with presence system without conflicts
**IV2**: Status data persists across sessions and workspace switches
**IV3**: Performance remains stable with status updates across many users

---

### Story 1.10: Infinite Scroll Message History

**As a** workspace member,
**I want** to view message history with infinite scroll and lazy loading,
**So that** I can browse conversations efficiently without performance issues.

#### Acceptance Criteria

1. **Given** a channel with many messages, **when** I scroll to the top, **then** older messages load automatically (infinite scroll)
2. **Given** message loading, **when** new messages are fetched, **then** my scroll position is preserved
3. **Given** performance requirements, **when** loading messages, **then** UI remains responsive (no blocking/freezing)
4. **Given** lazy loading, **when** I jump to a specific message (via search or link), **then** surrounding context loads correctly
5. **Given** real-time messages, **when** new messages arrive while scrolled up, **then** I see a "New Messages" indicator to scroll down

#### Integration Verification

**IV1**: Existing message pagination (if any) is replaced smoothly without data loss
**IV2**: Real-time message subscriptions work correctly with paginated history
**IV3**: Memory usage remains reasonable even with long conversation histories loaded

---

### Story 1.11: Testing Infrastructure and Living Documentation

**As a** development team,
**I want** Playwright + Allure test infrastructure with living documentation,
**So that** we have automated E2E tests with beautiful, readable reports.

#### Acceptance Criteria

1. **Given** the project, **when** I run `npm install`, **then** Playwright and Allure dependencies are installed
2. **Given** test infrastructure, **when** I run `npm run test:e2e`, **then** Playwright tests execute successfully
3. **Given** test execution, **when** tests complete, **then** Allure reports generate automatically with pass/fail status
4. **Given** Allure reports, **when** I open them, **then** I see visual dashboards, screenshots, and step-by-step execution details
5. **Given** critical user flows (login, messaging, search, file upload), **when** automated, **then** each has comprehensive E2E test coverage
6. **Given** CI/CD pipeline, **when** tests run, **then** Allure reports are archived and accessible for review

#### Integration Verification

**IV1**: Test setup does not interfere with existing development workflow
**IV2**: Playwright tests use separate test database/workspace to avoid production data pollution
**IV3**: Living documentation reports are accessible to both technical and non-technical stakeholders

---

## Testing Strategy

### Framework: Playwright + Allure Report

**Chosen for**:
- ✅ Beautiful living documentation with low cognitive load
- ✅ Minimal setup complexity (Playwright already in stack)
- ✅ Visual dashboards, screenshots, videos, trend analysis
- ✅ TypeScript-native, fits existing codebase

### Setup Instructions

```bash
# Install Allure dependencies
npm install -D allure-playwright allure-commandline

# Configure Allure reporter in playwright.config.ts
# reporter: [['allure-playwright', { outputFolder: 'allure-results' }]]

# Run tests and generate report
npm run test:e2e
npx allure generate allure-results --clean
npx allure open
```

### Test Coverage Strategy

**E2E Test Priorities**:
1. **Critical User Flows** (Story 1.11):
   - Authentication (login, logout, OAuth)
   - Workspace creation and joining
   - Channel messaging and threading
   - Direct messages
   - File upload and sharing
   - Search functionality
   - @Mentions and notifications

2. **Integration Tests**:
   - Real-time message delivery
   - Presence and typing indicators
   - Message formatting and rendering
   - Pin/bookmark functionality

3. **Regression Tests**:
   - Existing features after schema changes
   - Performance benchmarks (500ms message delivery)
   - Mobile responsive layouts

### Living Documentation Output

**Allure Reports Include**:
- 📊 **Dashboard**: Pass/fail pie charts, trend graphs
- 📹 **Videos**: Full test execution recordings
- 📸 **Screenshots**: Automatic capture on failure
- 📝 **Step-by-step**: Detailed execution with timing
- 📈 **History**: Track test stability over time
- 🔗 **Traceability**: Link tests to requirements (FR1-FR18)

### Report Access

- **Development**: `npm run test:report` opens Allure locally
- **CI/CD**: Reports published to artifact storage and shared via URL
- **Stakeholders**: Non-technical users can read scenarios without code knowledge

---

## Next Steps

1. **Validate Epic/Story Structure** - Confirm story sequencing and acceptance criteria
2. **Begin Story 1.1** - Future-proof data model (foundation for all other stories)
3. **Set up Playwright + Allure** - Story 1.11 can run in parallel with development
4. **Iterative Development** - Stories 1.2-1.10 in sequence, with continuous testing

---

_End of Phase 1 PRD_