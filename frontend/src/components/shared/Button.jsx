import React, { memo } from "react";
import { motion } from "framer-motion";
import { cva } from "class-variance-authority";
import clsx from "clsx";
import PropTypes from "prop-types";
import { FiLoader } from "react-icons/fi";

// Extract button style variants
const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-lg text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none relative overflow-hidden cursor-pointer",
  {
    variants: {
      variant: {
        primary:
          "bg-primary-600 text-white hover:bg-primary-700 shadow-lg hover:shadow-xl",
        secondary:
          "bg-secondary-600 text-white hover:bg-secondary-700 shadow-lg hover:shadow-xl",
        outline:
          "border-2 border-primary-200 hover:border-primary-300 hover:bg-primary-50 text-primary-700 bg-white",
        ghost: "hover:bg-primary-50 text-primary-700 hover:text-primary-800",
        link: "text-primary-600 hover:text-primary-700 underline-offset-4 hover:underline",
        danger:
          "bg-red-600 text-white hover:bg-red-700 shadow-lg hover:shadow-xl",
        success:
          "bg-green-600 text-white hover:bg-green-700 shadow-lg hover:shadow-xl",
      },
      size: {
        xs: "min-h-8 px-2 py-1 text-xs",
        sm: "min-h-9 px-4 py-2 text-sm",
        md: "min-h-11 px-6 py-2.5",
        lg: "min-h-14 px-8 py-3.5 text-base",
        icon: "min-h-10 w-10",
      },
      fullWidth: {
        true: "w-full",
        false: "",
      },
      rounded: {
        true: "rounded-full",
        false: "",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
      fullWidth: false,
      rounded: false,
    },
  }
);

// Spinner component
const Spinner = memo(() => (
  <motion.div
    animate={{ rotate: 360 }}
    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
    className="mr-2 h-4 w-4 text-current"
  >
    <FiLoader size="1em" />
  </motion.div>
));

Spinner.displayName = "Spinner";

// Icon wrapper component for consistent animation
const IconWrapper = memo(({ position, children }) => (
  <motion.span
    initial={{ x: position === "left" ? -5 : 5, opacity: 0 }}
    animate={{ x: 0, opacity: 1 }}
    className={position === "left" ? "mr-2" : "ml-2"}
  >
    {children}
  </motion.span>
));

IconWrapper.displayName = "IconWrapper";
IconWrapper.propTypes = {
  position: PropTypes.oneOf(["left", "right"]).isRequired,
  children: PropTypes.node.isRequired,
};

const ButtonContent = memo(({ isLoading, leftIcon, children, rightIcon }) => (
  <>
    {isLoading && <Spinner />}
    {!isLoading && leftIcon && (
      <IconWrapper position="left">{leftIcon}</IconWrapper>
    )}
    {children}
    {!isLoading && rightIcon && (
      <IconWrapper position="right">{rightIcon}</IconWrapper>
    )}
  </>
));

ButtonContent.displayName = "ButtonContent";
ButtonContent.propTypes = {
  isLoading: PropTypes.bool,
  leftIcon: PropTypes.node,
  children: PropTypes.node,
  rightIcon: PropTypes.node,
};

const Button = ({
  children,
  className,
  variant,
  size,
  fullWidth,
  rounded,
  isLoading,
  leftIcon,
  rightIcon,
  asMotion = false,
  ...props
}) => {
  const buttonClassName = clsx(
    buttonVariants({ variant, size, fullWidth, rounded }),
    isLoading && "opacity-80 cursor-not-allowed",
    className
  );

  const content = (
    <ButtonContent
      isLoading={isLoading}
      leftIcon={leftIcon}
      rightIcon={rightIcon}
    >
      {children}
    </ButtonContent>
  );

  if (asMotion) {
    return (
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        transition={{ type: "spring", stiffness: 400, damping: 17 }}
        className={buttonClassName}
        disabled={isLoading || props.disabled}
        {...props}
      >
        {content}
      </motion.button>
    );
  }

  return (
    <button
      className={buttonClassName}
      disabled={isLoading || props.disabled}
      {...props}
    >
      {content}
    </button>
  );
};

Button.propTypes = {
  children: PropTypes.node,
  className: PropTypes.string,
  variant: PropTypes.oneOf([
    "primary",
    "secondary",
    "outline",
    "ghost",
    "link",
    "danger",
    "success",
  ]),
  size: PropTypes.oneOf(["sm", "md", "lg", "icon"]),
  fullWidth: PropTypes.bool,
  rounded: PropTypes.bool,
  isLoading: PropTypes.bool,
  leftIcon: PropTypes.node,
  rightIcon: PropTypes.node,
  asMotion: PropTypes.bool,
};

export default memo(Button);
