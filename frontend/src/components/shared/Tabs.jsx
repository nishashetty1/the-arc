// src/components/ui/Tabs.jsx
import React, { useState } from "react";
import clsx from "clsx";

const TabsContext = React.createContext({
  activeTab: null,
  setActiveTab: () => {},
});

export const Tabs = ({
  children,
  defaultValue,
  value,
  className,
  onChange,
  onValueChange,
  ...props
}) => {
  const [internalActiveTab, setInternalActiveTab] = useState(defaultValue);

  // Use controlled value if provided, otherwise use internal state
  const activeTab = value !== undefined ? value : internalActiveTab;

  const handleTabChange = (newValue) => {
    if (value === undefined) {
      // Uncontrolled mode
      setInternalActiveTab(newValue);
    }
    
    // Call both onChange and onValueChange for compatibility
    if (onChange) {
      onChange(newValue);
    }
    if (onValueChange) {
      onValueChange(newValue);
    }
  };

  return (
    <TabsContext.Provider value={{ activeTab, setActiveTab: handleTabChange }}>
      <div className={clsx("w-full", className)} {...props}>
        {children}
      </div>
    </TabsContext.Provider>
  );
};

export const TabsList = ({ children, className, ...props }) => {
  return (
    <div
      className={clsx(
        "flex space-x-1 rounded-lg bg-neutral-100 p-1",
        className
      )}
      role="tablist"
      {...props}
    >
      {children}
    </div>
  );
};

export const TabsTrigger = ({ children, value, className, ...props }) => {
  const { activeTab, setActiveTab } = React.useContext(TabsContext);
  const isActive = activeTab === value;

  return (
    <button
      className={clsx(
        "inline-flex items-center justify-center rounded-md px-3 py-1.5 text-sm font-medium",
        "transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2",
        "disabled:pointer-events-none disabled:opacity-50",
        isActive
          ? "bg-white text-primary-700 shadow"
          : "text-neutral-700 hover:text-neutral-900",
        className
      )}
      role="tab"
      aria-selected={isActive}
      data-state={isActive ? "active" : "inactive"}
      onClick={() => setActiveTab(value)}
      {...props}
    >
      {children}
    </button>
  );
};

export const TabsContent = ({ children, value, className, ...props }) => {
  const { activeTab } = React.useContext(TabsContext);
  const isActive = activeTab === value;

  if (!isActive) return null;

  return (
    <div
      className={clsx("mt-2", className)}
      role="tabpanel"
      data-state={isActive ? "active" : "inactive"}
      {...props}
    >
      {children}
    </div>
  );
};
