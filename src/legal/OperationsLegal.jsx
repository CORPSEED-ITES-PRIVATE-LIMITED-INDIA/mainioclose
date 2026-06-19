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
  Card,
  CardBody,
} from "@heroui/react";
import {
  ChevronDown,
  EllipsisVertical,
  Search,
  FileText,
  ExternalLink,
} from "lucide-react";
import dayjs from "dayjs";
import { useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  getAllLegalSupportRequestsForFilter,
  updateLegalRequestStatus,
} from "../toolkit/slices/operationSlice";
import { statusColorCode } from "../common";

export const columns = [
  { name: "DATE", uid: "createdAt" },
  { name: "REQUEST TITLE", uid: "legalRequestTitle" },
  { name: "STATUS", uid: "status" },
  { name: "NOTES", uid: "notes" },
  { name: "RAISED BY", uid: "raisedBy" },
  { name: "DOCUMENTS", uid: "documents" },
  { name: "ACTIONS", uid: "actions" },
];
export function capitalize(s) {
  return s ? s.charAt(0).toUpperCase() + s.slice(1).toLowerCase() : "";
}

const INITIAL_VISIBLE_COLUMNS = [
  "createdAt",
  "legalRequestTitle",
  "status",
  "notes",
  "raisedBy",
  "documents",
  "actions",
];

const normalizeFileUrl = (url = "") => {
  const raw = String(url || "").trim();

  if (!raw) return "";

  if (raw.startsWith("http://") || raw.startsWith("https://")) {
    return raw;
  }

  return `https://${raw}`;
};

const isImageDocument = (doc) => {
  const fileType = String(doc?.fileType || "").toLowerCase();
  const fileName = String(doc?.fileName || "").toLowerCase();

  return (
    fileType.includes("image") ||
    ["png", "jpg", "jpeg", "webp", "gif"].some(
      (ext) => fileType === ext || fileName.endsWith(`.${ext}`),
    )
  );
};

const formatFileSize = (size) => {
  const fileSize = Number(size || 0);

  if (!fileSize) return "-";

  if (fileSize < 1024) return `${fileSize} B`;

  if (fileSize < 1024 * 1024) {
    return `${(fileSize / 1024).toFixed(2)} KB`;
  }

  return `${(fileSize / (1024 * 1024)).toFixed(2)} MB`;
};

