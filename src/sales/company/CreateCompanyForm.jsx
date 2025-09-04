import { useEffect, useState } from "react";
import CustomSearchInput from "../../components/CustomSearchInput";
import {
  addToast,
  Button,
  Checkbox,
  DatePicker,
  Input,
  Select,
  SelectItem,
} from "@heroui/react";
import { useDispatch, useSelector } from "react-redux";
import NewSelect from "../../components/NewSelect";
import {
  createNewCompanyInLeads,
  getAllCompanyType,
  getAllGstTypeByCompanyTypeId,
  getAllNewCompanies,
  getBusinessTypeByGstTypeId,
  getCompanyByUnitId,
} from "../../toolkit/slices/companySlice";
import {
  getLocalTimeZone,
  parseDate,
  toCalendarDate,
  today,
} from "@internationalized/date";
import {
  getAllCitiesByStateName,
  getAllContactDetails,
  getAllCountries,
  getAllMainIndustry,
  getAllSecondaryCitiesBySecondaryStateName,
  getAllSecondaryCountries,
  getAllSecondaryStatesBySecondaryCountryName,
  getAllStatesByCountryName,
  getAllUsers,
  getIndustryDataBySubSubIndustryId,
  getSubIndustryByIndustryId,
  getSubSubIndustryBySubIndustryId,
} from "../../toolkit/slices/commonSlice";
import SingleFileUploader from "../../components/SingleFileUploader";
import { ArrowLeft } from "lucide-react";
import { formatGSTInput, formatPANInput } from "../../common";
import { getClientDesiginationList } from "../../toolkit/slices/settingSlice";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useParams } from "react-router-dom";
import dayjs from "dayjs";
import {
  createCompanyInOperations,
  updateCompanyInOperations,
} from "../../toolkit/slices/operationSlice";
import { getOperationCompanyFormValues } from "../../operation/components/commonFunctions";

const formSchema = z.object({
  consultantOrCompany: z.enum(["consultant", "company"], {
    required_error: "Please select role as",
  }),
  companyName: z.string().min(1, "Please enter company name"),
  companyType: z.string().min(1, "Please select the company structure"),
  gstType: z.string().min(1, "Please select the gst type"),
  businessType: z.string().optional(),
  gstNo: z.string().min(15, "please enter GST number"),
  panNo: z.string().min(10, "please enter pan number"),
  establishDate: z.string().min(1, "Please enter company incorporate date"),
  assigneeId: z.string().min(1, "Please select the assignee"),
  industryId: z.string().min(1, "Please select the industry"),
  subIndustryId: z.string().min(1, "Please select the sub industry"),
  subsubIndustryId: z.string().min(1, "Please select the category"),
  industrydataId: z
    .array(z.string())
    .min(1, "Please select the business activity"),
  companyFileUrl: z.string().optional(),
  rating: z.enum(["Gold", "Silver", "Bronze"], {
    required_error: "Please select rating",
  }),
  paymentTerm: z.enum(
    [
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
    ],
    { required_error: "Please select payment term" }
  ),
  aggrementPresent: z.boolean(),
  agreementFileUrl: z.string().optional(),
  ndaPresent: z.boolean(),
  ndaFileUrl: z.string().optional(),
  primaryTitle: z.enum(["master", "mr", "mrs", "miss"], {
    required_error: "Please select the salutation",
  }),
  contactName: z.string().min(1, "Please enter contact person name"),
  primaryDesignation: z.string().min(1, "Please select the designation"),
  contactEmails: z.string().email("Please enter a valid email address"),
  contactNo: z.string().min(1, "Please enter contact number"),
  contactWhatsappNo: z.string().min(1, "Please enter whatsapp number"),
  secondaryTitle: z.enum(["master", "mr", "mrs", "miss"], {
    required_error: "Please select the salutation",
  }),
  secondaryContactName: z.string().min(1, "Please enter contact person name"),
  secondaryDesignation: z.string().min(1, "Please select the designation"),
  secondaryContactEmails: z
    .string()
    .email("Please enter a valid email address"),
  secondaryContactNo: z.string().min(1, "Please enter contact number"),
  secondaryContactWhatsappNo: z.string().min(1, "Please enter whatsapp number"),
  address: z.string().min(1, "Please enter primary address"),
  country: z.string().min(1, "Please select the country"),
  state: z.string().min(1, "Please select the state"),
  city: z.string().min(1, "Please select the city"),
  primaryPinCode: z.string().min(1, "Please enter primary pin code"),
  secondaryAddress: z.string().optional(),
  secondaryCountry: z.string().optional(),
  secondaryState: z.string().optional(),
  secondaryCity: z.string().optional(),
  secondaryPinCode: z.string().optional(),
  servingName: z
    .string()
    .min(1, "Please enter serving company name")
    .optional(),
  servingCompanyType: z
    .string()
    .min(1, "Please select the company structure")
    .optional(),
  servingGstNo: z
    .string()
    .min(1, "Please enter serving company GST number")
    .optional(),
  servingPanNo: z
    .string()
    .min(10, "Please enter serving company PAN number")
    .optional(),
  servingEstablishDate: z
    .string()
    .min(1, "Please enter serving company incorporate date")
    .optional(),
  industries: z.string().min(1, "Please select the industry").optional(),
  subIndustry: z.string().min(1, "Please select the sub industry").optional(),
  subsubIndustry: z.string().min(1, "Please select the category").optional(),
  industriesData: z
    .string()
    .min(1, "Please select the business activity")
    .optional(),
  servingCompanyFileUrl: z.string().optional(),
  servingPrimaryTitle: z
    .enum(["master", "mr", "mrs", "miss"], {
      required_error: "Please select the salutation",
    })
    .optional(),
  servingContactName: z
    .string()
    .min(1, "Please enter contact person name")
    .optional(),
  servingPrimaryDesignation: z
    .string()
    .min(1, "Please select the designation")
    .optional(),
  servingContactEmails: z
    .string()
    .email("Please enter a valid email address")
    .optional(),
  servingContactNo: z.string().min(1, "Please enter contact number").optional(),
  servingContactWhatsappNo: z
    .string()
    .min(1, "Please enter whatsapp number")
    .optional(),
  servingSecondaryTitle: z
    .enum(["master", "mr", "mrs", "miss"], {
      required_error: "Please select the salutation",
    })
    .optional(),
  servingSecondaryContactName: z
    .string()
    .min(1, "Please enter contact person name")
    .optional(),
  servingSecondaryDesignation: z
    .string()
    .min(1, "Please select the designation")
    .optional(),
  servingSecondaryContactEmails: z
    .string()
    .email("Please enter a valid email address")
    .optional(),
  servingSecondaryContactNo: z
    .string()
    .min(1, "Please enter contact number")
    .optional(),
  servingSecondaryContactWhatsappNo: z
    .string()
    .min(1, "Please enter whatsapp number")
    .optional(),
  servingAddress: z.string().min(1, "Please enter primary address").optional(),
  servingCountry: z.string().min(1, "Please select the country").optional(),
  servingState: z.string().min(1, "Please select the state").optional(),
  servingCity: z.string().min(1, "Please select the city").optional(),
  servingprimaryPinCode: z
    .string()
    .min(1, "Please enter primary pin code")
    .optional(),
  servingSecondaryAddress: z.string().optional(),
  servingSecondaryCountry: z.string().optional(),
  servingSecondaryState: z.string().optional(),
  servingsecondaryCity: z.string().optional(),
  servingSecondaryPinCode: z.string().optional(),
});

