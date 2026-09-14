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
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  addToast,
  Chip,
  Switch,
  Card,
  CardBody,
  Tooltip,
} from "@heroui/react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, EllipsisVertical, Plus, Search } from "lucide-react";
import * as z from "zod";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import NewSelect from "../../components/NewSelect";
import {
  addLeadAssignmentTeamMember,
  getLeadAssignmentTeamById,
  getLeadAssignmentTeamSolutions,
  mapLeadAssignmentTeamMemberToSolutions,
} from "../../toolkit/slices/settingSlice";
import { getAllUsers } from "../../toolkit/slices/commonSlice";

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

const memberSolutionFormSchema = z.object({
  solutionIds: z.array(z.string()),
});

const memberSolutionFormDefaultValues = {
  solutionIds: [],
};

const columns = [
  { name: "#", uid: "id" },
  { name: "SALES USER", uid: "salesUser" },
  { name: "ORDER", uid: "assignmentOrder" },
  { name: "OPEN LEADS", uid: "openLeads" },
  { name: "SOLUTIONS", uid: "solutions" },
  { name: "AUTO ASSIGN", uid: "autoAssignmentEnabled" },
  { name: "STATUS", uid: "active" },
  { name: "ACTIONS", uid: "actions" },
];

// Only the first two mapped solutions are shown inline; the rest collapse
// into a "+N" chip whose tooltip lists every remaining solution name —
// mirrors the SOLUTIONS column on the Lead Assignment Teams table.
const MAX_VISIBLE_SOLUTIONS = 2;

