import {
  Button,
  Chip,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
  Input as HeroInput,
  Pagination,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
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
  Popover,
  PopoverTrigger,
  PopoverContent,
  Select as HeroSelect,
  SelectItem,
} from "@heroui/react";
import { ConfigProvider, Form, Input, Select, theme } from "antd";
import * as XLSX from "xlsx";
import { ChevronDown, EllipsisVertical, Search } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useParams } from "react-router-dom";
import {
  getAllNewCompanies,
  getAllNewCompaniesCount,
  getCompaniesListForCSVExportFile,
  getHistoryByCompanyId,
  searchCompanies,
  updateMultiCompanyAssignee,
  updateBasicCompanyDetail,
  getAllCompanyType,
} from "../../toolkit/slices/companySlice";
import NewSelect from "../../components/NewSelect";
import dayjs from "dayjs";
import CreateCompanyForm from "./CreateCompanyForm";
import { maskEmail, maskMobileNumber } from "../../common";
import { getAllLeadUser } from "../../toolkit/slices/leadSlice";

export const columns = [
  { name: "ID", uid: "companyId", sortable: true },
  { name: "COMPANY NAME", uid: "companyName" },
  { name: "PAN", uid: "panNo" },
  { name: "STATUS", uid: "status" },
  { name: "ASSIGNEE", uid: "assignee" },
  { name: "ADDRESS", uid: "primaryAddres" },
  { name: "ACTIONS", uid: "actions" },
];

const INITIAL_VISIBLE_COLUMNS = [
  "companyName",
  "panNo",
  "status",
  "email",
  "assignee",
  "primaryAddres",
  "actions",
];

const formatPANInput = (value = "") => {
  return value
    .replace(/[^a-zA-Z0-9]/g, "")
    .toUpperCase()
    .slice(0, 10);
};

const allowOnlyNumbers = (value = "") => {
  return value.replace(/\D/g, "").slice(0, 6);
};

