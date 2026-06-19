import React, { useCallback, useEffect } from "react";
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
  ModalFooter,
  Textarea,
  addToast,
} from "@heroui/react";
import { ChevronDown, Plus, Search, MoreVertical } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { importServiceCheckListDocument } from "../../toolkit/slices/operationSlice";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import * as z from "zod";
import { useMediaQuery } from "react-responsive";
import NewSelect from "../../components/NewSelect";
import {
  getAllCitiesByStateName,
  getAllCountries,
  getAllStatesByCountryName,
} from "../../toolkit/slices/commonSlice";
import {
  createDocumentsForProduct,
  getAllDocumentsForProduct,

  // dummy imports - create these in productSlice
  updateDocumentsForProduct,
  deleteDocumentsForProduct,
} from "../../toolkit/slices/productSlice";
import { useParams } from "react-router-dom";
import dayjs from "dayjs";
import FileUploader from "../../components/FileUploader";

export const columns = [
  { name: "ID", uid: "id", sortable: true },
  { name: "NAME", uid: "name" },
  { name: "TYPE", uid: "type" },
  { name: "APPLICABILITY", uid: "applicability" },
  { name: "STATE", uid: "stateName" },
  { name: "CENTRAL NAME", uid: "centralName" },
  { name: "COUNTRY", uid: "country" },
  { name: "ALLOWED FORMATS", uid: "allowedFormats" },
  { name: "EXPIRY TYPE", uid: "expiryType" },
  { name: "VALIDITY", uid: "maxValidityYears" },
  { name: "DESCRIPTION", uid: "description" },
  { name: "REMARKS", uid: "remarks" },
  { name: "CREATED DATE", uid: "createdDate" },
  { name: "ACTIONS", uid: "actions" },
];

export function capitalize(s) {
  return s ? s.charAt(0).toUpperCase() + s.slice(1).toLowerCase() : "";
}

const INITIAL_VISIBLE_COLUMNS = [
  "id",
  "name",
  "type",
  "applicability",
  "stateName",
  "centralName",
  "country",
  "allowedFormats",
  "expiryType",
  "maxValidityYears",
  "description",
  "remarks",
  "createdDate",
  "actions",
];

const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional().default(""),
  type: z.string().min(1, "Type is required"),
  country: z.string().min(1, "Country is required"),
  centralName: z.string().min(1, "Central name is required"),
  stateName: z.string().min(1, "State name is required"),
  expiryType: z.enum(["FIXED", "EXPIRING", "UNKNOWN"]),
  mandatory: z.boolean(),
  maxValidityYears: z.coerce.number().min(0),
  expiryTypeDescription: z.string().optional().default(""),
  applicability: z.string().min(1, "Applicability is required"),
  maxFileSizeKb: z.coerce.number().min(0),
  allowedFormats: z.string().min(1, "Allowed formats are required"),
  remarks: z.string().optional().default(""),
  createdBy: z.coerce.number().default(0),
  updatedBy: z.coerce.number().default(0),
  active: z.boolean().default(true),
});

const defaultValues = {
  name: "",
  description: "",
  type: "",
  country: "",
  centralName: "",
  stateName: "",
  expiryType: "FIXED",
  mandatory: false,
  maxValidityYears: 0,
  expiryTypeDescription: "",
  applicability: "",
  maxFileSizeKb: 0,
  allowedFormats: "",
  createdBy: 0,
  updatedBy: 0,
  remarks: "",
  active: true,
};

