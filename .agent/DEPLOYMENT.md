# 📦 Deployment Documentation

## 🎯 Single Source of Truth

**Use `/deploy-btp-production` for all production deployments**

### Primary Workflow
- **[deploy-btp-production.md](workflows/deploy-btp-production.md)** - Complete battle-tested deployment guide
  - ✅ All TypeScript/ESM fixes included
  - ✅ **Frontend blank page troubleshooting** (new!)
  - ✅ Production authentication setup
  - ✅ AppRouter configuration
  - ✅ Comprehensive error resolution
  
### Quick Reference
- **[DEPLOYMENT_QUICK_REFERENCE.md](DEPLOYMENT_QUICK_REFERENCE.md)** - 3-command cheat sheet

### Specialized Guides
- **[mta-deployment-guidelines.md](guidelines/mta-deployment-guidelines.md)** - HTML5 Repository + Work Zone setup

---

## 🚀 Standard Deployment (3 Commands)

```bash
# 1. Build with all fixes
node scripts/build-unified.js

# 2. Package MTAR
mbt build

# 3. Deploy
cf deploy mta_archives/flexible-request-management_1.0.0.mtar
```

## 🎨 If You Get a Blank Page

See the **Frontend Troubleshooting** section in both documentation files for the complete fix involving:
1. React Router `basename="/"` prop
2. Production AuthProvider implementation
3. AppRouter `welcomeFile` removal

---

**Last Updated**: 2026-01-27
**Status**: ✅ Consolidated and verified
