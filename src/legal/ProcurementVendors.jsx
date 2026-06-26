import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  addToast,
  Button,
  Chip,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Pagination,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
  Textarea,
  Tooltip,
  useDisclosure,
} from "@heroui/react";
import { useDispatch, useSelector } from "react-redux";
import {
  CheckCircle,
  EllipsisVertical,
  Eye,
  ExternalLink,
  FileText,
  Search,
  Send,
  XCircle,
} from "lucide-react";
import dayjs from "dayjs";
import FileUploader from "../components/FileUploader.jsx";
import {
  agreementDecisionForVendorLegalRequest,
  getAllVendorQuotationLegalRequests,
  sendAgreementToProcurement,
} from "../toolkit/slices/operationSlice.js";

const columns = [
  { name: "REQUEST", uid: "request" },
  { name: "QUOTATION / VENDOR", uid: "quotationVendor" },
  { name: "LEGAL", uid: "legal" },
  { name: "STATUS", uid: "status" },
  { name: "DATES", uid: "dates" },
  { name: "ATTACHMENTS", uid: "attachments" },
  { name: "ACTIONS", uid: "actions" },
];

const statusColorMap = {
  SERVICE_AGREEMENT_REQUESTED: "warning",
  AGREEMENT_SENT_TO_PROCUREMENT: "primary",
  AGREEMENT_AGREED: "success",
  AGREEMENT_DISAGREED: "danger",
  CANCELLED: "default",
  PENDING: "warning",
};

const normalizeList = (response) => {
  if (Array.isArray(response)) return response;
  if (Array.isArray(response?.content)) return response.content;
  if (Array.isArray(response?.data)) return response.data;
  if (Array.isArray(response?.data?.content)) return response.data.content;
  if (Array.isArray(response?.response)) return response.response;
  return [];
};

const getUploadedFileValue = (value) => {
  return (
    value?.filePath ||
    value?.fileUrl ||
    value?.url ||
    value?.path ||
    value?.location ||
    value ||
    ""
  );
};

const getFileExtension = (fileName = "", fileUrl = "") => {
  const source = String(fileName || fileUrl || "").split("?")[0];
  const extension = source.split(".").pop()?.toLowerCase();
  return extension && extension !== source ? extension : "file";
};

const formatFileSize = (sizeKb) => {
  const kb = Number(sizeKb || 0);
  if (!kb) return "";
  if (kb < 1024) return `${kb} KB`;
  return `${(kb / 1024).toFixed(2)} MB`;
};

const getQuotationDocuments = (rowData) => {
  if (Array.isArray(rowData?.documents)) {
    return rowData.documents.filter(
      (doc) => doc && !doc.deleted && doc.fileUrl,
    );
  }

  return [];
};

const getAgreementUrl = (rowData) => {
  return (
    rowData?.agreementFileUrl ||
    rowData?.agreementUrl ||
    rowData?.agreementAttachmentUrl ||
    rowData?.agreementAttachment ||
    ""
  );
};

const fileLinkClassMap = {
  primary: "border-primary-100 bg-primary-50 text-primary hover:bg-primary-100",
  success: "border-success-100 bg-success-50 text-success hover:bg-success-100",
};

const FileLink = ({ href, label, meta, color = "primary" }) => {
  if (!href) return null;

  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className={`inline-flex min-w-0 items-center gap-2 rounded-xl border px-3 py-2 text-xs font-medium ${
        fileLinkClassMap[color] || fileLinkClassMap.primary
      }`}
    >
      <FileText size={15} className="shrink-0" />
      <span className="min-w-0 truncate">{label}</span>
      {meta ? <span className="shrink-0 text-default-500">{meta}</span> : null}
      <ExternalLink size={13} className="shrink-0" />
    </a>
  );
};

