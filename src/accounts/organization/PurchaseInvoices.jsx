import React, { useCallback, useMemo, useState } from "react";
import {
  Button,
  Chip,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalHeader,
  Pagination,
  Select,
  SelectItem,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
  useDisclosure,
} from "@heroui/react";
import { Search } from "lucide-react";
import dayjs from "dayjs";
import { inrCurrency } from "../../common";
import NewSelect from "../../components/NewSelect";
import PurchaseInvoiceView from "../../components/PurchaseInvoiceView";

export const columns = [
  { name: "ID", uid: "id" },
  { name: "INVOICE NO.", uid: "invoiceNo" },
  { name: "INVOICE DATE", uid: "invoiceDate" },
  { name: "PO NO.", uid: "poNumber" },
  { name: "PROJECT NAME", uid: "projectName" },
  { name: "PROJECT NO.", uid: "projectNo" },
  { name: "VENDOR NAME", uid: "vendorName" },
  { name: "AMOUNT", uid: "amount" },
  { name: "GST TYPE", uid: "gstType" },
  { name: "GST %", uid: "gstPercentage" },
  { name: "CGST", uid: "cgstAmount" },
  { name: "SGST", uid: "sgstAmount" },
  { name: "IGST", uid: "igstAmount" },
  { name: "TOTAL GST", uid: "totalGstAmount" },
  { name: "INVOICE AMOUNT", uid: "invoiceAmount" },
  { name: "TDS %", uid: "tdsPercentage" },
  { name: "TDS AMOUNT", uid: "tdsAmount" },
  { name: "PAYABLE AMOUNT", uid: "payableAmount" },
  { name: "STATUS", uid: "status" },
  { name: "ATTACHMENTS", uid: "proofAttachmentUrls" },
  { name: "ACTIONS", uid: "actions" },
];

const INITIAL_VISIBLE_COLUMNS = [
  "invoiceNo",
  "invoiceDate",
  "poNumber",
  "projectName",
  "vendorName",
  "amount",
  "gstType",
  "gstPercentage",
  "totalGstAmount",
  "invoiceAmount",
  "tdsAmount",
  "payableAmount",
  "status",
  "proofAttachmentUrls",
  "actions",
];

const SEARCH_TYPE_OPTIONS = [
  { label: "Invoice number", value: "invoiceNo" },
  { label: "Vendor name", value: "vendorName" },
  { label: "PO number", value: "poNumber" },
];

const STATUS_FILTER_OPTIONS = [
  { label: "All statuses", value: "ALL" },
  { label: "Pending", value: "PENDING" },
  { label: "Approved", value: "APPROVED" },
  { label: "Paid", value: "PAID" },
  { label: "Partially paid", value: "PARTIALLY_PAID" },
  { label: "Rejected", value: "REJECTED" },
];

const getStatusColor = (status) => {
  switch (status) {
    case "APPROVED":
      return "success";

    case "REJECTED":
      return "danger";

    case "PENDING":
      return "warning";

    case "PAID":
      return "primary";

    case "PARTIALLY_PAID":
      return "secondary";

    default:
      return "default";
  }
};

