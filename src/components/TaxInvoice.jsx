import React, { memo, useEffect, useMemo, useRef, useState } from "react";
import logo from "../assets/CORPSEED.webp";
import signature from "../assets/signature.png";
import html2canvas from "html2canvas-pro";
import jsPDF from "jspdf";
import dayjs from "dayjs";
import numWords from "num-words";
import { inrCurrency } from "../common";
import { useDispatch, useSelector } from "react-redux";
import { getOrganizationByName } from "../toolkit/slices/organizationSlice";

/** -------------------------
 * PDF / Layout constants
 * ------------------------- */
const PDF_MARGIN_MM = 10; // ✅ real PDF margins
const A4_W_MM = 210;
const A4_H_MM = 297;
const CONTENT_W_MM = A4_W_MM - PDF_MARGIN_MM * 2; // 190mm

/** -------------------------
 * Helpers
 * ------------------------- */
const toNumber = (v) => {
  if (v === null || v === undefined || v === "") return 0;
  const n = typeof v === "string" ? Number(v) : v;
  return Number.isFinite(n) ? n : 0;
};

const formatINR = (value) => {
  const n = toNumber(value);
  return n.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

const splitRupeePaise = (value) => {
  const n = toNumber(value);
  const rupees = Math.floor(n);
  const paise = Math.round((n - rupees) * 100);
  return { rupees, paise };
};

const amountToWordsINR = (value) => {
  const { rupees, paise } = splitRupeePaise(value);
  const r = String(numWords(rupees)).toUpperCase();
  if (paise > 0) {
    const p = String(numWords(paise)).toUpperCase();
    return `${r} RUPEES AND ${p} PAISE ONLY`;
  }
  return `${r} RUPEES ONLY`;
};

const percentStr = (v) => {
  const n = toNumber(v);
  if (!Number.isFinite(n) || n <= 0) return "";
  return n % 1 === 0 ? `${n}%` : `${n.toFixed(2)}%`;
};

// ✅ show GST half rates like "5% / 9%" when multiple rates exist
const getHalfGstRatesLabel = (items = []) => {
  const unique = Array.from(
    new Set(
      (items || [])
        .map((x) => toNumber(x?.gstRate))
        .filter((r) => Number.isFinite(r) && r > 0),
    ),
  ).sort((a, b) => a - b);

  if (unique.length === 0) return "";
  return unique.map((r) => percentStr(r / 2)).join(" / ");
};

const getFullGstRatesLabel = (items = []) => {
  const unique = Array.from(
    new Set(
      (items || [])
        .map((x) => toNumber(x?.gstRate))
        .filter((r) => Number.isFinite(r) && r > 0),
    ),
  ).sort((a, b) => a - b);

  if (unique.length === 0) return "";
  return unique.map((r) => percentStr(r)).join(" / ");
};

const buildTaxSummaryRows = (lineItems = []) => {
  const map = new Map();

  for (const it of lineItems) {
    const hsn = it?.hsnSacCode || "";
    const rate = toNumber(it?.gstRate);
    const key = `${hsn}__${rate}`;

    const taxable = toNumber(it?.lineTotalExGst);
    const cgstAmt = toNumber(it?.cgstAmount);
    const sgstAmt = toNumber(it?.sgstAmount);
    const igstAmt = toNumber(it?.igstAmount);

    if (!map.has(key)) {
      map.set(key, {
        hsn,
        taxableValue: 0,

        cgstRate: cgstAmt > 0 && rate ? rate / 2 : 0,
        cgstAmount: 0,

        sgstRate: sgstAmt > 0 && rate ? rate / 2 : 0,
        sgstAmount: 0,

        igstRate: rate > 0 ? rate : 0,
        igstAmount: 0,

        totalTax: 0,
      });
    }

    const row = map.get(key);

    row.taxableValue += taxable;
    row.cgstAmount += cgstAmt;
    row.sgstAmount += sgstAmt;
    row.igstAmount += cgstAmt + sgstAmt;
    row.totalTax += cgstAmt + sgstAmt + igstAmt;
  }

  return Array.from(map.values());
};

/** -------------------------
 * Component
 * ------------------------- */
const TaxInvoice = ({ invoiceData, heading }) => {
  const dispatch = useDispatch();
  const printRef = useRef(null);
  const [copyText, setCopyText] = useState("Copy URL");
  const organizationDetail = useSelector(
    (state) => state.organization.organizationDetail,
  );

  useEffect(() => {
    dispatch(getOrganizationByName());
  }, [dispatch]);

  const seller = useMemo(() => {
    if (!organizationDetail) return null;

    return {
      name: organizationDetail?.name || "",
      addressLine1:
        `${organizationDetail?.addressLine1}, ${organizationDetail?.city}, ${organizationDetail?.state}, ${organizationDetail?.country} - ${organizationDetail?.pinCode}` ||
        "",
      gstin: organizationDetail?.gstNo || "",
      stateName: organizationDetail?.state || "",
      stateCode: organizationDetail?.gstNo?.slice(0, 2) || "",
      email: organizationDetail?.email || "",
      bankName: organizationDetail?.bankName || "",
      accountNo: organizationDetail?.accountNo || "",
      branchIfsc: `${organizationDetail?.ifscCode || ""} & ${
        organizationDetail?.ifscCode || ""
      }`,
    };
  }, [organizationDetail]);

  // invoiceData can be object OR JSON string
  const inv = useMemo(() => {
    if (!invoiceData) return {};
    if (typeof invoiceData === "string") {
      try {
        return JSON.parse(invoiceData);
      } catch (e) {
        console.error("Invalid invoiceData JSON string:", e);
        return {};
      }
    }
    return invoiceData;
  }, [invoiceData]);

  // lineItems safe + sort
  const items = useMemo(() => {
    const arr = Array.isArray(inv?.lineItems) ? inv.lineItems : [];
    return [...arr].sort(
      (a, b) => toNumber(a?.displayOrder) - toNumber(b?.displayOrder),
    );
  }, [inv]);

  const taxSummaryRows = useMemo(() => buildTaxSummaryRows(items), [items]);

  const subTotalExGst = toNumber(inv?.subTotalExGst);
  const igstAmount = toNumber(inv?.igstAmount);
  const cgstAmount = toNumber(inv?.cgstAmount);
  const sgstAmount = toNumber(inv?.sgstAmount);
  const totalGstAmount = toNumber(inv?.totalGstAmount);
  const grandTotal = toNumber(inv?.grandTotal);

  const halfRatesLabel = useMemo(() => getHalfGstRatesLabel(items), [items]);
  const fullRatesLabel = useMemo(() => getFullGstRatesLabel(items), [items]);

  const getShareUrl = () => {
    return window.location.href;
  };

  const handleCopyUrl = async () => {
    try {
      const url = getShareUrl();

      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(url);
      } else {
        const input = document.createElement("input");
        input.value = url;
        document.body.appendChild(input);
        input.select();
        document.execCommand("copy");
        document.body.removeChild(input);
      }

      setCopyText("Copied!");

      setTimeout(() => {
        setCopyText("Copy URL");
      }, 1500);
    } catch (error) {
      console.error("URL copy failed:", error);
      setCopyText("Failed");
    }
  };

  const handlePrint = () => {
    const node = printRef.current;
    if (!node) return;

    const printWindow = window.open("", "_blank", "width=1100,height=800");
    if (!printWindow) return;

    printWindow.document.write(`
    <html>
      <head>
        <title>${heading || "Tax Invoice"} - ${inv?.invoiceNumber || ""}</title>

        <style>
          * {
            box-sizing: border-box;
          }

          body {
            margin: 0;
            padding: 16px;
            font-family: Arial, sans-serif;
            background: #ffffff;
            color: #111827;
          }

          img {
            max-width: 120px;
          }

          table {
            width: 100%;
            border-collapse: collapse;
            table-layout: fixed;
          }

          th,
          td {
            border: 1px solid #d1d5db;
            padding: 5px;
            font-size: 11px;
            vertical-align: top;
          }

          th {
            background: #f3f4f6;
            font-weight: 700;
          }

          p {
            margin: 0 0 4px 0;
          }

          .invoice-print-page {
            width: 190mm !important;
            margin: 0 auto !important;
            background: #ffffff !important;
          }

          .grid {
            display: grid !important;
          }

          .grid-cols-2 {
            grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
          }

          .grid-cols-\\[1\\.2fr_1fr\\] {
            grid-template-columns: 1.2fr 1fr !important;
          }

          .border {
            border: 1px solid #d1d5db !important;
          }

          .border-b {
            border-bottom: 1px solid #d1d5db !important;
          }

          .border-r {
            border-right: 1px solid #d1d5db !important;
          }

          .border-t {
            border-top: 1px solid #d1d5db !important;
          }

          .text-center {
            text-align: center !important;
          }

          .text-right {
            text-align: right !important;
          }

          .font-bold {
            font-weight: 700 !important;
          }

          .font-semibold {
            font-weight: 600 !important;
          }

          .font-extrabold {
            font-weight: 800 !important;
          }

          .bg-gray-50,
          .bg-gray-100 {
            background: #f3f4f6 !important;
          }

          .bg-white {
            background: #ffffff !important;
          }

          .text-gray-500 {
            color: #6b7280 !important;
          }

          .text-gray-900 {
            color: #111827 !important;
          }

          .p-2\\.5 {
            padding: 10px !important;
          }

          .p-3 {
            padding: 12px !important;
          }

          .px-2\\.5 {
            padding-left: 10px !important;
            padding-right: 10px !important;
          }

          .py-2 {
            padding-top: 8px !important;
            padding-bottom: 8px !important;
          }

          .pb-2 {
            padding-bottom: 8px !important;
          }

          .pt-3 {
            padding-top: 12px !important;
          }

          .mb-1 {
            margin-bottom: 4px !important;
          }

          .mt-1 {
            margin-top: 4px !important;
          }

          .leading-snug {
            line-height: 1.35 !important;
          }

          .flex {
            display: flex !important;
          }

          .items-center {
            align-items: center !important;
          }

          .justify-end {
            justify-content: flex-end !important;
          }

          .gap-2 {
            gap: 8px !important;
          }

          .gap-3 {
            gap: 12px !important;
          }

          @page {
            size: A4;
            margin: 10mm;
          }

          @media print {
            body {
              padding: 0;
              print-color-adjust: exact;
              -webkit-print-color-adjust: exact;
            }

            .invoice-print-page {
              width: 190mm !important;
              margin: 0 auto !important;
            }
          }
        </style>
      </head>

      <body>
        <div class="invoice-print-page">
          ${node.innerHTML}
        </div>
      </body>
    </html>
  `);

    printWindow.document.close();

    printWindow.onload = () => {
      printWindow.focus();
      printWindow.print();
      printWindow.close();
    };
  };

  const handleShareViaEmail = () => {
    const invoiceNo = inv?.invoiceNumber || "Invoice";

    const subject = encodeURIComponent(
      `${heading || "Tax Invoice"} - ${invoiceNo}`,
    );

    const body = encodeURIComponent(
      `Dear Sir/Ma'am,

Please find the ${heading || "Tax Invoice"} details below:

Invoice No.: ${invoiceNo}
Invoice Date: ${
        inv?.invoiceDate ? dayjs(inv.invoiceDate).format("DD-MM-YYYY") : "NA"
      }
Amount: ${inrCurrency(formatINR(grandTotal))}
URL: ${getShareUrl()}

Regards,
Corpseed Team`,
    );

    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  };

  /** ✅ Single-page PDF + Real margins + smoother text */
  const downloadPDF = async () => {
    const node = printRef.current;
    if (!node) return;

    // Ensure fonts/layout are settled before capture
    await new Promise((r) => setTimeout(r, 100));

    const canvas = await html2canvas(node, {
      scale: 3, // ✅ smoother text (higher DPI)
      useCORS: true,
      allowTaint: true,
      backgroundColor: "#ffffff",
      logging: false,
      // Helps if any width calculations happen due to scrolling:
      windowWidth: node.scrollWidth,
      windowHeight: node.scrollHeight,
    });

    const imgData = canvas.toDataURL("image/png", 1.0);

    const pdf = new jsPDF("p", "mm", "a4");
    const pageW = pdf.internal.pageSize.getWidth(); // 210
    const pageH = pdf.internal.pageSize.getHeight(); // 297

    const maxW = pageW - PDF_MARGIN_MM * 2;
    const maxH = pageH - PDF_MARGIN_MM * 2;

    // Start by fitting width, then clamp to height if needed
    let imgW = maxW;
    let imgH = (canvas.height * imgW) / canvas.width;

    if (imgH > maxH) {
      imgH = maxH;
      imgW = (canvas.width * imgH) / canvas.height;
    }

    const x = (pageW - imgW) / 2; // centered (still keeps margins)
    const y = (pageH - imgH) / 2; // centered vertically
    pdf.addImage(imgData, "PNG", x, y, imgW, imgH, undefined, "FAST");

    pdf.save(`${inv?.invoiceNumber || "invoice"}.pdf`);
  };

  // Forward props so colSpan/rowSpan works
  const TableTh = ({ children, className = "", ...props }) => (
    <th
      {...props}
      className={
        "border border-gray-300 bg-gray-100 px-2 py-1.5 text-[11px] font-semibold text-gray-900 " +
        className
      }
    >
      {children}
    </th>
  );

  const TableTd = ({ children, className = "", ...props }) => (
    <td
      {...props}
      className={
        "border border-gray-300 px-2 py-1.5 text-[11px] text-gray-900 align-top " +
        className
      }
    >
      {children}
    </td>
  );

  return (
    <div className="p-4">
      <div className="sticky top-2 z-30 mb-3 flex justify-center">
        <div className="flex w-fit flex-wrap items-center justify-center gap-2 rounded-full border border-gray-200 bg-white/95 px-3 py-2 shadow-lg backdrop-blur">
          <button
            type="button"
            onClick={handleCopyUrl}
            className="cursor-pointer rounded-full border border-gray-200 bg-gray-50 px-4 py-2 text-xs font-semibold text-gray-700 transition-all hover:bg-gray-100 active:scale-95"
          >
            {copyText}
          </button>

          <button
            type="button"
            onClick={handlePrint}
            className="cursor-pointer rounded-full border border-blue-200 bg-blue-50 px-4 py-2 text-xs font-semibold text-blue-700 transition-all hover:bg-blue-100 active:scale-95"
          >
            Print
          </button>

          <button
            type="button"
            onClick={handleShareViaEmail}
            className="cursor-pointer rounded-full border border-purple-200 bg-purple-50 px-4 py-2 text-xs font-semibold text-purple-700 transition-all hover:bg-purple-100 active:scale-95"
          >
            Share Email
          </button>

          <button
            type="button"
            onClick={downloadPDF}
            className="cursor-pointer rounded-full bg-green-600 px-4 py-2 text-xs font-semibold text-white shadow-sm transition-all hover:bg-green-700 active:scale-95"
          >
            Download PDF
          </button>
        </div>
      </div>

      {/* Screen preview A4 */}
      <div className="mx-auto w-[210mm] bg-gray-50 p-3">
        {/* ✅ IMPORTANT: remove min-h-[297mm] to avoid 2 pages */}
        <div
          ref={printRef}
          className="invoice-print-page antialiased bg-white text-gray-900"
          style={{
            width: `${CONTENT_W_MM}mm`,
            margin: "0 auto",
          }}
        >
          {/* Invoice Heading */}
          <div className="border border-gray-300">
            <div className="border-b border-gray-300 py-2 text-center">
              <div className="text-[16px] font-extrabold tracking-wide">
                {heading ? heading : "TAX INVOICE"}
              </div>
            </div>

            {/* Top grid */}
            <div className="grid grid-cols-[1.2fr_1fr] border-b border-gray-300">
              <div className="border-r border-gray-300 p-3">
                <div className="mb-1 flex items-center gap-2">
                  <img src={logo} alt="corpseed" className="h-10" />
                </div>

                <div className="mb-0.5 text-[12px] font-bold">
                  {seller.name}
                </div>
                <div className="text-[11px] leading-snug">
                  {seller.addressLine1}
                </div>
                <div className="mt-1 text-[11px]">
                  GSTIN/UIN : {seller.gstin}
                </div>
                <div className="text-[11px]">
                  State name : {seller.stateName} , code : {seller.stateCode}
                </div>
                <div className="text-[11px]">E-mail : {seller.email}</div>
              </div>

              <div className="grid auto-rows-min">
                <div className="grid grid-cols-2 border-b border-gray-300">
                  <div className="border-r border-gray-300 p-2.5">
                    <div className="text-[10px] text-gray-500">Invoice no.</div>
                    <div className="text-[11px] font-bold">
                      {inv?.invoiceNumber || "NA"}
                    </div>
                  </div>
                  <div className="p-2.5">
                    <div className="text-[10px] text-gray-500">Dated</div>
                    <div className="text-[11px] font-bold">
                      {inv?.invoiceDate
                        ? dayjs(inv.invoiceDate).format("DD-MM-YYYY")
                        : "NA"}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 border-b border-gray-300">
                  <div className="border-r border-gray-300 p-2.5">
                    <div className="text-[10px] text-gray-500">
                      Mode/Terms of Payment
                    </div>
                    <div className="h-4 text-[11px] font-bold">&nbsp;</div>
                  </div>
                  <div className="p-2.5">
                    <div className="text-[10px] text-gray-500">
                      References No. &amp; Date.
                    </div>
                    <div className="text-[11px] font-bold">
                      {inv?.invoiceDate
                        ? dayjs(inv.invoiceDate).format("DD-MM-YYYY")
                        : "NA"}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 border-b border-gray-300">
                  <div className="border-r border-gray-300 p-2.5">
                    <div className="text-[10px] text-gray-500">
                      Other References
                    </div>
                    <div className="h-4 text-[11px] font-bold">&nbsp;</div>
                  </div>
                  <div className="p-2.5">
                    <div className="text-[10px] text-gray-500">
                      Buyer's Order No.
                    </div>
                    <div className="h-4 text-[11px] font-bold">&nbsp;</div>
                  </div>
                </div>

                <div className="p-2.5">
                  <div className="text-[10px] text-gray-500">
                    Terms of Delivery
                  </div>
                  <div className="h-4 text-[11px] font-bold">&nbsp;</div>
                </div>
              </div>
            </div>

            {/* Consignee + Buyer */}
            <div className="grid grid-cols-2 border-b border-gray-300">
              <div className="border-r border-gray-300 p-2.5">
                <div className="mb-1 text-[11px] font-bold">
                  Consignee (Ship to)
                </div>
                <div className="text-[11px]">{inv?.companyName || "NA"}</div>
                <div className="text-[11px]">
                  GSTIN/UIN : {inv?.buyerGstin || ""}
                </div>
                <div className="text-[11px]">
                  State name : {""} , code :{" "}
                  {inv?.placeOfSupplyStateCode || "29"}
                </div>
                <div className="text-[11px]">
                  E-mail : {inv?.contactName || ""}
                </div>
              </div>

              <div className="p-2.5">
                <div className="mb-1 text-[11px] font-bold">
                  Buyer (Bill to)
                </div>
                <div className="text-[11px]">{inv?.companyName || "NA"}</div>
                <div className="text-[11px]">
                  GSTIN/UIN : {inv?.buyerGstin || ""}
                </div>
                <div className="text-[11px]">
                  State name : {""} , code :{" "}
                  {inv?.placeOfSupplyStateCode || "29"}
                </div>
                <div className="text-[11px]">
                  E-mail : {inv?.contactName || ""}
                </div>
              </div>
            </div>

            {/* Items table */}
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <TableTh className="w-[50px] text-center">S.No</TableTh>
                  <TableTh>Particulars</TableTh>
                  <TableTh className="w-[90px] text-center">HSN/SAC</TableTh>
                  <TableTh className="w-[80px] text-center">Quantity</TableTh>
                  <TableTh className="w-[90px] text-center">Rate</TableTh>
                  <TableTh className="w-[70px] text-center">Per</TableTh>
                  <TableTh className="w-[110px] text-right">Amount (₹)</TableTh>
                </tr>
              </thead>

              <tbody>
                {inv?.solutionName && (
                  <tr className="bg-gray-50">
                    <td className="border p-1 text-center font-medium"></td>
                    <td colSpan={8} className="border p-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-sm font-semibold text-gray-800">
                          {inv.solutionName}
                        </span>
                      </div>
                    </td>
                  </tr>
                )}
                {items.length === 0 ? (
                  <tr>
                    <TableTd className="text-center text-gray-500" colSpan={7}>
                      No line items found
                    </TableTd>
                  </tr>
                ) : (
                  items.map((it, idx) => (
                    <tr key={it?.id ?? idx}>
                      <TableTd className="text-center">{idx + 1}</TableTd>
                      <TableTd>
                        <div className="font-semibold">
                          {it?.itemName || "NA"}
                        </div>
                        {it?.description ? (
                          <div className="mt-0.5 text-[10px] text-gray-500">
                            {it.description}
                          </div>
                        ) : null}
                      </TableTd>
                      <TableTd className="text-center">
                        {it?.hsnSacCode || ""}
                      </TableTd>
                      <TableTd className="text-center">
                        {toNumber(it?.quantity)}
                      </TableTd>
                      <TableTd className="text-right">
                        {inrCurrency(it?.unitPriceExGst)}
                      </TableTd>
                      <TableTd className="text-center">
                        {it?.unit || "NOS"}
                      </TableTd>
                      <TableTd className="text-right">
                        {inrCurrency(it?.lineTotalExGst)}
                      </TableTd>
                    </tr>
                  ))
                )}

                {igstAmount === 0 && (
                  <tr>
                    <TableTd className="text-center">
                      {items.length + 1}
                    </TableTd>
                    <TableTd>CGST</TableTd>
                    <TableTd />
                    <TableTd />
                    <TableTd className="text-right font-semibold">
                      {halfRatesLabel}
                    </TableTd>
                    <TableTd className="text-center">%</TableTd>
                    <TableTd className="text-right">
                      {inrCurrency(cgstAmount)}
                    </TableTd>
                  </tr>
                )}

                {igstAmount === 0 && (
                  <tr>
                    <TableTd className="text-center">
                      {items.length + 2}
                    </TableTd>
                    <TableTd>SGST</TableTd>
                    <TableTd />
                    <TableTd />
                    <TableTd className="text-right font-semibold">
                      {halfRatesLabel}
                    </TableTd>
                    <TableTd className="text-center">%</TableTd>
                    <TableTd className="text-right">
                      {inrCurrency(sgstAmount)}
                    </TableTd>
                  </tr>
                )}

                {cgstAmount === 0 && sgstAmount === 0 && (
                  <tr>
                    <TableTd className="text-center">
                      {items.length + 1}
                    </TableTd>
                    <TableTd>IGST</TableTd>
                    <TableTd />
                    <TableTd />
                    <TableTd className="text-right font-semibold">
                      {fullRatesLabel}
                    </TableTd>
                    <TableTd className="text-center">%</TableTd>
                    <TableTd className="text-right">
                      {inrCurrency(igstAmount)}
                    </TableTd>
                  </tr>
                )}

                <tr>
                  <TableTd />
                  <TableTd className="text-right font-bold" colSpan={5}>
                    Total
                  </TableTd>
                  <TableTd className="text-right font-bold">
                    {inrCurrency(grandTotal)}
                  </TableTd>
                </tr>
              </tbody>
            </table>

            {/* Amount in words */}
            <div className="flex justify-between border-b border-gray-300 px-2.5 py-2">
              <div className="text-[11px] text-gray-600">
                Amount Chargeable (in Words)
              </div>
              <div className="text-[11px] font-bold">
                {amountToWordsINR(grandTotal)}
              </div>
            </div>

            {/* Tax summary table */}
            {/* Tax summary table */}
            {cgstAmount === 0 && sgstAmount === 0 ? (
              <table className="w-full border-collapse">
                <thead>
                  <tr>
                    <TableTh className="text-center" rowSpan={2}>
                      HSN/SAC
                    </TableTh>
                    <TableTh className="text-center" rowSpan={2}>
                      Taxable Value (₹)
                    </TableTh>
                    <TableTh className="text-center" colSpan={2}>
                      IGST
                    </TableTh>
                    <TableTh className="text-center" rowSpan={2}>
                      Total Tax Amount (₹)
                    </TableTh>
                  </tr>

                  <tr>
                    <TableTh className="text-center">Rate (%)</TableTh>
                    <TableTh className="text-center">Amount (₹)</TableTh>
                  </tr>
                </thead>

                {console.log("dsjkgkjsgkj", taxSummaryRows)}
                <tbody>
                  {taxSummaryRows?.map((r, i) => (
                    <tr key={i}>
                      <TableTd className="text-center">{r.hsn}</TableTd>

                      <TableTd className="text-right">
                        {inrCurrency(r.taxableValue)}
                      </TableTd>

                      <TableTd className="text-center">
                        {toNumber(r.igstRate).toFixed(2)}
                      </TableTd>

                      <TableTd className="text-right">
                        {inrCurrency(r.igstAmount)}
                      </TableTd>

                      <TableTd className="text-right">
                        {inrCurrency(r.totalTax)}
                      </TableTd>
                    </tr>
                  ))}

                  <tr>
                    <TableTd className="font-bold">Total</TableTd>

                    <TableTd className="text-right font-bold">
                      {inrCurrency(subTotalExGst)}
                    </TableTd>

                    <TableTd className="text-center">-</TableTd>

                    <TableTd className="text-right font-bold">
                      {inrCurrency(igstAmount)}
                    </TableTd>

                    <TableTd className="text-right font-bold">
                      {inrCurrency(totalGstAmount)}
                    </TableTd>
                  </tr>
                </tbody>
              </table>
            ) : (
              <table className="w-full border-collapse">
                <thead>
                  <tr>
                    <TableTh className="text-center" rowSpan={2}>
                      HSN/SAC
                    </TableTh>
                    <TableTh className="text-center" rowSpan={2}>
                      Taxable Value (₹)
                    </TableTh>
                    <TableTh className="text-center" colSpan={2}>
                      CGST
                    </TableTh>
                    <TableTh className="text-center" colSpan={2}>
                      SGST
                    </TableTh>
                    <TableTh className="text-center" rowSpan={2}>
                      Total Tax Amount (₹)
                    </TableTh>
                  </tr>

                  <tr>
                    <TableTh className="text-center">Rate (%)</TableTh>
                    <TableTh className="text-center">Amount (₹)</TableTh>
                    <TableTh className="text-center">Rate (%)</TableTh>
                    <TableTh className="text-center">Amount (₹)</TableTh>
                  </tr>
                </thead>

                <tbody>
                  {taxSummaryRows.map((r, i) => (
                    <tr key={i}>
                      <TableTd className="text-center">{r.hsn}</TableTd>

                      <TableTd className="text-right">
                        {inrCurrency(r.taxableValue)}
                      </TableTd>

                      <TableTd className="text-center">
                        {toNumber(r.cgstRate).toFixed(2)}
                      </TableTd>

                      <TableTd className="text-right">
                        {inrCurrency(r.cgstAmount)}
                      </TableTd>

                      <TableTd className="text-center">
                        {toNumber(r.sgstRate).toFixed(2)}
                      </TableTd>

                      <TableTd className="text-right">
                        {inrCurrency(r.sgstAmount)}
                      </TableTd>

                      <TableTd className="text-right">
                        {inrCurrency(r.totalTax)}
                      </TableTd>
                    </tr>
                  ))}

                  <tr>
                    <TableTd className="font-bold">Total</TableTd>

                    <TableTd className="text-right font-bold">
                      {inrCurrency(subTotalExGst)}
                    </TableTd>

                    <TableTd className="text-center">-</TableTd>

                    <TableTd className="text-right font-bold">
                      {inrCurrency(cgstAmount)}
                    </TableTd>

                    <TableTd className="text-center">-</TableTd>

                    <TableTd className="text-right font-bold">
                      {inrCurrency(sgstAmount)}
                    </TableTd>

                    <TableTd className="text-right font-bold">
                      {inrCurrency(totalGstAmount)}
                    </TableTd>
                  </tr>
                </tbody>
              </table>
            )}

            <div className="px-2.5 py-2 text-[11px] text-gray-700">
              Tax amount (in words) : <b>{amountToWordsINR(totalGstAmount)}</b>
            </div>

            {/* Footer */}
            <div className="grid grid-cols-2 gap-3 border-t border-gray-300 p-2.5">
              <div className="text-[11px]">
                <b>Remark :</b>
              </div>

              <div className="text-[11px]">
                <div className="mb-1 text-gray-500">Company bank detail</div>
                <div>
                  Bank name : <b>{seller.bankName}</b>
                </div>
                <div>
                  A/C No. : <b>{seller.accountNo}</b>
                </div>
                <div>
                  Branch &amp; IFSC Code : <b>{seller.branchIfsc}</b>
                </div>
              </div>
            </div>

            {/* ✅ Keep authorised signatory image */}
            <div className="px-2.5 pb-2 pt-3 text-right text-[11px]">
              <div>for {seller.name.toLowerCase()}</div>
              <div className="mt-1 flex justify-end">
                <img
                  src={signature}
                  alt="signature"
                  className="h-14 w-auto object-contain"
                />
              </div>
              <div className="text-gray-500">(Authorised Signatory)</div>
            </div>
            <div
              style={{
                borderTop: "1px solid #e5e7eb",
                paddingTop: 12,
                display: "flex",
                flexDirection: "column",
                gap: 16,
                fontSize: 13,
                color: "#374151",
              }}
            >
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 6,
                  padding: "0 10px",
                }}
              >
                <h4
                  style={{
                    margin: 0,
                    fontSize: 16,
                    fontWeight: 500,
                    color: "#111827",
                  }}
                >
                  Terms & Conditions
                </h4>

                <ul
                  style={{
                    margin: 0,
                    paddingLeft: 18,
                    lineHeight: 1.45,
                    listStyle: "outside",
                  }}
                >
                  <li>
                    This invoice constitutes a final and binding demand for
                    payment and shall be payable strictly within the due date
                    mentioned, without any deduction, withholding, or set-off
                    whatsoever.
                  </li>
                  <li>
                    Any delay or default in payment shall automatically attract
                    interest at the rate of 24% per annum, compounded monthly,
                    from the due date until full and final realization, without
                    further notice.
                  </li>
                  <li>
                    All statutory taxes, government fees, levies, and charges
                    applicable at the time of invoicing shall be borne entirely
                    by the client.
                  </li>
                  <li>
                    Services rendered or initiated pursuant to this invoice are
                    non-cancellable and non-refundable, except in case of
                    material default solely attributable to the issuing company.
                  </li>
                  <li>
                    The issuing company reserves the right to suspend services,
                    withhold deliverables, and/or terminate engagement in the
                    event of non-payment, without prejudice to its right to
                    recover dues.
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default memo(TaxInvoice);
