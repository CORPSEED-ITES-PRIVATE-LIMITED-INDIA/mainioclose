import {
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
  addToast,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Textarea,
  useDisclosure,
  Select,
  SelectItem,
  Form,
  DatePicker,
} from "@heroui/react";
import {
  ArrowLeft,
  ChevronDown,
  EllipsisVertical,
  FileText,
  Plus,
  Search,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useNavigate, useParams, Link } from "react-router-dom";
import {
  createProcurementPaymentRequestByOrderId,
  getOperationProjectDetailById,
  getProcurementOrderByPurchaseId,
  updateProcurementPaymentRequestByOrderId,
} from "../../toolkit/slices/operationSlice";
import { getVendorDetailInProject } from "../../toolkit/slices/vendorsSlice";
import CreatePurchaseOrderModal from "./CreatePurchaseOrderModal";
import { Controller, useForm } from "react-hook-form";
import { getLocalTimeZone, parseDate, today } from "@internationalized/date";
import SingleFileUploader from "../../components/SingleFileUploader";
import NewSelect from "../../components/NewSelect";
import { getActivePaymentLedgerForPaymentRegister } from "../../toolkit/slices/accountSlice";

const columns = [
  { name: "PO NUMBER", uid: "poNumber" },
  { name: "REFERENCE NO.", uid: "poReferenceNumber" },
  { name: "PROJECT", uid: "projectName" },
  { name: "VENDOR", uid: "vendorName" },
  { name: "FINAL AMOUNT", uid: "finalAmount" },
  { name: "GRAND TOTAL", uid: "grandTotal" },
  { name: "PAYMENT", uid: "payment" },
  { name: "TAX", uid: "tax" },
  { name: "STATUS", uid: "status" },
  { name: "CREATED DATE", uid: "createdDate" },
  { name: "ATTACHMENTS", uid: "attachmentUrls" },
  { name: "ACTIONS", uid: "actions" },
];

const INITIAL_VISIBLE_COLUMNS = [
  "poNumber",
  "poReferenceNumber",
  "projectName",
  "vendorName",
  "grandTotal",
  "payment",
  "status",
  "createdDate",
  "attachmentUrls",
  "actions",
];

const FIXED_STATUS_FILTER_OPTIONS = ["DRAFT", "APPROVED"];

function capitalize(value) {
  return value
    ? value.charAt(0).toUpperCase() + value.slice(1).toLowerCase()
    : "";
}

const formatAmount = (value) => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(Number(value || 0));
};

