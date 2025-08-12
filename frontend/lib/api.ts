import axios from "axios";
import {
  ApiResponse,
  PaginatedResponse,
  User,
  Campaign,
  CampaignPerformance,
  Suggestion,
  MetaAccount,
  DashboardStats,
} from "@/types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to add auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: async (data: { email: string; password: string; name: string }) => {
    const response = await api.post<ApiResponse<{ user: User; token: string }>>(
      "/auth/register",
      data
    );
    return response.data;
  },

  login: async (data: { email: string; password: string }) => {
    const response = await api.post<ApiResponse<{ user: User; token: string }>>(
      "/auth/login",
      data
    );
    return response.data;
  },

  getProfile: async () => {
    const response = await api.get<ApiResponse<User>>("/users/me");
    return response.data;
  },
};

// Campaigns API
export const campaignsAPI = {
  getCampaigns: async (page = 1, limit = 10) => {
    const response = await api.get<PaginatedResponse<Campaign>>(
      `/campaigns?page=${page}&limit=${limit}`
    );
    return response.data;
  },

  getCampaign: async (id: string) => {
    const response = await api.get<ApiResponse<Campaign>>(`/campaigns/${id}`);
    return response.data;
  },

  createCampaign: async (data: any) => {
    const response = await api.post<ApiResponse<Campaign>>("/campaigns", data);
    return response.data;
  },

  updateCampaign: async (id: string, data: any) => {
    const response = await api.put<ApiResponse<Campaign>>(
      `/campaigns/${id}`,
      data
    );
    return response.data;
  },

  deleteCampaign: async (id: string) => {
    const response = await api.delete<ApiResponse<void>>(`/campaigns/${id}`);
    return response.data;
  },

  getPerformance: async (id: string, startDate?: string, endDate?: string) => {
    const params = new URLSearchParams();
    if (startDate) params.append("startDate", startDate);
    if (endDate) params.append("endDate", endDate);

    const response = await api.get<ApiResponse<CampaignPerformance[]>>(
      `/campaigns/${id}/performance?${params}`
    );
    return response.data;
  },
};

// Meta Integration API
export const metaAPI = {
  connectAccount: async (data: {
    adAccountId: string;
    accessToken: string;
  }) => {
    const response = await api.post<ApiResponse<MetaAccount>>(
      "/meta/connect",
      data
    );
    return response.data;
  },

  getAccounts: async () => {
    const response = await api.get<ApiResponse<MetaAccount[]>>(
      "/meta/accounts"
    );
    return response.data;
  },
};

// AI API
export const aiAPI = {
  generateAdCopy: async (data: {
    product: string;
    targetAudience: string;
    objective: string;
  }) => {
    const response = await api.post<
      ApiResponse<{ copy: string; suggestions: string[] }>
    >("/ai/generate", data);
    return response.data;
  },

  getOptimizationSuggestions: async (campaignId: string) => {
    const response = await api.post<ApiResponse<Suggestion[]>>("/ai/optimize", {
      campaignId,
    });
    return response.data;
  },

  chatCompletion: async (message: string) => {
    const response = await api.post<
      ApiResponse<{ response: string; suggestions?: Suggestion[] }>
    >("/ai/chat", { message });
    return response.data;
  },

  queryKnowledgeBase: async (query: string) => {
    const response = await api.post<
      ApiResponse<{ answer: string; sources: string[] }>
    >("/ai/rag/query", { query });
    return response.data;
  },
};

// Suggestions API
export const suggestionsAPI = {
  getSuggestions: async (page = 1, limit = 10) => {
    const response = await api.get<PaginatedResponse<Suggestion>>(
      `/suggestions?page=${page}&limit=${limit}`
    );
    return response.data;
  },

  approveSuggestion: async (id: string) => {
    const response = await api.post<ApiResponse<Suggestion>>(
      `/suggestions/${id}/approve`
    );
    return response.data;
  },

  rejectSuggestion: async (id: string) => {
    const response = await api.post<ApiResponse<Suggestion>>(
      `/suggestions/${id}/reject`
    );
    return response.data;
  },
};

// Dashboard API
export const dashboardAPI = {
  getStats: async () => {
    const response = await api.get<ApiResponse<DashboardStats>>(
      "/dashboard/stats"
    );
    return response.data;
  },

  getRecentCampaigns: async () => {
    const response = await api.get<ApiResponse<Campaign[]>>(
      "/dashboard/recent-campaigns"
    );
    return response.data;
  },

  getRecentSuggestions: async () => {
    const response = await api.get<ApiResponse<Suggestion[]>>(
      "/dashboard/recent-suggestions"
    );
    return response.data;
  },
};

export default api;
