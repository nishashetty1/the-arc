import React, { memo } from "react";
import PropTypes from "prop-types";
import clsx from "clsx";

const ProgressBar = memo(({
  value = 0,
  max = 100,
  height = "md",
  color = "primary",
  showLabel = false,
  labelPosition = "right",
  className,
  animated = true,
  striped = false,
  rounded = true
}) => {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));
  
  const heightClasses = {
    xs: "h-1",
    sm: "h-2",
    md: "h-3",
    lg: "h-4",
    xl: "h-6"
  };

  const colorClasses = {
    primary: "bg-primary-600",
    secondary: "bg-secondary-600",
    success: "bg-green-600",
    info: "bg-blue-600",
    warning: "bg-amber-500",
    danger: "bg-red-600",
    dark: "bg-neutral-800",
    light: "bg-neutral-300"
  };

  const roundedClasses = {
    true: "rounded-full",
    false: "rounded-none"
  };

  const Label = memo(({ className }) => (
    <div className={clsx("text-xs font-medium text-neutral-700", className)}>
      {percentage.toFixed(0)}%
    </div>
  ));

  Label.displayName = "ProgressBarLabel";
  Label.propTypes = {
    className: PropTypes.string
  };

  return (
    <div className={clsx("w-full", className)}>
      {showLabel && labelPosition === "top" && (
        <div className="flex justify-between mb-1">
          <Label />
        </div>
      )}
      
      <div className={clsx(
        "w-full bg-neutral-200 overflow-hidden",
        heightClasses[height],
        rounded && "rounded-full"
      )}>
        <div
          className={clsx(
            colorClasses[color],
            rounded && "rounded-full",
            striped && "bg-stripes",
            animated && "animate-progress",
            "transition-all duration-300 ease-in-out"
          )}
          style={{ width: `${percentage}%` }}
          role="progressbar"
          aria-valuenow={value}
          aria-valuemin="0"
          aria-valuemax={max}
        />
      </div>
      
      {showLabel && labelPosition === "right" && (
        <div className="ml-2 mt-1">
          <Label />
        </div>
      )}
    </div>
  );
});

ProgressBar.displayName = "ProgressBar";
ProgressBar.propTypes = {
  value: PropTypes.number,
  max: PropTypes.number,
  height: PropTypes.oneOf(["xs", "sm", "md", "lg", "xl"]),
  color: PropTypes.oneOf([
    "primary", 
    "secondary", 
    "success", 
    "info", 
    "warning", 
    "danger", 
    "dark", 
    "light"
  ]),
  showLabel: PropTypes.bool,
  labelPosition: PropTypes.oneOf(["top", "right"]),
  className: PropTypes.string,
  animated: PropTypes.bool,
  striped: PropTypes.bool,
  rounded: PropTypes.bool
};

export default ProgressBar;