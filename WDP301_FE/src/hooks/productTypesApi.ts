import { useQuery } from "@tanstack/react-query";
import axiosInstance from "../config/axios";

export interface ProductType {
  productTypeId: number;
  name: string;
  isActive: boolean; 
}

const fetchProductTypes = async (): Promise<ProductType[]> => {
  const response = await axiosInstance.get<ProductType[]>("product-types");
  return response.data.filter((type) => type.isActive);
};

export const useProductTypes = () => {
  return useQuery<ProductType[], Error>({
    queryKey: ["product-types"],
    queryFn: fetchProductTypes,
  });
};
