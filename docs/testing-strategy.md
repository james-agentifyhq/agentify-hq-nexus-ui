# Testing Strategy - TDD/BDD Approach

## Overview

This project follows a **Test-Driven Development (TDD)** approach with **Behavior-Driven Development (BDD)** principles for comprehensive quality assurance.

## Test Pyramid

```
        ┌─────────────────┐
        │   E2E Tests     │  ← Playwright (BDD scenarios)
        │   (Slow)        │     User journeys, integration
        ├─────────────────┤
        │ Integration     │  ← Vitest
        │ Tests (Medium)  │     API/Component integration
        ├─────────────────┤
        │  Unit Tests     │  ← Vitest (TDD)
        │  (Fast)         │     Functions, logic, helpers
        └─────────────────┘
```

## TDD Workflow (Red-Green-Refactor)

### 1. 🔴 RED: Write Failing Test First

**Before implementing ANY feature:**

```bash
# Start watch mode (auto-runs on save)
npm run test:watch

# Or use interactive UI
npm run test:ui
```

**Write test based on Acceptance Criteria (Given-When-Then):**

```typescript
// Example: tests/unit/convex/users.test.ts
import { describe, it, expect } from 'vitest';

describe('getUserType', () => {
  it('should default to "human" when no profile exists', async () => {
    // Given: No user profile exists
    const userId = 'test-user-123';

    // When: getUserType is called
    const result = await getUserType({ userId });

    // Then: Should return 'human'
    expect(result).toBe('human');
  });
});
```

### 2. 🟢 GREEN: Implement Minimum Code to Pass

**Write simplest implementation:**

```typescript
// convex/users.ts
export const getUserType = query({
  args: { userId: v.id('users') },
  handler: async (ctx, args) => {
    const profile = await ctx.db
      .query('userProfiles')
      .withIndex('by_user_id', (q) => q.eq('userId', args.userId))
      .first();

    return profile?.userType ?? 'human';
  },
});
```

**Watch mode shows PASS in console immediately!**

### 3. 🔵 REFACTOR: Improve Code Quality

- Clean up implementation
- Remove duplication
- Improve readability
- **Tests still pass!**

## Test Commands

### Development (Always Visible Console Output)

```bash
# Auto-run tests on file save (recommended during dev)
npm run test:watch

# Interactive UI in browser
npm run test:ui

# Single run (CI/pre-commit)
npm run test

# Coverage report
npm run test:coverage
```

### E2E Testing (Playwright - Keep Existing)

```bash
# Run E2E tests
npm run test:e2e

# Interactive mode
npm run test:e2e:ui

# Headed mode (see browser)
npm run test:e2e:headed
```

## Test Structure

```
tests/
├── setup.ts                    # Global test setup
├── unit/                       # Unit tests (fast)
│   ├── convex/                 # Convex function tests
│   │   ├── users.test.ts
│   │   ├── workspaces.test.ts
│   │   └── messages.test.ts
│   └── lib/                    # Utility function tests
│       └── utils.test.ts
├── integration/                # Integration tests (medium)
│   └── api/
│       └── workspace-flow.test.ts
└── e2e/                        # E2E tests (slow)
    ├── authentication.spec.ts
    ├── messaging.spec.ts
    └── workspace.spec.ts
```

## Story Implementation Workflow

### 1. PO Creates Story with Given-When-Then ACs

```markdown
## Acceptance Criteria

1. **Given** user has no profile, **when** getUserType is called, **then** it returns 'human'
2. **Given** user profile exists with type 'ai-agent', **when** getUserType is called, **then** it returns 'ai-agent'
```

### 2. Dev Translates ACs to Tests (RED)

```typescript
describe('AC1: Default to human', () => {
  it('should return "human" when no profile exists', async () => {
    // Test implementation
  });
});

describe('AC2: Return ai-agent type', () => {
  it('should return "ai-agent" when profile has ai-agent type', async () => {
    // Test implementation
  });
});
```

### 3. Dev Implements Feature (GREEN)

- Write minimum code to pass tests
- Watch console for instant feedback
- All tests must pass before moving on

### 4. Dev Refactors (REFACTOR)

- Improve code quality
- Tests ensure nothing breaks

### 5. QA Validates Traceability

- Verify each AC has corresponding test
- Check test coverage meets requirements
- Validate Given-When-Then mapping

## Vitest Configuration

**Key Settings** (vitest.config.ts):

```typescript
{
  test: {
    globals: true,              // No import needed for describe/it/expect
    environment: 'happy-dom',   // Fast DOM simulation
    watch: true,                // Auto-run on changes
    reporters: ['verbose'],     // Detailed console output
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
    },
  },
}
```

## Console Output Examples

### Watch Mode (Auto-run)

```
✓ tests/unit/convex/users.test.ts (2)
  ✓ getUserType (1)
    ✓ should default to "human" when no profile exists
  ✓ isHumanUser (1)
    ✓ should return true for human users

Test Files  1 passed (1)
     Tests  2 passed (2)
  Start at  00:00:00
  Duration  45ms

PASS  Waiting for file changes...
```

### Failed Test (Red Phase)

```
✖ tests/unit/convex/users.test.ts (1)
  ✖ getUserType
    ✖ should default to "human" when no profile exists

      Expected: "human"
      Received: undefined

      at tests/unit/convex/users.test.ts:15:24

Test Files  1 failed (1)
     Tests  1 failed (1)
```

## Best Practices

### ✅ DO

- Write tests BEFORE implementation (TDD)
- Use Given-When-Then format in test names
- Keep tests focused and isolated
- Run tests in watch mode during development
- Map every AC to at least one test
- Use descriptive test names that explain behavior

### ❌ DON'T

- Skip writing tests (no implementation without tests)
- Write tests after implementation
- Test implementation details (test behavior)
- Make tests dependent on each other
- Ignore failing tests

## Coverage Requirements

- **Unit Tests**: 80% minimum coverage for new code
- **Integration Tests**: Critical user flows covered
- **E2E Tests**: Happy paths and key error scenarios

## Convex-Specific Testing

**Note**: Convex functions require special test setup. Until official Convex test utilities are available:

1. Use placeholder tests documenting expected behavior
2. Validate via Convex dashboard manual testing
3. Rely on E2E tests for integration validation

**Future**: When Convex test utilities available, convert placeholders to real tests.

## QA Validation Checklist

- [ ] Every AC has corresponding test(s)
- [ ] Tests follow Given-When-Then format
- [ ] Test names clearly describe behavior
- [ ] All tests pass before marking story complete
- [ ] Coverage meets minimum requirements (80% unit)
- [ ] E2E tests validate user journeys

## Migration from Allure

**Previous** (Too much overhead):
```bash
npm run test:e2e
npm run test:report  # Generate and open Allure report
```

**New** (Lightweight):
```bash
npm run test:watch   # Vitest watch mode (instant feedback)
npm run test:ui      # Vitest UI (lightweight browser view)
npm run test:e2e     # Playwright (simple HTML report)
```

**Benefits**:
- ✅ Faster feedback (tests run on save)
- ✅ Always visible console output
- ✅ Less overhead (no Allure generation)
- ✅ Better developer experience