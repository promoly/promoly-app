import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

// Define base query with authentication
const baseQuery = fetchBaseQuery({
  baseUrl: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001",
  prepareHeaders: (headers, { getState }) => {
    // Get token from localStorage for client-side requests
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("token");
      if (token) {
        headers.set("authorization", `Bearer ${token}`);
      }
    }
    return headers;
  },
});

// Create the API slice
export const api = createApi({
  reducerPath: "api",
  baseQuery,
  tagTypes: ["User", "Campaign", "MetaAccount", "Suggestion", "Performance"],
  endpoints: (builder) => ({
    // Auth endpoints
    login: builder.mutation<
      { token: string; user: any },
      { email: string; password: string }
    >({
      query: (credentials) => ({
        url: "/auth/login",
        method: "POST",
        body: credentials,
      }),
    }),
    register: builder.mutation<
      { token: string; user: any },
      { name: string; email: string; password: string }
    >({
      query: (userData) => ({
        url: "/auth/register",
        method: "POST",
        body: userData,
      }),
    }),
    getProfile: builder.query<any, void>({
      query: () => "/users/me",
      providesTags: ["User"],
    }),

    // Campaign endpoints
    getCampaigns: builder.query<any[], void>({
      query: () => "/campaigns",
      providesTags: ["Campaign"],
    }),
    getCampaign: builder.query<any, string>({
      query: (id) => `/campaigns/${id}`,
      providesTags: (result, error, id) => [{ type: "Campaign", id }],
    }),
    createCampaign: builder.mutation<any, any>({
      query: (campaign) => ({
        url: "/campaigns",
        method: "POST",
        body: campaign,
      }),
      invalidatesTags: ["Campaign"],
    }),
    updateCampaign: builder.mutation<any, { id: string; data: any }>({
      query: ({ id, data }) => ({
        url: `/campaigns/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: "Campaign", id }],
    }),
    deleteCampaign: builder.mutation<void, string>({
      query: (id) => ({
        url: `/campaigns/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Campaign"],
    }),
    getCampaignPerformance: builder.query<any, string>({
      query: (id) => `/campaigns/${id}/performance`,
      providesTags: (result, error, id) => [{ type: "Performance", id }],
    }),

    // Meta Ads integration endpoints
    getMetaAccounts: builder.query<any[], void>({
      query: () => "/meta/accounts",
      providesTags: ["MetaAccount"],
    }),
    connectMetaAccount: builder.mutation<
      any,
      { adAccountId: string; accessToken: string }
    >({
      query: (accountData) => ({
        url: "/meta/connect",
        method: "POST",
        body: accountData,
      }),
      invalidatesTags: ["MetaAccount"],
    }),

    // AI endpoints
    generateAdCopy: builder.mutation<any, { prompt: string; context?: any }>({
      query: (data) => ({
        url: "/ai/generate",
        method: "POST",
        body: data,
      }),
    }),
    getOptimizationSuggestions: builder.mutation<
      any,
      { campaignId: string; performanceData?: any }
    >({
      query: (data) => ({
        url: "/ai/suggest",
        method: "POST",
        body: data,
      }),
    }),
    chatCompletion: builder.mutation<any, { message: string; history?: any[] }>(
      {
        query: (data) => ({
          url: "/ai/chat",
          method: "POST",
          body: data,
        }),
      }
    ),
    ragQuery: builder.mutation<any, { query: string }>({
      query: (data) => ({
        url: "/ai/rag/query",
        method: "POST",
        body: data,
      }),
    }),

    // Suggestions endpoints
    getSuggestions: builder.query<any[], void>({
      query: () => "/suggestions",
      providesTags: ["Suggestion"],
    }),
    approveSuggestion: builder.mutation<any, string>({
      query: (id) => ({
        url: `/suggestions/${id}/approve`,
        method: "POST",
      }),
      invalidatesTags: ["Suggestion"],
    }),
    rejectSuggestion: builder.mutation<any, string>({
      query: (id) => ({
        url: `/suggestions/${id}/reject`,
        method: "POST",
      }),
      invalidatesTags: ["Suggestion"],
    }),

    // Dashboard endpoints
    getDashboardData: builder.query<any, void>({
      query: () => "/dashboard",
      providesTags: ["Campaign", "Performance", "Suggestion"],
    }),
  }),
});

// Export hooks for use in components
export const {
  // Auth hooks
  useLoginMutation,
  useRegisterMutation,
  useGetProfileQuery,

  // Campaign hooks
  useGetCampaignsQuery,
  useGetCampaignQuery,
  useCreateCampaignMutation,
  useUpdateCampaignMutation,
  useDeleteCampaignMutation,
  useGetCampaignPerformanceQuery,

  // Meta hooks
  useGetMetaAccountsQuery,
  useConnectMetaAccountMutation,

  // AI hooks
  useGenerateAdCopyMutation,
  useGetOptimizationSuggestionsMutation,
  useChatCompletionMutation,
  useRagQueryMutation,

  // Suggestions hooks
  useGetSuggestionsQuery,
  useApproveSuggestionMutation,
  useRejectSuggestionMutation,

  // Dashboard hooks
  useGetDashboardDataQuery,
} = api;
