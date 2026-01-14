import React, { memo } from "react";
import { Controller, useFieldArray } from "react-hook-form";
import { Input } from "@heroui/react";
import { IndianRupee } from "lucide-react";
import Section from "../../../components/Section";

const ServiceFormFieldsDetail = ({ control, isMedium }) => {

  const { fields } = useFieldArray({
    control,
    name: "lineItems"
  });

  return (
    <Section title="Service Details">
      {fields.map((field, idx) => (
        <div key={field.id} className="grid grid-cols-4 gap-3 my-2">

          {/* Fee Name (Read-Only) */}
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
            render={({ field }) => (
              <Input
                {...field}
                type="number"
                label="Amount"
                isRequired
                size={isMedium ? "sm" : "md"}
                startContent={<IndianRupee className="h-4 w-4" />}
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
            render={({ field }) => (
              <Input
                {...field}
                type="number"
                label={"GST %"}
                isRequired
                size={isMedium ? "sm" : "md"}
              />
            )}
          />

        </div>
      ))}
    </Section>
  );
};

export default memo(ServiceFormFieldsDetail);
