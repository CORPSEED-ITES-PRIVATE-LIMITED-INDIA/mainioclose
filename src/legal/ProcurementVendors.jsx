import React, { useEffect, useMemo, useState, useCallback } from "react";
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
  useDisclosure,
} from "@heroui/react";
import { useDispatch, useSelector } from "react-redux";
import {
  EllipsisVertical,
  Eye,
  FileText,
  Send,
  CheckCircle,
  XCircle,
  Upload,
  Search,
} from "lucide-react";
import dayjs from "dayjs";
import FileUploader from "../components/FileUploader.jsx";
import { getAllVendorQuotationLegalRequests } from "../toolkit/slices/operationSlice.js";

const columns = [
  { name: "REQUEST", uid: "request" },
  { name: "QUOTATION / VENDOR", uid: "quotationVendor" },
  { name: "LEGAL", uid: "legal" },
  { name: "STATUS", uid: "status" },
  { name: "DATES", uid: "dates" },
  { name: "AGREEMENT", uid: "agreement" },
  { name: "ACTIONS", uid: "actions" },
];

const statusColorMap = {
  SERVICE_AGREEMENT_REQUESTED: "warning",
  AGREEMENT_PREPARED_BY_LEGAL: "primary",
  AGREEMENT_SENT_TO_OPERATION: "secondary",
  AGREEMENT_SENT_TO_VENDOR: "primary",
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
  return [];
};

