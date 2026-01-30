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
import {
  getLocalTimeZone,
  toCalendarDate,
  today,
  parseDate,
} from "@internationalized/date";
import SingleFileUploader from "../../components/SingleFileUploader";
import { useParams } from "react-router-dom";
import NewSelect from "../../components/NewSelect";
import { useDispatch, useSelector } from "react-redux";
import { getAllPaymentType } from "../../toolkit/slices/settingSlice";

const numberLike = (label) =>
  z
    .union([z.number(), z.string().min(1, `${label} is required`)])
    .transform((v) => (typeof v === "string" ? Number(v) : v))
    .refine((v) => !Number.isNaN(v), `${label} must be a valid number`);

const paymentRegisterSchema = z.object({
  amount: numberLike("Amount").refine(
    (v) => v > 0,
    "Amount must be greater than 0",
  ),
  paymentDate: z.string().min(1, "Payment date is required"),
  paymentMode: z.string().min(1, "Payment mode is required"),
  transactionReference: z.string().optional(),
  remarks: z.string().optional(),

  paymentTypeId: numberLike("Payment type").refine(
    (v) => v > 0,
    "Payment type is required",
  ),
  eprFinancialYear: z.string().optional(),
  eprPortalRegistrationNumber: z.string().optional(),
  eprCertificateOrInvoiceNumber: z.string().optional(),
});

const EstimatePaymentRegister = ({
  isOpen,
  onOpenChange,
  onClose,
  estimateId,
  onSubmitPayment,
  paymentTypes = [],
}) => {
  const { userId } = useParams();
  const dispatch = useDispatch();
  const paymentTypeList = useSelector((state) => state.setting.paymentTypeList);

  useEffect(() => {
    dispatch(getAllPaymentType());
  }, [dispatch]);

  const {
    control,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(paymentRegisterSchema),
    defaultValues: {
      amount: "",
      paymentDate: "",
      paymentMode: "",
      transactionReference: "",
      remarks: "",
      paymentTypeId: "",
      eprFinancialYear: "",
      eprPortalRegistrationNumber: "",
      eprCertificateOrInvoiceNumber: "",
    },
  });

  const submitHandler = async (values) => {
    try {
      const payload = {
        ...values,
        estimateId: Number(estimateId),
        amount: Number(values.amount),
        paymentTypeId: Number(values.paymentTypeId),
        paymentDate: values.paymentDate,
      };
      const res = await onSubmitPayment({ userId, data: payload });
      if (res?.meta?.requestStatus === "fulfilled" || res?.ok === true) {
        addToast({
          title: "Payment registered successfully!",
          color: "success",
        });
        onClose?.();
      } else {
        addToast({
          title: res?.payload?.data?.message || "Failed to register payment",
          color: "danger",
        });
      }
    } catch (e) {
      addToast({ title: "Something went wrong!", color: "danger" });
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

            <ModalBody className="max-h-[70vh] overflow-auto">
              <form
                id="payment-register-form"
                onSubmit={handleSubmit(submitHandler)}
                className="space-y-4"
              >
                {/* Row 1 */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <Controller
                    name="amount"
                    control={control}
                    render={({ field }) => (
                      <Input
                        {...field}
                        type="number"
                        label="Amount"
                        placeholder="Enter amount"
                        isRequired
                        isInvalid={!!errors.amount}
                        errorMessage={errors.amount?.message}
                      />
                    )}
                  />

                  <Controller
                    name="paymentDate"
                    control={control}
                    render={({ field, fieldState: { error } }) => (
                      <DatePicker
                        isRequired
                        label="Order date"
                        showMonthAndYearPickers
                        maxValue={today(getLocalTimeZone())}
                        errorMessage={error?.message}
                        isInvalid={!!error}
                        value={field.value ? parseDate(field.value) : null}
                        onChange={(e) =>
                          field.onChange(toCalendarDate(e).toString())
                        }
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
                        isInvalid={!!errors.paymentMode}
                        errorMessage={errors.paymentMode?.message}
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
                    name="paymentTypeId"
                    control={control}
                    render={({ field, fieldState: { error } }) => (
                      <NewSelect
                        isRequired
                        label="Company structure"
                        errorMessage={error?.message}
                        isInvalid={!!error}
                        data={paymentTypeList || []}
                        labelKey="name"
                        valueKey="id"
                        value={field.value}
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
                      <SingleFileUploader
                        label="Payment document"
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
                    name="eprFinancialYear"
                    control={control}
                    render={({ field }) => (
                      <Input
                        {...field}
                        label="EPR Financial Year"
                        placeholder="e.g. 2025-26"
                      />
                    )}
                  />

                  <Controller
                    name="eprPortalRegistrationNumber"
                    control={control}
                    render={({ field }) => (
                      <Input
                        {...field}
                        label="EPR Portal Registration No."
                        placeholder="Enter number"
                      />
                    )}
                  />
                  <Controller
                    name="eprCertificateOrInvoiceNumber"
                    control={control}
                    render={({ field }) => (
                      <Input
                        {...field}
                        label="EPR Certificate/Invoice No."
                        placeholder="Enter number"
                      />
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
              </form>
            </ModalBody>

            <ModalFooter className="flex justify-end gap-2">
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
