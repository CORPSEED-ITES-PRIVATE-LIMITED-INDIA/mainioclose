import {
  Autocomplete,
  AutocompleteItem,
  Card,
  CardBody,
  CardHeader,
  Select,
  SelectItem,
} from "@heroui/react";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
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
  const { userId } = useParams();
  const searchCompaniesList = useSelector(
    (state) => state.company.seachCompniesList
  );
  const allCompanyUnits = useSelector((state) => state.company.allCompanyUnits);
  const contactListByCompanyId = useSelector(
    (state) => state.company.contactListByCompanyId
  );
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

  useEffect(() => {
    const handler = setTimeout(() => {
      if (seachFields.searchText) {
        dispatch(searchCompaniesForCompany(seachFields)).then((resp) => {
          //   if (resp.meta.requestStatus === "fulfilled") {
          //     setOpenSelectDd(true);
          //   }
        });
      }
    }, 500);

    return () => {
      clearTimeout(handler);
    };
  }, [seachFields.searchText, seachFields.searchField, dispatch]);

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
    reset,
  } = useForm({
    resolver: zodResolver(formSchema),
    defaultValues,
  });

  const gstForm = useForm({
    resolver: zodResolver(),
  });

  const addressForm = useForm({
    resolver: zodResolver(),
  });

  return (
    <div>
      <div className="flex items-center w-full mt-2">
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
          className="max-w-[80%]"
          classNames={{ base: "rounded-tr-none rounded-br-none" }}
          defaultItems={searchCompaniesList || []}
          placeholder="Search companies"
          onInputChange={(e) =>
            setSearchFields((prev) => ({ ...prev, searchText: e }))
          }
          onSelectionChange={(e) => {
            let key = Array.from(e)[0];

            dispatch(getAllCompanyUnits(key));
            dispatch(getAllContactListByCompanyId(key));
          }}
        >
          {(item) => (
            <AutocompleteItem
              key={item.companyId}
              onPress={() => {
                setSearchFields((prev) => ({
                  ...prev,
                  searchText: item?.companyName,
                }));
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
      <form>
        <Card>
          <CardHeader>Company info</CardHeader>
          <CardBody>
            <Controller
              name="unitId"
              control={control}
              render={({ field, fieldState: { error } }) => (
                <Autocomplete
                  label="Select company unit "
                  isRequired
                  errorMessage="please select company unit"
                  defaultItems={allCompanyUnits || []}
                  selectedKey={field?.value}
                  onSelectionChange={(e) => {
                    let key = Array.from(e)[0];
                    field.onChange(key);
                  }}
                >
                  {(compUnit) => (
                    <AutocompleteItem
                      key={compUnit.id}
                      onPress={() => {
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
                    >
                      {compUnit.companyName}
                    </AutocompleteItem>
                  )}
                </Autocomplete>
              )}
            />
          </CardBody>
        </Card>
      </form>
    </div>
  );
};

export default LeadEstimate;
