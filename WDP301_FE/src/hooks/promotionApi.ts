import { useQuery } from "@tanstack/react-query";
import axiosInstance from "../config/axios";

export interface Promotion {
  promotionId: number;
  promotionTypeId: number;
  name: string;
  description: string;
  barcode: string;
  code: string;
  startDate: Date;
  endDate: Date;
  minOrderAmount: number;
  discountAmount: number;
  NumberCurrentUses: number;
  maxNumberOfUses: number;
  isActive: boolean;
  createBy: number;
  createdAt: Date;
  updatedAt: Date;
}

const fetchPromotions = async (): Promise<Promotion[]> => {
  const response = await axiosInstance.get<Promotion[]>("promotions");
  return response.data;
};

export const useGetPromotions = () => {
  return useQuery<Promotion[], Error>({
    queryKey: ["promotions"],
    queryFn: fetchPromotions,
  });
};

export const useGetPromotionByCode = (code: string) => {
  return useQuery<Promotion, Error>({
    queryKey: ["code", code],
    queryFn: async () => {
      const response = await axiosInstance.get(`promotions/code/${code}`);
      return response.data;
    },
    enabled: !!code,
  });
};

export const useGetPromotionUser = (userId: number) => {
  return useQuery<Promotion[], Error>({
    queryKey: ["user", userId],
    queryFn: async () => {
      const response = await axiosInstance.get(`promotions/user/${userId}`);
      return response.data;
    },
    enabled: !!userId,
  });
};
