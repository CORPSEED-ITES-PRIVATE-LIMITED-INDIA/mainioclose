import {
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalHeader,
  useDisclosure,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  DropdownTrigger,
  Dropdown,
  DropdownMenu,
  DropdownItem,
  Pagination,
  Button,
  addToast,
  ModalFooter,
} from "@heroui/react";
import React, { useCallback, useEffect, useState } from "react";
import { ChevronDown, EllipsisVertical, Plus, Search } from "lucide-react";
import {
  cancelVendorsRequest,
  getAllVendorsRequest,
  getAllVendorsStatus,
  getvendorHistoryByLeadId,
  sendVendorsProposal,
  updateVendorStatus,
} from "../toolkit/slices/vendorsSlice";
import { useDispatch, useSelector } from "react-redux";
import { Controller, useForm } from "react-hook-form";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import dayjs from "dayjs";
import {
  Banknote,
  Calendar,
  Factory,
  FileText,
  Mail,
  Phone,
  User,
  UserRoundCog,
} from "lucide-react";
import { inrCurrency } from "../common";
import { useParams } from "react-router-dom";

const formSchema = ({ statusIsFinished, statusIsCanceled }) =>
  z.object({
    requestStatus: z.string().min(1, "Please select status"),
    ...(statusIsFinished
      ? {
          quotationFilePath: z.string().min(1, "Please upload document"),
          quotationAmount: z.number(),
          additionalMailId: z.string().optional(),
          agreementName: z.string().optional(),
          agreementWithClientDocumentPath: z.string().optional(),
          researchName: z.string().optional(),
          researchDocumentPath: z.string().optional(),
        }
      : {}),
    ...(statusIsCanceled
      ? { cancelReason: z.string().min(1, "Please enter reason") }
      : {
          internalVendorPrices: z.string().optional().or(z.literal("")),
          externalVendorPrice: z.string().optional().or(z.literal("")),
          comment: z.string().optional().or(z.literal("")),
        }),
  });

const defaultValues = {
  requestStatus: "",
  quotationFilePath: "",
  quotationAmount: "",
  additionalMailId: "",
  agreementName: "",
  agreementWithClientDocumentPath: "",
  researchName: "",
  researchDocumentPath: "",
  cancelReason: "",
  internalVendorPrices: "",
  externalVendorPrice: "",
  comment: "",
};

export const columns = [
  { name: "ID", uid: "id" },
  { name: "STATUS", uid: "requestStatus", sortable: true },
  { name: "RAISED BY", uid: "raisedBy" },
  { name: "UPDATED BY", uid: "updatedName" },
  { name: "UPDATED DATE", uid: "updateDate" },
  { name: "PRICE BY VENDOR", uid: "externalVendorPrice" },
  { name: "PRICE TO VENDOR", uid: "internalVendorPrices" },
  { name: "Quotation AMT.", uid: "quotationAmount" },
  { name: "DESCRIPTION", uid: "updateDescription" },
];

export function capitalize(s) {
  return s ? s.charAt(0).toUpperCase() + s.slice(1).toLowerCase() : "";
}

const INITIAL_VISIBLE_COLUMNS = [
  "id",
  "requestStatus",
  "raisedBy",
  "updatedName",
  "updateDate",
  "externalVendorPrice",
  "internalVendorPrices",
  "quotationAmount",
  "updateDescription",
];

