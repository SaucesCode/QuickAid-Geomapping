import { Card, H2, Caption, GradientButton } from "../../../components/DesignSystem";
import { CheckCircle } from "lucide-react";

const BatchSummary = ({ batch }) => (
  <Card className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-l-4 border-l-blue-600">
    <div>
      <Caption className="uppercase tracking-widest font-semibold text-blue-600">
        Active Batch
      </Caption>
      <H2>{batch.assistance_type}</H2>
      <Caption>
        ID: {batch.id} • Created: {new Date(batch.created_at).toLocaleDateString()}
      </Caption>
    </div>
    <div className="text-left md:text-right">
      <Caption className="font-medium">Total Disbursement</Caption>
      <div className="text-3xl font-bold text-gray-800">
        ₱{Number(batch.total_amount).toLocaleString()}
      </div>
    </div>
  </Card>
);

export default BatchSummary;
