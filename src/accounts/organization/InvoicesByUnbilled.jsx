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
  addToast,
  useDisclosure,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  Select,
  SelectItem,
  ModalFooter,
} from "@heroui/react";
import { ChevronDown, EllipsisVertical, Search } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import {
  getAllInvoice,
  getAllInvoiceCount,
  searchInvoiceByCompanyNameAndInvoice,
  searchInvoiceCountByCompanyNameAndInvoice,
} from "../../toolkit/slices/organizationSlice";
import dayjs from "dayjs";
import { useParams } from "react-router-dom";
import { inrCurrency } from "../../common";
import {
  getInvoiceDetailById,
  getInvoicesByUnbilledId,
} from "../../toolkit/slices/accountSlice";
import TaxInvoice from "../../components/TaxInvoice";
import { getEstimateByEstimateId } from "../../toolkit/slices/leadSlice";
import NewEstimatePreview from "../../sales/leads/leadEstimate/NewEstimatePreview";

export const columns = [
  { name: "DATE", uid: "date" },
  { name: "INVOICE NO.", uid: "invoiceNo" },
  { name: "ESTIMATE NUMBER", uid: "estimateNumber" },
  { name: "SERVICE", uid: "service" },
  { name: "CLIENT", uid: "clientName" },
  { name: "COMPANY", uid: "companyName" },
  { name: "PAYMENT TERM", uid: "paymentTypeCode" },
  { name: "TXN. AMOUNT", uid: "txnAmount" },
  { name: "ADDED BY", uid: "addedBy" },
  { name: "ACTIONS", uid: "actions" },
];

export function capitalize(s) {
  return s ? s.charAt(0)?.toUpperCase() + s.slice(1)?.toLowerCase() : "";
}

const INITIAL_VISIBLE_COLUMNS = [
  "date",
  "invoiceNo",
  "estimateNumber",
  "service",
  "clientName",
  "companyName",
  "paymentTypeCode",
  "txnAmount",
  "addedBy",
  "actions",
];

