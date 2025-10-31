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
  useDisclosure,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  addToast,
  ModalFooter,
  Switch,
  Select,
  SelectItem,
} from "@heroui/react";
import { useDispatch, useSelector } from "react-redux";
import {
  convertUrlsToProduct,
  createUrl,
  editSulg,
  editUrls,
  getAllSlugList,
  getAllSlugs,
  getAllUrlCount,
  getAllUrlsList,
  searchLeadUrlList,
} from "../../toolkit/slices/settingSlice";
import { ChevronDown, EllipsisVertical, Plus, Search } from "lucide-react";
import * as z from "zod";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import NewSelect from "../../components/NewSelect";

const formSchema = z.object({
  name: z.string().min(1, "please enter the name."),
  urlSlug: z.array(z.string()).min(1, "please select the url slug."),
  quality: z.boolean(),
});

const defaultValues = {
  name: "",
  urlSlug: [],
  quality: false,
};

export const columns = [
  { name: "ID", uid: "id" },
  { name: "URL NAME", uid: "urlsName", sortable: true },
  { name: "URL SLUG", uid: "urlSlug" },
  { name: "PRODUCT", uid: "product" },
  { name: "QUALITY", uid: "quality" },
  { name: "ACTIONS", uid: "actions" },
];

export function capitalize(s) {
  return s ? s.charAt(0).toUpperCase() + s.slice(1).toLowerCase() : "";
}

const INITIAL_VISIBLE_COLUMNS = [
  "id",
  "urlsName",
  "urlSlug",
  "product",
  "quality",
  "actions",
];

const Urls = () => {
  const dispatch = useDispatch();
  const data = useSelector((state) => state.setting.urlsList);
  const count = useSelector((state) => state.setting.urlCount);
  const slugList = useSelector((state) => state.setting.slugList);
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [filterValue, setFilterValue] = React.useState("");
  const [selectedKeys, setSelectedKeys] = React.useState(new Set([]));
  const [visibleColumns, setVisibleColumns] = React.useState(
    new Set(INITIAL_VISIBLE_COLUMNS)
  );
  const [sortDescriptor, setSortDescriptor] = React.useState({
    column: "id",
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
    dispatch(getAllUrlsList(initialFilteration));
    dispatch(getAllUrlCount());
    dispatch(getAllSlugList());
  }, [dispatch, initialFilteration]);

  const headerColumns = React.useMemo(() => {
    if (visibleColumns === "all") return columns;

    return columns.filter((column) =>
      Array.from(visibleColumns).includes(column.uid)
    );
  }, [visibleColumns]);

  const pages = Math.ceil(count / initialFilteration?.size) || 1;

  const sortedItems = React.useMemo(() => {
    return [...(data || [])].sort((a, b) => {
      const first = a[sortDescriptor.column];
      const second = b[sortDescriptor.column];
      const cmp = first < second ? -1 : first > second ? 1 : 0;

      return sortDescriptor.direction === "descending" ? -cmp : cmp;
    });
  }, [sortDescriptor, data]);

  const handleFinish = (values) => {
    console.log("sdkhsdjkgjk", values);
    if (item?.id) {
      dispatch(editUrls({ urlsId: item?.id, ...values }))
        .then((resp) => {
          if (resp.meta.requestStatus === "fulfilled") {
            addToast({
              title: "Url updated successfully !.",
              color: "success",
            });
            onOpenChange(false);
            dispatch(getAllUrlsList(initialFilteration));
            reset(defaultValues);
            setItem(null);
          } else {
            addToast({ title: "Something went wrong !.", color: "danger" });
          }
        })
        .catch(() =>
          addToast({ title: "Something went wrong !.", color: "danger" })
        );
    } else {
      dispatch(createUrl(values))
        .then((resp) => {
          if (resp.meta.requestStatus === "fulfilled") {
            addToast({
              title: "Url created successfully !.",
              color: "success",
            });
            onOpenChange(false);
            dispatch(getAllUrlsList(initialFilteration));
            reset(defaultValues);
          } else {
            addToast({ title: "Something went wrong !.", color: "danger" });
          }
        })
        .catch(() =>
          addToast({ title: "Something went wrong !.", color: "danger" })
        );
    }
  };

  const handleConvertToProduct = useCallback(() => {
    dispatch(
      convertUrlsToProduct({
        urlsId: selectedKeys,
      })
    )
      .then((resp) => {
        if (resp.meta.requestStatus === "fulfilled") {
          addToast({
            title: "Urls converted to product successfully !.",
            color: "success",
          });
          dispatch(getAllUrlsList(initialFilteration));
          setSelectedKeys([]);
        } else {
          addToast({ title: "Something went wrong !.", color: "danger" });
        }
      })
      .catch(() => {
        addToast({ title: "Something went wrong !.", color: "danger" });
      });
  }, [dispatch, selectedKeys]);

  const renderCell = React.useCallback((rowData, columnKey) => {
    const cellValue = rowData[columnKey];

    switch (columnKey) {
      case "urlsName":
        return <p>{rowData?.urlsName}</p>;

      case "urlSlug":
        return (
          <p>{rowData?.urlSlug?.map((item) => item?.name)?.join(" , ")}</p>
        );

      case "product":
        return <p>{rowData?.product ? "True" : "False"}</p>;

      case "quality":
        return <p>{rowData?.quality ? "True" : "False"}</p>;

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
                    onOpen();
                    setItem(rowData);
                    setValue("name", rowData?.urlsName);
                    setValue(
                      "urlSlug",
                      rowData?.urlSlug?.map((item) => String(item?.id))
                    );
                    setValue("quality", rowData?.quality);
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
      dispatch(searchLeadUrlList(value));
    } else {
      setFilterValue("");
      dispatch(getAllUrlsList(initialFilteration));
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
            <Button
              variant="flat"
              onPress={handleConvertToProduct}
              isDisabled={selectedKeys?.length === 0}
            >
              Convert to product
            </Button>
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
            Total {count} Urls
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
      <h1 className="font-sans text-2xl font-medium mb-1">Urls list</h1>
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
                {item?.id ? "Update url" : "Create url"}
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
                        errorMessage="Please enter url name"
                        label="Urls name"
                        {...field}
                      />
                    )}
                  />
                  <Controller
                    name="urlSlug"
                    control={control}
                    render={({ field, fieldState: { error } }) => {
                      return (
                        <NewSelect
                          isRequired
                          label="Slugs"
                          selectionMode="multiple"
                          errorMessage={"please select the slugs."}
                          data={slugList || []}
                          labelKey="name"
                          valueKey="id"
                          value={field.value}
                          onChange={(value) => {
                            field.onChange(value);
                          }}
                        />
                      );
                    }}
                  />
                  <Controller
                    name="quality"
                    control={control}
                    render={({ field, fieldState: { error } }) => {
                      return (
                        <Select
                          isRequired={true}
                          label="Quality"
                          errorMessage={error?.message}
                          isInvalid={!!error}
                          selectedKeys={[String(field.value)]}
                          onSelectionChange={(e) => {
                            let key = Array.from(e)[0] === "true";
                            field.onChange(key);
                          }}
                          items={[
                            { label: "True", key: true },
                            { label: "False", key: false },
                          ]}
                        >
                          {(item) => (
                            <SelectItem key={item.key}>{item.label}</SelectItem>
                          )}
                        </Select>
                      );
                    }}
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

export default Urls;
