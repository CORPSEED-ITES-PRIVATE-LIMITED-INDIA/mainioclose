import React, { useCallback, useEffect, useState } from "react";
import {
  addToast,
  Button,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  useDisclosure,
} from "@heroui/react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useDispatch, useSelector } from "react-redux";
import { FileText, Pencil, Trash2, UploadCloud } from "lucide-react";
import dayjs from "dayjs";

import FileUploader from "../../components/FileUploader";
import {
  getAllCompanyDocs,
  addCompanyDocument,
  updateCompanyDocument,
  removeCompanyDocument,
} from "../../toolkit/slices/operationSlice";

const handleFormValidationError = (errors) => {
  const firstError = Object.values(errors || {})[0];

  addToast({
    title: "VALIDATION ERROR",
    description: firstError?.message || "Please fix the highlighted errors.",
    color: "danger",
  });
};

const documentDefaultValues = {
  documentType: "",
  fileUrl: "",
  documentNumber: "",
  remarks: "",
};

const documentSchema = z.object({
  documentType: z.string().min(1, { message: "Document type is required" }),
  fileUrl: z.any().refine((value) => Boolean(value), {
    message: "Please upload a file",
  }),
  documentNumber: z.string().optional(),
  remarks: z.string().optional(),
});

const getUploadedFileValue = (value) => {
  return (
    value?.filePath ||
    value?.url ||
    value?.path ||
    value?.location ||
    value ||
    ""
  );
};

const getUploadedFileSizeKb = (value) => {
  const bytes = value?.size || value?.fileSize;
  return typeof bytes === "number" ? Math.round(bytes / 1024) : undefined;
};

const getFileNameFromUrl = (url = "") => {
  try {
    const cleanUrl = String(url).split("?")[0];
    return decodeURIComponent(
      cleanUrl.substring(cleanUrl.lastIndexOf("/") + 1) || "document",
    );
  } catch {
    return "document";
  }
};

const getFileFormatFromUrl = (url = "") => {
  const extension = String(url).split("?")[0].split(".").pop()?.toLowerCase();

  return extension || "";
};