const companyFormSchema = z.object({
  consultantOrCompany: z.enum(["consultant", "company"], {
    required_error: "Please select role as",
  }),
  companyName: z.string().min(1, "Please enter company name"),
  companyType: z.string().min(1, "Please select the company structure"),
  gstType: z.string().min(1, "Please select the gst type"),
  businessType: z.string().optional(),
  gstNo: z.string().min(15, "please enter GST number"),
  panNo: z.string().min(10, "please enter pan number"),
  establishDate: z.string().min(1, "Please enter company incorporate date"),
  assigneeId: z.string().min(1, "Please select the assignee"),
  industryId: z.string().min(1, "Please select the industry"),
  subIndustryId: z.string().min(1, "Please select the sub industry"),
  subsubIndustryId: z.string().min(1, "Please select the category"),
  industrydataId: z
    .array(z.string())
    .min(1, "Please select the business activity"),
  companyFileUrl: z.string().optional(),
  rating: z.enum(["Gold", "Silver", "Bronze"], {
    required_error: "Please select rating",
  }),
  paymentTerm: z.enum(
    [
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
    ],
    { required_error: "Please select payment term" }
  ),
  aggrementPresent: z.boolean(),
  agreementFileUrl: z.string().optional(),
  ndaPresent: z.boolean(),
  ndaFileUrl: z.string().optional(),
  primaryTitle: z.enum(["master", "mr", "mrs", "miss"], {
    required_error: "Please select the salutation",
  }),
  contactName: z.string().min(1, "Please enter contact person name"),
  primaryDesignation: z.string().min(1, "Please select the designation"),
  contactEmails: z.string().email("Please enter a valid email address"),
  contactNo: z.string().min(1, "Please enter contact number"),
  contactWhatsappNo: z.string().min(1, "Please enter whatsapp number"),
  secondaryTitle: z.enum(["master", "mr", "mrs", "miss"], {
    required_error: "Please select the salutation",
  }),
  secondaryContactName: z.string().min(1, "Please enter contact person name"),
  secondaryDesignation: z.string().min(1, "Please select the designation"),
  secondaryContactEmails: z
    .string()
    .email("Please enter a valid email address"),
  secondaryContactNo: z.string().min(1, "Please enter contact number"),
  secondaryContactWhatsappNo: z.string().min(1, "Please enter whatsapp number"),
  address: z.string().min(1, "Please enter primary address"),
  country: z.string().min(1, "Please select the country"),
  state: z.string().min(1, "Please select the state"),
  city: z.string().min(1, "Please select the city"),
  primaryPinCode: z.string().min(1, "Please enter primary pin code"),
  secondaryAddress: z.string().optional(),
  secondaryCountry: z.string().optional(),
  secondaryState: z.string().optional(),
  secondaryCity: z.string().optional(),
  secondaryPinCode: z.string().optional(),
});

