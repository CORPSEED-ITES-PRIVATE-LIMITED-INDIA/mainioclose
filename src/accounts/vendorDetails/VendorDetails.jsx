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
import { useParams } from "react-router-dom";
import {
  CheckCircle,
  ChevronDown,
  EllipsisVertical,
  ExternalLink,
  Eye,
  FileText,
  RefreshCw,
  Search,
  XCircle,
} from "lucide-react";
import dayjs from "dayjs";

import {
  approveVendorSubmission,
  getAllVendorDetails,
  rejectVendorSubmission,
} from "../../toolkit/slices/accountSlice";

const columns = [
  { name: "VENDOR", uid: "vendor" },
  { name: "RFQ / QUOTATION", uid: "rfqQuotation" },
  { name: "BANK DETAILS", uid: "bankDetails" },
  { name: "DOCUMENTS", uid: "documents" },
  { name: "STATUS", uid: "status" },
  { name: "DATES", uid: "dates" },
  { name: "ACTIONS", uid: "actions" },
];

const INITIAL_VISIBLE_COLUMNS = [
  "vendor",
  "rfqQuotation",
  "bankDetails",
  "documents",
  "status",
  "dates",
  "actions",
];

const documentConfig = [
  { key: "gstDetailsUrl", label: "GST Details", mandatory: true },
  { key: "vendorSetupFormUrl", label: "Vendor Setup Form", mandatory: true },
  { key: "cancelChequeUrl", label: "Cancel Cheque", mandatory: true },
  { key: "panDetailsUrl", label: "PAN Details", mandatory: true },
  { key: "itrLastFinancialYearUrl", label: "ITR Last FY", mandatory: false },
  { key: "partnershipOrCoiUrl", label: "Partnership / COI", mandatory: false },
  { key: "deedOrMsmeUrl", label: "Deed / MSME", mandatory: false },
  { key: "balanceSheetUrl", label: "Balance Sheet", mandatory: false },
];

const formatDateTime = (value) => {
  if (!value) return "-";

  return dayjs(value).isValid()
    ? dayjs(value).format("DD-MM-YYYY hh:mm A")
    : "-";
};

const getStatusColor = (status) => {
  const value = String(status || "").toUpperCase();

  if (value === "APPROVED") return "success";
  if (value === "REJECTED") return "danger";
  if (value === "PENDING") return "warning";

  return "default";
};

const normalizeList = (response) => {
  if (Array.isArray(response)) return response;
  if (Array.isArray(response?.data)) return response.data;
  if (Array.isArray(response?.content)) return response.content;
  if (Array.isArray(response?.data?.content)) return response.data.content;
  if (Array.isArray(response?.response)) return response.response;

  return [];
};

const isValidUrl = (value) => Boolean(String(value || "").trim());

const getResolvedUserId = (currentUser, routeUserId) => {
  return (
    currentUser?.id ||
    currentUser?.userId ||
    currentUser?.employeeId ||
    routeUserId ||
    ""
  );
};

const DetailItem = ({ label, value }) => {
  return (
    <div className="rounded-xl border bg-white p-3">
      <p className="text-xs text-default-500">{label}</p>
      <p className="mt-1 break-words text-sm font-semibold text-gray-900">
        {value || "-"}
      </p>
    </div>
  );
};

const DocumentLink = ({ label, url, mandatory = false }) => {
  const hasUrl = isValidUrl(url);

  if (!hasUrl) {
    return (
      <div className="flex items-center justify-between gap-2 rounded-lg border border-dashed bg-gray-50 px-3 py-2 text-xs">
        <span className="font-medium text-default-500">{label}</span>
        <Chip size="sm" variant="flat" color={mandatory ? "danger" : "default"}>
          {mandatory ? "Missing" : "Optional"}
        </Chip>
      </div>
    );
  }

  return (
    <a
      href={url}
      target="_blank"
      rel="noreferrer"
      className="flex items-center justify-between gap-2 rounded-lg border bg-white px-3 py-2 text-xs font-semibold text-primary hover:bg-primary-50"
    >
      <span className="line-clamp-1">{label}</span>
      <ExternalLink size={13} className="shrink-0" />
    </a>
  );
};

