import { Lock, CheckCircle, Clock, ChevronRight } from "lucide-react";

const BatchList = ({ batches, selectedBatch, onSelectBatch }) => {
  const getStatusIcon = status => {
    switch (status) {
      case "OPEN":
        return <Clock className="w-3.5 h-3.5" />;
      case "CLOSED":
        return <Lock className="w-3.5 h-3.5" />;
      case "FINALIZED":
        return <CheckCircle className="w-3.5 h-3.5" />;
      default:
        return null;
    }
  };

  const getStatusStyles = status => {
    switch (status) {
      case "OPEN":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "CLOSED":
        return "bg-yellow-50 text-yellow-700 border-yellow-200";
      case "FINALIZED":
        return "bg-green-50 text-green-700 border-green-200";
      default:
        return "bg-gray-50 text-gray-700 border-gray-200";
    }
  };

  const sortedBatches = [...batches].sort((a, b) => {
    const order = { OPEN: 1, CLOSED: 2, FINALIZED: 3 };
    return (order[a.status] || 99) - (order[b.status] || 99);
  });

  const formatDate = date =>
    new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });

  return (
    <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
      {sortedBatches.map(batch => {
        const isSelected = selectedBatch?.id === batch.id;

        return (
          <button
            key={batch.id}
            onClick={() => onSelectBatch(batch)}
            className={`w-full text-left rounded-xl border transition-all duration-200 ${
              isSelected
                ? "border-blue-500 bg-gradient-to-r from-blue-50 to-indigo-50 shadow-sm"
                : "border-gray-200 bg-white hover:bg-gray-50"
            }`}
          >
            <div className="p-4 space-y-3">
              {/* Header */}
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h3
                    className={`text-sm font-semibold truncate ${
                      isSelected ? "text-blue-900" : "text-gray-800"
                    }`}
                  >
                    {batch.name}
                  </h3>

                  {batch.approval_batch_file && (
                    <p className="text-xs text-gray-500 truncate mt-0.5">
                      {batch.approval_batch_file}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium border ${getStatusStyles(
                      batch.status
                    )}`}
                  >
                    {getStatusIcon(batch.status)}
                    {batch.status}
                  </span>

                  {isSelected && <ChevronRight className="w-4 h-4 text-blue-600" />}
                </div>
              </div>

              {/* Meta */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <p className="text-gray-500">Beneficiaries</p>
                  <p className="font-semibold text-gray-800">
                    {batch.total_beneficiaries || 0}
                  </p>
                </div>

                <div>
                  <p className="text-gray-500">Payout Date</p>
                  <p className="font-semibold text-gray-800">
                    {formatDate(batch.payout_date)}
                  </p>
                </div>
              </div>

              {/* Progress */}
              {batch.status !== "OPEN" && (
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs text-gray-600">
                    <span>Progress</span>
                    <span>
                      {(batch.claimed_count || 0) + (batch.unclaimed_count || 0)} /{" "}
                      {batch.total_beneficiaries || 0}
                    </span>
                  </div>

                  <div className="w-full h-2 rounded-full bg-gray-200 overflow-hidden flex">
                    <div
                      className="bg-green-500"
                      style={{
                        width: `${
                          batch.total_beneficiaries
                            ? ((batch.claimed_count || 0) / batch.total_beneficiaries) * 100
                            : 0
                        }%`,
                      }}
                    />
                    <div
                      className="bg-orange-400"
                      style={{
                        width: `${
                          batch.total_beneficiaries
                            ? ((batch.unclaimed_count || 0) / batch.total_beneficiaries) * 100
                            : 0
                        }%`,
                      }}
                    />
                  </div>
                </div>
              )}
            </div>
          </button>
        );
      })}
    </div>
  );
};

export default BatchList;
