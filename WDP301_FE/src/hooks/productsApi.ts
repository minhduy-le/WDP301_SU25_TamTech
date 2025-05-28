import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "../config/axios";

interface GenericApiResponse<T> {
  status: number;
  message: string;
  data?: T;
}

interface ProductApiResponse {
  // status: number;
  // message: string;
  products?: ProductDto[];
}

interface ProductDetailApiResponse {
  // status: number;
  // message: string;
  product?: ProductDto;
}
// interface ApiResponse<T> {
//   status: number;
//   message: string;
//   products?: T;
// }
export interface ProductDto {
  productId: number;
  name: string;
  description: string;
  price: number;
  image: string;
  createAt: Date;
  productTypeId: number;
  createBy: string;
  storeId: number;
  isActive: boolean;
  ProductType: {
    productTypeId: number;
    name: string;
  };
  ProductRecipes: [
    {
      productRecipeId: number;
      productId: number;
      materialId: number;
      quantity: number;
      Material: {
        materialId: number;
        name: string;
        quantity: number;
        storeId: number;
      };
    }
  ];
}

interface MutationVariables {
  productId: number;
  data: ProductDto;
}

const fetchProducts = async (): Promise<ProductDto[]> => {
  const response = await axiosInstance.get("products");
  const {
    status,
    message: responseMessage,
    data,
  } = response.data as GenericApiResponse<ProductDto[]>;
  if (status >= 200 && status < 300 && data) {
    return Array.isArray(data) ? data : [];
  }
  throw new Error(responseMessage || "Không thể tải danh sách sản phẩm");
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
      const response = await axiosInstance.get(`products/${productId}`);
      const {
        // status,
        // message: responseMessage,
        product,
      } = response.data as ProductDetailApiResponse;

      // if (status >= 200 && status < 300 && product) {
      //   return product;
      // }
      // throw new Error(responseMessage || "Không thể tải chi tiết sản phẩm");
      if (!product) {
        throw new Error("Không thể tải chi tiết sản phẩm");
      }
      return product;
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

  return useMutation<void, Error, number>({
    mutationFn: async (productId: number): Promise<void> => {
      await axiosInstance.delete(`products/${productId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
};

// export const useGetProductByTypeId = (productTypeId: string) => {
//   return useQuery<ProductDto, Error>({
//     queryKey: ["type", productTypeId],
//     queryFn: async () => {
//       const response = await axiosInstance.get<ProductDto>(
//         `products/type/${productTypeId}`
//       );
//       return response.data;
//     },
//     enabled: !!productTypeId,
//   });
// };
export const useGetProductByTypeId = (productTypeId: number) => {
  return useQuery<ProductDto[], Error>({
    queryKey: ["type", productTypeId],
    queryFn: async () => {
      const response = await axiosInstance.get(
        `products/type/${productTypeId}`
      );
      const {
        // status,
        // message: responseMessage,
        products,
      } = response.data as ProductApiResponse;
      // if (status >= 200 && status < 300 && products) {
      const processedProducts = Array.isArray(products)
        ? products.map((product) => ({
            ...product,
            price:
              typeof product.price === "string"
                ? parseFloat(product.price)
                : product.price,
          }))
        : [];
      return processedProducts;
      // }
      // throw new Error(responseMessage || "Không thể tải chi tiết sản phẩm");
    },
    enabled: !!productTypeId,
  });
};
