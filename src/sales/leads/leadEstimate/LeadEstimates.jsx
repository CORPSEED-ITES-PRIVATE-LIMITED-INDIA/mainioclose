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
import { useEffect, useMemo, useState } from "react";
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
import dayjs from "dayjs";

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

  // ✅ Mode: list or form
  const [showForm, setShowForm] = useState(false);

  // ✅ Preview overlay state
  const [openPreview, setOpenPreview] = useState(false);
  const [selectedEstimate, setSelectedEstimate] = useState(null);

  const sortedEstimates = useMemo(() => {
    const arr = Array.isArray(newEstimateDetail) ? [...newEstimateDetail] : [];
    return arr.sort(
      (a, b) =>
        new Date(b?.createdDate || b?.estimateDate || 0) -
        new Date(a?.createdDate || a?.estimateDate || 0)
    );
  }, [newEstimateDetail]);

  const hasEstimates = sortedEstimates.length > 0;

  const openEstimatePreview = (estimate) => {
    setSelectedEstimate(estimate);
    setOpenPreview(true);
  };

  const closeEstimatePreview = () => {
    setOpenPreview(false);
    setSelectedEstimate(null);
  };

  // close overlay on ESC
  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === "Escape") closeEstimatePreview();
    };
    if (openPreview) window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [openPreview]);

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

  // service line items auto-fill
  useEffect(() => {
    if (serviceFeeList?.length) {
      const values = getValues();
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

  // load lead + solution + price/tier
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

  // company + countries
  useEffect(() => {
    dispatch(getBasicCompanyDetails({ leadId, userId })).then((resp) => {
      if (resp.meta.requestStatus === "fulfilled") {
        setValue("companyName", resp?.payload?.name);
      }
    });
    dispatch(getAllCountries());
  }, [dispatch]);

  // estimates list
  useEffect(() => {
    dispatch(getNewEstimateByLeadId({ leadId, userId }));
  }, [dispatch]);

  // ✅ Default UI:
  // - If estimates exist → show list (showForm=false)
  // - If no estimates → show form (showForm=true)
  useEffect(() => {
    setShowForm(!hasEstimates);
  }, [hasEstimates]);

  const onSubmit = (data) => {
    data.companyId = company?.id;
    data.solutionName = solutionDetail?.name;
    data.solutionType = solutionDetail?.type;
    data.sourceSolutionIds = solutionDetail?.id;
    data.createdByUserId = userId;

    dispatch(createNewEstimate(data))
      .then((res) => {
        if (res.meta.requestStatus === "fulfilled") {
          addToast({
            title: "Estimate created successfully !.",
            color: "success",
          });

          // refresh list & go back to card view
          dispatch(getNewEstimateByLeadId({ leadId, userId }));
          setShowForm(false);
        } else {
          addToast({ title: res?.payload?.data?.message, color: "danger" });
        }
      })
      .catch(() =>
        addToast({ title: "Something went wrong !.", color: "danger" })
      );
  };

  const onCancelForm = () => {
    // optional: reset form when cancel
    const values = getValues();
    reset({
      ...values,
      lineItems: [],
    });

    setShowForm(false);
  };

  return (
    <>
      {/* ===================== LIST MODE ===================== */}
      {!showForm && hasEstimates && (
        <div className="w-full">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-lg font-semibold text-slate-800">
                Estimates
              </h3>
              <p className="text-sm text-slate-500">
                {sortedEstimates.length} total
              </p>
            </div>

            <Button
              color="primary"
              size="md"
              className="cursor-pointer"
              onClick={() => setShowForm(true)}
            >
              Create Estimate
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
            {sortedEstimates.map((est) => (
              <button
                key={est?.id}
                type="button"
                onClick={() => openEstimatePreview(est)}
                className="text-left cursor-pointer"
              >
                <Card className="hover:shadow-lg transition-shadow">
                  <CardBody className="space-y-1">
                    <div className="flex items-center justify-between">
                      <p className="font-semibold text-slate-900">
                        {est?.estimateNumber || `Estimate #${est?.id}`}
                      </p>
                      <span className="text-xs px-2 py-1 rounded-full bg-slate-100 text-slate-600">
                        {est?.performaInvoice ? "Proforma" : "Estimate"}
                      </span>
                    </div>

                    <p className="text-sm text-slate-600">
                      Order: {est?.orderNumber || "NA"}
                    </p>

                    <p className="text-xs text-slate-500">
                      Date:{" "}
                      {est?.estimateDate
                        ? dayjs(est.estimateDate).format("DD MMM YYYY")
                        : "NA"}
                    </p>

                    <p className="text-xs text-slate-500">
                      Valid Till:{" "}
                      {est?.validUntil
                        ? dayjs(est.validUntil).format("DD MMM YYYY")
                        : "NA"}
                    </p>
                  </CardBody>
                </Card>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ===================== FORM MODE ===================== */}
      {showForm && (
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="w-full max-h-[80vh] overflow-auto space-y-4"
        >
          <Card className="shadow-xl">
            <CardHeader className="text-xl font-semibold flex items-center justify-between">
              <span>Create Estimate</span>

              {hasEstimates && (
                <Button
                  type="button"
                  color="default"
                  variant="flat"
                  size="sm"
                  className="cursor-pointer"
                  onClick={onCancelForm}
                >
                  Cancel
                </Button>
              )}
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
              </div>

              {solutionDetail?.type === "PRODUCT" ? (
                <ProductFormFieldsDetails
                  control={control}
                  getValues={getValues}
                  reset={reset}
                  setValue={setValue}
                  isMedium={isMedium}
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

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
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
                      minValue={today(getLocalTimeZone())}
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
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
              </div>
            </CardBody>
          </Card>

          <div className="flex justify-end mt-4 gap-2">
            {hasEstimates && (
              <Button
                type="button"
                color="default"
                variant="flat"
                size="lg"
                className="cursor-pointer"
                onClick={onCancelForm}
              >
                Cancel
              </Button>
            )}

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

      {/* ===================== FULLSCREEN PREVIEW ===================== */}
      {openPreview && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center"
          role="dialog"
          aria-modal="true"
        >
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={closeEstimatePreview}
          />

          <div className="relative w-[95vw] h-[92vh] bg-white rounded-xl shadow-2xl overflow-hidden">
            <div className="h-12 px-4 flex items-center justify-between border-b bg-white">
              <div className="flex items-center gap-3">
                <p className="font-semibold text-slate-900">
                  {selectedEstimate?.estimateNumber ||
                    `Estimate #${selectedEstimate?.id}`}
                </p>
                <span className="text-xs px-2 py-1 rounded-full bg-slate-100 text-slate-600">
                  {selectedEstimate?.performaInvoice
                    ? "Proforma Invoice"
                    : "Estimate"}
                </span>
              </div>

              <button
                type="button"
                onClick={closeEstimatePreview}
                className="cursor-pointer px-3 py-1 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700"
              >
                Close
              </button>
            </div>

            <div className="h-[calc(92vh-3rem)] overflow-auto">
              <NewEstimatePreview details={selectedEstimate} />
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default LeadEstimates;
