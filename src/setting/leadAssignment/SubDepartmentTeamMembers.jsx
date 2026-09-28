import {
  Button,
  Chip,
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
  Spinner,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
  addToast,
  useDisclosure,
} from "@heroui/react";
import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { ChevronDown, Search } from "lucide-react";
import { Link, useLocation, useParams } from "react-router-dom";
import NewSelect from "../../components/NewSelect";
import {
  getMemberSolutions,
  getSalesTeamMembers,
  getSolutionsBySubDepartmentId,
  updateMemberSolutions,
} from "../../toolkit/slices/settingSlice";

// Matches SalesTeamMemberResponseDto.
const columns = [
  { name: "MEMBER", uid: "userName" },
  { name: "EMAIL", uid: "userEmail" },
  { name: "DAILY LIMIT", uid: "dailyAssignmentLimit" },
  { name: "MONTHLY LIMIT", uid: "monthlyAssignmentLimit" },
  { name: "AUTO ASSIGN", uid: "autoAssignmentEnabled" },
  { name: "MANUAL ASSIGN", uid: "manualAssignmentEnabled" },
  { name: "AVAILABLE", uid: "availableForAssignment" },
  { name: "STATUS", uid: "active" },
  { name: "SOLUTIONS", uid: "solutions" },
];

const STATUS_FILTER_OPTIONS = [
  { label: "ALL", value: "" },
  { label: "ACTIVE", value: "true" },
  { label: "INACTIVE", value: "false" },
];

const YesNoChip = ({ value }) => (
  <Chip size="sm" variant="flat" color={value ? "success" : "default"}>
    {value ? "Yes" : "No"}
  </Chip>
);

