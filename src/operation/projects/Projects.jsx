import React, { useCallback, useEffect, useState } from "react";
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
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerBody,
  DrawerFooter,
  Modal,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  DatePicker,
  Select,
  SelectItem,
  Textarea,
  addToast,
} from "@heroui/react";
import { useDispatch, useSelector } from "react-redux";
import { ChevronDown, Plus, Search } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import {
  createProjectsForOperations,
  getAllOperationsProject,
  getAllProjectsForOperations,
  getTotalCountForOperationProjects,
  searchByCompany,
  searchByContactName,
  searchByProjectName,
  searchByProjectNumber,
} from "../../toolkit/slices/operationSlice";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import NewSelect from "../../components/NewSelect";
import {
  getAllCitiesByStateName,
  getAllCountries,
  getAllStatesByCountryName,
  getAllUsers,
} from "../../toolkit/slices/commonSlice";
import {
  getLocalTimeZone,
  parseDate,
  toCalendarDate,
  today,
} from "@internationalized/date";
import { inrCurrency } from "../../common";

export const columns = [
  { name: "ID", uid: "id", sortable: true },
  { name: "NAME", uid: "name" },
  { name: "PROJECT NO.", uid: "projectNo" },
  { name: "UNBILL NO.", uid: "unbilledNumber" },
  { name: "ESTIMATE NO.", uid: "estimateNumber" },
  { name: "DATE", uid: "date" },
  { name: "AMOUNT", uid: "amount" },
  { name: "ADDRESS", uid: "address" },
];

export function capitalize(s) {
  return s ? s.charAt(0).toUpperCase() + s.slice(1).toLowerCase() : "";
}

const INITIAL_VISIBLE_COLUMNS = [
  "id",
  "name",
  "projectNo",
  "unbilledNumber",
  "estimateNumber",
  "salesPersonName",
  "contactName",
  "date",
  "amount",
  "address",
];

const formSchema = z.object({
  name: z.string().min(1, "Please enter project name"),
  projectNo: z.string().min(1, "Please enter project number"),
  salesPersonId: z.string().optional(),
  productId: z.string().optional(),
  companyId: z.string().optional(),
  unbilledNumber: z.string().min(1, "Please enter unbill number"),
  estimateNumber: z.string().min(1, "Please enter estimate number"),
  contactId: z.string().min(1, "Please enter contact id"),
  leadId: z.string().min(1, "Please enter lead id"),
  date: z.string().min(1, "Please enter date"),
  address: z.string().min(1, "Please enter address"),
  country: z.string().optional().or(z.literal("")),
  state: z.string().optional().or(z.literal("")),
  city: z.string().optional().or(z.literal("")),
  primaryPinCode: z.string().optional().or(z.literal("")),
  totalAmount: z.string().optional().or(z.literal("")),
  paidAmount: z.string().optional().or(z.literal("")),
  paymentTypeId: z.string().min(1, "Please select the payment type"),
});

const defaultValues = {
  name: "",
  projectNo: "",
  salesPersonId: "",
  productId: "",
  companyId: "",
  unbilledNumber: "",
  estimateNumber: "",
  contactId: "",
  leadId: "",
  date: "",
  address: "",
  country: "",
  state: "",
  city: "",
  primaryPinCode: "",
  totalAmount: "",
  paidAmount: "",
  paymentTypeId: "",
};

