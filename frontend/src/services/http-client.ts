/* eslint-disable @typescript-eslint/no-explicit-any */
import { useAuthStore } from "@/stores/auth-store";
import { BASE_URL } from "@/utils/constants";
import { refreshToken } from "./auth-service";

type HttpMethod = "GET" | "POST" | "PUT" | "DELETE" | "PATCH";

export interface RequestConfig {
  headers?: Record<string, string>;
  params?: Record<string, any>;
  withCredentials?: boolean;
  responseType?: "json" | "blob" | "text";
  signal?: AbortSignal;
  _retry?: boolean;
}

export interface HttpResponse<T = any> {
  data: T;
  status: number;
  statusText: string;
  headers: Record<string, string>;
}

interface ErrorResponse {
  status: number;
  statusText: string;
  data: any;
  headers: Record<string, string>;
}

export class HttpError extends Error {
  response?: ErrorResponse;
  config?: RequestConfig;

  constructor(
    message: string,
    response?: ErrorResponse,
    config?: RequestConfig,
  ) {
    super(message);
    this.name = "HttpError";
    this.response = response;
    this.config = config;
    Object.setPrototypeOf(this, HttpError.prototype);
  }
}

interface QueueItem {
  resolve: (value?: any) => void;
  reject: (error?: any) => void;
}

let isRefreshing = false;
let failedQueue: QueueItem[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });

  failedQueue = [];
};

const isAbsoluteURL = (url: string): boolean =>
  /^([a-z][a-z\d+\-.]*:)?\/\//i.test(url);

const buildUrl = (url: string, params?: Record<string, any>): string => {
  let fullUrl = isAbsoluteURL(url)
    ? url
    : `${BASE_URL.replace(/\/+$/, "")}/${url.replace(/^\/+/, "")}`;

  if (params) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.append(key, String(value));
      }
    });

    const queryString = searchParams.toString();
    if (queryString) {
      fullUrl += (fullUrl.includes("?") ? "&" : "?") + queryString;
    }
  }

  return fullUrl;
};

const hasHeader = (headers: Record<string, string>, name: string): boolean =>
  Object.keys(headers).some((key) => key.toLowerCase() === name.toLowerCase());

const buildHeaders = (config: RequestConfig): Record<string, string> => {
  const headers: Record<string, string> = {};

  if (config.headers) {
    Object.entries(config.headers).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        headers[key] = String(value);
      }
    });
  }

  if (!hasHeader(headers, "Authorization")) {
    const authToken = useAuthStore.getState().auth.accessToken;
    if (authToken) {
      headers["Authorization"] = `Bearer ${authToken}`;
    }
  }

  return headers;
};

const prepareBody = (
  data: any,
  headers: Record<string, string>,
): BodyInit | undefined => {
  if (data === undefined || data === null) {
    return undefined;
  }

  if (typeof FormData !== "undefined" && data instanceof FormData) {
    Object.keys(headers).forEach((key) => {
      if (key.toLowerCase() === "content-type") {
        delete headers[key];
      }
    });
    return data;
  }

  if (data instanceof Blob || data instanceof ArrayBuffer) {
    return data;
  }

  if (typeof data === "string") {
    if (!hasHeader(headers, "Content-Type")) {
      headers["Content-Type"] = "application/json";
    }
    return data;
  }

  if (!hasHeader(headers, "Content-Type")) {
    headers["Content-Type"] = "application/json";
  }
  return JSON.stringify(data);
};

const headersToObject = (headers: Headers): Record<string, string> => {
  const obj: Record<string, string> = {};
  headers.forEach((value, key) => {
    obj[key] = value;
  });
  return obj;
};

const parseBody = async (
  response: Response,
  responseType: RequestConfig["responseType"],
): Promise<any> => {
  if (responseType === "blob") {
    return response.blob();
  }
  if (responseType === "text") {
    return response.text();
  }

  const text = await response.text();
  if (!text) {
    return null;
  }

  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
};

const request = async <T = any>(
  method: HttpMethod,
  url: string,
  data?: any,
  config: RequestConfig = {},
): Promise<HttpResponse<T>> => {
  const headers = buildHeaders(config);
  const body =
    method === "GET" || method === "DELETE"
      ? undefined
      : prepareBody(data, headers);

  const response = await fetch(buildUrl(url, config.params), {
    method,
    headers,
    body,
    credentials: config.withCredentials === false ? "same-origin" : "include",
    signal: config.signal,
  });

  if (response.status === 401 && !config._retry) {
    return handleUnauthorized<T>(method, url, data, config);
  }

  const responseData = await parseBody(response, config.responseType);

  if (!response.ok) {
    throw new HttpError(
      `Request failed with status code ${response.status}`,
      {
        status: response.status,
        statusText: response.statusText,
        data: responseData,
        headers: headersToObject(response.headers),
      },
      config,
    );
  }

  return {
    data: responseData as T,
    status: response.status,
    statusText: response.statusText,
    headers: headersToObject(response.headers),
  };
};

const handleUnauthorized = async <T>(
  method: HttpMethod,
  url: string,
  data: any,
  config: RequestConfig,
): Promise<HttpResponse<T>> => {
  const updateAuth = useAuthStore.getState().updateAuth;
  const clearAuth = useAuthStore.getState().clearAuth;

  const retryConfig: RequestConfig = { ...config, _retry: true };

  if (isRefreshing) {
    return new Promise<void>((resolve, reject) => {
      failedQueue.push({ resolve, reject });
    }).then(() => request<T>(method, url, data, retryConfig));
  }

  isRefreshing = true;

  try {
    const response = await refreshToken();

    updateAuth({ accessToken: response.accessToken });

    processQueue(null, response.accessToken);

    return await request<T>(method, url, data, retryConfig);
  } catch (err) {
    processQueue(err, null);
    clearAuth();
    throw err;
  } finally {
    isRefreshing = false;
  }
};

const httpClient = {
  get: <T = any>(url: string, config?: RequestConfig) =>
    request<T>("GET", url, undefined, config),
  delete: <T = any>(url: string, config?: RequestConfig) =>
    request<T>("DELETE", url, undefined, config),
  post: <T = any>(url: string, data?: any, config?: RequestConfig) =>
    request<T>("POST", url, data, config),
  put: <T = any>(url: string, data?: any, config?: RequestConfig) =>
    request<T>("PUT", url, data, config),
  patch: <T = any>(url: string, data?: any, config?: RequestConfig) =>
    request<T>("PATCH", url, data, config),
};

export default httpClient;
