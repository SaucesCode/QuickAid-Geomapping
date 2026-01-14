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
      {/* Large Gemini-style Loading Circle */}
      <div className="relative h-24 w-24">
        <div className="absolute inset-0 rounded-full border-[4px] border-slate-50"></div>
        <div className="absolute inset-0 rounded-full border-[4px] border-transparent border-t-blue-500 border-r-cyan-400 animate-spin"></div>
        <div className="absolute inset-4 rounded-full bg-gradient-to-tr from-blue-50/40 to-cyan-50/10 animate-pulse"></div>
      </div>
      <p className="mt-10 text-[11px] font-bold tracking-[0.25em] text-slate-400 uppercase animate-pulse">
        Synchronizing Data
      </p>
    </section>
  );
}

if (isError || !data) {
  return (
    <section className="py-24 bg-white border-t border-slate-100 flex flex-col items-center justify-center">
      {/* Large Error Icon - Matched to Loader Size */}
      <div className="relative h-24 w-24 flex items-center justify-center mb-10">
        {/* Outer Ring */}
        <div className="absolute inset-0 rounded-full border-[4px] border-red-50"></div>
        
        {/* Large Minimalist Warning Graphic */}
        <div className="flex flex-col items-center justify-center gap-1.5">
          <div className="w-1.5 h-8 bg-red-200 rounded-full"></div>
          <div className="w-1.5 h-1.5 bg-red-200 rounded-full"></div>
        </div>
      </div>
      
      <div className="max-w-sm mx-auto px-6 text-center">
        <h3 className="text-slate-900 text-lg font-semibold tracking-tight mb-2">
          Budget Data Unavailable
        </h3>
        <p className="text-slate-500 text-sm leading-relaxed mb-8">
          The transparency database is currently undergoing maintenance or is temporarily unreachable.
        </p>
        <button 
          onClick={() => window.location.reload()}
          className="px-8 py-2.5 text-[11px] font-bold tracking-[0.15em] uppercase border border-slate-200 text-slate-500 rounded-full hover:bg-slate-50 hover:border-slate-300 transition-all active:scale-95"
        >
          Try Refreshing
        </button>
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
