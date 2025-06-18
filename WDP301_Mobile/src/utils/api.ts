import axios from "axios";
import { Platform } from "react-native";
import { API_URL } from "./constant";

export const customerRegisterAPI = (
  fullName: string,
  phone_number: string,
  email: string,
  password: string,
  date_of_birth: string
) => {
  const url = `${API_URL}/api/auth/register`;
  return axios.post(url, {
    fullName,
    email,
    phone_number,
    password,
    date_of_birth,
  });
};
export const verifyEmailCustomer = (email: string, otp: string) => {
  const url = `${API_URL}/api/auth/verify-otp`;
  return axios.post(url, {
    email,
    otp,
  });
};
export const resendCodeAPI = (email: string) => {
  const url = `${API_URL}/api/auth/resend-otp`;
  return axios.post(url, { email });
};
export const customerLoginAPI = (email: string, password: string) => {
  const url = `${API_URL}/api/auth/login`;
  return axios.post(url, { email, password });
};

export const registerAPI = (email: string, password: string, name: string) => {
  const url = `/api/v1/auth/register`;
  return axios.post<IBackendRes<IRegister>>(url, { email, password, name });
};
export const forgotPasswordAPI = (email: string) => {
  const url = `${API_URL}/api/auth/forgot-password`;
  return axios.post(url, { email });
};
export const getBestSellerAPI = () => {
  const url = `${API_URL}/api/products/best-seller`;
  return axios.get(url);
};
export const getTypeProductAPI = () => {
  const url = `${API_URL}/api/product-types`;
  return axios.get(url);
};
export const getAccountAPI = () => {
  const url = `/api/v1/auth/account`;
  return axios.get<IBackendRes<IUserLogin>>(url);
};

export const getTopRestaurant = (ref: string) => {
  const url = `/api/v1/restaurants/${ref}`;
  return axios.post<IBackendRes<ITopRestaurant[]>>(
    url,
    {},
    {
      headers: {
        delay: 1500,
      },
    }
  );
};

export const getURLBaseBackend = () => {
  const backend =
    Platform.OS === "android"
      ? process.env.EXPO_PUBLIC_ANDROID_API_URL
      : process.env.EXPO_PUBLIC_IOS_API_URL;

  return backend;
};

export const getRestaurantByIdAPI = (id: string) => {
  const url = `/api/v1/restaurants/${id}`;
  return axios.get<IBackendRes<IRestaurant>>(url, {
    headers: { delay: 1500 },
  });
};

export const processDataRestaurantMenu = (restaurant: IRestaurant | null) => {
  if (!restaurant) return [];
  return restaurant?.menu?.map((menu, index) => {
    return {
      index,
      key: menu._id,
      title: menu.title,
      data: menu.menuItem,
    };
  });
};

export const currencyFormatter = (value: any) => {
  const options = {
    significantDigits: 2,
    thousandsSeparator: ".",
    decimalSeparator: ",",
    symbol: "đ",
  };

  if (typeof value !== "number") value = 0.0;
  value = value.toFixed(options.significantDigits);

  const [currency, decimal] = value.split(".");
  return `${currency.replace(
    /\B(?=(\d{3})+(?!\d))/g,
    options.thousandsSeparator
  )} ${options.symbol}`;
};

export const updateUserPasswordAPI = (
  currentPassword: string,
  newPassword: string
) => {
  const url = `/api/v1/users/password`;
  return axios.post<IBackendRes<IUserLogin>>(url, {
    currentPassword,
    newPassword,
  });
};

export const requestPasswordAPI = (email: string) => {
  const url = `/api/v1/auth/retry-password`;
  return axios.post<IBackendRes<IUserLogin>>(url, { email });
};

export const likeRestaurantAPI = (restaurant: string, quantity: number) => {
  const url = `/api/v1/likes`;
  return axios.post<IBackendRes<IUserLogin>>(url, { restaurant, quantity });
};
