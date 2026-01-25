# Frontend Refactoring Analysis — QuickAid-Geomapping

## Executive Summary

Analysis of the React frontend codebase identified **~1,200–1,800 lines** that can be removed or consolidated through shared hooks, chart components, data transformation utilities, and loading state management. Target: **20%+ reduction** in maintainable LOC without breaking functionality.

---

## 1. Duplicate Code Patterns

### 1.1 Chart Configuration Boilerplate — **HIGH**

**Locations:** All 5 analytics pages (Geographic.js, Trends.js, Performance.js, DemographicsEconomics.js, Budget.js)

**Pattern:** Every chart repeats the same structure:
```jsx
<ChartContainer height={250}>
  <ResponsiveContainer width="100%" height="100%">
    <BarChart data={data}>
      <CartesianGrid strokeDasharray="3 3" stroke="#e0e7ff" />
      <XAxis 
        dataKey="..."
        tick={{ fontSize: 11, fill: "#4b5563" }}
        angle={-45}
        textAnchor="end"
        height={60}
      />
      <YAxis tick={{ fontSize: 11, fill: "#4b5563" }} />
      <Tooltip />
      <Bar dataKey="..." fill="..." />
    </BarChart>
  </ResponsiveContainer>
</ChartContainer>
```

**Suggested consolidation:**
- Create reusable chart components in `components/ChartComponents.js`:
  - `<AnalyticsBarChart>` — handles BarChart with common config
  - `<AnalyticsPieChart>` — handles PieChart with common config
  - `<AnalyticsLineChart>` — handles LineChart with common config
  - `<AnalyticsAreaChart>` — handles AreaChart with common config

**Estimated removal: ~300–400 lines** (repeated chart boilerplate across 40+ charts).  
**Severity: High** (40+ chart instances, identical structure).

---

### 1.2 Data Transformation Functions — **HIGH**

**Locations:** All analytics pages have multiple `transform*Data` functions:
- `Trends.js`: `transformMonthlyData`, `transformYearlyData`, `transformOvertimeData`, `transformCumulativeData`, `transformAssistanceTypeOverTime`, `transformApplicantHeatmap` (6 functions)
- `DemographicsEconomics.js`: `transformGenderData`, `transformCivilStatusData`, `transformOccupationData`, `transformAgeGenderData` (4 functions)
- `Performance.js`: `transformProcessingByType`, `transformStaffProductivity`, `transformStaffLeaderboard`, `transformStaffActivity` (4 functions)
- `Geographic.js`: `processBarangayTypeData`, `processApprovalData` (2 functions)

**Pattern:** Similar transformation patterns:
- Date formatting: `new Date(item.month).toLocaleDateString("en-US", { month: "short", year: "numeric" })`
- Field mapping: `data.map(item => ({ newField: item.oldField, count: item.count }))`
- Filtering/slicing: `.filter(...).slice(0, 10)`
- Grouping/reducing: `.reduce((acc, item) => { ... }, {})`

**Suggested consolidation:**
- Create `utils/dataTransformers.js` with reusable transformers:
  ```javascript
  export function formatDate(date, format = 'short') { ... }
  export function mapDataField(data, fieldMap) { ... }
  export function groupBy(data, key) { ... }
  export function sliceTop(data, limit = 10) { ... }
  ```

**Estimated removal: ~200–300 lines** (consolidating 16+ transform functions).  
**Severity: High** (16+ functions, similar patterns).

---

### 1.3 Loading State Aggregation — **MEDIUM**

**Locations:**
- `Geographic.js` (lines 116–121): `const loading = locationsLoading || topBarangaysLoading || ...`
- `Trends.js` (lines 89–97): `const loadingStates = { monthly: monthlyLoading, yearly: yearlyLoading, ... }`
- `Performance.js`: Individual loading checks per stat card
- `DemographicsEconomics.js` (lines 140–147): `const loadingStates = { gender: genderLoading, ... }`
- `Budget.js`: Individual loading checks per query

**Pattern:** Similar loading state management patterns.

**Suggested consolidation:**
- Create `useLoadingStates(queries)` hook that aggregates loading states:
  ```javascript
  const loadingStates = useLoadingStates({
    locations: locationsLoading,
    topBarangays: topBarangaysLoading,
    // ...
  });
  const overallLoading = Object.values(loadingStates).some(Boolean);
  ```

