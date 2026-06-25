import React, { useCallback, useEffect, useMemo, useState } from "react";
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
  useDisclosure,
  DatePicker,
} from "@heroui/react";
import { parseDate } from "@internationalized/date";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useParams } from "react-router-dom";
import {
  ChevronDown,
  EllipsisVertical,
  ExternalLink,
  Eye,
  FilePlusIcon,
  FileText,
  Plus,
  Search,
} from "lucide-react";
import dayjs from "dayjs";

import FileUploader from "../../components/FileUploader";
import {
  createQuotation,
  getAllQuotations,
  getRFQById,
  getVendorsByVendorIdandRFQId,
  createVendorFinalization,
  getVendorFinalizationByRfqId,
  sendVendorOnboardingForm,
  createLegalRequest,
} from "../../toolkit/slices/vendorsSlice";
import NewSelect from "../../components/NewSelect";
import { getAllPaymentType } from "../../toolkit/slices/settingSlice";
import {
  getUsersByDepartment,
  sendAgreementToVendor,
  getAllVendorQuotationLegalRequests,
} from "../../toolkit/slices/operationSlice";

const columns = [
  { name: "QUOTATION NO.", uid: "quotationNumber" },
  { name: "VENDOR / RFQ", uid: "vendorRfq" },
  { name: "DATES", uid: "dates" },
  { name: "COMMERCIALS", uid: "commercials" },
  { name: "PAYMENT TERMS", uid: "paymentTerms" },
  { name: "ATTACHMENTS", uid: "attachments" },
  { name: "CREATED BY", uid: "createdBy" },
  { name: "ACTIONS", uid: "actions" },
];

const INITIAL_VISIBLE_COLUMNS = [
  "quotationNumber",
  "vendorRfq",
  "dates",
  "commercials",
  "paymentTerms",
  "attachments",
  "createdBy",
  "actions",
];

const quotationStatusOptions = [
  "ALL",
  "DRAFT",
  "SUBMITTED",
  "REVISED",
  "UNDER_COMPARISON",
  "AGREEMENT_SENT_TO_PROCUREMENT",
  "AGREEMENT_SENT_TO_VENDOR",
  "ACCEPTED",
  "PARTIALLY_ACCEPTED",
  "REJECTED",
  "CANCELLED",
];

