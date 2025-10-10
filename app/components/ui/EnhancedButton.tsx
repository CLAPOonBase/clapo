"use client";
import { ButtonHTMLAttributes, forwardRef, memo } from "react";
import { motion } from "framer-motion";
import { colors, components, borderRadius, animations } from "../../lib/design-tokens";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
  fullWidth?: boolean;
  children: React.ReactNode;
}

const EnhancedButton = memo(forwardRef<HTMLButtonElement, ButtonProps>(
  ({
    variant = "primary",
    size = "md",
    isLoading = false,
    fullWidth = false,
    className = "",
    disabled,
    children,
    ...props
  }, ref) => {
    const baseClasses = `
      inline-flex items-center justify-center font-medium
      transition-all duration-200 ease-in-out
      focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-black
      disabled:opacity-50 disabled:cursor-not-allowed
      ${fullWidth ? "w-full" : ""}
    `.trim();

    const variantClasses = {
      primary: `
        bg-gradient-to-r from-purple-600 to-blue-600
        hover:from-purple-700 hover:to-blue-700
        text-white border-transparent
        focus:ring-purple-500
        shadow-lg hover:shadow-xl
      `,
      secondary: `
        bg-gray-800 hover:bg-gray-700
        text-white border border-gray-700 hover:border-gray-600
        focus:ring-gray-500
      `,
      outline: `
        bg-transparent hover:bg-gray-800
        text-gray-300 hover:text-white
        border border-gray-600 hover:border-gray-500
        focus:ring-gray-500
      `,
      ghost: `
        bg-transparent hover:bg-gray-800/50
        text-gray-300 hover:text-white
        border-transparent
        focus:ring-gray-500
      `,
      danger: `
        bg-red-600 hover:bg-red-700
        text-white border-transparent
        focus:ring-red-500
        shadow-lg hover:shadow-xl
      `
    };

    const sizeClasses = {
      sm: `text-sm px-3 py-1.5 rounded-md`,
      md: `text-base px-4 py-2 rounded-lg`,
      lg: `text-lg px-6 py-3 rounded-xl`,
    };

    const combinedClasses = `
      ${baseClasses}
      ${variantClasses[variant]}
      ${sizeClasses[size]}
      ${className}
    `.replace(/\s+/g, ' ').trim();

    return (
      <motion.button
        ref={ref}
        className={combinedClasses}
        disabled={disabled || isLoading}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        transition={{ duration: 0.1 }}
        {...(props as any)}
      >
        {isLoading && (
          <motion.div
            className="w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"
            animate={{ rotate: 360 }}
            transition={{
              duration: 1,
              repeat: Infinity,
              ease: "linear"
            }}
          />
        )}
        {children}
      </motion.button>
    );
  }
));

EnhancedButton.displayName = "EnhancedButton";

export { EnhancedButton };
export type { ButtonProps };