const QuotationDocumentLinks = ({ documents = [], compact = false }) => {
  if (!documents.length) {
    return (
      <div className="rounded-xl border border-dashed border-default-300 bg-default-50 px-3 py-3 text-center text-xs text-default-500">
        No quotation documents
      </div>
    );
  }

  return (
    <div
      className={
        compact
          ? "flex flex-col gap-1.5"
          : "grid grid-cols-1 gap-2 sm:grid-cols-2"
      }
    >
      {documents.map((doc, index) => {
        const fileName = doc?.fileName || `Quotation Document ${index + 1}`;
        const fileType =
          doc?.fileType || getFileExtension(fileName, doc?.fileUrl);
        const size = formatFileSize(doc?.fileSizeKb);

        return (
          <FileLink
            key={doc?.id || doc?.fileUrl || index}
            href={doc?.fileUrl}
            label={fileName}
            meta={[String(fileType).toUpperCase(), size]
              .filter(Boolean)
              .join(" • ")}
            color="primary"
          />
        );
      })}
    </div>
  );
};

const ProcurementVendors = () => {
  const dispatch = useDispatch();

  const legalRequestsResponse = useSelector(
    (state) => state.operation.vendorLegalRequests,
  );
  const loading = useSelector((state) => state.operation.loading);
  const currentUser = useSelector((state) => state.auth.currentUser);

  const viewModal = useDisclosure();
  const sendToProcurementModal = useDisclosure();
  const decisionModal = useDisclosure();

  const [selectedRequest, setSelectedRequest] = useState(null);
  const [searchValue, setSearchValue] = useState("");
  const [submitLoading, setSubmitLoading] = useState(false);
  const [filteration, setFilteration] = useState({
    page: 1,
    size: 10,
  });

  const [sendToProcurementData, setSendToProcurementData] = useState({
    agreementFileUrl: "",
    remarks: "",
  });

  const [decisionData, setDecisionData] = useState({
    decision: "",
    decisionBy: "",
    remarks: "",
  });

  const resolvedUserId =
    currentUser?.id || currentUser?.userId || currentUser?.employeeId || "";

  const fetchLegalRequests = useCallback(() => {
    dispatch(getAllVendorQuotationLegalRequests());
  }, [dispatch]);

  useEffect(() => {
    fetchLegalRequests();
  }, [fetchLegalRequests]);

  const legalRequests = useMemo(() => {
    return normalizeList(legalRequestsResponse);
  }, [legalRequestsResponse]);

  const filteredItems = useMemo(() => {
    let list = [...legalRequests];

    if (searchValue) {
      const search = searchValue.toLowerCase();

      list = list.filter((item) => {
        const documentText = getQuotationDocuments(item)
          .map((doc) => `${doc?.fileName || ""} ${doc?.fileType || ""}`)
          .join(" ");

        return `${Object.values(item || {}).join(" ")} ${documentText}`
          .toLowerCase()
          .includes(search);
      });
    }

    return list;
  }, [legalRequests, searchValue]);

  const pages = Math.ceil(filteredItems.length / filteration.size) || 1;

  const paginatedItems = useMemo(() => {
    const start = (filteration.page - 1) * filteration.size;
    const end = start + filteration.size;
    return filteredItems.slice(start, end);
  }, [filteredItems, filteration.page, filteration.size]);

  const selectedQuotationDocuments = getQuotationDocuments(selectedRequest);
  const selectedAgreementUrl = getAgreementUrl(selectedRequest);

  const handleView = useCallback(
    (rowData) => {
      setSelectedRequest(rowData);
      viewModal.onOpen();
    },
    [viewModal],
  );

  const handleOpenSendToProcurement = useCallback(
    (rowData) => {
      const agreementUrl = getAgreementUrl(rowData);

      setSelectedRequest(rowData);
      setSendToProcurementData({
        agreementFileUrl: agreementUrl,
        remarks: rowData?.statusReason || "",
      });
      sendToProcurementModal.onOpen();
    },
    [sendToProcurementModal],
  );

  const handleSendToProcurementSubmit = () => {
    if (!selectedRequest?.id) {
      addToast({
        title: "Missing request",
        description: "Legal request ID is missing.",
        color: "danger",
      });
      return;
    }

    if (!resolvedUserId) {
      addToast({
        title: "Missing user",
        description: "User ID is missing. Please login again.",
        color: "danger",
      });
      return;
    }

    if (!sendToProcurementData.agreementFileUrl) {
      addToast({
        title: "Agreement required",
        description:
          "Please upload agreement PDF before sending to procurement.",
        color: "danger",
      });
      return;
    }

    const payload = {
      agreementFileUrl: sendToProcurementData.agreementFileUrl,
      remarks: sendToProcurementData.remarks || "",
    };

    setSubmitLoading(true);

    dispatch(
      sendAgreementToProcurement({
        id: selectedRequest.id,
        userId: Number(resolvedUserId),
        data: payload,
      }),
    ).then((resp) => {
      setSubmitLoading(false);

      if (resp.meta.requestStatus === "fulfilled") {
        addToast({
          title: "SUCCESS",
          description: "Agreement sent to procurement successfully.",
          color: "success",
        });

        sendToProcurementModal.onClose();
        setSelectedRequest(null);
        setSendToProcurementData({ agreementFileUrl: "", remarks: "" });
        fetchLegalRequests();
      } else {
        addToast({
          title: "ERROR",
          description:
            resp?.payload?.message ||
            resp?.payload?.data?.message ||
            resp?.payload ||
            "Failed to send agreement to procurement.",
          color: "danger",
        });
      }
    });
  };

  const handleOpenDecision = (rowData, decision) => {
    setSelectedRequest(rowData);
    setDecisionData({
      decision,
      decisionBy: resolvedUserId ? String(resolvedUserId) : "",
      remarks: "",
    });
    decisionModal.onOpen();
  };

  const handleDecisionSubmit = () => {
    if (!selectedRequest?.id) {
      addToast({
        title: "Missing request",
        description: "Legal request ID is missing.",
        color: "danger",
      });
      return;
    }

    if (!decisionData.decisionBy) {
      addToast({
        title: "Decision by required",
        description: "Please enter decision by user ID.",
        color: "danger",
      });
      return;
    }

    const payload = {
      decision: decisionData.decision,
      decisionBy: Number(decisionData.decisionBy),
      remarks: decisionData.remarks || "",
    };

    setSubmitLoading(true);

    dispatch(
      agreementDecisionForVendorLegalRequest({
        id: selectedRequest.id,
        data: payload,
      }),
    ).then((resp) => {
      setSubmitLoading(false);

      if (resp.meta.requestStatus === "fulfilled") {
        addToast({
          title: "SUCCESS",
          description: `Agreement marked as ${decisionData.decision}.`,
          color: decisionData.decision === "AGREED" ? "success" : "danger",
        });

        decisionModal.onClose();
        setSelectedRequest(null);
        setDecisionData({ decision: "", decisionBy: "", remarks: "" });
        fetchLegalRequests();
      } else {
        addToast({
          title: "ERROR",
          description:
            resp?.payload?.message ||
            resp?.payload?.data?.message ||
            resp?.payload ||
            "Failed to update agreement decision.",
          color: "danger",
        });
      }
    });
  };

  const canSendToProcurement = (status) =>
    status === "SERVICE_AGREEMENT_REQUESTED" || status === "PENDING";

  const canTakeDecision = (status) =>
    status === "AGREEMENT_SENT_TO_PROCUREMENT";

  const renderCell = useCallback(
    (rowData, columnKey) => {
      const status = rowData?.status;
      const quotationDocuments = getQuotationDocuments(rowData);
      const agreementUrl = getAgreementUrl(rowData);

      switch (columnKey) {
        case "request":
          return (
            <div className="flex max-w-[260px] flex-col">
              <span className="font-semibold text-foreground">
                {rowData?.legalRequestTitle || "-"}
              </span>
              <span className="text-xs text-default-500">
                ID: {rowData?.id || "-"}
              </span>
              <span className="line-clamp-2 text-xs text-default-500">
                {rowData?.notes || "-"}
              </span>
            </div>
          );

        case "quotationVendor":
          return (
            <div className="flex flex-col gap-1 text-xs">
              <span>
                Quotation:{" "}
                <span className="font-semibold">
                  {rowData?.quotationNumber ||
                    rowData?.vendorQuotationId ||
                    "-"}
                </span>
              </span>
              <span>
                Vendor:{" "}
                <span className="font-semibold">
                  {rowData?.vendorName || rowData?.vendorId || "-"}
                </span>
              </span>
            </div>
          );

        case "legal":
          return (
            <div className="flex flex-col gap-1 text-xs">
              <span>Assigned To: {rowData?.assignedToLegal || "-"}</span>
              <span>Created By: {rowData?.createdBy || "-"}</span>
              <span>Updated By: {rowData?.updatedBy || "-"}</span>
            </div>
          );

        case "status":
          return (
            <Chip
              size="sm"
              color={statusColorMap[status] || "default"}
              variant="flat"
            >
              {status || "-"}
            </Chip>
          );

        case "dates":
          return (
            <div className="flex flex-col gap-1 text-xs">
              <span>
                Created:{" "}
                {rowData?.createdDate
                  ? dayjs(rowData.createdDate).format("DD-MM-YYYY HH:mm")
                  : "-"}
              </span>
              <span>
                Updated:{" "}
                {rowData?.updatedDate
                  ? dayjs(rowData.updatedDate).format("DD-MM-YYYY HH:mm")
                  : "-"}
              </span>
            </div>
          );

        case "attachments":
          return (
            <div className="flex flex-col gap-1.5 text-xs">
              {quotationDocuments.length > 0 ? (
                <Tooltip
                  content={quotationDocuments
                    .map((doc) => doc?.fileName || "Document")
                    .join(", ")}
                >
                  <Chip
                    size="sm"
                    color="primary"
                    variant="flat"
                    className="w-fit"
                  >
                    {quotationDocuments.length} Quotation File
                    {quotationDocuments.length > 1 ? "s" : ""}
                  </Chip>
                </Tooltip>
              ) : (
                <Chip
                  size="sm"
                  color="default"
                  variant="flat"
                  className="w-fit"
                >
                  No Quotation Files
                </Chip>
              )}

              {agreementUrl ? (
                <a
                  href={agreementUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex w-fit items-center gap-1 text-xs font-semibold text-success"
                >
                  View Agreement <ExternalLink size={12} />
                </a>
              ) : (
                <Chip
                  size="sm"
                  color="default"
                  variant="flat"
                  className="w-fit"
                >
                  No Agreement
                </Chip>
              )}
            </div>
          );

        case "actions":
          return (
            <Dropdown>
              <DropdownTrigger>
                <Button isIconOnly size="sm" variant="light">
                  <EllipsisVertical size={18} />
                </Button>
              </DropdownTrigger>

              <DropdownMenu aria-label="Legal request actions">
                <DropdownItem
                  key="view"
                  startContent={<Eye size={15} />}
                  onPress={() => handleView(rowData)}
                >
                  View
                </DropdownItem>

                <DropdownItem
                  key="sendToProcurement"
                  startContent={<Send size={15} />}
                  onPress={() => handleOpenSendToProcurement(rowData)}
                  isDisabled={!canSendToProcurement(status)}
                >
                  Send To Procurement
                </DropdownItem>

                <DropdownItem
                  key="agreed"
                  startContent={<CheckCircle size={15} />}
                  onPress={() => handleOpenDecision(rowData, "AGREED")}
                  isDisabled={!canTakeDecision(status)}
                >
                  Mark Agreed
                </DropdownItem>

                <DropdownItem
                  key="disagreed"
                  startContent={<XCircle size={15} />}
                  onPress={() => handleOpenDecision(rowData, "DISAGREED")}
                  isDisabled={!canTakeDecision(status)}
                  className="text-danger"
                  color="danger"
                >
                  Mark Disagreed
                </DropdownItem>
              </DropdownMenu>
            </Dropdown>
          );

        default:
          return rowData?.[columnKey] || "-";
      }
    },
    [handleOpenSendToProcurement, handleView],
  );

  const topContent = (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">
            Vendor Legal Requests
          </h1>
          <p className="text-sm text-default-500">
            Service agreement requests sent from procurement/onboarding.
          </p>
        </div>

        <Input
          isClearable
          className="w-full sm:max-w-[320px]"
          placeholder="Search legal request..."
          startContent={<Search size={17} />}
          value={searchValue}
          onValueChange={(value) => {
            setSearchValue(value || "");
            setFilteration((prev) => ({ ...prev, page: 1 }));
          }}
          onClear={() => {
            setSearchValue("");
            setFilteration((prev) => ({ ...prev, page: 1 }));
          }}
        />
      </div>

      <div className="flex items-center justify-between">
        <span className="text-small text-default-400">
          Total {filteredItems.length} legal requests
        </span>

        <label className="flex items-center gap-2 text-small text-default-400">
          Rows per page:
          <select
            className="bg-transparent text-small text-default-400 outline-none"
            value={filteration.size}
            onChange={(e) =>
              setFilteration({
                page: 1,
                size: Number(e.target.value),
              })
            }
          >
            <option value="5">5</option>
            <option value="10">10</option>
            <option value="25">25</option>
          </select>
        </label>
      </div>
    </div>
  );

  const bottomContent = (
    <div className="flex items-center justify-between px-2 py-2">
      <span className="text-small text-default-400">
        Page {filteration.page} of {pages}
      </span>

      <Pagination
        isCompact
        showControls
        color="primary"
        page={filteration.page}
        total={pages}
        onChange={(page) =>
          setFilteration((prev) => ({
            ...prev,
            page,
          }))
        }
      />
    </div>
  );

  return (
    <>
      <Table
        isHeaderSticky
        aria-label="Vendor legal requests table"
        topContent={topContent}
        topContentPlacement="outside"
        bottomContent={bottomContent}
        bottomContentPlacement="outside"
        classNames={{
          wrapper: "max-h-[65vh]",
        }}
      >
        <TableHeader columns={columns}>
          {(column) => (
            <TableColumn
              key={column.uid}
              align={column.uid === "actions" ? "center" : "start"}
            >
              {column.name}
            </TableColumn>
          )}
        </TableHeader>

        <TableBody
          isLoading={loading === "pending"}
          items={paginatedItems}
          emptyContent={
            loading === "pending" ? "Loading..." : "No legal requests found"
          }
        >
          {(item) => (
            <TableRow key={item?.id}>
              {(columnKey) => (
                <TableCell>{renderCell(item, columnKey)}</TableCell>
              )}
            </TableRow>
          )}
        </TableBody>
      </Table>

      <Modal
        isOpen={viewModal.isOpen}
        onOpenChange={viewModal.onOpenChange}
        size="3xl"
      >
        <ModalContent>
          <>
            <ModalHeader className="border-b">
              Legal Request Details
            </ModalHeader>

            <ModalBody className="max-h-[72vh] space-y-4 overflow-y-auto py-5">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <Input
                  label="Title"
                  value={selectedRequest?.legalRequestTitle || "-"}
                  isReadOnly
                />
                <Input
                  label="Status"
                  value={selectedRequest?.status || "-"}
                  isReadOnly
                />
                <Input
                  label="Quotation"
                  value={selectedRequest?.quotationNumber || "-"}
                  isReadOnly
                />
                <Input
                  label="Vendor"
                  value={selectedRequest?.vendorName || "-"}
                  isReadOnly
                />
              </div>

              <Textarea
                label="Notes"
                value={selectedRequest?.notes || "-"}
                isReadOnly
              />
              <Textarea
                label="Description"
                value={selectedRequest?.statusReason || "-"}
                isReadOnly
              />

              <div className="rounded-2xl border border-default-200 bg-default-50 p-4">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <p className="text-sm font-semibold text-foreground">
                    Quotation Documents
                  </p>
                  <Chip size="sm" color="primary" variant="flat">
                    {selectedQuotationDocuments.length} Files
                  </Chip>
                </div>
                <QuotationDocumentLinks
                  documents={selectedQuotationDocuments}
                />
              </div>

              <div className="rounded-2xl border border-default-200 bg-default-50 p-4">
                <p className="mb-3 text-sm font-semibold text-foreground">
                  Agreement Document
                </p>
                {selectedAgreementUrl ? (
                  <FileLink
                    href={selectedAgreementUrl}
                    label="View Agreement PDF"
                    color="success"
                  />
                ) : (
                  <div className="rounded-xl border border-dashed border-default-300 bg-white px-3 py-3 text-center text-xs text-default-500">
                    Agreement PDF not uploaded yet.
                  </div>
                )}
              </div>
            </ModalBody>

            <ModalFooter>
              <Button variant="flat" onPress={viewModal.onClose}>
                Close
              </Button>
            </ModalFooter>
          </>
        </ModalContent>
      </Modal>

      <Modal
        isOpen={sendToProcurementModal.isOpen}
        onOpenChange={sendToProcurementModal.onOpenChange}
        size="3xl"
        isDismissable={false}
      >
        <ModalContent>
          <>
            <ModalHeader className="border-b">
              Send Agreement To Procurement
            </ModalHeader>

            <ModalBody className="max-h-[72vh] space-y-4 overflow-y-auto py-5">
              <Input
                label="Legal Request"
                value={selectedRequest?.legalRequestTitle || "-"}
                isReadOnly
              />

              <div className="rounded-2xl border border-default-200 bg-default-50 p-4">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <p className="text-sm font-semibold text-foreground">
                    Quotation Documents
                  </p>
                  <Chip size="sm" color="primary" variant="flat">
                    {selectedQuotationDocuments.length} Files
                  </Chip>
                </div>
                <QuotationDocumentLinks
                  documents={selectedQuotationDocuments}
                />
              </div>

              {sendToProcurementData.agreementFileUrl ? (
                <div className="rounded-2xl border border-success-200 bg-success-50 p-4">
                  <p className="mb-2 text-sm font-semibold text-foreground">
                    Current Agreement
                  </p>
                  <FileLink
                    href={sendToProcurementData.agreementFileUrl}
                    label="View Existing Agreement PDF"
                    color="success"
                  />
                </div>
              ) : null}

              <FileUploader
                isRequired
                label="Agreement PDF"
                value={sendToProcurementData.agreementFileUrl}
                onChange={(value) =>
                  setSendToProcurementData((prev) => ({
                    ...prev,
                    agreementFileUrl: getUploadedFileValue(value),
                  }))
                }
              />

              <Textarea
                label="Remarks"
                value={sendToProcurementData.remarks}
                onChange={(e) =>
                  setSendToProcurementData((prev) => ({
                    ...prev,
                    remarks: e.target.value,
                  }))
                }
              />
            </ModalBody>

            <ModalFooter className="border-t">
              <Button
                variant="flat"
                onPress={() => {
                  sendToProcurementModal.onClose();
                  setSelectedRequest(null);
                  setSendToProcurementData({
                    agreementFileUrl: "",
                    remarks: "",
                  });
                }}
              >
                Cancel
              </Button>

              <Button
                color="primary"
                isLoading={submitLoading}
                onPress={handleSendToProcurementSubmit}
              >
                Send To Procurement
              </Button>
            </ModalFooter>
          </>
        </ModalContent>
      </Modal>

      <Modal
        isOpen={decisionModal.isOpen}
        onOpenChange={decisionModal.onOpenChange}
        size="2xl"
        isDismissable={false}
      >
        <ModalContent>
          <>
            <ModalHeader className="border-b">
              {decisionData.decision === "AGREED"
                ? "Mark Agreement as Agreed"
                : "Mark Agreement as Disagreed"}
            </ModalHeader>

            <ModalBody className="space-y-4 py-5">
              <Input
                label="Legal Request"
                value={selectedRequest?.legalRequestTitle || "-"}
                isReadOnly
              />

              {selectedAgreementUrl ? (
                <FileLink
                  href={selectedAgreementUrl}
                  label="View Agreement PDF"
                  color="success"
                />
              ) : (
                <Chip variant="flat">No Agreement PDF</Chip>
              )}

              <Input
                label="Decision"
                value={decisionData.decision}
                isReadOnly
              />

              <Input
                label="Decision By User ID"
                isRequired
                value={decisionData.decisionBy}
                onChange={(e) =>
                  setDecisionData((prev) => ({
                    ...prev,
                    decisionBy: e.target.value.replace(/\D/g, ""),
                  }))
                }
              />

              <Textarea
                label="Remarks"
                value={decisionData.remarks}
                onChange={(e) =>
                  setDecisionData((prev) => ({
                    ...prev,
                    remarks: e.target.value,
                  }))
                }
              />
            </ModalBody>

            <ModalFooter className="border-t">
              <Button
                variant="flat"
                onPress={() => {
                  decisionModal.onClose();
                  setSelectedRequest(null);
                  setDecisionData({
                    decision: "",
                    decisionBy: "",
                    remarks: "",
                  });
                }}
              >
                Cancel
              </Button>

              <Button
                color={
                  decisionData.decision === "AGREED" ? "success" : "danger"
                }
                isLoading={submitLoading}
                onPress={handleDecisionSubmit}
              >
                Submit
              </Button>
            </ModalFooter>
          </>
        </ModalContent>
      </Modal>
    </>
  );
};

export default ProcurementVendors;
