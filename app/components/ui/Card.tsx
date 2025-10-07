"use client";
import { HTMLAttributes, forwardRef, memo } from "react";
import { motion } from "framer-motion";
import { colors, components, shadows } from "../../lib/design-tokens";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "elevated" | "outline" | "ghost";
  padding?: "none" | "sm" | "md" | "lg";
  hover?: boolean;
  children: React.ReactNode;
}

const Card = memo(forwardRef<HTMLDivElement, CardProps>(
  ({
    variant = "default",
    padding = "md",
    hover = false,
    className = "",
    children,
    ...props
  }, ref) => {
    const baseClasses = `
      rounded-xl border transition-all duration-200
    `.trim();

    const variantClasses = {
      default: `
        bg-gray-900/50 border-gray-800
        backdrop-blur-sm
      `,
      elevated: `
        bg-gray-900 border-gray-700
        shadow-lg
      `,
      outline: `
        bg-transparent border-gray-700
        hover:bg-gray-900/30
      `,
      ghost: `
        bg-transparent border-transparent
        hover:bg-gray-900/20
      `
    };

    const paddingClasses = {
      none: "",
      sm: "p-3",
      md: "p-4",
      lg: "p-6",
    };

    const hoverClasses = hover ? `
      hover:border-gray-600 hover:shadow-lg
      hover:bg-gray-800/60 cursor-pointer
    ` : "";

    const combinedClasses = `
      ${baseClasses}
      ${variantClasses[variant]}
      ${paddingClasses[padding]}
      ${hoverClasses}
      ${className}
    `.replace(/\s+/g, ' ').trim();

    const cardContent = (
      <div
        ref={ref}
        className={combinedClasses}
        {...props}
      >
        {children}
      </div>
    );

    if (hover) {
      return (
        <motion.div
          whileHover={{ y: -2 }}
          transition={{ duration: 0.2 }}
        >
          {cardContent}
        </motion.div>
      );
    }

    return cardContent;
  }
));

Card.displayName = "Card";

// Card Header Component
interface CardHeaderProps extends HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

const CardHeader = memo(forwardRef<HTMLDivElement, CardHeaderProps>(
  ({ className = "", children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={`flex flex-col space-y-1.5 pb-4 ${className}`}
        {...props}
      >
        {children}
      </div>
    );
  }
));

CardHeader.displayName = "CardHeader";

// Card Title Component
interface CardTitleProps extends HTMLAttributes<HTMLHeadingElement> {
  children: React.ReactNode;
  as?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
}

const CardTitle = memo(forwardRef<HTMLHeadingElement, CardTitleProps>(
  ({ className = "", children, as = "h3", ...props }, ref) => {
    const Component = as;
    return (
      <Component
        ref={ref}
        className={`text-lg font-semibold leading-none tracking-tight text-white ${className}`}
        {...props}
      >
        {children}
      </Component>
    );
  }
));

CardTitle.displayName = "CardTitle";

// Card Description Component
interface CardDescriptionProps extends HTMLAttributes<HTMLParagraphElement> {
  children: React.ReactNode;
}

const CardDescription = memo(forwardRef<HTMLParagraphElement, CardDescriptionProps>(
  ({ className = "", children, ...props }, ref) => {
    return (
      <p
        ref={ref}
        className={`text-sm text-gray-400 ${className}`}
        {...props}
      >
        {children}
      </p>
    );
  }
));

CardDescription.displayName = "CardDescription";

// Card Content Component
interface CardContentProps extends HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

const CardContent = memo(forwardRef<HTMLDivElement, CardContentProps>(
  ({ className = "", children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={`${className}`}
        {...props}
      >
        {children}
      </div>
    );
  }
));

CardContent.displayName = "CardContent";

// Card Footer Component
interface CardFooterProps extends HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

const CardFooter = memo(forwardRef<HTMLDivElement, CardFooterProps>(
  ({ className = "", children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={`flex items-center pt-4 ${className}`}
        {...props}
      >
        {children}
      </div>
    );
  }
));

CardFooter.displayName = "CardFooter";

export {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter
};

export type {
  CardProps,
  CardHeaderProps,
  CardTitleProps,
  CardDescriptionProps,
  CardContentProps,
  CardFooterProps
};