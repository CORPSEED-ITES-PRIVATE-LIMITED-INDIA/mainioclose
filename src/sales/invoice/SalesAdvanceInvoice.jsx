import React, { useEffect, useMemo, useState } from "react";

import {
  Button,
  Chip,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Pagination,
  Select,
  SelectItem,
  Spinner,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
  Tooltip,
  useDisclosure,
} from "@heroui/react";

import { Eye, Search } from "lucide-react";

import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";

import { getAllAdvanceTaxInvoiceRequests } from "../../toolkit/slices/accountSlice";
import AdvanceTaxInvoiceView from "../../accounts/AdvanceTaxInvoiceView";

// Adjust this import path to wherever AdvanceTaxInvoiceView actually lives
// relative to this file (e.g. "../AdvanceTaxInvoiceView" or
// "../../components/AdvanceTaxInvoiceView").

const STATUS_OPTIONS = ["PENDING", "APPROVED", "REJECTED", "CANCELLED"];

const PAGE_SIZE_OPTIONS = [10, 20, 50, 100];

const columns = [
  { name: "DATE", uid: "date" },
  { name: "ESTIMATE NUMBER", uid: "estimateNumber" },
  { name: "REQUESTED BY", uid: "requestedBy" },
  { name: "ESTIMATE TOTAL", uid: "estimateTotal" },
  { name: "REQUESTED AMOUNT", uid: "requestedAmount" },
  { name: "APPROVED AMOUNT", uid: "approvedAmount" },
  { name: "REQUEST STATUS", uid: "requestStatus" },
  { name: "INVOICE NUMBER", uid: "invoiceNumber" },
  { name: "INVOICE TOTAL", uid: "invoiceTotal" },
  { name: "RECEIVED", uid: "received" },
  { name: "PENDING RECEIVED", uid: "pendingReceived" },
  { name: "AVAILABLE OUTSTANDING", uid: "availableOutstanding" },
  { name: "OUTSTANDING", uid: "outstanding" },
  { name: "PAYMENT STATUS", uid: "paymentStatus" },
  { name: "REVIEWED BY", uid: "reviewedBy" },
  { name: "REVIEWED AT", uid: "reviewedAt" },
  { name: "MESSAGE", uid: "message" },
];

const actionsColumn = { name: "ACTIONS", uid: "actions" };

/**
 * The list API returns the full invoice snapshot, but the invoice view reads
 * `grandTotal`/`status`/`paymentStatus`, so map the row's invoice* fields.
 */
const buildTaxInvoiceData = (item) => {
  if (!item) return null;

  return {
    ...item,
    id: item?.invoiceId ?? item?.id ?? null,
    publicUuid: item?.invoicePublicUuid ?? item?.publicUuid ?? null,
    status: item?.invoiceStatus ?? item?.status ?? null,
    paymentStatus: item?.invoicePaymentStatus ?? item?.paymentStatus ?? null,
    grandTotal:
      item?.invoiceGrandTotal ?? item?.grandTotal ?? item?.approvedAmount ?? 0,
    lineItems: Array.isArray(item?.lineItems) ? item.lineItems : [],
  };
};

const getLoggedInUserId = () => {
  try {
    const keys = ["user", "authUser", "loggedInUser", "userInfo"];

    for (const key of keys) {
      const value = localStorage.getItem(key);

      if (!value) continue;

      const parsed = JSON.parse(value);

      const id =
        parsed?.id ||
        parsed?.userId ||
        parsed?.data?.id ||
        parsed?.payload?.id ||
        parsed?.user?.id;

      if (id) {
        return Number(id);
      }
    }
  } catch (error) {
    console.error(error);
  }

  return null;
};

const formatAmount = (value) => {
  if (value === null || value === undefined || value === "") {
    return "-";
  }

  const numericValue = Number(value);

  if (Number.isNaN(numericValue)) {
    return "-";
  }

  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(numericValue);
};

