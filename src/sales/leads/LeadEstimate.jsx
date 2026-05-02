import {
  addToast,
  Autocomplete,
  AutocompleteItem,
  Button,
  Card,
  CardBody,
  CardHeader,
  DatePicker,
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  getKeyValue,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Select,
  SelectItem,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
  useDisclosure,
} from "@heroui/react";
import { useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  getAllCompanyType,
  getAllCompanyUnits,
  getAllContactListByCompanyId,
  getAllGstTypeByCompanyTypeId,
  getBusinessTypeByGstTypeId,
  searchCompaniesForCompany,
  updateCompanyAddress,
} from "../../toolkit/slices/companySlice";
import { useParams } from "react-router-dom";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import NewSelect from "../../components/NewSelect";
import { TagsInput } from "../proposal/Proposal";
import SingleFileUploader from "../../components/SingleFileUploader";
import {
  getAllBusinessArrangementBySolutionId,
  getAllProductCategoryById,
  getAllProductSubCategoryListByCategoryId,
  getProductListByLeadName,
} from "../../toolkit/slices/productSlice";
import { IndianRupee, Pencil, Percent } from "lucide-react";
import {
  addDocumentsInEstimate,
  checkPlantSetUpData,
  createEstimate,
  createEstimateForApprovals,
  docsUploadListInEstimate,
  editEstimateForApprovals,
  editLeadEstimate,
  getAllChildLeads,
  getAllLeadUser,
  getChildLeadEstimateFlagByParentLeadId,
  getEstimateByLeadId,
  getSingleLeadDataByLeadId,
  updateGstTypeInEstimate,
} from "../../toolkit/slices/leadSlice";
import {
  getLocalTimeZone,
  parseDate,
  toCalendarDate,
  today,
} from "@internationalized/date";
import {
  getAllCitiesByStateId,
  getAllCitiesByStateName,
  getAllCountries,
  getAllSecondaryCitiesBySecondaryStateName,
  getAllSecondaryStatesBySecondaryCountryName,
  getAllStatesByCountryId,
  getAllStatesByCountryName,
} from "../../toolkit/slices/commonSlice";
import dayjs from "dayjs";
import EstimateView from "../../components/EstimateView";
import { formatGSTInput, formatPANInput } from "../../common";
import { useMediaQuery } from "react-responsive";
import FileUploader from "../../components/FileUploader";

function formCondition(data) {
  let result = {
    professional: false,
    service: false,
    government: false,
    other: false,
  };
  data?.productAmount?.forEach((item) => {
    if (item?.name === "Professional fees") {
      result["professional"] = true;
    }
    if (item?.name === "Service charges") {
      result["service"] = true;
    }
    if (item?.name === "Government") {
      result["government"] = true;
    }
    if (item?.name === "Other fees") {
      result["other"] = true;
    }
  });
  return result;
}

const formSchema = ({
  productData,
  productSubCategoryData,
  gstMand,
  adminRole,
}) => {
  return z.object({
    performaInvoice: z.boolean(),
    unitId: z.string().min(1, "Please select the company unit."),
    companyType: z.string().min(1, "Please select the company type."),
    gstType: z.string().min(1, "Please select the gst type."),
    businessType: z.string().min(1, "Please select the gst type."),
    ...(gstMand?.gst
      ? {
          gstNo: z.string().min(15, "please enter GST number."),
        }
      : {}),
    ...(gstMand?.pan
      ? {
          panNo: z.string().min(10, "please enter pan number."),
        }
      : {}),
    gstDocuments: z.string().optional(),
    cc: z.array(z.string()).optional(),
    primaryContact: z.string().min(1, "Please select the contact."),
    secondaryContact: z.string().min(1, "Please select the contact."),
    ...(productData?.type === "Product"
      ? {
          businessArrangmentId: z
            .string()
            .min(1, "Please select business arrangement."),
          productCategoryId: z
            .string()
            .min(1, "Please select the product category."),
          productSubCategoryId: z
            .string()
            .min(1, "Please select the product sub category."),
          ...(Object.keys(productSubCategoryData || {})?.length > 0
            ? {
                actualPrice: z.string().min(1, "Please enter actual price."),
                gstCode: z.string().min(1, "Please enter gst code."),
                gst: z.string().min(1, "Please enter gst percentage."),
                quantity: z.string().min(1, "Please enter quantity."),
                totalPrice: z.string().min(1, "Please enter total price."),
              }
            : {}),
        }
      : {
          ...(formCondition(productData).professional
            ? {
                professionalFees: z.number(),
                professionalCode: z
                  .string()
                  .min(1, "Please enter professional code."),
                profesionalGst: z.number(),
              }
            : {}),
          ...(formCondition(productData).service
            ? {
                serviceCharge: z.number(),
                serviceCode: z.string().min(1, "Please enter service code."),
                serviceGst: z.number(),
              }
            : {}),
          ...(formCondition(productData).government
            ? {
                govermentfees: z.number(),
                govermentCode: z
                  .string()
                  .min(1, "Please enter government code."),
                govermentGst: z.number(),
              }
            : {}),
          ...(formCondition(productData).other
            ? {
                otherFees: z.number(),
                otherCode: z.string().min(1, "Please enter other code."),
                otherGst: z.number(),
              }
            : {}),
        }),
    ...(adminRole
      ? {
          assigneeId: z.string().min(1, "Please select assignee id."),
        }
      : {}),
    orderNumber: z.string().min(1, "Please enter Order number."),
    purchaseDate: z.string().min(1, "Please select purchase date."),
    invoiceNote: z.string().min(1, "Please write invoice note."),
    remarksForOption: z.string().min(1, "Please enter remark."),
    address: z.string().min(1, "Please enter address."),
    country: z.string().min(1, "Please select country."),
    state: z.string().min(1, "Please select state."),
    city: z.string().min(1, "Please select city."),
    primaryPinCode: z.string().min(1, "Please enter primary pincode."),
    secondaryAddress: z.string().optional(),
    secondaryCountry: z.string().optional(),
    secondaryState: z.string().optional(),
    secondaryCity: z.string().optional(),
    secondaryPinCode: z.string().optional(),
  });
};

