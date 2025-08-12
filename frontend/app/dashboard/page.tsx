"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  TrendingUp,
  Users,
  DollarSign,
  Target,
  Activity,
  Eye,
  MousePointer,
  UserCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  useGetDashboardDataQuery,
  useGetCampaignsQuery,
  useGetSuggestionsQuery,
  useApproveSuggestionMutation,
  useRejectSuggestionMutation,
} from "@/lib/api";
import { useAppDispatch } from "@/lib/hooks";
import { addNotification } from "@/lib/slices/uiSlice";
import { formatCurrency, formatNumber, formatPercentage } from "@/lib/utils";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      duration: 0.5,
    },
  },
};

export default function DashboardPage() {
  const dispatch = useAppDispatch();

  const { data: dashboardData, isLoading: dashboardLoading } =
    useGetDashboardDataQuery();
  const { data: campaigns = [] } = useGetCampaignsQuery();
  const { data: suggestions = [] } = useGetSuggestionsQuery();

  const [approveSuggestion] = useApproveSuggestionMutation();
  const [rejectSuggestion] = useRejectSuggestionMutation();

  const handleApproveSuggestion = async (id: string) => {
    try {
      await approveSuggestion(id).unwrap();
      dispatch(
        addNotification({
          type: "success",
          title: "Suggestion approved",
          message: "The suggestion has been approved and will be applied.",
          duration: 3000,
        })
      );
    } catch (error) {
      dispatch(
        addNotification({
          type: "error",
          title: "Error",
          message: "Failed to approve suggestion.",
          duration: 5000,
        })
      );
    }
  };

  const handleRejectSuggestion = async (id: string) => {
    try {
      await rejectSuggestion(id).unwrap();
      dispatch(
        addNotification({
          type: "success",
          title: "Suggestion rejected",
          message: "The suggestion has been rejected.",
          duration: 3000,
        })
      );
    } catch (error) {
      dispatch(
        addNotification({
          type: "error",
          title: "Error",
          message: "Failed to reject suggestion.",
          duration: 5000,
        })
      );
    }
  };

  // Mock data for charts
  const performanceData = [
    { date: "Mon", impressions: 12000, clicks: 340, leads: 27 },
    { date: "Tue", impressions: 13500, clicks: 380, leads: 32 },
    { date: "Wed", impressions: 11800, clicks: 320, leads: 25 },
    { date: "Thu", impressions: 14200, clicks: 410, leads: 35 },
    { date: "Fri", impressions: 12800, clicks: 360, leads: 28 },
    { date: "Sat", impressions: 9800, clicks: 280, leads: 22 },
    { date: "Sun", impressions: 11200, clicks: 310, leads: 26 },
  ];

  const campaignData = [
    { name: "Lead Generation", value: 45, color: "#3B82F6" },
    { name: "Brand Awareness", value: 30, color: "#10B981" },
    { name: "Conversions", value: 25, color: "#F59E0B" },
  ];

  if (dashboardLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-7xl mx-auto space-y-6"
      >
        {/* Header */}
        <motion.div
          variants={itemVariants}
          className="flex justify-between items-center"
        >
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600 mt-1">
              Welcome back! Here's what's happening with your campaigns.
            </p>
          </div>
          <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
            <Activity className="w-4 h-4 mr-2" />
            View All Campaigns
          </Button>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          variants={itemVariants}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Total Campaigns
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {dashboardData?.totalCampaigns || 0}
                </p>
                <p className="text-sm text-green-600 flex items-center mt-1">
                  <TrendingUp className="w-4 h-4 mr-1" />
                  +12% from last month
                </p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <Target className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Spend</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(dashboardData?.totalSpend || 0)}
                </p>
                <p className="text-sm text-green-600 flex items-center mt-1">
                  <TrendingUp className="w-4 h-4 mr-1" />
                  +8% from last month
                </p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Leads</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatNumber(dashboardData?.totalLeads || 0)}
                </p>
                <p className="text-sm text-green-600 flex items-center mt-1">
                  <TrendingUp className="w-4 h-4 mr-1" />
                  +15% from last month
                </p>
              </div>
              <div className="p-3 bg-purple-100 rounded-lg">
                <UserCheck className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg. CTR</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatPercentage(dashboardData?.averageCtr || 0)}
                </p>
                <p className="text-sm text-green-600 flex items-center mt-1">
                  <TrendingUp className="w-4 h-4 mr-1" />
                  +3% from last month
                </p>
              </div>
              <div className="p-3 bg-orange-100 rounded-lg">
                <MousePointer className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Charts Section */}
        <motion.div
          variants={itemVariants}
          className="grid grid-cols-1 lg:grid-cols-2 gap-6"
        >
          {/* Performance Chart */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Performance Overview
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={performanceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="impressions"
                  stroke="#3B82F6"
                  strokeWidth={2}
                />
                <Line
                  type="monotone"
                  dataKey="clicks"
                  stroke="#10B981"
                  strokeWidth={2}
                />
                <Line
                  type="monotone"
                  dataKey="leads"
                  stroke="#F59E0B"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Campaign Distribution */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Campaign Distribution
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={campaignData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) =>
                    `${name} ${(percent * 100).toFixed(0)}%`
                  }
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {campaignData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Recent Activity */}
        <motion.div
          variants={itemVariants}
          className="grid grid-cols-1 lg:grid-cols-2 gap-6"
        >
          {/* Recent Campaigns */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Recent Campaigns
            </h3>
            <div className="space-y-4">
              {campaigns.slice(0, 5).map((campaign) => (
                <div
                  key={campaign.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                >
                  <div>
                    <h4 className="font-medium text-gray-900">
                      {campaign.name}
                    </h4>
                    <p className="text-sm text-gray-600">
                      {campaign.objective}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-900">
                      {formatCurrency(campaign.budget)}
                    </p>
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        campaign.status === "ACTIVE"
                          ? "bg-green-100 text-green-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {campaign.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Suggestions */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              AI Suggestions
            </h3>
            <div className="space-y-4">
              {suggestions.slice(0, 5).map((suggestion) => (
                <div
                  key={suggestion.id}
                  className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">
                        {suggestion.title}
                      </h4>
                      <p className="text-sm text-gray-600 mt-1">
                        {suggestion.description}
                      </p>
                      <div className="flex items-center mt-2 space-x-2">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            suggestion.priority === "HIGH"
                              ? "bg-red-100 text-red-800"
                              : suggestion.priority === "MEDIUM"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-green-100 text-green-800"
                          }`}
                        >
                          {suggestion.priority}
                        </span>
                        <span className="text-xs text-gray-500">
                          {suggestion.estimatedImpact.value}{" "}
                          {suggestion.estimatedImpact.unit}
                        </span>
                      </div>
                    </div>
                    <div className="flex space-x-2 ml-4">
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-green-600 border-green-200 hover:bg-green-50"
                        onClick={() => handleApproveSuggestion(suggestion.id)}
                      >
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-red-600 border-red-200 hover:bg-red-50"
                        onClick={() => handleRejectSuggestion(suggestion.id)}
                      >
                        Reject
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
