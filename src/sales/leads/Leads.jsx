import React, { useCallback, useEffect, useMemo, useState } from "react";
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
  Chip,
  User,
  Pagination,
  Modal,
  useDisclosure,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  Form,
  Select,
  SelectItem,
  Textarea,
} from "@heroui/react";
import { ChevronDown, EllipsisVertical, Plus, Search } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import {
  getAllLeadCount,
  getAllLeadsByFilter,
} from "../../toolkit/slices/leadSlice";
import { Link, useParams } from "react-router-dom";
import {
  getAllCitiesByStateName,
  getAllCountries,
  getAllStatesByCountryName,
} from "../../toolkit/slices/commonSlice";
import NewSelect from "../../components/NewSelect";

export const columns = [
  { name: "ID", uid: "id", sortable: true },
  { name: "LEAD NAME", uid: "leadName", sortable: true },
  { name: "MOBILE", uid: "mobileNo" },
  { name: "EMAIL", uid: "email" },
  { name: "STATUS", uid: "status", sortable: true },
  { name: "ASSIGNEE", uid: "assignee" },
  { name: "SOURCE", uid: "source" },
  { name: "INDUSTRY", uid: "industry" },
  { name: "CITY", uid: "city" },
  { name: "ACTIONS", uid: "actions" },
];

export function capitalize(s) {
  return s ? s.charAt(0).toUpperCase() + s.slice(1).toLowerCase() : "";
}

const INITIAL_VISIBLE_COLUMNS = [
  "leadName",
  "mobileNo",
  "email",
  "assignee",
  "source",
  "status",
  "industry",
  "city",
  "actions",
];

