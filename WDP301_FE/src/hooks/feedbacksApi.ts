import { useMutation } from "@tanstack/react-query";
import axiosInstance from "../config/axios";

interface CreateFeedback {
  comment: string;
  rating: number;
}

export interface FeedbackResponseDto {
  feedback: {
    id: number;
    productId: number;
    userId: number;
    comment: string;
    rating: number;
    isFeedback: boolean;
    createdAt: Date;
    updatedAt: Date;
  };
}

export const useCreateFeedback = () => {
  return useMutation({
    mutationFn: async ({
      productId,
      feedbackData,
    }: {
      productId: number;
      feedbackData: CreateFeedback;
    }) => {
      const response = await axiosInstance.post(
        `feedback/${productId}`,
        feedbackData
      );
      return response.data as FeedbackResponseDto;
    },
  });
};
