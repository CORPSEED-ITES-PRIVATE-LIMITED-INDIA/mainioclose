import React, { useEffect, useMemo, useState } from "react";
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
} from "@heroui/react";
import { ArrowLeft, ChevronDown, Search } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { getAllStatesByCountryName } from "../../toolkit/slices/commonSlice";

const columns = [
  { name: "#", uid: "id" },
  { name: "STATE CODE", uid: "stateCode" },
  { name: "GST CODE", uid: "gstCode" },
  { name: "STATE", uid: "name" },
  { name: "ACTIONS", uid: "actions" },
];

const INITIAL_VISIBLE_COLUMNS = [
  "id",
  "stateCode",
  "gstCode",
  "name",
  "actions",
];

const StateData = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { countryName, userId } = useParams();

  const decodedCountryName = decodeURIComponent(countryName || "");

  const { statesList, loading } = useSelector((state) => state.common);

  const [filterValue, setFilterValue] = useState("");

  const [visibleColumns, setVisibleColumns] = useState(
    new Set(INITIAL_VISIBLE_COLUMNS),
  );

  const [initialFilteration, setInitialFilteration] = useState({
    page: 1,
    size: 10,
  });

  useEffect(() => {
    if (decodedCountryName) {
      dispatch(getAllStatesByCountryName(decodedCountryName));
    }
  }, [dispatch, decodedCountryName]);

  const headerColumns = useMemo(() => {
    if (visibleColumns === "all") {
      return columns;
    }

    return columns.filter((column) =>
      Array.from(visibleColumns).includes(column.uid),
    );
  }, [visibleColumns]);

  const filteredItems = useMemo(() => {
    let filteredData = [...(statesList || [])];

    if (filterValue) {
      filteredData = filteredData.filter((item) =>
        Object.values(item || {}).some((value) =>
          String(value).toLowerCase().includes(filterValue.toLowerCase()),
        ),
      );
    }

    return filteredData;
  }, [statesList, filterValue]);

  const pages = Math.ceil(filteredItems.length / initialFilteration.size) || 1;

  const items = useMemo(() => {
    const start = (initialFilteration.page - 1) * initialFilteration.size;

    const end = start + initialFilteration.size;

    return filteredItems.slice(start, end);
  }, [filteredItems, initialFilteration.page, initialFilteration.size]);

  const handleStateClick = (state) => {
    if (!state?.name) {
      return;
    }

    navigate(
      `/erp/${userId}/settings/country/state/${encodeURIComponent(
        decodedCountryName,
      )}/city/${encodeURIComponent(state.name)}`,
    );
  };

  const renderCell = React.useCallback(
    (rowData, columnKey) => {
      switch (columnKey) {
        case "id":
          return <span>{rowData?.id}</span>;

        case "stateCode":
          return <span>{rowData?.stateCode}</span>;

        case "gstCode":
          return <span>{rowData?.gstCode ?? "-"}</span>;

        case "name":
          return (
            <Button
              variant="light"
              className="px-0 font-medium"
              onPress={() => handleStateClick(rowData)}
            >
              {rowData?.name}
            </Button>
          );

        case "actions":
          return (
            <Button
              size="sm"
              color="primary"
              variant="flat"
              onPress={() => handleStateClick(rowData)}
            >
              View Cities
            </Button>
          );

        default:
          return rowData?.[columnKey];
      }
    },
    [decodedCountryName],
  );

  const onSearchChange = React.useCallback((value) => {
    setFilterValue(value);

    setInitialFilteration((prev) => ({
      ...prev,
      page: 1,
    }));
  }, []);

  const onClear = React.useCallback(() => {
    setFilterValue("");

    setInitialFilteration((prev) => ({
      ...prev,
      page: 1,
    }));
  }, []);

  const onRowsPerPageChange = React.useCallback((e) => {
    setInitialFilteration((prev) => ({
      ...prev,
      size: Number(e.target.value),
      page: 1,
    }));
  }, []);

  const topContent = useMemo(() => {
    return (
      <div className="flex flex-col gap-2">
        <div className="flex justify-between gap-2 items-center flex-wrap">
          <Input
            isClearable
            size="sm"
            className="w-full sm:max-w-[280px]"
            classNames={{ inputWrapper: "h-8 min-h-8" }}
            placeholder="Search state..."
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
                  endContent={<ChevronDown className="w-4 h-4" />}
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
                {columns.map((column) => (
                  <DropdownItem key={column.uid} className="capitalize">
                    {column.name}
                  </DropdownItem>
                ))}
              </DropdownMenu>
            </Dropdown>
          </div>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-default-400 text-[12.5px]">
            Total {filteredItems.length} states
          </span>

          <label className="flex items-center gap-1 text-default-400 text-[12.5px]">
            Rows per page:
            <select
              className="bg-transparent outline-hidden text-default-400 text-[12.5px] cursor-pointer"
              onChange={onRowsPerPageChange}
              value={initialFilteration.size}
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
  }, [filterValue, visibleColumns, onClear, onSearchChange, navigate]);

  const bottomContent = useMemo(() => {
    return (
      <div className="py-1.5 px-1 flex justify-between items-center">
        <span className="w-[30%] text-[12.5px] text-default-400">
          Page {initialFilteration.page} of {pages}
        </span>

        <Pagination
          isCompact
          showControls
          color="primary"
          page={initialFilteration.page}
          total={pages}
          onChange={(page) =>
            setInitialFilteration((prev) => ({
              ...prev,
              page,
            }))
          }
        />

        <div className="hidden sm:flex w-[30%] justify-end gap-2">
          <Button
            isDisabled={initialFilteration.page <= 1}
            size="sm"
            variant="flat"
            onPress={() =>
              setInitialFilteration((prev) => ({
                ...prev,
                page: prev.page - 1,
              }))
            }
          >
            Previous
          </Button>

          <Button
            isDisabled={initialFilteration.page >= pages}
            size="sm"
            variant="flat"
            onPress={() =>
              setInitialFilteration((prev) => ({
                ...prev,
                page: prev.page + 1,
              }))
            }
          >
            Next
          </Button>
        </div>
      </div>
    );
  }, [initialFilteration.page, pages]);

  return (
    <div className="flex flex-col gap-2">
      <div>
        <h1 className="font-sans text-lg font-semibold mb-2 shrink-0">
          State List
        </h1>

        <p className="text-default-500 text-[12.5px]">
          Country: {decodedCountryName}
        </p>
      </div>

      <Table
        aria-label="State table"
        isHeaderSticky
        removeWrapper={false}
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
          items={items}
          emptyContent="No states found"
          isLoading={loading === "pending"}
          loadingContent="Loading states..."
        >
          {(item) => (
            <TableRow key={item?.id}>
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

export default StateData;
