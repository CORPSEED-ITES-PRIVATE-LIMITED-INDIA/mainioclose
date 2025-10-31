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
import { ChevronDown, Plus, Search } from "lucide-react";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useParams } from "react-router-dom";
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
} from "../../toolkit/slices/commonSlice";
import { formatGSTInput, gstRegex } from "../../common";

const columns = [
  { name: "STATE ID", uid: "stateId" },
  { name: "STATE NAME", uid: "state", sortable: true },
  { name: "GST NUMBER", uid: "gstNo", sortable: true },
];

function capitalize(s) {
  return s ? s.charAt(0).toUpperCase() + s.slice(1).toLowerCase() : "";
}

const INITIAL_VISIBLE_COLUMNS = ["stateId", "state", "gstNo"];

const CompanyGstList = () => {
  const { userId, companyId } = useParams();
  const dispatch = useDispatch();
  const count = useSelector((state) => state.company.companyGstList?.length);
  const data = useSelector((state) => state.company.companyGstList);
  const countryList = useSelector((state) => state.common.countriesList);
  const statesList = useSelector((state) => state.common.statesList);
  const citiesList = useSelector((state) => state.common.citiesList);
  const contactListByCompanyId = useSelector(
    (state) => state.common.contactListByCompanyId
  );
  const allIndustry = useSelector((state) => state.common.allMainIndustry);
  const subIndustryListById = useSelector(
    (state) => state.common.subIndustryListByIndustryId
  );
  const subSubIndustryListById = useSelector(
    (state) => state.common.subSubIndustryListBySubIndustryId
  );
  const industryDataListById = useSelector(
    (state) => state.common.industryDataListBySubSubIndustryId
  );
  const desiginationList = useSelector(
    (state) => state.setting.clientDesiginationList
  );

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
    dispatch(getAllMainIndustry());
    dispatch(getAllCountries());
    dispatch(getGstListByCompanyId(companyId));
    dispatch(getAllContactListById(companyId));
  }, [dispatch, companyId]);

  const headerColumns = useMemo(() => {
    if (visibleColumns === "all") return columns;

    return columns.filter((column) =>
      Array.from(visibleColumns).includes(column.uid)
    );
  }, [visibleColumns]);

  const filteredItems = useMemo(() => {
    let filteredUsers = [...(data || [])];

    if (hasSearchFilter) {
      filteredUsers = filteredUsers?.filter((item) =>
        Object.values(item)?.some((val) =>
          String(val)?.toLowerCase()?.includes(filterValue?.toLowerCase())
        )
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
      case "state":
        return (
          <div className="flex items-start gap-2">
            <div className="flex flex-col">
              <Link
                to={`${company?.state}/companyUnits`}
                className="font-semibold"
              >
                {company?.state || "-"}
              </Link>
            </div>
          </div>
        );

      case "gstNo":
        return (
          <div className="flex flex-col">
            <span className="font-normal">{company.gstNo || "-"}</span>
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

  const topContent = useMemo(() => {
    return (
      <div className="flex flex-col gap-4">
        <div className="flex justify-between gap-3 items-end">
          <Input
            isClearable
            className="w-full sm:max-w-[35%]"
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
              Add GST
            </Button>
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
          addToast({ title: "Something went wrong !.", color: "danger" })
        );
    },
    [companyId, formValues, formData, dispatch]
  );

  return (
    <>
      <h1 className="font-sans text-2xl font-medium mb-1">GST list</h1>
      <Table
        isHeaderSticky
        aria-label="Example table with custom cells, pagination and sorting"
        bottomContent={bottomContent}
        bottomContentPlacement="outside"
        classNames={{
          wrapper: "2xl:max-h-[68vh] md:max-h-[62vh] w-full",
          table:'w-full'
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
            <TableRow key={item.stateId}>
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
              <ModalHeader>Add new GST</ModalHeader>
              <ModalBody>
                <Form
                  className="w-full"
                  onSubmit={(e) => {
                    e.preventDefault();
                    let data = Object.fromEntries(
                      new FormData(e.currentTarget)
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
