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
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  DatePicker,
  addToast,
} from "@heroui/react";
import { ChevronDown, EllipsisVertical, Search } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import {
  convertServingCompanyToCompany,
  getAllCompanyType,
  getAllGstTypeByCompanyTypeId,
  getAllServingCompanyList,
} from "../../toolkit/slices/companySlice";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import * as z from "zod";
import NewSelect from "../../components/NewSelect";
import {
  getLocalTimeZone,
  parseDate,
  toCalendarDate,
  today,
} from "@internationalized/date";
import {
  getAllContactDetails,
  getAllCountries,
  getAllMainIndustry,
  getIndustryDataBySubSubIndustryId,
  getSubIndustryByIndustryId,
  getSubSubIndustryBySubIndustryId,
} from "../../toolkit/slices/commonSlice";
import SingleFileUploader from "../../components/SingleFileUploader";
import { getClientDesiginationList } from "../../toolkit/slices/settingSlice";

const formSchema = z.object({
  companyName: z.string().min(1, "Please enter company name"),
  companyType: z.string().min(1, "Please select the company structure"),
  gstNo: z.string().min(15, "please enter GST number"),
  panNo: z.string().min(10, "please enter pan number"),
  establishDate: z.string().min(1, "Please enter company incorporate date"),
  industryId: z.string().min(1, "Please select the industry"),
  subIndustryId: z.string().min(1, "Please select the sub industry"),
  subsubIndustryId: z.string().min(1, "Please select the category"),
  industrydataId: z
    .array(z.string())
    .min(1, "Please select the business activity"),
  gstDocuments: z.string().optional(),
  primaryTitle: z.enum(["master", "mr", "mrs", "miss"], {
    required_error: "Please select the salutation",
  }),
  contactName: z.string().min(1, "Please enter contact person name"),
  primaryDesignation: z.string().min(1, "Please select the designation"),
  contactEmails: z.string().email("Please enter a valid email address"),
  contactNo: z.string().min(1, "Please enter contact number"),
  contactWhatsappNo: z.string().min(1, "Please enter whatsapp number"),
  secondaryTitle: z.enum(["master", "mr", "mrs", "miss"], {
    required_error: "Please select the salutation",
  }),
  secondaryContactName: z.string().min(1, "Please enter contact person name"),
  secondaryDesignation: z.string().min(1, "Please select the designation"),
  secondaryContactEmails: z
    .string()
    .email("Please enter a valid email address"),
  secondaryContactNo: z.string().min(1, "Please enter contact number"),
  secondaryContactWhatsappNo: z.string().min(1, "Please enter whatsapp number"),
  address: z.string().min(1, "Please enter primary address"),
  country: z.string().min(1, "Please select the country"),
  state: z.string().min(1, "Please select the state"),
  city: z.string().min(1, "Please select the city"),
  primaryPinCode: z.string().min(1, "Please enter primary pin code"),
  secondaryAddress: z.string().optional(),
  secondaryCountry: z.string().optional(),
  secondaryState: z.string().optional(),
  secondaryCity: z.string().optional(),
  secondaryPinCode: z.string().optional(),
});

const defaultValues = {
  companyName: "",
  companyType: "",
  gstNo: "",
  panNo: "",
  establishDate: "",
  industryId: "",
  subIndustryId: "",
  subsubIndustryId: "",
  industrydataId: [],
  gstDocuments: "",
  primaryTitle: "",
  contactName: "",
  primaryDesignation: "",
  contactEmails: "",
  contactNo: "",
  contactWhatsappNo: "",
  secondaryTitle: "",
  secondaryContactName: "",
  secondaryDesignation: "",
  secondaryContactEmails: "",
  secondaryContactNo: "",
  secondaryContactWhatsappNo: "",
  address: "",
  country: "",
  state: "",
  city: "",
  primaryPinCode: "",
  secondaryAddress: "",
  secondaryCountry: "",
  secondaryState: "",
  secondaryCity: "",
  secondaryPinCode: "",
};

const columns = [
  { name: "ID", uid: "companyId" },
  { name: "COMPANY", uid: "companyName", sortable: true },
  { name: "GST", uid: "gstNo" },
  { name: "CLIENT", uid: "client" },
  { name: "ASSIGNEE", uid: "assignee" },
  { name: "PRIMARY ADDRESS", uid: "address" },
  { name: "SECONDARY ADDRESS", uid: "secondaryAddress" },
  { name: "ACTIONS", uid: "actions" },
];

