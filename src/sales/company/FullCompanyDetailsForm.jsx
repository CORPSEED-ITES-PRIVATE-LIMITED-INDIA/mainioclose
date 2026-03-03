import { memo, useEffect, useMemo, useState } from "react";
import { useForm, Controller, useFieldArray } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  Input,
  Textarea,
  Button,
  Card,
  CardHeader,
  CardBody,
  Divider,
  Switch,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  Select,
  SelectItem,
  addToast,
  DatePicker,
} from "@heroui/react";
import { useDispatch, useSelector } from "react-redux";
import NewSelect from "../../components/NewSelect";
import SingleFileUploader from "../../components/SingleFileUploader";
import { formatGSTInput, formatPANInput } from "../../common";
import {
  getAllCitiesByStateName,
  getAllContactDetails,
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
  getAllGstTypeByCompanyTypeId,
  getBusinessTypeByGstTypeId,
  updateFullCompanyDetailsInAccounts,
  updateFullCompanyDetailsInLeads,
} from "../../toolkit/slices/companySlice";
import { getClientDesiginationList } from "../../toolkit/slices/settingSlice";
import {
  getAllEstimateByUserId,
  getTotalCountOfEstimate,
} from "../../toolkit/slices/leadSlice";
import {
  getLocalTimeZone,
  parseDate,
  toCalendarDate,
  today,
} from "@internationalized/date";
import { useParams } from "react-router-dom";

// ✅ your custom components
// import NewSelect from ".../NewSelect";
// import SingleFileUploader from ".../SingleFileUploader";

/* -----------------------------
 * Zod Schemas
 * ---------------------------- */
const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
const gstRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;

// NOTE: I added the new fields you showed (companyType, gstType, businessType, files, contact fields etc.)
const unitSchema = z.object({
  id: z.coerce.number().optional().default(0),
  unitName: z.string().min(1, "Unit name is required"),
  addressLine1: z.string().min(1, "Address Line 1 is required"),
  addressLine2: z.string().optional().default(""),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  country: z.string().min(1, "Country is required"),
  pinCode: z
    .string()
    .min(4, "Pin code is required")
    .max(10, "Invalid pin code"),
  gstNo: z
    .string()
    .optional()
    .default("")
    .refine((v) => !v || gstRegex.test(v), "Invalid GST format"),
  unitOpeningDate: z
    .string()
    .optional()
    .default("")
    .refine((v) => !v || !Number.isNaN(Date.parse(v)), "Invalid date"),
  status: z.string().optional().default(""),
  consultantPresent: z.coerce.boolean().optional().default(false),

  // optional numeric ids
  companyTypeId: z.coerce.number().default(0),
  gstTypeId: z.coerce.number().optional().default(0),
  gstBusinessTypeId: z.coerce.number().optional().default(0),
  gstTypePriceId: z.coerce.number().optional().default(0),
  primaryContactId: z.coerce.number().optional().default(0),
  secondaryContactId: z.coerce.number().optional().default(0),
});

const companySchema = z.object({
  // company basics
  name: z.string().min(1, "Company name is required"),
  panNo: z.string().optional(),
  assigneeId: z.coerce.number().optional().default(0),
  // industry chain
  industryId: z.coerce.number().optional().default(0),
  subIndustryId: z.coerce.number().optional().default(0),
  subsubIndustryId: z.coerce.number().optional().default(0),
  industrydataId: z.any().optional().default([]), // selectionMode multiple

  // uploads
  companyFileUrl: z.string().optional().default(""),
  agreementFileUrl: z.string().optional().default(""),
  ndaFileUrl: z.string().optional().default(""),

  // payment/flags
  paymentTerm: z.string().optional().default(""),
  aggrementPresent: z.coerce.boolean().optional().default(true),
  ndaPresent: z.coerce.boolean().optional().default(true),

  // contact fields
  primaryTitle: z.string().optional().default(""),
  contactName: z.string().optional().default(""),
  primaryDesignation: z.coerce.number().optional().default(0),
  contactEmails: z.string().optional().default(""),
  contactNo: z.string().optional().default(""),
  contactWhatsappNo: z.string().optional().default(""),

  // address (company)
  address: z.string().optional().default(""),
  country: z.string().optional().default("India"),
  state: z.string().optional().default(""),
  city: z.string().optional().default(""),
  primaryPinCode: z.string().optional().default(""),

  // existing fields (keep if you need)
  rating: z.string().optional().default(""),
  companyAge: z.string().optional().default(""),
  establishDate: z
    .string()
    .optional()
    .default("")
    .refine((v) => !v || !Number.isNaN(Date.parse(v)), "Invalid date"),
  revenue: z.string().optional().default(""),
  units: z.array(unitSchema).min(1, "At least one unit is required"),
});

