import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  addToast,
  Button,
  Chip,
  Input,
  Pagination,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
} from "@heroui/react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { Search } from "lucide-react";

import { getVendorsByProductId } from "../../toolkit/slices/vendorsSlice";

const columns = [
  { name: "ID", uid: "vendorId" },
  { name: "VENDOR NAME", uid: "vendorName" },
  { name: "CONTACT", uid: "contact" },
  { name: "GST / PAN", uid: "taxDetail" },
  { name: "STATUS", uid: "vendorStatus" },
  { name: "MAPPING", uid: "mappingActive" },
];

function VendorsData() {
  const dispatch = useDispatch();
  const { solutionId: productId, userId } = useParams();

  const prodVendorsResponse = useSelector((state) => state.vendors.prodVendors);
  const loading = useSelector((state) => state.vendors.loading);

  const [filterValue, setFilterValue] = useState("");
  const [pagination, setPagination] = useState({ page: 0, size: 10 });

  const vendorList = useMemo(() => {
    return Array.isArray(prodVendorsResponse?.content)
      ? prodVendorsResponse.content
      : [];
  }, [prodVendorsResponse]);

  const totalElements = prodVendorsResponse?.totalElements || 0;
  const totalPages = prodVendorsResponse?.totalPages || 1;

  const fetchVendors = useCallback(() => {
    if (!productId) return;

    dispatch(
      getVendorsByProductId({
        productId,
        userId,
        page: pagination.page,
        size: pagination.size,
      }),
    ).then((resp) => {
      if (resp.meta.requestStatus !== "fulfilled") {
        addToast({
          title: "ERROR",
          description:
            resp?.payload?.message ||
            resp?.payload ||
            "Failed to fetch vendors for this product.",
          color: "danger",
        });
      }
    });
  }, [dispatch, productId, userId, pagination.page, pagination.size]);

  useEffect(() => {
    fetchVendors();
  }, [fetchVendors]);

  const filteredItems = useMemo(() => {
    const search = filterValue.trim().toLowerCase();

    if (!search) return vendorList;

    return vendorList.filter((item) => {
      return (
        item?.vendorName?.toLowerCase().includes(search) ||
        item?.email?.toLowerCase().includes(search) ||
        item?.mobile?.toLowerCase().includes(search) ||
        item?.gstNumber?.toLowerCase().includes(search) ||
        item?.panNumber?.toLowerCase().includes(search) ||
        item?.vendorStatus?.toLowerCase().includes(search)
      );
    });
  }, [vendorList, filterValue]);

  const onSearchChange = useCallback((value) => {
    setFilterValue(value || "");
  }, []);

  const onClear = useCallback(() => {
    setFilterValue("");
  }, []);

  const onRowsPerPageChange = useCallback((e) => {
    setPagination({ page: 0, size: Number(e.target.value) });
  }, []);

  const onPreviousPage = useCallback(() => {
    setPagination((prev) => ({ ...prev, page: Math.max(0, prev.page - 1) }));
  }, []);

  const onNextPage = useCallback(() => {
    setPagination((prev) => ({
      ...prev,
      page: Math.min(totalPages - 1, prev.page + 1),
    }));
  }, [totalPages]);

  const renderCell = useCallback((rowData, columnKey) => {
    switch (columnKey) {
      case "vendorId":
        return (
          <span className="text-sm font-medium text-foreground">
            {rowData?.vendorId || "-"}
          </span>
        );

      case "vendorName":
        return (
          <span className="block max-w-[220px] break-words font-medium text-foreground">
            {rowData?.vendorName || "-"}
          </span>
        );

      case "contact":
        return (
          <div className="flex min-w-0 max-w-[280px] flex-col">
            <span className="break-all text-sm text-foreground">
              {rowData?.email || "-"}
            </span>
            <span className="text-xs text-default-400">
              {rowData?.mobile || "-"}
            </span>
          </div>
        );

      case "taxDetail":
        return (
          <div className="flex flex-col">
            <span className="text-sm text-foreground">
              GST: {rowData?.gstNumber || "-"}
            </span>
            <span className="text-xs text-default-400">
              PAN: {rowData?.panNumber || "-"}
            </span>
          </div>
        );

      case "vendorStatus":
        return (
          <Chip
            size="sm"
            variant="flat"
            color={
              rowData?.vendorStatus?.toUpperCase() === "ACTIVE"
                ? "success"
                : "danger"
            }
          >
            {rowData?.vendorStatus || "-"}
          </Chip>
        );

      case "mappingActive":
        return (
          <Chip
            size="sm"
            variant="dot"
            color={rowData?.mappingActive ? "success" : "default"}
          >
            {rowData?.mappingActive ? "Active" : "Inactive"}
          </Chip>
        );

      default:
        return rowData?.[columnKey] || "-";
    }
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
            placeholder="Search vendors..."
            startContent={<Search className="w-4 h-4 text-default-400" />}
            value={filterValue}
            onClear={onClear}
            onValueChange={onSearchChange}
          />
        </div>

        <div className="flex justify-between items-center">
          <span className="text-default-400 text-[12.5px]">
            Total {totalElements} vendors mapped
          </span>

          <label className="flex items-center gap-1 text-default-400 text-[12.5px]">
            Rows per page:
            <select
              className="bg-transparent outline-hidden text-default-400 text-[12.5px] cursor-pointer"
              onChange={onRowsPerPageChange}
              value={pagination.size}
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
  }, [
    filterValue,
    totalElements,
    pagination.size,
    onClear,
    onSearchChange,
    onRowsPerPageChange,
  ]);

  const bottomContent = useMemo(() => {
    return (
      <div className="py-1.5 px-1 flex justify-between items-center">
        <span className="w-[30%] text-[12.5px] text-default-400">
          Page {pagination.page + 1} of {totalPages}
        </span>

        <Pagination
          isCompact
          showControls
          color="primary"
          page={pagination.page + 1}
          total={totalPages}
          onChange={(page) =>
            setPagination((prev) => ({ ...prev, page: page - 1 }))
          }
        />

        <div className="hidden sm:flex w-[30%] justify-end gap-2">
          <Button
            isDisabled={pagination.page === 0}
            size="sm"
            variant="flat"
            onPress={onPreviousPage}
          >
            Previous
          </Button>
          <Button
            isDisabled={pagination.page + 1 >= totalPages}
            size="sm"
            variant="flat"
            onPress={onNextPage}
          >
            Next
          </Button>
        </div>
      </div>
    );
  }, [pagination.page, totalPages, onPreviousPage, onNextPage]);

  return (
    <div className="flex flex-col gap-2">
      <h1 className="font-sans text-lg font-semibold mb-2 shrink-0">
        Vendors Mapped To Product
      </h1>

      <Table
        isHeaderSticky
        removeWrapper={false}
        aria-label="Vendors mapped to product table"
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
        <TableHeader columns={columns}>
          {(column) => (
            <TableColumn key={column.uid}>{column.name}</TableColumn>
          )}
        </TableHeader>

        <TableBody
          isLoading={loading === "pending"}
          emptyContent={
            loading === "pending"
              ? "Loading..."
              : "No vendors mapped to this product"
          }
          items={filteredItems}
        >
          {(item) => (
            <TableRow key={item?.vendorId}>
              {(columnKey) => (
                <TableCell className="whitespace-normal break-words">
                  {renderCell(item, columnKey)}
                </TableCell>
              )}
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}

export default VendorsData;
