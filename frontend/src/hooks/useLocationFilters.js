import { useQuery } from "@tanstack/react-query";
import { api } from "../services/api";

/**
 * Fetches cities and barangays from /applicant-locations/filters/ for location dropdowns.
 * @param {string} city - Selected city (barangays fetch is enabled only when truthy).
 * @returns {{ cities: string[], barangays: string[], isFetchingCities: boolean, isFetchingBarangays: boolean }}
 */
export function useLocationFilters(city) {
  const { data: cities = [], isFetching: isFetchingCities } = useQuery({
    queryKey: ["citiesWithApplicants"],
    queryFn: async () => {
      const res = await api.get("/applicant-locations/filters/");
      return res.data.cities || [];
    },
    staleTime: 1000 * 60 * 10,
  });

  const { data: barangays = [], isFetching: isFetchingBarangays } = useQuery({
    queryKey: ["barangaysByCity", city],
    queryFn: async () => {
      if (!city) return [];
      const res = await api.get(`/applicant-locations/filters/?city=${city}`);
      return res.data.barangays || [];
    },
    enabled: !!city,
    staleTime: 1000 * 60 * 5,
  });

  return { cities, barangays, isFetchingCities, isFetchingBarangays };
}
