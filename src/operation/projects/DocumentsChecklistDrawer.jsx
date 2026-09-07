import { useState } from "react";
import { useDispatch } from "react-redux";
import { useParams } from "react-router-dom";
import {
  addToast,
  Button,
  Card,
  CardBody,
  Chip,
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
} from "@heroui/react";
import dayjs from "dayjs";
import NewSelect from "../../components/NewSelect";
import { PdfIcon } from "./ProjectDetailIcons";
import { getFileNameFromUrl } from "./projectDetailsUtils";
import {
  getRequiredDocumentsByProductId,
  uploadDocumentInProjects,
} from "../../toolkit/slices/operationSlice";

const isSameRequiredDocument = (requiredDoc, companyDoc) => {
  const requiredDocumentId =
    requiredDoc?.documentId ||
    requiredDoc?.requiredDocumentId ||
    requiredDoc?.id;

  if (
    requiredDocumentId &&
    companyDoc?.requiredDocumentId &&
    Number(requiredDocumentId) === Number(companyDoc.requiredDocumentId)
  ) {
    return true;
  }

  return (
    String(requiredDoc?.documentName || "")
      .trim()
      .toLowerCase() ===
    String(companyDoc?.requiredDocumentName || "")
      .trim()
      .toLowerCase()
  );
};

const getCompanyDocFileUrl = (doc) => {
  return (
    doc?.fileUrl ||
    doc?.documentUrl ||
    doc?.attachmentUrl ||
    doc?.s3Url ||
    doc?.url ||
    doc?.path ||
    ""
  );
};

const getCompanyDocFileName = (doc) => {
  return (
    doc?.fileName ||
    doc?.originalFileName ||
    doc?.originalName ||
    getFileNameFromUrl(getCompanyDocFileUrl(doc))
  );
};

const getCompanyDocFormat = (doc) => {
  const fileName = getCompanyDocFileName(doc);
  const fileUrl = getCompanyDocFileUrl(doc);
  const source = fileName || fileUrl || "";

  return (
    doc?.fileFormat ||
    doc?.format ||
    source?.split("?")[0]?.split(".")?.pop()?.toLowerCase() ||
    "file"
  );
};

const getCompanyDocPermanentValue = (companyDoc, requiredDoc) => {
  if (companyDoc?.isPermanent !== undefined) {
    return Boolean(companyDoc.isPermanent);
  }

  if (companyDoc?.permanent !== undefined) {
    return Boolean(companyDoc.permanent);
  }

  if (requiredDoc?.isPermanent !== undefined) {
    return Boolean(requiredDoc.isPermanent);
  }

  if (requiredDoc?.permanent !== undefined) {
    return Boolean(requiredDoc.permanent);
  }

  return true;
};

const buildCompanyDocDropPayload = (requiredDoc, companyDoc, projectId, userId) => {
  const requiredDocumentId = Number(
    requiredDoc?.documentId || requiredDoc?.requiredDocumentId || requiredDoc?.id,
  );

  const fileUrl = getCompanyDocFileUrl(companyDoc);
  const fileName = getCompanyDocFileName(companyDoc);
  const isPermanentValue = getCompanyDocPermanentValue(companyDoc, requiredDoc);

  return {
    projectId: Number(projectId),
    requiredDocumentId,
    fileUrl,
    fileName,
    uploadedById: Number(userId),
    createdById: Number(userId),
    companyDocSourceId: Number(
      companyDoc?.companyDocSourceId || companyDoc?.id || 0,
    ),
    isFromCompanyDoc: true,
    expiryDate: isPermanentValue ? null : companyDoc?.expiryDate || null,
    isPermanent: isPermanentValue,
    fileSizeKb: Number(companyDoc?.fileSizeKb || companyDoc?.fileSize || 0),
    fileFormat: getCompanyDocFormat(companyDoc),
    remarks: companyDoc?.remarks || "",
  };
};

const openCompanyDocPreview = (companyDoc) => {
  const raw = String(companyDoc?.fileUrl || "").trim();

  if (!raw) {
    addToast({
      title: "File not found",
      description: "No file URL available for this document.",
      color: "warning",
    });
    return;
  }

  const fixed =
    raw.includes("amazonaws.com") && !raw.includes("amazonaws.com/")
      ? raw.replace("amazonaws.com", "amazonaws.com/")
      : raw;

  const href =
    fixed.startsWith("http://") || fixed.startsWith("https://")
      ? fixed
      : `https://${fixed}`;

  window.open(href, "_blank", "noopener,noreferrer");
};

