import { useQuery } from "@tanstack/react-query";
import { getCountries } from "@/features/band/api/countries.service";

const ONE_DAY = 24 * 60 * 60 * 1000;

// The country list barely changes, so it is fetched at most once a day.
const useCountries = () =>
  useQuery({
    queryKey: ["countries"],
    queryFn: getCountries,
    staleTime: ONE_DAY,
    gcTime: ONE_DAY,
  });

export default useCountries;
