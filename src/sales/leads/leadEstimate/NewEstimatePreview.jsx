import html2canvas from "html2canvas-pro";
import jsPDF from "jspdf";
import { memo, useMemo, useRef, useState } from "react";
import logo from "../../../assets/CORPSEED.webp";
import dayjs from "dayjs";
import { inrCurrency, numberToWords } from "../../../common";

const toNumber = (value) => {
  if (value === null || value === undefined || value === "") return 0;

  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
};

const hasValue = (value) =>
  value !== null && value !== undefined && value !== "";

const formatDate = (value) => {
  if (!value) return "NA";

  const parsedDate = dayjs(value);
  return parsedDate.isValid() ? parsedDate.format("DD-MM-YYYY") : "NA";
};

const formatRate = (value) => {
  const rate = toNumber(value);
  return Number.isInteger(rate) ? `${rate}%` : `${rate.toFixed(2)}%`;
};

const getTaxableValue = (item) => {
  if (hasValue(item?.lineTotalExGst)) {
    return toNumber(item.lineTotalExGst);
  }

  return toNumber(item?.quantity) * toNumber(item?.unitPriceExGst);
};

/**
 * Calculates the tax breakup from each line item's igstFlag.
 *
 * igstFlag = true  -> complete GST amount goes to IGST.
 * igstFlag = false -> GST amount is divided between CGST and SGST.
 */
const calculateLineTax = (item, gstEnabled = true) => {
  const taxableValue = getTaxableValue(item);
  const gstRate = toNumber(item?.gstRate);

  const suppliedCgst = toNumber(item?.cgstAmount);
  const suppliedSgst = toNumber(item?.sgstAmount);
  const suppliedIgst = toNumber(item?.igstAmount);
  const suppliedGst = toNumber(item?.gstAmount);

  const isIgst = item?.igstFlag === true || suppliedIgst > 0;

  if (!gstEnabled || gstRate <= 0) {
    return {
      isIgst,
      taxableValue,
      gstRate: 0,
      cgstRate: 0,
      sgstRate: 0,
      igstRate: 0,
      cgstAmount: 0,
      sgstAmount: 0,
      igstAmount: 0,
      totalTaxAmount: 0,
    };
  }

  const calculatedGst = (taxableValue * gstRate) / 100;

  if (isIgst) {
    const igstAmount =
      suppliedIgst > 0
        ? suppliedIgst
        : suppliedGst > 0
          ? suppliedGst
          : calculatedGst;

    return {
      isIgst: true,
      taxableValue,
      gstRate,
      cgstRate: 0,
      sgstRate: 0,
      igstRate: gstRate,
      cgstAmount: 0,
      sgstAmount: 0,
      igstAmount,
      totalTaxAmount: igstAmount,
    };
  }

  const suppliedComponentTotal = suppliedCgst + suppliedSgst;
  const totalIntraStateTax =
    suppliedComponentTotal > 0
      ? suppliedComponentTotal
      : suppliedGst > 0
        ? suppliedGst
        : calculatedGst;

  const cgstAmount = suppliedCgst > 0 ? suppliedCgst : totalIntraStateTax / 2;
  const sgstAmount = suppliedSgst > 0 ? suppliedSgst : totalIntraStateTax / 2;

  return {
    isIgst: false,
    taxableValue,
    gstRate,
    cgstRate: gstRate / 2,
    sgstRate: gstRate / 2,
    igstRate: 0,
    cgstAmount,
    sgstAmount,
    igstAmount: 0,
    totalTaxAmount: cgstAmount + sgstAmount,
  };
};

const buildTaxSummaryRows = (items, gstEnabled) => {
  const summaryMap = new Map();

  items.forEach((item) => {
    const tax = calculateLineTax(item, gstEnabled);
    const hsnSacCode = item?.hsnSacCode || "-";
    const taxType = tax.isIgst ? "IGST" : "INTRA";
    const key = `${hsnSacCode}_${taxType}_${tax.gstRate}`;

    if (!summaryMap.has(key)) {
      summaryMap.set(key, {
        hsnSacCode,
        isIgst: tax.isIgst,
        taxableValue: 0,
        cgstRate: tax.cgstRate,
        sgstRate: tax.sgstRate,
        igstRate: tax.igstRate,
        cgstAmount: 0,
        sgstAmount: 0,
        igstAmount: 0,
        totalTaxAmount: 0,
      });
    }

    const row = summaryMap.get(key);
    row.taxableValue += tax.taxableValue;
    row.cgstAmount += tax.cgstAmount;
    row.sgstAmount += tax.sgstAmount;
    row.igstAmount += tax.igstAmount;
    row.totalTaxAmount += tax.totalTaxAmount;
  });

  return Array.from(summaryMap.values());
};