const quotationDefaultValues = {
  validFrom: "",
  validTill: "",
  currency: "INR",
  deliveryDays: "",
  paymentTerms: "",
  warrantyTerms: "",
  remarks: "",
  quotationAttachmentUrl: "",
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

const quotationSchema = z.object({
  validFrom: z.string().min(1, "Please select valid from date"),
  validTill: z.string().min(1, "Please select valid till date"),
  currency: z.string().min(1, "Please enter currency"),
  deliveryDays: z.string().min(1, "Please enter delivery days"),
  paymentTerms: z.string().min(1, "Please enter payment terms"),
  warrantyTerms: z.string().optional(),
  remarks: z.string().optional(),
  quotationAttachmentUrl: z.any().optional(),
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

const onboardingDefaultValues = {
  subject: "Vendor Onboarding Documents Required",
  message: "Please fill and submit the shared onboarding documents.",
  serviceCategory: "",
  onboardedFor: "",
  remarks: "",
  vendorRegistrationForm: "",
  signedNda: "",
  signedAgreement: "",
};

const onboardingSchema = z.object({
  subject: z.string().min(1, "Please enter subject"),
  message: z.string().min(1, "Please enter message"),
  serviceCategory: z.string().optional(),
  onboardedFor: z.string().optional(),
  remarks: z.string().optional(),
  vendorRegistrationForm: z.any().refine((value) => Boolean(value), {
    message: "Please upload vendor registration form",
  }),
  signedNda: z.any().optional(),
  signedAgreement: z.any().optional(),
});

const legalRequestDefaultValues = {
  legalRequestTitle: "",
  notes: "",
  statusReason: "",
  assignedToLegal: "",
};

const legalRequestSchema = z.object({
  legalRequestTitle: z.string().min(1, "Please enter legal request title"),
  notes: z.string().min(1, "Please enter notes"),
  statusReason: z.string().optional(),
  assignedToLegal: z.string().min(1, "Please enter assigned legal user id"),
});

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
  const location = useLocation();

  const { userId, rfqId, solutionId } = useParams();

  const currentUser = useSelector((state) => state.auth.currentUser);
  const paymentTypeList = useSelector((state) => state.setting.paymentTypeList);
  const legalDepartmentUsers = useSelector(
    (state) => state.operation.departmentUsers || [],
  );
  const vendorLegalRequestsResponse = useSelector(
    (state) => state.operation.vendorLegalRequests,
  );

  const quotationModal = useDisclosure();
  const viewModal = useDisclosure();
  const registerVendorModal = useDisclosure();
  const onboardingModal = useDisclosure();
  const legalRequestModal = useDisclosure();

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
    control: onboardingControl,
    handleSubmit: handleOnboardingSubmit,
    reset: resetOnboardingForm,
    formState: { errors: onboardingErrors },
  } = useForm({
    resolver: zodResolver(onboardingSchema),
    defaultValues: onboardingDefaultValues,
  });

  const {
    control: legalRequestControl,
    handleSubmit: handleLegalRequestSubmit,
    reset: resetLegalRequestForm,
    formState: { errors: legalRequestErrors },
  } = useForm({
    resolver: zodResolver(legalRequestSchema),
    defaultValues: legalRequestDefaultValues,
  });

  const [quotationResponse, setQuotationResponse] = useState(null);
  const [selectedQuotation, setSelectedQuotation] = useState(null);
  const [selectedquote, setSelectedQuote] = useState(null);
  const [selectedVendorFinalization, setSelectedVendorFinalization] =
    useState(null);

  const [rfqDetails, setRfqDetails] = useState(null);
  const [rfqVendorDetails, setRfqVendorDetails] = useState(null);
  const [vendorFinalizations, setVendorFinalizations] = useState([]);

  const [loading, setLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);

  const [filterValue, setFilterValue] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const [visibleColumns, setVisibleColumns] = useState(
    new Set(INITIAL_VISIBLE_COLUMNS),
  );

  const [filteration, setFilteration] = useState({
    page: 1,
    size: 10,
  });

  const queryParams = useMemo(() => {
    return new URLSearchParams(location.search);
  }, [location.search]);

  const routeVendorId = useMemo(() => {
    return location.state?.vendorId || queryParams.get("vendorId") || "";
  }, [location.state, queryParams]);

  const quotationList = useMemo(() => {
    return normalizePageContent(quotationResponse);
  }, [quotationResponse]);

  const vendorLegalRequests = useMemo(() => {
    return normalizePageContent(vendorLegalRequestsResponse);
  }, [vendorLegalRequestsResponse]);

  const count = useMemo(() => {
    return getTotalElements(quotationResponse, quotationList.length);
  }, [quotationResponse, quotationList.length]);

  const headerColumns = useMemo(() => {
    if (visibleColumns === "all") return columns;

    return columns.filter((column) =>
      Array.from(visibleColumns).includes(column.uid),
    );
  }, [visibleColumns]);

  const filteredItems = useMemo(() => {
    let filtered = [...quotationList];

    if (statusFilter !== "ALL") {
      filtered = filtered.filter((item) => item?.status === statusFilter);
    }

    if (filterValue) {
      filtered = filtered.filter((item) =>
        Object.values(item || {}).some((value) =>
          String(value || "")
            .toLowerCase()
            .includes(filterValue.toLowerCase()),
        ),
      );
    }

    return filtered;
  }, [quotationList, filterValue, statusFilter]);

  const pages = Math.ceil(filteredItems.length / filteration.size) || 1;

  const paginatedItems = useMemo(() => {
    const start = (filteration.page - 1) * filteration.size;
    const end = start + filteration.size;

    return filteredItems.slice(start, end);
  }, [filteredItems, filteration.page, filteration.size]);

  useEffect(() => {
    dispatch(getAllPaymentType());
  }, [dispatch]);

  useEffect(() => {
    dispatch(getUsersByDepartment({ id: 17 }));
  }, [dispatch]);

  const fetchQuotations = useCallback(() => {
    if (!rfqId) return;

    setLoading(true);

    dispatch(getAllQuotations(rfqId)).then((resp) => {
      setLoading(false);

      if (resp.meta.requestStatus === "fulfilled") {
        setQuotationResponse(resp.payload);
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
  }, [dispatch, rfqId]);

  const fetchRFQDetails = useCallback(() => {
    if (!rfqId) return;

    dispatch(getRFQById(rfqId)).then((resp) => {
      if (resp.meta.requestStatus === "fulfilled") {
        setRfqDetails(resp.payload);
      }
    });
  }, [dispatch, rfqId]);

  const fetchRFQVendorDetails = useCallback(() => {
    if (!rfqId || !routeVendorId) return;

    dispatch(
      getVendorsByVendorIdandRFQId({
        rfqId: Number(rfqId),
        vendorId: Number(routeVendorId),
      }),
    ).then((resp) => {
      if (resp.meta.requestStatus === "fulfilled") {
        setRfqVendorDetails(resp.payload);
      } else {
        addToast({
          title: "ERROR",
          description:
            resp?.payload?.message ||
            resp?.payload ||
            "Failed to fetch RFQ vendor details.",
          color: "danger",
        });
      }
    });
  }, [dispatch, rfqId, routeVendorId]);

  const fetchVendorFinalizations = useCallback(() => {
    if (!rfqId) return;

    dispatch(
      getVendorFinalizationByRfqId({
        rfqId: Number(rfqId),
      }),
    ).then((resp) => {
      if (resp.meta.requestStatus === "fulfilled") {
        setVendorFinalizations(Array.isArray(resp.payload) ? resp.payload : []);
      } else {
        setVendorFinalizations([]);
      }
    });
  }, [dispatch, rfqId]);

  const fetchVendorLegalRequests = useCallback(() => {
    dispatch(getAllVendorQuotationLegalRequests());
  }, [dispatch]);

  useEffect(() => {
    fetchQuotations();
    fetchRFQDetails();
    fetchRFQVendorDetails();
    fetchVendorFinalizations();
    fetchVendorLegalRequests();
  }, [
    fetchQuotations,
    fetchRFQDetails,
    fetchRFQVendorDetails,
    fetchVendorFinalizations,
    fetchVendorLegalRequests,
  ]);

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

  const getFinalizationForQuotation = useCallback(
    (quotation) => {
      if (!quotation) return null;

      return vendorFinalizations.find(
        (finalization) =>
          Number(finalization?.quotationId) === Number(quotation?.id) &&
          Number(finalization?.rfqVendorId) ===
            Number(quotation?.rfqVendorId) &&
          Number(finalization?.vendorId) === Number(quotation?.vendorId),
      );
    },
    [vendorFinalizations],
  );

  const getLegalRequestForQuotation = useCallback(
    (quotation) => {
      if (!quotation?.id) return null;

      return vendorLegalRequests.find(
        (request) =>
          Number(request?.vendorQuotationId) === Number(quotation.id) &&
          !request?.deleted,
      );
    },
    [vendorLegalRequests],
  );

  const buildDocumentPayload = (documentType, fileValue, fallbackFileName) => {
    const fileUrl = getUploadedFileValue(fileValue);

    if (!fileUrl) {
      return null;
    }

    return {
      documentType,
      fileName:
        fileValue?.fileName ||
        fileValue?.name ||
        fallbackFileName ||
        documentType,
      fileUrl,
      remarks: "",
    };
  };

  const handleOpenAddQuote = () => {
    if (!rfqId || !routeVendorId) {
      addToast({
        title: "ERROR",
        description:
          "Vendor ID is missing. Please open Add Quote from RFQ vendor action.",
        color: "danger",
      });

      return;
    }

    if (!rfqVendorDetails?.rfqVendorId || !rfqVendorDetails?.vendorId) {
      addToast({
        title: "ERROR",
        description: "RFQ vendor details are not loaded yet. Please try again.",
        color: "danger",
      });

      return;
    }

    resetQuotationForm(quotationDefaultValues);
    quotationModal.onOpen();
  };

  const handleView = useCallback(
    (item) => {
      setSelectedQuotation(item);
      viewModal.onOpen();
    },
    [viewModal],
  );

  const onSubmitQuotation = (values) => {
    const resolvedCreatedBy =
      currentUser?.id ||
      currentUser?.userId ||
      currentUser?.employeeId ||
      userId;

    if (
      !rfqId ||
      !rfqVendorDetails?.rfqVendorId ||
      !rfqVendorDetails?.vendorId
    ) {
      addToast({
        title: "ERROR",
        description:
          "RFQ ID, RFQ Vendor ID, or Vendor ID is missing. Please open Add Quote from RFQ vendor action.",
        color: "danger",
      });

      return;
    }

    if (!resolvedCreatedBy) {
      addToast({
        title: "ERROR",
        description: "Created By user is missing. Please login again.",
        color: "danger",
      });

      return;
    }

    const payload = {
      rfqId: Number(rfqId),
      rfqVendorId: Number(rfqVendorDetails.rfqVendorId),
      vendorId: Number(rfqVendorDetails.vendorId),

      quotationNumber: `QTN-${rfqId}-${rfqVendorDetails.vendorId}-${dayjs().format(
        "YYYYMMDDHHmmss",
      )}`,

      quotationDate: new Date().toISOString(),
      validFrom: new Date(values.validFrom).toISOString(),
      validTill: new Date(values.validTill).toISOString(),

      currency: values.currency,
      deliveryDays: Number(values.deliveryDays),
      paymentTerms: values.paymentTerms,
      warrantyTerms: values.warrantyTerms || "",
      remarks: values.remarks || "",
      quotationAttachmentUrl: getUploadedFileValue(
        values.quotationAttachmentUrl,
      ),
      createdBy: Number(resolvedCreatedBy),

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

  const onSearchChange = useCallback((value) => {
    setFilterValue(value || "");

    setFilteration((prev) => ({
      ...prev,
      page: 1,
    }));
  }, []);

  const onClear = useCallback(() => {
    setFilterValue("");

    setFilteration((prev) => ({
      ...prev,
      page: 1,
    }));
  }, []);

  const onRowsPerPageChange = useCallback((e) => {
    setFilteration({
      page: 1,
      size: Number(e.target.value),
    });
  }, []);

  const handleOpenRegisterVendor = (item) => {
    setSelectedQuote(item);

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

  const onSubmitRegisterVendor = (values) => {
    const resolvedCreatedBy =
      currentUser?.id ||
      currentUser?.userId ||
      currentUser?.employeeId ||
      userId;

    const firstQuotationItem =
      selectedquote?.items?.[0] ||
      selectedquote?.quotationItems?.[0] ||
      selectedquote?.item;

    if (
      !rfqId ||
      !selectedquote?.id ||
      !selectedquote?.rfqVendorId ||
      !selectedquote?.vendorId
    ) {
      addToast({
        title: "ERROR",
        description:
          "RFQ, quotation, RFQ vendor, or vendor details are missing.",
        color: "danger",
      });
      return;
    }

    if (!firstQuotationItem?.id) {
      addToast({
        title: "ERROR",
        description:
          "Quotation item is missing. Please fetch quotation details with items before finalizing vendor.",
        color: "danger",
      });
      return;
    }

    if (!resolvedCreatedBy) {
      addToast({
        title: "ERROR",
        description: "Created By user is missing. Please login again.",
        color: "danger",
      });
      return;
    }

    const payload = {
      quotationId: selectedquote.id,
      quotationItemId: selectedquote.items[0].id,
      rfqId: selectedquote.rfqId,
      rfqVendorId: selectedquote.rfqVendorId,
      vendorId: selectedquote.vendorId,

      description:
        firstQuotationItem.description ||
        selectedquote.remarks ||
        "Vendor finalized for quoted work",

      finalizedQuantity: Number(firstQuotationItem.quantity || 1),
      unit: firstQuotationItem.unit || values.unit,
      finalizedUnitRate: Number(
        firstQuotationItem.unitRate || values.pricePerUnit || 0,
      ),
      taxPercent: Number(firstQuotationItem.taxPercent || 0),

      finalizationReason:
        values.remarks || "Vendor finalized after quotation comparison",
      remarks: values.remarks || "",

      createdBy: Number(resolvedCreatedBy),
    };

    setSubmitLoading(true);

    dispatch(createVendorFinalization(payload)).then((resp) => {
      setSubmitLoading(false);

      if (resp.meta.requestStatus === "fulfilled") {
        addToast({
          title: "SUCCESS",
          description: "Vendor finalized successfully.",
          color: "success",
        });

        registerVendorModal.onClose();
        resetRegisterVendorForm(vendorRegistrationDefaultValues);
        fetchQuotations();
        fetchVendorFinalizations();
      } else {
        addToast({
          title: "ERROR",
          description:
            resp?.payload?.message ||
            resp?.payload?.data?.message ||
            resp?.payload ||
            "Vendor finalization failed.",
          color: "danger",
        });
      }
    });
  };

  const handleOpenOnboardingForm = (quotation) => {
    const finalization = getFinalizationForQuotation(quotation);

    if (!finalization?.id) {
      addToast({
        title: "ERROR",
        description:
          "Vendor finalization ID is missing. Please finalize vendor first.",
        color: "danger",
      });

      return;
    }

    setSelectedQuote(quotation);
    setSelectedVendorFinalization(finalization);

    resetOnboardingForm({
      ...onboardingDefaultValues,
      serviceCategory: rfqDetails?.productName || "",
      onboardedFor:
        finalization?.description ||
        quotation?.items?.[0]?.description ||
        quotation?.remarks ||
        "",
      remarks: finalization?.remarks || "",
    });

    onboardingModal.onOpen();
  };

  const onSubmitOnboardingForm = (values) => {
    const resolvedCreatedBy =
      currentUser?.id ||
      currentUser?.userId ||
      currentUser?.employeeId ||
      userId;

    if (!selectedVendorFinalization?.id) {
      addToast({
        title: "ERROR",
        description: "Vendor finalization ID is missing.",
        color: "danger",
      });

      return;
    }

    if (!resolvedCreatedBy) {
      addToast({
        title: "ERROR",
        description: "Created By user is missing. Please login again.",
        color: "danger",
      });

      return;
    }

    const documents = [
      buildDocumentPayload(
        "VENDOR_REGISTRATION_FORM",
        values.vendorRegistrationForm,
        "Vendor Registration Form",
      ),
      buildDocumentPayload("SIGNED_NDA", values.signedNda, "Signed NDA"),
      buildDocumentPayload(
        "SIGNED_AGREEMENT",
        values.signedAgreement,
        "Signed Agreement",
      ),
    ].filter(Boolean);

    if (documents.length === 0) {
      addToast({
        title: "ERROR",
        description: "Please upload at least one onboarding document.",
        color: "danger",
      });

      return;
    }

    const payload = {
      createdBy: Number(resolvedCreatedBy),
      serviceCategory: values.serviceCategory || rfqDetails?.productName || "",
      onboardedFor:
        values.onboardedFor ||
        selectedVendorFinalization?.description ||
        selectedquote?.remarks ||
        "",
      remarks: values.remarks || "",
      subject: values.subject,
      message: values.message,
      documents,
    };

    setSubmitLoading(true);

    dispatch(
      sendVendorOnboardingForm({
        vendorFinalizationId: selectedVendorFinalization.id,
        data: payload,
      }),
    ).then((resp) => {
      setSubmitLoading(false);

      if (resp.meta.requestStatus === "fulfilled") {
        addToast({
          title: "SUCCESS",
          description: "Vendor onboarding form sent successfully.",
          color: "success",
        });

        onboardingModal.onClose();
        setSelectedVendorFinalization(null);
        resetOnboardingForm(onboardingDefaultValues);
        fetchVendorFinalizations();
      } else {
        addToast({
          title: "ERROR",
          description:
            resp?.payload?.message ||
            resp?.payload?.data?.message ||
            resp?.payload ||
            "Vendor onboarding form sending failed.",
          color: "danger",
        });
      }
    });
  };

  const handleOpenLegalRequest = (quotation) => {
    if (!quotation?.id) {
      addToast({
        title: "ERROR",
        description: "Vendor quotation ID is missing.",
        color: "danger",
      });
      return;
    }

    const existingLegalRequest = getLegalRequestForQuotation(quotation);

    if (existingLegalRequest?.id) {
      addToast({
        title: "Legal request already sent",
        description: `Service agreement request already exists with status ${existingLegalRequest.status || "-"}.`,
        color: "warning",
      });
      return;
    }

    const finalization = getFinalizationForQuotation(quotation);

    if (!finalization?.id) {
      addToast({
        title: "ERROR",
        description: "Please finalize vendor before sending legal request.",
        color: "danger",
      });
      return;
    }

    if (finalization?.status !== "ONBOARDING_STARTED") {
      addToast({
        title: "ERROR",
        description:
          "Please start onboarding before sending service agreement request to legal team.",
        color: "danger",
      });
      return;
    }

    setSelectedVendorFinalization(finalization);
    setSelectedQuotation(quotation);
    resetLegalRequestForm({
      legalRequestTitle: "Service Agreement Preparation Request",
      notes:
        finalization?.description ||
        quotation?.items?.[0]?.description ||
        quotation?.remarks ||
        "Please prepare service agreement for finalized vendor.",
      statusReason: "Service agreement required after onboarding started.",
      assignedToLegal: "",
    });
    legalRequestModal.onOpen();
  };

  const onSubmitLegalRequest = (values) => {
    const resolvedCreatedBy =
      currentUser?.id ||
      currentUser?.userId ||
      currentUser?.employeeId ||
      userId;

    if (!selectedQuotation?.id) {
      addToast({
        title: "ERROR",
        description: "Vendor quotation ID is missing.",
        color: "danger",
      });
      return;
    }

    if (!resolvedCreatedBy) {
      addToast({
        title: "ERROR",
        description: "Created By user is missing. Please login again.",
        color: "danger",
      });
      return;
    }

    const payload = {
      vendorQuotationId: Number(selectedQuotation.id),
      legalRequestTitle: values.legalRequestTitle,
      notes: values.notes,
      statusReason: values.statusReason || "",
      assignedToLegal: Number(values.assignedToLegal),
      createdBy: Number(resolvedCreatedBy),
    };

    setSubmitLoading(true);

    dispatch(createLegalRequest(payload)).then((resp) => {
      setSubmitLoading(false);

      if (resp.meta.requestStatus === "fulfilled") {
        addToast({
          title: "SUCCESS",
          description: "Legal request created successfully.",
          color: "success",
        });

        legalRequestModal.onClose();
        resetLegalRequestForm(legalRequestDefaultValues);
        setSelectedQuotation(null);
        fetchVendorLegalRequests();
        fetchQuotations();
      } else {
        addToast({
          title: "ERROR",
          description:
            resp?.payload?.message ||
            resp?.payload?.data?.message ||
            resp?.payload ||
            "Legal request creation failed.",
          color: "danger",
        });
      }
    });
  };

  const handleSendAgreementToVendor = useCallback(
    (quotation) => {
      const resolvedUserId =
        currentUser?.id ||
        currentUser?.userId ||
        currentUser?.employeeId ||
        userId;

      if (!quotation?.id) {
        addToast({
          title: "ERROR",
          description: "Quotation ID is missing.",
          color: "danger",
        });
        return;
      }

      if (!quotation?.agreementFileUrl) {
        addToast({
          title: "ERROR",
          description:
            "Agreement file is missing. Please wait for legal agreement first.",
          color: "danger",
        });
        return;
      }

      if (!resolvedUserId) {
        addToast({
          title: "ERROR",
          description: "User ID is missing. Please login again.",
          color: "danger",
        });
        return;
      }

      setSubmitLoading(true);

      dispatch(
        sendAgreementToVendor({
          quotationId: Number(quotation.id),
          userId: Number(resolvedUserId),
        }),
      ).then((resp) => {
        setSubmitLoading(false);

        if (resp.meta.requestStatus === "fulfilled") {
          addToast({
            title: "SUCCESS",
            description: "Agreement sent to vendor successfully.",
            color: "success",
          });

          fetchQuotations();
        } else {
          addToast({
            title: "ERROR",
            description:
              resp?.payload?.message ||
              resp?.payload?.data?.message ||
              resp?.payload ||
              "Failed to send agreement to vendor.",
            color: "danger",
          });
        }
      });
    },
    [currentUser, dispatch, fetchQuotations, userId],
  );

  const renderCell = useCallback(
    (rowData, columnKey) => {
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

              {rowData?.status && (
                <Chip
                  size="sm"
                  variant="flat"
                  color={
                    rowData.status === "AGREEMENT_SENT_TO_PROCUREMENT"
                      ? "primary"
                      : rowData.status === "AGREEMENT_SENT_TO_VENDOR"
                        ? "success"
                        : rowData.status === "ACCEPTED"
                          ? "success"
                          : rowData.status === "REJECTED"
                            ? "danger"
                            : "default"
                  }
                  className="mt-1 w-fit"
                >
                  {rowData.status}
                </Chip>
              )}
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

              {/* <span className="text-xs text-default-500">
                RFQ Vendor ID: {rowData?.rfqVendorId || "-"}
              </span> */}
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
                Valid From:{" "}
                {rowData?.validFrom
                  ? dayjs(rowData.validFrom).format("DD-MM-YYYY")
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
                Total: {rowData?.grandTotal ?? "-"}
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

        case "attachments":
          return (
            <div className="flex flex-col gap-1 text-xs">
              {rowData?.quotationAttachmentUrl ? (
                <a
                  href={rowData.quotationAttachmentUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 font-medium text-primary"
                >
                  Quotation PDF <ExternalLink size={13} />
                </a>
              ) : (
                <span className="text-default-400">Quotation PDF: -</span>
              )}

              {rowData?.agreementFileUrl ? (
                <a
                  href={rowData.agreementFileUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 font-medium text-primary"
                >
                  Agreement PDF <ExternalLink size={13} />
                </a>
              ) : (
                <span className="text-default-400">Agreement PDF: -</span>
              )}
            </div>
          );

        case "createdBy":
          return <span className="text-sm">{rowData?.createdBy || "-"}</span>;

        case "actions": {
          const finalization = getFinalizationForQuotation(rowData);
          const existingLegalRequest = getLegalRequestForQuotation(rowData);
          const onboardingStarted =
            finalization?.status === "ONBOARDING_STARTED";

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

                {rowData?.agreementFileUrl &&
                  rowData?.status !== "AGREEMENT_SENT_TO_VENDOR" && (
                    <DropdownItem
                      key="sendAgreementToVendor"
                      startContent={<FileText size={15} />}
                      onPress={() => handleSendAgreementToVendor(rowData)}
                    >
                      Send Agreement To Vendor
                    </DropdownItem>
                  )}

                {!finalization ? (
                  <DropdownItem
                    key="registerVendor"
                    startContent={<FilePlusIcon size={15} />}
                    onPress={() => handleOpenRegisterVendor(rowData)}
                  >
                    Register Vendor
                  </DropdownItem>
                ) : onboardingStarted ? (
                  existingLegalRequest?.id ? (
                    <DropdownItem
                      key="legalRequestSent"
                      startContent={<FileText size={15} />}
                      isDisabled
                    >
                      Legal Request Sent
                    </DropdownItem>
                  ) : (
                    <DropdownItem
                      key="legalRequest"
                      startContent={<FileText size={15} />}
                      onPress={() => handleOpenLegalRequest(rowData)}
                    >
                      Service Agreement Request
                    </DropdownItem>
                  )
                ) : (
                  <DropdownItem
                    key="onboardingForm"
                    startContent={<FileText size={15} />}
                    onPress={() => handleOpenOnboardingForm(rowData)}
                  >
                    Start Onboarding
                  </DropdownItem>
                )}
              </DropdownMenu>
            </Dropdown>
          );
        }

        default:
          return rowData?.[columnKey] || "-";
      }
    },
    [
      getFinalizationForQuotation,
      getLegalRequestForQuotation,
      handleView,
      handleOpenLegalRequest,
      handleSendAgreementToVendor,
    ],
  );

  const topContent = useMemo(() => {
    return (
      <div className="flex flex-col gap-4">
        <div className="flex items-end justify-between gap-3">
          <Input
            isClearable
            className="w-full sm:max-w-[35%]"
            placeholder="Search quotation..."
            startContent={<Search size={18} />}
            value={filterValue}
            onClear={onClear}
            onValueChange={onSearchChange}
          />

          <div className="flex flex-wrap justify-end gap-3">
            <Button
              color="primary"
              startContent={<Plus size={17} />}
              onPress={handleOpenAddQuote}
            >
              Add Quote
            </Button>

            <Dropdown>
              <DropdownTrigger>
                <Button endContent={<ChevronDown size={16} />} variant="flat">
                  {statusFilter === "ALL" ? "All" : statusFilter}
                </Button>
              </DropdownTrigger>

              <DropdownMenu
                aria-label="Quotation Status Filter"
                selectedKeys={new Set([statusFilter])}
                selectionMode="single"
                onSelectionChange={(keys) => {
                  const selected = Array.from(keys)?.[0] || "ALL";
                  setStatusFilter(selected);
                  setFilteration((prev) => ({
                    ...prev,
                    page: 1,
                  }));
                }}
              >
                {quotationStatusOptions.map((status) => (
                  <DropdownItem key={status}>
                    {status === "ALL" ? "All Status" : status}
                  </DropdownItem>
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
            Total {filteredItems.length || count} quotations
          </span>

          <label className="flex items-center gap-2 text-small text-default-400">
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
    statusFilter,
    visibleColumns,
    filteredItems.length,
    count,
    filteration.size,
    onClear,
    onSearchChange,
    onRowsPerPageChange,
    handleOpenAddQuote,
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
          aria-label="Quotation table"
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
            emptyContent={loading ? "Loading..." : "No quotation found"}
            items={paginatedItems}
          >
            {(item) => (
              <TableRow
                key={
                  item?.id ||
                  `${item?.rfqId || "rfq"}-${item?.rfqVendorId || "vendor"}`
                }
              >
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
          <ModalHeader className="border-b">Quotation Details</ModalHeader>

          <ModalBody className="bg-gray-50 p-4">
            {selectedQuotation && (
              <div className="space-y-4">
                <div className="rounded-xl border bg-white p-4 shadow-sm">
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                    <div>
                      <p className="text-xs text-default-500">
                        Quotation Number
                      </p>
                      <p className="font-semibold">
                        {selectedQuotation?.quotationNumber || "-"}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-default-500">RFQ ID</p>
                      <p className="font-semibold">
                        {selectedQuotation?.rfqId || "-"}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-default-500">RFQ Vendor ID</p>
                      <p className="font-semibold">
                        {selectedQuotation?.rfqVendorId || "-"}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-default-500">Vendor ID</p>
                      <p className="font-semibold">
                        {selectedQuotation?.vendorId || "-"}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="rounded-xl border bg-white p-4 shadow-sm">
                  <p className="mb-3 text-sm font-semibold text-gray-900">
                    Attachments
                  </p>

                  <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                    {selectedQuotation?.quotationAttachmentUrl ? (
                      <Button
                        as="a"
                        href={selectedQuotation.quotationAttachmentUrl}
                        target="_blank"
                        rel="noreferrer"
                        color="primary"
                        variant="flat"
                        endContent={<ExternalLink size={14} />}
                      >
                        View Quotation PDF
                      </Button>
                    ) : (
                      <Chip variant="flat">Quotation PDF Not Attached</Chip>
                    )}

                    {selectedQuotation?.agreementFileUrl ? (
                      <Button
                        as="a"
                        href={selectedQuotation.agreementFileUrl}
                        target="_blank"
                        rel="noreferrer"
                        color="primary"
                        variant="flat"
                        endContent={<ExternalLink size={14} />}
                      >
                        View Agreement PDF
                      </Button>
                    ) : (
                      <Chip variant="flat">Agreement PDF Not Attached</Chip>
                    )}
                  </div>
                </div>
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
            <ModalHeader className="border-b px-6 py-4">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  Add Quote
                </h2>
                <p className="mt-1 text-xs font-normal text-default-500">
                  Add vendor quotation details and item-wise pricing.
                </p>
              </div>
            </ModalHeader>

            <form onSubmit={handleQuotationFormSubmit(onSubmitQuotation)}>
              <ModalBody className="px-6 py-5">
                <div className="max-h-[65vh] space-y-5 overflow-y-auto overflow-x-hidden pr-1">
                  <div className="rounded-2xl border border-blue-100 bg-blue-50/70 p-5">
                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                      <div className="space-y-1">
                        <p className="text-xs font-medium text-default-500">
                          RFQ
                        </p>
                        <p className="text-sm font-semibold text-gray-900">
                          {rfqDetails?.rfqNumber || rfqId || "-"}
                        </p>
                      </div>

                      <div className="space-y-1">
                        <p className="text-xs font-medium text-default-500">
                          RFQ Vendor ID
                        </p>
                        <p className="text-sm font-semibold text-gray-900">
                          {rfqVendorDetails?.rfqVendorId || "-"}
                        </p>
                      </div>

                      <div className="space-y-1">
                        <p className="text-xs font-medium text-default-500">
                          Vendor
                        </p>
                        <p className="break-words text-sm font-semibold text-gray-900">
                          {rfqVendorDetails?.vendorName || "-"}
                        </p>
                      </div>

                      <div className="min-w-0 space-y-1">
                        <p className="text-xs font-medium text-default-500">
                          Email
                        </p>
                        <p
                          className="max-w-full truncate break-all text-sm font-semibold text-gray-900"
                          title={rfqVendorDetails?.vendorEmail || "-"}
                        >
                          {rfqVendorDetails?.vendorEmail || "-"}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-2xl border bg-gray-50/70 p-5">
                    <div className="mb-4">
                      <h3 className="text-sm font-semibold text-gray-900">
                        Quotation Basic Details
                      </h3>
                      <p className="mt-1 text-xs text-default-500">
                        Add validity, currency and delivery timeline.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
                      <Controller
                        name="validFrom"
                        control={quotationControl}
                        render={({ field }) => (
                          <DatePicker
                            label="Valid From"
                            isRequired
                            value={field.value ? parseDate(field.value) : null}
                            onChange={(date) =>
                              field.onChange(date ? date.toString() : "")
                            }
                            isInvalid={!!quotationErrors.validFrom}
                            errorMessage={quotationErrors.validFrom?.message}
                          />
                        )}
                      />
                      <Controller
                        name="validTill"
                        control={quotationControl}
                        render={({ field }) => (
                          <DatePicker
                            label="Valid Till"
                            isRequired
                            value={field.value ? parseDate(field.value) : null}
                            onChange={(date) =>
                              field.onChange(date ? date.toString() : "")
                            }
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
                    </div>
                  </div>

                  <div className="rounded-2xl border bg-white p-5">
                    <div className="mb-4">
                      <h3 className="text-sm font-semibold text-gray-900">
                        Terms
                      </h3>
                      <p className="mt-1 text-xs text-default-500">
                        Define commercial terms and upload quotation attachment.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                      <Controller
                        name="paymentTerms"
                        control={quotationControl}
                        render={({ field, fieldState: { error } }) => (
                          <NewSelect
                            isRequired
                            label="Payment term"
                            data={paymentTypeList || []}
                            labelKey="name"
                            valueKey="id"
                            value={field.value}
                            onChange={(e) => field.onChange(e)}
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

                  <div className="rounded-2xl border bg-white p-5">
                    <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <h3 className="text-sm font-semibold text-gray-900">
                          Quotation Items
                        </h3>
                        <p className="mt-1 text-xs text-default-500">
                          Add material or service-wise quoted pricing.
                        </p>
                      </div>

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

                    <div className="space-y-5">
                      {quotationItemFields.map((item, index) => (
                        <div
                          key={item.id}
                          className="rounded-2xl border bg-gray-50/70 p-5"
                        >
                          <div className="mb-4 flex items-center justify-between gap-3">
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

                          <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
                            <Controller
                              name={`items.${index}.itemType`}
                              control={quotationControl}
                              render={({ field }) => (
                                <Select
                                  label="Item Type"
                                  isRequired
                                  selectedKeys={
                                    field.value
                                      ? new Set([field.value])
                                      : new Set([])
                                  }
                                  onSelectionChange={(keys) =>
                                    field.onChange(Array.from(keys)?.[0] || "")
                                  }
                                  isInvalid={
                                    !!quotationErrors.items?.[index]?.itemType
                                  }
                                  errorMessage={
                                    quotationErrors.items?.[index]?.itemType
                                      ?.message
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
                                    label="Agreement Description"
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

              <ModalFooter className="border-t px-6 py-4">
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

                <Button color="primary" type="submit" isLoading={submitLoading}>
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
                    resetRegisterVendorForm();
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
        isOpen={legalRequestModal.isOpen}
        onOpenChange={legalRequestModal.onOpenChange}
        size="2xl"
        isDismissable={false}
      >
        <ModalContent>
          <>
            <ModalHeader className="border-b px-6 py-4">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  Service Agreement Legal Request
                </h2>
                <p className="mt-1 text-xs font-normal text-default-500">
                  Send service agreement preparation request to legal team after
                  onboarding.
                </p>
              </div>
            </ModalHeader>

            <form onSubmit={handleLegalRequestSubmit(onSubmitLegalRequest)}>
              <ModalBody className="space-y-4 px-6 py-5">
                <Input
                  label="Quotation"
                  value={selectedQuotation?.quotationNumber || "-"}
                  isReadOnly
                />

                <Controller
                  name="legalRequestTitle"
                  control={legalRequestControl}
                  render={({ field }) => (
                    <Input
                      label="Agreement Request Title"
                      isRequired
                      value={field.value}
                      onChange={(e) => field.onChange(e.target.value)}
                      isInvalid={!!legalRequestErrors.legalRequestTitle}
                      errorMessage={
                        legalRequestErrors.legalRequestTitle?.message
                      }
                    />
                  )}
                />

                <Controller
                  name="assignedToLegal"
                  control={legalRequestControl}
                  render={({ field }) => (
                    <Select
                      label="Assign To Legal"
                      isRequired
                      selectedKeys={
                        field.value
                          ? new Set([String(field.value)])
                          : new Set([])
                      }
                      onSelectionChange={(keys) => {
                        const selectedValue = Array.from(keys)?.[0];

                        field.onChange(
                          selectedValue ? String(selectedValue) : "",
                        );
                      }}
                      isInvalid={!!legalRequestErrors.assignedToLegal}
                      errorMessage={legalRequestErrors.assignedToLegal?.message}
                    >
                      {(legalDepartmentUsers || []).map((user) => (
                        <SelectItem
                          key={String(user.id)}
                          textValue={`${user.fullName || ""} ${user.email || ""}`}
                        >
                          {user.fullName} - {user.email}
                        </SelectItem>
                      ))}
                    </Select>
                  )}
                />

                <Controller
                  name="statusReason"
                  control={legalRequestControl}
                  render={({ field }) => (
                    <Input
                      label="Agreement Description"
                      value={field.value}
                      onChange={(e) => field.onChange(e.target.value)}
                    />
                  )}
                />

                <Controller
                  name="notes"
                  control={legalRequestControl}
                  render={({ field }) => (
                    <Input
                      label="Special Conditions / Notes"
                      isRequired
                      value={field.value}
                      onChange={(e) => field.onChange(e.target.value)}
                      isInvalid={!!legalRequestErrors.notes}
                      errorMessage={legalRequestErrors.notes?.message}
                    />
                  )}
                />
              </ModalBody>

              <ModalFooter className="border-t px-6 py-4">
                <Button
                  variant="flat"
                  type="button"
                  onPress={() => {
                    legalRequestModal.onClose();
                    resetLegalRequestForm(legalRequestDefaultValues);
                    setSelectedQuotation(null);
                  }}
                >
                  Cancel
                </Button>

                <Button color="primary" type="submit" isLoading={submitLoading}>
                  Submit
                </Button>
              </ModalFooter>
            </form>
          </>
        </ModalContent>
      </Modal>

      <Modal
        isOpen={onboardingModal.isOpen}
        onOpenChange={onboardingModal.onOpenChange}
        size="4xl"
        isDismissable={false}
      >
        <ModalContent>
          <>
            <ModalHeader className="border-b px-6 py-4">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  Send Onboarding Form
                </h2>
                <p className="mt-1 text-xs font-normal text-default-500">
                  Send vendor registration form, NDA and agreement after
                  finalization.
                </p>
              </div>
            </ModalHeader>

            <form onSubmit={handleOnboardingSubmit(onSubmitOnboardingForm)}>
              <ModalBody className="px-6 py-5">
                <div className="max-h-[65vh] space-y-5 overflow-y-auto overflow-x-hidden pr-1">
                  <div className="rounded-2xl border border-blue-100 bg-blue-50/70 p-5">
                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                      <div className="space-y-1">
                        <p className="text-xs font-medium text-default-500">
                          Finalization ID
                        </p>
                        <p className="text-sm font-semibold text-gray-900">
                          {selectedVendorFinalization?.id || "-"}
                        </p>
                      </div>

                      <div className="space-y-1">
                        <p className="text-xs font-medium text-default-500">
                          RFQ
                        </p>
                        <p className="text-sm font-semibold text-gray-900">
                          {selectedVendorFinalization?.rfqNumber ||
                            rfqDetails?.rfqNumber ||
                            rfqId ||
                            "-"}
                        </p>
                      </div>

                      <div className="space-y-1">
                        <p className="text-xs font-medium text-default-500">
                          Vendor
                        </p>
                        <p className="break-words text-sm font-semibold text-gray-900">
                          {selectedVendorFinalization?.vendorName ||
                            selectedquote?.vendorName ||
                            "-"}
                        </p>
                      </div>

                      <div className="min-w-0 space-y-1">
                        <p className="text-xs font-medium text-default-500">
                          Email
                        </p>
                        <p
                          className="max-w-full truncate break-all text-sm font-semibold text-gray-900"
                          title={
                            selectedVendorFinalization?.vendorEmail ||
                            selectedquote?.vendorEmail ||
                            "-"
                          }
                        >
                          {selectedVendorFinalization?.vendorEmail ||
                            selectedquote?.vendorEmail ||
                            "-"}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-2xl border bg-white p-5">
                    <div className="mb-4">
                      <h3 className="text-sm font-semibold text-gray-900">
                        Email Details
                      </h3>
                      <p className="mt-1 text-xs text-default-500">
                        This email will be sent to RFQ vendor email or vendor
                        master email.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                      <Controller
                        name="subject"
                        control={onboardingControl}
                        render={({ field }) => (
                          <Input
                            label="Subject"
                            isRequired
                            value={field.value}
                            onChange={(e) => field.onChange(e.target.value)}
                            isInvalid={!!onboardingErrors.subject}
                            errorMessage={onboardingErrors.subject?.message}
                          />
                        )}
                      />

                      <Controller
                        name="serviceCategory"
                        control={onboardingControl}
                        render={({ field }) => (
                          <Input
                            label="Service Category"
                            value={field.value}
                            onChange={(e) => field.onChange(e.target.value)}
                          />
                        )}
                      />

                      <div className="md:col-span-2">
                        <Controller
                          name="onboardedFor"
                          control={onboardingControl}
                          render={({ field }) => (
                            <Input
                              label="Onboarded For"
                              value={field.value}
                              onChange={(e) => field.onChange(e.target.value)}
                            />
                          )}
                        />
                      </div>

                      <div className="md:col-span-2">
                        <Controller
                          name="message"
                          control={onboardingControl}
                          render={({ field }) => (
                            <Input
                              label="Message"
                              isRequired
                              value={field.value}
                              onChange={(e) => field.onChange(e.target.value)}
                              isInvalid={!!onboardingErrors.message}
                              errorMessage={onboardingErrors.message?.message}
                            />
                          )}
                        />
                      </div>

                      <div className="md:col-span-2">
                        <Controller
                          name="remarks"
                          control={onboardingControl}
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
                  </div>

                  <div className="rounded-2xl border bg-white p-5">
                    <div className="mb-4">
                      <h3 className="text-sm font-semibold text-gray-900">
                        Onboarding Documents
                      </h3>
                      <p className="mt-1 text-xs text-default-500">
                        Vendor registration form is required. NDA and agreement
                        are optional here.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
                      <Controller
                        name="vendorRegistrationForm"
                        control={onboardingControl}
                        render={({ field, fieldState: { error } }) => (
                          <FileUploader
                            isRequired
                            label="Vendor Registration Form"
                            value={field.value}
                            onChange={(value) => field.onChange(value)}
                            errorMessage={error?.message}
                            isInvalid={!!error}
                          />
                        )}
                      />

                      <Controller
                        name="signedNda"
                        control={onboardingControl}
                        render={({ field, fieldState: { error } }) => (
                          <FileUploader
                            label="Signed NDA"
                            value={field.value}
                            onChange={(value) => field.onChange(value)}
                            errorMessage={error?.message}
                            isInvalid={!!error}
                          />
                        )}
                      />

                      <Controller
                        name="signedAgreement"
                        control={onboardingControl}
                        render={({ field, fieldState: { error } }) => (
                          <FileUploader
                            label="Signed Agreement"
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
              <ModalFooter className="border-t px-6 py-4">
                <Button
                  variant="flat"
                  type="button"
                  onPress={() => {
                    onboardingModal.onClose();
                    setSelectedVendorFinalization(null);
                    resetOnboardingForm(onboardingDefaultValues);
                  }}
                >
                  Cancel
                </Button>

                <Button color="primary" type="submit" isLoading={submitLoading}>
                  Send Form
                </Button>
              </ModalFooter>
            </form>
          </>
        </ModalContent>
      </Modal>
    </>
  );
};

export default Quote;
