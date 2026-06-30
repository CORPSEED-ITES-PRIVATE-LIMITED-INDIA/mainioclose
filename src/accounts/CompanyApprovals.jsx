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
  Tooltip,
  useDisclosure,
} from "@heroui/react";
import { ChevronDown, EllipsisVertical, Info, Search } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useParams } from "react-router-dom";
import { getAllCompaniesForApprovals } from "../toolkit/slices/accountSlice";
import {
  approvedCompanyInAccount,
  approvedCompanyInLeads,
} from "../toolkit/slices/companySlice";
import { inrCurrency } from "../common";

const columns = [
  { name: "ID", uid: "companyId" },
  { name: "COMPANY", uid: "companyName", sortable: true },
  { name: "ESTABLISHED DATE", uid: "establishDate" },
  { name: "INDUSTRY", uid: "industryName" },
  { name: "PAN NUMBER", uid: "panNo" },
  { name: "STATUS", uid: "status" },
  { name: "ASSIGNEE", uid: "assignee" },
  { name: "ADDRESS", uid: "address" },
  { name: "ACTIONS", uid: "actions" },
];

function capitalize(s) {
  return s ? s.charAt(0).toUpperCase() + s.slice(1).toLowerCase() : "";
}

const INITIAL_VISIBLE_COLUMNS = [
  "companyId",
  "companyName",
  "establishDate",
  "industryName",
  "panNo",
  "status",
  "assignee",
  "address",
  "actions",
];

