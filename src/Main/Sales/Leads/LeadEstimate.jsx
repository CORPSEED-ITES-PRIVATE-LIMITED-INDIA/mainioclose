import {
  Button,
  DatePicker,
  Flex,
  Form,
  Input,
  Modal,
  notification,
  Row,
  Select,
  Typography,
  Col,
  Upload,
  Space,
  Card,
  Badge,
  Spin,
  Divider,
  Switch,
  InputNumber,
} from "antd";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Icon } from "@iconify/react";
import {
  createEstimate,
  createEstimateForApprovals,
  editEstimateForApprovals,
  editLeadEstimate,
  getAllContactDetails,
  getAllContactDetailsById,
  getEstimateByLeadId,
  getSecondaryContactListByCompanyId,
  searchCompaniesForCompany,
  updateCompanyAddress,
  updateGstTypeInEstimate,
} from "../../../Toolkit/Slices/LeadSlice";
import {
  createContacts,
  createNewContacts,
  getAllCitiesByStateId,
  getAllCountries,
  getAllStatesByCountryId,
} from "../../../Toolkit/Slices/CommonSlice";
import dayjs from "dayjs";
import {
  formatGSTInput,
  formatPANInput,
  maskEmail,
  maskMobileNumber,
  panRegex,
} from "../../Common/Commons";
import logo from "../../../Images/CORPSEED.webp";
import numWords from "num-words";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { useParams } from "react-router-dom";
import {
  getAllCompanyType,
  getAllCompanyUnits,
  getAllGstTypeByCompanyTypeId,
  getBusinessTypeByGstTypeId,
} from "../../../Toolkit/Slices/CompanySlice";
import {
  getAllBusinessArrangement,
  getAllProductCategoryById,
  getAllProductSubCategoryListByCategoryId,
} from "../../../Toolkit/Slices/ProductSlice";
import UploadDocumentsInEstimate from "./UploadDocumentsInEstimate";
const { Text, Title } = Typography;

