/* eslint-disable @typescript-eslint/no-explicit-any */
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "../config/axios";
import axios from "axios";

interface CreateOrder {
  orderItems: ProductItemDto[];
  order_discount_value: number;
  order_shipping_fee: number;
  payment_method_id: number;
  order_address: string;
  note: string;
  promotion_code: string;
}

interface ProductItemDto {
  productId: number;
  quantity: number;
  price: number;
}

export interface OrderReponseDto {
  message: string;
  orderId: number;
  checkoutUrl: string;
}

interface CalculateShipping {
  deliver_address: string;
}

export interface ShippingResponseDto {
  status: number;
  message: string;
  fee: number;
}

export interface OrderHistory {
  orderId: number;
  payment_time: Date;
  order_create_at: Date;
  order_address: string;
  status: string;
  fullName: string;
  phone_number: string;
  orderItems: [
    {
      productId: number;
      name: string;
      quantity: number;
      price: number;
    }
  ];
  order_shipping_fee: number;
  order_discount_value: number;
  order_amount: number;
  invoiceUrl: string;
  order_point_earn: number;
  note: string;
  payment_method: string;
}

interface MutationVariables {
  orderId: string;
}

export const useCreateOrder = () => {
  return useMutation({
    mutationFn: async (newOrder: CreateOrder) => {
      const response = await axiosInstance.post(`orders`, newOrder);
      return response.data as OrderReponseDto;
    },
    onError: (error: any) => {
      if (axios.isAxiosError(error) && error.response) {
        const errorMessage = error.response.data;
        throw new Error(errorMessage);
      } else {
        throw new Error("An unexpected error occurred");
      }
    },
  });
};

export const useCalculateShipping = () => {
  return useMutation({
    mutationFn: async (calculateShip: CalculateShipping) => {
      const response = await axiosInstance.post(
        `orders/shipping/calculate`,
        calculateShip
      );
      return response.data as ShippingResponseDto;
    },
    onError: (error: any) => {
      if (axios.isAxiosError(error) && error.response) {
        const errorMessage =
          error.response.data?.message || error.response.data;
        throw new Error(errorMessage);
      } else {
        throw new Error("An unexpected error occurred");
      }
    },
  });
};

const fetchOrderHistory = async (): Promise<OrderHistory[]> => {
  const response = await axiosInstance.get<OrderHistory[]>("orders/user");
  return response.data;
};

export const useGetOrderHistory = () => {
  return useQuery<OrderHistory[], Error>({
    queryKey: ["user"],
    queryFn: fetchOrderHistory,
  });
};

const fetchOrders = async (): Promise<OrderHistory[]> => {
  const response = await axiosInstance.get<OrderHistory[]>("orders");
  return response.data;
};

export const useGetOrders = () => {
  return useQuery<OrderHistory[], Error>({
    queryKey: ["orders"],
    queryFn: fetchOrders,
  });
};

export const usePrepareOrder = () => {
  const queryClient = useQueryClient();

  return useMutation<void, Error, MutationVariables>({
    mutationFn: async ({ orderId }: MutationVariables): Promise<void> => {
      await axiosInstance.put(`orders/${orderId}/preparing`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["preparing"] });
    },
  });
};

export const useCookOrder = () => {
  const queryClient = useQueryClient();

  return useMutation<void, Error, MutationVariables>({
    mutationFn: async ({ orderId }: MutationVariables): Promise<void> => {
      await axiosInstance.put(`orders/${orderId}/cooked`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cooked"] });
    },
  });
};
