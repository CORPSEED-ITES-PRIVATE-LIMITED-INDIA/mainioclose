import React, { memo } from "react";
import { Controller, useFieldArray } from "react-hook-form";
import { Input } from "@heroui/react";
import { IndianRupee, Percent } from "lucide-react";
import Section from "../../../components/Section";

const ServiceFormFieldsDetail = ({ control, isMedium }) => {
  const { fields } = useFieldArray({
    control,
    name: "lineItems",
  });

  return (
    <Section title="Service Pricing Details">
      {fields?.length > 0 ? (
        fields.map((item, idx) => {
          const original = item;

          return (
            <div key={item.id} className="grid grid-cols-4 gap-3 my-2">
              {/* Fee Name */}
              <Controller
                name={`lineItems.${idx}.itemName`}
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    isReadOnly
                    label="Fee name"
                    size={isMedium ? "sm" : "md"}
                  />
                )}
              />

              {/* Amount */}
              <Controller
                name={`lineItems.${idx}.unitPriceExGst`}
                control={control}
                rules={{
                  required: "Amount is required",
                  validate: (value) => {
                    if (value === "" || value === null || value === undefined) {
                      return "Amount is required";
                    }

                    return Number(value) >= Number(original?.originalAmount)
                      ? true
                      : `Amount cannot be less than ₹${original?.originalAmount}`;
                  },
                }}
                render={({ field, fieldState }) => (
                  <Input
                    {...field}
                    value={field.value ?? ""}
                    type="number"
                    label="Amount"
                    isRequired
                    size={isMedium ? "sm" : "md"}
                    startContent={<IndianRupee className="h-4 w-4" />}
                    isInvalid={!!fieldState.error}
                    errorMessage={fieldState.error?.message}
                    onChange={(e) => {
                      field.onChange(e.target.value);
                    }}
                  />
                )}
              />

              {/* HSN */}
              <Controller
                name={`lineItems.${idx}.hsnSacCode`}
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    isReadOnly
                    label="HSN number"
                    isRequired
                    size={isMedium ? "sm" : "md"}
                  />
                )}
              />

              {/* GST */}
              <Controller
                name={`lineItems.${idx}.gstRate`}
                control={control}
                rules={{
                  required: "GST is required",
                  validate: (value) => {
                    if (value === "" || value === null || value === undefined) {
                      return "GST is required";
                    }

                    return Number(value) >= Number(original?.originalGst)
                      ? true
                      : `GST cannot be less than ${original?.originalGst}%`;
                  },
                }}
                render={({ field, fieldState }) => (
                  <Input
                    value={field.value ?? ""}
                    type="number"
                    label="GST %"
                    isRequired
                    size={isMedium ? "sm" : "md"}
                    endContent={<Percent className="h-4 w-4" />}
                    isInvalid={!!fieldState.error}
                    errorMessage={fieldState.error?.message}
                    onChange={(e) => {
                      field.onChange(e.target.value);
                    }}
                  />
                )}
              />
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