const defaultValues = {
  consultantOrCompany: "",
  companyName: "",
  companyType: "",
  gstType: "",
  businessType: "",
  gstNo: "",
  panNo: "",
  establishDate: "",
  assigneeId: "",
  industryId: "",
  subIndustryId: "",
  subsubIndustryId: "",
  industrydataId: [],
  companyFileUrl: "",
  rating: "",
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
  secondaryTitle: "",
  secondaryContactName: "",
  secondaryDesignation: "",
  secondaryContactEmails: "",
  secondaryContactNo: "",
  secondaryContactWhatsappNo: "",
  address: "",
  country: "",
  state: "",
  city: "",
  primaryPinCode: "",
  secondaryAddress: "",
  secondaryCountry: "",
  secondaryState: "",
  secondaryCity: "",
  secondaryPinCode: "",
  servingName: "",
  servingCompanyType: "",
  servingGstNo: "",
  servingPanNo: "",
  servingEstablishDate: "",
  industries: "",
  subIndustry: "",
  subsubIndustry: "",
  industriesData: "",
  servingCompanyFileUrl: "",
  servingPrimaryTitle: "",
  servingContactName: "",
  servingPrimaryDesignation: "",
  servingContactEmails: "",
  servingContactNo: "",
  servingContactWhatsappNo: "",
  servingSecondaryTitle: "",
  servingSecondaryContactName: "",
  servingSecondaryDesignation: "",
  servingSecondaryContactEmails: "",
  servingSecondaryContactNo: "",
  servingSecondaryContactWhatsappNo: "",
  servingAddress: "",
  servingCountry: "",
  servingState: "",
  servingCity: "",
  servingprimaryPinCode: "",
  servingSecondaryAddress: "",
  servingSecondaryCountry: "",
  servingSecondaryState: "",
  servingsecondaryCity: "",
  servingSecondaryPinCode: "",
};

const defaultCompanyValues = {
  consultantOrCompany: "",
  companyName: "",
  companyType: "",
  gstType: "",
  businessType: "",
  gstNo: "",
  panNo: "",
  establishDate: "",
  assigneeId: "",
  industryId: "",
  subIndustryId: "",
  subsubIndustryId: "",
  industrydataId: [],
  companyFileUrl: "",
  rating: "",
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
  secondaryTitle: "",
  secondaryContactName: "",
  secondaryDesignation: "",
  secondaryContactEmails: "",
  secondaryContactNo: "",
  secondaryContactWhatsappNo: "",
  address: "",
  country: "",
  state: "",
  city: "",
  primaryPinCode: "",
  secondaryAddress: "",
  secondaryCountry: "",
  secondaryState: "",
  secondaryCity: "",
  secondaryPinCode: "",
};

