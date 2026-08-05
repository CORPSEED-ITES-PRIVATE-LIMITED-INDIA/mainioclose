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
  Chip,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Select,
  SelectItem,
  Textarea,
  Switch,
  addToast,
  useDisclosure,
} from "@heroui/react";
import {
  ChevronDown,
  EllipsisVertical,
  Plus,
  Search,
  Pencil,
  Trash2,
  RefreshCw,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  createLedgerGroup,
  deleteLedgerGroup,
  getAllLedgerGroupType,
  getLedgerGroups,
  updateLedgerGroup,
} from "../../toolkit/slices/organizationSlice";
import NewSelect from "../../components/NewSelect";

const groupTypeOptions = [
  { label: "Sundry Debtors", value: "SUNDRY_DEBTORS" },
  { label: "Sundry Creditors", value: "SUNDRY_CREDITORS" },
  { label: "Bank Accounts", value: "BANK_ACCOUNTS" },
  { label: "Cash In Hand", value: "CASH_IN_HAND" },
  { label: "Sales Accounts", value: "SALES_ACCOUNTS" },
  { label: "Duties And Taxes", value: "DUTIES_AND_TAXES" },
  { label: "Current Assets", value: "CURRENT_ASSETS" },
  { label: "Current Liabilities", value: "CURRENT_LIABILITIES" },
  { label: "Indirect Expenses", value: "INDIRECT_EXPENSES" },
  { label: "Direct Expenses", value: "DIRECT_EXPENSES" },
  { label: "Indirect Income", value: "INDIRECT_INCOME" },
  { label: "Direct Income", value: "DIRECT_INCOME" },
];

const columns = [
  { name: "ID", uid: "id" },
  { name: "NAME", uid: "name", sortable: true },
  { name: "GROUP TYPE", uid: "groupType" },
  { name: "DESCRIPTION", uid: "description" },
  { name: "SYSTEM", uid: "systemDefault" },
  { name: "STATUS", uid: "active" },
  { name: "ACTIONS", uid: "actions" },
];

const INITIAL_VISIBLE_COLUMNS = [
  "id",
  "name",
  "groupType",
  "description",
  "systemDefault",
  "active",
  "actions",
];

const emptyForm = {
  name: "",
  groupType: "SUNDRY_DEBTORS",
  description: "",
  systemDefault: false,
  active: true,
};

