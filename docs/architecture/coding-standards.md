# Coding Standards

## TypeScript Best Practices

### General Principles
- **Strict mode enabled**: All TypeScript strict checks active
- **Explicit types**: Prefer explicit types over `any` or implicit types
- **Functional approach**: Prefer pure functions and immutability
- **DRY principle**: Abstract repeated logic into utilities

### File Organization
```typescript
// 1. Imports (external → internal → types)
import { useState } from 'react';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import type { Id } from '@/convex/_generated/dataModel';

// 2. Types/Interfaces
interface ComponentProps {
  userId: Id<"users">;
}

// 3. Component/Function
export function Component({ userId }: ComponentProps) { }
```

### Naming Conventions
- **Files**: `kebab-case.tsx` (e.g., `use-workspace-id.ts`)
- **Components**: `PascalCase` (e.g., `MessageList`)
- **Functions/Variables**: `camelCase` (e.g., `getUserType`)
- **Constants**: `UPPER_SNAKE_CASE` (e.g., `MAX_FILE_SIZE`)
- **Types/Interfaces**: `PascalCase` (e.g., `MessageProps`)
- **Convex tables**: `camelCase` (e.g., `userProfiles`)

### React Patterns
```typescript
// ✅ Good: Named exports for components
export function MessageList() { }

// ✅ Good: Props interface with explicit types
interface MessageListProps {
  channelId: Id<"channels">;
  onMessageClick?: (messageId: Id<"messages">) => void;
}

// ✅ Good: Early returns
function Component({ data }: Props) {
  if (!data) return null;
  return <div>{data.content}</div>;
}

// ❌ Bad: Default exports
export default MessageList;

// ❌ Bad: Inline types
function Component(props: { data: any }) { }
```

### Convex Patterns
```typescript
// ✅ Good: Explicit validators
export const createMessage = mutation({
  args: {
    channelId: v.id('channels'),
    content: v.string(),
  },
  handler: async (ctx, args) => { }
});

// ✅ Good: Type-safe queries
const messages = await ctx.db
  .query('messages')
  .withIndex('by_channel_id', (q) => q.eq('channelId', args.channelId))
  .collect();

// ❌ Bad: No validators
export const createMessage = mutation({
  args: {},
  handler: async (ctx, args: any) => { }
});
```

### Error Handling
```typescript
// ✅ Good: Explicit error types
try {
  await mutation();
} catch (error) {
  if (error instanceof ConvexError) {
    console.error('Convex error:', error.message);
  }
  throw error;
}

// ✅ Good: Early validation
if (!userId) {
  throw new Error('User ID is required');
}

// ❌ Bad: Silent failures
try {
  await mutation();
} catch {
  // Silent failure
}
```

### Testing Standards
- **TDD**: Write tests FIRST before implementation
- **Test location**: `tests/unit/` for unit, `tests/e2e/` for E2E
- **Naming**: `{feature}.test.ts` or `{feature}.spec.ts`
- **Coverage**: Minimum 80% for new code
- **Format**: Use Given-When-Then for test descriptions

```typescript
describe('getUserType', () => {
  it('should return "human" for existing users without profile', async () => {
    // Given: A user without userProfile
    const userId = await createTestUser();

    // When: getUserType is called
    const userType = await getUserType({ userId });

    // Then: It returns 'human' as default
    expect(userType).toBe('human');
  });
});
```

### Import Paths
- Use path aliases: `@/` maps to `/src`
- Prefer absolute imports over relative for shared code
- Group imports: external → internal → types

```typescript
// ✅ Good
import { Button } from '@/components/ui/button';
import { useWorkspaceId } from '@/hooks/use-workspace-id';

// ❌ Bad
import { Button } from '../../../components/ui/button';
```

### Code Comments
- Use JSDoc for public APIs
- Explain "why" not "what"
- Keep comments up-to-date with code changes

```typescript
// ✅ Good: Explains why
// Default to 'human' for backward compatibility with existing users
return profile?.userType ?? 'human';

// ❌ Bad: Explains what (obvious from code)
// Return the user type
return profile?.userType ?? 'human';
```

### Performance
- Use React.memo for expensive components
- Implement proper dependency arrays in hooks
- Avoid unnecessary re-renders with useMemo/useCallback
- Index Convex queries for performance

```typescript
// ✅ Good: Memoized expensive computation
const sortedMessages = useMemo(
  () => messages.sort((a, b) => b.createdAt - a.createdAt),
  [messages]
);

// ✅ Good: Stable callback reference
const handleClick = useCallback(() => {
  console.log(selectedId);
}, [selectedId]);
```

### Security
- Never commit secrets or API keys
- Validate all inputs in Convex mutations
- Use Convex auth for authentication checks
- Sanitize user-generated content

```typescript
// ✅ Good: Auth check in mutation
handler: async (ctx, args) => {
  const userId = await auth.getUserId(ctx);
  if (!userId) throw new Error('Unauthorized');
  // ... proceed
}

// ❌ Bad: No auth check
handler: async (ctx, args) => {
  // Direct DB mutation without auth
}
```