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
} from "@heroui/react";
import { useDispatch, useSelector } from "react-redux";
import {
  createDesigination,
  getAllDesiginations,
} from "../../toolkit/slices/settingSlice";
import { Plus, Search } from "lucide-react";
import * as z from "zod";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createAuthDesigination } from "../../toolkit/slices/authSlice";
import { createDesignationInOPerations } from "../../toolkit/slices/operationSlice";

const formSchema = z.object({
  name: z.string().min(1, "please enter the name."),
  weight: z.string().min(1, "please select weight."),
});

const defaultValues = {
  name: "",
  weight: "",
};

export const columns = [
  { name: "ID", uid: "id" },
  { name: "DESIGNATION NAME", uid: "name" },
  { name: "WEIGHT VALUE", uid: "weightValue" },
  { name: "ACTIONS", uid: "actions" },
];

export function capitalize(s) {
  return s ? s.charAt(0).toUpperCase() + s.slice(1).toLowerCase() : "";
}

const Designation = () => {
  const dispatch = useDispatch();
  const data = useSelector((state) => state.setting.designationList);
  const count = useSelector((state) => state.setting.designationList?.length);
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [filterValue, setFilterValue] = React.useState("");
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
    dispatch(getAllDesiginations());
  }, [dispatch]);

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

  const handleFinish = (values) => {
    dispatch(createAuthDesigination(values))
      .then((res) => {
        if (res.meta.requestStatus === "fulfilled") {
          addToast({
            title: "Designation created successfully in Auth !.",
            color: "success",
          });
          dispatch(createDesigination(values))
            .then((resp) => {
              console.log("respfhfghfg", resp);
              if (resp.meta.requestStatus === "fulfilled") {
                addToast({
                  title: "Designation created successfully !.",
                  color: "success",
                });
                dispatch(createDesignationInOPerations(resp?.payload)).then(
                  (oprRes) => {
                    if (oprRes.meta.requestStatus === "fulfilled") {
                      addToast({
                        title: "Success",
                        description:
                          "Designation created successfully in operations !.",
                        color: "success",
                      });
                      onOpenChange(false);
                      dispatch(getAllDesiginations());
                      reset(defaultValues);
                    }
                  },
                );
              } else {
                addToast({ title: "Something went wrong !.", color: "danger" });
              }
            })
            .catch(() =>
              addToast({ title: "Something went wrong !.", color: "danger" }),
            );
        } else {
          addToast({ title: "Something went wrong !.", color: "danger" });
        }
      })
      .catch(() =>
        addToast({ title: "Something went wrong !.", color: "danger" }),
      );
  };

  const renderCell = React.useCallback((rowData, columnKey) => {
    const cellValue = rowData[columnKey];

    switch (columnKey) {
      case "name":
        return <p>{rowData?.name}</p>;

      case "weightValue":
        return <p>{rowData?.weightValue}</p>;
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
      <div className="flex flex-col gap-2">
        <div className="flex justify-between gap-2 items-center flex-wrap">
          <Input
            isClearable
            size="sm"
            className="w-full sm:max-w-[280px]"
            classNames={{ inputWrapper: "h-8 min-h-8" }}
            placeholder="Search designations..."
            startContent={<Search className="w-4 h-4 text-default-400" />}
            value={filterValue}
            onClear={() => onClear()}
            onValueChange={onSearchChange}
          />

          <div className="flex gap-1.5 flex-wrap">
            <Button
              size="sm"
              color="primary"
              onPress={onOpen}
              startContent={<Plus className="w-4 h-4" />}
            >
              Add New
            </Button>
          </div>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-default-400 text-[12.5px]">
            Total {count} designations
          </span>

          <label className="flex items-center gap-1 text-default-400 text-[12.5px]">
            Rows per page:
            <select
              className="bg-transparent outline-hidden text-default-400 text-[12.5px] cursor-pointer"
              onChange={onRowsPerPageChange}
              value={initialFilteration?.size}
            >
              <option value="5">5</option>
              <option value="10">10</option>
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
    onRowsPerPageChange,
    count,
    onSearchChange,
    onOpen,
  ]);

  const bottomContent = React.useMemo(() => {
    return (
      <div className="py-1.5 px-1 flex justify-between items-center">
        <span className="w-[30%] text-[12.5px] text-default-400">
          Page {initialFilteration?.page} of {pages}
        </span>

        <Pagination
          isCompact
          showControls
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
  }, [initialFilteration?.page, pages, onPreviousPage, onNextPage]);

  return (
    <div className="flex flex-col gap-2">
      <h1 className="font-sans text-lg font-semibold mb-2 shrink-0">
        Designation list
      </h1>

      <Table
        isHeaderSticky
        removeWrapper={false}
        aria-label="Designation table"
        bottomContent={bottomContent}
        bottomContentPlacement="outside"
        classNames={{
          base: "gap-2.5",
          wrapper:
            "max-h-[calc(100vh-320px)] w-full overflow-y-auto rounded-lg border border-gray-200 dark:border-white/10 shadow-none p-0",
          table: "w-full",
          thead: "[&>tr]:first:rounded-none",
          th: "h-8 py-0 text-[11.5px] tracking-wide bg-gray-50 dark:bg-neutral-900 text-default-500 first:rounded-none last:rounded-none border-b border-gray-200 dark:border-white/10",
          td: "py-1.5 text-[12.5px]",
        }}
        sortDescriptor={sortDescriptor}
        topContent={topContent}
        topContentPlacement="outside"
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
        size="xl"
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
                {item?.id ? "Update slug" : "Create designation"}
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
                        errorMessage="Please enter designation"
                        label="Designation"
                        {...field}
                      />
                    )}
                  />
                  <Controller
                    name="weight"
                    control={control}
                    render={({ field, fieldState: { error } }) => (
                      <Select
                        isRequired={true}
                        label="Weight"
                        errorMessage={error?.message}
                        isInvalid={!!error}
                        {...field}
                        value={[field.value]}
                        onSelectionChange={(e) =>
                          field.onChange(Array.from(e)[0])
                        }
                        items={[
                          {
                            label: "1",
                            key: 1,
                          },
                          {
                            label: "2",
                            key: 2,
                          },
                          {
                            label: "3",
                            key: 3,
                          },
                          {
                            label: "4",
                            key: 4,
                          },
                          {
                            label: "5",
                            key: 5,
                          },
                          {
                            label: "6",
                            key: 6,
                          },
                          {
                            label: "7",
                            key: 7,
                          },
                          {
                            label: "8",
                            key: 8,
                          },
                          {
                            label: "9",
                            key: 9,
                          },
                          {
                            label: "10",
                            key: 10,
                          },
                        ]}
                      >
                        {(item) => (
                          <SelectItem key={item.key}>{item.label}</SelectItem>
                        )}
                      </Select>
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
    </div>
  );
};

export default Designation;
