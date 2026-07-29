import React, { useEffect, useMemo } from "react";
import {
  Button,
  DatePicker,
  Divider,
  Form,
  Input,
  InputNumber,
  Modal,
  Select,
} from "antd";
import dayjs from "dayjs";
import { useDispatch, useSelector } from "react-redux";
import { addToast } from "@heroui/react";
import { createProcurementPurchaseOrder } from "../../toolkit/slices/operationSlice";
import { getVendorById } from "../../toolkit/slices/vendorsSlice";
import FileUploader from "../../components/FileUploader";
import NewTextEditor from "../../components/NewTextEditor";
import { getAllPaymentType } from "../../toolkit/slices/settingSlice";

const { TextArea } = Input;

const taxTypeOptions = [
  { label: "CGST + SGST", value: "CGST_SGST" },
  { label: "IGST", value: "IGST" },
];

const GST_REGISTRATION_TYPE = Object.freeze({
  REGISTERED: "REGISTERED",
  UNREGISTERED: "UNREGISTERED",
  SEZ: "SEZ",
  INTERNATIONAL: "INTERNATIONAL",
});

const COMPANY_GST_STATE_CODE = "09";

const roundAmount = (value) => {
  return Number(Number(value || 0).toFixed(2));
};

const isRichTextEmpty = (html = "") => {
  const text = String(html)
    .replace(/<br\s*\/?>/gi, "")
    .replace(/&nbsp;/gi, " ")
    .replace(/<[^>]*>/g, "")
    .trim();

  return !text;
};

