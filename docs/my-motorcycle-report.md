# My Motorcycle Feature — Implementation Report

## Summary

เพิ่มระบบเลือกรุ่นมอเตอร์ไซค์ไฟฟ้าให้ผู้ใช้ รองรับทั้งผู้ใช้ที่ login (บันทึกลง DB) และ guest (บันทึกลง localStorage) แสดงข้อมูลมอเตอร์ไซค์ที่เลือกทั่วทั้งแอป โดยยังไม่มีการ filter สถานีตาม connector compatibility

---

## Files Changed

### New Files (8)

| File | Purpose |
|------|---------|
| `supabase/migrations/00015_seed_vehicle_models.sql` | Seed 10 motorcycle models ลง `vehicle_models` table |
| `src/features/motorcycle/lib/utils.ts` | `getModelDisplayName()` helper |
| `src/features/motorcycle/actions/queries.ts` | `getVehicleModels()`, `getUserMotorcycle()` queries |
| `src/features/motorcycle/actions/motorcycle-actions.ts` | `setUserMotorcycle()` server action |
| `src/features/motorcycle/motorcycle-provider.tsx` | Context provider + `useMotorcycle()` hook |
| `src/features/motorcycle/components/motorcycle-selector.tsx` | Reusable Select dropdown |
| `src/features/motorcycle/components/motorcycle-prompt-card.tsx` | Home page prompt card |
| `src/features/motorcycle/components/my-motorcycle-badge.tsx` | Station list badge |

### Modified Files (6)

| File | Change |
|------|--------|
| `src/app/(main)/layout.tsx` | Wrap with `MotorcycleProvider`, fetch user motorcycle from DB |
| `src/app/(main)/page.tsx` | Add `MotorcyclePromptCard` to hero section |
| `src/app/(main)/stations/page.tsx` | Add `MyMotorcycleBadge` above filters |
| `src/features/profile/components/edit-profile-form.tsx` | Add motorcycle selector field |
| `src/app/(main)/profile/page.tsx` | Fetch and pass `vehicleModels` to edit form |
| `src/components/layout/user-menu.tsx` | Add "มอเตอร์ไซค์ของฉัน" menu item |

---

## New Components

### `MotorcycleProvider`
- React Context wrapping `(main)/layout.tsx`
- Logged-in users: receives `serverMotorcycle` from server-side DB fetch
- Guests: reads/writes `localStorage('ev_motorcycle')`
- Exposes `useMotorcycle()` hook returning `{ motorcycle, setMotorcycle, isReady }`

### `MotorcyclePromptCard`
- Client component on home page
- Shows "คุณใช้มอเตอร์ไซค์รุ่นอะไร?" when no motorcycle selected
- Dismissible (sessionStorage-based)
- Handles both guest (context setter) and logged-in (server action) flows

### `MyMotorcycleBadge`
- Shows "มอเตอร์ไซค์ของฉัน: {displayName}" with Bike icon
- Renders only when motorcycle is selected

### `MotorcycleSelector`
- Reusable dropdown with all vehicle models
- Used in both prompt card and profile edit form

---

## Database Changes

### Migration: `00015_seed_vehicle_models.sql`

Seeds 10 rows into existing `vehicle_models` table:

| Brand | Model | Category |
|-------|-------|----------|
| i-Motor | Thunder | motorcycle |
| EM | Milano | scooter |
| Deco | Deco | scooter |
| Strom | Strom | motorcycle |
| NIU | NIU | scooter |
| Honda | EM1 e: | scooter |
| Honda | CUV e: | scooter |
| Gogoro | Gogoro | scooter |
| Yamaha | Neo's | scooter |
| Other | Other | motorcycle |

Uses `ON CONFLICT (brand, model) DO NOTHING` for idempotency.

---

## API Changes

### Server Actions
- `setUserMotorcycle(modelId: string | null)` — updates `profiles.ev_model_id`, revalidates layout

### Queries
- `getVehicleModels()` — returns all active vehicle models ordered by brand
- `getUserMotorcycle(userId)` — returns user's selected model with brand/model info

---

## UI Changes

1. **Home page**: Prompt card appears below hero text when no motorcycle is selected
2. **Station list**: Badge displays selected motorcycle name above station filters
3. **Profile page**: Motorcycle selector added to edit profile form
4. **User menu**: "มอเตอร์ไซค์ของฉัน" link added between profile and favorites

---

## Technical Decisions

| Decision | Rationale |
|----------|-----------|
| Context provider pattern | 3+ UI locations need motorcycle info; avoids prop drilling and duplicate logic |
| DB seed (not constants) | `profiles.ev_model_id` is a UUID FK to `vehicle_models` — rows must exist |
| `isReady` flag | Prevents hydration mismatch from localStorage reads |
| `displayName` in localStorage | Avoids extra DB query to resolve brand/model for guests |
| `revalidatePath('/', 'layout')` | Ensures MotorcycleProvider re-fetches data after motorcycle change |
| `as any` for Supabase queries | Generated types don't include `vehicle_models`/`ev_model_id` columns; matches existing codebase pattern |

---

## Known Limitations

1. **No connector compatibility filtering** — motorcycle selection is informational only; no station filtering by connector type
2. **No battery/range info** — `vehicle_models` rows have no specs data yet
3. **Guest motorcycle not synced on login** — if a guest selects a motorcycle then logs in, the localStorage value is not automatically migrated to their profile
4. **Generated Supabase types** — `vehicle_models` table is not in generated types, requiring `as any` casts

---

## Future Recommendations

1. **Connector compatibility**: Add `connector_type_id` to `vehicle_models`, then filter/highlight compatible stations
2. **Battery & range data**: Add specs columns to enable range-based route planning
3. **Guest-to-user sync**: On login, check localStorage motorcycle and offer to save to profile
4. **Type generation**: Run `supabase gen types` after migration to eliminate `as any` casts
5. **Motorcycle image/icon**: Add brand logos or silhouettes to the selector for better UX
