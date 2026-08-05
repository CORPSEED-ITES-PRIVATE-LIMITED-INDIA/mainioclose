import {
  Button,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
  Pagination,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
  Input,
  Popover,
  PopoverTrigger,
  PopoverContent,
  Select,
  SelectItem,
  DateRangePicker,
  useDisclosure,
  addToast,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Form,
} from "@heroui/react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  ChevronDown,
  Dot,
  Download,
  EllipsisVertical,
  Info,
  ListFilter,
  Search,
} from "lucide-react";
import { Link, useParams } from "react-router-dom";
import dayjs from "dayjs";
import {
  allVendorsCategory,
  changeProcurementAssignee,
  getAllVendorsRequest,
  getAllVendorsStatus,
  searchInVendorsList,
  vendorsExportReportFilteration,
} from "../toolkit/slices/vendorsSlice";
import { inrCurrency } from "../common";
import NewSelect from "../components/NewSelect";
import { parseDate, parseZonedDateTime } from "@internationalized/date";
import { getProcurementAssigneeList } from "../toolkit/slices/commonSlice";
import { CSVLink } from "react-csv";
import LoadingSpinner from "../components/LoadingSpinner";
import { set } from "zod";

const columns = [
  { name: "ID", uid: "id" },
  { name: "CLIENT NAME", uid: "clientName", sortable: true },
  { name: "COMPANY NAME", uid: "clientCompanyName" },
  { name: "ASSIGNEE", uid: "assigneeName" },
  { name: "CLIENT CONTACT", uid: "clientMobileNumber" },
  { name: "BUDGET", uid: "budgetPrice" },
  { name: "CATEGORY", uid: "vendorCategoryName" },
  { name: "SUB CATEGORY", uid: "vendorSubCategoryName" },
  { name: "RECEIVED DATE", uid: "receivedDate" },
  { name: "COMPLETED DATE", uid: "completedDate" },
  { name: "TAT detail", uid: "tatDetail" },
  { name: "RAISED BY", uid: "raiseBy" },
  { name: "COMMENT", uid: "vendorComment" },
  { name: "ACTIONS", uid: "actions" },
];

function capitalize(s) {
  return s ? s.charAt(0).toUpperCase() + s.slice(1).toLowerCase() : "";
}

const INITIAL_VISIBLE_COLUMNS = [
  "clientName",
  "clientCompanyName",
  "assigneeName",
  "budgetPrice",
  "vendorCategoryName",
  "tatDetail",
  "raiseBy",
  "vendorComment",
  "actions",
];

