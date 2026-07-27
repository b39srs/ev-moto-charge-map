# Community Compatibility — Architecture Review

## Executive Summary

This design introduces a **community-driven compatibility system** where real charging attempts — not manufacturer specs — determine whether a motorcycle can charge at a station. The architecture centers on two tables: an **append-only report log** (`compatibility_reports`) capturing every charging attempt, and a **pre-computed summary table** (`compatibility_summaries`) enabling sub-millisecond compatibility lookups at any scale.

Key decisions:
- **Model-level granularity** (not variant), with a clear upgrade path to variants
- **Every attempt recorded** (not latest-only), enabling confidence scoring and trend detection
- **Application-maintained summaries** (not real-time aggregation), trading slight write overhead for dramatic read performance
- **Four-tier verification** derived from report count and reporter diversity

This design supports 1M+ reports, 100K+ stations, and hundreds of models without architectural changes.

---

## Recommended Architecture

### Core Principle

```
Report = immutable fact ("I tried charging here, it worked/failed")
Summary = derived truth ("This model is verified compatible at this station")
```

Reports are **append-only**. Summaries are **computed projections**. This separation enables:
- Historical trend analysis
- Confidence scoring
- Verification levels
- Future ML/AI recommendations
- No data loss on summary recomputation

---

## ER Diagram

```
┌─────────────────┐          ┌──────────────────────────┐          ┌──────────────┐
│  vehicle_models  │          │   compatibility_reports   │          │   locations   │
│─────────────────│          │──────────────────────────│          │──────────────│
│ id          (PK)│◄────┐    │ id                  (PK) │    ┌────►│ id       (PK)│
│ brand           │     │    │ user_id             (FK)─┼──┐ │    │ name         │
│ model           │     │    │ station_id          (FK)─┼──┼─┘    │ latitude     │
│ category        │     └────┼─vehicle_model_id    (FK) │  │      │ longitude    │
│ is_active       │          │ connector_id    (FK,NUL)─┼──┼──┐   │ ...          │
│ ...             │          │ status                   │  │  │   └──────────────┘
└────────┬────────┘          │ notes            (NUL)   │  │  │
         │                   │ metadata         (JSONB) │  │  │   ┌──────────────────┐
         │                   │ created_at               │  │  └──►│location_connectors│
         │                   └──────────────────────────┘  │      │──────────────────│
         │                                                 │      │ id          (PK) │
         │                   ┌──────────────────────────┐  │      │ location_id (FK) │
         │                   │  compatibility_summaries  │  │      │ connector_type_id│
         │              ┌────┼─vehicle_model_id (PK,FK) │  │      └──────────────────┘
         └──────────────┘    │ station_id       (PK,FK)─┼──┼──►┌──────────────┐
                             │ total_reports            │  │   │  locations    │
                             │ success_count            │  │   └──────────────┘
                             │ failed_count             │  │
                             │ partial_count            │  │   ┌──────────────┐
                             │ unique_reporters         │  └──►│   profiles    │
                             │ verification_level       │      │──────────────│
                             │ last_report_at           │      │ id       (PK)│
                             │ last_success_at          │      │ display_name │
                             │ updated_at               │      │ ev_model_id  │
                             └──────────────────────────┘      └──────────────┘
```

### Relationship Explanations

| Relationship | Type | Explanation |
|---|---|---|
| `profiles` → `compatibility_reports` | 1:N | One user submits many reports over time |
| `locations` → `compatibility_reports` | 1:N | One station receives many reports from different users/models |
| `vehicle_models` → `compatibility_reports` | 1:N | One model has many reports across stations |
| `location_connectors` → `compatibility_reports` | 1:N (nullable) | A report may optionally specify which connector was used |
| `vehicle_models` + `locations` → `compatibility_summaries` | Composite 1:1 | One summary per unique (model, station) pair — the core lookup unit |

---

## Database Tables

### Table 1: `compatibility_reports`

The immutable event log. Every charging attempt is one row.

