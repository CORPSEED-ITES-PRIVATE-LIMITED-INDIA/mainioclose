import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { useRef } from "react";
import logo from "../assets/CORPSEED.webp";
import dayjs from "dayjs";
import numWords from "num-words";
import { inrCurrency } from "../common";

const EstimateView = ({ details }) => {
  const pdfRef = useRef();
  const generatePDF = async () => {
    const element = pdfRef.current;
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
    });
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF("p", "mm", "a4");
    const imgWidth = 210;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    const pageHeight = 297;
    let yPosition = 0;
    while (yPosition < imgHeight) {
      pdf.addImage(imgData, "PNG", 0, -yPosition, imgWidth, imgHeight);
      if (yPosition + pageHeight < imgHeight) {
        pdf.addPage();
      }
      yPosition += pageHeight;
    }
    pdf.save("estimate.pdf");
  };
  return (
    <div className="2xl:max-h-[68vh] md:max-h-[65vh] overflow-auto mt-3 px-2 md:px-4 2xl:px-12">
      <div className="w-full md:w-[90%] mx-auto flex flex-col gap-6">
        {details?.productName && (
          <div className="flex flex-col md:flex-row md:items-center gap-1">
            <h3 className="font-semibold text-lg">Product name</h3>
            <span className="hidden md:inline mx-1">:</span>
            <p>{details?.productName}</p>
          </div>
        )}

        <div className="flex flex-col md:flex-row md:gap-15 gap-6">
          {details?.primaryContact && (
            <div className="w-full md:w-2/5 p-4 shadow rounded-md border">
              <div className="flex flex-col gap-1">
                <h4 className="font-semibold text-medium">
                  Primary contact detail
                </h4>
                <div className="flex flex-col gap-0.5 text-sm">
                  <div className="flex gap-2">
                    <span>Name</span>
                    <span>:</span>
                    <span className="text-black">
                      {details?.primaryContact?.name}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <span>Email</span>
                    <span>:</span>
                    <span className="text-black">
                      {details?.primaryContact?.emails}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <span>Contact number</span>
                    <span>:</span>
                    <span className="text-black">
                      {details?.primaryContact?.contactNo}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <span>Whatsapp number</span>
                    <span>:</span>
                    <span className="text-black">
                      {details?.primaryContact?.whatsappNo}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {details?.secondaryContact && (
            <div className="w-full md:w-2/5 p-4 shadow rounded-md border">
              <div className="flex flex-col gap-1">
                <h4 className="font-semibold text-medium">
                  Secondary contact detail
                </h4>
                <div className="flex flex-col gap-0.5 text-sm">
                  <div className="flex gap-2">
                    <span>Name</span>
                    <span>:</span>
                    <span className="text-black">
                      {details?.secondaryContact?.name}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <span>Email</span>
                    <span>:</span>
                    <span className="text-black">
                      {details?.secondaryContact?.emails}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <span>Contact number</span>
                    <span>:</span>
                    <span className="text-black">
                      {details?.secondaryContact?.contactNo}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <span>Whatsapp number</span>
                    <span>:</span>
                    <span className="text-black">
                      {details?.secondaryContact?.whatsappNo}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div ref={pdfRef} className="relative">
          <div className="absolute left-0 top-0 bg-green-500 text-white font-medium px-3 py-1 rounded-r text-sm md:text-base z-10">
            {details?.performaInvoice ? "Proforma Invoice" : "Estimate"}
          </div>

          <div className="flex flex-col gap-6 p-6 md:p-10 shadow-md rounded-md mb-6 bg-white">
            <div className="flex flex-col md:flex-row md:justify-between">
              <div className="flex flex-col gap-2">
                <img
                  src={logo}
                  alt="corpseed"
                  className="max-w-[100px] md:max-w-[130px]"
                />
                <div className="flex flex-col text-sm md:text-base mt-2 leading-relaxed">
                  <p className="font-medium">Corpseed Ites Private Limited</p>
                  <p className="text-sm">CN U74999UP2018PTC101873</p>
                  <p className="text-sm">GST : 09AAHCC4539J1ZC</p>
                  <p className="text-sm">
                    2nd floor, A-154A, A Block, sector 63
                  </p>
                  <p className="text-sm">Noida, Uttar Pradesh - 2013</p>
                </div>
              </div>

              <div className="flex flex-row md:flex-col md:items-end gap-6 mt-6 md:mt-0">
                <div className="flex flex-col items-start md:items-end">
                  <h4 className="text-green-500 text-lg font-semibold">
                    {details?.performaInvoice ? "Proforma Invoice" : "Estimate"}
                  </h4>
                  <p className="text-small font-medium">{`#ESTD0${details?.id}`}</p>
                </div>
                <div className="flex flex-col items-start md:items-end">
                  <h4 className="text-green-500 text-lg font-semibold">
                    Order No.
                  </h4>
                  <p className="text-small font-medium">
                    {details?.orderNumber}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex justify-between gap-6 md:gap-0 text-sm md:text-base">
              <div className="flex flex-col gap-4">
                <div>
                  <p className="font-semibold text-small mb-0.5">Bill To :</p>
                  <div className="leading-tight">
                    {details?.companyName && <p >{details?.companyName}</p>}
                    {details?.gstNo && <p className="text-sm">GSTIN : {details?.gstNo}</p>}
                    {details?.address && (
                      <p className="font-normal text-sm">{details?.address}</p>
                    )}
                    <p className="font-normal text-sm">
                      {[
                        details?.city,
                        details?.state,
                        details?.country,
                        details?.primaryPinCode,
                      ]
                        .filter(Boolean)
                        .join(", ")}
                    </p>
                  </div>
                </div>

                <div className="mt-2">
                  <p className="font-semibold mb-0.5 text-small">Ship To :</p>
                  <div className="leading-tight">
                    {details?.companyName && (
                      <p className="font-medium">{details?.companyName}</p>
                    )}
                    {details?.gstNo && <p className="text-sm">GSTIN : {details?.gstNo}</p>}
                    {details?.secondaryAddress && (
                      <p className="text-sm">{details?.secondaryAddress}</p>
                    )}
                    <p className="text-sm">
                      {[
                        details?.secondaryCity,
                        details?.secondaryState,
                        details?.secondaryCountry?.name,
                        details?.secondaryPinCode,
                      ]
                        .filter(Boolean)
                        .join(", ")}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col items-end gap-2 text-sm md:text-base whitespace-nowrap">
                <div className="flex gap-2">
                  <span className="font-semibold text-small">Estimate Date:</span>
                  <span  className="text-sm">
                    {dayjs(details?.estimateDate).format("DD-MM-YYYY")}
                  </span>
                </div>
                <div className="flex gap-2">
                  <span className="font-semibold text-small">Order Date:</span>
                  <span className="text-sm">{dayjs(details?.createDate).format("DD-MM-YYYY")}</span>
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              {details?.Type === "Product" ? (
                <table className="w-full border-collapse border border-black text-xs md:text-sm">
                  <thead>
                    <tr>
                      <th className="border border-black p-1"></th>
                      <th className="border border-black p-1">
                        Item and description
                      </th>
                      <th className="border border-black p-1">HSN</th>
                      <th className="border border-black p-1">Rate/kg</th>
                      <th className="border border-black p-1">Quantity (kg)</th>
                      <th className="border border-black p-1">GST %</th>
                      <th className="border border-black p-1">GST amount(₹)</th>
                      <th className="border border-black p-1 font-bold">
                        Amount(₹)
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border border-black p-1 text-center">
                        {1}
                      </td>
                      <td className="border border-black p-1">
                        {details?.productName}
                      </td>
                      <td className="border border-black p-1 text-center">
                        {details?.gstCode}
                      </td>
                      <td className="border border-black p-1 text-center">
                        {inrCurrency(details?.actualPrice)}
                      </td>
                      <td className="border border-black p-1 text-center">
                        {details?.quantity}
                      </td>
                      <td className="border border-black p-1 text-center">
                        {details?.gst}
                      </td>
                      <td className="border border-black p-1 text-center">
                        {inrCurrency(details?.gstAmount || 0)}
                      </td>
                      <td className="border border-black p-1 text-center font-bold">
                        {inrCurrency(details?.totalPrice)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              ) : (
                <table className="w-full border-collapse border border-black text-xs md:text-sm">
                  <thead>
                    <tr>
                      <th className="border border-black p-1"></th>
                      <th className="border border-black p-1">
                        Item and description
                      </th>
                      <th className="border border-black p-1">HSN</th>
                      <th className="border border-black p-1">Rate</th>
                      <th className="border border-black p-1">GST %</th>
                      <th className="border border-black p-1">GST amount</th>
                      <th className="border border-black p-1">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border border-black p-1 text-center font-medium">
                        {1}
                      </td>
                      <td className="border border-black p-1 font-medium">
                        {details?.productName}
                      </td>
                      <td></td>
                      <td className="border border-black p-1 text-right"></td>
                      <td className="border border-black p-1 text-right"></td>
                      <td className="border border-black p-1 text-right"></td>
                      <td className="border border-black p-1 text-right"></td>
                    </tr>
                    {details?.govermentCode !== null && (
                      <tr>
                        <td className="border border-black p-1 text-center"></td>
                        <td className="border border-black p-1">
                          Government fee
                        </td>
                        <td className="border border-black p-1 text-center">
                          {details?.govermentCode}
                        </td>
                        <td className="border border-black p-1 text-right"></td>
                        <td className="border border-black p-1 text-center">
                          {details?.govermentGst}
                        </td>
                        <td className="border border-black p-1 text-right"></td>
                        <td className="border border-black p-1 text-right">
                          {inrCurrency(details?.govermentFees)}
                        </td>
                      </tr>
                    )}
                    {details?.profesionalCode !== null && (
                      <tr>
                        <td className="border border-black p-1 text-center"></td>
                        <td className="border border-black p-1">
                          Professional fee
                        </td>
                        <td className="border border-black p-1 text-center">
                          {details?.profesionalCode}
                        </td>
                        <td className="border border-black p-1 text-right"></td>
                        <td className="border border-black p-1 text-center">
                          {details?.profesionalGst}
                        </td>
                        <td className="border border-black p-1 text-right"></td>
                        <td className="border border-black p-1 text-center">
                          {inrCurrency(details?.professionalFees)}
                        </td>
                      </tr>
                    )}
                    {details?.serviceCode !== null && (
                      <tr>
                        <td className="border border-black p-1 text-center"></td>
                        <td className="border border-black p-1">Service fee</td>
                        <td className="border border-black p-1 text-center">
                          {details?.serviceCode}
                        </td>
                        <td className="border border-black p-1 text-right"></td>
                        <td className="border border-black p-1 text-center">
                          {details?.serviceGst}
                        </td>
                        <td className="border border-black p-1 text-right"></td>
                        <td className="border border-black p-1 text-center">
                          {inrCurrency(details?.serviceCharge)}
                        </td>
                      </tr>
                    )}
                    {details?.otherCode !== null && (
                      <tr>
                        <td className="border border-black p-1 text-center"></td>
                        <td className="border border-black p-1">Other fee</td>
                        <td className="border border-black p-1 text-center">
                          {details?.otherCode}
                        </td>
                        <td className="border border-black p-1 text-right"></td>
                        <td className="border border-black p-1 text-center">
                          {details?.otherGst}
                        </td>
                        <td className="border border-black p-1 text-right"></td>
                        <td className="border border-black p-1 text-center">
                          {inrCurrency(details?.otherFees)}
                        </td>
                      </tr>
                    )}

                    {details?.totalAmount && (
                      <tr>
                        <td className="border border-black p-1 text-center"></td>
                        <td className="border border-black p-1 font-bold">
                          Total
                        </td>
                        <td></td>
                        <td></td>
                        <td></td>
                        <td></td>
                        <td className="border border-black p-1 text-right font-bold">
                          {inrCurrency(details?.totalAmount)}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              )}
            </div>

            {details?.totalAmount > 0 && (
              <div className="flex justify-end gap-1 mt-4 text-sm md:text-base">
                <span>Total amount in words :</span>
                <span className="font-medium capitalize">
                  {details?.totalAmount &&
                    `${numWords(details?.totalAmount)} only`}
                </span>
              </div>
            )}

            <div style={{ display: "flex", flexDirection: "column" }}>
              <p>Tax details</p>
              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  fontSize: "14px",
                }}
              >
                <thead style={{ backgroundColor: "#f3f4f6" }}>
                  <tr>
                    <th
                      style={{
                        border: "1px solid black",
                        padding: "8px",
                        textAlign: "left",
                      }}
                    >
                      HSN
                    </th>
                    <th style={{ border: "1px solid black", padding: "8px" }}>
                      SGST %
                    </th>
                    <th style={{ border: "1px solid black", padding: "8px" }}>
                      CGST %
                    </th>
                    <th style={{ border: "1px solid black", padding: "8px" }}>
                      IGST %
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {details?.Type === "Product" ? (
                    details?.gstCode !== null && (
                      <tr>
                        <td
                          style={{
                            border: "1px solid black",
                            padding: "8px",
                          }}
                        >
                          {details?.gstCode}
                        </td>
                        <td
                          style={{
                            border: "1px solid black",
                            padding: "8px",
                            textAlign: "center",
                          }}
                        >
                          0.0 %
                        </td>
                        <td
                          style={{
                            border: "1px solid black",
                            padding: "8px",
                            textAlign: "center",
                          }}
                        >
                          0.0 %
                        </td>
                        <td
                          style={{
                            border: "1px solid black",
                            padding: "8px",
                            textAlign: "center",
                          }}
                        >
                          {details?.gst}
                        </td>
                      </tr>
                    )
                  ) : (
                    <>
                      {details?.profesionalCode && (
                        <tr>
                          <td
                            style={{
                              border: "1px solid black",
                              padding: "8px",
                            }}
                          >
                            {details?.profesionalCode}
                          </td>
                          <td
                            style={{
                              border: "1px solid black",
                              padding: "8px",
                              textAlign: "center",
                            }}
                          >
                            0.0 %
                          </td>
                          <td
                            style={{
                              border: "1px solid black",
                              padding: "8px",
                              textAlign: "center",
                            }}
                          >
                            0.0 %
                          </td>
                          <td
                            style={{
                              border: "1px solid black",
                              padding: "8px",
                              textAlign: "center",
                            }}
                          >
                            {details?.profesionalGst}
                          </td>
                        </tr>
                      )}
                      {details?.serviceCode && (
                        <tr>
                          <td
                            style={{
                              border: "1px solid black",
                              padding: "8px",
                            }}
                          >
                            {details?.serviceCode}
                          </td>
                          <td
                            style={{
                              border: "1px solid black",
                              padding: "8px",
                              textAlign: "center",
                            }}
                          >
                            0.0 %
                          </td>
                          <td
                            style={{
                              border: "1px solid black",
                              padding: "8px",
                              textAlign: "center",
                            }}
                          >
                            0.0 %
                          </td>
                          <td
                            style={{
                              border: "1px solid black",
                              padding: "8px",
                              textAlign: "center",
                            }}
                          >
                            {details?.serviceGst}
                          </td>
                        </tr>
                      )}
                      {details?.govermentCode && (
                        <tr>
                          <td
                            style={{
                              border: "1px solid black",
                              padding: "8px",
                            }}
                          >
                            {details?.govermentCode}
                          </td>
                          <td
                            style={{
                              border: "1px solid black",
                              padding: "8px",
                              textAlign: "center",
                            }}
                          >
                            0.0 %
                          </td>
                          <td
                            style={{
                              border: "1px solid black",
                              padding: "8px",
                              textAlign: "center",
                            }}
                          >
                            0.0 %
                          </td>
                          <td
                            style={{
                              border: "1px solid black",
                              padding: "8px",
                              textAlign: "center",
                            }}
                          >
                            {details?.govermentGst}
                          </td>
                        </tr>
                      )}
                      {details?.otherCode && (
                        <tr>
                          <td
                            style={{
                              border: "1px solid black",
                              padding: "8px",
                            }}
                          >
                            {details?.otherCode}
                          </td>
                          <td
                            style={{
                              border: "1px solid black",
                              padding: "8px",
                              textAlign: "center",
                            }}
                          >
                            0.0 %
                          </td>
                          <td
                            style={{
                              border: "1px solid black",
                              padding: "8px",
                              textAlign: "center",
                            }}
                          >
                            0.0 %
                          </td>
                          <td
                            style={{
                              border: "1px solid black",
                              padding: "8px",
                              textAlign: "center",
                            }}
                          >
                            {details?.otherGst}
                          </td>
                        </tr>
                      )}
                    </>
                  )}
                </tbody>
              </table>
            </div>
            <div
              style={{ display: "flex", flexDirection: "column", gap: "1px" }}
            >
              <p className="text-small font-medium">Notes :</p>
              {details?.invoiceNote && (
                <p className="text-sm">{details?.invoiceNote}</p>
              )}
              <hr style={{ margin: "1px 0" }} />
              <p className="text-small">
                <span className="font-medium">Remark</span> : {details?.getRemarkForOperation}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EstimateView;
