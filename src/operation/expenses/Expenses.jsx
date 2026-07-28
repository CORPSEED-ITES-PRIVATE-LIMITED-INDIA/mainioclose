import {
  addToast,
  Button,
  Chip,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
  Input,
  Pagination,
  Select,
  SelectItem,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
} from "@heroui/react";

import { ChevronDown, ExternalLink, RefreshCcw, Search } from "lucide-react";

import dayjs from "dayjs";
import React, { useCallback, useEffect, useMemo, useState } from "react";

import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";

import { getExpenseApprovalQueueList } from "../../toolkit/slices/operationSlice";

const columns = [
  {
    name: "PROJECT",
    uid: "project",
  },
  {
    name: "EXPENSE CATEGORY",
    uid: "expenseCategory",
  },
  {
    name: "AMOUNT",
    uid: "amount",
  },
  {
    name: "DEPARTMENT",
    uid: "department",
  },
  {
    name: "CREATED BY",
    uid: "createdBy",
  },
  {
    name: "EXPENSE DATE",
    uid: "expenseDate",
  },
  {
    name: "APPROVAL STAGE",
    uid: "approvalStage",
  },
  {
    name: "APPROVAL STATUS",
    uid: "approvalStatus",
  },
  {
    name: "REFERENCE",
    uid: "externalReference",
  },
  {
    name: "PAYMENT PROOF",
    uid: "attachment",
  },
];

const INITIAL_VISIBLE_COLUMNS = [
  "project",
  "expenseCategory",
  "amount",
  "department",
  "createdBy",
  "expenseDate",
  "approvalStage",
  "approvalStatus",
  "externalReference",
  "attachment",
];

const approvalStageOptions = [
  {
    label: "CRT Review",
    value: "CRT_REVIEW",
  },
  {
    label: "Accounts Review",
    value: "ACCOUNTS_REVIEW",
  },
  {
    label: "Completed",
    value: "COMPLETED",
  },
];

const approvalStatusOptions = [
  {
    label: "All Statuses",
    value: "ALL",
  },
  {
    label: "Pending",
    value: "PENDING",
  },
  {
    label: "Approved",
    value: "APPROVED",
  },
  {
    label: "Rejected",
    value: "REJECTED",
  },
  {
    label: "On Hold",
    value: "ON_HOLD",
  },
  {
    label: "Cancelled",
    value: "CANCELLED",
  },
];

const formatText = (value) => {
  if (!value) {
    return "-";
  }

  return String(value)
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(/\b\w/g, (character) => character.toUpperCase());
};

const formatDate = (value) => {
  if (!value) {
    return "-";
  }

  const date = dayjs(value);

  if (!date.isValid()) {
    return "-";
  }

  return date.format("DD-MM-YYYY");
};

const formatDateTime = (value) => {
  if (!value) {
    return "-";
  }

  const date = dayjs(value);

  if (!date.isValid()) {
    return "-";
  }

  return date.format("DD-MM-YYYY hh:mm A");
};

const formatCurrency = (amount, currencyCode = "INR") => {
  const numericAmount = Number(amount);

  if (Number.isNaN(numericAmount)) {
    return "-";
  }

  try {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: currencyCode || "INR",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(numericAmount);
  } catch {
    return `${currencyCode || "INR"} ${numericAmount.toFixed(2)}`;
  }
};

const getStatusColor = (status) => {
  switch (status) {
    case "APPROVED":
      return "success";

    case "REJECTED":
    case "CANCELLED":
      return "danger";

    case "PENDING":
      return "warning";

    case "ON_HOLD":
      return "secondary";

    default:
      return "default";
  }
};

const getStageColor = (stage) => {
  switch (stage) {
    case "CRT_REVIEW":
      return "primary";

    case "ACCOUNTS_REVIEW":
      return "secondary";

    case "COMPLETED":
      return "success";

    default:
      return "default";
  }
};