| Column | Type | Nullable | Default | Constraint | Purpose |
|--------|------|----------|---------|------------|---------|
| `id` | uuid | NO | `gen_random_uuid()` | PK | Unique report identifier |
| `user_id` | uuid | NO | — | FK → `profiles(id)` | Who reported |
| `station_id` | uuid | NO | — | FK → `locations(id)` | Where |
| `vehicle_model_id` | uuid | NO | — | FK → `vehicle_models(id)` | What motorcycle |
| `connector_id` | uuid | YES | NULL | FK → `location_connectors(id)` | Which connector (if known) |
| `status` | text | NO | — | CHECK `IN ('success','failed','partial')` | Outcome |
| `notes` | text | YES | NULL | — | Free-text user notes |
| `metadata` | jsonb | NO | `'{}'` | — | Extensible data (speed, duration, adapter, photos) |
| `created_at` | timestamptz | NO | `now()` | — | When reported |

**Design notes:**
- **No `updated_at`**: Reports are immutable. Users submit a new report to correct.
- **`metadata` JSONB**: Allows future fields without migrations. Initial suggested keys: `charging_speed_kw`, `charge_duration_min`, `battery_before_pct`, `battery_after_pct`, `adapter_used`, `adapter_type`, `photo_urls`.
- **`status` as text with CHECK**: More readable than enum, easier to extend. Three values cover the full outcome spectrum: worked, didn't work, partially worked.
- **`connector_id` nullable**: Users may not know which specific connector. The station-level data is still valuable.

### Table 2: `compatibility_summaries`

Pre-computed lookup table. One row per (model, station) pair.

| Column | Type | Nullable | Default | Constraint | Purpose |
|--------|------|----------|---------|------------|---------|
| `vehicle_model_id` | uuid | NO | — | PK, FK → `vehicle_models(id)` | Model half of composite key |
| `station_id` | uuid | NO | — | PK, FK → `locations(id)` | Station half of composite key |
| `total_reports` | integer | NO | 0 | CHECK `>= 0` | Total report count |
| `success_count` | integer | NO | 0 | CHECK `>= 0` | Successful charges |
| `failed_count` | integer | NO | 0 | CHECK `>= 0` | Failed attempts |
| `partial_count` | integer | NO | 0 | CHECK `>= 0` | Partial success |
| `unique_reporters` | integer | NO | 0 | CHECK `>= 0` | Distinct users who reported |
| `verification_level` | smallint | NO | 0 | CHECK `BETWEEN 0 AND 3` | Computed trust tier |
| `last_report_at` | timestamptz | YES | NULL | — | Most recent report timestamp |
| `last_success_at` | timestamptz | YES | NULL | — | Most recent successful charge |
| `updated_at` | timestamptz | NO | `now()` | — | Last summary recalculation |

**Verification level rules:**

| Level | Name | Criteria |
|-------|------|----------|
| 0 | No Data | `total_reports = 0` |
| 1 | Single Report | `total_reports >= 1 AND unique_reporters = 1` |
| 2 | Community Verified | `unique_reporters >= 2 AND success_count >= 2` |
| 3 | Highly Verified | `unique_reporters >= 5 AND success_count >= 5 AND success_rate >= 80%` |

These thresholds are application-level constants, not stored in the DB — they can be tuned without migrations.

---

## Relationships

### Why the Summary Table is Separate from Reports

The summary could theoretically be computed on-the-fly. However:

| Approach | Read Cost (1M reports) | Write Cost | Consistency |
|----------|----------------------|------------|-------------|
| Aggregate on read | O(N) scan per query | None | Always fresh |
| Summary table | O(1) lookup | O(1) update per report | Eventually consistent (ms lag) |
| Materialized view | O(1) lookup | O(N) full refresh | Stale until refresh |

The summary table wins because:
- Reads vastly outnumber writes (100:1 or more)
- Update cost is O(1) per report insertion (increment counters)
- Consistency lag is milliseconds (same transaction)

### Why Reports Reference `vehicle_models` (Not a New Junction)

