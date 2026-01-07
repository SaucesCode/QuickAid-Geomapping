import { api } from "../../../services/api";

const ApprovalSelector = ({ batch, onAttached }) => {
  const handleApproval = async () => {
    try {
      // Example API call to approve the batch
      await api.post(`/disbursement/batch/${batch.id}/approve/`);
      onAttached(); // Refresh the parent state
    } catch (err) {
      console.error("Approval failed", err);
    }
  };

  return (
    <div className="bg-indigo-50 border border-indigo-100 p-4 rounded-lg mb-6 flex justify-between items-center">
      <p className="text-indigo-800 text-sm">
        <strong>Action Required:</strong> Please verify all claims before finalizing this
        disbursement.
      </p>
      <button
        onClick={handleApproval}
        className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition"
      >
        Approve Batch
      </button>
    </div>
  );
};

export default ApprovalSelector;
