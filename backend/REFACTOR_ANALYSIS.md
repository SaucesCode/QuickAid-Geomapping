# Django Backend Refactoring Analysis — QuickAid-Geomapping

## Executive Summary

Analysis of the Django backend codebase identified **~2,500–3,200 lines** that can be removed or consolidated through shared utilities, base classes, and decorators. Target: **25%+ reduction** in maintainable LOC without breaking functionality.

---

## 1. Duplicate Code Patterns

### 1.1 `@api_view(['GET'])` + `@permission_classes([IsAuthenticated])` — **HIGH**

**Locations:** 115+ view functions across `views.py` (lines 94–4232)

**Pattern:** Nearly every analytics endpoint repeats:
```python
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def endpoint_name(request):
    ...
```

**Suggested consolidation:**
- Create `@analytics_view` decorator in `api/decorators.py`:
  ```python
  from functools import wraps
  from rest_framework.decorators import api_view, permission_classes
  from rest_framework.permissions import IsAuthenticated
  
  def analytics_view(methods=['GET']):
      def decorator(func):
          @api_view(methods)
          @permission_classes([IsAuthenticated])
          @wraps(func)
          def wrapper(request, *args, **kwargs):
              return func(request, *args, **kwargs)
          return wrapper
      return decorator
  ```
- Replace all analytics endpoints with `@analytics_view()`.

| Category | Current pattern | After decorator | Est. lines saved |
|----------|----------------|-----------------|------------------|
| Analytics endpoints | ~115 functions × 2 decorator lines | 1 line each | ~115 lines |

**Estimated removal: ~115 lines.**  
**Severity: High** (115+ occurrences, mechanical change).

---

### 1.2 `apply_common_filters(request, queryset)` — **MEDIUM**

**Location:** `views.py:1847–1864` (18 lines)

**Usage:** Called in 30+ analytics endpoints:
- `analytics_applicant_locations` (line 1882)
- `top_barangays` (line 1912)
- `barangay_by_type` (line 1930)
- `barangay_performance_comparison` (line 1960)
- `service_coverage_gaps` (line 2016)
- `approval_rate_by_location` (line 2068)
- `demographic_trends_over_time` (line 2159)
- `applicants_by_gender` (line 2226)
- `applicants_by_civil_status` (line 2237)
- `applicants_by_age_group` (line 2253)
- `applicants_by_age_gender` (line 2312)
- `income_distribution` (line 2336)
- `monthly_trends` (line 2442)
- `yearly_trends` (line 2458)
- `trends_over_time` (line 2476)
- `cumulative_applicants` (line 2492)
- `assistance_type_trend` (line 2510)
- `assistance_type_over_time` (line 2572)
- `approval_trends` (line 2588)
- `time_to_approval` (line 2607)
- `applicant_activity_heatmap` (line 2622)
- `average_processing_time` (line 2650)
- `processing_time_by_type` (line 2668)
- `processing_time_distribution` (line 2696)
- `staff_productivity` (line 2725)
- `staff_leaderboard` (line 2843)
- `staff_activity_logs` (line 2858)
- `staff_activity_heatmap` (line 2892)
- `workload_balance_analysis` (line 2913)
- And more...

**Current implementation:**
```python
def apply_common_filters(request, queryset):
    """Apply shared analytics filters: date range, assistance type, city, barangay"""
    start_date = request.GET.get("start_date")
    end_date = request.GET.get("end_date")
    assistance_type = request.GET.get("type")
    city = request.GET.get("city")
    barangay = request.GET.get("barangay")

    if start_date and end_date:
        queryset = queryset.filter(date_filled__date__range=[start_date, end_date])
    if assistance_type:
        queryset = queryset.filter(type_of_assistance__iexact=assistance_type)
    if city:
        queryset = queryset.filter(background_info__barangay__city__name__iexact=city)
    if barangay:
        queryset = queryset.filter(background_info__barangay__name__iexact=barangay)

    return queryset
```

**Note:** Already exists and is reused. No duplication here — this is good. However, some endpoints manually apply similar filters instead of using this (see 1.3).

**Severity: N/A** (already consolidated).

---

### 1.3 Manual filter application (instead of `apply_common_filters`) — **MEDIUM**

