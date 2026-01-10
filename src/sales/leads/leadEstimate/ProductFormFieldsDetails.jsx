import React, { memo } from "react";
import { Controller } from "react-hook-form";
import { Input } from "@heroui/react";
import { IndianRupee, Percent } from "lucide-react";
import NewSelect from "../../../components/NewSelect";
import Section from "../../../components/Section";
import { useSelector } from "react-redux";

const ProductFormFieldsDetails = ({
  control,
  isMedium,
  dispatch,
  getValues,
  setValue,
  setProductSubCategoryData,
  setProductSubCategoryFees,
  productSubCategoryData,
  calculateTotalPriceWithGST,
}) => {
  const businessArrangementList = useSelector(
    (state) => state.product.businessArrangementList
  );
  const productCategoryList = useSelector(
    (state) => state.product.productCategoryList
  );
  const productSubcategoryList = useSelector(
    (state) => state.product.productSubcategoryList
  );

  return (
    <Section title="Product Details">
      {/* Product Selectors */}
      <div className="grid grid-cols-3 gap-2 mt-2">
        <Controller
          name="businessArrangmentId"
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
              valueKey="id"
              value={String(field.value)}
              onChange={(value) => {
                dispatch(getAllProductCategoryById(value));
                field.onChange(value);
              }}
            />
          )}
        />

        <Controller
          name="productCategoryId"
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
              valueKey="id"
              value={String(field.value)}
              onChange={(value) => {
                dispatch(getAllProductSubCategoryListByCategoryId(value));
                field.onChange(value);
              }}
            />
          )}
        />

        <Controller
          name="productSubCategoryId"
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
              valueKey="id"
              value={String(field.value)}
              onChange={(value) => field.onChange(value)}
              onItemSelect={(item) => {
                const currentValues = getValues();
                setProductSubCategoryData(item);
                reset({
                  ...currentValues,
                  actualPrice: String(item?.productFees),
                  gstCode: item?.productCode,
                  gst: item?.productGst,
                });
                setProductSubCategoryFees((prev) => ({
                  ...prev,
                  actualPrice: String(item?.productFees),
                  gst: item?.productGst,
                  roundOff: item?.roundValue,
                }));
              }}
            />
          )}
        />
      </div>

      {/* Product Pricing */}
      {Object.keys(productSubCategoryData || {})?.length > 0 && (
        <div className="grid grid-cols-4 gap-2 mt-2">
          {/* Actual Price */}
          <Controller
            name="actualPrice"
            control={control}
            render={({ field }) => (
              <Input
                size={isMedium ? "sm" : "md"}
                type="number"
                startContent={<IndianRupee className="h-4 w-4" />}
                isRequired
                label="Actual price"
                {...field}
                onChange={(e) => {
                  field.onChange(e.target.value);
                  const { quantity, gst } = getValues();
                  setValue(
                    "totalPrice",
                    String(
                      calculateTotalPriceWithGST(e.target.value, quantity, gst)
                    )
                  );
                }}
              />
            )}
          />

          {/* HSN */}
          <Controller
            name="gstCode"
            control={control}
            render={({ field }) => (
              <Input
                size={isMedium ? "sm" : "md"}
                isRequired
                label="HSN code"
                {...field}
              />
            )}
          />

          {/* GST % */}
          <Controller
            name="gst"
            control={control}
            render={({ field }) => (
              <Input
                size={isMedium ? "sm" : "md"}
                isRequired
                label="GST %"
                endContent={<Percent className="h-4 w-4" />}
                {...field}
                onChange={(e) => {
                  const { actualPrice, quantity } = getValues();
                  setValue(
                    "totalPrice",
                    String(
                      calculateTotalPriceWithGST(
                        actualPrice,
                        quantity,
                        e.target.value
                      )
                    )
                  );
                  field.onChange(e.target.value);
                }}
              />
            )}
          />

          {/* Quantity */}
          <Controller
            name="quantity"
            control={control}
            render={({ field }) => (
              <Input
                size={isMedium ? "sm" : "md"}
                isRequired
                type="number"
                label="Quantity in kg"
                {...field}
                onChange={(e) => {
                  const { actualPrice, gst } = getValues();
                  field.onChange(e.target.value);
                  setValue(
                    "totalPrice",
                    String(
                      calculateTotalPriceWithGST(
                        actualPrice,
                        e.target.value,
                        gst
                      )
                    )
                  );
                }}
              />
            )}
          />

          {/* Total Price */}
          <Controller
            name="totalPrice"
            control={control}
            render={({ field }) => (
              <Input
                size={isMedium ? "sm" : "md"}
                isRequired
                label="Total price (₹)"
                type="number"
                isDisabled
                startContent={<IndianRupee className="h-4 w-4" />}
                {...field}
              />
            )}
          />
        </div>
      )}
    </Section>
  );
};

export default memo(ProductFormFieldsDetails);
