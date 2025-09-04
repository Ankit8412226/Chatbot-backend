import {
    Activity,
    BookOpen,
    Clock,
    Key,
    MessageSquare,
    Star,
    TrendingUp
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Badge from '../components/Badge.jsx';
import { chatAPI, tenantAPI } from '../lib/api.js';
import { useAuth } from '../lib/auth.jsx';

const Dashboard = () => {
  const { user, tenant, refreshTenant } = useAuth();
  const [analytics, setAnalytics] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const [analyticsRes, conversationsRes] = await Promise.all([
        tenantAPI.getAnalytics(30),
        chatAPI.getConversations({ limit: 5 })
      ]);

      setAnalytics(analyticsRes.data);
      setConversations(conversationsRes.data.conversations);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const statusArray = analytics?.conversations?.statusBreakdown || [];
  const activeCount = Array.isArray(statusArray)
    ? statusArray.filter(s => s === 'active' || s === 'transferred').length
    : 0;

  const stats = [
    {
      name: 'Total Conversations',
      value: analytics?.conversations?.totalConversations || 0,
      icon: MessageSquare,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100'
    },
    {
      name: 'Active Chats',
      value: activeCount,
      icon: Activity,
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    },
    {
      name: 'Avg. Satisfaction',
      value: typeof analytics?.conversations?.avgSatisfaction === 'number'
        ? `${analytics.conversations.avgSatisfaction.toFixed(1)}/5`
        : 'N/A',
      icon: Star,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100'
    },
    {
      name: 'Avg. Duration',
      value: typeof analytics?.conversations?.avgDuration === 'number'
        ? `${Math.round((analytics.conversations.avgDuration || 0) / 60)}m`
        : 'N/A',
      icon: Clock,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100'
    }
  ];

  const usagePercentage = (current, limit) => {
    return limit > 0 ? Math.round((current / limit) * 100) : 0;
  };

  const getUsageColor = (percentage) => {
    if (percentage >= 90) return 'text-red-600';
    if (percentage >= 70) return 'text-yellow-600';
    return 'text-green-600';
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome back, {user?.name}! 👋
        </h1>
        <p className="mt-2 text-gray-600">
          Here's what's happening with your chatbot today.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.name} className="card">
              <div className="flex items-center">
                <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                  <Icon className={`h-6 w-6 ${stat.color}`} />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">{stat.name}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Usage Overview */}
        <div className="lg:col-span-2">
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Usage Overview</h3>

            <div className="space-y-4">
              {/* Conversations */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-700">Conversations</span>
                  <span className={`text-sm font-medium ${getUsageColor(usagePercentage(tenant?.usage?.conversations, tenant?.limits?.conversations))}`}>
                    {tenant?.usage?.conversations || 0} / {tenant?.limits?.conversations || 0}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                    style={{
                      width: `${Math.min(100, usagePercentage(tenant?.usage?.conversations, tenant?.limits?.conversations))}%`
                    }}
                  ></div>
                </div>
              </div>

              {/* API Calls */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-700">API Calls</span>
                  <span className={`text-sm font-medium ${getUsageColor(usagePercentage(tenant?.usage?.apiCalls, tenant?.limits?.apiCalls))}`}>
                    {tenant?.usage?.apiCalls || 0} / {tenant?.limits?.apiCalls || 0}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-green-600 h-2 rounded-full transition-all duration-300"
                    style={{
                      width: `${Math.min(100, usagePercentage(tenant?.usage?.apiCalls, tenant?.limits?.apiCalls))}%`
                    }}
                  ></div>
                </div>
              </div>

              {/* Knowledge Items */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-700">Knowledge Items</span>
                  <span className={`text-sm font-medium ${getUsageColor(usagePercentage(tenant?.usage?.knowledgeItems, tenant?.limits?.knowledgeItems))}`}>
                    {tenant?.usage?.knowledgeItems || 0} / {tenant?.limits?.knowledgeItems || 0}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                    style={{
                      width: `${Math.min(100, usagePercentage(tenant?.usage?.knowledgeItems, tenant?.limits?.knowledgeItems))}%`
                    }}
                  ></div>
                </div>
              </div>
            </div>

            {/* Subscription info */}
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium text-gray-900">Current Plan</h4>
                  <p className="text-sm text-gray-600 capitalize">{tenant?.subscription?.plan} plan</p>
                </div>
                <Badge variant="success">
                  {tenant?.subscription?.status}
                </Badge>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Conversations + Billing */}
        <div>
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Conversations</h3>

            {conversations.length === 0 ? (
              <div className="text-center py-8">
                <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No conversations yet</p>
                <p className="text-sm text-gray-400 mt-1">
                  Start by testing your chatbot or sharing your widget
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {conversations.map((conversation) => (
                  <div key={conversation._id} className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-900">
                        {conversation.visitor?.name || 'Anonymous'}
                      </span>
                      <Badge
                        variant={
                          conversation.status === 'active' ? 'success' :
                          conversation.status === 'transferred' ? 'warning' : 'default'
                        }
                      >
                        {conversation.status}
                      </Badge>
                    </div>
                    <p className="text-xs text-gray-500">
                      {conversation.messageCount} messages • {' '}
                      {new Date(conversation.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
          {/* Billing Card */}
          <div className="card mt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Billing</h3>
            <p className="text-sm text-gray-600 mb-3">Manage your subscription</p>
            <Link to="/subscribe" className="btn-primary inline-block">View plans</Link>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link
            to="/api-keys"
            className="card hover:shadow-md transition-shadow cursor-pointer group"
          >
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors">
                <Key className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h4 className="font-medium text-gray-900">Manage API Keys</h4>
                <p className="text-sm text-gray-500">Create and manage access</p>
              </div>
            </div>
          </Link>

          <Link
            to="/knowledge-base"
            className="card hover:shadow-md transition-shadow cursor-pointer group"
          >
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-100 rounded-lg group-hover:bg-green-200 transition-colors">
                <BookOpen className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <h4 className="font-medium text-gray-900">Knowledge Base</h4>
                <p className="text-sm text-gray-500">Add Q&A content</p>
              </div>
            </div>
          </Link>

          <Link
            to="/prompt-tuner"
            className="card hover:shadow-md transition-shadow cursor-pointer group"
          >
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-purple-100 rounded-lg group-hover:bg-purple-200 transition-colors">
                <TrendingUp className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <h4 className="font-medium text-gray-900">Tune Prompts</h4>
                <p className="text-sm text-gray-500">Customize AI behavior</p>
              </div>
            </div>
          </Link>

          <Link
            to="/chat-tester"
            className="card hover:shadow-md transition-shadow cursor-pointer group"
          >
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-orange-100 rounded-lg group-hover:bg-orange-200 transition-colors">
                <MessageSquare className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <h4 className="font-medium text-gray-900">Test Chat</h4>
                <p className="text-sm text-gray-500">Try your chatbot</p>
              </div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
