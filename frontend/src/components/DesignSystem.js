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
    <div className="max-w-7xl mx-auto p-4 sm:p-6 pb-6 sm:pb-8 space-y-4 sm:space-y-6">
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
        <div className="p-2 sm:p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shrink-0">
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
      "bg-gradient-to-r from-blue-500 to-indigo-600 text-white hover:opacity-90 shadow-lg hover:shadow-xl",
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

// --- ANALYTICS SPECIFIC COMPONENTS ---

// StatCard - Standardized stat card for analytics
export const StatCard = ({
  icon: Icon,
  title,
  value,
  subtitle,
  trend,
  color = "blue",
  isLoading,
  badge,
  className,
}) => {
  const colorMap = {
    blue: {
      gradient: "from-blue-500 to-indigo-600",
      text: "from-blue-600 to-indigo-700",
      border: "border-blue-100",
    },
    green: {
      gradient: "from-green-500 to-emerald-600",
      text: "from-green-600 to-emerald-700",
      border: "border-green-100",
    },
    yellow: {
      gradient: "from-yellow-500 to-orange-600",
      text: "from-yellow-600 to-orange-700",
      border: "border-yellow-100",
    },
    red: {
      gradient: "from-red-500 to-rose-600",
      text: "from-red-600 to-rose-700",
      border: "border-red-100",
    },
    purple: {
      gradient: "from-purple-500 to-indigo-600",
      text: "from-purple-600 to-indigo-700",
      border: "border-purple-100",
    },
  };

  const colors = colorMap[color] || colorMap.blue;

  return (
    <Card
      className={cn(
        "relative group hover:-translate-y-1 transition-all duration-300",
        colors.border,
        className
      )}
    >
      {badge && (
        <div className="absolute top-2 right-2 bg-yellow-400 text-yellow-800 px-2 py-1 rounded-full text-xs font-bold">
          {badge}
        </div>
      )}
      <div className="flex items-center gap-3">
        <div
          className={cn(
            "w-12 h-12 sm:w-14 sm:h-14 rounded-xl flex items-center justify-center shadow-md group-hover:scale-110 transition-transform bg-gradient-to-br",
            colors.gradient
          )}
        >
          <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <Caption className="font-semibold">{title}</Caption>
          {isLoading ? (
            <div className="h-8 w-20 bg-gray-200 rounded animate-pulse mt-1" />
          ) : (
            <>
              <h2
                className={cn(
                  "text-2xl sm:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r truncate",
                  colors.text
                )}
              >
                {value}
              </h2>
              {subtitle && (
                <div className="flex items-center gap-2 mt-1">
                  <Caption>{subtitle}</Caption>
                  {trend !== undefined && (
                    <span
                      className={cn(
                        "text-xs font-semibold",
                        trend >= 0 ? "text-green-600" : "text-red-600"
                      )}
                    >
                      {trend >= 0 ? "↑" : "↓"} {Math.abs(trend).toFixed(1)}%
                    </span>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </Card>
  );
};

// ChartCard - Wrapper for chart components
export const ChartCard = ({ icon: Icon, title, subtitle, children, isLoading, className }) => (
  <Card className={className}>
    <div className="flex items-center justify-between mb-4 sm:mb-6">
      <div className="flex items-center gap-2 sm:gap-3">
        {Icon && (
          <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg">
            <Icon className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
          </div>
        )}
        <div>
          <H3>{title}</H3>
          {subtitle && <Caption className="mt-1">{subtitle}</Caption>}
        </div>
      </div>
    </div>
    {isLoading ? <LoadingState /> : children}
  </Card>
);

// AlertCard - For insights and notifications
export const AlertCard = ({
  icon: Icon,
  title,
  description,
  children,
  variant = "info",
  className,
}) => {
  const variantStyles = {
    info: "from-blue-50 to-indigo-50 border-blue-200 text-blue-900",
    success: "from-green-50 to-emerald-50 border-green-200 text-green-900",
    warning: "from-yellow-50 to-orange-50 border-yellow-200 text-yellow-900",
    danger: "from-red-50 to-rose-50 border-red-200 text-red-900",
  };

  const iconColors = {
    info: "from-blue-500 to-indigo-600",
    success: "from-green-500 to-emerald-600",
    warning: "from-yellow-500 to-orange-600",
    danger: "from-red-500 to-rose-600",
  };

  return (
    <div
      className={cn(
        "bg-gradient-to-br rounded-2xl p-6 shadow-lg border-2",
        variantStyles[variant],
        className
      )}
    >
      <div className="flex items-start gap-4">
        {Icon && (
          <div
            className={cn(
              "w-12 h-12 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0 bg-gradient-to-br",
              iconColors[variant]
            )}
          >
            <Icon className="w-6 h-6 text-white" />
          </div>
        )}
        <div className="flex-1">
          <H3 className={variantStyles[variant]}>{title}</H3>
          {description && <BodyText className="mt-2 opacity-80">{description}</BodyText>}
          {children && <div className="mt-4">{children}</div>}
        </div>
      </div>
    </div>
  );
};
