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
import {
  createSolution,
  getAllSolutionCountByType,
  getAllSolutionsByType,
  searchProducts,
  updateSolution,
} from "../../toolkit/slices/settingSlice";
import { ChevronDown, EllipsisVertical, Plus, Search } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import {
  addProductsInOperations,
  updateProductsInOperations,
} from "../../toolkit/slices/operationSlice";

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

const Solutions = () => {
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
              addProductsInOperations({
                productId: productInfo?.id,
                productName: productInfo?.name,
                description: productInfo?.description || "Something",
                createdBy: productInfo?.createdById,
                updatedBy: productInfo?.createdById,
                // date: productInfo?.createdDate,
                active: true,
              }),
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
                : `${rowData?.id}/businessArrangement`
            }
            className="font-medium"
          >
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
                <DropdownItem
                  key="delete"
                  color="danger"
                  onPress={() => handleOpen(rowData)}
                >
                  Delete
                </DropdownItem>
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

  const onSearchChange = React.useCallback((value) => {
    if (value) {
      setFilterValue(value);
      dispatch(searchProducts(value));
    } else {
      setFilterValue("");
      dispatch(getAllSolutionsByType(initialFilteration));
      dispatch(getAllSolutionCountByType(initialFilteration));
    }
  }, []);

  const onClear = React.useCallback(() => {
    setFilterValue("");
    setInitialFilteration((prev) => ({
      ...prev,
      page: 1,
    }));
  }, []);

  const topContent = React.useMemo(() => {
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
            <Dropdown>
              <DropdownTrigger className="hidden sm:flex">
                <Button
                  className="capitalize"
                  endContent={<ChevronDown className="text-small" />}
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
                  endContent={<ChevronDown className="text-small" />}
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
            <Button color="primary" onPress={onOpen} endContent={<Plus />}>
              Add New
            </Button>
          </div>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-default-400 text-small">
            Total {count} solutions
          </span>
          <label className="flex items-center text-default-400 text-small">
            Rows per page:
            <select
              className="bg-transparent outline-hidden text-default-400 text-small"
              onChange={onRowsPerPageChange}
              value={initialFilteration?.size}
            >
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
    initialFilteration,
    visibleColumns,
    onRowsPerPageChange,
    count,
    onSearchChange,
    hasSearchFilter,
  ]);

  const bottomContent = React.useMemo(() => {
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
    <>
      <h1 className="font-sans text-2xl font-medium mb-1">Solutions</h1>
      <Table
        isHeaderSticky
        aria-label="Example table with custom cells, pagination and sorting"
        bottomContent={bottomContent}
        bottomContentPlacement="outside"
        classNames={{
          wrapper: "2xl:max-h-[68vh] md:max-h-[62vh] w-full",
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
                  <div className="w-full grid grid-cols-2 gap-5 max-h-[65vh] overflow-auto p-4">
                    <Input
                      isRequired
                      errorMessage="Please enter product name"
                      label="Product name"
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
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, type: e }))
                      }
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
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, scope: e }))
                      }
                    >
                      {[
                        { label: "GLOBAL", value: "GLOBAL" },
                        { label: "CENTRAL", value: "CENTRAL" },
                        { label: "STATE", value: "STATE" },
                      ].map((info) => (
                        <SelectItem key={info.value}>{info.label}</SelectItem>
                      ))}
                    </Select>

                    <Textarea
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
    </>
  );
};

export default Solutions;
