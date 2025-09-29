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
import { ChevronDown, Plus, Search } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import dayjs from "dayjs";
import {
  createNewLeadTask,
  getAllTaskData,
} from "../../toolkit/slices/leadSlice";
import { padZero } from "../../common";
import { parseDate, parseZonedDateTime } from "@internationalized/date";
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
];

const LeadTask = () => {
  const dispatch = useDispatch();
  const { leadId } = useParams();
  const { onClose, onOpen, isOpen, onOpenChange } = useDisclosure();
  const data = useSelector((state) => state.leads.getSingleLeadTask);
  const count = useSelector((state) => state.leads.getSingleLeadTask?.length);
  const allTaskStatusData = useSelector(
    (state) => state.common.allTaskStatusData
  );
  const [filterValue, setFilterValue] = React.useState("");
  const [selectedKeys, setSelectedKeys] = React.useState(new Set([]));
  const [visibleColumns, setVisibleColumns] = React.useState(
    new Set(INITIAL_VISIBLE_COLUMNS)
  );
  const [date, setDate] = useState(dayjs().format("YYYY-MM-DD"));
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
      Array.from(visibleColumns).includes(column.uid)
    );
  }, [visibleColumns]);

  const filteredItems = React.useMemo(() => {
    let filteredUsers = [...(data || [])];

    if (hasSearchFilter) {
      filteredUsers = filteredUsers.filter((item) =>
        Object.values(item)?.some((val) =>
          String(val)?.toLowerCase()?.includes(filterValue?.toLowerCase())
        )
      );
    }

    return filteredUsers;
  }, [data, filterValue]);

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

  const handleFinish = (values) => {
    dispatch(createNewLeadTask(values))
      .then((resp) => {
        if (resp.meta.requestStatus === "fulfilled") {
          addToast({
            title: "Task created successfully.",
            color: "success",
          });
          dispatch(getAllTaskData(leadId));
          onClose();
          reset(defaultValues);
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
  };

  const renderCell = React.useCallback((rowData, columnKey) => {
    const cellValue = rowData[columnKey];
    switch (columnKey) {
      case "statusName":
        return (
          <div className="flex flex-col">
            <Chip
              color={
                rowData?.taskStatus === "Re-Open"
                  ? "danger"
                  : rowData?.status === "Done"
                    ? "success"
                    : "default"
              }
            >
              {rowData?.statusName}
            </Chip>
          </div>
        );
      case "expectedDate":
        return (
          <div className="flex flex-col">
            <p>{dayjs(rowData?.expectedDate).format("DD-MM-YYYY")}</p>
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
                value={parseDate(date)}
                onChange={(e) => {
                  let date = `${e.year}-${padZero(e.month)}-${padZero(e.day)}`;
                  setDate(date);
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
  }, [selectedKeys, items.length, page, pages, hasSearchFilter]);

  return (
    <>
      <h1 className="font-sans text-2xl font-medium mb-1">Lead tasks list</h1>
      <Table
        isHeaderSticky
        aria-label="Example table with custom cells, pagination and sorting"
        bottomContent={bottomContent}
        bottomContentPlacement="outside"
        classNames={{
          wrapper: "max-h-[55vh]",
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
                Create task
              </ModalHeader>
              <ModalBody>
                <form
                  className="w-full flex flex-col gap-4 "
                  onSubmit={handleSubmit(handleFinish)}
                >
                  <div className="w-full grid grid-cols-2 gap-4 max-h-[65vh] overflow-auto px-2 py-1">
                    <Controller
                      name="name"
                      control={control}
                      render={({ field }) => (
                        <Input
                          isRequired
                          errorMessage="please enter the name "
                          label="Name"
                          {...field}
                        />
                      )}
                    />

                    <Controller
                      name="description"
                      control={control}
                      render={({ field }) => (
                        <Input label="Description" isRequired {...field} />
                      )}
                    />
                    <Controller
                      name="expectedDate"
                      control={control}
                      render={({ field }) => (
                        <DatePicker
                          label="Expected date"
                          isRequired
                          hideTimeZone
                          showMonthAndYearPickers
                          value={field?.value ? parseZonedDateTime(`${field?.value}[Asia/kolkata]`) : null}
                          onChange={(value) => {
                            let date = `${value.year}-${String(value.month).padStart(2, "0")}-${String(value.day).padStart(2, "0")}T${String(value.hour).padStart(2, "0")}:${String(value.minute).padStart(2, "0")}`;
                            field.onChange(date);
                          }}
                        />
                      )}
                    />
                    <Controller
                      name="statusId"
                      control={control}
                      render={({ field }) => (
                        <NewSelect
                          isRequired={true}
                          data={allTaskStatusData || []}
                          label="Select category"
                          name="subsubIndustryId"
                          labelKey="name"
                          valueKey="id"
                          value={field.value}
                          onChange={(selectedValue) => {
                            field.onChange(selectedValue);
                          }}
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
    </>
  );
};

export default LeadTask;
