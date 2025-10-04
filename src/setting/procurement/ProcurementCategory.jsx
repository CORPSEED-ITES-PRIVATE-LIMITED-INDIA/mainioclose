import {
  Button,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Pagination,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
  useDisclosure,
  Input,
  addToast,
} from "@heroui/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import * as z from "zod";
import { useDispatch, useSelector } from "react-redux";
import { ChevronDown, EllipsisVertical, Plus, Search } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import {
  allVendorsCategory,
  createVendorsCategory,
  updateVendorsCategory,
} from "../../toolkit/slices/vendorsSlice";

const columns = [
  { name: "ID", uid: "id" },
  { name: "CATEGORY", uid: "category", sortable: true },
  { name: "ADDED BY", uid: "addedByUserName" },
  { name: "DATE", uid: "date" },
  { name: "ACTIONS", uid: "actions" },
];

function capitalize(s) {
  return s ? s.charAt(0).toUpperCase() + s.slice(1).toLowerCase() : "";
}

const INITIAL_VISIBLE_COLUMNS = [
  "category",
  "addedByUserName",
  "date",
  "actions",
];

const formSchema = z.object({
  categoryName: z.string().min(1, "please enter the category name"),
});

const defaultValues = {
  categoryName: "",
};

const ProcurementCategory = () => {
  const dispatch = useDispatch();
  const { userId } = useParams();
  const { isOpen, onClose, onOpen, onOpenChange } = useDisclosure();
  const count = useSelector(
    (state) => state.vendors.vendorsCategoryList?.length
  );
  const data = useSelector((state) => state.vendors.vendorsCategoryList);
  const [filterValue, setFilterValue] = useState("");
  const [selectedKeys, setSelectedKeys] = useState(new Set([]));
  const [visibleColumns, setVisibleColumns] = useState(
    new Set(INITIAL_VISIBLE_COLUMNS)
  );
  const [sortDescriptor, setSortDescriptor] = useState({
    column: "age",
    direction: "ascending",
  });
  const [filteration, setFilteration] = useState({
    page: 1,
    size: 50,
  });
  const [rowItem, setRowItem] = useState(null);
  const hasSearchFilter = Boolean(filterValue);

  useEffect(() => {
    dispatch(allVendorsCategory());
  }, [dispatch]);

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: defaultValues,
  });

  const headerColumns = useMemo(() => {
    if (visibleColumns === "all") return columns;
    return columns.filter((column) =>
      Array.from(visibleColumns).includes(column.uid)
    );
  }, [visibleColumns]);

  const filteredItems = useMemo(() => {
    let filteredData = [...data];
    if (hasSearchFilter) {
      filteredData = filteredData.filter((item) =>
        item?.contactPersonName
          ?.toLowerCase()
          .includes(filterValue.toLowerCase())
      );
    }
    return filteredData;
  }, [data, filterValue]);

  const pages = Math.ceil(count / filteration?.size) || 1;

  const items = useMemo(() => {
    const start = (filteration?.page - 1) * filteration?.size;
    const end = start + filteration?.size;
    return filteredItems.slice(start, end);
  }, [filteration, filteredItems]);

  const sortedItems = useMemo(() => {
    return [...items].sort((a, b) => {
      const first = a[sortDescriptor.column];
      const second = b[sortDescriptor.column];
      const cmp = first < second ? -1 : first > second ? 1 : 0;
      return sortDescriptor.direction === "descending" ? -cmp : cmp;
    });
  }, [sortDescriptor, items]);

  const handleActionsPress = (rowData) => {
    reset({
      categoryName: rowData?.vendorCategoryName,
    });
    setRowItem(rowData);
    onOpen();
  };

  const renderCell = useCallback((rowData, columnKey) => {
    switch (columnKey) {
      case "category":
        return (
          <div className="flex items-start gap-2">
            <Link className="font-medium" to={`${rowData?.id}/subcategory`}>
              {rowData?.vendorCategoryName}
            </Link>
          </div>
        );
      case "addedByUserName":
        return (
          <div className="flex flex-col">
            <span className="font-normal">{rowData?.addedByUserName}</span>
          </div>
        );
      case "date":
        return (
          <div className="flex flex-col">
            <span className="text-sm text-gray-400">
              {rowData?.date || "---"}
            </span>
          </div>
        );
      case "actions":
        return (
          <div className="relative flex justify-center items-center gap-2">
            <Dropdown>
              <DropdownTrigger>
                <Button isIconOnly size="sm" variant="light">
                  <EllipsisVertical />
                </Button>
              </DropdownTrigger>
              <DropdownMenu
                selectionMode="single"
                onSelectionChange={(e) => {
                  let item = Array.from(e)[0];
                  if (item === "edit") {
                    handleActionsPress(rowData);
                  }
                }}
              >
                <DropdownItem key="edit">Edit</DropdownItem>
              </DropdownMenu>
            </Dropdown>
          </div>
        );
      default:
        return rowData[columnKey] || "-";
    }
  }, []);

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
    if (value) {
      setFilterValue(value);
      setFilteration((prev) => ({ ...prev, page: 1 }));
    } else {
      setFilterValue("");
    }
  }, []);

  const onClear = useCallback(() => {
    setFilterValue("");
    setFilteration((prev) => ({ ...prev, page: 1 }));
  }, []);

  const onSubmit = (values) => {
    values.userId = userId;
    if (rowItem) {
      values.categoryId = rowItem?.id;
      dispatch(updateVendorsCategory(values))
        .then((resp) => {
          if (resp.meta.requestStatus === "fulfilled") {
            addToast({
              title: "Category updated successfully",
              color: "success",
            });
            onClose();
            dispatch(allVendorsCategory());
            setRowItem(null);
            reset(defaultValues);
          } else {
            addToast({ title: "Something went wrong !.", color: "danger" });
          }
        })
        .catch(() =>
          addToast({ title: "Something went wrong !.", color: "danger" })
        );
    } else {
      dispatch(createVendorsCategory(values))
        .then((resp) => {
          if (resp.meta.requestStatus === "fulfilled") {
            addToast({
              title: "Category added successfully !.",
              color: "success",
            });
            onClose();
            dispatch(allVendorsCategory());
            reset();
          } else {
            addToast({ title: "Something went wrong !.", color: "danger" });
          }
        })
        .catch(() => {
          addToast({ message: "Something went wrong !.", color: "danger" });
        });
    }
  };

  const topContent = useMemo(() => {
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
                <Button endContent={<ChevronDown />} variant="flat">
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
              Add vendors
            </Button>
          </div>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-default-400 text-small">
            Total {count} vendors request
          </span>
          <label className="flex items-center text-default-400 text-small">
            Rows per page:
            <select
              className="bg-transparent outline-none text-default-400 text-small"
              onChange={onRowsPerPageChange}
              value={filteration?.size}
            >
              <option value="5">5</option>
              <option value="15">15</option>
              <option value="25">25</option>
              <option value="50">50</option>
            </select>
          </label>
        </div>
      </div>
    );
  }, [filterValue, visibleColumns, onRowsPerPageChange, count, onSearchChange]);

  const bottomContent = useMemo(() => {
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
          page={filteration?.page}
          total={pages}
          onChange={(e) => {
            setFilteration((prev) => ({ ...prev, page: e }));
          }}
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
  }, [selectedKeys, count, filteration, pages, onPreviousPage, onNextPage]);

  return (
    <>
      <h1 className="font-sans text-2xl font-medium mb-1">
        Procurement categories
      </h1>
      <Table
        isHeaderSticky
        aria-label="Users table with custom cells, pagination, and sorting"
        bottomContent={bottomContent}
        bottomContentPlacement="outside"
        classNames={{
          wrapper: "max-h-[50vh] max-w-full",
        }}
        selectedKeys={selectedKeys}
        selectionMode="multiple"
        sortDescriptor={sortDescriptor}
        topContent={topContent}
        topContentPlacement="outside"
        onSelectionChange={(keys) => {
          setSelectedKeys(keys);
        }}
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
            <TableRow key={item.id || item.companyId}>
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
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        placement="top-center"
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader>
                {rowItem ? "Edit category" : "Add category"}
              </ModalHeader>
              <ModalBody>
                <form
                  onSubmit={handleSubmit(onSubmit)}
                  className="flex flex-col gap-4"
                >
                  <div className="grid gap-4 max-h-[60vh] p-2 overflow-auto">
                    <Controller
                      name="categoryName"
                      control={control}
                      render={({ field, fieldState: { error } }) => (
                        <Input
                          isRequired
                          label="Category name"
                          errorMessage={error?.message}
                          isInvalid={!!error}
                          value={field.value}
                          onChange={(e) => field.onChange(e.target.value)}
                        />
                      )}
                    />
                  </div>

                  <ModalFooter className="flex justify-end">
                    <Button onPress={onClose}>Cancel</Button>
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

export default ProcurementCategory;
