import {
  addToast,
  Badge,
  Button,
  Chip,
  DateRangePicker,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Pagination,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Select,
  SelectItem,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
  Textarea,
  useDisclosure,
} from "@heroui/react";
import { ChevronDown, EllipsisVertical, Search } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import {
  getAllEstimateByUserId,
  getEstimateByEstimateId,
  getTotalCountOfEstimate,
  searchEstimate,
  updateLeadStatus,
} from "../../toolkit/slices/leadSlice";
import dayjs from "dayjs";
import { inrCurrency, statusColorCode } from "../../common";
import {
  createAdvanceTaxInvoiceRequest,
  createPaymentRegister,
  fetchEstimateReport,
} from "../../toolkit/slices/accountSlice";
import EstimatePaymentRegister from "./EstimatePaymentRegister";
import {
  estimateSentToClient,
  getBasicCompanyDetailByCompanyId,
  getCompanyDetailByCompanyIdAndUnitId,
} from "../../toolkit/slices/companySlice";
import FullCompanyDetailsForm from "../company/FullCompanyDetailsForm";
import { parseDate, parseZonedDateTime } from "@internationalized/date";
import NewEstimatePreview from "../leads/leadEstimate/NewEstimatePreview";
import TaxInvoice from "../../components/TaxInvoice";
import { getAllStatusData } from "../../toolkit/slices/settingSlice";

const bankRequiredPaymentModes = ["UPI", "ONLINE", "BANK_TRANSFER"];

const columns = [
  { name: "ID", uid: "id", sortable: true },
  { name: "ESTIMATE NO./ PI NO.", uid: "estimateNumber" },
  { name: "SOLUTION NAME", uid: "solutionName" },
  { name: "COMPANY", uid: "companyName" },
  { name: "UNIT NAME", uid: "unitName" },
  { name: "ESTIMATE STATUS", uid: "status" },
  { name: "CREATED DATE", uid: "createDate" },
  { name: "GST NUMBER", uid: "gstNo" },
  { name: "PRIMARY CONTACT", uid: "primaryContact" },
  { name: "SECONDARY CONTACT", uid: "secondaryContact" },
  { name: "PAYMENT TERM", uid: "paymentTypeCode" },
  { name: "AMOUNT", uid: "amount" },
  { name: "INVOICE NOTE", uid: "invoiceNote" },
  { name: "ADDRESS", uid: "address" },
  { name: "ACTIONS", uid: "actions" },
];

const ESTIMATE_STATUS = [
  "DRAFT",
  "SENT_TO_CLIENT",
  "VIEWED",
  "APPROVED",
  "REJECTED",
  "CANCELLED",
  "EXPIRED",
];

function capitalize(s) {
  return s ? s.charAt(0).toUpperCase() + s.slice(1).toLowerCase() : "";
}

function isPurchaseOrderEstimate(estimate) {
  const possibleValues = [
    estimate?.paymentTypeCode,
    estimate?.paymentTypeName,
    estimate?.paymentType?.code,
    estimate?.paymentType?.name,
  ];

  return possibleValues.some((value) => {
    const normalized = String(value || "")
      .trim()
      .toLowerCase();

    return (
      normalized === "purchase_order" ||
      (normalized.includes("purchase") && normalized.includes("order"))
    );
  });
}

const INITIAL_VISIBLE_COLUMNS = [
  "estimateNumber",
  "solutionName",
  "companyName",
  "unitName",
  "status",
  "createDate",
  "gstNo",
  "paymentTypeCode",
  "amount",
  "professionalFees",
  "actions",
];