const Documents = () => {
  const dispatch = useDispatch();
  const { userId } = useParams();

  const { isOpen, onClose, onOpen, onOpenChange } = useDisclosure();
  const updateModal = useDisclosure();
  const deleteModal = useDisclosure();
  const uploadModal = useDisclosure();

  const data = useSelector((state) => state.product.allDocumentList) || [];
  const count = useSelector((state) => state.product.allDocumentList?.length);
  const countryList = useSelector((state) => state.common.countriesList);
  const statesList = useSelector((state) => state.common.statesList);

  const [filterValue, setFilterValue] = React.useState("");
  const [selectedKeys, setSelectedKeys] = React.useState(new Set([]));
  const [visibleColumns, setVisibleColumns] = React.useState(
    new Set(INITIAL_VISIBLE_COLUMNS),
  );

  const [rowsPerPage, setRowsPerPage] = React.useState(50);
  const [sortDescriptor, setSortDescriptor] = React.useState({
    column: "id",
    direction: "ascending",
  });

  const [fileUrl, setFileUrl] = React.useState("");
  const [page, setPage] = React.useState(1);
  const [selectedDocument, setSelectedDocument] = React.useState(null);

  const hasSearchFilter = Boolean(filterValue);
  const isMedium = useMediaQuery({ minWidth: 768, maxWidth: 1535 });
  const isLarge = useMediaQuery({ minWidth: 1536 });

  useEffect(() => {
    dispatch(getAllDocumentsForProduct({ page, size: rowsPerPage, userId }));
    dispatch(getAllCountries());
  }, [dispatch, page, rowsPerPage, userId]);

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: zodResolver(formSchema),
    defaultValues,
  });

  const {
    control: updateControl,
    handleSubmit: handleUpdateSubmit,
    formState: { errors: updateErrors },
    reset: updateReset,
  } = useForm({
    resolver: zodResolver(formSchema),
    defaultValues,
  });

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
          String(val)?.toLowerCase().includes(filterValue.toLowerCase()),
        ),
      );
    }

    return filteredUsers;
  }, [data, filterValue, hasSearchFilter]);

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

  const refreshDocuments = useCallback(() => {
    dispatch(getAllDocumentsForProduct({ page, size: rowsPerPage, userId }));
  }, [dispatch, page, rowsPerPage, userId]);

  const onSubmit = useCallback(
    (values) => {
      dispatch(
        createDocumentsForProduct({
          ...values,
          createdBy: Number(userId),
          updatedBy: Number(userId),
          productIds: [Number(userId)],
        }),
      )
        .then((resp) => {
          if (resp.meta.requestStatus === "fulfilled") {
            addToast({
              title: "Document created successfully!",
              color: "success",
            });
            refreshDocuments();
            onClose();
            reset(defaultValues);
          } else {
            addToast({
              title: resp.payload?.status || "Something went wrong",
              color: "danger",
              description: resp.payload?.message,
            });
          }
        })
        .catch(() =>
          addToast({ title: "Something went wrong!", color: "danger" }),
        );
    },
    [dispatch, onClose, reset, userId, refreshDocuments],
  );

  const handleOpenUpdateModal = useCallback(
    (rowData) => {
      setSelectedDocument(rowData);

      updateReset({
        name: rowData?.name || "",
        description: rowData?.description || "",
        type: rowData?.type || "",
        country: rowData?.country || "",
        centralName: rowData?.centralName || "",
        stateName: rowData?.stateName || "",
        expiryType: rowData?.expiryType || "FIXED",
        mandatory: Boolean(rowData?.mandatory),
        maxValidityYears: rowData?.maxValidityYears || 0,
        expiryTypeDescription: rowData?.expiryTypeDescription || "",
        applicability: rowData?.applicability || "",
        maxFileSizeKb: rowData?.maxFileSizeKb || 0,
        allowedFormats: rowData?.allowedFormats || "",
        remarks: rowData?.remarks || "",
        createdBy: rowData?.createdBy || 0,
        updatedBy: Number(userId),
        active: rowData?.active ?? true,
      });

      if (rowData?.country) {
        dispatch(getAllStatesByCountryName(rowData.country));
      }

      updateModal.onOpen();
    },
    [updateReset, updateModal, userId, dispatch],
  );

  const handleUpdateDocument = useCallback(
    (values) => {
      if (!selectedDocument?.id) {
        addToast({
          title: "Document ID not found",
          color: "danger",
        });
        return;
      }

      const updateBody = {
        id: selectedDocument.id,
        name: values.name,
        description: values.description,
        type: values.type,
        country: values.country,
        centralName: values.centralName,
        stateName: values.stateName,
        expiryType: values.expiryType,
        maxValidityYears: String(values.maxValidityYears),
        expiryTypeDescription: values.expiryTypeDescription,
        allowedFormats: values.allowedFormats,
        applicability: values.applicability,
        remarks: values.remarks,
        createdBy: selectedDocument.createdBy || 0,
        updatedBy: Number(userId),
        createdDate: selectedDocument.createdDate || new Date().toISOString(),
        updatedDate: new Date().toISOString(),
        maxFileSizeKb: Number(values.maxFileSizeKb),
        active: values.active,
        mandatory: values.mandatory,
      };

      dispatch(
        updateDocumentsForProduct({
          id: selectedDocument.id,
          data: updateBody,
        }),
      )
        .then((resp) => {
          if (resp.meta.requestStatus === "fulfilled") {
            addToast({
              title: "Document updated successfully!",
              color: "success",
            });
            updateModal.onClose();
            setSelectedDocument(null);
            refreshDocuments();
          } else {
            addToast({
              title: resp.payload?.status || "Update failed",
              color: "danger",
              description: resp.payload?.message,
            });
          }
        })
        .catch(() =>
          addToast({ title: "Something went wrong!", color: "danger" }),
        );
    },
    [dispatch, selectedDocument, userId, updateModal, refreshDocuments],
  );

  const handleOpenDeleteModal = useCallback(
    (rowData) => {
      setSelectedDocument(rowData);
      deleteModal.onOpen();
    },
    [deleteModal],
  );

  const handleDeleteDocument = useCallback(() => {
    if (!selectedDocument?.id) {
      addToast({
        title: "Document ID not found",
        color: "danger",
      });
      return;
    }

    dispatch(deleteDocumentsForProduct(selectedDocument.id))
      .then((resp) => {
        if (resp.meta.requestStatus === "fulfilled") {
          addToast({
            title: "Document deleted successfully!",
            color: "success",
          });
          deleteModal.onClose();
          setSelectedDocument(null);
          refreshDocuments();
        } else {
          addToast({
            title: resp.payload?.status || "Delete failed",
            color: "danger",
            description: resp.payload?.message,
          });
        }
      })
      .catch(() =>
        addToast({ title: "Something went wrong!", color: "danger" }),
      );
  }, [dispatch, selectedDocument, deleteModal, refreshDocuments]);

  const handleSubmitUploadDoc = useCallback(() => {
    dispatch(importServiceCheckListDocument({ fileUrl, userId }))
      .then((resp) => {
        if (resp.meta.requestStatus === "fulfilled") {
          addToast({
            title: "Document uploaded successfully!",
            color: "success",
          });
          setFileUrl("");
          uploadModal.onClose();
          refreshDocuments();
        } else {
          addToast({ title: "Something went wrong!", color: "danger" });
        }
      })
      .catch(() =>
        addToast({ title: "Something went wrong!", color: "danger" }),
      );
  }, [dispatch, fileUrl, userId, uploadModal, refreshDocuments]);

  const renderCell = React.useCallback(
    (rowData, columnKey) => {
      const cellValue = rowData[columnKey];

      switch (columnKey) {
        case "name":
          return <p>{rowData?.name}</p>;

        case "type":
          return (
            <div>
              <p>{rowData?.type}</p>
              {rowData?.maxFileSizeKb && (
                <span className="text-tiny text-gray-400">
                  Max size: {rowData?.maxFileSizeKb} kb
                </span>
              )}
            </div>
          );

        case "description":
          return (
            <div className="flex flex-wrap text-tiny">
              {rowData?.description}
            </div>
          );

        case "maxValidityYears":
          return <div className="flex">{rowData?.maxValidityYears} yrs</div>;

        case "createdDate":
          return (
            <div className="flex flex-wrap text-tiny">
              {rowData?.createdDate
                ? dayjs(rowData?.createdDate).format("DD-MM-YYYY")
                : "-"}
            </div>
          );

        case "actions":
          return (
            <Dropdown>
              <DropdownTrigger>
                <Button isIconOnly size="sm" variant="light">
                  <MoreVertical size={18} />
                </Button>
              </DropdownTrigger>
              <DropdownMenu aria-label="Document actions">
                <DropdownItem
                  key="update"
                  onPress={() => handleOpenUpdateModal(rowData)}
                >
                  Update
                </DropdownItem>
                <DropdownItem
                  key="delete"
                  color="danger"
                  className="text-danger"
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
    [handleOpenUpdateModal, handleOpenDeleteModal],
  );

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
            onClear={onClear}
            onValueChange={onSearchChange}
          />

          <div className="flex gap-3">
            <Button variant="flat" onPress={uploadModal.onOpen}>
              Import Document List
            </Button>

            <Button
              endContent={<Plus />}
              color="primary"
              onPress={onOpen}
              size={isMedium ? "sm" : isLarge ? "md" : ""}
            >
              Add
            </Button>

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
          </div>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-default-400 text-small">
            Total {count || 0} documents
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
    onClear,
    uploadModal,
    onOpen,
    isMedium,
    isLarge,
  ]);

  const bottomContent = React.useMemo(() => {
    return (
      <div className="py-2 px-2 flex justify-between items-center">
        <span className="w-[30%] text-small text-default-400">
          {selectedKeys === "all"
            ? "All items selected"
            : `${selectedKeys.size} of ${count || 0} selected`}
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
  }, [selectedKeys, count, page, pages, onPreviousPage, onNextPage]);

  const renderDocumentFormFields = (
    formControl,
    formErrors,
    isUpdate = false,
  ) => (
    <div className="grid grid-cols-2 gap-4 max-h-[60vh] overflow-auto">
      <Controller
        name="name"
        control={formControl}
        render={({ field }) => (
          <Input
            isRequired
            label="Name"
            errorMessage={formErrors.name?.message}
            {...field}
          />
        )}
      />

      <Controller
        name="type"
        control={formControl}
        render={({ field }) => (
          <Input
            isRequired
            label="Type"
            errorMessage={formErrors.type?.message}
            {...field}
          />
        )}
      />

      <Controller
        name="country"
        control={formControl}
        render={({ field }) => (
          <NewSelect
            data={countryList}
            isRequired
            label="Country"
            labelKey="name"
            valueKey="name"
            errorMessage={formErrors.country?.message}
            {...field}
            onChange={(value) => {
              field.onChange(value);
              dispatch(getAllStatesByCountryName(value));
            }}
          />
        )}
      />

      <Controller
        name="stateName"
        control={formControl}
        render={({ field }) => (
          <NewSelect
            data={statesList}
            isRequired
            label="State"
            labelKey="name"
            valueKey="name"
            errorMessage={formErrors.stateName?.message}
            {...field}
            onChange={(value) => {
              field.onChange(value);
              dispatch(getAllCitiesByStateName(value));
            }}
          />
        )}
      />

      <Controller
        name="centralName"
        control={formControl}
        render={({ field }) => (
          <Input
            isRequired
            label="Central Name"
            errorMessage={formErrors.centralName?.message}
            {...field}
          />
        )}
      />

      <Controller
        name="expiryType"
        control={formControl}
        render={({ field }) => (
          <NewSelect
            label="Expiry Type"
            isRequired
            errorMessage={formErrors.expiryType?.message}
            data={[
              { label: "FIXED", value: "FIXED" },
              { label: "EXPIRING", value: "EXPIRING" },
              { label: "UNKNOWN", value: "UNKNOWN" },
            ]}
            labelKey="label"
            valueKey="value"
            value={field.value}
            onChange={(val) => field.onChange(val)}
          />
        )}
      />

      <Controller
        name="mandatory"
        control={formControl}
        render={({ field }) => (
          <NewSelect
            isRequired
            label="Is Mandatory?"
            labelKey="label"
            valueKey="value"
            errorMessage={formErrors.mandatory?.message}
            data={[
              { label: "Yes", value: "true" },
              { label: "No", value: "false" },
            ]}
            value={String(field.value)}
            onChange={(val) => field.onChange(val === "true")}
          />
        )}
      />

      <Controller
        name="maxValidityYears"
        control={formControl}
        render={({ field }) => (
          <Input
            type="number"
            isRequired
            errorMessage={formErrors.maxValidityYears?.message}
            label="Max Validity (Years)"
            {...field}
          />
        )}
      />

      <Controller
        name="expiryTypeDescription"
        control={formControl}
        render={({ field }) => (
          <Input
            label="Expiry Type Description"
            errorMessage={formErrors.expiryTypeDescription?.message}
            {...field}
          />
        )}
      />

      <Controller
        name="applicability"
        control={formControl}
        render={({ field }) => (
          <Input
            isRequired
            errorMessage={formErrors.applicability?.message}
            label="Applicability"
            {...field}
          />
        )}
      />

      <Controller
        name="maxFileSizeKb"
        control={formControl}
        render={({ field }) => (
          <Input
            type="number"
            isRequired
            errorMessage={formErrors.maxFileSizeKb?.message}
            label="Max File Size (KB)"
            {...field}
          />
        )}
      />

      <Controller
        name="allowedFormats"
        control={formControl}
        render={({ field }) => (
          <Input
            isRequired
            errorMessage={formErrors.allowedFormats?.message}
            label="Allowed Formats"
            {...field}
          />
        )}
      />

      {isUpdate && (
        <Controller
          name="active"
          control={formControl}
          render={({ field }) => (
            <NewSelect
              isRequired
              label="Status"
              labelKey="label"
              valueKey="value"
              errorMessage={formErrors.active?.message}
              data={[
                { label: "Active", value: "true" },
                { label: "Inactive", value: "false" },
              ]}
              value={String(field.value)}
              onChange={(val) => field.onChange(val === "true")}
            />
          )}
        />
      )}

      <Controller
        name="description"
        control={formControl}
        render={({ field }) => (
          <Textarea
            label="Description"
            errorMessage={formErrors.description?.message}
            {...field}
          />
        )}
      />

      <Controller
        name="remarks"
        control={formControl}
        render={({ field }) => (
          <Textarea
            label="Remarks"
            errorMessage={formErrors.remarks?.message}
            {...field}
          />
        )}
      />
    </div>
  );

  return (
    <>
      <h1 className="font-sans text-2xl font-medium mb-1">Documents list</h1>

      <Table
        isHeaderSticky
        aria-label="Documents table"
        bottomContent={bottomContent}
        bottomContentPlacement="outside"
        classNames={{
          wrapper: "max-h-[65vh] w-full",
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

      {/* Add Modal */}
      <Modal
        size="2xl"
        isDismissable={false}
        isKeyboardDismissDisabled={true}
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        placement="top-center"
      >
        <ModalContent>
          {(modalClose) => (
            <>
              <ModalHeader>Add Document</ModalHeader>
              <ModalBody>
                <form onSubmit={handleSubmit(onSubmit)}>
                  {renderDocumentFormFields(control, errors)}

                  <ModalFooter className="flex justify-end">
                    <Button onPress={modalClose}>Cancel</Button>
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

      {/* Update Modal */}
      <Modal
        size="2xl"
        isDismissable={false}
        isKeyboardDismissDisabled={true}
        isOpen={updateModal.isOpen}
        onOpenChange={updateModal.onOpenChange}
        placement="top-center"
      >
        <ModalContent>
          {(modalClose) => (
            <>
              <ModalHeader>Update Document</ModalHeader>
              <ModalBody>
                <form onSubmit={handleUpdateSubmit(handleUpdateDocument)}>
                  {renderDocumentFormFields(updateControl, updateErrors, true)}

                  <ModalFooter className="flex justify-end">
                    <Button
                      onPress={() => {
                        setSelectedDocument(null);
                        modalClose();
                      }}
                    >
                      Cancel
                    </Button>
                    <Button color="primary" type="submit">
                      Update
                    </Button>
                  </ModalFooter>
                </form>
              </ModalBody>
            </>
          )}
        </ModalContent>
      </Modal>

      {/* Delete Modal */}
      <Modal
        isOpen={deleteModal.isOpen}
        onOpenChange={deleteModal.onOpenChange}
        size="md"
      >
        <ModalContent>
          {(modalClose) => (
            <>
              <ModalHeader>Delete Document</ModalHeader>
              <ModalBody>
                <p>
                  Are you sure you want to delete{" "}
                  <span className="font-semibold">
                    {selectedDocument?.name || "this document"}
                  </span>
                  ?
                </p>

                <ModalFooter className="flex justify-end gap-2">
                  <Button
                    variant="flat"
                    onPress={() => {
                      setSelectedDocument(null);
                      modalClose();
                    }}
                  >
                    Cancel
                  </Button>

                  <Button color="danger" onPress={handleDeleteDocument}>
                    Delete
                  </Button>
                </ModalFooter>
              </ModalBody>
            </>
          )}
        </ModalContent>
      </Modal>

      {/* Upload Modal */}
      <Modal
        isOpen={uploadModal.isOpen}
        onOpenChange={uploadModal.onOpenChange}
        size="xl"
      >
        <ModalContent>
          {(modalClose) => (
            <>
              <ModalHeader>Upload Document</ModalHeader>
              <ModalBody className="w-full">
                <div className="flex flex-col gap-4">
                  <FileUploader
                    value={fileUrl}
                    onChange={(e) => setFileUrl(e)}
                  />

                  <div>
                    <a
                      className="text-primary-500"
                      href="https://erp-corpseed.s3.ap-south-1.amazonaws.com/1774522458689test_doc_(1).xlsx"
                    >
                      Download the sample document
                    </a>
                  </div>
                </div>

                <ModalFooter className="flex justify-end gap-2 w-full">
                  <Button onPress={modalClose}>Cancel</Button>
                  <Button
                    color="primary"
                    isDisabled={!fileUrl}
                    onPress={handleSubmitUploadDoc}
                  >
                    Submit
                  </Button>
                </ModalFooter>
              </ModalBody>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
};

export default Documents;
