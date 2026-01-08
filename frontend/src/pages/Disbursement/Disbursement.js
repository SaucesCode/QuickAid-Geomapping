import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../../services/api";
import { Wallet, AlertCircle, Info } from "lucide-react";
import { toast } from "react-hot-toast";

// Design System Imports
import {
  PageContainer,
  PageHeader,
  Card,
  LoadingState,
  BodyText,
  Stack,
} from "../../components/DesignSystem";

import BatchList from "./components/BatchList";
import BatchSummary from "./components/BatchSummary";
import ClaimTable from "./components/ClaimTable";
import StatusUpdateModal from "./components/StatusUpdateModal";

const fetchBatches = async () => {
  const { data } = await api.get("/disbursement/list-batches/");
  return data;
};

const fetchBatchDetail = async batchId => {
  if (!batchId) return null;
  const { data } = await api.get(`/disbursement/batch/${batchId}/`);
  return data;
};

const fetchClaims = async (batchId, params = {}) => {
  if (!batchId) return { results: [], count: 0 };
  const { data } = await api.get(`/disbursement/batch/${batchId}/claims/`, {
    params,
  });
  return data;
};

// MAIN COMPONENT
const Disbursement = () => {
  const [selectedBatch, setSelectedBatch] = useState(null);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [selectedClaims, setSelectedClaims] = useState([]);
  const [claimFilters, setClaimFilters] = useState({
    search: "",
    status: "",
    limit: 50,
    offset: 0,
  });

  const queryClient = useQueryClient();
  // QUERIES
  // 1. Fetch All Batches (Lightweight List)
  const {
    data: batches = [],
    isLoading: loadingBatches,
    isError: batchesError,
    refetch: refetchBatches,
  } = useQuery({
    queryKey: ["disbursement-batches"],
    queryFn: fetchBatches,
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  });

  // 2. Fetch Selected Batch Details (Full Data)
  const { data: batchDetail, isLoading: loadingBatchDetail } = useQuery({
    queryKey: ["batch-detail", selectedBatch?.id],
    queryFn: () => fetchBatchDetail(selectedBatch?.id),
    enabled: !!selectedBatch?.id,
    staleTime: 1000 * 60 * 2,
  });

  // 3. Fetch Claims for Selected Batch
  const {
    data: claimsData,
    isLoading: loadingClaims,
    refetch: refetchClaims,
  } = useQuery({
    queryKey: ["batch-claims", selectedBatch?.id, claimFilters],
    queryFn: () => fetchClaims(selectedBatch?.id, claimFilters),
    enabled: !!selectedBatch?.id,
    keepPreviousData: true,
  });

  const claims = claimsData?.results || [];
  const totalClaims = claimsData?.count || 0;

  // MUTATIONS
  // Update Single Claim Status
  const updateClaimMutation = useMutation({
    mutationFn: async ({ claimId, status, payout_date }) => {
      return await api.patch(`/disbursement/claim/${claimId}/status/`, {
        status,
        payout_date,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["batch-claims", selectedBatch?.id]);
      queryClient.invalidateQueries(["batch-detail", selectedBatch?.id]);
      queryClient.invalidateQueries(["disbursement-batches"]);
      toast.success("Claim status updated successfully");
    },
    onError: error => {
      const errorMsg = error.response?.data?.error || "Failed to update claim status";
      toast.error(errorMsg);
    },
  });

  // Bulk Update Claim Status
  const bulkUpdateClaimsMutation = useMutation({
    mutationFn: async ({ claimIds, status, payout_date }) => {
      // Backend doesn't have bulk endpoint yet, so we'll do sequential updates
      // You can create a bulk endpoint later for better performance
      const promises = claimIds.map(claimId =>
        api.patch(`/disbursement/claim/${claimId}/status/`, {
          status,
          payout_date,
        })
      );
      return await Promise.all(promises);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries(["batch-claims", selectedBatch?.id]);
      queryClient.invalidateQueries(["batch-detail", selectedBatch?.id]);
      queryClient.invalidateQueries(["disbursement-batches"]);
      toast.success(`${variables.claimIds.length} claims updated successfully`);
      setSelectedClaims([]);
      setShowStatusModal(false);
    },
    onError: error => {
      toast.error("Failed to update some claims. Please try again.");
      console.error(error);
    },
  });

  // Close Batch
  const closeBatchMutation = useMutation({
    mutationFn: async batchId => {
      return await api.post(`/disbursement/batch/${batchId}/close/`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["batch-detail", selectedBatch?.id]);
      queryClient.invalidateQueries(["disbursement-batches"]);
      toast.success("Batch closed successfully. Ready for payout distribution.");
    },
    onError: error => {
      const errorMsg = error.response?.data?.error || "Failed to close batch";
      toast.error(errorMsg);
    },
  });

  // Finalize Batch
  const finalizeBatchMutation = useMutation({
    mutationFn: async batchId => {
      return await api.post(`/disbursement/batch/${batchId}/finalize/`);
    },
    onSuccess: response => {
      queryClient.invalidateQueries(["batch-detail", selectedBatch?.id]);
      queryClient.invalidateQueries(["disbursement-batches"]);

      const { total_claimed, total_unclaimed } = response.data;
      toast.success(
        `Batch finalized! ${total_claimed} claimed, ${total_unclaimed} unclaimed.`,
        { duration: 5000 }
      );
    },
    onError: error => {
      const errorMsg = error.response?.data?.error || "Failed to finalize batch";
      toast.error(errorMsg);
    },
  });

  // ==========================================
  // HANDLERS
  // ==========================================

  const handleBatchSelect = batch => {
    setSelectedBatch(batch);
    setSelectedClaims([]);
    setClaimFilters({ search: "", status: "", limit: 50, offset: 0 });
  };

  const handleCloseBatch = () => {
    if (!selectedBatch) return;

    const confirmed = window.confirm(
      "Close this batch? This will lock it for payout distribution. You can still encode results after."
    );

    if (confirmed) {
      closeBatchMutation.mutate(selectedBatch.id);
    }
  };

  const handleFinalizeBatch = () => {
    if (!selectedBatch) return;

    const confirmed = window.confirm(
      "Finalize this batch? This will permanently lock all claims. This action cannot be undone."
    );

    if (confirmed) {
      finalizeBatchMutation.mutate(selectedBatch.id);
    }
  };

  const handleBulkStatusUpdate = (status, payout_date) => {
    if (selectedClaims.length === 0) {
      toast.error("No claims selected");
      return;
    }

    bulkUpdateClaimsMutation.mutate({
      claimIds: selectedClaims,
      status,
      payout_date,
    });
  };

  const handleClaimStatusChange = (claimId, status, payout_date) => {
    updateClaimMutation.mutate({ claimId, status, payout_date });
  };

  const handleClaimSelection = (claimId, isSelected) => {
    setSelectedClaims(prev => {
      if (isSelected) {
        return [...prev, claimId];
      } else {
        return prev.filter(id => id !== claimId);
      }
    });
  };

  const handleSelectAllClaims = isSelected => {
    if (isSelected) {
      const allClaimIds = claims.map(claim => claim.id);
      setSelectedClaims(allClaimIds);
    } else {
      setSelectedClaims([]);
    }
  };

  // ==========================================
  // COMPUTED VALUES
  // ==========================================

  const canEditClaims = batchDetail?.status === "OPEN" || batchDetail?.status === "CLOSED";
  const canCloseBatch = batchDetail?.status === "OPEN";
  const canFinalizeBatch = batchDetail?.status === "CLOSED";
  const isFinalized = batchDetail?.status === "FINALIZED";

  // ==========================================
  // RENDER
  // ==========================================

  return (
    <PageContainer>
      <PageHeader
        title="Disbursement Management"
        subtitle="Manage assistance batches and process beneficiary payouts"
        icon={Wallet}
      />
      <div className="flex flex-col lg:flex-row gap-6 mt-6">
        {/* LEFT SIDEBAR: BATCH LIST */}
        <aside className="w-full lg:w-80 lg:sticky lg:top-24 self-start">
          <Card className="p-0 overflow-hidden">
            <div className="p-4 border-b bg-gray-50/50 flex justify-between items-center">
              <h2 className="font-bold text-gray-700">Disbursement Batches</h2>
              <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                {batches.length} Total
              </span>
            </div>

            {loadingBatches ? (
              <div className="p-8">
                <LoadingState message="Loading batches..." />
              </div>
            ) : batchesError ? (
              <div className="p-4 flex items-center gap-2 text-red-500 text-sm">
                <AlertCircle className="w-4 h-4" />
                Error loading batches. Please refresh.
              </div>
            ) : batches.length === 0 ? (
              <div className="p-8 text-center">
                <div className="bg-gray-50 p-4 rounded-full mb-3 inline-block">
                  <Wallet className="w-8 h-8 text-gray-300" />
                </div>
                <p className="text-sm text-gray-500">No disbursement batches yet.</p>
                <p className="text-xs text-gray-400 mt-2">
                  Upload an approved list to create one.
                </p>
              </div>
            ) : (
              <BatchList
                batches={batches}
                selectedBatch={selectedBatch}
                onSelectBatch={handleBatchSelect}
              />
            )}
          </Card>
        </aside>

        {/* MAIN PANEL */}
        <main className="flex-1">
          {!selectedBatch ? (
            <Card className="flex flex-col items-center justify-center py-32 text-center border-dashed border-2">
              <div className="bg-gray-50 p-6 rounded-full mb-4">
                <Wallet className="w-10 h-10 text-gray-300" />
              </div>
              <BodyText className="text-gray-500 max-w-md">
                Select a disbursement batch from the sidebar to view and manage beneficiary
                claims
              </BodyText>
            </Card>
          ) : (
            <Stack spacing="lg">
              {/* Batch Summary Card */}
              {loadingBatchDetail ? (
                <Card>
                  <LoadingState message="Loading batch details..." />
                </Card>
              ) : (
                <BatchSummary
                  batch={batchDetail}
                  isClosing={closeBatchMutation.isLoading}
                  isFinalizing={finalizeBatchMutation.isLoading}
                  canClose={canCloseBatch}
                  canFinalize={canFinalizeBatch}
                  onCloseBatch={handleCloseBatch}
                  onFinalizeBatch={handleFinalizeBatch}
                />
              )}

              {/* Claims Table */}
              <ClaimTable
                claims={claims}
                totalClaims={totalClaims}
                loading={loadingClaims}
                batchStatus={batchDetail?.status}
                canEdit={canEditClaims}
                isFinalized={isFinalized}
                selectedClaims={selectedClaims}
                onClaimSelect={handleClaimSelection}
                onSelectAll={handleSelectAllClaims}
                onStatusChange={handleClaimStatusChange}
                onBulkUpdate={() => setShowStatusModal(true)}
                filters={claimFilters}
                onFilterChange={setClaimFilters}
                isUpdating={updateClaimMutation.isLoading}
              />
            </Stack>
          )}
        </main>
      </div>

      {/* Info Banner - How to Create Batches */}
      <Card className="bg-blue-50 border-blue-200">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <h3 className="font-semibold text-blue-900 mb-1">
              How to Create Disbursement Batches
            </h3>
            <p className="text-sm text-blue-700">
              Disbursement batches are automatically created when you upload an approved list.
              Go to <strong>Approved Applicants → Upload Approved List</strong> to create a new
              batch.
            </p>
          </div>
        </div>
      </Card>

      {/* Status Update Modal */}
      {showStatusModal && (
        <StatusUpdateModal
          selectedCount={selectedClaims.length}
          isUpdating={bulkUpdateClaimsMutation.isLoading}
          onClose={() => setShowStatusModal(false)}
          onSubmit={handleBulkStatusUpdate}
        />
      )}
    </PageContainer>
  );
};

export default Disbursement;
