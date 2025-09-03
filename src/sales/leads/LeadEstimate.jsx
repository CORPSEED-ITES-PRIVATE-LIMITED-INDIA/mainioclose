import {
  addToast,
  Autocomplete,
  AutocompleteItem,
  Button,
  Card,
  CardBody,
  CardHeader,
  DatePicker,
  Input,
  NumberInput,
  Select,
  SelectItem,
  Switch,
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
} from "../../toolkit/slices/companySlice";
import { useParams } from "react-router-dom";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import NewSelect from "../../components/NewSelect";
import { TagsInput } from "../proposal/Proposal";
import SingleFileUploader from "../../components/SingleFileUploader";
import {
  getAllBusinessArrangement,
  getAllProductCategoryById,
  getAllProductSubCategoryListByCategoryId,
  getProductListByLeadName,
} from "../../toolkit/slices/productSlice";
import { IndianRupee, Percent } from "lucide-react";
import {
  createEstimate,
  createEstimateForApprovals,
  editEstimateForApprovals,
  editLeadEstimate,
  getAllLeadUser,
  getEstimateByLeadId,
  getSingleLeadDataByLeadId,
} from "../../toolkit/slices/leadSlice";
import {
  getLocalTimeZone,
  parseDate,
  toCalendarDate,
  today,
} from "@internationalized/date";
import {
  getAllCitiesByStateId,
  getAllCountries,
  getAllStatesByCountryId,
} from "../../toolkit/slices/commonSlice";
import dayjs from "dayjs";

const formSchema = z.object({
  performaInvoice: z.boolean(),
  unitId: z.string().min(1, "Please select the company unit."),
  companyType: z.string().min(1, "Please select the company type."),
  gstType: z.string().min(1, "Please select the gst type."),
  businessType: z.string().min(1, "Please select the gst type."),
  gstNo: z.string().min(15, "please enter GST number."),
  panNo: z.string().min(10, "please enter pan number."),
  gstDocuments: z.string().optional(),
  cc: z.array(z.string()).optional(),
  primaryContact: z.string().min(1, "Please select the contact."),
  secondaryContact: z.string().min(1, "Please select the contact."),
  businessArrangmentId: z
    .string()
    .min(1, "Please select business arrangement."),
  productCategoryId: z.string().min(1, "Please select the product category."),
  productSubCategoryId: z
    .string()
    .min(1, "Please select the product sub category."),
  actualPrice: z.string().min(1, "Please enter actual price."),
  gstCode: z.string().min(1, "Please enter gst code."),
  gst: z.string().min(1, "Please enter gst percentage."),
  quantity: z.string().min(1, "Please enter quantity."),
  totalPrice: z.string().min(1, "Please enter total price."),
  professionalFees: z.string().min(1, "Please enter professional fee."),
  professionalCode: z.string().min(1, "Please enter professional code."),
  profesionalGst: z.string().min(1, "Please enter professional gst."),
  serviceCharge: z.string().min(1, "Please enter service charge."),
  serviceCode: z.string().min(1, "Please enter service code."),
  serviceGst: z.string().min(1, "Please enter service Gst."),
  govermentfees: z.string().min(1, "Please enter government fee."),
  govermentCode: z.string().min(1, "Please enter government code."),
  govermentGst: z.string().min(1, "Please enter government gst."),
  otherFees: z.string().min(1, "Please enter other fee."),
  otherCode: z.string().min(1, "Please enter other code."),
  otherGst: z.string().min(1, "Please enter other gst."),
  assigneeId: z.string().min(1, "Please select assignee id."),
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
  revenue: z.string().min("please enter revenue"),
  address: z.string().min("please enter address."),
  country: z.string().min("please select country."),
  state: z.string().min("please select state."),
  city: z.string().min("please select city."),
  pinCode: z.string().min("please enter pinCode."),
});

const addressFormDefaultValues = {
  revenue: "",
  address: "",
  country: "",
  state: "",
  city: "",
  pinCode: "",
};

const gstFormSchema = z.object({
  companyType: z.string().min("please select company type."),
  gstType: z.string().min("please select gst type."),
  businessType: z.string().min("please select business type."),
  gstNo: z.string().min("please enter gst."),
  panNo: z.string().min("please enter pan no."),
});

const gstFormDefaultValues = {
  companyType: null,
  gstType: null,
  businessType: null,
  gstNo: "",
  panNo: "",
};

