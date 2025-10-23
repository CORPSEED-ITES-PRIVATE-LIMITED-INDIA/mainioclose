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
  addToast,
  Chip,
} from "@heroui/react";
import {
  ChevronDown,
  EllipsisVertical,
  IndianRupee,
  Percent,
  Plus,
  Search,
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import dayjs from "dayjs";
import {
  getAllVendorsPaymentCountForAccounts,
  getAllVendorsPaymentListForAccounts,
  updateVendorPaymentStatus,
} from "../toolkit/slices/accountSlice";
import TaxInvoice from "../components/TaxInvoice";
import { inrCurrency } from "../common";
import { useParams } from "react-router-dom";
import { getAllUrlList } from "../toolkit/slices/commonSlice";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import * as z from "zod";
import { updateVendorPaymentFromAccounts } from "../toolkit/slices/vendorsSlice";
import NewSelect from "../components/NewSelect";
import FileUploader from "../components/FileUploader";

const formSchema = () =>
  z.object({
    serviceName: z.string().min(1, "Service name cannot be empty"),
    actualAmount: z.number(),
    gst: z.string().min(1, "please enter gst percent"),
    gstAmount: z.number(),
    tdsPercent: z.string().min(1, "please enter gst percent"),
    tdsAmount: z.number(),
    totalAmount: z.number(),
    document: z.string().min(1, "please upload document"),
  });

const defaultValues = {
  serviceName: "",
  actualAmount: 0,
  gst: "",
  gstAmount: 0,
  tdsPercent: "",
  tdsAmount: 0,
  totalAmount: 0,
  document: "",
};

export const columns = [
  { name: "DATE", uid: "date" },
  { name: "ESTIMATE NO.", uid: "estimateNo" },
  { name: "SERVICE", uid: "service" },
  { name: "STATUS", uid: "status" },
  { name: "COMPANY", uid: "company" },
  { name: "AMOUNT", uid: "amount" },
  { name: "ADDED BY", uid: "addedBy" },
  { name: "ACTIONS", uid: "actions" },
];

export function capitalize(s) {
  return s ? s.charAt(0).toUpperCase() + s.slice(1).toLowerCase() : "";
}

const INITIAL_VISIBLE_COLUMNS = [
  "date",
  "estimateNo",
  "service",
  "status",
  "company",
  "amount",
  "addedBy",
  "actions",
];

const VendorPayments = () => {
  const { userId } = useParams();
  const dispatch = useDispatch();
  const { isOpen, onClose, onOpen, onOpenChange } = useDisclosure();
  const invoiceModal = useDisclosure();
  const data = useSelector(
    (state) => state.account.vendorsPaymentListForAccount
  );
  const count = useSelector(
    (state) => state.account.vendorsPaymentCountForAccount
  );
  const urlList = useSelector((state) => state.common.urlList);
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
  const [status, setStatus] = useState("all");
  const [rowItems, setRowItems] = useState(null);

  useEffect(() => {
    dispatch(
      getAllVendorsPaymentListForAccounts({ page, size: rowsPerPage, status })
    );
    dispatch(getAllVendorsPaymentCountForAccounts(status));
  }, [dispatch, page, rowsPerPage, status]);

  useEffect(() => {
    dispatch(getAllUrlList());
  }, []);

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
        Object.values(item)?.some((val) =>
          String(val)?.toLowerCase()?.includes(filterValue?.toLowerCase())
        )
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

  const handleSetRowData = (rowData) => {
    onOpen();
    setRowItems(rowData);
    setValue("serviceName", rowData?.serviceName || "");
  };

  const actualAmount = watch("actualAmount");
  const gst = watch("gst");
  const tdsPercent = watch("tdsPercent");

  useEffect(() => {
    const formValues = getValues();
    let allValues = { ...formValues };

    const handleValuesChange = () => {
      const { actualAmount = 0, gst = 0, tdsPercent = 0 } = allValues;

      const safeNum = (val) => (isNaN(Number(val)) ? 0 : Number(val));

      const actualNumAmount = safeNum(actualAmount);
      const gstPercentNum = safeNum(gst);
      const tdsPercentNum = safeNum(tdsPercent);
      const gstAmount = (actualNumAmount * gstPercentNum) / 100;
      const tdsAmount = (actualNumAmount * tdsPercentNum) / 100;
      const totalAmount = actualNumAmount + gstAmount + tdsAmount;
      setValue("gstAmount", gstAmount);
      setValue("tdsAmount", tdsAmount);
      setValue("totalAmount", totalAmount);
    };

    handleValuesChange();
  }, [actualAmount, gst, tdsPercent, setValue]);

  const handleOnSubmit = (values) => {
    const data = {
      createBy: userId,
      leadId: rowItems?.leadId,
      status: "approved",
      vendorPaymentId: rowItems?.id,
      estimateId: rowItems?.estimateId,
      ...values,
    };
    dispatch(updateVendorPaymentFromAccounts(data))
      .then((resp) => {
        if (resp.meta.requestStatus === "fulfilled") {
          addToast({
            title: `Vandor payment approved successfully !.`,
            color: "success",
          });
          onClose();
          reset(defaultValues);
          setRowItems(null);
          dispatch(
            getAllVendorsPaymentListForAccounts({
              page,
              size: rowsPerPage,
              status,
            })
          );
          dispatch(getAllVendorsPaymentCountForAccounts(status));
        } else {
          addToast({ title: "Something went wrong !.", color: "danger" });
        }
      })
      .catch(() =>
        addToast({ title: "Something went wrong !.", color: "danger" })
      );
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
      case "estimateNo":
        return <p className="text-sm capitalize">{rowData?.estimateNo}</p>;
      case "service":
        return <p className="text-sm capitalize">{rowData?.serviceName}</p>;
      case "company":
        return <p className="text-sm capitalize">{rowData?.company}</p>;
      case "status":
        return (
          <div className="flex flex-col gap-2">
            <Chip
              className="text-sm capitalize"
              size="sm"
              color={
                rowData?.status === "approved"
                  ? "success"
                  : rowData?.status === "disapproved"
                    ? "danger"
                    : "default"
              }
            >
              {rowData?.status}
            </Chip>
          </div>
        );
      case "amount":
        return (
          <div className="flex flex-col">
            <p className="text-sm capitalize">
              Paid : {inrCurrency(rowData?.totalPaidAmount)}
            </p>
            <p className="text-sm capitalize">
              Due : {inrCurrency(rowData?.totalDueAmount)}
            </p>
            <p className="text-sm capitalize">
              Total : {inrCurrency(rowData?.totalAmount)}
            </p>
          </div>
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
                <DropdownItem
                  key="approved"
                  onPress={() => {
                    handleSetRowData(rowData);
                  }}
                >
                  Approved
                </DropdownItem>
                <DropdownItem
                  key="disapproved"
                  onPress={() => handleActionPayments("disapproved", rowData)}
                >
                  Disapproved
                </DropdownItem>
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
    status,
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
        Vendor's payment list
      </h1>
      <Table
        isHeaderSticky
        aria-label="Example table with custom cells, pagination and sorting"
        bottomContent={bottomContent}
        bottomContentPlacement="outside"
        classNames={{
          wrapper: "max-h-[55vh] overflow-scroll w-full",
          table: "w-full",
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
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        size="5xl"
        placement="top-center"
        backdrop="blur"
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                Payment approval details
              </ModalHeader>
              <ModalBody>
                <form
                  onSubmit={handleSubmit(handleOnSubmit)}
                  className="flex flex-col gap-4"
                >
                  <div className="grid grid-cols-2 gap-4 max-h-[60vh] p-2 overflow-auto">
                    <Controller
                      name="serviceName"
                      control={control}
                      render={({ field, fieldState: { error } }) => (
                        <NewSelect
                          isRequired
                          isDisabled
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
                      name="actualAmount"
                      control={control}
                      render={({ field, fieldState: { error } }) => {
                        return (
                          <Input
                            type="number"
                            startContent={<IndianRupee className="h-4 w-4" />}
                            isRequired
                            label="Actual amount"
                            {...field}
                            onChange={(e) => {
                              field.onChange(Number(e.target.value));
                            }}
                          />
                        );
                      }}
                    />

                    <Controller
                      name="gst"
                      control={control}
                      render={({ field, fieldState: { error } }) => (
                        <Input
                          isRequired
                          label="GST %"
                          endContent={<Percent className="h-4 w-4" />}
                          {...field}
                          onChange={(e) => {
                            field.onChange(e);
                          }}
                        />
                      )}
                    />

                    <Controller
                      name="gstAmount"
                      control={control}
                      render={({ field, fieldState: { error } }) => (
                        <Input
                          isRequired
                          isDisabled
                          label="GST amount (₹)"
                          startContent={<IndianRupee className="h-4 w-4" />}
                          value={field.value}
                          onChange={(e) => {
                            field.onChange(Number(e.target.value));
                          }}
                        />
                      )}
                    />

                    <Controller
                      name="tdsPercent"
                      control={control}
                      render={({ field, fieldState: { error } }) => (
                        <Input
                          isRequired
                          label="TDS %"
                          endContent={<Percent className="h-4 w-4" />}
                          {...field}
                          onChange={(e) => {
                            field.onChange(e);
                          }}
                        />
                      )}
                    />

                    <Controller
                      name="tdsAmount"
                      control={control}
                      render={({ field, fieldState: { error } }) => (
                        <Input
                          isRequired
                          isDisabled
                          label="TDS amount (₹)"
                          startContent={<IndianRupee className="h-4 w-4" />}
                          value={field.value}
                          onChange={(e) => {
                            field.onChange(Number(e.target.value));
                          }}
                        />
                      )}
                    />

                    <Controller
                      name="totalAmount"
                      control={control}
                      render={({ field, fieldState: { error } }) => (
                        <Input
                          isRequired
                          label="Total amount"
                          isDisabled
                          startContent={<IndianRupee className="h-4 w-4" />}
                          {...field}
                          onChange={(e) => {
                            field.onChange(e);
                          }}
                        />
                      )}
                    />

                    <Controller
                      name="document"
                      control={control}
                      render={({ field, fieldState: { error } }) => (
                        <FileUploader
                          isRequired
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
