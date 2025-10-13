import {
  addToast,
  Button,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
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
  useDisclosure,
} from "@heroui/react";
import {
  ChevronDown,
  EllipsisVertical,
  Pencil,
  Phone,
  Plus,
  Search,
  Trash,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  addNewRating,
  editUserRatingAssignee,
  getAllUrlList,
  getAllUsers,
  getUsersListByServiceRatingId,
} from "../toolkit/slices/commonSlice";
import { useParams } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import NewSelect from "../components/NewSelect";
import * as z from "zod";

const columns = [
  { name: "ID", uid: "id" },
  { name: "URL NAME", uid: "urlsName", sortable: true },
  { name: "ASSIGNEE", uid: "user" },
  { name: "RATING", uid: "rating" },
  { name: "ACTIONS", uid: "actions" },
];

function capitalize(s) {
  return s ? s.charAt(0).toUpperCase() + s.slice(1).toLowerCase() : "";
}

const INITIAL_VISIBLE_COLUMNS = ["id", "urlsName", "user", "rating", "actions"];

const formSchema = z.object({
  ratingsUser: z.array(z.string()).min(1, "Please select at least one user"),
  rating: z.enum(["1", "2", "3", "4", "5"], {
    errorMap: () => ({ message: "Please select a rating" }),
  }),
});

const defaultValues = {
  ratingsUser: [],
  rating: "",
};

