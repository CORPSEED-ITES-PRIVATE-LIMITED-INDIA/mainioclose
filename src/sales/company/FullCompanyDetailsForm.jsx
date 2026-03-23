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
import { allowOnlyNumbers, formatGSTInput, formatPANInput } from "../../common";
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
import { IndianRupee } from "lucide-react";

// ✅ your custom components
// import NewSelect from ".../NewSelect";
// import SingleFileUploader from ".../SingleFileUploader";

/* -----------------------------
 * Zod Schemas
 * ---------------------------- */
// NOTE: I added the new fields you showed (companyType, gstType, businessType, files, contact fields etc.)
const unitSchema = z
  .object({
    id: z.coerce.number().optional().default(0),
    unitName: z.string().min(1, "Unit name is required"),
    addressLine1: z.string().min(1, "Address Line 1 is required"),
    city: z.string().min(1, "City is required"),
    state: z.string().min(1, "State is required"),
    country: z.string().min(1, "Country is required"),
    pinCode: z.string().min(1, "Pin code is required"),

    gstNo: z.string().optional(), // 👈 make optional

    unitOpeningDate: z.string().min(1, "please enter date"),
    companyTypeId: z.string().min(1, "please select company type"),
    gstTypeId: z.string().min(1, "please select gst type"),
    gstBusinessTypeId: z.string().min(1, "please select business type"),
  })
  .superRefine((data, ctx) => {
    // 👇 your condition
    const requiresGST = data?.gstRequired; // you must pass this flag

    if (requiresGST && !data.gstNo) {
      ctx.addIssue({
        path: ["gstNo"],
        message: "GST number is required",
        code: z.ZodIssueCode.custom,
      });
    }
  });

const companySchema = (obj) =>
  z.object({
    // company basics
    name: z.string().min(1, "Company name is required."),
    panNo: z.string().min(1, "please give pan number."),
    ...(obj?.adminRole
      ? {
          assigneeId: z.string().min(1, "Please select assignee."),
        }
      : {}),
    // industry chain
    industryId: z.string().min(1, "Please select industry."),
    subIndustryId: z.string().min(1, "Please select sub industry."),
    subsubIndustryId: z.string().min(1, "Please select category."),
    industrydataId: z
      .array(z.string())
      .min(1, "Please select business activity."),

    // uploads
    // companyFileUrl: z.string().min(1, "please upload attachement"),
    companyFileUrl: z.string().optional(),
    ...(obj?.aggrementPresent
      ? { agreementFileUrl: z.string().min(1, "please upload attachement") }
      : {}),
    ...(obj?.ndaPresent
      ? {
          ndaFileUrl: z.string().min(1, "please upload attachement"),
        }
      : {}),
    aggrementPresent: z.boolean(),
    ndaPresent: z.boolean(),
    // address (company)
    address: z.string().min(1, "please enter address."),
    country: z.string().min(1, "please select country."),
    state: z.string().min(1, "please select state."),
    city: z.string().min(1, "please select city."),
    primaryPinCode: z.string().min(1, "please select pin code"),

    // existing fields (keep if you need)
    rating: z.string().min(1, "please select rating"),
    companyAge: z.string().min(1, "please enter company age."),
    establishDate: z.string().min(1, "please enter established date"),
    revenue: z.string().min(1, "please enter revenue"),
    units: z.array(unitSchema).min(1, "At least one unit is required"),
  });

