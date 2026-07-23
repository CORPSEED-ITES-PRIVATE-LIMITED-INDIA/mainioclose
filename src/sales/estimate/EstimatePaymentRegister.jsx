import React, { memo, useEffect, useMemo } from "react";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Button,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Select,
  SelectItem,
  Textarea,
  DatePicker,
} from "@heroui/react";
import { addToast } from "@heroui/react";
import { getLocalTimeZone, today, parseDate } from "@internationalized/date";
import SingleFileUploader from "../../components/SingleFileUploader";
import { useParams } from "react-router-dom";
import NewSelect from "../../components/NewSelect";
import { useDispatch, useSelector } from "react-redux";
import { getAllPaymentType } from "../../toolkit/slices/settingSlice";
import BaseAmountCalculator from "../../components/BaseAmountCalculator";
import {
  getAllEstimateByUserId,
  getTotalCountOfEstimate,
} from "../../toolkit/slices/leadSlice";
import {
  getActivePaymentLedgerForPaymentRegister,
  getEstimatePaymentHistory,
} from "../../toolkit/slices/accountSlice";

const paymentTenureOptions = [
  { label: "NET 0", value: "NET 0", days: 0 },
  { label: "NET 7", value: "NET 7", days: 7 },
  { label: "NET 15", value: "NET 15", days: 15 },
  { label: "NET 30", value: "NET 30", days: 30 },
  { label: "NET 45", value: "NET 45", days: 45 },
  { label: "NET 60", value: "NET 60", days: 60 },
  { label: "NET 90", value: "NET 90", days: 90 },
];

const bankOptions = [
  { label: "HDFC Bank", value: "HDFC Bank" },
  { label: "ICICI Bank", value: "ICICI Bank" },
  { label: "Axis Bank", value: "Axis Bank" },
  { label: "State Bank of India", value: "State Bank of India" },
  { label: "Kotak Mahindra Bank", value: "Kotak Mahindra Bank" },
  { label: "Yes Bank", value: "Yes Bank" },
];

const bankRequiredPaymentModes = ["UPI", "CHEQUE", "BANK_TRANSFER", "CARD"];

const PAYMENT_FLOW = {
  REGULAR: "REGULAR",
  PURCHASE_ORDER: "PURCHASE_ORDER",
};

const toTwoDecimalAmount = (value) => {
  const parsedValue = Number(value);

  if (!Number.isFinite(parsedValue)) {
    return 0;
  }

  return Number(parsedValue.toFixed(2));
};

const preventNegativeNumberInput = (e) => {
  if (["-", "+", "e", "E"].includes(e.key)) {
    e.preventDefault();
  }
};

const numberLike = (label) =>
  z
    .union([z.number(), z.string().min(1, `${label} is required`)])
    .transform((v) => (typeof v === "string" ? Number(v) : v))
    .refine((v) => !Number.isNaN(v), `${label} must be a valid number`);

const purchaseOrderPaymentSchema = z.object({
  paymentFlow: z.literal(PAYMENT_FLOW.PURCHASE_ORDER),

  paymentTypeId: numberLike("Payment type").refine(
    (v) => v > 0,
    "Payment type is required",
  ),

  paymentTerms: z.string().min(1, "Payment tenure is required"),
  paymentTermsDays: z.union([z.number(), z.string()]).optional(),

  poNumber: z.string().trim().min(1, "PO number is required"),
  poAttachmentUrl: z.string().trim().min(1, "PO attachment is required"),

  remarks: z.string().optional(),
});

