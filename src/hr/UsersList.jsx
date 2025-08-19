import {
  Avatar,
  Button,
  Chip,
  DatePicker,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
  Input,
  Modal,
  ModalHeader,
  ModalBody,
  ModalContent,
  ModalFooter,
  Pagination,
  Select,
  SelectItem,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
  Textarea,
  useDisclosure,
} from "@heroui/react";
import {
  ChevronDown,
  EllipsisVertical,
  Phone,
  Plus,
  Search,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { getAllUsers } from "../toolkit/slices/commonSlice"; // Adjust import path as needed
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

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

const formSchema = z
  .object({
    userName: z
      .string()
      .min(1, "Please enter username")
      .refine((val) => /^[a-zA-Z0-9_]+$/.test(val), {
        message: "Username can only contain letters, numbers, and underscores",
      }),
    email: z.string().email("Please enter a valid email"),
    personalEmail: z
      .string()
      .email("Please enter a valid personal email")
      .optional(),
    contactNo: z.string().min(10, "Please enter a valid contact number"),
    companyMobile: z.string().optional(),
    role: z.array(z.string()).min(1, "Please select at least one role"),
    departmentId: z.string().min(1, "Please select a department"),
    designationId: z.string().min(1, "Please select a designation"),
    epfNo: z.string().optional(),
    aadharCard: z.string().refine((val) => /^\d{12}$/.test(val), {
      message: "Aadhar number must be 12 digits",
    }),
    managerId: z.string().optional(),
    lockerSize: z.string().optional(),
    expInYear: z.string().min(1, "Please enter experience in years"),
    expInMonth: z.string().min(1, "Please enter experience in months"),
    dateOfJoining: z.date({ required_error: "Please select date of joining" }),
    type: z.enum(["male", "female", "others"], {
      errorMap: () => ({ message: "Please select gender" }),
    }),
    maritalStatus: z.enum(["Married", "Unmarried"], {
      errorMap: () => ({ message: "Please select marital status" }),
    }),
    spouseName: z.string().optional(),
    spouseContactNo: z.string().optional(),
    fatherName: z.string().min(1, "Please enter father's name"),
    fatherOccupation: z.string().optional(),
    fatherContactNo: z.string().optional(),
    motherName: z.string().min(1, "Please enter mother's name"),
    motherContactNo: z.string().optional(),
    nationality: z.string().optional(),
    language: z.string().optional(),
    master: z.boolean().optional(),
    backupTeam: z.boolean().optional(),
    emergencyNumber: z.string().optional(),
    permanentAddress: z.string().min(1, "Please enter permanent address"),
    residentialAddress: z.string().optional(),
  })
  .refine(
    (data) => {
      if (data.maritalStatus === "Married") {
        return !!data.spouseName && !!data.spouseContactNo;
      }
      return true;
    },
    {
      message: "Spouse name and contact number are required for married status",
      path: ["spouseName"],
    }
  );

const UsersList = ({ edit }) => {
  const { userId } = useParams();
  const dispatch = useDispatch();
  const count = useSelector((state) => state.common.usersList?.length || 0);
  const data = useSelector((state) => state.common.usersList || []);
  const departmentList = useSelector(
    (state) => state?.setting?.allDepartment || []
  );
  const allRoles = useSelector((state) => state.common.allRoles || []);
  const allDesiginationListById = useSelector(
    (state) => state.common.desiginationListById || []
  );
  const managerListById = useSelector(
    (state) => state.common.managerListById || []
  );
  const { isOpen, onOpen, onClose, onOpenChange } = useDisclosure();
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
    dispatch(getAllUsers(filteration));
  }, [dispatch, filteration]);

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

  const {
    control,
    handleSubmit,
    formState: { errors },
    watch,
    reset,
  } = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      userName: "",
      email: "",
      personalEmail: "",
      contactNo: "",
      companyMobile: "",
      role: [],
      departmentId: "",
      designationId: "",
      epfNo: "",
      aadharCard: "",
      managerId: "",
      lockerSize: "",
      expInYear: "",
      expInMonth: "",
      dateOfJoining: null,
      type: "",
      maritalStatus: "",
      spouseName: "",
      spouseContactNo: "",
      fatherName: "",
      fatherOccupation: "",
      fatherContactNo: "",
      motherName: "",
      motherContactNo: "",
      nationality: "",
      language: "",
      master: false,
      backupTeam: false,
      emergencyNumber: "",
      permanentAddress: "",
      residentialAddress: "",
    },
  });

  const maritalStatus = watch("maritalStatus");

  // Debug form values and errors
  useEffect(() => {
    console.log("Current form values:", watch());
    console.log("Form errors:", errors);
  }, [watch, errors]);

  const onSubmit = (data) => {
    console.log("Form submitted:", data);
    reset();
    onClose();
  };

  const renderCell = useCallback((rowData, columnKey) => {
    switch (columnKey) {
      case "userName":
        return (
          <div className="flex items-start gap-2">
            <Avatar size="sm" classNames={{icon:'text-gray-500'}} />
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
            <span className="font-normal">
              {rowData?.email || "Unknown"}
            </span>
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
              <DropdownItem>Approved</DropdownItem>
              <DropdownItem>Disapproved</DropdownItem>
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
            className="w-full sm:max-w-[44%]"
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
            <Button color="primary" onPress={onOpen} endContent={<Plus />}>
              Add users
            </Button>
          </div>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-default-400 text-small">
            Total {count} users
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
  }, [
    filterValue,
    visibleColumns,
    onRowsPerPageChange,
    count,
    onSearchChange,
    onOpen,
  ]);

  const bottomContent = useMemo(() => {
    return (
      <div className="py-2 px-2 flex justify-between items-center">
        <span className="w-[30%] text-small text-default-400">
          {selectedKeys === "all"
            ? "All items selected"
            : `${selectedKeys.size} of ${filteredItems.length} selected`}
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
            dispatch(getAllUsers({ ...filteration, page: e }));
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
    items.length,
    filteration,
    pages,
    onPreviousPage,
    onNextPage,
    dispatch,
  ]);

  return (
    <>
      <h1 className="font-sans text-2xl font-medium mb-1">Users</h1>
      <Table
        isHeaderSticky
        aria-label="Users table with custom cells, pagination, and sorting"
        bottomContent={bottomContent}
        bottomContentPlacement="outside"
        classNames={{
          wrapper: "max-h-[65vh] max-w-full",
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
        <TableBody emptyContent={"No users found"} items={sortedItems}>
          {(item) => (
            <TableRow key={item.id || item.companyId}>
              {(columnKey) => (
                <TableCell>{renderCell(item, columnKey)}</TableCell>
              )}
            </TableRow>
          )}
        </TableBody>
      </Table>

      <Modal isOpen={isOpen} onOpenChange={onOpenChange} size="3xl">
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader>Add users</ModalHeader>
              <form onSubmit={handleSubmit(onSubmit)}>
                <ModalBody>
                  <div className="max-h-[60vh] overflow-auto p-4">
                    <div className="grid grid-cols-2 gap-4">
                      <Controller
                        name="userName"
                        control={control}
                        render={({ field }) => (
                          <Input
                            label="Username"
                            isRequired
                            value={field.value}
                            onChange={field.onChange}
                            errorMessage={errors.userName?.message}
                            isInvalid={!!errors.userName}
                          />
                        )}
                      />
                      <Controller
                        name="email"
                        control={control}
                        render={({ field }) => (
                          <Input
                            label="Email"
                            isRequired
                            type="email"
                            value={field.value}
                            onChange={field.onChange}
                            errorMessage={errors.email?.message}
                            isInvalid={!!errors.email}
                            isDisabled={edit}
                          />
                        )}
                      />
                      <Controller
                        name="personalEmail"
                        control={control}
                        render={({ field }) => (
                          <Input
                            label="Personal email"
                            type="email"
                            value={field.value}
                            onChange={field.onChange}
                            errorMessage={errors.personalEmail?.message}
                            isInvalid={!!errors.personalEmail}
                          />
                        )}
                      />
                      <Controller
                        name="contactNo"
                        control={control}
                        render={({ field }) => (
                          <Input
                            label="Contact number"
                            isRequired
                            value={field.value}
                            onChange={field.onChange}
                            errorMessage={errors.contactNo?.message}
                            isInvalid={!!errors.contactNo}
                          />
                        )}
                      />
                      <Controller
                        name="companyMobile"
                        control={control}
                        render={({ field }) => (
                          <Input
                            label="Company mobile number"
                            value={field.value}
                            onChange={field.onChange}
                            errorMessage={errors.companyMobile?.message}
                            isInvalid={!!errors.companyMobile}
                          />
                        )}
                      />
                      <Controller
                        name="role"
                        control={control}
                        render={({ field }) => (
                          <Select
                            label="Role"
                            isRequired
                            selectionMode="multiple"
                            selectedKeys={field.value}
                            onSelectionChange={(keys) =>
                              field.onChange(Array.from(keys))
                            }
                            errorMessage={errors.role?.message}
                            isInvalid={!!errors.role}
                          >
                            {allRoles?.length > 0 ? (
                              allRoles.map((ele) => (
                                <SelectItem key={ele.name} value={ele.name}>
                                  {ele.name}
                                </SelectItem>
                              ))
                            ) : (
                              <SelectItem key="no-roles" value="" isDisabled>
                                No roles available
                              </SelectItem>
                            )}
                          </Select>
                        )}
                      />
                      <Controller
                        name="departmentId"
                        control={control}
                        render={({ field }) => (
                          <Select
                            label="Department"
                            isRequired
                            selectedKeys={field.value ? [field.value] : []}
                            onSelectionChange={(keys) => {
                              const value = Array.from(keys)[0];
                              if (value) {
                                field.onChange(value);
                                dispatch(getDesiginationById(value));
                                dispatch(getManagerById(value));
                              }
                            }}
                            errorMessage={errors.departmentId?.message}
                            isInvalid={!!errors.departmentId}
                          >
                            {departmentList?.length > 0 ? (
                              departmentList.map((ele) => (
                                <SelectItem key={ele.id} value={ele.id}>
                                  {ele.name}
                                </SelectItem>
                              ))
                            ) : (
                              <SelectItem
                                key="no-departments"
                                value=""
                                isDisabled
                              >
                                No departments available
                              </SelectItem>
                            )}
                          </Select>
                        )}
                      />
                      <Controller
                        name="designationId"
                        control={control}
                        render={({ field }) => (
                          <Select
                            label="Designation"
                            isRequired
                            selectedKeys={field.value ? [field.value] : []}
                            onSelectionChange={(keys) => {
                              const value = Array.from(keys)[0];
                              if (value) field.onChange(value);
                            }}
                            errorMessage={errors.designationId?.message}
                            isInvalid={!!errors.designationId}
                          >
                            {allDesiginationListById?.length > 0 ? (
                              allDesiginationListById.map((ele) => (
                                <SelectItem key={ele.id} value={ele.id}>
                                  {ele.name}
                                </SelectItem>
                              ))
                            ) : (
                              <SelectItem
                                key="no-designations"
                                value=""
                                isDisabled
                              >
                                No designations available
                              </SelectItem>
                            )}
                          </Select>
                        )}
                      />
                      <Controller
                        name="epfNo"
                        control={control}
                        render={({ field }) => (
                          <Input
                            label="EPFO number"
                            value={field.value}
                            onChange={field.onChange}
                            errorMessage={errors.epfNo?.message}
                            isInvalid={!!errors.epfNo}
                          />
                        )}
                      />
                      <Controller
                        name="aadharCard"
                        control={control}
                        render={({ field }) => (
                          <Input
                            label="Aadhar card no."
                            isRequired
                            value={field.value}
                            onChange={field.onChange}
                            errorMessage={errors.aadharCard?.message}
                            isInvalid={!!errors.aadharCard}
                          />
                        )}
                      />
                      <Controller
                        name="managerId"
                        control={control}
                        render={({ field }) => (
                          <Select
                            label="Manager name"
                            selectedKeys={field.value ? [field.value] : []}
                            onSelectionChange={(keys) => {
                              const value = Array.from(keys)[0];
                              if (value) field.onChange(value);
                            }}
                            errorMessage={errors.managerId?.message}
                            isInvalid={!!errors.managerId}
                          >
                            {managerListById?.length > 0 ? (
                              managerListById.map((item) => (
                                <SelectItem key={item.id} value={item.id}>
                                  {item.fullName}
                                </SelectItem>
                              ))
                            ) : (
                              <SelectItem key="no-managers" value="" isDisabled>
                                No managers available
                              </SelectItem>
                            )}
                          </Select>
                        )}
                      />
                      <Controller
                        name="lockerSize"
                        control={control}
                        render={({ field }) => (
                          <Input
                            label="Locker size"
                            value={field.value}
                            onChange={field.onChange}
                            errorMessage={errors.lockerSize?.message}
                            isInvalid={!!errors.lockerSize}
                          />
                        )}
                      />
                      <Controller
                        name="expInYear"
                        control={control}
                        render={({ field }) => (
                          <Input
                            label="Experience (in years)"
                            isRequired
                            value={field.value}
                            onChange={field.onChange}
                            errorMessage={errors.expInYear?.message}
                            isInvalid={!!errors.expInYear}
                          />
                        )}
                      />
                      <Controller
                        name="expInMonth"
                        control={control}
                        render={({ field }) => (
                          <Input
                            label="Experience (in months)"
                            isRequired
                            value={field.value}
                            onChange={field.onChange}
                            errorMessage={errors.expInMonth?.message}
                            isInvalid={!!errors.expInMonth}
                          />
                        )}
                      />
                      <Controller
                        name="dateOfJoining"
                        control={control}
                        render={({ field }) => (
                          <DatePicker
                            label="Date of joining"
                            isRequired
                            value={field.value}
                            onChange={(value) => {
                              const date = new Date(value);
                              if (!isNaN(date)) field.onChange(date);
                            }}
                            errorMessage={errors.dateOfJoining?.message}
                            isInvalid={!!errors.dateOfJoining}
                          />
                        )}
                      />
                      <Controller
                        name="type"
                        control={control}
                        render={({ field }) => (
                          <Select
                            label="Gender"
                            isRequired
                            selectedKeys={field.value ? [field.value] : []}
                            onSelectionChange={(keys) => {
                              const value = Array.from(keys)[0];
                              if (value) field.onChange(value);
                            }}
                            errorMessage={errors.type?.message}
                            isInvalid={!!errors.type}
                          >
                            {[
                              { label: "Male", value: "male" },
                              { label: "Female", value: "female" },
                              { label: "Others", value: "others" },
                            ].map((item) => (
                              <SelectItem key={item.value} value={item.value}>
                                {item.label}
                              </SelectItem>
                            ))}
                          </Select>
                        )}
                      />
                      <Controller
                        name="maritalStatus"
                        control={control}
                        render={({ field }) => (
                          <Select
                            label="Marital status"
                            isRequired
                            selectedKeys={field.value ? [field.value] : []}
                            onSelectionChange={(keys) => {
                              const value = Array.from(keys)[0];
                              if (value) field.onChange(value);
                            }}
                            errorMessage={errors.maritalStatus?.message}
                            isInvalid={!!errors.maritalStatus}
                          >
                            {[
                              { label: "Married", value: "Married" },
                              { label: "Unmarried", value: "Unmarried" },
                            ].map((item) => (
                              <SelectItem key={item.value} value={item.value}>
                                {item.label}
                              </SelectItem>
                            ))}
                          </Select>
                        )}
                      />
                      <Controller
                        name="fatherName"
                        control={control}
                        render={({ field }) => (
                          <Input
                            label="Father's name"
                            isRequired
                            value={field.value}
                            onChange={field.onChange}
                            errorMessage={errors.fatherName?.message}
                            isInvalid={!!errors.fatherName}
                          />
                        )}
                      />
                      {maritalStatus === "Married" && (
                        <>
                          <Controller
                            name="spouseName"
                            control={control}
                            render={({ field }) => (
                              <Input
                                label="Spouse name"
                                isRequired
                                value={field.value}
                                onChange={field.onChange}
                                errorMessage={errors.spouseName?.message}
                                isInvalid={!!errors.spouseName}
                              />
                            )}
                          />
                          <Controller
                            name="spouseContactNo"
                            control={control}
                            render={({ field }) => (
                              <Input
                                label="Spouse contact number"
                                isRequired
                                value={field.value}
                                onChange={field.onChange}
                                errorMessage={errors.spouseContactNo?.message}
                                isInvalid={!!errors.spouseContactNo}
                              />
                            )}
                          />
                        </>
                      )}
                      {!maritalStatus && <div />}
                      <Controller
                        name="fatherOccupation"
                        control={control}
                        render={({ field }) => (
                          <Input
                            label="Father's occupation"
                            value={field.value}
                            onChange={field.onChange}
                            errorMessage={errors.fatherOccupation?.message}
                            isInvalid={!!errors.fatherOccupation}
                          />
                        )}
                      />
                      <Controller
                        name="fatherContactNo"
                        control={control}
                        render={({ field }) => (
                          <Input
                            label="Father's contact no."
                            value={field.value}
                            onChange={field.onChange}
                            errorMessage={errors.fatherContactNo?.message}
                            isInvalid={!!errors.fatherContactNo}
                          />
                        )}
                      />
                      <Controller
                        name="motherName"
                        control={control}
                        render={({ field }) => (
                          <Input
                            label="Mother's name"
                            isRequired
                            value={field.value}
                            onChange={field.onChange}
                            errorMessage={errors.motherName?.message}
                            isInvalid={!!errors.motherName}
                          />
                        )}
                      />
                      <Controller
                        name="motherContactNo"
                        control={control}
                        render={({ field }) => (
                          <Input
                            label="Mother's contact no."
                            value={field.value}
                            onChange={field.onChange}
                            errorMessage={errors.motherContactNo?.message}
                            isInvalid={!!errors.motherContactNo}
                          />
                        )}
                      />
                      <Controller
                        name="nationality"
                        control={control}
                        render={({ field }) => (
                          <Input
                            label="Nationality"
                            value={field.value}
                            onChange={field.onChange}
                            errorMessage={errors.nationality?.message}
                            isInvalid={!!errors.nationality}
                          />
                        )}
                      />
                      <Controller
                        name="language"
                        control={control}
                        render={({ field }) => (
                          <Input
                            label="Language"
                            value={field.value}
                            onChange={field.onChange}
                            errorMessage={errors.language?.message}
                            isInvalid={!!errors.language}
                          />
                        )}
                      />
                      {edit && (
                        <>
                          <Controller
                            name="master"
                            control={control}
                            render={({ field }) => (
                              <Select
                                label="Master"
                                isRequired
                                selectedKeys={
                                  field.value !== undefined
                                    ? [field.value.toString()]
                                    : []
                                }
                                onSelectionChange={(keys) => {
                                  const value = Array.from(keys)[0];
                                  if (value !== undefined)
                                    field.onChange(value === "true");
                                }}
                                errorMessage={errors.master?.message}
                                isInvalid={!!errors.master}
                              >
                                {[
                                  { label: "True", value: true },
                                  { label: "False", value: false },
                                ].map((item) => (
                                  <SelectItem
                                    key={item.value.toString()}
                                    value={item.value}
                                  >
                                    {item.label}
                                  </SelectItem>
                                ))}
                              </Select>
                            )}
                          />
                          <Controller
                            name="backupTeam"
                            control={control}
                            render={({ field }) => (
                              <Select
                                label="Backup team"
                                isRequired
                                selectedKeys={
                                  field.value !== undefined
                                    ? [field.value.toString()]
                                    : []
                                }
                                onSelectionChange={(keys) => {
                                  const value = Array.from(keys)[0];
                                  if (value !== undefined)
                                    field.onChange(value === "true");
                                }}
                                errorMessage={errors.backupTeam?.message}
                                isInvalid={!!errors.backupTeam}
                              >
                                {[
                                  { label: "True", value: true },
                                  { label: "False", value: false },
                                ].map((item) => (
                                  <SelectItem
                                    key={item.value.toString()}
                                    value={item.value}
                                  >
                                    {item.label}
                                  </SelectItem>
                                ))}
                              </Select>
                            )}
                          />
                        </>
                      )}
                      {!edit && <div />}
                      <Controller
                        name="emergencyNumber"
                        control={control}
                        render={({ field }) => (
                          <Input
                            label="Emergency contact no."
                            value={field.value}
                            onChange={field.onChange}
                            errorMessage={errors.emergencyNumber?.message}
                            isInvalid={!!errors.emergencyNumber}
                          />
                        )}
                      />
                      <Controller
                        name="permanentAddress"
                        control={control}
                        render={({ field }) => (
                          <Textarea
                            label="Permanent address"
                            isRequired
                            value={field.value}
                            onChange={field.onChange}
                            errorMessage={errors.permanentAddress?.message}
                            isInvalid={!!errors.permanentAddress}
                          />
                        )}
                      />
                      <Controller
                        name="residentialAddress"
                        control={control}
                        render={({ field }) => (
                          <Textarea
                            label="Residential address"
                            value={field.value}
                            onChange={field.onChange}
                            errorMessage={errors.residentialAddress?.message}
                            isInvalid={!!errors.residentialAddress}
                          />
                        )}
                      />
                      <div />
                    </div>
                  </div>
                </ModalBody>
                <ModalFooter>
                  <Button onPress={onClose}>Cancel</Button>
                  <Button color="primary" type="submit">
                    Submit
                  </Button>
                </ModalFooter>
              </form>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
};

export default UsersList;
