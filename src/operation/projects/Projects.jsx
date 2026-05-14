import React, { useCallback, useEffect, useState } from "react";
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Input,
  Button,
  DropdownTrigger,
  Dropdown,
  DropdownMenu,
  DropdownItem,
  Pagination,
  useDisclosure,
  Modal,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  DatePicker,
  Select,
  SelectItem,
  Textarea,
  addToast,
  Chip,
  Progress,
} from "@heroui/react";
import { useDispatch, useSelector } from "react-redux";
import {
  ChevronDown,
  Plus,
  Search,
  FilePlus,
  FolderOpenDot,
  RefreshCw,
  CircleCheckBig,
  Eye,
  Filter,
} from "lucide-react";
import { Link, useParams } from "react-router-dom";
import {
  createProjectsForOperations,
  getAllOperationsProject,
  getAllProjectsForOperations,
  getTotalCountForOperationProjects,
  searchByCompany,
  searchByContactName,
  searchByProjectName,
  searchByProjectNumber,
} from "../../toolkit/slices/operationSlice";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import NewSelect from "../../components/NewSelect";
import {
  getAllCitiesByStateName,
  getAllCountries,
  getAllStatesByCountryName,
  getAllUsers,
} from "../../toolkit/slices/commonSlice";
import {
  getLocalTimeZone,
  parseDate,
  toCalendarDate,
  today,
} from "@internationalized/date";
import { inrCurrency } from "../../common";
import { getEstimeteByEstimateNumber } from "../../toolkit/slices/accountSlice";
import NewEstimatePreview from "../../sales/leads/leadEstimate/NewEstimatePreview";

export const columns = [
  { name: "ID", uid: "id" },
  { name: "PROJECT NO.", uid: "projectNo" },
  { name: "SERVICE NAME", uid: "name" },
  { name: "COMPANY NAME", uid: "companyName" },
  { name: "SALES PERSON", uid: "salesPersonName" },
  { name: "UNBILL NO.", uid: "unbilledNumber" },
  { name: "ESTIMATE NO.", uid: "estimateNumber" },
  { name: "DATE", uid: "date" },
  { name: "MILESTONE", uid: "mileStone" },
  // { name: "AMOUNT", uid: "amount" },
  // { name: "DUE AMOUNT", uid: "dueAmount" },
  { name: "STATUS", uid: "status" },
  { name: "ACTION", uid: "actions" },
  { name: "ADDRESS", uid: "address" },
];

export function capitalize(s) {
  return s ? s.charAt(0).toUpperCase() + s.slice(1).toLowerCase() : "";
}

const INITIAL_VISIBLE_COLUMNS = [
  "id",
  "projectNo",
  "name",
  "companyName",
  "salesPersonName",
  "unbilledNumber",
  "estimateNumber",
  "date",
  // "amount",
  // "dueAmount",
  "mileStone",
  "status",
  "actions",
];

const formSchema = z.object({
  name: z.string().min(1, "Please enter project name"),
  projectNo: z.string().min(1, "Please enter project number"),
  salesPersonId: z.string().optional(),
  productId: z.string().optional(),
  companyId: z.string().optional(),
  unbilledNumber: z.string().min(1, "Please enter unbill number"),
  estimateNumber: z.string().min(1, "Please enter estimate number"),
  contactId: z.string().min(1, "Please enter contact id"),
  leadId: z.string().min(1, "Please enter lead id"),
  date: z.string().min(1, "Please enter date"),
  address: z.string().min(1, "Please enter address"),
  country: z.string().optional().or(z.literal("")),
  state: z.string().optional().or(z.literal("")),
  city: z.string().optional().or(z.literal("")),
  primaryPinCode: z.string().optional().or(z.literal("")),
  totalAmount: z.string().optional().or(z.literal("")),
  paidAmount: z.string().optional().or(z.literal("")),
  paymentTypeId: z.string().min(1, "Please select the payment type"),
});

const defaultValues = {
  name: "",
  projectNo: "",
  salesPersonId: "",
  productId: "",
  companyId: "",
  unbilledNumber: "",
  estimateNumber: "",
  contactId: "",
  leadId: "",
  date: "",
  address: "",
  country: "",
  state: "",
  city: "",
  primaryPinCode: "",
  totalAmount: "",
  paidAmount: "",
  paymentTypeId: "",
};

