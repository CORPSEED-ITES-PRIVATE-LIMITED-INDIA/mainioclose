import {
  Button,
  Chip,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
  Input,
  Pagination,
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
import { getEstimateListByUserId } from "../../toolkit/slices/leadSlice";
import { dateFormat } from "../../common";

const columns = [
  { name: "ID", uid: "id" },
  { name: "PRODUCT", uid: "productName", sortable: true },
  { name: "COMPANY", uid: "companyName" },
  { name: "GST", uid: "gstNo" },
  { name: "ASSIGNEE", uid: "assignee" },
  { name: "DOC. FEE", uid: "documentFee" },
  { name: "TDS", uid: "tds" },
  { name: "PROF. FEE", uid: "professionalFees" },
  { name: "GOVT. FEE", uid: "govtFee" },
  { name: "SERVICE FEE", uid: "serviceFee" },
  { name: "OTHER FEE", uid: "otherFee" },
  { name: "TOTAL AMOUNT", uid: "totalAmount" },
  { name: "PRIMARY ADDRESS", uid: "address" },
  { name: "SECONDARY ADDRESS", uid: "secondaryAddress" },
  { name: "PAYMENT DATE", uid: "paymentDate" },
  { name: "PURCHASE DATE", uid: "purchaseDate" },
  { name: "REMARK", uid: "remarksForOption" },
];

function capitalize(s) {
  return s ? s.charAt(0).toUpperCase() + s.slice(1).toLowerCase() : "";
}

const INITIAL_VISIBLE_COLUMNS = [
  "productName",
  "companyName",
  "gstNo",
  "tds",
  "professionalFees",
  "govtFee",
  "serviceFee",
  "otherFee",
  "totalAmount",
  "paymentDate",
  "purchaseDate",
];

const DiscountedEstimate = () => {
  const { userId } = useParams();
  const dispatch = useDispatch();
  const count = useSelector(
    (state) => state.leads.estimateListByUserId?.length
  );
  const data = useSelector((state) => state.leads.estimateListByUserId);
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
    userId: userId,
    page: 1,
    size: 50,
    status: "initiated",
  });

  const hasSearchFilter = Boolean(filterValue);

  useEffect(() => {
    dispatch(getEstimateListByUserId({ userId, status: filteration?.status }));
  }, [dispatch, filteration]);

  const headerColumns = useMemo(() => {
    if (visibleColumns === "all") return columns;

    return columns.filter((column) =>
      Array.from(visibleColumns).includes(column.uid)
    );
  }, [visibleColumns]);

  const filteredItems = useMemo(() => {
    let filteredUsers = [...(data || [])];

    if (hasSearchFilter) {
      filteredUsers = filteredUsers?.filter((item) =>
        Object.values(item)?.some((val) =>
          String(val)?.toLowerCase()?.includes(filterValue?.toLowerCase())
        )
      );
    }
    return filteredUsers;
  }, [data, filterValue]);

  const pages = Math.ceil(count / filteration?.size) || 1;

  const items = useMemo(() => {
    const start = (filteration?.page - 1) * filteration?.size;
    const end = start + filteration?.size;

    return filteredItems.slice(start, end);
  }, [filteration, filteredItems]);

  const sortedItems = useMemo(() => {
    return [...items].sort((a, b) => {
      const first = a[sortDescriptor.column];
      const second = b[sortDescriptor.column];
      const cmp = first < second ? -1 : first > second ? 1 : 0;

      return sortDescriptor.direction === "descending" ? -cmp : cmp;
    });
  }, [sortDescriptor, items]);

  const renderCell = useCallback((rowData, columnKey) => {
    switch (columnKey) {
      case "productName":
        return (
          <div className="flex items-start gap-2">
            <div className="flex flex-col">
              <Link className="font-normal">{rowData?.productName || "-"}</Link>
            </div>
          </div>
        );

      case "companyName":
        return (
          <p className="font-normal text-xs capitalize">
            {rowData?.companyName || "Unknown"}
          </p>
        );
      case "gstNo":
        return (
          <div className="flex flex-col">
            <span className="font-normal">{rowData.gstNo || "-"}</span>
            <Chip size="sm" className="text-tiny" >
              {rowData?.gstType}
            </Chip>
          </div>
        );
      case "assignee":
        return (
          <div className="flex flex-col">
            <span className="font-normal">
              {rowData?.assignee?.fullName || "-"}
            </span>
            <span className="text-sm text-gray-400">
              {rowData?.assignee?.email || ""}
            </span>
          </div>
        );

      case "professionalFees":
        return (
          <div className="flex flex-col">
            <span className="">₹{rowData?.professionalFees || "-"}</span>
            <span className="text-tiny text-gray-400">
              GST : {rowData?.profesionalGst || "-"}%
            </span>
          </div>
        );
      case "govtFee":
        return (
          <div className="flex flex-col">
            <span className="">₹{rowData?.govermentfees || "-"}</span>
            <span className="text-tiny text-gray-400">
              GST : {rowData?.govermentGst || "-"}%
            </span>
          </div>
        );
      case "serviceFee":
        return (
          <div className="flex flex-col">
            <span className="">₹{rowData?.serviceCharge || "-"}</span>
            <span className="text-tiny text-gray-400">
              GST : {rowData?.serviceGst || "-"}%
            </span>
          </div>
        );
      case "otherFee":
        return (
          <div className="flex flex-col">
            <span className="">₹ {rowData?.otherFees || "-"}</span>
            <span className="text-tiny text-gray-400">
              GST : {rowData?.otherGst || "-"}%
            </span>
          </div>
        );

      case "totalAmount":
        return (
          <div className="flex flex-col">
            <span className="font-semibold">
              ₹ {rowData?.totalAmount || "-"}
            </span>
          </div>
        );
      case "address":
        return (
          <div className="flex flex-col">
            <span className="font-normal">{rowData?.address || "-"}</span>
            <div className="flex items-center gap-1">
              {" "}
              <span className="text-gray-400 text-tiny">
                {rowData?.city || "-"}
              </span>
              ,
            </div>
            <span className="text-gray-400 text-tiny">
              {rowData?.state || "-"},
            </span>
            <div className="flex items-center gap-1">
              <span className="text-gray-400 text-tiny">
                {rowData?.country || "-"}
              </span>
              ,
              <span className="text-gray-400 text-tiny">
                {rowData?.primaryPinCode || "-"}
              </span>
            </div>
          </div>
        );
      case "secondaryAddress":
        return (
          <div className="flex flex-col">
            <span className="font-normal">
              {rowData?.secondaryAddress || "-"}
            </span>
            <div className="flex items-center gap-1">
              {" "}
              <span className="text-gray-400">
                {rowData?.secondaryCity || "-"}
              </span>
              ,
              <span className="text-gray-400">
                {rowData?.secondaryState || "-"}
              </span>
              ,
              <span className="text-gray-400">
                {rowData?.secondaryCountry || "-"}
              </span>
              ,
            </div>
            <span className="text-gray-400">
              {rowData?.secondaryPinCode || "-"}
            </span>
          </div>
        );
      case "paymentDate":
        return (
          <div className="flex flex-col">
            <span className="font-normal">
              {dateFormat(rowData?.paymentDate) || "-"}
            </span>
          </div>
        );
      case "purchaseDate":
        return (
          <div className="flex flex-col">
            <span className="font-normal">
              {dateFormat(rowData?.purchaseDate) || "-"}
            </span>
          </div>
        );

      case "remarksForOption":
        return (
          <div className="flex flex-col">
            <span className="font-normal">
              {rowData?.remarksForOption || "-"}
            </span>
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
            placeholder="Search by name..."
            startContent={<Search />}
            value={filterValue}
            onClear={() => onClear()}
            onValueChange={onSearchChange}
          />
          <div className="flex gap-3">
            <Dropdown>
              <DropdownTrigger className="hidden sm:flex">
                <Button
                  endContent={<ChevronDown />}
                  variant="flat"
                  className="capitalize"
                >
                  {filteration?.status}
                </Button>
              </DropdownTrigger>
              <DropdownMenu
                disallowEmptySelection
                aria-label="Table Columns"
                selectionMode="single"
                selectedKeys={[filteration.status]}
                onSelectionChange={(selectedKeys) => {
                  const selected = Array.from(selectedKeys)[0];
                  setFilteration((prev) => ({
                    ...prev,
                    status: selected || prev.status,
                  }));
                }}
              >
                {[
                  { label: "Initiated", uid: "initiated" },
                  { label: "Approved", uid: "approved" },
                  { label: "Disapproved", uid: "disapproved" },
                ].map((status) => (
                  <DropdownItem key={status.uid} className="capitalize">
                    {capitalize(status.label)}
                  </DropdownItem>
                ))}
              </DropdownMenu>
            </Dropdown>
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
              className="bg-transparent outline-hidden text-default-400 text-small"
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
          page={filteration?.page}
          total={pages}
          onChange={(e) => {
            setFilteration((prev) => ({ ...prev, page: e }));
            if (e > filteration?.page) {
              dispatch(getAllNewCompanies({ ...filteration, page: e }));
            }
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
  }, [selectedKeys, count, filteration, pages, hasSearchFilter]);

  return (
    <>
      <h1 className="font-sans text-2xl font-medium mb-1">
        Discounted estimate
      </h1>
      <Table
        isHeaderSticky
        aria-label="Example table with custom cells, pagination and sorting"
        bottomContent={bottomContent}
        bottomContentPlacement="outside"
        classNames={{
          wrapper: "max-h-[68vh] w-full",
          table:'w-full'
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
        <TableBody emptyContent={"No data found"} items={sortedItems}>
          {(item) => (
            <TableRow key={item.leadId}>
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

export default DiscountedEstimate;
