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
  Select,
  SelectItem,
  addToast,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@heroui/react";
import { ChevronDown, EllipsisVertical, Search } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import dayjs from "dayjs";
import { inrCurrency } from "../common";
import {
  getAllCreditNotes,
  approveCreditNote,
  rejectCreditNote,
  accountApproveCreditNote,
} from "../toolkit/slices/accountSlice";
import PreviewComponent from "../components/PreviewComponent.jsx";
import FileUploader from "../components/FileUploader.jsx";

export const columns = [
  { name: "DATE", uid: "date", sortable: true },
  { name: "CREDIT NOTE NO.", uid: "creditNoteNumber", sortable: true },
  { name: "UNBILLED NO.", uid: "unbilledNumber" },
  { name: "ESTIMATE NO.", uid: "estimateNumber" },
  { name: "COMPANY", uid: "companyName" },
  { name: "CONTACT", uid: "contactName" },
  { name: "TOTAL AMOUNT", uid: "totalAmount", sortable: true },
  { name: "RECEIVED", uid: "receivedAmount", sortable: true },
  { name: "OUTSTANDING", uid: "outstandingAmount", sortable: true },
  { name: "REFUND", uid: "refundAmount", sortable: true },
  { name: "CREDIT", uid: "creditAmount", sortable: true },
  { name: "STATUS", uid: "status" },
  { name: "REASON", uid: "reason" },
  { name: "ACTIONS", uid: "actions" },
];

export function capitalize(s) {
  return s ? s.charAt(0)?.toUpperCase() + s.slice(1)?.toLowerCase() : "";
}

const INITIAL_VISIBLE_COLUMNS = [
  "date",
  "creditNoteNumber",
  "unbilledNumber",
  "estimateNumber",
  "companyName",
  "totalAmount",
  "receivedAmount",
  "outstandingAmount",
  "refundAmount",
  "creditAmount",
  "status",
  "actions",
];

