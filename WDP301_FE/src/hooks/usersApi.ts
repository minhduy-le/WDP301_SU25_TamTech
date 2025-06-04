import { create } from "zustand";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import axiosInstance from "../config/axios";
import { useMutation } from "@tanstack/react-query";

export interface LoginDto {
  email: string;
  password: string;
}

export interface LoginResponseDto {
  token: string;
}

export interface GoogleLoginDto {
  idToken: string;
}

export interface RegisterDto {
  fullName: string;
  email: string;
  phone_number: string;
  date_of_birth: string;
  password: string;
}

export interface ForgorPasswordDto {
  email: string;
}

export interface VerifyOTPDto {
  email: string;
  otp: string;
}

interface User {
  id: number;
  fullName: string;
  email: string;
  phone_number: string;
  role: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  error: string | null;
  login: (
    values: LoginDto
  ) => Promise<{ success: boolean; message: string; role: string }>;
  googleLogin: (
    values: GoogleLoginDto
  ) => Promise<{ success: boolean; message: string; role: string }>;
  logout: () => void;
  setUser: (user: User) => void;
  setToken: (token: string) => void;
}

export const useAuthStore = create<AuthState>((set) => {
  const loadStoredAuth = () => {
    const storedUser = localStorage.getItem("user");
    const storedToken = localStorage.getItem("token");

    return {
      user: storedUser ? JSON.parse(storedUser) : null,
      token: storedToken || null,
      error: null,
    };
  };

  return {
    ...loadStoredAuth(),

    login: async (values) => {
      try {
        const response = await axiosInstance.post("auth/login", values, {
          headers: { "Content-Type": "application/json" },
        });

        const data = response.data;
        if (data.token) {
          const decoded = jwtDecode<{
            id: number;
            role: string;
            fullName: string;
            email: string;
            phone_number: string;
          }>(data.token);

          const user = {
            id: decoded.id,
            role: decoded.role,
            fullName: decoded.fullName,
            email: decoded.email,
            phone_number: decoded.phone_number,
          };

          localStorage.setItem("user", JSON.stringify(user));
          localStorage.setItem("token", data.token);

          set({ user, token: data.token, error: null });
          return { success: true, message: data.message, role: decoded.role };
        } else {
          set({ error: "Login failed" });
          return { success: false, message: "Login failed", role: "" };
        }
      } catch (error) {
        const errorMessage =
          axios.isAxiosError(error) && error.response?.data?.message
            ? error.response.data.message
            : (error as Error).message;

        set({ error: errorMessage });
        return { success: false, message: errorMessage, role: "" };
      }
    },

    googleLogin: async (values: GoogleLoginDto) => {
      try {
        const response = await axiosInstance.post("auth/google-login", values, {
          headers: { "Content-Type": "application/json" },
        });

        const data = response.data;
        if (data.token) {
          const user = {
            id: data.id,
            role: data.role,
            fullName: data.fullName,
            email: data.email,
            phone_number: data.phone_number,
          };

          localStorage.setItem("user", JSON.stringify(user));
          localStorage.setItem("token", data.token);

          set({ user, token: data.token, error: null });
          return {
            success: true,
            message: data.message || "Login successful",
            role: data.role,
          };
        } else {
          set({ error: "Google login failed" });
          return { success: false, message: "Google login failed", role: "" };
        }
      } catch (error) {
        const errorMessage =
          axios.isAxiosError(error) && error.response?.data?.message
            ? error.response.data.message
            : (error as Error).message;

        set({ error: errorMessage });
        return { success: false, message: errorMessage, role: "" };
      }
    },

    logout: () => {
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      set({ user: null, token: null, error: null });
    },

    setUser: (user) => {
      localStorage.setItem("user", JSON.stringify(user));
      set({ user });
    },

    setToken: (token) => {
      localStorage.setItem("token", token);
      set({ token });
    },
  };
});

export const useRegister = () => {
  return useMutation({
    mutationFn: async (newAccount: RegisterDto) => {
      const response = await axiosInstance.post(`auth/register`, newAccount);
      return response.data;
    },
  });
};

export const useForgotPassword = () => {
  return useMutation({
    mutationFn: async (verifyAccount: ForgorPasswordDto) => {
      const response = await axiosInstance.post(
        `auth/forgot-password`,
        verifyAccount
      );
      return response.data;
    },
  });
};

export const useVerifyOTP = () => {
  return useMutation({
    mutationFn: async (verifyOTP: VerifyOTPDto) => {
      const response = await axiosInstance.post(`auth/verify-otp`, verifyOTP);
      return response.data;
    },
  });
};

export const useLoginGoogle = () => {
  return useMutation({
    mutationFn: async (newAccount: GoogleLoginDto) => {
      const response = await axiosInstance.post(
        `auth/google-login`,
        newAccount
      );
      return response.data;
    },
  });
};
