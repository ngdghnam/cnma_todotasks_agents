# 📦 Deployment Documentation - Consolidated

## 🎯 Single Source of Truth

**For Production Deployments**: Use `/deploy-btp-production`

This project has **ONE authoritative deployment workflow**:

- **[deploy-btp-production.md](workflows/deploy-btp-production.md)** - Complete SAP CAP + TypeScript MTA Build & BTP Deployment
  - Includes all critical fixes for TypeScript, ESM imports, server bootstrap
  - Comprehensive troubleshooting for backend AND frontend issues
  - Battle-tested with real deployment scenarios
  - **Use the slash command**: `/deploy-btp-production`

## ⚡ Quick Reference

For quick lookups during deployment:

- **[DEPLOYMENT_QUICK_REFERENCE.md](DEPLOYMENT_QUICK_REFERENCE.md)** - 3-command deployment + troubleshooting cheat sheet

## 🏗️ Architecture-Specific Guides

- **[mta-deployment-guidelines.md](guidelines/mta-deployment-guidelines.md)** - HTML5 Repository + Work Zone integration (different architecture pattern)

## 📁 Archived Workflows

The following workflows have been archived (outdated or superseded):

- `_archived_deploy-dev.md` - Too simplistic, doesn't include critical fixes
- `_archived_deploy-blue-green.md` - References wrong paths, not updated

---

## 🚀 Recommended Deployment Command

```bash
# The complete, battle-tested deployment flow
/deploy-btp-production
```

This will guide you through:
1. Prerequisites verification
2. Unified build script execution
3. MTA packaging
4. Cloud Foundry deployment
5. Post-deployment verification
6. Troubleshooting (if needed)

---

**Last Updated**: 2026-01-27 (Added frontend/blank page troubleshooting)
