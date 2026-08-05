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
  ModalContent,
  ModalFooter,
  ModalHeader,
  Select,
  SelectItem,
  addToast,
} from "@heroui/react";
import { ChevronDown, EllipsisVertical, Plus, Search } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { useMediaQuery } from "react-responsive";
import {
  createStatutory,
  getAllLedgerType,
  getAllStatutoryList,
  updateStatutory,
} from "../../../toolkit/slices/organizationSlice";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import * as z from "zod";
import NewSelect from "../../../components/NewSelect";

export const columns = [
  { name: "ID", uid: "id" },
  { name: "NAME", uid: "name", sortable: true },
  { name: "DEBIT/CREDIT", uid: "debitCredit" },
  { name: "USED FOR CALCULATION", uid: "usedForCalculation" },
  { name: "SUB LEDGER", uid: "subLeadger" },
  { name: "ACTIONS", uid: "actions" },
];

export function capitalize(s) {
  return s ? s.charAt(0).toUpperCase() + s.slice(1).toLowerCase() : "";
}

const INITIAL_VISIBLE_COLUMNS = [
  "id",
  "name",
  "debitCredit",
  "usedForCalculation",
  "subLeadger",
  "actions",
];

const statFormSchema = (flagValues) =>
  z.object({
    id: z.string().min(1, "Please select ledger type."),
    hsnSacPresent: z.boolean(),
    ...(flagValues?.hsnSacPresent
      ? {
          hsnSacDetails: z.string().min(1, "Please enter hsn sac details"),
          hsnSacData: z.string().min(1, "Please enter hsn sac data"),
          hsnDescription: z.string().min(1, "Please enter hsn sac description"),
        }
      : {}),
    gstRateDetailPresent: z.boolean(),
    ...(flagValues?.gstRateDetailPresent
      ? {
          gstRateDetails: z.string().min(1, "Please enter gst rate details"),
          taxabilityType: z.string().min(1, "Please enter taxibility type"),
          gstRatesData: z.string().min(1, "Please enter gst rate data"),
        }
      : {}),
    bankAccountPresent: z.boolean(),
    ...(flagValues?.bankAccountPresent
      ? {
          bankName: z.string().min(1, "Please enter bank name"),
          accountNo: z.string().min(1, "Please enter account number"),
          ifscCode: z.string().min(1, "Please enter IFSC code"),
          accountHolderName: z
            .string()
            .min(1, "Please enter account holder name"),
          swiftCode: z.string().min(1, "Please enter swift code"),
        }
      : {}),
    classification: z.string().min(1, "Please enter classification"),
  });

const statDefaultValues = {
  id: "",
  hsnSacPresent: "",
  hsnSacDetails: "",
  hsnSacData: "",
  hsnDescription: "",
  gstRateDetailPresent: "",
  gstRateDetails: "",
  taxabilityType: "",
  gstRatesData: "",
  bankAccountPresent: "",
  bankName: "",
  accountNo: "",
  ifscCode: "",
  accountHolderName: "",
  swiftCode: "",
  classification: "",
};

