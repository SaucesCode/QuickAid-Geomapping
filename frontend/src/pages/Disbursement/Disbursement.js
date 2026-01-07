import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "../../services/api";
import { Wallet } from "lucide-react";

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
  return data;
};

const Disbursement = () => {
  const [selectedBatch, setSelectedBatch] = useState(null);

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

  const {
    data: claims = [],
    isLoading: loadingClaims,
    refetch: refetchClaims,
  } = useQuery({
    queryKey: ["claims", selectedBatch?.id],
    queryFn: () => fetchClaims(selectedBatch?.id),
    enabled: !!selectedBatch,
    staleTime: 1000 * 60 * 5,
  });

  return (
    <PageContainer>
      <div>
        <PageHeader
          title="Disbursement Management"
          subtitle="Manage assistance batches and approve beneficiary claims"
          icon={Wallet}
        />

        <div className="flex flex-col lg:flex-row gap-6 mt-6">
          {/* LEFT SIDEBAR: BATCH LIST */}
          <aside className="w-full lg:w-80">
            <Card className="p-0 overflow-hidden">
              <div className="p-4 border-b bg-gray-50/50">
                <h2 className="font-bold text-gray-700">Available Batches</h2>
              </div>
              {loadingBatches ? (
                <div className="p-8">
                  <LoadingState message="Loading batches..." />
                </div>
              ) : batchesError ? (
                <div className="p-4 text-red-500 text-sm">Error loading batches.</div>
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
              <Card className="flex flex-col items-center justify-center py-24 text-center">
                <div className="bg-blue-50 p-4 rounded-full mb-4">
                  <Wallet className="w-8 h-8 text-blue-400" />
                </div>
                <BodyText>
                  Select a disbursement batch from the sidebar to view details
                </BodyText>
              </Card>
            ) : (
              <Stack spacing="lg">
                <BatchSummary
                  batch={selectedBatch}
                  onBatchUpdated={() => {
                    refetchBatches();
                    refetchClaims();
                  }}
                />

                <ApprovalSelector batch={selectedBatch} onAttached={() => refetchClaims()} />

                <ClaimTable
                  claims={claims}
                  loading={loadingClaims}
                  onStatusChange={() => refetchClaims()}
                />
              </Stack>
            )}
          </main>
        </div>
      </div>
    </PageContainer>
  );
};

export default Disbursement;
