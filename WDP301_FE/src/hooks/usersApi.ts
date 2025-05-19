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
  fullName: string;
  role: string;
  email: string;
  phone_number: string;
  token: string;
}

export interface RegisterDto {
  fullName: string;
  email: string;
  phone_number: string;
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
  id: string;
  role: string;
  username: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  error: string | null;
  login: (values: {
    email: string;
    password: string;
  }) => Promise<{ success: boolean; message: string; role: string }>;
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
            sub: string;
            accountName: string;
            role: string;
          }>(data.token);

          const user = {
            id: decoded.sub,
            username: decoded.accountName,
            role: decoded.role,
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
