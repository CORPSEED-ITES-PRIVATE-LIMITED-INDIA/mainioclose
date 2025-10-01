import {
  Button,
  Chip,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
  Input,
  Pagination,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
  Tooltip,
  useDisclosure,
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerBody,
  DrawerFooter,
  getKeyValue,
} from "@heroui/react";
import { Award, ChevronDown, EllipsisVertical, Search } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useParams } from "react-router-dom";
import {
  getAllNewCompanies,
  getHistoryByCompanyId,
} from "../../toolkit/slices/companySlice";
import NewSelect from "../../components/NewSelect";
import { getDashboardUsersByHeirarchy } from "../../toolkit/slices/dashboardSlice";
import dayjs from "dayjs";
import CreateCompanyForm from "./CreateCompanyForm";

export const columns = [
  { name: "ID", uid: "companyId", sortable: true },
  { name: "COMPANY NAME", uid: "companyName", sortable: true },
  { name: "GST", uid: "gstNo" },
  { name: "ASSIGNEE", uid: "assignee" },
  { name: "CLIENT", uid: "client" },
  { name: "PRIMARY ADDRESS", uid: "primaryAddres" },
  { name: "SECONDARY ADDRESS", uid: "secondaryAddress" },
  { name: "ACTIONS", uid: "actions" },
];

export function capitalize(s) {
  return s ? s.charAt(0).toUpperCase() + s.slice(1).toLowerCase() : "";
}

const INITIAL_VISIBLE_COLUMNS = [
  "companyName",
  "gstNo",
  "email",
  "assignee",
  "client",
  "primaryAddres",
  "actions",
];

