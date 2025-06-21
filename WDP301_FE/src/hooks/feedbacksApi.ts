import { useMutation, useQuery } from "@tanstack/react-query";
import axiosInstance from "../config/axios";

interface CreateFeedback {
  comment: string;
  rating: number;
}

export interface FeedbackResponseDto {
  feedback: {
    id: number;
    orderId: number;
    userId: number;
    comment: string;
    rating: number;
    isResponsed: boolean;
    createdAt: Date;
    updatedAt: Date;
  };
}

interface GenericApiResponse<T> {
  feedbacks?: T;
}

export interface FeedbackDto {
  id: number;
  orderId: number;
  userId: number;
  comment: string;
  rating: number;
  isResponsed: boolean;
  createdAt: Date;
  updatedAt: Date;
  User: {
    id: number;
    fullName: number;
  };
  FeedbackResponses: [
    {
      id: number;
      feedbackId: number;
      repliedBy: number;
      content: string;
      createdAt: Date;
      updatedAt: Date;
      RepliedBy: {
        id: number;
        fullName: string;
      };
    }
  ];
}

export const useCreateFeedback = () => {
  return useMutation({
    mutationFn: async ({
      orderId,
      feedbackData,
    }: {
      orderId: number;
      feedbackData: CreateFeedback;
    }) => {
      const response = await axiosInstance.post(
        `feedback/${orderId}`,
        feedbackData
      );
      return response.data as FeedbackResponseDto;
    },
  });
};

const fetchFeedbacks = async (): Promise<FeedbackDto[]> => {
  const response = await axiosInstance.get("feedback");
  const { feedbacks } = response.data as GenericApiResponse<FeedbackDto[]>;
  return Array.isArray(feedbacks) ? feedbacks : [];
};

export const useFeedbacks = () => {
  return useQuery<FeedbackDto[], Error>({
    queryKey: ["feedback"],
    queryFn: fetchFeedbacks,
  });
};
