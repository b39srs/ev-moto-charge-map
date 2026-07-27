# Community Compatibility Architecture — Self-Critique

## Context

Assumptions: 3 years in production, 300,000 users, 5 million reports, 20 brands, 800 models.

---

## Weakness 1: Summary UPSERT Becomes a Hot Row Bottleneck

**Why it breaks:**
With 800 models and popular stations (e.g., PTT stations in Bangkok), the row `(Thunder, PTT_Bangna)` gets hit by hundreds of concurrent UPSERTs. PostgreSQL row-level locks serialize these writes. At peak hours with 300K active users, popular (model, station) pairs become lock contention hotspots. The "same transaction" guarantee that makes reads consistent is exactly what causes write throughput collapse.

**Impact:** Write latency spikes to seconds during peak. Report submission feels slow. Users abandon.

**Better alternative:** Decouple report insertion from summary updates. INSERT reports immediately (fast, no contention). Process summary updates asynchronously via a Supabase Database Webhook or a lightweight queue. Accept 1-5 second staleness in summaries. The user doesn't need to see their report reflected in the verification badge instantly — they need confirmation that their report was saved.

---

## Weakness 2: `unique_reporters` Is Uncomputable at Write Time

**Why it breaks:**
To update `unique_reporters` on each INSERT, you must either:
- `COUNT(DISTINCT user_id) FROM compatibility_reports WHERE model=X AND station=Y` — full scan, O(N) per write
- `EXISTS` check + conditional increment — race condition under concurrency (two first-time reporters both see "not exists", both increment by 1, result is correct by luck but not by guarantee)

At 5M reports, the COUNT DISTINCT approach on a hot pair with 500 reports takes measurable time per write.

**Impact:** Either incorrect `unique_reporters` counts (undermining verification levels) or slow writes.

**Better alternative:** Maintain a junction table `summary_reporters(vehicle_model_id, station_id, user_id)` with a UNIQUE constraint. INSERT ON CONFLICT DO NOTHING. Then `unique_reporters = (SELECT count(*) FROM summary_reporters WHERE ...)`. The UNIQUE constraint prevents double-counting at the database level, regardless of concurrency. Or even simpler: don't track it in the summary at all — compute it lazily only when displaying the verification badge (cache with short TTL).

---

## Weakness 3: `metadata` JSONB Is a Query Graveyard

**Why it breaks:**
The design puts `charging_speed_kw`, `battery_before_pct`, `charge_duration_min` in JSONB to "avoid migrations." After 3 years and 5M reports, the product team asks: "What's the average charging speed for Thunder across all stations?" This requires a full table scan extracting JSONB keys from 5M rows. No index helps. The "promote to column when needed" escape hatch requires a migration on a 5M-row table — exactly what JSONB was supposed to avoid.

**Impact:** Analytics queries take minutes. Product decisions are blocked. Data science team builds a separate ETL pipeline just to query what should be a column.

