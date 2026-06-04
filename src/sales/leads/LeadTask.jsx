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
  Chip,
  DatePicker,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  useDisclosure,
  addToast,
} from "@heroui/react";
import { ChevronDown, EllipsisVertical, Plus, Search } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import dayjs from "dayjs";
import {
  createNewLeadTask,
  deleteTask,
  getAllTaskData,
  updateLeadTask,
} from "../../toolkit/slices/leadSlice";
import { padZero } from "../../common";
import {
  getLocalTimeZone,
  now,
  parseAbsoluteToLocal,
  parseDate,
  toCalendarDateTime,
  today,
} from "@internationalized/date";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import NewSelect from "../../components/NewSelect";
import { getAllTaskStatus } from "../../toolkit/slices/commonSlice";

const formSchema = z.object({
  name: z.string().min(1, "Please enter title"),
  description: z.string().min(1, "Please enter description"),
  expectedDate: z.string().min(1, "Please select date"),
  statusId: z.string().min(1, "Please select status"),
});

const defaultValues = {
  name: "",
  description: "",
  expectedDate: "",
  statusId: "",
};

export const columns = [
  { name: "ID", uid: "id" },
  { name: "NAME", uid: "name", sortable: true },
  { name: "STATUS", uid: "statusName" },
  { name: "EXPECTED DATE", uid: "expectedDate" },
  { name: "DESCRIPTION", uid: "description" },
  { name: "ACTIONS", uid: "actions" },
];

export function capitalize(s) {
  return s ? s.charAt(0).toUpperCase() + s.slice(1).toLowerCase() : "";
}

const INITIAL_VISIBLE_COLUMNS = [
  "id",
  "name",
  "statusName",
  "expectedDate",
  "description",
  "actions",
];

