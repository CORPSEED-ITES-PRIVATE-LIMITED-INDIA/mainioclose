import React, { memo, useEffect } from "react";
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
import { getActivePaymentLedgerForPaymentRegister } from "../../toolkit/slices/accountSlice";

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

const paymentRegisterSchema = z
  .object({
    amount: numberLike("Amount").refine(
      (v) => v >= 0,
      "Amount must be 0 or greater",
    ),
    paymentDate: z.string().min(1, "Payment date is required"),
    paymentMode: z.string().min(1, "Payment mode is required"),
    transactionReference: z.string().optional(),
    paymentProof: z.string().optional(),
    remarks: z.string().optional(),
    bankLedgerId: z.string().optional(),

    paymentTypeId: numberLike("Payment type").refine(
      (v) => v > 0,
      "Payment type is required",
    ),

    paymentTerms: z.string().optional(),
    paymentTermsDays: z.union([z.number(), z.string()]).optional(),

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
  })
  .superRefine((data, ctx) => {
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

    // if (
    //   bankRequiredPaymentModes.includes(data.paymentMode) &&
    //   !data.bankName?.trim()
    // ) {
    //   ctx.addIssue({
    //     code: z.ZodIssueCode.custom,
    //     path: ["bankName"],
    //     message: "Bank name is required",
    //   });
    // }
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
      amount: "",
      paymentDate: "",
      paymentMode: "",
      transactionReference: "",
      paymentProof: "",
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
        // receivedAmount: "",
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

  const isCashPaymentMode = String(paymentMode || "")
    .toLowerCase()
    .includes("cash");

  const filteredPaymentLedgerList = isCashPaymentMode
    ? (paymentLegerList || []).filter((ledger) =>
        String(ledger?.ledgerName || "")
          .toLowerCase()
          .includes("cash"),
      )
    : paymentLegerList || [];

  const shouldShowBankName = bankRequiredPaymentModes.includes(paymentMode);

  const selectedPaymentType = (paymentTypeList || []).find(
    (item) => String(item?.id) === String(selectedPaymentTypeId),
  );

  const selectedPaymentTypeName = selectedPaymentType?.name || "";

  const shouldShowTds =
    selectedPaymentTypeName === "Full Payment" ||
    selectedPaymentTypeName === "Purchase Order Payment";

  const shouldShowPaymentTenure =
    selectedPaymentTypeName === "Purchase Order Payment";

  useEffect(() => {
    dispatch(getActivePaymentLedgerForPaymentRegister());
  }, []);

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
    if (!shouldShowTds) {
      setValue("tdsActive", false);
      setValue("tds.tdsPercentage", "");
    }

    if (!tdsActive) {
      setValue("tds.tdsPercentage", "");
    }

    if (!shouldShowPaymentTenure) {
      setValue("paymentTerms", "");
      setValue("paymentTermsDays", "");
    }
  }, [shouldShowTds, shouldShowPaymentTenure, tdsActive, setValue]);

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

      const payload = {
        ...values,
        estimateId: Number(estimateId),
        amount: Number(values.amount),
        paymentTypeId: Number(values.paymentTypeId),
        paymentDate: values.paymentDate,
        paymentTerms: shouldShowPaymentTenure ? values.paymentTerms : null,
        paymentTermsDays: shouldShowPaymentTenure
          ? Number(selectedTenure?.days ?? values.paymentTermsDays ?? 0)
          : null,

        tdsActive: Boolean(values.tdsActive),
        tds: values.tdsActive
          ? {
              tdsPercentage: Number(values.tds?.tdsPercentage || 0),
            }
          : null,

        governmentFeeActive: values.governmentFeeActive,
        governmentFee: values.governmentFeeActive
          ? {
              totalAmount: Number(values.governmentFee?.totalAmount || 0),
              receivedAmount: Number(values.governmentFee?.totalAmount || 0),
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
        onClose?.();
      } else {
        addToast({
          title: "ERROR",
          description: res?.payload?.message || "Failed to register payment",
          color: "danger",
        });
      }
    } catch (e) {
      addToast({
        title: "ERROR",
        description: "Something went wrong !",
        color: "danger",
      });
    }
  };

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
                  <Controller
                    name="paymentTypeId"
                    control={control}
                    render={({ field, fieldState: { error } }) => (
                      <NewSelect
                        isRequired
                        isDisabled={estimateItem?.paymentTypeId ? true : false}
                        label="Payment term"
                        // errorMessage={error?.message}
                        // isInvalid={!!error}
                        data={paymentTypeList || []}
                        labelKey="name"
                        valueKey="id"
                        value={field.value ?? ""}
                        onChange={(value) => {
                          field.onChange(value);
                        }}
                      />
                    )}
                  />

                  {shouldShowPaymentTenure && (
                    <Controller
                      name="paymentTerms"
                      control={control}
                      render={({ field }) => (
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
                        >
                          {paymentTenureOptions.map((item) => (
                            <SelectItem key={item.value}>
                              {item.label}
                            </SelectItem>
                          ))}
                        </Select>
                      )}
                    />
                  )}

                  {shouldShowTds && (
                    <>
                      <Controller
                        name="tdsActive"
                        control={control}
                        render={({ field }) => (
                          <Select
                            label="TDS"
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
                              isInvalid={!!error}
                              errorMessage={error?.message}
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
                    render={({ field }) => (
                      <Input
                        {...field}
                        type="number"
                        min={0}
                        label="Received Amount"
                        placeholder="Enter amount"
                        isRequired
                        onKeyDown={preventNegativeNumberInput}
                        onChange={(e) => {
                          const value = e.target.value;

                          if (value === "") {
                            field.onChange("");
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
                        label="Payment date"
                        showMonthAndYearPickers
                        maxValue={today(getLocalTimeZone())}
                        // errorMessage={error?.message}
                        // isInvalid={!!error}
                        value={
                          field.value && /^\d{4}-\d{2}-\d{2}$/.test(field.value)
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
                    render={({ field }) => (
                      <Select
                        selectedKeys={
                          field.value ? new Set([field.value]) : new Set([])
                        }
                        onSelectionChange={(keys) =>
                          field.onChange(Array.from(keys)?.[0] || "")
                        }
                        label="Payment Mode"
                        isRequired
                        // isInvalid={!!errors.paymentMode}
                        // errorMessage={errors.paymentMode?.message}
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
                        // errorMessage={error?.message}
                        // isInvalid={!!error}
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
                        label="Transaction Reference Number / UTR number"
                        placeholder="Enter number"
                      />
                    )}
                  />

                  <Controller
                    name="paymentProof"
                    control={control}
                    render={({ field, fieldState: { error } }) => (
                      <SingleFileUploader
                        // isRequired={true}
                        // errorMessage={"please attach the reference document"}
                        label="Payment proof"
                        value={field.value}
                        onChange={(value) => {
                          field.onChange(value);
                        }}
                        // errorMessage={error?.message}
                        // isInvalid={!!error}
                      />
                    )}
                  />

                  {/* <Controller
                    name="eprFinancialYear"
                    control={control}
                    render={({ field }) => (
                      <Input
                        {...field}
                        label="EPR Financial Year"
                        placeholder="e.g. 2025-26"
                      />
                    )}
                  /> */}

                  {/* <Controller
                    name="eprPortalRegistrationNumber"
                    control={control}
                    render={({ field }) => (
                      <Input
                        {...field}
                        label="EPR Portal Registration No."
                        placeholder="Enter number"
                      />
                    )}
                  /> */}

                  {/* <Controller
                    name="eprCertificateOrInvoiceNumber"
                    control={control}
                    render={({ field }) => (
                      <Input
                        {...field}
                        label="EPR Certificate/Invoice No."
                        placeholder="Enter number"
                      />
                    )}
                  /> */}

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
                        selectedKeys={new Set([field.value ? "true" : "false"])}
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

                  <Controller
                    name="remarks"
                    control={control}
                    render={({ field }) => (
                      <Textarea
                        {...field}
                        label="Remarks"
                        placeholder="Any remarks..."
                        minRows={3}
                      />
                    )}
                  />
                </div>

                {governmentFeeActive && (
                  <div className="mt-4 border rounded-xl p-4 space-y-4">
                    <h3 className="text-sm font-semibold">
                      Government Fee Details
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <Controller
                        name="governmentFee.totalAmount"
                        control={control}
                        render={({ field }) => (
                          <Input
                            {...field}
                            type="number"
                            min={0}
                            label="Total Amount"
                            placeholder="Enter total amount"
                            isRequired
                            onKeyDown={preventNegativeNumberInput}
                            onChange={(e) => {
                              const value = e.target.value;

                              if (value === "") {
                                field.onChange("");
                                return;
                              }

                              if (Number(value) < 0) {
                                field.onChange("0");
                                return;
                              }

                              field.onChange(value);
                            }}
                            // isInvalid={!!errors.governmentFee?.totalAmount}
                            // errorMessage={
                            //   errors.governmentFee?.totalAmount?.message
                            // }
                          />
                        )}
                      />

                      {/* <Controller
                        name="governmentFee.receivedAmount"
                        control={control}
                        render={({ field }) => (
                          <Input
                            {...field}
                            type="number"
                            label="Received Amount"
                            placeholder="Enter received amount"
                            isRequired
                            isInvalid={!!errors.governmentFee?.receivedAmount}
                            errorMessage={
                              errors.governmentFee?.receivedAmount?.message
                            }
                          />
                        )}
                      /> */}

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
                        render={({ field }) => (
                          <Input
                            {...field}
                            label="Fee Reference Number"
                            placeholder="Enter fee reference number"
                            isRequired
                            isInvalid={
                              !!errors.governmentFee?.feeReferenceNumber
                            }
                            errorMessage={
                              errors.governmentFee?.feeReferenceNumber?.message
                            }
                          />
                        )}
                      />

                      <Controller
                        name="governmentFee.departmentName"
                        control={control}
                        render={({ field }) => (
                          <Input
                            {...field}
                            label="Department Name"
                            placeholder="Enter department name"
                            isRequired
                            isInvalid={!!errors.governmentFee?.departmentName}
                            errorMessage={
                              errors.governmentFee?.departmentName?.message
                            }
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
                          />
                        )}
                      />
                    </div>
                  </div>
                )}
              </form>
            </ModalBody>

            <ModalFooter className="flex justify-end gap-2">
              <BaseAmountCalculator />

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