const LeadEstimate = ({ leadid }) => {
  const [form] = Form.useForm();
  const [gstForm] = Form.useForm();
  const [contactForm] = Form.useForm();
  const [addressForm] = Form.useForm();
  const { userid } = useParams();
  const dispatch = useDispatch();
  const pdfRef = useRef();
  const productData = useSelector((state) => state.leads.productDataByLeadName);
  const contactList = useSelector(
    (state) => state?.leads?.primaryContactListByCompanyId
  );
  const secondaryContactList = useSelector(
    (state) => state?.leads?.primaryContactListByCompanyId
  );
  const leadUserNew = useSelector((state) => state.leads.getAllLeadUserData);
  const seachCompniesList = useSelector(
    (state) => state.leads.seachCompniesList
  );
  const companyTypeList = useSelector((state) => state.company.companyTypeList);
  const gstTypeList = useSelector((state) => state.company.gstTypeList);
  const businessTypeList = useSelector(
    (state) => state.company.businessTypeList
  );
  const countryList = useSelector((state) => state.common.countriesList);
  const statesList = useSelector((state) => state.common.statesList);
  const citiesList = useSelector((state) => state.common.citiesList);
  const allCompanyUnits = useSelector((state) => state.company.allCompanyUnits);
  const details = useSelector((state) => state.leads.estimateDetail);
  const estimateDetailLoading = useSelector(
    (state) => state.leads.estimateDetailLoading
  );
  const companyDetails = useSelector(
    (state) => state?.leads?.companyDetailsById
  );
  const businessArrangementList = useSelector(
    (state) => state?.product?.businessArrangementList
  );
  const productCategoryList = useSelector(
    (state) => state?.product?.productCategoryList
  );
  const productSubcategoryList = useSelector(
    (state) => state?.product?.productSubcategoryList
  );
  const [gstModal, setGstModal] = useState(false);
  const [gstMand, setGstMand] = useState({ gst: false, pan: false });
  const [openModal, setOpenModal] = useState(false);
  const [editEstimate, setEditEstimate] = useState(false);
  const [seachFields, setSearchFields] = useState({
    searchText: "",
    userId: userid,
    searchField: "searchNameAndGSt",
  });

  const [productFees, setProductFees] = useState({
    professionalFees: 0,
    serviceCharge: 0,
    otherFees: 0,
    govermentfees: 0,
    profesionalGst: 0,
    serviceGst: 0,
    govermentGst: 0,
    otherGst: 0,
  });
  const [addressModal, setAddressModal] = useState(false);
  const [openSelectDd, setOpenSelectDd] = useState(false);
  const [discount, setDiscount] = useState(false);
  const [companyAndUnitData, setCompanyAndUnitData] = useState({
    companyId: null,
    companyName: "",
    unitId: null,
    unitName: "",
  });
  const [productSubCategoryData, setProductSubCategoryData] = useState(null);
  const [productSubCategoryFees, setProductSubCategoryFees] = useState({
    actualPrice: 0,
    gst: 0,
    roundOff: false,
  });

  useEffect(() => {
    dispatch(getAllCountries());
    dispatch(getAllCompanyType());
  }, [dispatch]);

  useEffect(() => {
    if (details?.discountEstimate) {
      setDiscount(true);
    }
  }, [details]);

  useEffect(() => {
    if (Object.keys(companyDetails) > 0) {
      form.setFieldsValue({
        companyId: companyDetails?.name,
        isUnit: companyDetails?.isUnit,
        isConsultant: companyDetails?.isConsultant,
      });
    }
  }, [companyDetails, form]);

  const handleFinishContact = (values) => {
    values.companyId = companyAndUnitData?.companyId;
    dispatch(createNewContacts(values))
      .then((resp) => {
        if (resp.meta.requestStatus === "fulfilled") {
          notification.success({ message: "Contact created successfully !." });
          setOpenModal(false);
          contactForm.resetFields();
          dispatch(getAllContactDetailsById(companyAndUnitData?.companyId));
        } else {
          notification.error({ message: "Something went wrong !." });
        }
      })
      .catch(() => notification.error({ message: "Something went wrong !." }));
  };

  const normFile = (e) => {
    if (Array.isArray(e)) {
      return e;
    }
    return e?.fileList;
  };

  function getFileName(file) {
    if (file) {
      let temp = file?.split("/");
      return temp[temp?.length - 1];
    }
  }

  useEffect(() => {
    if (productData?.id) {
      dispatch(getAllBusinessArrangement(productData?.id));
    }
  }, [dispatch, productData]);

  useEffect(() => {
    productData?.productAmount?.forEach((item) => {
      if (item?.name === "Government") {
        form.setFieldsValue({
          govermentfees: item?.fees,
          govermentCode: item?.hsnNo,
          govermentGst: item?.taxAmount,
        });
        setProductFees((prev) => ({
          ...prev,
          govermentfees: item?.fees,
          govermentGst: item?.taxAmount,
        }));
      }
      if (item?.name === "Professional fees") {
        form.setFieldsValue({
          professionalFees: item?.fees,
          professionalCode: item?.hsnNo,
          profesionalGst: item?.taxAmount,
        });
        setProductFees((prev) => ({
          ...prev,
          professionalFees: item?.fees,
          profesionalGst: item?.taxAmount,
        }));
      }
      if (item?.name === "Service charges") {
        form.setFieldsValue({
          serviceCharge: item?.fees,
          serviceCode: item?.hsnNo,
          serviceGst: item?.taxAmount,
        });
        setProductFees((prev) => ({
          ...prev,
          serviceCharge: item?.fees,
          serviceGst: item?.taxAmount,
        }));
      }

      if (item?.name === "Other fees") {
        form.setFieldsValue({
          otherFees: item?.fees,
          otherCode: item?.hsnNo,
          otherGst: item?.taxAmount,
        });
        setProductFees((prev) => ({
          ...prev,
          otherFees: item?.fees,
          otherGst: item?.taxAmount,
        }));
      }
    });
  }, [productData, form]);

  useEffect(() => {
    const handler = setTimeout(() => {
      if (seachFields.searchText) {
        dispatch(searchCompaniesForCompany(seachFields)).then((resp) => {
          if (resp.meta.requestStatus === "fulfilled") {
            setOpenSelectDd(true);
          }
        });
      }
    }, 500);

    return () => {
      clearTimeout(handler);
    };
  }, [seachFields.searchText, seachFields.searchField, dispatch]);

  const calculateTotalPriceWithGST = (actualPrice, quantity, gstString) => {
    const price = parseFloat(actualPrice) || 0;
    const qty = productSubCategoryFees?.roundOff
      ? Math.ceil(parseFloat(quantity) / 1000) * 1000
      : parseFloat(quantity) || 0;
    const gst = parseInt(gstString) || 0;
    const subtotal = price * qty;
    const total = subtotal + (subtotal * gst) / 100;
    return total.toFixed(2);
  };

  const handleEditEstimate = useCallback(() => {
    dispatch(getAllCompanyUnits(details?.companyId));
    dispatch(getAllContactDetailsById(details?.companyId));
    dispatch(getSecondaryContactListByCompanyId(details?.companyId));
    dispatch(getAllStatesByCountryId(details?.primaryCountry?.id));
    dispatch(getAllCitiesByStateId(details?.primaryState?.id));
    dispatch(getAllProductCategoryById(details?.businessArrangmentId));
    dispatch(
      getAllProductSubCategoryListByCategoryId(details?.productCategoryId)
    );
    dispatch(getAllGstTypeByCompanyTypeId(details?.companyType));
    dispatch(getBusinessTypeByGstTypeId(details?.gstType));
    setCompanyAndUnitData((prev) => ({
      ...prev,
      companyId: details?.companyId,
      companyName: details?.companyName,
      unitName: details?.unitName,
      unitId: details?.unitId,
    }));
    form.setFieldsValue({
      admin: details?.primaryContact?.id,
      cc: details?.ccMail,
      companyId: details?.companyId,
      companyName: details?.companyName,
      isUnit: details?.isUnit,
      unitId: details?.unitId,
      unitName: details?.unitName,
      panNo: details?.panNo,
      gstType: details?.gstType,
      companyType: details?.companyType,
      businessType: details?.bussinessType,
      companyAge: details?.companyAge,
      performaInvoice: details?.performaInvoice,
      gstNo: details?.gstNo,
      gstDocuments: [
        {
          uid: "-1",
          name: getFileName(details?.gstDocuments),
          status: "done",
          response: details?.gstDocuments,
        },
      ],
      businessArrangmentId: details?.businessArrangmentId,
      productCategoryId: details?.productCategoryId,
      productSubCategoryId: details?.productSubCategoryId,
      actualPrice: details?.actualPrice,
      gstCode: details?.gstCode,
      gst: details?.gst,
      quantity: details?.quantity,
      totalPrice: details?.totalPrice,
      salesType: details?.salesType,
      secondaryContact: details?.secondaryContact?.id,
      primaryContact: details?.primaryContact?.id,
      productId: details?.product?.id,
      professionalFees: details?.professionalFees,
      professionalCode: details?.professionalCode,
      profesionalGst: details?.profesionalGst,
      serviceCharge: details?.serviceCharge,
      serviceCode: details?.serviceCode,
      serviceGst: details?.serviceGst,
      govermentfees: details?.govermentfees,
      govermentCode: details?.govermentCode,
      govermentGst: details?.govermentGst,
      otherFees: details?.otherFees,
      otherCode: details?.otherCode,
      otherGst: details?.otherGst,
      assigneeId: details?.assigneeId?.id,
      orderNumber: details?.orderNumber,
      purchaseDate: dayjs(details?.purchaseDate),
      invoiceNote: details?.invoiceNote,
      remarksForOption: details?.getRemarkForOperation,
      address: details?.address,
      city: details?.city,
      state: details?.state,
      country: details?.country,
      primaryPinCode: details?.primaryPinCode,
      secondaryAddress: details?.secondaryAddress,
      secondaryCity: details?.secondaryCity,
      secondaryState: details?.secondaryState,
      secondaryCountry: details?.country,
      secondaryPinCode: details?.secondaryPinCode,
      originalCompanyName: details?.consultantByCompany?.name,
      originalContact: details?.consultantByCompany?.originalContact,
      originalEmail: details?.consultantByCompany?.originalEmail,
      originalAddress: details?.consultantByCompany?.address,
    });
    gstForm.setFieldsValue({
      companyType: details?.companyType,
      gstType: details?.gstType,
      businessType: details?.businessType,
      gstNo: details?.gstNo,
      panNo: details?.panNo,
    });

    addressForm.setFieldsValue({
      address: details?.address,
      city: details?.city,
      state: details?.state,
      country: details?.country,
      primaryPinCode: details?.primaryPinCode,
    });

    setEditEstimate((prev) => !prev);
  }, [details, form]);

  const validateGreaterThanOrEqual = (minValue, discount) => ({
    validator(_, value) {
      if (discount) {
        return Promise.resolve();
      }
      if (!value || parseFloat(value) >= parseFloat(minValue)) {
        return Promise.resolve();
      }
      return Promise.reject(
        new Error(`Value should be greater than or equal to ${minValue}`)
      );
    },
  });

  const handleFinish = useCallback(
    (values) => {
      values.leadId = leadid;
      values.unitCompany = false;
      values.productId = productData?.id;
      values.gstDocuments = values.gstDocuments?.[0]?.response;
      values.companyId = companyAndUnitData?.companyId;
      values.companyName = companyAndUnitData?.companyName;
      values.unitName = companyAndUnitData?.unitName;
      values.type = productData?.type;
      if (discount) {
        if (details?.discountEstimate) {
          values.estimateId = details?.id;
          dispatch(editEstimateForApprovals(values))
            .then((resp) => {
              if (resp.meta.requestStatus === "fulfilled") {
                notification.success({
                  message: "Estimate edited successfully !.",
                });
                dispatch(getEstimateByLeadId(leadid));
                form.resetFields();
                setCompanyAndUnitData({
                  companyId: null,
                  companyName: "",
                  unitId: null,
                  unitName: "",
                });
              } else {
                notification.error({ message: "Something went wrong !." });
              }
            })
            .catch(() =>
              notification.error({ message: "Something went wrong !." })
            );
        } else {
          dispatch(createEstimateForApprovals(values))
            .then((resp) => {
              if (resp.meta.requestStatus === "fulfilled") {
                notification.success({
                  message: "Estimate created successfully !.",
                });
                dispatch(getEstimateByLeadId(leadid));
                form.resetFields();
                setCompanyAndUnitData({
                  companyId: null,
                  companyName: "",
                  unitId: null,
                  unitName: "",
                });
              } else {
                notification.error({ message: "Something went wrong !." });
              }
            })
            .catch(() =>
              notification.error({ message: "Something went wrong !." })
            );
        }
      } else {
        if (editEstimate) {
          values.id = details?.id;
          dispatch(editLeadEstimate(values))
            .then((resp) => {
              if (resp.meta.requestStatus === "fulfilled") {
                notification.success({
                  message: "Estimate updated successfully !.",
                });
                form.resetFields();
                dispatch(getEstimateByLeadId(leadid));
                setCompanyAndUnitData({
                  companyId: null,
                  companyName: "",
                  unitId: null,
                  unitName: "",
                });
              } else {
                notification.error({ message: "Something went wrong !." });
              }
            })
            .catch(() =>
              notification.error({ message: "Something went wrong !." })
            );
        } else {
          dispatch(createEstimate(values))
            .then((resp) => {
              if (resp.meta.requestStatus === "fulfilled") {
                notification.success({
                  message: "Estimate created successfully !.",
                });
                form.resetFields();
                dispatch(getEstimateByLeadId(leadid));
                setCompanyAndUnitData({
                  companyId: null,
                  companyName: "",
                  unitId: null,
                  unitName: "",
                });
              } else {
                notification.error({ message: "Something went wrong !." });
              }
            })
            .catch(() =>
              notification.error({ message: "Something went wrong !." })
            );
        }
      }
    },
    [
      leadid,
      details,
      editEstimate,
      productData,
      dispatch,
      companyAndUnitData,
      discount,
    ]
  );

  const generatePDF = async () => {
    const element = pdfRef.current;
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
    });
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF("p", "mm", "a4");
    const imgWidth = 210;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    const pageHeight = 297;
    let yPosition = 0;
    while (yPosition < imgHeight) {
      pdf.addImage(imgData, "PNG", 0, -yPosition, imgWidth, imgHeight);
      if (yPosition + pageHeight < imgHeight) {
        pdf.addPage();
      }
      yPosition += pageHeight;
    }
    pdf.save("estimate.pdf");
  };

  const handleGstUpdate = (values) => {
    values.companyId = companyAndUnitData?.companyId;
    dispatch(updateGstTypeInEstimate(values))
      .then((resp) => {
        if (resp.meta.requestStatus === "fulfilled") {
          const compData = resp?.payload;
          console.log("fkjhldhlkhlkghlkd", resp);
          dispatch(getAllGstTypeByCompanyTypeId(compData?.companyGstType?.id));
          dispatch(getBusinessTypeByGstTypeId(compData?.gstType?.id));
          form.setFieldsValue({
            companyType: compData?.companyGstType?.id,
            businessType: compData?.BussiessType?.id,
            gstType: compData?.gstType?.id,
            gstNo: compData?.gstNo,
            panNo: compData?.panNo,
          });
          notification.success({ message: "Gst updated successfully !." });
          setGstModal(false);
          gstForm.resetFields();
        } else {
          notification.error({ message: "Something went wrong !." });
        }
      })
      .catch(() => notification.error({ message: "Something went wrong !." }));
  };

  const handleAddressFinish = (values) => {
    values.companyId = companyAndUnitData?.companyId;
    dispatch(updateCompanyAddress(values))
      .then((resp) => {
        if (resp.meta.requestStatus === "fulfilled") {
          const compUnit = resp.payload;
          form.setFieldsValue({
            gstType: compUnit?.gstType,
            gstNo: compUnit?.gstNo,
            companyType: compUnit?.companyType,
            businessType: compUnit?.bussinessType,
            companyAge: compUnit?.companyAge,
            address: compUnit?.address,
            city: compUnit?.city,
            country: compUnit?.country,
            state: compUnit?.state,
            primaryContact: compUnit?.primaryContact,
            panNo: compUnit?.panNo,
            primaryContact: compUnit?.primaryContact?.id,
            secondaryContact: compUnit?.secondaryContact?.id,
            assigneeId: compUnit?.assignee?.id,
            primaryPinCode: compUnit?.primaryPinCode,
            secondaryAddress: compUnit?.sAddress,
            secondaryCity: compUnit?.sCity,
            secondaryState: compUnit?.sState,
            secondaryCountry: compUnit?.sCountry,
            secondaryPinCode: compUnit?.secondaryPinCode,
          });
          gstForm.setFieldsValue({
            companyType: compUnit?.companyType,
            gstType: compUnit?.gstType,
            businessType: compUnit?.bussinessType,
            gstNo: compUnit?.gstNo,
            panNo: compUnit?.panNo,
          });
          addressForm.setFieldsValue({
            address: compUnit?.address,
            city: compUnit?.city,
            state: compUnit?.state,
            country: compUnit?.country,
            pinCode: compUnit?.primaryPinCode,
          });
          notification.success({ message: "Address updated successfully !." });
          setAddressModal(false);
        } else {
          notification.error({ message: "Something went wrong !." });
        }
      })
      .catch(() => notification.error({ message: "Something went wrong !." }));
  };

  return (
    <Spin
      size="large"
      spinning={estimateDetailLoading === "pending" ? true : false}
    >
      <Flex
        justify="space-between"
        align="center"
        style={{ width: "98%", marginLeft: 16 }}
      >
        <Title level={4} className="heading-text" style={{ margin: 0 }}>
          {Object.keys(details)?.length > 0 && !editEstimate
            ? `${
                details?.performaInvoice
                  ? "Proforma Invoice details"
                  : "Estimate details"
              }`
            : editEstimate
            ? "Edit estimate"
            : "Create estimate"}
        </Title>
        <Flex justify="flex-end" gap={4}>
          <UploadDocumentsInEstimate estimateId={details?.id} />
          {Object.keys(details)?.length > 0 && !editEstimate && (
            <Button onClick={generatePDF}>Export as pdf</Button>
          )}
          {Object.keys(details)?.length > 0 && (
            <Button onClick={handleEditEstimate}>
              {editEstimate ? "Show estimate" : "Edit"}
            </Button>
          )}
        </Flex>
      </Flex>

      {Object.keys(details)?.length === 0 || editEstimate ? (
        <Flex
          vertical
          style={{
            maxHeight: "84vh",
            overflow: "auto",
            margin: "24px 0px",
          }}
        >
          <Flex
            vertical
            gap={4}
            style={{ marginBottom: "12px", marginLeft: 16 }}
          >
            <Text
              className="heading-text"
              style={{ fontSize: 14, marginBottom: 8 }}
            >
              Seach for companies{" "}
            </Text>
            <Space.Compact style={{ width: "80%" }}>
              <Select
                style={{ width: "20%" }}
                options={[
                  { label: "GST", value: "gstNumber" },
                  { label: "Name", value: "searchNameAndGSt" },
                  { label: "Contact no.", value: "contactNumber" },
                  { label: "Email", value: "contactEmail" },
                ]}
                value={seachFields?.searchField}
                onChange={(e) => {
                  setSearchFields((prev) => ({ ...prev, searchField: e }));
                }}
              />
              <Select
                showSearch
                style={{ width: "100%" }}
                placeholder="Search companies ..."
                options={
                  seachCompniesList?.length > 0
                    ? seachCompniesList?.map((item) => ({
                        label: item?.companyName,
                        value: item?.companyId,
                        key: item?.companyId,
                      }))
                    : []
                }
                onChange={(value, option) => {
                  setSearchFields((prev) => ({
                    ...prev,
                    searchText: option?.label,
                  }));
                  setCompanyAndUnitData((prev) => ({
                    ...prev,
                    companyName: option?.label,
                    companyId: option?.value,
                  }));
                  dispatch(getAllCompanyUnits(option?.value));
                  dispatch(getAllContactDetailsById(option?.value));
                  setOpenSelectDd(false);
                }}
                open={openSelectDd}
                value={seachFields?.searchText || undefined}
                onSearch={(e) => {
                  setSearchFields((prev) => ({ ...prev, searchText: e }));
                }}
                onDropdownVisibleChange={(e) => setOpenSelectDd(e)}
                filterOption={false}
              />
            </Space.Compact>
          </Flex>
          <Form
            form={form}
            layout="vertical"
            style={{ width: "90%" }}
            scrollToFirstError
            initialValues={{
              cc: [""],
              isConsultant: false,
              performaInvoice: false,
            }}
            onValuesChange={(changedValues, allValues) => {
              const { actualPrice, quantity, gst } = allValues;
              if (actualPrice && quantity && gst !== undefined) {
                const total = calculateTotalPriceWithGST(
                  actualPrice,
                  quantity,
                  gst
                );
                form.setFieldsValue({ totalPrice: total });
              }
            }}
            onFinish={handleFinish}
          >
            <Flex style={{ margin: "12px 0px 0px 16px" }}>
              <Form.Item
                layout="horizontal"
                label="Proforma invoice"
                name="performaInvoice"
                className="performa"
              >
                <Switch size="small" />
              </Form.Item>
            </Flex>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr",
                gap: "16px",
                width: "100%",
                boxShadow: "rgba(0, 0, 0, 0.24) 0px 3px 8px",
                padding: "24px",
                margin: "12px 0px",
                borderRadius: 6,
              }}
            >
              <Flex justify="space-between" align="center">
                {" "}
                <Text className="heading-text">Company info</Text>
                {!companyAndUnitData?.oneTimeUpdateGst && (
                  <Button onClick={() => setGstModal(true)} type="link">
                    Update gst type
                  </Button>
                )}
              </Flex>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "16px",
                }}
              >
                <Form.Item
                  label="Select company unit"
                  name="unitId"
                  rules={[
                    {
                      required: true,
                      message: "please enter the company name",
                    },
                  ]}
                >
                  <Select
                    showSearch
                    options={
                      allCompanyUnits?.length > 0
                        ? allCompanyUnits?.map((item) => ({
                            label: item?.companyName,
                            value: item?.id,
                            ...item,
                          }))
                        : []
                    }
                    onChange={(e, compUnit) => {
                      setCompanyAndUnitData((prev) => ({
                        ...prev,
                        unitName: compUnit?.label,
                        unitId: compUnit?.value,
                        oneTimeUpdateGst: compUnit?.oneTimeUpdateGst,
                        oneTimeUpdateAddress: compUnit?.oneTimeUpdateAddress,
                      }));
                      dispatch(
                        getAllGstTypeByCompanyTypeId(compUnit?.companyType)
                      );
                      dispatch(getBusinessTypeByGstTypeId(compUnit?.gstType));
                      form.setFieldsValue({
                        gstType: compUnit?.gstType,
                        gstNo: compUnit?.gstNo,
                        companyType: compUnit?.companyType,
                        businessType: compUnit?.bussinessType,
                        companyAge: compUnit?.companyAge,
                        address: compUnit?.address,
                        city: compUnit?.city,
                        country: compUnit?.country,
                        state: compUnit?.state,
                        primaryContact: compUnit?.primaryContact,
                        panNo: compUnit?.panNo,
                        primaryContact: compUnit?.primaryContact?.id,
                        secondaryContact: compUnit?.secondaryContact?.id,
                        assigneeId: compUnit?.assignee?.id,
                        primaryPinCode: compUnit?.pinCode,
                        secondaryAddress: compUnit?.sAddress,
                        secondaryCity: compUnit?.sCity,
                        secondaryState: compUnit?.sState,
                        secondaryCountry: compUnit?.sCountry,
                        secondaryPinCode: compUnit?.secondaryPinCode,
                      });
                      gstForm.setFieldsValue({
                        companyType: compUnit?.companyType,
                        gstType: compUnit?.gstType,
                        businessType: compUnit?.bussinessType,
                        gstNo: compUnit?.gstNo,
                        panNo: compUnit?.panNo,
                      });
                      addressForm.setFieldsValue({
                        revenue: compUnit?.revenue,
                        address: compUnit?.address,
                        city: compUnit?.city,
                        state: compUnit?.state,
                        country: compUnit?.country,
                        pinCode: compUnit?.pinCode,
                      });
                      setGstMand({
                        gst: compUnit?.gstPresent,
                        pan: compUnit?.panPresent,
                      });
                    }}
                  />
                </Form.Item>
                <Form.Item
                  label="Company structure"
                  name="companyType"
                  rules={[
                    {
                      required: true,
                      message: "please select the company structure type",
                    },
                  ]}
                >
                  <Select
                    showSearch
                    disabled
                    allowClear
                    options={
                      companyTypeList?.length > 0
                        ? companyTypeList?.map((item) => ({
                            label: item?.name,
                            value: item?.id,
                            ...item,
                          }))
                        : []
                    }
                    onChange={(e, x) => {
                      dispatch(getAllGstTypeByCompanyTypeId(e));
                      form.resetFields(["gstType", "businessType"]);
                      setGstMand({ pan: false, gst: false });
                    }}
                  />
                </Form.Item>

                <Form.Item
                  label="Gst type"
                  name="gstType"
                  rules={[
                    { required: true, message: "please select the gst type" },
                  ]}
                >
                  <Select
                    showSearch
                    allowClear
                    disabled
                    options={
                      gstTypeList?.gstBussinessType?.length > 0
                        ? gstTypeList?.gstBussinessType?.map((item) => ({
                            label: item?.name,
                            value: item?.id,
                            ...item,
                          }))
                        : []
                    }
                    onChange={(e, x) => {
                      dispatch(getBusinessTypeByGstTypeId(e));
                    }}
                  />
                </Form.Item>

                <Form.Item
                  label="Business type"
                  name="businessType"
                  rules={[
                    {
                      required: true,
                      message: "please select the business type",
                    },
                  ]}
                >
                  <Select
                    showSearch
                    allowClear
                    disabled
                    options={
                      businessTypeList?.gstTypePrice?.length > 0
                        ? businessTypeList?.gstTypePrice?.map((item) => ({
                            label: item?.name,
                            value: item?.id,
                            ...item,
                          }))
                        : []
                    }
                    onChange={(e, x) => {
                      setGstMand((prev) => ({
                        ...prev,
                        gst: x?.gstPresent,
                        pan: x?.panPresent,
                      }));
                      form.resetFields(["gstNo", "panNo"]);
                    }}
                  />
                </Form.Item>

                {gstMand?.gst && (
                  <Form.Item
                    label="Gst number"
                    name="gstNo"
                    rules={[
                      {
                        required: true,
                        message: "please enter gst number",
                      },
                    ]}
                  >
                    <Input
                      maxLength={15}
                      disabled
                      onChange={(e) => {
                        const formatted = formatGSTInput(e.target.value);
                        form.setFieldsValue({ gstNo: formatted });
                      }}
                    />
                  </Form.Item>
                )}

                {gstMand?.pan && (
                  <Form.Item
                    label="Pan number"
                    name="panNo"
                    disabled
                    rules={[
                      { required: true, message: "please enter pan number" },
                      {
                        validator: (_, value) =>
                          panRegex.test(value)
                            ? Promise.resolve()
                            : Promise.reject("Invalid PAN Number"),
                      },
                    ]}
                  >
                    <Input
                      disabled
                      maxLength={10}
                      onChange={(e) => {
                        const formatted = formatPANInput(e.target.value);
                        form.setFieldsValue({ panNo: formatted });
                      }}
                    />
                  </Form.Item>
                )}

                <Form.Item
                  label="GST documents"
                  name="gstDocuments"
                  getValueFromEvent={normFile}
                  valuePropName="fileList"
                >
                  <Upload
                    action="/leadService/api/v1/upload/uploadimageToFileSystem"
                    listType="text"
                    multiple={true}
                  >
                    <Button style={{ width: "100%" }}>
                      <Icon icon="fluent:arrow-upload-20-filled" />
                      Upload
                    </Button>
                  </Upload>
                </Form.Item>
                <div>
                  <Form.List name="cc">
                    {(fields, { add, remove }, { errors }) => (
                      <>
                        {fields.map((field, index) => (
                          <Form.Item
                            {...(index === 0
                              ? { label: "Email", required: true }
                              : {})}
                            key={field.key}
                            style={{ marginBottom: 4 }}
                          >
                            <Form.Item
                              {...field}
                              validateTrigger={["onChange", "onBlur"]}
                              rules={[
                                {
                                  required: true,
                                  whitespace: true,
                                  type: "email",
                                  message: "Please input email",
                                },
                              ]}
                              style={{ width: "100%", marginBottom: 4 }}
                            >
                              <Input placeholder="example@xyz.com" />
                            </Form.Item>
                            {fields.length > 1 ? (
                              <Button
                                size="small"
                                type="text"
                                style={{ margin: "0px 4px" }}
                                onClick={() => remove(field.name)}
                                danger
                              >
                                <Icon icon="fluent:delete-24-regular" />
                              </Button>
                            ) : null}
                          </Form.Item>
                        ))}
                        <Form.Item>
                          <Button type="link" onClick={() => add()}>
                            Add Cc
                          </Button>
                          <Form.ErrorList errors={errors} />
                        </Form.Item>
                      </>
                    )}
                  </Form.List>
                </div>
              </div>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr",
                gap: "16px",
                width: "100%",
                boxShadow: "rgba(0, 0, 0, 0.24) 0px 3px 8px",
                padding: "24px",
                margin: "24px 0px",
                borderRadius: 6,
              }}
            >
              <Flex vertical gap={12}>
                <Text className="heading-text">Contacts</Text>
                <Button
                  style={{ width: 200 }}
                  onClick={() => setOpenModal(true)}
                >
                  Add new contact
                </Button>
              </Flex>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "16px",
                }}
              >
                <Form.Item
                  label="Primary contacts"
                  name="primaryContact"
                  rules={[
                    {
                      required: true,
                      message: "please select primary contacts",
                    },
                  ]}
                >
                  <Select
                    showSearch
                    options={
                      contactList?.length > 0
                        ? contactList?.map((item) => ({
                            label: `${maskEmail(
                              item?.email
                            )} || ${maskMobileNumber(item?.contactNo)} `,
                            value: item?.id,
                            email: item?.email,
                            contact: item?.contactNo,
                          }))
                        : []
                    }
                    filterOption={(input, option) =>
                      option?.email
                        ?.toLowerCase()
                        ?.includes(input?.toLowerCase()) ||
                      option?.contact
                        ?.toLowerCase()
                        ?.includes(input?.toLowerCase())
                    }
                  />
                </Form.Item>
                <Form.Item
                  label="Secondary contacts"
                  name="secondaryContact"
                  rules={[
                    {
                      required: true,
                      message: "please select secondary contacts",
                    },
                  ]}
                >
                  <Select
                    showSearch
                    options={
                      secondaryContactList?.length > 0
                        ? secondaryContactList?.map((item) => ({
                            label: `${maskEmail(
                              item?.email
                            )} || ${maskMobileNumber(item?.contactNo)} `,
                            value: item?.id,
                            email: item?.email,
                            contact: item?.contactNo,
                          }))
                        : []
                    }
                    filterOption={(input, option) =>
                      option?.email
                        ?.toLowerCase()
                        ?.includes(input?.toLowerCase()) ||
                      option?.contact
                        ?.toLowerCase()
                        ?.includes(input?.toLowerCase())
                    }
                  />
                </Form.Item>
              </div>
            </div>

            <Flex
              gap={4}
              align="center"
              style={{ marginBottom: "12px", fontWeight: "bold" }}
            >
              <Switch
                size="small"
                onChange={(e) => {
                  setDiscount(e);
                  form.validateFields([
                    "professionalFees",
                    "serviceCharge",
                    "govermentfees",
                    "otherFees",
                    "actualPrice",
                  ]);
                }}
              />{" "}
              <Text className="heading-text">Discount approval</Text>
            </Flex>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr",
                gap: "16px",
                width: "100%",
                boxShadow: "rgba(0, 0, 0, 0.24) 0px 3px 8px",
                padding: "24px",
                margin: "24px 0px",
                borderRadius: 6,
              }}
            >
              <Text className="heading-text">Product info</Text>

              {productData?.type === "Product" ? (
                <div>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      width: "100%",
                      gap: 8,
                    }}
                  >
                    <Form.Item
                      style={{ width: "100%" }}
                      label="Select business arrangement"
                      name="businessArrangmentId"
                      rules={[
                        {
                          required: true,
                          message: "please select business arrangement",
                        },
                      ]}
                    >
                      <Select
                        showSearch
                        options={
                          businessArrangementList?.map((item) => ({
                            label: item?.name,
                            value: item?.id,
                          })) || []
                        }
                        onChange={(e) => {
                          dispatch(getAllProductCategoryById(e));
                          form.resetFields([
                            "productCategoryId",
                            "productSubCategoryId",
                          ]);
                        }}
                      />
                    </Form.Item>
                    <Form.Item
                      style={{ width: "100%" }}
                      label="Select product category"
                      name="productCategoryId"
                      rules={[
                        {
                          required: true,
                          message: "please select product category",
                        },
                      ]}
                    >
                      <Select
                        showSearch
                        options={
                          productCategoryList?.map((item) => ({
                            label: item?.name,
                            value: item?.id,
                          })) || []
                        }
                        onChange={(e) => {
                          dispatch(getAllProductSubCategoryListByCategoryId(e));
                          form.resetFields(["productSubCategoryId"]);
                        }}
                      />
                    </Form.Item>
                    <Form.Item
                      style={{ width: "100%" }}
                      label="Select product sub category"
                      name="productSubCategoryId"
                      rules={[
                        {
                          required: true,
                          message: "please select product sub category",
                        },
                      ]}
                    >
                      <Select
                        showSearch
                        options={
                          productSubcategoryList?.map((item) => ({
                            label: item?.name,
                            value: item?.id,
                            ...item,
                          })) || []
                        }
                        onChange={(e, x) => {
                          setProductSubCategoryData(x);
                          form.setFieldsValue({
                            actualPrice: x?.productFees,
                            gstCode: x?.productCode,
                            gst: x?.productGst,
                          });
                          setProductSubCategoryFees((prev) => ({
                            ...prev,
                            actualPrice: x?.productFees,
                            gst: x?.productGst,
                            roundOff: x?.roundValue,
                          }));
                        }}
                      />
                    </Form.Item>
                  </div>

                  {Object.keys(productSubCategoryData || {})?.length > 0 && (
                    <div
                      style={{ display: "flex", alignItems: "center", gap: 8 }}
                    >
                      <Form.Item
                        style={{ width: "100%" }}
                        label="Actual price ₹/kg"
                        name="actualPrice"
                        rules={[
                          {
                            required: true,
                            message: "Please give actual price",
                          },
                          {
                            validator: (_, value) =>
                              validateGreaterThanOrEqual(
                                productSubCategoryFees?.actualPrice,
                                discount
                              ).validator(_, value),
                          },
                        ]}
                      >
                        <InputNumber
                          controls={false}
                          style={{ width: "100%" }}
                        />
                      </Form.Item>
                      <Form.Item
                        style={{ width: "100%" }}
                        label="HSN number"
                        name="gstCode"
                        rules={[
                          {
                            required: true,
                            message: "please provide HSN number",
                          },
                        ]}
                      >
                        <Input placeholder="Hsn number" />
                      </Form.Item>
                      <Form.Item
                        label="Gst %"
                        name="gst"
                        style={{ width: "100%" }}
                      >
                        <Input
                          placeholder="Gst %"
                          disabled={
                            productSubCategoryFees?.gst == 0 ? false : true
                          }
                        />
                      </Form.Item>
                      <Form.Item
                        label="Quantity in kg"
                        name="quantity"
                        style={{ width: "100%" }}
                      >
                        <InputNumber
                          controls={false}
                          style={{ width: "100%" }}
                          onChange={(e) => {
                            if (productSubCategoryFees?.roundOff) {
                              form.setFieldsValue({
                                quantity: Math.ceil(e / 1000) * 1000,
                              });
                            } else {
                              form.setFieldsValue({ quantity: e });
                            }
                          }}
                        />
                      </Form.Item>
                      <Form.Item
                        label="Total price (₹)"
                        name="totalPrice"
                        style={{ width: "100%" }}
                      >
                        <Input disabled />
                      </Form.Item>
                    </div>
                  )}
                </div>
              ) : (
                <>
                  {productData?.productAmount?.map((ele, idx) => {
                    if (ele?.name === "Professional fees") {
                      return (
                        <div
                          key={`${idx}product`}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 8,
                          }}
                        >
                          <Form.Item
                            style={{ width: "100%" }}
                            label="Professional fees"
                            name="professionalFees"
                            layout="horizontal"
                            rules={[
                              {
                                required: true,
                                message: "Please give professional fees",
                              },
                              {
                                validator: (_, value) =>
                                  validateGreaterThanOrEqual(
                                    productFees?.professionalFees,
                                    discount
                                  ).validator(_, value),
                              },
                            ]}
                          >
                            <Input />
                          </Form.Item>
                          <Form.Item
                            style={{ width: "100%" }}
                            name="professionalCode"
                            rules={[
                              {
                                required: true,
                                message: "please provide HSN number",
                              },
                            ]}
                          >
                            <Input placeholder="Hsn number" />
                          </Form.Item>
                          <Form.Item
                            name="profesionalGst"
                            style={{ width: "100%" }}
                          >
                            <Input
                              placeholder="Gst %"
                              disabled={
                                productFees?.profesionalGst == 0 ? false : true
                              }
                            />
                          </Form.Item>
                        </div>
                      );
                    }

                    if (ele?.name === "Service charges") {
                      return (
                        <div
                          key={`${idx}product`}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 8,
                          }}
                        >
                          <Form.Item
                            label="Service charges"
                            name="serviceCharge"
                            layout="horizontal"
                            style={{ width: "100%" }}
                            rules={[
                              {
                                required: true,
                                message: "please give service charges",
                              },

                              {
                                validator: (_, value) =>
                                  validateGreaterThanOrEqual(
                                    productFees?.serviceCharge,
                                    discount
                                  ).validator(_, value),
                              },
                            ]}
                          >
                            <Input />
                          </Form.Item>
                          <Form.Item
                            name="serviceCode"
                            style={{ width: "100%" }}
                            rules={[
                              {
                                required: true,
                                message: "please give HSN number",
                              },
                            ]}
                          >
                            <Input placeholder="HSN number" />
                          </Form.Item>
                          <Form.Item
                            name="serviceGst"
                            style={{ width: "100%" }}
                          >
                            <Input
                              placeholder="Gst %"
                              disabled={
                                productFees?.serviceGst === 0 ? false : true
                              }
                            />
                          </Form.Item>
                        </div>
                      );
                    }

                    if (ele?.name === "Government") {
                      return (
                        <div
                          key={`${idx}product`}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 8,
                          }}
                        >
                          <Form.Item
                            label="Government fees"
                            name="govermentfees"
                            layout="horizontal"
                            style={{ width: "100%" }}
                            rules={[
                              {
                                required: true,
                                message: "please give govt. fees",
                              },
                              {
                                validator: (_, value) =>
                                  validateGreaterThanOrEqual(
                                    productFees?.govermentfees,
                                    discount
                                  ).validator(_, value),
                              },
                            ]}
                          >
                            <Input />
                          </Form.Item>
                          <Form.Item
                            name="govermentCode"
                            style={{ width: "100%" }}
                            rules={[
                              {
                                required: true,
                                message: "please give HSN number",
                              },
                            ]}
                          >
                            <Input placeholder="HSN number" />
                          </Form.Item>
                          <Form.Item
                            name="govermentGst"
                            style={{ width: "100%" }}
                          >
                            <Input
                              placeholder="Gst %"
                              disabled={
                                productFees?.govermentGst === 0 ? false : true
                              }
                            />
                          </Form.Item>
                        </div>
                      );
                    }

                    if (ele?.name === "Other fees") {
                      return (
                        <div
                          key={`${idx}product`}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 8,
                          }}
                        >
                          <Form.Item
                            label="Other fees"
                            name="otherFees"
                            layout="horizontal"
                            style={{ width: "100%" }}
                            rules={[
                              {
                                required: true,
                                message: "please give other fees charges",
                              },

                              {
                                validator: (_, value) =>
                                  validateGreaterThanOrEqual(
                                    productFees?.otherFees,
                                    discount
                                  ).validator(_, value),
                              },
                            ]}
                          >
                            <Input />
                          </Form.Item>
                          <Form.Item
                            name="otherCode"
                            style={{ width: "100%" }}
                            rules={[
                              {
                                required: true,
                                message: "please give HSN number",
                              },
                            ]}
                          >
                            <Input placeholder="HSN number" />
                          </Form.Item>
                          <Form.Item name="otherGst" style={{ width: "100%" }}>
                            <Input
                              placeholder="Gst %"
                              disabled={
                                productFees?.otherGst === 0 ? false : true
                              }
                            />
                          </Form.Item>
                        </div>
                      );
                    }

                    return null;
                  })}
                </>
              )}
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr",
                gap: "16px",
                width: "100%",
                boxShadow: "rgba(0, 0, 0, 0.24) 0px 3px 8px",
                padding: "24px",
                margin: "24px 0px",
                borderRadius: 6,
              }}
            >
              <Text className="heading-text">Purchasing info</Text>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "16px",
                }}
              >
                <Form.Item
                  label="Select sales person name"
                  name="assigneeId"
                  rules={[
                    { required: true, message: "please select sales person" },
                  ]}
                >
                  <Select
                    options={
                      leadUserNew?.length > 0
                        ? leadUserNew?.map((ele) => ({
                            label: ele?.fullName,
                            value: ele?.id,
                          }))
                        : []
                    }
                    filterOption={(input, option) =>
                      option.label.toLowerCase().includes(input.toLowerCase())
                    }
                  />
                </Form.Item>
                <Form.Item
                  label="Order number"
                  name="orderNumber"
                  rules={[
                    { required: true, message: "please give order number" },
                  ]}
                >
                  <Input />
                </Form.Item>
                <Form.Item
                  label="Purchase date"
                  name="purchaseDate"
                  rules={[{ required: true, message: "please select date" }]}
                >
                  <DatePicker
                    style={{ width: "100%" }}
                    disabledDate={(current) => {
                      return current && current > dayjs().endOf("day");
                    }}
                  />
                </Form.Item>
                <Form.Item
                  label="Invoice notes"
                  name="invoiceNote"
                  rules={[
                    { required: true, message: "please write invoice notes" },
                  ]}
                >
                  <Input.TextArea />
                </Form.Item>
                <Form.Item
                  label="Remarks For Operation"
                  name="remarksForOption"
                  rules={[{ required: true, message: "please write remarks" }]}
                >
                  <Input.TextArea />
                </Form.Item>
              </div>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr",
                gap: "16px",
                width: "100%",
                boxShadow: "rgba(0, 0, 0, 0.24) 0px 3px 8px",
                padding: "24px",
                margin: "24px 0px",
                borderRadius: 6,
              }}
            >
              <div
                style={{
                  width: "100%",
                  display: "flex",
                  flexDirection: "column",
                  gap: 12,
                }}
              >
                <Flex justify="space-between" align="center">
                  <Text className="heading-text">Address</Text>
                  {!companyAndUnitData?.oneTimeUpdateAddress && (
                    <Button type="link" onClick={() => setAddressModal(true)}>
                      Update address
                    </Button>
                  )}
                </Flex>

                <Divider>Primary address</Divider>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "16px",
                  }}
                >
                  <Form.Item
                    label="Address"
                    name="address"
                    rules={[
                      { required: true, message: "please enter address" },
                    ]}
                  >
                    <Input.TextArea />
                  </Form.Item>
                  <Form.Item
                    label="Country"
                    name="country"
                    rules={[
                      { required: true, message: "please select country" },
                    ]}
                  >
                    <Select
                      showSearch
                      options={
                        countryList?.length > 0
                          ? countryList?.map((item) => ({
                              label: item?.name,
                              value: item?.name,
                              id: item?.id,
                            }))
                          : []
                      }
                      onChange={(e, x) => {
                        dispatch(getAllStatesByCountryId(x?.id));
                      }}
                      filterOption={(input, option) =>
                        option.label.toLowerCase().includes(input.toLowerCase())
                      }
                    />
                  </Form.Item>
                  <Form.Item
                    label="State"
                    name="state"
                    rules={[{ required: true, message: "please select state" }]}
                  >
                    <Select
                      showSearch
                      options={
                        statesList?.length > 0
                          ? statesList?.map((item) => ({
                              label: item?.name,
                              value: item?.name,
                              id: item?.id,
                            }))
                          : []
                      }
                      // onChange={(e, x) => dispatch(getAllCitiesByStateId(x?.id))}
                      onChange={(e, option) => {
                        dispatch(getAllCitiesByStateId(option?.id));
                        form.resetFields(["city"]);
                        form.validateFields(["state", "gstNo"]).catch(() => {
                          const gstNumber = form.getFieldValue("gstNo");
                          const selectedState = statesList.find(
                            (s) => s.id === e
                          );
                          if (
                            selectedState &&
                            gstNumber &&
                            gstNumber.slice(0, 2) !== selectedState.gstCode
                          ) {
                            form.setFields([
                              {
                                name: "gstNo",
                                errors: [
                                  "GST number does not match selected state",
                                ],
                              },
                              {
                                name: "state",
                                errors: [
                                  "Selected state does not match GST number",
                                ],
                              },
                            ]);
                          }
                        });
                      }}
                      filterOption={(input, option) =>
                        option.label.toLowerCase().includes(input.toLowerCase())
                      }
                    />
                  </Form.Item>
                  <Form.Item label="City" name="city">
                    <Select
                      showSearch
                      options={
                        citiesList?.length > 0
                          ? citiesList?.map((item) => ({
                              label: item?.name,
                              value: item?.name,
                            }))
                          : []
                      }
                      filterOption={(input, option) =>
                        option.label.toLowerCase().includes(input.toLowerCase())
                      }
                    />
                  </Form.Item>{" "}
                  <Form.Item
                    label="Pin code"
                    name="primaryPinCode"
                    rules={[
                      { required: true, message: "please enter pincode" },
                    ]}
                  >
                    <Input />
                  </Form.Item>
                </div>
              </div>
              <Divider>Secondary address</Divider>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "16px",
                }}
              >
                <Form.Item
                  label="Secondary address"
                  name="secondaryAddress"
                  rules={[
                    {
                      required: true,
                      message: "please enter secondary address",
                    },
                  ]}
                >
                  <Input.TextArea />
                </Form.Item>
                <Form.Item label="Country" name="secondaryCountry">
                  <Select
                    showSearch
                    options={
                      countryList?.length > 0
                        ? countryList?.map((item) => ({
                            label: item?.name,
                            value: item?.name,
                            id: item?.id,
                          }))
                        : []
                    }
                    onChange={(e, x) => {
                      dispatch(getAllStatesByCountryId(x?.id));
                    }}
                    filterOption={(input, option) =>
                      option.label.toLowerCase().includes(input.toLowerCase())
                    }
                  />
                </Form.Item>
                <Form.Item label="State" name="secondaryState">
                  <Select
                    showSearch
                    options={
                      statesList?.length > 0
                        ? statesList?.map((item) => ({
                            label: item?.name,
                            value: item?.name,
                            id: item?.id,
                          }))
                        : []
                    }
                    onChange={(e, x) => dispatch(getAllCitiesByStateId(x?.id))}
                    filterOption={(input, option) =>
                      option.label.toLowerCase().includes(input.toLowerCase())
                    }
                  />
                </Form.Item>
                <Form.Item label="City" name="secondaryCity">
                  <Select
                    showSearch
                    options={
                      citiesList?.length > 0
                        ? citiesList?.map((item) => ({
                            label: item?.name,
                            value: item?.name,
                          }))
                        : []
                    }
                    filterOption={(input, option) =>
                      option.label.toLowerCase().includes(input.toLowerCase())
                    }
                  />
                </Form.Item>
                <Form.Item
                  label="Secondary address pincode"
                  name="secondaryPinCode"
                  rules={[
                    {
                      required: true,
                      message: "please enter secondary pincode",
                    },
                  ]}
                >
                  <Input />
                </Form.Item>
              </div>
            </div>

            <Form.Item>
              <Button htmlType="submit" type="primary">
                Submit
              </Button>
            </Form.Item>
          </Form>
          <Modal
            title="Add new contact"
            open={openModal}
            onCancel={() => setOpenModal(false)}
            onClose={() => setOpenModal(false)}
            onOk={() => contactForm.submit()}
            okText="Submit"
          >
            <Form
              layout="vertical"
              form={contactForm}
              onFinish={handleFinishContact}
            >
              <Form.Item
                label="Name"
                name="name"
                rules={[{ required: true, message: "please enter name" }]}
              >
                <Input />
              </Form.Item>
              <Form.Item
                label="Email"
                name="emails"
                rules={[
                  {
                    required: true,
                    type: "email",
                    message: "please enter email",
                  },
                ]}
              >
                <Input />
              </Form.Item>
              <Form.Item
                label="Contact number"
                name="contactNo"
                rules={[
                  { required: true, message: "please enter contact number" },
                ]}
              >
                <Input />
              </Form.Item>
              <Form.Item
                label="Whatsapp number"
                name="whatsappNo"
                rules={[
                  { required: true, message: "please enter whatsapp number" },
                ]}
              >
                <Input />
              </Form.Item>
            </Form>
          </Modal>
        </Flex>
      ) : (
        <Flex
          style={{
            maxHeight: "84vh",
            overflow: "auto",
            marginTop: "12px",
            padding: "24px",
          }}
        >
          <Flex style={{ width: "90%" }} gap={24} vertical>
            {details?.productName && (
              <Flex gap={4} align="center">
                <Text className="heading-text">Product name</Text>
                <Text className="heading-text">:</Text>
                <Text>{details?.productName}</Text>
              </Flex>
            )}
            <Flex gap={60}>
              {details?.primaryContact && (
                <Card style={{ width: "40%" }}>
                  <Flex vertical gap={12}>
                    <Text className="heading-text">Primary contact detail</Text>
                    <Flex vertical>
                      <Space>
                        <Text type="secondary">Name</Text>
                        <Text type="secondary">:</Text>
                        <Text>{details?.primaryContact?.name}</Text>
                      </Space>
                      <Space>
                        <Text type="secondary">Email</Text>
                        <Text type="secondary">:</Text>
                        <Text>{details?.primaryContact?.emails}</Text>
                      </Space>
                      <Space>
                        <Text type="secondary">Contact number</Text>
                        <Text type="secondary">:</Text>
                        <Text>{details?.primaryContact?.contactNo}</Text>
                      </Space>
                      <Space>
                        <Text type="secondary">Whatsapp number</Text>
                        <Text type="secondary">:</Text>
                        <Text>{details?.primaryContact?.whatsappNo}</Text>
                      </Space>
                    </Flex>
                  </Flex>
                </Card>
              )}

              {details?.secondaryContact && (
                <Card style={{ width: "40%" }}>
                  <Flex vertical gap={12}>
                    <Text className="heading-text">
                      Secondary contact detail
                    </Text>
                    <Flex vertical>
                      <Space>
                        <Text type="secondary">Name</Text>
                        <Text type="secondary">:</Text>
                        <Text>{details?.secondaryContact?.name}</Text>
                      </Space>
                      <Space>
                        <Text type="secondary">Email</Text>
                        <Text type="secondary">:</Text>
                        <Text>{details?.secondaryContact?.emails}</Text>
                      </Space>
                      <Space>
                        <Text type="secondary">Contact number</Text>
                        <Text type="secondary">:</Text>
                        <Text>{details?.secondaryContact?.contactNo}</Text>
                      </Space>
                      <Space>
                        <Text type="secondary">Whatsapp number</Text>
                        <Text type="secondary">:</Text>
                        <Text>{details?.secondaryContact?.whatsappNo}</Text>
                      </Space>
                    </Flex>
                  </Flex>
                </Card>
              )}
            </Flex>
            <Flex ref={pdfRef}>
              <Badge.Ribbon
                text={
                  details?.performaInvoice ? "Proforma Invoice" : "Estimate"
                }
                placement="start"
                color="green"
              >
                <Flex
                  vertical
                  style={{
                    padding: "60px",
                    boxShadow:
                      "rgba(9, 30, 66, 0.25) 0px 4px 8px -2px, rgba(9, 30, 66, 0.08) 0px 0px 0px 1px",
                    borderRadius: "4px",
                    marginBottom: "24px",
                  }}
                  gap={24}
                >
                  <Flex justify="space-between">
                    <Flex vertical>
                      <Flex>
                        <img src={logo} alt="corpseed" />
                      </Flex>
                      <Flex vertical>
                        {" "}
                        <Text type="secondary">
                          Corpseed Ites Private Limited
                        </Text>
                        <Text>CN U74999UP2018PTC101873</Text>
                        <Text>2nd floor, A-154A, A Block, sector 63</Text>
                        <Text>Noida, Uttar Pradesh - 2013</Text>
                      </Flex>
                    </Flex>
                    <Flex vertical gap={24}>
                      <Flex vertical>
                        <Title style={{ color: "#41d744" }} level={4}>
                          {details?.performaInvoice
                            ? "Proforma Invoice"
                            : "Estimate"}
                        </Title>
                        <Text strong>{`#ESTD0${details?.id}`}</Text>
                      </Flex>
                      <Flex vertical>
                        <Title style={{ color: "#41d744" }} level={4}>
                          Order No.
                        </Title>
                        <Text strong>{details?.orderNumber}</Text>
                      </Flex>
                    </Flex>
                  </Flex>
                  <Flex vertical>
                    <Text type="secondary">Bill To : </Text>
                    <Flex vertical>
                      {details?.companyName && (
                        <Text style={{ fontWeight: "bold" }}>
                          {details?.companyName}
                        </Text>
                      )}
                      {details?.address && <Text>{details?.address}</Text>}
                      <Flex vertical>
                        <Flex>
                          {details?.city && <Text>{details?.city},</Text>}
                          {details?.state && <Text>{details?.state},</Text>}
                          {details?.country && <Text>{details?.country}</Text>}
                        </Flex>
                      </Flex>
                      {details?.primaryPinCode && (
                        <Text>{details?.primaryPinCode}</Text>
                      )}
                    </Flex>
                  </Flex>
                  <Flex justify="space-between">
                    <Flex vertical gap={8}>
                      <Text type="secondary">Ship To : </Text>
                      <Flex vertical>
                        {details?.companyName && (
                          <Text>{details?.companyName}</Text>
                        )}
                        <Flex vertical>
                          {details?.secondaryAddress && (
                            <Text>{details?.secondaryAddress}</Text>
                          )}

                          <Flex>
                            {details?.secondaryCity && (
                              <Text>{details?.secondaryCity},</Text>
                            )}
                            {details?.secondaryState && (
                              <Text>{details?.secondaryState},</Text>
                            )}
                            {details?.secondaryCountry && (
                              <Text>{details?.secondaryCountry?.name}</Text>
                            )}
                          </Flex>
                        </Flex>
                        {details?.secondaryPinCode && (
                          <Text>{details?.secondaryPinCode}</Text>
                        )}
                      </Flex>
                    </Flex>
                    <Flex vertical gap={8}>
                      <Flex gap={8}>
                        <Text type="secondary">Estimate Date</Text>
                        <Text type="secondary">:</Text>
                        <Text>
                          {dayjs(details?.estimateDate).format("DD-MM-YYYY")}
                        </Text>
                      </Flex>
                      <Flex gap={8}>
                        <Text type="secondary">Order Date</Text>
                        <Text type="secondary">:</Text>
                        <Text>
                          {dayjs(details?.createDate).format("DD-MM-YYYY")}
                        </Text>
                      </Flex>
                    </Flex>
                  </Flex>

                  <Flex vertical gap={16}>
                    {details?.Type === "Product" ? (
                      <table className="custom-table">
                        <thead>
                          <tr>
                            <th>#</th>
                            <th>Item and description</th>
                            <th>HSN</th>
                            <th>Rate/kg</th>
                            <th>Quantity (kg)</th>
                            <th>GST %</th>
                            <th>GST amount(₹)</th>
                            <th>Amount(₹)</th>
                          </tr>
                        </thead>

                        <tbody>
                          <tr>
                            <td>1</td>
                            <td>
                              <Text style={{ fontWeight: "bold" }}>
                                {details?.productName}
                              </Text>
                            </td>
                            <td></td>
                            <td></td>
                            <td></td>
                            <td></td>
                            <td></td>
                          </tr>
                          {details?.gstCode && (
                            <tr>
                              <td></td>
                              <td>Service fee</td>
                              <td>{details?.gstCode}</td>
                              <td>{details?.actualPrice}</td>
                              <td>{details?.quantity}</td>
                              <td>{details?.gst}</td>
                              <td>
                                {(details?.actualPrice *
                                  details?.quantity *
                                  details?.gst) /
                                  100}
                              </td>
                              <td>{details?.totalPrice}</td>
                            </tr>
                          )}
                          <tr
                            style={{
                              borderTop: "1px solid black",
                              borderBottom: "1px solid black",
                            }}
                          >
                            <td></td>
                            <td>
                              <Text strong>Total Qty. : 1</Text>
                            </td>
                            <td>{""}</td>
                            <td>{""}</td>
                            <td>{""}</td>
                            <td>{""}</td>
                            <td>{""}</td>
                            <td>
                              <Flex gap={2} wrap="nowrap">
                                <Text>₹ </Text>
                                <Text strong>{details?.totalPrice}</Text>
                              </Flex>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    ) : (
                      <table className="custom-table">
                        <thead>
                          <tr>
                            <th>#</th>
                            <th>Item and description</th>
                            <th>HSN</th>
                            <th>Rate</th>
                            <th>GST %</th>
                            <th>GST amount</th>
                            <th>Amount</th>
                          </tr>
                        </thead>

                        <tbody>
                          <tr>
                            <td>1</td>
                            <td>
                              <Text style={{ fontWeight: "bold" }}>
                                {details?.productName}
                              </Text>
                            </td>
                            <td></td>
                            <td></td>
                            <td></td>
                            <td></td>
                            <td></td>
                          </tr>
                          {details?.govermentCode && (
                            <tr>
                              <td></td>
                              <td>Government fee</td>
                              <td>{details?.govermentCode}</td>
                              <td>{""}</td>
                              <td>{details?.govermentGst}</td>
                              <td>{""}</td>
                              <td>{details?.govermentFees}</td>
                            </tr>
                          )}
                          {details?.profesionalCode !== null && (
                            <tr>
                              <td></td>
                              <td>Professional fee</td>
                              <td>{details?.profesionalCode}</td>
                              <td>{""}</td>
                              <td>{details?.profesionalGst}</td>
                              <td>{""}</td>
                              <td>{details?.professionalFees}</td>
                            </tr>
                          )}
                          {details?.serviceCode !== null && (
                            <tr>
                              <td></td>
                              <td>Service fee</td>
                              <td>{details?.serviceCode}</td>
                              <td>{""}</td>
                              <td>{details?.serviceGst}</td>
                              <td>{""}</td>
                              <td>{details?.serviceCharge}</td>
                            </tr>
                          )}
                          {details?.otherCode !== null && (
                            <tr>
                              <td></td>
                              <td>Other fee</td>
                              <td>{details?.otherCode}</td>
                              <td>{""}</td>
                              <td>{details?.otherGst}</td>
                              <td>{""}</td>
                              <td>{details?.otherFees}</td>
                            </tr>
                          )}
                          <tr
                            style={{
                              borderTop: "1px solid black",
                              borderBottom: "1px solid black",
                            }}
                          >
                            <td></td>
                            <td>
                              <Text strong>Total Qty. : 1</Text>
                            </td>
                            <td>{""}</td>
                            <td>{""}</td>
                            <td>{""}</td>
                            <td>{""}</td>
                            <td>
                              <Text strong>{details?.totalAmount}</Text>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    )}

                    {details?.totalAmount > 0 && (
                      <Flex justify="flex-end" gap={4}>
                        <Text type="secondary">Total in words</Text>
                        <Text>:</Text>
                        <Text>{numWords(details?.totalAmount)}</Text>
                      </Flex>
                    )}
                    <Flex vertical>
                      <Text>Text details</Text>
                      {details?.Type === "Product" ? (
                        <table className="gst-table">
                          <thead>
                            <tr>
                              <th>HSN</th>
                              <th>SGST %</th>
                              <th>CGST %</th>
                              <th>IGST %</th>
                            </tr>
                          </thead>
                          <tbody>
                            {details?.gstCode !== null && (
                              <tr>
                                <td>{details?.gstCode}</td>
                                <td>0.0 %</td>
                                <td>0.0 %</td>
                                <td>{details?.gst}</td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      ) : (
                        <table className="gst-table">
                          <thead>
                            <tr>
                              <th>HSN</th>
                              <th>SGST %</th>
                              <th>CGST %</th>
                              <th>IGST %</th>
                            </tr>
                          </thead>
                          <tbody>
                            {details?.profesionalCode !== null && (
                              <tr>
                                <td>{details?.profesionalCode}</td>
                                <td>0.0 %</td>
                                <td>0.0 %</td>
                                <td>{details?.profesionalGst}</td>
                              </tr>
                            )}
                            {details?.serviceCode !== null && (
                              <tr>
                                <td>{details?.serviceCode}</td>
                                <td>0.0 %</td>
                                <td>0.0 %</td>
                                <td>{details?.serviceGst}</td>
                              </tr>
                            )}
                            {details?.govermentCode !== null && (
                              <tr>
                                <td>{details?.govermentCode}</td>
                                <td>0.0 %</td>
                                <td>0.0 %</td>
                                <td>{details?.govermentGst}</td>
                              </tr>
                            )}
                            {details?.otherCode !== null && (
                              <tr>
                                <td>{details?.otherCode}</td>
                                <td>0.0 %</td>
                                <td>0.0 %</td>
                                <td>{details?.otherGst}</td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      )}
                    </Flex>
                  </Flex>
                  <Flex vertical gap={8}>
                    <Flex vertical gap={6}>
                      <Text strong>Notes :</Text>
                      <Text type="secondary">
                        This Estimate & price quotation is valid for 7 calendar
                        days from the date of issue .
                      </Text>
                      <Text type="secondary">{details?.invoiceNote} </Text>
                      <Text type="secondary">
                        Remark : {details?.getRemarkForOperation}
                      </Text>
                    </Flex>
                    <Divider style={{ margin: "0px 0px" }} />
                    <Flex>
                      <Text type="secondary">
                        Note : Government fee and corpseed professional fee may
                        differ depending on any additional changes advised the
                        client in the application or any changesin government
                        policies.
                      </Text>
                    </Flex>
                  </Flex>
                </Flex>
              </Badge.Ribbon>
            </Flex>
          </Flex>
        </Flex>
      )}

      <Modal
        title="Update gst type"
        open={gstModal}
        onCancel={() => setGstModal(false)}
        onClose={() => setGstModal(false)}
        okText="Submit"
        onOk={() => gstForm.submit()}
      >
        <Form layout="vertical" form={gstForm} onFinish={handleGstUpdate}>
          <Form.Item
            label="Company structure"
            name="companyType"
            rules={[
              {
                required: true,
                message: "please select the company structure type",
              },
            ]}
          >
            <Select
              showSearch
              allowClear
              options={
                companyTypeList?.length > 0
                  ? companyTypeList?.map((item) => ({
                      label: item?.name,
                      value: item?.id,
                      ...item,
                    }))
                  : []
              }
              onChange={(e, x) => {
                dispatch(getAllGstTypeByCompanyTypeId(e));
                form.resetFields(["gstType", "businessType"]);
                setGstMand({ pan: false, gst: false });
              }}
            />
          </Form.Item>

          <Form.Item
            label="Gst type"
            name="gstType"
            rules={[{ required: true, message: "please select the gst type" }]}
          >
            <Select
              showSearch
              allowClear
              options={
                gstTypeList?.gstBussinessType?.length > 0
                  ? gstTypeList?.gstBussinessType?.map((item) => ({
                      label: item?.name,
                      value: item?.id,
                      ...item,
                    }))
                  : []
              }
              onChange={(e, x) => {
                dispatch(getBusinessTypeByGstTypeId(e));
              }}
            />
          </Form.Item>

          <Form.Item
            label="Business type"
            name="businessType"
            rules={[
              {
                required: true,
                message: "please select the business type",
              },
            ]}
          >
            <Select
              showSearch
              allowClear
              options={
                businessTypeList?.gstTypePrice?.length > 0
                  ? businessTypeList?.gstTypePrice?.map((item) => ({
                      label: item?.name,
                      value: item?.id,
                      ...item,
                    }))
                  : []
              }
              onChange={(e, x) => {
                setGstMand((prev) => ({
                  ...prev,
                  gst: x?.gstPresent,
                  pan: x?.panPresent,
                }));
                form.resetFields(["gstNo", "panNo"]);
              }}
            />
          </Form.Item>

          {gstMand?.gst && (
            <Form.Item
              label="Gst number"
              name="gstNo"
              rules={[
                {
                  required: true,
                  message: "please enter gst number",
                },
              ]}
            >
              <Input
                maxLength={15}
                onChange={(e) => {
                  const formatted = formatGSTInput(e.target.value);
                  form.setFieldsValue({ gstNo: formatted });
                }}
              />
            </Form.Item>
          )}

          {gstMand?.pan && (
            <Form.Item
              label="Pan number"
              name="panNo"
              rules={[
                { required: true, message: "please enter pan number" },
                {
                  validator: (_, value) =>
                    panRegex.test(value)
                      ? Promise.resolve()
                      : Promise.reject("Invalid PAN Number"),
                },
              ]}
            >
              <Input
                maxLength={10}
                onChange={(e) => {
                  const formatted = formatPANInput(e.target.value);
                  form.setFieldsValue({ panNo: formatted });
                }}
              />
            </Form.Item>
          )}
        </Form>
      </Modal>

      <Modal
        title="Update address"
        open={addressModal}
        onCancel={() => setAddressModal(false)}
        onClose={() => setAddressModal(false)}
        onOk={() => addressForm.submit()}
      >
        <Form
          layout="vertical"
          form={addressForm}
          onFinish={handleAddressFinish}
        >
          <div className="form-grid-col-2">
            <Form.Item
              label="Revenue"
              name="revenue"
              rules={[{ required: true, message: "please enter revenue" }]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              label="Primary address"
              name="address"
              rules={[{ required: true, message: "please enter the address" }]}
            >
              <Input.TextArea />
            </Form.Item>

            <Form.Item
              label="Country"
              name="country"
              rules={[{ required: true, message: "please select the country" }]}
            >
              <Select
                showSearch
                options={
                  countryList?.length > 0
                    ? countryList?.map((item) => ({
                        label: item?.name,
                        value: item?.name,
                        id: item?.id,
                      }))
                    : []
                }
                onChange={(e, x) => {
                  dispatch(getAllStatesByCountryId(x?.id));
                  addressForm.resetFields(["state", "city"]);
                }}
                filterOption={(input, option) =>
                  option.label.toLowerCase().includes(input.toLowerCase())
                }
              />
            </Form.Item>

            <Form.Item
              label="State"
              name="state"
              rules={[{ required: true, message: "Please select the state" }]}
            >
              <Select
                showSearch
                options={statesList?.map((item) => ({
                  label: item.name,
                  value: item.name,
                  gstCode: item.gstCode,
                  stateName: item.name,
                  id: item?.id,
                }))}
                filterOption={(input, option) =>
                  option.label.toLowerCase().includes(input.toLowerCase())
                }
                onChange={(e, option) => {
                  dispatch(getAllCitiesByStateId(option?.id));
                }}
              />
            </Form.Item>

            <Form.Item
              label="City"
              name="city"
              rules={[{ required: true, message: "please enter the city" }]}
            >
              <Select
                showSearch
                options={
                  citiesList?.length > 0
                    ? citiesList?.map((item) => ({
                        label: item?.name,
                        value: item?.name,
                      }))
                    : []
                }
                filterOption={(input, option) =>
                  option.label.toLowerCase().includes(input.toLowerCase())
                }
              />
            </Form.Item>

            <Form.Item
              label="Pin code"
              name="pinCode"
              rules={[{ required: true, message: "please enter pincode" }]}
            >
              <Input />
            </Form.Item>
          </div>
        </Form>
      </Modal>
    </Spin>
  );
};

export default LeadEstimate;
