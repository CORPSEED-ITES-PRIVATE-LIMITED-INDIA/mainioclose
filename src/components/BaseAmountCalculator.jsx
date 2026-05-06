import React, { useState } from "react";
import { Button, Modal, Form, InputNumber, Select } from "antd";
import { CalculatorOutlined } from "@ant-design/icons";
import { allowOnlyNumbers } from "../common";

const gstOptions = [
  { label: "2%", value: 2 },
  { label: "10%", value: 10 },
  { label: "18%", value: 18 },
];

const BaseAmountCalculator = ({
  buttonText = "Calculate Base Amount",
  modalTitle = "Calculate Base Amount",
  onBaseAmountCalculated,
}) => {
  const [open, setOpen] = useState(false);
  const [form] = Form.useForm();

  const calculateBaseAmount = (amount, gstPercentage) => {
    const totalAmount = Number(amount || 0);
    const gst = Number(gstPercentage || 18);

    if (!totalAmount || totalAmount <= 0) {
      return null;
    }

    return Number((totalAmount / (1 + gst / 100)).toFixed(2));
  };

  const handleValuesChange = (_, allValues) => {
    const baseAmount = calculateBaseAmount(
      allValues.amount,
      allValues.gstPercentage,
    );

    form.setFieldsValue({
      baseAmount,
    });
  };

  const handleOpen = () => {
    form.setFieldsValue({
      amount: undefined,
      gstPercentage: 18,
      baseAmount: undefined,
    });

    setOpen(true);
  };

  const handleCancel = () => {
    setOpen(false);
    form.resetFields();
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();

      const baseAmount = calculateBaseAmount(
        values.amount,
        values.gstPercentage,
      );

      const finalData = {
        amount: Number(values.amount),
        gstPercentage: Number(values.gstPercentage),
        baseAmount,
      };

      form.setFieldsValue({
        baseAmount,
      });

      onBaseAmountCalculated?.(finalData);
    } catch (error) {
      // AntD will show validation errors
    }
  };

  return (
    <>
      <Button type="primary" icon={<CalculatorOutlined />} onClick={handleOpen}>
        {buttonText}
      </Button>

      <Modal
        title={modalTitle}
        open={open}
        onCancel={handleCancel}
        destroyOnClose
        getContainer={false}
        mask={false}
        footer={[
          <Button key="cancel" onClick={handleCancel}>
            Cancel
          </Button>,
          <Button key="calculate" type="primary" onClick={handleSubmit}>
            Calculate
          </Button>,
        ]}
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={{
            gstPercentage: 18,
          }}
          onValuesChange={handleValuesChange}
        >
          <Form.Item
            label="Amount"
            name="amount"
            rules={[
              {
                required: true,
                message: "Please enter amount",
              },
            ]}
          >
            <InputNumber
              style={{ width: "100%" }}
              placeholder="Enter GST inclusive amount"
              min={0}
              precision={2}
              controls={false}
              keyboard
              stringMode={false}
              parser={(value) => {
                return value?.replace(/[^\d.]/g, "") || "";
              }}
              formatter={(value) => {
                return `${value}`.replace(/[^\d.]/g, "");
              }}
              onKeyDown={(e) => {
                const allowedKeys = [
                  "Backspace",
                  "Delete",
                  "Tab",
                  "ArrowLeft",
                  "ArrowRight",
                  "Home",
                  "End",
                ];

                const isNumber = /^[0-9]$/.test(e.key);
                const isDecimal = e.key === ".";

                if (allowedKeys.includes(e.key)) {
                  return;
                }

                if (isDecimal) {
                  const currentValue = String(e.currentTarget.value || "");

                  if (currentValue.includes(".")) {
                    e.preventDefault();
                  }

                  return;
                }

                if (!isNumber) {
                  e.preventDefault();
                }
              }}
              onPaste={(e) => {
                const pastedValue = e.clipboardData.getData("text");

                if (!/^\d*\.?\d*$/.test(pastedValue)) {
                  e.preventDefault();
                }
              }}
            />
          </Form.Item>

          <Form.Item
            label="GST Percentage"
            name="gstPercentage"
            rules={[
              {
                required: true,
                message: "Please select GST percentage",
              },
            ]}
          >
            <Select
              placeholder="Select GST"
              options={gstOptions}
              getPopupContainer={(triggerNode) => triggerNode.parentElement}
            />
          </Form.Item>

          <Form.Item label="Base Amount" name="baseAmount">
            <InputNumber
              style={{ width: "100%" }}
              precision={2}
              controls={false}
              readOnly
              placeholder="Base amount will be calculated"
            />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default BaseAmountCalculator;
