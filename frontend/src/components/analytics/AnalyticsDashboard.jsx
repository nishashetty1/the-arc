import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent, Spinner } from '../shared';
import { LineChart, Line, BarChart, Bar, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { HiTrendingUp, HiEye, HiHeart, HiUsers } from 'react-icons/hi';
import { getUserVideoAnalytics, getUserConnectionsAnalytics, getRecentlyViewedVideos } from '../../services/analytics';

const AnalyticsDashboard = ({ userId }) => {
  const [videoAnalytics, setVideoAnalytics] = useState(null);
  const [connectionsAnalytics, setConnectionsAnalytics] = useState(null);
  const [recentVideos, setRecentVideos] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (userId) {
      fetchAnalytics();
    }
  }, [userId]);

  const fetchAnalytics = async () => {
    setIsLoading(true);
    try {
      const [videos, connections, recent] = await Promise.all([
        getUserVideoAnalytics(userId),
        getUserConnectionsAnalytics(userId),
        getRecentlyViewedVideos(userId, 5)
      ]);
      
      setVideoAnalytics(videos);
      setConnectionsAnalytics(connections);
      setRecentVideos(recent);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Spinner size="lg" />
      </div>
    );
  }

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return `${date.getMonth() + 1}/${date.getDate()}`;
  };

  // Custom tooltip for charts
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 rounded-lg shadow-lg border border-neutral-200">
          <p className="font-semibold text-neutral-900">{formatDate(label)}</p>
          {payload.map((entry, index) => (
            <p key={index} style={{ color: entry.color }} className="text-sm">
              {entry.name}: {entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-white border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-neutral-600">Total Views</p>
                <p className="text-2xl font-bold text-blue-600">{videoAnalytics?.totalViews || 0}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-blue-500 flex items-center justify-center">
                <HiEye className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-pink-50 to-white border-pink-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-neutral-600">Total Likes</p>
                <p className="text-2xl font-bold text-pink-600">{videoAnalytics?.totalLikes || 0}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-pink-500 flex items-center justify-center">
                <HiHeart className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-white border-purple-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-neutral-600">Connections</p>
                <p className="text-2xl font-bold text-purple-600">{connectionsAnalytics?.totalConnections || 0}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-purple-500 flex items-center justify-center">
                <HiUsers className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-white border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-neutral-600">Total Videos</p>
                <p className="text-2xl font-bold text-green-600">{videoAnalytics?.totalVideos || 0}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-green-500 flex items-center justify-center">
                <HiTrendingUp className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-neutral-200">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'overview'
              ? 'text-primary-600 border-b-2 border-primary-600'
              : 'text-neutral-600 hover:text-neutral-900'
          }`}
        >
          Overview
        </button>
        <button
          onClick={() => setActiveTab('engagement')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'engagement'
              ? 'text-primary-600 border-b-2 border-primary-600'
              : 'text-neutral-600 hover:text-neutral-900'
          }`}
        >
          Engagement
        </button>
        <button
          onClick={() => setActiveTab('recent')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'recent'
              ? 'text-primary-600 border-b-2 border-primary-600'
              : 'text-neutral-600 hover:text-neutral-900'
          }`}
        >
          Recent Activity
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Video Engagement Over Time */}
          <Card>
            <CardHeader>
              <CardTitle>Video Engagement (Last 30 Days)</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={videoAnalytics?.dailyMetrics || []}>
                  <defs>
                    <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorLikes" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#EC4899" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#EC4899" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis 
                    dataKey="date" 
                    tickFormatter={formatDate}
                    stroke="#6B7280"
                    style={{ fontSize: '12px' }}
                  />
                  <YAxis stroke="#6B7280" style={{ fontSize: '12px' }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Area type="monotone" dataKey="views" stroke="#3B82F6" fillOpacity={1} fill="url(#colorViews)" name="Views" />
                  <Area type="monotone" dataKey="likes" stroke="#EC4899" fillOpacity={1} fill="url(#colorLikes)" name="Likes" />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Connections Growth */}
          <Card>
            <CardHeader>
              <CardTitle>Connections Growth (Last 30 Days)</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={connectionsAnalytics?.cumulativeConnections || []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis 
                    dataKey="date" 
                    tickFormatter={formatDate}
                    stroke="#6B7280"
                    style={{ fontSize: '12px' }}
                  />
                  <YAxis stroke="#6B7280" style={{ fontSize: '12px' }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Line type="monotone" dataKey="cumulative" stroke="#8B5CF6" strokeWidth={3} dot={{ r: 4 }} name="Total Connections" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'engagement' && (
        <div className="grid grid-cols-1 gap-6">
          {/* Daily Likes and Views Bar Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Daily Engagement Comparison</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={videoAnalytics?.dailyMetrics || []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis 
                    dataKey="date" 
                    tickFormatter={formatDate}
                    stroke="#6B7280"
                    style={{ fontSize: '12px' }}
                  />
                  <YAxis stroke="#6B7280" style={{ fontSize: '12px' }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Bar dataKey="views" fill="#3B82F6" name="Views" radius={[8, 8, 0, 0]} />
                  <Bar dataKey="likes" fill="#EC4899" name="Likes" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'recent' && (
        <div className="space-y-6">
          {/* Recently Viewed Videos */}
          <Card>
            <CardHeader>
              <CardTitle>Recently Viewed Videos</CardTitle>
            </CardHeader>
            <CardContent>
              {recentVideos.length === 0 ? (
                <p className="text-neutral-500 text-center py-8">No recent activity</p>
              ) : (
                <div className="space-y-3">
                  {recentVideos.map((video) => (
                    <div key={video.id} className="flex items-center space-x-4 p-3 bg-neutral-50 rounded-lg hover:bg-neutral-100 transition-colors">
                      <div className="flex-shrink-0">
                        {video.user.photoURL ? (
                          <img
                            src={video.user.photoURL}
                            alt={video.user.displayName}
                            className="h-12 w-12 rounded-full object-cover"
                          />
                        ) : (
                          <div className="h-12 w-12 rounded-full bg-gradient-to-br from-primary-400 to-secondary-400 flex items-center justify-center text-white font-semibold">
                            {video.user.displayName.charAt(0).toUpperCase()}
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-neutral-900 truncate">{video.title || 'Untitled Video'}</p>
                        <p className="text-sm text-neutral-600 truncate">by {video.user.displayName}</p>
                      </div>
                      <div className="flex items-center space-x-4 text-sm text-neutral-500">
                        <div className="flex items-center space-x-1">
                          <HiEye className="h-4 w-4" />
                          <span>{video.views || 0}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <HiHeart className="h-4 w-4" />
                          <span>{video.likes || 0}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default AnalyticsDashboard;
