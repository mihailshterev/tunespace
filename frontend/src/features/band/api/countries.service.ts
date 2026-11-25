const COUNTRIES_URL = "https://countriesnow.space/api/v0.1/countries";

export interface CountriesResponse {
  data: { country: string; cities: string[] }[];
}

export const getCountries = async (): Promise<CountriesResponse> => {
  const response = await fetch(COUNTRIES_URL);

  if (!response.ok) {
    throw new Error("Failed to fetch countries");
  }

  return response.json();
};
