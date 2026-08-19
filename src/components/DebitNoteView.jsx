import React, { memo, useEffect, useMemo, useRef, useState } from "react";
import html2canvas from "html2canvas-pro";
import jsPDF from "jspdf";
import dayjs from "dayjs";
import numWords from "num-words";
import { useDispatch, useSelector } from "react-redux";
import { Image } from "@heroui/react";
import logo from "../assets/CORPSEED.webp";
import signature from "../assets/signature.png";
import { inrCurrency } from "../common";
import { getOrganizationByName } from "../toolkit/slices/organizationSlice";

/**
 * DebitNoteView
 * --------------------
 * Document renderer for a "Debit Note" (government-fee voucher) — same paper
 * layout, toolbar (Copy URL / Print / Share Email / Download PDF) and A4
 * sizing as TaxInvoice.jsx / PurchaseInvoiceView.jsx, so all three documents
 * read as one consistent family. Debit notes don't carry line items or GST
 * (they're internal government-fee vouchers), so the items table + tax
 * summary from TaxInvoice are replaced with a single voucher-details row
 * built entirely from the fields already present in the debit note API
 * response (see getGovernmentFeeDebitNotes) — no extra fetch is required.
 */

/** -------------------------
 * PDF / Layout constants
 * ------------------------- */
const PDF_MARGIN_MM = 10;
const A4_W_MM = 210;
const CONTENT_W_MM = A4_W_MM - PDF_MARGIN_MM * 2; // 190mm

/** -------------------------
 * Helpers
 * ------------------------- */
