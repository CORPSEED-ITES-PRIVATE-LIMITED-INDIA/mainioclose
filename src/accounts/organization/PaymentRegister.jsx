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
  addToast,
  useDisclosure,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
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
  getAllPaymentRegisterCount,
  getAllPaymentRegisterWithPagination,
  paymentRegisterAction,
} from "../../toolkit/slices/organizationSlice";
import dayjs from "dayjs";
import { inrCurrency } from "../../common";
import { getEstimateByLeadId } from "../../toolkit/slices/leadSlice";
import EstimateView from "../../components/EstimateView";
import { Link, useParams } from "react-router-dom";
import { updatePaymentForVendorPayment } from "../../toolkit/slices/vendorsSlice";
import InvoiceView from "../../components/InvoiceView";
import { getCompanyByUnitId } from "../../toolkit/slices/companySlice";

export const columns = [
  { name: "ID", uid: "id" },
  { name: "DATE", uid: "date" },
  { name: "ESTIMATE", uid: "estimateNo" },
  { name: "CLIENT", uid: "client" },
  { name: "COMPANY NAME", uid: "companyName" },
  { name: "ORDERS AMOUNTS", uid: "orderAmounts" },
  { name: "PAYMENT AMOUNTS", uid: "paymentAmounts" },
  { name: "TDS", uid: "tds" },
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
  "status",
  "tds",
  "actions",
];

