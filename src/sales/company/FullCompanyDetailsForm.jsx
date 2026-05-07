import React, { memo, useEffect, useMemo, useState } from "react";
import { useForm, Controller, useFieldArray } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  Modal,
  Card,
  Button,
  Input as AntInput,
  Select as AntSelect,
  DatePicker as AntDatePicker,
  Divider,
  message,
} from "antd";
import dayjs from "dayjs";

import { useDispatch, useSelector } from "react-redux";
import SingleFileUploader from "../../components/SingleFileUploader";
import { allowOnlyNumbers, formatGSTInput, formatPANInput } from "../../common";
import {
  getAllCitiesByStateName,
  getAllCountries,
  getAllMainIndustry,
  getAllStatesByCountryName,
  getAllUsers,
  getIndustryDataBySubSubIndustryId,
  getSubIndustryByIndustryId,
  getSubSubIndustryBySubIndustryId,
} from "../../toolkit/slices/commonSlice";
import {
  getAllCompanyType,
  getAllGstType,
  getAllGstTypeByCompanyTypeId,
  getBusinessTypeByGstTypeId,
  updateFullCompanyDetailsInLeads,
} from "../../toolkit/slices/companySlice";
import { getClientDesiginationList } from "../../toolkit/slices/settingSlice";
import {
  getAllEstimateByUserId,
  getTotalCountOfEstimate,
} from "../../toolkit/slices/leadSlice";
import { useParams } from "react-router-dom";
import { IndianRupee } from "lucide-react";
import LoadingSpinner from "../../components/LoadingSpinner";

const unitSchema = (gstTypeList = []) =>
  z
    .object({
      id: z.coerce.number().optional().default(0),
      unitName: z.string().min(1, "Unit name is required"),
      addressLine1: z.string().min(1, "Address Line 1 is required"),
      city: z.string().min(1, "City is required"),
      state: z.string().min(1, "State is required"),
      country: z.string().min(1, "Country is required"),
      pinCode: z.string().min(1, "Pin code is required"),
      gstNo: z.string().optional(),
      unitOpeningDate: z.string().min(1, "please enter date"),
      gstTypeId: z.coerce.string().min(1, "please select gst type"),
    })
    .superRefine((data, ctx) => {
      const selectedGstType = gstTypeList?.find(
        (item) => String(item.id) === String(data.gstTypeId),
      );

      const isRegistered =
        selectedGstType?.name?.trim()?.toLowerCase() === "registered";

      if (isRegistered && !data.gstNo?.trim()) {
        ctx.addIssue({
          path: ["gstNo"],
          message: "GST number is required",
          code: z.ZodIssueCode.custom,
        });
      }
    });

const companySchema = (obj, gstTypeList = []) =>
  z.object({
    name: z.string().min(1, "Company name is required."),
    panNo: z.string().min(1, "please give pan number."),
    companyTypeId: z.coerce.string().min(1, "Please select company structure."),
    industryId: z.coerce.string().min(1, "Please select industry."),
    subIndustryId: z.coerce.string().min(1, "Please select sub industry."),
    subSubIndustryId: z.coerce.string().min(1, "Please select category."),
    industryDataId: z
      .array(z.coerce.string())
      .min(1, "Please select business activity."),
    companyFileUrl: z.string().optional(),
    ...(obj?.aggrementPresent
      ? { agreementFileUrl: z.string().min(1, "please upload attachement") }
      : {}),
    ...(obj?.ndaPresent
      ? { ndaFileUrl: z.string().min(1, "please upload attachement") }
      : {}),
    aggrementPresent: z.boolean(),
    ndaPresent: z.boolean(),
    address: z.string().min(1, "please enter address."),
    country: z.string().min(1, "please select country."),
    state: z.string().min(1, "please select state."),
    city: z.string().min(1, "please select city."),
    primaryPinCode: z.string().min(1, "please select pin code"),
    rating: z.string().min(1, "please select rating"),
    companyAge: z.string().min(1, "please enter company age."),
    establishDate: z.string().min(1, "please enter established date"),
    revenue: z.string().min(1, "please enter revenue"),
    units: z
      .array(unitSchema(gstTypeList))
      .min(1, "At least one unit is required"),
  });

const getEmptyUnit = () => ({
  id: 0,
  unitName: "",
  gstNo: "",
  gstTypeId: "",
  gstBusinessTypeId: "",
  gstTypePriceId: "",
  addressLine1: "",
  addressLine2: "",
  city: "",
  state: "",
  country: "",
  pinCode: "",
  unitOpeningDate: "",
  consultantPresent: true,
});

const getDefaultValues = () => ({
  name: "",
  gstNo: "",
  panNo: "",
  companyType: "",
  gstType: "",
  businessType: "",
  industryId: "",
  subIndustryId: "",
  subSubIndustryId: "",
  industryDataId: [],
  companyFileUrl: "",
  paymentTerm: "",
  aggrementPresent: false,
  agreementFileUrl: "",
  ndaPresent: false,
  ndaFileUrl: "",
  primaryTitle: "",
  contactName: "",
  primaryDesignation: "",
  contactEmails: "",
  contactNo: "",
  contactWhatsappNo: "",
  address: "",
  country: "",
  state: "",
  city: "",
  primaryPinCode: "",
  rating: "",
  companyAge: "",
  establishDate: "",
  revenue: "",
  stage: "",
  status: "",
  isConsultant: false,
  actualClientCompanyId: "",
  units: [getEmptyUnit()],
});

