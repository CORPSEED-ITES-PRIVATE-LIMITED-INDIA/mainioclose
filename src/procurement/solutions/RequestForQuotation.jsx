import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  addToast,
  Button,
  Chip,
  DatePicker,
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
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
} from "@heroui/react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import {
  ChevronDown,
  EllipsisVertical,
  ExternalLink,
  Eye,
  File,
  Pencil,
  Lock,
  Plus,
  Search,
  Send,
} from "lucide-react";
import dayjs from "dayjs";

import NewTextEditor from "../../components/NewTextEditor";
import {
  createRFQ,
  getAllVendors,
  getProductVendorsByProductId,
  getRFQVendorsByRfqId,
  sendRfqToVendors,
  updateRFQVendorMapping,
} from "../../toolkit/slices/vendorsSlice";
import FileUploader from "../../components/FileUploader";
import { getAllPaymentType } from "../../toolkit/slices/settingSlice";
import NewSelect from "../../components/NewSelect";
import { parseDate } from "@internationalized/date";

const RFQ_VENDOR_STATUSES = [
  "DRAFT",
  "SENT",
  "UNDER_COMPARISON",
  "VENDOR_FINALIZED",
  "ONBOARDING_STARTED",
  "CLOSED",
  "CANCELLED",
];

const DetailItem = ({ label, value }) => {
  return (
    <div>
      <p className="text-xs text-default-500">{label}</p>
      <p className="mt-1 break-words text-sm font-semibold text-gray-900">
        {value || "-"}
      </p>
    </div>
  );
};

const getPlainTextLength = (html = "") =>
  String(html || "")
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/g, " ")
    .trim().length;

const hasHtmlContent = (html = "") => getPlainTextLength(html) > 0;

const HtmlPreviewCard = ({ title, description, html, emptyText }) => {
  return (
    <div className="overflow-hidden rounded-xl border bg-white shadow-sm">
      <div className="border-b bg-gray-50 px-4 py-3">
        <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
        {description && (
          <p className="mt-1 text-xs text-default-500">{description}</p>
        )}
      </div>

      <div className="p-4">
        {hasHtmlContent(html) ? (
          <div
            className="proposal-content tiptap-preview force-preview-text"
            dangerouslySetInnerHTML={{ __html: html }}
          />
        ) : (
          <div className="rounded-xl border border-dashed bg-gray-50 py-8 text-center text-sm text-default-500">
            {emptyText}
          </div>
        )}
      </div>
    </div>
  );
};

const formatDate = (value) => {
  if (!value) return "-";
  return dayjs(value).isValid() ? dayjs(value).format("DD-MM-YYYY") : "-";
};

const formatDateTime = (value) => {
  if (!value) return "-";
  return dayjs(value).isValid()
    ? dayjs(value).format("DD-MM-YYYY hh:mm A")
    : "-";
};

const getStatusColor = (status) => {
  const value = String(status || "").toUpperCase();

  if (value === "SENT") return "primary";
  if (value === "QUOTATION_RECEIVED") return "success";
  if (value === "SHORTLISTED") return "warning";
  if (value === "REJECTED") return "danger";
  if (value === "SELECTED") return "success";

  return "default";
};

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function TagsInput({
  value = [],
  onChange,
  placeholder = "",
  lockedValues = [],
}) {
  const [inputValue, setInputValue] = useState("");

  const normalizeEmail = (email) =>
    String(email || "")
      .trim()
      .toLowerCase();

  const isLocked = (tag) =>
    lockedValues.some(
      (lockedEmail) => normalizeEmail(lockedEmail) === normalizeEmail(tag),
    );

  const safeOnChange = (nextValue = []) => {
    const finalValue = [
      ...lockedValues,
      ...nextValue.filter((email) => !isLocked(email)),
    ].filter(Boolean);

    onChange([...new Set(finalValue)]);
  };

  const addTag = (val) => {
    const trimmed = val.trim().replace(",", "");

    if (!trimmed) return;

    if (!emailRegex.test(trimmed)) {
      addToast({
        title: "Invalid email",
        description: trimmed,
        color: "danger",
      });
      setInputValue("");
      return;
    }

    if (
      !value.some((email) => normalizeEmail(email) === normalizeEmail(trimmed))
    ) {
      safeOnChange([...value, trimmed]);
    }

    setInputValue("");
  };

  const handleKeyDown = (e) => {
    if (["Enter", " ", ","].includes(e.key)) {
      e.preventDefault();
      addTag(inputValue);
    }

    if (e.key === "Backspace" && inputValue === "") {
      e.preventDefault();
    }
  };

  return (
    <div className="flex min-h-[44px] flex-wrap items-center gap-2 rounded-xl border border-gray-300 bg-white px-3 py-2 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100">
      {value.map((tag, index) => (
        <div
          key={`${tag}-${index}`}
          className={`flex items-center gap-1 rounded-full px-3 py-1 text-xs ${
            isLocked(tag)
              ? "border border-gray-300 bg-gray-100 text-gray-700"
              : "bg-blue-100 text-blue-800"
          }`}
        >
          {tag}

          {!isLocked(tag) && (
            <button
              type="button"
              onClick={() => safeOnChange(value.filter((_, i) => i !== index))}
              className="font-semibold text-blue-600 hover:text-red-500"
            >
              ×
            </button>
          )}
        </div>
      ))}

      <input
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={() => addTag(inputValue)}
        placeholder={placeholder}
        className="min-w-[180px] flex-1 border-none bg-transparent text-sm outline-none placeholder:text-gray-400"
      />
    </div>
  );
}

const columns = [
  { name: "RFQ NO.", uid: "rfqNumber" },
  { name: "TITLE", uid: "title" },
  { name: "PRODUCT", uid: "productName" },
  // { name: "VENDOR", uid: "vendors" },
  { name: "DATES", uid: "dates" },
  { name: "CONTACT", uid: "contact" },
  { name: "STATUS", uid: "status" },
  { name: "ATTACHMENT", uid: "attachmentUrl" },
  { name: "CREATED DATE", uid: "createdDate" },
  { name: "ACTIONS", uid: "actions" },
];

const INITIAL_VISIBLE_COLUMNS = [
  "rfqNumber",
  "title",
  "productName",
  "vendors",
  "dates",
  "contact",
  "status",
  "attachmentUrl",
  "createdDate",
  "actions",
];

