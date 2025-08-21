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
  Modal,
  ModalContent,
  ModalBody,
  useDisclosure,
  ModalHeader,
  addToast,
  Chip,
} from "@heroui/react";
import { ChevronDown, EllipsisVertical, Search } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import {
  estimateApprovedAndDisapprovedStatus,
  getEstimateByStatus,
  getTotalCountOfEstimate,
} from "../../toolkit/slices/organizationSlice";
import { useParams } from "react-router-dom";
import dayjs from "dayjs";
import InvoiceView from "../../components/InvoiceView";
import { getEstimateByLeadId } from "../../toolkit/slices/leadSlice";

export const columns = [
  { name: "ID", uid: "id" },
  { name: "PRODUCT", uid: "productName", sortable: true },
  { name: "COMPANY", uid: "companyName" },
  { name: "UNIT", uid: "unitName" },
  { name: "GST", uid: "gst" },
  { name: "PROF.FEE", uid: "professionalFees" },
  { name: "GOVT.FEE", uid: "govermentfees" },
  { name: "SER.FEE", uid: "serviceCharge" },
  { name: "OTH.FEE", uid: "otherFees" },
  { name: "INVOICE NOTE", uid: "invoiceNote" },
  { name: "PRIMARY CONT.", uid: "primaryContact" },
  { name: "SEC. CONT.", uid: "secondaryContact" },
  { name: "ADDRESS", uid: "address" },
  { name: "ACTIONS", uid: "actions" },
];

export function capitalize(s) {
  return s ? s.charAt(0).toUpperCase() + s.slice(1).toLowerCase() : "";
}

const INITIAL_VISIBLE_COLUMNS = [
  "id",
  "productName",
  "companyName",
  "gst",
  "professionalFees",
  "govermentfees",
  "serviceCharge",
  "otherFees",
  "primaryContact",
  "address",
  "actions",
];

