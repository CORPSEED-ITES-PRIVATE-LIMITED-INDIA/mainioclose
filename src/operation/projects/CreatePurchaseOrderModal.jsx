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
  Space,
} from "antd";
import { PlusOutlined, DeleteOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import { useDispatch, useSelector } from "react-redux";
import { addToast } from "@heroui/react";
import { createProcurementPurchaseOrder } from "../../toolkit/slices/operationSlice";
import FileUploader from "../../components/FileUploader";
import NewTextEditor from "../../components/NewTextEditor";
import { getAllPaymentType } from "../../toolkit/slices/settingSlice";

const { TextArea } = Input;

const paymentTermOptions = [
  { label: "100% Advance", value: "100% Advance" },
  {
    label: "50% Advance + 50% After Completion",
    value: "50% Advance + 50% After Completion",
  },
  {
    label: "30% Advance + 70% After Completion",
    value: "30% Advance + 70% After Completion",
  },
  { label: "Milestone Based Payment", value: "Milestone Based Payment" },
  {
    label: "Payment After Work Completion",
    value: "Payment After Work Completion",
  },
];

const taxTypeOptions = [
  { label: "CGST + SGST", value: "CGST_SGST" },
  { label: "IGST", value: "IGST" },
];

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

  const watchedFinalAmount = Form.useWatch("finalAmount", form);
  const watchedGstRate = Form.useWatch("gstRate", form);
  const watchedTdsPercentage = Form.useWatch("tdsPercentage", form);
  const watchedTaxType = Form.useWatch("taxType", form);
  const [isAttachmentUploading, setIsAttachmentUploading] =
    React.useState(false);

  const taxCalculation = useMemo(() => {
    const finalAmount = Number(watchedFinalAmount || 0);
    const gstRate = Number(watchedGstRate || 0);
    const tdsPercentage = Number(watchedTdsPercentage || 0);
    const taxType = watchedTaxType || "CGST_SGST";

    /*
     * Existing GST calculation remains unchanged.
     */
    const totalTaxAmount = roundAmount((finalAmount * gstRate) / 100);

    let cgstAmount = 0;
    let sgstAmount = 0;
    let igstAmount = 0;

    if (taxType === "IGST") {
      igstAmount = totalTaxAmount;
    } else {
      cgstAmount = roundAmount(totalTaxAmount / 2);

      /*
       * Subtraction avoids any one-paise rounding mismatch.
       */
      sgstAmount = roundAmount(totalTaxAmount - cgstAmount);
    }

    /*
     * TDS is calculated on Final Amount.
     */
    const tdsAmount = roundAmount((finalAmount * tdsPercentage) / 100);

    /*
     * Grand Total = Final Amount + GST - TDS
     */
    const grandTotal = roundAmount(finalAmount + totalTaxAmount - tdsAmount);

    return {
      cgstAmount,
      sgstAmount,
      igstAmount,
      totalTaxAmount,
      tdsAmount,
      grandTotal,
    };
  }, [
    watchedFinalAmount,
    watchedGstRate,
    watchedTdsPercentage,
    watchedTaxType,
  ]);

  useEffect(() => {
    if (!open) return;

    form.setFieldsValue({
      procurementAssignmentId: Number(procurementAssignmentId || 0),
      vendorId: Number(vendorId || 0),
      poReferenceNumber: "",
      finalAmount: Number(defaultEstimatedAmount || 0),
      gstRate: 18,
      tdsPercentage: 0,
      tdsAmount: 0,
      taxType: "CGST_SGST",
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

    const payload = {
      procurementAssignmentId: Number(procurementAssignmentId || 0),
      vendorId: Number(vendorId || 0),

      poReferenceNumber: values.poReferenceNumber?.trim() || "",

      finalAmount: Number(values.finalAmount || 0),
      gstRate: Number(values.gstRate || 0),

      tdsPercentage: Number(values.tdsPercentage || 0),
      tdsAmount: Number(values.tdsAmount || 0),

      cgstAmount: Number(values.cgstAmount || 0),
      sgstAmount: Number(values.sgstAmount || 0),
      igstAmount: Number(values.igstAmount || 0),

      totalTaxAmount: Number(values.totalTaxAmount || 0),
      grandTotal: Number(values.grandTotal || 0),

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
            label="Final Amount"
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
            rules={[
              {
                required: true,
                message: "Please enter GST rate",
              },
            ]}
          >
            <InputNumber
              style={{ width: "100%" }}
              className="w-full"
              min={0}
              max={100}
              precision={2}
              placeholder="Enter GST rate"
            />
          </Form.Item>

          <Form.Item
            label="TDS Percentage (%)"
            name="tdsPercentage"
            rules={[
              {
                required: true,
                message: "Please enter TDS percentage",
              },
              {
                validator: (_, value) => {
                  const percentage = Number(value);

                  if (value === null || value === undefined || value === "") {
                    return Promise.resolve();
                  }

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
          >
            <InputNumber
              className="w-full"
              style={{ width: "100%" }}
              min={0}
              max={100}
              precision={2}
              placeholder="Enter TDS percentage"
              addonAfter="%"
            />
          </Form.Item>

          <Form.Item
            label="Tax Type"
            name="taxType"
            rules={[{ required: true, message: "Please select tax type" }]}
          >
            <Select placeholder="Select tax type" options={taxTypeOptions} />
          </Form.Item>

          <Form.Item label="CGST Amount" name="cgstAmount">
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
          </Form.Item>

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

          <Form.Item label="Grand Total" name="grandTotal">
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

          <Button type="primary" htmlType="submit">
            Create Purchase Order
          </Button>
        </div>
      </Form>
    </Modal>
  );
};

export default CreatePurchaseOrderModal;