const formatDateTime = (value) => {
  if (!value) return "-";

  return new Date(value).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
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

const normalizePurchaseOrderResponse = (response) => {
  if (Array.isArray(response)) return response;
  if (Array.isArray(response?.content)) return response.content;
  if (Array.isArray(response?.data)) return response.data;
  if (response && typeof response === "object") return [response];

  return [];
};

const getAttachmentUrls = (rowData) => {
  if (Array.isArray(rowData?.attachmentUrls)) {
    return rowData.attachmentUrls;
  }

  if (Array.isArray(rowData?.attachments)) {
    return rowData.attachments
      .map((item) => item?.fileUrl || item?.filePath || item?.url)
      .filter(Boolean);
  }

  if (rowData?.attachmentUrl) {
    return [rowData.attachmentUrl];
  }

  return [];
};

const preventNegativeNumberInput = (event) => {
  if (["-", "+", "e", "E"].includes(event.key)) {
    event.preventDefault();
  }
};

const toTwoDecimalAmount = (value) => {
  const amount = Number(value);

  if (!Number.isFinite(amount)) {
    return 0;
  }

  return Number(amount.toFixed(2));
};

const RaiseProcurementPaymentRequestModal = ({
  open,
  onClose,
  procurementOrder,
  createdBy,
  onSuccess,
}) => {
  const dispatch = useDispatch();
  const [isFileUploading, setIsFileUploading] = useState(false);

  const paymentLedgerList = useSelector(
    (state) => state.account.paymentLegerList,
  );

  const {
    control,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      amount: "",
      paymentDate: "",
      paymentMode: "",
      bankLedgerId: "",
      transactionReference: "",
      paymentProof: "",

      gstActive: false,
      gstPercentage: "",

      tdsActive: false,
      tds: {
        tdsPercentage: "",
      },

      remarks: "",
    },
  });

  const poFinalAmount = Number(procurementOrder?.finalAmount || 0);
  const poGstRate = Number(procurementOrder?.gstRate || 0);
  const poTdsPercentage = Number(procurementOrder?.tdsPercentage || 0);

  const poCgstAmount = Number(procurementOrder?.cgstAmount || 0);
  const poSgstAmount = Number(procurementOrder?.sgstAmount || 0);
  const poIgstAmount = Number(procurementOrder?.igstAmount || 0);

  const poTdsAmount = Number(procurementOrder?.tdsAmount || 0);
  const poTotalTaxAmount = Number(procurementOrder?.totalTaxAmount || 0);
  const poGrandTotal = Number(procurementOrder?.grandTotal || 0);

  const defaultGstActive = poTotalTaxAmount > 0 || poGstRate > 0;
  const defaultTdsActive = poTdsAmount > 0 || poTdsPercentage > 0;

  const vendorGSTNumber = String(procurementOrder?.vendorGSTNumber || "")
    .trim()
    .toUpperCase();

  const isUttarPradeshVendor = vendorGSTNumber.startsWith("09");

  const resolvedGstType = isUttarPradeshVendor ? "CGST_SGST" : "IGST";

  const amount = watch("amount");
  const paymentMode = watch("paymentMode");
  const gstActive = watch("gstActive");
  const gstPercentage = watch("gstPercentage");
  const tdsActive = watch("tdsActive");
  const selectedTdsPercentage = watch("tds.tdsPercentage");

  const baseAmount = toTwoDecimalAmount(amount);

  const calculatedGstAmount = gstActive
    ? toTwoDecimalAmount((baseAmount * Number(gstPercentage || 0)) / 100)
    : 0;

  const calculatedCgstAmount =
    gstActive && resolvedGstType === "CGST_SGST"
      ? toTwoDecimalAmount(calculatedGstAmount / 2)
      : 0;

  const calculatedSgstAmount =
    gstActive && resolvedGstType === "CGST_SGST"
      ? toTwoDecimalAmount(calculatedGstAmount / 2)
      : 0;

  const calculatedIgstAmount =
    gstActive && resolvedGstType === "IGST" ? calculatedGstAmount : 0;

  const calculatedTdsAmount = tdsActive
    ? toTwoDecimalAmount(
        (baseAmount * Number(selectedTdsPercentage || 0)) / 100,
      )
    : 0;

  const calculatedInvoiceAmount = toTwoDecimalAmount(
    baseAmount + calculatedGstAmount,
  );

  const calculatedPayableAmount = toTwoDecimalAmount(
    calculatedInvoiceAmount - calculatedTdsAmount,
  );

  const hasPaymentModeSelected = Boolean(String(paymentMode || "").trim());

  const isCashPaymentMode =
    String(paymentMode || "")
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

  const filteredPaymentLedgerList = useMemo(() => {
    if (!hasPaymentModeSelected) {
      return [];
    }

    const ledgers = Array.isArray(paymentLedgerList) ? paymentLedgerList : [];

    return isCashPaymentMode
      ? ledgers.filter(isCashLedger)
      : ledgers.filter((ledger) => !isCashLedger(ledger));
  }, [
    hasPaymentModeSelected,
    isCashLedger,
    isCashPaymentMode,
    paymentLedgerList,
  ]);

  useEffect(() => {
    dispatch(getActivePaymentLedgerForPaymentRegister());
  }, [dispatch]);

  useEffect(() => {
    setValue("bankLedgerId", "");
  }, [paymentMode, setValue]);

  useEffect(() => {
    if (!gstActive) {
      setValue("gstPercentage", "");
    }
  }, [gstActive, setValue]);

  useEffect(() => {
    if (!tdsActive) {
      setValue("tds.tdsPercentage", "");
    }
  }, [tdsActive, setValue]);

  useEffect(() => {
    if (!open) return;

    const defaultAmount =
      poFinalAmount > 0 ? poFinalAmount : poGrandTotal > 0 ? poGrandTotal : "";

    reset({
      amount: defaultAmount !== "" ? String(defaultAmount) : "",
      paymentDate: "",
      paymentMode: "",
      bankLedgerId: "",
      transactionReference: "",
      paymentProof: "",

      gstActive: defaultGstActive,
      gstPercentage: defaultGstActive && poGstRate > 0 ? String(poGstRate) : "",

      tdsActive: defaultTdsActive,
      tds: {
        tdsPercentage:
          defaultTdsActive && poTdsPercentage > 0
            ? String(poTdsPercentage)
            : "",
      },

      remarks: "",
    });
  }, [
    defaultGstActive,
    defaultTdsActive,
    open,
    poFinalAmount,
    poGrandTotal,
    poGstRate,
    poTdsPercentage,
    procurementOrder,
    reset,
  ]);

  const handleClose = () => {
    reset();
    setIsFileUploading(false);
    onClose();
  };

  const onSubmit = async (values) => {
    if (!procurementOrder?.id) {
      addToast({
        title: "Procurement order missing",
        description: "Procurement order ID is required to raise PR.",
        color: "danger",
      });
      return;
    }

    const paymentAmount = toTwoDecimalAmount(values.amount);

    if (paymentAmount <= 0) {
      addToast({
        title: "Invalid amount",
        description: "Payment amount must be greater than zero.",
        color: "danger",
      });
      return;
    }

    const selectedLedgerId = Number(values.bankLedgerId);

    const selectedLedger = (
      Array.isArray(paymentLedgerList) ? paymentLedgerList : []
    ).find((ledger) => Number(ledger?.id) === selectedLedgerId);

    const selectedLedgerType = String(
      selectedLedger?.ledgerType ||
        (String(values.paymentMode || "").toUpperCase() === "CASH"
          ? "CASH"
          : "BANK"),
    )
      .trim()
      .toUpperCase();

    const selectedGstPercentage = values.gstActive
      ? toTwoDecimalAmount(values.gstPercentage)
      : 0;

    const selectedTdsRate = values.tdsActive
      ? toTwoDecimalAmount(values.tds?.tdsPercentage)
      : 0;

    const gstAmount = values.gstActive
      ? toTwoDecimalAmount((paymentAmount * selectedGstPercentage) / 100)
      : 0;

    const tdsAmount = values.tdsActive
      ? toTwoDecimalAmount((paymentAmount * selectedTdsRate) / 100)
      : 0;

    const invoiceAmount = toTwoDecimalAmount(paymentAmount + gstAmount);

    const payableAmount = toTwoDecimalAmount(invoiceAmount - tdsAmount);

    const normalizedVendorGSTNumber = String(
      procurementOrder?.vendorGSTNumber || "",
    )
      .trim()
      .toUpperCase();

    const vendorGstStateCode =
      normalizedVendorGSTNumber.length >= 2
        ? normalizedVendorGSTNumber.substring(0, 2)
        : null;

    const applyCgstSgst = values.gstActive && vendorGstStateCode === "09";

    const applyIgst = values.gstActive && vendorGstStateCode !== "09";

    const cgstAmount = applyCgstSgst ? toTwoDecimalAmount(gstAmount / 2) : 0;

    const sgstAmount = applyCgstSgst ? toTwoDecimalAmount(gstAmount / 2) : 0;

    const igstAmount = applyIgst ? gstAmount : 0;

    /*
     * IMPORTANT:
     * Payload keys are intentionally unchanged.
     * Only their values are now taken/calculated from the Raise PR form.
     */
    const payload = {
      invoiceAmount,
      payableAmount,

      amount: paymentAmount,
      paymentDate: values.paymentDate,
      paymentMode: values.paymentMode,
      bankLedgerId: selectedLedgerId,
      ledgerId: selectedLedgerId,
      ledgerType: selectedLedgerType,
      transactionReference: String(values.transactionReference || "").trim(),
      paymentProof: values.paymentProof,
      proofAttachmentUrls: values.paymentProof ? [values.paymentProof] : [],

      tdsActive: Boolean(values.tdsActive),
      tdsPercentage: values.tdsActive ? selectedTdsRate : null,
      tdsAmount: values.tdsActive ? tdsAmount : 0,
      tds: values.tdsActive
        ? {
            tdsPercentage: selectedTdsRate,
          }
        : null,

      gstActive: Boolean(values.gstActive),
      gstPercentage: values.gstActive ? selectedGstPercentage : null,
      gstType: values.gstActive ? resolvedGstType : null,
      gstAmount: values.gstActive ? gstAmount : 0,
      totalWithGst: invoiceAmount,

      remarks: values.remarks || "",
      completionRemarks: values.remarks || "",
      createdBy: Number(createdBy),

      gstStateCode: values.gstActive ? vendorGstStateCode : null,
      gstStateName: null,

      cgstRate: applyCgstSgst
        ? toTwoDecimalAmount(selectedGstPercentage / 2)
        : 0,
      sgstRate: applyCgstSgst
        ? toTwoDecimalAmount(selectedGstPercentage / 2)
        : 0,
      igstRate: applyIgst ? selectedGstPercentage : 0,

      cgstAmount,
      sgstAmount,
      igstAmount,
    };

    const resultAction = await dispatch(
      createProcurementPaymentRequestByOrderId({
        procurementOrderId: procurementOrder.id,
        data: payload,
      }),
    );

    if (
      createProcurementPaymentRequestByOrderId.fulfilled.match(resultAction)
    ) {
      addToast({
        title: "Payment request raised",
        description: "Procurement payment request created successfully.",
        color: "success",
      });

      handleClose();
      onSuccess?.();
      return;
    }

    addToast({
      title: "Failed to raise PR",
      description:
        resultAction?.payload?.message ||
        resultAction?.payload ||
        "Something went wrong while creating payment request.",
      color: "danger",
    });
  };

  return (
    <Modal
      isOpen={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) handleClose();
      }}
      size="4xl"
      placement="top-center"
      isDismissable={false}
      isKeyboardDismissDisabled
      classNames={{
        base: "max-h-[92vh]",
        body: "overflow-y-auto",
      }}
    >
      <ModalContent>
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex max-h-[92vh] flex-col"
        >
          <ModalHeader className="flex shrink-0 flex-col gap-1 border-b border-default-200">
            <span>Raise Procurement Payment Request</span>

            <span className="text-xs font-normal text-default-500">
              PO Number: {procurementOrder?.poNumber || "-"}
            </span>
          </ModalHeader>

          <ModalBody className="flex-1 gap-4 overflow-y-auto px-6 py-4">
            <div className="rounded-xl border border-default-200 p-4">
              <div className="mb-3 text-sm font-semibold">Payment Summary</div>

              <div className="grid grid-cols-1 gap-3 text-sm md:grid-cols-2">
                <div className="flex justify-between gap-3 rounded-lg bg-default-50 p-3">
                  <span className="text-default-500">Base Amount</span>
                  <span className="font-medium">
                    {formatAmount(baseAmount)}
                  </span>
                </div>

                {gstActive && (
                  <div className="flex justify-between gap-3 rounded-lg bg-default-50 p-3">
                    <span className="text-default-500">
                      GST ({Number(gstPercentage || 0)}%)
                    </span>
                    <span className="font-medium">
                      {formatAmount(calculatedGstAmount)}
                    </span>
                  </div>
                )}

                {gstActive && resolvedGstType === "CGST_SGST" && (
                  <>
                    <div className="flex justify-between gap-3 rounded-lg bg-default-50 p-3">
                      <span className="text-default-500">CGST</span>
                      <span className="font-medium">
                        {formatAmount(calculatedCgstAmount)}
                      </span>
                    </div>

                    <div className="flex justify-between gap-3 rounded-lg bg-default-50 p-3">
                      <span className="text-default-500">SGST</span>
                      <span className="font-medium">
                        {formatAmount(calculatedSgstAmount)}
                      </span>
                    </div>
                  </>
                )}

                {gstActive && resolvedGstType === "IGST" && (
                  <div className="flex justify-between gap-3 rounded-lg bg-default-50 p-3">
                    <span className="text-default-500">IGST</span>
                    <span className="font-medium">
                      {formatAmount(calculatedIgstAmount)}
                    </span>
                  </div>
                )}

                {tdsActive && (
                  <div className="flex justify-between gap-3 rounded-lg bg-default-50 p-3">
                    <span className="text-default-500">
                      TDS ({Number(selectedTdsPercentage || 0)}%)
                    </span>
                    <span className="font-medium text-danger">
                      - {formatAmount(calculatedTdsAmount)}
                    </span>
                  </div>
                )}
              </div>

              <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
                <div className="flex items-center justify-between rounded-lg border border-default-200 bg-default-50 p-4">
                  <span className="font-semibold">Invoice Amount</span>
                  <span className="text-lg font-bold">
                    {formatAmount(calculatedInvoiceAmount)}
                  </span>
                </div>

                <div className="flex items-center justify-between rounded-lg border border-primary-200 bg-primary-50 p-4">
                  <span className="font-semibold text-primary">
                    Payable Amount
                  </span>
                  <span className="text-lg font-bold text-primary">
                    {formatAmount(calculatedPayableAmount)}
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <Controller
                name="amount"
                control={control}
                rules={{
                  required: "Amount is required",
                  validate: (value) =>
                    Number(value) > 0 || "Amount must be greater than zero",
                }}
                render={({ field, fieldState: { error } }) => (
                  <Input
                    {...field}
                    type="number"
                    min={0}
                    step="0.01"
                    inputMode="decimal"
                    label="Payment Amount"
                    placeholder="Enter amount"
                    isRequired
                    onKeyDown={preventNegativeNumberInput}
                    isInvalid={Boolean(error)}
                    errorMessage={error?.message}
                    onChange={(event) => {
                      const value = event.target.value;

                      if (value === "") {
                        field.onChange("");
                        return;
                      }

                      if (!/^\d*(\.\d{0,2})?$/.test(value)) {
                        return;
                      }

                      field.onChange(value);
                    }}
                  />
                )}
              />

              <Controller
                name="paymentDate"
                control={control}
                rules={{
                  required: "Payment date is required",
                }}
                render={({ field, fieldState: { error } }) => (
                  <DatePicker
                    isRequired
                    label="Payment Date"
                    showMonthAndYearPickers
                    maxValue={today(getLocalTimeZone())}
                    isInvalid={Boolean(error)}
                    errorMessage={error?.message}
                    value={
                      field.value && /^\d{4}-\d{2}-\d{2}$/.test(field.value)
                        ? parseDate(field.value)
                        : null
                    }
                    onChange={(value) => {
                      field.onChange(value ? value.toString() : "");
                    }}
                  />
                )}
              />

              <Controller
                name="paymentMode"
                control={control}
                rules={{
                  required: "Payment mode is required",
                }}
                render={({ field, fieldState: { error } }) => (
                  <Select
                    label="Payment Mode"
                    isRequired
                    selectedKeys={
                      field.value ? new Set([field.value]) : new Set([])
                    }
                    onSelectionChange={(keys) => {
                      field.onChange(Array.from(keys)?.[0] || "");
                    }}
                    isInvalid={Boolean(error)}
                    errorMessage={error?.message}
                  >
                    <SelectItem key="CASH">Cash</SelectItem>
                    <SelectItem key="UPI">UPI</SelectItem>
                    <SelectItem key="CARD">Card</SelectItem>
                    <SelectItem key="BANK_TRANSFER">Bank Transfer</SelectItem>
                    <SelectItem key="CHEQUE">Cheque</SelectItem>
                  </Select>
                )}
              />

              <Controller
                name="bankLedgerId"
                control={control}
                rules={{
                  required: "Bank/Cash ledger is required",
                }}
                render={({ field, fieldState: { error } }) => (
                  <div>
                    <NewSelect
                      isRequired
                      isDisabled={!hasPaymentModeSelected}
                      label={
                        isCashPaymentMode
                          ? "Select Cash Ledger"
                          : "Select Bank Ledger"
                      }
                      placeholder={
                        !hasPaymentModeSelected
                          ? "Select payment mode first"
                          : isCashPaymentMode
                            ? "Select cash ledger"
                            : "Select bank ledger"
                      }
                      data={filteredPaymentLedgerList}
                      labelKey="ledgerName"
                      valueKey="id"
                      value={field.value ?? ""}
                      onChange={(value) => {
                        field.onChange(value ? String(value) : "");
                      }}
                    />

                    {error?.message && (
                      <p className="mt-1 text-xs text-danger">
                        {error.message}
                      </p>
                    )}
                  </div>
                )}
              />

              <Controller
                name="gstActive"
                control={control}
                render={({ field }) => (
                  <Select
                    label="GST Applicable"
                    selectedKeys={new Set([field.value ? "true" : "false"])}
                    onSelectionChange={(keys) => {
                      field.onChange(Array.from(keys)?.[0] === "true");
                    }}
                  >
                    <SelectItem key="true">Yes</SelectItem>
                    <SelectItem key="false">No</SelectItem>
                  </Select>
                )}
              />

              {gstActive && (
                <Controller
                  name="gstPercentage"
                  control={control}
                  rules={{
                    required: "GST rate is required",
                  }}
                  render={({ field, fieldState: { error } }) => (
                    <Select
                      label="GST Rate"
                      isRequired
                      selectedKeys={
                        field.value
                          ? new Set([String(field.value)])
                          : new Set([])
                      }
                      onSelectionChange={(keys) => {
                        field.onChange(Array.from(keys)?.[0] || "");
                      }}
                      isInvalid={Boolean(error)}
                      errorMessage={error?.message}
                    >
                      <SelectItem key="5">5%</SelectItem>
                      <SelectItem key="12">12%</SelectItem>
                      <SelectItem key="18">18%</SelectItem>
                      <SelectItem key="28">28%</SelectItem>
                    </Select>
                  )}
                />
              )}

              <Controller
                name="tdsActive"
                control={control}
                render={({ field }) => (
                  <Select
                    label="TDS Applicable"
                    selectedKeys={new Set([field.value ? "true" : "false"])}
                    onSelectionChange={(keys) => {
                      field.onChange(Array.from(keys)?.[0] === "true");
                    }}
                  >
                    <SelectItem key="true">Yes</SelectItem>
                    <SelectItem key="false">No</SelectItem>
                  </Select>
                )}
              />

              {tdsActive && (
                <Controller
                  name="tds.tdsPercentage"
                  control={control}
                  rules={{
                    required: "TDS percentage is required",
                  }}
                  render={({ field, fieldState: { error } }) => (
                    <Select
                      label="TDS Percentage"
                      isRequired
                      selectedKeys={
                        field.value !== undefined &&
                        field.value !== null &&
                        field.value !== ""
                          ? new Set([String(field.value)])
                          : new Set([])
                      }
                      onSelectionChange={(keys) => {
                        field.onChange(Array.from(keys)?.[0] || "");
                      }}
                      isInvalid={Boolean(error)}
                      errorMessage={error?.message}
                    >
                      <SelectItem key="2">2%</SelectItem>
                      <SelectItem key="10">10%</SelectItem>
                    </Select>
                  )}
                />
              )}

              <Controller
                name="transactionReference"
                control={control}
                rules={{
                  required: "Transaction reference number is required",
                }}
                render={({ field, fieldState: { error } }) => (
                  <Input
                    {...field}
                    label="Transaction Reference Number / UTR Number"
                    placeholder="Enter transaction reference"
                    isRequired
                    isInvalid={Boolean(error)}
                    errorMessage={error?.message}
                  />
                )}
              />

              <Controller
                name="paymentProof"
                control={control}
                rules={{
                  required: "Payment proof is required",
                }}
                render={({ field, fieldState: { error } }) => (
                  <div>
                    <SingleFileUploader
                      label="Payment Proof"
                      value={field.value}
                      onChange={(value) => {
                        field.onChange(value || "");
                      }}
                      onUploadingChange={setIsFileUploading}
                      isRequired
                      isInvalid={Boolean(error)}
                      errorMessage={error?.message}
                    />

                    {error?.message && (
                      <p className="mt-1 text-xs text-danger">
                        {error.message}
                      </p>
                    )}
                  </div>
                )}
              />

              <Controller
                name="remarks"
                control={control}
                render={({ field }) => (
                  <Textarea
                    {...field}
                    label="Remarks"
                    placeholder="Enter remarks"
                    minRows={3}
                    maxRows={4}
                    variant="bordered"
                    className="md:col-span-2"
                  />
                )}
              />
            </div>
          </ModalBody>

          <ModalFooter className="shrink-0 border-t border-default-200 bg-background">
            <Button
              type="button"
              variant="flat"
              color="danger"
              onPress={handleClose}
              isDisabled={isSubmitting || isFileUploading}
            >
              Cancel
            </Button>

            <Button
              color="primary"
              type="submit"
              isLoading={isSubmitting || isFileUploading}
              isDisabled={isFileUploading}
            >
              Submit PR
            </Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
};

