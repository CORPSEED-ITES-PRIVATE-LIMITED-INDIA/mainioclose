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
import { Table as AntTable } from "antd";
import { EllipsisVertical, Search } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import dayjs from "dayjs";
import { inrCurrency } from "../common";
import { useParams } from "react-router-dom";
import {
  approveDiscount,
  rejectDiscount,
  getAllProposalByUserIdForManager,
} from "../toolkit/slices/leadSlice";
import EstimateApprovalHistoryTable from "./EstimateApprovalHistoryTable";
import NewSelect from "../components/NewSelect";

export const columns = [
  { name: "DATE", uid: "date" },
  { name: "PROPOSAL NO.", uid: "proposalNo" },
  { name: "SOLUTION", uid: "service" },
  { name: "STATUS", uid: "status" },
  { name: "COMPANY", uid: "company" },
  { name: "AMOUNT", uid: "amount" },
  { name: "REQUESTED BY", uid: "addedBy" },
  { name: "ACTIONS", uid: "actions" },
];

export function capitalize(s) {
  return s ? s.charAt(0).toUpperCase() + s.slice(1).toLowerCase() : "";
}

const INITIAL_VISIBLE_COLUMNS = [
  "date",
  "proposalNo",
  "service",
  "status",
  "company",
  "amount",
  "addedBy",
  "actions",
];

const normalizeStatus = (status = "") =>
  String(status || "")
    .trim()
    .replace(/\s+/g, "_")
    .toUpperCase();

const isDiscountApprovalPendingStatus = (status) =>
  normalizeStatus(status) === "DISCOUNT_APPROVAL_PENDING";

const getDiscountApprovalToken = (proposal) =>
  proposal?.discountApprovalToken ||
  proposal?.discountToken ||
  proposal?.approvalToken ||
  proposal?.token ||
  "";

