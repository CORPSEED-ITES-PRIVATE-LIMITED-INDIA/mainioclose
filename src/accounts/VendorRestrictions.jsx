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
  approveAccountRestrictionRequest,
  getAllAccountsRestrictionRequests,
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
    name: "REQUESTED AT",
    uid: "requestedAt",
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
    key: "PENDING_ACCOUNTS",
    label: "Pending Accounts",
  },
  {
    key: "ACCOUNTS_REJECTED",
    label: "Accounts Rejected",
  },
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
    case "PENDING_ACCOUNTS":
    case "PENDING_ADMIN":
      return "warning";

    case "FINAL_APPROVED":
      return "success";

    case "ACCOUNTS_REJECTED":
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

function VendorRestrictions() {
  const dispatch = useDispatch();
  const { userId } = useParams();

  const reviewModal = useDisclosure();

  /*
   * Redux contains the complete Spring Page response:
   *
   * {
   *   content: [],
   *   totalElements: 0,
   *   totalPages: 0,
   *   numberOfElements: 0,
   *   ...
   * }
   */
  const accountsRestrictionPage =
    useSelector((state) => state.vendors?.accountsRestrictionRequests) || {};

  /*
   * HeroUI TableBody requires an array.
   */
  const accountsRestrictionRequests = Array.isArray(
    accountsRestrictionPage?.content,
  )
    ? accountsRestrictionPage.content
    : [];

  const totalElements = Number(accountsRestrictionPage?.totalElements) || 0;

  const totalPages = Math.max(
    Number(accountsRestrictionPage?.totalPages) || 0,
    1,
  );

  const numberOfElements =
    Number(accountsRestrictionPage?.numberOfElements) ||
    accountsRestrictionRequests.length;

  const [page, setPage] = useState(1);

  const [size, setSize] = useState(10);

  const [status, setStatus] = useState("PENDING_ACCOUNTS");

  const [selectedRequest, setSelectedRequest] = useState(null);

  const [reviewForm, setReviewForm] = useState(initialReviewForm);

  const [reviewErrors, setReviewErrors] = useState({});

  const numericUserId = Number(userId);

  const fetchRestrictionRequests = useCallback(() => {
    if (!numericUserId || Number.isNaN(numericUserId)) {
      return;
    }

    dispatch(
      getAllAccountsRestrictionRequests({
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
        approveAccountRestrictionRequest({
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
          ? "Restriction request approved"
          : "Restriction request rejected",

        description: reviewForm.approved
          ? "The request has been forwarded to Admin for final approval."
          : "The request has been rejected by Accounts.",

        color: reviewForm.approved ? "success" : "warning",
      });

      closeReviewModal();

      /*
       * If the reviewed request was the only record
       * on a page greater than 1, move to the
       * previous page. Otherwise, refetch the
       * current page.
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
    const selectedStatus = Array.from(keys)[0] || "PENDING_ACCOUNTS";

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
          <div className="flex min-w-[150px] flex-col">
            <span className="text-sm font-medium text-foreground">
              {request?.requestedByName || "-"}
            </span>

            <span className="text-xs text-default-400">
              User ID: {request?.requestedBy || "-"}
            </span>
          </div>
        );

      case "requestedAt":
        return (
          <span className="min-w-[170px] text-sm text-foreground">
            {formatDateTime(request?.requestedAt)}
          </span>
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
        if (request?.status !== "PENDING_ACCOUNTS") {
          return <span className="text-sm text-default-400">Reviewed</span>;
        }

        return (
          <div className="flex items-center justify-center gap-2">
            <Tooltip content="Approve request">
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
          Vendor Restriction Requests
        </h1>
      </div>

      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
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

        <span className="text-sm text-default-400">
          Total {totalElements} request
          {totalElements === 1 ? "" : "s"}
        </span>
      </div>

      <Table
        isHeaderSticky
        aria-label="Accounts vendor restriction requests"
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
          /*
           * Must always receive an array.
           */
          items={accountsRestrictionRequests}
          emptyContent="No vendor restriction requests found"
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
          if (!isOpen) {
            resetReviewForm();
          }

          reviewModal.onOpenChange();
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
                    ? "Approve Restriction Request"
                    : "Reject Restriction Request"}
                </span>

                <span className="text-sm font-normal text-default-500">
                  Request ID: {selectedRequest?.id || "-"}
                </span>
              </ModalHeader>

              <ModalBody>
                <div className="rounded-lg border border-default-200 p-3">
                  <p className="font-semibold text-foreground">
                    {selectedRequest?.vendorName || "-"}
                  </p>

                  <p className="mt-1 text-sm text-default-500">
                    {formatEnumValue(selectedRequest?.restrictionType)}
                  </p>

                  <p className="mt-2 text-sm text-default-600">
                    {selectedRequest?.reason || "-"}
                  </p>
                </div>

                <Textarea
                  isRequired={reviewForm.approved === false}
                  label={
                    reviewForm.approved
                      ? "Accounts Remarks"
                      : "Rejection Remarks"
                  }
                  placeholder={
                    reviewForm.approved
                      ? "Enter optional remarks"
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
                  {reviewForm.approved ? "Approve" : "Reject"}
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
}

export default VendorRestrictions;