const InvoicesByUnbilled = () => {
  const dispatch = useDispatch();
  const { userId, unbilledId } = useParams();
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const viewModal = useDisclosure();
  const data = useSelector((state) => state.account.invoicesByUnbilled);
  const count = useSelector(
    (state) => state.account.invoicesByUnbilled?.length,
  );
  const department = useSelector(
    (state) => state.auth.getDepartmentDetail?.department,
  );
  const [invoiceDetail, setInvoiceDetail] = useState(null);
  const [filterValue, setFilterValue] = React.useState("");
  const [selectedKeys, setSelectedKeys] = React.useState(new Set([]));
  const [visibleColumns, setVisibleColumns] = React.useState(
    new Set(INITIAL_VISIBLE_COLUMNS),
  );
  const [rowsPerPage, setRowsPerPage] = React.useState(50);
  const [sortDescriptor, setSortDescriptor] = React.useState({
    column: "age",
    direction: "ascending",
  });
  const [page, setPage] = React.useState(1);
  const hasSearchFilter = Boolean(filterValue);
  const [status, setStatus] = useState("GENERATED");
  const [searchFilters, setSearchFilters] = useState({
    searchText: "",
    type: "invoiceNumber",
  });
  const [estimateDetail, setEstimateDetail] = useState(null);
  const [viewType, setViewType] = useState("ESTIMATE");

  useEffect(() => {
    dispatch(
      getInvoicesByUnbilledId({
        userId,
        unbilledId,
        page,
        size: rowsPerPage,
        status,
      }),
    );
    dispatch(getAllInvoiceCount({ userId, status }));
  }, [dispatch, userId, status]);

  const headerColumns = React.useMemo(() => {
    if (visibleColumns === "all") return columns;

    return columns.filter((column) =>
      Array.from(visibleColumns).includes(column.uid),
    );
  }, [visibleColumns]);

  const filteredItems = React.useMemo(() => {
    let filteredUsers = [...(data || [])];

    if (hasSearchFilter) {
      filteredUsers = filteredUsers?.filter((item) =>
        Object.values(item)?.some((val) =>
          String(val)?.toLowerCase()?.includes(filterValue?.toLowerCase()),
        ),
      );
    }

    return filteredUsers;
  }, [data, filterValue]);

  const pages = Math.ceil(count / rowsPerPage) || 1;

  const sortedItems = React.useMemo(() => {
    return [...filteredItems].sort((a, b) => {
      const first = a[sortDescriptor.column];
      const second = b[sortDescriptor.column];
      const cmp = first < second ? -1 : first > second ? 1 : 0;

      return sortDescriptor.direction === "descending" ? -cmp : cmp;
    });
  }, [sortDescriptor, filteredItems]);

  const handleViewTaxInvoice = (value) => {
    dispatch(getInvoiceDetailById({ id: value?.id, userId }))
      .then((resp) => {
        if (resp.meta.requestStatus === "fulfilled") {
          let tempData = resp?.payload;
          setInvoiceDetail(tempData);
          onOpen();
        } else {
          addToast({
            title: "There is Some Issue in Invoice",
            color: "danger",
          });
          onOpen();
        }
      })
      .catch(() =>
        addToast({ title: "There is Some Issue in Invoice", color: "danger" }),
      );
  };

  const handleViewEstimate = (rowData, type) => {
    setViewType(type);
    dispatch(getEstimateByEstimateId({ estimateId: rowData?.id, userId }))
      .then((resp) => {
        if (resp.meta.requestStatus === "fulfilled") {
          let data = resp?.payload;
          setEstimateDetail(data);
          viewModal.onOpen();
        } else {
          addToast({
            title: "There is Some Issue in estimate",
            color: "danger",
          });
        }
      })
      .catch(() =>
        addToast({ title: "There is Some Issue in estimate", color: "danger" }),
      );
  };

  const renderCell = React.useCallback((rowData, columnKey) => {
    const cellValue = rowData[columnKey];
    switch (columnKey) {
      case "date":
        return (
          <p className="text-[12.5px] capitalize">
            {dayjs(rowData?.invoiceDate).format("DD-MM-YYYY")}
          </p>
        );
      case "invoiceNo":
        return (
          <div className="flex flex-col gap-1">
            <p
              className="capitalize text-[12.5px] font-medium text-blue-600 cursor-pointer"
              onClick={() => handleViewTaxInvoice(rowData)}
            >
              {rowData?.invoiceNumber}
            </p>
          </div>
        );
      case "estimateNumber":
        return (
          <div>
            <p
              className="capitalize text-[12.5px] font-medium text-blue-600 cursor-pointer"
              onClick={() => handleViewEstimate(rowData, "ESTIMATE")}
            >
              {rowData?.estimateNumber || "NA"}
            </p>
          </div>
        );
      case "service":
        return (
          <p className="text-[12.5px] capitalize">{rowData?.solutionName}</p>
        );
      case "clientName":
        return (
          <p className="text-[12.5px] capitalize">{rowData?.contactName}</p>
        );
      case "companyName":
        return (
          <p className="text-[12.5px] capitalize">{rowData?.companyName}</p>
        );
      case "txnAmount":
        return (
          <div className="flex flex-col gap-1">
            <p className="text-[12.5px] capitalize">
              {inrCurrency(rowData?.grandTotal)}
            </p>
            <div className="flex gap-1.5">
              <span className="text-default-500 text-[11.5px]">GST</span>
              <span className="text-default-500 text-[11.5px]">:</span>
              <span className="text-default-500 text-[11.5px]">
                {inrCurrency(rowData?.totalGstAmount)}
              </span>
            </div>
          </div>
        );
      case "addedBy":
        return (
          <p className="text-[12.5px] capitalize">{rowData?.createdByName}</p>
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
                  let key = Array.from(e)[0];
                  if (key == "viewEstimate") {
                    handleViewEstimate(rowData);
                  }
                }}
              >
                <DropdownItem key="viewEstimate">Tax invoice</DropdownItem>
              </DropdownMenu>
            </Dropdown>
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

  const onSearchChange = React.useCallback(
    (value) => {
      if (value) {
        setFilterValue(value);
        setPage(1);
        dispatch(
          searchInvoiceByCompanyNameAndInvoice({
            ...searchFilters,
            searchText: value,
            page,
            size: rowsPerPage,
          }),
        );
        dispatch(
          searchInvoiceCountByCompanyNameAndInvoice({
            ...searchFilters,
            searchText: value,
          }),
        );
      } else {
        setFilterValue("");
        dispatch(getAllInvoice({ userId, page, size: rowsPerPage, status }));
        dispatch(getAllInvoiceCount({ userId, status }));
      }
    },
    [searchFilters, page, rowsPerPage],
  );

  const onClear = React.useCallback(() => {
    setFilterValue("");
    setPage(1);
    dispatch(getAllInvoice({ userId, page, size: rowsPerPage, status }));
    dispatch(getAllInvoiceCount({ userId, status }));
  }, []);

  const topContent = React.useMemo(() => {
    return (
      <div className="flex flex-col gap-2">
        <div className="flex justify-between gap-2 items-center flex-wrap">
          <div className="flex items-center gap-1.5 w-full sm:max-w-[360px]">
            <Select
              size="sm"
              className="max-w-[130px] shrink-0"
              selectionMode="single"
              selectedKeys={[searchFilters?.type]}
              onSelectionChange={(e) => {
                let key = Array.from(e)[0];
                setSearchFilters((preview) => ({ ...preview, type: key }));
              }}
            >
              <SelectItem key={"invoiceNumber"}>Invoice number</SelectItem>
              <SelectItem key={"companyName"}>Company name</SelectItem>
            </Select>
            <Input
              isClearable
              size="sm"
              className="w-full"
              classNames={{ inputWrapper: "h-8 min-h-8" }}
              placeholder="Search ..."
              startContent={<Search className="w-4 h-4 text-default-400" />}
              value={filterValue}
              onClear={() => onClear()}
              onValueChange={onSearchChange}
            />
          </div>
          <div className="flex gap-1.5 flex-wrap">
            <Dropdown>
              <DropdownTrigger>
                <Button
                  className="capitalize"
                  variant="flat"
                  endContent={<ChevronDown className="w-3.5 h-3.5" />}
                >
                  {status}
                </Button>
              </DropdownTrigger>
              <DropdownMenu
                disallowEmptySelection
                aria-label="Single selection example"
                selectedKeys={[status]}
                selectionMode="single"
                variant="flat"
                onSelectionChange={(e) => {
                  let key = Array.from(e)[0];
                  setStatus(key);
                }}
              >
                <DropdownItem key="GENERATED">GENERATED</DropdownItem>
                <DropdownItem key="SENT_TO_CLIENT">SENT_TO_CLIENT</DropdownItem>
                <DropdownItem key="VIEWED">VIEWED</DropdownItem>
                <DropdownItem key="PAID">PAID</DropdownItem>
                <DropdownItem key="PARTIALLY_PAID">PARTIALLY_PAID</DropdownItem>
                <DropdownItem key="CANCELLED">CANCELLED</DropdownItem>
                <DropdownItem key="CREDIT_NOTED">CREDIT_NOTED</DropdownItem>
              </DropdownMenu>
            </Dropdown>
            <Dropdown>
              <DropdownTrigger>
                <Button
                  endContent={<ChevronDown className="w-3.5 h-3.5" />}
                  variant="flat"
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
                    {capitalize(column.name)}
                  </DropdownItem>
                ))}
              </DropdownMenu>
            </Dropdown>
          </div>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-default-400 text-[12.5px]">
            Total {count} invoice
          </span>
          <label className="flex items-center gap-1 text-default-400 text-[12.5px]">
            Rows per page:
            <select
              className="bg-transparent outline-hidden text-default-400 text-[12.5px] cursor-pointer"
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
    status,
    searchFilters,
  ]);

  const bottomContent = React.useMemo(() => {
    return (
      <div className="py-1.5 px-1 flex justify-between items-center">
        <span className="w-[30%] text-[12.5px] text-default-400">
          {selectedKeys === "all"
            ? "All items selected"
            : `${selectedKeys.size} of ${count} selected`}
        </span>
        <Pagination
          isCompact
          showControls
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
    <div className="flex flex-col gap-2">
      <h1 className="font-sans text-lg font-semibold mb-2 shrink-0">
        Unbilled Invoice list
      </h1>
      <Table
        isHeaderSticky
        removeWrapper={false}
        aria-label="Unbilled invoices table with custom cells, pagination and sorting"
        bottomContent={bottomContent}
        bottomContentPlacement="outside"
        classNames={{
          base: "gap-2.5",
          wrapper:
            "max-h-[calc(100vh-320px)] w-full overflow-y-auto rounded-lg border border-gray-200 dark:border-white/10 shadow-none p-0",
          table: "w-full",
          thead: "[&>tr]:first:rounded-none",
          th: "h-8 py-0 text-[11.5px] tracking-wide bg-gray-50 dark:bg-neutral-900 text-default-500 first:rounded-none last:rounded-none border-b border-gray-200 dark:border-white/10",
          td: "py-1.5 text-[12.5px]",
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
      <Modal
        size="full"
        isDismissable={false}
        isKeyboardDismissDisabled={true}
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        placement="top-center"
      >
        <ModalContent>
          <ModalHeader>Tax Invoice</ModalHeader>
          <ModalBody className="max-h-[90vh] overflow-auto">
            <TaxInvoice invoiceData={invoiceDetail} />
          </ModalBody>
        </ModalContent>
      </Modal>

      <Modal
        size="4xl"
        isDismissable={false}
        isKeyboardDismissDisabled={true}
        isOpen={viewModal.isOpen}
        onOpenChange={viewModal.onOpenChange}
        placement="top-center"
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalBody className="max-h-[70vh] overflow-auto">
                <NewEstimatePreview
                  details={estimateDetail}
                  viewType={viewType}
                />
              </ModalBody>
              <ModalFooter className="flex justify-end">
                <Button onPress={onClose}>Cancel</Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
};

export default InvoicesByUnbilled;
