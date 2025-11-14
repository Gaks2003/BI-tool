# Enterprise Features Setup Guide

## ✅ Implemented Features

### 1. Database Connectors
**Files**: `src/lib/dbConnectors.ts`, `api/db/route.ts`

**Setup**:
```bash
npm install mysql2 pg mongodb
```

**Usage**:
```typescript
import { executeQuery } from './lib/dbConnectors'
const data = await executeQuery(connId, 'SELECT * FROM users')
```

### 2. Real-time Collaboration
**Files**: `src/lib/realtime.ts`

**Setup**: Already configured with Supabase Realtime

**Usage**:
```typescript
import { subscribeToVisualizationChanges } from './lib/realtime'
subscribeToVisualizationChanges(dashboardId, (payload) => {
  console.log('Change detected:', payload)
})
```

### 3. Role-Based Access Control (RBAC)
**Files**: `src/lib/rbac.ts`, `src/contexts/RBACContext.tsx`, `database-rbac.sql`

**Setup**:
1. Run `database-rbac.sql` in Supabase
2. Wrap app with RBACProvider
3. Use `useRBAC()` hook

**Usage**:
```typescript
const { can } = useRBAC()
if (can('dashboard.create')) {
  // Show create button
}
```

### 4. SSO Integration
**Files**: `src/lib/sso.ts`

**Setup**:
1. Enable OAuth providers in Supabase Dashboard
2. Configure redirect URLs

**Usage**:
```typescript
import { signInWithGoogle } from './lib/sso'
await signInWithGoogle()
```

### 5. Geographic Maps
**Files**: `src/components/charts/MapChart.tsx`

**Setup**:
```bash
npm install react-simple-maps
```

**Usage**: Add 'map' chart type to visualizations

### 6. REST API
**Files**: `api/rest/dashboards/route.ts`

**Setup**: Deploy API routes to Vercel/Netlify

**Usage**:
```bash
curl -H "X-API-Key: your-key" https://your-app.com/api/dashboards
```

### 7. Webhooks
**Files**: `api/webhooks/route.ts`

**Setup**: Run `database-rbac.sql` to create webhooks table

**Usage**: Configure webhooks in UI to receive events

### 8. Web Workers
**Files**: `src/workers/dataProcessor.worker.ts`

**Usage**:
```typescript
const worker = new Worker(new URL('./workers/dataProcessor.worker.ts', import.meta.url))
worker.postMessage({ type: 'aggregate', data: { rows, groupBy, metric, operation } })
```

### 9. Caching
**Files**: `src/lib/cache.ts`

**Usage**:
```typescript
import { getCached, setCache } from './lib/cache'
const data = getCached('key') || await fetchData()
setCache('key', data)
```

## 🚀 Deployment

### Backend API (Required for DB Connectors)
Deploy `api/` folder to:
- Vercel
- Netlify Functions
- AWS Lambda

### Environment Variables
```env
VITE_SUPABASE_URL=your_url
VITE_SUPABASE_ANON_KEY=your_key
DATABASE_URL=postgresql://...
REDIS_URL=redis://...
```

## 📱 Mobile Apps (Not Implemented)
Requires React Native or Flutter implementation.

## 🔒 Security Notes
- API keys stored encrypted
- Database credentials never exposed to client
- RBAC enforced at database level
- All API routes require authentication
