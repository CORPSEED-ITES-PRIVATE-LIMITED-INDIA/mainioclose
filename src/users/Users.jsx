import {
  addToast,
  Avatar,
  Button,
  Chip,
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerFooter,
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
  useDisclosure,
  User,
} from "@heroui/react";
import {
  ChevronDown,
  Dot,
  EllipsisVertical,
  Search,
  User2,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  activateOrDeActivateUser,
  deleteUserInLeadService,
  getAllUsers,
} from "../toolkit/slices/commonSlice";
import dayjs from "dayjs";
import { deleteUserInAuth } from "../toolkit/slices/authSlice";

export const columns = [
  { name: "ID", uid: "id" },
  { name: "NAME", uid: "fullName", sortable: true },
  { name: "EMAIL", uid: "email" },
  { name: "DEPARTMENT", uid: "department" },
  { name: "MANAGER", uid: "manager" },
  { name: "ROLE", uid: "role" },
  { name: "JOIN DATE", uid: "dateOfJoining" },
  { name: "ACTIONS", uid: "actions" },
];

export function capitalize(s) {
  return s ? s.charAt(0).toUpperCase() + s.slice(1).toLowerCase() : "";
}

const INITIAL_VISIBLE_COLUMNS = [
  "fullName",
  "email",
  "department",
  "manager",
  "role",
  "dateOfJoining",
  "actions",
];

