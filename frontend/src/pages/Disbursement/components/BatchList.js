import {
  Lock,
  CheckCircle,
  Clock,
  ChevronRight,
  Users,
  Calendar,
  Package,
} from "lucide-react";

const BatchList = ({ batches, selectedBatch, onSelectBatch }) => {
  const getStatusConfig = status => {
    switch (status) {
      case "OPEN":
        return {
          icon: <Clock className="w-3 h-3" />,
          className: "bg-blue-50 text-blue-700 border-blue-200",
        };
      case "CLOSED":
        return {
          icon: <Lock className="w-3 h-3" />,
          className: "bg-yellow-50 text-yellow-700 border-yellow-200",
        };
      case "FINALIZED":
        return {
          icon: <CheckCircle className="w-3 h-3" />,
          className: "bg-green-50 text-green-700 border-green-200",
        };
      default:
        return {
          icon: null,
          className: "bg-gray-50 text-gray-600 border-gray-200",
        };
    }
  };

  const sortedBatches = [...batches].sort((a, b) => {
    const order = { OPEN: 1, CLOSED: 2, FINALIZED: 3 };
    return (order[a.status] || 99) - (order[b.status] || 99);
  });

  return (
    <div className="space-y-2 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
      {sortedBatches.map(batch => {
        const isSelected = selectedBatch?.id === batch.id;
        const status = getStatusConfig(batch.status);

        const total = batch.total_beneficiaries || 0;
        const processed = (batch.claimed_count || 0) + (batch.unclaimed_count || 0);
        const progress = total > 0 ? Math.round((processed / total) * 100) : 0;

        return (
          <button
            key={batch.id}
            onClick={() => onSelectBatch(batch)}
            className={`w-full text-left rounded-lg border transition-all duration-200 ${
              isSelected
                ? "border-[#003a76] bg-[#003a76]/5 shadow-sm"
                : "border-gray-200 bg-white hover:bg-gray-50 hover:border-gray-300"
            }`}
          >
            <div className="p-3 space-y-2">
              {/* Header */}
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="p-1.5 rounded-md bg-[#003a76]/10">
                    <Package className="w-3.5 h-3.5 text-[#003a76]" />
                  </div>
                  <h3
                    className={`text-sm font-semibold truncate ${
                      isSelected ? "text-[#003a76]" : "text-gray-800"
                    }`}
                  >
                    {batch.name}
                  </h3>
                </div>

                <span
                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${status.className}`}
                >
                  {status.icon}
                  {batch.status}
                </span>
              </div>

              {/* Meta */}
              <div className="flex items-center justify-between text-xs text-gray-600">
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1">
                    <Users className="w-3.5 h-3.5 text-gray-400" />
                    <span className="font-medium text-gray-700">{total}</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-gray-400" />
                    <span className="font-medium text-gray-700">
                      {new Date(batch.payout_date).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                  </span>
                </div>

                {isSelected && <ChevronRight className="w-4 h-4 text-[#003a76]" />}
              </div>
            </div>

            {/* Progress Bar */}
            {batch.status !== "OPEN" && (
              <div className="h-1 w-full bg-gray-200 overflow-hidden rounded-b-lg">
                <div
                  className="h-full bg-[#003a76] transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
};

export default BatchList;
