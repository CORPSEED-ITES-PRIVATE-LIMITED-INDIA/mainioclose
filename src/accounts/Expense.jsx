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
  useDisclosure,
} from "@heroui/react";
import { parseDate } from "@internationalized/date";
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
import FileUploader from "../components/FileUploader.jsx";
import {
  expenseFundTransfer,
  getActivePaymentLedgerForPaymentRegister,
} from "../toolkit/slices/accountSlice";
import NewSelect from "../components/NewSelect";

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
  // Fund transfer fields (used only when status === "APPROVED")
  fromBankLedgerId: "",
  toBankLedgerId: "",
  transferDate: "",
  transferReference: "",
  transferProofUrl: "",
};

// Only bank ledgers are allowed for fund transfer (exclude cash ledgers).
const isCashLedger = (ledger) => {
  const ledgerName = String(ledger?.ledgerName || "")
    .trim()
    .toLowerCase();
  const ledgerType = String(ledger?.ledgerType || "")
    .trim()
    .toLowerCase();

  return ledgerType === "cash" || ledgerName.includes("cash");
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
  const paymentLegerList = useSelector(
    (state) => state.account.paymentLegerList,
  );

  const resolvedUserId = Number(
    userId || currentUser?.id || currentUser?.userId || currentUser?.employeeId,
  );

  const [searchValue, setSearchValue] = useState("");
  const [isAttachmentUploading, setIsAttachmentUploading] = useState(false);
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

  // Load the active bank/cash ledgers used for the fund transfer selects.
  useEffect(() => {
    dispatch(getActivePaymentLedgerForPaymentRegister());
  }, [dispatch]);

  // Bank-only ledger list for the From/To bank selects.
  const bankLedgerList = useMemo(
    () =>
      Array.isArray(paymentLegerList)
        ? paymentLegerList.filter((ledger) => !isCashLedger(ledger))
        : [],
    [paymentLegerList],
  );

  const getBankLedgerName = useCallback(
    (bankLedgerId) => {
      if (
        bankLedgerId === "" ||
        bankLedgerId === null ||
        bankLedgerId === undefined
      ) {
        return "";
      }

      const selectedLedger = (paymentLegerList || []).find(
        (ledger) => Number(ledger?.id) === Number(bankLedgerId),
      );

      return selectedLedger?.ledgerName || "";
    },
    [paymentLegerList],
  );

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
    setIsAttachmentUploading(false);
  }, []);

  const openDecisionModal = useCallback(
    (expense) => {
      setSelectedExpense(expense);
      setDecisionForm({
        ...INITIAL_DECISION_FORM,
        status: "",
        approvedAmount:
          expense?.approvedAmount !== null &&
          expense?.approvedAmount !== undefined
            ? String(expense.approvedAmount)
            : String(expense?.requestedAmount ?? ""),
        remark: "",
        transferDate: dayjs().format("YYYY-MM-DD"),
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

      // Fund transfer validations (only required on approval)
      const fromBankLedgerId = Number(decisionForm.fromBankLedgerId);
      const toBankLedgerId = Number(decisionForm.toBankLedgerId);

      if (decisionForm.fromBankLedgerId === "") {
        errors.fromBankLedgerId = "From bank is required";
      } else if (!Number.isFinite(fromBankLedgerId) || fromBankLedgerId <= 0) {
        errors.fromBankLedgerId = "Select a valid from bank";
      }

      if (decisionForm.toBankLedgerId === "") {
        errors.toBankLedgerId = "To bank is required";
      } else if (!Number.isFinite(toBankLedgerId) || toBankLedgerId <= 0) {
        errors.toBankLedgerId = "Select a valid to bank";
      }

      if (
        !errors.fromBankLedgerId &&
        !errors.toBankLedgerId &&
        fromBankLedgerId === toBankLedgerId
      ) {
        errors.toBankLedgerId = "To bank must be different from the from bank";
      }

      if (!decisionForm.transferDate) {
        errors.transferDate = "Transfer date is required";
      }

      if (!decisionForm.transferReference?.trim()) {
        errors.transferReference = "Transfer reference is required";
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

      const isApproved = decisionForm.status === "APPROVED";

      const payload = {
        status: decisionForm.status,
        approvedAmount: isApproved
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

      if (response?.meta?.requestStatus !== "fulfilled") {
        addToast({
          title: "Failed to update accounts decision",
          description:
            response?.payload?.message ||
            response?.payload?.error ||
            response?.payload ||
            "Something went wrong while updating the expense.",
          color: "danger",
        });
        return;
      }

      // On approval, also trigger the fund transfer.
      if (isApproved) {
        const transferPayload = {
          fromBankLedgerId: Number(decisionForm.fromBankLedgerId),
          fromBankName: getBankLedgerName(decisionForm.fromBankLedgerId),
          toBankLedgerId: Number(decisionForm.toBankLedgerId),
          toBankName: getBankLedgerName(decisionForm.toBankLedgerId),
          amount: Number(Number(decisionForm.approvedAmount).toFixed(2)),
          transferDate: decisionForm.transferDate,
          transferReference: decisionForm.transferReference.trim(),
          transferProofUrl: decisionForm.transferProofUrl.trim(),
          remark: decisionForm.remark.trim(),
        };

        const transferResponse = await dispatch(
          expenseFundTransfer({
            expenseId: selectedExpense.expenseId,
            projectId: selectedExpense.projectId,
            userId: resolvedUserId,
            data: transferPayload,
          }),
        );

        if (transferResponse?.meta?.requestStatus !== "fulfilled") {
          addToast({
            title: "Accounts decision saved, but fund transfer failed",
            description:
              transferResponse?.payload?.message ||
              transferResponse?.payload?.error ||
              transferResponse?.payload ||
              "The expense was approved but the fund transfer could not be completed.",
            color: "warning",
          });

          resetDecisionModal();
          onClose();
          fetchPaymentQueue();
          return;
        }

        addToast({
          title: "Accounts decision & fund transfer completed",
          description: `Expense #${selectedExpense.expenseId} was approved and funds were transferred.`,
          color: "success",
        });

        resetDecisionModal();
        onClose();
        fetchPaymentQueue();
        return;
      }

      addToast({
        title: "Accounts decision updated successfully",
        description: `Expense #${selectedExpense.expenseId} was updated.`,
        color: "success",
      });

      resetDecisionModal();
      onClose();
      fetchPaymentQueue();
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
    getBankLedgerName,
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
            <span className="font-medium text-[12.5px]">
              #{expense?.expenseId ?? "-"}
            </span>
          );

        case "project":
          return (
            <div className="flex max-w-[240px] flex-col">
              <span className="truncate text-[12.5px] font-semibold">
                {expense?.projectName || "-"}
              </span>
              <span className="text-[11.5px] text-default-500">
                {expense?.projectNo ||
                  `Project ID: ${expense?.projectId || "-"}`}
              </span>
            </div>
          );

        case "unbilledNumber":
          return (
            <span className="whitespace-nowrap text-[12.5px]">
              {expense?.unbilledNumber || "-"}
            </span>
          );

        case "productName":
          return (
            <span className="text-[12.5px]">{expense?.productName || "-"}</span>
          );

        case "expenseCategory":
          return (
            <Chip size="sm" variant="flat">
              {formatText(expense?.expenseCategory)}
            </Chip>
          );

        case "requestedAmount":
          return (
            <span className="whitespace-nowrap text-[12.5px] font-semibold">
              {formatCurrency(expense?.requestedAmount, currencyCode)}
            </span>
          );

        case "approvedAmount":
          return (
            <span className="whitespace-nowrap text-[12.5px]">
              {formatCurrency(expense?.approvedAmount, currencyCode)}
            </span>
          );

        case "paidAmount":
          return (
            <span className="whitespace-nowrap text-[12.5px]">
              {formatCurrency(expense?.paidAmount, currencyCode)}
            </span>
          );

        case "outstandingAmount":
          return (
            <span className="whitespace-nowrap text-[12.5px] font-semibold">
              {formatCurrency(expense?.outstandingAmount, currencyCode)}
            </span>
          );

        case "department":
          return (
            <div className="flex flex-col">
              <span className="text-[12.5px]">
                {expense?.raisedDepartmentName || "-"}
              </span>
              {expense?.raisedDepartmentId && (
                <span className="text-[11.5px] text-default-500">
                  ID: {expense.raisedDepartmentId}
                </span>
              )}
            </div>
          );

        case "createdBy":
          return (
            <div className="flex flex-col">
              <span className="text-[12.5px]">
                {expense?.createdByUserName || "-"}
              </span>
              {expense?.createdByUserId && (
                <span className="text-[11.5px] text-default-500">
                  User ID: {expense.createdByUserId}
                </span>
              )}
            </div>
          );

        case "expenseDate":
          return (
            <span className="whitespace-nowrap text-[12.5px]">
              {formatDateTime(expense?.expenseDate)}
            </span>
          );

        case "createdDate":
          return (
            <span className="whitespace-nowrap text-[12.5px]">
              {formatDateTime(expense?.createdDate)}
            </span>
          );

        case "updatedDate":
          return (
            <span className="whitespace-nowrap text-[12.5px]">
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
                <span className="text-[11.5px] text-default-500">
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
                <span className="text-[11.5px] text-default-500">
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
                className="truncate text-[12.5px]"
                title={expense?.externalReference || "-"}
              >
                {expense?.externalReference || "-"}
              </span>
              <span
                className="truncate text-[11.5px] text-default-500"
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

          // const canTakeDecision =
          //   approvalStage === "ACCOUNTS_REVIEW" &&
          //   crtStatus === "APPROVED" &&
          //   !["APPROVED", "REJECTED", "CANCELLED"].includes(accountsStatus);

          // if (!canTakeDecision) {
          //   return <span className="text-default-400">-</span>;
          // }

          return (
            <Dropdown placement="bottom-end">
              <DropdownTrigger>
                <Button
                  isIconOnly
                  size="sm"
                  variant="light"
                  aria-label={`Actions for expense ${expense?.expenseId}`}
                >
                  <EllipsisVertical className="h-4 w-4" />
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
      <div className="flex flex-col gap-2">
        <div className="flex justify-between gap-2 items-center flex-wrap">
          <Input
            isClearable
            size="sm"
            className="w-full sm:max-w-[280px]"
            classNames={{ inputWrapper: "h-8 min-h-8" }}
            placeholder="Search payment queue..."
            startContent={<Search className="w-4 h-4 text-default-400" />}
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

          <div className="flex gap-1.5 flex-wrap">
            <div className="w-[180px]">
              <Select
                size="sm"
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
            </div>

            <Dropdown>
              <DropdownTrigger>
                <Button
                  variant="flat"
                  endContent={<ChevronDown className="w-3.5 h-3.5" />}
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

        <div className="flex justify-between items-center">
          <span className="text-default-400 text-[12.5px]">
            Total {filteredItems.length} expenses
          </span>

          <label className="flex items-center gap-1 text-default-400 text-[12.5px]">
            Rows per page:
            <select
              className="bg-transparent outline-hidden text-default-400 text-[12.5px] cursor-pointer"
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
      <div className="py-1.5 px-1 flex items-center justify-between">
        <span className="text-[12.5px] text-default-400">
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

  const isApprovedDecision = decisionForm.status === "APPROVED";

  return (
    <div className="flex flex-col gap-2">
      <div className="shrink-0 mb-2">
        <h1 className="font-sans text-lg font-semibold">
          Expense Payment Queue
        </h1>
        <p className="text-default-500 text-[12.5px]">
          Review expenses by payment status and track requested, approved, paid,
          and outstanding amounts.
        </p>
      </div>
      <Table
        isHeaderSticky
        removeWrapper={false}
        aria-label="Expense payment queue table"
        sortDescriptor={sortDescriptor}
        onSortChange={setSortDescriptor}
        topContent={topContent}
        topContentPlacement="outside"
        bottomContent={bottomContent}
        bottomContentPlacement="outside"
        classNames={{
          base: "gap-2.5",
          wrapper:
            "max-h-[calc(100vh-320px)] w-full overflow-y-auto rounded-lg border border-gray-200 dark:border-white/10 shadow-none p-0",
          table: "w-full",
          thead: "[&>tr]:first:rounded-none",
          th: "h-8 py-0 text-[11.5px] tracking-wide bg-gray-50 dark:bg-neutral-900 text-default-500 first:rounded-none last:rounded-none border-b border-gray-200 dark:border-white/10",
          td: "py-1.5 text-[12.5px]",
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
      ```jsx
      <Modal
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        size="lg"
        scrollBehavior="inside"
        isDismissable={!isDecisionSubmitting}
        isKeyboardDismissDisabled={isDecisionSubmitting}
        onClose={resetDecisionModal}
        classNames={{
          base: "max-h-[90vh]",
          header: "border-b border-default-200 px-5 py-4",
          body: "px-5 py-4 overflow-y-auto",
          footer: "border-t border-default-200 px-5 py-4",
        }}
      >
        <ModalContent>
          {(modalClose) => (
            <>
              {/* Header - fixed */}
              <ModalHeader className="flex flex-col gap-1">
                <span className="text-base font-semibold">
                  Update Accounts Decision
                </span>

                <span className="text-xs font-normal text-default-500">
                  Expense #{selectedExpense?.expenseId || "-"} ·{" "}
                  {selectedExpense?.projectName || "-"}
                </span>
              </ModalHeader>

              {/* Body - scrollable */}
              <ModalBody className="gap-4">
                {/* Expense summary */}
                <div className="rounded-xl border border-default-200 bg-default-50/70 p-3">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-default-500">
                        Requested Amount
                      </p>
                      <p className="mt-1 text-sm font-semibold">
                        {formatCurrency(
                          selectedExpense?.requestedAmount,
                          selectedExpense?.currencyCode,
                        )}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-default-500">
                        Current Accounts Status
                      </p>
                      <p className="mt-1 text-sm font-semibold">
                        {formatText(selectedExpense?.accountsApprovalStatus)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Decision */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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
                    isRequired={isApprovedDecision}
                    isDisabled={!isApprovedDecision}
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
                </div>

                {/* Fund Transfer */}
                {isApprovedDecision && (
                  <div className="rounded-xl border border-default-200 bg-default-50/50 p-4">
                    <div className="mb-3">
                      <p className="text-sm font-semibold">
                        Fund Transfer Details
                      </p>
                      <p className="text-xs text-default-500">
                        Enter the bank details used for this payment.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div>
                        <NewSelect
                          isRequired
                          label="From Bank"
                          data={bankLedgerList}
                          labelKey="ledgerName"
                          valueKey="id"
                          value={decisionForm.fromBankLedgerId ?? ""}
                          onChange={(value) => {
                            setDecisionForm((previous) => ({
                              ...previous,
                              fromBankLedgerId: value ?? "",
                            }));

                            setDecisionErrors((previous) => ({
                              ...previous,
                              fromBankLedgerId: "",
                            }));
                          }}
                        />

                        {decisionErrors.fromBankLedgerId && (
                          <p className="mt-1 text-xs text-danger">
                            {decisionErrors.fromBankLedgerId}
                          </p>
                        )}
                      </div>

                      <div>
                        <NewSelect
                          isRequired
                          label="To Bank"
                          data={bankLedgerList}
                          labelKey="ledgerName"
                          valueKey="id"
                          value={decisionForm.toBankLedgerId ?? ""}
                          onChange={(value) => {
                            setDecisionForm((previous) => ({
                              ...previous,
                              toBankLedgerId: value ?? "",
                            }));

                            setDecisionErrors((previous) => ({
                              ...previous,
                              toBankLedgerId: "",
                            }));
                          }}
                        />

                        {decisionErrors.toBankLedgerId && (
                          <p className="mt-1 text-xs text-danger">
                            {decisionErrors.toBankLedgerId}
                          </p>
                        )}
                      </div>

                      <DatePicker
                        label="Transfer Date"
                        isRequired
                        variant="bordered"
                        granularity="day"
                        value={
                          decisionForm.transferDate
                            ? parseDate(decisionForm.transferDate)
                            : null
                        }
                        isInvalid={Boolean(decisionErrors.transferDate)}
                        errorMessage={decisionErrors.transferDate}
                        onChange={(date) => {
                          setDecisionForm((previous) => ({
                            ...previous,
                            transferDate: date?.toString() || "",
                          }));

                          setDecisionErrors((previous) => ({
                            ...previous,
                            transferDate: "",
                          }));
                        }}
                      />

                      <Input
                        label="Transfer Reference"
                        placeholder="Enter transfer reference"
                        isRequired
                        value={decisionForm.transferReference}
                        isInvalid={Boolean(decisionErrors.transferReference)}
                        errorMessage={decisionErrors.transferReference}
                        onValueChange={(value) => {
                          setDecisionForm((previous) => ({
                            ...previous,
                            transferReference: value,
                          }));

                          setDecisionErrors((previous) => ({
                            ...previous,
                            transferReference: "",
                          }));
                        }}
                      />
                    </div>

                    <div className="mt-4">
                      <FileUploader
                        label="Transfer Proof Attachment"
                        placeholder="Drag & drop proof file here, paste, or choose a file"
                        value={decisionForm.transferProofUrl}
                        uploadingType="single"
                        isRequired={false}
                        onChange={(value) => {
                          setDecisionForm((previous) => ({
                            ...previous,
                            transferProofUrl: value || "",
                          }));

                          setDecisionErrors((previous) => ({
                            ...previous,
                            transferProofUrl: "",
                          }));
                        }}
                        onUploadingChange={setIsAttachmentUploading}
                        onUploadSuccess={(uploadedMeta) => {
                          setDecisionForm((previous) => ({
                            ...previous,
                            transferProofUrl: uploadedMeta?.filePath || "",
                          }));

                          addToast({
                            title: "Attachment uploaded",
                            description: uploadedMeta?.fileName
                              ? `${uploadedMeta.fileName} uploaded successfully.`
                              : "Transfer proof uploaded successfully.",
                            color: "success",
                          });
                        }}
                        errorMessage={decisionErrors.transferProofUrl}
                      />
                    </div>

                    <div className="mt-3 rounded-lg bg-primary-50 px-3 py-2">
                      <p className="text-xs text-default-500">
                        Transfer amount
                      </p>

                      <p className="text-sm font-semibold text-primary">
                        {formatCurrency(
                          decisionForm.approvedAmount,
                          selectedExpense?.currencyCode,
                        )}
                      </p>
                    </div>
                  </div>
                )}

                {/* Remark */}
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

              {/* Footer - fixed */}
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
                  isLoading={isDecisionSubmitting || isAttachmentUploading}
                  isDisabled={isAttachmentUploading}
                  onPress={handleAccountsDecision}
                >
                  {isAttachmentUploading
                    ? "Uploading Attachment..."
                    : "Submit Decision"}
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
      ```
    </div>
  );
};

export default Expense;
