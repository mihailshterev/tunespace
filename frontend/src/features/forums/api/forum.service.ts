import type CreateForumCategory from "@/features/forums/types/create-forum-category";
import httpClient from "@/shared/api/http-client";
import { ENDPOINTS } from "@/shared/utils/constants";
import type ForumCategory from "@/features/forums/types/forum-category";
import type { ForumThread } from "@/features/forums/types/forum-thread";
import type CreateThread from "@/features/forums/types/create-thread";
import type ThreadData from "@/features/forums/types/thread-data";
import type CreatePost from "@/features/forums/types/create-post";

export const createForumCategory = async (data: CreateForumCategory) => {
  const response = await httpClient.post(`${ENDPOINTS.FORUM}/categories`, data);
  return response.data;
};

export const createThread = async (data: CreateThread) => {
  const response = await httpClient.post(`${ENDPOINTS.FORUM}/threads`, {
    title: data.title,
    content: data.content,
    categoryId: data.categoryId,
  });
  return response.data;
};

export const createPost = async (data: CreatePost) => {
  const response = await httpClient.post(`${ENDPOINTS.FORUM}/posts`, {
    content: data.content,
    threadId: data.threadId,
    parentPostId: data.parentPostId || null,
  });
  return response.data;
};

export const fetchCategories = async (): Promise<ForumCategory[]> => {
  const response = await httpClient.get(`${ENDPOINTS.FORUM}/categories`);
  return response.data;
};

export const fetchCategory = async (
  categoryId: string
): Promise<ForumCategory> => {
  const response = await httpClient.get(
    `${ENDPOINTS.FORUM}/categories/${categoryId}`
  );
  return response.data;
};

export const fetchThreads = async (
  categoryId: string
): Promise<ForumThread[]> => {
  const response = await httpClient.get(
    `${ENDPOINTS.FORUM}/categories/${categoryId}/threads`
  );
  return response.data;
};

export const fetchBandThreads = async (
  bandId: string
): Promise<ForumThread[]> => {
  const response = await httpClient.get(
    `${ENDPOINTS.FORUM}/threads/band/${bandId}`
  );
  return response.data;
};

export const fetchThread = async (threadId: string): Promise<ThreadData> => {
  const response = await httpClient.get(
    `${ENDPOINTS.FORUM}/threads/${threadId}`
  );
  return response.data;
};

export const likePost = async (postId: string) => {
  return httpClient.post(`${ENDPOINTS.FORUM}/posts/${postId}/like`);
};

export const unlikePost = async (postId: string) => {
  return httpClient.delete(`${ENDPOINTS.FORUM}/posts/${postId}/unlike`);
};
