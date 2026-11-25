import { HttpError } from "@/shared/api/http-client";

/**
 * Returns the server's explanation for a failed request when it sent one as plain text
 * (e.g. a 409 explaining why a band change isn't allowed), otherwise the fallback.
 */
export const getErrorMessage = (error: unknown, fallback: string): string => {
  const data = error instanceof HttpError ? error.response?.data : undefined;
  return typeof data === "string" && data.trim() ? data : fallback;
};
