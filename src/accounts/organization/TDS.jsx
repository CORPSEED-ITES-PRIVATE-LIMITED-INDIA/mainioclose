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
} from "@heroui/react";
import { ChevronDown, EllipsisVertical, Plus, Search } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import {
  claimTDS,
  createTDS,
  getAllTdsList,
  getTdsAmounts,
} from "../../toolkit/slices/organizationSlice";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import * as z from "zod";
import { inrCurrency } from "../../common";
import { useMediaQuery } from "react-responsive";
import FileUploader from "../../components/FileUploader";
import dayjs from "dayjs";
import { Link, useParams } from "react-router-dom";

export const columns = [
  { name: "ID", uid: "id" },
  { name: "ORGANIZATION", uid: "organization", sortable: true },
  { name: "TDS TYPE", uid: "tdsType" },
  { name: "TDS", uid: "tds" },
  { name: "AMOUNT", uid: "amount" },
  { name: "TDS CLAIM AMOUNT", uid: "tdsClaimAmount" },
  { name: "DOCUMENT", uid: "documents" },
  { name: "TDS DEDUCTED BY", uid: "tdsDeductBy" },
  { name: "ACTIONS", uid: "actions" },
];

export function capitalize(s) {
  return s ? s.charAt(0).toUpperCase() + s.slice(1).toLowerCase() : "";
}

const INITIAL_VISIBLE_COLUMNS = [
  "organization",
  "tdsType",
  "tds",
  "amount",
  "tdsClaimAmount",
  "documents",
  "tdsDeductBy",
  "actions",
];

const formSchema = z.object({
  organization: z.string().min(1, "Please enter organization name."),
  tdsType: z.string().min(1, "Please enter TDS type"),
  paymentRegisterId: z.string().min(1, "Please enter payment register id"),
  totalPaymentAmount: z.string().min(1, "Please enter total payment amount"),
  tdsPrecent: z.string().min(1, "Please enter TDS percentage"),
  tdsAmount: z.string().min(1, "Please enter TDS amount"),
  projectId: z.string().min(1, "Please enter project id"),
});

const tdsFormSchema = z.object({
  amount: z.string().min(1, "Please enter amount."),
  document: z.string().min(1, "Please upload the document."),
});

const defaultValues = {
  organization: "",
  tdsType: "",
  paymentRegisterId: "",
  totalPaymentAmount: "",
  tdsPrecent: "",
  tdsAmount: "",
  projectId: "",
};

const tdsFormDefaultValues = {
  amount: 0,
  document: "",
};

