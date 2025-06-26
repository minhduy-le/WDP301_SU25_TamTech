import { useMutation, useQuery } from "@tanstack/react-query";
import axiosInstance from "../config/axios";

interface CreateFeedback {
  productId: number;
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
  Product: {
    productId: number;
    name: string;
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

interface FeedbackDetailApiResponse {
  feedbacks?: FeedbackDto;
}

interface FeedbackResponse {
  content: string;
}

export const useCreateFeedback = () => {
  return useMutation({
    mutationFn: async ({
      orderId,
      feedbackData,
    }: {
      orderId: number;
      feedbackData: CreateFeedback[];
    }) => {
      const response = await axiosInstance.post(`feedback/${orderId}`, {
        feedbacks: feedbackData,
      });
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

export const useGetFeedbackById = (orderId: number) => {
  return useQuery<FeedbackDto, Error>({
    queryKey: ["feedback", orderId],
    queryFn: async () => {
      const response = await axiosInstance.get(`feedback/${orderId}`);
      const { feedbacks } = response.data as FeedbackDetailApiResponse;

      if (!feedbacks) {
        throw new Error("Không thể tải chi tiết đánh giá");
      }
      return feedbacks;
    },
    enabled: !!orderId,
  });
};

export const useResponseFeedback = () => {
  return useMutation({
    mutationFn: async ({
      feedbackId,
      responseFeedback,
    }: {
      feedbackId: number;
      responseFeedback: FeedbackResponse;
    }) => {
      const response = await axiosInstance.post(
        `feedback/response/${feedbackId}`,
        responseFeedback
      );
      return response.data as FeedbackDto; // Giả định API trả về FeedbackDto sau khi phản hồi
    },
  });
};
