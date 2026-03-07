import React, { memo, useEffect, useState } from "react";
import { Controller } from "react-hook-form";
import { Input } from "@heroui/react";
import { IndianRupee, Percent } from "lucide-react";
import NewSelect from "../../../components/NewSelect";
import Section from "../../../components/Section";
import { useDispatch, useSelector } from "react-redux";
import {
  getAllProductCategoryById,
  getAllProductSubCategoryListByCategoryId,
} from "../../../toolkit/slices/productSlice";
import { useParams } from "react-router-dom";

const ProductFormFieldsDetails = ({
  control,
  isMedium,
  getValues,
  reset,
  setValue,
}) => {
  const { userId } = useParams();
  const dispatch = useDispatch();

  const solutionDetail = useSelector(
    (state) => state.setting.solutionDetailById,
  );
  const businessArrangementList = useSelector(
    (state) => state.product.businessArrangementList,
  );
  const productCategoryList = useSelector(
    (state) => state.product.productCategoryList,
  );
  const productSubcategoryList = useSelector(
    (state) => state.product.productSubcategoryList,
  );

  const [productPrices, setProductPrices] = useState(null);

  // Ensure lineItems[0] exists for product flow
  useEffect(() => {
    const values = getValues();
    if (!values?.lineItems?.length) {
      reset({
        ...values,
        lineItems: [
          {
            itemName: "",
            unitPriceExGst: "",
            hsnSacCode: "",
            gstRate: "",
            quantity: 1,
            categoryCode: "",
            feeType: "",
          },
        ],
      });
    }
  }, [getValues, reset]);

  const handleSetProductPrices = (item) => {
    setProductPrices(item);

    const values = getValues();
    const existing = values?.lineItems?.[0] || {};

    reset({
      ...values,
      lineItems: [
        {
          ...existing, // ✅ keeps categoryCode, feeType, etc
          itemName: item?.name || existing.itemName || "",
          unitPriceExGst: item?.feePerUnit ?? "",
          hsnSacCode: item?.code ?? "",
          gstRate: item?.gstPercentage ?? "",
          quantity: existing?.quantity ?? 1,
        },
        ...(values?.lineItems?.slice(1) || []),
      ],
    });
  };

  return (
    <Section title="Product Details">
      {/* Product Selectors */}
      <div className="grid grid-cols-3 gap-2 mt-2">
        <Controller
          name="lineItems.0.categoryCode"
          control={control}
          render={({ field, fieldState: { error } }) => (
            <NewSelect
              size={isMedium ? "sm" : "md"}
              isRequired
              label="Select business arrangement"
              errorMessage={error?.message}
              isInvalid={!!error}
              data={businessArrangementList || []}
              labelKey="name"
              valueKey="name"
              value={String(field.value || "")}
              onChange={(value) => {
                field.onChange(value);
              }}
              onItemSelect={(item) => {
                dispatch(
                  getAllProductCategoryById({
                    userId,
                    tierId: item?.id,
                    solutionId: solutionDetail?.id,
                  }),
                );
              }}
            />
          )}
        />

        <Controller
          name="lineItems.0.feeType"
          control={control}
          render={({ field, fieldState: { error } }) => (
            <NewSelect
              size={isMedium ? "sm" : "md"}
              isRequired
              label="Select product category"
              errorMessage={error?.message}
              isInvalid={!!error}
              data={productCategoryList || []}
              labelKey="name"
              valueKey="name"
              value={String(field.value || "")}
              onChange={(value) => {
                field.onChange(value);
              }}
              onItemSelect={(item) => {
                dispatch(
                  getAllProductSubCategoryListByCategoryId({
                    productRoleId: item?.id,
                    userId,
                  }),
                );
              }}
            />
          )}
        />

        <Controller
          name="lineItems.0.itemName"
          control={control}
          render={({ field, fieldState: { error } }) => (
            <NewSelect
              size={isMedium ? "sm" : "md"}
              isRequired
              label="Select product subcategory"
              errorMessage={error?.message}
              isInvalid={!!error}
              data={productSubcategoryList || []}
              labelKey="name"
              valueKey="name"
              value={String(field.value || "")}
              onChange={(value) => {
                field.onChange(value);
              }}
              onItemSelect={(item) => {
                handleSetProductPrices(item);
              }}
            />
          )}
        />
      </div>

      {/* Product Pricing (lineItems[0]) */}
      {productPrices && (
        <div className="grid grid-cols-5 gap-2 mt-2">
          {/* Item Name */}
          <Controller
            name={`lineItems.0.itemName`}
            control={control}
            render={({ field }) => (
              <Input
                {...field}
                size={isMedium ? "sm" : "md"}
                label="Item name"
                isReadOnly
              />
            )}
          />

          {/* Actual Price */}
          <Controller
            name={`lineItems.0.unitPriceExGst`}
            control={control}
            rules={{
              validate: (value) =>
                Number(value) >= Number(productPrices?.feePerUnit) ||
                `Price cannot be less than ₹${productPrices?.feePerUnit}`,
            }}
            render={({ field, fieldState }) => (
              <Input
                {...field}
                size={isMedium ? "sm" : "md"}
                type="number"
                label="Actual price"
                startContent={<IndianRupee className="h-4 w-4" />}
                min={productPrices?.feePerUnit}
                isRequired
                isInvalid={!!fieldState.error}
                errorMessage={fieldState.error?.message}
                onChange={(e) => field.onChange(Number(e.target.value))}
              />
            )}
          />

          {/* HSN */}
          <Controller
            name={`lineItems.0.hsnSacCode`}
            control={control}
            render={({ field }) => (
              <Input
                {...field}
                size={isMedium ? "sm" : "md"}
                isRequired
                isReadOnly
                label="HSN code"
              />
            )}
          />

          {/* GST % */}
          <Controller
            name={`lineItems.0.gstRate`}
            control={control}
            rules={{
              validate: (value) =>
                Number(value) >= Number(productPrices?.gstPercentage) ||
                `GST cannot be less than ${productPrices?.gstPercentage}%`,
            }}
            render={({ field, fieldState }) => (
              <Input
                {...field}
                size={isMedium ? "sm" : "md"}
                type="number"
                label="GST %"
                endContent={<Percent className="h-4 w-4" />}
                min={productPrices?.gstPercentage}
                isRequired
                isInvalid={!!fieldState.error}
                errorMessage={fieldState.error?.message}
                onChange={(e) => field.onChange(Number(e.target.value))}
              />
            )}
          />

          {/* Quantity */}
          <Controller
            name={`lineItems.0.quantity`}
            control={control}
            render={({ field }) => (
              <Input
                {...field}
                size={isMedium ? "sm" : "md"}
                isRequired
                type="number"
                label="Quantity in kg"
                onChange={(e) => {
                  field.onChange(e.target.value);
                }}
              />
            )}
          />
        </div>
      )}
    </Section>
  );
};

export default memo(ProductFormFieldsDetails);
