import React, { useEffect, useState } from "react";
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Input,
  Button,
  DropdownTrigger,
  Dropdown,
  DropdownMenu,
  DropdownItem,
  Pagination,
  addToast,
  useDisclosure,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  Select,
  SelectItem,
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@heroui/react";
import { ChevronDown, EllipsisVertical, Search, FileDown } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import {
  getAllInvoice,
  getAllInvoiceCount,
  getInvoiceReport,
  searchInvoiceByCompanyNameAndInvoice,
  searchInvoiceCountByCompanyNameAndInvoice,
} from "../../toolkit/slices/organizationSlice";
import dayjs from "dayjs";
import { useParams } from "react-router-dom";
import { inrCurrency } from "../../common";
import { getInvoiceDetailById } from "../../toolkit/slices/accountSlice";
import TaxInvoice from "../../components/TaxInvoice";

import NewSelect from "../../components/NewSelect.jsx";
import { getAllLeadUser } from "../../toolkit/slices/leadSlice.js";

export const columns = [
  { name: "DATE", uid: "date" },
  { name: "INVOICE NO.", uid: "invoiceNo" },
  { name: "SERVICE", uid: "service" },
  { name: "CLIENT", uid: "clientName" },
  { name: "COMPANY", uid: "companyName" },
  { name: "TXN. AMOUNT", uid: "txnAmount" },
  { name: "CGST. AMOUNT", uid: "cgstAmount" },
  { name: "SGST. AMOUNT", uid: "sgstAmount" },
  { name: "IGST. AMOUNT", uid: "igstAmount" },
  { name: "ADDED BY", uid: "addedBy" },
  { name: "ACTIONS", uid: "actions" },
];

export function capitalize(s) {
  return s ? s.charAt(0)?.toUpperCase() + s.slice(1)?.toLowerCase() : "";
}

const INITIAL_VISIBLE_COLUMNS = [
  "date",
  "invoiceNo",
  "service",
  //   "clientName",
  "companyName",
  "txnAmount",
  "cgstAmount",
  "sgstAmount",
  "igstAmount",
  "addedBy",
  "actions",
];

const INVOICE_REPORT_COLUMNS = [
  {
    header: "Invoice Date",
    value: (row) =>
      row?.invoiceDate ? dayjs(row.invoiceDate).format("DD-MM-YYYY") : "",
  },
  { header: "Invoice Number", value: (row) => row?.invoiceNumber },
  { header: "Status", value: (row) => row?.status },
  { header: "Service", value: (row) => row?.solutionName },
  { header: "Client", value: (row) => row?.clientName || row?.contactName },
  { header: "Company", value: (row) => row?.companyName },
  { header: "Grand Total", value: (row) => row?.grandTotal },
  { header: "GST Amount", value: (row) => row?.totalGstAmount },
  { header: "CGST Amount", value: (row) => row?.cgstAmount },
  { header: "SGST Amount", value: (row) => row?.sgstAmount },
  { header: "IGST Amount", value: (row) => row?.igstAmount },
  { header: "Created By", value: (row) => row?.createdByName },
  {
    header: "Created At",
    value: (row) =>
      row?.createdAt ? dayjs(row.createdAt).format("DD-MM-YYYY HH:mm") : "",
  },
];

const normalizeReportPayload = (payload) => {
  if (Array.isArray(payload)) return payload;

  if (Array.isArray(payload?.content)) return payload.content;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.data?.content)) return payload.data.content;
  if (Array.isArray(payload?.response)) return payload.response;
  if (Array.isArray(payload?.response?.content))
    return payload.response.content;
  if (Array.isArray(payload?.items)) return payload.items;
  if (Array.isArray(payload?.records)) return payload.records;

  return [];
};

const escapeCsvCell = (value) => {
  if (value === null || value === undefined) return "";

  const stringValue = String(value)
    .replace(/\r?\n|\r/g, " ")
    .trim();

  if (
    stringValue.includes(",") ||
    stringValue.includes('"') ||
    stringValue.includes("\n")
  ) {
    return `"${stringValue.replace(/"/g, '""')}"`;
  }

  return stringValue;
};

