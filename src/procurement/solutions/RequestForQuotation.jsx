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
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
  useDisclosure,
} from "@heroui/react";
import { Input as AntInput, Select as AntSelect } from "antd";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import {
  ChevronDown,
  EllipsisVertical,
  ExternalLink,
  Eye,
  Plus,
  Search,
  UserPlus,
} from "lucide-react";
import dayjs from "dayjs";

import NewTextEditor from "../../components/NewTextEditor";
import {
  createVendorAgainstProduct,
  getAllVendors,
  getProductVendorsByProductId,
} from "../../toolkit/slices/vendorsSlice";
import FileUploader from "../../components/FileUploader";
// import {
//   createVendorAgainstProduct,
//   getAllVendors,
//   getProductVendorsByProductId,
// } from "../../toolkit/slices/operationSlice";

const columns = [
  { name: "VENDOR", uid: "vendorName" },
  { name: "CONTACT", uid: "contact" },
  { name: "GST / PAN", uid: "gstPan" },
  { name: "STATUS", uid: "status" },
  { name: "EMAIL SUBJECT", uid: "emailSubject" },
  { name: "AGREEMENT", uid: "agreementAttachment" },
  { name: "CREATED DATE", uid: "createdDate" },
  { name: "ACTIONS", uid: "actions" },
];

const INITIAL_VISIBLE_COLUMNS = [
  "vendorName",
  "contact",
  "gstPan",
  "status",
  "emailSubject",
  "agreementAttachment",
  "createdDate",
  "actions",
];

