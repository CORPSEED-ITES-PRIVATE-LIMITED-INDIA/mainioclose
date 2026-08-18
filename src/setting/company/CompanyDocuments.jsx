import React, { useCallback, useEffect, useMemo } from "react";
import {
  addToast,
  Button,
  Chip,
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
import { FileText, UploadCloud } from "lucide-react";
import dayjs from "dayjs";

import FileUploader from "../../components/FileUploader";
import {
  getAllCompanyDocs,
  addCompanyDocument,
} from "../../toolkit/slices/operationSlice";

/*
 * PLACEHOLDER: this should come from a ProductRequiredDocuments catalog
 * endpoint (GET /api/v1/required-documents or similar) so new document
 * types can be added without a frontend deploy. Hardcoded here only
 * because that endpoint isn't wired up yet — replace with a real fetch
 * (e.g. via a getAllRequiredDocuments thunk) and swap these ids for the
 * actual catalog ids as soon as it's available.
 */
const REQUIRED_DOCUMENT_TYPES = [
  { id: 1, name: "PAN Card", type: "IDENTITY" },
  { id: 2, name: "Aadhar Card", type: "IDENTITY" },
  { id: 3, name: "GST Certificate", type: "TAX" },
  { id: 4, name: "Cancelled Cheque", type: "BANKING" },
  { id: 5, name: "Vendor Setup Form", type: "ONBOARDING" },
];

const handleFormValidationError = (errors) => {
  const firstError = Object.values(errors || {})[0];

  addToast({
    title: "VALIDATION ERROR",
    description: firstError?.message || "Please fix the highlighted errors.",
    color: "danger",
  });
};

const uploadDocumentDefaultValues = {
  fileUrl: "",
  documentNumber: "",
  remarks: "",
};

const uploadDocumentSchema = z.object({
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
  const submitLoading = useSelector((state) => state.operation.submitLoading);

  const uploadModal = useDisclosure();

  const [activeDocumentType, setActiveDocumentType] = React.useState(null);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(uploadDocumentSchema),
    defaultValues: uploadDocumentDefaultValues,
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

  // Merge the catalog with whatever's already uploaded, so every
  // required document type shows a card — "Uploaded" or "Not uploaded".
  const documentCards = useMemo(() => {
    return REQUIRED_DOCUMENT_TYPES.map((docType) => {
      const uploaded = (companyDocs || []).find(
        (doc) => doc.requiredDocumentId === docType.id,
      );

      return {
        ...docType,
        uploaded: uploaded || null,
      };
    });
  }, [companyDocs]);

  const handleOpenUpload = (docType) => {
    setActiveDocumentType(docType);

    reset({
      fileUrl: "",
      documentNumber: docType?.uploaded?.documentNumber || "",
      remarks: docType?.uploaded?.remarks || "",
    });

    uploadModal.onOpen();
  };

  const onSubmitUpload = (values) => {
    if (!activeDocumentType?.id) {
      addToast({
        title: "ERROR",
        description: "Document type is missing. Please try again.",
        color: "danger",
      });
      return;
    }

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
      requiredDocumentId: activeDocumentType.id,
      fileName: getFileNameFromUrl(fileUrl),
      fileUrl,
      fileFormat: getFileFormatFromUrl(fileUrl),
      documentNumber: values.documentNumber || "",
      remarks: values.remarks || "",
    };

    dispatch(
      addCompanyDocument({
        currentUserId: resolvedCurrentUserId,
        data: payload,
      }),
    ).then((resp) => {
      if (resp.meta.requestStatus === "fulfilled") {
        addToast({
          title: "SUCCESS",
          description: `${activeDocumentType.name} uploaded successfully.`,
          color: "success",
        });

        uploadModal.onClose();
        reset(uploadDocumentDefaultValues);
        setActiveDocumentType(null);
      } else {
        addToast({
          title: "ERROR",
          description: resp?.payload?.message || "Failed to upload document.",
          color: "danger",
        });
      }
    });
  };

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="font-sans text-lg font-semibold">Company Documents</h1>
        <p className="text-xs text-default-500">
          Upload and manage your company's documents like PAN, Aadhar, and
          Cancelled Cheque.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {loading === "pending" && companyDocs.length === 0 ? (
          <p className="text-sm text-default-500">Loading documents...</p>
        ) : (
          documentCards.map((docType) => (
            <div
              key={docType.id}
              className="rounded-2xl border bg-white p-4 shadow-sm"
            >
              <div className="mb-3 flex items-start justify-between gap-2">
                <div>
                  <p className="text-sm font-semibold text-gray-900">
                    {docType.name}
                  </p>
                  <Chip size="sm" variant="flat" className="mt-1">
                    {docType.type}
                  </Chip>
                </div>

                <FileText size={18} className="text-default-400" />
              </div>

              {docType.uploaded ? (
                <div className="space-y-1 text-xs text-default-500">
                  <a
                    href={docType.uploaded.fileUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="line-clamp-1 font-medium text-primary hover:underline"
                  >
                    {docType.uploaded.fileName}
                  </a>

                  {docType.uploaded.documentNumber && (
                    <p>Number: {docType.uploaded.documentNumber}</p>
                  )}

                  <p>
                    Uploaded:{" "}
                    {docType.uploaded.uploadTime
                      ? dayjs(docType.uploaded.uploadTime).format(
                          "DD MMM YYYY, hh:mm A",
                        )
                      : "-"}
                  </p>

                  {docType.uploaded.uploadedByName && (
                    <p>By: {docType.uploaded.uploadedByName}</p>
                  )}
                </div>
              ) : (
                <p className="text-xs text-default-400">Not uploaded yet</p>
              )}

              <Button
                className="mt-3 w-full"
                size="sm"
                color="primary"
                variant={docType.uploaded ? "flat" : "solid"}
                startContent={<UploadCloud size={15} />}
                onPress={() => handleOpenUpload(docType)}
              >
                {docType.uploaded ? "Replace" : "Upload"}
              </Button>
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
                  {activeDocumentType?.uploaded ? "Replace" : "Upload"}{" "}
                  {activeDocumentType?.name}
                </h2>
                <p className="mt-1 text-xs font-normal text-default-500">
                  {activeDocumentType?.uploaded
                    ? "Uploading a new file will replace the existing one."
                    : "Upload this document for your company."}
                </p>
              </div>
            </ModalHeader>

            <form
              onSubmit={handleSubmit(onSubmitUpload, handleFormValidationError)}
            >
              <ModalBody className="space-y-4 py-5">
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
                    reset(uploadDocumentDefaultValues);
                    setActiveDocumentType(null);
                  }}
                >
                  Cancel
                </Button>

                <Button color="primary" type="submit" isLoading={submitLoading}>
                  {activeDocumentType?.uploaded ? "Replace" : "Upload"}
                </Button>
              </ModalFooter>
            </form>
          </>
        </ModalContent>
      </Modal>
    </div>
  );
};

export default CompanyDocuments;
