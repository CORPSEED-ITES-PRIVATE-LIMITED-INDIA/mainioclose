import {
  addToast,
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
  Textarea,
  Tooltip,
  useDisclosure,
} from "@heroui/react";
import { ChevronDown, EllipsisVertical, Info, Search } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useParams } from "react-router-dom";
import {
  getActivePaymentLedgerForPaymentRegister,
  getAllCompaniesForApprovals,
} from "../toolkit/slices/accountSlice";
import {
  approvedCompanyInAccount,
  approvedCompanyInLeads,
} from "../toolkit/slices/companySlice";
import {
  approvedAndDisapprovedExpense,
  getExpenseListByUserId,
} from "../toolkit/slices/operationSlice";
import dayjs from "dayjs";
import { inrCurrency } from "../common";
import { getAllPaymentType } from "../toolkit/slices/settingSlice";

import { getLocalTimeZone, parseDate, today } from "@internationalized/date";

import FileUploader from "../components/FileUploader";
import NewSelect from "../components/NewSelect";

const columns = [
  { name: "ID", uid: "expenseId" },
  { name: "UNBILL NO.", uid: "unbilledNumber" },
  { name: "PROJECT NO.", uid: "projectNo" },
  { name: "EXPENSE DATE", uid: "expenseDate" },
  { name: "EXPENSE TYPE", uid: "expenseType" },
  { name: "SERVICE", uid: "productName" },
  { name: "PROJECT NAME", uid: "projectName" },
  { name: "RAISED BY", uid: "createdByUserName" },
  { name: "AMOUNT", uid: "amount" },
  { name: "APPROVED BY", uid: "approvedByUserName" },
  { name: "REMARK", uid: "remark" },
  { name: "ACTIONS", uid: "actions" },
];

function capitalize(s) {
  return s ? s.charAt(0).toUpperCase() + s.slice(1).toLowerCase() : "";
}

const INITIAL_VISIBLE_COLUMNS = [
  "expenseId",
  "unbilledNumber",
  "projectNo",
  "expenseDate",
  "expenseType",
  "productName",
  "projectName",
  "createdByUserName",
  "amount",
  "approvedByUserName",
  "remark",
  "actions",
];

const INITIAL_APPROVAL_PAYMENT_DATA = {
  paymentBy: "",
  paymentTypeId: "",
  receivedAmount: "",
  paymentReceivedDate: "",
  paymentMode: "",
  bankLedgerId: "",
  transactionReference: "",
  paymentProof: "",
};

