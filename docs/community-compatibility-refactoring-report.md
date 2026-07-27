# Community Compatibility — Refactoring Report

## Summary

Pre-merge architecture refactoring. No features added, no behavior changed. The compatibility feature now follows a clean layered architecture with zero `as any` casts.

---

## Root Cause Fix: `Relationships: []`

The entire codebase's `as any` problem traced to a single root cause: the hand-maintained `Database` type in `src/types/database.ts` was missing the `Relationships` property required by Supabase's `GenericTable` type.

**Before:** Each table had `Row`, `Insert`, `Update` — but no `Relationships`. Supabase SDK v2.110.8 requires `Relationships: GenericRelationship[]` on every table. Without it, `.from()` resolved mutation types to `never`, forcing `as any` on every `.from()` call.

**Fix:** Added `Relationships: []` to all 14 tables in `database.ts`. This unlocks proper type inference for `.from().insert()`, `.from().upsert()`, `.from().select()`, etc. — codebase-wide.

---

## Layered Architecture

### Dependency Flow

```
UI → Server Action → Service → Repository → Supabase
                   ↘ Zod         ↘ Calculator
                                 ↘ Validator
                                 ↘ Verification
```

### Layer Responsibilities

| Layer | File | Responsibility |
|-------|------|---------------|
| **Action** | `actions/compatibility-actions.ts` | Auth check, FormData parsing, Zod validation, revalidatePath. No business logic. |
| **Service** | `services/compatibility-service.ts` | Business orchestration: validate → insert → recompute summary. |
| **Repository** | `repositories/compatibility-repository.ts` | All Supabase queries. Typed result mapping. Zero `as any`. |
| **Calculator** | `lib/summary-calculator.ts` | Pure function: report array → summary stats. |
| **Validator** | `lib/report-validator.ts` | Pure function: business rule checks (e.g., block "Other" model). |
| **Verification** | `lib/verification.ts` | Pure function: summary stats → verification level. Unchanged. |

---

## Files Changed

### New files (4)

| File | Purpose |
|------|---------|
| `src/features/compatibility/repositories/compatibility-repository.ts` | Data access layer — all Supabase calls with typed results |
| `src/features/compatibility/lib/summary-calculator.ts` | Pure summary computation from report arrays |
| `src/features/compatibility/lib/report-validator.ts` | Business rule validation (model check, duplicate detection) |
| `src/features/compatibility/services/compatibility-service.ts` | Business logic orchestration |

### Modified files (3)

| File | Change |
|------|--------|
| `src/features/compatibility/actions/compatibility-actions.ts` | Stripped to thin orchestrator — auth + FormData + Zod + delegate |
| `src/features/compatibility/actions/queries.ts` | Stripped to thin delegates — create client + call repository |
| `src/types/database.ts` | Added `Relationships: []` to all 14 tables |

### Deleted files (1)

| File | Reason |
|------|--------|
| `src/features/compatibility/lib/summary.ts` | Replaced by repository (DB calls) + calculator (computation) + service (orchestration) |

---

## `as any` Elimination

### Before (6 instances)

```
compatibility-actions.ts:  (supabase.from('vehicle_models') as any)
compatibility-actions.ts:  (supabase.from('compatibility_reports') as any)
queries.ts:                (supabase.from('compatibility_reports') as any)  × 2
queries.ts:                (supabase.from('compatibility_summaries') as any) × 2
summary.ts:                (supabase.from('compatibility_reports') as any)
summary.ts:                (supabase.from('compatibility_summaries') as any)
```

### After (0 instances)

All `.from()` calls are now properly typed via `SupabaseClient<Database>`.

For join queries (`.select('*, profiles!...(full_name)')`) where Supabase can't infer the joined fields, targeted `as unknown as T` casts are used at the data level with explicitly defined result types — never on the `.from()` call itself.

---

## What Each Layer Does

### Server Action (compatibility-actions.ts)

```
1. Create Supabase client
2. Check auth (getUser)
3. Parse FormData → raw object
4. Zod validate
5. Call service.submitCompatibilityReport(supabase, input, userId)
6. revalidatePath on success
7. Return ActionResult
```

Business logic removed: vehicle model lookup, "Other" check, report insert, duplicate handling, summary update — all moved to service.

### Service (compatibility-service.ts)

```
submitCompatibilityReport(supabase, input, userId):
  1. repo.getVehicleModel() → validateVehicleModel()
  2. repo.insertReport() → isDuplicateReportError()
  3. repo.getReportAggregates() → computeFullSummary() → repo.upsertSummary()
```

### Repository (compatibility-repository.ts)

Exports 9 functions:
- `insertReport`, `getReportsByLocation`, `getReportsByUser`, `getReportAggregates`
- `upsertSummary`, `getSummariesByLocation`, `getSummariesByModel`, `getSummaryForPair`
- `getVehicleModel`

Each function takes `SupabaseClient<Database>` as first parameter. No business logic.

### Calculator (summary-calculator.ts)

Two pure functions:
- `computeSummaryStats(reports)` → `SummaryStats`
- `computeFullSummary(reports)` → `ComputedSummary` (includes verification level)

### Validator (report-validator.ts)

Two pure functions:
- `validateVehicleModel(model)` → error message or null
- `isDuplicateReportError(error)` → boolean

---

## Codebase Impact

Adding `Relationships: []` to `database.ts` enables removing `as any` from `.from()` calls across the **entire codebase** — not just the compatibility feature. Other features (stations, reviews, motorcycle) still use `as any` but can now be incrementally cleaned up using the same pattern demonstrated here.

---

## Verification

- `npm run build` passes with zero TypeScript errors
- Zero `as any` instances in `src/features/compatibility/`
- All existing query signatures preserved (no breaking changes for future UI consumers)
- All business logic moved out of server action into service layer
