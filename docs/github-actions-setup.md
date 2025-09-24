# GitHub Actions + Allure Reports Setup Guide

## 🎯 Overview

Automated E2E testing with Allure reports published to GitHub Pages on every PR and main branch push.

---

## ✅ What's Configured

### 1. **GitHub Actions Workflows**
- ✅ `.github/workflows/playwright-tests.yml` - Main test workflow
- ✅ `.github/workflows/allure-history.yml` - Allure with history tracking

### 2. **Features**
- ✅ Run Playwright tests on every PR
- ✅ Generate Allure reports with screenshots/videos
- ✅ Publish reports to GitHub Pages (main branch only)
- ✅ Add PR comments with test results
- ✅ Keep report history (last 20 runs)
- ✅ Artifact uploads for debugging

---

## 🚀 Setup Instructions

### **Step 1: Enable GitHub Pages**

1. Go to your repository on GitHub
2. Navigate to **Settings** → **Pages**
3. Under "Build and deployment":
   - **Source**: Select "GitHub Actions"
   - ✅ Save

### **Step 2: Enable Workflow Permissions**

1. Go to **Settings** → **Actions** → **General**
2. Scroll to "Workflow permissions"
3. Select **"Read and write permissions"**
4. ✅ Check "Allow GitHub Actions to create and approve pull requests"
5. Click **Save**

### **Step 3: Push Workflow Files**

```bash
# Add workflow files
git add .github/workflows/

# Commit
git commit -m "Add GitHub Actions for E2E testing with Allure reports"

# Push to main
git push origin main
```

### **Step 4: Verify Setup**

1. Create a test branch:
   ```bash
   git checkout -b test-ci
   git push origin test-ci
   ```

2. Open a Pull Request to `main`

3. GitHub Actions will:
   - ✅ Run Playwright tests
   - ✅ Generate Allure report
   - ✅ Post PR comment with results
   - ✅ Upload artifacts

4. After merge to `main`:
   - ✅ Report published to GitHub Pages
   - ✅ Available at: `https://<username>.github.io/<repo-name>/`

---

## 📊 Workflow Details

### **Workflow 1: playwright-tests.yml**

#### Triggers
- Pull requests to `main`
- Pushes to `main`
- Manual dispatch

#### Jobs

##### **test** (Runs on all triggers)
1. Checkout code
2. Setup Node.js with cache
3. Install dependencies
4. Install Playwright browsers
5. Run E2E tests
6. Generate Allure report
7. Upload artifacts (results, report, Playwright HTML)
8. Extract test results (passed/failed/skipped)
9. Comment on PR with results

##### **deploy-report** (Runs only on main branch)
1. Download Allure report artifact
2. Setup GitHub Pages
3. Deploy report to Pages
4. Comment PR with report URL (if applicable)

### **Workflow 2: allure-history.yml** (Alternative with History)

#### Features
- ✅ Tracks test history across runs
- ✅ Shows trends and statistics
- ✅ Keeps last 20 reports
- ✅ Simpler setup using community actions

#### Uses
- `simple-elf/allure-report-action` - Generate report with history
- `peaceiris/actions-gh-pages` - Deploy to GitHub Pages

---

## 📁 Artifacts Available

After each test run, these artifacts are available:

| Artifact | Contents | Retention |
|----------|----------|-----------|
| **allure-results** | Raw test data (JSON, screenshots, videos) | 30 days |
| **allure-report** | Static HTML report | 30 days |
| **playwright-report** | Playwright HTML report | 30 days |

**Access artifacts**: Go to Actions → Select workflow run → Scroll to "Artifacts"

---

## 🔗 GitHub Pages URL

After first successful merge to main:

**Report URL**: `https://<your-username>.github.io/<repo-name>/`

**Example**: `https://jameskim.github.io/agentify-hq-nexus/`

---

## 💬 PR Comments

