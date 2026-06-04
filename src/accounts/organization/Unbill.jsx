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
  getAllUnbillGovtFeeList,
  getAllUnbillList,
  searchUnbilledByCompanyNameAndUnbilled,
  updateStatusForUnbill,
} from "../../toolkit/slices/organizationSlice";
import { inrCurrency } from "../../common";
import dayjs from "dayjs";
import {
  cancelUnBilledInvoice,
  convertUnbillToAdvanceInvoice,
  createCreditNotes,
  getTdsDetailByEstimateId,
  getUnBilledDetailById,
} from "../../toolkit/slices/accountSlice";
import { Link, useParams } from "react-router-dom";
import UnbilledView from "../../components/UnbilledView";
import { cancelProjectByUnbilledNumberInOperations } from "../../toolkit/slices/operationSlice";
import { set } from "zod";
import {
  getEstimateByEstimateId,
  updateLeadStatus,
} from "../../toolkit/slices/leadSlice";
import { getAllStatusData } from "../../toolkit/slices/settingSlice.js";
import NewEstimatePreview from "../../sales/leads/leadEstimate/NewEstimatePreview";

export const columns = [
  { name: "DATE", uid: "date" },
  { name: "UNBILL NO. / ADVANCE INVOICE", uid: "unbillNo" },
  { name: "ESTIMATE NUMBER", uid: "estimateNumber" },
  { name: "GOVERNMENT FEE", uid: "governmentFee" },
  { name: "TDS", uid: "tdsActive" },
  { name: "SERVICE", uid: "service" },
  { name: "CLIENT", uid: "client" },
  { name: "COMPANY", uid: "companyName" },
  { name: "PAYMENT TERM", uid: "paymentTypeCode" },
  { name: "TOTAL AMOUNT", uid: "totalAmount" },
  { name: "RECEIVED AMOUNT", uid: "receivedAmount" },
  { name: "CURR. RECEIVED AMOUNT", uid: "currentReceivedAmount" },
  { name: "OUTSTANDING AMOUNT", uid: "outstandingAmount" },
  { name: "ADDED BY", uid: "addedBy" },
  { name: "ACTIONS", uid: "actions" },
];

export function capitalize(s) {
  return s ? s.charAt(0).toUpperCase() + s.slice(1).toLowerCase() : "";
}

const INITIAL_VISIBLE_COLUMNS = [
  "date",
  "unbillNo",
  "estimateNumber",
  "governmentFee",
  "tdsActive",
  "service",
  "client",
  "companyName",
  "paymentTypeCode",
  "totalAmount",
  "currentReceivedAmount",
  "outstandingAmount",
  "addedBy",
  "actions",
];

