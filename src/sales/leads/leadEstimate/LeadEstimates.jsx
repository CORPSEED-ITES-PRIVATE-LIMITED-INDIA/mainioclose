import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Textarea,
  Button,
  Card,
  CardBody,
  CardHeader,
  DatePicker,
} from "@heroui/react";
import { companyFormSchema } from "./EstimateFormSchema";
import AddressFields from "../../../components/AddressFields";
import Section from "../../../components/Section";
import FormInput from "../../../components/FormInput";
import ProductFormFieldsDetails from "./ProductFormFieldsDetails";
import ServiceFormFieldsDetail from "./ServiceFormFieldsDetail";
import { useEffect } from "react";
import { getAllBusinessArrangementBySolutionId } from "../../../toolkit/slices/productSlice";
import { useParams } from "react-router-dom";

export const LeadEstimates = ({
  productData,
  setValue,
  getValues,
  setProductSubCategoryData,
  setProductSubCategoryFees,
  isMedium,
  calculateTotalPriceWithGST,
  productSubCategoryData,
}) => {
  const { userId } = useParams();
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(companyFormSchema),
    defaultValues: {
      billingAddress: {},
      shippingAddress: {},
    },
  });

  useEffect(() => {
    dispatch(getAllBusinessArrangementBySolutionId({ solutionId: 1, userId }));
  }, []);

  const onSubmit = (data) => {
    console.log("Form Data:", data);
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="w-full max-h-[80vh] overflow-auto space-y-4"
    >
      {/* COMPANY DETAILS */}
      <Card className="shadow-xl">
        <CardHeader className="text-xl font-semibold">
          Company Details
        </CardHeader>
        <CardBody className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <FormInput
              label="Company Name"
              name="companyName"
              control={control}
              error={errors.companyName}
            />
            <FormInput
              label="Unit Name"
              name="unitName"
              control={control}
              error={errors.unitName}
            />
            <FormInput
              label="Email"
              name="email"
              control={control}
              error={errors.email}
            />
            <FormInput
              label="Contact Number"
              name="contactNumber"
              control={control}
              error={errors.contactNumber}
            />
          </div>

          {true ? (
            <ProductFormFieldsDetails
              control={control}
              isMedium={isMedium}
              businessArrangementList={businessArrangementList}
              productCategoryList={productCategoryList}
              productSubcategoryList={productSubcategoryList}
              dispatch={dispatch}
              getValues={getValues}
              setValue={setValue}
              setProductSubCategoryData={setProductSubCategoryData}
              setProductSubCategoryFees={setProductSubCategoryFees}
              productSubCategoryData={productSubCategoryData}
              calculateTotalPriceWithGST={calculateTotalPriceWithGST}
            />
          ) : (
            <ServiceFormFieldsDetail
              control={control}
              isMedium={isMedium}
              productData={productData}
            />
          )}

          {/* BILLING ADDRESS */}
          <Section title="Billing Address">
            <AddressFields
              prefix="billingAddress"
              control={control}
              errors={errors.billingAddress}
            />
          </Section>

          {/* SHIPPING ADDRESS */}
          <Section title="Shipping Address">
            <AddressFields
              prefix="shippingAddress"
              control={control}
              errors={errors.shippingAddress}
            />
          </Section>

          {/* ORDER INFO */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <FormInput
              label="Order Number"
              name="orderNumber"
              control={control}
              error={errors.orderNumber}
            />
            <Controller
              name="date"
              control={control}
              render={({ field }) => (
                <DatePicker
                  label="Order Date"
                  value={field.value}
                  onChange={field.onChange}
                  isInvalid={!!errors.date}
                  errorMessage={errors.date?.message}
                />
              )}
            />
          </div>

          <Controller
            name="remark"
            control={control}
            render={({ field }) => (
              <Textarea label="Remark" {...field} minRows={3} />
            )}
          />
        </CardBody>
      </Card>

      {/* SUBMIT BUTTON */}
      <div className="flex justify-end mt-4">
        <Button
          type="submit"
          color="primary"
          size="lg"
          className="cursor-pointer"
        >
          Submit
        </Button>
      </div>
    </form>
  );
};

export default LeadEstimates;
