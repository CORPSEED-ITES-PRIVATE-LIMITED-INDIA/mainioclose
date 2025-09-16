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
  addToast,
  useDisclosure,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  DatePicker,
} from "@heroui/react";
import { ChevronDown, EllipsisVertical, Plus, Search } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import {
  addBankDetails,
  getAllBankStatements,
  getAllPaymentRegisterCount,
  getAllPaymentRegisterWithPagination,
} from "../../toolkit/slices/organizationSlice";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import dayjs from "dayjs";
import * as z from "zod";
import {
  getLocalTimeZone,
  parseDate,
  toCalendarDate,
  today,
} from "@internationalized/date";

export const columns = [
  { name: "ID", uid: "id" },
  { name: "IDENTITY", uid: "identity" },
  { name: "SERVICE", uid: "serviceName" },
  { name: "COMPANY NAME", uid: "companyName" },
  { name: "BILLING QUANTITY", uid: "billingQuantity" },
  { name: "TOTAL AMOUNT", uid: "totalAmount" },
  { name: "PROF.FEE", uid: "professionalFees" },
  { name: "GOVT.FEE", uid: "govermentfees" },
  { name: "SER.FEE", uid: "serviceCharge" },
  { name: "OTH.FEE", uid: "otherFees" },
  { name: "PAYMENT DATE", uid: "paymentDate" },
  { name: "REMARK", uid: "remark" },
  { name: "ACTIONS", uid: "actions" },
];

export function capitalize(s) {
  return s ? s.charAt(0).toUpperCase() + s.slice(1).toLowerCase() : "";
}

const INITIAL_VISIBLE_COLUMNS = [
  "identity",
  "serviceName",
  "companyName",
  "billingQuantity",
  "totalAmount",
  "professionalFees",
  "govermentfees",
  "serviceCharge",
  "otherFees",
  "paymentDate",
  "actions",
];

const formSchema = z.object({
  transactionId: z.string().min(1, "Please give a transaction id"),
  name: z.string().min(1, "Please give a transaction name"),
  totalAmount: z.string().min(1, "Please enter total amount"),
  leftAmount: z.string().min(1, "Please enter left amount"),
  paymentDate: z.string().min(1, "Please select payment date"),
});

const defaultValues = {
  transactionId: "",
  name: "",
  totalAmount: "",
  leftAmount: "",
  paymentDate: "",
};