The FK chain is direct: `compatibility_reports.vehicle_model_id → vehicle_models.id`. No junction table is needed because:
- A report always has exactly one vehicle model
- A report always has exactly one station
- The many-to-many relationship between models and stations emerges from the reports themselves

---

## Index Strategy

### `compatibility_reports`

| Index | Columns | Type | Why |
|-------|---------|------|-----|
| PK | `id` | B-tree (unique) | Row lookups |
| `idx_reports_station_model` | `(station_id, vehicle_model_id, created_at DESC)` | B-tree | "Show reports for this model at this station" — the most common query |
| `idx_reports_user` | `(user_id, created_at DESC)` | B-tree | "Show my reports" — profile page |
| `idx_reports_model_status` | `(vehicle_model_id, status)` | B-tree | "Show all failed reports for Thunder" — debugging/moderation |
| `idx_reports_created` | `(created_at DESC)` | B-tree | "Latest reports globally" — admin feed, trending |

### `compatibility_summaries`

| Index | Columns | Type | Why |
|-------|---------|------|-----|
| PK | `(vehicle_model_id, station_id)` | B-tree (unique) | Composite PK, serves as primary lookup |
| `idx_summaries_station` | `(station_id)` | B-tree | "Show all model compatibility for this station" — station detail page |
| `idx_summaries_model_verified` | `(vehicle_model_id, verification_level DESC)` | B-tree | "Show verified compatible stations for Thunder" — the key user query |

### Why Not More Indexes

Every index slows writes. With 1M reports, write performance matters. The chosen indexes cover the 6 query patterns in the requirements. Additional indexes (e.g., on `metadata` JSONB keys) should be added only when a specific query pattern justifies it.

---

## Query Strategy

### Q1: Show All Compatible Stations for Thunder

```
compatibility_summaries
WHERE vehicle_model_id = :thunder_id
  AND success_count > 0
ORDER BY verification_level DESC, last_success_at DESC
→ JOIN locations for station details
→ Optional: JOIN with PostGIS ST_DWithin for "near me" filtering
```

**Uses**: `idx_summaries_model_verified` → O(1) per row, returns only stations with reports.

### Q2: Show All Reports for One Station

```
compatibility_reports
WHERE station_id = :station_id
ORDER BY created_at DESC
→ JOIN vehicle_models for model names
→ JOIN profiles for reporter names
```

**Uses**: `idx_reports_station_model` (prefix scan on station_id) → efficient even with thousands of reports per station, paginated.

### Q3: Show All Reports by One User

```
compatibility_reports
WHERE user_id = :user_id
ORDER BY created_at DESC
→ JOIN locations for station names
→ JOIN vehicle_models for model names
```

**Uses**: `idx_reports_user` → O(log N) seek + sequential scan of user's reports.

### Q4: Show Latest Verification

```
compatibility_summaries
WHERE vehicle_model_id = :model_id
  AND station_id = :station_id
→ Single row lookup via composite PK
```

**Uses**: PK index → O(1). This is the fastest possible query.

### Q5: Show Compatibility Summary (Station Detail Page)

```
compatibility_summaries
WHERE station_id = :station_id
ORDER BY total_reports DESC
→ JOIN vehicle_models for model names
```

**Uses**: `idx_summaries_station` → returns all models with reports at this station.

### Q6: Show Failed Reports

```
compatibility_reports
WHERE status = 'failed'
ORDER BY created_at DESC
LIMIT :page_size OFFSET :offset
→ JOIN for details
```

**Uses**: `idx_reports_model_status` for model-specific failures, or `idx_reports_created` for global feed. Paginated.

---

## Aggregation Strategy

### Recommendation: Application-Maintained Summary Table

**How it works:**

After each report INSERT, the application executes an UPSERT on `compatibility_summaries`:
1. If no row exists for (model, station): INSERT with counts = 1
2. If row exists: UPDATE incrementing the relevant counter, recompute `unique_reporters`, recalculate `verification_level`

