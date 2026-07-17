import axios from "axios";
import type {
  AxiosInstance,
  AxiosRequestConfig,
  InternalAxiosRequestConfig,
} from "axios";
import notify from "../utils/toast";

const API_BASE_URL = "http://localhost:5000/api";

const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
  },
});

type RetriableRequestConfig = AxiosRequestConfig & { _retry?: boolean };

let refreshPromise: Promise<string> | null = null;

const clearSession = () => {
  [
    "accessToken",
    "refreshToken",
    "userEmail",
    "userId",
    "userName",
    "userRole",
  ].forEach((key) => localStorage.removeItem(key));
};

const refreshAccessToken = async () => {
  if (refreshPromise) return refreshPromise;

  const refreshToken = localStorage.getItem("refreshToken");
  if (!refreshToken)
    return Promise.reject(new Error("Refresh token is missing"));

  refreshPromise = axios
    .post(`${API_BASE_URL}/auth/refresh`, { token: refreshToken })
    .then((response) => {
      const accessToken = response.data?.data?.accessToken;
      if (!accessToken)
        throw new Error("Refresh response did not include an access token");
      localStorage.setItem("accessToken", accessToken);
      return accessToken;
    })
    .finally(() => {
      refreshPromise = null;
    });

  return refreshPromise;
};

// Interceptor to attach access token to requests
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem("accessToken");
    if (token && config.headers && !config.headers.Authorization) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Interceptor to handle token refresh and unauthorized access errors
api.interceptors.response.use(
  (response) => {
    // Intercept success cases for standard auth actions
    const url = response.config.url;
    if (url) {
      if (url.endsWith("/auth/login")) {
        notify.authSuccess("Welcome back!", "You're successfully logged in.");
      } else if (url.endsWith("/auth/register")) {
        notify.authSuccess(
          "Account Created",
          "Welcome aboard! Your account is ready.",
        );
      } else if (url.endsWith("/auth/verify-otp")) {
        notify.success("Your identity has been verified.");
      } else if (url.endsWith("/auth/send-otp")) {
        notify.success("A verification code has been sent.");
      }
    }
    return response;
  },
  async (error) => {
    const originalRequest = error.config as RetriableRequestConfig | undefined;

    // Auto-toast validation and API errors
    if (error.response) {
      const { status, data } = error.response;
      const isAuthRoute =
        originalRequest?.url && originalRequest.url.includes("/auth/");

      if (status >= 400 && (status !== 401 || isAuthRoute)) {
        let message =
          data?.message || "Something went wrong. Please try again later.";
        const validationErrors = data?.errors;

        // Map specific error messages from the table
        if (message === "Incorrect password") {
          message = "Incorrect password. Please try again.";
        } else if (message === "User does not exist") {
          message = "Account not found. Please register first.";
        } else if (
          message.includes("disabled") ||
          message.includes("inactive")
        ) {
          message = "Your account has been disabled. Contact support.";
        } else if (
          message.includes("locked") ||
          message.includes("suspended")
        ) {
          message = "Your account is temporarily locked. Try again later.";
        } else if (
          message.includes("Too many attempts") ||
          message.includes("Rate limit")
        ) {
          notify.warning(
            "Too many login attempts. Please wait before trying again.",
          );
          return Promise.reject(error);
        } else if (
          message.includes("Email already exists") ||
          message.includes("already registered")
        ) {
          message = "An account with this email already exists.";
        } else if (message.includes("Passwords do not match")) {
          message = "Passwords do not match.";
        } else if (message.includes("Invalid OTP")) {
          message = "Invalid code. Please check and try again.";
        } else if (message.includes("OTP expired")) {
          message = "Your code has expired. Please request a new one.";
        } else if (status >= 500) {
          message = "Our servers are currently unreachable. Please try again.";
        }

        if (Array.isArray(validationErrors) && validationErrors.length > 0) {
          validationErrors.forEach((err: any) => {
            let valMsg = err.msg || err.message || message;
            if (valMsg.toLowerCase().includes("email")) {
              valMsg = "Please enter a valid email address.";
            }
            notify.error(valMsg);
          });
        } else {
          notify.error(message);
        }
      }
    } else {
      // Network errors
      notify.error("You're offline. Please check your connection.");
    }

    if (
      error.response &&
      error.response.status === 401 &&
      originalRequest &&
      !originalRequest._retry &&
      originalRequest.url &&
      !originalRequest.url.includes("/auth/")
    ) {
      originalRequest._retry = true;
      try {
        const accessToken = await refreshAccessToken();
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        }
        return api(originalRequest);
      } catch (refreshError) {
        console.error("Refresh token validation failed:", refreshError);
        clearSession();
        window.location.assign("/login");
      }
    }
    return Promise.reject(error);
  },
);

export default api;
