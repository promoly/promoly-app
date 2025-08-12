"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  User,
  Shield,
  CreditCard,
  Facebook,
  Bell,
  Globe,
  Save,
  Plus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  useGetProfileQuery,
  useGetMetaAccountsQuery,
  useConnectMetaAccountMutation,
} from "@/lib/api";
import { useAppDispatch } from "@/lib/hooks";
import { addNotification } from "@/lib/slices/uiSlice";

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

export default function SettingsPage() {
  const dispatch = useAppDispatch();
  const [activeTab, setActiveTab] = useState("profile");

  const { data: user, isLoading: userLoading } = useGetProfileQuery();
  const { data: metaAccounts = [], isLoading: accountsLoading } =
    useGetMetaAccountsQuery();
  const [connectMetaAccount] = useConnectMetaAccountMutation();

  const loading = userLoading || accountsLoading;

  const tabs = [
    { id: "profile", name: "Profile", icon: User },
    { id: "security", name: "Security", icon: Shield },
    { id: "billing", name: "Billing", icon: CreditCard },
    { id: "integrations", name: "Integrations", icon: Facebook },
    { id: "notifications", name: "Notifications", icon: Bell },
  ];

  if (loading) {
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
        className="max-w-4xl mx-auto space-y-6"
      >
        {/* Header */}
        <motion.div variants={itemVariants}>
          <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-600 mt-1">
            Manage your account and preferences
          </p>
        </motion.div>

        {/* Tabs */}
        <motion.div
          variants={itemVariants}
          className="border-b border-gray-200"
        >
          <nav className="-mb-px flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                  activeTab === tab.id
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                <tab.icon className="w-4 h-4" />
                <span>{tab.name}</span>
              </button>
            ))}
          </nav>
        </motion.div>

        {/* Tab Content */}
        <motion.div
          variants={itemVariants}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
        >
          {activeTab === "profile" && (
            <div className="space-y-6">
              <h2 className="text-lg font-semibold text-gray-900">
                Profile Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Name
                  </label>
                  <input
                    type="text"
                    defaultValue={user?.name || ""}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    defaultValue={user?.email || ""}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </Button>
            </div>
          )}

          {activeTab === "security" && (
            <div className="space-y-6">
              <h2 className="text-lg font-semibold text-gray-900">
                Security Settings
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Current Password
                  </label>
                  <input
                    type="password"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    New Password
                  </label>
                  <input
                    type="password"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Save className="w-4 h-4 mr-2" />
                Update Password
              </Button>
            </div>
          )}

          {activeTab === "billing" && (
            <div className="space-y-6">
              <h2 className="text-lg font-semibold text-gray-900">
                Billing & Subscription
              </h2>
              <div className="bg-gray-50 rounded-lg p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">
                      {user?.plan} Plan
                    </h3>
                    <p className="text-gray-600">Current subscription</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-gray-900">
                      {user?.plan === "FREE"
                        ? "Free"
                        : user?.plan === "PRO"
                        ? "$29/month"
                        : "$99/month"}
                    </p>
                    <p className="text-sm text-gray-600">
                      Next billing: Dec 15, 2024
                    </p>
                  </div>
                </div>
              </div>
              <Button variant="outline">Upgrade Plan</Button>
            </div>
          )}

          {activeTab === "integrations" && (
            <div className="space-y-6">
              <h2 className="text-lg font-semibold text-gray-900">
                Connected Accounts
              </h2>

              {/* Meta Ads Integration */}
              <div className="border border-gray-200 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Facebook className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">
                        Meta Ads
                      </h3>
                      <p className="text-gray-600">
                        Connect your Facebook Ad accounts
                      </p>
                    </div>
                  </div>
                  <Button className="bg-blue-600 hover:bg-blue-700">
                    <Plus className="w-4 h-4 mr-2" />
                    Connect Account
                  </Button>
                </div>

                {metaAccounts.length > 0 ? (
                  <div className="space-y-3">
                    {metaAccounts.map((account) => (
                      <div
                        key={account.id}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                      >
                        <div>
                          <p className="font-medium text-gray-900">
                            {account.name}
                          </p>
                          <p className="text-sm text-gray-600">
                            ID: {account.adAccountId}
                          </p>
                        </div>
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            account.status === "ACTIVE"
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {account.status}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm">
                    No Meta Ads accounts connected yet.
                  </p>
                )}
              </div>
            </div>
          )}

          {activeTab === "notifications" && (
            <div className="space-y-6">
              <h2 className="text-lg font-semibold text-gray-900">
                Notification Preferences
              </h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-gray-900">
                      Campaign Performance Alerts
                    </h3>
                    <p className="text-sm text-gray-600">
                      Get notified when campaigns need attention
                    </p>
                  </div>
                  <input type="checkbox" defaultChecked className="rounded" />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-gray-900">
                      AI Suggestions
                    </h3>
                    <p className="text-sm text-gray-600">
                      Receive AI-powered optimization suggestions
                    </p>
                  </div>
                  <input type="checkbox" defaultChecked className="rounded" />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-gray-900">Budget Alerts</h3>
                    <p className="text-sm text-gray-600">
                      Notifications when budgets are running low
                    </p>
                  </div>
                  <input type="checkbox" className="rounded" />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-gray-900">
                      Weekly Reports
                    </h3>
                    <p className="text-sm text-gray-600">
                      Receive weekly performance summaries
                    </p>
                  </div>
                  <input type="checkbox" defaultChecked className="rounded" />
                </div>
              </div>
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Save className="w-4 h-4 mr-2" />
                Save Preferences
              </Button>
            </div>
          )}
        </motion.div>
      </motion.div>
    </div>
  );
}
