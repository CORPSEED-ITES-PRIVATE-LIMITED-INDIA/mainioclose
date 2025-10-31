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
  ModalFooter,
  addToast,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
} from "@heroui/react";
import { Award, ChevronDown, EllipsisVertical, Search } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useParams } from "react-router-dom";
import {
  getAllNewCompanies,
  getHistoryByCompanyId,
  searchCompanies,
  updateMultiCompanyAssignee,
} from "../../toolkit/slices/companySlice";
import NewSelect from "../../components/NewSelect";
import dayjs from "dayjs";
import CreateCompanyForm from "./CreateCompanyForm";
import { maskEmail, maskMobileNumber } from "../../common";
import { getAllLeadUser } from "../../toolkit/slices/leadSlice";

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
  const updateModal = useDisclosure();
  const historyDrawer = useDisclosure();
  const count = useSelector(
    (state) => state.company.newCompaniesList?.[0]?.total
  );
  const data = useSelector((state) => state.company.newCompaniesList);
  const companyHistory = useSelector(
    (state) => state.company.companyHistoryList
  );
  const allLeadUser = useSelector((state) => state.leads.leadUsersList);
  const userRole = useSelector((state) => state.auth.currentUser?.roles);
  const adminRole = userRole?.includes("ADMIN");
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
  const [searchFilterType, setSearchFilterType] = useState("name");
  const [assigneeIds, setAssigneeIds] = useState([]);
  const [companyId, setCompanyId] = useState([]);

  const hasSearchFilter = Boolean(filterValue);

  useEffect(() => {
    dispatch(getAllNewCompanies(companyFilteration));
  }, [dispatch]);

  useEffect(() => {
    dispatch(getAllLeadUser(userId));
  }, [dispatch, userId]);

  const headerColumns = useMemo(() => {
    if (visibleColumns === "all") return columns;

    return columns.filter((column) =>
      Array.from(visibleColumns).includes(column.uid)
    );
  }, [visibleColumns]);

  const pages = Math.ceil(count / companyFilteration?.size) || 1;

  const sortedItems = useMemo(() => {
    return [...(data || [])].sort((a, b) => {
      const first = a[sortDescriptor.column];
      const second = b[sortDescriptor.column];
      const cmp = first < second ? -1 : first > second ? 1 : 0;

      return sortDescriptor.direction === "descending" ? -cmp : cmp;
    });
  }, [sortDescriptor, data]);

  const handleSelectionChange = (selection) => {
    if (selection === "all") {
      const allKeys = new Set(sortedItems.map((item) => item.id));
      setSelectedKeys(allKeys);
    } else {
      setSelectedKeys(selection);
    }
  };

  const handleUpdateAssignee = (id) => {
    setCompanyId([id]);
    updateModal.onOpen();
  };

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
              {maskEmail(company.clientContactEmail) || "-"}
            </span>
            <span className="text-sm text-gray-400">
              {maskMobileNumber(company.clientContactNo) || "-"}
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
                <DropdownItem
                  key="edit"
                  onPress={() => {
                    handleUpdateAssignee(company?.companyId);
                  }}
                >
                  Update assignee
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
      dispatch(
        getAllNewCompanies({
          ...companyFilteration,
          page: companyFilteration.page + 1,
        })
      );
    }
  }, [companyFilteration, pages, dispatch]);

  const onPreviousPage = useCallback(() => {
    if (companyFilteration?.page > 1) {
      setCompanyFilteration((prev) => ({ ...prev, page: prev.page - 1 }));
      dispatch(
        getAllNewCompanies({
          ...companyFilteration,
          page: companyFilteration.page - 1,
        })
      );
    }
  }, [companyFilteration, dispatch]);

  const onRowsPerPageChange = useCallback((e) => {
    setCompanyFilteration((prev) => ({
      ...prev,
      size: Number(e.target.value),
      page: 1,
    }));
  }, []);

  const onSearchChange = useCallback(
    (value) => {
      if (value) {
        setFilterValue(value);
        setCompanyFilteration((prev) => ({ ...prev, page: 1 }));
        dispatch(
          searchCompanies({
            searchNameAndGSt: value,
            userId,
            type: searchFilterType,
          })
        );
      } else {
        setFilterValue("");
        dispatch(getAllNewCompanies(companyFilteration));
      }
    },
    [searchFilterType, dispatch, companyFilteration]
  );

  const onClear = useCallback(() => {
    setFilterValue("");
    setCompanyFilteration((prev) => ({ ...prev, page: 1 }));
  }, []);

  const updateMultiAssigneeForCompanies = useCallback(() => {
    dispatch(
      updateMultiCompanyAssignee({
        companyId:
          selectedKeys.size === 0 ? companyId : Array.from(selectedKeys),
        currentUserId: userId,
        assigneeId: assigneeIds,
      })
    )
      .then((resp) => {
        if (resp.meta.requestStatus === "fulfilled") {
          addToast({
            title: "Companies assigned to user successfully",
            color: "success",
          });
          setSelectedKeys(new Set([]));
          setAssigneeIds([]);
          updateModal.onClose();
          dispatch(getAllNewCompanies(companyFilteration));
        } else {
          addToast({ title: "Something went wrong !.", color: "danger" });
        }
      })
      .catch(() => {
        addToast({ title: "Something went wrong !.", color: "danger" });
      });
  }, [
    selectedKeys,
    dispatch,
    userId,
    assigneeIds,
    companyFilteration,
    companyId,
  ]);

  const topContent = useMemo(() => {
    return (
      <div className="flex flex-col gap-4">
        <div className="flex justify-between gap-3 items-end">
          <div className="flex items-center gap-2 w-[35%]">
            <Dropdown>
              <DropdownTrigger>
                <Button
                  className="capitalize"
                  variant="flat"
                  endContent={<ChevronDown />}
                >
                  {searchFilterType}
                </Button>
              </DropdownTrigger>
              <DropdownMenu
                disallowEmptySelection
                aria-label="Single selection example"
                selectedKeys={[searchFilterType]}
                selectionMode="single"
                onSelectionChange={(e) => {
                  let key = Array.from(e);
                  setSearchFilterType(key);
                }}
              >
                <DropdownItem key="name">Name</DropdownItem>
                <DropdownItem key="email">Email</DropdownItem>
                <DropdownItem key="gst">GST</DropdownItem>
                <DropdownItem key="contact">Contact</DropdownItem>
              </DropdownMenu>
            </Dropdown>
            <Input
              isClearable
              className="w-full sm:max-w-[70%]"
              placeholder="Search ..."
              startContent={<Search />}
              value={filterValue}
              onClear={() => onClear()}
              onValueChange={onSearchChange}
            />
          </div>

          <div className="flex gap-3">
            {adminRole && (
              <Button
                variant="flat"
                onPress={updateModal.onOpen}
                isDisabled={selectedKeys.size === 0}
              >
                Update assignee
              </Button>
            )}

            <div className="w-[200px]">
              {" "}
              <NewSelect
                data={allLeadUser}
                value={companyFilteration?.filterUserId}
                placeholder={"Users"}
                label={null}
                labelKey={"fullName"}
                valueKey={"id"}
                onChange={(e) => {
                  setCompanyFilteration((prev) => ({
                    ...prev,
                    filterUserId: e,
                  }));
                  dispatch(
                    getAllNewCompanies({
                      ...companyFilteration,
                      filterUserId: e,
                    })
                  );
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
                  let key = Array.from(e)[0];
                  setCompanyFilteration((prev) => ({ ...prev, type: key }));
                  dispatch(
                    getAllNewCompanies({
                      ...companyFilteration,
                      type: key,
                    })
                  );
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
                  let key = Array.from(e)[0];
                  setCompanyFilteration((prev) => ({ ...prev, rating: key }));
                  dispatch(
                    getAllNewCompanies({
                      ...companyFilteration,
                      rating: key,
                    })
                  );
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
    selectedKeys,
    count,
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
            dispatch(getAllNewCompanies({ ...companyFilteration, page: e }));
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
      <h1 className="font-sans text-2xl font-medium mb-1">Company</h1>
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
        onSelectionChange={handleSelectionChange}
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
      <Modal
        isDismissable={false}
        isKeyboardDismissDisabled={true}
        isOpen={updateModal.isOpen}
        onOpenChange={updateModal.onOpenChange}
        placement="top-center"
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                Update assignee
              </ModalHeader>
              <ModalBody>
                <NewSelect
                  isRequired={true}
                  data={allLeadUser || []}
                  label="Select users"
                  name="assigneeId"
                  labelKey="fullName"
                  valueKey="id"
                  value={assigneeIds}
                  onChange={(selectedValue) => {
                    setAssigneeIds(selectedValue);
                  }}
                />

                <ModalFooter className="w-full flex justify-end">
                  <Button onPress={onClose}>Cancel</Button>
                  <Button
                    color="primary"
                    onPress={updateMultiAssigneeForCompanies}
                  >
                    Submit
                  </Button>
                </ModalFooter>
              </ModalBody>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
};

export default Company;
