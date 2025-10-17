import React from "react";

const StatusDisplay = ({ type = "notfound", message }) => {
  const renderContent = () => {
    switch (type) {
      case "notfound":
        return (
          <>
            <div className="w-40 h-40 mb-4 text-gray-400">
              {/* 404 Page Not Found SVG */}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 64 64"
                className="w-full h-full"
                fill="none"
              >
                <circle
                  cx="32"
                  cy="32"
                  r="30"
                  stroke="#9ca3af"
                  strokeWidth="3"
                />
                <text
                  x="50%"
                  y="50%"
                  dominantBaseline="middle"
                  textAnchor="middle"
                  fontSize="16"
                  fontWeight="bold"
                  fill="#9ca3af"
                >
                  404
                </text>
              </svg>
            </div>
            <h2 className="text-2xl font-semibold text-gray-700">
              {message || "Page Not Found"}
            </h2>
            <p className="text-gray-500 mt-2">
              Sorry, we couldn’t find the page you’re looking for.
            </p>
          </>
        );

      case "nodata":
        return (
          <>
            <div className="w-36 h-36 mb-4 text-gray-400">
              {/* No Data SVG */}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 64 64"
                className="w-full h-full"
                fill="none"
              >
                <rect
                  x="8"
                  y="10"
                  width="48"
                  height="44"
                  rx="3"
                  stroke="#9ca3af"
                  strokeWidth="2"
                />
                <line
                  x1="8"
                  y1="22"
                  x2="56"
                  y2="22"
                  stroke="#9ca3af"
                  strokeWidth="2"
                />
                <circle
                  cx="20"
                  cy="36"
                  r="4"
                  stroke="#9ca3af"
                  strokeWidth="2"
                />
                <path
                  d="M28 44H48"
                  stroke="#9ca3af"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-semibold text-gray-700">
              {message || "No Data Available"}
            </h2>
            <p className="text-gray-500 mt-2">
              Try adjusting your filters or add new records.
            </p>
          </>
        );

      case "loading":
        return (
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full animate-spin mb-4" />
            <h2 className="text-lg font-medium text-gray-700">
              {message || "Loading... Please wait"}
            </h2>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col items-center justify-center w-full h-full text-center p-4 select-none">
      {renderContent()}
    </div>
  );
};

export default StatusDisplay;