Both operations happen in the **same database transaction** as the report INSERT, guaranteeing consistency.

### Comparison of Alternatives

| Strategy | Read Performance | Write Overhead | Consistency | Complexity | Verdict |
|----------|-----------------|----------------|-------------|------------|---------|
| **Query-time aggregation** | O(N) — degrades with scale | None | Perfect | Low | Fails at 100K+ reports |
| **Materialized view** | O(1) after refresh | O(N) full refresh | Stale between refreshes | Medium | Refresh too expensive at scale |
| **Application summary table** | O(1) always | O(1) per report | Consistent (same transaction) | Medium | **Best balance** |
| **Redis cache** | O(1) | O(1) invalidation | Eventually consistent | High (new infra) | Overkill, adds dependency |
| **Supabase Edge Function trigger** | O(1) | O(1) async | Slightly delayed | Medium | Good alternative, but async introduces lag |

### Why Not Materialized Views

PostgreSQL materialized views require a `REFRESH MATERIALIZED VIEW` call. At 1M reports, this scans the entire table. `CONCURRENTLY` refresh avoids locking but still scans everything. The summary table avoids this entirely — only the affected row is updated.

### Safety Net: Recomputation

A periodic job (hourly or daily) should **verify** summaries by recomputing from reports and correcting any drift. This handles edge cases: deleted reports, manual corrections, bugs. The job reads from `compatibility_reports` and overwrites `compatibility_summaries` for any rows that don't match.

---

## Design Question 1: Vehicle Model vs Vehicle Variant

### Recommendation: Model-Level Now, Variant-Ready Schema

**Why Model-level is better for launch:**

| Factor | Model-Level | Variant-Level |
|--------|-------------|---------------|
| Data fragmentation | 10 models × 1000 stations = 10K combinations | 50 variants × 1000 stations = 50K combinations |
| Reports per combination | More reports → faster verification | Fewer reports → perpetual "Single Report" status |
| User friction | "I ride a Thunder" — everyone knows | "Is mine the 2025 or 2026?" — many don't know |
| Thai market reality | Most models have 1 variant | Variants are rare today |
| Community trust | 5 reports from Thunder riders → "Highly Verified" | 1 report from Thunder 2025 rider → "Single Report" |

**The fragmentation problem is critical.** With 10 models and 1000 stations, you need ~50K reports to reach "Community Verified" for most combinations. With 50 variants, you need ~250K. The community is small — fragmenting the data slows verification dramatically.

**How to support variants later without schema changes:**

1. Add `model_year` and `variant` nullable columns to `vehicle_models` — each variant becomes its own row with the same `brand`+`model` but different year/variant
2. Add a `model_family_id` self-referencing FK to `vehicle_models` — groups variants under a parent model
3. Reports still reference `vehicle_model_id` (unchanged)
4. Summaries can aggregate at family level OR variant level
5. Zero migration impact on existing reports

This preserves the FK relationship, doesn't change the reports table, and allows gradual rollout.

---

## Design Question 2: Every Attempt vs Latest Status

### Recommendation: Every Attempt (Append-Only Log)

| Factor | Every Attempt | Latest Status Only |
|--------|--------------|-------------------|
| Verification confidence | "5 users confirmed this" | "1 user said yes" |
| Trend detection | "Worked in Jan, failing since March" | Only current state |
| Abuse resistance | Need multiple fake accounts | One fake report overwrites truth |
| Community trust | Transparent history | Black box |
| Station degradation | Detectable via declining success rate | Invisible |
| Data recovery | Delete one bad report, truth remains | Delete one report, truth is gone |
| Storage | More rows | Fewer rows |
| Query complexity | Needs summary table | Simple direct reads |

**The case for every attempt is overwhelming.** The storage cost is negligible (1M rows at ~500 bytes each = ~500MB). The summary table eliminates the read performance concern. And the benefits — confidence scoring, trend detection, abuse resistance — are foundational to the "Community is the source of truth" vision.

