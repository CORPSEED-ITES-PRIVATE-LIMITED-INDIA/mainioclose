import React, { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useDispatch, useSelector } from "react-redux";
import {
  createCompanyForm,
  getAllCompanyByStatus,
  getAllCompanyUnits,
  getCompanyDetailsById,
  getCompanyExistData,
  getCompanyUnitsByStateAndCompanyId,
  handleResetExistingCompany,
  updateCompanyForm,
} from "../../toolkit/slices/companySlice";
import { Input } from "@heroui/input";
import {
  formatGSTInput,
  formatPANInput,
  maskEmail,
  maskMobileNumber,
} from "../../common";
import { addToast } from "@heroui/toast";
import { getSingleLeadDataByLeadId } from "../../toolkit/slices/leadSlice";
import { useParams } from "react-router-dom";
import {
  getAllCitiesByStateName,
  getAllContactDetails,
  getAllCountries,
  getAllMainIndustry,
  getAllSecondaryCitiesBySecondaryStateName,
  getAllSecondaryStatesBySecondaryCountryName,
  getAllStatesByCountryName,
  getAllUsers,
  getIndustryDataBySubSubIndustryId,
  getSubIndustryByIndustryId,
  getSubSubIndustryBySubIndustryId,
} from "../../toolkit/slices/commonSlice";
import { Select, SelectItem } from "@heroui/select";
import NewSelect from "../../components/NewSelect";
import SingleFileUploader from "../../components/SingleFileUploader";
import { Button } from "@heroui/button";
import { getClientDesiginationList } from "../../toolkit/slices/settingSlice";
import { ModalFooter } from "@heroui/react";

const formSchema = ({
  isExistingCompany,
  isUnit,
  parentLead,
  primaryContact,
  secondaryContact,
  adminRole,
  editForm,
  isCompanyRegistered,
}) => {
  return z.object({
    ...(isExistingCompany
      ? {
          companyId: z.string().min(1, "please select the company."),
          isUnit: z.boolean(),
          ...(isUnit
            ? {
                unitName: z.string().min(1, "Please enter unit name"),
              }
            : {
                unitId: z.string().min(1, "Please select unit."),
              }),
        }
      : {
          companyName: z.string().min(1, "Please enter company name"),
        }),
    companyAge: z.string().min(1, "Please enter company age"),
    ...(parentLead
      ? {
          leadId: z.string().min(1, "Please select lead."),
        }
      : {}),
    gstType: z.string().min(1, "Please select gst type."),
    ...(isCompanyRegistered
      ? {
          gstNo: z.string().min(15, "please enter GST number"),
          panNo: z.string().min(10, "please enter pan number"),
        }
      : {
          gstNo: z.string().optional(),
          panNo: z.string().optional(),
        }),
    amount: z.string().min(1, "please enter the amount ."),
    ...(adminRole
      ? {
          assigneeId: z.string().min(1, "Please select the assignee"),
        }
      : {}),
    industryId: z.string().min(1, "Please select the industry"),
    subIndustryId: z.string().min(1, "Please select the sub industry"),
    subsubIndustryId: z.string().min(1, "Please select the category"),
    industrydataId: z
      .array(z.string())
      .min(1, "Please select the business activity"),
    gstDocuments: z.string().optional(),
    primaryContact: z.boolean(),
    ...(primaryContact
      ? {
          primaryTitle: z.enum(["master", "mr", "mrs", "miss"], {
            required_error: "Please select the salutation",
          }),
          contactName: z.string().min(1, "Please enter contact person name"),
          primaryDesignation: z
            .string()
            .min(1, "Please select the designation"),
          contactEmails: z.string().email("Please enter a valid email address"),
          contactNo: z.string().min(1, "Please enter contact number"),
          contactWhatsappNo: z.string().min(1, "Please enter whatsapp number"),
        }
      : {
          contactId: z.string().min(1, "please select the contact."),
        }),
    secondaryContact: z.boolean(),
    ...(secondaryContact
      ? {
          secondaryTitle: z
            .enum(["master", "mr", "mrs", "miss"], {
              required_error: "Please select the salutation",
            })
            .optional(),
          secondaryContactName: z.string().optional(),
          secondaryDesignation: z.string().optional(),
          secondaryContactEmails: z.string().optional(),
          secondaryContactNo: z.string().optional(),
          secondaryContactWhatsappNo: z.string().optional(),
        }
      : {
          scontactId: z.string().min(1, "please select the contact."),
        }),
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
    ...(editForm
      ? {
          comment: z.string().min(1, "please enter comment"),
        }
      : {}),
  });
};