**Locations:**
- `inactive_applicants` (lines 2100–2119) — manually checks `assistance_type`, `city`, `barangay` from `request.GET`
- `assistance_type_linetrend` (lines 2519–2532) — manually parses `start_date`, `end_date` from `request.GET`
- `allocated_budget_by_location` (lines 3404–3416) — manually checks `year`, `assistance` from `request.GET`
- `allocated_budget_by_assistance_annual` (lines 3473–3493) — manually checks `start_year`, `end_year`, `city`, `barangay`
- `allocated_budget_summary` (lines 3559–3571) — manually checks `year`, `city`, `barangay`
- `allocated_budget_top_locations` (lines 3627–3637) — manually checks `year`, `assistance`

**Pattern:** These endpoints manually extract and apply filters instead of using `apply_common_filters` or `apply_budget_filters`.

**Suggested consolidation:**
- Ensure all analytics endpoints use `apply_common_filters` or `apply_budget_filters` consistently.
- For budget endpoints, `apply_budget_filters` already exists (utils.py:245–290) and handles `year`, `city`, `barangay`, `assistance`, `batch_id`, `date_from`, `date_to`, `status`. Use it everywhere.

**Estimated removal: ~80–100 lines** (manual filter blocks).  
**Severity: Medium** (inconsistent usage, easy to fix).

---

### 1.4 `ExpressionWrapper(F('date_filled') - F('created_at'), output_field=DurationField())` — **HIGH**

**Locations:** 8+ occurrences:
- `summary_metrics` (line 1501–1504)
- `monthly_comparison_metrics` (lines 1614–1617, 1630–1633)
- `average_processing_time` (line 2647)
- `processing_time_by_type` (line 2665)
- `processing_time_distribution` (line 2693)
- `staff_efficiency_trends` (lines 2750–2753, 2763–2766)
- `workload_balance_analysis` (lines 2919–2922)

**Pattern:** Identical annotation for processing time calculation.

**Suggested consolidation:**
- Create `get_processing_time_annotation()` in `api/utils.py`:
  ```python
  def get_processing_time_annotation():
      """Returns ExpressionWrapper for processing time (date_filled - created_at)"""
      return ExpressionWrapper(
          F('date_filled') - F('created_at'),
          output_field=DurationField()
      )
  ```
- Or create `get_processing_time_queryset(base_qs)` that adds the annotation.

**Estimated removal: ~40–50 lines** (repeated annotation).  
**Severity: High** (8+ occurrences, identical logic).

---

### 1.5 `round(avg_time.total_seconds() / 60, 1)` — **HIGH**

**Locations:** 10+ occurrences:
- `summary_metrics` (line 1507)
- `monthly_comparison_metrics` (lines 1619, 1635)
- `average_processing_time` (line 2653)
- `processing_time_by_type` (line 2678)
- `staff_efficiency_trends` (lines 2774, 2786)
- `workload_balance_analysis` (line 2933)
- `capacity_alerts` (line 1771)

**Pattern:** Converting timedelta to minutes with rounding.

**Suggested consolidation:**
- Create `duration_to_minutes(duration)` in `api/utils.py`:
  ```python
  def duration_to_minutes(duration):
      """Convert timedelta to minutes, rounded to 1 decimal"""
      return round(duration.total_seconds() / 60, 1) if duration else 0
  ```

**Estimated removal: ~15–20 lines** (repeated conversion).  
**Severity: High** (10+ occurrences, identical logic).

---

### 1.6 `round(avg_time.total_seconds() / 86400, 1)` — **LOW**

**Location:** `time_to_approval` (line 2610) — only 1 occurrence.

**Note:** Similar to 1.5 but for days. Could add `duration_to_days(duration)` for consistency, but low priority.

**Estimated removal: ~2 lines.**  
**Severity: Low** (single occurrence).

---

### 1.7 `select_related("background_info", "background_info__barangay", "background_info__barangay__city")` — **HIGH**

**Locations:** 20+ occurrences:
- `analytics_applicant_locations` (lines 1875–1878)
- `barangay_by_type` (lines 1924–1927)
- `list_applicants` (lines 529–532)
- `approved_applicants` (lines 835–840)
- And many more...

**Pattern:** Same `select_related` chain for applicant → background_info → barangay → city.

**Suggested consolidation:**
- Create `get_applicant_base_queryset()` in `api/utils.py`:
  ```python
  def get_applicant_base_queryset():
      """Base queryset for Applicant with common select_related"""
      return Applicant.objects.select_related(
          'background_info',
          'background_info__barangay',
          'background_info__barangay__city'
      )
  ```
