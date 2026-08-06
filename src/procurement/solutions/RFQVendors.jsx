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
import NewSelect from "../../components/NewSelect";

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
      <div className="flex flex-col gap-2">
        <div className="flex justify-between gap-2 items-center flex-wrap">
          <Input
            isClearable
            size="sm"
            className="w-full sm:max-w-[280px]"
            classNames={{ inputWrapper: "h-8 min-h-8" }}
            placeholder="Search RFQ vendors..."
            startContent={<Search className="w-4 h-4 text-default-400" />}
            value={filterValue}
            onClear={onClear}
            onValueChange={onSearchChange}
          />

          <div className="flex gap-1.5 flex-wrap">
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
            Total {count} vendors mapped
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
    count,
    filteration.size,
    onClear,
    onSearchChange,
    onRowsPerPageChange,
  ]);

  const onPreviousPage = useCallback(() => {
    setFilteration((previous) => ({
      ...previous,
      page: Math.max(1, previous.page - 1),
    }));
  }, []);

  const onNextPage = useCallback(() => {
    setFilteration((previous) => ({
      ...previous,
      page: Math.min(pages, previous.page + 1),
    }));
  }, [pages]);

  const bottomContent = useMemo(() => {
    return (
      <div className="py-1.5 px-1 flex justify-between items-center">
        <span className="w-[30%] text-[12.5px] text-default-400">
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
  }, [filteration.page, pages, onPreviousPage, onNextPage]);

  return (
    <>
      <div className="flex flex-col gap-2">
        <h1 className="font-sans text-lg font-semibold mb-2 shrink-0">
          RFQ Vendors
        </h1>

        <Table
          isHeaderSticky
          removeWrapper={false}
          aria-label="Request for quotation table"
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
            isLoading={rfqVendorsLoading}
            emptyContent={
              rfqVendorsLoading ? "Loading..." : "No RFQ vendor found"
            }
            items={paginatedItems}
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