const defaultValues = ({
  isExistingCompany,
  isUnit,
  parentLead,
  primaryContact,
  secondaryContact,
  editForm,
}) => ({
  ...(isExistingCompany
    ? {
        companyId: "",
      }
    : {
        companyName: "",
      }),
  isUnit: "",
  ...(isUnit
    ? {
        unitName: "",
      }
    : {
        unitId: "",
      }),
  companyAge: "",
  ...(parentLead
    ? {
        leadId: "",
      }
    : {}),
  gstType: "",
  gstNo: "",
  panNo: "",
  amount: "",
  assigneeId: "",
  industryId: "",
  subIndustryId: "",
  subsubIndustryId: "",
  industrydataId: [],
  gstDocuments: "",
  primaryContact: false,
  ...(primaryContact
    ? {
        primaryTitle: "",
        contactName: "",
        primaryDesignation: "",
        contactEmails: "",
        contactNo: "",
        contactWhatsappNo: "",
      }
    : {
        contactId: "",
      }),
  secondaryContact: false,
  ...(secondaryContact
    ? {
        secondaryTitle: "",
        secondaryContactName: "",
        secondaryDesignation: "",
        secondaryContactEmails: "",
        secondaryContactNo: "",
        secondaryContactWhatsappNo: "",
      }
    : {
        scontactId: "",
      }),
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
  ...(editForm
    ? {
        comment: "",
      }
    : {}),
});

