// src/components/layout/DashboardLayout.jsx
import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import Header from "./Header";
import Sidebar from "./Sidebar";
import Footer from "./Footer";

const backgroundPattern =
  "data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E";

const DashboardLayout = ({
  children,
  user = null,
  userType = "startup",
  pageTitle = "",
  pageDescription = "",
}) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  // Close sidebar when route changes (for mobile)
  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  // Format the user object for the Header component
  const formattedUser = user ? {
    name: user.displayName || "User",
    email: user.email || "",
    profilePicture: user.photoURL || "",
  } : null;
  
  return (
    <div className="flex min-h-screen flex-col relative">
      {/* Gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary-900 via-primary-800 to-primary-700 -z-10"></div>

      {/* Pattern overlay */}
      <div
        className="absolute inset-0 opacity-20 -z-10"
        style={{ backgroundImage: `url("${backgroundPattern}")` }}
      ></div>

      {/* Floating Elements */}
      <motion.div
        animate={{
          y: [-10, 10, -10],
          transition: {
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut",
          },
        }}
        className="absolute right-[5%] top-[15%] hidden lg:block -z-10"
      >
        <div className="h-32 w-32 rounded-full bg-gradient-to-br from-accent-400 to-accent-600 opacity-10 blur-xl"></div>
      </motion.div>

      <motion.div
        animate={{
          y: [-10, 10, -10],
          transition: {
            duration: 5,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1.5,
          },
        }}
        className="absolute left-[8%] bottom-[20%] hidden lg:block -z-10"
      >
        <div className="h-40 w-40 rounded-full bg-gradient-to-br from-secondary-400 to-secondary-600 opacity-10 blur-xl"></div>
      </motion.div>

      <Header user={formattedUser} onMenuToggle={() => setSidebarOpen(!sidebarOpen)} />

      <div className="flex flex-1">
        <Sidebar isOpen={sidebarOpen} userType={userType} />

        <div className="flex flex-1 flex-col lg:pl-64">
          <main className="flex-1 px-4 py-8 sm:px-6 lg:px-8">
            {(pageTitle || pageDescription) && (
              <div className="mb-8">
                {pageTitle && (
                  <h1 className="text-2xl font-bold text-white sm:text-3xl">
                    {pageTitle}
                  </h1>
                )}
                {pageDescription && (
                  <p className="mt-2 text-sm text-primary-100">
                    {pageDescription}
                  </p>
                )}
              </div>
            )}

            {children}
          </main>

          <Footer minimal />
        </div>
      </div>

      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-10 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default DashboardLayout;