### Test Results Comment
```
🎭 Playwright Test Results

| Status | Count |
|--------|-------|
| ✅ Passed | 15 |
| ❌ Failed | 2 |
| ⏭️ Skipped | 10 |
| 📊 Total | 27 |

📊 Allure Report
The detailed Allure report will be available on GitHub Pages after merge to main.

Artifacts available:
- 📋 Playwright Report
- 📊 Allure Results

🤖 Automated by Playwright + Allure
```

### Report Published Comment (after merge)
```
📊 Allure Report Published!

✅ View the detailed test report: https://username.github.io/repo-name/

Report updated from main branch
```

---

## 🛠️ Customization

### Adjust Test Timeout
Edit `.github/workflows/playwright-tests.yml`:
```yaml
jobs:
  test:
    timeout-minutes: 15  # Change this value
```

### Change Report Retention
```yaml
- name: 📤 Upload Allure report
  uses: actions/upload-artifact@v4
  with:
    retention-days: 30  # Change this value (1-90)
```

### Run Tests on Different Branches
```yaml
on:
  pull_request:
    branches: [main, develop]  # Add more branches
```

### Add Slack/Discord Notifications
```yaml
- name: 📢 Notify Slack
  if: failure()
  uses: slackapi/slack-github-action@v1
  with:
    webhook-url: ${{ secrets.SLACK_WEBHOOK }}
    payload: |
      {
        "text": "❌ E2E tests failed on PR #${{ github.event.number }}"
      }
```

---

## 🐛 Troubleshooting

### Issue: Tests don't run on PR
**Solution**: Check workflow permissions in Settings → Actions → General

### Issue: GitHub Pages not deploying
**Solutions**:
1. Verify Pages is enabled with "GitHub Actions" as source
2. Check workflow has `pages: write` permission
3. Ensure `deploy-report` job runs only on `main` branch

### Issue: PR comments not appearing
**Solutions**:
1. Check `pull-requests: write` permission exists
2. Verify `GITHUB_TOKEN` has required permissions
3. Look for errors in workflow logs

### Issue: Allure report shows 404 on Pages
**Solutions**:
1. Check `allure-report` artifact was uploaded correctly
2. Verify `deploy-report` job completed successfully
3. Wait 1-2 minutes for Pages to propagate
4. Check Pages URL matches: `https://<username>.github.io/<repo>/`

### Issue: Missing test history
**Solution**: Use `allure-history.yml` workflow instead, which preserves history in `gh-pages` branch

---

## 📈 Advanced Features

### Enable Test Sharding (Parallel Execution)
```yaml
strategy:
  matrix:
    shardIndex: [1, 2, 3, 4]
    shardTotal: [4]
steps:
  - run: npx playwright test --shard=${{ matrix.shardIndex }}/${{ matrix.shardTotal }}
```

### Add Test Coverage
```yaml
- name: 📊 Generate coverage
  run: npm run test:coverage

- name: 📤 Upload coverage to Codecov
  uses: codecov/codecov-action@v3
```

### Schedule Nightly Tests
```yaml
on:
  schedule:
    - cron: '0 2 * * *'  # Run at 2 AM UTC daily
```

---

## ✅ Verification Checklist

After setup, verify:

- [ ] Workflow files exist in `.github/workflows/`
- [ ] GitHub Pages enabled with "GitHub Actions" source
- [ ] Workflow permissions set to "Read and write"
- [ ] PR to main triggers test workflow
- [ ] Test results appear as PR comment
- [ ] Artifacts uploaded successfully
- [ ] Report deploys to GitHub Pages after merge
- [ ] Report URL accessible: `https://<username>.github.io/<repo>/`

---

## 📚 Resources

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [GitHub Pages Documentation](https://docs.github.com/en/pages)
- [Playwright CI Documentation](https://playwright.dev/docs/ci)
- [Allure Report Documentation](https://docs.qameta.io/allure/)
- [Allure Report Action](https://github.com/simple-elf/allure-report-action)

---

## 🎯 Summary

✅ Automated E2E testing on every PR
✅ Beautiful Allure reports with history
✅ Published to GitHub Pages (main branch)
✅ PR comments with test results
✅ Artifacts for debugging
✅ Low maintenance, high visibility

**Your CI/CD testing pipeline is ready!** 🚀