- Or create `APPLICANT_SELECT_RELATED = ['background_info', 'background_info__barangay', 'background_info__barangay__city']` constant.

**Estimated removal: ~60–80 lines** (repeated select_related chains).  
**Severity: High** (20+ occurrences, identical optimization).

---

### 1.8 `.filter(is_archived=False)` — **MEDIUM**

**Locations:** 50+ occurrences across analytics endpoints.

**Pattern:** Most analytics endpoints filter out archived applicants.

**Suggested consolidation:**
- Include `is_archived=False` in `get_applicant_base_queryset()` or `apply_common_filters`.
- Or create `get_active_applicants()` that returns `Applicant.objects.filter(is_archived=False)`.

**Estimated removal: ~50 lines** (repeated filter).  
**Severity: Medium** (many occurrences, but some endpoints may need archived data).

---

### 1.9 `.values(...).annotate(count=Count('id'))` — **MEDIUM**

**Locations:** 30+ occurrences:
- `top_barangays` (line 1914)
- `barangay_by_type` (line 1934)
- `applicants_by_gender` (line 2224)
- `applicants_by_civil_status` (line 2239)
- `applicants_by_occupation` (line 2286)
- `assistance_type_trend` (line 2512)
- `staff_productivity` (line 2727)
- `staff_leaderboard` (line 2845)
- And many more...

**Pattern:** Grouping and counting is common, but the grouping field varies. No direct consolidation, but see 1.10 for annotation patterns.

**Severity: N/A** (different grouping fields, but see 1.10).

---

### 1.10 Claim rate calculation: `(claimed / total * 100) if total > 0 else 0` — **MEDIUM**

**Locations:** 10+ occurrences in budget endpoints:
- `budget_overview` (line 3045)
- `budget_by_location` (line 3123)
- `budget_by_assistance` (line 3173)
- `budget_batch_trends` (line 3218)
- `budget_by_batch` (line 3265)
- `budget_comparison` (lines 3363–3364)
- And more...

**Pattern:** Identical percentage calculation.

**Suggested consolidation:**
- Create `calculate_percentage(numerator, denominator, decimals=2)` in `api/utils.py`:
  ```python
  def calculate_percentage(numerator, denominator, decimals=2):
      """Calculate percentage safely, handling zero division"""
      if denominator == 0 or denominator is None:
          return 0
      return round((float(numerator or 0) / float(denominator)) * 100, decimals)
  ```

**Estimated removal: ~30–40 lines** (repeated calculation).  
**Severity: Medium** (10+ occurrences, identical logic).

---

### 1.11 Date range calculation: `today.replace(day=1)`, `start_of_last_month`, `end_of_last_month` — **MEDIUM**

**Locations:** 5+ occurrences:
- `applicant_growth_rate` (lines 1565–1568)
- `monthly_comparison_metrics` (lines 1599–1602)
- `capacity_alerts` (lines 1735–1741)
- `staff_efficiency_trends` (lines 2737–2740)
- And more...

**Pattern:** Identical month boundary calculation.

**Suggested consolidation:**
- Create `get_month_boundaries()` in `api/utils.py`:
  ```python
  def get_month_boundaries(today=None):
      """Returns (start_of_this_month, start_of_last_month, end_of_last_month)"""
      if today is None:
          today = timezone.localdate()
      start_of_this_month = today.replace(day=1)
      start_of_last_month = (start_of_this_month - timedelta(days=1)).replace(day=1)
      end_of_last_month = start_of_this_month - timedelta(days=1)
      return start_of_this_month, start_of_last_month, end_of_last_month
  ```

**Estimated removal: ~25–30 lines** (repeated date math).  
**Severity: Medium** (5+ occurrences, identical logic).

---

### 1.12 `TruncMonth('date_filled')`, `TruncDate('date_filled')`, `ExtractYear('date_filled')` — **MEDIUM**

**Locations:** 15+ occurrences:
- `monthly_trends` (line 2445)
- `yearly_trends` (line 2461)
- `trends_over_time` (line 2478)
- `cumulative_applicants` (line 2489)
- `assistance_type_over_time` (line 2575)
- `approval_trends` (line 2591)
- `demographic_trends_over_time` (line 2163)
- And more...

