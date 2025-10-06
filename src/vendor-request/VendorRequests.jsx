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
} from "@heroui/react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { ChevronDown, EllipsisVertical, Info, Search } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import dayjs from "dayjs";
import {
  allVendorsCategory,
  getAllVendorsRequest,
} from "../toolkit/slices/vendorsSlice";
import { inrCurrency } from "../common";

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
  const count = useSelector((state) => state.vendors.totalVendorRequestCount);
  const data =
    useSelector((state) => state.vendors.allVendorsRequestList) || [];
  const [filterValue, setFilterValue] = useState("");
  const [selectedKeys, setSelectedKeys] = useState(new Set([]));
  const [visibleColumns, setVisibleColumns] = useState(
    new Set(INITIAL_VISIBLE_COLUMNS)
  );
  const [sortDescriptor, setSortDescriptor] = useState({
    column: "age",
    direction: "ascending",
  });
  const [filteration, setFilteration] = useState({
    page: 1,
    size: 50,
  });
  const hasSearchFilter = Boolean(filterValue);

  useEffect(() => {
    dispatch(allVendorsCategory());
    dispatch(getAllVendorsRequest({ userId, ...filteration }));
  }, [dispatch]);

  const headerColumns = useMemo(() => {
    if (visibleColumns === "all") return columns;
    return columns.filter((column) =>
      Array.from(visibleColumns).includes(column.uid)
    );
  }, [visibleColumns]);

  const filteredItems = useMemo(() => {
    let filteredData = [...data];
    if (hasSearchFilter) {
      filteredData = filteredData.filter((item) =>
        item?.contactPersonName
          ?.toLowerCase()
          .includes(filterValue.toLowerCase())
      );
    }
    return filteredData;
  }, [data, filterValue]);

  const pages = Math.ceil(count / filteration?.size) || 1;

  const sortedItems = useMemo(() => {
    return [...filteredItems].sort((a, b) => {
      const first = a[sortDescriptor.column];
      const second = b[sortDescriptor.column];
      const cmp = first < second ? -1 : first > second ? 1 : 0;
      return sortDescriptor.direction === "descending" ? -cmp : cmp;
    });
  }, [sortDescriptor, filteredItems]);

  const renderCell = useCallback((rowData, columnKey) => {
    switch (columnKey) {
      case "clientName":
        return (
          <div className="flex items-start gap-2">
            <Link
              className="font-medium"
              to={`${rowData?.id}/${rowData?.leadId}/requestDetail`}
            >
              {rowData?.clientName}
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
                Sub-Category : {rowData?.vendorSubCategoryName}
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
                                "DD-MM-YYYY , hh:mm a"
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
                    handleActionsPress(rowData);
                  }
                }}
              >
                <DropdownItem key="edit">Edit</DropdownItem>
                <DropdownItem key="delete" color="danger">
                  Delete
                </DropdownItem>
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
            isClearable
            className="w-full sm:max-w-[35%]"
            placeholder="Search ..."
            startContent={<Search />}
            value={filterValue}
            onClear={() => onClear()}
            onValueChange={onSearchChange}
          />
          <div className="flex gap-3">
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
      <h1 className="font-sans text-2xl font-medium mb-1">Vendor's requests</h1>
      <Table
        isHeaderSticky
        aria-label="Users table with custom cells, pagination, and sorting"
        bottomContent={bottomContent}
        bottomContentPlacement="outside"
        classNames={{
          wrapper: "max-h-[50vh] max-w-full",
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
    </>
  );
};

export default VendorRequests;
