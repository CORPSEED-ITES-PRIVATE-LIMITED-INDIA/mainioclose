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
  useDisclosure,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  addToast,
  Form,
} from "@heroui/react";
import { ChevronDown, EllipsisVertical, Search } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import {
  approveProcurementPurchaseOrder,
  getProcurementPurchaseOrder,
  releaseProcurementPaymentRequestAccounts,
} from "../../toolkit/slices/accountSlice";

const columns = [
  { name: "PO NUMBER", uid: "poNumber", sortable: true },
  { name: "REFERENCE NO.", uid: "poReferenceNumber", sortable: true },
  { name: "PROJECT", uid: "projectName", sortable: true },
  { name: "VENDOR", uid: "vendorName", sortable: true },
  { name: "FINAL AMOUNT", uid: "finalAmount", sortable: true },
  { name: "GRAND TOTAL", uid: "grandTotal", sortable: true },
  { name: "PAYMENT", uid: "payment" },
  { name: "TAX", uid: "tax" },
  { name: "STATUS", uid: "status", sortable: true },
  { name: "CREATED DATE", uid: "createdDate", sortable: true },
  { name: "ATTACHMENTS", uid: "attachmentUrls" },
  { name: "ACTIONS", uid: "actions" },
];

function capitalize(s) {
  return s ? s.charAt(0).toUpperCase() + s.slice(1).toLowerCase() : "";
}

const INITIAL_VISIBLE_COLUMNS = [
  "poNumber",
  "projectName",
  "vendorName",
  "grandTotal",
  "payment",
  "status",
  "createdDate",
  "actions",
];

const formatAmount = (value) => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(Number(value || 0));
};

const formatDateTime = (value) => {
  if (!value) return "-";

  return new Date(value).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

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
      return "primary";
    default:
      return "default";
  }
};

