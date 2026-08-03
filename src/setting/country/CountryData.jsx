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
import { ChevronDown, Search } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { getAllCountries } from "../../toolkit/slices/commonSlice";

const columns = [
  { name: "#", uid: "id" },
  { name: "PHONE CODE", uid: "phoneCode" },
  { name: "CURRENCY CODE", uid: "currencyCode" },
  { name: "COUNTRY", uid: "name" },
  { name: "ACTIONS", uid: "actions" },
];

const INITIAL_VISIBLE_COLUMNS = [
  "id",
  "name",
  "actions",
  "phoneCode",
  "currencyCode",
];

const CountryData = () => {
  const { userId } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { countriesList, loading } = useSelector((state) => state.common);

  const [filterValue, setFilterValue] = useState("");

  const [visibleColumns, setVisibleColumns] = useState(
    new Set(INITIAL_VISIBLE_COLUMNS),
  );

  const [initialFilteration, setInitialFilteration] = useState({
    page: 1,
    size: 10,
  });

  useEffect(() => {
    dispatch(getAllCountries());
  }, [dispatch]);

  const headerColumns = useMemo(() => {
    if (visibleColumns === "all") {
      return columns;
    }

    return columns.filter((column) =>
      Array.from(visibleColumns).includes(column.uid),
    );
  }, [visibleColumns]);

  const filteredItems = useMemo(() => {
    let filteredData = [...(countriesList || [])];

    if (filterValue) {
      filteredData = filteredData.filter((item) =>
        Object.values(item || {}).some((value) =>
          String(value).toLowerCase().includes(filterValue.toLowerCase()),
        ),
      );
    }

    return filteredData;
  }, [countriesList, filterValue]);

  const pages = Math.ceil(filteredItems.length / initialFilteration.size) || 1;

  const items = useMemo(() => {
    const start = (initialFilteration.page - 1) * initialFilteration.size;

    const end = start + initialFilteration.size;

    return filteredItems.slice(start, end);
  }, [filteredItems, initialFilteration.page, initialFilteration.size]);

  const handleCountryClick = (country) => {
    if (!country?.name) {
      return;
    }

    navigate(
      `/erp/${userId}/settings/country/state/${encodeURIComponent(country.name)}`,
    );
  };

  const renderCell = React.useCallback((rowData, columnKey) => {
    switch (columnKey) {
      case "id":
        return <span>{rowData?.id}</span>;
      case "currencyCode":
        return <span>{rowData?.currencyCode ?? "-"}</span>;
      case "phoneCode":
        return <span>{rowData?.phoneCode ?? "-"}</span>;

      case "name":
        return (
          <Button
            variant="light"
            className="px-0 font-medium"
            onPress={() => handleCountryClick(rowData)}
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
            onPress={() => handleCountryClick(rowData)}
          >
            View States
          </Button>
        );

      default:
        return rowData?.[columnKey];
    }
  }, []);

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
      <div className="flex shrink-0 flex-col gap-4">
        <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center">
          <Input
            isClearable
            className="w-full md:max-w-[400px]"
            placeholder="Search country..."
            startContent={<Search size={18} />}
            value={filterValue}
            onClear={onClear}
            onValueChange={onSearchChange}
          />

          <Dropdown>
            <DropdownTrigger className="hidden sm:flex">
              <Button variant="flat" endContent={<ChevronDown size={16} />}>
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
    );
  }, [filterValue, visibleColumns, onClear, onSearchChange]);

  const bottomContent = useMemo(() => {
    return (
      <div className="flex shrink-0 flex-col items-center justify-between gap-3 py-2 md:flex-row">
        <span className="text-small text-default-400">
          Total {filteredItems.length} countries
        </span>

        <div className="flex flex-wrap items-center gap-3">
          <label className="flex items-center gap-2 text-small text-default-400">
            Rows per page:
            <select
              className="bg-transparent text-small text-default-500 outline-none"
              onChange={onRowsPerPageChange}
              value={initialFilteration.size}
            >
              <option value="10">10</option>
              <option value="15">15</option>
              <option value="25">25</option>
              <option value="50">50</option>
            </select>
          </label>

          <Pagination
            isCompact
            showControls
            showShadow
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

          <div className="hidden items-center gap-2 sm:flex">
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
      </div>
    );
  }, [
    filteredItems.length,
    initialFilteration.page,
    initialFilteration.size,
    pages,
    onRowsPerPageChange,
  ]);

  return (
    <div className="flex h-[calc(100vh-90px)] w-full flex-col overflow-hidden p-4">
      <div className="mb-4 shrink-0">
        <h1 className="text-2xl font-semibold">Country List</h1>
      </div>

      <div className="min-h-0 flex-1 overflow-hidden">
        <Table
          aria-label="Country table"
          isHeaderSticky
          bottomContent={bottomContent}
          bottomContentPlacement="outside"
          topContent={topContent}
          topContentPlacement="outside"
          classNames={{
            base: "flex h-full min-h-0 flex-col overflow-hidden",
            wrapper: "min-h-0 flex-1 overflow-auto",
            table: "min-w-[700px]",
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
            emptyContent="No countries found"
            isLoading={loading === "pending"}
            loadingContent="Loading countries..."
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
    </div>
  );
};

export default CountryData;
