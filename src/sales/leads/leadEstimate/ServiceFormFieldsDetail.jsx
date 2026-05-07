import React, { memo, useEffect } from "react";
import { Form, Input } from "antd";
import { IndianRupee, Percent } from "lucide-react";
import Section from "../../../components/Section";

const ServiceFormFieldsDetail = ({ form, serviceFeeList }) => {
  useEffect(() => {
    if (!form) return;

    if (Array.isArray(serviceFeeList) && serviceFeeList.length > 0) {
      form.setFieldsValue({
        lineItems: serviceFeeList.map((item) => ({
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
        })),
      });
    } else {
      form.setFieldsValue({
        lineItems: [],
      });
    }
  }, [form, serviceFeeList]);

  return (
    <Section title="Service Pricing Details">
      {Array.isArray(serviceFeeList) && serviceFeeList.length > 0 ? (
        serviceFeeList.map((item, idx) => {
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
                <Input placeholder="Fee name" />
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

                      if (Number(value) < originalAmount) {
                        return Promise.reject(
                          new Error(
                            `Amount cannot be less than ₹${originalAmount}`,
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
                          new Error(`GST cannot be less than ${originalGst}%`),
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
        })
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
