import React, { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useDispatch, useSelector } from "react-redux";
import {
  createCompanyForm,
  getAllCompanyUnits,
} from "../../toolkit/slices/companySlice";
import { Input } from "@heroui/input";
import { formatGSTInput, maskEmail, maskMobileNumber } from "../../common";
import { addToast } from "@heroui/toast";
import { getSingleLeadDataByLeadId } from "../../toolkit/slices/leadSlice";
import { useParams } from "react-router-dom";
import {
  getAllCitiesByStateName,
  getAllCountries,
  getAllStatesByCountryName,
  getIndustryDataBySubSubIndustryId,
  getSubSubIndustryBySubIndustryId,
} from "../../toolkit/slices/commonSlice";
import { Select, SelectItem } from "@heroui/select";
import NewSelect from "../../components/NewSelect";
import SingleFileUploader from "../../components/SingleFileUploader";
import { Button } from "@heroui/button";

const formSchema = ({
  isExistingCompany,
  isUnit,
  parentLead,
  primaryContact,
  secondaryContact,
  adminRole,
}) =>
  z.object({
    ...(isExistingCompany
      ? {
          companyId: z.string().min(1, "please select the company."),
        }
      : {
          companyName: z.string().min(1, "Please enter company name"),
        }),
    isUnit: z.boolean(),
    ...(isUnit
      ? {
          unitName: z.string().min(1, "Please enter unit name"),
        }
      : {
          unitId: z.string().min(1, "Please select unit."),
        }),
    companyAge: z.string().min(1, "Please enter company age"),
    ...(parentLead
      ? {
          leadId: z.string().min(1, "Please select lead."),
        }
      : {}),
    gstType: z.string().min(1, "Please select gst type."),
    gstNo: z.string().min(15, "please enter GST number"),
    panNo: z.string().min(10, "please enter pan number"),
    amount:z.string().min(1,"please enter the amount ."),
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

    ...(secondaryContact
      ? {
          secondaryTitle: z.enum(["master", "mr", "mrs", "miss"], {
            required_error: "Please select the salutation",
          }),
          secondaryContactName: z
            .string()
            .min(1, "Please enter contact person name"),
          secondaryDesignation: z
            .string()
            .min(1, "Please select the designation"),
          secondaryContactEmails: z
            .string()
            .email("Please enter a valid email address"),
          secondaryContactNo: z.string().min(1, "Please enter contact number"),
          secondaryContactWhatsappNo: z
            .string()
            .min(1, "Please enter whatsapp number"),
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
  });

const defaultValues = ({
  isExistingCompany,
  isUnit,
  parentLead,
  primaryContact,
  secondaryContact,
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
  amount:"",
  assigneeId: "",
  industryId: "",
  subIndustryId: "",
  subsubIndustryId: "",
  industrydataId: [],
  gstDocuments: "",
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
        contactId:"",
      }),
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
});

const CreateLeadCompanyForm = () => {
  const dispatch = useDispatch();
  const { userId, leadId } = useParams();
  const userRole = useSelector((state) => state.auth.currentUser?.roles);
  const adminRole = userRole.includes("ADMIN");
  const existingCompanyList = useSelector(
    (state) => state.company.existingCompanyList
  );
  const countryList = useSelector((state) => state.common.countriesList);
  const statesList = useSelector((state) => state.common.statesList);
  const citiesList = useSelector((state) => state.common.citiesList);
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
    (state) => state.leads.singleLeadResponseData
  );
  const [formValidation, setFormValidation] = useState({
    parentLead: singleLeadResponseData?.parent ? true : false,
    isUnit: existingCompanyList?.length > 0 ? true : false,
    primaryContact: false,
    secondaryContact: false,
    adminRole: adminRole,
  });
    const [panError, setPanError] = useState("");
    const [gstError, setGstError] = useState("");

  useEffect(() => {
    dispatch(getSingleLeadDataByLeadId({ leadId, userId }));
    dispatch(getAllCountries());
  }, []);

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

  const handleSelectCompany = (e) => {
    dispatch(getAllCompanyUnits(e));
    form.resetFields(["unitId"]);
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

  const onSubmit = (values) => {
    values.leadId = singleLeadResponseData?.parent
      ? values?.leadId
      : data?.id
        ? data?.id
        : data?.leadId;
    if (existingCompanyList?.length > 0) {
      values.isPresent = true;
    } else {
      values.isPresent = false;
    }
    dispatch(createCompanyForm(values))
      .then((response) => {
        if (response.meta.requestStatus === "fulfilled") {
          addToast({
            title: "Company created successfully.",
            color: "success",
          });
          reset(defaultValues());
        } else {
          addToast({ title: "Something went wrong !.", color: "danger" });
        }
      })
      .catch(() => {
        addToast({ title: "Something went wrong !.", color: "danger" });
      });
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
                name="unitId"
                control={control}
                render={({ field, fieldState: { error } }) => (
                  <NewSelect
                    isRequired
                    label="Select unit."
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
                  value={[field.value]}
                  onSelectionChange={(e) => field.onChange(Array.from(e)[0])}
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
                    handlePanChange(e);
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
                  isRequired
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
                  label="Primary contct"
                  errorMessage={error?.message}
                  isInvalid={!!error}
                  {...field}
                  value={field.value}
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
              </>
            ) : (
              <Controller
                name="contactId"
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
          <h3 className="font-medium my-3">Secondary contacts</h3>
          <div className="grid grid-cols-3 gap-4">
            <Controller
              name="secondaryContact"
              control={control}
              render={({ field, fieldState: { error } }) => (
                <Select
                  isRequired={true}
                  label="Secondary contct"
                  errorMessage={error?.message}
                  isInvalid={!!error}
                  {...field}
                  value={field.value}
                  onChange={(e) => {
                    field.onChange(e.target.value === "true");
                    setFormValidation((prev) => ({
                      ...prev,
                      secondaryContact: e.target.value === "true",
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
      </div>
      <Button size="lg" color="primary" type="submit" className="mt-2">
        Submit
      </Button>
    </form>
  );
};

export default CreateLeadCompanyForm;
