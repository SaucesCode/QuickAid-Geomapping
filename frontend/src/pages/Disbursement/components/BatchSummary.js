import {
  Card,
  H2,
  Caption,
  GradientButton,
  Badge,
  Stack,
} from "../../../components/DesignSystem";
import { CheckCircle, Lock, Calendar, Hash } from "lucide-react";

const BatchSummary = ({ batch, isClosing, onCloseBatch }) => {
  const isOpen = batch.status === "OPEN";

  return (
    <Card
      className={`relative overflow-hidden border-l-4 ${
        isOpen ? "border-l-blue-600" : "border-l-green-600"
      }`}
    >
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        {/* Left Side: Identity */}
        <Stack spacing="xs">
          <div className="flex items-center gap-2">
            <Badge variant={isOpen ? "success" : "secondary"}>{batch.status}</Badge>
            <Caption className="uppercase tracking-widest font-semibold text-gray-500">
              Disbursement Batch
            </Caption>
          </div>

          <H2 className="text-2xl font-bold">{batch.assistance_type}</H2>

          <div className="flex flex-wrap gap-4 mt-1">
            <div className="flex items-center gap-1 text-gray-500">
              <Hash className="w-3 h-3" />
              <Caption>Batch #{batch.id}</Caption>
            </div>
            <div className="flex items-center gap-1 text-gray-500">
              <Calendar className="w-3 h-3" />
              <Caption>{new Date(batch.created_at).toLocaleDateString()}</Caption>
            </div>
          </div>
        </Stack>

        {/* Right Side: Financials & Actions */}
        <div className="flex flex-col md:items-end gap-4 w-full md:w-auto">
          <div className="text-left md:text-right">
            <Caption className="font-medium text-gray-500">Total Allocated</Caption>
            <div className="text-3xl font-black text-gray-900">
              ₱
              {Number(batch.total_amount || 0).toLocaleString(undefined, {
                minimumFractionDigits: 2,
              })}
            </div>
          </div>

          {isOpen ? (
            <GradientButton
              size="sm"
              onClick={() => {
                if (
                  window.confirm(
                    "Are you sure you want to close this batch? No further claims can be modified."
                  )
                ) {
                  onCloseBatch();
                }
              }}
              loading={isClosing}
              icon={CheckCircle}
            >
              Finalize & Close Batch
            </GradientButton>
          ) : (
            <div className="flex items-center gap-2 text-green-600 bg-green-50 px-3 py-1.5 rounded-full border border-green-100">
              <Lock className="w-4 h-4" />
              <span className="text-sm font-bold uppercase tracking-tight">
                Records Locked
              </span>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};

export default BatchSummary;