const Rating = () => {
  const { serviceId } = useParams();
  const dispatch = useDispatch();
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const count = useSelector(
    (state) => state.common.usersListByServiceId?.length || 0
  );
  const data = useSelector((state) => state.common.usersListByServiceId);
  const userList = useSelector((state) => state.common.usersList);
  const [filterValue, setFilterValue] = useState("");
  const [selectedKeys, setSelectedKeys] = useState(new Set([]));
  const [visibleColumns, setVisibleColumns] = useState(
    new Set(INITIAL_VISIBLE_COLUMNS)
  );
  const [sortDescriptor, setSortDescriptor] = useState({
    column: "age",
    direction: "ascending",
  });
  const [filteration, setFilteration] = useState({
    page: 1,
    size: 50,
  });
  const [editData, setEditData] = useState(null);

  const hasSearchFilter = Boolean(filterValue);

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: zodResolver(formSchema),
    defaultValues,
  });

  useEffect(() => {
    dispatch(getUsersListByServiceRatingId({ serviceId }));
    dispatch(getAllUsers());
  }, [dispatch, serviceId]);

  const headerColumns = useMemo(() => {
    if (visibleColumns === "all") return columns;
    return columns.filter((column) =>
      Array.from(visibleColumns).includes(column.uid)
    );
  }, [visibleColumns]);

  const filteredItems = useMemo(() => {
    let filteredData = [...data];
    if (hasSearchFilter) {
      filteredData = filteredData.filter((item) =>{
        return(
          item?.urlsName?.toLowerCase().includes(filterValue.toLowerCase())
        )
      }
        
      );
    }
    return filteredData;
  }, [data, filterValue]);

  const pages = Math.ceil(count / filteration?.size) || 1;

  const items = useMemo(() => {
    const start = (filteration?.page - 1) * filteration?.size;
    const end = start + filteration?.size;
    return filteredItems.slice(start, end);
  }, [filteration, filteredItems]);

  const sortedItems = useMemo(() => {
    return [...items].sort((a, b) => {
      const first = a[sortDescriptor.column];
      const second = b[sortDescriptor.column];
      const cmp = first < second ? -1 : first > second ? 1 : 0;
      return sortDescriptor.direction === "descending" ? -cmp : cmp;
    });
  }, [sortDescriptor, items]);

  const handleEdit = (rowData) => {
    reset({
      ratingsUser: rowData?.user?.map((item) => item?.id),
      rating: rowData?.rating,
    });
    setEditData(rowData);
    onOpen();
  };

  const onSubmit = (data) => {
    if (editData) {
      dispatch(
        editUserRatingAssignee({
          ...data,
          urlsManagmentId: serviceId,
          ratingId: editData?.id,
        })
      )
        .then((response) => {
          if (response.meta.requestStatus === "fulfilled") {
            addToast({
              title: "Rating updated successfully !.",
              color: "success",
            });
            dispatch(getUsersListByServiceRatingId({ serviceId }));
            dispatch(getAllUrlList());
            reset(defaultValues);
            onOpenChange(false);
            setEditData(null);
          } else {
            addToast({
              title: "Either user is already persent or empty !.",
              color: "danger",
            });
          }
        })
        .catch(() => {
          addToast({
            title: "Either user is already persent or empty !.",
            color: "danger",
          });
        });
    } else {
      dispatch(addNewRating({ ...data, urlsManagmentId: serviceId }))
        .then((response) => {
          if (response.meta.requestStatus === "fulfilled") {
            addToast({
              title: "Rating updated successfully !.",
              color: "success",
            });
            dispatch(getUsersListByServiceRatingId({ serviceId }));
            dispatch(getAllUrlList());
            reset(defaultValues);
            onOpenChange(false);
            setEditData(null);
          } else {
            addToast({
              title: "Either user is already persent or empty !.",
              color: "danger",
            });
          }
        })
        .catch(() => {
          addToast({
            title: "Either user is already persent or empty !.",
            color: "danger",
          });
        });
    }
  };

  const renderCell = useCallback((rowData, columnKey) => {
    switch (columnKey) {
      case "urlsName":
        return (
          <div className="flex items-start gap-2">
            <span className="font-normal">{rowData?.urlsName}</span>
          </div>
        );
      case "user":
        return (
          <div className="flex flex-col">
            <span className="font-normal">
              {rowData?.user?.map((item) => item?.name).join("     ,    ")}
            </span>
          </div>
        );
      case "actions":
        return (
          <div className="flex flex-col">
            <span className="font-normal">
              <Dropdown>
                <DropdownTrigger>
                  <Button size="sm" isIconOnly variant="light">
                    <EllipsisVertical />
                  </Button>
                </DropdownTrigger>
                <DropdownMenu
                  selectionMode="single"
                  onSelectionChange={(e) => handleEdit(rowData)}
                >
                  <DropdownItem
                    key={"edit"}
                    startContent={<Pencil className="h-4 w-4" />}
                  >
                    {" "}
                    Edit
                  </DropdownItem>
                  <DropdownItem
                    key={"delete"}
                    color="danger"
                    startContent={<Trash className="h-4 w-4" />}
                  >
                    Delete
                  </DropdownItem>
                </DropdownMenu>
              </Dropdown>
            </span>
          </div>
        );
      default:
        return rowData[columnKey] || "-";
    }
  }, []);

  const onNextPage = useCallback(() => {
    if (filteration?.page < pages) {
      setFilteration((prev) => ({ ...prev, page: prev.page + 1 }));
    }
  }, [filteration, pages]);

  const onPreviousPage = useCallback(() => {
    if (filteration?.page > 1) {
      setFilteration((prev) => ({ ...prev, page: prev.page - 1 }));
    }
  }, [filteration]);

  const onRowsPerPageChange = useCallback((e) => {
    setFilteration((prev) => ({
      ...prev,
      size: Number(e.target.value),
      page: 1,
    }));
  }, []);

  const onSearchChange = useCallback((value) => {
    if (value) {
      setFilterValue(value);
      setFilteration((prev) => ({ ...prev, page: 1 }));
    } else {
      setFilterValue("");
    }
  }, []);

  const onClear = useCallback(() => {
    setFilterValue("");
    setFilteration((prev) => ({ ...prev, page: 1 }));
  }, []);

  const topContent = useMemo(() => {
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
            <Button color="primary" onPress={onOpen} endContent={<Plus />}>
              Add rating
            </Button>
          </div>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-default-400 text-small">
            Total {count} rating
          </span>
          <label className="flex items-center text-default-400 text-small">
            Rows per page:
            <select
              className="bg-transparent outline-none text-default-400 text-small"
              onChange={onRowsPerPageChange}
              value={filteration?.size}
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
  }, [filterValue, visibleColumns, onRowsPerPageChange, count, onSearchChange]);

  const bottomContent = useMemo(() => {
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
          page={filteration?.page}
          total={pages}
          onChange={(e) => {
            setFilteration((prev) => ({ ...prev, page: e }));
          }}
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
  }, [
    selectedKeys,
    count,
    filteration,
    pages,
    onPreviousPage,
    onNextPage,
    dispatch,
  ]);

  return (
    <>
      <h1 className="font-sans text-2xl font-medium mb-1">Rating list</h1>
      <Table
        isHeaderSticky
        aria-label="Users table with custom cells, pagination, and sorting"
        bottomContent={bottomContent}
        bottomContentPlacement="outside"
        classNames={{
          wrapper: "max-h-[65vh] max-w-full",
        }}
        selectedKeys={selectedKeys}
        selectionMode="multiple"
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
            <TableRow key={item.id || item.companyId}>
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
              <ModalHeader>Add Rating</ModalHeader>
              <ModalBody>
                <form
                  onSubmit={handleSubmit(onSubmit)}
                  className="flex flex-col gap-4"
                >
                  <Controller
                    name="ratingsUser"
                    control={control}
                    render={({ field }) => {
                      return (
                        <NewSelect
                          isRequired={true}
                          data={userList}
                          label="Select users"
                          name="ratingsUser"
                          labelKey="fullName"
                          valueKey="id"
                          selectionMode="multiple"
                          value={field.value}
                          onChange={(selectedValue) => {
                            field.onChange(selectedValue);
                          }}
                          errorMessage={errors.ratingsUser?.message}
                        />
                      );
                    }}
                  />
                  <Controller
                    name="rating"
                    control={control}
                    render={({ field }) => (
                      <Select
                        isRequired
                        errorMessage="please select rating for users"
                        label="Rating"
                        items={[
                          { value: 1, label: "1" },
                          { value: 2, label: "2" },
                          { value: 3, label: "3" },
                          { value: 4, label: "4" },
                          { value: 5, label: "5" },
                        ]}
                        selectedKeys={[field.value]}
                        onSelectionChange={(selectedSet) => {
                          const selectedArray = Array.from(selectedSet)[0];
                          field.onChange(selectedArray);
                        }}
                      >
                        {(item) => (
                          <SelectItem key={item?.value}>
                            {item?.label}
                          </SelectItem>
                        )}
                      </Select>
                    )}
                  />
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

export default Rating;