const CreatePurchaseOrderModal = ({
  open,
  onClose,
  procurementAssignmentId,
  userId,
  createdBy,
  defaultEstimatedAmount = 0,
  onSuccess,
  vendorId,
}) => {
  const dispatch = useDispatch();
  const [form] = Form.useForm();

  const paymentTypeList = useSelector((state) => state.setting.paymentTypeList);
  const vendorDetails = useSelector((state) => state.vendors.vendorDetails);
  const vendorDetailsLoading = useSelector((state) => state.vendors.loading);

  /*
   * Prevent stale Redux vendor data from a previously opened vendor
   * from affecting the current purchase order calculation.
   */
  const currentVendorDetails =
    Number(vendorDetails?.id) === Number(vendorId) ? vendorDetails : null;

  const vendorGstRegistrationType = String(
    currentVendorDetails?.gstRegistrationType || "",
  )
    .trim()
    .toUpperCase();

  const vendorGstNumber = String(currentVendorDetails?.gstNumber || "")
    .trim()
    .toUpperCase();

  const vendorGstStateCode = vendorGstNumber.substring(0, 2);

  const isRegisteredVendor =
    vendorGstRegistrationType === GST_REGISTRATION_TYPE.REGISTERED;
  const isUnregisteredVendor =
    vendorGstRegistrationType === GST_REGISTRATION_TYPE.UNREGISTERED;
  const isSezVendor = vendorGstRegistrationType === GST_REGISTRATION_TYPE.SEZ;
  const isInternationalVendor =
    vendorGstRegistrationType === GST_REGISTRATION_TYPE.INTERNATIONAL;

  /*
   * Purchase-order business rules used here:
   *
   * REGISTERED:
   *   GST is applicable.
   *   Net payable = Taxable + GST - TDS.
   *
   * UNREGISTERED / SEZ:
   *   GST is zero under the application's stated rule.
   *   Net payable = Taxable - TDS.
   *
   * INTERNATIONAL:
   *   GST and TDS are zero under the application's stated rule.
   *   Net payable = Taxable.
   *
   * TDS is calculated on the taxable/final amount, never on GST.
   */
  const isGstApplicable = isRegisteredVendor;
  const isTdsApplicable = !isInternationalVendor;

  const resolvedTaxType = useMemo(() => {
    if (!isGstApplicable || vendorGstStateCode.length !== 2) {
      return null;
    }

    return vendorGstStateCode === COMPANY_GST_STATE_CODE ? "CGST_SGST" : "IGST";
  }, [isGstApplicable, vendorGstStateCode]);

  const paymentTypeOptions = useMemo(() => {
    if (!Array.isArray(paymentTypeList)) return [];

    return paymentTypeList.map((item) => ({
      label: item?.name || item?.paymentTypeName || item?.title || "",
      value: item?.name || item?.paymentTypeName || item?.title || "",
    }));
  }, [paymentTypeList]);

  useEffect(() => {
    if (open) {
      dispatch(getAllPaymentType());
    }
  }, [dispatch, open]);

  useEffect(() => {
    if (open && vendorId) {
      dispatch(
        getVendorById({
          data: {},
          vendorId: Number(vendorId),
        }),
      );
    }
  }, [dispatch, open, vendorId]);

  const watchedFinalAmount = Form.useWatch("finalAmount", form);
  const watchedGstRate = Form.useWatch("gstRate", form);
  const watchedTdsPercentage = Form.useWatch("tdsPercentage", form);
  const watchedTaxType = Form.useWatch("taxType", form);
  const [isAttachmentUploading, setIsAttachmentUploading] =
    React.useState(false);

  const taxCalculation = useMemo(() => {
    const finalAmount = roundAmount(watchedFinalAmount);
    const gstRate = isGstApplicable ? Number(watchedGstRate || 0) : 0;
    const tdsPercentage = isTdsApplicable
      ? Number(watchedTdsPercentage || 0)
      : 0;
    const taxType = isGstApplicable ? watchedTaxType : null;

    const totalTaxAmount = isGstApplicable
      ? roundAmount((finalAmount * gstRate) / 100)
      : 0;

    let cgstAmount = 0;
    let sgstAmount = 0;
    let igstAmount = 0;

    if (totalTaxAmount > 0 && taxType === "IGST") {
      igstAmount = totalTaxAmount;
    } else if (totalTaxAmount > 0 && taxType === "CGST_SGST") {
      cgstAmount = roundAmount(totalTaxAmount / 2);

      /*
       * Subtraction avoids a one-paise split-rounding mismatch.
       */
      sgstAmount = roundAmount(totalTaxAmount - cgstAmount);
    }

    /*
     * TDS is calculated only on the taxable/final amount.
     * GST is never included in the TDS base.
     */
    const tdsAmount = isTdsApplicable
      ? roundAmount((finalAmount * tdsPercentage) / 100)
      : 0;

    const grossInvoiceAmount = roundAmount(finalAmount + totalTaxAmount);
    const grandTotal = roundAmount(grossInvoiceAmount - tdsAmount);

    return {
      cgstAmount,
      sgstAmount,
      igstAmount,
      totalTaxAmount,
      tdsAmount,
      grossInvoiceAmount,
      grandTotal,
    };
  }, [
    watchedFinalAmount,
    watchedGstRate,
    watchedTdsPercentage,
    watchedTaxType,
    isGstApplicable,
    isTdsApplicable,
  ]);

  useEffect(() => {
    if (!open) return;

    form.setFieldsValue({
      procurementAssignmentId: Number(procurementAssignmentId || 0),
      vendorId: Number(vendorId || 0),
      poReferenceNumber: "",
      finalAmount: Number(defaultEstimatedAmount || 0),
      gstRate: 0,
      tdsPercentage: 0,
      tdsAmount: 0,
      taxType: null,
      scopeOfWork: "<p></p>",
      termsAndConditions: "<p></p>",
      remarks: "",
      validTillDate: dayjs().add(15, "day"),
      paymentTypeName: "",
      attachmentUrls: [],
      createdBy: Number(createdBy || userId || 0),
      userId: Number(userId || 0),
    });
  }, [
    open,
    form,
    procurementAssignmentId,
    vendorId,
    defaultEstimatedAmount,
    createdBy,
    userId,
  ]);

  useEffect(() => {
    if (!open || !currentVendorDetails?.id) return;

    const existingDomesticTds = Number(
      form.getFieldValue("tdsPercentage") || 0,
    );

    form.setFieldsValue({
      gstRate: isGstApplicable
        ? Number(form.getFieldValue("gstRate") || 18)
        : 0,
      taxType: isGstApplicable ? resolvedTaxType : null,
      tdsPercentage: isTdsApplicable ? existingDomesticTds : 0,
    });
  }, [
    open,
    form,
    currentVendorDetails?.id,
    isGstApplicable,
    isTdsApplicable,
    resolvedTaxType,
  ]);

  useEffect(() => {
    form.setFieldsValue({
      cgstAmount: taxCalculation.cgstAmount,
      sgstAmount: taxCalculation.sgstAmount,
      igstAmount: taxCalculation.igstAmount,
      totalTaxAmount: taxCalculation.totalTaxAmount,
      tdsAmount: taxCalculation.tdsAmount,
      grandTotal: taxCalculation.grandTotal,
    });
  }, [taxCalculation, form]);

  const handleCancel = () => {
    form.resetFields();
    onClose?.();
  };

  const handleSubmit = async (values) => {
    if (isAttachmentUploading) {
      addToast({
        title: "Upload in progress",
        description: "Please wait until attachment upload is completed.",
        color: "warning",
      });
      return;
    }

    if (!vendorGstRegistrationType) {
      addToast({
        title: "Vendor GST type missing",
        description:
          "The vendor GST registration type could not be resolved. Please refresh the vendor details.",
        color: "danger",
      });
      return;
    }

    if (
      !isRegisteredVendor &&
      !isUnregisteredVendor &&
      !isSezVendor &&
      !isInternationalVendor
    ) {
      addToast({
        title: "Unsupported GST type",
        description: `Unsupported vendor GST registration type: ${vendorGstRegistrationType}`,
        color: "danger",
      });
      return;
    }

    if (isRegisteredVendor && !resolvedTaxType) {
      addToast({
        title: "Vendor GSTIN missing",
        description:
          "A valid GST number is required to determine CGST/SGST or IGST for a registered vendor.",
        color: "danger",
      });
      return;
    }

    if (taxCalculation.grandTotal < 0) {
      addToast({
        title: "Invalid payable amount",
        description: "TDS cannot be greater than the taxable amount plus GST.",
        color: "danger",
      });
      return;
    }

    const payload = {
      procurementAssignmentId: Number(procurementAssignmentId || 0),
      vendorId: Number(vendorId || 0),

      poReferenceNumber: values.poReferenceNumber?.trim() || "",

      finalAmount: roundAmount(values.finalAmount),
      gstRate: isGstApplicable ? Number(values.gstRate || 0) : 0,
      taxType: isGstApplicable ? values.taxType || resolvedTaxType : null,

      tdsPercentage: isTdsApplicable ? Number(values.tdsPercentage || 0) : 0,
      tdsAmount: taxCalculation.tdsAmount,

      cgstAmount: taxCalculation.cgstAmount,
      sgstAmount: taxCalculation.sgstAmount,
      igstAmount: taxCalculation.igstAmount,

      totalTaxAmount: taxCalculation.totalTaxAmount,
      grandTotal: taxCalculation.grandTotal,

      scopeOfWork: values.scopeOfWork?.trim() || "",
      termsAndConditions: values.termsAndConditions?.trim() || "",
      remarks: values.remarks?.trim() || "",

      validTillDate: values.validTillDate
        ? dayjs(values.validTillDate).format("YYYY-MM-DD")
        : null,

      paymentTypeName: values.paymentTypeName || "",

      attachmentUrls: Array.isArray(values.attachmentUrls)
        ? values.attachmentUrls.filter(Boolean)
        : [],

      createdBy: Number(createdBy || userId || 0),
      userId: Number(userId || 0),
    };

    try {
      await dispatch(createProcurementPurchaseOrder(payload)).unwrap();

      addToast({
        title: "Purchase Order Created",
        description: "Purchase order has been created successfully.",
        color: "success",
      });

      form.resetFields();
      onSuccess?.();
      onClose?.();
    } catch (error) {
      addToast({
        title: "Something went wrong",
        description:
          error?.message ||
          error?.data?.message ||
          error?.message ||
          "Unable to create purchase order.",
        color: "danger",
      });
    }
  };

  return (
    <Modal
      title="Create Purchase Order"
      open={open}
      onCancel={handleCancel}
      width={1050}
      destroyOnClose
      maskClosable={false}
      footer={null}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        autoComplete="off"
      >
        <div className="grid grid-cols-1 gap-x-5 md:grid-cols-2">
          <Form.Item
            label="Proposal Number"
            name="poReferenceNumber"
            rules={[
              {
                required: true,
                message: "Please enter proposal number",
              },
            ]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label="Valid Till Date"
            name="validTillDate"
            rules={[
              {
                required: true,
                message: "Please select valid till date",
              },
            ]}
          >
            <DatePicker className="w-full" format="YYYY-MM-DD" />
          </Form.Item>

          <Form.Item
            label="Taxable / Final Amount"
            name="finalAmount"
            rules={[
              {
                required: true,
                message: "Please enter final amount",
              },
            ]}
          >
            <InputNumber
              className="w-full"
              style={{ width: "100%" }}
              min={0}
              precision={2}
              placeholder="Enter final amount"
            />
          </Form.Item>

          <Form.Item
            label="GST Rate (%)"
            name="gstRate"
            rules={
              isGstApplicable
                ? [
                    {
                      required: true,
                      message: "Please enter GST rate",
                    },
                  ]
                : []
            }
            extra={
              isGstApplicable
                ? "GST is applicable because the vendor is registered."
                : "GST is not applicable for this vendor registration type."
            }
          >
            <InputNumber
              style={{ width: "100%" }}
              className="w-full"
              min={0}
              max={100}
              precision={2}
              placeholder={
                isGstApplicable ? "Enter GST rate" : "GST not applicable"
              }
              disabled={!isGstApplicable}
            />
          </Form.Item>

          <Form.Item
            label="TDS Percentage (%)"
            name="tdsPercentage"
            rules={[
              {
                required: isTdsApplicable,
                message: "Please enter TDS percentage",
              },
              {
                validator: (_, value) => {
                  if (!isTdsApplicable) {
                    return Promise.resolve();
                  }

                  if (value === null || value === undefined || value === "") {
                    return Promise.resolve();
                  }

                  const percentage = Number(value);

                  if (
                    Number.isNaN(percentage) ||
                    percentage < 0 ||
                    percentage > 100
                  ) {
                    return Promise.reject(
                      new Error("TDS percentage must be between 0 and 100"),
                    );
                  }

                  return Promise.resolve();
                },
              },
            ]}
            extra={
              isInternationalVendor
                ? "TDS is disabled under the application's international-vendor rule."
                : "TDS is calculated on the taxable/final amount only."
            }
          >
            <InputNumber
              rootClassName="tds-percentage-input"
              style={{ width: "100%" }}
              min={0}
              max={100}
              precision={2}
              placeholder={
                isTdsApplicable ? "Enter TDS percentage" : "TDS not applicable"
              }
              disabled={!isTdsApplicable}
            />
          </Form.Item>

          <Form.Item
            label="Tax Type"
            name="taxType"
            rules={
              isGstApplicable
                ? [{ required: true, message: "Please select tax type" }]
                : []
            }
          >
            <Select
              placeholder={
                isGstApplicable
                  ? "Tax type will be selected automatically"
                  : "Not applicable"
              }
              options={taxTypeOptions}
              disabled
              allowClear
            />
          </Form.Item>

          {/* <Form.Item label="CGST Amount" name="cgstAmount">
            <InputNumber
              className="w-full"
              style={{ width: "100%" }}
              min={0}
              precision={2}
              disabled
            />
          </Form.Item>

          <Form.Item label="SGST Amount" name="sgstAmount">
            <InputNumber
              className="w-full"
              style={{ width: "100%" }}
              min={0}
              precision={2}
              disabled
            />
          </Form.Item>

          <Form.Item label="IGST Amount" name="igstAmount">
            <InputNumber
              className="w-full"
              style={{ width: "100%" }}
              min={0}
              precision={2}
              disabled
            />
          </Form.Item> */}

          <Form.Item label="Total Tax Amount" name="totalTaxAmount">
            <InputNumber
              className="w-full"
              style={{ width: "100%" }}
              min={0}
              precision={2}
              disabled
            />
          </Form.Item>

          <Form.Item label="TDS Amount" name="tdsAmount">
            <InputNumber
              className="w-full"
              style={{ width: "100%" }}
              min={0}
              precision={2}
              disabled
            />
          </Form.Item>

          <Form.Item label="Net Payable Amount" name="grandTotal">
            <InputNumber
              className="w-full"
              style={{ width: "100%" }}
              min={0}
              precision={2}
              disabled
            />
          </Form.Item>

          <Form.Item
            label="Payment Type"
            name="paymentTypeName"
            rules={[
              {
                required: true,
                message: "Please select payment type",
              },
            ]}
          >
            <Select
              placeholder="Select payment type"
              options={paymentTypeOptions}
              allowClear
            />
          </Form.Item>

          <Form.Item
            label="Attachments"
            name="attachmentUrls"
            rules={[
              {
                validator: (_, value) => {
                  if (!Array.isArray(value) || value.length === 0) {
                    return Promise.reject(
                      new Error("Please upload at least one attachment"),
                    );
                  }

                  return Promise.resolve();
                },
              },
            ]}
          >
            <FileUploader
              uploadingType="multiple"
              label="Attachment Files"
              placeholder="Drag & drop attachments here, paste, or choose files"
              isRequired
              onUploadingChange={setIsAttachmentUploading}
            />
          </Form.Item>
        </div>

        <Divider />

        <div className="grid grid-cols-1 gap-5">
          <Form.Item
            label="Scope of Work"
            name="scopeOfWork"
            valuePropName="data"
            trigger="onChange"
            rules={[
              {
                validator: (_, value) =>
                  isRichTextEmpty(value)
                    ? Promise.reject(new Error("Please enter scope of work"))
                    : Promise.resolve(),
              },
            ]}
          >
            <NewTextEditor />
          </Form.Item>

          <Form.Item
            label="Terms and Conditions"
            name="termsAndConditions"
            valuePropName="data"
            trigger="onChange"
            rules={[
              {
                validator: (_, value) =>
                  isRichTextEmpty(value)
                    ? Promise.reject(
                        new Error("Please enter terms and conditions"),
                      )
                    : Promise.resolve(),
              },
            ]}
          >
            <NewTextEditor />
          </Form.Item>

          <Form.Item label="Remarks" name="remarks">
            <TextArea
              rows={3}
              placeholder="Enter remarks"
              showCount
              maxLength={1000}
            />
          </Form.Item>
        </div>

        <div className="sticky bottom-0 mt-6 flex justify-end gap-3 border-t bg-white pt-4">
          <Button type="button" onClick={handleCancel}>
            Cancel
          </Button>

          <Button
            type="primary"
            htmlType="submit"
            loading={vendorDetailsLoading === "pending"}
            disabled={vendorDetailsLoading === "pending"}
          >
            Create Purchase Order
          </Button>
        </div>
      </Form>
    </Modal>
  );
};

export default CreatePurchaseOrderModal;
