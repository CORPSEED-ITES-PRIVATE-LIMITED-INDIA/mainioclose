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
  Popover,
  PopoverContent,
  PopoverTrigger,
  input,
} from "@heroui/react";
import {
  ChevronDown,
  EllipsisVertical,
  ExternalLink,
  FileDown,
  Paperclip,
  Search,
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import {
  getAllUnbillCount,
  getAllUnbillGovtFeeList,
  getAllUnbillList,
  getUnbilledReport,
  searchUnbilledByCompanyNameAndUnbilled,
  updateStatusForUnbill,
} from "../../toolkit/slices/organizationSlice";
import { inrCurrency, splitTextIntoTwoLines } from "../../common";
import dayjs from "dayjs";
import {
  approveUnBilledInvoiceByAdmin,
  cancelUnBilledInvoice,
  cancelUnBilledInvoiceByAdmin,
  convertUnbillToAdvanceInvoice,
  createCreditNotes,
  getTdsDetailByEstimateId,
  getUnBilledDetailById,
} from "../../toolkit/slices/accountSlice";
import { Link, useParams } from "react-router-dom";
import UnbilledView from "../../components/UnbilledView";
import { cancelProjectByUnbilledNumberInOperations } from "../../toolkit/slices/operationSlice";
import { set } from "zod";
import {
  getAllLeadUser,
  getEstimateByEstimateId,
  updateLeadStatus,
} from "../../toolkit/slices/leadSlice";
import { getAllStatusData } from "../../toolkit/slices/settingSlice.js";
import NewEstimatePreview from "../../sales/leads/leadEstimate/NewEstimatePreview";
import NewSelect from "../../components/NewSelect.jsx";
import FileUploader from "../../components/FileUploader.jsx";

export const columns = [
  { name: "DATE", uid: "date" },
  { name: "UNBILL NO. / ADVANCE INVOICE", uid: "unbillNo" },
  { name: "ESTIMATE NUMBER", uid: "estimateNumber" },
  { name: "GOVERNMENT FEE", uid: "governmentFee" },
  { name: "TDS", uid: "tdsActive" },
  { name: "SERVICE", uid: "service" },
  { name: "CLIENT", uid: "client" },
  { name: "COMPANY", uid: "companyName" },
  { name: "UNIT", uid: "unitName" },
  { name: "PAYMENT TERM", uid: "paymentTypeCode" },
  { name: "TOTAL AMOUNT", uid: "totalAmount" },
  { name: "RECEIVED AMOUNT", uid: "receivedAmount" },
  { name: "CURR. RECEIVED AMOUNT", uid: "currentReceivedAmount" },
  { name: "OUTSTANDING AMOUNT", uid: "outstandingAmount" },
  { name: "CANCEL ATTACHEMENT", uid: "cancelAttachment" },
  { name: "PAYMENT PROOF", uid: "paymentProof" },
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
  "governmentFee",
  "tdsActive",
  "service",
  "client",
  "companyName",
  "unitName",
  "paymentTypeCode",
  "totalAmount",
  "currentReceivedAmount",
  "outstandingAmount",
  "cancelAttachment",
  "paymentProof",
  "addedBy",
  "actions",
];

const getAttachmentFileName = (attachmentUrl = "") => {
  if (!attachmentUrl) return "Attachment";

  try {
    const decodedUrl = decodeURIComponent(attachmentUrl);
    const urlPath = decodedUrl.startsWith("http")
      ? new URL(decodedUrl).pathname
      : decodedUrl;

    const fileName = urlPath.split("/").pop();

    return fileName || "Attachment";
  } catch (error) {
    return attachmentUrl.split("/").pop()?.split("?")[0] || "Attachment";
  }
};

const getAttachmentType = (attachmentUrl = "") => {
  if (!attachmentUrl) return "unknown";

  const cleanUrl = attachmentUrl.split("?")[0].split("#")[0].toLowerCase();
  const extension = cleanUrl.split(".").pop();

  const imageTypes = ["jpg", "jpeg", "png", "webp", "gif", "bmp", "svg"];
  const pdfTypes = ["pdf"];
  const textTypes = ["txt", "csv", "log", "json", "xml"];

  if (imageTypes.includes(extension)) return "image";
  if (pdfTypes.includes(extension)) return "pdf";
  if (textTypes.includes(extension)) return "text";

  return "unknown";
};

const REPORT_COLUMNS = [
  {
    header: "Date",
    value: (row) => {
      const dateValue = row?.createdAt || row?.date;
      return dateValue ? dayjs(dateValue).format("DD-MM-YYYY") : "";
    },
  },
  { header: "Unbilled Number", value: (row) => row?.unbilledNumber },
  {
    header: "Advance Invoice Number",
    value: (row) => row?.advanceInvoiceNumber,
  },
  { header: "Estimate Number", value: (row) => row?.estimateNumber },
  { header: "Status", value: (row) => row?.status },
  {
    header: "Government Fee Active",
    value: (row) => (row?.governmentFeeActiveFlag ? "Yes" : "No"),
  },
  {
    header: "TDS Active",
    value: (row) => (row?.tdsActiveFlag ? "Yes" : "No"),
  },
  {
    header: "TDS Amount",
    value: (row) => row?.tdsResponseDto?.tdsAmount ?? "",
  },
  {
    header: "TDS Percentage",
    value: (row) => row?.tdsResponseDto?.tdsPercentage ?? "",
  },
  { header: "Service", value: (row) => row?.solutionName },
  { header: "Client", value: (row) => row?.contactName },
  { header: "Company", value: (row) => row?.companyName || row?.company },
  { header: "Payment Term", value: (row) => row?.paymentTypeCode },
  { header: "Total Amount", value: (row) => row?.totalAmount },
  { header: "Received Amount", value: (row) => row?.receivedAmount },
  {
    header: "Current Received Amount",
    value: (row) => row?.currentReceivedAmount,
  },
  { header: "Outstanding Amount", value: (row) => row?.outstandingAmount },
  { header: "Added By", value: (row) => row?.createdByName },
];

const normalizeReportPayload = (payload) => {
  if (Array.isArray(payload)) return payload;

  if (Array.isArray(payload?.content)) return payload.content;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.data?.content)) return payload.data.content;
  if (Array.isArray(payload?.response)) return payload.response;
  if (Array.isArray(payload?.response?.content))
    return payload.response.content;
  if (Array.isArray(payload?.items)) return payload.items;
  if (Array.isArray(payload?.records)) return payload.records;

  return [];
};

const escapeCsvCell = (value) => {
  if (value === null || value === undefined) return "";

  const stringValue = String(value)
    .replace(/\r?\n|\r/g, " ")
    .trim();

  if (
    stringValue.includes(",") ||
    stringValue.includes('"') ||
    stringValue.includes("\n")
  ) {
    return `"${stringValue.replace(/"/g, '""')}"`;
  }

  return stringValue;
};

const convertRowsToCsv = (rows = []) => {
  const header = REPORT_COLUMNS.map((column) =>
    escapeCsvCell(column.header),
  ).join(",");

  const body = rows
    .map((row) =>
      REPORT_COLUMNS.map((column) => escapeCsvCell(column.value(row))).join(
        ",",
      ),
    )
    .join("\n");

  return [header, body].filter(Boolean).join("\n");
};

