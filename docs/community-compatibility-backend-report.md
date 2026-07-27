# Community Compatibility — Backend Foundation Report

## Summary

Backend-only implementation of the Community Compatibility system. Two database tables, domain types, verification logic, summary aggregation, query layer, and server action — all with strict TypeScript. No UI.

This is the data layer that will power the future question: "Can MY motorcycle charge HERE?"

---

## Migration

### `supabase/migrations/00016_redesign_compatibility.sql`

**Breaking change:** Drops the old `compatibility_reports` table (migration 00007) and its enums (`compatibility_status`, `charge_result`). The old table had a different schema that didn't match the approved architecture. No production data existed.

**Creates:**
- `compatibility_reports` — append-only event log for charging attempts
- `compatibility_summaries` — pre-computed lookup table, composite PK `(vehicle_model_id, location_id)`

**Actions performed:**
1. Drop old indexes, policies, table, and enums
2. Create `compatibility_reports` with outcome/reason split
3. Create `compatibility_summaries` with verification levels
4. Create all indexes (5 on reports, 2 on summaries)
5. Enable RLS and create policies
6. Add GRANT statements for `anon` and `authenticated` roles

---

## Indexes

### `compatibility_reports`

| Index | Columns | Purpose |
|-------|---------|---------|
| `idx_cr_location_model_date` | `(location_id, vehicle_model_id, created_at DESC)` | Reports for a model at a station |
| `idx_cr_user` | `(user_id, created_at DESC)` | User's report history |
| `idx_cr_model_outcome` | `(vehicle_model_id, outcome)` | Failed reports for a model |
| `idx_cr_created` | `(created_at DESC)` | Global feed |
| `idx_cr_no_duplicate` | UNIQUE `(user_id, location_id, vehicle_model_id, (created_at::date))` | **DB-level duplicate prevention** |

### `compatibility_summaries`

| Index | Columns | Purpose |
|-------|---------|---------|
| PK | `(vehicle_model_id, location_id)` | Primary lookup |
| `idx_cs_location` | `(location_id)` | All models at a station |
| `idx_cs_model_verified` | `(vehicle_model_id, verification_level DESC)` | Compatible stations for a model |

---

## Constraints

| Table | Constraint | Description |
|-------|-----------|-------------|
| `compatibility_reports` | `outcome IN ('success','failed')` | Only two outcomes |
| `compatibility_reports` | `reason IN (6 values)` | Structured failure reasons |
| `compatibility_reports` | `battery_before_pct BETWEEN 0 AND 100` | Valid battery percentage |
| `compatibility_reports` | `battery_after_pct BETWEEN 0 AND 100` | Valid battery percentage |
| `compatibility_reports` | Unique index on `(user, location, model, date)` | One report per day per combination |
| `compatibility_summaries` | `total_reports >= 0` | Non-negative counts |
| `compatibility_summaries` | `verification_level BETWEEN 0 AND 4` | Valid verification levels |

---

## Server Actions

### `createCompatibilityReport(prevState, formData)`

Location: `src/features/compatibility/actions/compatibility-actions.ts`

Flow:
1. Auth check — requires login
2. Zod validation — validates all fields
3. "Other" model block — queries `vehicle_models` to check brand !== 'Other'
4. Insert report — into `compatibility_reports`
5. Duplicate handling — catches PostgreSQL error `23505` from unique index
6. Summary update — calls `updateCompatibilitySummary()` to UPSERT
7. Revalidate — `revalidatePath('/stations/{id}')`

---

## Queries

Location: `src/features/compatibility/actions/queries.ts`

| Function | Returns | Use Case |
|----------|---------|----------|
| `getCompatibilityReportsByLocation(locationId, options?)` | `CompatibilityReportWithDetails[]` | Station detail — all reports with reporter/model info |
| `getUserCompatibilityReports(userId)` | Reports with station/model info | User profile — "my reports" |
| `getCompatibilitySummaryByLocation(locationId)` | `CompatibilitySummaryWithModel[]` | Station detail — compatibility overview |
| `getCompatibilitySummaryByModel(vehicleModelId)` | `CompatibilitySummaryWithStation[]` | "Compatible stations for my bike" |
| `getCompatibilitySummaryForPair(vehicleModelId, locationId)` | `CompatibilitySummaryRow \| null` | Single pair lookup |

All queries:
- Join related tables for display data (reporter name, model brand/name, station name)
- Support pagination where appropriate
- Return strictly typed results via mapping functions
- Use `as any` on Supabase `.from()` calls (existing codebase pattern)

