import BudgetStatCard from "./BudgetStatCard";
import { Wallet, TrendingUp, PiggyBank, Users } from "lucide-react";

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
    <section className="relative py-24 bg-gradient-to-b from-blue-50/30 via-white to-white overflow-hidden">
      {/* Subtle Background Pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(30,64,175,0.04),transparent_50%),radial-gradient(circle_at_70%_80%,rgba(37,99,235,0.03),transparent_50%)]"></div>
      
      <div className="relative max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="mb-16 text-center">
          <div className="inline-block mb-6">
            <div className="flex items-center gap-2 px-6 py-3 bg-white rounded-full border border-blue-100 shadow-sm">
              <div className="w-2 h-2 rounded-full bg-blue-600"></div>
              <span className="text-sm font-medium text-blue-700 uppercase tracking-wide">
                Financial Transparency
              </span>
            </div>
          </div>
          <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 leading-snug mb-6">
              PUBLIC{" "}
              <span className="font-bold text-4xl lg:text-5xl bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent">
                BUDGET OVERVIEW
              </span>
            </h2>

          <p className="text-base text-slate-600 max-w-3xl mx-auto leading-relaxed">
            An overview of officially approved and released assistance funds, published in the
            interest of transparency and public accountability.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <BudgetStatCard
            icon={<Wallet className="w-6 h-6" />}
            label="Total Budget Allocated"
            value={formatPeso(mockBudget.total_allocated)}
          />
          <BudgetStatCard
            icon={<TrendingUp className="w-6 h-6" />}
            label="Budget Released"
            value={formatPeso(mockBudget.total_released)}
          />
          <BudgetStatCard
            icon={<PiggyBank className="w-6 h-6" />}
            label="Remaining Budget"
            value={formatPeso(mockBudget.remaining_budget)}
          />
          <BudgetStatCard
            icon={<Users className="w-6 h-6" />}
            label="Individuals Assisted"
            value={mockBudget.beneficiaries.toLocaleString()}
          />
        </div>

        {/* Footer note */}
        <div className="text-center mt-14">
          <div className="inline-flex items-center gap-2 mb-3">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <p className="text-sm text-slate-700 font-medium">
              Live data • Last updated: {mockBudget.last_updated}
            </p>
          </div>
          <p className="text-xs text-slate-500">
            Figures shown reflect officially approved and released assistance funds.
          </p>
        </div>
      </div>
    </section>
  );
};

export default PublicBudgetSummary;