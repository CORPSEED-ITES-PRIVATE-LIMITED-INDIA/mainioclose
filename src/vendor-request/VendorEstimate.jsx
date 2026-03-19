import React, { useCallback, useEffect, useState } from "react";
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Input,
  Button,
  DropdownTrigger,
  Dropdown,
  DropdownMenu,
  DropdownItem,
  Pagination,
  useDisclosure,
  Modal,
  ModalBody,
  ModalFooter,
  ModalContent,
  ModalHeader,
  Select,
  SelectItem,
  DatePicker,
  addToast,
} from "@heroui/react";
import {
  ChevronDown,
  EllipsisVertical,
  IndianRupee,
  Percent,
  Plus,
  Search,
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import dayjs from "dayjs";
import {
  createExternalVendorsPayment,
  createVendorsPayment,
} from "../toolkit/slices/accountSlice";
import TaxInvoice from "../components/TaxInvoice";
import { formatGSTInput, inrCurrency } from "../common";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import * as z from "zod";
import NewSelect from "../components/NewSelect";
import {
  getAllCitiesByStateName,
  getAllCountries,
  getAllStatesByCountryName,
  getAllUrlList,
} from "../toolkit/slices/commonSlice";
import {
  getLocalTimeZone,
  parseDate,
  toCalendarDate,
  today,
} from "@internationalized/date";
import FileUploader from "../components/FileUploader";
import { useParams } from "react-router-dom";
import {
  getAllVendorsEstimate,
  getVendorsEstimateCount,
} from "../toolkit/slices/vendorsSlice";
import InvoiceView from "../components/InvoiceView";
import {
  getAllBusinessArrangementBySolutionId,
  getAllProductCategoryById,
  getAllProductSubCategoryListByCategoryId,
} from "../toolkit/slices/productSlice";

const columns = [
  { name: "ID", uid: "id" },
  { name: "PRODUCT NAME", uid: "productName" },
  { name: "COMPANY", uid: "companyName" },
  { name: "UNIT NAME", uid: "unitName" },
  { name: "CREATED DATE", uid: "createDate" },
  { name: "GST NUMBER", uid: "gstNo" },
  { name: "PRIMARY CONTACT", uid: "primaryContact" },
  { name: "SECONDARY CONTACT", uid: "secondaryContact" },
  { name: "PROF. FEE", uid: "professionalFees" },
  { name: "GOVT. FEE", uid: "govermentfees" },
  { name: "SERVICE FEE", uid: "serviceCharge" },
  { name: "OTHER FEE", uid: "otherFees" },
  { name: "INVOICE NOTE", uid: "invoiceNote" },
  { name: "ADDRESS", uid: "address" },
  { name: "ACTIONS", uid: "actions" },
];

function capitalize(s) {
  return s ? s.charAt(0).toUpperCase() + s.slice(1).toLowerCase() : "";
}

const INITIAL_VISIBLE_COLUMNS = [
  "id",
  "productName",
  "unitName",
  "createDate",
  "gstNo",
  "govermentfees",
  "professionalFees",
  "actions",
];

const formSchema = (isGstMand) =>
  z.object({
    serviceName: z.string().min(1, "Service name cannot be empty"),
    vendorCompanyName: z.string().min(1, "Please company name"),
    gstType: z.string().min(1, "please select gst type"),
    ...(isGstMand
      ? { gstNo: z.string().min(1, "please enter gst number") }
      : { gstNo: z.string().optional() }),
    name: z.string().min(1, "please enter vendor name"),
    emails: z.string().min(1, "please enter email"),
    contactNo: z.string().min(1, "please enter contact number"),
    whatsappNo: z.string().min(1, "please enter whatsapp number"),
    businessArrangmentId: z
      .string()
      .min(1, "please select business arrangement"),
    productCategoryId: z.string().min(1, "please select product category"),
    productSubCategoryId: z
      .string()
      .min(1, "please select product sub category"),
    actualPrice: z.number(),
    quantity: z.number(),
    gstPercent: z.string().min(1, "please enter gst percent"),
    gstAmount: z.number(),
    totalPrice: z.number(),
    address: z.string().min(1, "please enter address"),
    country: z.string().min(1, "please select  country"),
    state: z.string().min(1, "please select state"),
    city: z.string().min(1, "please select city"),
    pinCode: z.string().min(1, "please enter address"),
    createDate: z.string().min(1, "please enter date"),
    remarkByVendor: z.string().min(1, "please remark "),
    remark: z.string().min(1, "please remark "),
    fileData: z.array(z.string()).optional(),
  });

const defaultValues = {
  serviceName: "",
  quantity: "",
  vendorCompanyName: "",
  gstType: "",
  gstNo: "",
  name: "",
  emails: "",
  contactNo: "",
  whatsappNo: "",
  businessArrangmentId: "",
  productCategoryId: "",
  productSubCategoryId: "",
  actualPrice: 0,
  gstPercent: "",
  gstAmount: 0,
  totalPrice: 0,
  address: "",
  country: "",
  state: "",
  city: "",
  pinCode: "",
  createDate: "",
  remarkByVendor: "",
  remark: "",
  fileData: [],
};

const paymentFormSchema = (isGst) =>
  z.object({
    serviceName: z.string().min(1, "Service name cannot be empty"),
    vendorCompanyName: z.string().min(1, "Please company name"),
    gstType: z.string().min(1, "please select gst type"),
    ...(isGst
      ? { gstNo: z.string().min(1, "please enter gst number") }
      : {
          gstNo: z.string().optional(),
        }),
    name: z.string().min(1, "please enter vendor name"),
    emails: z.string().min(1, "please enter email"),
    contactNo: z.string().min(1, "please enter contact number"),
    whatsappNo: z.string().min(1, "please enter whatsapp number"),
    price: z.number(),
    quantity: z.number().optional(),
    gstPercent: z.string().optional(),
    gstAmount: z.number(),
    totalAmount: z.number(),
    address: z.string().min(1, "please enter address"),
    country: z.string().min(1, "please select  country"),
    state: z.string().min(1, "please select state"),
    city: z.string().min(1, "please select city"),
    pinCode: z.string().min(1, "please enter address"),
    createDate: z.string().min(1, "please enter date"),
    remarkByVendor: z.string().min(1, "please remark "),
    remark: z.string().min(1, "please remark "),
    fileData: z.array(z.string()).optional(),
  });

const paymentFormDefaultValues = {
  serviceName: "",
  quantity: 0,
  vendorCompanyName: "",
  gstType: "",
  gstNo: "",
  name: "",
  emails: "",
  contactNo: "",
  whatsappNo: "",
  price: 0,
  gstPercent: "",
  gstAmount: 0,
  totalAmount: 0,
  address: "",
  country: "",
  state: "",
  city: "",
  pinCode: "",
  createDate: "",
  remarkByVendor: "",
  remark: "",
  fileData: [],
};

const VendorEstimate = () => {
  const { userId } = useParams();
  const dispatch = useDispatch();
  const { isOpen, onClose, onOpen, onOpenChange } = useDisclosure();
  const invoiceModal = useDisclosure();
  const viewModal = useDisclosure();
  const paymentModal = useDisclosure();
  const data = useSelector((state) => state.vendors.vendorEstimateList);
  const count = useSelector((state) => state.vendors.vendorEstimateCount);
  const productCategoryList = useSelector(
    (state) => state.product.productCategoryList,
  );
  const productSubcategoryList = useSelector(
    (state) => state.product.productSubcategoryList,
  );
  const businessArrangementList = useSelector(
    (state) => state?.product?.businessArrangementList,
  );
  const urlList = useSelector((state) => state.common.urlList);
  const countryList = useSelector((state) => state.common.countriesList);
  const statesList = useSelector((state) => state.common.statesList);
  const citiesList = useSelector((state) => state.common.citiesList);
  const [filterValue, setFilterValue] = React.useState("");
  const [selectedKeys, setSelectedKeys] = React.useState(new Set([]));
  const [visibleColumns, setVisibleColumns] = React.useState(
    new Set(INITIAL_VISIBLE_COLUMNS),
  );
  const [rowsPerPage, setRowsPerPage] = React.useState(50);
  const [sortDescriptor, setSortDescriptor] = React.useState({
    column: "age",
    direction: "ascending",
  });
  const [page, setPage] = React.useState(1);
  const hasSearchFilter = Boolean(filterValue);
  const [gstError, setGstError] = useState("");
  const [rowItem, setRowItem] = useState(null);
  const [isGst, setIsGst] = useState(false);
  const [isGstMand, setIsGstMand] = useState(false);

  useEffect(() => {
    dispatch(getAllVendorsEstimate({ userId, page, size: rowsPerPage }));
    dispatch(getVendorsEstimateCount(userId));
  }, [dispatch, page, rowsPerPage, userId]);

  useEffect(() => {
    dispatch(getAllCountries());
    dispatch(getAllUrlList());
  }, [dispatch]);

  const headerColumns = React.useMemo(() => {
    if (visibleColumns === "all") return columns;

    return columns.filter((column) =>
      Array.from(visibleColumns).includes(column.uid),
    );
  }, [visibleColumns]);

  const filteredItems = React.useMemo(() => {
    let filteredUsers = [...(data || [])];

    if (hasSearchFilter) {
      filteredUsers = filteredUsers?.filter((item) =>
        Object.values(item)?.some((val) =>
          String(val)?.toLowerCase()?.includes(filterValue?.toLowerCase()),
        ),
      );
    }

    return filteredUsers;
  }, [data, filterValue]);

  const pages = Math.ceil(count / rowsPerPage) || 1;

  const sortedItems = React.useMemo(() => {
    return [...filteredItems].sort((a, b) => {
      const first = a[sortDescriptor.column];
      const second = b[sortDescriptor.column];
      const cmp = first < second ? -1 : first > second ? 1 : 0;

      return sortDescriptor.direction === "descending" ? -cmp : cmp;
    });
  }, [sortDescriptor, filteredItems]);

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
    getValues,
    setValue,
    watch,
  } = useForm({
    resolver: zodResolver(formSchema(isGstMand)),
    defaultValues,
  });

  const paymentForm = useForm({
    resolver: zodResolver(paymentFormSchema(isGst)),
    defaultValues: paymentFormDefaultValues,
  });

  const state = watch("state");
  const gstNo = watch("gstNo");

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

  const handleGstChange = (e) => {
    const rawValue = e.target.value;
    const formattedValue = formatGSTInput(rawValue);
    setValue("gstNo", formattedValue);
    const error = validateGST(formattedValue, state);
    setGstError(error);
  };

  const handleSetPaymentGstChange = (e) => {
    const rawValue = e.target.value;
    const formattedValue = formatGSTInput(rawValue);
    paymentForm.setValue("gstNo", formattedValue);
    const error = validateGST(formattedValue, state);
    setGstError(error);
  };

  const handleViewEstimate = (rowData) => {
    setRowItem(rowData);
    viewModal.onOpen();
  };

  const handleStateChange = (stateName) => {
    setValue("state", stateName);
    dispatch(getAllCitiesByStateName(stateName));
    const error = validateGST(gstNo, stateName);
    setGstError(error);
  };

  const handleSetPaymentStateChange = (stateName) => {
    paymentForm.setValue("state", stateName);
    dispatch(getAllCitiesByStateName(stateName));
    const error = validateGST(gstNo, stateName);
    setGstError(error);
  };

  const handleActionsPress = (rowItem) => {
    setRowItem(rowItem);
    setValue("serviceName", rowItem?.productName);
    dispatch(getAllBusinessArrangementBySolutionId(rowItem?.productId));
  };

  const renderCell = useCallback((rowData, columnKey) => {
    switch (columnKey) {
      case "productName":
        return (
          <div className="flex items-start gap-2">
            <span className="font-medium">{rowData?.productName}</span>
          </div>
        );
      case "companyName":
        return (
          <div className="flex flex-col">
            <span className="font-normal">{rowData?.companyName}</span>
            <span className="text-sm text-gray-400">
              Age:{rowData?.companyAge || "---"} yrs
            </span>
          </div>
        );
      case "unitName":
        return (
          <div className="flex flex-col">
            <span className="font-normal">{rowData?.unitName}</span>
          </div>
        );
      case "createDate":
        return (
          <div className="flex flex-col">
            <span className="font-normal">
              {dayjs(rowData?.createDate).format("DD-MM-YYYY")}
            </span>
          </div>
        );
      case "gstNo":
        return (
          <div className="flex flex-col gap-1">
            <span className="font-semibold">{rowData.gstNo || "-"}</span>
            {rowData?.panNo && (
              <span className="text-xs text-foreground-400">
                Pan : {rowData?.panNo}
              </span>
            )}
          </div>
        );

      case "professionalFees":
        return (
          <div className="flex flex-col">
            <span className="font-medium">
              {inrCurrency(rowData?.professionalFees || 0) || "-"}
            </span>
            <span className="text-tiny text-gray-400">
              GST : {rowData?.profesionalGst || "-"}%
            </span>
          </div>
        );
      case "govermentfees":
        return (
          <div className="flex flex-col">
            <span className="font-medium">
              {inrCurrency(rowData?.govermentfees || 0) || "-"}
            </span>
            <span className="text-tiny text-gray-400">
              GST : {rowData?.govermentGst || "-"}%
            </span>
          </div>
        );
      case "serviceCharge":
        return (
          <div className="flex flex-col">
            <span className="font-medium">
              {inrCurrency(rowData?.serviceCharge || 0) || "-"}
            </span>
            <span className="text-tiny text-gray-400">
              GST : {rowData?.serviceGst || "-"}%
            </span>
          </div>
        );
      case "otherFees":
        return (
          <div className="flex flex-col">
            <span className="font-medium">
              {inrCurrency(rowData?.otherFees || 0) || "-"}
            </span>
            <span className="text-tiny text-gray-400">
              GST : {rowData?.otherGst || "-"}%
            </span>
          </div>
        );
      case "invoiceNote":
        return (
          <div className="flex items-start gap-2">
            <span className="text-xs">{rowData?.invoiceNote}</span>
          </div>
        );
      case "primaryContact":
        return (
          <div className="flex flex-col">
            <span className="font-semibold">
              {rowData.primaryContact?.name || "-"}
            </span>
            <span className="text-sm text-gray-400">
              {rowData?.primaryContact?.emails || "-"}
            </span>
            <span className="text-sm text-gray-400">
              {rowData?.primaryContact?.contactNo || "-"},
              {rowData?.primaryContact?.contactNo || "-"}
            </span>
          </div>
        );
      case "secondaryContact":
        return (
          <div className="flex flex-col">
            <span className="font-semibold">
              {rowData.secondaryContact?.name || "-"}
            </span>
            <span className="text-sm text-gray-400">
              {rowData?.secondaryContact?.emails || "-"}
            </span>
            <span className="text-sm text-gray-400">
              {rowData?.secondaryContact?.contactNo || "-"},
              {rowData?.secondaryContact?.contactNo || "-"}
            </span>
          </div>
        );
      case "address":
        return (
          <div className="flex flex-col">
            <span className="font-semibold">{rowData.address || "-"}</span>
            <span className="text-sm text-gray-400">
              {rowData.city || ""},{rowData?.state},{rowData?.country}
            </span>
          </div>
        );
      case "actions":
        return (
          <div className="relative flex justify-center items-center gap-2">
            <Dropdown>
              <DropdownTrigger>
                <Button isIconOnly size="sm" variant="light">
                  <EllipsisVertical />
                </Button>
              </DropdownTrigger>
              <DropdownMenu
                selectionMode="single"
                onSelectionChange={(e) => {
                  let item = Array.from(e)[0];
                  if (item === "paymentRegister") {
                    handleActionsPress(rowData);
                    onOpen();
                  } else if (item === "viewEstimate") {
                    handleViewEstimate(rowData);
                  }
                }}
              >
                <DropdownItem key="paymentRegister">
                  Add payment register
                </DropdownItem>
                <DropdownItem key="viewEstimate">View estimate</DropdownItem>
                <DropdownItem key="edit">Edit</DropdownItem>
                <DropdownItem key="delete" color="danger">
                  Delete
                </DropdownItem>
              </DropdownMenu>
            </Dropdown>
          </div>
        );
      default:
        return rowData[columnKey] || "-";
    }
  }, []);

  const onNextPage = React.useCallback(() => {
    if (page < pages) {
      setPage(page + 1);
    }
  }, [page, pages]);

  const onPreviousPage = React.useCallback(() => {
    if (page > 1) {
      setPage(page - 1);
    }
  }, [page]);

  const onRowsPerPageChange = React.useCallback((e) => {
    setRowsPerPage(Number(e.target.value));
    setPage(1);
  }, []);

  const onSearchChange = React.useCallback((value) => {
    if (value) {
      setFilterValue(value);
      setPage(1);
    } else {
      setFilterValue("");
    }
  }, []);

  const onClear = React.useCallback(() => {
    setFilterValue("");
    setPage(1);
  }, []);

  const actualPrice = watch("actualPrice");
  const quantity = watch("quantity");
  const gstPercent = watch("gstPercent");

  useEffect(() => {
    const formValues = getValues();
    let allValues = { ...formValues };

    const handleValuesChange = () => {
      const { actualPrice = 0, quantity = 0, gstPercent = 0 } = allValues;

      const safeNum = (val) => (isNaN(Number(val)) ? 0 : Number(val));

      const actualPriceNum = safeNum(actualPrice);
      const quantityNum = safeNum(quantity);
      const gstPercentNum = safeNum(gstPercent);
      const totalQuantityAmount = actualPriceNum * quantityNum;
      const gstAmount = (totalQuantityAmount * gstPercentNum) / 100;
      const totalAmount = totalQuantityAmount + gstAmount;
      setValue("gstAmount", gstAmount);
      setValue("totalPrice", totalAmount);
    };

    handleValuesChange();
  }, [actualPrice, quantity, gstPercent, setValue]);

  const externalVendorPrice = paymentForm.watch("price");
  const externalVendorQuantity = paymentForm.watch("quantity");
  const externalVendorGstPercent = paymentForm.watch("gstPercent");

  useEffect(() => {
    const formValues = paymentForm.getValues();
    let allValues = { ...formValues };

    const handleValuesChange = () => {
      const { price = 0, quantity = 0, gstPercent = 0 } = allValues;
      const safeNum = (val) => (isNaN(Number(val)) ? 0 : Number(val));
      const actualPriceNum = safeNum(price);
      const quantityNum = safeNum(quantity);
      const gstPercentNum = safeNum(gstPercent);
      const totalQuantityAmount =
        actualPriceNum * (quantityNum === 0 ? 1 : quantityNum);
      const gstAmount = (totalQuantityAmount * gstPercentNum) / 100;
      const totalAmount = totalQuantityAmount + gstAmount;
      paymentForm.setValue("gstAmount", gstAmount);
      paymentForm.setValue("totalAmount", totalAmount);
    };

    handleValuesChange();
  }, [
    externalVendorPrice,
    externalVendorQuantity,
    externalVendorGstPercent,
    paymentForm,
  ]);

  console.log(
    "dfjghsdgsjhgjgs",
    paymentFormSchema(isGst),
    paymentForm.getValues(),
  );

  const topContent = React.useMemo(() => {
    return (
      <div className="flex flex-col gap-4">
        <div className="flex justify-between gap-3 items-end">
          <Input
            isClearable
            className="w-full sm:max-w-[35%]"
            placeholder="Search ..."
            startContent={<Search />}
            value={filterValue}
            onClear={() => onClear()}
            onValueChange={onSearchChange}
          />
          <div className="flex gap-3">
            <Button
              endContent={<Plus />}
              color="primary"
              onPress={paymentModal.onOpen}
            >
              Add external vendor payment
            </Button>
            <Dropdown>
              <DropdownTrigger>
                <Button endContent={<ChevronDown />} variant="flat">
                  Columns
                </Button>
              </DropdownTrigger>
              <DropdownMenu
                disallowEmptySelection
                aria-label="Table Columns"
                closeOnSelect={false}
                selectedKeys={visibleColumns}
                selectionMode="multiple"
                onSelectionChange={setVisibleColumns}
              >
                {columns.map((column) => (
                  <DropdownItem key={column.uid} className="capitalize">
                    {capitalize(column.name)}
                  </DropdownItem>
                ))}
              </DropdownMenu>
            </Dropdown>
          </div>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-default-400 text-small">
            Total {count} vendor's estimate
          </span>
          <div className="flex gap-4">
            <label className="flex items-center text-default-400 text-small">
              Rows per page:
              <select
                className="bg-transparent outline-hidden text-default-400 text-small"
                onChange={onRowsPerPageChange}
                value={rowsPerPage}
              >
                <option value="15">15</option>
                <option value="25">25</option>
                <option value="50">50</option>
              </select>
            </label>
          </div>
        </div>
      </div>
    );
  }, [
    filterValue,
    visibleColumns,
    onRowsPerPageChange,
    count,
    onSearchChange,
    hasSearchFilter,
  ]);

  const bottomContent = React.useMemo(() => {
    return (
      <div className="py-2 px-2 flex justify-between items-center">
        <span className="w-[30%] text-small text-default-400">
          {selectedKeys === "all"
            ? "All items selected"
            : `${selectedKeys.size} of ${count} selected`}
        </span>
        <Pagination
          isCompact
          showControls
          showShadow
          color="primary"
          page={page}
          total={pages}
          onChange={setPage}
        />
        <div className="hidden sm:flex w-[30%] justify-end gap-2">
          <Button
            isDisabled={pages === 1}
            size="sm"
            variant="flat"
            onPress={onPreviousPage}
          >
            Previous
          </Button>
          <Button
            isDisabled={pages === 1}
            size="sm"
            variant="flat"
            onPress={onNextPage}
          >
            Next
          </Button>
        </div>
      </div>
    );
  }, [selectedKeys, count, page, pages, hasSearchFilter]);

  const onSubmit = (values) => {
    values.createdById = userId;
    values.leadId = rowItem?.leadId;
    values.estimateId = rowItem?.id;
    values.estimateNo = rowItem?.id;
    values.createVendorSubDto = [
      {
        name: values.serviceName,
        type: values.gstType,
        serviceFees: 0,
        serviceGstAmount: 0,
        serviceGstPercent: 0,
        quantity: values.quantity,
        totalPrice: values.totalPrice,
        gstAmount: values.gstAmount,
        actualPrice: values.actualPrice,
        productSubCategoryId: values.productSubCategoryId,
      },
    ];
    dispatch(createVendorsPayment(values))
      .then((resp) => {
        if (resp.meta.requestStatus === "fulfilled") {
          addToast({
            title: "Vandor payment registered successfully !.",
            color: "success",
          });
          onClose();
          reset(defaultValues);
        } else {
          addToast({ title: "Something went wrong !.", color: "danger" });
        }
      })
      .catch(() =>
        addToast({ title: "Something went wrong !.", color: "danger" }),
      );
  };

  const onExternalPaymentSubmit = (values) => {
    console.log("dfjghsdgsjhgjgs 22222222222", values);
    values.createdById = userId;
    dispatch(createExternalVendorsPayment(values))
      .then((resp) => {
        if (resp.meta.requestStatus === "fulfilled") {
          addToast({
            title: "Vandor payment registered successfully !.",
            color: "success",
          });
          paymentModal.onClose();
          paymentForm.reset(paymentFormDefaultValues);
        } else {
          addToast({ title: "Something went wrong !.", color: "danger" });
        }
      })
      .catch(() =>
        addToast({ title: "Something went wrong !.", color: "danger" }),
      );
  };

  return (
    <>
      <h1 className="font-sans text-2xl font-medium mb-1">
        Vendor's estimate list
      </h1>
      <Table
        isHeaderSticky
        aria-label="Example table with custom cells, pagination and sorting"
        bottomContent={bottomContent}
        bottomContentPlacement="outside"
        classNames={{
          wrapper: "max-h-[55vh] overflow-scroll",
        }}
        sortDescriptor={sortDescriptor}
        topContent={topContent}
        topContentPlacement="outside"
        onSelectionChange={setSelectedKeys}
        onSortChange={setSortDescriptor}
      >
        <TableHeader columns={headerColumns}>
          {(column) => (
            <TableColumn
              key={column.uid}
              align={column.uid === "actions" ? "center" : "start"}
              allowsSorting={column.sortable}
            >
              {column.name}
            </TableColumn>
          )}
        </TableHeader>
        <TableBody emptyContent={"No data found"} items={sortedItems}>
          {(item) => (
            <TableRow key={`${item.id}estimate`}>
              {(columnKey) => (
                <TableCell>{renderCell(item, columnKey)}</TableCell>
              )}
            </TableRow>
          )}
        </TableBody>
      </Table>
      <Modal
        isOpen={invoiceModal.isOpen}
        onOpenChange={invoiceModal.onOpenChange}
        size="5xl"
        placement="top-center"
        backdrop="blur"
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                Tax invoice
              </ModalHeader>
              <ModalBody>
                <TaxInvoice />
              </ModalBody>
              <ModalFooter>
                <Button color="danger" variant="light" onPress={onClose}>
                  Close
                </Button>
                <Button color="primary" onPress={onClose}>
                  Action
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
      <Modal
        size="5xl"
        isDismissable={false}
        isKeyboardDismissDisabled={true}
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        placement="top-center"
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader>Add payment details</ModalHeader>
              <ModalBody>
                <form
                  onSubmit={handleSubmit(onSubmit)}
                  className="flex flex-col gap-4"
                >
                  <div className="grid grid-cols-2 gap-4 max-h-[60vh] p-2 overflow-auto">
                    <Controller
                      name="serviceName"
                      control={control}
                      render={({ field, fieldState: { error } }) => (
                        <NewSelect
                          isRequired
                          label="Service name"
                          errorMessage={error?.message}
                          isInvalid={!!error}
                          data={urlList || []}
                          labelKey="urlsName"
                          valueKey="urlsName"
                          value={String(field.value)}
                          onChange={(value) => {
                            field.onChange(value);
                          }}
                        />
                      )}
                    />
                    <Controller
                      name="vendorCompanyName"
                      control={control}
                      render={({ field, fieldState: { error } }) => (
                        <Input
                          isRequired
                          label="Company name"
                          errorMessage={error?.message}
                          isInvalid={!!error}
                          value={field?.value}
                          onChange={(e) => {
                            const temp = e.target.value;
                            field.onChange(temp);
                          }}
                        />
                      )}
                    />
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
                            setIsGstMand(key === "Registered");
                            field.onChange(key);
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
                          isRequired={isGstMand}
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
                      name="name"
                      control={control}
                      render={({ field, fieldState: { error } }) => (
                        <Input
                          isRequired
                          label="Name"
                          errorMessage={error?.message}
                          isInvalid={!!error}
                          value={field?.value}
                          onChange={(e) => {
                            const temp = e.target.value;
                            field.onChange(temp);
                          }}
                        />
                      )}
                    />
                    <Controller
                      name="emails"
                      control={control}
                      render={({ field, fieldState: { error } }) => (
                        <Input
                          isRequired
                          label="Email"
                          errorMessage={error?.message}
                          isInvalid={!!error}
                          value={field?.value}
                          onChange={(e) => {
                            const temp = e.target.value;
                            field.onChange(temp);
                          }}
                        />
                      )}
                    />
                    <Controller
                      name="contactNo"
                      control={control}
                      render={({ field, fieldState: { error } }) => (
                        <Input
                          isRequired
                          label="Contact number"
                          errorMessage={error?.message}
                          isInvalid={!!error}
                          value={field?.value}
                          onChange={(e) => {
                            const temp = e.target.value;
                            field.onChange(temp);
                          }}
                        />
                      )}
                    />
                    <Controller
                      name="whatsappNo"
                      control={control}
                      render={({ field, fieldState: { error } }) => (
                        <Input
                          isRequired
                          label="Whatsapp number"
                          errorMessage={error?.message}
                          isInvalid={!!error}
                          value={field?.value}
                          onChange={(e) => {
                            const temp = e.target.value;
                            field.onChange(temp);
                          }}
                        />
                      )}
                    />

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
                        />
                      )}
                    />

                    <Controller
                      name="actualPrice"
                      control={control}
                      render={({ field, fieldState: { error } }) => {
                        return (
                          <Input
                            type="number"
                            startContent={<IndianRupee className="h-4 w-4" />}
                            isRequired
                            label="Actual price"
                            {...field}
                            onChange={(e) => {
                              field.onChange(Number(e.target.value));
                            }}
                          />
                        );
                      }}
                    />

                    <Controller
                      name="quantity"
                      control={control}
                      render={({ field, fieldState: { error } }) => (
                        <Input
                          isRequired
                          label="Quantity in kg"
                          type="number"
                          value={field.value}
                          onChange={(e) => {
                            field.onChange(Number(e.target.value));
                          }}
                        />
                      )}
                    />

                    <Controller
                      name="gstPercent"
                      control={control}
                      render={({ field, fieldState: { error } }) => (
                        <Input
                          isRequired
                          label="GST %"
                          endContent={<Percent className="h-4 w-4" />}
                          {...field}
                          onChange={(e) => {
                            field.onChange(e);
                          }}
                        />
                      )}
                    />

                    <Controller
                      name="gstAmount"
                      control={control}
                      render={({ field, fieldState: { error } }) => (
                        <Input
                          isRequired
                          isDisabled
                          label="GST amount (₹)"
                          value={field.value}
                          onChange={(e) => {
                            field.onChange(Number(e.target.value));
                          }}
                        />
                      )}
                    />

                    <Controller
                      name="totalPrice"
                      control={control}
                      render={({ field, fieldState: { error } }) => (
                        <Input
                          isRequired
                          label="Total price (₹)"
                          isDisabled
                          type="number"
                          startContent={<IndianRupee className="h-4 w-4" />}
                          value={field.value}
                          onChange={(e) => {
                            field.onChange(Number(e.target.value));
                          }}
                        />
                      )}
                    />

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
                      name="pinCode"
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

                    <Controller
                      name="createDate"
                      control={control}
                      render={({ field, fieldState: { error } }) => (
                        <DatePicker
                          isRequired
                          label="Create date"
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

                    <Controller
                      name="remarkByVendor"
                      control={control}
                      render={({ field, fieldState: { error } }) => (
                        <Input
                          isRequired
                          label="Remark by vendor"
                          errorMessage={error?.message}
                          isInvalid={!!error}
                          value={field?.value}
                          onChange={(e) => {
                            const temp = e.target.value;
                            field.onChange(temp);
                          }}
                        />
                      )}
                    />
                    <Controller
                      name="remark"
                      control={control}
                      render={({ field, fieldState: { error } }) => (
                        <Input
                          isRequired
                          label="Remark"
                          errorMessage={error?.message}
                          isInvalid={!!error}
                          value={field.value}
                          onChange={(e) => field.onChange(e.target.value)}
                        />
                      )}
                    />
                    <Controller
                      name="fileData"
                      control={control}
                      render={({ field, fieldState: { error } }) => (
                        <FileUploader
                          isRequired
                          uploadingType="multiple"
                          label="Document attachement"
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

                  <ModalFooter className="flex justify-end">
                    <Button onPress={onClose}>Cancel</Button>
                    <Button color="primary" type="submit">
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
        size="4xl"
        isDismissable={false}
        isKeyboardDismissDisabled={true}
        isOpen={viewModal.isOpen}
        onOpenChange={viewModal.onOpenChange}
        placement="top-center"
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader>Estimate</ModalHeader>
              <ModalBody className="max-h-[68vh] overflow-auto">
                <InvoiceView details={rowItem} />
              </ModalBody>
              <ModalFooter className="flex justify-end">
                <Button onPress={onClose}>Cancel</Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
      <Modal
        size="5xl"
        isDismissable={false}
        isKeyboardDismissDisabled={true}
        isOpen={paymentModal.isOpen}
        onOpenChange={paymentModal.onOpenChange}
        placement="top-center"
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader>Add external vendor payment details</ModalHeader>
              <ModalBody>
                <form
                  onSubmit={paymentForm.handleSubmit(onExternalPaymentSubmit)}
                  className="flex flex-col gap-4"
                >
                  <div className="grid grid-cols-2 gap-4 max-h-[60vh] p-2 overflow-auto">
                    <Controller
                      name="estimateNo"
                      control={paymentForm.control}
                      render={({ field, fieldState: { error } }) => (
                        <Input
                          isRequired
                          label="Estimate number"
                          errorMessage={error?.message}
                          isInvalid={!!error}
                          value={field?.value}
                          onChange={(e) => {
                            const temp = e.target.value;
                            field.onChange(temp);
                          }}
                        />
                      )}
                    />

                    <Controller
                      name="serviceName"
                      control={paymentForm.control}
                      render={({ field, fieldState: { error } }) => (
                        <Input
                          isRequired
                          label="Service name"
                          errorMessage={error?.message}
                          isInvalid={!!error}
                          value={field?.value}
                          onChange={(e) => {
                            const temp = e.target.value;
                            field.onChange(temp);
                          }}
                        />
                      )}
                    />
                    <Controller
                      name="vendorCompanyName"
                      control={paymentForm.control}
                      render={({ field, fieldState: { error } }) => (
                        <Input
                          isRequired
                          label="Company name"
                          errorMessage={error?.message}
                          isInvalid={!!error}
                          value={field?.value}
                          onChange={(e) => {
                            const temp = e.target.value;
                            field.onChange(temp);
                          }}
                        />
                      )}
                    />
                    <Controller
                      name="gstType"
                      control={paymentForm.control}
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
                            setIsGst(key === "Registered");
                            field.onChange(key);
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
                      control={paymentForm.control}
                      render={({ field, fieldState: { error } }) => (
                        <Input
                          isRequired={isGst}
                          label="GST number"
                          maxLength={15}
                          errorMessage={error?.message || gstError}
                          isInvalid={!!error || !!gstError}
                          value={field.value}
                          onChange={(e) => {
                            handleSetPaymentGstChange(e);
                          }}
                        />
                      )}
                    />
                    <Controller
                      name="name"
                      control={paymentForm.control}
                      render={({ field, fieldState: { error } }) => (
                        <Input
                          isRequired
                          label="Name"
                          errorMessage={error?.message}
                          isInvalid={!!error}
                          value={field?.value}
                          onChange={(e) => {
                            const temp = e.target.value;
                            field.onChange(temp);
                          }}
                        />
                      )}
                    />
                    <Controller
                      name="emails"
                      control={paymentForm.control}
                      render={({ field, fieldState: { error } }) => (
                        <Input
                          isRequired
                          label="Email"
                          errorMessage={error?.message}
                          isInvalid={!!error}
                          value={field?.value}
                          onChange={(e) => {
                            const temp = e.target.value;
                            field.onChange(temp);
                          }}
                        />
                      )}
                    />
                    <Controller
                      name="contactNo"
                      control={paymentForm.control}
                      render={({ field, fieldState: { error } }) => (
                        <Input
                          isRequired
                          label="Contact number"
                          errorMessage={error?.message}
                          isInvalid={!!error}
                          value={field?.value}
                          onChange={(e) => {
                            const temp = e.target.value;
                            field.onChange(temp);
                          }}
                        />
                      )}
                    />
                    <Controller
                      name="whatsappNo"
                      control={paymentForm.control}
                      render={({ field, fieldState: { error } }) => (
                        <Input
                          isRequired
                          label="Whatsapp number"
                          errorMessage={error?.message}
                          isInvalid={!!error}
                          value={field?.value}
                          onChange={(e) => {
                            const temp = e.target.value;
                            field.onChange(temp);
                          }}
                        />
                      )}
                    />

                    <Controller
                      name="price"
                      control={paymentForm.control}
                      render={({ field, fieldState: { error } }) => {
                        return (
                          <Input
                            type="number"
                            startContent={<IndianRupee className="h-4 w-4" />}
                            isRequired
                            label="Price"
                            {...field}
                            onChange={(e) => {
                              field.onChange(Number(e.target.value));
                            }}
                          />
                        );
                      }}
                    />

                    <Controller
                      name="quantity"
                      control={paymentForm.control}
                      render={({ field, fieldState: { error } }) => (
                        <Input
                          label="Quantity (in kg)"
                          type="number"
                          value={field.value}
                          onChange={(e) => {
                            field.onChange(Number(e.target.value));
                          }}
                        />
                      )}
                    />

                    <Controller
                      name="gstPercent"
                      control={paymentForm.control}
                      render={({ field, fieldState: { error } }) => (
                        <Input
                          isRequired
                          label="GST %"
                          endContent={<Percent className="h-4 w-4" />}
                          {...field}
                          onChange={(e) => {
                            field.onChange(e);
                          }}
                        />
                      )}
                    />

                    <Controller
                      name="gstAmount"
                      control={paymentForm.control}
                      render={({ field, fieldState: { error } }) => (
                        <Input
                          isRequired
                          isDisabled
                          label="GST amount (₹)"
                          value={field.value}
                          onChange={(e) => {
                            field.onChange(Number(e.target.value));
                          }}
                        />
                      )}
                    />

                    <Controller
                      name="totalAmount"
                      control={paymentForm.control}
                      render={({ field, fieldState: { error } }) => (
                        <Input
                          isRequired
                          label="Total amount (₹)"
                          isDisabled
                          type="number"
                          startContent={<IndianRupee className="h-4 w-4" />}
                          value={field.value}
                          onChange={(e) => {
                            field.onChange(Number(e.target.value));
                          }}
                        />
                      )}
                    />

                    <Controller
                      name="address"
                      control={paymentForm.control}
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
                      control={paymentForm.control}
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
                      control={paymentForm.control}
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
                            handleSetPaymentStateChange(value);
                          }}
                        />
                      )}
                    />

                    <Controller
                      name="city"
                      control={paymentForm.control}
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
                      name="pinCode"
                      control={paymentForm.control}
                      render={({ field, fieldState: { error } }) => (
                        <Input
                          label="Pin code"
                          errorMessage={error?.message}
                          isInvalid={!!error}
                          {...field}
                        />
                      )}
                    />

                    <Controller
                      name="createDate"
                      control={paymentForm.control}
                      render={({ field, fieldState: { error } }) => (
                        <DatePicker
                          isRequired
                          label="Create date"
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

                    <Controller
                      name="remarkByVendor"
                      control={paymentForm.control}
                      render={({ field, fieldState: { error } }) => (
                        <Input
                          isRequired
                          label="Remark by vendor"
                          errorMessage={error?.message}
                          isInvalid={!!error}
                          value={field?.value}
                          onChange={(e) => {
                            const temp = e.target.value;
                            field.onChange(temp);
                          }}
                        />
                      )}
                    />
                    <Controller
                      name="remark"
                      control={paymentForm.control}
                      render={({ field, fieldState: { error } }) => (
                        <Input
                          isRequired
                          label="Remark"
                          errorMessage={error?.message}
                          isInvalid={!!error}
                          value={field.value}
                          onChange={(e) => field.onChange(e.target.value)}
                        />
                      )}
                    />
                    <Controller
                      name="fileData"
                      control={paymentForm.control}
                      render={({ field, fieldState: { error } }) => (
                        <FileUploader
                          isRequired
                          uploadingType="multiple"
                          label="Document attachement"
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

                  <ModalFooter className="flex justify-end">
                    <Button onPress={onClose}>Cancel</Button>
                    <Button color="primary" type="submit">
                      Submit
                    </Button>
                  </ModalFooter>
                </form>
              </ModalBody>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
};

export default VendorEstimate;
