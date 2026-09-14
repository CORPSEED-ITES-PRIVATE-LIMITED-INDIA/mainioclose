import React, { useCallback, useEffect, useMemo, useState } from "react";
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
  ModalBody,
  ModalFooter,
  addToast,
  Chip,
  Switch,
  Textarea,
  Tooltip,
} from "@heroui/react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useParams } from "react-router-dom";
import { ChevronDown, EllipsisVertical, Plus, Search } from "lucide-react";
import * as z from "zod";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import NewSelect from "../../components/NewSelect";
import {
  addLeadAssignmentTeamMember,
  createLeadAssignmentTeam,
  getAllLeadAssignmentTeams,
  getAllSalesManagers,
  getAllSolutionList,
  mapLeadAssignmentTeamToSolution,
  searchSolutionsByName,
  updateLeadAssignmentTeam,
} from "../../toolkit/slices/settingSlice";
import { getAllUsers } from "../../toolkit/slices/commonSlice";

const teamFormSchema = z.object({
  teamName: z.string().min(1, "please enter the team name."),
  description: z.string().optional(),
  managerUserId: z.string().min(1, "please select the manager."),
  autoAssignmentEnabled: z.boolean(),
});

const teamFormDefaultValues = {
  teamName: "",
  description: "",
  managerUserId: "",
  autoAssignmentEnabled: true,
};

const memberFormSchema = z.object({
  salesUserId: z.string().min(1, "please select the sales user."),
  assignmentOrder: z.coerce
    .number({ invalid_type_error: "please enter the assignment order." })
    .min(1, "please enter a valid assignment order."),
  maximumOpenLeads: z.coerce
    .number({ invalid_type_error: "please enter the maximum open leads." })
    .min(1, "please enter a valid maximum open leads."),
  autoAssignmentEnabled: z.boolean(),
});

const memberFormDefaultValues = {
  salesUserId: "",
  assignmentOrder: 1,
  maximumOpenLeads: 50,
  autoAssignmentEnabled: true,
};

const mapSolutionFormSchema = z.object({
  solutionIds: z
    .array(z.string())
    .min(1, "please select at least one solution."),
  priority: z.coerce
    .number({ invalid_type_error: "please enter the priority." })
    .min(0, "please enter a valid priority."),
  dailyAssignmentLimit: z.coerce
    .number({ invalid_type_error: "please enter the daily assignment limit." })
    .min(0, "please enter a valid daily assignment limit."),
  autoAssignmentEnabled: z.boolean(),
});

const mapSolutionFormDefaultValues = {
  solutionIds: [],
  priority: 1,
  dailyAssignmentLimit: 0,
  autoAssignmentEnabled: true,
};

const activeFilterOptions = [
  { id: "all", name: "All" },
  { id: "true", name: "Active" },
  { id: "false", name: "Inactive" },
];

export const columns = [
  { name: "#", uid: "id" },
  { name: "TEAM CODE", uid: "teamCode" },
  { name: "TEAM NAME", uid: "teamName" },
  { name: "MANAGER", uid: "manager" },
  { name: "MEMBERS", uid: "memberCount" },
  { name: "SOLUTIONS", uid: "solutions" },
  { name: "AUTO ASSIGN", uid: "autoAssignmentEnabled" },
  { name: "STATUS", uid: "active" },
  { name: "ACTIONS", uid: "actions" },
];

const INITIAL_VISIBLE_COLUMNS = [
  "id",
  "teamCode",
  "teamName",
  "manager",
  "memberCount",
  "solutions",
  "autoAssignmentEnabled",
  "active",
  "actions",
];

// Only the first two mapped solutions are shown inline; the rest collapse
// into a "+N" chip whose tooltip lists every remaining solution name.
const MAX_VISIBLE_SOLUTIONS = 2;

