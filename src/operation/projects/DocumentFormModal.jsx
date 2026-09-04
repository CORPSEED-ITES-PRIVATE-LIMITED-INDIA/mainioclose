import {
  Button,
  Checkbox,
  Chip,
  DatePicker,
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
import { getLocalTimeZone, parseDate, today } from "@internationalized/date";
import FileUploader from "../../components/FileUploader";
import { PdfIcon } from "./ProjectDetailIcons";

const DEFAULT_DOCUMENT_FORM_VALUES = {
  fileUrl: "",
  fileName: "",
  fileSizeKb: 0,
  fileFormat: "",
  expiryDate: null,
  remarks: "",
  isFromCompanyDoc: false,
  isPermanent: true,
};

// "Upload document" / "Replace document" modal opened from the Documents
// drawer's checklist — also runs the auto expiry-date detection on upload.
const DocumentFormModal = ({
  isOpen,
  docModal,
  selectedDoc,
  setSelectedDoc,
  setIsPermanent,
  isPermanentValue,
  setExpiryCheckResult,
  isCheckingExpiry,
  setIsCheckingExpiry,
  expiryCheckResult,
  control,
  errors,
  setValue,
  reset,
  handleSubmit,
  onValidSubmit,
  onCheckDocumentExpiry,
  getFileFormatFromMeta,
}) => {
  return (
    <Modal
      size="4xl"
      isOpen={isOpen}
      onOpenChange={(open) => {
        docModal.onOpenChange(open);

        if (!open) {
          setSelectedDoc(null);
          setIsPermanent(true);
          setExpiryCheckResult(null);
          setIsCheckingExpiry(false);

          reset(DEFAULT_DOCUMENT_FORM_VALUES);
        }
      }}
      placement="center"
      scrollBehavior="inside"
      classNames={{
        base: "max-h-[88vh]",
      }}
    >
      <ModalContent>
        {(onClose) => (
          <form
            onSubmit={handleSubmit(onValidSubmit)}
            className="flex max-h-[88vh] flex-col"
          >
            <ModalHeader className="flex shrink-0 flex-col gap-1 border-b border-default-200">
              {selectedDoc?.isReplace ? "Replace document" : "Upload document"}
              {selectedDoc?.documentName ? (
                <span className="text-xs text-default-400">
                  For: {selectedDoc.documentName}
                </span>
              ) : null}
            </ModalHeader>

            <ModalBody className="flex-1 overflow-y-auto px-6 py-4">
              <div className="grid grid-cols-2 gap-2.5">
                {selectedDoc?.isReplace && selectedDoc?.oldFileUrl && (
                  <div className="col-span-2 flex items-center justify-between rounded-xl border border-default-100 bg-default-50 px-4 py-3">
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-red-100">
                        <PdfIcon className="h-5 w-5 text-red-500" />
                      </div>

                      <div className="min-w-0">
                        <p className="text-xs font-medium uppercase tracking-wide text-default-400">
                          Currently uploaded file
                        </p>
                        <p className="truncate text-sm font-medium text-foreground">
                          {selectedDoc?.fileName || "Document"}
                        </p>
                        <p className="text-xs text-default-400">
                          {selectedDoc?.fileSizeKb
                            ? `${selectedDoc.fileSizeKb} KB`
                            : ""}
                        </p>
                      </div>
                    </div>

                    <Button
                      size="sm"
                      color="default"
                      variant="flat"
                      as="a"
                      href={selectedDoc.oldFileUrl}
                      target="_blank"
                      rel="noreferrer"
                    >
                      View
                    </Button>
                  </div>
                )}

                <div className="col-span-2">
                  <Controller
                    name="fileUrl"
                    control={control}
                    render={({ field }) => (
                      <FileUploader
                        label="Upload file"
                        acceptZip={true}
                        value={field.value}
                        errorMessage={errors.fileUrl?.message}
                        onChange={(uploadedUrl) => {
                          field.onChange(uploadedUrl);
                        }}
                        onUploadSuccess={async (fileMeta) => {
                          const uploadedFileUrl = fileMeta?.filePath || "";
                          const uploadedFileName = fileMeta?.fileName || "";
                          const fileSizeKb = fileMeta?.fileSize
                            ? Math.ceil(Number(fileMeta.fileSize) / 1024)
                            : 0;

                          const fileFormat = getFileFormatFromMeta(fileMeta);

                          setValue("fileUrl", uploadedFileUrl, {
                            shouldValidate: true,
                            shouldDirty: true,
                          });

                          setValue("fileName", uploadedFileName, {
                            shouldValidate: true,
                            shouldDirty: true,
                          });

                          setValue("fileSizeKb", fileSizeKb, {
                            shouldValidate: true,
                            shouldDirty: true,
                          });

                          setValue("fileFormat", fileFormat, {
                            shouldValidate: true,
                            shouldDirty: true,
                          });

                          await onCheckDocumentExpiry(uploadedFileUrl);
                        }}
                      />
                    )}
                  />

                  {isCheckingExpiry && (
                    <div className="col-span-2 rounded-xl border border-primary-200 bg-primary-50 px-4 py-3">
                      <p className="text-sm font-semibold text-primary">
                        Checking document expiry date...
                      </p>
                      <p className="mt-1 text-xs text-default-500">
                        Please wait while the system scans the uploaded
                        document.
                      </p>
                    </div>
                  )}

                  {expiryCheckResult && (
                    <div
                      className={`col-span-2 rounded-xl border px-4 py-3 ${
                        expiryCheckResult?.status === "VALID"
                          ? "border-success-200 bg-success-50"
                          : expiryCheckResult?.manualReviewRequired
                            ? "border-warning-200 bg-warning-50"
                            : "border-default-200 bg-default-50"
                      }`}
                    >
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <div>
                          <p className="text-sm font-semibold text-foreground">
                            Expiry check result
                          </p>

                          <p className="mt-1 text-xs text-default-500">
                            {expiryCheckResult?.message || "-"}
                          </p>
                        </div>

                        <Chip
                          size="sm"
                          variant="flat"
                          color={
                            expiryCheckResult?.status === "VALID"
                              ? "success"
                              : expiryCheckResult?.manualReviewRequired
                                ? "warning"
                                : "default"
                          }
                        >
                          {expiryCheckResult?.status || "CHECKED"}
                        </Chip>
                      </div>

                      <div className="mt-3 grid grid-cols-1 gap-2 text-xs md:grid-cols-2">
                        <div>
                          <span className="text-default-400">
                            File Name:{" "}
                          </span>
                          <span className="font-medium text-foreground">
                            {expiryCheckResult?.fileName || "-"}
                          </span>
                        </div>

                        <div>
                          <span className="text-default-400">
                            Expiry Date:{" "}
                          </span>
                          <span className="font-medium text-foreground">
                            {expiryCheckResult?.expiryDate || "-"}
                          </span>
                        </div>

                        <div className="md:col-span-2">
                          <span className="text-default-400">
                            Matched Text:{" "}
                          </span>
                          <span className="font-medium text-foreground">
                            {expiryCheckResult?.matchedText || "-"}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <Controller
                  name="isPermanent"
                  control={control}
                  render={({ field }) => (
                    <Select
                      label="Permanent Document?"
                      isRequired
                      selectedKeys={
                        field.value !== undefined
                          ? [field.value.toString()]
                          : []
                      }
                      onSelectionChange={(keys) => {
                        const value = Array.from(keys)[0];
                        const boolValue = value === "true";

                        field.onChange(boolValue);
                        setIsPermanent(boolValue);

                        if (boolValue) {
                          setValue("expiryDate", null, {
                            shouldValidate: true,
                            shouldDirty: true,
                          });
                        }
                      }}
                      isInvalid={!!errors.isPermanent}
                      errorMessage={errors.isPermanent?.message}
                    >
                      <SelectItem key="true">Yes, Permanent</SelectItem>
                      <SelectItem key="false">No, Has Expiry</SelectItem>
                    </Select>
                  )}
                />

                {isPermanentValue === false && (
                  <Controller
                    name="expiryDate"
                    control={control}
                    render={({ field }) => (
                      <DatePicker
                        isRequired
                        label="Expiry date"
                        showMonthAndYearPickers
                        minValue={today(getLocalTimeZone())}
                        isInvalid={!!errors.expiryDate}
                        errorMessage={errors.expiryDate?.message}
                        value={
                          field.value &&
                          /^\d{4}-\d{2}-\d{2}$/.test(field.value)
                            ? parseDate(field.value)
                            : null
                        }
                        onChange={(value) => {
                          const iso = value ? value.toString() : null;
                          field.onChange(iso);
                        }}
                      />
                    )}
                  />
                )}

                <Controller
                  name="remarks"
                  control={control}
                  render={({ field }) => (
                    <Textarea
                      {...field}
                      label="Remarks"
                      minRows={3}
                      maxRows={5}
                      placeholder="Add remarks..."
                      className="col-span-2"
                    />
                  )}
                />

                <Controller
                  name="isFromCompanyDoc"
                  control={control}
                  render={({ field }) => (
                    <Checkbox
                      isSelected={field.value}
                      onValueChange={field.onChange}
                    >
                      Is From Company Doc
                    </Checkbox>
                  )}
                />
              </div>
            </ModalBody>

            <ModalFooter className="shrink-0 border-t border-default-200 bg-background">
              <Button
                type="button"
                variant="light"
                onPress={() => {
                  setIsPermanent(true);
                  setExpiryCheckResult(null);
                  setIsCheckingExpiry(false);

                  reset(DEFAULT_DOCUMENT_FORM_VALUES);

                  onClose();
                }}
              >
                Cancel
              </Button>

              <Button color="primary" type="submit">
                Submit
              </Button>
            </ModalFooter>
          </form>
        )}
      </ModalContent>
    </Modal>
  );
};

export default DocumentFormModal;