const getEmptyUnit = () => ({
  id: 0,
  unitName: "",
  gstNo: "",
  companyTypeId: "",
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
  assigneeId: "",

  industryId: "",
  subIndustryId: "",
  subsubIndustryId: "",
  industrydataId: [],

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

/* =========================================================
 * 1) MODAL WRAPPER (Reusable)
 * ========================================================= */
const FullCompanyDetailsForm = ({
  modalTitle = "Create / Edit Company",
  isOpen,
  onOpenChange,
  filteration,
  filters,
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
                  filters={filters}
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
  const company = useSelector((state) => state.company.basicCompanyDetail);

  const [gstAndPanData, setGstAndPanData] = useState({});

  const [formCondition, setFormCondition] = useState({
    adminRole,
    aggrementPresent: false,
    ndaPresent: false,
  });

  const [gstTypeMap, setGstTypeMap] = useState({});
  const [businessTypeMap, setBusinessTypeMap] = useState({});

  const {
    control,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting },
    setValue,
  } = useForm({
    resolver: zodResolver(companySchema(formCondition)),
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
  }, [companyAge]);

  useEffect(() => {
    if (establishDate) {
      const estDate = new Date(establishDate);
      const today = new Date();

      let age = today.getFullYear() - estDate.getFullYear();

      const m = today.getMonth() - estDate.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < estDate.getDate())) {
        age--;
      }

      setValue("companyAge", age.toString(), {
        shouldValidate: true,
        shouldDirty: true,
      });
    }
  }, [establishDate]);

  useEffect(() => {
    if (!company) return;

    const countries = new Set();
    const states = new Set();

    if (company?.country) countries.add(company.country);
    if (company?.state) states.add(company.state);

    company?.units?.forEach((unit, index) => {
      if (unit?.country) countries.add(unit.country);
      if (unit?.state) states.add(unit.state);

      // Load GST types based on company structure
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

      // Load Business types based on GST type
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

    // Fetch states for countries
    countries.forEach((country) => {
      dispatch(getAllStatesByCountryName(country));
    });

    // Fetch cities for states
    states.forEach((stateName) => {
      dispatch(getAllCitiesByStateName(stateName));
    });

    // Industry chain APIs
    if (company?.industryId) {
      dispatch(getSubIndustryByIndustryId(company?.industryId));
    }

    if (company?.subIndustryId) {
      dispatch(getSubSubIndustryBySubIndustryId(company?.subIndustryId));
    }

    if (company?.subsubIndustryId) {
      dispatch(getIndustryDataBySubSubIndustryId(company?.subsubIndustryId));
    }

    // Reset form values

    setFormCondition((prev) => ({
      ...prev,
      ndaPresent: company?.ndaPresent,
      aggrementPresent: company?.aggrementPresent,
    }));

    reset({
      ...getDefaultValues(),
      ...company,
      assigneeId: String(company?.assigneeId),
      industryId: String(company?.industryId),
      subIndustryId: String(company?.subIndustryId),
      subSubIndustryId: String(company?.subSubIndustryId),
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
            gstTypeId: u?.gstTypeId ? String(u.gstTypeId) : "",
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

          // dispatch(
          //   updateFullCompanyDetailsInAccounts({
          //     companyId: company?.id,
          //     updatedBy: userId,
          //     data: resp?.payload,
          //   }),
          // )
          //   .then((res) => {
          //     if (res.meta.requestStatus === "fulfilled") {
          //       onClose();
          //       addToast({
          //         title: "Compamy detail updated successfully !.",
          //         color: "success",
          //       });

          //       dispatch(
          //         getAllEstimateByUserId({
          //           userId,
          //           page: filteration?.page,
          //           size: filteration?.size,
          //         }),
          //       );
          //       dispatch(
          //         getTotalCountOfEstimate({
          //           userId,
          //           data: {
          //             search: filters.search || "",
          //             status: filters.status || "",
          //             fromDate: filters.fromDate || "",
          //             toDate: filters.toDate || "",
          //           },
          //         }),
          //       );
          //     } else {
          //       addToast({ title: res.payload.data.message, color: "danger" });
          //     }
          //   })
          //   .catch(() =>
          //     addToast({ title: "Something went wrong !.", color: "danger" }),
          //   );
        } else {
          addToast({ title: resp.payload.data.message, color: "danger" });
        }
      })
      .catch(() =>
        addToast({ title: "Something went wrong !.", color: "danger" }),
      );
  };

  console.log("jdhsgfjkhgkjgkjdg", gstAndPanData);

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
                  showMonthAndYearPickers
                  maxValue={today(getLocalTimeZone())}
                  errorMessage={error?.message}
                  isInvalid={!!error}
                  value={
                    field.value && /^\d{4}-\d{2}-\d{2}$/.test(field.value)
                      ? parseDate(field.value)
                      : null
                  }
                  onChange={(value) => {
                    const iso = value ? value.toString() : "";
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
                  maxLength={3}
                  onChange={(e) =>
                    field.onChange(allowOnlyNumbers(e.target.value))
                  }
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
                  isRequired
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
                    isRequired
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
                  isRequired
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
                  isRequired
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
                  isRequired
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
                  label="Company incorporate document"
                  // isRequired
                  value={field.value}
                  onChange={(value) => field.onChange(value)}
                  errorMessage={error?.message}
                  isInvalid={!!error}
                />
              )}
            />

            {/* Payment / Agreement / NDA */}

            {/* <Controller
              name="paymentTerm"
              control={control}
              render={({ field, fieldState: { error } }) => (
                <Select
                  label="Payment term"
                  isRequired
                  errorMessage={error?.message}
                  isInvalid={!!error}
                  selectedKeys={
                    field.value ? new Set([String(field.value)]) : new Set()
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
            /> */}

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
              render={({ field, fieldState: { error } }) => {
                console.log("Rendering NDA select with value:", field);

                return (
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
                );
              }}
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

            {/* Contact */}
            {/* <Controller
              name="primaryTitle"
              control={control}
              render={({ field, fieldState: { error } }) => (
                <Select
                  label="Salutation"
                  isRequired
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
                  isRequired
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
                  isRequired
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
                  isRequired
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
                  isRequired
                  errorMessage={error?.message}
                  isInvalid={!!error}
                  value={field.value}
                  onChange={(e) =>
                    field.onChange(allowOnlyNumbers(e.target.value))
                  }
                />
              )}
            />

            <Controller
              name="contactWhatsappNo"
              control={control}
              render={({ field, fieldState: { error } }) => (
                <Input
                  label="Whatsapp number"
                  isRequired
                  errorMessage={error?.message}
                  isInvalid={!!error}
                  value={field.value}
                  onChange={(e) =>
                    field.onChange(allowOnlyNumbers(e.target.value))
                  }
                />
              )}
            /> */}
          </div>
        </CardBody>
      </Card>

      <Card className="border border-default-200 shadow-sm">
        <CardHeader className="text-base font-bold">Address</CardHeader>
        <Divider />
        <CardBody>
          <div className="grid grid-cols-3 gap-8">
            {/* Address */}

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

          {/* <Button
            type="button"
            variant="bordered"
            className="cursor-pointer"
            onPress={() => append(getEmptyUnit())}
          >
            + Add Unit
          </Button> */}
        </CardHeader>

        <Divider />

        <CardBody className="space-y-5">
          {fields.map((item, index) => {
            const unitCountry = watch(`units.${index}.country`);
            const unitState = watch(`units.${index}.state`);

            const unitStatesList = statesByCountry?.[unitCountry] || [];
            const unitCitiesList = citiesByState?.[unitState] || [];
            return (
              <div
                key={item.id}
                className="rounded-xl border border-dashed border-default-300 p-4"
              >
                <div className="mb-4 flex items-center justify-between">
                  <p className="text-sm font-bold">Unit #{index + 1} Details</p>
                  {/* 
                <Button
                  type="button"
                  color="danger"
                  variant="bordered"
                  className="cursor-pointer"
                  isDisabled={fields.length === 1}
                  onPress={() => remove(index)}
                >
                  Remove
                </Button> */}
                </div>

                <div className="rounded-xl border border-default-300 p-4">
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
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
                          isRequired
                          value={field.value}
                          isInvalid={!!error}
                          errorMessage={error?.message}
                          onChange={(value) => {
                            dispatch(getAllGstTypeByCompanyTypeId(value)).then(
                              (res) => {
                                if (res.payload) {
                                  setGstTypeMap((prev) => ({
                                    ...prev,
                                    [index]: res.payload.gstBussinessType || [],
                                  }));
                                }
                              },
                            );
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
                          isRequired
                          data={gstTypeMap[index] || []}
                          labelKey="name"
                          valueKey="id"
                          value={field.value}
                          onChange={(value) => {
                            dispatch(getBusinessTypeByGstTypeId(value)).then(
                              (res) => {
                                if (res.payload) {
                                  setBusinessTypeMap((prev) => ({
                                    ...prev,
                                    [index]: res.payload.gstTypePrice || [],
                                  }));
                                }
                              },
                            );
                            field.onChange(value);
                          }}
                        />
                      )}
                    />

                    <Controller
                      name={`units.${index}.gstBusinessTypeId`}
                      control={control}
                      render={({ field }) => (
                        <NewSelect
                          label="Business Type"
                          isRequired
                          data={businessTypeMap[index] || []}
                          labelKey="name"
                          valueKey="id"
                          value={field.value}
                          onItemSelect={(itm) => {
                            setGstAndPanData((prev) => ({
                              ...prev,
                              [index]: {
                                gst: itm?.gstPresent,
                                pan: itm?.panPresent,
                              },
                            }));
                          }}
                          onChange={(value) => {
                            field.onChange(value);
                          }}
                        />
                      )}
                    />

                    {gstAndPanData[index]?.gst && (
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
                          showMonthAndYearPickers
                          maxValue={today(getLocalTimeZone())}
                          errorMessage={error?.message}
                          isInvalid={!!error}
                          value={
                            field.value &&
                            /^\d{4}-\d{2}-\d{2}$/.test(field.value)
                              ? parseDate(field.value)
                              : null
                          }
                          onChange={(value) => {
                            const iso = value ? value.toString() : "";
                            field.onChange(iso);
                          }}
                        />
                      )}
                    />
                  </div>
                </div>

                <div className="rounded-xl border border-default-300 p-4 mt-2.5">
                  <div className="mb-4 flex items-center justify-between">
                    <p className="text-sm font-bold">
                      Unit #{index + 1} Address
                    </p>
                    {/* 
                <Button
                  type="button"
                  color="danger"
                  variant="bordered"
                  className="cursor-pointer"
                  isDisabled={fields.length === 1}
                  onPress={() => remove(index)}
                >
                  Remove
                </Button> */}
                  </div>
                  <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
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

                    {/* <Controller
                  control={control}
                  name={`units.${index}.addressLine2`}
                  render={({ field, fieldState: { error } }) => (
                    <Input
                      label="Address Line 2"
                      value={field.value}
                      onChange={(e) => field.onChange(e.target.value)}
                      errorMessage={error?.message}
                      isInvalid={!!error}
                    />
                  )}
                /> */}

                    <Controller
                      name={`units.${index}.country`}
                      control={control}
                      render={({ field, fieldState: { error } }) => (
                        <NewSelect
                          isRequired
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
