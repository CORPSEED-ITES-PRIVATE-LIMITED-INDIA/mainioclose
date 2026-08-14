import {
  Button,
  Chip,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
  Input,
  Pagination,
  Progress,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
} from "@heroui/react";
import { ChevronDown, Search } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useParams } from "react-router-dom";
import dayjs from "dayjs";
import { getProjectsByUnitId } from "../../toolkit/slices/companySlice";
import { inrCurrency } from "../../common";

const columns = [
  { name: "ID", uid: "id" },
  { name: "PROJECT NO.", uid: "projectNo" },
  { name: "SERVICE NAME", uid: "name" },
  { name: "COMPANY NAME", uid: "companyName", sortable: true },
  { name: "CONTACT", uid: "contactName" },
  { name: "SALES PERSON", uid: "salesPersonName" },
  { name: "UNBILL NO.", uid: "unbilledNumber" },
  { name: "ESTIMATE NO.", uid: "estimateNumber" },
  { name: "DATE", uid: "date" },
  { name: "AMOUNT", uid: "amount" },
  { name: "MILESTONE", uid: "mileStone" },
  { name: "STATUS", uid: "status" },
];

function capitalize(s) {
  return s ? s.charAt(0).toUpperCase() + s.slice(1).toLowerCase() : "";
}

const INITIAL_VISIBLE_COLUMNS = [
  "id",
  "projectNo",
  "name",
  "companyName",
  "contactName",
  "salesPersonName",
  "unbilledNumber",
  "estimateNumber",
  "date",
  "amount",
  "mileStone",
  "status",
];