function capitalize(s) {
  return s ? s.charAt(0).toUpperCase() + s.slice(1).toLowerCase() : "";
}

const INITIAL_VISIBLE_COLUMNS = [
  "companyName",
  "gstNo",
  "status",
  "client",
  "assignee",
  "address",
  "actions",
];

const ServingCompanies = () => {
  const { userId } = useParams();
  const dispatch = useDispatch();
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const count = useSelector(
    (state) => state.company.servingCompanyList[0]?.total
  );
  const data = useSelector((state) => state.company.servingCompanyList);
  const companyTypeList = useSelector((state) => state.company.companyTypeList);
  const countryList = useSelector((state) => state.common.countriesList);
  const statesList = useSelector((state) => state.common.statesList);
  const citiesList = useSelector((state) => state.common.citiesList);
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
  const [filterValue, setFilterValue] = useState("");
  const [selectedKeys, setSelectedKeys] = useState(new Set([]));
  const [visibleColumns, setVisibleColumns] = useState(
    new Set(INITIAL_VISIBLE_COLUMNS)
  );
  const [sortDescriptor, setSortDescriptor] = useState({
    column: "age",
    direction: "ascending",
  });
  const [filteration, setFilteration] = useState({
    userId: userId,
    page: 1,
    size: 50,
    status: "initiated",
  });

  const hasSearchFilter = Boolean(filterValue);

  useEffect(() => {
    dispatch(getAllServingCompanyList(filteration));
  }, [dispatch, filteration]);

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
    reset,
  } = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: defaultValues,
  });

  const validateGST = (gstNo, stateName) => {
    if (!gstNo) return "";
    if (
      !/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(gstNo)
    ) {
      return "Invalid GST Number";
    }
    const selectedState = statesList?.find((s) => s.name === stateName);
    if (selectedState && gstNo.slice(0, 2) !== selectedState.gstCode) {
      return "GST code does not match selected state";
    }
    return "";
  };

  const handlePanChange = (e) => {
    const rawValue = e.target.value;
    const formattedValue = formatPANInput(rawValue);
    setValue("panNo", formattedValue);
    if (
      formattedValue.length === 10 &&
      !/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(formattedValue)
    ) {
      setPanError("Invalid PAN Number");
    } else {
      setPanError("");
    }
  };

  const handleGstChange = (e) => {
    const rawValue = e.target.value;
    const formattedValue = formatGSTInput(rawValue);
    setValue("gstNo", formattedValue);
    const error = validateGST(formattedValue, state);
    setGstError(error);
  };

  const handleStateChange = (stateName) => {
    setValue("state", stateName);
    dispatch(getAllCitiesByStateName(stateName));
    const error = validateGST(gstNo, stateName);
    setGstError(error);
  };

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
        user?.projectName?.toLowerCase().includes(filterValue.toLowerCase())
      );
    }
    return filteredUsers;
  }, [data, filterValue]);

  const pages = Math.ceil(count / filteration?.size) || 1;

  const items = useMemo(() => {
    const start = (filteration?.page - 1) * filteration?.size;
    const end = start + filteration?.size;

    return filteredItems.slice(start, end);
  }, [filteration, filteredItems]);

  const sortedItems = useMemo(() => {
    return [...items].sort((a, b) => {
      const first = a[sortDescriptor.column];
      const second = b[sortDescriptor.column];
      const cmp = first < second ? -1 : first > second ? 1 : 0;

      return sortDescriptor.direction === "descending" ? -cmp : cmp;
    });
  }, [sortDescriptor, items]);

  const handleConvertCompany = (value) => {
    dispatch(getAllMainIndustry());
    dispatch(getClientDesiginationList());
    dispatch(getAllContactDetails());
    dispatch(getAllCountries());
    dispatch(getAllCompanyType());
    dispatch(getSubIndustryByIndustryId(value?.industry?.id));
    dispatch(getSubSubIndustryBySubIndustryId(value?.subIndustry?.id));
    dispatch(getIndustryDataBySubSubIndustryId(value?.subSubIndustry?.id));
    reset({
      companyName: value?.companyName,
      companyType: value?.gstType,
      gstNo: value?.gstNo,
      // establishDate: value?.establishDate
      //   ? dayjs(value?.establishDate)
      //   : dayjs(),
      industryId: value?.industry?.id,
      subIndustryId: value?.subIndustry?.id,
      subsubIndustryId: value?.subSubIndustry?.id,
      industrydataId: value?.industryData?.map((item) => item?.id),
      panNo: value?.panNo,
      primaryTitle: value?.primaryContact?.title,
      contactName: value?.primaryContact?.name,
      primaryDesignation: Number(value?.primaryContact?.designation),
      contactEmails: value?.primaryContact?.emails,
      contactNo: value?.primaryContact?.contactNo,
      contactWhatsappNo: value?.primaryContact?.whatsappNo,
      address: value?.address,
      country: value?.country,
      state: value?.state,
      city: value?.city,
      primaryPinCode: value?.primaryPinCode,
      secondaryTitle: value?.secondaryContact?.title,
      secondaryContactName: value?.secondaryContact?.name,
      secondaryDesignation: Number(value?.secondaryContact?.designation),
      secondaryContactEmails: value?.secondaryContact?.emails,
      secondaryContactNo: value?.secondaryContact?.contactNo,
      secondaryContactWhatsappNo: value?.secondaryContact?.whatsappNo,
      secondaryAddress: value?.secondaryAddress,
      secondaryCountry: value?.secondaryCountry,
      secondaryState: value?.secondaryState,
      secondaryCity: value?.secondaryCity,
      secondaryPinCode: value?.secondaryPinCode,
    });
    onOpen();
    setEditData(value);
  };

  const renderCell = useCallback((rowData, columnKey) => {
    switch (columnKey) {
      case "companyName":
        return (
          <div className="flex items-start gap-2">
            <div className="flex flex-col">
              <p className="font-normal capitalize">
                {rowData?.companyName || "-"}
              </p>
              <p className="font-normal text-xs text-gray-400">
                Age : {rowData?.age || "-"}
              </p>
            </div>
          </div>
        );

      case "gstNo":
        return (
          <div className="flex flex-col">
            <span className="font-normal capitalize">
              {rowData?.gstNo || "Unknown"}
            </span>
            {rowData?.gstType && (
              <Chip size="sm" className="text-tiny capitalize" variant="flat">
                {rowData?.gstType}
              </Chip>
            )}
          </div>
        );

      case "client":
        return (
          <div className="flex flex-col">
            <span className="font-normal">
              {rowData?.clientContactEmail || "-"}
            </span>
            <span className="text-tiny text-gray-400">
              {rowData?.clientContactEmail || "-"}
            </span>
          </div>
        );
      case "assignee":
        return (
          <div className="flex flex-col">
            <span className="font-normal">{rowData?.assignee || "-"}</span>
          </div>
        );
      case "address":
        return rowData?.address ? (
          <div className="flex flex-col">
            <span className="font-normal">{rowData?.address || "-"}</span>
            <div className="flex items-center gap-1">
              {" "}
              <span className="text-gray-400 text-tiny">
                {rowData?.city || "-"},
              </span>
              <span className="text-gray-400 text-tiny">
                {rowData?.state || "-"},
              </span>
            </div>

            <div className="flex items-center gap-1">
              <span className="text-gray-400 text-tiny">
                {rowData?.country || "-"}
              </span>
              ,
              <span className="text-gray-400 text-tiny">
                {rowData?.primaryPinCode || "-"}
              </span>
            </div>
          </div>
        ) : (
          "-"
        );
      case "secondaryAddress":
        return rowData?.secondaryAddress ? (
          <div className="flex flex-col">
            <span className="font-normal">
              {rowData?.secondaryAddress || "-"}
            </span>
            <div className="flex items-center gap-1">
              {" "}
              <span className="text-gray-400">
                {rowData?.secondaryCity || "-"}
              </span>
              ,
              <span className="text-gray-400">
                {rowData?.secondaryState || "-"}
              </span>
              ,
            </div>
            <div className="flex items-center gap-1">
              <span className="text-gray-400 text-tiny">
                {rowData?.secondaryCountry || "-"}
              </span>
              ,
              <span className="text-gray-400 text-tiny">
                {rowData?.secondaryPinCode || "-"}
              </span>
            </div>
          </div>
        ) : (
          "-"
        );
      case "actions":
        return (
          <Dropdown>
            <DropdownTrigger>
              <Button size="sm" isIconOnly variant="light">
                <EllipsisVertical />
              </Button>
            </DropdownTrigger>
            <DropdownMenu>
              <DropdownItem onPress={() => handleConvertCompany(rowData)}>
                Convert to company
              </DropdownItem>
              {/* <DropdownItem>Change assignee</DropdownItem> */}
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

  const handleFinish = (values) => {
    dispatch(
      convertServingCompanyToCompany({
        assigneeId: userId,
        updatedBy: userId,
        ...values,
      })
    )
      .then((res) => {
        if (res.meta.requestStatus === "fulfilled") {
          addToast({
            title: "Serving company converted to company successfully",
            color: "success",
          });
          reset(defaultValues);
          setOpenModal(false);
          setEditData(null);
          dispatch(getAllServingCompanyList(filteration));
        } else {
          addToast({ title: "Something went wrong !.", color: "danger" });
        }
      })
      .catch((err) =>
        addToast({ title: "Something went wrong !.", color: "danger" })
      );
  };

  const topContent = useMemo(() => {
    return (
      <div className="flex flex-col gap-4">
        <div className="flex justify-between gap-3 items-end">
          <Input
            isClearable
            className="w-full sm:max-w-[44%]"
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
                {[
                  { label: "Initiated", uid: "initiated" },
                  { label: "Approved", uid: "approved" },
                  { label: "Disapproved", uid: "disapproved" },
                ].map((status) => (
                  <DropdownItem key={status.uid} className="capitalize">
                    {capitalize(status.label)}
                  </DropdownItem>
                ))}
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
            Total {count} projects
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
      <h1 className="font-sans text-2xl font-medium mb-1">Serving companies</h1>
      <Table
        isHeaderSticky
        aria-label="Example table with custom cells, pagination and sorting"
        bottomContent={bottomContent}
        bottomContentPlacement="outside"
        classNames={{
          wrapper: "max-h-[70vh] max-w-full",
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
      <Modal isOpen={isOpen} onOpenChange={onOpenChange} size="5xl">
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                Modal Title
              </ModalHeader>
              <ModalBody>
                <form onSubmit={handleSubmit(handleFinish)}>
                  <div className="max-h-[64vh] overflow-auto p-3 flex flex-col gap-12">
                    <div className="p-4 shadow-[0px_10px_36px_0px_rgba(0,0,0,0.16),0px_0px_0px_1px_rgba(0,0,0,0.06)] rounded-lg">
                      <h2 className="mb-2 font-medium text-lg">Company info</h2>
                      <div className="grid grid-cols-3 gap-4">
                        <Controller
                          name="companyName"
                          control={control}
                          render={({ field, fieldState: { error } }) => (
                            <Input
                              isRequired
                              label="Serving company name"
                              errorMessage={error?.message}
                              isInvalid={!!error}
                              {...field}
                            />
                          )}
                        />
                        <Controller
                          name="companyType"
                          control={control}
                          render={({ field, fieldState: { error } }) => (
                            <NewSelect
                              isRequired
                              label="Serving company structure"
                              errorMessage={error?.message}
                              isInvalid={!!error}
                              data={companyTypeList || []}
                              labelKey="name"
                              valueKey="id"
                              value={field.value}
                              onChange={(value) => {
                                dispatch(getAllGstTypeByCompanyTypeId(value));
                                field.onChange(value);
                              }}
                            />
                          )}
                        />
                        <Controller
                          name="gstNo"
                          control={control}
                          render={({ field, fieldState: { error } }) => (
                            <Input
                              isRequired
                              label="GST number"
                              maxLength={15}
                              errorMessage={error?.message || gstError}
                              isInvalid={!!error || !!gstError}
                              {...field}
                              onChange={(e) => {
                                handleGstChange(e);
                              }}
                            />
                          )}
                        />
                        <Controller
                          name="panNo"
                          control={control}
                          render={({ field, fieldState: { error } }) => (
                            <Input
                              isRequired
                              label="Pan number"
                              maxLength={10}
                              errorMessage={error?.message || panError}
                              isInvalid={!!error || !!panError}
                              {...field}
                              onChange={(e) => {
                                handlePanChange(e);
                              }}
                            />
                          )}
                        />

                        <Controller
                          name="establishDate"
                          control={control}
                          render={({ field, fieldState: { error } }) => (
                            <DatePicker
                              isRequired
                              label="Company incorporate date"
                              showMonthAndYearPickers
                              maxValue={today(getLocalTimeZone())}
                              errorMessage={error?.message}
                              isInvalid={!!error}
                              value={
                                field.value ? parseDate(field.value) : null
                              }
                              onChange={(e) =>
                                field.onChange(toCalendarDate(e).toString())
                              }
                            />
                          )}
                        />
                        <Controller
                          name="industryId"
                          control={control}
                          render={({ field, fieldState: { error } }) => (
                            <NewSelect
                              isRequired={true}
                              label="Select industry"
                              errorMessage={error?.message}
                              isInvalid={!!error}
                              data={allIndustry || []}
                              labelKey="name"
                              valueKey="id"
                              value={field.value}
                              onChange={(value) => {
                                dispatch(getSubIndustryByIndustryId(value));
                                field.onChange(value);
                              }}
                            />
                          )}
                        />
                        <Controller
                          name="subIndustryId"
                          control={control}
                          render={({ field, fieldState: { error } }) => (
                            <NewSelect
                              isRequired={true}
                              label="Select sub industry"
                              errorMessage={error?.message}
                              isInvalid={!!error}
                              data={subIndustryListById || []}
                              labelKey="name"
                              valueKey="id"
                              value={field.value}
                              onChange={(value) => {
                                dispatch(
                                  getSubSubIndustryBySubIndustryId(value)
                                );
                                field.onChange(value);
                              }}
                            />
                          )}
                        />
                        <Controller
                          name="subsubIndustryId"
                          control={control}
                          render={({ field, fieldState: { error } }) => (
                            <NewSelect
                              isRequired={true}
                              label="Select category"
                              errorMessage={error?.message}
                              isInvalid={!!error}
                              data={subSubIndustryListById || []}
                              labelKey="name"
                              valueKey="id"
                              value={field.value}
                              onChange={(value) => {
                                dispatch(
                                  getIndustryDataBySubSubIndustryId(value)
                                );
                                field.onChange(value);
                              }}
                            />
                          )}
                        />
                        <Controller
                          name="industrydataId"
                          control={control}
                          render={({ field, fieldState: { error } }) => (
                            <NewSelect
                              isRequired={true}
                              label="Select business activity"
                              selectionMode="multiple"
                              errorMessage={error?.message}
                              isInvalid={!!error}
                              data={industryDataListById || []}
                              labelKey="name"
                              valueKey="id"
                              value={field.value}
                              onChange={(value) => field.onChange(value)}
                            />
                          )}
                        />
                        <Controller
                          name="gstDocuments"
                          control={control}
                          render={({ field, fieldState: { error } }) => (
                            <SingleFileUploader
                              label="GST document"
                              value={field.value}
                              onChange={(value) => {
                                field.onChange(value);
                              }}
                              errorMessage={error?.message}
                              isInvalid={!!error}
                            />
                          )}
                        />
                      </div>
                    </div>
                    <div className="p-4 shadow-[0px_10px_36px_0px_rgba(0,0,0,0.16),0px_0px_0px_1px_rgba(0,0,0,0.06)] rounded-lg">
                      <h2 className="mb-2 font-medium text-lg">Contacts</h2>
                      <h3 className="font-medium my-3">Primary contacts</h3>
                      <div className="grid grid-cols-3 gap-4 w-full">
                        <Controller
                          name="primaryTitle"
                          control={control}
                          render={({ field, fieldState: { error } }) => (
                            <Select
                              isRequired={true}
                              label="Salutation"
                              errorMessage={error?.message}
                              isInvalid={!!error}
                              {...field}
                              onChange={(e) => field.onChange(e.target.value)}
                              items={[
                                { label: "Master.", key: "master" },
                                { label: "Mr.", key: "mr" },
                                { label: "Mrs.", key: "mrs" },
                                { label: "Miss.", key: "miss" },
                              ]}
                            >
                              {(item) => (
                                <SelectItem key={item.key}>
                                  {item.label}
                                </SelectItem>
                              )}
                            </Select>
                          )}
                        />
                        <Controller
                          name="contactName"
                          control={control}
                          render={({ field, fieldState: { error } }) => (
                            <Input
                              isRequired={true}
                              label="Name"
                              errorMessage={error?.message}
                              isInvalid={!!error}
                              {...field}
                            />
                          )}
                        />
                        <Controller
                          name="primaryDesignation"
                          control={control}
                          render={({ field, fieldState: { error } }) => (
                            <NewSelect
                              isRequired={true}
                              label="Designation"
                              errorMessage={error?.message}
                              isInvalid={!!error}
                              data={desiginationList || []}
                              labelKey="name"
                              valueKey="id"
                              value={field.value}
                              onChange={(value) => field.onChange(value)}
                            />
                          )}
                        />
                        <Controller
                          name="contactEmails"
                          control={control}
                          render={({ field, fieldState: { error } }) => (
                            <Input
                              isRequired={true}
                              label="Email"
                              type="email"
                              errorMessage={error?.message}
                              isInvalid={!!error}
                              {...field}
                            />
                          )}
                        />
                        <Controller
                          name="contactNo"
                          control={control}
                          render={({ field, fieldState: { error } }) => (
                            <Input
                              isRequired={true}
                              label="Contact number"
                              errorMessage={error?.message}
                              isInvalid={!!error}
                              {...field}
                            />
                          )}
                        />
                        <Controller
                          name="contactWhatsappNo"
                          control={control}
                          render={({ field, fieldState: { error } }) => (
                            <Input
                              isRequired={true}
                              label="Whatsapp number"
                              errorMessage={error?.message}
                              isInvalid={!!error}
                              {...field}
                            />
                          )}
                        />
                      </div>
                      <h3 className="font-medium my-3">Secondary contacts</h3>
                      <div className="grid grid-cols-3 gap-4">
                        <Controller
                          name="secondaryTitle"
                          control={control}
                          render={({ field, fieldState: { error } }) => (
                            <Select
                              label="Salutation"
                              errorMessage={error?.message}
                              isInvalid={!!error}
                              {...field}
                              onChange={(e) => field.onChange(e.target.value)}
                              items={[
                                { label: "Master.", key: "master" },
                                { label: "Mr.", key: "mr" },
                                { label: "Mrs.", key: "mrs" },
                                { label: "Miss.", key: "miss" },
                              ]}
                            >
                              {(item) => (
                                <SelectItem key={item.key}>
                                  {item.label}
                                </SelectItem>
                              )}
                            </Select>
                          )}
                        />
                        <Controller
                          name="secondaryContactName"
                          control={control}
                          render={({ field, fieldState: { error } }) => (
                            <Input
                              label="Name"
                              errorMessage={error?.message}
                              isInvalid={!!error}
                              {...field}
                            />
                          )}
                        />
                        <Controller
                          name="secondaryDesignation"
                          control={control}
                          render={({ field, fieldState: { error } }) => (
                            <NewSelect
                              label="Designation"
                              errorMessage={error?.message}
                              isInvalid={!!error}
                              data={desiginationList || []}
                              labelKey="name"
                              valueKey="id"
                              value={field.value}
                              onChange={(value) => field.onChange(value)}
                            />
                          )}
                        />
                        <Controller
                          name="secondaryContactEmails"
                          control={control}
                          render={({ field, fieldState: { error } }) => (
                            <Input
                              label="Email"
                              type="email"
                              errorMessage={error?.message}
                              isInvalid={!!error}
                              {...field}
                            />
                          )}
                        />
                        <Controller
                          name="secondaryContactNo"
                          control={control}
                          render={({ field, fieldState: { error } }) => (
                            <Input
                              label="Contact number"
                              errorMessage={error?.message}
                              isInvalid={!!error}
                              {...field}
                            />
                          )}
                        />
                        <Controller
                          name="secondaryContactWhatsappNo"
                          control={control}
                          render={({ field, fieldState: { error } }) => (
                            <Input
                              label="Whatsapp number"
                              errorMessage={error?.message}
                              isInvalid={!!error}
                              {...field}
                            />
                          )}
                        />
                      </div>
                    </div>
                    <div className="p-4 shadow-[0px_10px_36px_0px_rgba(0,0,0,0.16),0px_0px_0px_1px_rgba(0,0,0,0.06)] rounded-lg">
                      <h2 className="mb-2 font-medium text-lg">Address</h2>
                      <h3 className="font-medium my-3">Billing address</h3>
                      <div className="grid grid-cols-3 gap-4">
                        <Controller
                          name="address"
                          control={control}
                          render={({ field, fieldState: { error } }) => (
                            <Input
                              label="Address"
                              errorMessage={error?.message}
                              isInvalid={!!error}
                              {...field}
                            />
                          )}
                        />
                        <Controller
                          name="country"
                          control={control}
                          render={({ field, fieldState: { error } }) => (
                            <NewSelect
                              label="Country"
                              errorMessage={error?.message}
                              isInvalid={!!error}
                              data={countryList || []}
                              labelKey="name"
                              valueKey="name"
                              value={field.value}
                              onChange={(value) => {
                                dispatch(getAllStatesByCountryName(value));
                                field.onChange(value);
                              }}
                            />
                          )}
                        />

                        <Controller
                          name="state"
                          control={control}
                          render={({ field, fieldState: { error } }) => (
                            <NewSelect
                              label="State"
                              errorMessage={error?.message}
                              isInvalid={!!error}
                              data={statesList || []}
                              labelKey="name"
                              valueKey="name"
                              value={field.value}
                              onChange={(value) => {
                                handleStateChange(value);
                                field.onChange(value);
                              }}
                            />
                          )}
                        />

                        <Controller
                          name="city"
                          control={control}
                          render={({ field, fieldState: { error } }) => (
                            <NewSelect
                              label="City"
                              errorMessage={error?.message}
                              isInvalid={!!error}
                              data={citiesList || []}
                              labelKey="name"
                              valueKey="name"
                              value={field.value}
                              onChange={(value) => field.onChange(value)}
                            />
                          )}
                        />

                        <Controller
                          name="primaryPinCode"
                          control={control}
                          render={({ field, fieldState: { error } }) => (
                            <Input
                              label="Pin code"
                              errorMessage={error?.message}
                              isInvalid={!!error}
                              {...field}
                            />
                          )}
                        />
                      </div>
                      <h3 className="font-medium my-3">Shipping address</h3>
                      {/* <Controller
                                 name="sameAsBilling"
                                 control={control}
                                 render={({ field }) => (
                                   <Checkbox
                                     isSelected={field.value}
                                     onChange={(e) => field.onChange(e.target.checked)}
                                   >
                                     Same as billing address
                                   </Checkbox>
                                 )}
                               /> */}
                      <div className="grid grid-cols-3 gap-4">
                        <Controller
                          name="secondaryAddress"
                          control={control}
                          render={({ field, fieldState: { error } }) => (
                            <Input
                              label="Address"
                              errorMessage={error?.message}
                              isInvalid={!!error}
                              {...field}
                            />
                          )}
                        />

                        <Controller
                          name="secondaryCountry"
                          control={control}
                          render={({ field, fieldState: { error } }) => (
                            <NewSelect
                              label="Country"
                              errorMessage={error?.message}
                              isInvalid={!!error}
                              data={countryList || []}
                              labelKey="name"
                              valueKey="name"
                              value={field.value}
                              onChange={(value) => {
                                dispatch(getAllStatesByCountryName(value));
                                field.onChange(value);
                              }}
                            />
                          )}
                        />

                        <Controller
                          name="secondaryState"
                          control={control}
                          render={({ field, fieldState: { error } }) => (
                            <NewSelect
                              label="State"
                              errorMessage={error?.message}
                              isInvalid={!!error}
                              data={statesList || []}
                              labelKey="name"
                              valueKey="name"
                              value={field.value}
                              onChange={(value) => {
                                dispatch(getAllCitiesByStateName(value));
                                field.onChange(value);
                              }}
                            />
                          )}
                        />

                        <Controller
                          name="secondaryCity"
                          control={control}
                          render={({ field, fieldState: { error } }) => (
                            <NewSelect
                              label="City"
                              errorMessage={error?.message}
                              isInvalid={!!error}
                              data={citiesList || []}
                              labelKey="name"
                              valueKey="name"
                              value={field.value}
                              onChange={(value) => field.onChange(value)}
                            />
                          )}
                        />

                        <Controller
                          name="secondaryPinCode"
                          control={control}
                          render={({ field, fieldState: { error } }) => (
                            <Input
                              label="Pin code"
                              errorMessage={error?.message}
                              isInvalid={!!error}
                              {...field}
                            />
                          )}
                        />
                      </div>
                    </div>
                  </div>
                  <ModalFooter>
                    <Button color="danger" variant="light" onPress={onClose}>
                      Close
                    </Button>
                    <Button color="primary" onPress={onClose}>
                      Action
                    </Button>
                  </ModalFooter>
                </form>
              </ModalBody>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
};

export default ServingCompanies;