const CreateCompanyForm = ({
  edit,
  onOpenChange,
  companyFilteration,
  editData,
  setEditData,
}) => {
  const dispatch = useDispatch();
  const { userId, leadId } = useParams();
  const allUsers = useSelector((state) => state.common.usersList);
  const companyTypeList = useSelector((state) => state.company.companyTypeList);
  const gstTypeList = useSelector((state) => state.company.gstTypeList);
  const businessTypeList = useSelector(
    (state) => state.company.businessTypeList
  );
  const countryList = useSelector((state) => state.common.countriesList);
  const statesList = useSelector((state) => state.common.statesList);
  const citiesList = useSelector((state) => state.common.citiesList);
  const allIndustry = useSelector((state) => state.common.allMainIndustry);
  const subIndustryListById = useSelector(
    (state) => state.common.subIndustryListByIndustryId
  );
  const subSubIndustryListById = useSelector(
    (state) => state.common.subSubIndustryListBySubIndustryId
  );
  const industryDataListById = useSelector(
    (state) => state.common.industryDataListBySubSubIndustryId
  );
  const desiginationList = useSelector(
    (state) => state.setting.clientDesiginationList
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [isNewCompany, setIsNewCompany] = useState(true);
  const [gstAndPanData, setGstAndPanData] = useState({
    pan: false,
    gst: false,
  });
  const [isConsultant, setIsConsultant] = useState(false);
  const [panError, setPanError] = useState("");
  const [gstError, setGstError] = useState("");

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
    reset,
  } = useForm({
    resolver: zodResolver(isConsultant ? formSchema : companyFormSchema),
    defaultValues: isConsultant ? defaultValues : defaultCompanyValues,
  });

  const aggrementPresent = watch("aggrementPresent");
  const ndaPresent = watch("ndaPresent");
  const state = watch("state");
  const gstNo = watch("gstNo");

  // Debug form state changes for file fields
  useEffect(() => {
    const subscription = watch((value, { name }) => {
      if (
        [
          "companyFileUrl",
          "agreementFileUrl",
          "ndaFileUrl",
          "servingCompanyFileUrl",
        ].includes(name)
      ) {
        console.log(`Field ${name} updated:`, value[name]);
      }
    });
    return () => subscription.unsubscribe();
  }, [watch]);

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
    const error = validateGST(formattedValue, state);
    setGstError(error);
  };

  const handleStateChange = (stateName) => {
    setValue("state", stateName);
    dispatch(getAllCitiesByStateName(stateName));
    const error = validateGST(gstNo, stateName);
    setGstError(error);
  };

  useEffect(() => {
    dispatch(getAllCompanyType());
    dispatch(getAllUsers());
    dispatch(getAllMainIndustry());
    dispatch(getClientDesiginationList());
    dispatch(getAllContactDetails());
    dispatch(getAllCountries());
  }, [dispatch]);

  useEffect(() => {
    if (edit) {
      dispatch(getCompanyByUnitId(editData?.companyId)).then((resp) => {
        if (resp.meta.requestStatus === "fulfilled") {
          dispatch(getAllMainIndustry());
          dispatch(getAllCompanyType());
          dispatch(getClientDesiginationList());
          dispatch(getAllContactDetails());
          dispatch(getAllCountries());
          dispatch(getAllSecondaryCountries());
          let compData = resp?.payload;
          dispatch(getSubIndustryByIndustryId(compData?.industry?.id));
          dispatch(getSubSubIndustryBySubIndustryId(compData?.subIndustry?.id));
          dispatch(
            getIndustryDataBySubSubIndustryId(compData?.subSubIndustry?.id)
          );
          dispatch(getAllStatesByCountryName(compData?.country));
          dispatch(
            getAllSecondaryStatesBySecondaryCountryName(compData?.sCountry)
          );
          dispatch(getAllCitiesByStateName(compData?.state));
          dispatch(getAllSecondaryCitiesBySecondaryStateName(compData?.sState));
          dispatch(getAllGstTypeByCompanyTypeId(compData?.companyType));
          dispatch(getBusinessTypeByGstTypeId(compData?.gstType));
          reset({
            companyName: compData?.companyName,
            companyType: compData?.companyType,
            gstType: compData?.gstType,
            businessType: compData?.bussinessType,
            gstNo: compData?.gstNo,
            panNo: compData?.panNo,
            establishDate: dayjs(compData?.establishDate),
            assigneeId: compData?.assigneeId,
            industryId: compData?.industry?.id,
            subIndustryId: compData?.subIndustry?.id,
            subsubIndustryId: compData?.subSubIndustry?.id,
            industrydataId: compData?.industryData?.map((item) => item?.id),
            gstDocuments: compData?.gstDoc,
            rating: compData?.rating,
            paymentTerm: compData?.paymentTerm,
            aggrementPresent: compData?.aggrementPresent,
            aggrement: compData?.aggrement,
            ndaPresent: compData?.ndaPresent,
            nda: compData?.nda,
            primaryTitle: compData?.primaryContact?.title,
            contactName: compData?.primaryContact?.name,
            primaryDesignation: compData?.primaryContact?.clientDesignation?.id,
            contactEmails: compData?.primaryContact?.emails,
            contactNo: compData?.primaryContact?.contactNo,
            contactWhatsappNo: compData?.primaryContact?.whatsappNo,
            secondaryTitle: compData?.secondaryContact?.title,
            secondaryContactName: compData?.secondaryContact?.name,
            secondaryDesignation:
              compData?.secondaryContact?.clientDesignation?.id,
            secondaryContactEmails:
              compData?.secondaryContact?.secondaryContactEmails,
            secondaryContactNo: compData?.secondaryContact?.contactNo,
            secondaryContactWhatsappNo: compData?.secondaryContact?.whatsappNo,
            address: compData?.address,
            country: compData?.country,
            state: compData?.state,
            city: compData?.city,
            primaryPinCode: compData?.primaryPinCode,
            secondaryAddress: compData?.sAddress,
            secondaryCountry: compData?.sCountry,
            secondaryState: compData?.sState,
            secondaryCity: compData?.sCity,
            secondaryPinCode: compData?.secondaryPinCode,
          });
        }
      });
      onOpenChange(true);
    }
  }, []);

  const onSubmit = (data) => {
    data.updatedBy = userId;
    if (edit) {
      data.id = editData?.companyId;
      dispatch(updateCompanyDetails(data))
        .then((resp) => {
          if (resp.meta.requestStatus === "fulfilled") {
            addToast({
              title: "Company updated successfully !.",
              color: "success",
            });
            dispatch(getAllNewCompanies(companyFilteration));
            setEditData(null);
            onOpenChange(false);
            reset(defaultValues);
            dispatch(
              updateCompanyInOperations({
                companyId: editData?.companyId,
                ...getOperationCompanyFormValues(data),
              })
            )
              .then((res) => {
                if (res.meta.requestStatus === "fulfilled") {
                  addToast({
                    title: "Company updated successfully in operations !.",
                    color: "success",
                  });
                } else {
                  addToast({
                    title: "Something went wrong !.",
                    color: "danger",
                  });
                }
              })
              .catch(() =>
                addToast({
                  title: "Something went wrong !.",
                  color: "danger",
                })
              );
          } else {
            addToast({
              title: "Something went wrong !.",
              color: "danger",
            });
          }
        })
        .catch(() =>
          addToast({
            title: "Something went wrong !.",
            color: "danger",
          })
        );
    } else {
      data.leadId = leadId;
      data.createdBy = userId;
      dispatch(createNewCompanyInLeads(data))
        .then((resp) => {
          if (resp.meta.requestStatus === "fulfilled") {
            addToast({
              title: "Company created successfully !.",
              color: "success",
            });
            reset();
            dispatch(
              createCompanyInOperations(getOperationCompanyFormValues(data))
            )
              .then((res) => {
                if (res.meta.requestStatus === "fulfilled") {
                  addToast({
                    title: "Company created in operations successfully !.",
                    color: "success",
                  });
                } else {
                  addToast({
                    title: "Something went wrong !.",
                    color: "danger",
                  });
                }
              })
              .catch(() =>
                addToast({
                  title: "Something went wrong !.",
                  color: "danger",
                })
              );
          } else {
            addToast({
              title: "Something went wrong !.",
              color: "danger",
            });
          }
        })
        .catch(() =>
          addToast({
            title: "Something went wrong !.",
            color: "danger",
          })
        );
    }
  };

  return (
    <>
      <div className="flex items-center gap-2 my-2">
        <Button
          size="sm"
          isIconOnly
          variant="light"
          onPress={() => setIsNewCompany(false)}
        >
          <ArrowLeft />
        </Button>
        <h1 className="font-medium">Company details</h1>
      </div>
      <div>
        {!isNewCompany && (
          <CustomSearchInput
            value={searchTerm}
            onChange={(e) => setSearchTerm(e)}
            onSelect={(e) => setSearchTerm(e)}
            isButton={true}
            buttonText={"Add new"}
            onButtonClick={() => setIsNewCompany(true)}
          />
        )}
      </div>
      {isNewCompany && (
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="max-h-[64vh] overflow-auto p-4 mb-2">
            <div className="mt-4">
              <h2>Company info</h2>
              <div className="grid grid-cols-3 gap-4">
                <Controller
                  name="consultantOrCompany"
                  control={control}
                  render={({ field, fieldState: { error } }) => (
                    <Select
                      isRequired
                      label="Company type"
                      errorMessage={error?.message}
                      isInvalid={!!error}
                      {...field}
                      selectedKeys={[field.value]}
                      onSelectionChange={(e) => {
                        field.onChange(Array.from(e)[0]);
                        if (Array.from(e)[0] === "consultant") {
                          setIsConsultant(true);
                        } else {
                          setIsConsultant(false);
                        }
                      }}
                      items={[
                        { label: "Consultant", key: "consultant" },
                        { label: "Company", key: "company" },
                      ]}
                    >
                      {(item) => (
                        <SelectItem key={item.key}>{item.label}</SelectItem>
                      )}
                    </Select>
                  )}
                />
                <Controller
                  name="companyName"
                  control={control}
                  render={({ field, fieldState: { error } }) => (
                    <Input
                      isRequired
                      label="Company name"
                      errorMessage={error?.message}
                      isInvalid={!!error}
                      {...field}
                    />
                  )}
                />
                <Controller
                  name="companyType"
                  control={control}
                  render={({ field, fieldState: { error } }) => (
                    <NewSelect
                      isRequired
                      label="Company structure"
                      errorMessage={error?.message}
                      isInvalid={!!error}
                      data={companyTypeList || []}
                      labelKey="name"
                      valueKey="id"
                      value={field.value}
                      onChange={(value) => {
                        dispatch(getAllGstTypeByCompanyTypeId(value));
                        field.onChange(value);
                      }}
                    />
                  )}
                />
                <Controller
                  name="gstType"
                  control={control}
                  render={({ field, fieldState: { error } }) => (
                    <NewSelect
                      isRequired
                      label="GST type"
                      errorMessage={error?.message}
                      isInvalid={!!error}
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
                  name="businessType"
                  control={control}
                  render={({ field, fieldState: { error } }) => (
                    <NewSelect
                      isRequired
                      label="Business type"
                      errorMessage={error?.message}
                      isInvalid={!!error}
                      data={businessTypeList?.gstTypePrice || []}
                      labelKey="name"
                      valueKey="id"
                      value={field.value}
                      onChange={(value) => {
                        field.onChange(value);
                        const foundObject =
                          businessTypeList?.gstTypePrice?.find(
                            (item) => item.id == value
                          );
                        console.log(
                          "sdkjhdjkhdjk",
                          value,
                          businessTypeList?.gstTypePrice,
                          foundObject
                        );
                        setGstAndPanData({
                          pan: foundObject?.panPresent || false,
                          gst: foundObject?.gstPresent || false,
                        });
                      }}
                    />
                  )}
                />
                {gstAndPanData.gst && (
                  <Controller
                    name="gstNo"
                    control={control}
                    render={({ field, fieldState: { error } }) => (
                      <Input
                        isRequired
                        label="GST number"
                        maxLength={15}
                        errorMessage={error?.message || gstError}
                        isInvalid={!!error || !!gstError}
                        {...field}
                        onChange={(e) => {
                          handleGstChange(e);
                        }}
                      />
                    )}
                  />
                )}
                {gstAndPanData.pan && (
                  <Controller
                    name="panNo"
                    control={control}
                    render={({ field, fieldState: { error } }) => (
                      <Input
                        isRequired
                        label="Pan number"
                        maxLength={10}
                        errorMessage={error?.message || panError}
                        isInvalid={!!error || !!panError}
                        {...field}
                        onChange={(e) => {
                          handlePanChange(e);
                        }}
                      />
                    )}
                  />
                )}
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
                      value={field.value ? parseDate(field.value) : null}
                      onChange={(e) =>
                        field.onChange(toCalendarDate(e).toString())
                      }
                    />
                  )}
                />
                <Controller
                  name="assigneeId"
                  control={control}
                  render={({ field, fieldState: { error } }) => (
                    <NewSelect
                      isRequired={true}
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
                <Controller
                  name="industryId"
                  control={control}
                  render={({ field, fieldState: { error } }) => (
                    <NewSelect
                      isRequired={true}
                      label="Select industry"
                      errorMessage={error?.message}
                      isInvalid={!!error}
                      data={allIndustry || []}
                      labelKey="name"
                      valueKey="id"
                      value={field.value}
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
                      isRequired={true}
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
                      isRequired={true}
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
                      isRequired={true}
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
                      isRequired
                      label="Company document"
                      value={field.value}
                      onChange={(value) => {
                        field.onChange(value);
                      }}
                      errorMessage={error?.message}
                      isInvalid={!!error}
                    />
                  )}
                />
              </div>
            </div>
            <div className="mt-4">
              <h2>Arrangement detail</h2>
              <div className="grid grid-cols-3 gap-4">
                <Controller
                  name="rating"
                  control={control}
                  render={({ field, fieldState: { error } }) => (
                    <Select
                      isRequired={true}
                      label="Rating"
                      errorMessage={error?.message}
                      isInvalid={!!error}
                      {...field}
                      value={[field.value]}
                      onSelectionChange={(e) =>
                        field.onChange(Array.from(e)[0])
                      }
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
                  name="paymentTerm"
                  control={control}
                  render={({ field, fieldState: { error } }) => (
                    <Select
                      isRequired={true}
                      label="Payment term"
                      errorMessage={error?.message}
                      isInvalid={!!error}
                      {...field}
                      value={field.value}
                      onChange={(e) => field.onChange(e.target.value)}
                      items={[
                        { label: "Net 30", key: "Net 30" },
                        { label: "Net 60", key: "Net 60" },
                        { label: "Net 90", key: "Net 90" },
                        { label: "2/10 Net 30", key: "2/10 Net 30" },
                        {
                          label: "EOM (End of Month)",
                          key: "EOM (End of Month)",
                        },
                        {
                          label: "COD (Cash on Delivery)",
                          key: "COD (Cash on Delivery)",
                        },
                        {
                          label: "CIA (Cash in Advance)",
                          key: "CIA (Cash in Advance)",
                        },
                        { label: "Installments", key: "Installments" },
                        { label: "Milestone-based", key: "Milestone-based" },
                        { label: "Due on Receipt", key: "Due on Receipt" },
                      ]}
                    >
                      {(item) => (
                        <SelectItem key={item.key}>{item.label}</SelectItem>
                      )}
                    </Select>
                  )}
                />
                <Controller
                  name="aggrementPresent"
                  control={control}
                  render={({ field, fieldState: { error } }) => (
                    <Select
                      isRequired={true}
                      label="Agreement"
                      errorMessage={error?.message}
                      isInvalid={!!error}
                      {...field}
                      value={field.value}
                      onChange={(e) =>
                        field.onChange(e.target.value === "true")
                      }
                      items={[
                        { label: "Yes", key: true },
                        { label: "No", key: false },
                      ]}
                    >
                      {(item) => (
                        <SelectItem key={item.key}>{item.label}</SelectItem>
                      )}
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
                        onChange={(value) => {
                          field.onChange(value);
                        }}
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
                      isRequired={true}
                      label="NDA"
                      errorMessage={error?.message}
                      isInvalid={!!error}
                      {...field}
                      value={field.value}
                      onChange={(e) =>
                        field.onChange(e.target.value === "true")
                      }
                      items={[
                        { label: "Yes", key: true },
                        { label: "No", key: false },
                      ]}
                    >
                      {(item) => (
                        <SelectItem key={item.key}>{item.label}</SelectItem>
                      )}
                    </Select>
                  )}
                />
                {ndaPresent && (
                  <Controller
                    name="ndaFileUrl"
                    control={control}
                    render={({ field, fieldState: { error } }) => (
                      <SingleFileUploader
                        label="NDA document"
                        value={field.value}
                        onChange={(value) => {
                          field.onChange(value);
                        }}
                        errorMessage={error?.message}
                        isInvalid={!!error}
                      />
                    )}
                  />
                )}
              </div>
            </div>
            <div className="mt-4">
              <h2>Contacts</h2>
              <h3 className="font-medium my-3">Primary contacts</h3>
              <div className="grid grid-cols-3 gap-4 w-full">
                <Controller
                  name="primaryTitle"
                  control={control}
                  render={({ field, fieldState: { error } }) => (
                    <Select
                      isRequired={true}
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
                  name="contactName"
                  control={control}
                  render={({ field, fieldState: { error } }) => (
                    <Input
                      isRequired={true}
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
                      isRequired={true}
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
                      isRequired={true}
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
                      isRequired={true}
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
                      isRequired={true}
                      label="Whatsapp number"
                      errorMessage={error?.message}
                      isInvalid={!!error}
                      {...field}
                    />
                  )}
                />
              </div>
              <h3 className="font-medium my-3">Secondary contacts</h3>
              <div className="grid grid-cols-3 gap-4">
                <Controller
                  name="secondaryTitle"
                  control={control}
                  render={({ field, fieldState: { error } }) => (
                    <Select
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
                  name="secondaryContactName"
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
                  name="secondaryDesignation"
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
                  name="secondaryContactEmails"
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
                  name="secondaryContactNo"
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
                  name="secondaryContactWhatsappNo"
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
              </div>
            </div>
            <div className="mt-4">
              <h2>Address</h2>
              <h3 className="font-medium my-3">Billing address</h3>
              <div className="grid grid-cols-3 gap-4">
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
              <h3 className="font-medium my-3">Shipping address</h3>
              {/* <Controller
              name="sameAsBilling"
              control={control}
              render={({ field }) => (
                <Checkbox
                  isSelected={field.value}
                  onChange={(e) => field.onChange(e.target.checked)}
                >
                  Same as billing address
                </Checkbox>
              )}
            /> */}
              <div className="grid grid-cols-3 gap-4">
                <Controller
                  name="secondaryAddress"
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
                  name="secondaryCountry"
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
                  name="secondaryState"
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
                  name="secondaryCity"
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
                  name="secondaryPinCode"
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
            </div>
            {isConsultant && (
              <div>
                <div className="my-6 flex justify-center">
                  <h1 className="font-medium text-lg">
                    Serving company details
                  </h1>
                </div>
                <div className="mt-4">
                  <h2>Company info</h2>
                  <div className="grid grid-cols-3 gap-4">
                    <Controller
                      name="servingName"
                      control={control}
                      render={({ field, fieldState: { error } }) => (
                        <Input
                          label="Serving company name"
                          errorMessage={error?.message}
                          isInvalid={!!error}
                          {...field}
                        />
                      )}
                    />

                    <Controller
                      name="servingCompanyType"
                      control={control}
                      render={({ field, fieldState: { error } }) => (
                        <NewSelect
                          label="Serving company structure"
                          errorMessage={error?.message}
                          isInvalid={!!error}
                          data={companyTypeList || []}
                          labelKey="name"
                          valueKey="id"
                          value={field.value}
                          onChange={(value) => {
                            dispatch(getAllGstTypeByCompanyTypeId(value));
                            field.onChange(value);
                          }}
                        />
                      )}
                    />

                    <Controller
                      name="servingGstNo"
                      control={control}
                      render={({ field, fieldState: { error } }) => (
                        <Input
                          label="Serving company GST number"
                          errorMessage={error?.message}
                          isInvalid={!!error}
                          {...field}
                        />
                      )}
                    />

                    <Controller
                      name="servingPanNo"
                      control={control}
                      render={({ field, fieldState: { error } }) => (
                        <Input
                          label="Serving company PAN number"
                          errorMessage={error?.message}
                          isInvalid={!!error}
                          {...field}
                        />
                      )}
                    />

                    <Controller
                      name="servingEstablishDate"
                      control={control}
                      render={({ field, fieldState: { error } }) => (
                        <DatePicker
                          label="Serving company incorporate date"
                          errorMessage={error?.message}
                          isInvalid={!!error}
                          showMonthAndYearPickers
                          maxValue={today(getLocalTimeZone())}
                          value={field.value ? parseDate(field.value) : null}
                          onChange={(e) =>
                            field.onChange(toCalendarDate(e).toString())
                          }
                        />
                      )}
                    />

                    <Controller
                      name="industries"
                      control={control}
                      render={({ field, fieldState: { error } }) => (
                        <NewSelect
                          label="Select industry"
                          errorMessage={error?.message}
                          isInvalid={!!error}
                          data={allIndustry || []}
                          labelKey="name"
                          valueKey="id"
                          value={field.value}
                          onChange={(value) => {
                            dispatch(getSubIndustryByIndustryId(value));
                            field.onChange(value);
                          }}
                        />
                      )}
                    />

                    <Controller
                      name="subIndustry"
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
                      name="subsubIndustry"
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
                      name="industriesData"
                      control={control}
                      render={({ field, fieldState: { error } }) => (
                        <NewSelect
                          label="Select business activity"
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
                      name="servingCompanyFileUrl"
                      control={control}
                      render={({ field, fieldState: { error } }) => (
                        <SingleFileUploader
                          value={field.value}
                          onChange={(value) => {
                            field.onChange(value);
                          }}
                          errorMessage={error?.message}
                          isInvalid={!!error}
                        />
                      )}
                    />
                  </div>
                </div>
                <div className="mt-4">
                  <h2>Contacts</h2>
                  <h3 className="font-medium my-3">Primary contacts</h3>
                  <div className="grid grid-cols-3 gap-4">
                    <Controller
                      name="servingPrimaryTitle"
                      control={control}
                      render={({ field, fieldState: { error } }) => (
                        <Select
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
                      name="servingContactName"
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
                      name="servingPrimaryDesignation"
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
                      name="servingContactEmails"
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
                      name="servingContactNo"
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
                      name="servingContactWhatsappNo"
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
                  </div>
                  <h3 className="font-medium my-3">Secondary contacts</h3>
                  <div className="grid grid-cols-3 gap-4">
                    <Controller
                      name="servingSecondaryTitle"
                      control={control}
                      render={({ field, fieldState: { error } }) => (
                        <Select
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
                      name="servingSecondaryContactName"
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
                      name="servingSecondaryDesignation"
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
                      name="servingSecondaryContactEmails"
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
                      name="servingSecondaryContactNo"
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
                      name="servingSecondaryContactWhatsappNo"
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
                  </div>
                </div>
                <div className="mt-4">
                  <h2>Address</h2>
                  <h3 className="font-medium my-3">Billing address</h3>
                  <div className="grid grid-cols-3 gap-4">
                    <Controller
                      name="servingAddress"
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
                      name="servingCountry"
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
                      name="servingState"
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
                      name="servingCity"
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
                      name="servingprimaryPinCode"
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
                  <h3 className="font-medium my-3">Shipping address</h3>
                  <div className="grid grid-cols-3 gap-4">
                    <Controller
                      name="servingSecondaryAddress"
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
                      name="servingSecondaryCountry"
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
                      name="servingSecondaryState"
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
                      name="servingsecondaryCity"
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
                      name="servingSecondaryPinCode"
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
                </div>
              </div>
            )}
          </div>
          <Button size="lg" color="primary" type="submit">
            Submit
          </Button>
        </form>
      )}
    </>
  );
};

export default CreateCompanyForm;
