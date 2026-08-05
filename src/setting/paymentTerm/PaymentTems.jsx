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
  SelectItem,
  Select,
  Chip,
} from "@heroui/react";
import { useDispatch } from "react-redux";
import {
  ChevronDown,
  Plus,
  Search,
  EllipsisVertical,
  Pencil,
  Trash2,
} from "lucide-react";
import * as z from "zod";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import NewTextEditor from "../../components/NewTextEditor";
import {
  createPaymentType,
  deletePaymentType,
  getAllPaymentTermList,
  updatePaymentType,
} from "../../toolkit/slices/settingSlice";
import { useParams } from "react-router-dom";

export const columns = [
  { name: "ID", uid: "id", sortable: true },
  { name: "CODE", uid: "code", sortable: true },
  { name: "NAME", uid: "name", sortable: true },
  { name: "DESCRIPTION", uid: "description" },
  { name: "ACTIVE", uid: "active", sortable: true },
  { name: "ACTIONS", uid: "actions" },
];

const INITIAL_VISIBLE_COLUMNS = [
  "id",
  "code",
  "name",
  "description",
  "active",
  "actions",
];

const formSchema = z.object({
  code: z.string().min(1, "Please enter code."),
  name: z.string().min(1, "Please enter name."),
  description: z.string().min(1, "Please enter description."),
  active: z.string().min(1, "Please select active status."),
});

const defaultValues = {
  code: "",
  name: "",
  description: "<p></p>",
  active: "true",
};

export function capitalize(s) {
  return s ? s.charAt(0).toUpperCase() + s.slice(1).toLowerCase() : "";
}

const normalizePaymentTypeResponse = (response) => {
  if (Array.isArray(response)) return response;
  if (Array.isArray(response?.content)) return response.content;
  if (Array.isArray(response?.data)) return response.data;
  if (response && typeof response === "object") return [response];

  return [];
};