const DiscountedEstimateApproval = () => {
  const { userId } = useParams();
  const dispatch = useDispatch();
  const invoiceModal = useDisclosure();
  const data = useSelector((state) => state.leads.proposalList);
  const count = useSelector((state) => state.leads.proposalList?.length);
  const estimateHistoryList = useSelector(
    (state) => state.leads.estimateHistoryList,
  );
  const [filterValue, setFilterValue] = React.useState("");
  const [selectedKeys, setSelectedKeys] = React.useState(new Set([]));
  const [visibleColumns, setVisibleColumns] = React.useState(
    new Set(INITIAL_VISIBLE_COLUMNS),
  );
  const [rowsPerPage, setRowsPerPage] = React.useState(50);
  const [sortDescriptor, setSortDescriptor] = React.useState({
    column: "proposalNo",
    direction: "ascending",
  });
  const [page, setPage] = React.useState(1);
  const hasSearchFilter = Boolean(filterValue);
  const [rowItem, setRowItem] = useState(null);
  const [loading, setLoading] = useState("");
  const [discountActionModal, setDiscountActionModal] = useState({
    isOpen: false,
    action: null,
    rowData: null,
    remarks: "",
  });

  const refreshList = () =>
    dispatch(
      getAllProposalByUserIdForManager({
        id: userId,
        page,
        size: rowsPerPage,
        status: "DISCOUNT_APPROVAL_PENDING",
      }),
    );

  useEffect(() => {
    refreshList();
  }, [dispatch, userId, page, rowsPerPage]);

  const headerColumns = React.useMemo(() => {
    if (visibleColumns === "all") return columns;

    return columns.filter((column) =>
      Array.from(visibleColumns).includes(column.uid),
    );
  }, [visibleColumns]);

  const filteredItems = React.useMemo(() => {
    let filteredUsers = [...(data || [])];

    if (hasSearchFilter) {
      filteredUsers = filteredUsers.filter((item) =>
        Object.values(item)?.some((val) =>
          String(val)?.toLowerCase()?.includes(filterValue?.toLowerCase()),
        ),
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

  // Opens the read-only invoice/history view
  const handleView = (rowData) => {
    setRowItem(rowData);
    invoiceModal.onOpen();
  };

  // Opens the approve/reject confirm modal for a discount
  const handleDiscountAction = (action, rowData) => {
    setDiscountActionModal({
      isOpen: true,
      action,
      rowData,
      remarks: "",
    });
  };

  const handleDiscountActionSubmit = () => {
    const selectedProposal = discountActionModal?.rowData;
    const action = discountActionModal?.action;
    const token = getDiscountApprovalToken(selectedProposal);

    if (!token) {
      addToast({
        title: "Missing token",
        description: "Discount approval token is missing for this proposal.",
        color: "danger",
      });
      return;
    }

    if (action === "REJECT_DISCOUNT" && !discountActionModal?.remarks?.trim()) {
      addToast({
        title: "Remarks required",
        description: "Please enter remarks for discount rejection.",
        color: "danger",
      });
      return;
    }

    setLoading("pending");

    const apiCall =
      action === "APPROVE_DISCOUNT"
        ? approveDiscount({ token, adminUserId: userId })
        : rejectDiscount({
            token,
            adminUserId: userId,
            remarks: discountActionModal.remarks.trim(),
          });

    dispatch(apiCall)
      .then((resp) => {
        if (resp.meta.requestStatus === "fulfilled") {
          addToast({
            title: "Success",
            description:
              action === "APPROVE_DISCOUNT"
                ? "Discount approved successfully."
                : "Discount rejected successfully.",
            color: "success",
          });

          setDiscountActionModal({
            isOpen: false,
            action: null,
            rowData: null,
            remarks: "",
          });

          refreshList();
          setLoading("success");
        } else {
          setLoading("error");
          addToast({
            title: "Something went wrong",
            description:
              resp?.payload?.data?.message ||
              "Unable to update discount approval status.",
            color: "danger",
          });
        }
      })
      .catch(() => {
        setLoading("error");
        addToast({
          title: "Something went wrong",
          description: "Unable to update discount approval status.",
          color: "danger",
        });
      });
  };

  const renderCell = React.useCallback((rowData, columnKey) => {
    const cellValue = rowData[columnKey];
    switch (columnKey) {
      case "date":
        return (
          <p className="text-sm capitalize">
            {rowData?.createDate
              ? dayjs(rowData.createDate).format("DD-MM-YYYY")
              : "-"}
          </p>
        );
      case "proposalNo":
        return <p className="text-sm capitalize">{rowData?.proposalNumber}</p>;
      case "service":
        return <p className="text-sm capitalize">{rowData?.solution?.name}</p>;
      case "company":
        return <p className="text-sm capitalize">{rowData?.companyName}</p>;
      case "status":
        return (
          <div className="flex flex-col gap-2">
            <Chip
              className="text-sm capitalize"
              size="sm"
              color={
                rowData?.discountApprovalStatus === "APPROVED"
                  ? "success"
                  : rowData?.discountApprovalStatus === "REJECTED"
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
              Discount : {inrCurrency(rowData?.discountAmount)}
            </p>
            <p className="text-sm capitalize">
              Discounted fee : {inrCurrency(rowData?.discountedProfessionalFee)}
            </p>
          </div>
        );
      case "addedBy":
        return (
          <p className="text-sm capitalize">
            {rowData?.discountRequestedByName}
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
              <DropdownMenu
                onAction={(key) => {
                  if (key === "view") {
                    handleView(rowData);
                  } else if (
                    key === "APPROVE_DISCOUNT" ||
                    key === "REJECT_DISCOUNT"
                  ) {
                    handleDiscountAction(key, rowData);
                  }
                }}
              >
                <DropdownItem key="view">View</DropdownItem>

                {isDiscountApprovalPendingStatus(rowData?.status) ? (
                  <DropdownItem key="APPROVE_DISCOUNT">
                    Approve Discount
                  </DropdownItem>
                ) : null}

                {isDiscountApprovalPendingStatus(rowData?.status) ? (
                  <DropdownItem
                    key="REJECT_DISCOUNT"
                    color="danger"
                    className="text-danger"
                  >
                    Reject Discount
                  </DropdownItem>
                ) : null}
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
      <div className="flex flex-col gap-2">
        <div className="flex justify-between gap-2 items-center flex-wrap">
          <Input
            isClearable
            size="sm"
            className="w-full sm:max-w-[280px]"
            classNames={{ inputWrapper: "h-8 min-h-8" }}
            placeholder="Search proposals..."
            startContent={<Search className="w-4 h-4 text-default-400" />}
            value={filterValue}
            onClear={() => onClear()}
            onValueChange={onSearchChange}
          />

          <div className="flex gap-1.5 flex-wrap">
            <div className="w-[160px]">
              <NewSelect
                size="sm"
                isSearchable={false}
                data={columns}
                selectionMode="multiple"
                labelKey="name"
                valueKey="uid"
                label="Columns"
                placeholder="Columns"
                value={Array.from(visibleColumns)}
                onChange={(values) => {
                  if (values.length > 0) {
                    setVisibleColumns(new Set(values));
                  }
                }}
              />
            </div>
          </div>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-default-400 text-[12.5px]">
            Total {count} proposal
          </span>

          <label className="flex items-center gap-1 text-default-400 text-[12.5px]">
            Rows per page:
            <select
              className="bg-transparent outline-hidden text-default-400 text-[12.5px] cursor-pointer"
              onChange={onRowsPerPageChange}
              value={rowsPerPage}
            >
              <option value="5">5</option>
              <option value="10">10</option>
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
    rowsPerPage,
  ]);

  const bottomContent = React.useMemo(() => {
    return (
      <div className="py-1.5 px-1 flex justify-between items-center">
        <span className="w-[30%] text-[12.5px] text-default-400">
          Page {page} of {pages}
        </span>
        <Pagination
          isCompact
          showControls
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
    <div className="flex flex-col gap-2">
      <h1 className="font-sans text-lg font-semibold mb-2 shrink-0">
        Discounted Estimates
      </h1>
      <Table
        isHeaderSticky
        removeWrapper={false}
        aria-label="Discounted estimates table with custom cells, pagination and sorting"
        bottomContent={bottomContent}
        bottomContentPlacement="outside"
        classNames={{
          base: "gap-2.5",
          wrapper:
            "max-h-[calc(100vh-320px)] w-full overflow-y-auto rounded-lg border border-gray-200 dark:border-white/10 shadow-none p-0",
          table: "w-full",
          thead: "[&>tr]:first:rounded-none",
          th: "h-8 py-0 text-[11.5px] tracking-wide bg-gray-50 dark:bg-neutral-900 text-default-500 first:rounded-none last:rounded-none border-b border-gray-200 dark:border-white/10",
          td: "py-1.5 text-[12.5px]",
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
            <TableRow key={`${item.id}proposal`}>
              {(columnKey) => (
                <TableCell>{renderCell(item, columnKey)}</TableCell>
              )}
            </TableRow>
          )}
        </TableBody>
      </Table>

      {/* View-only: tax invoice / history */}
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
                <AntTable
                  dataSource={estimateHistoryList?.history}
                  columns={
                    rowItem?.type === "Product"
                      ? [
                          { title: "Id", dataIndex: "id", width: 50 },
                          { title: "Price/kg", dataIndex: "actualPrice" },
                          { title: "Total price", dataIndex: "fees" },
                          { title: "Quantity", dataIndex: "quantity" },
                        ]
                      : [
                          { title: "Id", dataIndex: "id", width: 50 },
                          {
                            title: "Professional amount",
                            dataIndex: "professionalFees",
                          },
                          {
                            title: "Professional code",
                            dataIndex: "profesionalCode",
                          },
                          {
                            title: "Professional fees",
                            dataIndex: "professionalFees",
                          },
                        ]
                  }
                  style={{ marginBottom: 24 }}
                  pagination={false}
                  scroll={{ y: 350 }}
                />

                <EstimateApprovalHistoryTable
                  columns={
                    rowItem?.type === "Product"
                      ? [
                          { title: "Id", dataIndex: "id", width: 50 },
                          { title: "Price/kg", dataIndex: "actualPrice" },
                          { title: "Total price", dataIndex: "fees" },
                          { title: "Quantity", dataIndex: "quantity" },
                        ]
                      : [
                          { title: "Id", dataIndex: "id", width: 50 },
                          {
                            title: "Professional amount",
                            dataIndex: "professionalFees",
                          },
                          {
                            title: "Professional code",
                            dataIndex: "profesionalCode",
                          },
                          {
                            title: "Professional fees",
                            dataIndex: "professionalFees",
                          },
                        ]
                  }
                  data={estimateHistoryList?.history}
                />
              </ModalBody>
              <ModalFooter>
                <Button color="danger" variant="light" onPress={onClose}>
                  Close
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      {/* Discount approve / reject confirm modal */}
      <Modal
        isDismissable={false}
        isKeyboardDismissDisabled={true}
        isOpen={discountActionModal.isOpen}
        onOpenChange={(open) => {
          if (!open) {
            setDiscountActionModal({
              isOpen: false,
              action: null,
              rowData: null,
              remarks: "",
            });
          }
        }}
        placement="top-center"
      >
        <ModalContent>
          {(onCloseModal) => (
            <>
              <ModalHeader>
                {discountActionModal.action === "APPROVE_DISCOUNT"
                  ? "Approve Discount"
                  : "Reject Discount"}
              </ModalHeader>

              <ModalBody>
                <div className="flex flex-col gap-4">
                  <p className="text-sm text-default-600">
                    {discountActionModal.action === "APPROVE_DISCOUNT"
                      ? "Are you sure you want to approve this discount?"
                      : "Are you sure you want to reject this discount?"}
                  </p>

                  <div className="rounded-lg border border-default-200 bg-default-50 p-3 text-xs text-default-600">
                    <p>
                      <span className="font-semibold">Proposal No:</span>{" "}
                      {discountActionModal?.rowData?.proposalNumber || "-"}
                    </p>
                    <p className="mt-1">
                      <span className="font-semibold">Service:</span>{" "}
                      {discountActionModal?.rowData?.solution?.name || "-"}
                    </p>
                    <p className="mt-1">
                      <span className="font-semibold">Requested By:</span>{" "}
                      {discountActionModal?.rowData?.discountRequestedByName ||
                        "-"}
                    </p>
                  </div>

                  {discountActionModal.action === "REJECT_DISCOUNT" ? (
                    <Input
                      label="Remarks"
                      isRequired
                      value={discountActionModal.remarks}
                      onChange={(e) =>
                        setDiscountActionModal((prev) => ({
                          ...prev,
                          remarks: e.target.value,
                        }))
                      }
                      placeholder="Enter rejection remarks"
                    />
                  ) : null}
                </div>
              </ModalBody>

              <ModalFooter>
                <Button
                  variant="flat"
                  onPress={() => {
                    setDiscountActionModal({
                      isOpen: false,
                      action: null,
                      rowData: null,
                      remarks: "",
                    });
                    onCloseModal();
                  }}
                >
                  No, Cancel
                </Button>

                <Button
                  color={
                    discountActionModal.action === "APPROVE_DISCOUNT"
                      ? "primary"
                      : "danger"
                  }
                  isLoading={loading === "pending"}
                  onPress={handleDiscountActionSubmit}
                >
                  {discountActionModal.action === "APPROVE_DISCOUNT"
                    ? "Yes, Approve"
                    : "Yes, Reject"}
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
};

export default DiscountedEstimateApproval;
