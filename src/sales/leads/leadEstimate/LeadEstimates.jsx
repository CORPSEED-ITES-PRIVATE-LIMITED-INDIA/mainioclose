"use client";

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
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Input,
  useDisclosure,
  Select,
  SelectItem,
} from "@heroui/react";
import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useMediaQuery } from "react-responsive";
import {
  getLocalTimeZone,
  parseDate,
  toCalendarDate,
  today,
} from "@internationalized/date";
import dayjs from "dayjs";
import { z } from "zod";

import { estimateFormSchema } from "./EstimateFormSchema";
import FormInput from "../../../components/FormInput";
import FormSelect from "../../../components/FormSelect";
import ProductFormFieldsDetails from "./ProductFormFieldsDetails";
import ServiceFormFieldsDetail from "./ServiceFormFieldsDetail";
import NewEstimatePreview from "./NewEstimatePreview";

import { getAllBusinessArrangementBySolutionId } from "../../../toolkit/slices/productSlice";
import {
  getAllSolutionList,
  getClientDesiginationList,
  getSolutionDetailByName,
  getSolutionPriceListById,
} from "../../../toolkit/slices/settingSlice";
import {
  createNewEstimate,
  getNewEstimateByLeadId,
  getSingleLeadDataByLeadId,
} from "../../../toolkit/slices/leadSlice";
import {
  createBasicUnitByCompanyId,
  createBasicUnitByCompanyIdInAccounts,
  createCompanyAndUnitsForAccountsViaLeadEstimate,
  getAllCompanyByUserId,
  getAllUnitListByCompanyId,
  getBasicCompanyDetailByCompanyId,
  getBasicCompanyDetails,
} from "../../../toolkit/slices/companySlice";
import {
  createContactViaEstimateInCompany,
  getAllCitiesByStateName,
  getAllCountries,
  getAllStatesByCountryName,
  getContactDetailListByCompanyId,
} from "../../../toolkit/slices/commonSlice";
import NewSelect from "../../../components/NewSelect";
import {
  allowOnlyNumbers,
  formatEmail,
  formatGSTInput,
  formatPANInput,
  isValidEmail,
} from "../../../common";
import BasicCompany from "../../company/BasicCompany";

/* ===========================
   ✅ Unit Modal Schema (ONLY unitName required)
=========================== */
const unitModalSchema = z.object({
  unitName: z.string().min(1, "Unit name is required"),
  gstNo: z.string().optional().or(z.literal("")),
  panNo: z.string().optional().or(z.literal("")),
  address: z.string().optional().or(z.literal("")),
  city: z.string().optional().or(z.literal("")),
  state: z.string().optional().or(z.literal("")),
  pinCode: z.string().optional().or(z.literal("")),
  country: z.string().optional().or(z.literal("")),
});

const contactModalSchema = z.object({
  title: z.string().optional().or(z.literal("")),
  name: z.string().min(1, "Name is required"),
  emails: z.string().optional().or(z.literal("")),
  contactNo: z.string().optional().or(z.literal("")),
  whatsappNo: z.string().optional().or(z.literal("")),
  clientDesignationId: z.string().optional().or(z.literal("")),
  companyUnitId: z.string().optional().or(z.literal("")),
});