const Projects = () => {
  const dispatch = useDispatch();
  const { userId } = useParams();
  const formModal = useDisclosure();
  const viewModal = useDisclosure();
  const data = useSelector((state) => state.operation.projectListForOperation);
  const count = useSelector((state) => state.operation.projectCount) || "";
  const usersList = useSelector((state) => state?.common?.usersList);
  const countryList = useSelector((state) => state.common.countriesList);
  const statesList = useSelector((state) => state.common.statesList);
  const citiesList = useSelector((state) => state.common.citiesList);
  const [filterValue, setFilterValue] = React.useState("");
  const [selectedKeys, setSelectedKeys] = React.useState(new Set([]));
  const [searchBy, setSearchBy] = useState("projectName");
  const [statusFilter, setStatusFilter] = useState(null);
  const [visibleColumns, setVisibleColumns] = React.useState(
    new Set(INITIAL_VISIBLE_COLUMNS),
  );
  const [sortDescriptor, setSortDescriptor] = React.useState({
    column: "id",
    direction: "ascending",
  });

  const [paginationData, setPaginationData] = useState({
    userId,
    page: 1,
    size: 50,
    statuses: "OPEN",
  });
  const [estimateDetail, setEstimateDetail] = useState(null);

  const hasSearchFilter = Boolean(filterValue);

  useEffect(() => {
    dispatch(getAllProjectsForOperations(paginationData));
    dispatch(getTotalCountForOperationProjects(userId));
    dispatch(getAllUsers());
    dispatch(getAllCountries());
  }, [dispatch, userId]);

  const headerColumns = React.useMemo(() => {
    if (visibleColumns === "all") return columns;
    return columns.filter((column) =>
      Array.from(visibleColumns).includes(column.uid),
    );
  }, [visibleColumns]);

  const filteredItems = React.useMemo(() => {
    let filteredUsers = [...(data || [])];

    // Apply status filter
    if (statusFilter) {
      filteredUsers = filteredUsers.filter(
        (item) => item?.statusName === statusFilter,
      );
    }

    // Apply due only filter

    // if (hasSearchFilter) {
    //   filteredUsers = filteredUsers.filter((item) =>
    //     Object.values(item)?.some((val) =>
    //       String(val)?.toLowerCase()?.includes(filterValue?.toLowerCase())
    //     )
    //   );
    // }
    return filteredUsers;
  }, [data, filterValue, statusFilter]);

  const pages = Math.ceil(count / paginationData?.size) || 1;

  const sortedItems = React.useMemo(() => {
    return [...filteredItems];
  }, [filteredItems]);

  const handleEnterPress = useCallback(() => {
    if (searchBy === "projectName") {
      dispatch(searchByProjectName({ projectName: filterValue, userId }));
    }
    if (searchBy === "projectNumber") {
      dispatch(searchByProjectNumber({ projectNumber: filterValue, userId }));
    }
    if (searchBy === "company") {
      dispatch(searchByCompany({ companyName: filterValue, userId }));
    }
    if (searchBy === "contactName") {
      dispatch(searchByContactName({ contactName: filterValue, userId }));
    }
  }, [searchBy, filterValue]);

  const handleViewEstimate = (rowData, type) => {
    dispatch(
      getEstimeteByEstimateNumber({
        estimateNumber: rowData?.estimateNumber,
        userId,
      }),
    )
      .then((resp) => {
        if (resp.meta.requestStatus === "fulfilled") {
          let data = resp?.payload;
          setEstimateDetail(data);
          viewModal.onOpen();
        } else {
          addToast({
            title: "There is Some Issue in estimate",
            color: "danger",
          });
        }
      })
      .catch(() =>
        addToast({ title: "There is Some Issue in estimate", color: "danger" }),
      );
  };

  const renderCell = React.useCallback((rowData, columnKey) => {
    const cellValue = rowData[columnKey];
    switch (columnKey) {
      case "projectNo":
        return (
          <div className="flex flex-col gap-0.5">
            <Link className="font-medium" to={`${rowData?.id}/projectDetail`}>
              {rowData?.projectNo}
            </Link>
          </div>
        );
      case "unbilledNumber":
        return <p className="text-sm">{rowData?.unbilledNumber}</p>;
      case "estimateNumber":
        return (
          <p
            className="capitalize text-xs "
            // onClick={() => handleViewEstimate(rowData, "ESTIMATE")}
          >
            {rowData?.estimateNumber}
          </p>
        );
      case "salesPersonName":
        return <p className="text-sm">{rowData?.salesPersonName}</p>;
      case "contactName":
        return <p className="text-sm">{rowData?.contactName || "-"}</p>;
      case "date":
        return <p>{rowData?.date}</p>;
      case "amount":
        return (
          <div className="flex flex-col gap-0.5">
            <p className="text-sm font-bold">
              {inrCurrency(rowData?.totalAmount)}
            </p>
            <p className="text-sm"> {inrCurrency(rowData?.dueAmount)}</p>
          </div>
        );
      case "totalAmount":
        return (
          <p className="text-sm font-medium">
            {inrCurrency(rowData?.totalAmount)}
          </p>
        );
      case "dueAmount":
        return (
          <p className="text-sm font-bold">{inrCurrency(rowData?.dueAmount)}</p>
        );
      case "status":
        return (
          <Chip
            size="sm"
            color={
              rowData?.statusName === "COMPLETED"
                ? "success"
                : rowData?.statusName === "REJECTED"
                  ? "danger"
                  : rowData?.statusName === "ON_HOLD"
                    ? "warning"
                    : rowData?.statusName === "OPEN"
                      ? "primary"
                      : rowData?.statusName === "IN_PROGRESS"
                        ? "warning"
                        : "default"
            }
          >
            {rowData?.statusName}
          </Chip>
        );
      case "actions":
        return (
          <div className="flex items-center gap-2">
            <Link to={`${rowData?.id}/projectDetail`}>
              <div className="bg-gray-200 dark:bg-gray-700 rounded px-3 py-1.5 cursor-pointer hover:bg-gray-300 dark:hover:bg-gray-600 transition">
                <p className="text-sm text-gray-800 dark:text-gray-200 font-medium">
                  View
                </p>
              </div>
            </Link>
          </div>
        );
      case "mileStone":
        return (
          <div>
            <Progress
              aria-label="Downloading..."
              className="max-w-md"
              color="success"
              showValueLabel={true}
              size="sm"
              value={rowData?.milestoneCompletionPercentage}
            />
          </div>
        );
      case "address":
        return (
          <div className="flex flex-col">
            <span className="font-normal">{rowData.address || "-"}</span>
            <span className="text-sm text-gray-400">
              {[rowData?.city, rowData?.state, rowData?.country].join(",")}
            </span>
          </div>
        );

      default:
        return cellValue;
    }
  }, []);

  const onNextPage = React.useCallback(() => {
    if (paginationData?.page < pages) {
      setPaginationData((prev) => ({
        ...prev,
        page: paginationData?.page + 1,
      }));
    }
  }, [paginationData?.page, pages]);

  const onPreviousPage = React.useCallback(() => {
    if (paginationData?.page > 1) {
      setPaginationData((prev) => ({
        ...prev,
        page: paginationData?.page - 1,
      }));
    }
  }, [paginationData?.page]);

  const onRowsPerPageChange = React.useCallback((e) => {
    setPaginationData((prev) => ({
      ...prev,
      size: Number(e.target.value),
      page: 1,
    }));
  }, []);

  const onSearchChange = React.useCallback((value) => {
    if (value) {
      setFilterValue(value);
      setPaginationData((prev) => ({
        ...prev,
        page: 1,
      }));
    } else {
      setFilterValue("");
      dispatch(getAllProjectsForOperations(paginationData));
    }
  }, []);

  const onClear = React.useCallback(() => {
    setFilterValue("");
    setPaginationData((prev) => ({
      ...prev,
      page: 1,
    }));
    dispatch(getAllProjectsForOperations(paginationData));
  }, []);

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: zodResolver(formSchema),
    defaultValues,
  });

  const handleFinish = (values) => {
    values.approvedById = userId;
    values.createdBy = userId;
    values.updatedBy = userId;
    dispatch(createProjectsForOperations(values))
      .then((resp) => {
        if (resp.meta.requestStatus === "fulfilled") {
          addToast({
            title: "Project created successfully !.",
            color: "success",
          });
          dispatch(getAllProjectsForOperations(paginationData));
          formModal.onClose();
        } else {
          addToast({ title: "Something went wrong !.", color: "danger" });
        }
      })
      .catch(() =>
        addToast({ title: "Something went wrong !.", color: "danger" }),
      );
  };

  // Calculate project status counts
  const projectStatusCounts = React.useMemo(() => {
    const counts = {
      total: count || 0,
      open: 0,
      inProgress: 0,
      completed: 0,
    };

    if (data && Array.isArray(data)) {
      data.forEach((project) => {
        if (project?.statusName === "OPEN") {
          counts.open++;
        } else if (project?.statusName === "IN_PROGRESS") {
          counts.inProgress++;
        } else if (project?.statusName === "COMPLETED") {
          counts.completed++;
        }
      });
    }

    return counts;
  }, [data, count]);

  // Status card configurations
  const statusCards = [
    {
      title: "Total Projects",
      count: projectStatusCounts.total,
      color: "blue",
      icon: FilePlus,
      borderColor: "border-blue-500",
      textColor: "text-gray-800 dark:text-white",
      iconBg: "bg-blue-100 dark:bg-blue-200",
      iconColor: "text-blue-700 dark:text-blue-700",
      statusValue: null, // No filter for total
    },
    {
      title: "Open",
      count: projectStatusCounts.open,
      color: "blue",
      icon: ChevronDown,
      borderColor: "border-blue-400",
      textColor: "text-blue-600",
      iconBg: "bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300",
      statusValue: "OPEN",
    },
    {
      title: "In Progress",
      count: projectStatusCounts.inProgress,
      color: "yellow",
      icon: FolderOpenDot,
      borderColor: "border-yellow-400",
      textColor: "text-yellow-600",
      iconBg:
        "bg-yellow-100 dark:bg-yellow-900 text-yellow-600 dark:text-yellow-300",
      iconColor: "text-yellow-700 dark:text-yellow-700",
      statusValue: "IN_PROGRESS",
    },
    {
      title: "Completed",
      count: projectStatusCounts.completed,
      color: "green",
      icon: CircleCheckBig,
      borderColor: "border-green-500",
      textColor: "text-green-600",
      iconBg:
        "bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-300",
      iconColor: "text-green-700 dark:text-green-700",
      statusValue: "COMPLETED",
    },
  ];

  const topContent = React.useMemo(() => {
    return (
      <div className="flex justify-between items-center gap-3">
        {/* Search Bar Row */}
        <div className="flex items-center w-full pb-0.5">
          <Select
            className="max-w-[15%]"
            selectionMode="single"
            selectedKeys={[searchBy]}
            onSelectionChange={(e) => {
              let key = Array.from(e)[0];
              setSearchBy(key);
            }}
          >
            <SelectItem key={"projectName"}>Project name</SelectItem>
            <SelectItem key={"projectNumber"}>Project number</SelectItem>
            <SelectItem key={"company"}>Company</SelectItem>
            <SelectItem key={"contactName"}>Contact name</SelectItem>
          </Select>
          <Input
            isClearable
            className="max-w-[22%]"
            placeholder="Search ..."
            startContent={<Search />}
            value={filterValue}
            onClear={() => onClear()}
            onValueChange={onSearchChange}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleEnterPress(); // your function
              }
            }}
          />
        </div>
        <div className="flex gap-2 items-center">
          <Button
            endContent={<Plus />}
            onPress={formModal.onOpen}
            color="primary"
            radius="sm"
          >
            Add
          </Button>
          <Dropdown>
            <DropdownTrigger className="hidden sm:flex">
              <Button
                endContent={<ChevronDown className="text-small" />}
                variant="flat"
                radius="sm"
              >
                {paginationData?.statuses}
              </Button>
            </DropdownTrigger>
            <DropdownMenu
              disallowEmptySelection
              aria-label="Table Columns"
              selectionMode="single"
              selectedKeys={[paginationData?.statuses]}
              onSelectionChange={(e) => {
                const key = Array.from(e)[0];
                setPaginationData((prev) => ({
                  ...prev,
                  statuses: key,
                }));
                dispatch(
                  getAllProjectsForOperations({
                    ...paginationData,
                    statuses: key,
                  }),
                );
              }}
            >
              <DropdownItem key={"OPEN"} className="capitalize">
                OPEN
              </DropdownItem>
              <DropdownItem key={"IN_PROGRESS"} className="capitalize">
                IN_PROGRESS
              </DropdownItem>
              <DropdownItem key={"COMPLETED"} className="capitalize">
                COMPLETED
              </DropdownItem>
              <DropdownItem key={"CANCELLED"} className="capitalize">
                CANCELLED
              </DropdownItem>
              <DropdownItem key={"REFUNDED"} className="capitalize">
                REFUNDED
              </DropdownItem>
            </DropdownMenu>
          </Dropdown>
          <Dropdown>
            <DropdownTrigger className="hidden sm:flex">
              <Button
                endContent={<ChevronDown className="text-small" />}
                variant="flat"
                radius="sm"
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
        </div>
      </div>
    );
  }, [
    filterValue,
    paginationData,
    visibleColumns,
    onRowsPerPageChange,
    count,
    onSearchChange,
    hasSearchFilter,
    searchBy,
    projectStatusCounts,
    statusFilter,
  ]);

  const bottomContent = React.useMemo(() => {
    return (
      <div className="py-2 px-2 flex justify-between items-center">
        <span className="text-small text-default-400">
          {selectedKeys === "all"
            ? "All items selected"
            : `${selectedKeys.size} of ${count} selected`}
        </span>

        <Pagination
          isCompact
          showControls
          showShadow
          color="primary"
          page={paginationData?.page}
          total={pages}
          onChange={(e) => setPaginationData((prev) => ({ ...prev, page: e }))}
        />

        <div className="space-x-1.5">
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
            className=""
          >
            Next
          </Button>
        </div>
      </div>
    );
  }, [selectedKeys, count, paginationData?.page, pages, hasSearchFilter]);

  return (
    <>
      <h1 className="font-sans text-2xl font-medium mb-1">Projects</h1>
      <Table
        isHeaderSticky
        aria-label="Example table with custom cells, pagination and sorting"
        bottomContent={bottomContent}
        bottomContentPlacement="outside"
        classNames={{
          wrapper: "2xl:max-h-[62vh] md:max-h-[60vh] w-full",
          table: "w-full",
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
            <TableRow key={item?.id}>
              {(columnKey) => (
                <TableCell>{renderCell(item, columnKey)}</TableCell>
              )}
            </TableRow>
          )}
        </TableBody>
      </Table>
      <Modal
        size="4xl"
        isDismissable={false}
        isKeyboardDismissDisabled={true}
        isOpen={formModal.isOpen}
        onOpenChange={formModal.onOpenChange}
        placement="top-center"
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                Create project
              </ModalHeader>
              <ModalBody>
                <form
                  className="w-full flex flex-col gap-4 "
                  onSubmit={handleSubmit(handleFinish)}
                >
                  <div className="w-full grid grid-cols-2 gap-4 max-h-[60vh] overflow-auto px-2 py-1">
                    <Controller
                      name="name"
                      control={control}
                      render={({ field }) => (
                        <Input
                          isRequired
                          label="Project name"
                          type="text"
                          {...field}
                        />
                      )}
                    />

                    <Controller
                      name="projectNo"
                      control={control}
                      render={({ field }) => (
                        <Input
                          isRequired
                          label="Project number"
                          type="text"
                          {...field}
                        />
                      )}
                    />

                    <Controller
                      name="salesPersonId"
                      control={control}
                      render={({ field }) => (
                        <NewSelect
                          isRequired={true}
                          data={usersList || []}
                          label="Select sales person"
                          name="salesPersonId"
                          labelKey="fullName"
                          valueKey="id"
                          value={field.value}
                          onChange={(selectedValue) => {
                            field.onChange(selectedValue);
                          }}
                        />
                      )}
                    />

                    <Controller
                      name="productId"
                      control={control}
                      render={({ field }) => (
                        <Input label="Product id" {...field} />
                      )}
                    />

                    <Controller
                      name="companyId"
                      control={control}
                      render={({ field }) => (
                        <Input label="Company id" {...field} />
                      )}
                    />

                    <Controller
                      name="unbilledNumber"
                      control={control}
                      render={({ field }) => (
                        <Input label="Unbill number" {...field} />
                      )}
                    />

                    <Controller
                      name="estimateNumber"
                      control={control}
                      render={({ field }) => (
                        <Input label="Estimate number" type="text" {...field} />
                      )}
                    />

                    <Controller
                      name="contactId"
                      control={control}
                      render={({ field }) => (
                        <Input label="Contact id" type="text" {...field} />
                      )}
                    />

                    <Controller
                      name="leadId"
                      control={control}
                      render={({ field }) => (
                        <Input
                          isRequired
                          label="Lead id"
                          type="text"
                          {...field}
                        />
                      )}
                    />

                    <Controller
                      name="date"
                      control={control}
                      render={({ field, fieldState: { error } }) => (
                        <DatePicker
                          isRequired
                          label="Date"
                          showMonthAndYearPickers
                          maxValue={today(getLocalTimeZone())}
                          value={field.value ? parseDate(field.value) : null}
                          onChange={(e) =>
                            field.onChange(toCalendarDate(e).toString())
                          }
                        />
                      )}
                    />

                    <Controller
                      name="address"
                      control={control}
                      render={({ field }) => (
                        <Textarea isRequired label="Address" {...field} />
                      )}
                    />

                    <Controller
                      name="country"
                      control={control}
                      render={({ field }) => (
                        <NewSelect
                          data={countryList}
                          label="Country"
                          labelKey="name"
                          valueKey="name"
                          {...field}
                          onChange={(value) => {
                            field.onChange(value);
                            dispatch(getAllStatesByCountryName(value));
                          }}
                        />
                      )}
                    />

                    <Controller
                      name="state"
                      control={control}
                      render={({ field }) => (
                        <NewSelect
                          data={statesList}
                          label="State"
                          labelKey="name"
                          valueKey="name"
                          {...field}
                          onChange={(value) => {
                            field.onChange(value);
                            dispatch(getAllCitiesByStateName(value));
                          }}
                        />
                      )}
                    />

                    <Controller
                      name="city"
                      control={control}
                      render={({ field }) => (
                        <NewSelect
                          data={citiesList}
                          label="City"
                          labelKey="name"
                          valueKey="name"
                          {...field}
                        />
                      )}
                    />

                    <Controller
                      name="primaryPinCode"
                      control={control}
                      render={({ field }) => (
                        <Input label="Pin code" type="text" {...field} />
                      )}
                    />

                    <Controller
                      name="totalAmount"
                      control={control}
                      render={({ field }) => (
                        <Input
                          isRequired
                          label="Total amount"
                          type="text"
                          {...field}
                        />
                      )}
                    />

                    <Controller
                      name="paidAmount"
                      control={control}
                      render={({ field }) => (
                        <Input
                          isRequired
                          label="Paid amount"
                          type="text"
                          {...field}
                        />
                      )}
                    />

                    <Controller
                      name="paymentTypeId"
                      control={control}
                      render={({ field }) => (
                        <Select isRequired label="Payment type" {...field}>
                          {[
                            { label: "FULL", id: 1 },
                            { label: "PARTIAL", id: 2 },
                            { label: "INSTALLMENT", id: 3 },
                            { label: "PURCHASE_ORDER", id: 4 },
                          ].map((item) => (
                            <SelectItem key={item?.id} value={item?.id}>
                              {item?.label}
                            </SelectItem>
                          ))}
                        </Select>
                      )}
                    />
                  </div>
                  <ModalFooter className="w-full flex justify-end">
                    <Button onPress={onClose}>Cancel</Button>
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

      <Modal
        size="4xl"
        isDismissable={false}
        isKeyboardDismissDisabled={true}
        isOpen={viewModal.isOpen}
        onOpenChange={viewModal.onOpenChange}
        placement="top-center"
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalBody className="max-h-[70vh] overflow-auto">
                <NewEstimatePreview details={estimateDetail} />
              </ModalBody>
              <ModalFooter className="flex justify-end">
                <Button onPress={onClose}>Cancel</Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
};

export default Projects;
