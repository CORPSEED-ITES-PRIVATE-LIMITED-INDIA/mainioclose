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
import {
  ChevronDown,
  EllipsisVertical,
  ExternalLink,
  Paperclip,
  Search,
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { inrCurrency, splitTextIntoTwoLines } from "../../common";
import dayjs from "dayjs";
import { Link, useParams } from "react-router-dom";
import UnbilledView from "../../components/UnbilledView";
import {
  getEstimateByEstimateId,
  updateLeadStatus,
} from "../../toolkit/slices/leadSlice";
import NewEstimatePreview from "../../sales/leads/leadEstimate/NewEstimatePreview";
import {
  getAllInvoice,
  getAllUnbillCount,
  getAllUnbillList,
  searchUnbilledByCompanyNameAndUnbilled,
} from "../../toolkit/slices/organizationSlice";
import {
  createCreditNotes,
  getInvoicesByUnbilledId,
  getTdsDetailByEstimateId,
} from "../../toolkit/slices/accountSlice";
import FileUploader from "../../components/FileUploader";
import NewSelect from "../../components/NewSelect";

export const columns = [
  { name: "DATE", uid: "date" },
  { name: "ESTIMATE NUMBER", uid: "estimateNumber" },
  { name: "UNBILL NO. / ADVANCE INVOICE", uid: "unbillNo" },
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
  { name: "ADDED BY", uid: "addedBy" },
  { name: "PAYMENT PROOF", uid: "paymentProof" },
  { name: "ACTIONS", uid: "actions" },
];

export function capitalize(s) {
  return s ? s.charAt(0).toUpperCase() + s.slice(1).toLowerCase() : "";
}

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
  "addedBy",
  "paymentProof",
  "actions",
];

