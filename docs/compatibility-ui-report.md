# Compatibility UI — Station Detail Section Report

## Summary

Presentation layer for the Community Compatibility system on the station detail page. Answers: "Can my motorcycle charge here?" Displays compatibility summaries for all tested motorcycle models with verification badges, success/failure stats, and "My Motorcycle" highlighting.

No backend changes. No server actions. No schema modifications. Pure UI.

---

## Components

### New files (4)

| File | Type | Purpose |
|------|------|---------|
| `src/features/compatibility/components/compatibility-section.tsx` | Server component | Main section: Card with model list + action card |
| `src/features/compatibility/components/compatibility-model-row.tsx` | Server component | Individual model row with stats and badges |
| `src/features/compatibility/components/verification-badge.tsx` | Server component | Color-coded verification level badge |
| `src/features/compatibility/lib/format-relative-time.ts` | Utility | Thai relative time formatter |

### Modified files (1)

| File | Change |
|------|--------|
| `src/app/(main)/stations/[id]/page.tsx` | Added data fetching + `<CompatibilitySection>` between StationInfo and ReviewsSection |

---

## Files Changed

### `compatibility-section.tsx`

Two-card layout mirroring ReviewsSection:

**Card 1 — Data:**
- Header: `ShieldCheck` icon + "ความเข้ากันได้" + count
- Body: list of `CompatibilityModelRow` components
- User's motorcycle sorted to top if found
- Empty state: "ยังไม่มีรายงานความเข้ากันได้"

**Card 2 — Action:**
- Logged in: disabled Button "รายงานความเข้ากันได้" + "(เร็วๆ นี้)"
- Guest: login prompt link

### `compatibility-model-row.tsx`

Bordered row layout matching ConnectorList pattern:
- Line 1: Model display name + VerificationBadge
- Line 1.5: "มอเตอร์ไซค์ของฉัน" badge (conditional, with Bike icon)
- Line 2: `CheckCircle2` success count + `XCircle` failed count + success rate %
- Line 3: "ยืนยันล่าสุด: {relative time} · ผู้รายงาน {n} คน"
- Highlight ring when `isUserMotorcycle`

### `verification-badge.tsx`

Renders shadcn Badge with color-coded background per verification level:

| Level | Color | Label |
|-------|-------|-------|
| 0 NO_DATA | gray | ไม่มีข้อมูล |
| 1 SINGLE_REPORT | blue | รายงานเดี่ยว |
| 2 COMMUNITY_VERIFIED | green | ชุมชนยืนยัน |
| 3 HIGHLY_VERIFIED | emerald | ยืนยันสูง |
| 4 STALE | amber | ข้อมูลเก่า |

### `format-relative-time.ts`

Thai relative time: "เมื่อสักครู่", "5 นาทีที่แล้ว", "3 ชั่วโมงที่แล้ว", "12 วันที่แล้ว".
Falls back to `th-TH` short date for >30 days. No external library.

### `page.tsx`

- Added imports: `getCompatibilitySummaryByLocation`, `getUserMotorcycle`, `CompatibilitySection`
- Extended `Promise.all` to fetch compatibility summaries and user motorcycle in parallel
- Inserted `<CompatibilitySection>` between `<StationInfo>` and `<ReviewsSection>`

---

## UI Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| All server components | No `'use client'` | No interactivity needed — button is disabled, data is pre-fetched |
| Placement | Between StationInfo and Reviews | Natural info hierarchy: station → compatibility → opinions |
| Two-card layout | Data card + action card | Mirrors ReviewsSection pattern exactly |
| My Motorcycle detection | Server-side via `getUserMotorcycle()` | Avoids client hydration boundary |
| Relative time | Custom 15-line utility | No `date-fns`/`dayjs` in project; Thai locale needed |
| Verification colors | Tailwind utility classes in Record map | Matches `LOCATION_STATUS_COLORS` pattern |
| Row design | Bordered div with badges | Matches ConnectorList row pattern |
| Reused `getModelDisplayName()` | From `motorcycle/lib/utils.ts` | Handles "brand === model" deduplication |

---

## Accessibility

- **Color + text**: All verification badges use both color AND text label. Success/failed use icon color AND Thai text. Never color alone as information carrier.
- **My Motorcycle highlight**: Uses ring + background color AND a text badge "มอเตอร์ไซค์ของฉัน" — visible to screen readers.
- **Disabled button**: Native HTML `disabled` attribute, properly announced.
- **Verification badge**: `aria-label` with full meaning (e.g., "ระดับการยืนยัน: ชุมชนยืนยัน").

---

## Responsive Behavior

- **Desktop (lg+)**: Card spans 2-column main area. Stats in horizontal flex.
- **Tablet/Mobile**: Same card in single column. Stats line uses `flex-wrap gap-x-3 gap-y-1` for graceful stacking. Model name + badge use `justify-between` with `items-start` for wrapping.
- **No horizontal scrolling** — all content flex-wrapped.

---

## Known Limitations

1. **Submit Report button is disabled** — No form implementation. Button is a placeholder with "(เร็วๆ นี้)" helper text.
2. **No real-time updates** — Compatibility data is fetched server-side at page render. No WebSocket/polling for live updates.
3. **Guest motorcycle not used** — Only logged-in users' motorcycle (from profile `ev_model_id`) is highlighted. Guest localStorage motorcycle is not considered because it requires client component.
4. **No pagination** — All summaries for a station are rendered. At scale, stations with many tested models could grow. Pagination can be added when needed.
5. **Relative time is server-computed** — The "3 วันที่แล้ว" is computed at render time. If the page is cached, the relative time may drift until revalidation.

---

## Next Recommended Phase

### Phase 6C: Compatibility Report Form

Build the submission form on top of the existing server action:

1. **Report dialog/sheet** — Modal form with vehicle model selector, outcome toggle, failure reason, battery levels, notes
2. **Enable the Submit Report button** — Remove `disabled`, open the form dialog
3. **Post-submit UX** — Toast notification, auto-refresh compatibility section
4. **User's reports tab** — "My compatibility reports" on profile page

All server actions and validation are ready. The next phase is purely form UI.
