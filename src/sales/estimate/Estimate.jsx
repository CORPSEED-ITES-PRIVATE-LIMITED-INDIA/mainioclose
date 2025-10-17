import {
  addToast,
  Button,
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
import { ChevronDown, EllipsisVertical, Search } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
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
  createPaymentRegister,
  createPurchaseOrder,
  getPaymentDetailListByEstimateId,
  paymentRegisterRemainingAmount,
} from "../../toolkit/slices/accountSlice";
import {
  getLocalTimeZone,
  parseDate,
  toCalendarDate,
  today,
} from "@internationalized/date";
import InvoiceView from "../../components/InvoiceView";
import FileUploader from "../../components/FileUploader";

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

const formSchema = ({ isPrimary, isMilestone, isPurchaseOrder, isTDS }) =>
  z.object({
    ...(isPrimary
      ? {
          paymentType: z.string().min(1, "please select the payment type."),
        }
      : {}),
    ...(isMilestone
      ? {
          docPersent: z.number(),
          filingPersent: z.number(),
          liasoningPersent: z.number(),
          certificatePersent: z.number(),
        }
      : {}),
    ...(isPurchaseOrder
      ? {
          purchaseNumber: z.string().min(1, "PO number cannot be empty"),
          serviceName: z.string().min(1, "Service name cannot be empty"),
          purchaseAttach: z.string().optional(),
          approveDate: z.string().min(1, "Please enter approve date"),
          paymentTerm: z.string().min(1, "Please select the payment term"),
          comment: z.string().min(1, "Comment cannot be empty"),
        }
      : {
          companyName: z.string().min(1, "Company name cannot be empty"),
          serviceName: z.string().min(1, "Service name cannot be empty"),
          transactionId: z.string().min(1, "Transaction ID cannot be empty"),
          estimateNo: z.string().min(1, "Estimate number cannot be empty"),
          billingQuantity: z.number(),
          tdsPresent: z.boolean(),
          ...(isTDS
            ? {
                tdsPercent: z.string().min(1, "TDS percent must be at least 0"),
              }
            : {}),
          professionalFees: z.number(),
          profesionalGst: z.number(),
          govermentfees: z.number(),
          govermentGst: z.number(),
          serviceCharge: z.number(),
          serviceGst: z.number(),
          otherFees: z.number(),
          otherGst: z.number(),
          totalAmount: z.number(),
          paymentDate: z.string().min(1, "Please enter payment date"),
          remark: z.string().min(1, "Remark cannot be empty"),
          doc: z.array(z.string()).optional(),
          termOfDelivery: z.string().min(1, "Delivery terms cannot be empty"),
        }),
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
  billingQuantity: 0,
  tdsPercent: "0", // This is z.string(), so string is fine
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
  termOfDelivery: "",
};

const Estimate = () => {
  const dispatch = useDispatch();
  const { userId } = useParams();
  const { isOpen, onOpen, onClose, onOpenChange } = useDisclosure();
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
  const [isTDS, setIsTDS] = useState(false);
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
  const [gstsAmount, setGstsAmount] = useState({
    govermentGstPercent: 0,
    profesionalGstPercent: 0,
    serviceGstPercent: 0,
    otherGstPercent: 0,
  });

  const hasSearchFilter = Boolean(filterValue);

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
    getValues,
    setValue,
    watch,
  } = useForm({
    resolver: zodResolver(
      formSchema({
        isPrimary: remainingAmountDetail?.primary,
        isMilestone,
        isPurchaseOrder: paymentSelectionType === "Purchase order",
        isTDS,
      })
    ),
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

  const sortedItems = useMemo(() => {
    return [...filteredItems].sort((a, b) => {
      const first = a[sortDescriptor.column];
      const second = b[sortDescriptor.column];
      const cmp = first < second ? -1 : first > second ? 1 : 0;
      return sortDescriptor.direction === "descending" ? -cmp : cmp;
    });
  }, [sortDescriptor, filteredItems]);

  const handleViewEstimate = (rowData) => {
    setRowItem(rowData);
    viewModal.onOpen();
  };

  useEffect(() => {
    if (!remainingAmountDetail?.primary) {
      const formValues = getValues();
      let updatedValues = { ...formValues };

      const safeNum = (val) => (isNaN(Number(val)) ? 0 : Number(val));

      updatedValues = {
        ...updatedValues,
        professionalFees: safeNum(remainingAmountDetail?.proffees),
        govermentFees: safeNum(remainingAmountDetail?.govfees),
        otherFees: safeNum(remainingAmountDetail?.otherFees),
        serviceCharge: safeNum(remainingAmountDetail?.serviceCharge),
      };

      reset(updatedValues);
    }
  }, [remainingAmountDetail, reset, getValues]);

  const handleSetPayment = useCallback(
    (e) => {
      const values = getValues();
      let updatedValues = { ...values };

      const safeNum = (val) => (isNaN(Number(val)) ? 0 : Number(val));

      const professionalFees = safeNum(rowItem?.professionalFees);
      const govermentfees = safeNum(rowItem?.govermentfees);
      const otherFees = safeNum(rowItem?.otherFees);
      const serviceCharge = safeNum(rowItem?.serviceCharge);

      if (e === "Partial") {
        updatedValues = {
          ...updatedValues,
          professionalFees: professionalFees / 2,
          govermentfees: govermentfees / 2,
          otherFees: otherFees / 2,
          serviceCharge: serviceCharge / 2,
        };
      }

      if (e === "Fully") {
        updatedValues = {
          ...updatedValues,
          professionalFees,
          govermentfees,
          otherFees,
          serviceCharge,
        };
      }

      reset(updatedValues);
    },
    [rowItem, reset]
  );

  const handleActionsPress = (rowItem) => {
    setRowItem(rowItem);
    dispatch(getPaymentDetailListByEstimateId(rowItem?.id));
    dispatch(paymentRegisterRemainingAmount(rowItem?.id)).then((resp) => {
      if (resp.meta.requestStatus === "fulfilled") {
        const temData = resp.payload;
        const safeNum = (val) => (isNaN(Number(val)) ? 0 : Number(val));

        const updatedValues = {
          ...defaultValues,
          serviceName: rowItem?.productName || "",
          profesionalGst: safeNum(rowItem?.profesionalGst),
          companyName: rowItem?.companyName || "",
          govermentGst: safeNum(rowItem?.govermentGst),
          serviceGst: safeNum(rowItem?.serviceGst),
          otherGst: safeNum(rowItem?.otherGst),
        };

        if (!temData?.primary) {
          updatedValues.professionalFees = safeNum(temData?.proffees);
          updatedValues.govermentfees = safeNum(temData?.govfees);
          updatedValues.otherFees = safeNum(temData?.otherFees);
          updatedValues.serviceCharge = safeNum(temData?.serviceCharge);
          updatedValues.totalAmount = safeNum(temData?.totalAmount);
        }

        reset(updatedValues);
        onOpen();
      }
    });
  };

  useEffect(() => {
    const formValues = getValues();
    let allValues = { ...formValues };

    const handleValuesChange = () => {
      const {
        professionalFees = 0,
        profesionalGst = 0,
        govermentfees = 0,
        govermentGst = 0,
        serviceCharge = 0,
        serviceGst = 0,
        otherFees = 0,
        otherGst = 0,
      } = allValues;

      const safeNum = (val) => (isNaN(Number(val)) ? 0 : Number(val));

      const professionalFeesNum = safeNum(professionalFees);
      const profesionalGstNum = safeNum(profesionalGst);
      const govermentfeesNum = safeNum(govermentfees);
      const govermentGstNum = safeNum(govermentGst);
      const serviceChargeNum = safeNum(serviceCharge);
      const serviceGstNum = safeNum(serviceGst);
      const otherFeesNum = safeNum(otherFees);
      const otherGstNum = safeNum(otherGst);

      const professionalGstAmount =
        (professionalFeesNum * profesionalGstNum) / 100;
      const professionalTotal = professionalFeesNum + professionalGstAmount;

      const governmentGstAmount = (govermentfeesNum * govermentGstNum) / 100;
      const governmentTotal = govermentfeesNum + governmentGstAmount;

      const serviceGstAmount = (serviceChargeNum * serviceGstNum) / 100;
      const serviceTotal = serviceChargeNum + serviceGstAmount;

      const otherGstAmount = (otherFeesNum * otherGstNum) / 100;
      const otherTotal = otherFeesNum + otherGstAmount;

      const totalAmount =
        professionalTotal + governmentTotal + serviceTotal + otherTotal;

      setValue("totalAmount", totalAmount);
      setGstsAmount((prev) => ({
        ...prev,
        serviceGstPercent: serviceGstAmount,
        otherGstPercent: otherGstAmount,
        govermentGstPercent: governmentGstAmount,
        profesionalGstPercent: professionalGstAmount,
      }));
    };

    handleValuesChange();
  }, [getValues, paymentType]);

  const onSubmit = useCallback(
    (values) => {
      values.leadId = rowItem?.leadId;
      values.createdById = userId;
      values.estimateId = rowItem?.id;
      values.productType = rowItem?.productType;
      if (paymentSelectionType === "Purchase order") {
        values.purchaseAttach = values?.purchaseAttach?.map(
          (item) => item?.response
        );
        dispatch(createPurchaseOrder(values))
          .then((response) => {
            if (response.meta.requestStatus === "fulfilled") {
              addToast({
                title: "Payment registered successfully !.",
                color: "success",
              });
              dispatch(getAllEstimateByUserId(userId));
              dispatch(getTotalCountOfEstimate(userId));
              reset(defaultValues);
              onClose();
              setRowItem(null);
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
      } else if (paymentSelectionType === "Payment register") {
        values.paymentType = values.paymentType
          ? values.paymentType
          : remainingAmountDetail?.paymentType;
        let obj = { ...values, ...gstsAmount, estimateId: rowItem?.id };
        dispatch(createPaymentRegister(obj))
          .then((resp) => {
            if (resp.meta.requestStatus === "fulfilled") {
              addToast({
                title: "Payment registered successfully !.",
                color: "success",
              });
              onClose();
              reset(defaultValues);
              setRowItem(null);
            } else {
              addToast({ title: "Something went wrong !.", color: "danger" });
            }
          })
          .catch(() =>
            addToast({ title: "Something went wrong !.", color: "danger" })
          );
      }
    },
    [reset, dispatch, rowItem, gstsAmount, remainingAmountDetail]
  );

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
            : `${selectedKeys.size} of ${count} selected`}
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
    count,
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
          wrapper: "max-h-[65vh] w-full",
          table:'w-full'
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
                        Payment {idx + 1} : {inrCurrency(item?.totalAmount)}
                      </p>
                    ))}
                  </div>

                  <h5 className="font-medium text-medium">
                    Total amount : {inrCurrency(rowItem?.totalAmount)}
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
                        render={({ field }) => {
                          return (
                            <Select
                              isRequired
                              label="Payment type"
                              selectionMode="single"
                              selectedKeys={[field.value]}
                              onSelectionChange={(e) => {
                                let key = Array.from(e)[0];
                                field.onChange(key);
                                setPaymentType(key);
                                setIsMilestone(key === "Milestone");
                                handleSetPayment(key);
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
                          );
                        }}
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
                            value={Number(field?.value)}
                            type="number"
                            onChange={(e) => {
                              const temp = e.target.value;
                              field.onChange(Number(temp));
                            }}
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
                            value={Number(field?.value)}
                            type="number"
                            onChange={(e) => {
                              const temp = e.target.value;
                              field.onChange(Number(temp));
                            }}
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
                            value={Number(field?.value)}
                            type="number"
                            onChange={(e) => {
                              const temp = e.target.value;
                              field.onChange(Number(temp));
                            }}
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
                            value={Number(field?.value)}
                            type="number"
                            onChange={(e) => {
                              const temp = e.target.value;
                              field.onChange(Number(temp));
                            }}
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
                              value={field?.value}
                              onChange={(e) => {
                                const temp = e.target.value;
                                field.onChange(temp);
                              }}
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
                              value={field?.value}
                              onChange={(e) => {
                                const temp = e.target.value;
                                field.onChange(temp);
                              }}
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
                              value={field?.value}
                              onChange={(e) => {
                                const temp = e.target.value;
                                field.onChange(temp);
                              }}
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
                              type="number"
                              value={Number(field?.value)}
                              onChange={(e) => {
                                const temp = e.target.value;
                                field.onChange(Number(temp));
                              }}
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
                              selectedKeys={[String(field.value)]}
                              onSelectionChange={(e) => {
                                const key = Array.from(e)[0];
                                field.onChange(key === "true");
                                setIsTDS(key === "true");
                              }}
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

                        {isTDS && (
                          <Controller
                            name="tdsPercent"
                            control={control}
                            render={({ field, fieldState: { error } }) => (
                              <Input
                                isRequired
                                label="TDS percent %"
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
                        )}

                        <Controller
                          name="professionalFees"
                          control={control}
                          render={({ field, fieldState: { error } }) => (
                            <Input
                              isRequired
                              label="Professional fees"
                              errorMessage={error?.message}
                              isInvalid={!!error}
                              isDisabled={
                                paymentType === "Partial" ||
                                paymentType === "Fully"
                              }
                              type="number"
                              value={Number(field?.value)}
                              onChange={(e) => {
                                const temp = e.target.value;
                                field.onChange(Number(temp));
                              }}
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
                              isDisabled
                              type="number"
                              value={Number(field?.value)}
                              onChange={(e) => {
                                const temp = e.target.value;
                                field.onChange(Number(temp));
                              }}
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
                              isDisabled={
                                paymentType === "Partial" ||
                                paymentType === "Fully"
                              }
                              type="number"
                              value={Number(field?.value)}
                              onChange={(e) => {
                                const temp = e.target.value;
                                field.onChange(Number(temp));
                              }}
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
                              isDisabled
                              type="number"
                              value={Number(field?.value)}
                              onChange={(e) => {
                                const temp = e.target.value;
                                field.onChange(Number(temp));
                              }}
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
                              type="number"
                              value={Number(field?.value)}
                              onChange={(e) => {
                                const temp = e.target.value;
                                field.onChange(Number(temp));
                              }}
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
                              isDisabled
                              type="number"
                              value={Number(field?.value)}
                              onChange={(e) => {
                                const temp = e.target.value;
                                field.onChange(Number(temp));
                              }}
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
                              type="number"
                              value={Number(field?.value)}
                              onChange={(e) => {
                                const temp = e.target.value;
                                field.onChange(Number(temp));
                              }}
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
                              type="number"
                              value={Number(field?.value)}
                              onChange={(e) => {
                                const temp = e.target.value;
                                field.onChange(Number(temp));
                              }}
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
                              isDisabled
                              type="number"
                              value={Number(field.value)}
                              onChange={(e) =>
                                field.onChange(Number(e.target.value))
                              }
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
                              value={field.value}
                              onChange={(e) => field.onChange(e.target.value)}
                            />
                          )}
                        />
                        <Controller
                          name="termOfDelivery"
                          control={control}
                          render={({ field, fieldState: { error } }) => (
                            <Input
                              isRequired
                              label="Delivery terms"
                              errorMessage={error?.message}
                              isInvalid={!!error}
                              value={field.value}
                              onChange={(e) => field.onChange(e.target.value)}
                            />
                          )}
                        />
                        <Controller
                          name="doc"
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