const regularPaymentSchema = z.object({
  paymentFlow: z.literal(PAYMENT_FLOW.REGULAR),

  amount: numberLike("Amount").refine(
    (v) => v >= 0,
    "Amount must be 0 or greater",
  ),

  paymentDate: z.string().min(1, "Payment date is required"),
  paymentMode: z.string().min(1, "Payment mode is required"),
  transactionReference: z
    .string()
    .trim()
    .min(1, "Transaction reference number is required"),
  paymentProof: z.string().trim().min(1, "Payment proof is required"),
  remarks: z.string().optional(),
  bankLedgerId: z.string().optional(),

  paymentTypeId: numberLike("Payment type").refine(
    (v) => v > 0,
    "Payment type is required",
  ),

  eprFinancialYear: z.string().optional(),
  eprPortalRegistrationNumber: z.string().optional(),
  eprCertificateOrInvoiceNumber: z.string().optional(),

  tdsActive: z.boolean().optional(),

  tds: z
    .object({
      tdsPercentage: z.union([z.number(), z.string()]).optional(),
    })
    .optional(),

  governmentFeeActive: z.boolean(),

  governmentFee: z
    .object({
      totalAmount: z.union([z.number(), z.string()]).optional(),
      paymentDate: z.string().optional(),
      feeReferenceNumber: z.string().optional(),
      departmentName: z.string().optional(),
      remarks: z.string().optional(),
    })
    .optional(),
});

const paymentRegisterSchema = z
  .discriminatedUnion("paymentFlow", [
    purchaseOrderPaymentSchema,
    regularPaymentSchema,
  ])
  .superRefine((data, ctx) => {
    if (data.paymentFlow !== PAYMENT_FLOW.REGULAR) {
      return;
    }

    if (data.governmentFeeActive) {
      const gf = data.governmentFee || {};

      if (
        gf.totalAmount === undefined ||
        gf.totalAmount === null ||
        gf.totalAmount === ""
      ) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["governmentFee", "totalAmount"],
          message: "Total amount is required",
        });
      } else if (Number(gf.totalAmount) < 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["governmentFee", "totalAmount"],
          message: "Total amount must be 0 or greater",
        });
      }

      if (!gf.paymentDate) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["governmentFee", "paymentDate"],
          message: "Payment date is required",
        });
      }

      if (!gf.feeReferenceNumber?.trim()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["governmentFee", "feeReferenceNumber"],
          message: "Fee reference number is required",
        });
      }

      if (!gf.departmentName?.trim()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["governmentFee", "departmentName"],
          message: "Department name is required",
        });
      }
    }

    if (data.tdsActive) {
      if (
        data.tds?.tdsPercentage === undefined ||
        data.tds?.tdsPercentage === null ||
        data.tds?.tdsPercentage === ""
      ) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["tds", "tdsPercentage"],
          message: "TDS percentage is required",
        });
      }
    }
  });

