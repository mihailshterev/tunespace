import httpClient from "@/shared/api/http-client";

export const createMerchandise = async (formData: FormData) => {
  try {
    const response = await httpClient.post("/Merchandise/create", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error creating merchandise:", error);
    throw error;
  }
};

export const getMerchandiseById = async (merchandiseId: string) => {
  try {
    const response = await httpClient.get(`/Merchandise/${merchandiseId}`);
    return response.data;
  } catch (error) {
    console.error(
      `Error fetching merchandise with ID ${merchandiseId}:`,
      error
    );
    throw error;
  }
};

export const getMerchandiseByBandId = async (bandId: string) => {
  try {
    const response = await httpClient.get(`/Merchandise/band/${bandId}`);
    return response.data;
  } catch (error) {
    console.error(
      `Error fetching merchandise for band with ID ${bandId}:`,
      error
    );
    throw error;
  }
};

export const getMerchandiseImage = async (merchandiseId: string) => {
  try {
    const response = await httpClient.get(
      `/Merchandise/${merchandiseId}/image`,
      {
        responseType: "blob",
      }
    );
    return URL.createObjectURL(response.data);
  } catch (error) {
    console.error(
      `Error fetching merchandise image for ID ${merchandiseId}:`,
      error
    );
    throw error;
  }
};

export const updateMerchandise = async (formData: FormData) => {
  try {
    const response = await httpClient.put("/Merchandise/update", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error updating merchandise:", error);
    throw error;
  }
};

export const deleteMerchandise = async (merchandiseId: string) => {
  try {
    const response = await httpClient.delete(`/Merchandise/${merchandiseId}`);
    return response.data;
  } catch (error) {
    console.error(
      `Error deleting merchandise with ID ${merchandiseId}:`,
      error
    );
    throw error;
  }
};
