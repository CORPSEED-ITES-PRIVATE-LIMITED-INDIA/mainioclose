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
          itemName: item.name,
          unitPriceExGst: item.baseAmount,
          originalAmount: item.baseAmount,
          hsnSacCode: item.hsnSacCode,
          gstRate: item.gstPercentage,
          originalGst: item.gstPercentage,
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
        serviceFeeList?.map((item, idx) => {
          const original = form.getFieldValue(["lineItems", idx]) || {};

          return (
            <div key={item?.id || idx} className="grid grid-cols-4 gap-3 my-2">
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
                validateFirst
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

                      if (Number(value) < Number(original?.originalAmount)) {
                        return Promise.reject(
                          new Error(
                            `Amount cannot be less than ₹${original?.originalAmount}`,
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
                validateFirst
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

                      if (Number(value) < Number(original?.originalGst)) {
                        return Promise.reject(
                          new Error(
                            `GST cannot be less than ${original?.originalGst}%`,
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
                  suffix={<Percent className="h-4 w-4" />}
                />
              </Form.Item>

              {/* <Form.Item name={["lineItems", idx, "originalAmount"]} hidden>
                <Input />
              </Form.Item>

              <Form.Item name={["lineItems", idx, "originalGst"]} hidden>
                <Input />
              </Form.Item> */}
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
