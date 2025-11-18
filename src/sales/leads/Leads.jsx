import { useCallback, useEffect, useMemo, useState } from "react";
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
  Badge,
} from "@heroui/react";
import {
  ArrowDownNarrowWide,
  ArrowDownToLine,
  ArrowUpDown,
  ArrowUpToLine,
  ArrowUpWideNarrow,
  ChevronDown,
  EllipsisVertical,
  Flag,
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
  handleFlagByQualityTeam,
  handleViewHistory,
  multiAssignedLeads,
  searchLeads,
  transferLeadToAnotherUser,
} from "../../toolkit/slices/leadSlice";
import { Link, useParams } from "react-router-dom";
import {
  getAllCitiesByStateName,
  getAllCountries,
  getAllStatesByCountryName,
  getAllUrlList,
} from "../../toolkit/slices/commonSlice";
import NewSelect from "../../components/NewSelect";
import { getAllStatusData } from "../../toolkit/slices/settingSlice";
import { leadSource } from "../../common";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { CSVLink } from "react-csv";
import dayjs from "dayjs";
import { parseZonedDateTime } from "@internationalized/date";
import { toggleAutoOnFeature } from "../../toolkit/slices/authSlice";
import LoadingSpinner from "../../components/LoadingSpinner";

const getRowClassName = (item) => {
  if (!item.view) {
    return "bg-default-200";
  }
  return "";
};

