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
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import * as z from "zod";
import { useMediaQuery } from "react-responsive";
import { useParams } from "react-router-dom";
import {
  addApplicantType,
  getApplicantTypeList,
} from "../../toolkit/slices/settingSlice";

export const columns = [
  { name: "ID", uid: "id", sortable: true },
  { name: "NAME", uid: "name" },
  { name: "DESCRIPTION", uid: "description" },
];

export function capitalize(s) {
  return s ? s.charAt(0).toUpperCase() + s.slice(1).toLowerCase() : "";
}

const INITIAL_VISIBLE_COLUMNS = ["id", "name", "description"];

const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().min(1, "Description is required"),
});

const defaultValues = {
  name: "",
  description: "",
};

const ApplicantTypes = () => {
  const dispatch = useDispatch();
  const { userId } = useParams();
  const { isOpen, onClose, onOpen, onOpenChange } = useDisclosure();
  const data = useSelector((state) => state.setting.applicantTypeList);
  const count = useSelector((state) => state.product.applicantTypeList?.length);
  const [filterValue, setFilterValue] = React.useState("");
  const [selectedKeys, setSelectedKeys] = React.useState(new Set([]));
  const [visibleColumns, setVisibleColumns] = React.useState(
    new Set(INITIAL_VISIBLE_COLUMNS)
  );

  const [rowsPerPage, setRowsPerPage] = React.useState(50);
  const [sortDescriptor, setSortDescriptor] = React.useState({
    column: "id",
    direction: "ascending",
  });
  const [page, setPage] = React.useState(1);
  const hasSearchFilter = Boolean(filterValue);
  const isMedium = useMediaQuery({ minWidth: 768, maxWidth: 1535 });
  const isLarge = useMediaQuery({ minWidth: 1536 });

  useEffect(() => {
    dispatch(getApplicantTypeList({ page, size: rowsPerPage }));
  }, [dispatch, page, rowsPerPage]);

  const headerColumns = React.useMemo(() => {
    if (visibleColumns === "all") return columns;

    return columns.filter((column) =>
      Array.from(visibleColumns).includes(column.uid)
    );
  }, [visibleColumns]);

  const filteredItems = React.useMemo(() => {
    let filteredUsers = [...(data?.length > 0 ? data : [])];

    if (hasSearchFilter) {
      filteredUsers = filteredUsers?.filter((item) =>
        Object.values(item)?.some((val) =>
          String(val)?.toLowerCase().includes(filterValue.toLowerCase())
        )
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
      dispatch(addApplicantType(values))
        .then((resp) => {
          if (resp.meta.requestStatus === "fulfilled") {
            addToast({
              title: "Applicant type created successfully !.",
              color: "success",
            });
            dispatch(getApplicantTypeList({ page, size: rowsPerPage }));
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
          addToast({ title: "Something went wrong !.", color: "danger" })
        );
    },
    [dispatch, onClose, reset, userId]
  );

  const renderCell = React.useCallback((rowData, columnKey) => {
    const cellValue = rowData[columnKey];
    switch (columnKey) {
      case "name":
        return <p>{rowData?.name} </p>;
      case "description":
        return <p>{rowData?.description} </p>;
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
            Total {count || 0} applicant types
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
  }, [selectedKeys, count, page, pages, hasSearchFilter]);

  return (
    <>
      <h1 className="font-sans text-2xl font-medium mb-1">Applicant list</h1>
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
              <ModalHeader>Add applicant type</ModalHeader>
              <ModalBody>
                <form onSubmit={handleSubmit(onSubmit)}>
                  <div className="grid  gap-4 max-h-[60vh] overflow-auto">
                    <Controller
                      name="name"
                      control={control}
                      render={({ field }) => (
                        <Input isRequired label="Name" {...field} />
                      )}
                    />

                    <Controller
                      name="description"
                      control={control}
                      render={({ field }) => (
                        <Textarea isRequired label="Description" {...field} />
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
    </>
  );
};

export default ApplicantTypes;
