import {
  addToast,
  Button,
  Checkbox,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
  Form,
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
  Textarea,
  useDisclosure,
} from "@heroui/react";
import { ChevronDown, EllipsisVertical, Search } from "lucide-react";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import {
  addGstInCompany,
  getGstListByCompanyId,
} from "../../toolkit/slices/companySlice";
import NewSelect from "../../components/NewSelect";
import {
  getAllCitiesByStateName,
  getAllContactListById,
  getAllCountries,
  getAllMainIndustry,
  getAllStatesByCountryName,
  getIndustryDataBySubSubIndustryId,
  getSubIndustryByIndustryId,
  getSubSubIndustryBySubIndustryId,
  createContactViaEstimateInCompany,
  updateContactViaEstimateInCompany,
} from "../../toolkit/slices/commonSlice";
import { formatGSTInput, gstRegex } from "../../common";
import dayjs from "dayjs";
const columns = [
  { name: "ID", uid: "id" },
  { name: "UNIT NAME", uid: "name" },
  { name: "STATUS", uid: "status" },
  { name: "ADDRESS", uid: "address" },
  { name: "STATE NAME", uid: "state" },
  { name: "GST NUMBER", uid: "gstNo" },
  { name: "GST TYPE", uid: "gstType" },
  { name: "ACTIONS", uid: "actions" },
];

function capitalize(s) {
  return s ? s.charAt(0).toUpperCase() + s.slice(1).toLowerCase() : "";
}

const INITIAL_VISIBLE_COLUMNS = [
  "id",
  "name",
  "status",
  "address",
  "state",
  "gstNo",
  "gstType",
  "actions",
];

