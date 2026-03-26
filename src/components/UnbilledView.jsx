import React, { memo, useMemo, useRef } from "react";
import logo from "../assets/CORPSEED.webp";
import signature from "../assets/signature.png";
import html2canvas from "html2canvas-pro";
import jsPDF from "jspdf";
import dayjs from "dayjs";
import numWords from "num-words";
import { inrCurrency } from "../common";

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

const buildTaxSummaryRows = (lineItems = []) => {
  const map = new Map();

  for (const it of lineItems) {
    const hsn = it?.hsnSacCode || "";
    const rate = toNumber(it?.gstRate);
    const key = `${hsn}__${rate}`;

    const taxable = toNumber(it?.lineTotalExGst);
    const cgstAmt = toNumber(it?.cgstAmount);
    const sgstAmt = toNumber(it?.sgstAmount);

    if (!map.has(key)) {
      map.set(key, {
        hsn,
        taxableValue: 0,
        cgstRate: rate ? rate / 2 : 0,
        cgstAmount: 0,
        sgstRate: rate ? rate / 2 : 0,
        sgstAmount: 0,
        totalTax: 0,
      });
    }

    const row = map.get(key);
    row.taxableValue += taxable;
    row.cgstAmount += cgstAmt;
    row.sgstAmount += sgstAmt;
    row.totalTax += cgstAmt + sgstAmt;
  }

  return Array.from(map.values());
};

/** -------------------------
 * Component
 * ------------------------- */
const UnbilledView = ({ invoiceData, heading }) => {
  const printRef = useRef(null);

  const seller = useMemo(
    () => ({
      name: "Corpseed Ites Private Limited",
      addressLine1:
        "3rd Floor, A-5, Grovy Optiva IT Park, Sector 68 Noida,Gautam budh Nagar,Uttar Pradesh , 201301",
      gstin: "09AAHCC4539J1ZC",
      stateName: "Uttar Pradesh",
      stateCode: "09",
      email: "info@corpseed.com",
      bankName: "IDFC FIRST BANK",
      accountNo: "10052624515",
      branchIfsc: "Noida,Sector-63 Branch & IDFB0021331",
    }),
    [],
  );

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
  const cgstAmount = toNumber(inv?.cgstAmount);
  const sgstAmount = toNumber(inv?.sgstAmount);
  const totalGstAmount = toNumber(inv?.totalGstAmount);
  const grandTotal = toNumber(inv?.grandTotal);

  const halfRatesLabel = useMemo(() => getHalfGstRatesLabel(items), [items]);

  console.log("sdjkfskjdg", taxSummaryRows);

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

    pdf.save(`${inv?.unbilledNumber || "unbill"}.pdf`);
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
      <div className="mb-3 flex justify-end">
        <button
          onClick={downloadPDF}
          className="cursor-pointer rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-900"
        >
          Download PDF
        </button>
      </div>

      {/* Screen preview A4 */}
      <div className="mx-auto w-[210mm] bg-gray-50 p-3">
        {/* ✅ IMPORTANT: remove min-h-[297mm] to avoid 2 pages */}
        <div
          ref={printRef}
          className="antialiased bg-white text-gray-900"
          style={{
            width: `${CONTENT_W_MM}mm`, // ✅ matches printable area (A4 - margins)
            margin: "0 auto",
          }}
        >
          {/* Invoice Heading */}
          <div className="border border-gray-300">
            <div className="border-b border-gray-300 py-2 text-center">
              <div className="text-[16px] font-extrabold tracking-wide">
                {heading ? heading : "INVOICE"}
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
                    <div className="text-[10px] text-gray-500">Due amount</div>
                    <div className="h-4 text-[11px] font-bold">
                      {inrCurrency(inv?.outstandingAmount)}
                    </div>
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

                <tr>
                  <TableTd className="text-center">{items.length + 1}</TableTd>
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

                <tr>
                  <TableTd className="text-center">{items.length + 2}</TableTd>
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
                      {inrCurrency(r.cgstRate)}
                    </TableTd>
                    <TableTd className="text-right">
                      {inrCurrency(r.cgstAmount)}
                    </TableTd>
                    <TableTd className="text-center">
                      {toNumber(r.sgstRate)}
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
          </div>
        </div>
      </div>
    </div>
  );
};

export default memo(UnbilledView);