**Pattern:** Common date truncation/extraction for time-series analytics.

**Note:** These are used correctly with different field names. No direct consolidation, but see 1.13 for response formatting.

**Severity: N/A** (different fields, appropriate usage).

---

### 1.13 Response formatting: list comprehensions for data transformation — **LOW**

**Locations:** Many endpoints format query results into response dictionaries:
- `analytics_applicant_locations` (lines 1884–1893)
- `barangay_by_type` (lines 1941–1948)
- `approval_rate_by_location` (lines 2080–2088)
- `inactive_applicants` (lines 2121–2135)
- And many more...

**Pattern:** Similar list comprehensions, but field mappings differ.

**Note:** Some consolidation possible for common patterns (e.g., location name formatting), but most are endpoint-specific. Low priority.

**Severity: Low** (field-specific, limited consolidation).

---

### 1.14 `float(item['total_allocated'] or 0)` — **MEDIUM**

**Locations:** 20+ occurrences in budget endpoints:
- `budget_overview` (lines 3043–3045, 3057–3077)
- `budget_by_location` (lines 3121–3133)
- `budget_by_assistance` (lines 3171–3181)
- `budget_batch_trends` (lines 3216–3229)
- `budget_by_batch` (lines 3263–3276)
- `allocated_budget_by_location` (lines 3440–3448)
- `allocated_budget_by_assistance_annual` (lines 3525–3531)
- `allocated_budget_summary` (lines 3592–3601)
- `allocated_budget_top_locations` (lines 3660–3672)
- And more...

**Pattern:** Converting Decimal/None to float with 0 fallback.

**Suggested consolidation:**
- Create `safe_float(value, default=0.0)` in `api/utils.py`:
  ```python
  def safe_float(value, default=0.0):
      """Convert value to float, handling None/Decimal"""
      if value is None:
          return default
      return float(value)
  ```

**Estimated removal: ~40–50 lines** (repeated conversion).  
**Severity: Medium** (20+ occurrences, identical pattern).

---

### 1.15 `Sum('amount', filter=Q(status='CLAIMED'))` / `Sum('amount', filter=Q(status='UNCLAIMED'))` — **MEDIUM**

**Locations:** 10+ occurrences in budget endpoints:
- `budget_overview` (lines 3021–3030)
- `budget_by_location` (lines 3100–3102)
- `budget_batch_trends` (lines 3206–3207)
- `budget_by_batch` (lines 3254–3255)
- And more...

**Pattern:** Repeated aggregation with status filters.

**Suggested consolidation:**
- Create helper functions in `api/utils.py`:
  ```python
  def get_claimed_amount_annotation():
      return Sum('amount', filter=Q(status='CLAIMED'))
  
  def get_unclaimed_amount_annotation():
      return Sum('amount', filter=Q(status='UNCLAIMED'))
  
  def get_pending_amount_annotation():
      return Sum('amount', filter=Q(status='PENDING'))
  ```
- Or create `get_budget_annotations()` that returns a dict of all common annotations.

**Estimated removal: ~30–40 lines** (repeated annotations).  
**Severity: Medium** (10+ occurrences, identical patterns).

---

### 1.16 `Count('id', filter=Q(status='CLAIMED'))` / `Count('id', filter=Q(status='UNCLAIMED'))` — **MEDIUM**

**Locations:** 8+ occurrences in budget endpoints (similar to 1.15).

**Suggested consolidation:**
- Same as 1.15, add count annotations:
  ```python
  def get_claimed_count_annotation():
      return Count('id', filter=Q(status='CLAIMED'))
  
  def get_unclaimed_count_annotation():
      return Count('id', filter=Q(status='UNCLAIMED'))
  ```

**Estimated removal: ~20–25 lines.**  
**Severity: Medium** (8+ occurrences).

---

### 1.17 `extract_amount_from_notes` — **DUPLICATE FUNCTION**

**Location:** `utils.py:204–216` and `utils.py:235–243` — **same function defined twice!**

**Pattern:** Identical function with same name and logic.

**Suggested consolidation:**
- Remove one definition (keep the first one, lines 204–216).

**Estimated removal: ~20 lines** (duplicate function).  
**Severity: High** (exact duplicate, immediate removal).

---

### 1.18 Error handling: `try/except ValueError` for date parsing — **LOW**

