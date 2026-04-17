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
  Textarea,
  Select,
  SelectItem,
  addToast,
  Chip,
} from "@heroui/react";
import { ChevronDown, EllipsisVertical, Search } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import {
  getAllUnbillCount,
  getAllUnbillList,
  searchUnbilledByCompanyNameAndUnbilled,
  updateStatusForUnbill,
} from "../../toolkit/slices/organizationSlice";
import { inrCurrency } from "../../common";
import dayjs from "dayjs";
import {
  cancelUnBilledInvoice,
  convertUnbillToAdvanceInvoice,
  getAllInvoiceReport,
  getUnBilledDetailById,
} from "../../toolkit/slices/accountSlice";
import { useParams } from "react-router-dom";
import UnbilledView from "../../components/UnbilledView";
import { cancelProjectByUnbilledNumberInOperations } from "../../toolkit/slices/operationSlice";
import { getEstimateByEstimateId } from "../../toolkit/slices/leadSlice";
import NewEstimatePreview from "../../sales/leads/leadEstimate/NewEstimatePreview";

export const columns = [
  { name: "DATE", uid: "date" },
  { name: "TOTAL INVOICE", uid: "totalInvoices" },
  { name: "TOTAL REVENUE", uid: "totalRevenue" },
  { name: "NET REVENUE", uid: "totalNetRevenue" },
  { name: "GST COLLECTED", uid: "totalGstCollected" },
  { name: "AVG. INVOICE VALUE", uid: "averageInvoiceValue" },
  { name: "TOTAL UNBILL AMOUNT", uid: "totalUnbilledAmount" },
  { name: "TOTAL RECEIVED AMOUNT", uid: "totalReceivedAmount" },
  { name: "TOTAL OUTSTANDING AMOUNT", uid: "totalOutstandingAmount" },
  { name: "TOTAL IGST COLL. AMOUNT", uid: "totalIgstCollectedAmount" },
  { name: "TOTAL IGST COLL. AMOUNT", uid: "totalSgstCollectedAmount" },
  { name: "TOTAL CGST COLL. AMOUNT", uid: "totalCgstCollectedAmount" },
];

export function capitalize(s) {
  return s ? s.charAt(0).toUpperCase() + s.slice(1).toLowerCase() : "";
}

const INITIAL_VISIBLE_COLUMNS = [
  //   "date",
  "totalInvoices",
  "totalRevenue",
  "totalNetRevenue",
  "totalGstCollected",
  "averageInvoiceValue",
  "totalUnbilledAmount",
  "totalReceivedAmount",
  "totalOutstandingAmount",
  "totalIgstCollectedAmount",
  "totalSgstCollectedAmount",
  "totalCgstCollectedAmount",
];

