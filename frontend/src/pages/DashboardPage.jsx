import React, { useRef } from "react";
import { Link } from "react-router-dom";
import { motion, useInView } from "framer-motion";
import { DashboardLayout } from "../components";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Button,
} from "../components";
import {
  HiUsers,
  HiLightningBolt,
  HiInboxIn,
  HiCheckCircle,
  HiArrowRight,
  HiFire,
  HiGlobe,
  HiVideoCamera,
  HiUser,
} from "react-icons/hi";
import useAuthStore from "../stores/authStore";
import { useDashboardData } from "../hooks/useDashboardData";
import AnalyticsDashboard from "../components/analytics/AnalyticsDashboard";

const DashboardPage = () => {
  const statsRef = useRef(null);
  const activityRef = useRef(null);
  const user = useAuthStore((state) => state.user);
  const { dashboardData, isLoading } = useDashboardData(user);

  console.log('📊 DashboardPage: user:', user?.uid);
  console.log('📊 DashboardPage: dashboardData:', dashboardData);
  console.log('📊 DashboardPage: isLoading:', isLoading);

  const isStatsInView = useInView(statsRef, { once: true, amount: 0.3 });
  const isActivityInView = useInView(activityRef, { once: true, amount: 0.3 });

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.1,
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
        ease: [0.25, 0.46, 0.45, 0.94],
      },
    },
  };

  // Format time for display
  const formatTimeAgo = (date) => {
    if (!date) return "Unknown time";

    const seconds = Math.floor((new Date() - date) / 1000);

    let interval = Math.floor(seconds / 31536000);
    if (interval > 1) return `${interval} years ago`;
    if (interval === 1) return "1 year ago";

    interval = Math.floor(seconds / 2592000);
    if (interval > 1) return `${interval} months ago`;
    if (interval === 1) return "1 month ago";

    interval = Math.floor(seconds / 86400);
    if (interval > 1) return `${interval} days ago`;
    if (interval === 1) return "1 day ago";

    interval = Math.floor(seconds / 3600);
    if (interval > 1) return `${interval} hours ago`;
    if (interval === 1) return "1 hour ago";

    interval = Math.floor(seconds / 60);
    if (interval > 1) return `${interval} minutes ago`;
    if (interval === 1) return "1 minute ago";

    return "just now";
  };

  return (
    <DashboardLayout
      user={user}
      userType={user?.userType || "startup"}
      pageTitle={`Welcome back, ${user?.displayName || "there"}!`}
      pageDescription="Your personalized dashboard"
    >
      {/* Stats Cards Grid */}
      <div ref={statsRef} className="mb-8">
        <motion.div
          initial="hidden"
          animate={isStatsInView ? "visible" : "hidden"}
          variants={containerVariants}
        >
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {/* Connections Card */}
            <motion.div variants={itemVariants}>
              <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-primary-50 to-white overflow-hidden group">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-neutral-600 mb-1">
                        Connections
                      </p>
                      <p className="text-4xl font-bold bg-gradient-to-r from-primary-600 to-primary-500 bg-clip-text text-transparent">
                        {dashboardData.connections}
                      </p>
                    </div>
                    <div className="h-16 w-16 rounded-full bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                      <HiUsers className="h-8 w-8 text-white" />
                    </div>
                  </div>
                  <Link to="/connections">
                    <motion.button
                      whileHover={{ x: 4 }}
                      className="mt-4 text-sm font-medium text-primary-600 hover:text-primary-700 flex items-center"
                    >
                      View all
                      <HiArrowRight className="ml-1 h-4 w-4" />
                    </motion.button>
                  </Link>
                </CardContent>
              </Card>
            </motion.div>

            {/* Messages Card */}
            <motion.div variants={itemVariants}>
              <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-accent-50 to-white overflow-hidden group">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-neutral-600 mb-1">
                        Messages
                      </p>
                      <p className="text-4xl font-bold bg-gradient-to-r from-accent-600 to-accent-500 bg-clip-text text-transparent">
                        {dashboardData.messages}
                      </p>
                    </div>
                    <div className="h-16 w-16 rounded-full bg-gradient-to-br from-accent-500 to-accent-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                      <HiInboxIn className="h-8 w-8 text-white" />
                    </div>
                  </div>
                  <Link to="/messages">
                    <motion.button
                      whileHover={{ x: 4 }}
                      className="mt-4 text-sm font-medium text-accent-600 hover:text-accent-700 flex items-center"
                    >
                      View messages
                      <HiArrowRight className="ml-1 h-4 w-4" />
                    </motion.button>
                  </Link>
                </CardContent>
              </Card>
            </motion.div>

            {/* Profile Completion Card */}
            <motion.div variants={itemVariants}>
              <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-secondary-50 to-white overflow-hidden group">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-neutral-600 mb-1">
                        Profile
                      </p>
                      <p className="text-4xl font-bold bg-gradient-to-r from-secondary-600 to-secondary-500 bg-clip-text text-transparent">
                        {dashboardData.profileCompletion}%
                      </p>
                    </div>
                    <div className="h-16 w-16 rounded-full bg-gradient-to-br from-secondary-500 to-secondary-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                      <HiCheckCircle className="h-8 w-8 text-white" />
                    </div>
                  </div>
                  <Link to="/profile">
                    <motion.button
                      whileHover={{ x: 4 }}
                      className="mt-4 text-sm font-medium text-secondary-600 hover:text-secondary-700 flex items-center"
                    >
                      Complete profile
                      <HiArrowRight className="ml-1 h-4 w-4" />
                    </motion.button>
                  </Link>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </motion.div>
      </div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="mb-8"
      >
        <h2 className="text-lg font-semibold text-neutral-900 mb-4">
          Quick Actions
        </h2>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <Link to="/swipe">
            <motion.div
              whileHover={{ y: -4, scale: 1.02 }}
              className="p-4 bg-white rounded-xl shadow-soft hover:shadow-medium transition-all cursor-pointer border border-neutral-100"
            >
              <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center mb-3">
                <HiFire className="h-6 w-6 text-primary-600" />
              </div>
              <p className="text-sm font-medium text-neutral-900">Discover</p>
              <p className="text-xs text-neutral-500 mt-1">Find matches</p>
            </motion.div>
          </Link>

          <Link to="/browse">
            <motion.div
              whileHover={{ y: -4, scale: 1.02 }}
              className="p-4 bg-white rounded-xl shadow-soft hover:shadow-medium transition-all cursor-pointer border border-neutral-100"
            >
              <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-secondary-100 to-secondary-200 flex items-center justify-center mb-3">
                <HiGlobe className="h-6 w-6 text-secondary-600" />
              </div>
              <p className="text-sm font-medium text-neutral-900">Browse</p>
              <p className="text-xs text-neutral-500 mt-1">Explore videos</p>
            </motion.div>
          </Link>

          <Link to="/pitch-videos">
            <motion.div
              whileHover={{ y: -4, scale: 1.02 }}
              className="p-4 bg-white rounded-xl shadow-soft hover:shadow-medium transition-all cursor-pointer border border-neutral-100"
            >
              <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-accent-100 to-accent-200 flex items-center justify-center mb-3">
                <HiVideoCamera className="h-6 w-6 text-accent-600" />
              </div>
              <p className="text-sm font-medium text-neutral-900">My Videos</p>
              <p className="text-xs text-neutral-500 mt-1">Manage pitches</p>
            </motion.div>
          </Link>

          <Link to="/profile">
            <motion.div
              whileHover={{ y: -4, scale: 1.02 }}
              className="p-4 bg-white rounded-xl shadow-soft hover:shadow-medium transition-all cursor-pointer border border-neutral-100"
            >
              <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-primary-100 to-secondary-100 flex items-center justify-center mb-3">
                <HiUser className="h-6 w-6 text-primary-600" />
              </div>
              <p className="text-sm font-medium text-neutral-900">Profile</p>
              <p className="text-xs text-neutral-500 mt-1">Edit details</p>
            </motion.div>
          </Link>
        </div>
      </motion.div>

      {/* Analytics Dashboard */}
      <div ref={activityRef}>
        <motion.div
          initial="hidden"
          animate={isActivityInView ? "visible" : "hidden"}
          variants={containerVariants}
        >
          <motion.div variants={itemVariants}>
            <Card className="border-0 shadow-xl bg-white">
              <CardHeader className="border-b border-neutral-100 pb-4">
                <CardTitle className="text-xl flex items-center">
                  <HiLightningBolt className="h-5 w-5 text-primary-600 mr-2" />
                  Analytics & Performance
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <AnalyticsDashboard userId={user?.uid} />
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      </div>
    </DashboardLayout>
  );
};

export default DashboardPage;
