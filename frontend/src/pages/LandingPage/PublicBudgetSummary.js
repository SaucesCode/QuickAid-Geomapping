import BudgetStatCard from "./BudgetStatCard";

const mockBudget = {
  total_allocated: 125000000,
  total_released: 98200000,
  remaining_budget: 26800000,
  beneficiaries: 24315,
  last_updated: "January 14, 2026",
};

const formatPeso = value => `₱${value.toLocaleString("en-PH")}`;

const PublicBudgetSummary = () => {
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
            value={formatPeso(mockBudget.total_allocated)}
          />
          <BudgetStatCard
            label="Budget Released"
            value={formatPeso(mockBudget.total_released)}
          />
          <BudgetStatCard
            label="Remaining Budget"
            value={formatPeso(mockBudget.remaining_budget)}
          />
          <BudgetStatCard
            label="Individuals Assisted"
            value={mockBudget.beneficiaries.toLocaleString()}
          />
        </div>

        {/* Footer note */}
        <div className="text-center mt-6">
          <p className="text-xs text-slate-500">
            Figures shown reflect officially approved and released assistance funds.
            <br />
            Last updated: {mockBudget.last_updated}
          </p>
        </div>
      </div>
    </section>
  );
};

export default PublicBudgetSummary;
