import {
  Button,
  Chip,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
  Input,
  Pagination,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
  addToast,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Textarea,
  useDisclosure,
  Select,
  SelectItem,
  Form,
} from "@heroui/react";
import {
  ArrowLeft,
  ChevronDown,
  EllipsisVertical,
  FileText,
  Plus,
  Search,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useNavigate, useParams, Link } from "react-router-dom";
import {
  createProcurementPaymentRequestByOrderId,
  getOperationProjectDetailById,
  getProcurementOrderByPurchaseId,
  updateProcurementPaymentRequestByOrderId,
} from "../../toolkit/slices/operationSlice";
import { getVendorDetailInProject } from "../../toolkit/slices/vendorsSlice";
import CreatePurchaseOrderModal from "./CreatePurchaseOrderModal";
import { Controller, useForm } from "react-hook-form";
import FileUploader from "../../components/FileUploader";

const columns = [
  { name: "PO NUMBER", uid: "poNumber" },
  { name: "REFERENCE NO.", uid: "poReferenceNumber" },
  { name: "PROJECT", uid: "projectName" },
  { name: "VENDOR", uid: "vendorName" },
  { name: "FINAL AMOUNT", uid: "finalAmount" },
  { name: "GRAND TOTAL", uid: "grandTotal" },
  { name: "PAYMENT", uid: "payment" },
  { name: "TAX", uid: "tax" },
  { name: "STATUS", uid: "status" },
  { name: "CREATED DATE", uid: "createdDate" },
  { name: "ATTACHMENTS", uid: "attachmentUrls" },
  { name: "ACTIONS", uid: "actions" },
];

const GST_STATE_OPTIONS = [
  { code: "01", name: "Jammu & Kashmir" },
  { code: "02", name: "Himachal Pradesh" },
  { code: "03", name: "Punjab" },
  { code: "04", name: "Chandigarh" },
  { code: "05", name: "Uttarakhand" },
  { code: "06", name: "Haryana" },
  { code: "07", name: "Delhi" },
  { code: "08", name: "Rajasthan" },
  { code: "09", name: "Uttar Pradesh" },
  { code: "10", name: "Bihar" },
  { code: "11", name: "Sikkim" },
  { code: "12", name: "Arunachal Pradesh" },
  { code: "13", name: "Nagaland" },
  { code: "14", name: "Manipur" },
  { code: "15", name: "Mizoram" },
  { code: "16", name: "Tripura" },
  { code: "17", name: "Meghalaya" },
  { code: "18", name: "Assam" },
  { code: "19", name: "West Bengal" },
  { code: "20", name: "Jharkhand" },
  { code: "21", name: "Odisha" },
  { code: "22", name: "Chhattisgarh" },
  { code: "23", name: "Madhya Pradesh" },
  { code: "24", name: "Gujarat" },
  { code: "26", name: "Dadra & Nagar Haveli and Daman & Diu" },
  { code: "27", name: "Maharashtra" },
  { code: "29", name: "Karnataka" },
  { code: "30", name: "Goa" },
  { code: "31", name: "Lakshadweep" },
  { code: "32", name: "Kerala" },
  { code: "33", name: "Tamil Nadu" },
  { code: "34", name: "Puducherry" },
  { code: "35", name: "Andaman & Nicobar Islands" },
  { code: "36", name: "Telangana" },
  { code: "37", name: "Andhra Pradesh" },
  { code: "38", name: "Ladakh" },
];

const INITIAL_VISIBLE_COLUMNS = [
  "poNumber",
  "poReferenceNumber",
  "projectName",
  "vendorName",
  "grandTotal",
  "payment",
  "status",
  "createdDate",
  "attachmentUrls",
  "actions",
];

const FIXED_STATUS_FILTER_OPTIONS = ["DRAFT", "APPROVED"];

function capitalize(value) {
  return value
    ? value.charAt(0).toUpperCase() + value.slice(1).toLowerCase()
    : "";
}

const formatAmount = (value) => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(Number(value || 0));
};