const PaymentRegister = () => {
  const dispatch = useDispatch();
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const data = useSelector(
    (state) => state.organization.allPaymentRegisterList
  );
  const count = useSelector((state) => state.organization.paymentRegistercont);
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
  const [status, setStatus] = useState("all");
  const [page, setPage] = React.useState(1);
  const hasSearchFilter = Boolean(filterValue);

  useEffect(() => {
    dispatch(
      getAllPaymentRegisterWithPagination({
        page: page,
        size: rowsPerPage,
        status: status,
      })
    );
    dispatch(getAllPaymentRegisterCount(status));
  }, [dispatch, status, page, rowsPerPage]);

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
        item.serviceName.toLowerCase().includes(filterValue.toLowerCase())
      );
    }

    return filteredUsers;
  }, [data, filterValue]);

  const pages = Math.ceil(count / rowsPerPage) || 1;

  const items = React.useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    const end = start + rowsPerPage;

    return filteredItems.slice(start, end);
  }, [page, filteredItems, rowsPerPage]);

  const sortedItems = React.useMemo(() => {
    return [...items].sort((a, b) => {
      const first = a[sortDescriptor.column];
      const second = b[sortDescriptor.column];
      const cmp = first < second ? -1 : first > second ? 1 : 0;

      return sortDescriptor.direction === "descending" ? -cmp : cmp;
    });
  }, [sortDescriptor, items]);

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: zodResolver(formSchema),
    defaultValues,
  });

  const onSubmit = useCallback(
    (values) => {
      dispatch(addBankDetails(values))
        .then((resp) => {
          if (resp.meta.requestStatus === "fulfilled") {
            addToast({
              title: "Voucher created successfully !.",
              color: "success",
            });
            dispatch(getAllBankStatements());
            onOpenChange(false);
          } else {
            addToast({ title: "Something went wrong !.", color: "danger" });
          }
        })
        .catch(() =>
          addToast({ title: "Something went wrong !.", color: "danger" })
        );
    },
    [dispatch]
  );

  const renderCell = React.useCallback((rowData, columnKey) => {
    const cellValue = rowData[columnKey];
    switch (columnKey) {
      case "identity":
        return (
          <div className="flex flex-col gap-1">
            <span className="text-sm">Estimate id : {rowData?.estimateId}</span>
            <span className="text-sm">
              Estimate no. : {rowData?.estimateNo}
            </span>
            <span className="text-sm">
              Transation id : {rowData?.transactionId}
            </span>
          </div>
        );
      case "serviceName":
        return (
          <p className="text-sm font-medium capitalize">
            {rowData?.serviceName}
          </p>
        );
      case "companyName":
        return (
          <p className="text-sm font-medium capitalize">
            {rowData?.companyName}
          </p>
        );
      case "billingQuantity":
        return (
          <p className="text-sm font-medium capitalize">
            {rowData?.billingQuantity}
          </p>
        );

      case "totalAmount":
        return (
          <div className="flex flex-col gap-2">
            <span className="text-sm"> ₹ {rowData?.totalAmount}</span>
          </div>
        );
      case "professionalFees":
        return (
          <div className="flex flex-col">
            <span className="">₹{rowData?.professionalFees || "-"}</span>
            <span className="text-tiny text-gray-400">
              GST : {rowData?.profesionalGst || "-"}%
            </span>
          </div>
        );
      case "govermentfees":
        return (
          <div className="flex flex-col">
            <span className="">₹{rowData?.govermentfees || "-"}</span>
            <span className="text-tiny text-gray-400">
              GST : {rowData?.govermentGst || "-"}%
            </span>
          </div>
        );
      case "serviceCharge":
        return (
          <div className="flex flex-col">
            <span className="">₹{rowData?.serviceCharge || "-"}</span>
            <span className="text-tiny text-gray-400">
              GST : {rowData?.serviceGst || "-"}%
            </span>
          </div>
        );
      case "otherFees":
        return (
          <div className="flex flex-col">
            <span className="">₹ {rowData?.otherFees || "-"}</span>
            <span className="text-tiny text-gray-400">
              GST : {rowData?.otherGst || "-"}%
            </span>
          </div>
        );
      case "paymentDate":
        return (
          <p className="text-sm capitalize">
            {dayjs(rowData?.paymentDate).format("YYYY-MM-DD")}
          </p>
        );

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
                {/* <DropdownItem key="viewEstimate">View estimate</DropdownItem>
                <DropdownItem key="edit">Edit</DropdownItem> */}
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
                <Button
                  endContent={<ChevronDown />}
                  variant="flat"
                  className="capitalize"
                >
                  {status}
                </Button>
              </DropdownTrigger>
              <DropdownMenu
                disallowEmptySelection
                aria-label="Table Columns"
                selectionMode="single"
                selectedKeys={[status]}
                onSelectionChange={(selectedKeys) => {
                  const selected = Array.from(selectedKeys)[0];
                  setStatus(selected);
                }}
              >
                {[
                  { label: "All", uid: "all" },
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
            Total {count} payment register
          </span>
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

  return (
    <>
      <h1 className="font-sans text-2xl font-medium mb-1">
        Payment register list
      </h1>
      <Table
        isHeaderSticky
        aria-label="Example table with custom cells, pagination and sorting"
        bottomContent={bottomContent}
        bottomContentPlacement="outside"
        classNames={{
          wrapper: "max-h-[55vh]",
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
            <TableRow key={item.id}>
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
              <ModalHeader>Add bank statement</ModalHeader>
              <ModalBody>
                <form onSubmit={handleSubmit(onSubmit)}>
                  <div className="grid grid-cols-2 gap-4 max-h-[60vh] overflow-auto">
                    <Controller
                      name="transactionId"
                      control={control}
                      render={({ field }) => (
                        <Input
                          isRequired
                          label="Transaction id"
                          name="transactionId"
                          value={field.value}
                          onChange={(e) => {
                            field.onChange(e.target.value);
                          }}
                        />
                      )}
                    />
                    <Controller
                      name="name"
                      control={control}
                      render={({ field }) => (
                        <Input
                          isRequired
                          label="Transaction name"
                          name="name"
                          value={field.value}
                          onChange={(e) => {
                            field.onChange(e.target.value);
                          }}
                        />
                      )}
                    />
                    <Controller
                      name="totalAmount"
                      control={control}
                      render={({ field }) => (
                        <Input
                          isRequired
                          label="Total amount"
                          name="totalAmount"
                          value={field.value}
                          onChange={(e) => {
                            field.onChange(e.target.value);
                          }}
                        />
                      )}
                    />
                    <Controller
                      name="leftAmount"
                      control={control}
                      render={({ field }) => (
                        <Input
                          isRequired
                          label="Remaining amount"
                          value={field.value}
                          name="leftAmount"
                          onChange={(e) => {
                            field.onChange(e.target.value);
                          }}
                        />
                      )}
                    />
                    <Controller
                      name="paymentDate"
                      control={control}
                      render={({ field, fieldState: { error } }) => (
                        <DatePicker
                          isRequired
                          label="Payment date"
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

export default PaymentRegister;