const defaultValues = {
  vendorId: undefined,
  emailSubject: "",
  emailBody: "<p></p>",
  agreementAttachment: "",
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

const RequestForQuotation = () => {
  const dispatch = useDispatch();
  const { solutionId, userId } = useParams();

  const currentUser = useSelector((state) => state.auth.currentUser);

  const rfqModal = useDisclosure();
  const viewModal = useDisclosure();
  const registerVendorModal = useDisclosure();

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

  const fetchProductVendors = useCallback(() => {
    if (!solutionId || !userId) return;

    setLoading(true);

    dispatch(
      getProductVendorsByProductId({
        productId: solutionId,
        userId,
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
  }, [dispatch, solutionId, userId, filteration.page, filteration.size]);

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
    fetchProductVendors();
  }, [fetchProductVendors]);

  useEffect(() => {
    fetchVendors();
  }, [fetchVendors]);

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
    if (!solutionId || !userId) {
      addToast({
        title: "ERROR",
        description: "Product ID or User ID is missing.",
        color: "danger",
      });
      return;
    }

    const payload = {
      vendorId: Number(values?.vendorId),
      emailSubject: values?.emailSubject || "",
      emailBody: values?.emailBody || "<p></p>",
      agreementAttachment:
        values?.agreementAttachment?.filePath ||
        values?.agreementAttachment?.url ||
        values?.agreementAttachment?.path ||
        values?.agreementAttachment ||
        "",
    };

    setSubmitLoading(true);

    dispatch(
      createVendorAgainstProduct({
        productId: solutionId,
        userId,
        data: payload,
      }),
    ).then((resp) => {
      setSubmitLoading(false);

      if (resp.meta.requestStatus === "fulfilled") {
        addToast({
          title: "SUCCESS",
          description: "Vendor mapped with product successfully.",
          color: "success",
        });

        rfqModal.onClose();
        resetRfqForm(defaultValues);
        setMailBody("<p></p>");
        fetchProductVendors();
      } else {
        addToast({
          title: "ERROR",
          description:
            resp?.payload?.message ||
            resp?.payload?.data?.message ||
            resp?.payload ||
            "Something went wrong.",
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

    console.log("Register vendor payload", payload);

    /*
    Replace this with your actual registration API dispatch.

    Example:
    dispatch(
      registerVendorForProduct({
        userId,
        mappingId: values?.mappingId,
        data: payload,
      }),
    ).then((resp) => {
      if (resp.meta.requestStatus === "fulfilled") {
        addToast({
          title: "SUCCESS",
          description: "Vendor registered successfully.",
          color: "success",
        });

        registerVendorModal.onClose();
        resetRegisterVendorForm(vendorRegistrationDefaultValues);
        fetchProductVendors();
      } else {
        addToast({
          title: "ERROR",
          description:
            resp?.payload?.message ||
            resp?.payload?.data?.message ||
            "Vendor registration failed.",
          color: "danger",
        });
      }
    });
  */

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

  const renderCell = useCallback((rowData, columnKey) => {
    switch (columnKey) {
      case "vendorName":
        return (
          <div className="flex flex-col">
            <span className="font-medium text-foreground">
              {rowData?.vendorName || "-"}
            </span>
            <span className="text-xs text-default-500">
              Product: {rowData?.productName || "-"}
            </span>
          </div>
        );

      case "contact":
        return (
          <div className="flex flex-col gap-1">
            <span className="text-sm">{rowData?.email || "-"}</span>
            {rowData?.mobile && (
              <Chip size="sm" variant="flat">
                {rowData.mobile}
              </Chip>
            )}
          </div>
        );

      case "gstPan":
        return (
          <div className="flex flex-col gap-1">
            <span className="text-xs text-default-500">
              GST: {rowData?.gstNumber || "-"}
            </span>
            <span className="text-xs text-default-500">
              PAN: {rowData?.panNumber || "-"}
            </span>
          </div>
        );

      case "status":
        return (
          <div className="flex flex-col gap-1">
            <Chip
              size="sm"
              color={getStatusColor(rowData?.status)}
              variant="flat"
            >
              {rowData?.status || "-"}
            </Chip>

            {rowData?.verified && (
              <Chip size="sm" color="success" variant="flat">
                Verified
              </Chip>
            )}
          </div>
        );

      case "emailSubject":
        return (
          <div className="max-w-[260px]">
            <p className="truncate text-sm" title={rowData?.emailSubject}>
              {rowData?.emailSubject || "-"}
            </p>
          </div>
        );

      case "agreementAttachment":
        return rowData?.agreementAttachment ? (
          <a
            href={rowData.agreementAttachment}
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

      case "createdDate":
        return (
          <span className="text-sm">
            {rowData?.createdDate
              ? dayjs(rowData.createdDate).format("DD-MM-YYYY hh:mm A")
              : "-"}
          </span>
        );

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

              <DropdownItem
                key="registerVendor"
                startContent={<UserPlus size={15} />}
                onPress={() => handleOpenRegisterVendor(rowData)}
              >
                Register Vendor
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
        isOpen={rfqModal.isOpen}
        onOpenChange={rfqModal.onOpenChange}
        size="4xl"
        isDismissable={false}
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader>Create RFQ</ModalHeader>
              <form onSubmit={handleRfqFormSubmit(onSubmitRFQ)}>
                <ModalBody>
                  <div className="max-h-[60vh] overflow-auto p-2">
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <Controller
                        name="vendorId"
                        control={control}
                        render={({ field }) => (
                          <div>
                            <label className="mb-1 block text-sm font-medium text-gray-700">
                              Vendor <span className="text-red-500">*</span>
                            </label>

                            <AntSelect
                              size="large"
                              showSearch
                              placeholder="Select vendor"
                              optionFilterProp="label"
                              value={field.value}
                              onChange={(value) => field.onChange(value)}
                              options={vendorList.map((vendor) => ({
                                label: getVendorOptionLabel(vendor),
                                value: Number(vendor?.id || vendor?.vendorId),
                              }))}
                              className="w-full"
                            />

                            {errors.vendorId?.message && (
                              <p className="mt-1 text-xs text-red-500">
                                {errors.vendorId.message}
                              </p>
                            )}
                          </div>
                        )}
                      />

                      <Controller
                        name="agreementAttachment"
                        control={control}
                        render={({ field, fieldState: { error } }) => (
                          <FileUploader
                            label="Attachment"
                            value={field.value}
                            onChange={(value) => {
                              field.onChange(value);

                              setValue("agreementAttachment", value, {
                                shouldValidate: true,
                                shouldDirty: true,
                              });
                            }}
                            errorMessage={error?.message}
                            isInvalid={!!error}
                          />
                        )}
                      />
                    </div>

                    <Controller
                      name="emailSubject"
                      control={control}
                      render={({ field }) => (
                        <div className="mt-4">
                          <label className="mb-1 block text-sm font-medium text-gray-700">
                            Email Subject{" "}
                            <span className="text-red-500">*</span>
                          </label>

                          <AntInput
                            placeholder="Enter email subject"
                            value={field.value}
                            onChange={(e) => field.onChange(e.target.value)}
                          />

                          {errors.emailSubject?.message && (
                            <p className="mt-1 text-xs text-red-500">
                              {errors.emailSubject.message}
                            </p>
                          )}
                        </div>
                      )}
                    />

                    <Controller
                      name="emailBody"
                      control={control}
                      render={({ field }) => (
                        <div className="mt-4 w-full overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
                          <div className="flex items-start justify-between gap-4 border-b border-gray-200 bg-gray-50 px-4 py-3">
                            <div>
                              <label className="block text-sm font-semibold text-gray-900">
                                Email Body{" "}
                                <span className="text-red-500">*</span>
                              </label>

                              <p className="mt-1 text-xs leading-5 text-gray-500">
                                Write RFQ email body here. This will be sent in
                                HTML format.
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
                                setMailBody(value);
                                trigger("emailBody");
                              }}
                            />
                          </div>

                          {errors.emailBody?.message && (
                            <p className="px-4 pb-3 text-xs text-red-500">
                              {errors.emailBody.message}
                            </p>
                          )}
                        </div>
                      )}
                    />
                  </div>
                </ModalBody>

                <ModalFooter className="flex w-full justify-end gap-1.5">
                  <Button
                    variant="flat"
                    type="button"
                    onPress={() => {
                      rfqModal.onClose();
                      resetRfqForm(defaultValues);
                      setMailBody("<p></p>");
                    }}
                    isDisabled={submitLoading}
                  >
                    Cancel
                  </Button>

                  <Button
                    type="submit"
                    color="primary"
                    isLoading={submitLoading}
                  >
                    Submit RFQ
                  </Button>
                </ModalFooter>
              </form>
            </>
          )}
        </ModalContent>
      </Modal>

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
        isOpen={registerVendorModal.isOpen}
        onOpenChange={registerVendorModal.onOpenChange}
        size="4xl"
        isDismissable={false}
      >
        <ModalContent>
          <>
            <ModalHeader className="border-b">Register Vendor</ModalHeader>

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
                          <div>
                            <label className="mb-1 block text-sm font-medium text-gray-700">
                              Unit <span className="text-red-500">*</span>
                            </label>

                            <AntSelect
                              size="large"
                              value={field.value}
                              onChange={(value) => field.onChange(value)}
                              className="w-full"
                              options={[
                                {
                                  label: "Per Application",
                                  value: "Per Application",
                                },
                                {
                                  label: "Per Certificate",
                                  value: "Per Certificate",
                                },
                                {
                                  label: "Per Project",
                                  value: "Per Project",
                                },
                                {
                                  label: "Per Month",
                                  value: "Per Month",
                                },
                              ]}
                            />

                            {registerErrors.unit?.message && (
                              <p className="mt-1 text-xs text-red-500">
                                {registerErrors.unit.message}
                              </p>
                            )}
                          </div>
                        )}
                      />

                      <Controller
                        name="paymentTerms"
                        control={registerControl}
                        render={({ field }) => (
                          <Input
                            label="Payment Terms"
                            isRequired
                            placeholder="Example: 50% advance, 50% after completion"
                            value={field.value}
                            onChange={(e) => field.onChange(e.target.value)}
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
                            label="Price List"
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
                            label="Agreement Attachment"
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

                <Button color="primary" type="submit">
                  Register Vendor
                </Button>
              </ModalFooter>
            </form>
          </>
        </ModalContent>
      </Modal>
    </>
  );
};

export default RequestForQuotation;
