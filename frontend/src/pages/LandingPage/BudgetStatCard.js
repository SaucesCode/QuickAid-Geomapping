import { motion } from "framer-motion";

const BudgetStatCard = ({ label, value, subtext, icon, isLoading }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className="bg-white border border-black rounded-xl p-6 text-center shadow-md hover:shadow-lg transition-all"
    >
      {icon && (
        <div className="flex justify-center mb-4">
          <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center text-blue-700">
            {icon}
          </div>
        </div>
      )}

      {/* Value Skeleton Logic */}
      <div className="flex justify-center mb-2">
        {isLoading ? (
          <div className="h-9 w-32 bg-slate-100 animate-pulse rounded-md"></div>
        ) : (
          <div className="text-3xl font-bold text-slate-900">{value}</div>
        )}
      </div>

      {/* Label remains visible but can be slightly faded if preferred */}
      <div className="text-sm font-semibold text-slate-600 uppercase tracking-wide">
        {label}
      </div>

      {subtext && <div className="text-xs text-slate-400 mt-1">{subtext}</div>}
    </motion.div>
  );
};

export default BudgetStatCard;