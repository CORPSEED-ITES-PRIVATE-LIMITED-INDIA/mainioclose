import {
  addToast,
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
  useDisclosure,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
} from "@heroui/react";
import { ChevronDown, EllipsisVertical, Search } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import {
  approveProcurementPaymentRequest,
  getAllPaymentApprovals,
  getProcurementPaymentRequestList,
  getProcurementPurchaseOrder,
  rejectProcurementPaymentRequest,
  releaseProcurementPaymentRequest,
} from "../toolkit/slices/accountSlice";

const columns = [
  { name: "ID", uid: "companyId" },
  { name: "COMPANY", uid: "companyName", sortable: true },
  { name: "GST", uid: "gstNo" },
  { name: "ASSIGNEE", uid: "assignee" },
  { name: "PRIMARY ADDRESS", uid: "address" },
  { name: "SECONDARY ADDRESS", uid: "secondaryAddress" },
  { name: "ACTIONS", uid: "actions" },
];

function capitalize(s) {
  return s ? s.charAt(0).toUpperCase() + s.slice(1).toLowerCase() : "";
}

const INITIAL_VISIBLE_COLUMNS = [
  "companyName",
  "gstNo",
  "status",
  "assignee",
  "address",
  "secondaryAddress",
  "actions",
];

const ProcurementPaymentRequest = () => {
  const { userId } = useParams();
  const dispatch = useDispatch();
  const count = useSelector(
    (state) => state.account.procurementPaymentRequestList?.totalElements,
  );
  const data = useSelector(
    (state) => state.account.procurementPaymentRequestList?.content,
  );
  const approveModal = useDisclosure();
  const rejectModal = useDisclosure();
  const releaseModal = useDisclosure();
  const [filterValue, setFilterValue] = useState("");
  const [selectedKeys, setSelectedKeys] = useState(new Set([]));
  const [visibleColumns, setVisibleColumns] = useState(
    new Set(INITIAL_VISIBLE_COLUMNS),
  );
  const [sortDescriptor, setSortDescriptor] = useState({
    column: "age",
    direction: "ascending",
  });
  const [filteration, setFilteration] = useState({
    userId: userId,
    page: 1,
    size: 50,
    status: "PENDING",
  });
  const [rowItem, setRowItem] = useState(null);

  const hasSearchFilter = Boolean(filterValue);

  useEffect(() => {
    dispatch(getProcurementPaymentRequestList(filteration));
  }, [dispatch, filteration]);

  const headerColumns = useMemo(() => {
    if (visibleColumns === "all") return columns;

    return columns.filter((column) =>
      Array.from(visibleColumns).includes(column.uid),
    );
  }, [visibleColumns]);

  const filteredItems = useMemo(() => {
    let filteredUsers = [...(data || [])];

    if (hasSearchFilter) {
      filteredUsers = filteredUsers.filter((user) =>
        user?.projectName?.toLowerCase().includes(filterValue.toLowerCase()),
      );
    }
    return filteredUsers;
  }, [data, filterValue]);

  const pages = Math.ceil(count / filteration?.size) || 1;

  const sortedItems = useMemo(() => {
    return [...filteredItems].sort((a, b) => {
      const first = a[sortDescriptor.column];
      const second = b[sortDescriptor.column];
      const cmp = first < second ? -1 : first > second ? 1 : 0;

      return sortDescriptor.direction === "descending" ? -cmp : cmp;
    });
  }, [sortDescriptor, filteredItems]);

  const handleActionPress = (item, key) => {
    setRowItem(item);
    if (key === "Approved") {
      approveModal.onOpen();
    } else if (key === "Rejected") {
      rejectModal.onOpen();
    } else if (key === "Release") {
      releaseModal.onOpen();
    }
  };

  const handleApproveRequest = (values) => {
    // Implementation for handling approve request
    dispatch(
      approveProcurementPaymentRequest({
        paymentRequestId: rowItem?.id,
        data: values,
        userId,
      }),
    )
      .then((resp) => {
        if (resp.meta.requestStatus === "fulfilled") {
          addToast({
            title: "SUCCESS",
            description: "Approved successfully !.",
            color: "success",
          });
          approveModal.onClose();
          setRowItem(null);
          dispatch(getProcurementPaymentRequestList(filteration));
        } else {
          //handle error
          addToast({
            title: "Error",
            description: resp.payload || "Something went wrong",
            color: "danger",
          });
        }
      })
      .catch(() =>
        addToast({
          title: "ERROR",
          description: "Something went wrong",
          color: "danger",
        }),
      );
  };

  const handleRejectRequest = (values) => {
    // Implementation for handling approve request
    dispatch(
      rejectProcurementPaymentRequest({
        paymentRequestId: rowItem?.id,
        data: values,
        userId,
      }),
    )
      .then((resp) => {
        if (resp.meta.requestStatus === "fulfilled") {
          addToast({
            title: "SUCCESS",
            description: "Rejected successfully !.",
            color: "success",
          });
          rejectModal.onClose();
          setRowItem(null);
          dispatch(getProcurementPaymentRequestList(filteration));
        } else {
          //handle error
          addToast({
            title: "Error",
            description: resp.payload || "Something went wrong",
            color: "danger",
          });
        }
      })
      .catch(() =>
        addToast({
          title: "ERROR",
          description: "Something went wrong",
          color: "danger",
        }),
      );
  };

  const handlePaymentReleaseRequest = (values) => {
    // Implementation for handling approve request
    dispatch(
      releaseProcurementPaymentRequest({
        paymentRequestId: rowItem?.id,
        data: values,
        userId,
      }),
    )
      .then((resp) => {
        if (resp.meta.requestStatus === "fulfilled") {
          addToast({
            title: "SUCCESS",
            description: "Payment released successfully !.",
            color: "success",
          });
          releaseModal.onClose();
          setRowItem(null);
          dispatch(getProcurementPaymentRequestList(filteration));
        } else {
          //handle error
          addToast({
            title: "Error",
            description: resp.payload || "Something went wrong",
            color: "danger",
          });
        }
      })
      .catch(() =>
        addToast({
          title: "ERROR",
          description: "Something went wrong",
          color: "danger",
        }),
      );
  };

  const renderCell = useCallback((rowData, columnKey) => {
    switch (columnKey) {
      case "companyName":
        return (
          <div className="flex items-start gap-2">
            <div className="flex flex-col">
              <p className="font-normal capitalize">
                {rowData?.companyName || "-"}
              </p>
              <p className="font-normal text-xs text-gray-400">
                Age : {rowData?.age || "-"}
              </p>
            </div>
          </div>
        );

      case "gstNo":
        return (
          <div className="flex flex-col">
            <span className="font-normal capitalize">
              {rowData?.gstNo || "Unknown"}
            </span>
            {rowData?.gstType && (
              <Chip size="sm" className="text-tiny capitalize" variant="flat">
                {rowData?.gstType}
              </Chip>
            )}
          </div>
        );
      case "assignee":
        return (
          <div className="flex flex-col">
            <span className="font-normal">{rowData?.assignee || "-"}</span>
          </div>
        );
      case "address":
        return rowData?.address ? (
          <div className="flex flex-col">
            <span className="font-normal">{rowData?.address || "-"}</span>
            <div className="flex items-center gap-1">
              {" "}
              <span className="text-gray-400 text-tiny">
                {rowData?.city || "-"},
              </span>
              <span className="text-gray-400 text-tiny">
                {rowData?.state || "-"},
              </span>
            </div>

            <div className="flex items-center gap-1">
              <span className="text-gray-400 text-tiny">
                {rowData?.country || "-"}
              </span>
            </div>
          </div>
        ) : (
          "-"
        );
      case "secondaryAddress":
        return rowData?.secAddress ? (
          <div className="flex flex-col">
            <span className="font-normal">{rowData?.secAddress || "-"}</span>
            <div className="flex items-center gap-1">
              {" "}
              <span className="text-gray-400">{rowData?.secCity || "-"}</span>,
              <span className="text-gray-400">{rowData?.secState || "-"}</span>,
            </div>
            <div className="flex items-center gap-1">
              <span className="text-gray-400 text-tiny">
                {rowData?.seCountry || "-"}
              </span>
            </div>
          </div>
        ) : (
          "-"
        );
      case "actions":
        return (
          <Dropdown>
            <DropdownTrigger>
              <Button size="sm" isIconOnly variant="light">
                <EllipsisVertical />
              </Button>
            </DropdownTrigger>
            <DropdownMenu>
              <DropdownItem
                onPress={() => handleActionPress(rowData, "Release")}
              >
                Release payment
              </DropdownItem>
              <DropdownItem
                onPress={() => handleActionPress(rowData, "Approved")}
              >
                Approved
              </DropdownItem>
              <DropdownItem
                onPress={() => handleActionPress(rowData, "Rejected")}
              >
                Rejected
              </DropdownItem>
            </DropdownMenu>
          </Dropdown>
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
            placeholder="Search ..."
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
                  { label: "PENDING", uid: "PENDING" },
                  { label: "APPROVED", uid: "APPROVED" },
                  { label: "REJECTED", uid: "REJECTED" },
                ].map((status) => (
                  <DropdownItem key={status.uid} className="capitalize">
                    {status.label}
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
            Total {count} payments requests
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
    count,
    onSearchChange,
    hasSearchFilter,
    filteration.status,
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
        Procurement Payment Requests
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
        <TableBody emptyContent={"No data found"} items={sortedItems}>
          {(item) => (
            <TableRow key={item.companyId}>
              {(columnKey) => (
                <TableCell>{renderCell(item, columnKey)}</TableCell>
              )}
            </TableRow>
          )}
        </TableBody>
      </Table>

      <Modal
        size="2xl"
        isOpen={approveModal.isOpen}
        onOpenChange={approveModal.onOpenChange}
      >
        <ModalContent>
          {(onClose) => (
            <Form
              className="w-full"
              onSubmit={(e) => {
                e.preventDefault();
                let data = Object.fromEntries(new FormData(e.currentTarget));
                handleApproveRequest(data);
              }}
            >
              <ModalHeader>Approve Request</ModalHeader>
              <ModalBody className="grid md:grid-cols-1 gap-4 w-full">
                <Input
                  label="Comment"
                  name="comment"
                  isRequired
                  errorMessage="please enter a comment"
                />
              </ModalBody>

              <ModalFooter className="flex justify-end gap-2 w-full">
                <Button onPress={onClose}>Close</Button>
                <Button color="primary" type="submit">
                  Submit
                </Button>
              </ModalFooter>
            </Form>
          )}
        </ModalContent>
      </Modal>
      <Modal
        size="2xl"
        isOpen={rejectModal.isOpen}
        onOpenChange={rejectModal.onOpenChange}
      >
        <ModalContent>
          {(onClose) => (
            <Form
              className="w-full"
              onSubmit={(e) => {
                e.preventDefault();
                let data = Object.fromEntries(new FormData(e.currentTarget));
                handleRejectRequest(data);
              }}
            >
              <ModalHeader>Reject Request</ModalHeader>
              <ModalBody className="grid md:grid-cols-1 gap-4 w-full">
                <Input
                  label="Reason for rejection"
                  name="reason"
                  isRequired
                  errorMessage="please enter a reason for rejection"
                />
              </ModalBody>

              <ModalFooter className="flex justify-end gap-2 w-full">
                <Button onPress={onClose}>Close</Button>
                <Button color="primary" type="submit">
                  Submit
                </Button>
              </ModalFooter>
            </Form>
          )}
        </ModalContent>
      </Modal>
      <Modal
        size="2xl"
        isOpen={rejectModal.isOpen}
        onOpenChange={rejectModal.onOpenChange}
      >
        <ModalContent>
          {(onClose) => (
            <Form
              className="w-full"
              onSubmit={(e) => {
                e.preventDefault();
                let data = Object.fromEntries(new FormData(e.currentTarget));
                handleRejectRequest(data);
              }}
            >
              <ModalHeader>Release Payment Request</ModalHeader>
              <ModalBody className="grid md:grid-cols-1 gap-4 w-full">
                <Input
                  label="Comment for payment release"
                  name="comment"
                  isRequired
                  errorMessage="please enter a comment for payment release"
                />
              </ModalBody>

              <ModalFooter className="flex justify-end gap-2 w-full">
                <Button onPress={onClose}>Close</Button>
                <Button color="primary" type="submit">
                  Submit
                </Button>
              </ModalFooter>
            </Form>
          )}
        </ModalContent>
      </Modal>
    </>
  );
};

export default ProcurementPaymentRequest;
