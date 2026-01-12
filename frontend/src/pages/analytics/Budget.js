import React from "react";
import { Wallet, TrendingUp, MapPin, Layers, Calendar } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

import { PageContainer, PageHeader } from "../../components/DesignSystem";

import {
  AnalyticsGrid,
  AnalyticsStack,
  AnalyticsStatCard,
  AnalyticsChartCard,
  AnalyticsTable,
  TableHeader,
  TableHeaderCell,
  TableBody,
  TableRow,
  TableCell,
  ChartContainer,
} from "../../components/AnalyticsComponents";

import { api } from "../../services/api";

// ---------------- API CALLS ----------------

const fetchBudgetOverview = async () => {
  const { data } = await api.get("/analytics/budget/overview/");
  return data;
};

const fetchBudgetTrends = async () => {
  const { data } = await api.get("/analytics/budget/trends/");
  return data;
};

const fetchBudgetByBatch = async () => {
  const { data } = await api.get("/analytics/budget/batch/");
  return data;
};

// ---------------- PAGE ----------------

export default function Budget() {
  const { data: overview, isLoading: loadingOverview } = useQuery({
    queryKey: ["budget-overview"],
    queryFn: fetchBudgetOverview,
  });

  const { data: trends, isLoading: loadingTrends } = useQuery({
    queryKey: ["budget-trends"],
    queryFn: fetchBudgetTrends,
  });

  const { data: batches, isLoading: loadingBatches } = useQuery({
    queryKey: ["budget-batches"],
    queryFn: fetchBudgetByBatch,
  });

  return (
    <PageContainer>
      <AnalyticsStack spacing="lg">
        {/* HEADER */}
        <PageHeader
          icon={Wallet}
          title="Budget Analytics"
          subtitle="Financial utilization, claims, and disbursement insights"
        />

        {/* KPI OVERVIEW */}
        <AnalyticsGrid cols={{ default: 1, sm: 2, lg: 4 }}>
          <AnalyticsStatCard
            icon={Wallet}
            title="Total Budget"
            value={`₱${overview?.total_budget?.toLocaleString() || "0"}`}
            isLoading={loadingOverview}
          />
          <AnalyticsStatCard
            icon={TrendingUp}
            title="Claimed Amount"
            value={`₱${overview?.total_claimed?.toLocaleString() || "0"}`}
            subtitle="Utilized funds"
            isLoading={loadingOverview}
            color="green"
          />
          <AnalyticsStatCard
            icon={Layers}
            title="Unclaimed Amount"
            value={`₱${overview?.total_unclaimed?.toLocaleString() || "0"}`}
            isLoading={loadingOverview}
            color="yellow"
          />
          <AnalyticsStatCard
            icon={Calendar}
            title="Claim Rate"
            value={`${overview?.claim_rate || 0}%`}
            subtitle="Beneficiaries claimed"
            isLoading={loadingOverview}
            color="purple"
          />
        </AnalyticsGrid>

        {/* TRENDS */}
        <AnalyticsChartCard
          icon={TrendingUp}
          title="Budget Trends"
          subtitle="Monthly allocation vs claimed"
          isLoading={loadingTrends}
        >
          <ChartContainer height={280}>
            {/* Recharts line chart goes here next */}
            <div className="flex items-center justify-center h-full text-gray-400 text-sm">
              Chart placeholder
            </div>
          </ChartContainer>
        </AnalyticsChartCard>

        {/* BY BATCH TABLE */}
        <AnalyticsChartCard
          icon={Layers}
          title="Disbursement Batches"
          subtitle="Allocation and claim performance by batch"
          isLoading={loadingBatches}
        >
          <AnalyticsTable>
            <TableHeader>
              <TableHeaderCell>Batch</TableHeaderCell>
              <TableHeaderCell>Payout Date</TableHeaderCell>
              <TableHeaderCell>Total Allocated</TableHeaderCell>
              <TableHeaderCell>Claimed</TableHeaderCell>
              <TableHeaderCell>Claim Rate</TableHeaderCell>
            </TableHeader>
            <TableBody>
              {batches?.data?.map((row, idx) => (
                <TableRow key={idx}>
                  <TableCell>{row.batch_name}</TableCell>
                  <TableCell>{row.payout_date}</TableCell>
                  <TableCell>₱{row.total_allocated.toLocaleString()}</TableCell>
                  <TableCell>₱{row.total_claimed.toLocaleString()}</TableCell>
                  <TableCell>{row.claim_rate.toFixed(1)}%</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </AnalyticsTable>
        </AnalyticsChartCard>
      </AnalyticsStack>
    </PageContainer>
  );
}
