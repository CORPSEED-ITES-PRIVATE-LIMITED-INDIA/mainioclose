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
} from "@heroui/react";
import { ArrowLeft, ChevronDown, FileText, Plus, Search } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import {
  getOperationProjectDetailById,
  getProcurementOrderByPurchaseId,
} from "../../toolkit/slices/operationSlice";
import { getVendorDetailInProject } from "../../toolkit/slices/vendorsSlice";
import CreatePurchaseOrderModal from "./CreatePurchaseOrderModal";

const columns = [
  { name: "PO NUMBER", uid: "poNumber", sortable: true },
  { name: "REFERENCE NO.", uid: "poReferenceNumber", sortable: true },
  { name: "PROJECT", uid: "projectName", sortable: true },
  { name: "VENDOR", uid: "vendorName", sortable: true },
  { name: "FINAL AMOUNT", uid: "finalAmount", sortable: true },
  { name: "GRAND TOTAL", uid: "grandTotal", sortable: true },
  { name: "PAYMENT", uid: "payment" },
  { name: "TAX", uid: "tax" },
  { name: "STATUS", uid: "status", sortable: true },
  { name: "CREATED DATE", uid: "createdDate", sortable: true },
  { name: "ATTACHMENTS", uid: "attachmentUrls" },
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
];

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

const ProjectPurchaseOrder = () => {
  const { userId, projectId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  const [isCreatePoModalOpen, setIsCreatePoModalOpen] = useState(false);

  const purchaseOrderResponse = useSelector(
    (state) => state.operation.procurementOrderByPurchaseIdList,
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

  const renderCell = useCallback((rowData, columnKey) => {
    switch (columnKey) {
      case "poNumber":
        return (
          <div className="flex flex-col">
            <span className="font-medium">{rowData?.poNumber || "-"}</span>
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

      default:
        return rowData?.[columnKey] || "-";
    }
  }, []);

  const topContent = useMemo(() => {
    const uniqueStatuses = Array.from(
      new Set(data.map((item) => item?.status).filter(Boolean)),
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
            placeholder="Search by PO, project, vendor..."
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

        <div className="flex flex-wrap gap-2">
          <Button
            color="primary"
            startContent={<Plus size={16} />}
            onPress={handleOpenCreatePurchaseOrder}
          >
            Add Purchase Order
          </Button>

          <Button
            variant="flat"
            startContent={<ArrowLeft size={16} />}
            onPress={() =>
              navigate(
                `/erp/${userId}/operation/projects/${projectId}/projectDetail`,
              )
            }
          >
            Back to Project
          </Button>
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
        selectedKeys={selectedKeys}
        selectionMode="multiple"
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
    </div>
  );
};

export default ProjectPurchaseOrder;