const Taxation = () => {
  const dispatch = useDispatch();
  const { userId } = useParams();
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const statusModal = useDisclosure();
  const viewModal = useDisclosure();
  const data = useSelector((state) => state.account.invoiceReport);
  const count = useSelector((state) => state.account.invoiceReport)?.length;
  const invoiceDetail = useSelector((state) => state.account.unbilledDetail);
  const [filterValue, setFilterValue] = React.useState("");
  const [selectedKeys, setSelectedKeys] = React.useState(new Set([]));
  const [visibleColumns, setVisibleColumns] = React.useState(
    new Set(INITIAL_VISIBLE_COLUMNS),
  );
  const [rowsPerPage, setRowsPerPage] = React.useState(50);
  const [sortDescriptor, setSortDescriptor] = React.useState({
    column: "age",
    direction: "ascending",
  });
  const [page, setPage] = React.useState(1);
  const hasSearchFilter = Boolean(filterValue);
  const [rowItem, setRowItem] = useState(null);
  const [status, setStatus] = useState("PENDING_APPROVAL");
  const [updatedStatusData, setUpdatedStatusData] = useState({
    approverUserId: userId,
    approvalRemarks: "",
    rejectionReason: "",
  });
  const [isAdvanceInvoice, setIsAdvanceInvoice] = useState(false);
  const [searchBy, setSearchBy] = useState("companyName");
  const [estimateDetail, setEstimateDetail] = useState(null);
  const [viewType, setViewType] = useState("ESTIMATE");

  useEffect(() => {
    dispatch(getAllInvoiceReport({}));
  }, [dispatch, page, rowsPerPage, status]);

  const headerColumns = React.useMemo(() => {
    if (visibleColumns === "all") return columns;

    return columns.filter((column) =>
      Array.from(visibleColumns).includes(column.uid),
    );
  }, [visibleColumns]);

  const filteredItems = React.useMemo(() => {
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

  const pages = Math.ceil(count / rowsPerPage) || 1;

  const sortedItems = React.useMemo(() => {
    return [...filteredItems];
  }, [filteredItems]);

  const handleViewEstimate = (rowData, type) => {
    setViewType(type);
    dispatch(getEstimateByEstimateId({ estimateId: rowData?.id, userId }))
      .then((resp) => {
        if (resp.meta.requestStatus === "fulfilled") {
          let data = resp?.payload;
          setEstimateDetail(data);
          viewModal.onOpen();
        } else {
          addToast({
            title: "There is Some Issue in estimate",
            color: "danger",
          });
        }
      })
      .catch(() =>
        addToast({ title: "There is Some Issue in estimate", color: "danger" }),
      );
  };

  const renderCell = React.useCallback((rowData, columnKey) => {
    const cellValue = rowData[columnKey];
    switch (columnKey) {
      case "date":
        return (
          <div>
            <p className="text-sm capitalize">
              {dayjs(rowData?.date).format("DD-MM-YYYY")}
            </p>
            <Chip size="sm">{rowData?.status}</Chip>
          </div>
        );
      case "totalInvoices":
        return (
          <div>
            <p
              className="capitalize text-xs font-medium"
              //   onClick={() => handleViewEstimate(rowData, "ESTIMATE")}
            >
              {rowData?.totalInvoices || "NA"}
            </p>
          </div>
        );
      case "totalRevenue":
        return (
          <p className="text-sm capitalize">
            {`${inrCurrency(rowData?.totalRevenue)}`}
          </p>
        );
      case "totalNetRevenue":
        return (
          <p className="text-sm capitalize">
            {`${inrCurrency(rowData?.totalNetRevenue)}`}
          </p>
        );
      case "totalGstCollected":
        return (
          <p className="text-sm capitalize">
            {inrCurrency(rowData?.totalGstCollected)}
          </p>
        );
      case "averageInvoiceValue":
        return (
          <div className="flex flex-col gap-2">
            <p className="text-sm capitalize">
              {inrCurrency(rowData?.averageInvoiceValue)}
            </p>
          </div>
        );
      case "totalUnbilledAmount":
        return (
          <p className="text-sm capitalize">
            {inrCurrency(rowData?.totalUnbilledAmount)}
          </p>
        );
      case "totalReceivedAmount":
        return (
          <p className="text-sm capitalize">
            {inrCurrency(rowData?.totalReceivedAmount)}
          </p>
        );
      case "currentReceivedAmount":
        return (
          <p className="text-sm capitalize">
            {inrCurrency(rowData?.currentReceivedAmount)}
          </p>
        );
      case "totalOutstandingAmount":
        return (
          <p className="text-sm capitalize">
            {inrCurrency(rowData?.totalOutstandingAmount)}
          </p>
        );
      case "totalIgstCollectedAmount":
        return (
          <p className="text-sm capitalize">
            {inrCurrency(rowData?.totalIgstCollectedAmount)}
          </p>
        );
      case "totalSgstCollectedAmount":
        return (
          <p className="text-sm capitalize">
            {inrCurrency(rowData?.totalSgstCollectedAmount)}
          </p>
        );
      case "totalCgstCollectedAmount":
        return (
          <p className="text-sm capitalize">
            {inrCurrency(rowData?.totalCgstCollectedAmount)}
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
                {!rowData?.advanceInvoiceFlag && (
                  <DropdownItem
                    key="view"
                    onPress={() => {
                      dispatch(
                        convertUnbillToAdvanceInvoice({
                          unbilledId: rowData?.id,
                          userId,
                        }),
                      )
                        .then((resp) => {
                          if (resp.meta.requestStatus === "fulfilled") {
                            addToast({
                              title:
                                "Unbill converted to advance invoice successfully !.",
                              color: "success",
                            });
                            dispatch(
                              getAllUnbillList({
                                page,
                                size: rowsPerPage,
                                userId,
                                status,
                              }),
                            );
                            dispatch(getAllUnbillCount({ userId, status }));
                          } else {
                            addToast({
                              title:
                                resp?.payload?.data?.message ||
                                "Something went wrong !.",
                              color: "danger",
                            });
                          }
                        })
                        .catch(() => {
                          addToast({
                            title: "Something went wrong !.",
                            color: "danger",
                          });
                        });
                    }}
                  >
                    Convert To AdvanceInvoice
                  </DropdownItem>
                )}

                <DropdownItem
                  key="unbilledview"
                  onPress={() => {
                    setIsAdvanceInvoice(false);
                    onOpen();
                    dispatch(
                      getUnBilledDetailById({ id: rowData?.id, userId }),
                    );
                  }}
                >
                  Unbilled View
                </DropdownItem>
                <DropdownItem
                  key="advanceinvoiceview"
                  onPress={() => {
                    setIsAdvanceInvoice(true);
                    onOpen();
                    dispatch(
                      getUnBilledDetailById({ id: rowData?.id, userId }),
                    );
                  }}
                >
                  Advance Invoice View
                </DropdownItem>
                <DropdownItem
                  key="status"
                  onPress={() => {
                    statusModal.onOpen();
                    setRowItem(rowData);
                  }}
                >
                  Update status
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

  const onSearchChange = React.useCallback(
    (value) => {
      if (value) {
        setFilterValue(value);
        if (searchBy === "companyName") {
          dispatch(
            searchUnbilledByCompanyNameAndUnbilled({
              page,
              size: rowsPerPage,
              companyName: value,
            }),
          );
        } else if (searchBy === "unbilledNumber") {
          dispatch(
            searchUnbilledByCompanyNameAndUnbilled({
              page,
              size: rowsPerPage,
              unbilledNumber: value,
            }),
          );
        }
        setPage(1);
      } else {
        setFilterValue("");
        dispatch(getAllUnbillList({ page, size: rowsPerPage, userId, status }));
        dispatch(getAllUnbillCount({ userId, status }));
      }
    },
    [searchBy, rowsPerPage, page, status, userId],
  );

  const onClear = React.useCallback(() => {
    setFilterValue("");
    setPage(1);
  }, [searchBy]);

  const handleUpdateStatus = () => {
    if (updatedStatusData?.approvalRemarks === "CANCELLED") {
      dispatch(
        cancelUnBilledInvoice({
          id: rowItem?.id,
          userId,
          reason: updatedStatusData?.rejectionReason,
        }),
      )
        .then((re) => {
          if (re.meta.requestStatus === "fulfilled") {
            addToast({
              title: "Unbill canceled successfully !.",
              color: "success",
            });
            dispatch(cancelProjectByUnbilledNumberInOperations(rowItem?.id))
              .then((respData) => {
                if (respData.meta.requestStatus === "fulfilled") {
                  addToast({
                    title: "Unbill canceled successfully in Operation !.",
                    color: "success",
                  });
                  setRowItem(null);
                  setUpdatedStatusData({
                    approverUserId: userId,
                    approvalRemarks: "",
                    rejectionReason: "",
                  });
                  statusModal.onClose();
                } else {
                  addToast({
                    title: respData?.payload?.data?.message,
                    color: "danger",
                  });
                }
              })
              .catch(() =>
                addToast({
                  title: "Something went wrong in Operation !.",
                  color: "danger",
                }),
              );
          } else {
            addToast({ title: re?.payload?.data?.message, color: "danger" });
          }
        })
        .catch(() =>
          addToast({ title: "Something went wrong !.", color: "danger" }),
        );
    } else {
      dispatch(
        updateStatusForUnbill({
          unbilledId: rowItem?.id,
          data: updatedStatusData,
        }),
      )
        .then((resp) => {
          if (resp.meta.requestStatus === "fulfilled") {
            addToast({
              title: "Status updated successfully !.",
              color: "success",
            });
            // dispatch(
            //   createProjectsForOperations({
            //     ...resp?.payload,
            //     unitId: resp?.payload?.companyUnitId,
            //   }),
            // ).then((pro) => {
            //   if (pro.meta.requestStatus === "fulfilled") {
            //     addToast({
            //       title: "Project created successfully !.",
            //       color: "success",
            //     });
            //   } else {
            //     addToast({ title: "Something went wrong !.", color: "danger" });
            //   }
            // });
            setRowItem(null);
            setUpdatedStatusData({
              approverUserId: userId,
              approvalRemarks: "",
              rejectionReason: "",
            });
            statusModal.onClose();
          } else {
            addToast({ title: resp?.payload?.data?.message, color: "danger" });
          }
        })
        .catch(() =>
          addToast({ title: "Something went wrong !.", color: "danger" }),
        );
    }
  };

  const topContent = React.useMemo(() => {
    return (
      <div className="flex flex-col gap-4">
        <div className="flex justify-between gap-3 items-end">
          <div className="flex items-center gap-0.5 w-[70%]">
            {/* <Select
              className="max-w-[20%]"
              selectionMode="single"
              selectedKeys={[searchBy]}
              onSelectionChange={(e) => {
                let key = Array.from(e)[0];
                setSearchBy(key);
              }}
            >
              <SelectItem key={"companyName"}>Company name</SelectItem>
              <SelectItem key={"unbilledNumber"}>Unbilled number</SelectItem>
            </Select> */}
            <Input
              isClearable
              className="w-full sm:max-w-[45%]"
              placeholder="Search ..."
              startContent={<Search />}
              value={filterValue}
              onClear={() => onClear()}
              onValueChange={onSearchChange}
            />
          </div>
          <div className="flex gap-3">
            {/* <Dropdown>
              <DropdownTrigger>
                <Button
                  className="capitalize"
                  variant="flat"
                  endContent={<ChevronDown />}
                >
                  {status}
                </Button>
              </DropdownTrigger>
              <DropdownMenu
                disallowEmptySelection
                aria-label="Single selection example"
                selectedKeys={[status]}
                selectionMode="single"
                variant="flat"
                onSelectionChange={(e) => {
                  let key = Array.from(e)[0];
                  setStatus(key);
                }}
              >
                <DropdownItem key="PENDING_APPROVAL">
                  PENDING_APPROVAL
                </DropdownItem>
                <DropdownItem key="APPROVED">APPROVED</DropdownItem>
                <DropdownItem key="REJECTED">REJECTED</DropdownItem>
                <DropdownItem key="CANCELLED">CANCELLED</DropdownItem>
              </DropdownMenu>
            </Dropdown> */}
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
            Total {count} taxation items
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
      <h1 className="font-sans text-2xl font-medium mb-1">Taxation list</h1>
      <Table
        isHeaderSticky
        aria-label="Example table with custom cells, pagination and sorting"
        bottomContent={bottomContent}
        bottomContentPlacement="outside"
        classNames={{
          wrapper: "max-h-[65vh] overflow-scroll w-full",
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
            <TableRow key={`${item?.id}unbill`}>
              {(columnKey) => (
                <TableCell>{renderCell(item, columnKey)}</TableCell>
              )}
            </TableRow>
          )}
        </TableBody>
      </Table>
      <Modal
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        size="4xl"
        placement="top-center"
        backdrop="blur"
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                {isAdvanceInvoice ? "Advance Invoice" : "Unbill"}
              </ModalHeader>
              <ModalBody className="max-h-[75vh] overflow-auto">
                <UnbilledView
                  invoiceData={invoiceDetail}
                  heading={isAdvanceInvoice ? "Advance Invoice" : "Unbill"}
                />
              </ModalBody>
              <ModalFooter>
                <Button
                  color="danger"
                  variant="light"
                  onPress={() => {
                    onClose();
                    setIsAdvanceInvoice(false);
                  }}
                >
                  Close
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
      <Modal
        isOpen={statusModal.isOpen}
        onOpenChange={statusModal.onOpenChange}
        placement="top-center"
        backdrop="blur"
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                Update Status
              </ModalHeader>
              <ModalBody className="max-h-[85vh] overflow-auto">
                <Select
                  label="Select status"
                  isRequired
                  selectedKeys={[updatedStatusData?.approvalRemarks]}
                  onSelectionChange={(e) => {
                    let key = Array.from(e)[0];
                    setUpdatedStatusData((prev) => ({
                      ...prev,
                      approvalRemarks: key,
                    }));
                  }}
                >
                  {[
                    // { key: "PENDING_APPROVAL", label: "PENDING_APPROVAL" },
                    { key: "APPROVED", label: "APPROVED" },
                    // { key: "PARTIALLY_PAID", label: "PARTIALLY_PAID" },
                    // { key: "FULLY_PAID", label: "FULLY_PAID" },
                    { key: "REJECTED", label: "REJECTED" },
                    { key: "CANCELLED", label: "CANCELLED" },
                  ].map((item) => (
                    <SelectItem key={item.key}>{item.label}</SelectItem>
                  ))}
                </Select>
                {(updatedStatusData?.approvalRemarks === "REJECTED" ||
                  updatedStatusData?.approvalRemarks === "CANCELLED") && (
                  <Textarea
                    label="Remark"
                    isRequired
                    value={updatedStatusData?.rejectionReason}
                    onChange={(e) =>
                      setUpdatedStatusData((prev) => ({
                        ...prev,
                        rejectionReason: e.target.value,
                      }))
                    }
                  />
                )}
              </ModalBody>
              <ModalFooter>
                <Button color="danger" variant="light" onPress={onClose}>
                  Close
                </Button>
                <Button color="primary" onPress={handleUpdateStatus}>
                  Submit
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      <Modal
        size="4xl"
        isDismissable={false}
        isKeyboardDismissDisabled={true}
        isOpen={viewModal.isOpen}
        onOpenChange={viewModal.onOpenChange}
        placement="top-center"
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalBody className="max-h-[70vh] overflow-auto">
                <NewEstimatePreview
                  details={estimateDetail}
                  viewType={viewType}
                />
              </ModalBody>
              <ModalFooter className="flex justify-end">
                <Button onPress={onClose}>Cancel</Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
};

export default Taxation;