// TODO: replace DUMMY_PURCHASE_INVOICES with a real API call (e.g.
// getPurchaseInvoiceList) once the backend endpoint is available. Each row's
// shape (including vendor* and lineItems) is already what
// PurchaseInvoiceView.jsx expects, so wiring the real endpoint should only
// mean swapping this constant for redux state.
const DUMMY_PURCHASE_INVOICES = [
  {
    id: 1,
    invoiceNo: "PINV-2026-0001",
    invoiceDate: "2026-06-02",
    poNumber: "PO-1042",
    projectName: "GST Registration Portal",
    projectNo: "PRJ-3301",
    vendorName: "Sharma IT Solutions",
    vendorGstin: "07AACFS1234K1Z5",
    vendorPanNo: "AACFS1234K",
    vendorAddressLine1: "B-14, Okhla Industrial Area Phase 1",
    vendorCity: "New Delhi",
    vendorState: "Delhi",
    vendorCountry: "India",
    vendorPinCode: "110020",
    vendorBankName: "HDFC Bank",
    vendorAccountNo: "50100234567890",
    vendorIfscCode: "HDFC0001234",
    status: "PAID",
    lineItems: [
      {
        itemName: "Server hosting - annual plan",
        description: "Dedicated hosting for compliance portal",
        hsnSacCode: "998315",
        quantity: 1,
        unit: "NOS",
        unitPriceExGst: 85000,
        lineTotalExGst: 85000,
        gstRate: 18,
        cgstAmount: 7650,
        sgstAmount: 7650,
        igstAmount: 0,
        igstFlag: false,
        displayOrder: 1,
      },
    ],
  },
  {
    id: 2,
    invoiceNo: "PINV-2026-0002",
    invoiceDate: "2026-06-10",
    poNumber: "PO-1049",
    projectName: "FSSAI License Automation",
    projectNo: "PRJ-3312",
    vendorName: "Nexus Office Supplies",
    vendorGstin: "27AAECN5678L1ZA",
    vendorPanNo: "AAECN5678L",
    vendorAddressLine1: "Plot 22, MIDC Industrial Estate",
    vendorCity: "Pune",
    vendorState: "Maharashtra",
    vendorCountry: "India",
    vendorPinCode: "411019",
    vendorBankName: "ICICI Bank",
    vendorAccountNo: "003405001122",
    vendorIfscCode: "ICIC0000034",
    status: "APPROVED",
    lineItems: [
      {
        itemName: "Office workstation furniture",
        description: "6 desks + chairs for delivery team",
        hsnSacCode: "9403",
        quantity: 6,
        unit: "NOS",
        unitPriceExGst: 12500,
        lineTotalExGst: 75000,
        gstRate: 18,
        gstAmount: 13500,
        igstAmount: 13500,
        igstFlag: true,
        displayOrder: 1,
      },
    ],
  },
  {
    id: 3,
    invoiceNo: "PINV-2026-0003",
    invoiceDate: "2026-06-14",
    poNumber: "PO-1051",
    projectName: "Trademark Filing Suite",
    projectNo: "PRJ-3320",
    vendorName: "Bluewave Legal Research",
    vendorGstin: "29AADCB4321M1Z9",
    vendorPanNo: "AADCB4321M",
    vendorAddressLine1: "4th Floor, Residency Road",
    vendorCity: "Bengaluru",
    vendorState: "Karnataka",
    vendorCountry: "India",
    vendorPinCode: "560025",
    vendorBankName: "Axis Bank",
    vendorAccountNo: "917020011223",
    vendorIfscCode: "UTIB0001234",
    status: "PENDING",
    lineItems: [
      {
        itemName: "Trademark class search - retainer",
        description: "Quarterly retainer, April-June 2026",
        hsnSacCode: "998231",
        quantity: 1,
        unit: "NOS",
        unitPriceExGst: 45000,
        lineTotalExGst: 45000,
        gstRate: 18,
        igstAmount: 8100,
        igstFlag: true,
        displayOrder: 1,
      },
    ],
  },
  {
    id: 4,
    invoiceNo: "PINV-2026-0004",
    invoiceDate: "2026-06-18",
    poNumber: "PO-1053",
    projectName: "Import Export Code Desk",
    projectNo: "PRJ-3328",
    vendorName: "Vertex Cloud Services",
    vendorGstin: "07AAFCV8765N1Z2",
    vendorPanNo: "AAFCV8765N",
    vendorAddressLine1: "Tower C, Cyber Hub",
    vendorCity: "Gurugram",
    vendorState: "Haryana",
    vendorCountry: "India",
    vendorPinCode: "122002",
    vendorBankName: "Kotak Mahindra Bank",
    vendorAccountNo: "6011223344",
    vendorIfscCode: "KKBK0000601",
    status: "PARTIALLY_PAID",
    lineItems: [
      {
        itemName: "Document management SaaS - 50 seats",
        description: "Annual subscription renewal",
        hsnSacCode: "998313",
        quantity: 50,
        unit: "SEAT",
        unitPriceExGst: 1800,
        lineTotalExGst: 90000,
        gstRate: 18,
        cgstAmount: 8100,
        sgstAmount: 8100,
        igstAmount: 0,
        igstFlag: false,
        displayOrder: 1,
      },
    ],
  },
  {
    id: 5,
    invoiceNo: "PINV-2026-0005",
    invoiceDate: "2026-06-21",
    poNumber: "PO-1058",
    projectName: "Labour License Renewal",
    projectNo: "PRJ-3334",
    vendorName: "Suraksha Compliance Partners",
    vendorGstin: "24AABCS2233P1Z6",
    vendorPanNo: "AABCS2233P",
    vendorAddressLine1: "402, Ashram Road",
    vendorCity: "Ahmedabad",
    vendorState: "Gujarat",
    vendorCountry: "India",
    vendorPinCode: "380009",
    vendorBankName: "State Bank of India",
    vendorAccountNo: "31245566778",
    vendorIfscCode: "SBIN0001234",
    status: "REJECTED",
    lineItems: [
      {
        itemName: "Statutory audit assistance",
        description: "On-site labour compliance audit",
        hsnSacCode: "998221",
        quantity: 1,
        unit: "NOS",
        unitPriceExGst: 32000,
        lineTotalExGst: 32000,
        gstRate: 18,
        cgstAmount: 2880,
        sgstAmount: 2880,
        igstAmount: 0,
        igstFlag: false,
        displayOrder: 1,
      },
    ],
  },
  {
    id: 6,
    invoiceNo: "PINV-2026-0006",
    invoiceDate: "2026-06-25",
    poNumber: "PO-1062",
    projectName: "Startup India Recognition",
    projectNo: "PRJ-3341",
    vendorName: "Orbit Design Studio",
    vendorGstin: "19AAGCO4433Q1ZC",
    vendorPanNo: "AAGCO4433Q",
    vendorAddressLine1: "Salt Lake Sector V",
    vendorCity: "Kolkata",
    vendorState: "West Bengal",
    vendorCountry: "India",
    vendorPinCode: "700091",
    vendorBankName: "Yes Bank",
    vendorAccountNo: "008812340099",
    vendorIfscCode: "YESB0000088",
    status: "APPROVED",
    lineItems: [
      {
        itemName: "Pitch deck & branding refresh",
        description: "Corporate identity redesign",
        hsnSacCode: "998314",
        quantity: 1,
        unit: "NOS",
        unitPriceExGst: 60000,
        lineTotalExGst: 60000,
        gstRate: 18,
        gstAmount: 10800,
        igstAmount: 10800,
        igstFlag: true,
        displayOrder: 1,
      },
    ],
  },
  {
    id: 7,
    invoiceNo: "PINV-2026-0007",
    invoiceDate: "2026-06-28",
    poNumber: "PO-1066",
    projectName: "ISO Certification Drive",
    projectNo: "PRJ-3349",
    vendorName: "Pinnacle Quality Auditors",
    vendorGstin: "07AAHCP7788R1Z1",
    vendorPanNo: "AAHCP7788R",
    vendorAddressLine1: "Nehru Place",
    vendorCity: "New Delhi",
    vendorState: "Delhi",
    vendorCountry: "India",
    vendorPinCode: "110019",
    vendorBankName: "Punjab National Bank",
    vendorAccountNo: "0987654321",
    vendorIfscCode: "PUNB0098765",
    status: "PENDING",
    lineItems: [
      {
        itemName: "ISO 9001 certification audit",
        description: "Stage 1 + Stage 2 audit",
        hsnSacCode: "998221",
        quantity: 1,
        unit: "NOS",
        unitPriceExGst: 55000,
        lineTotalExGst: 55000,
        gstRate: 18,
        cgstAmount: 4950,
        sgstAmount: 4950,
        igstAmount: 0,
        igstFlag: false,
        displayOrder: 1,
      },
    ],
  },
  {
    id: 8,
    invoiceNo: "PINV-2026-0008",
    invoiceDate: "2026-07-01",
    poNumber: "PO-1071",
    projectName: "Payroll Automation Rollout",
    projectNo: "PRJ-3357",
    vendorName: "Meridian HR Tech",
    vendorGstin: "33AAICM9911S1Z4",
    vendorPanNo: "AAICM9911S",
    vendorAddressLine1: "Anna Salai",
    vendorCity: "Chennai",
    vendorState: "Tamil Nadu",
    vendorCountry: "India",
    vendorPinCode: "600002",
    vendorBankName: "IndusInd Bank",
    vendorAccountNo: "201122334455",
    vendorIfscCode: "INDB0000201",
    status: "PAID",
    lineItems: [
      {
        itemName: "Payroll SaaS implementation",
        description: "Setup + training, 1-time",
        hsnSacCode: "998313",
        quantity: 1,
        unit: "NOS",
        unitPriceExGst: 120000,
        lineTotalExGst: 120000,
        gstRate: 18,
        gstAmount: 21600,
        igstAmount: 21600,
        igstFlag: true,
        displayOrder: 1,
      },
    ],
  },
];

