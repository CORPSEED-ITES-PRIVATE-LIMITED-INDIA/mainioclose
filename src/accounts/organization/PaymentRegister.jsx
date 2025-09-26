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
  Tooltip,
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerBody,
  DrawerFooter,
  Textarea,
} from "@heroui/react";
import {
  Building2,
  ChevronDown,
  EllipsisVertical,
  FileText,
  Mail,
  MapPin,
  Phone,
  Search,
  TrendingUp,
  View,
} from "lucide-react";
import gstIcon from "../../assets/save.png";
import panIcon from "../../assets/pan-card.png";
import { useDispatch, useSelector } from "react-redux";
import {
  addBankDetails,
  getAllBankStatements,
  getAllPaymentRegisterCount,
  getAllPaymentRegisterWithPagination,
  paymentRegisterAction,
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
import { inrCurrency } from "../../common";
import { GstIcon, PanCardIcon } from "../../components/icons";
import { getEstimateByLeadId } from "../../toolkit/slices/leadSlice";
import EstimateView from "../../components/EstimateView";

export const columns = [
  { name: "ID", uid: "id" },
  { name: "DATE", uid: "date" },
  { name: "ESTIMATE", uid: "estimateNo" },
  { name: "CLIENT", uid: "client" },
  { name: "COMPANY NAME", uid: "companyName" },
  { name: "ORDERS AMOUNTS", uid: "orderAmounts" },
  { name: "PAYMENT AMOUNTS", uid: "paymentAmounts" },
  { name: "WORK %", uid: "workPercent" },
  { name: "STATUS", uid: "status" },
  { name: "PAYMENT DATE", uid: "paymentDate" },
  { name: "ACTIONS", uid: "actions" },
];

export function capitalize(s) {
  return s ? s.charAt(0).toUpperCase() + s.slice(1).toLowerCase() : "";
}

const INITIAL_VISIBLE_COLUMNS = [
  "date",
  "estimateNo",
  "client",
  "companyName",
  "orderAmounts",
  "paymentAmounts",
  "workPercent",
  "status",
  "workPercent",
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
  const drawer = useDisclosure();
  const estimateModal = useDisclosure();
  const paymentModal = useDisclosure();
  const paymentAction = useDisclosure();
  const data = useSelector(
    (state) => state.organization.allPaymentRegisterList
  );
  const count = useSelector((state) => state.organization.paymentRegistercont);
  const details = useSelector((state) => state.leads.estimateDetail);
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
  const [rowItem, setRowItem] = useState(null);
  const [paymentActionData, setPaymentActionData] = useState({
    paymentRegisterId: 0,
    estimateId: 0,
    comment: "",
    status: "",
  });
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
        Object.values(item)?.some((val) =>
          String(val)?.toLowerCase()?.includes(filterValue?.toLowerCase())
        )
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

  const handleViewEstimate = (rowData) => {
    setRowItem(rowData);
    dispatch(getEstimateByLeadId(rowData?.leadId));
    estimateModal.onOpen();
  };

  const handlePaymentAction = (rowData) => {
    setRowItem(rowData);
    paymentModal.onOpen();
    setPaymentActionData((prev) => ({
      ...prev,
      paymentRegisterId: rowData?.id,
      estimateId: rowData?.estimateId,
    }));
  };

  const handleSubmitPaymentAction = () => {
    dispatch(paymentRegisterAction(paymentActionData))
      .then((resp) => {
        if (resp.meta.requestStatus === "fulfilled") {
          addToast({
            title: "Payment register updated successfully !.",
            color: "success",
          });
          setPaymentActionData({
            paymentRegisterId: 0,
            estimateId: 0,
            comment: "",
            status: "",
          });
          dispatch(
            getAllPaymentRegisterWithPagination({
              page: page,
              size: rowsPerPage,
              status: status,
            })
          );
          setRowItem(null);
          paymentAction.onClose();
          paymentModal.onClose();
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
          <div className="flex flex-col gap-1">
            <span className="text-sm">
              {" "}
              {rowData?.estimateCreateDate
                ? dayjs(rowData?.estimateCreateDate).format("DD-MM-YYYY")
                : "DD-MM-YYYY"}{" "}
            </span>
          </div>
        );
      case "estimateNo":
        return (
          <div className="flex flex-col gap-1">
            <span
              className="text-sm text-primary-400 cursor-pointer"
              onClick={() => handleViewEstimate(rowData)}
            >
              {" "}
              {rowData?.estimateNo}
            </span>
          </div>
        );
      case "client":
        return (
          <Tooltip
            content={
              <div className="flex flex-col gap-2">
                <div className="flex gap-2 items-center">
                  <Mail className="w-4 h-4" />
                  <span>rahul@121.com</span>
                </div>
                <div className="flex gap-2 items-center">
                  <Phone className="w-4 h-4" />
                  <span>7586421538</span>
                </div>
              </div>
            }
          >
            <p className="text-sm font-medium capitalize">
              {rowData?.client || "Rahul"}
            </p>
          </Tooltip>
        );
      case "companyName":
        return (
          <p
            className="text-sm font-medium capitalize cursor-pointer"
            onClick={drawer.onOpen}
          >
            {rowData?.companyName}
          </p>
        );
      case "orderAmounts":
        return (
          <div className="flex flex-col">
            <p className="text-sm font-medium capitalize">
              Txn. : {inrCurrency(rowData?.txnAmount || 0)}
            </p>
            <p className="text-sm font-medium capitalize">
              Order : {inrCurrency(rowData?.orderAmount || 0)}
            </p>
          </div>
        );
      case "paymentAmounts":
        return (
          <div className="flex flex-col">
            <p className="text-sm font-medium capitalize">
              Due : {inrCurrency(rowData?.dueAmount || 0)}
            </p>
            <p className="text-sm font-medium capitalize">
              Paid : {inrCurrency(rowData?.paidAmount || 0)}
            </p>
          </div>
        );
      case "paymentDate":
        return (
          <p className="text-sm capitalize">
            {dayjs(rowData?.paymentDate).format("YYYY-MM-DD")}
          </p>
        );
      case "status":
        return <p className="text-sm capitalize">{rowData?.status}</p>;
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
                <DropdownItem
                  key="paymentAction"
                  onPress={() => handlePaymentAction(rowData)}
                >
                  Payment action
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
            placeholder="Search..."
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
                  { label: "Hold", uid: "hold" },
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
      <Drawer isOpen={drawer.isOpen} onOpenChange={drawer.onOpenChange}>
        <DrawerContent>
          {(onClose) => (
            <>
              <DrawerHeader className="flex flex-col gap-1">
                Company details
              </DrawerHeader>
              <DrawerBody>
                <div className="flex items-center gap-2">
                  <Building2 />
                  <p className="text-lg font-medium">Google private limited.</p>
                </div>
                <div className="flex items-center gap-2">
                  <TrendingUp />
                  <p className="text-md text-default-500">5 years.</p>
                </div>
                <div className="flex items-start gap-2">
                  <MapPin />
                  <p className="text-medium">
                    2nd floor,Noida extension,Greater noida ,Noida ,Uttar
                    Pradesh,India
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <img src={panIcon} height={30} width={40} />
                  <p className="text-medium">KUJYK9063F</p>
                </div>
                <div className="flex items-center gap-2">
                  <img src={gstIcon} height={30} width={40} />
                  <p className="text-medium">09AAHCC4539J1ZC</p>
                </div>
              </DrawerBody>
              <DrawerFooter>
                <Button color="danger" variant="light" onPress={onClose}>
                  Close
                </Button>
                <Button color="primary" onPress={onClose}>
                  Action
                </Button>
              </DrawerFooter>
            </>
          )}
        </DrawerContent>
      </Drawer>

      <Modal
        isOpen={estimateModal.isOpen}
        onOpenChange={estimateModal.onOpenChange}
        size="5xl"
        placement="top-center"
        backdrop="blur"
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                Estimate view
              </ModalHeader>
              <ModalBody>
                <EstimateView details={details} />
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
        isOpen={paymentModal.isOpen}
        onOpenChange={paymentModal.onOpenChange}
        size="4xl"
        placement="top-center"
        backdrop="blur"
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                Mark payment as paid
              </ModalHeader>
              <ModalBody>
                <div class="grid grid-cols-[repeat(4,_auto)_1fr] gap-0 max-w-full overflow-x-auto border border-gray-300 rounded-2xl">
                  <div class="border-b border-r p-4">Column 1</div>
                  <div class="border-b border-r p-4">Column 2</div>
                  <div class="border-b border-r p-4">Column 3</div>
                  <div class="border-b border-r p-4">Column 4</div>
                  <div class="border-b p-4 flex gap-1">
                    <Tooltip content="Attached document view">
                      <Button color="primary" variant="light" isIconOnly>
                        <FileText />
                      </Button>
                    </Tooltip>
                    <Tooltip content="Estimate view">
                      <Button
                        color="primary"
                        variant="light"
                        isIconOnly
                        onPress={() => handleViewEstimate(rowItem)}
                      >
                        <View />
                      </Button>
                    </Tooltip>
                    <Button
                      color="success"
                      onPress={() => {
                        setPaymentActionData((prev) => ({
                          ...prev,
                          status: "approved",
                        }));
                        paymentAction.onOpen();
                      }}
                    >
                      Approve
                    </Button>
                    <Button
                      color="warning"
                      onPress={() => {
                        setPaymentActionData((prev) => ({
                          ...prev,
                          status: "hold",
                        }));
                        paymentAction.onOpen();
                      }}
                    >
                      Hold
                    </Button>
                    <Button
                      color="danger"
                      onPress={() => {
                        setPaymentActionData((prev) => ({
                          ...prev,
                          status: "disapproved",
                        }));
                        paymentAction.onOpen();
                      }}
                    >
                      Disapprove
                    </Button>
                  </div>
                </div>
                <Textarea className="max-w-xs" label="Description" />
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
        isOpen={paymentAction.isOpen}
        onOpenChange={paymentAction.onOpenChange}
        size="2xl"
        placement="top-center"
        backdrop="blur"
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                Payment action
              </ModalHeader>
              <ModalBody>
                <Textarea
                  className="max-w-xs"
                  label="Remark"
                  onChange={(e) => {
                    setPaymentActionData((prev) => ({
                      ...prev,
                      comment: e.target.value,
                    }));
                  }}
                />
              </ModalBody>
              <ModalFooter>
                <Button color="danger" variant="light" onPress={onClose}>
                  Close
                </Button>
                <Button color="primary" onPress={handleSubmitPaymentAction}>
                  Submit
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
};

export default PaymentRegister;
