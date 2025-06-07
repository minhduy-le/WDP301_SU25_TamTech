import { useQuery } from "@tanstack/react-query";
import axiosInstance from "../config/axios";

export interface RevenueStat {
  month: number;
  revenue: number;
}

interface RevenueStatsResponse {
  status: number;
  message: string;
  stats: RevenueStat[];
}

export const useRevenueStats = (year: number) => {
  return useQuery<RevenueStat[], Error>({
    queryKey: ["revenue-stats", year],
    queryFn: async () => {
      const response = await axiosInstance.get<RevenueStatsResponse>(
        `dashboard/revenue-stats/${year}`
      );
      const { stats } = response.data;
      return Array.isArray(stats) ? stats : [];
    },
    enabled: !!year,
  });
};

export interface TopProduct {
  productName: string;
  totalQuantity: number;
  totalRevenue: number;
}

interface TopProductsResponse {
  status: number;
  message: string;
  stats: TopProduct[];
}

export const useTopProducts = () => {
  return useQuery<TopProduct[], Error>({
    queryKey: ["top-products"],
    queryFn: async () => {
      const response = await axiosInstance.get<TopProductsResponse>(
        "dashboard/top-products"
      );
      const { stats } = response.data;
      return Array.isArray(stats) ? stats : [];
    },
  });
};