const SubDepartmentTeamMembers = () => {
  const dispatch = useDispatch();
  const { subDepartmentId, teamId } = useParams();
  const location = useLocation();
  const solutionsModal = useDisclosure();

  const currentUser = useSelector((state) => state.auth.currentUser);
  const currentUserId = currentUser?.id || currentUser?.userId;

  const membersList = useSelector(
    (state) => state.setting.salesTeamMembersList,
  );
  const isMembersLoading =
    useSelector((state) => state.setting.salesTeamMembersLoading) ===
    "pending";

  // Pick-list for "Map Solutions": the solutions mapped to this
  // sub-department, so a member can only get solutions their
  // sub-department owns.
  const subDepartmentSolutionsList = useSelector(
    (state) => state.setting.subDepartmentSolutionsList,
  );
  const isSolutionsLoading =
    useSelector((state) => state.setting.subDepartmentSolutionsLoading) ===
    "pending";

  const memberSolutionsList = useSelector(
    (state) => state.setting.memberSolutionsList,
  );
  const isMemberSolutionsLoading =
    useSelector((state) => state.setting.memberSolutionsLoading) ===
    "pending";

  const teamName =
    location?.state?.teamName || membersList?.[0]?.teamName || "Team";
  const subDepartmentName =
    location?.state?.subDepartmentName || membersList?.[0]?.subDepartmentName;

  const [filterValue, setFilterValue] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [filteration, setFilteration] = useState({ page: 1, size: 50 });
  const [selectedMember, setSelectedMember] = useState(null);
  const [selectedSolutionIds, setSelectedSolutionIds] = useState([]);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (subDepartmentId && teamId) {
      dispatch(getSalesTeamMembers({ subDepartmentId, teamId }));
      dispatch(getSolutionsBySubDepartmentId(subDepartmentId));
    }
  }, [dispatch, subDepartmentId, teamId]);

  const solutionOptions = useMemo(
    () =>
      (subDepartmentSolutionsList || [])
        .filter((solution) => solution?.active !== false)
        .map((solution) => ({
          id: solution?.solutionId,
          displayLabel: solution?.solutionType
            ? `${solution?.solutionName} (${solution?.solutionType})`
            : solution?.solutionName,
        })),
    [subDepartmentSolutionsList],
  );

  const filteredItems = useMemo(() => {
    let filtered = [...(membersList || [])];

    if (filterValue) {
      const needle = filterValue.toLowerCase();
      filtered = filtered.filter((item) =>
        Object.values(item || {}).some((val) => {
          if (val === null || typeof val === "object") return false;
          return String(val).toLowerCase().includes(needle);
        }),
      );
    }

    if (statusFilter !== "") {
      const wantActive = statusFilter === "true";
      filtered = filtered.filter(
        (item) => Boolean(item?.active) === wantActive,
      );
    }

    return filtered;
  }, [membersList, filterValue, statusFilter]);

  const count = filteredItems.length;
  const pages = Math.ceil(count / filteration.size) || 1;

  const pagedItems = useMemo(() => {
    const start = (filteration.page - 1) * filteration.size;
    return filteredItems.slice(start, start + filteration.size);
  }, [filteredItems, filteration]);

  const loadMemberSolutions = (member) =>
    dispatch(
      getMemberSolutions({ subDepartmentId, memberId: member?.memberId }),
    ).then((resp) => {
      if (resp.meta.requestStatus === "fulfilled") {
        setSelectedSolutionIds(
          (resp.payload || [])
            .filter((mapping) => mapping?.active !== false)
            .map((mapping) => String(mapping.solutionId)),
        );
      }
    });

  const handleOpenSolutionsModal = (member) => {
    setSelectedMember(member);
    setSelectedSolutionIds([]);
    loadMemberSolutions(member);
    solutionsModal.onOpen();
  };

  const handleCloseSolutionsModal = () => {
    setSelectedMember(null);
    setSelectedSolutionIds([]);
  };

  const handleSaveSolutions = () => {
    setIsSaving(true);
    dispatch(
      updateMemberSolutions({
        subDepartmentId,
        memberId: selectedMember?.memberId,
        data: {
          solutionIds: selectedSolutionIds.map(Number),
          updatedByUserId: Number(currentUserId),
        },
      }),
    )
      .then((resp) => {
        if (resp.meta.requestStatus === "fulfilled") {
          addToast({
            title: "Solutions mapped successfully !.",
            color: "success",
          });
          loadMemberSolutions(selectedMember);
        } else {
          addToast({
            title: "Something went wrong !.",
            description: resp?.payload?.message,
            color: "danger",
          });
        }
      })
      .catch(() =>
        addToast({ title: "Something went wrong !.", color: "danger" }),
      )
      .finally(() => setIsSaving(false));
  };

  const renderCell = (member, columnKey) => {
    switch (columnKey) {
      case "userName":
        return <span className="font-medium">{member?.userName || "-"}</span>;

      case "autoAssignmentEnabled":
      case "manualAssignmentEnabled":
      case "availableForAssignment":
        return <YesNoChip value={member?.[columnKey]} />;

      case "active":
        return (
          <Chip
            size="sm"
            variant="flat"
            color={member?.active ? "success" : "default"}
          >
            {member?.active ? "Active" : "Inactive"}
          </Chip>
        );

      case "solutions":
        return (
          <Button
            size="sm"
            variant="flat"
            onPress={() => handleOpenSolutionsModal(member)}
          >
            Map Solutions
          </Button>
        );

      default:
        return <span>{member?.[columnKey] ?? "-"}</span>;
    }
  };

  const topContent = (
    <div className="flex flex-col gap-2">
      <div className="flex justify-between gap-2 items-center flex-wrap">
        <Input
          isClearable
          size="sm"
          className="w-full sm:max-w-[280px]"
          classNames={{ inputWrapper: "h-8 min-h-8" }}
          placeholder="Search members..."
          startContent={<Search className="w-4 h-4 text-default-400" />}
          value={filterValue}
          onClear={() => {
            setFilterValue("");
            setFilteration((prev) => ({ ...prev, page: 1 }));
          }}
          onValueChange={(value) => {
            setFilterValue(value || "");
            setFilteration((prev) => ({ ...prev, page: 1 }));
          }}
        />

        <Dropdown>
          <DropdownTrigger>
            <Button
              size="sm"
              variant="flat"
              endContent={<ChevronDown className="w-3.5 h-3.5" />}
            >
              {STATUS_FILTER_OPTIONS.find(
                (option) => option.value === statusFilter,
              )?.label || "ALL"}
            </Button>
          </DropdownTrigger>
          <DropdownMenu
            disallowEmptySelection
            aria-label="Status filter"
            selectedKeys={[statusFilter || "__all__"]}
            selectionMode="single"
            onSelectionChange={(e) => {
              const key = Array.from(e)[0];
              setStatusFilter(key === "__all__" ? "" : key);
              setFilteration((prev) => ({ ...prev, page: 1 }));
            }}
          >
            {STATUS_FILTER_OPTIONS.map((option) => (
              <DropdownItem key={option.value || "__all__"}>
                {option.label}
              </DropdownItem>
            ))}
          </DropdownMenu>
        </Dropdown>
      </div>

      <div className="flex justify-between items-center">
        <span className="text-default-400 text-[12.5px]">
          Total {count} members
        </span>

        <label className="flex items-center gap-1 text-default-400 text-[12.5px]">
          Rows per page:
          <select
            className="bg-transparent outline-hidden text-default-400 text-[12.5px] cursor-pointer"
            onChange={(e) =>
              setFilteration({ size: Number(e.target.value), page: 1 })
            }
            value={filteration.size}
          >
            <option value="10">10</option>
            <option value="25">25</option>
            <option value="50">50</option>
            <option value="100">100</option>
          </select>
        </label>
      </div>
    </div>
  );

  const bottomContent = (
    <div className="py-1.5 px-1 flex justify-between items-center">
      <span className="w-[30%] text-[12.5px] text-default-400">
        Page {filteration.page} of {pages}
      </span>

      <Pagination
        isCompact
        showControls
        color="primary"
        page={filteration.page}
        total={pages}
        onChange={(page) => setFilteration((prev) => ({ ...prev, page }))}
      />

      <div className="hidden sm:flex w-[30%] justify-end gap-2">
        <Button
          isDisabled={filteration.page <= 1}
          size="sm"
          variant="flat"
          onPress={() =>
            setFilteration((prev) => ({ ...prev, page: prev.page - 1 }))
          }
        >
          Previous
        </Button>
        <Button
          isDisabled={filteration.page >= pages}
          size="sm"
          variant="flat"
          onPress={() =>
            setFilteration((prev) => ({ ...prev, page: prev.page + 1 }))
          }
        >
          Next
        </Button>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col gap-2">
      {/* Path-relative: these settings routes are flat siblings, so
          route-relative ".." would jump to the app root. */}
      <div className="flex items-center gap-1.5 text-[12.5px] text-default-400">
        <Link
          className="hover:underline"
          to="../../../../../.."
          relative="path"
        >
          Departments
        </Link>
        <span>/</span>
        <Link className="hover:underline" to="../../../.." relative="path">
          {subDepartmentName || "Sub departments"}
        </Link>
        <span>/</span>
        <Link
          className="hover:underline"
          to="../.."
          relative="path"
          state={{ subDepartmentName }}
        >
          Teams
        </Link>
        <span>/</span>
        <span className="text-default-600">{teamName}</span>
      </div>

      <h1 className="font-sans text-lg font-semibold mb-2 shrink-0">
        Team members — {teamName}
      </h1>

      <Table
        isHeaderSticky
        removeWrapper={false}
        aria-label="Sales team members table"
        topContent={topContent}
        topContentPlacement="outside"
        bottomContent={bottomContent}
        bottomContentPlacement="outside"
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
            <TableColumn key={column.uid}>{column.name}</TableColumn>
          )}
        </TableHeader>

        <TableBody
          isLoading={isMembersLoading}
          loadingContent={<Spinner size="sm" label="Loading members..." />}
          emptyContent={isMembersLoading ? " " : "No members in this team yet."}
          items={pagedItems}
        >
          {(member) => (
            <TableRow key={member?.memberId}>
              {(columnKey) => (
                <TableCell>{renderCell(member, columnKey)}</TableCell>
              )}
            </TableRow>
          )}
        </TableBody>
      </Table>

      <Modal
        size="xl"
        isDismissable={false}
        isKeyboardDismissDisabled={true}
        isOpen={solutionsModal.isOpen}
        onOpenChange={(open) => {
          solutionsModal.onOpenChange(open);
          if (!open) handleCloseSolutionsModal();
        }}
        placement="top-center"
        scrollBehavior="inside"
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader>
                Map Solutions — {selectedMember?.userName || "-"}
              </ModalHeader>

              <ModalBody>
                <div className="flex flex-col gap-4">
                  <div>
                    <p className="text-xs text-default-500 mb-1.5">
                      Currently mapped
                    </p>
                    {isMemberSolutionsLoading ? (
                      <Spinner size="sm" />
                    ) : memberSolutionsList?.length ? (
                      <div className="flex flex-wrap gap-1.5">
                        {memberSolutionsList.map((mapping) => (
                          <Chip
                            key={mapping.mappingId}
                            size="sm"
                            variant="flat"
                            color={mapping?.active ? "primary" : "default"}
                          >
                            {mapping?.solutionName}
                          </Chip>
                        ))}
                      </div>
                    ) : (
                      <p className="text-[12.5px] text-default-400">
                        No solutions mapped to this member yet.
                      </p>
                    )}
                  </div>

                  <div>
                    <NewSelect
                      selectionMode="multiple"
                      label="Solutions"
                      placeholder={
                        isSolutionsLoading
                          ? "Loading solutions..."
                          : "Select solutions to map"
                      }
                      data={solutionOptions}
                      labelKey="displayLabel"
                      valueKey="id"
                      value={selectedSolutionIds}
                      onChange={(value) => setSelectedSolutionIds(value || [])}
                    />
                    <p className="text-xs text-default-400 mt-1.5">
                      Only this sub department&apos;s solutions are listed.
                      Saving replaces the member&apos;s mapped solutions with
                      this selection.
                    </p>
                  </div>
                </div>
              </ModalBody>

              <ModalFooter>
                <Button onPress={onClose}>Close</Button>
                <Button
                  color="primary"
                  isLoading={isSaving}
                  isDisabled={isMemberSolutionsLoading}
                  onPress={handleSaveSolutions}
                >
                  Save
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
};

export default SubDepartmentTeamMembers;
