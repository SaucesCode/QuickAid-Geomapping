# Frontend Refactoring Analysis — QuickAid-Geomapping

## Executive Summary

Analysis of the frontend codebase identified **~1,800–2,200 lines** that can be removed or consolidated through shared hooks, components, and utilities. Target: **20%+ reduction** in maintainable LOC without changing behavior.

---

## 1. Duplicate Code Patterns

### 1.1 `fetchData` (Analytics API) — **HIGH**

**Locations:**
- `Geographic.js:93–102` (~10 lines)
- `Trends.js:78–87` (~10 lines)
- `Performance.js:86–99` (~14 lines, includes `setError`/`catch`)
- `DemographicsEconomics.js:111–121` (~11 lines)
- `Budget.js:76–89` (~14 lines; uses `date_from`/`date_to`/`assistance`/`batch_id`)

**Pattern:** Each builds `URLSearchParams` from `filters` (start, end, type, city, barangay) and calls `api.get(endpoint + query)`.

**Suggested consolidation:**
- Create `useAnalyticsFetch(endpoint, filters, options?)` in `hooks/useAnalyticsFetch.js`.
- For Budget, support an optional `paramMap` (e.g. `{ start: "date_from", end: "date_to", type: "assistance" }`) or a second `fetchData` variant in the same hook.

| File              | Current `fetchData` lines | After hook |
|-------------------|---------------------------|------------|
| Geographic        | 10                        | 0          |
| Trends            | 10                        | 0          |
| Performance       | 14                        | 0          |
| DemographicsEconomics | 11                    | 0          |
| Budget            | 14                        | 0 (or 2–3 if paramMap) |

**Estimated removal: ~50–55 lines.**  
**Severity: High** (5 files, repeated pattern).

---

### 1.2 `document.title` + cleanup — **MEDIUM**

**Locations:** 15+ pages use the same `useEffect` pattern, e.g.:

```js
useEffect(() => {
  document.title = "QuickAid | <PageName>";
  return () => { document.title = "QuickAid | Home"; };
}, []);
```

**Files:** Applicants, ArchiveApplicants, Approved, ApplicantForm, ExportApplicants, Dashboard, AdminManagement, Login, SettingsPage, HeatMap, MapComponent, PrintPage, PrintPagebyID, Intakesheet, and all 5 analytics pages (Geographic, Trends, Performance, DemographicsEconomics, Budget).

**Suggested consolidation:**
- `usePageTitle(title)` in `hooks/usePageTitle.js`:
  - Sets `document.title = "QuickAid | " + title` on mount and resets to `"QuickAid | Home"` on unmount.

**Estimated removal: ~45 lines** (3 lines × 15 usages).  
**Severity: Medium** (many files, small but repetitive).

---

### 1.3 Assistance type colors & `getAssistanceColor` — **HIGH**

**Locations (inconsistent definitions):**

| File                 | Constant / helper                       | Values |
|----------------------|----------------------------------------|--------|
| Geographic.js:61–65  | `ASSISTANCE_COLORS`                    | Educational #10B981, Medical #3B82F6, Burial #FDE68A |
| Trends.js:49–63      | `ASSISTANCE_COLOR_MAP`, `getAssistanceColor` | educational, medical, burial, other, default |
| DemographicsEconomics.js:88–96 | `assistanceColors`, `getAssistanceColor` | Medical #4caf50, Burial #f44336, Educational #2196f3 |
| Budget.js:58–63      | `ASSISTANCE_COLORS`                    | Medical #3B82F6, Educational #10B981, Burial #F59E0B |
| Dashboard.js:53–65   | `ASSISTANCE_COLORS`, `getAssistanceColor` | medical, educational, burial, default |
| MapComponent.js:43–48| `assistanceColors`, `assistanceTypes`  | Medical: "blue", Burial: "#fef08a", Educational: "green" |

**Suggested consolidation:**
- Single source: `utils/assistanceColors.js`:
  - `ASSISTANCE_COLORS = { Medical, Educational, Burial }` (pick one canonical set, e.g. Geographic/Budget).
  - `getAssistanceColor(type)` normalizing `type` (lowercase, strip "Assistance") and falling back to a default.
  - Export `ASSISTANCE_TYPES = ["Medical", "Educational", "Burial"]` for option lists.

**Estimated removal: ~80–100 lines** across 6 files.  
**Severity: High** (logic duplication + inconsistent UX).

---

### 1.4 Cities/barangays fetch + location filters — **HIGH**

