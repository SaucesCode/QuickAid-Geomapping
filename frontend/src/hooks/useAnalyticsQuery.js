import { useQuery } from "@tanstack/react-query";
import { api } from "../services/api";

/**
 * Builds query string from filters for analytics endpoints.
 * @param {Object} filters - { start, end, type, city, barangay, ... }
 * @param {Object} opts - { paramMap, extraKeys }
 *   - paramMap: { start_date?, end_date?, type? } override param names (e.g. Budget: start_date->date_from, end_date->date_to, type->assistance)
 *   - extraKeys: ["batch_id"] — append filters[key] if present
 * @returns {string} "key=val&key2=val2" or ""
 */
export function buildAnalyticsQueryString(filters, { paramMap = {}, extraKeys = [] } = {}) {
  const p = new URLSearchParams();
  const startKey = paramMap.start_date || "start_date";
  const endKey = paramMap.end_date || "end_date";
  const typeKey = paramMap.type || "type";

  if (filters.start) p.append(startKey, filters.start);
  if (filters.end) p.append(endKey, filters.end);
  if (filters.type) p.append(typeKey, filters.type);
  if (filters.city) p.append("city", filters.city);
  if (filters.barangay) p.append("barangay", filters.barangay);
  extraKeys.forEach(k => {
    if (filters[k] != null && filters[k] !== "") p.append(k, filters[k]);
  });
  return p.toString();
}

/**
 * useQuery wrapper for analytics: builds query from filters and calls api.get(endpoint).
 * Handles endpoints that already contain "?" (appends with "&").
 *
 * @param {string} endpoint - e.g. "/analytics/geographic/locations/"
 * @param {Object} filters - filter state
 * @param {Object} options - { queryKey, subKey, staleTime, paramMap, extraKeys, ...rest } — rest passed to useQuery
 *   - queryKey: full key, e.g. ["geographic", "locations", filters]. If omitted, built from endpoint + subKey.
 *   - subKey: used as queryKey[1] when queryKey not provided.
 *   - paramMap: { start_date?, end_date?, type? } to rename params (e.g. Budget: date_from, date_to, assistance).
 *   - extraKeys: e.g. ["batch_id"] to append from filters.
 */
export function useAnalyticsQuery(endpoint, filters, options = {}) {
  const {
    queryKey: customKey,
    subKey,
    staleTime = 1000 * 60 * 10,
    paramMap,
    extraKeys,
    ...rest
  } = options;

  const parts = endpoint.split("/").filter(Boolean);
  const domain = parts[1] || "analytics";
  const sub = subKey ?? parts[2] ?? "data";
  const queryKey = customKey != null ? customKey : [domain, sub, filters];

  return useQuery({
    queryKey,
    queryFn: async () => {
      const q = buildAnalyticsQueryString(filters, { paramMap, extraKeys });
      const url = q
        ? endpoint.includes("?")
          ? `${endpoint}&${q}`
          : `${endpoint}?${q}`
        : endpoint;
      const res = await api.get(url);
      return res.data;
    },
    staleTime,
    refetchOnWindowFocus: false,
    ...rest,
  });
}
