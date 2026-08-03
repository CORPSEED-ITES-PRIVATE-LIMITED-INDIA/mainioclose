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
import { getAllDepartment } from "../toolkit/slices/settingSlice";
import {
  CalendarDate,
  getLocalTimeZone,
  parseDate,
  today,
} from "@internationalized/date";
import dayjs from "dayjs";

/* -------------------------------------------------------------------------- */
/*  Date helpers                                                              */
/* -------------------------------------------------------------------------- */
/*
  The crash came from here. `parseDate()` THROWS on anything that is not a
  strict "YYYY-MM-DD" string, and it was being called during render. While you
  type in a DatePicker, HeroUI fires onChange with `null` (incomplete date), the
  old handler built the string `"undefined-NaN-NaN"`, stored it in the form, and
  the next render called parseDate on it -> uncaught throw -> blank page.
  These two helpers never throw, so a half typed date can no longer kill the UI.
*/
const toCalendarDate = (value) => {
  if (!value) return null;
  try {
    if (typeof value === "object" && "year" in value) return value;
    const iso = dayjs(value).isValid()
      ? dayjs(value).format("YYYY-MM-DD")
      : String(value);
    return parseDate(iso);
  } catch {
    return null;
  }
};

const fromCalendarDate = (value) => {
  if (!value || !value.year || !value.month || !value.day) return "";
  try {
    return `${value.year}-${String(value.month).padStart(2, "0")}-${String(
      value.day,
    ).padStart(2, "0")}`;
  } catch {
    return "";
  }
};

const TODAY = today(getLocalTimeZone());
const MIN_DOB = new CalendarDate(1940, 1, 1);
const MIN_JOINING = new CalendarDate(1980, 1, 1);

// Never let `String(undefined)` -> "undefined" leak into an input.
const str = (v) => (v === null || v === undefined ? "" : String(v));

/* -------------------------------------------------------------------------- */
/*  Table config                                                              */
/* -------------------------------------------------------------------------- */
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

const INITIAL_VISIBLE_COLUMNS = [
  "fullName",
  "email",
  "department",
  "role",
  "experience",
  "managers",
  "actions",
];

function capitalize(s) {
  return s ? s.charAt(0).toUpperCase() + s.slice(1).toLowerCase() : "";
}

/* -------------------------------------------------------------------------- */
/*  Validation schema                                                         */
/* -------------------------------------------------------------------------- */
/*
  One static schema instead of `formSchema(flags)`. The conditional spouse rule
  lives in superRefine, so the resolver identity is stable and you no longer
  need the `setFormFlags` + `reset(getValues())` dance (that effect was wiping
  values and re-rendering the whole form on every marital status change).
*/
const optionalText = z.string().trim().optional().or(z.literal(""));

const optionalPhone = z
  .string()
  .trim()
  .regex(/^\d{10}$/, "Enter a valid 10 digit number")
  .optional()
  .or(z.literal(""));

const formSchema = z
  .object({
    employeeId: z.string().trim().min(1, "Please enter employee id"),
    userName: z.string().trim().min(2, "Please enter username"),
    email: z.string().trim().email("Please enter a valid email"),
    personalEmail: z
      .string()
      .trim()
      .email("Please enter a valid personal email")
      .optional()
      .or(z.literal("")),
    contactNo: z
      .string()
      .trim()
      .regex(/^\d{10}$/, "Please enter a valid 10 digit contact number"),
    companyMobile: optionalPhone,
    role: z.array(z.string()).min(1, "Please select at least one role"),
    departmentId: z.string().min(1, "Please select a department"),
    designationId: z.string().min(1, "Please select a designation"),
    epfNo: optionalText,
    aadharCard: z
      .string()
      .trim()
      .regex(/^\d{12}$/, "Aadhar number must be 12 digits"),
    panNumber: z
      .string()
      .trim()
      .regex(/^[A-Z]{5}[0-9]{4}[A-Z]$/, "Enter a valid PAN (e.g. ABCDE1234F)"),
    managerId: optionalText,
    lockerSize: optionalText,
    expInYear: z
      .string()
      .trim()
      .regex(/^\d{1,2}$/, "Enter experience in years (0-99)"),
    expInMonth: z
      .string()
      .trim()
      .regex(/^(0?[0-9]|1[01])$/, "Enter months between 0 and 11"),
    dateOfBirth: z.string().min(1, "Please select date of birth"),
    dateOfJoining: z.string().min(1, "Please select date of joining"),
    type: z.string().min(1, "Please select the gender"),
    maritalStatus: z.string().min(1, "Please select the marital status"),
    spouseName: optionalText,
    spouseContactNo: optionalPhone,
    fatherName: z.string().trim().min(1, "Please enter father's name"),
    fatherOccupation: optionalText,
    fatherContactNo: optionalPhone,
    motherName: z.string().trim().min(1, "Please enter mother's name"),
    motherOccupation: optionalText,
    motherContactNo: optionalPhone,
    nationality: optionalText,
    language: optionalText,
    master: z.boolean().optional(),
    backupTeam: z.boolean().optional(),
    emergencyNumber: optionalPhone,
    permanentAddress: z
      .string()
      .trim()
      .min(1, "Please enter permanent address"),
    residentialAddress: optionalText,
  })
  .superRefine((values, ctx) => {
    if (values.maritalStatus === "Married" && !values.spouseName?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["spouseName"],
        message: "Please enter spouse name",
      });
    }
    if (
      values.dateOfBirth &&
      values.dateOfJoining &&
      dayjs(values.dateOfJoining).isBefore(dayjs(values.dateOfBirth))
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["dateOfJoining"],
        message: "Joining date cannot be before date of birth",
      });
    }
  });

