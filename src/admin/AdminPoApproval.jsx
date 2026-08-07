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
  Pagination,
  useDisclosure,
  Modal,
  ModalBody,
  ModalFooter,
  ModalContent,
  ModalHeader,
  addToast,
  Chip,
  Textarea,
} from "@heroui/react";
import { Search } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import dayjs from "dayjs";
import { inrCurrency } from "../common";
import {
  approveAdminPOApproval,
  rejectAdminPOApproval,
  getAllPOByStatus,
} from "../toolkit/slices/operationSlice";

export const columns = [
  { name: "PO NUMBER", uid: "poNumber" },
  { name: "PROJECT", uid: "project" },
  { name: "VENDOR", uid: "vendor" },
  { name: "AMOUNT", uid: "amount" },
  { name: "STATUS", uid: "status" },
  { name: "CREATED DATE", uid: "createdDate" },
  { name: "ACTIONS", uid: "actions" },
];

// TODO: replace with real logged-in admin user id from auth context/store
const CURRENT_ADMIN_USER_ID = 1;
const FIXED_STATUS = "ADMIN_APPROVAL_PENDING";

const AdminPoApproval = () => {
  const dispatch = useDispatch();
  const actionModal = useDisclosure();

  const poData = useSelector(
    (state) => state.operation.procurementOrderByStatus,
  );
  const loading = useSelector((state) => state.operation.loading);

  const content = poData?.content || [];
  const totalPages = poData?.totalPages || 1;
  const totalElements = poData?.totalElements || 0;

  const [filterValue, setFilterValue] = useState("");
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const [rowItem, setRowItem] = useState(null);
  const [actionType, setActionType] = useState(""); // "approve" | "reject"
  const [actionComment, setActionComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const hasSearchFilter = Boolean(filterValue);

  const fetchList = React.useCallback(() => {
    dispatch(
      getAllPOByStatus({
        page: page - 1,
        size: rowsPerPage,
        status: FIXED_STATUS,
      }),
    );
  }, [dispatch, page, rowsPerPage]);

  useEffect(() => {
    fetchList();
  }, [fetchList]);

  const filteredItems = React.useMemo(() => {
    let items = [...content];

    if (hasSearchFilter) {
      items = items.filter((item) =>
        Object.values(item)?.some((val) =>
          String(val)?.toLowerCase()?.includes(filterValue?.toLowerCase()),
        ),
      );
    }

    return items;
  }, [content, filterValue, hasSearchFilter]);

  const openActionModal = (type, row) => {
    setRowItem(row);
    setActionType(type);
    setActionComment("");
    actionModal.onOpen();
  };

  const handleSubmitAction = () => {
    if (!rowItem?.id) return;

    if (actionType === "reject" && !actionComment.trim()) {
      addToast({ title: "Rejection reason is required.", color: "danger" });
      return;
    }

    setSubmitting(true);

    const thunk =
      actionType === "approve"
        ? approveAdminPOApproval({
            poId: rowItem.id,
            adminUserId: CURRENT_ADMIN_USER_ID,
            comment: actionComment,
          })
        : rejectAdminPOApproval({
            poId: rowItem.id,
            adminUserId: CURRENT_ADMIN_USER_ID,
            reason: actionComment,
          });

    dispatch(thunk)
      .then((resp) => {
        if (resp.meta.requestStatus === "fulfilled") {
          addToast({
            title:
              actionType === "approve"
                ? "Purchase Order approved successfully."
                : "Purchase Order rejected successfully.",
            color: "success",
          });
          actionModal.onClose();
          setRowItem(null);
          setActionType("");
          setActionComment("");
          fetchList();
        } else {
          addToast({
            title: resp.payload?.message || "Something went wrong.",
            color: "danger",
          });
        }
      })
      .catch(() =>
        addToast({ title: "Something went wrong.", color: "danger" }),
      )
      .finally(() => setSubmitting(false));
  };

  const renderCell = React.useCallback((rowData, columnKey) => {
    switch (columnKey) {
      case "poNumber":
        return (
          <div className="flex flex-col">
            <p className="text-sm font-medium">{rowData?.poNumber}</p>
            <p className="text-xs text-default-400">
              Ref: {rowData?.poReferenceNumber || "-"}
            </p>
          </div>
        );
      case "project":
        return (
          <div className="flex flex-col">
            <p className="text-sm">{rowData?.projectName}</p>
            <p className="text-xs text-default-400">{rowData?.projectNo}</p>
          </div>
        );
      case "vendor":
        return <p className="text-sm">{rowData?.vendorName}</p>;
      case "amount":
        return (
          <div className="flex flex-col">
            <p className="text-sm">
              Final: {inrCurrency(rowData?.finalAmount)}
            </p>
            <p className="text-sm font-medium">
              Grand Total: {inrCurrency(rowData?.grandTotal)}
            </p>
          </div>
        );
      case "status":
        return (
          <Chip className="text-xs capitalize" size="sm" color="warning">
            {rowData?.status?.replaceAll("_", " ")}
          </Chip>
        );
      case "createdDate":
        return (
          <p className="text-sm">
            {rowData?.poCreatedDate
              ? dayjs(rowData.poCreatedDate).format("DD-MM-YYYY")
              : "-"}
          </p>
        );
      case "actions":
        return (
          <div className="flex justify-center items-center gap-2">
            <Button
              size="sm"
              color="success"
              variant="flat"
              onPress={() => openActionModal("approve", rowData)}
            >
              Approve
            </Button>
            <Button
              size="sm"
              color="danger"
              variant="flat"
              onPress={() => openActionModal("reject", rowData)}
            >
              Reject
            </Button>
          </div>
        );
      default:
        return rowData[columnKey];
    }
  }, []);

  const onNextPage = React.useCallback(() => {
    if (page < totalPages) setPage(page + 1);
  }, [page, totalPages]);

  const onPreviousPage = React.useCallback(() => {
    if (page > 1) setPage(page - 1);
  }, [page]);

  const onRowsPerPageChange = React.useCallback((e) => {
    setRowsPerPage(Number(e.target.value));
    setPage(1);
  }, []);

  const onSearchChange = React.useCallback((value) => {
    setFilterValue(value || "");
  }, []);

  const onClear = React.useCallback(() => {
    setFilterValue("");
  }, []);

  const topContent = React.useMemo(() => {
    return (
      <div className="flex flex-col gap-2">
        <div className="flex justify-between gap-2 items-center flex-wrap">
          <Input
            isClearable
            size="sm"
            className="w-full sm:max-w-[280px]"
            classNames={{ inputWrapper: "h-8 min-h-8" }}
            placeholder="Search purchase orders..."
            startContent={<Search className="w-4 h-4 text-default-400" />}
            value={filterValue}
            onClear={onClear}
            onValueChange={onSearchChange}
          />
        </div>

        <div className="flex justify-between items-center">
          <span className="text-default-400 text-[12.5px]">
            Total {totalElements} purchase order(s) pending admin approval
          </span>

          <label className="flex items-center gap-1 text-default-400 text-[12.5px]">
            Rows per page:
            <select
              className="bg-transparent outline-hidden text-default-400 text-[12.5px] cursor-pointer"
              onChange={onRowsPerPageChange}
              value={rowsPerPage}
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
    onRowsPerPageChange,
    totalElements,
    onSearchChange,
    rowsPerPage,
  ]);

  const bottomContent = React.useMemo(() => {
    return (
      <div className="py-1.5 px-1 flex justify-between items-center">
        <span className="w-[30%] text-[12.5px] text-default-400">
          Page {page} of {totalPages}
        </span>
        <Pagination
          isCompact
          showControls
          color="primary"
          page={page}
          total={totalPages}
          onChange={setPage}
        />
        <div className="hidden sm:flex w-[30%] justify-end gap-2">
          <Button
            isDisabled={totalPages === 1}
            size="sm"
            variant="flat"
            onPress={onPreviousPage}
          >
            Previous
          </Button>
          <Button
            isDisabled={totalPages === 1}
            size="sm"
            variant="flat"
            onPress={onNextPage}
          >
            Next
          </Button>
        </div>
      </div>
    );
  }, [page, totalPages, onPreviousPage, onNextPage]);

  return (
    <div className="flex flex-col gap-2">
      <h1 className="font-sans text-lg font-semibold mb-2 shrink-0">
        Purchase Orders Pending Admin Approval
      </h1>
      <Table
        isHeaderSticky
        removeWrapper={false}
        aria-label="Purchase orders pending admin approval"
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
        topContent={topContent}
        topContentPlacement="outside"
      >
        <TableHeader columns={columns}>
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
          emptyContent={"No purchase orders pending admin approval"}
          items={filteredItems}
          isLoading={loading === "pending"}
        >
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
        isOpen={actionModal.isOpen}
        onOpenChange={actionModal.onOpenChange}
        size="lg"
        placement="top-center"
        backdrop="blur"
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                {actionType === "approve"
                  ? "Approve Purchase Order"
                  : "Reject Purchase Order"}
              </ModalHeader>
              <ModalBody>
                <div className="flex flex-col gap-1 text-sm">
                  <p>
                    <span className="text-default-400">PO Number: </span>
                    {rowItem?.poNumber}
                  </p>
                  <p>
                    <span className="text-default-400">Project: </span>
                    {rowItem?.projectName}
                  </p>
                  <p>
                    <span className="text-default-400">Vendor: </span>
                    {rowItem?.vendorName}
                  </p>
                  <p>
                    <span className="text-default-400">Grand Total: </span>
                    {inrCurrency(rowItem?.grandTotal)}
                  </p>
                </div>
                <Textarea
                  label={
                    actionType === "approve"
                      ? "Comment (optional)"
                      : "Rejection reason (required)"
                  }
                  isRequired={actionType === "reject"}
                  value={actionComment}
                  onChange={(e) => setActionComment(e.target.value)}
                />
              </ModalBody>
              <ModalFooter>
                <Button color="default" variant="light" onPress={onClose}>
                  Cancel
                </Button>
                <Button
                  color={actionType === "approve" ? "success" : "danger"}
                  onPress={handleSubmitAction}
                  isLoading={submitting}
                >
                  {actionType === "approve" ? "Approve" : "Reject"}
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
};

export default AdminPoApproval;
