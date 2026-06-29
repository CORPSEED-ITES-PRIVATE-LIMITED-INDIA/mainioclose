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
  Tooltip,
  useDisclosure,
} from "@heroui/react";
import { useDispatch, useSelector } from "react-redux";
import {
  ChevronDown,
  EllipsisVertical,
  ExternalLink,
  Eye,
  FileText,
  Search,
} from "lucide-react";
import dayjs from "dayjs";

import { getAllVendorDetails } from "../../toolkit/slices/accountSlice";

const columns = [
  { name: "VENDOR", uid: "vendor" },
  { name: "RFQ / QUOTATION", uid: "rfqQuotation" },
  { name: "FINALIZED WORK", uid: "finalizedWork" },
  { name: "AMOUNT", uid: "amount" },
  { name: "ACCOUNTS STATUS", uid: "accountsStatus" },
  { name: "ATTACHMENT", uid: "attachment" },
  { name: "SENT DATE", uid: "sentDate" },
  { name: "ACTIONS", uid: "actions" },
];

const INITIAL_VISIBLE_COLUMNS = [
  "vendor",
  "rfqQuotation",
  "finalizedWork",
  "amount",
  "accountsStatus",
  "attachment",
  "sentDate",
  "actions",
];

const formatDateTime = (value) => {
  if (!value) return "-";
  return dayjs(value).isValid()
    ? dayjs(value).format("DD-MM-YYYY hh:mm A")
    : "-";
};

const formatAmount = (value) => {
  if (value === null || value === undefined || value === "") return "-";

  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(Number(value || 0));
};