// Documents drawer — company documents (drag source) on the left, the
// service's required-document checklist (drop target) on the right.
const DocumentsChecklistDrawer = ({
  isOpen,
  onOpenChange,
  applicantTypeList,
  selectedApplicantId,
  onUpdateApplicantType,
  companyDocumentsList,
  requiredDocsList,
  onRefetchCompanyDocuments,
  onOpenVerify,
  onOpenUploadForDoc,
  onOpenReplaceForDoc,
}) => {
  const dispatch = useDispatch();
  const { projectId, userId } = useParams();
  const [draggedDoc, setDraggedDoc] = useState(null);

  return (
    <Drawer
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      size="5xl"
      classNames={{
        base: "h-screen max-h-screen",
      }}
    >
      <DrawerContent>
        {(onClose) => (
          <>
            <DrawerHeader className="flex flex-col gap-1">
              Documents
            </DrawerHeader>

            <DrawerBody className="flex min-h-0 flex-1 flex-col overflow-hidden">
              <div className="shrink-0">
                <NewSelect
                  label={"Select applicant type"}
                  labelKey={"name"}
                  valueKey={"id"}
                  value={selectedApplicantId}
                  data={applicantTypeList?.length > 0 ? applicantTypeList : []}
                  onChange={(e) => onUpdateApplicantType(e)}
                />
              </div>

              <div className="grid min-h-0 flex-1 grid-cols-1 gap-4 overflow-hidden lg:grid-cols-12">
                {/* LEFT SIDE: COMPANY DOCUMENTS */}
                <aside className="min-h-0 overflow-hidden rounded-2xl border border-default-200 bg-content1 lg:col-span-4">
                  <div className="border-b border-default-200 bg-default-50 px-4 py-3">
                    <p className="text-sm font-semibold text-foreground">
                      Company Documents
                    </p>
                    <p className="text-xs text-default-500">
                      Drag matching document and drop on required document
                      card
                    </p>
                  </div>

                  <div className="max-h-[60vh] space-y-2 overflow-y-auto p-3">
                    {companyDocumentsList?.length > 0 ? (
                      companyDocumentsList.map((companyDoc) => (
                        <div
                          key={companyDoc?.id}
                          draggable
                          onDragStart={() => setDraggedDoc(companyDoc)}
                          onDragEnd={() => setDraggedDoc(null)}
                          className="cursor-grab rounded-xl border border-default-200 bg-white p-3 shadow-sm transition-all hover:border-primary hover:bg-primary-50 active:cursor-grabbing"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <p className="truncate text-sm font-semibold text-foreground">
                                {companyDoc?.requiredDocumentName ||
                                  "Document"}
                              </p>
                              <p className="mt-0.5 truncate text-xs text-default-500">
                                {companyDoc?.fileName || "-"}
                              </p>
                            </div>

                            <Chip
                              size="sm"
                              color={
                                companyDoc?.status === "VERIFIED"
                                  ? "success"
                                  : "warning"
                              }
                              variant="flat"
                            >
                              {companyDoc?.status || "NA"}
                            </Chip>
                          </div>

                          <div className="mt-3 flex flex-wrap gap-2">
                            <Chip size="sm" variant="flat">
                              {getCompanyDocFormat(companyDoc)}
                            </Chip>

                            <Chip size="sm" variant="flat">
                              {companyDoc?.fileSizeKb || 0} KB
                            </Chip>

                            {companyDoc?.permanent ? (
                              <Chip size="sm" color="success" variant="flat">
                                Permanent
                              </Chip>
                            ) : (
                              <Chip size="sm" color="warning" variant="flat">
                                Expirable
                              </Chip>
                            )}
                            <Chip
                              size="sm"
                              color="primary"
                              variant="flat"
                              className="cursor-pointer"
                              onClick={() => openCompanyDocPreview(companyDoc)}
                            >
                              View
                            </Chip>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="flex h-40 items-center justify-center rounded-xl border border-dashed border-default-300 text-center">
                        <div>
                          <p className="text-sm font-medium text-default-600">
                            No company documents found
                          </p>
                          <p className="mt-1 text-xs text-default-400">
                            Upload documents in company repository first
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </aside>

                {/* RIGHT SIDE: REQUIRED SERVICE DOCUMENTS */}
                <section className="min-h-0 overflow-y-auto pr-2 lg:col-span-8">
                  <div className="grid grid-cols-1 gap-3">
                    {requiredDocsList?.map((doc, idx) => {
                      const hasFile = !!doc?.fileUrl;

                      const openPreview = () => {
                        const raw = String(doc?.fileUrl || "").trim();
                        const fixed =
                          raw.includes("amazonaws.com") &&
                          !raw.includes("amazonaws.com/")
                            ? raw.replace("amazonaws.com", "amazonaws.com/")
                            : raw;

                        const href =
                          fixed.startsWith("http://") ||
                          fixed.startsWith("https://")
                            ? fixed
                            : `https://${fixed}`;

                        window.open(href, "_blank", "noopener,noreferrer");
                      };

                      return (
                        <Card
                          key={`doc${idx}`}
                          onDragOver={(e) => e.preventDefault()}
                          onDrop={async (e) => {
                            e.preventDefault();

                            if (!draggedDoc) return;

                            if (!isSameRequiredDocument(doc, draggedDoc)) {
                              addToast({
                                title: "Document mismatch",
                                description: `${
                                  draggedDoc?.requiredDocumentName ||
                                  "Selected document"
                                } cannot be dropped on ${
                                  doc?.documentName ||
                                  "this required document"
                                }.`,
                                color: "warning",
                              });

                              setDraggedDoc(null);
                              return;
                            }

                            try {
                              const payload = buildCompanyDocDropPayload(
                                doc,
                                draggedDoc,
                                projectId,
                                userId,
                              );

                              if (!payload.requiredDocumentId) {
                                addToast({
                                  title: "Required document missing",
                                  description:
                                    "Required document ID not found.",
                                  color: "danger",
                                });

                                setDraggedDoc(null);
                                return;
                              }

                              if (!payload.companyDocSourceId) {
                                addToast({
                                  title: "Company document missing",
                                  description:
                                    "Company document source ID not found.",
                                  color: "danger",
                                });

                                setDraggedDoc(null);
                                return;
                              }

                              if (!payload.fileUrl) {
                                addToast({
                                  title: "File URL missing",
                                  description:
                                    "Selected company document does not have a valid file URL.",
                                  color: "danger",
                                });

                                setDraggedDoc(null);
                                return;
                              }

                              if (!payload.fileName) {
                                addToast({
                                  title: "File name missing",
                                  description:
                                    "Selected company document does not have a valid file name.",
                                  color: "danger",
                                });

                                setDraggedDoc(null);
                                return;
                              }

                              if (!payload.fileFormat) {
                                addToast({
                                  title: "File format missing",
                                  description:
                                    "Selected company document does not have a valid file format.",
                                  color: "danger",
                                });

                                setDraggedDoc(null);
                                return;
                              }

                              if (!payload.isPermanent && !payload.expiryDate) {
                                addToast({
                                  title: "Expiry date required",
                                  description:
                                    "This document is not permanent. Please upload it manually with expiry date.",
                                  color: "warning",
                                });

                                setDraggedDoc(null);
                                return;
                              }

                              console.log("DRAG DROP PAYLOAD:", payload);

                              const resp = await dispatch(
                                uploadDocumentInProjects({
                                  projectId,
                                  data: payload,
                                }),
                              );

                              if (resp?.meta?.requestStatus === "fulfilled") {
                                addToast({
                                  title: "Document uploaded",
                                  description:
                                    "Company document added to required document successfully.",
                                  color: "success",
                                });

                                dispatch(
                                  getRequiredDocumentsByProductId({
                                    userId,
                                    projectId,
                                  }),
                                );

                                onRefetchCompanyDocuments();
                              } else {
                                addToast({
                                  title: "Upload failed",
                                  description:
                                    resp?.payload?.message ||
                                    resp?.payload ||
                                    "Something went wrong while uploading.",
                                  color: "danger",
                                });
                              }
                            } catch (error) {
                              console.error("DROP DOCUMENT ERROR:", error);

                              addToast({
                                title: "Error",
                                description:
                                  "Something went wrong while dropping document.",
                                color: "danger",
                              });
                            } finally {
                              setDraggedDoc(null);
                            }
                          }}
                          className={`rounded-2xl border bg-white shadow-sm transition-all ${
                            draggedDoc
                              ? "border-dashed border-primary bg-primary-50/40"
                              : "border-default-200"
                          }`}
                        >
                          <CardBody className="flex flex-col gap-4 p-4">
                            <div className="flex items-start justify-between gap-3">
                              <div>
                                <h4 className="text-sm font-semibold text-foreground">
                                  {doc?.documentName}
                                </h4>

                                <div className="mt-2 flex flex-wrap gap-2">
                                  {doc?.mandatory && (
                                    <Chip size="sm" color="danger" variant="flat">
                                      Mandatory
                                    </Chip>
                                  )}

                                  {doc?.permanent && (
                                    <Chip
                                      size="sm"
                                      color="success"
                                      variant="flat"
                                    >
                                      Permanent
                                    </Chip>
                                  )}

                                  {doc?.expired && (
                                    <Chip
                                      size="sm"
                                      color="warning"
                                      variant="flat"
                                    >
                                      Expired
                                    </Chip>
                                  )}

                                  {draggedDoc && (
                                    <Chip
                                      size="sm"
                                      color="primary"
                                      variant="flat"
                                    >
                                      Drop here
                                    </Chip>
                                  )}
                                </div>
                              </div>

                              <Chip
                                size="sm"
                                color={
                                  doc?.status === "VERIFIED"
                                    ? "success"
                                    : doc?.status === "PENDING"
                                      ? "warning"
                                      : "default"
                                }
                                variant="flat"
                              >
                                {doc?.status || "NA"}
                              </Chip>
                            </div>

                            <div>
                              <p className="mb-2 text-sm text-default-500">
                                Uploaded File
                              </p>

                              {hasFile ? (
                                <div className="flex items-center justify-between rounded-xl border border-default-100 bg-default-50 px-4 py-3">
                                  <div className="flex min-w-0 items-center gap-3">
                                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-red-100">
                                      <PdfIcon className="h-5 w-5 text-red-500" />
                                    </div>

                                    <div className="min-w-0">
                                      <p className="truncate text-sm font-medium text-foreground">
                                        {doc?.fileName || "Document"}
                                      </p>
                                      <p className="text-xs text-default-400">
                                        {doc?.fileSizeKb
                                          ? `${doc.fileSizeKb} KB`
                                          : ""}
                                      </p>
                                    </div>
                                  </div>

                                  <Button
                                    size="sm"
                                    color="success"
                                    variant="flat"
                                    onPress={openPreview}
                                  >
                                    View
                                  </Button>
                                </div>
                              ) : (
                                <div className="rounded-xl border border-dashed border-default-300 bg-default-50 px-4 py-6 text-center">
                                  <p className="text-sm font-medium text-default-500">
                                    No file uploaded
                                  </p>
                                  <p className="mt-1 text-xs text-default-400">
                                    Upload manually or drag matching company
                                    document here
                                  </p>
                                </div>
                              )}
                            </div>

                            <div className="text-sm text-default-500">
                              {doc?.expiryDate
                                ? `Expiry: ${dayjs(doc.expiryDate).format("DD MMM YYYY")}`
                                : doc?.permanent
                                  ? "No expiry date"
                                  : "No expiry date"}
                            </div>

                            <div className="flex flex-wrap gap-2 pt-1">
                              {doc?.status !== "VERIFIED" && hasFile && (
                                <Button
                                  size="sm"
                                  color="primary"
                                  variant="flat"
                                  onPress={() => onOpenVerify(doc)}
                                >
                                  Verify
                                </Button>
                              )}

                              {doc?.status !== "UPLOADED" && (
                                <Button
                                  size="sm"
                                  color="secondary"
                                  variant="flat"
                                  onPress={() => onOpenUploadForDoc(doc)}
                                >
                                  Upload
                                </Button>
                              )}

                              {hasFile && (
                                <Button
                                  size="sm"
                                  color="warning"
                                  variant="flat"
                                  onPress={() => onOpenReplaceForDoc(doc)}
                                >
                                  Replace
                                </Button>
                              )}
                            </div>
                          </CardBody>
                        </Card>
                      );
                    })}
                  </div>
                </section>
              </div>
            </DrawerBody>

            <DrawerFooter className="shrink-0 border-t border-default-200 bg-background">
              <Button color="danger" variant="light" onPress={onClose}>
                Close
              </Button>
            </DrawerFooter>
          </>
        )}
      </DrawerContent>
    </Drawer>
  );
};

export default DocumentsChecklistDrawer;
