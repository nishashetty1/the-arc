// src/components/layout/Sidebar.jsx
import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  HiHome,
  HiUserGroup,
  HiLightningBolt,
  HiInboxIn,
  HiVideoCamera,
  HiChartBar,
  HiCog,
  HiChevronDown,
  HiChevronUp,
} from "react-icons/hi";
import { Badge } from "../index";

const sidebarItems = [
  {
    label: "Dashboard",
    icon: <HiHome className="h-5 w-5" />,
    path: "/dashboard",
  },
  {
    label: "Matching",
    icon: <HiLightningBolt className="h-5 w-5" />,
    path: "/matching",
  },
  {
    label: "Connections",
    icon: <HiUserGroup className="h-5 w-5" />,
    path: "/connections",
    badge: 3, // Number of new connections
  },
  {
    label: "Messages",
    icon: <HiInboxIn className="h-5 w-5" />,
    path: "/messages",
    badge: 5, // Number of unread messages
  },
  {
    label: "Pitch Videos",
    icon: <HiVideoCamera className="h-5 w-5" />,
    path: "/pitches",
  },
  {
    label: "Insights",
    icon: <HiChartBar className="h-5 w-5" />,
    path: "/insights",
  },
  {
    label: "Settings",
    icon: <HiCog className="h-5 w-5" />,
    path: "/settings",
    submenu: [
      {
        label: "Profile",
        path: "/settings/profile",
      },
      {
        label: "Account",
        path: "/settings/account",
      },
      {
        label: "Notifications",
        path: "/settings/notifications",
      },
    ],
  },
];

const Sidebar = ({ isOpen, userType = "startup" }) => {
  const location = useLocation();
  const [expandedItems, setExpandedItems] = useState({});

  const toggleSubmenu = (label) => {
    setExpandedItems((prev) => ({
      ...prev,
      [label]: !prev[label],
    }));
  };

  // Filter menu items based on user type
  const filteredItems = sidebarItems.filter((item) => {
    if (userType === "investor" && item.label === "Pitch Videos") {
      return false; // Investors don't need to upload pitch videos
    }
    if (userType !== "investor" && item.label === "Insights") {
      return false; // Only investors see insights
    }
    return true;
  });

  const SidebarLink = ({ item, isNested = false }) => {
    const isActive =
      location.pathname === item.path ||
      (item.submenu &&
        item.submenu.some((subitem) => location.pathname === subitem.path));

    const hasSubmenu = item.submenu && item.submenu.length > 0;
    const isExpanded = expandedItems[item.label];

    return (
      <>
        {hasSubmenu ? (
          <button
            className={`flex w-full items-center justify-between px-4 py-2 text-sm font-medium ${
              isActive
                ? "bg-primary-50 text-primary-600"
                : "text-neutral-700 hover:bg-neutral-50 hover:text-neutral-900"
            } ${isNested ? "pl-10" : ""}`}
            onClick={() => toggleSubmenu(item.label)}
          >
            <div className="flex items-center">
              {!isNested && item.icon}
              <span className={`${!isNested ? "ml-3" : ""}`}>{item.label}</span>
            </div>
            {hasSubmenu && (
              <div>
                {isExpanded ? (
                  <HiChevronUp className="h-4 w-4" />
                ) : (
                  <HiChevronDown className="h-4 w-4" />
                )}
              </div>
            )}
          </button>
        ) : (
          <Link
            to={item.path}
            className={`flex items-center justify-between px-4 py-2 text-sm font-medium ${
              isActive
                ? "bg-primary-50 text-primary-600"
                : "text-neutral-700 hover:bg-neutral-50 hover:text-neutral-900"
            } ${isNested ? "pl-10" : ""}`}
          >
            <div className="flex items-center">
              {!isNested && item.icon}
              <span className={`${!isNested ? "ml-3" : ""}`}>{item.label}</span>
            </div>
            {item.badge && (
              <Badge variant="primary" rounded>
                {item.badge}
              </Badge>
            )}
          </Link>
        )}

        {/* Render submenu if expanded */}
        {hasSubmenu && isExpanded && (
          <div className="mt-1 space-y-1">
            {item.submenu.map((subitem) => (
              <SidebarLink key={subitem.label} item={subitem} isNested={true} />
            ))}
          </div>
        )}
      </>
    );
  };

  return (
    <div
      className={`fixed inset-y-0 left-0 z-20 w-64 transform overflow-y-auto bg-white/90 backdrop-blur-md pb-12 transition duration-200 ease-in-out ${
        isOpen ? "translate-x-0" : "-translate-x-full"
      } lg:translate-x-0 lg:shadow-xl border-r border-white/20`}
    >
      <div className="flex h-16 flex-shrink-0 items-center px-4">
        <Link to="/" className="text-xl font-bold text-primary-600">
          The Arc
        </Link>
      </div>

      <div className="mt-5 flex flex-1 flex-col">
        <nav className="flex-1 space-y-1 px-2">
          {filteredItems.map((item) => (
            <div key={item.label} className="py-1">
              <SidebarLink item={item} />
            </div>
          ))}
        </nav>
      </div>

      <div className="absolute bottom-0 left-0 right-0 border-t border-neutral-200 bg-neutral-50 p-4">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-primary-100 text-sm font-medium text-primary-800">
              {userType === "startup"
                ? "S"
                : userType === "investor"
                ? "I"
                : "P"}
            </span>
          </div>
          <div className="ml-3">
            <p className="text-xs font-medium text-neutral-500">Logged in as</p>
            <p className="text-sm font-medium text-neutral-900 capitalize">
              {userType}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