const PaymentTems = () => {
  const { userId } = useParams();
  const dispatch = useDispatch();

  const formModal = useDisclosure();
  const descriptionModal = useDisclosure();
  const deleteModal = useDisclosure();

  const [paymentTypes, setPaymentTypes] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const [filterValue, setFilterValue] = useState("");
  const [selectedKeys, setSelectedKeys] = useState(new Set([]));
  const [visibleColumns, setVisibleColumns] = useState(
    new Set(INITIAL_VISIBLE_COLUMNS),
  );

  const [sortDescriptor, setSortDescriptor] = useState({
    column: "id",
    direction: "descending",
  });

  const [selectedItem, setSelectedItem] = useState(null);
  const [selectedDescription, setSelectedDescription] = useState("");

  const [initialFilteration, setInitialFilteration] = useState({
    page: 1,
    size: 50,
  });

  const hasSearchFilter = Boolean(filterValue);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(formSchema),
    defaultValues,
  });

  const fetchPaymentTypes = React.useCallback(() => {
    setIsLoading(true);

    dispatch(getAllPaymentTermList())
      .then((res) => {
        if (res.meta.requestStatus === "fulfilled") {
          setPaymentTypes(normalizePaymentTypeResponse(res.payload));
        } else {
          addToast({
            title: "Error",
            description: res?.payload || "Failed to fetch payment types",
            color: "danger",
          });
        }
      })
      .catch(() => {
        addToast({
          title: "Error",
          description: "Something went wrong while fetching payment types",
          color: "danger",
        });
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [dispatch]);

  useEffect(() => {
    fetchPaymentTypes();
  }, [fetchPaymentTypes]);

  const count = paymentTypes?.length || 0;

  const headerColumns = React.useMemo(() => {
    if (visibleColumns === "all") return columns;

    return columns.filter((column) =>
      Array.from(visibleColumns).includes(column.uid),
    );
  }, [visibleColumns]);

  const filteredItems = React.useMemo(() => {
    let filteredData = [...(paymentTypes || [])];

    if (hasSearchFilter) {
      const searchValue = filterValue.toLowerCase();

      filteredData = filteredData.filter((item) => {
        return (
          String(item?.id || "")
            .toLowerCase()
            .includes(searchValue) ||
          String(item?.code || "")
            .toLowerCase()
            .includes(searchValue) ||
          String(item?.name || "")
            .toLowerCase()
            .includes(searchValue) ||
          String(item?.description || "")
            .toLowerCase()
            .includes(searchValue) ||
          String(item?.active || "")
            .toLowerCase()
            .includes(searchValue)
        );
      });
    }

    return filteredData;
  }, [paymentTypes, filterValue, hasSearchFilter]);

  const sortedItems = React.useMemo(() => {
    return [...filteredItems].sort((a, b) => {
      const first = a?.[sortDescriptor.column];
      const second = b?.[sortDescriptor.column];

      let cmp = 0;

      if (first === null || first === undefined) cmp = -1;
      else if (second === null || second === undefined) cmp = 1;
      else if (first < second) cmp = -1;
      else if (first > second) cmp = 1;

      return sortDescriptor.direction === "descending" ? -cmp : cmp;
    });
  }, [filteredItems, sortDescriptor]);

  const pages = Math.ceil(sortedItems.length / initialFilteration.size) || 1;

  const paginatedItems = React.useMemo(() => {
    const start = (initialFilteration.page - 1) * initialFilteration.size;
    const end = start + initialFilteration.size;

    return sortedItems.slice(start, end);
  }, [sortedItems, initialFilteration.page, initialFilteration.size]);

  const handleOpenCreateModal = () => {
    setSelectedItem(null);
    reset(defaultValues);
    formModal.onOpen();
  };

  const handleOpenEditModal = (item) => {
    setSelectedItem(item);

    reset({
      code: item?.code || "",
      name: item?.name || "",
      description: item?.description || "<p></p>",
      active: String(item?.active ?? true),
    });

    formModal.onOpen();
  };

  const handleOpenDeleteModal = (item) => {
    setSelectedItem(item);
    deleteModal.onOpen();
  };

  const handleOpenDescriptionModal = React.useCallback(
    (description) => {
      setSelectedDescription(description || "<p>No description available</p>");
      descriptionModal.onOpen();
    },
    [descriptionModal],
  );

  const handleCloseFormModal = () => {
    setSelectedItem(null);
    reset(defaultValues);
    formModal.onClose();
  };

  const handleSubmitPaymentType = (values) => {
    const payload = {
      id: selectedItem?.id,
      code: values.code,
      name: values.name,
      description: values.description,
      active: values.active === "true",
      createdBy: userId,
      updatedBy: userId,
    };

    if (selectedItem?.id) {
      dispatch(
        updatePaymentType({
          id: selectedItem.id,
          data: {
            ...payload,
            id: selectedItem.id,
          },
        }),
      ).then((res) => {
        if (res.meta.requestStatus === "fulfilled") {
          addToast({
            title: "Success",
            description: "Payment type updated successfully.",
            color: "success",
          });

          handleCloseFormModal();
          fetchPaymentTypes();
        } else {
          addToast({
            title: "Error",
            description: res?.payload || "Failed to update payment type",
            color: "danger",
          });
        }
      });

      return;
    }

    dispatch(createPaymentType(payload)).then((res) => {
      if (res.meta.requestStatus === "fulfilled") {
        addToast({
          title: "Success",
          description: "Payment type created successfully.",
          color: "success",
        });

        handleCloseFormModal();
        fetchPaymentTypes();
      } else {
        addToast({
          title: "Error",
          description: res?.payload || "Failed to create payment type",
          color: "danger",
        });
      }
    });
  };

  const handleDeletePaymentType = () => {
    if (!selectedItem?.id) {
      addToast({
        title: "Error",
        description: "Payment type ID is missing.",
        color: "danger",
      });
      return;
    }

    dispatch(deletePaymentType(selectedItem.id)).then((res) => {
      if (res.meta.requestStatus === "fulfilled") {
        addToast({
          title: "Success",
          description: "Payment type deleted successfully.",
          color: "success",
        });

        deleteModal.onClose();
        setSelectedItem(null);
        fetchPaymentTypes();
      } else {
        addToast({
          title: "Error",
          description: res?.payload || "Failed to delete payment type",
          color: "danger",
        });
      }
    });
  };

  const renderCell = React.useCallback(
    (rowData, columnKey) => {
      const cellValue = rowData[columnKey];

      switch (columnKey) {
        case "id":
          return <span>{rowData?.id || "-"}</span>;

        case "code":
          return <span className="font-medium">{rowData?.code || "-"}</span>;

        case "name":
          return <span>{rowData?.name || "-"}</span>;

        case "description":
          return (
            <Button
              size="sm"
              color="primary"
              variant="flat"
              onPress={() => handleOpenDescriptionModal(rowData?.description)}
            >
              View
            </Button>
          );

        case "active":
          return (
            <Chip
              size="sm"
              variant="flat"
              color={rowData?.active ? "success" : "danger"}
            >
              {rowData?.active ? "Active" : "Inactive"}
            </Chip>
          );

        case "actions":
          return (
            <Dropdown>
              <DropdownTrigger>
                <Button isIconOnly size="sm" variant="light">
                  <EllipsisVertical className="text-default-400" />
                </Button>
              </DropdownTrigger>

              <DropdownMenu aria-label="Payment Type Actions">
                <DropdownItem
                  key="edit"
                  startContent={<Pencil size={15} />}
                  onPress={() => handleOpenEditModal(rowData)}
                >
                  Edit
                </DropdownItem>

                <DropdownItem
                  key="delete"
                  className="text-danger"
                  color="danger"
                  startContent={<Trash2 size={15} />}
                  onPress={() => handleOpenDeleteModal(rowData)}
                >
                  Delete
                </DropdownItem>
              </DropdownMenu>
            </Dropdown>
          );

        default:
          return cellValue || "-";
      }
    },
    [handleOpenDescriptionModal],
  );

  const onNextPage = React.useCallback(() => {
    if (initialFilteration.page < pages) {
      setInitialFilteration((prev) => ({
        ...prev,
        page: prev.page + 1,
      }));
    }
  }, [initialFilteration.page, pages]);

  const onPreviousPage = React.useCallback(() => {
    if (initialFilteration.page > 1) {
      setInitialFilteration((prev) => ({
        ...prev,
        page: prev.page - 1,
      }));
    }
  }, [initialFilteration.page]);

  const onRowsPerPageChange = React.useCallback((e) => {
    setInitialFilteration((prev) => ({
      ...prev,
      size: Number(e.target.value),
      page: 1,
    }));
  }, []);

  const onSearchChange = React.useCallback((value) => {
    setFilterValue(value || "");

    setInitialFilteration((prev) => ({
      ...prev,
      page: 1,
    }));
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
            onClear={onClear}
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

            <Button
              color="primary"
              onPress={handleOpenCreateModal}
              endContent={<Plus />}
            >
              Add New
            </Button>
          </div>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-default-400 text-small">
            Total {count} payment types
          </span>

          <label className="flex items-center text-default-400 text-small">
            Rows per page:
            <select
              className="bg-transparent outline-hidden text-default-400 text-small"
              onChange={onRowsPerPageChange}
              value={initialFilteration.size}
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
    onClear,
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
          page={initialFilteration.page}
          total={pages}
          onChange={(page) =>
            setInitialFilteration((prev) => ({
              ...prev,
              page,
            }))
          }
        />

        <div className="hidden sm:flex w-[30%] justify-end gap-2">
          <Button
            isDisabled={initialFilteration.page <= 1}
            size="sm"
            variant="flat"
            onPress={onPreviousPage}
          >
            Previous
          </Button>

          <Button
            isDisabled={initialFilteration.page >= pages}
            size="sm"
            variant="flat"
            onPress={onNextPage}
          >
            Next
          </Button>
        </div>
      </div>
    );
  }, [
    selectedKeys,
    initialFilteration.page,
    pages,
    count,
    onPreviousPage,
    onNextPage,
  ]);

  return (
    <>
      <h1 className="font-sans text-lg font-semibold mb-2 shrink-0">
        Payment Terms
      </h1>

      <Table
        isHeaderSticky
        aria-label="Payment types table"
        bottomContent={bottomContent}
        bottomContentPlacement="outside"
        classNames={{
          wrapper: "2xl:max-h-[65vh] md:max-h-[60vh] w-full",
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

        <TableBody
          isLoading={isLoading}
          emptyContent={isLoading ? "Loading..." : "No payment types found"}
          items={paginatedItems}
        >
          {(item) => (
            <TableRow key={item.id}>
              {(columnKey) => (
                <TableCell>{renderCell(item, columnKey)}</TableCell>
              )}
            </TableRow>
          )}
        </TableBody>
      </Table>

      {/* CREATE / UPDATE MODAL */}
      <Modal
        size="5xl"
        isDismissable={false}
        isKeyboardDismissDisabled={true}
        isOpen={formModal.isOpen}
        onOpenChange={formModal.onOpenChange}
        placement="top-center"
        scrollBehavior="inside"
      >
        <ModalContent>
          {() => (
            <>
              <ModalHeader className="flex shrink-0 flex-col gap-1 border-b border-default-200">
                {selectedItem?.id
                  ? "Update Payment Type"
                  : "Create Payment Type"}
              </ModalHeader>

              <ModalBody>
                <form
                  className="flex max-h-[85vh] w-full flex-col gap-3"
                  onSubmit={handleSubmit(handleSubmitPaymentType)}
                >
                  <Controller
                    name="code"
                    control={control}
                    render={({ field }) => (
                      <Input
                        isRequired
                        label="Code"
                        placeholder="Enter code"
                        variant="bordered"
                        {...field}
                        isInvalid={Boolean(errors.code)}
                        errorMessage={errors.code?.message}
                      />
                    )}
                  />

                  <Controller
                    name="name"
                    control={control}
                    render={({ field }) => (
                      <Input
                        isRequired
                        label="Name"
                        placeholder="Enter name"
                        variant="bordered"
                        {...field}
                        isInvalid={Boolean(errors.name)}
                        errorMessage={errors.name?.message}
                      />
                    )}
                  />

                  <Controller
                    name="active"
                    control={control}
                    render={({ field }) => (
                      <Select
                        isRequired
                        label="Active"
                        placeholder="Select active status"
                        variant="bordered"
                        selectedKeys={field.value ? [field.value] : []}
                        onSelectionChange={(keys) => {
                          const selected = Array.from(keys)[0];
                          field.onChange(selected);
                        }}
                        isInvalid={Boolean(errors.active)}
                        errorMessage={errors.active?.message}
                      >
                        <SelectItem key="true">Active</SelectItem>
                        <SelectItem key="false">Inactive</SelectItem>
                      </Select>
                    )}
                  />

                  <Controller
                    name="description"
                    control={control}
                    render={({ field }) => (
                      <div className="flex flex-col gap-1">
                        <label className="text-sm font-medium text-default-700">
                          Description <span className="text-danger">*</span>
                        </label>

                        <NewTextEditor
                          data={field.value || "<p></p>"}
                          onChange={(value) => {
                            field.onChange(value);
                          }}
                        />

                        {errors.description && (
                          <p className="text-xs text-danger">
                            {errors.description.message}
                          </p>
                        )}
                      </div>
                    )}
                  />

                  <ModalFooter className="shrink-0 border-t border-default-200">
                    <Button
                      type="button"
                      variant="flat"
                      onPress={handleCloseFormModal}
                      isDisabled={isSubmitting}
                    >
                      Cancel
                    </Button>

                    <Button
                      color="primary"
                      type="submit"
                      isLoading={isSubmitting}
                    >
                      {selectedItem?.id ? "Update" : "Submit"}
                    </Button>
                  </ModalFooter>
                </form>
              </ModalBody>
            </>
          )}
        </ModalContent>
      </Modal>

      {/* DESCRIPTION HTML VIEW MODAL */}
      <Modal
        size="3xl"
        isOpen={descriptionModal.isOpen}
        onOpenChange={descriptionModal.onOpenChange}
        placement="top-center"
        scrollBehavior="inside"
        classNames={{
          base: "max-h-[85vh]",
          body: "overflow-y-auto",
        }}
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1 border-b border-default-200">
                Description
              </ModalHeader>

              <ModalBody className="max-h-[65vh] overflow-y-auto px-6 py-4">
                <div
                  className="prose max-w-none text-sm text-default-700"
                  dangerouslySetInnerHTML={{
                    __html:
                      selectedDescription || "<p>No description available</p>",
                  }}
                />
              </ModalBody>

              <ModalFooter className="border-t border-default-200">
                <Button color="primary" onPress={onClose}>
                  Close
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      {/* DELETE CONFIRM MODAL */}
      <Modal
        size="md"
        isOpen={deleteModal.isOpen}
        onOpenChange={deleteModal.onOpenChange}
        placement="top-center"
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader>Delete Payment Type</ModalHeader>

              <ModalBody>
                <p className="text-sm text-default-600">
                  Are you sure you want to delete{" "}
                  <span className="font-semibold">
                    {selectedItem?.name || "this payment type"}
                  </span>
                  ?
                </p>
              </ModalBody>

              <ModalFooter>
                <Button
                  variant="flat"
                  onPress={() => {
                    setSelectedItem(null);
                    onClose();
                  }}
                >
                  Cancel
                </Button>

                <Button color="danger" onPress={handleDeletePaymentType}>
                  Delete
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
};

export default PaymentTems;
