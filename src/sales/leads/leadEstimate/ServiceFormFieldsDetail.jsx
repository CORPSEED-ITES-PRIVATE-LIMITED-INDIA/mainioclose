import React, { memo } from "react";
import { Controller, useFieldArray } from "react-hook-form";
import { Input } from "@heroui/react";
import { IndianRupee, Percent } from "lucide-react";
import Section from "../../../components/Section";

const ServiceFormFieldsDetail = ({ control, isMedium, getValues }) => {
  const { fields } = useFieldArray({
    control,
    name: "lineItems",
  });

  return (
    <Section title="Service Details">
      {fields?.length > 0 ? (
        fields.map((field, idx) => {
          // 🔥 Get original API values
          const original = field;

          return (
            <div key={field.id} className="grid grid-cols-4 gap-3 my-2">
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
                  validate: (value) =>
                    Number(value) >= Number(original?.originalAmount)
                      ? true
                      : `Amount cannot be less than ₹${original?.originalAmount}`,
                }}
                render={({ field, fieldState }) => (
                  <Input
                    {...field}
                    type="number"
                    label="Amount"
                    isRequired
                    size={isMedium ? "sm" : "md"}
                    startContent={<IndianRupee className="h-4 w-4" />}
                    min={original?.originalAmount}
                    isInvalid={!!fieldState.error}
                    errorMessage={fieldState.error?.message}
                    onChange={(e) => {
                      const value = Number(e.target.value || 0);

                      if (value < Number(original?.originalAmount)) return;

                      field.onChange(value);
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
                  validate: (value) =>
                    Number(value) >= Number(original?.originalGst)
                      ? true
                      : ` GST cannot be less than ${original?.originalGst}%`,
                }}
                render={({ field, fieldState }) => (
                  <Input
                    {...field}
                    type="number"
                    label="GST %"
                    isRequired
                    size={isMedium ? "sm" : "md"}
                    endContent={<Percent className="h-4 w-4" />}
                    min={original?.originalGst}
                    isInvalid={!!fieldState.error}
                    errorMessage={fieldState.error?.message}
                    onChange={(e) => {
                      const value = Number(e.target.value || 0);

                      if (value < Number(original?.originalGst)) return;

                      field.onChange(value);
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
            Please select solution for the service detail
          </h3>
        </div>
      )}
    </Section>
  );
};

export default memo(ServiceFormFieldsDetail);