---

## Type Definitions

### Domain types: `src/features/compatibility/types.ts`

| Type | Values |
|------|--------|
| `ReportOutcome` | `'success' \| 'failed'` |
| `ReportReason` | `'incompatible_connector' \| 'station_offline' \| 'power_limit' \| 'adapter_required' \| 'unknown' \| 'other'` |
| `VerificationLevel` | `0 \| 1 \| 2 \| 3 \| 4` |

Constants: `REPORT_OUTCOMES`, `REPORT_REASONS`, `VERIFICATION_LEVELS`, `VERIFICATION_LABEL` (Thai), `STALE_THRESHOLD_MONTHS` (6)

Row interfaces: `CompatibilityReportRow`, `CompatibilitySummaryRow`

Extended interfaces: `CompatibilityReportWithDetails`, `CompatibilitySummaryWithModel`, `CompatibilitySummaryWithStation`

### Shared types updated:
- `src/types/database.ts` — new `compatibility_reports` schema + `compatibility_summaries` table + new enums
- `src/types/enums.ts` — `ReportOutcome`, `ReportReason` (replaced `CompatibilityStatus`, `ChargeResult`)
- `src/types/entities.ts` — added `CompatibilitySummary`, `CompatibilitySummaryInsert`, `CompatibilitySummaryUpdate`

---

## Technical Decisions

| Decision | Rationale |
|----------|-----------|
| DROP + recreate `compatibility_reports` | Old schema (migration 00007) used different enums and columns. No production data. Clean break is safer than ALTER. |
| TEXT with CHECK instead of PostgreSQL enums | Easier to extend (no `ALTER TYPE`). Matches architecture recommendation. Departure from existing enum pattern — acknowledged. |
| Nullable columns instead of JSONB | `charging_speed_kw`, `charge_duration_min`, `battery_*_pct` as proper columns. Queryable, indexable, zero cost when NULL. Follows critique improvement #3. |
| Simple aggregate for summary UPSERT | Reads all reports for the (model, station) pair on each update. O(N) per pair but acceptable at current scale. User explicitly deferred optimization. |
| `as any` on Supabase `.from()` | Matches existing codebase pattern. The `Database` type is hand-maintained and these tables aren't in the auto-generated types. |
| GRANT statements in migration | Previous migrations didn't include GRANTs (applied manually). This migration includes them to prevent the known gotcha where RLS policies pass but queries fail silently. |
| Verification `STALE` as level 4 | Stored as a distinct level rather than a computed overlay. Simplifies queries (`WHERE verification_level < 4`) but requires periodic re-evaluation job for stale detection. |

---

## Known Limitations

1. **Summary update is synchronous** — Happens in the same request as report creation. At high concurrency on popular (model, station) pairs, this could cause lock contention. Deferred per user instructions.

2. **`unique_reporters` uses COUNT DISTINCT** — The summary UPSERT fetches all reports and counts unique user_ids in application code. This is O(N) per update. A junction table (`summary_reporters`) would be O(1) but adds complexity. Deferred.

3. **Stale detection is passive** — Verification level is only recalculated when a new report is submitted. A station with no new reports for 6 months won't be downgraded to STALE until someone submits a new report for a different model at the same station. A periodic background job is needed.

4. **No cross-model inference** — A station verified for Honda EM1 doesn't inform Honda CUV compatibility, even though they share the same connector type. The `vehicle_models.connector_type_id` FK exists but isn't used yet.

5. **Old RLS policies dropped** — Migration 00016 drops and recreates RLS policies for `compatibility_reports`. The original policies from 00014 are now stale SQL. This is safe but means 00014 no longer represents the live state.

6. **No DELETE action** — Users cannot delete their own reports. The table supports it via RLS (CASCADE on user delete), but there's no server action for voluntary deletion. Can be added when needed.

---

## Next Recommended Phase

### Phase 6B: Compatibility UI

Build the frontend on top of this backend:

1. **Station detail page** — Compatibility summary section showing verified models with badges
2. **Report form** — Dialog/sheet for submitting a compatibility report (outcome, reason, details)
3. **User profile** — "My compatibility reports" tab
4. **Map integration** — Color-coded markers based on compatibility with user's selected motorcycle
5. **Station list** — Filter/sort by compatibility with user's motorcycle

All queries and server actions are ready. The UI phase is purely presentational.
