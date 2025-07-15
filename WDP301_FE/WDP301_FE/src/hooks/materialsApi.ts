import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "../config/axios";

interface GenericApiResponse<T> {
  status: number;
  message: string;
  data?: T;
}

interface MaterialDetailApiResponse {
  material?: MaterialDto;
}

export interface MaterialDto {
  materialId?: number;
  name: string;
  quantity: number;
  barcode: string;
  storeId: number;
  Store?: {
    name: string;
    address: string;
  };
}

interface MutationVariables {
  materialId: number;
  data?: Partial<MaterialDto>; // Optional data for flexibility
}

const fetchMaterials = async (): Promise<MaterialDto[]> => {
  const response = await axiosInstance.get("materials");
  const { status, message: responseMessage, data } = response.data as GenericApiResponse<MaterialDto[]>;
  if (status >= 200 && status < 300 && data) {
    return Array.isArray(data) ? data : [];
  }
  throw new Error(responseMessage || "Không thể tải danh sách nguyên liệu");
};

export const useMaterials = () => {
  return useQuery<MaterialDto[], Error>({
    queryKey: ["materials"],
    queryFn: fetchMaterials,
  });
};

export const useCreateMaterials = () => {
  return useMutation({
    mutationFn: async (newMaterial: MaterialDto) => {
      const response = await axiosInstance.post(`materials`, newMaterial);
      return response.data;
    },
  });
};

export const useGetMaterialById = (materialId: number) => {
  return useQuery<MaterialDto, Error>({
    queryKey: ["materials", materialId],
    queryFn: async () => {
      const response = await axiosInstance.get(`materials/${materialId}`);
      const { material } = response.data as MaterialDetailApiResponse;

      if (!material) {
        throw new Error("Không thể tải chi tiết sản phẩm");
      }
      return material;
    },
    enabled: !!materialId,
  });
};

export const useUpdateMaterial = () => {
  const queryClient = useQueryClient();

  return useMutation<void, Error, MutationVariables>({
    mutationFn: async ({ materialId, data }: MutationVariables): Promise<void> => {
      await axiosInstance.put(`materials/${materialId}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["materials"] });
    },
  });
};

export const useIncreaseMaterialQuantity = () => {
  const queryClient = useQueryClient();

  return useMutation<void, Error, { materialId: number }>({
    mutationFn: async ({ materialId }: { materialId: number }): Promise<void> => {
      await axiosInstance.put(`materials/${materialId}/scan`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["materials"] });
    },
  });
};
