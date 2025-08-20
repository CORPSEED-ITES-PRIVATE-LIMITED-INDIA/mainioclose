import React, { useCallback, useEffect, useMemo, useState } from "react";
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
  ModalContent,
  ModalHeader,
  ModalBody,
  addToast,
  ModalFooter,
  Select,
  SelectItem,
} from "@heroui/react";
import {
  ChevronDown,
  EllipsisVertical,
  IndianRupee,
  Plus,
  Search,
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import {
  createVoucher,
  getAllLedger,
  getAllLedgerType,
  getAllVoucher,
  getAllVoucherType,
  getLedgerById,
  getLedgerTypeById,
} from "../../toolkit/slices/organizationSlice";
import NewSelect from "../../components/NewSelect";

export const columns = [
  { name: "ID", uid: "id" },
  { name: "LEDGER", uid: "ledgerName", sortable: true },
  { name: "VOUCHER TYPE", uid: "voucherType" },
  { name: "AMOUNT", uid: "amount" },
  { name: "GST", uid: "gst" },
  { name: "TOTAL AMOUNT", uid: "totalAmount" },
  { name: "PAYMENT TYPE", uid: "paymentType" },
  { name: "PRODUCT", uid: "product" },
  { name: "ACTIONS", uid: "actions" },
];

export function capitalize(s) {
  return s ? s.charAt(0).toUpperCase() + s.slice(1).toLowerCase() : "";
}

const INITIAL_VISIBLE_COLUMNS = [
  "ledgerName",
  "voucherType",
  "amount",
  "gst",
  "totalAmount",
  "paymentType",
  "actions",
];

const Voucher = () => {
  const dispatch = useDispatch();
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const data = useSelector((state) => state.organization.voucherList);
  const count = useSelector((state) => state.organization.voucherList)?.length;
  const ledgerList = useSelector((state) => state.organization.ledgerList);
  const voucherTypeList = useSelector(
    (state) => state.organization.voucherTypeList
  );
  const ledgerDetail = useSelector((state) => state.organization.ledgerDetail);
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
  const [renderedGSTData, setRenderedGstData] = useState([]);
  const [voucherData, setVoucherData] = useState({
    companyName: "",
    ledgerId: null,
    ledgerTypeId: null,
    voucherTypeId: null,
    productId: null,
    creditAmount: "",
    debitAmount: "",
    createDate: "",
    paymentType: null,
    igst: "",
    cgst: "",
    sgst: "",
    cgstsgst: false,
    creditDebit: true,
  });
  const [editData, setEditData] = useState(null);
  const [page, setPage] = React.useState(1);
  const hasSearchFilter = Boolean(filterValue);

  useEffect(() => {
    dispatch(getAllVoucher());
  }, [dispatch]);

  useEffect(() => {
    dispatch(getAllLedgerType());
    dispatch(getAllVoucherType());
    dispatch(getAllLedger({ page: 1, size: 500 }));
  }, [dispatch]);

  const ledgerListOption = useMemo(() => ledgerList, [ledgerList]);
  const voucherTypeListOption = useMemo(
    () => voucherTypeList,
    [voucherTypeList]
  );

  const headerColumns = React.useMemo(() => {
    if (visibleColumns === "all") return columns;

    return columns.filter((column) =>
      Array.from(visibleColumns).includes(column.uid)
    );
  }, [visibleColumns]);

  const filteredItems = React.useMemo(() => {
    let filteredUsers = [...data];

    if (hasSearchFilter) {
      filteredUsers = filteredUsers.filter((user) =>
        user.name.toLowerCase().includes(filterValue.toLowerCase())
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

  const handlePressEnter = (e) => {
    const creditCgstAmount =
      (voucherData?.creditAmount * ledgerDetail?.cgst) / 100;
    const creditSgstAmount =
      (voucherData?.creditAmount * ledgerDetail?.sgst) / 100;
    const creditIgstAmount =
      (voucherData?.creditAmount * ledgerDetail?.igst) / 100;
    const debitCgstAmount =
      (voucherData?.debitAmount * ledgerDetail?.cgst) / 100;
    const debitSgstAmount =
      (voucherData?.debitAmount * ledgerDetail?.sgst) / 100;
    const debitIgstAmount =
      (voucherData?.debitAmount * ledgerDetail?.igst) / 100;
    if (ledgerDetail?.cgstSgstPresent) {
      setRenderedGstData([
        {
          idx: 2,
          perticulars: "CGST",
          rate: ledgerDetail?.cgst,
          debitAmount: debitCgstAmount,
          creditAmount: creditCgstAmount,
        },
        {
          idx: 3,
          perticulars: "SGST",
          rate: ledgerDetail?.sgst,
          debitAmount: debitSgstAmount,
          creditAmount: creditSgstAmount,
        },
        {
          idx: "",
          perticulars: "Total amount",
          rate: "",
          debitAmount:
            debitCgstAmount + debitSgstAmount + voucherData?.debitAmount,
          creditAmount:
            creditCgstAmount + creditSgstAmount + voucherData?.creditAmount,
        },
      ]);
    }
    if (ledgerDetail?.igstPresent) {
      setRenderedGstData([
        {
          idx: 2,
          perticulars: "IGST",
          rate: ledgerDetail?.igst,
          debitAmount: debitIgstAmount,
          creditAmount: creditIgstAmount,
        },
        {
          idx: "",
          perticulars: "Total amount",
          rate: "",
          debitAmount: debitIgstAmount + voucherData?.debitAmount,
          creditAmount: creditIgstAmount + voucherData?.creditAmount,
        },
      ]);
    }
    setVoucherData((prev) => ({
      ...prev,
      companyName: ledgerDetail?.name,
      igst: ledgerDetail?.igst,
      sgst: ledgerDetail?.sgst,
      cgst: ledgerDetail?.sgst,
    }));
  };

  const handleSetGst = (ledgerDetail, voucherData) => {
    console.log("asdkjsdbkjdsahb", ledgerDetail, voucherData);
    const creditCgstAmount =
      (Number(voucherData?.creditAmount) * Number(ledgerDetail?.cgst)) / 100;
    const creditSgstAmount =
      (Number(voucherData?.creditAmount) * Number(ledgerDetail?.sgst)) / 100;
    const creditIgstAmount =
      (Number(voucherData?.creditAmount) * Number(ledgerDetail?.igst)) / 100;
    const debitCgstAmount =
      (Number(voucherData?.debitAmount) * Number(ledgerDetail?.cgst)) / 100;
    const debitSgstAmount =
      (Number(voucherData?.debitAmount) * Number(ledgerDetail?.sgst)) / 100;
    const debitIgstAmount =
      (Number(voucherData?.debitAmount) * Number(ledgerDetail?.igst)) / 100;
    if (ledgerDetail?.cgstSgstPresent) {
      setRenderedGstData([
        {
          idx: 2,
          perticulars: "CGST",
          rate: ledgerDetail?.cgst,
          debitAmount: debitCgstAmount,
          creditAmount: creditCgstAmount,
        },
        {
          idx: 3,
          perticulars: "SGST",
          rate: ledgerDetail?.sgst,
          debitAmount: debitSgstAmount,
          creditAmount: creditSgstAmount,
        },
        {
          idx: "",
          perticulars: "Total amount",
          rate: "",
          debitAmount:
            debitCgstAmount +
            debitSgstAmount +
            Number(voucherData?.debitAmount),
          creditAmount:
            creditCgstAmount +
            creditSgstAmount +
            Number(voucherData?.creditAmount),
        },
      ]);
    }
    if (ledgerDetail?.igstPresent) {
      setRenderedGstData([
        {
          idx: 2,
          perticulars: "IGST",
          rate: ledgerDetail?.igst,
          debitAmount: debitIgstAmount,
          creditAmount: creditIgstAmount,
        },
        {
          idx: "",
          perticulars: "Total amount",
          rate: "",
          debitAmount: debitIgstAmount + Number(voucherData?.debitAmount),
          creditAmount: creditIgstAmount + Number(voucherData?.creditAmount),
        },
      ]);
    }
    setVoucherData((prev) => ({
      ...prev,
      companyName: ledgerDetail?.name,
      igst: ledgerDetail?.igst,
      sgst: ledgerDetail?.sgst,
      cgst: ledgerDetail?.sgst,
    }));
  };

  const handleEdit = (value) => {
    setEditData(value);
    onOpen(true);
    dispatch(getLedgerById(value?.productId)).then((resp) => {
      if (resp.meta.requestStatus === "fulfilled") {
        handleSetGst(resp.payload, { ...voucherData, ...value });
      }
    });
    setVoucherData((prev) => ({ ...prev, ...value }));
  };

  const handleSubmit = useCallback(() => {
    dispatch(
      createVoucher({
        ...voucherData,
        igstCreditAmount:
          renderedGSTData?.[0]?.perticulars === "IGST"
            ? renderedGSTData?.[0]?.creditAmount
            : 0,
        igstDebitAmount:
          renderedGSTData?.[0]?.perticulars === "IGST"
            ? renderedGSTData?.[0]?.debitAmount
            : 0,
        cgstCreditAmount:
          renderedGSTData?.[0]?.perticulars === "CGST"
            ? renderedGSTData?.[0]?.creditAmount
            : 0,
        cgstDebitAmount:
          renderedGSTData?.[0]?.perticulars === "CGST"
            ? renderedGSTData?.[0]?.debitAmount
            : 0,
        sgstCreditAmount:
          renderedGSTData?.[1]?.perticulars === "SGST"
            ? renderedGSTData?.[1]?.creditAmount
            : 0,
        sgstDebitAmount:
          renderedGSTData?.[1]?.perticulars === "SGST"
            ? renderedGSTData?.[1]?.debitAmount
            : 0,
        totalAmount:
          renderedGSTData?.[1]?.perticulars === "Total amount"
            ? renderedGSTData?.[1]?.creditAmount -
              renderedGSTData?.[1]?.debitAmount
            : 0 || renderedGSTData?.[2]?.perticulars === "Total amount"
              ? renderedGSTData?.[2]?.creditAmount -
                renderedGSTData?.[2]?.debitAmount
              : 0,
      })
    )
      .then((resp) => {
        if (resp.meta.requestStatus === "fulfilled") {
          addToast({
            title: "Voucher created successfully !.",
            color: "success",
          });
          dispatch(getAllVoucher());
          onOpenChange(false);
          setRenderedGstData([]);
          setVoucherData({
            companyName: "",
            ledgerId: null,
            ledgerTypeId: null,
            voucherTypeId: null,
            productId: null,
            creditAmount: "",
            debitAmount: "",
            createDate: "",
            paymentType: null,
            igst: "",
            cgst: "",
            sgst: "",
            cgstsgst: false,
            creditDebit: true,
          });
        } else {
          addToast({ title: "Something went wrong !.", color: "danger" });
        }
      })
      .catch(() =>
        addToast({ title: "Something went wrong !.", color: "danger" })
      );
  }, [dispatch, voucherData, renderedGSTData]);

  const renderCell = React.useCallback((rowData, columnKey) => {
    const cellValue = rowData[columnKey];
    switch (columnKey) {
      case "ledgerName":
        return (
          <span className="text-sm font-medium capitalize">
            {rowData?.ledgerName}
          </span>
        );
      case "voucherType":
        return (
          <p className="text-sm capitalize">
            {rowData?.voucherType?.name || "-"}
          </p>
        );
      case "amount":
        return (
          <div className="flex flex-col gap-1">
            <p className="text-sm">Credit : ₹ {rowData?.creditAmount || "-"}</p>
            <p className="text-sm">Debit : ₹ {rowData?.debitAmount || "-"}</p>
          </div>
        );
      case "gst":
        return (
          <div className="flex flex-col gap-1">
            <p className="text-sm">SGST : ₹ {rowData?.creditAmount || "-"}</p>
            <p className="text-sm">CGST : ₹ {rowData?.debitAmount || "-"}</p>
            <p className="text-sm">IGST : ₹ {rowData?.debitAmount || "-"}</p>
          </div>
        );
      case "totalAmount":
        return (
          <p className="text-sm capitalize">₹ {rowData?.totalAmount || "-"}</p>
        );
      case "paymentType":
        return (
          <p className="text-sm capitalize">{rowData?.paymentType || "-"}</p>
        );
      case "product":
        return <p className="text-sm capitalize">{rowData?.product || "-"}</p>;
      case "actions":
        return (
          <div className="relative flex justify-center items-center gap-2">
            <Dropdown>
              <DropdownTrigger>
                <Button isIconOnly size="sm" variant="light">
                  <EllipsisVertical className="text-default-300" />
                </Button>
              </DropdownTrigger>
              <DropdownMenu
                selectionMode="single"
                onSelectionChange={(e) => {
                  if (Array.from(e)[0] == "edit") {
                    handleEdit(rowData);
                  }
                }}
              >
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
            <Button color="primary" endContent={<Plus />} onPress={onOpen}>
              Add voucher
            </Button>
          </div>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-default-400 text-small">
            Total {count} vouchers
          </span>
          <label className="flex items-center text-default-400 text-small">
            Rows per page:
            <select
              className="bg-transparent outline-hidden text-default-400 text-small"
              value={rowsPerPage}
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
  }, [selectedKeys, items.length, page, pages, hasSearchFilter]);

  const tableTopContent = React.useMemo(() => {
    return (
      <div className="flex flex-col gap-2">
        <div className="flex justify-start gap-3">
          <NewSelect
            label={"Select voucher type"}
            data={voucherTypeListOption}
            labelKey={"name"}
            valueKey={"id"}
            value={String(voucherData?.voucherTypeId)}
            onChange={(e) =>
              setVoucherData((prev) => ({ ...prev, voucherTypeId: e }))
            }
          />
          <NewSelect
            label={"Select ledger"}
            data={ledgerListOption}
            labelKey={"name"}
            valueKey={"id"}
            value={String(voucherData?.ledgerId)}
            onChange={(e) => {
              dispatch(getLedgerById(e));
              setVoucherData((prev) => ({ ...prev, ledgerId: e }));
            }}
          />
          <Select
            className="max-w-xs"
            items={[
              { label: "Cash", key: "Cash" },
              { label: "UPI", key: "UPI" },
              { label: "NetBanking", key: "NetBanking" },
            ]}
            label="Payment type"
            selectionMode="single"
            selectedKeys={[voucherData?.paymentType]}
            onSelectionChange={(e) => {
              let key = Array.from(e)[0];
              setVoucherData((prev) => ({ ...prev, paymentType: key }));
            }}
          >
            {(item) => <SelectItem>{item.label}</SelectItem>}
          </Select>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground ">Party A/C holder name</span>
          <span>:</span>
          <span className="font-medium">{ledgerDetail?.accountHolderName}</span>
        </div>
      </div>
    );
  }, [voucherTypeListOption, ledgerDetail, voucherData]);

  console.log("sdjhgkjsgkjs", voucherData);

  return (
    <>
      <h1 className="font-sans text-2xl font-medium mb-1">Vouchers list</h1>
      <Table
        isHeaderSticky
        aria-label="Example table with custom cells, pagination and sorting"
        bottomContent={bottomContent}
        bottomContentPlacement="outside"
        classNames={{
          wrapper: "max-h-[55vh] max-w-full overflow-auto",
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
        <TableBody emptyContent={"No users found"} items={sortedItems}>
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
        size="full"
        isDismissable={false}
        isKeyboardDismissDisabled={true}
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        placement="top-center"
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader>
                {editData ? "Update voucher" : "Add voucher"}
              </ModalHeader>
              <ModalBody>
                <Table
                  aria-label="Example static collection table"
                  topContent={tableTopContent}
                >
                  <TableHeader>
                    <TableColumn width={100}>S.No</TableColumn>
                    <TableColumn>PERTICULARS</TableColumn>
                    <TableColumn width={100}>RATE %</TableColumn>
                    <TableColumn width={230}>CREDIT AMOUNT</TableColumn>
                    <TableColumn width={230}>DEBIT AMOUNT</TableColumn>
                  </TableHeader>
                  <TableBody>
                    <TableRow key="1">
                      <TableCell>1.</TableCell>
                      <TableCell>
                        <NewSelect
                          label={"Select product"}
                          data={ledgerListOption}
                          labelKey={"name"}
                          valueKey={"id"}
                          value={voucherData?.productId}
                          onChange={(e) => {
                            setVoucherData((prev) => ({
                              ...prev,
                              productId: e,
                            }));
                          }}
                        />
                      </TableCell>
                      <TableCell></TableCell>
                      <TableCell>
                        <Input
                          startContent={<IndianRupee className="h-4 w-4" />}
                          type="number"
                          value={voucherData?.creditAmount}
                          onChange={(e) => {
                            setVoucherData((prev) => ({
                              ...prev,
                              creditAmount: e.target.value,
                            }));
                          }}
                          onPressEnter={handlePressEnter}
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          startContent={<IndianRupee className="h-4 w-4" />}
                          type="number"
                          value={voucherData?.debitAmount}
                          onChange={(e) =>
                            setVoucherData((prev) => ({
                              ...prev,
                              debitAmount: e.target.value,
                            }))
                          }
                          onPressEnter={handlePressEnter}
                        />
                      </TableCell>
                    </TableRow>
                    {renderedGSTData?.map((item, idx) => {
                      return renderedGSTData?.length - 1 === idx ? (
                        <TableRow className="border" key={`${idx + 2}`}>
                          <TableCell>{idx + 2}</TableCell>
                          <TableCell className="font-medium">
                            {item?.perticulars}
                          </TableCell>
                          <TableCell>{item?.rate}</TableCell>
                          <TableCell className="font-medium pl-6">
                            ₹ {item?.creditAmount}
                          </TableCell>
                          <TableCell className="font-medium pl-6">
                            ₹ {item?.debitAmount}
                          </TableCell>
                        </TableRow>
                      ) : (
                        <TableRow key={`${idx + 2}`}>
                          <TableCell>{idx + 2}</TableCell>
                          <TableCell>{item?.perticulars}</TableCell>
                          <TableCell className="pl-6">{item?.rate}</TableCell>
                          <TableCell className="pl-6">
                            ₹ {item?.creditAmount}
                          </TableCell>
                          <TableCell className="pl-6">
                            ₹ {item?.debitAmount}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
                <ModalFooter className="flex justify-end items-center gap-2">
                  <Button onPress={onClose}>Cancel</Button>
                  <Button onPress={handleSubmit} color="primary">
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

export default Voucher;
