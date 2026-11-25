import httpClient from "@/shared/api/http-client";
import { ENDPOINTS } from "@/shared/utils/constants";

export interface LoginData {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  role: string;
}

export interface AuthResponse {
  id: string;
  username: string;
  email?: string;
  accessToken: string;
  role: string;
  isExternalProvider?: boolean;
}

export interface ForgotPasswordData {
  email: string;
}

export interface ResetPasswordData {
  userId: string;
  token: string;
  newPassword: string;
}

export interface ChangeEmailData {
  newEmail: string;
}

export interface ConfirmEmailChangeData {
  userId: string;
  token: string;
  newEmail: string;
}

export const checkCurrentUser = async (): Promise<AuthResponse | null> => {
  try {
    const response = await httpClient.get(ENDPOINTS.CURRENT_USER, {
      withCredentials: true,
    });

    return {
      id: response.data.id,
      username: response.data.username,
      email: response.data.email,
      accessToken: "",
      role: response.data.role,
      isExternalProvider: !!response.data.externalProvider,
    };
  } catch {
    return null;
  }
};

export const login = async (data: LoginData): Promise<AuthResponse> => {
  const response = await httpClient.post(
    ENDPOINTS.LOGIN,
    JSON.stringify(data),
    {
      headers: { "Content-Type": "application/json" },
    }
  );

  return {
    id: response?.data?.id,
    username: response?.data?.username,
    email: response?.data?.email,
    accessToken: response?.data?.accessToken,
    role: response?.data?.role,
    isExternalProvider: !!response?.data?.externalProvider,
  };
};

export const register = async (data: RegisterData): Promise<{ id: string }> => {
  const response = await httpClient.post(
    ENDPOINTS.REGISTER,
    JSON.stringify(data),
    {
      headers: { "Content-Type": "application/json" },
    }
  );

  return {
    id: response?.data?.id,
  };
};

export const refreshToken = async (): Promise<AuthResponse> => {
  const response = await httpClient.post(
    ENDPOINTS.REFRESH_TOKEN,
    {},
    {
      withCredentials: true,
    }
  );

  return {
    id: response.data.id,
    username: response.data.username,
    accessToken: response.data.newAccessToken,
    role: response.data.role,
  };
};

export const logout = async (): Promise<void> => {
  try {
    await httpClient.post(
      ENDPOINTS.LOGOUT,
      {},
      {
        withCredentials: true,
      }
    );
  } catch (error) {
    console.log(error);
  }
};

export const confirmEmail = async (
  userId: string,
  token: string
): Promise<{ message: string; user?: AuthResponse }> => {
  const response = await httpClient.get(
    `${ENDPOINTS.CONFIRM_EMAIL}?userId=${encodeURIComponent(
      userId
    )}&token=${encodeURIComponent(token)}`,
    {
      withCredentials: true,
    }
  );

  if (response.data.user) {
    return {
      message: response.data.message,
      user: {
        id: response.data.user.id,
        username: response.data.user.username,
        email: response.data.user.email,
        accessToken: response.data.user.accessToken,
        role: response.data.user.role,
        isExternalProvider: response.data.user.isExternalProvider,
      },
    };
  }

  return response.data;
};

export const resendEmailConfirmation = async (
  email: string
): Promise<{ message: string }> => {
  const response = await httpClient.post(
    ENDPOINTS.RESEND_CONFIRMATION,
    JSON.stringify({ email }),
    {
      headers: { "Content-Type": "application/json" },
    }
  );

  return response.data;
};

export const forgotPassword = async (
  data: ForgotPasswordData
): Promise<{ message: string }> => {
  const response = await httpClient.post(
    ENDPOINTS.FORGOT_PASSWORD,
    JSON.stringify(data),
    {
      headers: { "Content-Type": "application/json" },
    }
  );

  return response.data;
};

export const resetPassword = async (
  data: ResetPasswordData
): Promise<{ message: string }> => {
  const response = await httpClient.post(
    ENDPOINTS.RESET_PASSWORD,
    JSON.stringify(data),
    {
      headers: { "Content-Type": "application/json" },
    }
  );

  return response.data;
};

export const changeEmail = async (
  data: ChangeEmailData
): Promise<{ message: string }> => {
  const response = await httpClient.post(
    ENDPOINTS.REQUEST_EMAIL_CHANGE,
    JSON.stringify(data),
    {
      headers: { "Content-Type": "application/json" },
    }
  );

  return response.data;
};

export const confirmEmailChange = async (
  data: ConfirmEmailChangeData
): Promise<{ message: string }> => {
  const response = await httpClient.post(
    ENDPOINTS.CONFIRM_EMAIL_CHANGE,
    JSON.stringify(data),
    {
      headers: { "Content-Type": "application/json" },
    }
  );

  return response.data;
};
