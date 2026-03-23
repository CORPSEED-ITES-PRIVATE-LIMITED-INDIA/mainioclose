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
import { ChevronDown, Plus, Search } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import {
  createMileStone,
  getAllMilestones,
  importServiceCheckListDocument,
} from "../../toolkit/slices/operationSlice";
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
} from "../../toolkit/slices/productSlice";
import { useParams } from "react-router-dom";
import dayjs from "dayjs";
import FileUploader from "../../components/FileUploader";

export const columns = [
  { name: "ID", uid: "id", sortable: true },
  { name: "NAME", uid: "name" },
  { name: "TYPE", uid: "type" },
  { name: "STATE", uid: "stateName" },
  { name: "CENTRAL NAME", uid: "centralName" },
  { name: "COUNTRY", uid: "country" },
  { name: "ALLOWED FORMATS", uid: "allowedFormats" },
  { name: "EXPIRY TYPE", uid: "expiryType" },
  { name: "VALIDITY", uid: "maxValidityYears" },
  { name: "DESCRIPTION", uid: "description" },
  { name: "CREATED DATE", uid: "createdDate" },
];

export function capitalize(s) {
  return s ? s.charAt(0).toUpperCase() + s.slice(1).toLowerCase() : "";
}

const INITIAL_VISIBLE_COLUMNS = [
  "id",
  "name",
  "type",
  "stateName",
  "centralName",
  "country",
  "allowedFormats",
  "expiryType",
  "maxValidityYears",
  "description",
  "createdDate",
];

const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().min(1, "Description is required"),
  type: z.string().min(1, "Type is required"),
  country: z.string().min(1, "Country is required"),
  centralName: z.string().min(1, "Central name is required"),
  stateName: z.string().min(1, "State name is required"),
  expiryType: z.enum(["FIXED", "ROLLING"]),
  mandatory: z.boolean(),
  maxValidityYears: z.coerce.number().min(0),
  minFileSizeKb: z.coerce.number().min(0),
  allowedFormats: z.string().min(1, "Allowed formats are required"),
  createdBy: z.number().default(0),
  updatedBy: z.number().default(0),
  productIds: z.array(z.number()).optional().default([]),
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
  minFileSizeKb: 0,
  allowedFormats: "",
  createdBy: 0,
  updatedBy: 0,
  productIds: [],
};

