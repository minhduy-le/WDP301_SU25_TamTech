import { useMutation, useQuery } from "@tanstack/react-query";
import axiosInstance from "../config/axios";

export interface ProductType {
  productTypeId: number;
  name: string;
}

const fetchProductTypes = async (): Promise<ProductType[]> => {
  const response = await axiosInstance.get<ProductType[]>("product-types");
  return response.data;
};

export const useProductTypes = () => {
  return useQuery<ProductType[], Error>({
    queryKey: ["product-types"],
    queryFn: fetchProductTypes,
  });
};

export const useCreateProductType = () => {
  return useMutation({
    mutationFn: async (newProduct: ProductType) => {
      const response = await axiosInstance.post(`product-types`, newProduct);
      return response.data;
    },
  });
};