const round2 = (value) => Math.round((Number(value) + Number.EPSILON) * 100) / 100;

// Derive coherent top-level row fields (amount/gstPercentage/totals/payable)
// from each row's own lineItems, instead of hand-typing unrelated numbers.
const withDerivedTotals = (row) => {
  const items = Array.isArray(row.lineItems) ? row.lineItems : [];

  const amount = round2(
    items.reduce((sum, item) => sum + Number(item?.lineTotalExGst || 0), 0),
  );

  const cgstAmount = round2(
    items.reduce((sum, item) => sum + Number(item?.cgstAmount || 0), 0),
  );

  const sgstAmount = round2(
    items.reduce((sum, item) => sum + Number(item?.sgstAmount || 0), 0),
  );

  const igstAmount = round2(
    items.reduce((sum, item) => sum + Number(item?.igstAmount || 0), 0),
  );

  const totalGstAmount = round2(cgstAmount + sgstAmount + igstAmount);
  const gstPercentage = items[0]?.gstRate || 0;
  const invoiceAmount = round2(amount + totalGstAmount);
  const gstType = igstAmount > 0 ? "IGST" : "CGST/SGST";

  // Simple flat 2% TDS applied on the pre-GST amount for the dummy dataset.
  const tdsPercentage = 2;
  const tdsAmount = round2((amount * tdsPercentage) / 100);
  const payableAmount = round2(invoiceAmount - tdsAmount);

  return {
    ...row,
    amount,
    cgstAmount,
    sgstAmount,
    igstAmount,
    totalGstAmount,
    gstPercentage,
    gstType,
    gstActive: totalGstAmount > 0,
    invoiceAmount,
    tdsPercentage,
    tdsAmount,
    tdsActive: true,
    payableAmount,
    proofAttachmentUrls: [],
  };
};