**Estimated removal: ~50–80 lines** (repeated loading aggregation).  
**Severity: Medium** (5 pages, similar patterns).

---

### 1.4 Color Constants and Helpers — **MEDIUM**

**Locations:**
- `Performance.js` (lines 49–67): `BLUE_MEDIUM`, `DANGER_RED`, `SUCCESS_GREEN`, `WARNING_YELLOW`, `CHART_COLORS`, `getProductivityColor()`
- `DemographicsEconomics.js` (lines 44–77): `COLOR_PRIMARY`, `COLOR_SECONDARY`, `COLOR_TERTIARY`, `COLOR_ACCENT`, `COLOR_PINK`, `COLOR_SINGLE`, `COLOR_MARRIED`, `getGenderColor()`, `getCivilStatusColor()`, `INCOME_COLORS`
- `Geographic.js` (lines 62–69): `COLORS` array
- `Budget.js` (lines 54–57): `COLOR_CLAIMED`, `COLOR_UNCLAIMED`, `COLOR_PRIMARY`

**Pattern:** Color constants and helper functions duplicated across pages.

**Suggested consolidation:**
- Extend `utils/assistanceColors.js` or create `utils/chartColors.js`:
  ```javascript
  export const CHART_COLORS = [...];
  export const STATUS_COLORS = { claimed: "#10B981", unclaimed: "#EF4444", ... };
  export function getProductivityColor(count) { ... }
  export function getGenderColor(gender) { ... }
  export function getCivilStatusColor(status) { ... }
  ```

**Estimated removal: ~100–150 lines** (duplicate color definitions).  
**Severity: Medium** (4 pages, overlapping color logic).

---

### 1.5 Stat Card Calculations — **MEDIUM**

**Locations:** All analytics pages calculate stats similarly:
- `Trends.js` (lines 204–231): `totalApplications`, `monthlyGrowth`, `averageMonthlyApplications`, `mostPopularAssistance`
- `DemographicsEconomics.js` (lines 205–225): `totalApplicants`, `dominantGender`, `topOccupation`, `totalIncome`
- `Performance.js` (lines 187–212): `calculateStats()` function
- `Geographic.js` (lines 125–137): `totalApplicants`, `topBarangay`, `barangayCount`, `avgApprovalRate`
- `Budget.js`: Direct calculations in JSX

**Pattern:** Similar calculation patterns:
- `data.reduce((sum, item) => sum + item.count, 0)` — total count
- `data.reduce((prev, curr) => (prev.count > curr.count ? prev : curr), {...})` — max item
- `data.length > 0 ? Math.round(data.reduce(...) / data.length) : 0` — average

**Suggested consolidation:**
- Create `utils/analyticsCalculations.js`:
  ```javascript
  export function calculateTotal(data, field = 'count') { ... }
  export function findMax(data, field = 'count') { ... }
  export function calculateAverage(data, field = 'count') { ... }
  export function calculateGrowthRate(data) { ... }
  ```

**Estimated removal: ~80–120 lines** (repeated calculation logic).  
**Severity: Medium** (5 pages, similar calculations).

---

### 1.6 Chart Gradient Definitions — **LOW**

**Locations:**
- `Trends.js` (lines 303–307, 336–340, 394–398): Multiple `<defs><linearGradient>` blocks
- `DemographicsEconomics.js` (lines 373–377, 442–446): Gradient definitions
- `Geographic.js` (lines 381–386): Gradient definition
- `Budget.js`: No gradients (uses solid colors)

**Pattern:** Similar gradient definitions for charts.

**Note:** Gradients are chart-specific. Could create a `<ChartGradient>` component, but low priority.

**Estimated removal: ~30–40 lines** (if consolidated).  
**Severity: Low** (chart-specific, limited reuse).

---

### 1.7 Date Formatting — **MEDIUM**

**Locations:**
- `Trends.js` (lines 102–106, 117–120, 126–129, 135–138): `new Date(item.month).toLocaleDateString("en-US", { month: "short", year: "numeric" })`
- `Budget.js` (line 404): `new Date(batch.payout_date).toLocaleDateString()`
- Multiple pages: Date formatting in various formats

