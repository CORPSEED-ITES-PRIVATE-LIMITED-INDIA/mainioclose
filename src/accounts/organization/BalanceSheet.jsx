import React, { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getAllBalanceSheetDetail } from "../../toolkit/slices/organizationSlice";
import { inrCurrency } from "../../common";
import dayjs from "dayjs";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

function parseNumber(v) {
  if (v === null || v === undefined || v === "") return 0;
  if (typeof v === "number") return v;
  const cleaned = String(v)
    .replace(/,/g, "")
    .replace(/[^0-9.-]/g, "");
  const parsed = parseFloat(cleaned);
  return Number.isFinite(parsed) ? parsed : 0;
}

function toAlpha(num) {
  let s = "";
  while (num > 0) {
    const mod = (num - 1) % 26;
    s = String.fromCharCode(65 + mod) + s;
    num = Math.floor((num - 1) / 26);
  }
  return s;
}

function toRoman(num) {
  const romans = [
    [1000, "M"],
    [900, "CM"],
    [500, "D"],
    [400, "CD"],
    [100, "C"],
    [90, "XC"],
    [50, "L"],
    [40, "XL"],
    [10, "X"],
    [9, "IX"],
    [5, "V"],
    [4, "IV"],
    [1, "I"],
  ];
  let res = "";
  let n = Math.floor(num);
  if (n <= 0) return String(num);
  for (const [val, sym] of romans) {
    while (n >= val) {
      res += sym;
      n -= val;
    }
  }
  return res || String(num);
}

function getSerial(level, index) {
  if (level === 1) return `${toAlpha(index)}.`;
  if (level === 2) return `${toRoman(index)}.`;
  if (level === 3) return `${index}.`;
  if (level === 4) return `${String.fromCharCode(96 + index)}.`; // a.
  if (level === 5) return `${toRoman(index).toLowerCase()}.`;
  return `${index}.`;
}

function getCurrent(node) {
  if (node.totalCurrentAmount !== undefined && node.totalCurrentAmount !== null)
    return node.totalCurrentAmount;
  if (node.price !== undefined && node.price !== null) return node.price;
  return "";
}
function getPrevious(node) {
  if (
    node.totalPreviousAmount !== undefined &&
    node.totalPreviousAmount !== null
  )
    return node.totalPreviousAmount;
  return "";
}

function computeTotals(node) {
  if (!node) return { current: 0, previous: 0 };
  if (
    node.totalCurrLiabilities !== undefined ||
    node.totalPrevLiabilities !== undefined
  ) {
    return {
      current: parseNumber(node.totalCurrLiabilities),
      previous: parseNumber(node.totalPrevLiabilities),
    };
  }

  if (
    node.totalCurrAssets !== undefined ||
    node.totalPrevAssets !== undefined
  ) {
    return {
      current: parseNumber(node.totalCurrAssets),
      previous: parseNumber(node.totalPrevAssets),
    };
  }

  if (node.total !== undefined || node.totalCurrAssets !== undefined) {
    return {
      current: parseNumber(node.total ?? node.totalCurrAssets ?? 0),
      previous: parseNumber(
        node.totalPrevAssets ?? node.totalPrevLiabilities ?? 0
      ),
    };
  }

  if (!node.data || !Array.isArray(node.data)) {
    return {
      current: parseNumber(getCurrent(node)),
      previous: parseNumber(getPrevious(node)),
    };
  }

  let currSum = 0;
  let prevSum = 0;
  for (const child of node.data) {
    const t = computeTotals(child);
    currSum += t.current;
    prevSum += t.previous;
  }
  return { current: currSum, previous: prevSum };
}

