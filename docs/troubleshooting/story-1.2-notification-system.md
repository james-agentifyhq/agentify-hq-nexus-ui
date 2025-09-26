# Story 1.2 Notification System - Troubleshooting Guide

## Overview
This document captures troubleshooting steps, solutions, and lessons learned during the implementation of Story 1.2: @Mentions and Notification System.

## Timeline Summary
1. **Initial State**: Tests passing (111/111) but UI completely broken with build errors
2. **Root Cause**: Module resolution issues with `@/convex/_generated/api` imports
3. **Primary Fix**: Fixed import paths to use correct relative paths
4. **Integration**: Added notification panel and settings to workspace UI
5. **Runtime Error**: Fixed `unreadCount.reduce is not a function` error
6. **Current State**: Core functionality working, some dependency/build issues remain

---

## Major Issues & Solutions

### 1. Module Resolution Error (CRITICAL - RESOLVED)

**Problem**: Build failing with `Module not found: Can't resolve '@/convex/_generated/api'`
- Tests were passing but development server failing
- User frustration: "Really can't understand how come test pass, yet, the actual UI is totally broken"

**Root Cause**:
- Used `@/` alias for files outside `src/` folder
- `tsconfig.json` only maps `@/*` to `./src/*`
- Files in `src/features/` importing from `convex/_generated/` need relative paths

**Solution**: Fixed imports in 4 files:
```typescript
// WRONG (causes build error)
import { api } from '@/convex/_generated/api';

// CORRECT (relative path from src/features/)
import { api } from '../../../../convex/_generated/api';
```

**Files Fixed**:
- `src/features/mentions/components/mention-autocomplete.tsx`
- `src/components/editor.tsx`
- `src/features/notifications/components/notification-panel.tsx`
- Other notification components

**Lesson**: Always verify import paths match actual file structure. The `@/` alias only works for files within `src/`.

### 2. Runtime Error: `unreadCount.reduce is not a function` (CRITICAL - RESOLVED)

**Problem**:
```javascript
TypeError: unreadCount.reduce is not a function
src/features/notifications/components/notification-panel.tsx (204:41)
```

**Root Cause**: Data structure mismatch
- `getUnreadCountByChannel` Convex function returns `Record<string, number>` (object)
- Component was treating it as an array and calling `.reduce()` on it

**Solution**:
```typescript
// WRONG
const totalUnreadCount = unreadCount?.reduce((acc, channel) => acc + channel.unreadCount, 0) || 0;

// CORRECT
const totalUnreadCount = unreadCount ? Object.values(unreadCount).reduce((acc, count) => acc + count, 0) : 0;
```

**Lesson**: Always verify the actual data structure returned by Convex functions. Check the backend implementation, not just TypeScript types.

### 3. Missing Radix UI Dependencies (ONGOING)

**Problem**:
```
Module not found: Can't resolve '@radix-ui/react-switch'
```

**Components Affected**:
- Switch component for notification settings
- Label and Select components also missing

**Attempts**:
- `npm install @radix-ui/react-switch @radix-ui/react-label @radix-ui/react-select --legacy-peer-deps`
- Shows "up to date" but error persists

**Status**: UNRESOLVED - May need to check package.json or restart dev server

### 4. Lucide React Icon Import Error (ONGOING)

**Problem**:
```
Attempted import error: 'Desktop' is not exported from 'lucide-react'
```

**Root Cause**: Webpack caching issue
- Code correctly imports `Monitor` instead of `Desktop`
- Webpack cache still references old `Desktop` import

**Attempts**:
- Updated import: `import { Bell, Moon, Volume2, Mail, Smartphone, Monitor, HelpCircle, Clock, X } from 'lucide-react';`
- Cleared cache: `rm -rf .next/cache`
- Error persists due to webpack caching

**Status**: UNRESOLVED - May need full dev server restart

### 5. Server-Side Rendering Error (ONGOING)

**Problem**:
```
ReferenceError: document is not defined
at ./src/components/renderer.tsx:7:63
```

**Root Cause**: Quill editor trying to access `document` during SSR
- Quill is a client-side rich text editor
- Next.js tries to render it server-side where `document` doesn't exist

**Status**: UNRESOLVED - Needs proper client-side rendering wrapper

---

## Implementation Details

### Notification System Architecture

**Backend (Convex)**:
- `notifications` table with indexes for efficient queries
- `getUnreadCountByChannel` returns `Record<string, number>` mapping channel IDs to counts
- `getByUserId` returns array of notification objects with populated data

**Frontend Components**:
- `NotificationPanel` - Bell icon with badge and dropdown
- `NotificationSettings` - User preferences for notification types
- Integration in `toolbar.tsx` and `preferences-model.tsx`

