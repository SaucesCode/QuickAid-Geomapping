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

  if (isError) {
    return (
      <section className="py-24 bg-white border-t border-slate-100 flex flex-col items-center justify-center">
        <div className="relative h-24 w-24 flex items-center justify-center mb-10">
          <div className="absolute inset-0 rounded-full border-[4px] border-red-50"></div>
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
        {/* Header - Always Visible */}
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
            Public Budget Transparency
          </h2>
          <p className="text-lg text-slate-600 max-w-3xl mx-auto">
            An overview of officially approved and released assistance funds, published in the
            interest of transparency and public accountability.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <BudgetStatCard
            isLoading={isLoading}
            label="Total Budget Allocated"
            value={formatPeso(data?.total_allocated)}
          />
          <BudgetStatCard 
            isLoading={isLoading}
            label="Budget Released" 
            value={formatPeso(data?.total_released)} 
          />
          <BudgetStatCard 
            isLoading={isLoading}
            label="Remaining Budget" 
            value={formatPeso(data?.remaining_budget)} 
          />
          <BudgetStatCard
            isLoading={isLoading}
            label="Individuals Assisted"
            value={Number(data?.beneficiaries || 0).toLocaleString()}
          />
        </div>

        {/* Footer note - Text remains visible while loading */}
        <div className="text-center mt-6">
          <p className="text-xs text-slate-500 leading-relaxed">
            Figures shown reflect officially approved and released assistance funds.
            <br />
            <span className="inline-flex items-center gap-1">
              Last updated:{" "}
              {isLoading ? (
                <span className="h-3 w-24 bg-slate-100 animate-pulse rounded inline-block"></span>
              ) : (
                formatDate(data?.last_updated)
              )}
            </span>
          </p>
        </div>
      </div>
    </section>
  );
};

export default PublicBudgetSummary;