const addToast = ({ title, color }) => {
  if (color === "success") message.success(title);
  else if (color === "danger") message.error(title);
  else message.info(title);
};

const FieldShell = ({
  label,
  isRequired,
  errorMessage,
  isInvalid,
  children,
}) => (
  <div className="w-full">
    {label && (
      <label className="mb-1.5 block text-xs font-semibold text-slate-700">
        {label}
        {isRequired && <span className="ml-0.5 text-red-500">*</span>}
      </label>
    )}
    {children}
    {isInvalid && errorMessage && (
      <div className="mt-1 text-xs font-medium text-red-500">
        {errorMessage}
      </div>
    )}
  </div>
);

const Input = ({
  label,
  isRequired,
  isInvalid,
  errorMessage,
  isReadOnly,
  startContent,
  ...props
}) => (
  <FieldShell
    label={label}
    isRequired={isRequired}
    isInvalid={isInvalid}
    errorMessage={errorMessage}
  >
    <AntInput
      {...props}
      readOnly={isReadOnly}
      prefix={startContent}
      status={isInvalid ? "error" : ""}
      className="h-10 rounded-lg"
    />
  </FieldShell>
);

const Select = ({
  label,
  isRequired,
  isInvalid,
  errorMessage,
  selectedKeys,
  onSelectionChange,
  items = [],
  children,
  isDisabled,
}) => {
  const childOptions = React.Children.toArray(children)
    .filter(React.isValidElement)
    .map((child) => ({
      value: String(child.key).replace(".$", ""),
      label: child.props.children,
    }));

  const itemOptions = items.map((item) => ({
    value: String(item.key),
    label: item.label,
  }));

  const options = itemOptions.length ? itemOptions : childOptions;
  const value = Array.isArray(selectedKeys) ? selectedKeys[0] : undefined;

  return (
    <FieldShell
      label={label}
      isRequired={isRequired}
      isInvalid={isInvalid}
      errorMessage={errorMessage}
    >
      <AntSelect
        allowClear
        showSearch
        disabled={isDisabled}
        value={value || undefined}
        options={options}
        status={isInvalid ? "error" : ""}
        optionFilterProp="label"
        className="w-full"
        style={{ height: 40 }}
        onChange={(value) => {
          onSelectionChange?.(new Set(value ? [value] : []));
        }}
      />
    </FieldShell>
  );
};

const SelectItem = ({ children }) => children;

const NewSelect = ({
  label,
  isRequired,
  isInvalid,
  errorMessage,
  data = [],
  labelKey = "name",
  valueKey = "id",
  value,
  onChange,
  selectionMode,
  isDisabled,
}) => {
  const options = data.map((item) => ({
    value: String(item?.[valueKey] ?? ""),
    label: item?.[labelKey] ?? "",
  }));

  const finalValue =
    selectionMode === "multiple"
      ? Array.isArray(value)
        ? value.map(String)
        : []
      : value
        ? String(value)
        : undefined;

  return (
    <FieldShell
      label={label}
      isRequired={isRequired}
      isInvalid={isInvalid}
      errorMessage={errorMessage}
    >
      <AntSelect
        allowClear
        showSearch
        disabled={isDisabled}
        mode={selectionMode === "multiple" ? "multiple" : undefined}
        value={finalValue}
        options={options}
        status={isInvalid ? "error" : ""}
        optionFilterProp="label"
        className="w-full"
        style={{ minHeight: 40 }}
        maxTagCount="responsive"
        onChange={(selectedValue) => {
          if (selectionMode === "multiple") {
            onChange?.((selectedValue || []).map(String));
          } else {
            onChange?.(selectedValue ? String(selectedValue) : "");
          }
        }}
      />
    </FieldShell>
  );
};

const DatePicker = ({
  label,
  isRequired,
  isInvalid,
  errorMessage,
  value,
  onChange,
  maxValue,
}) => (
  <FieldShell
    label={label}
    isRequired={isRequired}
    isInvalid={isInvalid}
    errorMessage={errorMessage}
  >
    <AntDatePicker
      value={value}
      maxDate={maxValue}
      format="YYYY-MM-DD"
      className="h-10 w-full rounded-lg"
      status={isInvalid ? "error" : ""}
      onChange={(date) => onChange?.(date)}
    />
  </FieldShell>
);

const ButtonWrapper = ({
  children,
  color,
  variant,
  isLoading,
  onPress,
  className = "",
  ...props
}) => {
  const type =
    color === "primary"
      ? "primary"
      : variant === "bordered"
        ? "default"
        : "text";

  return (
    <Button
      {...props}
      type={type}
      loading={isLoading}
      onClick={onPress}
      className={`rounded-lg ${className}`}
    >
      {children}
    </Button>
  );
};

const FullCompanyDetailsForm = ({
  modalTitle = "Create / Edit Company",
  isOpen,
  onOpenChange,
  filteration,
  filters,
}) => {
  return (
    <Modal
      open={isOpen}
      onCancel={() => onOpenChange?.(false)}
      footer={null}
      width="100%"
      centered
      destroyOnHidden
      styles={{
        body: {
          padding: 0,
          maxHeight: "calc(100vh - 110px)",
          overflowY: "auto",
          background: "#f8fafc",
        },
        content: {
          padding: 0,
          overflow: "hidden",
        },
      }}
      title={
        <div className="flex items-center justify-start">
          <div>
            <div className="text-lg font-bold text-slate-900">{modalTitle}</div>
            <div className="mt-1 text-xs font-medium text-slate-500">
              Complete company profile, address and unit information.
            </div>
          </div>
        </div>
      }
    >
      <div className="px-5 py-5">
        <CompanyAndUnitsForm
          onClose={() => onOpenChange?.(false)}
          onCancel={() => onOpenChange?.(false)}
          filteration={filteration}
          filters={filters}
        />
      </div>
    </Modal>
  );
};

