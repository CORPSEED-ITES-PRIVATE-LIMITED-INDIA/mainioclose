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
} from "@heroui/react";
import { useDispatch, useSelector } from "react-redux";
import {
  createProposalTemplate,
  editProposalAndEmailTemplate,
  getAllProposalAndEmailTemplates,
} from "../../toolkit/slices/settingSlice";
import { ChevronDown, EllipsisVertical, Plus, Search } from "lucide-react";
import * as z from "zod";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

const formSchema = z.object({
  name: z.string().min(1, "please enter the name."),
  body: z.string().optional(),
  description: z.string().optional(),
});

const defaultValues = {
  name: "",
  body: "",
  description: "",
};

export const columns = [
  { name: "ID", uid: "id" },
  { name: "NAME", uid: "name" },
  { name: "EMAIL BODY", uid: "emailBody" },
  { name: "TEMPLATE", uid: "description" },
  { name: "ACTIONS", uid: "actions" },
];

export function capitalize(s) {
  return s ? s.charAt(0).toUpperCase() + s.slice(1).toLowerCase() : "";
}

const INITIAL_VISIBLE_COLUMNS = [
  "id",
  "name",
  "emailBody",
  "description",
  "actions",
];

const TemplatesAndEmailBody = () => {
  const dispatch = useDispatch();
  const data = useSelector((state) => state.setting.templateAndMailList);
  const count = useSelector(
    (state) => state.setting.templateAndMailList?.length,
  );
  const { isOpen, onClose, onOpen, onOpenChange } = useDisclosure();
  const emailPreviewModal = useDisclosure();
  const templatePreviewModal = useDisclosure();
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

  useEffect(() => {
    dispatch(getAllProposalAndEmailTemplates());
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
  }, [items]);

  const handleSetDate = (rowData) => {
    setItem(rowData);
    reset({
      name: rowData?.name,
      body: rowData?.body,
      description: rowData?.description,
    });
    onOpen();
  };

  const handleFinish = (values) => {
    if (item) {
      dispatch(editProposalAndEmailTemplate({ id: item?.id, ...values }))
        .then((resp) => {
          if (resp.meta.requestStatus === "fulfilled") {
            addToast({
              title: "Template updated successfully!.",
              color: "success",
            });
            setItem(null);
            reset(defaultValues);
            onClose();
            dispatch(getAllProposalAndEmailTemplates());
          } else {
            addToast({ title: "Something went wrong !.", color: "danger" });
          }
        })
        .catch(() =>
          addToast({ title: "Something went wrong !.", color: "danger" }),
        );
    } else {
      dispatch(createProposalTemplate(values))
        .then((res) => {
          if (res.meta.requestStatus === "fulfilled") {
            addToast({
              title: "Template created successfully in Auth !.",
              color: "success",
            });
            onClose();
            reset(defaultValues);
            dispatch(getAllProposalAndEmailTemplates());
          } else {
            addToast({ title: "Something went wrong !.", color: "danger" });
          }
        })
        .catch(() =>
          addToast({ title: "Something went wrong !.", color: "danger" }),
        );
    }
  };

  const renderCell = React.useCallback(
    (rowData, columnKey) => {
      const cellValue = rowData[columnKey];

      switch (columnKey) {
        case "name":
          return <p>{rowData?.name}</p>;

        case "emailBody":
          return (
            <Button
              size="sm"
              onPress={() => {
                emailPreviewModal.onOpen();
                setItem(rowData);
              }}
            >
              Preview
            </Button>
          );

        case "description":
          return (
            <Button
              size="sm"
              onPress={() => {
                templatePreviewModal.onOpen();
                setItem(rowData);
              }}
            >
              Preview
            </Button>
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
                    if (key === "edit") {
                      handleSetDate(rowData);
                    }
                  }}
                >
                  <DropdownItem key="edit">Edit</DropdownItem>
                </DropdownMenu>
              </Dropdown>
            </div>
          );
        default:
          return cellValue;
      }
    },
    [emailPreviewModal, templatePreviewModal],
  );

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
            placeholder="Search ..."
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
            Total {count} templates
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
      <h1 className="font-sans text-lg font-semibold mb-2 shrink-0">
        Templates and email body
      </h1>
      <Table
        isHeaderSticky
        aria-label="Example table with custom cells, pagination and sorting"
        bottomContent={bottomContent}
        bottomContentPlacement="outside"
        classNames={{
          wrapper: "max-h-[65vh]",
        }}
        // selectedKeys={selectedKeys}
        selectionMode="multiple"
        sortDescriptor={sortDescriptor}
        topContent={topContent}
        topContentPlacement="outside"
        // onSelectionChange={(e) => {
        //   let rowKeys = Array.from(e);
        //   setSelectedKeys(rowKeys);
        // }}
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
        size="full"
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
                {item?.id
                  ? "Update template"
                  : "Create templates and email body"}
              </ModalHeader>
              <ModalBody className="max-h-[75vh] overflow-auto">
                <form
                  onSubmit={handleSubmit(handleFinish)}
                  className="flex flex-col gap-4"
                >
                  <Controller
                    name="name"
                    control={control}
                    render={({ field, fieldState: { error } }) => (
                      <Input
                        label="Template name"
                        labelPlacement="outside"
                        isRequired
                        errorMessage="please enter the template name"
                        value={field.value}
                        onChange={(e) => field.onChange(e.target.value)}
                      />
                    )}
                  />
                  <div className="flex flex-col gap-1">
                    <label className="font-medium">Email body</label>
                    <Controller
                      name="body"
                      control={control}
                      render={({ field, fieldState: { error } }) => (
                        <>
                          <TextEditor
                            data={field.value}
                            onChange={(prev, editor) => {
                              const newData = editor?.getData();
                              field.onChange(newData);
                            }}
                          />
                          {error && (
                            <span className="text-red-500 text-sm">
                              {error.message}
                            </span>
                          )}
                        </>
                      )}
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="font-medium">Proposal template</label>
                    <Controller
                      name="description"
                      control={control}
                      render={({ field, fieldState: { error } }) => (
                        <>
                          <TextEditor
                            data={field.value}
                            onChange={(prev, editor) => {
                              const newData = editor?.getData();
                              field.onChange(newData);
                            }}
                          />
                          {error && (
                            <span className="text-red-500 text-sm">
                              {error.message}
                            </span>
                          )}
                        </>
                      )}
                    />
                  </div>
                  <ModalFooter>
                    <Button onPress={onClose}>Cancel</Button>
                    <Button type="submit" color="primary">
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
        size="full"
        isDismissable={false}
        isKeyboardDismissDisabled={true}
        isOpen={emailPreviewModal.isOpen}
        onOpenChange={(e) => {
          emailPreviewModal.onOpenChange(e);
          if (!e) {
            setItem(null);
          }
        }}
        placement="top-center"
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                Email preview
              </ModalHeader>
              <ModalBody>
                <div
                  style={{ maxHeight: "70vh", overflow: "auto" }}
                  dangerouslySetInnerHTML={{ __html: item?.body }}
                />
              </ModalBody>
              <ModalFooter>
                <Button onPress={onClose}>Close</Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      <Modal
        size="full"
        isDismissable={false}
        isKeyboardDismissDisabled={true}
        isOpen={templatePreviewModal.isOpen}
        onOpenChange={(e) => {
          templatePreviewModal.onOpenChange(e);
          if (!e) {
            setItem(null);
          }
        }}
        placement="top-center"
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                Template preview
              </ModalHeader>
              <ModalBody>
                <div
                  style={{ maxHeight: "70vh", overflow: "auto" }}
                  dangerouslySetInnerHTML={{ __html: item?.description }}
                />
              </ModalBody>
              <ModalFooter>
                <Button onPress={onClose}>Close</Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
};

export default TemplatesAndEmailBody;
