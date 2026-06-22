import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  addToast,
  Button,
  Chip,
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
  Tooltip,
  useDisclosure,
} from "@heroui/react";
import { Input as AntInput, Select as AntSelect } from "antd";
import { useForm, Controller, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import {
  ChevronDown,
  Clock,
  EllipsisVertical,
  ExternalLink,
  Eye,
  File,
  History,
  Paperclip,
  Plus,
  Search,
  Send,
  UserPlus,
  X,
} from "lucide-react";
import dayjs from "dayjs";

import NewTextEditor from "../../components/NewTextEditor";
import {
  createVendorAgainstProduct,
  getAllQuotations,
  getAllVendors,
  getProductVendorsByProductId,
} from "../../toolkit/slices/vendorsSlice";
import FileUploader from "../../components/FileUploader";
import { getAllPaymentType } from "../../toolkit/slices/settingSlice";
import NewSelect from "../../components/NewSelect";

const columns = [
  { name: "QUOTATION NO.", uid: "quotationNumber" },
  { name: "VENDOR / RFQ", uid: "vendorRfq" },
  { name: "DATES", uid: "dates" },
  { name: "COMMERCIALS", uid: "commercials" },
  { name: "PAYMENT TERMS", uid: "paymentTerms" },
  { name: "ATTACHMENT", uid: "quotationAttachmentUrl" },
  { name: "CREATED BY", uid: "createdBy" },
  { name: "ACTIONS", uid: "actions" },
];

const INITIAL_VISIBLE_COLUMNS = [
  "quotationNumber",
  "vendorRfq",
  "dates",
  "commercials",
  "paymentTerms",
  "quotationAttachmentUrl",
  "createdBy",
  "actions",
];

const defaultValues = {
  vendorId: undefined,
  emailSubject: "",
  emailBody: "<p></p>",
  agreementAttachment: "",
};

const quotationDefaultValues = {
  rfqVendorId: "",
  vendorId: "",
  quotationNumber: "",
  quotationDate: "",
  validTill: "",
  currency: "INR",
  deliveryDays: "",
  paymentTerms: "",
  warrantyTerms: "",
  remarks: "",
  quotationAttachmentUrl: "",
  createdBy: "",
  items: [
    {
      itemType: "MATERIAL",
      itemName: "",
      description: "",
      quantity: "",
      unit: "",
      unitRate: "",
      taxPercent: "",
      remarks: "",
    },
  ],
};

const vendorRegistrationDefaultValues = {
  mappingId: "",
  productId: "",
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

const getPlainTextLength = (html = "") =>
  String(html || "")
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/g, " ")
    .trim().length;

const rfqSchema = z.object({
  vendorId: z.any().refine((value) => Boolean(value), {
    message: "Please select vendor",
  }),

  emailSubject: z.string().min(1, "Please enter email subject"),

  emailBody: z.string().refine((value) => getPlainTextLength(value) > 0, {
    message: "Please enter email body",
  }),

  agreementAttachment: z.any().refine((value) => Boolean(value), {
    message: "Please upload agreement attachment",
  }),
});

const vendorRegistrationSchema = z.object({
  mappingId: z.any().optional(),
  productId: z.any().optional(),
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

const quotationSchema = z.object({
  rfqVendorId: z.any().refine((value) => Boolean(value), {
    message: "RFQ Vendor is required",
  }),
  vendorId: z.any().refine((value) => Boolean(value), {
    message: "Vendor is required",
  }),
  quotationNumber: z.string().min(1, "Please enter quotation number"),
  quotationDate: z.string().min(1, "Please select quotation date"),
  validTill: z.string().min(1, "Please select valid till date"),
  currency: z.string().min(1, "Please enter currency"),
  deliveryDays: z.string().min(1, "Please enter delivery days"),
  paymentTerms: z.string().min(1, "Please enter payment terms"),
  warrantyTerms: z.string().optional(),
  remarks: z.string().optional(),
  quotationAttachmentUrl: z.any().optional(),
  createdBy: z.any().refine((value) => Boolean(value), {
    message: "Created by is required",
  }),
  items: z
    .array(
      z.object({
        itemType: z.string().min(1, "Item type is required"),
        itemName: z.string().min(1, "Item name is required"),
        description: z.string().optional(),
        quantity: z.string().min(1, "Quantity is required"),
        unit: z.string().min(1, "Unit is required"),
        unitRate: z.string().min(1, "Unit rate is required"),
        taxPercent: z.string().optional(),
        remarks: z.string().optional(),
      }),
    )
    .min(1, "At least one item is required"),
});

const hasHtmlContent = (html = "") => getPlainTextLength(html) > 0;

const normalizePageContent = (response) => {
  if (Array.isArray(response)) return response;
  if (Array.isArray(response?.content)) return response.content;
  if (Array.isArray(response?.data)) return response.data;
  if (Array.isArray(response?.data?.content)) return response.data.content;
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

const Quote = () => {
  const dispatch = useDispatch();
  const { solutionId, userId,rfqId } = useParams();

  const currentUser = useSelector((state) => state.auth.currentUser);
  const paymentTypeList = useSelector((state) => state.setting.paymentTypeList);

  const rfqModal = useDisclosure();
  const viewModal = useDisclosure();
  const registerVendorModal = useDisclosure();
  const quotationModal = useDisclosure();

  const {
    control,
    handleSubmit: handleRfqFormSubmit,
    reset: resetRfqForm,
    setValue,
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

  const {
    fields: quotationItemFields,
    append: appendQuotationItem,
    remove: removeQuotationItem,
  } = useFieldArray({
    control: quotationControl,
    name: "items",
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
  const [filteration, setFilteration] = useState({
    page: 1,
    size: 10,
  });

  const fileInputRef = useRef(null);

  const [chatDrawerOpen, setChatDrawerOpen] = useState(false);
  const [chatMessage, setChatMessage] = useState("");
  const [chatAttachment, setChatAttachment] = useState(null);

  const [chatList, setChatList] = useState([
    {
      id: 1,
      sender: "vendor",
      senderName: "Balaji Traders",
      message: "Quotation request received for 12A Registration.",
      time: "10:15 AM",
      attachment: null,
    },
    {
      id: 2,
      sender: "me",
      senderName: "Corpseed",
      message:
        "Please share quotation with commercials, timeline and payment terms.",
      time: "10:18 AM",
      attachment: null,
    },
    {
      id: 3,
      sender: "vendor",
      senderName: "Balaji Traders",
      message: "Sure, we will share the quotation shortly.",
      time: "10:22 AM",
      attachment: null,
    },
  ]);

  const rfqList = useMemo(() => {
    return normalizePageContent(rfqResponse);
  }, [rfqResponse]);

  const vendorList = useMemo(() => {
    return normalizePageContent(vendorResponse);
  }, [vendorResponse]);

  const count = useMemo(() => {
    return getTotalElements(rfqResponse, rfqList.length);
  }, [rfqResponse, rfqList.length]);

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

  const fetchQuotations = useCallback(() => {
    setLoading(true);

    dispatch(getAllQuotations(rfqId)).then((resp) => {
      setLoading(false);

      if (resp.meta.requestStatus === "fulfilled") {
        setRfqResponse(resp.payload);
      } else {
        addToast({
          title: "ERROR",
          description:
            resp?.payload?.message ||
            resp?.payload ||
            "Failed to fetch quotations.",
          color: "danger",
        });
      }
    });
  }, [dispatch]);

  const fetchVendors = useCallback(() => {
    if (!userId) return;

    dispatch(
      getAllVendors({
        userId,
        page: 1,
        size: 1000,
        search: "",
      }),
    ).then((resp) => {
      if (resp.meta.requestStatus === "fulfilled") {
        setVendorResponse(resp.payload);
      }
    });
  }, [dispatch, userId]);

  useEffect(() => {
    fetchQuotations();
  }, [fetchQuotations]);

  useEffect(() => {
    fetchVendors();
  }, [fetchVendors]);

  useEffect(() => {
    dispatch(getAllPaymentType());
  }, [dispatch]);

  const handleOpenCreateModal = () => {
    setSelectedRfq(null);
    setMailBody("<p></p>");

    resetRfqForm(defaultValues);

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

  const onSubmitQuotation = (values) => {
    const payload = {
      rfqId: Number(rfqId),
      // rfqVendorId: Number(rfqVendorId),
      vendorId: Number(values.vendorId),
      quotationNumber: values.quotationNumber,
      quotationDate: new Date(values.quotationDate).toISOString(),
      validTill: new Date(values.validTill).toISOString(),
      currency: values.currency,
      deliveryDays: Number(values.deliveryDays),
      paymentTerms: values.paymentTerms,
      warrantyTerms: values.warrantyTerms || "",
      remarks: values.remarks || "",
      quotationAttachmentUrl: getUploadedFileValue(
        values.quotationAttachmentUrl,
      ),
      createdBy: Number(values.createdBy),
      items: values.items.map((item) => ({
        itemType: item.itemType,
        itemName: item.itemName,
        description: item.description || "",
        quantity: Number(item.quantity),
        unit: item.unit,
        unitRate: Number(item.unitRate),
        taxPercent: Number(item.taxPercent || 0),
        remarks: item.remarks || "",
      })),
    };

    setSubmitLoading(true);

    dispatch(createQuotation(payload)).then((resp) => {
      setSubmitLoading(false);

      if (resp.meta.requestStatus === "fulfilled") {
        addToast({
          title: "SUCCESS",
          description: "Quotation created successfully.",
          color: "success",
        });

        quotationModal.onClose();
        resetQuotationForm(quotationDefaultValues);
        fetchQuotations();
      } else {
        addToast({
          title: "ERROR",
          description:
            resp?.payload?.message ||
            resp?.payload?.data?.message ||
            resp?.payload ||
            "Quotation creation failed.",
          color: "danger",
        });
      }
    });
  };

  const onSubmitRegisterVendor = (values) => {
    const payload = {
      mappingId: Number(values?.mappingId),
      productId: Number(values?.productId || solutionId),
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

    addToast({
      title: "INFO",
      description: "Payload prepared. Connect registration API dispatch here.",
      color: "primary",
    });
  };

  const onSearchChange = useCallback((value) => {
    setFilterValue(value || "");
  }, []);

  const onClear = useCallback(() => {
    setFilterValue("");
  }, []);

  const onRowsPerPageChange = useCallback((e) => {
    setFilteration({
      page: 1,
      size: Number(e.target.value),
    });
  }, []);

  const getVendorOptionLabel = (vendor) => {
    return (
      vendor?.name ||
      vendor?.vendorName ||
      vendor?.fullName ||
      vendor?.email ||
      `Vendor ${vendor?.id || vendor?.vendorId}`
    );
  };

  const getStatusColor = (status) => {
    const value = String(status || "").toUpperCase();

    if (value === "ACTIVE") return "success";
    if (value === "INACTIVE") return "default";
    if (value === "BLACKLISTED" || value === "SUSPENDED") return "danger";
    if (value === "UNDER_REVIEW") return "warning";

    return "primary";
  };

  const handleSubmitChat = () => {
    const message = chatMessage.trim();

    if (!message && !chatAttachment) return;

    const attachmentData = chatAttachment
      ? {
          name: chatAttachment.name,
          size: chatAttachment.size,
          type: chatAttachment.type,
          url: URL.createObjectURL(chatAttachment),
        }
      : null;

    setChatList((prev) => [
      ...prev,
      {
        id: Date.now(),
        sender: "me",
        senderName: "Corpseed",
        message,
        time: dayjs().format("hh:mm A"),
        attachment: attachmentData,
      },
    ]);

    setChatMessage("");
    setChatAttachment(null);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleOpenChatHistory = (rowData) => {
    setSelectedRfq(rowData);
    setChatDrawerOpen(true);
  };

  const renderCell = useCallback((rowData, columnKey) => {
    switch (columnKey) {
      case "quotationNumber":
        return (
          <div className="flex flex-col">
            <span className="font-semibold text-foreground">
              {rowData?.quotationNumber || "-"}
            </span>
            <span className="text-xs text-default-500">
              ID: {rowData?.id || "-"}
            </span>
          </div>
        );

      case "vendorRfq":
        return (
          <div className="flex flex-col">
            <span className="text-sm font-medium">
              Vendor ID: {rowData?.vendorId || "-"}
            </span>
            <span className="text-xs text-default-500">
              RFQ ID: {rowData?.rfqId || "-"}
            </span>
            <span className="text-xs text-default-500">
              RFQ Vendor ID: {rowData?.rfqVendorId || "-"}
            </span>
          </div>
        );

      case "dates":
        return (
          <div className="flex flex-col gap-1 text-xs">
            <span>
              Quotation:{" "}
              {rowData?.quotationDate
                ? dayjs(rowData.quotationDate).format("DD-MM-YYYY")
                : "-"}
            </span>
            <span>
              Valid Till:{" "}
              {rowData?.validTill
                ? dayjs(rowData.validTill).format("DD-MM-YYYY")
                : "-"}
            </span>
            <span>Delivery: {rowData?.deliveryDays ?? "-"} days</span>
          </div>
        );

      case "commercials":
        return (
          <div className="flex flex-col gap-1">
            <Chip size="sm" variant="flat">
              {rowData?.currency || "INR"}
            </Chip>
            <span className="text-xs text-default-500">
              Items: {rowData?.items?.length || 0}
            </span>
          </div>
        );

      case "paymentTerms":
        return (
          <div className="max-w-[240px]">
            <p className="truncate text-sm" title={rowData?.paymentTerms}>
              {rowData?.paymentTerms || "-"}
            </p>
            <p
              className="truncate text-xs text-default-500"
              title={rowData?.warrantyTerms}
            >
              Warranty: {rowData?.warrantyTerms || "-"}
            </p>
          </div>
        );

      case "quotationAttachmentUrl":
        return rowData?.quotationAttachmentUrl ? (
          <a
            href={rowData.quotationAttachmentUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 text-xs font-medium text-primary"
          >
            View <ExternalLink size={13} />
          </a>
        ) : (
          <Chip size="sm" variant="flat">
            Not Attached
          </Chip>
        );

      case "createdBy":
        return <span className="text-sm">{rowData?.createdBy || "-"}</span>;

      case "actions":
        return (
          <Dropdown>
            <DropdownTrigger>
              <Button size="sm" isIconOnly variant="light">
                <EllipsisVertical size={18} />
              </Button>
            </DropdownTrigger>

            <DropdownMenu>
              <DropdownItem
                key="view"
                startContent={<Eye size={15} />}
                onPress={() => handleView(rowData)}
              >
                View
              </DropdownItem>
            </DropdownMenu>
          </Dropdown>
        );

      default:
        return rowData?.[columnKey] || "-";
    }
  }, []);

  const topContent = useMemo(() => {
    return (
      <div className="flex flex-col gap-4">
        <div className="flex items-end justify-between gap-3">
          <Input
            isClearable
            className="w-full sm:max-w-[35%]"
            placeholder="Search ..."
            startContent={<Search size={18} />}
            value={filterValue}
            onClear={onClear}
            onValueChange={onSearchChange}
          />

          <div className="flex gap-3">
            <Button
              color="primary"
              startContent={<Plus size={17} />}
              //   onPress={handleOpenCreateModal}
              onPress={() => handleOpenRegisterQuote()}
            >
              Add Quote
            </Button>
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
          onChange={(page) => {
            setFilteration((prev) => ({
              ...prev,
              page,
            }));
          }}
        />
      </div>
    );
  }, [filteration.page, pages]);

  return (
    <>
      <div className="flex flex-col gap-4">
        <h1 className="mb-1 font-sans text-2xl font-medium">Quote</h1>

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
              <TableRow key={item?.mappingId || item?.id || item?.vendorId}>
                {(columnKey) => (
                  <TableCell>{renderCell(item, columnKey)}</TableCell>
                )}
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <Modal
        isOpen={viewModal.isOpen}
        onOpenChange={viewModal.onOpenChange}
        size="4xl"
        scrollBehavior="inside"
      >
        <ModalContent>
          <ModalHeader className="border-b">RFQ Details</ModalHeader>

          <ModalBody className="bg-gray-50 p-4">
            {selectedRfq && (
              <div className="space-y-4">
                <div className="rounded-xl border bg-white p-4 shadow-sm">
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                    <div>
                      <p className="text-xs text-default-500">Vendor</p>
                      <p className="font-semibold">
                        {selectedRfq?.vendorName || "-"}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-default-500">Product</p>
                      <p className="font-semibold">
                        {selectedRfq?.productName || "-"}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-default-500">Email</p>
                      <p className="font-semibold">
                        {selectedRfq?.email || "-"}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-default-500">Status</p>
                      <Chip
                        size="sm"
                        color={getStatusColor(selectedRfq?.status)}
                        variant="flat"
                      >
                        {selectedRfq?.status || "-"}
                      </Chip>
                    </div>
                  </div>

                  <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-4">
                    <div>
                      <p className="text-xs text-default-500">Mobile</p>
                      <p className="font-medium">
                        {selectedRfq?.mobile || "-"}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-default-500">GST Number</p>
                      <p className="font-medium">
                        {selectedRfq?.gstNumber || "-"}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-default-500">PAN Number</p>
                      <p className="font-medium">
                        {selectedRfq?.panNumber || "-"}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-default-500">Created Date</p>
                      <p className="font-medium">
                        {selectedRfq?.createdDate
                          ? dayjs(selectedRfq.createdDate).format(
                              "DD-MM-YYYY hh:mm A",
                            )
                          : "-"}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="rounded-xl border bg-white p-4 shadow-sm">
                  <p className="text-xs text-default-500">Email Subject</p>
                  <p className="mt-1 font-semibold">
                    {selectedRfq?.emailSubject || "-"}
                  </p>
                </div>

                <div className="overflow-hidden rounded-xl border bg-white shadow-sm">
                  <div className="border-b bg-gray-50 px-4 py-3">
                    <p className="text-sm font-semibold text-gray-900">
                      Email Body
                    </p>
                  </div>

                  <div className="p-4">
                    {hasHtmlContent(selectedRfq?.emailBody) ? (
                      <div
                        className="proposal-content tiptap-preview force-preview-text"
                        dangerouslySetInnerHTML={{
                          __html: selectedRfq?.emailBody,
                        }}
                      />
                    ) : (
                      <div className="rounded-xl border border-dashed bg-gray-50 py-8 text-center text-sm text-default-500">
                        No email body found.
                      </div>
                    )}
                  </div>
                </div>

                {selectedRfq?.agreementAttachment && (
                  <div className="rounded-xl border bg-white p-4 shadow-sm">
                    <a
                      href={selectedRfq.agreementAttachment}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-white"
                    >
                      View Agreement <ExternalLink size={14} />
                    </a>
                  </div>
                )}
              </div>
            )}
          </ModalBody>

          <ModalFooter>
            <Button variant="flat" onPress={viewModal.onClose}>
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
      <Modal
        isOpen={quotationModal.isOpen}
        onOpenChange={quotationModal.onOpenChange}
        size="4xl"
        isDismissable={false}
      >
        <ModalContent>
          <>
            <ModalHeader className="border-b">Add Quote</ModalHeader>

            <form onSubmit={handleQuotationFormSubmit(onSubmitQuotation)}>
              <ModalBody>
                <div className="max-h-[65vh] overflow-auto p-2">
                  <div className="rounded-xl border bg-gray-50 p-4">
                    <h3 className="mb-3 text-sm font-semibold text-gray-900">
                      Quotation Basic Details
                    </h3>

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          
                      <Controller
                        name="rfqVendorId"
                        control={quotationControl}
                        render={({ field }) => (
                          <Input
                            label="RFQ Vendor ID"
                            isRequired
                            value={field.value}
                            onChange={(e) => field.onChange(e.target.value)}
                            isInvalid={!!quotationErrors.rfqVendorId}
                            errorMessage={quotationErrors.rfqVendorId?.message}
                          />
                        )}
                      />

                      <Controller
                        name="vendorId"
                        control={quotationControl}
                        render={({ field }) => (
                          <Input
                            label="Vendor ID"
                            isRequired
                            value={field.value}
                            onChange={(e) => field.onChange(e.target.value)}
                            isInvalid={!!quotationErrors.vendorId}
                            errorMessage={quotationErrors.vendorId?.message}
                          />
                        )}
                      />

                      <Controller
                        name="quotationNumber"
                        control={quotationControl}
                        render={({ field }) => (
                          <Input
                            label="Quotation Number"
                            isRequired
                            value={field.value}
                            onChange={(e) => field.onChange(e.target.value)}
                            isInvalid={!!quotationErrors.quotationNumber}
                            errorMessage={
                              quotationErrors.quotationNumber?.message
                            }
                          />
                        )}
                      />

                      <Controller
                        name="quotationDate"
                        control={quotationControl}
                        render={({ field }) => (
                          <Input
                            label="Quotation Date"
                            type="datetime-local"
                            isRequired
                            value={field.value}
                            onChange={(e) => field.onChange(e.target.value)}
                            isInvalid={!!quotationErrors.quotationDate}
                            errorMessage={
                              quotationErrors.quotationDate?.message
                            }
                          />
                        )}
                      />

                      <Controller
                        name="validTill"
                        control={quotationControl}
                        render={({ field }) => (
                          <Input
                            label="Valid Till"
                            type="datetime-local"
                            isRequired
                            value={field.value}
                            onChange={(e) => field.onChange(e.target.value)}
                            isInvalid={!!quotationErrors.validTill}
                            errorMessage={quotationErrors.validTill?.message}
                          />
                        )}
                      />

                      <Controller
                        name="currency"
                        control={quotationControl}
                        render={({ field }) => (
                          <Input
                            label="Currency"
                            isRequired
                            value={field.value}
                            onChange={(e) => field.onChange(e.target.value)}
                            isInvalid={!!quotationErrors.currency}
                            errorMessage={quotationErrors.currency?.message}
                          />
                        )}
                      />

                      <Controller
                        name="deliveryDays"
                        control={quotationControl}
                        render={({ field }) => (
                          <Input
                            label="Delivery Days"
                            isRequired
                            value={field.value}
                            onChange={(e) =>
                              field.onChange(e.target.value.replace(/\D/g, ""))
                            }
                            isInvalid={!!quotationErrors.deliveryDays}
                            errorMessage={quotationErrors.deliveryDays?.message}
                          />
                        )}
                      />

                      <Controller
                        name="createdBy"
                        control={quotationControl}
                        render={({ field }) => (
                          <Input
                            label="Created By"
                            isRequired
                            value={field.value}
                            onChange={(e) => field.onChange(e.target.value)}
                            isInvalid={!!quotationErrors.createdBy}
                            errorMessage={quotationErrors.createdBy?.message}
                          />
                        )}
                      />
                    </div>
                  </div>

                  <div className="mt-4 rounded-xl border bg-white p-4">
                    <h3 className="mb-3 text-sm font-semibold text-gray-900">
                      Terms
                    </h3>

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <Controller
                        name="paymentTerms"
                        control={quotationControl}
                        render={({ field }) => (
                          <Input
                            label="Payment Terms"
                            isRequired
                            value={field.value}
                            onChange={(e) => field.onChange(e.target.value)}
                            isInvalid={!!quotationErrors.paymentTerms}
                            errorMessage={quotationErrors.paymentTerms?.message}
                          />
                        )}
                      />

                      <Controller
                        name="warrantyTerms"
                        control={quotationControl}
                        render={({ field }) => (
                          <Input
                            label="Warranty Terms"
                            value={field.value}
                            onChange={(e) => field.onChange(e.target.value)}
                          />
                        )}
                      />

                      <Controller
                        name="remarks"
                        control={quotationControl}
                        render={({ field }) => (
                          <Input
                            label="Remarks"
                            value={field.value}
                            onChange={(e) => field.onChange(e.target.value)}
                          />
                        )}
                      />

                      <Controller
                        name="quotationAttachmentUrl"
                        control={quotationControl}
                        render={({ field, fieldState: { error } }) => (
                          <FileUploader
                            label="Quotation Attachment"
                            value={field.value}
                            onChange={(value) => field.onChange(value)}
                            errorMessage={error?.message}
                            isInvalid={!!error}
                          />
                        )}
                      />
                    </div>
                  </div>

                  <div className="mt-4 rounded-xl border bg-white p-4">
                    <div className="mb-3 flex items-center justify-between">
                      <h3 className="text-sm font-semibold text-gray-900">
                        Quotation Items
                      </h3>

                      <Button
                        size="sm"
                        color="primary"
                        variant="flat"
                        startContent={<Plus size={15} />}
                        type="button"
                        onPress={() =>
                          appendQuotationItem({
                            itemType: "MATERIAL",
                            itemName: "",
                            description: "",
                            quantity: "",
                            unit: "",
                            unitRate: "",
                            taxPercent: "",
                            remarks: "",
                          })
                        }
                      >
                        Add Item
                      </Button>
                    </div>

                    <div className="space-y-4">
                      {quotationItemFields.map((item, index) => (
                        <div
                          key={item.id}
                          className="rounded-xl border bg-gray-50 p-4"
                        >
                          <div className="mb-3 flex items-center justify-between">
                            <p className="text-sm font-semibold text-gray-800">
                              Item #{index + 1}
                            </p>

                            {quotationItemFields.length > 1 && (
                              <Button
                                size="sm"
                                color="danger"
                                variant="flat"
                                type="button"
                                onPress={() => removeQuotationItem(index)}
                              >
                                Remove
                              </Button>
                            )}
                          </div>

                          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                            <Controller
                              name={`items.${index}.itemType`}
                              control={quotationControl}
                              render={({ field }) => (
                                <Select
                                  label="Item Type"
                                  isRequired
                                  selectedKeys={
                                    field.value ? [field.value] : []
                                  }
                                  onSelectionChange={(keys) =>
                                    field.onChange(Array.from(keys)[0])
                                  }
                                >
                                  <SelectItem key="MATERIAL">
                                    MATERIAL
                                  </SelectItem>
                                  <SelectItem key="SERVICE">SERVICE</SelectItem>
                                </Select>
                              )}
                            />

                            <Controller
                              name={`items.${index}.itemName`}
                              control={quotationControl}
                              render={({ field }) => (
                                <Input
                                  label="Item Name"
                                  isRequired
                                  value={field.value}
                                  onChange={(e) =>
                                    field.onChange(e.target.value)
                                  }
                                  isInvalid={
                                    !!quotationErrors.items?.[index]?.itemName
                                  }
                                  errorMessage={
                                    quotationErrors.items?.[index]?.itemName
                                      ?.message
                                  }
                                />
                              )}
                            />

                            <Controller
                              name={`items.${index}.quantity`}
                              control={quotationControl}
                              render={({ field }) => (
                                <Input
                                  label="Quantity"
                                  isRequired
                                  value={field.value}
                                  onChange={(e) =>
                                    field.onChange(e.target.value)
                                  }
                                  isInvalid={
                                    !!quotationErrors.items?.[index]?.quantity
                                  }
                                  errorMessage={
                                    quotationErrors.items?.[index]?.quantity
                                      ?.message
                                  }
                                />
                              )}
                            />

                            <Controller
                              name={`items.${index}.unit`}
                              control={quotationControl}
                              render={({ field }) => (
                                <Input
                                  label="Unit"
                                  isRequired
                                  value={field.value}
                                  onChange={(e) =>
                                    field.onChange(e.target.value)
                                  }
                                  isInvalid={
                                    !!quotationErrors.items?.[index]?.unit
                                  }
                                  errorMessage={
                                    quotationErrors.items?.[index]?.unit
                                      ?.message
                                  }
                                />
                              )}
                            />

                            <Controller
                              name={`items.${index}.unitRate`}
                              control={quotationControl}
                              render={({ field }) => (
                                <Input
                                  label="Unit Rate"
                                  isRequired
                                  value={field.value}
                                  onChange={(e) =>
                                    field.onChange(e.target.value)
                                  }
                                  isInvalid={
                                    !!quotationErrors.items?.[index]?.unitRate
                                  }
                                  errorMessage={
                                    quotationErrors.items?.[index]?.unitRate
                                      ?.message
                                  }
                                />
                              )}
                            />

                            <Controller
                              name={`items.${index}.taxPercent`}
                              control={quotationControl}
                              render={({ field }) => (
                                <Input
                                  label="Tax %"
                                  value={field.value}
                                  onChange={(e) =>
                                    field.onChange(e.target.value)
                                  }
                                />
                              )}
                            />

                            <div className="md:col-span-3">
                              <Controller
                                name={`items.${index}.description`}
                                control={quotationControl}
                                render={({ field }) => (
                                  <Input
                                    label="Description"
                                    value={field.value}
                                    onChange={(e) =>
                                      field.onChange(e.target.value)
                                    }
                                  />
                                )}
                              />
                            </div>

                            <div className="md:col-span-3">
                              <Controller
                                name={`items.${index}.remarks`}
                                control={quotationControl}
                                render={({ field }) => (
                                  <Input
                                    label="Remarks"
                                    value={field.value}
                                    onChange={(e) =>
                                      field.onChange(e.target.value)
                                    }
                                  />
                                )}
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </ModalBody>

              <ModalFooter>
                <Button
                  variant="flat"
                  type="button"
                  onPress={() => {
                    quotationModal.onClose();
                    resetQuotationForm(quotationDefaultValues);
                  }}
                >
                  Cancel
                </Button>

                <Button color="primary" type="submit">
                  Submit
                </Button>
              </ModalFooter>
            </form>
          </>
        </ModalContent>
      </Modal>

      <Modal
        isOpen={registerVendorModal.isOpen}
        onOpenChange={registerVendorModal.onOpenChange}
        size="4xl"
        isDismissable={false}
      >
        <ModalContent>
          <>
            <ModalHeader className="border-b">Register vendor</ModalHeader>

            <form onSubmit={handleRegisterVendorSubmit(onSubmitRegisterVendor)}>
              <ModalBody>
                <div className="max-h-[65vh] overflow-auto p-2">
                  <div className="rounded-xl border bg-gray-50 p-4">
                    <h3 className="mb-3 text-sm font-semibold text-gray-900">
                      Auto Fetched Information
                    </h3>

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                      <Controller
                        name="vendorName"
                        control={registerControl}
                        render={({ field }) => (
                          <Input
                            label="Vendor Name"
                            value={field.value}
                            isReadOnly
                          />
                        )}
                      />

                      <Controller
                        name="productName"
                        control={registerControl}
                        render={({ field }) => (
                          <Input
                            label="Product / Service"
                            value={field.value}
                            isReadOnly
                          />
                        )}
                      />

                      <Controller
                        name="email"
                        control={registerControl}
                        render={({ field }) => (
                          <Input label="Email" value={field.value} isReadOnly />
                        )}
                      />

                      <Controller
                        name="mobile"
                        control={registerControl}
                        render={({ field }) => (
                          <Input
                            label="Mobile"
                            value={field.value}
                            isReadOnly
                          />
                        )}
                      />

                      <Controller
                        name="gstNumber"
                        control={registerControl}
                        render={({ field }) => (
                          <Input
                            label="GST Number"
                            value={field.value}
                            isReadOnly
                          />
                        )}
                      />

                      <Controller
                        name="panNumber"
                        control={registerControl}
                        render={({ field }) => (
                          <Input
                            label="PAN Number"
                            value={field.value}
                            isReadOnly
                          />
                        )}
                      />
                    </div>
                  </div>

                  <div className="mt-4 rounded-xl border bg-white p-4">
                    <h3 className="mb-3 text-sm font-semibold text-gray-900">
                      Registration Details
                    </h3>

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <Controller
                        name="pricePerUnit"
                        control={registerControl}
                        render={({ field }) => (
                          <Input
                            label="Price Per Unit"
                            isRequired
                            value={field.value}
                            onChange={(e) => field.onChange(e.target.value)}
                            errorMessage={registerErrors.pricePerUnit?.message}
                            isInvalid={!!registerErrors.pricePerUnit}
                          />
                        )}
                      />

                      <Controller
                        name="unit"
                        control={registerControl}
                        render={({ field }) => (
                          <Select
                            selectedKeys={
                              field.value ? new Set([field.value]) : new Set([])
                            }
                            onSelectionChange={(keys) =>
                              field.onChange(Array.from(keys)?.[0] || "")
                            }
                            label="Unit"
                            isRequired
                            isInvalid={!!registerErrors.unit}
                            errorMessage={registerErrors.unit?.message}
                          >
                            <SelectItem key="1">1</SelectItem>
                            <SelectItem key="2">2</SelectItem>
                            <SelectItem key="3">3</SelectItem>
                            <SelectItem key="4">4</SelectItem>
                            <SelectItem key="5">5</SelectItem>
                            <SelectItem key="PER_METRIC_TONNE">
                              PER_METRIC_TONNE
                            </SelectItem>
                            <SelectItem key="PER_KG">PER_KG</SelectItem>
                          </Select>
                        )}
                      />

                      <Controller
                        name="paymentTerms"
                        control={registerControl}
                        render={({ field, fieldState: { error } }) => (
                          <NewSelect
                            isRequired
                            label="Payment term"
                            data={paymentTypeList || []}
                            labelKey="name"
                            valueKey="id"
                            value={field.value}
                            onChange={(e) => field.onChange(e)}
                            errorMessage={registerErrors.paymentTerms?.message}
                            isInvalid={!!registerErrors.paymentTerms}
                          />
                        )}
                      />

                      <Controller
                        name="timelineDays"
                        control={registerControl}
                        render={({ field }) => (
                          <Input
                            label="Timeline Days"
                            isRequired
                            value={field.value}
                            onChange={(e) => field.onChange(e.target.value)}
                            errorMessage={registerErrors.timelineDays?.message}
                            isInvalid={!!registerErrors.timelineDays}
                          />
                        )}
                      />

                      <Controller
                        name="quotationValidityDays"
                        control={registerControl}
                        render={({ field }) => (
                          <Input
                            label="Quotation Validity Days"
                            value={field.value}
                            onChange={(e) => field.onChange(e.target.value)}
                          />
                        )}
                      />

                      <Controller
                        name="remarks"
                        control={registerControl}
                        render={({ field }) => (
                          <Input
                            label="Remarks"
                            value={field.value}
                            onChange={(e) => field.onChange(e.target.value)}
                          />
                        )}
                      />
                    </div>
                  </div>

                  <div className="mt-4 rounded-xl border bg-white p-4">
                    <h3 className="mb-3 text-sm font-semibold text-gray-900">
                      Attachments
                    </h3>

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                      <Controller
                        name="vendorBrochureAttachment"
                        control={registerControl}
                        render={({ field, fieldState: { error } }) => (
                          <FileUploader
                            isRequired
                            label="Vendor Brochure"
                            value={field.value}
                            onChange={(value) => field.onChange(value)}
                            errorMessage={error?.message}
                            isInvalid={!!error}
                          />
                        )}
                      />

                      <Controller
                        name="priceListAttachment"
                        control={registerControl}
                        render={({ field, fieldState: { error } }) => (
                          <FileUploader
                            isRequired
                            label="Vendor Form"
                            value={field.value}
                            onChange={(value) => field.onChange(value)}
                            errorMessage={error?.message}
                            isInvalid={!!error}
                          />
                        )}
                      />

                      <Controller
                        name="agreementAttachment"
                        control={registerControl}
                        render={({ field, fieldState: { error } }) => (
                          <FileUploader
                            isRequired
                            label="Aggrement Attachment"
                            value={field.value}
                            onChange={(value) => field.onChange(value)}
                            errorMessage={error?.message}
                            isInvalid={!!error}
                          />
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
                    registerVendorModal.onClose();
                    resetRegisterVendorForm(vendorRegistrationDefaultValues);
                  }}
                >
                  Cancel
                </Button>

                <Button color="primary" type="submit" isLoading={submitLoading}>
                  Submit Quotation
                </Button>
              </ModalFooter>
            </form>
          </>
        </ModalContent>
      </Modal>

      {chatDrawerOpen && (
        <div className="fixed inset-0 z-[9999] flex justify-end">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setChatDrawerOpen(false)}
          />

          <div className="relative z-10 flex h-full w-full max-w-[440px] flex-col bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b bg-white px-4 py-3">
              <div>
                <h2 className="text-base font-semibold text-gray-900">
                  RFQ Chat History
                </h2>

                <p className="text-xs text-gray-500">
                  {selectedRfq?.vendorName
                    ? `Vendor: ${selectedRfq.vendorName}`
                    : "Dummy vendor communication timeline"}
                </p>
              </div>

              <Button
                isIconOnly
                size="sm"
                variant="light"
                onPress={() => setChatDrawerOpen(false)}
              >
                <X size={18} />
              </Button>
            </div>

            <div className="flex-1 space-y-3 overflow-y-auto bg-gray-50 p-4">
              {chatList.map((chat) => {
                const isMine = chat.sender === "me";

                return (
                  <div
                    key={chat.id}
                    className={`flex ${isMine ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[82%] rounded-2xl px-3 py-2 shadow-sm ${
                        isMine
                          ? "rounded-br-sm bg-primary text-white"
                          : "rounded-bl-sm border bg-white text-gray-900"
                      }`}
                    >
                      <p
                        className={`mb-1 text-[11px] font-semibold ${
                          isMine ? "text-white/80" : "text-gray-500"
                        }`}
                      >
                        {chat.senderName}
                      </p>

                      {chat.message && (
                        <p className="whitespace-pre-wrap text-sm leading-5">
                          {chat.message}
                        </p>
                      )}

                      {chat.attachment && (
                        <a
                          href={chat.attachment.url}
                          target="_blank"
                          rel="noreferrer"
                          className={`mt-2 flex items-center gap-2 rounded-xl border px-3 py-2 text-xs ${
                            isMine
                              ? "border-white/30 bg-white/10 text-white"
                              : "border-gray-200 bg-gray-50 text-gray-700"
                          }`}
                        >
                          <File size={15} />
                          <span className="line-clamp-1">
                            {chat.attachment.name}
                          </span>
                        </a>
                      )}

                      <p
                        className={`mt-1 text-right text-[10px] ${
                          isMine ? "text-white/70" : "text-gray-400"
                        }`}
                      >
                        {chat.time}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            {chatAttachment && (
              <div className="border-t bg-white px-4 py-2">
                <div className="flex items-center justify-between rounded-xl border bg-gray-50 px-3 py-2">
                  <div className="flex min-w-0 items-center gap-2">
                    <File size={16} className="shrink-0 text-gray-500" />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-gray-800">
                        {chatAttachment.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {(chatAttachment.size / 1024).toFixed(1)} KB
                      </p>
                    </div>
                  </div>

                  <Button
                    isIconOnly
                    size="sm"
                    variant="light"
                    color="danger"
                    onPress={() => {
                      setChatAttachment(null);

                      if (fileInputRef.current) {
                        fileInputRef.current.value = "";
                      }
                    }}
                  >
                    <X size={15} />
                  </Button>
                </div>
              </div>
            )}

            <div className="border-t bg-white p-3">
              <div className="flex items-end gap-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];

                    if (file) {
                      setChatAttachment(file);
                    }
                  }}
                />

                <Button
                  isIconOnly
                  variant="flat"
                  type="button"
                  onPress={() => fileInputRef.current?.click()}
                >
                  <Paperclip size={18} />
                </Button>

                <Input
                  placeholder="Type a message..."
                  value={chatMessage}
                  onValueChange={setChatMessage}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSubmitChat();
                    }
                  }}
                />

                <Button
                  isIconOnly
                  color="primary"
                  type="button"
                  onPress={handleSubmitChat}
                  isDisabled={!chatMessage.trim() && !chatAttachment}
                >
                  <Send size={18} />
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Quote;
