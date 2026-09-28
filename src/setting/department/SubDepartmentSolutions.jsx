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
import { useCallback, useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { ChevronDown, Search } from "lucide-react";
import { Link, useLocation, useParams } from "react-router-dom";
import dayjs from "dayjs";
import NewSelect from "../../components/NewSelect";
import {
  getSolutionMembers,
  getSolutionsBySubDepartmentId,
  updateSolutionMembers,
} from "../../toolkit/slices/settingSlice";
import { getAllUsers } from "../../toolkit/slices/commonSlice";

// Matches SubDepartmentSolutionResponseDto.
const columns = [
  { name: "ID", uid: "solutionId" },
  { name: "SOLUTION NAME", uid: "solutionName" },
  { name: "TYPE", uid: "solutionType" },
  { name: "SLUG", uid: "solutionSlug" },
  { name: "STATUS", uid: "active" },
  { name: "MAPPED ON", uid: "createdAt" },
  { name: "MEMBERS", uid: "members" },
];

// Matches SolutionMemberMappingResponseDto.
const memberColumns = [
  { name: "MEMBER", uid: "userName" },
  { name: "EMAIL", uid: "userEmail" },
  { name: "TEAM", uid: "salesTeamName" },
  { name: "WORK FUNCTION", uid: "workFunction" },
  { name: "STATUS", uid: "active" },
];

const STATUS_FILTER_OPTIONS = [
  { label: "ALL", value: "" },
  { label: "ACTIVE", value: "true" },
  { label: "INACTIVE", value: "false" },
];

const StatusChip = ({ active }) => (
  <Chip size="sm" variant="flat" color={active ? "success" : "default"}>
    {active ? "Active" : "Inactive"}
  </Chip>
);

const SubDepartmentSolutions = () => {
  const dispatch = useDispatch();
  const { subDepartmentId } = useParams();
  const location = useLocation();
  const membersModal = useDisclosure();

  const currentUser = useSelector((state) => state.auth.currentUser);
  const currentUserId = currentUser?.id || currentUser?.userId;

  const solutionsList = useSelector(
    (state) => state.setting.subDepartmentSolutionsList,
  );
  const isSolutionsLoading =
    useSelector((state) => state.setting.subDepartmentSolutionsLoading) ===
    "pending";

  const usersList = useSelector((state) => state.common.usersList);

  const solutionMembersList = useSelector(
    (state) => state.setting.solutionMembersList,
  );
  const isSolutionMembersLoading =
    useSelector((state) => state.setting.solutionMembersLoading) ===
    "pending";

  const subDepartmentName =
    location?.state?.subDepartmentName || solutionsList?.[0]?.subDepartmentName;

  const [filterValue, setFilterValue] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [filteration, setFilteration] = useState({ page: 1, size: 50 });
  const [selectedSolution, setSelectedSolution] = useState(null);
  const [selectedMemberIds, setSelectedMemberIds] = useState([]);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (subDepartmentId) {
      dispatch(getSolutionsBySubDepartmentId(subDepartmentId));
      dispatch(getAllUsers());
    }
  }, [dispatch, subDepartmentId]);

  // Pick-list: every user. The PUT's memberIds are sent as user ids.
  const memberOptions = useMemo(
    () =>
      (usersList || []).map((user) => ({
        id: user?.id,
        displayLabel: user?.email
          ? `${user?.fullName} (${user?.email})`
          : user?.fullName,
      })),
    [usersList],
  );

  const filteredItems = useMemo(() => {
    let filtered = [...(solutionsList || [])];

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
  }, [solutionsList, filterValue, statusFilter]);

  const count = filteredItems.length;
  const pages = Math.ceil(count / filteration.size) || 1;

  const pagedItems = useMemo(() => {
    const start = (filteration.page - 1) * filteration.size;
    return filteredItems.slice(start, start + filteration.size);
  }, [filteredItems, filteration]);

  const handleOpenMembersModal = (solution) => {
    setSelectedSolution(solution);
    setSelectedMemberIds([]);
    dispatch(
      getSolutionMembers({
        subDepartmentId,
        solutionId: solution?.solutionId,
      }),
    ).then((resp) => {
      if (resp.meta.requestStatus === "fulfilled") {
        setSelectedMemberIds(
          (resp.payload || [])
            .filter((mapping) => mapping?.active !== false)
            .map((mapping) => String(mapping.userId)),
        );
      }
    });
    membersModal.onOpen();
  };

  const handleCloseMembersModal = () => {
    setSelectedSolution(null);
    setSelectedMemberIds([]);
  };

  const handleSaveMembers = () => {
    setIsSaving(true);
    dispatch(
      updateSolutionMembers({
        subDepartmentId,
        solutionId: selectedSolution?.solutionId,
        data: {
          memberIds: selectedMemberIds.map(Number),
          updatedByUserId: Number(currentUserId),
        },
      }),
    )
      .then((resp) => {
        if (resp.meta.requestStatus === "fulfilled") {
          addToast({
            title: "Members mapped successfully !.",
            color: "success",
          });
          dispatch(
            getSolutionMembers({
              subDepartmentId,
              solutionId: selectedSolution?.solutionId,
            }),
          );
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

  const renderCell = (item, columnKey) => {
    switch (columnKey) {
      case "solutionName":
        return <span className="font-medium">{item?.solutionName || "-"}</span>;

      case "active":
        return <StatusChip active={item?.active} />;

      case "createdAt":
        return (
          <span>
            {item?.createdAt
              ? dayjs(item.createdAt).format("DD-MM-YYYY, hh:mm a")
              : "-"}
          </span>
        );

      case "members":
        return (
          <Button
            size="sm"
            variant="flat"
            onPress={() => handleOpenMembersModal(item)}
          >
            Map Members
          </Button>
        );

      default:
        return <span>{item?.[columnKey] ?? "-"}</span>;
    }
  };

  const renderMemberCell = useCallback((member, columnKey) => {
    if (columnKey === "active") return <StatusChip active={member?.active} />;
    return <span>{member?.[columnKey] || "-"}</span>;
  }, []);

  const topContent = (
    <div className="flex flex-col gap-2">
      <div className="flex justify-between gap-2 items-center flex-wrap">
        <Input
          isClearable
          size="sm"
          className="w-full sm:max-w-[280px]"
          classNames={{ inputWrapper: "h-8 min-h-8" }}
          placeholder="Search solutions..."
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
          Total {count} solutions
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
          {subDepartmentName || "Solutions"}
        </span>
      </div>

      <h1 className="font-sans text-lg font-semibold mb-2 shrink-0">
        Solutions
      </h1>

      <Table
        isHeaderSticky
        removeWrapper={false}
        aria-label="Sub department solutions table"
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
          isLoading={isSolutionsLoading}
          loadingContent={<Spinner size="sm" label="Loading solutions..." />}
          emptyContent={
            isSolutionsLoading
              ? " "
              : "No solutions mapped to this sub department."
          }
          items={pagedItems}
        >
          {(item) => (
            <TableRow key={item?.mappingId ?? item?.solutionId}>
              {(columnKey) => (
                <TableCell>{renderCell(item, columnKey)}</TableCell>
              )}
            </TableRow>
          )}
        </TableBody>
      </Table>

      <Modal
        size="3xl"
        isDismissable={false}
        isKeyboardDismissDisabled={true}
        isOpen={membersModal.isOpen}
        onOpenChange={(open) => {
          membersModal.onOpenChange(open);
          if (!open) handleCloseMembersModal();
        }}
        placement="top-center"
        scrollBehavior="inside"
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader>
                Members — {selectedSolution?.solutionName || "-"}
              </ModalHeader>

              <ModalBody>
                <div className="flex flex-col gap-5">
                  {isSolutionMembersLoading ? (
                    <div className="flex justify-center py-8">
                      <Spinner size="sm" label="Loading members..." />
                    </div>
                  ) : (
                    // Plain <table>: HeroUI's Table inside a Modal throws
                    // "No key found for item" in this setup.
                    <div className="max-h-[35vh] w-full overflow-y-auto rounded-lg border border-gray-200 dark:border-white/10">
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
                          {solutionMembersList?.length ? (
                            solutionMembersList.map((mapping) => (
                              <tr
                                key={mapping.mappingId}
                                className="border-b border-gray-100 dark:border-white/5 last:border-b-0"
                              >
                                {memberColumns.map((column) => (
                                  <td key={column.uid} className="px-3 py-1.5">
                                    {renderMemberCell(mapping, column.uid)}
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
                                No members mapped to this solution yet.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  )}

                  <div>
                    <NewSelect
                      selectionMode="multiple"
                      label="Users"
                      placeholder="Select users to map"
                      data={memberOptions}
                      labelKey="displayLabel"
                      valueKey="id"
                      value={selectedMemberIds}
                      onChange={(value) => setSelectedMemberIds(value || [])}
                    />
                    <p className="text-xs text-default-400 mt-1.5">
                      Saving replaces the mapped users with this selection.
                    </p>
                  </div>
                </div>
              </ModalBody>

              <ModalFooter>
                <Button onPress={onClose}>Close</Button>
                <Button
                  color="primary"
                  isLoading={isSaving}
                  isDisabled={isSolutionMembersLoading}
                  onPress={handleSaveMembers}
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

export default SubDepartmentSolutions;
