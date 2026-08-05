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
import { useParams } from "react-router-dom";
import {
  createVendorsSubCategory,
  getSingleCategoryDataById,
  updateProcurementUsers,
  updateVendorsSubCategory,
} from "../../toolkit/slices/vendorsSlice";
import { getProcurementAssigneeList } from "../../toolkit/slices/commonSlice";
import NewSelect from "../../components/NewSelect";

const columns = [
  { name: "ID", uid: "subCategoryId" },
  { name: "SUB CATEGORY", uid: "subCategoryName", sortable: true },
  { name: "RESEARCH TAT", uid: "vendorCategoryResearchTat" },
  { name: "COMPLETION TAT", uid: "vendorCompletionTat" },
  { name: "ASSIGNED USERS", uid: "assignedUsers" },
  { name: "ACTIONS", uid: "actions" },
];

function capitalize(s) {
  return s ? s.charAt(0).toUpperCase() + s.slice(1).toLowerCase() : "";
}

const INITIAL_VISIBLE_COLUMNS = [
  "subCategoryName",
  "vendorCategoryResearchTat",
  "vendorCompletionTat",
  "assignedUsers",
  "actions",
];

const formSchema = z.object({
  subCategoryName: z.string().min(1, "please enter the sub category name"),
  vendorCategoryResearchTat: z.string().min(1, "please enter the research TAT"),
  vendorCompletionTat: z.string().min(1, "please enter the completion TAT"),
});

const defaultValues = {
  subCategoryName: "",
  vendorCategoryResearchTat: "",
  vendorCompletionTat: "",
};

const assigneeFormSchema = z.object({
  usersId: z.array(z.string()),
});

const assigneeFormDefaultValues = z.object({
  usersId: z.array(z.string()),
});

