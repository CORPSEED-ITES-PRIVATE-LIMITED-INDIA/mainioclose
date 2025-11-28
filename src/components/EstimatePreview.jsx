import { Button } from "@heroui/button";
import html2canvas from "html2canvas";
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

  useEffect(() => {
    const id = "roboto-google-font";
    if (!document.getElementById(id)) {
      const link = document.createElement("link");
      link.id = id;
      link.rel = "stylesheet";
      link.href =
        "https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;600;700&display=swap";
      document.head.appendChild(link);
    }
  }, []);

  const pdfRef = useRef();

  // Attempt to remove CSS rules that use unsupported color functions (oklch)
  // This will only succeed for same-origin stylesheets. Cross-origin sheets are skipped.
  const sanitizeStylesheetsContainingOKLCH = () => {
    try {
      for (let i = 0; i < document.styleSheets.length; i++) {
        const sheet = document.styleSheets[i];
        // Accessing cssRules of cross-origin sheets will throw — we catch below.
        try {
          const rules = sheet.cssRules || sheet.rules;
          if (!rules) continue;
          // iterate backwards so deletes don't mess up indexes
          for (let j = rules.length - 1; j >= 0; j--) {
            const rule = rules[j];
            const cssText = rule.cssText || "";
            if (cssText.includes("oklch(") || cssText.includes("oklch ")) {
              try {
                sheet.deleteRule(j);
              } catch (eDel) {
                // ignore delete errors for read-only sheets
              }
            }
          }
        } catch (err) {
          // likely cross-origin stylesheet — ignore
          continue;
        }
      }
    } catch (err) {
      // fail-safe: if anything goes wrong, don't block PDF generation
      console.warn("Stylesheet sanitization failed:", err);
    }
  };

  const generatePDF = async () => {
    try {
      const element = pdfRef.current;
      if (!element) return;

      // 1️⃣ Disable all external CSS (HeroUI / Tailwind)
      document.querySelectorAll("link[rel=stylesheet]").forEach((link) => {
        link.setAttribute("data-disabled", "true");
        link.rel = "alternate stylesheet";
      });

      // 2️⃣ Force simple white background
      element.style.backgroundColor = "#ffffff";

      // 3️⃣ Capture
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#ffffff",
        ignoreElements: (node) => {
          // prevents HeroUI shadows & animations
          return node.tagName === "STYLE";
        },
      });

      // 4️⃣ Restore CSS
      document.querySelectorAll("link[data-disabled]").forEach((link) => {
        link.rel = "stylesheet";
        link.removeAttribute("data-disabled");
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");

      const imgWidth = 210;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      const pageHeight = 297;
      let y = 0;

      while (y < imgHeight) {
        pdf.addImage(imgData, "PNG", 0, -y, imgWidth, imgHeight);
        y += pageHeight;
        if (y < imgHeight) pdf.addPage();
      }

      pdf.save("estimate.pdf");
    } catch (err) {
      console.error("PDF error:", err);
    }
  };

  // Common inline style values
  const containerStyle = {
    maxHeight: "75vh",
    overflow: "auto",
    marginTop: 12,
    paddingLeft: 16,
    paddingRight: 16,
    paddingBottom: 20,
    background: "#f6f7fb",
    fontFamily:
      "'Roboto', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Helvetica Neue', Arial",
    color: "#111827",
  };

  const cardStyle = {
    display: "flex",
    flexDirection: "column",
    gap: 18,
    padding: 20,
    boxShadow: "0 6px 18px rgba(16,24,40,0.06)",
    borderRadius: 10,
    background: "#ffffff",
    border: "1px solid #e6e9ef",
    marginBottom: 10,
  };

  return (
    <div style={containerStyle}>
      <div
        style={{
          width: "100%",
          maxWidth: 980,
          margin: "0 auto",
          display: "flex",
          flexDirection: "column",
          gap: 20,
        }}
      >
        {/* Product Name */}
        {details?.productName && (
          <div
            style={{
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
              gap: 8,
              flexWrap: "wrap",
            }}
          >
            <h3
              style={{
                fontSize: 18,
                fontWeight: 700,
                margin: 0,
                color: "#111827",
              }}
            >
              Product name
            </h3>
            <span style={{ marginLeft: 6, marginRight: 6, color: "#6b7280" }}>
              :
            </span>
            <p style={{ margin: 0, color: "#111827" }}>
              {details?.productName}
            </p>
          </div>
        )}

        {/* Main PDF Content */}
        <div style={{ position: "relative" }}>
          {/* Badge */}
          <div
            style={{
              position: "absolute",
              left: 0,
              top: 0,
              backgroundColor: "#10b981",
              color: "#ffffff",
              paddingLeft: 12,
              paddingRight: 12,
              paddingTop: 6,
              paddingBottom: 6,
              borderTopRightRadius: 6,
              borderBottomRightRadius: 6,
              fontSize: 13,
              zIndex: 10,
              fontWeight: 600,
            }}
          >
            {details?.performaInvoice ? "Proforma Invoice" : "Estimate"}
          </div>

          {/* Content Box */}
          <div ref={pdfRef} style={cardStyle}>
            {/* Header */}
            <div
              style={{
                display: "flex",
                flexDirection: "row",
                justifyContent: "space-between",
                gap: 16,
                alignItems: "flex-start",
                flexWrap: "wrap",
                margin: "18px 0px",
                padding: 12,
              }}
            >
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <img
                  src={logo}
                  alt="corpseed"
                  style={{ maxWidth: 130, height: "auto", display: "block" }}
                />
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    color: "#6b7280",
                    fontSize: 13,
                    lineHeight: 1.35,
                    marginTop: 6,
                  }}
                >
                  <p style={{ margin: 0, fontWeight: 600, color: "#111827" }}>
                    Corpseed Ites Private Limited
                  </p>
                  <p style={{ margin: 0 }}>CN U74999UP2018PTC101873</p>
                  <p style={{ margin: 0 }}>GST : 09AAHCC4539J1ZC</p>
                  <p style={{ margin: 0 }}>
                    2nd floor, A-154A, A Block, sector 63
                  </p>
                  <p style={{ margin: 0 }}>Noida, Uttar Pradesh - 2013</p>
                </div>
              </div>

              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "flex-end",
                  gap: 10,
                  marginTop: 8,
                }}
              >
                <div style={{ textAlign: "right" }}>
                  <h4
                    style={{
                      margin: 0,
                      color: "#10b981",
                      fontSize: 18,
                      fontWeight: 700,
                    }}
                  >
                    {details?.performaInvoice ? "Proforma Invoice" : "Estimate"}
                  </h4>
                  <strong
                    style={{ display: "block", marginTop: 6 }}
                  >{`#ESTD0${details?.id ?? ""}`}</strong>
                </div>

                <div style={{ textAlign: "right" }}>
                  <h4
                    style={{
                      margin: 0,
                      color: "#10b981",
                      fontSize: 16,
                      fontWeight: 700,
                    }}
                  >
                    Order No.
                  </h4>
                  <strong style={{ display: "block", marginTop: 6 }}>
                    {details?.orderNumber ?? "-"}
                  </strong>
                </div>
              </div>
            </div>

            {/* Addresses and Dates */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                gap: 12,
                color: "#6b7280",
                fontSize: 14,
                flexWrap: "wrap",
              }}
            >
              <div
                style={{
                  minWidth: 260,
                  flex: "1 1 420px",
                  display: "flex",
                  flexDirection: "column",
                  gap: 12,
                }}
              >
                <div>
                  <p
                    style={{
                      margin: 0,
                      fontWeight: 700,
                      color: "#111827",
                      marginBottom: 6,
                    }}
                  >
                    Bill To :
                  </p>
                  <div
                    style={{
                      fontWeight: 600,
                      lineHeight: 1.4,
                      color: "#111827",
                    }}
                  >
                    {details?.companyName && (
                      <p style={{ margin: 0 }}>{details?.companyName}</p>
                    )}
                    {details?.address && (
                      <p style={{ margin: 0, fontWeight: 400 }}>
                        {details?.address}
                      </p>
                    )}
                    <p style={{ margin: 0, fontWeight: 400 }}>
                      {[details?.city, details?.state, details?.country]
                        .filter(Boolean)
                        .join(", ")}
                    </p>
                    {details?.primaryPinCode && (
                      <p style={{ margin: 0, fontWeight: 400 }}>
                        {details?.primaryPinCode}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <p
                    style={{
                      margin: 0,
                      fontWeight: 700,
                      color: "#111827",
                      marginBottom: 6,
                    }}
                  >
                    Ship To :
                  </p>
                  <div
                    style={{
                      lineHeight: 1.4,
                      color: "#111827",
                    }}
                  >
                    {details?.companyName && (
                      <p style={{ margin: 0, fontWeight: 600 }}>
                        {details?.companyName}
                      </p>
                    )}
                    {details?.secondaryAddress && (
                      <p style={{ margin: 0 }}>{details?.secondaryAddress}</p>
                    )}
                    <p style={{ margin: 0 }}>
                      {[
                        details?.secondaryCity,
                        details?.secondaryState,
                        details?.secondaryCountry?.name,
                      ]
                        .filter(Boolean)
                        .join(", ")}
                    </p>
                    {details?.secondaryPinCode && (
                      <p style={{ margin: 0 }}>{details?.secondaryPinCode}</p>
                    )}
                  </div>
                </div>
              </div>

              <div
                style={{
                  minWidth: 180,
                  flex: "0 0 220px",
                  display: "flex",
                  flexDirection: "column",
                  gap: 8,
                  color: "#6b7280",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    gap: 8,
                    justifyContent: "flex-end",
                  }}
                >
                  <span
                    style={{
                      fontWeight: 700,
                      minWidth: 110,
                      textAlign: "right",
                      color: "#111827",
                    }}
                  >
                    Estimate Date:
                  </span>
                  <span style={{ textAlign: "right" }}>
                    {details?.estimateDate
                      ? dayjs(details?.estimateDate).format("DD-MM-YYYY")
                      : "-"}
                  </span>
                </div>
                <div
                  style={{
                    display: "flex",
                    gap: 8,
                    justifyContent: "flex-end",
                  }}
                >
                  <span
                    style={{
                      fontWeight: 700,
                      minWidth: 110,
                      textAlign: "right",
                      color: "#111827",
                    }}
                  >
                    Order Date:
                  </span>
                  <span style={{ textAlign: "right" }}>
                    {details?.createDate
                      ? dayjs(details?.createDate).format("DD-MM-YYYY")
                      : "-"}
                  </span>
                </div>
              </div>
            </div>

            {/* Table */}
            <div style={{ overflowX: "auto" }}>
              {details?.Type === "Product" ? (
                <table
                  style={{
                    width: "100%",
                    borderCollapse: "collapse",
                    border: "1px solid #111827",
                    fontSize: 13,
                  }}
                >
                  <thead>
                    <tr>
                      <th
                        style={{
                          border: "1px solid #111827",
                          padding: 8,
                          background: "#f8fafc",
                          textAlign: "center",
                        }}
                      >
                        #
                      </th>
                      <th
                        style={{
                          border: "1px solid #111827",
                          padding: 8,
                          background: "#f8fafc",
                        }}
                      >
                        Item and description
                      </th>
                      <th
                        style={{
                          border: "1px solid #111827",
                          padding: 8,
                          background: "#f8fafc",
                          textAlign: "center",
                        }}
                      >
                        HSN
                      </th>
                      <th
                        style={{
                          border: "1px solid #111827",
                          padding: 8,
                          background: "#f8fafc",
                          textAlign: "right",
                        }}
                      >
                        Rate/kg
                      </th>
                      <th
                        style={{
                          border: "1px solid #111827",
                          padding: 8,
                          background: "#f8fafc",
                          textAlign: "right",
                        }}
                      >
                        Quantity (kg)
                      </th>
                      <th
                        style={{
                          border: "1px solid #111827",
                          padding: 8,
                          background: "#f8fafc",
                          textAlign: "center",
                        }}
                      >
                        GST %
                      </th>
                      <th
                        style={{
                          border: "1px solid #111827",
                          padding: 8,
                          background: "#f8fafc",
                          textAlign: "right",
                        }}
                      >
                        GST amount(₹)
                      </th>
                      <th
                        style={{
                          border: "1px solid #111827",
                          padding: 8,
                          background: "#f8fafc",
                          textAlign: "right",
                        }}
                      >
                        Amount(₹)
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td
                        style={{
                          border: "1px solid #111827",
                          padding: 8,
                          textAlign: "center",
                        }}
                      >
                        1
                      </td>
                      <td
                        style={{
                          border: "1px solid #111827",
                          fontWeight: "bold",
                          padding: 8,
                        }}
                      >
                        {details?.productName}
                      </td>
                      <td
                        style={{
                          border: "1px solid #111827",
                          padding: 8,
                          textAlign: "center",
                        }}
                      >
                        {details?.gstCode ?? "-"}
                      </td>
                      <td
                        style={{
                          border: "1px solid #111827",
                          padding: 8,
                          textAlign: "right",
                        }}
                      >
                        {inrCurrency(details?.actualPrice)}
                      </td>
                      <td
                        style={{
                          border: "1px solid #111827",
                          padding: 8,
                          textAlign: "right",
                        }}
                      >
                        {details?.quantity ?? "-"}
                      </td>
                      <td
                        style={{
                          border: "1px solid #111827",
                          padding: 8,
                          textAlign: "center",
                        }}
                      >
                        {details?.gst ?? "-"}
                      </td>
                      <td
                        style={{
                          border: "1px solid #111827",
                          padding: 8,
                          textAlign: "right",
                        }}
                      >
                        {inrCurrency(details?.gstAmount)}
                      </td>
                      <td
                        style={{
                          border: "1px solid #111827",
                          padding: 8,
                          textAlign: "right",
                        }}
                      >
                        {inrCurrency(details?.totalPrice)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              ) : (
                <table
                  style={{
                    width: "100%",
                    borderCollapse: "collapse",
                    border: "1px solid #111827",
                    fontSize: 13,
                  }}
                >
                  <thead>
                    <tr>
                      <th
                        style={{
                          border: "1px solid #111827",
                          padding: 8,
                          background: "#f8fafc",
                          textAlign: "center",
                        }}
                      >
                        #
                      </th>
                      <th
                        style={{
                          border: "1px solid #111827",
                          padding: 8,
                          background: "#f8fafc",
                        }}
                      >
                        Item and description
                      </th>
                      <th
                        style={{
                          border: "1px solid #111827",
                          padding: 8,
                          background: "#f8fafc",
                          textAlign: "center",
                        }}
                      >
                        HSN
                      </th>
                      <th
                        style={{
                          border: "1px solid #111827",
                          padding: 8,
                          background: "#f8fafc",
                          textAlign: "right",
                        }}
                      >
                        Rate
                      </th>
                      <th
                        style={{
                          border: "1px solid #111827",
                          padding: 8,
                          background: "#f8fafc",
                          textAlign: "center",
                        }}
                      >
                        GST %
                      </th>
                      <th
                        style={{
                          border: "1px solid #111827",
                          padding: 8,
                          background: "#f8fafc",
                          textAlign: "right",
                        }}
                      >
                        GST amount
                      </th>
                      <th
                        style={{
                          border: "1px solid #111827",
                          padding: 8,
                          background: "#f8fafc",
                          textAlign: "right",
                        }}
                      >
                        Amount
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td
                        style={{
                          border: "1px solid #111827",
                          padding: 8,
                          textAlign: "center",
                        }}
                      >
                        1
                      </td>
                      <td
                        style={{
                          border: "1px solid #111827",
                          fontWeight: "bold",
                          padding: 8,
                        }}
                      >
                        {details?.productName ?? "-"}
                      </td>
                      <td
                        style={{
                          border: "1px solid #111827",
                          padding: 8,
                          textAlign: "center",
                        }}
                      ></td>
                      <td
                        style={{
                          border: "1px solid #111827",
                          padding: 8,
                          textAlign: "right",
                        }}
                      ></td>
                      <td
                        style={{
                          border: "1px solid #111827",
                          padding: 8,
                          textAlign: "center",
                        }}
                      ></td>
                      <td
                        style={{
                          border: "1px solid #111827",
                          padding: 8,
                          textAlign: "right",
                        }}
                      ></td>
                      <td
                        style={{
                          border: "1px solid #111827",
                          padding: 8,
                          textAlign: "right",
                        }}
                      ></td>
                    </tr>

                    {details?.govermentCode != null && (
                      <tr>
                        <td
                          style={{
                            border: "1px solid #111827",
                            padding: 8,
                            textAlign: "center",
                          }}
                        ></td>
                        <td style={{ border: "1px solid #111827", padding: 8 }}>
                          Government fee
                        </td>
                        <td
                          style={{
                            border: "1px solid #111827",
                            padding: 8,
                            textAlign: "center",
                          }}
                        >
                          {details?.govermentCode}
                        </td>
                        <td
                          style={{
                            border: "1px solid #111827",
                            padding: 8,
                            textAlign: "right",
                          }}
                        ></td>
                        <td
                          style={{
                            border: "1px solid #111827",
                            padding: 8,
                            textAlign: "center",
                          }}
                        >
                          {details?.govermentGst}
                        </td>
                        <td
                          style={{
                            border: "1px solid #111827",
                            padding: 8,
                            textAlign: "right",
                          }}
                        ></td>
                        <td
                          style={{
                            border: "1px solid #111827",
                            padding: 8,
                            textAlign: "right",
                          }}
                        >
                          {inrCurrency(details?.govermentFees)}
                        </td>
                      </tr>
                    )}

                    {details?.profesionalCode != null && (
                      <tr>
                        <td
                          style={{
                            border: "1px solid #111827",
                            padding: 8,
                            textAlign: "center",
                          }}
                        ></td>
                        <td style={{ border: "1px solid #111827", padding: 8 }}>
                          Professional fee
                        </td>
                        <td
                          style={{
                            border: "1px solid #111827",
                            padding: 8,
                            textAlign: "center",
                          }}
                        >
                          {details?.profesionalCode}
                        </td>
                        <td
                          style={{
                            border: "1px solid #111827",
                            padding: 8,
                            textAlign: "right",
                          }}
                        ></td>
                        <td
                          style={{
                            border: "1px solid #111827",
                            padding: 8,
                            textAlign: "center",
                          }}
                        >
                          {details?.profesionalGst}
                        </td>
                        <td
                          style={{
                            border: "1px solid #111827",
                            padding: 8,
                            textAlign: "right",
                          }}
                        ></td>
                        <td
                          style={{
                            border: "1px solid #111827",
                            padding: 8,
                            textAlign: "right",
                          }}
                        >
                          {inrCurrency(details?.professionalFees)}
                        </td>
                      </tr>
                    )}

                    {details?.serviceCode != null && (
                      <tr>
                        <td
                          style={{
                            border: "1px solid #111827",
                            padding: 8,
                            textAlign: "center",
                          }}
                        ></td>
                        <td style={{ border: "1px solid #111827", padding: 8 }}>
                          Service fee
                        </td>
                        <td
                          style={{
                            border: "1px solid #111827",
                            padding: 8,
                            textAlign: "center",
                          }}
                        >
                          {details?.serviceCode}
                        </td>
                        <td
                          style={{
                            border: "1px solid #111827",
                            padding: 8,
                            textAlign: "right",
                          }}
                        ></td>
                        <td
                          style={{
                            border: "1px solid #111827",
                            padding: 8,
                            textAlign: "center",
                          }}
                        >
                          {details?.serviceGst}
                        </td>
                        <td
                          style={{
                            border: "1px solid #111827",
                            padding: 8,
                            textAlign: "right",
                          }}
                        ></td>
                        <td
                          style={{
                            border: "1px solid #111827",
                            padding: 8,
                            textAlign: "right",
                          }}
                        >
                          {inrCurrency(details?.serviceCharge)}
                        </td>
                      </tr>
                    )}

                    {details?.otherCode != null && (
                      <tr>
                        <td
                          style={{
                            border: "1px solid #111827",
                            padding: 8,
                            textAlign: "center",
                          }}
                        ></td>
                        <td style={{ border: "1px solid #111827", padding: 8 }}>
                          Other fee
                        </td>
                        <td
                          style={{
                            border: "1px solid #111827",
                            padding: 8,
                            textAlign: "center",
                          }}
                        >
                          {details?.otherCode}
                        </td>
                        <td
                          style={{
                            border: "1px solid #111827",
                            padding: 8,
                            textAlign: "right",
                          }}
                        ></td>
                        <td
                          style={{
                            border: "1px solid #111827",
                            padding: 8,
                            textAlign: "center",
                          }}
                        >
                          {details?.otherGst}
                        </td>
                        <td
                          style={{
                            border: "1px solid #111827",
                            padding: 8,
                            textAlign: "right",
                          }}
                        ></td>
                        <td
                          style={{
                            border: "1px solid #111827",
                            padding: 8,
                            textAlign: "right",
                          }}
                        >
                          {inrCurrency(details?.otherFees)}
                        </td>
                      </tr>
                    )}

                    {details?.totalAmount != null && (
                      <tr>
                        <td
                          style={{
                            border: "1px solid #111827",
                            padding: 8,
                            textAlign: "center",
                          }}
                        ></td>
                        <td
                          style={{
                            border: "1px solid #111827",
                            padding: 8,
                            fontWeight: 700,
                          }}
                        >
                          Total
                        </td>
                        <td
                          style={{ border: "1px solid #111827", padding: 8 }}
                        ></td>
                        <td
                          style={{ border: "1px solid #111827", padding: 8 }}
                        ></td>
                        <td
                          style={{ border: "1px solid #111827", padding: 8 }}
                        ></td>
                        <td
                          style={{ border: "1px solid #111827", padding: 8 }}
                        ></td>
                        <td
                          style={{
                            border: "1px solid #111827",
                            padding: 8,
                            textAlign: "right",
                            fontWeight: 700,
                          }}
                        >
                          {inrCurrency(details?.totalAmount)}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              )}
            </div>

            {/* Total Amount in Words */}
            {details?.totalAmount > 0 && (
              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  gap: 8,
                  color: "#6b7280",
                  fontSize: 14,
                }}
              >
                <span style={{ fontWeight: 600, color: "#111827" }}>
                  Total in words :
                </span>
                <span style={{ fontStyle: "italic", fontWeight: 500 }}>
                  {numWords(details?.totalAmount)}
                </span>
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
              {/* Terms & Conditions */}
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <h4
                  style={{
                    margin: 0,
                    fontSize: 16,
                    fontWeight: 700,
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
                    Validity of this estimate is 30 days from the date of issue.
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

              {/* Notes */}
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <h4
                  style={{
                    margin: 0,
                    fontSize: 16,
                    fontWeight: 700,
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

        {/* Export button */}
        <div style={{ display: "flex", justifyContent: "center" }}>
          <button
            onClick={generatePDF}
            style={{
              padding: "10px 18px",
              backgroundColor: "#16a34a",
              color: "#fff",
              border: "none",
              borderRadius: 8,
              cursor: "pointer",
              fontWeight: 600,
              boxShadow: "0 6px 12px rgba(6,95,70,0.12)",
            }}
            aria-label="Export as PDF"
          >
            Download PDF
          </button>
        </div>
      </div>
    </div>
  );
};

export default EstimatePreview;