const VendorRequestDetail = () => {
  const dispatch = useDispatch();
  const { leadId, userId, requestId } = useParams();
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const detail = {};
  const vendorsStatus = useSelector((state) => state.vendors.vendorsStatus);
  const data = useSelector((state) => state.vendors.singleVendorHistoryList);
  const count = useSelector(
    (state) => state.vendors.singleVendorHistoryList?.length
  );
  const [filterValue, setFilterValue] = React.useState("");
  const [selectedKeys, setSelectedKeys] = React.useState(new Set([]));
  const [visibleColumns, setVisibleColumns] = React.useState(
    new Set(INITIAL_VISIBLE_COLUMNS)
  );
  const [statusIsFinished, setStatusIsFinished] = useState(false);
  const [statusIsCanceled, setStatusIsCanceled] = useState(false);
  const [rowsPerPage, setRowsPerPage] = React.useState(50);
  const [sortDescriptor, setSortDescriptor] = React.useState({
    column: "age",
    direction: "ascending",
  });
  const [page, setPage] = React.useState(1);
  const hasSearchFilter = Boolean(filterValue);

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

  useEffect(() => {
    dispatch(getvendorHistoryByLeadId({ userId, leadId, vendorRequestId:requestId }));
  }, [leadId, leadId, requestId]);

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: zodResolver(formSchema({ statusIsCanceled, statusIsFinished })),
    defaultValues,
  });

  const handleUpdateBtn = () => {
    onOpen();
    dispatch(getAllVendorsStatus());
  };

  const renderCell = React.useCallback((rowData, columnKey) => {
    const cellValue = rowData[columnKey];
    switch (columnKey) {
      case "requestStatus":
        return <span className="font-normal">{rowData?.requestStatus}</span>;
      case "raisedBy":
        return (
          <span className="font-normal">{rowData?.raisedBy?.fullName}</span>
        );
      case "updatedName":
        return <span className="font-normal">{rowData?.updatedName}</span>;
      case "updateDate":
        return (
          <span className="font-normal">
            {dayjs(rowData?.updateDate).format("DD-MM-YYYY , hh:mm a")}
          </span>
        );
      case "externalVendorPrice":
        return (
          <span className="font-normal">
            {inrCurrency(rowData?.externalVendorPrice)}
          </span>
        );
      case "internalVendorPrices":
        return (
          <span className="font-normal">
            {inrCurrency(rowData?.internalVendorPrices)}
          </span>
        );
      case "quotationAmount":
        return <span className="font-normal">{rowData?.quotationAmount}</span>;
      case "updateDescription":
        return (
          <span className="font-normal">{rowData?.updateDescription}</span>
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
            <Button startContent={<Plus />} onPress={handleUpdateBtn}>
              Update status
            </Button>
          </div>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-default-400 text-small">
            Total {count} request updates
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
    onSearchChange,
    hasSearchFilter,
    count,
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
  }, [selectedKeys, page, pages, count]);

  const onSubmit = useCallback(
    (values) => {
      values.companyName = detail?.clientCompanyName;
      values.contactPersonName = detail?.contactPersonName;
      values.vendorCategoryId = detail?.vendorCategoryId;
      values.subVendorCategoryId = detail?.vendorSubCategoryId;
      let obj = {
        vendorId: requestId,
        userId: userId,
        leadId: leadId,
        data: values,
      };
      if (statusIsCanceled) {
        dispatch(
          cancelVendorsRequest({
            vendorRequestId: requestId,
            userId: userId,
            cancelReason: values?.cancelReason,
          })
        )
          .then((resp) => {
            if (resp.meta.requestStatus === "fulfilled") {
              addToast({
                title: "Vendors request cancelled successfully!.",
                color: "success",
              });
              setOpenModal(false);
              form.resetFields();
              dispatch(
                getvendorHistoryByLeadId({
                  userId: userId,
                  leadId: leadId,
                  vendorRequestId: requestId,
                })
              );
              dispatch(
                getAllVendorsRequest({
                  id: userId,
                  page: 1,
                  size: 50,
                })
              );
            } else {
              addToast({ title: "Something went wrong !.", color: "danger" });
            }
          })
          .catch(() =>
            addToast({ title: "Something went wrong !.", color: "danger" })
          );
      } else {
        dispatch(updateVendorStatus(obj))
          .then((resp) => {
            if (resp.meta.requestStatus === "fulfilled") {
              addToast({
                title: "Vendor's status updated successfully",
                color: "success",
              });
              onClose();
              reset(defaultValues);
              if (statusIsFinished) {
                dispatch(
                  sendVendorsProposal({
                    userId: userId,
                    leadId: leadId,
                    vendorRequestId: requestId,
                    detail: {
                      clientMailId: detail?.clientEmailId,
                      clientName: detail?.clientName,
                      clientContactNumber: detail?.clientMobileNumber,
                      budgetPrice: detail?.budgetPrice,
                      ...values,
                    },
                  })
                )
                  .then((resp) => {
                    if (resp.meta.requestStatus === "fulfilled") {
                      addToast({
                        title: "Proposal send to client.",
                        color: "success",
                      });
                      dispatch(
                        getAllVendorsRequest({
                          id: userId,
                          page: 1,
                          size: 50,
                        })
                      );
                    } else {
                      addToast({
                        title: "Something went wrong !.",
                        color: "danger",
                      });
                    }
                  })
                  .catch(() =>
                    addToast({
                      title: "Something went wrong !.",
                      color: "danger",
                    })
                  );
              }
              dispatch(
                getvendorHistoryByLeadId({
                  userId: userId,
                  leadId: leadId,
                  vendorRequestId: requestId,
                })
              );
            } else {
              addToast({ title: "Something went wrong !.", color: "danger" });
            }
          })
          .catch(() => {
            addToast({ title: "Something went wrong !.", color: "danger" });
          });
      }
    },
    [dispatch, detail, userId,statusIsCanceled,statusIsFinished,requestId,leadId]
  );

  return (
    <div>
      <div className="w-full flex justify-between px-2 mb-3">
        <h1 className="text-xl font-medium my-1">Vendor's request status</h1>
      </div>
      <div className="grid grid-cols-1 gap-4">
        <section className="grid grid-cols-3 gap-2">
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1">
              <Calendar className="w-5 h-5" />
              <p className="text-default-500 inline">Date</p>
            </span>
            : <p>{dayjs(detail?.updatedDate).format("DD-MM-YYYY , hh:mm a")}</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1">
              <User className="w-5 h-5" />
              <p className="text-default-500">Client name</p>
            </span>
            : <p>{detail?.clientName}</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1">
              <Mail className="w-5 h-5" />{" "}
              <p className="text-default-500">Email</p>{" "}
            </span>
            : <p>{detail?.clientEmailId}</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1">
              <Phone className="w-5 h-5" />{" "}
              <p className="text-default-500">Contact</p>
            </span>{" "}
            : <p>{detail?.contactNumber}</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1">
              <Factory className="w-5 h-5" />{" "}
              <p className="text-default-500">Company</p>{" "}
            </span>
            : <p>{detail?.clientCompanyName}</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1">
              <Banknote className="w-5 h-5" />{" "}
              <p className="text-default-500">Budget</p>
            </span>
            : <p>{inrCurrency(detail?.budgetPrice)}</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1">
              <UserRoundCog className="w-5 h-5" />{" "}
              <p className="text-default-500">Category</p>
            </span>
            : <p>{detail?.vendorCategoryName}</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1">
              <UserRoundCog className="w-5 h-5" />{" "}
              <p className="text-default-500">Sub category</p>{" "}
            </span>
            : <p>{detail?.vendorSubCategoryName}</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1">
              <FileText className="w-5 h-5" />{" "}
              <p className="text-default-500">Description</p>{" "}
            </span>
            : <p>{detail?.requirementDescription}</p>
          </div>
        </section>
        <section>
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
        </section>
      </div>
      <Modal
        size="3xl"
        isDismissable={false}
        isKeyboardDismissDisabled={true}
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        placement="top-center"
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader>Add vendors request</ModalHeader>
              <ModalBody>
                <form
                  onSubmit={handleSubmit(onSubmit)}
                  className="flex flex-col gap-4"
                >
                  <div className="grid grid-cols-2 gap-4 max-h-[60vh] p-2 overflow-auto">
                    <Controller
                      name="requestStatus"
                      control={control}
                      render={({ field, fieldState: { error } }) => (
                        <NewSelect
                          isRequired
                          label="Status"
                          errorMessage={error?.message}
                          isInvalid={!!error}
                          data={vendorsStatus || []}
                          labelKey="statusName"
                          valueKey="statusName"
                          name="requestStatus"
                          value={field.value}
                          onChange={(value) => {
                            field.onChange(value);
                            setStatusIsFinished(value === "Finished");
                            setStatusIsCanceled(value === "Cancel");
                          }}
                        />
                      )}
                    />

                    {statusIsFinished && (
                      <>
                        <Controller
                          name="quotationFilePath"
                          control={control}
                          render={({ field, fieldState: { error } }) => (
                            <FileUploader
                              uploadingType="multiple"
                              isRequired
                              label="Reference attachements"
                              value={field.value}
                              onChange={(value) => {
                                field.onChange(value);
                              }}
                            />
                          )}
                        />
                        <Controller
                          name="quotationAmount"
                          control={control}
                          render={({ field, fieldState: { error } }) => (
                            <Input
                              label="Quotation amount"
                              value={field.value}
                              onChange={(e) => field.onChange(e.target.value)}
                            />
                          )}
                        />
                        <Controller
                          name="additionalMailId"
                          control={control}
                          render={({ field, fieldState: { error } }) => (
                            <Input
                              isRequired
                              label="Additional email"
                              errorMessage={error?.message}
                              isInvalid={!!error}
                              value={field.value}
                              onChange={(e) => field.onChange(e.target.value)}
                            />
                          )}
                        />
                        <Controller
                          name="agreementName"
                          control={control}
                          render={({ field, fieldState: { error } }) => (
                            <Input
                              label="Agreement name"
                              errorMessage={error?.message}
                              isInvalid={!!error}
                              value={field.value}
                              onChange={(e) => field.onChange(e.target.value)}
                            />
                          )}
                        />
                        <Controller
                          name="agreementWithClientDocumentPath"
                          control={control}
                          render={({ field, fieldState: { error } }) => (
                            <FileUploader
                              uploadingType="multiple"
                              label="Agreement attachements"
                              value={field.value}
                              onChange={(value) => {
                                field.onChange(value);
                              }}
                            />
                          )}
                        />
                        <Controller
                          name="researchName"
                          control={control}
                          render={({ field, fieldState: { error } }) => (
                            <Input
                              label="Research name"
                              errorMessage={error?.message}
                              isInvalid={!!error}
                              value={field.value}
                              onChange={(e) => field.onChange(e.target.value)}
                            />
                          )}
                        />
                        <Controller
                          name="researchDocumentPath"
                          control={control}
                          render={({ field, fieldState: { error } }) => (
                            <FileUploader
                              uploadingType="multiple"
                              label="Research attachements"
                              value={field.value}
                              onChange={(value) => {
                                field.onChange(value);
                              }}
                            />
                          )}
                        />
                      </>
                    )}

                    {statusIsCanceled ? (
                      <Controller
                        name="cancelReason"
                        control={control}
                        render={({ field, fieldState: { error } }) => (
                          <Input
                            isRequired
                            label="Reason"
                            value={field.value}
                            onChange={(e) => field.onChange(e.target.value)}
                          />
                        )}
                      />
                    ) : (
                      <>
                        <Controller
                          name="internalVendorPrices"
                          control={control}
                          render={({ field, fieldState: { error } }) => (
                            <Input
                              label="Amount given to vendor"
                              value={field.value}
                              onChange={(e) => field.onChange(e.target.value)}
                            />
                          )}
                        />
                        <Controller
                          name="externalVendorPrice"
                          control={control}
                          render={({ field, fieldState: { error } }) => (
                            <Input
                              label="Amount given by vendor"
                              value={field.value}
                              onChange={(e) => field.onChange(e.target.value)}
                            />
                          )}
                        />
                      </>
                    )}
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
    </div>
  );
};

export default VendorRequestDetail;
