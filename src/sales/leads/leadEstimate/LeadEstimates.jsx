import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Textarea,
  Button,
  Card,
  CardBody,
  CardHeader,
  DatePicker,
  addToast,
} from "@heroui/react";
import { estimateFormSchema } from "./EstimateFormSchema";
import FormInput from "../../../components/FormInput";
import ProductFormFieldsDetails from "./ProductFormFieldsDetails";
import ServiceFormFieldsDetail from "./ServiceFormFieldsDetail";
import { useEffect } from "react";
import { getAllBusinessArrangementBySolutionId } from "../../../toolkit/slices/productSlice";
import { useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  getSolutionDetailByName,
  getSolutionPriceListById,
} from "../../../toolkit/slices/settingSlice";
import {
  createNewEstimate,
  getNewEstimateByLeadId,
  getSingleLeadDataByLeadId,
} from "../../../toolkit/slices/leadSlice";
import FormSelect from "../../../components/FormSelect";
import { getBasicCompanyDetails } from "../../../toolkit/slices/companySlice";
import { useMediaQuery } from "react-responsive";
import { getAllCountries } from "../../../toolkit/slices/commonSlice";
import {
  getLocalTimeZone,
  parseDate,
  toCalendarDate,
  today,
} from "@internationalized/date";
import NewEstimatePreview from "./NewEstimatePreview";

export const LeadEstimates = () => {
  const { userId, leadId } = useParams();
  const isMedium = useMediaQuery({ minWidth: 768, maxWidth: 1535 });
  const dispatch = useDispatch();
  const company = useSelector((state) => state.company.basicCompanyDetail);
  const solutionDetail = useSelector(
    (state) => state.setting.solutionDetailById
  );
  const serviceFeeList = useSelector(
    (state) => state.setting.solutionPriceList
  );

  const newEstimateDetail = useSelector(
    (state) => state.leads.newEstimateByLeadId
  );

  const {
    control,
    handleSubmit,
    formState: { errors },
    getValues,
    reset,
    setValue,
  } = useForm({
    resolver: zodResolver(estimateFormSchema),
    defaultValues: {
      billingAddress: {},
      shippingAddress: {},
      lineItems: [],
    },
  });

  useEffect(() => {
    if (serviceFeeList?.length) {
      let values = getValues();
      reset({
        ...values,
        lineItems: serviceFeeList.map((item) => ({
          itemName: item.name,
          unitPriceExGst: item?.baseAmount,
          hsnSacCode: item?.hsnSacCode,
          gstRate: item?.gstPercentage,
        })),
      });
    }
  }, [serviceFeeList, reset]);

  useEffect(() => {
    dispatch(getSingleLeadDataByLeadId({ leadId, userId })).then((resp) => {
      if (resp.meta.requestStatus === "fulfilled") {
        if (resp?.payload?.originalName) {
          dispatch(
            getSolutionDetailByName({
              name: resp?.payload?.originalName,
              userId,
            })
          ).then((res) => {
            if (res.meta.requestStatus === "fulfilled") {
              if (res.payload?.type === "SERVICE") {
                dispatch(
                  getSolutionPriceListById({
                    solutionId: res?.payload?.id,
                    userId,
                  })
                );
              } else {
                dispatch(
                  getAllBusinessArrangementBySolutionId({
                    solutionId: res?.payload?.id,
                    userId,
                  })
                );
              }
            }
          });
        }
      }
    });
  }, [dispatch]);

  useEffect(() => {
    dispatch(getBasicCompanyDetails({ leadId, userId })).then((resp) => {
      if (resp.meta.requestStatus === "fulfilled") {
        setValue("companyName", resp?.payload?.name);
      }
    });
    dispatch(getAllCountries());
  }, [dispatch]);

  useEffect(() => {
    dispatch(getNewEstimateByLeadId({ leadId, userId }));
  }, [dispatch]);

  const onSubmit = (data) => {
    data.companyId = company?.id;
    data.solutionName = solutionDetail?.name;
    data.solutionType = solutionDetail?.type;
    data.sourceSolutionIds = solutionDetail?.id;
    data.createdByUserId = userId;
    dispatch(createNewEstimate(data))
      .then((res) => {
        console.log("dsjkgskjgjks", res);
        if (res.meta.requestStatus === "fulfilled") {
          addToast({
            title: "Estimate created successfully !.",
            color: "success",
          });
        } else {
          addToast({ title: res?.payload?.data?.message, color: "danger" });
        }
      })
      .catch(() =>
        addToast({ title: "Something went wrong !.", color: "danger" })
      );
  };

  return (
    <>
      {Object.keys(newEstimateDetail)?.length > 0 ? (
        <NewEstimatePreview details={newEstimateDetail} />
      ) : (
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
                  readOnly
                  control={control}
                  error={errors.companyName}
                />
                <FormSelect
                  label="Unit Name"
                  name="unitId"
                  control={control}
                  error={errors.unitName}
                  data={company?.units?.map((item) => ({
                    label: item?.unitName,
                    value: item?.id,
                  }))}
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

              {solutionDetail?.type === "PRODUCT" ? (
                <ProductFormFieldsDetails
                  control={control}
                  getValues={getValues}
                  reset={reset}
                />
              ) : (
                <ServiceFormFieldsDetail
                  control={control}
                  isMedium={isMedium}
                  getValues={getValues}
                  reset={reset}
                  setValue={setValue}
                />
              )}

              {/* ORDER INFO */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <FormInput
                  label="Order Number"
                  name="orderNumber"
                  control={control}
                  error={errors.orderNumber}
                />
                <Controller
                  name="estimateDate"
                  control={control}
                  render={({ field, fieldState: { error } }) => (
                    <DatePicker
                      size={isMedium ? "sm" : "md"}
                      isRequired
                      label="Order date"
                      showMonthAndYearPickers
                      maxValue={today(getLocalTimeZone())}
                      errorMessage={error?.message}
                      isInvalid={!!error}
                      value={field.value ? parseDate(field.value) : null}
                      onChange={(e) =>
                        field.onChange(toCalendarDate(e).toString())
                      }
                    />
                  )}
                />
                <Controller
                  name="validUntil"
                  control={control}
                  render={({ field, fieldState: { error } }) => (
                    <DatePicker
                      size={isMedium ? "sm" : "md"}
                      isRequired
                      label="Valid till date"
                      showMonthAndYearPickers
                      maxValue={today(getLocalTimeZone())}
                      errorMessage={error?.message}
                      isInvalid={!!error}
                      value={field.value ? parseDate(field.value) : null}
                      onChange={(e) =>
                        field.onChange(toCalendarDate(e).toString())
                      }
                    />
                  )}
                />
              </div>

              <Controller
                name="customerNotes"
                control={control}
                render={({ field }) => (
                  <Textarea label="Notes" {...field} minRows={3} />
                )}
              />

              <Controller
                name="internalRemarks"
                control={control}
                render={({ field }) => (
                  <Textarea label="Remarks" {...field} minRows={3} />
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
      )}
    </>
  );
};

export default LeadEstimates;
