import React, { useCallback, useEffect, useState } from "react";
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
  Chip,
  Select,
  SelectItem,
} from "@heroui/react";
import { ChevronDown, EllipsisVertical, Plus, Search } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import * as z from "zod";
import { useParams } from "react-router-dom";
import {
  getAllCompanyByStatus,
  getFormComment,
  searchCompanyForm,
  updateStatusById,
} from "../toolkit/slices/companySlice";
import { inrCurrency, maskEmail, maskMobileNumber } from "../common";
import CreateLeadCompanyForm from "../sales/company/CreateLeadCompanyForm";

export const columns = [
  { name: "ID", uid: "id" },
  { name: "LEAD ID", uid: "leadId" },
  { name: "COMPANY NAME", uid: "companyName", sortable: true },
  { name: "LEAD NAME", uid: "leadName", sortable: true },
  { name: "GST", uid: "gstNo" },
  { name: "AMOUNT", uid: "amount" },
  { name: "PRI.CONT", uid: "primaryContact" },
  { name: "SEC.CONT", uid: "secondaryContact" },
  { name: "ADDRESS", uid: "address" },
  { name: "SEC.ADDRESS", uid: "seconadryAddress" },
  { name: "INDUSTRY INFO", uid: "industry" },
  { name: "UPDATED BY", uid: "updatedBy" },
  { name: "ACTIONS", uid: "actions" },
];

export function capitalize(s) {
  return s ? s.charAt(0).toUpperCase() + s.slice(1).toLowerCase() : "";
}

const INITIAL_VISIBLE_COLUMNS = [
  "companyName",
  "leadName",
  "gstNo",
  "amount",
  "primaryContact",
  "address",
  "industry",
  "actions",
];

const formSchema = z.object({
  status: z.string().min(1, "Please select the status."),
  comment: z.string().min(1, "Please enter comment"),
});

const defaultValues = {
  status: "",
  comment: "",
};