const LeadAssignmentTeams = () => {
  const { userId } = useParams();
  const dispatch = useDispatch();

  const teamsPage = useSelector(
    (state) => state.setting.leadAssignmentTeamsList,
  );
  const salesManagersList = useSelector(
    (state) => state.setting.salesManagersList,
  );
  const usersList = useSelector((state) => state.common.usersList);
  const allSolutionList = useSelector(
    (state) => state.setting.allSolutionList,
  );
  const solutionSearchResults = useSelector(
    (state) => state.setting.solutionsList,
  );

  const teams = teamsPage?.content || [];
  const totalElements = teamsPage?.totalElements || 0;

  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const memberModal = useDisclosure();
  const mapSolutionModal = useDisclosure();

  const [filterValue, setFilterValue] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");
  const [visibleColumns, setVisibleColumns] = useState(
    new Set(INITIAL_VISIBLE_COLUMNS),
  );
  const [initialFilteration, setInitialFilteration] = useState({
    page: 1,
    size: 10,
  });
  const [item, setItem] = useState(null);
  const [solutionSearchTerm, setSolutionSearchTerm] = useState("");

  const { control, handleSubmit, reset } = useForm({
    resolver: zodResolver(teamFormSchema),
    defaultValues: teamFormDefaultValues,
  });

  const memberForm = useForm({
    resolver: zodResolver(memberFormSchema),
    defaultValues: memberFormDefaultValues,
  });

  const mapSolutionForm = useForm({
    resolver: zodResolver(mapSolutionFormSchema),
    defaultValues: mapSolutionFormDefaultValues,
  });

  const fetchTeams = useCallback(() => {
    dispatch(
      getAllLeadAssignmentTeams({
        search: filterValue || undefined,
        active: activeFilter === "all" ? undefined : activeFilter,
        page: (initialFilteration?.page || 1) - 1,
        size: initialFilteration?.size,
        sort: ["createdAt,desc"],
      }),
    );
  }, [dispatch, filterValue, activeFilter, initialFilteration]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchTeams();
    }, 300);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterValue, activeFilter, initialFilteration]);

  // Debounced solution search inside the "Map to solution" modal — reuses the
  // existing solution search API (searchSolutionByName) instead of filtering
  // the full ~900 row getAllSolution list on every keystroke.
  useEffect(() => {
    const trimmedValue = solutionSearchTerm?.trim() || "";

    const timer = setTimeout(() => {
      if (trimmedValue.length > 2) {
        dispatch(
          searchSolutionsByName({
            name: trimmedValue,
            page: 1,
            size: 50,
            userId,
          }),
        );
      } else if (trimmedValue.length === 0) {
        dispatch(getAllSolutionList(userId));
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [dispatch, solutionSearchTerm, userId]);

  const managerOptions = useMemo(
    () =>
      (salesManagersList || []).map((manager) => ({
        ...manager,
        displayLabel: manager?.designation
          ? `${manager?.fullName} — ${manager?.designation}`
          : manager?.fullName,
      })),
    [salesManagersList],
  );

  const salesUserOptions = useMemo(
    () =>
      (usersList || []).map((user) => ({
        ...user,
        displayLabel: user?.email
          ? `${user?.fullName} (${user?.email})`
          : user?.fullName,
      })),
    [usersList],
  );

  const solutionOptions = useMemo(() => {
    const source =
      solutionSearchTerm?.trim()?.length > 2
        ? solutionSearchResults
        : allSolutionList;

    return (source || []).map((solution) => ({
      ...solution,
      displayLabel: solution?.type
        ? `${solution?.name} (${solution?.type})`
        : solution?.name,
    }));
  }, [allSolutionList, solutionSearchResults, solutionSearchTerm]);

  const pages = Math.ceil(totalElements / initialFilteration?.size) || 1;

  const handleOpenCreateModal = () => {
    setItem(null);
    reset(teamFormDefaultValues);
    dispatch(getAllSalesManagers(userId));
    onOpen();
  };

  const handleOpenEditModal = (rowData) => {
    setItem(rowData);
    reset({
      teamName: rowData?.teamName || "",
      description: rowData?.description || "",
      managerUserId: rowData?.manager?.id ? String(rowData?.manager?.id) : "",
      autoAssignmentEnabled: rowData?.autoAssignmentEnabled ?? true,
    });
    dispatch(getAllSalesManagers(userId));
    onOpen();
  };

  const handleOpenAddMemberModal = (rowData) => {
    setItem(rowData);
    memberForm.reset(memberFormDefaultValues);
    dispatch(getAllUsers());
    memberModal.onOpen();
  };

  const handleOpenMapSolutionModal = (rowData) => {
    setItem(rowData);
    mapSolutionForm.reset(mapSolutionFormDefaultValues);
    setSolutionSearchTerm("");
    dispatch(getAllSolutionList(userId));
    mapSolutionModal.onOpen();
  };

  const handleFinish = (values) => {
    const isEdit = Boolean(item);

    const request = isEdit
      ? dispatch(
          updateLeadAssignmentTeam({
            teamId: item?.id,
            data: {
              teamName: values?.teamName,
              description: values?.description,
              managerUserId: Number(values?.managerUserId),
              autoAssignmentEnabled: values?.autoAssignmentEnabled,
              updatedByUserId: Number(userId),
            },
          }),
        )
      : dispatch(
          createLeadAssignmentTeam({
            teamName: values?.teamName,
            description: values?.description,
            managerUserId: Number(values?.managerUserId),
            autoAssignmentEnabled: values?.autoAssignmentEnabled,
            createdByUserId: Number(userId),
          }),
        );

    request
      .then((response) => {
        if (response.meta.requestStatus === "fulfilled") {
          addToast({
            title: "SUCCESS",
            description: `Team ${isEdit ? "updated" : "created"} successfully !.`,
            color: "success",
          });
          onOpenChange(false);
          reset(teamFormDefaultValues);
          setItem(null);
          fetchTeams();
        } else {
          addToast({
            title: response?.payload?.status || "ERROR",
            description:
              response?.payload?.data?.message ||
              `Something went wrong while ${isEdit ? "updating" : "creating"} the team.`,
            color: "danger",
          });
        }
      })
      .catch(() => {
        addToast({ title: "ERROR", description: "Something went wrong !.", color: "danger" });
      });
  };

  const handleAddMember = (values) => {
    dispatch(
      addLeadAssignmentTeamMember({
        teamId: item?.id,
        salesUserId: Number(values?.salesUserId),
        assignmentOrder: Number(values?.assignmentOrder),
        maximumOpenLeads: Number(values?.maximumOpenLeads),
        autoAssignmentEnabled: values?.autoAssignmentEnabled,
        createdByUserId: Number(userId),
      }),
    )
      .then((response) => {
        if (response.meta.requestStatus === "fulfilled") {
          addToast({
            title: "SUCCESS",
            description: "Member added to the team successfully !.",
            color: "success",
          });
          memberModal.onOpenChange(false);
          memberForm.reset(memberFormDefaultValues);
          setItem(null);
          fetchTeams();
        } else {
          addToast({
            title: response?.payload?.status || "ERROR",
            description:
              response?.payload?.data?.message ||
              "Something went wrong while adding the member.",
            color: "danger",
          });
        }
      })
      .catch(() => {
        addToast({ title: "ERROR", description: "Something went wrong !.", color: "danger" });
      });
  };

  const handleMapSolution = (values) => {
    dispatch(
      mapLeadAssignmentTeamToSolution({
        solutionIds: (values?.solutionIds || []).map(Number),
        teamId: item?.id,
        priority: Number(values?.priority),
        dailyAssignmentLimit: Number(values?.dailyAssignmentLimit),
        autoAssignmentEnabled: values?.autoAssignmentEnabled,
        createdByUserId: Number(userId),
      }),
    )
      .then((response) => {
        if (response.meta.requestStatus === "fulfilled") {
          addToast({
            title: "SUCCESS",
            description: "Team mapped to the solution(s) successfully !.",
            color: "success",
          });
          mapSolutionModal.onOpenChange(false);
          mapSolutionForm.reset(mapSolutionFormDefaultValues);
          setItem(null);
          fetchTeams();
        } else {
          addToast({
            title: response?.payload?.status || "ERROR",
            description:
              response?.payload?.data?.message ||
              "Something went wrong while mapping the solution.",
            color: "danger",
          });
        }
      })
      .catch(() => {
        addToast({
          title: "ERROR",
          description: "Something went wrong !.",
          color: "danger",
        });
      });
  };

  const renderCell = React.useCallback((rowData, columnKey) => {
    switch (columnKey) {
      case "id":
        return <span>{rowData?.id}</span>;

      case "teamCode":
        return <span>{rowData?.teamCode}</span>;

      case "teamName":
        return (
          <Link
            className="font-medium text-primary hover:underline"
            to={`${rowData?.id}`}
          >
            {rowData?.teamName}
          </Link>
        );

      case "manager":
        return (
          <div className="flex flex-col">
            <span>{rowData?.manager?.fullName || "-"}</span>
            {rowData?.manager?.email && (
              <span className="text-[11px] text-default-400">
                {rowData?.manager?.email}
              </span>
            )}
          </div>
        );

      case "memberCount":
        return <Chip size="sm" variant="flat">{rowData?.memberCount ?? 0}</Chip>;

      case "solutions": {
        const solutions = rowData?.solutions || [];

        if (!solutions.length) {
          return <span className="text-default-400">-</span>;
        }

        const visibleSolutions = solutions.slice(0, MAX_VISIBLE_SOLUTIONS);
        const remainingSolutions = solutions.slice(MAX_VISIBLE_SOLUTIONS);

        return (
          <div className="flex flex-wrap items-center gap-1">
            {visibleSolutions.map((solution) => (
              <Chip
                key={solution?.mappingId ?? solution?.solutionId}
                size="sm"
                variant="flat"
              >
                {solution?.solutionName}
              </Chip>
            ))}

            {remainingSolutions.length > 0 && (
              <Tooltip
                content={
                  <div className="flex max-w-[240px] flex-col gap-0.5 py-1">
                    {remainingSolutions.map((solution) => (
                      <span
                        key={solution?.mappingId ?? solution?.solutionId}
                        className="text-[12px]"
                      >
                        {solution?.solutionName}
                      </span>
                    ))}
                  </div>
                }
              >
                <Chip size="sm" variant="flat" className="cursor-default">
                  +{remainingSolutions.length}
                </Chip>
              </Tooltip>
            )}
          </div>
        );
      }

      case "autoAssignmentEnabled":
        return (
          <Chip
            size="sm"
            variant="flat"
            color={rowData?.autoAssignmentEnabled ? "success" : "default"}
          >
            {rowData?.autoAssignmentEnabled ? "Enabled" : "Disabled"}
          </Chip>
        );

      case "active":
        return (
          <Chip
            size="sm"
            variant="flat"
            color={rowData?.active ? "success" : "danger"}
          >
            {rowData?.active ? "Active" : "Inactive"}
          </Chip>
        );

      case "actions":
        return (
          <div className="relative flex items-center justify-center">
            <Dropdown>
              <DropdownTrigger>
                <Button isIconOnly size="sm" variant="light">
                  <EllipsisVertical size={18} />
                </Button>
              </DropdownTrigger>

              <DropdownMenu
                selectionMode="single"
                onSelectionChange={(e) => {
                  const key = Array.from(e)[0];

                  if (key === "edit") {
                    handleOpenEditModal(rowData);
                  } else if (key === "addMember") {
                    handleOpenAddMemberModal(rowData);
                  } else if (key === "mapSolution") {
                    handleOpenMapSolutionModal(rowData);
                  }
                }}
              >
                <DropdownItem key="edit">Edit</DropdownItem>
                <DropdownItem key="addMember">Add member</DropdownItem>
                <DropdownItem key="mapSolution">Map to solution</DropdownItem>
              </DropdownMenu>
            </Dropdown>
          </div>
        );

      default:
        return rowData[columnKey];
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const headerColumns = useMemo(() => {
    if (visibleColumns === "all") return columns;

    return columns.filter((column) =>
      Array.from(visibleColumns).includes(column.uid),
    );
  }, [visibleColumns]);

  const onNextPage = useCallback(() => {
    if (initialFilteration?.page < pages) {
      setInitialFilteration((prev) => ({ ...prev, page: prev.page + 1 }));
    }
  }, [initialFilteration?.page, pages]);

  const onPreviousPage = useCallback(() => {
    if (initialFilteration?.page > 1) {
      setInitialFilteration((prev) => ({ ...prev, page: prev.page - 1 }));
    }
  }, [initialFilteration?.page]);

  const onRowsPerPageChange = useCallback((e) => {
    setInitialFilteration((prev) => ({
      ...prev,
      size: Number(e.target.value),
      page: 1,
    }));
  }, []);

  const onSearchChange = useCallback((value) => {
    setFilterValue(value || "");
    setInitialFilteration((prev) => ({ ...prev, page: 1 }));
  }, []);

  const onClear = useCallback(() => {
    setFilterValue("");
    setInitialFilteration((prev) => ({ ...prev, page: 1 }));
  }, []);

  const topContent = useMemo(() => {
    return (
      <div className="flex flex-col gap-2">
        <div className="flex justify-between gap-2 items-center flex-wrap">
          <div className="flex gap-2 flex-wrap items-center">
            <Input
              isClearable
              size="sm"
              className="w-full sm:max-w-[280px]"
              classNames={{ inputWrapper: "h-8 min-h-8" }}
              placeholder="Search teams..."
              startContent={<Search className="w-4 h-4 text-default-400" />}
              value={filterValue}
              onClear={onClear}
              onValueChange={onSearchChange}
            />
          </div>

          <div className="flex gap-1.5 flex-wrap items-center">
            <Dropdown>
              <DropdownTrigger className="hidden sm:flex">
                <Button
                  size="sm"
                  variant="flat"
                  className="capitalize"
                  endContent={<ChevronDown className="w-3.5 h-3.5" />}
                >
                  {activeFilterOptions.find(
                    (option) => option.id === activeFilter,
                  )?.name || "Status"}
                </Button>
              </DropdownTrigger>

              <DropdownMenu
                disallowEmptySelection
                aria-label="Status filter"
                selectedKeys={[activeFilter]}
                selectionMode="single"
                onSelectionChange={(keys) => {
                  const [value] = Array.from(keys);
                  setActiveFilter(value || "all");
                  setInitialFilteration((prev) => ({ ...prev, page: 1 }));
                }}
              >
                {activeFilterOptions.map((option) => (
                  <DropdownItem key={option.id}>{option.name}</DropdownItem>
                ))}
              </DropdownMenu>
            </Dropdown>

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
                    {column.name}
                  </DropdownItem>
                ))}
              </DropdownMenu>
            </Dropdown>

            <Button
              size="sm"
              color="primary"
              onPress={handleOpenCreateModal}
              endContent={<Plus className="w-3.5 h-3.5" />}
            >
              Add New Team
            </Button>
          </div>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-default-400 text-[12.5px]">
            Total {totalElements} teams
          </span>

          <label className="flex items-center gap-1 text-default-400 text-[12.5px]">
            Rows per page:
            <select
              className="bg-transparent outline-hidden text-default-400 text-[12.5px] cursor-pointer"
              onChange={onRowsPerPageChange}
              value={initialFilteration?.size}
            >
              <option value="10">10</option>
              <option value="25">25</option>
              <option value="50">50</option>
            </select>
          </label>
        </div>
      </div>
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    filterValue,
    activeFilter,
    visibleColumns,
    onSearchChange,
    onClear,
    totalElements,
    initialFilteration?.size,
    onRowsPerPageChange,
  ]);

  const bottomContent = useMemo(() => {
    return (
      <div className="py-1.5 px-1 flex justify-between items-center">
        <span className="w-[30%] text-[12.5px] text-default-400">
          Page {initialFilteration?.page} of {pages}
        </span>

        <Pagination
          isCompact
          showControls
          color="primary"
          page={initialFilteration?.page}
          total={pages}
          onChange={(e) =>
            setInitialFilteration((prev) => ({ ...prev, page: e }))
          }
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
  }, [initialFilteration?.page, pages, onPreviousPage, onNextPage]);

  return (
    <>
      <div className="flex flex-col gap-2">
        <h1 className="font-sans text-lg font-semibold mb-2 shrink-0">
          Lead Assignment Teams
        </h1>

        <Table
          isHeaderSticky
          removeWrapper={false}
          aria-label="Lead assignment teams table"
          bottomContent={bottomContent}
          bottomContentPlacement="outside"
          topContent={topContent}
          topContentPlacement="outside"
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
          <TableHeader columns={headerColumns}>
            {(column) => (
              <TableColumn
                key={column.uid}
                align={column.uid === "actions" ? "center" : "start"}
              >
                {column.name}
              </TableColumn>
            )}
          </TableHeader>

          <TableBody emptyContent={"No data found"} items={teams}>
            {(rowItem) => (
              <TableRow key={rowItem.id}>
                {(columnKey) => (
                  <TableCell>{renderCell(rowItem, columnKey)}</TableCell>
                )}
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Create team modal */}
      <Modal
        size="xl"
        isDismissable={false}
        isKeyboardDismissDisabled={true}
        isOpen={isOpen}
        onOpenChange={(open) => {
          onOpenChange(open);
          if (!open) {
            setItem(null);
            reset(teamFormDefaultValues);
          }
        }}
        placement="top-center"
        scrollBehavior="inside"
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader>{item ? "Update team" : "Create team"}</ModalHeader>

              <ModalBody>
                <form
                  className="flex max-h-[65vh] w-full flex-col gap-4 overflow-auto"
                  onSubmit={handleSubmit(handleFinish)}
                >
                  <Controller
                    name="teamName"
                    control={control}
                    render={({ field, fieldState: { error } }) => (
                      <Input
                        isRequired
                        isInvalid={!!error}
                        errorMessage={error?.message || "Please enter team name"}
                        label="Team name"
                        {...field}
                      />
                    )}
                  />

                  <Controller
                    name="description"
                    control={control}
                    render={({ field }) => (
                      <Textarea label="Description" {...field} />
                    )}
                  />

                  <Controller
                    name="managerUserId"
                    control={control}
                    render={({ field, fieldState: { error } }) => (
                      <NewSelect
                        isRequired
                        label="Manager"
                        errorMessage={error?.message || "please select the manager."}
                        isInvalid={!!error}
                        data={managerOptions}
                        labelKey="displayLabel"
                        valueKey="id"
                        value={field.value}
                        onChange={(value) => field.onChange(value)}
                      />
                    )}
                  />

                  <Controller
                    name="autoAssignmentEnabled"
                    control={control}
                    render={({ field }) => (
                      <Switch
                        isSelected={field.value}
                        onValueChange={field.onChange}
                        size="sm"
                      >
                        Enable auto assignment
                      </Switch>
                    )}
                  />

                  <ModalFooter className="px-0">
                    <Button variant="flat" onPress={onClose}>
                      Cancel
                    </Button>

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

      {/* Add member modal */}
      <Modal
        size="xl"
        isDismissable={false}
        isKeyboardDismissDisabled={true}
        isOpen={memberModal.isOpen}
        onOpenChange={(open) => {
          memberModal.onOpenChange(open);
          if (!open) {
            setItem(null);
            memberForm.reset(memberFormDefaultValues);
          }
        }}
        placement="top-center"
        scrollBehavior="inside"
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader>Add member to {item?.teamName}</ModalHeader>

              <ModalBody>
                <form
                  className="flex max-h-[65vh] w-full flex-col gap-4 overflow-auto"
                  onSubmit={memberForm.handleSubmit(handleAddMember)}
                >
                  <Controller
                    name="salesUserId"
                    control={memberForm.control}
                    render={({ field, fieldState: { error } }) => (
                      <NewSelect
                        isRequired
                        label="Sales user"
                        errorMessage={
                          error?.message || "please select the sales user."
                        }
                        isInvalid={!!error}
                        data={salesUserOptions}
                        labelKey="displayLabel"
                        valueKey="id"
                        value={field.value}
                        onChange={(value) => field.onChange(value)}
                      />
                    )}
                  />

                  <Controller
                    name="assignmentOrder"
                    control={memberForm.control}
                    render={({ field, fieldState: { error } }) => (
                      <Input
                        isRequired
                        type="number"
                        min={1}
                        isInvalid={!!error}
                        errorMessage={error?.message}
                        label="Assignment order"
                        {...field}
                      />
                    )}
                  />

                  <Controller
                    name="maximumOpenLeads"
                    control={memberForm.control}
                    render={({ field, fieldState: { error } }) => (
                      <Input
                        isRequired
                        type="number"
                        min={1}
                        isInvalid={!!error}
                        errorMessage={error?.message}
                        label="Maximum open leads"
                        {...field}
                      />
                    )}
                  />

                  <Controller
                    name="autoAssignmentEnabled"
                    control={memberForm.control}
                    render={({ field }) => (
                      <Switch
                        isSelected={field.value}
                        onValueChange={field.onChange}
                        size="sm"
                      >
                        Enable auto assignment
                      </Switch>
                    )}
                  />

                  <ModalFooter className="px-0">
                    <Button variant="flat" onPress={onClose}>
                      Cancel
                    </Button>

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

      {/* Map team to solution modal */}
      <Modal
        size="xl"
        isDismissable={false}
        isKeyboardDismissDisabled={true}
        isOpen={mapSolutionModal.isOpen}
        onOpenChange={(open) => {
          mapSolutionModal.onOpenChange(open);
          if (!open) {
            setItem(null);
            mapSolutionForm.reset(mapSolutionFormDefaultValues);
            setSolutionSearchTerm("");
          }
        }}
        placement="top-center"
        scrollBehavior="inside"
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader>Map {item?.teamName} to a solution</ModalHeader>

              <ModalBody>
                <form
                  className="flex max-h-[65vh] w-full flex-col gap-4 overflow-auto"
                  onSubmit={mapSolutionForm.handleSubmit(handleMapSolution)}
                >
                  <Controller
                    name="solutionIds"
                    control={mapSolutionForm.control}
                    render={({ field, fieldState: { error } }) => (
                      <NewSelect
                        isRequired
                        selectionMode="multiple"
                        label="Solutions"
                        placeholder="Search solutions by name..."
                        errorMessage={
                          error?.message ||
                          "please select at least one solution."
                        }
                        isInvalid={!!error}
                        data={solutionOptions}
                        labelKey="displayLabel"
                        valueKey="id"
                        value={field.value}
                        onChange={(value) => field.onChange(value)}
                        onSearchChange={setSolutionSearchTerm}
                      />
                    )}
                  />

                  <Controller
                    name="priority"
                    control={mapSolutionForm.control}
                    render={({ field, fieldState: { error } }) => (
                      <Input
                        isRequired
                        type="number"
                        min={0}
                        isInvalid={!!error}
                        errorMessage={error?.message}
                        label="Priority"
                        {...field}
                      />
                    )}
                  />

                  <Controller
                    name="dailyAssignmentLimit"
                    control={mapSolutionForm.control}
                    render={({ field, fieldState: { error } }) => (
                      <Input
                        isRequired
                        type="number"
                        min={0}
                        isInvalid={!!error}
                        errorMessage={error?.message}
                        label="Daily assignment limit"
                        {...field}
                      />
                    )}
                  />

                  <Controller
                    name="autoAssignmentEnabled"
                    control={mapSolutionForm.control}
                    render={({ field }) => (
                      <Switch
                        isSelected={field.value}
                        onValueChange={field.onChange}
                        size="sm"
                      >
                        Enable auto assignment
                      </Switch>
                    )}
                  />

                  <ModalFooter className="px-0">
                    <Button variant="flat" onPress={onClose}>
                      Cancel
                    </Button>

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
    </>
  );
};

export default LeadAssignmentTeams;