const ProcurementSubCategory = () => {
  const dispatch = useDispatch();
  const { userId, categoryId } = useParams();
  const { isOpen, onClose, onOpen, onOpenChange } = useDisclosure();
  const assigneeModal = useDisclosure();
  const count = useSelector(
    (state) => state.vendors.singleCategoryDetail?.subCategories?.length,
  );
  const data =
    useSelector((state) => state.vendors.singleCategoryDetail?.subCategories) ||
    [];
  const assigneeList = useSelector(
    (state) => state.common.procurementAssigneeList,
  );
  const [filterValue, setFilterValue] = useState("");
  const [selectedKeys, setSelectedKeys] = useState(new Set([]));
  const [visibleColumns, setVisibleColumns] = useState(
    new Set(INITIAL_VISIBLE_COLUMNS),
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
    dispatch(getSingleCategoryDataById(categoryId));
    dispatch(getProcurementAssigneeList(userId));
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

  const assigneeForm = useForm({
    resolver: zodResolver(assigneeFormSchema),
    defaultValues: assigneeFormDefaultValues,
  });

  const headerColumns = useMemo(() => {
    if (visibleColumns === "all") return columns;
    return columns.filter((column) =>
      Array.from(visibleColumns).includes(column.uid),
    );
  }, [visibleColumns]);

  const filteredItems = useMemo(() => {
    let filteredData = [...data];
    if (hasSearchFilter) {
      filteredData = filteredData.filter((item) =>
        item?.contactPersonName
          ?.toLowerCase()
          .includes(filterValue.toLowerCase()),
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

  const handleUpdateUserActionPress = (rowData) => {
    reset({
      usersId: data?.assignedUsers?.map((item) => String(item?.userId)),
    });
    setRowItem(rowData);
    assigneeModal.onOpen();
  };

  const renderCell = useCallback((rowData, columnKey) => {
    switch (columnKey) {
      case "assignedUsers":
        return (
          <div className="flex items-start gap-2">
            <span className="font-medium">
              {rowData?.assignedUsers?.map((item) => item?.userName)?.join(",")}
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
                  if (item === "updateUser") {
                    handleUpdateUserActionPress(rowData);
                  }
                }}
              >
                <DropdownItem key="edit">Edit</DropdownItem>
                <DropdownItem key="updateUser">Update user</DropdownItem>
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
    values.vendorCategoryId = categoryId;
    if (rowItem) {
      values.subCategoryId = rowItem?.subCategoryId;
      dispatch(updateVendorsSubCategory(values))
        .then((resp) => {
          if (resp.meta.requestStatus === "fulfilled") {
            addToast({
              title: "Sub category updated successfully",
              color: "success",
            });
            onClose();
            dispatch(getSingleCategoryDataById(categoryId));
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
      dispatch(createVendorsSubCategory(values))
        .then((resp) => {
          if (resp.meta.requestStatus === "fulfilled") {
            addToast({
              title: "Sub category added successfully !.",
              color: "success",
            });
            onClose();
            dispatch(getSingleCategoryDataById(categoryId));
            reset();
          } else {
            addToast({ title: "Something went wrong !.", color: "danger" });
          }
        })
        .catch(() => {
          addToast({ title: "Something went wrong !.", color: "danger" });
        });
    }
  };

  const handleChangeAssignee = useCallback(
    (values) => {
      dispatch(
        updateProcurementUsers({
          data: values?.usersId,
          subCategoryId: rowItem?.subCategoryId,
        }),
      )
        .then((resp) => {
          if (resp.meta.requestStatus === "fulfilled") {
            addToast({
              title: "Assignee updated successfully",
              color: "success",
            });
            assigneeModal.onClose();
            dispatch(getSingleCategoryDataById(categoryId));
            assigneeForm.reset(assigneeFormDefaultValues);
            setRowItem(null);
          } else {
            addToast({ title: "Something went wrong !.", color: "danger" });
          }
        })
        .catch(() =>
          addToast({ title: "Something went wrong !.", color: "danger" }),
        );
    },
    [dispatch, rowItem, assigneeForm],
  );

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
              Add subcategory
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
      <h1 className="font-sans text-lg font-semibold mb-2 shrink-0">
        Procurement sub categories
      </h1>
      <Table
        isHeaderSticky
        aria-label="Users table with custom cells, pagination, and sorting"
        bottomContent={bottomContent}
        bottomContentPlacement="outside"
        classNames={{
          wrapper: "max-h-[68vh] max-w-full",
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
            <TableRow key={item.subCategoryId}>
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
                {rowItem ? "Update subcategory" : "Add subcategory"}
              </ModalHeader>
              <ModalBody>
                <form
                  onSubmit={handleSubmit(onSubmit)}
                  className="flex flex-col gap-4"
                >
                  <div className="grid gap-4 max-h-[60vh] p-2 overflow-auto">
                    <Controller
                      name="subCategoryName"
                      control={control}
                      render={({ field, fieldState: { error } }) => (
                        <Input
                          isRequired
                          label="Sub category name"
                          errorMessage={error?.message}
                          isInvalid={!!error}
                          value={field.value}
                          onChange={(e) => field.onChange(e.target.value)}
                        />
                      )}
                    />
                    <Controller
                      name="vendorCategoryResearchTat"
                      control={control}
                      render={({ field, fieldState: { error } }) => (
                        <Input
                          isRequired
                          label="Research TAT"
                          errorMessage={error?.message}
                          isInvalid={!!error}
                          value={field.value}
                          onChange={(e) => field.onChange(e.target.value)}
                        />
                      )}
                    />
                    <Controller
                      name="vendorCompletionTat"
                      control={control}
                      render={({ field, fieldState: { error } }) => (
                        <Input
                          isRequired
                          label="Completion TAT"
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
      <Modal
        size="3xl"
        isDismissable={false}
        isKeyboardDismissDisabled={true}
        isOpen={assigneeModal.isOpen}
        onOpenChange={assigneeModal.onOpenChange}
        placement="top-center"
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader>Update procurement assignee</ModalHeader>
              <ModalBody>
                <form
                  onSubmit={assigneeForm.handleSubmit(handleChangeAssignee)}
                  className="flex flex-col gap-4"
                >
                  <div className="grid gap-4 max-h-[60vh] p-2 overflow-auto">
                    <Controller
                      name="usersId"
                      control={assigneeForm.control}
                      render={({ field, fieldState: { error } }) => (
                        <NewSelect
                          isRequired
                          selectionMode={"multiple"}
                          label="Assignee"
                          errorMessage={error?.message}
                          isInvalid={!!error}
                          data={assigneeList || []}
                          labelKey="fullName"
                          valueKey="id"
                          name="usersId"
                          value={field.value}
                          onChange={(value) => {
                            field.onChange(value);
                          }}
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

export default ProcurementSubCategory;
