import html2canvas from "html2canvas-pro";
import jsPDF from "jspdf";
import { memo, useEffect, useRef, useState } from "react";
import logo from "../../../assets/CORPSEED.webp";
import dayjs from "dayjs";
import numWords from "num-words";
import { inrCurrency, numberToWords } from "../../../common";
import { useDispatch, useSelector } from "react-redux";
import { getOrganizationByName } from "../../../toolkit/slices/organizationSlice";

const NewEstimatePreview = ({ details, due, viewType }) => {
  const dispatch = useDispatch();
  const contentRef = useRef();
  const [copyText, setCopyText] = useState("Copy URL");
  const organizationDetail = useSelector(
    (state) => state.organization.organizationDetail,
  );

  useEffect(() => {
    dispatch(getOrganizationByName());
  }, [dispatch]);

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
    const element = contentRef.current;

    if (!element) return;

    const printWindow = window.open("", "_blank", "width=1000,height=800");

    if (!printWindow) return;

    printWindow.document.write(`
    <html>
      <head>
        <title>${viewType === "PI" ? "Proforma Invoice" : "Estimate"} - ${
          viewType === "PI"
            ? details?.performanceInvoiceNumber || ""
            : details?.estimateNumber || ""
        }</title>
        <style>
          * {
            box-sizing: border-box;
          }

          body {
            margin: 0;
            padding: 20px;
            font-family: Arial, sans-serif;
            color: #111827;
            background: #ffffff;
          }

          table {
            width: 100%;
            border-collapse: collapse;
          }

          th,
          td {
            border: 1px solid #d1d5db;
            padding: 4px;
            font-size: 11px;
          }

          th {
            background: #f3f4f6;
          }

          img {
            max-width: 120px;
          }

          .shadow-md,
          .shadow-sm {
            box-shadow: none !important;
          }

          .rounded-xl,
          .rounded-lg {
            border-radius: 0 !important;
          }

          @media print {
            body {
              padding: 0;
            }

            @page {
              size: A4;
              margin: 12mm;
            }
          }
        </style>
      </head>

      <body>
        ${element.innerHTML}
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
    const estimateNo =
      viewType === "PI"
        ? details?.performanceInvoiceNumber || "Proforma Invoice"
        : details?.estimateNumber || "Estimate";

    const subject = encodeURIComponent(
      `${viewType === "PI" ? "Proforma Invoice" : "Estimate"} - ${estimateNo}`,
    );

    const body = encodeURIComponent(
      `Dear Sir/Ma'am,

Please find the ${
        viewType === "PI" ? "Proforma Invoice" : "Estimate"
      } details below:

${viewType === "PI" ? "Proforma Invoice No." : "Estimate No."}: ${estimateNo}
Amount: ${inrCurrency(details?.grandTotal || 0)}
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

      pdf.save(`estimate_${details?.id || "ESTD"}.pdf`);
    } catch (error) {
      console.error("PDF generation failed:", error);
    }
  };

  return (
    <div className="2xl:max-h-[68vh] md:max-h-[65vh] overflow-auto mt-4 px-2 md:px-4 lg:px-6">
      <div className="w-full md:w-full lg:w-full mx-auto flex flex-col gap-8 border rounded-xl p-3 md:p-4 shadow-md bg-white">
        <div ref={contentRef} className="relative">
          {/* <div className="absolute left-4 top-4 bg-green-600 text-white font-medium px-4 py-1.5 rounded-md text-sm shadow-md">
            {viewType === "PI" ? "Proforma Invoice" : "Estimate"}
          </div> */}
          <div className="bg-white rounded-xl p-4 md:p-4 space-y-6">
            <div className="flex flex-col md:flex-row justify-between gap-4">
              <div>
                <img src={logo} alt="corpseed" className="w-22 md:w-28" />
                <div className="mt-2 text-gray-700 text-xs leading-relaxed">
                  <p className="font-semibold text-sm">
                    {organizationDetail?.name}
                  </p>
                  <p className="text-xs">
                    CIN : {organizationDetail?.cinNumber}
                  </p>
                  <p className="text-xs">GST : {organizationDetail?.gstNo}</p>
                  <p className="text-xs">{organizationDetail?.addressLine1}</p>
                  <p className="text-xs">
                    {organizationDetail?.city}, {organizationDetail?.state},{" "}
                    {organizationDetail?.country} -{" "}
                    {organizationDetail?.pinCode}
                  </p>
                </div>
              </div>
              <div className="flex flex-col items-end gap-4">
                <div>
                  <h4 className="text-green-600 text-base font-semibold text-end">
                    {viewType === "PI" ? "Proforma Invoice" : "Estimate"}
                  </h4>
                  <p className="font-medium text-gray-700 text-sm text-end">
                    {viewType === "PI"
                      ? details?.performanceInvoiceNumber
                      : details?.estimateNumber}
                  </p>
                </div>

                <div className="text-xs space-y-1 mt-2.5 text-end">
                  <p className="whitespace-nowrap">
                    <span className="font-semibold">
                      {viewType === "PI"
                        ? "Proforma Invoice Date:"
                        : "Estimate Date:"}
                    </span>{" "}
                    {dayjs(details?.estimateDate).format("DD-MM-YYYY")}
                  </p>
                  <p className="whitespace-nowrap">
                    <span className="font-semibold">Valid till date:</span>{" "}
                    {dayjs(details?.validUntil).format("DD-MM-YYYY")}
                  </p>
                </div>

                {/* <div className="flex items-end flex-col">
                  <h4 className="text-green-600 text-base font-semibold">
                    Order No.
                  </h4>
                  <p className="font-medium text-gray-700 text-sm">
                    {details?.orderNumber}
                  </p>
                </div> */}
                {due && (
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
              <div className="max-w-[35%] text-wrap text-xs">
                <p className="font-semibold text-gray-400 mb-1">Bill To ,</p>
                <p className="font-medium">{details?.unit?.unitName}</p>
                {details?.unit?.gstNo && <p>GSTIN: {details?.unit?.gstNo}</p>}
                <p>
                  {[
                    details?.unit?.addressLine1,
                    details?.unit?.addressLine2,
                    details?.unit?.city,
                    details?.unit?.state,
                    details?.unit?.country,
                    details?.unit?.pinCode,
                  ]
                    ?.filter(Boolean)
                    .join(", ") || "NA"}
                </p>
              </div>
              <div className="max-w-[35%] text-wrap text-xs text-right">
                <p className="font-semibold text-gray-400 mb-1">Ship To ,</p>
                <p className="font-medium">{details?.unit?.unitName}</p>
                {details?.unit?.gstNo && <p>GSTIN: {details?.unit?.gstNo}</p>}
                <p>
                  {details?.unit?.addressLine1}{" "}
                  {[
                    details?.unit?.city,
                    details?.unit?.state,
                    details?.unit?.country,
                    details?.unit?.pinCode,
                  ]
                    ?.filter(Boolean)
                    .join(", ")}
                </p>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full border text-xs shadow-sm rounded-lg overflow-hidden">
                <thead className="bg-gray-100 text-gray-700">
                  <tr>
                    <th className="border p-1">#</th>
                    <th className="border p-1">Item & Description</th>
                    <th className="border p-1">HSN/SAC</th>
                    <th className="border p-1">Qty</th>
                    <th className="border p-1">Rate</th>
                    <th className="border p-1">GST %</th>
                    <th className="border p-1">GST Amt</th>
                    <th className="border p-1 font-semibold">Amount (₹)</th>
                  </tr>
                </thead>

                <tbody>
                  {details?.solutionName && (
                    <tr className="bg-gray-50">
                      <td className="border p-1 text-center font-medium"></td>
                      <td colSpan={8} className="border p-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-sm font-semibold text-gray-800">
                            {details.solutionName}
                          </span>
                        </div>
                      </td>
                    </tr>
                  )}
                  {details?.lineItems?.map((item, index) => (
                    <tr key={item.id}>
                      <td className="border p-1 text-center font-medium">
                        {index + 1}
                      </td>

                      <td className="border p-1">
                        <div className="font-medium">{item.itemName}</div>
                        {item.description && (
                          <div className="text-[11px] text-gray-500">
                            {item.description}
                          </div>
                        )}
                      </td>

                      <td className="border p-1 text-center">
                        {item.hsnSacCode}
                      </td>

                      <td className="border p-1 text-center">
                        {item.quantity}
                      </td>

                      <td className="border p-1 text-center">
                        {inrCurrency(item.unitPriceExGst)}
                      </td>

                      <td className="border p-1 text-center">
                        {item.gstRate}%
                      </td>

                      <td className="border p-1 text-center">
                        {inrCurrency(item.gstAmount)}
                      </td>

                      <td className="border p-1 text-center font-semibold">
                        {inrCurrency(item.lineTotalExGst + item.gstAmount)}
                      </td>
                    </tr>
                  ))}

                  {/* SUBTOTAL */}
                  <tr className="bg-gray-50">
                    <td
                      colSpan={7}
                      className="border p-1 text-right font-semibold"
                    >
                      Sub Total
                    </td>
                    <td className="border p-1 text-center font-semibold">
                      {inrCurrency(details?.subTotalExGst)}
                    </td>
                  </tr>

                  {/* GST */}
                  <tr className="bg-gray-50">
                    <td
                      colSpan={7}
                      className="border p-1 text-right font-semibold"
                    >
                      Total GST
                    </td>
                    <td className="border p-1 text-center font-semibold">
                      {inrCurrency(details?.totalGstAmount)}
                    </td>
                  </tr>

                  {/* GRAND TOTAL */}
                  <tr className="bg-gray-100">
                    <td
                      colSpan={7}
                      className="border p-1 text-right font-semibold"
                    >
                      Grand Total
                    </td>
                    <td className="border p-1 text-center font-semibold">
                      {inrCurrency(details?.grandTotal)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <p className="text-right text-xs mt-3">
              <span className="font-semibold">Amount (in words): </span>
              <span className="capitalize text-gray-700">
                {numberToWords(details?.grandTotal)}
              </span>
            </p>

            <div className="mt-6">
              <p className="font-semibold text-sm mb-2 text-gray-800">
                Tax Details
              </p>

              <table className="w-full border text-xs shadow-sm rounded-lg overflow-hidden">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="border p-1 text-left">HSN/SAC</th>
                    <th className="border p-1 text-center">SGST %</th>
                    <th className="border p-1 text-center">CGST %</th>
                    <th className="border p-1 text-center">IGST %</th>
                    <th className="border p-1 text-center">Amount</th>
                  </tr>
                </thead>

                <tbody>
                  {details?.lineItems?.map((item) => (
                    <tr key={item.id}>
                      <td className="border p-1">{item.hsnSacCode}</td>
                      <td className="border p-1 text-center">0%</td>
                      <td className="border p-1 text-center">0%</td>
                      <td className="border p-1 text-center">
                        {item.gstRate}%
                      </td>
                      <td className="border p-1 text-center">
                        {inrCurrency(item.gstAmount)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

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
                    <li className="text-tiny italic">
                      This{" "}
                      {details?.performanceInvoiceFlag
                        ? "Proforma Invoice"
                        : "Estimate"}{" "}
                      is valid for the period mentioned and subject to revision
                      upon change in scope or statutory requirements.
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
