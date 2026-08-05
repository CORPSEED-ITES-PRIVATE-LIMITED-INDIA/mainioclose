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
  updateDesignationDepartment,
} from "../../toolkit/slices/settingSlice";
import { ChevronDown, EllipsisVertical, Plus, Search } from "lucide-react";
import * as z from "zod";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import NewSelect from "../../components/NewSelect";
import {
  createAuthDepartment,
  createDesiginationByDepartment,
  updateDepartment,
} from "../../toolkit/slices/authSlice";
import {
  createDepartmentInOPerations,
  mapDesignationWithDepartmentInOperations,
  updateOperationDepartment,
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
  const isEditMode = Boolean(item);

  const [initialFilteration, setInitialFilteration] = useState({
    page: 1,
    size: 50,
  });

  const hasSearchFilter = Boolean(filterValue);

  const { control, handleSubmit, reset } = useForm({
    resolver: zodResolver(formSchema),
    defaultValues,
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
  }, [data, filterValue, hasSearchFilter]);

  const pages = Math.ceil(count / initialFilteration?.size) || 1;

  const items = React.useMemo(() => {
    const start = (initialFilteration?.page - 1) * initialFilteration?.size;
    const end = start + initialFilteration?.size;

    return filteredItems.slice(start, end);
  }, [initialFilteration?.page, initialFilteration?.size, filteredItems]);

  const sortedItems = React.useMemo(() => {
    return [...items];
  }, [sortDescriptor, items]);

  const handleOpenCreateModal = () => {
    setItem(null);
    reset(defaultValues);
    onOpen();
  };

  const handleOpenUpdateModal = (rowData) => {
    setItem(rowData);
    reset({
      name: rowData?.name || "",
    });
    onOpen();
  };

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
    values.id = item?.id;

    dispatch(createDesiginationByDepartment(values))
      .then((resp) => {
        if (resp.meta.requestStatus === "fulfilled") {
          dispatch(createDesiginationByDepartmentId(values))
            .then((response) => {
              console.log("dskjgjkdsg", response);
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

  const handleFinish = async (values) => {
    try {
      await dispatch(createAuthDepartment(values)).unwrap();

      const leadResponse = await dispatch(createDepartment(values)).unwrap();

      await dispatch(
        createDepartmentInOPerations({
          id: leadResponse?.id,
          name: leadResponse?.name,
          createdBy: userId,
        }),
      ).unwrap();

      addToast({
        title: "SUCCESS",
        description: "Department created successfully in all services.",
        color: "success",
      });

      onOpenChange(false);
      dispatch(getAllDepartment());
      reset(defaultValues);
      setItem(null);
    } catch (error) {
      addToast({
        title: error?.status || "ERROR",
        description:
          error?.message ||
          error?.data?.message ||
          "Something went wrong while creating department.",
        color: "danger",
      });
    }
  };

  const handleUpdateDepartment = async (values) => {
    try {
      const payload = {
        id: item?.id,
        name: values?.name,
        designation: item?.designations?.map((d) => d?.id) || [],
      };

      await dispatch(updateDepartment(payload)).unwrap();

      await dispatch(
        updateDesignationDepartment({
          id: item?.id,
          name: values?.name,
          designationIds: item?.designations?.map((d) => d?.id) || [],
          weightValue: item?.weightValue || 0,
        }),
      ).unwrap();

      await dispatch(
        updateOperationDepartment({
          id: item?.id,
          payload: {
            id: item?.id,
            name: values?.name,
          },
        }),
      ).unwrap();

      addToast({
        title: "SUCCESS",
        description: "Department updated successfully in all services.",
        color: "success",
      });

      onOpenChange(false);
      dispatch(getAllDepartment());
      reset(defaultValues);
      setItem(null);
    } catch (error) {
      addToast({
        title: error?.status || "ERROR",
        description:
          error?.message ||
          error?.data?.message ||
          "Something went wrong while updating department.",
        color: "danger",
      });
    }
  };

  const renderCell = React.useCallback((rowData, columnKey) => {
    const cellValue = rowData[columnKey];

    switch (columnKey) {
      case "id":
        return <span>{rowData?.id}</span>;

      case "name":
        return <span className="font-medium">{rowData?.name}</span>;

      case "designations":
        return (
          <div className="flex max-w-[420px] flex-wrap gap-1">
            {rowData?.designations?.map((item) => (
              <Chip size="sm" key={`${item?.name}desi`} variant="flat">
                {item?.name}
              </Chip>
            ))}
          </div>
        );

      case "departmentStatus":
        return (
          <div className="flex max-w-[420px] flex-wrap gap-1">
            {rowData?.departmentStatus?.map((item) => (
              <Chip size="sm" key={`${item?.name}depart`} variant="flat">
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
                <Button isIconOnly size="sm" variant="light">
                  <EllipsisVertical size={18} />
                </Button>
              </DropdownTrigger>

              <DropdownMenu
                selectionMode="single"
                onSelectionChange={(e) => {
                  const key = Array.from(e)[0];

                  if (key === "update") {
                    handleOpenUpdateModal(rowData);
                  }

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
                <DropdownItem key="update">Update department</DropdownItem>
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
      <div className="flex shrink-0 flex-col gap-4">
        <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center">
          <Input
            isClearable
            className="w-full md:max-w-[400px]"
            placeholder="Search..."
            startContent={<Search size={18} />}
            value={filterValue}
            onClear={onClear}
            onValueChange={onSearchChange}
          />

          <div className="flex items-center gap-3">
            <Dropdown>
              <DropdownTrigger className="hidden sm:flex">
                <Button variant="flat" endContent={<ChevronDown size={16} />}>
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
              color="primary"
              onPress={handleOpenCreateModal}
              startContent={<Plus size={18} />}
            >
              Add New Department
            </Button>
          </div>
        </div>
      </div>
    );
  }, [filterValue, visibleColumns, onSearchChange, selectedKeys]);

  const bottomContent = React.useMemo(() => {
    return (
      <div className="flex shrink-0 flex-col items-center justify-between gap-3 py-2 md:flex-row">
        <span className="text-small text-default-400">
          Total {filteredItems.length} departments
        </span>

        <div className="flex flex-wrap items-center gap-3">
          <label className="flex items-center gap-2 text-small text-default-400">
            Rows per page:
            <select
              className="bg-transparent text-small text-default-500 outline-none"
              onChange={onRowsPerPageChange}
              value={initialFilteration?.size}
            >
              <option value="10">10</option>
              <option value="15">15</option>
              <option value="25">25</option>
              <option value="50">50</option>
            </select>
          </label>

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

          <div className="hidden items-center gap-2 sm:flex">
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
      </div>
    );
  }, [
    selectedKeys,
    initialFilteration?.page,
    initialFilteration?.size,
    pages,
    count,
    filteredItems.length,
  ]);

  return (
    <>
      <div className="flex h-[calc(100vh-90px)] w-full flex-col overflow-hidden p-4">
        <div className="mb-4 shrink-0">
          <h1 className="font-sans text-lg font-semibold mb-2 shrink-0">
            Department List
          </h1>
        </div>

        <div className="min-h-0 flex-1 overflow-hidden">
          <Table
            aria-label="Department table"
            bottomContent={bottomContent}
            bottomContentPlacement="outside"
            sortDescriptor={sortDescriptor}
            topContent={topContent}
            topContentPlacement="outside"
            onSortChange={setSortDescriptor}
            classNames={{
              base: "flex h-full min-h-0 flex-col overflow-hidden",
              wrapper: "min-h-0 flex-1 overflow-auto",
              table: "min-w-[1000px]",
            }}
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
        </div>
      </div>

      <Modal
        size="xl"
        isDismissable={false}
        isKeyboardDismissDisabled={true}
        isOpen={isOpen}
        onOpenChange={(open) => {
          onOpenChange(open);
          if (!open) {
            setItem(null);
            reset(defaultValues);
          }
        }}
        placement="top-center"
        scrollBehavior="inside"
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader>
                {isEditMode ? "Update department" : "Create department"}
              </ModalHeader>

              <ModalBody>
                <form
                  className="flex max-h-[65vh] w-full flex-col gap-4 overflow-auto"
                  onSubmit={handleSubmit(
                    isEditMode ? handleUpdateDepartment : handleFinish,
                  )}
                >
                  <Controller
                    name="name"
                    control={control}
                    render={({ field, fieldState: { error } }) => (
                      <Input
                        isRequired
                        isInvalid={!!error}
                        errorMessage={
                          error?.message || "Please enter department"
                        }
                        label="Department name"
                        {...field}
                      />
                    )}
                  />

                  <ModalFooter className="px-0">
                    <Button variant="flat" onPress={onClose}>
                      Cancel
                    </Button>

                    <Button color="primary" type="submit">
                      {isEditMode ? "Update" : "Submit"}
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
        scrollBehavior="inside"
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader>Add designation</ModalHeader>

              <ModalBody>
                <form
                  className="flex max-h-[65vh] w-full flex-col gap-4 overflow-auto"
                  onSubmit={designationForm.handleSubmit(
                    handleDesignationFinish,
                  )}
                >
                  <Controller
                    name="designation"
                    control={designationForm.control}
                    render={({ field }) => (
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

                  <ModalFooter className="px-0">
                    <Button variant="flat" onPress={onClose}>
                      Cancel
                    </Button>

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
        size="xl"
        isDismissable={false}
        isKeyboardDismissDisabled={true}
        isOpen={statusModal.isOpen}
        onOpenChange={statusModal.onOpenChange}
        placement="top-center"
        scrollBehavior="inside"
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader>Map status</ModalHeader>

              <ModalBody>
                <form
                  className="flex max-h-[65vh] w-full flex-col gap-4 overflow-auto"
                  onSubmit={statusForm.handleSubmit(handleAddStatus)}
                >
                  <Controller
                    name="statusId"
                    control={statusForm.control}
                    render={({ field }) => (
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

                  <ModalFooter className="px-0">
                    <Button variant="flat" onPress={onClose}>
                      Cancel
                    </Button>

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
