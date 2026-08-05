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
  Select,
  SelectItem,
  ModalFooter,
  Spinner,
} from "@heroui/react";
import { ChevronDown, EllipsisVertical, Search } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import {
  getAllInvoice,
  getAllInvoiceCount,
  searchInvoiceByCompanyNameAndInvoice,
  searchInvoiceCountByCompanyNameAndInvoice,
} from "../../toolkit/slices/organizationSlice";
import dayjs from "dayjs";
import { useParams } from "react-router-dom";
import { inrCurrency } from "../../common";
import {
  getInvoiceDetailById,
  confirmEInvoice,
} from "../../toolkit/slices/accountSlice";
import TaxInvoice from "../../components/TaxInvoice";
import NewEstimatePreview from "../../sales/leads/leadEstimate/NewEstimatePreview";
import FileUploader from "../../components/FileUploader";
import { getEstimateByEstimateId } from "../../toolkit/slices/leadSlice";

export const columns = [
  { name: "DATE", uid: "date" },
  { name: "INVOICE NO.", uid: "invoiceNo" },
  { name: "ESTIMATE NUMBER", uid: "estimateNumber" },
  { name: "SERVICE", uid: "service" },
  { name: "CLIENT", uid: "clientName" },
  { name: "COMPANY", uid: "companyName" },
  { name: "PAYMENT TERM", uid: "paymentTypeCode" },
  { name: "TXN. AMOUNT", uid: "txnAmount" },
  { name: "ADDED BY", uid: "addedBy" },
  { name: "ACTIONS", uid: "actions" },
];

export function capitalize(s) {
  return s ? s.charAt(0)?.toUpperCase() + s.slice(1)?.toLowerCase() : "";
}

const INITIAL_VISIBLE_COLUMNS = [
  "date",
  "invoiceNo",
  "estimateNumber",
  "service",
  "clientName",
  "companyName",
  "paymentTypeCode",
  "txnAmount",
  "addedBy",
  "actions",
];

