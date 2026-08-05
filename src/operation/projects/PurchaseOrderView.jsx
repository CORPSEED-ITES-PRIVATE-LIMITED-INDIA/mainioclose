import { memo, useMemo, useRef, useState } from "react";
import html2canvas from "html2canvas-pro";
import jsPDF from "jspdf";
import dayjs from "dayjs";
import numWords from "num-words";
import { Image } from "@heroui/react";
import { inrCurrency } from "../../common";
import logo from "../../assets/CORPSEED.webp";
import signature from "../../assets/signature.png";

/** -------------------------
 * PDF / Layout constants
 * ------------------------- */
const PDF_MARGIN_MM = 10;
const A4_W_MM = 210;
const CONTENT_W_MM = A4_W_MM - PDF_MARGIN_MM * 2;

/**
 * Static Corpseed details shown as the buyer on the PO. The purchase-order
 * API does not return an organization snapshot the way invoices do, so this
 * is hardcoded for now.
 */
const BUYER = {
  logoUrl: logo,
  name: "Corpseed ITES Private Limited",
  addressLine1: "A-154A, Sector 63, Noida, Uttar Pradesh - 201301",
  gstin: "09AAICC1234F1Z5",
  panNo: "AAICC1234F",
  cinNumber: "U72900UP2015PTC123456",
  email: "info@corpseed.com",
  phone: "7966632217",
  website: "corpseed.com",
};

const toNumber = (value) => {
  if (value === null || value === undefined || value === "") return 0;
  const n = typeof value === "string" ? Number(value) : value;
  return Number.isFinite(n) ? n : 0;
};

const formatDate = (value) => {
  if (!value) return "NA";
  const parsed = dayjs(value);
  return parsed.isValid() ? parsed.format("DD-MM-YYYY") : "NA";
};

const percentStr = (value) => {
  const n = toNumber(value);
  if (!Number.isFinite(n) || n <= 0) return "0%";
  return n % 1 === 0 ? `${n}%` : `${n.toFixed(2)}%`;
};

const amountToWordsINR = (value) => {
  const n = toNumber(value);
  const rupees = Math.floor(n);
  const paise = Math.round((n - rupees) * 100);
  const r = String(numWords(rupees)).toUpperCase();

  if (paise > 0) {
    const p = String(numWords(paise)).toUpperCase();
    return `${r} RUPEES AND ${p} PAISE ONLY`;
  }

  return `${r} RUPEES ONLY`;
};

const getPlainTextLength = (html = "") =>
  String(html || "")
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/g, " ")
    .trim().length;

const hasHtmlContent = (html) => getPlainTextLength(html) > 0;

const getStatusColorClass = (status) => {
  switch (String(status || "").toUpperCase()) {
    case "APPROVED":
    case "RELEASED":
    case "PO_RELEASED":
    case "COMPLETED":
      return "bg-emerald-50 text-emerald-700 border-emerald-200";
    case "PENDING_APPROVAL":
    case "PARTIALLY_COMPLETED":
      return "bg-amber-50 text-amber-700 border-amber-200";
    case "REJECTED":
      return "bg-red-50 text-red-700 border-red-200";
    default:
      return "bg-slate-100 text-slate-700 border-slate-200";
  }
};

/** -------------------------
 * Component
 * ------------------------- */
