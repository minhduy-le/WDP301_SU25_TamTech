import { useQuery } from "@tanstack/react-query";
import axiosInstance from "../config/axios";
import { useState, useEffect } from "react";

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

export const useTopProducts = (startDate?: string, endDate?: string) => {
  return useQuery<TopProduct[], Error>({
    queryKey: ["top-products", startDate, endDate],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (startDate) params.append("startDate", startDate);
      if (endDate) params.append("endDate", endDate);
      
      const response = await axiosInstance.get<TopProductsResponse>(
        `dashboard/top-products?${params.toString()}`
      );
      const { stats } = response.data;
      return Array.isArray(stats) ? stats : [];
    },
    enabled: !!(startDate && endDate),
  });
};

interface MonthlyRevenueResponse {
  status: number;
  message: string;
  stats: RevenueStat[];
}

export const useMonthlyRevenue = (year?: number) => {
  return useQuery<RevenueStat[], Error>({
    queryKey: ["monthly-revenue", year],
    queryFn: async () => {
      const url = year
        ? `dashboard/monthly-revenue?year=${year}`
        : `dashboard/monthly-revenue`;
      const response = await axiosInstance.get<MonthlyRevenueResponse>(url);
      const { stats } = response.data;
      return Array.isArray(stats) ? stats : [];
    },
  });
};

interface MonthlyRevenueComparisonResponse {
  status: number;
  message: string;
  stats: {
    currentMonthRevenue: number;
    previousMonthRevenue: number;
  };
}

export interface MonthlyRevenueComparison {
  currentMonthRevenue: number;
  previousMonthRevenue: number;
}

export const useMonthlyRevenueComparison = () => {
  return useQuery<MonthlyRevenueComparison, Error>({
    queryKey: ["monthly-revenue-comparison"],
    queryFn: async () => {
      const response = await axiosInstance.get<MonthlyRevenueComparisonResponse>(
        `dashboard/monthly-revenue`
      );
      return response.data.stats;
    },
  });
};

export interface CurrentMonthRevenueStats {
  currentRevenue: number;
  percentageChange: number;
  averageOrderValue: number;
}
export const useCurrentMonthRevenue = () => {
  return useQuery<CurrentMonthRevenueStats, Error>({
    queryKey: ["current-month-revenue"],
    queryFn: async () => {
      const response = await axiosInstance.get("/dashboard/current-month-revenue");
      return response.data.stats;
    },
  });
};

export interface CurrentMonthProductStats {
  currentQuantity: number;
  percentageChange: number;
}
export const useCurrentMonthProduct = () => {
  return useQuery<CurrentMonthProductStats, Error>({
    queryKey: ["current-month-product"],
    queryFn: async () => {
      const response = await axiosInstance.get("/dashboard/current-month-products");
      return response.data.stats;
    },
  });
};

export interface CurrentMonthOrderStats {
  currentOrders: number;
  percentageChange: number;
}
export const useCurrentMonthOrder = () => {
  return useQuery<CurrentMonthOrderStats, Error>({
    queryKey: ["current-month-order"],
    queryFn: async () => {
      const response = await axiosInstance.get("/dashboard/current-month-orders");
      return response.data.stats;
    },
  });
};

export interface WeeklyRevenueStat {
  week: number;
  currentMonthRevenue: number;
  previousMonthRevenue: number;
}

export const useWeeklyRevenue = () => {
  return useQuery<WeeklyRevenueStat[], Error>({
    queryKey: ["weekly-revenue"],
    queryFn: async () => {
      const token = localStorage.getItem("token");
      const res = await axiosInstance.get("/dashboard/monthly-revenue", {
        headers: {
          accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      return Array.isArray(res.data.stats) ? res.data.stats : [];
    },
  });
};
export interface ProductTypeSaleStat {
  productType: string;
  totalQuantity: number;
}
export const useProductTypeSales = () => {
  const [data, setData] = useState<ProductTypeSaleStat[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
              const token = localStorage.getItem("token");

        const response = await axiosInstance.get(`${import.meta.env.VITE_API_URL}dashboard/product-type-sales`, {
          headers: {
            'accept': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });
        if (response.status === 200) {
          setData(response.data.stats);
        } else {
          setError(response.data.message);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred' as any);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return { data, loading, error };
};

export interface StaffProductivityStat {
  fullName: string;
  totalRevenue: number;
}

export const useStaffProductivity = () => {
  return useQuery<StaffProductivityStat[], Error>({
    queryKey: ["staff-productivity"],
    queryFn: async () => {
      const response = await axiosInstance.get("/dashboard/staff-productivity");
      return response.data.stats;
    },
  });
};