const CompanyProjects = () => {
  const { userId, companyId, unitId, companyUnitId } = useParams();
  const effectiveUnitId = unitId || companyUnitId;
  const dispatch = useDispatch();
  const count = useSelector(
    (state) => state.company.companyProjectList?.length,
  );
  const data = useSelector((state) => state.company.companyProjectList) || [];
  const [filterValue, setFilterValue] = useState("");
  const [selectedKeys, setSelectedKeys] = useState(new Set([]));
  const [visibleColumns, setVisibleColumns] = useState(
    new Set(INITIAL_VISIBLE_COLUMNS),
  );
  const [sortDescriptor, setSortDescriptor] = useState({
    column: "age",
    direction: "ascending",
  });
  const [companyFilteration, setCompanyFilteration] = useState({
    userId: userId,
    page: 1,
    size: 50,
    filterUserId: "",
    type: "all",
    rating: "all",
  });
  const hasSearchFilter = Boolean(filterValue);

  useEffect(() => {
    if (!effectiveUnitId) return;
    dispatch(getProjectsByUnitId(effectiveUnitId));
  }, [dispatch, effectiveUnitId]);

  const headerColumns = useMemo(() => {
    if (visibleColumns === "all") return columns;

    return columns.filter((column) =>
      Array.from(visibleColumns).includes(column.uid),
    );
  }, [visibleColumns]);

  const filteredItems = useMemo(() => {
    if (data?.length) {
      let filteredUsers = [...(data || [])];

      if (hasSearchFilter) {
        filteredUsers = filteredUsers?.filter((item) =>
          Object.values(item)?.some((val) =>
            String(val)?.toLowerCase()?.includes(filterValue?.toLowerCase()),
          ),
        );
      }
      return filteredUsers;
    }
  }, [data, filterValue]);

  const pages = Math.ceil(count / companyFilteration?.size) || 1;

  const items = useMemo(() => {
    const start = (companyFilteration?.page - 1) * companyFilteration?.size;
    const end = start + companyFilteration?.size;

    return filteredItems?.slice(start, end);
  }, [companyFilteration, filteredItems]);

  const sortedItems = useMemo(() => {
    if (items?.length) {
      return [...items]?.sort((a, b) => {
        const first = a[sortDescriptor.column];
        const second = b[sortDescriptor.column];
        const cmp = first < second ? -1 : first > second ? 1 : 0;

        return sortDescriptor.direction === "descending" ? -cmp : cmp;
      });
    }
  }, [sortDescriptor, items]);

  const renderCell = useCallback(
    (rowData, columnKey) => {
      switch (columnKey) {
        case "projectNo":
          return (
            <div className="flex flex-col gap-0.5">
              <Link
                className="text-[12.5px] font-medium"
                to={`/erp/${userId}/operation/projects/${rowData?.id}/projectDetail`}
              >
                {rowData?.projectNo || "-"}
              </Link>
            </div>
          );
        case "name":
          return <p className="text-[12.5px]">{rowData?.name || "-"}</p>;
        case "companyName":
          return (
            <p className="text-[12.5px]">{rowData?.companyName || "-"}</p>
          );
        case "contactName":
          return (
            <p className="text-[12.5px]">{rowData?.contactName || "-"}</p>
          );
        case "salesPersonName":
          return (
            <p className="text-[12.5px]">{rowData?.salesPersonName || "-"}</p>
          );
        case "unbilledNumber":
          return (
            <p className="text-[12.5px]">{rowData?.unbilledNumber || "-"}</p>
          );
        case "estimateNumber":
          return (
            <p className="text-[12.5px]">{rowData?.estimateNumber || "-"}</p>
          );
        case "date":
          return (
            <p className="text-[12.5px]">
              {rowData?.date ? dayjs(rowData.date).format("DD MMM YYYY") : "-"}
            </p>
          );
        case "amount":
          return (
            <div className="flex flex-col gap-0.5">
              <p className="text-[12.5px] font-bold">
                {inrCurrency(rowData?.totalAmount)}
              </p>
              <p className="text-[11.5px] text-default-500">
                Due: {inrCurrency(rowData?.dueAmount)}
              </p>
            </div>
          );
        case "mileStone":
          return (
            <Progress
              aria-label="Milestone completion"
              className="max-w-md"
              color="success"
              showValueLabel={true}
              size="sm"
              value={rowData?.milestoneCompletionPercentage || 0}
            />
          );
        case "status":
          return (
            <Chip
              size="sm"
              variant="flat"
              color={
                rowData?.statusName === "COMPLETED"
                  ? "success"
                  : rowData?.statusName === "REJECTED"
                    ? "danger"
                    : rowData?.statusName === "ON_HOLD"
                      ? "warning"
                      : rowData?.statusName === "OPEN"
                        ? "primary"
                        : rowData?.statusName === "IN_PROGRESS"
                          ? "warning"
                          : rowData?.statusName === "REOPEN"
                            ? "primary"
                            : "default"
              }
            >
              {rowData?.statusName || "-"}
            </Chip>
          );

        default:
          return rowData[columnKey] || "-";
      }
    },
    [userId],
  );

  const onNextPage = useCallback(() => {
    if (companyFilteration?.page < pages) {
      setCompanyFilteration((prev) => ({ ...prev, page: prev.page + 1 }));
    }
  }, [companyFilteration, pages]);

  const onPreviousPage = useCallback(() => {
    if (companyFilteration?.page > 1) {
      setCompanyFilteration((prev) => ({ ...prev, page: prev.page - 1 }));
    }
  }, [companyFilteration]);

  const onRowsPerPageChange = useCallback((e) => {
    setCompanyFilteration((prev) => ({
      ...prev,
      size: Number(e.target.value),
      page: 1,
    }));
  }, []);

  const onSearchChange = useCallback((value) => {
    if (value) {
      setFilterValue(value);
      setCompanyFilteration((prev) => ({ ...prev, page: 1 }));
    } else {
      setFilterValue("");
    }
  }, []);

  const onClear = useCallback(() => {
    setFilterValue("");
    setCompanyFilteration((prev) => ({ ...prev, page: 1 }));
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
            Total {count} company projects
          </span>
          <label className="flex items-center text-default-400 text-small">
            Rows per page:
            <select
              className="bg-transparent outline-hidden text-default-400 text-small"
              onChange={onRowsPerPageChange}
              value={companyFilteration?.size}
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
    data.length,
    onSearchChange,
    hasSearchFilter,
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
          page={companyFilteration?.page}
          total={pages}
          onChange={(e) => {
            setCompanyFilteration((prev) => ({ ...prev, page: e }));
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
  }, [selectedKeys, count, companyFilteration, pages, hasSearchFilter]);

  return (
    <>
      <h1 className="font-sans text-lg font-semibold mb-2 shrink-0">
        Company projects
      </h1>
      <Table
        isHeaderSticky
        aria-label="Example table with custom cells, pagination and sorting"
        bottomContent={bottomContent}
        bottomContentPlacement="outside"
        classNames={{
          wrapper: "max-h-[65vh] w-full",
          table: "w-full",
        }}
        selectedKeys={selectedKeys}
        selectionMode="multiple"
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
        <TableBody emptyContent={"No data found"} items={sortedItems || []}>
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

export default CompanyProjects;
