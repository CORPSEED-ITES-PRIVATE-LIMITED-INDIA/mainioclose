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
  Spinner,
  Textarea,
} from "@heroui/react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useLocation, useParams } from "react-router-dom";
import { ChevronDown, Search } from "lucide-react";
import * as z from "zod";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import NewSelect from "../../components/NewSelect";
import {
  addSalesTeamMember,
  assignCompaniesToTeamMember,
  getSalesTeamMembers,
  getSalesTeamsBySubDepartmentId,
  getSubDepartmentCompanies,
  unMapUserFromTeam, // CHANGE 1: unmap thunk
} from "../../toolkit/slices/settingSlice";
import { getAllUsers } from "../../toolkit/slices/commonSlice";

// Matches AddSalesTeamMemberRequestDto.
const addMemberFormSchema = z.object({
  salesUserId: z.string().min(1, "please select the sales user."),
  dailyAssignmentLimit: z.coerce
    .number({ invalid_type_error: "please enter the daily assignment limit." })
    .min(0, "please enter a valid daily assignment limit."),
  monthlyAssignmentLimit: z.coerce
    .number({
      invalid_type_error: "please enter the monthly assignment limit.",
    })
    .min(0, "please enter a valid monthly assignment limit."),
  autoAssignmentEnabled: z.boolean(),
  manualAssignmentEnabled: z.boolean(),
});

const addMemberFormDefaultValues = {
  salesUserId: "",
  dailyAssignmentLimit: 0,
  monthlyAssignmentLimit: 0,
  autoAssignmentEnabled: true,
  manualAssignmentEnabled: true,
};

const mapCompaniesFormSchema = z.object({
  companyIds: z.array(z.string()).min(1, "please select at least one company."),
  reason: z.string().optional(),
});

const mapCompaniesFormDefaultValues = {
  companyIds: [],
  reason: "",
};

const activeFilterOptions = [
  { id: "all", name: "All" },
  { id: "true", name: "Active" },
  { id: "false", name: "Inactive" },
];

// Matches SalesTeamResponseDto — teams are backend-managed ("come by
// default"), so there is no create/edit-team column or action here.
const columns = [
  { name: "#", uid: "teamId" },
  { name: "TEAM CODE", uid: "teamCode" },
  { name: "TEAM NAME", uid: "teamName" },
  { name: "WORK FUNCTION", uid: "workFunction" },
  { name: "MANAGER", uid: "managerName" },
  { name: "AUTO ASSIGN", uid: "autoAssignmentEnabled" },
  { name: "MANUAL ASSIGN", uid: "manualAssignmentEnabled" },
  { name: "STATUS", uid: "active" },
  { name: "MEMBERS", uid: "members" },
];

const memberColumns = [
  { name: "MEMBER", uid: "userName" },
  { name: "EMAIL", uid: "userEmail" },
  { name: "DAILY LIMIT", uid: "dailyAssignmentLimit" },
  { name: "MONTHLY LIMIT", uid: "monthlyAssignmentLimit" },
  { name: "AUTO ASSIGN", uid: "autoAssignmentEnabled" },
  { name: "MANUAL ASSIGN", uid: "manualAssignmentEnabled" },
  { name: "AVAILABLE", uid: "availableForAssignment" },
  { name: "STATUS", uid: "active" },
  { name: "COMPANIES", uid: "companies" },
  { name: "ACTIONS", uid: "actions" },
];