export const LeadEstimates = () => {
  const { userId, leadId } = useParams();
  const isMedium = useMediaQuery({ minWidth: 768, maxWidth: 1535 });
  const dispatch = useDispatch();
  const company = useSelector((state) => state.company.basicCompanyDetail);
  const companyList = useSelector((state) => state.company.basicCompanyList);
  const unitList = useSelector((state) => state.company.basicUnitList);
  const solutionList = useSelector((state) => state.setting.allSolutionList);
  const solutionDetail = useSelector(
    (state) => state.setting.solutionDetailById,
  );
  const serviceFeeList = useSelector(
    (state) => state.setting.solutionPriceList,
  );
  const newEstimateDetail = useSelector(
    (state) => state.leads.newEstimateByLeadId,
  );
  const countryList = useSelector((state) => state.common.countriesList);
  const statesList = useSelector((state) => state.common.statesList);
  const citiesList = useSelector((state) => state.common.citiesList);
  const allContactList = useSelector(
    (state) => state.common.contactListByCompanyId,
  );
  const desiginationList = useSelector(
    (state) => state.setting.clientDesiginationList,
  );
  const [showForm, setShowForm] = useState(false);
  const [companyDetail, setCompanyDetail] = useState(null);
  const [openPreview, setOpenPreview] = useState(false);
  const [selectedEstimate, setSelectedEstimate] = useState(null);
  const [selectedSolutionDetail, setSelectedSolutionDetail] = useState(null);
  const [isDropDownOpen, setIsDropDownOpen] = useState({
    company: false,
    contact: false,
  });
  const { isOpen, onClose, onOpenChange, onOpen } = useDisclosure();
  const contactModal = useDisclosure();

  const sortedEstimates = useMemo(() => {
    const arr = Array.isArray(newEstimateDetail) ? [...newEstimateDetail] : [];
    return arr.sort(
      (a, b) =>
        new Date(b?.createdDate || b?.estimateDate || 0) -
        new Date(a?.createdDate || a?.estimateDate || 0),
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

  /* ===========================
     Estimate form (existing)
  =========================== */
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

  /* ===========================
     ✅ Unit modal form
  =========================== */
  const {
    control: unitControl,
    handleSubmit: handleUnitSubmit,
    reset: resetUnitForm,
    formState: { errors: unitErrors },
    setValue: setUnitValue,
  } = useForm({
    resolver: zodResolver(unitModalSchema),
    defaultValues: {
      unitName: "",
      gstNo: "",
      panNo: "",
      address: "",
      city: "",
      state: "",
      pinCode: "",
      country: "",
    },
  });

  const {
    control: contactControl,
    handleSubmit: handleContactSubmit,
    formState: { errors: contactErrors },
    getValues: getContactValue,
    reset: resetContactValue,
    setValue: setContactValue,
  } = useForm({
    resolver: zodResolver(contactModalSchema),
    defaultValues: {},
  });

  useEffect(() => {
    dispatch(getClientDesiginationList());
    dispatch(getAllCompanyByUserId(userId));
  }, [dispatch]);

  const handleGstChange = (e) => {
    const rawValue = e.target.value;
    const formattedValue = formatGSTInput(rawValue);
    setUnitValue("gstNo", formattedValue);
  };

  const handlePanChange = (e) => {
    const rawValue = e.target.value;
    const formattedValue = formatPANInput(rawValue);
    setUnitValue("panNo", formattedValue);
  };

  const onOpenUnitModal = () => {
    resetUnitForm((prev) => ({
      ...prev,
      createdById: Number(userId) || 0,
      updatedById: Number(userId) || 0,
    }));
    onOpen();
  };

  // service line items auto-fill
  useEffect(() => {
    const values = getValues();

    if (solutionDetail?.type === "SERVICE" && serviceFeeList?.length) {
      reset({
        ...values,
        lineItems: serviceFeeList.map((item) => ({
          itemName: item.name,
          unitPriceExGst: item?.baseAmount,
          hsnSacCode: item?.hsnSacCode,
          gstRate: item?.gstPercentage,
        })),
      });
    } else {
      // 🔥 CLEAR lineItems when:
      // - no serviceFeeList
      // - switching to PRODUCT
      // - API returns empty
      reset({
        ...values,
        lineItems: [],
      });
    }
  }, [solutionDetail?.type, serviceFeeList, reset, getValues]);

  const handleSelectSolution = (e) => {
    dispatch(
      getSolutionDetailByName({
        name: e,
        userId,
      }),
    ).then((res) => {
      if (res.meta.requestStatus === "fulfilled") {
        if (res.payload?.type === "SERVICE") {
          dispatch(
            getSolutionPriceListById({
              solutionId: res?.payload?.id,
              userId,
            }),
          );
        } else {
          dispatch(
            getAllBusinessArrangementBySolutionId({
              solutionId: res?.payload?.id,
              userId,
            }),
          );
        }
      }
    });
  };

  useEffect(() => {
    dispatch(getSingleLeadDataByLeadId({ leadId, userId })).then((resp) => {
      if (resp.meta.requestStatus === "fulfilled") {
        if (resp?.payload?.originalName) {
          dispatch(
            getSolutionDetailByName({
              name: resp?.payload?.originalName,
              userId,
            }),
          ).then((res) => {
            if (res.meta.requestStatus === "fulfilled") {
              if (res.payload?.type === "SERVICE") {
                dispatch(
                  getSolutionPriceListById({
                    solutionId: res?.payload?.id,
                    userId,
                  }),
                );
              } else {
                dispatch(
                  getAllBusinessArrangementBySolutionId({
                    solutionId: res?.payload?.id,
                    userId,
                  }),
                );
              }
            }
          });
        }
      }
    });
  }, [dispatch, leadId, userId]);

  // company + countries
  useEffect(() => {
    dispatch(getBasicCompanyDetails({ leadId, userId })).then((resp) => {
      if (resp.meta.requestStatus === "fulfilled") {
        setValue("companyName", resp?.payload?.name);
        setCompanyDetail(resp?.payload);
        dispatch(getAllUnitListByCompanyId(resp?.payload?.id));
        dispatch(
          getContactDetailListByCompanyId({
            companyId: resp?.payload?.id,
            userId,
          }),
        );
      }
    });
    dispatch(getAllCountries());
    dispatch(getAllSolutionList(userId));
  }, [dispatch, leadId, userId, setValue]);

  // estimates list
  useEffect(() => {
    dispatch(getNewEstimateByLeadId({ leadId, userId }));
  }, [dispatch, leadId, userId]);

  // ✅ Default UI:
  useEffect(() => {
    setShowForm(!hasEstimates);
  }, [hasEstimates]);

  const onSubmit = (data) => {
    data.companyId = company?.id;
    data.solutionType = selectedSolutionDetail?.type;
    data.solutionId = selectedSolutionDetail?.id;
    data.createdByUserId = userId;
    data.leadId = leadId;

    dispatch(
      createCompanyAndUnitsForAccountsViaLeadEstimate({
        ...company,
        units: [...unitList],
      }),
    )
      .then((compRes) => {
        if (compRes.meta.requestStatus === "fulfilled") {
          addToast({
            title: "Company and Its units added suuccessfully in Accounts",
            color: "success",
          });

          dispatch(createNewEstimate(data))
            .then((res) => {
              if (res.meta.requestStatus === "fulfilled") {
                addToast({
                  title: "Estimate created successfully !.",
                  color: "success",
                });
                dispatch(getNewEstimateByLeadId({ leadId, userId }));
                setShowForm(false);
              } else {
                addToast({
                  title: res?.payload?.data?.message,
                  color: "danger",
                });
              }
            })
            .catch(() =>
              addToast({ title: "Something went wrong !.", color: "danger" }),
            );
        } else {
          addToast({ title: compRes?.payload?.data?.message, color: "danger" });
        }
      })
      .catch(() =>
        addToast({ title: "Something went wrong !.", color: "danger" }),
      );
  };

  const onCancelForm = () => {
    const values = getValues();
    reset({ ...values, lineItems: [] });
    setShowForm(false);
  };

  const onSaveUnitModal = (data) => {
    data.createdById = userId;
    data.updatedById = userId;
    dispatch(
      createBasicUnitByCompanyId({
        companyId: company?.id,
        updatedBy: userId,
        data,
      }),
    )
      .then((resp) => {
        if (resp.meta.requestStatus === "fulfilled") {
          addToast({ title: "Unit details saved.", color: "success" });
          dispatch(getAllUnitListByCompanyId(company?.id));
          resetUnitForm();
          onClose();
          dispatch(getBasicCompanyDetails({ leadId, userId }));
        } else {
          addToast({ title: resp.payload?.message, color: "danger" });
        }
      })
      .catch(() => {
        addToast({ title: "Something went wrong !.", color: "danger" });
      });
  };

  const handleSubmitContact = (data) => {
    data.companyId = companyDetail?.id;
    dispatch(createContactViaEstimateInCompany(data))
      .then((resp) => {
        console.log("dssssssssssssssssssss  11111", resp);
        if (resp.meta.requestStatus === "fulfilled") {
          addToast({ title: "Unit details saved.", color: "success" });
          contactModal.onClose();
          resetContactValue();
          dispatch(
            getContactDetailListByCompanyId({
              companyId: companyDetail?.id,
              userId,
            }),
          );
        } else {
          addToast({
            title: resp.payload?.message || resp?.payload,
            color: "danger",
          });
        }
      })
      .catch(() =>
        addToast({ title: "Something went wrong !.", color: "danger" }),
      );
  };

  return (
    <>
      {/* ===================== TOP ACTION BAR (ALWAYS VISIBLE) ===================== */}
      <div className="w-full flex items-center justify-end mb-3 gap-2">
        <Button
          type="button"
          color="secondary"
          variant="flat"
          size="sm"
          className="cursor-pointer"
          onPress={onOpenUnitModal}
        >
          Add Unit Details
        </Button>

        {!showForm && (
          <Button
            type="button"
            color="primary"
            size="sm"
            className="cursor-pointer"
            onPress={() => setShowForm(true)}
          >
            Create Estimate
          </Button>
        )}

        {showForm && hasEstimates && (
          <Button
            type="button"
            color="default"
            variant="flat"
            size="sm"
            className="cursor-pointer"
            onPress={onCancelForm}
          >
            Cancel
          </Button>
        )}
      </div>

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
                    {/* 
                    <p className="text-sm text-slate-600">
                      Order: {est?.orderNumber || "NA"}
                    </p> */}

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
          className="w-full max-h-[70vh] overflow-auto space-y-4"
        >
          <Card className="shadow-xl">
            <CardHeader className="text-xl font-semibold flex items-center justify-between">
              <span>Create Estimate</span>
            </CardHeader>

            <CardBody className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <Controller
                  name="companyName"
                  control={control}
                  render={({ field, fieldState: { error } }) => (
                    <NewSelect
                      label="Select company"
                      size={isMedium ? "sm" : "md"}
                      data={companyList || []}
                      labelKey="name"
                      valueKey="name"
                      isOpen={isDropDownOpen?.company}
                      value={field.value}
                      onOpenChange={(e) =>
                        setIsDropDownOpen((prev) => ({ ...prev, company: e }))
                      }
                      onItemSelect={(item) => {
                        dispatch(
                          getBasicCompanyDetailByCompanyId(item?.id),
                        ).then((resp) => {
                          if (resp.meta.requestStatus === "fulfilled") {
                            setValue("companyName", resp?.payload?.name);
                            setCompanyDetail(resp?.payload);
                            dispatch(
                              getContactDetailListByCompanyId({
                                companyId: resp?.payload?.id,
                                userId,
                              }),
                            );
                          }
                        });
                        getAllUnitListByCompanyId(item?.id);
                      }}
                      onChange={(value) => {
                        field.onChange(value);
                      }}
                      endContent={
                        <BasicCompany
                          setIsDropDownOpen={setIsDropDownOpen}
                          isEstimate={true}
                          companyDetail={companyDetail}
                        />
                      }
                    />
                  )}
                />

                <FormSelect
                  label="Unit Name"
                  name="unitId"
                  control={control}
                  error={errors.unitName}
                  data={
                    unitList?.length > 0
                      ? unitList?.map((item) => ({
                          label: item?.unitName,
                          value: item?.id,
                        }))
                      : []
                  }
                  onChangeExtra={(e) => setContactValue("companyUnitId", e)}
                />

                <FormSelect
                  label="Contact"
                  name="contactId"
                  control={control}
                  isOpen={isDropDownOpen?.contact}
                  onOpenChange={(e) =>
                    setIsDropDownOpen((prev) => ({ ...prev, contact: e }))
                  }
                  error={errors.contactId}
                  data={allContactList}
                  labelKey="name"
                  valueKey="id"
                  endContent={
                    <span
                      className="text-blue-700 cursor-pointer font-medium text-nowrap text-sm"
                      onPointerDown={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                      }}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        contactModal.onOpen();
                        setIsDropDownOpen((prev) => ({
                          ...prev,
                          contact: false,
                        }));
                      }}
                    >
                      + Add
                    </span>
                  }
                />

                <Controller
                  name="solutionName"
                  control={control}
                  render={({ field, fieldState: { error } }) => (
                    <NewSelect
                      label="Select solutions"
                      size={isMedium ? "sm" : "md"}
                      data={solutionList || []}
                      labelKey="name"
                      valueKey="name"
                      value={field.value}
                      onItemSelect={(item) => setSelectedSolutionDetail(item)}
                      onChange={(value) => {
                        field.onChange(value);
                        handleSelectSolution(value);
                      }}
                    />
                  )}
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
                {/* <FormInput
                  label="Order Number"
                  name="orderNumber"
                  control={control}
                  error={errors.orderNumber}
                /> */}

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

      {/* ===================== ✅ UNIT DETAILS MODAL ===================== */}
      <Modal
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        placement="center"
        size="3xl"
        scrollBehavior="inside"
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                Add Unit Details
                <span className="text-xs text-slate-500 font-normal">
                  Only Unit Name is mandatory
                </span>
              </ModalHeader>

              <ModalBody>
                <form onSubmit={handleUnitSubmit(onSaveUnitModal)}>
                  <div className="max-h-[80vh] overflow-auto  grid grid-cols-1 md:grid-cols-2 gap-3">
                    <Controller
                      name="unitName"
                      control={unitControl}
                      render={({ field }) => (
                        <Input
                          {...field}
                          label="Unit Name"
                          isRequired
                          isInvalid={!!unitErrors.unitName}
                          errorMessage={unitErrors.unitName?.message}
                        />
                      )}
                    />

                    <Controller
                      name="address"
                      control={unitControl}
                      render={({ field }) => (
                        <Input
                          value={field.value}
                          onChange={(e) => field.onChange(e.target.value)}
                          label="Address"
                        />
                      )}
                    />

                    <Controller
                      name="country"
                      control={unitControl}
                      render={({ field, fieldState: { error } }) => (
                        <NewSelect
                          label="Country"
                          size={isMedium ? "sm" : "md"}
                          data={countryList || []}
                          labelKey="name"
                          valueKey="name"
                          value={field.value}
                          onChange={(value) => {
                            dispatch(getAllStatesByCountryName(value));
                            field.onChange(value);
                          }}
                        />
                      )}
                    />

                    <Controller
                      name="state"
                      control={unitControl}
                      render={({ field, fieldState: { error } }) => (
                        <NewSelect
                          label="State"
                          size={isMedium ? "sm" : "md"}
                          data={statesList || []}
                          labelKey="name"
                          valueKey="name"
                          value={field.value}
                          onChange={(value) => {
                            dispatch(getAllCitiesByStateName(value));
                            field.onChange(value);
                          }}
                        />
                      )}
                    />

                    <Controller
                      name="city"
                      control={unitControl}
                      render={({ field, fieldState: { error } }) => (
                        <NewSelect
                          label="City"
                          size={isMedium ? "sm" : "md"}
                          data={citiesList || []}
                          labelKey="name"
                          valueKey="name"
                          value={field.value}
                          onChange={(value) => field.onChange(value)}
                        />
                      )}
                    />

                    {/* Pin Code */}
                    <Controller
                      name="pinCode"
                      control={unitControl}
                      render={({ field }) => (
                        <Input {...field} label="Pin Code" maxLength={6} />
                      )}
                    />

                    <Controller
                      name="gstNo"
                      control={unitControl}
                      render={({ field }) => (
                        <Input
                          value={field.value}
                          onChange={(e) => {
                            handleGstChange(e);
                          }}
                          label="GST No"
                        />
                      )}
                    />

                    <Controller
                      name="panNo"
                      control={unitControl}
                      render={({ field }) => (
                        <Input
                          value={field.value}
                          onChange={(e) => {
                            handlePanChange(e);
                          }}
                          label="PAN No"
                        />
                      )}
                    />
                  </div>
                  <ModalFooter>
                    <Button
                      type="button"
                      variant="flat"
                      color="default"
                      className="cursor-pointer"
                      onPress={onClose}
                    >
                      Close
                    </Button>

                    <Button
                      type="submit"
                      color="primary"
                      className="cursor-pointer"
                    >
                      Save
                    </Button>
                  </ModalFooter>
                </form>
              </ModalBody>
            </>
          )}
        </ModalContent>
      </Modal>

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

          <div className="relative w-[60vw] h-[92vh] bg-white rounded-xl shadow-2xl overflow-hidden">
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

      <Modal
        isOpen={contactModal.isOpen}
        onOpenChange={contactModal.onOpenChange}
        placement="center"
        size="3xl"
        scrollBehavior="inside"
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                Add contact Details
              </ModalHeader>

              <ModalBody>
                <form onSubmit={handleContactSubmit(handleSubmitContact)}>
                  <div className="max-h-[80vh] overflow-auto  grid grid-cols-1 md:grid-cols-2 gap-3">
                    <FormSelect
                      label="Select Unit"
                      name="companyUnitId"
                      isRequired
                      control={contactControl}
                      error={contactErrors.companyUnitId}
                      data={company?.units?.map((item) => ({
                        label: item?.unitName,
                        value: item?.id,
                      }))}
                    />
                    <Controller
                      name="title"
                      control={contactControl}
                      render={({ field, fieldState: { error } }) => (
                        <Select
                          isRequired={true}
                          size={isMedium ? "sm" : "md"}
                          label="Salutation"
                          errorMessage={error?.message}
                          isInvalid={!!error}
                          {...field}
                          onChange={(e) => field.onChange(e.target.value)}
                          items={[
                            { label: "Master.", key: "master" },
                            { label: "Mr.", key: "mr" },
                            { label: "Mrs.", key: "mrs" },
                            { label: "Miss.", key: "miss" },
                          ]}
                        >
                          {(item) => (
                            <SelectItem key={item.key}>{item.label}</SelectItem>
                          )}
                        </Select>
                      )}
                    />
                    <Controller
                      name="name"
                      control={contactControl}
                      render={({ field, fieldState: { error } }) => (
                        <Input
                          isRequired={true}
                          size={isMedium ? "sm" : "md"}
                          label="Name"
                          errorMessage={error?.message}
                          isInvalid={!!error}
                          {...field}
                        />
                      )}
                    />
                    <Controller
                      name="clientDesignationId"
                      control={contactControl}
                      render={({ field, fieldState: { error } }) => (
                        <NewSelect
                          isRequired={true}
                          size={isMedium ? "sm" : "md"}
                          label="Designation"
                          errorMessage={error?.message}
                          isInvalid={!!error}
                          data={desiginationList || []}
                          labelKey="name"
                          valueKey="id"
                          value={field.value}
                          onChange={(value) => field.onChange(value)}
                        />
                      )}
                    />
                    <Controller
                      name="emails"
                      control={contactControl}
                      rules={{
                        validate: (value) =>
                          !value ||
                          isValidEmail(value) ||
                          "Please enter a valid email address",
                      }}
                      render={({ field, fieldState: { error } }) => (
                        <Input
                          isRequired={true}
                          size={isMedium ? "sm" : "md"}
                          label="Email"
                          type="email"
                          errorMessage={error?.message}
                          isInvalid={!!error}
                          value={field?.value}
                          onChange={(e) =>
                            field.onChange(formatEmail(e.target.value))
                          }
                        />
                      )}
                    />
                    <Controller
                      name="contactNo"
                      control={contactControl}
                      render={({ field, fieldState: { error } }) => (
                        <Input
                          isRequired={true}
                          size={isMedium ? "sm" : "md"}
                          label="Contact number"
                          errorMessage={error?.message}
                          isInvalid={!!error}
                          value={field?.value}
                          onChange={(e) =>
                            field.onChange(allowOnlyNumbers(e.target.value))
                          }
                        />
                      )}
                    />
                    <Controller
                      name="contactWhatsappNo"
                      control={contactControl}
                      render={({ field, fieldState: { error } }) => (
                        <Input
                          isRequired={true}
                          size={isMedium ? "sm" : "md"}
                          label="Whatsapp number"
                          errorMessage={error?.message}
                          isInvalid={!!error}
                          value={field?.value}
                          onChange={(e) =>
                            field.onChange(allowOnlyNumbers(e.target.value))
                          }
                        />
                      )}
                    />
                  </div>
                  <ModalFooter>
                    <Button
                      type="button"
                      variant="flat"
                      color="default"
                      className="cursor-pointer"
                      onPress={onClose}
                    >
                      Close
                    </Button>

                    <Button
                      type="submit"
                      color="primary"
                      className="cursor-pointer"
                    >
                      Save
                    </Button>
                  </ModalFooter>
                </form>
              </ModalBody>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
};

export default LeadEstimates;