const defaultValues = {
  title: "",
  description: "",
  scopeOfWork: "<p></p>",
  termsAndConditions: "<p></p>",
  deliveryLocation: "",
  quotationSubmissionDeadline: "",
  expectedStartDate: "",
  expectedEndDate: "",
  contactPersonName: "",
  contactPersonEmail: "",
  contactPersonMobile: "",
  attachmentUrl: "",
  vendorIds: [],
};

const vendorRegistrationDefaultValues = {
  mappingId: "",
  productName: "",
  vendorId: "",
  vendorName: "",
  email: "",
  mobile: "",
  gstNumber: "",
  panNumber: "",
  pricePerUnit: "",
  unit: "Per Application",
  paymentTerms: "",
  timelineDays: "",
  quotationValidityDays: "",
  vendorBrochureAttachment: "",
  priceListAttachment: "",
  agreementAttachment: "",
  remarks: "",
};

const quotationDefaultValues = { ...vendorRegistrationDefaultValues };

const getRfqVendors = (rowData) => {
  if (Array.isArray(rowData?.vendors)) return rowData.vendors;
  return [];
};

const sendVendorDefaultValues = {
  to: [],
  subject: "",
  message: "<p></p>",
};

const sendVendorSchema = z.object({
  to: z.array(z.string()).min(1, "At least one vendor email is required"),
  subject: z.string().min(1, "Please enter subject"),
  message: z.string().refine((value) => getPlainTextLength(value) > 0, {
    message: "Please enter message",
  }),
});

const rfqSchema = z.object({
  title: z.string().min(1, "Please enter RFQ title"),
  description: z.string().min(1, "Please enter description"),
  scopeOfWork: z.string().refine((value) => getPlainTextLength(value) > 0, {
    message: "Please enter scope of work",
  }),
  termsAndConditions: z
    .string()
    .refine((value) => getPlainTextLength(value) > 0, {
      message: "Please enter terms and conditions",
    }),
  deliveryLocation: z.string().min(1, "Please enter delivery location"),
  quotationSubmissionDeadline: z
    .string()
    .min(1, "Please select quotation submission deadline"),
  expectedStartDate: z.string().min(1, "Please select expected start date"),
  expectedEndDate: z.string().min(1, "Please select expected end date"),
  contactPersonName: z.string().min(1, "Please enter contact person name"),
  contactPersonEmail: z
    .string()
    .min(1, "Please enter contact person email")
    .email("Please enter valid email"),
  contactPersonMobile: z
    .string()
    .min(10, "Mobile number must be 10 digits")
    .max(10, "Mobile number must be 10 digits"),
  attachmentUrl: z.any().optional(),
  vendorIds: z.array(z.any()).min(1, "Please select at least one vendor"),
});

const vendorRegistrationSchema = z.object({
  mappingId: z.any().optional(),
  productName: z.string().optional(),
  vendorId: z.any().refine((value) => Boolean(value), {
    message: "Vendor is required",
  }),
  vendorName: z.string().optional(),
  email: z.string().optional(),
  mobile: z.string().optional(),
  gstNumber: z.string().optional(),
  panNumber: z.string().optional(),
  pricePerUnit: z.string().min(1, "Please enter price per unit"),
  unit: z.string().min(1, "Please select unit"),
  paymentTerms: z.string().min(1, "Please enter payment terms"),
  timelineDays: z.string().min(1, "Please enter timeline"),
  quotationValidityDays: z.string().optional(),
  vendorBrochureAttachment: z.any().refine((value) => Boolean(value), {
    message: "Please upload vendor brochure",
  }),
  priceListAttachment: z.any().refine((value) => Boolean(value), {
    message: "Please upload price list",
  }),
  agreementAttachment: z.any().refine((value) => Boolean(value), {
    message: "Please upload agreement attachment",
  }),
  remarks: z.string().optional(),
});

const quotationSchema = vendorRegistrationSchema;

const normalizePageContent = (response) => {
  if (Array.isArray(response)) return response;
  if (Array.isArray(response?.content)) return response.content;
  if (Array.isArray(response?.data?.content)) return response.data.content;
  if (Array.isArray(response?.data)) return response.data;
  if (Array.isArray(response?.response)) return response.response;
  return [];
};

const getTotalElements = (response, fallbackLength = 0) => {
  return (
    response?.totalElements ||
    response?.data?.totalElements ||
    response?.total ||
    fallbackLength
  );
};

const toDatePickerValue = (value) => {
  if (!value) return null;

  try {
    const normalized = dayjs(value).isValid()
      ? dayjs(value).format("YYYY-MM-DD")
      : String(value).slice(0, 10);

    return parseDate(normalized);
  } catch {
    return null;
  }
};

const toIsoDateTime = (dateValue) => {
  if (!dateValue) return "";
  return new Date(`${dateValue.toString()}T00:00:00`).toISOString();
};

