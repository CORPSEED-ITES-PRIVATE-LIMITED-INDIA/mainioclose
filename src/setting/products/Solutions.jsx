import React, { useEffect, useState } from "react";
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
  Form,
  Select,
  SelectItem,
  addToast,
  ModalFooter,
  Textarea,
  Switch,
  Chip,
} from "@heroui/react";
import { useDispatch, useSelector } from "react-redux";
import {
  createSolution,
  getAllSolutionCountByType,
  getAllSolutionsByType,
  searchSolutionsByName,
  updateSolution,
  updateLeadAssignmentSolutionPolicy,
  updateLeadAssignmentAutoAssignment,
} from "../../toolkit/slices/settingSlice";
import { ChevronDown, EllipsisVertical, Plus, Search } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import {
  addProductsInOperations,
  updateProductsInOperations,
} from "../../toolkit/slices/operationSlice";
import NewSelect from "../../components/NewSelect";

// Mirrors com.lead.em.lead.SalesAssignmentMode on the backend.
const SALES_ASSIGNMENT_MODE_OPTIONS = [
  { id: "MANUAL", name: "Manual — Quality/Admin selects the salesperson" },
  { id: "AUTOMATIC", name: "Automatic — system selects the salesperson" },
];

// Mirrors com.lead.em.lead.AutoAssignmentStrategy on the backend.
const AUTO_ASSIGNMENT_STRATEGY_OPTIONS = [
  { id: "ROUND_ROBIN", name: "Round robin" },
  { id: "RATING_BASED", name: "Rating based" },
  { id: "WORKLOAD_BASED", name: "Workload based" },
  { id: "RATING_AND_WORKLOAD", name: "Rating and workload" },
];

const policyFormDefaultValues = {
  useGlobalConfiguration: true,
  assignmentMode: "MANUAL",
  assignmentStrategy: "ROUND_ROBIN",
  autoAssignmentEnabled: true,
  maximumOpenLeadsPerUser: 0,
};

const autoAssignmentFormDefaultValues = {
  enabled: true,
  reason: "",
};

export const columns = [
  { name: "ID", uid: "id", sortable: true },
  { name: "NAME", uid: "name" },
  { name: "TYPE", uid: "type" },
  { name: "ASSIGNMENT MODE", uid: "assignmentMode" },
  { name: "ASSIGNMENT STRATEGY", uid: "assignmentStrategy" },
  { name: "AUTO ASSIGN", uid: "autoAssignmentEnabled" },
  { name: "MAX OPEN LEADS/USER", uid: "maximumOpenLeadsPerUser" },
  { name: "MAPPED TEAMS", uid: "totalMappedTeams" },
  { name: "ELIGIBLE USERS", uid: "totalEligibleSalesUsers" },
  { name: "ACTIONS", uid: "actions" },
];

export const statusOptions = [
  { name: "All", uid: "all" },
  { name: "Product", uid: "Product" },
  { name: "Service", uid: "Service" },
];

export function capitalize(s) {
  return s ? s.charAt(0).toUpperCase() + s.slice(1).toLowerCase() : "";
}

const INITIAL_VISIBLE_COLUMNS = [
  "id",
  "name",
  "type",
  "assignmentMode",
  "assignmentStrategy",
  "autoAssignmentEnabled",
  "maximumOpenLeadsPerUser",
  "actions",
];

// e.g. "RATING_AND_WORKLOAD" -> "Rating And Workload" — used for compact
// table chips, kept separate from the more descriptive Select option labels.
const formatEnumLabel = (value) =>
  value
    ? value
        .toLowerCase()
        .split("_")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ")
    : "-";

