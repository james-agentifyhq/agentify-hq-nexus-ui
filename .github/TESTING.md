# 🎭 E2E Testing Quick Reference

## 🚀 Quick Setup (First Time)

### 1. Enable GitHub Pages
**Settings** → **Pages** → **Source**: "GitHub Actions" → **Save**

### 2. Enable Workflow Permissions
**Settings** → **Actions** → **General** → **Workflow permissions**:
- ✅ Read and write permissions
- ✅ Allow GitHub Actions to create and approve pull requests
- Click **Save**

### 3. Push Workflows
```bash
git add .github/workflows/
git commit -m "Add E2E testing workflows"
git push origin main
```

---

## 📊 Report URL (After First Merge)

**Your Allure reports will be available at:**

`https://<your-github-username>.github.io/<repo-name>/`

**Example**: `https://jameskim.github.io/agentify-hq-nexus/`

---

## 🔄 How It Works

### On Pull Request → main
1. ✅ Runs Playwright E2E tests
2. ✅ Generates Allure report
3. ✅ Comments on PR with results
4. ✅ Uploads artifacts for download

### On Merge to main
1. ✅ Deploys Allure report to GitHub Pages
2. ✅ Updates report history (keeps last 20 runs)
3. ✅ Report accessible via public URL

---

## 💬 PR Comment Example

```markdown
🎭 Playwright Test Results

| Status | Count |
|--------|-------|
| ✅ Passed | 15 |
| ❌ Failed | 2 |
| ⏭️ Skipped | 10 |
| 📊 Total | 27 |

📊 Allure Report
Detailed report available after merge to main.
```

---

## 📦 Available Artifacts

After each workflow run:

| Artifact | Contents |
|----------|----------|
| **allure-results** | Test data, screenshots, videos |
| **allure-report** | HTML report |
| **playwright-report** | Playwright HTML report |

**Download**: Actions → Workflow run → Artifacts section

---

## 🛠️ Local Testing

```bash
# Run tests
npm run test:e2e

# View report
npm run test:report
```

---

## ✅ Verification Checklist

- [ ] GitHub Pages enabled
- [ ] Workflow permissions set
- [ ] Workflows pushed to repo
- [ ] Test PR created
- [ ] PR comment appears
- [ ] Tests run successfully
- [ ] Artifacts uploaded
- [ ] Report deployed after merge
- [ ] Report URL accessible

---

## 📚 Full Documentation

- [GitHub Actions Setup Guide](../docs/github-actions-setup.md)
- [Testing Guide](../tests/README.md)
- [Phase 1 PRD](../docs/prd.md)