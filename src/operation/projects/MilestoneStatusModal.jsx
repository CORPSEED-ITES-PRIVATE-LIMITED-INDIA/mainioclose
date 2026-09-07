import {
  Button,
  DatePicker,
  Divider,
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
import { Plus, X } from "lucide-react";
import { getLocalTimeZone, parseDate, today } from "@internationalized/date";
import NewSelect from "../../components/NewSelect";
import FileUploader from "../../components/FileUploader";
import SingleFileUploader from "../../components/SingleFileUploader";

// "Update status" modal for a milestone — also drives the REWORK document
// checklist and the certification / completion-acknowledgement fields when
// the selected status is COMPLETED.
const MilestoneStatusModal = ({
  isOpen,
  onOpenChange,
  filteredMilestoneStatusList,
  statusObj,
  setStatusObj,
  userId,
  onStatusChange,
  isCompletedStatus,
  isCertificationCompleted,
  isReworkSelected,
  documentChecklist,
  getRequiredDocId,
  getRequiredDocName,
  onReworkDocSelectionChange,
  onReworkDocReasonChange,
  onSelectedReworkAttachmentChange,
  onSelectedReworkAttachmentSuccess,
  onAddAdditionalReworkDocument,
  onRemoveAdditionalReworkDocument,
  onAdditionalReworkDocumentChange,
  onAdditionalReworkAttachmentChange,
  onAdditionalReworkAttachmentSuccess,
  onSubmit,
}) => {
  return (
    <Modal isOpen={isOpen} onOpenChange={onOpenChange} size="2xl">
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col gap-1">
              Update status
            </ModalHeader>

            <ModalBody className="max-h-[75vh] overflow-auto">
              <NewSelect
                isRequired={true}
                errorMessage={"please select status"}
                label={"Select status"}
                data={filteredMilestoneStatusList}
                labelKey={"name"}
                valueKey={"name"}
                value={statusObj?.newStatusName}
                onChange={(e) => {
                  setStatusObj((prev) => ({
                    ...prev,
                    newStatusName: e,
                    changedById: userId,

                    // Clear REWORK data when another status is selected
                    reworkDocuments:
                      e === "REWORK" ? prev.reworkDocuments : [],
                    additionalReworkDocuments:
                      e === "REWORK" ? prev.additionalReworkDocuments : [],
                  }));

                  onStatusChange(e);
                }}
              />

              <Textarea
                label={"Reason"}
                isRequired
                errorMessage="please enter reason"
                value={statusObj?.statusReason}
                onChange={(e) => {
                  setStatusObj((prev) => ({
                    ...prev,
                    statusReason: e.target.value,
                    changedById: userId,
                  }));
                }}
              />

              {isCompletedStatus && (
                <div className="grid grid-cols-1 gap-4 rounded-xl border border-success-200 bg-success-50/40 p-4 md:grid-cols-2">
                  <div className="md:col-span-2">
                    <p className="text-sm font-semibold text-foreground">
                      Acknowledgement
                    </p>
                    <p className="text-xs text-default-500">
                      Upload the acknowledgement attachment before marking
                      this milestone as completed.
                    </p>
                  </div>

                  <div className="md:col-span-2">
                    <SingleFileUploader
                      label="Acknowledgement Attachment"
                      value={statusObj.acknowledgementAttachmentUrl}
                      onChange={(url, fileName) =>
                        setStatusObj((prev) => ({
                          ...prev,
                          acknowledgementAttachmentUrl: url || "",
                          acknowledgementAttachmentName: url
                            ? fileName || prev.acknowledgementAttachmentName
                            : "",
                        }))
                      }
                      isRequired
                    />
                  </div>

                  <Input
                    label="Acknowledgement Attachment Name"
                    placeholder="Enter attachment name"
                    isRequired
                    value={statusObj.acknowledgementAttachmentName}
                    onChange={(e) =>
                      setStatusObj((prev) => ({
                        ...prev,
                        acknowledgementAttachmentName: e.target.value,
                      }))
                    }
                  />
                </div>
              )}

              {isCertificationCompleted && (
                <div className="grid grid-cols-1 gap-4 rounded-xl border border-primary-200 bg-primary-50/40 p-4 md:grid-cols-2">
                  <div className="md:col-span-2">
                    <p className="text-sm font-semibold text-foreground">
                      Certification Details
                    </p>
                    <p className="text-xs text-default-500">
                      Complete all certification details before marking this
                      milestone as completed.
                    </p>
                  </div>

                  <Select
                    className="max-w-xs"
                    isRequired
                    items={[
                      { label: "DAYS", value: "DAYS" },
                      { label: "MONTHS", value: "MONTHS" },
                      { label: "YEARS", value: "YEARS" },
                    ]}
                    label="Certification Period"
                    placeholder="Select period"
                    selectedKeys={[statusObj.certificationTenureUnit]}
                    onSelectionChange={(keys) => {
                      const temp = Array.from(keys)[0];
                      setStatusObj((prev) => ({
                        ...prev,
                        certificationTenureUnit: temp,
                      }));
                    }}
                  >
                    {(item) => (
                      <SelectItem key={item?.value}>{item.label}</SelectItem>
                    )}
                  </Select>

                  <Input
                    type="number"
                    min={1}
                    label="Certification Tenure (Years)"
                    placeholder="Enter tenure"
                    isRequired
                    value={statusObj.certificationTenure}
                    onChange={(e) =>
                      setStatusObj((prev) => ({
                        ...prev,
                        certificationTenure: e.target.value,
                      }))
                    }
                  />

                  <DatePicker
                    label="Certification Expiry Date"
                    isRequired
                    showMonthAndYearPickers
                    minValue={today(getLocalTimeZone())}
                    value={
                      statusObj.certificateExpiryDate
                        ? parseDate(statusObj.certificateExpiryDate)
                        : null
                    }
                    onChange={(date) =>
                      setStatusObj((prev) => ({
                        ...prev,
                        certificateExpiryDate: date ? date.toString() : "",
                      }))
                    }
                  />

                  <div className="md:col-span-2">
                    <SingleFileUploader
                      label="Certification Attachment"
                      value={statusObj.certificationAttachmentUrl}
                      onChange={(url) =>
                        setStatusObj((prev) => ({
                          ...prev,
                          certificationAttachmentUrl: url || "",
                        }))
                      }
                      isRequired
                    />
                  </div>
                </div>
              )}

              {isReworkSelected && (
                <div className="space-y-4 rounded-xl border border-warning-200 bg-warning-50/40 p-4">
                  <div>
                    <p className="text-sm font-semibold text-foreground">
                      Rework documents
                    </p>
                    <p className="text-xs text-default-500">
                      Select checklist documents for which rework is required.
                    </p>
                  </div>

                  <Select
                    label="Select documents from checklist"
                    placeholder="Select one or more documents"
                    selectionMode="multiple"
                    selectedKeys={
                      new Set(
                        (statusObj.reworkDocuments || []).map((doc) =>
                          String(doc.uploadId),
                        ),
                      )
                    }
                    onSelectionChange={onReworkDocSelectionChange}
                    className="w-full"
                  >
                    {documentChecklist.map((doc) => {
                      const docId = getRequiredDocId(doc);
                      const docName = getRequiredDocName(doc);

                      return (
                        <SelectItem key={String(docId)} textValue={docName}>
                          {docName}
                        </SelectItem>
                      );
                    })}
                  </Select>

                  {(statusObj.reworkDocuments || []).length > 0 && (
                    <div className="space-y-3">
                      {(statusObj.reworkDocuments || []).map((doc) => (
                        <div
                          key={doc.uploadId}
                          className="rounded-lg border border-default-200 bg-content1 p-3"
                        >
                          <p className="mb-2 text-sm font-medium text-foreground">
                            {doc.documentName}
                          </p>

                          <Textarea
                            size="sm"
                            label="Small description / reason"
                            placeholder="Example: Document is blurred, expired, wrong format..."
                            value={doc.reason}
                            onChange={(e) =>
                              onReworkDocReasonChange(
                                doc.uploadId,
                                e.target.value,
                              )
                            }
                          />

                          <div className="mt-3 rounded-lg border border-dashed border-default-300 p-3">
                            <FileUploader
                              label="Attachment optional"
                              placeholder={`Upload attachment for ${doc.documentName}`}
                              uploadingType="multiple"
                              value={doc.attachmentFiles || []}
                              onChange={(uploadedFiles) =>
                                onSelectedReworkAttachmentChange(
                                  doc.uploadId,
                                  uploadedFiles,
                                )
                              }
                              onUploadSuccess={(fileMeta) =>
                                onSelectedReworkAttachmentSuccess(
                                  doc.uploadId,
                                  fileMeta,
                                )
                              }
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  <Divider />

                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-foreground">
                          Additional documents
                        </p>
                        <p className="text-xs text-default-500">
                          Add documents which are not available in checklist.
                        </p>
                      </div>

                      <Button
                        size="sm"
                        color="primary"
                        variant="flat"
                        startContent={<Plus className="h-4 w-4" />}
                        onPress={onAddAdditionalReworkDocument}
                      >
                        Add Document
                      </Button>
                    </div>

                    {(statusObj.additionalReworkDocuments || []).map(
                      (doc) => (
                        <div
                          key={doc.tempId}
                          className="rounded-lg border border-default-200 bg-content1 p-3"
                        >
                          <div className="mb-3 flex items-center justify-between gap-3">
                            <p className="text-sm font-medium text-foreground">
                              Additional document
                            </p>

                            <Button
                              isIconOnly
                              size="sm"
                              variant="light"
                              color="danger"
                              onPress={() =>
                                onRemoveAdditionalReworkDocument(doc.tempId)
                              }
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>

                          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                            <Input
                              label="Document name"
                              placeholder="Enter document name"
                              value={doc.documentName}
                              onChange={(e) =>
                                onAdditionalReworkDocumentChange(
                                  doc.tempId,
                                  "documentName",
                                  e.target.value,
                                )
                              }
                            />

                            <Textarea
                              label="Small description / reason"
                              placeholder="Enter why this document is required"
                              value={doc.reason}
                              onChange={(e) =>
                                onAdditionalReworkDocumentChange(
                                  doc.tempId,
                                  "reason",
                                  e.target.value,
                                )
                              }
                            />
                          </div>

                          <div className="mt-3 rounded-lg border border-dashed border-default-300 p-3">
                            <FileUploader
                              label="Attachment optional"
                              placeholder={
                                doc.documentName
                                  ? `Upload attachment for ${doc.documentName}`
                                  : "Upload attachment for this document"
                              }
                              uploadingType="multiple"
                              value={doc.attachmentFiles || []}
                              onChange={(uploadedFiles) =>
                                onAdditionalReworkAttachmentChange(
                                  doc.tempId,
                                  uploadedFiles,
                                )
                              }
                              onUploadSuccess={(fileMeta) =>
                                onAdditionalReworkAttachmentSuccess(
                                  doc.tempId,
                                  fileMeta,
                                )
                              }
                            />
                          </div>
                        </div>
                      ),
                    )}
                  </div>
                </div>
              )}
            </ModalBody>

            <ModalFooter>
              <Button variant="light" onPress={onClose}>
                Cancel
              </Button>

              <Button color="primary" onPress={onSubmit}>
                Submit
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};

export default MilestoneStatusModal;