**Pattern:** Repeated date formatting logic.

**Suggested consolidation:**
- Create `utils/dateFormatters.js`:
  ```javascript
  export function formatMonthYear(date) { ... }
  export function formatShortDate(date) { ... }
  export function formatLongDate(date) { ... }
  ```

**Estimated removal: ~40–60 lines** (repeated date formatting).  
**Severity: Medium** (10+ occurrences).

---

### 1.8 Currency Formatting — **LOW**

**Location:** `Budget.js` (lines 136–143): `formatCurrency()` function

**Pattern:** Only used in Budget.js, but could be reused elsewhere.

**Suggested consolidation:**
- Move to `utils/formatCurrency.js` for potential reuse.

**Estimated removal: ~0 lines** (single usage, but improves organization).  
**Severity: Low** (single usage, but good practice).

---

### 1.9 Empty State Handling — **LOW**

**Locations:**
- `Geographic.js` (lines 510–513): Empty state for coverage gaps
- Other pages: Various empty state checks

**Pattern:** Similar empty state patterns, but `EmptyState` component already exists in `AnalyticsComponents.js`.

**Note:** `EmptyState` component exists but isn't used consistently. Encourage usage.

**Severity: Low** (component exists, just needs adoption).

---

### 1.10 Pagination Logic — **LOW**

**Location:** `Geographic.js` (lines 75–76, 236–239): Pagination state and calculations

**Pattern:** Only used in one place. No duplication.

**Severity: N/A** (single usage).

---

## 2. Component Structure Patterns

### 2.1 Page Structure — **HIGH**

**Pattern:** All analytics pages follow identical structure:
```jsx
<PageContainer>
  <AnalyticsStack spacing="lg">
    <PageHeader icon={...} title="..." subtitle="..." />
    <AnalyticsFilter onFilterChange={setFilters} />
    <AnalyticsGrid cols={{ default: 1, sm: 2, lg: 4 }} gap="md">
      {/* Stat Cards */}
    </AnalyticsGrid>
    {/* Charts */}
    <AnalyticsAlertCard>
      {/* Insights */}
    </AnalyticsAlertCard>
  </AnalyticsStack>
</PageContainer>
```

**Suggested consolidation:**
- Create `<AnalyticsPageLayout>` component that wraps this structure:
  ```javascript
  <AnalyticsPageLayout
    icon={Icon}
    title="..."
    subtitle="..."
    onFilterChange={setFilters}
    statCards={[...]}
    charts={[...]}
    insights={[...]}
  />
  ```

**Estimated removal: ~150–200 lines** (repeated page structure).  
**Severity: High** (5 pages, identical structure).

---

### 2.2 Multiple `useAnalyticsQuery` Calls — **MEDIUM**

**Locations:** All analytics pages have 5–11 `useAnalyticsQuery` calls:
- `Geographic.js`: 6 calls
- `Trends.js`: 7 calls
- `Performance.js`: 6 calls
- `DemographicsEconomics.js`: 7 calls
- `Budget.js`: 11 calls

**Pattern:** Similar pattern of multiple query calls with similar options.

**Note:** Already using `useAnalyticsQuery` hook (good!). Could create `useMultipleAnalyticsQueries()` hook to batch them, but current approach is fine.

**Severity: Low** (already using shared hook, minor optimization possible).

---

### 2.3 Filter State Management — **LOW**

**Locations:** All analytics pages: `const [filters, setFilters] = useState({});`

**Pattern:** Identical filter state management.

**Note:** Already using `AnalyticsFilter` component (good!). No duplication.

**Severity: N/A** (already consolidated).

---

## 3. Chart-Specific Patterns

### 3.1 BarChart Configuration — **HIGH**

**Locations:** 20+ BarChart instances across all pages

**Common props:**
- `CartesianGrid strokeDasharray="3 3" stroke="#e0e7ff"`
- `XAxis tick={{ fontSize: 11, fill: "#4b5563" }}` (often with `angle={-45}`, `textAnchor="end"`, `height={60}`)
- `YAxis tick={{ fontSize: 11, fill: "#4b5563" }}`
- `Tooltip` (sometimes with `formatter`)
- `Bar dataKey="..." fill="..." radius={[4, 4, 0, 0]}`

