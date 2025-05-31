import { useMutation, useQuery } from "@tanstack/react-query";
import axiosInstance from "../config/axios";

interface CreateOrder {
  orderItems: ProductItemDto[];
  order_discount_value: number;
  order_shipping_fee: number;
  payment_method_id: number;
  order_address: string;
  note: string;
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
  order_amount: string;
  invoiceUrl: string;
  order_point_earn: number;
  note: string;
  payment_method: string;
}

export const useCreateOrder = () => {
  return useMutation({
    mutationFn: async (newOrder: CreateOrder) => {
      const response = await axiosInstance.post(`orders`, newOrder);
      return response.data as OrderReponseDto;
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
