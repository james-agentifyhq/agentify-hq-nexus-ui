# E2E Testing with Playwright + Allure

Living documentation for the Agentify HQ Nexus platform using Playwright and Allure Reports.

## 🎯 Overview

This test suite provides comprehensive E2E testing with beautiful, low-cognitive-load living documentation through Allure reports.

## 📋 Test Coverage

### Existing Features (Current)
- ✅ **Authentication** - Login/logout, OAuth providers
- ✅ **Workspace Management** - Create, join, switch workspaces
- ✅ **Channel Messaging** - Send, edit, delete, react, thread messages
- ✅ **Direct Messages** - 1:1 conversations with team members

### Future Features (Phase 1 Stories)
- ⏳ @Mentions and notifications
- ⏳ Workspace-wide search
- ⏳ File upload and sharing
- ⏳ Message pinning and bookmarking
- ⏳ User presence and typing indicators
- ⏳ Enhanced message formatting
- ⏳ Channel management
- ⏳ User status and availability
- ⏳ Infinite scroll message history

## 🚀 Quick Start

### Install Dependencies
```bash
npm install --legacy-peer-deps
npx playwright install chromium
```

### Run Tests

#### Headless Mode (CI/CD)
```bash
npm run test:e2e
```

#### Headed Mode (Watch Tests Run)
```bash
npm run test:e2e:headed
```

#### UI Mode (Interactive)
```bash
npm run test:e2e:ui
```

### Generate Allure Reports

#### Generate and Open Report
```bash
npm run test:report
```

#### Generate Report Only
```bash
npm run test:report:generate
```

## 📊 Allure Reports

### Features
- 📈 **Dashboard**: Pass/fail pie charts, trend analysis
- 📹 **Videos**: Full test execution recordings (on failure)
- 📸 **Screenshots**: Automatic capture on failure
- 📝 **Step-by-step**: Detailed test execution with timing
- 🔗 **Traceability**: Link tests to requirements (FR1-FR18)

### Accessing Reports

#### Local Development
```bash
npm run test:report
# Opens Allure report in browser at http://localhost:port
```

#### CI/CD
Reports are automatically generated and archived as build artifacts.

## 📁 Test Structure

```
tests/
├── e2e/
│   ├── authentication.spec.ts      # Auth flows
│   ├── workspace.spec.ts           # Workspace management
│   ├── messaging.spec.ts           # Channel messaging
│   ├── direct-messages.spec.ts     # DM conversations
│   └── fixtures/
│       └── auth.ts                 # Auth test fixtures
└── README.md
```

## 🛠️ Writing Tests

### Test Format

Tests follow **Gherkin-style** structure for readability:

```typescript
test('should perform action', async ({ page }) => {
  await test.step('Given: Setup context', async () => {
    await page.goto('/path');
  });

  await test.step('When: Perform action', async () => {
    await page.click('button');
  });

  await test.step('Then: Verify result', async () => {
    await expect(page.getByText('Success')).toBeVisible();
  });
});
```

### Using Allure Annotations

```typescript
import { test, expect } from '@playwright/test';

test.describe('Feature Name', () => {
  test('User story scenario', async ({ page }) => {
    // Tests automatically tracked in Allure
  });
});
```

## 🔧 Configuration

### Playwright Config
- **File**: `playwright.config.ts`
- **Test Directory**: `./tests/e2e`
- **Base URL**: `http://localhost:3000` (configurable via `PLAYWRIGHT_TEST_BASE_URL`)
- **Browsers**: Chromium (default), Firefox, WebKit (optional)

### Allure Config
- **Output Folder**: `allure-results/`
- **Report Folder**: `allure-report/`
- **Detail Level**: Full (screenshots, videos, timing)

## 📝 Best Practices

### 1. Use Test Steps
Break tests into clear Given/When/Then steps for better Allure reporting:
```typescript
await test.step('Description', async () => { /* action */ });
```

### 2. Descriptive Test Names
Use clear, behavior-driven test names:
```typescript
test('should display error message when email is invalid', ...)
```

### 3. Proper Selectors
Prefer semantic selectors over brittle ones:
```typescript
// Good
page.getByRole('button', { name: /submit/i })
page.getByLabel('Email address')

// Avoid
page.locator('.btn-primary')
page.locator('#submit-button')
```

### 4. Wait for Visibility
Explicitly wait for elements:
```typescript
await expect(page.getByText('Success')).toBeVisible();
```

### 5. Clean Up
Use fixtures for setup/teardown:
```typescript
test.beforeEach(async ({ page }) => {
  // Setup
});

test.afterEach(async ({ page }) => {
  // Cleanup
});
```

## 🐛 Debugging

### Visual Debugging
```bash
# Run with headed browser
npm run test:e2e:headed

# Run in UI mode (pause, step through)
npm run test:e2e:ui
```

### Trace Viewer
When tests fail on CI, download trace files and view:
```bash
npx playwright show-trace trace.zip
```

### Console Logs
Access browser console in tests:
```typescript
page.on('console', msg => console.log(msg.text()));
```

## 🔄 CI/CD Integration

### GitHub Actions Example
```yaml
- name: Run Playwright tests
  run: npm run test:e2e

- name: Generate Allure report
  run: npm run test:report:generate

- name: Upload Allure report
  uses: actions/upload-artifact@v3
  with:
    name: allure-report
    path: allure-report/
```

## 📚 Resources

- [Playwright Documentation](https://playwright.dev)
- [Allure Report Documentation](https://docs.qameta.io/allure/)
- [Project PRD](../docs/prd.md)

## 🤝 Contributing

When adding new tests:
1. Follow Gherkin-style test structure (Given/When/Then)
2. Use `test.step()` for better Allure reporting
3. Add descriptive test names that match user stories
4. Link tests to requirements in comments (e.g., `// FR1: @Mentions`)
5. Run tests locally before committing
6. Verify Allure reports look good

## ✅ Test Status

| Feature | Test Coverage | Status |
|---------|--------------|--------|
| Authentication | Basic UI tests | ⚠️ Needs auth fixture |
| Workspaces | Basic UI tests | ⚠️ Needs auth fixture |
| Channel Messaging | Comprehensive | ⚠️ Skipped (auth) |
| Direct Messages | Comprehensive | ⚠️ Skipped (auth) |
| @Mentions | Not yet | ⏳ Phase 1 |
| Search | Not yet | ⏳ Phase 1 |
| File Upload | Not yet | ⏳ Phase 1 |

**Note**: Most tests are currently skipped pending authentication fixture implementation. See `tests/e2e/fixtures/auth.ts` for details.