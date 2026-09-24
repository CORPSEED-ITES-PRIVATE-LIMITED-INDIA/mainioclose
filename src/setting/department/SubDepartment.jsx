import {
  Button,
  Chip,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Pagination,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
  Input,
  addToast,
  useDisclosure,
} from "@heroui/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import * as z from "zod";
import { useDispatch, useSelector } from "react-redux";
import { ChevronDown, EllipsisVertical, Plus, Search } from "lucide-react";
import { Link, useLocation, useParams } from "react-router-dom";
import dayjs from "dayjs";
import {
  createSubDepartment,
  getSubDepartmentList,
  updateSubDepartment,
} from "../../toolkit/slices/settingSlice";
import { getUsersListByDepartmentId } from "../../toolkit/slices/commonSlice";
import NewSelect from "../../components/NewSelect";

const columns = [
  { name: "ID", uid: "id" },
  { name: "SUB DEPARTMENT", uid: "fullName" },
  { name: "DESCRIPTION", uid: "description" },
  { name: "HEAD", uid: "head" },
  { name: "STATUS", uid: "active" },
  { name: "CREATED BY", uid: "createdBy" },
  { name: "ACTIONS", uid: "actions" },
];

const STATUS_FILTER_OPTIONS = [
  { label: "ALL", value: "" },
  { label: "ACTIVE", value: "true" },
  { label: "INACTIVE", value: "false" },
];

const formSchema = z.object({
  fullName: z.string().min(1, "please enter the sub department name"),
  description: z.string().optional(),
  headUserId: z.string().optional(),
});

const defaultValues = {
  fullName: "",
  description: "",
  headUserId: "",
};

