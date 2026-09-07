import {
  Button,
  DatePicker,
  Form,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Select,
  SelectItem,
  Textarea,
} from "@heroui/react";
import { Controller } from "react-hook-form";
import { IndianRupee } from "lucide-react";
import dayjs from "dayjs";
import {
  getLocalTimeZone,
  parseDate,
  today,
  toCalendarDate,
} from "@internationalized/date";
import SingleFileUploader from "../../components/SingleFileUploader";

const EMPTY_EXPENSE = {
  expenseCategory: "",
  amount: "",
  remark: "",
  expenseDate: "",
  attachmentUrl: "",
  externalReference: "",
  currencyCode: "INR",
};

const AddExpenseModal = ({
  isOpen,
  onOpenChange,
  control,
  errors,
  isSubmitting,
  handleSubmit,
  onValidSubmit,
  resetForm,
}) => {
  return (
    <Modal
      size="2xl"
      isOpen={isOpen}
      onOpenChange={(open) => {
        onOpenChange(open);

        if (!open && !isSubmitting) {
          resetForm(EMPTY_EXPENSE);
        }
      }}
      isDismissable={!isSubmitting}
      hideCloseButton={isSubmitting}
    >
      <ModalContent>
        {(onClose) => (
          <Form className="w-full" onSubmit={handleSubmit(onValidSubmit)}>
            <ModalHeader>Add Expense</ModalHeader>

            <ModalBody className="grid w-full grid-cols-1 gap-4 md:grid-cols-2">
              <Controller
                name="expenseCategory"
                control={control}
                render={({ field }) => (
                  <Select
                    label="Expense Category"
                    isRequired
                    selectedKeys={
                      field.value ? new Set([field.value]) : new Set()
                    }
                    onSelectionChange={(keys) => {
                      field.onChange(Array.from(keys)[0] || "");
                    }}
                    isInvalid={!!errors.expenseCategory}
                    errorMessage={errors.expenseCategory?.message}
                  >
                    <SelectItem key="GOVERNMENT_FEE">
                      Government Fee
                    </SelectItem>
                    <SelectItem key="PORTAL_FEE">Portal Fee</SelectItem>
                    <SelectItem key="PROFESSIONAL_FEE">
                      Profesional Fee
                    </SelectItem>
                    <SelectItem key="CONSULTANT_FEE">
                      Consultant Fee
                    </SelectItem>
                    <SelectItem key="TRAVEL">Travel Fee</SelectItem>
                    <SelectItem key="COURIER">Courier Fee</SelectItem>
                    <SelectItem key="PRINTING">Printing Fee</SelectItem>
                    <SelectItem key="INSPECTION_FEE">
                      Inspection Fee
                    </SelectItem>
                    <SelectItem key="TESTING_FEE">Testing Fee</SelectItem>
                    <SelectItem key="OTHER">Other Fee</SelectItem>
                  </Select>
                )}
              />

              <Controller
                name="amount"
                control={control}
                render={({ field }) => (
                  <Input
                    label="Amount"
                    type="number"
                    inputMode="decimal"
                    min="0.01"
                    step="0.01"
                    isRequired
                    startContent={<IndianRupee className="h-4 w-4" />}
                    value={field.value?.toString() || ""}
                    onValueChange={field.onChange}
                    isInvalid={!!errors.amount}
                    errorMessage={errors.amount?.message}
                  />
                )}
              />

              <Controller
                name="currencyCode"
                control={control}
                render={({ field }) => (
                  <Select
                    label="Currency"
                    isRequired
                    selectedKeys={
                      field.value ? new Set([field.value]) : new Set()
                    }
                    onSelectionChange={(keys) => {
                      field.onChange(Array.from(keys)[0] || "");
                    }}
                    isInvalid={!!errors.currencyCode}
                    errorMessage={errors.currencyCode?.message}
                  >
                    <SelectItem key="INR">INR - Indian Rupee</SelectItem>
                    <SelectItem key="USD">USD - US Dollar</SelectItem>
                    <SelectItem key="EUR">EUR - Euro</SelectItem>
                    <SelectItem key="AED">AED - UAE Dirham</SelectItem>
                  </Select>
                )}
              />

              <Controller
                name="expenseDate"
                control={control}
                render={({ field }) => (
                  <DatePicker
                    label="Expense Date"
                    showMonthAndYearPickers
                    isRequired
                    value={
                      field.value
                        ? parseDate(dayjs(field.value).format("YYYY-MM-DD"))
                        : null
                    }
                    maxValue={today(getLocalTimeZone())}
                    onChange={(date) => {
                      if (!date) {
                        field.onChange("");
                        return;
                      }

                      const selectedDate = toCalendarDate(date).toString();

                      const isoDate = dayjs(selectedDate)
                        .hour(dayjs().hour())
                        .minute(dayjs().minute())
                        .second(dayjs().second())
                        .millisecond(dayjs().millisecond())
                        .toISOString();

                      field.onChange(isoDate);
                    }}
                    isInvalid={!!errors.expenseDate}
                    errorMessage={errors.expenseDate?.message}
                  />
                )}
              />

              <Controller
                name="externalReference"
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    label="External Reference"
                    placeholder="Enter transaction or receipt reference"
                    value={field.value || ""}
                    isInvalid={!!errors.externalReference}
                    errorMessage={errors.externalReference?.message}
                  />
                )}
              />

              <Controller
                name="attachmentUrl"
                control={control}
                render={({ field }) => (
                  <div className="md:col-span-2">
                    <SingleFileUploader
                      label="Expense Proof"
                      value={field.value}
                      onChange={(value) => {
                        field.onChange(value || "");
                      }}
                      isRequired
                      isInvalid={!!errors.attachmentUrl}
                      errorMessage={errors.attachmentUrl?.message}
                    />
                  </div>
                )}
              />

              <Controller
                name="remark"
                control={control}
                render={({ field }) => (
                  <Textarea
                    {...field}
                    label="Remark"
                    placeholder="Enter expense details"
                    isRequired
                    className="md:col-span-2"
                    value={field.value || ""}
                    onValueChange={field.onChange}
                    isInvalid={!!errors.remark}
                    errorMessage={errors.remark?.message}
                  />
                )}
              />
            </ModalBody>

            <ModalFooter className="flex w-full justify-end gap-2">
              <Button
                type="button"
                variant="flat"
                isDisabled={isSubmitting}
                onPress={onClose}
              >
                Close
              </Button>

              <Button
                color="primary"
                type="submit"
                isLoading={isSubmitting}
                isDisabled={isSubmitting}
              >
                {isSubmitting ? "Submitting..." : "Submit"}
              </Button>
            </ModalFooter>
          </Form>
        )}
      </ModalContent>
    </Modal>
  );
};

export default AddExpenseModal;
