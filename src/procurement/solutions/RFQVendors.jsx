import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  addToast,
  Button,
  Chip,
  DatePicker,
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
  Select,
  SelectItem,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
  Textarea,
  Tooltip,
  useDisclosure,
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
} from "@heroui/react";
import { Input as AntInput, Select as AntSelect } from "antd";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import {
  ChevronDown,
  Clock,
  EllipsisVertical,
  ExternalLink,
  Eye,
  File,
  History,
  Paperclip,
  Plus,
  Search,
  Send,
  UserPlus,
  X,
} from "lucide-react";
import dayjs from "dayjs";
import {
  getProductVendorsByProductId,
  getRFQVendorsByRfqId,
} from "../../toolkit/slices/vendorsSlice";
import { parseDate } from "@internationalized/date";

const formatDate = (value) => {
  if (!value) return "-";

  return dayjs(value).isValid() ? dayjs(value).format("DD-MM-YYYY") : "-";
};

const formatDateTime = (value) => {
  if (!value) return "-";

  return dayjs(value).isValid()
    ? dayjs(value).format("DD-MM-YYYY hh:mm A")
    : "-";
};

const getStatusColor = (status) => {
  const value = String(status || "").toUpperCase();

  if (value === "DRAFT") return "warning";
  if (value === "SENT") return "primary";
  if (value === "VENDOR_RESPONDED") return "success";
  if (value === "CANCELLED") return "danger";
  if (value === "CLOSED") return "default";

  return "primary";
};

const columns = [
  { name: "RFQ VENDOR ID", uid: "rfqVendorId" },
  { name: "VENDOR", uid: "vendor" },
  { name: "MOBILE", uid: "vendorMobile" },
  { name: "GST NUMBER", uid: "gstNumber" },
  { name: "PAN NUMBER", uid: "panNumber" },
  { name: "STATUS", uid: "vendorStatus" },
  { name: "ACTIONS", uid: "actions" },
];

const INITIAL_VISIBLE_COLUMNS = [
  "rfqVendorId",
  "vendor",
  "vendorMobile",
  "gstNumber",
  "panNumber",
  "vendorStatus",
  "actions",
];

