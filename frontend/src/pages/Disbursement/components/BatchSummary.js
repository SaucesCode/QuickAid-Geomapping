import {
  Calendar,
  Package,
  CheckCircle,
  Clock,
  AlertCircle,
  Lock,
  FileText,
} from "lucide-react";
import { Card, GradientButton, OutlineButton, Badge } from "../../../components/DesignSystem";

const BatchSummary = ({
  batch,
  isClosing,
  isFinalizing,
  canClose,
  canFinalize,
  onCloseBatch,
  onFinalizeBatch,
}) => {
  if (!batch) return null;

  // Helper function to format currency
  const formatCurrency = amount => {
    return new Intl.NumberFormat("en-PH", {
      style: "currency",
      currency: "PHP",
    }).format(amount || 0);
  };

  // Helper function to format date
  const formatDate = dateString => {
    if (!dateString) return "Not set";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Status badge configuration
  const getStatusConfig = status => {
    switch (status) {
      case "OPEN":
        return {
          variant: "info",
          icon: <Clock className="w-4 h-4" />,
          label: "Open - Active",
        };
      case "CLOSED":
        return {
          variant: "warning",
          icon: <Lock className="w-4 h-4" />,
          label: "Closed - Ready for Payout",
        };
      case "FINALIZED":
        return {
          variant: "success",
          icon: <CheckCircle className="w-4 h-4" />,
          label: "Finalized - Completed",
        };
      default:
        return {
          variant: "default",
          icon: <AlertCircle className="w-4 h-4" />,
          label: status,
        };
    }
  };

  const statusConfig = getStatusConfig(batch.status);

  // Calculate completion percentage
  const totalProcessed = (batch.total_claimed || 0) + (batch.total_unclaimed || 0);
  const completionPercentage =
    batch.total_beneficiaries > 0
      ? Math.round((totalProcessed / batch.total_beneficiaries) * 100)
      : 0;

  return (
    <Card>
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-800">{batch.name}</h2>
            <Badge variant={statusConfig.variant} className="flex items-center gap-1">
              {statusConfig.icon}
              {statusConfig.label}
            </Badge>
          </div>

          {/* Source File */}
          {batch.approval_batch_file && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <FileText className="w-4 h-4" />
              <span>Source: {batch.approval_batch_file}</span>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-2 w-full lg:w-auto">
          {canClose && (
            <GradientButton
              onClick={onCloseBatch}
              loading={isClosing}
              disabled={isClosing}
              className="w-full sm:w-auto"
            >
              <Lock className="w-4 h-4" />
              Close Batch
            </GradientButton>
          )}

          {canFinalize && (
            <GradientButton
              onClick={onFinalizeBatch}
              loading={isFinalizing}
              disabled={isFinalizing}
              className="w-full sm:w-auto bg-green-600 hover:bg-green-700"
            >
              <CheckCircle className="w-4 h-4" />
              Finalize Batch
            </GradientButton>
          )}

          {batch.status === "FINALIZED" && (
            <OutlineButton className="w-full sm:w-auto cursor-not-allowed">
              <CheckCircle className="w-4 h-4 text-green-600" />
              Batch Completed
            </OutlineButton>
          )}
        </div>
      </div>

      {/* Info Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {/* Assistance Type */}
        <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
          <div className="flex items-center gap-2 mb-1">
            <Package className="w-4 h-4 text-blue-600" />
            <span className="text-xs font-medium text-blue-600">Assistance Type</span>
          </div>
          <p className="text-lg font-bold text-gray-800">{batch.assistance_type}</p>
        </div>

        {/* Payout Date */}
        <div className="bg-purple-50 rounded-xl p-4 border border-purple-100">
          <div className="flex items-center gap-2 mb-1">
            <Calendar className="w-4 h-4 text-purple-600" />
            <span className="text-xs font-medium text-purple-600">Payout Date</span>
          </div>
          <p className="text-lg font-bold text-gray-800">{formatDate(batch.payout_date)}</p>
        </div>

        {/* Total Beneficiaries */}
        <div className="bg-indigo-50 rounded-xl p-4 border border-indigo-100">
          <div className="flex items-center gap-2 mb-1">
            <Package className="w-4 h-4 text-indigo-600" />
            <span className="text-xs font-medium text-indigo-600">Total Beneficiaries</span>
          </div>
          <p className="text-lg font-bold text-gray-800">
            {batch.total_beneficiaries?.toLocaleString() || 0}
          </p>
        </div>

        {/* Created By */}
        <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
          <div className="flex items-center gap-2 mb-1">
            <Clock className="w-4 h-4 text-gray-600" />
            <span className="text-xs font-medium text-gray-600">Created By</span>
          </div>
          <p className="text-sm font-semibold text-gray-800 truncate">
            {batch.created_by_full_name || batch.created_by_name || "System"}
          </p>
          <p className="text-xs text-gray-500">{formatDate(batch.created_at)}</p>
        </div>
      </div>

      {/* Financial Summary */}
      <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200 mb-6">
        <h3 className="text-sm font-semibold text-green-800 mb-4 flex items-center gap-2">
          <Package className="w-4 h-4" />
          Financial Summary
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <p className="text-xs text-green-700 mb-1">Total Amount</p>
            <p className="text-2xl font-bold text-green-900">
              {formatCurrency(batch.total_amount)}
            </p>
          </div>
          <div>
            <p className="text-xs text-green-700 mb-1">Claimed Amount</p>
            <p className="text-xl font-bold text-green-800">
              {formatCurrency(batch.claimed_amount)}
            </p>
            <p className="text-xs text-green-600 mt-1">{batch.claimed_count || 0} claims</p>
          </div>
          <div>
            <p className="text-xs text-orange-700 mb-1">Unclaimed Amount</p>
            <p className="text-xl font-bold text-orange-800">
              {formatCurrency(batch.unclaimed_amount)}
            </p>
            <p className="text-xs text-orange-600 mt-1">{batch.unclaimed_count || 0} claims</p>
          </div>
        </div>
      </div>

      {/* Claim Status Progress */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-sm font-semibold text-gray-700">Claim Processing Progress</h3>
          <span className="text-sm font-medium text-gray-600">{completionPercentage}%</span>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
          <div className="flex h-full">
            {/* Claimed (Green) */}
            <div
              className="bg-green-500 transition-all duration-500"
              style={{
                width: `${
                  batch.total_beneficiaries > 0
                    ? ((batch.claimed_count || 0) / batch.total_beneficiaries) * 100
                    : 0
                }%`,
              }}
            />
            {/* Unclaimed (Orange) */}
            <div
              className="bg-orange-400 transition-all duration-500"
              style={{
                width: `${
                  batch.total_beneficiaries > 0
                    ? ((batch.unclaimed_count || 0) / batch.total_beneficiaries) * 100
                    : 0
                }%`,
              }}
            />
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-4 mt-3 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded-full" />
            <span className="text-gray-600">
              Claimed: {batch.claimed_count || 0} ({formatCurrency(batch.claimed_amount)})
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-orange-400 rounded-full" />
            <span className="text-gray-600">
              Unclaimed: {batch.unclaimed_count || 0} ({formatCurrency(batch.unclaimed_amount)}
              )
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-gray-300 rounded-full" />
            <span className="text-gray-600">Pending: {batch.pending_count || 0}</span>
          </div>
        </div>
      </div>

      {/* Finalized Info */}
      {batch.status === "FINALIZED" && batch.finalized_at && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-green-900 mb-1">Batch Finalized</p>
              <p className="text-sm text-green-700">
                This batch was finalized on {formatDate(batch.finalized_at)}. All claims are
                now locked and cannot be modified.
              </p>
              <div className="mt-3 text-sm text-green-800">
                <p>
                  • Total Claimed: {batch.total_claimed} beneficiaries (
                  {formatCurrency(batch.claimed_amount)})
                </p>
                <p>
                  • Total Unclaimed: {batch.total_unclaimed} beneficiaries (
                  {formatCurrency(batch.unclaimed_amount)})
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Workflow Guide */}
      {batch.status === "OPEN" && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-blue-900 mb-1">Next Steps</p>
              <ol className="text-sm text-blue-700 space-y-1 list-decimal list-inside">
                <li>Review all beneficiary claims below</li>
                <li>Click "Close Batch" when ready for payout distribution</li>
                <li>Conduct field distribution to beneficiaries</li>
                <li>Return here to encode payout results (claimed/unclaimed)</li>
                <li>Finalize batch to complete the process</li>
              </ol>
            </div>
          </div>
        </div>
      )}

      {batch.status === "CLOSED" && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <Lock className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-yellow-900 mb-1">
                Batch Closed - Ready for Encoding
              </p>
              <p className="text-sm text-yellow-700 mb-2">
                This batch is locked for payout. After distributing assistance in the field:
              </p>
              <ol className="text-sm text-yellow-700 space-y-1 list-decimal list-inside">
                <li>Use the table below to mark claims as CLAIMED or UNCLAIMED</li>
                <li>You can select multiple claims and bulk update their status</li>
                <li>Once all results are encoded, click "Finalize Batch" to complete</li>
              </ol>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
};

export default BatchSummary;
