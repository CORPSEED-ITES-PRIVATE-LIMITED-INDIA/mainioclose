import React, { memo } from "react";
import { Controller } from "react-hook-form";
import { Input } from "@heroui/react";
import { IndianRupee } from "lucide-react";
import Section from "../../../components/Section";

const ServiceFormFieldsDetail = ({ control, isMedium, productData }) => {
  return (
    <Section title="Service Details">
      {productData?.productAmount?.map((ele, idx) => {
        const name = ele?.name;
        return (
          <div key={idx} className="grid grid-cols-3 gap-3 my-2">
            <Controller
              name={
                name === "Professional fees"
                  ? "professionalFees"
                  : name === "Service charges"
                  ? "serviceCharge"
                  : name === "Government"
                  ? "govermentfees"
                  : "otherFees"
              }
              control={control}
              render={({ field }) => (
                <Input
                  size={isMedium ? "sm" : "md"}
                  type="number"
                  isRequired
                  label={name}
                  startContent={<IndianRupee className="h-4 w-4" />}
                  {...field}
                />
              )}
            />

            <Controller
              name={
                name === "Professional fees"
                  ? "professionalCode"
                  : name === "Service charges"
                  ? "serviceCode"
                  : name === "Government"
                  ? "govermentCode"
                  : "otherCode"
              }
              control={control}
              render={({ field }) => <Input size={isMedium ? "sm" : "md"} isRequired label="HSN number" {...field} />}
            />

            <Controller
              name={
                name === "Professional fees"
                  ? "profesionalGst"
                  : name === "Service charges"
                  ? "serviceGst"
                  : name === "Government"
                  ? "govermentGst"
                  : "otherGst"
              }
              control={control}
              render={({ field }) => (
                <Input
                  size={isMedium ? "sm" : "md"}
                  type="number"
                  isRequired
                  label={`${name} GST`}
                  startContent={<IndianRupee className="h-4 w-4" />}
                  isDisabled={false}
                  {...field}
                />
              )}
            />
          </div>
        );
      })}
    </Section>
  );
};

export default memo(ServiceFormFieldsDetail);

