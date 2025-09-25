import {
  addToast,
  Avatar,
  Button,
  Chip,
  DatePicker,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Pagination,
  Select,
  SelectItem,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
  useDisclosure,
} from "@heroui/react";
import {
  ChevronDown,
  EllipsisVertical,
  Phone,
  Plus,
  Search,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useParams } from "react-router-dom";
import { Controller, useForm } from "react-hook-form";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  getAllEstimateByUserId,
  getTotalCountOfEstimate,
} from "../../toolkit/slices/leadSlice";
import dayjs from "dayjs";
import NewSelect from "../../components/NewSelect";
import { getAllUrlList } from "../../toolkit/slices/commonSlice";
import SingleFileUploader from "../../components/SingleFileUploader";
import { inrCurrency, paymentTermDays } from "../../common";
import {
  createPurchaseOrder,
  getPaymentDetailListByEstimateId,
  paymentRegisterRemainingAmount,
} from "../../toolkit/slices/accountSlice";
import { getLocalTimeZone, today } from "@internationalized/date";
import InvoiceView from "../../components/InvoiceView";

const columns = [
  { name: "ID", uid: "id" },
  { name: "PRODUCT NAME", uid: "productName", sortable: true },
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

const formSchema = z.object({
  paymentType: z.enum(["Fully", "Partial", "Milestone"], {
    required_error: "Company type is required",
  }),
  docPersent: z
    .number({
      required_error: "Document rate is required",
      invalid_type_error: "Document rate must be a number",
    })
    .min(0, "Document rate must be at least 0")
    .max(100, "Document rate cannot exceed 100"),
  filingPersent: z
    .number({
      required_error: "Filing rate is required",
      invalid_type_error: "Filing rate must be a number",
    })
    .min(0, "Filing rate must be at least 0")
    .max(100, "Filing rate cannot exceed 100"),
  liasoningPersent: z
    .number({
      required_error: "Liasoning rate is required",
      invalid_type_error: "Liasoning rate must be a number",
    })
    .min(0, "Liasoning rate must be at least 0")
    .max(100, "Liasoning rate cannot exceed 100"),
  certificatePersent: z
    .number({
      required_error: "Certificate rate is required",
      invalid_type_error: "Certificate rate must be a number",
    })
    .min(0, "Certificate rate must be at least 0")
    .max(100, "Certificate rate cannot exceed 100"),
  purchaseNumber: z.string().min(1, "PO number cannot be empty"),
  serviceName: z.string().min(1, "Service name cannot be empty"),
  purchaseAttach: z.string().optional(),
  approveDate: z.string().min(1, "Please enter approve date"),
  paymentTerm: z.string().min(1, "Please select the payment term"),
  comment: z.string().min(1, "Comment cannot be empty"),
  companyName: z.string().min(1, "Company name cannot be empty"),
  transactionId: z.string().min(1, "Transaction ID cannot be empty"),
  estimateNo: z.string().min(1, "Estimate number cannot be empty"),
  billingQuantity: z.number().min(0, "Billing quantity must be at least 0"),
  tdsPresent: z.boolean(),
  tdsPercent: z.number().min(1, "TDS percent must be at least 0"),
  professionalFees: z.number().min(1, "Professional fees must be at least 1"),
  profesionalGst: z.number().min(1, "Professional GST must be at least 0"),
  govermentfees: z.number().min(0, "Government fees must be at least 0"),
  govermentGst: z
    .number()
    .min(0, "Government GST must be at least 0")
    .max(100, "Government GST cannot exceed 100"),
  serviceCharge: z.number().min(0, "Service charge must be at least 0"),
  serviceGst: z
    .number()
    .min(0, "Service GST must be at least 0")
    .max(100, "Service GST cannot exceed 100"),
  otherFees: z.number().min(0, "Other fees must be at least 0"),
  otherGst: z
    .number()
    .min(0, "Other GST must be at least 0")
    .max(100, "Other GST cannot exceed 100"),
  totalAmount: z.number().min(0, "Total amount must be at least 0"),
  paymentDate: z.string().min(1, "Please enter payment date"),
  remark: z.string().min(1, "Remark cannot be empty"),
  doc: z.string().optional(),
});

const defaultValues = {
  paymentType: "",
  docPersent: "",
  filingPersent: 0,
  liasoningPersent: 0,
  certificatePersent: 0,
  purchaseNumber: "",
  serviceName: "",
  purchaseAttach: "",
  approveDate: "",
  paymentTerm: "",
  comment: "",
  companyName: "",
  transactionId: "",
  estimateNo: "",
  billingQuantity: "",
  tdsPresent: "",
  tdsPercent: 0,
  professionalFees: 0,
  profesionalGst: 0,
  govermentfees: 0,
  govermentGst: 0,
  serviceCharge: 0,
  serviceGst: 0,
  otherFees: 0,
  otherGst: 0,
  totalAmount: 0,
  paymentDate: "",
  remark: "",
  doc: "",
};

const Estimate = () => {
  const dispatch = useDispatch();
  const { userId } = useParams();
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const viewModal = useDisclosure();
  const count = useSelector((state) => state.leads.totalEstimateCount);
  const data = useSelector((state) => state.leads.estimateList);
  const urlList = useSelector((state) => state.common.urlList);
  const paymentList = useSelector((state) => state.account.estimatePaymentList);
  const remainingAmountDetail = useSelector(
    (state) => state.account.remainingAmountDetail
  );
  const [filterValue, setFilterValue] = useState("");
  const [selectedKeys, setSelectedKeys] = useState(new Set([]));
  const [paymentType, setPaymentType] = useState("");
  const [isMilestone, setIsMilestone] = useState(false);
  const [paymentSelectionType, setPaymentSelectionType] =
    useState("Payment register");
  const [visibleColumns, setVisibleColumns] = useState(
    new Set(INITIAL_VISIBLE_COLUMNS)
  );
  const [sortDescriptor, setSortDescriptor] = useState({
    column: "age",
    direction: "ascending",
  });
  const [filteration, setFilteration] = useState({
    page: 1,
    size: 50,
  });
  const [rowItem, setRowItem] = useState(null);

  const hasSearchFilter = Boolean(filterValue);

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
    getValues,
  } = useForm({
    resolver: zodResolver(formSchema),
    defaultValues,
  });

  useEffect(() => {
    dispatch(getAllEstimateByUserId(userId));
    dispatch(getTotalCountOfEstimate(userId));
    dispatch(getAllUrlList());
  }, [dispatch, userId]);

  const headerColumns = useMemo(() => {
    if (visibleColumns === "all") return columns;
    return columns.filter((column) =>
      Array.from(visibleColumns).includes(column.uid)
    );
  }, [visibleColumns]);

  const filteredItems = useMemo(() => {
    let filteredData = [...data];
    if (hasSearchFilter) {
      filteredData = filteredData.filter((item) =>
        item?.productName?.toLowerCase().includes(filterValue.toLowerCase())
      );
    }
    return filteredData;
  }, [data, filterValue]);

  const pages = Math.ceil(count / filteration?.size) || 1;

  const items = useMemo(() => {
    const start = (filteration?.page - 1) * filteration?.size;
    const end = start + filteration?.size;
    return filteredItems.slice(start, end);
  }, [filteration, filteredItems]);

  const sortedItems = useMemo(() => {
    return [...items].sort((a, b) => {
      const first = a[sortDescriptor.column];
      const second = b[sortDescriptor.column];
      const cmp = first < second ? -1 : first > second ? 1 : 0;
      return sortDescriptor.direction === "descending" ? -cmp : cmp;
    });
  }, [sortDescriptor, items]);

  const handleViewEstimate = (rowData) => {
    setRowItem(rowData);
    viewModal.onOpen();
  };

  useEffect(() => {
    if (!remainingAmountDetail?.primary) {
      reset({
        professionalFees: remainingAmountDetail?.proffees,
        govermentFees: remainingAmountDetail?.govfees,
        otherFees: remainingAmountDetail?.otherFees,
        serviceCharge: remainingAmountDetail?.serviceCharge,
      });
    }
  }, [remainingAmountDetail, reset]);

  const handleSetPayment = useCallback(
    (e) => {
      if (e === "Partial") {
        reset({
          professionalFees: rowItem?.professionalFees / 2,
          govermentFees: rowItem?.govermentFees / 2,
          otherFees: rowItem?.otherFees / 2,
          serviceCharge: rowItem?.serviceCharge / 2,
        });
      }
      if (e === "Fully") {
        reset({
          professionalFees: rowItem?.professionalFees,
          govermentFees: rowItem?.govermentFees,
          otherFees: rowItem?.otherFees,
          serviceCharge: rowItem?.serviceCharge,
        });
      }
    },
    [rowItem, reset]
  );

  const handleActionsPress = (rowItem) => {
    setRowItem(rowItem);
    dispatch(getPaymentDetailListByEstimateId(rowItem?.id));
    dispatch(paymentRegisterRemainingAmount(rowItem?.id));
    const values = getValues();
    reset({
      ...values,
      serviceName: rowItem?.productName,
      profesionalGst: rowItem?.profesionalGst ? rowItem?.profesionalGst : 0,
      companyName: rowItem?.companyName,
      govermentGst: rowItem?.govermentGst ? rowItem?.govermentGst : 0,
      serviceGst: rowItem?.serviceGst ? rowItem?.serviceGst : 0,
      otherGst: rowItem?.otherGst ? rowItem?.otherGst : 0,
    });
    onOpen();
  };

  const onSubmit = (data) => {
    data.createdById = userId;
    data.leadId = rowItem?.leadId;
    data.estimateId = rowItem?.id;
    dispatch(createPurchaseOrder(data))
      .then((response) => {
        if (response.meta.requestStatus === "fulfilled") {
          addToast({
            title: "Payment registered successfully !.",
            color: "success",
          });
          dispatch(getAllEstimateByUserId(userId));
          dispatch(getTotalCountOfEstimate(userId));
          reset(defaultValues);
          onOpenChange(false);
        } else {
          addToast({
            title: "Something went wrong !.",
            color: "danger",
          });
        }
      })
      .catch(() => {
        addToast({
          title: "Something went wrong !.",
          color: "danger",
        });
      });
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
              {inrCurrency(rowData?.professionalFees) || "-"}
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
              {inrCurrency(rowData?.govermentfees) || "-"}
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
              {inrCurrency(rowData?.serviceCharge) || "-"}
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
              {inrCurrency(rowData?.otherFees) || "-"}
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

  const onNextPage = useCallback(() => {
    if (filteration?.page < pages) {
      setFilteration((prev) => ({ ...prev, page: prev.page + 1 }));
    }
  }, [filteration, pages]);

  const onPreviousPage = useCallback(() => {
    if (filteration?.page > 1) {
      setFilteration((prev) => ({ ...prev, page: prev.page - 1 }));
    }
  }, [filteration]);

  const onRowsPerPageChange = useCallback((e) => {
    setFilteration((prev) => ({
      ...prev,
      size: Number(e.target.value),
      page: 1,
    }));
  }, []);

  const onSearchChange = useCallback((value) => {
    if (value) {
      setFilterValue(value);
      setFilteration((prev) => ({ ...prev, page: 1 }));
    } else {
      setFilterValue("");
    }
  }, []);

  const onClear = useCallback(() => {
    setFilterValue("");
    setFilteration((prev) => ({ ...prev, page: 1 }));
  }, []);

  const topContent = useMemo(() => {
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
            <Dropdown>
              <DropdownTrigger className="hidden sm:flex">
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
            Total {count} estimate
          </span>
          <label className="flex items-center text-default-400 text-small">
            Rows per page:
            <select
              className="bg-transparent outline-none text-default-400 text-small"
              onChange={onRowsPerPageChange}
              value={filteration?.size}
            >
              <option value="5">5</option>
              <option value="15">15</option>
              <option value="25">25</option>
              <option value="50">50</option>
            </select>
          </label>
        </div>
      </div>
    );
  }, [filterValue, visibleColumns, onRowsPerPageChange, count, onSearchChange]);

  const bottomContent = useMemo(() => {
    return (
      <div className="py-2 px-2 flex justify-between items-center">
        <span className="w-[30%] text-small text-default-400">
          {selectedKeys === "all"
            ? "All items selected"
            : `${selectedKeys.size} of ${filteredItems.length} selected`}
        </span>
        <Pagination
          isCompact
          showControls
          showShadow
          color="primary"
          page={filteration?.page}
          total={pages}
          onChange={(e) => {
            setFilteration((prev) => ({ ...prev, page: e }));
          }}
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
  }, [
    selectedKeys,
    items.length,
    filteration,
    pages,
    onPreviousPage,
    onNextPage,
    dispatch,
  ]);

  return (
    <>
      <h1 className="font-sans text-2xl font-medium mb-1">Estimate list</h1>
      <Table
        isHeaderSticky
        aria-label="Users table with custom cells, pagination, and sorting"
        bottomContent={bottomContent}
        bottomContentPlacement="outside"
        classNames={{
          wrapper: "max-h-[65vh] max-w-full",
        }}
        selectedKeys={selectedKeys}
        selectionMode="multiple"
        sortDescriptor={sortDescriptor}
        topContent={topContent}
        topContentPlacement="outside"
        onSelectionChange={(keys) => {
          setSelectedKeys(keys);
        }}
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
            <TableRow key={item.id || item.companyId}>
              {(columnKey) => (
                <TableCell>{renderCell(item, columnKey)}</TableCell>
              )}
            </TableRow>
          )}
        </TableBody>
      </Table>
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
                <div className="my-3 flex justify-between px-3">
                  <div className="flex flex-col">
                    <h5 className="font-medium text-medium">
                      Total paid amount
                    </h5>
                    {paymentList?.map((item, idx) => (
                      <p className="text-sm" key={`paym${idx}`}>
                        Payment {idx + 1} : {item?.totalAmount}
                      </p>
                    ))}
                  </div>

                  <h5 className="font-medium text-medium">
                    Total amount : {rowItem?.totalAmount}
                  </h5>
                </div>
                <form
                  onSubmit={handleSubmit(onSubmit)}
                  className="flex flex-col gap-4"
                >
                  <div className="grid grid-cols-2 gap-4 max-h-[60vh] p-2 overflow-auto">
                    {remainingAmountDetail?.primary && (
                      <Controller
                        name="paymentType"
                        control={control}
                        defaultValue={[]}
                        render={({ field }) => (
                          <Select
                            isRequired
                            label="Payment type"
                            {...field}
                            selectedKeys={[field.value]}
                            onSelectionChange={(e) => {
                              let key = Array.from(e)[0];
                              setPaymentType(key);
                              setIsMilestone(key === "Milestone");
                              handleSetPayment(key);
                              field.onChange(key);
                            }}
                            items={[
                              { label: "Fully", key: "Fully" },
                              { label: "Partial", key: "Partial" },
                              { label: "Milestone", key: "Milestone" },
                            ]}
                          >
                            {(item) => (
                              <SelectItem key={item.key}>
                                {item.label}
                              </SelectItem>
                            )}
                          </Select>
                        )}
                      />
                    )}

                    {isMilestone && (
                      <Controller
                        name="docPersent"
                        control={control}
                        render={({ field, fieldState: { error } }) => (
                          <Input
                            isRequired
                            label="Document rate %"
                            errorMessage={error?.message}
                            isInvalid={!!error}
                            {...field}
                          />
                        )}
                      />
                    )}
                    {isMilestone && (
                      <Controller
                        name="filingPersent"
                        control={control}
                        render={({ field, fieldState: { error } }) => (
                          <Input
                            isRequired
                            label="Filing rate %"
                            errorMessage={error?.message}
                            isInvalid={!!error}
                            {...field}
                          />
                        )}
                      />
                    )}
                    {isMilestone && (
                      <Controller
                        name="liasoningPersent"
                        control={control}
                        render={({ field, fieldState: { error } }) => (
                          <Input
                            isRequired
                            label="Liasoning rate %"
                            errorMessage={error?.message}
                            isInvalid={!!error}
                            {...field}
                          />
                        )}
                      />
                    )}
                    {isMilestone && (
                      <Controller
                        name="certificatePersent"
                        control={control}
                        render={({ field, fieldState: { error } }) => (
                          <Input
                            isRequired
                            label="Certificate rate %"
                            errorMessage={error?.message}
                            isInvalid={!!error}
                            {...field}
                          />
                        )}
                      />
                    )}

                    <Select
                      isRequired
                      label="Payment selection type"
                      selectedKeys={[paymentSelectionType]}
                      onSelectionChange={(e) => {
                        setPaymentSelectionType(Array.from(e)[0]);
                      }}
                      items={[
                        { label: "Purchase order", key: "Purchase order" },
                        {
                          label: "Payment register",
                          key: "Payment register",
                        },
                      ]}
                    >
                      {(item) => (
                        <SelectItem key={item.key}>{item.label}</SelectItem>
                      )}
                    </Select>

                    {paymentSelectionType === "Purchase order" ? (
                      <>
                        <Controller
                          name="purchaseNumber"
                          control={control}
                          render={({ field, fieldState: { error } }) => (
                            <Input
                              isRequired
                              label="PO number"
                              errorMessage={error?.message}
                              isInvalid={!!error}
                              {...field}
                            />
                          )}
                        />
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
                              valueKey="id"
                              value={field.value}
                              onChange={(value) => {
                                field.onChange(value);
                              }}
                            />
                          )}
                        />
                        <Controller
                          name="purchaseAttach"
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
                        <Controller
                          name="approveDate"
                          control={control}
                          render={({ field, fieldState: { error } }) => (
                            <DatePicker
                              isRequired
                              label="Approved date"
                              showMonthAndYearPickers
                              maxValue={today(getLocalTimeZone())}
                              errorMessage={error?.message}
                              isInvalid={!!error}
                              value={
                                field.value ? parseDate(field.value) : null
                              }
                              onChange={(e) =>
                                field.onChange(toCalendarDate(e).toString())
                              }
                            />
                          )}
                        />
                        <Controller
                          name="paymentTerm"
                          control={control}
                          defaultValue={[]}
                          render={({ field }) => (
                            <Select
                              isRequired
                              label="Payment term"
                              {...field}
                              selectedKeys={[field.value]}
                              onSelectionChange={(e) => {
                                field.onChange(Array.from(e)[0]);
                              }}
                              items={paymentTermDays || []}
                            >
                              {(item) => (
                                <SelectItem key={item.key}>
                                  {item.label}
                                </SelectItem>
                              )}
                            </Select>
                          )}
                        />

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
                      </>
                    ) : (
                      <>
                        <Controller
                          name="companyName"
                          control={control}
                          render={({ field, fieldState: { error } }) => (
                            <Input
                              isRequired
                              isDisabled
                              label="Company name"
                              errorMessage={error?.message}
                              isInvalid={!!error}
                              {...field}
                            />
                          )}
                        />
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
                              valueKey="id"
                              value={field.value}
                              onChange={(value) => {
                                field.onChange(value);
                              }}
                            />
                          )}
                        />

                        <Controller
                          name="transactionId"
                          control={control}
                          render={({ field, fieldState: { error } }) => (
                            <Input
                              isRequired
                              label="Transaction Id"
                              errorMessage={error?.message}
                              isInvalid={!!error}
                              {...field}
                            />
                          )}
                        />
                        <Controller
                          name="estimateNo"
                          control={control}
                          render={({ field, fieldState: { error } }) => (
                            <Input
                              isRequired
                              label="Estimate number"
                              errorMessage={error?.message}
                              isInvalid={!!error}
                              {...field}
                            />
                          )}
                        />
                        <Controller
                          name="billingQuantity"
                          control={control}
                          render={({ field, fieldState: { error } }) => (
                            <Input
                              isRequired
                              label="Billing quantity"
                              errorMessage={error?.message}
                              isInvalid={!!error}
                              {...field}
                            />
                          )}
                        />

                        <Controller
                          name="tdsPresent"
                          control={control}
                          render={({ field, fieldState: { error } }) => (
                            <Select
                              isRequired={true}
                              label="TDS present"
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
                                <SelectItem key={item.key}>
                                  {item.label}
                                </SelectItem>
                              )}
                            </Select>
                          )}
                        />

                        <Controller
                          name="tdsPercent"
                          control={control}
                          render={({ field, fieldState: { error } }) => (
                            <Input
                              isRequired
                              label="TDS percent %"
                              errorMessage={error?.message}
                              isInvalid={!!error}
                              {...field}
                            />
                          )}
                        />
                        <Controller
                          name="professionalFees"
                          control={control}
                          render={({ field, fieldState: { error } }) => (
                            <Input
                              isRequired
                              label="Professional fees"
                              errorMessage={error?.message}
                              isInvalid={!!error}
                              {...field}
                              isDisabled={
                                paymentType === "Partial" ||
                                paymentType === "Fully"
                              }
                              type="number"
                            />
                          )}
                        />
                        <Controller
                          name="profesionalGst"
                          control={control}
                          render={({ field, fieldState: { error } }) => (
                            <Input
                              isRequired
                              label="Professional GST %"
                              errorMessage={error?.message}
                              isInvalid={!!error}
                              {...field}
                              isDisabled
                              type="number"
                            />
                          )}
                        />
                        <Controller
                          name="govermentfees"
                          control={control}
                          render={({ field, fieldState: { error } }) => (
                            <Input
                              isRequired
                              label="Government fees"
                              errorMessage={error?.message}
                              isInvalid={!!error}
                              {...field}
                              isDisabled={
                                paymentType === "Partial" ||
                                paymentType === "Fully"
                              }
                              type="number"
                            />
                          )}
                        />
                        <Controller
                          name="govermentGst"
                          control={control}
                          render={({ field, fieldState: { error } }) => (
                            <Input
                              isRequired
                              label="Government GST %"
                              errorMessage={error?.message}
                              isInvalid={!!error}
                              {...field}
                              isDisabled
                              type="number"
                            />
                          )}
                        />
                        <Controller
                          name="serviceCharge"
                          control={control}
                          render={({ field, fieldState: { error } }) => (
                            <Input
                              isRequired
                              label="Service charge"
                              errorMessage={error?.message}
                              isInvalid={!!error}
                              isDisabled={
                                paymentType === "Partial" ||
                                paymentType === "Fully"
                              }
                              {...field}
                              type="number"
                            />
                          )}
                        />
                        <Controller
                          name="serviceGst"
                          control={control}
                          render={({ field, fieldState: { error } }) => (
                            <Input
                              isRequired
                              label="Service GST %"
                              errorMessage={error?.message}
                              isInvalid={!!error}
                              {...field}
                              isDisabled
                              type="number"
                            />
                          )}
                        />
                        <Controller
                          name="otherFees"
                          control={control}
                          render={({ field, fieldState: { error } }) => (
                            <Input
                              isRequired
                              label="Other fees"
                              errorMessage={error?.message}
                              isInvalid={!!error}
                              isDisabled={
                                paymentType === "Partial" ||
                                paymentType === "Fully"
                              }
                              {...field}
                              type="number"
                            />
                          )}
                        />
                        <Controller
                          name="otherGst"
                          control={control}
                          render={({ field, fieldState: { error } }) => (
                            <Input
                              isRequired
                              isDisabled
                              label="Other GST %"
                              errorMessage={error?.message}
                              isInvalid={!!error}
                              {...field}
                              type="number"
                            />
                          )}
                        />
                        <Controller
                          name="totalAmount"
                          control={control}
                          render={({ field, fieldState: { error } }) => (
                            <Input
                              isRequired
                              label="Total amount"
                              errorMessage={error?.message}
                              isInvalid={!!error}
                              {...field}
                              isDisabled
                              type="number"
                            />
                          )}
                        />
                        <Controller
                          name="paymentDate"
                          control={control}
                          render={({ field, fieldState: { error } }) => (
                            <DatePicker
                              isRequired
                              label="Payment date"
                              showMonthAndYearPickers
                              maxValue={today(getLocalTimeZone())}
                              errorMessage={error?.message}
                              isInvalid={!!error}
                              value={
                                field.value ? parseDate(field.value) : null
                              }
                              onChange={(e) =>
                                field.onChange(toCalendarDate(e).toString())
                              }
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
                              {...field}
                            />
                          )}
                        />
                        <Controller
                          name="doc"
                          control={control}
                          render={({ field, fieldState: { error } }) => (
                            <SingleFileUploader
                              isRequired
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
                      </>
                    )}
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
              <ModalBody className="max-h-[70vh] overflow-auto">
                <InvoiceView details={rowItem} />
              </ModalBody>
              <ModalFooter className="flex justify-end">
                <Button onPress={onClose}>Cancel</Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
};

export default Estimate;
