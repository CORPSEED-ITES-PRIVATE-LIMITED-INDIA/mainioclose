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
import { EllipsisVertical, Plus, Search } from "lucide-react";
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
    (state) => state.vendors.vendorsCategoryList?.length,
  );
  const data = useSelector((state) => state.vendors.vendorsCategoryList);
  const [filterValue, setFilterValue] = useState("");
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

  const filteredItems = useMemo(() => {
    let filteredData = [...(data || [])];
    if (hasSearchFilter) {
      const search = filterValue.toLowerCase();
      filteredData = filteredData.filter((item) =>
        [item?.vendorCategoryName, item?.addedByUserName, item?.date]
          .filter((value) => value !== null && value !== undefined)
          .some((value) => String(value).toLowerCase().includes(search)),
      );
    }
    return filteredData;
  }, [data, filterValue, hasSearchFilter]);

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
          addToast({ title: "Something went wrong !.", color: "danger" }),
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
      <div className="flex flex-col gap-2">
        <div className="flex justify-between gap-2 items-center flex-wrap">
          <Input
            isClearable
            size="sm"
            className="w-full sm:max-w-[280px]"
            classNames={{ inputWrapper: "h-8 min-h-8" }}
            placeholder="Search categories..."
            startContent={<Search className="w-4 h-4 text-default-400" />}
            value={filterValue}
            onClear={() => onClear()}
            onValueChange={onSearchChange}
          />

          <div className="flex gap-1.5 flex-wrap">
            <Button
              size="sm"
              color="primary"
              onPress={onOpen}
              startContent={<Plus className="w-4 h-4" />}
            >
              Add Category
            </Button>
          </div>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-default-400 text-[12.5px]">
            Total {count} categories
          </span>

          <label className="flex items-center gap-1 text-default-400 text-[12.5px]">
            Rows per page:
            <select
              className="bg-transparent outline-hidden text-default-400 text-[12.5px] cursor-pointer"
              onChange={onRowsPerPageChange}
              value={filteration?.size}
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
  }, [filterValue, onRowsPerPageChange, count, onSearchChange, onOpen]);

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
  }, [count, filteration, pages, onPreviousPage, onNextPage]);

  return (
    <div className="flex flex-col gap-2">
      <h1 className="font-sans text-lg font-semibold mb-2 shrink-0">
        Procurement categories
      </h1>
      <Table
        isHeaderSticky
        removeWrapper={false}
        aria-label="Procurement categories table"
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
        <TableHeader columns={columns}>
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
    </div>
  );
};

export default ProcurementCategory;
