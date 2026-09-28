import {
  Button,
  Chip,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
  Input,
  Pagination,
  Spinner,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
} from "@heroui/react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { ChevronDown, Search } from "lucide-react";
import { Link, useLocation, useParams } from "react-router-dom";
import dayjs from "dayjs";
import { getSubDepartmentCompanies } from "../../toolkit/slices/settingSlice";

// Matches the rows of
// GET /company-assignments/sub-departments/{subDepartmentId}/companies.
const columns = [
  { name: "COMPANY", uid: "companyName" },
  { name: "SUB DEPARTMENT HEAD", uid: "subDepartmentHeadUserName" },
  { name: "ASSIGNED TO", uid: "assignedUserName" },
  { name: "WORK FUNCTION", uid: "workFunction" },
  { name: "ALLOCATED BY", uid: "allocatedByUserName" },
  { name: "DELEGATED BY", uid: "delegatedByUserName" },
  { name: "LAST CHANGE REASON", uid: "lastChangeReason" },
  { name: "STATUS", uid: "active" },
];

const STATUS_FILTER_OPTIONS = [
  { label: "ALL", value: "" },
  { label: "ACTIVE", value: "true" },
  { label: "INACTIVE", value: "false" },
];

const formatDateTime = (value) =>
  value ? dayjs(value).format("DD-MM-YYYY, hh:mm a") : "";