/*
  Every key the form touches must exist here, otherwise the input starts
  uncontrolled and React logs "changing an uncontrolled input to be controlled"
  (employeeId, panNumber and motherOccupation were missing before). No `null`
  defaults either - zod string rules reject null.
*/
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
  lockerSize: "",
  expInYear: "",
  expInMonth: "",
  dateOfBirth: "",
  dateOfJoining: "",
  type: "",
  maritalStatus: "",
  spouseName: "",
  spouseContactNo: "",
  fatherName: "",
  fatherOccupation: "",
  fatherContactNo: "",
  motherName: "",
  motherOccupation: "",
  motherContactNo: "",
  nationality: "",
  language: "",
  master: false,
  backupTeam: false,
  emergencyNumber: "",
  permanentAddress: "",
  residentialAddress: "",
};

/* -------------------------------------------------------------------------- */
/*  Small field wrappers - guarantee every field renders its own error         */
/* -------------------------------------------------------------------------- */
const TextField = ({
  control,
  name,
  label,
  isRequired,
  multiline,
  transform,
  ...rest
}) => {
  const Component = multiline ? Textarea : Input;
  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => (
        <Component
          {...rest}
          label={label}
          isRequired={isRequired}
          value={field.value ?? ""}
          onValueChange={(v) => field.onChange(transform ? transform(v) : v)}
          onBlur={field.onBlur}
          isInvalid={!!fieldState.error}
          errorMessage={fieldState.error?.message}
        />
      )}
    />
  );
};

const SelectField = ({
  control,
  name,
  label,
  isRequired,
  items = [],
  emptyLabel = "No options available",
  multiple = false,
  onAfterChange,
}) => (
  <Controller
    name={name}
    control={control}
    render={({ field, fieldState }) => (
      <Select
        label={label}
        isRequired={isRequired}
        selectionMode={multiple ? "multiple" : "single"}
        selectedKeys={
          multiple
            ? new Set((field.value ?? []).map(String))
            : field.value
              ? new Set([String(field.value)])
              : new Set()
        }
        onSelectionChange={(keys) => {
          const arr = Array.from(keys);
          const next = multiple ? arr : (arr[0] ?? "");
          field.onChange(next);
          onAfterChange?.(next);
        }}
        onBlur={field.onBlur}
        isInvalid={!!fieldState.error}
        errorMessage={fieldState.error?.message}
      >
        {items.length > 0 ? (
          items.map((item) => (
            <SelectItem key={String(item.value)}>{item.label}</SelectItem>
          ))
        ) : (
          <SelectItem key="__empty" isDisabled>
            {emptyLabel}
          </SelectItem>
        )}
      </Select>
    )}
  />
);

const DateField = ({
  control,
  name,
  label,
  isRequired,
  minValue,
  maxValue,
}) => (
  <Controller
    name={name}
    control={control}
    render={({ field, fieldState }) => (
      <DatePicker
        label={label}
        isRequired={isRequired}
        // this is the prop you were asking about - gives dropdowns for
        // month + year so a 1990 birth date is 2 clicks, not 400 arrow presses
        showMonthAndYearPickers
        granularity="day"
        minValue={minValue}
        maxValue={maxValue}
        value={toCalendarDate(field.value)}
        onChange={(value) => field.onChange(fromCalendarDate(value))}
        onBlur={field.onBlur}
        isInvalid={!!fieldState.error}
        errorMessage={fieldState.error?.message}
      />
    )}
  />
);

