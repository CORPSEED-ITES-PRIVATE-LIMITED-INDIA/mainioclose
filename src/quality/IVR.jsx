import React, { useCallback, useEffect, useState } from "react";
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
  addToast,
  useDisclosure,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  TimeInput,
} from "@heroui/react";
import {
  ChevronDown,
  Clock,
  Plus,
  Search,
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import * as z from "zod";
import { createIvr, getAllIvrWithPage, getTotalIvrCount } from "../toolkit/slices/commonSlice";
import dayjs from "dayjs";

export const columns = [
  { name: "ID", uid: "id" },
  { name: "AGENT NAME", uid: "agentName", sortable: true },
  { name: "CALLER NAME", uid: "callerName" },
  { name: "START TIME", uid: "startTime" },
  { name: "DURATION", uid: "duration" },
  { name: "RECORDINGS", uid: "recording" },
];

export function capitalize(s) {
  return s ? s.charAt(0).toUpperCase() + s.slice(1).toLowerCase() : "";
}

const INITIAL_VISIBLE_COLUMNS = [
  "id",
  "agentName",
  "callerName",
  "startTime",
  "duration",
  "recording",
];

const formSchema = z.object({
  agentName: z.string().min(1, "Please enter agent name."),
  aggentNumber: z.string().min(1, "Please enter agent number."),
  callerNumber: z.string().min(1, "Please enter caller number"),
  startTime: z.string().min(1, "Please enter start time"),
  endTime: z.string().min(1, "Please enter end time"),
  duration: z.string().min(1, "Please enter duration"),
  callRecordingUrl: z.string().min(1, "Please enter call recording url"),
});

const defaultValues = {
  agentName: "",
  aggentNumber: "",
  callerNumber: "",
  startTime: "",
  endTime: "",
  duration: "",
  callRecordingUrl: "",
};

const IVR = () => {
  const dispatch = useDispatch();
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const data = useSelector((state) => state.common.allIvr);
  const count = useSelector((state) => state.common.totalIvrCount);
  const [filterValue, setFilterValue] = React.useState("");
  const [selectedKeys, setSelectedKeys] = React.useState(new Set([]));
  const [visibleColumns, setVisibleColumns] = React.useState(
    new Set(INITIAL_VISIBLE_COLUMNS)
  );
  const [editData, setEditData] = useState(null);
  const [rowsPerPage, setRowsPerPage] = React.useState(50);
  const [sortDescriptor, setSortDescriptor] = React.useState({
    column: "age",
    direction: "ascending",
  });
  const [page, setPage] = React.useState(1);
  const hasSearchFilter = Boolean(filterValue);

  useEffect(() => {
    dispatch(getAllIvrWithPage({ page: page, size: rowsPerPage }));
  }, [dispatch, page, rowsPerPage]);

  useEffect(()=>{
    dispatch(getTotalIvrCount())
  },[dispatch])

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
          String(val)?.toLowerCase().includes(filterValue.toLowerCase())
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

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: zodResolver(formSchema),
    defaultValues,
  });

  const onSubmit = useCallback(
    (values) => {
      dispatch(createIvr(values))
        .then((resp) => {
          if (resp.meta.requestStatus === "fulfilled") {
            addToast({
              title: "IVR created successfully !.",
              color: "success",
            });
            dispatch(getAllIvrWithPage({ page: page, size: rowsPerPage }));
            onOpenChange(false);
            reset(defaultValues);
          } else {
            addToast({ title: "Something went wrong !.", color: "danger" });
          }
        })
        .catch(() =>
          addToast({ title: "Something went wrong !.", color: "danger" })
        );
    },
    [dispatch, editData]
  );

  const renderCell = React.useCallback((rowData, columnKey) => {
    const cellValue = rowData[columnKey];
    switch (columnKey) {
      case "agentName":
        return (
          <p className="text-sm font-medium capitalize">{rowData?.agentName}</p>
        );
      case "callerName":
        return <p className="text-sm capitalize">{rowData?.callerName}</p>;
      case "startTime":
        return (
          <p className="text-sm capitalize">
            {dayjs(rowData?.startTime).format("DD-MM-YYYY ,  hh:mm a")}
          </p>
        );
      case "duration":
        return <p className="text-sm">{rowData?.duration} minutes</p>;
      case "recording":
        return (
          <audio controls className="audio-player">
            <source src={rowData?.recordingUrls} type="audio/mpeg" />
          </audio>
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
            className="w-full sm:max-w-[44%]"
            placeholder="Search by name..."
            startContent={<Search />}
            value={filterValue}
            onClear={() => onClear()}
            onValueChange={onSearchChange}
          />
          <div className="flex gap-3">
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
              endContent={<Plus />}
              color="primary"
              onPress={() => {
                setEditData(null);
                reset(defaultValues);
                onOpen();
              }}
            >
              Add
            </Button>
          </div>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-default-400 text-small">Total {count} IVR</span>
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
      <h1 className="font-sans text-2xl font-medium mb-1">IVR list</h1>
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
              <ModalHeader>Add IVR details</ModalHeader>
              <ModalBody>
                <form onSubmit={handleSubmit(onSubmit)}>
                  <div className="grid grid-cols-2 gap-4 max-h-[60vh] overflow-auto">
                    <Controller
                      name="agentName"
                      control={control}
                      render={({ field }) => (
                        <Input
                          isRequired
                          errorMessage="please enter agent name"
                          label="Agent name"
                          name="agentName"
                          value={field.value}
                          onChange={(e) => {
                            field.onChange(e.target.value);
                          }}
                        />
                      )}
                    />
                    <Controller
                      name="aggentNumber"
                      control={control}
                      render={({ field }) => (
                        <Input
                          isRequired
                          errorMessage="please enter agent number"
                          label="Agent number"
                          name="aggentNumber"
                          value={field.value}
                          onChange={(e) => {
                            field.onChange(e.target.value);
                          }}
                        />
                      )}
                    />
                    <Controller
                      name="callerNumber"
                      control={control}
                      render={({ field }) => (
                        <Input
                          isRequired
                          errorMessage="please enter caller number"
                          label="Caller number"
                          name="callerNumber"
                          value={field.value}
                          onChange={(e) => {
                            field.onChange(e.target.value);
                          }}
                        />
                      )}
                    />
                    <Controller
                      name="startTime"
                      control={control}
                      render={({ field }) => (
                        <TimeInput
                          isRequired
                          errorMessage="please enter start time"
                          {...field}
                          label="Start time"
                          granularity="second"
                          startContent={<Clock />}
                          onChange={(val) => field.onChange(val)}
                        />
                      )}
                    />
                    <Controller
                      name="endTime"
                      control={control}
                      render={({ field }) => (
                        <TimeInput
                          isRequired
                          errorMessage="please enter end time"
                          {...field}
                          label="End time"
                          granularity="second"
                          startContent={<Clock />}
                          onChange={(val) => field.onChange(val)}
                        />
                      )}
                    />
                    <Controller
                      name="duration"
                      control={control}
                      render={({ field }) => (
                        <Input
                          isRequired
                          errorMessage="please enter call duration"
                          label="Call duration"
                          description="Please enter your duration in minutes"
                          name="duration"
                          value={field.value}
                          onChange={(e) => {
                            field.onChange(e.target.value);
                          }}
                        />
                      )}
                    />
                    <Controller
                      name="callRecordingUrl"
                      control={control}
                      render={({ field }) => (
                        <Input
                          isRequired
                          errorMessage="please enter call recording url"
                          label="Call recording url"
                          type="url"
                          name="callRecordingUrl"
                          value={field.value}
                          onChange={(e) => {
                            field.onChange(e.target.value);
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

export default IVR;
