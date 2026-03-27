import {
  addToast,
  Button,
  Chip,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Pagination,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
  Textarea,
  Tooltip,
  useDisclosure,
} from "@heroui/react";
import { ChevronDown, EllipsisVertical, Info, Search } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useParams } from "react-router-dom";
import { getAllCompaniesForApprovals } from "../toolkit/slices/accountSlice";
import {
  approvedCompanyInAccount,
  approvedCompanyInLeads,
} from "../toolkit/slices/companySlice";
import {
  approvedAndDisapprovedExpense,
  getExpenseListByUserId,
} from "../toolkit/slices/operationSlice";
import dayjs from "dayjs";
import { inrCurrency } from "../common";

const columns = [
  { name: "ID", uid: "expenseId" },
  { name: "UNBILL NO.", uid: "unbilledNumber" },
  { name: "PROJECT NO.", uid: "projectNo" },
  { name: "EXPENSE DATE", uid: "expenseDate" },
  { name: "EXPENSE TYPE", uid: "expenseType" },
  { name: "SERVICE", uid: "productName" },
  { name: "PROJECT NAME", uid: "projectName" },
  { name: "RAISED BY", uid: "createdByUserName" },
  { name: "AMOUNT", uid: "amount" },
  { name: "APPROVED BY", uid: "approvedByUserName" },
  { name: "REMARK", uid: "remark" },
  { name: "ACTIONS", uid: "actions" },
];

function capitalize(s) {
  return s ? s.charAt(0).toUpperCase() + s.slice(1).toLowerCase() : "";
}

const INITIAL_VISIBLE_COLUMNS = [
  "expenseId",
  "unbilledNumber",
  "projectNo",
  "expenseDate",
  "expenseType",
  "productName",
  "projectName",
  "createdByUserName",
  "amount",
  "approvedByUserName",
  "remark",
  "actions",
];