const CompanyGstList = () => {
  const { userId, companyId } = useParams();
  const dispatch = useDispatch();
  const count = useSelector((state) => state.company.companyGstList?.length);
  const data = useSelector((state) => state.company.companyGstList) || [];
  const countryList = useSelector((state) => state.common.countriesList);
  const statesList = useSelector((state) => state.common.statesList);
  const citiesList = useSelector((state) => state.common.citiesList);
  const contactListByCompanyId = useSelector(
    (state) => state.common.contactListByCompanyId,
  );
  const allIndustry = useSelector((state) => state.common.allMainIndustry);
  const subIndustryListById = useSelector(
    (state) => state.common.subIndustryListByIndustryId,
  );
  const subSubIndustryListById = useSelector(
    (state) => state.common.subSubIndustryListBySubIndustryId,
  );
  const industryDataListById = useSelector(
    (state) => state.common.industryDataListBySubSubIndustryId,
  );
  const desiginationList = useSelector(
    (state) => state.setting.clientDesiginationList,
  );

  const [filterValue, setFilterValue] = useState("");
  const [selectedKeys, setSelectedKeys] = useState(new Set([]));
  const [visibleColumns, setVisibleColumns] = useState(
    new Set(INITIAL_VISIBLE_COLUMNS),
  );
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortDescriptor, setSortDescriptor] = useState({
    column: "age",
    direction: "ascending",
  });

  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  const [selectedUnit, setSelectedUnit] = useState(null);

  const contactInitialValues = {
    title: "",
    name: "",
    emails: "",
    contactNo: "",
    whatsappNo: "",
    designation: "",
  };

  const [contactForm, setContactForm] = useState(contactInitialValues);
  const [editingContactId, setEditingContactId] = useState(null);
  const [editContactForm, setEditContactForm] = useState(contactInitialValues);

  const {
    isOpen: isUnitModalOpen,
    onOpen: onUnitModalOpen,
    onOpenChange: onUnitModalOpenChange,
  } = useDisclosure();

  const [companyFilteration, setCompanyFilteration] = useState({
    userId: userId,
    page: 1,
    size: 50,
    filterUserId: "",
    type: "all",
    rating: "all",
  });

  const formValues = {
    industryId: "",
    subIndustryId: "",
    subsubIndustryId: "",
    industrydataId: "",
    gstNo: "",
    primaryContact: false,
    primaryTitle: "",
    contactName: "",
    primaryDesignation: "",
    contactEmails: "",
    contactNo: "",
    contactWhatsappNo: "",
    contactId: "",
    address: "",
    country: "",
    state: "",
    city: "",
    primaryPinCode: "",
  };

  const [formData, setFormData] = useState(formValues);
  const [isNewContact, setIsNewContact] = useState(false);
  const [gstError, setGstError] = useState("");
  const hasSearchFilter = Boolean(filterValue);

  useEffect(() => {
    if (selectedUnit?.id && data?.length > 0) {
      const updatedUnit = data.find((item) => item.id === selectedUnit.id);

      if (updatedUnit) {
        setSelectedUnit(updatedUnit);
      }
    }
  }, [data, selectedUnit?.id]);

  useEffect(() => {
    dispatch(getAllMainIndustry());
    dispatch(getAllCountries());
    dispatch(getGstListByCompanyId(companyId));
    dispatch(getAllContactListById(companyId));
  }, [dispatch, companyId]);

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
  }, [data, filterValue, statusFilter]);

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
      case "name":
        return (
          <div className="flex items-start gap-2">
            <div className="flex flex-col">
              <button
                type="button"
                className="font-semibold text-primary cursor-pointer hover:underline text-left"
                onClick={() => {
                  setSelectedUnit(company);
                  onUnitModalOpen();
                }}
              >
                {company?.unitName || "-"}
              </button>
            </div>
          </div>
        );

      case "status":
        return (
          <div className="flex items-start gap-2">
            <div
              className={`${company?.status == "Active" ? "text-green-700" : "text-red-600"}`}
            >
              {company?.status || "-"}
            </div>
          </div>
        );
      case "address":
        return (
          <div className="flex items-start gap-2">
            <div
              className="max-w-[260px] truncate"
              title={company?.addressLine1 || "-"}
            >
              {company?.addressLine1 || "-"}
            </div>
          </div>
        );
      case "state":
        return (
          <div className="flex items-start gap-2">
            <div className="flex flex-col">{company?.state || "-"}</div>
          </div>
        );

      case "gstNo":
        return (
          <div className="flex flex-col">
            <span className="font-normal">{company.gstNo || "-"}</span>
          </div>
        );
      case "gstType":
        return (
          <div className="flex flex-col">
            <span className="font-normal">
              {company.gstRegistrationTypeName || "-"}
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
                  key="leads"
                  href={`erp/${userId}/sales/company/${companyId}/gstDetails/leads`}
                >
                  View Leads
                </DropdownItem>
                <DropdownItem
                  key="projects"
                  href={`erp/${userId}/sales/company/${companyId}/gstDetails/${company?.id}/projects`}
                >
                  View Projects
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

  const validateGST = (gstNo, stateName) => {
    if (!gstNo) {
      return "Please enter GST number";
    }
    if (!gstRegex.test(gstNo)) {
      return "Invalid GST Number";
    }
    const selectedState = statesList.find((s) => s.name === stateName);
    if (selectedState && gstNo.slice(0, 2) !== selectedState.gstCode) {
      return "GST code does not match selected state";
    }
    return "";
  };

  const handleGstChange = (e) => {
    const rawValue = e.target.value;
    const formattedValue = formatGSTInput(rawValue);

    setFormData((prev) => ({
      ...prev,
      gstNo: formattedValue,
    }));

    const error = validateGST(formattedValue, formData.state);
    setGstError(error);
  };

  const handleStateChange = (stateName) => {
    setFormData((prev) => ({ ...prev, state: stateName }));
    dispatch(getAllCitiesByStateName(stateName));
    const error = validateGST(formData.gstNo, stateName);
    setGstError(error);
  };
  const handleCreateUnitContact = () => {
    const payload = {
      id: 0,
      name: contactForm.name || "",
      title: contactForm.title || "",
      emails: contactForm.emails || "",
      contactNo: contactForm.contactNo || "",
      whatsappNo: contactForm.whatsappNo || "",
      designation: contactForm.designation || "",
      clientDesignationId: 1,
      companyId: Number(companyId),
      companyUnitId: Number(selectedUnit?.id),
      makePrimaryForCompany: false,
      makeSecondaryForCompany: false,
      makePrimaryForUnit: true,
      makeSecondaryForUnit: false,
    };

    dispatch(createContactViaEstimateInCompany(payload)).then((resp) => {
      if (resp.meta.requestStatus === "fulfilled") {
        addToast({
          title: "Contact added successfully",
          color: "success",
        });

        setContactForm(contactInitialValues);
        dispatch(getGstListByCompanyId(companyId));
      } else {
        addToast({
          title: resp.payload || "Something went wrong",
          color: "danger",
        });
      }
    });
  };

  const handleUpdateUnitContact = (contactId) => {
    const payload = {
      ...editContactForm,
      primaryForCompany: false,
      secondaryForCompany: false,
      primaryForUnit: true,
      secondaryForUnit: false,
      companyId: Number(companyId),
      companyUnitId: Number(selectedUnit?.id),
    };

    dispatch(
      updateContactViaEstimateInCompany({
        id: contactId,
        userId,
        data: payload,
      }),
    ).then((resp) => {
      if (resp.meta.requestStatus === "fulfilled") {
        addToast({
          title: "Contact updated successfully",
          color: "success",
        });

        setEditingContactId(null);
        setEditContactForm(contactInitialValues);
        dispatch(getGstListByCompanyId(companyId));
      } else {
        addToast({
          title: resp.payload || "Something went wrong",
          color: "danger",
        });
      }
    });
  };

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
            {/* <Button color="primary" onPress={onOpen} endContent={<Plus />}>
              Add GST
            </Button> */}
          </div>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-default-400 text-small">
            Total {count} units
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

  const handleFinish = useCallback(
    (values) => {
      dispatch(addGstInCompany({ ...formData, companyId }))
        .then((resp) => {
          if (resp.meta.requestStatus === "fulfilled") {
            addToast({
              title: "GST added in company successfully !.",
              color: "success",
            });
            dispatch(getGstListByCompanyId(companyId));
            setFormData(formValues);
            onOpenChange(false);
          } else {
            addToast({ title: "Something went wrong !.", color: "danger" });
          }
        })
        .catch(() =>
          addToast({ title: "Something went wrong !.", color: "danger" }),
        );
    },
    [companyId, formValues, formData, dispatch],
  );

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
        // selectionMode="multiple"
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
            <TableRow key={item.stateId}>
              {(columnKey) => (
                <TableCell>{renderCell(item, columnKey)}</TableCell>
              )}
            </TableRow>
          )}
        </TableBody>
      </Table>

      <Modal
        isOpen={isUnitModalOpen}
        onOpenChange={onUnitModalOpenChange}
        placement="top-center"
        scrollBehavior="inside"
        hideCloseButton={false}
        motionProps={{
          variants: {
            enter: {
              x: 0,
              opacity: 1,
              transition: { duration: 0.28, ease: "easeOut" },
            },
            exit: {
              x: "100%",
              opacity: 0,
              transition: { duration: 0.2, ease: "easeIn" },
            },
          },
          initial: { x: "100%", opacity: 0 },
        }}
        classNames={{
          wrapper: "justify-end items-stretch p-0",
          backdrop: "bg-black/35 backdrop-blur-[2px]",
          base: "m-0 ml-auto h-screen max-h-screen w-[65vw] max-w-[65vw] rounded-none border-l border-default-200 bg-background shadow-2xl",
          body: "p-0 overflow-hidden bg-default-50/40",
          header:
            "border-b border-default-200 bg-gradient-to-r from-primary/10 via-background to-background px-7 py-5",
          footer: "border-t border-default-200 bg-background px-7 py-4",
          closeButton:
            "right-5 top-5 bg-default-100 hover:bg-danger/10 hover:text-danger",
        }}
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                <div className="flex items-start justify-between gap-4 pr-8">
                  <div>
                    <h2 className="text-xl font-semibold">Unit Details</h2>
                    <p className="mt-1 text-sm font-normal text-default-500">
                      {selectedUnit?.unitName || "-"}
                    </p>
                  </div>

                  <div className="rounded-full bg-success/10 px-3 py-1 text-xs font-semibold text-success">
                    {selectedUnit?.status || "-"}
                  </div>
                </div>
              </ModalHeader>

              <ModalBody>
                <div className="h-full overflow-y-auto px-7 py-6 space-y-5">
                  <div className="rounded-2xl border border-default-200 bg-content1 p-5 shadow-sm">
                    <div className="mb-4 flex items-center justify-between">
                      <h3 className="text-base font-semibold">
                        Basic Information
                      </h3>
                      <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                        Unit ID: {selectedUnit?.id || "-"}
                      </span>
                    </div>

                    <div className="grid grid-cols-4 gap-5 text-sm">
                      <div>
                        <p className="text-default-500">Company</p>
                        <p className="font-medium">
                          {selectedUnit?.companyName || "-"}
                        </p>
                      </div>

                      <div>
                        <p className="text-default-500">GST Number</p>
                        <p className="font-medium">
                          {selectedUnit?.gstNo || "-"}
                        </p>
                      </div>

                      <div>
                        <p className="text-default-500">GST Type</p>
                        <p className="font-medium">
                          {selectedUnit?.gstRegistrationTypeName || "-"}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-default-200 bg-content1 p-5 shadow-sm">
                    <h3 className="mb-4 text-base font-semibold">
                      Other Details
                    </h3>

                    <div className="grid grid-cols-3 gap-5 text-sm">
                      <div>
                        <p className="text-default-500">Unit Opening Date</p>
                        <p className="font-medium">
                          {dayjs(selectedUnit?.unitOpeningDate).format(
                            "DD-MM-YYYY hh:mm A",
                          ) || "-"}
                        </p>
                      </div>

                      <div>
                        <p className="text-default-500">Created At</p>
                        <p className="font-medium">
                          {dayjs(selectedUnit?.createdAt).format(
                            "DD-MM-YYYY hh:mm A",
                          ) || "-"}
                        </p>
                      </div>

                      <div>
                        <p className="text-default-500">Updated At</p>
                        <p className="font-medium">
                          {dayjs(selectedUnit?.updatedAt).format(
                            "DD-MM-YYYY hh:mm A",
                          ) || "-"}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-default-200 bg-content1 p-5 shadow-sm">
                    <h3 className="mb-4 text-base font-semibold">Address</h3>

                    <div className="grid grid-cols-4 gap-5 text-sm">
                      <div className="col-span-4">
                        <p className="text-default-500">Address Line 1</p>
                        <p className="font-medium leading-6">
                          {selectedUnit?.addressLine1 || "-"}
                        </p>
                      </div>

                      <div className="col-span-4">
                        <p className="text-default-500">Address Line 2</p>
                        <p className="font-medium leading-6">
                          {selectedUnit?.addressLine2 || "-"}
                        </p>
                      </div>

                      <div>
                        <p className="text-default-500">City</p>
                        <p className="font-medium">
                          {selectedUnit?.city || "-"}
                        </p>
                      </div>

                      <div>
                        <p className="text-default-500">State</p>
                        <p className="font-medium">
                          {selectedUnit?.state || "-"}
                        </p>
                      </div>

                      <div>
                        <p className="text-default-500">Country</p>
                        <p className="font-medium">
                          {selectedUnit?.country || "-"}
                        </p>
                      </div>

                      <div>
                        <p className="text-default-500">Pin Code</p>
                        <p className="font-medium">
                          {selectedUnit?.pinCode || "-"}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-default-200 bg-content1 p-5 shadow-sm">
                    <div className="mb-4 flex items-center justify-between">
                      <h3 className="text-base font-semibold">Contacts</h3>
                      <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                        {selectedUnit?.unitContacts?.length || 0} Contacts
                      </span>
                    </div>

                    {selectedUnit?.unitContacts?.length > 0 ? (
                      <div className="grid grid-cols-2 gap-4">
                        {selectedUnit.unitContacts.map((contact) => (
                          <div
                            key={contact?.id}
                            className="rounded-xl border border-default-200 bg-default-50 p-4 text-sm"
                          >
                            {editingContactId === contact?.id ? (
                              <div className="grid grid-cols-2 gap-3">
                                <Input
                                  label="Title"
                                  value={editContactForm.title}
                                  onChange={(e) =>
                                    setEditContactForm((prev) => ({
                                      ...prev,
                                      title: e.target.value,
                                    }))
                                  }
                                />

                                <Input
                                  label="Name"
                                  value={editContactForm.name}
                                  onChange={(e) =>
                                    setEditContactForm((prev) => ({
                                      ...prev,
                                      name: e.target.value,
                                    }))
                                  }
                                />

                                <Input
                                  label="Email"
                                  value={editContactForm.emails}
                                  onChange={(e) =>
                                    setEditContactForm((prev) => ({
                                      ...prev,
                                      emails: e.target.value,
                                    }))
                                  }
                                />

                                <Input
                                  label="Designation"
                                  value={editContactForm.designation}
                                  onChange={(e) =>
                                    setEditContactForm((prev) => ({
                                      ...prev,
                                      designation: e.target.value,
                                    }))
                                  }
                                />

                                <Input
                                  label="Contact No"
                                  value={editContactForm.contactNo}
                                  onChange={(e) =>
                                    setEditContactForm((prev) => ({
                                      ...prev,
                                      contactNo: e.target.value,
                                    }))
                                  }
                                />

                                <Input
                                  label="WhatsApp No"
                                  value={editContactForm.whatsappNo}
                                  onChange={(e) =>
                                    setEditContactForm((prev) => ({
                                      ...prev,
                                      whatsappNo: e.target.value,
                                    }))
                                  }
                                />

                                <div className="col-span-2 flex justify-end gap-2">
                                  <Button
                                    size="sm"
                                    variant="flat"
                                    onPress={() => {
                                      setEditingContactId(null);
                                      setEditContactForm(contactInitialValues);
                                    }}
                                  >
                                    Cancel
                                  </Button>

                                  <Button
                                    size="sm"
                                    color="primary"
                                    onPress={() =>
                                      handleUpdateUnitContact(contact?.id)
                                    }
                                  >
                                    Update
                                  </Button>
                                </div>
                              </div>
                            ) : (
                              <>
                                <div className="mb-3 flex items-start justify-between gap-3">
                                  <div>
                                    <p className="font-semibold">
                                      {contact?.title
                                        ? `${capitalize(contact.title)}. `
                                        : ""}
                                      {contact?.name || "-"}
                                    </p>

                                    <p className="text-default-500">
                                      {contact?.designation || "-"}
                                    </p>
                                  </div>

                                  <Button
                                    size="sm"
                                    variant="flat"
                                    onPress={() => {
                                      setEditingContactId(contact?.id);
                                      setEditContactForm({
                                        title: contact?.title || "",
                                        name: contact?.name || "",
                                        emails: contact?.emails || "",
                                        contactNo: contact?.contactNo || "",
                                        whatsappNo: contact?.whatsappNo || "",
                                        designation: contact?.designation || "",
                                      });
                                    }}
                                  >
                                    Edit
                                  </Button>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                  <div className="col-span-2">
                                    <p className="text-default-500">Email</p>
                                    <p className="font-medium break-all">
                                      {contact?.emails || "-"}
                                    </p>
                                  </div>

                                  <div>
                                    <p className="text-default-500">
                                      Contact No
                                    </p>
                                    <p className="font-medium">
                                      {contact?.contactNo || "-"}
                                    </p>
                                  </div>

                                  <div>
                                    <p className="text-default-500">
                                      WhatsApp No
                                    </p>
                                    <p className="font-medium">
                                      {contact?.whatsappNo || "-"}
                                    </p>
                                  </div>
                                </div>
                              </>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="rounded-xl border border-dashed border-default-300 p-6 text-center text-sm text-default-500">
                        No contacts found
                      </div>
                    )}

                    <div className="mt-5 rounded-xl border border-dashed border-primary/40 bg-primary/5 p-4">
                      <h4 className="mb-3 text-sm font-semibold">
                        Add New Contact
                      </h4>

                      <div className="grid grid-cols-3 gap-3">
                        <Input
                          label="Title"
                          value={contactForm.title}
                          onChange={(e) =>
                            setContactForm((prev) => ({
                              ...prev,
                              title: e.target.value,
                            }))
                          }
                        />

                        <Input
                          label="Name"
                          value={contactForm.name}
                          onChange={(e) =>
                            setContactForm((prev) => ({
                              ...prev,
                              name: e.target.value,
                            }))
                          }
                        />

                        <Input
                          label="Designation"
                          value={contactForm.designation}
                          onChange={(e) =>
                            setContactForm((prev) => ({
                              ...prev,
                              designation: e.target.value,
                            }))
                          }
                        />

                        <Input
                          label="Email"
                          value={contactForm.emails}
                          onChange={(e) =>
                            setContactForm((prev) => ({
                              ...prev,
                              emails: e.target.value,
                            }))
                          }
                        />

                        <Input
                          label="Contact No"
                          value={contactForm.contactNo}
                          onChange={(e) =>
                            setContactForm((prev) => ({
                              ...prev,
                              contactNo: e.target.value,
                            }))
                          }
                        />

                        <Input
                          label="WhatsApp No"
                          value={contactForm.whatsappNo}
                          onChange={(e) =>
                            setContactForm((prev) => ({
                              ...prev,
                              whatsappNo: e.target.value,
                            }))
                          }
                        />

                        <div className="col-span-3 flex justify-end">
                          <Button
                            color="primary"
                            onPress={handleCreateUnitContact}
                          >
                            Add Contact
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </ModalBody>

              <ModalFooter>
                <Button variant="flat" onPress={onClose}>
                  Close
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

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
              <ModalHeader>Add new GST</ModalHeader>
              <ModalBody>
                <Form
                  className="w-full"
                  onSubmit={(e) => {
                    e.preventDefault();
                    let data = Object.fromEntries(
                      new FormData(e.currentTarget),
                    );
                    handleFinish(data);
                  }}
                >
                  <div className="w-full max-h-[60vh] overflow-auto p-4">
                    <div className="grid grid-cols-2 gap-3">
                      <NewSelect
                        isRequired={true}
                        errorMessage={"please select the industry"}
                        label="Select industry"
                        name="industryId"
                        data={allIndustry || []}
                        labelKey={"name"}
                        valueKey={"id"}
                        value={formData?.industryId}
                        onChange={(e) => {
                          dispatch(getSubIndustryByIndustryId(e));
                          setFormData((prev) => ({ ...prev, industryId: e }));
                        }}
                      />

                      <NewSelect
                        isRequired={true}
                        errorMessage={"please select the sub industry"}
                        label="Select sub industry"
                        name="subIndustryId"
                        data={subIndustryListById || []}
                        labelKey={"name"}
                        valueKey={"id"}
                        value={formData?.subIndustryId}
                        onChange={(e) => {
                          dispatch(getSubSubIndustryBySubIndustryId(e));
                          setFormData((prev) => ({
                            ...prev,
                            subIndustryId: e,
                          }));
                        }}
                      />

                      <NewSelect
                        isRequired={true}
                        errorMessage={"please select the category"}
                        label="Select category"
                        name="subsubIndustryId"
                        data={subSubIndustryListById || []}
                        labelKey={"name"}
                        valueKey={"id"}
                        value={formData?.subsubIndustryId}
                        onChange={(e) => {
                          dispatch(getIndustryDataBySubSubIndustryId(e));
                          setFormData((prev) => ({
                            ...prev,
                            subsubIndustryId: e,
                          }));
                        }}
                      />

                      <NewSelect
                        isRequired={true}
                        errorMessage={"please select the business activity"}
                        label="Select category"
                        name="industrydataId"
                        selectionMode={"multiple"}
                        data={industryDataListById || []}
                        labelKey={"name"}
                        valueKey={"id"}
                        value={formData?.industrydataId}
                        onChange={(e) => {
                          setFormData((prev) => ({
                            ...prev,
                            industrydataId: e,
                          }));
                        }}
                      />

                      <Input
                        isRequired
                        label="GST number"
                        name="gstNo"
                        value={formData.gstNo}
                        onChange={handleGstChange}
                        maxLength={15}
                        errorMessage={gstError}
                        isInvalid={!!gstError}
                      />
                    </div>
                    <h1 className="font-medium my-3">Primary contacts</h1>
                    <Checkbox
                      className="my-2"
                      isSelected={isNewContact}
                      onValueChange={(e) => setIsNewContact(e)}
                    >
                      Wants to add new primary contact
                    </Checkbox>
                    {isNewContact ? (
                      <div className="grid grid-cols-2 gap-4 w-full">
                        <Select
                          isRequired
                          errorMessage="please select the salutation"
                          label="Salutation"
                          name="primaryTitle"
                          items={[
                            { label: "Master.", key: "master" },
                            { label: "Mr.", key: "mr" },
                            { label: "Mrs.", key: "mrs" },
                            { label: "Miss.", key: "miss" },
                          ]}
                          selectedKeys={[formData?.primaryTitle]}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              primaryTitle: e.target.value,
                            }))
                          }
                        >
                          {(item) => (
                            <SelectItem key={item?.key}>
                              {item?.label}
                            </SelectItem>
                          )}
                        </Select>
                        <Input
                          isRequired
                          errorMessage="please enter contact person name"
                          name="contactName"
                          label="Name"
                          value={formData?.contactName}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              contactName: e.target.value,
                            }))
                          }
                        />
                        <NewSelect
                          isRequired={true}
                          errorMessage={"please select the designation"}
                          data={desiginationList || []}
                          label={"Designation"}
                          name={"primaryDesignation"}
                          labelKey={"name"}
                          valueKey={"id"}
                          value={formData?.primaryDesignation}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              primaryDesignation: e,
                            }))
                          }
                        />
                        <Input
                          isRequired
                          errorMessage="please enter email address"
                          label="Email"
                          name="contactEmails"
                          type="email"
                          value={formData?.contactEmails}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              contactEmails: e.target.value,
                            }))
                          }
                        />
                        <Input
                          isRequired
                          errorMessage="please enter contact number"
                          label="Contact number"
                          name="contactNo"
                          value={formData?.contactNo}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              contactNo: e.target.value,
                            }))
                          }
                        />
                        <Input
                          isRequired
                          errorMessage="please enter whatsapp number"
                          label="Whatsapp number"
                          name="contactWhatsappNo"
                          value={formData?.contactWhatsappNo}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              contactWhatsappNo: e.target.value,
                            }))
                          }
                        />
                      </div>
                    ) : (
                      <NewSelect
                        data={contactListByCompanyId || []}
                        label={"Contact list"}
                        labelKey={"contactNo"}
                        valueKey={"id"}
                        name={"contactId"}
                        value={formData?.contactId}
                        onChange={(e) =>
                          setFormData((prev) => ({ ...prev, contactId: e }))
                        }
                      />
                    )}
                    <h1 className="font-medium my-3">Primary address</h1>
                    <div className="grid grid-cols-2 gap-4 w-full">
                      <Textarea
                        isRequired
                        errorMessage="please enter primary address"
                        label="Address"
                        name="address"
                        value={formData?.address}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            address: e.target.value,
                          }))
                        }
                      />
                      <NewSelect
                        data={countryList || []}
                        isRequired={true}
                        errorMessage={"please select the country"}
                        label={"Country"}
                        name={"country"}
                        labelKey={"name"}
                        valueKey={"name"}
                        value={formData?.country}
                        onChange={(e) => {
                          dispatch(getAllStatesByCountryName(e));
                          setFormData((prev) => ({ ...prev, country: e }));
                        }}
                      />
                      <NewSelect
                        data={statesList || []}
                        errorMessage={
                          formData.state ? "" : "Please select the state"
                        }
                        isRequired={true}
                        label="State"
                        name="state"
                        labelKey="name"
                        valueKey="name"
                        value={formData.state}
                        onChange={handleStateChange}
                      />
                      <NewSelect
                        data={citiesList || []}
                        errorMessage={"please select the city"}
                        isRequired={true}
                        label={"City"}
                        name={"city"}
                        labelKey={"name"}
                        valueKey={"name"}
                        value={formData?.city}
                        onChange={(e) => {
                          setFormData((prev) => ({ ...prev, city: e }));
                        }}
                      />
                      <Input
                        isRequired
                        errorMessage="please enter primary pin code"
                        label="Pin code"
                        name="primaryPinCode"
                        value={formData?.primaryPinCode}
                        onChange={(e) => {
                          setFormData((prev) => ({
                            ...prev,
                            primaryPinCode: e.target.value,
                          }));
                        }}
                      />
                    </div>
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

export default CompanyGstList;
