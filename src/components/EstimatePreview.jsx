import html2canvas from "html2canvas-pro";
import jsPDF from "jspdf";
import { useEffect, useRef } from "react";
import logo from "../assets/CORPSEED.webp";
import dayjs from "dayjs";
import numWords from "num-words";
import { inrCurrency } from "../common";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { getEstimateByLeadIdAndUUID } from "../toolkit/slices/leadSlice";

const EstimatePreview = () => {
  const dispatch = useDispatch();
  const { leadId, uuid } = useParams();
  const details = useSelector((state) => state.leads.estimateDetailByUUID);

  useEffect(() => {
    if (leadId && uuid) {
      dispatch(getEstimateByLeadIdAndUUID({ leadId, uuid }));
    }
  }, [dispatch, leadId, uuid]);

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

        <div className="2xl:max-h-[90vh] md:max-h-[85vh] overflow-auto mt-4 px-2 md:px-4 lg:px-6">
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

export default EstimatePreview;


// <div style={containerStyle}>
    //   <div
    //     style={{
    //       width: "100%",
    //       maxWidth: 980,
    //       margin: "0 auto",
    //       display: "flex",
    //       flexDirection: "column",
    //       gap: 20,
    //     }}
    //   >
    //     {/* Product Name */}
    //     {details?.productName && (
    //       <div
    //         style={{
    //           display: "flex",
    //           flexDirection: "row",
    //           alignItems: "center",
    //           gap: 8,
    //           flexWrap: "wrap",
    //         }}
    //       >
    //         <h3
    //           style={{
    //             fontSize: 18,
    //             fontWeight: 700,
    //             margin: 0,
    //             color: "#111827",
    //           }}
    //         >
    //           Product name
    //         </h3>
    //         <span style={{ marginLeft: 6, marginRight: 6, color: "#6b7280" }}>
    //           :
    //         </span>
    //         <p style={{ margin: 0, color: "#111827" }}>
    //           {details?.productName}
    //         </p>
    //       </div>
    //     )}

    //     {/* Main PDF Content */}
    //     <div style={{ position: "relative" }}>
    //       {/* Badge */}
    //       <div
    //         style={{
    //           position: "absolute",
    //           left: 0,
    //           top: 0,
    //           backgroundColor: "#10b981",
    //           color: "#ffffff",
    //           paddingLeft: 12,
    //           paddingRight: 12,
    //           paddingTop: 6,
    //           paddingBottom: 6,
    //           borderTopRightRadius: 6,
    //           borderBottomRightRadius: 6,
    //           fontSize: 13,
    //           zIndex: 10,
    //           fontWeight: 600,
    //         }}
    //       >
    //         {details?.performaInvoice ? "Proforma Invoice" : "Estimate"}
    //       </div>

    //       {/* Content Box */}
    //       <div ref={pdfRef} style={cardStyle}>
    //         {/* Header */}
    //         <div
    //           style={{
    //             display: "flex",
    //             flexDirection: "row",
    //             justifyContent: "space-between",
    //             gap: 16,
    //             alignItems: "flex-start",
    //             flexWrap: "wrap",
    //             margin: "18px 0px",
    //             padding: 12,
    //           }}
    //         >
    //           <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
    //             <img
    //               src={logo}
    //               alt="corpseed"
    //               style={{ maxWidth: 130, height: "auto", display: "block" }}
    //             />
    //             <div
    //               style={{
    //                 display: "flex",
    //                 flexDirection: "column",
    //                 color: "#6b7280",
    //                 fontSize: 13,
    //                 lineHeight: 1.35,
    //                 marginTop: 6,
    //               }}
    //             >
    //               <p style={{ margin: 0, fontWeight: 600, color: "#111827" }}>
    //                 Corpseed Ites Private Limited
    //               </p>
    //               <p style={{ margin: 0 }}>CN U74999UP2018PTC101873</p>
    //               <p style={{ margin: 0 }}>GST : 09AAHCC4539J1ZC</p>
    //               <p style={{ margin: 0 }}>
    //                 2nd floor, A-154A, A Block, sector 63
    //               </p>
    //               <p style={{ margin: 0 }}>Noida, Uttar Pradesh - 2013</p>
    //             </div>
    //           </div>

    //           <div
    //             style={{
    //               display: "flex",
    //               flexDirection: "column",
    //               alignItems: "flex-end",
    //               gap: 10,
    //               marginTop: 8,
    //             }}
    //           >
    //             <div style={{ textAlign: "right" }}>
    //               <h4
    //                 style={{
    //                   margin: 0,
    //                   color: "#10b981",
    //                   fontSize: 18,
    //                   fontWeight: 700,
    //                 }}
    //               >
    //                 {details?.performaInvoice ? "Proforma Invoice" : "Estimate"}
    //               </h4>
    //               <strong
    //                 style={{ display: "block", marginTop: 6 }}
    //               >{`#ESTD0${details?.id ?? ""}`}</strong>
    //             </div>

    //             <div style={{ textAlign: "right" }}>
    //               <h4
    //                 style={{
    //                   margin: 0,
    //                   color: "#10b981",
    //                   fontSize: 16,
    //                   fontWeight: 700,
    //                 }}
    //               >
    //                 Order No.
    //               </h4>
    //               <strong style={{ display: "block", marginTop: 6 }}>
    //                 {details?.orderNumber ?? "-"}
    //               </strong>
    //             </div>
    //           </div>
    //         </div>

    //         {/* Addresses and Dates */}
    //         <div
    //           style={{
    //             display: "flex",
    //             justifyContent: "space-between",
    //             gap: 12,
    //             color: "#6b7280",
    //             fontSize: 14,
    //             flexWrap: "wrap",
    //           }}
    //         >
    //           <div
    //             style={{
    //               minWidth: 260,
    //               flex: "1 1 420px",
    //               display: "flex",
    //               flexDirection: "column",
    //               gap: 12,
    //             }}
    //           >
    //             <div>
    //               <p
    //                 style={{
    //                   margin: 0,
    //                   fontWeight: 700,
    //                   color: "#111827",
    //                   marginBottom: 6,
    //                 }}
    //               >
    //                 Bill To :
    //               </p>
    //               <div
    //                 style={{
    //                   fontWeight: 600,
    //                   lineHeight: 1.4,
    //                   color: "#111827",
    //                 }}
    //               >
    //                 {details?.companyName && (
    //                   <p style={{ margin: 0 }}>{details?.companyName}</p>
    //                 )}
    //                 {details?.address && (
    //                   <p style={{ margin: 0, fontWeight: 400 }}>
    //                     {details?.address}
    //                   </p>
    //                 )}
    //                 <p style={{ margin: 0, fontWeight: 400 }}>
    //                   {[details?.city, details?.state, details?.country]
    //                     .filter(Boolean)
    //                     .join(", ")}
    //                 </p>
    //                 {details?.primaryPinCode && (
    //                   <p style={{ margin: 0, fontWeight: 400 }}>
    //                     {details?.primaryPinCode}
    //                   </p>
    //                 )}
    //               </div>
    //             </div>

    //             <div>
    //               <p
    //                 style={{
    //                   margin: 0,
    //                   fontWeight: 700,
    //                   color: "#111827",
    //                   marginBottom: 6,
    //                 }}
    //               >
    //                 Ship To :
    //               </p>
    //               <div
    //                 style={{
    //                   lineHeight: 1.4,
    //                   color: "#111827",
    //                 }}
    //               >
    //                 {details?.companyName && (
    //                   <p style={{ margin: 0, fontWeight: 600 }}>
    //                     {details?.companyName}
    //                   </p>
    //                 )}
    //                 {details?.secondaryAddress && (
    //                   <p style={{ margin: 0 }}>{details?.secondaryAddress}</p>
    //                 )}
    //                 <p style={{ margin: 0 }}>
    //                   {[
    //                     details?.secondaryCity,
    //                     details?.secondaryState,
    //                     details?.secondaryCountry?.name,
    //                   ]
    //                     .filter(Boolean)
    //                     .join(", ")}
    //                 </p>
    //                 {details?.secondaryPinCode && (
    //                   <p style={{ margin: 0 }}>{details?.secondaryPinCode}</p>
    //                 )}
    //               </div>
    //             </div>
    //           </div>

    //           <div
    //             style={{
    //               minWidth: 180,
    //               flex: "0 0 220px",
    //               display: "flex",
    //               flexDirection: "column",
    //               gap: 8,
    //               color: "#6b7280",
    //             }}
    //           >
    //             <div
    //               style={{
    //                 display: "flex",
    //                 gap: 8,
    //                 justifyContent: "flex-end",
    //               }}
    //             >
    //               <span
    //                 style={{
    //                   fontWeight: 700,
    //                   minWidth: 110,
    //                   textAlign: "right",
    //                   color: "#111827",
    //                 }}
    //               >
    //                 Estimate Date:
    //               </span>
    //               <span style={{ textAlign: "right" }}>
    //                 {details?.estimateDate
    //                   ? dayjs(details?.estimateDate).format("DD-MM-YYYY")
    //                   : "-"}
    //               </span>
    //             </div>
    //             <div
    //               style={{
    //                 display: "flex",
    //                 gap: 8,
    //                 justifyContent: "flex-end",
    //               }}
    //             >
    //               <span
    //                 style={{
    //                   fontWeight: 700,
    //                   minWidth: 110,
    //                   textAlign: "right",
    //                   color: "#111827",
    //                 }}
    //               >
    //                 Order Date:
    //               </span>
    //               <span style={{ textAlign: "right" }}>
    //                 {details?.createDate
    //                   ? dayjs(details?.createDate).format("DD-MM-YYYY")
    //                   : "-"}
    //               </span>
    //             </div>
    //           </div>
    //         </div>

    //         {/* Table */}
    //         <div style={{ overflowX: "auto" }}>
    //           {details?.Type === "Product" ? (
    //             <table
    //               style={{
    //                 width: "100%",
    //                 borderCollapse: "collapse",
    //                 border: "1px solid #111827",
    //                 fontSize: 13,
    //               }}
    //             >
    //               <thead>
    //                 <tr>
    //                   <th
    //                     style={{
    //                       border: "1px solid #111827",
    //                       padding: 8,
    //                       background: "#f8fafc",
    //                       textAlign: "center",
    //                     }}
    //                   >
    //                     #
    //                   </th>
    //                   <th
    //                     style={{
    //                       border: "1px solid #111827",
    //                       padding: 8,
    //                       background: "#f8fafc",
    //                     }}
    //                   >
    //                     Item and description
    //                   </th>
    //                   <th
    //                     style={{
    //                       border: "1px solid #111827",
    //                       padding: 8,
    //                       background: "#f8fafc",
    //                       textAlign: "center",
    //                     }}
    //                   >
    //                     HSN
    //                   </th>
    //                   <th
    //                     style={{
    //                       border: "1px solid #111827",
    //                       padding: 8,
    //                       background: "#f8fafc",
    //                       textAlign: "right",
    //                     }}
    //                   >
    //                     Rate/kg
    //                   </th>
    //                   <th
    //                     style={{
    //                       border: "1px solid #111827",
    //                       padding: 8,
    //                       background: "#f8fafc",
    //                       textAlign: "right",
    //                     }}
    //                   >
    //                     Quantity (kg)
    //                   </th>
    //                   <th
    //                     style={{
    //                       border: "1px solid #111827",
    //                       padding: 8,
    //                       background: "#f8fafc",
    //                       textAlign: "center",
    //                     }}
    //                   >
    //                     GST %
    //                   </th>
    //                   <th
    //                     style={{
    //                       border: "1px solid #111827",
    //                       padding: 8,
    //                       background: "#f8fafc",
    //                       textAlign: "right",
    //                     }}
    //                   >
    //                     GST amount(₹)
    //                   </th>
    //                   <th
    //                     style={{
    //                       border: "1px solid #111827",
    //                       padding: 8,
    //                       background: "#f8fafc",
    //                       textAlign: "right",
    //                     }}
    //                   >
    //                     Amount(₹)
    //                   </th>
    //                 </tr>
    //               </thead>
    //               <tbody>
    //                 <tr>
    //                   <td
    //                     style={{
    //                       border: "1px solid #111827",
    //                       padding: 8,
    //                       textAlign: "center",
    //                     }}
    //                   >
    //                     1
    //                   </td>
    //                   <td
    //                     style={{
    //                       border: "1px solid #111827",
    //                       fontWeight: "bold",
    //                       padding: 8,
    //                     }}
    //                   >
    //                     {details?.productName}
    //                   </td>
    //                   <td
    //                     style={{
    //                       border: "1px solid #111827",
    //                       padding: 8,
    //                       textAlign: "center",
    //                     }}
    //                   >
    //                     {details?.gstCode ?? "-"}
    //                   </td>
    //                   <td
    //                     style={{
    //                       border: "1px solid #111827",
    //                       padding: 8,
    //                       textAlign: "right",
    //                     }}
    //                   >
    //                     {inrCurrency(details?.actualPrice)}
    //                   </td>
    //                   <td
    //                     style={{
    //                       border: "1px solid #111827",
    //                       padding: 8,
    //                       textAlign: "right",
    //                     }}
    //                   >
    //                     {details?.quantity ?? "-"}
    //                   </td>
    //                   <td
    //                     style={{
    //                       border: "1px solid #111827",
    //                       padding: 8,
    //                       textAlign: "center",
    //                     }}
    //                   >
    //                     {details?.gst ?? "-"}
    //                   </td>
    //                   <td
    //                     style={{
    //                       border: "1px solid #111827",
    //                       padding: 8,
    //                       textAlign: "right",
    //                     }}
    //                   >
    //                     {inrCurrency(details?.gstAmount)}
    //                   </td>
    //                   <td
    //                     style={{
    //                       border: "1px solid #111827",
    //                       padding: 8,
    //                       textAlign: "right",
    //                     }}
    //                   >
    //                     {inrCurrency(details?.totalPrice)}
    //                   </td>
    //                 </tr>
    //               </tbody>
    //             </table>
    //           ) : (
    //             <table
    //               style={{
    //                 width: "100%",
    //                 borderCollapse: "collapse",
    //                 border: "1px solid #111827",
    //                 fontSize: 13,
    //               }}
    //             >
    //               <thead>
    //                 <tr>
    //                   <th
    //                     style={{
    //                       border: "1px solid #111827",
    //                       padding: 8,
    //                       background: "#f8fafc",
    //                       textAlign: "center",
    //                     }}
    //                   >
    //                     #
    //                   </th>
    //                   <th
    //                     style={{
    //                       border: "1px solid #111827",
    //                       padding: 8,
    //                       background: "#f8fafc",
    //                     }}
    //                   >
    //                     Item and description
    //                   </th>
    //                   <th
    //                     style={{
    //                       border: "1px solid #111827",
    //                       padding: 8,
    //                       background: "#f8fafc",
    //                       textAlign: "center",
    //                     }}
    //                   >
    //                     HSN
    //                   </th>
    //                   <th
    //                     style={{
    //                       border: "1px solid #111827",
    //                       padding: 8,
    //                       background: "#f8fafc",
    //                       textAlign: "right",
    //                     }}
    //                   >
    //                     Rate
    //                   </th>
    //                   <th
    //                     style={{
    //                       border: "1px solid #111827",
    //                       padding: 8,
    //                       background: "#f8fafc",
    //                       textAlign: "center",
    //                     }}
    //                   >
    //                     GST %
    //                   </th>
    //                   <th
    //                     style={{
    //                       border: "1px solid #111827",
    //                       padding: 8,
    //                       background: "#f8fafc",
    //                       textAlign: "right",
    //                     }}
    //                   >
    //                     GST amount
    //                   </th>
    //                   <th
    //                     style={{
    //                       border: "1px solid #111827",
    //                       padding: 8,
    //                       background: "#f8fafc",
    //                       textAlign: "right",
    //                     }}
    //                   >
    //                     Amount
    //                   </th>
    //                 </tr>
    //               </thead>
    //               <tbody>
    //                 <tr>
    //                   <td
    //                     style={{
    //                       border: "1px solid #111827",
    //                       padding: 8,
    //                       textAlign: "center",
    //                     }}
    //                   >
    //                     1
    //                   </td>
    //                   <td
    //                     style={{
    //                       border: "1px solid #111827",
    //                       fontWeight: "bold",
    //                       padding: 8,
    //                     }}
    //                   >
    //                     {details?.productName ?? "-"}
    //                   </td>
    //                   <td
    //                     style={{
    //                       border: "1px solid #111827",
    //                       padding: 8,
    //                       textAlign: "center",
    //                     }}
    //                   ></td>
    //                   <td
    //                     style={{
    //                       border: "1px solid #111827",
    //                       padding: 8,
    //                       textAlign: "right",
    //                     }}
    //                   ></td>
    //                   <td
    //                     style={{
    //                       border: "1px solid #111827",
    //                       padding: 8,
    //                       textAlign: "center",
    //                     }}
    //                   ></td>
    //                   <td
    //                     style={{
    //                       border: "1px solid #111827",
    //                       padding: 8,
    //                       textAlign: "right",
    //                     }}
    //                   ></td>
    //                   <td
    //                     style={{
    //                       border: "1px solid #111827",
    //                       padding: 8,
    //                       textAlign: "right",
    //                     }}
    //                   ></td>
    //                 </tr>

    //                 {details?.govermentCode != null && (
    //                   <tr>
    //                     <td
    //                       style={{
    //                         border: "1px solid #111827",
    //                         padding: 8,
    //                         textAlign: "center",
    //                       }}
    //                     ></td>
    //                     <td style={{ border: "1px solid #111827", padding: 8 }}>
    //                       Government fee
    //                     </td>
    //                     <td
    //                       style={{
    //                         border: "1px solid #111827",
    //                         padding: 8,
    //                         textAlign: "center",
    //                       }}
    //                     >
    //                       {details?.govermentCode}
    //                     </td>
    //                     <td
    //                       style={{
    //                         border: "1px solid #111827",
    //                         padding: 8,
    //                         textAlign: "right",
    //                       }}
    //                     ></td>
    //                     <td
    //                       style={{
    //                         border: "1px solid #111827",
    //                         padding: 8,
    //                         textAlign: "center",
    //                       }}
    //                     >
    //                       {details?.govermentGst}
    //                     </td>
    //                     <td
    //                       style={{
    //                         border: "1px solid #111827",
    //                         padding: 8,
    //                         textAlign: "right",
    //                       }}
    //                     ></td>
    //                     <td
    //                       style={{
    //                         border: "1px solid #111827",
    //                         padding: 8,
    //                         textAlign: "right",
    //                       }}
    //                     >
    //                       {inrCurrency(details?.govermentFees)}
    //                     </td>
    //                   </tr>
    //                 )}

    //                 {details?.profesionalCode != null && (
    //                   <tr>
    //                     <td
    //                       style={{
    //                         border: "1px solid #111827",
    //                         padding: 8,
    //                         textAlign: "center",
    //                       }}
    //                     ></td>
    //                     <td style={{ border: "1px solid #111827", padding: 8 }}>
    //                       Professional fee
    //                     </td>
    //                     <td
    //                       style={{
    //                         border: "1px solid #111827",
    //                         padding: 8,
    //                         textAlign: "center",
    //                       }}
    //                     >
    //                       {details?.profesionalCode}
    //                     </td>
    //                     <td
    //                       style={{
    //                         border: "1px solid #111827",
    //                         padding: 8,
    //                         textAlign: "right",
    //                       }}
    //                     ></td>
    //                     <td
    //                       style={{
    //                         border: "1px solid #111827",
    //                         padding: 8,
    //                         textAlign: "center",
    //                       }}
    //                     >
    //                       {details?.profesionalGst}
    //                     </td>
    //                     <td
    //                       style={{
    //                         border: "1px solid #111827",
    //                         padding: 8,
    //                         textAlign: "right",
    //                       }}
    //                     ></td>
    //                     <td
    //                       style={{
    //                         border: "1px solid #111827",
    //                         padding: 8,
    //                         textAlign: "right",
    //                       }}
    //                     >
    //                       {inrCurrency(details?.professionalFees)}
    //                     </td>
    //                   </tr>
    //                 )}

    //                 {details?.serviceCode != null && (
    //                   <tr>
    //                     <td
    //                       style={{
    //                         border: "1px solid #111827",
    //                         padding: 8,
    //                         textAlign: "center",
    //                       }}
    //                     ></td>
    //                     <td style={{ border: "1px solid #111827", padding: 8 }}>
    //                       Service fee
    //                     </td>
    //                     <td
    //                       style={{
    //                         border: "1px solid #111827",
    //                         padding: 8,
    //                         textAlign: "center",
    //                       }}
    //                     >
    //                       {details?.serviceCode}
    //                     </td>
    //                     <td
    //                       style={{
    //                         border: "1px solid #111827",
    //                         padding: 8,
    //                         textAlign: "right",
    //                       }}
    //                     ></td>
    //                     <td
    //                       style={{
    //                         border: "1px solid #111827",
    //                         padding: 8,
    //                         textAlign: "center",
    //                       }}
    //                     >
    //                       {details?.serviceGst}
    //                     </td>
    //                     <td
    //                       style={{
    //                         border: "1px solid #111827",
    //                         padding: 8,
    //                         textAlign: "right",
    //                       }}
    //                     ></td>
    //                     <td
    //                       style={{
    //                         border: "1px solid #111827",
    //                         padding: 8,
    //                         textAlign: "right",
    //                       }}
    //                     >
    //                       {inrCurrency(details?.serviceCharge)}
    //                     </td>
    //                   </tr>
    //                 )}

    //                 {details?.otherCode != null && (
    //                   <tr>
    //                     <td
    //                       style={{
    //                         border: "1px solid #111827",
    //                         padding: 8,
    //                         textAlign: "center",
    //                       }}
    //                     ></td>
    //                     <td style={{ border: "1px solid #111827", padding: 8 }}>
    //                       Other fee
    //                     </td>
    //                     <td
    //                       style={{
    //                         border: "1px solid #111827",
    //                         padding: 8,
    //                         textAlign: "center",
    //                       }}
    //                     >
    //                       {details?.otherCode}
    //                     </td>
    //                     <td
    //                       style={{
    //                         border: "1px solid #111827",
    //                         padding: 8,
    //                         textAlign: "right",
    //                       }}
    //                     ></td>
    //                     <td
    //                       style={{
    //                         border: "1px solid #111827",
    //                         padding: 8,
    //                         textAlign: "center",
    //                       }}
    //                     >
    //                       {details?.otherGst}
    //                     </td>
    //                     <td
    //                       style={{
    //                         border: "1px solid #111827",
    //                         padding: 8,
    //                         textAlign: "right",
    //                       }}
    //                     ></td>
    //                     <td
    //                       style={{
    //                         border: "1px solid #111827",
    //                         padding: 8,
    //                         textAlign: "right",
    //                       }}
    //                     >
    //                       {inrCurrency(details?.otherFees)}
    //                     </td>
    //                   </tr>
    //                 )}

    //                 {details?.totalAmount != null && (
    //                   <tr>
    //                     <td
    //                       style={{
    //                         border: "1px solid #111827",
    //                         padding: 8,
    //                         textAlign: "center",
    //                       }}
    //                     ></td>
    //                     <td
    //                       style={{
    //                         border: "1px solid #111827",
    //                         padding: 8,
    //                         fontWeight: 700,
    //                       }}
    //                     >
    //                       Total
    //                     </td>
    //                     <td
    //                       style={{ border: "1px solid #111827", padding: 8 }}
    //                     ></td>
    //                     <td
    //                       style={{ border: "1px solid #111827", padding: 8 }}
    //                     ></td>
    //                     <td
    //                       style={{ border: "1px solid #111827", padding: 8 }}
    //                     ></td>
    //                     <td
    //                       style={{ border: "1px solid #111827", padding: 8 }}
    //                     ></td>
    //                     <td
    //                       style={{
    //                         border: "1px solid #111827",
    //                         padding: 8,
    //                         textAlign: "right",
    //                         fontWeight: 700,
    //                       }}
    //                     >
    //                       {inrCurrency(details?.totalAmount)}
    //                     </td>
    //                   </tr>
    //                 )}
    //               </tbody>
    //             </table>
    //           )}
    //         </div>

    //         {/* Total Amount in Words */}
    //         {details?.totalAmount > 0 && (
    //           <div
    //             style={{
    //               display: "flex",
    //               justifyContent: "flex-end",
    //               gap: 8,
    //               color: "#6b7280",
    //               fontSize: 14,
    //             }}
    //           >
    //             <span style={{ fontWeight: 600, color: "#111827" }}>
    //               Total in words :
    //             </span>
    //             <span style={{ fontStyle: "italic", fontWeight: 500 }}>
    //               {numWords(details?.totalAmount)}
    //             </span>
    //           </div>
    //         )}

    //         <div
    //           style={{
    //             borderTop: "1px solid #e5e7eb",
    //             paddingTop: 12,
    //             display: "flex",
    //             flexDirection: "column",
    //             gap: 16,
    //             fontSize: 13,
    //             color: "#374151",
    //           }}
    //         >
    //           {/* Terms & Conditions */}
    //           <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
    //             <h4
    //               style={{
    //                 margin: 0,
    //                 fontSize: 16,
    //                 fontWeight: 700,
    //                 color: "#111827",
    //               }}
    //             >
    //               Terms & Conditions
    //             </h4>

    //             <ul
    //               style={{
    //                 margin: 0,
    //                 paddingLeft: 18,
    //                 lineHeight: 1.45,
    //                 listStyle: "outside",
    //               }}
    //             >
    //               <li>
    //                 All prices are inclusive/exclusive of taxes as applicable.
    //               </li>
    //               <li>
    //                 Validity of this estimate is 30 days from the date of issue.
    //               </li>
    //               <li>
    //                 Work will commence only after receiving the agreed advance
    //                 payment.
    //               </li>
    //               <li>
    //                 Delivery timelines may vary depending on government
    //                 processing time.
    //               </li>
    //               <li>
    //                 No refund will be applicable once the work has been
    //                 initiated.
    //               </li>
    //               <li>
    //                 Any additional requirements will be charged separately.
    //               </li>
    //             </ul>
    //           </div>

    //           {/* Notes */}
    //           <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
    //             <h4
    //               style={{
    //                 margin: 0,
    //                 fontSize: 16,
    //                 fontWeight: 700,
    //                 color: "#111827",
    //               }}
    //             >
    //               Notes
    //             </h4>

    //             <ul
    //               style={{
    //                 margin: 0,
    //                 paddingLeft: 18,
    //                 lineHeight: 1.45,
    //                 listStyle: "outside",
    //               }}
    //             >
    //               <li>
    //                 Government fee and corpseed professional fee may differ
    //                 depending on any additional changes advised the client in
    //                 the application or any changes in the government policies.
    //               </li>
    //               <li>
    //                 This estimate is system-generated and does not require a
    //                 physical signature.
    //               </li>
    //             </ul>
    //           </div>
    //         </div>
    //       </div>
    //     </div>

    //     {/* Export button */}
    //     <div style={{ display: "flex", justifyContent: "center" }}>
    //       <button
    //         onClick={generatePDF}
    //         style={{
    //           padding: "10px 18px",
    //           backgroundColor: "#16a34a",
    //           color: "#fff",
    //           border: "none",
    //           borderRadius: 8,
    //           cursor: "pointer",
    //           fontWeight: 600,
    //           boxShadow: "0 6px 12px rgba(6,95,70,0.12)",
    //         }}
    //         aria-label="Export as PDF"
    //       >
    //         Download PDF
    //       </button>
    //     </div>
    //   </div>
    // </div>