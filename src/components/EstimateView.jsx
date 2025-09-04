import { Button } from "@heroui/button";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import  { useRef } from "react";

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
    <div class="container">
      <div className="flex justify-end">
        <Button onPress={generatePDF}>Pdf download</Button>
      </div>
      <div class="content">
        {details?.productName && (
          <div class="flex align-center gap-4">
            <strong>Product name</strong>
            <span>:</span>
            <span>{details.productName}</span>
          </div>
        )}

        <div class="flex gap-60">
          {details?.primaryContact && (
            <div class="card">
              <div class="vertical gap-12">
                <strong>Primary contact detail</strong>
                <div class="vertical">
                  <div class="space">
                    <span>Name:</span>
                    <span>{details.primaryContact.name}</span>
                  </div>
                  <div class="space">
                    <span>Email:</span>
                    <span>{details.primaryContact.emails}</span>
                  </div>
                  <div class="space">
                    <span>Contact number:</span>
                    <span>{details.primaryContact.contactNo}</span>
                  </div>
                  <div class="space">
                    <span>Whatsapp number:</span>
                    <span>{details.primaryContact.whatsappNo}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {details?.secondaryContact && (
            <div class="card">
              <div class="vertical gap-12">
                <strong>Secondary contact detail</strong>
                <div class="vertical">
                  <div class="space">
                    <span>Name:</span>
                    <span>{details.secondaryContact.name}</span>
                  </div>
                  <div class="space">
                    <span>Email:</span>
                    <span>{details.secondaryContact.emails}</span>
                  </div>
                  <div class="space">
                    <span>Contact number:</span>
                    <span>{details.secondaryContact.contactNo}</span>
                  </div>
                  <div class="space">
                    <span>Whatsapp number:</span>
                    <span>{details.secondaryContact.whatsappNo}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div class="invoice-wrapper" ref={pdfRef}>
          <div class="ribbon">
            <span class="ribbon-text">
              {details?.performaInvoice ? "Proforma Invoice" : "Estimate"}
            </span>
          </div>

          <div class="invoice-box">
            <div class="flex space-between">
              <div>
                <img src={logo} alt="corpseed" />
                <div>
                  <small>Corpseed Ites Private Limited</small>
                  <div>CN U74999UP2018PTC101873</div>
                  <div>2nd floor, A-154A, A Block, sector 63</div>
                  <div>Noida, Uttar Pradesh - 2013</div>
                </div>
              </div>

              <div class="vertical gap-24">
                <div>
                  <h4>
                    {details?.performaInvoice ? "Proforma Invoice" : "Estimate"}
                  </h4>
                  <strong>{`#ESTD0${details?.id}`}</strong>
                </div>
                <div>
                  <h4>Order No.</h4>
                  <strong>{details?.orderNumber}</strong>
                </div>
              </div>
            </div>

            <div>
              <small>Bill To:</small>
              <div class="vertical">
                {details?.companyName && <strong>{details.companyName}</strong>}
                {details?.address && <div>{details.address}</div>}
                <div>
                  {details?.city && <span>{details.city}, </span>}
                  {details?.state && <span>{details.state}, </span>}
                  {details?.country && <span>{details.country}</span>}
                </div>
                {details?.primaryPinCode && <div>{details.primaryPinCode}</div>}
              </div>
            </div>

            <div class="flex space-between">
              <div class="vertical">
                <small>Ship To:</small>
                {details?.companyName && <div>{details.companyName}</div>}
                {details?.secondaryAddress && (
                  <div>{details.secondaryAddress}</div>
                )}
                <div>
                  {details?.secondaryCity && (
                    <span>{details.secondaryCity}, </span>
                  )}
                  {details?.secondaryState && (
                    <span>{details.secondaryState}, </span>
                  )}
                  {details?.secondaryCountry && (
                    <span>{details.secondaryCountry?.name}</span>
                  )}
                </div>
                {details?.secondaryPinCode && (
                  <div>{details.secondaryPinCode}</div>
                )}
              </div>
              <div class="vertical">
                <div>
                  <span>Estimate Date:</span>{" "}
                  <span>
                    {dayjs(details?.estimateDate).format("DD-MM-YYYY")}
                  </span>
                </div>
                <div>
                  <span>Order Date:</span>{" "}
                  <span>{dayjs(details?.createDate).format("DD-MM-YYYY")}</span>
                </div>
              </div>
            </div>

            <div>
              <table class="custom-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Item and description</th>
                    <th>HSN</th>
                    <th>Rate</th>
                    <th>GST %</th>
                    <th>GST Amount</th>
                    <th>Total</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>1</td>
                    <td>
                      <strong>{details?.productName}</strong>
                    </td>
                    <td>{details?.gstCode}</td>
                    <td>{details?.actualPrice}</td>
                    <td>{details?.gst}</td>
                    <td>
                      {(details?.actualPrice *
                        details?.quantity *
                        details?.gst) /
                        100}
                    </td>
                    <td>{details?.totalPrice}</td>
                  </tr>
                  <tr class="total-row">
                    <td colspan="6">Total</td>
                    <td>
                      <strong>{details?.totalPrice}</strong>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {details?.totalAmount > 0 && (
              <div class="flex justify-end">
                <span>Total in words:</span>
                <span>{numWords(details?.totalAmount)}</span>
              </div>
            )}

            <div>
              <table class="gst-table">
                <thead>
                  <tr>
                    <th>HSN</th>
                    <th>SGST %</th>
                    <th>CGST %</th>
                    <th>IGST %</th>
                  </tr>
                </thead>
                <tbody>
                  {details?.gstCode && (
                    <tr>
                      <td>{details?.gstCode}</td>
                      <td>0.0%</td>
                      <td>0.0%</td>
                      <td>{details?.gst}</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div class="vertical gap-8">
              <div class="vertical">
                <strong>Notes:</strong>
                <small>
                  This Estimate & price quotation is valid for 7 calendar days
                  from the date of issue.
                </small>
                <small>{details?.invoiceNote}</small>
                <small>Remark: {details?.getRemarkForOperation}</small>
              </div>
              <hr />
              <div>
                <small>
                  Note: Government fee and corpseed professional fee may differ
                  depending on any additional changes advised by the client in
                  the application or due to changes in government policies.
                </small>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EstimateView;