const NewEstimatePreview = ({ details = {}, due, viewType }) => {
  const contentRef = useRef(null);
  const [copyText, setCopyText] = useState("Copy URL");

  const lineItems = useMemo(() => {
    const items = Array.isArray(details?.lineItems) ? details.lineItems : [];

    return [...items].sort(
      (first, second) =>
        toNumber(first?.displayOrder) - toNumber(second?.displayOrder),
    );
  }, [details?.lineItems]);

  const gstEnabled =
    details?.gstApplicable !== false && details?.zeroRatedSupply !== true;

  const seller = useMemo(
    () => ({
      name: details?.organizationName || "Corpseed ITES Private Limited",
      cinNumber: details?.organizationCinNumber || "",
      gstNo: details?.organizationGstNo || "",
      panNo: details?.organizationPanNo || "",
      email: details?.organizationEmail || "",
      phone: details?.organizationPhone || "",
      website: details?.organizationWebsite || "",
      logoUrl: details?.organizationLogoUrl || logo,
      address: [
        details?.organizationAddressLine1,
        details?.organizationAddressLine2,
        details?.organizationCity,
        details?.organizationState,
        details?.organizationCountry,
        details?.organizationPinCode,
      ]
        .filter(Boolean)
        .join(", "),
      bankName: details?.organizationBankName || "",
      accountHolderName: details?.organizationAccountHolderName || "",
      accountNo: details?.organizationAccountNo || "",
      ifscCode: details?.organizationIfscCode || "",
      bankBranch: details?.organizationBankBranch || "",
      swiftCode: details?.organizationSwiftCode || "",
      upiId: details?.organizationUpiId || "",
      paymentPageLink: details?.organizationPaymentPageLink || "",
    }),
    [details],
  );

  const buyer = useMemo(() => {
    const unit = details?.unit || {};

    return {
      name:
        details?.companyUnitName ||
        unit?.unitName ||
        details?.companyName ||
        "NA",
      gstNo:
        details?.companyUnitGstNo || unit?.gstNo || details?.buyerGstin || "",
      contactName: details?.contactName || "",
      address: [
        details?.companyUnitAddressLine1 || unit?.addressLine1,
        details?.companyUnitAddressLine2 || unit?.addressLine2,
        details?.companyUnitCity || unit?.city,
        details?.companyUnitState || unit?.state,
        details?.companyUnitCountry || unit?.country,
        details?.companyUnitPinCode || unit?.pinCode,
      ]
        .filter(Boolean)
        .join(", "),
    };
  }, [details]);

  const documentMeta = useMemo(() => {
    const isTaxInvoice = Boolean(details?.invoiceNumber);

    if (isTaxInvoice) {
      return {
        label: "Tax Invoice",
        number: details.invoiceNumber,
        dateLabel: "Invoice Date:",
        date: details?.invoiceDate,
      };
    }

    if (viewType === "PI") {
      return {
        label: "Proforma Invoice",
        number: details?.performanceInvoiceNumber || "",
        dateLabel: "Proforma Invoice Date:",
        date: details?.estimateDate,
      };
    }

    return {
      label: "Estimate",
      number: details?.estimateNumber || "",
      dateLabel: "Estimate Date:",
      date: details?.estimateDate,
    };
  }, [details, viewType]);

  const calculatedTaxTotals = useMemo(
    () =>
      lineItems.reduce(
        (totals, item) => {
          const tax = calculateLineTax(item, gstEnabled);

          totals.taxableValue += tax.taxableValue;
          totals.cgstAmount += tax.cgstAmount;
          totals.sgstAmount += tax.sgstAmount;
          totals.igstAmount += tax.igstAmount;
          totals.totalGstAmount += tax.totalTaxAmount;

          return totals;
        },
        {
          taxableValue: 0,
          cgstAmount: 0,
          sgstAmount: 0,
          igstAmount: 0,
          totalGstAmount: 0,
        },
      ),
    [lineItems, gstEnabled],
  );

  const apiGrandTotal = toNumber(details?.grandTotal);
  const apiTotalGstAmount = toNumber(details?.totalGstAmount);

  const subTotalExGst =
    lineItems.length > 0
      ? calculatedTaxTotals.taxableValue
      : hasValue(details?.subTotalExGst)
        ? toNumber(details.subTotalExGst)
        : Math.max(apiGrandTotal - apiTotalGstAmount, 0);

  const cgstAmount =
    lineItems.length > 0
      ? calculatedTaxTotals.cgstAmount
      : toNumber(details?.cgstAmount);

  const sgstAmount =
    lineItems.length > 0
      ? calculatedTaxTotals.sgstAmount
      : toNumber(details?.sgstAmount);

  const igstAmount =
    lineItems.length > 0
      ? calculatedTaxTotals.igstAmount
      : toNumber(details?.igstAmount);

  const totalGstAmount =
    lineItems.length > 0
      ? calculatedTaxTotals.totalGstAmount
      : apiTotalGstAmount;

  const grandTotal = hasValue(details?.grandTotal)
    ? apiGrandTotal
    : subTotalExGst + totalGstAmount;

  const hasCgstSgst = cgstAmount > 0 || sgstAmount > 0;
  const hasIgst = igstAmount > 0;

  const taxSummaryRows = useMemo(() => {
    const itemRows = buildTaxSummaryRows(lineItems, gstEnabled);

    if (itemRows.length > 0) return itemRows;
    if (totalGstAmount <= 0) return [];

    const inferredRate =
      subTotalExGst > 0 ? (totalGstAmount / subTotalExGst) * 100 : 0;

    return [
      {
        hsnSacCode: "-",
        isIgst: hasIgst && !hasCgstSgst,
        taxableValue: subTotalExGst,
        cgstRate: hasCgstSgst ? inferredRate / 2 : 0,
        sgstRate: hasCgstSgst ? inferredRate / 2 : 0,
        igstRate: hasIgst ? inferredRate : 0,
        cgstAmount,
        sgstAmount,
        igstAmount,
        totalTaxAmount: totalGstAmount,
      },
    ];
  }, [
    lineItems,
    gstEnabled,
    totalGstAmount,
    subTotalExGst,
    hasIgst,
    hasCgstSgst,
    cgstAmount,
    sgstAmount,
    igstAmount,
  ]);

  const showBankDetails = Boolean(
    seller.bankName ||
      seller.accountHolderName ||
      seller.accountNo ||
      seller.ifscCode ||
      seller.upiId ||
      seller.paymentPageLink,
  );

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
    const element = contentRef.current;
    if (!element) return;

    const printWindow = window.open("", "_blank", "width=1000,height=800");
    if (!printWindow) return;

    printWindow.document.write(`
      <html>
        <head>
          <title>${documentMeta.label} - ${documentMeta.number || ""}</title>
          <style>
            * { box-sizing: border-box; }
            body {
              margin: 0;
              padding: 20px;
              font-family: Arial, sans-serif;
              color: #111827;
              background: #ffffff;
            }
            table { width: 100%; border-collapse: collapse; }
            th, td {
              border: 1px solid #d1d5db;
              padding: 4px;
              font-size: 11px;
            }
            th { background: #f3f4f6; }
            img { max-width: 120px; }
            .shadow-md, .shadow-sm { box-shadow: none !important; }
            .rounded-xl, .rounded-lg { border-radius: 0 !important; }
            @media print {
              body { padding: 0; }
              @page { size: A4; margin: 12mm; }
            }
          </style>
        </head>
        <body>${element.innerHTML}</body>
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
    const subject = encodeURIComponent(
      `${documentMeta.label} - ${documentMeta.number || "Document"}`,
    );

    const body = encodeURIComponent(
      `Dear Sir/Ma'am,

Please find the ${documentMeta.label} details below:

${documentMeta.label} No.: ${documentMeta.number || "NA"}
Date: ${formatDate(documentMeta.date)}
Amount: ${inrCurrency(grandTotal)}
URL: ${getShareUrl()}

Regards,
Corpseed Team`,
    );

    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  };

  const downloadPDF = async () => {
    const element = contentRef.current;
    if (!element) return;

    try {
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        logging: false,
        backgroundColor: "#ffffff",
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = pdfWidth;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
      heightLeft -= pdfHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
        heightLeft -= pdfHeight;
      }

      pdf.save(`${documentMeta.number || details?.id || "document"}.pdf`);
    } catch (error) {
      console.error("PDF generation failed:", error);
    }
  };

  return (
    <div className="2xl:max-h-[68vh] md:max-h-[65vh] overflow-auto mt-4 px-2 md:px-4 lg:px-6">
      <div className="w-full mx-auto flex flex-col gap-8 border rounded-xl p-3 md:p-4 shadow-md bg-white">
        <div ref={contentRef} className="relative">
          <div className="bg-white rounded-xl p-4 space-y-6">
            <div className="flex flex-col md:flex-row justify-between gap-4">
              <div>
                <img
                  src={seller.logoUrl}
                  alt={seller.name || "organization logo"}
                  crossOrigin="anonymous"
                  className="w-22 md:w-28 max-h-16 object-contain"
                  onError={(event) => {
                    event.currentTarget.onerror = null;
                    event.currentTarget.src = logo;
                  }}
                />

                <div className="mt-2 text-gray-700 text-xs leading-relaxed">
                  <p className="font-semibold text-sm">{seller.name}</p>
                  {seller.cinNumber && <p>CIN : {seller.cinNumber}</p>}
                  {seller.gstNo && <p>GST : {seller.gstNo}</p>}
                  {seller.panNo && <p>PAN : {seller.panNo}</p>}
                  {seller.address && <p>{seller.address}</p>}
                  {seller.email && <p>Email : {seller.email}</p>}
                  {seller.phone && <p>Phone : {seller.phone}</p>}
                  {seller.website && <p>Website : {seller.website}</p>}
                </div>
              </div>

              <div className="flex flex-col items-end gap-4">
                <div>
                  <h4 className="text-green-600 text-base font-semibold text-end">
                    {documentMeta.label}
                  </h4>
                  <p className="font-medium text-gray-700 text-sm text-end">
                    {documentMeta.number || "NA"}
                  </p>
                </div>

                <div className="text-xs space-y-1 mt-2.5 text-end">
                  <p className="whitespace-nowrap">
                    <span className="font-semibold">
                      {documentMeta.dateLabel}
                    </span>{" "}
                    {formatDate(documentMeta.date)}
                  </p>

                  {details?.validUntil && (
                    <p className="whitespace-nowrap">
                      <span className="font-semibold">Valid till date:</span>{" "}
                      {formatDate(details.validUntil)}
                    </p>
                  )}

                  {details?.estimateNumber && details?.invoiceNumber && (
                    <p className="whitespace-nowrap">
                      <span className="font-semibold">Estimate No.:</span>{" "}
                      {details.estimateNumber}
                    </p>
                  )}

                  {details?.unbilledNumber && (
                    <p className="whitespace-nowrap">
                      <span className="font-semibold">Unbilled No.:</span>{" "}
                      {details.unbilledNumber}
                    </p>
                  )}
                </div>

                {due !== null && due !== undefined && (
                  <div className="flex items-end flex-col">
                    <h4 className="text-red-600 text-base font-semibold">
                      Due Amount
                    </h4>
                    <p className="font-medium text-gray-700 text-sm">
                      {inrCurrency(due)}
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="flex flex-col md:flex-row justify-between gap-6">
              <div className="md:max-w-[45%] text-wrap text-xs">
                <p className="font-semibold text-gray-400 mb-1">Bill To</p>
                <p className="font-medium">{buyer.name}</p>
                {buyer.gstNo && <p>GSTIN: {buyer.gstNo}</p>}
                {buyer.contactName && <p>Contact: {buyer.contactName}</p>}
                <p>{buyer.address || "NA"}</p>
              </div>

              <div className="md:max-w-[45%] text-wrap text-xs md:text-right">
                <p className="font-semibold text-gray-400 mb-1">Ship To</p>
                <p className="font-medium">{buyer.name}</p>
                {buyer.gstNo && <p>GSTIN: {buyer.gstNo}</p>}
                {buyer.contactName && <p>Contact: {buyer.contactName}</p>}
                <p>{buyer.address || "NA"}</p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full border text-xs shadow-sm rounded-lg overflow-hidden">
                <thead className="bg-gray-100 text-gray-700">
                  <tr>
                    <th className="border p-1">#</th>
                    <th className="border p-1">Item &amp; Description</th>
                    <th className="border p-1">HSN/SAC</th>
                    <th className="border p-1">Qty</th>
                    <th className="border p-1">Rate</th>
                    <th className="border p-1">GST Breakup</th>
                    <th className="border p-1">GST Amt</th>
                    <th className="border p-1 font-semibold">Amount (₹)</th>
                  </tr>
                </thead>

                <tbody>
                  {details?.solutionName && (
                    <tr className="bg-gray-50">
                      <td className="border p-1 text-center font-medium" />
                      <td colSpan={7} className="border p-2">
                        <span className="text-sm font-semibold text-gray-800">
                          {details.solutionName}
                        </span>
                      </td>
                    </tr>
                  )}

                  {lineItems.length === 0 ? (
                    <tr>
                      <td
                        colSpan={8}
                        className="border p-3 text-center text-gray-500"
                      >
                        No line-item details available
                      </td>
                    </tr>
                  ) : (
                    lineItems.map((item, index) => {
                      const tax = calculateLineTax(item, gstEnabled);
                      const lineTotal = tax.taxableValue + tax.totalTaxAmount;

                      const taxLabel = !gstEnabled
                        ? "GST not applicable"
                        : tax.isIgst
                          ? `IGST ${formatRate(tax.igstRate)}`
                          : `CGST ${formatRate(tax.cgstRate)} + SGST ${formatRate(
                              tax.sgstRate,
                            )}`;

                      return (
                        <tr key={item?.id ?? index}>
                          <td className="border p-1 text-center font-medium">
                            {index + 1}
                          </td>
                          <td className="border p-1">
                            <div className="font-medium">
                              {item?.itemName || "NA"}
                            </div>
                            {item?.description && (
                              <div className="text-[11px] text-gray-500">
                                {item.description}
                              </div>
                            )}
                          </td>
                          <td className="border p-1 text-center">
                            {item?.hsnSacCode || "-"}
                          </td>
                          <td className="border p-1 text-center">
                            {toNumber(item?.quantity)}
                          </td>
                          <td className="border p-1 text-center">
                            {inrCurrency(item?.unitPriceExGst)}
                          </td>
                          <td className="border p-1 text-center">{taxLabel}</td>
                          <td className="border p-1 text-center">
                            {inrCurrency(tax.totalTaxAmount)}
                          </td>
                          <td className="border p-1 text-center font-semibold">
                            {inrCurrency(
                              hasValue(item?.lineTotalWithGst)
                                ? item.lineTotalWithGst
                                : lineTotal,
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}

                  <tr className="bg-gray-50">
                    <td
                      colSpan={7}
                      className="border p-1 text-right font-semibold"
                    >
                      Sub Total
                    </td>
                    <td className="border p-1 text-center font-semibold">
                      {inrCurrency(subTotalExGst)}
                    </td>
                  </tr>

                  {hasCgstSgst && (
                    <>
                      <tr className="bg-gray-50">
                        <td
                          colSpan={7}
                          className="border p-1 text-right font-semibold"
                        >
                          CGST
                        </td>
                        <td className="border p-1 text-center font-semibold">
                          {inrCurrency(cgstAmount)}
                        </td>
                      </tr>
                      <tr className="bg-gray-50">
                        <td
                          colSpan={7}
                          className="border p-1 text-right font-semibold"
                        >
                          SGST
                        </td>
                        <td className="border p-1 text-center font-semibold">
                          {inrCurrency(sgstAmount)}
                        </td>
                      </tr>
                    </>
                  )}

                  {hasIgst && (
                    <tr className="bg-gray-50">
                      <td
                        colSpan={7}
                        className="border p-1 text-right font-semibold"
                      >
                        IGST
                      </td>
                      <td className="border p-1 text-center font-semibold">
                        {inrCurrency(igstAmount)}
                      </td>
                    </tr>
                  )}

                  {!hasCgstSgst && !hasIgst && (
                    <tr className="bg-gray-50">
                      <td
                        colSpan={7}
                        className="border p-1 text-right font-semibold"
                      >
                        Total GST
                      </td>
                      <td className="border p-1 text-center font-semibold">
                        {inrCurrency(totalGstAmount)}
                      </td>
                    </tr>
                  )}

                  <tr className="bg-gray-100">
                    <td
                      colSpan={7}
                      className="border p-1 text-right font-semibold"
                    >
                      Grand Total
                    </td>
                    <td className="border p-1 text-center font-semibold">
                      {inrCurrency(grandTotal)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <p className="text-right text-xs mt-3">
              <span className="font-semibold">Amount (in words): </span>
              <span className="capitalize text-gray-700">
                {numberToWords(grandTotal)}
              </span>
            </p>

            <div className="mt-6">
              <p className="font-semibold text-sm mb-2 text-gray-800">
                Tax Details
              </p>

              {taxSummaryRows.length === 0 ? (
                <div className="border p-3 text-center text-xs text-gray-500">
                  GST is not applicable for this document.
                </div>
              ) : (
                <table className="w-full border text-xs shadow-sm rounded-lg overflow-hidden">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="border p-1 text-left">HSN/SAC</th>
                      <th className="border p-1 text-center">Taxable Value</th>
                      {hasCgstSgst && (
                        <>
                          <th className="border p-1 text-center">CGST %</th>
                          <th className="border p-1 text-center">
                            CGST Amount
                          </th>
                          <th className="border p-1 text-center">SGST %</th>
                          <th className="border p-1 text-center">
                            SGST Amount
                          </th>
                        </>
                      )}
                      {hasIgst && (
                        <>
                          <th className="border p-1 text-center">IGST %</th>
                          <th className="border p-1 text-center">
                            IGST Amount
                          </th>
                        </>
                      )}
                      <th className="border p-1 text-center">Total Tax</th>
                    </tr>
                  </thead>

                  <tbody>
                    {taxSummaryRows.map((row, index) => (
                      <tr key={`${row.hsnSacCode}-${index}`}>
                        <td className="border p-1">{row.hsnSacCode}</td>
                        <td className="border p-1 text-center">
                          {inrCurrency(row.taxableValue)}
                        </td>

                        {hasCgstSgst && (
                          <>
                            <td className="border p-1 text-center">
                              {row.cgstAmount > 0
                                ? formatRate(row.cgstRate)
                                : "-"}
                            </td>
                            <td className="border p-1 text-center">
                              {inrCurrency(row.cgstAmount)}
                            </td>
                            <td className="border p-1 text-center">
                              {row.sgstAmount > 0
                                ? formatRate(row.sgstRate)
                                : "-"}
                            </td>
                            <td className="border p-1 text-center">
                              {inrCurrency(row.sgstAmount)}
                            </td>
                          </>
                        )}

                        {hasIgst && (
                          <>
                            <td className="border p-1 text-center">
                              {row.igstAmount > 0
                                ? formatRate(row.igstRate)
                                : "-"}
                            </td>
                            <td className="border p-1 text-center">
                              {inrCurrency(row.igstAmount)}
                            </td>
                          </>
                        )}

                        <td className="border p-1 text-center font-semibold">
                          {inrCurrency(row.totalTaxAmount)}
                        </td>
                      </tr>
                    ))}

                    <tr className="bg-gray-50 font-semibold">
                      <td className="border p-1">Total</td>
                      <td className="border p-1 text-center">
                        {inrCurrency(subTotalExGst)}
                      </td>
                      {hasCgstSgst && (
                        <>
                          <td className="border p-1 text-center">-</td>
                          <td className="border p-1 text-center">
                            {inrCurrency(cgstAmount)}
                          </td>
                          <td className="border p-1 text-center">-</td>
                          <td className="border p-1 text-center">
                            {inrCurrency(sgstAmount)}
                          </td>
                        </>
                      )}
                      {hasIgst && (
                        <>
                          <td className="border p-1 text-center">-</td>
                          <td className="border p-1 text-center">
                            {inrCurrency(igstAmount)}
                          </td>
                        </>
                      )}
                      <td className="border p-1 text-center">
                        {inrCurrency(totalGstAmount)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              )}

              {showBankDetails && (
                <div className="mt-5 border rounded-lg p-3 text-xs text-gray-700">
                  <p className="font-semibold text-sm mb-2">Bank Details</p>
                  {seller.accountHolderName && (
                    <p>Account Holder: {seller.accountHolderName}</p>
                  )}
                  {seller.bankName && <p>Bank: {seller.bankName}</p>}
                  {seller.accountNo && <p>Account No.: {seller.accountNo}</p>}
                  {seller.ifscCode && <p>IFSC: {seller.ifscCode}</p>}
                  {seller.bankBranch && <p>Branch: {seller.bankBranch}</p>}
                  {seller.swiftCode && <p>SWIFT: {seller.swiftCode}</p>}
                  {seller.upiId && <p>UPI ID: {seller.upiId}</p>}
                  {seller.paymentPageLink && (
                    <p>Payment Link: {seller.paymentPageLink}</p>
                  )}
                </div>
              )}

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
                {details?.customerNotes && (
                  <div style={{ display: "flex", flexDirection: "column" }}>
                    <h4
                      style={{
                        margin: 0,
                        fontSize: 12,
                        fontWeight: 500,
                        color: "#111827",
                      }}
                    >
                      Note
                    </h4>
                    <p className="text-sm" style={{ margin: 0 }}>
                      {details.customerNotes}
                    </p>
                  </div>
                )}

                <div style={{ display: "flex", flexDirection: "column" }}>
                  <h4
                    style={{
                      margin: 0,
                      fontSize: 12,
                      fontWeight: 500,
                      color: "#111827",
                    }}
                  >
                    Terms &amp; Conditions
                  </h4>

                  <ul
                    style={{
                      margin: 0,
                      paddingLeft: 18,
                      lineHeight: 1.45,
                      listStyle: "outside",
                    }}
                  >
                    <li className="text-tiny italic">
                      This {documentMeta.label} is subject to the applicable
                      scope, statutory requirements, and agreed commercial
                      terms.
                    </li>
                    <li className="text-tiny italic">
                      Payments shall be made as per agreed timelines; delays may
                      attract applicable charges.
                    </li>
                    <li className="text-tiny italic">
                      Taxes, government fees, and statutory charges shall be
                      payable as applicable at the time of invoicing.
                    </li>
                    <li className="text-tiny italic">
                      Services once initiated are non-refundable, except in case
                      of material default attributable to the service provider.
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="sticky bottom-2 z-20 mx-auto flex w-fit flex-wrap items-center justify-center gap-2 rounded-full border border-gray-200 bg-white/95 px-3 py-2 shadow-lg backdrop-blur">
          <button
            type="button"
            onClick={handleCopyUrl}
            className="rounded-full border border-gray-200 bg-gray-50 px-4 py-2 text-xs font-semibold text-gray-700 transition-all hover:bg-gray-100 active:scale-95"
          >
            {copyText}
          </button>

          <button
            type="button"
            onClick={handlePrint}
            className="rounded-full border border-blue-200 bg-blue-50 px-4 py-2 text-xs font-semibold text-blue-700 transition-all hover:bg-blue-100 active:scale-95"
          >
            Print
          </button>

          <button
            type="button"
            onClick={handleShareViaEmail}
            className="rounded-full border border-purple-200 bg-purple-50 px-4 py-2 text-xs font-semibold text-purple-700 transition-all hover:bg-purple-100 active:scale-95"
          >
            Share Email
          </button>

          <button
            type="button"
            onClick={downloadPDF}
            className="rounded-full bg-green-600 px-4 py-2 text-xs font-semibold text-white shadow-sm transition-all hover:bg-green-700 active:scale-95"
          >
            Download PDF
          </button>
        </div>
      </div>
    </div>
  );
};

export default memo(NewEstimatePreview);
