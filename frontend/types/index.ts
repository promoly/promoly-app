export interface User {
  id: string;
  email: string;
  name: string;
  role: "USER" | "ADMIN";
  plan: "FREE" | "PRO" | "ENTERPRISE";
  createdAt: string;
  updatedAt: string;
}

export interface MetaAccount {
  id: string;
  adAccountId: string;
  name: string;
  currency: string;
  timezone: string;
  status: "ACTIVE" | "DISABLED";
  createdAt: string;
}

export interface Campaign {
  id: string;
  name: string;
  objective: "AWARENESS" | "CONSIDERATION" | "CONVERSIONS";
  status: "ACTIVE" | "PAUSED" | "DELETED";
  budget: number;
  budgetType: "DAILY" | "LIFETIME";
  startDate: string;
  endDate?: string;
  targetAudience: {
    ageMin: number;
    ageMax: number;
    genders: string[];
    locations: string[];
    interests: string[];
  };
  metaCampaignId?: string;
  metaAccountId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CampaignPerformance {
  id: string;
  campaignId: string;
  date: string;
  impressions: number;
  clicks: number;
  spend: number;
  reach: number;
  leads?: number;
  conversions?: number;
  ctr: number;
  cpc: number;
  cpm: number;
  cpl?: number;
  createdAt: string;
}

export interface Suggestion {
  id: string;
  type:
    | "BUDGET_OPTIMIZATION"
    | "TARGETING_OPTIMIZATION"
    | "CREATIVE_SUGGESTION"
    | "CAMPAIGN_STRUCTURE";
  title: string;
  description: string;
  action?: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  campaignId?: string;
  priority: "LOW" | "MEDIUM" | "HIGH";
  estimatedImpact: {
    metric: string;
    value: number;
    unit: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
  metadata?: {
    suggestionId?: string;
    campaignId?: string;
    action?: string;
  };
}

export interface DashboardStats {
  totalCampaigns: number;
  activeCampaigns: number;
  totalSpend: number;
  totalLeads: number;
  averageCtr: number;
  averageCpl: number;
  totalReach: number;
  totalClicks: number;
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
