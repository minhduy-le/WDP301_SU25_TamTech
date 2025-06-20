/* eslint-disable @typescript-eslint/no-explicit-any */
import { useQuery, useMutation } from "@tanstack/react-query";
import axiosInstance from "../config/axios";
import axios from "axios";

export interface Shipper {
  id: number;
  fullName: string;
  email: string;
  phone_number: string;
}

interface AssignShipper {
  shipperId: number;
  orderDate: string;
}

const fetchShippers = async (): Promise<Shipper[]> => {
  const response = await axiosInstance.get<Shipper[]>("shippers");
  return response.data;
};

export const useGetShippers = () => {
  return useQuery<Shipper[], Error>({
    queryKey: ["shippers"],
    queryFn: fetchShippers,
  });
};

export const useAssignShipper = () => {
  return useMutation({
    mutationFn: async ({
      orderId,
      assignShipper,
    }: {
      orderId: number;
      assignShipper: AssignShipper;
    }) => {
      const response = await axiosInstance.post(
        `shippers/assign/${orderId}`,
        assignShipper
      );
      return response.data;
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
