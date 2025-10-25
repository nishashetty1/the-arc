import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  HiMenu,
  HiX,
  HiBell,
  HiChevronDown,
  HiOutlineLogout,
} from "react-icons/hi";
import { Avatar, Badge, Button } from "../index";
import { logoutUser } from "../../services/auth";
import useAuthStore from "../../stores/authStore";

const Header = ({ user = null, onMenuToggle, notifications = [] }) => {
  const navigate = useNavigate();
  const clearUser = useAuthStore((state) => state.clearUser);
  const cleanup = useAuthStore((state) => state.cleanup);
  
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);
    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);
  
  const onSignOut = async () => {
    setIsLoggingOut(true);
    try {
      await logoutUser();
      // Clear user from the store
      clearUser();
      // Clean up auth listener
      cleanup();
      // Close the menu
      setProfileMenuOpen(false);
      // Navigate to landing page
      navigate("/");
    } catch (error) {
      console.error("Failed to sign out:", error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  const toggleProfileMenu = () => {
    setProfileMenuOpen(!profileMenuOpen);
    if (notificationsOpen) setNotificationsOpen(false);
  };

  const toggleNotifications = () => {
    setNotificationsOpen(!notificationsOpen);
    if (profileMenuOpen) setProfileMenuOpen(false);
  };

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="sticky top-0 z-50 w-full bg-white/80 backdrop-blur-lg border-b border-white/20 shadow-lg"
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Left section with improved spacing */}
          <div className="flex items-center">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onMenuToggle}
              className="inline-flex items-center justify-center rounded-md p-2 text-neutral-500 hover:bg-neutral-100 hover:text-neutral-600 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500 md:hidden"
              aria-label="Open menu"
            >
              <HiMenu className="h-6 w-6" />
            </motion.button>

            <Link to="/" className="ml-2 flex items-center md:ml-0">
              <motion.span
                whileHover={{ scale: 1.05 }}
                className="text-xl md:text-2xl font-bold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent"
              >
                The Arc.
              </motion.span>
            </Link>
            
            {/* Dashboard Link for logged-in users */}
            {user && (
              <nav className="hidden md:flex ml-8 space-x-6">
                <Link
                  to="/dashboard"
                  className="text-sm font-medium text-neutral-700 hover:text-primary-600 transition-colors"
                >
                  Dashboard
                </Link>
                <Link
                  to="/browse"
                  className="text-sm font-medium text-neutral-700 hover:text-primary-600 transition-colors"
                >
                  Browse
                </Link>
                <Link
                  to="/connections"
                  className="text-sm font-medium text-neutral-700 hover:text-primary-600 transition-colors"
                >
                  Connections
                </Link>
                <Link
                  to="/messages"
                  className="text-sm font-medium text-neutral-700 hover:text-primary-600 transition-colors"
                >
                  Messages
                </Link>
              </nav>
            )}
          </div>

          {/* Right section with responsive adjustments */}
          <div className="flex items-center space-x-2 md:space-x-4">
            {user ? (
              <>
                {/* Notifications */}
                <motion.div whileHover={{ scale: 1.05 }} className="relative">
                  <button
                    className="relative rounded-full p-1 md:p-2 text-neutral-500 hover:bg-neutral-100 hover:text-neutral-600 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                    onClick={toggleNotifications}
                    aria-label="Notifications"
                  >
                    <HiBell className="h-5 w-5 md:h-6 md:w-6" />
                    {notifications.length > 0 && (
                      <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute -right-1 -top-1 block h-3 w-3 rounded-full bg-accent-500 ring-2 ring-white"
                      />
                    )}
                  </button>

                  {/* Notifications dropdown */}
                  {notificationsOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute right-0 mt-2 w-64 md:w-80 origin-top-right rounded-lg bg-white py-2 shadow-xl ring-1 ring-black ring-opacity-5 focus:outline-none"
                    >
                      <div className="px-4 py-2 text-sm font-semibold text-neutral-700 border-b border-neutral-100">
                        Notifications
                      </div>
                      <div className="max-h-96 overflow-y-auto">
                        {notifications.length > 0 ? (
                          notifications.map((notification, index) => (
                            <a
                              key={index}
                              href="#"
                              className="block px-4 py-3 hover:bg-neutral-50 transition-colors"
                            >
                              <p className="text-sm font-medium text-neutral-900">
                                {notification.title}
                              </p>
                              <p className="text-xs text-neutral-500">
                                {notification.time}
                              </p>
                            </a>
                          ))
                        ) : (
                          <div className="px-4 py-8 text-center text-sm text-neutral-500">
                            No new notifications
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </motion.div>

                {/* Profile dropdown */}
                <motion.div whileHover={{ scale: 1.02 }} className="relative">
                  <button
                    className="flex items-center rounded-full bg-neutral-50 p-1 md:pr-3 text-sm hover:bg-neutral-100 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-colors"
                    onClick={toggleProfileMenu}
                    aria-label="User menu"
                  >
                    <Avatar
                      src={user.profilePicture}
                      alt={user.name}
                      fallback={user.name ? user.name.charAt(0) : "U"}
                      size={isMobile ? "xs" : "sm"}
                    />
                    <span className="ml-2 hidden text-sm font-medium text-neutral-700 md:block">
                      {user.name}
                    </span>
                    <HiChevronDown className="ml-1 h-4 w-4 text-neutral-500 hidden md:block" />
                  </button>

                  {/* Profile dropdown panel */}
                  {profileMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute right-0 mt-2 w-48 origin-top-right rounded-lg bg-white py-2 shadow-xl ring-1 ring-black ring-opacity-5 focus:outline-none"
                    >
                      <div className="border-b border-neutral-100 px-4 py-2">
                        <p className="text-sm font-medium text-neutral-900">
                          {user.name}
                        </p>
                        <p className="text-xs text-neutral-500">{user.email}</p>
                      </div>
                      <Link
                        to="/profile"
                        className="block px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50 transition-colors"
                      >
                        Your Profile
                      </Link>
                      <button
                        className="block w-full px-4 py-2 text-left text-sm text-neutral-700 hover:bg-neutral-50 transition-colors"
                        onClick={onSignOut}
                        disabled={isLoggingOut}
                      >
                        <div className="flex items-center">
                          <HiOutlineLogout className="mr-2 h-4 w-4" />
                          {isLoggingOut ? "Signing out..." : "Sign out"}
                        </div>
                      </button>
                    </motion.div>
                  )}
                </motion.div>
              </>
            ) : (
              <div className="flex items-center space-x-2 md:space-x-3">
                <Link to="/signup">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button
                      size={isMobile ? "sm" : "md"}
                      className="text-xs md:text-sm font-medium"
                    >
                      Get Started
                    </Button>
                  </motion.div>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.header>
  );
};

export default Header;