const Documents = () => {
  const dispatch = useDispatch();
  const { userId } = useParams();
  const { isOpen, onClose, onOpen, onOpenChange } = useDisclosure();
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
  const hasSearchFilter = Boolean(filterValue);
  const isMedium = useMediaQuery({ minWidth: 768, maxWidth: 1535 });
  const isLarge = useMediaQuery({ minWidth: 1536 });

  useEffect(() => {
    dispatch(getAllDocumentsForProduct({ page, size: rowsPerPage, userId }));
    dispatch(getAllCountries());
  }, [dispatch, page, rowsPerPage]);

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
      dispatch(
        createDocumentsForProduct({
          ...values,
          createdBy: userId,
          updatedBy: userId,
          productIds: userId,
        }),
      )
        .then((resp) => {
          if (resp.meta.requestStatus === "fulfilled") {
            addToast({
              title: "Milestone created successfully !.",
              color: "success",
            });
            dispatch(
              getAllDocumentsForProduct({ page, size: rowsPerPage, userId }),
            );
            onClose();
            reset(defaultValues);
          } else {
            addToast({
              title: resp.payload.status,
              color: "danger",
              description: resp.payload.message,
            });
          }
        })
        .catch(() =>
          addToast({ title: "Something went wrong !.", color: "danger" }),
        );
    },
    [dispatch, onClose, reset, userId],
  );

  const handleSubmitUploadDoc = useCallback(() => {
    dispatch(importServiceCheckListDocument({ fileUrl, userId }))
      .then((resp) => {
        if (resp.meta.requestStatus === "fulfilled") {
          addToast({
            title: "Document uploaded successfully !.",
            color: "success",
          });
          setFileUrl("");
          uploadModal.onOpenChange(false);
          dispatch(
            getAllDocumentsForProduct({ page, size: rowsPerPage, userId }),
          );
        } else {
          addToast({ title: "Something went wrong !.", color: "danger" });
        }
      })
      .catch(() =>
        addToast({ title: "Something went wrong !.", color: "danger" }),
      );
  }, [dispatch, fileUrl]);

  const renderCell = React.useCallback((rowData, columnKey) => {
    const cellValue = rowData[columnKey];
    switch (columnKey) {
      case "name":
        return <p>{rowData?.name} </p>;
      case "description":
        return (
          <div className="flex flex-wrap text-tiny">{rowData?.description}</div>
        );
      case "maxValidityYears":
        return <div className="flex">{rowData?.maxValidityYears} yrs</div>;
      case "createdDate":
        return (
          <div className="flex flex-wrap text-tiny">
            {dayjs(rowData?.createdDate).format("DD-MM-YYYY")}
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
            <Button variant="flat" onPress={uploadModal.onOpen}>
              Import document List
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
            Total {count} documents
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
  }, [selectedKeys, count, page, pages, hasSearchFilter]);

  return (
    <>
      <h1 className="font-sans text-2xl font-medium mb-1">Documents list</h1>
      <Table
        isHeaderSticky
        aria-label="Example table with custom cells, pagination and sorting"
        bottomContent={bottomContent}
        bottomContentPlacement="outside"
        classNames={{
          wrapper: "max-h-[68vh] w-full",
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
              <ModalHeader>Add Document</ModalHeader>
              <ModalBody>
                <form onSubmit={handleSubmit(onSubmit)}>
                  <div className="grid grid-cols-2 gap-4 max-h-[60vh] overflow-auto">
                    {/* name */}
                    <Controller
                      name="name"
                      control={control}
                      render={({ field }) => (
                        <Input
                          isRequired
                          label="Name"
                          errorMessage={errors.name?.message}
                          {...field}
                        />
                      )}
                    />

                    {/* type */}
                    <Controller
                      name="type"
                      control={control}
                      render={({ field }) => (
                        <Input
                          isRequired
                          label="Type"
                          errorMessage={errors.type?.message}
                          {...field}
                        />
                      )}
                    />

                    <Controller
                      name="country"
                      control={control}
                      render={({ field }) => (
                        <NewSelect
                          data={countryList}
                          isRequired
                          label="Country"
                          labelKey="name"
                          valueKey="name"
                          errorMessage={errors.country?.message}
                          {...field}
                          onChange={(value) => {
                            field.onChange(value);
                            dispatch(getAllStatesByCountryName(value));
                          }}
                        />
                      )}
                    />

                    {/* stateName */}
                    <Controller
                      name="stateName"
                      control={control}
                      render={({ field }) => (
                        <NewSelect
                          data={statesList}
                          isRequired
                          label="State"
                          labelKey="name"
                          valueKey="name"
                          errorMessage={errors.state?.message}
                          {...field}
                          onChange={(value) => {
                            field.onChange(value);
                            dispatch(getAllCitiesByStateName(value));
                          }}
                        />
                      )}
                    />

                    {/* centralName */}
                    <Controller
                      name="centralName"
                      isRequired
                      control={control}
                      render={({ field }) => (
                        <Input
                          isRequired
                          label="Central Name"
                          errorMessage={errors.centralName?.message}
                          {...field}
                        />
                      )}
                    />

                    {/* expiryType */}
                    <Controller
                      name="expiryType"
                      control={control}
                      render={({ field }) => (
                        <NewSelect
                          label="Expiry Type"
                          isRequired
                          errorMessage={errors.expiryType?.message}
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

                    {/* isMandatory */}
                    <Controller
                      name="mandatory"
                      control={control}
                      render={({ field }) => (
                        <NewSelect
                          isRequired
                          label="Is Mandatory?"
                          labelKey="label"
                          valueKey="value"
                          errorMessage={errors.mandatory?.message}
                          data={[
                            { label: "Yes", value: true },
                            { label: "No", value: false },
                          ]}
                          value={String(field.value)}
                          onChange={(val) => field.onChange(val === "true")}
                        />
                      )}
                    />

                    {/* maxValidityYears */}
                    <Controller
                      name="maxValidityYears"
                      control={control}
                      render={({ field }) => (
                        <Input
                          type="number"
                          isRequired
                          errorMessage={errors.maxValidityYears?.message}
                          label="Max Validity (Years)"
                          {...field}
                        />
                      )}
                    />

                    {/* minFileSizeKb */}
                    <Controller
                      name="minFileSizeKb"
                      control={control}
                      render={({ field }) => (
                        <Input
                          type="number"
                          isRequired
                          errorMessage={errors.minFileSizeKb?.message}
                          label="Min File Size (KB)"
                          {...field}
                        />
                      )}
                    />

                    <Controller
                      name="allowedFormats"
                      control={control}
                      render={({ field }) => (
                        <Input
                          isRequired
                          errorMessage={errors.allowedFormats?.message}
                          label="Allowed Formats (e.g., pdf, jpg, docx)"
                          {...field}
                        />
                      )}
                    />

                    {/* description */}
                    <Controller
                      name="description"
                      control={control}
                      render={({ field }) => (
                        <Textarea
                          isRequired
                          label="Description"
                          errorMessage={errors.description?.message}
                          {...field}
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
        isOpen={uploadModal.isOpen}
        onOpenChange={uploadModal.onOpenChange}
        size="xl"
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader>Upload document</ModalHeader>
              <ModalBody className="w-full">
                <div className="flex flex-col gap-4">
                  <FileUploader
                    value={fileUrl}
                    onChange={(e) => setFileUrl(e)}
                  />
                  <div>
                    <a
                      className="text-primary-500"
                      href="https://erp-corpseed.s3.ap-south-1.amazonaws.com/1773809109318test_doc.xlsx"
                    >
                      Download the sample document
                    </a>
                  </div>
                </div>
                <ModalFooter className="flex justify-end gap-2 w-full">
                  <Button onPress={onClose}>Cancel</Button>
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
