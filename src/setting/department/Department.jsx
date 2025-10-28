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
import { ChevronDown, EllipsisVertical, Plus, Search } from "lucide-react";
import * as z from "zod";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import NewSelect from "../../components/NewSelect";
import {
  createAuthDepartment,
  createDesiginationByDepartment,
} from "../../toolkit/slices/authSlice";
import { createDepartmentInOPerations } from "../../toolkit/slices/operationSlice";
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
  { name: "ID", uid: "id" },
  { name: "DEPARTMENT", uid: "name", sortable: true },
  { name: "DESIGNATIONS", uid: "designations" },
  { name: "STATUS", uid: "departmentStatus" },
  { name: "ACTIONS", uid: "actions" },
];

export function capitalize(s) {
  return s ? s.charAt(0).toUpperCase() + s.slice(1).toLowerCase() : "";
}

const INITIAL_VISIBLE_COLUMNS = [
  "name",
  "designations",
  "departmentStatus",
  "actions",
];

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
    new Set(INITIAL_VISIBLE_COLUMNS)
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

  const pages = Math.ceil(count / initialFilteration?.size) || 1;

  const items = React.useMemo(() => {
    const start = (initialFilteration?.page - 1) * initialFilteration?.size;
    const end = start + initialFilteration?.size;

    return filteredItems.slice(start, end);
  }, [initialFilteration?.page, filteredItems, initialFilteration?.size]);

  const sortedItems = React.useMemo(() => {
    return [...items].sort((a, b) => {
      const first = a[sortDescriptor.column];
      const second = b[sortDescriptor.column];
      const cmp = first < second ? -1 : first > second ? 1 : 0;

      return sortDescriptor.direction === "descending" ? -cmp : cmp;
    });
  }, [sortDescriptor, items]);

  const handleAddStatus = (values) => {
    dispatch(
      addStatusInDepartment({
        departmentId: item?.id,
        ...values,
      })
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
    values.id = item?.id;
    dispatch(createDesiginationByDepartment(values))
      .then((resp) => {
        if (resp.meta.requestStatus === "fulfilled") {
          dispatch(createDesiginationByDepartmentId(values))
            .then((response) => {
              if (response.meta.requestStatus === "fulfilled") {
                addToast({
                  title: "Desigination added successfully !.",
                  color: "success",
                });
              } else {
                addToast({ title: "Something went wrong !.", color: "danger" });
              }
            })
            .catch(() => {
              addToast({ title: "Something went wrong !.", color: "danger" });
            });
        } else {
          addToast({ title: "Something went wrong !.", color: "danger" });
        }
      })
      .catch(() => {
        addToast({ title: "Something went wrong !.", color: "danger" });
      });
  };

  const handleFinish = (values) => {
    dispatch(createAuthDepartment(values))
      .then((res) => {
        if (res.meta.requestStatus === "fulfilled") {
          addToast({
            title: "Department created successfully in Auth !.",
            color: "success",
          });
          dispatch(createDepartment(values))
            .then((resp) => {
              if (resp.meta.requestStatus === "fulfilled") {
                const responseData = resp?.payload;
                addToast({
                  title: "Department created successfully !.",
                  color: "success",
                });
                console.log("responseData", responseData);
                dispatch(
                  createDepartmentInOPerations({
                    id: responseData?.id,
                    name: responseData?.name,
                    createdBy: userId,
                  })
                )
                  .then((resu) => {
                    if (resu.meta.requestStatus === "fulfilled") {
                      addToast({
                        title:
                          "Desigination added successfully in operations !.",
                        color: "success",
                      });
                      onOpenChange(false);
                      dispatch(getAllDepartment());
                      reset(defaultValues);
                    } else {
                      addToast({
                        title: "Something went wrong in operations !.",
                        color: "danger",
                      });
                    } 
                  })
                  .catch(() => {
                    addToast({
                      title: "Something went wrong in operations !.",
                      color: "danger",
                    });
                  });
              } else {
                addToast({ title: "Something went wrong !.", color: "danger" });
              }
            })
            .catch(() =>
              addToast({ title: "Something went wrong !.", color: "danger" })
            );
        } else {
          addToast({ title: "Something went wrong !.", color: "danger" });
        }
      })
      .catch(() =>
        addToast({ title: "Something went wrong !.", color: "danger" })
      );
  };

  const renderCell = React.useCallback((rowData, columnKey) => {
    const cellValue = rowData[columnKey];

    switch (columnKey) {
      case "name":
        return <p>{rowData?.name}</p>;

      case "designations":
        return (
          <p>
            {rowData?.designations?.map((item) => (
              <Chip size="sm" key={`${item?.name}desi`}>
                {item?.name}
              </Chip>
            ))}
          </p>
        );

      case "departmentStatus":
        return (
          <p>
            {rowData?.departmentStatus?.map((item) => (
              <Chip size="sm" key={`${item?.name}depart`}>
                {item?.name}
              </Chip>
            ))}
          </p>
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
              <DropdownMenu
                selectionMode="single"
                onSelectionChange={(e) => {
                  let key = Array.from(e)[0];
                  if (key === "designation") {
                    designationModal.onOpen();
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
      <div className="flex flex-col gap-4">
        <div className="flex justify-between gap-3 items-end">
          <Input
            isClearable
            className="w-full sm:max-w-[35%]"
            placeholder="Search by name..."
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
            Total {count} department
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
    selectedKeys,
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
      <h1 className="font-sans text-2xl font-medium mb-1">Department list</h1>
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
        onSelectionChange={(e) => {
          let rowKeys = Array.from(e);
          setSelectedKeys(rowKeys);
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
                {item?.id ? "Update department" : "Create department"}
              </ModalHeader>
              <ModalBody>
                <form
                  className="w-full flex flex-col gap-4 max-h-[65vh] overflow-auto"
                  onSubmit={handleSubmit(handleFinish)}
                >
                  <Controller
                    name="name"
                    control={control}
                    render={({ field, fieldState: { error } }) => (
                      <Input
                        isRequired
                        errorMessage="Please enter department"
                        label="Department name"
                        {...field}
                      />
                    )}
                  />
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
        size="2xl"
        isDismissable={false}
        isKeyboardDismissDisabled={true}
        isOpen={designationModal.isOpen}
        onOpenChange={designationModal.onOpenChange}
        placement="top-center"
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                Add designation
              </ModalHeader>
              <ModalBody>
                <form
                  className="w-full flex flex-col gap-4 max-h-[65vh] overflow-auto"
                  onSubmit={designationForm.handleSubmit(
                    handleDesignationFinish
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
        size="2xl"
        isDismissable={false}
        isKeyboardDismissDisabled={true}
        isOpen={statusModal.isOpen}
        onOpenChange={statusModal.onOpenChange}
        placement="top-center"
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                Map status
              </ModalHeader>
              <ModalBody>
                <form
                  className="w-full flex flex-col gap-4 max-h-[65vh] overflow-auto"
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

export default Department;
