import {
  addToast,
  Button,
  Chip,
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
  useDisclosure,
} from "@heroui/react";
import {
  ChevronDown,
  EllipsisVertical,
  ExternalLink,
  RefreshCcw,
  Search,
} from "lucide-react";
import dayjs from "dayjs";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import {
  getExpensePaymentQueueList,
  updateExpenseAccountsDecision,
} from "../toolkit/slices/operationSlice";

const columns = [
  { name: "EXPENSE ID", uid: "expenseId" },
  { name: "PROJECT", uid: "project" },
  { name: "UNBILLED NO.", uid: "unbilledNumber" },
  { name: "PRODUCT", uid: "productName" },
  { name: "CATEGORY", uid: "expenseCategory" },
  { name: "REQUESTED AMOUNT", uid: "requestedAmount" },
  { name: "APPROVED AMOUNT", uid: "approvedAmount" },
  { name: "PAID AMOUNT", uid: "paidAmount" },
  { name: "OUTSTANDING AMOUNT", uid: "outstandingAmount" },
  { name: "DEPARTMENT", uid: "department" },
  { name: "CREATED BY", uid: "createdBy" },
  { name: "EXPENSE DATE", uid: "expenseDate" },
  { name: "GENERATED DATE", uid: "createdDate" },
  { name: "UPDATED DATE", uid: "updatedDate" },
  { name: "APPROVAL STAGE", uid: "approvalStage" },
  { name: "APPROVAL STATUS", uid: "approvalStatus" },
  { name: "CRT STATUS", uid: "crtApprovalStatus" },
  { name: "ACCOUNTS STATUS", uid: "accountsApprovalStatus" },
  { name: "PAYMENT STATUS", uid: "paymentStatus" },
  { name: "REFERENCE / REMARK", uid: "reference" },
  { name: "ATTACHMENT", uid: "attachment" },
  { name: "ACTIONS", uid: "actions" },
];

const INITIAL_VISIBLE_COLUMNS = [
  "expenseId",
  "project",
  "unbilledNumber",
  "productName",
  "expenseCategory",
  "requestedAmount",
  "approvedAmount",
  "paidAmount",
  "outstandingAmount",
  "department",
  "createdBy",
  "expenseDate",
  "createdDate",
  "approvalStage",
  "accountsApprovalStatus",
  "paymentStatus",
  "reference",
  "attachment",
  "actions",
];

const PAYMENT_STATUS_OPTIONS = [
  { label: "All Payment Statuses", value: "ALL" },
  { label: "Not Initiated", value: "NOT_INITIATED" },
  { label: "Pending", value: "PENDING" },
  { label: "Processing", value: "PROCESSING" },
  { label: "Partially Paid", value: "PARTIALLY_PAID" },
  { label: "Paid", value: "PAID" },
  { label: "Failed", value: "FAILED" },
  { label: "Reversed", value: "REVERSED" },
  { label: "Cancelled", value: "CANCELLED" },
];

const ACCOUNT_DECISION_OPTIONS = [
  { label: "Approved", value: "APPROVED" },
  { label: "Rejected", value: "REJECTED" },
  { label: "On Hold", value: "ON_HOLD" },
];

const INITIAL_DECISION_FORM = {
  status: "",
  approvedAmount: "",
  remark: "",
};

const formatText = (value) => {
  if (!value) return "-";

  return String(value)
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(/\b\w/g, (character) => character.toUpperCase());
};

const formatDateTime = (value) => {
  if (!value) return "-";

  const parsedDate = dayjs(value);
  return parsedDate.isValid() ? parsedDate.format("DD-MM-YYYY hh:mm A") : "-";
};

const formatCurrency = (amount, currencyCode = "INR") => {
  if (amount === null || amount === undefined || amount === "") return "-";

  const numericAmount = Number(amount);
  if (!Number.isFinite(numericAmount)) return "-";

  try {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: currencyCode || "INR",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(numericAmount);
  } catch {
    return `${currencyCode || "INR"} ${numericAmount.toFixed(2)}`;
  }
};