**Locations:**
- `AnalyticsFilter.js:30–48` — `citiesWithApplicants`, `barangaysByCity` (city from `filters.city`)
- `ApplicantFilter.js:21–39` — same keys, `localFilters.city`
- `ApprovedFilter.js:187–205` — same keys, `localFilters.city`

**Pattern:** Same `api.get("/applicant-locations/filters/")` and `api.get("...?city=" + city)` with `staleTime`, `enabled: !!city` for barangays.

**Suggested consolidation:**
- `useLocationFilters(city)` in `hooks/useLocationFilters.js` returning `{ cities, barangays, isFetchingCities, isFetchingBarangays }`.
- All three filter components use this hook.

**Estimated removal: ~50 lines** (duplicated `useQuery` blocks).  
**Severity: High** (3 components, identical API usage).

---

### 1.5 Filter UI: `CompactSelect`, `CompactDateInput`, `FilterTag` — **HIGH**

**Locations:**
- `AnalyticsFilter.js:324–366` — `CompactSelect` (name, value, onChange, onClear, disabled, children)
- `AnalyticsFilter.js:368–395` — `CompactDateInput` (label, name, value, onChange, onClear, min, max)
- `AnalyticsFilter.js:397–406` — `FilterTag` (label, onRemove)
- `ApplicantFilter.js:271–328` — Same three components with slightly different props (`onChange(value)` vs `onChange` with `e.target` / `name`).

**Differences:**
- Analytics: `onChange` receives `e` and uses `name`; `CompactSelect` uses `name` and `e.target`.
- Applicants: `onChange(value)` and `onChange(e => value)`; no `name` on `CompactSelect`.

**Suggested consolidation:**
- Move to `components/filters/CompactSelect.js`, `CompactDateInput.js`, `FilterTag.js`.
- Unified API: `CompactSelect` accepts `name` (optional) and `onChange(e)` or `onChange(value)` via an adapter.
- `ApplicantFilter` and `AnalyticsFilter` both use these shared components. `ApprovedFilter` can be refactored to use `CompactSelect` as well (it has its own `FilterSelect`).

**Estimated removal: ~120–140 lines** (one full set of the three components plus partial reuse in ApprovedFilter).  
**Severity: High** (duplicate form building blocks).

---

### 1.6 Filter layout & structure: Analytics vs Applicants — **MEDIUM**

**Locations:**
- `AnalyticsFilter.js:135–385` — header, Quick Date Range / date presets, collapsible grid (Location, Type, Custom Date Range), Active Filters, Reset, `CompactSelect`/`CompactDateInput` layout.
- `ApplicantFilter.js:74–328` — Same structure: header, Search (instead of date presets), same 3-column grid (Location, Type, Date Range), Active Filters, Reset + Apply.

**Duplicate JSX:**
- Header: icon box, title, subtitle, toggle (Show/Hide Filters), `ChevronDown`, active-count badge.
- Grid: Location (City, Barangay), Assistance Type (Medical, Educational, Burial), Date (Start/End).
- Active Filters: `FilterTag` for city, barangay, type, start, end (plus search in Applicants, preset in Analytics).
- “Compact summary when collapsed” strip with same layout.
- Same `FilterTag` styling.

**Suggested consolidation:**
- `FilterPanel` (or `FiltersContainer`) in `components/filters/FilterPanel.js`:
  - Props: `title`, `subtitle`, `headerAction`, `quickSection` (date presets vs search), `fields` (Location, Type, Date), `extraFields`, `activeFilters`, `onReset`, `onClearField`, `children` for Reset/Apply.
- `AnalyticsFilter` and `ApplicantFilter` become thin wrappers that provide `quickSection`, `fields`, and callbacks. `ApprovedFilter` can adopt the same layout with `headerAction` and `quickSection` = search.

**Estimated removal: ~180–220 lines** (most of the shared layout in both filters).  
**Severity: Medium** (large but structured blocks; needs careful prop design).

---

### 1.7 Assistance type `<option>` lists — **LOW**

**Locations:**
- `AnalyticsFilter.js:264–267`
- `ApplicantFilter.js:212–215`
- `ApprovedFilter.js:291–294`
- `HeatMap.js:335–337`
- `Step3.js:284–286`
- `EditModal.js:290–292`

All: `Medical`, `Educational`, `Burial` (order有时 differs).

**Suggested consolidation:**
- Use `ASSISTANCE_TYPES` from `utils/assistanceColors.js` and map:

```js
{ASSISTANCE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
```

**Estimated removal: ~25 lines** (5–6 lines × 5–6 files, minus 1 shared constant and one line per usage).  
**Severity: Low** (few lines, but good for consistency).

---

### 1.8 Chart styling: `CartesianGrid`, `XAxis`, `YAxis`, `tick` — **MEDIUM**

**Locations:** 45+ lines across `Budget.js`, `Geographic.js`, `DemographicsEconomics.js`, `Performance.js`, `Trends.js`, `Dashboard.js` with:

- `<CartesianGrid strokeDasharray="3 3" stroke="#e0e7ff" />` (or `#e5e7eb`, or no stroke)
- `<XAxis ... tick={{ fill: "#4b5563" }} />` (sometimes `fontSize={11}`)
- `<YAxis tick={{ fill: "#4b5563" }} />` (or `fontSize={11}`)

**Suggested consolidation:**
- `components/charts/ChartAxes.js` (or similar):  
  `ChartGrid`, `ChartXAxis`, `ChartYAxis` with default `stroke="#e0e7ff"`, `tick={{ fill: "#4b5563" }}`, `fontSize={11}`, and overridable props.
- Alternatively, a `useChartDefaults()` hook returning `{ gridProps, xAxisProps, yAxisProps }` and use object spread in each chart.

**Estimated removal: ~60–80 lines** (repeated props).  
**Severity: Medium** (many occurrences; refactor is mechanical).

---

### 1.9 Section headings on analytics pages — **LOW**

**Locations:**  
`Budget.js`, `Geographic.js`, and possibly others use:

```jsx
<div className="space-y-3">
  <h2 className="text-lg font-bold text-gray-800 px-1">…</h2>
  …
</div>
```

**Suggested consolidation:**
- `AnalyticsSection` in `AnalyticsComponents.js` (or `components/charts/`):  
  `AnalyticsSection({ title, children })` rendering the `space-y-3` wrapper and `h2`.

**Estimated removal: ~15–20 lines.**  
**Severity: Low.**

---

### 1.10 `formatCurrency` (Budget) — **LOW**

**Location:** `Budget.js:147–154` only.

**Note:** If other pages (e.g. Disbursement, future reports) need PHP formatting, move to `utils/formatCurrency.js` and reuse. No current duplication; low priority.

---

## 2. Consolidation Opportunities

### 2.1 Merge `ApplicantFilter` and `AnalyticsFilter` (and align `ApprovedFilter`)

**Current:**
- **AnalyticsFilter:** `filters` state internal; `onFilterChange(filters)`; includes date presets; param names: start, end, type, city, barangay.
- **ApplicantFilter:** `filters` + `searchTerm` from parent or local; `onFilterChange`, `onSearchChange`; “Apply” to commit; same params plus search.
- **ApprovedFilter:** local filters; search; city/barangay/type; different layout (inline, no collapsible panel).

**Suggested approach (instead of one mega-component):**
- Shared **`FilterPanel`** (section layout, toggle, active tags, reset) as in 1.6.
- Shared **`useLocationFilters(city)`** and **`CompactSelect` / `CompactDateInput` / `FilterTag`** as in 1.4 and 1.5.
- **AnalyticsFilter:** composes `FilterPanel` + date presets + `AnalyticsFilter`-specific param handling; keeps `onFilterChange`; no Apply (immediate).
- **ApplicantFilter:** composes `FilterPanel` + search + Apply; `onFilterChange` + `onSearchChange`.
- **ApprovedFilter:** refactor to use `FilterPanel` + same Location/Type/Date building blocks and `FilterSelect` → `CompactSelect`.

**Estimated removal: ~200–250 lines** when combined with 1.5 and 1.6.  
**Severity: High** (three similar components).

---

### 2.2 `useAnalyticsFetch` and standard `queryKey` pattern

All analytics pages use:

- `queryKey: ["<domain>", "<sublabel>", filters]`
- `queryFn: () => fetchData(endpoint)`
- `staleTime` (or `keepPreviousData`) where used.

**Suggested consolidation:**
- `useAnalyticsFetch(endpoint, filters, { queryKey, staleTime, paramMap? })` that:
  - Builds query from `filters` (and optional `paramMap` for Budget).
  - Returns `{ data, isLoading, isError, ... }` from `useQuery`.

Multiple `useQuery` calls per page remain, but each `queryFn` and `fetchData` boilerplate is removed. Combined with 1.1: **~50–55 lines** removed.