const VendorRequests = () => {
  const dispatch = useDispatch();
  const { userId } = useParams();
  const filterPopOver = useDisclosure();
  const { isOpen, onOpen, onOpenChange, onClose } = useDisclosure();
  const count = useSelector((state) => state.vendors.totalVendorRequestCount);
  const data =
    useSelector((state) => state.vendors.allVendorsRequestList) || [];
  const vendorsExportData = useSelector(
    (state) => state.vendors.vendorsExportData,
  );
  const vendorStatus = useSelector((state) => state.vendors.vendorsStatus);
  const loading = useSelector((state) => state.vendors.loading);
  const procurementUsers = useSelector(
    (state) => state.common.procurementAssigneeList,
  );
  const userRole = useSelector((state) => state.auth.currentUser?.roles);
  const adminRole = userRole.includes("ADMIN");
  const [filterValue, setFilterValue] = useState("");
  const [selectedKeys, setSelectedKeys] = useState(new Set([]));
  const [visibleColumns, setVisibleColumns] = useState(
    new Set(INITIAL_VISIBLE_COLUMNS),
  );
  const [sortDescriptor, setSortDescriptor] = useState({
    column: "age",
    direction: "ascending",
  });
  const [filteration, setFilteration] = useState({
    page: 1,
    size: 50,
  });
  const [filteLoading, setFilterLoading] = useState("");
  const [filter, setFilter] = useState({
    userIdBy: userId,
    statuses: [],
    startDate: "",
    endDate: "",
    userIds: [],
  });
  const [rowItem, setRowItem] = useState(null);
  const [assigneeId, setAssigneeId] = useState(null);

  useEffect(() => {
    dispatch(allVendorsCategory());
    dispatch(getAllVendorsRequest({ userId, ...filteration }));
    dispatch(getAllVendorsStatus());
    dispatch(getProcurementAssigneeList(userId));
  }, [dispatch]);

  const headerColumns = useMemo(() => {
    if (visibleColumns === "all") return columns;
    return columns.filter((column) =>
      Array.from(visibleColumns).includes(column.uid),
    );
  }, [visibleColumns]);

  const pages = Math.ceil(count / filteration?.size) || 1;

  const sortedItems = useMemo(() => {
    return [...data].sort((a, b) => {
      const first = a[sortDescriptor.column];
      const second = b[sortDescriptor.column];
      const cmp = first < second ? -1 : first > second ? 1 : 0;
      return sortDescriptor.direction === "descending" ? -cmp : cmp;
    });
  }, [sortDescriptor, data]);

  const exportData = vendorsExportData?.map((row) => ({
    Id: row?.id,
    "Client name": row?.clientName,
    Status: row?.currentStatus,
    "Genrated by": row?.generateByPersonName,
    "Sub Category name": row?.subCategoryName,
    "Assigned to": row?.assignedToPersonName,
    "Start date": row?.startDate,
    "End date": row?.endDate,
    "Completion date": row?.completionDate,
    "Completion days": row?.completionDays,
    "Research TAT": row?.vendorCategoryResearchTat,
    "Completion TAT": row?.vendorCompletionTat,
    "Left TAT": row?.tatDaysLeft,
    "Over Due TAT": row?.overDueTat,
  }));

  const headers = [
    "Id",
    "Client name",
    "Status",
    "Genrated by",
    "Sub Category name",
    "Assigned to",
    "Start date",
    "End date",
    "Completion date",
    "Completion days",
    "Research TAT",
    "Completion TAT",
    "Left TAT",
    "Over Due TAT",
  ];

  const handlePressChangeAssignee = (rowItem) => {
    setRowItem(rowItem);
    setAssigneeId(String(rowItem?.assigneeId));
    onOpen();
  };

  const handleChangeAssignee = () => {
    setFilterLoading("pending");
    dispatch(
      changeProcurementAssignee({
        data: [rowItem?.id],
        updatedById: userId,
        assigneeToId: assigneeId,
      }),
    )
      .then((resp) => {
        if (resp.meta.requestStatus === "fulfilled") {
          addToast({
            title: "Assignee changed successfully",
            color: "success",
          });
          setFilterLoading("success");
          dispatch(getAllVendorsRequest({ userId, ...filteration }));
          setAssigneeId(null);
          setRowItem(null);
          onClose();
        } else {
          setFilterLoading("rejected");
          addToast({ title: "Error in changing assignee", color: "danger" });
        }
      })
      .catch(() => {
        setFilterLoading("rejected");
        addToast({ title: "Error in changing assignee", color: "danger" });
      });
  };

  const renderCell = useCallback(
    (rowData, columnKey) => {
      switch (columnKey) {
        case "clientName":
          return (
            <div className="flex items-center gap-0">
              <Dot
                className="w-12 h-12 m-0 p-0"
                color={
                  rowData?.status === "Finished"
                    ? "green"
                    : rowData?.status === "Cancel"
                      ? "black"
                      : "red"
                }
              />

              <Link
                className="font-medium flex flex-col"
                to={`${rowData?.id}/${rowData?.leadId}/requestDetail`}
              >
                {rowData?.clientName}
                <span className="text-default-400 text-sm">
                  {dayjs(rowData?.receivedDate).format("DD-MM-YYYY, hh:mm a")}
                </span>
              </Link>
            </div>
          );
        case "clientCompanyName":
          return (
            <div className="flex flex-col">
              <span className="font-normal">{rowData?.clientCompanyName}</span>
            </div>
          );
        case "clientMobileNumber":
          return (
            <div className="flex flex-col">
              <span className="font-normal">{rowData?.clientEmailId}</span>
              <span className="text-sm text-gray-400">
                {rowData?.clientMobileNumber || "---"}
              </span>
            </div>
          );
        case "budgetPrice":
          return (
            <div className="flex flex-col">
              <span className="font-normal">
                {" "}
                {inrCurrency(rowData?.budgetPrice)}
              </span>
            </div>
          );
        case "vendorCategoryName":
          return (
            <div className="flex flex-col gap-1">
              <span className="font-semibold">
                {rowData.vendorCategoryName || "-"}
              </span>
              {rowData?.vendorSubCategoryName && (
                <span className="text-xs text-foreground-400">
                  {rowData?.vendorSubCategoryName}
                </span>
              )}
            </div>
          );

        case "assigneeName":
          return (
            <div className="flex flex-col">
              <span className="">{rowData?.assigneeName || "-"}</span>
            </div>
          );
        case "requirementDescription":
          return (
            <div className="flex flex-col">
              <span className="">{rowData?.requirementDescription || "-"}</span>
            </div>
          );
        case "tatDetail":
          return (
            <div className="flex justify-between items-start">
              <div className="flex flex-col">
                <span className="">
                  Completion days : {rowData?.completionDays || "-"}
                </span>
                <span className="text-xs text-foreground-400">
                  Days left : {rowData?.tatDaysLeft || "-"}
                </span>
                <span className="text-xs text-foreground-400">
                  Overdue : {rowData?.overDueTat || "-"}
                </span>
                <span className="text-xs text-foreground-400">
                  Subcategory TAT : {rowData?.subCategoryTatDays || "-"}
                </span>
              </div>
              <Popover>
                <PopoverTrigger>
                  <Button size="sm" variant="light" isIconOnly>
                    <Info className="h-4 w-4" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent>
                  {(titleProps) => (
                    <div className="px-1 py-2">
                      <h3 className="text-small font-bold" {...titleProps}>
                        Updated history
                      </h3>
                      <div className="text-tiny">
                        {rowData?.updateHistory?.map((item, idx) => {
                          return (
                            <div
                              className="flex flex-col my-4"
                              key={`history${idx}`}
                            >
                              <span className="">
                                Status : {item?.requestStatus || "-"}
                              </span>
                              <span className="text-xs text-foreground-400">
                                Updated on :{" "}
                                {dayjs(item?.updateDate).format(
                                  "DD-MM-YYYY , hh:mm a",
                                ) || "-"}
                              </span>
                              <span className="text-xs text-foreground-400">
                                Updated description :{" "}
                                {item?.updateDescription || "-"}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </PopoverContent>
              </Popover>
            </div>
          );
        case "actions":
          return (
            <div className="relative flex justify-center items-center gap-2">
              {adminRole && (
                <Dropdown>
                  <DropdownTrigger>
                    <Button isIconOnly size="sm" variant="light">
                      <EllipsisVertical />
                    </Button>
                  </DropdownTrigger>
                  <DropdownMenu selectionMode="single">
                    <DropdownItem
                      key="updateAssignee"
                      onPress={() => handlePressChangeAssignee(rowData)}
                    >
                      Change assignee
                    </DropdownItem>
                    {/* <DropdownItem key="delete" color="danger">
                  Delete
                </DropdownItem> */}
                  </DropdownMenu>
                </Dropdown>
              )}
            </div>
          );
        default:
          return rowData[columnKey] || "-";
      }
    },
    [adminRole],
  );

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
      dispatch(searchInVendorsList({ userId, searchInput: value }));
    } else {
      setFilterValue("");
      dispatch(getAllVendorsRequest({ userId, ...filteration }));
    }
  }, []);

  const onClear = useCallback(() => {
    setFilterValue("");
    setFilteration((prev) => ({ ...prev, page: 1 }));
  }, []);

  const handleFilter = useCallback(() => {
    setFilterLoading("pending");
    dispatch(vendorsExportReportFilteration(filter))
      .then((resp) => {
        if (resp.meta.requestStatus === "fulfilled") {
          setFilterLoading("success");
          addToast({ title: "Data is ready to export", color: "success" });
        } else {
          setFilterLoading("rejected");
          addToast({ title: "Some issue in data export", color: "danger" });
        }
      })
      .catch(() => {
        setFilterLoading("rejected");
        addToast({ title: "Some issue in data export", color: "danger" });
      });
  }, [dispatch, filter]);

  const handleResetFilter = () => {
    setFilter({
      userIdBy: userId,
      statuses: [],
      startDate: null,
      endDate: null,
      userIds: [],
    });
    dispatch(getAllVendorsRequest({ userId, ...filteration }));
  };

  const topContent = useMemo(() => {
    return (
      <div className="flex flex-col gap-4">
        <div className="flex justify-between gap-3 items-end">
          <Input
            isClearable
            className="w-full sm:max-w-[35%]"
            placeholder="Search ..."
            startContent={<Search />}
            value={filterValue}
            onClear={() => onClear()}
            onValueChange={onSearchChange}
          />
          <div className="flex gap-3">
            {adminRole && (
              <>
                <Popover
                  showArrow
                  isOpen={filterPopOver.isOpen}
                  onOpenChange={(e) => filterPopOver.onOpenChange(e)}
                >
                  <PopoverTrigger>
                    <Button variant="flat" endContent={<ListFilter />}>
                      Filter
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="min-w-[550px]">
                    {(titleProps) => (
                      <div className="px-1 py-2">
                        <h3 className="my-4 font-bold text-xl" {...titleProps}>
                          Filter
                        </h3>
                        <div className="grid gap-4 min-w-[500px]">
                          <div>
                            <DateRangePicker
                              isRequired
                              // hideTimeZone
                              // granularity="minute"
                              // hourCycle={24}
                              visibleMonths={2}
                              label="Created date"
                              value={{
                                start: filter?.startDate
                                  ? parseDate(`${filter?.startDate}`)
                                  : null,
                                end: filter?.endDate
                                  ? parseDate(`${filter?.endDate}`)
                                  : null,
                              }}
                              onChange={(value) => {
                                const formattedStart = value.start
                                  ? `${value.start.year}-${String(value.start.month).padStart(2, "0")}-${String(value.start.day).padStart(2, "0")}`
                                  : null;
                                const formattedEnd = value.end
                                  ? `${value.end.year}-${String(value.end.month).padStart(2, "0")}-${String(value.end.day).padStart(2, "0")}`
                                  : null;
                                setFilter((prev) => ({
                                  ...prev,
                                  startDate: formattedStart,
                                  endDate: formattedEnd,
                                }));
                              }}
                            />
                          </div>
                          <Select
                            label={"Status"}
                            name={"statusId"}
                            selectionMode="multiple"
                            selectedKeys={new Set(filter?.statuses || [])}
                            onSelectionChange={(e) => {
                              let values = Array.from(e);
                              setFilter((prev) => ({
                                ...prev,
                                statuses: values.length > 0 ? values : [],
                              }));
                            }}
                          >
                            {vendorStatus.map((status) => (
                              <SelectItem key={status?.statusName}>
                                {status?.statusName}
                              </SelectItem>
                            ))}
                          </Select>

                          <NewSelect
                            data={procurementUsers || []}
                            label={"User"}
                            name={"userIds"}
                            labelKey={"fullName"}
                            valueKey={"id"}
                            selectionMode="multiple"
                            value={filter?.userIds}
                            onChange={(selectedSet) => {
                              setFilter((prev) => ({
                                ...prev,
                                userIds: selectedSet,
                              }));
                            }}
                          />
                        </div>
                        <div className="flex justify-end gap-2 my-2">
                          <Button onPress={handleResetFilter}>Reset</Button>
                          <Button
                            color="primary"
                            isDisabled={
                              filter?.startDate === "" || filter?.endDate === ""
                            }
                            onPress={handleFilter}
                          >
                            Apply
                          </Button>
                        </div>
                      </div>
                    )}
                  </PopoverContent>
                </Popover>
                <CSVLink
                  className="text-white"
                  data={exportData}
                  headers={headers}
                  filename={"procurement.csv"}
                >
                  <Button startContent={<Download />} variant="flat">
                    Export
                  </Button>
                </CSVLink>
              </>
            )}

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
            Total {count} vendors request
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
    data,
    vendorStatus,
    procurementUsers,
    filter,
    filterPopOver,
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
  }, [selectedKeys, count, filteration, pages, onPreviousPage, onNextPage]);

  return (
    <>
      <h1 className="font-sans text-lg font-semibold mb-2 shrink-0">
        Vendor's requests
      </h1>
      {(filteLoading === "pending" || loading === "pending") && (
        <LoadingSpinner />
      )}
      <Table
        isHeaderSticky
        aria-label="Users table with custom cells, pagination, and sorting"
        bottomContent={bottomContent}
        bottomContentPlacement="outside"
        classNames={{
          wrapper: "max-h-[65vh] w-full",
          table: "w-full overflow-scroll",
        }}
        selectedKeys={selectedKeys}
        selectionMode="multiple"
        sortDescriptor={sortDescriptor}
        topContent={topContent}
        topContentPlacement="outside"
        onSelectionChange={(keys) => {
          setSelectedKeys(keys);
        }}
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
            <TableRow key={item.id || item.companyId}>
              {(columnKey) => (
                <TableCell>{renderCell(item, columnKey)}</TableCell>
              )}
            </TableRow>
          )}
        </TableBody>
      </Table>
      <Modal isOpen={isOpen} onOpenChange={onOpenChange} size="2xl">
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                Update assignee
              </ModalHeader>
              <ModalBody className="w-full">
                <Form
                  className="w-full"
                  onSubmit={(e) => {
                    e.preventDefault();
                    let data = Object.fromEntries(
                      new FormData(e.currentTarget),
                    );
                    handleChangeAssignee(data);
                  }}
                >
                  <div className="grid gap-2 w-full">
                    <NewSelect
                      data={procurementUsers || []}
                      label={"Assignee"}
                      name={"userIds"}
                      labelKey={"fullName"}
                      valueKey={"id"}
                      value={assigneeId}
                      onChange={(selectedSet) => {
                        if (selectedSet) {
                          setAssigneeId(selectedSet);
                        }
                      }}
                    />
                  </div>
                  <ModalFooter className="flex justify-end gap-2 w-full">
                    <Button onPress={onClose}>Cancel</Button>
                    <Button color="primary" type="submit">
                      Submit
                    </Button>
                  </ModalFooter>
                </Form>
              </ModalBody>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
};

export default VendorRequests;
