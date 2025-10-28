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
  Chip,
  Popover,
  PopoverTrigger,
  PopoverContent,
  DateRangePicker,
  Select,
  addToast,
  SelectItem,
  useDisclosure,
} from "@heroui/react";
import { ChevronDown, ListFilter, Search, Upload } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import {
  getAllAutoHistoryForExportByDate,
  getAllAutoHistoryList,
  getAllAutoHistroryCount,
  getAllLeadUser,
} from "../../toolkit/slices/leadSlice";
import { Link, useParams } from "react-router-dom";
import dayjs from "dayjs";
import NewSelect from "../../components/NewSelect";
import { getAllStatusData } from "../../toolkit/slices/settingSlice";
import { CSVLink } from "react-csv";
import { formatedDateTime, leadSource } from "../../common";

export const columns = [
  { name: "ID", uid: "id" },
  { name: "LEAD NAME", uid: "leadname", sortable: true },
  { name: "STATUS", uid: "status" },
  { name: "CLIENT", uid: "client" },
  { name: "ASSIGNEE", uid: "assignee" },
  { name: "PREV.ASSIGNEE", uid: "prevassignee" },
  { name: "ASS.DATE", uid: "assignDate" },
  { name: "DESCRIPTION", uid: "description" },
];

export function capitalize(s) {
  return s ? s.charAt(0).toUpperCase() + s.slice(1).toLowerCase() : "";
}

const INITIAL_VISIBLE_COLUMNS = [
  "id",
  "leadname",
  "status",
  "client",
  "assignee",
  "prevassignee",
  "assignDate",
];

