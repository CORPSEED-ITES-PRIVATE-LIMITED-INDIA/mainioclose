import React, { memo, useEffect, useState } from "react";
import { Button, Form, Input } from "antd";
import { IndianRupee, Percent } from "lucide-react";
import Section from "../../../components/Section";
import FileUploader from "../../../components/FileUploader";

const { TextArea } = Input;

const ServiceFormFieldsDetail = ({ form, serviceFeeList }) => {
  const [isEditing, setIsEditing] = useState(false);

  const getOriginalLineItems = () => {
    if (!Array.isArray(serviceFeeList)) return [];

    return serviceFeeList.map((item) => ({
      sourceItemId: item.id || 0,
      itemName: item.name || "",
      description: item.description || "",
      hsnSacCode: item.hsnSacCode || "",
      quantity: 1,
      unit: "Nos",
      unitPriceExGst: item.baseAmount || 0,
      originalAmount: item.baseAmount || 0,
      gstRate: item.gstPercentage || 0,
      originalGst: item.gstPercentage || 0,
      igstFlag: true,
      categoryCode: item.categoryCode || "",
      feeType: item.feeType || "PROFESSIONAL_FEE",
    }));
  };

  useEffect(() => {
    if (!form) return;

    setIsEditing(false);

    if (Array.isArray(serviceFeeList) && serviceFeeList.length > 0) {
      form.setFieldsValue({
        discountApplied: false,
        discountReason: "",
        discountReasonAttachment: "",
        lineItems: getOriginalLineItems(),
      });
    } else {
      form.setFieldsValue({
        discountApplied: false,
        discountReason: "",
        discountReasonAttachment: "",
        lineItems: [],
      });
    }
  }, [form, serviceFeeList]);

  const handleApplyDiscount = () => {
    setIsEditing(true);

    form.setFieldsValue({
      discountApplied: true,
    });

    form.setFields(
      (form.getFieldValue("lineItems") || []).map((_, index) => ({
        name: ["lineItems", index, "unitPriceExGst"],
        errors: [],
      })),
    );

    setTimeout(() => {
      form.validateFields(["lineItems"]);
    }, 0);
  };

  const handleRemoveDiscount = () => {
    setIsEditing(false);

    form.setFieldsValue({
      discountApplied: false,
      discountReason: "",
      discountReasonAttachment: "",
      lineItems: getOriginalLineItems(),
    });
  };

  return (
    <Section title="Service Pricing Details">
      {Array.isArray(serviceFeeList) && serviceFeeList.length > 0 ? (
        <>
          <div className="flex justify-end mb-3">
            <Button
              type={isEditing ? "default" : "primary"}
              size="small"
              onClick={isEditing ? handleRemoveDiscount : handleApplyDiscount}
            >
              {isEditing ? "Remove Discount" : "Apply Discount"}
            </Button>
          </div>

          {isEditing && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3 items-start">
              <Form.Item
                label="Discount Reason"
                name="discountReason"
                className="mb-0"
                rules={[
                  {
                    required: true,
                    message: "Discount reason is required",
                  },
                ]}
              >
                <TextArea
                  rows={3}
                  placeholder="Enter discount reason"
                  className="!min-h-[76px]"
                  style={{
                    resize: "vertical",
                  }}
                />
              </Form.Item>

              <Form.Item
                label="Discount Reason Attachment"
                name="discountReasonAttachment"
                className="mb-0"
              >
                <FileUploader
                  uploadingType="single"
                  placeholder="Upload discount approval / supporting document"
                />
              </Form.Item>
            </div>
          )}
          {!isEditing && (
            <>
              <Form.Item name="discountReason" hidden>
                <Input />
              </Form.Item>

              <Form.Item name="discountReasonAttachment" hidden>
                <Input />
              </Form.Item>
            </>
          )}

          <Form.Item name="discountApplied" hidden>
            <Input />
          </Form.Item>

          {serviceFeeList.map((item, idx) => {
            const originalAmount = Number(item?.baseAmount || 0);
            const originalGst = Number(item?.gstPercentage || 0);

            return (
              <div
                key={item?.id || idx}
                className="grid grid-cols-4 gap-3 mt-2 mb-1"
              >
                <Form.Item
                  label="Fee name"
                  name={["lineItems", idx, "itemName"]}
                  className="mb-0"
                >
                  <Input readOnly placeholder="Fee name" />
                </Form.Item>

                <Form.Item
                  label="Amount"
                  name={["lineItems", idx, "unitPriceExGst"]}
                  className="mb-0"
                  validateTrigger={["onChange", "onBlur"]}
                  rules={[
                    { required: true, message: "Amount is required" },
                    {
                      validator: (_, value) => {
                        if (
                          value === "" ||
                          value === null ||
                          value === undefined
                        ) {
                          return Promise.resolve();
                        }

                        const enteredAmount = Number(value);

                        if (enteredAmount < 0) {
                          return Promise.reject(
                            new Error("Amount cannot be negative"),
                          );
                        }

                        if (!isEditing && enteredAmount < originalAmount) {
                          return Promise.reject(
                            new Error(
                              `Please click Apply Discount before decreasing below ₹${originalAmount}`,
                            ),
                          );
                        }

                        return Promise.resolve();
                      },
                    },
                  ]}
                >
                  <Input
                    type="number"
                    placeholder="Amount"
                    readOnly={false}
                    prefix={<IndianRupee className="h-4 w-4" />}
                  />
                </Form.Item>

                <Form.Item
                  label="HSN number"
                  name={["lineItems", idx, "hsnSacCode"]}
                  className="mb-0"
                >
                  <Input readOnly placeholder="HSN number" />
                </Form.Item>

                <Form.Item
                  label="GST %"
                  name={["lineItems", idx, "gstRate"]}
                  className="mb-0"
                  validateTrigger={["onChange", "onBlur"]}
                  rules={[
                    { required: true, message: "GST is required" },
                    {
                      validator: (_, value) => {
                        if (
                          value === "" ||
                          value === null ||
                          value === undefined
                        ) {
                          return Promise.resolve();
                        }

                        if (Number(value) < originalGst) {
                          return Promise.reject(
                            new Error(
                              `GST cannot be less than ${originalGst}%`,
                            ),
                          );
                        }

                        return Promise.resolve();
                      },
                    },
                  ]}
                >
                  <Input
                    type="number"
                    placeholder="GST %"
                    readOnly={!isEditing}
                    suffix={<Percent className="h-4 w-4" />}
                  />
                </Form.Item>

                <Form.Item name={["lineItems", idx, "sourceItemId"]} hidden>
                  <Input />
                </Form.Item>

                <Form.Item name={["lineItems", idx, "description"]} hidden>
                  <Input />
                </Form.Item>

                <Form.Item name={["lineItems", idx, "quantity"]} hidden>
                  <Input />
                </Form.Item>

                <Form.Item name={["lineItems", idx, "unit"]} hidden>
                  <Input />
                </Form.Item>

                <Form.Item name={["lineItems", idx, "igstFlag"]} hidden>
                  <Input />
                </Form.Item>

                <Form.Item name={["lineItems", idx, "categoryCode"]} hidden>
                  <Input />
                </Form.Item>

                <Form.Item name={["lineItems", idx, "feeType"]} hidden>
                  <Input />
                </Form.Item>
              </div>
            );
          })}
        </>
      ) : (
        <div>
          <h3 className="text-sm text-red-600">
            Pricing for this service has not been added yet. Please contact the
            administrator to update it.
          </h3>
        </div>
      )}
    </Section>
  );
};

export default memo(ServiceFormFieldsDetail);