export const columns = (admin) => [
  { name: "ID", uid: "id" },
  { name: "LEAD NAME", uid: "leadName" },
  { name: "CONTACT", uid: "contact" },
  { name: "STATUS", uid: "status" },
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

const INITIAL_VISIBLE_COLUMNS = (admin) => [
  "leadName",
  "contact",
  "assignee",
  "source",
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
  const leadsLoading = useSelector((state) => state.leads.leadresponseStatus);
  const allLeadsForExport = useSelector(
    (state) => state.leads.allLeadsForExport
  );
  const roles = useSelector((state) => state.auth.currentUser?.roles);
  const allLeadUser = useSelector((state) => state?.leads?.leadUsersList);
  const statusList = useSelector((state) => state?.setting?.statusList);
  const countryList = useSelector((state) => state.common.countriesList);
  const statesList = useSelector((state) => state.common.statesList);
  const citiesList = useSelector((state) => state.common.citiesList);
  const urlList = useSelector((state) => state.common.urlList);
  const userRole = useSelector((state) => state.auth.currentUser?.roles);
  const department = useSelector((state) => state.auth.getDepartmentDetail);
  const adminRole = userRole.includes("ADMIN");
  const [filterValue, setFilterValue] = useState("");
  const [selectedKeys, setSelectedKeys] = useState(new Set([]));
  const [visibleColumns, setVisibleColumns] = useState(
    new Set(INITIAL_VISIBLE_COLUMNS(adminRole))
  );
  const [sortDescriptor, setSortDescriptor] = useState({
    column: "id",
    direction: "ascending",
  });
  const [assignedLeadInfo, setAssignedLeadInfo] = useState({
    statusId: null,
    assigneId: null,
  });
  const deleteModal = useDisclosure();
  const multiDeleteModal = useDisclosure();
  const filterPopOver = useDisclosure();
  const actionPopOver = useDisclosure();
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const initialFilterValues = {
    userId: userId,
    userIdFilter: [],
    statusId: ["1"],
    toDate: "",
    fromDate: "",
    updatedToDate: "",
    updatedfromDate: "",
    originalName: [],
    updatedById: null,
    source: [],
    contactMobileNo: "",
    contactEmail: "",
    sortBy: "id",
    sortDirection: "desc",
    page: 1,
    size: 50,
  };
  const [allMultiFilterData, setAllMultiFilterData] =
    useState(initialFilterValues);
  const [itemId, setItemId] = useState(null);
  const [loading, setLoading] = useState("");

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
    dispatch(getAllLeadsForExport(allMultiFilterData));
    dispatch(toggleAutoOnFeature({ userId, flag: true }));
  }, [dispatch]);

  useEffect(() => {
    dispatch(getAllLeadUser(userId));
    dispatch(getAllStatusData());
    dispatch(getAllUrlList());
  }, [dispatch, userId]);

  const headerColumns = useMemo(() => {
    const cols = columns(adminRole) || [];
    if (visibleColumns === "all") return cols;

    return cols.filter((column) =>
      Array.from(visibleColumns).includes(column.uid)
    );
  }, [visibleColumns, adminRole]);

  const filteredItems = useMemo(() => {
    return [...(data || [])];
  }, [data]);

  const pages = Math.ceil(count / allMultiFilterData?.size) || 1;

  const sortedItems = useMemo(() => {
    return [...filteredItems];
  }, [filteredItems]);

  const visibleCount = sortedItems.length;

  const handleSelectionChange = (selection) => {
    if (selection === "all") {
      const allKeys = new Set(sortedItems.map((item) => item.id));
      setSelectedKeys(allKeys);
    } else {
      setSelectedKeys(selection);
    }
  };

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
      userId: userId,
    };
    dispatch(handleDeleteSingleLead(obj))
      .then((response) => {
        if (response.meta.requestStatus === "fulfilled") {
          addToast({
            title: "Lead deleted successfully !.",
            color: "success",
          });
          dispatch(getAllLeadsByFilter(allMultiFilterData));
          dispatch(getAllLeadCount(allMultiFilterData));
          dispatch(getAllLeadsForExport(allMultiFilterData));
          deleteModal.onClose();
        } else {
          addToast({ title: "Something went wrong !.", color: "danger" });
        }
      })
      .catch(() => {
        addToast({ title: "Something went wrong !.", color: "danger" });
      });
  }, [userId, dispatch, allMultiFilterData, itemId]);

  const handleFlag = useCallback(
    (data) => {
      dispatch(
        handleFlagByQualityTeam({
          currentUerId: userId,
          leadId: data?.id,
          isMarked: data?.reopenByQuality ? false : true,
        })
      )
        .then((resp) => {
          if (resp.meta.requestStatus === "fulfilled") {
            addToast({
              title: "Lead status updated successfully !.",
              color: "success",
            });
            dispatch(getAllLeadsByFilter(allMultiFilterData));
            dispatch(getAllLeadCount(allMultiFilterData));
            dispatch(getAllLeadsForExport(allMultiFilterData));
          } else {
            addToast({ title: "Something went wrong !.", color: "danger" });
          }
        })
        .catch(() =>
          addToast({ title: "Something went wrong !.", color: "danger" })
        );
    },
    [dispatch, userId, allMultiFilterData]
  );

  const renderCell = useCallback(
    (lead, columnKey) => {
      switch (columnKey) {
        case "leadName":
          return (
            <div className="flex  gap-1">
              {department?.department === "Quality Team" && (
                <Flag
                  className="h-4 w-4 cursor-pointer"
                  color={lead?.reopenByQuality ? "red" : "black"}
                  onClick={() => handleFlag(lead)}
                />
              )}

              <div className="flex flex-col">
                <Link
                  to={`${lead?.id}/leadDetail`}
                  className="font-semibold"
                  onClick={() =>
                    dispatch(handleViewHistory({ leadId: lead?.id, userId }))
                  }
                >
                  {lead?.originalName
                    ? lead?.originalName
                    : lead?.leadName || "-"}
                </Link>
                <div className="flex gap-3">
                  <Badge
                    color={lead?.auto ? "success" : "danger"}
                    content=""
                    placement="center-left"
                    shape="circle"
                    size="sm"
                  />
                  <span className="text-xs text-default-500">
                    {dayjs(lead?.createDate).format("DD-MM-YYYY")}
                  </span>
                </div>
              </div>
            </div>
          );
        case "contact":
          if (adminRole) {
            return (
              <div className="flex flex-col">
                <span className="font-normal text-sm">
                  {lead?.clients?.[0]?.name || "-"}
                </span>
                {lead?.email && (
                  <span className="text-default-500 text-sm">
                    {lead?.email || "-"}
                  </span>
                )}
                {lead?.mobileNo && (
                  <span className="text-xs text-default-500">
                    {lead?.mobileNo || "-"}
                  </span>
                )}
              </div>
            );
          } else
            return (
              <div className="flex flex-col">
                <span className="font-normal text-sm">
                  {lead?.clients?.[0]?.name || "-"}
                </span>
              </div>
            );

        case "status":
          return (
            <Chip
              className="capitalize"
              color="primary"
              size="sm"
              variant="flat"
            >
              {lead?.status?.name || "Unknown"}
            </Chip>
          );
        case "assignee":
          return (
            <div className="flex flex-col">
              <span className="font-semibold text-sm">
                {lead?.assignee?.fullName || "-"}
              </span>
              <span className="text-xm text-default-500">
                {lead?.assignee?.email || "-"}
              </span>
            </div>
          );
        case "industry":
          return <p className="text-sm">{lead?.industries?.name}</p> || "-";
        case "city":
          return <p className="text-sm">{lead?.city}</p> || "-";
        case "source":
          return <p className="text-sm">{lead?.source}</p> || "-";
        case "updatedBy":
          return (
            <div className="flex flex-col gap-1">
              <span className="font-normal text-sm">
                {lead?.updatedBy?.fullName}
              </span>
              <span className="font-normal text-xs text-default-500">
                {lead?.updatedDate
                  ? dayjs(lead?.updatedDate).format("DD-MM-YYYY")
                  : "-"}
              </span>
            </div>
          );
        case "Address":
          return (
            <div className="flex flex-col">
              <span className="font-normal text-sm">{lead.address || "-"}</span>
              <span className="text-xs text-default-500">
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
                  {department?.department === "Quality Team" ? (
                    <DropdownItem
                      key="history"
                      href={`erp/${userId}/quality/leads/${lead?.id}/leadHistory`}
                    >
                      History
                    </DropdownItem>
                  ) : (
                    <DropdownItem
                      key="history"
                      href={`erp/${userId}/sales/leads/${lead?.id}/leadHistory`}
                    >
                      History
                    </DropdownItem>
                  )}

                  {/* <DropdownItem
                  key="tasks"
                  href={`erp/${userId}/sales/leads/${lead?.id}/leadTasks`}
                >
                  Lead tasks
                </DropdownItem> */}
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
    },
    [adminRole, department]
  );

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

  const onSearchChange = useCallback(
    (value) => {
      if (value) {
        setFilterValue(value);
        setSelectedKeys(new Set([]));
        setAllMultiFilterData((prev) => ({ ...prev, page: 1 }));
        dispatch(searchLeads({ input: value, id: userId }));
      } else {
        setFilterValue("");
        setSelectedKeys(new Set([]));
        dispatch(getAllLeadsByFilter(initialFilterValues));
        dispatch(getAllLeadCount(initialFilterValues));
        dispatch(getAllLeadsForExport(initialFilterValues));
      }
    },
    [dispatch, userId, initialFilterValues]
  );

  const onClear = useCallback(() => {
    setFilterValue("");
    setAllMultiFilterData((prev) => ({ ...prev, page: 1 }));
  }, []);

  const handleApplyFilter = useCallback(() => {
    dispatch(getAllLeadsByFilter(allMultiFilterData));
    dispatch(getAllLeadCount(allMultiFilterData));
    dispatch(getAllLeadsForExport(allMultiFilterData));
    filterPopOver.onClose();
  }, [allMultiFilterData, dispatch, filterPopOver]);

  const handleResetFilter = useCallback(() => {
    dispatch(getAllLeadsByFilter(initialFilterValues));
    dispatch(getAllLeadCount(initialFilterValues));
    dispatch(getAllLeadsForExport(initialFilterValues));
    setAllMultiFilterData(initialFilterValues);
  }, [initialFilterValues, dispatch]);

  const handleDeleteMutipleLeads = useCallback(() => {
    let obj = {
      leadId: Array.from(selectedKeys),
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
          dispatch(getAllLeadCount(allMultiFilterData));
          dispatch(getAllLeadsForExport(allMultiFilterData));
          setSelectedKeys(new Set([]));
          multiDeleteModal.onClose();
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
      leadIds: Array.from(selectedKeys),
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
          dispatch(getAllLeadCount(allMultiFilterData));
          dispatch(getAllLeadsForExport(allMultiFilterData));
          setSelectedKeys(new Set([]));
          setAssignedLeadInfo({
            statusId: null,
            assigneId: null,
          });
          actionPopOver.onClose();
        } else {
          addToast({ title: "Something went wrong !.", color: "danger" });
        }
      })
      .catch(() => {
        addToast({ title: "Something went wrong !.", color: "danger" });
      });
  }, [
    dispatch,
    selectedKeys,
    userId,
    assignedLeadInfo,
    allMultiFilterData,
    actionPopOver,
  ]);

  const handleTransferLeads = () => {
    let obj = {
      leadIds: Array.from(selectedKeys),
      updatedById: userId,
      ...assignedLeadInfo,
    };
    dispatch(transferLeadToAnotherUser(obj)).then((response) => {
      if (response?.meta?.requestStatus === "fulfilled") {
        addToast({
          title: "Leads transferred successfully !.",
          color: "success",
        });
        dispatch(getAllLeadsByFilter(allMultiFilterData));
        dispatch(getAllLeadCount(allMultiFilterData));
        dispatch(getAllLeadsForExport(allMultiFilterData));
        setSelectedKeys(new Set([]));
        setAssignedLeadInfo({
          statusId: null,
          assigneId: null,
        });
        actionPopOver.onClose();
      } else {
        addToast({ title: "Something went wrong !.", color: "danger" });
      }
    });
  };

  const handleSort = (sortBy, sortDirection) => {
    const updatedData = { ...allMultiFilterData, sortBy, sortDirection };
    setAllMultiFilterData(updatedData);
    dispatch(getAllLeadsByFilter(updatedData));
    dispatch(getAllLeadsForExport(updatedData));
    dispatch(getAllLeadCount(updatedData));
  };

  const topContent = useMemo(() => {
    const cols = columns(adminRole) || [];
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
            {adminRole && (
              <Popover
                size="lg"
                showArrow
                isOpen={actionPopOver.isOpen}
                onOpenChange={(e) => actionPopOver.onOpenChange(e)}
              >
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
                      <p className="text-default-500 text-sm w-full mb-2">
                        {selectedKeys?.size === 0
                          ? "Please select the table rows for action ."
                          : `${selectedKeys?.size} rows are selected`}{" "}
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
                          data={allLeadUser}
                          label={"Assignee"}
                          name={"assigneId"}
                          labelKey={"fullName"}
                          valueKey={"id"}
                          value={assignedLeadInfo?.assigneId}
                          onChange={(selectedSet) => {
                            setAssignedLeadInfo((prev) => ({
                              ...prev,
                              assigneId: selectedSet,
                            }));
                          }}
                        />
                      </div>
                      <div className="flex justify-between gap-2 my-2 w-full">
                        <div className="flex gap-0.5">
                          <Button
                            color="danger"
                            isDisabled={selectedKeys?.size === 0}
                            onPress={() => {
                              multiDeleteModal.onOpen();
                              actionPopOver.onClose();
                            }}
                          >
                            Delete
                          </Button>
                          <Button
                            onPress={() => {
                              actionPopOver.onClose();
                              setSelectedKeys(new Set([]));
                            }}
                          >
                            Cancel
                          </Button>
                        </div>

                        <div className="flex items-center gap-0.5">
                          <Button
                            onPress={handleTransferLeads}
                            isDisabled={selectedKeys?.size === 0}
                          >
                            Transfer leads
                          </Button>
                          <Button
                            color="primary"
                            isDisabled={selectedKeys?.size === 0}
                            onPress={handleMultipleAssignedLeads}
                          >
                            Send
                          </Button>
                        </div>
                      </div>
                    </>
                  )}
                </PopoverContent>
              </Popover>
            )}

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
                          endContent={<ArrowUpWideNarrow />}
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
                          endContent={<ArrowUpWideNarrow />}
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
                          endContent={<ArrowUpWideNarrow />}
                        >
                          Updated date (Desc)
                        </ListboxItem>
                      </Listbox>
                    </div>
                  </>
                )}
              </PopoverContent>
            </Popover>
            <Popover
              showArrow
              isOpen={filterPopOver.isOpen}
              onOpenChange={(e) => filterPopOver.onOpenChange(e)}
            >
              <PopoverTrigger>
                <Button variant="flat" endContent={<ListFilter />}>
                  Filter
                </Button>
              </PopoverTrigger>
              <PopoverContent className="min-w-[550px]">
                {(titleProps) => (
                  <div className="px-1 py-2">
                    <h3 className="my-4 font-bold text-xl" {...titleProps}>
                      Lead filter
                    </h3>
                    <div className="grid grid-cols-2 gap-4 min-w-[500px]">
                      <NewSelect
                        data={allLeadUser || []}
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
                        data={allLeadUser || []}
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
                      <div>
                        <DateRangePicker
                          hideTimeZone
                          granularity="minute"
                          hourCycle={24}
                          visibleMonths={2}
                          label="Created date"
                          value={{
                            start: allMultiFilterData?.toDate
                              ? parseZonedDateTime(
                                  `${allMultiFilterData?.toDate}[Asia/kolkata]`
                                )
                              : null,
                            end: allMultiFilterData?.fromDate
                              ? parseZonedDateTime(
                                  `${allMultiFilterData?.fromDate}[Asia/kolkata]`
                                )
                              : null,
                          }}
                          onChange={(value) => {
                            const formattedStart = value.start
                              ? `${value.start.year}-${String(value.start.month).padStart(2, "0")}-${String(value.start.day).padStart(2, "0")}T${String(value.start.hour).padStart(2, "0")}:${String(value.start.minute).padStart(2, "0")}`
                              : null;
                            const formattedEnd = value.end
                              ? `${value.end.year}-${String(value.end.month).padStart(2, "0")}-${String(value.end.day).padStart(2, "0")}T${String(value.end.hour).padStart(2, "0")}:${String(value.end.minute).padStart(2, "0")}` // Fixed: month -> day
                              : null;
                            setAllMultiFilterData((prev) => ({
                              ...prev,
                              toDate: formattedStart,
                              fromDate: formattedEnd,
                            }));
                          }}
                        />
                      </div>

                      <div>
                        <Select
                          label={"Status"}
                          name={"statusId"}
                          selectionMode="multiple"
                          selectedKeys={
                            new Set(allMultiFilterData?.statusId || [])
                          }
                          onSelectionChange={(e) => {
                            let values = Array.from(e);
                            console.log("values", values);
                            setAllMultiFilterData((prev) => ({
                              ...prev,
                              statusId: values.length > 0 ? values : [],
                            }));
                          }}
                        >
                          {statusList.map((status) => (
                            <SelectItem key={status?.id}>
                              {status?.name}
                            </SelectItem>
                          ))}
                        </Select>
                      </div>

                      <NewSelect
                        data={urlList || []}
                        selectionMode="multiple"
                        label={"Service"}
                        name={"originalName"}
                        labelKey={"urlsName"}
                        valueKey={"urlsName"}
                        value={allMultiFilterData?.originalName}
                        onChange={(selectedSet) => {
                          setAllMultiFilterData((prev) => ({
                            ...prev,
                            originalName: selectedSet,
                          }));
                        }}
                      />

                      <div>
                        <DateRangePicker
                          hideTimeZone
                          granularity="minute"
                          hourCycle={24}
                          visibleMonths={2}
                          label="Updated date"
                          value={{
                            start: allMultiFilterData?.updatedToDate
                              ? parseZonedDateTime(
                                  `${allMultiFilterData?.updatedToDate}[Asia/kolkata]`
                                )
                              : null,
                            end: allMultiFilterData?.updatedfromDate
                              ? parseZonedDateTime(
                                  `${allMultiFilterData?.updatedfromDate}[Asia/kolkata]`
                                )
                              : null,
                          }}
                          onChange={(value) => {
                            const formattedStart = value.start
                              ? `${value.start.year}-${String(value.start.month).padStart(2, "0")}-${String(value.start.day).padStart(2, "0")}T${String(value.start.hour).padStart(2, "0")}:${String(value.start.minute).padStart(2, "0")}`
                              : null;
                            const formattedEnd = value.end
                              ? `${value.end.year}-${String(value.end.month).padStart(2, "0")}-${String(value.end.day).padStart(2, "0")}T${String(value.end.hour).padStart(2, "0")}:${String(value.end.minute).padStart(2, "0")}` // Fixed: month -> day
                              : null;
                            setAllMultiFilterData((prev) => ({
                              ...prev,
                              updatedToDate: formattedStart,
                              updatedfromDate: formattedEnd,
                            }));
                          }}
                        />
                      </div>

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
                {cols?.map((column) => (
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
                <DropdownItem
                  key="allTask"
                  href={`erp/${userId}/sales/allTask`}
                >
                  All task
                </DropdownItem>
                {(department?.department === "Quality Team" || adminRole) && (
                  <DropdownItem key="add" endContent={<Plus />}>
                    Add lead
                  </DropdownItem>
                )}
                {adminRole && (
                  <DropdownItem key="export" endContent={<ArrowUpToLine />}>
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
                {adminRole && (
                  <DropdownItem key="import" endContent={<ArrowDownToLine />}>
                    Import
                  </DropdownItem>
                )}
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
    allLeadUser,
    filterPopOver,
    actionPopOver,
    sortedItems,
    data,
    multiDeleteModal,
  ]);

  const bottomContent = useMemo(() => {
    return (
      <div className="py-2 px-2 flex justify-between items-center">
        <span className="w-[30%] text-small text-default-400">
          {selectedKeys.size === visibleCount
            ? "All items selected"
            : `${selectedKeys?.size} of ${count} selected`}
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
  }, [
    selectedKeys,
    count,
    allMultiFilterData,
    pages,
    hasSearchFilter,
    visibleCount,
  ]);

  const handleOpenModal = () => {
    onOpen();
    dispatch(getAllCountries());
  };

  const handleFinish = (values) => {
    setLoading("pending");
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
          reset(defaultValues);
          setLoading("success");
        } else {
          addToast({ title: "Something went wrong !.", color: "danger" });
          setLoading("rejected");
        }
      })
      .catch(() => {
        addToast({ title: "Something went wrong !.", color: "danger" });
        setLoading("rejected");
      });
  };

  return (
    <>
      {(loading === "pending" || leadsLoading === "pending") && (
        <LoadingSpinner />
      )}
      <h1 className="font-sans text-2xl font-medium mb-1">Leads</h1>
      <Table
        isHeaderSticky
        aria-label="Example table with custom cells, pagination and sorting"
        bottomContent={bottomContent}
        bottomContentPlacement="outside"
        classNames={{
          wrapper: "2xl:max-h-[68vh] md:max-h-[62vh] w-full",
          table: "w-full",
        }}
        selectedKeys={selectedKeys.size === visibleCount ? "all" : selectedKeys}
        selectionMode="multiple"
        sortDescriptor={sortDescriptor}
        topContent={topContent}
        topContentPlacement="outside"
        onSelectionChange={handleSelectionChange}
        onSortChange={setSortDescriptor}
      >
        <TableHeader columns={headerColumns}>
          {(column) => (
            <TableColumn
              key={column?.uid}
              align={column?.uid === "actions" ? "center" : "start"}
              allowsSorting={column?.sortable}
            >
              {column?.name}
            </TableColumn>
          )}
        </TableHeader>
        <TableBody emptyContent={"No data found"} items={sortedItems}>
          {(item) => (
            <TableRow key={item?.id} className={getRowClassName(item)}>
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
                          data={allLeadUser || []}
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
                    <Button
                      color="primary"
                      type="submit"
                      isLoading={loading === "pending"}
                    >
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
      <Modal
        isOpen={multiDeleteModal.isOpen}
        onOpenChange={multiDeleteModal.onOpenChange}
        backdrop="blur"
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">Delete</ModalHeader>
              <ModalBody>
                <p>Are you sure to delete these {selectedKeys?.size} leads ?</p>
              </ModalBody>
              <ModalFooter>
                <Button
                  onPress={() => {
                    onClose();
                    setSelectedKeys(new Set([]));
                  }}
                >
                  No
                </Button>
                <Button color="primary" onPress={handleDeleteMutipleLeads}>
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
