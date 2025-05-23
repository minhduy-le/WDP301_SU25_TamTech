import axios, {
  type AxiosInstance,
  type AxiosResponse,
  AxiosError,
} from "axios";

interface ApiResponse<T> {
  status: number;
  message: string;
  data?: T;
}

interface ApiError {
  status: number;
  message: string;
}

const axiosInstance: AxiosInstance = axios.create({
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

// axiosInstance.interceptors.response.use(
//   (response) => {
//     console.log("Response:", response);
//     return response;
//   },
//   (error) => {
//     console.error("Response Error:", error);
//     return Promise.reject(error);
//   }
// );

axiosInstance.interceptors.response.use(
  <T>(response: AxiosResponse<ApiResponse<T>>) => {
    if (response.data && typeof response.data === "object") {
      const { status, message, data } = response.data;
      console.log("Response:", { status, message, data });
      return {
        ...response,
        data: { status, message, data },
      };
    }
    console.warn("Unexpected response structure:", response);
    return {
      ...response,
      data: {
        statusCode: response.status,
        message: "Unexpected response format",
        data: undefined,
      },
    };
  },
  (error: AxiosError) => {
    let errorMessage = "Đã xảy ra lỗi";
    let status = 500;

    if (error.response) {
      const responseData = error.response.data as
        | ApiResponse<unknown>
        | undefined;
      status = responseData?.status || error.response.status;
      errorMessage = responseData?.message || error.message;
    } else if (error.request) {
      errorMessage =
        "Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng.";
    } else {
      errorMessage = "Lỗi không xác định. Vui lòng thử lại.";
    }

    const apiError: ApiError = {
      status,
      message: errorMessage,
    };

    console.error("Response Error:", apiError);
    return Promise.reject(apiError);
  }
);

export default axiosInstance;