**Suggested consolidation:**
- Create `<AnalyticsBarChart>` component:
  ```javascript
  <AnalyticsBarChart
    data={data}
    dataKey="count"
    xAxisKey="month"
    xAxisAngle={-45}
    height={250}
    bars={[{ dataKey: "count", fill: "#3B82F6" }]}
  />
  ```

**Estimated removal: ~200–250 lines** (repeated BarChart configs).  
**Severity: High** (20+ BarChart instances).

---

### 3.2 PieChart Configuration — **MEDIUM**

**Locations:** 8+ PieChart instances across pages

**Common props:**
- `cx="50%" cy="50%" outerRadius={90|100}`
- `labelLine={false}`
- `label={({ name, percent }) => ...}`
- `dataKey="count"` or `dataKey="value"`
- `stroke="#fff"`
- `<Cell>` mapping with colors

**Suggested consolidation:**
- Create `<AnalyticsPieChart>` component:
  ```javascript
  <AnalyticsPieChart
    data={data}
    dataKey="count"
    nameKey="type"
    colors={COLORS}
    outerRadius={90}
    showLabel
  />
  ```

**Estimated removal: ~100–150 lines** (repeated PieChart configs).  
**Severity: Medium** (8+ PieChart instances).

---

### 3.3 LineChart/AreaChart Configuration — **MEDIUM**

**Locations:** 5+ LineChart/AreaChart instances

**Common props:**
- `CartesianGrid strokeDasharray="3 3" stroke="#e0e7ff"`
- `XAxis` with angle/height
- `YAxis` with fontSize
- `Tooltip`
- `Line`/`Area` with `type="monotone"`, `strokeWidth={2}`, `dot={{ ... }}`

**Suggested consolidation:**
- Create `<AnalyticsLineChart>` and `<AnalyticsAreaChart>` components.

**Estimated removal: ~80–120 lines** (repeated Line/Area chart configs).  
**Severity: Medium** (5+ instances).

---

## 4. Data Processing Patterns

### 4.1 Array Operations — **MEDIUM**

**Locations:** All analytics pages use similar array operations:
- `.filter(item => ...)`
- `.map(item => ({ ... }))`
- `.slice(0, 10)`
- `.reduce((acc, item) => { ... }, {})`
- `.sort((a, b) => ...)`

**Pattern:** Similar array transformation patterns.

**Note:** These are standard JavaScript patterns. Could create utility functions, but may be over-engineering.

**Severity: Low** (standard patterns, limited consolidation benefit).

---

### 4.2 Data Validation/Safety — **MEDIUM**

**Locations:** All pages have safety checks:
- `Array.isArray(data) ? data : []`
- `data?.length || 0`
- `data?.[0]?.field || "N/A"`
- `item.field || 0`

**Pattern:** Similar null/undefined safety patterns.

**Suggested consolidation:**
- Create `utils/dataSafety.js`:
  ```javascript
  export function safeArray(data) { return Array.isArray(data) ? data : []; }
  export function safeGet(data, path, defaultValue) { ... }
  export function safeCount(data) { return Array.isArray(data) ? data.length : 0; }
  ```

**Estimated removal: ~50–80 lines** (repeated safety checks).  
**Severity: Medium** (many occurrences, improves readability).

---

## 5. Specific File Analysis

### 5.1 Geographic.js (625 lines)

**Duplications:**
- Chart configurations (BarChart, PieChart) — ~80 lines
- Data transformation functions — ~50 lines
- Loading state aggregation — ~10 lines
- Color constants — ~10 lines
- Stat calculations — ~20 lines

**Total removable: ~170 lines** (27% reduction).

---

### 5.2 Trends.js (561 lines)

**Duplications:**
- Chart configurations (BarChart, LineChart, AreaChart, PieChart) — ~120 lines
- Data transformation functions — ~80 lines
- Loading state object — ~10 lines
- Stat calculations — ~30 lines
- Date formatting — ~20 lines

**Total removable: ~260 lines** (46% reduction).

---

### 5.3 Performance.js (517 lines)

