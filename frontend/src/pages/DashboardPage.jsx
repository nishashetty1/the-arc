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
} from "react-icons/hi";

const user = {
  name: "Demo User",
  email: "demo@example.com",
  profilePicture: "https://randomuser.me/api/portraits/women/50.jpg",
};

const DashboardPage = () => {
  const statsRef = useRef(null);
  const activityRef = useRef(null);

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

  return (
    <DashboardLayout
      user={user}
      userType="startup"
      pageTitle="Welcome back, Demo User!"
      pageDescription="Here's an overview of your recent activity and connections."
    >
      {/* Welcome Card with Glassmorphism */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="mb-8 backdrop-blur-lg bg-white/20 rounded-xl border border-white/30 p-6 text-white"
      >
        <h2 className="text-xl sm:text-2xl font-bold">
          Good morning,{" "}
          <span className="bg-gradient-to-r from-accent-300 to-secondary-300 bg-clip-text text-transparent">
            Demo User!
          </span>
        </h2>
        <p className="mt-2 text-white/80">
          You have <span className="font-semibold">3 new matches</span> and{" "}
          <span className="font-semibold">5 pending connection requests</span>{" "}
          waiting for you.
        </p>
      </motion.div>

      {/* Stats Cards */}
      <div ref={statsRef} className="mb-8">
        <motion.div
          initial="hidden"
          animate={isStatsInView ? "visible" : "hidden"}
          variants={containerVariants}
        >
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <motion.div variants={itemVariants}>
              <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 backdrop-blur-md bg-white/90">
                <CardContent className="flex items-center p-4 sm:p-6">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-primary-100 to-primary-200 text-primary-600">
                    <HiUsers className="h-6 w-6" />
                  </div>
                  <div className="ml-4">
                    <h3 className="text-sm font-medium text-neutral-500">
                      Connections
                    </h3>
                    <p className="text-2xl font-semibold bg-gradient-to-r from-primary-700 to-primary-500 bg-clip-text text-transparent">
                      24
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={itemVariants}>
              <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 backdrop-blur-md bg-white/90">
                <CardContent className="flex items-center p-4 sm:p-6">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-secondary-100 to-secondary-200 text-secondary-600">
                    <HiLightningBolt className="h-6 w-6" />
                  </div>
                  <div className="ml-4">
                    <h3 className="text-sm font-medium text-neutral-500">
                      Matches
                    </h3>
                    <p className="text-2xl font-semibold bg-gradient-to-r from-secondary-700 to-secondary-500 bg-clip-text text-transparent">
                      12
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={itemVariants}>
              <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 backdrop-blur-md bg-white/90">
                <CardContent className="flex items-center p-4 sm:p-6">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-accent-100 to-accent-200 text-accent-600">
                    <HiInboxIn className="h-6 w-6" />
                  </div>
                  <div className="ml-4">
                    <h3 className="text-sm font-medium text-neutral-500">
                      Messages
                    </h3>
                    <p className="text-2xl font-semibold bg-gradient-to-r from-accent-700 to-accent-500 bg-clip-text text-transparent">
                      8
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={itemVariants}>
              <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 backdrop-blur-md bg-white/90">
                <CardContent className="flex items-center p-4 sm:p-6">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-green-100 to-green-200 text-green-600">
                    <HiCheckCircle className="h-6 w-6" />
                  </div>
                  <div className="ml-4">
                    <h3 className="text-sm font-medium text-neutral-500">
                      Profile Completion
                    </h3>
                    <p className="text-2xl font-semibold bg-gradient-to-r from-green-600 to-green-400 bg-clip-text text-transparent">
                      85%
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </motion.div>
      </div>

      {/* Recent Activity */}
      <div ref={activityRef}>
        <motion.div
          initial="hidden"
          animate={isActivityInView ? "visible" : "hidden"}
          variants={containerVariants}
        >
          <motion.div variants={itemVariants}>
            <Card className="border-0 shadow-xl backdrop-blur-md bg-white/90">
              <CardHeader className="border-b border-neutral-100 pb-4">
                <CardTitle className="text-xl">Recent Activity</CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="space-y-4">
                  <motion.div
                    variants={itemVariants}
                    className="flex items-start space-x-3 p-3 rounded-lg hover:bg-neutral-50 transition-colors"
                  >
                    <div className="flex-shrink-0">
                      <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center">
                        <HiUsers className="h-5 w-5 text-primary-600" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-neutral-900">
                        New connection request from John Doe
                      </p>
                      <p className="text-xs text-neutral-500">2 hours ago</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="flex-shrink-0 hidden sm:block"
                    >
                      View
                    </Button>
                  </motion.div>

                  <motion.div
                    variants={itemVariants}
                    className="flex items-start space-x-3 p-3 rounded-lg hover:bg-neutral-50 transition-colors"
                  >
                    <div className="flex-shrink-0">
                      <div className="h-10 w-10 rounded-full bg-gradient-to-br from-secondary-100 to-secondary-200 flex items-center justify-center">
                        <HiLightningBolt className="h-5 w-5 text-secondary-600" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-neutral-900">
                        You have 3 new matches
                      </p>
                      <p className="text-xs text-neutral-500">4 hours ago</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="flex-shrink-0 hidden sm:block"
                    >
                      Explore
                    </Button>
                  </motion.div>

                  <motion.div
                    variants={itemVariants}
                    className="flex items-start space-x-3 p-3 rounded-lg hover:bg-neutral-50 transition-colors"
                  >
                    <div className="flex-shrink-0">
                      <div className="h-10 w-10 rounded-full bg-gradient-to-br from-accent-100 to-accent-200 flex items-center justify-center">
                        <HiInboxIn className="h-5 w-5 text-accent-600" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-neutral-900">
                        Message from Sarah Wilson
                      </p>
                      <p className="text-xs text-neutral-500">1 day ago</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="flex-shrink-0 hidden sm:block"
                    >
                      Reply
                    </Button>
                  </motion.div>
                </div>

                <div className="mt-6 text-center">
                  <Link to="/activity">
                    <Button
                      variant="primary"
                      className="text-white group"
                      rightIcon={
                        <HiArrowRight className="transition-transform group-hover:translate-x-1" />
                      }
                    >
                      View All Activity
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      </div>

      {/* Additional section - Upcoming Meetings/Events with Glassmorphism */}
      <div className="mt-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="backdrop-blur-lg bg-white/20 rounded-xl border border-white/30 p-6"
        >
          <h3 className="text-xl font-bold text-white mb-4">
            Upcoming Meetings
          </h3>

          <div className="space-y-4">
            <div className="bg-white/30 rounded-lg p-4 flex items-center justify-between border border-white/20">
              <div className="flex items-center">
                <div className="h-10 w-10 rounded-full bg-accent-500/20 flex items-center justify-center mr-3">
                  <span className="text-white font-bold">JD</span>
                </div>
                <div>
                  <p className="text-white font-medium">Call with John Doe</p>
                  <p className="text-white/70 text-sm">Tomorrow, 11:00 AM</p>
                </div>
              </div>
              <Button
                size="sm"
              >
                Join
              </Button>
            </div>

            <div className="bg-white/30 rounded-lg p-4 flex items-center justify-between border border-white/20">
              <div className="flex items-center">
                <div className="h-10 w-10 rounded-full bg-primary-500/20 flex items-center justify-center mr-3">
                  <span className="text-white font-bold">MT</span>
                </div>
                <div>
                  <p className="text-white font-medium">Team Sync</p>
                  <p className="text-white/70 text-sm">Friday, 3:30 PM</p>
                </div>
              </div>
              <Button
                size="sm"
              >
                Join
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </DashboardLayout>
  );
};

export default DashboardPage;