const Leads = () => {
  const { userId } = useParams();
  const dispatch = useDispatch();
  const data = useSelector((state) => state.leads.allLeads);
  const count = useSelector((state) => state.leads.totalCount);
  const allLeadUser = useSelector((state) => state.leads.allLeadUsers);
  const currentRoles = useSelector((state) => state?.auth?.roles);
  const countryList = useSelector((state) => state.common.countriesList);
  const statesList = useSelector((state) => state.common.statesList);
  const citiesList = useSelector((state) => state.common.citiesList);
  const [filterValue, setFilterValue] = useState("");
  const [selectedKeys, setSelectedKeys] = useState(new Set([]));
  const [visibleColumns, setVisibleColumns] = useState(
    new Set(INITIAL_VISIBLE_COLUMNS)
  );
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortDescriptor, setSortDescriptor] = useState({
    column: "age",
    direction: "ascending",
  });
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [allMultiFilterData, setAllMultiFilterData] = useState({
    userId: userId,
    userIdFilter: [],
    statusId: [1],
    toDate: "",
    fromDate: "",
    updatedToDate: "",
    updatedfromDate: "",
    updatedById: null,
    source: [],
    contactMobileNo: null,
    contactEmail: null,
    sortBy: "id",
    page: 1,
    size: 50,
  });

  const hasSearchFilter = Boolean(filterValue);

  useEffect(() => {
    dispatch(getAllLeadsByFilter(allMultiFilterData));
    dispatch(getAllLeadCount(allMultiFilterData));
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
      filteredUsers = filteredUsers.filter((user) =>
        user.leadName.toLowerCase().includes(filterValue.toLowerCase())
      );
    }
    // if (
    //   statusFilter !== "all" &&
    //   Array.from(statusFilter).length !== statusOptions.length
    // ) {
    //   filteredUsers = filteredUsers.filter((user) =>
    //     Array.from(statusFilter).includes(user.status)
    //   );
    // }

    return filteredUsers;
  }, [data, filterValue, statusFilter]);


  const pages = Math.ceil(count / allMultiFilterData?.size) || 1;

  const items = useMemo(() => {
    const start = (allMultiFilterData?.page - 1) * allMultiFilterData?.size;
    const end = start + allMultiFilterData?.size;

    return filteredItems.slice(start, end);
  }, [allMultiFilterData, filteredItems]);

  const sortedItems = useMemo(() => {
    return [...items].sort((a, b) => {
      const first = a[sortDescriptor.column];
      const second = b[sortDescriptor.column];
      const cmp = first < second ? -1 : first > second ? 1 : 0;

      return sortDescriptor.direction === "descending" ? -cmp : cmp;
    });
  }, [sortDescriptor, items]);

  const renderCell = useCallback((lead, columnKey) => {
    switch (columnKey) {
      case "leadName":
        return (
          <div className="flex flex-col">
            <Link to={`${lead?.id}/leadDetail`} className="font-semibold">
              {lead.leadName || "-"}
            </Link>
            <span className="text-sm text-gray-400">{lead.mobileNo}</span>
          </div>
        );

      case "status":
        return (
          <Chip className="capitalize" color="primary" size="sm" variant="flat">
            {lead.status?.name || "Unknown"}
          </Chip>
        );
      case "assignee":
        return (
          <div className="flex flex-col">
            <span className="font-semibold">
              {lead.assignee?.fullName || "-"}
            </span>
            <span className="text-sm text-gray-400">
              {lead.assignee?.email || ""}
            </span>
          </div>
        );
      case "industry":
        return lead.industries?.name || "-";
      case "city":
        return lead.city || "-";
      case "source":
        return lead.source || "-";
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
                <DropdownItem key="history">
                  <Link to={`${lead?.id}/leadHistory`}>History</Link>
                </DropdownItem>
                <DropdownItem key="edit">Edit</DropdownItem>
                <DropdownItem key="delete">Delete</DropdownItem>
              </DropdownMenu>
            </Dropdown>
          </div>
        );
      default:
        return lead[columnKey] || "-";
    }
  }, []);

  const onNextPage = useCallback(() => {
    if (allMultiFilterData?.page < pages) {
      setAllMultiFilterData((prev) => ({ ...prev, page: prev.page + 1 }));
    }
  }, [allMultiFilterData, pages]);

  const onPreviousPage = useCallback(() => {
    if (allMultiFilterData?.page > 1) {
      setAllMultiFilterData((prev) => ({ ...prev, page: prev.page - 1 }));
    }
  }, [allMultiFilterData]);

  const onRowsPerPageChange = useCallback((e) => {
    setAllMultiFilterData((prev) => ({
      ...prev,
      size: Number(e.target.value),
    }));
    setAllMultiFilterData((prev) => ({ ...prev, page: 1 }));
  }, []);

  const onSearchChange = useCallback((value) => {
    if (value) {
      setFilterValue(value);
      setAllMultiFilterData((prev) => ({ ...prev, page: 1 }));
    } else {
      setFilterValue("");
    }
  }, []);

  const onClear = useCallback(() => {
    setFilterValue("");
    setAllMultiFilterData((prev) => ({ ...prev, page: 1 }));
  }, []);

  const topContent = useMemo(() => {
    return (
      <div className="flex flex-col gap-4">
        <div className="flex justify-between gap-3 items-end">
          <Input
            isClearable
            className="w-full sm:max-w-[44%]"
            placeholder="Search by name..."
            startContent={<Search />}
            value={filterValue}
            onClear={() => onClear()}
            onValueChange={onSearchChange}
          />
          <div className="flex gap-3">
            <Dropdown>
              <DropdownTrigger className="hidden sm:flex">
                <Button endContent={<ChevronDown />} variant="flat">
                  Status
                </Button>
              </DropdownTrigger>
              <DropdownMenu
                disallowEmptySelection
                aria-label="Table Columns"
                closeOnSelect={false}
                selectedKeys={statusFilter}
                selectionMode="multiple"
                onSelectionChange={setStatusFilter}
              >
                {/* {statusOptions.map((status) => (
                  <DropdownItem key={status.uid} className="capitalize">
                    {capitalize(status.name)}
                  </DropdownItem>
                ))} */}
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
            <Button
              color="primary"
              onPress={() => handleOpenModal()}
              endContent={<Plus />}
            >
              Add New
            </Button>
          </div>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-default-400 text-small">
            Total {count} leads
          </span>
          <label className="flex items-center text-default-400 text-small">
            Rows per page:
            <select
              className="bg-transparent outline-hidden text-default-400 text-small"
              onChange={onRowsPerPageChange}
              value={allMultiFilterData?.size}
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
    statusFilter,
    visibleColumns,
    onRowsPerPageChange,
    data.length,
    onSearchChange,
    hasSearchFilter,
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
          page={allMultiFilterData?.page}
          total={pages}
          onChange={(e) => {
            setAllMultiFilterData((prev) => ({ ...prev, page: e }));
            if (e > allMultiFilterData?.page) {
              dispatch(getAllLeadsByFilter({ ...allMultiFilterData, page: e }));
              dispatch(getAllLeadCount({ ...allMultiFilterData, page: e }));
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
  }, [selectedKeys, items.length, allMultiFilterData, pages, hasSearchFilter]);

  const handleOpenModal = () => {
    onOpen();
    dispatch(getAllCountries());
  };

  return (
    <>
    <h1 className="font-sans text-2xl font-medium mb-1">Leads</h1>
      <Table
        isHeaderSticky
        aria-label="Example table with custom cells, pagination and sorting"
        bottomContent={bottomContent}
        bottomContentPlacement="outside"
        classNames={{
          wrapper: "max-h-[500px]",
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
        <TableBody emptyContent={"No users found"} items={sortedItems}>
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
        size="4xl"
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
                Create lead
              </ModalHeader>
              <ModalBody>
                <Form
                  className="w-full flex flex-col gap-4 max-h-[65vh] overflow-auto p-4"
                  onSubmit={(e) => {
                    e.preventDefault();
                    let data = Object.fromEntries(
                      new FormData(e.currentTarget)
                    );

                    console.log(`submit ${JSON.stringify(data)}`);
                  }}
                >
                  <div className="w-full grid grid-cols-2 gap-4">
                    <Input
                      isRequired
                      errorMessage="Please enter lead name"
                      label="Lead name"
                      name="leadName"
                      type="text"
                    />

                    <Input
                      isRequired
                      errorMessage="Please enter a valid client name"
                      label="Client name"
                      name="name"
                      type="text"
                    />

                    <Input label="Email" name="email" type="email" />

                    <Input label="Mobile number" name="mobileNo" type="text" />
                    <Input
                      isRequired
                      label="Company"
                      errorMessage="Please enter company name"
                      name="urls"
                      type="text"
                    />

                    <NewSelect
                      data={countryList}
                      label="Country"
                      name="country"
                      labelKey="name"
                      valueKey="name"
                      onChange={(e) => dispatch(getAllStatesByCountryName(e))}
                    />

                    <NewSelect
                      data={statesList}
                      label="State"
                      name="state"
                      labelKey="name"
                      valueKey="name"
                      onChange={(e) => dispatch(getAllCitiesByStateName(e))}
                    />

                    <NewSelect
                      data={citiesList}
                      label="City"
                      name="city"
                      labelKey="name"
                      valueKey="name"
                    />

                    <Input label="Ip address" name="ipAddress" type="text" />

                    <Select label="Assignee" name="assigneeId">
                      {[
                        { id: "1", name: "Aryan" },
                        { id: "2", name: "Kausahal" },
                        { id: "3", name: "Nishu singh" },
                        { id: "4", name: "Avnish kumar" },
                      ].map((user) => (
                        <SelectItem key={user.id}>{user.name}</SelectItem>
                      ))}
                    </Select>
                    <Select label="Automation" name="auto">
                      {[
                        { id: true, name: "True" },
                        { id: false, name: "False" },
                      ].map((user) => (
                        <SelectItem key={user.id}>{user.name}</SelectItem>
                      ))}
                    </Select>
                    <Select
                      isRequired
                      errorMessage="please select the lead source"
                      label="Source"
                      name="source"
                    >
                      {[
                        "Corpseed Website",
                        "Facebook",
                        "Instagram",
                        "IVR",
                        "Person Reference",
                        "Whatsapp",
                        "Law Zoom website",
                        "Other",
                        "Mail",
                        "Emailer",
                      ].map((user) => (
                        <SelectItem key={user}>{user}</SelectItem>
                      ))}
                    </Select>

                    <Textarea
                      isRequired
                      errorMessage="Please enter address"
                      label="Primary address"
                      name="primaryAddress"
                      type="text"
                    />
                    <Textarea
                      isRequired
                      errorMessage="Please enter lead description"
                      label="Lead description"
                      name="leadDescription"
                      type="text"
                    />
                  </div>
                  <ModalFooter className="w-full flex justify-end">
                    <Button onPress={onClose}>Cancel</Button>
                    <Button color="primary" type="submit">
                      Submit
                    </Button>
                  </ModalFooter>
                </Form>
              </ModalBody>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
};

export default Leads;
