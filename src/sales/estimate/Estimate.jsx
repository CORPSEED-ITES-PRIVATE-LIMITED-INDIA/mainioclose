import {
  addToast,
  Button,
  Chip,
  DateRangePicker,
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
  Popover,
  PopoverContent,
  PopoverTrigger,
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
import { ChevronDown, EllipsisVertical, Search } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import {
  getAllEstimateByUserId,
  getEstimateByEstimateId,
  getTotalCountOfEstimate,
} from "../../toolkit/slices/leadSlice";
import dayjs from "dayjs";
import { inrCurrency, statusColorCode } from "../../common";
import { createPaymentRegister } from "../../toolkit/slices/accountSlice";
import EstimatePaymentRegister from "./EstimatePaymentRegister";
import { getBasicCompanyDetails } from "../../toolkit/slices/companySlice";
import FullCompanyDetailsForm from "../company/FullCompanyDetailsForm";
import { parseDate, parseZonedDateTime } from "@internationalized/date";
import NewEstimatePreview from "../leads/leadEstimate/NewEstimatePreview";

const columns = [
  { name: "ID", uid: "id", sortable: true },
  { name: "ESTIMATE NO.", uid: "estimateNumber" },
  { name: "SOLUTION NAME", uid: "solutionName" },
  { name: "COMPANY", uid: "companyName" },
  { name: "UNIT NAME", uid: "unitName" },
  { name: "STATUS", uid: "status" },
  { name: "CREATED DATE", uid: "createDate" },
  { name: "GST NUMBER", uid: "gstNo" },
  { name: "PRIMARY CONTACT", uid: "primaryContact" },
  { name: "SECONDARY CONTACT", uid: "secondaryContact" },
  { name: "AMOUNT", uid: "amount" },
  { name: "INVOICE NOTE", uid: "invoiceNote" },
  { name: "ADDRESS", uid: "address" },
  { name: "ACTIONS", uid: "actions" },
];

const ESTIMATE_STATUS = [
  "DRAFT",
  "SENT_TO_CLIENT",
  "VIEWED",
  "APPROVED",
  "REJECTED",
  "EXPIRED",
];

function capitalize(s) {
  return s ? s.charAt(0).toUpperCase() + s.slice(1).toLowerCase() : "";
}

const INITIAL_VISIBLE_COLUMNS = [
  "estimateNumber",
  "solutionName",
  "companyName",
  "unitName",
  "status",
  "createDate",
  "gstNo",
  "amount",
  "professionalFees",
  "actions",
];

const Estimate = () => {
  const dispatch = useDispatch();
  const { userId } = useParams();
  const viewModal = useDisclosure();
  const paymentModal = useDisclosure();
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const count = useSelector((state) => state.leads.totalEstimateCount);
  const data = useSelector((state) => state.leads.estimateList);
  const [filterValue, setFilterValue] = useState("");
  const [selectedKeys, setSelectedKeys] = useState(new Set([]));
  const [estimateDetail, setEstimateDetail] = useState(null);
  const [visibleColumns, setVisibleColumns] = useState(
    new Set(INITIAL_VISIBLE_COLUMNS),
  );
  const [activeEstimateId, setActiveEstimateId] = useState(null);
  const paymentTypes = useMemo(
    () => [
      { id: 1, name: "Advance" },
      { id: 2, name: "Partial" },
      { id: 3, name: "Full" },
    ],
    [],
  );
  const [sortDescriptor, setSortDescriptor] = useState({
    column: "age",
    direction: "ascending",
  });
  const [filteration, setFilteration] = useState({
    page: 1,
    size: 50,
  });
  const [filters, setFilters] = useState({
    search: "",
    status: "",
    fromDate: "",
    toDate: "",
  });

  const hasSearchFilter = Boolean(filterValue);

  useEffect(() => {
    dispatch(
      getAllEstimateByUserId({
        userId,
        page: filteration.page,
        size: filteration.size,
        data: {
          search: filters.search || "",
          status: filters.status || "",
          fromDate: filters.fromDate || "",
          toDate: filters.toDate || "",
        },
      }),
    );

    dispatch(
      getTotalCountOfEstimate({
        userId,
        data: {
          search: filters.search || "",
          status: filters.status || "",
          fromDate: filters.fromDate || "",
          toDate: filters.toDate || "",
        },
      }),
    );
  }, [dispatch, userId, filteration, filters]);

  const headerColumns = useMemo(() => {
    if (visibleColumns === "all") return columns;
    return columns.filter((column) =>
      Array.from(visibleColumns).includes(column.uid),
    );
  }, [visibleColumns]);

  const filteredItems = useMemo(() => {
    let filteredData = [...data];

    if (hasSearchFilter) {
      filteredData = filteredData.filter((item) =>
        Object.values(item)?.some((val) =>
          String(val)?.toLowerCase()?.includes(filterValue?.toLowerCase()),
        ),
      );
    }

    return filteredData;
  }, [data, filterValue, hasSearchFilter]);

  const pages = Math.ceil(count / filteration?.size) || 1;

  const sortedItems = useMemo(() => {
    return [...filteredItems].sort((a, b) => {
      const first = a[sortDescriptor.column];
      const second = b[sortDescriptor.column];
      const cmp = first < second ? -1 : first > second ? 1 : 0;
      return sortDescriptor.direction === "descending" ? -cmp : cmp;
    });
  }, [sortDescriptor, filteredItems]);

  const handleViewEstimate = (rowData) => {
    dispatch(getEstimateByEstimateId({ estimateId: rowData?.id, userId }))
      .then((resp) => {
        if (resp.meta.requestStatus === "fulfilled") {
          console.log("dsjkgjkgdkj", resp);
          let data = resp?.payload;
          setEstimateDetail(data);
          viewModal.onOpen();
        } else {
          addToast({
            title: "There is Some Issue in estimate",
            color: "danger",
          });
        }
      })
      .catch(() =>
        addToast({ title: "There is Some Issue in estimate", color: "danger" }),
      );
  };

  const renderCell = useCallback((rowData, columnKey) => {
    switch (columnKey) {
      case "solutionName":
        return (
          <div className="flex flex-col items-start gap-2">
            <span className="font-medium">{rowData?.solutionName}</span>
            {rowData?.solutionType && (
              <Chip size="sm">{rowData?.solutionType}</Chip>
            )}
          </div>
        );
      case "companyName":
        return (
          <div className="flex flex-col">
            <span className="font-normal">{rowData?.company?.name}</span>
            {/* <span className="text-sm text-gray-400">
              Age:{rowData?.companyAge || "---"} yrs
            </span> */}
          </div>
        );
      case "unitName":
        return (
          <div className="flex flex-col">
            <span className="font-normal">{rowData?.unit?.unitName}</span>
            <Chip
              size="sm"
              color={statusColorCode[rowData?.unit?.onboardingStatus]}
            >
              {rowData?.unit?.onboardingStatus}
            </Chip>
          </div>
        );
      case "status":
        return (
          <div className="flex flex-col">
            <span className="font-normal">{rowData?.status}</span>
          </div>
        );
      case "createDate":
        return (
          <div className="flex flex-col">
            <span className="font-normal">
              {dayjs(rowData?.estimateDate).format("DD-MM-YYYY")}
            </span>
            <span className="font-normal text-sm text-gray-400">
              Valid till : {dayjs(rowData?.validUntil).format("DD-MM-YYYY")}
            </span>
          </div>
        );
      case "gstNo":
        return (
          <div className="flex flex-col gap-1">
            <span className="font-semibold">{rowData?.unit?.gstNo || "-"}</span>
            {rowData?.panNo && (
              <span className="text-xs text-foreground-400">
                Pan : {rowData?.panNo}
              </span>
            )}
          </div>
        );
      case "amount":
        return (
          <div className="flex flex-col">
            <span className="font-medium">
              {inrCurrency(rowData?.subTotalExGst || 0) || "-"}
            </span>
            {rowData?.totalGstAmount && (
              <span className="text-tiny text-gray-400">
                GST : {rowData?.totalGstAmount || "-"}%
              </span>
            )}
            {rowData?.quantity && (
              <span className="text-tiny text-gray-400">
                Quantity : {rowData?.quantity || "-"} kg
              </span>
            )}
          </div>
        );

      case "professionalFees":
        return (
          <div className="flex flex-col">
            <span className="font-medium">
              {inrCurrency(rowData?.professionalFees || 0) || "-"}
            </span>
            <span className="text-tiny text-gray-400">
              GST : {rowData?.profesionalGst || "-"}%
            </span>
          </div>
        );
      case "govermentfees":
        return (
          <div className="flex flex-col">
            <span className="font-medium">
              {inrCurrency(rowData?.govermentfees || 0) || "-"}
            </span>
            <span className="text-tiny text-gray-400">
              GST : {rowData?.govermentGst || "-"}%
            </span>
          </div>
        );
      case "serviceCharge":
        return (
          <div className="flex flex-col">
            <span className="font-medium">
              {inrCurrency(rowData?.serviceCharge || 0) || "-"}
            </span>
            <span className="text-tiny text-gray-400">
              GST : {inrCurrency(rowData?.serviceGst) || "-"}
            </span>
          </div>
        );
      case "otherFees":
        return (
          <div className="flex flex-col">
            <span className="font-medium">
              {inrCurrency(rowData?.otherFees || 0) || "-"}
            </span>
            <span className="text-tiny text-gray-400">
              GST : {rowData?.otherGst || "-"}%
            </span>
          </div>
        );
      case "invoiceNote":
        return (
          <div className="flex items-start gap-2">
            <span className="text-xs">{rowData?.invoiceNote}</span>
          </div>
        );
      case "primaryContact":
        return (
          <div className="flex flex-col">
            <span className="font-semibold">
              {rowData.primaryContact?.name || "-"}
            </span>
            <span className="text-sm text-gray-400">
              {rowData?.primaryContact?.emails || "-"}
            </span>
            <span className="text-sm text-gray-400">
              {rowData?.primaryContact?.contactNo || "-"},
              {rowData?.primaryContact?.contactNo || "-"}
            </span>
          </div>
        );
      case "secondaryContact":
        return (
          <div className="flex flex-col">
            <span className="font-semibold">
              {rowData.secondaryContact?.name || "-"}
            </span>
            <span className="text-sm text-gray-400">
              {rowData?.secondaryContact?.emails || "-"}
            </span>
            <span className="text-sm text-gray-400">
              {rowData?.secondaryContact?.contactNo || "-"},
              {rowData?.secondaryContact?.contactNo || "-"}
            </span>
          </div>
        );
      case "address":
        return (
          <div className="flex flex-col">
            <span className="font-semibold">
              {rowData?.unit?.addressLine1 || "-"}
            </span>
            <span className="text-sm text-gray-400">
              {rowData?.unit?.city || ""},{rowData?.unit?.state},
              {rowData?.unit?.country}
            </span>
          </div>
        );
      case "actions":
        return (
          <div className="relative flex justify-center items-center gap-2">
            <Dropdown>
              <DropdownTrigger>
                <Button isIconOnly size="sm" variant="light">
                  <EllipsisVertical />
                </Button>
              </DropdownTrigger>
              <DropdownMenu
                selectionMode="single"
                onSelectionChange={(e) => {
                  let item = Array.from(e)[0];
                  if (item === "paymentRegister") {
                    if (
                      rowData?.company?.onboardingStatus === "MINIMAL" ||
                      rowData?.unit?.onboardingStatus === "MINIMAL"
                    ) {
                      addToast({
                        title: "Please update the full company detail !.",
                        color: "danger",
                      });
                    } else {
                      setActiveEstimateId(rowData?.id);
                      paymentModal.onOpen();
                    }
                  } else if (item === "viewEstimate") {
                    handleViewEstimate(rowData);
                  } else if (item === "updateCompanyDetail") {
                    dispatch(
                      getBasicCompanyDetails({
                        leadId: rowData?.leadId,
                        userId,
                      }),
                    );
                  }
                }}
              >
                <DropdownItem key="updateCompanyDetail" onPress={onOpen}>
                  Update company detail
                </DropdownItem>
                <DropdownItem key="paymentRegister">
                  Add payment register
                </DropdownItem>
                <DropdownItem key="viewEstimate">View estimate</DropdownItem>
                {/* <DropdownItem key="edit">Edit</DropdownItem>
                <DropdownItem key="delete" color="danger">
                  Delete
                </DropdownItem> */}
              </DropdownMenu>
            </Dropdown>
          </div>
        );
      default:
        return rowData[columnKey] || "-";
    }
  }, []);

  const onNextPage = useCallback(() => {
    if (filteration?.page < pages) {
      setFilteration((prev) => ({ ...prev, page: prev.page + 1 }));
    }
  }, [filteration, pages]);

  const onPreviousPage = useCallback(() => {
    if (filteration?.page > 1) {
      setFilteration((prev) => ({ ...prev, page: prev.page - 1 }));
    }
  }, [filteration]);

  const onRowsPerPageChange = useCallback((e) => {
    setFilteration((prev) => ({
      ...prev,
      size: Number(e.target.value),
      page: 1,
    }));
  }, []);

  const onSearchChange = useCallback((value) => {
    if (value) {
      setFilterValue(value);
      setFilteration((prev) => ({ ...prev, page: 1 }));
    } else {
      setFilterValue("");
    }
  }, []);

  const onClear = useCallback(() => {
    setFilterValue("");
    setFilteration((prev) => ({ ...prev, page: 1 }));
  }, []);

  const topContent = useMemo(() => {
    return (
      <div className="flex flex-col gap-4">
        <div className="flex justify-between gap-3 items-end">
          <Input
            className="w-full sm:max-w-[35%]"
            placeholder="Search..."
            startContent={<Search size={16} />}
            value={filters.search}
            onClear={onClear}
            onChange={(e) =>
              setFilters((prev) => ({ ...prev, search: e.target.value }))
            }
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                setFilteration((prev) => ({ ...prev, page: 1 }));
              }
            }}
          />
          <div className="flex gap-3">
            <Popover placement="bottom-end">
              <PopoverTrigger>
                <Button variant="flat" endContent={<ChevronDown />}>
                  Filters
                </Button>
              </PopoverTrigger>
              <PopoverContent className="p-4">
                <div className="grid grid-cols-2 gap-2.5">
                  <DateRangePicker
                    showMonthAndYearPickers
                    hideTimeZone
                    label="Date range"
                    // value={{
                    //   start: filters?.fromDate
                    //     ? parseZonedDateTime(
                    //         `${filters?.fromDate}[Asia/kolkata]`,
                    //       )
                    //     : null,
                    //   end: filters?.toDate
                    //     ? parseZonedDateTime(`${filters?.toDate}[Asia/kolkata]`)
                    //     : null,
                    // }}

                    value={{
                      start: filters?.fromDate
                        ? parseDate(filters.fromDate)
                        : null,
                      end: filters?.toDate ? parseDate(filters.toDate) : null,
                    }}
                    onChange={(value) => {
                      const formattedStart = value?.start
                        ? `${value.start.year}-${String(value.start.month).padStart(2, "0")}-${String(value.start.day).padStart(2, "0")}`
                        : null;

                      const formattedEnd = value?.end
                        ? `${value.end.year}-${String(value.end.month).padStart(2, "0")}-${String(value.end.day).padStart(2, "0")}`
                        : null;

                      setFilters((prev) => ({
                        ...prev,
                        fromDate: formattedStart,
                        toDate: formattedEnd,
                      }));
                    }}
                  />

                  <Select
                    isRequired
                    errorMessage="please select rating for users"
                    label="Status"
                    items={ESTIMATE_STATUS?.map((stat) => ({
                      key: stat,
                      label: stat,
                    }))}
                    selectedKeys={
                      filters.status ? new Set([filters.status]) : new Set([])
                    }
                    onSelectionChange={(keys) => {
                      const selected = Array.from(keys)[0] || "";
                      setFilters((prev) => ({ ...prev, status: selected }));
                    }}
                  >
                    {(item) => (
                      <SelectItem key={item?.key}>{item?.label}</SelectItem>
                    )}
                  </Select>
                </div>
                <div className="w-full flex justify-end gap-2 mt-4">
                  <Button
                    variant="flat"
                    onPress={() =>
                      setFilters({
                        search: "",
                        status: "",
                        fromDate: "",
                        toDate: "",
                      })
                    }
                  >
                    Reset
                  </Button>

                  {/* <Button
                    color="primary"
                    onPress={() =>
                      setFilteration((prev) => ({ ...prev, page: 1 }))
                    }
                  >
                    Apply
                  </Button> */}
                </div>
              </PopoverContent>
            </Popover>
            <Dropdown>
              <DropdownTrigger className="hidden sm:flex">
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
            Total {count} estimate
          </span>
          <label className="flex items-center text-default-400 text-small">
            Rows per page:
            <select
              className="bg-transparent outline-none text-default-400 text-small"
              onChange={onRowsPerPageChange}
              value={filteration?.size}
            >
              <option value="5">5</option>
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
    filters,
  ]);

  const bottomContent = useMemo(() => {
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
          page={filteration?.page}
          total={pages}
          onChange={(e) => {
            setFilteration((prev) => ({ ...prev, page: e }));
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
  }, [
    selectedKeys,
    count,
    filteration,
    pages,
    onPreviousPage,
    onNextPage,
    dispatch,
  ]);

  return (
    <>
      <h1 className="font-sans text-2xl font-medium mb-1">Estimate list</h1>
      <Table
        isHeaderSticky
        aria-label="Users table with custom cells, pagination, and sorting"
        bottomContent={bottomContent}
        bottomContentPlacement="outside"
        classNames={{
          wrapper: "2xl:max-h-[68vh] md:max-h-[62vh] w-full",
          table: "w-full",
        }}
        // selectedKeys={selectedKeys}
        // selectionMode="multiple"
        sortDescriptor={sortDescriptor}
        topContent={topContent}
        topContentPlacement="outside"
        // onSelectionChange={(keys) => {
        //   setSelectedKeys(keys);
        // }}
        // onSortChange={setSortDescriptor}
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
            <TableRow key={item.id || item.companyId}>
              {(columnKey) => (
                <TableCell>{renderCell(item, columnKey)}</TableCell>
              )}
            </TableRow>
          )}
        </TableBody>
      </Table>
      <Modal
        size="4xl"
        isDismissable={false}
        isKeyboardDismissDisabled={true}
        isOpen={viewModal.isOpen}
        onOpenChange={viewModal.onOpenChange}
        placement="top-center"
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader>Estimate</ModalHeader>
              <ModalBody className="max-h-[70vh] overflow-auto">
                <NewEstimatePreview details={estimateDetail} />
              </ModalBody>
              <ModalFooter className="flex justify-end">
                <Button onPress={onClose}>Cancel</Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      <EstimatePaymentRegister
        isOpen={paymentModal.isOpen}
        onOpenChange={paymentModal.onOpenChange}
        onClose={() => {
          paymentModal.onClose();
          setActiveEstimateId(null);
        }}
        estimateId={activeEstimateId}
        paymentTypes={paymentTypes}
        onSubmitPayment={(payload) => dispatch(createPaymentRegister(payload))}
      />

      <FullCompanyDetailsForm
        isOpen={isOpen}
        onOpen={onOpen}
        onOpenChange={onOpenChange}
        filteration={filteration}
        filters={filters}
      />
    </>
  );
};

export default Estimate;
