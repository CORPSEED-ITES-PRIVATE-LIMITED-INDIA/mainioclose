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
  addToast,
  ModalFooter,
  Chip,
} from "@heroui/react";
import { useDispatch, useSelector } from "react-redux";
import {
  addStatusInDepartment,
  createDepartment,
  createDesiginationByDepartmentId,
  getAllDepartment,
  getAllDesiginations,
  getAllStatusData,
} from "../../toolkit/slices/settingSlice";
import {
  BriefcaseBusiness,
  Calculator,
  ChevronDown,
  EllipsisVertical,
  Plus,
  Search,
  ShoppingCart,
  SlidersHorizontal,
  UsersRound,
} from "lucide-react";
import * as z from "zod";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import NewSelect from "../../components/NewSelect";
import {
  createAuthDepartment,
  createDesiginationByDepartment,
} from "../../toolkit/slices/authSlice";
import {
  createDepartmentInOPerations,
  mapDesignationWithDepartmentInOperations,
} from "../../toolkit/slices/operationSlice";
import { useParams } from "react-router-dom";

const formSchema = z.object({
  name: z.string().min(1, "please enter the name."),
});

const defaultValues = {
  name: "",
};

const designationFormSchema = z.object({
  designation: z.array(z.string()).min(1, "please select the designations."),
});

const designationFormDefaultValues = {
  designation: [],
};

const statusFormSchema = z.object({
  statusId: z.array(z.string()).min(1, "please select the designations."),
});

const statusFormDefaultValues = {
  statusId: [],
};

export const columns = [
  { name: "#", uid: "id" },
  { name: "DEPARTMENT", uid: "name" },
  { name: "DESIGNATIONS", uid: "designations" },
  { name: "STATUS", uid: "departmentStatus" },
  { name: "ACTIONS", uid: "actions" },
];

const INITIAL_VISIBLE_COLUMNS = [
  "id",
  "name",
  "designations",
  "departmentStatus",
  "actions",
];

const getDepartmentVisual = (name = "") => {
  const key = String(name).toLowerCase();

  if (key.includes("sales")) {
    return {
      icon: BriefcaseBusiness,
      box: "bg-gray-100 text-gray-900 border border-gray-300 dark:bg-zinc-900 dark:text-gray-100 dark:border-gray-800",
    };
  }

  if (key.includes("quality")) {
    return {
      icon: UsersRound,
      box: "bg-gray-100 text-gray-900 border border-gray-300 dark:bg-zinc-900 dark:text-gray-100 dark:border-gray-800",
    };
  }

  if (key.includes("account")) {
    return {
      icon: Calculator,
      box: "bg-gray-100 text-gray-900 border border-gray-300 dark:bg-zinc-900 dark:text-gray-100 dark:border-gray-800",
    };
  }

  if (key.includes("procurement")) {
    return {
      icon: ShoppingCart,
      box: "bg-gray-100 text-gray-900 border border-gray-300 dark:bg-zinc-900 dark:text-gray-100 dark:border-gray-800",
    };
  }

  return {
    icon: BriefcaseBusiness,
    box: "bg-gray-100 text-gray-900 border border-gray-300 dark:bg-zinc-900 dark:text-gray-100 dark:border-gray-800",
  };
};

const getStatusChipClass = (name = "") => {
  return "bg-gray-100 text-gray-900 border-gray-300 dark:bg-zinc-900 dark:text-gray-100 dark:border-gray-800";
};

const getStatusDotClass = (name = "") => {
  return "bg-gray-500 dark:bg-gray-400";
};

