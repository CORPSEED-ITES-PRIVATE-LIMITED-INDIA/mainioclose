import {
  addToast,
  Avatar,
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
} from "@heroui/react";
import { EllipsisVertical, Phone, Search } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import {
  activeUserByAdmin,
  getAllDeactivateUserList,
} from "../toolkit/slices/commonSlice";
import { activateUserByAdminInAuth } from "../toolkit/slices/authSlice";
import NewSelect from "../components/NewSelect";

const columns = [
  { name: "ID", uid: "id" },
  { name: "USER NAME", uid: "userName", sortable: true },
  { name: "EMAIL", uid: "email" },
  { name: "DEPARTMENT", uid: "department" },
  { name: "ROLE", uid: "role" },
  { name: "EXPERIENCE", uid: "experience" },
  { name: "MANAGER", uid: "managers" },
  { name: "PERMANENT ADDRESS", uid: "permanentAddress" },
  { name: "RESIDENTIAL ADDRESS", uid: "residentialAddress" },
  { name: "FATHER INFO", uid: "fatherInfo" },
  { name: "MOTHER INFO", uid: "motherInfo" },
  { name: "SPOUSE INFO", uid: "spouseInfo" },
  { name: "LOCKER SIZE", uid: "lockerSize" },
  { name: "BACKUP TEAM", uid: "backupTeam" },
  { name: "ACTIONS", uid: "actions" },
];

const INITIAL_VISIBLE_COLUMNS = [
  "id",
  "userName",
  "email",
  "department",
  "role",
  "experience",
  "managers",
  "residentialAddress",
  "fatherInfo",
  "actions",
];

