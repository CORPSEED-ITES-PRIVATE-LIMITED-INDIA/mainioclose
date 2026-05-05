import {
  addToast,
  Button,
  Chip,
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
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
  Textarea,
  useDisclosure,
} from "@heroui/react";
import { ChevronDown, EllipsisVertical, Plus, Search } from "lucide-react";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useParams } from "react-router-dom";
import {
  approvedCompanyUnitsInAccount,
  approvedCompanyUnitsInLeads,
  getGstListByCompanyIdInAccounts,
} from "../toolkit/slices/companySlice";

const columns = [
  { name: "ID", uid: "unitId" },
  { name: "UNIT NAME", uid: "name" },
  { name: "STATE NAME", uid: "state" },
  { name: "STATUS", uid: "status" },
  { name: "GST NUMBER", uid: "gstNo" },
  { name: "ADDRESS", uid: "address" },
  { name: "ACTIONS", uid: "actions" },
];

function capitalize(s) {
  return s ? s.charAt(0).toUpperCase() + s.slice(1).toLowerCase() : "";
}

const INITIAL_VISIBLE_COLUMNS = [
  "unitId",
  "name",
  "state",
  "status",
  "gstNo",
  "address",
  "actions",
];

const CompanyUnitsInAccount = () => {
  const { userId, companyId } = useParams();
  const dispatch = useDispatch();
  const { isOpen, onOpen, onClose, onOpenChange } = useDisclosure();
  const count = useSelector(
    (state) => state.company.companyUnitListForAccounts?.length,
  );
  const data = useSelector((state) => state.company.companyUnitListForAccounts);
  const [filterValue, setFilterValue] = useState("");
  const [selectedKeys, setSelectedKeys] = useState(new Set([]));
  const [visibleColumns, setVisibleColumns] = useState(
    new Set(INITIAL_VISIBLE_COLUMNS),
  );
  const [sortDescriptor, setSortDescriptor] = useState({
    column: "age",
    direction: "ascending",
  });
  const [companyFilteration, setCompanyFilteration] = useState({
    userId: userId,
    page: 1,
    size: 50,
    status: "INITIATED",
    companyId,
  });

  const [statusData, setStatusData] = useState({
    approve: null,
    remark: "",
    unitId: null,
  });

  const [selectedUnit, setSelectedUnit] = useState();

  const hasSearchFilter = Boolean(filterValue);

  const {
    isOpen: isUnitModelOpen,
    onOpen: onUnitModalOpen,
    onOpenChange: onUnitModalChange,
  } = useDisclosure();

  useEffect(() => {
    dispatch(getGstListByCompanyIdInAccounts(companyFilteration));
  }, [dispatch, companyId, companyFilteration]);

  const headerColumns = useMemo(() => {
    if (visibleColumns === "all") return columns;

    return columns.filter((column) =>
      Array.from(visibleColumns).includes(column.uid),
    );
  }, [visibleColumns]);

  const filteredItems = useMemo(() => {
    let filteredUsers = [...(data || [])];

    if (hasSearchFilter) {
      filteredUsers = filteredUsers?.filter((item) =>
        Object.values(item)?.some((val) =>
          String(val)?.toLowerCase()?.includes(filterValue?.toLowerCase()),
        ),
      );
    }
    return filteredUsers;
  }, [data, filterValue]);

  const pages = Math.ceil(count / companyFilteration?.size) || 1;

  const items = useMemo(() => {
    const start = (companyFilteration?.page - 1) * companyFilteration?.size;
    const end = start + companyFilteration?.size;

    return filteredItems.slice(start, end);
  }, [companyFilteration, filteredItems]);

  const sortedItems = useMemo(() => {
    return [...items].sort((a, b) => {
      const first = a[sortDescriptor.column];
      const second = b[sortDescriptor.column];
      const cmp = first < second ? -1 : first > second ? 1 : 0;

      return sortDescriptor.direction === "descending" ? -cmp : cmp;
    });
  }, [sortDescriptor, items]);

  const handleChangeCompanyStatus = () => {
    dispatch(
      approvedCompanyUnitsInLeads({
        companyId: companyId,
        reviewedBy: userId,
        unitId: statusData?.unitId,
        data: { approve: statusData?.approve, remark: statusData?.remark },
      }),
    )
      .then((resp) => {
        if (resp.meta.requestStatus === "fulfilled") {
          addToast({
            title: "Company status updated successfully in leads !.",
            color: "success",
          });
          dispatch(
            approvedCompanyUnitsInAccount({
              companyId: companyId,
              reviewedBy: userId,
              unitId: statusData?.unitId,
              data: {
                approve: statusData?.approve,
                remark: statusData?.remark,
              },
            }),
          )
            .then((res) => {
              if (res.meta.requestStatus === "fulfilled") {
                addToast({
                  title: "Company status updated successfully in accounts !.",
                  color: "success",
                });
                onClose();
                dispatch(getGstListByCompanyIdInAccounts(companyFilteration));
              } else {
                addToast({ title: res.payload.data.message, color: "danger" });
              }
            })
            .catch((err) =>
              addToast({
                title: "Something went wrong in accounts",
                color: "danger",
              }),
            );
        } else {
          addToast({ title: resp.payload.data.message, color: "danger" });
        }
      })
      .catch(() =>
        addToast({
          title: "Something went wrong in accounts",
          color: "danger",
        }),
      );
  };

  const renderCell = useCallback((company, columnKey) => {
    switch (columnKey) {
      case "name":
        return (
          <div className="flex items-start gap-2">
            <div className="flex flex-col">
              <p>{company?.unitName || "-"}</p>
            </div>
          </div>
        );

      case "state":
        return (
          <div className="flex items-start gap-2">
            <div className="flex flex-col">{company?.state || "-"}</div>
          </div>
        );
      case "status":
        return (
          <div className="flex items-start gap-2">
            <Chip size="sm">{company?.onboardingStatus || "-"}</Chip>
          </div>
        );

      case "gstNo":
        return (
          <div className="flex flex-col">
            <span className="font-normal">{company.gstNo || "-"}</span>
          </div>
        );
      case "address":
        return company?.addressLine1 ? (
          <div className="flex flex-col">
            <span className="font-normal">{company?.addressLine1 || "-"}</span>
            <span className="text-sm text-gray-400">
              {[
                company?.city,
                company?.state,
                company?.country,
                company?.pinCode,
              ].join(",")}
            </span>
          </div>
        ) : (
          "-"
        );
      case "actions":
        return (
          <Dropdown showArrow>
            <DropdownTrigger>
              <Button size="sm" isIconOnly variant="light">
                <EllipsisVertical />
              </Button>
            </DropdownTrigger>
            <DropdownMenu>
              {company?.onboardingStatus === "INITIATED" ||
                (company?.onboardingStatus === "MINIMAL" && (
                  <DropdownItem
                    onPress={() => {
                      onOpen();
                      setStatusData((pre) => ({
                        ...pre,
                        approve: true,
                        unitId: company?.unitId,
                      }));
                    }}
                  >
                    Approved
                  </DropdownItem>
                ))}

              {company?.onboardingStatus === "INITIATED" ||
                (company?.onboardingStatus === "MINIMAL" && (
                  <DropdownItem
                    onPress={() => {
                      onOpen();
                      setStatusData((pre) => ({
                        ...pre,
                        approve: false,
                        unitId: company?.unitId,
                      }));
                    }}
                  >
                    Disapproved
                  </DropdownItem>
                ))}
              <DropdownItem
                onClick={() => {
                  setSelectedUnit(company);
                  onUnitModalOpen();
                }}
              >
                View Details
              </DropdownItem>
            </DropdownMenu>
          </Dropdown>
        );
      default:
        return company[columnKey] || "-";
    }
  }, []);

  const onNextPage = useCallback(() => {
    if (companyFilteration?.page < pages) {
      setCompanyFilteration((prev) => ({ ...prev, page: prev.page + 1 }));
    }
  }, [companyFilteration, pages]);

  const onPreviousPage = useCallback(() => {
    if (companyFilteration?.page > 1) {
      setCompanyFilteration((prev) => ({ ...prev, page: prev.page - 1 }));
    }
  }, [companyFilteration]);

  const onRowsPerPageChange = useCallback((e) => {
    setCompanyFilteration((prev) => ({
      ...prev,
      size: Number(e.target.value),
      page: 1,
    }));
  }, []);

  const onSearchChange = useCallback((value) => {
    if (value) {
      setFilterValue(value);
      setCompanyFilteration((prev) => ({ ...prev, page: 1 }));
    } else {
      setFilterValue("");
    }
  }, []);

  const onClear = useCallback(() => {
    setFilterValue("");
    setCompanyFilteration((prev) => ({ ...prev, page: 1 }));
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
                <Button
                  endContent={<ChevronDown />}
                  variant="flat"
                  className="capitalize"
                >
                  {companyFilteration?.status}
                </Button>
              </DropdownTrigger>
              <DropdownMenu
                disallowEmptySelection
                aria-label="Table Columns"
                selectionMode="single"
                selectedKeys={[companyFilteration.status]}
                onSelectionChange={(selectedKeys) => {
                  const selected = Array.from(selectedKeys)[0];
                  setCompanyFilteration((prev) => ({
                    ...prev,
                    status: selected || prev.status,
                  }));
                }}
              >
                <DropdownItem key="ALL">ALL</DropdownItem>
                <DropdownItem key="INITIATED">INITIATED</DropdownItem>
                {/* <DropdownItem key="MINIMAL">MINIMAL</DropdownItem> */}
                <DropdownItem key="APPROVED">APPROVED</DropdownItem>
                <DropdownItem key="DISAPPROVED">DISAPPROVED</DropdownItem>
              </DropdownMenu>
            </Dropdown>
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
          </div>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-default-400 text-small">
            Total {count} GST units
          </span>
          <label className="flex items-center text-default-400 text-small">
            Rows per page:
            <select
              className="bg-transparent outline-hidden text-default-400 text-small"
              onChange={onRowsPerPageChange}
              value={companyFilteration?.size}
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
    filterValue,
    visibleColumns,
    onRowsPerPageChange,
    data.length,
    onSearchChange,
    hasSearchFilter,
    companyFilteration?.status,
  ]);

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
          page={companyFilteration?.page}
          total={pages}
          onChange={(e) => {
            setCompanyFilteration((prev) => ({ ...prev, page: e }));
            if (e > companyFilteration?.page) {
              dispatch(getAllNewCompanies({ ...companyFilteration, page: e }));
            }
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
  }, [selectedKeys, count, companyFilteration, pages, hasSearchFilter]);

  return (
    <>
      <h1 className="font-sans text-2xl font-medium mb-1">Unit list</h1>
      <Table
        isHeaderSticky
        aria-label="Example table with custom cells, pagination and sorting"
        bottomContent={bottomContent}
        bottomContentPlacement="outside"
        classNames={{
          wrapper: "2xl:max-h-[68vh] md:max-h-[62vh] w-full",
          table: "w-full",
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
            <TableRow key={item.unitId}>
              {(columnKey) => (
                <TableCell>{renderCell(item, columnKey)}</TableCell>
              )}
            </TableRow>
          )}
        </TableBody>
      </Table>
      <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                Updated status{" "}
                {statusData?.approve ? "Approved" : "Disapproved"}
              </ModalHeader>
              <ModalBody>
                <Textarea
                  label="Remark"
                  isRequired
                  value={statusData.remark}
                  onChange={(e) =>
                    setStatusData((prev) => ({
                      ...prev,
                      remark: e.target.value,
                    }))
                  }
                />
              </ModalBody>
              <ModalFooter>
                <Button variant="light" onPress={onClose}>
                  Close
                </Button>
                <Button
                  color="primary"
                  isDisabled={statusData.remark === ""}
                  onPress={handleChangeCompanyStatus}
                >
                  Submit
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
      {isUnitModelOpen && (
        <div className="fixed inset-0 z-[999]">
          {/* Overlay */}
          <div
            className="absolute inset-0 bg-black/45 backdrop-blur-[2px]"
            onClick={() => onUnitModalChange(false)}
          />

          {/* Drawer */}
          <div
            className="
        absolute right-0 top-0 flex h-screen w-full flex-col
        border-l border-zinc-200 bg-zinc-50 text-zinc-900 shadow-2xl
        animate-[unitDrawerSlideIn_0.28s_ease-out]
        dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100
        md:w-[70%]
      "
          >
            {/* Header */}
            <div className="sticky top-0 z-10 border-b border-zinc-200 bg-zinc-50/90 px-6 py-4 backdrop-blur-md dark:border-zinc-800 dark:bg-zinc-950/90">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
                      {selectedUnit?.unitName || "-"}
                    </h2>

                    <Chip
                      size="sm"
                      variant="flat"
                      color={
                        selectedUnit?.onboardingStatus === "APPROVED"
                          ? "success"
                          : selectedUnit?.onboardingStatus === "DISAPPROVED"
                            ? "danger"
                            : "warning"
                      }
                      className="font-semibold"
                    >
                      {selectedUnit?.onboardingStatus || "-"}
                    </Chip>
                  </div>

                  <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                    Complete GST unit profile, registration details, address and
                    approval status
                  </p>
                </div>

                <Button
                  isIconOnly
                  radius="full"
                  variant="light"
                  onPress={() => onUnitModalChange(false)}
                  className="text-zinc-500 hover:bg-zinc-200 dark:text-zinc-400 dark:hover:bg-zinc-800"
                >
                  ✕
                </Button>
              </div>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto px-6 py-5">
              {/* Top Summary */}
              <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                  <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                    Unit ID
                  </p>
                  <p className="mt-2 text-2xl font-bold text-zinc-900 dark:text-zinc-100">
                    #{selectedUnit?.unitId || "-"}
                  </p>
                </div>

                <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 shadow-sm dark:border-emerald-900/60 dark:bg-emerald-950/30">
                  <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700 dark:text-emerald-400">
                    GST Number
                  </p>
                  <p className="mt-2 break-words text-lg font-bold text-emerald-900 dark:text-emerald-200">
                    {selectedUnit?.gstNo || "-"}
                  </p>
                </div>

                <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 shadow-sm dark:border-amber-900/60 dark:bg-amber-950/30">
                  <p className="text-xs font-semibold uppercase tracking-wide text-amber-700 dark:text-amber-400">
                    State
                  </p>
                  <p className="mt-2 text-2xl font-bold text-amber-900 dark:text-amber-200">
                    {selectedUnit?.state || "-"}
                  </p>
                </div>

                <div className="rounded-2xl border border-stone-200 bg-stone-100 p-4 shadow-sm dark:border-stone-800 dark:bg-stone-900">
                  <p className="text-xs font-semibold uppercase tracking-wide text-stone-600 dark:text-stone-400">
                    Country
                  </p>
                  <p className="mt-2 text-2xl font-bold text-stone-900 dark:text-stone-100">
                    {selectedUnit?.country || "-"}
                  </p>
                </div>
              </div>

              {/* 2 + 2 Detail Sections */}
              <div className="mt-5 grid grid-cols-1 gap-4 xl:grid-cols-2">
                {/* Unit Details */}
                <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                  <h3 className="mb-4 text-sm font-bold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                    Unit Details
                  </h3>

                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-3 border-b border-zinc-100 pb-3 dark:border-zinc-800">
                      <span className="text-sm text-zinc-500 dark:text-zinc-400">
                        Unit Name
                      </span>
                      <span className="max-w-[65%] break-words text-right text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                        {selectedUnit?.unitName || "-"}
                      </span>
                    </div>

                    <div className="flex items-start justify-between gap-3 border-b border-zinc-100 pb-3 dark:border-zinc-800">
                      <span className="text-sm text-zinc-500 dark:text-zinc-400">
                        Unit ID
                      </span>
                      <span className="max-w-[65%] break-words text-right text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                        {selectedUnit?.unitId || "-"}
                      </span>
                    </div>

                    <div className="flex items-start justify-between gap-3 border-b border-zinc-100 pb-3 dark:border-zinc-800">
                      <span className="text-sm text-zinc-500 dark:text-zinc-400">
                        Status
                      </span>
                      <Chip
                        size="sm"
                        variant="flat"
                        color={
                          selectedUnit?.onboardingStatus === "APPROVED"
                            ? "success"
                            : selectedUnit?.onboardingStatus === "DISAPPROVED"
                              ? "danger"
                              : "warning"
                        }
                        className="font-semibold"
                      >
                        {selectedUnit?.onboardingStatus || "-"}
                      </Chip>
                    </div>

                    <div className="flex items-start justify-between gap-3">
                      <span className="text-sm text-zinc-500 dark:text-zinc-400">
                        Company ID
                      </span>
                      <span className="max-w-[65%] break-words text-right text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                        {companyId || "-"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* GST Details */}
                <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                  <h3 className="mb-4 text-sm font-bold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                    GST Details
                  </h3>

                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-3 border-b border-zinc-100 pb-3 dark:border-zinc-800">
                      <span className="text-sm text-zinc-500 dark:text-zinc-400">
                        GST Number
                      </span>
                      <span className="max-w-[65%] break-words text-right text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                        {selectedUnit?.gstNo || "-"}
                      </span>
                    </div>

                    <div className="flex items-start justify-between gap-3 border-b border-zinc-100 pb-3 dark:border-zinc-800">
                      <span className="text-sm text-zinc-500 dark:text-zinc-400">
                        State
                      </span>
                      <span className="max-w-[65%] break-words text-right text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                        {selectedUnit?.state || "-"}
                      </span>
                    </div>

                    <div className="flex items-start justify-between gap-3 border-b border-zinc-100 pb-3 dark:border-zinc-800">
                      <span className="text-sm text-zinc-500 dark:text-zinc-400">
                        City
                      </span>
                      <span className="max-w-[65%] break-words text-right text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                        {selectedUnit?.city || "-"}
                      </span>
                    </div>

                    <div className="flex items-start justify-between gap-3">
                      <span className="text-sm text-zinc-500 dark:text-zinc-400">
                        Pin Code
                      </span>
                      <span className="max-w-[65%] break-words text-right text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                        {selectedUnit?.pinCode || "-"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Address Details */}
                <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                  <h3 className="mb-4 text-sm font-bold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                    Address Details
                  </h3>

                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-3 border-b border-zinc-100 pb-3 dark:border-zinc-800">
                      <span className="text-sm text-zinc-500 dark:text-zinc-400">
                        Address Line 1
                      </span>
                      <span className="max-w-[65%] break-words text-right text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                        {selectedUnit?.addressLine1 || "-"}
                      </span>
                    </div>

                    <div className="flex items-start justify-between gap-3 border-b border-zinc-100 pb-3 dark:border-zinc-800">
                      <span className="text-sm text-zinc-500 dark:text-zinc-400">
                        Address Line 2
                      </span>
                      <span className="max-w-[65%] break-words text-right text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                        {selectedUnit?.addressLine2 || "-"}
                      </span>
                    </div>

                    <div className="flex items-start justify-between gap-3 border-b border-zinc-100 pb-3 dark:border-zinc-800">
                      <span className="text-sm text-zinc-500 dark:text-zinc-400">
                        Country
                      </span>
                      <span className="max-w-[65%] break-words text-right text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                        {selectedUnit?.country || "-"}
                      </span>
                    </div>

                    <div className="flex items-start justify-between gap-3">
                      <span className="text-sm text-zinc-500 dark:text-zinc-400">
                        Full Location
                      </span>
                      <span className="max-w-[65%] break-words text-right text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                        {[
                          selectedUnit?.city,
                          selectedUnit?.state,
                          selectedUnit?.country,
                          selectedUnit?.pinCode,
                        ]
                          .filter(Boolean)
                          .join(", ") || "-"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Approval Summary */}
                <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                  <h3 className="mb-4 text-sm font-bold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                    Approval Summary
                  </h3>

                  <div className="space-y-3">
                    <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 dark:border-amber-900/60 dark:bg-amber-950/30">
                      <p className="text-sm font-semibold text-amber-800 dark:text-amber-300">
                        Current Status
                      </p>
                      <p className="mt-1 text-lg font-bold text-amber-950 dark:text-amber-100">
                        {selectedUnit?.onboardingStatus || "-"}
                      </p>
                    </div>

                    <div className="rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 dark:border-zinc-800 dark:bg-zinc-950">
                      <p className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                        Approval Action
                      </p>
                      <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                        Review GST unit details before approving or disapproving
                        this unit.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="sticky bottom-0 border-t border-zinc-200 bg-zinc-50/90 px-6 py-4 backdrop-blur-md dark:border-zinc-800 dark:bg-zinc-950/90">
              <div className="flex justify-end gap-3">
                <Button variant="flat" onPress={() => onUnitModalChange(false)}>
                  Close
                </Button>

                <Button
                  color="warning"
                  variant="flat"
                  onPress={() => onUnitModalChange(false)}
                >
                  Done
                </Button>
              </div>
            </div>
          </div>

          <style>
            {`
        @keyframes unitDrawerSlideIn {
          from {
            transform: translateX(100%);
            opacity: 0.75;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
      `}
          </style>
        </div>
      )}
    </>
  );
};

export default CompanyUnitsInAccount;