const Ledger = () => {
  const dispatch = useDispatch();
  const { userId } = useParams();
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const data = useSelector((state) => state.organization.allEstimateByStatus);
  const count = useSelector((state) => state.organization.totalEstimateCount);
  const [filterValue, setFilterValue] = React.useState("");
  const [selectedKeys, setSelectedKeys] = React.useState(new Set([]));
  const [visibleColumns, setVisibleColumns] = React.useState(
    new Set(INITIAL_VISIBLE_COLUMNS)
  );
  const [status, setStatus] = useState("All");
  const [estimateDetail, setEstimateDetail] = useState(null);
  const [rowsPerPage, setRowsPerPage] = React.useState(50);
  const [sortDescriptor, setSortDescriptor] = React.useState({
    column: "age",
    direction: "ascending",
  });
  const [page, setPage] = React.useState(1);
  const hasSearchFilter = Boolean(filterValue);

  useEffect(() => {
    dispatch(
      getEstimateByStatus({
        userId: userId,
        status: status,
        page: page,
        size: rowsPerPage,
      })
    );
    dispatch(getTotalCountOfEstimate({ userId, status }));
  }, [dispatch, page, rowsPerPage, status]);

  const headerColumns = React.useMemo(() => {
    if (visibleColumns === "all") return columns;

    return columns.filter((column) =>
      Array.from(visibleColumns).includes(column.uid)
    );
  }, [visibleColumns]);

  const filteredItems = React.useMemo(() => {
    let filteredUsers = [...data];

    if (hasSearchFilter) {
      filteredUsers = filteredUsers.filter((item) =>
        item.productName.toLowerCase().includes(filterValue.toLowerCase())
      );
    }

    return filteredUsers;
  }, [data, filterValue]);

  const pages = Math.ceil(count / rowsPerPage) || 1;

  const items = React.useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    const end = start + rowsPerPage;

    return filteredItems.slice(start, end);
  }, [page, filteredItems, rowsPerPage]);

  const sortedItems = React.useMemo(() => {
    return [...items].sort((a, b) => {
      const first = a[sortDescriptor.column];
      const second = b[sortDescriptor.column];
      const cmp = first < second ? -1 : first > second ? 1 : 0;

      return sortDescriptor.direction === "descending" ? -cmp : cmp;
    });
  }, [sortDescriptor, items]);

  const handleViewEstimate = (value) => {
    dispatch(getEstimateByLeadId(value?.leadId))
      .then((resp) => {
        if (resp.meta.requestStatus === "fulfilled") {
          let data = resp?.payload;
          setEstimateDetail(data);
          onOpen();
        } else {
          addToast({
            title: "There is Some Issue in estimate",
            color: "danger",
          });
        }
      })
      .catch(() =>
        addToast({ title: "There is Some Issue in estimate", color: "danger" })
      );
  };

  const handleChangeStatus = (e, id) => {
    dispatch(
      estimateApprovedAndDisapprovedStatus({
        status: e,
        estimateId: id,
        userId: userId,
      })
    )
      .then((resp) => {
        if (resp.meta.requestStatus === "fulfilled") {
          addToast({
            title: "Status updated successfully !.",
            color: "success",
          });
          dispatch(
            getEstimateByStatus({
              userId: userId,
              status: status,
              page: page,
              size: rowsPerPage,
            })
          );
        } else {
          addToast({ title: "Something went wrong !.", color: "danger" });
        }
      })
      .catch(() =>
        addToast({ title: "Something went wrong !.", color: "danger" })
      );
  };

  const renderCell = React.useCallback((rowData, columnKey) => {
    const cellValue = rowData[columnKey];
    switch (columnKey) {
      case "productName":
        return (
          <div className="flex flex-col gap-1">
            <p className="text-sm font-medium capitalize">
              {rowData?.productName}
            </p>
            {rowData?.status && (
              <Chip
                className="capitalize"
                color={rowData?.status === "Approved" ? "success" : "danger"}
                size="sm"
                variant="flat"
              >
                {rowData?.status}
              </Chip>
            )}
          </div>
        );
      case "companyName":
        return (
          <div className="flex flex-col gap-2">
            <p className="text-sm font-medium capitalize">
              {rowData?.companyName}
            </p>
            <span>Age : {rowData?.companyAge || "-"}</span>
          </div>
        );
      case "unitName":
        return <p className="text-sm capitalize">{rowData?.unitName}</p>;
      case "createDate":
        return (
          <p className="text-sm capitalize">
            {dayjs(rowData?.createDate).format("YYYY-MM-DD")}
          </p>
        );
      case "gst":
        return (
          <div className="flex flex-col gap-2">
            <span className="text-sm">{rowData?.gstNo}</span>
            <span className="text-sm">Pan : {rowData?.panNo}</span>
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
      case "govermentfees":
        return (
          <div className="flex flex-col">
            <span className="">₹{rowData?.govermentfees || "-"}</span>
            <span className="text-tiny text-gray-400">
              GST : {rowData?.govermentGst || "-"}%
            </span>
          </div>
        );
      case "serviceCharge":
        return (
          <div className="flex flex-col">
            <span className="">₹{rowData?.serviceCharge || "-"}</span>
            <span className="text-tiny text-gray-400">
              GST : {rowData?.serviceGst || "-"}%
            </span>
          </div>
        );
      case "otherFees":
        return (
          <div className="flex flex-col">
            <span className="">₹ {rowData?.otherFees || "-"}</span>
            <span className="text-tiny text-gray-400">
              GST : {rowData?.otherGst || "-"}%
            </span>
          </div>
        );
      case "invoiceNote":
        return (
          <div className="flex items-start gap-2">
            <span className="text-xs">{rowData?.invoiceNote}</span>
          </div>
        );
      case "primaryContact":
        return (
          <div className="flex flex-col">
            <span className="font-semibold">
              {rowData.primaryContact?.name || "-"}
            </span>
            <span className="text-sm text-gray-400">
              {rowData?.primaryContact?.emails || "-"}
            </span>
            <span className="text-sm text-gray-400">
              {rowData?.primaryContact?.contactNo || "-"},
              {rowData?.primaryContact?.contactNo || "-"}
            </span>
          </div>
        );
      case "secondaryContact":
        return (
          <div className="flex flex-col">
            <span className="font-semibold">
              {rowData.secondaryContact?.name || "-"}
            </span>
            <span className="text-sm text-gray-400">
              {rowData?.secondaryContact?.emails || "-"}
            </span>
            <span className="text-sm text-gray-400">
              {rowData?.secondaryContact?.contactNo || "-"},
              {rowData?.secondaryContact?.contactNo || "-"}
            </span>
          </div>
        );
      case "address":
        return (
          <div className="flex flex-col">
            <span className="font-semibold">{rowData.address || "-"}</span>
            <span className="text-sm text-gray-400">
              {rowData.city || ""},{rowData?.state},{rowData?.country}
            </span>
          </div>
        );
      case "actions":
        return (
          <div className="relative flex justify-center items-center gap-2">
            <Dropdown>
              <DropdownTrigger>
                <Button isIconOnly size="sm" variant="light">
                  <EllipsisVertical className="text-default-300" />
                </Button>
              </DropdownTrigger>
              <DropdownMenu
                selectionMode="single"
                selectedKeys={[rowData?.status]}
                disabledKeys={
                  rowData?.status === "Approved" ? ["Disapproved"] : []
                }
                onSelectionChange={(e) => {
                  let key = Array.from(e)[0];
                  if (key == "viewEstimate") {
                    handleViewEstimate(rowData);
                  } else {
                    handleChangeStatus(key, rowData?.id);
                  }
                }}
              >
                <DropdownItem key="viewEstimate">View estimate</DropdownItem>
                <DropdownItem key="Approved">Approved</DropdownItem>
                <DropdownItem key="Disapproved">Disapproved</DropdownItem>
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

  const topContent = React.useMemo(() => {
    return (
      <div className="flex flex-col gap-4">
        <div className="flex justify-between gap-3 items-end">
          <Input
            isClearable
            className="w-full sm:max-w-[44%]"
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
                  {status}
                </Button>
              </DropdownTrigger>
              <DropdownMenu
                disallowEmptySelection
                aria-label="Table Columns"
                selectionMode="single"
                selectedKeys={[status]}
                onSelectionChange={(selectedKeys) => {
                  const selected = Array.from(selectedKeys)[0];
                  setStatus(selected);
                }}
              >
                {[
                  { label: "All", uid: "All" },
                  { label: "Initiated", uid: "Initiated" },
                  { label: "Approved", uid: "Approved" },
                  { label: "Disapproved", uid: "Disapproved" },
                ].map((status) => (
                  <DropdownItem key={status.uid} className="capitalize">
                    {capitalize(status.label)}
                  </DropdownItem>
                ))}
              </DropdownMenu>
            </Dropdown>
            <Dropdown>
              <DropdownTrigger className="hidden sm:flex">
                <Button
                  endContent={<ChevronDown className="text-small" />}
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
          <span className="text-default-400 text-small">
            Total {count} estimate
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
  }, [selectedKeys, items.length, page, pages, hasSearchFilter]);

  return (
    <>
      <h1 className="font-sans text-2xl font-medium mb-1">Estimate list</h1>
      <Table
        isHeaderSticky
        aria-label="Example table with custom cells, pagination and sorting"
        bottomContent={bottomContent}
        bottomContentPlacement="outside"
        classNames={{
          wrapper: "max-h-[55vh]",
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
        <TableBody emptyContent={"No users found"} items={sortedItems}>
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
          <ModalHeader>Estimate</ModalHeader>
          <ModalBody className="max-h-[90vh] overflow-auto">
            <InvoiceView details={estimateDetail} />
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
};

export default Ledger;
