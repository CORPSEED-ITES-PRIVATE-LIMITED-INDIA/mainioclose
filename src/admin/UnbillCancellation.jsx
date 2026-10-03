import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
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
  Textarea,
  addToast,
  Chip,
  Progress,
  Spinner,
} from "@heroui/react";
import { ExternalLink, Eye, Loader2, Paperclip, Search } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import dayjs from "dayjs";
import { getAllUnbillCount } from "../toolkit/slices/organizationSlice";
import {
  approveUnBilledInvoiceByAdmin,
  cancelUnBilledInvoiceByAdmin,
  getUnBilledDetailById,
  issueUnbilledInvoiceRefundV2, // GET /unbilled-invoices/cancel/requests
  getUnbilledProjectCompletion, // GET /unbilled-invoices/cancel/project-completion
} from "../toolkit/slices/accountSlice";
import { inrCurrency, splitTextIntoTwoLines } from "../common";
import UnbilledView from "../components/UnbilledView";

const REQUEST_STATUS = "CANCEL_REQUESTED";

const columns = [
  { name: "REQUESTED ON", uid: "date" },
  { name: "UNBILL NO.", uid: "unbillNo" },
  { name: "ESTIMATE NO.", uid: "estimateNumber" },
  { name: "COMPANY", uid: "companyName" },
  { name: "SERVICE", uid: "service" },
  { name: "TOTAL AMOUNT", uid: "totalAmount" },
  { name: "CREDIT NOTE AMOUNT", uid: "receivedAmount" },
  { name: "PROJECT COMPLETION", uid: "projectCompletion" },
  { name: "CANCEL REASON", uid: "rejectionReason" },
  { name: "ATTACHMENT", uid: "cancelAttachment" },
  { name: "ADDED BY", uid: "addedBy" },
  { name: "ACTIONS", uid: "actions" },
];

const getErrorMessage = (resp, fallback) =>
  resp?.payload?.data?.message ||
  resp?.payload?.message ||
  (typeof resp?.payload === "string" ? resp.payload : null) ||
  fallback;