const CompanyForm = () => {
  const dispatch = useDispatch();
  const { userId } = useParams();
  const companyModal = useDisclosure();
  const { isOpen, onOpen, onClose, onOpenChange } = useDisclosure();
  const data = useSelector((state) => state.company.allLeadCompanyList);
  const count = useSelector(
    (state) => state.company.allLeadCompanyList?.[0]?.totalLeadFor
  );
  const userRole = useSelector((state) => state.auth.currentUser?.roles);
  const admin = userRole.includes("ADMIN");
  const department = useSelector((state) => state.auth.getDepartmentDetail);
  const [filterValue, setFilterValue] = React.useState("");
  const [selectedKeys, setSelectedKeys] = React.useState(new Set([]));
  const [visibleColumns, setVisibleColumns] = React.useState(
    new Set(INITIAL_VISIBLE_COLUMNS)
  );
  const [status, setStatus] = useState("initiated");
  const [editData, setEditData] = useState(null);
  const [rowsPerPage, setRowsPerPage] = React.useState(50);
  const [sortDescriptor, setSortDescriptor] = React.useState({
    column: "age",
    direction: "ascending",
  });
  const [page, setPage] = React.useState(1);
  const hasSearchFilter = Boolean(filterValue);

  useEffect(() => {
    dispatch(
      getAllCompanyByStatus({
        id: userId,
        status: status,
        page: page,
        size: rowsPerPage,
      })
    );
  }, [dispatch, page, rowsPerPage, status]);

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

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: zodResolver(formSchema),
    defaultValues,
  });

  const handleEdit = (value) => {
    dispatch(getFormComment(value?.id)).then((resp) => {
      if (resp.meta.requestStatus === "fulfilled") {
        reset({
          comment: resp?.payload,
          status: value?.status,
        });
      }
    });
    onOpen();
    setEditData(value);
  };

  const handleEditCompany = (value) => {
    companyModal.onOpen();
    setEditData(value);
  };

  const onSubmit = useCallback(
    (values) => {
      dispatch(
        updateStatusById({
          status: values?.status,
          id: editData?.id,
          userid: userId,
        })
      )
        .then((resp) => {
          if (resp.meta.requestStatus === "fulfilled") {
            addToast({
              title: "Status update successfully",
              color: "success",
            });
            onClose();
            dispatch(
              getAllCompanyByStatus({
                id: userId,
                status: status,
                page: page,
                size: rowsPerPage,
              })
            );
          } else {
            addToast({
              title: "Something went wrong in status !.",
              color: "danger",
            });
          }
        })
        .catch(() => {
          addToast({
            title: "Something went wrong in status !.",
            color: "danger",
          });
        });
      dispatch(addCommentCompanyForm({ id: formId, comment: values?.comment }))
        .then((resp) => {
          if (resp.meta.requestStatus === "fulfilled") {
            addToast({
              title: "Comment update successfully",
              color: "success",
            });
            onClose();
          } else {
            addToast({
              title: "Something went wrong in comment !.",
              color: "danger",
            });
          }
        })
        .catch(() => {
          addToast({
            title: "Something went wrong in comment !.",
            color: "danger",
          });
        });
    },
    [editData, userId, dispatch]
  );

  const renderCell = React.useCallback(
    (rowData, columnKey) => {
      const cellValue = rowData[columnKey];
      switch (columnKey) {
        case "leadId":
          return <p className="text-sm capitalize">{rowData?.lead?.id}</p>;
        case "companyName":
          return (
            <div className="flex flex-col gap-1">
              <p className="text-sm font-medium capitalize">
                {rowData?.companyName}
              </p>
              <span className="text-muted-foreground text-xs">
                Age : {rowData?.companyAge || "-"} yrs
              </span>
              {rowData?.status === "approved" ? (
                <span className="text-green-500 text-xs capitalize">
                  {rowData?.status}
                </span>
              ) : rowData?.status === "disapproved" ? (
                <span className="text-red-500 text-xs capitalize">
                  {rowData?.status}
                </span>
              ) : (
                <span className="text-default-500 text-xs capitalize">
                  {rowData?.status}
                </span>
              )}
            </div>
          );
        case "leadName":
          return (
            <p className="text-sm capitalize">{rowData?.lead?.leadName}</p>
          );
        case "gstNo":
          return (
            <div className="flex flex-col gap-1">
              <span className="text-xs">{rowData?.gstNo}</span>
              <span className="text-xs">Pan : {rowData?.panNo}</span>
              <Chip color="default" size="sm">
                {rowData?.gstType}
              </Chip>
            </div>
          );
        case "amount":
          return (
            <p className="text-sm font-medium">
              {inrCurrency(rowData?.amount)}
            </p>
          );
        case "primaryContact":
          return (
            <div className="flex flex-col">
              <span className="text-sm">{rowData.contactName || "-"}</span>
              <span className="text-sm text-default-500">
                {admin
                  ? rowData?.contactEmails
                  : maskEmail(rowData?.contactEmails) || "-"}
              </span>
              <span className="text-sm text-default-500 ">
                {admin
                  ? rowData?.contactNo
                  : maskMobileNumber(rowData?.contactNo) || "-"}
                ,
              </span>
            </div>
          );
        case "secondaryContact":
          return (
            <div className="flex flex-col">
              <span className="text-sm">
                {rowData.secondaryContactName || "-"}
                {", "}
                <Chip color="secondary" size="sm">
                  {rowData?.secondaryDesignation?.name}
                </Chip>
              </span>
              <span className="text-sm text-default-500">
                {admin
                  ? rowData?.secondaryContactEmails
                  : maskEmail(rowData?.secondaryContactEmails) || "-"}
              </span>
              <span className="text-sm text-default-500">
                {admin
                  ? rowData?.secondaryContactNo
                  : maskMobileNumber(rowData?.secondaryContactNo) || "-"}
                ,
              </span>
            </div>
          );
        case "address":
          return (
            <div className="flex flex-col">
              <span className="font-normal text-sm">
                {rowData.address || "-"}
              </span>
              <span className="text-sm text-default-500">
                {rowData.city || ""},{rowData?.state},{rowData?.country}
              </span>
              <span className="text-sm text-default-500">
                {rowData.primaryPinCode || ""}
              </span>
            </div>
          );
        case "seconadryAddress":
          return (
            <div className="flex flex-col">
              <span className="font-normal text-sm">
                {rowData.sAddress || "-"}
              </span>
              <span className="text-sm text-default-500">
                {rowData.sCity || ""},{rowData?.sState},{rowData?.sCountry}
              </span>
              <span className="text-sm text-default-500">
                {rowData.secondaryPinCode || ""}
              </span>
            </div>
          );
        case "industry":
          return (
            <div className="flex flex-col gap-1">
              <span className="font-normal text-sm ">
                {rowData.industry || "-"}
              </span>
              <span className="text-xs  bg-amber-200 rounded p-1 dark:text-black">
                Sub : {rowData.subIndustry || ""}
              </span>
              <span className="text-xs  bg-blue-200 rounded p-1 dark:text-black">
                Category : {rowData.subSubIndustry || ""}
              </span>
              <span className="text-xs  bg-emerald-200 rounded p-1 dark:text-black">
                Business activity :{" "}
                {rowData.industryData?.map((item) => item?.name)?.join(",") ||
                  ""}
              </span>
            </div>
          );
        case "updatedBy":
          return (
            <p className="text-sm capitalize">{rowData?.updatedBy?.fullName}</p>
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
                <DropdownMenu selectionMode="single">
                  {department?.department === "Accounts" ||
                    (admin && (
                      <DropdownItem
                        key="action"
                        onPress={() => {
                          handleEdit(rowData);
                        }}
                      >
                        Action
                      </DropdownItem>
                    ))}
                  <DropdownItem
                    key="edit"
                    onPress={() => {
                      handleEditCompany(rowData);
                    }}
                  >
                    Edit
                  </DropdownItem>
                </DropdownMenu>
              </Dropdown>
            </div>
          );
        default:
          return cellValue;
      }
    },
    [data]
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
        dispatch(
          searchCompanyForm({
            inputText: value,
            userId: userId,
            page: page,
            size: rowsPerPage,
            status: status,
          })
        );
        setPage(1);
      } else {
        setFilterValue("");
        dispatch(
          getAllCompanyByStatus({
            id: userId,
            status: status,
            page: page,
            size: rowsPerPage,
          })
        );
      }
    },
    [page, rowsPerPage, status]
  );

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
                  { label: "Initiated", uid: "initiated" },
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
            Total {count} company form
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
      <h1 className="font-sans text-2xl font-medium mb-1">Company form</h1>
      <Table
        isHeaderSticky
        aria-label="Example table with custom cells, pagination and sorting"
        bottomContent={bottomContent}
        bottomContentPlacement="outside"
        classNames={{
          wrapper: "max-h-[65vh] max-w-[85vw]",
          table: "overflow-scroll",
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
        size="2xl"
        isDismissable={false}
        isKeyboardDismissDisabled={true}
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        placement="top-center"
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader>Approved and disapproved </ModalHeader>
              <ModalBody>
                <form onSubmit={handleSubmit(onSubmit)}>
                  <div className="grid gap-4 max-h-[60vh] overflow-auto">
                    <Controller
                      name="status"
                      control={control}
                      render={({ field, fieldState: { error } }) => (
                        <Select
                          label="Status"
                          isRequired
                          selectedKeys={
                            field.value !== undefined
                              ? [field.value.toString()]
                              : []
                          }
                          onSelectionChange={(keys) => {
                            const value = Array.from(keys)[0];
                            if (value !== undefined) field.onChange(value);
                          }}
                          errorMessage={"please select status"}
                          isInvalid={!!error}
                        >
                          {[
                            { label: "Approved", value: "approved" },
                            { label: "Disapproved", value: "disapproved" },
                          ].map((item) => (
                            <SelectItem
                              key={item.value.toString()}
                              value={item.value}
                            >
                              {item.label}
                            </SelectItem>
                          ))}
                        </Select>
                      )}
                    />
                    <Controller
                      name="comment"
                      control={control}
                      render={({ field }) => (
                        <Input
                          isRequired
                          errorMessage="please enter comment"
                          label="Comment"
                          name="comment"
                          value={field.value}
                          onChange={(e) => {
                            field.onChange(e.target.value);
                          }}
                        />
                      )}
                    />
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

      <Modal
        size="5xl"
        isDismissable={false}
        isKeyboardDismissDisabled={true}
        isOpen={companyModal.isOpen}
        onOpenChange={companyModal.onOpenChange}
        placement="top-center"
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader>Update company</ModalHeader>
              <ModalBody>
                <CreateLeadCompanyForm
                  edit={true}
                  companyData={editData}
                  onClose={onClose}
                  companyFilter={{
                    id: userId,
                    status: status,
                    page: page,
                    size: rowsPerPage,
                  }}
                />
              </ModalBody>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
};

export default CompanyForm;
