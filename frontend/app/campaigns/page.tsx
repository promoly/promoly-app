"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Plus,
  Search,
  Filter,
  MoreVertical,
  Play,
  Pause,
  Edit,
  Trash2,
  TrendingUp,
  Eye,
  MousePointer,
  DollarSign,
  Calendar,
  Target,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  useGetCampaignsQuery,
  useDeleteCampaignMutation,
  useGetCampaignPerformanceQuery,
} from "@/lib/api";
import { useAppDispatch } from "@/lib/hooks";
import { addNotification } from "@/lib/slices/uiSlice";
import {
  formatCurrency,
  formatNumber,
  formatPercentage,
  formatDate,
} from "@/lib/utils";

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

export default function CampaignsPage() {
  const dispatch = useAppDispatch();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");

  const { data: campaigns = [], isLoading } = useGetCampaignsQuery();
  const [deleteCampaign] = useDeleteCampaignMutation();

  const filteredCampaigns = campaigns.filter((campaign: any) => {
    const matchesSearch = campaign.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesFilter =
      filterStatus === "all" || campaign.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return "bg-green-100 text-green-800";
      case "PAUSED":
        return "bg-yellow-100 text-yellow-800";
      case "DELETED":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getObjectiveIcon = (objective: string) => {
    switch (objective) {
      case "AWARENESS":
        return <Eye className="w-4 h-4" />;
      case "CONSIDERATION":
        return <Target className="w-4 h-4" />;
      case "CONVERSIONS":
        return <TrendingUp className="w-4 h-4" />;
      default:
        return <Target className="w-4 h-4" />;
    }
  };

  if (isLoading) {
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
            <h1 className="text-3xl font-bold text-gray-900">Campaigns</h1>
            <p className="text-gray-600 mt-1">
              Manage and monitor your advertising campaigns
            </p>
          </div>
          <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
            <Plus className="w-4 h-4 mr-2" />
            Create Campaign
          </Button>
        </motion.div>

        {/* Filters */}
        <motion.div
          variants={itemVariants}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
        >
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search campaigns..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="flex gap-2">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="ACTIVE">Active</option>
                <option value="PAUSED">Paused</option>
                <option value="DELETED">Deleted</option>
              </select>
              <Button variant="outline" className="flex items-center">
                <Filter className="w-4 h-4 mr-2" />
                More Filters
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Campaigns Grid */}
        <motion.div
          variants={itemVariants}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {filteredCampaigns.map((campaign) => (
            <motion.div
              key={campaign.id}
              whileHover={{ y: -4 }}
              className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-all"
            >
              {/* Campaign Header */}
              <div className="p-6 border-b border-gray-100">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-2">
                      {campaign.name}
                    </h3>
                    <div className="flex items-center space-x-2 mb-3">
                      <div className="p-1 bg-blue-100 rounded">
                        {getObjectiveIcon(campaign.objective)}
                      </div>
                      <span className="text-sm text-gray-600">
                        {campaign.objective}
                      </span>
                    </div>
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                        campaign.status
                      )}`}
                    >
                      {campaign.status}
                    </span>
                  </div>
                  <div className="relative">
                    <Button variant="ghost" size="sm" className="p-1">
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* Campaign Metrics */}
              <div className="p-6">
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-gray-900">
                      {formatCurrency(campaign.budget)}
                    </p>
                    <p className="text-xs text-gray-600">Budget</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-gray-900">
                      {campaign.budgetType}
                    </p>
                    <p className="text-xs text-gray-600">Type</p>
                  </div>
                </div>

                {/* Mock Performance Data */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center space-x-2">
                      <Eye className="w-4 h-4 text-blue-600" />
                      <span className="text-gray-600">Impressions</span>
                    </div>
                    <span className="font-medium">{formatNumber(12500)}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center space-x-2">
                      <MousePointer className="w-4 h-4 text-green-600" />
                      <span className="text-gray-600">Clicks</span>
                    </div>
                    <span className="font-medium">{formatNumber(340)}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center space-x-2">
                      <DollarSign className="w-4 h-4 text-purple-600" />
                      <span className="text-gray-600">CTR</span>
                    </div>
                    <span className="font-medium">
                      {formatPercentage(2.72)}
                    </span>
                  </div>
                </div>

                {/* Campaign Dates */}
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <div className="flex items-center justify-between text-xs text-gray-600">
                    <div className="flex items-center space-x-1">
                      <Calendar className="w-3 h-3" />
                      <span>Started</span>
                    </div>
                    <span>{formatDate(campaign.startDate)}</span>
                  </div>
                  {campaign.endDate && (
                    <div className="flex items-center justify-between text-xs text-gray-600 mt-1">
                      <span>Ends</span>
                      <span>{formatDate(campaign.endDate)}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Campaign Actions */}
              <div className="px-6 pb-6">
                <div className="flex space-x-2">
                  {campaign.status === "ACTIVE" ? (
                    <Button variant="outline" size="sm" className="flex-1">
                      <Pause className="w-4 h-4 mr-1" />
                      Pause
                    </Button>
                  ) : (
                    <Button variant="outline" size="sm" className="flex-1">
                      <Play className="w-4 h-4 mr-1" />
                      Activate
                    </Button>
                  )}
                  <Button variant="outline" size="sm">
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-red-600 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Empty State */}
        {filteredCampaigns.length === 0 && (
          <motion.div variants={itemVariants} className="text-center py-12">
            <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <Target className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No campaigns found
            </h3>
            <p className="text-gray-600 mb-6">
              {searchTerm || filterStatus !== "all"
                ? "Try adjusting your search or filters"
                : "Get started by creating your first campaign"}
            </p>
            {!searchTerm && filterStatus === "all" && (
              <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                <Plus className="w-4 h-4 mr-2" />
                Create Your First Campaign
              </Button>
            )}
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