const Projects = () => {
  const dispatch = useDispatch();
  const { userId } = useParams();
  const formModal = useDisclosure();
  const data = useSelector((state) => state.operation.projectListForOperation);
  const count = useSelector((state) => state.operation.projectCount) || "";
  const usersList = useSelector((state) => state?.common?.usersList);
  const countryList = useSelector((state) => state.common.countriesList);
  const statesList = useSelector((state) => state.common.statesList);
  const citiesList = useSelector((state) => state.common.citiesList);
  const [filterValue, setFilterValue] = React.useState("");
  const [selectedKeys, setSelectedKeys] = React.useState(new Set([]));
  const [searchBy, setSearchBy] = useState("projectName");
  const [visibleColumns, setVisibleColumns] = React.useState(
    new Set(INITIAL_VISIBLE_COLUMNS)
  );
  const [sortDescriptor, setSortDescriptor] = React.useState({
    column: "id",
    direction: "ascending",
  });

  const [paginationData, setPaginationData] = useState({
    userId,
    page: 1,
    size: 50,
  });

  const hasSearchFilter = Boolean(filterValue);

  useEffect(() => {
    dispatch(getAllProjectsForOperations(paginationData));
    dispatch(getTotalCountForOperationProjects(userId));
    dispatch(getAllUsers());
    dispatch(getAllCountries());
  }, [dispatch, userId]);

  const headerColumns = React.useMemo(() => {
    if (visibleColumns === "all") return columns;
    return columns.filter((column) =>
      Array.from(visibleColumns).includes(column.uid)
    );
  }, [visibleColumns]);

  const filteredItems = React.useMemo(() => {
    let filteredUsers = [...(data || [])];
    // if (hasSearchFilter) {
    //   filteredUsers = filteredUsers.filter((item) =>
    //     Object.values(item)?.some((val) =>
    //       String(val)?.toLowerCase()?.includes(filterValue?.toLowerCase())
    //     )
    //   );
    // }
    return filteredUsers;
  }, [data, filterValue]);

  const pages = Math.ceil(count / paginationData?.size) || 1;

  const sortedItems = React.useMemo(() => {
    return [...filteredItems].sort((a, b) => {
      const first = a[sortDescriptor?.column];
      const second = b[sortDescriptor?.column];
      const cmp = first < second ? -1 : first > second ? 1 : 0;

      return sortDescriptor.direction === "descending" ? -cmp : cmp;
    });
  }, [sortDescriptor, filteredItems]);

  const handleEnterPress = useCallback(() => {
    if (searchBy === "projectName") {
      dispatch(searchByProjectName({ projectName: filterValue, userId }));
    }
    if (searchBy === "projectNumber") {
      dispatch(searchByProjectNumber({ projectNumber: filterValue, userId }));
    }
    if (searchBy === "company") {
      dispatch(searchByCompany({ companyName: filterValue, userId }));
    }
    if (searchBy === "contactName") {
      dispatch(searchByContactName({ contactName: filterValue, userId }));
    }
  }, [searchBy, filterValue]);

  const renderCell = React.useCallback((rowData, columnKey) => {
    const cellValue = rowData[columnKey];
    switch (columnKey) {
      case "name":
        return (
          <Link className="font-medium" to={`${rowData?.id}/projectDetail`}>
            {rowData?.name}
          </Link>
        );
      case "projectNo":
        return <p className="text-sm">{rowData?.projectNo}</p>;
      case "unbilledNumber":
        return <p className="text-sm">{rowData?.unbilledNumber}</p>;
      case "estimateNumber":
        return <p className="text-sm">{rowData?.estimateNumber}</p>;
      case "date":
        return <p>{rowData?.date}</p>;
      case "amount":
        return (
          <div className="flex flex-col gap-0.5">
            <p className="text-sm">
              Total : {inrCurrency(rowData?.totalAmount)}
            </p>
            <p className="text-sm">Due : {inrCurrency(rowData?.dueAmount)}</p>
          </div>
        );
      case "address":
        return (
          <div className="flex flex-col">
            <span className="font-normal">{rowData.address || "-"}</span>
            <span className="text-sm text-gray-400">
              {[rowData?.city, rowData?.state, rowData?.country].join(",")}
            </span>
          </div>
        );

      default:
        return cellValue;
    }
  }, []);

  const onNextPage = React.useCallback(() => {
    if (paginationData?.page < pages) {
      setPaginationData((prev) => ({
        ...prev,
        page: paginationData?.page + 1,
      }));
    }
  }, [paginationData?.page, pages]);

  const onPreviousPage = React.useCallback(() => {
    if (paginationData?.page > 1) {
      setPaginationData((prev) => ({
        ...prev,
        page: paginationData?.page - 1,
      }));
    }
  }, [paginationData?.page]);

  const onRowsPerPageChange = React.useCallback((e) => {
    setPaginationData((prev) => ({
      ...prev,
      size: Number(e.target.value),
      page: 1,
    }));
  }, []);

  const onSearchChange = React.useCallback((value) => {
    if (value) {
      setFilterValue(value);
      setPaginationData((prev) => ({
        ...prev,
        page: 1,
      }));
    } else {
      setFilterValue("");
      dispatch(getAllProjectsForOperations(paginationData));
    }
  }, []);

  const onClear = React.useCallback(() => {
    setFilterValue("");
    setPaginationData((prev) => ({
      ...prev,
      page: 1,
    }));
    dispatch(getAllProjectsForOperations(paginationData));
  }, []);

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: zodResolver(formSchema),
    defaultValues,
  });

  const handleFinish = (values) => {
    values.approvedById = userId;
    values.createdBy = userId;
    values.updatedBy = userId;
    dispatch(createProjectsForOperations(values))
      .then((resp) => {
        if (resp.meta.requestStatus === "fulfilled") {
          addToast({
            title: "Project created successfully !.",
            color: "success",
          });
           dispatch(getAllProjectsForOperations(paginationData));
          formModal.onClose();
        } else {
          addToast({ title: "Something went wrong !.", color: "danger" });
        }
      })
      .catch(() =>
        addToast({ title: "Something went wrong !.", color: "danger" })
      );
  };

  const topContent = React.useMemo(() => {
    return (
      <div className="flex flex-col gap-4">
        <div className="flex justify-between gap-3 items-end">
          <div className="flex gap-0 items-center w-[35vw]">
            <Select
              className="max-w-[30%]"
              selectionMode="single"
              selectedKeys={[searchBy]}
              onSelectionChange={(e) => {
                let key = Array.from(e)[0];
                setSearchBy(key);
              }}
            >
              <SelectItem key={"projectName"}>Project name</SelectItem>
              <SelectItem key={"projectNumber"}>Project number</SelectItem>
              <SelectItem key={"company"}>Company</SelectItem>
              <SelectItem key={"contactName"}>Contact name</SelectItem>
            </Select>
            <Input
              isClearable
              className="w-full sm:max-w-[70%]"
              placeholder="Search ..."
              startContent={<Search />}
              value={filterValue}
              onClear={() => onClear()}
              onValueChange={onSearchChange}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleEnterPress(); // your function
                }
              }}
            />
          </div>

          <div className="flex gap-3">
            <Button
              endContent={<Plus />}
              onPress={formModal.onOpen}
              color="primary"
            >
              Add
            </Button>
            <Dropdown>
              <DropdownTrigger className="hidden sm:flex">
                <Button
                  endContent={<ChevronDown className="text-small" />}
                  variant="flat"
                >
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
              value={paginationData?.size}
              onChange={onRowsPerPageChange}
            >
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
    paginationData,
    visibleColumns,
    onRowsPerPageChange,
    count,
    onSearchChange,
    hasSearchFilter,
    searchBy,
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
          page={paginationData?.page}
          total={pages}
          onChange={(e) => setPaginationData((prev) => ({ ...prev, page: e }))}
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
  }, [selectedKeys, count, paginationData?.page, pages, hasSearchFilter]);

  return (
    <>
      <h1 className="font-sans text-2xl font-medium mb-1">Projects</h1>
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
            <TableRow key={item?.id}>
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
        isOpen={formModal.isOpen}
        onOpenChange={formModal.onOpenChange}
        placement="top-center"
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                Create project
              </ModalHeader>
              <ModalBody>
                <form
                  className="w-full flex flex-col gap-4 "
                  onSubmit={handleSubmit(handleFinish)}
                >
                  <div className="w-full grid grid-cols-2 gap-4 max-h-[60vh] overflow-auto px-2 py-1">
                    <Controller
                      name="name"
                      control={control}
                      render={({ field }) => (
                        <Input
                          isRequired
                          label="Project name"
                          type="text"
                          {...field}
                        />
                      )}
                    />

                    <Controller
                      name="projectNo"
                      control={control}
                      render={({ field }) => (
                        <Input
                          isRequired
                          label="Project number"
                          type="text"
                          {...field}
                        />
                      )}
                    />

                    <Controller
                      name="salesPersonId"
                      control={control}
                      render={({ field }) => (
                        <NewSelect
                          isRequired={true}
                          data={usersList || []}
                          label="Select sales person"
                          name="salesPersonId"
                          labelKey="fullName"
                          valueKey="id"
                          value={field.value}
                          onChange={(selectedValue) => {
                            field.onChange(selectedValue);
                          }}
                        />
                      )}
                    />

                    <Controller
                      name="productId"
                      control={control}
                      render={({ field }) => (
                        <Input label="Product id" {...field} />
                      )}
                    />

                    <Controller
                      name="companyId"
                      control={control}
                      render={({ field }) => (
                        <Input label="Company id" {...field} />
                      )}
                    />

                    <Controller
                      name="unbilledNumber"
                      control={control}
                      render={({ field }) => (
                        <Input label="Unbill number" {...field} />
                      )}
                    />

                    <Controller
                      name="estimateNumber"
                      control={control}
                      render={({ field }) => (
                        <Input label="Estimate number" type="text" {...field} />
                      )}
                    />

                    <Controller
                      name="contactId"
                      control={control}
                      render={({ field }) => (
                        <Input label="Contact id" type="text" {...field} />
                      )}
                    />

                    <Controller
                      name="leadId"
                      control={control}
                      render={({ field }) => (
                        <Input
                          isRequired
                          label="Lead id"
                          type="text"
                          {...field}
                        />
                      )}
                    />

                    <Controller
                      name="date"
                      control={control}
                      render={({ field, fieldState: { error } }) => (
                        <DatePicker
                          isRequired
                          label="Date"
                          showMonthAndYearPickers
                          maxValue={today(getLocalTimeZone())}
                          value={field.value ? parseDate(field.value) : null}
                          onChange={(e) =>
                            field.onChange(toCalendarDate(e).toString())
                          }
                        />
                      )}
                    />

                    <Controller
                      name="address"
                      control={control}
                      render={({ field }) => (
                        <Textarea isRequired label="Address" {...field} />
                      )}
                    />

                    <Controller
                      name="country"
                      control={control}
                      render={({ field }) => (
                        <NewSelect
                          data={countryList}
                          label="Country"
                          labelKey="name"
                          valueKey="name"
                          {...field}
                          onChange={(value) => {
                            field.onChange(value);
                            dispatch(getAllStatesByCountryName(value));
                          }}
                        />
                      )}
                    />

                    <Controller
                      name="state"
                      control={control}
                      render={({ field }) => (
                        <NewSelect
                          data={statesList}
                          label="State"
                          labelKey="name"
                          valueKey="name"
                          {...field}
                          onChange={(value) => {
                            field.onChange(value);
                            dispatch(getAllCitiesByStateName(value));
                          }}
                        />
                      )}
                    />

                    <Controller
                      name="city"
                      control={control}
                      render={({ field }) => (
                        <NewSelect
                          data={citiesList}
                          label="City"
                          labelKey="name"
                          valueKey="name"
                          {...field}
                        />
                      )}
                    />

                    <Controller
                      name="primaryPinCode"
                      control={control}
                      render={({ field }) => (
                        <Input label="Pin code" type="text" {...field} />
                      )}
                    />

                    <Controller
                      name="totalAmount"
                      control={control}
                      render={({ field }) => (
                        <Input
                          isRequired
                          label="Total amount"
                          type="text"
                          {...field}
                        />
                      )}
                    />

                    <Controller
                      name="paidAmount"
                      control={control}
                      render={({ field }) => (
                        <Input
                          isRequired
                          label="Paid amount"
                          type="text"
                          {...field}
                        />
                      )}
                    />

                    <Controller
                      name="paymentTypeId"
                      control={control}
                      render={({ field }) => (
                        <Select isRequired label="Payment type" {...field}>
                          {[
                            { label: "FULL", id: 1 },
                            { label: "PARTIAL", id: 2 },
                            { label: "INSTALLMENT", id: 3 },
                            { label: "PURCHASE_ORDER", id: 4 },
                          ].map((item) => (
                            <SelectItem key={item?.id} value={item?.id}>
                              {item?.label}
                            </SelectItem>
                          ))}
                        </Select>
                      )}
                    />
                  </div>
                  <ModalFooter className="w-full flex justify-end">
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

export default Projects;