const LeadTask = () => {
  const dispatch = useDispatch();
  const { leadId, userId } = useParams();
  const { onClose, onOpen, isOpen, onOpenChange } = useDisclosure();
  const deleteModal = useDisclosure();
  const data = useSelector((state) => state.leads.getSingleLeadTask);
  const count = useSelector((state) => state.leads.getSingleLeadTask?.length);
  const allTaskStatusData = useSelector(
    (state) => state.common.allTaskStatusData,
  );
  console.log("allTaskStatusData:", allTaskStatusData);
  const [filterValue, setFilterValue] = React.useState("");
  const [selectedKeys, setSelectedKeys] = React.useState(new Set([]));
  const [visibleColumns, setVisibleColumns] = React.useState(
    new Set(INITIAL_VISIBLE_COLUMNS),
  );
  const [date, setDate] = useState(dayjs().format("YYYY-MM-DD"));
  const [rowData, setRowData] = useState(null);
  const [rowsPerPage, setRowsPerPage] = React.useState(50);
  const [sortDescriptor, setSortDescriptor] = React.useState({
    column: "age",
    direction: "ascending",
  });
  const [page, setPage] = React.useState(1);
  const hasSearchFilter = Boolean(filterValue);

  useEffect(() => {
    dispatch(getAllTaskData(leadId));
    dispatch(getAllTaskStatus());
  }, [dispatch]);

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
  }, [data, filterValue, date]);

  const pages = Math.ceil(count / rowsPerPage) || 1;

  const items = React.useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    const end = start + rowsPerPage;

    return filteredItems.slice(start, end);
  }, [page, filteredItems, rowsPerPage]);

  const sortedItems = React.useMemo(() => {
    return [...items].sort((a, b) => {
      const first = a[sortDescriptor.column];
      const second = b[sortDescriptor.column];
      const cmp = first < second ? -1 : first > second ? 1 : 0;

      return sortDescriptor.direction === "descending" ? -cmp : cmp;
    });
  }, [sortDescriptor, items]);

  const { control, handleSubmit, reset } = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: defaultValues,
  });

  const handleDeleteTask = () => {
    dispatch(deleteTask({ id: rowData?.id, userId }))
      .then((resp) => {
        if (resp.meta.requestStatus === "fulfilled") {
          addToast({ title: "Task deleted successfully.", color: "success" });
          dispatch(getAllTaskData(leadId));
          deleteModal.onClose();
          setRowData(null);
        } else {
          addToast({ title: "Something went wrong !.", color: "danger" });
        }
      })
      .catch(() => {
        addToast({ title: "Something went wrong !.", color: "danger" });
      });
  };

  const onEditTask = (rowData) => {
    reset({
      name: rowData?.name,
      description: rowData?.description,
      expectedDate: rowData?.expectedDate,
      statusId: rowData?.taskStatus?.id
        ? rowData?.taskStatus?.id?.toString()
        : "",
    });
    onOpen();
    setRowData(rowData);
  };

  const handleFinish = (values) => {
    if (rowData) {
      dispatch(
        updateLeadTask({
          ...values,
          taskId: rowData?.id,
          leadId,
          assignedById: userId,
          currentUserId: userId,
        }),
      )
        .then((resp) => {
          if (resp.meta.requestStatus === "fulfilled") {
            addToast({
              title: "Task updated successfully.",
              color: "success",
            });
            dispatch(getAllTaskData(leadId));
            onClose();
            reset(defaultValues);
            setRowData(null);
          } else {
            addToast({
              title: "Something went wrong !.",
              color: "danger",
            });
          }
        })
        .catch(() => {
          addToast({
            title: "Something went wrong !.",
            color: "danger",
          });
        });
    } else {
      dispatch(createNewLeadTask({ ...values, leadId, assignedById: userId }))
        .then((resp) => {
          if (resp.meta.requestStatus === "fulfilled") {
            addToast({
              title: "Task created successfully.",
              color: "success",
            });
            dispatch(getAllTaskData(leadId));
            onClose();
            reset(defaultValues);
            setRowData(null);
          } else {
            addToast({
              title: "Something went wrong !.",
              color: "danger",
            });
          }
        })
        .catch(() => {
          addToast({
            title: "Something went wrong !.",
            color: "danger",
          });
        });
    }
  };

  const renderCell = React.useCallback((rowData, columnKey) => {
    const cellValue = rowData[columnKey];
    switch (columnKey) {
      case "name":
        return <span className="font-medium">{rowData?.name}</span>;
      case "statusName":
        return (
          <div className="flex flex-col">
            <Chip
              color={
                rowData?.taskStatus?.name === "Re-Open"
                  ? "danger"
                  : rowData?.taskStatus?.name === "Done"
                    ? "success"
                    : "default"
              }
            >
              {rowData?.taskStatus?.name}
            </Chip>
          </div>
        );
      case "expectedDate":
        return (
          <div className="flex flex-col">
            <p>{dayjs(rowData?.expectedDate).format("DD-MM-YYYY")}</p>
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
              <DropdownMenu selectionMode="single">
                <DropdownItem key="edit" onPress={() => onEditTask(rowData)}>
                  Edit
                </DropdownItem>
                <DropdownItem
                  key="delete"
                  color="danger"
                  onPress={() => {
                    deleteModal.onOpen();
                    setRowData(rowData);
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
    if (page < pages) {
      setPage(page + 1);
    }
  }, [page, pages]);

  const onPreviousPage = React.useCallback(() => {
    if (page > 1) {
      setPage(page - 1);
    }
  }, [page]);

  const onRowsPerPageChange = React.useCallback((e) => {
    setRowsPerPage(Number(e.target.value));
    setPage(1);
  }, []);

  const onSearchChange = React.useCallback((value) => {
    if (value) {
      setFilterValue(value);
      setPage(1);
    } else {
      setFilterValue("");
    }
  }, []);

  const onClear = React.useCallback(() => {
    setFilterValue("");
    setPage(1);
  }, []);

  const topContent = React.useMemo(() => {
    return (
      <div className="flex flex-col gap-4">
        <div className="flex justify-between gap-3 items-end">
          <Input
            isClearable
            className="w-full sm:max-w-[35%]"
            placeholder="Search..."
            startContent={<Search />}
            value={filterValue}
            onClear={() => onClear()}
            onValueChange={onSearchChange}
          />
          <div className="flex gap-3">
            <div>
              <DatePicker
                size="md"
                showMonthAndYearPickers
                value={date ? parseDate(date) : null}
                onChange={(e) => {
                  let selectedDate = `${e.year}-${padZero(e.month)}-${padZero(e.day)}`;
                  setDate(selectedDate);
                  setPage(1);
                }}
              />
            </div>
            <Dropdown>
              <DropdownTrigger>
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
            <Button
              startContent={<Plus />}
              onPress={() => {
                onOpen();
                reset(defaultValues);
                setRowData(null);
              }}
            >
              Add task
            </Button>
          </div>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-default-400 text-small">
            Total {count} lead tasks
          </span>
          <label className="flex items-center text-default-400 text-small">
            Rows per page:
            <select
              className="bg-transparent outline-hidden text-default-400 text-small"
              onChange={onRowsPerPageChange}
              value={rowsPerPage}
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
    visibleColumns,
    onRowsPerPageChange,
    onSearchChange,
    hasSearchFilter,
    date,
    count,
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
          page={page}
          total={pages}
          onChange={setPage}
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
  }, [selectedKeys, page, pages, count]);

  return (
    <>
      <h1 className="font-sans text-2xl font-medium mb-1">Lead tasks list</h1>
      <Table
        isHeaderSticky
        aria-label="Example table with custom cells, pagination and sorting"
        bottomContent={bottomContent}
        bottomContentPlacement="outside"
        classNames={{
          wrapper: "2xl:max-h-[55vh] md:max-h-[50vh] w-full",
          table: "w-full",
        }}
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
              <ModalHeader className="flex flex-col gap-1">
                {rowData ? "Update task" : "Create task"}
              </ModalHeader>
              <ModalBody>
                <form
                  className="w-full flex flex-col gap-4"
                  onSubmit={handleSubmit(handleFinish)}
                >
                  <div className="w-full grid grid-cols-2 gap-4 max-h-[65vh] overflow-auto px-2 py-1">
                    <Controller
                      name="name"
                      control={control}
                      render={({ field, fieldState: { error } }) => (
                        <Input
                          isRequired
                          errorMessage={error?.message}
                          label="Name"
                          {...field}
                        />
                      )}
                    />
                    <Controller
                      name="description"
                      control={control}
                      render={({ field, fieldState: { error } }) => (
                        <Input
                          isRequired
                          errorMessage={error?.message}
                          label="Description"
                          {...field}
                        />
                      )}
                    />
                    <Controller
                      name="expectedDate"
                      control={control}
                      render={({ field, fieldState: { error } }) => (
                        <DatePicker
                          hideTimeZone
                          showMonthAndYearPickers
                          minValue={now(getLocalTimeZone())}
                          value={
                            field?.value
                              ? parseAbsoluteToLocal(field?.value)
                              : now(getLocalTimeZone())
                          }
                          label="Event Date"
                          onChange={(value) => {
                            if (!value) {
                              field.onChange(null);
                              return;
                            }

                            const dateTime = toCalendarDateTime(value);

                            const date = `${dateTime.year}-${padZero(dateTime.month)}-${padZero(
                              dateTime.day,
                            )}T${padZero(dateTime.hour)}:${padZero(
                              dateTime.minute,
                            )}:${padZero(dateTime.second)}+05:30`;

                            field.onChange(date);
                          }}
                        />
                      )}
                    />
                    <Controller
                      name="statusId"
                      control={control}
                      render={({ field, fieldState: { error } }) => (
                        <NewSelect
                          isRequired
                          data={allTaskStatusData || []}
                          label="Select category"
                          name="statusId"
                          labelKey="name"
                          valueKey="id"
                          value={field.value}
                          onChange={(selectedValue) => {
                            field.onChange(selectedValue);
                          }}
                          errorMessage={error?.message}
                        />
                      )}
                    />
                  </div>
                  <ModalFooter className="w-full flex justify-end">
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
                <Button color="primary" onPress={handleDeleteTask}>
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

export default LeadTask;
