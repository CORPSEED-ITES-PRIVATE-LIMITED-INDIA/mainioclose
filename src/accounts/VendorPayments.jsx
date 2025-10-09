import React, { useEffect, useState } from "react";
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
  Pagination,
  useDisclosure,
  Modal,
  ModalBody,
  ModalFooter,
  ModalContent,
  ModalHeader,
  Select,
  SelectItem,
  DatePicker,
  addToast,
} from "@heroui/react";
import { ChevronDown, EllipsisVertical, Plus, Search } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import dayjs from "dayjs";
import {
  createVendorsPayment,
  getAllVendorsPaymentCount,
  getAllVendorsPaymentList,
} from "../toolkit/slices/accountSlice";
import TaxInvoice from "../components/TaxInvoice";
import { formatGSTInput, inrCurrency } from "../common";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import * as z from "zod";
import NewSelect from "../components/NewSelect";
import {
  getAllCitiesByStateName,
  getAllCountries,
  getAllStatesByCountryName,
  getAllUrlList,
} from "../toolkit/slices/commonSlice";
import {
  getLocalTimeZone,
  parseDate,
  toCalendarDate,
  today,
} from "@internationalized/date";
import FileUploader from "../components/FileUploader";
import { useParams } from "react-router-dom";

export const columns = [
  { name: "DATE", uid: "date" },
  { name: "UNBILL NO.", uid: "unbillNo", sortable: true },
  { name: "SERVICE", uid: "service" },
  { name: "CLIENT", uid: "client" },
  { name: "COMPANY", uid: "company" },
  { name: "TXN. AMOUNT", uid: "txnAmount" },
  { name: "ADDED BY", uid: "addedBy" },
  { name: "ACTIONS", uid: "actions" },
];

export function capitalize(s) {
  return s ? s.charAt(0).toUpperCase() + s.slice(1).toLowerCase() : "";
}

const INITIAL_VISIBLE_COLUMNS = [
  "date",
  "unbillNo",
  "service",
  "client",
  "company",
  "txnAmount",
  "addedBy",
  "actions",
];

const formSchema = () =>
  z.object({
    estimateNo: z.string().min(1, "Estimate number cannot be empty"),
    serviceName: z.string().min(1, "Service name cannot be empty"),
    quantity: z.string().min(1, "Please quantity"),
    vendorCompanyName: z.string().min(1, "Please company name"),
    gstType: z.string().min(1, "please select gst type"),
    gstNo: z.string().min(1, "please enter gst number"),
    name: z.string().min(1, "please enter vendor name"),
    emails: z.string().min(1, "please enter email"),
    contactNo: z.string().min(1, "please enter contact number"),
    whatsappNo: z.string().min(1, "please enter whatsapp number"),
    address: z.string().min(1, "please enter address"),
    country: z.string().min(1, "please select  country"),
    state: z.string().min(1, "please select state"),
    city: z.string().min(1, "please select city"),
    pinCode: z.string().min(1, "please enter address"),
    createDate: z.string().min(1, "please enter date"),
    remarkByVendor: z.string().min(1, "please remark "),
    remark: z.string().min(1, "please remark "),
    fileData: z.array(z.string()).optional(),
  });

const defaultValues = {
  estimateNo: "",
  serviceName: "",
  quantity: "",
  vendorCompanyName: "",
  gstType: "",
  gstNo: "",
  name: "",
  emails: "",
  contactNo: "",
  whatsappNo: "",
  address: "",
  country: "",
  state: "",
  city: "",
  pinCode: "",
  createDate: "",
  remarkByVendor: "",
  remark: "",
  fileData: [""],
};

