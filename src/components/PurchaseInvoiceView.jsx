import React, { memo, useEffect, useMemo, useRef, useState } from "react";
import { Building2 } from "lucide-react";
import html2canvas from "html2canvas-pro";
import jsPDF from "jspdf";
import dayjs from "dayjs";
import numWords from "num-words";
import { useDispatch, useSelector } from "react-redux";
import { inrCurrency } from "../common";
import { getOrganizationByName } from "../toolkit/slices/organizationSlice";

/**
 * PurchaseInvoiceView
 * --------------------
 * Document renderer for a "Purchase Invoice" — the mirror image of
 * TaxInvoice.jsx. Corpseed is the BUYER/CONSIGNEE here (sourced from
 * state.organization.organizationDetail via getOrganizationByName), and the
 * VENDOR on the row (invoiceData.vendor*) is the SELLER.
 *
 * The line-item GST math (getLineTaxBreakup / buildTaxSummaryRows),
 * amount-in-words and the print/PDF/copy-URL/share-email toolbar are copied
 * faithfully from TaxInvoice.jsx so purchase invoices stay numerically
 * consistent with tax invoices.
 *
 * Implemented as a standalone sibling component (rather than a new prop on
 * TaxInvoice.jsx) so every existing TaxInvoice caller keeps rendering
 * byte-identical output — see task notes for rationale.
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

const percentStr = (v) => {
  const n = toNumber(v);
  if (!Number.isFinite(n) || n <= 0) return "";
  return n % 1 === 0 ? `${n}%` : `${n.toFixed(2)}%`;
};

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

const isIgstLineItem = (item) =>
  item?.igstFlag === true || item?.igstFlag === "true";

const roundMoney = (value) =>
  Math.round((toNumber(value) + Number.EPSILON) * 100) / 100;

const getLineTaxBreakup = (item = {}) => {
  const taxableValue = toNumber(item?.lineTotalExGst);
  const gstRate = toNumber(item?.gstRate);
  const calculatedGst = roundMoney((taxableValue * gstRate) / 100);

  const suppliedTotalGst = toNumber(item?.gstAmount);
  const totalGst = suppliedTotalGst > 0 ? suppliedTotalGst : calculatedGst;

  if (isIgstLineItem(item)) {
    const suppliedIgst = toNumber(item?.igstAmount);

    return {
      taxableValue,
      gstRate,
      cgstRate: 0,
      cgstAmount: 0,
      sgstRate: 0,
      sgstAmount: 0,
      igstRate: gstRate,
      igstAmount: suppliedIgst > 0 ? suppliedIgst : totalGst,
      totalTax: suppliedIgst > 0 ? suppliedIgst : totalGst,
      taxType: "IGST",
    };
  }

  const suppliedCgst = toNumber(item?.cgstAmount);
  const suppliedSgst = toNumber(item?.sgstAmount);
  const halfTax = roundMoney(totalGst / 2);

  const cgstAmount = suppliedCgst > 0 ? suppliedCgst : halfTax;
  const sgstAmount = suppliedSgst > 0 ? suppliedSgst : halfTax;

  return {
    taxableValue,
    gstRate,
    cgstRate: gstRate > 0 ? gstRate / 2 : 0,
    cgstAmount,
    sgstRate: gstRate > 0 ? gstRate / 2 : 0,
    sgstAmount,
    igstRate: 0,
    igstAmount: 0,
    totalTax: roundMoney(cgstAmount + sgstAmount),
    taxType: "CGST_SGST",
  };
};

const buildTaxSummaryRows = (lineItems = []) => {
  const map = new Map();

  for (const item of lineItems) {
    const hsn = item?.hsnSacCode || "";
    const breakup = getLineTaxBreakup(item);

    // Keep IGST and CGST/SGST rows separate even when HSN and rate are same.
    const key = `${hsn}__${breakup.gstRate}__${breakup.taxType}`;

    if (!map.has(key)) {
      map.set(key, {
        hsn,
        taxType: breakup.taxType,
        taxableValue: 0,
        cgstRate: breakup.cgstRate,
        cgstAmount: 0,
        sgstRate: breakup.sgstRate,
        sgstAmount: 0,
        igstRate: breakup.igstRate,
        igstAmount: 0,
        totalTax: 0,
      });
    }

    const row = map.get(key);

    row.taxableValue = roundMoney(row.taxableValue + breakup.taxableValue);
    row.cgstAmount = roundMoney(row.cgstAmount + breakup.cgstAmount);
    row.sgstAmount = roundMoney(row.sgstAmount + breakup.sgstAmount);
    row.igstAmount = roundMoney(row.igstAmount + breakup.igstAmount);
    row.totalTax = roundMoney(row.totalTax + breakup.totalTax);
  }

  return Array.from(map.values());
};

/** -------------------------
 * Component
 * ------------------------- */
