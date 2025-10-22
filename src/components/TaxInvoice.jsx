import React, { useRef } from "react";
import { inrCurrency, toWords } from "../common";
import dayjs from "dayjs";
import signature from "../assets/signature.png";
import domToImage from "dom-to-image";
import jsPDF from "jspdf";
import { Button } from "@heroui/button";
import { Download } from "lucide-react";

const TaxInvoice = ({ detail }) => {
  const pdfRef = useRef();

  const generatePDF = async () => {
    const element = pdfRef.current;
    try {
      const pdf = new jsPDF("p", "mm", "a4");
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const scale = 4;

      const cloned = element.cloneNode(true);
      cloned.style.transform = `scale(${scale})`;
      cloned.style.transformOrigin = "top left";
      cloned.style.width = `${element.offsetWidth}px`;
      cloned.style.height = `${element.offsetHeight}px`;
      document.body.appendChild(cloned);

      const imgData = await domToImage.toPng(cloned, {
        quality: 1,
        width: element.offsetWidth * scale,
        height: element.offsetHeight * scale,
        bgcolor: "#ffffff",
      });

      document.body.removeChild(cloned);

      const img = new Image();
      img.src = imgData;
      img.onload = () => {
        const imgWidth = img.width;
        const imgHeight = img.height;

        const ratio = Math.min(pageWidth / imgWidth, pageHeight / imgHeight);
        const renderWidth = imgWidth * ratio;
        const renderHeight = imgHeight * ratio;

        const x = (pageWidth - renderWidth) / 2;
        const y = 0;

        pdf.addImage(imgData, "PNG", x, y, renderWidth, renderHeight);
        pdf.save("estimate.pdf");
      };
    } catch (error) {
      console.error("Error generating PDF:", error);
    }
  };

  const items = [
    {
      particulars: detail?.productName,
      gst: detail?.profesionalGst,
      hsn: detail?.professionalCode,
      amount: detail?.professionalFees,
    },
  ];
  const totalAmount = detail?.totalAmount;

  const taxAbleItems = [
    {
      hsn: detail?.professionalCode,
      taxable: detail?.professionalFees,
      igstRate: detail?.profesionalGst,
      igstAmount: detail?.gstAmount,
      totalTax: detail?.gstAmount,
    },
  ];
  const totalTaxable = taxAbleItems.reduce((sum, i) => sum + i.taxable, 0);
  const totalIGST = taxAbleItems.reduce((sum, i) => sum + i.igstAmount, 0);
  const totalTaxAmount = taxAbleItems.reduce((sum, i) => sum + i.totalTax, 0);

  return (
    <>
      <div className=" max-h-[70vh] overflow-auto">
        <div className="flex flex-col gap-2 p-14" ref={pdfRef}>
          <h1 className="text-center font-medium">Tax Invoice</h1>
          <div className="border-1 border-gray-400">
            <div className="grid grid-cols-2 border-b-1 border-gray-400">
              <div className="grid grid-rows-3 grid-cols-1 border-r-1 border-gray-400">
                <div className="border-b-1 border-gray-400 flex flex-col gap-0.5 p-2">
                  <h3 className="font-medium">Corpseed Ites Private Limited</h3>
                  <p className="text-sm">
                    2nd floor A-154/A Sector-63 Noida,Gautam budh Nagar,Uttar
                    Pradesh , 201301
                  </p>
                  <p className="text-sm">GSTIN/UIN : 09AAHCC4539J1ZC</p>
                  <p className="text-sm">
                    State name : Uttar Pradesh, code : 09
                  </p>
                  <p className="text-sm">E-mail : info@corpseed.com</p>
                </div>
                <div className="border-b-1 border-gray-400 flex flex-col gap-0.5 p-2">
                  <p className="text-xs">Consignee (Ship to)</p>
                  <h3 className="font-medium">{detail?.companyName}</h3>
                  <p className="text-sm">
                    {detail?.Address}, {detail?.City}, {detail?.State},{" "}
                    {detail?.Country} -{detail?.primaryPinCode}
                  </p>
                  <p className="text-sm">GSTIN/UIN : {detail?.gstNo}</p>
                  <p className="text-sm">
                    State name : {detail?.State}, code : 29
                  </p>
                  <p className="text-sm">
                    E-mail : {detail?.primaryContactemails}
                  </p>
                </div>
                <div className="flex flex-col gap-0.5 p-2">
                  <p className="text-xs">Buyer (Bill to)</p>
                  <h3 className="font-medium">{detail?.companyName}</h3>
                  <p className="text-sm">
                    {detail?.secondaryAddress}, {detail?.secondaryCity},{" "}
                    {detail?.secondaryState}, {detail?.secondaryCountry} -
                    {detail?.secondaryPinCode}
                  </p>
                  <p className="text-sm">GSTIN/UIN : {detail?.gstNo}</p>
                  <p className="text-sm">
                    State name : {detail?.State}, code : 29
                  </p>
                  <p className="text-sm">
                    E-mail : {detail?.secondaryContactemails}
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-1 grid-rows-2">
                <div className="grid grid-cols-2 grid-rows-6">
                  <div className="border-r-1 border-b-1 border-gray-400 flex flex-col gap-0.5 p-1">
                    <p className="text-xs">Invoice no.</p>
                    <p className="text-sm font-medium">INV00230823004</p>
                  </div>
                  <div className="border-b-1 border-gray-400 flex flex-col gap-0.5 p-1">
                    <p className="text-xs">Dated</p>
                    <p className="text-sm font-medium">
                      {dayjs(detail?.createDate).format("DD-MM-YYYY")}
                    </p>
                  </div>
                  <div className="border-r-1 border-b-1 border-gray-400 flex flex-col gap-0.5 p-1">
                    <p className="text-xs">Delivery Note</p>
                    <p className="text-sm font-medium"></p>
                  </div>
                  <div className="border-b-1 border-gray-400 flex flex-col gap-0.5 p-1">
                    <p className="text-xs">Mode/Terms of Payment</p>
                    <p className="text-sm font-medium"></p>
                  </div>
                  <div className="border-r-1 border-b-1 border-gray-400 flex flex-col gap-0.5 p-1">
                    <p className="text-xs">References No. & Date.</p>
                    <p className="text-sm font-medium"></p>
                  </div>
                  <div className="border-b-1 border-gray-400 flex flex-col gap-0.5 p-1">
                    <p className="text-xs">Other References</p>
                    <p className="text-sm font-medium"></p>
                  </div>
                  <div className="border-r-1 border-b-1 border-gray-400 flex flex-col gap-0.5 p-1">
                    <p className="text-xs">Buyer's Order No.</p>
                    <p className="text-sm font-medium"></p>
                  </div>
                  <div className="border-r-1 border-b-1 border-gray-400 flex flex-col gap-0.5 p-1">
                    <p className="text-xs">Dated</p>
                    <p className="text-sm font-medium"></p>
                  </div>
                  <div className="border-r-1 border-b-1 border-gray-400 flex flex-col gap-0.5 p-1">
                    <p className="text-xs">Dispatch Doc No.</p>
                    <p className="text-sm font-medium"></p>
                  </div>
                  <div className="border-r-1 border-b-1 border-gray-400 flex flex-col gap-0.5 p-1">
                    <p className="text-xs">Delivery Note Date</p>
                    <p className="text-sm font-medium"></p>
                  </div>
                  <div className="border-r-1 border-gray-400 flex flex-col gap-0.5 p-1">
                    <p className="text-xs">Dispatched through</p>
                    <p className="text-sm font-medium"></p>
                  </div>
                  <div className="border-r-1 border-gray-400 flex flex-col gap-0.5 p-1">
                    <p className="text-xs">Destination</p>
                    <p className="text-sm font-medium"></p>
                  </div>
                </div>
                <div className="border-t-1 border-gray-400 p-1">
                  <p className="text-xs">Terms of Delivery</p>
                </div>
              </div>
            </div>
            <div>
              <table className="w-full border border-gray-300 text-sm text-left">
                <thead className="bg-gray-100 dark:bg-gray-600">
                  <tr>
                    <th className="border border-gray-300 dark:text-white px-4 py-2 text-center">
                      S.No
                    </th>
                    <th className="border border-gray-300 dark:text-white px-4 py-2">
                      Particulars
                    </th>
                    <th className="border border-gray-300 dark:text-white px-4 py-2 text-center">
                      GST
                    </th>
                    <th className="border border-gray-300 dark:text-white px-4 py-2 text-center">
                      HSN/SAC
                    </th>
                    <th className="border border-gray-300 dark:text-white px-4 py-2 text-right">
                      Amount (₹)
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item, index) => (
                    <tr key={`${index}invoice`}>
                      <td className="border border-gray-300 px-4 py-2 text-center">
                        {index + 1}
                      </td>
                      <td className="border border-gray-300 px-4 py-2">
                        {item.particulars}
                      </td>
                      <td className="border border-gray-300 px-4 py-2 text-center">
                        {item.gst}%
                      </td>
                      <td className="border border-gray-300 px-4 py-2 text-center">
                        {item.hsn}
                      </td>
                      <td className="border border-gray-300 px-4 py-2 text-right">
                        {item.amount.toLocaleString("en-IN")}
                      </td>
                    </tr>
                  ))}

                  {/* Total Row */}
                  <tr className="font-semibold bg-gray-100 dark:bg-gray-600">
                    <td
                      colSpan="4"
                      className="border border-gray-300 px-4 py-2 text-right"
                    >
                      Total
                    </td>
                    <td className="border border-gray-300 px-4 py-2 text-right">
                      ₹ {inrCurrency(totalAmount)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div className="p-4">
              <p className="text-xs">Amount Chargeable (in Words) </p>
              <p className="text-sm font-semibold">
                {totalAmount
                  ? toWords.convert(totalAmount, { currency: true })
                  : 0}{" "}
              </p>
            </div>

            <table className="w-full border border-gray-300 text-sm text-center">
              <thead>
                {/* First row with grouped IGST column */}
                <tr className="bg-gray-100 dark:bg-gray-600">
                  <th className="border border-gray-300 px-4 py-2" rowSpan={2}>
                    HSN/SAC
                  </th>
                  <th className="border border-gray-300 px-4 py-2" rowSpan={2}>
                    Taxable Value (₹)
                  </th>
                  <th className="border border-gray-300 px-4 py-2" colSpan={2}>
                    IGST
                  </th>
                  <th className="border border-gray-300 px-4 py-2 text-right" rowSpan={2}>
                    Total Tax Amount (₹)
                  </th>
                </tr>
                {/* Second row under IGST */}
                <tr className="bg-gray-100 dark:bg-gray-600">
                  <th className="border border-gray-300 px-4 py-2">Rate (%)</th>
                  <th className="border border-gray-300 px-4 py-2">
                    Amount (₹)
                  </th>
                </tr>
              </thead>

              <tbody>
                {taxAbleItems.map((item, index) => (
                  <tr key={index}>
                    <td className="border border-gray-300 px-4 py-2">
                      {item.hsn}
                    </td>
                    <td className="border border-gray-300 px-4 py-2 text-center">
                      {inrCurrency(item?.taxable)}
                    </td>
                    <td className="border border-gray-300 px-4 py-2">
                      {item.igstRate}%
                    </td>
                    <td className="border border-gray-300 px-4 py-2 text-center">
                      {inrCurrency(item.igstAmount)}
                    </td>
                    <td className="border border-gray-300 px-4 py-2 text-right">
                      {inrCurrency(item.totalTax)}
                    </td>
                  </tr>
                ))}

                {/* Total Row */}
                <tr className="font-semibold bg-gray-100 dark:bg-gray-600">
                  <td className="border border-gray-300 px-4 py-2">Total</td>
                  <td className="border border-gray-300 px-4 py-2 text-center">
                    {inrCurrency(totalTaxable)}
                  </td>
                  <td className="border border-gray-300 px-4 py-2">-</td>
                  <td className="border border-gray-300 px-4 py-2 text-center">
                    {inrCurrency(totalIGST)}
                  </td>
                  <td className="border border-gray-300 px-4 py-2 text-right">
                    {inrCurrency(totalTaxAmount)}
                  </td>
                </tr>
              </tbody>
            </table>
            <div className="p-4 flex flex-col gap-0.5 border-b-1 border-gray-300">
              <div className="flex gap-1">
                <p className="text-default-500 text-md">
                  Tax amount (in words)
                </p>{" "}
                :{" "}
                <p className="text-md font-semibold">
                  {totalTaxAmount
                    ? toWords.convert(totalTaxAmount, { currency: true })
                    : 0}{" "}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 mt-2">
                <p className="text-sm max-w-[90%]">
                  <span className="font-semibold text-sm">Remark </span>:{" "}
                  {detail?.remarksForOption}
                </p>

                <div className="flex flex-col gap-0.5">
                  <p className="text-default-500 text-sm">
                    Company bank detail
                  </p>
                  <div className="flex items-center gap-1">
                    <p className="text-default-500 text-sm">Bank name</p> :{" "}
                    <p className="text-md font-semibold">IDFC FIRST BANK</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <p className="text-default-500 text-sm">A/C No.</p> :{" "}
                    <p className="text-md font-semibold">10052624515</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <p className="text-default-500 text-sm">
                      Branch & IFSC Code
                    </p>{" "}
                    :{" "}
                    <p className="text-md font-semibold">
                      Noida,Sector-63 Branch & IDFB0021331
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 flex justify-end">
              <div className="flex flex-col items-end gap-8">
                <p className="text-md font-semibold">
                  for corpseed ites private limited
                </p>
                <div className="h-[80px]">
                  <img
                    src={signature}
                    alt="authorised_signature"
                    className="h-auto w-full"
                  />
                </div>
                <p className="text-md text-default-400">Authorised Signatory</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Button
        className="w-sm"
        onPress={generatePDF}
        startContent={<Download />}
      >
        Export as pdf
      </Button>
    </>
  );
};

export default TaxInvoice;