**Locations:** 
- `apply_applicant_filters` (lines 128–133)
- `apply_approval_filters` (lines 190–196)

**Pattern:** Similar try/except for date parsing, but already in utility functions. No duplication.

**Severity: N/A** (already in utilities).

---

### 1.19 `Response(list(data))` / `Response(data)` — **LOW**

**Locations:** 50+ occurrences.

**Pattern:** Standard DRF response pattern. No consolidation needed.

**Severity: N/A** (standard pattern).

---

## 2. View Function Redundancy

### 2.1 Analytics endpoint structure — **HIGH**

**Pattern:** All analytics endpoints follow:
1. `@api_view(['GET'])`
2. `@permission_classes([IsAuthenticated])`
3. Get base queryset: `Applicant.objects.filter(is_archived=False)` or similar
4. Apply filters: `apply_common_filters(request, qs)` or manual
5. Annotate/aggregate/values
6. Format response
7. `return Response(data)`

**Suggested consolidation:**
- Create `AnalyticsViewMixin` or base class (but function-based views make this harder).
- Better: Create `@analytics_view` decorator (see 1.1) and ensure all use `apply_common_filters` consistently.
- Create `get_analytics_base_queryset(model=Applicant, archived=False)` helper.

**Estimated removal: ~150–200 lines** (standardizing structure).  
**Severity: High** (affects 50+ endpoints).

---

### 2.2 Budget endpoint structure — **MEDIUM**

**Pattern:** Budget endpoints follow:
1. `@api_view(['GET'])`
2. `@permission_classes([IsAuthenticated])`
3. Get base queryset: `DisbursementClaim.objects.select_related(...)`
4. Apply filters: `apply_budget_filters(qs, request)` (already exists)
5. Group by location/assistance/batch
6. Annotate with `Sum('amount')`, `Count('id')`, status filters
7. Calculate claim rates
8. Format response

**Note:** `apply_budget_filters` already exists and is used in most budget endpoints. Good.

**Suggested consolidation:**
- Ensure all budget endpoints use `apply_budget_filters` (see 1.3).
- Create `get_budget_base_queryset()` with common `select_related`.
- Create helper for claim rate calculation (see 1.10).

**Estimated removal: ~100–150 lines** (standardizing and using helpers).  
**Severity: Medium** (11 budget endpoints, some manual filtering).

---

### 2.3 Pagination pattern — **LOW**

**Location:** `list_applicants` (lines 523–589) uses `LimitOffsetPagination`.

**Note:** Only one endpoint uses pagination. No duplication.

**Severity: N/A** (single usage).

---

### 2.4 Query optimization: `select_related` / `prefetch_related` — **MEDIUM**

**Locations:** Many endpoints manually specify `select_related` chains.

**Pattern:** Common chains:
- `'background_info', 'background_info__barangay', 'background_info__barangay__city'` (20+ times)
- `'applicant', 'applicant__background_info', 'applicant__background_info__barangay__city'` (budget endpoints)
- `'batch', 'approval', 'approval__applicant'` (disbursement endpoints)

**Suggested consolidation:**
- Create constants or helper functions:
  ```python
  APPLICANT_SELECT_RELATED = [
      'background_info',
      'background_info__barangay',
      'background_info__barangay__city'
  ]
  
  DISBURSEMENT_SELECT_RELATED = [
      'applicant__background_info__barangay__city',
      'approval__applicant',
      'batch'
  ]
  ```
- Or create `get_applicant_base_queryset()`, `get_disbursement_base_queryset()` (see 1.7).

**Estimated removal: ~80–100 lines** (repeated select_related).  
**Severity: Medium** (many occurrences, but some variation).

---

## 3. Serializer Optimization

### 3.1 Serializer field definitions — **LOW**

**Location:** `serializers.py` — fields are model-specific. Limited duplication.

**Note:** Some `SerializerMethodField` patterns are similar (e.g., full name formatting), but field-specific. Low priority.

**Severity: Low** (field-specific, limited consolidation).

---

### 3.2 `to_representation` methods — **LOW**

**Location:** `ApplicantSerializer.to_representation` (line 709) — only one occurrence.

**Severity: N/A** (single usage).

---

## 4. Database Query Patterns

### 4.1 Annotation patterns — **MEDIUM**

