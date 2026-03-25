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
  useDisclosure,
  Modal,
  ModalBody,
  ModalFooter,
  ModalContent,
  ModalHeader,
  Textarea,
  Select,
  SelectItem,
  addToast,
  Chip,
} from "@heroui/react";
import { ChevronDown, EllipsisVertical, Search } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import {
  getAllUnbillCount,
  getAllUnbillList,
  updateStatusForUnbill,
} from "../../toolkit/slices/organizationSlice";
import { inrCurrency } from "../../common";
import dayjs from "dayjs";
import {
  cancelUnBilledInvoice,
  getUnBilledDetailById,
} from "../../toolkit/slices/accountSlice";
import EstimateView from "../../components/EstimateView";
import { useParams } from "react-router-dom";
import TaxInvoice from "../../components/TaxInvoice";
import UnbilledView from "../../components/UnbilledView";
import {
  cancelProjectByUnbilledNumberInOperations,
  createProjectsForOperations,
} from "../../toolkit/slices/operationSlice";

export const columns = [
  { name: "DATE", uid: "date" },
  { name: "ESTIMATE NUMBER", uid: "estimateNumber" },
  { name: "UNBILL NO.", uid: "unbillNo" },
  { name: "SERVICE", uid: "service" },
  { name: "CLIENT", uid: "client" },
  { name: "COMPANY", uid: "companyName" },
  { name: "TOTAL AMOUNT", uid: "totalAmount" },
  { name: "RECEIVED AMOUNT", uid: "receivedAmount" },
  { name: "OUTSTANDING AMOUNT", uid: "outstandingAmount" },
  { name: "ADDED BY", uid: "addedBy" },
  { name: "ACTIONS", uid: "actions" },
];

export function capitalize(s) {
  return s ? s.charAt(0).toUpperCase() + s.slice(1).toLowerCase() : "";
}

const INITIAL_VISIBLE_COLUMNS = [
  "date",
  "unbillNo",
  "estimateNumber",
  "service",
  "client",
  "companyName",
  "totalAmount",
  "receivedAmount",
  "outstandingAmount",
  "addedBy",
  "actions",
];