const BalanceSheet = () => {
  const dispatch = useDispatch();
  const today = dayjs().format("YYYY-MM-DD");
  const balanceSheetDetails = useSelector(
    (s) => s.organization?.balanceSheetDetail
  );

  useEffect(() => {
    dispatch(getAllBalanceSheetDetail());
  }, [dispatch]);

  const containerRef = useRef(null);

  const exportPDF = async () => {
    const input = containerRef.current;
    if (!input) return;
    const canvas = await html2canvas(input, { scale: 2 });
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF("p", "mm", "a4");
    const pdfWidth = 210; // mm
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
    pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
    pdf.save("balance-sheet.pdf");
  };

const renderNode = (node, level = 1, index = 1, path = "") => {
  if (!node) return null;

  // If node contains children → treat as group
  const isGroup = node.title && Array.isArray(node.data);

  const serial = getSerial(level, index);
  const indentPx = (level - 1) * 20; // increased for better alignment
  const curr = parseNumber(getCurrent(node));
  const prev = parseNumber(getPrevious(node));

  // ---------------------------
  // GROUP NODE (with children)
  // ---------------------------
  if (isGroup) {
    return (
      <React.Fragment key={path + node.title}>
        <tr>
          <td
            colSpan={4}
            className="bg-gray-100 border px-3 py-2 font-semibold"
            style={{ paddingLeft: `${indentPx}px` }}
          >
            <span className="mr-2 font-semibold">{serial}</span>
            <span className="font-semibold">{node.title}</span>
          </td>
        </tr>

        {node.data.map((child, idx) =>
          renderNode(child, Math.min(level + 1, 5), idx + 1, `${path}-${idx}`)
        )}
      </React.Fragment>
    );
  }

  // ---------------------------
  // LEAF NODE (no children)
  // ---------------------------
  return (
    <tr key={path + node.title} className="border-b">
      <td
        className="px-3 py-2 flex items-center gap-2"
        style={{
          paddingLeft: `${indentPx}px`,
          fontWeight: 400,     // title not bold
        }}
      >
        <span className="font-semibold">{serial}</span>
        <span className="font-normal">{node.title}</span>
      </td>

      <td className="px-3 py-2 text-center"></td>

      <td className="px-3 py-2 text-center">{inrCurrency(curr)}</td>
      <td className="px-3 py-2 text-center">{inrCurrency(prev)}</td>
    </tr>
  );
};


  return (
    <div className="p-4 bg-gray-50 flex flex-col items-center">
      <div
        ref={containerRef}
        className="w-full bg-white p-6 rounded shadow max-h-[70vh] overflow-auto"
      >
        <h2 className="text-center text-xl font-bold mb-1">
          Corpseed Ites Private Limited
        </h2>
        <h3 className="text-center font-semibold">Balance Sheet</h3>
        <h4 className="text-center mb-6 text-sm text-gray-600">
          as at {today}
        </h4>

        <table className="w-full border-collapse border border-gray-300 text-sm">
          <thead>
            <tr>
              <th className="border p-2 text-left">Particulars</th>
              <th className="border p-2 text-center">Note No.</th>
              <th className="border p-2 text-center">Current Period</th>
              <th className="border p-2 text-center">Previous Period</th>
            </tr>
          </thead>

          <tbody>
            {balanceSheetDetails?.length > 0 &&
              balanceSheetDetails?.map((section, sIdx) => {
                const totals = computeTotals(section);
                return (
                  <React.Fragment key={`section-${sIdx}`}>
                    <tr>
                      <td
                        colSpan={4}
                        className="bg-gray-200 font-bold border px-3 py-2"
                      >
                        <span className="mr-2">{getSerial(1, sIdx + 1)}</span>
                        {section?.title ||
                          (sIdx === 0 ? "EQUITY AND LIABILITIES" : "ASSETS")}
                      </td>
                    </tr>

                    {Array.isArray(section?.data)
                      ? section?.data?.map((node, idx) =>
                          renderNode(node, 2, idx + 1, `s${sIdx}n${idx}`)
                        )
                      : null}
                    <tr>
                      <td
                        className="px-3 py-2 font-semibold"
                        style={{ paddingLeft: "16px" }}
                      >
                        Total {section?.title}
                      </td>
                      <td className="px-3 py-2 text-center font-semibold" />
                      <td className="px-3 py-2 text-center font-semibold">
                        {inrCurrency(totals?.current)}
                      </td>
                      <td className="px-3 py-2 text-center font-semibold">
                        {inrCurrency(totals?.previous)}
                      </td>
                    </tr>
                  </React.Fragment>
                );
              })}
          </tbody>
        </table>

        <p className="mt-4 text-xs text-gray-500">
          Note: Note numbers are intentionally blank. Totals are computed
          dynamically by the component (explicit total keys are honored if
          present).
        </p>
      </div>

      <div className="w-full mt-2 flex justify-center">
        <button
          onClick={exportPDF}
          className="px-4 py-2 bg-blue-600 text-white rounded shadow cursor-pointer"
        >
          Export as PDF
        </button>
      </div>
    </div>
  );
};

export default BalanceSheet;