const SubDepartmentCompanies = () => {
  const dispatch = useDispatch();
  const { subDepartmentId } = useParams();
  const location = useLocation();

  const currentUser = useSelector((state) => state.auth.currentUser);
  const currentUserId = currentUser?.id || currentUser?.userId;

  const subDepartmentCompaniesList = useSelector(
    (state) => state.setting.subDepartmentCompaniesList,
  );
  const isLoading =
    useSelector((state) => state.setting.subDepartmentCompaniesLoading) ===
    "pending";

  const subDepartmentName =
    location?.state?.subDepartmentName ||
    subDepartmentCompaniesList?.[0]?.subDepartmentName;

  const [filterValue, setFilterValue] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [filteration, setFilteration] = useState({ page: 1, size: 50 });

  useEffect(() => {
    if (subDepartmentId && currentUserId) {
      dispatch(
        getSubDepartmentCompanies({
          subDepartmentId,
          requestingUserId: currentUserId,
        }),
      );
    }
  }, [dispatch, subDepartmentId, currentUserId]);

  // The endpoint has no search/page params, so filter and page client-side.
  const filteredItems = useMemo(() => {
    let filtered = [...(subDepartmentCompaniesList || [])];

    if (filterValue) {
      const needle = filterValue.toLowerCase();
      filtered = filtered.filter((item) =>
        Object.values(item || {}).some((val) => {
          if (val === null || typeof val === "object") return false;
          return String(val).toLowerCase().includes(needle);
        }),
      );
    }

    if (statusFilter !== "") {
      const wantActive = statusFilter === "true";
      filtered = filtered.filter(
        (item) => Boolean(item?.active) === wantActive,
      );
    }

    return filtered;
  }, [subDepartmentCompaniesList, filterValue, statusFilter]);

  const count = filteredItems.length;
  const pages = Math.ceil(count / filteration.size) || 1;

  const pagedItems = useMemo(() => {
    const start = (filteration.page - 1) * filteration.size;
    return filteredItems.slice(start, start + filteration.size);
  }, [filteredItems, filteration]);

  const renderCell = useCallback((item, columnKey) => {
    switch (columnKey) {
      case "companyName":
        return <span className="font-medium">{item?.companyName || "-"}</span>;

      case "assignedUserName":
        return (
          <div className="flex flex-col">
            <span>{item?.assignedUserName || "-"}</span>
            <span className="text-xs text-default-400">
              {item?.assignedUserEmail || ""}
            </span>
          </div>
        );

      case "allocatedByUserName":
        return (
          <div className="flex flex-col">
            <span>{item?.allocatedByUserName || "-"}</span>
            <span className="text-xs text-default-400">
              {formatDateTime(item?.allocatedAt)}
            </span>
          </div>
        );

      case "delegatedByUserName":
        return (
          <div className="flex flex-col">
            <span>{item?.delegatedByUserName || "-"}</span>
            <span className="text-xs text-default-400">
              {formatDateTime(item?.delegatedAt)}
            </span>
          </div>
        );

      case "active":
        return (
          <Chip
            size="sm"
            variant="flat"
            color={item?.active ? "success" : "default"}
          >
            {item?.active ? "Active" : "Inactive"}
          </Chip>
        );

      default:
        return <span>{item?.[columnKey] || "-"}</span>;
    }
  }, []);

  const topContent = (
    <div className="flex flex-col gap-2">
      <div className="flex justify-between gap-2 items-center flex-wrap">
        <Input
          isClearable
          size="sm"
          className="w-full sm:max-w-[280px]"
          classNames={{ inputWrapper: "h-8 min-h-8" }}
          placeholder="Search companies..."
          startContent={<Search className="w-4 h-4 text-default-400" />}
          value={filterValue}
          onClear={() => {
            setFilterValue("");
            setFilteration((prev) => ({ ...prev, page: 1 }));
          }}
          onValueChange={(value) => {
            setFilterValue(value || "");
            setFilteration((prev) => ({ ...prev, page: 1 }));
          }}
        />

        <Dropdown>
          <DropdownTrigger>
            <Button
              size="sm"
              variant="flat"
              endContent={<ChevronDown className="w-3.5 h-3.5" />}
            >
              {STATUS_FILTER_OPTIONS.find(
                (option) => option.value === statusFilter,
              )?.label || "ALL"}
            </Button>
          </DropdownTrigger>
          <DropdownMenu
            disallowEmptySelection
            aria-label="Status filter"
            selectedKeys={[statusFilter || "__all__"]}
            selectionMode="single"
            onSelectionChange={(e) => {
              const key = Array.from(e)[0];
              setStatusFilter(key === "__all__" ? "" : key);
              setFilteration((prev) => ({ ...prev, page: 1 }));
            }}
          >
            {STATUS_FILTER_OPTIONS.map((option) => (
              <DropdownItem key={option.value || "__all__"}>
                {option.label}
              </DropdownItem>
            ))}
          </DropdownMenu>
        </Dropdown>
      </div>

      <div className="flex justify-between items-center">
        <span className="text-default-400 text-[12.5px]">
          Total {count} companies
        </span>

        <label className="flex items-center gap-1 text-default-400 text-[12.5px]">
          Rows per page:
          <select
            className="bg-transparent outline-hidden text-default-400 text-[12.5px] cursor-pointer"
            onChange={(e) =>
              setFilteration({ size: Number(e.target.value), page: 1 })
            }
            value={filteration.size}
          >
            <option value="10">10</option>
            <option value="25">25</option>
            <option value="50">50</option>
            <option value="100">100</option>
          </select>
        </label>
      </div>
    </div>
  );

  const bottomContent = (
    <div className="py-1.5 px-1 flex justify-between items-center">
      <span className="w-[30%] text-[12.5px] text-default-400">
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

      <div className="hidden sm:flex w-[30%] justify-end gap-2">
        <Button
          isDisabled={filteration.page <= 1}
          size="sm"
          variant="flat"
          onPress={() =>
            setFilteration((prev) => ({ ...prev, page: prev.page - 1 }))
          }
        >
          Previous
        </Button>
        <Button
          isDisabled={filteration.page >= pages}
          size="sm"
          variant="flat"
          onPress={() =>
            setFilteration((prev) => ({ ...prev, page: prev.page + 1 }))
          }
        >
          Next
        </Button>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-1.5 text-[12.5px] text-default-400">
        <Link className="hover:underline" to="../../../.." relative="path">
          Departments
        </Link>
        <span>/</span>
        <Link className="hover:underline" to="../.." relative="path">
          Sub departments
        </Link>
        <span>/</span>
        <span className="text-default-600">
          {subDepartmentName || "Companies"}
        </span>
      </div>

      <h1 className="font-sans text-lg font-semibold mb-2 shrink-0">
        Mapped companies
      </h1>

      <Table
        isHeaderSticky
        removeWrapper={false}
        aria-label="Sub department companies table"
        topContent={topContent}
        topContentPlacement="outside"
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
      >
        <TableHeader columns={columns}>
          {(column) => (
            <TableColumn key={column.uid}>{column.name}</TableColumn>
          )}
        </TableHeader>

        <TableBody
          isLoading={isLoading}
          loadingContent={<Spinner size="sm" label="Loading companies..." />}
          emptyContent={
            isLoading ? " " : "No companies mapped to this sub department."
          }
          items={pagedItems}
        >
          {(item) => (
            <TableRow key={item?.assignmentId ?? item?.companyId}>
              {(columnKey) => (
                <TableCell>{renderCell(item, columnKey)}</TableCell>
              )}
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default SubDepartmentCompanies;