const CreateLeadCompanyForm = ({
  edit,
  companyData,
  onClose,
  companyFilter,
}) => {
  const dispatch = useDispatch();
  const { userId, leadId } = useParams();
  const userRole = useSelector((state) => state.auth.currentUser?.roles);
  const companyDetailById = useSelector(
    (state) => state.company.companyDetailById
  );
  const adminRole = userRole.includes("ADMIN");
  const existingCompanyList = useSelector(
    (state) => state.company.existingCompanyList
  );
  const countryList = useSelector((state) => state.common.countriesList);
  const statesList = useSelector((state) => state.common.statesList);
  const secondaryStateList = useSelector(
    (state) => state.common.secondaryStateList
  );
  const citiesList = useSelector((state) => state.common.citiesList);
  const secondaryCitiesList = useSelector(
    (state) => state.common.secondaryCitiesList
  );
  const allIndustry = useSelector((state) => state.common.allMainIndustry);
  const userList = useSelector((state) => state.common.usersList);
  const allContactList = useSelector((state) => state.common.allContactList);
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
  const singleLeadResponseData = useSelector(
    (state) => state.leads.singleLeadData
  );
  const [formValidation, setFormValidation] = useState({
    isExistingCompany: existingCompanyList?.length > 0 ? true : false,
    parentLead: singleLeadResponseData?.parent ? true : false,
    isUnit: existingCompanyList?.length > 0 ? true : false,
    primaryContact: false,
    secondaryContact: false,
    adminRole: adminRole,
    editForm: edit ? true : false,
    isCompanyRegistered: false,
  });
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
    resolver: zodResolver(formSchema(formValidation)),
    defaultValues: defaultValues(formValidation),
  });

  const state = watch("state");
  const gstNo = watch("gstNo");

  useEffect(() => {
    if (leadId) {
      dispatch(getSingleLeadDataByLeadId({ leadId, userId }));
      dispatch(getAllCountries());
      dispatch(getAllUsers());
      dispatch(getAllMainIndustry());
      dispatch(getClientDesiginationList());
      dispatch(getAllContactDetails());
    }
  }, [dispatch]);

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
    if (companyData?.id !== undefined) {
      dispatch(getAllMainIndustry());
      dispatch(getClientDesiginationList());
      dispatch(getAllCountries());
      dispatch(getAllUsers());
      dispatch(getCompanyDetailsById(companyData?.id)).then((resp) => {
        if (resp.meta.requestStatus === "fulfilled") {
          let editData = resp?.payload;
          setFormValidation((prev) => ({
            ...prev,
            primaryContact: editData?.contactId ? false : true,
            secondaryContact: editData?.scontactId ? false : true,
          }));
          dispatch(getSubIndustryByIndustryId(editData?.industry?.id));
          dispatch(getSubSubIndustryBySubIndustryId(editData?.subIndustry?.id));
          dispatch(
            getIndustryDataBySubSubIndustryId(editData?.subsubIndustry?.id)
          );
          dispatch(getCompanyExistData(editData?.lead?.id));
          dispatch(getCompanyUnitsByStateAndCompanyId(editData?.companyId));
          dispatch(getAllStatesByCountryName(editData?.country));
          dispatch(getAllCitiesByStateName(editData?.state));
          if (editData?.scountry) {
            dispatch(
              getAllSecondaryStatesBySecondaryCountryName(editData?.scountry)
            );
          }
          if (editData?.sstate) {
            dispatch(
              getAllSecondaryCitiesBySecondaryStateName(editData?.sstate)
            );
          }
          reset({
            isPresent: editData?.isPresent,
            companyName: editData?.companyName,
            companyId: editData?.companyId,
            isUnit: editData?.isUnit,
            unitName: editData?.unitName,
            unitId: editData?.unitId,
            panNo: editData?.panNo,
            gstNo: editData?.gstNo,
            gstType: editData?.gstType,
            gstDocuments: editData?.gstDocuments,
            isPrimaryAddress: editData?.isPrimaryAddress,
            companyAge: editData?.companyAge,
            primaryPinCode: editData?.primaryPinCode,
            secondaryPinCode: editData?.secondaryPinCode,
            assigneeId: String(editData?.assigneeId),
            contactId: editData?.contactId,
            contactName: editData?.contactName,
            contactEmails: editData?.contactEmails,
            contactNo: editData?.contactNo,
            contactWhatsappNo: editData?.contactWhatsappNo,
            updatedBy: editData?.updatedBy?.id,
            state: editData?.state,
            address: editData?.address,
            country: editData?.country,
            primaryContact: editData?.primaryContact,
            city: editData?.city,
            isSecondaryAddress: editData?.isSecondaryAddress,
            secondaryContact: editData?.secondaryContact,
            scountry: editData?.scountry,
            saddress: editData?.saddress,
            sstate: editData?.sstate,
            scontactEmails: editData?.scontactEmails,
            scontactNo: editData?.scontactNo,
            scontactName: editData?.scontactName,
            scity: editData?.scity,
            scontactId: editData?.scontactId,
            scontactWhatsappNo: editData?.scontactWhatsappNo,
            amount: editData?.amount,
            comment: editData?.comment,
            secondaryDesignation: editData?.secondaryDesignation?.id
              ? String(editData?.secondaryDesignation?.id)
              : "",
            primaryDesignation: editData?.primaryDesignation?.id
              ? String(editData?.primaryDesignation?.id)
              : "",
            primaryTitle: editData?.title,
            secondaryTitle: editData?.secTitle,
            industryId: String(editData?.industry?.id),
            subIndustryId: String(editData?.subIndustry?.id),
            subsubIndustryId: String(editData?.subsubIndustry?.id),
            industrydataId: editData?.industryDataList?.map((item) =>
              String(item?.id)
            ),
          });
        }
      });
    }
  }, [edit, companyData, reset]);

  const handleSelectCompany = (e) => {
    dispatch(getAllCompanyUnits(e));
    reset({
      panNo: "",
      gstNo: "",
      isPrimaryAddress: false,
      companyAge: "",
      primaryPinCode: "",
      secondaryPinCode: "",
      assigneeId: "",
      updatedBy: "",
      state: "",
      address: "",
      country: "",
      primaryContact: false,
      primaryDesignation: "",
      primaryTitle: "",
      contactId: "",
      contactName: "",
      contactEmails: "",
      contactNo: "",
      contactWhatsappNo: "",
      city: "",
      isSecondaryAddress: false,
      scountry: "",
      saddress: "",
      sstate: "",
      secondaryContact: false,
      secondaryTitle: "",
      scontactEmails: "",
      scontactNo: "",
      scontactName: "",
      scontactWhatsappNo: "",
      secondaryDesignation: "",
      scontactId: "",
      scity: "",
      amount: "",
      comment: "",
      industryId: "",
      subIndustryId: "",
      subsubIndustryId: "",
      industrydataId: [],
    });
  };

  const onSubmit = (values) => {
    values.assigneeId = adminRole ? values?.assigneeId : userId;
    if (edit) {
      values.companyFormId = companyDetailById?.id;
      values.isPresent = companyDetailById?.isPresent;
      values.leadId = singleLeadResponseData?.parent
        ? values?.leadId
        : companyDetailById?.lead?.id;
      values.companyId = companyDetailById?.companyId;
      dispatch(updateCompanyForm(values))
        .then((response) => {
          if (response.meta.requestStatus === "fulfilled") {
            dispatch(getAllCompanyByStatus(companyFilter));
            addToast({
              title: "Company created successfully.",
              color: "success",
            });
            reset(defaultValues(formValidation));
            onClose();
            dispatch(handleResetExistingCompany());
          } else {
            addToast({ title: "Something went wrong !.", color: "danger" });
          }
        })
        .catch(() => {
          addToast({ title: "Something went wrong !.", color: "danger" });
        });
    } else {
      values.isPresent = existingCompanyList?.length > 0 ? true : false;
      values.leadId = singleLeadResponseData?.parent
        ? values?.leadId
        : singleLeadResponseData?.id
          ? singleLeadResponseData?.id
          : singleLeadResponseData?.leadId;
      dispatch(createCompanyForm(values))
        .then((response) => {
          if (response.meta.requestStatus === "fulfilled") {
            addToast({
              title: "Company created successfully.",
              color: "success",
            });
            reset(defaultValues(formValidation));
            dispatch(handleResetExistingCompany());
          } else {
            addToast({ title: "Something went wrong !.", color: "danger" });
          }
        })
        .catch(() => {
          addToast({ title: "Something went wrong !.", color: "danger" });
        });
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="max-h-[64vh] overflow-auto p-3 flex flex-col gap-12">
        <div className="p-4 shadow-[0px_10px_36px_0px_rgba(0,0,0,0.16),0px_0px_0px_1px_rgba(0,0,0,0.06)] rounded-lg">
          <h2 className="mb-2 font-medium text-lg">Company info</h2>
          <div className="grid grid-cols-3 gap-4">
            {existingCompanyList?.length > 0 ? (
              <Controller
                name="companyId"
                control={control}
                render={({ field, fieldState: { error } }) => (
                  <NewSelect
                    isRequired
                    label="Company structure"
                    errorMessage={error?.message}
                    isInvalid={!!error}
                    data={existingCompanyList || []}
                    labelKey="companyName"
                    valueKey="id"
                    value={field.value}
                    onChange={(value) => {
                      field.onChange(value);
                      handleSelectCompany(value);
                    }}
                  />
                )}
              />
            ) : (
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
            )}

            {existingCompanyList?.length > 0 && (
              <>
                <Controller
                  name="isUnit"
                  control={control}
                  render={({ field, fieldState: { error } }) => (
                    <Select
                      isRequired={true}
                      label="New unit"
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

                {formValidation?.isUnit ? (
                  <Controller
                    name="unitName"
                    control={control}
                    render={({ field, fieldState: { error } }) => (
                      <Input
                        isRequired
                        label="Unit name"
                        errorMessage={error?.message}
                        isInvalid={!!error}
                        {...field}
                      />
                    )}
                  />
                ) : (
                  <Controller
                    name="unitId"
                    control={control}
                    render={({ field, fieldState: { error } }) => (
                      <NewSelect
                        isRequired
                        label="Select unit."
                        errorMessage={error?.message}
                        isInvalid={!!error}
                        data={existingCompanyList || []}
                        labelKey="companyName"
                        valueKey="id"
                        value={field.value}
                        onChange={(value) => {
                          field.onChange(value);
                        }}
                      />
                    )}
                  />
                )}
              </>
            )}
            <Controller
              name="companyAge"
              control={control}
              render={({ field, fieldState: { error } }) => (
                <Input
                  isRequired
                  label="Company age (in yrs)"
                  errorMessage={error?.message}
                  isInvalid={!!error}
                  {...field}
                  type="number"
                />
              )}
            />

            {formValidation?.parentLead && (
              <Controller
                name="leadId"
                control={control}
                render={({ field, fieldState: { error } }) => (
                  <NewSelect
                    isRequired
                    label="Select lead "
                    errorMessage={error?.message}
                    isInvalid={!!error}
                    data={singleLeadResponseData?.childLead || []}
                    labelKey="childLeadName"
                    valueKey="childId"
                    value={field.value}
                    onChange={(value) => {
                      field.onChange(value);
                    }}
                  />
                )}
              />
            )}

            <Controller
              name="gstType"
              control={control}
              render={({ field, fieldState: { error } }) => (
                <Select
                  isRequired={true}
                  label="GST type"
                  errorMessage={error?.message}
                  isInvalid={!!error}
                  {...field}
                  selectedKeys={[field.value]}
                  onSelectionChange={(e) => {
                    const key = Array.from(e)[0];
                    field.onChange(key);
                    setFormValidation((prev) => ({
                      ...prev,
                      isCompanyRegistered: key === "Registered",
                    }));
                  }}
                  items={[
                    { label: "Registered", key: "Registered" },
                    { label: "Unregistered", key: "Unregistered" },
                    { label: "SE2", key: "SE2" },
                    { label: "International", key: "International" },
                  ]}
                >
                  {(item) => (
                    <SelectItem key={item.key}>{item.label}</SelectItem>
                  )}
                </Select>
              )}
            />

            <Controller
              name="gstNo"
              control={control}
              render={({ field, fieldState: { error } }) => (
                <Input
                  isRequired={formValidation?.isCompanyRegistered}
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

            <Controller
              name="panNo"
              control={control}
              render={({ field, fieldState: { error } }) => (
                <Input
                  isRequired={formValidation?.isCompanyRegistered}
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

            <Controller
              name="amount"
              control={control}
              render={({ field, fieldState: { error } }) => (
                <Input
                  isRequired
                  label="Amount."
                  type="number"
                  errorMessage={error?.message || panError}
                  isInvalid={!!error || !!panError}
                  {...field}
                  onChange={(e) => {
                    field.onChange(e.target.value);
                  }}
                />
              )}
            />

            {adminRole && (
              <Controller
                name="assigneeId"
                control={control}
                render={({ field, fieldState: { error } }) => (
                  <NewSelect
                    isRequired={true}
                    label="Select assignee"
                    errorMessage={error?.message}
                    isInvalid={!!error}
                    data={userList || []}
                    labelKey="fullName"
                    valueKey="id"
                    value={field.value}
                    onChange={(value) => field.onChange(value)}
                  />
                )}
              />
            )}

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
              name="gstDocuments"
              control={control}
              render={({ field, fieldState: { error } }) => (
                <SingleFileUploader
                  isRequired={formValidation?.isCompanyRegistered}
                  label="GST document"
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
        <div className="p-4 shadow-[0px_10px_36px_0px_rgba(0,0,0,0.16),0px_0px_0px_1px_rgba(0,0,0,0.06)] rounded-lg">
          <h2 className="mb-2 font-medium text-lg">Contacts</h2>
          <h3 className="font-medium my-3">Primary contacts</h3>
          <div className="grid grid-cols-3 gap-4 w-full">
            <Controller
              name="primaryContact"
              control={control}
              render={({ field, fieldState: { error } }) => (
                <Select
                  isRequired={true}
                  label="New Primary contact"
                  errorMessage={error?.message}
                  isInvalid={!!error}
                  selectedKeys={[String(field.value)]}
                  onChange={(e) => {
                    field.onChange(e.target.value === "true");
                    setFormValidation((prev) => ({
                      ...prev,
                      primaryContact: e.target.value === "true",
                    }));
                  }}
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

            {formValidation?.primaryContact ? (
              <>
                <Controller
                  name="primaryTitle"
                  control={control}
                  render={({ field, fieldState: { error } }) => (
                    <Select
                      isRequired={true}
                      label="Salutation"
                      errorMessage={error?.message}
                      selectedKeys={[String(field.value)]}
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
              </>
            ) : (
              <Controller
                name="contactId"
                control={control}
                render={({ field, fieldState: { error } }) => (
                  <NewSelect
                    label="Select contact."
                    isRequired={true}
                    errorMessage={error?.message}
                    isInvalid={!!error}
                    data={
                      allContactList?.length > 0
                        ? allContactList?.map((item) => ({
                            label: `${maskEmail(
                              item?.emails
                            )} || ${maskMobileNumber(item?.contactNo)} `,
                            id: item?.id,
                            email: item?.emails,
                            contact: item?.contactNo,
                          }))
                        : []
                    }
                    labelKey="label"
                    valueKey="id"
                    value={field.value}
                    onChange={(value) => field.onChange(value)}
                  />
                )}
              />
            )}
          </div>
          <h3 className="font-medium my-3">Secondary contacts</h3>
          <div className="grid grid-cols-3 gap-4">
            <Controller
              name="secondaryContact"
              control={control}
              render={({ field, fieldState: { error } }) => {
                return (
                  <Select
                    isRequired
                    label="New secondary contact"
                    errorMessage={error?.message}
                    isInvalid={!!error}
                    selectedKeys={[String(field.value)]}
                    onChange={(e) => {
                      const val = e.target.value === "true";
                      field.onChange(val);
                      setFormValidation((prev) => ({
                        ...prev,
                        secondaryContact: val,
                      }));
                    }}
                    items={[
                      { label: "Yes", key: "true" },
                      { label: "No", key: "false" },
                    ]}
                  >
                    {(item) => (
                      <SelectItem key={item.key}>{item.label}</SelectItem>
                    )}
                  </Select>
                );
              }}
            />

            {formValidation?.primaryContact ? (
              <>
                <Controller
                  name="secondaryTitle"
                  control={control}
                  render={({ field, fieldState: { error } }) => (
                    <Select
                      label="Salutation"
                      errorMessage={error?.message}
                      isInvalid={!!error}
                      selectedKeys={[String(field.value)]}
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
              </>
            ) : (
              <Controller
                name="scontactId"
                control={control}
                render={({ field, fieldState: { error } }) => (
                  <NewSelect
                    label="Select contact."
                    errorMessage={error?.message}
                    isInvalid={!!error}
                    data={
                      allContactList?.length > 0
                        ? allContactList?.map((item) => ({
                            label: `${maskEmail(
                              item?.emails
                            )} || ${maskMobileNumber(item?.contactNo)} `,
                            id: item?.id,
                            email: item?.emails,
                            contact: item?.contactNo,
                          }))
                        : []
                    }
                    labelKey="label"
                    valueKey="id"
                    value={field.value}
                    onChange={(value) => field.onChange(value)}
                  />
                )}
              />
            )}
          </div>
        </div>
        <div className="p-4 shadow-[0px_10px_36px_0px_rgba(0,0,0,0.16),0px_0px_0px_1px_rgba(0,0,0,0.06)] rounded-lg">
          <h2 className="mb-2 font-medium text-lg">Address</h2>
          <h3 className="font-medium my-3">Billing address</h3>
          <div className="grid grid-cols-3 gap-4">
            <Controller
              name="address"
              control={control}
              render={({ field, fieldState: { error } }) => (
                <Input
                  label="Address"
                  isRequired={true}
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
                  isRequired={true}
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
                  isRequired={true}
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
                  isRequired={true}
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
                  isRequired={true}
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
                    dispatch(
                      getAllSecondaryStatesBySecondaryCountryName(value)
                    );
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
                  data={secondaryStateList || []}
                  labelKey="name"
                  valueKey="name"
                  value={field.value}
                  onChange={(value) => {
                    dispatch(getAllSecondaryCitiesBySecondaryStateName(value));
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
                  data={secondaryCitiesList || []}
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

            {edit && (
              <Controller
                name="comment"
                control={control}
                render={({ field, fieldState: { error } }) => (
                  <Input
                    isRequired
                    label="Comment"
                    errorMessage={error?.message}
                    isInvalid={!!error}
                    {...field}
                  />
                )}
              />
            )}
          </div>
        </div>
      </div>

      {edit ? (
        <ModalFooter className="flex justify-end">
          <Button onPress={onClose}>Cancel</Button>
          <Button color="primary" type="submit">
            Submit
          </Button>
        </ModalFooter>
      ) : (
        <Button size="lg" color="primary" type="submit" className="mt-2">
          Submit
        </Button>
      )}
    </form>
  );
};

export default CreateLeadCompanyForm;
