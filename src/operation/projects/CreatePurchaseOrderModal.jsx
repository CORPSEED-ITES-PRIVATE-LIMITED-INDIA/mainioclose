import React, { useEffect } from "react";
import {
  Button,
  Divider,
  Form,
  Input,
  InputNumber,
  notification,
  Modal,
  Select,
} from "antd";
import { useDispatch } from "react-redux";
import { addToast } from "@heroui/react";
import { createProcurementPurchaseOrder } from "../../toolkit/slices/operationSlice";
import NewTextEditor from "../../components/NewTextEditor";

const { TextArea } = Input;

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

const paymentTermsOptions = [
  { label: "NET-0 (Immediate)", value: 0 },
  { label: "NET-7", value: 7 },
  { label: "NET-15", value: 15 },
  { label: "NET-30", value: 30 },
  { label: "NET-45", value: 45 },
  { label: "NET-60", value: 60 },
  { label: "NET-90", value: 90 },
];

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
  const [api, contextHolder] = notification.useNotification();

  useEffect(() => {
    if (!open) return;

    form.setFieldsValue({
      procurementAssignmentId: Number(procurementAssignmentId || 0),
      vendorId: Number(vendorId || 0),
      poReferenceNumber: "",
      finalAmount: Number(defaultEstimatedAmount || 0),
      paymentTerms: 30,
      scopeOfWork: "<p></p>",
      termsAndConditions: "<p></p>",
      remarks: "",
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

  const handleCancel = () => {
    form.resetFields();
    onClose?.();
  };

  const handleSubmit = async (values) => {
    const finalAmount = roundAmount(values.finalAmount);

    const payload = {
      procurementAssignmentId: Number(procurementAssignmentId || 0),
      vendorId: Number(vendorId || 0),

      poReferenceNumber: values.poReferenceNumber?.trim() || "",

      finalAmount,

      paymentTerms: Number(values.paymentTerms),

      /*
       * Tax and TDS are captured here as rates only.
       * Actual tax/TDS amounts, payment type and attachments are supplied
       * while raising the procurement payment request.
       */
      gstRate: 0,
      tdsPercentage: 0,

      placeOfSupplyStateCode: "",

      scopeOfWork: values.scopeOfWork?.trim() || "",
      termsAndConditions: values.termsAndConditions?.trim() || "",
      remarks: values.remarks?.trim() || "",

      attachmentUrls: [],
      paymentTypeName: "",

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
      api.error({
        title: "Something went wrong",
        description:
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
      centered
      onCancel={handleCancel}
      width={1050}
      destroyOnClose
      maskClosable={false}
      footer={null}
    >
      {contextHolder}
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        autoComplete="off"
        size="large"
        className="max-h-[80vh] overflow-y-auto pr-2"
      >
        <div className="grid grid-cols-1 gap-x-5 md:grid-cols-2">
          <Form.Item
            label="Vendor Quotation Number"
            name="poReferenceNumber"
            rules={[
              {
                required: true,
                message: "Please enter vendor quotation number",
              },
            ]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label="Amount"
            name="finalAmount"
            rules={[
              {
                required: true,
                message: "Please enter final amount",
              },
              {
                validator: (_, value) => {
                  if (value === null || value === undefined || value === "") {
                    return Promise.resolve();
                  }

                  if (Number(value) < 0) {
                    return Promise.reject(
                      new Error("Final amount cannot be negative"),
                    );
                  }

                  return Promise.resolve();
                },
              },
            ]}
          >
            <InputNumber
              controls={false}
              className="w-full"
              style={{ width: "100%" }}
              min={0}
              precision={2}
              placeholder="Enter final amount"
            />
          </Form.Item>

          <Form.Item
            label="Payment Terms"
            name="paymentTerms"
            rules={[
              {
                required: true,
                message: "Please select payment terms",
              },
            ]}
          >
            <Select
              placeholder="Select payment terms"
              options={paymentTermsOptions}
            />
          </Form.Item>
        </div>

        <Form.Item label="Remarks" name="remarks">
          <TextArea
            rows={3}
            placeholder="Enter remarks"
            showCount
            maxLength={1000}
          />
        </Form.Item>

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