const ProjectPurchaseOrder = () => {
  const { userId } = useParams();
  const dispatch = useDispatch();
  const approveModal = useDisclosure();
  const rejectModal = useDisclosure();
  const releasePaymentModal = useDisclosure();

  const count = useSelector(
    (state) => state.account.procurementPurchaseOrderList?.totalElements || 0,
  );

  const data = useSelector(
    (state) => state.account.procurementPurchaseOrderList?.content || [],
  );

  const [filterValue, setFilterValue] = useState("");
  const [selectedKeys, setSelectedKeys] = useState(new Set([]));
  const [visibleColumns, setVisibleColumns] = useState(
    new Set(INITIAL_VISIBLE_COLUMNS),
  );

  const [sortDescriptor, setSortDescriptor] = useState({
    column: "createdDate",
    direction: "descending",
  });

  const [filteration, setFilteration] = useState({
    userId: userId,
    page: 1,
    size: 50,
    status: "PENDING_APPROVAL",
  });

  const hasSearchFilter = Boolean(filterValue);
  const [rowItem, setRowItem] = useState(null);

  useEffect(() => {
    dispatch(getProcurementPurchaseOrder(filteration));
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
      const searchValue = filterValue.toLowerCase();

      filteredUsers = filteredUsers.filter((item) => {
        return (
          item?.poNumber?.toLowerCase().includes(searchValue) ||
          item?.poReferenceNumber?.toLowerCase().includes(searchValue) ||
          item?.projectName?.toLowerCase().includes(searchValue) ||
          item?.vendorName?.toLowerCase().includes(searchValue) ||
          item?.paymentTypeName?.toLowerCase().includes(searchValue) ||
          item?.status?.toLowerCase().includes(searchValue)
        );
      });
    }

    return filteredUsers;
  }, [data, filterValue, hasSearchFilter]);

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
    } else if (key === "ReleasePayment") {
      releasePaymentModal.onOpen();
    }
  };

  const handleReleasePaymentRequest = (values) => {
    const paymentRequestId = rowItem?.paymentRequestId || rowItem?.id;

    const payload = {
      comment: values.comment || "",
      reason: values.reason || "",
      invoiceNumber: values.invoiceNumber || "",
      invoiceDate: values.invoiceDate
        ? new Date(values.invoiceDate).toISOString()
        : null,
    };

    dispatch(
      releaseProcurementPaymentRequestAccounts({
        paymentRequestId,
        userId,
        data: payload,
      }),
    )
      .then((resp) => {
        if (resp.meta.requestStatus === "fulfilled") {
          addToast({
            title: "SUCCESS",
            description: "Payment released successfully !.",
            color: "success",
          });

          releasePaymentModal.onClose();
          setRowItem(null);
          dispatch(getProcurementPurchaseOrder(filteration));
        } else {
          addToast({
            title: "Error",
            description:
              resp?.payload?.message || resp?.payload || "Something went wrong",
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
      case "poNumber":
        return (
          <div className="flex flex-col">
            <span className="font-medium">{rowData?.poNumber || "-"}</span>
            <span className="text-xs text-default-400">
              ID: {rowData?.id || "-"}
            </span>
          </div>
        );

      case "poReferenceNumber":
        return (
          <div className="flex flex-col">
            <span className="font-normal">
              {rowData?.poReferenceNumber || "-"}
            </span>
            <span className="text-xs text-default-400">
              Assignment ID: {rowData?.procurementAssignmentId || "-"}
            </span>
          </div>
        );

      case "projectName":
        return (
          <div className="flex flex-col">
            <span className="font-normal capitalize">
              {rowData?.projectName || "-"}
            </span>
            <span className="text-xs text-default-400">
              Project ID: {rowData?.projectId || "-"}
            </span>
          </div>
        );

      case "vendorName":
        return (
          <div className="flex flex-col">
            <span className="font-normal capitalize">
              {rowData?.vendorName || "-"}
            </span>
            <span className="text-xs text-default-400">
              Vendor ID: {rowData?.vendorId || "-"}
            </span>

            {rowData?.vendorContactName && (
              <span className="text-xs text-default-400">
                Contact: {rowData.vendorContactName}
              </span>
            )}
          </div>
        );

      case "finalAmount":
        return (
          <div className="flex flex-col">
            <span className="font-medium">
              {formatAmount(rowData?.finalAmount)}
            </span>
            <span className="text-xs text-default-400">
              Estimated: {formatAmount(rowData?.estimatedAmount)}
            </span>
          </div>
        );

      case "grandTotal":
        return (
          <div className="flex flex-col">
            <span className="font-semibold text-success">
              {formatAmount(rowData?.grandTotal)}
            </span>
            <span className="text-xs text-default-400">
              Tax: {formatAmount(rowData?.totalTaxAmount)}
            </span>
          </div>
        );

      case "payment":
        return (
          <div className="flex flex-col">
            <span className="font-normal">
              {rowData?.paymentTypeName || "-"}
            </span>
            <span className="text-xs text-default-400">
              {rowData?.paymentTerms || "-"}
            </span>
          </div>
        );

      case "tax":
        return (
          <div className="flex flex-col">
            <span className="font-normal">GST: {rowData?.gstRate || 0}%</span>

            {Number(rowData?.igstAmount || 0) > 0 ? (
              <span className="text-xs text-default-400">
                IGST: {formatAmount(rowData?.igstAmount)}
              </span>
            ) : (
              <span className="text-xs text-default-400">
                CGST: {formatAmount(rowData?.cgstAmount)} | SGST:{" "}
                {formatAmount(rowData?.sgstAmount)}
              </span>
            )}
          </div>
        );

      case "status":
        return (
          <Chip
            size="sm"
            variant="flat"
            color={getStatusColor(rowData?.status)}
            className="capitalize"
          >
            {rowData?.status || "-"}
          </Chip>
        );

      case "createdDate":
        return (
          <div className="flex flex-col">
            <span className="font-normal">
              {formatDateTime(rowData?.createdDate)}
            </span>
            <span className="text-xs text-default-400">
              PO Created: {formatDateTime(rowData?.poCreatedDate)}
            </span>
          </div>
        );

      case "attachmentUrls":
        return Array.isArray(rowData?.attachmentUrls) &&
          rowData.attachmentUrls.length > 0 ? (
          <div className="flex flex-col gap-1">
            <Chip size="sm" variant="flat" color="primary">
              {rowData.attachmentUrls.length} File
              {rowData.attachmentUrls.length > 1 ? "s" : ""}
            </Chip>

            <Button
              size="sm"
              variant="light"
              color="primary"
              onPress={() => {
                window.open(
                  rowData.attachmentUrls[0],
                  "_blank",
                  "noopener,noreferrer",
                );
              }}
            >
              View
            </Button>
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
                isDisabled={rowData?.status !== "PENDING_APPROVAL"}
                onPress={() => handleActionPress(rowData, "Approved")}
              >
                Approved
              </DropdownItem>

              <DropdownItem
                isDisabled={rowData?.status !== "PENDING_APPROVAL"}
                onPress={() => handleActionPress(rowData, "Rejected")}
              >
                Rejected
              </DropdownItem>

              <DropdownItem
                onPress={() => handleActionPress(rowData, "ReleasePayment")}
              >
                Release Payment
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
            placeholder="Search by PO, project, vendor..."
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
                aria-label="Status Filter"
                selectionMode="single"
                selectedKeys={[filteration.status]}
                onSelectionChange={(selectedKeys) => {
                  const selected = Array.from(selectedKeys)[0];

                  setFilteration((prev) => ({
                    ...prev,
                    page: 1,
                    status: selected,
                  }));
                }}
              >
                {[
                  { label: "DRAFT", uid: "DRAFT" },
                  { label: "PENDING_APPROVAL", uid: "PENDING_APPROVAL" },
                  { label: "APPROVED", uid: "APPROVED" },
                  { label: "REJECTED", uid: "REJECTED" },
                ].map((status) => (
                  <DropdownItem key={status.uid}>{status.label}</DropdownItem>
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
            Total {count} purchase orders
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
    onSearchChange,
    filteration?.status,
    count,
    onClear,
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
          onChange={(page) => {
            setFilteration((prev) => ({ ...prev, page }));
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
  }, [
    selectedKeys,
    count,
    filteration?.page,
    pages,
    onPreviousPage,
    onNextPage,
  ]);

  return (
    <>
      <h1 className="font-sans text-2xl font-medium mb-1">
        Procurement Purchase Orders
      </h1>

      <Table
        isHeaderSticky
        aria-label="Procurement purchase order table"
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
            <TableRow key={item.id}>
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
        isOpen={releasePaymentModal.isOpen}
        onOpenChange={releasePaymentModal.onOpenChange}
      >
        <ModalContent>
          {(onClose) => (
            <Form
              className="w-full"
              onSubmit={(e) => {
                e.preventDefault();

                let data = Object.fromEntries(new FormData(e.currentTarget));

                handleReleasePaymentRequest(data);
              }}
            >
              <ModalHeader>Release Payment</ModalHeader>

              <ModalBody className="grid md:grid-cols-1 gap-4 w-full">
                <Input
                  label="Comment"
                  name="comment"
                  isRequired
                  errorMessage="please enter a comment"
                />

                <Input
                  label="Reason"
                  name="reason"
                  isRequired
                  errorMessage="please enter a reason"
                />

                <Input
                  label="Invoice Number"
                  name="invoiceNumber"
                  isRequired
                  errorMessage="please enter invoice number"
                />

                <Input
                  label="Invoice Date"
                  name="invoiceDate"
                  type="datetime-local"
                  isRequired
                  errorMessage="please select invoice date"
                />
              </ModalBody>

              <ModalFooter className="flex justify-end gap-2 w-full">
                <Button
                  onPress={() => {
                    setRowItem(null);
                    onClose();
                  }}
                >
                  Close
                </Button>

                <Button color="primary" type="submit">
                  Release Payment
                </Button>
              </ModalFooter>
            </Form>
          )}
        </ModalContent>
      </Modal>
    </>
  );
};

export default ProjectPurchaseOrder;
