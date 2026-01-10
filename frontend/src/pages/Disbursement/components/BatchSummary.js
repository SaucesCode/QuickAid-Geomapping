import { useState } from "react";
import {
  Calendar,
  Package,
  CheckCircle,
  Clock,
  AlertCircle,
  Lock,
  FileText,
  ClipboardCheck,
} from "lucide-react";
import { Card, Badge } from "../../../components/DesignSystem";
import ConfirmationModal from "./ConfirmationModal";
import { formatDate } from "../../../utils/FormatDate";

const BatchSummary = ({
  batch,
  isClosing,
  isFinalizing,
  canClose,
  canFinalize,
  onCloseBatch,
  onFinalizeBatch,
}) => {
  const [closeModal, setCloseModal] = useState(false);
  const [finalizeModal, setFinalizeModal] = useState(false);

  if (!batch) return null;

  const handleCloseBatchConfirm = () => {
    onCloseBatch();
    setCloseModal(false);
  };

  const handleFinalizeBatchConfirm = () => {
    onFinalizeBatch();
    setFinalizeModal(false);
  };

  // Helper function to format currency
  const formatCurrency = amount => {
    return new Intl.NumberFormat("en-PH", {
      style: "currency",
      currency: "PHP",
    }).format(amount || 0);
  };

  // Status badge configuration
  const getStatusConfig = status => {
    switch (status) {
      case "OPEN":
        return {
          variant: "info",
          icon: <Clock className="w-3.5 h-3.5" />,
          label: "Open - Active",
        };
      case "CLOSED":
        return {
          variant: "warning",
          icon: <Lock className="w-3.5 h-3.5" />,
          label: "Closed - Ready for Payout",
        };
      case "FINALIZED":
        return {
          variant: "success",
          icon: <CheckCircle className="w-3.5 h-3.5" />,
          label: "Finalized - Completed",
        };
      default:
        return {
          variant: "default",
          icon: <AlertCircle className="w-3.5 h-3.5" />,
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
    <Card className="p-5">
      {/* Header Section */}
      <div className="flex items-center gap-3 mb-5 pb-4 border-b border-gray-200">
        <div className="w-10 h-10 bg-[#003a76] rounded-xl flex items-center justify-center shadow-md">
          <FileText className="w-5 h-5 text-white" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-lg sm:text-xl font-bold text-gray-800">{batch.name}</h2>
            <Badge variant={statusConfig.variant} className="flex items-center gap-1 text-xs">
              {statusConfig.icon}
              {statusConfig.label}
            </Badge>
          </div>

          {/* Source File */}
          {batch.approval_batch_file && (
            <div className="flex items-center gap-2 text-xs text-gray-600">
              <FileText className="w-3.5 h-3.5" />
              <span>Source: {batch.approval_batch_file}</span>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-2">
          {canClose && (
            <button
              onClick={() => setCloseModal(true)} // Changed this
              disabled={isClosing}
              className="px-4 py-2 bg-[#003a76] hover:bg-[#002d5c] disabled:bg-gray-400 text-white rounded-lg font-semibold text-sm transition-all flex items-center justify-center gap-2 shadow-sm hover:shadow-md disabled:cursor-not-allowed"
            >
              {isClosing ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Closing...
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  Close Batch
                </>
              )}
            </button>
          )}

          {canFinalize && (
            <button
              onClick={() => setFinalizeModal(true)} // Changed this
              disabled={isFinalizing}
              className="px-4 py-2 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 disabled:from-gray-400 disabled:to-gray-500 text-white rounded-lg font-semibold text-sm transition-all flex items-center justify-center gap-2 shadow-sm hover:shadow-md disabled:cursor-not-allowed"
            >
              {isFinalizing ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Finalizing...
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4" />
                  Finalize Batch
                </>
              )}
            </button>
          )}

          {batch.status === "FINALIZED" && (
            <button
              disabled
              className="px-4 py-2 border-2 border-green-300 bg-green-50 text-green-700 rounded-lg font-semibold text-sm cursor-not-allowed flex items-center justify-center gap-2"
            >
              <CheckCircle className="w-4 h-4" />
              Batch Completed
            </button>
          )}
        </div>
      </div>

      {/* Info Grid - Compact */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
        {/* Assistance Type */}
        <div className="bg-gradient-to-br from-[#003a76]/5 to-[#003a76]/10 rounded-lg p-3 border border-[#003a76]/20">
          <div className="flex items-center gap-1.5 mb-1">
            <Package className="w-3.5 h-3.5 text-[#003a76]" />
            <span className="text-xs font-medium text-[#003a76]">Assistance Type</span>
          </div>
          <p className="text-base font-bold text-gray-800">{batch.assistance_type}</p>
        </div>

        {/* Payout Date */}
        <div className="bg-purple-50 rounded-lg p-3 border border-purple-100">
          <div className="flex items-center gap-1.5 mb-1">
            <Calendar className="w-3.5 h-3.5 text-purple-600" />
            <span className="text-xs font-medium text-purple-600">Payout Date</span>
          </div>
          <p className="text-base font-bold text-gray-800">{formatDate(batch.payout_date)}</p>
        </div>

        {/* Total Beneficiaries */}
        <div className="bg-indigo-50 rounded-lg p-3 border border-indigo-100">
          <div className="flex items-center gap-1.5 mb-1">
            <Package className="w-3.5 h-3.5 text-indigo-600" />
            <span className="text-xs font-medium text-indigo-600">Total Beneficiaries</span>
          </div>
          <p className="text-base font-bold text-gray-800">
            {batch.total_beneficiaries?.toLocaleString() || 0}
          </p>
        </div>

        {/* Created By */}
        <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
          <div className="flex items-center gap-1.5 mb-1">
            <Clock className="w-3.5 h-3.5 text-gray-600" />
            <span className="text-xs font-medium text-gray-600">Created By</span>
          </div>
          <p className="text-sm font-semibold text-gray-800 truncate">
            {batch.created_by_full_name || batch.created_by_name || "System"}
          </p>
          <p className="text-xs text-gray-500">{formatDate(batch.created_at)}</p>
        </div>
      </div>

      {/* Financial Summary - Compact */}
      <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-4 border border-green-200 mb-5">
        <h3 className="text-xs font-semibold text-green-800 mb-3 flex items-center gap-1.5">
          <Package className="w-3.5 h-3.5" />
          Financial Summary
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <p className="text-xs text-green-700 mb-0.5">Total Amount</p>
            <p className="text-xl font-bold text-green-900">
              {formatCurrency(batch.total_amount)}
            </p>
          </div>
          <div>
            <p className="text-xs text-green-700 mb-0.5">Claimed Amount</p>
            <p className="text-lg font-bold text-green-800">
              {formatCurrency(batch.claimed_amount)}
            </p>
            <p className="text-xs text-green-600 mt-0.5">{batch.claimed_count || 0} claims</p>
          </div>
          <div>
            <p className="text-xs text-orange-700 mb-0.5">Unclaimed Amount</p>
            <p className="text-lg font-bold text-orange-800">
              {formatCurrency(batch.unclaimed_amount)}
            </p>
            <p className="text-xs text-orange-600 mt-0.5">
              {batch.unclaimed_count || 0} claims
            </p>
          </div>
        </div>
      </div>

      {/* Claim Status Progress - Compact */}
      <div className="mb-5">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-xs font-semibold text-gray-700">Claim Processing Progress</h3>
          <span className="text-xs font-medium text-[#003a76]">{completionPercentage}%</span>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
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

        {/* Legend - Compact */}
        <div className="flex flex-wrap gap-3 mt-2 text-xs">
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 bg-green-500 rounded-full" />
            <span className="text-gray-600">
              Claimed: {batch.claimed_count || 0} ({formatCurrency(batch.claimed_amount)})
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 bg-orange-400 rounded-full" />
            <span className="text-gray-600">
              Unclaimed: {batch.unclaimed_count || 0} ({formatCurrency(batch.unclaimed_amount)}
              )
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 bg-gray-300 rounded-full" />
            <span className="text-gray-600">Pending: {batch.pending_count || 0}</span>
          </div>
        </div>
      </div>

      {/* Finalized Info */}
      {batch.status === "FINALIZED" && batch.finalized_at && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
          <div className="flex items-start gap-2">
            <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-green-900 mb-1 text-sm">Batch Finalized</p>
              <p className="text-xs text-green-700">
                This batch was finalized on {formatDate(batch.finalized_at)}. All claims are
                now locked and cannot be modified.
              </p>
              <div className="mt-2 text-xs text-green-800 space-y-0.5">
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

      {/* Workflow Guide - Compact */}
      {batch.status === "OPEN" && (
        <div className="bg-[#003a76]/5 border border-[#003a76]/20 rounded-lg p-3">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-[#003a76] flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-[#003a76] mb-1 text-sm">Next Steps</p>
              <ol className="text-xs text-gray-700 space-y-0.5 list-decimal list-inside">
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
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
          <div className="flex items-start gap-2">
            <Lock className="w-4 h-4 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-yellow-900 mb-1 text-sm">
                Batch Closed - Ready for Encoding
              </p>
              <p className="text-xs text-yellow-700 mb-1.5">
                This batch is locked for payout. After distributing assistance in the field:
              </p>
              <ol className="text-xs text-yellow-700 space-y-0.5 list-decimal list-inside">
                <li>Use the table below to mark claims as CLAIMED or UNCLAIMED</li>
                <li>You can select multiple claims and bulk update their status</li>
                <li>Once all results are encoded, click "Finalize Batch" to complete</li>
              </ol>
            </div>
          </div>
        </div>
      )}
      <ConfirmationModal
        isOpen={closeModal}
        onClose={() => setCloseModal(false)}
        onConfirm={handleCloseBatchConfirm}
        title="Close Batch for Payout?"
        message="This will lock the batch and prepare it for field distribution. You'll be able to encode payout results after closing. This action cannot be undone."
        confirmText="Yes, Close Batch"
        cancelText="Cancel"
        type="warning"
        isLoading={isClosing}
      />

      <ConfirmationModal
        isOpen={finalizeModal}
        onClose={() => setFinalizeModal(false)}
        onConfirm={handleFinalizeBatchConfirm}
        title="Finalize Batch?"
        message={`This will permanently finalize the batch with ${
          batch.total_claimed || 0
        } claimed and ${
          batch.total_unclaimed || 0
        } unclaimed beneficiaries. Once finalized, no further changes can be made.`}
        confirmText="Yes, Finalize"
        cancelText="Cancel"
        type="success"
        isLoading={isFinalizing}
      />
    </Card>
  );
};

export default BatchSummary;