const Unbill = () => {
  const dispatch = useDispatch();
  const { userId } = useParams();
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const statusModal = useDisclosure();
  const data = useSelector((state) => state.organization.unBillList);
  const count = useSelector((state) => state.organization.unBillCount);
  const invoiceDetail = useSelector((state) => state.account.unbilledDetail);
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
  const [rowItem, setRowItem] = useState(null);
  const [status, setStatus] = useState("PENDING_APPROVAL");
  const [updatedStatusData, setUpdatedStatusData] = useState({
    approverUserId: userId,
    approvalRemarks: "",
    rejectionReason: "",
  });

  useEffect(() => {
    dispatch(getAllUnbillList({ page, size: rowsPerPage, userId, status }));
    dispatch(getAllUnbillCount({ userId, status }));
  }, [dispatch, page, rowsPerPage, status]);

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

  const renderCell = React.useCallback((rowData, columnKey) => {
    const cellValue = rowData[columnKey];
    switch (columnKey) {
      case "date":
        return (
          <div>
            <p className="text-sm capitalize">
              {dayjs(rowData?.date).format("DD-MM-YYYY")}
            </p>
            <Chip size="sm">{rowData?.status}</Chip>
          </div>
        );
      case "unbillNo":
        return <p className="text-sm capitalize">{`UN000${rowData?.id}`}</p>;
      case "service":
        return <p className="text-sm capitalize">{rowData?.productName}</p>;
      case "company":
        return <p className="text-sm capitalize">{rowData?.company}</p>;
      case "client":
        return (
          <div className="flex flex-col gap-2">
            <p className="text-sm capitalize">{rowData?.contactName}</p>
          </div>
        );
      case "totalAmount":
        return (
          <p className="text-sm capitalize">
            {inrCurrency(rowData?.totalAmount)}
          </p>
        );
      case "receivedAmount":
        return (
          <p className="text-sm capitalize">
            {inrCurrency(rowData?.receivedAmount)}
          </p>
        );
      case "outstandingAmount":
        return (
          <p className="text-sm capitalize">
            {inrCurrency(rowData?.outstandingAmount)}
          </p>
        );
      case "addedBy":
        return <p className="text-sm capitalize">{rowData?.createdByName}</p>;
      case "actions":
        return (
          <div className="relative flex justify-center items-center gap-2">
            <Dropdown>
              <DropdownTrigger>
                <Button isIconOnly size="sm" variant="light">
                  <EllipsisVertical className="text-default-300" />
                </Button>
              </DropdownTrigger>
              <DropdownMenu>
                <DropdownItem
                  key="view"
                  onPress={() => {
                    onOpen();
                    dispatch(
                      getUnBilledDetailById({ id: rowData?.id, userId }),
                    );
                  }}
                >
                  View
                </DropdownItem>
                <DropdownItem
                  key="status"
                  onPress={() => {
                    statusModal.onOpen();
                    setRowItem(rowData);
                  }}
                >
                  Update status
                </DropdownItem>
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

  const handleUpdateStatus = () => {
    if (updatedStatusData?.approvalRemarks === "CANCELLED") {
      dispatch(
        cancelUnBilledInvoice({
          id: rowItem?.id,
          userId,
          reason: updatedStatusData?.rejectionReason,
        }),
      )
        .then((re) => {
          if (re.meta.requestStatus === "fulfilled") {
            addToast({
              title: "Unbill canceled successfully !.",
              color: "success",
            });
            dispatch(cancelProjectByUnbilledNumberInOperations(rowItem?.id))
              .then((respData) => {
                if (respData.meta.requestStatus === "fulfilled") {
                  addToast({
                    title: "Unbill canceled successfully in Operation !.",
                    color: "success",
                  });
                  setRowItem(null);
                  setUpdatedStatusData({
                    approverUserId: userId,
                    approvalRemarks: "",
                    rejectionReason: "",
                  });
                  statusModal.onClose();
                } else {
                  addToast({
                    title: respData?.payload?.data?.message,
                    color: "danger",
                  });
                }
              })
              .catch(() =>
                addToast({
                  title: "Something went wrong in Operation !.",
                  color: "danger",
                }),
              );
          } else {
            addToast({ title: re?.payload?.data?.message, color: "danger" });
          }
        })
        .catch(() =>
          addToast({ title: "Something went wrong !.", color: "danger" }),
        );
    } else {
      dispatch(
        updateStatusForUnbill({
          unbilledId: rowItem?.id,
          data: updatedStatusData,
        }),
      )
        .then((resp) => {
          if (resp.meta.requestStatus === "fulfilled") {
            addToast({
              title: "Status updated successfully !.",
              color: "success",
            });
            // dispatch(
            //   createProjectsForOperations({
            //     ...resp?.payload,
            //     unitId: resp?.payload?.companyUnitId,
            //   }),
            // ).then((pro) => {
            //   if (pro.meta.requestStatus === "fulfilled") {
            //     addToast({
            //       title: "Project created successfully !.",
            //       color: "success",
            //     });
            //   } else {
            //     addToast({ title: "Something went wrong !.", color: "danger" });
            //   }
            // });
            setRowItem(null);
            setUpdatedStatusData({
              approverUserId: userId,
              approvalRemarks: "",
              rejectionReason: "",
            });
            statusModal.onClose();
          } else {
            addToast({ title: resp?.payload?.data?.message, color: "danger" });
          }
        })
        .catch(() =>
          addToast({ title: "Something went wrong !.", color: "danger" }),
        );
    }
  };

  const topContent = React.useMemo(() => {
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
              <DropdownTrigger>
                <Button
                  className="capitalize"
                  variant="flat"
                  endContent={<ChevronDown />}
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
                <DropdownItem key="PENDING_APPROVAL">
                  PENDING_APPROVAL
                </DropdownItem>
                <DropdownItem key="APPROVED">APPROVED</DropdownItem>
                <DropdownItem key="REJECTED">REJECTED</DropdownItem>
              </DropdownMenu>
            </Dropdown>
            <Dropdown>
              <DropdownTrigger>
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
            Total {count} unbilled items
          </span>
          <div className="flex gap-4">
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
  }, [selectedKeys, count, page, pages, hasSearchFilter]);

  return (
    <>
      <h1 className="font-sans text-2xl font-medium mb-1">Unbilled list</h1>
      <Table
        isHeaderSticky
        aria-label="Example table with custom cells, pagination and sorting"
        bottomContent={bottomContent}
        bottomContentPlacement="outside"
        classNames={{
          wrapper: "max-h-[65vh] overflow-scroll w-full",
          table: "w-full",
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
            <TableRow key={`${item?.id}unbill`}>
              {(columnKey) => (
                <TableCell>{renderCell(item, columnKey)}</TableCell>
              )}
            </TableRow>
          )}
        </TableBody>
      </Table>
      <Modal
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        size="5xl"
        placement="top-center"
        backdrop="blur"
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">Unbill</ModalHeader>
              <ModalBody className="max-h-[85vh] overflow-auto">
                <UnbilledView invoiceData={invoiceDetail} heading={"Unbill"} />
              </ModalBody>
              <ModalFooter>
                <Button color="danger" variant="light" onPress={onClose}>
                  Close
                </Button>
                <Button color="primary" onPress={onClose}>
                  Action
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
      <Modal
        isOpen={statusModal.isOpen}
        onOpenChange={statusModal.onOpenChange}
        placement="top-center"
        backdrop="blur"
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                Update Status
              </ModalHeader>
              <ModalBody className="max-h-[85vh] overflow-auto">
                <Select
                  label="Select status"
                  isRequired
                  selectedKeys={[updatedStatusData?.approvalRemarks]}
                  onSelectionChange={(e) => {
                    let key = Array.from(e)[0];
                    setUpdatedStatusData((prev) => ({
                      ...prev,
                      approvalRemarks: key,
                    }));
                  }}
                >
                  {[
                    // { key: "PENDING_APPROVAL", label: "PENDING_APPROVAL" },
                    { key: "APPROVED", label: "APPROVED" },
                    // { key: "PARTIALLY_PAID", label: "PARTIALLY_PAID" },
                    // { key: "FULLY_PAID", label: "FULLY_PAID" },
                    { key: "REJECTED", label: "REJECTED" },
                    { key: "CANCELLED", label: "CANCELLED" },
                  ].map((item) => (
                    <SelectItem key={item.key}>{item.label}</SelectItem>
                  ))}
                </Select>
                {updatedStatusData?.approvalRemarks === "REJECTED" && (
                  <Textarea
                    label="Remark"
                    isRequired
                    value={updatedStatusData?.rejectionReason}
                    onChange={(e) =>
                      setUpdatedStatusData((prev) => ({
                        ...prev,
                        rejectionReason: e.target.value,
                      }))
                    }
                  />
                )}
              </ModalBody>
              <ModalFooter>
                <Button color="danger" variant="light" onPress={onClose}>
                  Close
                </Button>
                <Button color="primary" onPress={handleUpdateStatus}>
                  Action
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
};

export default Unbill;
