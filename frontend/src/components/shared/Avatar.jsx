import React, { memo, useState } from "react";
import PropTypes from "prop-types";
import clsx from "clsx";
import { FiUser } from "react-icons/fi";

const sizeClasses = {
  xs: "h-6 w-6 text-xs",
  sm: "h-8 w-8 text-sm",
  md: "h-10 w-10 text-base",
  lg: "h-12 w-12 text-lg",
  xl: "h-16 w-16 text-xl",
  "2xl": "h-20 w-20 text-2xl",
};

const getInitials = (name) => {
  if (!name) return "";
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .toUpperCase()
    .substring(0, 2);
};

const AvatarFallback = memo(({ name, size }) => (
  <div
    className={clsx(
      "flex items-center justify-center bg-gray-200 text-gray-600 rounded-full",
      sizeClasses[size]
    )}
    aria-label={name || "User avatar"}
  >
    {name ? getInitials(name) : <FiUser />}
  </div>
));

AvatarFallback.displayName = "AvatarFallback";
AvatarFallback.propTypes = {
  name: PropTypes.string,
  size: PropTypes.oneOf(Object.keys(sizeClasses)).isRequired,
};

const Avatar = ({
  src,
  name,
  size = "md",
  className,
  status,
  statusPosition = "bottom-right",
  onClick,
}) => {
  const [imageError, setImageError] = useState(false);

  const statusPositionClasses = {
    "top-right": "-top-1 -right-1",
    "top-left": "-top-1 -left-1",
    "bottom-right": "-bottom-1 -right-1",
    "bottom-left": "-bottom-1 -left-1",
  };

  const statusColorClasses = {
    online: "bg-green-500",
    busy: "bg-red-500",
    away: "bg-amber-500",
    offline: "bg-gray-400",
  };

  return (
    <div
      className={clsx(
        "relative inline-block",
        onClick && "cursor-pointer",
        className
      )}
      onClick={onClick}
    >
      {src && !imageError ? (
        <img
          src={src}
          alt={name || "User avatar"}
          className={clsx(
            "rounded-full object-cover",
            sizeClasses[size]
          )}
          onError={() => setImageError(true)}
        />
      ) : (
        <AvatarFallback name={name} size={size} />
      )}
      
      {status && (
        <span
          className={clsx(
            "absolute block rounded-full border-2 border-white",
            statusPositionClasses[statusPosition],
            statusColorClasses[status],
            size === "xs" || size === "sm" ? "h-2.5 w-2.5" : "h-3.5 w-3.5"
          )}
          aria-label={`Status: ${status}`}
        />
      )}
    </div>
  );
};

Avatar.propTypes = {
  src: PropTypes.string,
  name: PropTypes.string,
  size: PropTypes.oneOf(Object.keys(sizeClasses)),
  className: PropTypes.string,
  status: PropTypes.oneOf(["online", "busy", "away", "offline"]),
  statusPosition: PropTypes.oneOf([
    "top-right",
    "top-left",
    "bottom-right",
    "bottom-left",
  ]),
  onClick: PropTypes.func,
};

export default memo(Avatar);