const PURCHASE_INVOICES = DUMMY_PURCHASE_INVOICES.map(withDerivedTotals);

const PurchaseInvoices = () => {
  const viewModal = useDisclosure();

  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [filterValue, setFilterValue] = useState("");
  const [searchType, setSearchType] = useState("invoiceNo");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [visibleColumns, setVisibleColumns] = useState(
    new Set(INITIAL_VISIBLE_COLUMNS),
  );
  const [rowsPerPage, setRowsPerPage] = useState(15);
  const [page, setPage] = useState(1);

  const hasSearchFilter = Boolean(filterValue);

  const headerColumns = useMemo(() => {
    if (visibleColumns === "all") return columns;

    return columns.filter((column) =>
      Array.from(visibleColumns).includes(column.uid),
    );
  }, [visibleColumns]);

  // TODO: once a real API exists, move this filtering server-side
  // (searchPurchaseInvoices / getPurchaseInvoiceList with query params)
  // instead of filtering the in-memory dummy list.
  const filteredItems = useMemo(() => {
    let items = [...PURCHASE_INVOICES];

    if (statusFilter !== "ALL") {
      items = items.filter((item) => item?.status === statusFilter);
    }

    if (hasSearchFilter) {
      const search = filterValue.trim().toLowerCase();
      items = items.filter((item) =>
        String(item?.[searchType] || "")
          .toLowerCase()
          .includes(search),
      );
    }

    return items;
  }, [statusFilter, hasSearchFilter, filterValue, searchType]);

  const count = filteredItems.length;
  const pages = Math.max(1, Math.ceil(count / rowsPerPage));

  const paginatedItems = useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    return filteredItems.slice(start, start + rowsPerPage);
  }, [filteredItems, page, rowsPerPage]);

  const onSearchChange = useCallback((value) => {
    setFilterValue(value || "");
    setPage(1);
  }, []);

  const onClear = useCallback(() => {
    setFilterValue("");
    setPage(1);
  }, []);

  const onRowsPerPageChange = useCallback((e) => {
    setRowsPerPage(Number(e.target.value));
    setPage(1);
  }, []);

  const onPreviousPage = useCallback(() => {
    setPage((prev) => Math.max(1, prev - 1));
  }, []);

  const onNextPage = useCallback(() => {
    setPage((prev) => Math.min(pages, prev + 1));
  }, [pages]);

  const handleViewInvoice = (rowData) => {
    setSelectedInvoice(rowData);
    viewModal.onOpen();
  };

  const renderCell = useCallback((rowData, columnKey) => {
    switch (columnKey) {
      case "invoiceNo":
        return (
          <p
            className="capitalize text-[12.5px] font-medium text-blue-600 cursor-pointer"
            onClick={() => handleViewInvoice(rowData)}
          >
            {rowData?.invoiceNo}
          </p>
        );

      case "invoiceDate":
        return (
          <span className="whitespace-nowrap text-[12.5px]">
            {rowData?.invoiceDate
              ? dayjs(rowData.invoiceDate).format("DD-MM-YYYY")
              : "-"}
          </span>
        );

      case "projectName":
        return (
          <div className="flex flex-col">
            <p className="font-normal text-[12.5px] capitalize">
              {rowData?.projectName || "-"}
            </p>
            <p className="font-normal text-[11.5px] text-default-500">
              {rowData?.projectNo || "-"}
            </p>
          </div>
        );

      case "vendorName":
        return (
          <span className="font-normal text-[12.5px] capitalize">
            {rowData?.vendorName || "-"}
          </span>
        );

      case "amount":
        return (
          <span className="font-normal text-[12.5px]">
            {inrCurrency(rowData?.amount)}
          </span>
        );

      case "gstType":
        return rowData?.gstActive ? (
          <Chip size="sm" variant="flat" color="secondary">
            {rowData?.gstType}
          </Chip>
        ) : (
          <span className="text-[12.5px] text-default-400">-</span>
        );

      case "gstPercentage":
        return (
          <span className="font-normal text-[12.5px]">
            {rowData?.gstActive ? `${rowData?.gstPercentage}%` : "-"}
          </span>
        );

      case "cgstAmount":
        return (
          <span className="font-normal text-[12.5px]">
            {rowData?.gstType === "IGST" ? "-" : inrCurrency(rowData?.cgstAmount)}
          </span>
        );

      case "sgstAmount":
        return (
          <span className="font-normal text-[12.5px]">
            {rowData?.gstType === "IGST" ? "-" : inrCurrency(rowData?.sgstAmount)}
          </span>
        );

      case "igstAmount":
        return (
          <span className="font-normal text-[12.5px]">
            {rowData?.gstType === "IGST" ? inrCurrency(rowData?.igstAmount) : "-"}
          </span>
        );

      case "totalGstAmount":
        return (
          <span className="font-medium text-[12.5px]">
            {rowData?.gstActive ? inrCurrency(rowData?.totalGstAmount) : "-"}
          </span>
        );

      case "invoiceAmount":
        return (
          <span className="font-medium text-[12.5px]">
            {inrCurrency(rowData?.invoiceAmount)}
          </span>
        );

      case "tdsPercentage":
        return (
          <span className="font-normal text-[12.5px]">
            {rowData?.tdsActive ? `${rowData?.tdsPercentage}%` : "-"}
          </span>
        );

      case "tdsAmount":
        return (
          <span className="font-normal text-[12.5px]">
            {rowData?.tdsActive ? inrCurrency(rowData?.tdsAmount) : "-"}
          </span>
        );

      case "payableAmount":
        return (
          <span className="font-semibold text-[12.5px]">
            {inrCurrency(rowData?.payableAmount)}
          </span>
        );

      case "status":
        return (
          <Chip
            size="sm"
            className="capitalize"
            variant="flat"
            color={getStatusColor(rowData?.status)}
          >
            {rowData?.status?.replaceAll("_", " ") || "-"}
          </Chip>
        );

      case "proofAttachmentUrls":
        return rowData?.proofAttachmentUrls?.length ? (
          <div className="flex flex-col">
            {rowData.proofAttachmentUrls.map((url, index) => (
              <a
                key={index}
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[12.5px] text-blue-500 hover:underline"
              >
                Attachment {index + 1}
              </a>
            ))}
          </div>
        ) : (
          <span className="text-[12.5px] text-default-400">-</span>
        );

      case "actions":
        return (
          <div className="flex justify-center">
            <Button
              size="sm"
              variant="flat"
              onPress={() => handleViewInvoice(rowData)}
            >
              View
            </Button>
          </div>
        );

      default:
        return rowData?.[columnKey] ?? "-";
    }
  }, []);

  const topContent = useMemo(() => {
    return (
      <div className="flex flex-col gap-2">
        <div className="flex justify-between gap-2 items-center flex-wrap">
          <div className="flex items-center gap-1.5 w-full sm:max-w-[360px]">
            <Select
              size="sm"
              className="max-w-[150px] shrink-0"
              selectionMode="single"
              selectedKeys={[searchType]}
              onSelectionChange={(keys) => {
                const key = Array.from(keys)[0];
                setSearchType(key || "invoiceNo");
              }}
            >
              {SEARCH_TYPE_OPTIONS.map((option) => (
                <SelectItem key={option.value}>{option.label}</SelectItem>
              ))}
            </Select>

            <Input
              isClearable
              size="sm"
              className="w-full"
              classNames={{ inputWrapper: "h-8 min-h-8" }}
              placeholder="Search ..."
              startContent={<Search className="w-4 h-4 text-default-400" />}
              value={filterValue}
              onClear={onClear}
              onValueChange={onSearchChange}
            />
          </div>

          <div className="flex gap-1.5 flex-wrap">
            <div className="w-[160px]">
              <NewSelect
                size="sm"
                isSearchable={false}
                data={STATUS_FILTER_OPTIONS}
                labelKey="label"
                valueKey="value"
                label="Status"
                value={statusFilter}
                onChange={(value) => {
                  if (value) {
                    setStatusFilter(value);
                    setPage(1);
                  }
                }}
              />
            </div>

            <div className="w-[160px]">
              <NewSelect
                size="sm"
                isSearchable={false}
                data={columns}
                selectionMode="multiple"
                labelKey="name"
                valueKey="uid"
                label="Columns"
                placeholder="Columns"
                value={Array.from(visibleColumns)}
                onChange={(values) => {
                  if (values.length > 0) {
                    setVisibleColumns(new Set(values));
                  }
                }}
              />
            </div>
          </div>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-default-400 text-[12.5px]">
            Total {count} purchase invoices
          </span>

          <label className="flex items-center gap-1 text-default-400 text-[12.5px]">
            Rows per page:
            <select
              className="bg-transparent outline-hidden text-default-400 text-[12.5px] cursor-pointer"
              onChange={onRowsPerPageChange}
              value={rowsPerPage}
            >
              <option value="5">5</option>
              <option value="10">10</option>
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
    searchType,
    statusFilter,
    visibleColumns,
    rowsPerPage,
    count,
    onSearchChange,
    onClear,
    onRowsPerPageChange,
  ]);

  const bottomContent = useMemo(() => {
    return (
      <div className="py-1.5 px-1 flex justify-between items-center">
        <span className="w-[30%] text-[12.5px] text-default-400">
          Page {page} of {pages}
        </span>

        <Pagination
          isCompact
          showControls
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
  }, [page, pages, onPreviousPage, onNextPage]);

  return (
    <div className="flex flex-col gap-2">
      <h1 className="font-sans text-lg font-semibold mb-2 shrink-0">
        Purchase invoices
      </h1>

      <Table
        isHeaderSticky
        removeWrapper={false}
        aria-label="Purchase invoices table with custom cells and pagination"
        bottomContent={bottomContent}
        bottomContentPlacement="outside"
        classNames={{
          base: "gap-2.5",
          wrapper:
            "max-h-[calc(100vh-320px)] w-full overflow-y-auto rounded-lg border border-gray-200 dark:border-white/10 shadow-none p-0",
          table: "w-full",
          thead: "[&>tr]:first:rounded-none",
          th: "h-8 py-0 text-[11.5px] tracking-wide bg-gray-50 dark:bg-neutral-900 text-default-500 first:rounded-none last:rounded-none border-b border-gray-200 dark:border-white/10",
          td: "py-1.5 text-[12.5px]",
        }}
        topContent={topContent}
        topContentPlacement="outside"
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

        <TableBody emptyContent={"No purchase invoices found"} items={paginatedItems}>
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
        isOpen={viewModal.isOpen}
        onOpenChange={viewModal.onOpenChange}
        placement="top-center"
      >
        <ModalContent>
          <ModalHeader>Purchase Invoice</ModalHeader>
          <ModalBody className="max-h-[90vh] overflow-auto">
            <PurchaseInvoiceView invoiceData={selectedInvoice} />
          </ModalBody>
        </ModalContent>
      </Modal>
    </div>
  );
};

export default PurchaseInvoices;
