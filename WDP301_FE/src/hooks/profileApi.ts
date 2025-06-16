import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "../config/axios";

interface GenericApiResponse<T> {
  status: number;
  message: string;
  user?: T;
  qrCode?: string;
}

export interface UserDto {
  id: number;
  fullName: string;
  email: string;
  phone_number: string;
  isActive: true;
  role: string;
  date_of_birth: string;
  member_point: number;
}

export interface ProfileResponse {
  user: UserDto;
  qrCode: string;
}

interface MutationVariables {
  id: number;
  data: Partial<UserDto>;
}

export const useGetProfileUser = (id: number) => {
  return useQuery<ProfileResponse, Error>({
    queryKey: ["profiles", id],
    queryFn: async () => {
      const response = await axiosInstance.get(`profiles/${id}`);
      const {
        status,
        message: responseMessage,
        user,
        qrCode,
      } = response.data as GenericApiResponse<UserDto>;

      if (status >= 200 && status < 300 && user && qrCode) {
        return { user, qrCode };
      }
      throw new Error(responseMessage || "Không thể tải thông tin người dùng");
    },
    enabled: !!id,
  });
};

export const useUpdateProfile = () => {
  const queryClient = useQueryClient();

  //   return useMutation<void, Error, MutationVariables>({
  //     mutationFn: async ({ id, data }: MutationVariables): Promise<void> => {
  //       await axiosInstance.put(`profiles/${id}`, data);
  //     },
  return useMutation<UserDto, Error, MutationVariables>({
    mutationFn: async ({ id, data }: MutationVariables): Promise<UserDto> => {
      const response = await axiosInstance.put<GenericApiResponse<UserDto>>(
        `profiles/${id}`,
        data
      );
      const { status, message: responseMessage, user } = response.data;

      if (status >= 200 && status < 300 && user) {
        return user;
      }
      throw new Error(
        responseMessage || "Không thể cập nhật thông tin người dùng"
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profiles"] });
    },
  });
};
