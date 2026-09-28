# SAP BTP Deployment - Quick Reference

## 🚀 Standard Deployment (3 Commands)

```bash
# 1. Build with all fixes
node scripts/build-unified.js

# 2. Package MTAR
mbt build

# 3. Deploy
cf deploy mta_archives/flexible-request-management_1.0.0.mtar
```

**Total Time**: ~10-15 minutes

---

## ✅ Pre-Flight Checklist

Before deploying, verify:

```bash
# Tools installed?
node --version  # >= 18
cf --version
mbt --version

# Logged in to CF?
cf target

# Dependencies installed?
npm list @sap/cds @cap-js/hana typescript
```

---

## 🔍 Build Verification

After `node scripts/build-unified.js`, verify:

```bash
# .js files exist (should output: 4)
ls -la gen/srv/srv/*.js | wc -l

# No .ts files (should output: 0)
find gen/srv/srv -name "*.ts" -type f | wc -l

# ESM imports injected
grep "#cds-models" gen/srv/package.json

# csn.json uses .js
grep "@impl" gen/srv/srv/csn.json
```

**All checks must pass** before running `mbt build`.

---

## 🔧 Common Issues & Quick Fixes

| Error | Quick Fix |
|:------|:----------|
| `MODULE_NOT_FOUND: #cds-models` | Re-run `node scripts/build-unified.js` |
| `Failed loading .../request-service.ts` | Re-run `node scripts/build-unified.js` |
| `Cannot find module .../request-service.js` | Re-run `node scripts/build-unified.js` |
| `TypeError: server is not a function` | Already fixed in `srv/server.ts` |
| `Exit status 137` (OOM) | Already fixed in `mta.yaml` (512M) |
| `Operation already in progress` | Type `y` when prompted to abort |
| **Blank page / UI not loading** | **See Frontend Troubleshooting below** |

---

## 🎨 Frontend / Blank Page Troubleshooting

If the AppRouter loads but shows a **blank page**, check these **three critical configurations**:

### Issue 1: React Router Missing basename

**Symptom**: Blank page, no console errors, all assets load (200 OK)

**Root Cause**: React Router doesn't know the base path when deployed behind AppRouter

**Fix**:
```tsx
// app/request-management/src/App.tsx
<BrowserRouter basename="/">  {/* Add this prop */}
  <Routes>
    {/* your routes */}
  </Routes>
</BrowserRouter>
```

### Issue 2: Missing Production Authentication

**Symptom**: Blank page after XSUAA login, React app never renders

**Root Cause**: AuthProvider only has dev mode implementation, can't fetch user in production

**Fix**:
```tsx
// app/request-management/src/lib/auth-context.tsx
// Add production user fetching

const [isLoading, setIsLoading] = useState(!isDevMode);
const [productionUser, setProductionUser] = useState<any>(null);

useEffect(() => {
    if (!isDevMode) {
        fetch('/identity/me', {
            headers: { 'Content-Type': 'application/json' }
        })
        .then(res => res.json())
        .then(user => {
            setProductionUser(user);
            setIsLoading(false);
        })
        .catch(err => {
            console.error('Failed to fetch user identity:', err);
            setIsLoading(false);
        });
    }
}, [isDevMode]);

// Don't render until user data is loaded
if (!isDevMode && isLoading) return null;
```

**Verify**: Backend must have `/identity/me` endpoint that returns current user

### Issue 3: AppRouter welcomeFile Misconfiguration

**Symptom**: Console warning "No routes matched location '/index.html'"

**Root Cause**: welcomeFile directive redirects to /index.html, but React routes are /, /requests, etc.

**Fix**:
```json
// approuter/xs-app.json
{
  // Remove this line:
  // "welcomeFile": "/index.html",
  
  "authenticationMethod": "route",
  "sessionTimeout": 30,
  "routes": [
    // ... your routes
  ]
}
```

**Why**: For SPAs, the catch-all route serves index.html without URL redirect

### After Fixing: Rebuild & Deploy

```bash
# 1. Rebuild UI
cd app/request-management && npx vite build && cd ../..

# 2. Rebuild MTA
mbt build

# 3. Redeploy
cf deploy mta_archives/flexible-request-management_1.0.0.mtar
```

---

## 📊 Monitoring Deployment

```bash
# Terminal 1: Deploy
cf deploy mta_archives/*.mtar

# Terminal 2: Watch logs
cf logs flexible-request-management-srv
```

**Success Indicators**:
```
server listening on { url: 'http://localhost:8080' }
```

**Failure Indicators**:
```
ERR_MODULE_NOT_FOUND
ERR Exit status 137
```

---

## 🆘 Emergency Rollback

```bash
# Quick rollback to previous version
cf deploy mta_archives/flexible-request-management_<old-version>.mtar

# Nuclear option (deletes ALL data)
cf undeploy flexible-request-management --delete-services -f
```

---

## 📋 Post-Deployment Checks

```bash
# Application running?
cf app flexible-request-management-srv
# Look for: "state: running" and "instances: 1/1"

# No crashes?
cf logs flexible-request-management-srv --recent | grep ERR

# Get AppRouter URL
cf app flexible-request-management-approuter | grep routes
```

---

## 🎯 Critical Build Order

**NEVER** run these manually:
```bash
# ❌ WRONG
npx tsc
node scripts/build-unified.js

# ❌ WRONG
npx cds build --production
mbt build
```

**ALWAYS** use:
```bash
# ✅ CORRECT
node scripts/build-unified.js  # Handles everything
mbt build                       # Package only
```

---

## 📞 For Full Details

See comprehensive workflow:
```bash
# View the full deployment workflow
cat .agent/workflows/deploy-btp-production.md
```

Or use the slash command:
```
/deploy-btp-production
```

---

## 🔗 Related Commands

```bash
# Restart app
cf restart flexible-request-management-srv

# Check service bindings
cf env flexible-request-management-srv

# View all apps
cf apps

# View all services
cf services

# Download operation logs
cf dmol -i <operation-id>
```