const Company = () => {
  const { userId } = useParams();
  const dispatch = useDispatch();
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const historyDrawer = useDisclosure();
  const count = useSelector(
    (state) => state.company.newCompaniesList?.[0]?.total
  );
  const data = useSelector((state) => state.company.newCompaniesList);
  const companyHistory = useSelector(
    (state) => state.company.companyHistoryList
  );
  const allLeadUser = useSelector((state) => state.dashboard.dashboardUsers);
  const currentRoles = useSelector((state) => state?.auth?.roles);
  const countryList = useSelector((state) => state.common.countriesList);
  const statesList = useSelector((state) => state.common.statesList);
  const citiesList = useSelector((state) => state.common.citiesList);
  const [filterValue, setFilterValue] = useState("");
  const [selectedKeys, setSelectedKeys] = useState(new Set([]));
  const [visibleColumns, setVisibleColumns] = useState(
    new Set(INITIAL_VISIBLE_COLUMNS)
  );
  const [sortDescriptor, setSortDescriptor] = useState({
    column: "age",
    direction: "ascending",
  });
  const [companyFilteration, setCompanyFilteration] = useState({
    userId: userId,
    page: 1,
    size: 50,
    filterUserId: "",
    type: "all",
    rating: "all",
  });
  const [editData, setEditData] = useState(null);

  const hasSearchFilter = Boolean(filterValue);

  useEffect(() => {
    dispatch(getAllNewCompanies(companyFilteration));
  }, [dispatch, companyFilteration]);

  useEffect(() => {
    dispatch(getDashboardUsersByHeirarchy(userId));
  }, []);

  const headerColumns = useMemo(() => {
    if (visibleColumns === "all") return columns;

    return columns.filter((column) =>
      Array.from(visibleColumns).includes(column.uid)
    );
  }, [visibleColumns]);

  const filteredItems = useMemo(() => {
    let filteredUsers = [...(data || [])];

    if (hasSearchFilter) {
      filteredUsers = filteredUsers.filter((item) =>
        Object.values(item)?.some((val) =>
          String(val)?.toLowerCase()?.includes(filterValue?.toLowerCase())
        )
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

  const renderCell = useCallback((company, columnKey) => {
    switch (columnKey) {
      case "companyName":
        return (
          <div className="flex items-start gap-2">
            <Tooltip content={company?.rating}>
              <Award
                className="w-5 h-5 mt-1"
                color={
                  company?.rating === "Gold"
                    ? "#FFD700"
                    : company?.rating === "Silver"
                      ? "#C0C0C0"
                      : "#CD7F32"
                }
              />
            </Tooltip>
            <div className="flex flex-col">
              <Link
                to={`${company?.companyId}/gstDetails`}
                className="font-semibold"
              >
                {company?.companyName || "-"}
              </Link>
              <span className="text-sm text-gray-400">
                Age:{company?.age || "---"} yrs
              </span>
            </div>
          </div>
        );

      case "gstNo":
        return (
          <div className="flex flex-col gap-1">
            <span className="font-normal">{company.gstNo || "-"}</span>
            {company?.gstType && (
              <Chip
                className="capitalize text-tiny"
                color="secondary"
                size="sm"
                variant="flat"
              >
                {company?.gstType || "-"}
              </Chip>
            )}
          </div>
        );
      case "assignee":
        return (
          <div className="flex flex-col">
            <span className="font-normal">{company.assignee || "-"}</span>
          </div>
        );
      case "client":
        return (
          <div className="flex flex-col">
            <span className="font-normal">
              {company.clientContactEmail || "-"}
            </span>
            <span className="text-sm text-gray-400">
              {company.clientContactNo || "-"}
            </span>
          </div>
        );
      case "primaryAddres":
        return (
          <div className="flex flex-col">
            <span className="font-normal">{company.address || "-"}</span>
            <span className="text-sm text-gray-400">
              {company.city || ""},{company?.state},{company?.country}
            </span>
          </div>
        );
      case "secondaryAddress":
        return (
          <div className="flex flex-col">
            <span className="font-normal">{company.secAddress || "-"}</span>
            <span className="text-sm text-gray-400">
              {company.secCity || ""},{company?.secState},{company?.seCountry}
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
              <DropdownMenu>
                <DropdownItem
                  key="history"
                  onPress={() => {
                    historyDrawer.onOpen();
                    dispatch(getHistoryByCompanyId(company?.companyId));
                  }}
                >
                  History
                </DropdownItem>
                <DropdownItem
                  key="edit"
                  onPress={() => {
                    onOpen();
                    setEditData(company);
                  }}
                >
                  Edit
                </DropdownItem>
              </DropdownMenu>
            </Dropdown>
          </div>
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
            <div className="w-[200px]">
              {" "}
              <NewSelect
                data={allLeadUser}
                value={companyFilteration?.filterUserId}
                placeholder={"Users"}
                label={null}
                labelKey={"name"}
                valueKey={"id"}
                onChange={(e) => {
                  setCompanyFilteration((prev) => ({
                    ...prev,
                    filterUserId: e,
                  }));
                }}
              />
            </div>
            <Dropdown>
              <DropdownTrigger>
                <Button
                  className="capitalize"
                  variant="flat"
                  endContent={<ChevronDown />}
                >
                  {companyFilteration?.type}
                </Button>
              </DropdownTrigger>
              <DropdownMenu
                disallowEmptySelection
                aria-label="Single selection example"
                selectedKeys={[companyFilteration?.type]}
                selectionMode="single"
                onSelectionChange={(e) => {
                  let key = Array.from(e);
                  setCompanyFilteration((prev) => ({ ...prev, type: key }));
                }}
              >
                <DropdownItem key="all">All</DropdownItem>
                <DropdownItem key="company">Company</DropdownItem>
                <DropdownItem key="consultant">Consultant</DropdownItem>
              </DropdownMenu>
            </Dropdown>
            <Dropdown>
              <DropdownTrigger>
                <Button
                  className="capitalize"
                  variant="flat"
                  endContent={<ChevronDown />}
                >
                  {companyFilteration?.rating}
                </Button>
              </DropdownTrigger>
              <DropdownMenu
                disallowEmptySelection
                aria-label="Single selection example"
                selectedKeys={[companyFilteration?.rating]}
                selectionMode="single"
                variant="flat"
                onSelectionChange={(e) => {
                  let key = Array.from(e);
                  setCompanyFilteration((prev) => ({ ...prev, rating: key }));
                }}
              >
                <DropdownItem key="all">All</DropdownItem>
                <DropdownItem key="Gold">Gold</DropdownItem>
                <DropdownItem key="Silver">Silver</DropdownItem>
                <DropdownItem key="Bronze">Bronze</DropdownItem>
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
            Total {count} companies
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
    companyFilteration,
    allLeadUser,
  ]);

  const bottomContent = useMemo(() => {
    return (
      <div className="py-2 px-2 flex justify-between items-center">
        <span className="w-[30%] text-small text-default-400">
          {selectedKeys === "all"
            ? "All items selected"
            : `${selectedKeys.size} of ${filteredItems.length} selected`}
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
  }, [selectedKeys, items.length, companyFilteration, pages, hasSearchFilter]);
  return (
    <>
      <h1 className="font-sans text-2xl font-medium mb-1">Company</h1>
      <Table
        isHeaderSticky
        aria-label="Example table with custom cells, pagination and sorting"
        bottomContent={bottomContent}
        bottomContentPlacement="outside"
        classNames={{
          wrapper: "max-h-[70vh] max-w-[87vw]",
          table: "overflow-scroll",
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
            <TableRow key={item.companyId}>
              {(columnKey) => (
                <TableCell>{renderCell(item, columnKey)}</TableCell>
              )}
            </TableRow>
          )}
        </TableBody>
      </Table>
      <Drawer
        isOpen={historyDrawer.isOpen}
        onOpenChange={historyDrawer.onOpenChange}
        size="4xl"
      >
        <DrawerContent>
          {(onClose) => (
            <>
              <DrawerHeader className="flex flex-col gap-1">
                Company history
              </DrawerHeader>
              <DrawerBody>
                <Table aria-label="Example table with dynamic content">
                  <TableHeader
                    columns={[
                      {
                        key: "createDate",
                        label: "DATE",
                      },
                      {
                        key: "eventType",
                        label: "EVENT",
                      },
                      {
                        key: "description",
                        label: "DESCRIPTION",
                      },
                    ]}
                  >
                    {(column) => (
                      <TableColumn key={column.key}>{column.label}</TableColumn>
                    )}
                  </TableHeader>
                  <TableBody items={companyHistory || []}>
                    {(item) => (
                      <TableRow key={item.id}>
                        {(columnKey) => (
                          <TableCell>
                            {columnKey === "createDate"
                              ? dayjs(item?.createDate).format(
                                  "DD-MM-YYYY , HH:mm a"
                                )
                              : getKeyValue(item, columnKey)}
                          </TableCell>
                        )}
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </DrawerBody>
              <DrawerFooter>
                <Button color="danger" variant="light" onPress={onClose}>
                  Close
                </Button>
              </DrawerFooter>
            </>
          )}
        </DrawerContent>
      </Drawer>
      <Drawer isOpen={isOpen} onOpenChange={onOpenChange} size="full">
        <DrawerContent>
          {(onClose) => (
            <>
              <DrawerHeader className="flex flex-col gap-1">
                Edit company details
              </DrawerHeader>
              <DrawerBody>
                <CreateCompanyForm
                  edit={true}
                  editData={editData}
                  onOpenChange={onOpenChange}
                  companyFilteration={companyFilteration}
                  setEditData={setEditData}
                />
              </DrawerBody>
              <DrawerFooter>
                <Button color="danger" variant="light" onPress={onClose}>
                  Close
                </Button>
              </DrawerFooter>
            </>
          )}
        </DrawerContent>
      </Drawer>
    </>
  );
};

export default Company;