const toNumber = (v) => {
  if (v === null || v === undefined || v === "") return 0;
  const n = typeof v === "string" ? Number(v) : v;
  return Number.isFinite(n) ? n : 0;
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

// Narration comes as free text, e.g. "Government fee approved for project
// PRJ-20260806-122606-0146, expense ID 22. KIKUI" — pull the project number
// out of it since the API doesn't expose it as its own field.
const parseProjectNoFromNarration = (narration) => {
  const match = String(narration || "").match(/PRJ-[\w-]+/i);
  return match ? match[0] : "";
};

// "PROJECT_EXPENSE_GOVT_FEE_PAYMENT" -> "Project expense govt fee payment"
const humanize = (value) => {
  if (!value) return "-";

  const words = String(value).toLowerCase().split("_");
  return words
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

/** -------------------------
 * Component
 * ------------------------- */
const DebitNoteView = ({ invoiceData, heading }) => {
  const dispatch = useDispatch();
  const printRef = useRef(null);
  const [copyText, setCopyText] = useState("Copy URL");

  const organizationDetail = useSelector(
    (state) => state.organization.organizationDetail,
  );

  // Corpseed itself is the issuer of the debit note — fetch its own
  // organization detail so we don't have to hardcode it here.
  useEffect(() => {
    dispatch(getOrganizationByName());
  }, [dispatch]);

  // invoiceData can be object OR JSON string
  const inv = useMemo(() => {
    if (!invoiceData) return {};

    if (typeof invoiceData === "string") {
      try {
        return JSON.parse(invoiceData);
      } catch (error) {
        console.error("Invalid invoiceData JSON string:", error);
        return {};
      }
    }

    return invoiceData;
  }, [invoiceData]);

  const projectNo = useMemo(
    () => inv?.project || parseProjectNoFromNarration(inv?.narration),
    [inv],
  );

  // Issuer (Corpseed) — sourced from redux organization state, same shape
  // PurchaseInvoiceView.jsx uses for the buyer side.
  const org = useMemo(() => {
    const addressParts = [
      organizationDetail?.addressLine1,
      organizationDetail?.city,
      organizationDetail?.state,
      organizationDetail?.country,
    ].filter(Boolean);

    const address = addressParts.join(", ");
    const pinCode = organizationDetail?.pinCode
      ? ` - ${organizationDetail.pinCode}`
      : "";
    const gstin = organizationDetail?.gstNo || "";

    return {
      name: organizationDetail?.name || "",
      addressLine1: `${address}${pinCode}`,
      gstin,
      stateName: organizationDetail?.state || "",
      stateCode: gstin.slice(0, 2),
      email: organizationDetail?.email || "",
      phone: organizationDetail?.phone || "",
      panNo: organizationDetail?.panNo || "",
      cinNumber: organizationDetail?.cinNumber || "",
      logoUrl: organizationDetail?.logoUrl || "",
      bankName: organizationDetail?.bankName || "",
      accountNo: organizationDetail?.accountNo || "",
      ifscCode: organizationDetail?.ifscCode || "",
      branchName: organizationDetail?.branchName || "",
    };
  }, [organizationDetail]);

  const grandTotal = toNumber(inv?.amount);

  const getShareUrl = () => window.location.href;

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
        <title>${heading || "Debit Note"} - ${inv?.voucherNumber || ""}</title>

        <style>
          * { box-sizing: border-box; }
          body {
            margin: 0;
            padding: 16px;
            font-family: Arial, sans-serif;
            background: #ffffff;
            color: #111827;
          }
          img { max-width: 120px; }
          table { width: 100%; border-collapse: collapse; table-layout: fixed; }
          th, td { border: 1px solid #d1d5db; padding: 5px; font-size: 11px; vertical-align: top; }
          th { background: #f3f4f6; font-weight: 700; }
          p { margin: 0 0 4px 0; }
          .invoice-print-page { width: 190mm !important; margin: 0 auto !important; background: #ffffff !important; }
          .grid { display: grid !important; }
          .grid-cols-2 { grid-template-columns: repeat(2, minmax(0, 1fr)) !important; }
          .grid-cols-\\[1\\.2fr_1fr\\] { grid-template-columns: 1.2fr 1fr !important; }
          .border { border: 1px solid #d1d5db !important; }
          .border-b { border-bottom: 1px solid #d1d5db !important; }
          .border-r { border-right: 1px solid #d1d5db !important; }
          .border-t { border-top: 1px solid #d1d5db !important; }
          .text-center { text-align: center !important; }
          .text-right { text-align: right !important; }
          .font-bold { font-weight: 700 !important; }
          .font-semibold { font-weight: 600 !important; }
          .font-extrabold { font-weight: 800 !important; }
          .bg-gray-50, .bg-gray-100 { background: #f3f4f6 !important; }
          .bg-white { background: #ffffff !important; }
          .text-gray-500 { color: #6b7280 !important; }
          .text-gray-900 { color: #111827 !important; }
          .p-2\\.5 { padding: 10px !important; }
          .p-3 { padding: 12px !important; }
          .px-2\\.5 { padding-left: 10px !important; padding-right: 10px !important; }
          .py-2 { padding-top: 8px !important; padding-bottom: 8px !important; }
          .pb-2 { padding-bottom: 8px !important; }
          .pt-3 { padding-top: 12px !important; }
          .mb-1 { margin-bottom: 4px !important; }
          .mt-1 { margin-top: 4px !important; }
          .leading-snug { line-height: 1.35 !important; }
          .flex { display: flex !important; }
          .items-center { align-items: center !important; }
          .justify-end { justify-content: flex-end !important; }
          .gap-2 { gap: 8px !important; }
          .gap-3 { gap: 12px !important; }
          @page { size: A4; margin: 10mm; }
          @media print {
            body { padding: 0; print-color-adjust: exact; -webkit-print-color-adjust: exact; }
            .invoice-print-page { width: 190mm !important; margin: 0 auto !important; }
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
    const voucherNo = inv?.voucherNumber || "Debit Note";

    const subject = encodeURIComponent(
      `${heading || "Debit Note"} - ${voucherNo}`,
    );

    const body = encodeURIComponent(
      `Dear Sir/Ma'am,

Please find the ${heading || "Debit Note"} details below:

Voucher No.: ${voucherNo}
Voucher Date: ${
        inv?.voucherDate ? dayjs(inv.voucherDate).format("DD-MM-YYYY") : "NA"
      }
Amount: ${inrCurrency(grandTotal)}
URL: ${getShareUrl()}

Regards,
Corpseed Team`,
    );

    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  };

  const downloadPDF = async () => {
    const node = printRef.current;
    if (!node) return;

    await new Promise((r) => setTimeout(r, 100));

    const canvas = await html2canvas(node, {
      scale: 3,
      useCORS: true,
      allowTaint: true,
      backgroundColor: "#ffffff",
      logging: false,
      windowWidth: node.scrollWidth,
      windowHeight: node.scrollHeight,
    });

    const imgData = canvas.toDataURL("image/png", 1.0);

    const pdf = new jsPDF("p", "mm", "a4");
    const pageW = pdf.internal.pageSize.getWidth();
    const pageH = pdf.internal.pageSize.getHeight();

    const maxW = pageW - PDF_MARGIN_MM * 2;
    const maxH = pageH - PDF_MARGIN_MM * 2;

    let imgW = maxW;
    let imgH = (canvas.height * imgW) / canvas.width;

    if (imgH > maxH) {
      imgH = maxH;
      imgW = (canvas.width * imgH) / canvas.height;
    }

    const x = (pageW - imgW) / 2;
    const y = (pageH - imgH) / 2;
    pdf.addImage(imgData, "PNG", x, y, imgW, imgH, undefined, "FAST");

    pdf.save(`${inv?.voucherNumber || "debit-note"}.pdf`);
  };

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
        <div
          ref={printRef}
          className="invoice-print-page antialiased bg-white text-gray-900"
          style={{
            width: `${CONTENT_W_MM}mm`,
            margin: "0 auto",
          }}
        >
          {/* Debit Note Heading */}
          <div className="border border-gray-300">
            <div className="border-b border-gray-300 py-2 text-center">
              <div className="text-[16px] font-extrabold tracking-wide">
                {heading ? heading : "DEBIT NOTE"}
              </div>
            </div>

            {/* Top grid */}
            <div className="grid grid-cols-[1.2fr_1fr] border-b border-gray-300">
              <div className="border-r border-gray-300 p-3">
                <div className="mb-1 flex items-center gap-2">
                  <Image
                    src={org.logoUrl || logo}
                    alt={org.name || "Organization logo"}
                    className="h-10 max-w-[120px] object-contain"
                    crossOrigin="anonymous"
                  />
                </div>

                <div className="mb-0.5 text-[12px] font-bold">
                  {org.name || "NA"}
                </div>
                <div className="text-[11px] leading-snug">
                  {org.addressLine1}
                </div>
                {org.gstin ? (
                  <div className="mt-1 text-[11px]">GSTIN/UIN : {org.gstin}</div>
                ) : null}
                {org.stateName ? (
                  <div className="text-[11px]">
                    State name : {org.stateName} , code : {org.stateCode}
                  </div>
                ) : null}
                {org.email ? (
                  <div className="text-[11px]">E-mail : {org.email}</div>
                ) : null}
                {org.panNo ? (
                  <div className="text-[11px]">PAN : {org.panNo}</div>
                ) : null}
                {org.cinNumber ? (
                  <div className="text-[11px]">CIN : {org.cinNumber}</div>
                ) : null}
              </div>

              <div className="grid auto-rows-min">
                <div className="grid grid-cols-2 border-b border-gray-300">
                  <div className="border-r border-gray-300 p-2.5">
                    <div className="text-[10px] text-gray-500">
                      Voucher no.
                    </div>
                    <div className="text-[11px] font-bold">
                      {inv?.voucherNumber || "NA"}
                    </div>
                  </div>
                  <div className="p-2.5">
                    <div className="text-[10px] text-gray-500">Dated</div>
                    <div className="text-[11px] font-bold">
                      {inv?.voucherDate
                        ? dayjs(inv.voucherDate).format("DD-MM-YYYY")
                        : "NA"}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 border-b border-gray-300">
                  <div className="border-r border-gray-300 p-2.5">
                    <div className="text-[10px] text-gray-500">
                      Voucher Type
                    </div>
                    <div className="text-[11px] font-bold">
                      {inv?.voucherType || "NA"}
                    </div>
                  </div>
                  <div className="p-2.5">
                    <div className="text-[10px] text-gray-500">
                      References No. &amp; Date.
                    </div>
                    <div className="text-[11px] font-bold">
                      {inv?.operationExpenseId
                        ? `Expense ID ${inv.operationExpenseId}`
                        : "NA"}
                      {inv?.createdAt
                        ? ` / ${dayjs(inv.createdAt).format("DD-MM-YYYY")}`
                        : ""}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 border-b border-gray-300">
                  <div className="border-r border-gray-300 p-2.5">
                    <div className="text-[10px] text-gray-500">
                      Project No.
                    </div>
                    <div className="h-4 text-[11px] font-bold">
                      {projectNo || <>&nbsp;</>}
                    </div>
                  </div>
                  <div className="p-2.5">
                    <div className="text-[10px] text-gray-500">Source</div>
                    <div className="h-4 text-[11px] font-bold">
                      {humanize(inv?.sourceType)}
                    </div>
                  </div>
                </div>

                <div className="p-2.5">
                  <div className="text-[10px] text-gray-500">Status</div>
                  <div className="h-4 text-[11px] font-bold">
                    {inv?.status || <>&nbsp;</>}
                  </div>
                </div>
              </div>
            </div>

            {/* Voucher details table (mirrors the items table on Tax Invoice /
                Purchase Invoice, but debit notes carry no line items or GST —
                just the single narration + amount already in the response). */}
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <TableTh className="w-[50px] text-center">S.No</TableTh>
                  <TableTh>Particulars</TableTh>
                  <TableTh className="w-[150px] text-center">Voucher Type</TableTh>
                  <TableTh className="w-[110px] text-right">Amount (₹)</TableTh>
                </tr>
              </thead>

              <tbody>
                <tr>
                  <TableTd className="text-center">1</TableTd>
                  <TableTd>
                    <div className="font-semibold">
                      {humanize(inv?.sourceType)}
                    </div>
                    {inv?.narration ? (
                      <div className="mt-0.5 text-[10px] text-gray-500">
                        {inv.narration}
                      </div>
                    ) : null}
                  </TableTd>
                  <TableTd className="text-center">
                    {inv?.voucherType || "NA"}
                  </TableTd>
                  <TableTd className="text-right">
                    {inrCurrency(grandTotal)}
                  </TableTd>
                </tr>

                <tr>
                  <TableTd />
                  <TableTd className="text-right font-bold" colSpan={2}>
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

            {/* Footer */}
            <div className="grid grid-cols-2 gap-3 border-t border-gray-300 p-2.5">
              <div className="text-[11px]">
                <b>Remark :</b> {inv?.narration || ""}
              </div>

              <div className="text-[11px]">
                <div className="mb-1 text-gray-500">Company bank detail</div>
                <div>
                  Bank name : <b>{org.bankName || "NA"}</b>
                </div>
                <div>
                  A/C No. : <b>{org.accountNo || "NA"}</b>
                </div>
                <div>
                  Branch &amp; IFSC Code :{" "}
                  <b>
                    {org.branchName || "NA"} & {org.ifscCode || "NA"}
                  </b>
                </div>
              </div>
            </div>

            {/* Authorised signatory */}
            <div className="px-2.5 pb-2 pt-3 text-right text-[11px]">
              <div>for {(org.name || "").toLowerCase()}</div>
              <div className="mt-1 flex justify-end">
                <img
                  src={signature}
                  alt="signature"
                  className="h-14 w-auto object-contain"
                />
              </div>
              <div className="text-gray-500">(Authorised Signatory)</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default memo(DebitNoteView);
