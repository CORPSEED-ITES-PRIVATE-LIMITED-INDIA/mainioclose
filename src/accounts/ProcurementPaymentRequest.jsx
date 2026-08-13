import {
  addToast,
  Button,
  Chip,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
  Input,
  Pagination,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
  useDisclosure,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Form,
  Select,
  SelectItem,
} from "@heroui/react";
import { ChevronDown, EllipsisVertical, Search } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import {
  approveProcurementPaymentRequest,
  getActivePaymentLedgerForPaymentRegister,
  getProcurementPaymentRequestList,
  rejectProcurementPaymentRequest,
  releaseProcurementPaymentRequest,
} from "../toolkit/slices/accountSlice";
import { inrCurrency } from "../common";
import NewSelect from "../components/NewSelect";
import SingleFileUploader from "../components/SingleFileUploader";
import dayjs from "dayjs";

const columns = [
  { name: "ID", uid: "id" },
  { name: "PO NO.", uid: "poNumber", sortable: true },
  { name: "PROJECT NAME", uid: "projectName" },
  { name: "PROJECT NO.", uid: "projectNo" },
  { name: "VENDOR NAME", uid: "vendorName" },
  { name: "AMOUNT", uid: "amount" },
  { name: "PAYMENT TERM", uid: "paymentTerm" },
  { name: "PAYMENT REMAINING DAYS", uid: "pendingDays" },
  { name: "GST TYPE", uid: "gstType" },
  { name: "GST %", uid: "gstPercentage" },
  { name: "CGST", uid: "cgstAmount" },
  { name: "SGST", uid: "sgstAmount" },
  { name: "IGST", uid: "igstAmount" },
  { name: "TOTAL GST", uid: "totalGstAmount" },
  { name: "INVOICE AMOUNT", uid: "invoiceAmount" },
  { name: "TDS %", uid: "tdsPercentage" },
  { name: "TDS AMOUNT", uid: "tdsAmount" },
  { name: "PAYABLE AMOUNT", uid: "payableAmount" },
  { name: "STATUS", uid: "status" },
  { name: "APPROVED DATE", uid: "approvedDate" },
  { name: "PAYMENT RELEASED DATE", uid: "paymentReleasedDate" },
  { name: "ATTACHMENTS", uid: "proofAttachmentUrls" },
  { name: "ACTIONS", uid: "actions" },
];

function capitalize(s) {
  return s ? s.charAt(0).toUpperCase() + s.slice(1).toLowerCase() : "";
}

const toTwoDecimalAmount = (value) => {
  const amount = Number(value);

  if (!Number.isFinite(amount)) {
    return 0;
  }

  return Number(amount.toFixed(2));
};

const getStatusColor = (status) => {
  switch (status) {
    case "DRAFT":
      return "default";

    case "PENDING_APPROVAL":
      return "warning";

    case "APPROVED":
      return "success";

    case "REJECTED":
      return "danger";

    case "RELEASED":
    case "PO_RELEASED":
      return "primary";

    case "PARTIALLY_COMPLETED":
      return "warning";

    case "COMPLETED":
    case "PAYMENT_DONE":
      return "success";

    default:
      return "default";
  }
};

const INITIAL_VISIBLE_COLUMNS = [
  "poNumber",
  "projectName",
  "vendorName",
  "amount",
  "paymentTerm",
  "pendingDays",
  "gstType",
  "gstPercentage",
  "cgstAmount",
  "sgstAmount",
  "igstAmount",
  "totalGstAmount",
  "invoiceAmount",
  "tdsPercentage",
  "tdsAmount",
  "payableAmount",
  "status",
  "approvedDate",
  "paymentReleasedDate",
  "proofAttachmentUrls",
  "actions",
];

