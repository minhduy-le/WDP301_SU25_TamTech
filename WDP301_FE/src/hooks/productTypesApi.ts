import { useMutation, useQuery } from "@tanstack/react-query";
import axiosInstance from "../config/axios";

export interface ProductTypeDto {
  productTypeId: number;
  name: string;
}

const fetchProductTypes = async (): Promise<ProductTypeDto[]> => {
  const response = await axiosInstance.get<ProductTypeDto[]>("product-types");
  return response.data;
};

export const useProductTypes = () => {
  return useQuery<ProductTypeDto[], Error>({
    queryKey: ["product-types"],
    queryFn: fetchProductTypes,
  });
};

export const useCreateProductType = () => {
  return useMutation({
    mutationFn: async (newProduct: ProductTypeDto) => {
      const response = await axiosInstance.post(`product-types`, newProduct);
      return response.data;
    },
  });
};