const ProcurementVendors = () => {
  const dispatch = useDispatch();

  const legalRequestsResponse = useSelector(
    (state) => state.operation.vendorLegalRequests,
  );

  const loading = useSelector((state) => state.vendors.loading);

  const viewModal = useDisclosure();
  const prepareAgreementModal = useDisclosure();
  const decisionModal = useDisclosure();

  const [selectedRequest, setSelectedRequest] = useState(null);
  const [searchValue, setSearchValue] = useState("");
  const [filteration, setFilteration] = useState({
    page: 1,
    size: 10,
  });

  const [prepareAgreementData, setPrepareAgreementData] = useState({
    agreementFileUrl: "",
    preparedBy: "",
    remarks: "",
  });

  const [decisionData, setDecisionData] = useState({
    decision: "",
    decisionBy: "",
    remarks: "",
  });

  useEffect(() => {
    dispatch(getAllVendorQuotationLegalRequests());
  }, [dispatch]);

  const legalRequests = useMemo(() => {
    return normalizeList(legalRequestsResponse);
  }, [legalRequestsResponse]);

  const filteredItems = useMemo(() => {
    let list = [...legalRequests];

    if (searchValue) {
      list = list.filter((item) =>
        Object.values(item || {}).some((value) =>
          String(value || "")
            .toLowerCase()
            .includes(searchValue.toLowerCase()),
        ),
      );
    }

    return list;
  }, [legalRequests, searchValue]);

  const pages = Math.ceil(filteredItems.length / filteration.size) || 1;

  const paginatedItems = useMemo(() => {
    const start = (filteration.page - 1) * filteration.size;
    const end = start + filteration.size;
    return filteredItems.slice(start, end);
  }, [filteredItems, filteration.page, filteration.size]);

  const handleView = (rowData) => {
    setSelectedRequest(rowData);
    viewModal.onOpen();
  };

  const handleOpenPrepareAgreement = (rowData) => {
    setSelectedRequest(rowData);
    setPrepareAgreementData({
      agreementFileUrl: rowData?.agreementFileUrl || "",
      preparedBy: "",
      remarks: "",
    });
    prepareAgreementModal.onOpen();
  };

  const handlePrepareAgreementSubmit = () => {
    if (!selectedRequest?.id) {
      addToast({
        title: "Missing request",
        description: "Legal request ID is missing.",
        color: "danger",
      });
      return;
    }

    if (!prepareAgreementData.agreementFileUrl) {
      addToast({
        title: "Agreement required",
        description: "Please upload agreement file.",
        color: "danger",
      });
      return;
    }

    if (!prepareAgreementData.preparedBy) {
      addToast({
        title: "Prepared by required",
        description: "Please enter prepared by user ID.",
        color: "danger",
      });
      return;
    }

    console.log("CALL API: prepare agreement", {
      id: selectedRequest.id,
      data: {
        agreementFileUrl: prepareAgreementData.agreementFileUrl,
        preparedBy: Number(prepareAgreementData.preparedBy),
        remarks: prepareAgreementData.remarks,
      },
    });

    addToast({
      title: "TODO",
      description: "Prepare agreement API will be integrated here.",
      color: "warning",
    });

    prepareAgreementModal.onClose();
  };

  const handleSendToOperation = (rowData) => {
    console.log("CALL API: send agreement to operation", {
      id: rowData.id,
    });

    addToast({
      title: "TODO",
      description: "Send to Operation API will be integrated here.",
      color: "warning",
    });
  };

  const handleSendToVendor = (rowData) => {
    console.log("CALL API: send agreement to vendor", {
      id: rowData.id,
    });

    addToast({
      title: "TODO",
      description: "Send to Vendor API will be integrated here.",
      color: "warning",
    });
  };

  const handleOpenDecision = (rowData, decision) => {
    setSelectedRequest(rowData);
    setDecisionData({
      decision,
      decisionBy: "",
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

    console.log("CALL API: agreement decision", {
      id: selectedRequest.id,
      data: {
        decision: decisionData.decision,
        decisionBy: Number(decisionData.decisionBy),
        remarks: decisionData.remarks,
      },
    });

    addToast({
      title: "TODO",
      description: "Agreement decision API will be integrated here.",
      color: "warning",
    });

    decisionModal.onClose();
  };

  const canPrepareAgreement = (status) =>
    status === "SERVICE_AGREEMENT_REQUESTED" || status === "PENDING";

  const canSendToOperation = (status) =>
    status === "AGREEMENT_PREPARED_BY_LEGAL";

  const canSendToVendor = (status) => status === "AGREEMENT_SENT_TO_OPERATION";

  const canTakeDecision = (status) => status === "AGREEMENT_SENT_TO_VENDOR";

  const renderCell = useCallback((rowData, columnKey) => {
    const status = rowData?.status;

    switch (columnKey) {
      case "request":
        return (
          <div className="flex flex-col">
            <span className="font-semibold text-foreground">
              {rowData?.legalRequestTitle || "-"}
            </span>
            <span className="text-xs text-default-500">
              ID: {rowData?.id || "-"}
            </span>
            <span className="text-xs text-default-500">
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
                {rowData?.quotationNumber || rowData?.vendorQuotationId || "-"}
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

      case "agreement":
        return rowData?.agreementFileUrl ? (
          <a
            href={rowData.agreementFileUrl}
            target="_blank"
            rel="noreferrer"
            className="text-xs font-medium text-primary"
          >
            View Agreement
          </a>
        ) : (
          <Chip size="sm" variant="flat">
            Not Prepared
          </Chip>
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
                key="prepareAgreement"
                startContent={<Upload size={15} />}
                onPress={() => handleOpenPrepareAgreement(rowData)}
                isDisabled={!canPrepareAgreement(status)}
              >
                Prepare Agreement
              </DropdownItem>

              <DropdownItem
                key="sendToOperation"
                startContent={<Send size={15} />}
                onPress={() => handleSendToOperation(rowData)}
                isDisabled={!canSendToOperation(status)}
              >
                Send To Operation
              </DropdownItem>

              <DropdownItem
                key="sendToVendor"
                startContent={<Send size={15} />}
                onPress={() => handleSendToVendor(rowData)}
                isDisabled={!canSendToVendor(status)}
              >
                Send To Vendor
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
  }, []);

  const topContent = (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">
            Vendor Legal Requests
          </h1>
          <p className="text-sm text-default-500">
            Service agreement preparation requests from procurement/onboarding.
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

            <ModalBody className="space-y-4 py-5">
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

              {selectedRequest?.agreementFileUrl && (
                <a
                  href={selectedRequest.agreementFileUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-sm font-medium text-primary"
                >
                  View Agreement
                </a>
              )}
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
        isOpen={prepareAgreementModal.isOpen}
        onOpenChange={prepareAgreementModal.onOpenChange}
        size="2xl"
        isDismissable={false}
      >
        <ModalContent>
          <>
            <ModalHeader className="border-b">Prepare Agreement</ModalHeader>

            <ModalBody className="space-y-4 py-5">
              <Input
                label="Legal Request"
                value={selectedRequest?.legalRequestTitle || "-"}
                isReadOnly
              />

              <FileUploader
                isRequired
                label="Agreement File"
                value={prepareAgreementData.agreementFileUrl}
                onChange={(value) =>
                  setPrepareAgreementData((prev) => ({
                    ...prev,
                    agreementFileUrl: value?.filePath || value?.url || value,
                  }))
                }
              />

              <Input
                label="Prepared By User ID"
                isRequired
                value={prepareAgreementData.preparedBy}
                onChange={(e) =>
                  setPrepareAgreementData((prev) => ({
                    ...prev,
                    preparedBy: e.target.value.replace(/\D/g, ""),
                  }))
                }
              />

              <Textarea
                label="Remarks"
                value={prepareAgreementData.remarks}
                onChange={(e) =>
                  setPrepareAgreementData((prev) => ({
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
                  prepareAgreementModal.onClose();
                  setSelectedRequest(null);
                }}
              >
                Cancel
              </Button>

              <Button color="primary" onPress={handlePrepareAgreementSubmit}>
                Submit
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
                }}
              >
                Cancel
              </Button>

              <Button
                color={
                  decisionData.decision === "AGREED" ? "success" : "danger"
                }
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
