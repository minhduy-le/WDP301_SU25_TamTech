import { useQuery } from "@tanstack/react-query";
import axiosInstance from "../config/axios";

interface GenericApiResponse<T> {
  message: string;
  data?: T;
}

export interface DistrictDto {
  name: string;
  type: string;
  districtId: number;
}

export interface WardDto {
  name: string;
  type: string;
}

const fetchDistrict = async (): Promise<DistrictDto[]> => {
  const response = await axiosInstance.get("location/districts");
  const { data } = response.data as GenericApiResponse<DistrictDto[]>;
  return Array.isArray(data) ? data : [];
};

export const useDistricts = () => {
  return useQuery<DistrictDto[], Error>({
    queryKey: ["districts"],
    queryFn: fetchDistrict,
  });
};

export const useWardByDistrictId = (districtId: number | null) => {
  return useQuery<WardDto[], Error>({
    queryKey: ["wards", districtId],
    queryFn: async () => {
      const response = await axiosInstance.get(
        `location/wards?district_id=${districtId}`
      );
      const { data } = response.data as GenericApiResponse<WardDto[]>;
      return Array.isArray(data) ? data : [];
    },
    enabled: !!districtId,
  });
};

const fetchAddressUser = async (): Promise<string[]> => {
  const response = await axiosInstance.get("location/addresses/user");
  const { data } = response.data as GenericApiResponse<string[]>;
  return Array.isArray(data) ? data : [];
};

export const useGetAddressUser = () => {
  return useQuery<string[], Error>({
    queryKey: ["addresses"],
    queryFn: fetchAddressUser,
  });
};