const ProcurementPaymentRequest = () => {
  const { userId } = useParams();
  const dispatch = useDispatch();
  const count = useSelector(
    (state) => state.account.procurementPaymentRequestList?.data?.totalElements,
  );
  const data = useSelector(
    (state) => state.account.procurementPaymentRequestList?.data?.content,
  );
  const paymentLedgerList = useSelector(
    (state) => state.account.paymentLegerList,
  );
  const approveModal = useDisclosure();
  const rejectModal = useDisclosure();
  const releaseModal = useDisclosure();
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
    status: "PENDING",
  });
  const [rowItem, setRowItem] = useState(null);

  const [releasePayableAmount, setReleasePayableAmount] = useState("");
  const [releasePaymentMode, setReleasePaymentMode] = useState("");
  const [releaseBankLedgerId, setReleaseBankLedgerId] = useState("");
  const [releaseTdsActive, setReleaseTdsActive] = useState(false);
  const [releaseTdsPercentage, setReleaseTdsPercentage] = useState("");
  const [releaseTransactionReference, setReleaseTransactionReference] =
    useState("");
  const [releasePaymentDate, setReleasePaymentDate] = useState(
    dayjs().format("YYYY-MM-DD"),
  );
  const [releasePaymentProof, setReleasePaymentProof] = useState("");
  const [isReleaseFileUploading, setIsReleaseFileUploading] = useState(false);
  const [isReleaseSubmitting, setIsReleaseSubmitting] = useState(false);
  const [releaseInvoiceNumber, setReleaseInvoiceNumber] = useState("");
  const [releaseInvoiceDate, setReleaseInvoiceDate] = useState(
    dayjs().format("YYYY-MM-DD"),
  );

  const hasSearchFilter = Boolean(filterValue);

  const hasReleasePaymentModeSelected = Boolean(
    String(releasePaymentMode || "").trim(),
  );

  const isReleaseCashPaymentMode =
    String(releasePaymentMode || "")
      .trim()
      .toUpperCase() === "CASH";

  const isCashLedger = useCallback((ledger) => {
    const ledgerName = String(ledger?.ledgerName || "")
      .trim()
      .toLowerCase();

    const ledgerType = String(ledger?.ledgerType || "")
      .trim()
      .toLowerCase();

    return ledgerType === "cash" || ledgerName.includes("cash");
  }, []);

  const filteredReleasePaymentLedgerList = useMemo(() => {
    if (!hasReleasePaymentModeSelected) {
      return [];
    }

    const ledgers = Array.isArray(paymentLedgerList) ? paymentLedgerList : [];

    return isReleaseCashPaymentMode
      ? ledgers.filter(isCashLedger)
      : ledgers.filter((ledger) => !isCashLedger(ledger));
  }, [
    hasReleasePaymentModeSelected,
    isCashLedger,
    isReleaseCashPaymentMode,
    paymentLedgerList,
  ]);

  // Maximum amount allowed for release, received from the backend row.
  const releaseGrossPayableAmount = toTwoDecimalAmount(
    rowItem?.grossPayableAmount ??
      rowItem?.payableAmount ??
      rowItem?.invoiceAmount ??
      0,
  );

  const releaseCustomPayableAmount = toTwoDecimalAmount(releasePayableAmount);

  const isReleasePayableExceeded =
    releaseCustomPayableAmount > releaseGrossPayableAmount;

  // GST percentage coming from backend
  const releaseGstPercentage = toTwoDecimalAmount(rowItem?.gstPercentage ?? 0);

  // Calculate principal amount by removing GST from the GST-inclusive payable amount
  const releasePrincipalAmount = toTwoDecimalAmount(
    releaseCustomPayableAmount / (1 + releaseGstPercentage / 100),
  );

  // Calculate TDS on principal amount
  const releaseTdsAmount = releaseTdsActive
    ? toTwoDecimalAmount(
        (releasePrincipalAmount * Number(releaseTdsPercentage || 0)) / 100,
      )
    : 0;

  // Deduct TDS from payable amount
  const releaseBankPaymentAmount = toTwoDecimalAmount(
    releaseCustomPayableAmount - releaseTdsAmount,
  );

  const resetReleasePaymentFields = useCallback(() => {
    setReleasePayableAmount("");
    setReleasePaymentMode("");
    setReleaseBankLedgerId("");
    setReleaseTdsActive(false);
    setReleaseTdsPercentage("");
    setReleaseTransactionReference("");
    setReleasePaymentDate(dayjs().format("YYYY-MM-DD"));
    setReleasePaymentProof("");
    setReleaseInvoiceNumber("");
    setReleaseInvoiceDate(dayjs().format("YYYY-MM-DD"));
    setIsReleaseFileUploading(false);
    setIsReleaseSubmitting(false);
  }, []);

  useEffect(() => {
    dispatch(getProcurementPaymentRequestList(filteration));
  }, [dispatch, filteration]);

  useEffect(() => {
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
      filteredUsers = filteredUsers.filter((user) =>
        user?.projectName?.toLowerCase().includes(filterValue.toLowerCase()),
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

  const handleActionPress = (item, key) => {
    setRowItem(item);
    if (key === "Approved") {
      approveModal.onOpen();
    } else if (key === "Rejected") {
      rejectModal.onOpen();
    } else if (key === "Release") {
      resetReleasePaymentFields();
      setReleasePayableAmount(
        String(
          toTwoDecimalAmount(
            item?.grossPayableAmount ??
              item?.payableAmount ??
              item?.invoiceAmount ??
              0,
          ),
        ),
      );
      releaseModal.onOpen();
    }
  };

  const handleApproveRequest = (remarks) => {
    dispatch(
      approveProcurementPaymentRequest({
        paymentRequestId: rowItem?.id,
        data: { remarks },
        userId,
      }),
    )
      .then((resp) => {
        if (resp.meta.requestStatus === "fulfilled") {
          addToast({
            title: "SUCCESS",
            description: "Approved successfully !.",
            color: "success",
          });
          approveModal.onClose();
          setRowItem(null);
          dispatch(getProcurementPaymentRequestList(filteration));
        } else {
          //handle error
          addToast({
            title: "Error",
            description: resp.payload || "Something went wrong",
            color: "danger",
          });
        }
      })
      .catch(() =>
        addToast({
          title: "ERROR",
          description: "Something went wrong",
          color: "danger",
        }),
      );
  };

  const handleRejectRequest = (remarks) => {
    // Implementation for handling approve request
    dispatch(
      rejectProcurementPaymentRequest({
        paymentRequestId: rowItem?.id,
        data: { remarks },
        userId,
      }),
    )
      .then((resp) => {
        if (resp.meta.requestStatus === "fulfilled") {
          addToast({
            title: "SUCCESS",
            description: "Rejected successfully !.",
            color: "success",
          });
          rejectModal.onClose();
          setRowItem(null);
          dispatch(getProcurementPaymentRequestList(filteration));
        } else {
          //handle error
          addToast({
            title: "Error",
            description: resp.payload || "Something went wrong",
            color: "danger",
          });
        }
      })
      .catch(() =>
        addToast({
          title: "ERROR",
          description: "Something went wrong",
          color: "danger",
        }),
      );
  };

  const handlePaymentReleaseRequest = async (remarks) => {
    if (!rowItem?.id) {
      addToast({
        title: "Payment request missing",
        description: "Please select a valid payment request.",
        color: "danger",
      });
      return;
    }

    if (releaseCustomPayableAmount <= 0) {
      addToast({
        title: "Invalid payable amount",
        description: "Payable amount must be greater than zero.",
        color: "danger",
      });
      return;
    }

    if (isReleasePayableExceeded) {
      addToast({
        title: "Payable amount exceeds gross payable",
        description: `Payable amount cannot exceed ${inrCurrency(
          releaseGrossPayableAmount,
        )}.`,
        color: "danger",
      });
      return;
    }

    if (!releasePaymentDate) {
      addToast({
        title: "Payment date is required",
        color: "danger",
      });
      return;
    }

    if (dayjs(releasePaymentDate).isAfter(dayjs(), "day")) {
      addToast({
        title: "Invalid payment date",
        description: "Payment date cannot be in the future.",
        color: "danger",
      });
      return;
    }

    if (!releasePaymentMode) {
      addToast({
        title: "Payment mode is required",
        color: "danger",
      });
      return;
    }

    if (!releaseBankLedgerId) {
      addToast({
        title: "Bank/Cash ledger is required",
        color: "danger",
      });
      return;
    }

    if (releaseTdsActive && !releaseTdsPercentage) {
      addToast({
        title: "TDS percentage is required",
        color: "danger",
      });
      return;
    }

    if (
      !isReleaseCashPaymentMode &&
      !String(releaseTransactionReference || "").trim()
    ) {
      addToast({
        title: "Transaction number is required",
        description: "Enter the transaction reference or UTR number.",
        color: "danger",
      });
      return;
    }

    if (!releasePaymentProof) {
      addToast({
        title: "Payment attachment is required",
        color: "danger",
      });
      return;
    }

    if (releaseBankPaymentAmount <= 0) {
      addToast({
        title: "Invalid bank/cash payment",
        description: "Bank/Cash payment must be greater than zero after TDS.",
        color: "danger",
      });
      return;
    }

    if (!String(releaseInvoiceNumber || "").trim()) {
      addToast({
        title: "Invoice number is required",
        color: "danger",
      });
      return;
    }

    if (!releaseInvoiceDate) {
      addToast({
        title: "Invoice date is required",
        color: "danger",
      });
      return;
    }

    if (dayjs(releaseInvoiceDate).isAfter(dayjs(), "day")) {
      addToast({
        title: "Invalid invoice date",
        description: "Invoice date cannot be in the future.",
        color: "danger",
      });
      return;
    }

    const selectedLedger = (
      Array.isArray(paymentLedgerList) ? paymentLedgerList : []
    ).find((ledger) => Number(ledger?.id) === Number(releaseBankLedgerId));

    const selectedLedgerType = String(
      selectedLedger?.ledgerType ||
        (isReleaseCashPaymentMode ? "CASH" : "BANK"),
    )
      .trim()
      .toUpperCase();

    const payload = {
      comment: remarks,
      remarks,

      paymentMode: releasePaymentMode,
      bankLedgerId: Number(releaseBankLedgerId),
      ledgerId: Number(releaseBankLedgerId),

      transactionReference: String(releaseTransactionReference || "").trim(),

      paymentDate: releasePaymentDate,

      invoiceNumber: String(releaseInvoiceNumber || "").trim(),
      invoiceDate: releaseInvoiceDate,

      paymentProof: releasePaymentProof,
      proofAttachmentUrls: releasePaymentProof ? [releasePaymentProof] : [],

      tdsActive: releaseTdsActive ? true : false,
      tdsPercentage: releaseTdsActive ? Number(releaseTdsPercentage) : null,

      bankPaymentAmount: releaseCustomPayableAmount,

      tdsPayableLedgerId: releaseTdsActive
        ? Number(rowItem?.tdsPayableLedgerId || rowItem?.tdsLedgerId || 0) ||
          null
        : null,
    };

    setIsReleaseSubmitting(true);

    try {
      const resp = await dispatch(
        releaseProcurementPaymentRequest({
          paymentRequestId: rowItem.id,
          data: payload,
          userId,
        }),
      );

      if (resp.meta.requestStatus === "fulfilled") {
        addToast({
          title: "SUCCESS",
          description: "Payment released successfully!",
          color: "success",
        });

        releaseModal.onClose();
        resetReleasePaymentFields();
        setRowItem(null);
        dispatch(getProcurementPaymentRequestList(filteration));
        return;
      }

      addToast({
        title: resp?.payload?.errorCode || "Payment release failed",
        description:
          resp?.payload?.message ||
          resp?.payload?.data?.message ||
          (typeof resp?.payload === "string" ? resp.payload : null) ||
          "Something went wrong",
        color: "danger",
      });
    } catch (error) {
      addToast({
        title: "ERROR",
        description:
          error?.response?.data?.message ||
          error?.message ||
          "Something went wrong",
        color: "danger",
      });
    } finally {
      setIsReleaseSubmitting(false);
    }
  };

  const renderCell = useCallback((rowData, columnKey) => {
    switch (columnKey) {
      case "projectName":
        return (
          <div className="flex items-start gap-2">
            <div className="flex flex-col">
              <p className="font-normal text-[12.5px] capitalize">
                {rowData?.projectName || "-"}
              </p>
              <p className="font-normal text-[11.5px] text-default-500">
                {rowData?.projectNo || "-"}
              </p>
            </div>
          </div>
        );

      case "vendorName":
        return (
          <div className="flex flex-col">
            <span className="font-normal text-[12.5px] capitalize">
              {rowData?.vendorName || "Unknown"}
            </span>
          </div>
        );
      case "amount":
        return (
          <div className="flex flex-col">
            <span className="font-normal text-[12.5px]">
              {inrCurrency(rowData?.amount) || "-"}
            </span>
          </div>
        );
      case "paymentTerm":
        return (
          <div className="flex flex-col">
            <span className="font-normal text-[12.5px]">
              {rowData?.paymentTerm || "-"}
            </span>
          </div>
        );
      case "pendingDays":
        return (
          <div className="flex flex-col">
            <span className="font-normal text-[12.5px]">
              {rowData?.pendingDays || "-"}
            </span>
          </div>
        );
      case "gstType":
        return rowData?.gstActive ? (
          <Chip size="sm" variant="flat" color="secondary">
            {rowData?.gstType === "IGST" ? "IGST" : "CGST/SGST"}
          </Chip>
        ) : (
          <span className="text-[12.5px] text-default-400">-</span>
        );
      case "gstPercentage":
        return (
          <span className="font-normal text-[12.5px]">
            {rowData?.gstActive
              ? `${toTwoDecimalAmount(rowData?.gstPercentage)}%`
              : "-"}
          </span>
        );
      case "cgstAmount":
        return (
          <span className="font-normal text-[12.5px]">
            {rowData?.gstType === "IGST"
              ? "-"
              : inrCurrency(rowData?.cgstAmount) || "-"}
          </span>
        );
      case "sgstAmount":
        return (
          <span className="font-normal text-[12.5px]">
            {rowData?.gstType === "IGST"
              ? "-"
              : inrCurrency(rowData?.sgstAmount) || "-"}
          </span>
        );
      case "igstAmount":
        return (
          <span className="font-normal text-[12.5px]">
            {rowData?.gstType === "IGST"
              ? inrCurrency(rowData?.igstAmount) || "-"
              : "-"}
          </span>
        );
      case "totalGstAmount":
        return (
          <span className="font-medium text-[12.5px]">
            {rowData?.gstActive
              ? inrCurrency(rowData?.totalGstAmount) || "-"
              : "-"}
          </span>
        );
      case "invoiceAmount":
        return (
          <div className="flex flex-col">
            <span className="font-normal text-[12.5px]">
              {inrCurrency(rowData?.invoiceAmount) || "-"}
            </span>
          </div>
        );
      case "tdsPercentage":
        return (
          <span className="font-normal text-[12.5px]">
            {rowData?.tdsActive
              ? `${toTwoDecimalAmount(rowData?.tdsPercentage)}%`
              : "-"}
          </span>
        );
      case "tdsAmount":
        return (
          <span className="font-normal text-[12.5px]">
            {rowData?.tdsActive ? inrCurrency(rowData?.tdsAmount) || "-" : "-"}
          </span>
        );
      case "payableAmount":
        return (
          <div className="flex flex-col">
            <span className="font-medium text-[12.5px]">
              {inrCurrency(rowData?.payableAmount) || "-"}
            </span>
          </div>
        );
      case "status":
        return (
          <Chip
            size="sm"
            className="capitalize"
            variant="flat"
            color={getStatusColor(rowData?.status)}
          >
            {rowData?.status || "-"}
          </Chip>
        );
      case "approvedDate":
        return (
          <div className="flex flex-col text-[12.5px]">
            {dayjs(rowData?.approvedDate).format("DD MMM YYYY hh:mm A") || "-"}
          </div>
        );
      case "paymentReleasedDate":
        return (
          <div className="flex flex-col text-[12.5px]">
            {dayjs(rowData?.paymentReleasedDate).format(
              "DD MMM YYYY hh:mm A",
            ) || "-"}
          </div>
        );
      case "proofAttachmentUrls":
        return (
          <div className="flex flex-col">
            {rowData?.proofAttachmentUrls?.map((url, index) => (
              <a
                key={index}
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[12.5px] text-blue-500 hover:underline"
              >
                Proof Attachment {index + 1}
              </a>
            )) || "-"}
          </div>
        );
      case "actions":
        const isPending = rowData?.status == "PENDING";
        return (
          <Dropdown>
            <DropdownTrigger>
              <Button size="sm" isIconOnly variant="light">
                <EllipsisVertical className="w-4 h-4" />
              </Button>
            </DropdownTrigger>
            <DropdownMenu>
              {rowData?.status === "APPROVED" && (
                <DropdownItem
                  onPress={() => handleActionPress(rowData, "Release")}
                >
                  Release payment
                </DropdownItem>
              )}

              {isPending && (
                <>
                  <DropdownItem
                    onPress={() => handleActionPress(rowData, "Approved")}
                  >
                    Approved
                  </DropdownItem>
                  <DropdownItem
                    onPress={() => handleActionPress(rowData, "Rejected")}
                  >
                    Rejected
                  </DropdownItem>
                </>
              )}
            </DropdownMenu>
          </Dropdown>
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
      <div className="flex flex-col gap-2">
        <div className="flex justify-between gap-2 items-center flex-wrap">
          <Input
            isClearable
            size="sm"
            className="w-full sm:max-w-[280px]"
            classNames={{ inputWrapper: "h-8 min-h-8" }}
            placeholder="Search ..."
            startContent={<Search className="w-4 h-4 text-default-400" />}
            value={filterValue}
            onClear={() => onClear()}
            onValueChange={onSearchChange}
          />
          <div className="flex gap-1.5 flex-wrap">
            <Dropdown>
              <DropdownTrigger className="hidden sm:flex">
                <Button
                  endContent={<ChevronDown className="w-3.5 h-3.5" />}
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
                {[
                  { label: "PENDING", uid: "PENDING" },
                  { label: "APPROVED", uid: "APPROVED" },
                  { label: "UNDER_REVIEW", uid: "UNDER_REVIEW" },
                  { label: "PAYMENT_PROCESSING", uid: "PAYMENT_PROCESSING" },
                  { label: "PAYMENT_RELEASED", uid: "PAYMENT_RELEASED" },
                  { label: "ON_HOLD", uid: "ON_HOLD" },
                  { label: "REJECTED", uid: "REJECTED" },
                ].map((status) => (
                  <DropdownItem key={status.uid} className="capitalize">
                    {status.label}
                  </DropdownItem>
                ))}
              </DropdownMenu>
            </Dropdown>
            <Dropdown>
              <DropdownTrigger className="hidden sm:flex">
                <Button
                  endContent={<ChevronDown className="w-3.5 h-3.5" />}
                  variant="flat"
                >
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
          <span className="text-default-400 text-[12.5px]">
            Total {count} payments requests
          </span>
          <label className="flex items-center gap-1 text-default-400 text-[12.5px]">
            Rows per page:
            <select
              className="bg-transparent outline-hidden text-default-400 text-[12.5px] cursor-pointer"
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
    count,
    onSearchChange,
    hasSearchFilter,
    filteration.status,
  ]);

  const bottomContent = useMemo(() => {
    return (
      <div className="py-1.5 px-1 flex justify-between items-center">
        <span className="w-[30%] text-[12.5px] text-default-400">
          {selectedKeys === "all"
            ? "All items selected"
            : `${selectedKeys.size} of ${count} selected`}
        </span>
        <Pagination
          isCompact
          showControls
          color="primary"
          page={filteration?.page}
          total={pages}
          onChange={(e) => {
            setFilteration((prev) => ({ ...prev, page: e }));
            if (e > filteration?.page) {
              dispatch(
                getProcurementPaymentRequestList({ ...filteration, page: e }),
              );
            }
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
    <div className="flex flex-col gap-2">
      <h1 className="font-sans text-lg font-semibold mb-2 shrink-0">
        Procurement Payment Requests
      </h1>
      <Table
        isHeaderSticky
        removeWrapper={false}
        aria-label="Procurement payment requests table with custom cells, pagination and sorting"
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
            <TableRow key={item.id}>
              {(columnKey) => (
                <TableCell>{renderCell(item, columnKey)}</TableCell>
              )}
            </TableRow>
          )}
        </TableBody>
      </Table>

      <Modal
        isOpen={approveModal.isOpen}
        onOpenChange={approveModal.onOpenChange}
      >
        <ModalContent>
          {(onClose) => (
            <Form
              className="w-full"
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                handleApproveRequest(
                  String(formData.get("remarks") || "").trim(),
                );
              }}
            >
              <ModalHeader>Approve Request</ModalHeader>
              <ModalBody className="grid grid-cols-1 gap-4 w-full">
                <Input
                  label="Remarks"
                  name="remarks"
                  isRequired
                  errorMessage="Please enter remarks"
                />
              </ModalBody>

              <ModalFooter className="flex justify-end gap-2 w-full">
                <Button type="button" onPress={onClose}>
                  Close
                </Button>
                <Button color="primary" type="submit">
                  Submit
                </Button>
              </ModalFooter>
            </Form>
          )}
        </ModalContent>
      </Modal>
      <Modal
        size="2xl"
        isOpen={rejectModal.isOpen}
        onOpenChange={rejectModal.onOpenChange}
      >
        <ModalContent>
          {(onClose) => (
            <Form
              className="w-full"
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                handleRejectRequest(
                  String(formData.get("remarks") || "").trim(),
                );
              }}
            >
              <ModalHeader>Reject Request</ModalHeader>
              <ModalBody className="grid md:grid-cols-1 gap-4 w-full">
                <Input
                  label="Remarks"
                  name="remarks"
                  isRequired
                  errorMessage="Please enter remarks"
                />
              </ModalBody>

              <ModalFooter className="flex justify-end gap-2 w-full">
                <Button onPress={onClose}>Close</Button>
                <Button color="primary" type="submit">
                  Submit
                </Button>
              </ModalFooter>
            </Form>
          )}
        </ModalContent>
      </Modal>
      <Modal
        size="3xl"
        isOpen={releaseModal.isOpen}
        onOpenChange={(isOpen) => {
          releaseModal.onOpenChange(isOpen);

          if (!isOpen) {
            resetReleasePaymentFields();
          }
        }}
        isDismissable={!isReleaseSubmitting && !isReleaseFileUploading}
        hideCloseButton={isReleaseSubmitting || isReleaseFileUploading}
      >
        <ModalContent>
          {(onClose) => (
            <Form
              className="w-full"
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);

                handlePaymentReleaseRequest(
                  String(formData.get("remarks") || "").trim(),
                );
              }}
            >
              <ModalHeader>Release Payment Request</ModalHeader>

              <ModalBody className="grid w-full grid-cols-1 gap-4 md:grid-cols-2">
                {/* <div className="rounded-xl border border-default-200 p-4 md:col-span-2">
                  <div className="mb-3 text-sm font-semibold">
                    Payment Summary
                  </div>

                  <div className="grid grid-cols-1 gap-3 text-sm md:grid-cols-3">
                    <div className="flex justify-between gap-3 rounded-lg bg-default-50 p-3">
                      <span className="text-default-500">Gross Payable</span>
                      <span className="font-medium">
                        {inrCurrency(releaseGrossPayableAmount)}
                      </span>
                    </div>

                    <div className="flex justify-between gap-3 rounded-lg bg-default-50 p-3">
                      <span className="text-default-500">TDS Deduction</span>
                      <span className="font-medium">
                        {inrCurrency(releaseTdsAmount)}
                      </span>
                    </div>

                    <div className="flex justify-between gap-3 rounded-lg bg-default-50 p-3">
                      <span className="text-default-500">
                        Bank/Cash Payment
                      </span>
                      <span className="font-medium">
                        {inrCurrency(releaseBankPaymentAmount)}
                      </span>
                    </div>
                  </div>
                </div> */}

                <Input
                  type="number"
                  label="Payable Amount"
                  placeholder="Enter payable amount"
                  value={releasePayableAmount}
                  onValueChange={setReleasePayableAmount}
                  min="0.01"
                  max={String(releaseGrossPayableAmount)}
                  step="0.01"
                  isRequired
                  isInvalid={isReleasePayableExceeded}
                  errorMessage={
                    isReleasePayableExceeded
                      ? `Payable amount cannot exceed gross payable ${inrCurrency(
                          releaseGrossPayableAmount,
                        )}`
                      : "Payable amount must be greater than zero"
                  }
                  description={`Maximum allowed: ${inrCurrency(
                    releaseGrossPayableAmount,
                  )}`}
                  onKeyDown={(event) => {
                    if (["-", "+", "e", "E"].includes(event.key)) {
                      event.preventDefault();
                    }
                  }}
                />

                <Input
                  type="date"
                  label="Payment Date"
                  value={releasePaymentDate}
                  onValueChange={setReleasePaymentDate}
                  max={dayjs().format("YYYY-MM-DD")}
                  isRequired
                />
                <Input
                  label="Invoice Number"
                  placeholder="Enter invoice number"
                  value={releaseInvoiceNumber}
                  onValueChange={setReleaseInvoiceNumber}
                  isRequired
                />

                <Input
                  type="date"
                  label="Invoice Date"
                  value={releaseInvoiceDate}
                  onValueChange={setReleaseInvoiceDate}
                  max={dayjs().format("YYYY-MM-DD")}
                  isRequired
                />

                <Select
                  label="Payment Mode"
                  placeholder="Select payment mode"
                  isRequired
                  selectedKeys={
                    releasePaymentMode
                      ? new Set([releasePaymentMode])
                      : new Set([])
                  }
                  onSelectionChange={(keys) => {
                    const selectedValue = Array.from(keys)?.[0] || "";
                    setReleasePaymentMode(String(selectedValue));
                    setReleaseBankLedgerId("");
                  }}
                >
                  <SelectItem key="CASH">Cash</SelectItem>
                  <SelectItem key="UPI">UPI</SelectItem>
                  <SelectItem key="CARD">Card</SelectItem>
                  <SelectItem key="BANK_TRANSFER">Bank Transfer</SelectItem>
                  <SelectItem key="CHEQUE">Cheque</SelectItem>
                </Select>

                <NewSelect
                  isRequired
                  isDisabled={!hasReleasePaymentModeSelected}
                  label={
                    isReleaseCashPaymentMode
                      ? "Select Cash Ledger"
                      : "Select Bank Ledger"
                  }
                  placeholder={
                    !hasReleasePaymentModeSelected
                      ? "Select payment mode first"
                      : isReleaseCashPaymentMode
                        ? "Select cash ledger"
                        : "Select bank ledger"
                  }
                  data={filteredReleasePaymentLedgerList}
                  labelKey="ledgerName"
                  valueKey="id"
                  value={releaseBankLedgerId}
                  onChange={(value) => {
                    setReleaseBankLedgerId(value ? String(value) : "");
                  }}
                />

                <Select
                  label="TDS Applicable"
                  selectedKeys={new Set([releaseTdsActive ? "true" : "false"])}
                  onSelectionChange={(keys) => {
                    const isActive = Array.from(keys)?.[0] === "true";
                    setReleaseTdsActive(isActive);

                    if (!isActive) {
                      setReleaseTdsPercentage("");
                    }
                  }}
                >
                  <SelectItem key="true">Yes</SelectItem>
                  <SelectItem key="false">No</SelectItem>
                </Select>

                {releaseTdsActive && (
                  <Select
                    label="TDS Percentage"
                    placeholder="Select TDS percentage"
                    isRequired
                    selectedKeys={
                      releaseTdsPercentage
                        ? new Set([String(releaseTdsPercentage)])
                        : new Set([])
                    }
                    onSelectionChange={(keys) => {
                      setReleaseTdsPercentage(
                        String(Array.from(keys)?.[0] || ""),
                      );
                    }}
                  >
                    <SelectItem key="2">2%</SelectItem>
                    <SelectItem key="10">10%</SelectItem>
                  </Select>
                )}

                <Input
                  label="Transaction Reference / UTR Number"
                  placeholder={
                    isReleaseCashPaymentMode
                      ? "Optional for cash payment"
                      : "Enter transaction reference or UTR"
                  }
                  value={releaseTransactionReference}
                  onValueChange={setReleaseTransactionReference}
                  isRequired={
                    hasReleasePaymentModeSelected && !isReleaseCashPaymentMode
                  }
                />

                <div>
                  <SingleFileUploader
                    label="Payment Attachment"
                    value={releasePaymentProof}
                    onChange={(value) => {
                      setReleasePaymentProof(value || "");
                    }}
                    onUploadingChange={setIsReleaseFileUploading}
                    isRequired
                  />
                </div>

                <Input
                  className="md:col-span-2"
                  label="Remarks"
                  name="remarks"
                  isRequired
                  errorMessage="Please enter remarks"
                />
              </ModalBody>

              <ModalFooter className="flex w-full justify-end gap-2">
                <Button
                  type="button"
                  onPress={() => {
                    resetReleasePaymentFields();
                    onClose();
                  }}
                  isDisabled={isReleaseSubmitting || isReleaseFileUploading}
                >
                  Close
                </Button>

                <Button
                  color="primary"
                  type="submit"
                  isLoading={isReleaseSubmitting || isReleaseFileUploading}
                  isDisabled={
                    isReleaseFileUploading ||
                    releaseCustomPayableAmount <= 0 ||
                    isReleasePayableExceeded
                  }
                >
                  Release Payment
                </Button>
              </ModalFooter>
            </Form>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
};

export default ProcurementPaymentRequest;