const CreditNote = () => {
  const dispatch = useDispatch();
  const { userId } = useParams();

  const data = useSelector((state) => state.account.creditNoteList?.content);
  const userRole = useSelector((state) => state.auth.currentUser?.roles);
  const adminRole = userRole.includes("ADMIN");
  const [filterValue, setFilterValue] = useState("");
  const [selectedKeys, setSelectedKeys] = useState(new Set([]));
  const [visibleColumns, setVisibleColumns] = useState(
    new Set(INITIAL_VISIBLE_COLUMNS),
  );
  const [rowsPerPage, setRowsPerPage] = useState(50);
  const [sortDescriptor, setSortDescriptor] = useState({
    column: "createdAt",
    direction: "descending",
  });
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState("PENDING");
  const [actionLoadingId, setActionLoadingId] = useState(null);

  const [rejectModal, setRejectModal] = useState({
    isOpen: false,
    rowData: null,
  });
  const [rejectionReason, setRejectionReason] = useState("");
  const [rejectionReasonError, setRejectionReasonError] = useState("");

  const [attachmentPreviewModal, setAttachmentPreviewModal] = useState({
    isOpen: false,
    file: null,
  });

  const [approveModal, setApproveModal] = useState({
    isOpen: false,
    rowData: null,
  });

  const [approvalRemarks, setApprovalRemarks] = useState("");
  const [approvalAttachment, setApprovalAttachment] = useState("");
  const [approvalAttachmentError, setApprovalAttachmentError] = useState("");

  const [searchFilters, setSearchFilters] = useState({
    searchText: "",
    type: "creditNoteNumber",
  });

  const hasSearchFilter = Boolean(filterValue);

  const fetchCreditNotes = React.useCallback(() => {
    dispatch(getAllCreditNotes({ status, page, size: rowsPerPage }));
  }, [dispatch, status, page, rowsPerPage]);

  useEffect(() => {
    fetchCreditNotes();
  }, [fetchCreditNotes]);

  const headerColumns = React.useMemo(() => {
    if (visibleColumns === "all") return columns;

    return columns.filter((column) =>
      Array.from(visibleColumns).includes(column.uid),
    );
  }, [visibleColumns]);

  const filteredItems = React.useMemo(() => {
    let filteredCreditNotes = [...(data || [])];

    if (hasSearchFilter) {
      filteredCreditNotes = filteredCreditNotes.filter((item) => {
        const searchText = filterValue.toLowerCase();

        if (searchFilters.type && item?.[searchFilters.type] !== undefined) {
          return String(item?.[searchFilters.type])
            ?.toLowerCase()
            ?.includes(searchText);
        }

        return Object.values(item || {}).some((val) =>
          String(val)?.toLowerCase()?.includes(searchText),
        );
      });
    }

    return filteredCreditNotes;
  }, [data, filterValue, hasSearchFilter, searchFilters.type]);

  const pages = Math.ceil(filteredItems.length / rowsPerPage) || 1;

  const sortedItems = React.useMemo(() => {
    return [...filteredItems].sort((a, b) => {
      const first = a?.[sortDescriptor.column];
      const second = b?.[sortDescriptor.column];

      if (first === undefined || first === null) return 1;
      if (second === undefined || second === null) return -1;

      const cmp = first < second ? -1 : first > second ? 1 : 0;

      return sortDescriptor.direction === "descending" ? -cmp : cmp;
    });
  }, [sortDescriptor, filteredItems]);

  const paginatedItems = React.useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    const end = start + rowsPerPage;

    return sortedItems.slice(start, end);
  }, [page, sortedItems, rowsPerPage]);

  const getStatusClass = React.useCallback((value) => {
    const statusValue = String(value || "").toUpperCase();

    switch (statusValue) {
      case "APPROVED":
        return "bg-green-100 text-green-700";
      case "REJECTED":
        return "bg-red-100 text-red-700";
      case "CANCELLED":
        return "bg-gray-100 text-gray-700";
      case "PENDING":
      default:
        return "bg-yellow-100 text-yellow-700";
    }
  }, []);

  const closeRejectModal = React.useCallback(() => {
    setRejectModal({
      isOpen: false,
      rowData: null,
    });
    setRejectionReason("");
    setRejectionReasonError("");
  }, []);

  const handleApproveCreditNote = React.useCallback(
    async (rowData) => {
      const creditNoteId = rowData?.id;

      if (!creditNoteId || !userId) {
        addToast({
          title: "Missing required data",
          description: "Credit Note ID or User ID is missing.",
          color: "danger",
        });
        return;
      }

      try {
        setActionLoadingId(creditNoteId);

        const resp = adminRole
          ? await dispatch(
              approveCreditNote({
                creditNoteId,
                userId,
                proposalId: rowData?.proposalId,
              }),
            )
          : await dispatch(
              accountApproveCreditNote({
                creditNoteId,
                userId,
                approvalRemarks,
                gstPortalAttachment: approvalAttachment,
              }),
            );

        if (resp?.meta?.requestStatus === "fulfilled") {
          fetchCreditNotes();

          addToast({
            title: "Success",
            description: adminRole
              ? "Credit note approved successfully."
              : "Credit note account approved successfully.",
            color: "success",
          });
        } else {
          addToast({
            title: "Something went wrong",
            description:
              resp?.payload?.message || "Credit note approval failed.",
            color: "danger",
          });
        }
      } catch (error) {
        addToast({
          title: "Something went wrong",
          description: error?.message || "Credit note approval failed.",
          color: "danger",
        });
      } finally {
        setActionLoadingId(null);
      }
    },
    [dispatch, userId, fetchCreditNotes, adminRole],
  );

  const openRejectModal = React.useCallback(
    (rowData) => {
      const creditNoteId = rowData?.id;

      if (!creditNoteId || !userId) {
        addToast({
          title: "Missing required data",
          description: "Credit Note ID or User ID is missing.",
          color: "danger",
        });
        return;
      }

      setRejectModal({
        isOpen: true,
        rowData,
      });
      setRejectionReason("");
      setRejectionReasonError("");
    },
    [userId],
  );

  const handleSubmitRejectCreditNote = React.useCallback(
    async (e) => {
      e?.preventDefault?.();

      const rowData = rejectModal?.rowData;
      const creditNoteId = rowData?.id;
      const reason = rejectionReason.trim();

      if (!reason) {
        setRejectionReasonError("Please enter rejection reason.");
        return;
      }

      if (!creditNoteId || !userId) {
        addToast({
          title: "Missing required data",
          description: "Credit Note ID or User ID is missing.",
          color: "danger",
        });
        return;
      }

      try {
        setActionLoadingId(creditNoteId);

        const resp = await dispatch(
          rejectCreditNote({
            creditNoteId,
            userId,
            rejectionReason: reason,
          }),
        );

        if (resp?.meta?.requestStatus === "fulfilled") {
          fetchCreditNotes();
          closeRejectModal();

          addToast({
            title: "Success",
            description: "Credit note rejected successfully.",
            color: "success",
          });
        } else {
          addToast({
            title: "Something went wrong",
            description: "Credit note rejection failed.",
            color: "danger",
          });
        }
      } catch (error) {
        console.error("Reject credit note failed:", error);

        addToast({
          title: "Something went wrong",
          description: "Credit note rejection failed.",
          color: "danger",
        });
      } finally {
        setActionLoadingId(null);
      }
    },
    [
      dispatch,
      userId,
      rejectModal,
      rejectionReason,
      fetchCreditNotes,
      closeRejectModal,
    ],
  );

  const getCreditNoteAttachment = React.useCallback((rowData) => {
    const attachment =
      Array.isArray(rowData?.attachmentUrls) && rowData?.attachmentUrls?.length
        ? rowData.attachmentUrls[0]
        : rowData?.attachmentUrl ||
          rowData?.attachment ||
          rowData?.fileUrl ||
          rowData?.filePath ||
          null;

    if (!attachment) return null;

    if (typeof attachment === "string") {
      return {
        fileUrl: attachment,
        fileName: attachment.split("?")[0].split("/").pop() || "Attachment",
      };
    }

    return {
      ...attachment,
      fileUrl:
        attachment?.fileUrl ||
        attachment?.filePath ||
        attachment?.url ||
        attachment?.path ||
        "",
      fileName:
        attachment?.fileName ||
        attachment?.name ||
        attachment?.originalName ||
        "Attachment",
      contentType: attachment?.contentType || attachment?.mimeType || "",
      fileSize: attachment?.fileSize || attachment?.size || 0,
    };
  }, []);

  const handleAccountApproval = async (e) => {
    e?.preventDefault?.();

    const rowData = approveModal?.rowData;
    const creditNoteId = rowData?.id;

    if (!creditNoteId || !userId) {
      addToast({
        title: "Missing required data",
        description: "Credit Note ID or User ID is missing.",
        color: "danger",
      });
      return;
    }

    if (!String(approvalAttachment || "").trim()) {
      setApprovalAttachmentError("Attachment is required.");
      return;
    }

    try {
      setActionLoadingId(creditNoteId);

      const resp = await dispatch(
        accountApproveCreditNote({
          creditNoteId,
          userId,
          approvalRemarks:
            approvalRemarks?.trim() || "Approved by account user",
          gstPortalAttachment: approvalAttachment,
        }),
      );

      if (resp?.meta?.requestStatus === "fulfilled") {
        fetchCreditNotes();

        addToast({
          title: "Success",
          description: "Credit note account approved successfully.",
          color: "success",
        });

        setApproveModal({
          isOpen: false,
          rowData: null,
        });

        setApprovalRemarks("");
        setApprovalAttachment("");
        setApprovalAttachmentError("");
      } else {
        addToast({
          title: "Approval failed",
          description:
            resp?.payload?.message ||
            resp?.payload ||
            "Credit note account approval failed.",
          color: "danger",
        });
      }
    } catch (error) {
      addToast({
        title: "Something went wrong",
        description: error?.message || "Credit note account approval failed.",
        color: "danger",
      });
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleActionsClick = React.useCallback(
    (key, rowData) => {
      const actionKey = String(key);

      if (actionKey === "viewCreditNote") {
        console.log("View Credit Note:", rowData);
        return;
      }

      if (actionKey === "viewAttachment") {
        const attachment = getCreditNoteAttachment(rowData);

        if (!attachment?.fileUrl) {
          addToast({
            title: "Attachment not found",
            description: "No attachment is available for this credit note.",
            color: "warning",
          });
          return;
        }

        setAttachmentPreviewModal({
          isOpen: true,
          file: attachment,
        });
        return;
      }

      if (
        actionKey === "APPROVE" &&
        rowData?.status === "PENDING_ACCOUNT_REVIEW"
      ) {
        setApproveModal({
          isOpen: true,
          rowData,
        });
        return;
      }

      if (actionKey === "APPROVE") {
        handleApproveCreditNote(rowData);
        return;
      }

      if (actionKey === "REJECT") {
        openRejectModal(rowData);
      }
    },
    [handleApproveCreditNote, openRejectModal, getCreditNoteAttachment],
  );

  const renderCell = React.useCallback(
    (rowData, columnKey) => {
      const cellValue = rowData[columnKey];

      switch (columnKey) {
        case "date":
          return (
            <p className="text-sm">
              {rowData?.createdAt
                ? dayjs(rowData.createdAt).format("DD-MM-YYYY")
                : "-"}
            </p>
          );

        case "creditNoteNumber":
          return (
            <div className="flex flex-col gap-1">
              <p className="text-sm font-medium">
                {rowData?.creditNoteNumber || "-"}
              </p>
              <p className="text-tiny text-default-400">ID: {rowData?.id}</p>
            </div>
          );

        case "unbilledNumber":
          return (
            <div className="flex flex-col gap-1">
              <p className="text-sm">{rowData?.unbilledNumber || "-"}</p>
              <p className="text-tiny text-default-400">
                Unbilled ID: {rowData?.unbilledId || "-"}
              </p>
            </div>
          );

        case "estimateNumber":
          return (
            <div className="flex flex-col gap-1">
              <p className="text-sm">{rowData?.estimateNumber || "-"}</p>
              <p className="text-tiny text-default-400">
                Estimate ID: {rowData?.estimateId || "-"}
              </p>
            </div>
          );

        case "companyName":
          return (
            <div className="flex flex-col gap-1">
              <p className="text-sm font-medium capitalize">
                {rowData?.companyName || "-"}
              </p>
              <p className="text-tiny text-default-400">
                Company ID: {rowData?.companyId || "-"}
              </p>
            </div>
          );

        case "contactName":
          return (
            <div className="flex flex-col gap-1">
              <p className="text-sm capitalize">
                {rowData?.contactName || "-"}
              </p>
              <p className="text-tiny text-default-400">
                Contact ID: {rowData?.contactId || "-"}
              </p>
            </div>
          );

        case "totalAmount":
          return (
            <p className="text-sm">{inrCurrency(rowData?.totalAmount || 0)}</p>
          );

        case "receivedAmount":
          return (
            <div className="flex flex-col gap-1">
              <p className="text-sm">
                {inrCurrency(rowData?.receivedAmount || 0)}
              </p>
              <p className="text-tiny text-default-400">
                Current: {inrCurrency(rowData?.currentReceivedAmount || 0)}
              </p>
            </div>
          );

        case "outstandingAmount":
          return (
            <p className="text-sm font-medium">
              {inrCurrency(rowData?.outstandingAmount || 0)}
            </p>
          );

        case "refundAmount":
          return (
            <p className="text-sm font-medium">
              {inrCurrency(rowData?.refundAmount || 0)}
            </p>
          );

        case "creditAmount":
          return (
            <p className="text-sm font-medium">
              {inrCurrency(rowData?.creditAmount || 0)}
            </p>
          );

        case "status":
          return (
            <span
              className={`rounded-full px-3 py-1 text-xs font-medium ${getStatusClass(
                rowData?.status,
              )}`}
            >
              {rowData?.status || "-"}
            </span>
          );

        case "reason":
          return (
            <p className="max-w-[220px] truncate text-sm">
              {rowData?.rejectionReason || rowData?.reason || "-"}
            </p>
          );

        case "actions":
          return (
            <div className="relative flex items-center justify-center gap-2">
              <Dropdown>
                <DropdownTrigger>
                  <Button
                    isIconOnly
                    size="sm"
                    variant="light"
                    isDisabled={actionLoadingId === rowData?.id}
                  >
                    <EllipsisVertical className="text-default-300" />
                  </Button>
                </DropdownTrigger>

                <DropdownMenu
                  aria-label="Credit note actions"
                  onAction={(key) => handleActionsClick(key, rowData)}
                >
                  <DropdownItem key="viewCreditNote">
                    View Credit Note
                  </DropdownItem>

                  <DropdownItem key="viewAttachment">
                    View Attachment
                  </DropdownItem>

                  {rowData?.status === "PENDING" ? (
                    <DropdownItem
                      key="APPROVE"
                      color="success"
                      className="text-success"
                    >
                      Approve
                    </DropdownItem>
                  ) : null}

                  {rowData?.status === "PENDING" ? (
                    <DropdownItem
                      key="REJECT"
                      color="danger"
                      className="text-danger"
                    >
                      Reject
                    </DropdownItem>
                  ) : null}
                  {rowData?.status === "PENDING_ACCOUNT_REVIEW" ? (
                    <DropdownItem
                      key="APPROVE"
                      color="success"
                      className="text-success"
                    >
                      Approve
                    </DropdownItem>
                  ) : null}

                  {rowData?.status === "PENDING_ACCOUNT_REVIEW" ? (
                    <DropdownItem
                      key="REJECT"
                      color="danger"
                      className="text-danger"
                    >
                      Reject
                    </DropdownItem>
                  ) : null}
                  {rowData?.status === "PENDING_ADMIN_APPROVAL" ? (
                    <DropdownItem
                      key="APPROVE"
                      color="success"
                      className="text-success"
                    >
                      Approve
                    </DropdownItem>
                  ) : null}

                  {rowData?.status === "PENDING_ADMIN_APPROVAL" ? (
                    <DropdownItem
                      key="REJECT"
                      color="danger"
                      className="text-danger"
                    >
                      Reject
                    </DropdownItem>
                  ) : null}
                </DropdownMenu>
              </Dropdown>
            </div>
          );

        default:
          return cellValue || "-";
      }
    },
    [actionLoadingId, getStatusClass, handleActionsClick],
  );

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
    setFilterValue(value || "");
    setPage(1);
  }, []);

  const onClear = React.useCallback(() => {
    setFilterValue("");
    setPage(1);
  }, []);

  const topContent = React.useMemo(() => {
    return (
      <div className="flex flex-col gap-4">
        <div className="flex items-end justify-between gap-3">
          <div className="flex w-full items-center pb-0.5">
            <Select
              className="max-w-[15%]"
              selectionMode="single"
              selectedKeys={[searchFilters?.type]}
              onSelectionChange={(e) => {
                const key = Array.from(e)[0];
                setSearchFilters((prev) => ({ ...prev, type: key }));
                setFilterValue("");
                setPage(1);
              }}
            >
              <SelectItem key="creditNoteNumber">Credit note number</SelectItem>
              <SelectItem key="companyName">Company name</SelectItem>
              <SelectItem key="unbilledNumber">Unbilled number</SelectItem>
              <SelectItem key="estimateNumber">Estimate number</SelectItem>
            </Select>

            <Input
              isClearable
              className="w-full sm:max-w-[35%]"
              placeholder="Search ..."
              startContent={<Search />}
              value={filterValue}
              onClear={onClear}
              onValueChange={onSearchChange}
            />
          </div>

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
                selectedKeys={[status]}
                selectionMode="single"
                variant="flat"
                onSelectionChange={(e) => {
                  const key = Array.from(e)[0];
                  setStatus(key);
                  setPage(1);
                }}
              >
                <DropdownItem key="PENDING">PENDING</DropdownItem>
                <DropdownItem key="APPROVED">APPROVED</DropdownItem>
                <DropdownItem key="REJECTED">REJECTED</DropdownItem>
                <DropdownItem key="CANCELLED">CANCELLED</DropdownItem>
                <DropdownItem key="PENDING_ACCOUNT_REVIEW">
                  PENDING_ACCOUNT_REVIEW
                </DropdownItem>
                <DropdownItem key="PENDING_ADMIN_APPROVAL">
                  PENDING_ADMIN_APPROVAL
                </DropdownItem>
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

        <div className="flex items-center justify-between">
          <span className="text-small text-default-400">
            Total {filteredItems.length} Credit Notes
          </span>

          <label className="flex items-center text-small text-default-400">
            Rows per page:
            <select
              className="bg-transparent text-small text-default-400 outline-hidden"
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
    status,
    searchFilters,
    filteredItems.length,
    onClear,
    onSearchChange,
  ]);

  const bottomContent = React.useMemo(() => {
    return (
      <div className="flex items-center justify-between px-2 py-2">
        <span className="w-[30%] text-small text-default-400">
          {selectedKeys === "all"
            ? "All items selected"
            : `${selectedKeys.size} of ${filteredItems.length} selected`}
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

        <div className="hidden w-[30%] justify-end gap-2 sm:flex">
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
    filteredItems.length,
    page,
    pages,
    onPreviousPage,
    onNextPage,
  ]);

  return (
    <>
      <h1 className="mb-1 font-sans text-2xl font-medium">Credit Note</h1>

      <Table
        isHeaderSticky
        aria-label="Credit note table"
        bottomContent={bottomContent}
        bottomContentPlacement="outside"
        classNames={{
          wrapper: "2xl:max-h-[65vh] md:max-h-[60vh] w-full",
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

        <TableBody emptyContent="No data found" items={paginatedItems}>
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
        isDismissable={false}
        isKeyboardDismissDisabled={true}
        isOpen={rejectModal.isOpen}
        onOpenChange={(open) => {
          if (!open) closeRejectModal();
        }}
        placement="top-center"
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader>Reject Credit Note</ModalHeader>

              <form onSubmit={handleSubmitRejectCreditNote}>
                <ModalBody>
                  <Input
                    label="Rejection Reason"
                    placeholder="Enter rejection reason"
                    value={rejectionReason}
                    onValueChange={(value) => {
                      setRejectionReason(value);
                      if (value?.trim()) {
                        setRejectionReasonError("");
                      }
                    }}
                    isInvalid={Boolean(rejectionReasonError)}
                    errorMessage={rejectionReasonError}
                    isRequired
                  />
                </ModalBody>

                <ModalFooter>
                  <Button
                    variant="flat"
                    onPress={() => {
                      closeRejectModal();
                      onClose();
                    }}
                    isDisabled={actionLoadingId === rejectModal?.rowData?.id}
                  >
                    Cancel
                  </Button>

                  <Button
                    color="danger"
                    type="submit"
                    isLoading={actionLoadingId === rejectModal?.rowData?.id}
                  >
                    Submit Reject
                  </Button>
                </ModalFooter>
              </form>
            </>
          )}
        </ModalContent>
      </Modal>

      <PreviewComponent
        isOpen={attachmentPreviewModal.isOpen}
        onOpenChange={(open) => {
          if (!open) {
            setAttachmentPreviewModal({
              isOpen: false,
              file: null,
            });
          }
        }}
        file={attachmentPreviewModal.file}
        title="Credit Note Attachment"
        modalSize="full"
        showDetailsPanelDefault={false}
      />
      <Modal
        isOpen={approveModal.isOpen}
        onOpenChange={(open) => {
          if (!open) {
            setApproveModal({
              isOpen: false,
              rowData: null,
            });
            setApprovalRemarks("");
            setApprovalAttachment("");
            setApprovalAttachmentError("");
          }
        }}
      >
        <ModalContent>
          <ModalHeader>Approve Credit Note</ModalHeader>

          <form onSubmit={handleAccountApproval}>
            <ModalBody>
              <Input
                label="Approval Remarks"
                value={approvalRemarks}
                onValueChange={setApprovalRemarks}
              />

              <FileUploader
                label="Attachment"
                value={approvalAttachment}
                isRequired
                errorMessage={approvalAttachmentError}
                onChange={(url) => {
                  setApprovalAttachment(url);
                  setApprovalAttachmentError("");
                }}
                onUploadSuccess={(file) => {
                  setApprovalAttachment(file?.filePath || "");
                  setApprovalAttachmentError("");
                }}
              />

              {approvalAttachmentError && (
                <p className="text-danger text-sm">{approvalAttachmentError}</p>
              )}
            </ModalBody>

            <ModalFooter>
              <Button
                variant="flat"
                onPress={() => {
                  setApproveModal({
                    isOpen: false,
                    rowData: null,
                  });
                  setApprovalRemarks("");
                  setApprovalAttachment("");
                  setApprovalAttachmentError("");
                }}
              >
                Cancel
              </Button>

              <Button
                color="success"
                type="submit"
                isLoading={actionLoadingId === approveModal?.rowData?.id}
              >
                Approve
              </Button>
            </ModalFooter>
          </form>
        </ModalContent>
      </Modal>
    </>
  );
};

export default CreditNote;