const LeadEstimate = () => {
  const dispatch = useDispatch();
  const { userId, leadId } = useParams();
  const searchCompaniesList = useSelector(
    (state) => state.company.seachCompniesList
  );
  const allCompanyUnits = useSelector((state) => state.company.allCompanyUnits);
  const contactListByCompanyId = useSelector(
    (state) => state.company.contactListByCompanyId
  );
  const details = useSelector((state) => state.leads.estimateDetail);
  const companyDetails = useSelector(
    (state) => state?.leads?.companyDetailsById
  );
  const companyTypeList = useSelector((state) => state.company.companyTypeList);
  const gstTypeList = useSelector((state) => state.company.gstTypeList);
  const businessTypeList = useSelector(
    (state) => state.company.businessTypeList
  );
  const productCategoryList = useSelector(
    (state) => state.product.productCategoryList
  );
  const productSubcategoryList = useSelector(
    (state) => state.product.productSubcategoryList
  );
  const businessArrangementList = useSelector(
    (state) => state?.product?.businessArrangementList
  );
  const productData = useSelector(
    (state) => state.product.productDataByLeadName
  );
  const leadUsersList = useSelector((state) => state.leads.leadUsersList);
  const countryList = useSelector((state) => state.common.countriesList);
  const statesList = useSelector((state) => state.common.statesList);
  const citiesList = useSelector((state) => state.common.citiesList);
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
  const [discount, setDiscount] = useState(false);
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

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
    reset,
    getValues,
  } = useForm({
    resolver: zodResolver(formSchema),
    defaultValues,
  });

  const gstForm = useForm({
    resolver: zodResolver(gstFormSchema),
    defaultValues: gstFormDefaultValues,
  });

  const addressForm = useForm({
    resolver: zodResolver(addressFormSchema),
    defaultValues: addressFormDefaultValues,
  });

  useEffect(() => {
    dispatch(getSingleLeadDataByLeadId({ leadId, userId })).then((resp) => {
      if (resp.meta.requestStatus === "fulfilled") {
        dispatch(getProductListByLeadName(resp?.payload?.originalName));
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
      dispatch(getAllBusinessArrangement(productData?.id));
    }
  }, [dispatch, productData]);

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
    let values = getValues();
    productData?.productAmount?.forEach((item) => {
      if (item?.name === "Government") {
        reset({
          ...values,
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
        reset({
          ...values,
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
        reset({
          ...values,
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
        reset({
          ...values,
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
  }, [productData]);

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
    reset({
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
      gstDocuments: details?.gstDocuments,
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

    gstForm.reset({
      companyType: details?.companyType,
      gstType: details?.gstType,
      businessType: details?.businessType,
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

  const handleFinish = useCallback(
    (values) => {
      values.leadId = leadId;
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
                addToast({
                  title: "Estimate edited successfully !.",
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
              addToast({ title: "Something went wrong !.", color: "danger" })
            );
        } else {
          dispatch(createEstimateForApprovals(values))
            .then((resp) => {
              if (resp.meta.requestStatus === "fulfilled") {
                addToast({
                  title: "Estimate created successfully !.",
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
              addToast({ title: "Something went wrong !.", color: "danger" })
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
                dispatch(getEstimateByLeadId(leadId));
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
      leadId,
      details,
      editEstimate,
      productData,
      dispatch,
      companyAndUnitData,
      discount,
    ]
  );

  return (
    <div>
      <div className="flex items-center w-full my-2">
        <Select
          size="lg"
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
          {(item) => <SelectItem key={item?.value}>{item?.label}</SelectItem>}
        </Select>
        <Autocomplete
          size="lg"
          className="max-w-[85%]"
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
      <form className="max-h-[70vh] overflow-auto px-4 py-2">
        <Card className="my-2">
          <CardHeader>Company info</CardHeader>
          <CardBody className="grid grid-cols-3 gap-2">
            <Controller
              name="unitId"
              control={control}
              render={({ field, fieldState: { error } }) => {
                return (
                  <NewSelect
                    isRequired
                    data={allCompanyUnits||[]}
                    errorMessage="please select company unit"
                    label={"Select company unit "}
                    value={field?.value}
                    labelKey={"companyName"}
                    valueKey={"id"}
                    onSelectionChange={(e) => {
                      field.onChange(e);
                    }}
                    onItemSelect={(compUnit) => {
                      setCompanyAndUnitData((prev) => ({
                        ...prev,
                        unitName: compUnit?.companyName,
                        unitId: compUnit?.id,
                        oneTimeUpdateGst: compUnit?.oneTimeUpdateGst,
                        oneTimeUpdateAddress: compUnit?.oneTimeUpdateAddress,
                      }));
                      dispatch(
                        getAllGstTypeByCompanyTypeId(compUnit?.companyType)
                      );
                      dispatch(getBusinessTypeByGstTypeId(compUnit?.gstType));
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
                        primaryPinCode: compUnit?.pinCode,
                        secondaryAddress: compUnit?.sAddress,
                        secondaryCity: compUnit?.sCity,
                        secondaryState: compUnit?.sState,
                        secondaryCountry: compUnit?.sCountry,
                        secondaryPinCode: compUnit?.secondaryPinCode,
                      });
                      gstForm.reset({
                        companyType: compUnit?.companyType,
                        gstType: compUnit?.gstType,
                        businessType: compUnit?.bussinessType,
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
                  label="Company structure"
                  errorMessage={"please select the company type."}
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
                    const foundObject = businessTypeList?.gstTypePrice?.find(
                      (item) => item.id == value
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
                    isRequired
                    label="GST number"
                    maxLength={15}
                    errorMessage={error?.message }
                    isInvalid={!!error }
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
                    isRequired
                    label="Pan number"
                    maxLength={10}
                    errorMessage={error?.message }
                    isInvalid={!!error}
                    {...field}
                    onChange={(e) => {
                      handlePanChange(e);
                    }}
                  />
                )}
              />
            )}

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

            <div className="flex flex-col gap-1">
              {/* <label className="font-medium">Cc</label> */}
              <Controller
                name="cc"
                control={control}
                render={({ field, fieldState: { error } }) => (
                  <>
                    <TagsInput
                      {...field}
                      placeholder="CC"
                      className="rounded-lg h-[50px]"
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
          </CardBody>
        </Card>
        <Card className="my-2">
          <CardHeader>Contact</CardHeader>
          <CardBody className="grid grid-cols-2 gap-2">
            <Controller
              name="primaryContact"
              control={control}
              render={({ field, fieldState: { error } }) => (
                <NewSelect
                  isRequired
                  label="Primary contact"
                  errorMessage={error?.message}
                  isInvalid={!!error}
                  data={contactListByCompanyId || []}
                  labelKey="contactNo"
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
              name="secondaryContact"
              control={control}
              render={({ field, fieldState: { error } }) => (
                <NewSelect
                  isRequired
                  label="Secondary contact"
                  errorMessage={error?.message}
                  isInvalid={!!error}
                  data={contactListByCompanyId || []}
                  labelKey="contactNo"
                  valueKey="id"
                  value={field.value}
                  onChange={(value) => {
                    dispatch(getBusinessTypeByGstTypeId(value));
                    field.onChange(value);
                  }}
                />
              )}
            />
          </CardBody>
        </Card>
        <Card className="my-2">
          <CardHeader>Product info</CardHeader>
          <CardBody>
            <div className="my-2">
              <Switch
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
                        isRequired
                        label="Select business arrangement"
                        errorMessage={error?.message}
                        isInvalid={!!error}
                        data={businessArrangementList || []}
                        labelKey="name"
                        valueKey="id"
                        value={field.value}
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
                        isRequired
                        label="Select product category"
                        errorMessage={error?.message}
                        isInvalid={!!error}
                        data={productCategoryList || []}
                        labelKey="name"
                        valueKey="id"
                        value={field.value}
                        onChange={(value) => {
                          dispatch(
                            getAllProductSubCategoryListByCategoryId(value)
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
                        isRequired
                        label="Select product category"
                        errorMessage={error?.message}
                        isInvalid={!!error}
                        data={productSubcategoryList || []}
                        labelKey="name"
                        valueKey="id"
                        value={field.value}
                        onChange={(value) => {
                          dispatch(
                            getAllProductSubCategoryListByCategoryId(value)
                          );
                          field.onChange(value);
                        }}
                        onItemSelect={(item) => {
                          const currentValues = getValues();
                          setProductSubCategoryData(item);
                          reset({
                            ...currentValues,
                            actualPrice: item?.productFees,
                            gstCode: item?.productCode,
                            gst: item?.productGst,
                          });
                          setProductSubCategoryFees((prev) => ({
                            ...prev,
                            actualPrice: item?.productFees,
                            gst: item?.productGst,
                            roundOff: item?.roundValue,
                          }));
                        }}
                      />
                    )}
                  />
                </div>

                {Object.keys(productSubCategoryData || {})?.length > 0 && (
                  <div className="grid grid-cols-4 gap-2">
                    <Controller
                      name="actualPrice"
                      control={control}
                      render={({ field, fieldState: { error } }) => (
                        <NumberInput
                          startContent={<IndianRupee className="h-4 w-4" />}
                          isRequired
                          label="Actual price"
                          errorMessage={discountError}
                          {...field}
                          onChange={(e) => {
                            let { quantity, gst } = getValues();
                            field.onChange(e);
                            calculateTotalPriceWithGST(e, quantity, gst);
                            validateGreaterThanOrEqual(
                              e,
                              productSubCategoryFees?.actualPrice,
                              discount
                            );
                          }}
                        />
                      )}
                    />

                    <Controller
                      name="gstCode"
                      control={control}
                      render={({ field, fieldState: { error } }) => (
                        <Input
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
                          isRequired
                          label="GST %"
                          endContent={<Percent className="h-4 w-4" />}
                          {...field}
                          onChange={(e) => {
                            let { actualPrice, quantity } = getValues();
                            calculateTotalPriceWithGST(
                              actualPrice,
                              quantity,
                              e
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
                        <NumberInput
                          isRequired
                          label="Quantity in kg"
                          {...field}
                          onChange={(e) => {
                            let { actualPrice, gst } = getValues();
                            calculateTotalPriceWithGST(actualPrice, e, gst);
                            field.onChange(e);
                          }}
                        />
                      )}
                    />
                    <Controller
                      name="totalPrice"
                      control={control}
                      render={({ field, fieldState: { error } }) => (
                        <NumberInput
                          isRequired
                          label="Total price (₹)"
                          startContent={<IndianRupee className="h-4 w-4" />}
                          {...field}
                          onChange={(e) => {
                            field.onChange(e);
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
                      <div className="grid grid-cols-3 gap-3">
                        <Controller
                          name="professionalFees"
                          control={control}
                          render={({ field, fieldState: { error } }) => (
                            <NumberInput
                              isRequired
                              label="Professional fees"
                              startContent={<IndianRupee className="h-4 w-4" />}
                              {...field}
                              onChange={(e) => {
                                field.onChange(e);
                              }}
                            />
                          )}
                        />
                        <Controller
                          name="professionalCode"
                          control={control}
                          render={({ field, fieldState: { error } }) => (
                            <Input
                              isRequired
                              label="Hsn number"
                              {...field}
                              onChange={(e) => {
                                field.onChange(e);
                              }}
                            />
                          )}
                        />
                        <Controller
                          name="profesionalGst"
                          control={control}
                          render={({ field, fieldState: { error } }) => (
                            <NumberInput
                              isRequired
                              label="Professional gst"
                              isDisabled={
                                productFees?.profesionalGst == 0 ? false : true
                              }
                              startContent={<IndianRupee className="h-4 w-4" />}
                              {...field}
                              onChange={(e) => {
                                field.onChange(e);
                              }}
                            />
                          )}
                        />
                      </div>
                    );
                  }
                  if (ele?.name === "Service charges") {
                    return (
                      <div className="grid grid-cols-3 gap-3">
                        <Controller
                          name="serviceCharge"
                          control={control}
                          render={({ field, fieldState: { error } }) => (
                            <NumberInput
                              isRequired
                              label="Service charges"
                              startContent={<IndianRupee className="h-4 w-4" />}
                              {...field}
                              onChange={(e) => {
                                field.onChange(e);
                              }}
                            />
                          )}
                        />
                        <Controller
                          name="serviceCode"
                          control={control}
                          render={({ field, fieldState: { error } }) => (
                            <Input
                              isRequired
                              label="Hsn number"
                              {...field}
                              onChange={(e) => {
                                field.onChange(e);
                              }}
                            />
                          )}
                        />
                        <Controller
                          name="serviceGst"
                          control={control}
                          render={({ field, fieldState: { error } }) => (
                            <NumberInput
                              isRequired
                              label="Service gst"
                              isDisabled={
                                productFees?.profesionalGst == 0 ? false : true
                              }
                              startContent={<IndianRupee className="h-4 w-4" />}
                              {...field}
                              onChange={(e) => {
                                field.onChange(e);
                              }}
                            />
                          )}
                        />
                      </div>
                    );
                  }
                  if (ele?.name === "Government") {
                    return (
                      <div className="grid grid-cols-3 gap-3">
                        <Controller
                          name="govermentfees"
                          control={control}
                          render={({ field, fieldState: { error } }) => (
                            <NumberInput
                              isRequired
                              label="Government fees"
                              startContent={<IndianRupee className="h-4 w-4" />}
                              {...field}
                              onChange={(e) => {
                                field.onChange(e);
                              }}
                            />
                          )}
                        />
                        <Controller
                          name="govermentCode"
                          control={control}
                          render={({ field, fieldState: { error } }) => (
                            <Input
                              isRequired
                              label="Hsn number"
                              {...field}
                              onChange={(e) => {
                                field.onChange(e);
                              }}
                            />
                          )}
                        />
                        <Controller
                          name="govermentGst"
                          control={control}
                          render={({ field, fieldState: { error } }) => (
                            <NumberInput
                              isRequired
                              label="Government gst"
                              isDisabled={
                                productFees?.govermentGst == 0 ? false : true
                              }
                              startContent={<IndianRupee className="h-4 w-4" />}
                              {...field}
                              onChange={(e) => {
                                field.onChange(e);
                              }}
                            />
                          )}
                        />
                      </div>
                    );
                  }
                  if (ele?.name === "Other fees") {
                    return (
                      <div className="grid grid-cols-3 gap-3">
                        <Controller
                          name="otherFees"
                          control={control}
                          render={({ field, fieldState: { error } }) => (
                            <NumberInput
                              isRequired
                              label="Other fees"
                              startContent={<IndianRupee className="h-4 w-4" />}
                              {...field}
                              onChange={(e) => {
                                field.onChange(e);
                              }}
                            />
                          )}
                        />
                        <Controller
                          name="otherCode"
                          control={control}
                          render={({ field, fieldState: { error } }) => (
                            <Input
                              isRequired
                              label="Hsn number"
                              {...field}
                              onChange={(e) => {
                                field.onChange(e);
                              }}
                            />
                          )}
                        />
                        <Controller
                          name="otherGst"
                          control={control}
                          render={({ field, fieldState: { error } }) => (
                            <NumberInput
                              isRequired
                              label="Government gst"
                              isDisabled={
                                productFees?.otherGst == 0 ? false : true
                              }
                              startContent={<IndianRupee className="h-4 w-4" />}
                              {...field}
                              onChange={(e) => {
                                field.onChange(e);
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
          <CardHeader>Purchasing info</CardHeader>
          <CardBody className="grid grid-cols-3 gap-3">
            <Controller
              name="assigneeId"
              control={control}
              render={({ field, fieldState: { error } }) => (
                <NewSelect
                  isRequired
                  label="Select product category"
                  errorMessage={error?.message}
                  isInvalid={!!error}
                  data={leadUsersList || []}
                  labelKey="name"
                  valueKey="id"
                  value={field.value}
                  onChange={(value) => {
                    field.onChange(value);
                  }}
                />
              )}
            />
            <Controller
              name="orderNumber"
              control={control}
              render={({ field, fieldState: { error } }) => (
                <Input
                  isRequired
                  label="Order number"
                  {...field}
                  onChange={(e) => {
                    field.onChange(e);
                  }}
                />
              )}
            />
            <Controller
              name="purchaseDate"
              control={control}
              render={({ field, fieldState: { error } }) => (
                <DatePicker
                  isRequired
                  label="Purchase date"
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
              name="invoiceNote"
              control={control}
              render={({ field, fieldState: { error } }) => (
                <Input
                  isRequired
                  label="Invoice note"
                  {...field}
                  onChange={(e) => {
                    field.onChange(e);
                  }}
                />
              )}
            />
            <Controller
              name="remarksForOption"
              control={control}
              render={({ field, fieldState: { error } }) => (
                <Input
                  isRequired
                  label="Remark"
                  {...field}
                  onChange={(e) => {
                    field.onChange(e);
                  }}
                />
              )}
            />
          </CardBody>
        </Card>
        <Card className="my-2">
          <CardHeader>Address</CardHeader>
          <CardBody className="grid grid-cols-3 gap-3">
            <Controller
              name="address"
              control={control}
              render={({ field, fieldState: { error } }) => (
                <Input
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
          </CardBody>
        </Card>
        <Card className="my-2">
          <CardHeader>Secondary address</CardHeader>
          <CardBody className="grid grid-cols-3 gap-3">
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
          </CardBody>
        </Card>
        <div className="flex justify-end px-4 my-2 w-full">
          <Button type="submit" color="primary">
            Submit
          </Button>
        </div>
      </form>
    </div>
  );
};

export default LeadEstimate;
