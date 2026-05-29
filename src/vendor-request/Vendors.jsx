import {
  Button,
  Chip,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
  Form,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Pagination,
  Select,
  SelectItem,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
  Textarea,
  Tooltip,
  useDisclosure,
  addToast,
} from "@heroui/react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { EllipsisVertical, Pencil, Plus, Search, Trash2 } from "lucide-react";
import { useParams } from "react-router-dom";
import LoadingSpinner from "../components/LoadingSpinner";
import {
  createVendor,
  deleteVendor,
  getAllVendors,
  updateVendor,
} from "../toolkit/slices/vendorsSlice";
import { allowOnlyNumbers, formatGSTInput, formatPANInput } from "../common";

const columns = [
  { name: "ID", uid: "id", sortable: true },
  // { name: "VENDOR CODE", uid: "vendorCode", sortable: true },
  { name: "VENDOR NAME", uid: "name", sortable: true },
  { name: "CONTACT", uid: "contact" },
  { name: "GST / PAN", uid: "taxDetail" },
  { name: "STATUS", uid: "status" },
  { name: "VERIFIED", uid: "verified" },
  { name: "ACTIONS", uid: "actions" },
];

const initialVendorForm = {
  name: "",
  description: "",
  email: "",
  mobile: "",
  gstNumber: "",
  panNumber: "",
  status: "Active",
  verified: "true",
};

const toNumberOrNull = (value) => {
  if (
    value === undefined ||
    value === null ||
    value === "" ||
    value === "undefined"
  ) {
    return null;
  }

  const numberValue = Number(value);
  return Number.isNaN(numberValue) ? null : numberValue;
};

const getErrorMessage = (error, fallbackMessage) => {
  if (typeof error === "string") return error;

  return (
    error?.message ||
    error?.error ||
    error?.details ||
    error?.data?.message ||
    fallbackMessage
  );
};

