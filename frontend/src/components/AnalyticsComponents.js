import React from "react";
import { Loader2 } from "lucide-react";
import { cn } from "../utils/cn";

// Re-export layout components from DesignSystem
export { PageContainer, PageHeader, GradientButton } from "./DesignSystem";

// --- ANALYTICS-SPECIFIC BASE COMPONENTS ---

// Analytics Card - Compact version with reduced padding
export const AnalyticsCard = ({ children, className }) => (
  <div
    className={cn(
      "bg-white rounded-xl shadow-md border border-blue-100 p-4 transition-all hover:shadow-lg",
      className
    )}
  >
    {children}
  </div>
);

// --- ANALYTICS STAT CARD (Compact Version) ---
export const AnalyticsStatCard = ({
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
    <AnalyticsCard
      className={cn(
        "relative group hover:-translate-y-0.5 transition-all duration-300",
        colors.border,
        className
      )}
    >
      {badge && (
        <div className="absolute top-2 right-2 bg-yellow-400 text-yellow-800 px-2 py-0.5 rounded-full text-xs font-bold">
          {badge}
        </div>
      )}
      <div className="flex items-center gap-2.5">
        <div
          className={cn(
            "w-10 h-10 rounded-lg flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform bg-gradient-to-br",
            colors.gradient
          )}
        >
          <Icon className="w-5 h-5 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
            {title}
          </p>
          {isLoading ? (
            <div className="h-7 w-16 bg-gray-200 rounded animate-pulse mt-1" />
          ) : (
            <>
              <h2
                className={cn(
                  "text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r truncate",
                  colors.text
                )}
              >
                {value}
              </h2>
              {subtitle && (
                <div className="flex items-center gap-1.5 mt-0.5">
                  <p className="text-xs text-gray-500">{subtitle}</p>
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
    </AnalyticsCard>
  );
};

// --- ANALYTICS CHART CARD (Compact Version) ---
export const AnalyticsChartCard = ({
  icon: Icon,
  title,
  subtitle,
  children,
  isLoading,
  className,
}) => (
  <AnalyticsCard className={className}>
    <div className="flex items-center gap-2 mb-4">
      {Icon && (
        <div className="p-1.5 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg">
          <Icon className="w-4 h-4 text-white" />
        </div>
      )}
      <div className="flex-1 min-w-0">
        <h3 className="text-base font-bold text-gray-800 truncate">{title}</h3>
        {subtitle && <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p>}
      </div>
    </div>
    {isLoading ? (
      <div className="flex flex-col items-center justify-center py-8 space-y-3">
        <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
        <p className="text-xs text-gray-500">Loading chart data...</p>
      </div>
    ) : (
      children
    )}
  </AnalyticsCard>
);

// --- ANALYTICS ALERT CARD (Compact Version) ---
export const AnalyticsAlertCard = ({
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
        "bg-gradient-to-br rounded-xl p-4 shadow-md border-2",
        variantStyles[variant],
        className
      )}
    >
      <div className="flex items-start gap-3">
        {Icon && (
          <div
            className={cn(
              "w-10 h-10 rounded-lg flex items-center justify-center shadow-md flex-shrink-0 bg-gradient-to-br",
              iconColors[variant]
            )}
          >
            <Icon className="w-5 h-5 text-white" />
          </div>
        )}
        <div className="flex-1">
          <h3 className={cn("text-base font-bold", variantStyles[variant])}>{title}</h3>
          {description && <p className="text-sm mt-1.5 opacity-80">{description}</p>}
          {children && <div className="mt-3">{children}</div>}
        </div>
      </div>
    </div>
  );
};

// --- ANALYTICS GRID SYSTEM ---
export const AnalyticsGrid = ({
  children,
  cols = { default: 1, sm: 2, lg: 3 },
  gap = "md",
  className,
}) => {
  const gapClasses = {
    sm: "gap-2",
    md: "gap-4",
    lg: "gap-6",
  };

  // Dynamic grid column classes
  const gridColsClass =
    typeof cols === "number" ? `grid-cols-${cols}` : `grid-cols-${cols.default}`;

  const smColsClass = cols.sm ? `sm:grid-cols-${cols.sm}` : "";
  const mdColsClass = cols.md ? `md:grid-cols-${cols.md}` : "";
  const lgColsClass = cols.lg ? `lg:grid-cols-${cols.lg}` : "";

  return (
    <div
      className={cn(
        "grid",
        gridColsClass,
        smColsClass,
        mdColsClass,
        lgColsClass,
        gapClasses[gap],
        className
      )}
    >
      {children}
    </div>
  );
};

// --- ANALYTICS STACK (Vertical Spacing) ---
export const AnalyticsStack = ({ children, spacing = "md", className }) => (
  <div
    className={cn(
      spacing === "xs" && "space-y-1.5",
      spacing === "sm" && "space-y-2",
      spacing === "md" && "space-y-4",
      spacing === "lg" && "space-y-6",
      spacing === "xl" && "space-y-8",
      className
    )}
  >
    {children}
  </div>
);

// --- HEATMAP COMPONENTS ---

// Heatmap Cell Component with 12-hour time format
export const HeatmapCell = ({ hour, count, intensity, label }) => {
  const getIntensityColor = intensity => {
    if (intensity === 0) return "#F3F4F6"; // very light gray
    if (intensity < 20) return "#EFF6FF"; // ultra-light blue
    if (intensity < 40) return "#BFDBFE"; // light blue
    if (intensity < 60) return "#60A5FA"; // medium-light blue
    if (intensity < 80) return "#2563EB"; // medium blue
    return "#1D4ED8"; // slightly darker blue for peak, still not too dark
  };

  // Convert 24-hour to 12-hour format
  const formatTime = hour => {
    if (hour === 0) return "12:00 AM";
    if (hour === 12) return "12:00 PM";
    if (hour < 12) return `${hour}:00 AM`;
    return `${hour - 12}:00 PM`;
  };

  const displayLabel = label || formatTime(hour);

  return (
    <div
      className="flex flex-col items-center justify-center p-2 rounded-lg border border-gray-200 transition-all hover:shadow-md hover:scale-105 cursor-pointer"
      style={{ backgroundColor: getIntensityColor(intensity) }}
      title={`${displayLabel}: ${count} applications`}
    >
      <span className="text-xs font-medium text-gray-700">{displayLabel}</span>
      <span className="text-sm font-bold text-gray-900 mt-0.5">{count}</span>
    </div>
  );
};

// Heatmap Legend Component
export const HeatmapLegend = ({ className }) => (
  <div
    className={cn(
      "flex items-center justify-center flex-wrap gap-4 mt-4 text-sm text-gray-600",
      className
    )}
  >
    <div className="flex items-center gap-1.5">
      <div className="w-4 h-4 bg-gray-200 rounded border border-gray-300"></div>
      <span>Low (0)</span>
    </div>
    <div className="flex items-center gap-1.5">
      <div className="w-4 h-4 bg-blue-100 rounded"></div>
      <span>Low-Medium</span>
    </div>
    <div className="flex items-center gap-1.5">
      <div className="w-4 h-4 bg-blue-300 rounded"></div>
      <span>Medium</span>
    </div>
    <div className="flex items-center gap-1.5">
      <div className="w-4 h-4 bg-blue-500 rounded"></div>
      <span>High</span>
    </div>
    <div className="flex items-center gap-1.5">
      <div className="w-4 h-4 bg-blue-700 rounded shadow-sm"></div>
      <span>Peak</span>
    </div>
  </div>
);

// --- CHART WRAPPER WITH CONSISTENT HEIGHT ---
export const ChartContainer = ({ children, height = 250, className }) => (
  <div className={cn("w-full", className)} style={{ height: `${height}px` }}>
    {children}
  </div>
);

// --- INSIGHT CARD (For Summary Cards) ---
export const InsightCard = ({
  title,
  icon: Icon,
  description,
  variant = "info",
  children,
  className,
  isLoading,
}) => {
  const variantColors = {
    info: "bg-blue-50 border-blue-200",
    warning: "bg-yellow-50 border-yellow-200",
    danger: "bg-red-50 border-red-200",
  };

  return (
    <AnalyticsCard
      className={cn(
        "hover:border-blue-200 transition-colors p-3",
        variantColors[variant],
        className
      )}
    >
      <div className="flex items-center gap-2 mb-2">
        {Icon && <Icon className="w-4 h-4 text-gray-700" />}
        <h3 className="font-semibold text-gray-800 text-sm">{title}</h3>
      </div>

      {description && <p className="text-gray-600 text-xs mb-2">{description}</p>}

      {isLoading ? (
        <div className="h-4 w-full bg-gray-200 rounded animate-pulse"></div>
      ) : (
        <div className="text-gray-700 text-sm">{children}</div>
      )}
    </AnalyticsCard>
  );
};

// --- TABLE COMPONENTS ---

// Analytics Table Wrapper
export const AnalyticsTable = ({ children, className }) => (
  <div className={cn("overflow-x-auto rounded-lg border border-gray-200", className)}>
    <table className="w-full table-auto">{children}</table>
  </div>
);

// Table Header
export const TableHeader = ({ children }) => (
  <thead>
    <tr className="border-b border-gray-200 bg-gray-50">{children}</tr>
  </thead>
);

// Table Header Cell
export const TableHeaderCell = ({ children, className }) => (
  <th className={cn("text-left py-2.5 px-3 font-semibold text-gray-700 text-sm", className)}>
    {children}
  </th>
);

// Table Body
export const TableBody = ({ children }) => <tbody>{children}</tbody>;

// Table Row
export const TableRow = ({ children, className }) => (
  <tr className={cn("border-b border-gray-100 hover:bg-blue-50 transition-colors", className)}>
    {children}
  </tr>
);

// Table Cell
export const TableCell = ({ children, className }) => (
  <td className={cn("py-2.5 px-3 text-sm text-gray-700", className)}>{children}</td>
);

// --- BADGE COMPONENT ---
export const Badge = ({ children, variant = "default", className }) => {
  const variants = {
    default: "bg-gray-100 text-gray-800",
    success: "bg-green-100 text-green-800",
    warning: "bg-yellow-100 text-yellow-800",
    danger: "bg-red-100 text-red-800",
    info: "bg-blue-100 text-blue-800",
  };

  return (
    <span
      className={cn(
        "px-2 py-0.5 rounded-full text-xs font-medium",
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  );
};

// --- EMPTY STATE ---
export const EmptyState = ({ icon: Icon, title, description, action, className }) => (
  <div
    className={cn(
      "flex flex-col items-center justify-center py-12 px-4 text-center",
      className
    )}
  >
    {Icon && (
      <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
        <Icon className="w-8 h-8 text-gray-400" />
      </div>
    )}
    <h3 className="text-lg font-semibold text-gray-800 mb-2">{title}</h3>
    {description && <p className="text-sm text-gray-500 mb-4 max-w-sm">{description}</p>}
    {action && <div>{action}</div>}
  </div>
);

// --- LOADING SKELETON ---
export const ChartSkeleton = ({ height = 250 }) => (
  <div className="animate-pulse space-y-3" style={{ height: `${height}px` }}>
    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
    <div className="h-full bg-gray-200 rounded"></div>
  </div>
);

// --- EXPORT ALL COMPONENTS ---
export default {
  AnalyticsCard,
  AnalyticsStatCard,
  AnalyticsChartCard,
  AnalyticsAlertCard,
  AnalyticsGrid,
  AnalyticsStack,
  HeatmapCell,
  HeatmapLegend,
  ChartContainer,
  InsightCard,
  AnalyticsTable,
  TableHeader,
  TableHeaderCell,
  TableBody,
  TableRow,
  TableCell,
  Badge,
  EmptyState,
  ChartSkeleton,
};