const BooleanSelect = ({ control, name, label }) => (
  <Controller
    name={name}
    control={control}
    render={({ field, fieldState }) => (
      <Select
        label={label}
        selectedKeys={new Set([String(!!field.value)])}
        onSelectionChange={(keys) => {
          const value = Array.from(keys)[0];
          if (value !== undefined) field.onChange(value === "true");
        }}
        isInvalid={!!fieldState.error}
        errorMessage={fieldState.error?.message}
      >
        <SelectItem key="true">Yes</SelectItem>
        <SelectItem key="false">No</SelectItem>
      </Select>
    )}
  />
);

/* -------------------------------------------------------------------------- */
/*  Component                                                                 */
/* -------------------------------------------------------------------------- */
const UsersList = () => {
  const dispatch = useDispatch();
  const data = useSelector((state) => state.common.usersList || []);
  // NOTE: this is the length of the current page, not the server total.
  // If your API returns a total, read it here so pagination is accurate.
  const count = useSelector((state) => state.common.usersList?.length || 0);
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
  const [filteration, setFilteration] = useState({ page: 1, size: 50 });
  const [rowItem, setRowItem] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const hasSearchFilter = Boolean(filterValue);

  useEffect(() => {
    dispatch(getAllUsers(filteration));
  }, [dispatch, filteration]);

  const { control, handleSubmit, reset, watch, setValue } = useForm({
    resolver: zodResolver(formSchema),
    defaultValues,
    mode: "onTouched", // validate on blur, then live - errors show under the field
  });

  const maritalStatus = watch("maritalStatus");
  const isMarried = maritalStatus === "Married";

  /* ----------------------------- derived data ---------------------------- */
  const headerColumns = useMemo(() => {
    if (visibleColumns === "all") return columns;
    return columns.filter((column) =>
      Array.from(visibleColumns).includes(column.uid),
    );
  }, [visibleColumns]);

  const filteredItems = useMemo(() => {
    if (!hasSearchFilter) return [...data];
    const needle = filterValue.toLowerCase();
    return data.filter((item) =>
      Object.values(item || {}).some((val) =>
        String(val ?? "")
          .toLowerCase()
          .includes(needle),
      ),
    );
  }, [data, filterValue, hasSearchFilter]);

  const pages = Math.max(1, Math.ceil(count / filteration.size));

  const sortedItems = useMemo(() => {
    return [...filteredItems].sort((a, b) => {
      const first = a?.[sortDescriptor.column] ?? "";
      const second = b?.[sortDescriptor.column] ?? "";
      const cmp = first < second ? -1 : first > second ? 1 : 0;
      return sortDescriptor.direction === "descending" ? -cmp : cmp;
    });
  }, [sortDescriptor, filteredItems]);

  const roleItems = useMemo(
    () => allRoles.map((r) => ({ label: r.name, value: r.name })),
    [allRoles],
  );
  const departmentItems = useMemo(
    () => departmentList.map((d) => ({ label: d.name, value: String(d.id) })),
    [departmentList],
  );
  const designationItems = useMemo(
    () =>
      allDesiginationListById.map((d) => ({
        label: d.name,
        value: String(d.id),
      })),
    [allDesiginationListById],
  );
  const managerItems = useMemo(
    () =>
      managerListById.map((m) => ({ label: m.fullName, value: String(m.id) })),
    [managerListById],
  );

  /* ------------------------------- handlers ------------------------------ */
  const handleAdd = useCallback(() => {
    dispatch(getAllRoles());
    dispatch(getAllDepartment());
    setRowItem(null);
    reset(defaultValues);
    onOpen();
  }, [dispatch, reset, onOpen]);

  const handleEdit = useCallback(
    (row) => {
      dispatch(getAllRoles());
      dispatch(getAllDepartment());
      if (row?.userDepartment?.id) {
        dispatch(getDesiginationById(row.userDepartment.id));
        dispatch(getManagerById(row.userDepartment.id));
      }

      reset({
        ...defaultValues,
        employeeId: str(row?.employeeId),
        userName: str(row?.fullName),
        email: str(row?.email),
        personalEmail: str(row?.personalEmail),
        contactNo: str(row?.contactNo),
        companyMobile: str(row?.companyMobile),
        role: Array.isArray(row?.role) ? row.role : [],
        departmentId: str(row?.userDepartment?.id),
        designationId: str(row?.userDesignation?.id),
        epfNo: str(row?.epfNo),
        aadharCard: str(row?.aadharCard),
        panNumber: str(row?.panNumber).toUpperCase(),
        managerId: str(row?.managers?.id),
        lockerSize: str(row?.lockerSize),
        expInYear: str(row?.expInYear),
        expInMonth: str(row?.expInMonth),
        dateOfBirth: row?.dateOfBirth
          ? dayjs(row.dateOfBirth).format("YYYY-MM-DD")
          : "",
        dateOfJoining: row?.dateOfJoining
          ? dayjs(row.dateOfJoining).format("YYYY-MM-DD")
          : "",
        type: str(row?.type),
        maritalStatus: str(row?.maritalStatus),
        spouseName: str(row?.spouseName),
        spouseContactNo: str(row?.spouseContactNo),
        fatherName: str(row?.fatherName),
        fatherOccupation: str(row?.fatherOccupation),
        fatherContactNo: str(row?.fatherContactNo),
        motherName: str(row?.motherName),
        motherOccupation: str(row?.motherOccupation),
        motherContactNo: str(row?.motherContactNo),
        nationality: str(row?.nationality),
        language: str(row?.language),
        master: !!row?.master,
        backupTeam: !!row?.backupTeam,
        emergencyNumber: str(row?.emergencyNumber),
        permanentAddress: str(row?.permanentAddress),
        residentialAddress: str(row?.residentialAddress),
      });

      setRowItem(row);
      onOpen();
    },
    [dispatch, reset, onOpen],
  );

  const closeForm = useCallback(() => {
    setRowItem(null);
    reset(defaultValues);
    onClose();
  }, [reset, onClose]);

  const refetch = useCallback(
    () => dispatch(getAllUsers(filteration)),
    [dispatch, filteration],
  );

  const fail = (title = "Something went wrong.") =>
    addToast({ title, color: "danger" });

  const onSubmit = async (values) => {
    setIsSubmitting(true);
    try {
      if (rowItem) {
        const payload = { ...values, id: rowItem.id };
        const authRes = await dispatch(
          updateUserData({
            id: rowItem.id,
            userName: values.userName,
            email: values.email,
            designationId: values.designationId,
            departmentId: values.departmentId,
            role: values.role,
          }),
        );
        if (authRes.meta.requestStatus !== "fulfilled") return fail();

        const hrRes = await dispatch(updateLeadByHr(payload));
        if (hrRes.meta.requestStatus !== "fulfilled") return fail();

        addToast({ title: "User updated.", color: "success" });
        closeForm();
        refetch();
      } else {
        const authRes = await dispatch(
          createNewUserInAuth({
            email: values.email,
            role: values.role,
            userName: values.userName,
            designation: values.designationId,
            designationId: values.designationId,
            department: values.departmentId,
            departmentId: values.departmentId,
          }),
        );
        if (authRes.meta.requestStatus !== "fulfilled") return fail();

        const createdId = authRes?.payload?.data?.data?.userId;
        const hrRes = await dispatch(
          createUserByHr({ id: createdId, ...values }),
        );
        if (hrRes.meta.requestStatus !== "fulfilled") return fail();

        addToast({ title: "User created.", color: "success" });
        closeForm();
        refetch();
      }
    } catch {
      fail();
    } finally {
      setIsSubmitting(false);
    }
  };

  // Fires when zod rejects. RHF focuses the first invalid field for you, this
  // just tells the user why nothing happened when they hit Submit.
  const onInvalid = (formErrors) => {
    const first = Object.values(formErrors)[0];
    addToast({
      title: first?.message || "Please fill all the required fields.",
      color: "danger",
    });
  };

  /* ------------------------------ table cells ---------------------------- */
  const renderCell = useCallback(
    (rowData, columnKey) => {
      switch (columnKey) {
        case "fullName":
          return (
            <div className="flex items-start gap-2">
              <Avatar size="sm" classNames={{ icon: "text-gray-500" }} />
              <div className="flex flex-col">
                <p className="font-normal capitalize">
                  {rowData?.fullName || "-"}
                </p>
                <p className="font-normal text-xs text-default-500">
                  Aadhar : {rowData?.aadharCard || "-"}
                </p>
                <p className="font-normal text-xs text-default-500">
                  EMP.ID : {rowData?.employeeId || "-"}
                </p>
              </div>
            </div>
          );
        case "email":
          return (
            <div className="flex flex-col gap-1 items-start">
              <span className="font-normal">{rowData?.email || "Unknown"}</span>
              {rowData?.contactNo && (
                <Chip
                  size="sm"
                  className="text-tiny"
                  variant="flat"
                  startContent={<Phone className="h-3 w-3" />}
                >
                  {rowData.contactNo}
                </Chip>
              )}
              {rowData?.panNumber && (
                <Chip size="sm" className="text-tiny" variant="flat">
                  PAN : {rowData.panNumber}
                </Chip>
              )}
            </div>
          );
        case "department":
          return (
            <div className="flex flex-col">
              <span className="font-normal">{rowData?.department || "-"}</span>
              <p className="font-normal text-xs text-default-500">
                {rowData?.designation || "-"}
              </p>
            </div>
          );
        case "role":
          return (
            <span className="font-normal">
              {Array.isArray(rowData?.role) ? rowData.role.join(", ") : "-"}
            </span>
          );
        case "experience": {
          const y = rowData?.expInYear;
          const m = rowData?.expInMonth;
          if (!y && !m) return "-";
          return (
            <span className="font-normal">
              {y ? `${y} yrs` : ""}
              {y && m ? ", " : ""}
              {m ? `${m} mos` : ""}
            </span>
          );
        }
        case "managers":
          return (
            <span className="font-normal">
              {rowData?.managers?.fullName || "-"}
            </span>
          );
        case "permanentAddress":
          return rowData?.permanentAddress || "-";
        case "residentialAddress":
          return rowData?.residentialAddress || "-";
        case "fatherInfo":
          return rowData?.fatherName ? (
            <div className="flex flex-col">
              <span className="font-normal">{rowData.fatherName}</span>
              <span className="text-default-500 text-xs">
                Occupation : {rowData?.fatherOccupation || "-"}
              </span>
              <span className="text-default-500 text-xs">
                Contact : {rowData?.fatherContactNo || "-"}
              </span>
            </div>
          ) : (
            "-"
          );
        case "motherInfo":
          return rowData?.motherName ? (
            <div className="flex flex-col">
              <span className="font-normal">{rowData.motherName}</span>
              <span className="text-default-500 text-xs">
                Occupation : {rowData?.motherOccupation || "-"}
              </span>
              <span className="text-default-500 text-xs">
                Contact : {rowData?.motherContactNo || "-"}
              </span>
            </div>
          ) : (
            "-"
          );
        case "spouseInfo":
          return rowData?.spouseName ? (
            <div className="flex flex-col">
              <span className="font-normal">{rowData.spouseName}</span>
              <span className="text-default-500 text-xs">
                Contact : {rowData?.spouseContactNo || "-"}
              </span>
            </div>
          ) : (
            "-"
          );
        case "backupTeam":
          return rowData?.backupTeam ? "Yes" : "No";
        case "actions":
          return (
            <Dropdown>
              <DropdownTrigger>
                <Button size="sm" isIconOnly variant="light">
                  <EllipsisVertical />
                </Button>
              </DropdownTrigger>
              <DropdownMenu aria-label="User actions">
                <DropdownItem key="edit" onPress={() => handleEdit(rowData)}>
                  Edit
                </DropdownItem>
                <DropdownItem key="approved">Approved</DropdownItem>
                <DropdownItem key="disapproved">Disapproved</DropdownItem>
              </DropdownMenu>
            </Dropdown>
          );
        default:
          return rowData?.[columnKey] ?? "-";
      }
    },
    [handleEdit], // was missing -> Edit used a stale handler
  );

  /* ------------------------------ pagination ----------------------------- */
  const onNextPage = useCallback(() => {
    setFilteration((prev) =>
      prev.page < pages ? { ...prev, page: prev.page + 1 } : prev,
    );
  }, [pages]);

  const onPreviousPage = useCallback(() => {
    setFilteration((prev) =>
      prev.page > 1 ? { ...prev, page: prev.page - 1 } : prev,
    );
  }, []);

  const onRowsPerPageChange = useCallback((e) => {
    setFilteration({ size: Number(e.target.value), page: 1 });
  }, []);

  const onSearchChange = useCallback((value) => {
    setFilterValue(value || "");
    setFilteration((prev) => ({ ...prev, page: 1 }));
  }, []);

  const topContent = useMemo(
    () => (
      <div className="flex flex-col gap-4">
        <div className="flex justify-between gap-3 items-end">
          <Input
            isClearable
            className="w-full sm:max-w-[35%]"
            placeholder="Search ..."
            startContent={<Search />}
            value={filterValue}
            onClear={() => onSearchChange("")}
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
            <Button color="primary" onPress={handleAdd} endContent={<Plus />}>
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
              value={filteration.size}
            >
              <option value="5">5</option>
              <option value="15">15</option>
              <option value="25">25</option>
              <option value="50">50</option>
            </select>
          </label>
        </div>
      </div>
    ),
    [
      filterValue,
      visibleColumns,
      onRowsPerPageChange,
      onSearchChange,
      handleAdd,
      count,
      filteration.size,
    ],
  );

  const bottomContent = useMemo(
    () => (
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
          page={filteration.page}
          total={pages}
          // the useEffect above refetches on filteration change,
          // dispatching here too caused a duplicate request
          onChange={(page) => setFilteration((prev) => ({ ...prev, page }))}
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
    ),
    [selectedKeys, count, filteration.page, pages, onPreviousPage, onNextPage],
  );

  /* -------------------------------- render ------------------------------- */
  return (
    <>
      <h1 className="font-sans text-2xl font-medium mb-1">Users list</h1>
      <Table
        isHeaderSticky
        aria-label="Users table with custom cells, pagination, and sorting"
        bottomContent={bottomContent}
        bottomContentPlacement="outside"
        classNames={{
          wrapper: "2xl:max-h-[68vh] md:max-h-[62vh] w-full",
          table: "w-full",
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
        <TableBody emptyContent="No data found" items={sortedItems}>
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
          <>
            <ModalHeader>{rowItem ? "Edit user" : "Add users"}</ModalHeader>
            <form onSubmit={handleSubmit(onSubmit, onInvalid)} noValidate>
              <ModalBody>
                <div className="max-h-[60vh] overflow-auto p-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <TextField
                      control={control}
                      name="employeeId"
                      label="Employee id"
                      isRequired
                    />
                    <TextField
                      control={control}
                      name="userName"
                      label="Username"
                      isRequired
                    />
                    <TextField
                      control={control}
                      name="email"
                      label="Email"
                      type="email"
                      isRequired
                    />
                    <TextField
                      control={control}
                      name="personalEmail"
                      label="Personal email"
                      type="email"
                    />
                    <TextField
                      control={control}
                      name="contactNo"
                      label="Contact number"
                      isRequired
                      maxLength={10}
                      inputMode="numeric"
                      transform={(v) => v.replace(/\D/g, "")}
                    />
                    <TextField
                      control={control}
                      name="companyMobile"
                      label="Company mobile number"
                      maxLength={10}
                      inputMode="numeric"
                      transform={(v) => v.replace(/\D/g, "")}
                    />

                    <SelectField
                      control={control}
                      name="role"
                      label="Role"
                      isRequired
                      multiple
                      items={roleItems}
                      emptyLabel="No roles available"
                    />
                    <SelectField
                      control={control}
                      name="departmentId"
                      label="Department"
                      isRequired
                      items={departmentItems}
                      emptyLabel="No departments available"
                      onAfterChange={(value) => {
                        // department drives these two lists, so reset them
                        setValue("designationId", "", {
                          shouldValidate: false,
                        });
                        setValue("managerId", "", { shouldValidate: false });
                        if (value) {
                          dispatch(getDesiginationById(value));
                          dispatch(getManagerById(value));
                        }
                      }}
                    />
                    <SelectField
                      control={control}
                      name="designationId"
                      label="Designation"
                      isRequired
                      items={designationItems}
                      emptyLabel="Select a department first"
                    />
                    <SelectField
                      control={control}
                      name="managerId"
                      label="Manager name"
                      items={managerItems}
                      emptyLabel="No managers available"
                    />

                    <TextField
                      control={control}
                      name="epfNo"
                      label="EPFO number"
                    />
                    <TextField
                      control={control}
                      name="aadharCard"
                      label="Aadhar card no."
                      isRequired
                      maxLength={12}
                      inputMode="numeric"
                      transform={(v) => v.replace(/\D/g, "")}
                    />
                    <TextField
                      control={control}
                      name="panNumber"
                      label="PAN number"
                      isRequired
                      maxLength={10}
                      transform={(v) => v.toUpperCase().replace(/\s/g, "")}
                    />
                    <TextField
                      control={control}
                      name="lockerSize"
                      label="Locker size"
                    />

                    <TextField
                      control={control}
                      name="expInYear"
                      label="Experience (in years)"
                      isRequired
                      maxLength={2}
                      inputMode="numeric"
                      transform={(v) => v.replace(/\D/g, "")}
                    />
                    <TextField
                      control={control}
                      name="expInMonth"
                      label="Experience (in months)"
                      isRequired
                      maxLength={2}
                      inputMode="numeric"
                      transform={(v) => v.replace(/\D/g, "")}
                    />

                    <DateField
                      control={control}
                      name="dateOfBirth"
                      label="Date of birth"
                      isRequired
                      minValue={MIN_DOB}
                      maxValue={TODAY}
                    />
                    <DateField
                      control={control}
                      name="dateOfJoining"
                      label="Date of joining"
                      isRequired
                      minValue={MIN_JOINING}
                    />

                    <SelectField
                      control={control}
                      name="type"
                      label="Gender"
                      isRequired
                      items={[
                        { label: "Male", value: "male" },
                        { label: "Female", value: "female" },
                        { label: "Others", value: "others" },
                      ]}
                    />
                    <SelectField
                      control={control}
                      name="maritalStatus"
                      label="Marital status"
                      isRequired
                      items={[
                        { label: "Married", value: "Married" },
                        { label: "Unmarried", value: "Unmarried" },
                      ]}
                      onAfterChange={(value) => {
                        if (value !== "Married") {
                          setValue("spouseName", "");
                          setValue("spouseContactNo", "");
                        }
                      }}
                    />

                    {isMarried && (
                      <>
                        <TextField
                          control={control}
                          name="spouseName"
                          label="Spouse name"
                          isRequired
                        />
                        <TextField
                          control={control}
                          name="spouseContactNo"
                          label="Spouse contact number"
                          maxLength={10}
                          inputMode="numeric"
                          transform={(v) => v.replace(/\D/g, "")}
                        />
                      </>
                    )}

                    <TextField
                      control={control}
                      name="fatherName"
                      label="Father's name"
                      isRequired
                    />
                    <TextField
                      control={control}
                      name="fatherOccupation"
                      label="Father's occupation"
                    />
                    <TextField
                      control={control}
                      name="fatherContactNo"
                      label="Father's contact no."
                      maxLength={10}
                      inputMode="numeric"
                      transform={(v) => v.replace(/\D/g, "")}
                    />
                    <TextField
                      control={control}
                      name="motherName"
                      label="Mother's name"
                      isRequired
                    />
                    <TextField
                      control={control}
                      name="motherOccupation"
                      label="Mother's occupation"
                    />
                    <TextField
                      control={control}
                      name="motherContactNo"
                      label="Mother's contact no."
                      maxLength={10}
                      inputMode="numeric"
                      transform={(v) => v.replace(/\D/g, "")}
                    />

                    <TextField
                      control={control}
                      name="nationality"
                      label="Nationality"
                    />
                    <TextField
                      control={control}
                      name="language"
                      label="Language"
                    />
                    <TextField
                      control={control}
                      name="emergencyNumber"
                      label="Emergency contact no."
                      maxLength={10}
                      inputMode="numeric"
                      transform={(v) => v.replace(/\D/g, "")}
                    />

                    <BooleanSelect
                      control={control}
                      name="master"
                      label="Master"
                    />
                    <BooleanSelect
                      control={control}
                      name="backupTeam"
                      label="Backup team"
                    />

                    <TextField
                      control={control}
                      name="permanentAddress"
                      label="Permanent address"
                      isRequired
                      multiline
                    />
                    <TextField
                      control={control}
                      name="residentialAddress"
                      label="Residential address"
                      multiline
                    />
                  </div>
                </div>
              </ModalBody>
              <ModalFooter>
                <Button variant="flat" onPress={closeForm}>
                  Cancel
                </Button>
                <Button color="primary" type="submit" isLoading={isSubmitting}>
                  {rowItem ? "Save changes" : "Create user"}
                </Button>
              </ModalFooter>
            </form>
          </>
        </ModalContent>
      </Modal>
    </>
  );
};

export default UsersList;
