import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "../config/axios";

export interface ProductDto {
  productId: string;
  name: string;
  description: string;
  price: string;
  image: string;
  createAt: Date;
  productTypeId: string;
  createBy: string;
  storeId: string;
  isActive: boolean;
}

interface MutationVariables {
  productId: string;
  data: ProductDto;
}

const fetchProducts = async (): Promise<ProductDto[]> => {
  const response = await axiosInstance.get<ProductDto[]>("products");
  return response.data;
};

export const useProducts = () => {
  return useQuery<ProductDto[], Error>({
    queryKey: ["products"],
    queryFn: fetchProducts,
  });
};

export const useCreateProduct = () => {
  return useMutation({
    mutationFn: async (newProduct: ProductDto) => {
      const response = await axiosInstance.post(`products`, newProduct);
      return response.data;
    },
  });
};

export const useGetProductById = (productId: string) => {
  return useQuery<ProductDto, Error>({
    queryKey: ["products", productId],
    queryFn: async () => {
      const response = await axiosInstance.get<ProductDto>(
        `products/${productId}`
      );
      return response.data;
    },
    enabled: !!productId,
  });
};

export const useUpdateProduct = () => {
  const queryClient = useQueryClient();

  return useMutation<void, Error, MutationVariables>({
    mutationFn: async ({
      productId,
      data,
    }: MutationVariables): Promise<void> => {
      await axiosInstance.put(`products/${productId}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
};

export const useDeleteProduct = () => {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: async (productId: string): Promise<void> => {
      await axiosInstance.delete(`products/${productId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
};