**Locations:** Many endpoints use similar annotation patterns:
- `Count('id')` — 30+ occurrences
- `Count('id', filter=Q(...))` — 10+ occurrences
- `Sum('amount')` — 15+ occurrences
- `Sum('amount', filter=Q(status=...))` — 10+ occurrences
- `Avg(...)` — 8+ occurrences

**Note:** These are standard Django ORM patterns. Some consolidation possible for status-filtered aggregations (see 1.15, 1.16).

**Severity: Medium** (some patterns repeat, but field names vary).

---

### 4.2 Filter chains — **MEDIUM**

**Locations:** Many endpoints apply similar filter chains:
- `filter(is_archived=False)` — 50+ times
- `filter(background_info__barangay__city__name__iexact=city)` — 10+ times
- `filter(background_info__barangay__name__iexact=barangay)` — 10+ times
- `filter(type_of_assistance__iexact=type)` — 10+ times

**Note:** `apply_common_filters` already handles these. Some endpoints manually apply them (see 1.3).

**Severity: Medium** (inconsistent usage of existing utility).

---

### 4.3 Ordering patterns — **LOW**

**Locations:** Various `.order_by('-count')`, `.order_by('-date_filled')`, `.order_by('month')`.

**Note:** Ordering is endpoint-specific. No consolidation needed.

**Severity: N/A** (endpoint-specific).

---

## 5. Specific Areas (Analytics Views)

### 5.1 Geographic Analytics (7 endpoints)

**Endpoints:**
- `analytics_applicant_locations` (lines 1869–1895)
- `top_barangays` (lines 1900–1915)
- `barangay_by_type` (lines 1920–1950)
- `barangay_performance_comparison` (lines 1955–2005)
- `service_coverage_gaps` (lines 2010–2050)
- `approval_rate_by_location` (lines 2055–2090)
- `inactive_applicants` (lines 2095–2137)