const CompanyDocuments = () => {
  const dispatch = useDispatch();

  const currentUser = useSelector((state) => state.auth.currentUser);
  const companyDocs = useSelector((state) => state.operation.companyDocs || []);
  const loading = useSelector((state) => state.operation.loading);

  const uploadModal = useDisclosure();
  const deleteModal = useDisclosure();

  const [editingDoc, setEditingDoc] = useState(null);
  const [docPendingDelete, setDocPendingDelete] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const { control, handleSubmit, reset } = useForm({
    resolver: zodResolver(documentSchema),
    defaultValues: documentDefaultValues,
  });

  const resolvedCurrentUserId =
    currentUser?.id || currentUser?.userId || currentUser?.employeeId;

  const fetchCompanyDocs = useCallback(() => {
    dispatch(getAllCompanyDocs()).then((resp) => {
      if (resp.meta.requestStatus === "rejected") {
        addToast({
          title: "ERROR",
          description:
            resp?.payload?.message || "Failed to fetch company documents.",
          color: "danger",
        });
      }
    });
  }, [dispatch]);

  useEffect(() => {
    fetchCompanyDocs();
  }, [fetchCompanyDocs]);

  const handleOpenAdd = () => {
    setEditingDoc(null);
    reset(documentDefaultValues);
    uploadModal.onOpen();
  };

  const handleOpenEdit = (doc) => {
    setEditingDoc(doc);

    reset({
      documentType: doc.documentType || "",
      fileUrl: doc.fileUrl || "",
      documentNumber: doc.documentNumber || "",
      remarks: doc.remarks || "",
    });

    uploadModal.onOpen();
  };

  const handleOpenDelete = (doc) => {
    setDocPendingDelete(doc);
    deleteModal.onOpen();
  };

  const confirmDelete = () => {
    if (!docPendingDelete?.id) return;

    setIsDeleting(true);

    dispatch(removeCompanyDocument({ id: docPendingDelete.id })).then(
      (resp) => {
        setIsDeleting(false);

        if (resp.meta.requestStatus === "fulfilled") {
          addToast({
            title: "SUCCESS",
            description: `${docPendingDelete.documentType} removed.`,
            color: "success",
          });

          fetchCompanyDocs();
          deleteModal.onClose();
          setDocPendingDelete(null);
        } else {
          addToast({
            title: "ERROR",
            description: resp?.payload?.message || "Failed to remove document.",
            color: "danger",
          });
        }
      },
    );
  };

  const onSubmitDocument = (values) => {
    if (!resolvedCurrentUserId) {
      addToast({
        title: "ERROR",
        description: "User is missing. Please login again.",
        color: "danger",
      });

      return;
    }

    const fileUrl = getUploadedFileValue(values.fileUrl);

    if (!fileUrl) {
      addToast({
        title: "ERROR",
        description: "Please upload a file.",
        color: "danger",
      });

      return;
    }

    const payload = {
      documentType: values.documentType,
      fileName: getFileNameFromUrl(fileUrl),
      fileUrl,
      fileSizeKb: getUploadedFileSizeKb(values.fileUrl),
      fileFormat: getFileFormatFromUrl(fileUrl),
      documentNumber: values.documentNumber || "",
      remarks: values.remarks || "",
    };

    setIsSubmitting(true);

    const action = editingDoc
      ? updateCompanyDocument({
          userId: resolvedCurrentUserId,
          id: editingDoc.id,
          data: payload,
        })
      : addCompanyDocument({
          userId: resolvedCurrentUserId,
          data: payload,
        });

    dispatch(action).then((resp) => {
      setIsSubmitting(false);

      if (resp.meta.requestStatus === "fulfilled") {
        addToast({
          title: "SUCCESS",
          description: `${payload.documentType} ${
            editingDoc ? "updated" : "uploaded"
          } successfully.`,
          color: "success",
        });

        fetchCompanyDocs();
        uploadModal.onClose();
        reset(documentDefaultValues);
        setEditingDoc(null);
      } else {
        addToast({
          title: "ERROR",
          description:
            resp?.payload?.message ||
            `Failed to ${editingDoc ? "update" : "upload"} document.`,
          color: "danger",
        });
      }
    });
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-start justify-between gap-2">
        <div>
          <h1 className="font-sans text-lg font-semibold">Company Documents</h1>

          <p className="text-xs text-default-500">
            Upload and manage your company's documents like PAN, Aadhar, and
            Cancelled Cheque.
          </p>
        </div>

        <Button
          color="primary"
          size="sm"
          startContent={<UploadCloud size={15} />}
          onPress={handleOpenAdd}
        >
          Add Document
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {loading === "pending" && companyDocs.length === 0 ? (
          <p className="text-sm text-default-500">Loading documents...</p>
        ) : companyDocs.length === 0 ? (
          <p className="text-sm text-default-400">
            No documents uploaded yet. Click "Add Document" to get started.
          </p>
        ) : (
          companyDocs.map((doc) => (
            <div
              key={doc.id}
              className="rounded-2xl border bg-white p-4 shadow-sm"
            >
              <div className="mb-3 flex items-start justify-between gap-2">
                <p className="text-sm font-semibold text-gray-900">
                  {doc.documentType}
                </p>

                <FileText size={18} className="text-default-400" />
              </div>

              <div className="space-y-1 text-xs text-default-500">
                <a
                  href={doc.fileUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="line-clamp-1 font-medium text-primary hover:underline"
                >
                  {doc.fileName}
                </a>

                {doc.documentNumber && <p>Number: {doc.documentNumber}</p>}

                <p>
                  Uploaded:{" "}
                  {doc.uploadTime
                    ? dayjs(doc.uploadTime).format("DD MMM YYYY, hh:mm A")
                    : "-"}
                </p>

                {doc.uploadedByName && <p>By: {doc.uploadedByName}</p>}

                {doc.remarks && <p>Remarks: {doc.remarks}</p>}
              </div>

              <div className="mt-3 flex gap-2">
                <Button
                  className="flex-1"
                  size="sm"
                  variant="flat"
                  startContent={<Pencil size={14} />}
                  onPress={() => handleOpenEdit(doc)}
                >
                  Edit
                </Button>

                <Button
                  className="flex-1"
                  size="sm"
                  color="danger"
                  variant="flat"
                  startContent={<Trash2 size={14} />}
                  onPress={() => handleOpenDelete(doc)}
                >
                  Delete
                </Button>
              </div>
            </div>
          ))
        )}
      </div>

      <Modal
        isOpen={uploadModal.isOpen}
        onOpenChange={uploadModal.onOpenChange}
        size="lg"
        isDismissable={false}
      >
        <ModalContent>
          <>
            <ModalHeader className="border-b">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  {editingDoc ? "Edit Document" : "Add Document"}
                </h2>

                <p className="mt-1 text-xs font-normal text-default-500">
                  {editingDoc
                    ? "Update the details or replace the file below."
                    : "Add a new document for your company."}
                </p>
              </div>
            </ModalHeader>

            <form
              onSubmit={handleSubmit(
                onSubmitDocument,
                handleFormValidationError,
              )}
            >
              <ModalBody className="space-y-4 py-5">
                <Controller
                  name="documentType"
                  control={control}
                  render={({ field, fieldState: { error } }) => (
                    <Input
                      isRequired
                      label="Document Type"
                      placeholder="e.g. PAN Card, Aadhar Card, GST Certificate"
                      value={field.value}
                      onChange={(e) => field.onChange(e.target.value)}
                      errorMessage={error?.message}
                      isInvalid={!!error}
                    />
                  )}
                />

                <Controller
                  name="fileUrl"
                  control={control}
                  render={({ field, fieldState: { error } }) => (
                    <FileUploader
                      isRequired
                      label="Document File"
                      value={field.value}
                      onChange={(value) => field.onChange(value)}
                      errorMessage={error?.message}
                      isInvalid={!!error}
                    />
                  )}
                />

                <Controller
                  name="documentNumber"
                  control={control}
                  render={({ field }) => (
                    <Input
                      label="Document Number"
                      placeholder="e.g. PAN number, account number"
                      value={field.value}
                      onChange={(e) => field.onChange(e.target.value)}
                    />
                  )}
                />

                <Controller
                  name="remarks"
                  control={control}
                  render={({ field }) => (
                    <Input
                      label="Remarks"
                      value={field.value}
                      onChange={(e) => field.onChange(e.target.value)}
                    />
                  )}
                />
              </ModalBody>

              <ModalFooter className="border-t">
                <Button
                  variant="flat"
                  type="button"
                  onPress={() => {
                    uploadModal.onClose();
                    reset(documentDefaultValues);
                    setEditingDoc(null);
                  }}
                >
                  Cancel
                </Button>

                <Button color="primary" type="submit" isLoading={isSubmitting}>
                  {editingDoc ? "Save Changes" : "Upload"}
                </Button>
              </ModalFooter>
            </form>
          </>
        </ModalContent>
      </Modal>

      <Modal
        isOpen={deleteModal.isOpen}
        onOpenChange={deleteModal.onOpenChange}
        size="sm"
      >
        <ModalContent>
          <>
            <ModalHeader className="border-b">Remove Document</ModalHeader>

            <ModalBody className="py-5">
              <p className="text-sm text-default-600">
                Are you sure you want to remove{" "}
                <span className="font-semibold">
                  {docPendingDelete?.documentType}
                </span>
                ? This action cannot be undone.
              </p>
            </ModalBody>

            <ModalFooter className="border-t">
              <Button
                variant="flat"
                onPress={() => {
                  deleteModal.onClose();
                  setDocPendingDelete(null);
                }}
              >
                Cancel
              </Button>

              <Button
                color="danger"
                isLoading={isDeleting}
                onPress={confirmDelete}
              >
                Remove
              </Button>
            </ModalFooter>
          </>
        </ModalContent>
      </Modal>
    </div>
  );
};

export default CompanyDocuments;
