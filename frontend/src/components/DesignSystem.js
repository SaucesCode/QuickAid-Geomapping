// src/components/DesignSystem.jsx
import React from "react";
import { Loader2 } from "lucide-react";
import { cn } from "../utils/cn";

// --- LAYOUT COMPONENTS ---

// Page Container - Main wrapper for all pages
export const PageContainer = ({ children, className }) => (
  <div
    className={cn(
      "min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50",
      className
    )}
  >
    <div className="w-full mx-auto py-3 sm:py-4 md:py-5 space-y-3 sm:space-y-4">
      {children}
    </div>
  </div>
);

// Card - Base card component
export const Card = ({ children, className }) => (
  <div
    className={cn(
      "bg-white rounded-2xl shadow-lg border border-blue-100 p-4 sm:p-6",
      className
    )}
  >
    {children}
  </div>
);

// Page Header - Consistent header across pages
export const PageHeader = ({ icon: Icon, title, subtitle, action, className }) => (
  <Card
    className={cn(
      "border border-blue-100 shadow-lg flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4",
      className
    )}
  >
    <div className="flex items-center gap-3">
      {Icon && (
        <div className="p-2 sm:p-3 bg-[#003a76] rounded-xl shrink-0">
          <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
        </div>
      )}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">{title}</h1>
        {subtitle && <p className="text-xs sm:text-sm text-gray-500 mt-1">{subtitle}</p>}
      </div>
    </div>
    {action && <div className="w-full sm:w-auto">{action}</div>}
  </Card>
);

// --- BUTTON COMPONENTS ---

// Base Button Styles
const baseButtonStyles =
  "px-4 sm:px-6 py-2 sm:py-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base";

// Primary Gradient Button
export const GradientButton = ({ children, className, loading, disabled, ...props }) => (
  <button
    {...props}
    disabled={disabled || loading}
    className={cn(
      baseButtonStyles,
      "bg-blue-600 text-white hover:bg-[#003a76] shadow-lg hover:shadow-xl",
      className
    )}
  >
    {loading && <Loader2 className="w-4 h-4 animate-spin" />}
    {children}
  </button>
);

// Outline Button
export const OutlineButton = ({ children, className, loading, disabled, ...props }) => (
  <button
    {...props}
    disabled={disabled || loading}
    className={cn(
      baseButtonStyles,
      "border-2 border-blue-500 text-blue-600 hover:bg-blue-50",
      className
    )}
  >
    {loading && <Loader2 className="w-4 h-4 animate-spin" />}
    {children}
  </button>
);

// Ghost Button
export const GhostButton = ({ children, className, loading, disabled, ...props }) => (
  <button
    {...props}
    disabled={disabled || loading}
    className={cn(baseButtonStyles, "text-gray-600 hover:bg-gray-100", className)}
  >
    {loading && <Loader2 className="w-4 h-4 animate-spin" />}
    {children}
  </button>
);

// Danger Button
export const DangerButton = ({ children, className, loading, disabled, ...props }) => (
  <button
    {...props}
    disabled={disabled || loading}
    className={cn(
      baseButtonStyles,
      "bg-gradient-to-r from-red-500 to-rose-600 text-white hover:opacity-90 shadow-lg hover:shadow-xl",
      className
    )}
  >
    {loading && <Loader2 className="w-4 h-4 animate-spin" />}
    {children}
  </button>
);

// --- TYPOGRAPHY COMPONENTS ---

export const H1 = ({ children, className }) => (
  <h1 className={cn("text-2xl sm:text-3xl font-bold text-gray-800", className)}>{children}</h1>
);

export const H2 = ({ children, className }) => (
  <h2 className={cn("text-xl sm:text-2xl font-bold text-gray-800", className)}>{children}</h2>
);

export const H3 = ({ children, className }) => (
  <h3 className={cn("text-lg sm:text-xl font-semibold text-gray-800", className)}>
    {children}
  </h3>
);

export const BodyText = ({ children, className }) => (
  <p className={cn("text-sm sm:text-base text-gray-600", className)}>{children}</p>
);

export const Caption = ({ children, className }) => (
  <p className={cn("text-xs sm:text-sm text-gray-500", className)}>{children}</p>
);

// --- LOADING COMPONENTS ---

// Spinner
export const Spinner = ({ className, size = "default" }) => {
  const sizeClasses = {
    sm: "w-4 h-4",
    default: "w-6 h-6",
    lg: "w-8 h-8",
  };

  return (
    <Loader2 className={cn("animate-spin text-blue-600", sizeClasses[size], className)} />
  );
};

// Loading State
export const LoadingState = ({ message = "Loading..." }) => (
  <div className="flex flex-col items-center justify-center py-12 space-y-4">
    <Spinner size="lg" />
    <Caption>{message}</Caption>
  </div>
);

// --- SPACING UTILITIES ---

// Standard spacing scale based on Tailwind
export const spacing = {
  xs: "space-y-2", // 8px
  sm: "space-y-3", // 12px
  md: "space-y-4", // 16px
  lg: "space-y-6", // 24px
  xl: "space-y-8", // 32px
  "2xl": "space-y-12", // 48px
};

// Stack - Vertical spacing container
export const Stack = ({ children, spacing = "md", className }) => (
  <div
    className={cn(
      spacing === "xs" && "space-y-2",
      spacing === "sm" && "space-y-3",
      spacing === "md" && "space-y-4",
      spacing === "lg" && "space-y-6",
      spacing === "xl" && "space-y-8",
      spacing === "2xl" && "space-y-12",
      className
    )}
  >
    {children}
  </div>
);

// Grid - Responsive grid layout
export const Grid = ({
  children,
  cols = { default: 1, sm: 2, lg: 3 },
  gap = "md",
  className,
}) => {
  const gapClasses = {
    sm: "gap-3",
    md: "gap-4 sm:gap-6",
    lg: "gap-6 sm:gap-8",
  };

  return (
    <div
      className={cn(
        "grid",
        `grid-cols-${cols.default}`,
        cols.sm && `sm:grid-cols-${cols.sm}`,
        cols.lg && `lg:grid-cols-${cols.lg}`,
        gapClasses[gap],
        className
      )}
    >
      {children}
    </div>
  );
};

// --- UTILITY COMPONENT ---

// Section - Content section with optional title
export const Section = ({ title, children, className }) => (
  <div className={cn("space-y-4", className)}>
    {title && <H3>{title}</H3>}
    {children}
  </div>
);