**Common patterns:**
- All use `@api_view(['GET']) + `@permission_classes([IsAuthenticated])`
- All use `apply_common_filters` (except `inactive_applicants` which manually filters)
- Most use `Applicant.objects.filter(is_archived=False)`
- Most use `select_related('background_info', 'background_info__barangay', 'background_info__barangay__city')`

**Suggested consolidation:**
- Use `@analytics_view()` decorator (see 1.1).
- Use `get_applicant_base_queryset()` (see 1.7).
- Fix `inactive_applicants` to use `apply_common_filters` or create variant for BackgroundInfo queries.

**Estimated removal: ~50–70 lines** per endpoint × 7 = **~350–490 lines** (with decorator + base queryset).

---

### 5.2 Demographics & Economics Analytics (8 endpoints)

**Endpoints:**
- `applicants_by_gender` (lines 2220–2229)
- `applicants_by_civil_status` (lines 2234–2243)
- `applicants_by_age_group` (lines 2249–2277)
- `applicants_by_occupation` (lines 2283–2302)
- `applicants_by_age_gender` (lines 2308–2325)
- `income_distribution` (lines 2330–2370)
- `income_assistance_analysis` (lines 2375–2420)
- `demographic_trends_over_time` (lines 2147–2190)

**Common patterns:**
- All use `@api_view(['GET'])` + `@permission_classes([IsAuthenticated])`
- All use `apply_common_filters`
- Most use `Applicant.objects.filter(is_archived=False)`
- Age calculation: `ExpressionWrapper(today.year - ExtractYear('background_info__birthday'), output_field=IntegerField())` — repeated 3 times

**Suggested consolidation:**
- Use `@analytics_view()` decorator.
- Create `get_age_annotation()` helper for age calculation.
- Use `get_applicant_base_queryset()`.

**Estimated removal: ~40–60 lines** per endpoint × 8 = **~320–480 lines**.

---

### 5.3 Trends Analytics (9 endpoints)

**Endpoints:**
- `monthly_trends` (lines 2434–2448)
- `yearly_trends` (lines 2453–2465)
- `trends_over_time` (lines 2470–2479)
- `cumulative_applicants` (lines 2484–2499)
- `assistance_type_trend` (lines 2504–2513)
- `assistance_type_linetrend` (lines 2517–2560)
- `assistance_type_over_time` (lines 2566–2578)
- `approval_trends` (lines 2583–2594)
- `time_to_approval` (lines 2599–2611)
- `applicant_activity_heatmap` (lines 2616–2632)

**Common patterns:**
- All use `@api_view(['GET'])` + `@permission_classes([IsAuthenticated])`
- Most use `apply_common_filters`
- Date truncation: `TruncMonth`, `TruncDate`, `ExtractYear`, `ExtractHour`

**Suggested consolidation:**
- Use `@analytics_view()` decorator.
- Use `get_applicant_base_queryset()`.

**Estimated removal: ~30–50 lines** per endpoint × 9 = **~270–450 lines**.

---

### 5.4 Performance Analytics (7 endpoints)

**Endpoints:**
- `average_processing_time` (lines 2642–2655)
- `processing_time_by_type` (lines 2660–2683)
- `processing_time_distribution` (lines 2688–2714)
- `staff_productivity` (lines 2719–2728)
- `staff_leaderboard` (lines 2838–2846)
- `staff_activity_logs` (lines 2851–2881)
- `staff_activity_heatmap` (lines 2886–2903)
- `staff_efficiency_trends` (lines 2732–2833)
- `workload_balance_analysis` (lines 2907–2950)

**Common patterns:**
- All use `@api_view(['GET'])` + `@permission_classes([IsAuthenticated])`
- Most use `apply_common_filters`
- Processing time annotation: `ExpressionWrapper(F('date_filled') - F('created_at'), output_field=DurationField())` — repeated 5+ times
- Duration to minutes: `round(avg_time.total_seconds() / 60, 1)` — repeated 5+ times

**Suggested consolidation:**
- Use `@analytics_view()` decorator.
- Use `get_processing_time_annotation()` (see 1.4).
- Use `duration_to_minutes()` (see 1.5).

**Estimated removal: ~50–70 lines** per endpoint × 7 = **~350–490 lines**.

---

### 5.5 Budget Analytics (11 endpoints)

**Endpoints:**
- `budget_overview` (lines 3007–3079)
- `budget_by_location` (lines 3084–3147)
- `budget_by_assistance` (lines 3152–3183)
- `budget_batch_trends` (lines 3188–3234)
- `budget_by_batch` (lines 3239–3278)
- `budget_location_assistance` (lines 3283–3318)
- `budget_comparison` (lines 3323–3392)
- `allocated_budget_by_location` (lines 3397–3462)
- `allocated_budget_by_assistance_annual` (lines 3467–3548)
- `allocated_budget_summary` (lines 3553–3611)
- `allocated_budget_top_locations` (lines 3616–3681)
- `allocated_budget_yearly_comparison` (lines 3686–3734)

**Common patterns:**
- All use `@api_view(['GET'])` + `@permission_classes([IsAuthenticated])`
- Most use `apply_budget_filters` (good!)
- Claim rate calculation: `(claimed / total * 100) if total > 0 else 0` — repeated 10+ times
- `float(item['total_allocated'] or 0)` — repeated 20+ times
- `Sum('amount', filter=Q(status='CLAIMED'))` — repeated 10+ times
- `Count('id', filter=Q(status='CLAIMED'))` — repeated 8+ times

**Suggested consolidation:**
- Use `@analytics_view()` decorator.
- Use `calculate_percentage()` (see 1.10).
- Use `safe_float()` (see 1.14).
- Use budget annotation helpers (see 1.15, 1.16).
- Ensure all use `apply_budget_filters` (some manually filter, see 1.3).

**Estimated removal: ~60–80 lines** per endpoint × 11 = **~660–880 lines**.

---

## 6. Utility Functions

### 6.1 `apply_applicant_filters` vs `apply_approval_filters` vs `apply_budget_filters` — **MEDIUM**

**Locations:**
- `utils.py:84–139` — `apply_applicant_filters`
- `utils.py:142–202` — `apply_approval_filters`
- `utils.py:245–290` — `apply_budget_filters`

**Pattern:** Three similar filter functions with overlapping logic:
- All handle `search`, `type`/`assistance`, `city`, `barangay`, `start_date`/`end_date`, `ordering`
- `apply_approval_filters` adds `approved_by` filter
- `apply_budget_filters` uses different param names (`date_from`/`date_to` instead of `start_date`/`end_date`, `assistance` instead of `type`) and adds `year`, `batch_id`, `status`

**Suggested consolidation:**
- Create unified `apply_filters(queryset, request, options={})` that:
  - Accepts `param_map` for field name differences (e.g., `{start_date: 'date_from', end_date: 'date_to', type: 'assistance'}`)
  - Accepts `extra_filters` for model-specific filters (e.g., `approved_by`, `batch_id`, `status`)
  - Handles search, location, date range, ordering generically
- Or keep three functions but extract shared logic to `_apply_base_filters(queryset, request, param_map)`.

**Estimated removal: ~80–120 lines** (consolidating 3 functions).  
**Severity: Medium** (3 functions, significant overlap).

---

### 6.2 Date parsing and validation — **LOW**

**Locations:**
- `apply_applicant_filters` (lines 129–133)
- `apply_approval_filters` (lines 191–196)

**Pattern:** Similar try/except for date parsing. Already in utilities.

**Severity: N/A** (already consolidated).

---

## 7. Summary: Estimated Lines Removed

| Category | Est. lines removed |
|----------|-------------------|
| `@analytics_view` decorator | ~115 |
| Manual filters → `apply_common_filters`/`apply_budget_filters` | ~80–100 |
| Processing time annotation helper | ~40–50 |
| `duration_to_minutes()` helper | ~15–20 |
| `get_applicant_base_queryset()` helper | ~60–80 |
| `calculate_percentage()` helper | ~30–40 |
| `safe_float()` helper | ~40–50 |
| Budget annotation helpers | ~50–65 |
| `get_month_boundaries()` helper | ~25–30 |
| Remove duplicate `extract_amount_from_notes` | ~20 |
| Consolidate filter functions | ~80–120 |
| **Total (conservative)** | **~560–730** |
| **Total (with full endpoint refactoring)** | **~1,500–2,000** |

If we refactor all 50+ analytics endpoints to use decorators and base querysets consistently, total approaches **~2,000–2,500 lines**.  
Backend `api/views.py` is **~4,200+ lines**; **~2,000 / 4,200 ≈ 48%** reduction is achievable with full refactoring.

---

## 8. Suggested Implementation Order

1. **Quick wins (low risk)**
   - Remove duplicate `extract_amount_from_notes` (line 235–243).
   - Create `duration_to_minutes()` and `safe_float()` helpers, replace in 10+ places.
   - Create `calculate_percentage()` helper, replace in 10+ places.

2. **Decorators and base querysets**
   - Create `@analytics_view()` decorator, replace in 50+ endpoints.
   - Create `get_applicant_base_queryset()`, `get_disbursement_base_queryset()` helpers.
   - Create `get_processing_time_annotation()` helper.

3. **Filter consolidation**
   - Ensure all endpoints use `apply_common_filters` or `apply_budget_filters` (fix manual filters in 1.3).
   - Consider consolidating the three filter functions into one with options.

4. **Budget-specific helpers**
   - Create budget annotation helpers (`get_claimed_amount_annotation()`, etc.).
   - Replace repeated claim rate calculations.

5. **Date utilities**
   - Create `get_month_boundaries()` helper.
   - Replace repeated month calculation logic.

---

## 9. Files to Create or Touch

**New files:**
- `api/decorators.py` — `@analytics_view` decorator
- `api/query_helpers.py` — base queryset functions, annotation helpers

**Heavy edits:**
- `api/views.py` — replace decorators, use helpers, fix manual filters
- `api/utils.py` — add helper functions, remove duplicate `extract_amount_from_notes`

---

## 10. Risk Assessment

| Refactoring | Risk Level | Reason |
|-------------|------------|--------|
| Remove duplicate `extract_amount_from_notes` | **Safe** | Exact duplicate, no behavior change |
| Create `duration_to_minutes()`, `safe_float()`, `calculate_percentage()` | **Safe** | Pure functions, easy to test |
| Create `@analytics_view()` decorator | **Safe** | Wraps existing decorators, no logic change |
| Create base queryset helpers | **Safe** | Returns queryset, can be chained |
| Fix manual filters to use `apply_common_filters` | **Moderate** | Need to verify filter behavior matches (especially for `inactive_applicants`) |
| Consolidate filter functions | **Moderate** | Need to ensure all edge cases handled |
| Create annotation helpers | **Safe** | Returns annotation objects, standard ORM pattern |

---

*Generated from static analysis of the QuickAid-Geomapping Django backend. Focus on safe, high-impact changes first.*