const convertInvoiceRowsToCsv = (rows = []) => {
  const header = INVOICE_REPORT_COLUMNS.map((column) =>
    escapeCsvCell(column.header),
  ).join(",");

  const body = rows
    .map((row) =>
      INVOICE_REPORT_COLUMNS.map((column) =>
        escapeCsvCell(column.value(row)),
      ).join(","),
    )
    .join("\n");

  return [header, body].filter(Boolean).join("\n");
};

const downloadCsvFile = (csvContent, fileName) => {
  const blob = new Blob(["\ufeff", csvContent], {
    type: "text/csv;charset=utf-8;",
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.setAttribute("download", fileName);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);
};

const Taxation = () => {
  const dispatch = useDispatch();
  const { userId } = useParams();
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const data = useSelector((state) => state.organization.allInvoiceList);
  const count = useSelector(
    (state) => state.organization.allInvoiceList?.length,
  );
  const userRole = useSelector((state) => state.auth.currentUser?.roles);
  const adminRole = userRole.includes("ADMIN");
  const department = useSelector(
    (state) => state.auth.getDepartmentDetail?.department,
  );
  const allLeadUser = useSelector((state) => state?.leads?.leadUsersList);
  const [invoiceDetail, setInvoiceDetail] = useState(null);
  const [filterValue, setFilterValue] = React.useState("");
  const [selectedKeys, setSelectedKeys] = React.useState(new Set([]));
  const [visibleColumns, setVisibleColumns] = React.useState(
    new Set(INITIAL_VISIBLE_COLUMNS),
  );
  const [rowsPerPage, setRowsPerPage] = React.useState(50);
  const [sortDescriptor, setSortDescriptor] = React.useState({
    column: "age",
    direction: "ascending",
  });
  const [page, setPage] = React.useState(1);
  const hasSearchFilter = Boolean(filterValue);
  const [status, setStatus] = useState("GENERATED");
  const [searchFilters, setSearchFilters] = useState({
    searchText: "",
    type: "invoiceNumber",
  });
  const [reportFilters, setReportFilters] = useState({
    fromDate: "",
    toDate: "",
    status: "ALL",
    createdByUserId: "",
  });

  const [isReportFetching, setIsReportFetching] = useState(false);
  const [isReportPopoverOpen, setIsReportPopoverOpen] = useState(false);

  const reportUserOptions = React.useMemo(
    () => [{ id: "", fullName: "All Users" }, ...(allLeadUser || [])],
    [allLeadUser],
  );

  useEffect(() => {
    if (userId) {
      dispatch(getAllLeadUser(userId));
    }
  }, [dispatch, userId]);

  useEffect(() => {
    dispatch(getAllInvoice({ userId, page, size: rowsPerPage, status }));
    dispatch(getAllInvoiceCount({ userId, status }));
  }, [dispatch, userId, status]);

  const headerColumns = React.useMemo(() => {
    if (visibleColumns === "all") return columns;

    return columns.filter((column) =>
      Array.from(visibleColumns).includes(column.uid),
    );
  }, [visibleColumns]);

  const filteredItems = React.useMemo(() => {
    let filteredUsers = [...(data || [])];

    if (hasSearchFilter) {
      filteredUsers = filteredUsers?.filter((item) =>
        Object.values(item)?.some((val) =>
          String(val)?.toLowerCase()?.includes(filterValue?.toLowerCase()),
        ),
      );
    }

    return filteredUsers;
  }, [data, filterValue]);

  const pages = Math.ceil(count / rowsPerPage) || 1;

  const sortedItems = React.useMemo(() => {
    return [...filteredItems].sort((a, b) => {
      const first = a[sortDescriptor.column];
      const second = b[sortDescriptor.column];
      const cmp = first < second ? -1 : first > second ? 1 : 0;

      return sortDescriptor.direction === "descending" ? -cmp : cmp;
    });
  }, [sortDescriptor, filteredItems]);

  const handleFetchInvoiceReport = React.useCallback(async () => {
    const hasFromDate = Boolean(reportFilters.fromDate);
    const hasToDate = Boolean(reportFilters.toDate);

    if ((hasFromDate && !hasToDate) || (!hasFromDate && hasToDate)) {
      addToast({
        title: "Incomplete date range",
        description:
          "Please select both from date and to date, or leave both blank for all dates.",
        color: "danger",
      });
      return;
    }

    if (
      reportFilters.fromDate &&
      reportFilters.toDate &&
      dayjs(reportFilters.toDate).isBefore(dayjs(reportFilters.fromDate))
    ) {
      addToast({
        title: "Invalid date range",
        description: "To date cannot be earlier than from date.",
        color: "danger",
      });
      return;
    }

    setIsReportFetching(true);

    try {
      const payload = {
        userId,
        createdByUserId: reportFilters.createdByUserId || undefined,
        status:
          reportFilters.status !== "ALL" ? reportFilters.status : undefined,
        fromDate: reportFilters.fromDate || undefined,
        toDate: reportFilters.toDate || undefined,
      };

      console.log("Calling invoice report API with filters:", payload);

      const resp = await dispatch(getInvoiceReport(payload));

      console.log("Invoice report API response:", resp);

      if (resp.meta.requestStatus !== "fulfilled") {
        addToast({
          title: "Report fetch failed",
          description:
            resp?.payload?.message ||
            resp?.payload?.data?.message ||
            "Unable to fetch invoice report data.",
          color: "danger",
        });
        return;
      }

      const reportRows = normalizeReportPayload(resp.payload);

      if (!reportRows.length) {
        addToast({
          title: "No records found",
          description: "No invoice data found for the selected filters.",
          color: "warning",
        });
        return;
      }

      const csvContent = convertInvoiceRowsToCsv(reportRows);

      const dateLabel =
        reportFilters.fromDate && reportFilters.toDate
          ? `${reportFilters.fromDate}-to-${reportFilters.toDate}`
          : "all-dates";

      const statusLabel =
        reportFilters.status && reportFilters.status !== "ALL"
          ? reportFilters.status
          : "all-status";

      const fileName = `invoice-report-${statusLabel}-${dateLabel}.csv`;

      downloadCsvFile(csvContent, fileName);

      addToast({
        title: "Report downloaded",
        description: `${reportRows.length} invoice record(s) exported successfully.`,
        color: "success",
      });

      setIsReportPopoverOpen(false);
    } catch (error) {
      console.error("Invoice report frontend error:", error);

      addToast({
        title: "Something went wrong",
        description: error?.message || "Unable to generate invoice report.",
        color: "danger",
      });
    } finally {
      setIsReportFetching(false);
    }
  }, [dispatch, reportFilters, userId]);

  const handleViewEstimate = (value) => {
    dispatch(getInvoiceDetailById({ id: value?.id, userId }))
      .then((resp) => {
        if (resp.meta.requestStatus === "fulfilled") {
          let tempData = resp?.payload;
          setInvoiceDetail(tempData);
          onOpen();
        } else {
          addToast({
            title: "There is Some Issue in Invoice",
            color: "danger",
          });
          onOpen();
        }
      })
      .catch(() =>
        addToast({ title: "There is Some Issue in Invoice", color: "danger" }),
      );
  };

  const renderCell = React.useCallback((rowData, columnKey) => {
    const cellValue = rowData[columnKey];
    switch (columnKey) {
      case "date":
        return (
          <p className="text-sm capitalize">
            {dayjs(rowData?.invoiceDate).format("DD-MM-YYYY")}
          </p>
        );
      case "invoiceNo":
        return (
          <div className="flex flex-col gap-1">
            <p className="text-sm capitalize">{rowData?.invoiceNumber}</p>
          </div>
        );
      case "service":
        return <p className="text-sm capitalize">{rowData?.solutionName}</p>;
      case "clientName":
        return <p className="text-sm capitalize">{rowData?.clientName}</p>;
      case "companyName":
        return <p className="text-sm capitalize">{rowData?.companyName}</p>;
      case "txnAmount":
        return (
          <div className="flex flex-col gap-1">
            <p className="text-sm capitalize">
              {inrCurrency(rowData?.grandTotal)}
            </p>
            <div className="flex gap-1.5">
              <span className="text-gray-500 text-tiny">GST</span>
              <span className="text-gray-500 text-tiny">:</span>
              <span className="text-gray-500 text-tiny">
                {inrCurrency(rowData?.totalGstAmount)}
              </span>
            </div>
          </div>
        );
      case "cgstAmount":
        return (
          <div className="flex flex-col gap-1">
            <p className="text-sm capitalize">
              {inrCurrency(rowData?.cgstAmount)}
            </p>
          </div>
        );
      case "sgstAmount":
        return (
          <div className="flex flex-col gap-1">
            <p className="text-sm capitalize">
              {inrCurrency(rowData?.sgstAmount)}
            </p>
          </div>
        );
      case "igstAmount":
        return (
          <div className="flex flex-col gap-1">
            <p className="text-sm capitalize">
              {inrCurrency(rowData?.igstAmount)}
            </p>
          </div>
        );
      case "addedBy":
        return <p className="text-sm capitalize">{rowData?.createdByName}</p>;
      case "actions":
        return (
          <div className="relative flex justify-center items-center gap-2">
            <Dropdown>
              <DropdownTrigger>
                <Button isIconOnly size="sm" variant="light">
                  <EllipsisVertical className="text-default-300" />
                </Button>
              </DropdownTrigger>
              <DropdownMenu
                selectionMode="single"
                onSelectionChange={(e) => {
                  let key = Array.from(e)[0];
                  if (key == "viewEstimate") {
                    handleViewEstimate(rowData);
                  }
                }}
              >
                <DropdownItem key="viewEstimate">Tax invoice</DropdownItem>
              </DropdownMenu>
            </Dropdown>
          </div>
        );
      default:
        return cellValue;
    }
  }, []);

  const onNextPage = React.useCallback(() => {
    if (page < pages) {
      setPage(page + 1);
    }
  }, [page, pages]);

  const onPreviousPage = React.useCallback(() => {
    if (page > 1) {
      setPage(page - 1);
    }
  }, [page]);

  const onRowsPerPageChange = React.useCallback((e) => {
    setRowsPerPage(Number(e.target.value));
    setPage(1);
  }, []);

  const onSearchChange = React.useCallback(
    (value) => {
      if (value) {
        setFilterValue(value);
        setPage(1);
        dispatch(
          searchInvoiceByCompanyNameAndInvoice({
            ...searchFilters,
            searchText: value,
            page,
            size: rowsPerPage,
          }),
        );
        dispatch(
          searchInvoiceCountByCompanyNameAndInvoice({
            ...searchFilters,
            searchText: value,
          }),
        );
      } else {
        setFilterValue("");
        dispatch(getAllInvoice({ userId, page, size: rowsPerPage, status }));
        dispatch(getAllInvoiceCount({ userId, status }));
      }
    },
    [searchFilters, page, rowsPerPage],
  );

  const onClear = React.useCallback(() => {
    setFilterValue("");
    setPage(1);
    dispatch(getAllInvoice({ userId, page, size: rowsPerPage, status }));
    dispatch(getAllInvoiceCount({ userId, status }));
  }, []);

  const topContent = React.useMemo(() => {
    return (
      <div className="flex flex-col gap-4">
        <div className="flex justify-between gap-3 items-end">
          <div className="flex items-center w-full pb-0.5">
            <Select
              className="max-w-[15%]"
              selectionMode="single"
              selectedKeys={[searchFilters?.type]}
              onSelectionChange={(e) => {
                let key = Array.from(e)[0];
                setSearchFilters((preview) => ({ ...preview, type: key }));
              }}
            >
              <SelectItem key={"invoiceNumber"}>Invoice number</SelectItem>
              <SelectItem key={"companyName"}>Company name</SelectItem>
            </Select>
            <Input
              isClearable
              className="w-full sm:max-w-[35%]"
              placeholder="Search ..."
              startContent={<Search />}
              value={filterValue}
              onClear={() => onClear()}
              onValueChange={onSearchChange}
            />
          </div>
          {adminRole && (
            <>
              <Popover
                isOpen={isReportPopoverOpen}
                onOpenChange={setIsReportPopoverOpen}
                placement="bottom-end"
                showArrow
              >
                <PopoverTrigger>
                  <Button
                    color="primary"
                    variant="flat"
                    startContent={<FileDown size={16} />}
                  >
                    Fetch Report
                  </Button>
                </PopoverTrigger>

                <PopoverContent className="w-[360px] p-0">
                  <div className="w-full p-4">
                    <div>
                      <p className="text-sm font-semibold text-gray-900">
                        Export invoice report
                      </p>
                      <p className="mt-1 text-xs text-gray-500">
                        Select filters and download CSV report.
                      </p>
                    </div>

                    <div className="mt-4 grid grid-cols-1 gap-3">
                      <NewSelect
                        data={reportUserOptions}
                        label="Created By"
                        name="createdByUserId"
                        labelKey="fullName"
                        valueKey="id"
                        value={reportFilters.createdByUserId}
                        onChange={(selectedValue) => {
                          setReportFilters((prev) => ({
                            ...prev,
                            createdByUserId: selectedValue || "",
                          }));
                        }}
                      />

                      <Select
                        label="Status"
                        labelPlacement="outside"
                        size="sm"
                        selectedKeys={[reportFilters.status]}
                        onSelectionChange={(keys) => {
                          const selectedStatus = Array.from(keys)[0];

                          setReportFilters((prev) => ({
                            ...prev,
                            status: selectedStatus || "ALL",
                          }));
                        }}
                      >
                        <SelectItem key="ALL">All</SelectItem>
                        <SelectItem key="GENERATED">GENERATED</SelectItem>
                        <SelectItem key="CANCELLED">CANCELLED</SelectItem>
                        <SelectItem key="REFUNDED">REFUNDED</SelectItem>
                      </Select>

                      <Input
                        type="date"
                        label="From date"
                        labelPlacement="outside"
                        size="sm"
                        value={reportFilters.fromDate}
                        max={reportFilters.toDate || undefined}
                        onChange={(e) =>
                          setReportFilters((prev) => ({
                            ...prev,
                            fromDate: e.target.value,
                          }))
                        }
                      />

                      <Input
                        type="date"
                        label="To date"
                        labelPlacement="outside"
                        size="sm"
                        value={reportFilters.toDate}
                        min={reportFilters.fromDate || undefined}
                        onChange={(e) =>
                          setReportFilters((prev) => ({
                            ...prev,
                            toDate: e.target.value,
                          }))
                        }
                      />
                    </div>

                    <div className="mt-4 flex justify-end gap-2 border-t border-default-200 pt-3">
                      <Button
                        size="sm"
                        variant="light"
                        onPress={() =>
                          setReportFilters({
                            fromDate: "",
                            toDate: "",
                            status: "ALL",
                            createdByUserId: "",
                          })
                        }
                      >
                        Clear
                      </Button>

                      <Button
                        size="sm"
                        color="primary"
                        isLoading={isReportFetching}
                        startContent={
                          !isReportFetching && <FileDown size={15} />
                        }
                        onPress={handleFetchInvoiceReport}
                      >
                        Download CSV
                      </Button>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
            </>
          )}

          <div className="flex gap-3">
            <Dropdown>
              <DropdownTrigger>
                <Button
                  className="capitalize"
                  variant="flat"
                  endContent={<ChevronDown />}
                >
                  {status}
                </Button>
              </DropdownTrigger>
              <DropdownMenu
                disallowEmptySelection
                aria-label="Single selection example"
                selectedKeys={[status]}
                selectionMode="single"
                variant="flat"
                onSelectionChange={(e) => {
                  let key = Array.from(e)[0];
                  setStatus(key);
                }}
              >
                <DropdownItem key="GENERATED">GENERATED</DropdownItem>
                <DropdownItem key="SENT_TO_CLIENT">SENT_TO_CLIENT</DropdownItem>
                <DropdownItem key="VIEWED">VIEWED</DropdownItem>
                <DropdownItem key="PAID">PAID</DropdownItem>
                <DropdownItem key="PARTIALLY_PAID">PARTIALLY_PAID</DropdownItem>
                <DropdownItem key="CANCELLED">CANCELLED</DropdownItem>
                <DropdownItem key="CREDIT_NOTED">CREDIT_NOTED</DropdownItem>
              </DropdownMenu>
            </Dropdown>
            <Dropdown>
              <DropdownTrigger>
                <Button endContent={<ChevronDown />} variant="flat">
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
                    {capitalize(column.name)}
                  </DropdownItem>
                ))}
              </DropdownMenu>
            </Dropdown>
          </div>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-default-400 text-small">
            Total {count} taxation
          </span>
          <label className="flex items-center text-default-400 text-small">
            Rows per page:
            <select
              className="bg-transparent outline-hidden text-default-400 text-small"
              onChange={onRowsPerPageChange}
              value={rowsPerPage}
            >
              <option value="15">15</option>
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
    onRowsPerPageChange,
    count,
    onSearchChange,
    hasSearchFilter,
    status,
    searchFilters,
    reportFilters,
    reportUserOptions,
    isReportFetching,
    handleFetchInvoiceReport,
    isReportPopoverOpen,
  ]);

  const bottomContent = React.useMemo(() => {
    return (
      <div className="py-2 px-2 flex justify-between items-center">
        <span className="w-[30%] text-small text-default-400">
          {selectedKeys === "all"
            ? "All items selected"
            : `${selectedKeys.size} of ${count} selected`}
        </span>
        <Pagination
          isCompact
          showControls
          showShadow
          color="primary"
          page={page}
          total={pages}
          onChange={setPage}
        />
        <div className="hidden sm:flex w-[30%] justify-end gap-2">
          <Button
            isDisabled={pages === 1}
            size="sm"
            variant="flat"
            onPress={onPreviousPage}
          >
            Previous
          </Button>
          <Button
            isDisabled={pages === 1}
            size="sm"
            variant="flat"
            onPress={onNextPage}
          >
            Next
          </Button>
        </div>
      </div>
    );
  }, [selectedKeys, count, page, pages, hasSearchFilter]);

  return (
    <>
      <h1 className="font-sans text-2xl font-medium mb-1">Taxation list</h1>
      <Table
        isHeaderSticky
        aria-label="Example table with custom cells, pagination and sorting"
        bottomContent={bottomContent}
        bottomContentPlacement="outside"
        classNames={{
          wrapper: "2xl:max-h-[65vh] md:max-h-[60vh] w-full",
          table: "w-full",
        }}
        sortDescriptor={sortDescriptor}
        topContent={topContent}
        topContentPlacement="outside"
        onSelectionChange={setSelectedKeys}
        onSortChange={setSortDescriptor}
      >
        <TableHeader columns={headerColumns}>
          {(column) => (
            <TableColumn
              key={column.uid}
              align={column.uid === "actions" ? "center" : "start"}
              allowsSorting={column.sortable}
            >
              {column.name}
            </TableColumn>
          )}
        </TableHeader>
        <TableBody emptyContent={"No data found"} items={sortedItems}>
          {(item) => (
            <TableRow key={item.id}>
              {(columnKey) => (
                <TableCell>{renderCell(item, columnKey)}</TableCell>
              )}
            </TableRow>
          )}
        </TableBody>
      </Table>
      <Modal
        size="full"
        isDismissable={false}
        isKeyboardDismissDisabled={true}
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        placement="top-center"
      >
        <ModalContent>
          <ModalHeader>Tax Invoice</ModalHeader>
          <ModalBody className="max-h-[90vh] overflow-auto">
            <TaxInvoice invoiceData={invoiceDetail} />
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
};

export default Taxation;