const RequestForQuotation = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { solutionId, userId } = useParams();

  const paymentTypeList = useSelector((state) => state.setting.paymentTypeList);

  const rfqModal = useDisclosure();
  const viewModal = useDisclosure();
  const registerVendorModal = useDisclosure();
  const quotationModal = useDisclosure();
  const sendVendorModal = useDisclosure();
  const rfqDetailDrawer = useDisclosure();

  const [selectedRfqDetail, setSelectedRfqDetail] = useState(null);
  const [selectedSendRfq, setSelectedSendRfq] = useState(null);
  const [sendVendorLoading, setSendVendorLoading] = useState(false);
  const [lockedSendBcc, setLockedSendBcc] = useState([]);
  const [sendMessageBody, setSendMessageBody] = useState("<p></p>");
  const [status, setStatus] = useState("DRAFT");

  const {
    control: sendVendorControl,
    handleSubmit: handleSendVendorSubmit,
    reset: resetSendVendorForm,
    setValue: setSendVendorValue,
    trigger: triggerSendVendor,
    formState: { errors: sendVendorErrors },
  } = useForm({
    resolver: zodResolver(sendVendorSchema),
    defaultValues: sendVendorDefaultValues,
  });

  const {
    control,
    handleSubmit: handleRfqFormSubmit,
    reset: resetRfqForm,
    trigger,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(rfqSchema),
    defaultValues,
  });

  const {
    control: registerControl,
    handleSubmit: handleRegisterVendorSubmit,
    reset: resetRegisterVendorForm,
    formState: { errors: registerErrors },
  } = useForm({
    resolver: zodResolver(vendorRegistrationSchema),
    defaultValues: vendorRegistrationDefaultValues,
  });

  const {
    control: quotationControl,
    handleSubmit: handleQuotationFormSubmit,
    reset: resetQuotationForm,
    formState: { errors: quotationErrors },
  } = useForm({
    resolver: zodResolver(quotationSchema),
    defaultValues: quotationDefaultValues,
  });

  const [rfqResponse, setRfqResponse] = useState(null);
  const [vendorResponse, setVendorResponse] = useState(null);
  const [selectedRfq, setSelectedRfq] = useState(null);
  const [mailBody, setMailBody] = useState("<p></p>");
  const [loading, setLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [filterValue, setFilterValue] = useState("");
  const [visibleColumns, setVisibleColumns] = useState(
    new Set(INITIAL_VISIBLE_COLUMNS),
  );
  const [filteration, setFilteration] = useState({ page: 1, size: 10 });

  const rfqList = useMemo(
    () => normalizePageContent(rfqResponse),
    [rfqResponse],
  );
  const vendorList = useMemo(
    () => normalizePageContent(vendorResponse),
    [vendorResponse],
  );
  const count = useMemo(
    () => getTotalElements(rfqResponse, rfqList.length),
    [rfqResponse, rfqList.length],
  );
  const pages = Math.ceil(count / filteration.size) || 1;

  const headerColumns = useMemo(() => {
    if (visibleColumns === "all") return columns;
    return columns.filter((column) =>
      Array.from(visibleColumns).includes(column.uid),
    );
  }, [visibleColumns]);

  const filteredItems = useMemo(() => {
    let filtered = [...rfqList];

    if (filterValue) {
      filtered = filtered.filter((item) =>
        Object.values(item || {}).some((val) =>
          String(val || "")
            .toLowerCase()
            .includes(filterValue.toLowerCase()),
        ),
      );
    }

    return filtered;
  }, [rfqList, filterValue]);

  const fetchProductVendors = useCallback(() => {
    if (!solutionId || !userId) return;

    setLoading(true);
    dispatch(
      getProductVendorsByProductId({
        productId: solutionId,
        userId,
        status,
        page: filteration.page,
        size: filteration.size,
      }),
    ).then((resp) => {
      setLoading(false);
      if (resp.meta.requestStatus === "fulfilled") {
        setRfqResponse(resp.payload);
      } else {
        addToast({
          title: "ERROR",
          description:
            resp?.payload?.message ||
            resp?.payload ||
            "Failed to fetch mapped vendors.",
          color: "danger",
        });
      }
    });
  }, [
    dispatch,
    solutionId,
    userId,
    filteration.page,
    filteration.size,
    status,
  ]);

  const fetchVendors = useCallback(() => {
    if (!userId) return;
    dispatch(getAllVendors({ userId, page: 1, size: 1000, search: "" })).then(
      (resp) => {
        if (resp.meta.requestStatus === "fulfilled") {
          setVendorResponse(resp.payload);
        }
      },
    );
  }, [dispatch, userId]);

  useEffect(() => {
    fetchProductVendors();
  }, [fetchProductVendors]);

  useEffect(() => {
    fetchVendors();
  }, [fetchVendors]);

  useEffect(() => {
    dispatch(getAllPaymentType());
  }, [dispatch]);

  const handleOpenRfqDetail = (rowData) => {
    setSelectedRfqDetail(rowData);
    rfqDetailDrawer.onOpen();
  };

  const handleOpenSendToVendor = (rowData) => {
    if (!rowData?.id) {
      addToast({
        title: "ERROR",
        description: "RFQ ID is missing.",
        color: "danger",
      });
      return;
    }

    setSendVendorLoading(true);
    dispatch(getRFQVendorsByRfqId(rowData.id)).then((resp) => {
      setSendVendorLoading(false);

      if (resp.meta.requestStatus !== "fulfilled") {
        addToast({
          title: "ERROR",
          description:
            resp?.payload?.message ||
            resp?.payload ||
            "Failed to fetch RFQ vendors.",
          color: "danger",
        });
        return;
      }

      const vendors = Array.isArray(resp.payload) ? resp.payload : [];
      const bccEmails = [
        ...new Set(
          vendors.map((vendor) => vendor?.vendorEmail).filter(Boolean),
        ),
      ];

      if (!bccEmails.length) {
        addToast({
          title: "ERROR",
          description: "No vendor email found for this RFQ.",
          color: "danger",
        });
        return;
      }

      const updatedRfq = { ...rowData, vendors };
      setSelectedSendRfq(updatedRfq);
      setLockedSendBcc(bccEmails);
      setSendMessageBody("<p></p>");

      resetSendVendorForm({
        to: bccEmails,
        subject:
          rowData?.title ||
          rowData?.emailSubject ||
          `RFQ for ${rowData?.productName || "Service"}`,
        message: "<p></p>",
      });

      sendVendorModal.onOpen();
    });
  };

  const handleOpenCreateModal = () => {
    setSelectedRfq(null);
    setMailBody("<p></p>");
    resetRfqForm(defaultValues);
    rfqModal.onOpen();
  };

  const handleOpenEditRfq = (rowData) => {
    if (!rowData?.id) {
      addToast({
        title: "ERROR",
        description: "RFQ ID is missing.",
        color: "danger",
      });
      return;
    }

    setSelectedRfq(rowData);
    setMailBody(rowData?.emailBody || "<p></p>");

    resetRfqForm({
      title: rowData?.title || "",
      description: rowData?.description || "",
      scopeOfWork: rowData?.scopeOfWork || "<p></p>",
      termsAndConditions: rowData?.termsAndConditions || "<p></p>",
      deliveryLocation: rowData?.deliveryLocation || "",
      quotationSubmissionDeadline: rowData?.quotationSubmissionDeadline
        ? dayjs(rowData.quotationSubmissionDeadline).format("YYYY-MM-DD")
        : "",
      expectedStartDate: rowData?.expectedStartDate
        ? dayjs(rowData.expectedStartDate).format("YYYY-MM-DD")
        : "",
      expectedEndDate: rowData?.expectedEndDate
        ? dayjs(rowData.expectedEndDate).format("YYYY-MM-DD")
        : "",
      contactPersonName: rowData?.contactPersonName || "",
      contactPersonEmail: rowData?.contactPersonEmail || "",
      contactPersonMobile: rowData?.contactPersonMobile || "",
      attachmentUrl: rowData?.attachmentUrl || "",
      vendorIds: getRfqVendors(rowData)
        .map((vendor) => vendor?.vendorId)
        .filter(Boolean)
        .map(String),
    });

    rfqModal.onOpen();
  };

  const handleView = (item) => {
    setSelectedRfq(item);
    viewModal.onOpen();
  };

  const getUploadedFileValue = (value) => {
    return (
      value?.filePath ||
      value?.url ||
      value?.path ||
      value?.location ||
      value ||
      ""
    );
  };

  const handleOpenRegisterQuote = (item) => {
    setSelectedRfq(item);
    resetQuotationForm({
      mappingId: item?.mappingId || "",
      productId: item?.productId || solutionId || "",
      productName: item?.productName || "",
      vendorId: item?.vendorId || "",
      vendorName: item?.vendorName || "",
      email: item?.email || "",
      mobile: item?.mobile || "",
      gstNumber: item?.gstNumber || "",
      panNumber: item?.panNumber || "",
      pricePerUnit: "",
      unit: "Per Application",
      paymentTerms: "",
      timelineDays: "",
      quotationValidityDays: "",
      vendorBrochureAttachment: "",
      priceListAttachment: "",
      agreementAttachment: item?.agreementAttachment || "",
      remarks: "",
    });
    quotationModal.onOpen();
  };

  const handleOpenRegisterVendor = (item) => {
    setSelectedRfq(item);
    resetRegisterVendorForm({
      mappingId: item?.mappingId || "",
      productId: item?.productId || solutionId || "",
      productName: item?.productName || "",
      vendorId: item?.vendorId || "",
      vendorName: item?.vendorName || "",
      email: item?.email || "",
      mobile: item?.mobile || "",
      gstNumber: item?.gstNumber || "",
      panNumber: item?.panNumber || "",
      pricePerUnit: "",
      unit: "Per Application",
      paymentTerms: "",
      timelineDays: "",
      quotationValidityDays: "",
      vendorBrochureAttachment: "",
      priceListAttachment: "",
      agreementAttachment: item?.agreementAttachment || "",
      remarks: "",
    });
    registerVendorModal.onOpen();
  };

  const onSubmitRFQ = (values) => {
    if (!userId) {
      addToast({
        title: "ERROR",
        description: "User ID is missing.",
        color: "danger",
      });
      return;
    }

    const payload = {
      title: values.title,
      description: values.description,
      productId: Number(solutionId),
      scopeOfWork: values.scopeOfWork,
      termsAndConditions: values.termsAndConditions,
      deliveryLocation: values.deliveryLocation,
      quotationSubmissionDeadline: toIsoDateTime(
        values.quotationSubmissionDeadline,
      ),
      expectedStartDate: toIsoDateTime(values.expectedStartDate),
      expectedEndDate: toIsoDateTime(values.expectedEndDate),
      contactPersonName: values.contactPersonName,
      contactPersonEmail: values.contactPersonEmail,
      contactPersonMobile: values.contactPersonMobile,
      attachmentUrl: getUploadedFileValue(values.attachmentUrl),
      vendorIds: values.vendorIds.map(Number),
    };

    const isEditMode = Boolean(selectedRfq?.id);

    setSubmitLoading(true);

    const action = isEditMode
      ? updateRFQVendorMapping({
          rfqId: selectedRfq.id,
          userId,
          data: payload,
        })
      : createRFQ({
          userId,
          data: payload,
        });

    dispatch(action).then((resp) => {
      setSubmitLoading(false);

      if (resp.meta.requestStatus === "fulfilled") {
        addToast({
          title: "SUCCESS",
          description: isEditMode
            ? "RFQ updated successfully."
            : "RFQ created successfully.",
          color: "success",
        });

        rfqModal.onClose();
        setSelectedRfq(null);
        resetRfqForm(defaultValues);
        fetchProductVendors();
      } else {
        addToast({
          title: "ERROR",
          description:
            resp?.payload?.message ||
            resp?.payload?.data?.message ||
            resp?.payload ||
            (isEditMode ? "RFQ update failed." : "RFQ creation failed."),
          color: "danger",
        });
      }
    });
  };

  const onSubmitRegisterVendor = (values) => {
    const payload = {
      mappingId: Number(values?.mappingId),
      productId: Number(solutionId),
      vendorId: Number(values?.vendorId),
      pricePerUnit: Number(values?.pricePerUnit),
      unit: values?.unit,
      paymentTerms: values?.paymentTerms,
      timelineDays: Number(values?.timelineDays),
      quotationValidityDays: values?.quotationValidityDays
        ? Number(values.quotationValidityDays)
        : null,
      vendorBrochureAttachment: getUploadedFileValue(
        values?.vendorBrochureAttachment,
      ),
      priceListAttachment: getUploadedFileValue(values?.priceListAttachment),
      agreementAttachment: getUploadedFileValue(values?.agreementAttachment),
      remarks: values?.remarks || "",
    };

    console.log("Vendor registration payload:", payload);
    addToast({
      title: "INFO",
      description: "Payload prepared. Connect registration API dispatch here.",
      color: "primary",
    });
  };

  const handleAddQuote = (rowData) => {
    navigate(`${rowData?.id}/vendors`);
  };
  const onSearchChange = useCallback(
    (value) => setFilterValue(value || ""),
    [],
  );
  const onClear = useCallback(() => setFilterValue(""), []);
  const onRowsPerPageChange = useCallback(
    (e) => {
      setFilteration({ page: 1, size: Number(e.target.value) });
    },
    [
      handleAddQuote,
      handleOpenEditRfq,
      handleOpenRfqDetail,
      handleOpenSendToVendor,
    ],
  );

  const onSubmitSendToVendor = (values) => {
    const rfqId = selectedSendRfq?.rfqId || selectedSendRfq?.id;

    if (!rfqId) {
      addToast({
        title: "ERROR",
        description: "RFQ ID is missing.",
        color: "danger",
      });
      return;
    }

    const rfqVendorIds =
      selectedSendRfq?.vendors?.length > 0
        ? selectedSendRfq.vendors
            .map((vendor) => vendor?.rfqVendorId)
            .filter(Boolean)
            .map(Number)
        : [];

    if (!rfqVendorIds.length) {
      addToast({
        title: "ERROR",
        description: "RFQ vendor IDs are missing.",
        color: "danger",
      });
      return;
    }

    const payload = {
      rfqVendorIds,
      subject: values.subject,
      message: values.message,
      to: values.to || [],
    };

    setSendVendorLoading(true);
    dispatch(sendRfqToVendors({ rfqId, userId, data: payload })).then(
      (resp) => {
        setSendVendorLoading(false);
        if (resp.meta.requestStatus === "fulfilled") {
          addToast({
            title: "SUCCESS",
            description: "RFQ sent to vendor successfully.",
            color: "success",
          });
          sendVendorModal.onClose();
          resetSendVendorForm(sendVendorDefaultValues);
          setSelectedSendRfq(null);
          setLockedSendBcc([]);
          setSendMessageBody("<p></p>");
          fetchProductVendors();
        } else {
          addToast({
            title: "ERROR",
            description:
              resp?.payload?.message ||
              resp?.payload?.data?.message ||
              "Failed to send RFQ.",
            color: "danger",
          });
        }
      },
    );
  };

  const renderCell = useCallback(
    (rowData, columnKey) => {
      switch (columnKey) {
        case "rfqNumber":
          return (
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-foreground">
                {rowData?.rfqNumber || "-"}
              </span>
              <span className="text-xs text-default-500">
                ID: {rowData?.id || "-"}
              </span>
            </div>
          );

        case "title":
          return (
            <div className="max-w-[260px]">
              <p
                className="truncate text-sm font-medium"
                title={rowData?.title}
              >
                {rowData?.title || "-"}
              </p>
              <p
                className="mt-1 line-clamp-1 text-xs text-default-500"
                title={rowData?.description}
              >
                {rowData?.description || "-"}
              </p>
            </div>
          );

        case "productName":
          return (
            <div className="flex flex-col">
              <span className="text-sm font-medium">
                {rowData?.productName || "-"}
              </span>
              <span className="text-xs text-default-500">
                Product ID: {rowData?.productId || "-"}
              </span>
            </div>
          );

        case "dates":
          return (
            <div className="flex flex-col gap-1 text-xs text-default-600">
              <span>
                Deadline: {formatDate(rowData?.quotationSubmissionDeadline)}
              </span>
              <span>
                Start: {formatDate(rowData?.expectedStartDate)} | End:{" "}
                {formatDate(rowData?.expectedEndDate)}
              </span>
            </div>
          );

        case "contact":
          return (
            <div className="flex flex-col gap-1">
              <span className="text-sm font-medium">
                {rowData?.contactPersonName || "-"}
              </span>
              <span className="text-xs text-default-500">
                {rowData?.contactPersonEmail || "-"}
              </span>
              <Chip size="sm" variant="flat">
                {rowData?.contactPersonMobile || "-"}
              </Chip>
            </div>
          );

        case "status":
          return (
            <Chip
              size="sm"
              color={getStatusColor(rowData?.status)}
              variant="flat"
            >
              {rowData?.status || "-"}
            </Chip>
          );

        case "attachmentUrl":
          return rowData?.attachmentUrl ? (
            <a
              href={rowData.attachmentUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 text-xs font-semibold text-primary"
            >
              View <ExternalLink size={13} />
            </a>
          ) : (
            <Chip size="sm" variant="flat">
              Not Attached
            </Chip>
          );

        case "createdDate":
          return (
            <div className="flex flex-col text-xs">
              <span>{formatDateTime(rowData?.createdDate)}</span>
              <span className="text-default-500">
                By: {rowData?.createdBy || "-"}
              </span>
            </div>
          );

        case "vendors": {
          const vendors = getRfqVendors(rowData);
          if (!vendors.length)
            return (
              <Chip size="sm" variant="flat">
                No Vendor
              </Chip>
            );

          const firstVendor = vendors[0];
          return (
            <div className="flex flex-col gap-1">
              <span className="text-sm font-semibold text-foreground">
                {firstVendor?.vendorName || "-"}
              </span>
              <span className="text-xs text-default-500">
                {firstVendor?.vendorEmail || "-"}
              </span>
              <div className="flex items-center gap-1">
                <Chip
                  size="sm"
                  color={getStatusColor(firstVendor?.vendorStatus)}
                  variant="flat"
                >
                  {firstVendor?.vendorStatus || "-"}
                </Chip>
                {vendors.length > 1 && (
                  <Chip size="sm" variant="flat">
                    +{vendors.length - 1} more
                  </Chip>
                )}
              </div>
            </div>
          );
        }
        case "actions": {
          const rfqStatus = String(rowData?.status || "").toUpperCase();
          const canOpenVendors = rfqStatus != "DRAFT";

          return (
            <div className="flex justify-center">
              <Dropdown>
                <DropdownTrigger>
                  <Button size="sm" isIconOnly variant="light">
                    <EllipsisVertical size={18} />
                  </Button>
                </DropdownTrigger>

                <DropdownMenu
                  disabledKeys={!canOpenVendors ? ["addQuote"] : []}
                >
                  <DropdownItem
                    key="view"
                    startContent={<Eye size={15} />}
                    onPress={() => handleOpenRfqDetail(rowData)}
                  >
                    View Details
                  </DropdownItem>
                  <DropdownItem
                    key="edit"
                    startContent={<Pencil size={15} />}
                    onPress={() => handleOpenEditRfq(rowData)}
                  >
                    Edit RFQ
                  </DropdownItem>

                  <DropdownItem
                    key="sendToVendor"
                    startContent={<Send size={15} />}
                    onPress={() => handleOpenSendToVendor(rowData)}
                  >
                    Send To Vendor
                  </DropdownItem>

                  <DropdownItem
                    key="addQuote"
                    startContent={
                      canOpenVendors ? <File size={15} /> : <Lock size={15} />
                    }
                    description={
                      !canOpenVendors ? "Send RFQ to vendor first" : undefined
                    }
                    onPress={() => {
                      if (!canOpenVendors) return;
                      handleAddQuote(rowData);
                    }}
                  >
                    Vendors
                  </DropdownItem>
                </DropdownMenu>
              </Dropdown>
            </div>
          );
        }

        default:
          return rowData?.[columnKey] || "-";
      }
    },
    [
      handleAddQuote,
      handleOpenEditRfq,
      handleOpenRfqDetail,
      handleOpenSendToVendor,
    ],
  );

  const topContent = useMemo(() => {
    return (
      <div className="flex flex-col gap-4">
        <div className="flex items-end justify-between gap-3">
          <Input
            isClearable
            className="w-full sm:max-w-[35%]"
            placeholder="Search RFQ..."
            startContent={<Search size={18} />}
            value={filterValue}
            onClear={onClear}
            onValueChange={onSearchChange}
          />

          <div className="flex gap-3">
            <Button
              color="primary"
              startContent={<Plus size={17} />}
              onPress={handleOpenCreateModal}
            >
              Add RFQ
            </Button>

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
                aria-label="RFQ Vendor Status Filter"
                selectedKeys={[status]}
                selectionMode="single"
                variant="flat"
                onSelectionChange={(keys) => {
                  const key = Array.from(keys)[0];
                  setStatus(key);
                  setFilteration((prev) => ({ ...prev, page: 1 }));
                }}
              >
                {RFQ_VENDOR_STATUSES.map((item) => (
                  <DropdownItem key={item}>{item}</DropdownItem>
                ))}
              </DropdownMenu>
            </Dropdown>

            <Dropdown>
              <DropdownTrigger className="hidden sm:flex">
                <Button endContent={<ChevronDown size={16} />} variant="flat">
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
                    {column.name}
                  </DropdownItem>
                ))}
              </DropdownMenu>
            </Dropdown>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-small text-default-400">
            Total {count} vendors mapped
          </span>
          <label className="flex items-center text-small text-default-400">
            Rows per page:
            <select
              className="bg-transparent text-small text-default-400 outline-none"
              onChange={onRowsPerPageChange}
              value={filteration.size}
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
    visibleColumns,
    count,
    filteration.size,
    onClear,
    onSearchChange,
    onRowsPerPageChange,
    status,
  ]);

  const bottomContent = useMemo(() => {
    return (
      <div className="flex items-center justify-between px-2 py-2">
        <span className="text-small text-default-400">
          Page {filteration.page} of {pages}
        </span>
        <Pagination
          isCompact
          showControls
          color="primary"
          page={filteration.page}
          total={pages}
          onChange={(page) => setFilteration((prev) => ({ ...prev, page }))}
        />
      </div>
    );
  }, [filteration.page, pages]);

  return (
    <>
      <div className="flex flex-col gap-4">
        <h1 className="mb-1 font-sans text-2xl font-medium">
          Request For Quotation
        </h1>
        <Table
          isHeaderSticky
          aria-label="Request for quotation table"
          bottomContent={bottomContent}
          bottomContentPlacement="outside"
          topContent={topContent}
          topContentPlacement="outside"
          classNames={{
            wrapper: "2xl:max-h-[65vh] md:max-h-[60vh] w-full",
            table: "w-full",
          }}
        >
          <TableHeader columns={headerColumns}>
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
            isLoading={loading}
            emptyContent={loading ? "Loading..." : "No RFQ found"}
            items={filteredItems}
          >
            {(item) => (
              <TableRow key={item?.id}>
                {(columnKey) => (
                  <TableCell>{renderCell(item, columnKey)}</TableCell>
                )}
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <Modal
        isOpen={rfqModal.isOpen}
        onOpenChange={rfqModal.onOpenChange}
        size="5xl"
        isDismissable={false}
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="border-b">
                <div>
                  <h2 className="text-lg font-semibold">
                    {selectedRfq?.id ? "Update RFQ" : "Create RFQ"}
                  </h2>
                  <p className="text-xs font-normal text-default-500">
                    {selectedRfq?.id
                      ? "Update RFQ details, scope of work, terms and vendor selection."
                      : "Fill RFQ details, scope of work, terms and vendor selection."}
                  </p>
                </div>
              </ModalHeader>

              <form
                onSubmit={handleRfqFormSubmit(onSubmitRFQ, () => {
                  addToast({
                    title: "ERROR",
                    description: "Please fill all required fields correctly",
                    color: "danger",
                  });
                })}
              >
                <ModalBody>
                  <div className="max-h-[60vh] overflow-auto p-4">
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <Controller
                        name="title"
                        control={control}
                        render={({ field }) => (
                          <Input
                            label="RFQ Title"
                            isRequired
                            value={field.value}
                            onChange={(e) => field.onChange(e.target.value)}
                            isInvalid={!!errors.title}
                            errorMessage={errors.title?.message}
                          />
                        )}
                      />

                      <Controller
                        name="deliveryLocation"
                        control={control}
                        render={({ field }) => (
                          <Input
                            label="Delivery Location"
                            isRequired
                            value={field.value}
                            onChange={(e) => field.onChange(e.target.value)}
                            isInvalid={!!errors.deliveryLocation}
                            errorMessage={errors.deliveryLocation?.message}
                          />
                        )}
                      />

                      <Controller
                        name="quotationSubmissionDeadline"
                        control={control}
                        render={({ field }) => (
                          <DatePicker
                            label="Quotation Submission Deadline"
                            isRequired
                            value={toDatePickerValue(field.value)}
                            onChange={(value) =>
                              field.onChange(value ? value.toString() : "")
                            }
                            isInvalid={!!errors.quotationSubmissionDeadline}
                            errorMessage={
                              errors.quotationSubmissionDeadline?.message
                            }
                          />
                        )}
                      />

                      <Controller
                        name="expectedStartDate"
                        control={control}
                        render={({ field }) => (
                          <DatePicker
                            label="Expected Start Date"
                            isRequired
                            value={toDatePickerValue(field.value)}
                            onChange={(value) =>
                              field.onChange(value ? value.toString() : "")
                            }
                            isInvalid={!!errors.expectedStartDate}
                            errorMessage={errors.expectedStartDate?.message}
                          />
                        )}
                      />

                      <Controller
                        name="expectedEndDate"
                        control={control}
                        render={({ field }) => (
                          <DatePicker
                            label="Expected End Date"
                            isRequired
                            value={toDatePickerValue(field.value)}
                            onChange={(value) =>
                              field.onChange(value ? value.toString() : "")
                            }
                            isInvalid={!!errors.expectedEndDate}
                            errorMessage={errors.expectedEndDate?.message}
                          />
                        )}
                      />

                      <Controller
                        name="contactPersonName"
                        control={control}
                        render={({ field }) => (
                          <Input
                            label="Contact Person Name"
                            isRequired
                            value={field.value}
                            onChange={(e) => field.onChange(e.target.value)}
                            isInvalid={!!errors.contactPersonName}
                            errorMessage={errors.contactPersonName?.message}
                          />
                        )}
                      />

                      <Controller
                        name="contactPersonEmail"
                        control={control}
                        render={({ field }) => (
                          <Input
                            type="email"
                            label="Contact Person Email"
                            isRequired
                            value={field.value}
                            onChange={(e) => field.onChange(e.target.value)}
                            isInvalid={!!errors.contactPersonEmail}
                            errorMessage={errors.contactPersonEmail?.message}
                          />
                        )}
                      />

                      <Controller
                        name="contactPersonMobile"
                        control={control}
                        render={({ field }) => (
                          <Input
                            label="Contact Person Mobile"
                            isRequired
                            maxLength={10}
                            value={field.value}
                            onChange={(e) =>
                              field.onChange(
                                e.target.value.replace(/\D/g, "").slice(0, 10),
                              )
                            }
                            isInvalid={!!errors.contactPersonMobile}
                            errorMessage={errors.contactPersonMobile?.message}
                          />
                        )}
                      />

                      <Controller
                        name="vendorIds"
                        control={control}
                        render={({ field }) => (
                          <NewSelect
                            label="Select Vendors"
                            isRequired
                            selectionMode="multiple"
                            data={vendorList || []}
                            labelKey="name"
                            valueKey="id"
                            onChange={(keys) =>
                              field.onChange(Array.from(keys))
                            }
                            value={field?.value}
                            isInvalid={!!errors.vendorIds}
                            errorMessage={errors.vendorIds?.message}
                          />
                        )}
                      />

                      <Controller
                        name="attachmentUrl"
                        control={control}
                        render={({ field, fieldState: { error } }) => (
                          <FileUploader
                            label="Attachment"
                            value={field.value}
                            onChange={(value) => field.onChange(value)}
                            errorMessage={error?.message}
                            isInvalid={!!error}
                          />
                        )}
                      />

                      <div className="md:col-span-2">
                        <Controller
                          name="description"
                          control={control}
                          render={({ field }) => (
                            <Textarea
                              label="Description"
                              isRequired
                              minRows={3}
                              value={field.value}
                              onChange={(e) => field.onChange(e.target.value)}
                              isInvalid={!!errors.description}
                              errorMessage={errors.description?.message}
                            />
                          )}
                        />
                      </div>

                      <div className="md:col-span-2">
                        <Controller
                          name="scopeOfWork"
                          control={control}
                          render={({ field }) => (
                            <div className="overflow-hidden rounded-xl border bg-white">
                              <div className="border-b bg-gray-50 px-4 py-3">
                                <h3 className="text-sm font-semibold text-gray-900">
                                  Scope of Work{" "}
                                  <span className="text-red-500">*</span>
                                </h3>
                              </div>
                              <NewTextEditor
                                data={field.value || "<p></p>"}
                                onChange={(value) => {
                                  field.onChange(value);
                                  trigger("scopeOfWork");
                                }}
                              />
                              {errors.scopeOfWork?.message && (
                                <p className="px-4 pb-3 text-xs text-red-500">
                                  {errors.scopeOfWork.message}
                                </p>
                              )}
                            </div>
                          )}
                        />
                      </div>

                      <div className="md:col-span-2">
                        <Controller
                          name="termsAndConditions"
                          control={control}
                          render={({ field }) => (
                            <div className="overflow-hidden rounded-xl border bg-white">
                              <div className="border-b bg-gray-50 px-4 py-3">
                                <h3 className="text-sm font-semibold text-gray-900">
                                  Terms and Conditions{" "}
                                  <span className="text-red-500">*</span>
                                </h3>
                              </div>
                              <NewTextEditor
                                data={field.value || "<p></p>"}
                                onChange={(value) => {
                                  field.onChange(value);
                                  trigger("termsAndConditions");
                                }}
                              />
                              {errors.termsAndConditions?.message && (
                                <p className="px-4 pb-3 text-xs text-red-500">
                                  {errors.termsAndConditions.message}
                                </p>
                              )}
                            </div>
                          )}
                        />
                      </div>
                    </div>
                  </div>
                </ModalBody>

                <ModalFooter>
                  <Button
                    variant="flat"
                    type="button"
                    onPress={() => {
                      onClose();
                      setSelectedRfq(null);
                      resetRfqForm(defaultValues);
                    }}
                    isDisabled={submitLoading}
                  >
                    Cancel
                  </Button>
                  <Button
                    color="primary"
                    type="submit"
                    isLoading={submitLoading}
                  >
                    {selectedRfq?.id ? "Update RFQ" : "Create RFQ"}
                  </Button>
                </ModalFooter>
              </form>
            </>
          )}
        </ModalContent>
      </Modal>

      <Modal
        isOpen={sendVendorModal.isOpen}
        onOpenChange={sendVendorModal.onOpenChange}
        size="4xl"
        isDismissable={false}
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="border-b">
                <div>
                  <h2 className="text-lg font-semibold">Send RFQ To Vendor</h2>
                  <p className="text-xs font-normal text-default-500">
                    Send RFQ mail to selected mapped vendor.
                  </p>
                </div>
              </ModalHeader>

              <form
                onSubmit={handleSendVendorSubmit(onSubmitSendToVendor, () => {
                  addToast({
                    title: "ERROR",
                    description: "Please fill all required fields correctly",
                    color: "danger",
                  });
                })}
              >
                <ModalBody>
                  <div className="max-h-[60vh] overflow-auto p-4">
                    <div className="grid grid-cols-1 gap-4">
                      <Controller
                        name="to"
                        control={sendVendorControl}
                        render={({ field }) => (
                          <div>
                            <label className="mb-1 block text-sm font-medium text-gray-700">
                              To
                            </label>
                            <TagsInput
                              value={field.value || []}
                              onChange={field.onChange}
                              lockedValues={lockedSendBcc}
                              placeholder="Vendor emails will appear here"
                            />
                            {sendVendorErrors.to?.message && (
                              <p className="mt-1 text-xs text-red-500">
                                {sendVendorErrors.to.message}
                              </p>
                            )}
                          </div>
                        )}
                      />

                      <Controller
                        name="subject"
                        control={sendVendorControl}
                        render={({ field }) => (
                          <Input
                            label="Subject"
                            isRequired
                            value={field.value}
                            onChange={(e) => field.onChange(e.target.value)}
                            isInvalid={!!sendVendorErrors.subject}
                            errorMessage={sendVendorErrors.subject?.message}
                          />
                        )}
                      />

                      <Controller
                        name="message"
                        control={sendVendorControl}
                        render={({ field }) => (
                          <div className="w-full overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
                            <div className="flex items-start justify-between gap-4 border-b border-gray-200 bg-gray-50 px-4 py-3">
                              <div>
                                <label className="block text-sm font-semibold text-gray-900">
                                  Message{" "}
                                  <span className="text-red-500">*</span>
                                </label>
                                <p className="mt-1 text-xs leading-5 text-gray-500">
                                  This RFQ message will be sent in HTML format.
                                </p>
                              </div>
                              <span className="shrink-0 rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700">
                                {getPlainTextLength(field.value)} chars
                              </span>
                            </div>
                            <div className="bg-white">
                              <NewTextEditor
                                data={field.value || "<p></p>"}
                                onChange={(value) => {
                                  field.onChange(value);
                                  setSendMessageBody(value);
                                  setSendVendorValue("message", value, {
                                    shouldValidate: true,
                                    shouldDirty: true,
                                  });
                                  triggerSendVendor("message");
                                }}
                              />
                            </div>
                            {sendVendorErrors.message?.message && (
                              <p className="px-4 pb-3 text-xs text-red-500">
                                {sendVendorErrors.message.message}
                              </p>
                            )}
                          </div>
                        )}
                      />
                    </div>
                  </div>
                </ModalBody>

                <ModalFooter>
                  <Button
                    variant="flat"
                    type="button"
                    onPress={() => {
                      onClose();
                      resetSendVendorForm(sendVendorDefaultValues);
                      setSelectedSendRfq(null);
                      setLockedSendBcc([]);
                      setSendMessageBody("<p></p>");
                    }}
                    isDisabled={sendVendorLoading}
                  >
                    Cancel
                  </Button>
                  <Button
                    color="primary"
                    type="submit"
                    isLoading={sendVendorLoading}
                  >
                    Send
                  </Button>
                </ModalFooter>
              </form>
            </>
          )}
        </ModalContent>
      </Modal>

      <Drawer
        isOpen={rfqDetailDrawer.isOpen}
        onOpenChange={rfqDetailDrawer.onOpenChange}
        size="2xl"
        placement="right"
      >
        <DrawerContent>
          {(onClose) => (
            <>
              <DrawerHeader className="border-b">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">
                    RFQ Details
                  </h2>
                  <p className="text-xs font-normal text-default-500">
                    {selectedRfqDetail?.rfqNumber || "-"} •{" "}
                    {selectedRfqDetail?.productName || "-"}
                  </p>
                </div>
              </DrawerHeader>
              <DrawerBody className="bg-gray-50 p-4">
                {selectedRfqDetail && (
                  <div className="space-y-4">
                    <div className="rounded-xl border bg-white p-4 shadow-sm">
                      <div className="mb-4 flex items-start justify-between gap-3 border-b pb-3">
                        <div>
                          <h3 className="text-base font-semibold text-gray-900">
                            {selectedRfqDetail?.title || "-"}
                          </h3>
                          <p className="mt-1 text-xs text-default-500">
                            {selectedRfqDetail?.description || "-"}
                          </p>
                        </div>
                        <Chip
                          size="sm"
                          color={getStatusColor(selectedRfqDetail?.status)}
                          variant="flat"
                        >
                          {selectedRfqDetail?.status || "-"}
                        </Chip>
                      </div>

                      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <DetailItem
                          label="RFQ Number"
                          value={selectedRfqDetail?.rfqNumber}
                        />
                        <DetailItem
                          label="Product"
                          value={selectedRfqDetail?.productName}
                        />
                        <DetailItem
                          label="Product ID"
                          value={selectedRfqDetail?.productId}
                        />
                        <DetailItem
                          label="Delivery Location"
                          value={selectedRfqDetail?.deliveryLocation}
                        />
                        <DetailItem
                          label="Quotation Deadline"
                          value={formatDate(
                            selectedRfqDetail?.quotationSubmissionDeadline,
                          )}
                        />
                        <DetailItem
                          label="Expected Start Date"
                          value={formatDate(
                            selectedRfqDetail?.expectedStartDate,
                          )}
                        />
                        <DetailItem
                          label="Expected End Date"
                          value={formatDate(selectedRfqDetail?.expectedEndDate)}
                        />
                        <DetailItem
                          label="Created Date"
                          value={formatDateTime(selectedRfqDetail?.createdDate)}
                        />
                      </div>
                    </div>

                    <div className="rounded-xl border bg-white p-4 shadow-sm">
                      <h3 className="mb-3 text-sm font-semibold text-gray-900">
                        Contact Person
                      </h3>
                      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                        <DetailItem
                          label="Name"
                          value={selectedRfqDetail?.contactPersonName}
                        />
                        <DetailItem
                          label="Email"
                          value={selectedRfqDetail?.contactPersonEmail}
                        />
                        <DetailItem
                          label="Mobile"
                          value={selectedRfqDetail?.contactPersonMobile}
                        />
                      </div>
                    </div>

                    <HtmlPreviewCard
                      title="Scope of Work"
                      description="Scope of work defined for this RFQ."
                      html={selectedRfqDetail?.scopeOfWork}
                      emptyText="No scope of work found."
                    />
                    <HtmlPreviewCard
                      title="Terms and Conditions"
                      description="Terms and conditions defined for this RFQ."
                      html={selectedRfqDetail?.termsAndConditions}
                      emptyText="No terms and conditions found."
                    />

                    <div className="rounded-xl border bg-white p-4 shadow-sm">
                      <h3 className="mb-3 text-sm font-semibold text-gray-900">
                        Attachment
                      </h3>
                      {selectedRfqDetail?.attachmentUrl ? (
                        <a
                          href={selectedRfqDetail.attachmentUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-white"
                        >
                          Open Attachment <ExternalLink size={14} />
                        </a>
                      ) : (
                        <div className="rounded-xl border border-dashed bg-gray-50 py-6 text-center text-sm text-default-500">
                          No attachment found.
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </DrawerBody>
              <DrawerFooter className="border-t">
                <Button variant="flat" onPress={onClose}>
                  Close
                </Button>
              </DrawerFooter>
            </>
          )}
        </DrawerContent>
      </Drawer>
    </>
  );
};

export default RequestForQuotation;