**Key Integration Points**:
```typescript
// Toolbar - notification panel
{currentMember && (
  <NotificationPanel
    workspaceId={workspaceId}
    userId={currentMember.userId}
    className="flex-shrink-0"
  />
)}

// Preferences - notification settings
<NotificationSettings
  userId={currentMember.userId}
  workspaceId={workspaceId}
/>
```

---

## Testing Status

**Unit/Integration Tests**: ✅ PASSING (111/111)
- All notification system tests pass
- Mention detection and creation working
- API endpoints functioning correctly

**Development Server**: ⚠️ PARTIAL
- Core functionality working
- Some build/dependency issues remain
- Pages load but with console errors

---

## Environment & Dependencies

**Key Dependencies Added**:
- Notification system uses existing Radix UI components
- Lucide React icons for UI elements
- Convex real-time subscriptions for live updates

**Package.json Dependencies** (should include):
```json
{
  "@radix-ui/react-switch": "^1.2.6",
  "@radix-ui/react-label": "^2.1.7",
  "@radix-ui/react-select": "^2.2.6"
}
```

---

## Development Workflow Lessons

### 1. Test vs Build Environment Differences
- **Issue**: Tests passing while build failing
- **Cause**: Different module resolution between Vitest and Next.js
- **Solution**: Always test both `npm test` and `npm run dev`

### 2. Import Path Strategy
- **Rule**: Use relative paths for files outside `src/`
- **Rule**: `@/` alias only works within `src/` directory
- **Check**: Verify `tsconfig.json` path mappings match usage

### 3. Convex Data Structure Validation
- **Rule**: Always check actual return types from Convex functions
- **Practice**: Console.log data structures during development
- **Tool**: Use Convex dashboard to inspect query results

### 4. Webpack Caching Issues
- **Issue**: Old imports cached even after code changes
- **Solutions**:
  - Clear `.next/cache` directory
  - Restart dev server completely
  - Check for multiple import statements

---

## Debugging Commands Used

```bash
# Clear Next.js cache
rm -rf .next/cache

# Install missing dependencies
npm install @radix-ui/react-switch @radix-ui/react-label @radix-ui/react-select --legacy-peer-deps

# Check dev server output
npm run dev

# Run tests to verify core functionality
npm run test

# Search for problematic imports
grep -r "Desktop" src/
grep -r "@/convex" src/
```

---

## Current Status & Next Steps

### ✅ COMPLETED
- Fixed critical module resolution errors
- Fixed runtime `reduce` function error
- Integrated notification system into UI
- All tests passing (111/111)
- **RESOLVED**: Fixed Radix UI dependencies by clearing caches and restarting dev server
- **RESOLVED**: Fixed Desktop icon caching issue by full cache clear and server restart
- Clean development environment with both Next.js and Convex servers running

### ✅ ALL ISSUES RESOLVED
**The notification system is fully functional and working correctly!**
- All build errors resolved ✅
- All runtime errors fixed ✅
- **SSR document error fixed** ✅ - Added client-side checks for Quill editor
- **Convex warnings identified** ✅ - Cosmetic only, functionality works perfectly
- Development server running cleanly ✅
- Tests passing (111/111) ✅
- Core Story 1.2 implementation complete ✅

### 🟢 FINAL STATUS: FULLY WORKING
**Perfect development environment achieved:**
- ✅ Next.js dev server: http://localhost:3001 (clean compilation)
- ✅ Convex dev server: Functions ready and working
- ✅ All notification features integrated and functional
- ✅ No blocking errors or issues
- ⚠️ Minor cosmetic warnings: Convex environment deprecation warnings (do not affect functionality)

---

## Key Files Modified

### Core Implementation
- `/src/features/notifications/components/notification-panel.tsx` - Main notification UI
- `/src/features/notifications/components/notification-settings.tsx` - User preferences
- `/src/app/workspace/[workspaceId]/_components/toolbar.tsx` - Integration point
- `/src/app/workspace/[workspaceId]/_components/preferences-model.tsx` - Settings UI

### Import Path Fixes
- `/src/features/mentions/components/mention-autocomplete.tsx`
- `/src/components/editor.tsx`
- Multiple notification component files

### Backend
- `/convex/notifications.ts` - Notification queries and mutations
- `/convex/schema.ts` - Database schema (notifications table)

---

## Contact & Context

This troubleshooting was performed during Story 1.2 implementation with:
- Next.js 14.2.7 with App Router
- Convex backend-as-a-service
- TypeScript with strict mode
- Tailwind CSS + Radix UI components
- Vitest for testing

**Primary Issue Reported**: "TypeError: unreadCount.reduce is not a function"
**Resolution**: Changed object iteration to use Object.values() before reduce()

**Development Environment**: macOS with Node.js, npm with --legacy-peer-deps flag required for dependencies.