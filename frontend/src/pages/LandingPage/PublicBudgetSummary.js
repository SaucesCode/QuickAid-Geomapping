import { useQuery } from "@tanstack/react-query";
import BudgetStatCard from "./BudgetStatCard";
import { api } from "../../services/api";
import { formatDate } from "../../utils/FormatDate";

const formatPeso = value => `₱ ${Number(value || 0).toLocaleString("en-PH")}`;

const fetchPublicBudget = async () => {
  const { data } = await api.get("/public/budget/summary/");
  return data;
};

const PublicBudgetSummary = () => {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["public-budget-summary"],
    queryFn: fetchPublicBudget,
    staleTime: 1000 * 60 * 10,
  });

  if (isLoading) {
  return (
    <section className="py-24 bg-white border-t border-slate-100 flex flex-col items-center justify-center">
      <div className="flex flex-col items-center justify-center">
        {/* Increased size from w-12/h-12 to w-20/h-20 */}
        <div className="relative h-20 w-20">
          {/* Background track */}
          <div className="absolute inset-0 rounded-full border-[4px] border-slate-50"></div>
          
          {/* Animated Gradient Ring - Border thickness increased to 4px for scale */}
          <div className="absolute inset-0 rounded-full border-[4px] border-transparent border-t-blue-500 border-r-cyan-400 animate-spin"></div>
          
          {/* Soft Inner Glow */}
          <div className="absolute inset-2 rounded-full bg-gradient-to-tr from-blue-50/30 to-cyan-50/30 animate-pulse"></div>
        </div>

        <p className="mt-10 text-sm font-medium tracking-widest bg-gradient-to-r from-slate-400 to-slate-600 bg-clip-text text-transparent animate-pulse uppercase">
          Fetching transparency data
        </p>
      </div>
    </section>
  );
}

if (isError || !data) {
  return (
    <section className="py-24 bg-white border-t border-slate-100 flex flex-col items-center justify-center">
      {/* Visual Error Anchor */}
      <div className="relative flex items-center justify-center mb-8">
        <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center">
          <div className="w-1.5 h-1.5 bg-slate-300 rounded-full"></div>
        </div>
      </div>
      
      <div className="max-w-xs mx-auto px-6 text-center">
        <h3 className="text-slate-900 text-sm font-semibold tracking-tight mb-2">
          System Unavailable
        </h3>
        <p className="text-xs text-slate-400 leading-relaxed">
          We’re having trouble connecting to the budget server. 
          Please try again in a few moments.
        </p>
      </div>
    </section>
  );
}

  return (
    <section className="py-20 bg-white border-t border-slate-200">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
            Public Budget Transparency
          </h2>
          <p className="text-lg text-slate-600 max-w-3xl mx-auto">
            An overview of officially approved and released assistance funds, published in the
            interest of transparency and public accountability.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <BudgetStatCard
            label="Total Budget Allocated"
            value={formatPeso(data.total_allocated)}
          />
          <BudgetStatCard label="Budget Released" value={formatPeso(data.total_released)} />
          <BudgetStatCard label="Remaining Budget" value={formatPeso(data.remaining_budget)} />
          <BudgetStatCard
            label="Individuals Assisted"
            value={Number(data.beneficiaries || 0).toLocaleString()}
          />
        </div>

        {/* Footer note */}
        <div className="text-center mt-6">
          <p className="text-xs text-slate-500">
            Figures shown reflect officially approved and released assistance funds.
            <br />
            Last updated: {formatDate(data.last_updated)}
          </p>
        </div>
      </div>
    </section>
  );
};

export default PublicBudgetSummary;
