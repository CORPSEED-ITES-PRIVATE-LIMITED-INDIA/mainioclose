import html2canvas from "html2canvas-pro";
import jsPDF from "jspdf";
import { useRef } from "react";
import logo from "../assets/CORPSEED.webp";
import dayjs from "dayjs";
import numWords from "num-words";
import { inrCurrency } from "../common";

const EstimateView = ({ details }) => {
  const contentRef = useRef();

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
      <div className="w-full md:w-[80%] lg:w-[70%] mx-auto flex flex-col gap-8 border rounded-xl p-3 md:p-6 shadow-md bg-white">
        <div ref={contentRef} className="relative">
          <div className="absolute -left-4 top-3 bg-green-600 text-white font-medium px-4 py-1.5 rounded-r-md text-sm shadow-md">
            {details?.performaInvoice ? "Proforma Invoice" : "Estimate"}
          </div>
          <div className="bg-white rounded-xl p-4 md:p-8 space-y-6">
            <div className="flex flex-col md:flex-row justify-between gap-4">
              <div>
                <img src={logo} alt="corpseed" className="w-28 md:w-36" />
                <div className="mt-2 text-gray-700 text-xs leading-relaxed">
                  <p className="font-semibold text-sm">
                    Corpseed Ites Private Limited
                  </p>
                  <p>CN U74999UP2018PTC101873</p>
                  <p>GST : 09AAHCC4539J1ZC</p>
                  <p>2nd floor, A-154A, Sector 63</p>
                  <p>Noida, Uttar Pradesh - 201301</p>
                </div>
              </div>
              <div className="flex flex-col items-end gap-4">
                <div>
                  <h4 className="text-green-600 text-base font-semibold">
                    {details?.performaInvoice ? "Proforma Invoice" : "Estimate"}
                  </h4>
                  <p className="font-medium text-gray-700 text-sm">
                    #{`ESTD0${details?.id}`}
                  </p>
                </div>

                <div>
                  <h4 className="text-green-600 text-base font-semibold">
                    Order No.
                  </h4>
                  <p className="font-medium text-gray-700 text-sm">
                    {details?.orderNumber}
                  </p>
                </div>
              </div>
            </div>
            <div className="flex flex-col md:flex-row justify-between gap-6">
              <div className="space-y-4 text-xs">
                <div>
                  <p className="font-semibold text-gray-800 mb-1">Bill To</p>
                  <p className="font-medium">{details?.companyName}</p>
                  {details?.gstNo && <p>GSTIN: {details?.gstNo}</p>}
                  <p>{details?.address}</p>
                  <p>
                    {[
                      details.city,
                      details.state,
                      details.country,
                      details.primaryPinCode,
                    ]
                      .filter(Boolean)
                      .join(", ")}
                  </p>
                </div>
                <div>
                  <p className="font-semibold text-gray-800 mb-1">Ship To</p>
                  <p className="font-medium">{details?.companyName}</p>
                  {details?.gstNo && <p>GSTIN: {details?.gstNo}</p>}
                  <p>{details?.secondaryAddress}</p>
                  <p>
                    {[
                      details.secondaryCity,
                      details.secondaryState,
                      details.secondaryCountry?.name,
                      details.secondaryPinCode,
                    ]
                      .filter(Boolean)
                      .join(", ")}
                  </p>
                </div>
              </div>
              <div className="text-xs space-y-1 md:text-right">
                <p>
                  <span className="font-semibold">Estimate Date:</span>{" "}
                  {dayjs(details?.estimateDate).format("DD-MM-YYYY")}
                </p>
                <p>
                  <span className="font-semibold">Order Date:</span>{" "}
                  {dayjs(details?.createDate).format("DD-MM-YYYY")}
                </p>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full border text-xs shadow-sm rounded-lg overflow-hidden">
                <thead className="bg-gray-100 text-gray-700">
                  <tr>
                    <th className="border p-1"></th>
                    <th className="border p-1">Item & Description</th>
                    <th className="border p-1">HSN</th>
                    <th className="border p-1">
                      {details?.Type === "Product" ? "Rate/kg" : "Rate"}
                    </th>
                    {details?.Type === "Product" && (
                      <th className="border p-1">Qty (kg)</th>
                    )}
                    <th className="border p-1">GST %</th>
                    <th className="border p-1">GST Amt</th>
                    <th className="border p-1 font-semibold">Amount (₹)</th>
                  </tr>
                </thead>

                <tbody>
                  <tr>
                    <td className="border p-1 text-center font-medium">1</td>
                    <td className="border p-1">{details?.productName}</td>

                    {details?.Type === "Product" && (
                      <>
                        <td className="border p-1 text-center">
                          {details?.gstCode}
                        </td>
                        <td className="border p-1 text-center">
                          {inrCurrency(details?.actualPrice)}
                        </td>
                        <td className="border p-1 text-center">
                          {details?.quantity}
                        </td>
                        <td className="border p-1 text-center">
                          {details?.gst}
                        </td>
                        <td className="border p-1 text-center">
                          {inrCurrency(details?.gstAmount || 0)}
                        </td>
                        <td className="border p-1 text-center font-semibold">
                          {inrCurrency(details?.totalPrice)}
                        </td>
                      </>
                    )}
                  </tr>
                  {details?.Type !== "Product" && (
                    <>
                      {details?.govermentCode && (
                        <tr>
                          <td className="border p-1"></td>
                          <td className="border p-1">Government Fee</td>
                          <td className="border p-1 text-center">
                            {details?.govermentCode}
                          </td>
                          <td className="border p-1 text-center"></td>
                          <td className="border p-1 text-center">
                            {details?.govermentGst}
                          </td>
                          <td className="border p-1 text-center">
                            {inrCurrency(details?.govGstAmount || 0)}
                          </td>
                          <td className="border p-1 text-center">
                            {inrCurrency(details?.govermentFees)}
                          </td>
                        </tr>
                      )}

                      {details?.profesionalCode && (
                        <tr>
                          <td className="border p-1"></td>
                          <td className="border p-1">Professional Fee</td>
                          <td className="border p-1 text-center">
                            {details?.profesionalCode}
                          </td>
                          <td className="border p-1 text-center"></td>
                          <td className="border p-1 text-center">
                            {details?.profesionalGst}
                          </td>
                          <td className="border p-1 text-center">
                            {inrCurrency(details?.proGstAmount)}
                          </td>
                          <td className="border p-1 text-center">
                            {inrCurrency(details?.professionalFees)}
                          </td>
                        </tr>
                      )}

                      {details?.serviceCode && (
                        <tr>
                          <td className="border p-1"></td>
                          <td className="border p-1">Service Fee</td>
                          <td className="border p-1 text-center">
                            {details?.serviceCode}
                          </td>
                          <td className="border p-1 text-center"></td>
                          <td className="border p-1 text-center">
                            {details?.serviceGst}
                          </td>
                          <td className="border p-1 text-center">
                            {inrCurrency(details?.serviceGstAmount || 0)}
                          </td>
                          <td className="border p-1 text-center">
                            {inrCurrency(details?.serviceCharge)}
                          </td>
                        </tr>
                      )}

                      {details?.otherCode && (
                        <tr>
                          <td className="border p-1"></td>
                          <td className="border p-1">Other Fee</td>
                          <td className="border p-1 text-center">
                            {details?.otherCode}
                          </td>
                          <td className="border p-1 text-center"></td>
                          <td className="border p-1 text-center">
                            {details?.otherGst}
                          </td>
                          <td className="border p-1 text-center">
                            {inrCurrency(details?.otherGstAmount || 0)}
                          </td>
                          <td className="border p-1 text-center">
                            {inrCurrency(details?.otherFees)}
                          </td>
                        </tr>
                      )}
                    </>
                  )}
                  {details?.Type === "Product" ? (
                    <tr className="bg-gray-50">
                      <td className="border p-1"></td>
                      <td className="border p-1 font-semibold">Total</td>
                      <td></td>
                      <td></td>
                      <td></td>
                      <td></td>
                      <td></td>
                      <td className="border p-1 font-semibold text-center">
                        {inrCurrency(details?.totalPrice)}
                      </td>
                    </tr>
                  ) : (
                    <tr className="bg-gray-50">
                      <td className="border p-1"></td>
                      <td className="border p-1 font-semibold">Total</td>
                      <td></td>
                      <td></td>
                      <td></td>
                      <td></td>
                      <td className="border p-1 font-semibold text-center">
                        {inrCurrency(details?.totalAmount)}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {details?.Type !== "Product" && details?.totalAmount > 0 ? (
              <p className="text-right text-xs mt-3">
                <span className="font-semibold">Amount (in words): </span>
                <span className="capitalize text-gray-700">
                  {numWords(details?.totalAmount)} only
                </span>
              </p>
            ) : (
              <p className="text-right text-xs mt-3">
                <span className="font-semibold">Amount (in words): </span>
                <span className="capitalize text-gray-700">
                  {numWords(details?.totalPrice)} only
                </span>
              </p>
            )}

            <div className="mt-6">
              <p className="font-semibold text-sm mb-2 text-gray-800">
                Tax Details
              </p>

              <table className="w-full border text-xs shadow-sm rounded-lg overflow-hidden">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="border p-1 text-left">HSN</th>
                    <th className="border p-1 text-center">SGST %</th>
                    <th className="border p-1 text-center">CGST %</th>
                    <th className="border p-1 text-center">IGST %</th>
                    <th className="border p-1 text-center">Amount</th>
                  </tr>
                </thead>

                <tbody>
                  {details?.Type === "Product" ? (
                    <tr>
                      <td className="border p-1">{details?.gstCode}</td>
                      <td className="border p-1 text-center">0%</td>
                      <td className="border p-1 text-center">0%</td>
                      <td className="border p-1 text-center">
                        {details?.gst}%
                      </td>
                      <td className="border p-1 text-center">
                        {inrCurrency(details?.gstAmount)}
                      </td>
                    </tr>
                  ) : (
                    <>
                      {details?.profesionalCode && (
                        <tr>
                          <td className="border p-1">
                            {details?.profesionalCode}
                          </td>
                          <td className="border p-1 text-center">0%</td>
                          <td className="border p-1 text-center">0%</td>
                          <td className="border p-1 text-center">
                            {details?.profesionalGst}%
                          </td>
                          <td className="border p-1 text-center">
                            {inrCurrency(details?.proGstAmount)}
                          </td>
                        </tr>
                      )}
                      {details?.govermentCode && (
                        <tr>
                          <td className="border p-1">
                            {details?.govermentCode}
                          </td>
                          <td className="border p-1 text-center">0%</td>
                          <td className="border p-1 text-center">0%</td>
                          <td className="border p-1 text-center">
                            {details?.govermentGst}%
                          </td>
                          <td className="border p-1 text-center">
                            {inrCurrency(details?.govGstAmount || 0)}
                          </td>
                        </tr>
                      )}
                      {details?.serviceCode && (
                        <tr>
                          <td className="border p-1">{details?.serviceCode}</td>
                          <td className="border p-1 text-center">0%</td>
                          <td className="border p-1 text-center">0%</td>
                          <td className="border p-1 text-center">
                            {details?.serviceGst}%
                          </td>
                          <td className="border p-1 text-center">
                            {inrCurrency(details?.serviceGstAmount || 0)}
                          </td>
                        </tr>
                      )}
                      {details?.otherCode && (
                        <tr>
                          <td className="border p-1">{details?.otherCode}</td>
                          <td className="border p-1 text-center">0%</td>
                          <td className="border p-1 text-center">0%</td>
                          <td className="border p-1 text-center">
                            {details?.otherGst}%
                          </td>
                          <td className="border p-1 text-center">
                            {inrCurrency(details?.otherGstAmount || 0)}
                          </td>
                        </tr>
                      )}
                    </>
                  )}
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
                <div
                  style={{ display: "flex", flexDirection: "column", gap: 6 }}
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
                      All prices are inclusive/exclusive of taxes as applicable.
                    </li>
                    <li>
                      Validity of this estimate is 30 days from the date of
                      issue.
                    </li>
                    <li>
                      Work will commence only after receiving the agreed advance
                      payment.
                    </li>
                    <li>
                      Delivery timelines may vary depending on government
                      processing time.
                    </li>
                    <li>
                      No refund will be applicable once the work has been
                      initiated.
                    </li>
                    <li>
                      Any additional requirements will be charged separately.
                    </li>
                  </ul>
                </div>

                <div
                  style={{ display: "flex", flexDirection: "column", gap: 6 }}
                >
                  <h4
                    style={{
                      margin: 0,
                      fontSize: 16,
                      fontWeight: 500,
                      color: "#111827",
                    }}
                  >
                    Notes
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
                      Government fee and corpseed professional fee may differ
                      depending on any additional changes advised the client in
                      the application or any changes in the government policies.
                    </li>
                    <li>
                      This estimate is system-generated and does not require a
                      physical signature.
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
        <button
          onClick={downloadPDF}
          className="bg-green-600 text-white px-4 py-2 rounded-md text-sm w-fit shadow-md hover:bg-green-700 self-center cursor-pointer"
        >
          Download PDF
        </button>
      </div>
    </div>
  );
};

export default EstimateView;
