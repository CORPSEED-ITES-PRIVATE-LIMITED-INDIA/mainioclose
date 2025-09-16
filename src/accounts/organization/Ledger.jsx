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
  ModalContent,
  ModalHeader,
  ModalBody,
  addToast,
  ModalFooter,
} from "@heroui/react";
import { ChevronDown, EllipsisVertical, Plus, Search } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import {
  createLedger,
  getAllLedger,
  getAllLedgerCounts,
  getAllLedgerType,
  getLedgerTypeById,
  updateLedger,
} from "../../toolkit/slices/organizationSlice";
import { Link } from "react-router-dom";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import NewSelect from "../../components/NewSelect";
import {
  getAllCountries,
  getAllStatesByCountryName,
} from "../../toolkit/slices/commonSlice";

export const columns = [
  { name: "ID", uid: "id" },
  { name: "NAME", uid: "name", sortable: true },
  { name: "TYPE", uid: "ledgerType", sortable: true },
  { name: "ACTIONS", uid: "actions" },
];

export function capitalize(s) {
  return s ? s.charAt(0).toUpperCase() + s.slice(1).toLowerCase() : "";
}

const INITIAL_VISIBLE_COLUMNS = ["id", "name", "ledgerType", "actions"];

const formSchema = (flages) =>
  z.object({
    name: z.string().min(1, "Please enter the ledger name"),
    ledgerTypeId: z.string().min(1, "please select ledger type"),
    ...(flages?.hsnSacPresent
      ? {
          hsnSacDetails: z.string().min(1, "please hsn sac details"),
          HsnSac: z.string().min(1, "please enter hsn sac"),
          hsnDescription: z.string().optional(),
        }
      : {}),
    ...(flages?.gstRateDetailPresent
      ? {
          gstRateDetails: z.string().min(1, "please enter gst rate details"),
          taxabilityType: z.string().min(1, "please enter taxiblity type "),
          gstRates: z.string().min(1, "please enter gst rate "),
        }
      : {}),

    ...(flages?.bankAccountPresent
      ? {
          accountHolderName: z
            .string()
            .min(1, "please enter account holder name "),
          accountNo: z.string().min(1, "please enter account account number "),
          ifscCode: z.string().min(1, "please enter IFSC code"),
          swiftCode: z.string().min(1, "please enter swift code"),
          bankName: z.string().min(1, "please enter bank name"),
          branch: z.string().min(1, "please enter branch name"),
        }
      : {}),

    email: z.string().min(1, "please enter email"),
    country: z.string().min(1, "please enter country"),
    state: z.string().min(1, "please enter state"),
    pin: z.string().min(1, "please enter pin"),
    address: z.string().min(1, "please enter address"),
  });

const defaultValues = {
  name: "",
  ledgerTypeId: "",
  hsnSacDetails: "",
  HsnSac: "",
  hsnDescription: "",
  gstRateDetails: "",
  taxabilityType: "",
  gstRates: "",
  accountHolderName: "",
  accountNo: "",
  ifscCode: "",
  swiftCode: "",
  bankName: "",
  branch: "",
  email: "",
  country: "",
  state: "",
  pin: "",
  address: "",
};

