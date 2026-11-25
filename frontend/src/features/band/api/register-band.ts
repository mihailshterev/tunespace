import httpClient from "@/shared/api/http-client";
import { ENDPOINTS } from "@/shared/utils/constants";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const registerBand = async (data: { [key: string]: any }) => {
  const formData = new FormData();
  for (const key in data) {
    formData.append(key, data[key]);
  }

  const response = await httpClient.post(
    `${ENDPOINTS.BANDREGISTER}`,
    formData,
    {
      headers: { "Content-Type": "multipart/form-data" },
    }
  );

  return response.data;
};
