import React, { memo, useEffect, useMemo, useState } from "react";
import { Modal, ModalContent, ModalHeader, ModalBody } from "@heroui/modal";
import { Button, Card, DatePicker, Form, Input, Select } from "antd";
import dayjs from "dayjs";

import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { IndianRupee } from "lucide-react";
import SingleFileUploader from "../../components/SingleFileUploader";
import LoadingSpinner from "../../components/LoadingSpinner";
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
import { addToast } from "@heroui/toast";

const REQUIRED = "This field is required";

const getEmptyUnit = () => ({
  id: 0,
  unitName: "",
  gstNo: "",
  gstTypeId: "",
  gstBusinessTypeId: "",
  gstTypePriceId: "",
  companyTypeId: "",
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
  companyTypeId: "",
  industryId: "",
  subIndustryId: "",
  subSubIndustryId: "",
  industryDataId: [],
  companyFileUrl: "",
  paymentTerm: "",
  aggrementPresent: false,
  agreementFileUrl: "",
  aggrementExpiryDate: "",
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
  // rating: "",
  companyAge: "",
  establishDate: "",
  revenue: "",
  stage: "",
  status: "",
  isConsultant: false,
  actualClientCompanyId: "",
  units: [getEmptyUnit()],
});

const toOptions = (list = [], labelKey = "name", valueKey = "id") =>
  list.map((item) => ({
    label: item?.[labelKey] ?? "",
    value: String(item?.[valueKey] ?? ""),
  }));

const requiredRule = (message = REQUIRED) => [{ required: true, message }];

const requiredArrayRule = (message = REQUIRED) => [
  {
    validator: (_, value) =>
      Array.isArray(value) && value.length > 0
        ? Promise.resolve()
        : Promise.reject(new Error(message)),
  },
];

const getAntdPopupContainer = (triggerNode) =>
  triggerNode?.closest?.(".company-full-details-modal") ||
  triggerNode?.parentElement ||
  document.body;

const antSelectProps = {
  showSearch: true,
  allowClear: true,
  optionFilterProp: "label",
  className: "w-full",
  popupMatchSelectWidth: false,
  getPopupContainer: getAntdPopupContainer,
};

const formItemClass = "mb-0";