const CompanyApprovals = () => {
  const { userId } = useParams();
  const dispatch = useDispatch();
  const { isOpen, onOpen, onClose, onOpenChange } = useDisclosure();
  const count = useSelector(
    (state) => state.account.approvalCompanyList?.length,
  );
  const data = useSelector((state) => state.account.approvalCompanyList);
  const [filterValue, setFilterValue] = useState("");
  const [selectedKeys, setSelectedKeys] = useState(new Set([]));
  const [selectedCompany, setSelectedCompany] = useState();
  const [visibleColumns, setVisibleColumns] = useState(
    new Set(INITIAL_VISIBLE_COLUMNS),
  );
  const [sortDescriptor, setSortDescriptor] = useState({
    column: "age",
    direction: "ascending",
  });
  const [filteration, setFilteration] = useState({
    userId: userId,
    page: 1,
    size: 50,
    status: "INITIATED",
  });

  const [statusData, setStatusData] = useState({
    approve: null,
    remark: "",
    companyId: null,
  });

  const hasSearchFilter = Boolean(filterValue);

  const {
    isOpen: isCompanyModalOpen,
    onOpen: onCompanyModalOpen,
    onOpenChange: onCompanyModalChange,
  } = useDisclosure();

  useEffect(() => {
    dispatch(getAllCompaniesForApprovals(filteration));
  }, [dispatch, filteration]);

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

  const pages = Math.ceil(count / filteration?.size) || 1;

  const sortedItems = useMemo(() => {
    return [...filteredItems].sort((a, b) => {
      const first = a[sortDescriptor.column];
      const second = b[sortDescriptor.column];
      const cmp = first < second ? -1 : first > second ? 1 : 0;

      return sortDescriptor.direction === "descending" ? -cmp : cmp;
    });
  }, [sortDescriptor, filteredItems]);

  const handleChangeCompanyStatus = () => {
    dispatch(
      approvedCompanyInLeads({
        companyId: statusData?.companyId,
        reviewedBy: userId,
        data: { approve: statusData?.approve, remark: statusData?.remark },
      }),
    )
      .then((resp) => {
        if (resp.meta.requestStatus === "fulfilled") {
          addToast({
            title: "SUCCESS",
            description: "Company status updated successfully in leads !.",
            color: "success",
          });
          dispatch(
            approvedCompanyInAccount({
              companyId: statusData?.companyId,
              reviewedBy: userId,
              data: {
                approve: statusData?.approve,
                remark: statusData?.remark,
              },
            }),
          )
            .then((res) => {
              if (res.meta.requestStatus === "fulfilled") {
                addToast({
                  title: "SUCCESS",
                  description:
                    "Company status updated successfully in accounts !.",
                  color: "success",
                });
                onClose();
                dispatch(getAllCompaniesForApprovals(filteration));
              } else {
                addToast({
                  title: "ERROR",
                  description: res.payload.data.message,
                  color: "danger",
                });
              }
            })
            .catch((err) => {
              addToast({
                title: "ERROR",
                description: "Something went wrong in accounts",
                color: "danger",
              });
            });
        } else {
          addToast({
            title: "ERROR",
            description: resp.payload.data.message,
            color: "danger",
          });
        }
      })
      .catch(() => {
        addToast({
          title: "ERROR",
          description: "Something went wrong in accounts",
          color: "danger",
        });
      });
  };

  const renderCell = useCallback((rowData, columnKey) => {
    switch (columnKey) {
      case "companyName":
        return (
          <div className="flex items-start gap-2">
            <div className="flex flex-col">
              <Link
                to={`${rowData?.companyId}/units`}
                className="font-medium capitalize"
              >
                {rowData?.companyName || "-"}
              </Link>
              <p className="font-normal text-xs text-gray-400">
                Age : {rowData?.companyAge || "-"} yrs
              </p>
              <p className="font-normal text-xs text-gray-400">
                Pending units : {rowData?.pendingUnitsCount}
              </p>
            </div>
          </div>
        );

      case "establishDate":
        return (
          <div className="flex items-start gap-2">
            <div className="flex flex-col">
              <p className="font-normal">{rowData?.establishDate || "-"}</p>
              {rowData?.revenue && (
                <p className="font-normal">
                  Revenue : {inrCurrency(rowData?.revenue) || "-"}
                </p>
              )}
            </div>
          </div>
        );

      case "industryName":
        return (
          rowData?.industryName && (
            <div className="flex justify-between">
              {rowData?.industryName}{" "}
              <Tooltip
                content={
                  <div className="w-full">
                    <div className="grid grid-cols-[150px_20px_1fr] gap-y-2 text-sm">
                      <div className="text-gray-600">Industry name</div>
                      <div className="text-gray-600 text-center">:</div>
                      <div className="text-gray-900 dark:text-slate-500 ">
                        {rowData?.industryName}
                      </div>

                      <div className="text-gray-600">Category</div>
                      <div className="text-gray-600 text-center">:</div>
                      <div className="text-gray-900 dark:text-slate-500 ">
                        {rowData?.subIndustryName}
                      </div>

                      <div className="text-gray-600">Subcategory</div>
                      <div className="text-gray-600 text-center">:</div>
                      <div className="text-gray-900 dark:text-slate-500">
                        {rowData?.subSubIndustryName}
                      </div>

                      <div className="text-gray-600">Business activity</div>
                      <div className="text-gray-600 text-center">:</div>
                      <div className="text-gray-900 dark:text-slate-500">
                        {rowData?.industryDataNames?.join(", ")}
                      </div>
                    </div>
                  </div>
                }
              >
                <Info className="w-3 h-3" />
              </Tooltip>
            </div>
          )
        );

      case "panNo":
        return <div className="flex flex-col">{rowData?.panNo}</div>;
      case "status":
        return (
          <div className="flex flex-col">
            <Chip
              size="sm"
              className="text-tiny capitalize"
              variant="flat"
              color={
                rowData?.onboardingStatus === "APPROVED"
                  ? "success"
                  : rowData?.onboardingStatus === "DISAPPROVED"
                    ? "danger"
                    : "secondary"
              }
            >
              {rowData?.onboardingStatus}
            </Chip>
          </div>
        );

      case "assignee":
        return (
          <div className="flex flex-col">
            <span className="font-normal">{rowData?.assigneeName || "-"}</span>
          </div>
        );
      case "address":
        return rowData?.address ? (
          <div className="flex flex-col">
            <span className="font-normal">{rowData?.address || "-"}</span>
            <span className="text-sm text-gray-400">
              {[rowData?.city, rowData?.state, rowData?.country].join(",")}
            </span>
          </div>
        ) : (
          "-"
        );
      case "secondaryAddress":
        return rowData?.secAddress ? (
          <div className="flex flex-col">
            <span className="font-normal">{rowData?.secAddress || "-"}</span>
            <div className="flex items-center gap-1">
              {" "}
              <span className="text-gray-400">{rowData?.secCity || "-"}</span>,
              <span className="text-gray-400">{rowData?.secState || "-"}</span>,
            </div>
            <div className="flex items-center gap-1">
              <span className="text-gray-400 text-tiny">
                {rowData?.seCountry || "-"}
              </span>
            </div>
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
              {(rowData?.onboardingStatus === "INITIATED" ||
                rowData?.onboardingStatus === "MINIMAL") && (
                <DropdownItem
                  onPress={() => {
                    onOpen();
                    setStatusData((pre) => ({
                      ...pre,
                      approve: true,
                      companyId: rowData?.companyId,
                    }));
                  }}
                >
                  Approved
                </DropdownItem>
              )}
              {(rowData?.onboardingStatus === "INITIATED" ||
                rowData?.onboardingStatus === "MINIMAL") && (
                <DropdownItem
                  onPress={() => {
                    onOpen();
                    setStatusData((pre) => ({
                      ...pre,
                      approve: false,
                      companyId: rowData?.companyId,
                    }));
                  }}
                >
                  Disapproved
                </DropdownItem>
              )}
              <DropdownItem
                onClick={() => {
                  setSelectedCompany(rowData);
                  onCompanyModalOpen();
                }}
              >
                View Details
              </DropdownItem>
            </DropdownMenu>
          </Dropdown>
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
                <Button
                  endContent={<ChevronDown />}
                  variant="flat"
                  className="capitalize"
                >
                  {filteration?.status}
                </Button>
              </DropdownTrigger>
              <DropdownMenu
                disallowEmptySelection
                aria-label="Table Columns"
                selectionMode="single"
                selectedKeys={[filteration.status]}
                onSelectionChange={(selectedKeys) => {
                  const selected = Array.from(selectedKeys)[0];
                  setFilteration((prev) => ({
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
            Total {count} companies for approvals
          </span>
          <label className="flex items-center text-default-400 text-small">
            Rows per page:
            <select
              className="bg-transparent outline-hidden text-default-400 text-small"
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
  }, [
    filterValue,
    visibleColumns,
    onRowsPerPageChange,
    data.length,
    onSearchChange,
    hasSearchFilter,
    filteration?.status,
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
          page={filteration?.page}
          total={pages}
          onChange={(e) => {
            setFilteration((prev) => ({ ...prev, page: e }));
            if (e > filteration?.page) {
              dispatch(getAllNewCompanies({ ...filteration, page: e }));
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
  }, [selectedKeys, count, filteration, pages, hasSearchFilter]);

  return (
    <>
      <h1 className="font-sans text-2xl font-medium mb-1">
        Companies for approvals
      </h1>
      <Table
        isHeaderSticky
        aria-label="Example table with custom cells, pagination and sorting"
        bottomContent={bottomContent}
        bottomContentPlacement="outside"
        classNames={{
          wrapper: "2xl:max-h-[68vh] md:max-h-[62vh] w-full",
          table: "w-full",
        }}
        // selectedKeys={selectedKeys}
        // selectionMode="multiple"
        sortDescriptor={sortDescriptor}
        topContent={topContent}
        topContentPlacement="outside"
        // onSelectionChange={setSelectedKeys}
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
            <TableRow key={item.companyId}>
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
      {isCompanyModalOpen && (
        <div className="fixed inset-0 z-[999]">
          {/* Overlay */}
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"
            onClick={() => onCompanyModalChange(false)}
          />

          {/* Drawer */}
          <div
            className={`
        absolute right-0 top-0 h-screen w-full md:w-[70%]
        bg-white text-gray-900 shadow-2xl
        dark:bg-black dark:text-gray-100
        border-l border-gray-200 dark:border-gray-800
        animate-[slideInRight_0.28s_ease-out]
        flex flex-col
      `}
          >
            {/* Header */}
            <div className="sticky top-0 z-10 border-b border-gray-200 bg-white/90 px-6 py-4 backdrop-blur-md dark:border-gray-800 dark:bg-black/90">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
                      {selectedCompany?.companyName || "-"}
                    </h2>

                    <Chip
                      size="sm"
                      variant="flat"
                      color={
                        selectedCompany?.onboardingStatus === "APPROVED"
                          ? "success"
                          : selectedCompany?.onboardingStatus === "DISAPPROVED"
                            ? "danger"
                            : "warning"
                      }
                      className="font-semibold"
                    >
                      {selectedCompany?.onboardingStatus || "-"}
                    </Chip>
                  </div>

                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    Complete company approval overview, business details,
                    documents and unit status
                  </p>
                </div>

                <Button
                  isIconOnly
                  variant="light"
                  radius="full"
                  onPress={() => onCompanyModalChange(false)}
                  className="text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
                >
                  ✕
                </Button>
              </div>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto px-6 py-5">
              {/* Top Summary Cards */}
              <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                <div className="rounded-2xl border border-blue-200 bg-blue-50 p-4 shadow-sm dark:border-blue-900/60 dark:bg-blue-950/30">
                  <p className="text-xs font-semibold uppercase tracking-wide text-blue-600 dark:text-blue-400">
                    Company ID
                  </p>
                  <p className="mt-2 text-2xl font-bold text-blue-900 dark:text-blue-200">
                    #{selectedCompany?.companyId || "-"}
                  </p>
                </div>

                <div className="rounded-2xl border border-green-200 bg-green-50 p-4 shadow-sm dark:border-green-900/60 dark:bg-green-950/30">
                  <p className="text-xs font-semibold uppercase tracking-wide text-green-600 dark:text-green-400">
                    Total Units
                  </p>
                  <p className="mt-2 text-2xl font-bold text-green-900 dark:text-green-200">
                    {selectedCompany?.totalUnits ?? "-"}
                  </p>
                </div>

                <div className="rounded-2xl border border-orange-200 bg-orange-50 p-4 shadow-sm dark:border-orange-900/60 dark:bg-orange-950/30">
                  <p className="text-xs font-semibold uppercase tracking-wide text-orange-600 dark:text-orange-400">
                    Pending Units
                  </p>
                  <p className="mt-2 text-2xl font-bold text-orange-900 dark:text-orange-200">
                    {selectedCompany?.pendingUnitsCount ?? "-"}
                  </p>
                </div>

                <div className="rounded-2xl border border-purple-200 bg-purple-50 p-4 shadow-sm dark:border-purple-900/60 dark:bg-purple-950/30">
                  <p className="text-xs font-semibold uppercase tracking-wide text-purple-600 dark:text-purple-400">
                    Revenue
                  </p>
                  <p className="mt-2 text-2xl font-bold text-purple-900 dark:text-purple-200">
                    {selectedCompany?.revenue
                      ? inrCurrency(selectedCompany.revenue)
                      : "-"}
                  </p>
                </div>
              </div>

              {/* 2 + 2 Section */}
              <div className="mt-5 grid grid-cols-1 gap-4 xl:grid-cols-2">
                {/* Company Details */}
                <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-black/10">
                  <h3 className="mb-4 text-sm font-bold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                    Company Details
                  </h3>

                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-3 border-b border-gray-100 pb-3 dark:border-gray-800">
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        PAN Number
                      </span>
                      <span className="max-w-[65%] break-words text-right text-sm font-semibold text-gray-900 dark:text-gray-100">
                        {selectedCompany?.panNo || "-"}
                      </span>
                    </div>

                    <div className="flex items-start justify-between gap-3 border-b border-gray-100 pb-3 dark:border-gray-800">
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        Established Date
                      </span>
                      <span className="max-w-[65%] break-words text-right text-sm font-semibold text-gray-900 dark:text-gray-100">
                        {selectedCompany?.establishDate
                          ? new Date(
                              selectedCompany.establishDate,
                            ).toLocaleDateString("en-IN", {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            })
                          : "-"}
                      </span>
                    </div>

                    <div className="flex items-start justify-between gap-3 border-b border-gray-100 pb-3 dark:border-gray-800">
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        Submitted At
                      </span>
                      <span className="max-w-[65%] break-words text-right text-sm font-semibold text-gray-900 dark:text-gray-100">
                        {selectedCompany?.submittedAt
                          ? new Date(
                              selectedCompany.submittedAt,
                            ).toLocaleString("en-IN", {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })
                          : "-"}
                      </span>
                    </div>

                    <div className="flex items-start justify-between gap-3">
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        Rating
                      </span>
                      <span className="max-w-[65%] break-words text-right text-sm font-semibold text-gray-900 dark:text-gray-100">
                        {selectedCompany?.rating || "-"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Assignment Details */}
                <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-black/10">
                  <h3 className="mb-4 text-sm font-bold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                    Assignment Details
                  </h3>

                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-3 border-b border-gray-100 pb-3 dark:border-gray-800">
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        Assignee
                      </span>
                      <span className="max-w-[65%] break-words text-right text-sm font-semibold text-gray-900 dark:text-gray-100">
                        {selectedCompany?.assigneeName || "-"}
                      </span>
                    </div>

                    <div className="flex items-start justify-between gap-3 border-b border-gray-100 pb-3 dark:border-gray-800">
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        Consultant
                      </span>
                      <span className="max-w-[65%] break-words text-right text-sm font-semibold text-gray-900 dark:text-gray-100">
                        {selectedCompany?.isConsultant ? "Yes" : "No"}
                      </span>
                    </div>

                    <div className="flex items-start justify-between gap-3 border-b border-gray-100 pb-3 dark:border-gray-800">
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        Parent Company
                      </span>
                      <span className="max-w-[65%] break-words text-right text-sm font-semibold text-gray-900 dark:text-gray-100">
                        {selectedCompany?.parentCompanyName || "-"}
                      </span>
                    </div>

                    <div className="flex items-start justify-between gap-3">
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        Company Age
                      </span>
                      <span className="max-w-[65%] break-words text-right text-sm font-semibold text-gray-900 dark:text-gray-100">
                        {selectedCompany?.companyAge || "-"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Location Details */}
                <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-black/10">
                  <h3 className="mb-4 text-sm font-bold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                    Location Details
                  </h3>

                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-3 border-b border-gray-100 pb-3 dark:border-gray-800">
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        Address
                      </span>
                      <span className="max-w-[65%] break-words text-right text-sm font-semibold text-gray-900 dark:text-gray-100">
                        {selectedCompany?.address || "-"}
                      </span>
                    </div>

                    <div className="flex items-start justify-between gap-3 border-b border-gray-100 pb-3 dark:border-gray-800">
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        City
                      </span>
                      <span className="max-w-[65%] break-words text-right text-sm font-semibold text-gray-900 dark:text-gray-100">
                        {selectedCompany?.city || "-"}
                      </span>
                    </div>

                    <div className="flex items-start justify-between gap-3 border-b border-gray-100 pb-3 dark:border-gray-800">
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        State
                      </span>
                      <span className="max-w-[65%] break-words text-right text-sm font-semibold text-gray-900 dark:text-gray-100">
                        {selectedCompany?.state || "-"}
                      </span>
                    </div>

                    <div className="flex items-start justify-between gap-3 border-b border-gray-100 pb-3 dark:border-gray-800">
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        Country
                      </span>
                      <span className="max-w-[65%] break-words text-right text-sm font-semibold text-gray-900 dark:text-gray-100">
                        {selectedCompany?.country || "-"}
                      </span>
                    </div>

                    <div className="flex items-start justify-between gap-3">
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        Pin Code
                      </span>
                      <span className="max-w-[65%] break-words text-right text-sm font-semibold text-gray-900 dark:text-gray-100">
                        {selectedCompany?.primaryPinCode || "-"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Business Details */}
                <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-black/10">
                  <h3 className="mb-4 text-sm font-bold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                    Business Details
                  </h3>

                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-3 border-b border-gray-100 pb-3 dark:border-gray-800">
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        Industry
                      </span>
                      <span className="max-w-[65%] break-words text-right text-sm font-semibold text-gray-900 dark:text-gray-100">
                        {selectedCompany?.industryName || "-"}
                      </span>
                    </div>

                    <div className="flex items-start justify-between gap-3 border-b border-gray-100 pb-3 dark:border-gray-800">
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        Category
                      </span>
                      <span className="max-w-[65%] break-words text-right text-sm font-semibold text-gray-900 dark:text-gray-100">
                        {selectedCompany?.subIndustryName || "-"}
                      </span>
                    </div>

                    <div className="flex items-start justify-between gap-3 border-b border-gray-100 pb-3 dark:border-gray-800">
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        Sub Industry
                      </span>
                      <span className="max-w-[65%] break-words text-right text-sm font-semibold text-gray-900 dark:text-gray-100">
                        {selectedCompany?.subSubIndustryName || "-"}
                      </span>
                    </div>

                    <div className="flex items-start justify-between gap-3 border-b border-gray-100 pb-3 dark:border-gray-800">
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        Business Activity
                      </span>
                      <span className="max-w-[65%] break-words text-right text-sm font-semibold text-gray-900 dark:text-gray-100">
                        {selectedCompany?.industryDataNames?.join(", ") || "-"}
                      </span>
                    </div>

                    <div className="flex items-start justify-between gap-3">
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        Revenue
                      </span>
                      <span className="max-w-[65%] break-words text-right text-sm font-semibold text-gray-900 dark:text-gray-100">
                        {selectedCompany?.revenue
                          ? inrCurrency(selectedCompany.revenue)
                          : "-"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Document Status */}
              <div className="mt-5 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:dark:bg-black/10">
                <h3 className="mb-4 text-sm font-bold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                  Document Status
                </h3>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="flex items-center justify-between rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 dark:border-gray-800 dark:bg-gray-950">
                    <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                      Agreement
                    </span>

                    <Chip
                      size="sm"
                      variant="flat"
                      color={
                        selectedCompany?.aggrementPresent ? "success" : "danger"
                      }
                      className="font-semibold"
                    >
                      {selectedCompany?.aggrementPresent
                        ? "Available"
                        : "Not Available"}
                    </Chip>
                  </div>

                  <div className="flex items-center justify-between rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 dark:border-gray-800 dark:bg-gray-950">
                    <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                      NDA
                    </span>

                    <Chip
                      size="sm"
                      variant="flat"
                      color={selectedCompany?.ndaPresent ? "success" : "danger"}
                      className="font-semibold"
                    >
                      {selectedCompany?.ndaPresent
                        ? "Available"
                        : "Not Available"}
                    </Chip>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="sticky bottom-0 border-t border-gray-200 bg-white/90 px-6 py-4 backdrop-blur-md dark:border-gray-800 dark:bg-gray-950/90">
              <div className="flex justify-end gap-3">
                <Button
                  variant="flat"
                  onPress={() => onCompanyModalChange(false)}
                >
                  Close
                </Button>

                <Button
                  color="primary"
                  onPress={() => onCompanyModalChange(false)}
                >
                  Done
                </Button>
              </div>
            </div>
          </div>

          <style>
            {`
        @keyframes slideInRight {
          from {
            transform: translateX(100%);
            opacity: 0.7;
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

export default CompanyApprovals;
