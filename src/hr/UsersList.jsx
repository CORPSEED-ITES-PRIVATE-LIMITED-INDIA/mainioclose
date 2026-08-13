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
  addToast,
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
import {
  createUserByHr,
  getAllRoles,
  getAllUsers,
  getDesiginationById,
  getManagerById,
  updateLeadByHr,
} from "../toolkit/slices/commonSlice"; // Adjust import path as needed
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  createNewUserInAuth,
  updateUserData,
} from "../toolkit/slices/authSlice";
import {
  createUsersInOperations,
  updateUsersInOperations,
} from "../toolkit/slices/operationSlice";
import { getAllDepartment } from "../toolkit/slices/settingSlice";
import {
  allowOnlyNumbers,
  formatEmail,
  formatPANInput,
  isValidEmail,
  padZero,
} from "../common";
import {
  parseAbsoluteToLocal,
  parseDate,
  toCalendarDateTime,
} from "@internationalized/date";
import dayjs from "dayjs";
import {
  createUserInAccounts,
  updateUserInAccounts,
} from "../toolkit/slices/accountSlice";

const columns = [
  { name: "ID", uid: "id" },
  { name: "USER NAME", uid: "fullName", sortable: true },
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

function requireFulfilled(action, fallbackMessage) {
  if (action?.meta?.requestStatus === "fulfilled") {
    return action;
  }

  const payloadMessage =
    action?.payload?.message ||
    action?.payload?.data?.message ||
    (typeof action?.payload === "string" ? action.payload : null);

  throw new Error(payloadMessage || action?.error?.message || fallbackMessage);
}

const INITIAL_VISIBLE_COLUMNS = [
  "fullName",
  "email",
  "department",
  "role",
  "experience",
  "managers",
  "actions",
];

const formSchema = (flags) =>
  z
    .object({
      employeeId: z.string().min(1, "Please enter employee id"),
      userName: z.string().min(1, "Please enter username"),
      email: z
        .string()
        .trim()
        .min(1, "Please enter email")
        .email("Please enter a valid email"),
      personalEmail: z
        .union([
          z.literal(""),
          z.string().email("Please enter a valid personal email"),
        ])
        .optional(),
      contactNo: z.string().length(10, "Contact number must contain 10 digits"),
      companyMobile: z.string().optional(),
      role: z.array(z.string()).min(1, "Please select at least one role"),
      departmentId: z.string().min(1, "Please select a department"),
      designationId: z.string().min(1, "Please select a designation"),
      epfNo: z.string().optional(),
      aadharCard: z
        .string()
        .length(12, "Aadhar card number must contain 12 digits"),
      panNumber: z.string().length(10, "PAN number must contain 10 characters"),
      managerId: z.string().min(1, "Please select a manager name"),
      managerFlag: z.boolean().optional(),
      lockerSize: z.string().optional(),
      expInYear: z.string().min(1, "Please enter experience in years"),
      expInMonth: z.string().min(1, "Please enter experience in months"),
      dateOfJoining: z.string().min(1, "please select date of joining."),
      type: z.string().min(1, "please select the gender."),
      maritalStatus: z.string().min(1, "please select the status."),
      ...(flags?.maritalStatus === "Married"
        ? {
            spouseName: z.string().min(1, "Please enter spouse name"),
            spouseContactNo: z.string().optional(),
          }
        : {}),
      fatherName: z.string().min(1, "Please enter father's name"),
      fatherOccupation: z.string().optional(),
      fatherContactNo: z.string().optional(),
      motherName: z.string().min(1, "Please enter mother's name"),
      motherContactNo: z.string().optional(),
      nationality: z.string().optional(),
      language: z.string().optional(),
      ...(flags?.master
        ? {
            master: z.boolean().optional(),
            backupTeam: z.boolean().optional(),
          }
        : {}),
      emergencyNumber: z.string().optional(),
      permanentAddress: z.string().min(1, "Please enter permanent address"),
      residentialAddress: z.string().optional(),
    });

const defaultValues = {
  employeeId: "",
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
  panNumber: "",
  managerId: "",
  managerFlag: false,
  lockerSize: "",
  expInYear: "",
  expInMonth: "",
  dateOfJoining: "",
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
};

const UsersList = () => {
  const { userId } = useParams();
  const dispatch = useDispatch();
  const count = useSelector((state) => state.common.usersList?.length || 0);
  const data = useSelector((state) => state.common.usersList || []);
  const departmentList = useSelector(
    (state) => state?.setting?.departmentList || [],
  );
  const allRoles = useSelector((state) => state.common.allRoles || []);
  const allDesiginationListById = useSelector(
    (state) => state.common.desiginationListById || [],
  );
  const managerListById = useSelector(
    (state) => state.common.managerListById || [],
  );
  const { isOpen, onOpen, onClose, onOpenChange } = useDisclosure();
  const [filterValue, setFilterValue] = useState("");
  const [selectedKeys, setSelectedKeys] = useState(new Set([]));
  const [visibleColumns, setVisibleColumns] = useState(
    new Set(INITIAL_VISIBLE_COLUMNS),
  );
  const [sortDescriptor, setSortDescriptor] = useState({
    column: "fullName",
    direction: "ascending",
  });
  const [filteration, setFilteration] = useState({
    page: 1,
    size: 50,
  });
  const [rowItem, setRowItem] = useState(null);
  const [formFlags, setFormFlags] = useState({
    maritalStatus: false,
    master: false,
  });

  const hasSearchFilter = Boolean(filterValue);

  useEffect(() => {
    dispatch(getAllUsers(filteration));
  }, [dispatch, filteration]);

  const headerColumns = useMemo(() => {
    if (visibleColumns === "all") return columns;
    return columns.filter((column) =>
      Array.from(visibleColumns).includes(column.uid),
    );
  }, [visibleColumns]);

  const filteredItems = useMemo(() => {
    let filteredUsers = [...data];
    if (hasSearchFilter) {
      filteredUsers = filteredUsers.filter((item) =>
        Object.values(item)?.some((val) =>
          String(val)?.toLowerCase()?.includes(filterValue?.toLowerCase()),
        ),
      );
    }
    return filteredUsers;
  }, [data, filterValue]);

  const pages = Math.ceil(count / filteration?.size) || 1;

  const sortedItems = useMemo(() => {
    return [...filteredItems];
  }, [sortDescriptor, filteredItems]);

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
    reset,
    getValues,
    setValue,
    clearErrors,
  } = useForm({
    resolver: zodResolver(formSchema(formFlags)),
    defaultValues,
  });

  console.log("jgdskjfgsdajgjk", formSchema(formFlags), formFlags);

  useEffect(() => {
    console.log("Current form values:", watch());
    console.log("Form errors:", errors);
  }, [watch, errors]);

  useEffect(() => {
    reset(getValues());
  }, [formFlags]);

  const handleEdit = useCallback(
    (data) => {
      dispatch(getAllRoles());
      dispatch(getAllDepartment());
      dispatch(getDesiginationById(data?.userDepartment?.id));
      dispatch(getManagerById(data?.userDepartment?.id));
      setFormFlags((prev) => ({
        ...prev,
        master: data?.master,
        maritalStatus: data?.maritalStatus,
      }));
      reset({
        employeeId: data?.employeeId,
        userName: data?.fullName,
        email: data.email,
        designationId: String(data?.userDesignation?.id),
        departmentId: String(data?.userDepartment?.id),
        role: data?.role,
        epfNo: data?.epfNo,
        aadharCard: data?.aadharCard,
        managerId: data?.managers?.id ? String(data.managers.id) : "",
        managerFlag: Boolean(data?.managerFlag ?? data?.isManager ?? false),
        expInMonth: String(data?.expInMonth),
        expInYear: String(data?.expInYear),
        dateOfJoining: data.dateOfJoining
          ? dayjs(data?.dateOfJoining).format("YYYY-MM-DD")
          : null,
        type: data?.type,
        fatherName: data?.fatherName,
        fatherOccupation: data?.fatherOccupation,
        fatherContactNo: data?.fatherContactNo,
        motherName: data?.motherName,
        motherOccupation: data?.motherOccupation,
        motherContactNo: data?.motherContactNo,
        spouseName: data?.spouseName,
        spouseContactNo: data?.spouseContactNo,
        nationality: data?.nationality,
        language: data?.language,
        emergencyNumber: data?.emergencyNumber,
        panNumber: data?.panNumber,
        permanentAddress: data?.permanentAddress,
        residentialAddress: data?.residentialAddress,
        backupTeam: data?.backupTeam,
        master: String(data?.master),
        maritalStatus: data?.maritalStatus,
        personalEmail: data?.personalEmail,
        companyMobile: data?.companyMobile,
        lockerSize: String(data?.lockerSize),
        contactNo: data?.contactNo,
      });
      setRowItem(data);
      onOpen();
    },
    [data, reset, dispatch, onOpen],
  );

  const onSubmit = async (formValues) => {
    const managerFlag = Boolean(formValues?.managerFlag);
    const managerId =
      managerFlag && formValues?.managerId
        ? Number(formValues.managerId)
        : null;

    const values = {
      ...formValues,
      departmentId: Number(formValues?.departmentId),
      designationId: Number(formValues?.designationId),
      managerFlag,
      managerId,
    };

    try {
      if (rowItem) {
        values.id = rowItem.id;

        const authResponse = await dispatch(
          updateUserData({
            id: rowItem.id,
            userName: values.userName,
            email: values.email,
            designationId: values.designationId,
            departmentId: values.departmentId,
            role: values.role,
            isManager: values.managerFlag,
            bucketSize: Number(values.lockerSize),
            lockerSize: Number(values.lockerSize),
          }),
        );
        requireFulfilled(authResponse, "Failed to update user in Auth");

        const hrResponse = await dispatch(updateLeadByHr(values));
        requireFulfilled(hrResponse, "Failed to update user in HR");

        const updatedUser = hrResponse?.payload?.data;

        const accountsResponse = await dispatch(
          updateUserInAccounts({
            id: rowItem.id,
            fullName: values.userName,
            email: values.email,
            designation: updatedUser?.userDesignation?.name,
            department: updatedUser?.userDepartment?.name,
            role: updatedUser?.role,
            isManager: values.managerFlag,
            bucketSize: Number(values.lockerSize),
            lockerSize: Number(values.lockerSize),
          }),
        );
        requireFulfilled(accountsResponse, "Failed to update user in Accounts");

        const operationsResponse = await dispatch(
          updateUsersInOperations({
            id: rowItem.id,
            data: {
              id: rowItem.id,
              fullName: values.userName,
              email: values.email,
              contactNo: values.contactNo,
              designationId: values.designationId,
              departmentIds: [values.departmentId],
              roleIds:
                accountsResponse?.payload?.userRole?.map((role) => role.id) ||
                [],
              managerId: values.managerId,
              managerFlag: values.managerFlag,
              bucketSize: Number(values.lockerSize),
              lockerSize: Number(values.lockerSize),
            },
          }),
        );
        requireFulfilled(
          operationsResponse,
          "Failed to update user in Operations",
        );

        addToast({
          title: "SUCCESS",
          description: "User updated successfully",
          color: "success",
        });

        setRowItem(null);
      } else {
        const authResponse = await dispatch(
          createNewUserInAuth({
            email: values.email,
            role: values.role,
            designation: values.designationId,
            userName: values.userName,
            department: values.departmentId,
            designationId: values.designationId,
            departmentId: values.departmentId,
            isManager: values.managerFlag,
            bucketSize: Number(values.lockerSize),
            lockerSize: Number(values.lockerSize),
          }),
        );
        requireFulfilled(authResponse, "Failed to create user in Auth");

        const authUser = authResponse?.payload?.data?.data;

        if (!authUser?.userId) {
          throw new Error("Auth user created but userId was not received");
        }

        const hrResponse = await dispatch(
          createUserByHr({
            ...values,
            id: authUser.userId,
            isManager: values.managerFlag,
          }),
        );
        requireFulfilled(hrResponse, "Failed to create user in HR");

        const createdUser = hrResponse?.payload?.data;

        if (!createdUser?.id) {
          throw new Error("HR user created but user details were not received");
        }

        const accountsResponse = await dispatch(
          createUserInAccounts({
            id: createdUser.id,
            username: createdUser.fullName,
            email: createdUser.email,
            designation: createdUser?.userDesignation?.name,
            department: createdUser?.userDepartment?.name,
            role: createdUser.role,
            isManager: values.managerFlag,
            bucketSize: Number(values.lockerSize),
            lockerSize: Number(values.lockerSize),
          }),
        );
        requireFulfilled(accountsResponse, "Failed to create user in Accounts");

        const operationsResponse = await dispatch(
          createUsersInOperations({
            id: createdUser.id,
            fullName: createdUser.fullName,
            email: createdUser.email,
            contactNo: createdUser.contactNo,
            designationId: values.designationId,
            departmentIds: [values.departmentId],
            roleIds: authUser?.role?.map((role) => role.id) || [],
            managerId: values.managerFlag
              ? createdUser?.managers?.id || values.managerId
              : null,
            managerFlag: values.managerFlag,
            bucketSize: Number(values.lockerSize),
            lockerSize: Number(values.lockerSize),
          }),
        );
        requireFulfilled(
          operationsResponse,
          "Failed to create user in Operations",
        );

        addToast({
          title: "SUCCESS",
          description: "User created successfully",
          color: "success",
        });
      }

      onClose();
      reset(defaultValues);
      setFormFlags({
        maritalStatus: false,
        master: false,
      });
      await dispatch(getAllUsers(filteration));
    } catch (error) {
      addToast({
        title: "ERROR",
        description: error?.message || "Something went wrong",
        color: "danger",
      });
    }
  };

  const renderCell = useCallback((rowData, columnKey) => {
    switch (columnKey) {
      case "fullName":
        return (
          <div className="flex items-start gap-2">
            <Avatar size="sm" classNames={{ icon: "text-gray-500" }} />
            <div className="flex flex-col">
              <p className="text-[12.5px] font-normal capitalize">
                {rowData?.fullName || "-"}
              </p>
              <p className="text-[11.5px] font-normal text-default-500">
                Aadhar : {rowData?.aadharCard || "-"}
              </p>
              <p className="text-[11.5px] font-normal text-default-500">
                EMP.ID : {rowData?.employeeId || "-"}
              </p>
            </div>
          </div>
        );
      case "email":
        return (
          <div className="flex flex-col gap-1">
            <span className="text-[12.5px] font-normal">
              {rowData?.email || "Unknown"}
            </span>
            {rowData?.contactNo && (
              <Chip
                size="sm"
                variant="flat"
                startContent={<Phone className="w-3 h-3" />}
              >
                {rowData?.contactNo}
              </Chip>
            )}
            {rowData?.panNumber && (
              <Chip size="sm" variant="flat">
                Pan : {rowData?.panNumber}
              </Chip>
            )}
          </div>
        );
      case "department":
        return (
          <div className="flex flex-col">
            <span className="text-[12.5px] font-normal">
              {rowData?.department || "-"}
            </span>
            <p className="text-[11.5px] font-normal text-default-500">
              {rowData?.designation || "-"}
            </p>
          </div>
        );
      case "role":
        return (
          <div className="flex flex-col">
            <span className="text-[12.5px] font-normal">
              {rowData?.role?.join(",") || "-"}
            </span>
          </div>
        );
      case "experience":
        return (
          <div className="flex flex-col">
            {rowData?.expInYear && (
              <span className="text-[12.5px] font-normal">
                {rowData?.expInYear || "-"} yrs ,{" "}
              </span>
            )}
            {rowData?.expInMonth && (
              <span className="text-[12.5px] font-normal">
                {rowData?.expInMonth || "-"} mos
              </span>
            )}
          </div>
        );
      case "managers":
        return (
          <div className="flex items-center">
            <span className="text-[12.5px] font-normal">
              {rowData?.managers?.fullName || "-"}
            </span>
          </div>
        );
      case "permanentAddress":
        return rowData?.permanentAddress ? (
          <div className="flex flex-col">
            <span className="text-[12.5px] font-normal">
              {rowData?.permanentAddress || "-"}
            </span>
          </div>
        ) : (
          "-"
        );
      case "residentialAddress":
        return rowData?.residentialAddress ? (
          <div className="flex flex-col">
            <span className="text-[12.5px] font-normal">
              {rowData?.residentialAddress || "-"}
            </span>
          </div>
        ) : (
          "-"
        );
      case "fatherInfo":
        return rowData?.fatherName ? (
          <div className="flex flex-col">
            <span className="text-[12.5px] font-normal">
              {rowData?.fatherName || "-"}
            </span>
            <div className="flex flex-col gap-1">
              <span className="text-[11.5px] text-default-500">
                Occupation : {rowData?.fatherOccupation || "-"}
              </span>
              <span className="text-[11.5px] text-default-500">
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
            <span className="text-[12.5px] font-normal">
              {rowData?.motherName || "-"}
            </span>
            <div className="flex flex-col gap-1">
              <span className="text-[11.5px] text-default-500">
                Occupation : {rowData?.motherOccupation || "-"}
              </span>
              <span className="text-[11.5px] text-default-500">
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
            <span className="text-[12.5px] font-normal">
              {rowData?.spouseName || "-"}
            </span>
            <div className="flex flex-col gap-1">
              <span className="text-[11.5px] text-default-500">
                Occupation : {rowData?.spouseOccupation || "-"}
              </span>
              <span className="text-[11.5px] text-default-500">
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
                <EllipsisVertical className="w-4 h-4 text-default-300" />
              </Button>
            </DropdownTrigger>
            <DropdownMenu>
              <DropdownItem key={"edit"} onPress={() => handleEdit(rowData)}>
                Edit
              </DropdownItem>
              {/* <DropdownItem key={"approved"}>Approved</DropdownItem>
              <DropdownItem key={"disapproved"}>Disapproved</DropdownItem> */}
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
            placeholder="Search ..."
            startContent={<Search className="w-4 h-4 text-default-400" />}
            value={filterValue}
            onClear={() => onClear()}
            onValueChange={onSearchChange}
          />
          <div className="flex gap-1.5 flex-wrap">
            <Dropdown>
              <DropdownTrigger className="hidden sm:flex">
                <Button
                  size="sm"
                  variant="flat"
                  endContent={<ChevronDown className="w-3.5 h-3.5" />}
                >
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
            <Button
              size="sm"
              color="primary"
              onPress={() => {
                dispatch(getAllRoles());
                dispatch(getAllDepartment());
                onOpen();
                setRowItem(null);
                reset(defaultValues);
                setFormFlags({
                  maritalStatus: false,
                  master: false,
                });
              }}
              endContent={<Plus className="w-3.5 h-3.5" />}
            >
              Add users
            </Button>
          </div>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-default-400 text-[12.5px]">
            Total {count} users
          </span>
          <label className="flex items-center gap-1 text-default-400 text-[12.5px]">
            Rows per page:
            <select
              className="bg-transparent outline-hidden text-default-400 text-[12.5px] cursor-pointer"
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
      <div className="py-1.5 px-1 flex justify-between items-center">
        <span className="w-[30%] text-[12.5px] text-default-400">
          {selectedKeys === "all"
            ? "All items selected"
            : `${selectedKeys.size} of ${count} selected`}
        </span>
        {/* <Pagination
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
        /> */}
        {/* <div className="hidden sm:flex w-[30%] justify-end gap-2">
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
        </div> */}
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
    <div className="flex flex-col gap-2">
      <h1 className="font-sans text-lg font-semibold mb-2 shrink-0">
        Users list
      </h1>
      <Table
        isHeaderSticky
        removeWrapper={false}
        aria-label="Users table with custom cells, pagination, and sorting"
        bottomContent={bottomContent}
        bottomContentPlacement="outside"
        classNames={{
          base: "gap-2.5",
          wrapper:
            "max-h-[calc(100vh-280px)] w-full overflow-y-auto rounded-lg border border-gray-200 dark:border-white/10 shadow-none p-0",
          table: "w-full",
          thead: "[&>tr]:first:rounded-none",
          th: "h-8 py-0 text-[11.5px] tracking-wide bg-gray-50 dark:bg-neutral-900 text-default-500 first:rounded-none last:rounded-none border-b border-gray-200 dark:border-white/10",
          td: "py-1.5 text-[12.5px]",
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
              <ModalHeader>{rowItem ? "Edit user" : "Add users"}</ModalHeader>
              <form
                onSubmit={handleSubmit(onSubmit, () => {
                  addToast({
                    title: "ERROR",
                    description: "Please fill all required fields correctly",
                    color: "danger",
                  });
                })}
              >
                <ModalBody>
                  <div className="max-h-[60vh] overflow-auto p-4">
                    <div className="grid grid-cols-2 gap-4">
                      <Controller
                        name="employeeId"
                        control={control}
                        render={({ field }) => (
                          <Input
                            label="Employee Id"
                            isRequired
                            value={field.value}
                            onChange={(e) => field.onChange(e.target.value)}
                            errorMessage={errors.employeeId?.message}
                            isInvalid={!!errors.employeeId}
                          />
                        )}
                      />
                      <Controller
                        name="userName"
                        control={control}
                        render={({ field }) => (
                          <Input
                            label="Username"
                            isRequired
                            value={field.value}
                            onChange={(e) => field.onChange(e.target.value)}
                            errorMessage={errors.userName?.message}
                            isInvalid={!!errors.userName}
                          />
                        )}
                      />
                      <Controller
                        name="email"
                        control={control}
                        rules={{
                          validate: (value) =>
                            !value ||
                            isValidEmail(value) ||
                            "Please enter a valid email address",
                        }}
                        render={({ field }) => (
                          <Input
                            label="Email"
                            isRequired
                            type="email"
                            value={field.value}
                            onChange={(e) =>
                              field.onChange(formatEmail(e.target.value))
                            }
                            errorMessage={errors.email?.message}
                            isInvalid={!!errors.email}
                          />
                        )}
                      />
                      <Controller
                        name="personalEmail"
                        control={control}
                        rules={{
                          validate: (value) =>
                            !value ||
                            isValidEmail(value) ||
                            "Please enter a valid email address",
                        }}
                        render={({ field }) => (
                          <Input
                            label="Personal email"
                            type="email"
                            value={field.value}
                            onChange={(e) =>
                              field.onChange(formatEmail(e.target.value))
                            }
                            isInvalid={!!errors.personalEmail}
                            errorMessage={errors.personalEmail?.message}
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
                            onChange={(e) =>
                              field.onChange(allowOnlyNumbers(e.target.value))
                            }
                            maxLength={10}
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
                            onChange={(e) =>
                              field.onChange(allowOnlyNumbers(e.target.value))
                            }
                            maxLength={10}
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
                            selectionMode="single"
                            selectedKeys={field.value ? [field.value] : []}
                            onSelectionChange={(keys) => {
                              const value = Array.from(keys)[0];
                              if (value) {
                                field.onChange(value);
                                setValue("managerId", "");
                                clearErrors("managerId");
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
                            onChange={(e) => field.onChange(e.target.value)}
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
                            maxLength={12}
                            value={field.value}
                            onChange={(e) =>
                              field.onChange(
                                allowOnlyNumbers(e.target.value, 12),
                              )
                            }
                            errorMessage={errors.aadharCard?.message}
                            isInvalid={!!errors.aadharCard}
                          />
                        )}
                      />

                      <Controller
                        name="panNumber"
                        control={control}
                        render={({ field }) => (
                          <Input
                            label="PAN Number"
                            isRequired
                            maxLength={10}
                            value={field.value}
                            onChange={(e) =>
                              field.onChange(formatPANInput(e.target.value))
                            }
                            errorMessage={errors.panNumber?.message}
                            isInvalid={!!errors.panNumber}
                          />
                        )}
                      />

                      <Controller
                        name="managerFlag"
                        control={control}
                        render={({ field }) => (
                          <Select
                            label="Manager Flag"
                            selectedKeys={
                              field.value !== undefined
                                ? [field.value.toString()]
                                : []
                            }
                            onSelectionChange={(keys) => {
                              const value = Array.from(keys)[0];
                              if (value !== undefined) {
                                field.onChange(value === "true");
                              }
                            }}
                          >
                            <SelectItem key="true" value="true">
                              True
                            </SelectItem>
                            <SelectItem key="false" value="false">
                              False
                            </SelectItem>
                          </Select>
                        )}
                      />

                      <Controller
                        name="managerId"
                        control={control}
                        render={({ field }) => (
                          <Select
                            label="Manager name"
                            isRequired
                            selectedKeys={field.value ? [field.value] : []}
                            onSelectionChange={(keys) => {
                              const value = Array.from(keys)[0];
                              field.onChange(
                                value !== undefined ? String(value) : "",
                              );
                            }}
                            isInvalid={!!errors.managerId}
                            errorMessage={errors.managerId?.message}
                          >
                            {managerListById?.length > 0 ? (
                              managerListById.map((item) => (
                                <SelectItem
                                  key={String(item.id)}
                                  value={String(item.id)}
                                >
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
                            onChange={(e) => field.onChange(e.target.value)}
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
                            onChange={(e) =>
                              field.onChange(allowOnlyNumbers(e.target.value))
                            }
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
                            type="number"
                            value={field.value}
                            onChange={(e) => {
                              let value = allowOnlyNumbers(e.target.value);
                              if (value > 12) value = String(12);
                              field.onChange(value);
                            }}
                            errorMessage={errors.expInMonth?.message}
                            isInvalid={!!errors.expInMonth}
                          />
                        )}
                      />

                      <Controller
                        name="dateOfJoining"
                        control={control}
                        render={({ field }) => {
                          return (
                            <DatePicker
                              label="Date of joining"
                              isRequired
                              value={
                                field.value &&
                                /^\d{4}-\d{2}-\d{2}$/.test(field.value)
                                  ? parseDate(field.value)
                                  : null
                              }
                              onChange={(value) => {
                                const iso = value ? value.toString() : "";
                                field.onChange(iso);
                              }}
                              errorMessage={errors.dateOfJoining?.message}
                              isInvalid={!!errors.dateOfJoining}
                            />
                          );
                        }}
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
                              if (value) {
                                field.onChange(value);
                                setFormFlags((prev) => ({
                                  ...prev,
                                  maritalStatus: value,
                                }));
                              }
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

                      {formFlags?.maritalStatus === "Married" && (
                        <>
                          <Controller
                            name="spouseName"
                            control={control}
                            render={({ field }) => (
                              <Input
                                label="Spouse name"
                                isRequired
                                value={field.value}
                                onChange={(e) => field.onChange(e.target.value)}
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
                                maxLength={10}
                                value={field.value}
                                onChange={(e) =>
                                  field.onChange(
                                    allowOnlyNumbers(e.target.value),
                                  )
                                }
                              />
                            )}
                          />
                        </>
                      )}

                      <Controller
                        name="fatherName"
                        control={control}
                        render={({ field }) => (
                          <Input
                            label="Father's name"
                            isRequired
                            value={field.value}
                            onChange={(e) => field.onChange(e.target.value)}
                            errorMessage={errors.fatherName?.message}
                            isInvalid={!!errors.fatherName}
                          />
                        )}
                      />

                      <Controller
                        name="fatherOccupation"
                        control={control}
                        render={({ field }) => (
                          <Input
                            label="Father's occupation"
                            value={field.value}
                            onChange={(e) => field.onChange(e.target.value)}
                          />
                        )}
                      />

                      <Controller
                        name="fatherContactNo"
                        control={control}
                        render={({ field }) => (
                          <Input
                            label="Father's contact no."
                            maxLength={10}
                            value={field.value}
                            onChange={(e) =>
                              field.onChange(allowOnlyNumbers(e.target.value))
                            }
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
                            onChange={(e) => field.onChange(e.target.value)}
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
                            maxLength={10}
                            value={field.value}
                            onChange={(e) =>
                              field.onChange(allowOnlyNumbers(e.target.value))
                            }
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
                            onChange={(e) => field.onChange(e.target.value)}
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
                            onChange={(e) => field.onChange(e.target.value)}
                          />
                        )}
                      />

                      {formFlags?.master && (
                        <>
                          <Controller
                            name="master"
                            control={control}
                            render={({ field }) => (
                              <Select
                                label="Master"
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

                      <Controller
                        name="emergencyNumber"
                        control={control}
                        render={({ field }) => (
                          <Input
                            label="Emergency contact no."
                            value={field.value}
                            onChange={(e) =>
                              field.onChange(allowOnlyNumbers(e.target.value))
                            }
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
                            onChange={(e) => field.onChange(e.target.value)}
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
                            onChange={(e) => field.onChange(e.target.value)}
                          />
                        )}
                      />

                      <div />
                    </div>
                  </div>
                </ModalBody>
                <ModalFooter>
                  <Button onPress={onClose} isDisabled={isSubmitting}>
                    Cancel
                  </Button>
                  <Button
                    color="primary"
                    type="submit"
                    isLoading={isSubmitting}
                    isDisabled={isSubmitting}
                  >
                    {isSubmitting
                      ? rowItem
                        ? "Updating..."
                        : "Submitting..."
                      : rowItem
                        ? "Update"
                        : "Submit"}
                  </Button>
                </ModalFooter>
              </form>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
};

export default UsersList;