const VendorPayments = () => {
  const { userId } = useParams();
  const dispatch = useDispatch();
  const { isOpen, onClose, onOpen, onOpenChange } = useDisclosure();
  const invoiceModal = useDisclosure();
  const data = useSelector((state) => state.account.vendorsPaymentList);
  const count = useSelector((state) => state.account.vendorsPaymentCount);
  const urlList = useSelector((state) => state.common.urlList);
  const countryList = useSelector((state) => state.common.countriesList);
  const statesList = useSelector((state) => state.common.statesList);
  const citiesList = useSelector((state) => state.common.citiesList);
  const [filterValue, setFilterValue] = React.useState("");
  const [selectedKeys, setSelectedKeys] = React.useState(new Set([]));
  const [visibleColumns, setVisibleColumns] = React.useState(
    new Set(INITIAL_VISIBLE_COLUMNS)
  );
  const [rowsPerPage, setRowsPerPage] = React.useState(50);
  const [sortDescriptor, setSortDescriptor] = React.useState({
    column: "age",
    direction: "ascending",
  });
  const [page, setPage] = React.useState(1);
  const hasSearchFilter = Boolean(filterValue);
  const [gstError, setGstError] = useState("");

  useEffect(() => {
    dispatch(getAllVendorsPaymentList({ page, size: rowsPerPage }));
    dispatch(getAllVendorsPaymentCount());
  }, [dispatch, page, rowsPerPage]);

  useEffect(() => {
    dispatch(getAllCountries());
    dispatch(getAllUrlList());
  }, [dispatch]);

  const headerColumns = React.useMemo(() => {
    if (visibleColumns === "all") return columns;

    return columns.filter((column) =>
      Array.from(visibleColumns).includes(column.uid)
    );
  }, [visibleColumns]);

  const filteredItems = React.useMemo(() => {
    let filteredUsers = [...(data || [])];

    if (hasSearchFilter) {
      filteredUsers = filteredUsers.filter((item) =>
        item.company.toLowerCase().includes(filterValue.toLowerCase())
      );
    }

    return filteredUsers;
  }, [data, filterValue]);

  const pages = Math.ceil(count / rowsPerPage) || 1;

  const sortedItems = React.useMemo(() => {
    return [...filteredItems].sort((a, b) => {
      const first = a[sortDescriptor.column];
      const second = b[sortDescriptor.column];
      const cmp = first < second ? -1 : first > second ? 1 : 0;

      return sortDescriptor.direction === "descending" ? -cmp : cmp;
    });
  }, [sortDescriptor, filteredItems]);

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
    getValues,
    setValue,
    watch,
  } = useForm({
    resolver: zodResolver(formSchema()),
    defaultValues,
  });

  const state = watch("state");
  const gstNo = watch("gstNo");

  const handleGstChange = (e) => {
    const rawValue = e.target.value;
    const formattedValue = formatGSTInput(rawValue);
    setValue("gstNo", formattedValue);
    const error = validateGST(formattedValue, state);
    setGstError(error);
  };

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

  const handleStateChange = (stateName) => {
    setValue("state", stateName);
    dispatch(getAllCitiesByStateName(stateName));
    const error = validateGST(gstNo, stateName);
    setGstError(error);
  };

  const renderCell = React.useCallback((rowData, columnKey) => {
    const cellValue = rowData[columnKey];
    switch (columnKey) {
      case "date":
        return (
          <p className="text-sm capitalize">
            {dayjs(rowData?.date).format("DD-MM-YYYY")}
          </p>
        );
      case "unbillNo":
        return <p className="text-sm capitalize">{`UN000${rowData?.id}`}</p>;
      case "service":
        return <p className="text-sm capitalize">{rowData?.productName}</p>;
      case "company":
        return <p className="text-sm capitalize">{rowData?.company}</p>;
      case "client":
        return (
          <div className="flex flex-col gap-2">
            <p className="text-sm capitalize">{rowData?.clientName}</p>
          </div>
        );
      case "txnAmount":
        return (
          <p className="text-sm capitalize">
            {inrCurrency(rowData?.txnAmount)}
          </p>
        );
      case "addedBy":
        return <p className="text-sm capitalize">{rowData?.assigneeName}</p>;
      case "actions":
        return (
          <div className="relative flex justify-center items-center gap-2">
            <Dropdown>
              <DropdownTrigger>
                <Button isIconOnly size="sm" variant="light">
                  <EllipsisVertical className="text-default-300" />
                </Button>
              </DropdownTrigger>
              <DropdownMenu>
                <DropdownItem key="view" onPress={invoiceModal.onOpen}>
                  View
                </DropdownItem>
                <DropdownItem key="edit">Edit</DropdownItem>
              </DropdownMenu>
            </Dropdown>
          </div>
        );
      default:
        return cellValue;
    }
  }, []);

  const onNextPage = React.useCallback(() => {
    if (page < pages) {
      setPage(page + 1);
    }
  }, [page, pages]);

  const onPreviousPage = React.useCallback(() => {
    if (page > 1) {
      setPage(page - 1);
    }
  }, [page]);

  const onRowsPerPageChange = React.useCallback((e) => {
    setRowsPerPage(Number(e.target.value));
    setPage(1);
  }, []);

  const onSearchChange = React.useCallback((value) => {
    if (value) {
      setFilterValue(value);
      setPage(1);
    } else {
      setFilterValue("");
    }
  }, []);

  const onClear = React.useCallback(() => {
    setFilterValue("");
    setPage(1);
  }, []);

  const topContent = React.useMemo(() => {
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
            <Button variant="flat" endContent={<Plus />} onPress={onOpen}>
              Add
            </Button>
            <Dropdown>
              <DropdownTrigger>
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
            Total {count} vendor's payments
          </span>
          <div className="flex gap-4">
            <label className="flex items-center text-default-400 text-small">
              Rows per page:
              <select
                className="bg-transparent outline-hidden text-default-400 text-small"
                onChange={onRowsPerPageChange}
                value={rowsPerPage}
              >
                <option value="15">15</option>
                <option value="25">25</option>
                <option value="50">50</option>
              </select>
            </label>
          </div>
        </div>
      </div>
    );
  }, [
    filterValue,
    visibleColumns,
    onRowsPerPageChange,
    count,
    onSearchChange,
    hasSearchFilter,
  ]);

  const bottomContent = React.useMemo(() => {
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
          page={page}
          total={pages}
          onChange={setPage}
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
  }, [selectedKeys, count, page, pages, hasSearchFilter]);

  const onSubmit = (values) => {
    values.createdById = userId;
    dispatch(createVendorsPayment(values))
      .then((resp) => {
        if (resp.meta.requestStatus === "fulfilled") {
          addToast({
            title: "Vandor payment registered successfully !.",
            color: "success",
          });
          onClose();
          reset(defaultValues);
        } else {
          addToast({ title: "Something went wrong !.", color: "danger" });
        }
      })
      .catch(() =>
        addToast({ title: "Something went wrong !.", color: "danger" })
      );
  };

  return (
    <>
      <h1 className="font-sans text-2xl font-medium mb-1">
        Vendor's payment list
      </h1>
      <Table
        isHeaderSticky
        aria-label="Example table with custom cells, pagination and sorting"
        bottomContent={bottomContent}
        bottomContentPlacement="outside"
        classNames={{
          wrapper: "max-h-[55vh] overflow-scroll",
        }}
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
            <TableRow key={`${item.estimateId}unbill`}>
              {(columnKey) => (
                <TableCell>{renderCell(item, columnKey)}</TableCell>
              )}
            </TableRow>
          )}
        </TableBody>
      </Table>
      <Modal
        isOpen={invoiceModal.isOpen}
        onOpenChange={invoiceModal.onOpenChange}
        size="5xl"
        placement="top-center"
        backdrop="blur"
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                Tax invoice
              </ModalHeader>
              <ModalBody>
                <TaxInvoice />
              </ModalBody>
              <ModalFooter>
                <Button color="danger" variant="light" onPress={onClose}>
                  Close
                </Button>
                <Button color="primary" onPress={onClose}>
                  Action
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
      <Modal
        size="5xl"
        isDismissable={false}
        isKeyboardDismissDisabled={true}
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        placement="top-center"
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader>Add payment details</ModalHeader>
              <ModalBody>
                <form
                  onSubmit={handleSubmit(onSubmit)}
                  className="flex flex-col gap-4"
                >
                  <div className="grid grid-cols-2 gap-4 max-h-[60vh] p-2 overflow-auto">
                    <Controller
                      name="estimateNo"
                      control={control}
                      render={({ field, fieldState: { error } }) => (
                        <Input
                          isRequired
                          label="Estimate number"
                          errorMessage={error?.message}
                          isInvalid={!!error}
                          value={field?.value}
                          onChange={(e) => {
                            const temp = e.target.value;
                            field.onChange(temp);
                          }}
                        />
                      )}
                    />

                    <Controller
                      name="serviceName"
                      control={control}
                      render={({ field, fieldState: { error } }) => (
                        <NewSelect
                          isRequired
                          label="Service name"
                          errorMessage={error?.message}
                          isInvalid={!!error}
                          data={urlList || []}
                          labelKey="urlsName"
                          valueKey="urlsName"
                          value={String(field.value)}
                          onChange={(value) => {
                            field.onChange(value);
                          }}
                        />
                      )}
                    />
                    <Controller
                      name="quantity"
                      control={control}
                      render={({ field, fieldState: { error } }) => (
                        <Input
                          isRequired
                          label="Quality"
                          errorMessage={error?.message}
                          isInvalid={!!error}
                          value={field?.value}
                          onChange={(e) => {
                            const temp = e.target.value;
                            field.onChange(temp);
                          }}
                        />
                      )}
                    />
                    <Controller
                      name="vendorCompanyName"
                      control={control}
                      render={({ field, fieldState: { error } }) => (
                        <Input
                          isRequired
                          label="Company name"
                          errorMessage={error?.message}
                          isInvalid={!!error}
                          value={field?.value}
                          onChange={(e) => {
                            const temp = e.target.value;
                            field.onChange(temp);
                          }}
                        />
                      )}
                    />
                    <Controller
                      name="gstType"
                      control={control}
                      render={({ field, fieldState: { error } }) => (
                        <Select
                          isRequired={true}
                          label="GST type"
                          errorMessage={error?.message}
                          isInvalid={!!error}
                          {...field}
                          selectedKeys={[field.value]}
                          onSelectionChange={(e) => {
                            const key = Array.from(e)[0];
                            field.onChange(key);
                          }}
                          items={[
                            { label: "Registered", key: "Registered" },
                            { label: "Unregistered", key: "Unregistered" },
                            { label: "SE2", key: "SE2" },
                            { label: "International", key: "International" },
                          ]}
                        >
                          {(item) => (
                            <SelectItem key={item.key}>{item.label}</SelectItem>
                          )}
                        </Select>
                      )}
                    />
                    <Controller
                      name="gstNo"
                      control={control}
                      render={({ field, fieldState: { error } }) => (
                        <Input
                          isRequired
                          label="GST number"
                          isDisabled
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
                      name="name"
                      control={control}
                      render={({ field, fieldState: { error } }) => (
                        <Input
                          isRequired
                          label="Name"
                          errorMessage={error?.message}
                          isInvalid={!!error}
                          value={field?.value}
                          onChange={(e) => {
                            const temp = e.target.value;
                            field.onChange(temp);
                          }}
                        />
                      )}
                    />
                    <Controller
                      name="emails"
                      control={control}
                      render={({ field, fieldState: { error } }) => (
                        <Input
                          isRequired
                          label="Email"
                          errorMessage={error?.message}
                          isInvalid={!!error}
                          value={field?.value}
                          onChange={(e) => {
                            const temp = e.target.value;
                            field.onChange(temp);
                          }}
                        />
                      )}
                    />
                    <Controller
                      name="contactNo"
                      control={control}
                      render={({ field, fieldState: { error } }) => (
                        <Input
                          isRequired
                          label="Contact number"
                          errorMessage={error?.message}
                          isInvalid={!!error}
                          value={field?.value}
                          onChange={(e) => {
                            const temp = e.target.value;
                            field.onChange(temp);
                          }}
                        />
                      )}
                    />
                    <Controller
                      name="whatsappNo"
                      control={control}
                      render={({ field, fieldState: { error } }) => (
                        <Input
                          isRequired
                          label="Whatsapp number"
                          errorMessage={error?.message}
                          isInvalid={!!error}
                          value={field?.value}
                          onChange={(e) => {
                            const temp = e.target.value;
                            field.onChange(temp);
                          }}
                        />
                      )}
                    />

                    <Controller
                      name="address"
                      control={control}
                      render={({ field, fieldState: { error } }) => (
                        <Input
                          isRequired
                          label="Address"
                          {...field}
                          onChange={(e) => {
                            field.onChange(e);
                          }}
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
                      name="pinCode"
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

                    <Controller
                      name="createDate"
                      control={control}
                      render={({ field, fieldState: { error } }) => (
                        <DatePicker
                          isRequired
                          label="Create date"
                          showMonthAndYearPickers
                          maxValue={today(getLocalTimeZone())}
                          errorMessage={error?.message}
                          isInvalid={!!error}
                          value={field.value ? parseDate(field.value) : null}
                          onChange={(e) =>
                            field.onChange(toCalendarDate(e).toString())
                          }
                        />
                      )}
                    />

                    <Controller
                      name="remarkByVendor"
                      control={control}
                      render={({ field, fieldState: { error } }) => (
                        <Input
                          isRequired
                          label="Remark by vendor"
                          errorMessage={error?.message}
                          isInvalid={!!error}
                          value={field?.value}
                          onChange={(e) => {
                            const temp = e.target.value;
                            field.onChange(temp);
                          }}
                        />
                      )}
                    />
                    <Controller
                      name="remark"
                      control={control}
                      render={({ field, fieldState: { error } }) => (
                        <Input
                          isRequired
                          label="Remark"
                          errorMessage={error?.message}
                          isInvalid={!!error}
                          value={field.value}
                          onChange={(e) => field.onChange(e.target.value)}
                        />
                      )}
                    />
                    <Controller
                      name="fileData"
                      control={control}
                      render={({ field, fieldState: { error } }) => (
                        <FileUploader
                          isRequired
                          uploadingType="multiple"
                          label="Document attachement"
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

                  <ModalFooter className="flex justify-end">
                    <Button onPress={onClose}>Cancel</Button>
                    <Button color="primary" type="submit">
                      Submit
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

export default VendorPayments;