const Expense = () => {
  const { userId } = useParams();
  const dispatch = useDispatch();
  const { isOpen, onOpen, onClose, onOpenChange } = useDisclosure();
  const count = useSelector((state) => state.operation.expenseList?.length);
  const data = useSelector((state) => state.operation.expenseList);

  const paymentTypeList = useSelector((state) => state.setting.paymentTypeList);
  const paymentLegerList = useSelector(
    (state) => state.account.paymentLegerList,
  );

  const [filterValue, setFilterValue] = useState("");
  const [selectedKeys, setSelectedKeys] = useState(new Set([]));
  const [visibleColumns, setVisibleColumns] = useState(
    new Set(INITIAL_VISIBLE_COLUMNS),
  );
  const [sortDescriptor, setSortDescriptor] = useState({
    column: "age",
    direction: "ascending",
  });
  const [filteration, setFilteration] = useState({
    userId: userId,
    page: 1,
    size: 50,
    status: "ALL",
  });

  const [statusData, setStatusData] = useState({
    status: null,
    rejectionRemark: "",
    projectId: null,
    expenseId: null,
    expenseAmount: 0,
    userId,
  });

  const validateApprovalPayment = () => {
    const validationErrors = {};

    if (!approvalPaymentData.paymentBy) {
      validationErrors.paymentBy = "Person doing payment is required";
    }

    if (!approvalPaymentData.paymentProof) {
      validationErrors.paymentProof = "Payment proof is required";
    }

    // For client payment, only payment proof is required
    if (approvalPaymentData.paymentBy === "CLIENT") {
      setApprovalPaymentErrors(validationErrors);
      return Object.keys(validationErrors).length === 0;
    }

    // Existing validation for Corpseed payment
    if (approvalPaymentData.paymentBy === "CORPSEED") {
      const receivedAmount = Number(approvalPaymentData.receivedAmount);

      if (!approvalPaymentData.paymentTypeId) {
        validationErrors.paymentTypeId = "Payment type is required";
      }

      if (
        approvalPaymentData.receivedAmount === "" ||
        !Number.isFinite(receivedAmount) ||
        receivedAmount <= 0
      ) {
        validationErrors.receivedAmount =
          "Received amount must be greater than zero";
      }

      if (
        Number(statusData.expenseAmount || 0) > 0 &&
        receivedAmount > Number(statusData.expenseAmount)
      ) {
        validationErrors.receivedAmount =
          "Received amount cannot exceed expense amount";
      }

      if (!approvalPaymentData.paymentReceivedDate) {
        validationErrors.paymentReceivedDate =
          "Payment received date is required";
      }

      if (!approvalPaymentData.paymentMode) {
        validationErrors.paymentMode = "Payment mode is required";
      }

      if (!approvalPaymentData.bankLedgerId) {
        validationErrors.bankLedgerId = "Bank/Cash ledger is required";
      }

      if (
        approvalPaymentData.paymentMode !== "CASH" &&
        !approvalPaymentData.transactionReference?.trim()
      ) {
        validationErrors.transactionReference =
          "Transaction reference is required";
      }
    }

    setApprovalPaymentErrors(validationErrors);

    return Object.keys(validationErrors).length === 0;
  };

  const [approvalPaymentData, setApprovalPaymentData] = useState(
    INITIAL_APPROVAL_PAYMENT_DATA,
  );

  const [approvalPaymentErrors, setApprovalPaymentErrors] = useState({});

  const [isPaymentProofUploading, setIsPaymentProofUploading] = useState(false);

  const [isApprovalSubmitting, setIsApprovalSubmitting] = useState(false);

  const hasSearchFilter = Boolean(filterValue);

  const selectedPaymentMode = approvalPaymentData.paymentMode;

  const hasPaymentModeSelected = Boolean(
    String(selectedPaymentMode || "").trim(),
  );

  const isCashPaymentMode =
    String(selectedPaymentMode || "")
      .trim()
      .toUpperCase() === "CASH";

  const isCashLedger = (ledger) => {
    const ledgerName = String(ledger?.ledgerName || "")
      .trim()
      .toLowerCase();

    const ledgerType = String(ledger?.ledgerType || "")
      .trim()
      .toLowerCase();

    return ledgerType === "cash" || ledgerName.includes("cash");
  };

  const filteredPaymentLedgerList = !hasPaymentModeSelected
    ? []
    : isCashPaymentMode
      ? (paymentLegerList || []).filter(isCashLedger)
      : (paymentLegerList || []).filter((ledger) => !isCashLedger(ledger));

  const handlePaymentModeChange = (paymentMode) => {
    setApprovalPaymentData((prev) => ({
      ...prev,
      paymentMode,
      bankLedgerId: "",
    }));

    setApprovalPaymentErrors((prev) => ({
      ...prev,
      paymentMode: "",
      bankLedgerId: "",
    }));
  };

  const handlePaymentByChange = (paymentBy) => {
    setApprovalPaymentData((prev) => ({
      ...prev,
      paymentBy,

      // Clear Corpseed-specific fields when client is selected
      paymentTypeId: paymentBy === "CLIENT" ? "" : prev.paymentTypeId,
      receivedAmount:
        paymentBy === "CLIENT"
          ? ""
          : prev.receivedAmount || String(statusData.expenseAmount || ""),
      paymentReceivedDate:
        paymentBy === "CLIENT" ? "" : prev.paymentReceivedDate,
      paymentMode: paymentBy === "CLIENT" ? "" : prev.paymentMode,
      bankLedgerId: paymentBy === "CLIENT" ? "" : prev.bankLedgerId,
      transactionReference:
        paymentBy === "CLIENT" ? "" : prev.transactionReference,
    }));

    setApprovalPaymentErrors({});
  };

  useEffect(() => {
    dispatch(getExpenseListByUserId(filteration));
  }, [dispatch, filteration]);

  useEffect(() => {
    dispatch(getAllPaymentType());
    dispatch(getActivePaymentLedgerForPaymentRegister());
  }, [dispatch]);

  const headerColumns = useMemo(() => {
    if (visibleColumns === "all") return columns;

    return columns.filter((column) =>
      Array.from(visibleColumns).includes(column.uid),
    );
  }, [visibleColumns]);

  const filteredItems = useMemo(() => {
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

  const pages = Math.ceil(count / filteration?.size) || 1;

  const sortedItems = useMemo(() => {
    return [...filteredItems].sort((a, b) => {
      const first = a[sortDescriptor.column];
      const second = b[sortDescriptor.column];
      const cmp = first < second ? -1 : first > second ? 1 : 0;

      return sortDescriptor.direction === "descending" ? -cmp : cmp;
    });
  }, [sortDescriptor, filteredItems]);

  const resetApprovalModal = () => {
    setApprovalPaymentData(INITIAL_APPROVAL_PAYMENT_DATA);
    setApprovalPaymentErrors({});
    setIsPaymentProofUploading(false);

    setStatusData({
      status: null,
      rejectionRemark: "",
      projectId: null,
      expenseId: null,
      expenseAmount: 0,
      userId,
    });
  };

  const handleApproveExpense = async () => {
    if (isPaymentProofUploading) {
      addToast({
        title: "Payment proof is still uploading",
        color: "warning",
      });
      return;
    }

    if (!validateApprovalPayment()) {
      return;
    }

    try {
      setIsApprovalSubmitting(true);

      const response = await dispatch(
        approvedAndDisapprovedExpense({
          projectId: statusData.projectId,
          expenseId: statusData.expenseId,
          userId,
          data: {
            status: "APPROVED",
            paymentBy: approvalPaymentData.paymentBy,
            paymentProof: approvalPaymentData.paymentProof,

            ...(approvalPaymentData.paymentBy === "CORPSEED"
              ? {
                  paymentTypeId: Number(approvalPaymentData.paymentTypeId),
                  amount: Number(
                    Number(approvalPaymentData.receivedAmount).toFixed(2),
                  ),
                  paymentDate: approvalPaymentData.paymentReceivedDate,
                  paymentMode: approvalPaymentData.paymentMode,
                  bankLedgerId: Number(approvalPaymentData.bankLedgerId),
                  transactionReference:
                    approvalPaymentData.paymentMode === "CASH"
                      ? ""
                      : approvalPaymentData.transactionReference.trim(),
                }
              : {
                  paymentTypeId: null,
                  amount: null,
                  paymentDate: null,
                  paymentMode: null,
                  bankLedgerId: null,
                  transactionReference: null,
                }),
          },
        }),
      );

      if (response?.meta?.requestStatus === "fulfilled") {
        addToast({
          title: "Expense approved successfully",
          color: "success",
        });

        dispatch(getExpenseListByUserId(filteration));
        resetApprovalModal();
        onClose();
        return;
      }

      addToast({
        title:
          response?.payload?.data?.message ||
          response?.payload?.message ||
          "Failed to approve expense",
        color: "danger",
      });
    } catch (error) {
      addToast({
        title:
          error?.response?.data?.message ||
          error?.message ||
          "Something went wrong",
        color: "danger",
      });
    } finally {
      setIsApprovalSubmitting(false);
    }
  };

  const handleChangeExpenseStatus = async () => {
    if (!statusData.rejectionRemark?.trim()) {
      addToast({
        title: "Remark is required",
        color: "danger",
      });
      return;
    }

    try {
      const response = await dispatch(
        approvedAndDisapprovedExpense({
          projectId: statusData.projectId,
          expenseId: statusData.expenseId,
          userId,
          data: {
            status: statusData.status,
            rejectionRemark: statusData.rejectionRemark.trim(),
          },
        }),
      );

      if (response?.meta?.requestStatus === "fulfilled") {
        addToast({
          title: "Expense status updated successfully",
          color: "success",
        });

        dispatch(getExpenseListByUserId(filteration));
        resetApprovalModal();
        onClose();
        return;
      }

      addToast({
        title:
          response?.payload?.data?.message ||
          response?.payload?.message ||
          "Failed to update expense status",
        color: "danger",
      });
    } catch (error) {
      addToast({
        title:
          error?.response?.data?.message ||
          error?.message ||
          "Something went wrong",
        color: "danger",
      });
    }
  };

  const updateApprovalPaymentField = (fieldName, value) => {
    setApprovalPaymentData((prev) => ({
      ...prev,
      [fieldName]: value,
    }));

    setApprovalPaymentErrors((prev) => ({
      ...prev,
      [fieldName]: "",
    }));
  };

  const renderCell = (rowData, columnKey) => {
    switch (columnKey) {
      case "unbilledNumber":
        return (
          <div className="flex flex-col">
            <p>{rowData?.unbilledNumber}</p>
            {rowData?.approvalStatus && (
              <Chip
                size="sm"
                color={
                  rowData?.approvalStatus === "APPROVED"
                    ? "success"
                    : rowData?.approvalStatus === "REJECTED"
                      ? "danger"
                      : rowData?.approvalStatus === "ON_HOLD"
                        ? "warning"
                        : rowData?.approvalStatus === "PENDING"
                          ? "secondary"
                          : "default"
                }
              >
                {rowData?.approvalStatus}
              </Chip>
            )}
          </div>
        );
      case "expenseDate":
        return (
          <p>{dayjs(rowData?.expenseDate).format("DD-MM-YYYY, HH:mm A")}</p>
        );
      case "amount":
        return <p>{inrCurrency(rowData?.amount)}</p>;

      case "actions": {
        const status = String(rowData?.approvalStatus || "")
          .trim()
          .toUpperCase();

        // Do not show any action after final decision
        if (["APPROVED", "REJECTED"].includes(status)) {
          return null;
        }

        return (
          <Dropdown showArrow>
            <DropdownTrigger>
              <Button size="sm" isIconOnly variant="light">
                <EllipsisVertical />
              </Button>
            </DropdownTrigger>

            <DropdownMenu>
              <DropdownItem
                key="approved"
                onPress={() => {
                  setStatusData({
                    status: "APPROVED",
                    rejectionRemark: "",
                    projectId: rowData?.projectId,
                    expenseId: rowData?.expenseId,
                    expenseAmount: Number(rowData?.amount || 0),
                    userId,
                  });

                  setApprovalPaymentData({
                    paymentBy: "",
                    paymentTypeId: "",
                    receivedAmount: String(rowData?.amount ?? ""),
                    paymentReceivedDate: "",
                    paymentMode: "",
                    bankLedgerId: "",
                    transactionReference: "",
                    paymentProof: "",
                  });

                  setApprovalPaymentErrors({});
                  onOpen();
                }}
              >
                APPROVED
              </DropdownItem>

              <DropdownItem
                key="pending"
                onPress={() => {
                  onOpen();
                  setStatusData((prev) => ({
                    ...prev,
                    status: "PENDING",
                    projectId: rowData?.projectId,
                    expenseId: rowData?.expenseId,
                  }));
                }}
              >
                PENDING
              </DropdownItem>

              <DropdownItem
                key="onHold"
                onPress={() => {
                  onOpen();
                  setStatusData((prev) => ({
                    ...prev,
                    status: "ON_HOLD",
                    projectId: rowData?.projectId,
                    expenseId: rowData?.expenseId,
                  }));
                }}
              >
                ON_HOLD
              </DropdownItem>

              <DropdownItem
                key="rejected"
                onPress={() => {
                  onOpen();
                  setStatusData((prev) => ({
                    ...prev,
                    status: "REJECTED",
                    projectId: rowData?.projectId,
                    expenseId: rowData?.expenseId,
                  }));
                }}
              >
                REJECTED
              </DropdownItem>
            </DropdownMenu>
          </Dropdown>
        );
      }
      default:
        return rowData[columnKey] || "-";
    }
  };

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
                <Button
                  endContent={<ChevronDown />}
                  variant="flat"
                  className="capitalize"
                >
                  {filteration?.status}
                </Button>
              </DropdownTrigger>
              <DropdownMenu
                disallowEmptySelection
                aria-label="Table Columns"
                selectionMode="single"
                selectedKeys={[filteration.status]}
                onSelectionChange={(selectedKeys) => {
                  const selected = Array.from(selectedKeys)[0];
                  setFilteration((prev) => ({
                    ...prev,
                    status: selected || prev.status,
                  }));
                }}
              >
                <DropdownItem key="ALL">ALL</DropdownItem>
                <DropdownItem key="PENDING">PENDING</DropdownItem>
                <DropdownItem key="ON_HOLD">ON_HOLD</DropdownItem>
                <DropdownItem key="APPROVED">APPROVED</DropdownItem>
                <DropdownItem key="REJECTED">REJECTED</DropdownItem>
              </DropdownMenu>
            </Dropdown>
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
            Total {count} expense for approvals
          </span>
          <label className="flex items-center text-default-400 text-small">
            Rows per page:
            <select
              className="bg-transparent outline-hidden text-default-400 text-small"
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
  }, [
    filterValue,
    visibleColumns,
    onRowsPerPageChange,
    data?.length,
    onSearchChange,
    hasSearchFilter,
    filteration?.status,
  ]);

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
          onChange={(page) => {
            setFilteration((prev) => ({ ...prev, page }));
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
  }, [selectedKeys, count, filteration, pages, hasSearchFilter]);

  return (
    <>
      <h1 className="font-sans text-2xl font-medium mb-1">
        Expenses for approvals
      </h1>
      <Table
        isHeaderSticky
        aria-label="Example table with custom cells, pagination and sorting"
        bottomContent={bottomContent}
        bottomContentPlacement="outside"
        classNames={{
          wrapper: "2xl:max-h-[68vh] md:max-h-[62vh] w-full",
          table: "w-full",
        }}
        // selectedKeys={selectedKeys}
        // selectionMode="multiple"
        sortDescriptor={sortDescriptor}
        topContent={topContent}
        topContentPlacement="outside"
        // onSelectionChange={setSelectedKeys}
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
            <TableRow key={item.expenseId}>
              {(columnKey) => (
                <TableCell>{renderCell(item, columnKey)}</TableCell>
              )}
            </TableRow>
          )}
        </TableBody>
      </Table>
      <Modal
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        size={statusData.status === "APPROVED" ? "2xl" : "md"}
        isDismissable={false}
        isKeyboardDismissDisabled
      >
        <ModalContent>
          {(modalClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                {statusData.status === "APPROVED"
                  ? "Approve Expense"
                  : "Update Expense Status"}
              </ModalHeader>

              <ModalBody>
                {statusData.status === "APPROVED" ? (
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <Select
                      label="Payment Initiator"
                      placeholder="Select the payment Initiator"
                      isRequired
                      selectedKeys={
                        approvalPaymentData.paymentBy
                          ? new Set([approvalPaymentData.paymentBy])
                          : new Set([])
                      }
                      isInvalid={Boolean(approvalPaymentErrors.paymentBy)}
                      errorMessage={approvalPaymentErrors.paymentBy}
                      onSelectionChange={(keys) =>
                        handlePaymentByChange(Array.from(keys)?.[0] || "")
                      }
                      className="md:col-span-2"
                    >
                      <SelectItem key="CLIENT">Client</SelectItem>
                      <SelectItem key="CORPSEED">Corpseed</SelectItem>
                    </Select>

                    {approvalPaymentData.paymentBy === "CORPSEED" && (
                      <>
                        <div>
                          <NewSelect
                            isRequired
                            label="Payment Type"
                            data={
                              Array.isArray(paymentTypeList)
                                ? paymentTypeList
                                : []
                            }
                            labelKey="name"
                            valueKey="id"
                            value={approvalPaymentData.paymentTypeId}
                            onChange={(value) =>
                              updateApprovalPaymentField("paymentTypeId", value)
                            }
                          />

                          {approvalPaymentErrors.paymentTypeId && (
                            <p className="mt-1 text-xs text-danger">
                              {approvalPaymentErrors.paymentTypeId}
                            </p>
                          )}
                        </div>

                        <Input
                          type="number"
                          min={0}
                          step="0.01"
                          inputMode="decimal"
                          label="Received Amount"
                          placeholder="Enter received amount"
                          isRequired
                          value={approvalPaymentData.receivedAmount}
                          isInvalid={Boolean(
                            approvalPaymentErrors.receivedAmount,
                          )}
                          errorMessage={approvalPaymentErrors.receivedAmount}
                          onKeyDown={(event) => {
                            if (["-", "+", "e", "E"].includes(event.key)) {
                              event.preventDefault();
                            }
                          }}
                          onChange={(event) => {
                            const value = event.target.value;

                            if (
                              value !== "" &&
                              !/^\d*(\.\d{0,2})?$/.test(value)
                            ) {
                              return;
                            }

                            updateApprovalPaymentField("receivedAmount", value);
                          }}
                        />

                        <DatePicker
                          label="Payment Received Date"
                          isRequired
                          showMonthAndYearPickers
                          maxValue={today(getLocalTimeZone())}
                          value={
                            approvalPaymentData.paymentReceivedDate &&
                            /^\d{4}-\d{2}-\d{2}$/.test(
                              approvalPaymentData.paymentReceivedDate,
                            )
                              ? parseDate(
                                  approvalPaymentData.paymentReceivedDate,
                                )
                              : null
                          }
                          isInvalid={Boolean(
                            approvalPaymentErrors.paymentReceivedDate,
                          )}
                          errorMessage={
                            approvalPaymentErrors.paymentReceivedDate
                          }
                          onChange={(value) =>
                            updateApprovalPaymentField(
                              "paymentReceivedDate",
                              value ? value.toString() : "",
                            )
                          }
                        />

                        <Select
                          label="Payment Mode"
                          placeholder="Select payment mode"
                          isRequired
                          selectedKeys={
                            approvalPaymentData.paymentMode
                              ? new Set([approvalPaymentData.paymentMode])
                              : new Set([])
                          }
                          isInvalid={Boolean(approvalPaymentErrors.paymentMode)}
                          errorMessage={approvalPaymentErrors.paymentMode}
                          onSelectionChange={(keys) =>
                            handlePaymentModeChange(Array.from(keys)?.[0] || "")
                          }
                        >
                          <SelectItem key="CASH">Cash</SelectItem>
                          <SelectItem key="UPI">UPI</SelectItem>
                          <SelectItem key="CARD">Card</SelectItem>
                          <SelectItem key="BANK_TRANSFER">
                            Bank Transfer
                          </SelectItem>
                          <SelectItem key="CHEQUE">Cheque</SelectItem>
                        </Select>

                        <div>
                          <NewSelect
                            isRequired
                            isDisabled={!hasPaymentModeSelected}
                            label="Select Bank/Cash"
                            data={filteredPaymentLedgerList}
                            labelKey="ledgerName"
                            valueKey="id"
                            value={approvalPaymentData.bankLedgerId}
                            onChange={(value) =>
                              updateApprovalPaymentField("bankLedgerId", value)
                            }
                          />

                          {approvalPaymentErrors.bankLedgerId && (
                            <p className="mt-1 text-xs text-danger">
                              {approvalPaymentErrors.bankLedgerId}
                            </p>
                          )}
                        </div>

                        {approvalPaymentData.paymentMode !== "CASH" && (
                          <Input
                            label="Transaction Reference / UTR Number"
                            placeholder="Enter reference number"
                            isRequired
                            value={approvalPaymentData.transactionReference}
                            isInvalid={Boolean(
                              approvalPaymentErrors.transactionReference,
                            )}
                            errorMessage={
                              approvalPaymentErrors.transactionReference
                            }
                            onChange={(event) =>
                              updateApprovalPaymentField(
                                "transactionReference",
                                event.target.value,
                              )
                            }
                          />
                        )}
                      </>
                    )}

                    {approvalPaymentData.paymentBy && (
                      <div className="md:col-span-2">
                        <FileUploader
                          label="Payment Proof"
                          placeholder="Upload payment proof"
                          isRequired
                          uploadingType="single"
                          value={approvalPaymentData.paymentProof}
                          errorMessage={approvalPaymentErrors.paymentProof}
                          onUploadingChange={setIsPaymentProofUploading}
                          onChange={(uploadedUrl) =>
                            updateApprovalPaymentField(
                              "paymentProof",
                              uploadedUrl || "",
                            )
                          }
                        />
                      </div>
                    )}
                  </div>
                ) : (
                  <Textarea
                    label="Remark"
                    isRequired
                    value={statusData.rejectionRemark}
                    onChange={(event) =>
                      setStatusData((prev) => ({
                        ...prev,
                        rejectionRemark: event.target.value,
                      }))
                    }
                  />
                )}
              </ModalBody>

              <ModalFooter>
                <Button
                  variant="light"
                  onPress={() => {
                    resetApprovalModal();
                    modalClose();
                  }}
                >
                  Close
                </Button>

                <Button
                  color="primary"
                  isLoading={
                    statusData.status === "APPROVED"
                      ? isApprovalSubmitting
                      : false
                  }
                  isDisabled={
                    statusData.status === "APPROVED"
                      ? isPaymentProofUploading
                      : !statusData.rejectionRemark?.trim()
                  }
                  onPress={
                    statusData.status === "APPROVED"
                      ? handleApproveExpense
                      : handleChangeExpenseStatus
                  }
                >
                  Submit
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
};

export default Expense;
