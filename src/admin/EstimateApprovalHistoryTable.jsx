import React from "react";

export default function EstimateApprovalHistoryTable({ data = [], columns = [] }) {
  return (
    <div className="w-full border rounded-xl shadow-sm bg-white overflow-hidden">
      {/* Header */}
      <div className="grid grid-cols-12 bg-gray-100 border-b sticky top-0 z-10">
        {columns.map((col, idx) => (
          <div
            key={idx}
            className="p-3 font-semibold text-sm text-gray-700 border-r last:border-r-0 col-span-3"
          >
            {col.title}
          </div>
        ))}
      </div>

      {/* Scrollable Body */}
      <div className="max-h-[350px] overflow-y-auto">
        {data && data.length > 0 ? (
          data.map((row, rowIndex) => (
            <div
              key={rowIndex}
              className="grid grid-cols-12 border-b hover:bg-gray-50 transition"
            >
              {columns.map((col, colIndex) => (
                <div
                  key={colIndex}
                  className="p-3 text-sm text-gray-700 border-r last:border-r-0 col-span-3"
                >
                  {row[col.dataIndex] !== undefined
                    ? row[col.dataIndex]
                    : "-"}
                </div>
              ))}
            </div>
          ))
        ) : (
          <div className="p-4 text-center text-gray-500">No Data Available</div>
        )}
      </div>
    </div>
  );
}