const ExportCsvPopover = ({ allLeadUser, count }) => {
  const dispatch = useDispatch();

  const [csvFilter, setCsvFilter] = useState({
    status: "ALL",
    assigneeId: "",
    page: 1,
    size: 200,
  });

  const totalPages = Math.ceil(count / csvFilter.size) || 1;

  const handleExport = async () => {
    try {
      const response = await dispatch(
        getCompaniesListForCSVExportFile({
          assigneeId: csvFilter.assigneeId,
          onboardingStatus: csvFilter.status,
          page: csvFilter.page,
          size: csvFilter.size,
        }),
      );

      const data = response?.payload || [];

      if (!data.length) {
        addToast({ title: "No data found", color: "warning" });
        return;
      }

      const rows = [];

      data.forEach((company) => {
        rows.push({
          Level: "Company",
          CompanyName: company.name,
          PAN: company.panNo,
          Status: company.onboardingStatus,
          Assignee: company.assigneeName,
          City: company.city,
          State: company.state,
          UnitName: "",
          ContactName: "",
        });

        if (company.units?.length) {
          company.units.forEach((unit) => {
            rows.push({
              Level: "  Unit",
              CompanyName: "",
              PAN: "",
              Status: "",
              Assignee: "",
              City: "",
              State: "",
              UnitName: unit.unitName,
              GST: unit.gstNo,
              UnitCity: unit.city,
              UnitState: unit.state,
              ContactName: "",
            });

            if (unit.contacts?.length) {
              unit.contacts.forEach((contact) => {
                rows.push({
                  Level: "    Contact",
                  CompanyName: "",
                  PAN: "",
                  Status: "",
                  Assignee: "",
                  City: "",
                  State: "",
                  UnitName: "",
                  GST: "",
                  UnitCity: "",
                  UnitState: "",
                  ContactName: contact.name,
                  Email: contact.emails,
                  Phone: contact.contactNo,
                });
              });
            }
          });
        }
      });

      const worksheet = XLSX.utils.json_to_sheet(rows);
      const workbook = XLSX.utils.book_new();

      XLSX.utils.book_append_sheet(workbook, worksheet, "Companies");
      XLSX.writeFile(workbook, "Nested_Companies.xlsx");
    } catch (err) {
      addToast({ title: "Export failed", color: "danger" });
    }
  };

  return (
    <div className="grid grid-cols-2 gap-3 w-full">
      <HeroSelect
        label="Status"
        selectedKeys={[String(csvFilter.status)]}
        onSelectionChange={(keys) => {
          const value = Array.from(keys)[0];
          setCsvFilter((prev) => ({ ...prev, status: value }));
        }}
      >
        <SelectItem key="ALL">ALL</SelectItem>
        <SelectItem key="INITIATED">INITIATED</SelectItem>
        <SelectItem key="MINIMAL">MINIMAL</SelectItem>
        <SelectItem key="APPROVED">APPROVED</SelectItem>
        <SelectItem key="DISAPPROVED">DISAPPROVED</SelectItem>
      </HeroSelect>

      <HeroSelect
        label="Assignee"
        selectedKeys={csvFilter.assigneeId ? [csvFilter.assigneeId] : []}
        onSelectionChange={(keys) => {
          const value = Array.from(keys)[0];
          setCsvFilter((prev) => ({ ...prev, assigneeId: value }));
        }}
      >
        {allLeadUser?.map((u) => (
          <SelectItem key={u.id}>{u.fullName}</SelectItem>
        ))}
      </HeroSelect>

      <HeroSelect
        label="Page"
        items={
          totalPages > 0 &&
          Array.from({ length: totalPages }, (_, i) => ({
            label: `Page ${i + 1}`,
            value: String(i + 1),
          }))
        }
        selectedKeys={
          totalPages > 0 ? new Set([String(csvFilter.page)]) : new Set()
        }
        onSelectionChange={(keys) => {
          const value = Number(Array.from(keys)[0]);
          setCsvFilter((prev) => ({
            ...prev,
            page: value,
          }));
        }}
      >
        {(item) => <SelectItem key={item.value}>{item.label}</SelectItem>}
      </HeroSelect>

      <HeroSelect
        label="Size"
        selectedKeys={[String(csvFilter.size)]}
        onSelectionChange={(keys) => {
          const value = Number(Array.from(keys)[0]);
          setCsvFilter((prev) => ({
            ...prev,
            size: value > 500 ? 500 : value,
            page: 1,
          }));
        }}
      >
        <SelectItem key="50">50</SelectItem>
        <SelectItem key="100">100</SelectItem>
        <SelectItem key="200">200</SelectItem>
        <SelectItem key="500">500</SelectItem>
      </HeroSelect>

      <Button color="primary" onPress={handleExport}>
        Download CSV
      </Button>
    </div>
  );
};

