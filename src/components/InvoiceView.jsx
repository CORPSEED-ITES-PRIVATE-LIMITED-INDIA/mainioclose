import React, { useRef } from "react";
import numWords from "num-words";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import logo from "../assets/CORPSEED.webp";
import dayjs from "dayjs";
import domToImage from "dom-to-image";
import { inrCurrency } from "../common";

const InvoiceView = ({ details }) => {
  const pdfRef = useRef();

  const generatePDF = async () => {
    const element = pdfRef.current;
    try {
      const imgData = await domToImage.toPng(element, {
        quality: 0.95,
        bgcolor: "#ffffff",
      });
      const pdf = new jsPDF("p", "mm", "a4");
      const img = new Image();
      img.src = imgData;
      img.onload = () => {
        const imgWidth = 210;
        const imgHeight = (img.height * imgWidth) / img.width;
        const pageHeight = 297;
        let yPosition = 0;
        while (yPosition < imgHeight) {
          pdf.addImage(imgData, "PNG", 0, -yPosition, imgWidth, imgHeight);
          yPosition += pageHeight;
          if (yPosition < imgHeight) {
            pdf.addPage();
          }
        }
        pdf.save("estimate.pdf");
      };
    } catch (error) {
      console.error("Error generating PDF:", error);
    }
  };

  return (
    <div ref={pdfRef} style={{ position: "relative" }}>
      {/* Ribbon */}
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          backgroundColor: "#22c55e",
          color: "#ffffff",
          padding: "4px 16px",
          fontSize: "14px",
          fontWeight: 600,
          borderRadius: "0 4px 4px 0",
        }}
      >
        {details?.performaInvoice ? "Proforma Invoice" : "Estimate"}
      </div>

      {/* Main Container */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "24px",
          padding: "56px",
          borderRadius: "8px",
          boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
          border: "1px solid #e5e7eb",
          marginBottom: "24px",
          backgroundColor: "#ffffff",
        }}
      >
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div>
              <img
                src={logo}
                alt="corpseed"
                style={{ width: "auto", height: "48px" }}
              />
            </div>
            <div style={{ display: "flex", flexDirection: "column" }}>
              <p style={{ color: "#6b7280" }}>Corpseed Ites Private Limited</p>
              <p>CN U74999UP2018PTC101873</p>
              <p>2nd floor, A-154A, A Block, sector 63</p>
              <p>Noida, Uttar Pradesh - 2013</p>
            </div>
          </div>
          <div
            style={{ display: "flex", flexDirection: "column", gap: "24px" }}
          >
            <div style={{ display: "flex", flexDirection: "column" }}>
              <h4
                style={{ color: "#22c55e", fontWeight: 700, fontSize: "18px" }}
              >
                {details?.performaInvoice ? "Proforma Invoice" : "Estimate"}
              </h4>
              <p style={{ fontWeight: 700 }}>{`#ESTD0${details?.id}`}</p>
            </div>
            <div style={{ display: "flex", flexDirection: "column" }}>
              <h4
                style={{ color: "#22c55e", fontWeight: 700, fontSize: "18px" }}
              >
                Order No.
              </h4>
              <p style={{ fontWeight: 700 }}>{details?.orderNumber}</p>
            </div>
          </div>
        </div>

        {/* Bill To */}
        <div style={{ display: "flex", flexDirection: "column" }}>
          <p style={{ color: "#6b7280" }}>Bill To :</p>
          <div style={{ display: "flex", flexDirection: "column" }}>
            {details?.companyName && (
              <p style={{ fontWeight: 700 }}>{details?.companyName}</p>
            )}
            {details?.address && <p>{details?.address}</p>}
            <div style={{ display: "flex" }}>
              {details?.city && <p>{details?.city},</p>}
              {details?.state && <p>{details?.state},</p>}
              {details?.country && <p>{details?.country}</p>}
            </div>
            {details?.primaryPinCode && <p>{details?.primaryPinCode}</p>}
          </div>
        </div>

        {/* Ship To + Dates */}
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <p style={{ color: "#6b7280" }}>Ship To :</p>
            {details?.companyName && <p>{details?.companyName}</p>}
            {details?.secondaryAddress && <p>{details?.secondaryAddress}</p>}
            <div style={{ display: "flex" }}>
              {details?.secondaryCity && <p>{details?.secondaryCity},</p>}
              {details?.secondaryState && <p>{details?.secondaryState},</p>}
              {details?.secondaryCountry && (
                <p>{details?.secondaryCountry?.name}</p>
              )}
            </div>
            {details?.secondaryPinCode && <p>{details?.secondaryPinCode}</p>}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {details?.estimateDate && (
              <div style={{ display: "flex", gap: "8px" }}>
                <p style={{ color: "#6b7280" }}>Estimate Date</p>
                <p>:</p>
                <p>{dayjs(details?.estimateDate).format("DD-MM-YYYY")}</p>
              </div>
            )}

            <div style={{ display: "flex", gap: "8px" }}>
              <p style={{ color: "#6b7280" }}>Order Date</p>
              <p>:</p>
              <p>{dayjs(details?.createDate).format("DD-MM-YYYY")}</p>
            </div>
          </div>
        </div>

        {/* Table */}
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {details?.Type === "Product" ? (
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                border: "1px solid #e5e7eb",
                fontSize: "14px",
              }}
            >
              <thead style={{ backgroundColor: "#f3f4f6" }}>
                <tr>
                  <th style={{ border: "1px solid #e5e7eb", padding: "8px" }}>
                    #
                  </th>
                  <th style={{ border: "1px solid #e5e7eb", padding: "8px" }}>
                    Item and description
                  </th>
                  <th style={{ border: "1px solid #e5e7eb", padding: "8px" }}>
                    HSN
                  </th>
                  <th style={{ border: "1px solid #e5e7eb", padding: "8px" }}>
                    Rate/kg
                  </th>
                  <th style={{ border: "1px solid #e5e7eb", padding: "8px" }}>
                    Quantity (kg)
                  </th>
                  <th style={{ border: "1px solid #e5e7eb", padding: "8px" }}>
                    GST %
                  </th>
                  <th style={{ border: "1px solid #e5e7eb", padding: "8px" }}>
                    GST amount(₹)
                  </th>
                  <th style={{ border: "1px solid #e5e7eb", padding: "8px" }}>
                    Amount(₹)
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={{ border: "1px solid #e5e7eb", padding: "8px" }}>
                    1
                  </td>
                  <td
                    style={{
                      border: "1px solid #e5e7eb",
                      padding: "8px",
                      fontWeight: 700,
                    }}
                  >
                    {details?.productName}
                  </td>
                  <td
                    style={{ border: "1px solid #e5e7eb", padding: "8px" }}
                  ></td>
                  <td
                    style={{ border: "1px solid #e5e7eb", padding: "8px" }}
                  ></td>
                  <td
                    style={{ border: "1px solid #e5e7eb", padding: "8px" }}
                  ></td>
                  <td
                    style={{ border: "1px solid #e5e7eb", padding: "8px" }}
                  ></td>
                  <td
                    style={{ border: "1px solid #e5e7eb", padding: "8px" }}
                  ></td>
                  <td
                    style={{ border: "1px solid #e5e7eb", padding: "8px" }}
                  ></td>
                </tr>
                {details?.gstCode && (
                  <tr>
                    <td
                      style={{ border: "1px solid #e5e7eb", padding: "8px" }}
                    ></td>
                    <td style={{ border: "1px solid #e5e7eb", padding: "8px" }}>
                      Service fee
                    </td>
                    <td style={{ border: "1px solid #e5e7eb", padding: "8px" }}>
                      {details?.gstCode}
                    </td>
                    <td style={{ border: "1px solid #e5e7eb", padding: "8px" }}>
                      {details?.actualPrice}
                    </td>
                    <td style={{ border: "1px solid #e5e7eb", padding: "8px" }}>
                      {details?.quantity}
                    </td>
                    <td style={{ border: "1px solid #e5e7eb", padding: "8px" }}>
                      {details?.gst}
                    </td>
                    <td style={{ border: "1px solid #e5e7eb", padding: "8px" }}>
                      {(details?.actualPrice *
                        details?.quantity *
                        details?.gst) /
                        100}
                    </td>
                    <td style={{ border: "1px solid #e5e7eb", padding: "8px" }}>
                      ₹{details?.totalPrice}
                    </td>
                  </tr>
                )}
                <tr
                  style={{
                    borderTop: "1px solid #000000",
                    borderBottom: "1px solid #000000",
                  }}
                >
                  <td
                    style={{ border: "1px solid #e5e7eb", padding: "8px" }}
                  ></td>
                  <td
                    style={{
                      border: "1px solid #e5e7eb",
                      padding: "8px",
                      fontWeight: 700,
                    }}
                  >
                    Total Qty. : 1
                  </td>
                  <td
                    style={{ border: "1px solid #e5e7eb", padding: "8px" }}
                  ></td>
                  <td
                    style={{ border: "1px solid #e5e7eb", padding: "8px" }}
                  ></td>
                  <td
                    style={{ border: "1px solid #e5e7eb", padding: "8px" }}
                  ></td>
                  <td
                    style={{ border: "1px solid #e5e7eb", padding: "8px" }}
                  ></td>
                  <td
                    style={{ border: "1px solid #e5e7eb", padding: "8px" }}
                  ></td>
                  <td
                    style={{
                      border: "1px solid #e5e7eb",
                      padding: "8px",
                      display: "flex",
                      gap: "4px",
                    }}
                  >
                    <span>₹</span>
                    <span style={{ fontWeight: 700 }}>
                      ₹ {details?.totalPrice}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          ) : (
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                border: "1px solid #e5e7eb",
                fontSize: "14px",
              }}
            >
              <thead style={{ backgroundColor: "#f3f4f6" }}>
                <tr>
                  <th style={{ border: "1px solid #e5e7eb", padding: "8px" }}>
                    #
                  </th>
                  <th style={{ border: "1px solid #e5e7eb", padding: "8px" }}>
                    Item and description
                  </th>
                  <th style={{ border: "1px solid #e5e7eb", padding: "8px" }}>
                    HSN
                  </th>
                  <th style={{ border: "1px solid #e5e7eb", padding: "8px" }}>
                    Rate
                  </th>
                  <th style={{ border: "1px solid #e5e7eb", padding: "8px" }}>
                    GST %
                  </th>
                  <th style={{ border: "1px solid #e5e7eb", padding: "8px" }}>
                    GST amount
                  </th>
                  <th style={{ border: "1px solid #e5e7eb", padding: "8px" }}>
                    Amount
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={{ border: "1px solid #e5e7eb", padding: "8px" }}>
                    1
                  </td>
                  <td
                    style={{
                      border: "1px solid #e5e7eb",
                      padding: "8px",
                      fontWeight: 700,
                    }}
                  >
                    {details?.productName}
                  </td>
                  <td
                    style={{ border: "1px solid #e5e7eb", padding: "8px" }}
                  ></td>
                  <td
                    style={{ border: "1px solid #e5e7eb", padding: "8px" }}
                  ></td>
                  <td
                    style={{ border: "1px solid #e5e7eb", padding: "8px" }}
                  ></td>
                  <td
                    style={{ border: "1px solid #e5e7eb", padding: "8px" }}
                  ></td>
                  <td
                    style={{ border: "1px solid #e5e7eb", padding: "8px" }}
                  ></td>
                </tr>
                {details?.govermentCode && (
                  <tr>
                    <td
                      style={{ border: "1px solid #e5e7eb", padding: "8px" }}
                    ></td>
                    <td style={{ border: "1px solid #e5e7eb", padding: "8px" }}>
                      Government fee
                    </td>
                    <td style={{ border: "1px solid #e5e7eb", padding: "8px" }}>
                      {details?.govermentCode}
                    </td>
                    <td
                      style={{ border: "1px solid #e5e7eb", padding: "8px" }}
                    ></td>
                    <td style={{ border: "1px solid #e5e7eb", padding: "8px" }}>
                      {details?.govermentGst}
                    </td>
                    <td
                      style={{ border: "1px solid #e5e7eb", padding: "8px" }}
                    ></td>
                    <td style={{ border: "1px solid #e5e7eb", padding: "8px" }}>
                      {inrCurrency(details?.govermentFees)}
                    </td>
                  </tr>
                )}
                {details?.profesionalCode !== null && (
                  <tr>
                    <td
                      style={{ border: "1px solid #e5e7eb", padding: "8px" }}
                    ></td>
                    <td style={{ border: "1px solid #e5e7eb", padding: "8px" }}>
                      Professional fee
                    </td>
                    <td style={{ border: "1px solid #e5e7eb", padding: "8px" }}>
                      {details?.profesionalCode}
                    </td>
                    <td
                      style={{ border: "1px solid #e5e7eb", padding: "8px" }}
                    ></td>
                    <td style={{ border: "1px solid #e5e7eb", padding: "8px" }}>
                      {details?.profesionalGst}
                    </td>
                    <td
                      style={{ border: "1px solid #e5e7eb", padding: "8px" }}
                    ></td>
                    <td style={{ border: "1px solid #e5e7eb", padding: "8px" }}>
                      {inrCurrency(details?.professionalFees)}
                    </td>
                  </tr>
                )}
                {details?.serviceCode !== null && (
                  <tr>
                    <td
                      style={{ border: "1px solid #e5e7eb", padding: "8px" }}
                    ></td>
                    <td style={{ border: "1px solid #e5e7eb", padding: "8px" }}>
                      Service fee
                    </td>
                    <td style={{ border: "1px solid #e5e7eb", padding: "8px" }}>
                      {details?.serviceCode}
                    </td>
                    <td
                      style={{ border: "1px solid #e5e7eb", padding: "8px" }}
                    ></td>
                    <td style={{ border: "1px solid #e5e7eb", padding: "8px" }}>
                      {details?.serviceGst}
                    </td>
                    <td
                      style={{ border: "1px solid #e5e7eb", padding: "8px" }}
                    ></td>
                    <td style={{ border: "1px solid #e5e7eb", padding: "8px" }}>
                      {inrCurrency(details?.serviceCharge)}
                    </td>
                  </tr>
                )}
                {details?.otherCode !== null && (
                  <tr>
                    <td
                      style={{ border: "1px solid #e5e7eb", padding: "8px" }}
                    ></td>
                    <td style={{ border: "1px solid #e5e7eb", padding: "8px" }}>
                      Other fee
                    </td>
                    <td style={{ border: "1px solid #e5e7eb", padding: "8px" }}>
                      {details?.otherCode}
                    </td>
                    <td
                      style={{ border: "1px solid #e5e7eb", padding: "8px" }}
                    ></td>
                    <td style={{ border: "1px solid #e5e7eb", padding: "8px" }}>
                      {details?.otherGst}
                    </td>
                    <td
                      style={{ border: "1px solid #e5e7eb", padding: "8px" }}
                    ></td>
                    <td style={{ border: "1px solid #e5e7eb", padding: "8px" }}>
                      {inrCurrency(details?.otherFees)}
                    </td>
                  </tr>
                )}
                <tr
                  style={{
                    borderTop: "1px solid #000000",
                    borderBottom: "1px solid #000000",
                  }}
                >
                  <td
                    style={{ border: "1px solid #e5e7eb", padding: "8px" }}
                  ></td>
                  <td
                    style={{
                      border: "1px solid #e5e7eb",
                      padding: "8px",
                      fontWeight: 700,
                    }}
                  >
                    Total Qty. : 1
                  </td>
                  <td
                    style={{ border: "1px solid #e5e7eb", padding: "8px" }}
                  ></td>
                  <td
                    style={{ border: "1px solid #e5e7eb", padding: "8px" }}
                  ></td>
                  <td
                    style={{ border: "1px solid #e5e7eb", padding: "8px" }}
                  ></td>
                  <td
                    style={{ border: "1px solid #e5e7eb", padding: "8px" }}
                  ></td>
                  <td
                    style={{
                      border: "1px solid #e5e7eb",
                      padding: "8px",
                      fontWeight: 700,
                    }}
                  >
                    {inrCurrency(details?.totalAmount)}
                  </td>
                </tr>
              </tbody>
            </table>
          )}

          {/* Total in Words */}
          {details?.totalAmount > 0 && (
            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                gap: "4px",
              }}
            >
              <p style={{ color: "#6b7280" }}>Total in words</p>
              <p>:</p>
              <p>{numWords(details?.totalAmount)}</p>
            </div>
          )}

          {/* GST Table */}
          <div style={{ display: "flex", flexDirection: "column" }}>
            <p>Tax details</p>
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                border: "1px solid #e5e7eb",
                fontSize: "14px",
              }}
            >
              <thead style={{ backgroundColor: "#f3f4f6" }}>
                <tr>
                  <th style={{ border: "1px solid #e5e7eb", padding: "8px" }}>
                    HSN
                  </th>
                  <th style={{ border: "1px solid #e5e7eb", padding: "8px" }}>
                    SGST %
                  </th>
                  <th style={{ border: "1px solid #e5e7eb", padding: "8px" }}>
                    CGST %
                  </th>
                  <th style={{ border: "1px solid #e5e7eb", padding: "8px" }}>
                    IGST %
                  </th>
                </tr>
              </thead>
              <tbody>
                {details?.Type === "Product" ? (
                  details?.gstCode !== null && (
                    <tr>
                      <td
                        style={{ border: "1px solid #e5e7eb", padding: "8px" }}
                      >
                        {details?.gstCode}
                      </td>
                      <td
                        style={{ border: "1px solid #e5e7eb", padding: "8px" }}
                      >
                        0.0 %
                      </td>
                      <td
                        style={{ border: "1px solid #e5e7eb", padding: "8px" }}
                      >
                        0.0 %
                      </td>
                      <td
                        style={{ border: "1px solid #e5e7eb", padding: "8px" }}
                      >
                        {details?.gst}
                      </td>
                    </tr>
                  )
                ) : (
                  <>
                    {details?.profesionalCode !== null && (
                      <tr>
                        <td
                          style={{
                            border: "1px solid #e5e7eb",
                            padding: "8px",
                          }}
                        >
                          {details?.profesionalCode}
                        </td>
                        <td
                          style={{
                            border: "1px solid #e5e7eb",
                            padding: "8px",
                          }}
                        >
                          0.0 %
                        </td>
                        <td
                          style={{
                            border: "1px solid #e5e7eb",
                            padding: "8px",
                          }}
                        >
                          0.0 %
                        </td>
                        <td
                          style={{
                            border: "1px solid #e5e7eb",
                            padding: "8px",
                          }}
                        >
                          {details?.profesionalGst}
                        </td>
                      </tr>
                    )}
                    {details?.serviceCode !== null && (
                      <tr>
                        <td
                          style={{
                            border: "1px solid #e5e7eb",
                            padding: "8px",
                          }}
                        >
                          {details?.serviceCode}
                        </td>
                        <td
                          style={{
                            border: "1px solid #e5e7eb",
                            padding: "8px",
                          }}
                        >
                          0.0 %
                        </td>
                        <td
                          style={{
                            border: "1px solid #e5e7eb",
                            padding: "8px",
                          }}
                        >
                          0.0 %
                        </td>
                        <td
                          style={{
                            border: "1px solid #e5e7eb",
                            padding: "8px",
                          }}
                        >
                          {details?.serviceGst}
                        </td>
                      </tr>
                    )}
                    {details?.govermentCode !== null && (
                      <tr>
                        <td
                          style={{
                            border: "1px solid #e5e7eb",
                            padding: "8px",
                          }}
                        >
                          {details?.govermentCode}
                        </td>
                        <td
                          style={{
                            border: "1px solid #e5e7eb",
                            padding: "8px",
                          }}
                        >
                          0.0 %
                        </td>
                        <td
                          style={{
                            border: "1px solid #e5e7eb",
                            padding: "8px",
                          }}
                        >
                          0.0 %
                        </td>
                        <td
                          style={{
                            border: "1px solid #e5e7eb",
                            padding: "8px",
                          }}
                        >
                          {details?.govermentGst}
                        </td>
                      </tr>
                    )}
                    {details?.otherCode !== null && (
                      <tr>
                        <td
                          style={{
                            border: "1px solid #e5e7eb",
                            padding: "8px",
                          }}
                        >
                          {details?.otherCode}
                        </td>
                        <td
                          style={{
                            border: "1px solid #e5e7eb",
                            padding: "8px",
                          }}
                        >
                          0.0 %
                        </td>
                        <td
                          style={{
                            border: "1px solid #e5e7eb",
                            padding: "8px",
                          }}
                        >
                          0.0 %
                        </td>
                        <td
                          style={{
                            border: "1px solid #e5e7eb",
                            padding: "8px",
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
        </div>

        {/* Notes */}
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          <p style={{ fontWeight: 700 }}>Notes :</p>
          <p style={{ color: "#6b7280" }}>
            This Estimate & price quotation is valid for 7 calendar days from
            the date of issue.
          </p>
          <p style={{ color: "#6b7280" }}>{details?.invoiceNote}</p>
          <p style={{ color: "#6b7280" }}>
            Remark : {details?.getRemarkForOperation}
          </p>
          <hr style={{ margin: "8px 0" }} />
          <p style={{ color: "#6b7280" }}>
            Note: Government fee and corpseed professional fee may differ
            depending on any additional changes advised by the client in the
            application or any changes in government policies.
          </p>
        </div>
      </div>
      <button
        style={{
          padding: "8px 12px",
          margin: "12px 0",
          border: "1px solid #e5e7eb",
          cursor: "pointer",
          borderRadius: "8px",
        }}
        onClick={generatePDF}
      >
        Export as PDF
      </button>
    </div>
  );
};

export default InvoiceView;