const Department = () => {
  const { userId } = useParams();
  const dispatch = useDispatch();
  const data = useSelector((state) => state.setting.departmentList);
  const count = useSelector((state) => state.setting.departmentList?.length);
  const designationList = useSelector((state) => state.setting.designationList);
  const statusList = useSelector((state) => state.setting.statusList);
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const designationModal = useDisclosure();
  const statusModal = useDisclosure();
  const [filterValue, setFilterValue] = React.useState("");
  const [selectedKeys, setSelectedKeys] = React.useState(new Set([]));
  const [visibleColumns, setVisibleColumns] = React.useState(
    new Set(INITIAL_VISIBLE_COLUMNS),
  );
  const [sortDescriptor, setSortDescriptor] = React.useState({
    column: "name",
    direction: "ascending",
  });

  const [item, setItem] = useState(null);
  const [initialFilteration, setInitialFilteration] = useState({
    page: 1,
    size: 50,
  });

  const hasSearchFilter = Boolean(filterValue);

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
    reset,
  } = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: defaultValues,
  });

  const designationForm = useForm({
    resolver: zodResolver(designationFormSchema),
    defaultValues: designationFormDefaultValues,
  });

  const statusForm = useForm({
    resolver: zodResolver(statusFormSchema),
    defaultValues: statusFormDefaultValues,
  });

  useEffect(() => {
    dispatch(getAllDepartment());
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
  }, [data, filterValue]);

  const pages = Math.ceil(count / initialFilteration?.size) || 1;

  const items = React.useMemo(() => {
    const start = (initialFilteration?.page - 1) * initialFilteration?.size;
    const end = start + initialFilteration?.size;
    return filteredItems.slice(start, end);
  }, [initialFilteration?.page, filteredItems, initialFilteration?.size]);

  const sortedItems = React.useMemo(() => {
    return [...items];
  }, [sortDescriptor, items]);

  const handleAddStatus = (values) => {
    dispatch(
      addStatusInDepartment({
        departmentId: item?.id,
        ...values,
      }),
    )
      .then((response) => {
        if (response.meta.requestStatus === "fulfilled") {
          addToast({
            title: "Status added successfully in department !.",
            color: "success",
          });
          dispatch(getAllDepartment());
          setItem(null);
          statusForm.reset(statusFormDefaultValues);
          statusModal.onOpenChange(false);
        } else {
          addToast({ title: "Something went wrong !.", color: "danger" });
        }
      })
      .catch(() => {
        addToast({ title: "Something went wrong !.", color: "danger" });
      });
  };

  const handleDesignationFinish = (values) => {
    console.log("values", values);
    values.id = item?.id;
    dispatch(createDesiginationByDepartment(values))
      .then((resp) => {
        console.log("sdjkfssssss   11", resp);
        if (resp.meta.requestStatus === "fulfilled") {
          dispatch(createDesiginationByDepartmentId(values))
            .then((response) => {
              console.log("sdjkfssssss   22", response);
              if (response.meta.requestStatus === "fulfilled") {
                addToast({
                  title: "SUCCESS",
                  description: "Desigination added successfully !.",
                  color: "success",
                });
                dispatch(
                  mapDesignationWithDepartmentInOperations({
                    departmentId: item?.id,
                    designationIds: values?.designation,
                  }),
                ).then((respo) => {
                  console.log("sdjkfssssss   33", respo);
                  if (respo.meta.requestStatus === "fulfilled") {
                    addToast({
                      title: "SUCCESS",
                      description:
                        "Desigination added successfully in Operations !.",
                      color: "success",
                    });
                    dispatch(getAllDepartment());
                    designationModal.onClose();
                    designationForm.reset(designationFormDefaultValues);
                  } else {
                    addToast({
                      title: `${respo?.payload?.status} ${respo?.payload?.statusText}`,
                      description: respo?.payload?.data?.message,
                      color: "danger",
                    });
                  }
                });
              } else {
                addToast({
                  title: `${response?.payload?.status} ${response?.payload?.statusText}`,
                  description: response?.payload?.data?.message,
                  color: "danger",
                });
              }
            })
            .catch(() => {
              addToast({
                title: "ERROR",
                description: "Something went wrong !.",
                color: "danger",
              });
            });
        } else {
          addToast({
            title: "ERROR",
            description: resp?.payload,
            color: "danger",
          });
        }
      })
      .catch(() => {
        addToast({
          title: "ERROR",
          description: "Something went wrong !.",
          color: "danger",
        });
      });
  };

  const handleFinish = (values) => {
    dispatch(createAuthDepartment(values))
      .then((res) => {
        if (res.meta.requestStatus === "fulfilled") {
          console.log("sdjkfssssss   11", res);
          addToast({
            title: "Department created successfully in Auth !.",
            color: "success",
          });
          dispatch(createDepartment(values))
            .then((resp) => {
              console.log("sdjkfssssss   22", resp);
              if (resp.meta.requestStatus === "fulfilled") {
                const responseData = resp?.payload;
                addToast({
                  title: "SUCCESS",
                  description: "Department created successfully !.",
                  color: "success",
                });
                console.log("responseData", responseData);
                dispatch(
                  createDepartmentInOPerations({
                    id: responseData?.id,
                    name: responseData?.name,
                    createdBy: userId,
                  }),
                )
                  .then((resu) => {
                    console.log("sdjkfssssss   33", resu);
                    if (resu.meta.requestStatus === "fulfilled") {
                      addToast({
                        title: "SUCCESS",
                        description:
                          "Desigination added successfully in operations !.",
                        color: "success",
                      });
                      onOpenChange(false);
                      dispatch(getAllDepartment());
                      reset(defaultValues);
                    } else {
                      addToast({
                        description: `${resu?.payload?.message} in Operations`,
                        title: resu?.payload?.status,
                        color: "danger",
                      });
                    }
                  })
                  .catch(() => {
                    addToast({
                      title: "ERROR",
                      description: "Something went wrong in operations !.",
                      color: "danger",
                    });
                  });
              } else {
                addToast({
                  description: `${resp?.payload?.message} in Leads`,
                  title: resp?.payload?.status,
                  color: "danger",
                });
              }
            })
            .catch(() =>
              addToast({
                title: "ERROR",
                description: "Something went wrong !.",
                color: "danger",
              }),
            );
        } else {
          addToast({
            description: `${res?.payload?.message} in Security`,
            title: res?.payload?.status,
            color: "danger",
          });
        }
      })
      .catch(() =>
        addToast({
          title: "ERROR",
          description: "Something went wrong !.",
          color: "danger",
        }),
      );
  };

  const renderCell = React.useCallback((rowData, columnKey) => {
    const cellValue = rowData[columnKey];

    switch (columnKey) {
      case "id":
        return (
          <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
            {rowData?.id}
          </span>
        );

      case "name": {
        const visual = getDepartmentVisual(rowData?.name);
        const Icon = visual.icon;

        return (
          <div className="flex min-w-[210px] items-center gap-4">
            <div
              className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${visual.box}`}
            >
              <Icon size={21} strokeWidth={2.4} />
            </div>
            <div className="min-w-0">
              <p className="truncate text-[15px] font-semibold text-gray-900 dark:text-gray-100">
                {rowData?.name}
              </p>
              <p className="mt-1 text-xs font-medium text-gray-500 dark:text-gray-400">
                {rowData?.designations?.length || 0} Designations
              </p>
            </div>
          </div>
        );
      }

      case "designations":
        return (
          <div className="flex max-w-[520px] flex-wrap gap-2">
            {rowData?.designations?.map((item) => (
              <Chip
                size="sm"
                key={`${item?.name}desi`}
                radius="sm"
                variant="flat"
                className="h-7 border border-gray-300 bg-gray-100 px-2 text-gray-900 dark:border-gray-800 dark:bg-zinc-900 dark:text-gray-100"
                classNames={{
                  content: "text-[12px] font-medium",
                }}
              >
                {item?.name}
              </Chip>
            ))}
          </div>
        );

      case "departmentStatus":
        return (
          <div className="flex max-w-[470px] flex-wrap gap-2">
            {rowData?.departmentStatus?.map((item) => (
              <Chip
                size="sm"
                key={`${item?.name}depart`}
                radius="sm"
                variant="flat"
                startContent={
                  <span
                    className={`ml-1 h-1.5 w-1.5 rounded-full ${getStatusDotClass(
                      item?.name,
                    )}`}
                  />
                }
                className={`h-7 border px-2 ${getStatusChipClass(item?.name)}`}
                classNames={{
                  content: "text-[12px] font-semibold",
                }}
              >
                {item?.name}
              </Chip>
            ))}
          </div>
        );

      case "actions":
        return (
          <div className="relative flex items-center justify-center">
            <Dropdown>
              <DropdownTrigger>
                <Button
                  isIconOnly
                  size="sm"
                  variant="light"
                  radius="full"
                  className="text-gray-900 hover:bg-gray-100 dark:text-gray-100 dark:hover:bg-zinc-900"
                >
                  <EllipsisVertical size={18} />
                </Button>
              </DropdownTrigger>
              <DropdownMenu
                selectionMode="single"
                onSelectionChange={(e) => {
                  let key = Array.from(e)[0];
                  if (key === "designation") {
                    designationModal.onOpen();
                    designationForm.reset(designationFormDefaultValues);
                    setItem(rowData);
                    dispatch(getAllDesiginations());
                  }
                  if (key === "mapStaus") {
                    statusModal.onOpen();
                    setItem(rowData);
                    dispatch(getAllStatusData());
                  }
                }}
              >
                <DropdownItem key="designation">Add designation</DropdownItem>
                <DropdownItem key="mapStaus">Map status</DropdownItem>
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
      <div className="flex w-full shrink-0 flex-col gap-4">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <Input
            isClearable
            radius="lg"
            variant="bordered"
            className="w-full lg:max-w-[430px]"
            classNames={{
              inputWrapper:
                "h-11 border-gray-300 bg-white shadow-sm hover:border-gray-400 data-[hover=true]:border-gray-400 group-data-[focus=true]:border-gray-500 dark:border-gray-800 dark:bg-zinc-950 dark:hover:border-gray-700 dark:data-[hover=true]:border-gray-700 dark:group-data-[focus=true]:border-gray-600",
              input:
                "text-sm font-medium text-gray-900 placeholder:text-gray-500 dark:text-gray-100 dark:placeholder:text-gray-400",
            }}
            placeholder="Search departments, designations or status..."
            startContent={<Search size={19} className="text-gray-500" />}
            value={filterValue}
            onClear={() => onClear()}
            onValueChange={onSearchChange}
          />

          <div className="flex items-center gap-3">
            <Dropdown>
              <DropdownTrigger className="hidden sm:flex">
                <Button
                  radius="lg"
                  variant="bordered"
                  className="h-11 border-gray-300 bg-white px-5 font-semibold text-gray-900 shadow-sm dark:border-gray-800 dark:bg-zinc-950 dark:text-gray-100"
                  startContent={<SlidersHorizontal size={17} />}
                  endContent={<ChevronDown size={17} />}
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
                    {column.name}
                  </DropdownItem>
                ))}
              </DropdownMenu>
            </Dropdown>

            <Button
              radius="lg"
              variant="bordered"
              onPress={onOpen}
              startContent={<Plus size={18} />}
              className="h-11 border-gray-300 bg-white px-6 font-semibold text-gray-900 shadow-sm dark:border-gray-800 dark:bg-zinc-950 dark:text-gray-100"
            >
              Add New Department
            </Button>
          </div>
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
    selectedKeys,
  ]);

  const bottomContent = React.useMemo(() => {
    const start =
      filteredItems.length === 0
        ? 0
        : (initialFilteration?.page - 1) * initialFilteration?.size + 1;
    const end = Math.min(
      initialFilteration?.page * initialFilteration?.size,
      filteredItems.length,
    );

    return (
      <div className="flex shrink-0 flex-col gap-3 border-t border-gray-300 px-1 py-3 dark:border-gray-800 sm:flex-row sm:items-center sm:justify-between">
        <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
          Showing {start} to {end} of {filteredItems.length} departments
        </span>

        <div className="flex flex-wrap items-center justify-end gap-3">
          <label className="flex h-9 items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 text-sm font-medium text-gray-900 shadow-sm dark:border-gray-800 dark:bg-zinc-950 dark:text-gray-100">
            <select
              className="bg-transparent text-sm font-medium text-gray-900 outline-none dark:text-gray-100"
              onChange={onRowsPerPageChange}
              value={initialFilteration?.size}
            >
              <option value="10">10 per page</option>
              <option value="15">15 per page</option>
              <option value="25">25 per page</option>
              <option value="50">50 per page</option>
            </select>
          </label>

          <Pagination
            isCompact
            showControls
            showShadow={false}
            variant="bordered"
            page={initialFilteration?.page}
            total={pages}
            onChange={(e) =>
              setInitialFilteration((prev) => ({ ...prev, page: e }))
            }
            classNames={{
              cursor:
                "bg-gray-900 text-white font-semibold shadow-none dark:bg-gray-100 dark:text-gray-900",
              item: "font-semibold text-gray-900 dark:text-gray-100",
              prev: "text-gray-900 dark:text-gray-100",
              next: "text-gray-900 dark:text-gray-100",
            }}
          />

          <div className="hidden items-center gap-2 sm:flex">
            <Button
              isDisabled={pages === 1}
              size="sm"
              radius="lg"
              variant="bordered"
              className="border-gray-300 font-semibold text-gray-900 dark:border-gray-800 dark:text-gray-100"
              onPress={onPreviousPage}
            >
              Previous
            </Button>
            <Button
              isDisabled={pages === 1}
              size="sm"
              radius="lg"
              variant="bordered"
              className="border-gray-300 font-semibold text-gray-900 dark:border-gray-800 dark:text-gray-100"
              onPress={onNextPage}
            >
              Next
            </Button>
          </div>
        </div>
      </div>
    );
  }, [
    selectedKeys,
    initialFilteration?.page,
    initialFilteration?.size,
    pages,
    hasSearchFilter,
    count,
    filteredItems.length,
  ]);

  return (
    <>
      <div className="flex h-[calc(100dvh-84px)] max-h-[calc(100dvh-84px)] min-h-0 w-full flex-col overflow-hidden bg-gray-50 px-4 py-4 dark:bg-black sm:px-6 lg:px-8">
        <div className="mb-4 shrink-0">
          <h1 className="text-[28px] font-bold tracking-[-0.03em] text-gray-900 dark:text-gray-100">
            Department List
          </h1>
          <p className="mt-1 text-sm font-medium text-gray-500 dark:text-gray-400">
            Manage departments, designations and workflow statuses.
          </p>
        </div>

        <div className="min-h-0 flex-1 overflow-hidden">
          <Table
            isHeaderSticky
            aria-label="Example table with custom cells, pagination and sorting"
            bottomContent={bottomContent}
            bottomContentPlacement="outside"
            classNames={{
              base: "flex h-full min-h-0 w-full flex-col overflow-hidden",
              wrapper:
                "min-h-0 flex-1 overflow-auto rounded-2xl border border-gray-300 bg-white px-5 py-3 shadow-xl shadow-gray-200/60 dark:border-gray-800 dark:bg-zinc-950 dark:shadow-none",
              table: "min-w-[1050px] border-separate border-spacing-0",
              thead: "[&>tr]:first:rounded-xl",
              th: "sticky top-0 z-20 border-b border-gray-300 bg-gray-100 py-3.5 text-xs font-bold uppercase tracking-wide text-gray-900 first:rounded-l-xl last:rounded-r-xl dark:border-gray-800 dark:bg-zinc-900 dark:text-gray-100",
              tr: "border-b border-gray-300 dark:border-gray-800",
              td: "border-b border-gray-300 py-5 text-sm text-gray-900 dark:border-gray-800 dark:text-gray-100",
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
                  className={
                    column.uid === "id"
                      ? "w-[70px]"
                      : column.uid === "actions"
                        ? "w-[110px]"
                        : ""
                  }
                >
                  {column.name}
                </TableColumn>
              )}
            </TableHeader>
            <TableBody emptyContent={"No data found"} items={sortedItems}>
              {(item) => (
                <TableRow
                  key={item.id}
                  className="hover:bg-gray-50 dark:hover:bg-zinc-900/70"
                >
                  {(columnKey) => (
                    <TableCell>{renderCell(item, columnKey)}</TableCell>
                  )}
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <Modal
        size="xl"
        isDismissable={false}
        isKeyboardDismissDisabled={true}
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        placement="top-center"
        classNames={{
          base: "rounded-2xl bg-white dark:bg-zinc-950",
          backdrop: "bg-black/60 backdrop-blur-sm",
        }}
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1 border-b border-gray-300 px-6 py-5 dark:border-gray-800">
                <span className="text-xl font-bold text-gray-900 dark:text-gray-100">
                  Create department
                </span>
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Add a new department into the ERP workflow.
                </span>
              </ModalHeader>
              <ModalBody className="px-6 py-5">
                <form
                  className="flex max-h-[65vh] w-full flex-col gap-5 overflow-auto"
                  onSubmit={handleSubmit(handleFinish)}
                >
                  <Controller
                    name="name"
                    control={control}
                    render={({ field, fieldState: { error } }) => (
                      <Input
                        isRequired
                        radius="lg"
                        variant="bordered"
                        isInvalid={!!error}
                        errorMessage={
                          error?.message || "Please enter department"
                        }
                        label="Department name"
                        classNames={{
                          inputWrapper:
                            "border-gray-300 bg-white group-data-[focus=true]:border-gray-500 dark:border-gray-800 dark:bg-zinc-950",
                          label:
                            "font-semibold text-gray-900 dark:text-gray-100",
                          input: "font-medium text-gray-900 dark:text-gray-100",
                        }}
                        {...field}
                      />
                    )}
                  />
                  <ModalFooter className="flex w-full justify-end gap-3 px-0 pb-0">
                    <Button
                      radius="lg"
                      variant="bordered"
                      className="border-gray-300 font-semibold text-gray-900 dark:border-gray-800 dark:text-gray-100"
                      onPress={onClose}
                    >
                      Cancel
                    </Button>
                    <Button
                      radius="lg"
                      variant="bordered"
                      type="submit"
                      className="border-gray-300 bg-white px-6 font-semibold text-gray-900 dark:border-gray-800 dark:bg-zinc-950 dark:text-gray-100"
                    >
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
        size="xl"
        isDismissable={false}
        isKeyboardDismissDisabled={true}
        isOpen={designationModal.isOpen}
        onOpenChange={designationModal.onOpenChange}
        placement="top-center"
        classNames={{
          base: "rounded-2xl bg-white dark:bg-zinc-950",
          backdrop: "bg-black/60 backdrop-blur-sm",
        }}
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1 border-b border-gray-300 px-6 py-5 dark:border-gray-800">
                <span className="text-xl font-bold text-gray-900 dark:text-gray-100">
                  Add designation
                </span>
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Map selected designations with this department.
                </span>
              </ModalHeader>
              <ModalBody className="px-6 py-5">
                <form
                  className="flex max-h-[65vh] w-full flex-col gap-5 overflow-auto"
                  onSubmit={designationForm.handleSubmit(
                    handleDesignationFinish,
                  )}
                >
                  <Controller
                    name="designation"
                    control={designationForm.control}
                    render={({ field, fieldState: { error } }) => (
                      <NewSelect
                        isRequired
                        label="Designations"
                        selectionMode="multiple"
                        errorMessage={"please select the designation."}
                        data={designationList || []}
                        labelKey="name"
                        valueKey="id"
                        value={field.value}
                        onChange={(value) => {
                          field.onChange(value);
                        }}
                      />
                    )}
                  />
                  <ModalFooter className="flex w-full justify-end gap-3 px-0 pb-0">
                    <Button
                      radius="lg"
                      variant="bordered"
                      className="border-gray-300 font-semibold text-gray-900 dark:border-gray-800 dark:text-gray-100"
                      onPress={onClose}
                    >
                      Cancel
                    </Button>
                    <Button
                      radius="lg"
                      variant="bordered"
                      type="submit"
                      className="border-gray-300 bg-white px-6 font-semibold text-gray-900 dark:border-gray-800 dark:bg-zinc-950 dark:text-gray-100"
                    >
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
        size="xl"
        isDismissable={false}
        isKeyboardDismissDisabled={true}
        isOpen={statusModal.isOpen}
        onOpenChange={statusModal.onOpenChange}
        placement="top-center"
        classNames={{
          base: "rounded-2xl bg-white dark:bg-zinc-950",
          backdrop: "bg-black/60 backdrop-blur-sm",
        }}
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1 border-b border-gray-300 px-6 py-5 dark:border-gray-800">
                <span className="text-xl font-bold text-gray-900 dark:text-gray-100">
                  Map status
                </span>
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Assign workflow statuses to this department.
                </span>
              </ModalHeader>
              <ModalBody className="px-6 py-5">
                <form
                  className="flex max-h-[65vh] w-full flex-col gap-5 overflow-auto"
                  onSubmit={statusForm.handleSubmit(handleAddStatus)}
                >
                  <Controller
                    name="statusId"
                    control={statusForm.control}
                    render={({ field, fieldState: { error } }) => (
                      <NewSelect
                        isRequired
                        label="Status"
                        selectionMode="multiple"
                        errorMessage={"please select the status."}
                        data={statusList || []}
                        labelKey="name"
                        valueKey="id"
                        value={field.value}
                        onChange={(value) => {
                          field.onChange(value);
                        }}
                      />
                    )}
                  />
                  <ModalFooter className="flex w-full justify-end gap-3 px-0 pb-0">
                    <Button
                      radius="lg"
                      variant="bordered"
                      className="border-gray-300 font-semibold text-gray-900 dark:border-gray-800 dark:text-gray-100"
                      onPress={onClose}
                    >
                      Cancel
                    </Button>
                    <Button
                      radius="lg"
                      variant="bordered"
                      type="submit"
                      className="border-gray-300 bg-white px-6 font-semibold text-gray-900 dark:border-gray-800 dark:bg-zinc-950 dark:text-gray-100"
                    >
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

export default Department;