const PaymentRegister = () => {
  const dispatch = useDispatch();
  const { userId } = useParams();
  const drawer = useDisclosure();
  const estimateModal = useDisclosure();
  const paymentModal = useDisclosure();
  const paymentAction = useDisclosure();
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
    column: "id",
    direction: "ascending",
  });
  const [status, setStatus] = useState("all");
  const [page, setPage] = React.useState(1);
  const [rowItem, setRowItem] = useState(null);
  const [estimateDetails, setEstimateDetails] = useState(null);
  const [companyDetails, setCompanyDetails] = useState(null);
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

  const sortedItems = React.useMemo(() => {
    return [...filteredItems].sort((a, b) => {
      const first = a[sortDescriptor.column];
      const second = b[sortDescriptor.column];
      const cmp = first < second ? -1 : first > second ? 1 : 0;
      return sortDescriptor.direction === "descending" ? -cmp : cmp;
    });
  }, [sortDescriptor, filteredItems]);

  const handleViewEstimate = (rowData) => {
    if (rowData?.leadId) {
      setRowItem(rowData);
      dispatch(getEstimateByLeadId(rowData?.leadId))
        .then((resp) => {
          if (resp.meta.requestStatus === "fulfilled") {
            setEstimateDetails(resp.payload);
          } else {
            addToast({
              title: "Some issue in fetching estimate details",
              color: "danger",
            });
          }
        })
        .catch(() => {
          addToast({
            title: "Some issue in fetching estimate details",
            color: "danger",
          });
        });
      estimateModal.onOpen();
    } else {
      addToast({
        title: "Lead id is not present in payment register",
        color: "warning",
      });
    }
  };

  const handlePaymentAction = (rowData) => {
    setRowItem(rowData);
    dispatch(getEstimateByLeadId(rowData?.leadId))
      .then((resp) => {
        if (resp.meta.requestStatus === "fulfilled") {
          setEstimateDetails(resp.payload);
        } else {
          addToast({
            title: "Some issue in fetching estimate details",
            color: "danger",
          });
        }
      })
      .catch(() => {
        addToast({
          title: "Some issue in fetching estimate details",
          color: "danger",
        });
      });
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
          if (rowItem?.productType === "Product") {
            dispatch(
              updatePaymentForVendorPayment({
                userId: userId,
                status: paymentActionData?.status,
                estimateId: paymentActionData?.estimateId,
              })
            )
              .then((res) => {
                if (res.meta.requestStatus === "fulfilled") {
                  addToast({
                    title: "Request approved for vendor's payment",
                    color: "success",
                  });
                } else {
                  addToast({
                    title: "Something went wrong !.",
                    color: "danger",
                  });
                }
              })
              .catch(() =>
                addToast({ title: "Something went wrong !.", color: "danger" })
              );
          }
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
                  <span>{rowData?.contactEmails}</span>
                </div>
                <div className="flex gap-2 items-center">
                  <Phone className="w-4 h-4" />
                  <span>{rowData?.contactNo}</span>
                </div>
              </div>
            }
          >
            <p className="text-sm font-medium capitalize">
              {rowData?.contactName}
            </p>
          </Tooltip>
        );
      case "companyName":
        return (
          <p
            className="text-sm font-medium capitalize cursor-pointer"
            onClick={() => {
              drawer.onOpen();
              setRowItem(rowData);
              if (!rowData?.companyId) return;
              dispatch(getCompanyByUnitId(rowData?.companyId)).then((resp) => {
                if (resp.meta.requestStatus === "fulfilled") {
                  setCompanyDetails(resp.payload);
                }
              });
            }}
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
      case "tds":
        return (
          <div className="flex flex-col">
            <p className="text-sm font-medium capitalize">
              TDS % : {inrCurrency(rowData?.tdsPercent || 0)}
            </p>
            <p className="text-sm font-medium capitalize">
              Amount : {inrCurrency(rowData?.tdsAmount || 0)}
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
          wrapper: "max-h-[68vh] w-full",
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
            <TableRow key={item.id}>
              {(columnKey) => (
                <TableCell>{renderCell(item, columnKey)}</TableCell>
              )}
            </TableRow>
          )}
        </TableBody>
      </Table>
      <Drawer
        isOpen={drawer.isOpen}
        onOpenChange={(e) => {
          if (!e) {
            setCompanyDetails(null);
          }
          drawer.onOpenChange(e);
        }}
      >
        <DrawerContent>
          {(onClose) => (
            <>
              <DrawerHeader className="flex flex-col gap-1">
                Company details
              </DrawerHeader>
              <DrawerBody>
                {companyDetails?.companyName && (
                  <div className="flex items-center gap-2">
                    <Building2 />
                    <p className="text-lg font-medium">
                      {companyDetails?.companyName}
                    </p>
                  </div>
                )}

                {companyDetails?.companyAge && (
                  <div className="flex items-center gap-2">
                    <TrendingUp />
                    <p className="text-md text-default-500">
                      {companyDetails?.companyAge} yrs.
                    </p>
                  </div>
                )}

                {companyDetails?.address && (
                  <div className="flex items-start gap-2">
                    <MapPin />
                    <p className="text-medium">
                      {companyDetails?.address}{" "}
                      {[
                        companyDetails?.city,
                        companyDetails?.state,
                        companyDetails?.country,
                        companyDetails?.primaryPinCode,
                      ]
                        ?.filter(Boolean)
                        ?.join(",")}
                    </p>
                  </div>
                )}

                {companyDetails?.panNo && (
                  <div className="flex items-center gap-2">
                    <img
                      src={panIcon}
                      height={30}
                      width={40}
                      className="rounded-sm"
                    />
                    <p className="text-medium">{companyDetails?.panNo}</p>
                  </div>
                )}

                {companyDetails?.gstNo && (
                  <div className="flex items-center gap-2">
                    <img src={gstIcon} height={30} width={40} />
                    <p className="text-medium">{companyDetails?.gstNo}</p>
                  </div>
                )}
              </DrawerBody>
              <DrawerFooter>
                <Button variant="light" onPress={onClose}>
                  Close
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
              <ModalBody style={{ maxHeight: "70vh", overflow: "auto" }}>
                {/* <EstimateView details={rowItem} /> */}
                <InvoiceView
                  details={estimateDetails}
                  documentTypeName={"Estimate"}
                />
              </ModalBody>
              <ModalFooter>
                <Button variant="light" onPress={onClose}>
                  Close
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
                <div class="grid grid-cols-[repeat(5,_auto)_1fr] gap-0 max-w-full overflow-x-auto border border-gray-300 rounded-2xl">
                  {estimateDetails?.Type === "Product" ? (
                    <>
                      <div class="border-b border-r p-4">
                        <h4 className="text-small font-medium">Name</h4>
                        <p className="text-sm">
                          {estimateDetails?.productName}
                        </p>
                      </div>
                      <div class="border-b border-r p-4">
                        <h4 className="text-small font-medium">
                          Actual price{" "}
                        </h4>
                        <p className="text-sm">
                          {inrCurrency(estimateDetails?.actualPrice)}
                        </p>
                      </div>
                      <div class="border-b border-r p-4">
                        <h4 className="text-small font-medium">Quantity</h4>
                        <p className="text-sm">
                          {estimateDetails?.quantity} kg
                        </p>
                      </div>
                      <div class="border-b border-r p-4">
                        {" "}
                        <h4 className="text-small font-medium">GST</h4>
                        <p className="text-sm">{estimateDetails?.gst} %</p>
                      </div>
                      <div class="border-b border-r p-4">
                        {" "}
                        <h4 className="text-small font-medium">Total amount</h4>
                        <p className="text-sm">
                          {inrCurrency(estimateDetails?.totalPrice)}
                        </p>
                      </div>
                    </>
                  ) : (
                    <>
                      <div class="border-b border-r p-4">
                        <h4 className="text-small font-medium">Name</h4>
                        <p className="text-sm">
                          {estimateDetails?.productName}
                        </p>
                      </div>
                      <div class="border-b border-r p-4">
                        <h4 className="text-small font-medium">Fee</h4>
                        <p className="text-sm">
                          {inrCurrency(estimateDetails?.professionalFees)}
                        </p>
                      </div>

                      <div class="border-b border-r p-4">
                        {" "}
                        <h4 className="text-small font-medium">GST</h4>
                        <p className="text-sm">
                          {estimateDetails?.profesionalGst} %
                        </p>
                      </div>
                      <div class="border-b border-r p-4">
                        <h4 className="text-small font-medium">GST amount</h4>
                        <p className="text-sm">
                          {inrCurrency(
                            (Number(estimateDetails?.professionalFees) *
                              Number(estimateDetails?.profesionalGst)) /
                              100
                          )}{" "}
                        </p>
                      </div>
                      <div class="border-b border-r p-4">
                        {" "}
                        <h4 className="text-small font-medium">Total amount</h4>
                        <p className="text-sm">
                          {inrCurrency(estimateDetails?.totalAmount)}
                        </p>
                      </div>
                    </>
                  )}
                  <div class="border-b p-4 flex gap-1">
                    <Tooltip content="Attached document view">
                      <Link to={rowItem?.doc?.[0]?.filePath}>
                        <Button color="primary" variant="light" isIconOnly>
                          <FileText />
                        </Button>
                      </Link>
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
              </ModalBody>
              <ModalFooter>
                <Button variant="light" onPress={onClose}>
                  Close
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
                  label="Remark"
                  isRequired
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
                <Button
                  color="primary"
                  isDisabled={paymentActionData?.comment === ""}
                  onPress={handleSubmitPaymentAction}
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

export default PaymentRegister;