const getEmptyUnit = () => ({
  id: 0,
  unitName: "",
  gstNo: "",
  companyTypeId: 0,
  gstTypeId: 0,
  gstBusinessTypeId: 0,
  gstTypePriceId: 0,
  addressLine1: "",
  addressLine2: "",
  city: "",
  state: "",
  country: "India",
  pinCode: "",
  unitOpeningDate: "",
  consultantPresent: true,
});

const getDefaultValues = () => ({
  name: "",
  gstNo: "",
  panNo: "",
  companyType: 0,
  gstType: 0,
  businessType: 0,
  assigneeId: 0,

  industryId: 0,
  subIndustryId: 0,
  subsubIndustryId: 0,
  industrydataId: [],

  companyFileUrl: "",
  paymentTerm: "",
  aggrementPresent: true,
  agreementFileUrl: "",
  ndaPresent: true,
  ndaFileUrl: "",

  primaryTitle: "",
  contactName: "",
  primaryDesignation: 0,
  contactEmails: "",
  contactNo: "",
  contactWhatsappNo: "",

  address: "",
  country: "India",
  state: "",
  city: "",
  primaryPinCode: "",

  rating: "",
  companyAge: "",
  establishDate: "",
  revenue: "",
  stage: "",
  status: "",
  isConsultant: true,
  actualClientCompanyId: 0,

  units: [getEmptyUnit()],
});

/* =========================================================
 * 1) MODAL WRAPPER (Reusable)
 * ========================================================= */
