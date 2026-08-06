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
} from "@heroui/react";
import { useDispatch, useSelector } from "react-redux";
// import {
//   getAllSolutionCountByType,
//   getAllSolutionsByType,
//   searchSolutionsByName,
// } from "../../toolkit/slices/settingSlice";
import { EllipsisVertical, Search } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import {
  getAllSolutionCountByType,
  getAllSolutionsByType,
  searchSolutionsByName,
} from "../../toolkit/slices/settingSlice";
import NewSelect from "../../components/NewSelect";

export const columns = [
  { name: "ID", uid: "id", sortable: true },
  { name: "NAME", uid: "name" },
  { name: "TYPE", uid: "type" },
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

const INITIAL_VISIBLE_COLUMNS = ["id", "name", "type", "actions"];

const ProcurementSolutions = () => {
  const dispatch = useDispatch();
  const { userId } = useParams();
  const data = useSelector((state) => state.setting.solutionsList);
  const count = useSelector((state) => state.setting.solutionsCount);
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const modal = useDisclosure();
  const [filterValue, setFilterValue] = React.useState("");
  const [selectedKeys, setSelectedKeys] = React.useState(new Set([]));
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

  const renderCell = React.useCallback((rowData, columnKey) => {
    const cellValue = rowData[columnKey];

    switch (columnKey) {
      case "name":
        return (
          <Link to={`${rowData?.id}/detail/overview`} className="font-medium">
            {rowData?.name}
          </Link>
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
            <div className="w-[160px]">
              <NewSelect
                size="sm"
                isSearchable={false}
                data={statusOptions}
                labelKey="name"
                valueKey="uid"
                label="Type"
                value={initialFilteration?.type}
                onChange={(value) => {
                  if (value) {
                    setInitialFilteration((prev) => ({
                      ...prev,
                      type: value,
                    }));
                  }
                }}
              />
            </div>

            <div className="w-[160px]">
              <NewSelect
                size="sm"
                isSearchable={false}
                data={columns}
                selectionMode="multiple"
                labelKey="name"
                valueKey="uid"
                label="Columns"
                placeholder="Columns"
                value={Array.from(visibleColumns)}
                onChange={(values) => {
                  if (values.length > 0) {
                    setVisibleColumns(new Set(values));
                  }
                }}
              />
            </div>
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
  }, [selectedKeys, initialFilteration?.page, pages, hasSearchFilter, count]);

  return (
    <div className="flex flex-col gap-2">
      <h1 className="font-sans text-lg font-semibold mb-2 shrink-0">
        Solutions
      </h1>
      <Table
        isHeaderSticky
        removeWrapper={false}
        aria-label="Example table with custom cells, pagination and sorting"
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

export default ProcurementSolutions;
