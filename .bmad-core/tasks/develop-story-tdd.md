# develop-story-tdd

## Purpose
Execute story implementation using Test-Driven Development (TDD) methodology with Red-Green-Refactor cycle.

## Order of Execution
1. **Read Task** - Review current task and acceptance criteria
2. **Write Tests First (RED)** - Translate acceptance criteria to failing tests
3. **Implement Minimum Code (GREEN)** - Write just enough code to pass tests
4. **Refactor** - Improve code while keeping tests green
5. **Execute Validations** - Run full test suite and linting
6. **Update Task Checkbox** - Mark task [x] only if ALL validations pass
7. **Update File List** - Ensure all new/modified/deleted files are listed
8. **Repeat** - Continue with next task until story complete

## Story File Updates ONLY
**CRITICAL: ONLY UPDATE THE STORY FILE WITH UPDATES TO SECTIONS INDICATED BELOW. DO NOT MODIFY ANY OTHER SECTIONS.**

**Authorized Story Sections:**
- Tasks / Subtasks Checkboxes
- Dev Agent Record section and all subsections
- Agent Model Used
- Debug Log References
- Completion Notes List
- File List
- Change Log
- Status

**DO NOT modify:** Status, Story, Acceptance Criteria, Dev Notes, Testing sections, or any other sections not listed above.

## TDD Cycle Details

### RED Phase (Write Failing Tests)
- Review acceptance criteria from story
- Identify testable behaviors
- Write unit/integration tests that WILL FAIL
- Use Vitest for unit/integration (`tests/unit/`, `tests/integration/`)
- Use Playwright for E2E (`tests/e2e/`)
- Follow Given-When-Then format from acceptance criteria

### GREEN Phase (Make Tests Pass)
- Implement MINIMUM code to pass tests
- No gold-plating or premature optimization
- Focus on meeting acceptance criteria exactly
- Run tests continuously: `npm run test:watch`

### REFACTOR Phase (Improve While Green)
- Clean up code while tests remain green
- Apply project standards (see `.bmad-core/core-config.yaml`)
- Improve readability and maintainability
- Keep all tests passing

## Blocking Conditions
**HALT development for:**
- Unapproved dependencies needed → confirm with user
- Ambiguous requirements after story check
- 3 failures attempting to implement/fix repeatedly
- Missing configuration
- Failing regression tests

## Ready for Review Criteria
- ✅ Code matches requirements
- ✅ All validations pass
- ✅ Follows project standards
- ✅ File List complete
- ✅ All tests written in TDD cycle

## Completion Criteria
1. All Tasks and Subtasks marked [x] and have tests
2. Validations and full regression passes (EXECUTE ALL TESTS - DON'T BE LAZY)
3. Ensure File List is complete
4. Run task `execute-checklist` for `story-dod-checklist`
5. Set story status: 'Ready for Review'
6. HALT

## Test Commands Reference
```bash
npm run test:watch     # Auto-run on changes (use during dev)
npm run test:ui        # Interactive browser UI
npm run test           # Single run (CI/pre-commit)
npm run test:coverage  # Coverage report
npm run test:e2e       # E2E tests with Playwright
npm run test:e2e:ui    # E2E interactive mode
```

## Notes
- This task enforces true TDD: tests before implementation
- Each task follows complete Red-Green-Refactor cycle
- Tests serve as executable documentation of acceptance criteria
- Maintains traceability from AC → Test → Implementation