const Statutory = () => {
  const dispatch = useDispatch();
  const { userId } = useParams();
  const statutoryModal = useDisclosure();
  const data = useSelector((state) => state.organization.statutoryList);
  const count = useSelector(
    (state) => state.organization.statutoryList?.length,
  );
  const ledgerTypeList = useSelector(
    (state) => state.organization.ledgerTypeList,
  );
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
  const [flagValues, setFlagValues] = useState({
    hsnSacPresent: false,
    gstRateDetailPresent: false,
    bankAccountPresent: false,
  });
  const [editData, setEditData] = useState(null);

  const isMedium = useMediaQuery({ minWidth: 768, maxWidth: 1535 });
  const isLarge = useMediaQuery({ minWidth: 1536 });

  useEffect(() => {
    dispatch(getAllStatutoryList(userId));
  }, [dispatch]);

  const statForm = useForm({
    resolver: zodResolver(statFormSchema(flagValues)),
    defaultValues: statDefaultValues,
  });

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
          String(val)?.toLowerCase().includes(filterValue.toLowerCase()),
        ),
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

  const handleOpenStatModal = () => {
    dispatch(getAllLedgerType());
    statutoryModal.onOpen();
  };

  const handleEdit = (value) => {
    dispatch(getAllLedgerType());
    statForm.reset({
      id: value?.id,
      hsnSacPresent: value?.hsnSacPresent,
      hsnSacDetails: value?.hsnSacDetails,
      hsnSacData: value?.hsnSacData,
      hsnDescription: value?.hsnDescription,
      gstRateDetailPresent: value?.gstRateDetailPresent,
      gstRateDetails: value?.gstRateDetails,
      taxabilityType: value?.taxabilityType,
      gstRatesData: value?.gstRatesData,
      bankAccountPresent: value?.bankAccountPresent,
      bankName: value?.bankName,
      accountNo: value?.accountNo,
      ifscCode: value?.ifscCode,
      accountHolderName: value?.accountHolderName,
      swiftCode: value?.swiftCode,
      classification: value?.classification,
    });
    setFlagValues({
      hsnSacPresent: value?.hsnSacPresent,
      gstRateDetailPresent: value?.gstRateDetailPresent,
      bankAccountPresent: value?.bankAccountPresent,
    });
    statutoryModal.onOpen();
    setEditData(value);
  };

  const handleFinish = (values) => {
    if (editData) {
      dispatch(updateStatutory({ ...values, id: editData?.id }))
        .then((resp) => {
          if (resp.meta.requestStatus === "fulfilled") {
            addToast({
              title: "Statutory updated successfully !.",
              color: "success",
            });
            statutoryModal.onClose();
            dispatch(getAllStatutoryList(userId));
            statForm.reset(statDefaultValues);
            setEditData(null);
          } else {
            addToast({ title: "Something went wrong !.", color: "danger" });
          }
        })
        .catch(() =>
          addToast({ title: "Something went wrong !.", color: "danger" }),
        );
    } else {
      dispatch(createStatutory(values))
        .then((resp) => {
          if (resp.meta.requestStatus === "fulfilled") {
            addToast({
              title: "Statutory created successfully !.",
              color: "success",
            });
            statutoryModal.onClose();
            dispatch(getAllStatutoryList(userId));
            statForm.reset(statDefaultValues);
          } else {
            addToast({ title: "Something went wrong !.", color: "danger" });
          }
        })
        .catch(() =>
          addToast({ title: "Something went wrong !.", color: "danger" }),
        );
    }
  };

  const renderCell = React.useCallback((rowData, columnKey) => {
    const cellValue = rowData[columnKey];
    switch (columnKey) {
      case "name":
        return (
          <p className="text-sm font-medium capitalize">{rowData?.name}</p>
        );
      case "debitCredit":
        return <p className="text-sm">{rowData?.debitCredit}</p>;
      case "usedForCalculation":
        return (
          <p className="text-sm capitalize">{rowData?.usedForCalculation}</p>
        );
      case "subLeadger":
        return <p className="text-sm capitalize">{rowData?.subLeadger}</p>;
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
                <DropdownItem key="edit" onPress={() => handleEdit(rowData)}>
                  Edit
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
            size={isMedium ? "sm" : isLarge ? "md" : ""}
            className="w-full sm:max-w-[35%]"
            placeholder="Search ..."
            startContent={<Search />}
            value={filterValue}
            onClear={() => onClear()}
            onValueChange={onSearchChange}
          />
          <div className="flex gap-3">
            <Button
              endContent={<Plus />}
              variant="flat"
              size={isMedium ? "sm" : isLarge ? "md" : ""}
              onPress={handleOpenStatModal}
            >
              Add
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
          <span className="text-default-400 text-small">
            Total {count} statutory
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
    isMedium,
    isLarge,
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
          size={isMedium ? "sm" : isLarge ? "md" : ""}
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
  }, [selectedKeys, count, page, pages, hasSearchFilter, isMedium, isLarge]);

  return (
    <>
      <h1 className="font-sans text-lg font-semibold mb-2 shrink-0">
        Statutory list
      </h1>
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
        isOpen={statutoryModal.isOpen}
        onOpenChange={statutoryModal.onOpenChange}
        placement="top-center"
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader>Add statutory</ModalHeader>
              <ModalBody>
                <form onSubmit={statForm.handleSubmit(handleFinish)}>
                  <div className="grid grid-cols-2 gap-4 max-h-[60vh] overflow-auto">
                    <Controller
                      name="id"
                      control={statForm.control}
                      render={({ field, fieldState: { error } }) => (
                        <NewSelect
                          size={isMedium ? "sm" : isLarge ? "md" : ""}
                          isRequired={true}
                          data={ledgerTypeList}
                          label={"Select ledger type"}
                          name={"id"}
                          labelKey={"name"}
                          valueKey={"id"}
                          value={field.value}
                          onChange={(selectedSet) => {
                            field.onChange(selectedSet);
                          }}
                        />
                      )}
                    />

                    <Controller
                      name="hsnSacPresent"
                      control={statForm.control}
                      render={({ field, fieldState: { error } }) => (
                        <Select
                          label="HSN Sac present"
                          isRequired
                          size={isMedium ? "sm" : isLarge ? "md" : ""}
                          selectedKeys={
                            field.value !== undefined
                              ? [field.value.toString()]
                              : []
                          }
                          onSelectionChange={(keys) => {
                            const value = Array.from(keys)[0];
                            if (value !== undefined)
                              field.onChange(value === "true");
                            setFlagValues((prev) => ({
                              ...prev,
                              hsnSacPresent: value === "true",
                            }));
                          }}
                          errorMessage={error?.message}
                          isInvalid={!!error}
                        >
                          {[
                            { label: "True", value: true },
                            { label: "False", value: false },
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

                    {flagValues?.hsnSacPresent && (
                      <>
                        <Controller
                          name="hsnSacDetails"
                          control={statForm.control}
                          render={({ field }) => (
                            <Input
                              isRequired
                              size={isMedium ? "sm" : isLarge ? "md" : ""}
                              label="HSN sac details"
                              name="hsnSacDetails"
                              value={field.value}
                              onChange={(e) => {
                                field.onChange(e.target.value);
                              }}
                            />
                          )}
                        />

                        <Controller
                          name="hsnSacData"
                          control={statForm.control}
                          render={({ field }) => (
                            <Input
                              isRequired
                              size={isMedium ? "sm" : isLarge ? "md" : ""}
                              label="HSN sac data"
                              name="hsnSacData"
                              value={field.value}
                              onChange={(e) => {
                                field.onChange(e.target.value);
                              }}
                            />
                          )}
                        />
                        <Controller
                          name="hsnDescription"
                          control={statForm.control}
                          render={({ field }) => (
                            <Input
                              size={isMedium ? "sm" : isLarge ? "md" : ""}
                              isRequired
                              label="HSN sac description"
                              value={field.value}
                              name="hsnDescription"
                              onChange={(e) => {
                                field.onChange(e.target.value);
                              }}
                            />
                          )}
                        />
                      </>
                    )}

                    <Controller
                      name="gstRateDetailPresent"
                      control={statForm.control}
                      render={({ field, fieldState: { error } }) => (
                        <Select
                          label="GST rate"
                          size={isMedium ? "sm" : isLarge ? "md" : ""}
                          isRequired
                          selectedKeys={
                            field.value !== undefined
                              ? [field.value.toString()]
                              : []
                          }
                          onSelectionChange={(keys) => {
                            const value = Array.from(keys)[0];
                            if (value !== undefined)
                              field.onChange(value === "true");
                            setFlagValues((prev) => ({
                              ...prev,
                              gstRateDetailPresent: value === "true",
                            }));
                          }}
                          errorMessage={error?.message}
                          isInvalid={!!error}
                        >
                          {[
                            { label: "True", value: true },
                            { label: "False", value: false },
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

                    {flagValues?.gstRateDetailPresent && (
                      <>
                        <Controller
                          name="gstRateDetails"
                          control={statForm.control}
                          render={({ field, fieldState: { error } }) => (
                            <Input
                              size={isMedium ? "sm" : isLarge ? "md" : ""}
                              isRequired
                              label="GST rate detail"
                              value={field.value}
                              name="gstRateDetails"
                              onChange={(e) => {
                                field.onChange(e.target.value);
                              }}
                            />
                          )}
                        />
                        <Controller
                          name="taxabilityType"
                          control={statForm.control}
                          render={({ field, fieldState: { error } }) => (
                            <Input
                              size={isMedium ? "sm" : isLarge ? "md" : ""}
                              isRequired
                              label="Taxability type"
                              value={field.value}
                              name="taxabilityType"
                              onChange={(e) => {
                                field.onChange(e.target.value);
                              }}
                            />
                          )}
                        />
                        <Controller
                          name="gstRatesData"
                          control={statForm.control}
                          render={({ field, fieldState: { error } }) => (
                            <Input
                              size={isMedium ? "sm" : isLarge ? "md" : ""}
                              isRequired
                              label="GST rate data"
                              value={field.value}
                              name="gstRatesData"
                              onChange={(e) => {
                                field.onChange(e.target.value);
                              }}
                            />
                          )}
                        />
                      </>
                    )}

                    <Controller
                      name="bankAccountPresent"
                      control={statForm.control}
                      render={({ field, fieldState: { error } }) => (
                        <Select
                          size={isMedium ? "sm" : isLarge ? "md" : ""}
                          label="Bank account present"
                          isRequired
                          selectedKeys={
                            field.value !== undefined
                              ? [field.value.toString()]
                              : []
                          }
                          onSelectionChange={(keys) => {
                            const value = Array.from(keys)[0];
                            if (value !== undefined)
                              field.onChange(value === "true");
                            setFlagValues((prev) => ({
                              ...prev,
                              bankAccountPresent: value === "true",
                            }));
                          }}
                          errorMessage={error?.message}
                          isInvalid={!!error}
                        >
                          {[
                            { label: "True", value: true },
                            { label: "False", value: false },
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

                    {flagValues?.bankAccountPresent && (
                      <>
                        <Controller
                          name="bankName"
                          control={statForm.control}
                          render={({ field, fieldState: { error } }) => (
                            <Input
                              size={isMedium ? "sm" : isLarge ? "md" : ""}
                              isRequired
                              label="Bank name"
                              value={field.value}
                              name="bankName"
                              onChange={(e) => {
                                field.onChange(e.target.value);
                              }}
                            />
                          )}
                        />
                        <Controller
                          name="accountNo"
                          control={statForm.control}
                          render={({ field, fieldState: { error } }) => (
                            <Input
                              size={isMedium ? "sm" : isLarge ? "md" : ""}
                              isRequired
                              label="Account number"
                              value={field.value}
                              name="accountNo"
                              onChange={(e) => {
                                field.onChange(e.target.value);
                              }}
                            />
                          )}
                        />
                        <Controller
                          name="ifscCode"
                          control={statForm.control}
                          render={({ field, fieldState: { error } }) => (
                            <Input
                              size={isMedium ? "sm" : isLarge ? "md" : ""}
                              isRequired
                              label="IFSC code"
                              value={field.value}
                              name="ifscCode"
                              onChange={(e) => {
                                field.onChange(e.target.value);
                              }}
                            />
                          )}
                        />
                        <Controller
                          name="accountHolderName"
                          control={statForm.control}
                          render={({ field, fieldState: { error } }) => (
                            <Input
                              size={isMedium ? "sm" : isLarge ? "md" : ""}
                              isRequired
                              label="Account holder name"
                              value={field.value}
                              name="accountHolderName"
                              onChange={(e) => {
                                field.onChange(e.target.value);
                              }}
                            />
                          )}
                        />
                        <Controller
                          name="swiftCode"
                          control={statForm.control}
                          render={({ field, fieldState: { error } }) => (
                            <Input
                              isRequired
                              size={isMedium ? "sm" : isLarge ? "md" : ""}
                              label="Swift code"
                              value={field.value}
                              name="swiftCode"
                              onChange={(e) => {
                                field.onChange(e.target.value);
                              }}
                            />
                          )}
                        />
                      </>
                    )}

                    <Controller
                      name="classification"
                      control={statForm.control}
                      render={({ field, fieldState: { error } }) => (
                        <Input
                          isRequired
                          size={isMedium ? "sm" : isLarge ? "md" : ""}
                          label="Classification"
                          value={field.value}
                          name="classification"
                          onChange={(e) => {
                            field.onChange(e.target.value);
                          }}
                        />
                      )}
                    />
                  </div>
                  <ModalFooter className="flex justify-end">
                    <Button
                      onPress={onClose}
                      size={isMedium ? "sm" : isLarge ? "md" : ""}
                    >
                      Cancel
                    </Button>
                    <Button
                      color="primary"
                      type="submit"
                      size={isMedium ? "sm" : isLarge ? "md" : ""}
                    >
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

export default Statutory;
