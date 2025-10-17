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
import { ChevronDown, EllipsisVertical, Phone, Search } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import {
  approvedAndDisapprovedUserByManager,
  approvedUserByHr,
  getUserApprovalList,
} from "../toolkit/slices/commonSlice";

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

function capitalize(s) {
  return s ? s.charAt(0).toUpperCase() + s.slice(1).toLowerCase() : "";
}

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

const UserApprovals = () => {
  const { userId } = useParams();
  const dispatch = useDispatch();
  const count = useSelector(
    (state) => state.common.approvalUserList?.length || 0
  );
  const data = useSelector((state) => state.common.approvalUserList);
  const [filterValue, setFilterValue] = useState("");
  const [selectedKeys, setSelectedKeys] = useState(new Set([]));
  const [visibleColumns, setVisibleColumns] = useState(
    new Set(INITIAL_VISIBLE_COLUMNS)
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
    dispatch(getUserApprovalList({ userId }));
  }, [dispatch, userId]);

  const headerColumns = useMemo(() => {
    if (visibleColumns === "all") return columns;
    return columns.filter((column) =>
      Array.from(visibleColumns).includes(column.uid)
    );
  }, [visibleColumns]);

  const filteredItems = useMemo(() => {
    let filteredUsers = [...data];
    if (hasSearchFilter) {
      filteredUsers = filteredUsers.filter((item) =>
        item?.fullName?.toLowerCase().includes(filterValue.toLowerCase())
      );
    }
    return filteredUsers;
  }, [data, filterValue]);

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
    dispatch(
      approvedUserByHr({ userId:currentUserId, currentUserId:userId })
    )
      .then((resp) => {
        if (resp.meta.requestStatus === "fulfilled") {
          addToast({
            title: `User approved successfully !.`,
            color: "success",
          });
          dispatch(getUserApprovalList({ userId }));
        } else {
          addToast({ title: "Something went wrong!.", color: "danger" });
        }
      })
      .catch(() =>
        addToast({ title: "Something went wrong!.", color: "danger" })
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
              <DropdownItem
                onPress={() => handleActionStatus(rowData?.id)}
              >
                Approved
              </DropdownItem>
              {/* <DropdownItem
                onPress={() => handleActionStatus("Rejected", rowData?.id)}
              >
                Disapproved
              </DropdownItem> */}
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
            Total {count} users for approval
          </span>
          <label className="flex items-center text-default-400 text-small">
            Rows per page:
            <select
              className="bg-transparent outline-none text-default-400 text-small"
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
  }, [filterValue, visibleColumns, onRowsPerPageChange, count, onSearchChange]);

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
  }, [
    selectedKeys,
    count,
    filteration,
    pages,
    onPreviousPage,
    onNextPage,
    dispatch,
  ]);

  return (
    <>
      <h1 className="font-sans text-2xl font-medium mb-1">
        Users approval list
      </h1>
      <Table
        isHeaderSticky
        aria-label="Users table with custom cells, pagination, and sorting"
        bottomContent={bottomContent}
        bottomContentPlacement="outside"
        classNames={{
          wrapper: "max-h-[65vh] w-full",
          table:'w-full'
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
    </>
  );
};

export default UserApprovals;
