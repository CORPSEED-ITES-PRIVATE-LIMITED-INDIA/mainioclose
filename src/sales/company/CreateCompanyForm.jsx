import { useEffect, useState } from "react";
import CustomSearchInput from "../../components/CustomSearchInput";
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  Checkbox,
  DatePicker,
  Divider,
  Input,
  Select,
  SelectItem,
  Textarea,
} from "@heroui/react";
import { useDispatch, useSelector } from "react-redux";
import NewSelect from "../../components/NewSelect";
import {
  getAllCompanyType,
  getAllGstTypeByCompanyTypeId,
} from "../../toolkit/slices/companySlice";
import {
  getLocalTimeZone,
  parseAbsoluteToLocal,
  toCalendarDate,
  today,
} from "@internationalized/date";
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
import SingleFileUploader from "../../components/SingleFileUploader";
import { ArrowLeft } from "lucide-react";
import { formatGSTInput, formatPANInput } from "../../common";
import { getClientDesiginationList } from "../../toolkit/slices/settingSlice";

const CreateCompanyForm = () => {
  const dispatch = useDispatch();
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
  const [isNewCompany, setIsNewCompany] = useState(false);
  const [fileUrl, setFileUrl] = useState("");
  const formValues = {
    companyName: "",
    panNo: "",
    rating: "",
    consultantPresent: "",
    gstNo: "",
    establishDate: "",
    companyType: "",
    gstType: "",
    businessType: "",
    gstDocuments: "",
    consultantOrCompany: "",
    companyAge: "",
    isPrimaryAddress: "",
    primaryTitle: "",
    primaryPinCode: "",
    isSecondaryAddress: "",
    secondaryTitle: "",
    secondaryAddress: "",
    secondaryCity: "",
    secondaryState: "",
    secondaryPinCode: "",
    secondaryCountry: "",
    assigneeId: "",
    status: "",
    contactName: "",
    contactEmails: "",
    contactNo: "",
    contactWhatsappNo: "",
    primaryDesignation: "",
    secondaryContactName: "",
    secondaryContactEmails: "",
    secondaryContactNo: "",
    secondaryContactWhatsappNo: "",
    secondaryDesignation: "",
    updatedBy: "",
    industryId: "",
    subIndustryId: "",
    subsubIndustryId: "",
    industrydataId: [],
    servingName: "",
    servingPanNo: "",
    servingCompanyType: "",
    servingGstNo: "",
    servingGstDocuments: "",
    servingCompanyAge: "",
    servingEstablishDate: "",
    servingAddress: "",
    servingCity: "",
    servingState: "",
    servingCountry: "",
    servingprimaryPinCode: "",
    servingSecondaryAddress: "",
    servingsecondaryCity: "",
    servingSecondaryState: "",
    servingSecondaryCountry: "",
    servingSecondaryPinCode: "",
    servingPrimaryContact: "",
    servingPrimaryTitle: "",
    servingContactName: "",
    servingContactEmails: "",
    servingContactNo: "",
    servingContactWhatsappNo: "",
    servingPrimaryDesignation: "",
    servingSecondaryContact: "",
    servingSecondaryTitle: "",
    servingSecondaryContactName: "",
    servingSecondaryContactEmails: "",
    servingSecondaryContactNo: "",
    servingSecondaryContactWhatsappNo: "",
    servingSecondaryDesignation: "",
    servingstatus: "",
    servingParentServing: "",
    parentServingCompany: "",
    createDate: "",
    industries: "",
    subIndustry: "",
    subsubIndustry: "",
    industriesData: [],
    paymentTerm: "",
    aggrement: "",
    aggrementPresent: false,
    nda: "",
    ndaPresent: false,
    revenue: "",
    state: "",
    address: "",
    country: "",
    primaryContact: "",
    city: "",
    secondaryContact: "",
    consultant: "",
  };
  const [formData, setFormData] = useState(formValues);
  const [gstAndPanData, setGstAndPanData] = useState({
    pan: false,
    gst: false,
  });
  const [panError, setPanError] = useState("");
  const [gstError, setGstError] = useState("");

  const handlePanChange = (e) => {
    const rawValue = e.target.value;
    const formattedValue = formatPANInput(rawValue);
    setFormData((prev) => ({
      ...prev,
      panNo: formattedValue,
    }));
    if (formattedValue.length === 10 && !panRegex.test(formattedValue)) {
      setPanError("Invalid PAN Number");
    } else {
      setPanError("");
    }
  };

  const validateGST = (gstNo, stateName) => {
    if (!gstNo) {
      return "Please enter GST number";
    }
    if (!gstRegex.test(gstNo)) {
      return "Invalid GST Number";
    }
    const selectedState = statesList.find((s) => s.name === stateName);
    if (selectedState && gstNo.slice(0, 2) !== selectedState.gstCode) {
      return "GST code does not match selected state";
    }
    return ""; // No error
  };

  const handleGstChange = (e) => {
    const rawValue = e.target.value;
    const formattedValue = formatGSTInput(rawValue); // Format the input

    // Update form data with formatted value
    setFormData((prev) => ({
      ...prev,
      gstNo: formattedValue,
    }));

    // Validate GST with state
    const error = validateGST(formattedValue, formData.state);
    setGstError(error);
  };

  const handleStateChange = (stateName) => {
    // Update form data and fetch cities
    setFormData((prev) => ({ ...prev, state: stateName }));
    dispatch(getAllCitiesByStateName(stateName)); // Preserve your existing dispatch

    // Re-validate GST when state changes
    const error = validateGST(formData.gstNo, stateName);
    setGstError(error);
  };

  console.log("dkjhdskfjhkjdhkjfd", formData);

  useEffect(() => {
    dispatch(getAllCompanyType());
    dispatch(getAllUsers());
    dispatch(getAllMainIndustry());
    dispatch(getClientDesiginationList());
    dispatch(getAllContactDetails());
    dispatch(getAllCountries());
  }, [dispatch]);

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
        <h1 className="font-medium ">Company details</h1>
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
        <div className="max-h-[70vh] overflow-auto mt-2 p-2 ">
          <Card className="mt-4">
            <CardHeader>Company info</CardHeader>
            <CardBody>
              <div className="grid grid-cols-3 gap-4">
                <Select
                  label="Company type"
                  name="consultantOrCompany"
                  errorMessage="please select role as"
                  selectedKeys={[formData?.consultantOrCompany]}
                  isRequired
                  items={[
                    { label: "Consultant", key: "consultant" },
                    { label: "Company", key: "company" },
                  ]}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      consultantOrCompany: e.target.value,
                    }))
                  }
                >
                  {(item) => (
                    <SelectItem key={item?.key}>{item?.label}</SelectItem>
                  )}
                </Select>
                <Input
                  isRequired
                  label="Company name"
                  name="companyName"
                  errorMessage="please enter company name"
                  value={formData?.companyName}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      companyName: e.target.value,
                    }))
                  }
                />
                <NewSelect
                  isRequired={true}
                  errorMessage={"please select the company structure"}
                  label="Company structure"
                  name="companyType"
                  data={companyTypeList || []}
                  labelKey={"name"}
                  valueKey={"id"}
                  value={formData?.companyType}
                  onChange={(e) => {
                    dispatch(getAllGstTypeByCompanyTypeId(e));
                    setFormData((prev) => ({ ...prev, companyType: e }));
                  }}
                />
                <NewSelect
                  isRequired={true}
                  errorMessage={"please select the gst type"}
                  label="GST type"
                  name="gstType"
                  data={gstTypeList?.gstBussinessType || []}
                  labelKey={"name"}
                  valueKey={"id"}
                  onChange={(e) => {
                    dispatch(getAllGstTypeByCompanyTypeId(e));
                    setFormData((prev) => ({ ...prev, gstType: e }));
                  }}
                />
                <NewSelect
                  isRequired={true}
                  errorMessage={"please select the business type"}
                  label="Business type"
                  name="businessType"
                  data={businessTypeList?.gstTypePrice || []}
                  labelKey={"name"}
                  valueKey={"id"}
                  value={formData?.businessType}
                  onChange={(e) => {
                    setFormData((prev) => ({ ...prev, businessType: e }));
                    const foundObject = businessTypeList?.gstTypePrice?.find(
                      (item) => item?.id === e
                    );
                    setGstAndPanData({
                      pan: foundObject?.panPresent,
                      gst: foundObject?.gstPresent,
                    });
                  }}
                />

                {gstAndPanData?.gst && (
                  <Input
                    isRequired
                    label="GST number"
                    name="gstNo"
                    value={formData.gstNo}
                    onChange={handleGstChange}
                    maxLength={15} // Restrict to 15 characters
                    errorMessage={gstError} // Show validation error
                    isInvalid={!!gstError} // Mark as invalid if there's an error
                  />
                )}

                {gstAndPanData?.pan && (
                  <Input
                    isRequired
                    label="Pan number"
                    name="panNo"
                    value={formData.panNo}
                    onChange={handlePanChange}
                    maxLength={10}
                    errorMessage={
                      panError ||
                      (formData.panNo === "" ? "Please enter PAN number" : "")
                    }
                    isInvalid={!!panError}
                  />
                )}

                <DatePicker
                  errorMessage="please enter company incorporate date"
                  showMonthAndYearPickers
                  label="Company incorporate date"
                  name="establishDate"
                  // value={parseAbsoluteToLocal(formData?.establishDate)}
                  maxValue={today(getLocalTimeZone())}
                  onChange={(e) => {
                    setFormData((prev) => ({
                      ...prev,
                      establishDate: toCalendarDate(e).toString(),
                    }));
                  }}
                />

                <NewSelect
                  isRequired={true}
                  errorMessage={"please select the assignee"}
                  label="Select assignee"
                  name="assigneeId"
                  data={allUsers || []}
                  labelKey={"fullName"}
                  valueKey={"id"}
                  value={formData?.assigneeId}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, assigneeId: e }))
                  }
                />

                <NewSelect
                  isRequired={true}
                  errorMessage={"please select the industry"}
                  label="Select industry"
                  name="industryId"
                  data={allIndustry || []}
                  labelKey={"name"}
                  valueKey={"id"}
                  value={formData?.industryId}
                  onChange={(e) => {
                    dispatch(getSubIndustryByIndustryId(e));
                    setFormData((prev) => ({ ...prev, industryId: e }));
                  }}
                />

                <NewSelect
                  isRequired={true}
                  errorMessage={"please select the sub industry"}
                  label="Select sub industry"
                  name="subIndustryId"
                  data={subIndustryListById || []}
                  labelKey={"name"}
                  valueKey={"id"}
                  value={formData?.subIndustryId}
                  onChange={(e) => {
                    dispatch(getSubSubIndustryBySubIndustryId(e));
                    setFormData((prev) => ({ ...prev, subIndustryId: e }));
                  }}
                />

                <NewSelect
                  isRequired={true}
                  errorMessage={"please select the category"}
                  label="Select category"
                  name="subsubIndustryId"
                  data={subSubIndustryListById || []}
                  labelKey={"name"}
                  valueKey={"id"}
                  value={formData?.subsubIndustryId}
                  onChange={(e) => {
                    dispatch(getIndustryDataBySubSubIndustryId(e));
                    setFormData((prev) => ({ ...prev, subsubIndustryId: e }));
                  }}
                />

                <NewSelect
                  isRequired={true}
                  errorMessage={"please select the business activity"}
                  label="Select category"
                  name="industrydataId"
                  selectionMode={"multiple"}
                  data={industryDataListById || []}
                  labelKey={"name"}
                  valueKey={"id"}
                  value={formData?.industrydataId}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, industrydataId: e }))
                  }
                />

                <SingleFileUploader fileUrl={fileUrl} setFileUrl={setFileUrl} />
              </div>
            </CardBody>
          </Card>
          <Card className="mt-4">
            <CardHeader>Arrangement detail</CardHeader>
            <CardBody>
              <div className="grid grid-cols-3 gap-4">
                <Select
                  isRequired
                  errorMessage="please select rating"
                  label="Rating"
                  name="rating"
                  items={[
                    { label: "Gold", key: "Gold" },
                    { label: "Silver", key: "Silver" },
                    { label: "Bronze", key: "Bronze" },
                  ]}
                  selectedKeys={[formData?.rating]}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, rating: e.target.value }))
                  }
                >
                  {(item) => (
                    <SelectItem key={item?.key}>{item?.label}</SelectItem>
                  )}
                </Select>
                <Select
                  isRequired
                  errorMessage="please select payment term"
                  label="Payment term"
                  name="paymentTerm"
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
                  selectedKeys={[formData?.paymentTerm]}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      paymentTerm: e.target.value,
                    }))
                  }
                >
                  {(item) => (
                    <SelectItem key={item?.key}>{item?.label}</SelectItem>
                  )}
                </Select>
                <Select
                  isRequired
                  errorMessage="please select aggrement"
                  label="Aggrement"
                  name="aggrementPresent"
                  selectedKeys={[formData?.aggrementPresent]}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      aggrementPresent: JSON.parse(e.target.value),
                    }))
                  }
                  items={[
                    { label: "Yes", key: true },
                    { label: "No", key: false },
                  ]}
                >
                  {(item) => (
                    <SelectItem key={Boolean(item?.key)}>
                      {item?.label}
                    </SelectItem>
                  )}
                </Select>

                {formData?.aggrementPresent && (
                  <SingleFileUploader fileUrl={""} setFileUrl={() => ""} />
                )}

                <Select
                  isRequired
                  errorMessage="please select NDA"
                  label="NDA"
                  name="ndaPresent"
                  selectedKeys={[formData?.ndaPresent]}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      ndaPresent: JSON.parse(e.target.value),
                    }))
                  }
                  items={[
                    { label: "Yes", key: true },
                    { label: "No", key: false },
                  ]}
                >
                  {(item) => (
                    <SelectItem key={item?.key}>{item?.label}</SelectItem>
                  )}
                </Select>

                {formData?.ndaPresent && (
                  <SingleFileUploader fileUrl={""} setFileUrl={() => ""} />
                )}
              </div>
            </CardBody>
          </Card>
          <Card className="mt-4">
            <CardHeader>Contacts</CardHeader>
            <CardBody>
              <h1 className="font-medium my-3">Primary contacts</h1>
              <div className="grid grid-cols-3 gap-4 w-full">
                <Select
                  isRequired
                  errorMessage="please select the salutation"
                  label="Salutation"
                  name="primaryTitle"
                  items={[
                    { label: "Master.", key: "master" },
                    { label: "Mr.", key: "mr" },
                    { label: "Mrs.", key: "mrs" },
                    { label: "Miss.", key: "miss" },
                  ]}
                  selectedKeys={[formData?.primaryTitle]}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      primaryTitle: e.target.value,
                    }))
                  }
                >
                  {(item) => (
                    <SelectItem key={item?.key}>{item?.label}</SelectItem>
                  )}
                </Select>
                <Input
                  isRequired
                  errorMessage="please enter contact person name"
                  name="contactName"
                  label="Name"
                  value={formData?.contactName}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      contactName: e.target.value,
                    }))
                  }
                />
                <NewSelect
                  isRequired={true}
                  errorMessage={"please select the designation"}
                  data={desiginationList || []}
                  label={"Designation"}
                  name={"primaryDesignation"}
                  labelKey={"name"}
                  valueKey={"id"}
                  value={formData?.primaryDesignation}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, primaryDesignation: e }))
                  }
                />
                <Input
                  isRequired
                  errorMessage="please enter email address"
                  label="Email"
                  name="contactEmails"
                  type="email"
                  value={formData?.contactEmails}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      contactEmails: e.target.value,
                    }))
                  }
                />
                <Input
                  isRequired
                  errorMessage="please enter contact number"
                  label="Contact number"
                  name="contactNo"
                  value={formData?.contactNo}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      contactNo: e.target.value,
                    }))
                  }
                />
                <Input
                  isRequired
                  errorMessage="please enter whatsapp number"
                  label="Whatsapp number"
                  name="contactWhatsappNo"
                  value={formData?.contactWhatsappNo}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      contactWhatsappNo: e.target.value,
                    }))
                  }
                />
              </div>
              <h1 className="font-medium my-3">Secondary contacts</h1>
              <div className="grid grid-cols-3 gap-4">
                <Select
                  isRequired
                  errorMessage="please select the salutation"
                  label="Salutation"
                  name="secondaryTitle"
                  items={[
                    { label: "Master.", key: "master" },
                    { label: "Mr.", key: "mr" },
                    { label: "Mrs.", key: "mrs" },
                    { label: "Miss.", key: "miss" },
                  ]}
                  selectedKeys={[formData?.secondaryTitle]}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      secondaryTitle: e.target.value,
                    }))
                  }
                >
                  {(item) => (
                    <SelectItem key={item?.key}>{item?.label}</SelectItem>
                  )}
                </Select>
                <Input
                  isRequired
                  errorMessage="please enter contact person name"
                  name="secondaryContactName"
                  label="Name"
                  value={formData?.secondaryContactName}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      secondaryContactName: e.target.value,
                    }))
                  }
                />
                <NewSelect
                  isRequired={true}
                  errorMessage={"please select the designation"}
                  data={desiginationList || []}
                  label={"Designation"}
                  name={"secondaryDesignation"}
                  labelKey={"name"}
                  valueKey={"id"}
                  value={formData?.secondaryDesignation}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      secondaryDesignation: e,
                    }))
                  }
                />
                <Input
                  isRequired
                  errorMessage="please enter email address"
                  label="Email"
                  name="secondaryContactEmails"
                  type="email"
                  value={formData?.secondaryContactEmails}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      secondaryContactEmails: e.target.value,
                    }))
                  }
                />
                <Input
                  isRequired
                  errorMessage="please enter contact number"
                  label="Contact number"
                  name="secondaryContactNo"
                  value={formData?.secondaryContactNo}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      secondaryContactNo: e.target.value,
                    }))
                  }
                />
                <Input
                  isRequired
                  errorMessage="please enter whatsapp number"
                  label="Whatsapp number"
                  name="secondaryContactWhatsappNo"
                  value={formData?.secondaryContactWhatsappNo}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      secondaryContactWhatsappNo: e.target.value,
                    }))
                  }
                />
              </div>
            </CardBody>
          </Card>
          <Card className="mt-4">
            <CardHeader>Address</CardHeader>
            <CardBody>
              <h1 className="font-medium my-3">Billing address</h1>
              <div className="grid grid-cols-3 gap-4">
                <Textarea
                  isRequired
                  errorMessage="please enter primary address"
                  label="Address"
                  name="address"
                  value={formData?.address}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      address: e.target.value,
                    }))
                  }
                />
                <NewSelect
                  data={countryList || []}
                  isRequired={true}
                  errorMessage={"please select the country"}
                  label={"Country"}
                  name={"country"}
                  labelKey={"name"}
                  valueKey={"name"}
                  value={formData?.country}
                  onChange={(e) => {
                    dispatch(getAllStatesByCountryName(e));
                    setFormData((prev) => ({ ...prev, country: e }));
                  }}
                />
                <NewSelect
                  data={statesList || []}
                  errorMessage={formData.state ? "" : "Please select the state"}
                  isRequired={true}
                  label="State"
                  name="state"
                  labelKey="name"
                  valueKey="name"
                  value={formData.state}
                  onChange={handleStateChange}
                />
                <NewSelect
                  data={citiesList || []}
                  errorMessage={"please select the city"}
                  isRequired={true}
                  label={"City"}
                  name={"city"}
                  labelKey={"name"}
                  valueKey={"name"}
                  value={formData?.city}
                  onChange={(e) => {
                    setFormData((prev) => ({ ...prev, city: e }));
                  }}
                />
                <Input
                  isRequired
                  errorMessage="please enter primary pin code"
                  label="Pin code"
                  name="primaryPinCode"
                  value={formData?.primaryPinCode}
                  onChange={(e) => {
                    setFormData((prev) => ({ ...prev, primaryPinCode: e }));
                  }}
                />
              </div>
              <div>
                <h1 className="font-medium my-3">Shipping address</h1>
                <Checkbox defaultSelected>Same as billing address</Checkbox>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <Textarea
                  label="Address"
                  name="secondaryAddress"
                  value={formData?.secondaryAddress}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      secondaryAddress: e.target.value,
                    }))
                  }
                />
                <NewSelect
                  data={countryList || []}
                  label={"Country"}
                  name={"secondaryCountry"}
                  labelKey={"name"}
                  valueKey={"name"}
                  value={formData?.secondaryCountry}
                  onChange={(e) => {
                    dispatch(getAllStatesByCountryName(e));
                    setFormData((prev) => ({ ...prev, secondaryCountry: e }));
                  }}
                />
                <NewSelect
                  data={statesList || []}
                  label={"State"}
                  name={"secondaryState"}
                  labelKey={"name"}
                  valueKey={"name"}
                  value={formData?.secondaryState}
                  onChange={(e) => {
                    dispatch(getAllCitiesByStateName(e));
                    setFormData((prev) => ({ ...prev, secondaryState: e }));
                  }}
                />
                <NewSelect
                  data={citiesList || []}
                  label={"City"}
                  name={"secondaryCity"}
                  labelKey={"name"}
                  valueKey={"name"}
                  value={formData?.secondaryCity}
                  onChange={(e) => {
                    setFormData((prev) => ({ ...prev, secondaryCity: e }));
                  }}
                />
                <Input
                  label="Pin code"
                  name="secondaryPinCode"
                  value={formData?.secondaryPinCode}
                  onChange={(e) => {
                    setFormData((prev) => ({
                      ...prev,
                      secondaryPinCode: e.target.value,
                    }));
                  }}
                />
              </div>
            </CardBody>
          </Card>
          {formData?.consultantOrCompany === "consultant" && (
            <div>
              <div className="my-6 flex justify-center">
                <h1 className="font-medium text-lg">Serving company details</h1>
              </div>
              <Card className="mt-4">
                <CardHeader>Company info</CardHeader>
                <CardBody>
                  <div className="grid grid-cols-3 gap-4">
                    <Input
                      isRequired
                      errorMessage="please enter serving company name"
                      label="Serving company name"
                      name="servingName"
                      value={formData?.servingName}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          servingName: e.target.value,
                        }))
                      }
                    />
                    <NewSelect
                      isRequired={true}
                      errorMessage={"please select the company structure"}
                      label="Serving company structure"
                      name="servingCompanyType"
                      data={companyTypeList || []}
                      labelKey={"name"}
                      valueKey={"id"}
                      value={formData?.servingCompanyType}
                      onChange={(e) => {
                        dispatch(getAllGstTypeByCompanyTypeId(e));
                        setFormData((prev) => ({
                          ...prev,
                          servingCompanyType: e.target.value,
                        }));
                      }}
                    />
                    <Input
                      isRequired
                      errorMessage="please enter serving company GST number"
                      label="Serving company GST number"
                      name="servingGstNo"
                      value={formData?.servingGstNo}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          servingGstNo: e.target.value,
                        }))
                      }
                    />

                    <Input
                      isRequired
                      errorMessage="please enter serving PAN number"
                      label="Serving company PAN number"
                      name="servingPanNo"
                      value={formData?.servingPanNo}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          servingPanNo: e.target.value,
                        }))
                      }
                    />
                    <DatePicker
                      errorMessage="please enter serving company incorporate date"
                      showMonthAndYearPickers
                      label="Serving company incorporate date"
                      name="servingEstablishDate"
                      maxValue={today(getLocalTimeZone())}
                      // value={parseAbsoluteToLocal(
                      //   formData?.servingEstablishDate
                      // )}
                      onChange={(e) => {
                        setFormData((prev) => ({
                          ...prev,
                          servingEstablishDate: toCalendarDate(e).toString(),
                        }));
                      }}
                    />
                    <NewSelect
                      isRequired={true}
                      errorMessage={"please select the industry"}
                      label="Select industry"
                      name="industries"
                      data={allIndustry || []}
                      labelKey={"name"}
                      valueKey={"id"}
                      value={formData?.industries}
                      onChange={(e) => {
                        dispatch(getSubIndustryByIndustryId(e));
                        setFormData((prev) => ({ ...prev, industries: e }));
                      }}
                    />
                    <NewSelect
                      isRequired={true}
                      errorMessage={"please select the sub industry"}
                      label="Select sub industry"
                      name="subIndustry"
                      data={subIndustryListById || []}
                      labelKey={"name"}
                      valueKey={"id"}
                      value={formData?.subIndustry}
                      onChange={(e) => {
                        dispatch(getSubSubIndustryBySubIndustryId(e));
                        setFormData((prev) => ({ ...prev, subIndustry: e }));
                      }}
                    />
                    <NewSelect
                      isRequired={true}
                      errorMessage={"please select the category"}
                      label="Select category"
                      name="subsubIndustry"
                      data={subSubIndustryListById || []}
                      labelKey={"name"}
                      valueKey={"id"}
                      value={formData?.subsubIndustry}
                      onChange={(e) => {
                        dispatch(getIndustryDataBySubSubIndustryId(e));
                        setFormData((prev) => ({ ...prev, subsubIndustry: e }));
                      }}
                    />
                    <NewSelect
                      isRequired={true}
                      errorMessage={"please select the business activity"}
                      label="Select category"
                      name="industriesData"
                      data={industryDataListById || []}
                      labelKey={"name"}
                      valueKey={"id"}
                      value={formData?.industriesData}
                      onChange={(e) => {
                        setFormData((prev) => ({ ...prev, industriesData: e }));
                      }}
                    />
                    <SingleFileUploader
                      fileUrl={fileUrl}
                      setFileUrl={setFileUrl}
                    />
                  </div>
                </CardBody>
              </Card>
              <Card className="mt-4">
                <CardHeader>Contacts</CardHeader>
                <CardBody>
                  <h1 className="font-medium my-3">Primary contacts</h1>
                  <div className="grid grid-cols-3 gap-4">
                    <Select
                      isRequired
                      errorMessage="please select the salutation"
                      label="Salutation"
                      name="servingPrimaryTitle"
                      items={[
                        { label: "Master.", key: "master" },
                        { label: "Mr.", key: "mr" },
                        { label: "Mrs.", key: "mrs" },
                        { label: "Miss.", key: "miss" },
                      ]}
                      selectedKeys={[formData?.servingPrimaryTitle]}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          servingPrimaryTitle: e.target.value,
                        }))
                      }
                    >
                      {(item) => (
                        <SelectItem key={item?.key}>{item?.label}</SelectItem>
                      )}
                    </Select>
                    <Input
                      isRequired
                      errorMessage="please enter contact person name"
                      name="servingContactName"
                      label="Name"
                      value={formData?.servingContactName}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          servingContactName: e.target.value,
                        }))
                      }
                    />
                    <NewSelect
                      isRequired={true}
                      errorMessage={"please select the designation"}
                      data={desiginationList || []}
                      label={"Designation"}
                      name={"servingPrimaryDesignation"}
                      labelKey={"name"}
                      valueKey={"id"}
                      value={formData?.servingPrimaryDesignation}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          servingPrimaryDesignation: e,
                        }))
                      }
                    />
                    <Input
                      isRequired
                      errorMessage="please enter email address"
                      label="Email"
                      name="servingContactEmails"
                      type="email"
                      value={formData?.servingContactEmails}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          servingContactEmails: e.target.value,
                        }))
                      }
                    />
                    <Input
                      isRequired
                      errorMessage="please enter contact number"
                      label="Contact number"
                      name="servingContactNo"
                      value={formData?.servingContactNo}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          servingContactNo: e.target.value,
                        }))
                      }
                    />
                    <Input
                      isRequired
                      errorMessage="please enter whatsapp number"
                      label="Whatsapp number"
                      name="servingContactWhatsappNo"
                      value={formData?.servingContactWhatsappNo}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          servingContactWhatsappNo: e.target.value,
                        }))
                      }
                    />
                  </div>

                  <h1 className="font-medium my-3">Secondary contacts</h1>
                  <div className="grid grid-cols-3 gap-4">
                    <Select
                      isRequired
                      errorMessage="please select the salutation"
                      label="Salutation"
                      name="servingSecondaryTitle"
                      items={[
                        { label: "Master.", key: "master" },
                        { label: "Mr.", key: "mr" },
                        { label: "Mrs.", key: "mrs" },
                        { label: "Miss.", key: "miss" },
                      ]}
                      selectedKeys={[formData?.servingSecondaryTitle]}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          servingSecondaryTitle: e.target.value,
                        }))
                      }
                    >
                      {(item) => (
                        <SelectItem key={item?.key}>{item?.label}</SelectItem>
                      )}
                    </Select>
                    <Input
                      isRequired
                      errorMessage="please enter contact person name"
                      name="servingSecondaryContactName"
                      label="Name"
                      value={formData?.servingSecondaryContactName}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          servingSecondaryContactName: e.target.value,
                        }))
                      }
                    />
                    <NewSelect
                      isRequired={true}
                      errorMessage={"please select the designation"}
                      data={desiginationList || []}
                      label={"Designation"}
                      name={"servingSecondaryDesignation"}
                      labelKey={"name"}
                      valueKey={"id"}
                      value={formData?.servingSecondaryDesignation}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          servingSecondaryDesignation: e,
                        }))
                      }
                    />
                    <Input
                      isRequired
                      errorMessage="please enter email address"
                      label="Email"
                      name="servingSecondaryContactEmails"
                      type="email"
                      value={formData?.servingSecondaryContactEmails}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          servingSecondaryContactEmails: e.target.value,
                        }))
                      }
                    />
                    <Input
                      isRequired
                      errorMessage="please enter contact number"
                      label="Contact number"
                      name="servingSecondaryContactNo"
                      value={formData?.servingSecondaryContactNo}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          servingSecondaryContactNo: e.target.value,
                        }))
                      }
                    />
                    <Input
                      isRequired
                      errorMessage="please enter whatsapp number"
                      label="Whatsapp number"
                      name="servingSecondaryContactWhatsappNo"
                      value={formData?.servingSecondaryContactWhatsappNo}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          servingSecondaryContactWhatsappNo: e.target.value,
                        }))
                      }
                    />
                  </div>
                </CardBody>
              </Card>
              <Card className="mt-4">
                <CardHeader>Address</CardHeader>
                <CardBody>
                  <h1 className="font-medium my-3">Billing address</h1>
                  <div className="grid grid-cols-3 gap-4">
                    <Textarea
                      isRequired
                      errorMessage="please enter primary address"
                      label="Address"
                      name="servingAddress"
                      value={formData?.servingAddress}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          servingAddress: e.target.value,
                        }))
                      }
                    />
                    <NewSelect
                      data={countryList || []}
                      isRequired={true}
                      errorMessage={"please select the country"}
                      label={"Country"}
                      name={"servingCountry"}
                      labelKey={"name"}
                      valueKey={"name"}
                      value={formData?.servingCountry}
                      onChange={(e) => {
                        dispatch(getAllStatesByCountryName(e));
                        setFormData((prev) => ({ ...prev, servingCountry: e }));
                      }}
                    />
                    <NewSelect
                      data={statesList || []}
                      errorMessage={"please select the state"}
                      isRequired={true}
                      label={"State"}
                      name={"servingState"}
                      labelKey={"name"}
                      valueKey={"name"}
                      value={formData?.servingState}
                      onChange={(e) => {
                        dispatch(getAllCitiesByStateName(e));
                        setFormData((prev) => ({ ...prev, servingState: e }));
                      }}
                    />
                    <NewSelect
                      data={citiesList || []}
                      errorMessage={"please select the city"}
                      isRequired={true}
                      label={"City"}
                      name={"servingCity"}
                      labelKey={"name"}
                      valueKey={"name"}
                      value={formData?.servingCity}
                      onChange={(e) => {
                        setFormData((prev) => ({ ...prev, servingCity: e }));
                      }}
                    />
                    <Input
                      isRequired
                      errorMessage="please enter primary pin code"
                      label="Pin code"
                      name="servingprimaryPinCode"
                      value={formData?.servingprimaryPinCode}
                      onChange={(e) => {
                        setFormData((prev) => ({
                          ...prev,
                          servingprimaryPinCode: e.target.value,
                        }));
                      }}
                    />
                  </div>
                  <h1 className="font-medium my-3">Shipping address</h1>
                  <div className="grid grid-cols-3 gap-4">
                    <Textarea
                      label="Address"
                      name="servingSecondaryAddress"
                      value={formData?.servingSecondaryAddress}
                      onChange={(e) => {
                        setFormData((prev) => ({
                          ...prev,
                          servingSecondaryAddress: e.target.value,
                        }));
                      }}
                    />
                    <NewSelect
                      data={countryList || []}
                      label={"Country"}
                      name={"servingSecondaryCountry"}
                      labelKey={"name"}
                      valueKey={"name"}
                      value={formData?.servingSecondaryCountry}
                      onChange={(e) => {
                        dispatch(getAllStatesByCountryName(e));
                        setFormData((prev) => ({
                          ...prev,
                          servingSecondaryCountry: e,
                        }));
                      }}
                    />
                    <NewSelect
                      data={statesList || []}
                      label={"State"}
                      name={"servingSecondaryState"}
                      labelKey={"name"}
                      valueKey={"name"}
                      value={formData?.servingSecondaryState}
                      onChange={(e) => {
                        dispatch(getAllCitiesByStateName(e));
                        setFormData((prev) => ({
                          ...prev,
                          servingSecondaryState: e,
                        }));
                      }}
                    />
                    <NewSelect
                      data={citiesList || []}
                      label={"City"}
                      name={"servingsecondaryCity"}
                      labelKey={"name"}
                      valueKey={"name"}
                      value={formData?.servingsecondaryCity}
                      onChange={(e) => {
                        setFormData((prev) => ({
                          ...prev,
                          servingsecondaryCity: e,
                        }));
                      }}
                    />
                    <Input
                      label="Pin code"
                      name="servingSecondaryPinCode"
                      value={formData?.servingSecondaryPinCode}
                      onChange={(e) => {
                        setFormData((prev) => ({
                          ...prev,
                          servingSecondaryPinCode: e.target.value,
                        }));
                      }}
                    />
                  </div>
                </CardBody>
              </Card>
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default CreateCompanyForm;