const Expenses = () => {
  const dispatch = useDispatch();
  const { userId } = useParams();

  const currentUser = useSelector((state) => state.auth.currentUser);

  const expenseApprovalQueueList = useSelector(
    (state) => state.operation.expenseApprovalQueueList,
  );

  const expenseApprovalQueueLoading = useSelector(
    (state) => state.operation.expenseApprovalQueueLoading,
  );

  const expenseApprovalQueueError = useSelector(
    (state) => state.operation.expenseApprovalQueueError,
  );

  const resolvedUserId = Number(
    userId || currentUser?.id || currentUser?.userId || currentUser?.employeeId,
  );

  const [searchValue, setSearchValue] = useState("");

  const [approvalStage, setApprovalStage] = useState("CRT_REVIEW");

  const [approvalStatus, setApprovalStatus] = useState("PENDING");

  const [visibleColumns, setVisibleColumns] = useState(
    new Set(INITIAL_VISIBLE_COLUMNS),
  );

  const [pagination, setPagination] = useState({
    page: 1,
    size: 10,
  });

  const fetchExpenseApprovalQueue = useCallback(() => {
    if (!resolvedUserId) {
      addToast({
        title: "User not found",
        description: "User ID is required to load expenses.",
        color: "danger",
      });

      return;
    }

    dispatch(
      getExpenseApprovalQueueList({
        userId: resolvedUserId,
        approvalStage,
        approvalStatus,
      }),
    ).then((response) => {
      if (response.meta.requestStatus === "rejected") {
        addToast({
          title: "Failed to load expenses",
          description:
            response?.payload?.message ||
            response?.payload ||
            "Failed to fetch expense approval queue.",
          color: "danger",
        });
      }
    });
  }, [dispatch, resolvedUserId, approvalStage, approvalStatus]);

  useEffect(() => {
    fetchExpenseApprovalQueue();
  }, [fetchExpenseApprovalQueue]);

  const expenseRows = useMemo(() => {
    return Array.isArray(expenseApprovalQueueList)
      ? expenseApprovalQueueList
      : [];
  }, [expenseApprovalQueueList]);

  const headerColumns = useMemo(() => {
    if (visibleColumns === "all") {
      return columns;
    }

    return columns.filter((column) =>
      Array.from(visibleColumns).includes(column.uid),
    );
  }, [visibleColumns]);

  const filteredItems = useMemo(() => {
    if (!searchValue.trim()) {
      return expenseRows;
    }

    const search = searchValue.trim().toLowerCase();

    return expenseRows.filter((item) => {
      const searchableValues = [
        item?.id,
        item?.expenseId,

        item?.projectId,
        item?.projectName,
        item?.projectNo,
        item?.projectNumber,
        item?.project?.name,
        item?.project?.projectName,
        item?.project?.projectNo,

        item?.expenseCategory,
        item?.category,

        item?.amount,
        item?.currencyCode,

        item?.departmentName,
        item?.department?.name,

        item?.createdByUserName,
        item?.createdByName,
        item?.createdBy?.fullName,

        item?.remark,
        item?.externalReference,

        item?.approvalStage,
        item?.approvalStatus,
        item?.status,
      ];

      return searchableValues
        .filter(
          (value) => value !== null && value !== undefined && value !== "",
        )
        .some((value) => String(value).toLowerCase().includes(search));
    });
  }, [expenseRows, searchValue]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredItems.length / pagination.size),
  );

  useEffect(() => {
    setPagination((previous) => ({
      ...previous,
      page: Math.min(previous.page, totalPages),
    }));
  }, [totalPages]);

  const paginatedItems = useMemo(() => {
    const startIndex = (pagination.page - 1) * pagination.size;

    const endIndex = startIndex + pagination.size;

    return filteredItems.slice(startIndex, endIndex);
  }, [filteredItems, pagination.page, pagination.size]);

  const renderCell = useCallback((expense, columnKey) => {
    const projectName =
      expense?.projectName ||
      expense?.project?.projectName ||
      expense?.project?.name;

    const projectNumber =
      expense?.projectNo ||
      expense?.projectNumber ||
      expense?.project?.projectNo ||
      expense?.project?.projectNumber;

    const expenseCategory = expense?.expenseCategory || expense?.category;

    const departmentName = expense?.departmentName || expense?.department?.name;

    const createdByName =
      expense?.createdByUserName ||
      expense?.createdByName ||
      expense?.createdBy?.fullName;

    const approvalStageValue = expense?.approvalStage || expense?.stage;

    const approvalStatusValue = expense?.approvalStatus || expense?.status;

    const attachmentUrl =
      expense?.attachmentUrl ||
      expense?.paymentProofUrl ||
      expense?.documentUrl;

    switch (columnKey) {
      case "project":
        return (
          <div className="flex max-w-[230px] flex-col">
            <span className="truncate text-sm font-semibold text-foreground">
              {projectName || "-"}
            </span>

            <span className="text-xs text-default-500">
              {projectNumber
                ? `Project No: ${projectNumber}`
                : `Project ID: ${expense?.projectId || "-"}`}
            </span>
          </div>
        );

      case "expenseCategory":
        return (
          <Chip size="sm" variant="flat">
            {formatText(expenseCategory)}
          </Chip>
        );

      case "amount":
        return (
          <span className="whitespace-nowrap font-semibold text-foreground">
            {formatCurrency(expense?.amount, expense?.currencyCode)}
          </span>
        );

      case "department":
        return (
          <div className="flex flex-col">
            <span className="text-sm font-medium">{departmentName || "-"}</span>

            {expense?.departmentId && (
              <span className="text-xs text-default-500">
                ID: {expense.departmentId}
              </span>
            )}
          </div>
        );

      case "createdBy":
        return (
          <div className="flex flex-col">
            <span className="text-sm font-medium">{createdByName || "-"}</span>

            {expense?.createdByUserId && (
              <span className="text-xs text-default-500">
                User ID: {expense.createdByUserId}
              </span>
            )}
          </div>
        );

      case "expenseDate":
        return (
          <div className="flex flex-col">
            <span className="text-sm">{formatDate(expense?.expenseDate)}</span>

            {expense?.createdAt && (
              <span className="text-xs text-default-500">
                Created: {formatDateTime(expense.createdAt)}
              </span>
            )}
          </div>
        );

      case "approvalStage":
        return (
          <Chip
            size="sm"
            variant="flat"
            color={getStageColor(approvalStageValue)}
          >
            {formatText(approvalStageValue)}
          </Chip>
        );

      case "approvalStatus":
        return (
          <Chip
            size="sm"
            variant="flat"
            color={getStatusColor(approvalStatusValue)}
          >
            {formatText(approvalStatusValue)}
          </Chip>
        );

      case "externalReference":
        return (
          <div className="flex max-w-[200px] flex-col">
            <span
              className="truncate text-sm"
              title={expense?.externalReference || "-"}
            >
              {expense?.externalReference || "-"}
            </span>

            {expense?.remark && (
              <span
                className="truncate text-xs text-default-500"
                title={expense.remark}
              >
                {expense.remark}
              </span>
            )}
          </div>
        );

      case "attachment":
        if (!attachmentUrl) {
          return "-";
        }

        return (
          <Button
            as="a"
            href={attachmentUrl}
            target="_blank"
            rel="noopener noreferrer"
            size="sm"
            variant="flat"
            color="primary"
            startContent={<ExternalLink className="h-4 w-4" />}
          >
            View
          </Button>
        );

      default:
        return expense?.[columnKey] || "-";
    }
  }, []);

  const topContent = useMemo(() => {
    return (
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-3 xl:flex-row xl:items-end xl:justify-between">
          <Input
            isClearable
            className="w-full max-w-[320px]"
            placeholder="Search expenses..."
            startContent={<Search className="h-4 w-4" />}
            value={searchValue}
            onClear={() => {
              setSearchValue("");
              setPagination((previous) => ({
                ...previous,
                page: 1,
              }));
            }}
            onValueChange={(value) => {
              setSearchValue(value || "");

              setPagination((previous) => ({
                ...previous,
                page: 1,
              }));
            }}
          />

          <div className="grid w-full grid-cols-1 gap-3 sm:grid-cols-2 xl:w-auto xl:grid-cols-[200px_200px_auto_auto]">
            <Select
              label="Approval Stage"
              selectedKeys={
                approvalStage ? new Set([approvalStage]) : new Set([])
              }
              onSelectionChange={(keys) => {
                const selectedValue = Array.from(keys)[0];

                if (selectedValue) {
                  setApprovalStage(String(selectedValue));

                  setPagination((previous) => ({
                    ...previous,
                    page: 1,
                  }));
                }
              }}
            >
              {approvalStageOptions.map((option) => (
                <SelectItem key={option.value} textValue={option.label}>
                  {option.label}
                </SelectItem>
              ))}
            </Select>

            <Select
              label="Approval Status"
              selectedKeys={
                approvalStatus ? new Set([approvalStatus]) : new Set([])
              }
              onSelectionChange={(keys) => {
                const selectedValue = Array.from(keys)[0];

                if (selectedValue) {
                  setApprovalStatus(String(selectedValue));

                  setPagination((previous) => ({
                    ...previous,
                    page: 1,
                  }));
                }
              }}
            >
              {approvalStatusOptions.map((option) => (
                <SelectItem key={option.value} textValue={option.label}>
                  {option.label}
                </SelectItem>
              ))}
            </Select>

            <Button
              color="primary"
              variant="flat"
              isLoading={expenseApprovalQueueLoading}
              startContent={
                !expenseApprovalQueueLoading && (
                  <RefreshCcw className="h-4 w-4" />
                )
              }
              onPress={fetchExpenseApprovalQueue}
            >
              Refresh
            </Button>

            <Dropdown>
              <DropdownTrigger>
                <Button
                  variant="flat"
                  endContent={<ChevronDown className="h-4 w-4" />}
                >
                  Columns
                </Button>
              </DropdownTrigger>

              <DropdownMenu
                disallowEmptySelection
                aria-label="Visible columns"
                closeOnSelect={false}
                selectedKeys={visibleColumns}
                selectionMode="multiple"
                onSelectionChange={setVisibleColumns}
              >
                {columns.map((column) => (
                  <DropdownItem key={column.uid}>{column.name}</DropdownItem>
                ))}
              </DropdownMenu>
            </Dropdown>
          </div>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <span className="text-small text-default-500">
            Total {filteredItems.length} expenses
          </span>

          <label className="flex items-center gap-2 text-small text-default-500">
            Rows per page:
            <select
              className="rounded-md border border-default-200 bg-transparent px-2 py-1 text-small outline-none"
              value={pagination.size}
              onChange={(event) => {
                setPagination({
                  page: 1,
                  size: Number(event.target.value),
                });
              }}
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
    searchValue,
    approvalStage,
    approvalStatus,
    visibleColumns,
    pagination.size,
    filteredItems.length,
    expenseApprovalQueueLoading,
    fetchExpenseApprovalQueue,
  ]);

  const bottomContent = useMemo(() => {
    return (
      <div className="flex items-center justify-between px-2 py-2">
        <span className="text-small text-default-500">
          Page {pagination.page} of {totalPages}
        </span>

        <Pagination
          isCompact
          showControls
          color="primary"
          page={pagination.page}
          total={totalPages}
          onChange={(page) => {
            setPagination((previous) => ({
              ...previous,
              page,
            }));
          }}
        />
      </div>
    );
  }, [pagination.page, totalPages]);

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="font-sans text-2xl font-medium">
          Expense Approval Queue
        </h1>

        <p className="mt-1 text-sm text-default-500">
          Review expenses based on approval stage and status.
        </p>
      </div>

      <Table
        isHeaderSticky
        aria-label="Expense approval queue table"
        topContent={topContent}
        topContentPlacement="outside"
        bottomContent={bottomContent}
        bottomContentPlacement="outside"
        classNames={{
          wrapper: "w-full md:max-h-[60vh] 2xl:max-h-[65vh]",
          table: "w-full",
        }}
      >
        <TableHeader columns={headerColumns}>
          {(column) => (
            <TableColumn key={column.uid}>{column.name}</TableColumn>
          )}
        </TableHeader>

        <TableBody
          isLoading={expenseApprovalQueueLoading}
          emptyContent={
            expenseApprovalQueueLoading
              ? "Loading expenses..."
              : expenseApprovalQueueError || "No expenses found"
          }
          items={paginatedItems}
        >
          {(expense) => (
            <TableRow
              key={
                expense?.id ||
                expense?.expenseId ||
                `${expense?.projectId}-${expense?.externalReference}`
              }
            >
              {(columnKey) => (
                <TableCell>{renderCell(expense, columnKey)}</TableCell>
              )}
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default Expenses;
