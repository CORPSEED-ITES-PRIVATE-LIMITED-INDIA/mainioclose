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
  addToast,
  ModalFooter,
  Select,
  SelectItem,
} from "@heroui/react";
import { useDispatch, useSelector } from "react-redux";
import { ChevronDown, EllipsisVertical, Plus, Search } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import {
  createProductSubCategory,
  deleteProductSubCategory,
  editProductSubCategory,
  getAllProductSubCategoryListByCategoryId,
  toggleForRoundOffValue,
} from "../../toolkit/slices/productSlice";
import { allowOnlyIntegerOrFloat, allowOnlyNumbers } from "../../common";

export const columns = [
  { name: "ID", uid: "id", sortable: true },
  { name: "NAME", uid: "name" },
  { name: "PRODUCT FEE", uid: "productFees" },
  { name: "PRODUCT GST %", uid: "productGst" },
  { name: "HSN CODE", uid: "productCode" },
  { name: "ROUND OFF", uid: "roundoff" },
  { name: "ACTIONS", uid: "actions" },
];

export function capitalize(s) {
  return s ? s.charAt(0).toUpperCase() + s.slice(1).toLowerCase() : "";
}

const INITIAL_VISIBLE_COLUMNS = [
  "id",
  "name",
  "productFees",
  "productGst",
  "productCode",
  "roundoff",
  "actions",
];

