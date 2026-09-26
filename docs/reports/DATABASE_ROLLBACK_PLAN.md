# Database Rollback Plan: PostgreSQL to Turso Cloud / SQLite Baseline

> **Project:** SIH Dr. B. R. Ambedkar Digital Heritage Archive  
> **Classification:** Operational Resilience & Disaster Recovery  
> **Status:** APPROVED & VERIFIED  
> **Rollback Target:** Turso Cloud (`libsql://...`) or Local SQLite Baseline (`storage/archive.db`)

---

## 1. Overview & Rollback Triggers

This document establishes the official emergency rollback procedure to restore the database layer from Local PostgreSQL 18 back to the pre-migration baseline.

### 1.1 Trigger Criteria
A rollback must be initiated if any of the following occur:
1. **Unresolvable Database Driver Failures:** Native PostgreSQL connection pooling failure that cannot be remediated during live judging.
2. **Data Inconsistency:** Inability to retrieve archival volumes, entities, or search indices during presentation.
3. **Environment Constraint:** Target host lacks administrative permissions to run local PostgreSQL service.
4. **Cloud Database Quota Reset:** Turso quota resets or team decides to return to Turso cloud infrastructure.

---

## 2. Preserved Baseline Artifacts

All baseline assets were preserved prior to migration in the immutable backup directory:
`c:\dr ambedkar\turso_migration_backup\`

| Asset Path | Type | Purpose | Size / Rows |
|:---|:---|:---|:---|
| [`archive_turso_baseline.db`](file:///c:/dr%20ambedkar/turso_migration_backup/archive_turso_baseline.db) | SQLite 3 Database | Complete binary SQLite copy of baseline | Pristine binary |
| [`dump_turso_baseline.sql`](file:///c:/dr%20ambedkar/turso_migration_backup/dump_turso_baseline.sql) | SQL Dump | Complete DDL + DML SQL export | 52 tables |
| [`tables/*.json`](file:///c:/dr%20ambedkar/turso_migration_backup/tables/) | JSON Dumps | 52 individual table JSON dumps | 52 tables |
| [`vector_cache.npz`](file:///c:/dr%20ambedkar/turso_migration_backup/vector_cache.npz) | NumPy Vector Cache | 12,154 chunk embeddings (1024-dim Qwen3) | ~49 MB |
| [`multilingual_books_writings_manifest.json`](file:///c:/dr%20ambedkar/turso_migration_backup/multilingual_books_writings_manifest.json) | JSON Manifest | 112 multilingual volume manifests | 112 works |
| [`backup_metadata.json`](file:///c:/dr%20ambedkar/turso_migration_backup/backup_metadata.json) | JSON Metadata | Cryptographic hashes & verification manifest | Baseline audit |

---

## 3. Rollback Procedure: Option A (Immediate Local SQLite Fallback)

If PostgreSQL fails locally and instant offline capability is needed without network dependency:

### Step 1: Stop Local Backend Service
```powershell
# Terminate running backend process on port 8000
Get-Process -Id (Get-NetTCPConnection -LocalPort 8000).OwningProcess -ErrorAction SilentlyContinue | Stop-Process -Force
```

### Step 2: Restore SQLite Archive Database
```powershell
Copy-Item "c:\dr ambedkar\turso_migration_backup\archive_turso_baseline.db" "c:\dr ambedkar\backend\storage\archive.db" -Force
```

### Step 3: Switch Backend Configuration to SQLite
In [`backend/.env`](file:///c:/dr%20ambedkar/backend/.env), update the database configuration:
```env
# Switch from PostgreSQL back to SQLite
DATABASE_URL=sqlite:///./storage/archive.db
TURSO_DATABASE_URL=
TURSO_AUTH_TOKEN=
```

### Step 4: Restart Backend Service
```powershell
cd "c:\dr ambedkar\backend"
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```

---

## 4. Rollback Procedure: Option B (Turso Cloud Restoration)

If restoring to Turso Cloud with a new or active database instance:

### Step 1: Restore Schema and Data to Turso
Using the Turso CLI:
```bash
# Create new clean Turso database
turso db create ambedkar-archive-restored

# Restore baseline dump
turso db shell ambedkar-archive-restored < "c:/dr ambedkar/turso_migration_backup/dump_turso_baseline.sql"

# Generate fresh access token
turso db tokens create ambedkar-archive-restored
```

### Step 2: Update Backend Configuration
In [`backend/.env`](file:///c:/dr%20ambedkar/backend/.env):
```env
DATABASE_URL=libsql://ambedkar-archive-restored-<org>.turso.io
TURSO_DATABASE_URL=libsql://ambedkar-archive-restored-<org>.turso.io
TURSO_AUTH_TOKEN=<TURSO_RESTORED_AUTH_TOKEN>
```

### Step 3: Restart Backend and Verify
```powershell
cd "c:\dr ambedkar\backend"
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000
```

---

## 5. Git Branch Rollback (Code Revert)

If any code changes in the `sih-postgres-migration` branch need to be reverted:

```powershell
cd "c:\dr ambedkar"
git checkout checkpoint-before-turso-postgres-migration
```

---

## 6. Post-Rollback Validation Checklist

After executing rollback, verify the following endpoints:
- [ ] `GET http://127.0.0.1:8000/api/v1/health` returns `{"status": "ok"}`
- [ ] `GET http://127.0.0.1:8000/api/v1/documents` returns 19 archival objects
- [ ] `GET http://127.0.0.1:8000/api/v1/graph/entities/person-ambedkar/neighbors` returns graph connections
- [ ] `GET http://127.0.0.1:8000/api/v1/timeline` returns timeline events
- [ ] `GET http://127.0.0.1:8000/api/v1/search?q=constitution` returns search hits
