const BatchList = ({ batches, selectedBatch, onSelectBatch }) => {
  return (
    <div className="p-4">
      <h2 className="font-semibold text-lg mb-4">Disbursement Batches</h2>

      <div className="space-y-2">
        {batches.map(batch => {
          const isActive = selectedBatch?.id === batch.id;

          return (
            <div
              key={batch.id}
              onClick={() => onSelectBatch(batch)}
              className={`p-3 rounded border cursor-pointer transition
                ${isActive ? "bg-indigo-50 border-indigo-400" : "hover:bg-gray-100"}
              `}
            >
              <div className="font-medium">{batch.assistance_type}</div>

              <div className="text-sm text-gray-500">Status: {batch.status}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default BatchList;
