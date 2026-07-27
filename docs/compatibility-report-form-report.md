# Compatibility Report Form — Implementation Report

## Summary

Submission flow for Community Compatibility reports. Enables the previously disabled "รายงานความเข้ากันได้" button on the station detail page. Riders can submit a report in ~15 seconds — just pick outcome and submit.

No schema changes. No new server actions. Pure UI on top of existing backend.

---

## Components

### New files (4)

| File | Type | Purpose |
|------|------|---------|
| `src/hooks/use-mobile.ts` | Client hook | `useIsMobile()` — media query hook for responsive Dialog/Sheet switching |
| `src/features/compatibility/components/outcome-selector.tsx` | Client component | Two large toggle buttons: "ชาร์จสำเร็จ" / "ชาร์จไม่ได้" |
| `src/features/compatibility/components/report-form.tsx` | Client component | Form fields: motorcycle selector, outcome, reason, optional details, notes |
| `src/features/compatibility/components/report-form-dialog.tsx` | Client component | Responsive wrapper — Dialog (desktop) / Sheet bottom (mobile) + state management |

### Modified files (2)

| File | Change |
|------|--------|
| `src/features/compatibility/components/compatibility-section.tsx` | Added `vehicleModels` prop, replaced disabled button with `<ReportFormDialog>` |
| `src/app/(main)/stations/[id]/page.tsx` | Added `getVehicleModels()` to `Promise.all`, pass to `<CompatibilitySection>` |

---

## Files Changed

### `outcome-selector.tsx`

Controlled component with two large toggle buttons in a 2-column grid:

- **Success**: green border + bg when selected, `CheckCircle2` icon
- **Failed**: red border + bg when selected, `XCircle` icon
- Unselected: muted border with hover state
- Hidden `<input name="outcome">` syncs with selected value

### `report-form.tsx`

Form layout (all fields wrapped in `<form action={formAction}>`):

1. **Motorcycle selector** — pre-selected from user profile via `useMotorcycle()` context
2. **Outcome selector** — required, large toggle buttons
3. **Reason** — conditional, only shown when `outcome === 'failed'`. Select dropdown with Thai labels
4. **Disclosure toggle** — "รายละเอียดเพิ่มเติม" button with animated chevron
   - Battery before/after — native `<input type="range">` with step=5, showing `%` or `—`
   - Duration — number input with "นาที" suffix
   - Adapter used — Checkbox with hidden input syncing boolean
5. **Notes** — Textarea, max 500 chars
6. **Error message** — general `state.message` display
7. **Submit button** — "ส่งรายงาน", auto-pending via `useFormStatus()`

### `report-form-dialog.tsx`

Responsive dialog wrapper:

- `useIsMobile()` → Dialog on desktop, Sheet `side="bottom"` on mobile
- `useActionState(createCompatibilityReport, null)` — connects to existing server action
- `useMotorcycle()` — provides default motorcycle ID for pre-selection
- Success flow: `useEffect` watches `state.success` → closes dialog → `toast.success()` → `router.refresh()`
- Trigger: `<Button size="sm">รายงานความเข้ากันได้</Button>`
- Content: scrollable with `max-h-[85vh] overflow-y-auto`

### `compatibility-section.tsx`

- Added `vehicleModels` prop to interface
- Imported `ReportFormDialog`
- Removed `Button` import (no longer needed)
- Replaced disabled button + "(เร็วๆ นี้)" with `<ReportFormDialog>`
- Remains a server component — client dialog is rendered within

### `page.tsx`

- Added `getVehicleModels` import from motorcycle queries
- Extended `Promise.all` destructuring (now 6 items)
- `getVehicleModels()` fetched in parallel with existing queries
- Passed `vehicleModels` prop to `<CompatibilitySection>`

---

## UI Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Dialog vs Sheet | `useIsMobile()` media query | Bottom sheet on mobile is thumb-friendly; centered dialog on desktop |
| `useActionState` in dialog | Not in form component | Keeps form stateless, dialog manages lifecycle |
| Outcome selector | Large toggle buttons | Most critical field — must be fast and obvious, not a dropdown |
| Optional fields | Disclosure toggle | Keeps initial form minimal (motorcycle + outcome = 2 fields) |
| Battery inputs | Native `<input type="range">` | No Slider in UI lib; native range with `accent-primary` is sufficient |
| Adapter checkbox | Hidden input sync | Base UI Checkbox `onCheckedChange` + hidden `<input>` for FormData |
| Section stays server | ReportFormDialog is client child | Server components can render client components — no conversion needed |
| Pre-selection | `useMotorcycle()` context | Already in provider tree, matches profile motorcycle |
| Success flow | close → toast → router.refresh() | `revalidatePath` in server action invalidates cache; `refresh()` re-renders |

---

## Reused Existing Code

| What | Source |
|------|--------|
| `createCompatibilityReport` server action | `compatibility/actions/compatibility-actions.ts` |
| Zod validation schema | `lib/validations/compatibility.ts` |
| `MotorcycleSelector` | `motorcycle/components/motorcycle-selector.tsx` |
| `useMotorcycle()` hook | `motorcycle/motorcycle-provider.tsx` |
| `FormField` | `components/form/form-field.tsx` |
| `SubmitButton` | `components/form/submit-button.tsx` |
| Dialog / Sheet components | `components/ui/dialog.tsx`, `components/ui/sheet.tsx` |
| Select components | `components/ui/select.tsx` |
| Checkbox | `components/ui/checkbox.tsx` |
| `toast` | `sonner` (already installed) |
| `REPORT_REASONS` | `compatibility/types.ts` |
| `getVehicleModels()` | `motorcycle/actions/queries.ts` |

---

## Accessibility

- **Outcome selector**: Uses `<button type="button">` — keyboard navigable, focus-visible
- **Color + text**: All states use both color AND text/icon labels
- **Disclosure toggle**: Button with clear label, chevron rotation indicates state
- **Form errors**: Displayed below each field via `FormField` error prop
- **Scrollable dialog**: `max-h-[85vh]` prevents overflow on small screens
- **Close button**: Built into Dialog/Sheet components with sr-only label

## Responsive Behavior

- **Desktop (sm+)**: Centered Dialog, `max-w-md`
- **Mobile (<640px)**: Bottom Sheet, full-width, `max-h-[85vh]` scrollable
- **Outcome buttons**: 2-column grid, equal width
- **Optional details**: Wrapped in bordered container

---

## Known Limitations

1. **No edit/delete** — Reports are immutable once submitted. Future phase.
2. **No connector selection** — `connector_id` field exists in schema but is not exposed in the form. Can be added when station connector data is linked.
3. **Battery sliders start at 50%** visually — value is only sent when user interacts. Display shows "—" until touched.
4. **No offline support** — Requires network for submission.
5. **Vehicle models fetched on every page load** — Could be cached/static. Currently acceptable since the list is small.

---

## Verification Checklist

1. `npm run build` — passes clean
2. Logged-in user → button opens Dialog (desktop) / Sheet (mobile)
3. Motorcycle pre-selected from profile
4. Select outcome → submit → dialog closes → toast → section refreshes
5. outcome=failed → reason dropdown appears
6. "รายละเอียดเพิ่มเติม" → expands optional fields
7. Duplicate report → error displayed in form
8. Guest → login link (no dialog trigger)
9. Optional fields hidden by default