const SubDepartment = () => {
  const dispatch = useDispatch();
  const { departmentId } = useParams();
  const location = useLocation();
  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  const currentUser = useSelector((state) => state.auth.currentUser);
  const createdByUserId = currentUser?.id || currentUser?.userId;

  const subDepartmentList = useSelector(
    (state) => state.setting.subDepartmentList,
  );
  const data = subDepartmentList?.content || [];
  const count = subDepartmentList?.totalElements || 0;
  const departmentName =
    location?.state?.departmentName || data?.[0]?.departmentName;

  const userListByDepartment = useSelector(
    (state) => state.common.userListByDepartment,
  );

  const [filterValue, setFilterValue] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [rowItem, setRowItem] = useState(null);
  const [filteration, setFilteration] = useState({
    page: 1,
    size: 50,
  });

  const { control, handleSubmit, reset } = useForm({
    resolver: zodResolver(formSchema),
    defaultValues,
  });

  useEffect(() => {
    dispatch(getUsersListByDepartmentId(departmentId));
  }, [dispatch, departmentId]);

  useEffect(() => {
    dispatch(
      getSubDepartmentList({
        departmentId,
        search: filterValue,
        active: statusFilter,
        page: filteration?.page,
        size: filteration?.size,
      }),
    );
  }, [dispatch, departmentId, filterValue, statusFilter, filteration]);

  const pages = Math.ceil(count / filteration?.size) || 1;

  const handleOpenCreateModal = () => {
    setRowItem(null);
    reset(defaultValues);
    onOpen();
  };

  const handleOpenUpdateModal = (rowData) => {
    setRowItem(rowData);
    reset({
      fullName: rowData?.fullName || "",
      description: rowData?.description || "",
      headUserId: rowData?.head?.id ? String(rowData.head.id) : "",
    });
    onOpen();
  };

  const renderCell = useCallback((rowData, columnKey) => {
    switch (columnKey) {
      case "fullName":
        return (
          <Link
            className="font-medium text-blue-600 hover:underline"
            to={`${rowData?.id}/teams`}
            state={{ subDepartmentName: rowData?.fullName }}
          >
            {rowData?.fullName}
          </Link>
        );

      case "description":
        return (
          <span className="text-default-500">
            {rowData?.description || "-"}
          </span>
        );

      case "head":
        return <span>{rowData?.head?.fullName || "-"}</span>;

      case "active":
        return (
          <Chip
            size="sm"
            variant="flat"
            color={rowData?.active ? "success" : "default"}
          >
            {rowData?.active ? "Active" : "Inactive"}
          </Chip>
        );

      case "createdBy":
        return (
          <div className="flex flex-col">
            <span className="font-normal">
              {rowData?.createdBy?.fullName || "-"}
            </span>
            <span className="text-xs text-default-400">
              {rowData?.createdAt
                ? dayjs(rowData.createdAt).format("DD-MM-YYYY, hh:mm a")
                : ""}
            </span>
          </div>
        );

      case "actions":
        return (
          <div className="relative flex justify-center items-center gap-2">
            <Dropdown>
              <DropdownTrigger>
                <Button isIconOnly size="sm" variant="light">
                  <EllipsisVertical />
                </Button>
              </DropdownTrigger>
              <DropdownMenu
                selectionMode="single"
                onSelectionChange={(e) => {
                  let key = Array.from(e)[0];
                  if (key === "edit") {
                    handleOpenUpdateModal(rowData);
                  }
                }}
              >
                <DropdownItem key="edit">Edit</DropdownItem>
              </DropdownMenu>
            </Dropdown>
          </div>
        );

      default:
        return rowData?.[columnKey] || "-";
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
    setFilterValue(value || "");
    setFilteration((prev) => ({ ...prev, page: 1 }));
  }, []);

  const onClear = useCallback(() => {
    setFilterValue("");
    setFilteration((prev) => ({ ...prev, page: 1 }));
  }, []);

  const onSubmit = (values) => {
    if (rowItem) {
      dispatch(
        updateSubDepartment({
          id: rowItem?.id,
          data: {
            fullName: values?.fullName,
            description: values?.description,
            headUserId: values?.headUserId || null,
            updatedByUserId: createdByUserId,
          },
        }),
      )
        .then((resp) => {
          if (resp.meta.requestStatus === "fulfilled") {
            addToast({
              title: "Sub department updated successfully",
              color: "success",
            });
            onOpenChange(false);
            dispatch(
              getSubDepartmentList({
                departmentId,
                search: filterValue,
                active: statusFilter,
                page: filteration?.page,
                size: filteration?.size,
              }),
            );
            setRowItem(null);
            reset(defaultValues);
          } else {
            addToast({ title: "Something went wrong !.", color: "danger" });
          }
        })
        .catch(() =>
          addToast({ title: "Something went wrong !.", color: "danger" }),
        );
    } else {
      // Backend assigns its own `code`, so it is intentionally left out of
      // the create payload.
      dispatch(
        createSubDepartment({
          departmentId: Number(departmentId),
          fullName: values?.fullName,
          description: values?.description,
          headUserId: values?.headUserId || null,
          createdByUserId,
        }),
      )
        .then((resp) => {
          if (resp.meta.requestStatus === "fulfilled") {
            addToast({
              title: "Sub department added successfully !.",
              color: "success",
            });
            onOpenChange(false);
            dispatch(
              getSubDepartmentList({
                departmentId,
                search: filterValue,
                active: statusFilter,
                page: filteration?.page,
                size: filteration?.size,
              }),
            );
            reset(defaultValues);
          } else {
            addToast({ title: "Something went wrong !.", color: "danger" });
          }
        })
        .catch(() =>
          addToast({ title: "Something went wrong !.", color: "danger" }),
        );
    }
  };

  const topContent = useMemo(() => {
    return (
      <div className="flex flex-col gap-2">
        <div className="flex justify-between gap-2 items-center flex-wrap">
          <Input
            isClearable
            size="sm"
            className="w-full sm:max-w-[280px]"
            classNames={{ inputWrapper: "h-8 min-h-8" }}
            placeholder="Search sub departments..."
            startContent={<Search className="w-4 h-4 text-default-400" />}
            value={filterValue}
            onClear={onClear}
            onValueChange={onSearchChange}
          />

          <div className="flex gap-1.5 flex-wrap">
            <Dropdown>
              <DropdownTrigger>
                <Button
                  size="sm"
                  variant="flat"
                  endContent={<ChevronDown className="w-3.5 h-3.5" />}
                >
                  {STATUS_FILTER_OPTIONS.find(
                    (option) => option.value === statusFilter,
                  )?.label || "ALL"}
                </Button>
              </DropdownTrigger>
              <DropdownMenu
                disallowEmptySelection
                aria-label="Status filter"
                selectedKeys={[statusFilter || "__all__"]}
                selectionMode="single"
                onSelectionChange={(e) => {
                  let key = Array.from(e)[0];
                  setStatusFilter(key === "__all__" ? "" : key);
                  setFilteration((prev) => ({ ...prev, page: 1 }));
                }}
              >
                {STATUS_FILTER_OPTIONS.map((option) => (
                  <DropdownItem key={option.value || "__all__"}>
                    {option.label}
                  </DropdownItem>
                ))}
              </DropdownMenu>
            </Dropdown>

            <Button
              size="sm"
              color="primary"
              onPress={handleOpenCreateModal}
              endContent={<Plus className="w-3.5 h-3.5" />}
            >
              Add Sub Department
            </Button>
          </div>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-default-400 text-[12.5px]">
            Total {count} sub departments
          </span>

          <label className="flex items-center gap-1 text-default-400 text-[12.5px]">
            Rows per page:
            <select
              className="bg-transparent outline-hidden text-default-400 text-[12.5px] cursor-pointer"
              onChange={onRowsPerPageChange}
              value={filteration?.size}
            >
              <option value="10">10</option>
              <option value="25">25</option>
              <option value="50">50</option>
              <option value="100">100</option>
            </select>
          </label>
        </div>
      </div>
    );
  }, [
    filterValue,
    statusFilter,
    onSearchChange,
    onClear,
    count,
    filteration?.size,
    onRowsPerPageChange,
  ]);

  const bottomContent = useMemo(() => {
    return (
      <div className="py-1.5 px-1 flex justify-between items-center">
        <span className="w-[30%] text-[12.5px] text-default-400">
          Page {filteration?.page} of {pages}
        </span>

        <Pagination
          isCompact
          showControls
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
  }, [filteration?.page, pages, onPreviousPage, onNextPage]);

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-1.5 text-[12.5px] text-default-400">
        <Link className="hover:underline" to="../../department">
          Departments
        </Link>
        <span>/</span>
        <span className="text-default-600">
          {departmentName || "Sub departments"}
        </span>
      </div>

      <h1 className="font-sans text-lg font-semibold mb-2 shrink-0">
        Sub departments
      </h1>

      <Table
        isHeaderSticky
        removeWrapper={false}
        aria-label="Sub departments table"
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
        topContent={topContent}
        topContentPlacement="outside"
      >
        <TableHeader columns={columns}>
          {(column) => (
            <TableColumn
              key={column.uid}
              align={column.uid === "actions" ? "center" : "start"}
            >
              {column.name}
            </TableColumn>
          )}
        </TableHeader>

        <TableBody emptyContent={"No data found"} items={data}>
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
        onOpenChange={(open) => {
          onOpenChange(open);
          if (!open) {
            setRowItem(null);
            reset(defaultValues);
          }
        }}
        placement="top-center"
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader>
                {rowItem ? "Update sub department" : "Add sub department"}
              </ModalHeader>
              <ModalBody>
                <form
                  onSubmit={handleSubmit(onSubmit)}
                  className="flex flex-col gap-4"
                >
                  <div className="grid gap-4 max-h-[60vh] p-2 overflow-auto">
                    <Controller
                      name="fullName"
                      control={control}
                      render={({ field, fieldState: { error } }) => (
                        <Input
                          isRequired
                          label="Sub department name"
                          errorMessage={error?.message}
                          isInvalid={!!error}
                          value={field.value}
                          onChange={(e) => field.onChange(e.target.value)}
                        />
                      )}
                    />

                    <Controller
                      name="description"
                      control={control}
                      render={({ field, fieldState: { error } }) => (
                        <Input
                          label="Description"
                          errorMessage={error?.message}
                          isInvalid={!!error}
                          value={field.value}
                          onChange={(e) => field.onChange(e.target.value)}
                        />
                      )}
                    />

                    <Controller
                      name="headUserId"
                      control={control}
                      render={({ field }) => (
                        <NewSelect
                          label="Head"
                          placeholder="Select head"
                          data={userListByDepartment || []}
                          labelKey="fullName"
                          valueKey="id"
                          isClearable
                          value={field.value}
                          onChange={(value) => field.onChange(value)}
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
    </div>
  );
};

export default SubDepartment;