const AutoHistory = () => {
  const dispatch = useDispatch();
  const { userId } = useParams();
  const { isOpen, onOpenChange, onClose } = useDisclosure();
  const data = useSelector((state) => state.leads.autoList);
  const count = useSelector((state) => state.leads.totalAutoListCount);
  const allLeadUser = useSelector((state) => state.leads.leadUsersList);
  const statusList = useSelector((state) => state?.setting?.statusList);
  const autoHistoryExportList = useSelector(
    (state) => state.leads.autoHistoryExportList
  );
  const autoExportLoading = useSelector(
    (state) => state.leads.autoExportLoading
  );
  const [filterValue, setFilterValue] = React.useState("");
  const [selectedKeys, setSelectedKeys] = React.useState(new Set([]));
  const [visibleColumns, setVisibleColumns] = React.useState(
    new Set(INITIAL_VISIBLE_COLUMNS)
  );
  const [rowsPerPage, setRowsPerPage] = React.useState(50);
  const [sortDescriptor, setSortDescriptor] = React.useState({
    column: "age",
    direction: "ascending",
  });
  const [department, setDepartment] = useState("All");
  const [page, setPage] = React.useState(1);
  const hasSearchFilter = Boolean(filterValue);
  const [dateFilter, setDateFilter] = useState({
    toDate: "",
    fromDate: "",
    departmentId: null,
    assignType:null,
    statusIds: [],
    assigneeIds: [],
    source: [],
  });

  useEffect(() => {
    dispatch(
      getAllAutoHistoryList({ page, size: rowsPerPage, data: dateFilter })
    );
    dispatch(getAllAutoHistroryCount(dateFilter));
  }, [dispatch, page, rowsPerPage, dateFilter]); // Added dateFilter to dependencies

  const headerColumns = React.useMemo(() => {
    if (visibleColumns === "all") return columns;

    return columns.filter((column) =>
      Array.from(visibleColumns).includes(column.uid)
    );
  }, [visibleColumns]);

  const filteredItems = React.useMemo(() => {
    let filteredUsers = [...(data || [])];

    if (hasSearchFilter) {
      filteredUsers = filteredUsers.filter((item) =>
        Object.values(item)?.some((val) =>
          String(val)?.toLowerCase()?.includes(filterValue?.toLowerCase())
        )
      );
    }

    return filteredUsers;
  }, [data, filterValue]);

  const pages = Math.ceil(count / rowsPerPage) || 1;

  const items = React.useMemo(() => {
    return filteredItems; // Removed client-side slice; use server-paginated data directly
  }, [filteredItems]);

  const sortedItems = React.useMemo(() => {
    return [...items].sort((a, b) => {
      const first = a[sortDescriptor.column];
      const second = b[sortDescriptor.column];
      const cmp = first < second ? -1 : first > second ? 1 : 0;

      return sortDescriptor.direction === "descending" ? -cmp : cmp;
    });
  }, [sortDescriptor, items]);

  const renderCell = React.useCallback((rowData, columnKey) => {
    const cellValue = rowData[columnKey];
    switch (columnKey) {
      case "leadname":
        return (
          <div className="flex flex-col">
            <Link
              to={`${rowData?.leadId}/leadDetail`}
              className="font-semibold"
            >
              {rowData.leadOriginalName || "-"}
            </Link>
            <Chip
              size="sm"
              className="text-sm"
              color={rowData.manual ? "success" : "default"}
            >
              {rowData.manual ? "Manual" : "Auto"}
            </Chip>
          </div>
        );
      case "status":
        return (
          <div className="flex flex-col">
            <span className="font-normal">{rowData.status || "-"}</span>
          </div>
        );
      case "client":
        return (
          <div className="flex flex-col">
            <span className="font-normal">{rowData.clientEmail || "-"}</span>
            <span className="text-sm text-muted-foreground">
              {rowData.mobileNo}
            </span>
          </div>
        );
      case "assignee":
        return (
          <div className="flex flex-col">
            <span className="font-normal">{rowData.currName || "-"}</span>
            <span className="text-sm text-muted-foreground">
              {rowData.currEmail}
            </span>
          </div>
        );
      case "prevassignee":
        return (
          <div className="flex flex-col">
            <span className="font-normal">{rowData.paName || "-"}</span>
            <span className="text-sm text-muted-foreground">
              {rowData.paEmail}
            </span>
          </div>
        );
      case "assignDate":
        return (
          <div className="flex flex-col">
            <span className="font-normal">
              {dayjs(rowData?.assignDate).format("DD-MM-YYYY HH:mm ")}
            </span>
          </div>
        );
      case "description":
        return (
          <div className="flex flex-col">
            <span className="font-normal">{rowData.description}</span>
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

  const onSearchChange = React.useCallback((value) => {
    if (value) {
      setFilterValue(value);
      setPage(1);
    } else {
      setFilterValue("");
    }
  }, []);

  const onClear = React.useCallback(() => {
    setFilterValue("");
    setPage(1);
  }, []);

  const handleApplyFilter = () => {
    setPage(1); // Reset to page 1 on filter apply
    dispatch(
      getAllAutoHistoryList({ page: 1, size: rowsPerPage, data: dateFilter })
    );
    dispatch(getAllAutoHistroryCount(dateFilter));
    dispatch(getAllAutoHistoryForExportByDate(dateFilter))
      .then((resp) => {
        if (resp.meta.requestStatus === "fulfilled") {
          addToast({ title: "Data is ready to export !.", color: "success" });
        } else {
          addToast({ title: "Something went wrong !.", color: "danger" });
        }
      })
      .catch((err) =>
        addToast({ title: "Something went wrong !.", color: "danger" })
      );
    onClose();
  };

  const handleResetFilter = () => {
    setPage(1); // Reset to page 1 on reset
    dispatch(
      getAllAutoHistoryList({
        page: 1,
        size: rowsPerPage,
        data: {
          toDate: "",
          fromDate: "",
          departmentId: "",
          assignType: "",
          statusIds: [],
          assigneeIds: [],
        },
      })
    );
  };

  const exportData = autoHistoryExportList?.map((row) => ({
    Id: row?.id,
    "Lead Id": row?.leadId,
    "Lead name": row?.leadOriginalName,
    Status: row?.status,
    Manual: row?.manual ? "Manual" : "Auto",
    Description: row?.description,
    "Client Email": row?.clientEmail,
    "Mobile no.": row?.mobileNo,
    "Previous Assignee person": row?.paName,
    "Previous Assignee email": row?.paEmail,
    "Current Assignee person": row?.currName,
    "Current Assignee email": row?.currEmail,
    "Created Date": dayjs(row?.assignDate).format("YYYY-MM-DD"),
  }));

  const headers = [
    "Id",
    "Lead Id",
    "Lead name",
    "Status",
    "Manual",
    "Description",
    "Client Email",
    "Mobile no.",
    "Previous Assignee person",
    "Previous Assignee email",
    "Current Assignee person",
    "Current Assignee email",
    "Created Date",
  ];

  const topContent = React.useMemo(() => {
    return (
      <div className="flex flex-col gap-4">
        <div className="flex justify-between gap-3 items-end">
          <Input
            isClearable
            className="w-full sm:max-w-[35%]"
            placeholder="Search..."
            startContent={<Search />}
            value={filterValue}
            onClear={() => onClear()}
            onValueChange={onSearchChange}
          />
          <div className="flex gap-3">
            <Dropdown>
              <DropdownTrigger className="hidden sm:flex">
                <Button endContent={<ChevronDown />} variant="flat">
                  {department}
                </Button>
              </DropdownTrigger>
              <DropdownMenu
                disallowEmptySelection
                aria-label="Table Columns"
                closeOnSelect={false}
                selectedKeys={[dateFilter?.departmentId]}
                selectionMode="single"
                onSelectionChange={(e) => {
                  let value = Array.from(e)[0];
                  setDateFilter((prev) => ({ ...prev, departmentId: value }));
                  setPage(1); // Reset to page 1 on department change
                  dispatch(
                    getAllAutoHistoryList({
                      page: 1,
                      size: rowsPerPage,
                      data: { ...dateFilter, departmentId: value },
                    })
                  );
                  dispatch(
                    getAllAutoHistroryCount({
                      ...dateFilter,
                      departmentId: value,
                    })
                  );
                }}
              >
                {[
                  { name: "All", uid: "" },
                  { name: "Sales", uid: "2" },
                  { name: "Quality", uid: "3" },
                ].map((column) => (
                  <DropdownItem
                    key={column.uid}
                    className="capitalize"
                    onPress={() => setDepartment(column.name)}
                  >
                    {capitalize(column.name)}
                  </DropdownItem>
                ))}
              </DropdownMenu>
            </Dropdown>
            <Popover
              size="lg"
              showArrow
              isOpen={isOpen}
              onOpenChange={(e) => {
                onOpenChange(e);
                if (e) {
                  dispatch(getAllLeadUser(userId));
                  dispatch(getAllStatusData());
                }
              }}
            >
              <PopoverTrigger>
                <Button variant="flat" endContent={<ListFilter />}>
                  Filter
                </Button>
              </PopoverTrigger>
              <PopoverContent>
                {(titleProps) => (
                  <div className="px-1 py-2">
                    <h3 className="my-4 font-bold text-xl" {...titleProps}>
                      Lead filter
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                      <NewSelect
                        data={allLeadUser || []}
                        selectionMode="multiple"
                        label={"Select users"}
                        name={"assigneeIds"}
                        labelKey={"fullName"}
                        valueKey={"id"}
                        value={dateFilter?.assigneeIds}
                        onChange={(selectedSet) => {
                          setDateFilter((prev) => ({
                            ...prev,
                            assigneeIds: selectedSet,
                          }));
                        }}
                      />

                      <DateRangePicker
                        hideTimeZone
                        granularity="minute"
                        hourCycle={24}
                        visibleMonths={2}
                        label="Created date"
                        onChange={(range) => {
                          setDateFilter((prev) => ({
                            ...prev,
                            toDate: formatedDateTime(range?.start),
                            fromDate: formatedDateTime(range?.end),
                          }));
                        }}
                      />

                      <NewSelect
                        data={statusList}
                        label={"Status"}
                        name={"statusIds"}
                        selectionMode="multiple"
                        labelKey={"name"}
                        valueKey={"id"}
                        value={dateFilter?.statusIds}
                        onChange={(selectedSet) => {
                          setDateFilter((prev) => ({
                            ...prev,
                            statusIds: selectedSet,
                          }));
                        }}
                      />

                      <Select
                        label="Source"
                        selectionMode="multiple"
                        items={
                          leadSource?.map((item) => ({
                            label: item,
                            key: item,
                          })) || []
                        }
                        selectedKeys={dateFilter?.source}
                        onSelectionChange={(e) =>
                          setDateFilter((prev) => ({
                            ...prev,
                            source: Array.from(e),
                          }))
                        }
                      >
                        {(source) => (
                          <SelectItem key={source.key}>
                            {source.label}
                          </SelectItem>
                        )}
                      </Select>
                      <Select
                        label="Assign type"
                        selectionMode="single"
                        items={[
                          { label: "Manual", key: "Manual" },
                          { label: "Auto", key: "Auto" },
                        ]}
                        selectedKeys={[dateFilter?.assignType]}
                        onSelectionChange={(e) =>
                          setDateFilter((prev) => ({
                            ...prev,
                            assignType: Array.from(e)[0],
                          }))
                        }
                      >
                        {(source) => (
                          <SelectItem key={source.key}>
                            {source.label}
                          </SelectItem>
                        )}
                      </Select>
                    </div>
                    <div className="flex justify-end gap-2 my-2">
                      <Button onPress={handleResetFilter}>Reset</Button>
                      <Button color="primary" onPress={handleApplyFilter}>
                        Apply
                      </Button>
                    </div>
                  </div>
                )}
              </PopoverContent>
            </Popover>
            <CSVLink
              data={exportData}
              headers={headers}
              filename={"history.csv"}
            >
              <Button
                isDisabled={autoExportLoading !== "success"}
                endContent={<Upload />}
              >
                Export
              </Button>
            </CSVLink>
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
            Total {count} auto history
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
    allLeadUser,
    dateFilter,
    handleApplyFilter,
    handleResetFilter,
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
      <h1 className="font-sans text-2xl font-medium mb-1">Auto history list</h1>
      <Table
        isHeaderSticky
        aria-label="Example table with custom cells, pagination and sorting"
        bottomContent={bottomContent}
        bottomContentPlacement="outside"
        classNames={{
          wrapper: "max-h-[68vh] w-full",
          table:'w-full'
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
    </>
  );
};

export default AutoHistory;