const Vendors = () => {
  const dispatch = useDispatch();
  const { userId } = useParams();

  const vendorModal = useDisclosure();
  const deleteModal = useDisclosure();

  const vendorList = useSelector((state) => state.vendors.vendorList);
  const loading = useSelector((state) => state.vendors.loading);
  const createLoading = useSelector((state) => state.vendors.createLoading);
  const updateLoading = useSelector((state) => state.vendors.updateLoading);
  const deleteLoading = useSelector((state) => state.vendors.deleteLoading);

  const data = Array.isArray(vendorList)
    ? vendorList
    : vendorList?.content || [];

  const [filterValue, setFilterValue] = useState("");
  const [selectedKeys, setSelectedKeys] = useState(new Set([]));
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [modalMode, setModalMode] = useState("create");
  const [vendorForm, setVendorForm] = useState(initialVendorForm);

  const [sortDescriptor, setSortDescriptor] = useState({
    column: "id",
    direction: "descending",
  });

  const [pagination, setPagination] = useState({
    page: 1,
    size: 50,
  });

  const auditUserId = toNumberOrNull(userId);

  const refetchVendors = useCallback(
    (search = "") => {
      dispatch(
        getAllVendors({
          userId,
          page: pagination.page,
          size: pagination.size,
          search: search,
        }),
      );
    },
    [dispatch, pagination.page, pagination.size],
  );

  useEffect(() => {
    refetchVendors();
  }, [refetchVendors]);

  const resetForm = () => {
    setVendorForm(initialVendorForm);
    setSelectedVendor(null);
    setModalMode("create");
  };

  const handleInputChange = (field, value) => {
    setVendorForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const openCreateModal = () => {
    resetForm();
    setModalMode("create");
    vendorModal.onOpen();
  };

  const openEditModal = (vendor) => {
    setSelectedVendor(vendor);
    setModalMode("edit");

    setVendorForm({
      name: vendor?.name || "",
      description: vendor?.description || "",
      email: vendor?.email || "",
      mobile: vendor?.mobile || "",
      gstNumber: vendor?.gstNumber || "",
      panNumber: vendor?.panNumber || "",
      status: vendor?.status || "Active",
      verified: String(Boolean(vendor?.verified)),
    });

    vendorModal.onOpen();
  };

  const openDeleteModal = (vendor) => {
    setSelectedVendor(vendor);
    deleteModal.onOpen();
  };

  const validateVendorForm = () => {
    if (!auditUserId) {
      addToast({
        title: "User ID is missing",
        description: "Please check route params. userId cannot be undefined.",
        color: "danger",
      });
      return false;
    }

    if (!vendorForm.name.trim()) {
      addToast({
        title: "Vendor name is required",
        color: "danger",
      });
      return false;
    }

    if (!vendorForm.email.trim()) {
      addToast({
        title: "Email is required",
        color: "danger",
      });
      return false;
    }

    if (!vendorForm.mobile.trim()) {
      addToast({
        title: "Mobile number is required",
        color: "danger",
      });
      return false;
    }

    if (!vendorForm.gstNumber.trim()) {
      addToast({
        title: "GST number is required",
        color: "danger",
      });
      return false;
    }

    if (!vendorForm.panNumber.trim()) {
      addToast({
        title: "PAN number is required",
        color: "danger",
      });
      return false;
    }

    return true;
  };

  const buildVendorPayload = () => {
    return {
      name: vendorForm.name.trim(),
      description: vendorForm.description.trim(),
      email: vendorForm.email.trim(),
      mobile: vendorForm.mobile.trim(),
      gstNumber: vendorForm.gstNumber.trim().toUpperCase(),
      panNumber: vendorForm.panNumber.trim().toUpperCase(),
      status: vendorForm.status,
      createdBy:
        modalMode === "edit"
          ? toNumberOrNull(selectedVendor?.createdBy) || auditUserId
          : auditUserId,
      updatedBy: auditUserId,
      verified: vendorForm.verified === "true",
    };
  };

  const handleSubmitVendor = async (e) => {
    e.preventDefault();

    if (!validateVendorForm()) return;

    const payload = buildVendorPayload();

    try {
      if (modalMode === "edit") {
        const vendorId = toNumberOrNull(selectedVendor?.id);

        if (!vendorId) {
          addToast({
            title: "Vendor ID is missing",
            color: "danger",
          });
          return;
        }

        await dispatch(
          updateVendor({
            id: vendorId,
            data: payload,
            userId: auditUserId,
          }),
        ).unwrap();

        addToast({
          title: "Vendor updated successfully",
          color: "success",
        });
      } else {
        await dispatch(
          createVendor({
            data: payload,
            userId: auditUserId,
          }),
        ).unwrap();

        addToast({
          title: "Vendor created successfully",
          color: "success",
        });
      }

      resetForm();
      vendorModal.onClose();
      refetchVendors();
    } catch (error) {
      addToast({
        title:
          modalMode === "edit"
            ? "Failed to update vendor"
            : "Failed to create vendor",
        description: getErrorMessage(
          error,
          "Please check vendor details and try again.",
        ),
        color: "danger",
      });
    }
  };

  const handleDeleteVendor = async () => {
    const vendorId = toNumberOrNull(selectedVendor?.id);

    if (!auditUserId) {
      addToast({
        title: "User ID is missing",
        color: "danger",
      });
      return;
    }

    if (!vendorId) {
      addToast({
        title: "Vendor ID is missing",
        color: "danger",
      });
      return;
    }

    try {
      await dispatch(
        deleteVendor({
          id: vendorId,
          userId: auditUserId,
        }),
      ).unwrap();

      addToast({
        title: "Vendor deleted successfully",
        color: "success",
      });

      deleteModal.onClose();
      setSelectedVendor(null);
      refetchVendors();
    } catch (error) {
      addToast({
        title: "Failed to delete vendor",
        description: getErrorMessage(
          error,
          "Please try again after some time.",
        ),
        color: "danger",
      });
    }
  };

  const filteredItems = useMemo(() => {
    const search = filterValue.trim().toLowerCase();

    if (!search) return data;

    return data.filter((item) => {
      return (
        item?.name?.toLowerCase().includes(search) ||
        item?.email?.toLowerCase().includes(search) ||
        item?.mobile?.toLowerCase().includes(search) ||
        item?.gstNumber?.toLowerCase().includes(search) ||
        item?.panNumber?.toLowerCase().includes(search) ||
        item?.status?.toLowerCase().includes(search)
      );
    });
  }, [data, filterValue]);

  const count = filteredItems.length;
  const pages = Math.ceil(count / pagination.size) || 1;

  const paginatedItems = useMemo(() => {
    const start = (pagination.page - 1) * pagination.size;
    const end = start + pagination.size;

    return filteredItems.slice(start, end);
  }, [filteredItems, pagination.page, pagination.size]);

  const sortedItems = useMemo(() => {
    return [...paginatedItems].sort((a, b) => {
      const firstValue = a?.[sortDescriptor.column] ?? "";
      const secondValue = b?.[sortDescriptor.column] ?? "";

      const first =
        typeof firstValue === "string" ? firstValue.toLowerCase() : firstValue;

      const second =
        typeof secondValue === "string"
          ? secondValue.toLowerCase()
          : secondValue;

      const cmp = first < second ? -1 : first > second ? 1 : 0;

      return sortDescriptor.direction === "descending" ? -cmp : cmp;
    });
  }, [paginatedItems, sortDescriptor]);

  const onSearchChange = useCallback((value) => {
    setFilterValue(value || "");
    setPagination((prev) => ({
      ...prev,
      page: 1,
    }));
    refetchVendors(search);
  }, []);

  const onClear = useCallback(() => {
    setFilterValue("");
    setPagination((prev) => ({
      ...prev,
      page: 1,
    }));
  }, []);

  const onRowsPerPageChange = useCallback((e) => {
    setPagination((prev) => ({
      ...prev,
      size: Number(e.target.value),
      page: 1,
    }));
  }, []);

  const onNextPage = useCallback(() => {
    if (pagination.page < pages) {
      setPagination((prev) => ({
        ...prev,
        page: prev.page + 1,
      }));
    }
  }, [pagination.page, pages]);

  const onPreviousPage = useCallback(() => {
    if (pagination.page > 1) {
      setPagination((prev) => ({
        ...prev,
        page: prev.page - 1,
      }));
    }
  }, [pagination.page]);

  const renderCell = useCallback((rowData, columnKey) => {
    switch (columnKey) {
      case "id":
        return (
          <span className="text-sm font-medium text-foreground">
            {rowData?.id || "-"}
          </span>
        );

      // case "vendorCode":
      //   return (
      //     <div className="flex flex-col">
      //       <span className="font-semibold text-foreground">
      //         {rowData?.vendorCode || "-"}
      //       </span>
      //       <span className="line-clamp-1 text-xs text-default-400">
      //         {rowData?.description || "No description"}
      //       </span>
      //     </div>
      //   );

      case "name":
        return (
          <span className="font-medium text-foreground">
            {rowData?.name || "-"}
          </span>
        );

      case "contact":
        return (
          <div className="flex flex-col">
            <span className="text-sm text-foreground">
              {rowData?.email || "-"}
            </span>
            <span className="text-xs text-default-400">
              {rowData?.mobile || "-"}
            </span>
          </div>
        );

      case "taxDetail":
        return (
          <div className="flex flex-col">
            <span className="text-sm text-foreground">
              GST: {rowData?.gstNumber || "-"}
            </span>
            <span className="text-xs text-default-400">
              PAN: {rowData?.panNumber || "-"}
            </span>
          </div>
        );

      case "status":
        return (
          <Chip
            size="sm"
            color={rowData?.status === "Active" ? "success" : "danger"}
            variant="flat"
          >
            {rowData?.status || "-"}
          </Chip>
        );

      case "verified":
        return (
          <Chip
            size="sm"
            color={rowData?.verified ? "success" : "warning"}
            variant="flat"
          >
            {rowData?.verified ? "Verified" : "Not Verified"}
          </Chip>
        );

      case "actions":
        return (
          <div className="flex items-center justify-center gap-2">
            <Dropdown>
              <DropdownTrigger>
                <Button isIconOnly size="sm" variant="light">
                  <EllipsisVertical className="h-4 w-4" />
                </Button>
              </DropdownTrigger>

              <DropdownMenu aria-label="Vendor actions">
                <DropdownItem
                  key="edit"
                  startContent={<Pencil className="h-4 w-4" />}
                  onPress={() => openEditModal(rowData)}
                >
                  Edit Vendor
                </DropdownItem>

                <DropdownItem
                  key="delete"
                  className="text-danger"
                  color="danger"
                  startContent={<Trash2 className="h-4 w-4" />}
                  onPress={() => openDeleteModal(rowData)}
                >
                  Delete Vendor
                </DropdownItem>
              </DropdownMenu>
            </Dropdown>
          </div>
        );

      default:
        return rowData?.[columnKey] || "-";
    }
  }, []);

  const topContent = useMemo(() => {
    return (
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <Input
            isClearable
            className="w-full sm:max-w-[430px]"
            placeholder="Search ..."
            startContent={<Search className="h-4 w-4 text-default-400" />}
            value={filterValue}
            onClear={onClear}
            onValueChange={onSearchChange}
          />

          <Button
            color="primary"
            startContent={<Plus className="h-4 w-4" />}
            onPress={openCreateModal}
          >
            Add Vendor
          </Button>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-small text-default-400">
            Total {count} vendors
          </span>

          <label className="flex items-center gap-2 text-small text-default-400">
            Rows per page:
            <select
              className="bg-transparent outline-none text-default-400 text-small"
              onChange={onRowsPerPageChange}
              value={pagination.size}
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
  }, [
    count,
    filterValue,
    onClear,
    onRowsPerPageChange,
    onSearchChange,
    pagination.size,
  ]);

  const bottomContent = useMemo(() => {
    return (
      <div className="flex items-center justify-between px-2 py-2">
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
          page={pagination.page}
          total={pages}
          onChange={(page) => {
            setPagination((prev) => ({
              ...prev,
              page,
            }));
          }}
        />

        <div className="hidden w-[30%] justify-end gap-2 sm:flex">
          <Button
            isDisabled={pagination.page === 1}
            size="sm"
            variant="flat"
            onPress={onPreviousPage}
          >
            Previous
          </Button>

          <Button
            isDisabled={pagination.page === pages}
            size="sm"
            variant="flat"
            onPress={onNextPage}
          >
            Next
          </Button>
        </div>
      </div>
    );
  }, [selectedKeys, count, pagination.page, pages, onPreviousPage, onNextPage]);

  const isSubmitLoading =
    createLoading === "pending" || updateLoading === "pending";

  return (
    <>
      <div className="mb-4 flex flex-col gap-1">
        <h1 className="font-sans text-2xl font-semibold text-foreground">
          Vendors List
        </h1>
      </div>
      {loading === "pending" && <LoadingSpinner />}
      <Table
        isHeaderSticky
        aria-label="Vendors table"
        bottomContent={bottomContent}
        bottomContentPlacement="outside"
        classNames={{
          wrapper: "max-h-[65vh] w-full rounded-xl border border-default-200",
          table: "min-w-full",
          th: "bg-default-100 text-xs font-semibold uppercase text-default-600",
          td: "py-3",
        }}
        selectedKeys={selectedKeys}
        selectionMode="multiple"
        sortDescriptor={sortDescriptor}
        topContent={topContent}
        topContentPlacement="outside"
        onSelectionChange={setSelectedKeys}
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

        <TableBody emptyContent="No vendors found" items={sortedItems}>
          {(item) => (
            <TableRow key={item.id || item.vendorCode}>
              {(columnKey) => (
                <TableCell>{renderCell(item, columnKey)}</TableCell>
              )}
            </TableRow>
          )}
        </TableBody>
      </Table>

      <Modal
        isOpen={vendorModal.isOpen}
        onOpenChange={vendorModal.onOpenChange}
        size="4xl"
        scrollBehavior="inside"
        isDismissable={false}
      >
        <ModalContent>
          {(modalClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1 border-b border-default-200">
                <span className="text-xl font-semibold">
                  {modalMode === "edit" ? "Update Vendor" : "Create New Vendor"}
                </span>
                <span className="text-sm font-normal text-default-500">
                  {modalMode === "edit"
                    ? "Update vendor details as per operation vendor master."
                    : "Fill vendor details as per operation vendor master."}
                </span>
              </ModalHeader>

              <ModalBody className="py-5">
                <Form className="w-full" onSubmit={handleSubmitVendor}>
                  <div className="grid w-full grid-cols-1 gap-4 md:grid-cols-2">
                    <Input
                      isRequired
                      label="Vendor Name"
                      name="name"
                      placeholder="Enter vendor company name"
                      value={vendorForm.name}
                      onValueChange={(value) =>
                        handleInputChange("name", value)
                      }
                    />

                    <Input
                      isRequired
                      type="email"
                      label="Email"
                      name="email"
                      placeholder="vendor@example.com"
                      value={vendorForm.email}
                      onValueChange={(value) =>
                        handleInputChange("email", value)
                      }
                    />

                    <Input
                      isRequired
                      label="Mobile"
                      name="mobile"
                      placeholder="Enter mobile number"
                      value={vendorForm.mobile}
                      onValueChange={(value) =>
                        handleInputChange("mobile", allowOnlyNumbers(value))
                      }
                    />

                    <Input
                      isRequired
                      label="GST Number"
                      name="gstNumber"
                      placeholder="Enter GST number"
                      value={vendorForm.gstNumber}
                      maxLength={15}
                      onValueChange={(value) =>
                        handleInputChange("gstNumber", formatGSTInput(value))
                      }
                    />

                    <Input
                      isRequired
                      label="PAN Number"
                      name="panNumber"
                      placeholder="Enter PAN number"
                      value={vendorForm.panNumber}
                      onValueChange={(value) =>
                        handleInputChange("panNumber", formatPANInput(value))
                      }
                    />

                    <Select
                      isRequired
                      label="Status"
                      name="status"
                      selectedKeys={new Set([vendorForm.status])}
                      onSelectionChange={(keys) => {
                        const selected = Array.from(keys)[0];
                        handleInputChange("status", selected);
                      }}
                    >
                      <SelectItem key="ACTIVE">ACTIVE</SelectItem>
                      <SelectItem key="INACTIVE">INACTIVE</SelectItem>
                    </Select>

                    <Select
                      isRequired
                      label="Verified"
                      name="verified"
                      selectedKeys={new Set([vendorForm.verified])}
                      onSelectionChange={(keys) => {
                        const selected = Array.from(keys)[0];
                        handleInputChange("verified", selected);
                      }}
                    >
                      <SelectItem key="true">Verified</SelectItem>
                      <SelectItem key="false">Not Verified</SelectItem>
                    </Select>

                    <Textarea
                      className="md:col-span-2"
                      label="Description"
                      name="description"
                      placeholder="Enter vendor description"
                      minRows={3}
                      value={vendorForm.description}
                      onValueChange={(value) =>
                        handleInputChange("description", value)
                      }
                    />
                  </div>

                  <ModalFooter className="mt-4 flex w-full justify-end gap-2 border-t border-default-200 px-0 pt-4">
                    <Button
                      variant="flat"
                      onPress={() => {
                        resetForm();
                        modalClose();
                      }}
                    >
                      Cancel
                    </Button>

                    <Button
                      color="primary"
                      type="submit"
                      isLoading={isSubmitLoading}
                    >
                      {modalMode === "edit" ? "Update Vendor" : "Create Vendor"}
                    </Button>
                  </ModalFooter>
                </Form>
              </ModalBody>
            </>
          )}
        </ModalContent>
      </Modal>

      <Modal
        isOpen={deleteModal.isOpen}
        onOpenChange={deleteModal.onOpenChange}
        size="md"
        isDismissable={false}
      >
        <ModalContent>
          {(modalClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                Delete Vendor
              </ModalHeader>

              <ModalBody>
                <p className="text-sm text-default-600">
                  Are you sure you want to delete this vendor?
                </p>

                <div className="rounded-lg border border-danger-100 bg-danger-50 p-3">
                  <p className="font-semibold text-danger">
                    {selectedVendor?.name || "-"}
                  </p>
                  <p className="text-xs text-danger-600">
                    Vendor Code: {selectedVendor?.vendorCode || "-"}
                  </p>
                </div>
              </ModalBody>

              <ModalFooter>
                <Button
                  variant="flat"
                  onPress={() => {
                    setSelectedVendor(null);
                    modalClose();
                  }}
                >
                  Cancel
                </Button>

                <Button
                  color="danger"
                  isLoading={deleteLoading === "pending"}
                  onPress={handleDeleteVendor}
                >
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

export default Vendors;