const LeadAssignmentTeamDetail = () => {
  const { userId, teamId } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const team = useSelector((state) => state.setting.leadAssignmentTeamDetail);
  const usersList = useSelector((state) => state.common.usersList);
  const teamSolutions = useSelector(
    (state) => state.setting.leadAssignmentTeamSolutions,
  );

  const memberModal = useDisclosure();
  const memberSolutionsModal = useDisclosure();
  const [filterValue, setFilterValue] = useState("");
  const [selectedMember, setSelectedMember] = useState(null);

  const memberForm = useForm({
    resolver: zodResolver(memberFormSchema),
    defaultValues: memberFormDefaultValues,
  });

  const memberSolutionForm = useForm({
    resolver: zodResolver(memberSolutionFormSchema),
    defaultValues: memberSolutionFormDefaultValues,
  });

  const fetchTeam = useCallback(() => {
    if (teamId) {
      dispatch(getLeadAssignmentTeamById(teamId));
    }
  }, [dispatch, teamId]);

  useEffect(() => {
    fetchTeam();
  }, [fetchTeam]);

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

  // Only solutions already mapped to this team are offered when mapping a
  // member — sourced from GET /lead-assignment/admin/teams/{teamId}/solutions.
  const teamSolutionOptions = useMemo(() => teamSolutions || [], [teamSolutions]);

  const members = useMemo(() => team?.members || [], [team]);

  const solutions = useMemo(() => team?.solutions || [], [team]);
  const visibleSolutions = useMemo(
    () => solutions.slice(0, MAX_VISIBLE_SOLUTIONS),
    [solutions],
  );
  const remainingSolutions = useMemo(
    () => solutions.slice(MAX_VISIBLE_SOLUTIONS),
    [solutions],
  );

  const filteredMembers = useMemo(() => {
    if (!filterValue) return members;

    const query = filterValue.toLowerCase();

    return members.filter((member) =>
      [member?.salesUser?.fullName, member?.salesUser?.email].some((value) =>
        String(value || "")
          .toLowerCase()
          .includes(query),
      ),
    );
  }, [members, filterValue]);

  const handleOpenAddMemberModal = () => {
    memberForm.reset(memberFormDefaultValues);
    dispatch(getAllUsers());
    memberModal.onOpen();
  };

  const handleAddMember = (values) => {
    dispatch(
      addLeadAssignmentTeamMember({
        teamId: team?.id,
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
          fetchTeam();
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
        addToast({
          title: "ERROR",
          description: "Something went wrong !.",
          color: "danger",
        });
      });
  };

  const handleOpenMemberSolutionsModal = (member) => {
    setSelectedMember(member);
    memberSolutionForm.reset({
      solutionIds: (member?.solutions || []).map((solution) =>
        String(solution?.solutionId),
      ),
    });
    dispatch(getLeadAssignmentTeamSolutions(team?.id));
    memberSolutionsModal.onOpen();
  };

  const handleMapMemberSolutions = (values) => {
    const solutionIds = (values?.solutionIds || []).map(Number);

    dispatch(
      mapLeadAssignmentTeamMemberToSolutions({
        teamId: team?.id,
        salesUserId: selectedMember?.salesUser?.id,
        data: {
          solutionIds,
          updatedByUserId: Number(userId),
        },
      }),
    )
      .then((response) => {
        if (response.meta.requestStatus === "fulfilled") {
          addToast({
            title: "SUCCESS",
            description: "Member solutions updated successfully !.",
            color: "success",
          });

          memberSolutionsModal.onOpenChange(false);
          memberSolutionForm.reset(memberSolutionFormDefaultValues);
          setSelectedMember(null);
          fetchTeam();
        } else {
          addToast({
            title: response?.payload?.status || "ERROR",
            description:
              response?.payload?.data?.message ||
              "Something went wrong while updating the member's solutions.",
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

  const renderCell = (rowData, columnKey) => {
    switch (columnKey) {
      case "id":
        return <span>{rowData?.id}</span>;

      case "salesUser":
        return (
          <div className="flex flex-col">
            <span className="font-medium">
              {rowData?.salesUser?.fullName || "-"}
            </span>
            {rowData?.salesUser?.email && (
              <span className="text-[11px] text-default-400">
                {rowData?.salesUser?.email}
              </span>
            )}
          </div>
        );

      case "assignmentOrder":
        return <span>{rowData?.assignmentOrder}</span>;

      case "openLeads":
        return (
          <span>
            {rowData?.currentOpenLeads ?? 0} / {rowData?.maximumOpenLeads ?? 0}
          </span>
        );

      case "solutions": {
        const mappedSolutions = rowData?.solutions || [];

        if (!mappedSolutions.length) {
          return <span className="text-default-400">-</span>;
        }

        const visibleMappedSolutions = mappedSolutions.slice(
          0,
          MAX_VISIBLE_SOLUTIONS,
        );
        const remainingMappedSolutions = mappedSolutions.slice(
          MAX_VISIBLE_SOLUTIONS,
        );

        return (
          <div className="flex flex-wrap items-center gap-1">
            {visibleMappedSolutions.map((solution) => (
              <Chip
                key={solution?.mappingId ?? solution?.solutionId}
                size="sm"
                variant="flat"
              >
                {solution?.solutionName}
              </Chip>
            ))}

            {remainingMappedSolutions.length > 0 && (
              <Tooltip
                content={
                  <div className="flex max-w-[240px] flex-col gap-0.5 py-1">
                    {remainingMappedSolutions.map((solution) => (
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
                  +{remainingMappedSolutions.length}
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

                  if (key === "mapSolutions") {
                    handleOpenMemberSolutionsModal(rowData);
                  }
                }}
              >
                <DropdownItem key="mapSolutions">Map solutions</DropdownItem>
              </DropdownMenu>
            </Dropdown>
          </div>
        );

      default:
        return rowData[columnKey];
    }
  };

  const topContent = useMemo(() => {
    return (
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
            onClear={() => setFilterValue("")}
            onValueChange={setFilterValue}
          />

          <Button
            size="sm"
            color="primary"
            onPress={handleOpenAddMemberModal}
            endContent={<Plus className="w-3.5 h-3.5" />}
          >
            Add Member
          </Button>
        </div>

        <span className="text-default-400 text-[12.5px]">
          Total {filteredMembers.length} members
        </span>
      </div>
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterValue, filteredMembers.length]);

  return (
    <>
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-3">
          <div className="min-w-0">
            <h1 className="font-sans text-lg font-semibold mb-1 shrink-0">
              {team?.teamName || "Team"}
            </h1>

            <div className="flex flex-wrap items-center gap-2 text-[12.5px] text-default-500">
              <span>{team?.teamCode}</span>

              {team && (
                <Chip
                  size="sm"
                  variant="flat"
                  color={team?.active ? "success" : "danger"}
                >
                  {team?.active ? "Active" : "Inactive"}
                </Chip>
              )}

              {team && (
                <Chip
                  size="sm"
                  variant="flat"
                  color={team?.autoAssignmentEnabled ? "success" : "default"}
                >
                  Auto assign {team?.autoAssignmentEnabled ? "on" : "off"}
                </Chip>
              )}
            </div>
          </div>
        </div>

        <Card
          shadow="none"
          className="border border-gray-200 dark:border-white/10"
        >
          <CardBody className="flex flex-col gap-1 text-[12.5px]">
            <div className="flex flex-wrap gap-x-8 gap-y-1">
              <span>
                <span className="text-default-400">Manager: </span>
                {team?.manager?.fullName || "-"}
                {team?.manager?.email ? ` (${team?.manager?.email})` : ""}
              </span>

              <span>
                <span className="text-default-400">Members: </span>
                {team?.memberCount ?? 0}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-1">
              <span className="text-default-400">Solutions: </span>

              {solutions.length === 0 ? (
                <span className="text-default-400">-</span>
              ) : (
                <>
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
                </>
              )}
            </div>

            {team?.description && (
              <p className="text-default-500">{team?.description}</p>
            )}
          </CardBody>
        </Card>

        <Table
          isHeaderSticky
          removeWrapper={false}
          aria-label="Team members table"
          topContent={topContent}
          topContentPlacement="outside"
          classNames={{
            base: "gap-2.5",
            wrapper:
              "max-h-[calc(100vh-420px)] w-full overflow-y-auto rounded-lg border border-gray-200 dark:border-white/10 shadow-none p-0",
            table: "w-full",
            thead: "[&>tr]:first:rounded-none",
            th: "h-8 py-0 text-[11.5px] tracking-wide bg-gray-50 dark:bg-neutral-900 text-default-500 first:rounded-none last:rounded-none border-b border-gray-200 dark:border-white/10",
            td: "py-1.5 text-[12.5px]",
          }}
        >
          <TableHeader columns={columns}>
            {(column) => (
              <TableColumn
                key={column.uid}
                align={column.uid === "actions" ? "center" : "start"}
              >
                {column.name}
              </TableColumn>
            )}
          </TableHeader>

          <TableBody emptyContent={"No members found"} items={filteredMembers}>
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

      <Modal
        size="xl"
        isDismissable={false}
        isKeyboardDismissDisabled={true}
        isOpen={memberModal.isOpen}
        onOpenChange={(open) => {
          memberModal.onOpenChange(open);
          if (!open) {
            memberForm.reset(memberFormDefaultValues);
          }
        }}
        placement="top-center"
        scrollBehavior="inside"
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader>Add member to {team?.teamName}</ModalHeader>

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

      {/* Map member to solutions modal — options are restricted to solutions
          already mapped to this team. */}
      <Modal
        size="xl"
        isDismissable={false}
        isKeyboardDismissDisabled={true}
        isOpen={memberSolutionsModal.isOpen}
        onOpenChange={(open) => {
          memberSolutionsModal.onOpenChange(open);
          if (!open) {
            setSelectedMember(null);
            memberSolutionForm.reset(memberSolutionFormDefaultValues);
          }
        }}
        placement="top-center"
        scrollBehavior="inside"
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader>
                Map solutions to {selectedMember?.salesUser?.fullName}
              </ModalHeader>

              <ModalBody>
                <form
                  className="flex max-h-[65vh] w-full flex-col gap-4 overflow-auto"
                  onSubmit={memberSolutionForm.handleSubmit(
                    handleMapMemberSolutions,
                  )}
                >
                  <Controller
                    name="solutionIds"
                    control={memberSolutionForm.control}
                    render={({ field, fieldState: { error } }) => (
                      <NewSelect
                        selectionMode="multiple"
                        label="Solutions"
                        placeholder={
                          teamSolutionOptions.length
                            ? "Select solutions..."
                            : "This team has no mapped solutions yet"
                        }
                        errorMessage={error?.message}
                        isInvalid={!!error}
                        data={teamSolutionOptions}
                        labelKey="solutionName"
                        valueKey="solutionId"
                        value={field.value}
                        onChange={(value) => field.onChange(value)}
                      />
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

export default LeadAssignmentTeamDetail;
