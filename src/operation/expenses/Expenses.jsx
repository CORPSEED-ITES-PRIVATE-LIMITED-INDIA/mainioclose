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
} from "@heroui/react";

import { ExternalLink, MoreVertical, PencilLine, Search } from "lucide-react";

import dayjs from "dayjs";
import React, { useCallback, useEffect, useMemo, useState } from "react";

import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";

import {
  getExpenseApprovalQueueList,
  updateCrtExpenseDecision,
  payGovernmentPortalFee,
  accountsApproveGovernmentFee,
} from "../../toolkit/slices/operationSlice";
import { getActivePaymentLedgerForPaymentRegister } from "../../toolkit/slices/accountSlice";
import NewSelect from "../../components/NewSelect";
import SingleFileUploader from "../../components/SingleFileUploader";
import FileUploader from "../../components/FileUploader";
import { getLocalTimeZone, parseDate, today } from "@internationalized/date";

const columns = [
  { name: "PROJECT", uid: "project" },
  { name: "PRODUCT", uid: "productName" },
  { name: "EXPENSE CATEGORY", uid: "expenseCategory" },
  { name: "REQUESTED AMOUNT", uid: "requestedAmount" },
  { name: "APPROVED AMOUNT", uid: "approvedAmount" },
  { name: "PAID AMOUNT", uid: "paidAmount" },
  { name: "OUTSTANDING AMOUNT", uid: "outstandingAmount" },
  { name: "DEPARTMENT", uid: "department" },
  { name: "CREATED BY", uid: "createdBy" },
  { name: "EXPENSE DATE", uid: "expenseDate" },
  { name: "EXPENSE GENERATED DATE", uid: "createdDate" },
  { name: "LAST UPDATED DATE", uid: "updatedDate" },
  { name: "APPROVAL STAGE", uid: "approvalStage" },
  { name: "APPROVAL STATUS", uid: "approvalStatus" },
  { name: "CRT STATUS", uid: "crtApprovalStatus" },
  { name: "ACCOUNTS STATUS", uid: "accountsApprovalStatus" },
  { name: "PAYMENT STATUS", uid: "paymentStatus" },
  { name: "REFERENCE", uid: "externalReference" },
  { name: "ATTACHMENT", uid: "attachment" },
  { name: "ACTION", uid: "actions" },
];

const INITIAL_VISIBLE_COLUMNS = [
  "project",
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
  "updatedDate",
  "approvalStage",
  "approvalStatus",
  "crtApprovalStatus",
  "accountsApprovalStatus",
  "paymentStatus",
  "externalReference",
  "attachment",
  "actions",
];

const approvalStageOptions = [
  { label: "CRT Review", value: "CRT_REVIEW" },
  { label: "Accounts Review", value: "ACCOUNTS_REVIEW" },
  { label: "Completed", value: "COMPLETED" },
];

const approvalStatusOptions = [
  { label: "All Statuses", value: "ALL" },
  { label: "Pending", value: "PENDING" },
  { label: "Approved", value: "APPROVED" },
  { label: "Rejected", value: "REJECTED" },
  { label: "On Hold", value: "ON_HOLD" },
  { label: "Cancelled", value: "CANCELLED" },
];

const crtDecisionOptions = [
  { label: "Approved", value: "APPROVED" },
  { label: "Rejected", value: "REJECTED" },
  { label: "On Hold", value: "ON_HOLD" },
];

const governmentFeeDecisionOptions = [
  { label: "Approved", value: "APPROVED" },
  { label: "Rejected", value: "REJECTED" },
];

const formatText = (value) => {
  if (!value) return "-";

  return String(value)
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(/\b\w/g, (character) => character.toUpperCase());
};

const formatDateTime = (value) => {
  if (!value) return "-";

  const date = dayjs(value);

  if (!date.isValid()) return "-";

  return date.format("DD-MM-YYYY hh:mm A");
};

const formatCurrency = (amount, currencyCode = "INR") => {
  const numericAmount = Number(amount);

  if (Number.isNaN(numericAmount)) return "-";

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

const getStatusColor = (status) => {
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
    case "CANCELLED":
    case "REVERSED":
      return "danger";

    case "NOT_INITIATED":
    default:
      return "default";
  }
};