const defaultValues = {
  performaInvoice: false,
  unitId: null,
  companyType: null,
  gstType: null,
  businessType: null,
  gstNo: "",
  panNo: "",
  gstDocuments: "",
  cc: [],
  primaryContact: null,
  secondaryContact: null,
  businessArrangmentId: null,
  productCategoryId: null,
  productSubCategoryId: null,
  actualPrice: "",
  gstCode: "",
  gst: "",
  quantity: "",
  totalPrice: "",
  professionalFees: "",
  professionalCode: "",
  profesionalGst: "",
  serviceCharge: "",
  serviceCode: "",
  serviceGst: "",
  govermentfees: "",
  govermentCode: "",
  govermentGst: "",
  otherFees: "",
  otherCode: "",
  otherGst: "",
  assigneeId: null,
  orderNumber: "",
  purchaseDate: "",
  invoiceNote: "",
  remarksForOption: "",
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

const addressFormSchema = z.object({
  revenue: z.string().min(1, "please enter revenue"),
  address: z.string().min(1, "please enter address."),
  country: z.string().min(1, "please select country."),
  state: z.string().min(1, "please select state."),
  city: z.string().min(1, "please select city."),
  pinCode: z.string().min(1, "please enter pinCode."),
});

const addressFormDefaultValues = {
  revenue: "",
  address: "",
  country: "",
  state: "",
  city: "",
  pinCode: "",
};

const gstFormSchema = (updateGstMand) =>
  z.object({
    companyType: z.string().min(1, "please select company type"),
    gstType: z.string().min(1, "please select gst type"),
    businessType: z.string().min(1, "please select business type"),
    ...(updateGstMand?.gst
      ? {
          gstNo: z.string().min(1, "please enter gst number"),
        }
      : {}),
    ...(updateGstMand?.pan
      ? {
          panNo: z.string().min(1, "please enter pan number"),
        }
      : {}),
  });

const gstFormDefaultValues = {
  companyType: "",
  gstType: "",
  businessType: "",
  gstNo: "",
  panNo: "",
};

const LeadEstimate = () => {
  const dispatch = useDispatch();
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const { userId, leadId } = useParams();
  const addressFormModal = useDisclosure();
  const gstFormModal = useDisclosure();
  const searchCompaniesList = useSelector(
    (state) => state.company.seachCompniesList,
  );
  const allCompanyUnits = useSelector((state) => state.company.allCompanyUnits);
  const contactListByCompanyId = useSelector(
    (state) => state.company.contactListByCompanyId,
  );
  const details = useSelector((state) => state.leads.estimateDetail);
  const plantSetupData = useSelector((state) => state.leads.plantSetupDetail);
  const childLeadEstimateFlag = useSelector(
    (state) => state.leads.childLeadFlag,
  );
  const childLeads = useSelector((state) => state.leads.allChildLeadList);
  const companyDetails = useSelector(
    (state) => state?.leads?.companyDetailsById,
  );
  const companyTypeList = useSelector((state) => state.company.companyTypeList);
  const gstTypeList = useSelector((state) => state.company.gstTypeList);
  const businessTypeList = useSelector(
    (state) => state.company.businessTypeList,
  );
  const productCategoryList = useSelector(
    (state) => state.product.productCategoryList,
  );
  const productSubcategoryList = useSelector(
    (state) => state.product.productSubcategoryList,
  );
  const businessArrangementList = useSelector(
    (state) => state?.product?.businessArrangementList,
  );
  const productData = useSelector(
    (state) => state.product.productDataByLeadName,
  );
  const leadUsersList = useSelector((state) => state.leads.leadUsersList);
  const docsListInEstimate = useSelector(
    (state) => state.leads.docsListInEstimate,
  );
  const countryList = useSelector((state) => state.common.countriesList);
  const statesList = useSelector((state) => state.common.statesList);
  const citiesList = useSelector((state) => state.common.citiesList);
  const secStatesList = useSelector((state) => state.common.secondaryStateList);
  const secCitiesList = useSelector(
    (state) => state.common.secondaryCitiesList,
  );
  const userRole = useSelector((state) => state.auth.currentUser?.roles);
  const adminRole = userRole.includes("ADMIN");
  const [seachFields, setSearchFields] = useState({
    searchText: "",
    userId: userId,
    searchField: "searchNameAndGSt",
  });
  const [companyAndUnitData, setCompanyAndUnitData] = useState({
    companyId: null,
    companyName: "",
    unitId: null,
    unitName: "",
  });
  const [editEstimate, setEditEstimate] = useState(false);
  const [discountError, setDiscountError] = useState("");
  const [productSubCategoryData, setProductSubCategoryData] = useState(null);
  const [productSubCategoryFees, setProductSubCategoryFees] = useState({
    actualPrice: 0,
    gst: 0,
    roundOff: false,
  });
  const [gstMand, setGstMand] = useState({ gst: false, pan: false });
  const [updateGstMand, setUpdateGstMand] = useState({
    gst: false,
    pan: false,
  });
  const [discount, setDiscount] = useState(false);
  const [panError, setPanError] = useState("");
  const [gstError, setGstError] = useState("");
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

  const isMedium = useMediaQuery({ minWidth: 768, maxWidth: 1535 });
  const isLarge = useMediaQuery({ minWidth: 1536 });

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
    reset,
    getValues,
  } = useForm({
    resolver: zodResolver(
      formSchema({ productData, productSubCategoryData, gstMand, adminRole }),
    ),
    defaultValues,
  });

  const state = watch("state");
  const gstNo = watch("gstNo");

  const gstForm = useForm({
    resolver: zodResolver(gstFormSchema(updateGstMand)),
    defaultValues: gstFormDefaultValues,
  });

  const addressForm = useForm({
    resolver: zodResolver(addressFormSchema),
    defaultValues: addressFormDefaultValues,
  });

  useEffect(() => {
    dispatch(getSingleLeadDataByLeadId({ leadId, userId })).then((resp) => {
      if (resp.meta.requestStatus === "fulfilled") {
        if (resp?.payload?.originalName) {
          dispatch(checkPlantSetUpData(resp?.payload?.originalName)).then(
            (res) => {
              if (res.meta.requestStatus === "fulfilled") {
                if (res.payload) {
                  dispatch(getAllChildLeads(resp?.payload?.leadId));
                } else {
                  dispatch(
                    getProductListByLeadName(resp?.payload?.originalName),
                  );
                }
              }
            },
          );
        }
      }
    });
  }, [dispatch]);

  useEffect(() => {
    dispatch(getAllLeadUser(userId));
    dispatch(getAllCountries());
    dispatch(getAllCompanyType());
  }, [dispatch]);

  useEffect(() => {
    const handler = setTimeout(() => {
      if (seachFields.searchText) {
        dispatch(searchCompaniesForCompany(seachFields));
      }
    }, 500);

    return () => {
      clearTimeout(handler);
    };
  }, [seachFields.searchText, dispatch]);

  useEffect(() => {
    if (productData?.id) {
      dispatch(getAllBusinessArrangementBySolutionId(productData?.id));
    }
  }, [dispatch, productData]);

  useEffect(() => {
    if (plantSetupData) {
      dispatch(getChildLeadEstimateFlagByParentLeadId(leadId));
    } else {
      dispatch(getEstimateByLeadId(leadId));
    }
  }, [dispatch, plantSetupData]);

  useEffect(() => {
    if (details?.discountEstimate) {
      setDiscount(true);
    }
  }, [details]);

  useEffect(() => {
    let values = getValues();
    if (Object.keys(companyDetails || {}) > 0) {
      reset({
        ...values,
        companyId: companyDetails?.name,
        isUnit: companyDetails?.isUnit,
        isConsultant: companyDetails?.isConsultant,
      });
    }
  }, [companyDetails]);

  useEffect(() => {
    if (!productData?.productAmount) return;

    const values = getValues();
    let updatedValues = { ...values };
    let updatedProductFees = {};

    productData.productAmount.forEach((item) => {
      if (item?.name === "Government") {
        updatedValues = {
          ...updatedValues,
          govermentfees: Number(item?.fees),
          govermentCode: item?.hsnNo,
          govermentGst: Number(item?.taxAmount),
        };
        updatedProductFees = {
          ...updatedProductFees,
          govermentfees: item?.fees,
          govermentGst: item?.taxAmount,
        };
      }

      if (item?.name === "Professional fees") {
        updatedValues = {
          ...updatedValues,
          professionalFees: Number(item?.fees),
          professionalCode: item?.hsnNo,
          profesionalGst: Number(item?.taxAmount),
        };
        updatedProductFees = {
          ...updatedProductFees,
          professionalFees: item?.fees,
          profesionalGst: item?.taxAmount,
        };
      }

      if (item?.name === "Service charges") {
        updatedValues = {
          ...updatedValues,
          serviceCharge: Number(item?.fees),
          serviceCode: item?.hsnNo,
          serviceGst: Number(item?.taxAmount),
        };
        updatedProductFees = {
          ...updatedProductFees,
          serviceCharge: item?.fees,
          serviceGst: item?.taxAmount,
        };
      }

      if (item?.name === "Other fees") {
        updatedValues = {
          ...updatedValues,
          otherFees: Number(item?.fees),
          otherCode: item?.hsnNo,
          otherGst: Number(item?.taxAmount),
        };
        updatedProductFees = {
          ...updatedProductFees,
          otherFees: item?.fees,
          otherGst: item?.taxAmount,
        };
      }
    });
    reset(updatedValues);
    setProductFees((prev) => ({
      ...prev,
      ...updatedProductFees,
    }));
  }, [productData, reset, getValues]);

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
    dispatch(getAllContactListByCompanyId(details?.companyId));
    dispatch(getAllStatesByCountryId(details?.primaryCountry?.id));
    dispatch(getAllCitiesByStateId(details?.primaryState?.id));
    dispatch(getAllProductCategoryById(details?.businessArrangmentId));
    dispatch(
      getAllProductSubCategoryListByCategoryId(details?.productCategoryId),
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
    reset({
      admin: String(details?.primaryContact?.id),
      cc: details?.ccMail,
      companyId: String(details?.companyId),
      companyName: details?.companyName,
      isUnit: details?.isUnit,
      unitId: String(details?.unitId),
      unitName: details?.unitName,
      panNo: details?.panNo,
      gstType: String(details?.gstType),
      companyType: String(details?.companyType),
      businessType: String(details?.bussinessType),
      companyAge: details?.companyAge,
      performaInvoice: details?.performaInvoice,
      gstNo: details?.gstNo,
      gstDocuments: details?.gstDocuments,
      businessArrangmentId: String(details?.businessArrangmentId),
      productCategoryId: String(details?.productCategoryId),
      productSubCategoryId: String(details?.productSubCategoryId),
      actualPrice: String(details?.actualPrice),
      gstCode: details?.gstCode,
      gst: details?.gst,
      quantity: details?.quantity,
      totalPrice: String(details?.totalPrice),
      salesType: details?.salesType,
      secondaryContact: String(details?.secondaryContact?.id),
      primaryContact: String(details?.primaryContact?.id),
      productId: String(details?.product?.id),
      professionalFees: Number(details?.professionalFees),
      professionalCode: details?.professionalCode,
      profesionalGst: Number(details?.profesionalGst),
      serviceCharge: Number(details?.serviceCharge),
      serviceCode: details?.serviceCode,
      serviceGst: Number(details?.serviceGst),
      govermentfees: Number(details?.govermentfees),
      govermentCode: details?.govermentCode,
      govermentGst: Number(details?.govermentGst),
      otherFees: Number(details?.otherFees),
      otherCode: details?.otherCode,
      otherGst: Number(details?.otherGst),
      assigneeId: String(details?.assigneeId?.id),
      orderNumber: details?.orderNumber,
      purchaseDate: dayjs(details?.purchaseDate).format("YYYY-MM-DD"),
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

    gstForm.reset({
      companyType: String(details?.companyType),
      gstType: String(details?.gstType),
      businessType: String(details?.businessType),
      gstNo: details?.gstNo,
      panNo: details?.panNo,
    });

    addressForm.reset({
      address: details?.address,
      city: details?.city,
      state: details?.state,
      country: details?.country,
      primaryPinCode: details?.primaryPinCode,
    });

    setEditEstimate((prev) => !prev);
  }, [details, addressForm, gstForm]);

  const validateGreaterThanOrEqual = (value, minValue, discount) => {
    if (discount) {
      setDiscountError("");
    }
    if (!value || parseFloat(value) >= parseFloat(minValue)) {
      setDiscountError("");
    }
    setDiscountError(`Value should be greater than or equal to ${minValue}`);
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

  const handleUpdatePanChange = (e) => {
    const rawValue = e.target.value;
    const formattedValue = formatPANInput(rawValue);
    gstForm.setValue("panNo", formattedValue);
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

  const handleUpdateGstChange = (e) => {
    const rawValue = e.target.value;
    const formattedValue = formatGSTInput(rawValue);
    gstForm.setValue("gstNo", formattedValue);
  };

  const handleStateChange = (stateName) => {
    setValue("state", stateName);
    dispatch(getAllCitiesByStateName(stateName));
    const error = validateGST(gstNo, stateName);
    setGstError(error);
  };

  const handleGstUpdate = (values) => {
    values.companyId = companyAndUnitData?.companyId;
    dispatch(updateGstTypeInEstimate(values))
      .then((resp) => {
        if (resp.meta.requestStatus === "fulfilled") {
          const compData = resp?.payload;
          dispatch(getAllGstTypeByCompanyTypeId(compData?.companyGstType?.id));
          dispatch(getBusinessTypeByGstTypeId(compData?.gstType?.id));
          reset({
            companyType: compData?.companyGstType?.id,
            businessType: compData?.BussiessType?.id,
            gstType: compData?.gstType?.id,
            gstNo: compData?.gstNo,
            panNo: compData?.panNo,
          });
          addToast({ title: "Gst updated successfully !.", color: "success" });
          gstFormModal.onClose();
          gstForm.reset(gstFormDefaultValues);
        } else {
          addToast({ title: "Something went wrong !.", color: "danger" });
        }
      })
      .catch(() =>
        addToast({ title: "Something went wrong !.", color: "danger" }),
      );
  };

  const handleAddressFinish = (values) => {
    values.companyId = companyAndUnitData?.companyId;
    dispatch(updateCompanyAddress(values))
      .then((resp) => {
        if (resp.meta.requestStatus === "fulfilled") {
          const compUnit = resp.payload;
          reset({
            gstType: compUnit?.gstType,
            gstNo: compUnit?.gstNo,
            companyType: compUnit?.companyType,
            businessType: compUnit?.bussinessType,
            companyAge: compUnit?.companyAge,
            address: compUnit?.address,
            city: compUnit?.city,
            country: compUnit?.country,
            state: compUnit?.state,
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
          reset({
            companyType: String(compUnit?.companyType),
            gstType: String(compUnit?.gstType),
            businessType: String(compUnit?.bussinessType),
            gstNo: compUnit?.gstNo,
            panNo: compUnit?.panNo,
          });
          reset({
            address: compUnit?.address,
            city: compUnit?.city,
            state: compUnit?.state,
            country: compUnit?.country,
            pinCode: compUnit?.primaryPinCode,
          });
          addToast({
            title: "Address updated successfully !.",
            color: "success",
          });
          addressFormModal.onOpenChange(false);
        } else {
          addToast({ title: "Something went wrong !.", color: "danger" });
        }
      })
      .catch(() =>
        addToast({ message: "Something went wrong !.", color: "danger" }),
      );
  };

  const handleFinish = useCallback(
    (values) => {
      if (!plantSetupData) {
        values.leadId = leadId;
      }
      values.unitCompany = false;
      values.productId = productData?.id;
      values.companyId = companyAndUnitData?.companyId;
      values.companyName = companyAndUnitData?.companyName;
      values.unitName = companyAndUnitData?.unitName;
      values.type = productData?.type;
      values.productType = productData?.type;
      values.currentUserId = userId;
      if (!adminRole) {
        values.assigneeId = userId;
      }
      if (discount) {
        if (details?.discountEstimate) {
          values.estimateId = details?.id;
          dispatch(editEstimateForApprovals(values))
            .then((resp) => {
              if (resp.meta.requestStatus === "fulfilled") {
                addToast({
                  title: "Discounted estimate edited successfully !.",
                  color: "success",
                });
                dispatch(getEstimateByLeadId(leadId));
                reset(defaultValues);
                setCompanyAndUnitData({
                  companyId: null,
                  companyName: "",
                  unitId: null,
                  unitName: "",
                });
              } else {
                addToast({ title: "Something went wrong !.", color: "danger" });
              }
            })
            .catch(() =>
              addToast({ title: "Something went wrong !.", color: "danger" }),
            );
        } else {
          dispatch(createEstimateForApprovals(values))
            .then((resp) => {
              if (resp.meta.requestStatus === "fulfilled") {
                addToast({
                  title: "Discounted estimate created successfully !.",
                  color: "success",
                });
                dispatch(getEstimateByLeadId(leadId));
                reset(defaultValues);
                setCompanyAndUnitData({
                  companyId: null,
                  companyName: "",
                  unitId: null,
                  unitName: "",
                });
              } else {
                addToast({ title: "Something went wrong !.", color: "danger" });
              }
            })
            .catch(() =>
              addToast({ title: "Something went wrong !.", color: "danger" }),
            );
        }
      } else {
        if (editEstimate) {
          values.id = details?.id;
          dispatch(editLeadEstimate(values))
            .then((resp) => {
              if (resp.meta.requestStatus === "fulfilled") {
                addToast({
                  title: "Estimate updated successfully !.",
                  color: "success",
                });
                reset(defaultValues);
                dispatch(getEstimateByLeadId(leadId));
                setCompanyAndUnitData({
                  companyId: null,
                  companyName: "",
                  unitId: null,
                  unitName: "",
                });
              } else {
                addToast({ title: "Something went wrong !.", color: "danger" });
              }
            })
            .catch(() =>
              addToast({ title: "Something went wrong !.", color: "danger" }),
            );
        } else {
          dispatch(createEstimate(values))
            .then((resp) => {
              if (resp.meta.requestStatus === "fulfilled") {
                addToast({
                  title: "Estimate created successfully !.",
                  color: "success",
                });
                reset(defaultValues);
                dispatch(getEstimateByLeadId(leadId));
                setCompanyAndUnitData({
                  companyId: null,
                  companyName: "",
                  unitId: null,
                  unitName: "",
                });
              } else {
                addToast({ title: "Something went wrong !.", color: "danger" });
              }
            })
            .catch(() =>
              addToast({ title: "Something went wrong !.", color: "danger" }),
            );
        }
      }
    },
    [
      leadId,
      details,
      editEstimate,
      productData,
      dispatch,
      companyAndUnitData,
      discount,
      plantSetupData,
    ],
  );

  useEffect(() => {
    if (details?.id) {
      dispatch(docsUploadListInEstimate(details?.id));
    }
  }, [details]);

  const uploadDocs = (fileData) => {
    dispatch(addDocumentsInEstimate(fileData))
      .then((resp) => {
        if (resp.meta.requestStatus === "fulfilled") {
          addToast({
            title: "Document uploaded successfully !.",
            color: "success",
          });
          dispatch(docsUploadListInEstimate(details?.id));
        } else {
          addToast({ title: "Something went wrong !.", color: "danger" });
        }
      })
      .catch(() =>
        addToast({ title: "Something went wrong !.", color: "danger" }),
      );
  };

  const renderDoucmentData = useCallback((rowData, columnKey) => {
    const cellValue = rowData[columnKey];
    switch (columnKey) {
      case "docs":
        return (
          <div className="flex flex-col">
            <FileUploader
              value={rowData?.documents}
              onChange={(file) =>
                uploadDocs({ id: rowData?.id, documents: file })
              }
            />
          </div>
        );
      default:
        return cellValue;
    }
  }, []);

  return (
    <>
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-semibold">
          {Object.keys(details)?.length > 0 && !editEstimate
            ? `${
                details?.performaInvoice
                  ? "Proforma Invoice details"
                  : "Estimate details"
              }`
            : editEstimate
              ? "Edit estimate"
              : "Create estimate"}
        </h1>

        {Object.keys(details)?.length > 0 && (
          <div className="flex gap-1.5">
            <Button onPress={onOpen}>Upload document</Button>
            <Button onPress={handleEditEstimate}>
              {editEstimate ? "Show estimate" : "Edit"}
            </Button>
          </div>
        )}
      </div>
      {Object.keys(details)?.length === 0 ||
      editEstimate ||
      !childLeadEstimateFlag ? (
        <div>
          <div className="flex items-center w-full my-2">
            <Select
              size={isMedium ? "md" : "lg"}
              className="w-[15%]"
              selectedKeys={[seachFields?.searchField]}
              items={[
                { label: "GST", value: "gstNumber" },
                { label: "Name", value: "searchNameAndGSt" },
                { label: "Contact no.", value: "contactNumber" },
                { label: "Email", value: "contactEmail" },
              ]}
              onSelectionChange={(e) => {
                let key = Array.from(e);
                setSearchFields((prev) => ({ ...prev, searchField: key }));
              }}
            >
              {(item) => (
                <SelectItem key={item?.value}>{item?.label}</SelectItem>
              )}
            </Select>
            <Autocomplete
              size={isMedium ? "md" : "lg"}
              className="max-w-[80%]"
              classNames={{ base: "rounded-tr-none rounded-br-none" }}
              items={searchCompaniesList || []}
              placeholder="Search companies"
              onInputChange={(e) =>
                setSearchFields((prev) => ({ ...prev, searchText: e }))
              }
              onSelectionChange={(e) => {
                dispatch(getAllCompanyUnits(e));
                dispatch(getAllContactListByCompanyId(e));
              }}
            >
              {(item) => (
                <AutocompleteItem
                  key={item.companyId}
                  onPress={() => {
                    setCompanyAndUnitData((prev) => ({
                      ...prev,
                      companyName: item?.companyName,
                      companyId: item?.companyId,
                    }));
                  }}
                >
                  {item.companyName}
                </AutocompleteItem>
              )}
            </Autocomplete>
          </div>
          <form
            className="overflow-auto px-4 py-2 max-h-[62vh] md:max-h-[65vh]"
            onSubmit={handleSubmit(handleFinish)}
          >
            <div className="px-2 py-2 my-2">
              <Controller
                name="performaInvoice"
                control={control}
                render={({ field, fieldState: { error } }) => {
                  return (
                    <Switch
                      size={isMedium ? "sm" : "md"}
                      isSelected={field.value}
                      onValueChange={(e) => {
                        field.onChange(e);
                      }}
                    >
                      Performa invoice
                    </Switch>
                  );
                }}
              />
            </div>
            <Card className="my-2">
              <CardHeader className="flex justify-between font-medium">
                Company info
                {!companyAndUnitData?.oneTimeUpdateGst && (
                  <Button
                    variant="flat"
                    color="primary"
                    size={isMedium ? "sm" : "md"}
                    onPress={gstFormModal.onOpen}
                    endContent={<Pencil className="w-4 h-4" />}
                  >
                    Update gst
                  </Button>
                )}
              </CardHeader>

              <CardBody className="grid grid-cols-3 gap-2">
                {plantSetupData && (
                  <Controller
                    name="leadId"
                    control={control}
                    render={({ field, fieldState: { error } }) => {
                      return (
                        <NewSelect
                          data={childLeads}
                          labelKey={"childLeadName"}
                          valueKey={"childId"}
                          label={"Select child lead"}
                          value={field.value}
                          onItemSelect={(item) => {
                            dispatch(
                              getProductListByLeadName(item?.childLeadName),
                            );
                          }}
                          onChange={(e) => {
                            field.onChange(e);
                          }}
                        />
                      );
                    }}
                  />
                )}
                <Controller
                  name="unitId"
                  control={control}
                  render={({ field, fieldState: { error } }) => {
                    return (
                      <NewSelect
                        isRequired
                        size={isMedium ? "sm" : "md"}
                        data={allCompanyUnits || []}
                        errorMessage="please select company unit"
                        label={"Select company unit "}
                        value={String(field?.value)}
                        labelKey={"companyName"}
                        valueKey={"id"}
                        onChange={(e) => field.onChange(e)}
                        onItemSelect={(compUnit) => {
                          setCompanyAndUnitData((prev) => ({
                            ...prev,
                            unitName: compUnit?.companyName,
                            unitId: compUnit?.id,
                            oneTimeUpdateGst: compUnit?.oneTimeUpdateGst,
                            oneTimeUpdateAddress:
                              compUnit?.oneTimeUpdateAddress,
                          }));
                          dispatch(
                            getAllGstTypeByCompanyTypeId(compUnit?.companyType),
                          );
                          dispatch(
                            getBusinessTypeByGstTypeId(compUnit?.gstType),
                          );
                          setGstMand((prev) => ({
                            ...prev,
                            gst: compUnit?.gstPresent,
                            pan: compUnit?.panPresent,
                          }));
                          setUpdateGstMand((prev) => ({
                            ...prev,
                            gst: compUnit?.gstPresent,
                            pan: compUnit?.panPresent,
                          }));
                          dispatch(
                            getAllStatesByCountryName(compUnit?.country),
                          );
                          dispatch(getAllCitiesByStateName(compUnit?.state));
                          if (compUnit?.seCountry) {
                            dispatch(
                              getAllSecondaryStatesBySecondaryCountryName(
                                compUnit?.seCountry,
                              ),
                            );
                          }
                          if (compUnit?.secState) {
                            dispatch(
                              getAllSecondaryCitiesBySecondaryStateName(
                                compUnit?.secState,
                              ),
                            );
                          }
                          const formValues = getValues();
                          let updatedValues = { ...formValues };
                          updatedValues = {
                            ...updatedValues,
                            unitId: String(compUnit?.id),
                            gstType: String(compUnit?.gstType),
                            gstNo: compUnit?.gstNo,
                            companyType: String(compUnit?.companyType),
                            businessType: String(compUnit?.bussinessType),
                            address: compUnit?.address,
                            city: compUnit?.city,
                            country: compUnit?.country,
                            state: compUnit?.state,
                            panNo: compUnit?.panNo,
                            primaryContact: String(
                              compUnit?.primaryContact?.id,
                            ),
                            secondaryContact: String(
                              compUnit?.secondaryContact?.id,
                            ),
                            assigneeId: String(compUnit?.assignee?.id),
                            primaryPinCode: compUnit?.pinCode,
                            secondaryAddress: compUnit?.sAddress,
                            secondaryCity: compUnit?.secCity,
                            secondaryState: compUnit?.secState,
                            secondaryCountry: compUnit?.seCountry,
                            secondaryPinCode: compUnit?.secondaryPinCode,
                          };
                          reset(updatedValues);
                          gstForm.reset({
                            companyType: String(compUnit?.companyType),
                            gstType: String(compUnit?.gstType),
                            businessType: String(compUnit?.bussinessType),
                            gstNo: compUnit?.gstNo,
                            panNo: compUnit?.panNo,
                          });
                          addressForm.reset({
                            revenue: compUnit?.revenue,
                            address: compUnit?.address,
                            city: compUnit?.city,
                            state: compUnit?.state,
                            country: compUnit?.country,
                            pinCode: compUnit?.pinCode,
                          });
                        }}
                      />
                    );
                  }}
                />

                <Controller
                  name="companyType"
                  control={control}
                  render={({ field, fieldState: { error } }) => (
                    <NewSelect
                      isRequired
                      isDisabled
                      size={isMedium ? "sm" : "md"}
                      label="Company structure"
                      errorMessage={"please select the company type."}
                      data={companyTypeList || []}
                      labelKey="name"
                      valueKey="id"
                      value={String(field.value)}
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
                      size={isMedium ? "sm" : "md"}
                      isRequired
                      isDisabled
                      label="GST type"
                      errorMessage={error?.message}
                      isInvalid={!!error}
                      data={gstTypeList?.gstBussinessType || []}
                      labelKey="name"
                      valueKey="id"
                      value={String(field.value)}
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
                      size={isMedium ? "sm" : "md"}
                      isRequired
                      isDisabled
                      label="Business type"
                      errorMessage={error?.message}
                      isInvalid={!!error}
                      data={businessTypeList?.gstTypePrice || []}
                      labelKey="name"
                      valueKey="id"
                      value={String(field.value)}
                      onChange={(value) => {
                        field.onChange(value);
                        const foundObject =
                          businessTypeList?.gstTypePrice?.find(
                            (item) => item.id == value,
                          );
                        setGstMand((prev) => ({
                          ...prev,
                          gst: foundObject?.gstPresent,
                          pan: foundObject?.panPresent,
                        }));
                      }}
                    />
                  )}
                />
                {gstMand?.gst && (
                  <Controller
                    name="gstNo"
                    control={control}
                    render={({ field, fieldState: { error } }) => (
                      <Input
                        size={isMedium ? "sm" : "md"}
                        isRequired
                        label="GST number"
                        isDisabled
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
                {gstMand?.pan && (
                  <Controller
                    name="panNo"
                    control={control}
                    render={({ field, fieldState: { error } }) => (
                      <Input
                        size={isMedium ? "sm" : "md"}
                        isRequired
                        label="Pan number"
                        isDisabled
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

                <div className="flex flex-col gap-1">
                  {/* <label className="font-medium">Cc</label> */}
                  <Controller
                    name="cc"
                    control={control}
                    render={({ field, fieldState: { error } }) => (
                      <>
                        <TagsInput
                          placeholder="CC"
                          className="rounded-lg min-h-[50px]"
                          value={field.value}
                          onChange={(e) => field.onChange(e)}
                        />
                        {error && (
                          <span className="text-red-500 text-sm">
                            {error.message ||
                              error.root?.message ||
                              "Invalid input"}
                          </span>
                        )}
                      </>
                    )}
                  />
                </div>
                <Controller
                  name="gstDocuments"
                  control={control}
                  render={({ field, fieldState: { error } }) => (
                    <SingleFileUploader
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
              </CardBody>
            </Card>
            <Card className="my-2">
              <CardHeader className="font-medium">Contact</CardHeader>
              <CardBody className="grid grid-cols-2 gap-2">
                <Controller
                  name="primaryContact"
                  control={control}
                  render={({ field, fieldState: { error } }) => (
                    <NewSelect
                      isRequired
                      size={isMedium ? "sm" : "md"}
                      label="Primary contact"
                      errorMessage={error?.message}
                      isInvalid={!!error}
                      data={contactListByCompanyId || []}
                      labelKey="contactNo"
                      valueKey="id"
                      value={String(field.value)}
                      onChange={(value) => {
                        field.onChange(value);
                      }}
                    />
                  )}
                />
                <Controller
                  name="secondaryContact"
                  control={control}
                  render={({ field, fieldState: { error } }) => (
                    <NewSelect
                      isRequired
                      size={isMedium ? "sm" : "md"}
                      label="Secondary contact"
                      errorMessage={error?.message}
                      isInvalid={!!error}
                      data={contactListByCompanyId || []}
                      labelKey="contactNo"
                      valueKey="id"
                      value={String(field.value)}
                      onChange={(value) => {
                        field.onChange(value);
                      }}
                    />
                  )}
                />
              </CardBody>
            </Card>
            <Card className="my-2">
              <CardHeader className="font-medium">Product info</CardHeader>
              <CardBody>
                <div className="my-2">
                  <Switch
                    size={isMedium ? "sm" : "md"}
                    onChange={(e) => {
                      let values = getValues();
                      setDiscount(e);
                      reset({
                        ...values,
                        professionalFees: "",
                        serviceCharge: "",
                        govermentfees: "",
                        otherFees: "",
                        actualPrice: "",
                      });
                    }}
                  >
                    Discount approval
                  </Switch>
                </div>
                {productData?.type === "Product" ? (
                  <>
                    <div className="grid grid-cols-3 gap-2">
                      <Controller
                        name="businessArrangmentId"
                        control={control}
                        render={({ field, fieldState: { error } }) => (
                          <NewSelect
                            size={isMedium ? "sm" : "md"}
                            isRequired
                            label="Select business arrangement"
                            errorMessage={error?.message}
                            isInvalid={!!error}
                            data={businessArrangementList || []}
                            labelKey="name"
                            valueKey="id"
                            value={String(field.value)}
                            onChange={(value) => {
                              dispatch(getAllProductCategoryById(value));
                              field.onChange(value);
                            }}
                          />
                        )}
                      />
                      <Controller
                        name="productCategoryId"
                        control={control}
                        render={({ field, fieldState: { error } }) => (
                          <NewSelect
                            size={isMedium ? "sm" : "md"}
                            isRequired
                            label="Select product category"
                            errorMessage={error?.message}
                            isInvalid={!!error}
                            data={productCategoryList || []}
                            labelKey="name"
                            valueKey="id"
                            value={String(field.value)}
                            onChange={(value) => {
                              dispatch(
                                getAllProductSubCategoryListByCategoryId(value),
                              );
                              field.onChange(value);
                            }}
                          />
                        )}
                      />
                      <Controller
                        name="productSubCategoryId"
                        control={control}
                        render={({ field, fieldState: { error } }) => (
                          <NewSelect
                            size={isMedium ? "sm" : "md"}
                            isRequired
                            label="Select product category"
                            errorMessage={error?.message}
                            isInvalid={!!error}
                            data={productSubcategoryList || []}
                            labelKey="name"
                            valueKey="id"
                            value={String(field.value)}
                            onChange={(value) => {
                              dispatch(
                                getAllProductSubCategoryListByCategoryId(value),
                              );
                              field.onChange(value);
                            }}
                            onItemSelect={(item) => {
                              const currentValues = getValues();
                              setProductSubCategoryData(item);
                              reset({
                                ...currentValues,
                                actualPrice: String(item?.productFees),
                                gstCode: item?.productCode,
                                gst: item?.productGst,
                              });
                              setProductSubCategoryFees((prev) => ({
                                ...prev,
                                actualPrice: String(item?.productFees),
                                gst: item?.productGst,
                                roundOff: item?.roundValue,
                              }));
                            }}
                          />
                        )}
                      />
                    </div>

                    {Object.keys(productSubCategoryData || {})?.length > 0 && (
                      <div className="grid grid-cols-4 gap-2 mt-2">
                        <Controller
                          name="actualPrice"
                          control={control}
                          render={({ field, fieldState: { error } }) => {
                            return (
                              <Input
                                size={isMedium ? "sm" : "md"}
                                type="number"
                                startContent={
                                  <IndianRupee className="h-4 w-4" />
                                }
                                isRequired
                                label="Actual price"
                                errorMessage={discountError}
                                {...field}
                                onChange={(e) => {
                                  let { quantity, gst } = getValues();
                                  field.onChange(e.target.value);
                                  setValue(
                                    "totalPrice",
                                    String(
                                      calculateTotalPriceWithGST(
                                        e.target.value,
                                        quantity,
                                        gst,
                                      ),
                                    ),
                                  );
                                  if (discount) {
                                    validateGreaterThanOrEqual(
                                      e.target.value,
                                      productSubCategoryFees?.actualPrice,
                                      discount,
                                    );
                                  }
                                }}
                              />
                            );
                          }}
                        />

                        <Controller
                          name="gstCode"
                          control={control}
                          render={({ field, fieldState: { error } }) => (
                            <Input
                              size={isMedium ? "sm" : "md"}
                              isRequired
                              label="HSN code"
                              {...field}
                              onChange={(e) => {
                                field.onChange(e);
                              }}
                            />
                          )}
                        />
                        <Controller
                          name="gst"
                          control={control}
                          render={({ field, fieldState: { error } }) => (
                            <Input
                              size={isMedium ? "sm" : "md"}
                              isRequired
                              label="GST %"
                              endContent={<Percent className="h-4 w-4" />}
                              {...field}
                              onChange={(e) => {
                                let { actualPrice, quantity } = getValues();
                                setValue(
                                  "totalPrice",
                                  String(
                                    calculateTotalPriceWithGST(
                                      actualPrice,
                                      quantity,
                                      e.target.value,
                                    ),
                                  ),
                                );
                                field.onChange(e);
                              }}
                            />
                          )}
                        />
                        <Controller
                          name="quantity"
                          control={control}
                          render={({ field, fieldState: { error } }) => (
                            <Input
                              size={isMedium ? "sm" : "md"}
                              isRequired
                              label="Quantity in kg"
                              type="number"
                              value={field.value}
                              onChange={(e) => {
                                let { actualPrice, gst } = getValues();
                                field.onChange(e.target.value);
                                setValue(
                                  "totalPrice",
                                  String(
                                    calculateTotalPriceWithGST(
                                      actualPrice,
                                      e.target.value,
                                      gst,
                                    ),
                                  ),
                                );
                              }}
                            />
                          )}
                        />
                        <Controller
                          name="totalPrice"
                          control={control}
                          render={({ field, fieldState: { error } }) => (
                            <Input
                              size={isMedium ? "sm" : "md"}
                              isRequired
                              label="Total price (₹)"
                              isDisabled
                              type="number"
                              startContent={<IndianRupee className="h-4 w-4" />}
                              {...field}
                              onChange={(e) => {
                                field.onChange(e.target.value);
                              }}
                            />
                          )}
                        />
                      </div>
                    )}
                  </>
                ) : (
                  <>
                    {productData?.productAmount?.map((ele, idx) => {
                      if (ele?.name === "Professional fees") {
                        return (
                          <div className="grid grid-cols-3 gap-3 my-2">
                            <Controller
                              name="professionalFees"
                              control={control}
                              render={({ field, fieldState: { error } }) => (
                                <Input
                                  size={isMedium ? "sm" : "md"}
                                  isRequired
                                  type="number"
                                  label="Professional fees"
                                  startContent={
                                    <IndianRupee className="h-4 w-4" />
                                  }
                                  value={Number(field.value)}
                                  onChange={(e) => {
                                    field.onChange(Number(e.target.value));
                                  }}
                                />
                              )}
                            />
                            <Controller
                              name="professionalCode"
                              control={control}
                              render={({ field, fieldState: { error } }) => (
                                <Input
                                  size={isMedium ? "sm" : "md"}
                                  isRequired
                                  label="Hsn number"
                                  value={field.value}
                                  onChange={(e) => {
                                    field.onChange(e.target.value);
                                  }}
                                />
                              )}
                            />
                            <Controller
                              name="profesionalGst"
                              control={control}
                              render={({ field, fieldState: { error } }) => (
                                <Input
                                  size={isMedium ? "sm" : "md"}
                                  isRequired
                                  type="number"
                                  label="Professional gst"
                                  isDisabled={
                                    productFees?.profesionalGst == 0
                                      ? false
                                      : true
                                  }
                                  startContent={
                                    <IndianRupee className="h-4 w-4" />
                                  }
                                  value={Number(field.value)}
                                  onChange={(e) => {
                                    field.onChange(Number(e.target.value));
                                  }}
                                />
                              )}
                            />
                          </div>
                        );
                      }
                      if (ele?.name === "Service charges") {
                        return (
                          <div className="grid grid-cols-3 gap-3 my-2">
                            <Controller
                              name="serviceCharge"
                              control={control}
                              render={({ field, fieldState: { error } }) => (
                                <Input
                                  size={isMedium ? "sm" : "md"}
                                  isRequired
                                  label="Service charges"
                                  type="number"
                                  startContent={
                                    <IndianRupee className="h-4 w-4" />
                                  }
                                  value={Number(field.value)}
                                  onChange={(e) => {
                                    field.onChange(Number(e.target.value));
                                  }}
                                />
                              )}
                            />
                            <Controller
                              name="serviceCode"
                              control={control}
                              render={({ field, fieldState: { error } }) => (
                                <Input
                                  size={isMedium ? "sm" : "md"}
                                  isRequired
                                  label="Hsn number"
                                  value={field.value}
                                  onChange={(e) => {
                                    field.onChange(e.target.value);
                                  }}
                                />
                              )}
                            />
                            <Controller
                              name="serviceGst"
                              control={control}
                              render={({ field, fieldState: { error } }) => (
                                <Input
                                  size={isMedium ? "sm" : "md"}
                                  isRequired
                                  type="number"
                                  label="Service gst"
                                  isDisabled={
                                    productFees?.profesionalGst == 0
                                      ? false
                                      : true
                                  }
                                  startContent={
                                    <IndianRupee className="h-4 w-4" />
                                  }
                                  value={Number(field.value)}
                                  onChange={(e) => {
                                    field.onChange(Number(e.target.value));
                                  }}
                                />
                              )}
                            />
                          </div>
                        );
                      }
                      if (ele?.name === "Government") {
                        return (
                          <div className="grid grid-cols-3 gap-3 my-2">
                            <Controller
                              name="govermentfees"
                              control={control}
                              render={({ field, fieldState: { error } }) => (
                                <Input
                                  size={isMedium ? "sm" : "md"}
                                  isRequired
                                  type="number"
                                  label="Government fees"
                                  startContent={
                                    <IndianRupee className="h-4 w-4" />
                                  }
                                  value={Number(field.value)}
                                  onChange={(e) => {
                                    field.onChange(Number(e.target.value));
                                  }}
                                />
                              )}
                            />
                            <Controller
                              name="govermentCode"
                              control={control}
                              render={({ field, fieldState: { error } }) => (
                                <Input
                                  size={isMedium ? "sm" : "md"}
                                  isRequired
                                  label="Hsn number"
                                  value={field.value}
                                  onChange={(e) => {
                                    field.onChange(e.target.value);
                                  }}
                                />
                              )}
                            />
                            <Controller
                              name="govermentGst"
                              control={control}
                              render={({ field, fieldState: { error } }) => (
                                <Input
                                  size={isMedium ? "sm" : "md"}
                                  isRequired
                                  label="Government gst"
                                  type="number"
                                  isDisabled={
                                    productFees?.govermentGst == 0
                                      ? false
                                      : true
                                  }
                                  startContent={
                                    <IndianRupee className="h-4 w-4" />
                                  }
                                  value={Number(field.value)}
                                  onChange={(e) => {
                                    field.onChange(Number(e.target.value));
                                  }}
                                />
                              )}
                            />
                          </div>
                        );
                      }
                      if (ele?.name === "Other fees") {
                        return (
                          <div className="grid grid-cols-3 gap-3 my-2">
                            <Controller
                              name="otherFees"
                              control={control}
                              render={({ field, fieldState: { error } }) => (
                                <Input
                                  size={isMedium ? "sm" : "md"}
                                  isRequired
                                  label="Other fees"
                                  type="number"
                                  startContent={
                                    <IndianRupee className="h-4 w-4" />
                                  }
                                  value={Number(field.value)}
                                  onChange={(e) => {
                                    field.onChange(Number(e.target.value));
                                  }}
                                />
                              )}
                            />
                            <Controller
                              name="otherCode"
                              control={control}
                              render={({ field, fieldState: { error } }) => (
                                <Input
                                  size={isMedium ? "sm" : "md"}
                                  isRequired
                                  label="Hsn number"
                                  value={field.value}
                                  onChange={(e) => {
                                    field.onChange(e.target.value);
                                  }}
                                />
                              )}
                            />
                            <Controller
                              name="otherGst"
                              control={control}
                              render={({ field, fieldState: { error } }) => (
                                <Input
                                  size={isMedium ? "sm" : "md"}
                                  isRequired
                                  type="number"
                                  label="Government gst"
                                  isDisabled={
                                    productFees?.otherGst == 0 ? false : true
                                  }
                                  startContent={
                                    <IndianRupee className="h-4 w-4" />
                                  }
                                  value={Number(field.value)}
                                  onChange={(e) => {
                                    field.onChange(Number(e.target.value));
                                  }}
                                />
                              )}
                            />
                          </div>
                        );
                      }
                    })}
                  </>
                )}
              </CardBody>
            </Card>
            <Card className="my-2">
              <CardHeader className="font-medium">Purchasing info</CardHeader>
              <CardBody className="grid grid-cols-3 gap-3">
                {adminRole && (
                  <Controller
                    name="assigneeId"
                    control={control}
                    render={({ field, fieldState: { error } }) => (
                      <NewSelect
                        size={isMedium ? "sm" : "md"}
                        isRequired
                        label="Select assignee"
                        errorMessage={error?.message}
                        isInvalid={!!error}
                        data={leadUsersList || []}
                        labelKey="fullName"
                        valueKey="id"
                        value={String(field.value)}
                        onChange={(value) => {
                          field.onChange(value);
                        }}
                      />
                    )}
                  />
                )}

                <Controller
                  name="orderNumber"
                  control={control}
                  render={({ field, fieldState: { error } }) => (
                    <Input
                      size={isMedium ? "sm" : "md"}
                      isRequired
                      label="Order number"
                      {...field}
                      onChange={(e) => {
                        field.onChange(e.target.value);
                      }}
                    />
                  )}
                />
                <Controller
                  name="purchaseDate"
                  control={control}
                  render={({ field, fieldState: { error } }) => {
                    return (
                      <DatePicker
                        size={isMedium ? "sm" : "md"}
                        isRequired
                        label="Purchase date"
                        showMonthAndYearPickers
                        maxValue={today(getLocalTimeZone())}
                        errorMessage={error?.message}
                        isInvalid={!!error}
                        value={field.value ? parseDate(field.value) : null}
                        onChange={(e) =>
                          field.onChange(toCalendarDate(e).toString())
                        }
                      />
                    );
                  }}
                />
                <Controller
                  name="invoiceNote"
                  control={control}
                  render={({ field, fieldState: { error } }) => (
                    <Input
                      size={isMedium ? "sm" : "md"}
                      isRequired
                      label="Invoice note"
                      {...field}
                      onChange={(e) => {
                        field.onChange(e.target.value);
                      }}
                    />
                  )}
                />
                <Controller
                  name="remarksForOption"
                  control={control}
                  render={({ field, fieldState: { error } }) => (
                    <Input
                      size={isMedium ? "sm" : "md"}
                      isRequired
                      label="Remark"
                      {...field}
                      onChange={(e) => {
                        field.onChange(e.target.value);
                      }}
                    />
                  )}
                />
              </CardBody>
            </Card>
            <Card className="my-2">
              <CardHeader className="flex justify-between font-medium">
                Address{" "}
                {!companyAndUnitData?.oneTimeUpdateAddress && (
                  <Button
                    variant="flat"
                    color="primary"
                    endContent={<Pencil className="w-4 h-4" />}
                    onPress={addressFormModal.onOpen}
                    size={isMedium ? "sm" : "md"}
                  >
                    Update address
                  </Button>
                )}
              </CardHeader>
              <CardBody className="grid grid-cols-3 gap-3">
                <Controller
                  name="address"
                  control={control}
                  render={({ field, fieldState: { error } }) => (
                    <Input
                      size={isMedium ? "sm" : "md"}
                      isRequired
                      label="Address"
                      {...field}
                      onChange={(e) => {
                        field.onChange(e.target.value);
                      }}
                    />
                  )}
                />
                <Controller
                  name="country"
                  control={control}
                  render={({ field, fieldState: { error } }) => (
                    <NewSelect
                      label="Country"
                      size={isMedium ? "sm" : "md"}
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
                      size={isMedium ? "sm" : "md"}
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
                      size={isMedium ? "sm" : "md"}
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
                      size={isMedium ? "sm" : "md"}
                      label="Pin code"
                      errorMessage={error?.message}
                      isInvalid={!!error}
                      {...field}
                    />
                  )}
                />
              </CardBody>
            </Card>
            <Card className="my-2">
              <CardHeader className="font-medium">Secondary address</CardHeader>
              <CardBody className="grid grid-cols-3 gap-3">
                <Controller
                  name="secondaryAddress"
                  control={control}
                  render={({ field, fieldState: { error } }) => (
                    <Input
                      size={isMedium ? "sm" : "md"}
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
                      size={isMedium ? "sm" : "md"}
                      label="Country"
                      errorMessage={error?.message}
                      isInvalid={!!error}
                      data={countryList || []}
                      labelKey="name"
                      valueKey="name"
                      value={field.value}
                      onChange={(value) => {
                        dispatch(
                          getAllSecondaryStatesBySecondaryCountryName(value),
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
                      size={isMedium ? "sm" : "md"}
                      errorMessage={error?.message}
                      isInvalid={!!error}
                      data={secStatesList || []}
                      labelKey="name"
                      valueKey="name"
                      value={field.value}
                      onChange={(value) => {
                        dispatch(
                          getAllSecondaryCitiesBySecondaryStateName(value),
                        );
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
                      size={isMedium ? "sm" : "md"}
                      label="City"
                      errorMessage={error?.message}
                      isInvalid={!!error}
                      data={secCitiesList || []}
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
                      size={isMedium ? "sm" : "md"}
                      label="Pin code"
                      errorMessage={error?.message}
                      isInvalid={!!error}
                      {...field}
                    />
                  )}
                />
              </CardBody>
            </Card>
            <div className="flex justify-end px-4 my-2 w-full">
              <Button
                type="submit"
                color="primary"
                size={isMedium ? "sm" : "md"}
              >
                Submit
              </Button>
            </div>
          </form>
          <Modal
            size="2xl"
            isOpen={addressFormModal.isOpen}
            onOpenChange={addressFormModal.onOpenChange}
          >
            <ModalContent>
              {(onClose) => (
                <>
                  <ModalHeader className="flex flex-col gap-1">
                    Update address
                  </ModalHeader>
                  <ModalBody>
                    <form
                      onSubmit={addressForm.handleSubmit(handleAddressFinish)}
                    >
                      <div className="grid grid-cols-2 gap-4">
                        <Controller
                          name="revenue"
                          control={addressForm.control}
                          render={({ field, fieldState: { error } }) => (
                            <Input
                              size={isMedium ? "sm" : "md"}
                              isRequired
                              label="Revenue"
                              {...field}
                              onChange={(e) => {
                                field.onChange(e);
                              }}
                            />
                          )}
                        />
                        <Controller
                          name="address"
                          control={addressForm.control}
                          render={({ field, fieldState: { error } }) => (
                            <Input
                              size={isMedium ? "sm" : "md"}
                              isRequired
                              label="Address"
                              {...field}
                              onChange={(e) => {
                                field.onChange(e);
                              }}
                            />
                          )}
                        />
                        <Controller
                          name="country"
                          control={addressForm.control}
                          render={({ field, fieldState: { error } }) => (
                            <NewSelect
                              size={isMedium ? "sm" : "md"}
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
                          control={addressForm.control}
                          render={({ field, fieldState: { error } }) => (
                            <NewSelect
                              size={isMedium ? "sm" : "md"}
                              label="State"
                              errorMessage={error?.message}
                              isInvalid={!!error}
                              data={statesList || []}
                              labelKey="name"
                              valueKey="name"
                              value={field.value}
                              onChange={(value) => {
                                field.onChange(value);
                              }}
                            />
                          )}
                        />

                        <Controller
                          name="city"
                          control={addressForm.control}
                          render={({ field, fieldState: { error } }) => (
                            <NewSelect
                              size={isMedium ? "sm" : "md"}
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
                          name="pinCode"
                          control={addressForm.control}
                          render={({ field, fieldState: { error } }) => (
                            <Input
                              size={isMedium ? "sm" : "md"}
                              label="Pin code"
                              errorMessage={error?.message}
                              isInvalid={!!error}
                              {...field}
                            />
                          )}
                        />
                      </div>
                      <ModalFooter className="flex justify-end">
                        <Button onPress={onClose} size={isMedium ? "sm" : "md"}>
                          Cancel
                        </Button>
                        <Button
                          color="primary"
                          type="submit"
                          size={isMedium ? "sm" : "md"}
                        >
                          Submit
                        </Button>
                      </ModalFooter>
                    </form>
                  </ModalBody>
                </>
              )}
            </ModalContent>
          </Modal>
          <Modal
            size="2xl"
            isOpen={gstFormModal.isOpen}
            onOpenChange={gstFormModal.onOpenChange}
          >
            <ModalContent>
              {(onClose) => (
                <>
                  <ModalHeader className="flex flex-col gap-1">
                    Update GST
                  </ModalHeader>
                  <ModalBody>
                    <form
                      onSubmit={gstForm.handleSubmit((values) => {
                        handleGstUpdate(values);
                      })}
                    >
                      <div className="grid grid-cols-2 gap-4">
                        <Controller
                          name="companyType"
                          control={gstForm.control}
                          render={({ field, fieldState: { error } }) => {
                            return (
                              <NewSelect
                                size={isMedium ? "sm" : "md"}
                                isRequired
                                label="Company structure"
                                errorMessage={
                                  error?.message ||
                                  "Please select the company type."
                                }
                                isInvalid={!!error}
                                data={companyTypeList || []}
                                labelKey="name"
                                valueKey="id"
                                value={String(field.value)}
                                onChange={(value) => {
                                  dispatch(getAllGstTypeByCompanyTypeId(value));
                                  field.onChange(value || null);
                                }}
                              />
                            );
                          }}
                        />

                        <Controller
                          name="gstType"
                          control={gstForm.control}
                          render={({ field, fieldState: { error } }) => {
                            return (
                              <NewSelect
                                size={isMedium ? "sm" : "md"}
                                isRequired
                                label="GST type"
                                errorMessage={error?.message}
                                isInvalid={!!error}
                                data={gstTypeList?.gstBussinessType || []}
                                labelKey="name"
                                valueKey="id"
                                value={String(field.value)}
                                onChange={(value) => {
                                  dispatch(getBusinessTypeByGstTypeId(value));
                                  field.onChange(value || null);
                                }}
                              />
                            );
                          }}
                        />

                        <Controller
                          name="businessType"
                          control={gstForm.control}
                          render={({ field, fieldState: { error } }) => {
                            return (
                              <NewSelect
                                size={isMedium ? "sm" : "md"}
                                isRequired
                                label="Business type"
                                errorMessage={error?.message}
                                isInvalid={!!error}
                                data={businessTypeList?.gstTypePrice || []}
                                labelKey="name"
                                valueKey="id"
                                value={String(field.value)}
                                onChange={(value) => {
                                  field.onChange(value || null);
                                  const foundObject =
                                    businessTypeList?.gstTypePrice?.find(
                                      (item) => item.id == value,
                                    );
                                  setUpdateGstMand((prev) => ({
                                    ...prev,
                                    gst: foundObject?.gstPresent ?? false,
                                    pan: foundObject?.panPresent ?? false,
                                  }));
                                }}
                              />
                            );
                          }}
                        />

                        {updateGstMand?.gst && (
                          <Controller
                            name="gstNo"
                            control={gstForm.control}
                            render={({ field, fieldState: { error } }) => {
                              return (
                                <Input
                                  size={isMedium ? "sm" : "md"}
                                  isRequired
                                  label="GST number"
                                  maxLength={15}
                                  errorMessage={error?.message}
                                  isInvalid={!!error}
                                  value={field?.value}
                                  onChange={(e) => {
                                    field.onChange(e.target.value);
                                    handleUpdateGstChange(e);
                                  }}
                                />
                              );
                            }}
                          />
                        )}

                        {updateGstMand?.pan && (
                          <Controller
                            name="panNo"
                            control={gstForm.control}
                            render={({ field, fieldState: { error } }) => {
                              return (
                                <Input
                                  size={isMedium ? "sm" : "md"}
                                  isRequired
                                  label="Pan number"
                                  maxLength={10}
                                  errorMessage={error?.message}
                                  isInvalid={!!error}
                                  value={field?.value}
                                  onChange={(e) => {
                                    field.onChange(e.target.value);
                                    handleUpdatePanChange(e);
                                  }}
                                />
                              );
                            }}
                          />
                        )}
                      </div>
                      <ModalFooter className="flex justify-end">
                        <Button onPress={onClose} size={isMedium ? "sm" : "md"}>
                          Cancel
                        </Button>
                        <Button
                          color="primary"
                          type="submit"
                          size={isMedium ? "sm" : "md"}
                        >
                          Submit
                        </Button>
                      </ModalFooter>
                    </form>
                  </ModalBody>
                </>
              )}
            </ModalContent>
          </Modal>
        </div>
      ) : (
        <div className="flex flex-col gap-1">
          {plantSetupData && (
            <NewSelect
              data={childLeads}
              labelKey={"childLeadName"}
              valueKey={"childId"}
              label={"Select child lead"}
              onChange={(e) => {
                dispatch(getEstimateByLeadId(e));
              }}
            />
          )}

          <EstimateView details={details} />
        </div>
      )}

      <Drawer isOpen={isOpen} onOpenChange={onOpenChange}>
        <DrawerContent>
          {(onClose) => (
            <>
              <DrawerHeader className="flex flex-col gap-1">
                Document list
              </DrawerHeader>
              <DrawerBody>
                <Table aria-label="Example table with dynamic content">
                  <TableHeader
                    columns={[
                      {
                        key: "id",
                        label: "ID",
                      },
                      {
                        key: "certificates",
                        label: "CERTIFICATE",
                      },
                      {
                        key: "docs",
                        label: "UPLOAD DOCUMENT",
                      },
                    ]}
                  >
                    {(column) => (
                      <TableColumn key={column.key}>{column.label}</TableColumn>
                    )}
                  </TableHeader>
                  <TableBody items={docsListInEstimate || []}>
                    {(item) => (
                      <TableRow key={item.key}>
                        {(columnKey) => (
                          <TableCell>
                            {renderDoucmentData(item, columnKey)}
                          </TableCell>
                        )}
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </DrawerBody>
              <DrawerFooter>
                <Button color="danger" variant="light" onPress={onClose}>
                  Close
                </Button>
                <Button color="primary" onPress={onClose}>
                  Action
                </Button>
              </DrawerFooter>
            </>
          )}
        </DrawerContent>
      </Drawer>
    </>
  );
};

export default LeadEstimate;
