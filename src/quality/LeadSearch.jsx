import { Input } from "@heroui/input";
import {
  Button,
  Chip,
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
} from "@heroui/react";
import { ChevronDown, EllipsisVertical, Search } from "lucide-react";
import { useCallback, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { searchIvrLeads } from "../toolkit/slices/leadSlice";
import dayjs from "dayjs";
import { Link, useParams } from "react-router-dom";

export const columns = (admin) => [
  { name: "ID", uid: "id" },
  { name: "LEAD NAME", uid: "leadName" },
  ...(admin ? [{ name: "CONTACT", uid: "contact" }] : []),
  { name: "STATUS", uid: "status" },
  { name: "ASSIGNEE", uid: "assignee" },
  { name: "UPDATED BY", uid: "updatedBy" },
  { name: "SOURCE", uid: "source" },
  { name: "INDUSTRY", uid: "industry" },
  { name: "ADDRESS", uid: "address" },
  { name: "ACTIONS", uid: "actions" },
];

export function capitalize(s) {
  return s ? s.charAt(0).toUpperCase() + s.slice(1).toLowerCase() : "";
}

const INITIAL_VISIBLE_COLUMNS = (admin) => [
  "leadName",
  ...(admin ? ["contact"] : []),
  "assignee",
  "source",
  "updatedBy",
  "status",
  "address",
  "actions",
];

const LeadSearch = () => {
  const dispatch = useDispatch();
  const { userId } = useParams();
  const data = useSelector((state) => state.leads.leadSearchList);
  const count = data?.length || 0;
  const userRole = useSelector((state) => state.auth.currentUser?.roles);
  const adminRole = userRole.includes("ADMIN");
  const [filterValue, setFilterValue] = useState("");
  const [selectedKeys, setSelectedKeys] = useState([]);
  const [visibleColumns, setVisibleColumns] = useState(
    new Set(INITIAL_VISIBLE_COLUMNS(adminRole)),
  );
  const [sortDescriptor, setSortDescriptor] = useState({
    column: "leadName",
    direction: "ascending",
  });
  const [paginationData, setPaginationData] = useState({ page: 1, size: 50 });

  const headerColumns = useMemo(() => {
    const cols = columns(adminRole);
    if (visibleColumns === "all") return cols;

    return cols.filter((column) =>
      Array.from(visibleColumns).includes(column.uid),
    );
  }, [visibleColumns, adminRole]);

  const items = useMemo(() => data || [], [data]);

  const sortedItems = useMemo(() => {
    const sorted = [...items];
    if (sortDescriptor.column) {
      sorted.sort((a, b) => {
        let first = a[sortDescriptor.column];
        let second = b[sortDescriptor.column];
        const firstStr = first?.toString?.() ?? "";
        const secondStr = second?.toString?.() ?? "";
        const cmp = firstStr.localeCompare(secondStr);
        return sortDescriptor.direction === "descending" ? cmp : -cmp;
      });
    }
    return sorted;
  }, [items, sortDescriptor]);

  const paginatedItems = useMemo(() => {
    const from = (paginationData.page - 1) * paginationData.size;
    const to = from + paginationData.size;
    return sortedItems.slice(from, to);
  }, [sortedItems, paginationData.page, paginationData.size]);

  const pages = Math.ceil(count / paginationData?.size) || 1;

  // console.log("paginatedItems", paginatedItems);
  // console.log("sortedItems", paginatedItems);
  // console.log("Items", items);

  const renderCell = useCallback(
    (lead, columnKey) => {
      switch (columnKey) {
        case "leadName":
          return (
            <div className="flex flex-col">
              <p className="text-[12.5px] font-semibold">
                {lead?.leadName || "-"}
              </p>
              <span className="text-[11.5px] text-default-400">
                {dayjs(lead?.createDate).format("DD-MM-YYYY")}
              </span>
            </div>
          );
        case "contact":
          return (
            <div className="flex flex-col">
              <span className="text-[12.5px] font-normal">
                {lead?.email || "-"}
              </span>
              <span className="text-[11.5px] text-default-400">
                {lead?.mobileNo || "-"}
              </span>
            </div>
          );
        case "status":
          return (
            <Chip
              className="capitalize"
              color="primary"
              size="sm"
              variant="flat"
            >
              {lead?.status?.name || "Unknown"}
            </Chip>
          );
        case "assignee":
          return (
            <div className="flex flex-col">
              <span className="text-[12.5px] font-semibold">
                {lead?.assignee?.fullName || "-"}
              </span>
              <span className="text-[11.5px] text-default-400">
                {lead?.assignee?.email || "-"}
              </span>
            </div>
          );
        case "industry":
          return (
            <span className="text-[12.5px]">
              {lead?.industries?.name || "-"}
            </span>
          );
        case "city":
          return <span className="text-[12.5px]">{lead?.city || "-"}</span>;
        case "source":
          return <span className="text-[12.5px]">{lead?.source || "-"}</span>;
        case "updatedBy":
          return (
            <div className="flex flex-col gap-0.5">
              <span className="text-[12.5px] font-normal">
                {lead?.updatedBy?.fullName}
              </span>
              <span className="text-[11.5px] text-default-400">
                {lead?.updatedDate
                  ? dayjs(lead?.updatedDate).format("DD-MM-YYYY")
                  : "-"}
              </span>
            </div>
          );
        case "address":
          return (
            <div className="flex flex-col">
              <span className="text-[12.5px] font-normal">
                {lead?.address || "-"}
              </span>
              <span className="text-[11.5px] text-default-500">
                {[lead?.city, lead?.state, lead?.country].join(",")}
              </span>
            </div>
          );
        case "actions":
          return (
            <div className="relative flex justify-center items-center gap-2">
              <Dropdown>
                <DropdownTrigger>
                  <Button isIconOnly size="sm" variant="light">
                    <EllipsisVertical className="w-4 h-4 text-default-300" />
                  </Button>
                </DropdownTrigger>
                <DropdownMenu
                  selectionMode="single"
                  onSelectionChange={(e) => {
                    let key = Array.from(e);
                  }}
                >
                  <DropdownItem
                    key="history"
                    href={`erp/${userId}/quality/leads/${lead?.id}/leadHistory`}
                  >
                    History
                  </DropdownItem>
                </DropdownMenu>
              </Dropdown>
            </div>
          );
        default:
          return lead[columnKey] || "-";
      }
    },
    [userId],
  );

  const onNextPage = useCallback(() => {
    if (paginationData?.page < pages) {
      setPaginationData((prev) => ({ ...prev, page: prev.page + 1 }));
    }
  }, [paginationData, pages]);

  const onPreviousPage = useCallback(() => {
    if (paginationData?.page > 1) {
      setPaginationData((prev) => ({ ...prev, page: prev.page - 1 }));
    }
  }, [paginationData]);

  const onRowsPerPageChange = useCallback((e) => {
    setPaginationData((prev) => ({
      ...prev,
      size: Number(e.target.value),
    }));
    setPaginationData((prev) => ({ ...prev, page: 1 }));
  }, []);

  const onSearchChange = useCallback(
    (value) => {
      setFilterValue(value || "");
      if (value?.length >= 3) {
        setPaginationData((prev) => ({ ...prev, page: 1 }));
        dispatch(searchIvrLeads({ input: value, id: userId }));
      } else {
        setPaginationData((prev) => ({ ...prev, page: 1 }));
        dispatch(getAllIvrLeads({ id: userId }));
      }
    },
    [dispatch, userId],
  );

  const onClear = useCallback(() => {
    setFilterValue("");
    setPaginationData((prev) => ({ ...prev, page: 1 }));
    dispatch(searchIvrLeads({ input: "", id: userId }));
  }, [dispatch, userId]);

  const topContent = useMemo(() => {
    const cols = columns(adminRole);
    return (
      <div className="flex flex-col gap-2">
        <div className="flex justify-between gap-2 items-center flex-wrap">
          <Input
            isClearable
            size="sm"
            className="w-full sm:max-w-[280px]"
            classNames={{ inputWrapper: "h-8 min-h-8" }}
            placeholder="Search ..."
            startContent={<Search className="w-4 h-4 text-default-400" />}
            value={filterValue}
            onClear={onClear}
            onValueChange={onSearchChange}
          />

          <div className="flex gap-1.5 flex-wrap">
            <Dropdown>
              <DropdownTrigger className="hidden sm:flex">
                <Button
                  size="sm"
                  variant="flat"
                  endContent={<ChevronDown className="w-3.5 h-3.5" />}
                >
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
                {cols.map((column) => (
                  <DropdownItem key={column.uid} className="capitalize">
                    {capitalize(column.name)}
                  </DropdownItem>
                ))}
              </DropdownMenu>
            </Dropdown>
          </div>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-default-400 text-[12.5px]">
            Total {count} leads
          </span>
          <label className="flex items-center gap-1 text-default-400 text-[12.5px]">
            Rows per page:
            <select
              className="bg-transparent outline-hidden text-default-400 text-[12.5px] cursor-pointer"
              onChange={onRowsPerPageChange}
              value={paginationData?.size}
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
    selectedKeys,
    data,
    adminRole,
    paginationData?.size,
  ]);

  const bottomContent = useMemo(() => {
    return (
      <div className="py-1.5 px-1 flex justify-between items-center">
        <span className="w-[30%] text-[12.5px] text-default-400">
          {selectedKeys === "all"
            ? "All items selected"
            : `${selectedKeys?.length} of ${count} selected`}
        </span>
        <Pagination
          isCompact
          showControls
          color="primary"
          page={paginationData?.page}
          total={pages}
          onChange={(e) => {
            setPaginationData((prev) => ({ ...prev, page: e }));
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
  }, [selectedKeys, count, paginationData, pages]);

  return (
    <div className="flex flex-col gap-2">
      <h1 className="font-sans text-lg font-semibold mb-2 shrink-0">
        Leads search
      </h1>
      <Table
        isHeaderSticky
        removeWrapper={false}
        aria-label="Example table with custom cells, pagination and sorting"
        bottomContent={bottomContent}
        bottomContentPlacement="outside"
        classNames={{
          base: "gap-2.5",
          wrapper:
            "max-h-[calc(100vh-280px)] w-full overflow-y-auto rounded-lg border border-gray-200 dark:border-white/10 shadow-none p-0",
          table: "w-full",
          thead: "[&>tr]:first:rounded-none",
          th: "h-8 py-0 text-[11.5px] tracking-wide bg-gray-50 dark:bg-neutral-900 text-default-500 first:rounded-none last:rounded-none border-b border-gray-200 dark:border-white/10",
          td: "py-1.5 text-[12.5px]",
        }}
        // selectedKeys={selectedKeys}
        // selectionMode="multiple"
        sortDescriptor={sortDescriptor}
        topContent={topContent}
        topContentPlacement="outside"
        // onSelectionChange={(e) => {
        //   let keys = Array.from(e);
        //   setSelectedKeys(keys);
        // }}
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
        <TableBody emptyContent={"No data found"} items={paginatedItems}>
          {(item) => (
            <TableRow key={item.id}>
              {(columnKey) => (
                <TableCell>{renderCell(item, columnKey)}</TableCell>
              )}
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default LeadSearch;