const Users = () => {
  const { userId } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const count = useSelector((state) => state.common.usersList?.length);
  const data = useSelector((state) => state.common.usersList);
  const [filterValue, setFilterValue] = useState("");
  const [selectedKeys, setSelectedKeys] = useState(new Set([]));
  const [visibleColumns, setVisibleColumns] = useState(
    new Set(INITIAL_VISIBLE_COLUMNS)
  );
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortDescriptor, setSortDescriptor] = useState({
    column: "fullName",
    direction: "ascending",
  });
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const deleteModal = useDisclosure();
  const [initialFilteration, setInitialFilteration] = useState({
    userId: userId,
    page: 1,
    size: 50,
    filterUserId: "",
    type: "all",
    rating: "all",
  });
  const [userData, setUserData] = useState(null);
  const hasSearchFilter = Boolean(filterValue);
  const [rowId, setRowId] = useState(null);

  useEffect(() => {
    dispatch(getAllUsers());
  }, [dispatch]);

  const headerColumns = useMemo(() => {
    if (visibleColumns === "all") return columns;

    return columns.filter((column) =>
      Array.from(visibleColumns).includes(column.uid)
    );
  }, [visibleColumns]);

  const filteredItems = useMemo(() => {
    let filteredUsers = [...(data || [])];
    if (hasSearchFilter) {
      filteredUsers = filteredUsers.filter((item) =>
        Object.values(item)?.some((val) =>
          String(val)?.toLowerCase()?.includes(filterValue?.toLowerCase())
        )
      );
    }
    return filteredUsers;
  }, [data, filterValue, statusFilter]);

  const pages = Math.ceil(count / initialFilteration?.size) || 1;

  const items = useMemo(() => {
    const start = (initialFilteration?.page - 1) * initialFilteration?.size;
    const end = start + initialFilteration?.size;

    return filteredItems.slice(start, end);
  }, [initialFilteration, filteredItems]);

  const sortedItems = useMemo(() => {
    return [...items].sort((a, b) => {
      const first = a[sortDescriptor.column];
      const second = b[sortDescriptor.column];
      const cmp = first < second ? -1 : first > second ? 1 : 0;

      return sortDescriptor.direction === "descending" ? -cmp : cmp;
    });
  }, [sortDescriptor, items]);

  const handleActionPress = (row) => {
    dispatch(activateOrDeActivateUser({ id: row?.id, currentUserId: userId }))
      .then((resp) => {
        if (resp.meta.requestStatus === "fulfilled") {
          addToast({
            title: "User status updated successfully !.",
            color: "success",
          });
          dispatch(getAllUsers());
        } else {
          addToast({ title: "Something went wrong !.", color: "danger" });
        }
      })
      .catch(() =>
        addToast({ title: "Something went wrong !.", color: "danger" })
      );
  };

  const handleDeleteUser = () => {
    dispatch(deleteUserInAuth(rowId))
      .then((resp) => {
        if (resp.meta.requestStatus === "fulfilled") {
          addToast({
            title: "User deleted successfully !.",
            color: "success",
          });
          dispatch(deleteUserInLeadService(rowId));
          dispatch(getAllUsers());
          setRowId(null);
          deleteModal.onClose();
        } else {
          addToast({ title: "Something went wrong !.", color: "danger" });
        }
      })
      .catch(() =>
        addToast({ title: "Something went wrong !.", color: "danger" })
      );
  };

  const renderCell = useCallback((rowData, columnKey) => {
    switch (columnKey) {
      case "fullName":
        return (
          <div className="flex items-center gap-2">
            <Dot
              className="h-12 w-12 m-0 p-0"
              color={rowData?.autoActive ? "#99ff99" : "#ff9999"}
            />
            <User
              className="cursor-pointer"
              description={rowData?.employeeId}
              name={rowData?.fullName}
              onClick={() => {
                onOpen();
                setUserData(rowData);
              }}
            />
          </div>
        );
      case "email":
        return (
          <div className="flex flex-col">
            <span className="font-semibold">{rowData.email || "-"}</span>
            <span className="font-normal text-sm text-default-500">
              {rowData.contactNo || "-"}
            </span>
          </div>
        );
      case "manager":
        return (
          <div className="flex flex-col">
            <span className="font-semibold">
              {rowData?.managers?.fullName || "-"}
            </span>
            <span className="text-sm text-default-400">
              {rowData?.managers?.contactNo || "-"}
            </span>
          </div>
        );
      case "department":
        return (
          <div className="flex flex-col">
            <span className="font-semibold">
              {rowData?.userDepartment?.name || "-"}
            </span>
            <span className="text-sm text-gray-400">
              {rowData.userDesignation?.name || "-"}
            </span>
          </div>
        );
      case "role":
        return (
          <div className="flex flex-col">
            <span className="font-semibold">
              {rowData?.role?.join(",") || "-"}
            </span>
          </div>
        );
      case "dateOfJoining":
        return (
          <div className="flex flex-col">
            <span className="font-semibold">
              {dayjs(rowData?.dateOfJoining).format("DD-MM-YYYY") || "-"}
            </span>
          </div>
        );
      case "actions":
        return (
          <div className="relative flex justify-center items-center gap-2">
            <Dropdown>
              <DropdownTrigger>
                <Button isIconOnly size="sm" variant="light">
                  <EllipsisVertical />
                </Button>
              </DropdownTrigger>
              <DropdownMenu>
                <DropdownItem key="userHistory">
                  <Link to={`${rowData?.id}/userHistory`}>User history</Link>
                </DropdownItem>
                <DropdownItem
                  key="action"
                  onPress={() => handleActionPress(rowData)}
                >
                  {rowData?.autoActive ? "Deactive" : "Active"}
                </DropdownItem>
                <DropdownItem
                  key="delete"
                  color="danger"
                  onPress={() => {
                    setRowId(rowData?.id);
                    deleteModal.onOpen();
                  }}
                >
                  Delete
                </DropdownItem>
              </DropdownMenu>
            </Dropdown>
          </div>
        );
      default:
        return rowData[columnKey] || "-";
    }
  }, []);

  const onNextPage = useCallback(() => {
    if (initialFilteration?.page < pages) {
      setInitialFilteration((prev) => ({ ...prev, page: prev.page + 1 }));
    }
  }, [initialFilteration, pages]);

  const onPreviousPage = useCallback(() => {
    if (initialFilteration?.page > 1) {
      setInitialFilteration((prev) => ({ ...prev, page: prev.page - 1 }));
    }
  }, [initialFilteration]);

  const onRowsPerPageChange = useCallback((e) => {
    setInitialFilteration((prev) => ({
      ...prev,
      size: Number(e.target.value),
      page: 1,
    }));
  }, []);

  const onSearchChange = useCallback((value) => {
    if (value) {
      setFilterValue(value);
      setInitialFilteration((prev) => ({ ...prev, page: 1 }));
    } else {
      setFilterValue("");
    }
  }, []);

  const onClear = useCallback(() => {
    setFilterValue("");
    setInitialFilteration((prev) => ({ ...prev, page: 1 }));
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
            <Button
              onPress={() => navigate(`/erp/${userId}/users/deactiveUsersList`)}
            >
              Deactive users list
            </Button>
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
            Total {count} users
          </span>
          <label className="flex items-center text-default-400 text-small">
            Rows per page:
            <select
              className="bg-transparent outline-hidden text-default-400 text-small"
              onChange={onRowsPerPageChange}
              value={initialFilteration?.size}
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
    statusFilter,
    visibleColumns,
    onRowsPerPageChange,
    data.length,
    onSearchChange,
    hasSearchFilter,
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
          page={initialFilteration?.page}
          total={pages}
          onChange={(e) => {
            setInitialFilteration((prev) => ({ ...prev, page: e }));
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
  }, [selectedKeys, count, initialFilteration, pages, hasSearchFilter]);
  return (
    <>
      <h1 className="font-sans text-2xl font-medium mb-1">Users</h1>
      <Table
        isHeaderSticky
        aria-label="Example table with custom cells, pagination and sorting"
        bottomContent={bottomContent}
        bottomContentPlacement="outside"
        classNames={{
          wrapper: "max-h-[68vh]",
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
              align={column.uid === "actions" ? "center" : "start"}
              allowsSorting={column.sortable}
            >
              {column.name}
            </TableColumn>
          )}
        </TableHeader>
        <TableBody emptyContent={"No data found"} items={sortedItems}>
          {(item) => (
            <TableRow key={item.id}>
              {(columnKey) => (
                <TableCell>{renderCell(item, columnKey)}</TableCell>
              )}
            </TableRow>
          )}
        </TableBody>
      </Table>
      <Drawer isOpen={isOpen} onOpenChange={onOpenChange} size="4xl">
        <DrawerContent>
          {(onClose) => (
            <>
              <DrawerHeader className="flex flex-col gap-1">
                User details
              </DrawerHeader>
              <DrawerBody>
                <div className="grid grid-cols-2 gap-2">
                  <div className="flex items-center gap-2">
                    <p className="text-default-400">Name</p>{" "}
                    <p className="text-default-400">:</p>{" "}
                    <p>{userData?.fullName}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <p className="text-default-400">Employee id</p>{" "}
                    <p className="text-default-400">:</p>{" "}
                    <p>{userData?.employeeId}</p>
                  </div>
                  <div className="flex items-center flex-wrap gap-2">
                    <p className="text-default-400">Official email address</p>{" "}
                    <p className="text-default-400 ">:</p>{" "}
                    <p>{userData?.email}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <p className="text-default-400">Personal email address</p>{" "}
                    <p className="text-default-400">:</p>{" "}
                    <p>{userData?.email}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <p className="text-default-400">Contact number</p>{" "}
                    <p className="text-default-400">:</p>{" "}
                    <p>{userData?.contactNo}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <p className="text-default-400">Emergency contact number</p>{" "}
                    <p className="text-default-400">:</p>{" "}
                    <p>{userData?.emergencyNumber}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <p className="text-default-400">Role</p>{" "}
                    <p className="text-default-400">:</p>{" "}
                    <p>{userData?.role?.join(",")}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <p className="text-default-400">Department</p>{" "}
                    <p className="text-default-400">:</p>{" "}
                    <p>{userData?.userDepartment?.name}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <p className="text-default-400">Designation</p>{" "}
                    <p className="text-default-400">:</p>{" "}
                    <p>{userData?.userDesignation?.name}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <p className="text-default-400">Date of joining</p>{" "}
                    <p className="text-default-400">:</p>{" "}
                    <p>{dayjs(userData?.dateOfJoining).format("DD-MM-YYYY")}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <p className="text-default-400">Aadhar number</p>{" "}
                    <p className="text-default-400">:</p>{" "}
                    <p>{userData?.aadharCard}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <p className="text-default-400">Pan number</p>{" "}
                    <p className="text-default-400">:</p>{" "}
                    <p>{userData?.panNumber}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <p className="text-default-400">Nationality</p>{" "}
                    <p className="text-default-400">:</p>{" "}
                    <p>{userData?.nationality}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <p className="text-default-400">Language</p>{" "}
                    <p className="text-default-400">:</p>{" "}
                    <p>{userData?.language}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <p className="text-default-400">Locker size</p>{" "}
                    <p className="text-default-400">:</p>{" "}
                    <p>{userData?.lockerSize}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <p className="text-default-400">Experience</p>{" "}
                    <p className="text-default-400">:</p>{" "}
                    <p>
                      {[
                        ...(userData?.expInYear
                          ? [`${userData?.expInYear}yrs`]
                          : []),
                        ...(userData?.expInMonth
                          ? [`${userData?.expInMonth}mos`]
                          : []),
                      ].join(",")}{" "}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <p className="text-default-400">Permanent address</p>{" "}
                    <p className="text-default-400">:</p>{" "}
                    <p>{userData?.permanentAddress}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <p className="text-default-400">Residential address</p>{" "}
                    <p className="text-default-400">:</p>{" "}
                    <p>{userData?.residentialAddress}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <p className="text-default-400">Manager</p>{" "}
                    <p className="text-default-400">:</p>{" "}
                    <p>{userData?.managers?.fullName}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <p className="text-default-400">Manager email address</p>{" "}
                    <p className="text-default-400">:</p>{" "}
                    <p>{userData?.managers?.email}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <p className="text-default-400">Father's name</p>{" "}
                    <p className="text-default-400">:</p>{" "}
                    <p>{userData?.fatherName}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <p className="text-default-400">Father's contact no.</p>{" "}
                    <p className="text-default-400">:</p>{" "}
                    <p>{userData?.fatherContactNo}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <p className="text-default-400">Father's occupation</p>{" "}
                    <p className="text-default-400">:</p>{" "}
                    <p>{userData?.fatherOccupation}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <p className="text-default-400">Mother's name</p>{" "}
                    <p className="text-default-400">:</p>{" "}
                    <p>{userData?.motherName}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <p className="text-default-400">Mother's contact no.</p>{" "}
                    <p className="text-default-400">:</p>{" "}
                    <p>{userData?.motherContactNo}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <p className="text-default-400">Mother's occupation</p>{" "}
                    <p className="text-default-400">:</p>{" "}
                    <p>{userData?.motherOccupation}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <p className="text-default-400">Marital status</p>{" "}
                    <p className="text-default-400">:</p>{" "}
                    <p>{userData?.maritalStatus}</p>
                  </div>
                </div>
              </DrawerBody>
              <DrawerFooter>
                <Button color="danger" variant="light" onPress={onClose}>
                  Close
                </Button>
                <Button color="primary" onPress={onClose}>
                  Action
                </Button>
              </DrawerFooter>
            </>
          )}
        </DrawerContent>
      </Drawer>
      <Modal
        isOpen={deleteModal.isOpen}
        onOpenChange={deleteModal.onOpenChange}
        backdrop="blur"
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                Delete user
              </ModalHeader>
              <ModalBody>
                <p>Are you sure to delete this user ?</p>
              </ModalBody>
              <ModalFooter>
                <Button onPress={onClose}>No</Button>
                <Button color="primary" onPress={handleDeleteUser}>
                  Yes
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
};

export default Users;