---

### 2.3 `ApprovedFilter` dead code

**Location:** `ApprovedFilter.js:1–178` — entire block commented out (old implementation).

**Suggested consolidation:** Delete the commented block.

**Estimated removal: ~178 lines.**  
**Severity: Medium** (single file, large block).

---

### 2.4 Reuse of `AnalyticsComponents` (Badge, Table, EmptyState, ChartContainer)

`AnalyticsTable`, `TableHeader`, `TableHeaderCell`, `TableBody`, `TableRow`, `TableCell`, `Badge`, `EmptyState`, `ChartContainer` are already in `AnalyticsComponents.js` and used in Budget, Performance, etc. No new consolidation; ensure Disbursement and Applicants use `Badge` / table primitives where it fits to avoid new divergence.

---

## 3. Refactoring Suggestions

### 3.1 Shared hooks

| Hook                   | Purpose                                      | Files to refactor                         | Est. lines removed |
|------------------------|----------------------------------------------|-------------------------------------------|--------------------|
| `usePageTitle(title)`  | Set/reset `document.title`                    | 15+ pages                                 | ~45                |
| `useAnalyticsFetch`    | Analytics `fetchData` + `useQuery` wiring     | Geographic, Trends, Performance, DemographicsEconomics, Budget | ~55                |
| `useLocationFilters`   | Cities + barangays from `/applicant-locations/filters/` | AnalyticsFilter, ApplicantFilter, ApprovedFilter | ~50                |

---

### 3.2 Reusable components

| Component         | Purpose                                      | Est. lines removed |
|-------------------|----------------------------------------------|--------------------|
| `CompactSelect`   | Shared select with clear, used in filters    | ~40                |
| `CompactDateInput`| Shared date input with clear                 | ~30                |
| `FilterTag`       | Active filter chip with remove               | ~20                |
| `FilterPanel`     | Filter layout, header, collapse, active tags | ~200 (with 1.6)    |
| `ChartGrid` / `ChartXAxis` / `ChartYAxis` | Default Recharts styling           | ~70                |
| `AnalyticsSection`| Section title + `space-y-3` wrapper          | ~15                |

---

### 3.3 Utilities

| Utility                 | Purpose                                      | Est. lines removed |
|-------------------------|----------------------------------------------|--------------------|
| `utils/assistanceColors.js` | `ASSISTANCE_COLORS`, `getAssistanceColor`, `ASSISTANCE_TYPES` | ~90                 |
| `utils/formatCurrency.js`   | `formatCurrency` for PHP (if reused)     | 0 (future)         |

---

### 3.4 API / data layer

- **`/applicant-locations/filters/`:** already centralized in `useLocationFilters` suggestion.
- **Analytics:** `fetchData` and `useQuery` pattern centralized in `useAnalyticsFetch`; no new `api.js` surface needed.

---

## 4. Specific Areas (Analytics, Charts, Filters, Tables)

### 4.1 Analytics pages (Geographic, Trends, Performance, DemographicsEconomics, Budget)

- **`fetchData`:** replace with `useAnalyticsFetch` (1.1, 2.2).
- **`document.title`:** replace with `usePageTitle` (1.2).
- **Assistance colors:** import from `utils/assistanceColors.js` (1.3).
- **Chart props:** use `ChartGrid` / `ChartXAxis` / `ChartYAxis` or `useChartDefaults` (1.8).
- **Section headings:** use `AnalyticsSection` (1.9).

### 4.2 Chart configuration and rendering

- Shared axes/grid components (1.8).
- `ChartContainer` and `AnalyticsChartCard` from `AnalyticsComponents` already used; keep.
- One `ASSISTANCE_COLORS`/`getAssistanceColor` for all charts (1.3).

### 4.3 Data transformation

- **Trends:** `transformMonthlyData`, `transformYearlyData`, etc. are page-specific; no consolidation unless another page needs the same logic.
- **Performance:** `getTimeAgo` is reusable: move to `utils/dateUtils.js` and import where needed (~5–10 lines saved in one place, reuse later).

### 4.4 Loading and error handling

- **Analytics:** `AnalyticsChartCard` and `AnalyticsStatCard` already take `isLoading`; `InsightCard` too. Keep.
- **Applicants:** `LoadingTable`, `ErrorState`, `EmptyState` are local; could be replaced by `DesignSystem` or `AnalyticsComponents` `EmptyState` for consistency, but not a large line win.

