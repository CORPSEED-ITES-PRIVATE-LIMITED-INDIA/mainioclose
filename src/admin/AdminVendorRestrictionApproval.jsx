import {
  Button,
  Chip,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Pagination,
  Select,
  SelectItem,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
  Textarea,
  Tooltip,
  addToast,
  useDisclosure,
} from "@heroui/react";

import { Check, ExternalLink, X } from "lucide-react";

import React, { useCallback, useEffect, useState } from "react";

import { useDispatch, useSelector } from "react-redux";

import { useParams } from "react-router-dom";

import {
  approveAdminRestrictionRequest,
  getAllAdminRestrictionRequests,
} from "../toolkit/slices/vendorsSlice";

const columns = [
  {
    name: "REQUEST ID",
    uid: "id",
  },
  {
    name: "VENDOR",
    uid: "vendor",
  },
  {
    name: "RESTRICTION TYPE",
    uid: "restrictionType",
  },
  {
    name: "REASON",
    uid: "reason",
  },
  {
    name: "RESTRICTION PERIOD",
    uid: "restrictionPeriod",
  },
  {
    name: "REQUESTED BY",
    uid: "requestedBy",
  },
  {
    name: "ACCOUNTS REVIEW",
    uid: "accountsReview",
  },
  {
    name: "STATUS",
    uid: "status",
  },
  {
    name: "ATTACHMENT",
    uid: "attachment",
  },
  {
    name: "ACTIONS",
    uid: "actions",
  },
];

const statusOptions = [
  {
    key: "PENDING_ADMIN",
    label: "Pending Admin",
  },
  {
    key: "ADMIN_REJECTED",
    label: "Admin Rejected",
  },
  {
    key: "FINAL_APPROVED",
    label: "Final Approved",
  },
];

const initialReviewForm = {
  approved: null,
  remarks: "",
};

const getErrorMessage = (error, fallbackMessage) => {
  if (typeof error === "string") {
    return error;
  }

  return (
    error?.message ||
    error?.error ||
    error?.details ||
    error?.data?.message ||
    error?.response?.data?.message ||
    fallbackMessage
  );
};