const getStatusColor = (status) => {
  const value = String(status || "").toUpperCase();

  if (value === "ONBOARDING_STARTED") return "primary";
  if (value === "AGREEMENT_SENT_TO_VENDOR") return "success";
  if (value === "COMPLETED") return "success";
  if (value === "REJECTED" || value === "CANCELLED") return "danger";
  if (value === "DRAFT") return "warning";

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

const VendorDetails = () => {
  const dispatch = useDispatch();

  const loading = useSelector((state) => state.account.loading);
  const vendorsDetailsResponse = useSelector(
    (state) => state.account.vendorsDetails,
  );

  const viewModal = useDisclosure();

  const [selectedRecord, setSelectedRecord] = useState(null);
  const [filterValue, setFilterValue] = useState("");
  const [visibleColumns, setVisibleColumns] = useState(
    new Set(INITIAL_VISIBLE_COLUMNS),
  );
  const [filteration, setFilteration] = useState({
    page: 1,
    size: 10,
  });

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
          item?.vendorName,
          item?.vendorEmail,
          item?.vendorMobile,
          item?.rfqNumber,
          item?.quotationNumber,
          item?.quotationItemName,
          item?.description,
          item?.remarks,
          item?.finalVendorRemarks,
          item?.status,
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
      switch (columnKey) {
        case "vendor":
          return (
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-foreground">
                {rowData?.vendorName || "-"}
              </span>

              <span className="text-xs text-default-500">
                ID: {rowData?.vendorId || "-"}
              </span>

              <span className="text-xs text-default-500">
                {rowData?.vendorEmail || "-"}
              </span>

              <span className="text-xs text-default-500">
                {rowData?.vendorMobile || "-"}
              </span>
            </div>
          );

        case "rfqQuotation":
          return (
            <div className="flex flex-col gap-1">
              <div>
                <p className="text-xs text-default-500">RFQ</p>
                <p className="text-sm font-semibold">
                  {rowData?.rfqNumber || `RFQ ID: ${rowData?.rfqId || "-"}`}
                </p>
              </div>

              <div>
                <p className="text-xs text-default-500">Quotation</p>
                <p className="text-sm font-medium">
                  {rowData?.quotationNumber || "-"}
                </p>
              </div>
            </div>
          );

        case "finalizedWork":
          return (
            <div className="max-w-[260px]">
              <p
                className="truncate text-sm font-semibold"
                title={rowData?.quotationItemName}
              >
                {rowData?.quotationItemName || "-"}
              </p>

              <p
                className="mt-1 line-clamp-2 text-xs text-default-500"
                title={rowData?.description}
              >
                {rowData?.description || "-"}
              </p>

              <div className="mt-2 flex flex-wrap gap-1">
                <Chip size="sm" variant="flat">
                  Qty: {rowData?.finalizedQuantity ?? "-"}
                </Chip>
                <Chip size="sm" variant="flat">
                  {rowData?.unit || "-"}
                </Chip>
              </div>
            </div>
          );

        case "amount":
          return (
            <div className="flex flex-col gap-1 text-xs">
              <span>
                Rate:{" "}
                <b className="text-foreground">
                  {formatAmount(rowData?.finalizedUnitRate)}
                </b>
              </span>

              <span>
                Tax:{" "}
                <b className="text-foreground">
                  {formatAmount(rowData?.taxAmount)}
                </b>
              </span>

              <Chip size="sm" color="success" variant="flat">
                Total: {formatAmount(rowData?.totalFinalizedAmount)}
              </Chip>
            </div>
          );

        case "accountsStatus":
          return (
            <div className="flex flex-col gap-1">
              <Chip
                size="sm"
                color={rowData?.sentToAccounts ? "success" : "warning"}
                variant="flat"
              >
                {rowData?.sentToAccounts ? "Sent To Accounts" : "Pending"}
              </Chip>

              {rowData?.status && (
                <Chip
                  size="sm"
                  color={getStatusColor(rowData.status)}
                  variant="flat"
                >
                  {rowData.status}
                </Chip>
              )}

              <span className="text-xs text-default-500">
                By: {rowData?.sentToAccountsBy || "-"}
              </span>
            </div>
          );

        case "attachment":
          return (
            <div className="flex flex-col gap-1 text-xs">
              {rowData?.finalVendorAttachmentUrl ? (
                <a
                  href={rowData.finalVendorAttachmentUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 font-semibold text-primary"
                >
                  Final Vendor Form <ExternalLink size={13} />
                </a>
              ) : (
                <span className="text-default-400">No form attached</span>
              )}

              {rowData?.finalVendorRemarks ? (
                <Tooltip content={rowData.finalVendorRemarks}>
                  <span className="line-clamp-1 max-w-[220px] text-default-500">
                    Remarks: {rowData.finalVendorRemarks}
                  </span>
                </Tooltip>
              ) : (
                <span className="text-default-400">Remarks: -</span>
              )}
            </div>
          );

        case "sentDate":
          return (
            <div className="flex flex-col text-xs">
              <span>{formatDateTime(rowData?.sentToAccountsDate)}</span>
              <span className="text-default-500">
                Finalized: {formatDateTime(rowData?.finalizedDate)}
              </span>
            </div>
          );

        case "actions":
          return (
            <div className="flex justify-center">
              <Dropdown>
                <DropdownTrigger>
                  <Button size="sm" isIconOnly variant="light">
                    <EllipsisVertical size={18} />
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

                  {rowData?.finalVendorAttachmentUrl && (
                    <DropdownItem
                      key="openForm"
                      startContent={<FileText size={15} />}
                      href={rowData.finalVendorAttachmentUrl}
                      target="_blank"
                    >
                      Open Final Form
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
    [handleView],
  );

  const topContent = useMemo(() => {
    return (
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <Input
            isClearable
            className="w-full md:max-w-[35%]"
            placeholder="Search vendor, RFQ, quotation..."
            startContent={<Search size={18} />}
            value={filterValue}
            onClear={onClear}
            onValueChange={onSearchChange}
          />

          <div className="flex flex-wrap justify-end gap-3">
            <Button variant="flat" onPress={fetchVendorDetails}>
              Refresh
            </Button>

            <Dropdown>
              <DropdownTrigger className="hidden sm:flex">
                <Button endContent={<ChevronDown size={16} />} variant="flat">
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
          <span className="text-small text-default-400">
            Total {filteredItems.length} sent to accounts
          </span>

          <label className="flex items-center gap-2 text-small text-default-400">
            Rows per page:
            <select
              className="bg-transparent text-small text-default-400 outline-none"
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
    <>
      <div className="flex flex-col gap-4">
        <div>
          <h1 className="font-sans text-2xl font-medium">
            Vendor Details For Accounts
          </h1>
          <p className="mt-1 text-sm text-default-500">
            Finalized vendor records sent to accounts, latest first.
          </p>
        </div>

        <Table
          isHeaderSticky
          aria-label="Vendor details sent to accounts table"
          bottomContent={bottomContent}
          bottomContentPlacement="outside"
          topContent={topContent}
          topContentPlacement="outside"
          classNames={{
            wrapper: "2xl:max-h-[65vh] md:max-h-[60vh] w-full",
            table: "w-full",
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
                : "No vendor details sent to accounts"
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
      </div>

      <Modal
        isOpen={viewModal.isOpen}
        onOpenChange={viewModal.onOpenChange}
        size="4xl"
        scrollBehavior="inside"
      >
        <ModalContent>
          <ModalHeader className="border-b">
            Vendor Accounts Details
          </ModalHeader>

          <ModalBody className="bg-gray-50 p-4">
            {selectedRecord && (
              <div className="space-y-4">
                <div className="rounded-xl border bg-white p-4 shadow-sm">
                  <div className="mb-3 flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                    <div>
                      <h2 className="text-lg font-semibold text-gray-900">
                        {selectedRecord?.vendorName || "-"}
                      </h2>
                      <p className="text-sm text-default-500">
                        {selectedRecord?.vendorEmail || "-"}{" "}
                        {selectedRecord?.vendorMobile
                          ? `• ${selectedRecord.vendorMobile}`
                          : ""}
                      </p>
                    </div>

                    <Chip
                      color={
                        selectedRecord?.sentToAccounts ? "success" : "warning"
                      }
                      variant="flat"
                    >
                      {selectedRecord?.sentToAccounts
                        ? "Sent To Accounts"
                        : "Pending"}
                    </Chip>
                  </div>

                  <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
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
                    <DetailItem
                      label="Quotation Item"
                      value={selectedRecord?.quotationItemName}
                    />
                  </div>
                </div>

                <div className="rounded-xl border bg-white p-4 shadow-sm">
                  <h3 className="mb-3 text-sm font-semibold text-gray-900">
                    Finalized Commercials
                  </h3>

                  <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
                    <DetailItem
                      label="Finalized Quantity"
                      value={selectedRecord?.finalizedQuantity}
                    />
                    <DetailItem label="Unit" value={selectedRecord?.unit} />
                    <DetailItem
                      label="Finalized Unit Rate"
                      value={formatAmount(selectedRecord?.finalizedUnitRate)}
                    />
                    <DetailItem
                      label="Finalized Amount"
                      value={formatAmount(selectedRecord?.finalizedAmount)}
                    />
                    <DetailItem
                      label="Tax Percent"
                      value={
                        selectedRecord?.taxPercent !== undefined &&
                        selectedRecord?.taxPercent !== null
                          ? `${selectedRecord.taxPercent}%`
                          : "-"
                      }
                    />
                    <DetailItem
                      label="Tax Amount"
                      value={formatAmount(selectedRecord?.taxAmount)}
                    />
                    <DetailItem
                      label="Total Finalized Amount"
                      value={formatAmount(selectedRecord?.totalFinalizedAmount)}
                    />
                    <DetailItem label="Status" value={selectedRecord?.status} />
                  </div>
                </div>

                <div className="rounded-xl border bg-white p-4 shadow-sm">
                  <h3 className="mb-3 text-sm font-semibold text-gray-900">
                    Remarks & Documents
                  </h3>

                  <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                    <DetailItem
                      label="Finalization Reason"
                      value={selectedRecord?.finalizationReason}
                    />
                    <DetailItem
                      label="Remarks"
                      value={selectedRecord?.remarks}
                    />
                    <DetailItem
                      label="Final Vendor Remarks"
                      value={selectedRecord?.finalVendorRemarks}
                    />
                    <DetailItem
                      label="Sent To Accounts Date"
                      value={formatDateTime(selectedRecord?.sentToAccountsDate)}
                    />
                  </div>

                  <div className="mt-4">
                    {selectedRecord?.finalVendorAttachmentUrl ? (
                      <Button
                        as="a"
                        href={selectedRecord.finalVendorAttachmentUrl}
                        target="_blank"
                        rel="noreferrer"
                        color="primary"
                        variant="flat"
                        startContent={<FileText size={16} />}
                        endContent={<ExternalLink size={14} />}
                      >
                        Open Final Vendor Form
                      </Button>
                    ) : (
                      <Chip variant="flat">No final vendor form attached</Chip>
                    )}
                  </div>
                </div>

                <div className="rounded-xl border bg-white p-4 shadow-sm">
                  <h3 className="mb-3 text-sm font-semibold text-gray-900">
                    System Information
                  </h3>

                  <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
                    <DetailItem
                      label="Finalized By"
                      value={selectedRecord?.finalizedBy}
                    />
                    <DetailItem
                      label="Finalized Date"
                      value={formatDateTime(selectedRecord?.finalizedDate)}
                    />
                    <DetailItem
                      label="Sent To Accounts By"
                      value={selectedRecord?.sentToAccountsBy}
                    />
                    <DetailItem
                      label="Created Date"
                      value={formatDateTime(selectedRecord?.createdDate)}
                    />
                    <DetailItem
                      label="Created By"
                      value={selectedRecord?.createdBy}
                    />
                    <DetailItem
                      label="Updated By"
                      value={selectedRecord?.updatedBy}
                    />
                    <DetailItem
                      label="Updated Date"
                      value={formatDateTime(selectedRecord?.updatedDate)}
                    />
                    <DetailItem
                      label="Deleted"
                      value={selectedRecord?.deleted ? "Yes" : "No"}
                    />
                  </div>
                </div>
              </div>
            )}
          </ModalBody>

          <ModalFooter className="border-t">
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
    </>
  );
};

export default VendorDetails;