const PurchaseOrderView = ({ poData, heading }) => {
  const printRef = useRef(null);
  const [copyText, setCopyText] = useState("Copy URL");

  const po = useMemo(() => {
    if (!poData) return {};
    if (typeof poData === "string") {
      try {
        return JSON.parse(poData);
      } catch (e) {
        console.error("Invalid poData JSON string:", e);
        return {};
      }
    }
    return poData;
  }, [poData]);

  const vendor = useMemo(() => {
    const gstin = po?.vendorGSTNumber || "";

    return {
      name: po?.vendorName || "NA",
      gstin,
      registrationType: po?.vendorGSTRegistrationType || "",
      stateCode: gstin?.slice(0, 2) || "",
    };
  }, [po]);

  const finalAmount = toNumber(po?.finalAmount);
  const cgstAmount = toNumber(po?.cgstAmount);
  const sgstAmount = toNumber(po?.sgstAmount);
  const igstAmount = toNumber(po?.igstAmount);
  const totalTaxAmount = toNumber(po?.totalTaxAmount);
  const tdsPercentage = toNumber(po?.tdsPercentage);
  const tdsAmount = toNumber(po?.tdsAmount);
  const grandTotal = toNumber(po?.grandTotal);

  const attachments = Array.isArray(po?.attachmentUrls)
    ? po.attachmentUrls
    : [];

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
      setTimeout(() => setCopyText("Copy URL"), 1500);
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
        <title>${heading || "Purchase Order"} - ${po?.poNumber || ""}</title>
        <style>
          * { box-sizing: border-box; }
          body { margin: 0; padding: 16px; font-family: Arial, sans-serif; background: #fff; color: #111827; }
          img { max-width: 120px; }
          table { width: 100%; border-collapse: collapse; table-layout: fixed; }
          th, td { border: 1px solid #d1d5db; padding: 5px; font-size: 11px; vertical-align: top; }
          th { background: #f3f4f6; font-weight: 700; }
          p { margin: 0 0 4px 0; }
          .po-print-page { width: 190mm !important; margin: 0 auto !important; background: #fff !important; }
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
          .text-gray-500 { color: #6b7280 !important; }
          .p-2\\.5 { padding: 10px !important; }
          .p-3 { padding: 12px !important; }
          @page { size: A4; margin: 10mm; }
          @media print {
            body { padding: 0; print-color-adjust: exact; -webkit-print-color-adjust: exact; }
            .po-print-page { width: 190mm !important; margin: 0 auto !important; }
          }
        </style>
      </head>
      <body>
        <div class="po-print-page">${node.innerHTML}</div>
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
    const poNo = po?.poNumber || "Purchase Order";

    const subject = encodeURIComponent(`${heading || "Purchase Order"} - ${poNo}`);

    const body = encodeURIComponent(
      `Dear Sir/Ma'am,

Please find the ${heading || "Purchase Order"} details below:

PO No.: ${poNo}
Vendor: ${vendor.name}
Grand Total: ${inrCurrency(grandTotal)}
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

    pdf.save(`${po?.poNumber || "purchase-order"}.pdf`);
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

  const HtmlSection = ({ title, html, emptyText }) => (
    <div className="px-2.5 py-2">
      <p className="mb-1 text-[11px] font-bold text-gray-900">{title}</p>

      {hasHtmlContent(html) ? (
        <div
          className="tiptap-preview force-preview-text text-[11px] leading-snug text-gray-700"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      ) : (
        <p className="text-[11px] text-gray-400">{emptyText}</p>
      )}
    </div>
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

      <div className="mx-auto w-[210mm] bg-gray-50 p-3">
        <div
          ref={printRef}
          className="po-print-page antialiased bg-white text-gray-900"
          style={{ width: `${CONTENT_W_MM}mm`, margin: "0 auto" }}
        >
          <div className="border border-gray-300">
            <div className="border-b border-gray-300 py-2 text-center">
              <div className="text-[16px] font-extrabold tracking-wide">
                {heading || "PURCHASE ORDER"}
              </div>
            </div>

            {/* Top grid: Buyer (static) + PO meta */}
            <div className="grid grid-cols-[1.2fr_1fr] border-b border-gray-300">
              <div className="border-r border-gray-300 p-3">
                <div className="mb-1 flex items-center gap-2">
                  <Image
                    alt="company logo"
                    height={60}
                    radius="sm"
                    src={BUYER.logoUrl}
                    width={90}
                  />
                </div>

                <div className="mb-0.5 text-[12px] font-bold">{BUYER.name}</div>
                <div className="text-[11px] leading-snug">
                  {BUYER.addressLine1}
                </div>
                <div className="mt-1 text-[11px]">GSTIN/UIN : {BUYER.gstin}</div>
                <div className="text-[11px]">PAN : {BUYER.panNo}</div>
                <div className="text-[11px]">E-mail : {BUYER.email}</div>
              </div>

              <div className="grid auto-rows-min">
                <div className="grid grid-cols-2 border-b border-gray-300">
                  <div className="border-r border-gray-300 p-2.5">
                    <div className="text-[10px] text-gray-500">PO Number</div>
                    <div className="text-[11px] font-bold">
                      {po?.poNumber || "NA"}
                    </div>
                  </div>
                  <div className="p-2.5">
                    <div className="text-[10px] text-gray-500">PO Date</div>
                    <div className="text-[11px] font-bold">
                      {formatDate(po?.poCreatedDate)}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 border-b border-gray-300">
                  <div className="border-r border-gray-300 p-2.5">
                    <div className="text-[10px] text-gray-500">
                      Reference No.
                    </div>
                    <div className="text-[11px] font-bold">
                      {po?.poReferenceNumber || "NA"}
                    </div>
                  </div>
                  <div className="p-2.5">
                    <div className="text-[10px] text-gray-500">Status</div>
                    <div
                      className={`inline-block rounded-full border px-2 py-0.5 text-[10px] font-semibold ${getStatusColorClass(po?.status)}`}
                    >
                      {po?.status || "NA"}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 border-b border-gray-300">
                  <div className="border-r border-gray-300 p-2.5">
                    <div className="text-[10px] text-gray-500">Approved On</div>
                    <div className="text-[11px] font-bold">
                      {formatDate(po?.poApprovedDate)}
                    </div>
                  </div>
                  <div className="p-2.5">
                    <div className="text-[10px] text-gray-500">Released On</div>
                    <div className="text-[11px] font-bold">
                      {formatDate(po?.poReleasedDate)}
                    </div>
                  </div>
                </div>

                <div className="p-2.5">
                  <div className="text-[10px] text-gray-500">Payment Terms</div>
                  <div className="text-[11px] font-bold">
                    {po?.paymentTypeName || "NA"}
                  </div>
                </div>
              </div>
            </div>

            {/* Project + Vendor */}
            <div className="grid grid-cols-2 border-b border-gray-300">
              <div className="border-r border-gray-300 p-2.5">
                <div className="mb-1 text-[11px] font-bold">Project</div>
                <div className="text-[11px]">{po?.projectName || "NA"}</div>
                <div className="text-[11px] text-gray-500">
                  Project No.: {po?.projectNo || "NA"}
                </div>
              </div>

              <div className="p-2.5">
                <div className="mb-1 text-[11px] font-bold">
                  Vendor (Supplier)
                </div>
                <div className="text-[11px]">{vendor.name}</div>
                <div className="text-[11px]">
                  GSTIN/UIN : {vendor.gstin || "NA"}
                </div>
                <div className="text-[11px]">
                  State code : {vendor.stateCode || "-"}
                </div>
                <div className="text-[11px]">
                  Registration : {vendor.registrationType || "NA"}
                </div>
              </div>
            </div>

            {/* Financial summary — no line items are returned by the API */}
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <TableTh>Particulars</TableTh>
                  <TableTh className="w-[110px] text-right">Rate</TableTh>
                  <TableTh className="w-[110px] text-right">Amount (₹)</TableTh>
                </tr>
              </thead>

              <tbody>
                <tr>
                  <TableTd>
                    <div className="font-semibold">
                      {po?.projectName || "Purchase order value"}
                    </div>
                  </TableTd>
                  <TableTd className="text-right">-</TableTd>
                  <TableTd className="text-right">
                    {inrCurrency(finalAmount)}
                  </TableTd>
                </tr>

                {(cgstAmount > 0 || sgstAmount > 0) && (
                  <>
                    <tr>
                      <TableTd>CGST</TableTd>
                      <TableTd className="text-right">
                        {percentStr(toNumber(po?.gstRate) / 2)}
                      </TableTd>
                      <TableTd className="text-right">
                        {inrCurrency(cgstAmount)}
                      </TableTd>
                    </tr>
                    <tr>
                      <TableTd>SGST</TableTd>
                      <TableTd className="text-right">
                        {percentStr(toNumber(po?.gstRate) / 2)}
                      </TableTd>
                      <TableTd className="text-right">
                        {inrCurrency(sgstAmount)}
                      </TableTd>
                    </tr>
                  </>
                )}

                {igstAmount > 0 && (
                  <tr>
                    <TableTd>IGST</TableTd>
                    <TableTd className="text-right">
                      {percentStr(po?.gstRate)}
                    </TableTd>
                    <TableTd className="text-right">
                      {inrCurrency(igstAmount)}
                    </TableTd>
                  </tr>
                )}

                {tdsAmount > 0 && (
                  <tr>
                    <TableTd>TDS (deducted at payment)</TableTd>
                    <TableTd className="text-right">
                      {percentStr(tdsPercentage)}
                    </TableTd>
                    <TableTd className="text-right">
                      -{inrCurrency(tdsAmount)}
                    </TableTd>
                  </tr>
                )}

                <tr>
                  <TableTd className="text-right font-bold" colSpan={2}>
                    Total Tax
                  </TableTd>
                  <TableTd className="text-right font-bold">
                    {inrCurrency(totalTaxAmount)}
                  </TableTd>
                </tr>

                <tr className="bg-gray-50">
                  <TableTd className="text-right font-extrabold" colSpan={2}>
                    Grand Total
                  </TableTd>
                  <TableTd className="text-right font-extrabold">
                    {inrCurrency(grandTotal)}
                  </TableTd>
                </tr>
              </tbody>
            </table>

            <div className="flex justify-between border-b border-gray-300 px-2.5 py-2">
              <div className="text-[11px] text-gray-600">
                Amount Chargeable (in Words)
              </div>
              <div className="text-[11px] font-bold">
                {amountToWordsINR(grandTotal)}
              </div>
            </div>

            <HtmlSection
              title="Scope of Work"
              html={po?.scopeOfWork}
              emptyText="No scope of work provided."
            />

            <div className="border-t border-gray-300">
              <HtmlSection
                title="Terms & Conditions"
                html={po?.termsAndConditions}
                emptyText="No terms and conditions provided."
              />
            </div>

            {po?.remarks && (
              <div className="border-t border-gray-300 px-2.5 py-2">
                <p className="mb-1 text-[11px] font-bold text-gray-900">
                  Remarks
                </p>
                <p className="text-[11px] text-gray-700">{po.remarks}</p>
              </div>
            )}

            {attachments.length > 0 && (
              <div className="border-t border-gray-300 px-2.5 py-2">
                <p className="mb-1 text-[11px] font-bold text-gray-900">
                  Attachments
                </p>
                <div className="flex flex-col gap-0.5">
                  {attachments.map((url, idx) => (
                    <a
                      key={idx}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="truncate text-[11px] text-blue-600 hover:underline"
                    >
                      Attachment {idx + 1}
                    </a>
                  ))}
                </div>
              </div>
            )}

            <div className="border-t border-gray-300 px-2.5 pb-2 pt-3 text-right text-[11px]">
              <div>for {BUYER.name.toLowerCase()}</div>
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

export default memo(PurchaseOrderView);