const VendorDetails = () => {
  const dispatch = useDispatch();
  const { userId } = useParams();

  const loading = useSelector((state) => state.account.loading);
  const vendorsDetailsResponse = useSelector(
    (state) => state.account.vendorsDetails,
  );
  const currentUser = useSelector((state) => state.auth.currentUser);

  const viewModal = useDisclosure();
  const decisionModal = useDisclosure();

  const [selectedRecord, setSelectedRecord] = useState(null);
  const [decisionRecord, setDecisionRecord] = useState(null);
  const [decisionType, setDecisionType] = useState("");
  const [accountsRemark, setAccountsRemark] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [filterValue, setFilterValue] = useState("");
  const [visibleColumns, setVisibleColumns] = useState(
    new Set(INITIAL_VISIBLE_COLUMNS),
  );
  const [filteration, setFilteration] = useState({
    page: 1,
    size: 10,
  });

  const resolvedUserId = useMemo(
    () => getResolvedUserId(currentUser, userId),
    [currentUser, userId],
  );

  const vendorDetails = useMemo(() => {
    return normalizeList(vendorsDetailsResponse);
  }, [vendorsDetailsResponse]);

  const headerColumns = useMemo(() => {
    if (visibleColumns === "all") return columns;

    return columns.filter((column) =>
      Array.from(visibleColumns).includes(column.uid),
    );
  }, [visibleColumns]);

  const filteredItems = useMemo(() => {
    let filtered = [...vendorDetails];

    if (filterValue) {
      const search = filterValue.toLowerCase();

      filtered = filtered.filter((item) =>
        [
          item?.id,
          item?.vendorFinalizationId,
          item?.vendorId,
          item?.vendorName,
          item?.vendorEmail,
          item?.vendorMobile,
          item?.rfqNumber,
          item?.quotationNumber,
          item?.name,
          item?.number,
          item?.email,
          item?.aadhar,
          item?.authorizedSignatoryName,
          item?.authorizedSignatoryNumber,
          item?.authorizedSignatoryEmail,
          item?.authorizedSignatoryAadhar,
          item?.accountHolderName,
          item?.accountNumber,
          item?.ifsc,
          item?.swiftCode,
          item?.branchAddress,
          item?.remarks,
          item?.status,
          item?.accountsRemark,
        ]
          .filter(Boolean)
          .some((value) => String(value).toLowerCase().includes(search)),
      );
    }

    return filtered;
  }, [vendorDetails, filterValue]);

  const pages = Math.ceil(filteredItems.length / filteration.size) || 1;

  const paginatedItems = useMemo(() => {
    const start = (filteration.page - 1) * filteration.size;
    const end = start + filteration.size;

    return filteredItems.slice(start, end);
  }, [filteredItems, filteration.page, filteration.size]);

  const fetchVendorDetails = useCallback(() => {
    dispatch(getAllVendorDetails()).then((resp) => {
      if (resp.meta.requestStatus !== "fulfilled") {
        addToast({
          title: "ERROR",
          description:
            resp?.payload?.message ||
            resp?.payload?.data?.message ||
            resp?.payload ||
            "Failed to fetch vendor details.",
          color: "danger",
        });
      }
    });
  }, [dispatch]);

  useEffect(() => {
    fetchVendorDetails();
  }, [fetchVendorDetails]);

  const handleView = useCallback(
    (record) => {
      setSelectedRecord(record);
      viewModal.onOpen();
    },
    [viewModal],
  );

  const handleOpenDecision = useCallback(
    (record, type) => {
      if (!record?.id) {
        addToast({
          title: "ERROR",
          description: "Submission ID is missing.",
          color: "danger",
        });
        return;
      }

      if (!resolvedUserId) {
        addToast({
          title: "ERROR",
          description: "User ID is missing. Please login again.",
          color: "danger",
        });
        return;
      }

      setDecisionRecord(record);
      setDecisionType(type);
      setAccountsRemark("");
      decisionModal.onOpen();
    },
    [decisionModal, resolvedUserId],
  );

  const closeDecisionModal = useCallback(() => {
    decisionModal.onClose();
    setDecisionRecord(null);
    setDecisionType("");
    setAccountsRemark("");
  }, [decisionModal]);

  const handleSubmitDecision = useCallback(() => {
    if (!decisionRecord?.id) {
      addToast({
        title: "ERROR",
        description: "Submission ID is missing.",
        color: "danger",
      });
      return;
    }

    if (!resolvedUserId) {
      addToast({
        title: "ERROR",
        description: "User ID is missing. Please login again.",
        color: "danger",
      });
      return;
    }

    if (decisionType === "REJECT" && !accountsRemark.trim()) {
      addToast({
        title: "ERROR",
        description: "Please enter rejection remark.",
        color: "danger",
      });
      return;
    }

    const payload = {
      submissionId: Number(decisionRecord.id),
      data: {
        userId: Number(resolvedUserId),
        accountsRemark: accountsRemark.trim(),
      },
    };

    const action =
      decisionType === "APPROVE"
        ? approveVendorSubmission(payload)
        : rejectVendorSubmission(payload);

    setActionLoading(true);

    dispatch(action).then((resp) => {
      setActionLoading(false);

      if (resp.meta.requestStatus === "fulfilled") {
        addToast({
          title: "SUCCESS",
          description:
            decisionType === "APPROVE"
              ? "Vendor submission approved successfully."
              : "Vendor submission rejected successfully.",
          color: "success",
        });

        closeDecisionModal();
        viewModal.onClose();
        setSelectedRecord(null);
        fetchVendorDetails();
      } else {
        addToast({
          title: "ERROR",
          description:
            resp?.payload?.message ||
            resp?.payload?.data?.message ||
            resp?.payload ||
            `Failed to ${decisionType === "APPROVE" ? "approve" : "reject"} vendor submission.`,
          color: "danger",
        });
      }
    });
  }, [
    accountsRemark,
    closeDecisionModal,
    decisionRecord,
    decisionType,
    dispatch,
    fetchVendorDetails,
    resolvedUserId,
    viewModal,
  ]);

  const onSearchChange = useCallback((value) => {
    setFilterValue(value || "");
    setFilteration((prev) => ({
      ...prev,
      page: 1,
    }));
  }, []);

  const onClear = useCallback(() => {
    setFilterValue("");
    setFilteration((prev) => ({
      ...prev,
      page: 1,
    }));
  }, []);

  const onRowsPerPageChange = useCallback((e) => {
    setFilteration({
      page: 1,
      size: Number(e.target.value),
    });
  }, []);

  const renderCell = useCallback(
    (rowData, columnKey) => {
      const status = String(rowData?.status || "PENDING").toUpperCase();
      const isPending = status === "PENDING";
      const uploadedDocs = documentConfig.filter((doc) =>
        isValidUrl(rowData?.[doc.key]),
      );
      const missingMandatoryDocs = documentConfig.filter(
        (doc) => doc.mandatory && !isValidUrl(rowData?.[doc.key]),
      );

      switch (columnKey) {
        case "vendor":
          return (
            <div className="flex min-w-[220px] flex-col gap-1">
              <span className="text-[12.5px] font-semibold text-foreground">
                {rowData?.vendorName || rowData?.name || "-"}
              </span>

              <span className="text-[11.5px] text-default-500">
                Vendor ID: {rowData?.vendorId || "-"}
              </span>

              <span className="line-clamp-1 text-[11.5px] text-default-500">
                {rowData?.vendorEmail || rowData?.email || "-"}
              </span>

              <span className="text-[11.5px] text-default-500">
                {rowData?.vendorMobile || rowData?.number || "-"}
              </span>

              {(rowData?.authorizedSignatoryName ||
                rowData?.authorizedSignatoryEmail) && (
                <span className="line-clamp-1 text-[11.5px] text-default-500">
                  Auth:{" "}
                  {rowData?.authorizedSignatoryName ||
                    rowData?.authorizedSignatoryEmail}
                </span>
              )}
            </div>
          );

        case "rfqQuotation":
          return (
            <div className="flex min-w-[210px] flex-col gap-2">
              <div>
                <p className="text-[11.5px] text-default-500">RFQ</p>
                <p className="text-[12.5px] font-semibold">
                  {rowData?.rfqNumber || `RFQ ID: ${rowData?.rfqId || "-"}`}
                </p>
              </div>

              <div>
                <p className="text-[11.5px] text-default-500">Quotation</p>
                <p className="text-[12.5px] font-medium">
                  {rowData?.quotationNumber || "-"}
                </p>
              </div>

              <span className="text-[11.5px] text-default-500">
                Finalization ID: {rowData?.vendorFinalizationId || "-"}
              </span>
            </div>
          );

        case "bankDetails":
          return (
            <div className="flex min-w-[230px] flex-col gap-1 text-[11.5px]">
              <span>
                Holder: <b>{rowData?.accountHolderName || "-"}</b>
              </span>
              <span>
                A/C: <b>{rowData?.accountNumber || "-"}</b>
              </span>
              <span>
                IFSC: <b>{rowData?.ifsc || "-"}</b>
              </span>
              <span className="line-clamp-1 text-default-500">
                Branch: {rowData?.branchAddress || "-"}
              </span>
            </div>
          );

        case "documents":
          return (
            <div className="flex min-w-[180px] flex-col gap-1">
              <Chip
                size="sm"
                color={missingMandatoryDocs.length ? "warning" : "success"}
                variant="flat"
                className="w-fit"
              >
                {uploadedDocs.length}/{documentConfig.length} Uploaded
              </Chip>

              <div className="mt-1 flex flex-wrap gap-1">
                {documentConfig.slice(0, 4).map((doc) => (
                  <Tooltip key={doc.key} content={doc.label}>
                    <span>
                      <Chip
                        size="sm"
                        color={
                          isValidUrl(rowData?.[doc.key]) ? "success" : "default"
                        }
                        variant="flat"
                      >
                        {doc.label.split(" ")[0]}
                      </Chip>
                    </span>
                  </Tooltip>
                ))}
              </div>

              <Button
                size="sm"
                variant="light"
                color="primary"
                className="mt-1 w-fit px-0 text-[11.5px]"
                onPress={() => handleView(rowData)}
              >
                View all documents
              </Button>
            </div>
          );

        case "status":
          return (
            <div className="flex min-w-[150px] flex-col gap-1">
              <Chip
                size="sm"
                color={getStatusColor(rowData?.status)}
                variant="flat"
              >
                {rowData?.status || "PENDING"}
              </Chip>

              {rowData?.accountsRemark && (
                <Tooltip content={rowData.accountsRemark}>
                  <span className="line-clamp-1 max-w-[160px] text-[11.5px] text-default-500">
                    {rowData.accountsRemark}
                  </span>
                </Tooltip>
              )}

              <span className="text-[11.5px] text-default-500">
                Verified By: {rowData?.accountsVerifiedBy || "-"}
              </span>
            </div>
          );

        case "dates":
          return (
            <div className="flex min-w-[180px] flex-col gap-1 text-[11.5px]">
              <span>
                Sent: <b>{formatDateTime(rowData?.sentToAccountsDate)}</b>
              </span>
              <span className="text-default-500">
                Verified: {formatDateTime(rowData?.accountsVerifiedDate)}
              </span>
              <span className="text-default-500">
                Created: {formatDateTime(rowData?.createdDate)}
              </span>
            </div>
          );

        case "actions":
          return (
            <div className="flex justify-center">
              <Dropdown>
                <DropdownTrigger>
                  <Button size="sm" isIconOnly variant="light">
                    <EllipsisVertical className="w-4 h-4" />
                  </Button>
                </DropdownTrigger>

                <DropdownMenu aria-label="Vendor accounts actions">
                  <DropdownItem
                    key="view"
                    startContent={<Eye size={15} />}
                    onPress={() => handleView(rowData)}
                  >
                    View Details
                  </DropdownItem>

                  <DropdownItem
                    key="approve"
                    startContent={<CheckCircle size={15} />}
                    color="success"
                    isDisabled={!isPending || actionLoading}
                    onPress={() => handleOpenDecision(rowData, "APPROVE")}
                  >
                    Approve
                  </DropdownItem>

                  <DropdownItem
                    key="reject"
                    startContent={<XCircle size={15} />}
                    color="danger"
                    isDisabled={!isPending || actionLoading}
                    onPress={() => handleOpenDecision(rowData, "REJECT")}
                  >
                    Reject
                  </DropdownItem>

                  {isValidUrl(rowData?.vendorSetupFormUrl) && (
                    <DropdownItem
                      key="openVendorSetupForm"
                      startContent={<FileText size={15} />}
                      href={rowData.vendorSetupFormUrl}
                      target="_blank"
                    >
                      Open Vendor Setup Form
                    </DropdownItem>
                  )}
                </DropdownMenu>
              </Dropdown>
            </div>
          );

        default:
          return rowData?.[columnKey] || "-";
      }
    },
    [actionLoading, handleOpenDecision, handleView],
  );

  const topContent = useMemo(() => {
    return (
      <div className="flex flex-col gap-2">
        <div className="flex justify-between gap-2 items-center flex-wrap">
          <Input
            isClearable
            size="sm"
            className="w-full sm:max-w-[280px]"
            classNames={{ inputWrapper: "h-8 min-h-8" }}
            placeholder="Search vendor, RFQ, bank, status..."
            startContent={<Search className="w-4 h-4 text-default-400" />}
            value={filterValue}
            onClear={onClear}
            onValueChange={onSearchChange}
          />

          <div className="flex flex-wrap gap-1.5">
            <Button
              variant="flat"
              startContent={<RefreshCw className="w-3.5 h-3.5" />}
              onPress={fetchVendorDetails}
            >
              Refresh
            </Button>

            <Dropdown>
              <DropdownTrigger className="hidden sm:flex">
                <Button
                  endContent={<ChevronDown className="w-3.5 h-3.5" />}
                  variant="flat"
                >
                  Columns
                </Button>
              </DropdownTrigger>

              <DropdownMenu
                disallowEmptySelection
                aria-label="Table Columns"
                closeOnSelect={false}
                selectedKeys={visibleColumns}
                selectionMode="multiple"
                onSelectionChange={setVisibleColumns}
              >
                {columns.map((column) => (
                  <DropdownItem key={column.uid} className="capitalize">
                    {column.name}
                  </DropdownItem>
                ))}
              </DropdownMenu>
            </Dropdown>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-default-400 text-[12.5px]">
            Total {filteredItems.length} vendor accounts submissions
          </span>

          <label className="flex items-center gap-1 text-default-400 text-[12.5px]">
            Rows per page:
            <select
              className="bg-transparent outline-hidden text-default-400 text-[12.5px] cursor-pointer"
              onChange={onRowsPerPageChange}
              value={filteration.size}
            >
              <option value="5">5</option>
              <option value="10">10</option>
              <option value="25">25</option>
              <option value="50">50</option>
            </select>
          </label>
        </div>
      </div>
    );
  }, [
    filterValue,
    visibleColumns,
    filteredItems.length,
    filteration.size,
    onClear,
    onSearchChange,
    onRowsPerPageChange,
    fetchVendorDetails,
  ]);

  const bottomContent = useMemo(() => {
    return (
      <div className="py-1.5 px-1 flex items-center justify-between">
        <span className="text-default-400 text-[12.5px]">
          Page {filteration.page} of {pages}
        </span>

        <Pagination
          isCompact
          showControls
          color="primary"
          page={filteration.page}
          total={pages}
          onChange={(page) => {
            setFilteration((prev) => ({
              ...prev,
              page,
            }));
          }}
        />
      </div>
    );
  }, [filteration.page, pages]);

  return (
    <div className="flex flex-col gap-2">
      <h1 className="font-sans text-lg font-semibold mb-2 shrink-0">
        Vendor Accounts Submissions
      </h1>
      <p className="text-default-500 text-[12.5px] -mt-2 mb-1">
        KYC, bank and document details sent to accounts, latest first.
      </p>

      <Table
        isHeaderSticky
        removeWrapper={false}
        aria-label="Vendor accounts submissions table"
        bottomContent={bottomContent}
        bottomContentPlacement="outside"
        topContent={topContent}
        topContentPlacement="outside"
        classNames={{
          base: "gap-2.5",
          wrapper:
            "max-h-[calc(100vh-320px)] w-full overflow-y-auto rounded-lg border border-gray-200 dark:border-white/10 shadow-none p-0",
          table: "w-full",
          thead: "[&>tr]:first:rounded-none",
          th: "h-8 py-0 text-[11.5px] tracking-wide bg-gray-50 dark:bg-neutral-900 text-default-500 first:rounded-none last:rounded-none border-b border-gray-200 dark:border-white/10",
          td: "py-1.5 text-[12.5px]",
        }}
      >
        <TableHeader columns={headerColumns}>
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
          emptyContent={
            loading === "pending"
              ? "Loading..."
              : "No vendor accounts submissions found"
          }
          items={paginatedItems}
        >
          {(item) => (
            <TableRow
              key={item?.id || `${item?.vendorId}-${item?.quotationId}`}
            >
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
        size="5xl"
        scrollBehavior="inside"
      >
        <ModalContent>
          <ModalHeader className="border-b">
            Vendor Accounts Submission Details
          </ModalHeader>

          <ModalBody className="bg-gray-50 p-4">
            {selectedRecord && (
              <div className="space-y-4">
                <div className="rounded-xl border bg-white p-4 shadow-sm">
                  <div className="mb-3 flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                    <div>
                      <h2 className="text-lg font-semibold text-gray-900">
                        {selectedRecord?.vendorName ||
                          selectedRecord?.name ||
                          "-"}
                      </h2>
                      <p className="text-sm text-default-500">
                        {selectedRecord?.vendorEmail ||
                          selectedRecord?.email ||
                          "-"}{" "}
                        {selectedRecord?.vendorMobile || selectedRecord?.number
                          ? `• ${selectedRecord?.vendorMobile || selectedRecord?.number}`
                          : ""}
                      </p>
                    </div>

                    <Chip
                      color={getStatusColor(selectedRecord?.status)}
                      variant="flat"
                    >
                      {selectedRecord?.status || "PENDING"}
                    </Chip>
                  </div>

                  <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
                    <DetailItem
                      label="Submission ID"
                      value={selectedRecord?.id}
                    />
                    <DetailItem
                      label="Finalization ID"
                      value={selectedRecord?.vendorFinalizationId}
                    />
                    <DetailItem
                      label="Vendor ID"
                      value={selectedRecord?.vendorId}
                    />
                    <DetailItem
                      label="RFQ Number"
                      value={selectedRecord?.rfqNumber}
                    />
                    <DetailItem
                      label="Quotation Number"
                      value={selectedRecord?.quotationNumber}
                    />
                    <DetailItem label="RFQ ID" value={selectedRecord?.rfqId} />
                    <DetailItem
                      label="Quotation ID"
                      value={selectedRecord?.quotationId}
                    />
                    <DetailItem
                      label="Deleted"
                      value={selectedRecord?.deleted ? "Yes" : "No"}
                    />
                  </div>
                </div>

                <div className="rounded-xl border bg-white p-4 shadow-sm">
                  <h3 className="mb-3 text-sm font-semibold text-gray-900">
                    Vendor KYC Details
                  </h3>

                  <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
                    <DetailItem label="Name" value={selectedRecord?.name} />
                    <DetailItem label="Number" value={selectedRecord?.number} />
                    <DetailItem label="Email" value={selectedRecord?.email} />
                    <DetailItem label="Aadhar" value={selectedRecord?.aadhar} />
                  </div>
                </div>

                <div className="rounded-xl border bg-white p-4 shadow-sm">
                  <h3 className="mb-3 text-sm font-semibold text-gray-900">
                    Authorized Signatory Details
                  </h3>

                  <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
                    <DetailItem
                      label="Name"
                      value={selectedRecord?.authorizedSignatoryName}
                    />
                    <DetailItem
                      label="Number"
                      value={selectedRecord?.authorizedSignatoryNumber}
                    />
                    <DetailItem
                      label="Email"
                      value={selectedRecord?.authorizedSignatoryEmail}
                    />
                    <DetailItem
                      label="Aadhar"
                      value={selectedRecord?.authorizedSignatoryAadhar}
                    />
                  </div>
                </div>

                <div className="rounded-xl border bg-white p-4 shadow-sm">
                  <h3 className="mb-3 text-sm font-semibold text-gray-900">
                    Bank Details
                  </h3>

                  <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
                    <DetailItem
                      label="A/C Holder Name"
                      value={selectedRecord?.accountHolderName}
                    />
                    <DetailItem
                      label="A/C Number"
                      value={selectedRecord?.accountNumber}
                    />
                    <DetailItem label="IFSC" value={selectedRecord?.ifsc} />
                    <DetailItem
                      label="Swift Code"
                      value={selectedRecord?.swiftCode}
                    />
                    <div className="md:col-span-4">
                      <DetailItem
                        label="Branch Address"
                        value={selectedRecord?.branchAddress}
                      />
                    </div>
                  </div>
                </div>

                <div className="rounded-xl border bg-white p-4 shadow-sm">
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <h3 className="text-sm font-semibold text-gray-900">
                      Documents
                    </h3>
                    <Chip size="sm" variant="flat">
                      4 Mandatory + Optional
                    </Chip>
                  </div>

                  <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-4">
                    {documentConfig.map((doc) => (
                      <DocumentLink
                        key={doc.key}
                        label={doc.label}
                        url={selectedRecord?.[doc.key]}
                        mandatory={doc.mandatory}
                      />
                    ))}
                  </div>
                </div>

                <div className="rounded-xl border bg-white p-4 shadow-sm">
                  <h3 className="mb-3 text-sm font-semibold text-gray-900">
                    Accounts Review
                  </h3>

                  <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
                    <DetailItem label="Status" value={selectedRecord?.status} />
                    <DetailItem
                      label="Sent To Accounts By"
                      value={selectedRecord?.sentToAccountsBy}
                    />
                    <DetailItem
                      label="Sent Date"
                      value={formatDateTime(selectedRecord?.sentToAccountsDate)}
                    />
                    <DetailItem
                      label="Accounts Verified By"
                      value={selectedRecord?.accountsVerifiedBy}
                    />
                    <DetailItem
                      label="Accounts Verified Date"
                      value={formatDateTime(
                        selectedRecord?.accountsVerifiedDate,
                      )}
                    />
                    <DetailItem
                      label="Accounts Remark"
                      value={selectedRecord?.accountsRemark}
                    />
                    <DetailItem
                      label="Remarks"
                      value={selectedRecord?.remarks}
                    />
                    <DetailItem
                      label="Updated Date"
                      value={formatDateTime(selectedRecord?.updatedDate)}
                    />
                  </div>
                </div>
              </div>
            )}
          </ModalBody>

          <ModalFooter className="border-t">
            {String(selectedRecord?.status || "").toUpperCase() ===
              "PENDING" && (
              <>
                <Button
                  color="danger"
                  variant="flat"
                  startContent={<XCircle size={16} />}
                  isDisabled={actionLoading}
                  onPress={() => handleOpenDecision(selectedRecord, "REJECT")}
                >
                  Reject
                </Button>
                <Button
                  color="success"
                  startContent={<CheckCircle size={16} />}
                  isDisabled={actionLoading}
                  onPress={() => handleOpenDecision(selectedRecord, "APPROVE")}
                >
                  Approve
                </Button>
              </>
            )}

            <Button
              variant="flat"
              onPress={() => {
                viewModal.onClose();
                setSelectedRecord(null);
              }}
            >
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <Modal
        isOpen={decisionModal.isOpen}
        onOpenChange={(open) => {
          decisionModal.onOpenChange(open);
          if (!open) {
            setDecisionRecord(null);
            setDecisionType("");
            setAccountsRemark("");
          }
        }}
        size="lg"
        isDismissable={!actionLoading}
      >
        <ModalContent>
          <ModalHeader className="border-b">
            {decisionType === "APPROVE" ? "Approve" : "Reject"} Vendor
            Submission
          </ModalHeader>

          <ModalBody className="space-y-4 p-4">
            <div className="rounded-xl border bg-gray-50 p-3">
              <p className="text-sm font-semibold text-gray-900">
                {decisionRecord?.vendorName || decisionRecord?.name || "-"}
              </p>
              <p className="text-xs text-default-500">
                Submission ID: {decisionRecord?.id || "-"} • RFQ:{" "}
                {decisionRecord?.rfqNumber || "-"}
              </p>
            </div>

            <Textarea
              label="Accounts Remark"
              placeholder={
                decisionType === "APPROVE"
                  ? "Enter approval remark if any"
                  : "Enter rejection reason"
              }
              minRows={4}
              value={accountsRemark}
              onChange={(event) => setAccountsRemark(event.target.value)}
              isRequired={decisionType === "REJECT"}
            />
          </ModalBody>

          <ModalFooter className="border-t">
            <Button
              variant="flat"
              isDisabled={actionLoading}
              onPress={closeDecisionModal}
            >
              Cancel
            </Button>
            <Button
              color={decisionType === "APPROVE" ? "success" : "danger"}
              isLoading={actionLoading}
              onPress={handleSubmitDecision}
            >
              {decisionType === "APPROVE" ? "Approve" : "Reject"}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
};

export default VendorDetails;