const ProductSubCategory = () => {
  const dispatch = useDispatch();
  const { categoryId, userId } = useParams();
  const data = useSelector((state) => state.product.productSubcategoryList);
  const count = useSelector(
    (state) => state.product.productSubcategoryList?.length,
  );
  const { isOpen, onClose, onOpen, onOpenChange } = useDisclosure();
  const deleteModal = useDisclosure();
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
    code: "",
    feePerUnit: "",
    gstPercentage: "",
    unit: "",
    roundOff: false,
  });
  const [rowItem, setRowItem] = useState(null);

  const [initialFilteration, setInitialFilteration] = useState({
    page: 1,
    size: 50,
  });

  const hasSearchFilter = Boolean(filterValue);

  useEffect(() => {
    dispatch(
      getAllProductSubCategoryListByCategoryId({
        productRoleId: categoryId,
        userId,
      }),
    );
  }, [dispatch, initialFilteration]);

  const headerColumns = React.useMemo(() => {
    if (visibleColumns === "all") return columns;

    return columns.filter((column) =>
      Array.from(visibleColumns).includes(column.uid),
    );
  }, [visibleColumns]);

  const filteredItems = React.useMemo(() => {
    let filteredUsers = [...(data || [])];

    if (hasSearchFilter) {
      filteredUsers = filteredUsers.filter((item) =>
        Object.values(item)?.some((val) =>
          String(val)?.toLowerCase()?.includes(filterValue?.toLowerCase()),
        ),
      );
    }
    return filteredUsers;
  }, [data, filterValue]);

  const pages = Math.ceil(count / initialFilteration?.size) || 1;

  const sortedItems = React.useMemo(() => {
    return [...filteredItems].sort((a, b) => {
      const first = a[sortDescriptor.column];
      const second = b[sortDescriptor.column];
      const cmp = first < second ? -1 : first > second ? 1 : 0;

      return sortDescriptor.direction === "descending" ? -cmp : cmp;
    });
  }, [sortDescriptor, filteredItems]);

  const handleDeleteItem = () => {
    dispatch(
      deleteProductSubCategory({
        productRoleId: categoryId,
        ruleId: rowItem?.id,
        userId,
      }),
    )
      .then((resp) => {
        if (resp.meta.requestStatus === "fulfilled") {
          deleteModal.onClose();
          addToast({
            title: "SUCCESS",
            description: "Sub category deleted successfully",
            color: "success",
          });
          dispatch(
            getAllProductSubCategoryListByCategoryId({
              productRoleId: categoryId,
              userId,
            }),
          );
          setRowItem(null);
        } else {
          addToast({ title: "Something went wrong !.", color: "danger" });
        }
      })
      .catch(() =>
        addToast({ title: "Something went wrong !.", color: "danger" }),
      );
  };

  const handleEditPress = (row) => {
    setRowItem(row);
    setFormData({
      name: row?.name,
      code: row?.code,
      feePerUnit: row?.feePerUnit,
      gstPercentage: row?.gstPercentage,
      unit: row?.unit,
      roundOff: row?.roundOff,
    });
    onOpen();
  };

  const handleFinish = (values) => {
    if (rowItem) {
      dispatch(
        editProductSubCategory({
          data: formData,
          productRoleId: categoryId,
          ruleId: rowItem?.id,
          userId,
        }),
      )
        .then((resp) => {
          if (resp.meta.requestStatus === "fulfilled") {
            addToast({
              title: "SUCCESS",
              description: "Sub category updated successfully",
              color: "success",
            });
            onClose();
            setFormData({
              name: "",
              code: "",
              feePerUnit: "",
              gstPercentage: "",
              unit: "",
              roundOff: false,
            });
            setRowItem(null);
            dispatch(
              getAllProductSubCategoryListByCategoryId({
                productRoleId: categoryId,
                userId,
              }),
            );
          } else {
            addToast({ title: "Something went wrong !.", color: "danger" });
          }
        })
        .catch(() =>
          addToast({ title: "Something went wrong !.", color: "danger" }),
        );
    } else {
      dispatch(
        createProductSubCategory({
          data: formData,
          productRoleId: categoryId,
          userId,
        }),
      )
        .then((resp) => {
          if (resp.meta.requestStatus === "fulfilled") {
            addToast({
              title: "SUCCESS",
              description: "Sub category created successfully",
              color: "success",
            });
            onClose();
            setFormData({
              name: "",
              code: "",
              feePerUnit: "",
              gstPercentage: "",
              unit: "",
              roundOff: false,
            });
            setRowItem(null);
            dispatch(
              getAllProductSubCategoryListByCategoryId({
                productRoleId: categoryId,
                userId,
              }),
            );
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
        return <p> {rowData?.name}</p>;
      case "productFees":
        return <p> {rowData?.feePerUnit}</p>;
      case "productGst":
        return <p> {rowData?.gstPercentage}</p>;
      case "productCode":
        return <p> {rowData?.code}</p>;
      case "roundoff":
        return <p> {rowData?.roundValue ? "True" : "False"}</p>;
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
                <DropdownItem
                  key="edit"
                  onPress={() => handleEditPress(rowData)}
                >
                  Edit
                </DropdownItem>
                <DropdownItem
                  key="delete"
                  color="danger"
                  onPress={() => {
                    deleteModal.onOpen();
                    setRowItem(rowData);
                  }}
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
      setInitialFilteration((prev) => ({
        ...prev,
        page: 1,
      }));
    } else {
      setFilterValue("");
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
            Total {count} product sub category
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
      <h1 className="font-sans text-2xl font-medium mb-1">
        Product sub category
      </h1>
      <Table
        isHeaderSticky
        aria-label="Example table with custom cells, pagination and sorting"
        bottomContent={bottomContent}
        bottomContentPlacement="outside"
        classNames={{
          wrapper: "max-h-[68vh]",
        }}
        selectedKeys={selectedKeys}
        selectionMode="multiple"
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
                {rowItem ? "Update sub category" : "Create sub category"}
              </ModalHeader>
              <ModalBody>
                <Form
                  onSubmit={(e) => {
                    e.preventDefault();
                    let data = Object.fromEntries(
                      new FormData(e.currentTarget),
                    );
                    handleFinish(data);
                  }}
                >
                  <div className="w-full grid grid-cols-2 gap-2 max-h-[65vh] overflow-auto">
                    <Input
                      isRequired
                      errorMessage="Please enter product name"
                      label="Sub category name"
                      name="name"
                      type="text"
                      value={formData?.name}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          name: e.target.value,
                        }))
                      }
                    />
                    <Input
                      isRequired
                      errorMessage="Please enter unit name"
                      label="Unit name (e.g, kg,Tonne etc)"
                      name="unit"
                      type="text"
                      value={formData?.unit}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          unit: e.target.value,
                        }))
                      }
                    />
                    <Input
                      isRequired
                      errorMessage="Please enter fees per unit"
                      label="Product fee ₹/unit"
                      name="feePerUnit"
                      value={formData?.feePerUnit}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          feePerUnit: allowOnlyIntegerOrFloat(e.target.value),
                        }))
                      }
                    />
                    <Input
                      isRequired
                      errorMessage="Please enter gst"
                      label="Product gst %"
                      name="gstPercentage"
                      type="text"
                      value={formData?.gstPercentage}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          gstPercentage: allowOnlyNumbers(e.target.value),
                        }))
                      }
                    />
                    <Input
                      isRequired
                      errorMessage="Please enter HSN code"
                      label="HSN code"
                      name="code"
                      type="text"
                      value={formData?.code}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          code: e.target.value,
                        }))
                      }
                    />
                    <Select
                      label="Roundoff on product fee"
                      name="roundOff"
                      isRequired
                      selectedKeys={[String(formData?.roundOff)]}
                      onSelectionChange={(keys) => {
                        const value = Array.from(keys)[0];
                        setFormData((prev) => ({
                          ...prev,
                          roundOff: value === "true",
                        }));
                      }}
                    >
                      {[
                        { label: "True", value: true },
                        { label: "False", value: false },
                      ].map((item) => (
                        <SelectItem key={item.value} value={item.value}>
                          {item.label}
                        </SelectItem>
                      ))}
                    </Select>
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
                <Button color="primary" onPress={handleDeleteItem}>
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

export default ProductSubCategory;
