import {
  addToast,
  Button,
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerHeader,
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
  Tooltip,
  useDisclosure,
} from "@heroui/react";
import {
  ChevronDown,
  EllipsisVertical,
  ExternalLink,
  FileText,
  Search,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import {
  approveDiscount,
  getAllProposalByUserIdForManager,
  getAllPropsalListCount,
  proposalApprovalByManager,
  rejectDiscount,
} from "../../toolkit/slices/leadSlice";
import dayjs from "dayjs";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import * as z from "zod";
import LoadingSpinner from "../../components/LoadingSpinner";

const columns = [
  { name: "ID", uid: "id" },
  { name: "DATE", uid: "date" },
  { name: "PROPOSAL NO.", uid: "proposalNumber" },
  { name: "SOLUTION NAME", uid: "solutionName" },
  { name: "CREATED BY", uid: "createdBy" },
  { name: "EMAIL TO", uid: "mailTo" },
  { name: "EMAIL BY", uid: "createdByEmail" },
  { name: "BROCHURES", uid: "brochures" },
  { name: "STATUS", uid: "status" },
  { name: "ACTIONS", uid: "actions" },
];

function capitalize(s) {
  return s ? s.charAt(0).toUpperCase() + s.slice(1).toLowerCase() : "";
}

const normalizeStatus = (status = "") =>
  String(status || "")
    .trim()
    .replace(/\s+/g, "_")
    .toUpperCase();

const isDiscountApprovalPendingStatus = (status) =>
  normalizeStatus(status) === "DISCOUNT_APPROVAL_PENDING";

const getDiscountApprovalToken = (proposal) =>
  proposal?.discountApprovalToken ||
  proposal?.discountToken ||
  proposal?.approvalToken ||
  proposal?.token ||
  "";

const ProposalPdfPreview = ({ pdfUrl, pdfFileName }) => {
  console.log("pdfUrl:", pdfUrl);
  return (
    <div className="bg-white rounded-xl shadow border overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b bg-gray-50 px-5 py-3">
        <div>
          <h3 className="text-base font-semibold text-gray-800">
            Proposal PDF
          </h3>

          <p className="text-xs text-gray-500 mt-1">
            {pdfFileName || "Generated proposal PDF"}
          </p>
        </div>

        {pdfUrl && (
          <a
            href={pdfUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 rounded-lg bg-blue-600 px-3 py-2 text-xs font-semibold text-white hover:bg-blue-700"
          >
            Open PDF <ExternalLink size={13} />
          </a>
        )}
      </div>

      {pdfUrl ? (
        <div className="bg-gray-100 p-3">
          <iframe
            src={pdfUrl}
            title={pdfFileName || "Proposal PDF"}
            className="h-[78vh] w-full rounded-lg border bg-white"
          />
        </div>
      ) : (
        <div className="p-5">
          <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 py-10 text-center">
            <p className="text-sm font-semibold text-gray-700">
              No proposal PDF found
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

const INITIAL_VISIBLE_COLUMNS = [
  "id",
  "date",
  "proposalNumber",
  "createdBy",
  "solutionName",
  "mailTo",
  "brochures",
  "status",
  "actions",
];

const formSchema = z.object({
  comment: z.string().min(1, "Please enter the comment"),
});

const defaultValues = {
  comment: "",
};

const hasRenderableHtml = (html = "") =>
  String(html || "")
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/g, " ")
    .trim().length > 0;

const isImageBrochure = (brochure) => {
  const fileName = brochure?.fileName || "";
  const filePath = brochure?.filePath || "";

  return /\.(jpg|jpeg|png|webp|gif)$/i.test(fileName || filePath);
};

const getProposalBrochures = (proposal) => [
  {
    key: "menu",
    title: "Menu Brochure",
    entityName: proposal?.menu?.name,
    brochure: proposal?.menu?.brochure,
  },
  {
    key: "menuCategory",
    title: "Category Brochure",
    entityName: proposal?.menuCategory?.name,
    brochure: proposal?.menuCategory?.brochure,
  },
  {
    key: "subCategory",
    title: "Subcategory Brochure",
    entityName: proposal?.subCategory?.name,
    brochure: proposal?.subCategory?.brochure,
  },
  {
    key: "solution",
    title: "Service / Solution Brochure",
    entityName: proposal?.solution?.name,
    brochure: proposal?.solution?.brochure,
  },
];

const getAvailableBrochureCount = (proposal) =>
  getProposalBrochures(proposal).filter((item) => item?.brochure?.filePath)
    .length;

const ProposalBrochureCard = ({ title, entityName, brochure }) => {
  const hasBrochure = Boolean(brochure?.filePath);
  const isImage = isImageBrochure(brochure);

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
      <div className="border-b border-gray-100 bg-gray-50 px-4 py-3">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-sm font-semibold text-gray-900">{title}</p>
            <p className="mt-1 truncate text-xs text-gray-500">
              {entityName || "---"}
            </p>
          </div>

          <span
            className={`shrink-0 rounded-full border px-2.5 py-1 text-xs font-semibold ${
              hasBrochure
                ? "border-green-200 bg-green-50 text-green-700"
                : "border-gray-200 bg-gray-50 text-gray-500"
            }`}
          >
            {hasBrochure ? "Available" : "Not Added"}
          </span>
        </div>
      </div>

      <div className="p-4">
        {hasBrochure ? (
          <>
            <div className="flex h-36 items-center justify-center overflow-hidden rounded-xl border border-gray-100 bg-gray-50">
              {isImage ? (
                <img
                  src={brochure.filePath}
                  alt={brochure.fileName || title}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="text-center">
                  <FileText className="mx-auto text-gray-400" size={34} />
                  <p className="mt-2 text-xs font-medium text-gray-500">
                    Document
                  </p>
                </div>
              )}
            </div>

            <div className="mt-4 space-y-2 text-xs text-gray-600">
              <p className="break-words">
                <span className="font-semibold text-gray-900">File:</span>{" "}
                {brochure.fileName || "---"}
              </p>

              <p>
                <span className="font-semibold text-gray-900">ID:</span>{" "}
                {brochure.id || "---"}
              </p>
            </div>

            <a
              href={brochure.filePath}
              target="_blank"
              rel="noreferrer"
              className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
            >
              Open Brochure
              <ExternalLink size={15} />
            </a>
          </>
        ) : (
          <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 p-6 text-center">
            <FileText className="mx-auto text-gray-400" size={30} />

            <p className="mt-2 text-sm font-semibold text-gray-700">
              No brochure found
            </p>

            <p className="mt-1 text-xs text-gray-500">
              Brochure is not available for this level.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

const HtmlPreviewBlock = ({ title, subtitle, html, emptyText }) => {
  const hasContent = hasRenderableHtml(html);

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
      <div className="border-b border-gray-200 bg-gray-50 px-5 py-3">
        <h3 className="text-base font-semibold text-gray-900">{title}</h3>

        {subtitle ? (
          <p className="mt-1 text-xs text-gray-500">{subtitle}</p>
        ) : null}
      </div>

      <div className="p-5 md:p-6">
        {hasContent ? (
          <div
            className="proposal-content tiptap-preview force-preview-text max-w-none"
            dangerouslySetInnerHTML={{
              __html: html,
            }}
          />
        ) : (
          <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 p-6 text-center">
            <FileText className="mx-auto text-gray-400" size={30} />

            <p className="mt-2 text-sm font-semibold text-gray-700">
              {emptyText}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

const AllProposal = () => {
  const { userId } = useParams();
  const dispatch = useDispatch();
  const { isOpen, onOpen, onOpenChange, onClose } = useDisclosure();
  const proposalDrawer = useDisclosure();

  const count = useSelector((state) => state.leads.proposalCount);
  const data = useSelector((state) => state.leads.proposalList);

  const [filterValue, setFilterValue] = useState("");
  const [selectedKeys, setSelectedKeys] = useState(new Set([]));
  const [visibleColumns, setVisibleColumns] = useState(
    new Set(INITIAL_VISIBLE_COLUMNS),
  );
  const [sortDescriptor, setSortDescriptor] = useState({
    column: "age",
    direction: "ascending",
  });
  const [filteration, setFilteration] = useState({
    id: userId,
    page: 1,
    size: 50,
    status: "initiated",
  });
  const [updateStatusData, setUpdateStatusData] = useState({
    proposalId: null,
    status: null,
    userId,
    comment: "",
  });
  const [loading, setLoading] = useState("");
  const [confirmApproveModal, setConfirmApproveModal] = useState({
    isOpen: false,
    rowData: null,
  });
  const [discountActionModal, setDiscountActionModal] = useState({
    isOpen: false,
    action: null,
    rowData: null,
    remarks: "",
  });
  const [selectedProposalDetail, setSelectedProposalDetail] = useState(null);

  const hasSearchFilter = Boolean(filterValue);

  useEffect(() => {
    dispatch(getAllProposalByUserIdForManager(filteration));
    dispatch(getAllPropsalListCount(userId));
  }, [dispatch, filteration, userId]);

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: zodResolver(formSchema),
    defaultValues,
  });

  const headerColumns = useMemo(() => {
    if (visibleColumns === "all") return columns;

    return columns.filter((column) =>
      Array.from(visibleColumns).includes(column.uid),
    );
  }, [visibleColumns]);

  const filteredItems = useMemo(() => {
    let filteredUsers = [...(data || [])];

    if (hasSearchFilter) {
      filteredUsers = filteredUsers.filter((item) =>
        Object.values(item)?.some((val) =>
          String(val)?.toLowerCase()?.includes(filterValue?.toLowerCase()),
        ),
      );
    }

    return filteredUsers;
  }, [data, filterValue, hasSearchFilter]);

  const pages = Math.ceil(count / filteration?.size) || 1;

  const items = useMemo(() => {
    const start = (filteration?.page - 1) * filteration?.size;
    const end = start + filteration?.size;

    return filteredItems.slice(start, end);
  }, [filteration, filteredItems]);

  const sortedItems = useMemo(() => {
    return [...items].sort((a, b) => {
      const first = a[sortDescriptor.column];
      const second = b[sortDescriptor.column];
      const cmp = first < second ? -1 : first > second ? 1 : 0;

      return sortDescriptor.direction === "descending" ? -cmp : cmp;
    });
  }, [sortDescriptor, items]);

  const handleActionsClick = (e, rowData) => {
    if (e === "view") {
      setSelectedProposalDetail(rowData);
      proposalDrawer.onOpen();
      return;
    }

    if (e === "APPROVE_DISCOUNT" || e === "REJECT_DISCOUNT") {
      setDiscountActionModal({
        isOpen: true,
        action: e,
        rowData,
        remarks: "",
      });
      return;
    }

    if (
      e === "APPROVED" &&
      (rowData?.status === "REJECTED" || rowData?.status === "CANCELLED")
    ) {
      setConfirmApproveModal({
        isOpen: true,
        rowData,
      });
      return;
    }

    setUpdateStatusData((prev) => ({
      ...prev,
      proposalId: rowData?.id,
      status: e,
    }));

    onOpen();
  };

  const handleConfirmRejectedToApproved = () => {
    setUpdateStatusData((prev) => ({
      ...prev,
      proposalId: confirmApproveModal?.rowData?.id,
      status: "APPROVED",
    }));

    setConfirmApproveModal({
      isOpen: false,
      rowData: null,
    });

    onOpen();
  };

  const handleChangeStatus = (values) => {
    setLoading("pending");

    dispatch(
      proposalApprovalByManager({
        ...updateStatusData,
        comment: values?.comment,
      }),
    )
      .then((resp) => {
        if (resp.meta.requestStatus === "fulfilled") {
          dispatch(getAllProposalByUserIdForManager(filteration));
          dispatch(getAllPropsalListCount(userId));

          if (updateStatusData.status === "APPROVED") {
            addToast({
              title: "Success",
              description: "Proposal approved successfully and sent to client.",
              color: "success",
            });
          } else {
            addToast({
              title: "Proposal disapproved successfully.",
              description: "Proposal disapproved successfully.",
              color: "success",
            });
          }

          setLoading("success");
          setUpdateStatusData({
            proposalId: null,
            status: null,
            userId,
            comment: "",
          });
          reset(defaultValues);
          onClose();
        } else {
          setLoading("error");
          addToast({
            title: "Something went wrong",
            description:
              resp?.payload?.data?.message || "Unable to update proposal.",
            color: "danger",
          });
        }
      })
      .catch(() => {
        setLoading("error");
        addToast({
          title: "Something went wrong",
          description: "Unable to update proposal.",
          color: "danger",
        });
      });
  };

  const handleDiscountActionSubmit = () => {
    const selectedProposal = discountActionModal?.rowData;
    const action = discountActionModal?.action;
    const token = getDiscountApprovalToken(selectedProposal);

    if (!token) {
      addToast({
        title: "Missing token",
        description: "Discount approval token is missing for this proposal.",
        color: "danger",
      });
      return;
    }

    if (action === "REJECT_DISCOUNT" && !discountActionModal?.remarks?.trim()) {
      addToast({
        title: "Remarks required",
        description: "Please enter remarks for discount rejection.",
        color: "danger",
      });
      return;
    }

    setLoading("pending");

    const apiCall =
      action === "APPROVE_DISCOUNT"
        ? approveDiscount({
            token,
            adminUserId: userId,
          })
        : rejectDiscount({
            token,
            adminUserId: userId,
            remarks: discountActionModal.remarks.trim(),
          });

    dispatch(apiCall)
      .then((resp) => {
        if (resp.meta.requestStatus === "fulfilled") {
          addToast({
            title: "Success",
            description:
              action === "APPROVE_DISCOUNT"
                ? "Discount approved successfully."
                : "Discount rejected successfully.",
            color: "success",
          });

          setDiscountActionModal({
            isOpen: false,
            action: null,
            rowData: null,
            remarks: "",
          });

          dispatch(getAllProposalByUserIdForManager(filteration));
          dispatch(getAllPropsalListCount(userId));

          setLoading("success");
        } else {
          setLoading("error");

          addToast({
            title: "Something went wrong",
            description:
              resp?.payload?.data?.message ||
              "Unable to update discount approval status.",
            color: "danger",
          });
        }
      })
      .catch(() => {
        setLoading("error");

        addToast({
          title: "Something went wrong",
          description: "Unable to update discount approval status.",
          color: "danger",
        });
      });
  };

  const renderCell = useCallback(
    (rowData, columnKey) => {
      switch (columnKey) {
        case "solutionName":
          return (
            <div className="flex items-start gap-2">
              <div className="flex flex-col">
                <p className="font-normal">{rowData?.solution?.name || "-"}</p>
              </div>
            </div>
          );

        case "createdBy":
          return (
            <div className="flex items-start gap-2">
              <div className="flex flex-col">
                <p className="font-normal">{rowData?.createdByName || "-"}</p>
              </div>
            </div>
          );

        case "date":
          return (
            <p className="font-normal text-xs capitalize">
              {rowData?.createDate
                ? dayjs(rowData.createDate).format("YYYY-MM-DD")
                : "-"}
            </p>
          );

        case "proposalNumber":
          return (
            <p className="font-normal text-xs capitalize">
              {rowData?.proposalNumber || "-"}
            </p>
          );

        case "mailTo":
          return (
            <div className="flex flex-col">
              <span className="font-normal">
                {rowData.mailTo?.join(" , ") || "-"}
              </span>
            </div>
          );

        case "createdByEmail":
          return (
            <div className="flex flex-col">
              <span className="font-normal">
                {rowData.createdByEmail || "-"}
              </span>
            </div>
          );

        case "status":
          return (
            <div className="flex flex-col">
              <span className="font-normal capitalize">
                {rowData?.status === "CANCELLED" ||
                rowData?.status === "REJECTED"
                  ? "REJECTED"
                  : rowData?.status || "-"}
              </span>
            </div>
          );

        case "brochures": {
          const brochureCount = getAvailableBrochureCount(rowData);

          return (
            <Tooltip content="View brochures, email body and scope of work">
              <Button
                size="sm"
                variant="flat"
                color={brochureCount > 0 ? "primary" : "default"}
                onPress={() => handleActionsClick("view", rowData)}
                className="font-medium"
              >
                View {brochureCount > 0 ? `(${brochureCount})` : ""}
              </Button>
            </Tooltip>
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
                    const key = Array.from(e)[0];
                    handleActionsClick(key, rowData);
                  }}
                >
                  <DropdownItem key="view">View</DropdownItem>

                  {rowData?.status === "INITIATED" ? (
                    <DropdownItem key="APPROVED">APPROVED</DropdownItem>
                  ) : null}

                  {rowData?.status === "INITIATED" ? (
                    <DropdownItem key="REJECTED">REJECTED</DropdownItem>
                  ) : null}

                  {isDiscountApprovalPendingStatus(rowData?.status) ? (
                    <DropdownItem key="APPROVE_DISCOUNT">
                      Approve Discount
                    </DropdownItem>
                  ) : null}

                  {isDiscountApprovalPendingStatus(rowData?.status) ? (
                    <DropdownItem
                      key="REJECT_DISCOUNT"
                      color="danger"
                      className="text-danger"
                    >
                      Reject Discount
                    </DropdownItem>
                  ) : null}
                </DropdownMenu>
              </Dropdown>
            </div>
          );

        default:
          return rowData[columnKey] || "-";
      }
    },
    [proposalDrawer],
  );

  const onNextPage = useCallback(() => {
    if (filteration?.page < pages) {
      setFilteration((prev) => ({ ...prev, page: prev.page + 1 }));
    }
  }, [filteration, pages]);

  const onPreviousPage = useCallback(() => {
    if (filteration?.page > 1) {
      setFilteration((prev) => ({ ...prev, page: prev.page - 1 }));
    }
  }, [filteration]);

  const onRowsPerPageChange = useCallback((e) => {
    setFilteration((prev) => ({
      ...prev,
      size: Number(e.target.value),
      page: 1,
    }));
  }, []);

  const onSearchChange = useCallback((value) => {
    if (value) {
      setFilterValue(value);
      setFilteration((prev) => ({ ...prev, page: 1 }));
    } else {
      setFilterValue("");
    }
  }, []);

  const onClear = useCallback(() => {
    setFilterValue("");
    setFilteration((prev) => ({ ...prev, page: 1 }));
  }, []);

  const topContent = useMemo(() => {
    return (
      <div className="flex flex-col gap-4">
        <div className="flex justify-between gap-3 items-end">
          <Input
            isClearable
            className="w-full sm:max-w-[35%]"
            placeholder="Search ..."
            startContent={<Search />}
            value={filterValue}
            onClear={() => onClear()}
            onValueChange={onSearchChange}
          />

          <div className="flex gap-3">
            <Dropdown>
              <DropdownTrigger className="hidden sm:flex">
                <Button
                  endContent={<ChevronDown />}
                  variant="flat"
                  className="capitalize"
                >
                  {filteration?.status}
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
                    status: selected || prev.status,
                    page: 1,
                  }));
                }}
              >
                {[
                  { label: "ALL", uid: "all" },
                  { label: "INITIATED", uid: "initiated" },
                  { label: "APPROVED", uid: "approved" },
                  { label: "REJECTED", uid: "rejected" },
                  {
                    label: "Discount Approval Pending",
                    uid: "Discount_Approval_Pending",
                  },
                ].map((status) => (
                  <DropdownItem key={status.uid} className="capitalize">
                    {capitalize(status.label)}
                  </DropdownItem>
                ))}
              </DropdownMenu>
            </Dropdown>

            <Dropdown>
              <DropdownTrigger className="hidden sm:flex">
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
          </div>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-default-400 text-small">
            Total {count} proposal
          </span>

          <label className="flex items-center text-default-400 text-small">
            Rows per page:
            <select
              className="bg-transparent outline-hidden text-default-400 text-small"
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
    onSearchChange,
    onClear,
    filteration,
    count,
  ]);

  const bottomContent = useMemo(() => {
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
          page={filteration?.page}
          total={pages}
          onChange={(page) => {
            setFilteration((prev) => ({ ...prev, page }));
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
  }, [selectedKeys, count, filteration, pages, onPreviousPage, onNextPage]);

  const selectedBrochures = getProposalBrochures(selectedProposalDetail);

  const selectedMailBody =
    selectedProposalDetail?.mailBody || selectedProposalDetail?.emailBody || "";

  const selectedProposal = selectedProposalDetail?.pdfUrl || "";
  const selectedProposalName = selectedProposalDetail?.pdfFileName || "";

  return (
    <>
      {loading === "pending" && <LoadingSpinner />}

      <h1 className="font-sans text-2xl font-medium mb-1">All proposal</h1>

      <Table
        isHeaderSticky
        aria-label="Proposal table with custom cells, pagination and sorting"
        bottomContent={bottomContent}
        bottomContentPlacement="outside"
        classNames={{
          wrapper: "max-h-[65vh] w-full",
          table: "w-full",
        }}
        selectedKeys={selectedKeys}
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

        <TableBody emptyContent="No data found" items={sortedItems}>
          {(item) => (
            <TableRow key={item.id}>
              {(columnKey) => (
                <TableCell>{renderCell(item, columnKey)}</TableCell>
              )}
            </TableRow>
          )}
        </TableBody>
      </Table>

      <Modal
        isDismissable={false}
        isKeyboardDismissDisabled={true}
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        placement="top-center"
      >
        <ModalContent>
          {(onCloseModal) => (
            <>
              <ModalHeader>Update status</ModalHeader>

              <ModalBody>
                <form
                  onSubmit={handleSubmit(handleChangeStatus)}
                  className="flex flex-col gap-4"
                >
                  <div className="max-h-[60vh] overflow-auto px-2">
                    <Controller
                      name="comment"
                      control={control}
                      render={({ field }) => (
                        <Input
                          label="Comment"
                          isRequired
                          value={field.value}
                          onChange={field.onChange}
                          errorMessage={
                            errors.comment?.message || "Please enter comment"
                          }
                          isInvalid={!!errors.comment}
                        />
                      )}
                    />
                  </div>

                  <ModalFooter className="flex justify-end">
                    <Button onPress={onCloseModal}>Cancel</Button>
                    <Button color="primary" type="submit">
                      Submit
                    </Button>
                  </ModalFooter>
                </form>
              </ModalBody>
            </>
          )}
        </ModalContent>
      </Modal>

      <Drawer
        size="5xl"
        placement="right"
        isOpen={proposalDrawer.isOpen}
        onOpenChange={(open) => {
          proposalDrawer.onOpenChange(open);

          if (!open) {
            setSelectedProposalDetail(null);
          }
        }}
        classNames={{
          base: "max-w-[92vw]",
          body: "p-0",
        }}
      >
        <DrawerContent>
          {(onCloseDrawer) => (
            <>
              <DrawerHeader className="border-b border-gray-200 px-6 py-4">
                <div className="flex w-full flex-col gap-1">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <h2 className="text-xl font-semibold text-gray-900">
                        Proposal Details
                      </h2>

                      <p className="mt-1 text-sm text-gray-500">
                        {selectedProposalDetail?.proposalNumber || "---"} •{" "}
                        {selectedProposalDetail?.companyName || "---"}
                      </p>
                    </div>

                    <Button variant="flat" onPress={onCloseDrawer}>
                      Close
                    </Button>
                  </div>
                </div>
              </DrawerHeader>

              <DrawerBody className="bg-gray-50">
                <div className="h-full overflow-auto p-5">
                  <div className="mx-auto flex w-full max-w-6xl flex-col gap-5">
                    <div className="grid grid-cols-1 gap-4 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm md:grid-cols-4">
                      <div>
                        <p className="text-xs font-semibold uppercase text-gray-400">
                          Status
                        </p>
                        <p className="mt-1 text-sm font-semibold text-gray-900">
                          {selectedProposalDetail?.status || "---"}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs font-semibold uppercase text-gray-400">
                          Solution
                        </p>
                        <p className="mt-1 text-sm font-semibold text-gray-900">
                          {selectedProposalDetail?.solution?.name || "---"}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs font-semibold uppercase text-gray-400">
                          Created By
                        </p>
                        <p className="mt-1 text-sm font-semibold text-gray-900">
                          {selectedProposalDetail?.createdByName || "---"}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs font-semibold uppercase text-gray-400">
                          Created Date
                        </p>
                        <p className="mt-1 text-sm font-semibold text-gray-900">
                          {selectedProposalDetail?.createDate
                            ? dayjs(selectedProposalDetail.createDate).format(
                                "YYYY-MM-DD",
                              )
                            : "---"}
                        </p>
                      </div>
                    </div>

                    <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
                      <div className="border-b border-gray-200 bg-gray-50 px-5 py-3">
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div>
                            <h3 className="text-base font-semibold text-gray-900">
                              Attached Brochures
                            </h3>

                            <p className="mt-1 text-xs text-gray-500">
                              Brochures fetched from menu, category, subcategory
                              and service mapping.
                            </p>
                          </div>

                          <span className="rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700">
                            {getAvailableBrochureCount(selectedProposalDetail)}{" "}
                            Found
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 gap-4 p-4 md:grid-cols-2 xl:grid-cols-4">
                        {selectedBrochures.map((item) => (
                          <ProposalBrochureCard
                            key={item.key}
                            title={item.title}
                            entityName={item.entityName}
                            brochure={item.brochure}
                          />
                        ))}
                      </div>
                    </div>

                    <HtmlPreviewBlock
                      title="Email Body"
                      subtitle="This HTML content is coming from proposal mail body."
                      html={selectedMailBody}
                      emptyText="No email body found for this proposal."
                    />

                    <ProposalPdfPreview
                      pdfUrl={selectedProposal}
                      pdfFileName={selectedProposalName}
                    />
                  </div>
                </div>
              </DrawerBody>
            </>
          )}
        </DrawerContent>
      </Drawer>

      <Modal
        isDismissable={false}
        isKeyboardDismissDisabled={true}
        isOpen={confirmApproveModal.isOpen}
        onOpenChange={(open) => {
          if (!open) {
            setConfirmApproveModal({
              isOpen: false,
              rowData: null,
            });
          }
        }}
        placement="top-center"
      >
        <ModalContent>
          {(onCloseModal) => (
            <>
              <ModalHeader>Confirm Approval</ModalHeader>

              <ModalBody>
                <p className="text-sm text-default-600">
                  This proposal is currently rejected. Are you sure you want to
                  approve it?
                </p>
              </ModalBody>

              <ModalFooter>
                <Button
                  variant="flat"
                  onPress={() => {
                    setConfirmApproveModal({
                      isOpen: false,
                      rowData: null,
                    });
                    onCloseModal();
                  }}
                >
                  Cancel
                </Button>

                <Button
                  color="primary"
                  onPress={handleConfirmRejectedToApproved}
                >
                  Yes, Approve
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      <Modal
        isDismissable={false}
        isKeyboardDismissDisabled={true}
        isOpen={discountActionModal.isOpen}
        onOpenChange={(open) => {
          if (!open) {
            setDiscountActionModal({
              isOpen: false,
              action: null,
              rowData: null,
              remarks: "",
            });
          }
        }}
        placement="top-center"
      >
        <ModalContent>
          {(onCloseModal) => (
            <>
              <ModalHeader>
                {discountActionModal.action === "APPROVE_DISCOUNT"
                  ? "Approve Discount"
                  : "Reject Discount"}
              </ModalHeader>

              <ModalBody>
                <div className="flex flex-col gap-4">
                  <p className="text-sm text-default-600">
                    {discountActionModal.action === "APPROVE_DISCOUNT"
                      ? "Are you sure you want to approve this discount?"
                      : "Are you sure you want to reject this discount?"}
                  </p>

                  <div className="rounded-lg border border-default-200 bg-default-50 p-3 text-xs text-default-600">
                    <p>
                      <span className="font-semibold">Proposal No:</span>{" "}
                      {discountActionModal?.rowData?.proposalNumber || "-"}
                    </p>

                    <p className="mt-1">
                      <span className="font-semibold">Service:</span>{" "}
                      {discountActionModal?.rowData?.solution?.name || "-"}
                    </p>

                    <p className="mt-1">
                      <span className="font-semibold">Created By:</span>{" "}
                      {discountActionModal?.rowData?.createdByName || "-"}
                    </p>
                  </div>

                  {discountActionModal.action === "REJECT_DISCOUNT" ? (
                    <Input
                      label="Remarks"
                      isRequired
                      value={discountActionModal.remarks}
                      onChange={(e) =>
                        setDiscountActionModal((prev) => ({
                          ...prev,
                          remarks: e.target.value,
                        }))
                      }
                      placeholder="Enter rejection remarks"
                    />
                  ) : null}
                </div>
              </ModalBody>

              <ModalFooter>
                <Button
                  variant="flat"
                  onPress={() => {
                    setDiscountActionModal({
                      isOpen: false,
                      action: null,
                      rowData: null,
                      remarks: "",
                    });
                    onCloseModal();
                  }}
                >
                  No, Cancel
                </Button>

                <Button
                  color={
                    discountActionModal.action === "APPROVE_DISCOUNT"
                      ? "primary"
                      : "danger"
                  }
                  isLoading={loading === "pending"}
                  onPress={handleDiscountActionSubmit}
                >
                  {discountActionModal.action === "APPROVE_DISCOUNT"
                    ? "Yes, Approve"
                    : "Yes, Reject"}
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
};

export default AllProposal;
