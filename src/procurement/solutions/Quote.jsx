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
} from "@heroui/react";
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
  Plus,
  Search,
} from "lucide-react";
import dayjs from "dayjs";

import FileUploader from "../../components/FileUploader";
import {
  createQuotation,
  getAllQuotations,
} from "../../toolkit/slices/vendorsSlice";

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

const quotationDefaultValues = {
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

  const { userId, rfqId } = useParams();

  const currentUser = useSelector((state) => state.auth.currentUser);

  const quotationModal = useDisclosure();
  const viewModal = useDisclosure();

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

  const [quotationResponse, setQuotationResponse] = useState(null);
  const [selectedQuotation, setSelectedQuotation] = useState(null);

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

  const queryParams = useMemo(() => {
    return new URLSearchParams(location.search);
  }, [location.search]);

  const routeRfqVendorId = useMemo(() => {
    return location.state?.rfqVendorId || queryParams.get("rfqVendorId") || "";
  }, [location.state, queryParams]);

  const routeVendorId = useMemo(() => {
    return location.state?.vendorId || queryParams.get("vendorId") || "";
  }, [location.state, queryParams]);

  const routeVendorName = useMemo(() => {
    return location.state?.vendorName || queryParams.get("vendorName") || "";
  }, [location.state, queryParams]);

  const routeVendorEmail = useMemo(() => {
    return location.state?.vendorEmail || queryParams.get("vendorEmail") || "";
  }, [location.state, queryParams]);

  const quotationList = useMemo(() => {
    return normalizePageContent(quotationResponse);
  }, [quotationResponse]);

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
  }, [quotationList, filterValue]);

  const pages = Math.ceil(filteredItems.length / filteration.size) || 1;

  const paginatedItems = useMemo(() => {
    const start = (filteration.page - 1) * filteration.size;
    const end = start + filteration.size;

    return filteredItems.slice(start, end);
  }, [filteredItems, filteration.page, filteration.size]);

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

  useEffect(() => {
    fetchQuotations();
  }, [fetchQuotations]);

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

  const handleOpenAddQuote = () => {
    if (!rfqId || !routeRfqVendorId || !routeVendorId) {
      addToast({
        title: "ERROR",
        description:
          "RFQ Vendor ID or Vendor ID is missing. Please open Add Quote from RFQ vendor action.",
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

    if (!rfqId || !routeRfqVendorId || !routeVendorId) {
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
      rfqVendorId: Number(routeRfqVendorId),
      vendorId: Number(routeVendorId),

      quotationNumber: `QTN-${rfqId}-${routeVendorId}-${dayjs().format(
        "YYYYMMDDHHmmss",
      )}`,

      quotationDate: new Date().toISOString(),

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
    },
    [handleView],
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

          <div className="flex gap-3">
            <Button
              color="primary"
              startContent={<Plus size={17} />}
              onPress={handleOpenAddQuote}
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
            Total {filteredItems.length || count} quotations
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

                  <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-4">
                    <div>
                      <p className="text-xs text-default-500">Quotation Date</p>
                      <p className="font-medium">
                        {selectedQuotation?.quotationDate
                          ? dayjs(selectedQuotation.quotationDate).format(
                              "DD-MM-YYYY hh:mm A",
                            )
                          : "-"}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-default-500">Valid Till</p>
                      <p className="font-medium">
                        {selectedQuotation?.validTill
                          ? dayjs(selectedQuotation.validTill).format(
                              "DD-MM-YYYY hh:mm A",
                            )
                          : "-"}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-default-500">Delivery Days</p>
                      <p className="font-medium">
                        {selectedQuotation?.deliveryDays ?? "-"}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-default-500">Currency</p>
                      <Chip size="sm" color="primary" variant="flat">
                        {selectedQuotation?.currency || "INR"}
                      </Chip>
                    </div>
                  </div>
                </div>

                <div className="rounded-xl border bg-white p-4 shadow-sm">
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                    <div>
                      <p className="text-xs text-default-500">Payment Terms</p>
                      <p className="font-medium">
                        {selectedQuotation?.paymentTerms || "-"}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-default-500">Warranty Terms</p>
                      <p className="font-medium">
                        {selectedQuotation?.warrantyTerms || "-"}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-default-500">Remarks</p>
                      <p className="font-medium">
                        {selectedQuotation?.remarks || "-"}
                      </p>
                    </div>
                  </div>
                </div>

                {selectedQuotation?.quotationAttachmentUrl && (
                  <div className="rounded-xl border bg-white p-4 shadow-sm">
                    <a
                      href={selectedQuotation.quotationAttachmentUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-white"
                    >
                      View Quotation Attachment <ExternalLink size={14} />
                    </a>
                  </div>
                )}

                <div className="rounded-xl border bg-white p-4 shadow-sm">
                  <h3 className="mb-3 text-sm font-semibold text-gray-900">
                    Quotation Items
                  </h3>

                  {selectedQuotation?.items?.length ? (
                    <div className="space-y-3">
                      {selectedQuotation.items.map((item, index) => (
                        <div
                          key={item?.id || index}
                          className="rounded-xl border bg-gray-50 p-4"
                        >
                          <div className="mb-2 flex items-center justify-between">
                            <p className="text-sm font-semibold">
                              Item #{index + 1}
                            </p>

                            <Chip size="sm" variant="flat">
                              {item?.itemType || "-"}
                            </Chip>
                          </div>

                          <div className="grid grid-cols-1 gap-3 text-sm md:grid-cols-4">
                            <div>
                              <p className="text-xs text-default-500">
                                Item Name
                              </p>
                              <p className="font-medium">
                                {item?.itemName || "-"}
                              </p>
                            </div>

                            <div>
                              <p className="text-xs text-default-500">
                                Quantity
                              </p>
                              <p className="font-medium">
                                {item?.quantity ?? "-"}
                              </p>
                            </div>

                            <div>
                              <p className="text-xs text-default-500">Unit</p>
                              <p className="font-medium">{item?.unit || "-"}</p>
                            </div>

                            <div>
                              <p className="text-xs text-default-500">
                                Unit Rate
                              </p>
                              <p className="font-medium">
                                {item?.unitRate ?? "-"}
                              </p>
                            </div>

                            <div>
                              <p className="text-xs text-default-500">Tax %</p>
                              <p className="font-medium">
                                {item?.taxPercent ?? "-"}
                              </p>
                            </div>

                            <div className="md:col-span-3">
                              <p className="text-xs text-default-500">
                                Description
                              </p>
                              <p className="font-medium">
                                {item?.description || "-"}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="rounded-xl border border-dashed bg-gray-50 py-8 text-center text-sm text-default-500">
                      No items found.
                    </div>
                  )}
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
        scrollBehavior="inside"
      >
        <ModalContent>
          <>
            <ModalHeader className="border-b">Add Quote</ModalHeader>

            <form onSubmit={handleQuotationFormSubmit(onSubmitQuotation)}>
              <ModalBody>
                <div className="max-h-[65vh] overflow-auto p-2">
                  <div className="mb-4 rounded-xl border bg-blue-50 p-4">
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                      <div>
                        <p className="text-xs text-default-500">RFQ ID</p>
                        <p className="font-semibold">{rfqId || "-"}</p>
                      </div>

                      <div>
                        <p className="text-xs text-default-500">
                          RFQ Vendor ID
                        </p>
                        <p className="font-semibold">
                          {routeRfqVendorId || "-"}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs text-default-500">Vendor</p>
                        <p className="font-semibold">
                          {routeVendorName || routeVendorId || "-"}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs text-default-500">Email</p>
                        <p className="font-semibold">
                          {routeVendorEmail || "-"}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-xl border bg-gray-50 p-4">
                    <h3 className="mb-3 text-sm font-semibold text-gray-900">
                      Quotation Basic Details
                    </h3>

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
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

                <Button color="primary" type="submit" isLoading={submitLoading}>
                  Submit
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