**Better alternative:** Add the 4-5 most predictable fields as nullable columns from day one: `charging_speed_kw NUMERIC`, `charge_duration_min INTEGER`, `battery_before_pct SMALLINT`, `battery_after_pct SMALLINT`, `adapter_used BOOLEAN`. Keep JSONB only for truly unpredictable future fields. Nullable columns cost zero storage when NULL. The migration-avoidance argument is false economy — adding a nullable column to a table is nearly instant in PostgreSQL 11+ (it's a metadata-only change, no table rewrite).

---

## Weakness 4: No Temporal Decay Makes Verification a Lie

**Why it breaks:**
A station verified 2 years ago by 10 users shows "Highly Verified." But the station replaced its chargers 6 months ago. No new reports since. The badge says "Highly Verified" — the reality is "unknown." The user trusts the badge, drives 50km, can't charge. Trust in the entire platform collapses.

With 5M reports over 3 years, the majority of reports are stale. `last_success_at` exists but verification_level ignores it.

**Impact:** Platform credibility erodes. The core promise ("Can MY motorcycle charge HERE?") becomes unreliable. Users switch to Facebook groups.

**Better alternative:** Verification level must incorporate recency. Proposed formula:

| Level | Criteria |
|-------|----------|
| 0 - No Data | No reports |
| 1 - Single Report | 1 report within last 12 months |
| 2 - Community Verified | 2+ reporters within last 6 months, success_count >= 2 |
| 3 - Highly Verified | 5+ reporters within last 6 months, success_rate >= 80% |
| **Stale** | **Was level 2-3 but no reports in last 6 months** |

Add `reports_last_6m`, `reporters_last_6m` columns to summaries. Run a daily job that re-evaluates and downgrades stale verifications. Display "Stale" distinctly in UI — "Verified 8 months ago, unconfirmed since."

---

## Weakness 5: The `status` Enum Conflates Compatibility with Station Health

**Why it breaks:**
`status = 'failed'` could mean:
- Connector physically doesn't fit (compatibility issue — permanent)
- Station was broken that day (station issue — temporary)
- User's motorcycle battery was full (user error — irrelevant)
- Power output too low (partial compatibility — nuanced)

All four are stored as `'failed'`. The summary counts them the same. A station with 3 "failed" reports (all because it was temporarily offline) shows as "incompatible" for that model. This is wrong.

At 5M reports, misclassified failures corrupt summaries at scale.

**Impact:** False negatives. Stations incorrectly marked as incompatible. Users avoid working stations.

**Better alternative:** Split `status` into two dimensions:

- `outcome`: `'charged'` | `'not_charged'` (objective fact)
- `reason` (when not_charged): `'incompatible_connector'` | `'station_offline'` | `'power_insufficient'` | `'adapter_needed'` | `'unknown'` | `'other'`

Summaries should only count `incompatible_connector` as a compatibility failure. `station_offline` reports should not affect compatibility scoring — they belong to a station health metric.

---

## Weakness 6: No Duplicate/Spam Prevention at Database Level

**Why it breaks:**
The design says "application-level rate limiting, one report per user per station per day." Application-level means:
- A bug in the rate limiting code allows duplicates
- A direct API call bypasses the check
- A race condition in concurrent submissions slips through
- A malicious actor submits from multiple sessions

After 3 years, 5-15% of 5M reports could be duplicates or spam. Summaries are inflated. Verification levels are artificially high.

**Impact:** Data integrity degrades silently. Verification becomes meaningless. Cleanup requires scanning all 5M reports.

**Better alternative:** Add a unique partial index:

```
UNIQUE (user_id, station_id, vehicle_model_id, DATE(created_at))
```

This enforces one report per user per model per station per day at the database level. Application rate limiting becomes a UX feature (show friendly message), not a data integrity mechanism. The database is the last line of defense.

---

## Weakness 7: Summary Table Grows Multiplicatively and Never Shrinks

**Why it breaks:**
Summary rows = models × stations with at least one report. With 800 models and 50,000 stations, the theoretical maximum is 40M rows. In practice, coverage is sparse initially, but after 3 years with 5M reports, summaries could reach 2-5M rows. Many of these are stale (1 report from 2 years ago). The table never garbage-collects.

The daily recomputation job scans 5M reports to verify 2-5M summary rows. At this scale, it takes 30-60 minutes and consumes significant IOPS.

**Impact:** Recomputation job becomes a nightly maintenance burden. Summary table bloat slows index scans.

**Better alternative:** Add a `is_stale BOOLEAN DEFAULT FALSE` column. The daily job only recomputes stale summaries (flagged when reports are added/deleted). Additionally, DELETE summary rows where `total_reports = 0` or `last_report_at < NOW() - INTERVAL '2 years'`. This bounds the table size to active (model, station) pairs only.

---

## Weakness 8: No Cross-Model Inference Mechanism

**Why it breaks:**
Honda EM1 e: and Honda CUV e: use the same connector type and similar charging specs. If EM1 has 50 reports at Station X (all success), CUV likely works too. But the design treats them as completely independent. CUV shows "No Data" at Station X until someone with a CUV physically goes there and reports.

With 800 models, many share connector types. The cold-start problem per model is severe — a new model added in year 3 starts from zero everywhere, despite being electrically identical to an existing model.

**Impact:** New models always show "No Data" everywhere. Users of less popular models get no value from the platform. 80% of the 800 models may never reach "Community Verified" at most stations.

**Better alternative:** Add a `connector_type_id` FK to `vehicle_models` (which connector this model uses). Create a secondary inference layer:

- **Direct compatibility**: Reports exist for THIS model at THIS station → show verification level
- **Inferred compatibility**: No reports for this model, but 5+ success reports from OTHER models with the same connector type → show "Likely Compatible (based on similar models)"

This is a read-side computation, not a schema change to reports. It dramatically reduces cold-start for new models.

---

## Weakness 9: GDPR/Account Deletion Cascades Are Catastrophic

**Why it breaks:**
A power user with 2,000 reports across 500 stations deletes their account. GDPR requires removing all their data. This means:
1. DELETE 2,000 rows from `compatibility_reports`
2. Recompute `compatibility_summaries` for every affected (model, station) pair
3. Recalculate `unique_reporters` for each — requires COUNT DISTINCT on remaining reports
4. Recalculate `verification_level` — some stations may drop from "Highly Verified" to "Single Report"

Steps 2-4 touch potentially 500+ summary rows, each requiring a sub-query. Under load, this is a multi-second transaction that locks hot rows.

At scale with 300K users, even 0.1% annual deletion rate = 300 deletions/year = potentially 100K+ summary recalculations.

**Impact:** Account deletion becomes a heavy background job. If done synchronously, it times out. If async, summaries are temporarily wrong.

**Better alternative:** Anonymize instead of delete. Replace `user_id` with a sentinel value (`00000000-...`) and clear `notes`. The report data (status, model, station) remains for aggregate statistics but is no longer personally identifiable. This satisfies GDPR's "right to erasure" (the user is no longer identifiable) without touching summaries at all. Add a `is_anonymized BOOLEAN DEFAULT FALSE` column to reports for audit trails.

---

## Weakness 10: The "Other" Model Poisons All Aggregations

**Why it breaks:**
The vehicle_models table includes `('Other', 'Other', 'motorcycle')`. Users who can't find their exact model select "Other." After 3 years, "Other" accumulates thousands of reports from dozens of different actual motorcycles. The summary for `(Other, Station_X)` says "Highly Verified" — but verified for WHAT motorcycle? The data is meaningless.

Worse: "Other" reports inflate station-level "total reports" counts, making stations look more verified than they are.

With 800 real models, "Other" might represent 5-10% of all reports (250K-500K). That's significant noise.

**Impact:** Aggregation accuracy degrades. "Other" compatibility is meaningless but looks authoritative.

**Better alternative:** Remove "Other" from compatibility reports entirely. Instead:
- Add a free-text `custom_model_name` field to profiles for users whose model isn't listed
- Block compatibility report submission unless the user has selected a real model (not "Other")
- Use the free-text field to identify models that need to be added to the master list (admin dashboard: "50 users typed 'TAILG' — time to add it")

This keeps reports clean and turns "Other" from noise into a signal for expanding the model list.

---

## Weakness 11: Single-Region Architecture Won't Survive Thailand-Wide Scale

**Why it breaks:**
The design assumes a single Supabase instance. With 300K users spread across Thailand, users in Chiang Mai hit the same database as users in Hat Yai. All writes go through one PostgreSQL primary.

At 5M reports with continuous growth (assume 5K reports/day at maturity), the write throughput isn't the issue — it's the read amplification. Every map load queries `compatibility_summaries` joined with `locations` using PostGIS. At 50K stations with spatial queries, this is CPU-intensive even with indexes.

**Impact:** p99 latency exceeds 2 seconds for map queries. Users in regions far from the Supabase datacenter experience additional network latency.

**Better alternative:** This isn't a schema fix — it's an infrastructure consideration the architecture should have addressed:
- Use Supabase Read Replicas (available on Pro plan) for read-heavy queries (map, station detail, summaries)
- Cache the "compatible stations for model X near location Y" query result at the edge (Vercel KV or similar) with 5-minute TTL
- Pre-compute regional compatibility snapshots (e.g., "Thunder compatibility in Bangkok" as a materialized query refreshed hourly)

The architecture document should have included a **caching strategy** section, not just a database design.

---

## Weakness 12: Verification Levels Are Globally Uniform but Should Be Contextual

**Why it breaks:**
"Highly Verified = 5+ reporters with 80% success" works for Thunder (the most popular model with thousands of reports). But for a niche model like Strom with 200 total reports across all stations, requiring 5 unique reporters at a single station is nearly impossible. After 3 years, Strom might be "Highly Verified" at 3 stations and "No Data" at 95% of stations.

Meanwhile, Thunder is "Highly Verified" everywhere, making the platform feel like it's only for Thunder riders.

**Impact:** Verification tiers are structurally biased toward popular models. Minority model users see "No Data" everywhere and leave.

**Better alternative:** Adaptive thresholds based on model population:

| Model Report Volume | Single Report | Community Verified | Highly Verified |
|---------------------|---------------|-------------------|-----------------|
| High (1000+ total) | 1 report | 3 reporters | 5 reporters, 80% |
| Medium (100-999) | 1 report | 2 reporters | 3 reporters, 75% |
| Low (<100) | 1 report | 2 reporters | 2 reporters, 100% |

Store the model's `total_global_reports` in `vehicle_models` (updated periodically). Use it to select the threshold tier. This way, a niche model with 2 consistent success reports can still reach "Highly Verified" — because 2 out of 2 for a rare model IS high confidence.

---

## Severity Summary

| # | Weakness | Severity | Fix Complexity |
|---|----------|----------|----------------|
| 1 | Hot row contention on summaries | Critical | Medium (async queue) |
| 2 | unique_reporters uncomputable safely | High | Low (junction table) |
| 3 | JSONB metadata unqueryable | High | Low (use nullable columns) |
| 4 | No temporal decay in verification | Critical | Medium (add recency columns + daily job) |
| 5 | status conflates compatibility with station health | High | Low (split into outcome + reason) |
| 6 | No DB-level duplicate prevention | High | Low (unique partial index) |
| 7 | Summary table never shrinks | Medium | Low (cleanup job) |
| 8 | No cross-model inference | High | Medium (connector-type grouping) |
| 9 | GDPR deletion cascades | Medium | Low (anonymize instead) |
| 10 | "Other" model poisons data | Medium | Low (block from reports) |
| 11 | No caching/read replica strategy | High | Medium (infrastructure) |
| 12 | Uniform verification thresholds | Medium | Low (adaptive thresholds) |

---

## Conclusion

The original design is a reasonable v1 but would accumulate significant technical debt by year 2. The three most damaging weaknesses are **temporal decay** (breaks user trust), **hot row contention** (breaks write throughput), and **no cross-model inference** (breaks value for minority model users). These three should be addressed before launch, not deferred.