**Immutability rule:** Reports cannot be edited, only created or soft-deleted. This preserves the integrity of the historical record.

---

## Scalability Analysis

### Growth Stages

| Scale | Reports | Summaries | Bottleneck | Mitigation |
|-------|---------|-----------|------------|------------|
| **100 stations, 10 models** | ~1K | ~1K | None | Direct queries would even work without summaries |
| **1,000 stations, 20 models** | ~50K | ~20K | None | Indexes handle this easily |
| **10,000 stations, 50 models** | ~500K | ~500K | Summary table starts earning its keep | Ensure summary UPSERT is optimized |
| **100,000 stations, 100 models** | ~5M | ~10M | Report table size, summary update contention | Partition reports by date, batch summary updates |
| **1M reports** | 1M | Stable | Report INSERT throughput, index maintenance | Partition `compatibility_reports` by `created_at` (monthly), archive old partitions |

### Specific Bottleneck Analysis

**Bottleneck 1: Summary UPSERT contention**
At high write volume, multiple concurrent reports for the same (model, station) could cause lock contention on the summary row. Mitigation: use `INSERT ... ON CONFLICT DO UPDATE` with atomic increments (`success_count = success_count + 1`), which PostgreSQL handles efficiently with row-level locks.

**Bottleneck 2: `unique_reporters` calculation**
Computing `COUNT(DISTINCT user_id)` on every report INSERT requires a sub-query. At scale, this becomes expensive. Mitigation: maintain a separate `summary_reporters` junction table or accept slight inaccuracy by incrementing only when a new user-model-station combination is first seen (check with a lightweight EXISTS query).

**Bottleneck 3: Geo-spatial queries**
"Show compatible stations near me" requires joining `compatibility_summaries` with `locations` using PostGIS `ST_DWithin`. At 100K stations, this benefits from the existing spatial index on `locations.geom`. The join is efficient because the summary table is pre-filtered.

**Bottleneck 4: Report table growth**
At 1M+ rows, full-table operations (recomputation, exports) become slow. Table partitioning by `created_at` (range partitioning, monthly) keeps individual partition scans fast while preserving transparent query behavior.

---

## Future Expansion

The schema supports all listed future features **without structural changes**:

| Future Feature | How It Fits |
|---|---|
| **Route planning** | Query `compatibility_summaries` for stations along a route (PostGIS `ST_DWithin` on a linestring). No schema change. |
| **Battery size** | Add `battery_kwh` column to `vehicle_models`. Reports and summaries are unaffected. |
| **Charging speed** | Already captured in `metadata.charging_speed_kw`. Promote to a proper column when analytics demand it. |
| **Charger versions** | Add `firmware_version` or `hardware_version` to `location_connectors`. Reports already FK to connectors. |
| **Vehicle generations/variants** | Add `model_family_id` self-FK and `model_year`/`variant` to `vehicle_models`. Reports reference `vehicle_model_id` unchanged. |
| **Verified contributors** | Add `trust_score` to `profiles`. Weight reports by trust_score when computing summaries. No reports schema change. |
| **Admin moderation** | Add `moderation_status` column to `compatibility_reports` (default: `'approved'`). Summaries only count approved reports. |
| **AI recommendation** | Reads from `compatibility_summaries` + `vehicle_models` + user location. Pure read-side feature. |
| **Connector-level summaries** | Add a parallel `connector_compatibility_summaries` table with PK `(vehicle_model_id, connector_id)`. Reports already have `connector_id`. |
| **Time decay** | Add recency weighting to verification_level calculation. Summaries already track `last_report_at` and `last_success_at`. |

---

## Risks

