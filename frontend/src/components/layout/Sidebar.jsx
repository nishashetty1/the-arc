// src/components/layout/Sidebar.jsx
import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  HiHome,
  HiUserGroup,
  HiInboxIn,
  HiVideoCamera,
  HiUser,
  HiFire,
  HiGlobe,
  HiLogout,
  HiSparkles,
} from "react-icons/hi";
import { Badge } from "../index";
import useAuthStore from "../../stores/authStore";
import { getUserConnections, getPendingConnectionRequests } from "../../services/connections";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../../utils/firebase/config";
import { logoutUser } from "../../services/auth";

const Sidebar = ({ isOpen, userType = "startup" }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const clearUser = useAuthStore((state) => state.clearUser);
  const cleanup = useAuthStore((state) => state.cleanup);
  const [connectionCount, setConnectionCount] = useState(0);
  const [pendingRequestsCount, setPendingRequestsCount] = useState(0);
  const [unreadMessagesCount, setUnreadMessagesCount] = useState(0);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logoutUser();
      clearUser();
      cleanup();
      navigate("/");
    } catch (error) {
      console.error("Failed to sign out:", error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  // Fetch connection and message counts
  useEffect(() => {
    if (!user?.uid) return;

    const fetchCounts = async () => {
      try {
        // Get connections count
        const connections = await getUserConnections(user.uid);
        console.log('Sidebar: Connections count:', connections.length);
        setConnectionCount(connections.length);

        // Get pending requests count
        const requests = await getPendingConnectionRequests(user.uid);
        console.log('Sidebar: Pending requests count:', requests.length);
        setPendingRequestsCount(requests.length);

        // Get unread messages count
        const conversationsRef = collection(db, 'conversations');
        const q = query(
          conversationsRef,
          where('participants', 'array-contains', user.uid)
        );
        const snapshot = await getDocs(q);
        
        let totalUnread = 0;
        snapshot.docs.forEach(doc => {
          const data = doc.data();
          totalUnread += data.unreadCount?.[user.uid] || 0;
        });
        console.log('Sidebar: Unread messages count:', totalUnread);
        setUnreadMessagesCount(totalUnread);

      } catch (error) {
        console.error('Error fetching sidebar counts:', error);
      }
    };

    fetchCounts();

    // Refresh counts every 30 seconds
    const interval = setInterval(fetchCounts, 30000);

    return () => clearInterval(interval);
  }, [user]);

  const SidebarLink = ({ item }) => {
    const isActive = location.pathname === item.path;

    return (
      <Link
        to={item.path}
        className="group relative"
      >
        <motion.div
          whileHover={{ x: 4 }}
          className={`flex items-center justify-between px-4 py-3 text-sm font-medium rounded-lg transition-all ${
            isActive
              ? "bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-md"
              : "text-neutral-700 hover:bg-neutral-100"
          }`}
        >
          <div className="flex items-center">
            <span className={`${isActive ? "text-white" : "text-neutral-500 group-hover:text-primary-600"}`}>
              {item.icon}
            </span>
            <span className="ml-3">{item.label}</span>
          </div>
          {item.badge > 0 && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className={`px-2 py-0.5 text-xs font-semibold rounded-full ${
                isActive
                  ? "bg-white text-primary-600"
                  : "bg-primary-100 text-primary-700"
              }`}
            >
              {item.badge}
            </motion.span>
          )}
        </motion.div>
      </Link>
    );
  };

  // Sidebar items with dynamic badge counts
  const sidebarItems = [
    {
      label: "Dashboard",
      icon: <HiHome className="h-5 w-5" />,
      path: "/dashboard",
    },
    {
      label: "Discover",
      icon: <HiFire className="h-5 w-5" />,
      path: "/swipe",
    },
    {
      label: "Browse",
      icon: <HiGlobe className="h-5 w-5" />,
      path: "/browse",
    },
    {
      label: "Connections",
      icon: <HiUserGroup className="h-5 w-5" />,
      path: "/connections",
      badge: connectionCount + pendingRequestsCount,
    },
    {
      label: "Messages",
      icon: <HiInboxIn className="h-5 w-5" />,
      path: "/messages",
      badge: unreadMessagesCount,
    },
    {
      label: "Pitch Videos",
      icon: <HiVideoCamera className="h-5 w-5" />,
      path: "/pitch-videos",
    },
    {
      label: "Profile",
      icon: <HiUser className="h-5 w-5" />,
      path: "/profile",
    },
  ];

  // Filter menu items based on user type
  const filteredItems = sidebarItems.filter((item) => {
    // Investors don't upload pitch videos
    if (userType === "investor" && item.label === "Pitch Videos") {
      return false;
    }
    return true;
  });

  return (
    <div
      className={`fixed inset-y-0 left-0 z-20 w-64 transform overflow-y-auto bg-white border-r border-neutral-200 shadow-xl transition-transform duration-200 ease-in-out ${
        isOpen ? "translate-x-0" : "-translate-x-full"
      } lg:translate-x-0`}
    >
      {/* Header */}
      <div className="flex h-16 items-center justify-center px-4 border-b border-neutral-200">
        <Link to="/" className="flex items-center space-x-2">
          <HiSparkles className="h-6 w-6 text-primary-600" />
          <span className="text-xl font-bold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
            The Arc
          </span>
        </Link>
      </div>

      {/* User Info Card */}
      <div className="mx-4 my-4 p-4 bg-gradient-to-br from-primary-50 to-secondary-50 rounded-xl border border-primary-100">
        <div className="flex items-center space-x-3">
          <div className="flex-shrink-0">
            {user?.photoURL ? (
              <img
                src={user.photoURL}
                alt={user.displayName}
                className="h-12 w-12 rounded-full object-cover border-2 border-white shadow-soft"
              />
            ) : (
              <div className="h-12 w-12 rounded-full bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center text-white font-bold text-lg shadow-soft">
                {user?.displayName?.charAt(0)?.toUpperCase() || "U"}
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-neutral-900 truncate">
              {user?.displayName || "User"}
            </p>
            <p className="text-xs text-neutral-600 capitalize">
              {userType === "startup" ? "🚀 Startup" : userType === "investor" ? "💼 Investor" : "👤 Individual"}
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 pb-32">
        <nav className="space-y-1 px-2">
          {filteredItems.map((item) => (
            <div key={item.label}>
              <SidebarLink item={item} />
            </div>
          ))}
        </nav>
      </div>

      {/* Logout Button */}
      <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-neutral-200 bg-neutral-50">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleLogout}
          disabled={isLoggingOut}
          className="w-full flex items-center justify-center px-4 py-3 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors disabled:opacity-50 shadow-soft"
        >
          <HiLogout className="h-5 w-5 mr-2" />
          {isLoggingOut ? "Signing out..." : "Sign Out"}
        </motion.button>
      </div>
    </div>
  );
};

export default Sidebar;