export default memo(FullCompanyDetailsForm);

export function CompanyAndUnitsForm({
  onCancel,
  onClose,
  filteration,
  filters,
}) {
  const dispatch = useDispatch();
  const { userId } = useParams();
  const defaultValues = useMemo(() => getDefaultValues(), []);

  const allUsers = useSelector((state) => state.common.usersList);
  const companyTypeList = useSelector((state) => state.company.companyTypeList);
  const gstTypeList = useSelector((state) => state.company.gstTypeList);
  const businessTypeList = useSelector(
    (state) => state.company.businessTypeList,
  );

  const userRole = useSelector((state) => state.auth.currentUser?.roles);
  const adminRole = userRole?.includes("ADMIN");
  const countryList = useSelector((state) => state.common.countriesList);

  const allIndustry = useSelector((state) => state.common.allMainIndustry);
  const subIndustryListById = useSelector(
    (state) => state.common.subIndustryListByIndustryId,
  );
  const subSubIndustryListById = useSelector(
    (state) => state.common.subSubIndustryListBySubIndustryId,
  );
  const industryDataListById = useSelector(
    (state) => state.common.industryDataListBySubSubIndustryId,
  );

  const desiginationList = useSelector(
    (state) => state.setting.clientDesiginationList,
  );

  const company = useSelector(
    (state) => state.company.companyDetailByCompanyIdAndUnitId,
  );

  const [gstAndPanData, setGstAndPanData] = useState({});
  const [formCondition, setFormCondition] = useState({
    adminRole,
    aggrementPresent: false,
    ndaPresent: false,
  });
  const [gstTypeMap, setGstTypeMap] = useState({});
  const [businessTypeMap, setBusinessTypeMap] = useState({});
  const [statusLoading, setStatusLoading] = useState("");
  const [panError, setPanError] = useState("");
  const [gstError, setGstError] = useState("");

  const {
    control,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting },
    setValue,
    clearErrors,
  } = useForm({
    resolver: zodResolver(companySchema(formCondition, gstTypeList)),
    mode: "onSubmit",
    reValidateMode: "onChange",
    defaultValues,
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "units",
  });

  const aggrementPresent = watch("aggrementPresent");
  const ndaPresent = watch("ndaPresent");
  const state = watch("state");
  const gstNo = watch("gstNo");
  const isConsultant = watch("isConsultant");
  const companyAge = watch("companyAge");
  const establishDate = watch("establishDate");
  const companyCountry = watch("country");
  const companyState = watch("state");

  const statesList = useSelector(
    (state) => state.common.statesByCountry[companyCountry] || [],
  );

  const citiesList = useSelector(
    (state) => state.common.citiesByState[companyState] || [],
  );

  const statesByCountry = useSelector((state) => state.common.statesByCountry);
  const citiesByState = useSelector((state) => state.common.citiesByState);

  const getGstTypeNameById = (gstTypeId) => {
    const selectedGstType = gstTypeList?.find(
      (gst) => String(gst.id) === String(gstTypeId),
    );
    return selectedGstType?.name?.trim()?.toLowerCase() || "";
  };

  const isInternationalGstType = (gstTypeId) => {
    return getGstTypeNameById(gstTypeId) === "international";
  };

  const hasSelectedGstType = (gstTypeId) => {
    return !!String(gstTypeId || "").trim();
  };

  const removeIndiaFromCountryList = (list = []) => {
    return list.filter(
      (country) => country?.name?.trim()?.toLowerCase() !== "india",
    );
  };

  const validateGST = (gstNo, stateName) => {
    if (!gstNo) return "";
    if (
      !/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(gstNo)
    ) {
      return "Invalid GST Number";
    }

    const selectedState = statesList?.find((s) => s.name === stateName);
    if (selectedState && gstNo.slice(0, 2) !== selectedState.gstCode) {
      return "GST code does not match selected state";
    }

    return "";
  };

  const handlePanChange = (e) => {
    const rawValue = e.target.value;
    const formattedValue = formatPANInput(rawValue);
    setValue("panNo", formattedValue);

    if (
      formattedValue.length === 10 &&
      !/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(formattedValue)
    ) {
      setPanError("Invalid PAN Number");
    } else {
      setPanError("");
    }
  };

  const handleGstChange = (e, name) => {
    const rawValue = e.target.value;
    const formattedValue = formatGSTInput(rawValue);
    setValue(name, formattedValue);
  };

  const handleStateChange = (stateName) => {
    setValue("state", stateName);
    dispatch(getAllCitiesByStateName(stateName));
  };

  useEffect(() => {
    dispatch(getAllCompanyType());
    dispatch(getAllGstType());
    dispatch(getAllUsers());
    dispatch(getAllMainIndustry());
    dispatch(getClientDesiginationList());
    dispatch(getAllCountries());
  }, [dispatch]);

  useEffect(() => {
    if (companyAge) {
      const age = Number(companyAge);
      const currentYear = new Date().getFullYear();
      const establishYear = currentYear - age;

      const date = new Date();
      date.setFullYear(establishYear);

      const formatted = date.toISOString().split("T")[0];

      setValue("establishDate", formatted, {
        shouldValidate: true,
        shouldDirty: true,
      });
    }
  }, [companyAge, setValue]);

  useEffect(() => {
    if (establishDate) {
      const estDate = new Date(establishDate);
      const todayDate = new Date();

      let age = todayDate.getFullYear() - estDate.getFullYear();

      const m = todayDate.getMonth() - estDate.getMonth();
      if (m < 0 || (m === 0 && todayDate.getDate() < estDate.getDate())) {
        age--;
      }

      setValue("companyAge", age.toString(), {
        shouldValidate: true,
        shouldDirty: true,
      });
    }
  }, [establishDate, setValue]);

  useEffect(() => {
    if (!company) return;

    const countries = new Set();
    const states = new Set();

    if (company?.country) countries.add(company.country);
    if (company?.state) states.add(company.state);

    company?.units?.forEach((unit, index) => {
      if (unit?.country) countries.add(unit.country);
      if (unit?.state) states.add(unit.state);

      if (unit?.companyTypeId) {
        dispatch(getAllGstTypeByCompanyTypeId(unit.companyTypeId)).then(
          (res) => {
            if (res.payload) {
              setGstTypeMap((prev) => ({
                ...prev,
                [index]: res.payload?.gstBussinessType || [],
              }));
            }
          },
        );
      }

      if (unit?.gstTypeId) {
        dispatch(getBusinessTypeByGstTypeId(unit.gstTypeId)).then((res) => {
          if (res.payload) {
            setBusinessTypeMap((prev) => ({
              ...prev,
              [index]: res.payload?.gstTypePrice || [],
            }));
          }
        });
      }
    });

    countries.forEach((country) => {
      dispatch(getAllStatesByCountryName(country));
    });

    states.forEach((stateName) => {
      dispatch(getAllCitiesByStateName(stateName));
    });

    if (company?.industryId) {
      dispatch(getSubIndustryByIndustryId(company?.industryId));
    }

    if (company?.subIndustryId) {
      dispatch(getSubSubIndustryBySubIndustryId(company?.subIndustryId));
    }

    if (company?.subSubIndustryId) {
      dispatch(getIndustryDataBySubSubIndustryId(company?.subSubIndustryId));
    }

    setFormCondition((prev) => ({
      ...prev,
      ndaPresent: company?.ndaPresent,
      aggrementPresent: company?.aggrementPresent,
    }));

    reset({
      ...getDefaultValues(),
      ...company,
      companyTypeId: String(company?.companyTypeId),
      industryId: String(company?.industryId),
      subIndustryId: String(company?.subIndustryId),
      subSubIndustryId: String(company?.subSubIndustryId),
      industryDataId: company?.industryDataId?.map((id) => String(id)) || [],
      panNo: company?.panNo || "",
      gstNo: company?.gstNo || "",
      establishDate: company?.establishDate
        ? String(company.establishDate).slice(0, 10)
        : "",
      units: (company?.units?.length ? company.units : [getEmptyUnit()]).map(
        (u, idx) => {
          setGstAndPanData((prev) => ({
            ...prev,
            [idx]: { gstNo: u.gstNo || "", panNo: u.panNo || "" },
          }));

          return {
            ...getEmptyUnit(),
            ...u,
            gstNo: u?.gstNo || "",
            companyTypeId: u?.companyTypeId ? String(u.companyTypeId) : "",
            gstTypeId: u?.gstRegistrationTypeId
              ? String(u.gstRegistrationTypeId)
              : "",
            gstBusinessTypeId: u?.gstBusinessTypeId
              ? String(u.gstBusinessTypeId)
              : "",
            unitOpeningDate: u?.unitOpeningDate
              ? String(u.unitOpeningDate).slice(0, 10)
              : "",
          };
        },
      ),
    });
  }, [company, reset, dispatch]);

  const onSubmit = (values) => {
    setStatusLoading("pending");
    values.leadCompanyId = company?.id;

    dispatch(
      updateFullCompanyDetailsInLeads({
        companyId: company?.id,
        updatedBy: userId,
        data: values,
      }),
    )
      .then((resp) => {
        if (resp.meta.requestStatus === "fulfilled") {
          setStatusLoading("success");

          addToast({
            title: "Compamy detail updated successfully in leads !.",
            color: "success",
          });

          onClose();

          dispatch(
            getAllEstimateByUserId({
              userId,
              page: filteration?.page,
              size: filteration?.size,
            }),
          );

          dispatch(
            getTotalCountOfEstimate({
              userId,
              data: {
                search: filters.search || "",
                status: filters.status || "",
                fromDate: filters.fromDate || "",
                toDate: filters.toDate || "",
              },
            }),
          );
        } else {
          setStatusLoading("rejected");
          addToast({ title: resp.payload.data.message, color: "danger" });
        }
      })
      .catch(() => {
        setStatusLoading("rejected");
        addToast({ title: "Something went wrong !.", color: "danger" });
      });
  };

  const cardHeadStyle = {
    borderBottom: "1px solid #e5e7eb",
    background: "linear-gradient(90deg, #f8fafc 0%, #ffffff 100%)",
    padding: "16px 20px",
  };

  const cardBodyStyle = {
    padding: 20,
  };

  return (
    <>
      {statusLoading === "pending" && <LoadingSpinner />}

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="mx-auto flex w-full max-w-[1600px] flex-col gap-5"
      >
        <Card
          className="overflow-visible rounded-2xl border border-slate-200 shadow-sm"
          styles={{ header: cardHeadStyle, body: cardBodyStyle }}
          title={
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="m-0 text-base font-bold text-slate-900">
                  Company Details
                </h2>
                <p className="mt-1 mb-0 text-xs text-slate-500">
                  Basic identity, incorporation, industry and document details.
                </p>
              </div>

              <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-[11px] font-semibold text-slate-600">
                Step 1
              </span>
            </div>
          }
        >
          <div className="grid grid-cols-1 gap-x-5 gap-y-4 md:grid-cols-2 xl:grid-cols-3">
            <Controller
              name="name"
              control={control}
              render={({ field, fieldState: { error } }) => (
                <Input
                  label="Company name"
                  isReadOnly
                  isRequired
                  value={field?.value}
                  onChange={(e) => field.onChange(e.target.value)}
                  errorMessage={error?.message}
                  isInvalid={!!error}
                />
              )}
            />

            <Controller
              name="establishDate"
              control={control}
              render={({ field, fieldState: { error } }) => (
                <DatePicker
                  isRequired
                  label="Company incorporate date"
                  maxValue={dayjs()}
                  errorMessage={error?.message}
                  isInvalid={!!error}
                  value={
                    field.value && /^\d{4}-\d{2}-\d{2}$/.test(field.value)
                      ? dayjs(field.value)
                      : null
                  }
                  onChange={(value) => {
                    const iso = value ? value.format("YYYY-MM-DD") : "";
                    field.onChange(iso);
                  }}
                />
              )}
            />

            <Controller
              name="companyAge"
              control={control}
              render={({ field, fieldState: { error } }) => (
                <Input
                  label="Company age"
                  isRequired
                  value={field?.value}
                  maxLength={4}
                  errorMessage={error?.message}
                  isInvalid={!!error}
                  onChange={(e) =>
                    field.onChange(allowOnlyNumbers(e.target.value))
                  }
                />
              )}
            />

            <Controller
              name="companyTypeId"
              control={control}
              render={({ field, fieldState: { error } }) => (
                <NewSelect
                  label="Company Structure"
                  data={companyTypeList || []}
                  labelKey="name"
                  valueKey="id"
                  isRequired
                  value={field.value}
                  isInvalid={!!error}
                  errorMessage={error?.message}
                  onChange={(value) => field.onChange(value)}
                />
              )}
            />

            <Controller
              name="revenue"
              control={control}
              render={({ field, fieldState: { error } }) => (
                <Input
                  label="Company revenue (in rupees)"
                  isRequired
                  value={field?.value}
                  startContent={<IndianRupee className="h-4 w-4" />}
                  errorMessage={error?.message}
                  isInvalid={!!error}
                  onChange={(e) =>
                    field.onChange(allowOnlyNumbers(e.target.value))
                  }
                />
              )}
            />

            <Controller
              name="rating"
              control={control}
              render={({ field, fieldState: { error } }) => (
                <Select
                  label="Rating"
                  isRequired
                  errorMessage={error?.message}
                  isInvalid={!!error}
                  selectedKeys={[field.value]}
                  onSelectionChange={(e) => field.onChange(Array.from(e)[0])}
                  items={[
                    { label: "Gold", key: "Gold" },
                    { label: "Silver", key: "Silver" },
                    { label: "Bronze", key: "Bronze" },
                  ]}
                />
              )}
            />

            <Controller
              name="panNo"
              control={control}
              render={({ field, fieldState: { error } }) => (
                <Input
                  label="Pan number"
                  isRequired
                  maxLength={10}
                  value={field.value}
                  errorMessage={error?.message || panError}
                  isInvalid={!!error || !!panError}
                  onChange={(e) => handlePanChange(e)}
                />
              )}
            />

            <Controller
              name="industryId"
              control={control}
              render={({ field, fieldState: { error } }) => (
                <NewSelect
                  isRequired
                  label="Select industry"
                  errorMessage={error?.message}
                  isInvalid={!!error}
                  data={allIndustry || []}
                  labelKey="name"
                  valueKey="id"
                  value={String(field.value)}
                  onChange={(value) => {
                    const finalValue = String(value || "");

                    field.onChange(finalValue);
                    clearErrors("industryId");

                    setValue("subIndustryId", "", {
                      shouldValidate: false,
                      shouldDirty: true,
                    });

                    setValue("subSubIndustryId", "", {
                      shouldValidate: false,
                      shouldDirty: true,
                    });

                    setValue("industryDataId", [], {
                      shouldValidate: false,
                      shouldDirty: true,
                    });

                    clearErrors([
                      "subIndustryId",
                      "subSubIndustryId",
                      "industryDataId",
                    ]);

                    dispatch(getSubIndustryByIndustryId(finalValue));
                  }}
                />
              )}
            />

            <Controller
              name="subIndustryId"
              control={control}
              render={({ field, fieldState: { error } }) => (
                <NewSelect
                  isRequired
                  label="Select sub industry"
                  errorMessage={error?.message}
                  isInvalid={!!error}
                  data={subIndustryListById || []}
                  labelKey="name"
                  valueKey="id"
                  value={field.value}
                  onChange={(value) => {
                    const finalValue = String(value || "");

                    field.onChange(finalValue);
                    clearErrors("subIndustryId");

                    setValue("subSubIndustryId", "", {
                      shouldValidate: false,
                      shouldDirty: true,
                    });

                    setValue("industryDataId", [], {
                      shouldValidate: false,
                      shouldDirty: true,
                    });

                    clearErrors(["subSubIndustryId", "industryDataId"]);

                    dispatch(getSubSubIndustryBySubIndustryId(finalValue));
                  }}
                />
              )}
            />

            <Controller
              name="subSubIndustryId"
              control={control}
              render={({ field, fieldState: { error } }) => (
                <NewSelect
                  label="Select category"
                  isRequired
                  errorMessage={error?.message}
                  isInvalid={!!error}
                  data={subSubIndustryListById || []}
                  labelKey="name"
                  valueKey="id"
                  value={field.value}
                  onChange={(value) => {
                    const finalValue = String(value || "");

                    field.onChange(finalValue);
                    clearErrors("subSubIndustryId");

                    setValue("industryDataId", [], {
                      shouldValidate: false,
                      shouldDirty: true,
                    });

                    clearErrors("industryDataId");

                    dispatch(getIndustryDataBySubSubIndustryId(finalValue));
                  }}
                />
              )}
            />

            <Controller
              name="industryDataId"
              control={control}
              render={({ field, fieldState: { error } }) => (
                <NewSelect
                  label="Select business activity"
                  isRequired
                  selectionMode="multiple"
                  errorMessage={error?.message}
                  isInvalid={!!error}
                  data={industryDataListById || []}
                  labelKey="name"
                  valueKey="id"
                  value={field.value || []}
                  onChange={(value) => {
                    const finalValue = Array.isArray(value)
                      ? value.map((item) => String(item))
                      : [];

                    field.onChange(finalValue);

                    if (finalValue.length > 0) {
                      clearErrors("industryDataId");
                    }
                  }}
                />
              )}
            />

            <Controller
              name="companyFileUrl"
              control={control}
              render={({ field, fieldState: { error } }) => (
                <SingleFileUploader
                  label="Company incorporate document"
                  value={field.value}
                  onChange={(value) => field.onChange(value)}
                  errorMessage={error?.message}
                  isInvalid={!!error}
                />
              )}
            />

            <Controller
              name="aggrementPresent"
              control={control}
              render={({ field, fieldState: { error } }) => (
                <Select
                  label="Agreement"
                  isRequired
                  errorMessage={error?.message}
                  isInvalid={!!error}
                  selectedKeys={[String(field.value)]}
                  onSelectionChange={(keys) => {
                    const v = Array.from(keys)[0];
                    field.onChange(v === "true");
                    setFormCondition((prev) => ({
                      ...prev,
                      aggrementPresent: v === "true",
                    }));
                  }}
                >
                  <SelectItem key="true">Yes</SelectItem>
                  <SelectItem key="false">No</SelectItem>
                </Select>
              )}
            />

            {formCondition?.aggrementPresent && (
              <Controller
                name="agreementFileUrl"
                control={control}
                render={({ field, fieldState: { error } }) => (
                  <SingleFileUploader
                    label="Agreement document"
                    isRequired
                    value={field.value}
                    onChange={(value) => field.onChange(value)}
                    errorMessage={error?.message}
                    isInvalid={!!error}
                  />
                )}
              />
            )}

            <Controller
              name="ndaPresent"
              control={control}
              render={({ field, fieldState: { error } }) => (
                <Select
                  label="NDA"
                  isRequired
                  errorMessage={error?.message}
                  isInvalid={!!error}
                  selectedKeys={[String(field.value)]}
                  onSelectionChange={(keys) => {
                    const v = Array.from(keys)[0];
                    field.onChange(v === "true");
                    setFormCondition((prev) => ({
                      ...prev,
                      ndaPresent: v === "true",
                    }));
                  }}
                >
                  <SelectItem key="true">Yes</SelectItem>
                  <SelectItem key="false">No</SelectItem>
                </Select>
              )}
            />

            {formCondition?.ndaPresent && (
              <Controller
                name="ndaFileUrl"
                control={control}
                render={({ field, fieldState: { error } }) => (
                  <SingleFileUploader
                    label="NDA document"
                    isRequired
                    value={field.value}
                    onChange={(value) => field.onChange(value)}
                    errorMessage={error?.message}
                    isInvalid={!!error}
                  />
                )}
              />
            )}
          </div>
        </Card>

        <Card
          className="overflow-visible rounded-2xl border border-slate-200 shadow-sm"
          styles={{ header: cardHeadStyle, body: cardBodyStyle }}
          title={
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="m-0 text-base font-bold text-slate-900">
                  Registered Address
                </h2>
                <p className="mt-1 mb-0 text-xs text-slate-500">
                  Company address used for billing and statutory records.
                </p>
              </div>

              <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-[11px] font-semibold text-slate-600">
                Step 2
              </span>
            </div>
          }
        >
          <div className="grid grid-cols-1 gap-x-5 gap-y-4 md:grid-cols-2 xl:grid-cols-3">
            <Controller
              name="address"
              control={control}
              render={({ field, fieldState: { error } }) => (
                <Input
                  label="Address"
                  isRequired
                  errorMessage={error?.message}
                  isInvalid={!!error}
                  {...field}
                />
              )}
            />

            <Controller
              name="country"
              control={control}
              render={({ field, fieldState: { error } }) => (
                <NewSelect
                  label="Country"
                  isRequired
                  errorMessage={error?.message}
                  isInvalid={!!error}
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
              control={control}
              render={({ field, fieldState: { error } }) => (
                <NewSelect
                  label="State"
                  isRequired
                  errorMessage={error?.message}
                  isInvalid={!!error}
                  data={statesList || []}
                  labelKey="name"
                  valueKey="name"
                  value={field.value}
                  onChange={(value) => {
                    handleStateChange(value);
                    field.onChange(value);
                  }}
                />
              )}
            />

            <Controller
              name="city"
              control={control}
              render={({ field, fieldState: { error } }) => (
                <NewSelect
                  label="City"
                  isRequired
                  errorMessage={error?.message}
                  isInvalid={!!error}
                  data={citiesList || []}
                  labelKey="name"
                  valueKey="name"
                  value={field.value}
                  onChange={(value) => field.onChange(value)}
                />
              )}
            />

            <Controller
              name="primaryPinCode"
              control={control}
              render={({ field, fieldState: { error } }) => (
                <Input
                  label="Pin code"
                  isRequired
                  maxLength={6}
                  errorMessage={error?.message}
                  isInvalid={!!error}
                  value={field.value}
                  onChange={(e) =>
                    field.onChange(allowOnlyNumbers(e.target.value, 6))
                  }
                />
              )}
            />
          </div>
        </Card>

        <Card
          className="overflow-visible rounded-2xl border border-slate-200 shadow-sm"
          styles={{ header: cardHeadStyle, body: cardBodyStyle }}
          title={
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="m-0 text-base font-bold text-slate-900">
                  Unit Details
                </h2>
                <p className="mt-1 mb-0 text-xs text-slate-500">
                  GST type, unit registration and unit-wise address information.
                </p>
              </div>

              <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-[11px] font-semibold text-slate-600">
                Step 3
              </span>
            </div>
          }
        >
          <div className="space-y-5">
            {fields.map((item, index) => {
              const unitCountry = watch(`units.${index}.country`);
              const unitState = watch(`units.${index}.state`);
              const selectedGstTypeId = watch(`units.${index}.gstTypeId`);

              const isInternationalSelected =
                isInternationalGstType(selectedGstTypeId);

              const isNonInternationalGstSelected =
                hasSelectedGstType(selectedGstTypeId) &&
                !isInternationalSelected;

              const unitCountryList = isInternationalSelected
                ? removeIndiaFromCountryList(countryList || [])
                : countryList || [];

              const selectedGstType = gstTypeList?.find(
                (gst) => String(gst.id) === String(selectedGstTypeId),
              );

              const isRegisteredGstType =
                selectedGstType?.name?.trim()?.toLowerCase() === "registered";

              const unitStatesList = statesByCountry?.[unitCountry] || [];
              const unitCitiesList = citiesByState?.[unitState] || [];

              return (
                <div
                  key={item.id}
                  className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4 shadow-sm"
                >
                  <div className="mb-4 flex items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3">
                    <div>
                      <p className="m-0 text-sm font-bold text-slate-900">
                        Unit #{index + 1}
                      </p>
                      <p className="mt-0.5 mb-0 text-[11px] font-medium text-slate-500">
                        Registration and address details
                      </p>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-white p-4">
                    <div className="mb-4 flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-blue-600" />
                      <p className="m-0 text-xs font-bold uppercase tracking-wide text-slate-600">
                        Unit Registration
                      </p>
                    </div>

                    <div className="grid grid-cols-1 gap-x-5 gap-y-4 md:grid-cols-2 xl:grid-cols-3">
                      <Controller
                        control={control}
                        name={`units.${index}.unitName`}
                        render={({ field, fieldState: { error } }) => (
                          <Input
                            label="Unit Name"
                            isRequired
                            value={field.value}
                            onChange={(e) => field.onChange(e.target.value)}
                            errorMessage={error?.message}
                            isInvalid={!!error}
                          />
                        )}
                      />

                      <Controller
                        name={`units.${index}.gstTypeId`}
                        control={control}
                        render={({ field, fieldState: { error } }) => (
                          <NewSelect
                            label="GST Type"
                            isRequired
                            data={gstTypeList || []}
                            labelKey="name"
                            valueKey="id"
                            value={String(field.value || "")}
                            isInvalid={!!error}
                            errorMessage={error?.message}
                            onChange={(value) => {
                              const finalValue = String(value || "");

                              field.onChange(finalValue);
                              clearErrors(`units.${index}.gstTypeId`);

                              const selected = gstTypeList?.find(
                                (gst) => String(gst.id) === finalValue,
                              );

                              const selectedName = selected?.name
                                ?.trim()
                                ?.toLowerCase();

                              const isRegistered =
                                selectedName === "registered";
                              const isInternational =
                                selectedName === "international";

                              if (!isRegistered) {
                                setValue(`units.${index}.gstNo`, "", {
                                  shouldValidate: false,
                                  shouldDirty: true,
                                });

                                clearErrors(`units.${index}.gstNo`);
                              }

                              if (isInternational) {
                                const currentCountry = watch(
                                  `units.${index}.country`,
                                );

                                if (
                                  currentCountry?.trim()?.toLowerCase() ===
                                  "india"
                                ) {
                                  setValue(`units.${index}.country`, "", {
                                    shouldValidate: false,
                                    shouldDirty: true,
                                  });

                                  setValue(`units.${index}.state`, "", {
                                    shouldValidate: false,
                                    shouldDirty: true,
                                  });

                                  setValue(`units.${index}.city`, "", {
                                    shouldValidate: false,
                                    shouldDirty: true,
                                  });

                                  clearErrors([
                                    `units.${index}.country`,
                                    `units.${index}.state`,
                                    `units.${index}.city`,
                                  ]);
                                }

                                return;
                              }

                              if (finalValue) {
                                setValue(`units.${index}.country`, "India", {
                                  shouldValidate: true,
                                  shouldDirty: true,
                                });

                                setValue(`units.${index}.state`, "", {
                                  shouldValidate: false,
                                  shouldDirty: true,
                                });

                                setValue(`units.${index}.city`, "", {
                                  shouldValidate: false,
                                  shouldDirty: true,
                                });

                                clearErrors(`units.${index}.country`);

                                dispatch(getAllStatesByCountryName("India"));
                              }
                            }}
                          />
                        )}
                      />

                      {isRegisteredGstType && (
                        <Controller
                          control={control}
                          name={`units.${index}.gstNo`}
                          render={({ field, fieldState: { error } }) => (
                            <Input
                              label="GST No"
                              isRequired
                              value={field.value || ""}
                              onChange={(e) => {
                                handleGstChange(e, `units.${index}.gstNo`);
                              }}
                              errorMessage={error?.message}
                              isInvalid={!!error}
                            />
                          )}
                        />
                      )}

                      <Controller
                        control={control}
                        name={`units.${index}.unitOpeningDate`}
                        render={({ field, fieldState: { error } }) => (
                          <DatePicker
                            isRequired
                            label="Unit Opening Date"
                            maxValue={dayjs()}
                            errorMessage={error?.message}
                            isInvalid={!!error}
                            value={
                              field.value &&
                              /^\d{4}-\d{2}-\d{2}$/.test(field.value)
                                ? dayjs(field.value)
                                : null
                            }
                            onChange={(value) => {
                              const iso = value
                                ? value.format("YYYY-MM-DD")
                                : "";
                              field.onChange(iso);
                            }}
                          />
                        )}
                      />
                    </div>
                  </div>

                  <div className="mt-3 rounded-2xl border border-slate-200 bg-white p-4">
                    <div className="mb-4 flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-blue-600" />
                      <p className="m-0 text-xs font-bold uppercase tracking-wide text-slate-600">
                        Unit Address
                      </p>
                    </div>

                    <div className="grid grid-cols-1 gap-x-5 gap-y-4 md:grid-cols-2 xl:grid-cols-3">
                      <Controller
                        control={control}
                        name={`units.${index}.addressLine1`}
                        render={({ field, fieldState: { error } }) => (
                          <Input
                            isRequired
                            label="Address Line 1"
                            value={field.value}
                            onChange={(e) => field.onChange(e.target.value)}
                            errorMessage={error?.message}
                            isInvalid={!!error}
                          />
                        )}
                      />

                      <Controller
                        name={`units.${index}.country`}
                        control={control}
                        render={({ field, fieldState: { error } }) => (
                          <NewSelect
                            isRequired
                            label="Country"
                            errorMessage={error?.message}
                            isInvalid={!!error}
                            data={unitCountryList}
                            labelKey="name"
                            valueKey="name"
                            value={field.value}
                            isDisabled={isNonInternationalGstSelected}
                            onChange={(value) => {
                              dispatch(getAllStatesByCountryName(value));
                              field.onChange(value);
                            }}
                          />
                        )}
                      />

                      <Controller
                        name={`units.${index}.state`}
                        control={control}
                        render={({ field, fieldState: { error } }) => (
                          <NewSelect
                            isRequired
                            label="State"
                            errorMessage={error?.message}
                            isInvalid={!!error}
                            data={unitStatesList || []}
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
                        name={`units.${index}.city`}
                        control={control}
                        render={({ field, fieldState: { error } }) => (
                          <NewSelect
                            label="City"
                            isRequired
                            errorMessage={error?.message}
                            isInvalid={!!error}
                            data={unitCitiesList || []}
                            labelKey="name"
                            valueKey="name"
                            value={field.value}
                            onChange={(value) => field.onChange(value)}
                          />
                        )}
                      />

                      <Controller
                        control={control}
                        name={`units.${index}.pinCode`}
                        render={({ field, fieldState: { error } }) => (
                          <Input
                            isRequired
                            label="Pin Code"
                            value={field.value}
                            onChange={(e) =>
                              field.onChange(allowOnlyNumbers(e.target.value))
                            }
                            errorMessage={error?.message}
                            isInvalid={!!error}
                          />
                        )}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        <div className="sticky bottom-0 z-20 flex items-center justify-end gap-3 border-t border-slate-200 bg-white/95 px-5 py-4 shadow-[0_-8px_24px_rgba(0,0,0,0.04)] backdrop-blur">
          {onCancel && (
            <ButtonWrapper
              htmlType="button"
              variant="light"
              className="min-w-[110px] cursor-pointer font-medium"
              onPress={onCancel}
            >
              Cancel
            </ButtonWrapper>
          )}

          <ButtonWrapper
            htmlType="submit"
            color="primary"
            isLoading={isSubmitting}
            className="min-w-[150px] cursor-pointer font-semibold shadow-sm"
          >
            Save Company
          </ButtonWrapper>
        </div>
      </form>
    </>
  );
}