const EstimatePaymentRegister = ({
  isOpen,
  onOpenChange,
  onClose,
  estimateId,
  onSubmitPayment,
  paymentTypes = [],
  estimateItem,
  filters,
  filteration,
}) => {
  const { userId } = useParams();
  const dispatch = useDispatch();
  const paymentTypeList = useSelector((state) => state.setting.paymentTypeList);
  const paymentLegerList = useSelector(
    (state) => state.account.paymentLegerList,
  );
  const estimatePaymentHistory = useSelector(
    (state) => state.account.estimatePaymentHistory,
  );

  useEffect(() => {
    dispatch(getAllPaymentType());
  }, [dispatch]);

  const {
    control,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(paymentRegisterSchema),
    defaultValues: {
      paymentFlow: PAYMENT_FLOW.REGULAR,

      amount: "",
      paymentDate: "",
      paymentMode: "",
      transactionReference: "",
      paymentProof: "",

      poNumber: "",
      poAttachmentUrl: "",

      bankLedgerId: "",
      remarks: "",
      paymentTypeId: "",
      paymentTerms: "",
      paymentTermsDays: "",
      eprFinancialYear: "",
      tdsActive: false,
      tds: {
        tdsPercentage: "",
      },
      eprPortalRegistrationNumber: "",
      eprCertificateOrInvoiceNumber: "",
      governmentFeeActive: false,
      governmentFee: {
        totalAmount: "",
        paymentDate: "",
        feeReferenceNumber: "",
        departmentName: "",
        remarks: "",
      },
    },
  });

  const governmentFeeActive = watch("governmentFeeActive");
  const selectedPaymentTypeId = watch("paymentTypeId");
  const tdsActive = watch("tdsActive");
  const paymentMode = watch("paymentMode");

  useEffect(() => {
    setValue("bankLedgerId", "");
  }, [paymentMode, setValue]);

  const hasPaymentModeSelected = !!String(paymentMode || "").trim();

  const isCashPaymentMode = String(paymentMode || "")
    .trim()
    .toLowerCase()
    .includes("cash");

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

  const shouldShowBankName = bankRequiredPaymentModes.includes(paymentMode);

  const availablePaymentTypeList = useMemo(() => {
    const apiPaymentTypes = Array.isArray(paymentTypeList)
      ? paymentTypeList
      : [];

    const lockedPaymentTypeId = estimateItem?.paymentTypeId;

    const allowedApiPaymentTypes =
      lockedPaymentTypeId !== undefined && lockedPaymentTypeId !== null
        ? apiPaymentTypes.filter(
            (item) => String(item?.id) === String(lockedPaymentTypeId),
          )
        : apiPaymentTypes;

    return allowedApiPaymentTypes;
  }, [paymentTypeList, estimateItem?.paymentTypeId]);

  const selectedPaymentType = availablePaymentTypeList.find(
    (item) => String(item?.id) === String(selectedPaymentTypeId),
  );

  const selectedPaymentTypeName = selectedPaymentType?.name || "";

  // Hide TDS fields when the selected estimate belongs to an international unit.
  const normalizedGstRegistrationType = String(
    estimateItem?.unit?.gstRegistrationType || "",
  )
    .trim()
    .toUpperCase();

  const isInternationalUnit = normalizedGstRegistrationType === "INTERNATIONAL";

  const shouldShowTds = !isInternationalUnit;

  const normalizedPaymentTypeName = String(selectedPaymentTypeName || "")
    .trim()
    .toLowerCase();

  const shouldShowPurchaseOrderFields =
    normalizedPaymentTypeName.includes("purchase") &&
    normalizedPaymentTypeName.includes("order");

  const shouldShowRegularPaymentFields = !shouldShowPurchaseOrderFields;

  const shouldShowPaymentTenure = shouldShowPurchaseOrderFields;

  useEffect(() => {
    dispatch(getActivePaymentLedgerForPaymentRegister());
  }, []);

  useEffect(() => {
    if (isOpen && estimateId) {
      dispatch(
        getEstimatePaymentHistory({
          estimateId,
          userId,
        }),
      );
    }
  }, [isOpen, estimateId, userId, dispatch]);

  useEffect(() => {
    const backendTdsPercentage = estimatePaymentHistory?.tdsPercentage;

    const hasTdsPercentage =
      backendTdsPercentage !== undefined &&
      backendTdsPercentage !== null &&
      backendTdsPercentage !== "" &&
      Number(backendTdsPercentage) > 0;

    if (hasTdsPercentage && shouldShowTds && !shouldShowPurchaseOrderFields) {
      setValue("tdsActive", true, {
        shouldValidate: true,
        shouldDirty: false,
      });

      setValue("tds.tdsPercentage", String(backendTdsPercentage), {
        shouldValidate: true,
        shouldDirty: false,
      });
    } else {
      setValue("tdsActive", false, {
        shouldValidate: true,
        shouldDirty: false,
      });

      setValue("tds.tdsPercentage", "", {
        shouldValidate: true,
        shouldDirty: false,
      });
    }
  }, [
    estimatePaymentHistory?.tdsPercentage,
    shouldShowTds,
    shouldShowPurchaseOrderFields,
    setValue,
  ]);

  useEffect(() => {
    if (!shouldShowBankName) {
      setValue("bankName", "");
    }
  }, [shouldShowBankName, setValue]);

  useEffect(() => {
    if (
      estimateItem?.paymentTypeId !== undefined &&
      estimateItem?.paymentTypeId !== null
    ) {
      setValue("paymentTypeId", String(estimateItem.paymentTypeId));
    }

    if (estimateItem?.paymentTerms) {
      setValue("paymentTerms", estimateItem.paymentTerms);

      const selectedTenure = paymentTenureOptions.find(
        (item) => item.value === estimateItem.paymentTerms,
      );

      setValue(
        "paymentTermsDays",
        estimateItem?.paymentTermsDays ?? selectedTenure?.days ?? "",
      );
    }

    if (
      estimateItem?.governmentFeeActive !== undefined &&
      estimateItem?.governmentFeeActive !== null
    ) {
      setValue(
        "governmentFeeActive",
        Boolean(estimateItem.governmentFeeActive),
      );

      if (estimateItem?.governmentFee) {
        setValue(
          "governmentFee.totalAmount",
          estimateItem.governmentFee.totalAmount ?? "",
        );
        setValue(
          "governmentFee.paymentDate",
          estimateItem.governmentFee.paymentDate ?? "",
        );
        setValue(
          "governmentFee.feeReferenceNumber",
          estimateItem.governmentFee.feeReferenceNumber ?? "",
        );
        setValue(
          "governmentFee.departmentName",
          estimateItem.governmentFee.departmentName ?? "",
        );
        setValue(
          "governmentFee.remarks",
          estimateItem.governmentFee.remarks ?? "",
        );
      }
    }
  }, [estimateItem, setValue]);

  useEffect(() => {
    if (shouldShowPurchaseOrderFields) {
      setValue("paymentFlow", PAYMENT_FLOW.PURCHASE_ORDER);

      setValue("amount", "");
      setValue("paymentDate", "");
      setValue("paymentMode", "");
      setValue("bankLedgerId", "");
      setValue("transactionReference", "");
      setValue("paymentProof", "");
      setValue("governmentFeeActive", false);
      setValue("tdsActive", false);
      setValue("tds.tdsPercentage", "");
      return;
    }

    setValue("paymentFlow", PAYMENT_FLOW.REGULAR);
    setValue("poNumber", "");
    setValue("poAttachmentUrl", "");

    if (!shouldShowTds) {
      setValue("tdsActive", false);
      setValue("tds.tdsPercentage", "");
    }

    if (!shouldShowPaymentTenure) {
      setValue("paymentTerms", "");
      setValue("paymentTermsDays", "");
    }
  }, [
    shouldShowPurchaseOrderFields,
    shouldShowTds,
    shouldShowPaymentTenure,
    setValue,
  ]);

  const refreshEstimateList = () => {
    dispatch(
      getAllEstimateByUserId({
        userId,
        page: filteration.page,
        size: filteration.size,
        data: {
          search: filters.search || "",
          status: filters.status || "",
          fromDate: filters.fromDate || "",
          toDate: filters.toDate || "",
        },
      }),
    );

    dispatch(
      getTotalCountOfEstimate({
        userId,
        data: {
          search: filters.search || "",
          status: filters.status || "",
          fromDate: filters.fromDate || "",
          toDate: filters.toDate || "",
        },
      }),
    );
  };

  const submitHandler = async (values) => {
    try {
      if (shouldShowPaymentTenure && !values.paymentTerms) {
        addToast({
          title: "Payment tenure is required for Purchase Order Payment",
          color: "danger",
        });
        return;
      }

      const selectedTenure = paymentTenureOptions.find(
        (item) => item.value === values.paymentTerms,
      );

      const payload = shouldShowPurchaseOrderFields
        ? {
            estimateId: Number(estimateId),
            amount: 0,
            paymentTypeId: Number(values.paymentTypeId),
            paymentTerms: values.paymentTerms,
            paymentTermsDays: Number(
              selectedTenure?.days ?? values.paymentTermsDays ?? 0,
            ),
            poNumber: values.poNumber || "",
            poAttachmentUrl: values.poAttachmentUrl || "",
            remarks: values.remarks || "",
          }
        : {
            ...values,
            estimateId: Number(estimateId),

            // Send amount rounded to maximum two decimal places
            amount: toTwoDecimalAmount(values.amount),

            paymentTypeId: Number(values.paymentTypeId),
            paymentDate: values.paymentDate,
            paymentTerms: null,
            paymentTermsDays: null,
            poNumber: "",
            poAttachmentUrl: "",

            // TDS is not applicable for international units
            tdsActive: isInternationalUnit ? false : Boolean(values.tdsActive),

            tds:
              !isInternationalUnit && values.tdsActive
                ? {
                    tdsPercentage: toTwoDecimalAmount(
                      values.tds?.tdsPercentage || 0,
                    ),
                  }
                : null,

            governmentFeeActive: Boolean(values.governmentFeeActive),

            governmentFee: values.governmentFeeActive
              ? {
                  totalAmount: toTwoDecimalAmount(
                    values.governmentFee?.totalAmount,
                  ),
                  receivedAmount: toTwoDecimalAmount(
                    values.governmentFee?.totalAmount,
                  ),
                  paymentDate: values.governmentFee?.paymentDate || "",
                  feeReferenceNumber:
                    values.governmentFee?.feeReferenceNumber || "",
                  departmentName: values.governmentFee?.departmentName || "",
                  feeType: values.paymentMode || "",
                  remarks: values.governmentFee?.remarks || "",
                }
              : null,
          };

      const res = await onSubmitPayment({ userId, data: payload });

      if (res?.meta?.requestStatus === "fulfilled" || res?.ok === true) {
        addToast({
          title: "SUCCESS",
          description: "Payment registered successfully!",
          color: "success",
        });

        refreshEstimateList();
        reset();
        onClose?.();
      } else {
        addToast({
          title: "ERROR",
          description:
            res?.payload?.message ||
            res?.payload?.data?.message ||
            "Failed to register payment",
          color: "danger",
        });
      }
    } catch (e) {
      addToast({
        title: "ERROR",
        description:
          e?.response?.data?.message || e?.message || "Something went wrong!",
        color: "danger",
      });
    }
  };
  const hasRegisteredTds =
    estimatePaymentHistory?.tdsPercentage !== undefined &&
    estimatePaymentHistory?.tdsPercentage !== null &&
    estimatePaymentHistory?.tdsPercentage !== "" &&
    Number(estimatePaymentHistory?.tdsPercentage) > 0;

  return (
    <Modal
      size="4xl"
      isDismissable={false}
      isKeyboardDismissDisabled={true}
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      placement="top-center"
    >
      <ModalContent>
        {(close) => (
          <>
            <ModalHeader className="flex items-center justify-between">
              <span>Payment Register</span>
            </ModalHeader>

            <ModalBody className="max-h-[60vh] overflow-auto">
              {estimatePaymentHistory && (
                <div className="mb-4 rounded-xl border bg-gray-50 p-4">
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    <div>
                      <p className="text-xs text-gray-500">Total Amount</p>
                      <p className="font-semibold">
                        ₹ {estimatePaymentHistory.totalAmount ?? 0}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-gray-500">Received</p>
                      <p className="font-semibold text-green-600">
                        ₹ {estimatePaymentHistory.receivedAmount ?? 0}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-gray-500">Outstanding</p>
                      <p className="font-semibold text-red-600">
                        ₹ {estimatePaymentHistory.outstandingAmount ?? 0}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-gray-500">Payments</p>
                      <p className="font-semibold">
                        {estimatePaymentHistory.totalPaymentReceipts ?? 0}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">TDS (%)</p>
                      <p className="font-semibold">
                        {estimatePaymentHistory.tdsPercentage ?? "NA"}
                      </p>
                    </div>
                  </div>
                </div>
              )}
              {Array.isArray(estimatePaymentHistory?.paymentHistory) &&
                estimatePaymentHistory.paymentHistory.length > 0 && (
                  <div className="mb-4 rounded-xl border p-4">
                    <h3 className="mb-3 text-sm font-semibold">
                      Payment History
                    </h3>

                    <div className="space-y-2">
                      {estimatePaymentHistory.paymentHistory.map((payment) => (
                        <div
                          key={payment.paymentReceiptId}
                          className="flex items-center justify-between rounded-lg border px-3 py-2 text-sm"
                        >
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-semibold">
                              ₹ {Number(payment.amount ?? 0).toFixed(2)}
                            </span>
                            <span className="text-gray-500">|</span>
                            <span>{payment.paymentDate || "-"}</span>
                            <span className="text-gray-500">|</span>
                            <span>{payment.paymentMode || "-"}</span>
                          </div>

                          <span
                            className={`rounded-full px-2 py-1 text-xs font-medium ${
                              payment.status === "APPROVED"
                                ? "bg-green-100 text-green-700"
                                : payment.status === "PENDING"
                                  ? "bg-yellow-100 text-yellow-700"
                                  : "bg-red-100 text-red-700"
                            }`}
                          >
                            {payment.status || "UNKNOWN"}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              {/* {estimatePaymentHistory &&
                (!Array.isArray(estimatePaymentHistory.paymentHistory) ||
                  estimatePaymentHistory.paymentHistory.length === 0) && (
                  <div className="mb-4 rounded-xl border p-4 text-sm text-gray-500">
                    No previous payment history found.
                  </div>
                )} */}
              <form
                id="payment-register-form"
                onSubmit={handleSubmit(submitHandler, (formErrors) => {
                  console.log("Form validation errors:", formErrors);

                  addToast({
                    title: "Please check required fields",
                    color: "danger",
                  });
                })}
                className="space-y-4"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {/* COMMON FIELD: Payment Type */}
                  <Controller
                    name="paymentTypeId"
                    control={control}
                    render={({ field, fieldState: { error } }) => (
                      <NewSelect
                        isRequired
                        label="Payment Type"
                        data={availablePaymentTypeList}
                        labelKey="name"
                        valueKey="id"
                        value={field.value ?? ""}
                        onChange={(value) => {
                          field.onChange(value);

                          const nextPaymentType = availablePaymentTypeList.find(
                            (item) => String(item?.id) === String(value),
                          );

                          const nextPaymentTypeName = String(
                            nextPaymentType?.name || "",
                          )
                            .trim()
                            .toLowerCase();

                          const isPurchaseOrder =
                            nextPaymentTypeName.includes("purchase") &&
                            nextPaymentTypeName.includes("order");

                          setValue(
                            "paymentFlow",
                            isPurchaseOrder
                              ? PAYMENT_FLOW.PURCHASE_ORDER
                              : PAYMENT_FLOW.REGULAR,
                          );
                        }}
                      />
                    )}
                  />

                  {/* PURCHASE ORDER FIELDS ONLY */}
                  {shouldShowPurchaseOrderFields && (
                    <>
                      <Controller
                        name="paymentTerms"
                        control={control}
                        render={({ field, fieldState: { error } }) => (
                          <Select
                            label="Payment Tenure"
                            placeholder="Select payment tenure"
                            isRequired
                            selectedKeys={
                              field.value ? new Set([field.value]) : new Set([])
                            }
                            onSelectionChange={(keys) => {
                              const selectedValue = Array.from(keys)?.[0] || "";
                              const selectedTenure = paymentTenureOptions.find(
                                (item) => item.value === selectedValue,
                              );

                              field.onChange(selectedValue);
                              setValue(
                                "paymentTermsDays",
                                selectedTenure?.days ?? "",
                              );
                            }}
                            isInvalid={!!error}
                            errorMessage={error?.message}
                          >
                            {paymentTenureOptions.map((item) => (
                              <SelectItem key={item.value}>
                                {item.label}
                              </SelectItem>
                            ))}
                          </Select>
                        )}
                      />

                      <Controller
                        name="poNumber"
                        control={control}
                        render={({ field, fieldState: { error } }) => (
                          <Input
                            {...field}
                            label="PO Number"
                            placeholder="Enter PO number"
                            isRequired
                            isInvalid={!!error}
                            errorMessage={error?.message}
                          />
                        )}
                      />

                      <Controller
                        name="poAttachmentUrl"
                        control={control}
                        render={({ field, fieldState: { error } }) => (
                          <div>
                            <SingleFileUploader
                              label="PO Attachment"
                              value={field.value}
                              onChange={(value) => {
                                field.onChange(value);
                              }}
                              isRequired={true}
                              isInvalid={!!error}
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
                    </>
                  )}

                  {/* NORMAL PAYMENT FIELDS ONLY */}
                  {shouldShowRegularPaymentFields && (
                    <>
                      {shouldShowTds && (
                        <>
                          <Controller
                            name="tdsActive"
                            control={control}
                            render={({ field }) => (
                              <Select
                                label="TDS"
                                isDisabled={hasRegisteredTds}
                                selectedKeys={
                                  new Set([field.value ? "true" : "false"])
                                }
                                onSelectionChange={(keys) => {
                                  const selectedValue = Array.from(keys)?.[0];
                                  field.onChange(selectedValue === "true");
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
                              render={({ field, fieldState: { error } }) => (
                                <Select
                                  label="TDS Percentage"
                                  isRequired
                                  isDisabled={hasRegisteredTds}
                                  selectedKeys={
                                    field.value !== undefined &&
                                    field.value !== null &&
                                    field.value !== ""
                                      ? new Set([String(field.value)])
                                      : new Set([])
                                  }
                                  onSelectionChange={(keys) => {
                                    const selectedValue =
                                      Array.from(keys)?.[0] || "";
                                    field.onChange(selectedValue);
                                  }}
                                >
                                  <SelectItem key="10">10%</SelectItem>
                                  <SelectItem key="2">2%</SelectItem>
                                </Select>
                              )}
                            />
                          )}
                        </>
                      )}

                      <Controller
                        name="amount"
                        control={control}
                        render={({ field, fieldState: { error } }) => (
                          <Input
                            {...field}
                            type="number"
                            min={0}
                            step="0.01"
                            inputMode="decimal"
                            label="Received Amount"
                            placeholder="Enter amount"
                            isRequired
                            onKeyDown={preventNegativeNumberInput}
                            isInvalid={!!error}
                            errorMessage={error?.message}
                            onChange={(e) => {
                              const value = e.target.value;

                              if (value === "") {
                                field.onChange("");
                                return;
                              }

                              // Allow maximum two decimal places
                              if (!/^\d*(\.\d{0,2})?$/.test(value)) {
                                return;
                              }

                              if (Number(value) < 0) {
                                field.onChange("0");
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
                        render={({ field, fieldState: { error } }) => (
                          <DatePicker
                            isRequired
                            label="Payment Date"
                            showMonthAndYearPickers
                            maxValue={today(getLocalTimeZone())}
                            isInvalid={!!error}
                            errorMessage={error?.message}
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
                        name="paymentMode"
                        control={control}
                        render={({ field, fieldState: { error } }) => (
                          <Select
                            selectedKeys={
                              field.value ? new Set([field.value]) : new Set([])
                            }
                            onSelectionChange={(keys) =>
                              field.onChange(Array.from(keys)?.[0] || "")
                            }
                            label="Payment Mode"
                            isRequired
                            isInvalid={!!error}
                            errorMessage={error?.message}
                          >
                            <SelectItem key="CASH">Cash</SelectItem>
                            <SelectItem key="UPI">UPI</SelectItem>
                            <SelectItem key="CARD">Card</SelectItem>
                            <SelectItem key="BANK_TRANSFER">
                              Bank Transfer
                            </SelectItem>
                            <SelectItem key="CHEQUE">Cheque</SelectItem>
                          </Select>
                        )}
                      />

                      <Controller
                        name="bankLedgerId"
                        control={control}
                        render={({ field, fieldState: { error } }) => (
                          <NewSelect
                            isRequired
                            label="Select Bank/Cash"
                            data={filteredPaymentLedgerList}
                            labelKey="ledgerName"
                            valueKey="id"
                            value={field.value ?? ""}
                            onChange={(value) => {
                              field.onChange(value);
                            }}
                          />
                        )}
                      />

                      <Controller
                        name="transactionReference"
                        control={control}
                        render={({ field, fieldState: { error } }) => (
                          <Input
                            {...field}
                            label="Transaction Reference Number / UTR Number"
                            placeholder="Enter number"
                            isRequired
                            isInvalid={!!error}
                            errorMessage={error?.message}
                          />
                        )}
                      />

                      <Controller
                        name="paymentProof"
                        control={control}
                        render={({ field, fieldState: { error } }) => (
                          <div>
                            <SingleFileUploader
                              label="Payment Proof"
                              value={field.value}
                              onChange={(value) => {
                                field.onChange(value || "");
                              }}
                              isRequired={true}
                              isInvalid={!!error}
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
                        name="governmentFeeActive"
                        control={control}
                        render={({ field }) => (
                          <Select
                            label="Government Fee Active"
                            isDisabled={
                              estimateItem?.governmentFeeActive === false ||
                              estimateItem?.governmentFeeActive === true
                            }
                            selectedKeys={
                              new Set([field.value ? "true" : "false"])
                            }
                            onSelectionChange={(keys) => {
                              const selectedValue = Array.from(keys)?.[0];
                              field.onChange(selectedValue === "true");
                            }}
                          >
                            <SelectItem key="true">Yes</SelectItem>
                            <SelectItem key="false">No</SelectItem>
                          </Select>
                        )}
                      />
                    </>
                  )}

                  {/* COMMON FIELD: Remarks */}
                  <Controller
                    name="remarks"
                    control={control}
                    render={({ field }) => (
                      <Textarea
                        {...field}
                        label="Remarks"
                        placeholder="Any remarks..."
                        minRows={3}
                        className="md:col-span-2"
                      />
                    )}
                  />
                </div>

                {/* GOVERNMENT FEE DETAILS: NORMAL PAYMENT ONLY */}
                {shouldShowRegularPaymentFields && governmentFeeActive && (
                  <div className="mt-4 border rounded-xl p-4 space-y-4">
                    <h3 className="text-sm font-semibold">
                      Government Fee Details
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <Controller
                        name="governmentFee.totalAmount"
                        control={control}
                        render={({ field, fieldState: { error } }) => (
                          <Input
                            {...field}
                            type="number"
                            min={0}
                            step="0.01"
                            inputMode="decimal"
                            label="Total Amount"
                            placeholder="Enter total amount"
                            isRequired
                            onKeyDown={preventNegativeNumberInput}
                            isInvalid={!!error}
                            errorMessage={error?.message}
                            onChange={(e) => {
                              const value = e.target.value;

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
                        name="governmentFee.paymentDate"
                        control={control}
                        render={({ field, fieldState: { error } }) => (
                          <DatePicker
                            isRequired
                            label="Government Fee Payment Date"
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
                        name="governmentFee.feeReferenceNumber"
                        control={control}
                        render={({ field, fieldState: { error } }) => (
                          <Input
                            {...field}
                            label="Fee Reference Number"
                            placeholder="Enter fee reference number"
                            isRequired
                            isInvalid={!!error}
                            errorMessage={error?.message}
                          />
                        )}
                      />

                      <Controller
                        name="governmentFee.departmentName"
                        control={control}
                        render={({ field, fieldState: { error } }) => (
                          <Input
                            {...field}
                            label="Department Name"
                            placeholder="Enter department name"
                            isRequired
                            isInvalid={!!error}
                            errorMessage={error?.message}
                          />
                        )}
                      />

                      <Controller
                        name="governmentFee.remarks"
                        control={control}
                        render={({ field }) => (
                          <Textarea
                            {...field}
                            label="Government Fee Remarks"
                            placeholder="Enter remarks"
                            minRows={3}
                            className="md:col-span-2"
                          />
                        )}
                      />
                    </div>
                  </div>
                )}
              </form>
            </ModalBody>

            <ModalFooter className="flex justify-end gap-2">
              {shouldShowRegularPaymentFields && <BaseAmountCalculator />}

              <Button
                type="button"
                variant="flat"
                className="cursor-pointer"
                onPress={() => {
                  reset();
                  close();
                  onClose?.();
                }}
              >
                Cancel
              </Button>

              <Button
                type="submit"
                form="payment-register-form"
                color="primary"
                isLoading={isSubmitting}
                className="cursor-pointer"
              >
                Save
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};

export default memo(EstimatePaymentRegister);