const Solutions = () => {
  const dispatch = useDispatch();
  const { userId } = useParams();
  const data = useSelector((state) => state.setting.solutionsList);
  const count = useSelector((state) => state.setting.solutionsCount);
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const modal = useDisclosure();
  const policyModal = useDisclosure();
  const autoAssignmentModal = useDisclosure();
  const [filterValue, setFilterValue] = React.useState("");
  const [visibleColumns, setVisibleColumns] = React.useState(
    new Set(INITIAL_VISIBLE_COLUMNS),
  );
  const [sortDescriptor, setSortDescriptor] = React.useState({
    column: "id",
    direction: "ascending",
  });
  const [formData, setFormData] = useState({
    name: "",
    type: "",
    description: "",
    scope: "",
  });

  const [initialFilteration, setInitialFilteration] = useState({
    type: "all",
    page: 1,
    size: 50,
    userId,
  });
  const [rowItem, setRowItem] = useState(null);
  const [policyRowItem, setPolicyRowItem] = useState(null);
  const [policyFormData, setPolicyFormData] = useState(
    policyFormDefaultValues,
  );
  const [autoAssignmentRowItem, setAutoAssignmentRowItem] = useState(null);
  const [autoAssignmentFormData, setAutoAssignmentFormData] = useState(
    autoAssignmentFormDefaultValues,
  );

  const hasSearchFilter = Boolean(filterValue);

  useEffect(() => {
    dispatch(getAllSolutionsByType(initialFilteration));
    dispatch(getAllSolutionCountByType(initialFilteration));
  }, [dispatch, initialFilteration]);

  const headerColumns = React.useMemo(() => {
    if (visibleColumns === "all") return columns;

    return columns.filter((column) =>
      Array.from(visibleColumns).includes(column.uid),
    );
  }, [visibleColumns]);

  const pages = Math.ceil(count / initialFilteration?.size) || 1;

  const sortedItems = React.useMemo(() => {
    return [...data].sort((a, b) => {
      const first = a[sortDescriptor.column];
      const second = b[sortDescriptor.column];
      const cmp = first < second ? -1 : first > second ? 1 : 0;

      return sortDescriptor.direction === "descending" ? -cmp : cmp;
    });
  }, [sortDescriptor, data]);

  const handleOpen = (row) => {
    setRowItem(row);
    setFormData({
      name: row?.name,
      type: row?.type,
      description: row?.description,
      scope: row?.scope,
    });
    onOpen();
  };

  const handleOpenPolicyModal = (row) => {
    const policy = row?.assignmentConfiguration?.policy;

    setPolicyRowItem(row);
    setPolicyFormData({
      useGlobalConfiguration:
        policy?.useGlobalConfiguration ??
        policyFormDefaultValues.useGlobalConfiguration,
      assignmentMode:
        policy?.assignmentMode ?? policyFormDefaultValues.assignmentMode,
      assignmentStrategy:
        policy?.assignmentStrategy ??
        policyFormDefaultValues.assignmentStrategy,
      autoAssignmentEnabled:
        policy?.autoAssignmentEnabled ??
        policyFormDefaultValues.autoAssignmentEnabled,
      maximumOpenLeadsPerUser:
        policy?.maximumOpenLeadsPerUser ??
        policyFormDefaultValues.maximumOpenLeadsPerUser,
    });
    policyModal.onOpen();
  };

  const handleSubmitPolicy = () => {
    dispatch(
      updateLeadAssignmentSolutionPolicy({
        solutionId: policyRowItem?.id,
        data: {
          ...policyFormData,
          maximumOpenLeadsPerUser: Number(
            policyFormData?.maximumOpenLeadsPerUser,
          ),
          updatedByUserId: Number(userId),
        },
      }),
    )
      .then((response) => {
        if (response.meta.requestStatus === "fulfilled") {
          addToast({
            title: "SUCCESS",
            description: "Lead assignment policy updated successfully !.",
            color: "success",
          });
          policyModal.onOpenChange(false);
          setPolicyRowItem(null);
          dispatch(getAllSolutionsByType(initialFilteration));
        } else {
          addToast({
            title: response?.payload?.status || "ERROR",
            description:
              response?.payload?.data?.message ||
              "Something went wrong while updating the policy.",
            color: "danger",
          });
        }
      })
      .catch(() =>
        addToast({ title: "ERROR", description: "Something went wrong !.", color: "danger" }),
      );
  };

  const handleOpenAutoAssignmentModal = (row) => {
    setAutoAssignmentRowItem(row);
    setAutoAssignmentFormData({
      enabled:
        row?.assignmentConfiguration?.policy?.autoAssignmentEnabled ??
        autoAssignmentFormDefaultValues.enabled,
      reason: "",
    });
    autoAssignmentModal.onOpen();
  };

  const handleSubmitAutoAssignment = () => {
    dispatch(
      updateLeadAssignmentAutoAssignment({
        solutionId: autoAssignmentRowItem?.id,
        data: {
          enabled: autoAssignmentFormData?.enabled,
          reason: autoAssignmentFormData?.reason,
          updatedByUserId: Number(userId),
        },
      }),
    )
      .then((response) => {
        if (response.meta.requestStatus === "fulfilled") {
          addToast({
            title: "SUCCESS",
            description: `Auto assignment ${
              autoAssignmentFormData?.enabled ? "enabled" : "disabled"
            } successfully !.`,
            color: "success",
          });
          autoAssignmentModal.onOpenChange(false);
          setAutoAssignmentRowItem(null);
          dispatch(getAllSolutionsByType(initialFilteration));
        } else {
          addToast({
            title: response?.payload?.status || "ERROR",
            description:
              response?.payload?.data?.message ||
              "Something went wrong while updating auto assignment.",
            color: "danger",
          });
        }
      })
      .catch(() =>
        addToast({ title: "ERROR", description: "Something went wrong !.", color: "danger" }),
      );
  };

  // const handleDelete = () => {
  //   dispatch(deleteProduct(deleteId))
  //     .then((resp) => {
  //       if (resp.meta.requestStatus === "fulfilled") {
  //         addToast({
  //           title: "Status deleted successfully !.",
  //           color: "success",
  //         });
  //         modal.onOpenChange(false);
  //         setDeleteId(null);
  //         dispatch(getAllStatusData());
  //       } else {
  //         addToast({ title: "Something went wrong !.", color: "danger" });
  //       }
  //     })
  //     .catch(() =>
  //       addToast({ title: "Something went wrong !.", color: "danger" })
  //     );
  // };

  const handleSubmit = (values) => {
    if (rowItem) {
      dispatch(updateSolution({ id: rowItem?.id, userId, data: values }))
        .then((resp) => {
          if (resp.meta.requestStatus === "fulfilled") {
            const productInfo = resp.payload;
            addToast({
              title: "Product updated successfully !.",
              color: "success",
            });
            onOpenChange(false);
            dispatch(getAllSolutionsByType(initialFilteration));
            dispatch(
              updateProductsInOperations({
                id: rowItem?.id,
                userId,
                data: {
                  productId: productInfo?.id,
                  productName: productInfo?.name,
                  description: productInfo?.description || "Something",
                  createdBy: productInfo?.createdById,
                  updatedBy: productInfo?.createdById,
                  // date: productInfo?.createdDate,
                  active: true,
                },
              }),
            );
            setFormData({ name: "", type: "", description: "" });
            setRowItem(null);
          } else {
            addToast({ title: "Something went wrong !.", color: "danger" });
          }
        })
        .catch(() =>
          addToast({ title: "Something went wrong !.", color: "danger" }),
        );
    } else {
      dispatch(createSolution({ createdById: userId, ...values }))
        .then((resp) => {
          if (resp.meta.requestStatus === "fulfilled") {
            const productInfo = resp.payload;
            addToast({
              title: "Product created successfully !.",
              color: "success",
            });
            onOpenChange(false);
            dispatch(getAllSolutionsByType(initialFilteration));
            dispatch(
              addProductsInOperations([
                {
                  productId: productInfo?.id,
                  productName: productInfo?.name,
                  description: productInfo?.description || "Something",
                  createdBy: productInfo?.createdById,
                  updatedBy: productInfo?.createdById,
                  // date: productInfo?.createdDate,
                  active: true,
                },
              ]),
            );
            setFormData({ name: "", type: "", description: "" });
          } else {
            addToast({ title: "Something went wrong !.", color: "danger" });
          }
        })
        .catch(() =>
          addToast({ title: "Something went wrong !.", color: "danger" }),
        );
    }
  };

  const renderCell = React.useCallback((rowData, columnKey) => {
    const cellValue = rowData[columnKey];

    switch (columnKey) {
      case "name":
        return (
          <Link
            to={
              rowData?.type === "SERVICE"
                ? `${rowData?.id}/detail/solutionPrice`
                : rowData?.type === "PRODUCT"
                  ? `${rowData?.id}/businessArrangement`
                  : ""
            }
            className="font-medium"
          >
            {rowData?.name}
          </Link>
        );

      case "assignmentMode":
        return (
          <span>
            {formatEnumLabel(
              rowData?.assignmentConfiguration?.policy?.assignmentMode,
            )}
          </span>
        );

      case "assignmentStrategy":
        return (
          <span>
            {formatEnumLabel(
              rowData?.assignmentConfiguration?.policy?.assignmentStrategy,
            )}
          </span>
        );

      case "autoAssignmentEnabled":
        return (
          <Chip
            size="sm"
            variant="flat"
            color={
              rowData?.assignmentConfiguration?.policy?.autoAssignmentEnabled
                ? "success"
                : "default"
            }
          >
            {rowData?.assignmentConfiguration?.policy?.autoAssignmentEnabled
              ? "Enabled"
              : "Disabled"}
          </Chip>
        );

      case "maximumOpenLeadsPerUser":
        return (
          <span>
            {rowData?.assignmentConfiguration?.policy
              ?.maximumOpenLeadsPerUser ?? "-"}
          </span>
        );

      case "totalMappedTeams":
        return (
          <Chip size="sm" variant="flat">
            {rowData?.assignmentConfiguration?.totalMappedTeams ?? 0}
          </Chip>
        );

      case "totalEligibleSalesUsers":
        return (
          <Chip size="sm" variant="flat">
            {rowData?.assignmentConfiguration?.totalEligibleSalesUsers ?? 0}
          </Chip>
        );

      case "actions":
        return (
          <div className="relative flex justify-center items-center gap-2">
            <Dropdown>
              <DropdownTrigger>
                <Button isIconOnly size="sm" variant="light">
                  <EllipsisVertical className="text-default-300" />
                </Button>
              </DropdownTrigger>
              <DropdownMenu>
                <DropdownItem key="edit" onPress={() => handleOpen(rowData)}>
                  Edit
                </DropdownItem>
                <DropdownItem
                  key="assignmentPolicy"
                  onPress={() => handleOpenPolicyModal(rowData)}
                >
                  Assignment policy
                </DropdownItem>
                <DropdownItem
                  key="toggleAutoAssignment"
                  onPress={() => handleOpenAutoAssignmentModal(rowData)}
                >
                  Toggle auto assignment
                </DropdownItem>
                {/* <DropdownItem
                  key="delete"
                  color="danger"
                  onPress={() => handleOpen(rowData)}
                >
                  Delete
                </DropdownItem> */}
              </DropdownMenu>
            </Dropdown>
          </div>
        );
      default:
        return cellValue;
    }
  }, []);

  const onNextPage = React.useCallback(() => {
    if (initialFilteration?.page < pages) {
      setInitialFilteration((prev) => ({
        ...prev,
        page: initialFilteration?.page + 1,
      }));
    }
  }, [initialFilteration?.page, pages]);

  const onPreviousPage = React.useCallback(() => {
    if (initialFilteration?.page > 1) {
      setInitialFilteration((prev) => ({
        ...prev,
        page: initialFilteration?.page - 1,
      }));
    }
  }, [initialFilteration?.page]);

  const onRowsPerPageChange = React.useCallback((e) => {
    setInitialFilteration((prev) => ({
      ...prev,
      size: Number(e.target.value),
      page: 1,
    }));
  }, []);

  const onSearchChange = React.useCallback(
    (value) => {
      setFilterValue(value);
      const trimmedValue = value?.trim() || "";
      if (trimmedValue.length > 2) {
        dispatch(
          searchSolutionsByName({
            name: trimmedValue,
            ...initialFilteration,
          }),
        );
      } else if (trimmedValue.length === 0) {
        dispatch(getAllSolutionsByType(initialFilteration));
        dispatch(getAllSolutionCountByType(initialFilteration));
      }
    },
    [dispatch, initialFilteration],
  );

  const onClear = React.useCallback(() => {
    setFilterValue("");
    setInitialFilteration((prev) => ({
      ...prev,
      page: 1,
    }));
    dispatch(getAllSolutionsByType(initialFilteration));
    dispatch(getAllSolutionCountByType(initialFilteration));
  }, []);

  const topContent = React.useMemo(() => {
    return (
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
            onClear={() => onClear()}
            onValueChange={onSearchChange}
          />
          <div className="flex gap-1.5 flex-wrap">
            <Dropdown>
              <DropdownTrigger className="hidden sm:flex">
                <Button
                  size="sm"
                  className="capitalize"
                  endContent={<ChevronDown className="w-4 h-4" />}
                  variant="flat"
                >
                  {initialFilteration?.type}
                </Button>
              </DropdownTrigger>

              <DropdownMenu
                disallowEmptySelection
                aria-label="Single selection example"
                selectedKeys={[initialFilteration?.type]}
                selectionMode="single"
                onSelectionChange={(event) => {
                  const [status] = [...event];
                  setInitialFilteration((prev) => ({
                    ...prev,
                    type: status,
                  }));
                }}
              >
                {statusOptions.map((status) => (
                  <DropdownItem key={status.uid} className="capitalize">
                    {capitalize(status.name)}
                  </DropdownItem>
                ))}
              </DropdownMenu>
            </Dropdown>
            <Dropdown>
              <DropdownTrigger className="hidden sm:flex">
                <Button
                  size="sm"
                  endContent={<ChevronDown className="w-4 h-4" />}
                  variant="flat"
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
              color="primary"
              size="sm"
              onPress={onOpen}
              endContent={<Plus className="w-4 h-4" />}
            >
              Add New
            </Button>
          </div>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-default-400 text-[12.5px]">
            Total {count} solutions
          </span>
          <label className="flex items-center gap-1 text-default-400 text-[12.5px]">
            Rows per page:
            <select
              className="bg-transparent outline-hidden text-default-400 text-[12.5px] cursor-pointer"
              onChange={onRowsPerPageChange}
              value={initialFilteration?.size}
            >
              <option value="5">5</option>
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
    initialFilteration,
    visibleColumns,
    onRowsPerPageChange,
    count,
    onSearchChange,
    hasSearchFilter,
  ]);

  const bottomContent = React.useMemo(() => {
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
  }, [initialFilteration?.page, pages, count]);

  return (
    <div className="flex flex-col gap-2">
      <h1 className="font-sans text-lg font-semibold mb-2 shrink-0">
        Solutions
      </h1>
      <Table
        isHeaderSticky
        removeWrapper={false}
        aria-label="Solutions table"
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
        <TableBody emptyContent={"No data found"} items={sortedItems}>
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
        size="2xl"
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
                {rowItem ? "Update solution" : "Create solution"}
              </ModalHeader>
              <ModalBody>
                <Form
                  onSubmit={(e) => {
                    e.preventDefault();
                    let data = Object.fromEntries(
                      new FormData(e.currentTarget),
                    );
                    handleSubmit(data);
                  }}
                >
                  <div className="w-full grid grid-cols-2 gap-2 max-h-[65vh] overflow-auto p-4">
                    <Input
                      isRequired
                      errorMessage="Please enter product name"
                      label="Solution name"
                      name="name"
                      type="SERVICE"
                      value={formData?.name}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          name: e.target.value,
                        }))
                      }
                    />
                    <Select
                      isRequired
                      errorMessage="please select the solution type"
                      label="Select solution type"
                      name="type"
                      selectedKeys={[formData?.type]}
                      onSelectionChange={(e) => {
                        let key = Array.from(e)[0];
                        setFormData((prev) => ({ ...prev, type: key }));
                      }}
                    >
                      {[
                        { label: "PRODUCT", value: "PRODUCT" },
                        { label: "SERVICE", value: "SERVICE" },
                        { label: "PLANT_SETUP", value: "PLANT_SETUP" },
                      ].map((info) => (
                        <SelectItem key={info.value}>{info.label}</SelectItem>
                      ))}
                    </Select>

                    <Select
                      isRequired
                      errorMessage="please select the scope"
                      label="Select scope"
                      name="scope"
                      selectedKeys={[formData?.scope]}
                      onSelectionChange={(e) => {
                        let key = Array.from(e)[0];
                        setFormData((prev) => ({ ...prev, scope: key }));
                      }}
                    >
                      {[
                        { label: "GLOBAL", value: "GLOBAL" },
                        { label: "CENTRAL", value: "CENTRAL" },
                        { label: "STATE", value: "STATE" },
                      ].map((info) => (
                        <SelectItem key={info.value}>{info.label}</SelectItem>
                      ))}
                    </Select>

                    <Select
                      isRequired
                      errorMessage="please select whether client portal is required or not"
                      label="Require client portal"
                      name="requiresClientPortal"
                      selectedKeys={
                        formData?.requiresClientPortal !== undefined
                          ? [formData?.requiresClientPortal.toString()]
                          : []
                      }
                      onSelectionChange={(keys) => {
                        const value = Array.from(keys)[0];
                        if (value !== undefined)
                          setFormData((prev) => ({
                            ...prev,
                            requiresClientPortal: value === "true",
                          }));
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

                    {formData?.requiresClientPortal && (
                      <>
                        <Input
                          isRequired
                          errorMessage="Please enter portal name"
                          label="Portal name"
                          name="expectedPortalName"
                          value={formData?.expectedPortalName}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              expectedPortalName: e.target.value,
                            }))
                          }
                        />

                        <Input
                          isRequired
                          errorMessage="Please enter product name"
                          label="Default portal name"
                          name="defaultPortalUrl"
                          value={formData?.defaultPortalUrl}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              defaultPortalUrl: e.target.value,
                            }))
                          }
                        />

                        <Textarea
                          isRequired
                          errorMessage="Please enter description"
                          className="max-w-xs"
                          label="Description"
                          name="description"
                          value={formData?.description}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              description: e.target.value,
                            }))
                          }
                        />
                      </>
                    )}
                  </div>

                  <ModalFooter className="w-full flex justify-end">
                    <Button onPress={onClose}>Cancel</Button>
                    <Button color="primary" type="submit">
                      Submit
                    </Button>
                  </ModalFooter>
                </Form>
              </ModalBody>
            </>
          )}
        </ModalContent>
      </Modal>
      {/* Lead assignment policy modal */}
      <Modal
        size="lg"
        isDismissable={false}
        isKeyboardDismissDisabled={true}
        isOpen={policyModal.isOpen}
        onOpenChange={(open) => {
          policyModal.onOpenChange(open);
          if (!open) {
            setPolicyRowItem(null);
            setPolicyFormData(policyFormDefaultValues);
          }
        }}
        placement="top-center"
        scrollBehavior="inside"
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader>
                Assignment policy — {policyRowItem?.name}
              </ModalHeader>

              <ModalBody>
                <div className="flex w-full flex-col gap-4 pb-2">
                  <Switch
                    isSelected={policyFormData?.useGlobalConfiguration}
                    onValueChange={(value) =>
                      setPolicyFormData((prev) => ({
                        ...prev,
                        useGlobalConfiguration: value,
                      }))
                    }
                    size="sm"
                  >
                    Use global configuration
                  </Switch>

                  <NewSelect
                    isRequired
                    isSearchable={false}
                    label="Assignment mode"
                    data={SALES_ASSIGNMENT_MODE_OPTIONS}
                    labelKey="name"
                    valueKey="id"
                    value={policyFormData?.assignmentMode}
                    onChange={(value) =>
                      setPolicyFormData((prev) => ({
                        ...prev,
                        assignmentMode: value,
                      }))
                    }
                  />

                  <NewSelect
                    isRequired
                    isSearchable={false}
                    label="Assignment strategy"
                    data={AUTO_ASSIGNMENT_STRATEGY_OPTIONS}
                    labelKey="name"
                    valueKey="id"
                    value={policyFormData?.assignmentStrategy}
                    onChange={(value) =>
                      setPolicyFormData((prev) => ({
                        ...prev,
                        assignmentStrategy: value,
                      }))
                    }
                  />

                  <Input
                    type="number"
                    min={0}
                    label="Maximum open leads per user"
                    value={String(
                      policyFormData?.maximumOpenLeadsPerUser ?? 0,
                    )}
                    onChange={(e) =>
                      setPolicyFormData((prev) => ({
                        ...prev,
                        maximumOpenLeadsPerUser: e.target.value,
                      }))
                    }
                  />

                  <Switch
                    isSelected={policyFormData?.autoAssignmentEnabled}
                    onValueChange={(value) =>
                      setPolicyFormData((prev) => ({
                        ...prev,
                        autoAssignmentEnabled: value,
                      }))
                    }
                    size="sm"
                  >
                    Enable auto assignment
                  </Switch>
                </div>

                <ModalFooter className="px-0">
                  <Button variant="flat" onPress={onClose}>
                    Cancel
                  </Button>

                  <Button color="primary" onPress={handleSubmitPolicy}>
                    Submit
                  </Button>
                </ModalFooter>
              </ModalBody>
            </>
          )}
        </ModalContent>
      </Modal>

      {/* Toggle auto assignment modal */}
      <Modal
        size="md"
        isDismissable={false}
        isKeyboardDismissDisabled={true}
        isOpen={autoAssignmentModal.isOpen}
        onOpenChange={(open) => {
          autoAssignmentModal.onOpenChange(open);
          if (!open) {
            setAutoAssignmentRowItem(null);
            setAutoAssignmentFormData(autoAssignmentFormDefaultValues);
          }
        }}
        placement="top-center"
        scrollBehavior="inside"
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader>
                Auto assignment — {autoAssignmentRowItem?.name}
              </ModalHeader>

              <ModalBody>
                <div className="flex w-full flex-col gap-4 pb-2">
                  <Switch
                    isSelected={autoAssignmentFormData?.enabled}
                    onValueChange={(value) =>
                      setAutoAssignmentFormData((prev) => ({
                        ...prev,
                        enabled: value,
                      }))
                    }
                    size="sm"
                  >
                    {autoAssignmentFormData?.enabled ? "Enabled" : "Disabled"}
                  </Switch>

                  <Textarea
                    label="Reason"
                    placeholder="Why are you changing auto assignment ?"
                    value={autoAssignmentFormData?.reason}
                    onChange={(e) =>
                      setAutoAssignmentFormData((prev) => ({
                        ...prev,
                        reason: e.target.value,
                      }))
                    }
                  />
                </div>

                <ModalFooter className="px-0">
                  <Button variant="flat" onPress={onClose}>
                    Cancel
                  </Button>

                  <Button color="primary" onPress={handleSubmitAutoAssignment}>
                    Submit
                  </Button>
                </ModalFooter>
              </ModalBody>
            </>
          )}
        </ModalContent>
      </Modal>

      <Modal
        isOpen={modal.isOpen}
        backdrop="blur"
        onOpenChange={modal.onOpenChange}
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">Delete</ModalHeader>
              <ModalBody>Are you sure to delete the item ?</ModalBody>
              <ModalFooter>
                <Button variant="light" onPress={onClose}>
                  Cancel
                </Button>
                <Button color="danger" onPress={handleDelete}>
                  Delete
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
};

export default Solutions;
