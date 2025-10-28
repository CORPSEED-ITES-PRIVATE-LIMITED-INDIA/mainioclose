import {
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
} from "@heroui/dropdown";
import { Input } from "@heroui/input";
import {
  Button,
  Chip,
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
    new Set(INITIAL_VISIBLE_COLUMNS(adminRole))
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
      Array.from(visibleColumns).includes(column.uid)
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
              <p className="font-semibold">{lead?.leadName || "-"}</p>
              <span className="text-sm text-gray-400">
                {dayjs(lead?.createDate).format("DD-MM-YYYY")}
              </span>
            </div>
          );
        case "contact":
          return (
            <div className="flex flex-col">
              <span className="font-normal">{lead?.email || "-"}</span>
              <span className="text-sm text-gray-400">
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
              <span className="font-semibold">
                {lead?.assignee?.fullName || "-"}
              </span>
              <span className="text-sm text-gray-400">
                {lead?.assignee?.email || "-"}
              </span>
            </div>
          );
        case "industry":
          return lead?.industries?.name || "-";
        case "city":
          return lead?.city || "-";
        case "source":
          return lead?.source || "-";
        case "updatedBy":
          return (
            <div className="flex flex-col gap-0.5">
              <span className="font-normal">{lead?.updatedBy?.fullName}</span>
              <span className="font-normal text-muted-foreground">
                {lead?.updatedDate
                  ? dayjs(lead?.updatedDate).format("DD-MM-YYYY")
                  : "-"}
              </span>
            </div>
          );
        case "address":
          return (
            <div className="flex flex-col">
              <span className="font-normal">{lead?.address || "-"}</span>
              <span className="text-sm text-default-500">
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
                    <EllipsisVertical />
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
    [userId]
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
      setFilterValue(value);
      setPaginationData((prev) => ({ ...prev, page: 1 }));
      dispatch(searchIvrLeads({ input: value, id: userId }));
    },
    [dispatch, userId]
  );

  const onClear = useCallback(() => {
    setFilterValue("");
    setPaginationData((prev) => ({ ...prev, page: 1 }));
    dispatch(searchIvrLeads({ input: "", id: userId }));
  }, [dispatch, userId]);

  const topContent = useMemo(() => {
    const cols = columns(adminRole);
    return (
      <div className="flex flex-col gap-4">
        <div className="flex justify-between gap-3 items-end">
          <Input
            isClearable
            className="w-full sm:max-w-[35%]"
            placeholder="Search ..."
            startContent={<Search />}
            value={filterValue}
            onClear={onClear}
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
          <span className="text-default-400 text-small">
            Total {count} leads
          </span>
          <label className="flex items-center text-default-400 text-small">
            Rows per page:
            <select
              className="bg-transparent outline-hidden text-default-400 text-small"
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
      <div className="py-2 px-2 flex justify-between items-center">
        <span className="w-[30%] text-small text-default-400">
          {selectedKeys === "all"
            ? "All items selected"
            : `${selectedKeys?.length} of ${count} selected`}
        </span>
        <Pagination
          isCompact
          showControls
          showShadow
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
    <>
      <h1 className="font-sans text-2xl font-medium mb-1">Leads search</h1>
      <Table
        isHeaderSticky
        aria-label="Example table with custom cells, pagination and sorting"
        bottomContent={bottomContent}
        bottomContentPlacement="outside"
        classNames={{
          wrapper:
            "max-h-[50vh] sm:max-h-[60vh] md:max-h-[65vh] lg:max-h-[68vh] xl:max-h-[75vh] 2xl:max-h-[65vh] overflow-y-auto w-full",
            table:'w-full'
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
    </>
  );
};

export default LeadSearch;