const getApprovalStatusColor = (status) => {
  switch (status) {
    case "APPROVED":
      return "success";
    case "REJECTED":
    case "CANCELLED":
      return "danger";
    case "PENDING":
      return "warning";
    case "ON_HOLD":
      return "secondary";
    default:
      return "default";
  }
};

const getPaymentStatusColor = (status) => {
  switch (status) {
    case "PAID":
      return "success";
    case "PENDING":
    case "PROCESSING":
      return "warning";
    case "PARTIALLY_PAID":
      return "secondary";
    case "FAILED":
    case "REVERSED":
    case "CANCELLED":
      return "danger";
    case "NOT_INITIATED":
    default:
      return "default";
  }
};

const getStageColor = (stage) => {
  switch (stage) {
    case "CRT_REVIEW":
      return "primary";
    case "ACCOUNTS_REVIEW":
      return "secondary";
    case "COMPLETED":
      return "success";
    default:
      return "default";
  }
};

const Expense = () => {
  const dispatch = useDispatch();
  const { userId } = useParams();
  const { isOpen, onOpen, onClose, onOpenChange } = useDisclosure();

  const currentUser = useSelector((state) => state.auth?.currentUser);

  const paymentQueue = useSelector(
    (state) => state.operation.expensePaymentQueueList,
  );
  const paymentQueueLoading = useSelector(
    (state) => state.operation.expensePaymentQueueLoading,
  );
  const paymentQueueError = useSelector(
    (state) => state.operation.expensePaymentQueueError,
  );

  const resolvedUserId = Number(
    userId || currentUser?.id || currentUser?.userId || currentUser?.employeeId,
  );

  const [searchValue, setSearchValue] = useState("");
  const [paymentStatus, setPaymentStatus] = useState("NOT_INITIATED");
  const [visibleColumns, setVisibleColumns] = useState(
    new Set(INITIAL_VISIBLE_COLUMNS),
  );
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(50);
  const [sortDescriptor, setSortDescriptor] = useState({
    column: "createdDate",
    direction: "descending",
  });

  const [selectedExpense, setSelectedExpense] = useState(null);
  const [decisionForm, setDecisionForm] = useState(INITIAL_DECISION_FORM);
  const [decisionErrors, setDecisionErrors] = useState({});
  const [isDecisionSubmitting, setIsDecisionSubmitting] = useState(false);

  const fetchPaymentQueue = useCallback(() => {
    if (!resolvedUserId) {
      addToast({
        title: "User ID is required",
        description: "Unable to load the expense payment queue.",
        color: "danger",
      });
      return;
    }

    dispatch(
      getExpensePaymentQueueList({
        userId: resolvedUserId,
        paymentStatus,
      }),
    ).then((response) => {
      if (response?.meta?.requestStatus === "rejected") {
        addToast({
          title: "Failed to load expense payment queue",
          description:
            response?.payload?.message ||
            response?.payload ||
            "Something went wrong while fetching expenses.",
          color: "danger",
        });
      }
    });
  }, [dispatch, paymentStatus, resolvedUserId]);

  useEffect(() => {
    fetchPaymentQueue();
  }, [fetchPaymentQueue]);

  const expenseRows = useMemo(
    () => (Array.isArray(paymentQueue) ? paymentQueue : []),
    [paymentQueue],
  );

  const headerColumns = useMemo(() => {
    if (visibleColumns === "all") return columns;

    return columns.filter((column) =>
      Array.from(visibleColumns).includes(column.uid),
    );
  }, [visibleColumns]);

  const filteredItems = useMemo(() => {
    const normalizedSearch = searchValue.trim().toLowerCase();
    if (!normalizedSearch) return expenseRows;

    return expenseRows.filter((expense) => {
      const searchableValues = [
        expense?.expenseId,
        expense?.activityId,
        expense?.projectId,
        expense?.projectNo,
        expense?.projectName,
        expense?.unbilledNumber,
        expense?.productName,
        expense?.raisedDepartmentId,
        expense?.raisedDepartmentName,
        expense?.expenseCategory,
        expense?.requestedAmount,
        expense?.approvedAmount,
        expense?.paidAmount,
        expense?.outstandingAmount,
        expense?.currencyCode,
        expense?.remark,
        expense?.externalReference,
        expense?.approvalStatus,
        expense?.approvalStage,
        expense?.crtApprovalStatus,
        expense?.crtActionByUserName,
        expense?.crtDecisionRemark,
        expense?.accountsApprovalStatus,
        expense?.accountsActionByUserName,
        expense?.accountsDecisionRemark,
        expense?.paymentStatus,
        expense?.createdByUserId,
        expense?.createdByUserName,
      ];

      return searchableValues
        .filter(
          (value) => value !== null && value !== undefined && value !== "",
        )
        .some((value) =>
          String(value).toLowerCase().includes(normalizedSearch),
        );
    });
  }, [expenseRows, searchValue]);

  const sortedItems = useMemo(() => {
    return [...filteredItems].sort((firstItem, secondItem) => {
      const first = firstItem?.[sortDescriptor.column];
      const second = secondItem?.[sortDescriptor.column];

      if (first === second) return 0;
      if (first === null || first === undefined) return 1;
      if (second === null || second === undefined) return -1;

      const comparison = first < second ? -1 : 1;
      return sortDescriptor.direction === "descending"
        ? -comparison
        : comparison;
    });
  }, [filteredItems, sortDescriptor]);

  const totalPages = Math.max(1, Math.ceil(sortedItems.length / rowsPerPage));

  useEffect(() => {
    setPage((previousPage) => Math.min(previousPage, totalPages));
  }, [totalPages]);

  const paginatedItems = useMemo(() => {
    const startIndex = (page - 1) * rowsPerPage;
    return sortedItems.slice(startIndex, startIndex + rowsPerPage);
  }, [page, rowsPerPage, sortedItems]);

  const resetDecisionModal = useCallback(() => {
    setSelectedExpense(null);
    setDecisionForm(INITIAL_DECISION_FORM);
    setDecisionErrors({});
    setIsDecisionSubmitting(false);
  }, []);

  const openDecisionModal = useCallback(
    (expense) => {
      setSelectedExpense(expense);
      setDecisionForm({
        status: "",
        approvedAmount:
          expense?.approvedAmount !== null &&
          expense?.approvedAmount !== undefined
            ? String(expense.approvedAmount)
            : String(expense?.requestedAmount ?? ""),
        remark: "",
      });
      setDecisionErrors({});
      onOpen();
    },
    [onOpen],
  );

  const validateDecisionForm = useCallback(() => {
    const errors = {};
    const requestedAmount = Number(selectedExpense?.requestedAmount || 0);
    const approvedAmount = Number(decisionForm.approvedAmount);

    if (!decisionForm.status) {
      errors.status = "Status is required";
    }

    if (!decisionForm.remark?.trim()) {
      errors.remark = "Remark is required";
    }

    if (decisionForm.status === "APPROVED") {
      if (decisionForm.approvedAmount === "") {
        errors.approvedAmount = "Approved amount is required";
      } else if (!Number.isFinite(approvedAmount) || approvedAmount <= 0) {
        errors.approvedAmount = "Approved amount must be greater than zero";
      } else if (requestedAmount > 0 && approvedAmount > requestedAmount) {
        errors.approvedAmount =
          "Approved amount cannot exceed the requested amount";
      }
    }

    setDecisionErrors(errors);
    return Object.keys(errors).length === 0;
  }, [decisionForm, selectedExpense]);

  const handleAccountsDecision = useCallback(async () => {
    if (!selectedExpense?.expenseId || !selectedExpense?.projectId) {
      addToast({
        title: "Expense details are missing",
        description: "Expense ID and project ID are required.",
        color: "danger",
      });
      return;
    }

    if (!resolvedUserId) {
      addToast({
        title: "User ID is required",
        color: "danger",
      });
      return;
    }

    if (!validateDecisionForm()) return;

    try {
      setIsDecisionSubmitting(true);

      const payload = {
        status: decisionForm.status,
        approvedAmount:
          decisionForm.status === "APPROVED"
            ? Number(Number(decisionForm.approvedAmount).toFixed(2))
            : null,
        remark: decisionForm.remark.trim(),
      };

      const response = await dispatch(
        updateExpenseAccountsDecision({
          expenseId: selectedExpense.expenseId,
          projectId: selectedExpense.projectId,
          userId: resolvedUserId,
          data: payload,
        }),
      );

      if (response?.meta?.requestStatus === "fulfilled") {
        addToast({
          title: "Accounts decision updated successfully",
          description: `Expense #${selectedExpense.expenseId} was updated.`,
          color: "success",
        });

        resetDecisionModal();
        onClose();
        fetchPaymentQueue();
        return;
      }

      addToast({
        title: "Failed to update accounts decision",
        description:
          response?.payload?.message ||
          response?.payload?.error ||
          response?.payload ||
          "Something went wrong while updating the expense.",
        color: "danger",
      });
    } catch (error) {
      addToast({
        title: "Failed to update accounts decision",
        description:
          error?.response?.data?.message ||
          error?.message ||
          "Something went wrong while updating the expense.",
        color: "danger",
      });
    } finally {
      setIsDecisionSubmitting(false);
    }
  }, [
    decisionForm,
    dispatch,
    fetchPaymentQueue,
    onClose,
    resetDecisionModal,
    resolvedUserId,
    selectedExpense,
    validateDecisionForm,
  ]);

  const renderCell = useCallback(
    (expense, columnKey) => {
      const currencyCode = expense?.currencyCode || "INR";

      switch (columnKey) {
        case "expenseId":
          return (
            <span className="font-medium">#{expense?.expenseId ?? "-"}</span>
          );

        case "project":
          return (
            <div className="flex max-w-[240px] flex-col">
              <span className="truncate text-sm font-semibold">
                {expense?.projectName || "-"}
              </span>
              <span className="text-xs text-default-500">
                {expense?.projectNo ||
                  `Project ID: ${expense?.projectId || "-"}`}
              </span>
            </div>
          );

        case "unbilledNumber":
          return (
            <span className="whitespace-nowrap">
              {expense?.unbilledNumber || "-"}
            </span>
          );

        case "productName":
          return expense?.productName || "-";

        case "expenseCategory":
          return (
            <Chip size="sm" variant="flat">
              {formatText(expense?.expenseCategory)}
            </Chip>
          );

        case "requestedAmount":
          return (
            <span className="whitespace-nowrap font-semibold">
              {formatCurrency(expense?.requestedAmount, currencyCode)}
            </span>
          );

        case "approvedAmount":
          return (
            <span className="whitespace-nowrap">
              {formatCurrency(expense?.approvedAmount, currencyCode)}
            </span>
          );

        case "paidAmount":
          return (
            <span className="whitespace-nowrap">
              {formatCurrency(expense?.paidAmount, currencyCode)}
            </span>
          );

        case "outstandingAmount":
          return (
            <span className="whitespace-nowrap font-semibold">
              {formatCurrency(expense?.outstandingAmount, currencyCode)}
            </span>
          );

        case "department":
          return (
            <div className="flex flex-col">
              <span>{expense?.raisedDepartmentName || "-"}</span>
              {expense?.raisedDepartmentId && (
                <span className="text-xs text-default-500">
                  ID: {expense.raisedDepartmentId}
                </span>
              )}
            </div>
          );

        case "createdBy":
          return (
            <div className="flex flex-col">
              <span>{expense?.createdByUserName || "-"}</span>
              {expense?.createdByUserId && (
                <span className="text-xs text-default-500">
                  User ID: {expense.createdByUserId}
                </span>
              )}
            </div>
          );

        case "expenseDate":
          return (
            <span className="whitespace-nowrap">
              {formatDateTime(expense?.expenseDate)}
            </span>
          );

        case "createdDate":
          return (
            <span className="whitespace-nowrap">
              {formatDateTime(expense?.createdDate)}
            </span>
          );

        case "updatedDate":
          return (
            <span className="whitespace-nowrap">
              {formatDateTime(expense?.updatedDate)}
            </span>
          );

        case "approvalStage":
          return (
            <Chip
              size="sm"
              variant="flat"
              color={getStageColor(expense?.approvalStage)}
            >
              {formatText(expense?.approvalStage)}
            </Chip>
          );

        case "approvalStatus":
          return (
            <Chip
              size="sm"
              variant="flat"
              color={getApprovalStatusColor(expense?.approvalStatus)}
            >
              {formatText(expense?.approvalStatus)}
            </Chip>
          );

        case "crtApprovalStatus":
          return (
            <div className="flex flex-col gap-1">
              <Chip
                size="sm"
                variant="flat"
                color={getApprovalStatusColor(expense?.crtApprovalStatus)}
              >
                {formatText(expense?.crtApprovalStatus)}
              </Chip>
              {expense?.crtActionByUserName && (
                <span className="text-xs text-default-500">
                  By: {expense.crtActionByUserName}
                </span>
              )}
            </div>
          );

        case "accountsApprovalStatus":
          return (
            <div className="flex flex-col gap-1">
              <Chip
                size="sm"
                variant="flat"
                color={getApprovalStatusColor(expense?.accountsApprovalStatus)}
              >
                {formatText(expense?.accountsApprovalStatus)}
              </Chip>
              {expense?.accountsActionByUserName && (
                <span className="text-xs text-default-500">
                  By: {expense.accountsActionByUserName}
                </span>
              )}
            </div>
          );

        case "paymentStatus":
          return (
            <Chip
              size="sm"
              variant="flat"
              color={getPaymentStatusColor(expense?.paymentStatus)}
            >
              {formatText(expense?.paymentStatus)}
            </Chip>
          );

        case "reference":
          return (
            <div className="flex max-w-[230px] flex-col">
              <span
                className="truncate text-sm"
                title={expense?.externalReference || "-"}
              >
                {expense?.externalReference || "-"}
              </span>
              <span
                className="truncate text-xs text-default-500"
                title={expense?.remark || "-"}
              >
                {expense?.remark || "-"}
              </span>
            </div>
          );

        case "attachment":
          return expense?.attachmentUrl ? (
            <Button
              as="a"
              href={expense.attachmentUrl}
              target="_blank"
              rel="noopener noreferrer"
              size="sm"
              variant="flat"
              color="primary"
              startContent={<ExternalLink className="h-4 w-4" />}
            >
              View
            </Button>
          ) : (
            "-"
          );

        case "actions": {
          const approvalStage = String(
            expense?.approvalStage || "",
          ).toUpperCase();
          const crtStatus = String(
            expense?.crtApprovalStatus || "",
          ).toUpperCase();
          const accountsStatus = String(
            expense?.accountsApprovalStatus || "",
          ).toUpperCase();

          const canTakeDecision =
            approvalStage === "ACCOUNTS_REVIEW" &&
            crtStatus === "APPROVED" &&
            !["APPROVED", "REJECTED", "CANCELLED"].includes(accountsStatus);

          if (!canTakeDecision) {
            return <span className="text-default-400">-</span>;
          }

          return (
            <Dropdown placement="bottom-end">
              <DropdownTrigger>
                <Button
                  isIconOnly
                  size="sm"
                  variant="light"
                  aria-label={`Actions for expense ${expense?.expenseId}`}
                >
                  <EllipsisVertical className="h-5 w-5" />
                </Button>
              </DropdownTrigger>
              <DropdownMenu aria-label="Expense accounts actions">
                <DropdownItem
                  key="update-accounts-decision"
                  onPress={() => openDecisionModal(expense)}
                >
                  Update Status
                </DropdownItem>
              </DropdownMenu>
            </Dropdown>
          );
        }

        default:
          return expense?.[columnKey] ?? "-";
      }
    },
    [openDecisionModal],
  );

  const topContent = useMemo(
    () => (
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-3 xl:flex-row xl:items-end xl:justify-between">
          <Input
            isClearable
            className="w-full max-w-[340px]"
            placeholder="Search payment queue..."
            startContent={<Search className="h-4 w-4" />}
            value={searchValue}
            onClear={() => {
              setSearchValue("");
              setPage(1);
            }}
            onValueChange={(value) => {
              setSearchValue(value || "");
              setPage(1);
            }}
          />

          <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
            <Select
              className="w-full sm:w-[220px]"
              selectedKeys={new Set([paymentStatus])}
              onSelectionChange={(keys) => {
                const selectedValue = Array.from(keys)[0];
                if (!selectedValue) return;

                setPaymentStatus(String(selectedValue));
                setPage(1);
              }}
            >
              {PAYMENT_STATUS_OPTIONS.map((option) => (
                <SelectItem key={option.value} textValue={option.label}>
                  {option.label}
                </SelectItem>
              ))}
            </Select>

            <Dropdown>
              <DropdownTrigger>
                <Button
                  variant="flat"
                  endContent={<ChevronDown className="h-4 w-4" />}
                >
                  Columns
                </Button>
              </DropdownTrigger>
              <DropdownMenu
                disallowEmptySelection
                aria-label="Visible payment queue columns"
                closeOnSelect={false}
                selectionMode="multiple"
                selectedKeys={visibleColumns}
                onSelectionChange={setVisibleColumns}
              >
                {columns.map((column) => (
                  <DropdownItem key={column.uid}>{column.name}</DropdownItem>
                ))}
              </DropdownMenu>
            </Dropdown>
          </div>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <span className="text-small text-default-500">
            Total {filteredItems.length} expenses
          </span>

          <label className="flex items-center gap-2 text-small text-default-500">
            Rows per page:
            <select
              className="rounded-md border border-default-200 bg-transparent px-2 py-1 text-small outline-none"
              value={rowsPerPage}
              onChange={(event) => {
                setRowsPerPage(Number(event.target.value));
                setPage(1);
              }}
            >
              <option value="5">5</option>
              <option value="10">10</option>
              <option value="25">25</option>
              <option value="50">50</option>
            </select>
          </label>
        </div>
      </div>
    ),
    [
      fetchPaymentQueue,
      filteredItems.length,
      paymentQueueLoading,
      paymentStatus,
      rowsPerPage,
      searchValue,
      visibleColumns,
    ],
  );

  const bottomContent = useMemo(
    () => (
      <div className="flex items-center justify-between px-2 py-2">
        <span className="text-small text-default-500">
          Page {page} of {totalPages}
        </span>
        <Pagination
          isCompact
          showControls
          color="primary"
          page={page}
          total={totalPages}
          onChange={setPage}
        />
      </div>
    ),
    [page, totalPages],
  );

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="font-sans text-2xl font-medium">
          Expense Payment Queue
        </h1>
        <p className="mt-1 text-sm text-default-500">
          Review expenses by payment status and track requested, approved, paid,
          and outstanding amounts.
        </p>
      </div>

      <Table
        isHeaderSticky
        aria-label="Expense payment queue table"
        sortDescriptor={sortDescriptor}
        onSortChange={setSortDescriptor}
        topContent={topContent}
        topContentPlacement="outside"
        bottomContent={bottomContent}
        bottomContentPlacement="outside"
        classNames={{
          wrapper: "w-full md:max-h-[62vh] 2xl:max-h-[68vh]",
          table: "w-full",
        }}
      >
        <TableHeader columns={headerColumns}>
          {(column) => (
            <TableColumn
              key={column.uid}
              allowsSorting={column.uid !== "actions"}
              align={column.uid === "actions" ? "center" : "start"}
            >
              {column.name}
            </TableColumn>
          )}
        </TableHeader>

        <TableBody
          isLoading={paymentQueueLoading}
          items={paginatedItems}
          emptyContent={
            paymentQueueLoading
              ? "Loading expense payment queue..."
              : paymentQueueError?.message ||
                paymentQueueError ||
                "No expenses found"
          }
        >
          {(expense) => (
            <TableRow
              key={
                expense?.expenseId ||
                expense?.activityId ||
                `${expense?.projectId}-${expense?.externalReference}`
              }
            >
              {(columnKey) => (
                <TableCell>{renderCell(expense, columnKey)}</TableCell>
              )}
            </TableRow>
          )}
        </TableBody>
      </Table>

      <Modal
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        size="lg"
        isDismissable={!isDecisionSubmitting}
        isKeyboardDismissDisabled={isDecisionSubmitting}
        onClose={resetDecisionModal}
      >
        <ModalContent>
          {(modalClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                Update Accounts Decision
                <span className="text-sm font-normal text-default-500">
                  Expense #{selectedExpense?.expenseId || "-"} ·{" "}
                  {selectedExpense?.projectName || "-"}
                </span>
              </ModalHeader>

              <ModalBody>
                <div className="rounded-lg border border-default-200 bg-default-50 p-3">
                  <div className="grid grid-cols-1 gap-2 text-sm sm:grid-cols-2">
                    <div>
                      <span className="text-default-500">Requested Amount</span>
                      <p className="font-semibold">
                        {formatCurrency(
                          selectedExpense?.requestedAmount,
                          selectedExpense?.currencyCode,
                        )}
                      </p>
                    </div>
                    <div>
                      <span className="text-default-500">
                        Current Accounts Status
                      </span>
                      <p className="font-semibold">
                        {formatText(selectedExpense?.accountsApprovalStatus)}
                      </p>
                    </div>
                  </div>
                </div>

                <Select
                  label="Status"
                  placeholder="Select accounts decision"
                  isRequired
                  selectedKeys={
                    decisionForm.status
                      ? new Set([decisionForm.status])
                      : new Set([])
                  }
                  isInvalid={Boolean(decisionErrors.status)}
                  errorMessage={decisionErrors.status}
                  onSelectionChange={(keys) => {
                    const status = String(Array.from(keys)[0] || "");

                    setDecisionForm((previous) => ({
                      ...previous,
                      status,
                      approvedAmount:
                        status === "APPROVED"
                          ? previous.approvedAmount ||
                            String(selectedExpense?.requestedAmount ?? "")
                          : "",
                    }));
                    setDecisionErrors((previous) => ({
                      ...previous,
                      status: "",
                      approvedAmount: "",
                    }));
                  }}
                >
                  {ACCOUNT_DECISION_OPTIONS.map((option) => (
                    <SelectItem key={option.value} textValue={option.label}>
                      {option.label}
                    </SelectItem>
                  ))}
                </Select>

                <Input
                  type="number"
                  min="0.01"
                  step="0.01"
                  inputMode="decimal"
                  label="Approved Amount"
                  placeholder="Enter approved amount"
                  isRequired={decisionForm.status === "APPROVED"}
                  isDisabled={decisionForm.status !== "APPROVED"}
                  value={decisionForm.approvedAmount}
                  isInvalid={Boolean(decisionErrors.approvedAmount)}
                  errorMessage={decisionErrors.approvedAmount}
                  onKeyDown={(event) => {
                    if (["-", "+", "e", "E"].includes(event.key)) {
                      event.preventDefault();
                    }
                  }}
                  onChange={(event) => {
                    const value = event.target.value;

                    if (value !== "" && !/^\d*(\.\d{0,2})?$/.test(value)) {
                      return;
                    }

                    setDecisionForm((previous) => ({
                      ...previous,
                      approvedAmount: value,
                    }));
                    setDecisionErrors((previous) => ({
                      ...previous,
                      approvedAmount: "",
                    }));
                  }}
                />

                <Textarea
                  label="Remark"
                  placeholder="Enter accounts decision remark"
                  minRows={3}
                  isRequired
                  value={decisionForm.remark}
                  isInvalid={Boolean(decisionErrors.remark)}
                  errorMessage={decisionErrors.remark}
                  onValueChange={(value) => {
                    setDecisionForm((previous) => ({
                      ...previous,
                      remark: value,
                    }));
                    setDecisionErrors((previous) => ({
                      ...previous,
                      remark: "",
                    }));
                  }}
                />
              </ModalBody>

              <ModalFooter>
                <Button
                  variant="light"
                  isDisabled={isDecisionSubmitting}
                  onPress={() => {
                    resetDecisionModal();
                    modalClose();
                  }}
                >
                  Cancel
                </Button>
                <Button
                  color="primary"
                  isLoading={isDecisionSubmitting}
                  onPress={handleAccountsDecision}
                >
                  Submit Decision
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
};

export default Expense;