const PurchaseInvoiceView = ({ invoiceData, heading }) => {
  const dispatch = useDispatch();
  const printRef = useRef(null);
  const [copyText, setCopyText] = useState("Copy URL");

  const organizationDetail = useSelector(
    (state) => state.organization.organizationDetail,
  );

  // Corpseed is the BUYER/CONSIGNEE on a purchase invoice — fetch its own
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

  // Seller (on a purchase invoice this is the VENDOR) — sourced purely from
  // the row's vendor* fields, no API call needed.
  const seller = useMemo(() => {
    const addressParts = [
      inv?.vendorAddressLine1,
      inv?.vendorCity,
      inv?.vendorState,
      inv?.vendorCountry,
    ].filter(Boolean);

    const address = addressParts.join(", ");
    const pinCode = inv?.vendorPinCode ? ` - ${inv.vendorPinCode}` : "";
    const gstin = inv?.vendorGstin || "";

    return {
      name: inv?.vendorName || "",
      addressLine1: `${address}${pinCode}`,
      gstin,
      stateName: inv?.vendorState || "",
      stateCode: gstin.slice(0, 2),
      panNo: inv?.vendorPanNo || "",
      bankName: inv?.vendorBankName || "",
      accountNo: inv?.vendorAccountNo || "",
      ifscCode: inv?.vendorIfscCode || "",
    };
  }, [inv]);

  // Buyer/Consignee (Corpseed itself) — sourced from redux organization state.
  const buyer = useMemo(() => {
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
    };
  }, [organizationDetail]);

  // lineItems safe + sort
  const items = useMemo(() => {
    const arr = Array.isArray(inv?.lineItems) ? inv.lineItems : [];

    return [...arr].sort(
      (a, b) => toNumber(a?.displayOrder) - toNumber(b?.displayOrder),
    );
  }, [inv]);

  const taxSummaryRows = useMemo(() => buildTaxSummaryRows(items), [items]);

  const calculatedTotals = useMemo(() => {
    return items.reduce(
      (totals, item) => {
        const breakup = getLineTaxBreakup(item);

        totals.subTotalExGst = roundMoney(
          totals.subTotalExGst + breakup.taxableValue,
        );
        totals.cgstAmount = roundMoney(totals.cgstAmount + breakup.cgstAmount);
        totals.sgstAmount = roundMoney(totals.sgstAmount + breakup.sgstAmount);
        totals.igstAmount = roundMoney(totals.igstAmount + breakup.igstAmount);
        totals.totalGstAmount = roundMoney(
          totals.totalGstAmount + breakup.totalTax,
        );

        return totals;
      },
      {
        subTotalExGst: 0,
        cgstAmount: 0,
        sgstAmount: 0,
        igstAmount: 0,
        totalGstAmount: 0,
      },
    );
  }, [items]);

  const hasLineItems = items.length > 0;

  const subTotalExGst = hasLineItems
    ? calculatedTotals.subTotalExGst
    : toNumber(inv?.amount);

  const cgstAmount = hasLineItems
    ? calculatedTotals.cgstAmount
    : toNumber(inv?.cgstAmount);

  const sgstAmount = hasLineItems
    ? calculatedTotals.sgstAmount
    : toNumber(inv?.sgstAmount);

  const igstAmount = hasLineItems
    ? calculatedTotals.igstAmount
    : toNumber(inv?.igstAmount);

  const totalGstAmount = hasLineItems
    ? calculatedTotals.totalGstAmount
    : toNumber(inv?.totalGstAmount);

  const grandTotal =
    toNumber(inv?.invoiceAmount) || roundMoney(subTotalExGst + totalGstAmount);

  const intraStateItems = useMemo(
    () => items.filter((item) => !isIgstLineItem(item)),
    [items],
  );

  const interStateItems = useMemo(
    () => items.filter((item) => isIgstLineItem(item)),
    [items],
  );

  const halfRatesLabel = useMemo(
    () => getHalfGstRatesLabel(intraStateItems),
    [intraStateItems],
  );

  const fullRatesLabel = useMemo(
    () => getFullGstRatesLabel(interStateItems),
    [interStateItems],
  );

  const hasCgstSgst = cgstAmount > 0 || sgstAmount > 0;
  const hasIgst = igstAmount > 0;

  const gstDisplayRows = useMemo(() => {
    const rows = [];

    if (cgstAmount > 0) {
      rows.push({
        label: "CGST",
        rateLabel: halfRatesLabel,
        amount: cgstAmount,
      });
    }

    if (sgstAmount > 0) {
      rows.push({
        label: "SGST",
        rateLabel: halfRatesLabel,
        amount: sgstAmount,
      });
    }

    if (igstAmount > 0) {
      rows.push({
        label: "IGST",
        rateLabel: fullRatesLabel,
        amount: igstAmount,
      });
    }

    return rows;
  }, [cgstAmount, sgstAmount, igstAmount, halfRatesLabel, fullRatesLabel]);

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
        <title>${heading || "Purchase Invoice"} - ${inv?.invoiceNo || ""}</title>

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
    const invoiceNo = inv?.invoiceNo || "Purchase Invoice";

    const subject = encodeURIComponent(
      `${heading || "Purchase Invoice"} - ${invoiceNo}`,
    );

    const body = encodeURIComponent(
      `Dear Sir/Ma'am,

Please find the ${heading || "Purchase Invoice"} details below:

Invoice No.: ${invoiceNo}
Invoice Date: ${
        inv?.invoiceDate ? dayjs(inv.invoiceDate).format("DD-MM-YYYY") : "NA"
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

    pdf.save(`${inv?.invoiceNo || "purchase-invoice"}.pdf`);
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
          {/* Invoice Heading */}
          <div className="border border-gray-300">
            <div className="border-b border-gray-300 py-2 text-center">
              <div className="text-[16px] font-extrabold tracking-wide">
                {heading ? heading : "PURCHASE INVOICE"}
              </div>
            </div>

            {/* Top grid */}
            <div className="grid grid-cols-[1.2fr_1fr] border-b border-gray-300">
              <div className="border-r border-gray-300 p-3">
                <div className="mb-1 flex items-center gap-2">
                  <div className="flex h-10 w-[120px] items-center justify-start">
                    <Building2 className="h-8 w-8 text-gray-400" />
                  </div>
                </div>

                <div className="mb-0.5 text-[12px] font-bold">
                  {seller.name || "NA"}
                </div>
                <div className="text-[11px] leading-snug">
                  {seller.addressLine1}
                </div>
                {seller.gstin ? (
                  <div className="mt-1 text-[11px]">
                    GSTIN/UIN : {seller.gstin}
                  </div>
                ) : null}
                {seller.stateName ? (
                  <div className="text-[11px]">
                    State name : {seller.stateName} , code : {seller.stateCode}
                  </div>
                ) : null}
                {seller.panNo ? (
                  <div className="text-[11px]">PAN : {seller.panNo}</div>
                ) : null}
              </div>

              <div className="grid auto-rows-min">
                <div className="grid grid-cols-2 border-b border-gray-300">
                  <div className="border-r border-gray-300 p-2.5">
                    <div className="text-[10px] text-gray-500">Invoice no.</div>
                    <div className="text-[11px] font-bold">
                      {inv?.invoiceNo || "NA"}
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
                    <div className="text-[11px] font-bold">
                      {inv?.poNumber || "NA"}
                    </div>
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

            {/* Consignee + Buyer (both Corpseed on a purchase invoice) */}
            <div className="grid grid-cols-2 border-b border-gray-300">
              <div className="border-r border-gray-300 p-2.5">
                <div className="mb-1 text-[11px] font-bold">
                  Consignee (Ship to)
                </div>
                <div className="text-[11px]">{buyer.name || "NA"}</div>
                <div className="text-[11px]">
                  GSTIN/UIN : {buyer.gstin || ""}
                </div>
                <div className="text-[11px]">
                  Address : {buyer.addressLine1}
                </div>
                <div className="text-[11px]">
                  State name : {buyer.stateName} , code : {buyer.stateCode}
                </div>
                <div className="text-[11px]">E-mail : {buyer.email || ""}</div>
              </div>

              <div className="p-2.5">
                <div className="mb-1 text-[11px] font-bold">
                  Buyer (Bill to)
                </div>
                <div className="text-[11px]">{buyer.name || "NA"}</div>
                <div className="text-[11px]">
                  GSTIN/UIN : {buyer.gstin || ""}
                </div>
                <div className="text-[11px]">
                  Address : {buyer.addressLine1}
                </div>
                <div className="text-[11px]">
                  State name : {buyer.stateName} , code : {buyer.stateCode}
                </div>
                <div className="text-[11px]">E-mail : {buyer.email || ""}</div>
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

                {gstDisplayRows.map((taxRow, index) => (
                  <tr key={taxRow.label}>
                    <TableTd className="text-center">
                      {items.length + index + 1}
                    </TableTd>
                    <TableTd>{taxRow.label}</TableTd>
                    <TableTd />
                    <TableTd />
                    <TableTd className="text-right font-semibold">
                      {taxRow.rateLabel}
                    </TableTd>
                    <TableTd className="text-center">%</TableTd>
                    <TableTd className="text-right">
                      {inrCurrency(taxRow.amount)}
                    </TableTd>
                  </tr>
                ))}

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
            {hasIgst && !hasCgstSgst ? (
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

                <tbody>
                  {taxSummaryRows.map((row, index) => (
                    <tr key={`${row.hsn}-${row.igstRate}-${index}`}>
                      <TableTd className="text-center">{row.hsn}</TableTd>
                      <TableTd className="text-right">
                        {inrCurrency(row.taxableValue)}
                      </TableTd>
                      <TableTd className="text-center">
                        {toNumber(row.igstRate).toFixed(2)}
                      </TableTd>
                      <TableTd className="text-right">
                        {inrCurrency(row.igstAmount)}
                      </TableTd>
                      <TableTd className="text-right">
                        {inrCurrency(row.totalTax)}
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
            ) : hasCgstSgst && !hasIgst ? (
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
                  {taxSummaryRows.map((row, index) => (
                    <tr key={`${row.hsn}-${row.cgstRate}-${index}`}>
                      <TableTd className="text-center">{row.hsn}</TableTd>
                      <TableTd className="text-right">
                        {inrCurrency(row.taxableValue)}
                      </TableTd>
                      <TableTd className="text-center">
                        {toNumber(row.cgstRate).toFixed(2)}
                      </TableTd>
                      <TableTd className="text-right">
                        {inrCurrency(row.cgstAmount)}
                      </TableTd>
                      <TableTd className="text-center">
                        {toNumber(row.sgstRate).toFixed(2)}
                      </TableTd>
                      <TableTd className="text-right">
                        {inrCurrency(row.sgstAmount)}
                      </TableTd>
                      <TableTd className="text-right">
                        {inrCurrency(row.totalTax)}
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
            ) : hasIgst && hasCgstSgst ? (
              <table className="w-full border-collapse">
                <thead>
                  <tr>
                    <TableTh className="text-center">HSN/SAC</TableTh>
                    <TableTh className="text-center">Taxable Value (₹)</TableTh>
                    <TableTh className="text-center">Tax Type</TableTh>
                    <TableTh className="text-center">Rate (%)</TableTh>
                    <TableTh className="text-center">CGST (₹)</TableTh>
                    <TableTh className="text-center">SGST (₹)</TableTh>
                    <TableTh className="text-center">IGST (₹)</TableTh>
                    <TableTh className="text-center">Total Tax (₹)</TableTh>
                  </tr>
                </thead>

                <tbody>
                  {taxSummaryRows.map((row, index) => (
                    <tr key={`${row.hsn}-${row.taxType}-${index}`}>
                      <TableTd className="text-center">{row.hsn}</TableTd>
                      <TableTd className="text-right">
                        {inrCurrency(row.taxableValue)}
                      </TableTd>
                      <TableTd className="text-center">
                        {row.taxType === "IGST" ? "IGST" : "CGST + SGST"}
                      </TableTd>
                      <TableTd className="text-center">
                        {row.taxType === "IGST"
                          ? toNumber(row.igstRate).toFixed(2)
                          : `${toNumber(row.cgstRate).toFixed(2)} + ${toNumber(
                              row.sgstRate,
                            ).toFixed(2)}`}
                      </TableTd>
                      <TableTd className="text-right">
                        {inrCurrency(row.cgstAmount)}
                      </TableTd>
                      <TableTd className="text-right">
                        {inrCurrency(row.sgstAmount)}
                      </TableTd>
                      <TableTd className="text-right">
                        {inrCurrency(row.igstAmount)}
                      </TableTd>
                      <TableTd className="text-right">
                        {inrCurrency(row.totalTax)}
                      </TableTd>
                    </tr>
                  ))}

                  <tr>
                    <TableTd className="font-bold">Total</TableTd>
                    <TableTd className="text-right font-bold">
                      {inrCurrency(subTotalExGst)}
                    </TableTd>
                    <TableTd />
                    <TableTd />
                    <TableTd className="text-right font-bold">
                      {inrCurrency(cgstAmount)}
                    </TableTd>
                    <TableTd className="text-right font-bold">
                      {inrCurrency(sgstAmount)}
                    </TableTd>
                    <TableTd className="text-right font-bold">
                      {inrCurrency(igstAmount)}
                    </TableTd>
                    <TableTd className="text-right font-bold">
                      {inrCurrency(totalGstAmount)}
                    </TableTd>
                  </tr>
                </tbody>
              </table>
            ) : null}

            <div className="px-2.5 py-2 text-[11px] text-gray-700">
              Tax amount (in words) : <b>{amountToWordsINR(totalGstAmount)}</b>
            </div>

            {/* Footer — bank details belong to the SELLER (vendor) here,
                since Corpseed pays the vendor against this invoice. */}
            <div className="grid grid-cols-2 gap-3 border-t border-gray-300 p-2.5">
              <div className="text-[11px]">
                <b>Remark :</b>
              </div>

              <div className="text-[11px]">
                <div className="mb-1 text-gray-500">Vendor bank detail</div>
                <div>
                  Bank name : <b>{seller.bankName || "NA"}</b>
                </div>
                <div>
                  A/C No. : <b>{seller.accountNo || "NA"}</b>
                </div>
                <div>
                  IFSC Code : <b>{seller.ifscCode || "NA"}</b>
                </div>
              </div>
            </div>

            <div className="px-2.5 pb-2 pt-3 text-right text-[11px]">
              <div>for {(seller.name || "").toLowerCase()}</div>
              <div className="mt-1 h-14" />
              <div className="text-gray-500">(Authorised Signatory)</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default memo(PurchaseInvoiceView);
