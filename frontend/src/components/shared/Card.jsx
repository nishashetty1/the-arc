import React, { memo } from "react";
import PropTypes from "prop-types";
import clsx from "clsx";

const Card = memo(({
  children,
  className,
  shadow = "soft",
  padding = "default",
  border = false,
  hoverEffect = false,
  ...props
}) => {
  const shadowVariants = {
    none: "",
    soft: "shadow-soft",
    medium: "shadow-medium",
    hard: "shadow-hard",
  };

  const paddingVariants = {
    none: "p-0",
    sm: "p-3 sm:p-3",
    default: "p-4 sm:p-5",
    lg: "p-5 sm:p-7",
  };

  return (
    <div
      className={clsx(
        "rounded-lg bg-white w-full",
        shadowVariants[shadow],
        paddingVariants[padding],
        border && "border border-neutral-200",
        hoverEffect && "transition-all duration-200 hover:shadow-medium",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
});

Card.displayName = "Card";
Card.propTypes = {
  children: PropTypes.node,
  className: PropTypes.string,
  shadow: PropTypes.oneOf(["none", "soft", "medium", "hard"]),
  padding: PropTypes.oneOf(["none", "sm", "default", "lg"]),
  border: PropTypes.bool,
  hoverEffect: PropTypes.bool
};

export const CardHeader = memo(({ children, className, ...props }) => {
  return (
    <div
      className={clsx("mb-3 sm:mb-4 flex flex-col space-y-1", className)}
      {...props}
    >
      {children}
    </div>
  );
});

CardHeader.displayName = "CardHeader";
CardHeader.propTypes = {
  children: PropTypes.node,
  className: PropTypes.string
};

export const CardTitle = memo(({ children, className, ...props }) => {
  return (
    <h3
      className={clsx(
        "text-base sm:text-lg font-semibold text-neutral-900",
        className
      )}
      {...props}
    >
      {children}
    </h3>
  );
});

CardTitle.displayName = "CardTitle";
CardTitle.propTypes = {
  children: PropTypes.node,
  className: PropTypes.string
};

export const CardDescription = memo(({ children, className, ...props }) => {
  return (
    <p
      className={clsx("text-xs sm:text-sm text-neutral-500", className)}
      {...props}
    >
      {children}
    </p>
  );
});

CardDescription.displayName = "CardDescription";
CardDescription.propTypes = {
  children: PropTypes.node,
  className: PropTypes.string
};

export const CardContent = memo(({ children, className, ...props }) => {
  return (
    <div
      className={clsx("text-neutral-700 text-sm sm:text-base", className)}
      {...props}
    >
      {children}
    </div>
  );
});

CardContent.displayName = "CardContent";
CardContent.propTypes = {
  children: PropTypes.node,
  className: PropTypes.string
};

export const CardFooter = memo(({ children, className, ...props }) => {
  return (
    <div
      className={clsx(
        "mt-3 sm:mt-4 flex flex-wrap items-center gap-2",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
});

CardFooter.displayName = "CardFooter";
CardFooter.propTypes = {
  children: PropTypes.node,
  className: PropTypes.string
};

export default Card;