const Company = () => {
  const { userId } = useParams();
  const dispatch = useDispatch();

  const { isOpen, onOpenChange } = useDisclosure();
  const updateModal = useDisclosure();
  const editCompanyModal = useDisclosure();
  const historyDrawer = useDisclosure();

  const [companyForm] = Form.useForm();

  const count = useSelector((state) => state.company.newCompaniesTotalCount);
  const data = useSelector((state) => state.company.newCompaniesList);
  const companyHistory = useSelector(
    (state) => state.company.companyHistoryList,
  );
  const allLeadUser = useSelector((state) => state.leads.leadUsersList);
  const userRole = useSelector((state) => state.auth.currentUser?.roles);

  const countryList = useSelector(
    (state) =>
      state.company?.countryList ||
      state.location?.countryList ||
      state.common?.countryList ||
      [],
  );

  const statesList = useSelector(
    (state) =>
      state.company?.statesList ||
      state.location?.statesList ||
      state.common?.statesList ||
      [],
  );

  const citiesList = useSelector(
    (state) =>
      state.company?.citiesList ||
      state.location?.citiesList ||
      state.common?.citiesList ||
      [],
  );
  const companyTypeList = useSelector(
    (state) => state.company.companyTypeList || [],
  );

  const adminRole = userRole?.includes("ADMIN");

  const isDarkMode =
    typeof document !== "undefined" &&
    document.documentElement.classList.contains("dark");

  const [filterValue, setFilterValue] = useState("");
  const [selectedKeys, setSelectedKeys] = useState(new Set([]));
  const [visibleColumns, setVisibleColumns] = useState(
    new Set(INITIAL_VISIBLE_COLUMNS),
  );
  const [sortDescriptor, setSortDescriptor] = useState({
    column: "companyId",
    direction: "ascending",
  });
  const [companyFilteration, setCompanyFilteration] = useState({
    userId: userId,
    page: 1,
    size: 50,
    filterUserId: "",
    type: "all",
    rating: "all",
    status: "ALL",
  });

  const [editData, setEditData] = useState(null);
  const [searchFilterType, setSearchFilterType] = useState("name");
  const [assigneeIds, setAssigneeIds] = useState([]);
  const [companyId, setCompanyId] = useState([]);
  const [companyUpdateLoading, setCompanyUpdateLoading] = useState(false);

  const hasSearchFilter = Boolean(filterValue);

  useEffect(() => {
    dispatch(getAllNewCompanies(companyFilteration));
    dispatch(getAllNewCompaniesCount(companyFilteration));
    dispatch(getAllCompanyType());
  }, [dispatch]);

  useEffect(() => {
    dispatch(getAllLeadUser(userId));
  }, [dispatch, userId]);

  const headerColumns = useMemo(() => {
    if (visibleColumns === "all") return columns;

    return columns.filter((column) =>
      Array.from(visibleColumns).includes(column.uid),
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
      const allKeys = new Set(sortedItems.map((item) => item?.id));
      setSelectedKeys(allKeys);
    } else {
      setSelectedKeys(selection);
    }
  };

  const handleUpdateAssignee = (id) => {
    setCompanyId([id]);
    updateModal.onOpen();
  };

  const handleOpenEditCompanyModal = useCallback(
    (company) => {
      setEditData(company);

      companyForm.setFieldsValue({
        id: company?.id || company?.companyId || "",
        name: company?.name || "",
        companyTypeId:
          company?.companyTypeId ||
          company?.companyType?.id ||
          company?.companyStructureId ||
          undefined,
        panNo: company?.panNo || "",
        address: company?.address || "",
        country: company?.country || undefined,
        state: company?.state || undefined,
        city: company?.city || undefined,
        pinCode: company?.primaryPinCode || company?.pinCode || "",
      });

      editCompanyModal.onOpen();

      // Optional if your dependent dropdowns need preload:
      // if (company?.country) dispatch(getAllStatesByCountryName(company.country));
      // if (company?.state) dispatch(getAllCitiesByStateName(company.state));
    },
    [companyForm, editCompanyModal],
  );

  const updateCompanyApiHandler = async ({ companyId, data }) => {
    try {
      setCompanyUpdateLoading(true);

      const response = await dispatch(
        updateBasicCompanyDetail({
          companyId,
          userId,
          data,
        }),
      );

      if (response?.meta?.requestStatus === "fulfilled") {
        addToast({
          title: "Company updated successfully",
          color: "success",
        });

        editCompanyModal.onClose();
        companyForm.resetFields();
        setEditData(null);

        dispatch(getAllNewCompanies(companyFilteration));
        dispatch(getAllNewCompaniesCount(companyFilteration));

        return;
      }

      addToast({
        title:
          response?.payload?.data?.message ||
          response?.payload?.message ||
          "Something went wrong !.",
        color: "danger",
      });
    } catch (error) {
      console.log("Update company error", error);

      addToast({
        title: error?.message || "Something went wrong while updating company",
        color: "danger",
      });
    } finally {
      setCompanyUpdateLoading(false);
    }
  };

  const handleUpdateCompanyDetails = (values) => {
    const companyId = editData?.id || editData?.companyId || values?.id;

    const payload = {
      name: values?.name || null,
      address: values?.address || null,
      city: values?.city || null,
      state: values?.state || null,
      country: values?.country || null,
      pinCode: values?.pinCode ? allowOnlyNumbers(values.pinCode) : null,
      panNo: values?.panNo ? formatPANInput(values.panNo) : null,
      gstNo: values?.gstNo || null,
      createdById: Number(userId),
      updatedById: Number(userId),
      leadId: editData?.leadId || null,
      companyTypeId: values?.companyTypeId || null,
      primaryContactId: values?.primaryContactId || null,
      secondaryContactId: values?.secondaryContactId || null,
    };

    updateCompanyApiHandler({
      companyId,
      data: payload,
    });
  };

  const renderCell = useCallback(
    (company, columnKey) => {
      switch (columnKey) {
        case "companyName":
          return (
            <div className="flex items-start gap-2">
              <div className="flex flex-col">
                <Link
                  to={`${company?.id}/gstDetails`}
                  className="font-semibold"
                >
                  {company?.name || "-"}
                </Link>
                <span className="text-sm text-gray-400">
                  Age:{company?.companyAge || "---"} yrs
                </span>
              </div>
            </div>
          );

        case "panNo":
          return (
            <div className="flex flex-col">
              <span className="font-normal">{company.panNo || "-"}</span>
            </div>
          );

        case "status":
          return (
            <div className="flex flex-col gap-1">
              <Chip
                className="capitalize text-tiny"
                color={
                  company?.onboardingStatus === "APPROVED"
                    ? "success"
                    : company?.onboardingStatus === "INITIATED"
                      ? "secondary"
                      : company?.onboardingStatus === "MINIMAL"
                        ? "warning"
                        : "danger"
                }
                size="sm"
                variant="flat"
              >
                {company?.onboardingStatus || "-"}
              </Chip>
            </div>
          );

        case "assignee":
          return (
            <div className="flex flex-col">
              <span className="font-normal">{company.assigneeName || "-"}</span>
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
                {[
                  company?.city,
                  company?.state,
                  company?.country,
                  company?.primaryPinCode,
                ]
                  .filter(Boolean)
                  .join(", ") || "-"}
              </span>
            </div>
          );

        case "secondaryAddress":
          return (
            <div className="flex flex-col">
              <span className="font-normal">{company.secAddress || "-"}</span>
              <span className="text-sm text-gray-400">
                {[company?.secCity, company?.secState, company?.seCountry]
                  .filter(Boolean)
                  .join(", ") || "-"}
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
                      handleUpdateAssignee(company?.id);
                    }}
                  >
                    Update assignee
                  </DropdownItem>

                  <DropdownItem
                    key="edit-company"
                    onPress={() => {
                      handleOpenEditCompanyModal(company);
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
    },
    [dispatch, historyDrawer, handleOpenEditCompanyModal],
  );

  const onNextPage = useCallback(() => {
    if (companyFilteration?.page < pages) {
      setCompanyFilteration((prev) => ({ ...prev, page: prev.page + 1 }));
      dispatch(
        getAllNewCompanies({
          ...companyFilteration,
          page: companyFilteration.page + 1,
        }),
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
        }),
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
      setFilterValue(value || "");

      if (value?.length >= 3) {
        setCompanyFilteration((prev) => ({ ...prev, page: 1 }));
        dispatch(
          searchCompanies({
            searchNameAndGSt: value,
            userId,
            type: searchFilterType,
          }),
        );
      } else {
        setCompanyFilteration((prev) => ({ ...prev, page: 1 }));
        dispatch(getAllNewCompanies({ ...companyFilteration, page: 1 }));
      }
    },
    [searchFilterType, dispatch, companyFilteration, userId],
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
      }),
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
    updateModal,
  ]);

  const topContent = useMemo(() => {
    return (
      <div className="flex flex-col gap-4">
        <div className="flex justify-between gap-3 items-end">
          <div className="flex items-center gap-1 w-[35%]">
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
                  let key = Array.from(e)[0];
                  setSearchFilterType(key);
                }}
              >
                <DropdownItem key="name">Name</DropdownItem>
                <DropdownItem key="email">Email</DropdownItem>
                <DropdownItem key="gst">GST</DropdownItem>
                <DropdownItem key="contact">Contact</DropdownItem>
              </DropdownMenu>
            </Dropdown>

            <HeroInput
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
            <Dropdown>
              <DropdownTrigger>
                <Button
                  className="capitalize"
                  variant="flat"
                  endContent={<ChevronDown />}
                >
                  {companyFilteration?.status}
                </Button>
              </DropdownTrigger>

              <DropdownMenu
                disallowEmptySelection
                aria-label="Single selection example"
                selectedKeys={[companyFilteration?.status]}
                selectionMode="single"
                onSelectionChange={(e) => {
                  let key = Array.from(e)[0];
                  setCompanyFilteration((prev) => ({ ...prev, status: key }));
                  dispatch(
                    getAllNewCompanies({
                      ...companyFilteration,
                      status: key,
                    }),
                  );
                  dispatch(
                    getAllNewCompaniesCount({
                      ...companyFilteration,
                      status: key,
                    }),
                  );
                }}
              >
                <DropdownItem key="ALL">ALL</DropdownItem>
                <DropdownItem key="INITIATED">INITIATED</DropdownItem>
                <DropdownItem key="MINIMAL">MINIMAL</DropdownItem>
                <DropdownItem key="APPROVED">APPROVED</DropdownItem>
                <DropdownItem key="DISAPPROVED">DISAPPROVED</DropdownItem>
              </DropdownMenu>
            </Dropdown>

            {adminRole && (
              <Popover size="2xl">
                <PopoverTrigger>
                  <Button color="success">Export CSV</Button>
                </PopoverTrigger>

                <PopoverContent className="p-4 w-[460px]">
                  <ExportCsvPopover allLeadUser={allLeadUser} count={count} />
                </PopoverContent>
              </Popover>
            )}

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
                    {column.name}
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
    searchFilterType,
    adminRole,
    dispatch,
    onClear,
  ]);

  const bottomContent = useMemo(() => {
    return (
      <div className="py-2 px-2 flex justify-between items-center">
        <span className="w-[30%] text-small text-default-400">
          {selectedKeys === sortedItems?.length
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
  }, [
    selectedKeys,
    count,
    companyFilteration,
    pages,
    hasSearchFilter,
    sortedItems,
    dispatch,
    onNextPage,
    onPreviousPage,
  ]);

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
        selectedKeys={
          selectedKeys.size === sortedItems?.length ? "all" : selectedKeys
        }
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
            <TableRow key={item.id}>
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
                      { key: "createDate", label: "DATE" },
                      { key: "eventType", label: "EVENT" },
                      { key: "description", label: "DESCRIPTION" },
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
                                  "DD-MM-YYYY , HH:mm a",
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
        size="5xl"
        isOpen={editCompanyModal.isOpen}
        onOpenChange={(open) => {
          if (!open) {
            companyForm.resetFields();
            setEditData(null);
          }
          editCompanyModal.onOpenChange(open);
        }}
        placement="top-center"
        scrollBehavior="inside"
        classNames={{
          backdrop: "bg-black/40 backdrop-blur-[2px]",
          base: "rounded-3xl border border-default-200 bg-background text-foreground shadow-2xl dark:border-default-100/20 dark:bg-[#111113]",
          header:
            "border-b border-default-200 bg-gradient-to-r from-primary/10 via-background to-background px-7 py-5 dark:border-default-100/20 dark:from-primary/20 dark:via-[#111113] dark:to-[#111113]",
          body: "bg-default-50/40 px-7 py-6 dark:bg-[#09090b]",
          footer:
            "border-t border-default-200 bg-background px-7 py-4 dark:border-default-100/20 dark:bg-[#111113]",
        }}
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                <h2 className="text-xl font-semibold text-foreground">
                  Edit Company Details
                </h2>
                <p className="text-sm font-normal text-default-500">
                  Update company information, structure and address details.
                </p>
              </ModalHeader>

              <ModalBody>
                <ConfigProvider
                  theme={{
                    algorithm: isDarkMode
                      ? theme.darkAlgorithm
                      : theme.defaultAlgorithm,
                    token: {
                      borderRadius: 10,
                      colorPrimary: "#006FEE",
                      colorBgContainer: isDarkMode ? "#18181b" : "#ffffff",
                      colorBgElevated: isDarkMode ? "#18181b" : "#ffffff",
                      colorText: isDarkMode ? "#f4f4f5" : "#18181b",
                      colorTextSecondary: isDarkMode ? "#a1a1aa" : "#71717a",
                      colorBorder: isDarkMode ? "#3f3f46" : "#d4d4d8",
                    },
                  }}
                >
                  <div className="rounded-2xl border border-default-200 bg-content1 p-5 shadow-sm dark:border-default-100/20 dark:bg-[#18181b]">
                    <Form
                      form={companyForm}
                      layout="vertical"
                      onFinish={handleUpdateCompanyDetails}
                      className="grid grid-cols-2 gap-x-4 dark:[&_.ant-form-item-label>label]:!text-zinc-200"
                    >
                      <Form.Item name="id" hidden>
                        <Input />
                      </Form.Item>

                      <Form.Item
                        label="Company Name"
                        name="name"
                        rules={[
                          {
                            required: true,
                            message: "Please enter company name",
                          },
                        ]}
                      >
                        <Input placeholder="Company Name" />
                      </Form.Item>

                      <Form.Item label="Company Structure" name="companyTypeId">
                        <Select
                          showSearch
                          allowClear
                          options={companyTypeList}
                          fieldNames={{ label: "name", value: "id" }}
                          placeholder="Select Company Structure"
                          getPopupContainer={(triggerNode) =>
                            triggerNode.parentElement
                          }
                          optionFilterProp="name"
                          filterOption={(input, option) =>
                            String(option?.name || "")
                              .toLowerCase()
                              .includes(input.toLowerCase())
                          }
                        />
                      </Form.Item>

                      <Form.Item
                        label="PAN Number"
                        name="panNo"
                        getValueFromEvent={(e) =>
                          formatPANInput(e.target.value)
                        }
                      >
                        <Input placeholder="PAN Number" maxLength={10} />
                      </Form.Item>

                      <Form.Item
                        label="Address"
                        name="address"
                        className="col-span-2"
                      >
                        <Input placeholder="Address" />
                      </Form.Item>

                      <Form.Item label="Country" name="country">
                        <Select
                          showSearch
                          allowClear
                          options={countryList}
                          fieldNames={{ label: "name", value: "name" }}
                          placeholder="Select Country"
                          optionFilterProp="name"
                          onChange={(value) => {
                            companyForm.setFieldsValue({
                              state: undefined,
                              city: undefined,
                            });

                            if (value) {
                              // dispatch(getAllStatesByCountryName(value));
                            }
                          }}
                        />
                      </Form.Item>

                      <Form.Item label="State" name="state">
                        <Select
                          showSearch
                          allowClear
                          options={statesList}
                          fieldNames={{ label: "name", value: "name" }}
                          placeholder="Select State"
                          optionFilterProp="name"
                          onChange={(value) => {
                            companyForm.setFieldsValue({ city: undefined });

                            if (value) {
                              // dispatch(getAllCitiesByStateName(value));
                            }
                          }}
                        />
                      </Form.Item>

                      <Form.Item label="City" name="city">
                        <Select
                          showSearch
                          allowClear
                          options={citiesList}
                          fieldNames={{ label: "name", value: "name" }}
                          placeholder="Select City"
                          optionFilterProp="name"
                        />
                      </Form.Item>

                      <Form.Item
                        label="Pin Code"
                        name="pinCode"
                        getValueFromEvent={(e) =>
                          allowOnlyNumbers(e.target.value)
                        }
                      >
                        <Input placeholder="Pin Code" maxLength={6} />
                      </Form.Item>
                    </Form>
                  </div>
                </ConfigProvider>
              </ModalBody>

              <ModalFooter>
                <Button
                  variant="flat"
                  isDisabled={companyUpdateLoading}
                  onPress={() => {
                    companyForm.resetFields();
                    setEditData(null);
                    onClose();
                  }}
                >
                  Cancel
                </Button>

                <Button
                  color="primary"
                  isLoading={companyUpdateLoading}
                  isDisabled={companyUpdateLoading}
                  onPress={() => {
                    companyForm.submit();
                  }}
                >
                  Update Company
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

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
