/* eslint-disable @typescript-eslint/no-explicit-any */
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "../config/axios";
import axios from "axios";

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
  isActive: boolean;
  startDate: Date;
  expireDate: Date;
  timeExpired: string;
  isExpired: boolean;
  isProcessExpired: boolean;
  Store?: {
    name: string;
    address: string;
  };
}

interface MutationVariables {
  materialId: number;
  data?: Partial<UpdateMaterialDto>;
}

export interface UpdateMaterialDto {
  name?: string;
  quantity?: number;
  expireDate?: Date;
  timeExpired?: string;
}

export interface CreateMaterialDto {
  name?: string;
  quantity?: number;
  expireDate?: Date;
  timeExpired?: string;
}

const fetchMaterials = async (): Promise<MaterialDto[]> => {
  const response = await axiosInstance.get("materials");
  const {
    status,
    message: responseMessage,
    data,
  } = response.data as GenericApiResponse<MaterialDto[]>;
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
    mutationFn: async (newMaterial: CreateMaterialDto) => {
      try {
        const response = await axiosInstance.post(`materials`, newMaterial);
        return response.data;
      } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
          const errorMessage = error.response.data;
          const customError = new Error("API Error");
          (customError as any).responseValue = errorMessage;
          throw customError;
        } else {
          const errorMessage = (error as Error).message;
          throw new Error(errorMessage);
        }
      }
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
    mutationFn: async ({
      materialId,
      data,
    }: MutationVariables): Promise<void> => {
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
    mutationFn: async ({
      materialId,
    }: {
      materialId: number;
    }): Promise<void> => {
      await axiosInstance.put(`materials/${materialId}/scan`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["materials"] });
    },
  });
};

export const useDeleteMaterial = () => {
  const queryClient = useQueryClient();

  return useMutation<void, Error, number>({
    mutationFn: async (materialId: number): Promise<void> => {
      await axiosInstance.delete(`materials/${materialId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["materials"] });
    },
    onError: (error: any) => {
      if (axios.isAxiosError(error) && error.response) {
        const errorMessage = error.response.data;
        const customError = new Error("API Error");
        (customError as any).responseValue = errorMessage;
        throw customError;
      } else {
        const errorMessage = (error as Error).message;
        throw new Error(errorMessage);
      }
    },
  });
};

export const useUpdateExpiredProcessMaterial = () => {
  const queryClient = useQueryClient();

  return useMutation<void, Error, number>({
    mutationFn: async (materialId: number): Promise<void> => {
      await axiosInstance.put(`materials/${materialId}/process-expired`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["materials"] });
    },
  });
};

const fetchMaterialProcess = async (): Promise<MaterialDto[]> => {
  const response = await axiosInstance.get("materials/expired");
  const {
    status,
    message: responseMessage,
    data,
  } = response.data as GenericApiResponse<MaterialDto[]>;
  if (status >= 200 && status < 300 && data) {
    return Array.isArray(data) ? data : [];
  }
  throw new Error(
    responseMessage || "Không thể tải danh sách nguyên liệu đã xứ lý"
  );
};

export const useMaterialProcess = () => {
  return useQuery<MaterialDto[], Error>({
    queryKey: ["materials"],
    queryFn: fetchMaterialProcess,
  });
};