const downloadCsvFile = (csvContent, fileName) => {
  const blob = new Blob(["\ufeff", csvContent], {
    type: "text/csv;charset=utf-8;",
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.setAttribute("download", fileName);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);
};

const isDateInRange = (value, startDate, endDate) => {
  if (!value) return false;

  const itemDate = dayjs(value);
  const start = dayjs(startDate).startOf("day");
  const end = dayjs(endDate).endOf("day");

  if (!itemDate.isValid()) return false;

  return (
    itemDate.isAfter(start.subtract(1, "millisecond")) &&
    itemDate.isBefore(end.add(1, "millisecond"))
  );
};

const Unbill = () => {
  const dispatch = useDispatch();
  const { userId } = useParams();
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const statusModal = useDisclosure();
  const creditNoteModal = useDisclosure();
  const viewModal = useDisclosure();
  const govtFeeModal = useDisclosure();
  const tdsModal = useDisclosure();
  const paymentProofModal = useDisclosure();
  const [selectedPaymentProof, setSelectedPaymentProof] = useState("");
  const userRole = useSelector((state) => state.auth.currentUser?.roles);
  const adminRole = userRole.includes("ADMIN");
  const department = useSelector(
    (state) => state?.auth?.getDepartmentDetail?.department,
  );
  const data = useSelector((state) => state.organization.unBillList);
  const count = useSelector((state) => state.organization.unBillCount);
  const invoiceDetail = useSelector((state) => state.account.unbilledDetail);
  const statusList = useSelector((state) => state?.setting?.statusList);
  const allLeadUser = useSelector((state) => state?.leads?.leadUsersList);
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
    attachment: "",
  });

  const [isCancelAttachmentUploading, setIsCancelAttachmentUploading] =
    useState(false);
  const [isAdvanceInvoice, setIsAdvanceInvoice] = useState(false);
  const [searchBy, setSearchBy] = useState("companyName");
  const [estimateDetail, setEstimateDetail] = useState(null);
  const [viewType, setViewType] = useState("ESTIMATE");
  const [govtFeeDetail, setGovtFeeDetail] = useState();
  const [tdsDetail, setTdsDetail] = useState();
  const [creditNoteData, setCreditNoteData] = useState({
    refundAmount: "",
    reason: "",
    attachment: "",
  });

  const [isCreditNoteAttachmentUploading, setIsCreditNoteAttachmentUploading] =
    useState(false);
  getAllStatusData;
  const [creditNoteRow, setCreditNoteRow] = useState(null);
  const [reportFilters, setReportFilters] = useState({
    fromDate: "",
    toDate: "",
    status: "ALL",
    createdByUserId: "",
  });
  const [isReportFetching, setIsReportFetching] = useState(false);
  const [isReportPopoverOpen, setIsReportPopoverOpen] = useState(false);

  const reportUserOptions = React.useMemo(
    () => [{ id: "", fullName: "All Users" }, ...(allLeadUser || [])],
    [allLeadUser],
  );

  const handleActionMenuOpen = () => {
    dispatch(getAllStatusData());
    console.log("Status List", statusList);
  };

  const getAwaitingPaymentStatusId = () => {
    const awaitingPaymentStatus = (statusList || []).find(
      (item) =>
        item?.name?.trim()?.toLowerCase() === "Awaiting Payment"?.toLowerCase(),
    );

    return awaitingPaymentStatus?.id;
  };

  useEffect(() => {
    if (userId) {
      dispatch(getAllLeadUser(userId));
    }
  }, [dispatch, userId]);

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
    return [...filteredItems];
  }, [filteredItems]);

  const handleViewEstimate = (rowData, type) => {
    setViewType(type);
    dispatch(
      getEstimateByEstimateId({ estimateId: rowData?.estimateId, userId }),
    )
      .then((resp) => {
        if (resp.meta.requestStatus === "fulfilled") {
          let data = resp?.payload;
          setEstimateDetail(data);
          viewModal.onOpen();
        } else {
          addToast({
            title: "There is Some Issue in estimate",
            color: "danger",
          });
        }
      })
      .catch(() =>
        addToast({ title: "There is Some Issue in estimate", color: "danger" }),
      );
  };

  const handleGovtFeePreview = async (unbilledId) => {
    dispatch(getAllUnbillGovtFeeList(unbilledId))
      .then((resp) => {
        if (resp.meta.requestStatus === "fulfilled") {
          let data = resp?.payload;
          setGovtFeeDetail(data);
          govtFeeModal.onOpen();
        } else {
          addToast({
            title: "There is Some Issue in Govt Fee Estimate",
            color: "danger",
          });
        }
      })
      .catch((e) =>
        addToast({
          title: e.message,
          color: "danger",
        }),
      );
  };

  const handleTdsPreview = async (estimateId, unbilledId) => {
    dispatch(getTdsDetailByEstimateId({ estimateId, unbilledId }))
      .then((resp) => {
        if (resp.meta.requestStatus === "fulfilled") {
          let data = resp?.payload;
          setTdsDetail(data);
          tdsModal.onOpen();
        } else {
          addToast({
            title: "There is Some Issue in TDS Estimate",
            color: "danger",
          });
        }
      })
      .catch((e) =>
        addToast({
          title: e.message,
          color: "danger",
        }),
      );
  };

  const handleCreateCreditNote = async () => {
    if (
      !creditNoteData.refundAmount ||
      Number(creditNoteData.refundAmount) <= 0
    ) {
      addToast({
        title: "Refund amount is required",
        color: "danger",
      });
      return;
    }

    if (!creditNoteData.reason?.trim()) {
      addToast({
        title: "Reason is required",
        color: "danger",
      });
      return;
    }

    if (isCreditNoteAttachmentUploading) {
      addToast({
        title: "Upload in progress",
        description: "Please wait until attachment upload is completed.",
        color: "warning",
      });
      return;
    }

    if (!creditNoteData.attachment) {
      addToast({
        title: "Attachment is required",
        description: "Please upload credit note attachment.",
        color: "danger",
      });
      return;
    }

    const payload = {
      estimateNumber: creditNoteRow?.estimateNumber,
      createdByUserId: Number(userId),
      refundAmount: Number(creditNoteData.refundAmount),
      reason: creditNoteData.reason,
      attachment: creditNoteData.attachment,
    };

    try {
      const resp = await dispatch(createCreditNotes(payload));

      if (resp.meta.requestStatus === "fulfilled") {
        addToast({
          title: "Credit note created successfully!",
          color: "success",
        });

        creditNoteModal.onClose();
        setCreditNoteRow(null);
        setCreditNoteData({
          refundAmount: "",
          reason: "",
          attachment: "",
        });

        dispatch(getAllUnbillList({ page, size: rowsPerPage, userId, status }));
        dispatch(getAllUnbillCount({ userId, status }));
      } else {
        addToast({
          title: "RESTRICTED",
          description:
            resp?.payload?.data?.message || "Failed to create credit note",
          color: "danger",
        });
      }
    } catch (error) {
      addToast({
        title: "Something went wrong!",
        color: "danger",
      });
    }
  };

  const handlePaymentProofPreview = (paymentProofUrl) => {
    if (!paymentProofUrl) {
      addToast({
        title: "No payment proof available",
        color: "warning",
      });
      return;
    }

    setSelectedPaymentProof(paymentProofUrl);
    paymentProofModal.onOpen();
  };

  const renderTwoLineText = (text, maxWidth = "220px", className = "") => {
    const lines = splitTextIntoTwoLines(text);

    return (
      <div
        className={`text-sm capitalize leading-5 ${className}`}
        style={{ maxWidth }}
      >
        {lines.map((line, index) => (
          <p key={index} className="whitespace-nowrap">
            {line}
          </p>
        ))}
      </div>
    );
  };

  const renderCell = React.useCallback((rowData, columnKey) => {
    const cellValue = rowData[columnKey];
    switch (columnKey) {
      case "date":
        return (
          <div>
            <p className="text-sm capitalize">
              {dayjs(rowData?.date).format("DD-MM-YYYY")}
            </p>
            <Chip
              size="sm"
              color={
                rowData?.status === "APPROVED"
                  ? "success"
                  : rowData?.status === "REJECTED"
                    ? "danger"
                    : "warning"
              }
            >
              {rowData?.status}
            </Chip>
          </div>
        );
      case "unbillNo":
        return (
          <Link
            to={`${rowData?.id}/invoices`}
            className="text-sm capitalize font-medium"
          >
            {`${rowData?.unbilledNumber}`}
            {rowData?.advanceInvoiceFlag
              ? ` / ${rowData?.advanceInvoiceNumber}`
              : ``}{" "}
          </Link>
        );
      case "estimateNumber":
        return (
          <div>
            <p
              className="capitalize text-xs font-medium text-blue-600 cursor-pointer"
              onClick={() => handleViewEstimate(rowData, "ESTIMATE")}
            >
              {rowData?.estimateNumber || "NA"}
            </p>
          </div>
        );
      case "governmentFee":
        return (
          <div>
            <button
              disabled={!rowData?.governmentFeeActiveFlag}
              className={`capitalize text-xs font-medium ${rowData?.governmentFeeActiveFlag == true ? "text-blue-600 cursor-pointer" : "text-gray-500 cursor-not-allowed"}`}
              onClick={() => {
                handleGovtFeePreview(rowData.id);
              }}
            >
              {rowData?.governmentFeeActiveFlag === true ? "True" : "False"}
            </button>
          </div>
        );
      case "tdsActive":
        return (
          <div className="w-full max-w-[130px] rounded-md px-3 py-2">
            {rowData?.tdsActiveFlag === true && (
              <div className="mt-2 space-y-1 text-xs">
                <div className="flex items-center gap-3">
                  <span className="whitespace-nowrap font-semibold text-gray-900 dark:text-white">
                    ₹ {rowData?.tdsResponseDto?.tdsAmount ?? 0}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <span className="whitespace-nowrap font-semibold text-gray-600 dark:text-gray-300">
                    {rowData?.tdsResponseDto?.tdsPercentage ?? 0}%
                  </span>
                </div>
              </div>
            )}
          </div>
        );

      case "service":
        return renderTwoLineText(rowData?.solutionName, "220px");

      case "companyName":
        return (
          <>
            <Link
              className="font-medium"
              to={`/erp/${userId}/accounts/companyApprovals`}
            >
              {renderTwoLineText(
                rowData?.companyName || rowData?.company,
                "220px",
              )}
            </Link>
            <Chip
              size="sm"
              color={
                rowData?.companyStatus === "APPROVED"
                  ? "success"
                  : rowData?.companyStatus === "REJECTED"
                    ? "danger"
                    : "warning"
              }
            >
              {rowData?.companyStatus}
            </Chip>
          </>
        );

      case "client":
        return renderTwoLineText(rowData?.contactName, "220px");
      case "unitName":
        return (
          <div className="">
            <Link
              className="font-medium"
              to={`/erp/${userId}/accounts/companyApprovals/${rowData?.companyId}/units`}
            >
              {renderTwoLineText(rowData?.unitName, "220px")}
            </Link>

            <Chip
              size="sm"
              color={
                rowData?.unitStatus === "APPROVED"
                  ? "success"
                  : rowData?.unitStatus === "REJECTED"
                    ? "danger"
                    : "warning"
              }
            >
              {rowData?.unitStatus || "NA"}
            </Chip>
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
      case "currentReceivedAmount":
        return (
          <p className="text-sm capitalize">
            {inrCurrency(rowData?.currentReceivedAmount)}
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
      case "cancelAttachment":
        return (
          <div className="flex items-center gap-2">
            {rowData?.cancelAttachment ? (
              <Button
                size="sm"
                color="primary"
                variant="flat"
                startContent={<Paperclip size={14} />}
                onPress={() =>
                  handlePaymentProofPreview(rowData?.cancelAttachment)
                }
              >
                View
              </Button>
            ) : (
              <Chip size="sm" variant="flat" color="default">
                No attachement
              </Chip>
            )}
          </div>
        );
      case "paymentProof":
        return (
          <div className="flex items-center gap-2">
            {rowData?.transactionReference ? (
              <Button
                size="sm"
                color="primary"
                variant="flat"
                startContent={<Paperclip size={14} />}
                onPress={() =>
                  handlePaymentProofPreview(rowData?.transactionReference)
                }
              >
                View
              </Button>
            ) : (
              <Chip size="sm" variant="flat" color="default">
                No Proof
              </Chip>
            )}
          </div>
        );
      case "actions":
        return (
          <div className="relative flex justify-center items-center gap-2">
            <Dropdown>
              <DropdownTrigger>
                <Button
                  isIconOnly
                  size="sm"
                  variant="light"
                  onClick={handleActionMenuOpen}
                >
                  <EllipsisVertical className="text-default-300" />
                </Button>
              </DropdownTrigger>
              <DropdownMenu>
                {!rowData?.advanceInvoiceFlag && (
                  <DropdownItem
                    key="view"
                    onPress={() => {
                      dispatch(
                        convertUnbillToAdvanceInvoice({
                          unbilledId: rowData?.id,
                          userId,
                        }),
                      )
                        .then((resp) => {
                          if (resp.meta.requestStatus === "fulfilled") {
                            addToast({
                              title:
                                "Unbill converted to advance invoice successfully !.",
                              color: "success",
                            });
                            dispatch(
                              getAllUnbillList({
                                page,
                                size: rowsPerPage,
                                userId,
                                status,
                              }),
                            );
                            dispatch(getAllUnbillCount({ userId, status }));
                          } else {
                            addToast({
                              title:
                                resp?.payload?.data?.message ||
                                "Something went wrong !.",
                              color: "danger",
                            });
                          }
                        })
                        .catch(() => {
                          addToast({
                            title: "Something went wrong !.",
                            color: "danger",
                          });
                        });
                    }}
                  >
                    Convert To AdvanceInvoice
                  </DropdownItem>
                )}

                <DropdownItem
                  key="unbilledview"
                  onPress={() => {
                    setIsAdvanceInvoice(false);
                    onOpen();
                    dispatch(
                      getUnBilledDetailById({ id: rowData?.id, userId }),
                    );
                  }}
                >
                  Unbilled View
                </DropdownItem>
                <DropdownItem
                  key="advanceinvoiceview"
                  onPress={() => {
                    setIsAdvanceInvoice(true);
                    onOpen();
                    dispatch(
                      getUnBilledDetailById({ id: rowData?.id, userId }),
                    );
                  }}
                >
                  Advance Invoice View
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

  const onSearchChange = React.useCallback(
    (value) => {
      if (value) {
        setFilterValue(value);
        if (searchBy === "companyName") {
          dispatch(
            searchUnbilledByCompanyNameAndUnbilled({
              page,
              size: rowsPerPage,
              companyName: value,
            }),
          );
        } else if (searchBy === "unbilledNumber") {
          dispatch(
            searchUnbilledByCompanyNameAndUnbilled({
              page,
              size: rowsPerPage,
              unbilledNumber: value,
            }),
          );
        } else if (searchBy === "estimateNumber") {
          dispatch(
            searchUnbilledByCompanyNameAndUnbilled({
              page,
              size: rowsPerPage,
              estimateNumber: value,
            }),
          );
        }
        setPage(1);
      } else {
        setFilterValue("");
        dispatch(getAllUnbillList({ page, size: rowsPerPage, userId, status }));
        dispatch(getAllUnbillCount({ userId, status }));
      }
    },
    [searchBy, rowsPerPage, page, status, userId],
  );

  const onClear = React.useCallback(() => {
    setFilterValue("");
    setPage(1);
  }, [searchBy]);

  const handleUpdateStatus = () => {
    const selectedStatus = updatedStatusData?.approvalRemarks;

    if (!selectedStatus) {
      addToast({
        title: "Status is required",
        description: "Please select status.",
        color: "danger",
      });
      return;
    }

    if (
      (selectedStatus === "REJECTED" || selectedStatus === "CANCELLED") &&
      !updatedStatusData?.rejectionReason?.trim()
    ) {
      addToast({
        title: "Remark is required",
        description: "Please enter remark.",
        color: "danger",
      });
      return;
    }

    if (selectedStatus === "CANCELLED" && isCancelAttachmentUploading) {
      addToast({
        title: "Upload in progress",
        description: "Please wait until attachment upload is completed.",
        color: "warning",
      });
      return;
    }

    if (
      selectedStatus === "CANCELLED" &&
      !updatedStatusData?.attachment &&
      !adminRole
    ) {
      addToast({
        title: "Attachment is required",
        description: "Please upload attachment for cancelled status.",
        color: "danger",
      });
      return;
    }

    if (selectedStatus === "CANCELLED") {
      dispatch(
        cancelUnBilledInvoice({
          id: rowItem?.id,
          userId,
          reason: updatedStatusData?.rejectionReason,
          cancelAttachment: updatedStatusData?.attachment,
        }),
      )
        .then((re) => {
          if (re.meta.requestStatus === "fulfilled") {
            addToast({
              title: "SUCCESS",
              description: "Unbill canceled successfully !.",
              color: "success",
            });

            setRowItem(null);
            setUpdatedStatusData({
              approverUserId: userId,
              approvalRemarks: "",
              rejectionReason: "",
              attachment: "",
            });

            dispatch(
              getAllUnbillList({
                page,
                size: rowsPerPage,
                userId,
                status,
              }),
            );
            dispatch(getAllUnbillCount({ userId, status }));
            statusModal.onClose();
          } else {
            addToast({
              title: "ERROR",
              description:
                re?.payload?.data?.message ||
                re?.payload?.message ||
                "Failed to cancel unbill.",
              color: "danger",
            });
          }
        })
        .catch(() =>
          addToast({
            title: "ERROR",
            description: "Something went wrong !.",
            color: "danger",
          }),
        );

      return;
    }

    if (adminRole && selectedStatus === "REJECTED") {
      dispatch(
        cancelUnBilledInvoiceByAdmin({
          id: rowItem?.id,
          userId,
          reason: updatedStatusData?.rejectionReason,
        }),
      )
        .then((re) => {
          if (re.meta.requestStatus === "fulfilled") {
            addToast({
              title: "SUCCESS",
              description: "Unbill canceled successfully by Admin !.",
              color: "success",
            });

            setRowItem(null);
            setUpdatedStatusData({
              approverUserId: userId,
              approvalRemarks: "",
              rejectionReason: "",
              attachment: "",
            });

            dispatch(
              getAllUnbillList({
                page,
                size: rowsPerPage,
                userId,
                status,
              }),
            );
            dispatch(getAllUnbillCount({ userId, status }));
            statusModal.onClose();
          } else {
            addToast({
              title: "ERROR",
              description:
                re?.payload?.data?.message ||
                re?.payload?.message ||
                "Failed to cancel unbill.",
              color: "danger",
            });
          }
        })
        .catch(() =>
          addToast({
            title: "ERROR",
            description: "Something went wrong !.",
            color: "danger",
          }),
        );
      return;
    }

    // if (selectedStatus === "APPROVED" && adminRole) {
    //   dispatch(
    //     approveUnBilledInvoiceByAdmin({
    //       id: rowItem?.id,
    //       userId,
    //       reason: updatedStatusData?.rejectionReason,
    //     }),
    //   )
    //     .then((re) => {
    //       if (re.meta.requestStatus === "fulfilled") {
    //         addToast({
    //           title: "SUCCESS",
    //           description: "Unbill approved successfully by Admin !.",
    //           color: "success",
    //         });

    //         setRowItem(null);
    //         setUpdatedStatusData({
    //           approverUserId: userId,
    //           approvalRemarks: "",
    //           rejectionReason: "",
    //           attachment: "",
    //         });

    //         dispatch(
    //           getAllUnbillList({
    //             page,
    //             size: rowsPerPage,
    //             userId,
    //             status,
    //           }),
    //         );
    //         dispatch(getAllUnbillCount({ userId, status }));
    //         statusModal.onClose();
    //       } else {
    //         addToast({
    //           title: "ERROR",
    //           description:
    //             re?.payload?.data?.message ||
    //             re?.payload?.message ||
    //             "Failed to cancel unbill.",
    //           color: "danger",
    //         });
    //       }
    //     })
    //     .catch(() =>
    //       addToast({
    //         title: "ERROR",
    //         description: "Something went wrong !.",
    //         color: "danger",
    //       }),
    //     );

    //   return;
    // }

    const payload = {
      approverUserId: updatedStatusData?.approverUserId,
      approvalRemarks: updatedStatusData?.approvalRemarks,
      rejectionReason: updatedStatusData?.rejectionReason,
    };

    dispatch(
      updateStatusForUnbill({
        unbilledId: rowItem?.id,
        data: payload,
      }),
    )
      .then((resp) => {
        if (resp.meta.requestStatus === "fulfilled") {
          addToast({
            title: "SUCCESS",
            description: "Status updated successfully !.",
            color: "success",
          });

          if (selectedStatus === "APPROVED") {
            const awaitingPaymentStatusId = getAwaitingPaymentStatusId();

            if (!awaitingPaymentStatusId) {
              addToast({
                title: "Awaiting Payment status not found",
                description: "Please check status master data.",
                color: "danger",
              });
            } else {
              dispatch(
                updateLeadStatus({
                  leadId: rowItem?.leadId,
                  userId,
                  statusId: awaitingPaymentStatusId,
                }),
              )
                .then((resp) => {
                  if (resp.meta.requestStatus === "fulfilled") {
                    addToast({
                      title: "SUCCESS",
                      description: "Payment approved successfully",
                      color: "success",
                    });
                  } else {
                    addToast({
                      title: "ERROR",
                      description:
                        resp?.payload?.data?.message ||
                        "Something went wrong in lead status update !.",
                      color: "danger",
                    });
                  }
                })
                .catch(() => {
                  addToast({
                    title: "ERROR",
                    description:
                      "Something went wrong in lead status update !.",
                    color: "danger",
                  });
                });
            }
          }

          dispatch(
            getAllUnbillList({ page, size: rowsPerPage, userId, status }),
          );
          dispatch(getAllUnbillCount({ userId, status }));

          setRowItem(null);
          setUpdatedStatusData({
            approverUserId: userId,
            approvalRemarks: "",
            rejectionReason: "",
            attachment: "",
          });

          statusModal.onClose();
        } else {
          addToast({
            title: "ERROR",
            description:
              resp?.payload?.data?.message ||
              resp?.payload?.message ||
              "Failed to update status.",
            color: "danger",
          });
        }
      })
      .catch(() =>
        addToast({
          title: "ERROR",
          description: "Something went wrong !.",
          color: "danger",
        }),
      );
  };
  const handleFetchReport = React.useCallback(async () => {
    const hasFromDate = Boolean(reportFilters.fromDate);
    const hasToDate = Boolean(reportFilters.toDate);

    if ((hasFromDate && !hasToDate) || (!hasFromDate && hasToDate)) {
      addToast({
        title: "Incomplete date range",
        description:
          "Please select both from date and to date, or leave both blank for all dates.",
        color: "danger",
      });
      return;
    }

    if (
      reportFilters.fromDate &&
      reportFilters.toDate &&
      dayjs(reportFilters.toDate).isBefore(dayjs(reportFilters.fromDate))
    ) {
      addToast({
        title: "Invalid date range",
        description: "To date cannot be earlier than from date.",
        color: "danger",
      });
      return;
    }

    setIsReportFetching(true);

    try {
      const payload = {
        userId,
        createdByUserId: reportFilters.createdByUserId || undefined,
        status:
          reportFilters.status !== "ALL" ? reportFilters.status : undefined,
        fromDate: reportFilters.fromDate || undefined,
        toDate: reportFilters.toDate || undefined,
      };

      console.log("Calling unbilled report API with filters:", payload);

      const resp = await dispatch(getUnbilledReport(payload));

      console.log("Unbilled report API response:", resp);

      if (resp.meta.requestStatus !== "fulfilled") {
        addToast({
          title: "Report fetch failed",
          description:
            resp?.payload?.message ||
            resp?.payload?.data?.message ||
            "Unable to fetch report data.",
          color: "danger",
        });
        return;
      }

      const reportRows = normalizeReportPayload(resp.payload);

      if (!reportRows.length) {
        addToast({
          title: "No records found",
          description: "No unbilled data found for the selected filters.",
          color: "warning",
        });
        return;
      }

      const csvContent = convertRowsToCsv(reportRows);

      const dateLabel =
        reportFilters.fromDate && reportFilters.toDate
          ? `${reportFilters.fromDate}-to-${reportFilters.toDate}`
          : "all-dates";

      const statusLabel =
        reportFilters.status && reportFilters.status !== "ALL"
          ? reportFilters.status
          : "all-status";

      const fileName = `unbilled-report-${statusLabel}-${dateLabel}.csv`;

      downloadCsvFile(csvContent, fileName);

      addToast({
        title: "Report downloaded",
        description: `${reportRows.length} record(s) exported successfully.`,
        color: "success",
      });

      setIsReportPopoverOpen(false);
    } catch (error) {
      console.error("Unbilled report frontend error:", error);

      addToast({
        title: "Something went wrong",
        description: error?.message || "Unable to generate report.",
        color: "danger",
      });
    } finally {
      setIsReportFetching(false);
    }
  }, [dispatch, reportFilters, userId]);

  const topContent = React.useMemo(() => {
    return (
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div className="flex w-full flex-col gap-2 sm:flex-row lg:max-w-[58%]">
            <Select
              className="w-full sm:max-w-[180px]"
              selectionMode="single"
              selectedKeys={[searchBy]}
              onSelectionChange={(e) => {
                let key = Array.from(e)[0];
                setSearchBy(key);
              }}
            >
              <SelectItem key={"companyName"}>Company name</SelectItem>
              <SelectItem key={"unbilledNumber"}>Unbilled number</SelectItem>
              <SelectItem key={"estimateNumber"}>Estimate number</SelectItem>
            </Select>

            <Input
              isClearable
              className="w-[50%]"
              placeholder="Search ..."
              startContent={<Search />}
              value={filterValue}
              onClear={() => onClear()}
              onValueChange={onSearchChange}
            />
          </div>

          <div className="flex w-full flex-wrap items-end gap-2 lg:w-auto lg:justify-end">
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
                <DropdownItem key="ALL">ALL</DropdownItem>
                <DropdownItem key="PENDING_APPROVAL">
                  PENDING_APPROVAL
                </DropdownItem>
                <DropdownItem key="APPROVED">APPROVED</DropdownItem>
                <DropdownItem key="REJECTED">REJECTED</DropdownItem>
                <DropdownItem key="CANCELLED">CANCELLED</DropdownItem>
                <DropdownItem key="CANCEL_REQUESTED">
                  CANCEL_REQUESTED
                </DropdownItem>
                <DropdownItem key="CANCEL_REJECTED">
                  CANCEL_REJECTED
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
            {adminRole && (
              <>
                <Popover
                  isOpen={isReportPopoverOpen}
                  onOpenChange={setIsReportPopoverOpen}
                  placement="bottom-end"
                  showArrow
                >
                  <PopoverTrigger>
                    <Button
                      color="primary"
                      variant="flat"
                      startContent={<FileDown size={16} />}
                    >
                      Fetch Report
                    </Button>
                  </PopoverTrigger>

                  <PopoverContent className="w-[360px] p-0">
                    <div className="w-full p-4">
                      <div>
                        <p className="text-sm font-semibold text-gray-900">
                          Export unbilled report
                        </p>
                        <p className="mt-1 text-xs text-gray-500">
                          Select filters and download CSV report.
                        </p>
                      </div>

                      <div className="mt-4 grid grid-cols-1 gap-3">
                        <NewSelect
                          data={reportUserOptions}
                          label="Created By"
                          name="createdByUserId"
                          labelKey="fullName"
                          valueKey="id"
                          value={reportFilters.createdByUserId}
                          onChange={(selectedValue) => {
                            setReportFilters((prev) => ({
                              ...prev,
                              createdByUserId: selectedValue || "",
                            }));
                          }}
                        />

                        <Select
                          label="Status"
                          labelPlacement="outside"
                          size="sm"
                          selectedKeys={[reportFilters.status]}
                          onSelectionChange={(keys) => {
                            const selectedStatus = Array.from(keys)[0];

                            setReportFilters((prev) => ({
                              ...prev,
                              status: selectedStatus || "ALL",
                            }));
                          }}
                        >
                          <SelectItem key="ALL">All</SelectItem>
                          <SelectItem key="PENDING_APPROVAL">
                            PENDING_APPROVAL
                          </SelectItem>
                          <SelectItem key="APPROVED">APPROVED</SelectItem>
                          <SelectItem key="CANCELLED">CANCELLED</SelectItem>
                          <SelectItem key="REJECTED">REJECTED</SelectItem>
                          <SelectItem key="REFUNDED">REFUNDED</SelectItem>
                        </Select>

                        <Input
                          type="date"
                          label="From date"
                          labelPlacement="outside"
                          size="sm"
                          value={reportFilters.fromDate}
                          max={reportFilters.toDate || undefined}
                          onChange={(e) =>
                            setReportFilters((prev) => ({
                              ...prev,
                              fromDate: e.target.value,
                            }))
                          }
                        />

                        <Input
                          type="date"
                          label="To date"
                          labelPlacement="outside"
                          size="sm"
                          value={reportFilters.toDate}
                          min={reportFilters.fromDate || undefined}
                          onChange={(e) =>
                            setReportFilters((prev) => ({
                              ...prev,
                              toDate: e.target.value,
                            }))
                          }
                        />
                      </div>

                      <div className="mt-4 flex justify-end gap-2 border-t border-default-200 pt-3">
                        <Button
                          size="sm"
                          variant="light"
                          onPress={() =>
                            setReportFilters({
                              fromDate: "",
                              toDate: "",
                              status: "ALL",
                              createdByUserId: "",
                            })
                          }
                        >
                          Clear
                        </Button>

                        <Button
                          size="sm"
                          color="primary"
                          isLoading={isReportFetching}
                          startContent={
                            !isReportFetching && <FileDown size={15} />
                          }
                          onPress={handleFetchReport}
                        >
                          Download CSV
                        </Button>
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>
              </>
            )}
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
    searchBy,
    reportFilters,
    reportUserOptions,
    isReportFetching,
    handleFetchReport,
    isReportPopoverOpen,
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
        size="4xl"
        placement="top-center"
        backdrop="blur"
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                {isAdvanceInvoice ? "Advance Invoice" : "Unbill"}
              </ModalHeader>
              <ModalBody className="max-h-[75vh] overflow-auto">
                <UnbilledView
                  invoiceData={invoiceDetail}
                  heading={isAdvanceInvoice ? "Advance Invoice" : "Unbill"}
                />
              </ModalBody>
              <ModalFooter>
                <Button
                  color="danger"
                  variant="light"
                  onPress={() => {
                    onClose();
                    setIsAdvanceInvoice(false);
                  }}
                >
                  Close
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
                  selectedKeys={
                    updatedStatusData?.approvalRemarks
                      ? [updatedStatusData?.approvalRemarks]
                      : []
                  }
                  onSelectionChange={(e) => {
                    const key = Array.from(e)[0];

                    setUpdatedStatusData((prev) => ({
                      ...prev,
                      approvalRemarks: key,
                      rejectionReason:
                        key === "REJECTED" || key === "CANCELLED"
                          ? prev.rejectionReason
                          : "",
                      attachment: key === "CANCELLED" ? prev.attachment : "",
                    }));
                  }}
                >
                  {[
                    { key: "APPROVED", label: "APPROVED" },
                    { key: "REJECTED", label: "REJECTED" },
                    { key: "CANCELLED", label: "CANCELLED" },
                  ].map((item) => (
                    <SelectItem key={item.key}>{item.label}</SelectItem>
                  ))}
                </Select>

                {(updatedStatusData?.approvalRemarks === "REJECTED" ||
                  updatedStatusData?.approvalRemarks === "CANCELLED") && (
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

                {updatedStatusData?.approvalRemarks === "CANCELLED" &&
                  !adminRole && (
                    <FileUploader
                      value={updatedStatusData?.attachment}
                      onChange={(uploadedUrl) =>
                        setUpdatedStatusData((prev) => ({
                          ...prev,
                          attachment: uploadedUrl,
                        }))
                      }
                      onUploadingChange={setIsCancelAttachmentUploading}
                      label="Attachment"
                      placeholder="Upload cancellation attachment"
                      isRequired
                    />
                  )}
              </ModalBody>

              <ModalFooter>
                <Button
                  color="danger"
                  variant="light"
                  onPress={() => {
                    setUpdatedStatusData({
                      approverUserId: userId,
                      approvalRemarks: "",
                      rejectionReason: "",
                      attachment: "",
                    });
                    setRowItem(null);
                    onClose();
                  }}
                >
                  Close
                </Button>

                <Button color="primary" onPress={handleUpdateStatus}>
                  Submit
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      <Modal
        size="4xl"
        isDismissable={false}
        isKeyboardDismissDisabled={true}
        isOpen={viewModal.isOpen}
        onOpenChange={viewModal.onOpenChange}
        placement="top-center"
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalBody className="max-h-[70vh] overflow-auto">
                <NewEstimatePreview
                  details={estimateDetail}
                  viewType={viewType}
                />
              </ModalBody>
              <ModalFooter className="flex justify-end">
                <Button onPress={onClose}>Cancel</Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
      <Modal
        size="4xl"
        isDismissable={false}
        isKeyboardDismissDisabled={true}
        isOpen={govtFeeModal.isOpen}
        onOpenChange={govtFeeModal.onOpenChange}
        placement="top-center"
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="border-b border-default-200 bg-gradient-to-r from-blue-50 via-white to-indigo-50 px-6 py-4">
                <div className="flex w-full items-start justify-between gap-4">
                  <div>
                    <h2 className="text-lg font-semibold tracking-tight text-default-900">
                      Government Fee Details
                    </h2>
                    <p className="mt-1 text-sm text-default-500">
                      Complete fee summary, payment details, and audit
                      information
                    </p>
                  </div>

                  <div className="flex flex-col items-end gap-2">
                    <Chip
                      color="primary"
                      variant="flat"
                      size="sm"
                      className="font-medium capitalize"
                    >
                      {govtFeeDetail?.status || "NA"}
                    </Chip>
                    <span className="rounded-full bg-default-100 px-3 py-1 text-xs font-medium text-default-600">
                      Ref: {govtFeeDetail?.feeReferenceNumber || "NA"}
                    </span>
                  </div>
                </div>
              </ModalHeader>

              <ModalBody className="max-h-[75vh] space-y-6 overflow-y-auto bg-gradient-to-br from-white via-default-50/40 to-blue-50/30 px-6 py-5">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  <div className="rounded-2xl border border-blue-200 bg-gradient-to-br from-blue-50 to-white p-4 shadow-sm">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-blue-600">
                      Total Amount
                    </p>
                    <p className="mt-2 text-xl font-bold text-default-900">
                      {inrCurrency(govtFeeDetail?.totalAmount)}
                    </p>
                  </div>
                </div>

                <div className="rounded-2xl border border-default-200 bg-white/90 p-5 shadow-sm">
                  <h3 className="mb-4 text-sm font-semibold uppercase tracking-[0.12em] text-default-600">
                    Estimate Information
                  </h3>

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div className="rounded-xl border border-default-200 bg-default-50 p-4">
                      <p className="text-[11px] uppercase tracking-[0.12em] text-default-500">
                        Estimate Number
                      </p>
                      <p className="mt-1 text-sm font-semibold text-default-900">
                        {govtFeeDetail?.estimateNumber || "NA"}
                      </p>
                    </div>

                    <div className="rounded-xl border border-default-200 bg-default-50 p-4">
                      <p className="text-[11px] uppercase tracking-[0.12em] text-default-500">
                        Unbilled Number
                      </p>
                      <p className="mt-1 text-sm font-semibold text-default-900">
                        {govtFeeDetail?.unbilledNumber || "NA"}
                      </p>
                    </div>

                    <div className="rounded-xl border border-default-200 bg-default-50 p-4">
                      <p className="text-[11px] uppercase tracking-[0.12em] text-default-500">
                        Company
                      </p>
                      <p className="mt-1 text-sm font-semibold text-default-900">
                        {govtFeeDetail?.companyName || "NA"}
                      </p>
                    </div>

                    <div className="rounded-xl border border-default-200 bg-default-50 p-4">
                      <p className="text-[11px] uppercase tracking-[0.12em] text-default-500">
                        Unit
                      </p>
                      <p className="mt-1 text-sm font-semibold text-default-900">
                        {govtFeeDetail?.unitName || "NA"}
                      </p>
                    </div>

                    <div className="rounded-xl border border-default-200 bg-default-50 p-4 md:col-span-2">
                      <p className="text-[11px] uppercase tracking-[0.12em] text-default-500">
                        Contact
                      </p>
                      <p className="mt-1 text-sm font-semibold text-default-900">
                        {govtFeeDetail?.contactName || "NA"}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border border-default-200 bg-white/90 p-5 shadow-sm">
                  <h3 className="mb-4 text-sm font-semibold uppercase tracking-[0.12em] text-default-600">
                    Fee Details
                  </h3>

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div className="rounded-xl border border-default-200 bg-default-50 p-4">
                      <p className="text-[11px] uppercase tracking-[0.12em] text-default-500">
                        Fee Ref No.
                      </p>
                      <p className="mt-1 text-sm font-semibold text-default-900">
                        {govtFeeDetail?.feeReferenceNumber || "NA"}
                      </p>
                    </div>

                    <div className="rounded-xl border border-default-200 bg-default-50 p-4">
                      <p className="text-[11px] uppercase tracking-[0.12em] text-default-500">
                        Department
                      </p>
                      <p className="mt-1 text-sm font-semibold text-default-900">
                        {govtFeeDetail?.departmentName || "NA"}
                      </p>
                    </div>

                    <div className="rounded-xl border border-default-200 bg-default-50 p-4">
                      <p className="text-[11px] uppercase tracking-[0.12em] text-default-500">
                        Fee Type
                      </p>
                      <p className="mt-1 text-sm font-semibold text-default-900">
                        {govtFeeDetail?.feeType || "NA"}
                      </p>
                    </div>

                    <div className="rounded-xl border border-default-200 bg-default-50 p-4">
                      <p className="text-[11px] uppercase tracking-[0.12em] text-default-500">
                        Payment Date
                      </p>
                      <p className="mt-1 text-sm font-semibold text-default-900">
                        {govtFeeDetail?.paymentDate
                          ? dayjs(govtFeeDetail.paymentDate).format(
                              "DD-MM-YYYY",
                            )
                          : "NA"}
                      </p>
                    </div>

                    <div className="rounded-xl border border-default-200 bg-default-50 p-4">
                      <p className="text-[11px] uppercase tracking-[0.12em] text-default-500">
                        Due Date
                      </p>
                      <p className="mt-1 text-sm font-semibold text-default-900">
                        {govtFeeDetail?.dueDate
                          ? dayjs(govtFeeDetail.dueDate).format("DD-MM-YYYY")
                          : "NA"}
                      </p>
                    </div>

                    <div className="rounded-xl border border-default-200 bg-default-50 p-4">
                      <p className="text-[11px] uppercase tracking-[0.12em] text-default-500">
                        Status
                      </p>
                      <div className="mt-2">
                        <Chip
                          color="primary"
                          variant="flat"
                          size="sm"
                          className="capitalize"
                        >
                          {govtFeeDetail?.status || "NA"}
                        </Chip>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border border-amber-200 bg-gradient-to-r from-amber-50 to-yellow-50 p-5 shadow-sm">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-amber-700">
                    Remarks
                  </p>
                  <p className="mt-2 text-sm font-medium leading-6 text-default-800">
                    {govtFeeDetail?.remarks || "NA"}
                  </p>
                </div>

                <div className="rounded-2xl border border-default-200 bg-white/90 p-5 shadow-sm">
                  <h3 className="mb-4 text-sm font-semibold uppercase tracking-[0.12em] text-default-600">
                    Audit Information
                  </h3>

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                    <div className="rounded-xl border border-default-200 bg-default-50 p-4">
                      <p className="text-[11px] uppercase tracking-[0.12em] text-default-500">
                        Created By
                      </p>
                      <p className="mt-1 text-sm font-semibold text-default-900">
                        {govtFeeDetail?.createdByName || "NA"}
                      </p>
                    </div>

                    <div className="rounded-xl border border-default-200 bg-default-50 p-4">
                      <p className="text-[11px] uppercase tracking-[0.12em] text-default-500">
                        Created At
                      </p>
                      <p className="mt-1 text-sm font-semibold text-default-900">
                        {govtFeeDetail?.createdAt
                          ? dayjs(govtFeeDetail.createdAt).format(
                              "DD-MM-YYYY HH:mm",
                            )
                          : "NA"}
                      </p>
                    </div>

                    <div className="rounded-xl border border-default-200 bg-default-50 p-4">
                      <p className="text-[11px] uppercase tracking-[0.12em] text-default-500">
                        Updated At
                      </p>
                      <p className="mt-1 text-sm font-semibold text-default-900">
                        {govtFeeDetail?.updatedAt
                          ? dayjs(govtFeeDetail.updatedAt).format(
                              "DD-MM-YYYY HH:mm",
                            )
                          : "NA"}
                      </p>
                    </div>
                  </div>
                </div>
              </ModalBody>

              <ModalFooter className="border-t border-default-200 bg-white px-6 py-4">
                <Button
                  variant="light"
                  onPress={onClose}
                  className="rounded-xl px-6 font-medium"
                >
                  Close
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      <Modal
        size="4xl"
        isDismissable={false}
        isKeyboardDismissDisabled={true}
        isOpen={tdsModal.isOpen}
        onOpenChange={tdsModal.onOpenChange}
        placement="top-center"
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="border-b border-default-200 bg-gradient-to-r from-blue-50 via-white to-indigo-50 px-6 py-4">
                <div className="flex w-full items-start justify-between gap-4">
                  <div>
                    <h2 className="text-lg font-semibold tracking-tight text-default-900">
                      TDS Details
                    </h2>
                    <p className="mt-1 text-sm text-default-500">
                      TDS deduction summary with estimate, unbilled invoice, and
                      audit information
                    </p>
                  </div>

                  <div className="flex flex-col items-end gap-2">
                    <Chip
                      color={
                        tdsDetail?.status === "PENDING"
                          ? "warning"
                          : tdsDetail?.status === "APPROVED"
                            ? "success"
                            : tdsDetail?.status === "REJECTED"
                              ? "danger"
                              : "primary"
                      }
                      variant="flat"
                      size="sm"
                      className="font-medium capitalize"
                    >
                      {tdsDetail?.status || "NA"}
                    </Chip>

                    <span className="rounded-full bg-default-100 px-3 py-1 text-xs font-medium text-default-600">
                      TDS ID: {tdsDetail?.id || "NA"}
                    </span>
                  </div>
                </div>
              </ModalHeader>

              <ModalBody className="max-h-[75vh] space-y-6 overflow-y-auto bg-gradient-to-br from-white via-default-50/40 to-blue-50/30 px-6 py-5">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  <div className="rounded-2xl border border-blue-200 bg-gradient-to-br from-blue-50 to-white p-4 shadow-sm">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-blue-600">
                      Taxable Amount
                    </p>
                    <p className="mt-2 text-xl font-bold text-default-900">
                      {inrCurrency(tdsDetail?.taxableAmount)}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-amber-200 bg-gradient-to-br from-amber-50 to-white p-4 shadow-sm">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-amber-600">
                      TDS Percentage
                    </p>
                    <p className="mt-2 text-xl font-bold text-default-900">
                      {tdsDetail?.tdsPercentage !== undefined &&
                      tdsDetail?.tdsPercentage !== null
                        ? `${Number(tdsDetail.tdsPercentage).toFixed(2)}%`
                        : "NA"}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-green-200 bg-gradient-to-br from-green-50 to-white p-4 shadow-sm">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-green-600">
                      TDS Amount
                    </p>
                    <p className="mt-2 text-xl font-bold text-default-900">
                      {inrCurrency(tdsDetail?.tdsAmount)}
                    </p>
                  </div>
                </div>

                <div className="rounded-2xl border border-default-200 bg-white/90 p-5 shadow-sm">
                  <h3 className="mb-4 text-sm font-semibold uppercase tracking-[0.12em] text-default-600">
                    Estimate & Invoice Information
                  </h3>

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div className="rounded-xl border border-default-200 bg-default-50 p-4">
                      <p className="text-[11px] uppercase tracking-[0.12em] text-default-500">
                        Estimate ID
                      </p>
                      <p className="mt-1 text-sm font-semibold text-default-900">
                        {tdsDetail?.estimateId || "NA"}
                      </p>
                    </div>

                    <div className="rounded-xl border border-default-200 bg-default-50 p-4">
                      <p className="text-[11px] uppercase tracking-[0.12em] text-default-500">
                        Estimate Number
                      </p>
                      <p className="mt-1 text-sm font-semibold text-default-900">
                        {tdsDetail?.estimateNumber || "NA"}
                      </p>
                    </div>

                    <div className="rounded-xl border border-default-200 bg-default-50 p-4">
                      <p className="text-[11px] uppercase tracking-[0.12em] text-default-500">
                        Unbilled Invoice ID
                      </p>
                      <p className="mt-1 text-sm font-semibold text-default-900">
                        {tdsDetail?.unbilledInvoiceId || "NA"}
                      </p>
                    </div>

                    <div className="rounded-xl border border-default-200 bg-default-50 p-4">
                      <p className="text-[11px] uppercase tracking-[0.12em] text-default-500">
                        Unbilled Number
                      </p>
                      <p className="mt-1 text-sm font-semibold text-default-900">
                        {tdsDetail?.unbilledNumber || "NA"}
                      </p>
                    </div>

                    <div className="rounded-xl border border-default-200 bg-default-50 p-4 md:col-span-2">
                      <p className="text-[11px] uppercase tracking-[0.12em] text-default-500">
                        Public UUID
                      </p>
                      <p className="mt-1 break-all text-sm font-semibold text-default-900">
                        {tdsDetail?.publicUuid || "NA"}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border border-default-200 bg-white/90 p-5 shadow-sm">
                  <h3 className="mb-4 text-sm font-semibold uppercase tracking-[0.12em] text-default-600">
                    TDS Status
                  </h3>

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                    <div className="rounded-xl border border-default-200 bg-default-50 p-4">
                      <p className="text-[11px] uppercase tracking-[0.12em] text-default-500">
                        Status
                      </p>
                      <div className="mt-2">
                        <Chip
                          color={
                            tdsDetail?.status === "PENDING"
                              ? "warning"
                              : tdsDetail?.status === "APPROVED"
                                ? "success"
                                : tdsDetail?.status === "REJECTED"
                                  ? "danger"
                                  : "primary"
                          }
                          variant="flat"
                          size="sm"
                          className="capitalize"
                        >
                          {tdsDetail?.status || "NA"}
                        </Chip>
                      </div>
                    </div>

                    <div className="rounded-xl border border-default-200 bg-default-50 p-4">
                      <p className="text-[11px] uppercase tracking-[0.12em] text-default-500">
                        Created By ID
                      </p>
                      <p className="mt-1 text-sm font-semibold text-default-900">
                        {tdsDetail?.createdById || "NA"}
                      </p>
                    </div>

                    <div className="rounded-xl border border-default-200 bg-default-50 p-4">
                      <p className="text-[11px] uppercase tracking-[0.12em] text-default-500">
                        Created By
                      </p>
                      <p className="mt-1 text-sm font-semibold text-default-900">
                        {tdsDetail?.createdByName || "NA"}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border border-default-200 bg-white/90 p-5 shadow-sm">
                  <h3 className="mb-4 text-sm font-semibold uppercase tracking-[0.12em] text-default-600">
                    Audit Information
                  </h3>

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div className="rounded-xl border border-default-200 bg-default-50 p-4">
                      <p className="text-[11px] uppercase tracking-[0.12em] text-default-500">
                        Created At
                      </p>
                      <p className="mt-1 text-sm font-semibold text-default-900">
                        {tdsDetail?.createdAt
                          ? dayjs(tdsDetail.createdAt).format(
                              "DD-MM-YYYY HH:mm",
                            )
                          : "NA"}
                      </p>
                    </div>

                    <div className="rounded-xl border border-default-200 bg-default-50 p-4">
                      <p className="text-[11px] uppercase tracking-[0.12em] text-default-500">
                        Updated At
                      </p>
                      <p className="mt-1 text-sm font-semibold text-default-900">
                        {tdsDetail?.updatedAt
                          ? dayjs(tdsDetail.updatedAt).format(
                              "DD-MM-YYYY HH:mm",
                            )
                          : "NA"}
                      </p>
                    </div>
                  </div>
                </div>
              </ModalBody>

              <ModalFooter className="border-t border-default-200 bg-white px-6 py-4">
                <Button
                  variant="light"
                  onPress={onClose}
                  className="rounded-xl px-6 font-medium"
                >
                  Close
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      <Modal
        isOpen={creditNoteModal.isOpen}
        onOpenChange={creditNoteModal.onOpenChange}
        placement="top-center"
        backdrop="blur"
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                Credit Note
                <span className="text-xs font-normal text-gray-500">
                  {creditNoteRow?.unbilledNumber
                    ? `Unbilled No: ${creditNoteRow.unbilledNumber}`
                    : ""}
                </span>
              </ModalHeader>

              <ModalBody className="max-h-[85vh] overflow-auto">
                <Input
                  type="number"
                  label="Refund Amount"
                  placeholder="Enter refund amount"
                  isRequired
                  min={0}
                  value={creditNoteData.refundAmount}
                  onChange={(e) =>
                    setCreditNoteData((prev) => ({
                      ...prev,
                      refundAmount: e.target.value,
                    }))
                  }
                />

                <Textarea
                  label="Reason"
                  placeholder="Enter reason for credit note"
                  isRequired
                  minRows={4}
                  value={creditNoteData.reason}
                  onChange={(e) =>
                    setCreditNoteData((prev) => ({
                      ...prev,
                      reason: e.target.value,
                    }))
                  }
                />
                <FileUploader
                  value={creditNoteData.attachment}
                  onChange={(uploadedUrl) =>
                    setCreditNoteData((prev) => ({
                      ...prev,
                      attachment: uploadedUrl,
                    }))
                  }
                  onUploadingChange={setIsCreditNoteAttachmentUploading}
                  label="Attachment"
                  placeholder="Upload Credit Note attachment"
                  isRequired
                />
              </ModalBody>

              <ModalFooter>
                <Button
                  color="danger"
                  variant="light"
                  onPress={() => {
                    onClose();
                    setCreditNoteRow(null);
                    setCreditNoteData({
                      refundAmount: "",
                      reason: "",
                      attachment: "",
                    });
                  }}
                >
                  Close
                </Button>

                <Button color="primary" onPress={handleCreateCreditNote}>
                  Submit
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      <Modal
        size="5xl"
        isOpen={paymentProofModal.isOpen}
        onOpenChange={paymentProofModal.onOpenChange}
        placement="top-center"
        backdrop="blur"
      >
        <ModalContent>
          {(onClose) => {
            const attachmentType = getAttachmentType(selectedPaymentProof);
            const fileName = getAttachmentFileName(selectedPaymentProof);

            return (
              <>
                <ModalHeader className="flex flex-col gap-1">
                  Payment Proof
                  <span className="text-xs font-normal text-gray-500 break-all">
                    {fileName}
                  </span>
                </ModalHeader>

                <ModalBody className="max-h-[78vh] overflow-auto">
                  {!selectedPaymentProof ? (
                    <div className="rounded-xl border border-default-200 p-6 text-center text-sm text-default-500">
                      No payment proof available.
                    </div>
                  ) : attachmentType === "image" ? (
                    <div className="flex justify-center rounded-xl border border-default-200 bg-default-50 p-3">
                      <img
                        src={selectedPaymentProof}
                        alt="Payment Proof"
                        className="max-h-[70vh] max-w-full rounded-lg object-contain"
                      />
                    </div>
                  ) : attachmentType === "pdf" ? (
                    <object
                      data={selectedPaymentProof}
                      type="application/pdf"
                      className="h-[72vh] w-full rounded-xl border border-default-200"
                    >
                      <div className="rounded-xl border border-default-200 p-6 text-center">
                        <p className="text-sm text-default-600">
                          PDF preview is not available in this browser.
                        </p>
                        <Button
                          className="mt-3"
                          color="primary"
                          variant="flat"
                          startContent={<ExternalLink size={15} />}
                          onPress={() =>
                            window.open(
                              selectedPaymentProof,
                              "_blank",
                              "noopener,noreferrer",
                            )
                          }
                        >
                          Open Proof
                        </Button>
                      </div>
                    </object>
                  ) : attachmentType === "text" ? (
                    <object
                      data={selectedPaymentProof}
                      type="text/plain"
                      className="h-[72vh] w-full rounded-xl border border-default-200 bg-white"
                    >
                      <div className="rounded-xl border border-default-200 p-6 text-center">
                        <p className="text-sm text-default-600">
                          Text preview is not available.
                        </p>
                        <Button
                          className="mt-3"
                          color="primary"
                          variant="flat"
                          startContent={<ExternalLink size={15} />}
                          onPress={() =>
                            window.open(
                              selectedPaymentProof,
                              "_blank",
                              "noopener,noreferrer",
                            )
                          }
                        >
                          Open Proof
                        </Button>
                      </div>
                    </object>
                  ) : (
                    <div className="rounded-xl border border-default-200 p-6 text-center">
                      <Paperclip className="mx-auto mb-3 text-default-400" />
                      <p className="text-sm font-medium text-default-700">
                        Preview is not available for this file type.
                      </p>
                      <p className="mt-1 break-all text-xs text-default-500">
                        {selectedPaymentProof}
                      </p>
                      <Button
                        className="mt-4"
                        color="primary"
                        variant="flat"
                        startContent={<ExternalLink size={15} />}
                        onPress={() =>
                          window.open(
                            selectedPaymentProof,
                            "_blank",
                            "noopener,noreferrer",
                          )
                        }
                      >
                        Open Proof
                      </Button>
                    </div>
                  )}
                </ModalBody>

                <ModalFooter>
                  {selectedPaymentProof && (
                    <Button
                      variant="flat"
                      startContent={<ExternalLink size={15} />}
                      onPress={() =>
                        window.open(
                          selectedPaymentProof,
                          "_blank",
                          "noopener,noreferrer",
                        )
                      }
                    >
                      Open in New Tab
                    </Button>
                  )}

                  <Button color="danger" variant="light" onPress={onClose}>
                    Close
                  </Button>
                </ModalFooter>
              </>
            );
          }}
        </ModalContent>
      </Modal>
    </>
  );
};

export default Unbill;
