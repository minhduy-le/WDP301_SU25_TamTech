import { useMutation, useQuery } from "@tanstack/react-query";
import axios from "axios";

export interface ProductType {
  productTypeId: number;
  name: string;
}

const fetchProductTypes = async (): Promise<ProductType[]> => {
  const response = await axios.get<ProductType[]>(
    "https://wdp-301-0fd32c261026.herokuapp.com/api/product-types"
  );
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
      const response = await axios.post(`https://wdp-301-0fd32c261026.herokuapp.com/api/product-types`, newProduct);
      return response.data;
    },
  });
};