const Expenses = () => {
  const dispatch = useDispatch();
  const { userId } = useParams();

  const currentUser = useSelector((state) => state.auth.currentUser);

  const paymentLedgerList = useSelector(
    (state) => state.account.paymentLegerList,
  );

  const expenseApprovalQueueList = useSelector(
    (state) => state.operation.expenseApprovalQueueList,
  );

  const expenseApprovalQueueLoading = useSelector(
    (state) => state.operation.expenseApprovalQueueLoading,
  );

  const expenseApprovalQueueError = useSelector(
    (state) => state.operation.expenseApprovalQueueError,
  );

  const resolvedUserId = Number(
    userId || currentUser?.id || currentUser?.userId || currentUser?.employeeId,
  );

  const [searchValue, setSearchValue] = useState("");
  const [approvalStage, setApprovalStage] = useState("CRT_REVIEW");
  const [approvalStatus, setApprovalStatus] = useState("PENDING");

  const [visibleColumns, setVisibleColumns] = useState(
    new Set(INITIAL_VISIBLE_COLUMNS),
  );

  const [pagination, setPagination] = useState({
    page: 1,
    size: 50,
  });

  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState(null);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  const [isGovernmentFeeModalOpen, setIsGovernmentFeeModalOpen] =
    useState(false);

  const [governmentFeeExpense, setGovernmentFeeExpense] = useState(null);
  const [isPayingGovernmentFee, setIsPayingGovernmentFee] = useState(false);

  const [governmentFeeForm, setGovernmentFeeForm] = useState({
    amount: "",
    paymentDate: "",
    paymentReference: "",
    paymentReceiptUrl: "",
    paymentMode: "",
    bankLedgerId: "",
    remark: "",
  });
  const [governmentFeeErrors, setGovernmentFeeErrors] = useState({});

  const [decisionForm, setDecisionForm] = useState({
    status: "",
    expensePaidBy: "",
    paymentMode: "",
    bankLedgerId: "",
    transactionReference: "",
    paymentProof: "",
    clientPaymentDate: "",
    remark: "",
  });

  const [decisionErrors, setDecisionErrors] = useState({});

  const [
    isGovernmentFeeDecisionModalOpen,
    setIsGovernmentFeeDecisionModalOpen,
  ] = useState(false);
  const [governmentFeeDecisionExpense, setGovernmentFeeDecisionExpense] =
    useState(null);
  const [
    isSubmittingGovernmentFeeDecision,
    setIsSubmittingGovernmentFeeDecision,
  ] = useState(false);

  const [governmentFeeDecisionForm, setGovernmentFeeDecisionForm] = useState({
    status: "",
    remark: "",
  });
  const [governmentFeeDecisionErrors, setGovernmentFeeDecisionErrors] =
    useState({});

  useEffect(() => {
    dispatch(getActivePaymentLedgerForPaymentRegister());
  }, [dispatch]);

  const isCompanyPaidExpense = decisionForm.expensePaidBy === "COMPANY";
  const isCashPaymentMode = decisionForm.paymentMode === "CASH";

  const isCashLedger = useCallback((ledger) => {
    const ledgerName = String(ledger?.ledgerName || "")
      .trim()
      .toLowerCase();

    const ledgerType = String(ledger?.ledgerType || "")
      .trim()
      .toLowerCase();

    return ledgerType === "cash" || ledgerName.includes("cash");
  }, []);

  const filteredPaymentLedgerList = useMemo(() => {
    if (!decisionForm.paymentMode) {
      return [];
    }

    return isCashPaymentMode
      ? (paymentLedgerList || []).filter(isCashLedger)
      : (paymentLedgerList || []).filter((ledger) => !isCashLedger(ledger));
  }, [
    decisionForm.paymentMode,
    isCashPaymentMode,
    isCashLedger,
    paymentLedgerList,
  ]);

  const isGovernmentFeeCashPaymentMode =
    governmentFeeForm.paymentMode === "CASH";

  const filteredGovernmentFeeLedgerList = useMemo(() => {
    if (!governmentFeeForm.paymentMode) {
      return [];
    }

    return isGovernmentFeeCashPaymentMode
      ? (paymentLedgerList || []).filter(isCashLedger)
      : (paymentLedgerList || []).filter((ledger) => !isCashLedger(ledger));
  }, [
    governmentFeeForm.paymentMode,
    isGovernmentFeeCashPaymentMode,
    isCashLedger,
    paymentLedgerList,
  ]);

  const fetchExpenseApprovalQueue = useCallback(() => {
    if (!resolvedUserId) {
      addToast({
        title: "User not found",
        description: "User ID is required to load expenses.",
        color: "danger",
      });

      return;
    }

    dispatch(
      getExpenseApprovalQueueList({
        userId: resolvedUserId,
        approvalStage,
        approvalStatus,
      }),
    ).then((response) => {
      if (response.meta.requestStatus === "rejected") {
        addToast({
          title: "Failed to load expenses",
          description:
            response?.payload?.message ||
            response?.payload ||
            "Failed to fetch expense approval queue.",
          color: "danger",
        });
      }
    });
  }, [dispatch, resolvedUserId, approvalStage, approvalStatus]);

  useEffect(() => {
    fetchExpenseApprovalQueue();
  }, [fetchExpenseApprovalQueue]);

  const closeGovernmentFeeDecisionModal = useCallback(() => {
    if (isSubmittingGovernmentFeeDecision) {
      return;
    }

    setIsGovernmentFeeDecisionModalOpen(false);
    setGovernmentFeeDecisionExpense(null);
    setGovernmentFeeDecisionForm({ status: "", remark: "" });
    setGovernmentFeeDecisionErrors({});
  }, [isSubmittingGovernmentFeeDecision]);

  const openGovernmentFeeDecisionModal = useCallback((expense) => {
    setGovernmentFeeDecisionExpense(expense);
    setGovernmentFeeDecisionForm({ status: "", remark: "" });
    setGovernmentFeeDecisionErrors({});
    setIsGovernmentFeeDecisionModalOpen(true);
  }, []);

  const validateGovernmentFeeDecisionForm = useCallback(() => {
    const errors = {};

    if (!governmentFeeDecisionForm.status) {
      errors.status = "Status is required";
    }

    if (!governmentFeeDecisionForm.remark.trim()) {
      errors.remark = "Remark is required";
    }

    setGovernmentFeeDecisionErrors(errors);

    return Object.keys(errors).length === 0;
  }, [governmentFeeDecisionForm]);

  const handleGovernmentFeeDecision = useCallback(async () => {
    if (!validateGovernmentFeeDecisionForm()) {
      return;
    }

    if (!resolvedUserId) {
      addToast({
        title: "User not found",
        description: "User ID is required to submit this decision.",
        color: "danger",
      });

      return;
    }

    if (
      !governmentFeeDecisionExpense?.projectId ||
      !governmentFeeDecisionExpense?.expenseId
    ) {
      addToast({
        title: "Expense details missing",
        description: "Project ID and expense ID are required.",
        color: "danger",
      });

      return;
    }

    setIsSubmittingGovernmentFeeDecision(true);

    try {
      await dispatch(
        accountsApproveGovernmentFee({
          expenseId: governmentFeeDecisionExpense.expenseId,
          projectId: governmentFeeDecisionExpense.projectId,
          userId: resolvedUserId,
          data: {
            status: governmentFeeDecisionForm.status,
            remark: governmentFeeDecisionForm.remark.trim(),
          },
        }),
      ).unwrap();

      addToast({
        title: "Decision submitted",
        description: "The government fee decision was submitted successfully.",
        color: "success",
      });

      closeGovernmentFeeDecisionModal();
      fetchExpenseApprovalQueue();
    } catch (error) {
      addToast({
        title: "Failed to submit decision",
        description:
          error?.message ||
          error?.errorMessage ||
          error ||
          "Unable to submit the government fee decision.",
        color: "danger",
      });
    } finally {
      setIsSubmittingGovernmentFeeDecision(false);
    }
  }, [
    closeGovernmentFeeDecisionModal,
    dispatch,
    fetchExpenseApprovalQueue,
    governmentFeeDecisionExpense,
    governmentFeeDecisionForm,
    resolvedUserId,
    validateGovernmentFeeDecisionForm,
  ]);

  const expenseRows = useMemo(() => {
    return Array.isArray(expenseApprovalQueueList)
      ? expenseApprovalQueueList
      : [];
  }, [expenseApprovalQueueList]);

  const headerColumns = useMemo(() => {
    if (visibleColumns === "all") {
      return columns;
    }

    return columns.filter((column) =>
      Array.from(visibleColumns).includes(column.uid),
    );
  }, [visibleColumns]);

  const filteredItems = useMemo(() => {
    if (!searchValue.trim()) {
      return expenseRows;
    }

    const search = searchValue.trim().toLowerCase();

    return expenseRows.filter((item) => {
      const searchableValues = [
        item?.expenseId,
        item?.activityId,
        item?.projectId,
        item?.projectNo,
        item?.projectName,
        item?.unbilledNumber,
        item?.productName,
        item?.raisedDepartmentId,
        item?.raisedDepartmentName,
        item?.expenseCategory,
        item?.requestedAmount,
        item?.approvedAmount,
        item?.paidAmount,
        item?.outstandingAmount,
        item?.currencyCode,
        item?.createdByUserId,
        item?.createdByUserName,
        item?.expenseDate,
        item?.createdDate,
        item?.updatedDate,
        item?.paymentCompletedDate,
        item?.remark,
        item?.externalReference,
        item?.approvalStage,
        item?.approvalStatus,
        item?.crtApprovalStatus,
        item?.accountsApprovalStatus,
        item?.paymentStatus,
      ];

      return searchableValues
        .filter(
          (value) => value !== null && value !== undefined && value !== "",
        )
        .some((value) => String(value).toLowerCase().includes(search));
    });
  }, [expenseRows, searchValue]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredItems.length / pagination.size),
  );

  useEffect(() => {
    setPagination((previous) => ({
      ...previous,
      page: Math.min(previous.page, totalPages),
    }));
  }, [totalPages]);

  const paginatedItems = useMemo(() => {
    const startIndex = (pagination.page - 1) * pagination.size;
    const endIndex = startIndex + pagination.size;

    return filteredItems.slice(startIndex, endIndex);
  }, [filteredItems, pagination.page, pagination.size]);

  const closeStatusModal = useCallback(() => {
    if (isUpdatingStatus) {
      return;
    }

    setIsStatusModalOpen(false);
    setSelectedExpense(null);

    setDecisionForm({
      status: "",
      expensePaidBy: "",
      paymentMode: "",
      bankLedgerId: "",
      transactionReference: "",
      paymentProof: "",
      remark: "",
      clientPaymentDate: "",
    });

    setDecisionErrors({});
  }, [isUpdatingStatus]);

  const openStatusModal = useCallback((expense) => {
    setSelectedExpense(expense);

    setDecisionForm({
      status: "",
      expensePaidBy: "",
      paymentMode: "",
      bankLedgerId: "",
      transactionReference: "",
      paymentProof: "",
      remark: "",
      clientPaymentDate: "",
    });

    setDecisionErrors({});
    setIsStatusModalOpen(true);
  }, []);

  const validateDecisionForm = useCallback(() => {
    const errors = {};

    if (!decisionForm.status) {
      errors.status = "Status is required";
    }

    if (!decisionForm.expensePaidBy) {
      errors.expensePaidBy = "Expense paid by is required";
    }

    if (decisionForm.expensePaidBy === "COMPANY") {
      if (!decisionForm.paymentMode) {
        errors.paymentMode = "Payment mode is required";
      }

      if (!decisionForm.bankLedgerId) {
        errors.bankLedgerId = "Bank/Cash ledger is required";
      }

      if (!decisionForm.transactionReference.trim()) {
        errors.transactionReference =
          "Transaction reference number is required";
      }

      if (!decisionForm.paymentProof) {
        errors.paymentProof = "Payment attachment is required";
      }
    }

    if (!decisionForm.remark.trim()) {
      errors.remark = "Remark is required";
    }

    setDecisionErrors(errors);

    return Object.keys(errors).length === 0;
  }, [decisionForm]);

  const handleStatusUpdate = useCallback(async () => {
    if (!validateDecisionForm()) {
      return;
    }

    if (!resolvedUserId) {
      addToast({
        title: "User not found",
        description: "User ID is required to update the expense status.",
        color: "danger",
      });

      return;
    }

    if (!selectedExpense?.projectId || !selectedExpense?.expenseId) {
      addToast({
        title: "Expense details missing",
        description: "Project ID and expense ID are required.",
        color: "danger",
      });

      return;
    }

    setIsUpdatingStatus(true);

    try {
      await dispatch(
        updateCrtExpenseDecision({
          projectId: selectedExpense.projectId,
          expenseId: selectedExpense.expenseId,
          userId: resolvedUserId,
          data: {
            status: decisionForm.status,
            remark: decisionForm.remark.trim(),
            expensePaidBy: decisionForm.expensePaidBy || null,
            paymentMode: isCompanyPaidExpense ? decisionForm.paymentMode : null,
            clientPaymentDate: isCompanyPaidExpense
              ? decisionForm.clientPaymentDate
              : null,
            bankLedgerId: isCompanyPaidExpense
              ? Number(decisionForm.bankLedgerId)
              : null,
            transactionReference: isCompanyPaidExpense
              ? decisionForm.transactionReference.trim()
              : null,
            paymentProof: isCompanyPaidExpense
              ? decisionForm.paymentProof
              : null,
          },
        }),
      ).unwrap();

      addToast({
        title: "Status updated",
        description: "The CRT expense decision was updated successfully.",
        color: "success",
      });

      setIsStatusModalOpen(false);
      setSelectedExpense(null);

      setDecisionForm({
        status: "",
        expensePaidBy: "",
        paymentMode: "",
        bankLedgerId: "",
        transactionReference: "",
        paymentProof: "",
        remark: "",
        clientPaymentDate: "",
      });

      setDecisionErrors({});

      fetchExpenseApprovalQueue();
    } catch (error) {
      addToast({
        title: "Failed to update status",
        description:
          error?.message ||
          error?.errorMessage ||
          error ||
          "Unable to update the CRT expense decision.",
        color: "danger",
      });
    } finally {
      setIsUpdatingStatus(false);
    }
  }, [
    decisionForm,
    dispatch,
    fetchExpenseApprovalQueue,
    isCompanyPaidExpense,
    resolvedUserId,
    selectedExpense,
    validateDecisionForm,
  ]);

  const closeGovernmentFeeModal = useCallback(() => {
    if (isPayingGovernmentFee) {
      return;
    }

    setIsGovernmentFeeModalOpen(false);
    setGovernmentFeeExpense(null);

    setGovernmentFeeForm({
      amount: "",
      paymentDate: "",
      paymentReference: "",
      paymentReceiptUrl: "",
      paymentMode: "",
      bankLedgerId: "",
      remark: "",
    });

    setGovernmentFeeErrors({});
  }, [isPayingGovernmentFee]);

  const openGovernmentFeeModal = useCallback((expense) => {
    setGovernmentFeeExpense(expense);

    setGovernmentFeeForm({
      amount:
        expense?.governmentPaymentAmount !== null &&
        expense?.governmentPaymentAmount !== undefined
          ? String(expense.governmentPaymentAmount)
          : expense?.requestedAmount !== null &&
              expense?.requestedAmount !== undefined
            ? String(expense.requestedAmount)
            : "",

      paymentDate: expense?.governmentPaymentDate
        ? dayjs(expense.governmentPaymentDate).format("YYYY-MM-DD")
        : dayjs().format("YYYY-MM-DD"),

      paymentReference: expense?.governmentPaymentReference || "",
      paymentReceiptUrl: expense?.governmentPaymentReceiptUrl || "",
      paymentMode: expense?.governmentPaymentMode || "",
      bankLedgerId: expense?.governmentPaymentBankLedgerId
        ? String(expense.governmentPaymentBankLedgerId)
        : "",
      remark: expense?.governmentPaymentRemark || "",
    });

    setGovernmentFeeErrors({});
    setIsGovernmentFeeModalOpen(true);
  }, []);

  const validateGovernmentFeeForm = useCallback(() => {
    const errors = {};
    const amount = Number(governmentFeeForm.amount);

    if (!governmentFeeForm.amount || Number.isNaN(amount) || amount <= 0) {
      errors.amount = "Valid amount is required";
    }

    if (!governmentFeeForm.paymentDate) {
      errors.paymentDate = "Payment date is required";
    }

    if (!governmentFeeForm.paymentReference.trim()) {
      errors.paymentReference = "Payment reference is required";
    }

    if (!governmentFeeForm.paymentReceiptUrl.trim()) {
      errors.paymentReceiptUrl = "Payment receipt is required";
    }

    if (!governmentFeeForm.remark.trim()) {
      errors.remark = "Remark is required";
    }
    if (!governmentFeeForm.paymentMode) {
      errors.paymentMode = "Payment mode is required";
    }
    if (!governmentFeeForm.bankLedgerId) {
      errors.bankLedgerId = "Bank/Cash ledger is required";
    }

    setGovernmentFeeErrors(errors);

    return Object.keys(errors).length === 0;
  }, [governmentFeeForm]);

  const handleGovernmentFeePayment = useCallback(async () => {
    if (!validateGovernmentFeeForm()) {
      return;
    }

    if (!resolvedUserId) {
      addToast({
        title: "User not found",
        description: "User ID is required to submit government fee payment.",
        color: "danger",
      });

      return;
    }

    if (!governmentFeeExpense?.projectId || !governmentFeeExpense?.expenseId) {
      addToast({
        title: "Expense details missing",
        description: "Project ID and expense ID are required.",
        color: "danger",
      });

      return;
    }

    setIsPayingGovernmentFee(true);

    try {
      await dispatch(
        payGovernmentPortalFee({
          expenseId: governmentFeeExpense.expenseId,
          projectId: governmentFeeExpense.projectId,
          userId: resolvedUserId,
          data: {
            amount: Number(governmentFeeForm.amount),
            paymentDate: governmentFeeForm.paymentDate,
            paymentReference: governmentFeeForm.paymentReference.trim(),
            paymentReceiptUrl: governmentFeeForm.paymentReceiptUrl.trim(),
            paymentMode: governmentFeeForm.paymentMode,
            paymentBankLedgerId: Number(governmentFeeForm.bankLedgerId),
            remark: governmentFeeForm.remark.trim(),
          },
        }),
      ).unwrap();

      addToast({
        title: "Government fee updated",
        description: "Government fee payment was submitted successfully.",
        color: "success",
      });

      closeGovernmentFeeModal();
      fetchExpenseApprovalQueue();
    } catch (error) {
      addToast({
        title: "Failed to update government fee",
        description:
          error?.message ||
          error?.errorMessage ||
          error ||
          "Unable to submit government fee payment.",
        color: "danger",
      });
    } finally {
      setIsPayingGovernmentFee(false);
    }
  }, [
    closeGovernmentFeeModal,
    dispatch,
    fetchExpenseApprovalQueue,
    governmentFeeExpense,
    governmentFeeForm,
    resolvedUserId,
    validateGovernmentFeeForm,
  ]);

  const renderCell = useCallback(
    (expense, columnKey) => {
      const currencyCode = expense?.currencyCode || "INR";

      switch (columnKey) {
        case "project":
          return (
            <div className="flex max-w-[260px] flex-col">
              <span
                className="truncate text-[12.5px] font-semibold text-foreground"
                title={expense?.projectName || "-"}
              >
                {expense?.projectName || "-"}
              </span>

              <span className="text-[11.5px] text-default-500">
                {expense?.projectNo
                  ? `Project No: ${expense.projectNo}`
                  : `Project ID: ${expense?.projectId || "-"}`}
              </span>

              {expense?.unbilledNumber && (
                <span className="text-[11.5px] text-default-500">
                  Unbilled: {expense.unbilledNumber}
                </span>
              )}
            </div>
          );

        case "productName":
          return (
            <span
              className="block max-w-[200px] truncate text-[12.5px]"
              title={expense?.productName || "-"}
            >
              {expense?.productName || "-"}
            </span>
          );

        case "expenseCategory":
          return (
            <Chip size="sm" variant="flat">
              {formatText(expense?.expenseCategory)}
            </Chip>
          );

        case "requestedAmount":
          return (
            <span className="whitespace-nowrap font-semibold text-foreground">
              {formatCurrency(expense?.requestedAmount, currencyCode)}
            </span>
          );

        case "approvedAmount":
          return (
            <span className="whitespace-nowrap">
              {expense?.approvedAmount === null ||
              expense?.approvedAmount === undefined
                ? "-"
                : formatCurrency(expense.approvedAmount, currencyCode)}
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
            <span className="whitespace-nowrap font-semibold text-foreground">
              {formatCurrency(expense?.outstandingAmount, currencyCode)}
            </span>
          );

        case "department":
          return (
            <div className="flex flex-col">
              <span className="text-[12.5px] font-medium">
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
              <span className="text-[12.5px] font-medium">
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
              color={getStatusColor(expense?.approvalStatus)}
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
                color={getStatusColor(expense?.crtApprovalStatus)}
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
                color={getStatusColor(expense?.accountsApprovalStatus)}
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

        case "externalReference":
          return (
            <div className="flex max-w-[220px] flex-col">
              <span
                className="truncate text-[12.5px]"
                title={expense?.externalReference || "-"}
              >
                {expense?.externalReference || "-"}
              </span>

              {expense?.remark && (
                <span
                  className="truncate text-[11.5px] text-default-500"
                  title={expense.remark}
                >
                  {expense.remark}
                </span>
              )}
            </div>
          );

        case "attachment":
          if (!expense?.attachmentUrl) {
            return "-";
          }

          return (
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
          );

        case "actions": {
          const canUpdateStatus =
            expense?.approvalStage === "CRT_REVIEW" &&
            !["APPROVED", "REJECTED", "CANCELLED"].includes(
              expense?.approvalStatus,
            );

          // NEW: Accounts decision on the government fee, before payment.
          const canDecideGovernmentFee =
            expense?.expenseCategory === "GOVERNMENT_FEE" &&
            expense?.accountsApprovalStatus === "APPROVED" &&
            expense?.paymentStatus === "PROCESSING";

          const canPayGovernmentFee =
            expense?.expenseCategory === "GOVERNMENT_FEE" &&
            expense?.accountsApprovalStatus === "APPROVED";

          return (
            <div className="flex justify-center">
              <Dropdown placement="bottom-end">
                <DropdownTrigger>
                  <Button
                    isIconOnly
                    size="sm"
                    variant="light"
                    aria-label={`Actions for expense ${expense?.expenseId || ""}`}
                  >
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownTrigger>

                <DropdownMenu
                  aria-label="Expense actions"
                  disabledKeys={[
                    ...(canUpdateStatus ? [] : ["updateStatus"]),
                    ...(canDecideGovernmentFee
                      ? []
                      : ["governmentFeeDecision"]),
                    ...(canPayGovernmentFee ? [] : ["governmentFee"]),
                  ]}
                  onAction={(key) => {
                    if (key === "updateStatus" && canUpdateStatus) {
                      openStatusModal(expense);
                    }

                    if (
                      key === "governmentFeeDecision" &&
                      canDecideGovernmentFee
                    ) {
                      openGovernmentFeeDecisionModal(expense);
                    }

                    if (key === "governmentFee" && canPayGovernmentFee) {
                      openGovernmentFeeModal(expense);
                    }
                  }}
                >
                  <DropdownItem
                    key="updateStatus"
                    startContent={<PencilLine className="h-4 w-4" />}
                    description={
                      canUpdateStatus
                        ? "Approve, reject or place on hold"
                        : "Available only during CRT review"
                    }
                  >
                    Update Status
                  </DropdownItem>

                  <DropdownItem
                    key="governmentFeeDecision"
                    description={
                      canDecideGovernmentFee
                        ? "Approve or reject the government fee request"
                        : "Available only while accounts approval is pending"
                    }
                  >
                    Government Fee Decision
                  </DropdownItem>

                  <DropdownItem
                    key="governmentFee"
                    description={
                      canPayGovernmentFee
                        ? "Add government fee payment details"
                        : "Available only for Government Fee expenses after Accounts approval"
                    }
                  >
                    Government Fee
                  </DropdownItem>
                </DropdownMenu>
              </Dropdown>
            </div>
          );
        }

        default:
          return expense?.[columnKey] ?? "-";
      }
    },
    [openGovernmentFeeModal, openStatusModal],
  );

  const topContent = useMemo(() => {
    return (
      <div className="flex flex-col gap-2">
        <div className="flex justify-between gap-2 items-center flex-wrap">
          <Input
            isClearable
            size="sm"
            className="w-full sm:max-w-[280px]"
            classNames={{ inputWrapper: "h-8 min-h-8" }}
            placeholder="Search expenses..."
            startContent={<Search className="w-4 h-4 text-default-400" />}
            value={searchValue}
            onClear={() => {
              setSearchValue("");
              setPagination((previous) => ({
                ...previous,
                page: 1,
              }));
            }}
            onValueChange={(value) => {
              setSearchValue(value || "");

              setPagination((previous) => ({
                ...previous,
                page: 1,
              }));
            }}
          />

          <div className="flex gap-1.5 flex-wrap">
            <div className="w-[160px]">
              <NewSelect
                size="sm"
                isSearchable={false}
                data={approvalStageOptions}
                labelKey="label"
                valueKey="value"
                label="Approval stage"
                value={approvalStage}
                onChange={(value) => {
                  if (value) {
                    setApprovalStage(value);

                    setPagination((previous) => ({
                      ...previous,
                      page: 1,
                    }));
                  }
                }}
              />
            </div>

            <div className="w-[160px]">
              <NewSelect
                size="sm"
                isSearchable={false}
                data={approvalStatusOptions}
                labelKey="label"
                valueKey="value"
                label="Approval status"
                value={approvalStatus}
                onChange={(value) => {
                  if (value) {
                    setApprovalStatus(value);

                    setPagination((previous) => ({
                      ...previous,
                      page: 1,
                    }));
                  }
                }}
              />
            </div>

            <div className="w-[160px]">
              <NewSelect
                size="sm"
                isSearchable={false}
                data={columns}
                selectionMode="multiple"
                labelKey="name"
                valueKey="uid"
                label="Columns"
                placeholder="Columns"
                value={Array.from(visibleColumns)}
                onChange={(values) => {
                  if (values.length > 0) {
                    setVisibleColumns(new Set(values));
                  }
                }}
              />
            </div>
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
              value={pagination.size}
              onChange={(event) => {
                setPagination({
                  page: 1,
                  size: Number(event.target.value),
                });
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
    );
  }, [
    searchValue,
    approvalStage,
    approvalStatus,
    visibleColumns,
    pagination.size,
    filteredItems.length,
  ]);

  const onPreviousPage = useCallback(() => {
    setPagination((previous) => ({
      ...previous,
      page: Math.max(1, previous.page - 1),
    }));
  }, []);

  const onNextPage = useCallback(() => {
    setPagination((previous) => ({
      ...previous,
      page: Math.min(totalPages, previous.page + 1),
    }));
  }, [totalPages]);

  const bottomContent = useMemo(() => {
    return (
      <div className="py-1.5 px-1 flex justify-between items-center">
        <span className="w-[30%] text-[12.5px] text-default-400">
          Page {pagination.page} of {totalPages}
        </span>

        <Pagination
          isCompact
          showControls
          color="primary"
          page={pagination.page}
          total={totalPages}
          onChange={(page) => {
            setPagination((previous) => ({
              ...previous,
              page,
            }));
          }}
        />

        <div className="hidden sm:flex w-[30%] justify-end gap-2">
          <Button
            isDisabled={totalPages === 1}
            size="sm"
            variant="flat"
            onPress={onPreviousPage}
          >
            Previous
          </Button>

          <Button
            isDisabled={totalPages === 1}
            size="sm"
            variant="flat"
            onPress={onNextPage}
          >
            Next
          </Button>
        </div>
      </div>
    );
  }, [pagination.page, totalPages, onPreviousPage, onNextPage]);

  return (
    <div className="flex flex-col gap-2">
      <div className="shrink-0 mb-2">
        <h1 className="font-sans text-lg font-semibold">
          Expense Approval Queue
        </h1>

        <p className="text-default-500 text-[12.5px]">
          Review expenses based on approval stage and status.
        </p>
      </div>

      <Table
        isHeaderSticky
        removeWrapper={false}
        aria-label="Expense approval queue table"
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
              align={column.uid === "actions" ? "center" : "start"}
            >
              {column.name}
            </TableColumn>
          )}
        </TableHeader>

        <TableBody
          isLoading={expenseApprovalQueueLoading}
          emptyContent={
            expenseApprovalQueueLoading
              ? "Loading expenses..."
              : expenseApprovalQueueError || "No expenses found"
          }
          items={paginatedItems}
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

      {/* CRT STATUS MODAL */}
      <Modal
        size="3xl"
        isOpen={isStatusModalOpen}
        placement="center"
        onOpenChange={(isOpen) => {
          if (!isOpen) {
            closeStatusModal();
          }
        }}
      >
        <ModalContent>
          <ModalHeader className="flex flex-col gap-1">
            Update CRT Expense Status
            <span className="text-sm font-normal text-default-500">
              {selectedExpense?.projectName || "Project"}
              {selectedExpense?.expenseId
                ? ` • Expense ID: ${selectedExpense.expenseId}`
                : ""}
            </span>
          </ModalHeader>

          <ModalBody>
            <div className="rounded-lg bg-default-100 p-3 text-sm">
              <div className="flex items-center justify-between gap-3">
                <span className="text-default-500">Requested amount</span>

                <span className="font-semibold">
                  {formatCurrency(
                    selectedExpense?.requestedAmount,
                    selectedExpense?.currencyCode,
                  )}
                </span>
              </div>
            </div>

            <Select
              isRequired
              label="Status"
              placeholder="Select status"
              selectedKeys={
                decisionForm.status
                  ? new Set([decisionForm.status])
                  : new Set([])
              }
              isInvalid={Boolean(decisionErrors.status)}
              errorMessage={decisionErrors.status}
              onSelectionChange={(keys) => {
                const value = Array.from(keys)[0];

                setDecisionForm((previous) => ({
                  ...previous,
                  status: value ? String(value) : "",
                }));

                if (value) {
                  setDecisionErrors((previous) => ({
                    ...previous,
                    status: undefined,
                  }));
                }
              }}
            >
              {crtDecisionOptions.map((option) => (
                <SelectItem key={option.value} textValue={option.label}>
                  {option.label}
                </SelectItem>
              ))}
            </Select>

            <Select
              isRequired
              label="Expense Paid By"
              placeholder="Select payer"
              selectedKeys={
                decisionForm.expensePaidBy
                  ? new Set([decisionForm.expensePaidBy])
                  : new Set([])
              }
              isInvalid={Boolean(decisionErrors.expensePaidBy)}
              errorMessage={decisionErrors.expensePaidBy}
              onSelectionChange={(keys) => {
                const value = Array.from(keys)[0];

                setDecisionForm((previous) => ({
                  ...previous,
                  expensePaidBy: value ? String(value) : "",
                  ...(String(value) !== "COMPANY"
                    ? {
                        paymentMode: "",
                        bankLedgerId: "",
                        transactionReference: "",
                        paymentProof: "",
                      }
                    : {}),
                }));

                if (value) {
                  setDecisionErrors((previous) => ({
                    ...previous,
                    expensePaidBy: undefined,
                  }));
                }
              }}
            >
              <SelectItem key="CLIENT" textValue="Client">
                Client
              </SelectItem>

              <SelectItem key="COMPANY" textValue="Company">
                Company
              </SelectItem>
            </Select>

            {isCompanyPaidExpense && (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <DatePicker
                  isRequired
                  label="Payment Date"
                  showMonthAndYearPickers
                  maxValue={today(getLocalTimeZone())}
                  isInvalid={Boolean(decisionErrors.clientPaymentDate)}
                  errorMessage={decisionErrors.clientPaymentDate}
                  value={
                    decisionForm.clientPaymentDate &&
                    /^\d{4}-\d{2}-\d{2}$/.test(decisionForm.clientPaymentDate)
                      ? parseDate(decisionForm.clientPaymentDate)
                      : null
                  }
                  onChange={(value) => {
                    const iso = value ? value.toString() : "";

                    setDecisionForm((previous) => ({
                      ...previous,
                      clientPaymentDate: iso,
                    }));
                  }}
                />

                <Select
                  isRequired
                  label="Payment Mode"
                  placeholder="Select payment mode"
                  selectedKeys={
                    decisionForm.paymentMode
                      ? new Set([decisionForm.paymentMode])
                      : new Set([])
                  }
                  isInvalid={Boolean(decisionErrors.paymentMode)}
                  errorMessage={decisionErrors.paymentMode}
                  onSelectionChange={(keys) => {
                    const value = Array.from(keys)[0];

                    setDecisionForm((previous) => ({
                      ...previous,
                      paymentMode: value ? String(value) : "",
                      bankLedgerId: "",
                    }));

                    setDecisionErrors((previous) => ({
                      ...previous,
                      paymentMode: undefined,
                      bankLedgerId: undefined,
                    }));
                  }}
                >
                  <SelectItem key="CASH">Cash</SelectItem>
                  <SelectItem key="UPI">UPI</SelectItem>
                  {/* <SelectItem key="CARD">Card</SelectItem>   */}
                  <SelectItem key="BANK_TRANSFER">Bank Transfer</SelectItem>
                  <SelectItem key="CHEQUE">Cheque</SelectItem>
                </Select>

                <div>
                  <NewSelect
                    isRequired
                    label="Select Bank/Cash Ledger"
                    data={filteredPaymentLedgerList}
                    labelKey="ledgerName"
                    valueKey="id"
                    value={decisionForm.bankLedgerId}
                    onChange={(value) => {
                      setDecisionForm((previous) => ({
                        ...previous,
                        bankLedgerId: value || "",
                      }));

                      if (value) {
                        setDecisionErrors((previous) => ({
                          ...previous,
                          bankLedgerId: undefined,
                        }));
                      }
                    }}
                  />

                  {decisionErrors.bankLedgerId && (
                    <p className="mt-1 text-xs text-danger">
                      {decisionErrors.bankLedgerId}
                    </p>
                  )}
                </div>

                <Input
                  isRequired
                  label="Transaction Reference Number / UTR Number"
                  placeholder="Enter transaction reference number"
                  value={decisionForm.transactionReference}
                  isInvalid={Boolean(decisionErrors.transactionReference)}
                  errorMessage={decisionErrors.transactionReference}
                  onValueChange={(value) => {
                    setDecisionForm((previous) => ({
                      ...previous,
                      transactionReference: value,
                    }));

                    if (value.trim()) {
                      setDecisionErrors((previous) => ({
                        ...previous,
                        transactionReference: undefined,
                      }));
                    }
                  }}
                />

                <div>
                  <SingleFileUploader
                    label="Payment Attachment"
                    value={decisionForm.paymentProof}
                    onChange={(value) => {
                      setDecisionForm((previous) => ({
                        ...previous,
                        paymentProof: value || "",
                      }));

                      if (value) {
                        setDecisionErrors((previous) => ({
                          ...previous,
                          paymentProof: undefined,
                        }));
                      }
                    }}
                    isRequired={true}
                    isInvalid={Boolean(decisionErrors.paymentProof)}
                    errorMessage={decisionErrors.paymentProof}
                  />

                  {decisionErrors.paymentProof && (
                    <p className="mt-1 text-xs text-danger">
                      {decisionErrors.paymentProof}
                    </p>
                  )}
                </div>
              </div>
            )}

            <Textarea
              isRequired
              label="Remark"
              placeholder="Enter decision remark"
              minRows={4}
              maxRows={7}
              value={decisionForm.remark}
              isInvalid={Boolean(decisionErrors.remark)}
              errorMessage={decisionErrors.remark}
              onValueChange={(value) => {
                setDecisionForm((previous) => ({
                  ...previous,
                  remark: value,
                }));

                if (value.trim()) {
                  setDecisionErrors((previous) => ({
                    ...previous,
                    remark: undefined,
                  }));
                }
              }}
            />
          </ModalBody>

          <ModalFooter>
            <Button
              variant="flat"
              isDisabled={isUpdatingStatus}
              onPress={closeStatusModal}
            >
              Cancel
            </Button>

            <Button
              color="primary"
              isLoading={isUpdatingStatus}
              onPress={handleStatusUpdate}
            >
              Update Status
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* GOVERNMENT FEE MODAL */}
      <Modal
        size="2xl"
        isOpen={isGovernmentFeeModalOpen}
        placement="center"
        onOpenChange={(isOpen) => {
          if (!isOpen) {
            closeGovernmentFeeModal();
          }
        }}
      >
        <ModalContent>
          <ModalHeader className="flex flex-col gap-1">
            Government Fee Payment
            <span className="text-sm font-normal text-default-500">
              {governmentFeeExpense?.projectName || "Project"}

              {governmentFeeExpense?.expenseId
                ? ` • Expense ID: ${governmentFeeExpense.expenseId}`
                : ""}
            </span>
          </ModalHeader>

          <ModalBody>
            <div className="rounded-lg bg-default-100 p-3 text-sm">
              <div className="flex items-center justify-between gap-3">
                <span className="text-default-500">Requested amount</span>

                <span className="font-semibold">
                  {formatCurrency(
                    governmentFeeExpense?.requestedAmount,
                    governmentFeeExpense?.currencyCode,
                  )}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <Input
                isRequired
                type="number"
                label="Government Fee Amount"
                placeholder="Enter government fee amount"
                value={governmentFeeForm.amount}
                isInvalid={Boolean(governmentFeeErrors.amount)}
                errorMessage={governmentFeeErrors.amount}
                onValueChange={(value) => {
                  setGovernmentFeeForm((previous) => ({
                    ...previous,
                    amount: value,
                  }));

                  if (value && Number(value) > 0) {
                    setGovernmentFeeErrors((previous) => ({
                      ...previous,
                      amount: undefined,
                    }));
                  }
                }}
              />

              <DatePicker
                isRequired
                label="Payment Date"
                showMonthAndYearPickers
                maxValue={today(getLocalTimeZone())}
                value={
                  governmentFeeForm.paymentDate &&
                  /^\d{4}-\d{2}-\d{2}$/.test(governmentFeeForm.paymentDate)
                    ? parseDate(governmentFeeForm.paymentDate)
                    : null
                }
                isInvalid={Boolean(governmentFeeErrors.paymentDate)}
                errorMessage={governmentFeeErrors.paymentDate}
                onChange={(value) => {
                  const iso = value ? value.toString() : "";

                  setGovernmentFeeForm((previous) => ({
                    ...previous,
                    paymentDate: iso,
                  }));

                  if (iso) {
                    setGovernmentFeeErrors((previous) => ({
                      ...previous,
                      paymentDate: undefined,
                    }));
                  }
                }}
              />

              <Input
                isRequired
                label="Payment Reference"
                placeholder="Enter payment reference"
                value={governmentFeeForm.paymentReference}
                isInvalid={Boolean(governmentFeeErrors.paymentReference)}
                errorMessage={governmentFeeErrors.paymentReference}
                onValueChange={(value) => {
                  setGovernmentFeeForm((previous) => ({
                    ...previous,
                    paymentReference: value,
                  }));

                  if (value.trim()) {
                    setGovernmentFeeErrors((previous) => ({
                      ...previous,
                      paymentReference: undefined,
                    }));
                  }
                }}
              />
              <Select
                isRequired
                label="Payment Mode"
                placeholder="Select payment mode"
                selectedKeys={
                  governmentFeeForm.paymentMode
                    ? new Set([governmentFeeForm.paymentMode])
                    : new Set([])
                }
                isInvalid={Boolean(governmentFeeErrors.paymentMode)}
                errorMessage={governmentFeeErrors.paymentMode}
                onSelectionChange={(keys) => {
                  const value = Array.from(keys)[0];

                  setGovernmentFeeForm((previous) => ({
                    ...previous,
                    paymentMode: value ? String(value) : "",
                    bankLedgerId: "",
                  }));

                  setGovernmentFeeErrors((previous) => ({
                    ...previous,
                    paymentMode: undefined,
                    bankLedgerId: undefined,
                  }));
                }}
              >
                <SelectItem key="UPI">UPI</SelectItem>
                <SelectItem key="BANK_TRANSFER">Bank Transfer</SelectItem>
                <SelectItem key="CHEQUE">Cheque</SelectItem>
              </Select>

              <div>
                <NewSelect
                  isRequired
                  label="Select Bank Ledger"
                  data={filteredGovernmentFeeLedgerList}
                  labelKey="ledgerName"
                  valueKey="id"
                  value={governmentFeeForm.bankLedgerId}
                  onChange={(value) => {
                    setGovernmentFeeForm((previous) => ({
                      ...previous,
                      bankLedgerId: value || "",
                    }));

                    if (value) {
                      setGovernmentFeeErrors((previous) => ({
                        ...previous,
                        bankLedgerId: undefined,
                      }));
                    }
                  }}
                />

                {governmentFeeErrors.bankLedgerId && (
                  <p className="mt-1 text-xs text-danger">
                    {governmentFeeErrors.bankLedgerId}
                  </p>
                )}
              </div>

              {/* CHANGED:
                  Payment Receipt URL Input -> FileUploader */}
              <div>
                <FileUploader
                  label="Payment Receipt"
                  placeholder="Drag & drop receipt, paste, or choose file"
                  value={governmentFeeForm.paymentReceiptUrl}
                  onChange={(value) => {
                    setGovernmentFeeForm((previous) => ({
                      ...previous,
                      paymentReceiptUrl: value || "",
                    }));

                    if (value) {
                      setGovernmentFeeErrors((previous) => ({
                        ...previous,
                        paymentReceiptUrl: undefined,
                      }));
                    }
                  }}
                  isRequired
                  errorMessage={governmentFeeErrors.paymentReceiptUrl}
                  uploadingType="single"
                />
              </div>
            </div>

            <Textarea
              isRequired
              label="Remark"
              placeholder="Enter government fee payment remark"
              minRows={4}
              maxRows={7}
              value={governmentFeeForm.remark}
              isInvalid={Boolean(governmentFeeErrors.remark)}
              errorMessage={governmentFeeErrors.remark}
              onValueChange={(value) => {
                setGovernmentFeeForm((previous) => ({
                  ...previous,
                  remark: value,
                }));

                if (value.trim()) {
                  setGovernmentFeeErrors((previous) => ({
                    ...previous,
                    remark: undefined,
                  }));
                }
              }}
            />
          </ModalBody>

          <ModalFooter>
            <Button
              variant="flat"
              isDisabled={isPayingGovernmentFee}
              onPress={closeGovernmentFeeModal}
            >
              Cancel
            </Button>

            <Button
              color="primary"
              isLoading={isPayingGovernmentFee}
              onPress={handleGovernmentFeePayment}
            >
              Submit Government Fee
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
      {/* GOVERNMENT FEE DECISION MODAL */}
      <Modal
        size="lg"
        isOpen={isGovernmentFeeDecisionModalOpen}
        placement="center"
        onOpenChange={(isOpen) => {
          if (!isOpen) {
            closeGovernmentFeeDecisionModal();
          }
        }}
      >
        <ModalContent>
          <ModalHeader className="flex flex-col gap-1">
            Government Fee Decision
            <span className="text-sm font-normal text-default-500">
              {governmentFeeDecisionExpense?.projectName || "Project"}
              {governmentFeeDecisionExpense?.expenseId
                ? ` • Expense ID: ${governmentFeeDecisionExpense.expenseId}`
                : ""}
            </span>
          </ModalHeader>

          <ModalBody>
            <div className="rounded-lg bg-default-100 p-3 text-sm">
              <div className="flex items-center justify-between gap-3">
                <span className="text-default-500">Requested amount</span>

                <span className="font-semibold">
                  {formatCurrency(
                    governmentFeeDecisionExpense?.requestedAmount,
                    governmentFeeDecisionExpense?.currencyCode,
                  )}
                </span>
              </div>
            </div>

            <Select
              isRequired
              label="Status"
              placeholder="Select status"
              selectedKeys={
                governmentFeeDecisionForm.status
                  ? new Set([governmentFeeDecisionForm.status])
                  : new Set([])
              }
              isInvalid={Boolean(governmentFeeDecisionErrors.status)}
              errorMessage={governmentFeeDecisionErrors.status}
              onSelectionChange={(keys) => {
                const value = Array.from(keys)[0];

                setGovernmentFeeDecisionForm((previous) => ({
                  ...previous,
                  status: value ? String(value) : "",
                }));

                if (value) {
                  setGovernmentFeeDecisionErrors((previous) => ({
                    ...previous,
                    status: undefined,
                  }));
                }
              }}
            >
              {governmentFeeDecisionOptions.map((option) => (
                <SelectItem key={option.value} textValue={option.label}>
                  {option.label}
                </SelectItem>
              ))}
            </Select>

            <Textarea
              isRequired
              label="Remark"
              placeholder="Enter decision remark"
              minRows={4}
              maxRows={7}
              value={governmentFeeDecisionForm.remark}
              isInvalid={Boolean(governmentFeeDecisionErrors.remark)}
              errorMessage={governmentFeeDecisionErrors.remark}
              onValueChange={(value) => {
                setGovernmentFeeDecisionForm((previous) => ({
                  ...previous,
                  remark: value,
                }));

                if (value.trim()) {
                  setGovernmentFeeDecisionErrors((previous) => ({
                    ...previous,
                    remark: undefined,
                  }));
                }
              }}
            />
          </ModalBody>

          <ModalFooter>
            <Button
              variant="flat"
              isDisabled={isSubmittingGovernmentFeeDecision}
              onPress={closeGovernmentFeeDecisionModal}
            >
              Cancel
            </Button>

            <Button
              color="primary"
              isLoading={isSubmittingGovernmentFeeDecision}
              onPress={handleGovernmentFeeDecision}
            >
              Submit Decision
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
};

export default Expenses;