const Expense = () => {
  const { userId } = useParams();
  const dispatch = useDispatch();
  const { isOpen, onOpen, onClose, onOpenChange } = useDisclosure();
  const count = useSelector((state) => state.operation.expenseList?.length);
  const data = useSelector((state) => state.operation.expenseList);
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
    status: "ALL",
  });

  const [statusData, setStatusData] = useState({
    status: null,
    rejectionRemark: "",
    projectId: null,
    expenseId: null,
    userId,
  });

  const hasSearchFilter = Boolean(filterValue);

  useEffect(() => {
    dispatch(getExpenseListByUserId(filteration));
  }, [dispatch, filteration]);

  const headerColumns = useMemo(() => {
    if (visibleColumns === "all") return columns;

    return columns.filter((column) =>
      Array.from(visibleColumns).includes(column.uid),
    );
  }, [visibleColumns]);

  const filteredItems = useMemo(() => {
    let filteredUsers = [...(data || [])];

    if (hasSearchFilter) {
      filteredUsers = filteredUsers?.filter((item) =>
        Object.values(item)?.some((val) =>
          String(val)?.toLowerCase()?.includes(filterValue?.toLowerCase()),
        ),
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

  const handleChangeExpenseStatus = (value) => {
    if (value.status === "APPROVED") {
      dispatch(
        approvedAndDisapprovedExpense({
          ...value,
          userId,
          data: { status: value?.status },
        }),
      )
        .then((resp) => {
          console.log("djkjkjkjkjkjkjkjkjkjkfs", resp);
          if (resp.meta.requestStatus === "fulfilled") {
            addToast({
              title: "Expense status updated successfully !.",
              color: "success",
            });
            dispatch(getExpenseListByUserId(filteration));
            onClose();
            setStatusData({
              status: null,
              rejectionRemark: "",
              projectId: null,
              expenseId: null,
              userId,
            });
          } else {
            addToast({ title: resp.payload.data.message, color: "danger" });
          }
        })
        .catch(() => {
          addToast({
            title: "Something went wrong in accounts",
            color: "danger",
          });
        });
    } else {
      dispatch(
        approvedAndDisapprovedExpense({
          ...statusData,
          userId,
          data: {
            status: statusData?.status,
            rejectionRemark: statusData?.rejectionRemark,
          },
        }),
      )
        .then((resp) => {
          if (resp.meta.requestStatus === "fulfilled") {
            addToast({
              title: "Expense status updated successfully !.",
              color: "success",
            });
            dispatch(getExpenseListByUserId(filteration));
            onClose();
            setStatusData({
              status: null,
              rejectionRemark: "",
              projectId: null,
              expenseId: null,
              userId,
            });
          } else {
            addToast({ title: resp.payload.data.message, color: "danger" });
          }
        })
        .catch(() => {
          addToast({
            title: "Something went wrong in accounts",
            color: "danger",
          });
        });
    }
  };

  const renderCell = useCallback((rowData, columnKey) => {
    switch (columnKey) {
      case "unbilledNumber":
        return (
          <div className="flex flex-col">
            <p>{rowData?.unbilledNumber}</p>
            {rowData?.approvalStatus && (
              <Chip
                size="sm"
                color={
                  rowData?.approvalStatus === "APPROVED"
                    ? "success"
                    : rowData?.approvalStatus === "REJECTED"
                      ? "danger"
                      : rowData?.approvalStatus === "ON_HOLD"
                        ? "warning"
                        : rowData?.approvalStatus === "PENDING"
                          ? "secondary"
                          : "default"
                }
              >
                {rowData?.approvalStatus}
              </Chip>
            )}
          </div>
        );
      case "expenseDate":
        return (
          <p>{dayjs(rowData?.expenseDate).format("DD-MM-YYYY, HH:mm A")}</p>
        );
      case "amount":
        return <p>{inrCurrency(rowData?.amount)}</p>;

      case "actions":
        return (
          <Dropdown showArrow>
            <DropdownTrigger>
              <Button size="sm" isIconOnly variant="light">
                <EllipsisVertical />
              </Button>
            </DropdownTrigger>
            <DropdownMenu>
              <DropdownItem
                onPress={() => {
                  handleChangeExpenseStatus({
                    status: "APPROVED",
                    projectId: rowData?.projectId,
                    expenseId: rowData?.expenseId,
                  });
                }}
              >
                APPROVED
              </DropdownItem>
              <DropdownItem
                onPress={() => {
                  onOpen();
                  setStatusData((pre) => ({
                    ...pre,
                    status: "PENDING",
                    projectId: rowData?.projectId,
                    expenseId: rowData?.expenseId,
                  }));
                }}
              >
                PENDING
              </DropdownItem>
              <DropdownItem
                onPress={() => {
                  onOpen();
                  setStatusData((pre) => ({
                    ...pre,
                    status: "ON_HOLD",
                    projectId: rowData?.projectId,
                    expenseId: rowData?.expenseId,
                  }));
                }}
              >
                ON_HOLD
              </DropdownItem>
              <DropdownItem
                onPress={() => {
                  onOpen();
                  setStatusData((pre) => ({
                    ...pre,
                    status: "REJECTED",
                    projectId: rowData?.projectId,
                    expenseId: rowData?.expenseId,
                  }));
                }}
              >
                REJECTED
              </DropdownItem>
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
                <DropdownItem key="ALL">ALL</DropdownItem>
                <DropdownItem key="PENDING">PENDING</DropdownItem>
                <DropdownItem key="ON_HOLD">ON_HOLD</DropdownItem>
                <DropdownItem key="APPROVED">APPROVED</DropdownItem>
                <DropdownItem key="REJECTED">REJECTED</DropdownItem>
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
            Total {count} expense for approvals
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
    filteration?.status,
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
      <h1 className="font-sans text-2xl font-medium mb-1">
        Expenses for approvals
      </h1>
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
            <TableRow key={item.expenseId}>
              {(columnKey) => (
                <TableCell>{renderCell(item, columnKey)}</TableCell>
              )}
            </TableRow>
          )}
        </TableBody>
      </Table>
      <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                Update status
              </ModalHeader>
              <ModalBody>
                <Textarea
                  label="Remark"
                  isRequired
                  value={statusData.rejectionRemark}
                  onChange={(e) =>
                    setStatusData((prev) => ({
                      ...prev,
                      rejectionRemark: e.target.value,
                    }))
                  }
                />
              </ModalBody>
              <ModalFooter>
                <Button variant="light" onPress={onClose}>
                  Close
                </Button>
                <Button
                  color="primary"
                  isDisabled={statusData.remark === ""}
                  onPress={handleChangeExpenseStatus}
                >
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

export default Expense;