const SalesUnbill = () => {
  const dispatch = useDispatch();
  const { userId } = useParams();
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const statusModal = useDisclosure();
  const creditNoteModal = useDisclosure();
  const viewModal = useDisclosure();
  const govtFeeModal = useDisclosure();
  const tdsModal = useDisclosure();
  const paymentProofModal = useDisclosure();
  const userRole = useSelector((state) => state.auth.currentUser?.roles);
  const invoices = useSelector((state) => state.account.invoicesByUnbilled);
  const adminRole = userRole.includes("ADMIN");
  const department = useSelector(
    (state) => state?.auth?.getDepartmentDetail?.department,
  );
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
  const [isAdvanceInvoice, setIsAdvanceInvoice] = useState(false);
  const [searchBy, setSearchBy] = useState("companyName");
  const [estimateDetail, setEstimateDetail] = useState(null);
  const [viewType, setViewType] = useState("ESTIMATE");
  const [govtFeeDetail, setGovtFeeDetail] = useState();
  const [tdsDetail, setTdsDetail] = useState();
  const initialCreditNoteData = {
    refundAmount: "",
    reason: "",
    attachment: "",
    invoiceIds: [],

    bankName: "",
    bankAccountNumber: "",
    confirmBankAccountNumber: "",
    ifscCode: "",
    swiftCode: "",
    accountHolderName: "",
    cancelledChequeAttachment: "",
  };
  const [creditNoteData, setCreditNoteData] = useState(initialCreditNoteData);
  const [creditNoteRow, setCreditNoteRow] = useState(null);
  const [selectedPaymentProof, setSelectedPaymentProof] = useState("");
  const [isCreditNoteAttachmentUploading, setIsCreditNoteAttachmentUploading] =
    useState(false);

  const [isCancelledChequeUploading, setIsCancelledChequeUploading] =
    useState(false);

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

    if (!creditNoteData.invoiceIds?.length) {
      addToast({
        title: "Invoice is required",
        description: "Please select at least one invoice.",
        color: "danger",
      });
      return;
    }

    if (isCreditNoteAttachmentUploading) {
      addToast({
        title: "Credit note attachment upload in progress",
        description: "Please wait until upload is completed.",
        color: "warning",
      });
      return;
    }

    if (!creditNoteData.attachment) {
      addToast({
        title: "Credit note attachment is required",
        color: "danger",
      });
      return;
    }

    if (!creditNoteData.bankName?.trim()) {
      addToast({
        title: "Bank name is required",
        color: "danger",
      });
      return;
    }

    if (!creditNoteData.accountHolderName?.trim()) {
      addToast({
        title: "Account holder name is required",
        color: "danger",
      });
      return;
    }

    if (!creditNoteData.bankAccountNumber?.trim()) {
      addToast({
        title: "Bank account number is required",
        color: "danger",
      });
      return;
    }

    if (!/^[0-9]{9,18}$/.test(creditNoteData.bankAccountNumber.trim())) {
      addToast({
        title: "Invalid bank account number",
        description: "Bank account number must be 9 to 18 digits.",
        color: "danger",
      });
      return;
    }

    if (!creditNoteData.confirmBankAccountNumber?.trim()) {
      addToast({
        title: "Confirm bank account number is required",
        color: "danger",
      });
      return;
    }

    if (
      creditNoteData.bankAccountNumber.trim() !==
      creditNoteData.confirmBankAccountNumber.trim()
    ) {
      addToast({
        title: "Bank account number mismatch",
        description:
          "Bank account number and confirm account number must match.",
        color: "danger",
      });
      return;
    }

    if (!creditNoteData.ifscCode?.trim()) {
      addToast({
        title: "IFSC code is required",
        color: "danger",
      });
      return;
    }

    // if (
    //   !/^[A-Z]{4}0[A-Z0-9]{6}$/.test(
    //     creditNoteData.ifscCode.trim().toUpperCase(),
    //   )
    // ) {
    //   addToast({
    //     title: "Invalid IFSC code",
    //     description: "Please enter valid IFSC code. Example: HDFC0001234",
    //     color: "danger",
    //   });
    //   return;
    // }

    if (
      creditNoteData.swiftCode?.trim() &&
      !/^[A-Z0-9]{8}([A-Z0-9]{3})?$/.test(
        creditNoteData.swiftCode.trim().toUpperCase(),
      )
    ) {
      addToast({
        title: "Invalid SWIFT code",
        description: "SWIFT code must be 8 or 11 characters.",
        color: "danger",
      });
      return;
    }

    if (isCancelledChequeUploading) {
      addToast({
        title: "Cancelled cheque upload in progress",
        description: "Please wait until upload is completed.",
        color: "warning",
      });
      return;
    }

    if (!creditNoteData.cancelledChequeAttachment) {
      addToast({
        title: "Cancelled cheque is required",
        description: "Please upload cancelled cheque attachment.",
        color: "danger",
      });
      return;
    }

    const payload = {
      unbilledId: creditNoteRow?.id,
      estimateNumber: creditNoteRow?.estimateNumber,
      createdByUserId: Number(userId),
      refundAmount: Number(creditNoteData.refundAmount),
      reason: creditNoteData.reason.trim(),
      attachment: creditNoteData.attachment,
      invoiceIds: creditNoteData.invoiceIds || [],

      bankName: creditNoteData.bankName.trim(),
      bankAccountNumber: creditNoteData.bankAccountNumber.trim(),
      ifscCode: creditNoteData.ifscCode.trim().toUpperCase(),
      swiftCode: creditNoteData.swiftCode?.trim()
        ? creditNoteData.swiftCode.trim().toUpperCase()
        : null,
      accountHolderName: creditNoteData.accountHolderName.trim(),
      cancelledChequeAttachment: creditNoteData.cancelledChequeAttachment,
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
        setCreditNoteData(initialCreditNoteData);

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
        className={`text-[12.5px] capitalize leading-5 ${className}`}
        style={{ maxWidth }}
      >
        {lines.map((line, index) => (
          <p key={index} className="whitespace-nowrap text-[12.5px]">
            {line}
          </p>
        ))}
      </div>
    );
  };

  const renderCell = React.useCallback(
    (rowData, columnKey) => {
      const cellValue = rowData[columnKey];
      switch (columnKey) {
        case "date":
          return (
            <div className="flex flex-col gap-1">
              <p className="text-[12.5px] capitalize">
                {dayjs(rowData?.date).format("DD-MM-YYYY")}
              </p>
              <Chip
                size="sm"
                variant="flat"
                className="w-fit"
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
        case "estimateNumber":
          return (
            <div>
              <p
                className="capitalize text-[12.5px] font-medium text-blue-600 cursor-pointer"
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
                className={`capitalize text-[12.5px] font-medium ${rowData?.governmentFeeActiveFlag == true ? "text-blue-600 cursor-pointer" : "text-gray-500 cursor-not-allowed"}`}
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
            <div className="w-full  max-w-[130px] rounded-md px-3 py-2">
              {rowData?.tdsActiveFlag === true && (
                <div className="mt-2 space-y-1 text-[11.5px]">
                  <div className="flex items-center gap-3">
                    <span className="whitespace-nowrap font-semibold text-gray-900">
                      ₹ {rowData?.tdsResponseDto?.tdsAmount ?? 0}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="whitespace-nowrap font-semibold text-gray-400">
                      {rowData?.tdsResponseDto?.tdsPercentage ?? 0}%
                    </span>
                  </div>
                </div>
              )}
            </div>
          );
        case "unbillNo":
          return (
            <Link
              to={`${rowData?.id}/invoices`}
              className="text-[12.5px] capitalize font-medium"
            >
              {`${rowData?.unbilledNumber}`}
              {rowData?.advanceInvoiceFlag
                ? ` / ${rowData?.advanceInvoiceNumber}`
                : ``}{" "}
            </Link>
          );
        case "service":
          return renderTwoLineText(rowData?.solutionName, "220px");

        case "companyName":
          return (
            <>
              {renderTwoLineText(
                rowData?.companyName || rowData?.company,
                "220px",
              )}
              <Chip
                size="sm"
                variant="flat"
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
              {renderTwoLineText(rowData?.unitName, "220px")}
              <Chip
                size="sm"
                variant="flat"
                color={
                  rowData?.unitStatus === "APPROVED"
                    ? "success"
                    : rowData?.unitStatus === "REJECTED"
                      ? "danger"
                      : "warning"
                }
              >
                {rowData?.unitStatus}
              </Chip>
            </div>
          );
        case "totalAmount":
          return (
            <p className="text-[12.5px] capitalize">
              {inrCurrency(rowData?.totalAmount)}
            </p>
          );
        case "receivedAmount":
          return (
            <p className="text-[12.5px] capitalize">
              {inrCurrency(rowData?.receivedAmount)}
            </p>
          );
        case "currentReceivedAmount":
          return (
            <p className="text-[12.5px] capitalize">
              {inrCurrency(rowData?.currentReceivedAmount)}
            </p>
          );
        case "outstandingAmount":
          return (
            <p className="text-[12.5px] capitalize">
              {inrCurrency(rowData?.outstandingAmount)}
            </p>
          );
        case "addedBy":
          return renderTwoLineText(rowData?.createdByName, "220px");
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
                  <Button isIconOnly size="sm" variant="light">
                    <EllipsisVertical className="w-4 h-4 text-default-300" />
                  </Button>
                </DropdownTrigger>
                <DropdownMenu>
                  {rowData?.status === "APPROVED" && (
                    <DropdownItem
                      key="credit-note"
                      onPress={() => {
                        dispatch(
                          getInvoicesByUnbilledId({
                            userId: Number(userId),
                            unbilledId: rowData?.id,
                            page: 1,
                            size: 100,
                          }),
                        );

                        setCreditNoteRow(rowData);
                        setCreditNoteData(initialCreditNoteData);
                        creditNoteModal.onOpen();
                      }}
                    >
                      Credit Note
                    </DropdownItem>
                  )}
                </DropdownMenu>
              </Dropdown>
            </div>
          );

        default:
          return cellValue;
      }
    },
    [
      dispatch,
      userId,
      page,
      rowsPerPage,
      status,
      creditNoteModal,
      handleViewEstimate,
    ],
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

  const topContent = React.useMemo(() => {
    return (
      <div className="flex flex-col gap-2">
        <div className="flex justify-between gap-2 items-center flex-wrap">
          <div className="flex items-center gap-1.5 w-full sm:max-w-[360px]">
            <Select
              size="sm"
              className="max-w-[160px] shrink-0"
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
              size="sm"
              className="w-full"
              classNames={{ inputWrapper: "h-8 min-h-8" }}
              placeholder="Search ..."
              startContent={<Search className="w-4 h-4 text-default-400" />}
              value={filterValue}
              onClear={() => onClear()}
              onValueChange={onSearchChange}
            />
          </div>
          <div className="flex gap-1.5 flex-wrap">
            <Dropdown>
              <DropdownTrigger>
                <Button
                  className="capitalize"
                  variant="flat"
                  endContent={<ChevronDown className="w-3.5 h-3.5" />}
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
                <DropdownItem key="CANCELLED">CANCELLED</DropdownItem>
              </DropdownMenu>
            </Dropdown>
            <Dropdown>
              <DropdownTrigger>
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
            Total {count} unbilled items
          </span>
          <div className="flex gap-4">
            <label className="flex items-center gap-1 text-default-400 text-[12.5px]">
              Rows per page:
              <select
                className="bg-transparent outline-hidden text-default-400 text-[12.5px] cursor-pointer"
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
  ]);

  const bottomContent = React.useMemo(() => {
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
    <div className="flex flex-col gap-2">
      <h1 className="font-sans text-lg font-semibold mb-2 shrink-0">
        Unbilled list
      </h1>
      <Table
        isHeaderSticky
        removeWrapper={false}
        aria-label="Sales unbilled table with custom cells, pagination and sorting"
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
        size="4xl"
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

              <ModalBody className="max-h-[65vh] overflow-auto">
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                  <Input
                    type="number"
                    label="Refund Amount (Excluding Taxes)"
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

                  <NewSelect
                    data={invoices || []}
                    labelKey="invoiceNumber"
                    label="Invoice Ids"
                    placeholder="Select Invoice Ids"
                    isRequired
                    selectionMode="multiple"
                    valueKey="id"
                    value={creditNoteData.invoiceIds}
                    onChange={(value) =>
                      setCreditNoteData((prev) => ({
                        ...prev,
                        invoiceIds: Array.isArray(value)
                          ? value.map(Number)
                          : value
                            ? [Number(value)]
                            : [],
                      }))
                    }
                  />

                  <Input
                    label="Bank Name"
                    placeholder="Enter client bank name"
                    isRequired
                    value={creditNoteData.bankName}
                    onChange={(e) =>
                      setCreditNoteData((prev) => ({
                        ...prev,
                        bankName: e.target.value,
                      }))
                    }
                  />

                  <Input
                    label="Company Name"
                    placeholder="Enter company name"
                    isRequired
                    value={creditNoteData.accountHolderName}
                    onChange={(e) =>
                      setCreditNoteData((prev) => ({
                        ...prev,
                        accountHolderName: e.target.value,
                      }))
                    }
                  />

                  <Input
                    type="text"
                    label="Bank Account Number"
                    placeholder="Enter bank account number"
                    isRequired
                    value={creditNoteData.bankAccountNumber}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, "");

                      setCreditNoteData((prev) => ({
                        ...prev,
                        bankAccountNumber: value,
                      }));
                    }}
                  />

                  <Input
                    type="text"
                    label="Confirm Bank Account Number"
                    placeholder="Re-enter bank account number"
                    isRequired
                    value={creditNoteData.confirmBankAccountNumber}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, "");

                      setCreditNoteData((prev) => ({
                        ...prev,
                        confirmBankAccountNumber: value,
                      }));
                    }}
                    color={
                      creditNoteData.confirmBankAccountNumber &&
                      creditNoteData.bankAccountNumber !==
                        creditNoteData.confirmBankAccountNumber
                        ? "danger"
                        : "default"
                    }
                    errorMessage={
                      creditNoteData.confirmBankAccountNumber &&
                      creditNoteData.bankAccountNumber !==
                        creditNoteData.confirmBankAccountNumber
                        ? "Account number does not match"
                        : ""
                    }
                    isInvalid={
                      Boolean(creditNoteData.confirmBankAccountNumber) &&
                      creditNoteData.bankAccountNumber !==
                        creditNoteData.confirmBankAccountNumber
                    }
                  />

                  <Input
                    label="IFSC Code"
                    placeholder="Example: HDFC0001234"
                    isRequired
                    maxLength={11}
                    value={creditNoteData.ifscCode}
                    onChange={(e) =>
                      setCreditNoteData((prev) => ({
                        ...prev,
                        ifscCode: e.target.value.toUpperCase(),
                      }))
                    }
                  />

                  <Input
                    label="SWIFT Code"
                    placeholder="Optional"
                    maxLength={11}
                    value={creditNoteData.swiftCode}
                    onChange={(e) =>
                      setCreditNoteData((prev) => ({
                        ...prev,
                        swiftCode: e.target.value.toUpperCase(),
                      }))
                    }
                  />

                  <div className="md:col-span-2">
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
                  </div>

                  <div className="md:col-span-2">
                    <FileUploader
                      value={creditNoteData.attachment}
                      onChange={(value) =>
                        setCreditNoteData((prev) => ({
                          ...prev,
                          attachment: value,
                        }))
                      }
                      onUploadingChange={setIsCreditNoteAttachmentUploading}
                      label="Escalation Team Approval Attachment"
                      placeholder="Upload credit note attachment"
                      isRequired
                    />
                  </div>

                  <div className="md:col-span-2">
                    <FileUploader
                      value={creditNoteData.cancelledChequeAttachment}
                      onChange={(value) =>
                        setCreditNoteData((prev) => ({
                          ...prev,
                          cancelledChequeAttachment: value,
                        }))
                      }
                      onUploadingChange={setIsCancelledChequeUploading}
                      label="Cancelled Cheque Attachment"
                      placeholder="Upload cancelled cheque"
                      isRequired
                    />
                  </div>
                </div>
              </ModalBody>

              <ModalFooter>
                <Button
                  color="danger"
                  variant="light"
                  onPress={() => {
                    onClose();
                    setCreditNoteRow(null);
                    setCreditNoteData(initialCreditNoteData);
                  }}
                >
                  Close
                </Button>

                <Button
                  color="primary"
                  onPress={handleCreateCreditNote}
                  isDisabled={
                    isCreditNoteAttachmentUploading ||
                    isCancelledChequeUploading
                  }
                >
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
    </div>
  );
};

export default SalesUnbill;