### 4.5 Filter implementations

- Consolidate `AnalyticsFilter`, `ApplicantFilter`, and `ApprovedFilter` via `FilterPanel`, `useLocationFilters`, and shared `CompactSelect` / `CompactDateInput` / `FilterTag` (1.4, 1.5, 1.6, 2.1).
- **ApprovedFilter:** remove commented block (2.3).

### 4.6 Table / list rendering

- `AnalyticsTable`, `TableHeader`, `TableHeaderCell`, `TableBody`, `TableRow`, `TableCell` in `AnalyticsComponents` are used in Budget and Performance. Disbursement and Applicants can use these where the semantics match to avoid new table patterns.

---

## 5. Summary: Estimated Lines Removed

| Category                         | Est. lines removed |
|----------------------------------|--------------------|
| `fetchData` → `useAnalyticsFetch`| 50–55              |
| `document.title` → `usePageTitle`| 45                 |
| Assistance colors → `assistanceColors.js` | 80–100      |
| Cities/barangays → `useLocationFilters`   | 50              |
| CompactSelect / CompactDateInput / FilterTag | 120–140    |
| Filter layout → `FilterPanel`     | 180–220            |
| Assistance `<option>` → `ASSISTANCE_TYPES`| 25                |
| Chart axes/grid → shared components      | 60–80            |
| `AnalyticsSection`               | 15–20              |
| `ApprovedFilter` commented block | 178                |
| **Total (conservative)**         | **~800–1,070**     |
| **Total (including FilterPanel overlap)** | **~950–1,220** |

If the full `FilterPanel` + filter-component merge is done (2.1), total approaches **~1,200–1,500** lines.  
Frontend `src` is on the order of **~8,000–10,000+** lines; **~1,200 / 9,000 ≈ 13–15%** in a conservative case, and **~1,500 / 9,000 ≈ 17%** with filter consolidation.  
Adding `getTimeAgo`, `formatCurrency`, and table/empty-state reuse could push toward **20%+**.

---

## 6. Suggested Implementation Order

1. **Quick wins (low risk)**  
   - `usePageTitle` and swap in 15+ pages.  
   - Delete `ApprovedFilter` commented block.  
   - `utils/assistanceColors.js` + `ASSISTANCE_TYPES` and replace all assistance color/option definitions.

2. **Data and API**  
   - `useAnalyticsFetch` and refactor all 5 analytics pages.  
   - `useLocationFilters` and refactor the 3 filter components.

3. **Filter UI**  
   - Extract `CompactSelect`, `CompactDateInput`, `FilterTag` into `components/filters/`.  
   - Refactor `AnalyticsFilter` and `ApplicantFilter` to use them; then `FilterPanel` and, if needed, `ApprovedFilter` alignment.

4. **Charts and layout**  
   - `ChartGrid` / `ChartXAxis` / `ChartYAxis` (or `useChartDefaults`) and replace repeated props.  
   - `AnalyticsSection` for analytics section headings.

5. **Cross-cutting**  
   - `getTimeAgo` → `utils/dateUtils.js`.  
   - `formatCurrency` → `utils/formatCurrency.js` when a second consumer appears.  
   - Align Disbursement/Applicants with `AnalyticsComponents` table/empty-state where it fits.

---

## 7. Files to Create or Touch

**New files:**

- `src/hooks/usePageTitle.js`
- `src/hooks/useAnalyticsFetch.js`
- `src/hooks/useLocationFilters.js`
- `src/utils/assistanceColors.js`
- `src/components/filters/CompactSelect.js`
- `src/components/filters/CompactDateInput.js`
- `src/components/filters/FilterTag.js`
- `src/components/filters/FilterPanel.js` (optional, for full filter layout reuse)
- `src/components/charts/ChartAxes.js` (or `useChartDefaults` in `hooks/`)
- `src/utils/formatCurrency.js` (when needed)
- `src/utils/dateUtils.js` (for `getTimeAgo`)

**Heavy edits:**

- All 5 analytics pages
- `AnalyticsFilter.js`, `ApplicantFilter.js`, `ApprovedFilter.js`
- `Dashboard.js`, `MapComponent.js`, `HeatMap.js`
- `EditModal.js`, `Step3.js`, `ApplicantTable.js` (for `ASSISTANCE_TYPES` / colors)
- 15+ pages for `usePageTitle`

---

*Generated from static analysis of the QuickAid-Geomapping frontend. Re-run after refactors to update estimates.*