const RFQVendors = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { solutionId, rfqId } = useParams();
  const currentUser = useSelector((state) => state.auth.currentUser);
  const { rfqVendors = [], rfqVendorsLoading } = useSelector(
    (state) => state.vendors,
  );
  const viewModal = useDisclosure();
  const [filterValue, setFilterValue] = useState("");
  const [visibleColumns, setVisibleColumns] = useState(
    new Set(INITIAL_VISIBLE_COLUMNS),
  );
  const [filteration, setFilteration] = useState({
    page: 1,
    size: 10,
  });

  const fileInputRef = useRef(null);

  const rfqList = useMemo(() => {
    return rfqVendors || [];
  }, [rfqVendors]);

  const count = useMemo(() => {
    return rfqList?.length || 0;
  }, [rfqList?.length]);

  const headerColumns = useMemo(() => {
    if (visibleColumns === "all") return columns;

    return columns.filter((column) =>
      Array.from(visibleColumns).includes(column.uid),
    );
  }, [visibleColumns]);

  const filteredItems = useMemo(() => {
    let filtered = [...rfqList];

    if (filterValue) {
      filtered = filtered.filter((item) =>
        Object.values(item || {}).some((val) =>
          String(val || "")
            .toLowerCase()
            .includes(filterValue.toLowerCase()),
        ),
      );
    }

    return filtered;
  }, [rfqList, filterValue]);

  const paginatedItems = useMemo(() => {
    const start = (filteration.page - 1) * filteration.size;
    const end = start + filteration.size;

    return filteredItems.slice(start, end);
  }, [filteredItems, filteration.page, filteration.size]);

  const pages = Math.ceil(filteredItems.length / filteration.size) || 1;

  const fetchRFQVendors = useCallback(() => {
    if (!rfqId) return;

    dispatch(getRFQVendorsByRfqId(rfqId)).then((resp) => {
      if (resp.meta.requestStatus !== "fulfilled") {
        addToast({
          title: "ERROR",
          description:
            resp?.payload?.message ||
            resp?.payload ||
            "Failed to fetch RFQ vendors.",
          color: "danger",
        });
      }
    });
  }, [dispatch, rfqId]);

  useEffect(() => {
    fetchRFQVendors();
  }, [fetchRFQVendors]);

  const handleView = (item) => {
    setSelectedRfq(item);
    viewModal.onOpen();
  };

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

  const onSearchChange = useCallback((value) => {
    setFilterValue(value || "");
  }, []);

  const onClear = useCallback(() => {
    setFilterValue("");
  }, []);

  const onRowsPerPageChange = useCallback((e) => {
    setFilteration({
      page: 1,
      size: Number(e.target.value),
    });
  }, []);

  const getVendorOptionLabel = (vendor) => {
    return (
      vendor?.name ||
      vendor?.vendorName ||
      vendor?.fullName ||
      vendor?.email ||
      `Vendor ${vendor?.id || vendor?.vendorId}`
    );
  };

  const getStatusColor = (status) => {
    const value = String(status || "").toUpperCase();

    if (value === "ACTIVE") return "success";
    if (value === "INACTIVE") return "default";
    if (value === "BLACKLISTED" || value === "SUSPENDED") return "danger";
    if (value === "UNDER_REVIEW") return "warning";

    return "primary";
  };

  const handleAddQuote = (rowData) => {
    navigate(`${rowData?.id}/quotations`);
  };

  const renderCell = useCallback(
    (rowData, columnKey) => {
      switch (columnKey) {
        case "rfqVendorId":
          return (
            <div className="flex flex-col">
              <span className="text-sm font-semibold">
                {rowData?.rfqVendorId || "-"}
              </span>
              <span className="text-xs text-default-500">
                Vendor ID: {rowData?.vendorId || "-"}
              </span>
            </div>
          );

        case "vendor":
          return (
            <div className="flex flex-col gap-1">
              <span className="text-sm font-semibold text-foreground">
                {rowData?.vendorName || "-"}
              </span>
              <span className="text-xs text-default-500">
                {rowData?.vendorEmail || "-"}
              </span>
            </div>
          );

        case "vendorMobile":
          return (
            <Chip size="sm" variant="flat">
              {rowData?.vendorMobile || "-"}
            </Chip>
          );

        case "gstNumber":
          return <span className="text-sm">{rowData?.gstNumber || "-"}</span>;

        case "panNumber":
          return <span className="text-sm">{rowData?.panNumber || "-"}</span>;

        case "vendorStatus":
          return (
            <Chip
              size="sm"
              color={getStatusColor(rowData?.vendorStatus)}
              variant="flat"
            >
              {rowData?.vendorStatus || "-"}
            </Chip>
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

                <DropdownMenu>
                  <DropdownItem
                    key="addQuote"
                    startContent={<File size={15} />}
                    onPress={() =>
                      navigate(`${rowData?.vendorId}/quotations`, {
                        state: {
                          rfqVendorId: rowData?.rfqVendorId,
                          vendorId: rowData?.vendorId,
                          vendorName: rowData?.vendorName,
                          vendorEmail: rowData?.vendorEmail,
                        },
                      })
                    }
                  >
                    Add Quote
                  </DropdownItem>
                </DropdownMenu>
              </Dropdown>
            </div>
          );

        default:
          return rowData?.[columnKey] || "-";
      }
    },
    [navigate, solutionId, rfqId],
  );
  const topContent = useMemo(() => {
    return (
      <div className="flex flex-col gap-4">
        <div className="flex items-end justify-between gap-3">
          <Input
            isClearable
            className="w-full sm:max-w-[35%]"
            placeholder="Search RFQ..."
            startContent={<Search size={18} />}
            value={filterValue}
            onClear={onClear}
            onValueChange={onSearchChange}
          />

          <div className="flex gap-3">
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
            Total {count} vendors mapped
          </span>

          <label className="flex items-center text-small text-default-400">
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
    count,
    filteration.size,
    onClear,
    onSearchChange,
    onRowsPerPageChange,
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
        <h1 className="mb-1 font-sans text-2xl font-medium">RFQ Vendors</h1>

        <Table
          isHeaderSticky
          aria-label="Request for quotation table"
          bottomContent={bottomContent}
          bottomContentPlacement="outside"
          topContent={topContent}
          topContentPlacement="outside"
          classNames={{
            wrapper: "2xl:max-h-[62vh] md:max-h-[60vh] w-full",
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
            isLoading={rfqVendorsLoading}
            emptyContent={
              rfqVendorsLoading ? "Loading..." : "No RFQ vendor found"
            }
            items={filteredItems}
          >
            {(item) => (
              <TableRow key={item?.vendorId}>
                {(columnKey) => (
                  <TableCell>{renderCell(item, columnKey)}</TableCell>
                )}
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </>
  );
};

export default RFQVendors;
