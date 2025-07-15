/* eslint-disable @typescript-eslint/no-explicit-any */
import { useMutation, useQuery } from "@tanstack/react-query";
import axiosInstance from "../config/axios";
import axios from "axios";

interface CreateChat {
  chatRoomId?: number;
  receiverId: number;
  content: string;
}

export interface Chat {
  id: number;
  chatRoomId: number;
  senderId: number;
  receiverId: number;
  content: string;
  createdAt: Date;
  Sender: Sender;
  Receiver: Receiver;
  ChatRoom: ChatRoom;
}

export interface Sender {
  id: number;
  fullName: string;
}

export interface Receiver {
  id: number;
  fullName: string;
}

export interface ChatRoom {
  id: number;
  name: string;
}

const fetchChats = async (): Promise<Chat[]> => {
  const response = await axiosInstance.get<Chat[]>("chat/messages");
  return response.data;
};

export const useGetChats = () => {
  return useQuery<Chat[], Error>({
    queryKey: ["chat"],
    queryFn: fetchChats,
  });
};

export const useCreateChat = () => {
  return useMutation({
    mutationFn: async (newChat: CreateChat) => {
      const response = await axiosInstance.post(`chat/messages`, newChat);
      return response.data;
    },
    onError: (error: any) => {
      if (axios.isAxiosError(error) && error.response) {
        const errorMessage = error.response.data;
        throw new Error(errorMessage);
      } else {
        throw new Error("An unexpected error occurred");
      }
    },
  });
};
