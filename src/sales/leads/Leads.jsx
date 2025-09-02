import  { useCallback, useEffect, useMemo, useState } from "react";
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
  Chip,
  Pagination,
  Modal,
  useDisclosure,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  Select,
  SelectItem,
  Textarea,
  PopoverTrigger,
  PopoverContent,
  Popover,
  DateRangePicker,
  addToast,
  Listbox,
  ListboxItem,
} from "@heroui/react";
import {
  ArrowDownNarrowWide,
  ArrowDownToLine,
  ArrowUpDown,
  ArrowUpNarrowWide,
  ArrowUpToLine,
  ChevronDown,
  EllipsisVertical,
  ListFilter,
  Plus,
  Search,
  Zap,
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import {
  createLeads,
  deleteMultipleLeads,
  getAllLeadCount,
  getAllLeadsByFilter,
  getAllLeadsForExport,
  getAllLeadUser,
  handleDeleteSingleLead,
  multiAssignedLeads,
  searchLeads,
} from "../../toolkit/slices/leadSlice";
import { Link, useParams } from "react-router-dom";
import {
  getAllCitiesByStateName,
  getAllCountries,
  getAllStatesByCountryName,
} from "../../toolkit/slices/commonSlice";
import NewSelect from "../../components/NewSelect";
import { getAllStatusData } from "../../toolkit/slices/settingSlice";
import { formatedDateTime, leadSource } from "../../common";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { getDashboardUsersByHeirarchy } from "../../toolkit/slices/dashboardSlice";
import { CSVLink } from "react-csv";
import dayjs from "dayjs";

export const columns = [
  { name: "ID", uid: "id", sortable: true },
  { name: "LEAD NAME", uid: "leadName", sortable: true },
  { name: "CONTACT", uid: "contact" },
  { name: "STATUS", uid: "status", sortable: true },
  { name: "ASSIGNEE", uid: "assignee" },
  { name: "UPDATED BY", uid: "updatedBy" },
  { name: "SOURCE", uid: "source" },
  { name: "INDUSTRY", uid: "industry" },
  { name: "ADDRESS", uid: "address" },
  { name: "ACTIONS", uid: "actions" },
];

export function capitalize(s) {
  return s ? s.charAt(0).toUpperCase() + s.slice(1).toLowerCase() : "";
}

const INITIAL_VISIBLE_COLUMNS = [
  "leadName",
  "contact",
  "assignee",
  "source",
  "updatedBy",
  "status",
  "industry",
  "address",
  "actions",
];
const formSchema = z.object({
  leadName: z.string().min(1, "Please enter lead name"),
  name: z.string().min(1, "Please enter a valid client name"),
  email: z
    .string()
    .email("Please enter a valid email")
    .optional()
    .or(z.literal("")),
  mobileNo: z.string().optional().or(z.literal("")),
  urls: z.string().min(1, "Please enter company name"),
  country: z.string().optional().or(z.literal("")),
  state: z.string().optional().or(z.literal("")),
  city: z.string().optional().or(z.literal("")),
  ipAddress: z.string().optional().or(z.literal("")),
  assigneeId: z.string().optional().or(z.literal("")),
  auto: z.string().optional().or(z.literal("")),
  source: z.string().min(1, "Please select the lead source"),
  primaryAddress: z.string().min(1, "Please enter address"),
  leadDescription: z.string().min(1, "Please enter lead description"),
});

const defaultValues = {
  leadName: "",
  name: "",
  email: "",
  mobileNo: "",
  urls: "",
  country: "",
  state: "",
  city: "",
  ipAddress: "",
  assigneeId: "",
  auto: "",
  source: "",
  primaryAddress: "",
  leadDescription: "",
};

const Leads = () => {
  const { userId } = useParams();
  const dispatch = useDispatch();
  const data = useSelector((state) => state.leads.allLeads);
  const count = useSelector((state) => state.leads.totalCount);
  const allLeadsForExport = useSelector(
    (state) => state.leads.allLeadsForExport
  );
  const roles = useSelector((state) => state.auth.currentUser?.roles);
  const allLeadUser = useSelector((state) => state.leads.leadUsersList);
  const statusList = useSelector((state) => state?.setting?.statusList);
  const countryList = useSelector((state) => state.common.countriesList);
  const statesList = useSelector((state) => state.common.statesList);
  const citiesList = useSelector((state) => state.common.citiesList);
  const heirarchyUserList = useSelector(
    (state) => state.dashboard.dashboardUsers
  );
  const userRole = useSelector((state) => state.auth.currentUser?.roles);
  const adminRole = userRole.includes("ADMIN");
  const [filterValue, setFilterValue] = useState("");
  const [selectedKeys, setSelectedKeys] = useState([]);
  const [visibleColumns, setVisibleColumns] = useState(
    new Set(INITIAL_VISIBLE_COLUMNS)
  );
  const [sortDescriptor, setSortDescriptor] = useState({
    column: "age",
    direction: "ascending",
  });
  const [assignedLeadInfo, setAssignedLeadInfo] = useState({
    statusId: null,
    assigneId: null,
  });
  const deleteModal = useDisclosure();
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const initialFilterValues = {
    userId: userId,
    userIdFilter: [],
    statusId: [1],
    toDate: "",
    fromDate: "",
    updatedToDate: "",
    updatedfromDate: "",
    updatedById: null,
    source: [],
    contactMobileNo: "",
    contactEmail: "",
    sortBy: "id",
    sortDirection: "",
    page: 1,
    size: 50,
  };
  const [allMultiFilterData, setAllMultiFilterData] =
    useState(initialFilterValues);
  const [itemId, setItemId] = useState(null);

  const hasSearchFilter = Boolean(filterValue);

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: zodResolver(formSchema),
    defaultValues,
  });

  useEffect(() => {
    dispatch(getAllLeadsByFilter(allMultiFilterData));
    dispatch(getAllLeadCount(allMultiFilterData));
  }, [dispatch]);

  useEffect(() => {
    dispatch(getAllLeadUser(userId));
    dispatch(getAllStatusData());
    dispatch(getDashboardUsersByHeirarchy(userId));
  }, [dispatch, userId]);

  const headerColumns = useMemo(() => {
    if (visibleColumns === "all") return columns;

    return columns.filter((column) =>
      Array.from(visibleColumns).includes(column.uid)
    );
  }, [visibleColumns]);

  const filteredItems = useMemo(() => {
    let filteredUsers = [...(data || [])];

    if (hasSearchFilter) {
      filteredUsers = filteredUsers.filter((user) =>
        user.leadName.toLowerCase().includes(filterValue.toLowerCase())
      );
    }
    return filteredUsers;
  }, [data, filterValue]);

  const pages = Math.ceil(count / allMultiFilterData?.size) || 1;

  const sortedItems = useMemo(() => {
    return [...filteredItems].sort((a, b) => {
      const first = a[sortDescriptor.column];
      const second = b[sortDescriptor.column];
      const cmp = first < second ? -1 : first > second ? 1 : 0;

      return sortDescriptor.direction === "descending" ? -cmp : cmp;
    });
  }, [sortDescriptor, filteredItems]);

  const exportData = allLeadsForExport?.map((row) => ({
    Id: row?.id,
    "Lead name": row?.leadName,
    "Missed task": row?.missedTaskName,
    Frequency: row?.count,
    Status: row?.status,
    "Client name": row?.clientName,
    Email: row?.clientEmail,
    "Mobile no.": row?.clientMobNo,
    "Assignee person": row?.assigneeName,
    "Assignee email": row?.assigneeEmail,
    "Created by": row?.createdBy,
    Source: row?.source,
    Industry: row?.industry,
    "Sub industry": row?.subIndustry,
    Category: row?.subSubIndustry,
    "Business activity": row?.industryData,
    Address: row?.address,
    Country: row?.country,
    State: row?.state,
    City: row?.city,
    "Pin code": row?.pincode,
    "Updated By": row?.updatedBy,
    "Reopen By": row?.reopenBy,
    "Reopen By Quality": row?.isReopenByQuality,
    "Created Date": dayjs(row?.createDate).format("YYYY-MM-DD"),
  }));

  const headers = [
    "Id",
    "Lead name",
    "Missed task",
    "Frequency",
    "Status",
    "Client name",
    "Email",
    "Mobile no.",
    "Assignee person",
    "Assignee email",
    "Created by",
    "Helper",
    "Source",
    "Industry",
    "Sub industry",
    "Category",
    "Business activity",
    "Address",
    "Country",
    "State",
    "City",
    "Pin code",
    "Updated By",
    "Reopen By",
    "Reopen By Quality",
    "Created Date",
  ];

  const openDeleteModal = (id) => {
    setItemId(id);
    deleteModal.onOpen();
  };

  const leadDeleteResponse = useCallback(() => {
    let obj = {
      id: itemId,
      userId,
    };
    dispatch(handleDeleteSingleLead(obj))
      .then((response) => {
        if (response.meta.requestStatus === "fulfilled") {
          addToast({
            title: "Lead deleted successfully !.",
            color: "success",
          });
          dispatch(getAllLeadsByFilter(allMultiFilterData));
        } else {
          addToast({ title: "Something went wrong !.", color: "danger" });
        }
      })
      .catch(() => {
        addToast({ title: "Something went wrong !.", color: "danger" });
      });
  }, [userId, dispatch, allMultiFilterData, itemId]);

  const renderCell = useCallback((lead, columnKey) => {
    switch (columnKey) {
      case "leadName":
        return (
          <div className="flex flex-col">
            <Link to={`${lead?.id}/leadDetail`} className="font-semibold">
              {lead.leadName || "-"}
            </Link>
            <span className="text-sm text-gray-400">
              {dayjs(lead.createDate).format("DD-MM-YYYY")}
            </span>
          </div>
        );
      case "contact":
        return (
          <div className="flex flex-col">
            <span className="font-normal">{lead?.email || "-"}</span>
            <span className="text-sm text-gray-400">
              {lead?.mobileNo || "-"}
            </span>
          </div>
        );
      case "status":
        return (
          <Chip className="capitalize" color="primary" size="sm" variant="flat">
            {lead.status?.name || "Unknown"}
          </Chip>
        );
      case "assignee":
        return (
          <div className="flex flex-col">
            <span className="font-semibold">
              {lead.assignee?.fullName || "-"}
            </span>
            <span className="text-sm text-gray-400">
              {lead.assignee?.email || "-"}
            </span>
          </div>
        );
      case "industry":
        return lead.industries?.name || "-";
      case "city":
        return lead.city || "-";
      case "source":
        return lead.source || "-";
      case "updatedBy":
        return (
          <div>
            <span className="font-normal">{lead?.updatedBy}</span>
            <span className="font-normal text-muted-foreground">
              {lead?.updatedDate
                ? dayjs(lead?.updatedDate).format("DD-MM-YYYY")
                : "-"}
            </span>
          </div>
        );
      case "Address":
        return (
          <div className="flex flex-col">
            <span className="font-normal">{lead.address || "-"}</span>
            <span className="text-sm text-gray-400">
              {lead.city || ""},{lead?.state},{lead?.country}
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
              <DropdownMenu
                selectionMode="single"
                onSelectionChange={(e) => {
                  let key = Array.from(e);
                  if (key == "delete") {
                    openDeleteModal(lead?.id);
                  }
                }}
              >
                <DropdownItem
                  key="history"
                  href={`erp/${userId}/sales/leads/${lead?.id}/leadHistory`}
                >
                  History
                </DropdownItem>
                <DropdownItem
                  key="tasks"
                  href={`erp/${userId}/sales/leads/${lead?.id}/leadTasks`}
                >
                  Lead tasks
                </DropdownItem>
                {/* <DropdownItem key="edit">Edit</DropdownItem> */}
                <DropdownItem key="delete" color="danger">
                  Delete
                </DropdownItem>
              </DropdownMenu>
            </Dropdown>
          </div>
        );
      default:
        return lead[columnKey] || "-";
    }
  }, []);

  const onNextPage = useCallback(() => {
    if (allMultiFilterData?.page < pages) {
      setAllMultiFilterData((prev) => ({ ...prev, page: prev.page + 1 }));
    }
  }, [allMultiFilterData, pages]);

  const onPreviousPage = useCallback(() => {
    if (allMultiFilterData?.page > 1) {
      setAllMultiFilterData((prev) => ({ ...prev, page: prev.page - 1 }));
    }
  }, [allMultiFilterData]);

  const onRowsPerPageChange = useCallback((e) => {
    setAllMultiFilterData((prev) => ({
      ...prev,
      size: Number(e.target.value),
    }));
    setAllMultiFilterData((prev) => ({ ...prev, page: 1 }));
  }, []);

  const onSearchChange = useCallback((value) => {
    if (value) {
      setFilterValue(value);
      setAllMultiFilterData((prev) => ({ ...prev, page: 1 }));
      searchLeads({ input: value, id: userId });
    } else {
      setFilterValue("");
      dispatch(getAllLeadsByFilter(initialFilterValues));
    }
  }, []);

  const onClear = useCallback(() => {
    setFilterValue("");
    setAllMultiFilterData((prev) => ({ ...prev, page: 1 }));
  }, []);

  const handleApplyFilter = useCallback(() => {
    dispatch(getAllLeadsByFilter(allMultiFilterData));
    dispatch(getAllLeadCount(allMultiFilterData));
  }, [allMultiFilterData, dispatch]);

  const handleResetFilter = useCallback(() => {
    dispatch(getAllLeadsByFilter(initialFilterValues));
    dispatch(getAllLeadCount(initialFilterValues));
    setAllMultiFilterData(initialFilterValues);
  }, [initialFilterValues, dispatch]);

  const handleDeleteMutipleLeads = useCallback(() => {
    let obj = {
      leadId: selectedKeys,
      updatedById: Number(userId),
    };
    dispatch(deleteMultipleLeads(obj))
      .then((response) => {
        if (response?.meta?.requestStatus === "fulfilled") {
          addToast({
            title: "Leads deleted successfully !.",
            color: "success",
          });
          dispatch(getAllLeadsByFilter(allMultiFilterData));
          setSelectedKeys([]);
        } else {
          addToast({ title: "Something went wrong !.", color: "danger" });
        }
      })
      .catch(() => {
        addToast({ title: "Something went wrong !.", color: "danger" });
      });
  }, [selectedKeys, userId, dispatch, allMultiFilterData]);

  const handleMultipleAssignedLeads = useCallback(() => {
    let obj = {
      leadIds: selectedKeys,
      updatedById: userId,
      ...assignedLeadInfo,
    };
    dispatch(multiAssignedLeads(obj))
      .then((response) => {
        if (response?.meta?.requestStatus === "fulfilled") {
          addToast({
            title: "Leads assigned successfully !.",
            color: "success",
          });
          dispatch(getAllLeadsByFilter(allMultiFilterData));
          setSelectedKeys([]);
          setAssignedLeadInfo({
            statusId: null,
            assigneId: null,
          });
        } else {
          addToast({ title: "Something went wrong !.", color: "danger" });
        }
      })
      .catch(() => {
        addToast({ title: "Something went wrong !.", color: "danger" });
      });
  }, [dispatch, selectedKeys, userId, assignedLeadInfo, allMultiFilterData]);

  const handleSort = (sortBy, sortDirection) => {
    const updatedData = { ...allMultiFilterData, sortBy, sortDirection };
    setAllMultiFilterData(updatedData);
    dispatch(getAllLeadsByFilter(updatedData));
    dispatch(getAllLeadsForExport(updatedData));
    dispatch(getAllLeadCount(updatedData));
  };

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
            <Popover size="lg" showArrow>
              <PopoverTrigger>
                <Button variant="flat" endContent={<Zap />}>
                  Action
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[500px] flex justify-start">
                {(titleProps) => (
                  <>
                    <h3
                      className="my-4 font-bold text-xl w-full"
                      {...titleProps}
                    >
                      Lead actions
                    </h3>
                    <p className="text-muted-foreground w-full mb-2">
                      {selectedKeys?.length === 0
                        ? "Please select the table rows for action ."
                        : `${selectedKeys?.length} rows are selected`}{" "}
                    </p>
                    <div className="flex flex-col gap-4 w-full">
                      <NewSelect
                        data={statusList}
                        label={"Status"}
                        name={"statusId"}
                        labelKey={"name"}
                        valueKey={"id"}
                        value={assignedLeadInfo?.statusId}
                        onChange={(e) =>
                          setAssignedLeadInfo((prev) => ({
                            ...prev,
                            statusId: e,
                          }))
                        }
                      />
                      <NewSelect
                        data={heirarchyUserList}
                        label={"Assignee"}
                        name={"statusId"}
                        labelKey={"name"}
                        valueKey={"id"}
                        value={assignedLeadInfo?.assigneId}
                        onChange={(selectedSet) => {
                          setAssignedLeadInfo((prev) => ({
                            ...prev,
                            statusId: selectedSet,
                          }));
                        }}
                      />
                    </div>
                    <div className="flex justify-between gap-2 my-2 w-full">
                      <Button
                        color="danger"
                        isDisabled={selectedKeys?.length === 0}
                        onPress={handleDeleteMutipleLeads}
                      >
                        Delete
                      </Button>
                      <Button
                        color="primary"
                        isDisabled={selectedKeys?.length === 0}
                        onPress={handleMultipleAssignedLeads}
                      >
                        Send
                      </Button>
                    </div>
                  </>
                )}
              </PopoverContent>
            </Popover>

            <Popover size="lg" showArrow>
              <PopoverTrigger>
                <Button variant="flat" endContent={<ArrowUpDown />}>
                  Sort
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[250px] flex justify-start">
                {(titleProps) => (
                  <>
                    <h3
                      className="my-4 font-bold text-xl w-full"
                      {...titleProps}
                    >
                      Sort
                    </h3>
                    <div className="flex flex-col gap-4 w-[220px]">
                      <Listbox
                        aria-label="Actions"
                        selectionMode="single"
                        selectedKeys={[
                          `${allMultiFilterData?.sortBy}${allMultiFilterData?.sortDirection}`,
                        ]}
                        onSelectionChange={(e) => {
                          let key = Array.from(e)[0];
                          if (key === "idasc") {
                            handleSort("id", "asc");
                          } else if (key === "iddesc") {
                            handleSort("id", "desc");
                          } else if (key === "createdDateasc") {
                            handleSort("createdDate", "asc");
                          } else if (key === "createdDatedesc") {
                            handleSort("createdDate", "desc");
                          } else if (key === "updatedDateasc") {
                            handleSort("updatedDate", "asc");
                          } else if (key === "updatedDatedesc") {
                            handleSort("updatedDate", "desc");
                          }
                        }}
                        onAction={(key) => alert(key)}
                      >
                        <ListboxItem
                          key="idasc"
                          endContent={<ArrowDownNarrowWide />}
                        >
                          Id (Asc)
                        </ListboxItem>
                        <ListboxItem
                          key="iddesc"
                          endContent={<ArrowUpNarrowWide />}
                        >
                          Id (Desc)
                        </ListboxItem>
                        <ListboxItem
                          key="createdDateasc"
                          endContent={<ArrowDownNarrowWide />}
                        >
                          Created date (Asc)
                        </ListboxItem>
                        <ListboxItem
                          key="createdDatedesc"
                          endContent={<ArrowUpNarrowWide />}
                        >
                          Created date (Desc)
                        </ListboxItem>
                        <ListboxItem
                          key="updatedDateasc"
                          endContent={<ArrowDownNarrowWide />}
                        >
                          Updated date (Asc)
                        </ListboxItem>
                        <ListboxItem
                          key="updatedDatedesc"
                          endContent={<ArrowUpNarrowWide />}
                        >
                          Updated date (Desc)
                        </ListboxItem>
                      </Listbox>
                    </div>
                  </>
                )}
              </PopoverContent>
            </Popover>
            <Popover size="lg" showArrow>
              <PopoverTrigger>
                <Button variant="flat" endContent={<ListFilter />}>
                  Filter
                </Button>
              </PopoverTrigger>
              <PopoverContent>
                {(titleProps) => (
                  <div className="px-1 py-2">
                    <h3 className="my-4 font-bold text-xl" {...titleProps}>
                      Lead filter
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                      <NewSelect
                        data={allLeadUser}
                        selectionMode="multiple"
                        label={"Select users"}
                        name={"userIdFilter"}
                        labelKey={"fullName"}
                        valueKey={"id"}
                        value={allMultiFilterData?.userIdFilter}
                        onChange={(selectedSet) => {
                          setAllMultiFilterData((prev) => ({
                            ...prev,
                            userIdFilter: selectedSet,
                          }));
                        }}
                      />
                      <NewSelect
                        data={allLeadUser}
                        label={"Updated by"}
                        name={"updatedById"}
                        labelKey={"fullName"}
                        valueKey={"id"}
                        value={allMultiFilterData?.updatedById}
                        onChange={(selectedSet) => {
                          setAllMultiFilterData((prev) => ({
                            ...prev,
                            updatedById: selectedSet,
                          }));
                        }}
                      />
                      <DateRangePicker
                        hideTimeZone
                        granularity="minute"
                        hourCycle={24}
                        visibleMonths={2}
                        label="Created date"
                        onChange={(range) => {
                          setAllMultiFilterData((prev) => ({
                            ...prev,
                            toDate: formatedDateTime(range?.start),
                            fromDate: formatedDateTime(range?.end),
                          }));
                        }}
                      />

                      <NewSelect
                        data={statusList}
                        label={"Status"}
                        name={"statusId"}
                        selectionMode="multiple"
                        labelKey={"name"}
                        valueKey={"id"}
                        value={allMultiFilterData?.statusId}
                        onChange={(selectedSet) => {
                          setAllMultiFilterData((prev) => ({
                            ...prev,
                            statusId: selectedSet,
                          }));
                        }}
                      />
                      <DateRangePicker
                        hideTimeZone
                        granularity="minute"
                        hourCycle={24}
                        visibleMonths={2}
                        label="Updated date"
                        onChange={(range) => {
                          setAllMultiFilterData((prev) => ({
                            ...prev,
                            updatedToDate: formatedDateTime(range?.start),
                            updatedfromDate: formatedDateTime(range?.end),
                          }));
                        }}
                      />

                      <Select
                        label="Source"
                        selectionMode="multiple"
                        items={
                          leadSource?.map((item) => ({
                            label: item,
                            key: item,
                          })) || []
                        }
                        selectedKeys={allMultiFilterData?.source}
                        onSelectionChange={(e) =>
                          setAllMultiFilterData((prev) => ({
                            ...prev,
                            source: Array.from(e),
                          }))
                        }
                      >
                        {(source) => (
                          <SelectItem key={source.key}>
                            {source.label}
                          </SelectItem>
                        )}
                      </Select>
                      <Input
                        label="Mobile number"
                        value={allMultiFilterData?.contactMobileNo}
                        onChange={(e) =>
                          setAllMultiFilterData((prev) => ({
                            ...prev,
                            contactMobileNo: e.target.value,
                          }))
                        }
                      />
                      <Input
                        label="Email address"
                        value={allMultiFilterData?.contactEmail}
                        onChange={(e) =>
                          setAllMultiFilterData((prev) => ({
                            ...prev,
                            contactEmail: e.target.value,
                          }))
                        }
                      />
                    </div>
                    <div className="flex justify-end gap-2 my-2">
                      <Button onPress={handleResetFilter}>Reset</Button>
                      <Button color="primary" onPress={handleApplyFilter}>
                        Apply
                      </Button>
                    </div>
                  </div>
                )}
              </PopoverContent>
            </Popover>
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
            <Dropdown>
              <DropdownTrigger>
                <Button radius="full" variant="flat" isIconOnly>
                  <EllipsisVertical />
                </Button>
              </DropdownTrigger>
              <DropdownMenu
                aria-label="Static Actions"
                selectionMode="single"
                onSelectionChange={(e) => {
                  let key = Array.from(e)[0];
                  if (key === "add") {
                    handleOpenModal();
                  }
                }}
              >
                <DropdownItem key="add" endContent={<Plus />}>
                  Add lead
                </DropdownItem>
                {adminRole && (
                  <DropdownItem key="export" endContent={<ArrowDownToLine />}>
                    <CSVLink
                      className="text-white"
                      data={exportData}
                      headers={headers}
                      filename={"exported_data.csv"}
                    >
                      <Button
                        variant="light"
                        size="sm"
                        className="w-full flex justify-start p-0 m-0"
                      >
                        Export
                      </Button>
                    </CSVLink>
                  </DropdownItem>
                )}
                <DropdownItem key="import" endContent={<ArrowUpToLine />}>
                  Import
                </DropdownItem>
              </DropdownMenu>
            </Dropdown>
          </div>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-default-400 text-small">
            Total {count} leads
          </span>
          <label className="flex items-center text-default-400 text-small">
            Rows per page:
            <select
              className="bg-transparent outline-hidden text-default-400 text-small"
              onChange={onRowsPerPageChange}
              value={allMultiFilterData?.size}
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
    hasSearchFilter,
    allLeadUser,
    allMultiFilterData,
    statusList,
    selectedKeys,
    heirarchyUserList,
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
          page={allMultiFilterData?.page}
          total={pages}
          onChange={(e) => {
            setAllMultiFilterData((prev) => ({ ...prev, page: e }));
            dispatch(getAllLeadsByFilter({ ...allMultiFilterData, page: e }));
            dispatch(getAllLeadCount({ ...allMultiFilterData, page: e }));
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
  }, [selectedKeys, count, allMultiFilterData, pages, hasSearchFilter]);

  const handleOpenModal = () => {
    onOpen();
    dispatch(getAllCountries());
  };

  const handleFinish = (values) => {
    values.categoryId = "1";
    values.createdById = userId;
    values.serviceId = "1";
    values.industryId = "1";
    values.assigneeId = roles?.includes("ADMIN") ? values.assigneeId : userId;
    dispatch(createLeads(values))
      .then((resp) => {
        if (resp.meta.requestStatus === "fulfilled") {
          addToast({ title: "Lead created successfully !.", color: "success" });
          dispatch(getAllLeadsByFilter(allMultiFilterData));
          dispatch(getAllLeadCount(allMultiFilterData));
          onOpenChange(false);
        } else {
          addToast({ title: "Something went wrong !.", color: "danger" });
        }
      })
      .catch(() =>
        addToast({ title: "Something went wrong !.", color: "danger" })
      );
  };

  return (
    <>
      <h1 className="font-sans text-2xl font-medium mb-1">Leads</h1>
      <Table
        isHeaderSticky
        aria-label="Example table with custom cells, pagination and sorting"
        bottomContent={bottomContent}
        bottomContentPlacement="outside"
        classNames={{
          wrapper: "max-h-[500px]",
        }}
        selectedKeys={selectedKeys}
        selectionMode="multiple"
        sortDescriptor={sortDescriptor}
        topContent={topContent}
        topContentPlacement="outside"
        onSelectionChange={(e) => {
          let keys = Array.from(e);
          setSelectedKeys(keys);
        }}
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
            <TableRow key={item.id}>
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
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        placement="top-center"
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                Create lead
              </ModalHeader>
              <ModalBody>
                <form
                  className="w-full flex flex-col gap-4 "
                  onSubmit={handleSubmit(handleFinish)}
                >
                  <div className="w-full grid grid-cols-2 gap-4 max-h-[60vh] overflow-auto px-2 py-1">
                    <Controller
                      name="leadName"
                      control={control}
                      render={({ field }) => (
                        <Input
                          isRequired
                          errorMessage={errors.leadName?.message}
                          label="Lead name"
                          type="text"
                          {...field}
                        />
                      )}
                    />

                    <Controller
                      name="name"
                      control={control}
                      render={({ field }) => (
                        <Input
                          isRequired
                          errorMessage={errors.name?.message}
                          label="Client name"
                          type="text"
                          {...field}
                        />
                      )}
                    />

                    <Controller
                      name="email"
                      control={control}
                      render={({ field }) => (
                        <Input
                          label="Email"
                          errorMessage={errors.email?.message}
                          type="email"
                          {...field}
                        />
                      )}
                    />

                    <Controller
                      name="mobileNo"
                      control={control}
                      render={({ field }) => (
                        <Input
                          label="Mobile number"
                          errorMessage={errors.mobileNo?.message}
                          type="text"
                          maxLength={10}
                          {...field}
                        />
                      )}
                    />

                    <Controller
                      name="urls"
                      control={control}
                      render={({ field }) => (
                        <Input
                          isRequired
                          errorMessage={errors.urls?.message}
                          label="Company url"
                          type="text"
                          {...field}
                        />
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
                          errorMessage={errors.country?.message}
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
                          errorMessage={errors.state?.message}
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
                          errorMessage={errors.city?.message}
                          {...field}
                        />
                      )}
                    />

                    <Controller
                      name="ipAddress"
                      control={control}
                      render={({ field }) => (
                        <Input
                          label="Ip address"
                          errorMessage={errors.ipAddress?.message}
                          type="text"
                          {...field}
                        />
                      )}
                    />

                    <Controller
                      name="assigneeId"
                      control={control}
                      render={({ field }) => (
                        <NewSelect
                          isRequired={true}
                          data={allLeadUser}
                          label="Select users"
                          name="assigneeId"
                          labelKey="fullName"
                          valueKey="id"
                          value={field.value}
                          onChange={(selectedValue) => {
                            field.onChange(selectedValue);
                          }}
                          errorMessage={errors.assigneeId?.message}
                        />
                      )}
                    />

                    <Controller
                      name="auto"
                      control={control}
                      render={({ field }) => (
                        <Select
                          label="Automation"
                          errorMessage={errors.auto?.message}
                          {...field}
                        >
                          {[
                            { name: "True", id: true },
                            { name: "False", id: false },
                          ].map((option) => (
                            <SelectItem key={option.id} value={option.id}>
                              {option.name}
                            </SelectItem>
                          ))}
                        </Select>
                      )}
                    />

                    <Controller
                      name="source"
                      control={control}
                      render={({ field }) => (
                        <Select
                          isRequired
                          errorMessage={errors.source?.message}
                          label="Source"
                          {...field}
                        >
                          {leadSource.map((item) => (
                            <SelectItem key={item} value={item}>
                              {item}
                            </SelectItem>
                          ))}
                        </Select>
                      )}
                    />

                    <Controller
                      name="primaryAddress"
                      control={control}
                      render={({ field }) => (
                        <Textarea
                          isRequired
                          errorMessage={errors.primaryAddress?.message}
                          label="Primary address"
                          {...field}
                        />
                      )}
                    />

                    <Controller
                      name="leadDescription"
                      control={control}
                      render={({ field }) => (
                        <Textarea
                          isRequired
                          errorMessage={errors.leadDescription?.message}
                          label="Lead description"
                          {...field}
                        />
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
        isOpen={deleteModal.isOpen}
        onOpenChange={deleteModal.onOpenChange}
        backdrop="blur"
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">Delete</ModalHeader>
              <ModalBody>
                <p>Are you sure to delete this item ?</p>
              </ModalBody>
              <ModalFooter>
                <Button onPress={onClose}>No</Button>
                <Button color="primary" onPress={leadDeleteResponse}>
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

export default Leads;
