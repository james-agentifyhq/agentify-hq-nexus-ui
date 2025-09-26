# ✅ TDD Workflow Integration Complete

## 🎯 What Changed

### 1. Dev Agent Workflow Updated

**File**: `.bmad-core/agents/dev.md`

**Key Changes**:
- ✅ **TDD Mandatory**: Red-Green-Refactor cycle required for ALL implementations
- ✅ **Order Updated**: Tests FIRST, then implementation
- ✅ **Test Commands**: Clear commands for unit and E2E tests
- ✅ **Completion Checklist**: Both unit and E2E tests must pass

**New Workflow**:
```
Read Task → Write Tests FIRST (Red) → Run Tests (FAIL) →
Implement Code (Green) → Run Tests (PASS) →
Refactor (tests ensure safety) → Validate → Mark Complete
```

### 2. Definition of Done (DoD) Updated

**File**: `.bmad-core/checklists/story-dod-checklist.md`

**New Testing Section**:
- ✅ TDD Followed (Red-Green-Refactor)
- ✅ AC Mapping (Given-When-Then)
- ✅ Unit Tests (Vitest - `npm run test`)
- ✅ E2E Tests (Playwright - `npm run test:e2e`)
- ✅ Coverage ≥80% for new code
- ✅ Test quality standards

### 3. QA Review Process Updated

**File**: `.bmad-core/tasks/review-story.md`

**Enhanced Validation**:
- ✅ TDD compliance check
- ✅ AC-to-test mapping verification
- ✅ Test-first evidence review
- ✅ Coverage gap identification
- ✅ Both test suites validation

## 📋 New Development Flow

### For Developers (James)

1. **Story Assigned** (Status: Approved)
   - Run `npm run test:watch` (auto-runs tests on save)
   - Read acceptance criteria

2. **For Each Task** (TDD Cycle):
   ```
   🔴 RED Phase:
   - Write test for AC (Given-When-Then)
   - Run tests → See FAIL ✗

   🟢 GREEN Phase:
   - Write minimum code to pass
   - Run tests → See PASS ✓

   🔵 REFACTOR Phase:
   - Improve code quality
   - Tests ensure nothing breaks ✓
   ```

3. **Complete Task**:
   - All tests pass: `npm run test` ✅
   - E2E tests pass: `npm run test:e2e` ✅
   - Coverage ≥80%: `npm run test:coverage` ✅
   - Mark task [x] in story

4. **Story Complete**:
   - Run DoD checklist
   - Set status: "Review"
   - QA validates

### For QA (Quinn)

1. **Review Traceability**:
   - ✅ Each AC has test(s)
   - ✅ Tests use Given-When-Then
   - ✅ Coverage meets standards

2. **Validate TDD**:
   - ✅ Tests written before code (check dev notes)
   - ✅ Red-Green-Refactor followed
   - ✅ Test quality acceptable

3. **Run Tests**:
   ```bash
   npm run test           # Unit tests
   npm run test:e2e       # E2E tests
   npm run test:coverage  # Coverage report
   ```

4. **Gate Decision**:
   - PASS: All criteria met
   - CONCERNS: Minor issues
   - FAIL: Critical issues

## 🔧 Test Commands Reference

### Development (Always Running)
```bash
npm run test:watch    # Auto-run on save (recommended)
npm run test:ui       # Interactive browser UI
```

### Validation (Before Review)
```bash
npm run test          # All unit tests
npm run test:e2e      # All E2E tests
npm run test:coverage # Coverage report
```

## 📊 Quality Standards

### Test Coverage
- **Minimum**: 80% for new code
- **Unit Tests**: Fast, isolated, comprehensive
- **Integration Tests**: API/component integration
- **E2E Tests**: Critical user journeys

### Test Quality
- ✅ Each AC has corresponding test(s)
- ✅ Tests use Given-When-Then format
- ✅ Tests are isolated (no dependencies)
- ✅ Test names describe behavior
- ✅ Follows `docs/testing-strategy.md`

## 🎯 Example: Story 1.2 Workflow

### 1. PO Creates Story
```markdown
## Acceptance Criteria

1. **Given** user @mentions another user,
   **when** message is sent,
   **then** mentioned user receives notification

2. **Given** message has @mention,
   **when** displayed,
   **then** @mention is highlighted
```

### 2. Dev Writes Tests FIRST (Red)
```typescript
// tests/unit/features/mentions.test.ts
describe('AC1: Mention notifications', () => {
  it('should create notification when user is mentioned', async () => {
    // Given: User types message with @mention
    const message = 'Hey @john, check this out';

    // When: Message is sent
    const result = await sendMessage({ body: message });

    // Then: Mentioned user gets notification
    expect(result.notifications).toContainEqual({
      userId: 'john-id',
      type: 'mention',
    });
  });
});

// Run: npm run test:watch → FAILS ❌ (not implemented yet)
```

### 3. Dev Implements (Green)
```typescript
// convex/messages.ts
export const sendMessage = mutation({
  handler: async (ctx, args) => {
    // Extract mentions
    const mentions = extractMentions(args.body);

    // Create message
    const messageId = await ctx.db.insert('messages', args);

    // Create notifications for mentions
    for (const userId of mentions) {
      await ctx.db.insert('notifications', {
        userId,
        messageId,
        type: 'mention',
      });
    }

    return { messageId, notifications: mentions };
  },
});

// Watch mode shows: PASS ✅
```

### 4. Dev Refactors (Refactor)
```typescript
// Extract to helper function
async function createMentionNotifications(ctx, mentions, messageId) {
  return Promise.all(
    mentions.map(userId =>
      ctx.db.insert('notifications', { userId, messageId, type: 'mention' })
    )
  );
}

// Tests still pass ✅
```

### 5. QA Reviews
- ✅ AC1 → test in `mentions.test.ts:10-20`
- ✅ AC2 → test in `mentions.test.ts:22-30`
- ✅ TDD followed (tests written first per dev notes)
- ✅ Unit tests pass: `npm run test`
- ✅ E2E tests pass: `npm run test:e2e`
- ✅ Coverage: 85% (meets 80% standard)

**Gate: PASS** ✅

## 📚 Documentation References

- **Testing Strategy**: `docs/testing-strategy.md`
- **TDD Setup Guide**: `docs/TDD-SETUP.md`
- **Dev Agent Config**: `.bmad-core/agents/dev.md`
- **DoD Checklist**: `.bmad-core/checklists/story-dod-checklist.md`
- **QA Review Task**: `.bmad-core/tasks/review-story.md`

## 🚀 Ready for Story 1.2!

**Next Steps**:
1. PO creates Story 1.2 with Given-When-Then ACs
2. Dev starts `npm run test:watch`
3. Dev follows TDD workflow (Red-Green-Refactor)
4. QA validates test coverage and traceability
5. Deploy with confidence! 🎉

---

**TDD is now the enforced workflow for all development!**