const OperationsLegal = () => {
  const dispatch = useDispatch();
  const { userId } = useParams();
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const statusModal = useDisclosure();
  const viewModal = useDisclosure();
  const documentsModal = useDisclosure();
  const [selectedDocuments, setSelectedDocuments] = useState([]);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const data = useSelector((state) => state.operation.legalRequestList);
  const count = useSelector((state) => state.operation.legalRequestCount);
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
  const [status, setStatus] = useState("INITIATED");
  const [updatedStatusData, setUpdatedStatusData] = useState({
    status: "",
    statusReason: "",
    resolutionSummary: "",
    userId: Number(userId),
  });
  const [isAdvanceInvoice, setIsAdvanceInvoice] = useState(false);
  const [searchBy, setSearchBy] = useState("companyName");
  const [estimateDetail, setEstimateDetail] = useState(null);
  const [viewType, setViewType] = useState("ESTIMATE");

  useEffect(() => {
    dispatch(
      getAllLegalSupportRequestsForFilter({
        userId,
        status,
        page,
        size: rowsPerPage,
      }),
    );
  }, [dispatch, userId, page, rowsPerPage, status]);

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

  const formatFileSize = (size) => {
    const fileSize = Number(size || 0);

    if (!fileSize) return "-";

    if (fileSize < 1024) {
      return `${fileSize} B`;
    }

    if (fileSize < 1024 * 1024) {
      return `${(fileSize / 1024).toFixed(2)} KB`;
    }

    return `${(fileSize / (1024 * 1024)).toFixed(2)} MB`;
  };

  const openDocumentUrl = (fileUrl) => {
    if (!fileUrl) {
      addToast({
        title: "File URL not found",
        color: "danger",
      });
      return;
    }

    window.open(fileUrl, "_blank", "noopener,noreferrer");
  };

  const renderCell = React.useCallback(
    (rowData, columnKey) => {
      const cellValue = rowData[columnKey];
      switch (columnKey) {
        case "createdAt":
          return (
            <div>
              <p className="text-sm capitalize">
                {dayjs(rowData?.createdAt).format("DD-MM-YYYY hh:mm A")}
              </p>
            </div>
          );
        case "legalRequestTitle":
          return (
            <div>
              <p className="capitalize font-medium ">
                {rowData?.legalRequestTitle || "NA"}
              </p>
            </div>
          );
        case "status":
          return (
            <Chip size="sm" color={statusColorCode[rowData?.status]}>
              {rowData?.status}
            </Chip>
          );
        case "notes":
          return <p className="text-xs capitalize">{rowData?.notes}</p>;
        case "raisedBy":
          return <p className="text-sm capitalize">{rowData?.raisedBy}</p>;
        case "documents": {
          const documents = Array.isArray(rowData?.documents)
            ? rowData.documents
            : [];

          if (documents.length === 0) {
            return (
              <Chip size="sm" variant="flat" color="default">
                No docs
              </Chip>
            );
          }

          return (
            <Button
              size="sm"
              color="primary"
              variant="flat"
              startContent={<FileText size={16} />}
              onPress={() => {
                setSelectedDocuments(documents);
                setSelectedRequest(rowData);
                documentsModal.onOpen();
              }}
            >
              View {documents.length}
            </Button>
          );
        }
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
    },
    [documentsModal, statusModal],
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
        if (searchBy === "companyName") {
        } else if (searchBy === "unbilledNumber") {
        }
        setPage(1);
      } else {
        setFilterValue("");
      }
    },
    [searchBy, rowsPerPage, page, status, userId],
  );

  const onClear = React.useCallback(() => {
    setFilterValue("");
    setPage(1);
  }, [searchBy]);

  const handleUpdateStatus = () => {
    dispatch(
      updateLegalRequestStatus({
        id: rowItem?.id,
        data: updatedStatusData,
      }),
    )
      .then((resp) => {
        if (resp.meta.requestStatus === "fulfilled") {
          addToast({
            title: "SUCCESS",
            description: "Status updated successfully !.",
            color: "success",
          });
          setRowItem(null);
          setUpdatedStatusData({
            status: "",
            statusReason: "",
          });
          statusModal.onClose();
          dispatch(
            getAllLegalSupportRequestsForFilter({
              userId,
              status,
              page,
              size: rowsPerPage,
            }),
          );
        } else {
          addToast({
            title: "ERROR",
            description: resp?.payload,
            color: "danger",
          });
        }
      })
      .catch(() =>
        addToast({
          title: "ERROR",
          description: "Something went wrong !.",
          color: "danger",
        }),
      );
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
            <Dropdown>
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
                <DropdownItem key="INITIATED">INITIATED</DropdownItem>
                <DropdownItem key="PENDING">PENDING</DropdownItem>
                <DropdownItem key="APPROVED">APPROVED</DropdownItem>
                <DropdownItem key="DISAPPROVED">DISAPPROVED</DropdownItem>
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
            Total {count} legal request
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
      <h1 className="font-sans text-2xl font-medium mb-1">
        Legal request list
      </h1>
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
                  selectedKeys={[updatedStatusData?.status]}
                  onSelectionChange={(e) => {
                    let key = Array.from(e)[0];
                    setUpdatedStatusData((prev) => ({
                      ...prev,
                      status: key,
                    }));
                  }}
                >
                  {[
                    { key: "APPROVED", label: "APPROVED" },
                    { key: "REJECTED", label: "REJECTED" },
                    { key: "CANCELLED", label: "CANCELLED" },
                  ].map((item) => (
                    <SelectItem key={item.key}>{item.label}</SelectItem>
                  ))}
                </Select>
                <Textarea
                  label="Reason"
                  isRequired
                  value={updatedStatusData?.statusReason}
                  onChange={(e) =>
                    setUpdatedStatusData((prev) => ({
                      ...prev,
                      statusReason: e.target.value,
                    }))
                  }
                />
                <Textarea
                  label="Resolution summary"
                  isRequired
                  value={updatedStatusData?.resolutionSummary}
                  onChange={(e) =>
                    setUpdatedStatusData((prev) => ({
                      ...prev,
                      resolutionSummary: e.target.value,
                    }))
                  }
                />
              </ModalBody>
              <ModalFooter>
                <Button color="danger" variant="light" onPress={onClose}>
                  Close
                </Button>
                <Button
                  color="primary"
                  isDisabled={!updatedStatusData?.status}
                  onPress={handleUpdateStatus}
                >
                  Submit
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
      <Modal
        isOpen={documentsModal.isOpen}
        onOpenChange={documentsModal.onOpenChange}
        size="5xl"
        placement="top-center"
        backdrop="blur"
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                Documents
                <span className="text-xs font-normal text-default-500">
                  Request: {selectedRequest?.legalRequestTitle || "-"}
                </span>
              </ModalHeader>

              <ModalBody className="max-h-[75vh] overflow-auto">
                {selectedDocuments?.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {selectedDocuments.map((doc, index) => {
                      const fileUrl = normalizeFileUrl(doc?.fileUrl);
                      const isImage = isImageDocument(doc);

                      return (
                        <Card
                          key={doc?.id || doc?.uuid || index}
                          isPressable
                          shadow="sm"
                          className="border border-default-200 hover:border-primary cursor-pointer"
                          onPress={() => {
                            if (!fileUrl) {
                              addToast({
                                title: "File URL not found",
                                color: "danger",
                              });
                              return;
                            }

                            window.open(
                              fileUrl,
                              "_blank",
                              "noopener,noreferrer",
                            );
                          }}
                        >
                          <CardBody className="p-0">
                            <div className="h-40 w-full overflow-hidden rounded-t-xl bg-default-100 flex items-center justify-center">
                              {isImage && fileUrl ? (
                                <img
                                  src={fileUrl}
                                  alt={doc?.fileName || "Document"}
                                  className="h-full w-full object-cover"
                                />
                              ) : (
                                <FileText
                                  size={48}
                                  className="text-default-400"
                                />
                              )}
                            </div>

                            <div className="p-4">
                              <p className="text-sm font-semibold break-all line-clamp-2">
                                {doc?.fileName || "Unnamed document"}
                              </p>

                              <div className="mt-3 flex flex-wrap gap-2">
                                <Chip size="sm" variant="flat" color="primary">
                                  {doc?.fileType || "file"}
                                </Chip>

                                <Chip size="sm" variant="flat" color="default">
                                  {formatFileSize(doc?.fileSize)}
                                </Chip>
                              </div>

                              <p className="mt-3 text-xs text-default-500">
                                Uploaded:{" "}
                                {doc?.uploadedAt
                                  ? dayjs(doc.uploadedAt).format(
                                      "DD-MM-YYYY hh:mm A",
                                    )
                                  : "-"}
                              </p>

                              <p className="mt-2 text-xs text-primary font-medium">
                                Click card to open full page
                              </p>
                            </div>
                          </CardBody>
                        </Card>
                      );
                    })}
                  </div>
                ) : (
                  <div className="rounded-xl border border-dashed border-default-300 bg-default-50 p-6 text-center">
                    <p className="text-sm text-default-500">
                      No documents attached.
                    </p>
                  </div>
                )}
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
    </>
  );
};

export default OperationsLegal;