const ProjectPurchaseOrder = () => {
  const { userId, projectId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { isOpen, onOpen, onOpenChange, onClose } = useDisclosure();
  const [isCreatePoModalOpen, setIsCreatePoModalOpen] = useState(false);
  const [isRaisePrModalOpen, setIsRaisePrModalOpen] = useState(false);
  const [selectedProcurementOrder, setSelectedProcurementOrder] =
    useState(null);

  const purchaseOrderResponse = useSelector(
    (state) => state.operation.procurementOrderByPurchaseIdList?.content,
  );

  const isLoading = useSelector(
    (state) => state.operation.procurementOrderByPurchaseIdLoading,
  );

  const error = useSelector(
    (state) => state.operation.procurementOrderByPurchaseIdError,
  );

  const detailedData = useSelector(
    (state) => state.operation.operationProjectDetail,
  );

  const vendorDetail = useSelector(
    (state) => state.vendors.vendorDetailInProject,
  );

  const data = useMemo(() => {
    return normalizePurchaseOrderResponse(purchaseOrderResponse);
  }, [purchaseOrderResponse]);

  const routeState = location?.state || {};
  const firstPurchaseOrder = data?.[0] || {};
  const projectDetails = detailedData?.projectDetails || {};

  const procurementAssignmentId =
    routeState?.procurementAssignmentId ||
    projectDetails?.procurementMilestoneAssignmentId ||
    projectDetails?.procurementAssignmentId ||
    firstPurchaseOrder?.procurementAssignmentId ||
    firstPurchaseOrder?.procurementMilestoneAssignmentId ||
    null;

  const vendorId =
    routeState?.vendorId ||
    vendorDetail?.selectedVendorId ||
    vendorDetail?.selectedVendor?.id ||
    projectDetails?.selectedVendorId ||
    firstPurchaseOrder?.vendorId ||
    firstPurchaseOrder?.selectedVendorId ||
    null;

  const defaultEstimatedAmount =
    routeState?.defaultEstimatedAmount ||
    projectDetails?.estimatedAmount ||
    projectDetails?.amount ||
    firstPurchaseOrder?.estimatedAmount ||
    firstPurchaseOrder?.finalAmount ||
    0;

  const canCreatePurchaseOrder = Boolean(procurementAssignmentId && vendorId);

  const [filterValue, setFilterValue] = useState("");
  const [selectedKeys, setSelectedKeys] = useState(new Set([]));
  const [visibleColumns, setVisibleColumns] = useState(
    new Set(INITIAL_VISIBLE_COLUMNS),
  );

  const [sortDescriptor, setSortDescriptor] = useState({
    column: "createdDate",
    direction: "descending",
  });

  const [filteration, setFilteration] = useState({
    page: 1,
    size: 10,
    status: "ALL",
  });

  const fetchPurchaseOrders = useCallback(() => {
    if (projectId) {
      dispatch(getProcurementOrderByPurchaseId(projectId));
    }
  }, [dispatch, projectId]);

  useEffect(() => {
    if (projectId && userId) {
      dispatch(getOperationProjectDetailById({ projectId, userId }));
    }

    fetchPurchaseOrders();
  }, [dispatch, projectId, userId, fetchPurchaseOrders]);

  useEffect(() => {
    if (procurementAssignmentId) {
      dispatch(
        getVendorDetailInProject({
          procurementAssignmentId,
        }),
      );
    }
  }, [dispatch, procurementAssignmentId]);

  const handleOpenCreatePurchaseOrder = useCallback(() => {
    if (!procurementAssignmentId) {
      addToast({
        title: "Procurement assignment missing",
        description: "Procurement assignment ID is required to create PO.",
        color: "danger",
      });
      return;
    }

    if (!vendorId) {
      addToast({
        title: "Vendor missing",
        description: "Please finalize/map vendor before creating PO.",
        color: "danger",
      });
      return;
    }

    setIsCreatePoModalOpen(true);
  }, [procurementAssignmentId, vendorId]);

  const headerColumns = useMemo(() => {
    if (visibleColumns === "all") return columns;

    return columns.filter((column) =>
      Array.from(visibleColumns).includes(column.uid),
    );
  }, [visibleColumns]);

  const filteredItems = useMemo(() => {
    let filteredData = [...(data || [])];

    if (filteration.status !== "ALL") {
      filteredData = filteredData.filter(
        (item) => item?.status === filteration.status,
      );
    }

    if (filterValue) {
      const searchValue = filterValue.toLowerCase();

      filteredData = filteredData.filter((item) => {
        return (
          item?.poNumber?.toLowerCase().includes(searchValue) ||
          item?.poReferenceNumber?.toLowerCase().includes(searchValue) ||
          item?.projectName?.toLowerCase().includes(searchValue) ||
          item?.vendorName?.toLowerCase().includes(searchValue) ||
          item?.paymentTypeName?.toLowerCase().includes(searchValue) ||
          item?.paymentTerms?.toLowerCase().includes(searchValue) ||
          item?.status?.toLowerCase().includes(searchValue)
        );
      });
    }

    return filteredData;
  }, [data, filterValue, filteration.status]);

  const sortedItems = useMemo(() => {
    return [...filteredItems].sort((a, b) => {
      const first = a?.[sortDescriptor.column];
      const second = b?.[sortDescriptor.column];

      let cmp = 0;

      if (first === null || first === undefined) cmp = -1;
      else if (second === null || second === undefined) cmp = 1;
      else if (first < second) cmp = -1;
      else if (first > second) cmp = 1;

      return sortDescriptor.direction === "descending" ? -cmp : cmp;
    });
  }, [filteredItems, sortDescriptor]);

  const pages = Math.ceil(sortedItems.length / filteration.size) || 1;

  const paginatedItems = useMemo(() => {
    const start = (filteration.page - 1) * filteration.size;
    const end = start + filteration.size;

    return sortedItems.slice(start, end);
  }, [sortedItems, filteration.page, filteration.size]);

  const onNextPage = useCallback(() => {
    if (filteration.page < pages) {
      setFilteration((prev) => ({
        ...prev,
        page: prev.page + 1,
      }));
    }
  }, [filteration.page, pages]);

  const onPreviousPage = useCallback(() => {
    if (filteration.page > 1) {
      setFilteration((prev) => ({
        ...prev,
        page: prev.page - 1,
      }));
    }
  }, [filteration.page]);

  const onRowsPerPageChange = useCallback((e) => {
    setFilteration((prev) => ({
      ...prev,
      size: Number(e.target.value),
      page: 1,
    }));
  }, []);

  const onSearchChange = useCallback((value) => {
    setFilterValue(value || "");

    setFilteration((prev) => ({
      ...prev,
      page: 1,
    }));
  }, []);

  const onClear = useCallback(() => {
    setFilterValue("");

    setFilteration((prev) => ({
      ...prev,
      page: 1,
    }));
  }, []);

  const handleOpenRaisePrModal = useCallback((rowData) => {
    if (!rowData?.id) {
      addToast({
        title: "Procurement order missing",
        description: "Procurement order ID is required to raise PR.",
        color: "danger",
      });
      return;
    }

    setSelectedProcurementOrder(rowData);
    setIsRaisePrModalOpen(true);
  }, []);

  const renderCell = useCallback(
    (rowData, columnKey) => {
      switch (columnKey) {
        case "poNumber":
          return (
            <div className="flex flex-col">
              <Link
                className="font-medium"
                to={`${rowData?.id}/procurementPaymentRequest`}
              >
                {rowData?.poNumber || "-"}
              </Link>
              <span className="text-xs text-default-400">
                ID: {rowData?.id || "-"}
              </span>
            </div>
          );

        case "poReferenceNumber":
          return (
            <div className="flex flex-col">
              <span>{rowData?.poReferenceNumber || "-"}</span>
              <span className="text-xs text-default-400">
                Assignment ID: {rowData?.procurementAssignmentId || "-"}
              </span>
            </div>
          );

        case "projectName":
          return (
            <div className="flex flex-col">
              <span className="capitalize">{rowData?.projectName || "-"}</span>
              <span className="text-xs text-default-400">
                Project ID: {rowData?.projectId || "-"}
              </span>
            </div>
          );

        case "vendorName":
          return (
            <div className="flex flex-col">
              <span className="capitalize">{rowData?.vendorName || "-"}</span>
              <span className="text-xs text-default-400">
                Vendor ID: {rowData?.vendorId || "-"}
              </span>

              {rowData?.vendorContactName && (
                <span className="text-xs text-default-400">
                  Contact: {rowData.vendorContactName}
                </span>
              )}
            </div>
          );

        case "finalAmount":
          return (
            <div className="flex flex-col">
              <span className="font-medium">
                {formatAmount(rowData?.finalAmount)}
              </span>
              <span className="text-xs text-default-400">
                Estimated: {formatAmount(rowData?.estimatedAmount)}
              </span>
            </div>
          );

        case "grandTotal":
          return (
            <div className="flex flex-col">
              <span className="font-semibold text-success">
                {formatAmount(rowData?.grandTotal)}
              </span>
              <span className="text-xs text-default-400">
                Tax: {formatAmount(rowData?.totalTaxAmount)}
              </span>
            </div>
          );

        case "payment":
          return (
            <div className="flex flex-col">
              <span>{rowData?.paymentTypeName || "-"}</span>
              <span className="text-xs text-default-400">
                {rowData?.paymentTerms || "-"}
              </span>
            </div>
          );

        case "tax":
          return (
            <div className="flex flex-col">
              <span>GST: {rowData?.gstRate || 0}%</span>

              {Number(rowData?.igstAmount || 0) > 0 ? (
                <span className="text-xs text-default-400">
                  IGST: {formatAmount(rowData?.igstAmount)}
                </span>
              ) : (
                <span className="text-xs text-default-400">
                  CGST: {formatAmount(rowData?.cgstAmount)} | SGST:{" "}
                  {formatAmount(rowData?.sgstAmount)}
                </span>
              )}
            </div>
          );

        case "status":
          return (
            <Chip
              size="sm"
              variant="flat"
              color={getStatusColor(rowData?.status)}
              className="capitalize"
            >
              {rowData?.status || "-"}
            </Chip>
          );

        case "createdDate":
          return (
            <div className="flex flex-col">
              <span>{formatDateTime(rowData?.createdDate)}</span>
              <span className="text-xs text-default-400">
                PO Created: {formatDateTime(rowData?.poCreatedDate)}
              </span>
            </div>
          );

        case "attachmentUrls": {
          const attachments = getAttachmentUrls(rowData);

          if (!attachments.length) return "-";

          return (
            <div className="flex flex-col gap-1">
              <Chip size="sm" variant="flat" color="primary">
                {attachments.length} File{attachments.length > 1 ? "s" : ""}
              </Chip>

              <Button
                size="sm"
                variant="light"
                color="primary"
                startContent={<FileText size={14} />}
                onPress={() => {
                  window.open(attachments[0], "_blank", "noopener,noreferrer");
                }}
              >
                View
              </Button>
            </div>
          );
        }

        case "actions":
          return (
            <div className="relative flex justify-center items-center gap-2">
              <Dropdown>
                <DropdownTrigger>
                  <Button isIconOnly size="sm" variant="light">
                    <EllipsisVertical className="text-default-300" />
                  </Button>
                </DropdownTrigger>
                <DropdownMenu
                  selectionMode="single"
                  selectedKeys={[rowData?.status]}
                  onSelectionChange={(e) => {
                    let key = Array.from(e)[0];
                    if (key === "raisePR") {
                      handleOpenRaisePrModal(rowData);
                    }
                    if (key === "updateStatus") {
                      setSelectedProcurementOrder(rowData);
                      onOpen();
                    }
                  }}
                >
                  <DropdownItem key="raisePR">Raise PR</DropdownItem>
                  <DropdownItem key="updateStatus">Update Status</DropdownItem>
                </DropdownMenu>
              </Dropdown>
            </div>
          );

        default:
          return rowData?.[columnKey] || "-";
      }
    },
    [handleOpenRaisePrModal, onOpen],
  );

  const topContent = useMemo(() => {
    const uniqueStatuses = Array.from(
      new Set([
        ...data.map((item) => item?.status).filter(Boolean),
        ...FIXED_STATUS_FILTER_OPTIONS,
      ]),
    );

    const statusOptions = [
      { label: "ALL", uid: "ALL" },
      ...uniqueStatuses.map((status) => ({
        label: status,
        uid: status,
      })),
    ];

    return (
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <Input
            isClearable
            className="w-full md:max-w-[380px]"
            placeholder="Search ..."
            startContent={<Search size={18} />}
            value={filterValue}
            onClear={onClear}
            onValueChange={onSearchChange}
          />

          <div className="flex flex-wrap gap-3">
            <Dropdown>
              <DropdownTrigger>
                <Button
                  endContent={<ChevronDown size={16} />}
                  variant="flat"
                  className="capitalize"
                >
                  {filteration.status}
                </Button>
              </DropdownTrigger>

              <DropdownMenu
                disallowEmptySelection
                aria-label="Status Filter"
                selectionMode="single"
                selectedKeys={[filteration.status]}
                onSelectionChange={(selectedKeys) => {
                  const selected = Array.from(selectedKeys)[0];

                  setFilteration((prev) => ({
                    ...prev,
                    page: 1,
                    status: selected,
                  }));
                }}
              >
                {statusOptions.map((status) => (
                  <DropdownItem key={status.uid}>{status.label}</DropdownItem>
                ))}
              </DropdownMenu>
            </Dropdown>
            <Button
              color="primary"
              startContent={<Plus size={16} />}
              onPress={handleOpenCreatePurchaseOrder}
            >
              Add Purchase Order
            </Button>

            <Dropdown>
              <DropdownTrigger>
                <Button endContent={<ChevronDown size={16} />} variant="flat">
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

        <div className="flex items-center justify-between">
          <span className="text-default-400 text-small">
            Total {sortedItems.length} purchase orders
          </span>

          <label className="flex items-center text-default-400 text-small">
            Rows per page:
            <select
              className="bg-transparent outline-hidden text-default-400 text-small"
              onChange={onRowsPerPageChange}
              value={filteration.size}
            >
              <option value="5">5</option>
              <option value="10">10</option>
              <option value="15">15</option>
              <option value="25">25</option>
              <option value="50">50</option>
            </select>
          </label>
        </div>
      </div>
    );
  }, [
    data,
    filterValue,
    filteration.status,
    filteration.size,
    onClear,
    onRowsPerPageChange,
    onSearchChange,
    sortedItems.length,
    visibleColumns,
  ]);

  const bottomContent = useMemo(() => {
    return (
      <div className="py-2 px-2 flex justify-between items-center">
        <span className="w-[30%] text-small text-default-400">
          {selectedKeys === "all"
            ? "All items selected"
            : `${selectedKeys.size} of ${sortedItems.length} selected`}
        </span>

        <Pagination
          isCompact
          showControls
          showShadow
          color="primary"
          page={filteration.page}
          total={pages}
          onChange={(page) => {
            setFilteration((prev) => ({
              ...prev,
              page,
            }));
          }}
        />

        <div className="hidden sm:flex w-[30%] justify-end gap-2">
          <Button
            isDisabled={filteration.page <= 1}
            size="sm"
            variant="flat"
            onPress={onPreviousPage}
          >
            Previous
          </Button>

          <Button
            isDisabled={filteration.page >= pages}
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
    sortedItems.length,
    filteration.page,
    pages,
    onPreviousPage,
    onNextPage,
  ]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="font-sans text-2xl font-medium">
            Project Purchase Orders
          </h1>

          <p className="text-sm text-default-500">Project ID: {projectId}</p>
        </div>
      </div>

      {!canCreatePurchaseOrder && (
        <div className="rounded-lg border border-warning-200 bg-warning-50 px-4 py-3 text-sm text-warning-700">
          Purchase order creation needs procurement assignment and selected
          vendor. Please finalize/map vendor first.
        </div>
      )}

      {error && (
        <div className="rounded-lg border border-danger-200 bg-danger-50 px-4 py-3 text-sm text-danger">
          {error}
        </div>
      )}

      <Table
        isHeaderSticky
        aria-label="Project purchase order table"
        bottomContent={bottomContent}
        bottomContentPlacement="outside"
        classNames={{
          wrapper: "max-h-[65vh] w-full",
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
              align="start"
              allowsSorting={column.sortable}
            >
              {column.name}
            </TableColumn>
          )}
        </TableHeader>

        <TableBody
          isLoading={isLoading}
          emptyContent={
            isLoading
              ? "Loading purchase orders..."
              : "No purchase orders found"
          }
          items={paginatedItems}
        >
          {(item) => (
            <TableRow key={item?.id || item?.poNumber}>
              {(columnKey) => (
                <TableCell>{renderCell(item, columnKey)}</TableCell>
              )}
            </TableRow>
          )}
        </TableBody>
      </Table>

      <CreatePurchaseOrderModal
        open={isCreatePoModalOpen}
        onClose={() => setIsCreatePoModalOpen(false)}
        procurementAssignmentId={Number(procurementAssignmentId)}
        userId={Number(userId)}
        createdBy={Number(userId)}
        defaultEstimatedAmount={Number(defaultEstimatedAmount || 0)}
        vendorId={Number(vendorId)}
        onSuccess={fetchPurchaseOrders}
      />

      <RaiseProcurementPaymentRequestModal
        open={isRaisePrModalOpen}
        onClose={() => {
          setIsRaisePrModalOpen(false);
          setSelectedProcurementOrder(null);
        }}
        procurementOrder={selectedProcurementOrder}
        createdBy={Number(userId)}
        onSuccess={fetchPurchaseOrders}
      />

      <Modal
        isDismissable={false}
        isKeyboardDismissDisabled={true}
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        placement="top-center"
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader>Update status</ModalHeader>
              <ModalBody>
                <Form
                  onSubmit={(e) => {
                    e.preventDefault();
                    let data = Object.fromEntries(
                      new FormData(e.currentTarget),
                    );

                    dispatch(
                      updateProcurementPaymentRequestByOrderId({
                        procurementOrderId: selectedProcurementOrder?.id,
                        data: {
                          status: data.status,
                          remarks: data.comment,
                          userId,
                        },
                      }),
                    ).then((res) => {
                      if (res.meta.requestStatus === "fulfilled") {
                        addToast({
                          title: "Status updated",
                          description:
                            "Procurement order status updated successfully.",
                          color: "success",
                        });
                        onClose();
                        fetchPurchaseOrders();
                      } else {
                        addToast({
                          title: "Failed to update status",
                          description:
                            res?.payload ||
                            "Something went wrong while updating status.",
                          color: "danger",
                        });
                      }
                    });
                  }}
                  className="flex flex-col gap-4"
                >
                  <div className="max-h-[60vh] overflow-auto px-2 space-x-0 space-y-4 w-full">
                    <Select
                      className="max-w-full"
                      name="status"
                      isRequired
                      errorMessage="please select status"
                      items={[
                        { label: "APPROVED", uid: "APPROVED" },
                        { label: "DRAFT", uid: "DRAFT" },
                      ]}
                      label="Select status"
                    >
                      {(status) => (
                        <SelectItem key={status?.uid}>
                          {status.label}
                        </SelectItem>
                      )}
                    </Select>
                    <Input
                      className="w-full"
                      label="Remark"
                      name="remarks"
                      isRequired
                      errorMessage={"please enter comment"}
                    />
                  </div>

                  <ModalFooter className="flex justify-end w-full">
                    <Button onPress={onClose}>Cancel</Button>
                    <Button color="primary" type="submit">
                      Submit
                    </Button>
                  </ModalFooter>
                </Form>
              </ModalBody>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
};

export default ProjectPurchaseOrder;