**Duplications:**
- Chart configurations (BarChart, PieChart) — ~80 lines
- Data transformation functions — ~70 lines
- Color constants and helpers — ~30 lines
- Stat calculations — ~30 lines
- Table rendering (could use shared component) — ~40 lines

**Total removable: ~250 lines** (48% reduction).

---

### 5.4 DemographicsEconomics.js (591 lines)

**Duplications:**
- Chart configurations (BarChart, PieChart, AreaChart) — ~100 lines
- Data transformation functions — ~60 lines
- Color constants and helpers — ~40 lines
- Stat calculations — ~25 lines
- Date formatting — ~15 lines

**Total removable: ~240 lines** (41% reduction).

---

### 5.5 Budget.js (735 lines)

**Duplications:**
- Chart configurations (BarChart, LineChart, PieChart) — ~150 lines
- Color constants — ~10 lines
- Currency formatting (already a function, good!) — 0 lines
- Table rendering — ~60 lines
- Stat calculations in JSX — ~30 lines

**Total removable: ~250 lines** (34% reduction).

---

## 6. Summary: Estimated Lines Removed

| Category | Est. lines removed |
|----------|-------------------|
| Chart configuration boilerplate | ~300–400 |
| Data transformation functions | ~200–300 |
| Loading state aggregation | ~50–80 |
| Color constants and helpers | ~100–150 |
| Stat calculations | ~80–120 |
| Date formatting | ~40–60 |
| Page structure | ~150–200 |
| Data safety checks | ~50–80 |
| **Total (conservative)** | **~970–1,390** |
| **Total (with full refactoring)** | **~1,200–1,800** |

Analytics pages total: **~3,029 lines**  
**~1,200 / 3,029 ≈ 40%** reduction achievable with full refactoring.

---

## 7. Suggested Implementation Order

1. **Quick wins (low risk)**
   - Create `utils/chartColors.js` — consolidate color constants
   - Create `utils/dateFormatters.js` — consolidate date formatting
   - Create `utils/dataSafety.js` — consolidate safety checks
   - Create `utils/analyticsCalculations.js` — consolidate stat calculations

2. **Chart components (medium risk)**
   - Create `<AnalyticsBarChart>` component
   - Create `<AnalyticsPieChart>` component
   - Create `<AnalyticsLineChart>` component
   - Create `<AnalyticsAreaChart>` component

3. **Data transformations (low risk)**
   - Create `utils/dataTransformers.js` with reusable transformers
   - Replace local transform functions with utilities

4. **Loading states (low risk)**
   - Create `useLoadingStates()` hook
   - Replace manual loading aggregation

5. **Page layout (medium risk)**
   - Create `<AnalyticsPageLayout>` component (optional, may be too opinionated)

---

## 8. Files to Create or Touch

**New files:**
- `utils/chartColors.js` — color constants and helpers
- `utils/dateFormatters.js` — date formatting utilities
- `utils/dataSafety.js` — data safety utilities
- `utils/analyticsCalculations.js` — calculation utilities
- `utils/dataTransformers.js` — data transformation utilities
- `components/ChartComponents.js` — reusable chart components
- `hooks/useLoadingStates.js` — loading state aggregation hook

**Heavy edits:**
- `pages/analytics/Geographic.js` — use new components/utilities
- `pages/analytics/Trends.js` — use new components/utilities
- `pages/analytics/Performance.js` — use new components/utilities
- `pages/analytics/DemographicsEconomics.js` — use new components/utilities
- `pages/analytics/Budget.js` — use new components/utilities

---

## 9. Risk Assessment

| Refactoring | Risk Level | Reason |
|-------------|------------|--------|
| Create color utilities | **Safe** | Pure functions, easy to test |
| Create date formatters | **Safe** | Pure functions, easy to test |
| Create data safety utils | **Safe** | Pure functions, easy to test |
| Create calculation utils | **Safe** | Pure functions, easy to test |
| Create chart components | **Moderate** | Need to ensure all chart variations supported |
| Create data transformers | **Safe** | Pure functions, easy to test |
| Create loading states hook | **Safe** | Simple hook, easy to test |
| Create page layout component | **Moderate** | May be too opinionated, limits flexibility |

---

*Generated from static analysis of the QuickAid-Geomapping React frontend. Focus on safe, high-impact changes first.*