const Ledger = () => {
  const dispatch = useDispatch();
  const { isOpen, onOpen, onClose, onOpenChange } = useDisclosure();
  const data = useSelector((state) => state.organization.ledgerList);
  const count = useSelector((state) => state.organization.ledgerCount);
  const countryList = useSelector((state) => state.common.countriesList);
  const statesList = useSelector((state) => state.common.statesList);
  const ledgerTypeList = useSelector(
    (state) => state.organization.ledgerTypeList
  );
  const [filterValue, setFilterValue] = React.useState("");
  const [selectedKeys, setSelectedKeys] = React.useState(new Set([]));
  const [visibleColumns, setVisibleColumns] = React.useState(
    new Set(INITIAL_VISIBLE_COLUMNS)
  );
  const [rowsPerPage, setRowsPerPage] = React.useState(50);
  const [sortDescriptor, setSortDescriptor] = React.useState({
    column: "age",
    direction: "ascending",
  });
  const [ledgerForm, setLedgerForm] = useState({
    hsnSacPresent: false,
    gstRateDetailPresent: false,
    bankAccountPresent: false,
  });
  const [editData, setEditData] = useState(null);
  const [page, setPage] = React.useState(1);
  const hasSearchFilter = Boolean(filterValue);

  useEffect(() => {
    dispatch(getAllLedger({ page, size: rowsPerPage }));
  }, [dispatch, page, rowsPerPage]);

  useEffect(() => {
    dispatch(getAllLedgerCounts());
    dispatch(getAllCountries());
    dispatch(getAllLedgerType());
  }, [dispatch]);

  const headerColumns = React.useMemo(() => {
    if (visibleColumns === "all") return columns;

    return columns.filter((column) =>
      Array.from(visibleColumns).includes(column.uid)
    );
  }, [visibleColumns]);

  const filteredItems = React.useMemo(() => {
    let filteredUsers = [...data];

    if (hasSearchFilter) {
      filteredUsers = filteredUsers.filter((user) =>
        user.name.toLowerCase().includes(filterValue.toLowerCase())
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
    getValues,
  } = useForm({
    resolver: zodResolver(formSchema(ledgerForm)),
    defaultValues,
  });

  const getLedgerType = (e) => {
    dispatch(getLedgerTypeById(e)).then((resp) => {
      if (resp.meta.requestStatus === "fulfilled") {
        let data = resp.payload;
        const currentValues = getValues();

        if (data?.hsnSacPresent) {
          setLedgerForm((prev) => ({ ...prev, hsnSacPresent: true }));
          reset({
            ...currentValues,
            hsnSacDetails: data?.hsnSacDetails || currentValues.hsnSacDetails,
            HsnSac: data?.HsnSac || currentValues.HsnSac,
            hsnDescription:
              data?.hsnDescription || currentValues.hsnDescription,
          });
        } else {
          setLedgerForm((prev) => ({ ...prev, hsnSacPresent: false }));
          reset({
            ...currentValues,
            hsnSacDetails: "",
            HsnSac: "",
            hsnDescription: "",
          });
        }
        if (data?.gstRateDetailPresent) {
          setLedgerForm((prev) => ({ ...prev, gstRateDetailPresent: true }));
          reset({
            ...currentValues,
            gstRateDetails:
              data?.gstRateDetails || currentValues.gstRateDetails,
            taxabilityType:
              data?.taxabilityType || currentValues.taxabilityType,
            gstRates: data?.gstRates || currentValues.gstRates,
          });
        } else {
          setLedgerForm((prev) => ({ ...prev, gstRateDetailPresent: false }));
          reset({
            ...currentValues,
            gstRateDetails: "",
            taxabilityType: "",
            gstRates: "",
          });
        }
        if (data?.bankAccountPresent) {
          setLedgerForm((prev) => ({ ...prev, bankAccountPresent: true }));
          reset({
            ...currentValues,
            accountHolderName:
              data?.accountHolderName || currentValues.accountHolderName,
            accountNo: data?.accountNo || currentValues.accountNo,
            ifscCode: data?.ifscCode || currentValues.ifscCode,
            swiftCode: data?.swiftCode || currentValues.swiftCode,
            bankName: data?.bankName || currentValues.bankName,
            branch: data?.branch || currentValues.branch,
          });
        } else {
          setLedgerForm((prev) => ({ ...prev, bankAccountPresent: false }));
          reset({
            ...currentValues,
            accountHolderName: "",
            accountNo: "",
            ifscCode: "",
            swiftCode: "",
            bankName: "",
            branch: "",
          });
        }
      }
    });
  };

  const handleEdit = (value) => {
    const currentValues = getValues();
    getLedgerType(value?.ledgerType?.id);
    reset({
      ...currentValues,
      name: value?.name,
      ledgerTypeId: value?.ledgerType?.id,
      email: value?.email,
      pin: value?.pin,
      state: value?.state,
      country: value?.country,
      address: value?.address,
    });
    onOpen();
    setEditData(value);
  };

  const onSubmit = (values) => {
    if (editData) {
      dispatch(updateLedger({ ...values, id: editData?.id, ...ledgerForm }))
        .then((resp) => {
          if (resp.meta.requestStatus === "fulfilled") {
            addToast({
              title: "Ledger updated successfully !.",
              color: "success",
            });
            onOpenChange(false);
            dispatch(getAllLedger({ page, size: rowsPerPage }));
            reset(defaultValues);
            setEditData(null);
            setLedgerForm({
              hsnSacPresent: false,
              gstRateDetailPresent: false,
              bankAccountPresent: false,
            });
          } else {
            addToast({ title: "Something went wrong !.", color: "danger" });
          }
        })
        .catch(() =>
          addToast({ title: "Something went wrong !.", color: "danger" })
        );
    } else {
      dispatch(createLedger({ ...values, ...ledgerForm }))
        .then((resp) => {
          if (resp.meta.requestStatus === "fulfilled") {
            addToast({
              title: "Ledger created successfully !.",
              color: "success",
            });
            onOpenChange(false);
            dispatch(getAllLedger({ page, size: rowsPerPage }));
            reset(defaultValues);
            setLedgerForm({
              hsnSacPresent: false,
              gstRateDetailPresent: false,
              bankAccountPresent: false,
            });
          } else {
            addToast({ title: "Something went wrong !.", color: "danger" });
          }
        })
        .catch(() =>
          addToast({ title: "Something went wrong !.", color: "danger" })
        );
    }
  };

  const renderCell = React.useCallback((rowData, columnKey) => {
    const cellValue = rowData[columnKey];
    switch (columnKey) {
      case "name":
        return (
          <Link
            to={`${rowData?.id}/ledgerDetail`}
            className="text-sm font-medium capitalize text-blue-500"
          >
            {rowData?.name}
          </Link>
        );
      case "ledgerType":
        return (
          <p className="text-sm capitalize">{rowData?.ledgerType?.name}</p>
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
              <DropdownMenu
                selectionMode="single"
                onSelectionChange={(e) => {
                  if (Array.from(e)[0] == "edit") {
                    handleEdit(rowData);
                  }
                }}
              >
                <DropdownItem key="edit">Edit</DropdownItem>
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
            className="w-full sm:max-w-[44%]"
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
                  endContent={<ChevronDown className="text-small" />}
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
            <Button color="primary" endContent={<Plus />} onPress={onOpen}>
              Add ledger
            </Button>
          </div>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-default-400 text-small">
            Total {count} ledger
          </span>
          <label className="flex items-center text-default-400 text-small">
            Rows per page:
            <select
              className="bg-transparent outline-hidden text-default-400 text-small"
              onChange={onRowsPerPageChange}
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
    data.length,
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
  }, [selectedKeys, items.length, page, pages, hasSearchFilter]);

  return (
    <>
      <h1 className="font-sans text-2xl font-medium mb-1">Ledger list</h1>
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
              <ModalHeader>
                {editData ? "Update ledger" : "Add ledger"}
              </ModalHeader>
              <ModalBody>
                <form
                  onSubmit={handleSubmit(onSubmit)}
                  className="flex flex-col gap-4"
                >
                  <div className="grid grid-cols-2 gap-4 max-h-[60vh] overflow-auto px-2">
                    <Controller
                      name="name"
                      control={control}
                      render={({ field }) => (
                        <Input
                          label="Ledger name"
                          isRequired
                          value={field.value}
                          onChange={field.onChange}
                          errorMessage={errors.userName?.message}
                          isInvalid={!!errors.userName}
                        />
                      )}
                    />
                    <Controller
                      name="ledgerTypeId"
                      control={control}
                      render={({ field }) => (
                        <NewSelect
                          isRequired={true}
                          data={ledgerTypeList}
                          label={"Select ledger type"}
                          name={"ledgerTypeId"}
                          labelKey={"name"}
                          valueKey={"id"}
                          value={field.value}
                          onChange={(selectedSet) => {
                            field.onChange(selectedSet);
                            getLedgerType(selectedSet);
                          }}
                        />
                      )}
                    />

                    {ledgerForm?.hsnSacPresent && (
                      <>
                        <Controller
                          name="hsnSacDetails"
                          control={control}
                          render={({ field }) => (
                            <Input
                              label="HSN Sac details"
                              isRequired
                              value={field.value}
                              onChange={field.onChange}
                              errorMessage={errors.userName?.message}
                              isInvalid={!!errors.userName}
                            />
                          )}
                        />
                        <Controller
                          name="HsnSac"
                          control={control}
                          render={({ field }) => (
                            <Input
                              label="HSN Sac"
                              isRequired
                              value={field.value}
                              onChange={field.onChange}
                              errorMessage={errors.userName?.message}
                              isInvalid={!!errors.userName}
                            />
                          )}
                        />
                        <Controller
                          name="hsnDescription"
                          control={control}
                          render={({ field }) => (
                            <Input
                              label="HSN description"
                              value={field.value}
                              onChange={field.onChange}
                              errorMessage={errors.userName?.message}
                              isInvalid={!!errors.userName}
                            />
                          )}
                        />
                      </>
                    )}
                    {ledgerForm?.gstRateDetailPresent && (
                      <>
                        <Controller
                          name="gstRateDetails"
                          control={control}
                          render={({ field }) => (
                            <Input
                              label="GST rate detail"
                              isRequired
                              value={field.value}
                              onChange={field.onChange}
                              errorMessage={errors.userName?.message}
                              isInvalid={!!errors.userName}
                            />
                          )}
                        />
                        <Controller
                          name="taxabilityType"
                          control={control}
                          render={({ field }) => (
                            <Input
                              label="Taxability type"
                              isRequired
                              value={field.value}
                              onChange={field.onChange}
                              errorMessage={errors.userName?.message}
                              isInvalid={!!errors.userName}
                            />
                          )}
                        />
                        <Controller
                          name="gstRates"
                          control={control}
                          render={({ field }) => (
                            <Input
                              label="GST rate"
                              isRequired
                              value={field.value}
                              onChange={field.onChange}
                              errorMessage={errors.userName?.message}
                              isInvalid={!!errors.userName}
                            />
                          )}
                        />
                      </>
                    )}
                    {ledgerForm?.bankAccountPresent && (
                      <>
                        <Controller
                          name="accountHolderName"
                          control={control}
                          render={({ field }) => (
                            <Input
                              label="Account holder name"
                              isRequired
                              value={field.value}
                              onChange={field.onChange}
                              errorMessage={errors.userName?.message}
                              isInvalid={!!errors.userName}
                            />
                          )}
                        />
                        <Controller
                          name="accountNo"
                          control={control}
                          render={({ field }) => (
                            <Input
                              label="Account number"
                              isRequired
                              value={field.value}
                              onChange={field.onChange}
                              errorMessage={errors.userName?.message}
                              isInvalid={!!errors.userName}
                            />
                          )}
                        />
                        <Controller
                          name="ifscCode"
                          control={control}
                          render={({ field }) => (
                            <Input
                              label="IFSC code"
                              isRequired
                              value={field.value}
                              onChange={field.onChange}
                              errorMessage={errors.userName?.message}
                              isInvalid={!!errors.userName}
                            />
                          )}
                        />
                        <Controller
                          name="swiftCode"
                          control={control}
                          render={({ field }) => (
                            <Input
                              label="Swift code"
                              isRequired
                              value={field.value}
                              onChange={field.onChange}
                              errorMessage={errors.userName?.message}
                              isInvalid={!!errors.userName}
                            />
                          )}
                        />
                        <Controller
                          name="bankName"
                          control={control}
                          render={({ field }) => (
                            <Input
                              label="Bank name"
                              isRequired
                              value={field.value}
                              onChange={field.onChange}
                              errorMessage={errors.userName?.message}
                              isInvalid={!!errors.userName}
                            />
                          )}
                        />
                        <Controller
                          name="branch"
                          control={control}
                          render={({ field }) => (
                            <Input
                              label="Branch name"
                              isRequired
                              value={field.value}
                              onChange={field.onChange}
                              errorMessage={errors.userName?.message}
                              isInvalid={!!errors.userName}
                            />
                          )}
                        />
                      </>
                    )}

                    <Controller
                      name="email"
                      control={control}
                      render={({ field }) => (
                        <Input
                          label="Email"
                          type="email"
                          isRequired
                          value={field.value}
                          onChange={field.onChange}
                          errorMessage={errors.userName?.message}
                          isInvalid={!!errors.userName}
                        />
                      )}
                    />
                    <Controller
                      name="address"
                      control={control}
                      render={({ field }) => (
                        <Input
                          label="Address"
                          isRequired
                          value={field.value}
                          onChange={field.onChange}
                          errorMessage={errors.userName?.message}
                          isInvalid={!!errors.userName}
                        />
                      )}
                    />

                    <Controller
                      name="country"
                      control={control}
                      render={({ field, fieldState: { error } }) => (
                        <NewSelect
                          label="Country"
                          isRequired={true}
                          errorMessage={error?.message}
                          isInvalid={!!error}
                          data={countryList || []}
                          labelKey="name"
                          valueKey="name"
                          value={field.value}
                          onChange={(value) => {
                            dispatch(getAllStatesByCountryName(value));
                            field.onChange(value);
                          }}
                        />
                      )}
                    />

                    <Controller
                      name="state"
                      control={control}
                      render={({ field, fieldState: { error } }) => (
                        <NewSelect
                          label="State"
                          isRequired={true}
                          errorMessage={error?.message}
                          isInvalid={!!error}
                          data={statesList || []}
                          labelKey="name"
                          valueKey="name"
                          value={field.value}
                          onChange={(value) => {
                            field.onChange(value);
                          }}
                        />
                      )}
                    />

                    <Controller
                      name="pin"
                      control={control}
                      render={({ field }) => (
                        <Input
                          label="Pin code"
                          isRequired
                          value={field.value}
                          onChange={field.onChange}
                          errorMessage={errors.userName?.message}
                          isInvalid={!!errors.userName}
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

export default Ledger;
