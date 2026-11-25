/* eslint-disable @typescript-eslint/no-explicit-any */
import { useMemo, useState } from "react";

const useLocationData = (locationData: any) => {
  const [selectedCountry, setSelectedCountry] = useState("");
  const [selectedCity, setSelectedCity] = useState("");

  const countries = useMemo(
    () =>
      locationData?.data?.map((country: any) => ({
        value: country.country,
        label: country.country,
      })) || [],
    [locationData]
  );

  const cities = useMemo(() => {
    if (!selectedCountry) return [];
    return (
      locationData?.data
        ?.find(
          (item: any) =>
            item.country.toLowerCase() === selectedCountry.toLowerCase()
        )
        ?.cities.map((city: any) => ({ value: city, label: city })) || []
    );
  }, [selectedCountry, locationData]);

  return {
    selectedCountry,
    setSelectedCountry,
    selectedCity,
    setSelectedCity,
    countries,
    cities,
  };
};

export default useLocationData;