const Group = () => {
  const dispatch = useDispatch();
  const { isOpen, onOpen, onOpenChange, onClose } = useDisclosure();

  const {
    ledgerGroupList,
    ledgerGroupTotalElements,
    ledgerGroupTotalPages,
    ledgerGroupLoading,
    createLedgerGroupLoading,
    updateLedgerGroupLoading,
    deleteLedgerGroupLoading,
    ledgerGroupTypeList,
  } = useSelector((state) => state.organization);

  const getGroupLabel = (value) => {
    return (
      ledgerGroupTypeList?.find((item) => item.value === value)?.label || value
    );
  };

  const [filterValue, setFilterValue] = useState("");
  const [groupTypeFilter, setGroupTypeFilter] = useState("");
  const [activeFilter, setActiveFilter] = useState("");

  const [selectedKeys, setSelectedKeys] = useState(new Set([]));
  const [visibleColumns, setVisibleColumns] = useState(
    new Set(INITIAL_VISIBLE_COLUMNS),
  );

  const [rowsPerPage, setRowsPerPage] = useState(20);
  const [page, setPage] = useState(1);

  const [sortDescriptor, setSortDescriptor] = useState({
    column: "id",
    direction: "ascending",
  });

  const [formData, setFormData] = useState(emptyForm);
  const [editData, setEditData] = useState(null);

  const fetchLedgerGroups = useCallback(() => {
    dispatch(
      getLedgerGroups({
        search: filterValue,
        groupType: groupTypeFilter,
        active: activeFilter,
        page,
        size: rowsPerPage,
      }),
    );
  }, [dispatch, filterValue, groupTypeFilter, activeFilter, page, rowsPerPage]);

  useEffect(() => {
    fetchLedgerGroups();
  }, [fetchLedgerGroups]);

  useEffect(() => {
    dispatch(getAllLedgerGroupType());
  }, [dispatch]);

  const isLoading = ledgerGroupLoading === "pending";
  const isSaving =
    createLedgerGroupLoading === "pending" ||
    updateLedgerGroupLoading === "pending";

  const isDeleting = deleteLedgerGroupLoading === "pending";

  const headerColumns = useMemo(() => {
    if (visibleColumns === "all") return columns;

    return columns.filter((column) =>
      Array.from(visibleColumns).includes(column.uid),
    );
  }, [visibleColumns]);

  const sortedItems = useMemo(() => {
    return [...(ledgerGroupList || [])].sort((a, b) => {
      const first = String(a?.[sortDescriptor.column] ?? "").toLowerCase();
      const second = String(b?.[sortDescriptor.column] ?? "").toLowerCase();

      const cmp = first < second ? -1 : first > second ? 1 : 0;

      return sortDescriptor.direction === "descending" ? -cmp : cmp;
    });
  }, [ledgerGroupList, sortDescriptor]);

  const resetForm = () => {
    setFormData(emptyForm);
    setEditData(null);
  };

  const handleOpenCreate = () => {
    resetForm();
    onOpen();
  };

  const handleOpenEdit = (row) => {
    setEditData(row);
    setFormData({
      name: row?.name || "",
      groupType: row?.groupType || "SUNDRY_DEBTORS",
      description: row?.description || "",
      systemDefault: Boolean(row?.systemDefault),
      active: row?.active !== false,
    });
    onOpen();
  };

  const handleSave = async () => {
    try {
      if (!formData.name?.trim()) {
        addToast({
          title: "Group name is required",
          color: "danger",
        });
        return;
      }

      if (!formData.groupType) {
        addToast({
          title: "Group type is required",
          color: "danger",
        });
        return;
      }

      const payload = {
        name: formData.name.trim(),
        groupType: formData.groupType,
        description: formData.description?.trim() || "",
        systemDefault: Boolean(formData.systemDefault),
        active: Boolean(formData.active),
      };

      if (editData?.id) {
        await dispatch(
          updateLedgerGroup({
            id: editData.id,
            data: payload,
          }),
        ).unwrap();

        addToast({
          title: "Ledger group updated successfully",
          color: "success",
        });
      } else {
        await dispatch(createLedgerGroup(payload)).unwrap();

        addToast({
          title: "Ledger group created successfully",
          color: "success",
        });
      }

      resetForm();
      onClose();
      fetchLedgerGroups();
    } catch (error) {
      addToast({
        title: error || "Failed to save ledger group",
        color: "danger",
      });
    }
  };

  const handleDelete = async (row) => {
    try {
      const confirmed = window.confirm(
        `Are you sure you want to delete "${row?.name}"?`,
      );

      if (!confirmed) return;

      await dispatch(deleteLedgerGroup(row.id)).unwrap();

      addToast({
        title: "Ledger group deleted successfully",
        color: "success",
      });

      fetchLedgerGroups();
    } catch (error) {
      addToast({
        title: error || "Failed to delete ledger group",
        color: "danger",
      });
    }
  };

  const renderCell = (rowData, columnKey) => {
    const cellValue = rowData[columnKey];

    switch (columnKey) {
      case "name":
        return (
          <Link
            // to={`${rowData?.id}/groupLedger`}
            className="text-sm font-semibold capitalize"
          >
            {rowData?.name || "-"}
          </Link>
        );

      case "groupType":
        return (
          <Chip size="sm" variant="flat" color="primary">
            {getGroupLabel(rowData?.groupType)}
          </Chip>
        );

      case "description":
        return (
          <span className="line-clamp-1 max-w-[280px] text-sm text-slate-600">
            {rowData?.description || "-"}
          </span>
        );

      case "systemDefault":
        return (
          <Chip
            size="sm"
            variant="flat"
            color={rowData?.systemDefault ? "secondary" : "default"}
          >
            {rowData?.systemDefault ? "Yes" : "No"}
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
          <div className="relative flex items-center justify-center gap-2">
            <Dropdown>
              <DropdownTrigger>
                <Button isIconOnly size="sm" variant="light">
                  <EllipsisVertical size={17} className="text-default-500" />
                </Button>
              </DropdownTrigger>

              <DropdownMenu
                aria-label="Ledger group actions"
                onAction={(key) => {
                  if (key === "edit") handleOpenEdit(rowData);
                  if (key === "delete") handleDelete(rowData);
                }}
              >
                <DropdownItem key="edit" startContent={<Pencil size={15} />}>
                  Edit
                </DropdownItem>

                <DropdownItem
                  key="delete"
                  className="text-danger"
                  color="danger"
                  startContent={<Trash2 size={15} />}
                >
                  Delete
                </DropdownItem>
              </DropdownMenu>
            </Dropdown>
          </div>
        );

      default:
        return cellValue ?? "-";
    }
  };

  const onRowsPerPageChange = useCallback((e) => {
    setRowsPerPage(Number(e.target.value));
    setPage(1);
  }, []);

  const onSearchChange = useCallback((value) => {
    setFilterValue(value || "");
    setPage(1);
  }, []);

  const onClear = useCallback(() => {
    setFilterValue("");
    setPage(1);
  }, []);

  const resetFilters = () => {
    setFilterValue("");
    setGroupTypeFilter("");
    setActiveFilter("");
    setPage(1);
  };

  const paginationTotal = Math.max(ledgerGroupTotalPages || 1, 1);

  const topContent = useMemo(() => {
    return (
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <Input
            isClearable
            size="sm"
            className="w-full lg:max-w-[320px]"
            placeholder="Search ledger group..."
            startContent={<Search size={16} />}
            value={filterValue}
            onClear={onClear}
            onValueChange={onSearchChange}
          />

          <div className="flex w-full flex-wrap items-center justify-end gap-2">
            <Select
              size="sm"
              label="Active"
              className="w-[120px] shrink-0"
              selectedKeys={
                activeFilter ? new Set([activeFilter]) : new Set(["ALL"])
              }
              onSelectionChange={(keys) => {
                const selectedValue = Array.from(keys)?.[0];

                setActiveFilter(selectedValue === "ALL" ? "" : selectedValue);
                setPage(1);
              }}
            >
              <SelectItem key="ALL">All</SelectItem>
              <SelectItem key="true">Active</SelectItem>
              <SelectItem key="false">Inactive</SelectItem>
            </Select>

            <div className="w-[220px] shrink-0">
              <NewSelect
                label="Group Type"
                size="sm"
                labelKey="label"
                valueKey="value"
                data={ledgerGroupTypeList}
                value={groupTypeFilter ? groupTypeFilter : "ALL"}
                onChange={(key) => {
                  setGroupTypeFilter(key === "ALL" ? "" : key);
                  setPage(1);
                }}
              />
            </div>

            <Dropdown>
              <DropdownTrigger className="hidden sm:flex">
                <Button
                  size="sm"
                  endContent={<ChevronDown size={16} />}
                  variant="flat"
                  className="shrink-0"
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
                  <DropdownItem key={column.uid}>{column.name}</DropdownItem>
                ))}
              </DropdownMenu>
            </Dropdown>

            <Button
              size="sm"
              variant="flat"
              onPress={resetFilters}
              className="shrink-0"
            >
              Reset
            </Button>

            <Button
              size="sm"
              variant="flat"
              startContent={<RefreshCw size={15} />}
              onPress={fetchLedgerGroups}
              className="shrink-0"
            >
              Refresh
            </Button>

            <Button
              size="sm"
              className="shrink-0 whitespace-nowrap bg-emerald-700 px-4 font-semibold text-white"
              startContent={<Plus size={16} />}
              onPress={handleOpenCreate}
            >
              Create Group
            </Button>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-small text-default-400">
            Total {ledgerGroupTotalElements} ledger groups
          </span>

          <label className="flex items-center text-small text-default-400">
            Rows per page:
            <select
              className="bg-transparent text-small text-default-400 outline-none"
              value={rowsPerPage}
              onChange={onRowsPerPageChange}
            >
              <option value="15">15</option>
              <option value="20">20</option>
              <option value="50">50</option>
            </select>
          </label>
        </div>
      </div>
    );
  }, [
    filterValue,
    groupTypeFilter,
    activeFilter,
    visibleColumns,
    rowsPerPage,
    onClear,
    onSearchChange,
    onRowsPerPageChange,
    fetchLedgerGroups,
    ledgerGroupTypeList,
  ]);

  const bottomContent = useMemo(() => {
    return (
      <div className="flex items-center justify-between px-2 py-2">
        <span className="w-[30%] text-small text-default-400">
          {selectedKeys === "all"
            ? "All items selected"
            : `${selectedKeys.size} selected`}
        </span>

        <Pagination
          isCompact
          showControls
          showShadow
          color="primary"
          page={page}
          total={paginationTotal}
          onChange={setPage}
        />

        <div className="hidden w-[30%] justify-end gap-2 sm:flex">
          <Button
            isDisabled={page <= 1}
            size="sm"
            variant="flat"
            onPress={() => setPage((prev) => Math.max(prev - 1, 1))}
          >
            Previous
          </Button>

          <Button
            isDisabled={page >= paginationTotal}
            size="sm"
            variant="flat"
            onPress={() =>
              setPage((prev) => Math.min(prev + 1, paginationTotal))
            }
          >
            Next
          </Button>
        </div>
      </div>
    );
  }, [selectedKeys, page, paginationTotal]);

  return (
    <>
      <div className="mb-3 flex items-center justify-between gap-3">
        <div>
          <h1 className="font-sans text-lg font-semibold mb-2 shrink-0">
            Ledger Group List
          </h1>
          <p className="text-sm text-slate-500">
            Create, update, filter and manage accounting ledger groups.
          </p>
        </div>
      </div>

      <Table
        isHeaderSticky
        aria-label="Ledger group table"
        bottomContent={bottomContent}
        bottomContentPlacement="outside"
        classNames={{
          wrapper: "max-h-[52vh] ",
          th: "text-xs",
          td: "text-sm",
        }}
        selectedKeys={selectedKeys}
        sortDescriptor={sortDescriptor}
        topContent={topContent}
        topContentPlacement="outside"
        onSelectionChange={setSelectedKeys}
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

        <TableBody
          isLoading={isLoading || isDeleting}
          loadingContent="Loading ledger groups..."
          emptyContent="No ledger groups found"
          items={sortedItems}
        >
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
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        placement="top-center"
        scrollBehavior="inside"
        isDismissable={false}
      >
        <ModalContent>
          {(close) => (
            <>
              <ModalHeader>
                <div>
                  <h2 className="text-lg font-semibold">
                    {editData ? "Update Ledger Group" : "Create Ledger Group"}
                  </h2>
                  <p className="text-xs font-normal text-slate-500">
                    Fill ledger group details as per account master.
                  </p>
                </div>
              </ModalHeader>

              <ModalBody>
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                  <Input
                    size="sm"
                    label="Name"
                    placeholder="Enter group name"
                    isRequired
                    value={formData.name}
                    onValueChange={(value) =>
                      setFormData((prev) => ({ ...prev, name: value }))
                    }
                  />

                  <NewSelect
                    label="Group Type"
                    size="sm"
                    data={ledgerGroupTypeList}
                    labelKey={"label"}
                    valueKey="value"
                    value={formData?.groupType}
                    onChange={(key) => {
                      setFormData((prev) => ({
                        ...prev,
                        groupType: key || "",
                      }));
                    }}
                  />

                  <div className="md:col-span-2">
                    <Textarea
                      size="sm"
                      label="Description"
                      placeholder="Enter description"
                      minRows={3}
                      value={formData.description}
                      onValueChange={(value) =>
                        setFormData((prev) => ({
                          ...prev,
                          description: value,
                        }))
                      }
                    />
                  </div>

                  <div className="rounded-xl border border-slate-200 p-3">
                    <Switch
                      size="sm"
                      isSelected={formData.systemDefault}
                      onValueChange={(value) =>
                        setFormData((prev) => ({
                          ...prev,
                          systemDefault: value,
                        }))
                      }
                    >
                      System Default
                    </Switch>
                    <p className="mt-1 text-xs text-slate-500">
                      Enable only for default accounting groups.
                    </p>
                  </div>

                  <div className="rounded-xl border border-slate-200 p-3">
                    <Switch
                      size="sm"
                      isSelected={formData.active}
                      onValueChange={(value) =>
                        setFormData((prev) => ({ ...prev, active: value }))
                      }
                    >
                      Active
                    </Switch>
                    <p className="mt-1 text-xs text-slate-500">
                      Inactive groups will not be used while creating ledger.
                    </p>
                  </div>
                </div>
              </ModalBody>

              <ModalFooter>
                <Button
                  variant="flat"
                  onPress={() => {
                    resetForm();
                    close();
                  }}
                >
                  Cancel
                </Button>

                <Button
                  className="bg-emerald-700 font-semibold text-white"
                  isLoading={isSaving}
                  onPress={handleSave}
                >
                  {editData ? "Update Group" : "Create Group"}
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
};

export default Group;