const DeactiveUserList = () => {
  const { userId } = useParams();
  const dispatch = useDispatch();
  const count = useSelector(
    (state) => state.common.deactiveUserList?.length || 0,
  );
  const data = useSelector((state) => state.common.deactiveUserList);
  const [filterValue, setFilterValue] = useState("");
  const [visibleColumns, setVisibleColumns] = useState(
    new Set(INITIAL_VISIBLE_COLUMNS),
  );
  const [sortDescriptor, setSortDescriptor] = useState({
    column: "age",
    direction: "ascending",
  });
  const [filteration, setFilteration] = useState({
    page: 1,
    size: 50,
  });

  const hasSearchFilter = Boolean(filterValue);

  useEffect(() => {
    dispatch(getAllDeactivateUserList());
  }, [dispatch]);

  const headerColumns = useMemo(() => {
    if (visibleColumns === "all") return columns;
    return columns.filter((column) =>
      Array.from(visibleColumns).includes(column.uid),
    );
  }, [visibleColumns]);

  const filteredItems = useMemo(() => {
    let filteredUsers = [...(data || [])];
    if (hasSearchFilter) {
      const search = filterValue.toLowerCase();

      filteredUsers = filteredUsers.filter((item) => {
        const searchableValues = [
          item?.fullName,
          item?.email,
          item?.contactNo,
          item?.department,
          item?.designation,
          item?.role?.join?.(","),
        ];

        return searchableValues
          .filter((value) => value !== null && value !== undefined)
          .some((value) => String(value).toLowerCase().includes(search));
      });
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

  const handleActionStatus = (currentUserId) => {
    dispatch(activateUserByAdminInAuth(currentUserId))
      .then((resp) => {
        if (resp.meta.requestStatus === "fulfilled") {
          dispatch(activeUserByAdmin(currentUserId));
          addToast({
            title: `User activated successfully !.`,
            color: "success",
          });
          dispatch(getAllDeactivateUserList());
        } else {
          addToast({ title: "Something went wrong!.", color: "danger" });
        }
      })
      .catch(() =>
        addToast({ title: "Something went wrong!.", color: "danger" }),
      );
  };

  const renderCell = useCallback((rowData, columnKey) => {
    switch (columnKey) {
      case "userName":
        return (
          <div className="flex items-start gap-2">
            <Avatar size="sm" classNames={{ icon: "text-gray-500" }} />
            <div className="flex flex-col">
              <p className="font-normal capitalize">
                {rowData?.fullName || "-"}
              </p>
              <p className="font-normal text-xs text-gray-400">
                Aadhar : {rowData?.aadharCard || "-"}
              </p>
            </div>
          </div>
        );
      case "email":
        return (
          <div className="flex flex-col">
            <span className="font-normal">{rowData?.email || "Unknown"}</span>
            {rowData?.contactNo && (
              <Chip
                size="sm"
                className="text-tiny"
                variant="flat"
                startContent={<Phone className="h-3 w-3" />}
              >
                {rowData?.contactNo}
              </Chip>
            )}
            {rowData?.panNumber && (
              <Chip size="sm" className="text-tiny" variant="flat">
                Pan : {rowData?.panNumber}
              </Chip>
            )}
          </div>
        );
      case "department":
        return (
          <div className="flex flex-col">
            <span className="font-normal">{rowData?.department || "-"}</span>
            <p className="font-normal text-xs text-gray-400">
              {rowData?.designation || "-"}
            </p>
          </div>
        );
      case "role":
        return (
          <div className="flex flex-col">
            <span className="font-normal">
              {rowData?.role?.join(",") || "-"}
            </span>
          </div>
        );
      case "experience":
        return (
          <div className="flex flex-col">
            {rowData?.expInYear && (
              <span className="font-normal">
                {rowData?.expInYear || "-"} yrs ,{" "}
              </span>
            )}
            {rowData?.expInMonth && (
              <span className="font-normal">
                {rowData?.expInMonth || "-"} mos
              </span>
            )}
          </div>
        );
      case "managers":
        return (
          <div className="flex items-center">
            <span className="font-normal">
              {rowData?.managers?.fullName || "-"}
            </span>
          </div>
        );
      case "permanentAddress":
        return rowData?.permanentAddress ? (
          <div className="flex flex-col">
            <span className="font-normal">
              {rowData?.permanentAddress || "-"}
            </span>
          </div>
        ) : (
          "-"
        );
      case "residentialAddress":
        return rowData?.residentialAddress ? (
          <div className="flex flex-col">
            <span className="font-normal">
              {rowData?.residentialAddress || "-"}
            </span>
          </div>
        ) : (
          "-"
        );
      case "fatherInfo":
        return rowData?.fatherName ? (
          <div className="flex flex-col">
            <span className="font-normal">{rowData?.fatherName || "-"}</span>
            <div className="flex flex-col gap-1">
              <span className="text-gray-400">
                Occupation : {rowData?.fatherOccupation || "-"}
              </span>
              <span className="text-gray-400">
                Contact : {rowData?.fatherContactNo || "-"}
              </span>
            </div>
          </div>
        ) : (
          "-"
        );
      case "motherInfo":
        return rowData?.motherName ? (
          <div className="flex flex-col">
            <span className="font-normal">{rowData?.motherName || "-"}</span>
            <div className="flex flex-col gap-1">
              <span className="text-gray-400">
                Occupation : {rowData?.motherOccupation || "-"}
              </span>
              <span className="text-gray-400">
                Contact : {rowData?.motherContactNo || "-"}
              </span>
            </div>
          </div>
        ) : (
          "-"
        );
      case "spouseInfo":
        return rowData?.spouseName ? (
          <div className="flex flex-col">
            <span className="font-normal">{rowData?.spouseName || "-"}</span>
            <div className="flex flex-col gap-1">
              <span className="text-gray-400">
                Occupation : {rowData?.spouseOccupation || "-"}
              </span>
              <span className="text-gray-400">
                Contact : {rowData?.spouseContactNo || "-"}
              </span>
            </div>
          </div>
        ) : (
          "-"
        );
      case "actions":
        return (
          <Dropdown>
            <DropdownTrigger>
              <Button size="sm" isIconOnly variant="light">
                <EllipsisVertical />
              </Button>
            </DropdownTrigger>
            <DropdownMenu>
              <DropdownItem onPress={() => handleActionStatus(rowData?.id)}>
                Activate
              </DropdownItem>
            </DropdownMenu>
          </Dropdown>
        );
      default:
        return rowData[columnKey] || "-";
    }
  }, []);

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
      <div className="flex flex-col gap-2">
        <div className="flex justify-between gap-2 items-center flex-wrap">
          <Input
            isClearable
            size="sm"
            className="w-full sm:max-w-[280px]"
            classNames={{ inputWrapper: "h-8 min-h-8" }}
            placeholder="Search deactivated users..."
            startContent={<Search className="w-4 h-4 text-default-400" />}
            value={filterValue}
            onClear={() => onClear()}
            onValueChange={onSearchChange}
          />

          <div className="flex gap-1.5 flex-wrap">
            <div className="w-[160px]">
              <NewSelect
                size="sm"
                isSearchable={false}
                data={columns}
                selectionMode="multiple"
                labelKey="name"
                valueKey="uid"
                label="Columns"
                placeholder="Columns"
                value={Array.from(visibleColumns)}
                onChange={(values) => {
                  if (values.length > 0) {
                    setVisibleColumns(new Set(values));
                  }
                }}
              />
            </div>
          </div>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-default-400 text-[12.5px]">
            Total {count} deactive users
          </span>

          <label className="flex items-center gap-1 text-default-400 text-[12.5px]">
            Rows per page:
            <select
              className="bg-transparent outline-hidden text-default-400 text-[12.5px] cursor-pointer"
              onChange={onRowsPerPageChange}
              value={filteration?.size}
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
  }, [filterValue, visibleColumns, onRowsPerPageChange, count, onSearchChange, filteration?.size]);

  const bottomContent = useMemo(() => {
    return (
      <div className="py-1.5 px-1 flex justify-between items-center">
        <span className="w-[30%] text-[12.5px] text-default-400">
          Page {filteration?.page} of {pages}
        </span>

        <Pagination
          isCompact
          showControls
          color="primary"
          page={filteration?.page}
          total={pages}
          onChange={(e) => {
            setFilteration((prev) => ({ ...prev, page: e }));
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
  }, [filteration, pages, onPreviousPage, onNextPage]);

  return (
    <div className="flex flex-col gap-2">
      <h1 className="font-sans text-lg font-semibold mb-2 shrink-0">
        Deactive User List
      </h1>

      <Table
        isHeaderSticky
        removeWrapper={false}
        aria-label="Deactivated users table"
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
        sortDescriptor={sortDescriptor}
        topContent={topContent}
        topContentPlacement="outside"
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
        <TableBody emptyContent={"No data found"} items={sortedItems}>
          {(item) => (
            <TableRow key={item.id || item.companyId}>
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

export default DeactiveUserList;