const formatDateTime = (value) => {
  if (!value) return "-";

  return new Date(value).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const getStatusColor = (status) => {
  switch (status) {
    case "DRAFT":
      return "default";

    case "PENDING_APPROVAL":
      return "warning";

    case "APPROVED":
      return "success";

    case "REJECTED":
      return "danger";

    case "RELEASED":
    case "PO_RELEASED":
      return "primary";

    case "PARTIALLY_COMPLETED":
      return "warning";

    case "COMPLETED":
    case "PAYMENT_DONE":
      return "success";

    default:
      return "default";
  }
};

const normalizePurchaseOrderResponse = (response) => {
  if (Array.isArray(response)) return response;
  if (Array.isArray(response?.content)) return response.content;
  if (Array.isArray(response?.data)) return response.data;
  if (response && typeof response === "object") return [response];

  return [];
};

const getAttachmentUrls = (rowData) => {
  if (Array.isArray(rowData?.attachmentUrls)) {
    return rowData.attachmentUrls;
  }

  if (Array.isArray(rowData?.attachments)) {
    return rowData.attachments
      .map((item) => item?.fileUrl || item?.filePath || item?.url)
      .filter(Boolean);
  }

  if (rowData?.attachmentUrl) {
    return [rowData.attachmentUrl];
  }

  return [];
};

const RaiseProcurementPaymentRequestModal = ({
  open,
  onClose,
  procurementOrder,
  createdBy,
  onSuccess,
}) => {
  const dispatch = useDispatch();
  const [isFileUploading, setIsFileUploading] = useState(false);

  const {
    register,
    control,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      invoiceAmount: "",
      payableAmount: "",
      completionRemarks: "",
      proofAttachmentUrls: [],

      tdsActive: "NO",
      tdsPercentage: "",

      gstActive: "NO",
      gstStateCode: "",
      gstPercentage: "",
    },
  });

  const tdsActive = watch("tdsActive");
  const gstActive = watch("gstActive");
  const gstStateCode = watch("gstStateCode");
  const gstPercentage = watch("gstPercentage");
  const invoiceAmount = watch("invoiceAmount");

  const vendorGSTRegistrationType = procurementOrder?.vendorGSTRegistrationType;

  const isRegisteredVendor = vendorGSTRegistrationType === "REGISTERED";

  const isInternationalVendor = vendorGSTRegistrationType === "INTERNATIONAL";

  const gstCalculation = useMemo(() => {
    const taxableAmount = Number(invoiceAmount || 0);
    const gstRate = Number(gstPercentage || 0);
    const isUpState = String(gstStateCode) === "09";

    if (gstActive !== "YES" || !gstRate) {
      return {
        gstAmount: 0,
        cgstRate: 0,
        sgstRate: 0,
        igstRate: 0,
        cgstAmount: 0,
        sgstAmount: 0,
        igstAmount: 0,
        totalWithGst: taxableAmount,
      };
    }

    const gstAmount =
      taxableAmount > 0
        ? Number(((taxableAmount * gstRate) / 100).toFixed(2))
        : 0;

    if (isUpState) {
      const halfRate = Number((gstRate / 2).toFixed(2));
      const cgstAmount = Number((gstAmount / 2).toFixed(2));
      const sgstAmount = Number((gstAmount - cgstAmount).toFixed(2));

      return {
        gstAmount,
        cgstRate: halfRate,
        sgstRate: halfRate,
        igstRate: 0,
        cgstAmount,
        sgstAmount,
        igstAmount: 0,
        totalWithGst: Number((taxableAmount + gstAmount).toFixed(2)),
      };
    }

    return {
      gstAmount,
      cgstRate: 0,
      sgstRate: 0,
      igstRate: gstRate,
      cgstAmount: 0,
      sgstAmount: 0,
      igstAmount: gstAmount,
      totalWithGst: Number((taxableAmount + gstAmount).toFixed(2)),
    };
  }, [gstActive, gstPercentage, gstStateCode, invoiceAmount]);

  const selectedState = GST_STATE_OPTIONS.find(
    (state) => state.code === gstStateCode,
  );

  const handleClose = () => {
    reset();
    setIsFileUploading(false);
    onClose();
  };

  const onSubmit = async (values) => {
    if (!procurementOrder?.id) {
      addToast({
        title: "Procurement order missing",
        description: "Procurement order ID is required to raise PR.",
        color: "danger",
      });
      return;
    }

    const isTdsActive = !isInternationalVendor && values.tdsActive === "YES";

    const isGstActive = isRegisteredVendor && values.gstActive === "YES";

    const payload = {
      invoiceAmount: Number(values.invoiceAmount || 0),
      payableAmount: Number(values.payableAmount || 0),
      completionRemarks: values.completionRemarks,
      proofAttachmentUrls: Array.isArray(values.proofAttachmentUrls)
        ? values.proofAttachmentUrls
        : [],
      createdBy: Number(createdBy),

      tdsActive: isTdsActive,
      tdsPercentage: isTdsActive ? Number(values.tdsPercentage || 0) : null,

      gstActive: isGstActive,
      gstStateCode: isGstActive ? values.gstStateCode : null,
      gstStateName: isGstActive ? selectedState?.name || null : null,
      gstPercentage: isGstActive ? Number(values.gstPercentage || 0) : null,

      gstAmount: isGstActive ? gstCalculation.gstAmount : 0,

      cgstRate: isGstActive ? gstCalculation.cgstRate : 0,
      sgstRate: isGstActive ? gstCalculation.sgstRate : 0,
      igstRate: isGstActive ? gstCalculation.igstRate : 0,

      cgstAmount: isGstActive ? gstCalculation.cgstAmount : 0,
      sgstAmount: isGstActive ? gstCalculation.sgstAmount : 0,
      igstAmount: isGstActive ? gstCalculation.igstAmount : 0,

      totalWithGst: isGstActive
        ? gstCalculation.totalWithGst
        : Number(values.invoiceAmount || 0),
    };

    const resultAction = await dispatch(
      createProcurementPaymentRequestByOrderId({
        procurementOrderId: procurementOrder.id,
        data: payload,
      }),
    );

    if (
      createProcurementPaymentRequestByOrderId.fulfilled.match(resultAction)
    ) {
      addToast({
        title: "Payment request raised",
        description: "Procurement payment request created successfully.",
        color: "success",
      });

      handleClose();
      onSuccess?.();
      return;
    }

    addToast({
      title: "Failed to raise PR",
      description:
        resultAction?.payload ||
        "Something went wrong while creating payment request.",
      color: "danger",
    });
  };

  useEffect(() => {
    if (!open || !procurementOrder) return;

    const gstValue = vendorGSTRegistrationType === "REGISTERED" ? "YES" : "NO";

    const tdsValue =
      vendorGSTRegistrationType === "INTERNATIONAL" ? "NO" : "YES";

    setValue("gstActive", gstValue);
    setValue("tdsActive", tdsValue);

    if (gstValue === "NO") {
      setValue("gstPercentage", "");
      setValue("gstStateCode", "");
    }

    if (tdsValue === "NO") {
      setValue("tdsPercentage", "");
    }
  }, [open, procurementOrder, vendorGSTRegistrationType, setValue]);
  return (
    <Modal
      isOpen={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) handleClose();
      }}
      size="2xl"
      placement="center"
      classNames={{
        base: "max-h-[88vh]",
        body: "overflow-y-auto",
      }}
    >
      <ModalContent>
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex max-h-[88vh] flex-col"
        >
          <ModalHeader className="flex shrink-0 flex-col gap-1 border-b border-default-200">
            <span>Raise Procurement Payment Request</span>
            {console.log(procurementOrder)}

            <span className="text-xs font-normal text-default-500">
              PO Number: {procurementOrder?.poNumber || "-"}
            </span>
          </ModalHeader>

          <ModalBody className="flex-1 gap-4 overflow-y-auto px-6 py-4">
            <Input
              label="Invoice Amount"
              placeholder="Enter invoice amount"
              type="number"
              step="0.01"
              min="0"
              variant="bordered"
              {...register("invoiceAmount", {
                required: "Invoice amount is required",
                min: {
                  value: 0,
                  message: "Invoice amount cannot be negative",
                },
              })}
              isInvalid={Boolean(errors.invoiceAmount)}
              errorMessage={errors.invoiceAmount?.message}
            />

            <Input
              label="Payable Amount"
              placeholder="Enter payable amount"
              type="number"
              step="0.01"
              min="0"
              variant="bordered"
              {...register("payableAmount", {
                required: "Payable amount is required",
                min: {
                  value: 0,
                  message: "Payable amount cannot be negative",
                },
              })}
              isInvalid={Boolean(errors.payableAmount)}
              errorMessage={errors.payableAmount?.message}
            />

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <Controller
                name="tdsActive"
                control={control}
                rules={{
                  required: "Please select TDS option",
                }}
                render={({ field }) => (
                  <Select
                    isDisabled
                    label="Apply TDS?"
                    placeholder="Select TDS option"
                    variant="bordered"
                    selectedKeys={field.value ? [field.value] : []}
                    onSelectionChange={() => {}}
                    isInvalid={Boolean(errors.tdsActive)}
                    errorMessage={errors.tdsActive?.message}
                  >
                    <SelectItem key="NO">No</SelectItem>
                    <SelectItem key="YES">Yes</SelectItem>
                  </Select>
                )}
              />

              {!isInternationalVendor && tdsActive === "YES" && (
                <Controller
                  name="tdsPercentage"
                  control={control}
                  rules={{
                    required: "Please select TDS percentage",
                  }}
                  render={({ field }) => (
                    <Select
                      label="TDS Percentage"
                      placeholder="Select TDS percentage"
                      variant="bordered"
                      selectedKeys={field.value ? [String(field.value)] : []}
                      onSelectionChange={(keys) => {
                        const selected = Array.from(keys)[0] || "";
                        field.onChange(selected);
                      }}
                      isInvalid={Boolean(errors.tdsPercentage)}
                      errorMessage={errors.tdsPercentage?.message}
                    >
                      <SelectItem key="1">1%</SelectItem>
                      <SelectItem key="2">2%</SelectItem>
                      <SelectItem key="5">5%</SelectItem>
                      <SelectItem key="10">10%</SelectItem>
                    </Select>
                  )}
                />
              )}
            </div>

            <div className="rounded-xl border border-default-200 p-4">
              <div className="mb-3 text-sm font-medium">GST Details</div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <Controller
                  name="gstActive"
                  control={control}
                  rules={{
                    required: "Please select GST option",
                  }}
                  render={({ field }) => (
                    <Select
                      isDisabled
                      label="Apply GST?"
                      placeholder="Select GST option"
                      variant="bordered"
                      selectedKeys={new Set(field.value ? [field.value] : [])}
                      onSelectionChange={() => {}}
                      isInvalid={Boolean(errors.gstActive)}
                      errorMessage={errors.gstActive?.message}
                    >
                      <SelectItem key="NO">No</SelectItem>
                      <SelectItem key="YES">Yes</SelectItem>
                    </Select>
                  )}
                />

                {isRegisteredVendor && gstActive === "YES" && (
                  <Controller
                    name="gstStateCode"
                    control={control}
                    rules={{
                      required: "Please select state code",
                    }}
                    render={({ field }) => (
                      <Select
                        label="State Code"
                        placeholder="Select state"
                        variant="bordered"
                        selectedKeys={
                          new Set(field.value ? [String(field.value)] : [])
                        }
                        onSelectionChange={(keys) => {
                          const selected = Array.from(keys)[0] || "";
                          field.onChange(String(selected));
                        }}
                        isInvalid={Boolean(errors.gstStateCode)}
                        errorMessage={errors.gstStateCode?.message}
                      >
                        {GST_STATE_OPTIONS.map((state) => (
                          <SelectItem
                            key={state.code}
                            textValue={`${state.code} - ${state.name}`}
                          >
                            {state.code} - {state.name}
                          </SelectItem>
                        ))}
                      </Select>
                    )}
                  />
                )}

                {isRegisteredVendor && gstActive === "YES" && (
                  <Controller
                    name="gstPercentage"
                    control={control}
                    rules={{
                      required: "Please select GST percentage",
                    }}
                    render={({ field }) => (
                      <Select
                        label="GST Percentage"
                        placeholder="Select GST percentage"
                        variant="bordered"
                        selectedKeys={
                          new Set(field.value ? [String(field.value)] : [])
                        }
                        onSelectionChange={(keys) => {
                          const selected = Array.from(keys)[0] || "";
                          field.onChange(String(selected));
                        }}
                        isInvalid={Boolean(errors.gstPercentage)}
                        errorMessage={errors.gstPercentage?.message}
                      >
                        <SelectItem key="5">5%</SelectItem>
                        <SelectItem key="12">12%</SelectItem>
                        <SelectItem key="18">18%</SelectItem>
                        <SelectItem key="28">28%</SelectItem>
                      </Select>
                    )}
                  />
                )}
              </div>

              {isRegisteredVendor && gstActive === "YES" && (
                <div className="mt-4 rounded-lg bg-default-50 p-3 text-xs text-default-600">
                  <div className="mb-2 font-medium text-default-700">
                    GST Calculation
                  </div>

                  {String(gstStateCode) === "09" ? (
                    <div className="grid grid-cols-1 gap-1 md:grid-cols-2">
                      <span>
                        CGST ({gstCalculation.cgstRate}%):{" "}
                        {formatAmount(gstCalculation.cgstAmount)}
                      </span>

                      <span>
                        SGST ({gstCalculation.sgstRate}%):{" "}
                        {formatAmount(gstCalculation.sgstAmount)}
                      </span>

                      <span>
                        Total GST: {formatAmount(gstCalculation.gstAmount)}
                      </span>

                      <span>
                        Total With GST:{" "}
                        {formatAmount(gstCalculation.totalWithGst)}
                      </span>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 gap-1 md:grid-cols-2">
                      <span>
                        IGST ({gstCalculation.igstRate}%):{" "}
                        {formatAmount(gstCalculation.igstAmount)}
                      </span>

                      <span>
                        Total GST: {formatAmount(gstCalculation.gstAmount)}
                      </span>

                      <span>
                        Total With GST:{" "}
                        {formatAmount(gstCalculation.totalWithGst)}
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>

            <Textarea
              label="Completion Remarks"
              placeholder="Enter completion remarks"
              minRows={3}
              maxRows={4}
              variant="bordered"
              {...register("completionRemarks", {
                required: "Completion remarks are required",
              })}
              isInvalid={Boolean(errors.completionRemarks)}
              errorMessage={errors.completionRemarks?.message}
            />

            <Controller
              name="proofAttachmentUrls"
              control={control}
              render={({ field }) => (
                <FileUploader
                  label="Proof Attachment"
                  placeholder="Upload proof attachments"
                  uploadingType="multiple"
                  value={field.value || []}
                  onChange={field.onChange}
                  onUploadingChange={setIsFileUploading}
                  errorMessage={errors.proofAttachmentUrls?.message}
                />
              )}
            />
          </ModalBody>

          <ModalFooter className="shrink-0 border-t border-default-200 bg-background">
            <Button
              type="button"
              variant="flat"
              color="danger"
              onPress={handleClose}
              isDisabled={isSubmitting || isFileUploading}
            >
              Cancel
            </Button>

            <Button
              color="primary"
              type="submit"
              isLoading={isSubmitting || isFileUploading}
              isDisabled={isFileUploading}
            >
              Submit PR
            </Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
};

const ProjectPurchaseOrder = () => {
  const { userId, projectId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { isOpen, onOpen, onOpenChange, onClose } = useDisclosure();
  const [isCreatePoModalOpen, setIsCreatePoModalOpen] = useState(false);
  const [isRaisePrModalOpen, setIsRaisePrModalOpen] = useState(false);
  const [selectedProcurementOrder, setSelectedProcurementOrder] =
    useState(null);

  const purchaseOrderResponse = useSelector(
    (state) => state.operation.procurementOrderByPurchaseIdList?.content,
  );

  const isLoading = useSelector(
    (state) => state.operation.procurementOrderByPurchaseIdLoading,
  );

  const error = useSelector(
    (state) => state.operation.procurementOrderByPurchaseIdError,
  );

  const detailedData = useSelector(
    (state) => state.operation.operationProjectDetail,
  );

  const vendorDetail = useSelector(
    (state) => state.vendors.vendorDetailInProject,
  );

  const data = useMemo(() => {
    return normalizePurchaseOrderResponse(purchaseOrderResponse);
  }, [purchaseOrderResponse]);

  const routeState = location?.state || {};
  const firstPurchaseOrder = data?.[0] || {};
  const projectDetails = detailedData?.projectDetails || {};

  const procurementAssignmentId =
    routeState?.procurementAssignmentId ||
    projectDetails?.procurementMilestoneAssignmentId ||
    projectDetails?.procurementAssignmentId ||
    firstPurchaseOrder?.procurementAssignmentId ||
    firstPurchaseOrder?.procurementMilestoneAssignmentId ||
    null;

  const vendorId =
    routeState?.vendorId ||
    vendorDetail?.selectedVendorId ||
    vendorDetail?.selectedVendor?.id ||
    projectDetails?.selectedVendorId ||
    firstPurchaseOrder?.vendorId ||
    firstPurchaseOrder?.selectedVendorId ||
    null;

  const defaultEstimatedAmount =
    routeState?.defaultEstimatedAmount ||
    projectDetails?.estimatedAmount ||
    projectDetails?.amount ||
    firstPurchaseOrder?.estimatedAmount ||
    firstPurchaseOrder?.finalAmount ||
    0;

  const canCreatePurchaseOrder = Boolean(procurementAssignmentId && vendorId);

  const [filterValue, setFilterValue] = useState("");
  const [selectedKeys, setSelectedKeys] = useState(new Set([]));
  const [visibleColumns, setVisibleColumns] = useState(
    new Set(INITIAL_VISIBLE_COLUMNS),
  );

  const [sortDescriptor, setSortDescriptor] = useState({
    column: "createdDate",
    direction: "descending",
  });

  const [filteration, setFilteration] = useState({
    page: 1,
    size: 10,
    status: "ALL",
  });

  const fetchPurchaseOrders = useCallback(() => {
    if (projectId) {
      dispatch(getProcurementOrderByPurchaseId(projectId));
    }
  }, [dispatch, projectId]);

  useEffect(() => {
    if (projectId && userId) {
      dispatch(getOperationProjectDetailById({ projectId, userId }));
    }

    fetchPurchaseOrders();
  }, [dispatch, projectId, userId, fetchPurchaseOrders]);

  useEffect(() => {
    if (procurementAssignmentId) {
      dispatch(
        getVendorDetailInProject({
          procurementAssignmentId,
        }),
      );
    }
  }, [dispatch, procurementAssignmentId]);

  const handleOpenCreatePurchaseOrder = useCallback(() => {
    if (!procurementAssignmentId) {
      addToast({
        title: "Procurement assignment missing",
        description: "Procurement assignment ID is required to create PO.",
        color: "danger",
      });
      return;
    }

    if (!vendorId) {
      addToast({
        title: "Vendor missing",
        description: "Please finalize/map vendor before creating PO.",
        color: "danger",
      });
      return;
    }

    setIsCreatePoModalOpen(true);
  }, [procurementAssignmentId, vendorId]);

  const headerColumns = useMemo(() => {
    if (visibleColumns === "all") return columns;

    return columns.filter((column) =>
      Array.from(visibleColumns).includes(column.uid),
    );
  }, [visibleColumns]);

  const filteredItems = useMemo(() => {
    let filteredData = [...(data || [])];

    if (filteration.status !== "ALL") {
      filteredData = filteredData.filter(
        (item) => item?.status === filteration.status,
      );
    }

    if (filterValue) {
      const searchValue = filterValue.toLowerCase();

      filteredData = filteredData.filter((item) => {
        return (
          item?.poNumber?.toLowerCase().includes(searchValue) ||
          item?.poReferenceNumber?.toLowerCase().includes(searchValue) ||
          item?.projectName?.toLowerCase().includes(searchValue) ||
          item?.vendorName?.toLowerCase().includes(searchValue) ||
          item?.paymentTypeName?.toLowerCase().includes(searchValue) ||
          item?.paymentTerms?.toLowerCase().includes(searchValue) ||
          item?.status?.toLowerCase().includes(searchValue)
        );
      });
    }

    return filteredData;
  }, [data, filterValue, filteration.status]);

  const sortedItems = useMemo(() => {
    return [...filteredItems].sort((a, b) => {
      const first = a?.[sortDescriptor.column];
      const second = b?.[sortDescriptor.column];

      let cmp = 0;

      if (first === null || first === undefined) cmp = -1;
      else if (second === null || second === undefined) cmp = 1;
      else if (first < second) cmp = -1;
      else if (first > second) cmp = 1;

      return sortDescriptor.direction === "descending" ? -cmp : cmp;
    });
  }, [filteredItems, sortDescriptor]);

  const pages = Math.ceil(sortedItems.length / filteration.size) || 1;

  const paginatedItems = useMemo(() => {
    const start = (filteration.page - 1) * filteration.size;
    const end = start + filteration.size;

    return sortedItems.slice(start, end);
  }, [sortedItems, filteration.page, filteration.size]);

  const onNextPage = useCallback(() => {
    if (filteration.page < pages) {
      setFilteration((prev) => ({
        ...prev,
        page: prev.page + 1,
      }));
    }
  }, [filteration.page, pages]);

  const onPreviousPage = useCallback(() => {
    if (filteration.page > 1) {
      setFilteration((prev) => ({
        ...prev,
        page: prev.page - 1,
      }));
    }
  }, [filteration.page]);

  const onRowsPerPageChange = useCallback((e) => {
    setFilteration((prev) => ({
      ...prev,
      size: Number(e.target.value),
      page: 1,
    }));
  }, []);

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

  const handleOpenRaisePrModal = useCallback((rowData) => {
    if (!rowData?.id) {
      addToast({
        title: "Procurement order missing",
        description: "Procurement order ID is required to raise PR.",
        color: "danger",
      });
      return;
    }

    setSelectedProcurementOrder(rowData);
    setIsRaisePrModalOpen(true);
  }, []);

  const renderCell = useCallback(
    (rowData, columnKey) => {
      switch (columnKey) {
        case "poNumber":
          return (
            <div className="flex flex-col">
              <Link
                className="font-medium"
                to={`${rowData?.id}/procurementPaymentRequest`}
              >
                {rowData?.poNumber || "-"}
              </Link>
              <span className="text-xs text-default-400">
                ID: {rowData?.id || "-"}
              </span>
            </div>
          );

        case "poReferenceNumber":
          return (
            <div className="flex flex-col">
              <span>{rowData?.poReferenceNumber || "-"}</span>
              <span className="text-xs text-default-400">
                Assignment ID: {rowData?.procurementAssignmentId || "-"}
              </span>
            </div>
          );

        case "projectName":
          return (
            <div className="flex flex-col">
              <span className="capitalize">{rowData?.projectName || "-"}</span>
              <span className="text-xs text-default-400">
                Project ID: {rowData?.projectId || "-"}
              </span>
            </div>
          );

        case "vendorName":
          return (
            <div className="flex flex-col">
              <span className="capitalize">{rowData?.vendorName || "-"}</span>
              <span className="text-xs text-default-400">
                Vendor ID: {rowData?.vendorId || "-"}
              </span>

              {rowData?.vendorContactName && (
                <span className="text-xs text-default-400">
                  Contact: {rowData.vendorContactName}
                </span>
              )}
            </div>
          );

        case "finalAmount":
          return (
            <div className="flex flex-col">
              <span className="font-medium">
                {formatAmount(rowData?.finalAmount)}
              </span>
              <span className="text-xs text-default-400">
                Estimated: {formatAmount(rowData?.estimatedAmount)}
              </span>
            </div>
          );

        case "grandTotal":
          return (
            <div className="flex flex-col">
              <span className="font-semibold text-success">
                {formatAmount(rowData?.grandTotal)}
              </span>
              <span className="text-xs text-default-400">
                Tax: {formatAmount(rowData?.totalTaxAmount)}
              </span>
            </div>
          );

        case "payment":
          return (
            <div className="flex flex-col">
              <span>{rowData?.paymentTypeName || "-"}</span>
              <span className="text-xs text-default-400">
                {rowData?.paymentTerms || "-"}
              </span>
            </div>
          );

        case "tax":
          return (
            <div className="flex flex-col">
              <span>GST: {rowData?.gstRate || 0}%</span>

              {Number(rowData?.igstAmount || 0) > 0 ? (
                <span className="text-xs text-default-400">
                  IGST: {formatAmount(rowData?.igstAmount)}
                </span>
              ) : (
                <span className="text-xs text-default-400">
                  CGST: {formatAmount(rowData?.cgstAmount)} | SGST:{" "}
                  {formatAmount(rowData?.sgstAmount)}
                </span>
              )}
            </div>
          );

        case "status":
          return (
            <Chip
              size="sm"
              variant="flat"
              color={getStatusColor(rowData?.status)}
              className="capitalize"
            >
              {rowData?.status || "-"}
            </Chip>
          );

        case "createdDate":
          return (
            <div className="flex flex-col">
              <span>{formatDateTime(rowData?.createdDate)}</span>
              <span className="text-xs text-default-400">
                PO Created: {formatDateTime(rowData?.poCreatedDate)}
              </span>
            </div>
          );

        case "attachmentUrls": {
          const attachments = getAttachmentUrls(rowData);

          if (!attachments.length) return "-";

          return (
            <div className="flex flex-col gap-1">
              <Chip size="sm" variant="flat" color="primary">
                {attachments.length} File{attachments.length > 1 ? "s" : ""}
              </Chip>

              <Button
                size="sm"
                variant="light"
                color="primary"
                startContent={<FileText size={14} />}
                onPress={() => {
                  window.open(attachments[0], "_blank", "noopener,noreferrer");
                }}
              >
                View
              </Button>
            </div>
          );
        }

        case "actions":
          return (
            <div className="relative flex justify-center items-center gap-2">
              <Dropdown>
                <DropdownTrigger>
                  <Button isIconOnly size="sm" variant="light">
                    <EllipsisVertical className="text-default-300" />
                  </Button>
                </DropdownTrigger>
                <DropdownMenu
                  selectionMode="single"
                  selectedKeys={[rowData?.status]}
                  onSelectionChange={(e) => {
                    let key = Array.from(e)[0];
                    if (key === "raisePR") {
                      handleOpenRaisePrModal(rowData);
                    }
                    if (key === "updateStatus") {
                      setSelectedProcurementOrder(rowData);
                      onOpen();
                    }
                  }}
                >
                  <DropdownItem key="raisePR">Raise PR</DropdownItem>
                  <DropdownItem key="updateStatus">Update Status</DropdownItem>
                </DropdownMenu>
              </Dropdown>
            </div>
          );

        default:
          return rowData?.[columnKey] || "-";
      }
    },
    [handleOpenRaisePrModal, onOpen],
  );

  const topContent = useMemo(() => {
    const uniqueStatuses = Array.from(
      new Set([
        ...data.map((item) => item?.status).filter(Boolean),
        ...FIXED_STATUS_FILTER_OPTIONS,
      ]),
    );

    const statusOptions = [
      { label: "ALL", uid: "ALL" },
      ...uniqueStatuses.map((status) => ({
        label: status,
        uid: status,
      })),
    ];

    return (
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <Input
            isClearable
            className="w-full md:max-w-[380px]"
            placeholder="Search ..."
            startContent={<Search size={18} />}
            value={filterValue}
            onClear={onClear}
            onValueChange={onSearchChange}
          />

          <div className="flex flex-wrap gap-3">
            <Dropdown>
              <DropdownTrigger>
                <Button
                  endContent={<ChevronDown size={16} />}
                  variant="flat"
                  className="capitalize"
                >
                  {filteration.status}
                </Button>
              </DropdownTrigger>

              <DropdownMenu
                disallowEmptySelection
                aria-label="Status Filter"
                selectionMode="single"
                selectedKeys={[filteration.status]}
                onSelectionChange={(selectedKeys) => {
                  const selected = Array.from(selectedKeys)[0];

                  setFilteration((prev) => ({
                    ...prev,
                    page: 1,
                    status: selected,
                  }));
                }}
              >
                {statusOptions.map((status) => (
                  <DropdownItem key={status.uid}>{status.label}</DropdownItem>
                ))}
              </DropdownMenu>
            </Dropdown>
            <Button
              color="primary"
              startContent={<Plus size={16} />}
              onPress={handleOpenCreatePurchaseOrder}
            >
              Add Purchase Order
            </Button>

            <Dropdown>
              <DropdownTrigger>
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
                    {capitalize(column.name)}
                  </DropdownItem>
                ))}
              </DropdownMenu>
            </Dropdown>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-default-400 text-small">
            Total {sortedItems.length} purchase orders
          </span>

          <label className="flex items-center text-default-400 text-small">
            Rows per page:
            <select
              className="bg-transparent outline-hidden text-default-400 text-small"
              onChange={onRowsPerPageChange}
              value={filteration.size}
            >
              <option value="5">5</option>
              <option value="10">10</option>
              <option value="15">15</option>
              <option value="25">25</option>
              <option value="50">50</option>
            </select>
          </label>
        </div>
      </div>
    );
  }, [
    data,
    filterValue,
    filteration.status,
    filteration.size,
    onClear,
    onRowsPerPageChange,
    onSearchChange,
    sortedItems.length,
    visibleColumns,
  ]);

  const bottomContent = useMemo(() => {
    return (
      <div className="py-2 px-2 flex justify-between items-center">
        <span className="w-[30%] text-small text-default-400">
          {selectedKeys === "all"
            ? "All items selected"
            : `${selectedKeys.size} of ${sortedItems.length} selected`}
        </span>

        <Pagination
          isCompact
          showControls
          showShadow
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

        <div className="hidden sm:flex w-[30%] justify-end gap-2">
          <Button
            isDisabled={filteration.page <= 1}
            size="sm"
            variant="flat"
            onPress={onPreviousPage}
          >
            Previous
          </Button>

          <Button
            isDisabled={filteration.page >= pages}
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
    sortedItems.length,
    filteration.page,
    pages,
    onPreviousPage,
    onNextPage,
  ]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="font-sans text-2xl font-medium">
            Project Purchase Orders
          </h1>

          <p className="text-sm text-default-500">Project ID: {projectId}</p>
        </div>
      </div>

      {!canCreatePurchaseOrder && (
        <div className="rounded-lg border border-warning-200 bg-warning-50 px-4 py-3 text-sm text-warning-700">
          Purchase order creation needs procurement assignment and selected
          vendor. Please finalize/map vendor first.
        </div>
      )}

      {error && (
        <div className="rounded-lg border border-danger-200 bg-danger-50 px-4 py-3 text-sm text-danger">
          {error}
        </div>
      )}

      <Table
        isHeaderSticky
        aria-label="Project purchase order table"
        bottomContent={bottomContent}
        bottomContentPlacement="outside"
        classNames={{
          wrapper: "max-h-[65vh] w-full",
          table: "w-full",
        }}
        // selectedKeys={selectedKeys}
        // selectionMode="multiple"
        sortDescriptor={sortDescriptor}
        topContent={topContent}
        topContentPlacement="outside"
        // onSelectionChange={setSelectedKeys}
        onSortChange={setSortDescriptor}
      >
        <TableHeader columns={headerColumns}>
          {(column) => (
            <TableColumn
              key={column.uid}
              align="start"
              allowsSorting={column.sortable}
            >
              {column.name}
            </TableColumn>
          )}
        </TableHeader>

        <TableBody
          isLoading={isLoading}
          emptyContent={
            isLoading
              ? "Loading purchase orders..."
              : "No purchase orders found"
          }
          items={paginatedItems}
        >
          {(item) => (
            <TableRow key={item?.id || item?.poNumber}>
              {(columnKey) => (
                <TableCell>{renderCell(item, columnKey)}</TableCell>
              )}
            </TableRow>
          )}
        </TableBody>
      </Table>

      <CreatePurchaseOrderModal
        open={isCreatePoModalOpen}
        onClose={() => setIsCreatePoModalOpen(false)}
        procurementAssignmentId={Number(procurementAssignmentId)}
        userId={Number(userId)}
        createdBy={Number(userId)}
        defaultEstimatedAmount={Number(defaultEstimatedAmount || 0)}
        vendorId={Number(vendorId)}
        onSuccess={fetchPurchaseOrders}
      />

      <RaiseProcurementPaymentRequestModal
        open={isRaisePrModalOpen}
        onClose={() => {
          setIsRaisePrModalOpen(false);
          setSelectedProcurementOrder(null);
        }}
        procurementOrder={selectedProcurementOrder}
        createdBy={Number(userId)}
        onSuccess={fetchPurchaseOrders}
      />

      <Modal
        isDismissable={false}
        isKeyboardDismissDisabled={true}
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        placement="top-center"
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader>Update status</ModalHeader>
              <ModalBody>
                <Form
                  onSubmit={(e) => {
                    e.preventDefault();
                    let data = Object.fromEntries(
                      new FormData(e.currentTarget),
                    );

                    dispatch(
                      updateProcurementPaymentRequestByOrderId({
                        procurementOrderId: selectedProcurementOrder?.id,
                        data: {
                          status: data.status,
                          remarks: data.comment,
                          userId,
                        },
                      }),
                    ).then((res) => {
                      if (res.meta.requestStatus === "fulfilled") {
                        addToast({
                          title: "Status updated",
                          description:
                            "Procurement order status updated successfully.",
                          color: "success",
                        });
                        onClose();
                        fetchPurchaseOrders();
                      } else {
                        addToast({
                          title: "Failed to update status",
                          description:
                            res?.payload ||
                            "Something went wrong while updating status.",
                          color: "danger",
                        });
                      }
                    });
                  }}
                  className="flex flex-col gap-4"
                >
                  <div className="max-h-[60vh] overflow-auto px-2 space-x-0 space-y-4 w-full">
                    <Select
                      className="max-w-full"
                      name="status"
                      isRequired
                      errorMessage="please select status"
                      items={[
                        { label: "APPROVED", uid: "APPROVED" },
                        { label: "DRAFT", uid: "DRAFT" },
                      ]}
                      label="Select status"
                    >
                      {(status) => (
                        <SelectItem key={status?.uid}>
                          {status.label}
                        </SelectItem>
                      )}
                    </Select>
                    <Input
                      className="w-full"
                      label="Remark"
                      name="remarks"
                      isRequired
                      errorMessage={"please enter comment"}
                    />
                  </div>

                  <ModalFooter className="flex justify-end w-full">
                    <Button onPress={onClose}>Cancel</Button>
                    <Button color="primary" type="submit">
                      Submit
                    </Button>
                  </ModalFooter>
                </Form>
              </ModalBody>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
};

export default ProjectPurchaseOrder;
