import {
  addToast,
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
  useDisclosure,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Form,
  Select,
  SelectItem,
} from "@heroui/react";
import { ChevronDown, EllipsisVertical, Search } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import {
  approveProcurementPaymentRequest,
  getAllPaymentApprovals,
  getActivePaymentLedgerForPaymentRegister,
  getProcurementPaymentRequestList,
  getProcurementPurchaseOrder,
  rejectProcurementPaymentRequest,
  releaseProcurementPaymentRequest,
} from "../toolkit/slices/accountSlice";
import { inrCurrency } from "../common";
import NewSelect from "../components/NewSelect";
import dayjs from "dayjs";

const columns = [
  { name: "ID", uid: "id" },
  { name: "PO NO.", uid: "poNumber", sortable: true },
  { name: "PROJECT NAME", uid: "projectName" },
  { name: "PROJECT NO.", uid: "projectNo" },
  { name: "VENDOR NAME", uid: "vendorName" },
  { name: "INVOICE AMOUNT", uid: "invoiceAmount" },
  { name: "PAYABLE AMOUNT", uid: "payableAmount" },
  { name: "STATUS", uid: "status" },
  { name: "APPROVED DATE", uid: "approvedDate" },
  { name: "PAYMENT RELEASED DATE", uid: "paymentReleasedDate" },
  { name: "ATTACHMENTS", uid: "proofAttachmentUrls" },
  { name: "ACTIONS", uid: "actions" },
];

function capitalize(s) {
  return s ? s.charAt(0).toUpperCase() + s.slice(1).toLowerCase() : "";
}

const getStatusColor = (status) => {
  switch (status) {
    case "DRAFT":
      return "default";

    case "PENDING_APPROVAL":
      return "warning";

    case "APPROVED":
      return "success";

    case "REJECTED":
      return "danger";

    case "RELEASED":
    case "PO_RELEASED":
      return "primary";

    case "PARTIALLY_COMPLETED":
      return "warning";

    case "COMPLETED":
    case "PAYMENT_DONE":
      return "success";

    default:
      return "default";
  }
};

const INITIAL_VISIBLE_COLUMNS = [
  "poNumber",
  "projectName",
  "projectNo",
  "vendorName",
  "invoiceAmount",
  "payableAmount",
  "status",
  "approvedDate",
  "paymentReleasedDate",
  "proofAttachmentUrls",
  "actions",
];

const isEnabledFlag = (value) => {
  const normalized = String(value ?? "")
    .trim()
    .toLowerCase();

  return ["true", "yes", "1", "active"].includes(normalized);
};

const roundMoney = (value) =>
  Math.round((Number(value || 0) + Number.EPSILON) * 100) / 100;

const getApprovalTdsData = (paymentRequest) => {
  const tdsEnabled = isEnabledFlag(paymentRequest?.tdsActive);

  if (!tdsEnabled) {
    return {
      tdsActive: "NO",
      tdsAmount: 0,
    };
  }

  const invoiceAmount = Number(paymentRequest?.invoiceAmount || 0);
  const payableAmount = Number(paymentRequest?.payableAmount || 0);

  return {
    tdsActive: "YES",
    tdsAmount: roundMoney(Math.max(invoiceAmount - payableAmount, 0)),
  };
};

