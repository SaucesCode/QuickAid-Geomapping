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
      <section className="py-20 bg-white border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-6 text-center text-slate-500">
          Loading budget transparency data…
        </div>
      </section>
    );
  }

  if (isError || !data) {
    return (
      <section className="py-20 bg-white border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-6 text-center text-red-600">
          Budget data is temporarily unavailable.
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
