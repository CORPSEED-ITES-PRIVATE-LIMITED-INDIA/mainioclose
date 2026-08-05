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
  getProcurementPaymentRequestList,
  releaseProcurementPaymentRequest,
} from "../../toolkit/slices/accountSlice";
import { getProcurementPaymentRequestByOrderId } from "../../toolkit/slices/operationSlice";
import { inrCurrency } from "../../common";
import dayjs from "dayjs";

const columns = [
  { name: "ID", uid: "id" },
  { name: "PO NO.", uid: "poNumber", sortable: true },
  { name: "PROJECT NAME", uid: "projectName" },
  { name: "PROJECT NO.", uid: "projectNo" },
  { name: "VENDOR NAME", uid: "vendorName" },
  { name: "INVOICE AMOUNT", uid: "invoiceAmount" },
  { name: "PAYABLE AMOUNT", uid: "payableAmount" },
  { name: "STATUS", uid: "status" },
  { name: "APPROVED DATE", uid: "approvedDate" },
  { name: "PAYMENT RELEASED DATE", uid: "paymentReleasedDate" },
  { name: "ATTACHMENTS", uid: "proofAttachmentUrls" },
];

function capitalize(s) {
  return s ? s.charAt(0).toUpperCase() + s.slice(1).toLowerCase() : "";
}

const getStatusColor = (status) => {
  switch (status) {
    case "DRAFT":
      return "default";

    case "PENDING_APPROVAL":
      return "warning";

    case "APPROVED":
      return "success";

    case "REJECTED":
      return "danger";

    case "RELEASED":
    case "PO_RELEASED":
      return "primary";

    case "PARTIALLY_COMPLETED":
      return "warning";

    case "COMPLETED":
    case "PAYMENT_DONE":
      return "success";

    default:
      return "default";
  }
};

const INITIAL_VISIBLE_COLUMNS = [
  "poNumber",
  "projectName",
  "projectNo",
  "vendorName",
  "invoiceAmount",
  "payableAmount",
  "status",
  "approvedDate",
  "paymentReleasedDate",
  "proofAttachmentUrls",
];

const ProjectPR = () => {
  const { userId, poId } = useParams();
  const dispatch = useDispatch();
  const count = useSelector(
    (state) => state.operation.paymentRequestByPoId?.totalElements,
  );
  const data = useSelector(
    (state) => state.operation.paymentRequestByPoId?.content,
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
    procurementOrderId: poId,
    page: 1,
    size: 50,
    status: "PENDING",
  });
  const [rowItem, setRowItem] = useState(null);

  const hasSearchFilter = Boolean(filterValue);

  useEffect(() => {
    dispatch(getProcurementPaymentRequestByOrderId(filteration));
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
      case "projectName":
        return (
          <div className="flex items-start gap-2">
            <div className="flex flex-col">
              <p className="font-normal text-[12.5px] capitalize">
                {rowData?.projectName || "-"}
              </p>
              <p className="font-normal text-[11.5px] text-default-500">
                {rowData?.projectNo || "-"}
              </p>
            </div>
          </div>
        );

      case "vendorName":
        return (
          <div className="flex flex-col">
            <span className="font-normal text-[12.5px] capitalize">
              {rowData?.vendorName || "Unknown"}
            </span>
          </div>
        );
      case "invoiceAmount":
        return (
          <div className="flex flex-col">
            <span className="font-normal text-[12.5px]">
              {inrCurrency(rowData?.invoiceAmount) || "-"}
            </span>
          </div>
        );
      case "payableAmount":
        return (
          <div className="flex flex-col">
            <span className="font-normal text-[12.5px]">
              {inrCurrency(rowData?.payableAmount) || "-"}
            </span>
          </div>
        );
      case "status":
        return (
          <Chip
            size="sm"
            className="capitalize"
            variant="flat"
            color={getStatusColor(rowData?.status)}
          >
            {rowData?.status || "-"}
          </Chip>
        );
      case "approvedDate":
        return (
          <div className="flex flex-col text-[12.5px]">
            {dayjs(rowData?.approvedDate).format("DD MMM YYYY hh:mm A") || "-"}
          </div>
        );
      case "paymentReleasedDate":
        return (
          <div className="flex flex-col text-[12.5px]">
            {dayjs(rowData?.paymentReleasedDate).format(
              "DD MMM YYYY hh:mm A",
            ) || "-"}
          </div>
        );
      case "proofAttachmentUrls":
        return (
          <div className="flex flex-col">
            {rowData?.proofAttachmentUrls?.map((url, index) => (
              <a
                key={index}
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[12.5px] text-blue-500 hover:underline"
              >
                Proof Attachment {index + 1}
              </a>
            )) || "-"}
          </div>
        );

      case "actions":
        return (
          <Dropdown>
            <DropdownTrigger>
              <Button size="sm" isIconOnly variant="light">
                <EllipsisVertical className="w-4 h-4" />
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
      <div className="flex flex-col gap-2">
        <div className="flex justify-between gap-2 items-center flex-wrap">
          <Input
            isClearable
            size="sm"
            className="w-full sm:max-w-[280px]"
            classNames={{ inputWrapper: "h-8 min-h-8" }}
            placeholder="Search ..."
            startContent={<Search className="w-4 h-4 text-default-400" />}
            value={filterValue}
            onClear={() => onClear()}
            onValueChange={onSearchChange}
          />
          <div className="flex gap-1.5 flex-wrap">
            {/* <Dropdown>
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
            </Dropdown> */}
            <Dropdown>
              <DropdownTrigger className="hidden sm:flex">
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
            Total {count} payments requests
          </span>
          <label className="flex items-center gap-1 text-default-400 text-[12.5px]">
            Rows per page:
            <select
              className="bg-transparent outline-hidden text-default-400 text-[12.5px] cursor-pointer"
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
    <div className="flex flex-col gap-2">
      <h1 className="font-sans text-lg font-semibold mb-2 shrink-0">
        Procurement Payment Requests
      </h1>
      <Table
        isHeaderSticky
        removeWrapper={false}
        aria-label="Project procurement payment requests table with custom cells, pagination and sorting"
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
        // selectedKeys={selectedKeys}
        // selectionMode="multiple"
        sortDescriptor={sortDescriptor}
        topContent={topContent}
        topContentPlacement="outside"
        // onSelectionChange={setSelectedKeys}
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
    </div>
  );
};

export default ProjectPR;