const AllInvoice = () => {
  const dispatch = useDispatch();
  const { userId } = useParams();

  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const viewModal = useDisclosure();
  const confirmEInvoiceModal = useDisclosure();

  const data = useSelector((state) => state.organization.allInvoiceList);
  const count = useSelector(
    (state) => state.organization.allInvoiceList?.length,
  );

  const [isConfirmEInvoiceSubmitting, setIsConfirmEInvoiceSubmitting] =
    useState(false);

  const [invoiceDetail, setInvoiceDetail] = useState(null);
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
  const [status, setStatus] = useState("GENERATED");
  const [searchFilters, setSearchFilters] = useState({
    searchText: "",
    type: "invoiceNumber",
  });
  const [estimateDetail, setEstimateDetail] = useState(null);
  const [viewType, setViewType] = useState("ESTIMATE");

  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [isAttachmentUploading, setIsAttachmentUploading] = useState(false);

  const [confirmEInvoiceForm, setConfirmEInvoiceForm] = useState({
    remarks: "",
    einvoiceAttachmentUrl: "",
    einvoiceAckDate: "",
    einvoiceIrn: "",
    einvoiceAckNo: "",
  });

  useEffect(() => {
    dispatch(getAllInvoice({ userId, page, size: rowsPerPage, status }));
    dispatch(getAllInvoiceCount({ userId, status }));
  }, [dispatch, userId, page, rowsPerPage, status]);

  const handleConfirmFormChange = (field, value) => {
    setConfirmEInvoiceForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const openConfirmEInvoiceModal = (rowData) => {
    setSelectedInvoice(rowData);
    setIsAttachmentUploading(false);

    setConfirmEInvoiceForm({
      remarks: "",
      einvoiceAttachmentUrl: "",
      einvoiceAckDate: dayjs().format("YYYY-MM-DDTHH:mm"),
      einvoiceIrn: "",
      einvoiceAckNo: "",
    });

    confirmEInvoiceModal.onOpen();
  };

  const handleSubmitConfirmEInvoice = async () => {
    if (isConfirmEInvoiceSubmitting) return;

    if (!selectedInvoice?.id) {
      addToast({
        title: "ERROR",
        description: "Invoice not selected",
        color: "danger",
      });
      return;
    }

    if (isAttachmentUploading) {
      addToast({
        title: "Wait ...",
        description: "Please wait while the attachment is being uploaded",
        color: "warning",
      });
      return;
    }

    if (
      !confirmEInvoiceForm.einvoiceAttachmentUrl ||
      !confirmEInvoiceForm.einvoiceAckDate ||
      !confirmEInvoiceForm.einvoiceIrn ||
      !confirmEInvoiceForm.einvoiceAckNo
    ) {
      addToast({
        title: "ERROR",
        description: "Please fill all required E-Invoice fields",
        color: "danger",
      });
      return;
    }

    const payload = {
      userId: Number(userId),
      remarks: confirmEInvoiceForm.remarks,
      einvoiceAttachmentUrl: confirmEInvoiceForm.einvoiceAttachmentUrl,
      einvoiceAckDate: new Date(
        confirmEInvoiceForm.einvoiceAckDate,
      ).toISOString(),
      einvoiceIrn: confirmEInvoiceForm.einvoiceIrn,
      einvoiceAckNo: confirmEInvoiceForm.einvoiceAckNo,
    };

    setIsConfirmEInvoiceSubmitting(true);

    try {
      await dispatch(
        confirmEInvoice({
          invoiceId: selectedInvoice.id,
          data: payload,
        }),
      ).unwrap();

      addToast({
        title: "SUCCESS",
        description: "E-Invoice confirmed successfully",
        color: "success",
      });

      confirmEInvoiceModal.onClose();
      setSelectedInvoice(null);
      setIsAttachmentUploading(false);

      dispatch(getAllInvoice({ userId, page, size: rowsPerPage, status }));
      dispatch(getAllInvoiceCount({ userId, status }));
    } catch (error) {
      addToast({
        title: "ERROR",
        description: "Failed to confirm E-Invoice",
        color: "danger",
      });
    } finally {
      setIsConfirmEInvoiceSubmitting(false);
    }
  };

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
  }, [data, filterValue, hasSearchFilter]);

  const pages = Math.ceil(count / rowsPerPage) || 1;

  const sortedItems = React.useMemo(() => {
    return [...filteredItems].sort((a, b) => {
      const first = a[sortDescriptor.column];
      const second = b[sortDescriptor.column];
      const cmp = first < second ? -1 : first > second ? 1 : 0;

      return sortDescriptor.direction === "descending" ? -cmp : cmp;
    });
  }, [sortDescriptor, filteredItems]);

  const handleViewTaxInvoice = (value) => {
    dispatch(getInvoiceDetailById({ id: value?.id, userId }))
      .then((resp) => {
        if (resp.meta.requestStatus === "fulfilled") {
          let tempData = resp?.payload;
          setInvoiceDetail(tempData);
          onOpen();
        } else {
          addToast({
            title: "ERROR",
            description: "There is Some Issue in Invoice",
            color: "danger",
          });
          onOpen();
        }
      })
      .catch(() =>
        addToast({
          title: "ERROR",
          description: "There is Some Issue in Invoice",
          color: "danger",
        }),
      );
  };

  const handleViewEstimate = (rowData, type) => {
    setViewType(type);
    dispatch(
      getEstimateByEstimateId({ estimateId: rowData?.estimateId, userId }),
    )
      .then((resp) => {
        if (resp.meta.requestStatus === "fulfilled") {
          let data = resp?.payload;
          setEstimateDetail(data);
          viewModal.onOpen();
        } else {
          addToast({
            title: "ERROR",
            description: "There is Some Issue in estimate",
            color: "danger",
          });
        }
      })
      .catch(() =>
        addToast({
          title: "ERROR",
          description: "There is Some Issue in estimate",
          color: "danger",
        }),
      );
  };

  const renderCell = React.useCallback(
    (rowData, columnKey) => {
      const cellValue = rowData[columnKey];

      switch (columnKey) {
        case "date":
          return (
            <p className="text-[12.5px] capitalize">
              {dayjs(rowData?.invoiceDate).format("DD-MM-YYYY")}
            </p>
          );

        case "invoiceNo":
          return (
            <div className="flex flex-col gap-1">
              <p
                className="capitalize text-[12.5px] font-medium text-blue-600 cursor-pointer"
                onClick={() => handleViewTaxInvoice(rowData)}
              >
                {rowData?.invoiceNumber}
              </p>
            </div>
          );

        case "estimateNumber":
          return (
            <div>
              <p
                className="capitalize text-[12.5px] font-medium text-blue-600 cursor-pointer"
                onClick={() => handleViewEstimate(rowData, "ESTIMATE")}
              >
                {rowData?.estimateNumber || "NA"}
              </p>
            </div>
          );

        case "service":
          return (
            <p className="text-[12.5px] capitalize">{rowData?.solutionName}</p>
          );

        case "clientName":
          return (
            <p className="text-[12.5px] capitalize">{rowData?.contactName}</p>
          );

        case "companyName":
          return (
            <p className="text-[12.5px] capitalize">{rowData?.companyName}</p>
          );

        case "txnAmount":
          return (
            <div className="flex flex-col gap-1">
              <p className="text-[12.5px] capitalize">
                {inrCurrency(rowData?.grandTotal)}
              </p>
              <div className="flex gap-1.5">
                <span className="text-default-500 text-[11.5px]">GST</span>
                <span className="text-default-500 text-[11.5px]">:</span>
                <span className="text-default-500 text-[11.5px]">
                  {inrCurrency(rowData?.totalGstAmount)}
                </span>
              </div>
            </div>
          );

        case "addedBy":
          return (
            <p className="text-[12.5px] capitalize">{rowData?.createdByName}</p>
          );

        case "actions":
          return (
            <div className="relative flex justify-center items-center gap-2">
              <Dropdown>
                <DropdownTrigger>
                  <Button isIconOnly size="sm" variant="light">
                    <EllipsisVertical className="w-4 h-4 text-default-300" />
                  </Button>
                </DropdownTrigger>

                <DropdownMenu
                  selectionMode="single"
                  onSelectionChange={(e) => {
                    let key = Array.from(e)[0];

                    if (key === "viewTaxInvoice") {
                      handleViewTaxInvoice(rowData);
                    }

                    if (key === "viewEstimate") {
                      handleViewEstimate(rowData, "ESTIMATE");
                    }

                    if (key === "confirmEInvoice") {
                      openConfirmEInvoiceModal(rowData);
                    }
                  }}
                >
                  <DropdownItem key="viewTaxInvoice">Tax Invoice</DropdownItem>
                  <DropdownItem key="viewEstimate">Estimate</DropdownItem>
                  {!(
                    rowData?.status?.toLowerCase() === "e_invoice_confirmed" ||
                    rowData?.gstRegistrationType?.toLowerCase() ===
                      "international" ||
                    rowData?.gstRegistrationType?.toLowerCase() ===
                      "unregistered"
                  ) && (
                    <DropdownItem key="confirmEInvoice">
                      Confirm E Invoice
                    </DropdownItem>
                  )}
                </DropdownMenu>
              </Dropdown>
            </div>
          );

        default:
          return cellValue;
      }
    },
    [userId],
  );

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
        setPage(1);

        dispatch(
          searchInvoiceByCompanyNameAndInvoice({
            ...searchFilters,
            searchText: value,
            page: 1,
            size: rowsPerPage,
          }),
        );

        dispatch(
          searchInvoiceCountByCompanyNameAndInvoice({
            ...searchFilters,
            searchText: value,
          }),
        );
      } else {
        setFilterValue("");
        setPage(1);

        dispatch(getAllInvoice({ userId, page: 1, size: rowsPerPage, status }));
        dispatch(getAllInvoiceCount({ userId, status }));
      }
    },
    [dispatch, searchFilters, rowsPerPage, userId, status],
  );

  const onClear = React.useCallback(() => {
    setFilterValue("");
    setPage(1);

    dispatch(getAllInvoice({ userId, page: 1, size: rowsPerPage, status }));
    dispatch(getAllInvoiceCount({ userId, status }));
  }, [dispatch, userId, rowsPerPage, status]);

  const topContent = React.useMemo(() => {
    return (
      <div className="flex flex-col gap-2">
        <div className="flex justify-between gap-2 items-center flex-wrap">
          <div className="flex items-center gap-1.5 w-full sm:max-w-[360px]">
            <Select
              size="sm"
              className="max-w-[130px] shrink-0"
              selectionMode="single"
              selectedKeys={[searchFilters?.type]}
              onSelectionChange={(e) => {
                let key = Array.from(e)[0];
                setSearchFilters((preview) => ({ ...preview, type: key }));
              }}
            >
              <SelectItem key={"invoiceNumber"}>Invoice number</SelectItem>
              <SelectItem key={"companyName"}>Company name</SelectItem>
            </Select>

            <Input
              isClearable
              size="sm"
              className="w-full"
              classNames={{ inputWrapper: "h-8 min-h-8" }}
              placeholder="Search ..."
              startContent={<Search className="w-4 h-4 text-default-400" />}
              value={filterValue}
              onClear={() => onClear()}
              onValueChange={onSearchChange}
            />
          </div>

          <div className="flex gap-1.5 flex-wrap">
            <Dropdown>
              <DropdownTrigger>
                <Button
                  className="capitalize"
                  variant="flat"
                  endContent={<ChevronDown className="w-3.5 h-3.5" />}
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
                  setPage(1);
                }}
              >
                <DropdownItem key="GENERATED">GENERATED</DropdownItem>
                <DropdownItem key="SENT_TO_CLIENT">SENT TO CLIENT</DropdownItem>
                <DropdownItem key="VIEWED">VIEWED</DropdownItem>
                <DropdownItem key="PAID">PAID</DropdownItem>
                <DropdownItem key="UNPAID">UNPAID</DropdownItem>
                <DropdownItem key="PARTIALLY_PAID">PARTIALLY_PAID</DropdownItem>
                <DropdownItem key="FINALIZED_WITHOUT_E_INVOICE">
                  FINALIZED WITHOUT E INVOICE
                </DropdownItem>
                <DropdownItem key="CANCELLED">CANCELLED</DropdownItem>
                <DropdownItem key="CREDIT_NOTED">CREDIT NOTED</DropdownItem>
                <DropdownItem key="E_INVOICE_CONFIRMED">
                  E_INVOICE_CONFIRMED
                </DropdownItem>
              </DropdownMenu>
            </Dropdown>

            <Dropdown>
              <DropdownTrigger>
                <Button
                  endContent={<ChevronDown className="w-3.5 h-3.5" />}
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
          <span className="text-default-400 text-[12.5px]">
            Total {count} invoice
          </span>

          <label className="flex items-center gap-1 text-default-400 text-[12.5px]">
            Rows per page:
            <select
              className="bg-transparent outline-hidden text-default-400 text-[12.5px] cursor-pointer"
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
    onClear,
    status,
    searchFilters,
  ]);

  const bottomContent = React.useMemo(() => {
    return (
      <div className="py-1.5 px-1 flex justify-between items-center">
        <span className="w-[30%] text-[12.5px] text-default-400">
          {selectedKeys === "all"
            ? "All items selected"
            : `${selectedKeys.size} of ${count} selected`}
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
  }, [selectedKeys, count, page, pages, onPreviousPage, onNextPage]);

  return (
    <div className="flex flex-col gap-2">
      {isConfirmEInvoiceSubmitting && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/35 backdrop-blur-sm"
          role="status"
          aria-live="assertive"
          aria-label="Confirming E-Invoice"
        >
          <div className="flex min-w-[240px] flex-col items-center gap-4 rounded-2xl bg-background px-8 py-7 shadow-2xl">
            <Spinner size="lg" color="primary" />

            <div className="text-center">
              <p className="text-base font-semibold text-foreground">
                Confirming E-Invoice
              </p>
              <p className="mt-1 text-sm text-default-500">
                Please do not refresh or close this page.
              </p>
            </div>
          </div>
        </div>
      )}

      <h1 className="font-sans text-lg font-semibold mb-2 shrink-0">
        Invoice list
      </h1>

      <Table
        isHeaderSticky
        removeWrapper={false}
        aria-label="All invoice table with custom cells, pagination and sorting"
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
          <ModalHeader>Tax Invoice</ModalHeader>
          <ModalBody className="max-h-[90vh] overflow-auto">
            <TaxInvoice invoiceData={invoiceDetail} />
          </ModalBody>
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

      <Modal
        size="2xl"
        isDismissable={false}
        isKeyboardDismissDisabled={true}
        isOpen={confirmEInvoiceModal.isOpen}
        onOpenChange={confirmEInvoiceModal.onOpenChange}
        placement="top-center"
        scrollBehavior="inside"
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader>Confirm E Invoice</ModalHeader>

              <ModalBody className="max-h-[70vh] overflow-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Invoice Number"
                    value={selectedInvoice?.invoiceNumber || ""}
                    isReadOnly
                  />

                  <Input
                    label="User ID"
                    value={String(userId || "")}
                    isReadOnly
                  />

                  <Input
                    label="E-Invoice ACK Date"
                    type="datetime-local"
                    isRequired
                    value={confirmEInvoiceForm.einvoiceAckDate}
                    onValueChange={(value) =>
                      handleConfirmFormChange("einvoiceAckDate", value)
                    }
                  />

                  <Input
                    label="E-Invoice ACK No"
                    isRequired
                    value={confirmEInvoiceForm.einvoiceAckNo}
                    onValueChange={(value) =>
                      handleConfirmFormChange("einvoiceAckNo", value)
                    }
                  />

                  <Input
                    label="E-Invoice IRN"
                    isRequired
                    className="md:col-span-2"
                    value={confirmEInvoiceForm.einvoiceIrn}
                    onValueChange={(value) =>
                      handleConfirmFormChange("einvoiceIrn", value)
                    }
                  />

                  <div className="md:col-span-2">
                    <FileUploader
                      label="E-Invoice Attachment"
                      isRequired
                      value={confirmEInvoiceForm.einvoiceAttachmentUrl}
                      uploadingType="single"
                      placeholder="Upload E-Invoice attachment"
                      onUploadingChange={setIsAttachmentUploading}
                      onChange={(uploadedUrl) =>
                        handleConfirmFormChange(
                          "einvoiceAttachmentUrl",
                          uploadedUrl,
                        )
                      }
                    />
                  </div>

                  <Input
                    label="Remarks"
                    className="md:col-span-2"
                    value={confirmEInvoiceForm.remarks}
                    onValueChange={(value) =>
                      handleConfirmFormChange("remarks", value)
                    }
                  />
                </div>
              </ModalBody>

              <ModalFooter>
                <Button variant="flat" onPress={onClose}>
                  Cancel
                </Button>

                <Button
                  color="primary"
                  isDisabled={
                    isAttachmentUploading || isConfirmEInvoiceSubmitting
                  }
                  onPress={handleSubmitConfirmEInvoice}
                >
                  {isAttachmentUploading ? "Uploading..." : "Confirm E Invoice"}
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
};

export default AllInvoice;
