import React, { useState } from "react";
import { Search, Calendar, ChevronRight, CheckCircle2, Clock } from "lucide-react";
import { Badge, BodyText } from "../../../components/DesignSystem";
import { format } from "date-fns"; // Recommended for date formatting

const BatchList = ({ batches, selectedBatch, onSelectBatch }) => {
  const [searchTerm, setSearchTerm] = useState("");

  // Filter batches based on assistance type or status
  const filteredBatches = batches.filter(
    batch =>
      batch.assistance_type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      batch.batch_number?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full">
      {/* Search Bar */}
      <div className="p-4 border-b bg-white">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search batches..."
            className="w-full pl-10 pr-4 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Batch List Item Container */}
      <div className="flex-1 overflow-y-auto max-h-[calc(100vh-300px)] custom-scrollbar">
        {filteredBatches.length === 0 ? (
          <div className="p-8 text-center text-gray-400">
            <BodyText size="sm">No batches found</BodyText>
          </div>
        ) : (
          <div className="divide-y">
            {filteredBatches.map(batch => {
              const isActive = selectedBatch?.id === batch.id;
              const isClosed = batch.status === "CLOSED";

              return (
                <button
                  key={batch.id}
                  onClick={() => onSelectBatch(batch)}
                  className={`w-full text-left p-4 transition-all duration-200 flex items-center justify-between group
                    ${
                      isActive
                        ? "bg-blue-50 border-l-4 border-l-blue-600"
                        : "hover:bg-gray-50 border-l-4 border-l-transparent"
                    }
                  `}
                >
                  <div className="space-y-1 overflow-hidden">
                    <div className="flex items-center gap-2">
                      <span
                        className={`font-bold truncate ${
                          isActive ? "text-blue-700" : "text-gray-900"
                        }`}
                      >
                        {batch.assistance_type}
                      </span>
                      {isClosed ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-gray-400" />
                      ) : (
                        <Clock className="w-3.5 h-3.5 text-green-500 animate-pulse" />
                      )}
                    </div>

                    <div className="flex items-center gap-3 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {batch.created_at
                          ? format(new Date(batch.created_at), "MMM dd, yyyy")
                          : "N/A"}
                      </span>
                      <span>•</span>
                      <span className="font-mono uppercase">
                        {batch.batch_number || `#${batch.id}`}
                      </span>
                    </div>

                    <div className="pt-1">
                      <Badge
                        variant={isClosed ? "secondary" : "success"}
                        className="text-[10px] uppercase tracking-wider"
                      >
                        {batch.status}
                      </Badge>
                    </div>
                  </div>

                  <ChevronRight
                    className={`w-4 h-4 transition-transform 
                      ${
                        isActive
                          ? "text-blue-600 translate-x-1"
                          : "text-gray-300 group-hover:text-gray-400"
                      }
                    `}
                  />
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default BatchList;
