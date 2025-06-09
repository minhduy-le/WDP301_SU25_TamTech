import { useQuery, useMutation } from "@tanstack/react-query";
import axiosInstance from "../config/axios";

export interface Shipper {
  id: number;
  fullName: string;
  email: string;
  phone_number: string;
}

interface AssignShipper {
  shipperId: number;
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
  });
};
