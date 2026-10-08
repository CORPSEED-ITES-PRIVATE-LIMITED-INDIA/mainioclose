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
  Textarea,
  addToast,
  useDisclosure,
} from "@heroui/react";

import { zodResolver } from "@hookform/resolvers/zod";

import { useCallback, useEffect, useMemo, useState } from "react";

import { Controller, useForm } from "react-hook-form";

import * as z from "zod";

import { useDispatch, useSelector } from "react-redux";

import { ChevronDown, EllipsisVertical, Plus, Search } from "lucide-react";

import { Link, useLocation, useNavigate, useParams } from "react-router-dom";

import dayjs from "dayjs";

import {
  allocateCompaniesToSubDepartment,
  createSubDepartment,
  getAllSolutionList,
  getApprovedCompaniesList,
  getSubDepartmentCompanies,
  getSolutionsBySubDepartmentId,
  getSubDepartmentList,
  updateSubDepartment,
  updateSubDepartmentSolutions,
} from "../../toolkit/slices/settingSlice";

import { getUsersListByDepartmentId } from "../../toolkit/slices/commonSlice";

import NewSelect from "../../components/NewSelect";

const columns = [
  { name: "ID", uid: "id" },

  { name: "SUB DEPARTMENT", uid: "fullName" },

  { name: "DESCRIPTION", uid: "description" },

  { name: "SOLUTIONS", uid: "solutions" },

  { name: "COMPANIES", uid: "companies" },

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

const mapSolutionsFormSchema = z.object({
  solutionIds: z.array(z.string()),
});

const mapSolutionsDefaultValues = {
  solutionIds: [],
};

const mapCompaniesFormSchema = z.object({
  companyIds: z.array(z.string()).min(1, "please select at least one company"),

  reason: z.string().optional(),
});

const mapCompaniesDefaultValues = {
  companyIds: [],

  reason: "",
};

const SubDepartment = () => {
  const dispatch = useDispatch();

  const { departmentId } = useParams();

  const location = useLocation();

  const navigate = useNavigate();

  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  const mapCompaniesModal = useDisclosure();

  const mapSolutionsModal = useDisclosure();

  const currentUser = useSelector((state) => state.auth.currentUser);

  const createdByUserId = currentUser?.id || currentUser?.userId;

  const subDepartmentList = useSelector(
    (state) => state.setting.subDepartmentList,
  );

  // Normalized here, once, so every row is guaranteed an `id` and `fullName`

  // regardless of whether the backend sends those or subDepartmentId/

  // subDepartmentName — everything below just uses `.id`/`.fullName`.

  const data = useMemo(
    () =>
      (subDepartmentList || []).map((item) => ({
        ...item,

        id: item?.id ?? item?.subDepartmentId,

        fullName: item?.fullName ?? item?.subDepartmentName,
      })),

    [subDepartmentList],
  );

  const departmentName =
    location?.state?.departmentName || data?.[0]?.departmentName;

  const userListByDepartment = useSelector(
    (state) => state.common.userListByDepartment,
  );

  // Company-wide solution list, used as the pick-list for "Map Solutions" —

  // a sub-department can be mapped to any solution, not just ones it

  // already has.

  const allSolutionList = useSelector((state) => state.setting.allSolutionList);

  const approvedCompaniesList = useSelector(
    (state) => state.setting.approvedCompaniesList,
  );

  const isCompaniesLoading =
    useSelector((state) => state.setting.approvedCompaniesLoading) ===
    "pending";

  const [filterValue, setFilterValue] = useState("");

  const [statusFilter, setStatusFilter] = useState("");

  const [rowItem, setRowItem] = useState(null);

  const [viewingSubDepartment, setViewingSubDepartment] = useState(null);

  const [filteration, setFilteration] = useState({
    page: 1,

    size: 50,
  });

  const { control, handleSubmit, reset } = useForm({
    resolver: zodResolver(formSchema),

    defaultValues,
  });

  const mapSolutionsForm = useForm({
    resolver: zodResolver(mapSolutionsFormSchema),

    defaultValues: mapSolutionsDefaultValues,
  });

  const mapCompaniesForm = useForm({
    resolver: zodResolver(mapCompaniesFormSchema),

    defaultValues: mapCompaniesDefaultValues,
  });

  useEffect(() => {
    dispatch(getUsersListByDepartmentId(departmentId));
  }, [dispatch, departmentId]);

  useEffect(() => {
    dispatch(getSubDepartmentList({ departmentId }));
  }, [dispatch, departmentId]);

  const hasSearchFilter = Boolean(filterValue);

  // The backend endpoint has no search/active/page/size query params, so

  // filtering and pagination happen client-side over the full array it

  // returns.

  const filteredItems = useMemo(() => {
    let filtered = [...data];

    if (hasSearchFilter) {
      const needle = filterValue.toLowerCase();

      filtered = filtered.filter((item) =>
        Object.values(item || {}).some((val) => {
          if (val === null || typeof val === "object") return false;

          return String(val).toLowerCase().includes(needle);
        }),
      );
    }

    if (statusFilter !== "") {
      const wantActive = statusFilter === "true";

      filtered = filtered.filter(
        (item) => Boolean(item?.active) === wantActive,
      );
    }

    return filtered;
  }, [data, filterValue, hasSearchFilter, statusFilter]);

  const count = filteredItems.length;

  const pages = Math.ceil(count / filteration?.size) || 1;

  const pagedItems = useMemo(() => {
    const start = (filteration?.page - 1) * filteration?.size;

    const end = start + filteration?.size;

    return filteredItems.slice(start, end);
  }, [filteredItems, filteration]);

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

  const handleViewSolutions = (rowData) => {
    navigate(`${rowData?.id}/solutions`, {
      state: { subDepartmentName: rowData?.fullName },
    });
  };

  const handleOpenMapSolutionsModal = (rowData) => {
    setViewingSubDepartment(rowData);

    mapSolutionsForm.reset(mapSolutionsDefaultValues);

    dispatch(getAllSolutionList(createdByUserId));

    dispatch(getSolutionsBySubDepartmentId(rowData?.id)).then((resp) => {
      if (resp.meta.requestStatus === "fulfilled") {
        mapSolutionsForm.reset({
          solutionIds: (resp.payload || []).map((mapping) =>
            String(mapping.solutionId),
          ),
        });
      }
    });

    mapSolutionsModal.onOpen();
  };

  const handleViewCompanies = (rowData) => {
    navigate(`${rowData?.id}/companies`, {
      state: { subDepartmentName: rowData?.fullName },
    });
  };

  // Pre-selects the companies already allocated to this sub-department so the

  // admin edits the current set instead of starting from empty.

  const handleOpenMapCompaniesModal = (rowData) => {
    setViewingSubDepartment(rowData);

    mapCompaniesForm.reset(mapCompaniesDefaultValues);

    // CHANGE 1: surface a failed fetch instead of leaving the list silently empty

    dispatch(getApprovedCompaniesList()).then((resp) => {
      if (resp.meta.requestStatus !== "fulfilled") {
        addToast({
          title: "Could not load companies",

          description: resp?.payload?.data?.message || resp?.payload?.message,

          color: "danger",
        });
      }
    });

    dispatch(
      getSubDepartmentCompanies({
        subDepartmentId: rowData?.id,

        requestingUserId: createdByUserId,
      }),
    ).then((resp) => {
      if (resp.meta.requestStatus === "fulfilled") {
        mapCompaniesForm.reset({
          ...mapCompaniesDefaultValues,

          companyIds: (resp.payload || [])

            .filter((assignment) => assignment?.active !== false)

            .map((assignment) => String(assignment.companyId)),
        });
      }
    });

    mapCompaniesModal.onOpen();
  };

  const handleMapCompanies = (values) => {
    dispatch(
      allocateCompaniesToSubDepartment({
        subDepartmentId: viewingSubDepartment?.id,

        data: {
          companyIds: (values?.companyIds || []).map(Number),

          adminUserId: Number(createdByUserId),

          reason: values?.reason || "",
        },
      }),
    )
      .then((resp) => {
        if (resp.meta.requestStatus === "fulfilled") {
          addToast({
            title: "Companies mapped successfully !.",

            color: "success",
          });

          mapCompaniesModal.onOpenChange(false);

          mapCompaniesForm.reset(mapCompaniesDefaultValues);
        } else {
          addToast({
            title: "Something went wrong !.",

            description: resp?.payload?.message,

            color: "danger",
          });
        }
      })

      .catch(() =>
        addToast({ title: "Something went wrong !.", color: "danger" }),
      );
  };

  const handleMapSolutions = (values) => {
    dispatch(
      updateSubDepartmentSolutions({
        subDepartmentId: viewingSubDepartment?.id,

        data: {
          solutionIds: (values?.solutionIds || []).map(Number),

          updatedByUserId: Number(createdByUserId),
        },
      }),
    )
      .then((resp) => {
        if (resp.meta.requestStatus === "fulfilled") {
          addToast({
            title: "Solutions mapped successfully !.",

            color: "success",
          });

          mapSolutionsModal.onOpenChange(false);

          dispatch(getSolutionsBySubDepartmentId(viewingSubDepartment?.id));
        } else {
          addToast({ title: "Something went wrong !.", color: "danger" });
        }
      })

      .catch(() =>
        addToast({ title: "Something went wrong !.", color: "danger" }),
      );
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

      case "solutions":
        return (
          <Button
            size="sm"
            variant="flat"
            onPress={() => handleViewSolutions(rowData)}
          >
            View Solutions
          </Button>
        );

      case "companies":
        return (
          <Button
            size="sm"
            variant="flat"
            onPress={() => handleViewCompanies(rowData)}
          >
            View Companies
          </Button>
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

                  if (key === "mapSolutions") {
                    handleOpenMapSolutionsModal(rowData);
                  }

                  if (key === "mapCompanies") {
                    handleOpenMapCompaniesModal(rowData);
                  }
                }}
              >
                {/* <DropdownItem key="edit">Edit</DropdownItem> */}

                <DropdownItem key="mapSolutions">Map Solutions</DropdownItem>

                <DropdownItem key="mapCompanies">Map Companies</DropdownItem>
              </DropdownMenu>
            </Dropdown>
          </div>
        );

      default:
        return rowData?.[columnKey] || "-";
    }
  }, []);

  // Options for the "Map Solutions" multi-select — normalizes

  // getAllSolutionList's id/name/type into the displayLabel NewSelect wants.

  const solutionOptions = useMemo(() => {
    return (allSolutionList || []).map((solution) => ({
      ...solution,

      displayLabel: solution?.type
        ? `${solution?.name} (${solution?.type})`
        : solution?.name,
    }));
  }, [allSolutionList]);

  // CHANGE 2: approvedCompaniesList may be the raw API body

  // ({ success, data: [...] }) or a plain array, depending on how the slice

  // stores it, so handle both. Labels come from `companyName`.

  const companyOptions = useMemo(() => {
    const list = Array.isArray(approvedCompaniesList)
      ? approvedCompaniesList
      : approvedCompaniesList?.data || [];

    return list.map((company) => ({
      ...company,

      displayLabel: company?.companyName ?? company?.name ?? "-",
    }));
  }, [approvedCompaniesList]);

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

            dispatch(getSubDepartmentList({ departmentId }));

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

            dispatch(getSubDepartmentList({ departmentId }));

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
      <div className="flex min-w-0 flex-col gap-2">
        <div className="flex min-w-0 flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <Input
            isClearable
            size="sm"
            className="w-full min-w-0 sm:max-w-[320px]"
            classNames={{ inputWrapper: "h-9 min-h-9" }}
            placeholder="Search sub departments..."
            startContent={
              <Search className="h-4 w-4 shrink-0 text-default-400" />
            }
            value={filterValue}
            onClear={onClear}
            onValueChange={onSearchChange}
          />

          <div className="flex w-full min-w-0 flex-col gap-2 sm:w-auto sm:flex-row sm:flex-wrap sm:justify-end">
            <Dropdown>
              <DropdownTrigger>
                <Button
                  size="sm"
                  variant="flat"
                  className="w-full sm:w-auto"
                  endContent={<ChevronDown className="h-3.5 w-3.5 shrink-0" />}
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
                  const key = Array.from(e)[0];
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
              className="w-full sm:w-auto"
              onPress={handleOpenCreateModal}
              endContent={<Plus className="h-3.5 w-3.5 shrink-0" />}
            >
              Add Sub Department
            </Button>
          </div>
        </div>

        <div className="flex min-w-0 flex-wrap items-center justify-between gap-x-3 gap-y-1">
          <span className="text-[12.5px] text-default-400">
            Total {count} sub departments
          </span>

          <label className="flex shrink-0 items-center gap-1 text-[12.5px] text-default-400">
            <span className="hidden min-[390px]:inline">Rows per page:</span>
            <span className="min-[390px]:hidden">Rows:</span>
            <select
              className="cursor-pointer bg-transparent text-[12.5px] text-default-400 outline-none"
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
      <div className="flex min-w-0 flex-col gap-2 px-1 py-1.5 sm:flex-row sm:items-center sm:justify-between">
        <span className="text-center text-[12.5px] text-default-400 sm:w-[30%] sm:text-left">
          Page {filteration?.page} of {pages}
        </span>

        <div className="flex min-w-0 justify-center overflow-x-auto">
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
        </div>

        <div className="hidden w-[30%] justify-end gap-2 md:flex">
          <Button
            isDisabled={filteration?.page <= 1}
            size="sm"
            variant="flat"
            onPress={onPreviousPage}
          >
            Previous
          </Button>
          <Button
            isDisabled={filteration?.page >= pages}
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

  const responsiveModalClassNames = {
    wrapper: "p-2 sm:p-4",
    base: "m-0 w-full max-w-[calc(100vw-1rem)] overflow-hidden sm:max-w-xl max-h-[calc(100dvh-1rem)] sm:max-h-[calc(100dvh-2rem)]",
    header:
      "shrink-0 break-words border-b border-default-200 px-4 py-3 pr-10 text-base sm:px-6 sm:py-4 sm:text-lg",
    body: "min-h-0 overflow-y-auto px-4 py-4 sm:px-6",
    footer: "shrink-0 border-t border-default-200 px-4 py-3 sm:px-6 sm:py-4",
  };

  return (
    <div className="flex w-full min-w-0 flex-col gap-2 overflow-hidden">
      <h1 className="mb-2 shrink-0 font-sans text-lg font-semibold">
        Sub departments
      </h1>

      <Table
        isHeaderSticky
        removeWrapper={false}
        aria-label="Sub departments table"
        bottomContent={bottomContent}
        bottomContentPlacement="outside"
        classNames={{
          base: "min-w-0 gap-2.5 overflow-hidden",

          wrapper:
            "max-h-[calc(100dvh-300px)] min-h-[240px] w-full max-w-full overflow-auto overscroll-contain rounded-lg border border-gray-200 p-0 shadow-none dark:border-white/10 sm:max-h-[calc(100dvh-320px)]",

          table: "min-w-[1050px] w-full",

          thead: "[&>tr]:first:rounded-none",

          th: "sticky top-0 z-10 h-8 whitespace-nowrap border-b border-gray-200 bg-gray-50 py-0 text-[11.5px] tracking-wide text-default-500 first:rounded-none last:rounded-none dark:border-white/10 dark:bg-neutral-900",

          td: "max-w-[260px] break-words py-1.5 text-[12.5px] align-middle",
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

        <TableBody emptyContent={"No data found"} items={pagedItems}>
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
        placement="center"
        scrollBehavior="inside"
        classNames={responsiveModalClassNames}
      >
        <ModalContent>
          {(onClose) => (
            <form
              onSubmit={handleSubmit(onSubmit)}
              className="flex max-h-full min-h-0 flex-col overflow-hidden"
            >
              <ModalHeader>
                {rowItem ? "Update sub department" : "Add sub department"}
              </ModalHeader>

              <ModalBody>
                <div className="grid min-w-0 gap-4">
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
                      <div className="w-full min-w-0">
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
                      </div>
                    )}
                  />
                </div>
              </ModalBody>

              <ModalFooter className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                <Button className="w-full sm:w-auto" onPress={onClose}>
                  Cancel
                </Button>
                <Button
                  className="w-full sm:w-auto"
                  color="primary"
                  type="submit"
                >
                  Submit
                </Button>
              </ModalFooter>
            </form>
          )}
        </ModalContent>
      </Modal>

      <Modal
        size="xl"
        isDismissable={false}
        isKeyboardDismissDisabled={true}
        isOpen={mapSolutionsModal.isOpen}
        onOpenChange={(open) => {
          mapSolutionsModal.onOpenChange(open);
          if (!open) {
            mapSolutionsForm.reset(mapSolutionsDefaultValues);
          }
        }}
        placement="center"
        scrollBehavior="inside"
        classNames={responsiveModalClassNames}
      >
        <ModalContent>
          {(onClose) => (
            <form
              onSubmit={mapSolutionsForm.handleSubmit(handleMapSolutions)}
              className="flex max-h-full min-h-0 flex-col overflow-hidden"
            >
              <ModalHeader>
                Map Solutions — {viewingSubDepartment?.fullName || "-"}
              </ModalHeader>

              <ModalBody>
                <div className="w-full min-w-0">
                  <Controller
                    name="solutionIds"
                    control={mapSolutionsForm.control}
                    render={({ field }) => (
                      <div className="w-full min-w-0 overflow-hidden">
                        <NewSelect
                          selectionMode="multiple"
                          label="Solutions"
                          placeholder="Select solutions to map"
                          data={solutionOptions}
                          labelKey="displayLabel"
                          valueKey="id"
                          value={field.value}
                          onChange={(value) => field.onChange(value)}
                        />
                      </div>
                    )}
                  />
                </div>
              </ModalBody>

              <ModalFooter className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                <Button className="w-full sm:w-auto" onPress={onClose}>
                  Cancel
                </Button>
                <Button
                  className="w-full sm:w-auto"
                  color="primary"
                  type="submit"
                >
                  Submit
                </Button>
              </ModalFooter>
            </form>
          )}
        </ModalContent>
      </Modal>

      <Modal
        size="xl"
        isDismissable={false}
        isKeyboardDismissDisabled={true}
        isOpen={mapCompaniesModal.isOpen}
        onOpenChange={(open) => {
          mapCompaniesModal.onOpenChange(open);
          if (!open) {
            mapCompaniesForm.reset(mapCompaniesDefaultValues);
          }
        }}
        placement="center"
        scrollBehavior="inside"
        classNames={responsiveModalClassNames}
      >
        <ModalContent>
          {(onClose) => (
            <form
              onSubmit={mapCompaniesForm.handleSubmit(handleMapCompanies)}
              className="flex max-h-full min-h-0 flex-col overflow-hidden"
            >
              <ModalHeader>
                Map Companies — {viewingSubDepartment?.fullName || "-"}
              </ModalHeader>

              <ModalBody>
                <div className="grid min-w-0 gap-4">
                  <Controller
                    name="companyIds"
                    control={mapCompaniesForm.control}
                    render={({ field, fieldState: { error } }) => (
                      <div className="w-full min-w-0 overflow-hidden">
                        <NewSelect
                          isRequired
                          selectionMode="multiple"
                          label="Companies"
                          placeholder={
                            isCompaniesLoading
                              ? "Loading companies..."
                              : "Select companies to map"
                          }
                          data={companyOptions}
                          labelKey="displayLabel"
                          valueKey="id"
                          isInvalid={!!error}
                          errorMessage={error?.message}
                          value={field.value}
                          onChange={(value) => field.onChange(value)}
                        />
                      </div>
                    )}
                  />

                  <Controller
                    name="reason"
                    control={mapCompaniesForm.control}
                    render={({ field }) => (
                      <Textarea
                        label="Reason"
                        minRows={2}
                        maxRows={6}
                        value={field.value}
                        onChange={(e) => field.onChange(e.target.value)}
                      />
                    )}
                  />
                </div>
              </ModalBody>

              <ModalFooter className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                <Button className="w-full sm:w-auto" onPress={onClose}>
                  Cancel
                </Button>
                <Button
                  className="w-full sm:w-auto"
                  color="primary"
                  type="submit"
                >
                  Submit
                </Button>
              </ModalFooter>
            </form>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
};

export default SubDepartment;