const FullCompanyDetailsForm = ({
  modalTitle = "Create / Edit Company",
  isOpen,
  onOpenChange,
  filteration,
  filters,
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      size="full"
      scrollBehavior="inside"
      isDismissable={false}
      isKeyboardDismissDisabled
      classNames={{
        wrapper: "p-0",
        base: "company-full-details-modal max-w-full h-screen rounded-none bg-slate-50",
        body: "p-0 overflow-y-auto bg-slate-50",
        header: "border-b border-slate-200 bg-white px-6 py-4",
        closeButton: "top-4 right-4",
      }}
    >
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader>
              <div>
                <div className="text-lg font-bold text-slate-900">
                  {modalTitle}
                </div>
                <div className="mt-1 text-xs font-medium text-slate-500">
                  Complete company profile, address and unit information.
                </div>
              </div>
            </ModalHeader>

            <ModalBody>
              <div className="px-5 py-5">
                <CompanyAndUnitsForm
                  onClose={onClose}
                  onCancel={onClose}
                  filteration={filteration}
                  filters={filters}
                />
              </div>
            </ModalBody>
          </>
        )}
      </ModalContent>
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
  const [form] = Form.useForm();
  const defaultValues = useMemo(() => getDefaultValues(), []);

  const companyTypeList = useSelector((state) => state.company.companyTypeList);
  const gstTypeList = useSelector((state) => state.company.gstTypeList);
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

  const company = useSelector(
    (state) => state.company.companyDetailByCompanyIdAndUnitId,
  );

  const statesByCountry = useSelector((state) => state.common.statesByCountry);
  const citiesByState = useSelector((state) => state.common.citiesByState);

  const [gstAndPanData, setGstAndPanData] = useState({});
  const [gstTypeMap, setGstTypeMap] = useState({});
  const [businessTypeMap, setBusinessTypeMap] = useState({});
  const [statusLoading, setStatusLoading] = useState("");

  const aggrementPresent = Form.useWatch("aggrementPresent", form);
  const ndaPresent = Form.useWatch("ndaPresent", form);
  const companyAge = Form.useWatch("companyAge", form);
  const establishDate = Form.useWatch("establishDate", form);
  const companyCountry = Form.useWatch("country", form);
  const companyState = Form.useWatch("state", form);
  const units = Form.useWatch("units", form) || [];

  const statesList = statesByCountry?.[companyCountry] || [];
  const citiesList = citiesByState?.[companyState] || [];

  const getGstTypeNameById = (gstTypeId) => {
    const selectedGstType = gstTypeList?.find(
      (gst) => String(gst.id) === String(gstTypeId),
    );

    return selectedGstType?.name?.trim()?.toLowerCase() || "";
  };

  const isInternationalGstType = (gstTypeId) =>
    getGstTypeNameById(gstTypeId) === "international";

  const hasSelectedGstType = (gstTypeId) => !!String(gstTypeId || "").trim();

  const removeIndiaFromCountryList = (list = []) =>
    list.filter((country) => country?.name?.trim()?.toLowerCase() !== "india");

  const getUnitPath = (index, key) => ["units", index, key];

  const normalizeName = (value) =>
    String(value || "")
      .trim()
      .toLowerCase();

  const setUnitValue = (index, key, value) => {
    form.setFieldValue(getUnitPath(index, key), value);
  };

  const clearUnitErrors = (index, keys = []) => {
    form.setFields(
      keys.map((key) => ({
        name: getUnitPath(index, key),
        errors: [],
      })),
    );
  };

  const handleCompanyStateChange = (stateName) => {
    form.setFieldsValue({ state: stateName, city: "" });

    if (stateName) {
      dispatch(getAllCitiesByStateName(stateName));
    }
  };

  const getGstStateCodeFromGstNo = (gstNo) => {
    return String(gstNo || "")
      .trim()
      .slice(0, 2);
  };

  const validateUnitStateAgainstGstNumber = (index) => (_, stateName) => {
    const gstNo = form.getFieldValue(getUnitPath(index, "gstNo"));

    if (!gstNo) {
      return Promise.resolve();
    }

    if (!stateName) {
      return Promise.resolve();
    }

    const gstStateCode = String(gstNo || "")
      .trim()
      .slice(0, 2);

    if (!gstStateCode || gstStateCode.length < 2) {
      return Promise.resolve();
    }

    const unitCountry = form.getFieldValue(getUnitPath(index, "country"));
    const unitStatesList = statesByCountry?.[unitCountry] || [];

    const selectedState = unitStatesList.find(
      (item) => normalizeName(item?.name) === normalizeName(stateName),
    );

    const selectedStateGstCode = selectedState?.gstCode
      ? String(selectedState.gstCode).padStart(2, "0")
      : "";

    if (!selectedStateGstCode) {
      return Promise.resolve();
    }

    if (gstStateCode !== selectedStateGstCode) {
      return Promise.reject(
        new Error(
          `GST number belongs to state code ${gstStateCode}, but selected state has GST code ${selectedStateGstCode}. Please select the correct state.`,
        ),
      );
    }

    return Promise.resolve();
  };

  const handleUnitGstTypeChange = (index, value) => {
    const finalValue = String(value || "");
    setUnitValue(index, "gstTypeId", finalValue);
    clearUnitErrors(index, ["gstTypeId"]);

    const selectedName = getGstTypeNameById(finalValue);
    const isInternational = selectedName === "international";

    const canAcceptGstNumber = ["registered", "sez"].includes(selectedName);

    if (!canAcceptGstNumber) {
      setUnitValue(index, "gstNo", "");
      clearUnitErrors(index, ["gstNo", "state"]);
    }

    if (isInternational) {
      const currentCountry = form.getFieldValue(getUnitPath(index, "country"));

      if (currentCountry?.trim()?.toLowerCase() === "india") {
        setUnitValue(index, "country", "");
        setUnitValue(index, "state", "");
        setUnitValue(index, "city", "");
        clearUnitErrors(index, ["country", "state", "city"]);
      }

      return;
    }

    if (finalValue) {
      setUnitValue(index, "country", "India");
      setUnitValue(index, "state", "");
      setUnitValue(index, "city", "");
      clearUnitErrors(index, ["country", "state", "city"]);
      dispatch(getAllStatesByCountryName("India"));
    }
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
    if (!companyAge) return;

    const age = Number(companyAge);
    if (Number.isNaN(age)) return;

    const currentYear = new Date().getFullYear();
    const establishYear = currentYear - age;
    const date = new Date();

    date.setFullYear(establishYear);

    form.setFieldValue("establishDate", date.toISOString().split("T")[0]);
  }, [companyAge, form]);

  useEffect(() => {
    if (!establishDate) return;

    const estDate = new Date(establishDate);
    if (Number.isNaN(estDate.getTime())) return;

    const todayDate = new Date();
    let age = todayDate.getFullYear() - estDate.getFullYear();
    const m = todayDate.getMonth() - estDate.getMonth();

    if (m < 0 || (m === 0 && todayDate.getDate() < estDate.getDate())) {
      age--;
    }

    form.setFieldValue("companyAge", age.toString());
  }, [establishDate, form]);

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

    countries.forEach((country) =>
      dispatch(getAllStatesByCountryName(country)),
    );
    states.forEach((stateName) => dispatch(getAllCitiesByStateName(stateName)));

    if (company?.industryId) {
      dispatch(getSubIndustryByIndustryId(company.industryId));
    }

    if (company?.subIndustryId) {
      dispatch(getSubSubIndustryBySubIndustryId(company.subIndustryId));
    }

    if (company?.subSubIndustryId) {
      dispatch(getIndustryDataBySubSubIndustryId(company.subSubIndustryId));
    }

    const mappedUnits = (
      company?.units?.length ? company.units : [getEmptyUnit()]
    ).map((unit, index) => {
      setGstAndPanData((prev) => ({
        ...prev,
        [index]: { gstNo: unit.gstNo || "", panNo: unit.panNo || "" },
      }));

      return {
        ...getEmptyUnit(),
        ...unit,
        id: unit?.id || 0,
        gstNo: unit?.gstNo || "",
        companyTypeId: unit?.companyTypeId ? String(unit.companyTypeId) : "",
        gstTypeId: unit?.gstRegistrationTypeId
          ? String(unit.gstRegistrationTypeId)
          : unit?.gstTypeId
            ? String(unit.gstTypeId)
            : "",
        gstBusinessTypeId: unit?.gstBusinessTypeId
          ? String(unit.gstBusinessTypeId)
          : "",
        gstTypePriceId: unit?.gstTypePriceId ? String(unit.gstTypePriceId) : "",
        unitOpeningDate: unit?.unitOpeningDate
          ? String(unit.unitOpeningDate).slice(0, 10)
          : "",
      };
    });

    form.setFieldsValue({
      ...getDefaultValues(),
      ...company,
      companyTypeId: company?.companyTypeId
        ? String(company.companyTypeId)
        : "",
      industryId: company?.industryId ? String(company.industryId) : "",
      subIndustryId: company?.subIndustryId
        ? String(company.subIndustryId)
        : "",
      subSubIndustryId: company?.subSubIndustryId
        ? String(company.subSubIndustryId)
        : "",
      industryDataId: company?.industryDataId?.map((id) => String(id)) || [],
      panNo: company?.panNo || "",
      gstNo: company?.gstNo || "",
      establishDate: company?.establishDate
        ? String(company.establishDate).slice(0, 10)
        : "",

      aggrementPresent: !!company?.aggrementPresent,
      agreementFileUrl: company?.aggrement || "",
      aggrementExpiryDate: company?.aggrementExpiryDate
        ? String(company.aggrementExpiryDate).slice(0, 10)
        : "",

      ndaPresent: !!company?.ndaPresent,
      ndaFileUrl: company?.nda || "",

      units: mappedUnits,
    });
  }, [company, dispatch, form]);

  const onSubmit = (values) => {
    setStatusLoading("pending");

    const { agreementFileUrl, ndaFileUrl, rating, ...dtoValues } = values;

    const payload = {
      ...dtoValues,

      aggrement: dtoValues.aggrementPresent
        ? agreementFileUrl || company?.aggrement || ""
        : "",

      aggrementExpiryDate: dtoValues.aggrementPresent
        ? dtoValues.aggrementExpiryDate || company?.aggrementExpiryDate || null
        : null,

      nda: dtoValues.ndaPresent ? ndaFileUrl || company?.nda || "" : "",

      leadCompanyId: company?.id,

      units: (dtoValues.units || []).map((unit) => ({
        ...unit,
        id: unit?.id || 0,
        gstRegistrationTypeId: unit?.gstTypeId ? String(unit.gstTypeId) : "",
      })),
    };

    dispatch(
      updateFullCompanyDetailsInLeads({
        companyId: company?.id,
        updatedBy: userId,
        data: payload,
      }),
    )
      .then((resp) => {
        if (resp.meta.requestStatus === "fulfilled") {
          setStatusLoading("success");

          addToast({
            title: "SUCCESS",
            description: "Company details updated successfully.",
            color: "success",
          });

          onClose?.();

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
                search: filters?.search || "",
                status: filters?.status || "",
                fromDate: filters?.fromDate || "",
                toDate: filters?.toDate || "",
              },
            }),
          );
        } else {
          setStatusLoading("rejected");

          addToast({
            title: "FAILED",
            description:
              resp?.payload?.data?.message || "Something went wrong !.",
            color: "danger",
          });
        }
      })
      .catch(() => {
        setStatusLoading("rejected");

        addToast({
          title: "FAILED",
          description: "Something went wrong !.",
          color: "danger",
        });
      });
  };

  const cardHeadStyle = {
    borderBottom: "1px solid #e5e7eb",
    background: "linear-gradient(90deg, #f8fafc 0%, #ffffff 100%)",
    padding: "16px 20px",
  };

  const cardBodyStyle = { padding: 20 };

  const sectionTitle = (title, subtitle, step) => (
    <div className="flex items-center justify-between gap-3">
      <div>
        <h2 className="m-0 text-base font-bold text-slate-900">{title}</h2>
        <p className="mt-1 mb-0 text-xs text-slate-500">{subtitle}</p>
      </div>

      <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-[11px] font-semibold text-slate-600">
        {step}
      </span>
    </div>
  );

  return (
    <>
      {statusLoading === "pending" && <LoadingSpinner />}

      <Form
        form={form}
        layout="vertical"
        size="large"
        initialValues={defaultValues}
        onFinish={onSubmit}
        className="mx-auto flex w-full max-w-[1600px] flex-col gap-5"
      >
        <Card
          className="overflow-visible rounded-2xl border border-slate-200 shadow-sm"
          styles={{ header: cardHeadStyle, body: cardBodyStyle }}
          title={sectionTitle(
            "Company Details",
            "Basic identity, incorporation, industry and document details.",
            "Step 1",
          )}
        >
          <div className="grid grid-cols-1 gap-x-1 gap-y-1 md:grid-cols-2 xl:grid-cols-3">
            <Form.Item
              name="name"
              label="Company name"
              rules={requiredRule("Company name is required.")}
              className={formItemClass}
            >
              <Input readOnly />
            </Form.Item>

            <Form.Item
              name="establishDate"
              label="Company incorporate date"
              rules={requiredRule("please enter established date")}
              className={formItemClass}
              getValueProps={(value) => ({
                value:
                  value && /^\d{4}-\d{2}-\d{2}$/.test(value)
                    ? dayjs(value)
                    : null,
              })}
              getValueFromEvent={(date) =>
                date ? date.format("YYYY-MM-DD") : ""
              }
            >
              <DatePicker
                getPopupContainer={getAntdPopupContainer}
                maxDate={dayjs()}
                format="YYYY-MM-DD"
                className="h-10 w-full rounded-lg"
              />
            </Form.Item>

            <Form.Item
              name="companyAge"
              label="Company age"
              rules={requiredRule("please enter company age.")}
              className={formItemClass}
              getValueFromEvent={(e) => allowOnlyNumbers(e.target.value)}
            >
              <Input maxLength={4} />
            </Form.Item>

            <Form.Item
              name="companyTypeId"
              label="Company Structure"
              rules={requiredRule("Please select company structure.")}
              className={formItemClass}
            >
              <Select
                {...antSelectProps}
                options={toOptions(companyTypeList)}
              />
            </Form.Item>

            <Form.Item
              name="revenue"
              label="Company revenue (in rupees)"
              rules={requiredRule("please enter revenue")}
              className={formItemClass}
              getValueFromEvent={(e) => allowOnlyNumbers(e.target.value)}
            >
              <Input prefix={<IndianRupee className="h-4 w-4" />} />
            </Form.Item>

            {/* <Form.Item
              name="rating"
              label="Rating"
              rules={requiredRule("please select rating")}
              className={formItemClass}
            >
              <Select
                {...antSelectProps}
                options={[
                  { label: "Gold", value: "Gold" },
                  { label: "Silver", value: "Silver" },
                  { label: "Bronze", value: "Bronze" },
                ]}
              />
            </Form.Item> */}

            <Form.Item
              name="panNo"
              label="Pan number"
              rules={[
                { required: true, message: "please give pan number." },
                {
                  validator: (_, value) => {
                    if (!value) return Promise.resolve();

                    if (
                      String(value).length === 10 &&
                      !/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(value)
                    ) {
                      return Promise.reject(new Error("Invalid PAN Number"));
                    }

                    return Promise.resolve();
                  },
                },
              ]}
              className={formItemClass}
              getValueFromEvent={(e) => formatPANInput(e.target.value)}
            >
              <Input maxLength={10} className="h-10 rounded-lg" />
            </Form.Item>

            <Form.Item
              name="industryId"
              label="Select industry"
              rules={requiredRule("Please select industry.")}
              className={formItemClass}
            >
              <Select
                {...antSelectProps}
                options={toOptions(allIndustry)}
                onChange={(value) => {
                  form.setFieldsValue({
                    industryId: value || "",
                    subIndustryId: "",
                    subSubIndustryId: "",
                    industryDataId: [],
                  });

                  form.setFields([
                    { name: "industryId", errors: [] },
                    { name: "subIndustryId", errors: [] },
                    { name: "subSubIndustryId", errors: [] },
                    { name: "industryDataId", errors: [] },
                  ]);

                  if (value) {
                    dispatch(getSubIndustryByIndustryId(value));
                  }
                }}
              />
            </Form.Item>

            <Form.Item
              name="subIndustryId"
              label="Select sub industry"
              rules={requiredRule("Please select sub industry.")}
              className={formItemClass}
            >
              <Select
                {...antSelectProps}
                options={toOptions(subIndustryListById)}
                onChange={(value) => {
                  form.setFieldsValue({
                    subIndustryId: value || "",
                    subSubIndustryId: "",
                    industryDataId: [],
                  });

                  form.setFields([
                    { name: "subIndustryId", errors: [] },
                    { name: "subSubIndustryId", errors: [] },
                    { name: "industryDataId", errors: [] },
                  ]);

                  if (value) {
                    dispatch(getSubSubIndustryBySubIndustryId(value));
                  }
                }}
              />
            </Form.Item>

            <Form.Item
              name="subSubIndustryId"
              label="Select category"
              rules={requiredRule("Please select category.")}
              className={formItemClass}
            >
              <Select
                {...antSelectProps}
                options={toOptions(subSubIndustryListById)}
                onChange={(value) => {
                  form.setFieldsValue({
                    subSubIndustryId: value || "",
                    industryDataId: [],
                  });

                  form.setFields([
                    { name: "subSubIndustryId", errors: [] },
                    { name: "industryDataId", errors: [] },
                  ]);

                  if (value) {
                    dispatch(getIndustryDataBySubSubIndustryId(value));
                  }
                }}
              />
            </Form.Item>

            <Form.Item
              name="industryDataId"
              label="Select business activity"
              rules={requiredArrayRule("Please select business activity.")}
              className={formItemClass}
            >
              <Select
                {...antSelectProps}
                mode="multiple"
                maxTagCount="responsive"
                options={toOptions(industryDataListById)}
              />
            </Form.Item>

            <Form.Item
              name="companyFileUrl"
              label="Company incorporate document"
              className={formItemClass}
            >
              <SingleFileUploader />
            </Form.Item>

            <Form.Item
              name="aggrementPresent"
              label="Agreement"
              rules={requiredRule("please select agreement")}
              className={formItemClass}
            >
              <Select
                {...antSelectProps}
                options={[
                  { label: "Yes", value: true },
                  { label: "No", value: false },
                ]}
              />
            </Form.Item>

            {aggrementPresent && (
              <Form.Item
                name="agreementFileUrl"
                label="Agreement document"
                rules={requiredRule("please upload attachement")}
                className={formItemClass}
              >
                <SingleFileUploader />
              </Form.Item>
            )}

            {aggrementPresent && (
              <Form.Item
                name="aggrementExpiryDate"
                label="Agreement expiry date"
                rules={requiredRule("please select agreement expiry date")}
                className={formItemClass}
                getValueProps={(value) => ({
                  value:
                    value && /^\d{4}-\d{2}-\d{2}$/.test(value)
                      ? dayjs(value)
                      : null,
                })}
                getValueFromEvent={(date) =>
                  date ? date.format("YYYY-MM-DD") : ""
                }
              >
                <DatePicker
                  getPopupContainer={getAntdPopupContainer}
                  format="YYYY-MM-DD"
                  className="h-10 w-full rounded-lg"
                />
              </Form.Item>
            )}

            <Form.Item
              name="ndaPresent"
              label="NDA"
              rules={requiredRule("please select NDA")}
              className={formItemClass}
            >
              <Select
                {...antSelectProps}
                options={[
                  { label: "Yes", value: true },
                  { label: "No", value: false },
                ]}
              />
            </Form.Item>

            {ndaPresent && (
              <Form.Item
                name="ndaFileUrl"
                label="NDA document"
                rules={requiredRule("please upload attachement")}
                className={formItemClass}
              >
                <SingleFileUploader />
              </Form.Item>
            )}
          </div>
        </Card>

        <Card
          className="overflow-visible rounded-2xl border border-slate-200 shadow-sm"
          styles={{ header: cardHeadStyle, body: cardBodyStyle }}
          title={sectionTitle(
            "Registered Address",
            "Company address used for billing and statutory records.",
            "Step 2",
          )}
        >
          <div className="grid grid-cols-1 gap-x-5 gap-y-4 md:grid-cols-2 xl:grid-cols-3">
            <Form.Item
              name="address"
              label="Address"
              rules={requiredRule("please enter address.")}
              className={formItemClass}
            >
              <Input />
            </Form.Item>

            <Form.Item
              name="country"
              label="Country"
              rules={requiredRule("please select country.")}
              className={formItemClass}
            >
              <Select
                {...antSelectProps}
                options={toOptions(countryList, "name", "name")}
                onChange={(value) => {
                  form.setFieldsValue({
                    country: value || "",
                    state: "",
                    city: "",
                  });

                  if (value) {
                    dispatch(getAllStatesByCountryName(value));
                  }
                }}
              />
            </Form.Item>

            <Form.Item
              name="state"
              label="State"
              rules={requiredRule("please select state.")}
              className={formItemClass}
            >
              <Select
                {...antSelectProps}
                options={toOptions(statesList, "name", "name")}
                onChange={handleCompanyStateChange}
              />
            </Form.Item>

            <Form.Item
              name="city"
              label="City"
              rules={requiredRule("please select city.")}
              className={formItemClass}
            >
              <Select
                {...antSelectProps}
                options={toOptions(citiesList, "name", "name")}
              />
            </Form.Item>

            <Form.Item
              name="primaryPinCode"
              label="Pin code"
              rules={requiredRule("please select pin code")}
              className={formItemClass}
              getValueFromEvent={(e) => allowOnlyNumbers(e.target.value, 6)}
            >
              <Input maxLength={6} />
            </Form.Item>
          </div>
        </Card>

        <Card
          className="overflow-visible rounded-2xl border border-slate-200 shadow-sm"
          styles={{ header: cardHeadStyle, body: cardBodyStyle }}
          title={sectionTitle(
            "Unit Details",
            "GST type, unit registration and unit-wise address information.",
            "Step 3",
          )}
        >
          <Form.List name="units">
            {(fields) => (
              <div className="space-y-5">
                {fields.map((field, index) => {
                  const unit = units?.[index] || {};
                  const unitCountry = unit?.country;
                  const unitState = unit?.state;
                  const selectedGstTypeId = unit?.gstTypeId;

                  const isInternationalSelected =
                    isInternationalGstType(selectedGstTypeId);

                  const isNonInternationalGstSelected =
                    hasSelectedGstType(selectedGstTypeId) &&
                    !isInternationalSelected;

                  const unitCountryList = isInternationalSelected
                    ? removeIndiaFromCountryList(countryList || [])
                    : countryList || [];

                  const selectedGstTypeName =
                    getGstTypeNameById(selectedGstTypeId);

                  const isRegisteredGstType =
                    selectedGstTypeName === "registered";
                  const isSezGstType = selectedGstTypeName === "sez";

                  const shouldShowGstField =
                    isRegisteredGstType || isSezGstType;

                  const unitStatesList = statesByCountry?.[unitCountry] || [];
                  const unitCitiesList = citiesByState?.[unitState] || [];

                  return (
                    <div
                      key={field.key}
                      className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4 shadow-sm"
                    >
                      <Form.Item name={[field.name, "id"]} hidden>
                        <Input />
                      </Form.Item>

                      <Form.Item name={[field.name, "companyTypeId"]} hidden>
                        <Input />
                      </Form.Item>

                      <Form.Item
                        name={[field.name, "gstBusinessTypeId"]}
                        hidden
                      >
                        <Input />
                      </Form.Item>

                      <Form.Item name={[field.name, "gstTypePriceId"]} hidden>
                        <Input />
                      </Form.Item>

                      <Form.Item name={[field.name, "addressLine2"]} hidden>
                        <Input />
                      </Form.Item>

                      <Form.Item
                        name={[field.name, "consultantPresent"]}
                        hidden
                      >
                        <Input />
                      </Form.Item>

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

                        <div className="grid grid-cols-1 gap-x-1 gap-y-1 md:grid-cols-2 xl:grid-cols-3">
                          <Form.Item
                            name={[field.name, "unitName"]}
                            label="Unit Name"
                            rules={requiredRule("Unit name is required")}
                            className={formItemClass}
                          >
                            <Input />
                          </Form.Item>

                          <Form.Item
                            name={[field.name, "gstTypeId"]}
                            label="GST Type"
                            rules={requiredRule("please select gst type")}
                            className={formItemClass}
                          >
                            <Select
                              {...antSelectProps}
                              options={toOptions(gstTypeList)}
                              onChange={(value) =>
                                handleUnitGstTypeChange(index, value)
                              }
                            />
                          </Form.Item>

                          {shouldShowGstField && (
                            <Form.Item
                              name={[field.name, "gstNo"]}
                              label="GST No"
                              rules={[
                                {
                                  required: isRegisteredGstType,
                                  message: "GST number is required",
                                },
                                {
                                  validator: (_, value) => {
                                    if (!value) return Promise.resolve();

                                    if (
                                      !/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(
                                        value,
                                      )
                                    ) {
                                      return Promise.reject(
                                        new Error("Invalid GST Number"),
                                      );
                                    }

                                    return Promise.resolve();
                                  },
                                },
                              ]}
                              className={formItemClass}
                              getValueFromEvent={(e) =>
                                formatGSTInput(e.target.value)
                              }
                            >
                              <Input
                                maxLength={15}
                                onChange={() => {
                                  form
                                    .validateFields([
                                      getUnitPath(index, "state"),
                                    ])
                                    .catch(() => {});
                                }}
                              />
                            </Form.Item>
                          )}

                          <Form.Item
                            name={[field.name, "unitOpeningDate"]}
                            label="Unit Opening Date"
                            rules={requiredRule("please enter date")}
                            className={formItemClass}
                            getValueProps={(value) => ({
                              value:
                                value && /^\d{4}-\d{2}-\d{2}$/.test(value)
                                  ? dayjs(value)
                                  : null,
                            })}
                            getValueFromEvent={(date) =>
                              date ? date.format("YYYY-MM-DD") : ""
                            }
                          >
                            <DatePicker
                              getPopupContainer={getAntdPopupContainer}
                              maxDate={dayjs()}
                              format="YYYY-MM-DD"
                              className="w-full rounded-lg"
                            />
                          </Form.Item>
                        </div>
                      </div>

                      <div className="mt-3 rounded-2xl border border-slate-200 bg-white p-4">
                        <div className="mb-4 flex items-center gap-2">
                          <span className="h-2 w-2 rounded-full bg-blue-600" />

                          <p className="m-0 text-xs font-bold uppercase tracking-wide text-slate-600">
                            Unit Address
                          </p>
                        </div>

                        <div className="grid grid-cols-1 gap-x-1 gap-y-1 md:grid-cols-2 xl:grid-cols-3">
                          <Form.Item
                            name={[field.name, "addressLine1"]}
                            label="Address Line 1"
                            rules={requiredRule("Address Line 1 is required")}
                            className={formItemClass}
                          >
                            <Input />
                          </Form.Item>

                          <Form.Item
                            name={[field.name, "country"]}
                            label="Country"
                            rules={requiredRule("Country is required")}
                            className={formItemClass}
                          >
                            <Select
                              {...antSelectProps}
                              disabled={isNonInternationalGstSelected}
                              options={toOptions(
                                unitCountryList,
                                "name",
                                "name",
                              )}
                              onChange={(value) => {
                                setUnitValue(index, "country", value || "");
                                setUnitValue(index, "state", "");
                                setUnitValue(index, "city", "");

                                if (value) {
                                  dispatch(getAllStatesByCountryName(value));
                                }
                              }}
                            />
                          </Form.Item>

                          <Form.Item
                            name={[field.name, "state"]}
                            label="State"
                            dependencies={[[field.name, "gstNo"]]}
                            rules={[
                              ...requiredRule("State is required"),
                              {
                                validator:
                                  validateUnitStateAgainstGstNumber(index),
                              },
                            ]}
                            className={formItemClass}
                          >
                            <Select
                              {...antSelectProps}
                              options={toOptions(
                                unitStatesList,
                                "name",
                                "name",
                              )}
                              onChange={(value) => {
                                setUnitValue(index, "state", value || "");
                                setUnitValue(index, "city", "");

                                if (value) {
                                  dispatch(getAllCitiesByStateName(value));
                                }
                              }}
                            />
                          </Form.Item>

                          <Form.Item
                            name={[field.name, "city"]}
                            label="City"
                            rules={requiredRule("City is required")}
                            className={formItemClass}
                          >
                            <Select
                              {...antSelectProps}
                              options={toOptions(
                                unitCitiesList,
                                "name",
                                "name",
                              )}
                            />
                          </Form.Item>

                          <Form.Item
                            name={[field.name, "pinCode"]}
                            label="Pin Code"
                            rules={requiredRule("Pin code is required")}
                            className={formItemClass}
                            getValueFromEvent={(e) =>
                              allowOnlyNumbers(e.target.value)
                            }
                          >
                            <Input className="h-10 rounded-lg" />
                          </Form.Item>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </Form.List>
        </Card>

        <div className="sticky bottom-0 z-20 flex items-center justify-end gap-3 border-t border-slate-200 bg-white/95 px-5 py-4 shadow-[0_-8px_24px_rgba(0,0,0,0.04)] backdrop-blur">
          {onCancel && (
            <Button
              htmlType="button"
              className="min-w-[110px] rounded-lg font-medium"
              onClick={onCancel}
            >
              Cancel
            </Button>
          )}

          <Button
            htmlType="submit"
            type="primary"
            loading={statusLoading === "pending"}
            className="min-w-[150px] rounded-lg font-semibold shadow-sm"
          >
            Save Company
          </Button>
        </div>
      </Form>
    </>
  );
}