const SubDepartmentTeams = () => {
  const { subDepartmentId } = useParams();
  const location = useLocation();
  const dispatch = useDispatch();

  const currentUser = useSelector((state) => state.auth.currentUser);
  const currentUserId = currentUser?.id || currentUser?.userId;

  const subDepartmentName = location?.state?.subDepartmentName;

  const salesTeamsList = useSelector((state) => state.setting.salesTeamsList);
  const isTeamsLoading =
    useSelector((state) => state.setting.salesTeamsLoading) === "pending";

  const salesTeamMembersList = useSelector(
    (state) => state.setting.salesTeamMembersList,
  );
  const isMembersLoading =
    useSelector((state) => state.setting.salesTeamMembersLoading) === "pending";

  const usersList = useSelector((state) => state.common.usersList);

  // Companies already allocated to this sub-department — the only companies a
  // team member of it can be given.
  const subDepartmentCompaniesList = useSelector(
    (state) => state.setting.subDepartmentCompaniesList,
  );
  const isCompaniesLoading =
    useSelector((state) => state.setting.subDepartmentCompaniesLoading) ===
    "pending";

  const activeCompanyAssignments = useMemo(
    () =>
      (subDepartmentCompaniesList || []).filter(
        (assignment) => assignment?.active !== false,
      ),
    [subDepartmentCompaniesList],
  );

  // One option per company; flags companies currently held by someone else so
  // the admin can see they would be re-assigned.
  const companyOptions = useMemo(() => {
    const byCompanyId = new Map();

    activeCompanyAssignments.forEach((assignment) => {
      if (byCompanyId.has(assignment?.companyId)) return;
      byCompanyId.set(assignment?.companyId, {
        id: assignment?.companyId,
        displayLabel: assignment?.assignedUserName
          ? `${assignment?.companyName} (${assignment?.assignedUserName})`
          : assignment?.companyName,
      });
    });

    return Array.from(byCompanyId.values());
  }, [activeCompanyAssignments]);

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

  const membersModal = useDisclosure();
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [mappingMember, setMappingMember] = useState(null);

  // CHANGE 2: unmap confirmation state
  const unmapModal = useDisclosure();
  const [unmappingMember, setUnmappingMember] = useState(null);
  const [isUnmapping, setIsUnmapping] = useState(false);

  const [filterValue, setFilterValue] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");
  const [filteration, setFilteration] = useState({
    page: 1,
    size: 10,
  });

  const addMemberForm = useForm({
    resolver: zodResolver(addMemberFormSchema),
    defaultValues: addMemberFormDefaultValues,
  });

  const mapCompaniesForm = useForm({
    resolver: zodResolver(mapCompaniesFormSchema),
    defaultValues: mapCompaniesFormDefaultValues,
  });

  const getMemberCompanyIds = (member) =>
    activeCompanyAssignments
      .filter(
        (assignment) =>
          assignment?.assignedSalesTeamMemberId === member?.memberId,
      )
      .map((assignment) => String(assignment.companyId));

  const refreshSubDepartmentCompanies = () =>
    dispatch(
      getSubDepartmentCompanies({
        subDepartmentId,
        requestingUserId: currentUserId,
      }),
    );

  useEffect(() => {
    if (subDepartmentId) {
      dispatch(getSalesTeamsBySubDepartmentId(subDepartmentId));
    }
  }, [dispatch, subDepartmentId]);

  const hasSearchFilter = Boolean(filterValue);

  // The sales-teams endpoint has no search/active/page/size query params, so
  // filtering and pagination happen client-side, same as SubDepartment.jsx.
  const filteredItems = useMemo(() => {
    let filtered = [...(salesTeamsList || [])];

    if (hasSearchFilter) {
      const needle = filterValue.toLowerCase();

      filtered = filtered.filter((item) =>
        Object.values(item || {}).some((val) => {
          if (val === null || typeof val === "object") return false;
          return String(val).toLowerCase().includes(needle);
        }),
      );
    }

    if (activeFilter !== "all") {
      const wantActive = activeFilter === "true";
      filtered = filtered.filter(
        (item) => Boolean(item?.active) === wantActive,
      );
    }

    return filtered;
  }, [salesTeamsList, filterValue, hasSearchFilter, activeFilter]);

  const totalElements = filteredItems.length;
  const pages = Math.ceil(totalElements / filteration?.size) || 1;

  const pagedItems = useMemo(() => {
    const start = (filteration?.page - 1) * filteration?.size;
    const end = start + filteration?.size;
    return filteredItems.slice(start, end);
  }, [filteredItems, filteration]);

  const handleOpenMembersModal = (rowData) => {
    setSelectedTeam(rowData);
    setMappingMember(null);
    addMemberForm.reset(addMemberFormDefaultValues);
    mapCompaniesForm.reset(mapCompaniesFormDefaultValues);
    dispatch(getAllUsers());
    refreshSubDepartmentCompanies();
    dispatch(getSalesTeamMembers({ subDepartmentId, teamId: rowData?.teamId }));
    membersModal.onOpen();
  };

  const handleOpenMapCompanies = (member) => {
    setMappingMember(member);
    mapCompaniesForm.reset({
      ...mapCompaniesFormDefaultValues,
      companyIds: getMemberCompanyIds(member),
    });
  };

  const handleCloseMapCompanies = () => {
    setMappingMember(null);
    mapCompaniesForm.reset(mapCompaniesFormDefaultValues);
  };

  // CHANGE 3: unmap handlers
  const handleOpenUnmap = (member) => {
    setUnmappingMember(member);
    unmapModal.onOpen();
  };

  const handleCloseUnmap = () => {
    setUnmappingMember(null);
    unmapModal.onClose();
  };

  const handleConfirmUnmap = () => {
    setIsUnmapping(true);

    dispatch(
      unMapUserFromTeam({
        subDepartmentId,
        teamId: selectedTeam?.teamId,
        salesUserId: unmappingMember?.userId,
        userId: Number(currentUserId),
      }),
    )
      .then((response) => {
        if (response.meta.requestStatus === "fulfilled") {
          addToast({
            title: "SUCCESS",
            description: "Member removed from the team successfully !.",
            color: "success",
          });

          if (mappingMember?.memberId === unmappingMember?.memberId) {
            handleCloseMapCompanies();
          }

          handleCloseUnmap();
          dispatch(
            getSalesTeamMembers({
              subDepartmentId,
              teamId: selectedTeam?.teamId,
            }),
          );
          refreshSubDepartmentCompanies();
        } else {
          addToast({
            title: response?.payload?.status || "ERROR",
            description:
              response?.payload?.data?.message ||
              response?.payload?.message ||
              "Something went wrong while removing the member.",
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
      })
      .finally(() => setIsUnmapping(false));
  };

  const handleMapCompanies = (values) => {
    dispatch(
      assignCompaniesToTeamMember({
        subDepartmentId,
        salesTeamMemberId: mappingMember?.memberId,
        data: {
          companyIds: (values?.companyIds || []).map(Number),
          assignedByUserId: Number(currentUserId),
          reason: values?.reason || "",
        },
      }),
    )
      .then((response) => {
        if (response.meta.requestStatus === "fulfilled") {
          addToast({
            title: "SUCCESS",
            description: "Companies mapped to the member successfully !.",
            color: "success",
          });
          handleCloseMapCompanies();
          refreshSubDepartmentCompanies();
        } else {
          addToast({
            title: response?.payload?.status || "ERROR",
            description:
              response?.payload?.data?.message ||
              response?.payload?.message ||
              "Something went wrong while mapping the companies.",
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

  const handleAddMember = (values) => {
    dispatch(
      addSalesTeamMember({
        subDepartmentId,
        teamId: selectedTeam?.teamId,
        data: {
          salesUserId: Number(values?.salesUserId),
          dailyAssignmentLimit: Number(values?.dailyAssignmentLimit),
          monthlyAssignmentLimit: Number(values?.monthlyAssignmentLimit),
          autoAssignmentEnabled: values?.autoAssignmentEnabled,
          manualAssignmentEnabled: values?.manualAssignmentEnabled,
          createdByUserId: Number(currentUserId),
        },
      }),
    )
      .then((response) => {
        if (response.meta.requestStatus === "fulfilled") {
          addToast({
            title: "SUCCESS",
            description: "Member added to the team successfully !.",
            color: "success",
          });
          addMemberForm.reset(addMemberFormDefaultValues);
          dispatch(
            getSalesTeamMembers({
              subDepartmentId,
              teamId: selectedTeam?.teamId,
            }),
          );
        } else {
          addToast({
            title: response?.payload?.status || "ERROR",
            description:
              response?.payload?.data?.message ||
              response?.payload?.message ||
              "Something went wrong while adding the member.",
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

  const renderCell = useCallback((rowData, columnKey) => {
    switch (columnKey) {
      case "teamId":
        return <span>{rowData?.teamId}</span>;

      case "teamName":
        return (
          <Link
            className="font-medium text-blue-600 hover:underline"
            to={`${rowData?.teamId}/members`}
            state={{ teamName: rowData?.teamName, subDepartmentName }}
          >
            {rowData?.teamName}
          </Link>
        );

      case "managerName":
        return <span>{rowData?.managerName || "-"}</span>;

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

      case "manualAssignmentEnabled":
        return (
          <Chip
            size="sm"
            variant="flat"
            color={rowData?.manualAssignmentEnabled ? "success" : "default"}
          >
            {rowData?.manualAssignmentEnabled ? "Enabled" : "Disabled"}
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

      case "members":
        return (
          <Button
            size="sm"
            variant="flat"
            onPress={() => handleOpenMembersModal(rowData)}
          >
            View Members
          </Button>
        );

      default:
        return rowData?.[columnKey] ?? "-";
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const renderMemberCell = (member, columnKey) => {
    switch (columnKey) {
      case "companies":
        return <span>{getMemberCompanyIds(member).length}</span>;

      // CHANGE 4: Unmap button added next to Map Companies
      case "actions":
        return (
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="flat"
              color={
                mappingMember?.memberId === member?.memberId
                  ? "primary"
                  : "default"
              }
              onPress={() => handleOpenMapCompanies(member)}
            >
              Map Companies
            </Button>

            <Button
              size="sm"
              variant="flat"
              color="danger"
              onPress={() => handleOpenUnmap(member)}
            >
              Remove
            </Button>
          </div>
        );

      case "autoAssignmentEnabled":
      case "manualAssignmentEnabled":
      case "availableForAssignment":
      case "active":
        return (
          <Chip
            size="sm"
            variant="flat"
            color={member?.[columnKey] ? "success" : "default"}
          >
            {member?.[columnKey] ? "Yes" : "No"}
          </Chip>
        );

      default:
        return <span>{member?.[columnKey] ?? "-"}</span>;
    }
  };

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
    setFilterValue(value || "");
    setFilteration((prev) => ({ ...prev, page: 1 }));
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
            placeholder="Search teams..."
            startContent={<Search className="w-4 h-4 text-default-400" />}
            value={filterValue}
            onClear={onClear}
            onValueChange={onSearchChange}
          />

          <Dropdown>
            <DropdownTrigger>
              <Button
                size="sm"
                variant="flat"
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
                setFilteration((prev) => ({ ...prev, page: 1 }));
              }}
            >
              {activeFilterOptions.map((option) => (
                <DropdownItem key={option.id}>{option.name}</DropdownItem>
              ))}
            </DropdownMenu>
          </Dropdown>
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
              value={filteration?.size}
            >
              <option value="10">10</option>
              <option value="25">25</option>
              <option value="50">50</option>
            </select>
          </label>
        </div>
      </div>
    );
  }, [
    filterValue,
    activeFilter,
    onSearchChange,
    onClear,
    totalElements,
    filteration?.size,
    onRowsPerPageChange,
  ]);

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
          onChange={(e) => setFilteration((prev) => ({ ...prev, page: e }))}
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
  }, [filteration?.page, pages, onPreviousPage, onNextPage]);

  return (
    <>
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-1.5 text-[12.5px] text-default-400">
          <Link className="hover:underline" to="../../../.." relative="path">
            Departments
          </Link>
          <span>/</span>
          <Link className="hover:underline" to="../.." relative="path">
            Sub departments
          </Link>
          <span>/</span>
          <span className="text-default-600">
            {subDepartmentName || "Teams"}
          </span>
        </div>

        <h1 className="font-sans text-lg font-semibold shrink-0">
          Sales teams
        </h1>

        <p className="text-xs text-default-400 -mt-1 mb-1">
          Teams are set up on the backend — this page manages team members only.
          Solutions are mapped at the sub-department level.
        </p>

        <Table
          isHeaderSticky
          removeWrapper={false}
          aria-label="Sub department teams table"
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
          <TableHeader columns={columns}>
            {(column) => (
              <TableColumn key={column.uid} align="start">
                {column.name}
              </TableColumn>
            )}
          </TableHeader>

          <TableBody
            emptyContent={isTeamsLoading ? " " : "No data found"}
            items={pagedItems}
          >
            {(rowItem) => (
              <TableRow key={rowItem.teamId}>
                {(columnKey) => (
                  <TableCell>{renderCell(rowItem, columnKey)}</TableCell>
                )}
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Team members modal */}
      <Modal
        size="3xl"
        isDismissable={false}
        isKeyboardDismissDisabled={true}
        isOpen={membersModal.isOpen}
        onOpenChange={(open) => {
          membersModal.onOpenChange(open);
          if (!open) {
            setSelectedTeam(null);
            setMappingMember(null);
            addMemberForm.reset(addMemberFormDefaultValues);
            mapCompaniesForm.reset(mapCompaniesFormDefaultValues);
          }
        }}
        placement="top-center"
        scrollBehavior="inside"
      >
        <ModalContent>
          {() => (
            <>
              <ModalHeader>
                Members — {selectedTeam?.teamName || "-"}
              </ModalHeader>

              <ModalBody className="pb-6">
                <div className="flex flex-col gap-6">
                  {isMembersLoading ? (
                    <div className="flex justify-center py-8">
                      <Spinner size="sm" label="Loading members..." />
                    </div>
                  ) : (
                    // NOTE: plain <table>, not HeroUI's <Table> — nesting
                    // HeroUI's react-aria-backed Table inside a Modal throws
                    // "No key found for item" from @react-stately's
                    // collection builder in this HeroUI v2.8.2 setup.
                    <div className="max-h-[40vh] w-full overflow-y-auto rounded-lg border border-gray-200 dark:border-white/10">
                      <table className="w-full text-[12.5px]">
                        <thead className="sticky top-0 bg-gray-50 dark:bg-neutral-900">
                          <tr>
                            {memberColumns.map((column) => (
                              <th
                                key={column.uid}
                                className="h-8 px-3 text-left text-[11.5px] tracking-wide text-default-500 border-b border-gray-200 dark:border-white/10"
                              >
                                {column.name}
                              </th>
                            ))}
                          </tr>
                        </thead>

                        <tbody>
                          {salesTeamMembersList?.length ? (
                            salesTeamMembersList.map((member) => (
                              <tr
                                key={member.memberId}
                                className="border-b border-gray-100 dark:border-white/5 last:border-b-0"
                              >
                                {memberColumns.map((column) => (
                                  <td key={column.uid} className="px-3 py-1.5">
                                    {renderMemberCell(member, column.uid)}
                                  </td>
                                ))}
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td
                                colSpan={memberColumns.length}
                                className="px-3 py-6 text-center text-default-400"
                              >
                                No members in this team yet.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {mappingMember && (
                    <div className="rounded-lg border border-gray-200 dark:border-white/10 p-3">
                      <p className="text-sm font-semibold text-foreground mb-1">
                        Map companies — {mappingMember?.userName || "-"}
                      </p>
                      <p className="text-xs text-default-400 mb-3">
                        Only companies mapped to this sub department are listed.
                      </p>

                      <form
                        className="flex flex-col gap-4"
                        onSubmit={mapCompaniesForm.handleSubmit(
                          handleMapCompanies,
                        )}
                      >
                        <Controller
                          name="companyIds"
                          control={mapCompaniesForm.control}
                          render={({ field, fieldState: { error } }) => (
                            <NewSelect
                              isRequired
                              selectionMode="multiple"
                              label="Companies"
                              placeholder={
                                isCompaniesLoading
                                  ? "Loading companies..."
                                  : companyOptions.length
                                    ? "Select companies"
                                    : "No companies mapped to this sub department"
                              }
                              isDisabled={
                                !isCompaniesLoading && !companyOptions.length
                              }
                              isInvalid={!!error}
                              errorMessage={error?.message}
                              data={companyOptions}
                              labelKey="displayLabel"
                              valueKey="id"
                              value={field.value}
                              onChange={(value) => field.onChange(value)}
                            />
                          )}
                        />

                        <Controller
                          name="reason"
                          control={mapCompaniesForm.control}
                          render={({ field }) => (
                            <Textarea
                              label="Reason"
                              minRows={2}
                              value={field.value}
                              onChange={(e) => field.onChange(e.target.value)}
                            />
                          )}
                        />

                        <div className="flex justify-end gap-2">
                          <Button
                            variant="flat"
                            onPress={handleCloseMapCompanies}
                          >
                            Cancel
                          </Button>
                          <Button color="primary" type="submit">
                            Map companies
                          </Button>
                        </div>
                      </form>
                    </div>
                  )}

                  <div>
                    <p className="text-sm font-semibold text-foreground mb-3">
                      Add member
                    </p>

                    <form
                      className="grid grid-cols-1 sm:grid-cols-2 gap-4"
                      onSubmit={addMemberForm.handleSubmit(handleAddMember)}
                    >
                      <div className="sm:col-span-2">
                        <Controller
                          name="salesUserId"
                          control={addMemberForm.control}
                          render={({ field, fieldState: { error } }) => (
                            <NewSelect
                              isRequired
                              label="Sales user"
                              errorMessage={
                                error?.message ||
                                "please select the sales user."
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
                      </div>

                      <Controller
                        name="dailyAssignmentLimit"
                        control={addMemberForm.control}
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
                        name="monthlyAssignmentLimit"
                        control={addMemberForm.control}
                        render={({ field, fieldState: { error } }) => (
                          <Input
                            isRequired
                            type="number"
                            min={0}
                            isInvalid={!!error}
                            errorMessage={error?.message}
                            label="Monthly assignment limit"
                            {...field}
                          />
                        )}
                      />

                      <Controller
                        name="autoAssignmentEnabled"
                        control={addMemberForm.control}
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

                      <Controller
                        name="manualAssignmentEnabled"
                        control={addMemberForm.control}
                        render={({ field }) => (
                          <Switch
                            isSelected={field.value}
                            onValueChange={field.onChange}
                            size="sm"
                          >
                            Enable manual assignment
                          </Switch>
                        )}
                      />

                      <div className="sm:col-span-2 flex justify-end">
                        <Button color="primary" type="submit">
                          Add member
                        </Button>
                      </div>
                    </form>
                  </div>
                </div>
              </ModalBody>
            </>
          )}
        </ModalContent>
      </Modal>

      {/* CHANGE 5: Unmap confirmation modal */}
      <Modal
        isOpen={unmapModal.isOpen}
        onOpenChange={(open) => {
          if (!open) handleCloseUnmap();
        }}
        isDismissable={!isUnmapping}
        placement="center"
      >
        <ModalContent>
          {() => (
            <>
              <ModalHeader>Remove member from team</ModalHeader>

              <ModalBody>
                <p className="text-sm">
                  Remove <b>{unmappingMember?.userName || "this user"}</b> from{" "}
                  <b>{selectedTeam?.teamName || "this team"}</b>? They will no
                  longer receive assignments from this team. You can add them
                  back later.
                </p>
              </ModalBody>

              <ModalFooter>
                <Button
                  variant="flat"
                  onPress={handleCloseUnmap}
                  isDisabled={isUnmapping}
                >
                  Cancel
                </Button>
                <Button
                  color="danger"
                  onPress={handleConfirmUnmap}
                  isLoading={isUnmapping}
                >
                  Unmap
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
};

export default SubDepartmentTeams;
