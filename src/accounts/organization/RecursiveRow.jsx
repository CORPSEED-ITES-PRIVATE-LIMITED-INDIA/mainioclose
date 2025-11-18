import React from "react";

const RecursiveRow = ({ item, level = 0, inrCurrency }) => {
  const isParent = Array.isArray(item?.data);

  return (
    <>
      {/* Parent Section Title */}
      {isParent ? (
        <tr>
          <td
            colSpan="3"
            className={`pt-6 pb-2 px-3 font-bold text-lg text-gray-900`}
            style={{ paddingLeft: `${level * 20}px` }}
          >
            {item.title}
          </td>
        </tr>
      ) : (
        /* Normal data row */
        <tr className="hover:bg-gray-50 transition">
          <td
            className="py-2 px-3 text-gray-900"
            style={{ paddingLeft: `${level * 20}px` }}
          >
            {item.title}
          </td>

          <td className="py-2 px-3 text-right text-gray-700">
            {inrCurrency(item.totalPreviousAmount)}
          </td>

          <td className="py-2 px-3 text-right text-gray-700">
            {inrCurrency(item.totalCurrentAmount)}
          </td>
        </tr>
      )}

      {/* Recursive children */}
      {isParent &&
        item.data.map((child, idx) => (
          <RecursiveRow
            key={idx}
            item={child}
            level={level + 1}
            inrCurrency={inrCurrency}
          />
        ))}
    </>
  );
};

export default RecursiveRow