const Unbill = () => {
  const dispatch = useDispatch();
  const { userId } = useParams();
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const statusModal = useDisclosure();
  const creditNoteModal = useDisclosure();
  const viewModal = useDisclosure();
  const govtFeeModal = useDisclosure();
  const tdsModal = useDisclosure();
  const userRole = useSelector((state) => state.auth.currentUser?.roles);
  const adminRole = userRole.includes("ADMIN");
  const department = useSelector(
    (state) => state?.auth?.getDepartmentDetail?.department,
  );
  const data = useSelector((state) => state.organization.unBillList);
  const count = useSelector((state) => state.organization.unBillCount);
  const invoiceDetail = useSelector((state) => state.account.unbilledDetail);
  const statusList = useSelector((state) => state?.setting?.statusList);
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
  const [govtFeeDetail, setGovtFeeDetail] = useState();
  const [tdsDetail, setTdsDetail] = useState();
  const [creditNoteData, setCreditNoteData] = useState({
    refundAmount: "",
    reason: "",
    attachment: "",
  });

  const [isCreditNoteAttachmentUploading, setIsCreditNoteAttachmentUploading] =
    useState(false);
  getAllStatusData;
  const [creditNoteRow, setCreditNoteRow] = useState(null);

  const handleActionMenuOpen = () => {
    dispatch(getAllStatusData());
    console.log("Status List", statusList);
  };

  const getAwaitingPaymentStatusId = () => {
    const awaitingPaymentStatus = (statusList || []).find(
      (item) =>
        item?.name?.trim()?.toLowerCase() === "Awaiting Payment"?.toLowerCase(),
    );

    return awaitingPaymentStatus?.id;
  };

  useEffect(() => {
    dispatch(getAllUnbillList({ page, size: rowsPerPage, userId, status }));
    dispatch(getAllUnbillCount({ userId, status }));
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
            title: "There is Some Issue in estimate",
            color: "danger",
          });
        }
      })
      .catch(() =>
        addToast({ title: "There is Some Issue in estimate", color: "danger" }),
      );
  };

  const handleGovtFeePreview = async (unbilledId) => {
    dispatch(getAllUnbillGovtFeeList(unbilledId))
      .then((resp) => {
        if (resp.meta.requestStatus === "fulfilled") {
          let data = resp?.payload;
          setGovtFeeDetail(data);
          govtFeeModal.onOpen();
        } else {
          addToast({
            title: "There is Some Issue in Govt Fee Estimate",
            color: "danger",
          });
        }
      })
      .catch((e) =>
        addToast({
          title: e.message,
          color: "danger",
        }),
      );
  };

  const handleTdsPreview = async (estimateId, unbilledId) => {
    dispatch(getTdsDetailByEstimateId({ estimateId, unbilledId }))
      .then((resp) => {
        if (resp.meta.requestStatus === "fulfilled") {
          let data = resp?.payload;
          setTdsDetail(data);
          tdsModal.onOpen();
        } else {
          addToast({
            title: "There is Some Issue in TDS Estimate",
            color: "danger",
          });
        }
      })
      .catch((e) =>
        addToast({
          title: e.message,
          color: "danger",
        }),
      );
  };
  const handleCreateCreditNote = async () => {
    if (
      !creditNoteData.refundAmount ||
      Number(creditNoteData.refundAmount) <= 0
    ) {
      addToast({
        title: "Refund amount is required",
        color: "danger",
      });
      return;
    }

    if (!creditNoteData.reason?.trim()) {
      addToast({
        title: "Reason is required",
        color: "danger",
      });
      return;
    }

    if (isCreditNoteAttachmentUploading) {
      addToast({
        title: "Upload in progress",
        description: "Please wait until attachment upload is completed.",
        color: "warning",
      });
      return;
    }

    if (!creditNoteData.attachment) {
      addToast({
        title: "Attachment is required",
        description: "Please upload credit note attachment.",
        color: "danger",
      });
      return;
    }

    const payload = {
      estimateNumber: creditNoteRow?.estimateNumber,
      createdByUserId: Number(userId),
      refundAmount: Number(creditNoteData.refundAmount),
      reason: creditNoteData.reason,
      attachment: creditNoteData.attachment,
    };

    try {
      const resp = await dispatch(createCreditNotes(payload));

      if (resp.meta.requestStatus === "fulfilled") {
        addToast({
          title: "Credit note created successfully!",
          color: "success",
        });

        creditNoteModal.onClose();
        setCreditNoteRow(null);
        setCreditNoteData({
          refundAmount: "",
          reason: "",
          attachment: "",
        });

        dispatch(getAllUnbillList({ page, size: rowsPerPage, userId, status }));
        dispatch(getAllUnbillCount({ userId, status }));
      } else {
        addToast({
          title: resp?.payload?.data?.message || "Failed to create credit note",
          color: "danger",
        });
      }
    } catch (error) {
      addToast({
        title: "Something went wrong!",
        color: "danger",
      });
    }
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
            <Chip
              size="sm"
              color={
                rowData?.status === "APPROVED"
                  ? "success"
                  : rowData?.status === "REJECTED"
                    ? "danger"
                    : "warning"
              }
            >
              {rowData?.status}
            </Chip>
          </div>
        );
      case "unbillNo":
        return (
          <Link
            to={`${rowData?.id}/invoices`}
            className="text-sm capitalize font-medium"
          >
            {`${rowData?.unbilledNumber}`}
            {rowData?.advanceInvoiceFlag
              ? ` / ${rowData?.advanceInvoiceNumber}`
              : ``}{" "}
          </Link>
        );
      case "estimateNumber":
        return (
          <div>
            <p
              className="capitalize text-xs font-medium text-blue-600 cursor-pointer"
              onClick={() => handleViewEstimate(rowData, "ESTIMATE")}
            >
              {rowData?.estimateNumber || "NA"}
            </p>
          </div>
        );
      case "governmentFee":
        return (
          <div>
            <button
              disabled={!rowData?.governmentFeeActiveFlag}
              className={`capitalize text-xs font-medium ${rowData?.governmentFeeActiveFlag == true ? "text-blue-600 cursor-pointer" : "text-gray-500 cursor-not-allowed"}`}
              onClick={() => {
                handleGovtFeePreview(rowData.id);
              }}
            >
              {rowData?.governmentFeeActiveFlag === true ? "True" : "False"}
            </button>
          </div>
        );
      case "tdsActive":
        return (
          <div className="w-full  max-w-[130px] rounded-md px-3 py-2">
            {rowData?.tdsActiveFlag === true && (
              <div className="mt-2 space-y-1 text-xs">
                <div className="flex items-center gap-3">
                  <span className="whitespace-nowrap font-semibold text-gray-900">
                    ₹ {rowData?.tdsResponseDto?.tdsAmount ?? 0}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <span className="whitespace-nowrap font-semibold text-gray-400">
                    {rowData?.tdsResponseDto?.tdsPercentage ?? 0}%
                  </span>
                </div>
              </div>
            )}
          </div>
        );

      case "service":
        return <p className="text-sm capitalize">{rowData?.solutionName}</p>;
      case "company":
        return <p className="text-sm capitalize">{rowData?.company}</p>;
      case "client":
        return (
          <div className="flex flex-col gap-2">
            <p className="text-sm capitalize">{rowData?.contactName}</p>
          </div>
        );
      case "totalAmount":
        return (
          <p className="text-sm capitalize">
            {inrCurrency(rowData?.totalAmount)}
          </p>
        );
      case "receivedAmount":
        return (
          <p className="text-sm capitalize">
            {inrCurrency(rowData?.receivedAmount)}
          </p>
        );
      case "currentReceivedAmount":
        return (
          <p className="text-sm capitalize">
            {inrCurrency(rowData?.currentReceivedAmount)}
          </p>
        );
      case "outstandingAmount":
        return (
          <p className="text-sm capitalize">
            {inrCurrency(rowData?.outstandingAmount)}
          </p>
        );
      case "addedBy":
        return <p className="text-sm capitalize">{rowData?.createdByName}</p>;
      case "actions":
        return (
          <div className="relative flex justify-center items-center gap-2">
            <Dropdown>
              <DropdownTrigger>
                <Button
                  isIconOnly
                  size="sm"
                  variant="light"
                  onClick={handleActionMenuOpen}
                >
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
        } else if (searchBy === "estimateNumber") {
          dispatch(
            searchUnbilledByCompanyNameAndUnbilled({
              page,
              size: rowsPerPage,
              estimateNumber: value,
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
          console.log("redbdfgfdsdg", re);
          if (re.meta.requestStatus === "fulfilled") {
            addToast({
              title: "Unbill canceled successfully !.",
              color: "success",
            });
            setRowItem(null);
            setUpdatedStatusData({
              approverUserId: userId,
              approvalRemarks: "",
              rejectionReason: "",
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
            statusModal.onClose();
          } else {
            addToast({
              title: "ERROR",
              description: re?.payload?.message,
              color: "danger",
            });
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
            const awaitingPaymentStatusId = getAwaitingPaymentStatusId();

            if (!awaitingPaymentStatusId) {
              addToast({
                title: "Awaiting Payment status not found",
                description: "Please check status master data.",
                color: "danger",
              });
            } else {
              dispatch(
                updateLeadStatus({
                  leadId: rowItem?.leadId,
                  userId,
                  statusId: awaitingPaymentStatusId,
                }),
              )
                .then((resp) => {
                  if (resp.meta.requestStatus === "fulfilled") {
                    addToast({
                      title: "Status updated successfully",
                      color: "success",
                    });
                  } else {
                    addToast({
                      title: "Something went wrong in lead status update  !.",
                      color: "danger",
                    });
                  }
                })
                .catch(() => {
                  addToast({
                    title: "Something went wrong in lead status update  !.",
                    color: "danger",
                  });
                });
            }

            dispatch(
              getAllUnbillList({ page, size: rowsPerPage, userId, status }),
            );
            dispatch(getAllUnbillCount({ userId, status }));
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
            <Select
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
              <SelectItem key={"estimateNumber"}>Estimate number</SelectItem>
            </Select>
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
                <DropdownItem key="PENDING_APPROVAL">
                  PENDING_APPROVAL
                </DropdownItem>
                <DropdownItem key="APPROVED">APPROVED</DropdownItem>
                <DropdownItem key="REJECTED">REJECTED</DropdownItem>
                <DropdownItem key="CANCELLED">CANCELLED</DropdownItem>
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
            Total {count} unbilled items
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
      <h1 className="font-sans text-2xl font-medium mb-1">Unbilled list</h1>
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
      <Modal
        size="4xl"
        isDismissable={false}
        isKeyboardDismissDisabled={true}
        isOpen={govtFeeModal.isOpen}
        onOpenChange={govtFeeModal.onOpenChange}
        placement="top-center"
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="border-b border-default-200 bg-gradient-to-r from-blue-50 via-white to-indigo-50 px-6 py-4">
                <div className="flex w-full items-start justify-between gap-4">
                  <div>
                    <h2 className="text-lg font-semibold tracking-tight text-default-900">
                      Government Fee Details
                    </h2>
                    <p className="mt-1 text-sm text-default-500">
                      Complete fee summary, payment details, and audit
                      information
                    </p>
                  </div>

                  <div className="flex flex-col items-end gap-2">
                    <Chip
                      color="primary"
                      variant="flat"
                      size="sm"
                      className="font-medium capitalize"
                    >
                      {govtFeeDetail?.status || "NA"}
                    </Chip>
                    <span className="rounded-full bg-default-100 px-3 py-1 text-xs font-medium text-default-600">
                      Ref: {govtFeeDetail?.feeReferenceNumber || "NA"}
                    </span>
                  </div>
                </div>
              </ModalHeader>

              <ModalBody className="max-h-[75vh] space-y-6 overflow-y-auto bg-gradient-to-br from-white via-default-50/40 to-blue-50/30 px-6 py-5">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  <div className="rounded-2xl border border-blue-200 bg-gradient-to-br from-blue-50 to-white p-4 shadow-sm">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-blue-600">
                      Total Amount
                    </p>
                    <p className="mt-2 text-xl font-bold text-default-900">
                      {inrCurrency(govtFeeDetail?.totalAmount)}
                    </p>
                  </div>
                </div>

                <div className="rounded-2xl border border-default-200 bg-white/90 p-5 shadow-sm">
                  <h3 className="mb-4 text-sm font-semibold uppercase tracking-[0.12em] text-default-600">
                    Estimate Information
                  </h3>

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div className="rounded-xl border border-default-200 bg-default-50 p-4">
                      <p className="text-[11px] uppercase tracking-[0.12em] text-default-500">
                        Estimate Number
                      </p>
                      <p className="mt-1 text-sm font-semibold text-default-900">
                        {govtFeeDetail?.estimateNumber || "NA"}
                      </p>
                    </div>

                    <div className="rounded-xl border border-default-200 bg-default-50 p-4">
                      <p className="text-[11px] uppercase tracking-[0.12em] text-default-500">
                        Unbilled Number
                      </p>
                      <p className="mt-1 text-sm font-semibold text-default-900">
                        {govtFeeDetail?.unbilledNumber || "NA"}
                      </p>
                    </div>

                    <div className="rounded-xl border border-default-200 bg-default-50 p-4">
                      <p className="text-[11px] uppercase tracking-[0.12em] text-default-500">
                        Company
                      </p>
                      <p className="mt-1 text-sm font-semibold text-default-900">
                        {govtFeeDetail?.companyName || "NA"}
                      </p>
                    </div>

                    <div className="rounded-xl border border-default-200 bg-default-50 p-4">
                      <p className="text-[11px] uppercase tracking-[0.12em] text-default-500">
                        Unit
                      </p>
                      <p className="mt-1 text-sm font-semibold text-default-900">
                        {govtFeeDetail?.unitName || "NA"}
                      </p>
                    </div>

                    <div className="rounded-xl border border-default-200 bg-default-50 p-4 md:col-span-2">
                      <p className="text-[11px] uppercase tracking-[0.12em] text-default-500">
                        Contact
                      </p>
                      <p className="mt-1 text-sm font-semibold text-default-900">
                        {govtFeeDetail?.contactName || "NA"}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border border-default-200 bg-white/90 p-5 shadow-sm">
                  <h3 className="mb-4 text-sm font-semibold uppercase tracking-[0.12em] text-default-600">
                    Fee Details
                  </h3>

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div className="rounded-xl border border-default-200 bg-default-50 p-4">
                      <p className="text-[11px] uppercase tracking-[0.12em] text-default-500">
                        Fee Ref No.
                      </p>
                      <p className="mt-1 text-sm font-semibold text-default-900">
                        {govtFeeDetail?.feeReferenceNumber || "NA"}
                      </p>
                    </div>

                    <div className="rounded-xl border border-default-200 bg-default-50 p-4">
                      <p className="text-[11px] uppercase tracking-[0.12em] text-default-500">
                        Department
                      </p>
                      <p className="mt-1 text-sm font-semibold text-default-900">
                        {govtFeeDetail?.departmentName || "NA"}
                      </p>
                    </div>

                    <div className="rounded-xl border border-default-200 bg-default-50 p-4">
                      <p className="text-[11px] uppercase tracking-[0.12em] text-default-500">
                        Fee Type
                      </p>
                      <p className="mt-1 text-sm font-semibold text-default-900">
                        {govtFeeDetail?.feeType || "NA"}
                      </p>
                    </div>

                    <div className="rounded-xl border border-default-200 bg-default-50 p-4">
                      <p className="text-[11px] uppercase tracking-[0.12em] text-default-500">
                        Payment Date
                      </p>
                      <p className="mt-1 text-sm font-semibold text-default-900">
                        {govtFeeDetail?.paymentDate
                          ? dayjs(govtFeeDetail.paymentDate).format(
                              "DD-MM-YYYY",
                            )
                          : "NA"}
                      </p>
                    </div>

                    <div className="rounded-xl border border-default-200 bg-default-50 p-4">
                      <p className="text-[11px] uppercase tracking-[0.12em] text-default-500">
                        Due Date
                      </p>
                      <p className="mt-1 text-sm font-semibold text-default-900">
                        {govtFeeDetail?.dueDate
                          ? dayjs(govtFeeDetail.dueDate).format("DD-MM-YYYY")
                          : "NA"}
                      </p>
                    </div>

                    <div className="rounded-xl border border-default-200 bg-default-50 p-4">
                      <p className="text-[11px] uppercase tracking-[0.12em] text-default-500">
                        Status
                      </p>
                      <div className="mt-2">
                        <Chip
                          color="primary"
                          variant="flat"
                          size="sm"
                          className="capitalize"
                        >
                          {govtFeeDetail?.status || "NA"}
                        </Chip>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border border-amber-200 bg-gradient-to-r from-amber-50 to-yellow-50 p-5 shadow-sm">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-amber-700">
                    Remarks
                  </p>
                  <p className="mt-2 text-sm font-medium leading-6 text-default-800">
                    {govtFeeDetail?.remarks || "NA"}
                  </p>
                </div>

                <div className="rounded-2xl border border-default-200 bg-white/90 p-5 shadow-sm">
                  <h3 className="mb-4 text-sm font-semibold uppercase tracking-[0.12em] text-default-600">
                    Audit Information
                  </h3>

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                    <div className="rounded-xl border border-default-200 bg-default-50 p-4">
                      <p className="text-[11px] uppercase tracking-[0.12em] text-default-500">
                        Created By
                      </p>
                      <p className="mt-1 text-sm font-semibold text-default-900">
                        {govtFeeDetail?.createdByName || "NA"}
                      </p>
                    </div>

                    <div className="rounded-xl border border-default-200 bg-default-50 p-4">
                      <p className="text-[11px] uppercase tracking-[0.12em] text-default-500">
                        Created At
                      </p>
                      <p className="mt-1 text-sm font-semibold text-default-900">
                        {govtFeeDetail?.createdAt
                          ? dayjs(govtFeeDetail.createdAt).format(
                              "DD-MM-YYYY HH:mm",
                            )
                          : "NA"}
                      </p>
                    </div>

                    <div className="rounded-xl border border-default-200 bg-default-50 p-4">
                      <p className="text-[11px] uppercase tracking-[0.12em] text-default-500">
                        Updated At
                      </p>
                      <p className="mt-1 text-sm font-semibold text-default-900">
                        {govtFeeDetail?.updatedAt
                          ? dayjs(govtFeeDetail.updatedAt).format(
                              "DD-MM-YYYY HH:mm",
                            )
                          : "NA"}
                      </p>
                    </div>
                  </div>
                </div>
              </ModalBody>

              <ModalFooter className="border-t border-default-200 bg-white px-6 py-4">
                <Button
                  variant="light"
                  onPress={onClose}
                  className="rounded-xl px-6 font-medium"
                >
                  Close
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
        isOpen={tdsModal.isOpen}
        onOpenChange={tdsModal.onOpenChange}
        placement="top-center"
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="border-b border-default-200 bg-gradient-to-r from-blue-50 via-white to-indigo-50 px-6 py-4">
                <div className="flex w-full items-start justify-between gap-4">
                  <div>
                    <h2 className="text-lg font-semibold tracking-tight text-default-900">
                      TDS Details
                    </h2>
                    <p className="mt-1 text-sm text-default-500">
                      TDS deduction summary with estimate, unbilled invoice, and
                      audit information
                    </p>
                  </div>

                  <div className="flex flex-col items-end gap-2">
                    <Chip
                      color={
                        tdsDetail?.status === "PENDING"
                          ? "warning"
                          : tdsDetail?.status === "APPROVED"
                            ? "success"
                            : tdsDetail?.status === "REJECTED"
                              ? "danger"
                              : "primary"
                      }
                      variant="flat"
                      size="sm"
                      className="font-medium capitalize"
                    >
                      {tdsDetail?.status || "NA"}
                    </Chip>

                    <span className="rounded-full bg-default-100 px-3 py-1 text-xs font-medium text-default-600">
                      TDS ID: {tdsDetail?.id || "NA"}
                    </span>
                  </div>
                </div>
              </ModalHeader>

              <ModalBody className="max-h-[75vh] space-y-6 overflow-y-auto bg-gradient-to-br from-white via-default-50/40 to-blue-50/30 px-6 py-5">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  <div className="rounded-2xl border border-blue-200 bg-gradient-to-br from-blue-50 to-white p-4 shadow-sm">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-blue-600">
                      Taxable Amount
                    </p>
                    <p className="mt-2 text-xl font-bold text-default-900">
                      {inrCurrency(tdsDetail?.taxableAmount)}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-amber-200 bg-gradient-to-br from-amber-50 to-white p-4 shadow-sm">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-amber-600">
                      TDS Percentage
                    </p>
                    <p className="mt-2 text-xl font-bold text-default-900">
                      {tdsDetail?.tdsPercentage !== undefined &&
                      tdsDetail?.tdsPercentage !== null
                        ? `${Number(tdsDetail.tdsPercentage).toFixed(2)}%`
                        : "NA"}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-green-200 bg-gradient-to-br from-green-50 to-white p-4 shadow-sm">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-green-600">
                      TDS Amount
                    </p>
                    <p className="mt-2 text-xl font-bold text-default-900">
                      {inrCurrency(tdsDetail?.tdsAmount)}
                    </p>
                  </div>
                </div>

                <div className="rounded-2xl border border-default-200 bg-white/90 p-5 shadow-sm">
                  <h3 className="mb-4 text-sm font-semibold uppercase tracking-[0.12em] text-default-600">
                    Estimate & Invoice Information
                  </h3>

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div className="rounded-xl border border-default-200 bg-default-50 p-4">
                      <p className="text-[11px] uppercase tracking-[0.12em] text-default-500">
                        Estimate ID
                      </p>
                      <p className="mt-1 text-sm font-semibold text-default-900">
                        {tdsDetail?.estimateId || "NA"}
                      </p>
                    </div>

                    <div className="rounded-xl border border-default-200 bg-default-50 p-4">
                      <p className="text-[11px] uppercase tracking-[0.12em] text-default-500">
                        Estimate Number
                      </p>
                      <p className="mt-1 text-sm font-semibold text-default-900">
                        {tdsDetail?.estimateNumber || "NA"}
                      </p>
                    </div>

                    <div className="rounded-xl border border-default-200 bg-default-50 p-4">
                      <p className="text-[11px] uppercase tracking-[0.12em] text-default-500">
                        Unbilled Invoice ID
                      </p>
                      <p className="mt-1 text-sm font-semibold text-default-900">
                        {tdsDetail?.unbilledInvoiceId || "NA"}
                      </p>
                    </div>

                    <div className="rounded-xl border border-default-200 bg-default-50 p-4">
                      <p className="text-[11px] uppercase tracking-[0.12em] text-default-500">
                        Unbilled Number
                      </p>
                      <p className="mt-1 text-sm font-semibold text-default-900">
                        {tdsDetail?.unbilledNumber || "NA"}
                      </p>
                    </div>

                    <div className="rounded-xl border border-default-200 bg-default-50 p-4 md:col-span-2">
                      <p className="text-[11px] uppercase tracking-[0.12em] text-default-500">
                        Public UUID
                      </p>
                      <p className="mt-1 break-all text-sm font-semibold text-default-900">
                        {tdsDetail?.publicUuid || "NA"}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border border-default-200 bg-white/90 p-5 shadow-sm">
                  <h3 className="mb-4 text-sm font-semibold uppercase tracking-[0.12em] text-default-600">
                    TDS Status
                  </h3>

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                    <div className="rounded-xl border border-default-200 bg-default-50 p-4">
                      <p className="text-[11px] uppercase tracking-[0.12em] text-default-500">
                        Status
                      </p>
                      <div className="mt-2">
                        <Chip
                          color={
                            tdsDetail?.status === "PENDING"
                              ? "warning"
                              : tdsDetail?.status === "APPROVED"
                                ? "success"
                                : tdsDetail?.status === "REJECTED"
                                  ? "danger"
                                  : "primary"
                          }
                          variant="flat"
                          size="sm"
                          className="capitalize"
                        >
                          {tdsDetail?.status || "NA"}
                        </Chip>
                      </div>
                    </div>

                    <div className="rounded-xl border border-default-200 bg-default-50 p-4">
                      <p className="text-[11px] uppercase tracking-[0.12em] text-default-500">
                        Created By ID
                      </p>
                      <p className="mt-1 text-sm font-semibold text-default-900">
                        {tdsDetail?.createdById || "NA"}
                      </p>
                    </div>

                    <div className="rounded-xl border border-default-200 bg-default-50 p-4">
                      <p className="text-[11px] uppercase tracking-[0.12em] text-default-500">
                        Created By
                      </p>
                      <p className="mt-1 text-sm font-semibold text-default-900">
                        {tdsDetail?.createdByName || "NA"}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border border-default-200 bg-white/90 p-5 shadow-sm">
                  <h3 className="mb-4 text-sm font-semibold uppercase tracking-[0.12em] text-default-600">
                    Audit Information
                  </h3>

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div className="rounded-xl border border-default-200 bg-default-50 p-4">
                      <p className="text-[11px] uppercase tracking-[0.12em] text-default-500">
                        Created At
                      </p>
                      <p className="mt-1 text-sm font-semibold text-default-900">
                        {tdsDetail?.createdAt
                          ? dayjs(tdsDetail.createdAt).format(
                              "DD-MM-YYYY HH:mm",
                            )
                          : "NA"}
                      </p>
                    </div>

                    <div className="rounded-xl border border-default-200 bg-default-50 p-4">
                      <p className="text-[11px] uppercase tracking-[0.12em] text-default-500">
                        Updated At
                      </p>
                      <p className="mt-1 text-sm font-semibold text-default-900">
                        {tdsDetail?.updatedAt
                          ? dayjs(tdsDetail.updatedAt).format(
                              "DD-MM-YYYY HH:mm",
                            )
                          : "NA"}
                      </p>
                    </div>
                  </div>
                </div>
              </ModalBody>

              <ModalFooter className="border-t border-default-200 bg-white px-6 py-4">
                <Button
                  variant="light"
                  onPress={onClose}
                  className="rounded-xl px-6 font-medium"
                >
                  Close
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      <Modal
        isOpen={creditNoteModal.isOpen}
        onOpenChange={creditNoteModal.onOpenChange}
        placement="top-center"
        backdrop="blur"
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                Credit Note
                <span className="text-xs font-normal text-gray-500">
                  {creditNoteRow?.unbilledNumber
                    ? `Unbilled No: ${creditNoteRow.unbilledNumber}`
                    : ""}
                </span>
              </ModalHeader>

              <ModalBody className="max-h-[85vh] overflow-auto">
                <Input
                  type="number"
                  label="Refund Amount"
                  placeholder="Enter refund amount"
                  isRequired
                  min={0}
                  value={creditNoteData.refundAmount}
                  onChange={(e) =>
                    setCreditNoteData((prev) => ({
                      ...prev,
                      refundAmount: e.target.value,
                    }))
                  }
                />

                <Textarea
                  label="Reason"
                  placeholder="Enter reason for credit note"
                  isRequired
                  minRows={4}
                  value={creditNoteData.reason}
                  onChange={(e) =>
                    setCreditNoteData((prev) => ({
                      ...prev,
                      reason: e.target.value,
                    }))
                  }
                />
                <FileUploader
                  value={creditNoteData.attachment}
                  onChange={(uploadedUrl) =>
                    setCreditNoteData((prev) => ({
                      ...prev,
                      attachment: uploadedUrl,
                    }))
                  }
                  onUploadingChange={setIsCreditNoteAttachmentUploading}
                  label="Attachment"
                  placeholder="Upload Credit Note attachment"
                  isRequired
                />
              </ModalBody>

              <ModalFooter>
                <Button
                  color="danger"
                  variant="light"
                  onPress={() => {
                    onClose();
                    setCreditNoteRow(null);
                    setCreditNoteData({
                      refundAmount: "",
                      reason: "",
                      attachment: "",
                    });
                  }}
                >
                  Close
                </Button>

                <Button color="primary" onPress={handleCreateCreditNote}>
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

export default Unbill;