const FullCompanyDetailsForm = ({
  modalTitle = "Create / Edit Company",
  isOpen,
  onOpenChange,
  filteration,
}) => {
  return (
    <>
      <Modal
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        size="full"
        scrollBehavior="inside"
        placement="center"
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                <div className="text-base font-bold">{modalTitle}</div>
                <div className="text-xs text-default-500">
                  Fill company details and add units.
                </div>
              </ModalHeader>

              <Divider />

              <ModalBody className="py-5">
                <CompanyAndUnitsForm
                  onClose={onClose}
                  onCancel={onClose}
                  filteration={filteration}
                />
              </ModalBody>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
};

export default memo(FullCompanyDetailsForm);

export function CompanyAndUnitsForm({ onCancel, onClose, filteration }) {
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
  const statesList = useSelector((state) => state.common.statesList);
  const citiesList = useSelector((state) => state.common.citiesList);
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
  const company = useSelector((state) => state.company.basicCompanyDetail);

  const [gstAndPanData, setGstAndPanData] = useState({});

  const {
    control,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting },
    setValue,
  } = useForm({
    resolver: zodResolver(companySchema),
    mode: "onChange",
    defaultValues,
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "units",
  });

  // ✅ your conditional UI flag (as in snippet)

  const [panError, setPanError] = useState("");
  const [gstError, setGstError] = useState("");
  const aggrementPresent = watch("aggrementPresent");
  const ndaPresent = watch("ndaPresent");
  const state = watch("state");
  const gstNo = watch("gstNo");
  const isConsultant = watch("isConsultant");

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

  const handleGstChange = (e) => {
    const rawValue = e.target.value;
    const formattedValue = formatGSTInput(rawValue);
    setValue("gstNo", formattedValue);
    // const error = validateGST(formattedValue, state);
    // setGstError(error);
  };

  const handleStateChange = (stateName) => {
    setValue("state", stateName);
    dispatch(getAllCitiesByStateName(stateName));
    // const error = validateGST(gstNo, stateName);
    // setGstError(error);
  };

  useEffect(() => {
    dispatch(getAllCompanyType());
    dispatch(getAllUsers());
    dispatch(getAllMainIndustry());
    dispatch(getClientDesiginationList());
    dispatch(getAllContactDetails());
    dispatch(getAllCountries());
  }, [dispatch]);

  // Prefill

  console.log("sdkljhghghghghghghghghghghghghghgj", company);

  useEffect(() => {
    if (!company) return;

    if (company?.country) {
      dispatch(getAllStatesByCountryName(company?.country));
    }
    if (company?.state) {
      dispatch(getAllCitiesByStateName(company?.state));
    }
    if (company?.industryId) {
      dispatch(getSubIndustryByIndustryId(company?.industryId));
    }
    if (company?.subIndustryId) {
      dispatch(getSubSubIndustryBySubIndustryId(company?.subIndustryId));
    }
    if (company?.subsubIndustryId) {
      dispatch(getIndustryDataBySubSubIndustryId(company?.subsubIndustryId));
    }
    reset({
      ...getDefaultValues(),
      ...company,
      assigneeId: String(company?.assigneeId),
      ndaPresent: String(company?.ndaPresent),
      industryId: String(company?.industryId),
      panNo: company?.panNo || "",
      gstNo: company?.gstNo || "",
      establishDate: company?.establishDate
        ? String(company.establishDate).slice(0, 10)
        : "",
      units: (company?.units?.length ? company.units : [getEmptyUnit()]).map(
        (u) => ({
          ...getEmptyUnit(),
          ...u,
          gstNo: u?.gstNo || "",
          unitOpeningDate: u?.unitOpeningDate
            ? String(u.unitOpeningDate).slice(0, 10)
            : "",
        }),
      ),
    });
  }, [company, reset]);

  const onSubmit = (values) => {
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
          addToast({
            title: "Compamy detail updated successfully in leads !.",
            color: "success",
          });
          dispatch(
            updateFullCompanyDetailsInAccounts({
              companyId: company?.id,
              updatedBy: userId,
              data: values,
            }),
          )
            .then((res) => {
              if (res.meta.requestStatus === "fulfilled") {
                onClose();
                addToast({
                  title: "Compamy detail updated successfully !.",
                  color: "success",
                });
                dispatch(
                  getAllEstimateByUserId({
                    userId,
                    page: filteration?.page,
                    size: filteration?.size,
                  }),
                );
                dispatch(getTotalCountOfEstimate(userId));
              } else {
                addToast({ title: res.payload.data.message, color: "danger" });
              }
            })
            .catch(() =>
              addToast({ title: "Something went wrong !.", color: "danger" }),
            );
        } else {
          addToast({ title: resp.payload.data.message, color: "danger" });
        }
      })
      .catch(() =>
        addToast({ title: "Something went wrong !.", color: "danger" }),
      );
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="mx-auto flex w-full flex-col gap-6"
    >
      {/* ================= Company Details ================= */}
      <Card className="border border-default-200 shadow-sm">
        <CardHeader className="flex flex-col items-start gap-1">
          <h2 className="text-base font-bold">Company Details</h2>
          <p className="text-xs text-default-500">
            This section matches your existing form pattern (errorMessage prop).
          </p>
        </CardHeader>
        <CardBody className="space-y-5">
          {/* Company Structure / GST Type / Business Type */}
          <div className="grid grid-cols-3 gap-8">
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
                />
              )}
            />

            <Controller
              name="companyAge"
              control={control}
              render={({ field, fieldState: { error } }) => (
                <Input
                  label="Company age"
                  value={field?.value}
                  onChange={(e) => field.onChange(e.target.value)}
                />
              )}
            />

            <Controller
              name="establishDate"
              control={control}
              render={({ field, fieldState: { error } }) => (
                <DatePicker
                  label="Company incorporate date"
                  showMonthAndYearPickers
                  maxValue={today(getLocalTimeZone())}
                  errorMessage={error?.message}
                  isInvalid={!!error}
                  value={field.value ? parseDate(field.value) : null}
                  onChange={(e) => field.onChange(toCalendarDate(e).toString())}
                />
              )}
            />

            <Controller
              name="revenue"
              control={control}
              render={({ field, fieldState: { error } }) => (
                <Input
                  label="Company revenue"
                  value={field?.value}
                  onChange={(e) => field.onChange(e.target.value)}
                />
              )}
            />

            <Controller
              name="rating"
              control={control}
              render={({ field, fieldState: { error } }) => (
                <Select
                  label="Rating"
                  errorMessage={error?.message}
                  isInvalid={!!error}
                  selectedKeys={[field.value]}
                  onSelectionChange={(e) => field.onChange(Array.from(e)[0])}
                  items={[
                    { label: "Gold", key: "Gold" },
                    { label: "Silver", key: "Silver" },
                    { label: "Bronze", key: "Bronze" },
                  ]}
                >
                  {(item) => (
                    <SelectItem key={item.key}>{item.label}</SelectItem>
                  )}
                </Select>
              )}
            />

            <Controller
              name="panNo"
              control={control}
              render={({ field, fieldState: { error } }) => (
                <Input
                  label="Pan number"
                  maxLength={10}
                  value={field.value}
                  errorMessage={error?.message || panError}
                  isInvalid={!!error || !!panError}
                  onChange={(e) => {
                    handlePanChange(e);
                  }}
                />
              )}
            />

            {/* Assignee (Admin only) */}
            {adminRole && (
              <Controller
                name="assigneeId"
                control={control}
                render={({ field, fieldState: { error } }) => (
                  <NewSelect
                    label="Select assignee"
                    errorMessage={error?.message}
                    isInvalid={!!error}
                    data={allUsers || []}
                    labelKey="fullName"
                    valueKey="id"
                    value={field.value}
                    onChange={(value) => field.onChange(value)}
                  />
                )}
              />
            )}

            {/* Industry chain */}

            <Controller
              name="industryId"
              control={control}
              render={({ field, fieldState: { error } }) => (
                <NewSelect
                  label="Select industry"
                  errorMessage={error?.message}
                  isInvalid={!!error}
                  data={allIndustry || []}
                  labelKey="name"
                  valueKey="id"
                  value={String(field.value)}
                  onChange={(value) => {
                    dispatch(getSubIndustryByIndustryId(value));
                    field.onChange(value);
                  }}
                />
              )}
            />

            <Controller
              name="subIndustryId"
              control={control}
              render={({ field, fieldState: { error } }) => (
                <NewSelect
                  label="Select sub industry"
                  errorMessage={error?.message}
                  isInvalid={!!error}
                  data={subIndustryListById || []}
                  labelKey="name"
                  valueKey="id"
                  value={field.value}
                  onChange={(value) => {
                    dispatch(getSubSubIndustryBySubIndustryId(value));
                    field.onChange(value);
                  }}
                />
              )}
            />

            <Controller
              name="subsubIndustryId"
              control={control}
              render={({ field, fieldState: { error } }) => (
                <NewSelect
                  label="Select category"
                  errorMessage={error?.message}
                  isInvalid={!!error}
                  data={subSubIndustryListById || []}
                  labelKey="name"
                  valueKey="id"
                  value={field.value}
                  onChange={(value) => {
                    dispatch(getIndustryDataBySubSubIndustryId(value));
                    field.onChange(value);
                  }}
                />
              )}
            />

            <Controller
              name="industrydataId"
              control={control}
              render={({ field, fieldState: { error } }) => (
                <NewSelect
                  label="Select business activity"
                  selectionMode="multiple"
                  errorMessage={error?.message}
                  isInvalid={!!error}
                  data={industryDataListById || []}
                  labelKey="name"
                  valueKey="id"
                  value={field.value}
                  onChange={(value) => field.onChange(value)}
                />
              )}
            />

            <Controller
              name="companyFileUrl"
              control={control}
              render={({ field, fieldState: { error } }) => (
                <SingleFileUploader
                  label="Company document"
                  value={field.value}
                  onChange={(value) => field.onChange(value)}
                  errorMessage={error?.message}
                  isInvalid={!!error}
                />
              )}
            />

            {/* Payment / Agreement / NDA */}

            <Controller
              name="paymentTerm"
              control={control}
              render={({ field, fieldState: { error } }) => (
                <Select
                  label="Payment term"
                  errorMessage={error?.message}
                  isInvalid={!!error}
                  selectedKeys={
                    field.value ? new Set([field.value]) : new Set()
                  }
                  onSelectionChange={(keys) => {
                    const v = Array.from(keys)[0] || "";
                    field.onChange(v);
                  }}
                >
                  {[
                    "Net 30",
                    "Net 60",
                    "Net 90",
                    "2/10 Net 30",
                    "EOM (End of Month)",
                    "COD (Cash on Delivery)",
                    "CIA (Cash in Advance)",
                    "Installments",
                    "Milestone-based",
                    "Due on Receipt",
                  ].map((x) => (
                    <SelectItem key={x}>{x}</SelectItem>
                  ))}
                </Select>
              )}
            />

            <Controller
              name="aggrementPresent"
              control={control}
              render={({ field, fieldState: { error } }) => (
                <Select
                  label="Agreement"
                  errorMessage={error?.message}
                  isInvalid={!!error}
                  selectedKeys={new Set([String(!!field.value)])}
                  onSelectionChange={(keys) => {
                    const v = Array.from(keys)[0];
                    field.onChange(v === "true");
                  }}
                >
                  <SelectItem key="true">Yes</SelectItem>
                  <SelectItem key="false">No</SelectItem>
                </Select>
              )}
            />

            <Controller
              name="ndaPresent"
              control={control}
              render={({ field, fieldState: { error } }) => (
                <Select
                  isRequired
                  label="NDA"
                  errorMessage={error?.message}
                  isInvalid={!!error}
                  selectedKeys={new Set([String(!!field.value)])}
                  onSelectionChange={(keys) => {
                    const v = Array.from(keys)[0];
                    field.onChange(v === "true");
                  }}
                >
                  <SelectItem key="true">Yes</SelectItem>
                  <SelectItem key="false">No</SelectItem>
                </Select>
              )}
            />

            {aggrementPresent && (
              <Controller
                name="agreementFileUrl"
                control={control}
                render={({ field, fieldState: { error } }) => (
                  <SingleFileUploader
                    label="Agreement document"
                    value={field.value}
                    onChange={(value) => field.onChange(value)}
                    errorMessage={error?.message}
                    isInvalid={!!error}
                  />
                )}
              />
            )}

            {ndaPresent && (
              <Controller
                name="ndaFileUrl"
                control={control}
                render={({ field, fieldState: { error } }) => (
                  <SingleFileUploader
                    label="NDA document"
                    value={field.value}
                    onChange={(value) => field.onChange(value)}
                    errorMessage={error?.message}
                    isInvalid={!!error}
                  />
                )}
              />
            )}

            {/* Contact */}
            <Controller
              name="primaryTitle"
              control={control}
              render={({ field, fieldState: { error } }) => (
                <Select
                  label="Salutation"
                  errorMessage={error?.message}
                  isInvalid={!!error}
                  selectedKeys={
                    field.value ? new Set([field.value]) : new Set()
                  }
                  onSelectionChange={(keys) => {
                    const v = Array.from(keys)[0] || "";
                    field.onChange(v);
                  }}
                >
                  <SelectItem key="master">Master.</SelectItem>
                  <SelectItem key="mr">Mr.</SelectItem>
                  <SelectItem key="mrs">Mrs.</SelectItem>
                  <SelectItem key="miss">Miss.</SelectItem>
                </Select>
              )}
            />

            <Controller
              name="contactName"
              control={control}
              render={({ field, fieldState: { error } }) => (
                <Input
                  label="Name"
                  errorMessage={error?.message}
                  isInvalid={!!error}
                  {...field}
                />
              )}
            />

            <Controller
              name="primaryDesignation"
              control={control}
              render={({ field, fieldState: { error } }) => (
                <NewSelect
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
              name="contactEmails"
              control={control}
              render={({ field, fieldState: { error } }) => (
                <Input
                  label="Email"
                  type="email"
                  errorMessage={error?.message}
                  isInvalid={!!error}
                  {...field}
                />
              )}
            />

            <Controller
              name="contactNo"
              control={control}
              render={({ field, fieldState: { error } }) => (
                <Input
                  label="Contact number"
                  errorMessage={error?.message}
                  isInvalid={!!error}
                  {...field}
                />
              )}
            />

            <Controller
              name="contactWhatsappNo"
              control={control}
              render={({ field, fieldState: { error } }) => (
                <Input
                  label="Whatsapp number"
                  errorMessage={error?.message}
                  isInvalid={!!error}
                  {...field}
                />
              )}
            />

            {/* Address */}

            <Controller
              name="address"
              control={control}
              render={({ field, fieldState: { error } }) => (
                <Input
                  label="Address"
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
                  errorMessage={error?.message}
                  isInvalid={!!error}
                  {...field}
                />
              )}
            />
          </div>
        </CardBody>
      </Card>

      {/* ================= Units ================= */}
      <Card className="border border-default-200 shadow-sm">
        <CardHeader className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold">Units</h2>
            <p className="text-xs text-default-500">
              Add one or multiple units. At least one unit required.
            </p>
          </div>

          <Button
            type="button"
            variant="bordered"
            className="cursor-pointer"
            onPress={() => append(getEmptyUnit())}
          >
            + Add Unit
          </Button>
        </CardHeader>

        <Divider />

        <CardBody className="space-y-5">
          {fields.map((item, index) => (
            <div
              key={item.id}
              className="rounded-xl border border-dashed border-default-300 p-4"
            >
              <div className="mb-4 flex items-center justify-between">
                <p className="text-sm font-bold">Unit #{index + 1}</p>

                <Button
                  type="button"
                  color="danger"
                  variant="bordered"
                  className="cursor-pointer"
                  isDisabled={fields.length === 1}
                  onPress={() => remove(index)}
                >
                  Remove
                </Button>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <Controller
                  control={control}
                  name={`units.${index}.unitName`}
                  render={({ field, fieldState: { error } }) => (
                    <Input
                      label="Unit Name"
                      value={field.value}
                      onChange={(e) => field.onChange(e.target.value)}
                      errorMessage={error?.message}
                      isInvalid={!!error}
                    />
                  )}
                />

                {/* UNIT GST STRUCTURE */}
                <Controller
                  name={`units.${index}.companyTypeId`}
                  control={control}
                  render={({ field, fieldState: { error } }) => (
                    <NewSelect
                      label="Company Structure"
                      data={companyTypeList || []}
                      labelKey="name"
                      valueKey="id"
                      value={field.value}
                      errorMessage={error?.message}
                      onChange={(value) => {
                        dispatch(getAllGstTypeByCompanyTypeId(value));
                        field.onChange(value);
                      }}
                    />
                  )}
                />

                <Controller
                  name={`units.${index}.gstTypeId`}
                  control={control}
                  render={({ field }) => (
                    <NewSelect
                      label="GST Type"
                      data={gstTypeList?.gstBussinessType || []}
                      labelKey="name"
                      valueKey="id"
                      value={field.value}
                      onChange={(value) => {
                        dispatch(getBusinessTypeByGstTypeId(value));
                        field.onChange(value);
                      }}
                    />
                  )}
                />

                <Controller
                  name={`units.${index}.gstTypePriceId`}
                  control={control}
                  render={({ field }) => (
                    <NewSelect
                      label="Business Type"
                      data={businessTypeList?.gstTypePrice || []}
                      labelKey="name"
                      valueKey="id"
                      value={field.value}
                      onChange={(value) => {
                        field.onChange(value);

                        const found = businessTypeList?.gstTypePrice?.find(
                          (x) => x.id === value,
                        );

                        setGstAndPanData((prev) => ({
                          ...prev,
                          [index]: {
                            gst: found?.gstPresent || false,
                            pan: found?.panPresent || false,
                          },
                        }));
                      }}
                    />
                  )}
                />

                <Controller
                  control={control}
                  name={`units.${index}.gstNo`}
                  render={({ field, fieldState: { error } }) => (
                    <Input
                      label="GST No"
                      value={field.value}
                      onChange={(e) =>
                        field.onChange((e.target.value || "").toUpperCase())
                      }
                      errorMessage={error?.message}
                      isInvalid={!!error}
                    />
                  )}
                />

                <Controller
                  control={control}
                  name={`units.${index}.unitOpeningDate`}
                  render={({ field, fieldState: { error } }) => (
                    <Input
                      type="date"
                      label="Unit Opening Date"
                      value={field.value}
                      onChange={(e) => field.onChange(e.target.value)}
                      errorMessage={error?.message}
                      isInvalid={!!error}
                    />
                  )}
                />
              </div>

              <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
                <Controller
                  control={control}
                  name={`units.${index}.addressLine1`}
                  render={({ field, fieldState: { error } }) => (
                    <Input
                      label="Address Line 1 *"
                      placeholder="Address line 1"
                      value={field.value}
                      onChange={(e) => field.onChange(e.target.value)}
                      errorMessage={error?.message}
                      isInvalid={!!error}
                    />
                  )}
                />

                <Controller
                  control={control}
                  name={`units.${index}.addressLine2`}
                  render={({ field, fieldState: { error } }) => (
                    <Input
                      label="Address Line 2"
                      placeholder="Address line 2"
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
                      label="Country"
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
                  name={`units.${index}.state`}
                  control={control}
                  render={({ field, fieldState: { error } }) => (
                    <NewSelect
                      label="State"
                      errorMessage={error?.message}
                      isInvalid={!!error}
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
                  name={`units.${index}.city`}
                  control={control}
                  render={({ field, fieldState: { error } }) => (
                    <NewSelect
                      label="City"
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
                  control={control}
                  name={`units.${index}.pinCode`}
                  render={({ field, fieldState: { error } }) => (
                    <Input
                      label="Pin Code *"
                      placeholder="452001"
                      value={field.value}
                      onChange={(e) => field.onChange(e.target.value)}
                      errorMessage={error?.message}
                      isInvalid={!!error}
                    />
                  )}
                />
              </div>
            </div>
          ))}
        </CardBody>
      </Card>

      {/* ================= Actions ================= */}
      <div className="flex items-center justify-end gap-3">
        <Button
          type="button"
          variant="bordered"
          className="cursor-pointer"
          onPress={() => reset(defaultValues)}
        >
          Reset
        </Button>

        {onCancel && (
          <Button
            type="button"
            variant="light"
            className="cursor-pointer"
            onPress={onCancel}
          >
            Cancel
          </Button>
        )}

        <Button
          type="submit"
          color="primary"
          isLoading={isSubmitting}
          className="cursor-pointer"
        >
          Save Company
        </Button>
      </div>
    </form>
  );
}