const UnbillCancellation = () => {
  const dispatch = useDispatch();
  const { userId } = useParams();

  const userRole = useSelector((state) => state.auth.currentUser?.roles);
  const adminRole = Array.isArray(userRole)
    ? userRole.includes("ADMIN")
    : userRole === "ADMIN";

  // list comes from accountSlice (thunk: issueUnbilledInvoiceRefundV2)
  const data = useSelector((state) => state.account.unbillCancelRequests);
  const loadingState = useSelector((state) => state.account.loading);
  const isFetching = loadingState === true || loadingState === "pending";
  // total for pagination
  const count = useSelector((state) => state.organization.unBillCount);
  const invoiceDetail = useSelector((state) => state.account.unbilledDetail);

  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(15);
  const [filterValue, setFilterValue] = useState("");

  const [selectedRow, setSelectedRow] = useState(null);
  const [rejectReason, setRejectReason] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  // project completion shown to the admin before final approval
  const [projectCompletion, setProjectCompletion] = useState({
    loading: false,
    data: null,
    error: null,
  });
  const completionRequestRef = useRef(0);

  const approveModal = useDisclosure();
  const rejectModal = useDisclosure();
  const viewModal = useDisclosure();

  /* =========================
     LOAD REQUESTS
  ========================= */

  const loadRequests = useCallback(() => {
    if (!adminRole || !userId) return;

    dispatch(
      issueUnbilledInvoiceRefundV2({
        userId,
        page,
        size: rowsPerPage,
      }),
    );
    dispatch(getAllUnbillCount({ userId, status: REQUEST_STATUS }));
  }, [dispatch, adminRole, userId, page, rowsPerPage]);

  useEffect(() => {
    loadRequests();
  }, [loadRequests]);

  const rows = useMemo(() => {
    const list = Array.isArray(data) ? data : [];
    const query = filterValue.trim().toLowerCase();

    if (!query) return list;

    return list.filter((item) =>
      [
        item?.unbilledNumber,
        item?.estimateNumber,
        item?.companyName,
        item?.unitName,
        item?.solutionName,
        item?.createdByName,
        item?.rejectionReason,
      ].some((value) =>
        String(value ?? "")
          .toLowerCase()
          .includes(query),
      ),
    );
  }, [data, filterValue]);

  const pages = Math.ceil((Number(count) || 0) / rowsPerPage) || 1;

  /* =========================
     ACTIONS
  ========================= */

  const refreshAfterAction = () => {
    const list = Array.isArray(data) ? data : [];

    // If the last row of a later page was just handled, step back one page
    if (page > 1 && list.length <= 1) {
      setPage((prev) => prev - 1);
    } else {
      loadRequests();
    }
  };

  const loadProjectCompletion = async (row) => {
    const requestId = ++completionRequestRef.current;

    setProjectCompletion({ loading: true, data: null, error: null });

    try {
      const resp = await dispatch(
        getUnbilledProjectCompletion({ userId, id: row?.id }),
      );

      // ignore a stale response if the admin opened another request meanwhile
      if (requestId !== completionRequestRef.current) return;

      if (resp.meta.requestStatus === "fulfilled") {
        setProjectCompletion({
          loading: false,
          data: resp.payload,
          error: null,
        });
      } else {
        setProjectCompletion({
          loading: false,
          data: null,
          error: getErrorMessage(resp, "Unable to load project completion."),
        });
      }
    } catch (error) {
      if (requestId !== completionRequestRef.current) return;

      setProjectCompletion({
        loading: false,
        data: null,
        error: error?.message || "Unable to load project completion.",
      });
    }
  };

  const openApprove = (row) => {
    setSelectedRow(row);
    approveModal.onOpen();
    loadProjectCompletion(row);
  };

  const openReject = (row) => {
    setSelectedRow(row);
    setRejectReason("");
    rejectModal.onOpen();
  };

  const openView = (row) => {
    setSelectedRow(row);
    dispatch(getUnBilledDetailById({ id: row?.id, userId }));
    viewModal.onOpen();
  };

  const handleApprove = async () => {
    if (!selectedRow || actionLoading) return;

    setActionLoading(true);

    try {
      const resp = await dispatch(
        approveUnBilledInvoiceByAdmin({
          id: selectedRow.id,
          userId,
          reason:
            selectedRow.rejectionReason?.trim() ||
            "Cancellation approved by admin",
        }),
      );

      if (resp.meta.requestStatus !== "fulfilled") {
        addToast({
          title: "Approval failed",
          description: getErrorMessage(
            resp,
            "Failed to approve cancellation request.",
          ),
          color: "danger",
        });
        return;
      }

      addToast({
        title: "Cancellation approved",
        description:
          Number(selectedRow.receivedAmount) > 0
            ? `Credit note voucher of ${inrCurrency(selectedRow.receivedAmount)} posted and ${selectedRow.unbilledNumber} cancelled.`
            : `${selectedRow.unbilledNumber} cancelled.`,
        color: "success",
      });

      approveModal.onClose();
      setSelectedRow(null);
      refreshAfterAction();
    } catch (error) {
      addToast({
        title: "Something went wrong",
        description: error?.message || "Unable to approve cancellation.",
        color: "danger",
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!selectedRow || actionLoading) return;

    if (!rejectReason.trim()) {
      addToast({
        title: "Reason is required",
        description: "Please enter the reason for rejecting this request.",
        color: "danger",
      });
      return;
    }

    setActionLoading(true);

    try {
      const resp = await dispatch(
        cancelUnBilledInvoiceByAdmin({
          id: selectedRow.id,
          userId,
          reason: rejectReason.trim(),
        }),
      );

      if (resp.meta.requestStatus !== "fulfilled") {
        addToast({
          title: "Rejection failed",
          description: getErrorMessage(
            resp,
            "Failed to reject cancellation request.",
          ),
          color: "danger",
        });
        return;
      }

      addToast({
        title: "Cancellation rejected",
        description: `Cancellation request for ${selectedRow.unbilledNumber} was rejected.`,
        color: "success",
      });

      rejectModal.onClose();
      setSelectedRow(null);
      setRejectReason("");
      refreshAfterAction();
    } catch (error) {
      addToast({
        title: "Something went wrong",
        description: error?.message || "Unable to reject cancellation.",
        color: "danger",
      });
    } finally {
      setActionLoading(false);
    }
  };

  /* =========================
     RENDER HELPERS
  ========================= */

  const renderTwoLineText = (text) => {
    const lines = splitTextIntoTwoLines(text);

    return (
      <div className="max-w-[220px] text-[12.5px] capitalize leading-5">
        {lines.map((line, index) => (
          <p key={index} className="whitespace-nowrap">
            {line}
          </p>
        ))}
      </div>
    );
  };

  const renderCell = (row, columnKey) => {
    switch (columnKey) {
      case "date":
        return (
          <div className="flex flex-col gap-1">
            <p className="text-[12.5px]">
              {row?.createdAt
                ? dayjs(row.createdAt).format("DD MMM YYYY")
                : "NA"}
            </p>
            <Chip size="sm" variant="flat" color="warning" className="w-fit">
              {row?.status}
            </Chip>
          </div>
        );

      case "unbillNo":
        return (
          <p className="text-[12.5px] font-medium">
            {row?.unbilledNumber}
            {row?.advanceInvoiceFlag ? ` / ${row?.advanceInvoiceNumber}` : ""}
          </p>
        );

      case "estimateNumber":
        return (
          <p className="text-[12.5px] font-medium">
            {row?.estimateNumber || "NA"}
          </p>
        );

      case "companyName":
        return renderTwoLineText(row?.companyName || row?.company);

      case "service":
        return renderTwoLineText(row?.solutionName);

      case "totalAmount":
        return <p className="text-[12.5px]">{inrCurrency(row?.totalAmount)}</p>;

      case "receivedAmount":
        return (
          <p
            className={`text-[12.5px] font-semibold ${
              Number(row?.receivedAmount) > 0
                ? "text-danger"
                : "text-default-400"
            }`}
          >
            {inrCurrency(row?.receivedAmount)}
          </p>
        );

      case "projectCompletion": {
        const pct = row?.projectCompletionPercentage;

        // null = no project yet, or Operation could not be reached
        if (pct === null || pct === undefined) {
          return (
            <Chip size="sm" variant="flat" color="default">
              No project
            </Chip>
          );
        }

        const value = Number(pct) || 0;

        return (
          <div className="flex min-w-[140px] flex-col gap-1">
            <Progress
              aria-label="Project completion"
              size="sm"
              showValueLabel
              value={value}
              color={
                value >= 100 ? "danger" : value >= 50 ? "warning" : "success"
              }
            />
            {row?.projectCancellationAllowed === false && (
              <span className="text-[11px] font-medium text-danger">
                {row?.projectCertificationCompleted
                  ? "Certification completed"
                  : "Project complete"}
              </span>
            )}
          </div>
        );
      }

      case "rejectionReason":
        return (
          <p
            className="max-w-[240px] truncate text-[12.5px]"
            title={row?.rejectionReason || ""}
          >
            {row?.rejectionReason || "NA"}
          </p>
        );

      case "cancelAttachment":
        return row?.cancelAttachment ? (
          <Button
            size="sm"
            color="primary"
            variant="flat"
            startContent={<Paperclip size={14} />}
            endContent={<ExternalLink size={12} />}
            onPress={() =>
              window.open(row.cancelAttachment, "_blank", "noopener,noreferrer")
            }
          >
            View
          </Button>
        ) : (
          <Chip size="sm" variant="flat" color="default">
            No attachment
          </Chip>
        );

      case "addedBy":
        return renderTwoLineText(row?.createdByName);

      case "actions":
        return (
          <div className="flex items-center gap-1.5">
            <Button
              isIconOnly
              size="sm"
              variant="flat"
              aria-label="View unbill"
              onPress={() => openView(row)}
            >
              <Eye size={15} />
            </Button>
            <Button
              size="sm"
              color="success"
              variant="flat"
              onPress={() => openApprove(row)}
            >
              Approve
            </Button>
            <Button
              size="sm"
              color="danger"
              variant="flat"
              onPress={() => openReject(row)}
            >
              Reject
            </Button>
          </div>
        );

      default:
        return row?.[columnKey];
    }
  };

  /* =========================
     NOT AN ADMIN
  ========================= */

  if (!adminRole) {
    return (
      <div className="rounded-lg border border-default-200 p-6 text-center text-sm text-default-500">
        Only an ADMIN can view and decide cancellation requests.
      </div>
    );
  }

  const creditAmount = Number(selectedRow?.receivedAmount) || 0;

  return (
    <div className="flex flex-col gap-2">
      {actionLoading && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="flex min-w-[220px] flex-col items-center rounded-2xl bg-white px-8 py-6 shadow-2xl">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
            <p className="mt-4 text-sm font-semibold text-default-900">
              Processing request...
            </p>
            <p className="mt-1 text-xs text-default-500">
              Please do not refresh or close this page.
            </p>
          </div>
        </div>
      )}

      <div className="mb-2 flex items-center gap-2">
        <h1 className="shrink-0 font-sans text-lg font-semibold">
          Cancellation requests
        </h1>
        <Chip size="sm" variant="flat" color="warning">
          {Number(count) || 0} pending
        </Chip>
      </div>

      <Table
        isHeaderSticky
        removeWrapper={false}
        aria-label="Pending unbilled cancellation requests"
        classNames={{
          base: "gap-2.5",
          wrapper:
            "max-h-[calc(100vh-320px)] w-full overflow-y-auto rounded-lg border border-gray-200 p-0 shadow-none dark:border-white/10",
          table: "w-full",
          th: "h-8 border-b border-gray-200 bg-gray-50 py-0 text-[11.5px] tracking-wide text-default-500 first:rounded-none last:rounded-none dark:border-white/10 dark:bg-neutral-900",
          td: "py-1.5 text-[12.5px]",
        }}
        topContentPlacement="outside"
        topContent={
          <div className="flex items-center justify-between gap-2">
            <Input
              isClearable
              size="sm"
              className="w-full sm:max-w-[360px]"
              classNames={{ inputWrapper: "h-8 min-h-8" }}
              placeholder="Search unbill, estimate, company, reason..."
              startContent={<Search className="h-4 w-4 text-default-400" />}
              value={filterValue}
              onClear={() => setFilterValue("")}
              onValueChange={setFilterValue}
            />
            <label className="flex items-center gap-1 text-[12.5px] text-default-400">
              Rows per page:
              <select
                className="cursor-pointer bg-transparent text-[12.5px] text-default-400 outline-hidden"
                value={rowsPerPage}
                onChange={(e) => {
                  setRowsPerPage(Number(e.target.value));
                  setPage(1);
                }}
              >
                <option value="15">15</option>
                <option value="25">25</option>
                <option value="50">50</option>
              </select>
            </label>
          </div>
        }
        bottomContentPlacement="outside"
        bottomContent={
          <div className="flex items-center justify-center px-1 py-1.5">
            <Pagination
              isCompact
              showControls
              color="primary"
              page={page}
              total={pages}
              onChange={setPage}
            />
          </div>
        }
      >
        <TableHeader columns={columns}>
          {(column) => (
            <TableColumn key={column.uid} align="start">
              {column.name}
            </TableColumn>
          )}
        </TableHeader>
        <TableBody
          emptyContent="No pending cancellation requests"
          items={rows}
          isLoading={isFetching && rows.length === 0}
          loadingContent={<Spinner size="sm" label="Loading requests..." />}
        >
          {(item) => (
            <TableRow key={`${item?.id}cancelrequest`}>
              {(columnKey) => (
                <TableCell>{renderCell(item, columnKey)}</TableCell>
              )}
            </TableRow>
          )}
        </TableBody>
      </Table>

      {/* ============ APPROVE ============ */}
      <Modal
        isOpen={approveModal.isOpen}
        onOpenChange={approveModal.onOpenChange}
        isDismissable={!actionLoading}
        placement="top-center"
        backdrop="blur"
        size="lg"
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                Approve cancellation
                <span className="text-xs font-normal text-gray-500">
                  {selectedRow?.unbilledNumber} · {selectedRow?.companyName}
                </span>
              </ModalHeader>

              <ModalBody>
                <div className="rounded-xl border border-default-200 bg-default-50 p-4 text-[12.5px]">
                  <div className="flex justify-between py-0.5">
                    <span className="text-default-500">Total amount</span>
                    <span className="font-medium">
                      {inrCurrency(selectedRow?.totalAmount)}
                    </span>
                  </div>
                  <div className="flex justify-between py-0.5">
                    <span className="text-default-500">
                      Credit note amount (received)
                    </span>
                    <span className="font-semibold">
                      {inrCurrency(selectedRow?.receivedAmount)}
                    </span>
                  </div>
                  <div className="mt-2 border-t border-default-200 pt-2">
                    <p className="text-default-500">Cancel reason</p>
                    <p className="mt-0.5">
                      {selectedRow?.rejectionReason || "NA"}
                    </p>
                  </div>
                </div>

                {/* ===== PROJECT COMPLETION ===== */}
                <div className="rounded-xl border border-default-200 p-4 text-[12.5px]">
                  <p className="mb-2 font-semibold text-default-800">
                    Project completion
                  </p>

                  {projectCompletion.loading ? (
                    <Spinner size="sm" label="Checking project..." />
                  ) : projectCompletion.error ? (
                    <p className="text-warning-600">
                      {projectCompletion.error}
                    </p>
                  ) : !projectCompletion.data?.projectFound ? (
                    <p className="text-default-500">
                      No project has been created for this unbilled yet.
                    </p>
                  ) : (
                    <>
                      <Progress
                        aria-label="Project completion"
                        size="md"
                        showValueLabel
                        value={
                          Number(
                            projectCompletion.data
                              .milestoneCompletionPercentage,
                          ) || 0
                        }
                        color={
                          Number(
                            projectCompletion.data
                              .milestoneCompletionPercentage,
                          ) >= 100
                            ? "danger"
                            : Number(
                                  projectCompletion.data
                                    .milestoneCompletionPercentage,
                                ) >= 50
                              ? "warning"
                              : "success"
                        }
                      />

                      <div className="mt-2 flex flex-wrap items-center gap-2">
                        <span>
                          {projectCompletion.data.completedMilestones ?? 0} of{" "}
                          {projectCompletion.data.totalMilestones ?? 0}{" "}
                          milestones completed
                        </span>

                        <Chip size="sm" variant="flat" color="default">
                          {projectCompletion.data.projectNo || "Project"}
                          {projectCompletion.data.projectStatus
                            ? ` · ${projectCompletion.data.projectStatus}`
                            : ""}
                        </Chip>

                        {projectCompletion.data
                          .certificationMilestonePresent && (
                          <Chip
                            size="sm"
                            variant="flat"
                            color={
                              projectCompletion.data.certificationCompleted
                                ? "danger"
                                : "success"
                            }
                          >
                            Certification{" "}
                            {projectCompletion.data.certificationCompleted
                              ? "completed"
                              : "not completed"}
                          </Chip>
                        )}
                      </div>

                      {projectCompletion.data.cancellationAllowed === false && (
                        <div className="mt-3 rounded-lg border border-danger-200 bg-danger-50 p-2 text-danger-700">
                          {projectCompletion.data.blockReason ||
                            "This project is complete, so cancellation should not be approved."}
                        </div>
                      )}
                    </>
                  )}
                </div>

                <p className="text-[12.5px] text-default-600">
                  {creditAmount > 0
                    ? `A credit note voucher of ${inrCurrency(creditAmount)} will be posted to the ledgers, and the unbilled, estimate, invoices, payments and project will be cancelled.`
                    : "Nothing was received on this unbilled, so no credit note voucher will be posted. The unbilled, estimate, invoices, payments and project will be cancelled."}
                </p>
                <p className="text-[12px] text-danger">
                  This action cannot be undone.
                </p>
              </ModalBody>

              <ModalFooter>
                <Button
                  variant="light"
                  isDisabled={actionLoading}
                  onPress={onClose}
                >
                  Close
                </Button>
                <Button
                  color="success"
                  isLoading={actionLoading}
                  isDisabled={actionLoading}
                  onPress={handleApprove}
                >
                  Approve & cancel
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      {/* ============ REJECT ============ */}
      <Modal
        isOpen={rejectModal.isOpen}
        onOpenChange={rejectModal.onOpenChange}
        isDismissable={!actionLoading}
        placement="top-center"
        backdrop="blur"
        size="lg"
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                Reject cancellation
                <span className="text-xs font-normal text-gray-500">
                  {selectedRow?.unbilledNumber} · {selectedRow?.companyName}
                </span>
              </ModalHeader>

              <ModalBody>
                <div className="rounded-xl border border-default-200 bg-default-50 p-3 text-[12.5px]">
                  <p className="text-default-500">Requested because</p>
                  <p className="mt-0.5">
                    {selectedRow?.rejectionReason || "NA"}
                  </p>
                </div>

                <Textarea
                  label="Reason for rejection"
                  placeholder="Tell the requester why this cancellation is rejected"
                  isRequired
                  minRows={3}
                  value={rejectReason}
                  onValueChange={setRejectReason}
                />
              </ModalBody>

              <ModalFooter>
                <Button
                  variant="light"
                  isDisabled={actionLoading}
                  onPress={onClose}
                >
                  Close
                </Button>
                <Button
                  color="danger"
                  isLoading={actionLoading}
                  isDisabled={actionLoading}
                  onPress={handleReject}
                >
                  Reject request
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      {/* ============ VIEW UNBILL ============ */}
      <Modal
        isOpen={viewModal.isOpen}
        onOpenChange={viewModal.onOpenChange}
        size="4xl"
        placement="top-center"
        backdrop="blur"
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                Unbill
                <span className="text-xs font-normal text-gray-500">
                  {selectedRow?.unbilledNumber}
                </span>
              </ModalHeader>
              <ModalBody className="max-h-[75vh] overflow-auto">
                <UnbilledView invoiceData={invoiceDetail} heading="Unbilled" />
              </ModalBody>
              <ModalFooter>
                <Button color="danger" variant="light" onPress={onClose}>
                  Close
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
};

export default UnbillCancellation;