const Estimate = () => {
  const dispatch = useDispatch();
  const { userId } = useParams();
  const viewModal = useDisclosure();
  const paymentModal = useDisclosure();
  const advanceTaxInvoiceModal = useDisclosure();
  const reportModal = useDisclosure();
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const count = useSelector((state) => state.leads.totalEstimateCount);
  const data = useSelector((state) => state.leads.estimateList);
  const statusList = useSelector((state) => state?.setting?.statusList);

  const [filterValue, setFilterValue] = useState("");
  const [selectedKeys, setSelectedKeys] = useState(new Set([]));
  const [estimateDetail, setEstimateDetail] = useState(null);
  const [visibleColumns, setVisibleColumns] = useState(
    new Set(INITIAL_VISIBLE_COLUMNS),
  );
  const [activeEstimateId, setActiveEstimateId] = useState(null);
  const [estimateItem, setEstimateItem] = useState(null);

  const [advanceTaxInvoiceEstimate, setAdvanceTaxInvoiceEstimate] =
    useState(null);
  const [advanceTaxInvoiceAmount, setAdvanceTaxInvoiceAmount] = useState("");
  const [advanceTaxInvoiceRemarks, setAdvanceTaxInvoiceRemarks] = useState("");
  const [isAdvanceTaxInvoiceSubmitting, setIsAdvanceTaxInvoiceSubmitting] =
    useState(false);
  const paymentTypes = useMemo(
    () => [
      { id: 1, name: "Advance" },
      { id: 2, name: "Partial" },
      { id: 3, name: "Full" },
    ],
    [],
  );
  const [sortDescriptor, setSortDescriptor] = useState({
    column: "age",
    direction: "ascending",
  });
  const [filteration, setFilteration] = useState({
    page: 1,
    size: 50,
  });
  const [filters, setFilters] = useState({
    search: "",
    status: "",
    fromDate: "",
    toDate: "",
  });
  const [viewType, setViewType] = useState("ESTIMATE");

  const hasSearchFilter = Boolean(filterValue);

  const [reportFilters, setReportFilters] = useState({
    fromDate: "",
    toDate: "",
    status: "",
    minAmount: "",
    maxAmount: "",
    companyId: "",
    companyName: "",
  });

  useEffect(() => {
    dispatch(
      getAllEstimateByUserId({
        userId,
        page: filteration.page,
        size: filteration.size,
        data: {
          search: filters.search || "",
          status: filters.status || "",
          fromDate: filters.fromDate || "",
          toDate: filters.toDate || "",
        },
      }),
    );

    dispatch(
      getTotalCountOfEstimate({
        userId,
        data: {
          search: filters.search || "",
          status: filters.status || "",
          fromDate: filters.fromDate || "",
          toDate: filters.toDate || "",
        },
      }),
    );
  }, [dispatch, userId]);

  const headerColumns = useMemo(() => {
    if (visibleColumns === "all") return columns;
    return columns.filter((column) =>
      Array.from(visibleColumns).includes(column.uid),
    );
  }, [visibleColumns]);

  const pages = Math.ceil(count / filteration?.size) || 1;

  const sortedItems = useMemo(() => {
    return [...data];
    // .sort((a, b) => {
    //   const first = a[sortDescriptor.column];
    //   const second = b[sortDescriptor.column];
    //   const cmp = first < second ? -1 : first > second ? 1 : 0;
    //   return sortDescriptor.direction === "descending" ? -cmp : cmp;
    // });
  }, [sortDescriptor, data]);

  const handleApplyFilter = () => {
    dispatch(
      getAllEstimateByUserId({
        userId,
        page: filteration.page,
        size: filteration.size,
        data: {
          search: filters.search || "",
          status: filters.status || "",
          fromDate: filters.fromDate || "",
          toDate: filters.toDate || "",
        },
      }),
    );

    dispatch(
      getTotalCountOfEstimate({
        userId,
        data: {
          search: filters.search || "",
          status: filters.status || "",
          fromDate: filters.fromDate || "",
          toDate: filters.toDate || "",
        },
      }),
    );
  };

  const handleViewEstimate = (rowData, type) => {
    setViewType(type);
    dispatch(getEstimateByEstimateId({ estimateId: rowData?.id, userId }))
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

  const handleSentToClient = async (rowData) => {
    try {
      const sentResp = await dispatch(
        estimateSentToClient({ estimateId: rowData?.id, userId }),
      );

      if (sentResp.meta.requestStatus !== "fulfilled") {
        addToast({
          title: `ERROR ${sentResp?.payload?.data?.status || ""}`,
          description:
            sentResp?.payload?.data?.message || "Estimate sent failed.",
          color: "danger",
        });
        return;
      }

      const statusResp = await dispatch(getAllStatusData());

      if (statusResp.meta.requestStatus !== "fulfilled") {
        addToast({
          title: "Status fetch failed",
          description: "Unable to fetch lead status list.",
          color: "danger",
        });
        return;
      }

      const list = statusResp?.payload || statusList || [];

      const awaitingPaymentStatus = list.find(
        (item) =>
          String(item?.name || item?.statusName || "")
            .trim()
            .toLowerCase() === "awaiting payment",
      );

      if (!awaitingPaymentStatus?.id) {
        addToast({
          title: "Status not found",
          description: "Awaiting Payment status not found in status list.",
          color: "danger",
        });
        return;
      }

      await dispatch(
        updateLeadStatus({
          leadId: rowData?.leadId,
          statusId: awaitingPaymentStatus.id,
          userId,
        }),
      ).unwrap();

      addToast({
        title: "SUCCESS",
        description:
          "Estimate sent and lead status updated to Awaiting Payment.",
        color: "success",
      });
    } catch (error) {
      addToast({
        title: "Something went wrong!",
        description: error?.message || "Estimate sent/status update failed.",
        color: "danger",
      });
    }
  };

  const resetAdvanceTaxInvoiceForm = () => {
    setAdvanceTaxInvoiceEstimate(null);
    setAdvanceTaxInvoiceAmount("");
    setAdvanceTaxInvoiceRemarks("");
    setIsAdvanceTaxInvoiceSubmitting(false);
  };

  const closeAdvanceTaxInvoiceModal = () => {
    advanceTaxInvoiceModal.onClose();
    resetAdvanceTaxInvoiceForm();
  };

  const handleOpenAdvanceTaxInvoice = (rowData) => {
    if (
      rowData?.company?.onboardingStatus === "MINIMAL" ||
      rowData?.unit?.onboardingStatus === "MINIMAL"
    ) {
      addToast({
        title: "Please update the full company detail first.",
        color: "danger",
      });
      return;
    }

    if (rowData?.status === "CANCELLED") {
      addToast({
        title: "Advance Tax Invoice cannot be raised for a cancelled estimate.",
        color: "danger",
      });
      return;
    }

    setAdvanceTaxInvoiceEstimate(rowData);
    setAdvanceTaxInvoiceAmount("");
    setAdvanceTaxInvoiceRemarks("");
    advanceTaxInvoiceModal.onOpen();
  };

  const handleSubmitAdvanceTaxInvoice = async () => {
    if (!advanceTaxInvoiceEstimate?.id) {
      addToast({
        title: "Estimate is required",
        color: "danger",
      });
      return;
    }

    const purchaseOrderConversion = isPurchaseOrderEstimate(
      advanceTaxInvoiceEstimate,
    );

    const numericAmount = Number(advanceTaxInvoiceAmount);

    if (
      !purchaseOrderConversion &&
      (!advanceTaxInvoiceAmount ||
        Number.isNaN(numericAmount) ||
        numericAmount <= 0)
    ) {
      addToast({
        title: "Requested amount must be greater than zero",
        color: "danger",
      });
      return;
    }

    const payload = {
      estimateId: Number(advanceTaxInvoiceEstimate.id),
      requestedByUserId: Number(userId),
      requestRemarks: advanceTaxInvoiceRemarks.trim(),
    };

    /*
     * Completed zero-value PURCHASE_ORDER conversion:
     * requestedAmount must not be sent. Backend calculates the
     * complete remaining invoiceable amount automatically.
     */
    if (!purchaseOrderConversion) {
      payload.requestedAmount = numericAmount;
    }

    try {
      setIsAdvanceTaxInvoiceSubmitting(true);

      const response = await dispatch(createAdvanceTaxInvoiceRequest(payload));

      if (response?.meta?.requestStatus !== "fulfilled") {
        addToast({
          title: "Failed to raise Advance Tax Invoice request",
          description:
            response?.payload?.message ||
            response?.payload?.data?.message ||
            "Something went wrong",
          color: "danger",
        });
        return;
      }

      addToast({
        title: "SUCCESS",
        description:
          response?.payload?.message ||
          "Advance Tax Invoice request raised successfully.",
        color: "success",
      });

      closeAdvanceTaxInvoiceModal();
      handleApplyFilter();
    } catch (error) {
      addToast({
        title: "Failed to raise Advance Tax Invoice request",
        description:
          error?.response?.data?.message ||
          error?.message ||
          "Something went wrong",
        color: "danger",
      });
    } finally {
      setIsAdvanceTaxInvoiceSubmitting(false);
    }
  };

  const downloadCSV = (rows = [], fileName = "estimate-report.csv") => {
    if (!rows.length) {
      addToast({
        title: "No report data found",
        color: "warning",
      });
      return;
    }

    const csvHeaders = [
      "Estimate No",
      "PI No",
      "Lead ID",
      "Solution Name",
      "Solution Type",
      "Status",
      "Estimate Date",
      "Valid Until",
      "Company Name",
      "Company PAN",
      "Company Status",
      "Unit Name",
      "GST No",
      "City",
      "State",
      "Sub Total",
      "GST Amount",
      "Grand Total",
      "Created By",
      "Created At",
    ];

    const csvRows = rows.map((item) => [
      item?.estimateNumber || "",
      item?.performanceInvoiceNumber || "",
      item?.leadId || "",
      item?.solutionName || "",
      item?.solutionType || "",
      item?.status || "",
      item?.estimateDate || "",
      item?.validUntil || "",
      item?.company?.name || "",
      item?.company?.panNo || "",
      item?.company?.onboardingStatus || "",
      item?.unit?.unitName || "",
      item?.unit?.gstNo || "",
      item?.unit?.city || "",
      item?.unit?.state || "",
      item?.subTotalExGst || 0,
      item?.totalGstAmount || 0,
      item?.grandTotal || 0,
      item?.createdByName || "",
      item?.createdAt || "",
    ]);

    const csvContent = [csvHeaders, ...csvRows]
      .map((row) =>
        row
          .map((value) => `"${String(value).replaceAll('"', '""')}"`)
          .join(","),
      )
      .join("\n");

    const blob = new Blob([csvContent], {
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

  const handleFetchReport = () => {
    const payload = {
      userId: Number(userId || 0),
      page: 0,
      size: 1000,
    };

    // conditional fields
    if (reportFilters.fromDate) payload.fromDate = reportFilters.fromDate;
    if (reportFilters.toDate) payload.toDate = reportFilters.toDate;
    if (reportFilters.status) payload.status = reportFilters.status;

    if (reportFilters.minAmount)
      payload.minAmount = Number(reportFilters.minAmount);

    if (reportFilters.maxAmount)
      payload.maxAmount = Number(reportFilters.maxAmount);

    if (reportFilters.companyId)
      payload.companyId = Number(reportFilters.companyId);

    if (reportFilters.companyName?.trim())
      payload.companyName = reportFilters.companyName.trim();

    dispatch(fetchEstimateReport(payload)).then((resp) => {
      if (resp.meta.requestStatus === "fulfilled") {
        const rows = resp?.payload?.content || [];

        downloadCSV(
          rows,
          `estimate-report-${dayjs().format("DD-MM-YYYY-HH-mm")}.csv`,
        );

        reportModal.onClose();

        addToast({
          title: "CSV report downloaded successfully",
          color: "success",
        });
      } else {
        addToast({
          title: "Failed to fetch report",
          description: resp?.payload?.data?.message || "Something went wrong",
          color: "danger",
        });
      }
    });
  };

  const renderCell = useCallback((rowData, columnKey) => {
    switch (columnKey) {
      case "estimateNumber":
        return (
          <div className="flex flex-col items-start">
            <span className="text-[12.5px]">{rowData?.estimateNumber}</span>
            {rowData?.performanceInvoiceFlag && (
              <span className="text-[11.5px] text-default-500">
                / {rowData?.performanceInvoiceNumber}
              </span>
            )}
          </div>
        );
      case "solutionName":
        return (
          <div className="flex flex-col items-start gap-0.5">
            <span className="font-normal text-[12.5px]">
              {rowData?.solutionName}
            </span>
            {rowData?.solutionType && (
              <Chip size="sm" variant="flat" className="text-[11.5px]">
                {rowData?.solutionType}
              </Chip>
            )}
          </div>
        );
      case "companyName":
        return (
          <div className="flex flex-col gap-0.5">
            <span className="font-normal text-[12.5px]">
              {rowData?.company?.name}
            </span>
            <Chip
              size="sm"
              variant="flat"
              className="text-[11.5px] w-fit"
              color={statusColorCode[rowData?.company?.onboardingStatus]}
            >
              {rowData?.company?.onboardingStatus}
            </Chip>
          </div>
        );
      case "unitName":
        return (
          <div className="flex flex-col gap-1">
            <span className="font-normal text-[12.5px]">
              {rowData?.unit?.unitName}
            </span>

            {rowData?.unit?.gstRegistrationType && (
              <span className="text-[11.5px] text-default-500">
                GST Type: {rowData.unit.gstRegistrationType}
              </span>
            )}

            <Chip
              size="sm"
              variant="flat"
              className="text-[11.5px] w-fit"
              color={statusColorCode[rowData?.unit?.onboardingStatus]}
            >
              {rowData?.unit?.onboardingStatus}
            </Chip>
          </div>
        );
      case "status":
        return (
          <Chip
            size="sm"
            variant="flat"
            className="text-[11.5px]"
            color={statusColorCode[rowData?.status]}
          >
            {rowData?.status}
          </Chip>
        );
      case "createDate":
        return (
          <div className="flex flex-col">
            <span className="font-normal text-[12.5px]">
              {dayjs(rowData?.estimateDate).format("DD-MM-YYYY")}
            </span>
            <span className="font-normal text-[11.5px] text-default-500">
              Valid till : {dayjs(rowData?.validUntil).format("DD-MM-YYYY")}
            </span>
          </div>
        );
      case "gstNo":
        return (
          <div className="flex flex-col gap-1">
            <span className="font-normal text-[12.5px]">
              {rowData?.unit?.gstNo || "-"}
            </span>
            {rowData?.panNo && (
              <span className="text-[11.5px] text-default-500">
                Pan : {rowData?.panNo}
              </span>
            )}
          </div>
        );
      case "amount":
        return (
          <div className="flex flex-col">
            <span className="font-medium text-[12.5px]">
              {inrCurrency(rowData?.subTotalExGst || 0) || "-"}
            </span>
            {rowData?.totalGstAmount && (
              <span className="text-[11.5px] text-default-500">
                GST : {inrCurrency(rowData?.totalGstAmount) || "-"}
              </span>
            )}
            {rowData?.quantity && (
              <span className="text-[11.5px] text-default-500">
                Quantity : {rowData?.quantity || "-"} kg
              </span>
            )}
          </div>
        );

      case "professionalFees":
        return (
          <div className="flex flex-col">
            <span className="font-medium text-[12.5px]">
              {inrCurrency(rowData?.professionalFees || 0) || "-"}
            </span>
            <span className="text-[11.5px] text-default-500">
              GST : {inrCurrency(rowData?.profesionalGst) || "-"}
            </span>
          </div>
        );
      case "govermentfees":
        return (
          <div className="flex flex-col">
            <span className="font-medium text-[12.5px]">
              {inrCurrency(rowData?.govermentfees || 0) || "-"}
            </span>
            <span className="text-[11.5px] text-default-500">
              GST : {inrCurrency(rowData?.govermentGst) || "-"}
            </span>
          </div>
        );
      case "serviceCharge":
        return (
          <div className="flex flex-col">
            <span className="font-medium text-[12.5px]">
              {inrCurrency(rowData?.serviceCharge || 0) || "-"}
            </span>
            <span className="text-[11.5px] text-default-500">
              GST : {inrCurrency(rowData?.serviceGst) || "-"}
            </span>
          </div>
        );
      case "otherFees":
        return (
          <div className="flex flex-col">
            <span className="font-medium text-[12.5px]">
              {inrCurrency(rowData?.otherFees || 0) || "-"}
            </span>
            <span className="text-[11.5px] text-default-500">
              GST : {inrCurrency(rowData?.otherGst) || "-"}
            </span>
          </div>
        );
      case "invoiceNote":
        return (
          <div className="flex items-start gap-2">
            <span className="text-[11.5px]">{rowData?.invoiceNote}</span>
          </div>
        );
      case "primaryContact":
        return (
          <div className="flex flex-col">
            <span className="font-semibold text-[12.5px]">
              {rowData.primaryContact?.name || "-"}
            </span>
            <span className="text-[11.5px] text-default-500">
              {rowData?.primaryContact?.emails || "-"}
            </span>
            <span className="text-[11.5px] text-default-500">
              {rowData?.primaryContact?.contactNo || "-"},
              {rowData?.primaryContact?.contactNo || "-"}
            </span>
          </div>
        );
      case "secondaryContact":
        return (
          <div className="flex flex-col">
            <span className="font-semibold text-[12.5px]">
              {rowData.secondaryContact?.name || "-"}
            </span>
            <span className="text-[11.5px] text-default-500">
              {rowData?.secondaryContact?.emails || "-"}
            </span>
            <span className="text-[11.5px] text-default-500">
              {rowData?.secondaryContact?.contactNo || "-"},
              {rowData?.secondaryContact?.contactNo || "-"}
            </span>
          </div>
        );
      case "address":
        return (
          <div className="flex flex-col">
            <span className="font-semibold text-[12.5px]">
              {rowData?.unit?.addressLine1 || "-"}
            </span>
            <span className="text-[11.5px] text-default-500">
              {rowData?.unit?.city || ""},{rowData?.unit?.state},
              {rowData?.unit?.country}
            </span>
          </div>
        );
      case "actions":
        return (
          <div className="relative flex justify-center items-center gap-2">
            <Dropdown>
              <DropdownTrigger>
                <Button isIconOnly size="sm" variant="light">
                  <EllipsisVertical className="w-4 h-4" />
                </Button>
              </DropdownTrigger>
              <DropdownMenu
                selectionMode="single"
                onSelectionChange={(e) => {
                  let item = Array.from(e)[0];
                  if (item === "paymentRegister") {
                    if (
                      rowData?.company?.onboardingStatus === "MINIMAL" ||
                      rowData?.unit?.onboardingStatus === "MINIMAL"
                    ) {
                      addToast({
                        title: "Please update the full company detail !.",
                        color: "danger",
                      });
                    } else {
                      setActiveEstimateId(rowData?.id);
                      setEstimateItem(rowData);
                      paymentModal.onOpen();
                    }
                  } else if (item === "advanceTaxInvoice") {
                    handleOpenAdvanceTaxInvoice(rowData);
                  } else if (item === "viewEstimate") {
                    handleViewEstimate(rowData, "ESTIMATE");
                  } else if (item === "viewPI") {
                    handleViewEstimate(rowData, "PI");
                  } else if (item === "SENT_TO_CLIENT") {
                    handleSentToClient(rowData);
                  } else if (item === "updateCompanyDetail") {
                    dispatch(
                      getCompanyDetailByCompanyIdAndUnitId({
                        companyId: rowData?.company?.id,
                        unitId: rowData?.unit?.id,
                      }),
                    ).then((resp) => {
                      if (resp.meta.requestStatus === "fulfilled") {
                        onOpen();
                      } else {
                        addToast({
                          title:
                            resp?.payload ||
                            "There is some issue in fetching company details !.",
                          color: "danger",
                        });
                      }
                    });
                  }
                }}
              >
                {(rowData?.company?.onboardingStatus !== "APPROVED" ||
                  rowData?.unit?.onboardingStatus !== "APPROVED") && (
                  <DropdownItem key="updateCompanyDetail">
                    Update company detail
                  </DropdownItem>
                )}

                {rowData?.status !== "CANCELLED" && (
                  <DropdownItem key="paymentRegister">
                    Add payment register
                  </DropdownItem>
                )}

                {rowData?.status !== "CANCELLED" && (
                  <DropdownItem key="advanceTaxInvoice">
                    Raise Advance Tax Invoice
                  </DropdownItem>
                )}

                <DropdownItem key="viewEstimate">View estimate</DropdownItem>
                <DropdownItem key="viewPI">View PI</DropdownItem>
                <DropdownItem key="SENT_TO_CLIENT">SENT_TO_CLIENT</DropdownItem>
                {/* <DropdownItem key="delete" color="danger">
                  Delete
                </DropdownItem>  */}
              </DropdownMenu>
            </Dropdown>
          </div>
        );
      default:
        return rowData[columnKey] || "-";
    }
  }, []);

  const onNextPage = useCallback(() => {
    if (filteration?.page < pages) {
      setFilteration((prev) => ({ ...prev, page: prev.page + 1 }));
      dispatch(
        getAllEstimateByUserId({
          userId,
          page: prev.page + 1,
          size: filteration.size,
        }),
      );
    }
  }, [filteration, pages]);

  const onPreviousPage = useCallback(() => {
    if (filteration?.page > 1) {
      setFilteration((prev) => ({ ...prev, page: prev.page - 1 }));
      dispatch(
        getAllEstimateByUserId({
          userId,
          page: prev.page - 1,
          size: filteration.size,
        }),
      );
    }
  }, [filteration]);

  const onRowsPerPageChange = useCallback((e) => {
    setFilteration((prev) => ({
      ...prev,
      size: Number(e.target.value),
      page: 1,
    }));
  }, []);

  const onSearchChange = useCallback(
    (value) => {
      if (value) {
        console.log("search value", value);
        setFilterValue(value);
        setFilteration((prev) => ({ ...prev, page: 1 }));
        dispatch(searchEstimate({ userId, data: { query: value } })).then(
          (resp) => {
            if (resp.meta.requestStatus === "fulfilled") {
            } else {
              addToast({
                title: "There is some issue in searching estimate !.",
                color: "danger",
              });
            }
          },
        );
      } else {
        setFilterValue("");
        dispatch(
          getAllEstimateByUserId({
            userId,
            page: filteration.page,
            size: filteration.size,
          }),
        );

        dispatch(
          getTotalCountOfEstimate({
            userId,
          }),
        );
      }
    },
    [filteration],
  );

  const onClear = useCallback(() => {
    setFilterValue("");
    setFilteration((prev) => ({ ...prev, page: 1 }));
    dispatch(
      getAllEstimateByUserId({
        userId,
        page: filteration.page,
        size: filteration.size,
      }),
    );

    dispatch(
      getTotalCountOfEstimate({
        userId,
      }),
    );
  }, [filteration]);

  const topContent = useMemo(() => {
    return (
      <div className="flex flex-col gap-2">
        <div className="flex justify-between gap-2 items-center flex-wrap">
          <Input
            isClearable
            size="sm"
            className="w-full sm:max-w-[280px]"
            classNames={{ inputWrapper: "h-8 min-h-8" }}
            placeholder="Search..."
            startContent={<Search className="w-4 h-4 text-default-400" />}
            value={filterValue}
            onClear={onClear}
            onChange={(e) => onSearchChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                setFilteration((prev) => ({ ...prev, page: 1 }));
              }
            }}
          />
          <div className="flex gap-1.5 flex-wrap">
            <Popover placement="bottom-end">
              <PopoverTrigger>
                <Button
                  variant="flat"
                  endContent={<ChevronDown className="w-3.5 h-3.5" />}
                >
                  Filters
                </Button>
              </PopoverTrigger>
              <PopoverContent className="p-4">
                <div className="grid grid-cols-2 gap-2.5">
                  <DateRangePicker
                    showMonthAndYearPickers
                    hideTimeZone
                    label="Date range"
                    value={{
                      start: filters?.fromDate
                        ? parseDate(filters.fromDate)
                        : null,
                      end: filters?.toDate ? parseDate(filters.toDate) : null,
                    }}
                    onChange={(value) => {
                      const formattedStart = value?.start
                        ? `${value.start.year}-${String(value.start.month).padStart(2, "0")}-${String(value.start.day).padStart(2, "0")}`
                        : null;

                      const formattedEnd = value?.end
                        ? `${value.end.year}-${String(value.end.month).padStart(2, "0")}-${String(value.end.day).padStart(2, "0")}`
                        : null;

                      setFilters((prev) => ({
                        ...prev,
                        fromDate: formattedStart,
                        toDate: formattedEnd,
                      }));
                    }}
                  />

                  <Select
                    isRequired
                    errorMessage="please select rating for users"
                    label="Status"
                    items={ESTIMATE_STATUS?.map((stat) => ({
                      key: stat,
                      label: stat,
                    }))}
                    selectedKeys={
                      filters.status ? new Set([filters.status]) : new Set([])
                    }
                    onSelectionChange={(keys) => {
                      const selected = Array.from(keys)[0] || "";
                      setFilters((prev) => ({ ...prev, status: selected }));
                    }}
                  >
                    {(item) => (
                      <SelectItem key={item?.key}>{item?.label}</SelectItem>
                    )}
                  </Select>
                </div>
                <div className="w-full flex justify-end gap-2 mt-4">
                  <Button
                    variant="flat"
                    onPress={() => {
                      setFilters({
                        search: "",
                        status: "",
                        fromDate: "",
                        toDate: "",
                      });
                      dispatch(
                        getAllEstimateByUserId({
                          userId,
                          page: filteration.page,
                          size: filteration.size,
                          data: {
                            search: filters.search || "",
                            status: filters.status || "",
                            fromDate: filters.fromDate || "",
                            toDate: filters.toDate || "",
                          },
                        }),
                      );

                      dispatch(
                        getTotalCountOfEstimate({
                          userId,
                          data: {
                            search: filters.search || "",
                            status: filters.status || "",
                            fromDate: filters.fromDate || "",
                            toDate: filters.toDate || "",
                          },
                        }),
                      );
                    }}
                  >
                    Reset
                  </Button>

                  <Button color="primary" onPress={handleApplyFilter}>
                    Apply
                  </Button>
                </div>
              </PopoverContent>
            </Popover>
            <Button color="primary" variant="flat" onPress={reportModal.onOpen}>
              Fetch Report
            </Button>
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
            Total {count} estimate
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
    filters,
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
            dispatch(
              getAllEstimateByUserId({
                userId,
                page: e,
                size: filteration.size,
              }),
            );
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
    filteration,
    pages,
    onPreviousPage,
    onNextPage,
    dispatch,
  ]);

  return (
    <div className="flex flex-col gap-2">
      <h1 className="font-sans text-lg font-semibold mb-2 shrink-0">
        Estimate List
      </h1>
      <Table
        isHeaderSticky
        removeWrapper={false}
        aria-label="Estimate table with custom cells, pagination, and sorting"
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
        // onSelectionChange={(keys) => {
        //   setSelectedKeys(keys);
        // }}
        // onSortChange={setSortDescriptor}
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
            <TableRow key={item.id || item.companyId}>
              {(columnKey) => (
                <TableCell>{renderCell(item, columnKey)}</TableCell>
              )}
            </TableRow>
          )}
        </TableBody>
      </Table>
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
                {viewType === "PI" ? (
                  // PI is previewed on the same Tax Invoice shell used across
                  // the app (see TaxInvoice.jsx) — the estimate already
                  // carries the same organization/company-unit/lineItems
                  // fields that component expects, we only need to map the
                  // PI-specific number/date onto the invoice fields it reads.
                  <TaxInvoice
                    invoiceData={{
                      ...estimateDetail,
                      invoiceNumber: estimateDetail?.performanceInvoiceNumber,
                      invoiceDate: estimateDetail?.estimateDate,
                    }}
                    heading="PROFORMA INVOICE"
                  />
                ) : (
                  <NewEstimatePreview
                    details={estimateDetail}
                    viewType={viewType}
                  />
                )}
              </ModalBody>
              <ModalFooter className="flex justify-end">
                <Button onPress={onClose}>Cancel</Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      <EstimatePaymentRegister
        isOpen={paymentModal.isOpen}
        onOpenChange={paymentModal.onOpenChange}
        onClose={() => {
          paymentModal.onClose();
          setActiveEstimateId(null);
        }}
        estimateItem={estimateItem}
        estimateId={activeEstimateId}
        paymentTypes={paymentTypes}
        filteration={filteration}
        filters={filters}
        onSubmitPayment={(payload) => dispatch(createPaymentRegister(payload))}
      />

      <Modal
        size="2xl"
        isDismissable={false}
        isKeyboardDismissDisabled={true}
        isOpen={advanceTaxInvoiceModal.isOpen}
        onOpenChange={advanceTaxInvoiceModal.onOpenChange}
        placement="top-center"
      >
        <ModalContent>
          {() => {
            const purchaseOrderConversion = isPurchaseOrderEstimate(
              advanceTaxInvoiceEstimate,
            );

            return (
              <>
                <ModalHeader>Raise Advance Tax Invoice Request</ModalHeader>

                <ModalBody>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      label="Estimate Number"
                      value={advanceTaxInvoiceEstimate?.estimateNumber || ""}
                      isReadOnly
                    />

                    <Input
                      label="Estimate Total"
                      value={inrCurrency(
                        advanceTaxInvoiceEstimate?.grandTotal || 0,
                      )}
                      isReadOnly
                    />

                    {purchaseOrderConversion ? (
                      <div className="md:col-span-2 rounded-xl border border-warning-200 bg-warning-50 p-3 text-sm">
                        This Estimate uses the completed zero-value Purchase
                        Order flow. The backend will automatically request the
                        complete remaining invoiceable amount. Manual amount
                        entry is disabled.
                      </div>
                    ) : (
                      <Input
                        className="md:col-span-2"
                        type="number"
                        min={0.01}
                        step="0.01"
                        label="Requested Amount"
                        placeholder="Enter Advance Tax Invoice amount"
                        value={advanceTaxInvoiceAmount}
                        onKeyDown={(event) => {
                          if (["-", "+", "e", "E"].includes(event.key)) {
                            event.preventDefault();
                          }
                        }}
                        onChange={(event) => {
                          const value = event.target.value;

                          if (value === "") {
                            setAdvanceTaxInvoiceAmount("");
                            return;
                          }

                          if (Number(value) < 0) {
                            setAdvanceTaxInvoiceAmount("0");
                            return;
                          }

                          setAdvanceTaxInvoiceAmount(value);
                        }}
                        isRequired
                      />
                    )}

                    <Textarea
                      className="md:col-span-2"
                      label="Request Remarks"
                      placeholder="Enter reason for raising Advance Tax Invoice"
                      minRows={3}
                      maxLength={5000}
                      value={advanceTaxInvoiceRemarks}
                      onChange={(event) =>
                        setAdvanceTaxInvoiceRemarks(event.target.value)
                      }
                    />
                  </div>
                </ModalBody>

                <ModalFooter>
                  <Button
                    variant="flat"
                    onPress={closeAdvanceTaxInvoiceModal}
                    isDisabled={isAdvanceTaxInvoiceSubmitting}
                  >
                    Cancel
                  </Button>

                  <Button
                    color="primary"
                    onPress={handleSubmitAdvanceTaxInvoice}
                    isLoading={isAdvanceTaxInvoiceSubmitting}
                  >
                    Raise Request
                  </Button>
                </ModalFooter>
              </>
            );
          }}
        </ModalContent>
      </Modal>

      <FullCompanyDetailsForm
        isOpen={isOpen}
        onOpen={onOpen}
        onOpenChange={onOpenChange}
        filteration={filteration}
        filters={filters}
      />
      <Modal
        size="3xl"
        isOpen={reportModal.isOpen}
        onOpenChange={reportModal.onOpenChange}
        placement="top-center"
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader>Fetch Estimate Report</ModalHeader>

              <ModalBody>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <DateRangePicker
                    showMonthAndYearPickers
                    hideTimeZone
                    label="Date Range"
                    value={{
                      start: reportFilters.fromDate
                        ? parseDate(reportFilters.fromDate)
                        : null,
                      end: reportFilters.toDate
                        ? parseDate(reportFilters.toDate)
                        : null,
                    }}
                    onChange={(value) => {
                      const formattedStart = value?.start
                        ? `${value.start.year}-${String(
                            value.start.month,
                          ).padStart(
                            2,
                            "0",
                          )}-${String(value.start.day).padStart(2, "0")}`
                        : "";

                      const formattedEnd = value?.end
                        ? `${value.end.year}-${String(value.end.month).padStart(
                            2,
                            "0",
                          )}-${String(value.end.day).padStart(2, "0")}`
                        : "";

                      setReportFilters((prev) => ({
                        ...prev,
                        fromDate: formattedStart,
                        toDate: formattedEnd,
                      }));
                    }}
                  />

                  <Select
                    label="Status"
                    selectedKeys={
                      reportFilters.status
                        ? new Set([reportFilters.status])
                        : new Set([])
                    }
                    onSelectionChange={(keys) => {
                      const selected = Array.from(keys)[0] || "";
                      setReportFilters((prev) => ({
                        ...prev,
                        status: selected,
                      }));
                    }}
                  >
                    {ESTIMATE_STATUS.map((status) => (
                      <SelectItem key={status}>{status}</SelectItem>
                    ))}
                  </Select>

                  <Input
                    type="number"
                    label="Min Amount"
                    value={reportFilters.minAmount}
                    onChange={(e) =>
                      setReportFilters((prev) => ({
                        ...prev,
                        minAmount: e.target.value,
                      }))
                    }
                  />

                  <Input
                    type="number"
                    label="Max Amount"
                    value={reportFilters.maxAmount}
                    onChange={(e) =>
                      setReportFilters((prev) => ({
                        ...prev,
                        maxAmount: e.target.value,
                      }))
                    }
                  />

                  <Input
                    type="number"
                    label="Company ID"
                    value={reportFilters.companyId}
                    onChange={(e) =>
                      setReportFilters((prev) => ({
                        ...prev,
                        companyId: e.target.value,
                      }))
                    }
                  />

                  <Input
                    label="Company Name"
                    value={reportFilters.companyName}
                    onChange={(e) =>
                      setReportFilters((prev) => ({
                        ...prev,
                        companyName: e.target.value,
                      }))
                    }
                  />
                </div>
              </ModalBody>

              <ModalFooter>
                <Button variant="flat" onPress={onClose}>
                  Cancel
                </Button>

                <Button
                  variant="flat"
                  onPress={() => {
                    setReportFilters({
                      fromDate: "",
                      toDate: "",
                      status: "",
                      minAmount: "",
                      maxAmount: "",
                      companyId: "",
                      companyName: "",
                    });
                  }}
                >
                  Reset
                </Button>

                <Button color="primary" onPress={handleFetchReport}>
                  Fetch Report
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
};

export default Estimate;