const formatEnumValue = (value) => {
  if (!value) {
    return "-";
  }

  return value
    .toLowerCase()
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

const formatDate = (value) => {
  if (!value) {
    return "-";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const formatDateTime = (value) => {
  if (!value) {
    return "-";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const getStatusColor = (status) => {
  switch (status) {
    case "PENDING_ADMIN":
      return "warning";

    case "FINAL_APPROVED":
      return "success";

    case "ADMIN_REJECTED":
      return "danger";

    default:
      return "default";
  }
};

const getRestrictionTypeColor = (restrictionType) => {
  switch (restrictionType) {
    case "BLACKLIST":
      return "danger";

    case "SUSPENSION":
      return "warning";

    default:
      return "default";
  }
};

function AdminVendorRestrictionApproval() {
  const dispatch = useDispatch();
  const { userId } = useParams();

  const reviewModal = useDisclosure();

  const adminRestrictionPage =
    useSelector((state) => state.vendors?.adminRestrictionRequests) || {};

  /*
   * TableBody must always receive an array.
   */
  const adminRestrictionRequests = Array.isArray(adminRestrictionPage?.content)
    ? adminRestrictionPage.content
    : [];

  const totalElements = Number(adminRestrictionPage?.totalElements) || 0;

  const totalPages = Math.max(Number(adminRestrictionPage?.totalPages) || 0, 1);

  const numberOfElements =
    Number(adminRestrictionPage?.numberOfElements) ||
    adminRestrictionRequests.length;

  const [page, setPage] = useState(1);

  const [size, setSize] = useState(10);

  const [status, setStatus] = useState("PENDING_ADMIN");

  const [selectedRequest, setSelectedRequest] = useState(null);

  const [reviewForm, setReviewForm] = useState(initialReviewForm);

  const [reviewErrors, setReviewErrors] = useState({});

  const numericUserId = Number(userId);

  const fetchRestrictionRequests = useCallback(() => {
    if (!numericUserId || Number.isNaN(numericUserId)) {
      return;
    }

    dispatch(
      getAllAdminRestrictionRequests({
        userId: numericUserId,
        page,
        size,
        status,
      }),
    );
  }, [dispatch, numericUserId, page, size, status]);

  useEffect(() => {
    fetchRestrictionRequests();
  }, [fetchRestrictionRequests]);

  const resetReviewForm = () => {
    setSelectedRequest(null);
    setReviewForm(initialReviewForm);
    setReviewErrors({});
  };

  const openReviewModal = (request, approved) => {
    setSelectedRequest(request);

    setReviewForm({
      approved,
      remarks: "",
    });

    setReviewErrors({});
    reviewModal.onOpen();
  };

  const closeReviewModal = () => {
    resetReviewForm();
    reviewModal.onClose();
  };

  const handleRemarksChange = (value) => {
    setReviewForm((previous) => ({
      ...previous,
      remarks: value,
    }));

    setReviewErrors((previous) => ({
      ...previous,
      remarks: "",
    }));
  };

  const validateReviewForm = () => {
    const errors = {};

    if (!selectedRequest?.id) {
      errors.request = "Restriction request is not selected";
    }

    if (reviewForm.approved === null) {
      errors.approved = "Approval decision is required";
    }

    if (reviewForm.approved === false && !reviewForm.remarks.trim()) {
      errors.remarks = "Remarks are required when rejecting the request";
    }

    if (reviewForm.remarks.trim().length > 1000) {
      errors.remarks = "Remarks cannot exceed 1000 characters";
    }

    setReviewErrors(errors);

    if (errors.request) {
      addToast({
        title: errors.request,
        color: "danger",
      });
    }

    return Object.keys(errors).length === 0;
  };

  const handleSubmitReview = async () => {
    if (!validateReviewForm()) {
      return;
    }

    if (!numericUserId || Number.isNaN(numericUserId)) {
      addToast({
        title: "User ID is missing",
        description: "Please check the route parameter.",
        color: "danger",
      });

      return;
    }

    try {
      await dispatch(
        approveAdminRestrictionRequest({
          requestId: selectedRequest.id,
          userId: numericUserId,
          data: {
            approved: reviewForm.approved,
            remarks: reviewForm.remarks.trim() || null,
          },
        }),
      ).unwrap();

      addToast({
        title: reviewForm.approved
          ? "Final restriction approved"
          : "Restriction request rejected",

        description: reviewForm.approved
          ? selectedRequest?.restrictionType === "BLACKLIST"
            ? "The vendor has been blacklisted."
            : "The vendor has been suspended."
          : "The request has been rejected by Admin.",

        color: reviewForm.approved ? "success" : "warning",
      });

      closeReviewModal();

      /*
       * The reviewed request is removed from
       * PENDING_ADMIN after approval/rejection.
       */
      if (numberOfElements === 1 && page > 1) {
        setPage((previous) => previous - 1);
      } else {
        fetchRestrictionRequests();
      }
    } catch (error) {
      addToast({
        title: "Failed to review restriction request",
        description: getErrorMessage(error, "Please try again."),
        color: "danger",
      });
    }
  };

  const handleStatusChange = (keys) => {
    const selectedStatus = Array.from(keys)[0] || "PENDING_ADMIN";

    setStatus(selectedStatus);
    setPage(1);
  };

  const handleSizeChange = (event) => {
    const selectedSize = Number(event.target.value);

    setSize(Number.isNaN(selectedSize) ? 10 : selectedSize);

    setPage(1);
  };

  const renderCell = (request, columnKey) => {
    switch (columnKey) {
      case "id":
        return (
          <span className="font-medium text-foreground">
            {request?.id || "-"}
          </span>
        );

      case "vendor":
        return (
          <div className="flex min-w-[190px] flex-col">
            <span className="font-medium text-foreground">
              {request?.vendorName || "-"}
            </span>

            <span className="text-xs text-default-400">
              Vendor ID: {request?.vendorId || "-"}
            </span>
          </div>
        );

      case "restrictionType":
        return (
          <Chip
            size="sm"
            variant="flat"
            color={getRestrictionTypeColor(request?.restrictionType)}
          >
            {formatEnumValue(request?.restrictionType)}
          </Chip>
        );

      case "reason":
        return (
          <Tooltip content={request?.reason || "No reason provided"}>
            <p className="max-w-[230px] truncate text-sm text-foreground">
              {request?.reason || "-"}
            </p>
          </Tooltip>
        );

      case "restrictionPeriod":
        if (request?.restrictionType === "BLACKLIST") {
          return (
            <span className="text-sm text-default-400">Not applicable</span>
          );
        }

        return (
          <div className="flex min-w-[155px] flex-col">
            <span className="text-sm text-foreground">
              {formatDate(request?.restrictionStartDate)}
            </span>

            <span className="text-xs text-default-400">
              to {formatDate(request?.restrictionEndDate)}
            </span>
          </div>
        );

      case "requestedBy":
        return (
          <div className="flex min-w-[160px] flex-col">
            <span className="text-sm font-medium text-foreground">
              {request?.requestedByName || "-"}
            </span>

            <span className="text-xs text-default-400">
              {formatDateTime(request?.requestedAt)}
            </span>
          </div>
        );

      case "accountsReview":
        return (
          <div className="flex min-w-[180px] flex-col">
            <span className="text-sm font-medium text-foreground">
              {request?.accountsReviewedByName || "-"}
            </span>

            <span className="text-xs text-default-400">
              {formatDateTime(request?.accountsReviewedAt)}
            </span>

            {request?.accountsRemarks && (
              <Tooltip content={request.accountsRemarks}>
                <span className="max-w-[180px] truncate text-xs text-default-500">
                  {request.accountsRemarks}
                </span>
              </Tooltip>
            )}
          </div>
        );

      case "status":
        return (
          <Chip
            size="sm"
            variant="flat"
            color={getStatusColor(request?.status)}
          >
            {formatEnumValue(request?.status)}
          </Chip>
        );

      case "attachment":
        if (!request?.attachmentUrl) {
          return (
            <span className="text-sm text-default-400">No attachment</span>
          );
        }

        return (
          <Button
            as="a"
            href={request.attachmentUrl}
            target="_blank"
            rel="noreferrer"
            size="sm"
            variant="flat"
            color="primary"
            startContent={<ExternalLink className="h-4 w-4" />}
          >
            View
          </Button>
        );

      case "actions":
        if (request?.status !== "PENDING_ADMIN") {
          return <span className="text-sm text-default-400">Reviewed</span>;
        }

        return (
          <div className="flex items-center justify-center gap-2">
            <Tooltip content="Final approve request">
              <Button
                isIconOnly
                size="sm"
                color="success"
                variant="flat"
                onPress={() => openReviewModal(request, true)}
              >
                <Check className="h-4 w-4" />
              </Button>
            </Tooltip>

            <Tooltip content="Reject request">
              <Button
                isIconOnly
                size="sm"
                color="danger"
                variant="flat"
                onPress={() => openReviewModal(request, false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </Tooltip>
          </div>
        );

      default:
        return request?.[columnKey] || "-";
    }
  };

  const bottomContent = (
    <div className="flex flex-col items-center justify-between gap-3 px-2 py-2 sm:flex-row">
      <span className="text-small text-default-400">
        Showing {numberOfElements} of {totalElements} requests
      </span>

      <Pagination
        isCompact
        showControls
        showShadow
        color="primary"
        page={page}
        total={totalPages}
        onChange={setPage}
      />

      <label className="flex items-center gap-2 text-small text-default-400">
        Rows per page:
        <select
          className="bg-transparent text-small text-default-500 outline-none"
          value={size}
          onChange={handleSizeChange}
        >
          <option value="5">5</option>
          <option value="10">10</option>
          <option value="20">20</option>
          <option value="50">50</option>
        </select>
      </label>
    </div>
  );

  return (
    <>
      <div className="mb-4 flex flex-col gap-1">
        <h1 className="text-2xl font-semibold text-foreground">
          Admin Vendor Restriction Approval
        </h1>
      </div>

      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <span className="text-sm text-default-400">
          Total {totalElements} request
          {totalElements === 1 ? "" : "s"}
        </span>
        <Select
          label="Filter by Status"
          className="w-full sm:w-64"
          selectedKeys={new Set([status])}
          onSelectionChange={handleStatusChange}
        >
          {statusOptions.map((option) => (
            <SelectItem key={option.key}>{option.label}</SelectItem>
          ))}
        </Select>
      </div>

      <Table
        isHeaderSticky
        aria-label="Admin vendor restriction requests"
        bottomContent={bottomContent}
        bottomContentPlacement="outside"
        classNames={{
          wrapper: "max-h-[65vh] w-full rounded-xl border border-default-200",
        }}
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
          items={adminRestrictionRequests}
          emptyContent="No Admin restriction requests found"
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
        isOpen={reviewModal.isOpen}
        onOpenChange={(isOpen) => {
          reviewModal.onOpenChange(isOpen);

          if (!isOpen) {
            resetReviewForm();
          }
        }}
        size="lg"
        isDismissable={false}
      >
        <ModalContent>
          {(modalClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                <span>
                  {reviewForm.approved
                    ? "Final Approve Restriction"
                    : "Reject Restriction Request"}
                </span>

                <span className="text-sm font-normal text-default-500">
                  Request ID: {selectedRequest?.id || "-"}
                </span>
              </ModalHeader>

              <ModalBody>
                <div className="rounded-lg border border-default-200 p-3">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-semibold text-foreground">
                      {selectedRequest?.vendorName || "-"}
                    </p>

                    <Chip
                      size="sm"
                      variant="flat"
                      color={getRestrictionTypeColor(
                        selectedRequest?.restrictionType,
                      )}
                    >
                      {formatEnumValue(selectedRequest?.restrictionType)}
                    </Chip>
                  </div>

                  <p className="mt-2 text-sm text-default-600">
                    {selectedRequest?.reason || "-"}
                  </p>

                  {selectedRequest?.accountsRemarks && (
                    <div className="mt-3 rounded-lg bg-default-100 p-3">
                      <p className="text-xs font-medium text-default-500">
                        Accounts remarks
                      </p>

                      <p className="mt-1 text-sm text-default-700">
                        {selectedRequest.accountsRemarks}
                      </p>
                    </div>
                  )}
                </div>

                <Textarea
                  isRequired={reviewForm.approved === false}
                  label={
                    reviewForm.approved ? "Admin Remarks" : "Rejection Remarks"
                  }
                  placeholder={
                    reviewForm.approved
                      ? "Enter optional final approval remarks"
                      : "Enter the reason for rejection"
                  }
                  minRows={4}
                  maxLength={1000}
                  value={reviewForm.remarks}
                  onValueChange={handleRemarksChange}
                  isInvalid={Boolean(reviewErrors.remarks)}
                  errorMessage={reviewErrors.remarks}
                />
              </ModalBody>

              <ModalFooter>
                <Button
                  variant="flat"
                  onPress={() => {
                    resetReviewForm();
                    modalClose();
                  }}
                >
                  Cancel
                </Button>

                <Button
                  color={reviewForm.approved ? "success" : "danger"}
                  startContent={
                    reviewForm.approved ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <X className="h-4 w-4" />
                    )
                  }
                  onPress={handleSubmitReview}
                >
                  {reviewForm.approved ? "Final Approve" : "Reject"}
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
}

export default AdminVendorRestrictionApproval;