const TDS = () => {
  const { userId } = useParams();
  const dispatch = useDispatch();
  const { isOpen, onClose, onOpen, onOpenChange } = useDisclosure();
  const tdsModal = useDisclosure();
  const data = useSelector((state) => state.organization.tdsList);
  const tdsAmount = useSelector((state) => state.organization.tdsAmount);
  const count = useSelector((state) => state.organization.tdsList?.length);
  const [filterValue, setFilterValue] = React.useState("");
  const [selectedKeys, setSelectedKeys] = React.useState(new Set([]));
  const [visibleColumns, setVisibleColumns] = React.useState(
    new Set(INITIAL_VISIBLE_COLUMNS)
  );
  const [rowsPerPage, setRowsPerPage] = React.useState(50);
  const [sortDescriptor, setSortDescriptor] = React.useState({
    column: "organization",
    direction: "ascending",
  });
  const [rowItem, setRowItem] = useState(null);
  const [page, setPage] = React.useState(1);
  const hasSearchFilter = Boolean(filterValue);
  const isMedium = useMediaQuery({ minWidth: 768, maxWidth: 1535 });
  const isLarge = useMediaQuery({ minWidth: 1536 });

  useEffect(() => {
    dispatch(getAllTdsList());
    dispatch(getTdsAmounts());
  }, [dispatch]);

  const headerColumns = React.useMemo(() => {
    if (visibleColumns === "all") return columns;

    return columns.filter((column) =>
      Array.from(visibleColumns).includes(column.uid)
    );
  }, [visibleColumns]);

  const filteredItems = React.useMemo(() => {
    let filteredUsers = [...(data || [])];

    if (hasSearchFilter) {
      filteredUsers = filteredUsers?.filter((item) =>
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

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: zodResolver(formSchema),
    defaultValues,
  });

  const tdsForm = useForm({
    resolver: zodResolver(tdsFormSchema),
    defaultValues: tdsFormDefaultValues,
  });

  const onSubmit = useCallback(
    (values) => {
      dispatch(createTDS(values))
        .then((resp) => {
          if (resp.meta.requestStatus === "fulfilled") {
            addToast({
              title: "TDS created successfully !.",
              color: "success",
            });
            dispatch(getAllTdsList());
            onClose();
            reset();
          } else {
            addToast({ title: "Something went wrong !.", color: "danger" });
          }
        })
        .catch(() =>
          addToast({ title: "Something went wrong !.", color: "danger" })
        );
    },
    [dispatch, onClose, reset]
  );

  const onTdsClaimSubmit = useCallback(
    (values) => {
      dispatch(claimTDS({ id: rowItem?.id, tdsClaimBy: userId, ...values }))
        .then((resp) => {
          if (resp.meta.requestStatus === "fulfilled") {
            addToast({
              title: "TDS claimed successfully !.",
              color: "success",
            });
            dispatch(getAllTdsList());
            tdsModal.onClose();
            tdsForm.reset();
          } else {
            addToast({ title: "Something went wrong !.", color: "danger" });
          }
        })
        .catch(() =>
          addToast({ title: "Something went wrong !.", color: "danger" })
        );
    },
    [dispatch, tdsModal, tdsForm, rowItem, userId]
  );

  const renderCell = React.useCallback((rowData, columnKey) => {
    const cellValue = rowData[columnKey];
    switch (columnKey) {
      case "organization":
        return (
          <p className="text-sm font-medium capitalize">
            {rowData?.organization}
          </p>
        );
      case "tdsType":
        return <p className="text-sm capitalize">{rowData?.tdsType}</p>;
      case "tds":
        return (
          <div className="flex flex-col gap-2">
            <span className="text-sm">{rowData?.tdsPrecent} %</span>
          </div>
        );
      case "amount":
        return (
          <p className="text-sm capitalize">
            {inrCurrency(rowData?.tdsAmount)}
          </p>
        );
      case "tdsClaimAmount":
        return (
          <div>
            <p className="text-sm capitalize">
              {inrCurrency(rowData?.tdsClaimAmount)}
            </p>
            <span className="text-gray-400 text-sm">
              {dayjs(rowData?.claimDate).format("DD-MM-YYYY")}
            </span>
          </div>
        );
      case "documents":
        return (
          <div>
            {rowData?.documents ? (
              <Link className="font-bold" to={rowData?.documents}>
                <Button variant="flat" size="sm">
                  View
                </Button>
              </Link>
            ) : (
              <Button variant="flat" size="sm" isDisabled>
                No document
              </Button>
            )}
          </div>
        );
      case "tdsDeductBy":
        return <p>{rowData?.tdsDeductedBy?.fullName}</p>;
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
                  key="claimTds"
                  onPress={() => {
                    tdsModal.onOpen();
                    setRowItem(rowData);
                  }}
                >
                  Claim TDS
                </DropdownItem>
                {/* <DropdownItem key="edit">Edit</DropdownItem> */}
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
            placeholder="Search ..."
            size={isMedium ? "sm" : isLarge ? "md" : ""}
            startContent={<Search />}
            value={filterValue}
            onClear={() => onClear()}
            onValueChange={onSearchChange}
          />
          <div className="flex gap-3">
            <Button
              endContent={<Plus />}
              color="primary"
              onPress={onOpen}
              size={isMedium ? "sm" : isLarge ? "md" : ""}
            >
              Add TDS
            </Button>
            <Dropdown>
              <DropdownTrigger>
                <Button
                  endContent={<ChevronDown />}
                  variant="flat"
                  size={isMedium ? "sm" : isLarge ? "md" : ""}
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
          <span className="text-default-400 text-small">Total {count} TDS</span>
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
    isLarge,
    isMedium,
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
          size={isMedium ? "sm" : isLarge ? "md" : ""}
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
  }, [
    selectedKeys,
    items.length,
    page,
    pages,
    hasSearchFilter,
    isMedium,
    isLarge,
  ]);

  return (
    <>
      <h1 className="font-sans text-2xl font-medium mb-1">TDS list</h1>
      <Table
        isHeaderSticky
        aria-label="Example table with custom cells, pagination and sorting"
        bottomContent={bottomContent}
        bottomContentPlacement="outside"
        classNames={{
          wrapper: "2xl:max-h-[62vh] md:max-h-[55vh] w-full",
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
              <ModalHeader>Add TDS</ModalHeader>
              <ModalBody>
                <form onSubmit={handleSubmit(onSubmit)}>
                  <div className="grid grid-cols-2 gap-4 max-h-[60vh] overflow-auto">
                    <Controller
                      name="organization"
                      control={control}
                      render={({ field }) => (
                        <Input
                          isRequired
                          label="Organization name"
                          name="organization"
                          value={field.value}
                          onChange={(e) => {
                            field.onChange(e.target.value);
                          }}
                        />
                      )}
                    />
                    <Controller
                      name="tdsType"
                      control={control}
                      render={({ field }) => (
                        <Input
                          isRequired
                          label="TDS type"
                          name="tdsType"
                          value={field.value}
                          onChange={(e) => {
                            field.onChange(e.target.value);
                          }}
                        />
                      )}
                    />
                    <Controller
                      name="paymentRegisterId"
                      control={control}
                      render={({ field }) => (
                        <Input
                          isRequired
                          label="Payment register id"
                          name="paymentRegisterId"
                          value={field.value}
                          onChange={(e) => {
                            field.onChange(e.target.value);
                          }}
                        />
                      )}
                    />
                    <Controller
                      name="totalPaymentAmount"
                      control={control}
                      render={({ field }) => (
                        <Input
                          isRequired
                          label="Total payment amount"
                          value={field.value}
                          name="totalPaymentAmount"
                          onChange={(e) => {
                            field.onChange(e.target.value);
                          }}
                        />
                      )}
                    />
                    <Controller
                      name="tdsPrecent"
                      control={control}
                      render={({ field, fieldState: { error } }) => (
                        <Input
                          isRequired
                          type="number"
                          label="TDS percentage %"
                          value={field.value}
                          name="tdsPrecent"
                          onChange={(e) => {
                            field.onChange(e.target.value);
                          }}
                        />
                      )}
                    />
                    <Controller
                      name="tdsAmount"
                      control={control}
                      render={({ field, fieldState: { error } }) => (
                        <Input
                          isRequired
                          type="number"
                          label="TDS amount"
                          value={field.value}
                          name="tdsAmount"
                          onChange={(e) => {
                            field.onChange(e.target.value);
                          }}
                        />
                      )}
                    />
                    <Controller
                      name="projectId"
                      control={control}
                      render={({ field, fieldState: { error } }) => (
                        <Input
                          isRequired
                          label="Project id"
                          value={field.value}
                          name="projectId"
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
        size="2xl"
        isDismissable={false}
        isKeyboardDismissDisabled={true}
        isOpen={tdsModal.isOpen}
        onOpenChange={tdsModal.onOpenChange}
        placement="top-center"
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader>Claim TDS</ModalHeader>
              <ModalBody>
                <form onSubmit={tdsForm.handleSubmit(onTdsClaimSubmit)}>
                  <div className="grid gap-4 max-h-[60vh] overflow-auto">
                    <Controller
                      name="amount"
                      control={tdsForm.control}
                      render={({ field }) => (
                        <Input
                          isRequired
                          label="TDS amount"
                          type="number"
                          value={field.value}
                          onChange={(e) => {
                            field.onChange(e.target.value);
                          }}
                        />
                      )}
                    />
                    <Controller
                      name="document"
                      control={tdsForm.control}
                      render={({ field }) => (
                        <FileUploader
                          label={"Upload TDS document"}
                          value={field.value}
                          onChange={(e) => field.onChange(e)}
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
    </>
  );
};

export default TDS;
