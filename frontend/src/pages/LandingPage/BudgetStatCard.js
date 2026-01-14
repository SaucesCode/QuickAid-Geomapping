import { motion } from "framer-motion";

const BudgetStatCard = ({ label, value, subtext }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className="bg-white border border-slate-200 rounded-xl p-6 text-center shadow-sm hover:shadow-md transition"
    >
      <div className="text-3xl font-bold text-slate-900 mb-2">{value}</div>
      <div className="text-sm font-semibold text-slate-600 uppercase tracking-wide">
        {label}
      </div>
      {subtext && <div className="text-xs text-slate-400 mt-1">{subtext}</div>}
    </motion.div>
  );
};

export default BudgetStatCard;