| Risk | Severity | Likelihood | Mitigation |
|------|----------|------------|------------|
| **Cold start** — no reports, empty compatibility data | High | Certain | Seed with known compatibility from community leaders. Prioritize the prompt card UX to encourage first reports. |
| **False reports** — users submit inaccurate data | Medium | Likely | Verification levels inherently resist this (need multiple independent reporters). Future: trust scores, moderation. |
| **Report spam** — bots or malicious bulk submissions | Medium | Possible | Rate limiting (max 1 report per user per station per day, application-enforced). Future: CAPTCHA, IP throttling. |
| **Stale data** — station hardware changes, old reports misleading | Medium | Likely | Time-decay weighting in verification calculation. `last_success_at` shows recency. Future: "confirm still works" prompt to recent visitors. |
| **Summary drift** — summary table gets out of sync with reports | Low | Possible | Periodic recomputation job as safety net. Idempotent UPSERT logic. |
| **Over-fragmentation** — too many model+station pairs with single reports | Medium | Likely at scale | Model-level (not variant-level) aggregation. Cross-model inference ("if it works for Honda EM1, likely works for Honda CUV" based on shared connector type). |

---

## Alternative Designs Considered

### Alternative 1: Manufacturer Compatibility Matrix

A static table mapping `vehicle_model_id × connector_type_id → compatible (boolean)`.

**Rejected because:**
- Contradicts "Community is the source of truth" vision
- Manufacturer specs don't reflect real-world conditions (adapter availability, power output, firmware compatibility)
- However, this could be a **supplementary** data source in the future, shown as "theoretical compatibility" alongside community data

### Alternative 2: Event Sourcing with CQRS

Full event sourcing: every state change is an event, projections build read models.

**Rejected because:**
- Massive over-engineering for the team size and scale
- The report log IS already an event log — we get 80% of the benefit without the CQRS complexity
- Supabase doesn't natively support event sourcing patterns

### Alternative 3: Graph Database for Compatibility

Neo4j or similar, modeling `(Vehicle)-[:COMPATIBLE_WITH]->(Station)` edges.

**Rejected because:**
- Adds infrastructure complexity (new database)
- PostgreSQL with proper indexes handles the query patterns efficiently
- Graph traversal isn't needed — the queries are straightforward relational joins

### Alternative 4: Tag-Based System

Users "tag" stations with compatible model names, like Stack Overflow tags.

**Rejected because:**
- Loses the structured data (success/fail/partial, counts, confidence)
- No way to distinguish "1 person said yes" from "50 people confirmed"
- Can't support verification levels

### Alternative 5: Connector-Type-First Design

Map compatibility at `vehicle_model × connector_type` level, then infer station compatibility.

**Considered seriously.** This would mean: "Thunder uses Type 2, this station has Type 2, therefore compatible."

**Partially adopted:** The `connector_id` FK in reports captures this data. But station-level summaries are the primary view because:
- A station having a "Type 2" connector doesn't guarantee it works (power output, firmware, physical fit)
- Community reports capture real-world success, not theoretical compatibility
- Future: derive connector-type patterns from report data automatically

---

## Final Recommendation

### Build This First

1. **`compatibility_reports` table** — the immutable event log
2. **`compatibility_summaries` table** — the pre-computed lookup
3. **Summary update logic** — atomic UPSERT in the same transaction as report INSERT
4. **Verification level computation** — four tiers based on report count and reporter diversity

### Build This Second

5. **Periodic recomputation job** — safety net for summary accuracy
6. **Rate limiting** — application-level, one report per user per station per day
7. **Geo-spatial compatibility query** — "compatible stations near me" using PostGIS + summaries

### Defer Explicitly

- Vehicle variants (wait for market demand)
- Connector-level summaries (wait for enough connector-specific reports)
- Trust scores (wait for abuse patterns to emerge)
- AI recommendations (wait for sufficient data volume)

### The Single Most Important Decision

**Use model-level granularity with an append-only report log and a pre-computed summary table.** This gives the fastest read performance, the strongest verification confidence, and the clearest upgrade path. Every alternative considered either sacrifices read performance, fragments community data, or adds unnecessary complexity.

The schema is deliberately minimal. Two new tables. Five indexes. Zero new infrastructure. It scales to 1M reports on Supabase's default PostgreSQL without partitioning, and to 10M+ with simple date-range partitioning on the reports table.