const formatDate = (value) => {
  if (!value) return "-";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

const formatDateTime = (value) => {
  if (!value) return "-";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const getStatusColor = (status) => {
  switch (String(status || "").toUpperCase()) {
    case "PENDING":
      return "warning";

    case "APPROVED":
      return "success";

    case "REJECTED":
      return "danger";

    case "CANCELLED":
      return "default";

    default:
      return "default";
  }
};

const getPaymentStatusColor = (status) => {
  switch (String(status || "").toUpperCase()) {
    case "PAID":
      return "success";

    case "PARTIALLY_PAID":
      return "warning";

    case "UNPAID":
      return "danger";

    default:
      return "default";
  }
};

const formatStatus = (status) => {
  return String(status || "-").replaceAll("_", " ");
};

const SalesAdvanceInvoice = () => {
  const dispatch = useDispatch();
  const params = useParams();

  const {
    allAdvanceTaxInvoiceRequests,
    advanceTaxInvoiceRequestsLoading,
    advanceTaxInvoiceRequestsError,
  } = useSelector((state) => state.account || {});

  const [status, setStatus] = useState("PENDING");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [size, setSize] = useState(10);
  const [selectedTaxInvoice, setSelectedTaxInvoice] = useState(null);
  const taxInvoiceModal = useDisclosure();

  // The tax invoice only exists once a request is approved.
  const isApprovedFilter = status === "APPROVED";

  const tableColumns = useMemo(
    () => (isApprovedFilter ? [...columns, actionsColumn] : columns),
    [isApprovedFilter],
  );

  const openTaxInvoiceModal = (item) => {
    setSelectedTaxInvoice(buildTaxInvoiceData(item));
    taxInvoiceModal.onOpen();
  };

  const closeTaxInvoiceModal = () => {
    setSelectedTaxInvoice(null);
    taxInvoiceModal.onClose();
  };

  // Selected row for the "view tax invoice" modal
  const [selectedInvoice, setSelectedInvoice] = useState(null);

  const {
    isOpen: isInvoiceOpen,
    onOpen: onInvoiceOpen,
    onOpenChange: onInvoiceOpenChange,
  } = useDisclosure();

  const userId = useMemo(() => {
    return Number(params?.userId || params?.id || getLoggedInUserId());
  }, [params?.userId, params?.id]);

  const response = allAdvanceTaxInvoiceRequests || {};

  const requests = Array.isArray(response?.content) ? response.content : [];

  const totalElements = Number(response?.totalElements || 0);

  const totalPages = Math.max(Number(response?.totalPages || 0), 1);

  useEffect(() => {
    if (!userId) return;

    dispatch(
      getAllAdvanceTaxInvoiceRequests({
        userId,
        status,
        page: page - 1,
        size,
      }),
    );
  }, [dispatch, userId, status, page, size]);

  const filteredRequests = useMemo(() => {
    const searchText = search.trim().toLowerCase();

    if (!searchText) {
      return requests;
    }

    return requests.filter((item) => {
      const values = [
        item?.requestId,
        item?.publicUuid,
        item?.estimateNumber,
        item?.requestedByName,
        item?.invoiceNumber,
        item?.requestStatus,
        item?.invoicePaymentStatus,
        item?.reviewedByName,
        item?.message,
      ];

      return values.some((value) =>
        String(value || "")
          .toLowerCase()
          .includes(searchText),
      );
    });
  }, [requests, search]);

  const handleStatusChange = (keys) => {
    const value = Array.from(keys)[0];
    if (value) {
      setStatus(value);
      setPage(1);
    }
  };

  const handleSizeChange = (event) => {
    setSize(Number(event.target.value));
    setPage(1);
  };

  const onPreviousPage = () => {
    if (page > 1) setPage(page - 1);
  };

  const onNextPage = () => {
    if (page < totalPages) setPage(page + 1);
  };

  // Opens the tax invoice preview modal for the given row.
  // Assumes the row already carries the invoice snapshot fields consumed by
  // AdvanceTaxInvoiceView (organization/unit snapshot, lineItems, totals...).
  // If your API returns that snapshot under a nested key (e.g. item.invoice),
  // pass that nested object instead of `item` below.
  const handleViewTaxInvoice = (item) => {
    setSelectedInvoice(item);
    onInvoiceOpen();
  };

  const renderCell = (item, columnKey) => {
    switch (columnKey) {
      case "date":
        return (
          <div className="flex flex-col">
            <p className="text-[12.5px] font-medium">
              {formatDate(item?.createdAt)}
            </p>
            <p className="text-[11.5px] text-default-500">
              {formatDateTime(item?.createdAt)}
            </p>
          </div>
        );
      case "estimateNumber":
        return (
          <p className="text-[12.5px] font-semibold text-primary">
            {item?.estimateNumber || "-"}
          </p>
        );
      case "requestedBy":
        return (
          <p className="text-[12.5px] font-medium">
            {item?.requestedByName || "-"}
          </p>
        );
      case "estimateTotal":
        return (
          <p className="whitespace-nowrap text-right text-[12.5px] font-semibold">
            {formatAmount(item?.estimateGrandTotal)}
          </p>
        );
      case "requestedAmount":
        return (
          <p className="whitespace-nowrap text-right text-[12.5px] font-semibold">
            {formatAmount(item?.requestedAmount)}
          </p>
        );
      case "approvedAmount":
        return (
          <p className="whitespace-nowrap text-right text-[12.5px] font-semibold text-success-600">
            {formatAmount(item?.approvedAmount)}
          </p>
        );
      case "requestStatus":
        return (
          <Chip
            size="sm"
            variant="flat"
            color={getStatusColor(item?.requestStatus)}
          >
            {item?.requestStatus || "-"}
          </Chip>
        );
      case "invoiceNumber":
        return (
          <p className="text-[12.5px] font-semibold text-primary">
            {item?.invoiceNumber || "-"}
          </p>
        );
      case "invoiceTotal":
        return (
          <p className="whitespace-nowrap text-right text-[12.5px] font-semibold">
            {formatAmount(item?.invoiceGrandTotal)}
          </p>
        );
      case "received":
        return (
          <p className="whitespace-nowrap text-right text-[12.5px] font-semibold text-success-600">
            {formatAmount(item?.receivedAmount)}
          </p>
        );
      case "pendingReceived":
        return (
          <p className="whitespace-nowrap text-right text-[12.5px] font-semibold text-warning-600">
            {formatAmount(item?.pendingReceivedAmount)}
          </p>
        );
      case "availableOutstanding":
        return (
          <p className="whitespace-nowrap text-right text-[12.5px] font-semibold">
            {formatAmount(item?.availableOutstandingAmount)}
          </p>
        );
      case "outstanding":
        return (
          <p className="whitespace-nowrap text-right text-[12.5px] font-semibold text-danger-600">
            {formatAmount(item?.outstandingAmount)}
          </p>
        );
      case "paymentStatus":
        return (
          <Chip
            size="sm"
            variant="flat"
            color={getPaymentStatusColor(item?.invoicePaymentStatus)}
          >
            {formatStatus(item?.invoicePaymentStatus)}
          </Chip>
        );
      case "reviewedBy":
        return <p className="text-[12.5px]">{item?.reviewedByName || "-"}</p>;
      case "reviewedAt":
        return (
          <p className="text-[12.5px]">{formatDateTime(item?.reviewedAt)}</p>
        );
      case "message":
        return (
          <p
            title={item?.message}
            className="line-clamp-2 max-w-[250px] text-[12.5px] text-default-600"
          >
            {item?.message || "-"}
          </p>
        );
      case "actions": {
        const canViewTaxInvoice =
          Boolean(item?.invoiceGenerated) && Boolean(item?.invoiceNumber);

        return (
          <Tooltip content="View Tax Invoice">
            <Button
              isIconOnly
              size="sm"
              variant="light"
              isDisabled={!canViewTaxInvoice}
              aria-label="View tax invoice"
              onPress={() => openTaxInvoiceModal(item)}
            >
              <Eye className="w-4 h-4" />
            </Button>
          </Tooltip>
        );
      }
      default:
        return item?.[columnKey] ?? "-";
    }
  };

  const topContent = (
    <div className="flex flex-col gap-2">
      <div className="flex justify-between gap-2 items-center flex-wrap">
        <Input
          isClearable
          size="sm"
          className="w-full sm:max-w-[280px]"
          classNames={{ inputWrapper: "h-8 min-h-8" }}
          placeholder="Search estimate, invoice, requester..."
          startContent={<Search className="w-4 h-4 text-default-400" />}
          value={search}
          onClear={() => setSearch("")}
          onValueChange={setSearch}
        />

        <div className="w-[160px]">
          <Select
            size="sm"
            label="Status"
            selectedKeys={new Set([status])}
            onSelectionChange={handleStatusChange}
          >
            {STATUS_OPTIONS.map((item) => (
              <SelectItem key={item}>{item}</SelectItem>
            ))}
          </Select>
        </div>
      </div>

      <div className="flex justify-between items-center">
        <span className="text-default-400 text-[12.5px]">
          Total {totalElements} requests
        </span>
        <label className="flex items-center gap-1 text-default-400 text-[12.5px]">
          Rows per page:
          <select
            className="bg-transparent outline-hidden text-default-400 text-[12.5px] cursor-pointer"
            onChange={handleSizeChange}
            value={size}
          >
            {PAGE_SIZE_OPTIONS.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </label>
      </div>
    </div>
  );

  const bottomContent = (
    <div className="py-1.5 px-1 flex justify-between items-center">
      <span className="w-[30%] text-[12.5px] text-default-400">
        Showing {Math.min((page - 1) * size + 1, totalElements)} to{" "}
        {Math.min(page * size, totalElements)} of {totalElements}
      </span>

      <Pagination
        isCompact
        showControls
        color="primary"
        page={page}
        total={totalPages}
        onChange={setPage}
      />

      <div className="hidden sm:flex w-[30%] justify-end gap-2">
        <Button
          isDisabled={page === 1}
          size="sm"
          variant="flat"
          onPress={onPreviousPage}
        >
          Previous
        </Button>
        <Button
          isDisabled={page === totalPages}
          size="sm"
          variant="flat"
          onPress={onNextPage}
        >
          Next
        </Button>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col gap-2">
      <h1 className="font-sans text-lg font-semibold mb-2 shrink-0">
        Advance Tax Invoice Requests
      </h1>

      <Table
        isHeaderSticky
        removeWrapper={false}
        aria-label="Advance tax invoice requests table with pagination"
        topContent={topContent}
        topContentPlacement="outside"
        bottomContent={bottomContent}
        bottomContentPlacement="outside"
        classNames={{
          base: "gap-2.5",
          wrapper:
            "max-h-[calc(100vh-320px)] w-full overflow-y-auto rounded-lg border border-gray-200 dark:border-white/10 shadow-none p-0",
          table: "w-full min-w-[1900px]",
          thead: "[&>tr]:first:rounded-none",
          th: "h-8 py-0 text-[11.5px] tracking-wide bg-gray-50 dark:bg-neutral-900 text-default-500 first:rounded-none last:rounded-none border-b border-gray-200 dark:border-white/10",
          td: "py-1.5 text-[12.5px]",
        }}
      >
        <TableHeader columns={tableColumns}>
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
          isLoading={advanceTaxInvoiceRequestsLoading}
          emptyContent={
            advanceTaxInvoiceRequestsError
              ? String(advanceTaxInvoiceRequestsError)
              : "No advance tax invoice requests found."
          }
          items={filteredRequests}
          loadingContent={
            <Spinner
              size="sm"
              label="Loading advance tax invoice requests..."
            />
          }
        >
          {(item) => (
            <TableRow key={item?.requestId || item?.publicUuid}>
              {(columnKey) => (
                <TableCell>{renderCell(item, columnKey)}</TableCell>
              )}
            </TableRow>
          )}
        </TableBody>
      </Table>

      <Modal
        size="full"
        isOpen={taxInvoiceModal.isOpen}
        onOpenChange={(open) => {
          if (!open) {
            closeTaxInvoiceModal();
          }
        }}
        scrollBehavior="inside"
        placement="center"
        classNames={{
          base: "bg-slate-100",
          body: "p-0",
        }}
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="text-base border-b border-slate-200 bg-white">
                Tax Invoice
                {selectedTaxInvoice?.invoiceNumber
                  ? ` - ${selectedTaxInvoice.invoiceNumber}`
                  : ""}
              </ModalHeader>

              <ModalBody className="overflow-auto bg-slate-100 p-0 sm:p-3">
                {selectedTaxInvoice ? (
                  <div className="min-w-fit">
                    <AdvanceTaxInvoiceView
                      invoiceData={selectedTaxInvoice}
                      heading="TAX INVOICE"
                    />
                  </div>
                ) : (
                  <div className="flex min-h-[300px] items-center justify-center">
                    <Spinner label="Loading tax invoice..." />
                  </div>
                )}
              </ModalBody>

              <ModalFooter className="border-t border-slate-200 bg-white">
                <Button
                  size="sm"
                  variant="flat"
                  onPress={() => {
                    closeTaxInvoiceModal();
                    onClose();
                  }}
                >
                  Close
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
};

export default SalesAdvanceInvoice;