const ProcurementPaymentRequest = () => {
  const { userId } = useParams();
  const dispatch = useDispatch();
  const count = useSelector(
    (state) => state.account.procurementPaymentRequestList?.data?.totalElements,
  );
  const data = useSelector(
    (state) => state.account.procurementPaymentRequestList?.data?.content,
  );
  const paymentLedgerList = useSelector(
    (state) => state.account.paymentLegerList,
  );
  const approveModal = useDisclosure();
  const rejectModal = useDisclosure();
  const releaseModal = useDisclosure();
  const [filterValue, setFilterValue] = useState("");
  const [selectedKeys, setSelectedKeys] = useState(new Set([]));
  const [visibleColumns, setVisibleColumns] = useState(
    new Set(INITIAL_VISIBLE_COLUMNS),
  );
  const [sortDescriptor, setSortDescriptor] = useState({
    column: "age",
    direction: "ascending",
  });
  const [filteration, setFilteration] = useState({
    userId: userId,
    page: 1,
    size: 50,
    status: "PENDING",
  });
  const [rowItem, setRowItem] = useState(null);
  const [approvePaymentMode, setApprovePaymentMode] = useState("");
  const [approveBankLedgerId, setApproveBankLedgerId] = useState("");

  const approvalTdsData = useMemo(() => getApprovalTdsData(rowItem), [rowItem]);

  const hasSearchFilter = Boolean(filterValue);

  const hasApprovePaymentModeSelected = Boolean(
    String(approvePaymentMode || "").trim(),
  );

  const isApproveCashPaymentMode =
    String(approvePaymentMode || "")
      .trim()
      .toUpperCase() === "CASH";

  const isCashLedger = (ledger) => {
    const ledgerName = String(ledger?.ledgerName || "")
      .trim()
      .toLowerCase();
    const ledgerType = String(ledger?.ledgerType || "")
      .trim()
      .toLowerCase();

    return ledgerType === "cash" || ledgerName.includes("cash");
  };

  const filteredApprovePaymentLedgerList = useMemo(() => {
    if (!hasApprovePaymentModeSelected) {
      return [];
    }

    const ledgers = Array.isArray(paymentLedgerList) ? paymentLedgerList : [];

    return isApproveCashPaymentMode
      ? ledgers.filter(isCashLedger)
      : ledgers.filter((ledger) => !isCashLedger(ledger));
  }, [
    hasApprovePaymentModeSelected,
    isApproveCashPaymentMode,
    paymentLedgerList,
  ]);

  const resetApprovePaymentFields = useCallback(() => {
    setApprovePaymentMode("");
    setApproveBankLedgerId("");
  }, []);

  useEffect(() => {
    dispatch(getProcurementPaymentRequestList(filteration));
  }, [dispatch, filteration]);

  useEffect(() => {
    dispatch(getActivePaymentLedgerForPaymentRegister());
  }, [dispatch]);

  const headerColumns = useMemo(() => {
    if (visibleColumns === "all") return columns;

    return columns.filter((column) =>
      Array.from(visibleColumns).includes(column.uid),
    );
  }, [visibleColumns]);

  const filteredItems = useMemo(() => {
    let filteredUsers = [...(data || [])];

    if (hasSearchFilter) {
      filteredUsers = filteredUsers.filter((user) =>
        user?.projectName?.toLowerCase().includes(filterValue.toLowerCase()),
      );
    }
    return filteredUsers;
  }, [data, filterValue]);

  const pages = Math.ceil(count / filteration?.size) || 1;

  const sortedItems = useMemo(() => {
    return [...filteredItems].sort((a, b) => {
      const first = a[sortDescriptor.column];
      const second = b[sortDescriptor.column];
      const cmp = first < second ? -1 : first > second ? 1 : 0;

      return sortDescriptor.direction === "descending" ? -cmp : cmp;
    });
  }, [sortDescriptor, filteredItems]);

  const handleActionPress = (item, key) => {
    setRowItem(item);
    if (key === "Approved") {
      resetApprovePaymentFields();
      approveModal.onOpen();
    } else if (key === "Rejected") {
      rejectModal.onOpen();
    } else if (key === "Release") {
      releaseModal.onOpen();
    }
  };

  const handleApproveRequest = (values) => {
    const payload = {
      ...values,
      paymentMode: approvePaymentMode,
      bankLedgerId: Number(approveBankLedgerId),
      tdsActive: approvalTdsData.tdsActive,
      tdsAmount: approvalTdsData.tdsAmount,
    };

    dispatch(
      approveProcurementPaymentRequest({
        paymentRequestId: rowItem?.id,
        data: payload,
        userId,
      }),
    )
      .then((resp) => {
        if (resp.meta.requestStatus === "fulfilled") {
          addToast({
            title: "SUCCESS",
            description: "Approved successfully !.",
            color: "success",
          });
          approveModal.onClose();
          resetApprovePaymentFields();
          setRowItem(null);
          dispatch(getProcurementPaymentRequestList(filteration));
        } else {
          //handle error
          addToast({
            title: "Error",
            description: resp.payload || "Something went wrong",
            color: "danger",
          });
        }
      })
      .catch(() =>
        addToast({
          title: "ERROR",
          description: "Something went wrong",
          color: "danger",
        }),
      );
  };

  const handleRejectRequest = (values) => {
    // Implementation for handling approve request
    dispatch(
      rejectProcurementPaymentRequest({
        paymentRequestId: rowItem?.id,
        data: values,
        userId,
      }),
    )
      .then((resp) => {
        if (resp.meta.requestStatus === "fulfilled") {
          addToast({
            title: "SUCCESS",
            description: "Rejected successfully !.",
            color: "success",
          });
          rejectModal.onClose();
          setRowItem(null);
          dispatch(getProcurementPaymentRequestList(filteration));
        } else {
          //handle error
          addToast({
            title: "Error",
            description: resp.payload || "Something went wrong",
            color: "danger",
          });
        }
      })
      .catch(() =>
        addToast({
          title: "ERROR",
          description: "Something went wrong",
          color: "danger",
        }),
      );
  };

  const handlePaymentReleaseRequest = (values) => {
    // Implementation for handling approve request
    dispatch(
      releaseProcurementPaymentRequest({
        paymentRequestId: rowItem?.id,
        data: values,
        userId,
      }),
    )
      .then((resp) => {
        if (resp.meta.requestStatus === "fulfilled") {
          addToast({
            title: "SUCCESS",
            description: "Payment released successfully !.",
            color: "success",
          });
          releaseModal.onClose();
          setRowItem(null);
          dispatch(getProcurementPaymentRequestList(filteration));
        } else {
          //handle error
          addToast({
            title: resp?.payload?.errorCode,
            description: resp?.payload?.message || "Something went wrong",
            color: "danger",
          });
        }
      })
      .catch(() =>
        addToast({
          title: "ERROR",
          description: "Something went wrong",
          color: "danger",
        }),
      );
  };

  const renderCell = useCallback((rowData, columnKey) => {
    switch (columnKey) {
      case "projectName":
        return (
          <div className="flex items-start gap-2">
            <div className="flex flex-col">
              <p className="font-normal capitalize">
                {rowData?.projectName || "-"}
              </p>
              <p className="font-normal text-xs text-gray-400">
                {rowData?.projectNo || "-"}
              </p>
            </div>
          </div>
        );

      case "vendorName":
        return (
          <div className="flex flex-col">
            <span className="font-normal capitalize">
              {rowData?.vendorName || "Unknown"}
            </span>
          </div>
        );
      case "invoiceAmount":
        return (
          <div className="flex flex-col">
            <span className="font-normal">
              {inrCurrency(rowData?.invoiceAmount) || "-"}
            </span>
          </div>
        );
      case "payableAmount":
        return (
          <div className="flex flex-col">
            <span className="font-normal">
              {inrCurrency(rowData?.payableAmount) || "-"}
            </span>
          </div>
        );
      case "status":
        return (
          <div className="flex flex-col">
            <Chip
              size="sm"
              className="text-tiny capitalize"
              variant="flat"
              color={getStatusColor(rowData?.status)}
            >
              {rowData?.status || "-"}
            </Chip>
          </div>
        );
      case "approvedDate":
        return (
          <div className="flex flex-col">
            {dayjs(rowData?.approvedDate).format("DD MMM YYYY hh:mm A") || "-"}
          </div>
        );
      case "paymentReleasedDate":
        return (
          <div className="flex flex-col">
            {dayjs(rowData?.paymentReleasedDate).format(
              "DD MMM YYYY hh:mm A",
            ) || "-"}
          </div>
        );
      case "proofAttachmentUrls":
        return (
          <div className="flex flex-col">
            {rowData?.proofAttachmentUrls?.map((url, index) => (
              <a
                key={index}
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 hover:underline"
              >
                Proof Attachment {index + 1}
              </a>
            )) || "-"}
          </div>
        );
      case "actions":
        const isPending = rowData?.status == "PENDING";
        return (
          <Dropdown>
            <DropdownTrigger>
              <Button size="sm" isIconOnly variant="light">
                <EllipsisVertical />
              </Button>
            </DropdownTrigger>
            <DropdownMenu>
              {rowData?.status === "APPROVED" && (
                <DropdownItem
                  onPress={() => handleActionPress(rowData, "Release")}
                >
                  Release payment
                </DropdownItem>
              )}

              {isPending && (
                <>
                  <DropdownItem
                    onPress={() => handleActionPress(rowData, "Approved")}
                  >
                    Approved
                  </DropdownItem>
                  <DropdownItem
                    onPress={() => handleActionPress(rowData, "Rejected")}
                  >
                    Rejected
                  </DropdownItem>
                </>
              )}
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
                  { label: "PENDING", uid: "PENDING" },
                  { label: "APPROVED", uid: "APPROVED" },
                  { label: "UNDER_REVIEW", uid: "UNDER_REVIEW" },
                  { label: "PAYMENT_PROCESSING", uid: "PAYMENT_PROCESSING" },
                  { label: "PAYMENT_RELEASED", uid: "PAYMENT_RELEASED" },
                  { label: "ON_HOLD", uid: "ON_HOLD" },
                  { label: "REJECTED", uid: "REJECTED" },
                ].map((status) => (
                  <DropdownItem key={status.uid} className="capitalize">
                    {status.label}
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
            Total {count} payments requests
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
    count,
    onSearchChange,
    hasSearchFilter,
    filteration.status,
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
              dispatch(
                getProcurementPaymentRequestList({ ...filteration, page: e }),
              );
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
      <h1 className="font-sans text-2xl font-medium mb-1">
        Procurement Payment Requests
      </h1>
      <Table
        isHeaderSticky
        aria-label="Example table with custom cells, pagination and sorting"
        bottomContent={bottomContent}
        bottomContentPlacement="outside"
        classNames={{
          wrapper: "max-h-[65vh] w-full",
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
            <TableRow key={item.id}>
              {(columnKey) => (
                <TableCell>{renderCell(item, columnKey)}</TableCell>
              )}
            </TableRow>
          )}
        </TableBody>
      </Table>

      <Modal
        isOpen={approveModal.isOpen}
        onOpenChange={(isOpen) => {
          approveModal.onOpenChange(isOpen);

          if (!isOpen) {
            resetApprovePaymentFields();
          }
        }}
      >
        <ModalContent>
          {(onClose) => (
            <Form
              className="w-full"
              onSubmit={(e) => {
                e.preventDefault();

                if (!approvePaymentMode) {
                  addToast({
                    title: "Payment mode is required",
                    color: "danger",
                  });
                  return;
                }

                if (!approveBankLedgerId) {
                  addToast({
                    title: "Bank/Cash ledger is required",
                    color: "danger",
                  });
                  return;
                }

                const formData = Object.fromEntries(
                  new FormData(e.currentTarget),
                );

                handleApproveRequest(formData);
              }}
            >
              <ModalHeader>Approve Request</ModalHeader>
              <ModalBody className="grid grid-cols-1 gap-4 w-full md:grid-cols-2">
                <Select
                  label="Payment Mode"
                  placeholder="Select payment mode"
                  isRequired
                  selectedKeys={
                    approvePaymentMode
                      ? new Set([approvePaymentMode])
                      : new Set([])
                  }
                  onSelectionChange={(keys) => {
                    const selectedValue = Array.from(keys)?.[0] || "";
                    setApprovePaymentMode(String(selectedValue));
                    setApproveBankLedgerId("");
                  }}
                >
                  <SelectItem key="CASH">Cash</SelectItem>
                  <SelectItem key="UPI">UPI</SelectItem>
                  <SelectItem key="CARD">Card</SelectItem>
                  <SelectItem key="BANK_TRANSFER">Bank Transfer</SelectItem>
                  <SelectItem key="CHEQUE">Cheque</SelectItem>
                </Select>

                <NewSelect
                  isRequired
                  isDisabled={!hasApprovePaymentModeSelected}
                  label={
                    isApproveCashPaymentMode
                      ? "Select Cash Ledger"
                      : "Select Bank Ledger"
                  }
                  placeholder={
                    !hasApprovePaymentModeSelected
                      ? "Select payment mode first"
                      : isApproveCashPaymentMode
                        ? "Select cash ledger"
                        : "Select bank ledger"
                  }
                  data={filteredApprovePaymentLedgerList}
                  labelKey="ledgerName"
                  valueKey="id"
                  value={approveBankLedgerId}
                  onChange={(value) => {
                    setApproveBankLedgerId(value ? String(value) : "");
                  }}
                />

                <Input
                  label="TDS Applicable"
                  value={approvalTdsData.tdsActive}
                  isReadOnly
                />

                <Input
                  label="TDS Amount"
                  value={approvalTdsData.tdsAmount.toFixed(2)}
                  isReadOnly
                />

                <Input
                  className="md:col-span-2"
                  label="Comment"
                  name="comment"
                  isRequired
                  errorMessage="Please enter a comment"
                />
              </ModalBody>

              <ModalFooter className="flex justify-end gap-2 w-full">
                <Button
                  type="button"
                  onPress={() => {
                    resetApprovePaymentFields();
                    onClose();
                  }}
                >
                  Close
                </Button>
                <Button color="primary" type="submit">
                  Submit
                </Button>
              </ModalFooter>
            </Form>
          )}
        </ModalContent>
      </Modal>
      <Modal
        size="2xl"
        isOpen={rejectModal.isOpen}
        onOpenChange={rejectModal.onOpenChange}
      >
        <ModalContent>
          {(onClose) => (
            <Form
              className="w-full"
              onSubmit={(e) => {
                e.preventDefault();
                let data = Object.fromEntries(new FormData(e.currentTarget));
                handleRejectRequest(data);
              }}
            >
              <ModalHeader>Reject Request</ModalHeader>
              <ModalBody className="grid md:grid-cols-1 gap-4 w-full">
                <Input
                  label="Reason for rejection"
                  name="reason"
                  isRequired
                  errorMessage="please enter a reason for rejection"
                />
              </ModalBody>

              <ModalFooter className="flex justify-end gap-2 w-full">
                <Button onPress={onClose}>Close</Button>
                <Button color="primary" type="submit">
                  Submit
                </Button>
              </ModalFooter>
            </Form>
          )}
        </ModalContent>
      </Modal>
      <Modal
        size="2xl"
        isOpen={releaseModal.isOpen}
        onOpenChange={releaseModal.onOpenChange}
      >
        <ModalContent>
          {(onClose) => (
            <Form
              className="w-full"
              onSubmit={(e) => {
                e.preventDefault();
                let data = Object.fromEntries(new FormData(e.currentTarget));
                handlePaymentReleaseRequest(data);
              }}
            >
              <ModalHeader>Release Payment Request</ModalHeader>
              <ModalBody className="grid md:grid-cols-1 gap-4 w-full">
                <Input
                  label="Invoice Number"
                  name="invoiceNumber"
                  isRequired
                  errorMessage="please enter an invoice number"
                />
                <Input
                  label="Comment for payment release"
                  name="comment"
                  isRequired
                  errorMessage="please enter a comment for payment release"
                />
              </ModalBody>

              <ModalFooter className="flex justify-end gap-2 w-full">
                <Button onPress={onClose}>Close</Button>
                <Button color="primary" type="submit">
                  Submit
                </Button>
              </ModalFooter>
            </Form>
          )}
        </ModalContent>
      </Modal>
    </>
  );
};

export default ProcurementPaymentRequest;
