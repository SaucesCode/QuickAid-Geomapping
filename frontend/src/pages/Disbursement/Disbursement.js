import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../../services/api";
import { Wallet, CheckCircle, AlertCircle } from "lucide-react";
import { toast } from "react-hot-toast"; // Assuming you use react-hot-toast

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
import ApprovalSelector from "./components/ApprovalSelector";

const fetchBatches = async () => {
  const { data } = await api.get("/disbursement/list-batches/");
  return data;
};

const fetchClaims = async batchId => {
  if (!batchId) return [];
  const { data } = await api.get(`/disbursement/batch/${batchId}/claims/`);
  return data.results;
};

const Disbursement = () => {
  const [selectedBatch, setSelectedBatch] = useState(null);
  const queryClient = useQueryClient();

  // 1. Fetch Batches
  const {
    data: batches = [],
    isLoading: loadingBatches,
    isError: batchesError,
    refetch: refetchBatches,
  } = useQuery({
    queryKey: ["batches"],
    queryFn: fetchBatches,
    staleTime: 1000 * 60 * 5,
  });

  // 2. Fetch Claims for Selected Batch
  const {
    data: claims = [],
    isLoading: loadingClaims,
    refetch: refetchClaims,
  } = useQuery({
    queryKey: ["claims", selectedBatch?.id],
    queryFn: () => fetchClaims(selectedBatch?.id),
    enabled: !!selectedBatch?.id,
  });

  // 3. Mutation for Updating Claim Status (Backend: update_claim_status)
  const updateClaimMutation = useMutation({
    mutationFn: async ({ claimId, status }) => {
      return await api.post(`/disbursement/claim/${claimId}/status/`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["claims", selectedBatch?.id]);
      toast.success("Claim status updated");
    },
    onError: error => {
      toast.error(error.response?.data?.error || "Failed to update claim");
    },
  });

  // 4. Mutation for Closing Batch (Backend: close_batch)
  const closeBatchMutation = useMutation({
    mutationFn: async batchId => {
      return await api.post(`/disbursement/batch/${batchId}/close/`);
    },
    onSuccess: () => {
      refetchBatches();
      toast.success("Batch closed successfully");
    },
  });

  return (
    <PageContainer>
      <PageHeader
        title="Disbursement Management"
        subtitle="Manage assistance batches and process beneficiary claims"
        icon={Wallet}
      />

      <div className="flex flex-col lg:flex-row gap-6 mt-6">
        {/* LEFT SIDEBAR: BATCH LIST */}
        <aside className="w-full lg:w-80">
          <Card className="p-0 overflow-hidden">
            <div className="p-4 border-b bg-gray-50/50 flex justify-between items-center">
              <h2 className="font-bold text-gray-700">Available Batches</h2>
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
                Error loading batches.
              </div>
            ) : (
              <BatchList
                batches={batches}
                selectedBatch={selectedBatch}
                onSelectBatch={setSelectedBatch}
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
              <BodyText className="text-gray-500">
                Select a disbursement batch from the sidebar to manage claims
              </BodyText>
            </Card>
          ) : (
            <Stack spacing="lg">
              {/* Batch details & Close action */}
              <BatchSummary
                batch={selectedBatch}
                isClosing={closeBatchMutation.isLoading}
                onCloseBatch={() => closeBatchMutation.mutate(selectedBatch.id)}
                onBatchUpdated={() => {
                  refetchBatches();
                  refetchClaims();
                }}
              />
              {/* Allow adding more approvals if batch is OPEN */}
              {selectedBatch.status === "OPEN" && (
                <ApprovalSelector batch={selectedBatch} onAttached={() => refetchClaims()} />
              )}
              {/* Claims Table with Status Handlers */}
              <ClaimTable
                claims={claims?.results || (Array.isArray(claims) ? claims : [])}
                loading={loadingClaims}
                batchStatus={selectedBatch?.status}
                onStatusChange={(claimId, newStatus) =>
                  updateClaimMutation.mutate({ claimId, status: newStatus })
                }
              />
            </Stack>
          )}
        </main>
      </div>
    </PageContainer>
  );
};

export default Disbursement;
