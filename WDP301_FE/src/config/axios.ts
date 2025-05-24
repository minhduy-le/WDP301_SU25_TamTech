import axios from "axios";

const axiosInstance = axios.create({
  baseURL: "https://wdp-301-0fd32c261026.herokuapp.com/api/",
  headers: {
    "Content-Type": "application/json",
    Accept: "*/*",
  },
  withCredentials: false,
});

axiosInstance.interceptors.request.use(
  async (config) => {
    const token = localStorage.getItem("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    console.log("Request Config:", config);
    return config;
  },
  (error) => {
    console.error("Request Error:", error);
    return Promise.reject(error);
  }
);

axiosInstance.interceptors.response.use(
  (response) => {
    console.log("Response:", response);
    return response;
  },
  (error) => {
    console.error("Response Error:", error);
    return Promise.reject(error);
  }
);

export default axiosInstance;
