import React, { useEffect, useMemo, useState } from "react";
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
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
} from "@heroui/react";
import { ChevronDown, Search, Plus, Trash2 } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import {
  getAllCountries,
  createCountry,
} from "../../toolkit/slices/commonSlice";

const columns = [
  { name: "#", uid: "id" },
  { name: "PHONE CODE", uid: "phoneCode" },
  { name: "CURRENCY CODE", uid: "currencyCode" },
  { name: "COUNTRY", uid: "name" },
  { name: "ACTIONS", uid: "actions" },
];

const INITIAL_VISIBLE_COLUMNS = [
  "id",
  "name",
  "actions",
  "phoneCode",
  "currencyCode",
];

/* ---------------- Add Country modal (same file) ---------------- */

const emptyCountry = {
  name: "",
  iso2Code: "",
  iso3Code: "",
  phoneCode: "",
  currencyCode: "",
  currencyName: "",
  defaultTimezone: "",
};
const emptyCity = { name: "", cityCode: "", postalCode: "", timezone: "" };
const emptyState = {
  name: "",
  stateCode: "",
  gstCode: "",
  defaultTimezone: "",
  cities: [],
};

// drop blank optional strings so backend gets them as missing instead of ""
const clean = (obj) =>
  Object.fromEntries(
    Object.entries(obj).filter(([, v]) => typeof v !== "string" || v.trim()),
  );

const AddCountryModal = ({ isOpen, onOpenChange, onSuccess }) => {
  const dispatch = useDispatch();

  const [country, setCountry] = useState(emptyCountry);
  const [states, setStates] = useState([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const reset = () => {
    setCountry(emptyCountry);
    setStates([]);
    setError("");
  };

  const setCountryField = (key) => (value) =>
    setCountry((prev) => ({ ...prev, [key]: value }));

  const setStateField = (si, key, value) =>
    setStates((prev) =>
      prev.map((s, i) => (i === si ? { ...s, [key]: value } : s)),
    );

  const setCityField = (si, ci, key, value) =>
    setStates((prev) =>
      prev.map((s, i) =>
        i === si
          ? {
              ...s,
              cities: s.cities.map((c, j) =>
                j === ci ? { ...c, [key]: value } : c,
              ),
            }
          : s,
      ),
    );

  const addState = () => setStates((prev) => [...prev, { ...emptyState }]);
  const removeState = (si) =>
    setStates((prev) => prev.filter((_, i) => i !== si));

  const addCity = (si) =>
    setStates((prev) =>
      prev.map((s, i) =>
        i === si ? { ...s, cities: [...s.cities, { ...emptyCity }] } : s,
      ),
    );

  const removeCity = (si, ci) =>
    setStates((prev) =>
      prev.map((s, i) =>
        i === si ? { ...s, cities: s.cities.filter((_, j) => j !== ci) } : s,
      ),
    );

  const handleSubmit = async (onClose) => {
    setError("");

    if (
      !country.name.trim() ||
      !country.iso2Code.trim() ||
      !country.iso3Code.trim()
    ) {
      setError("Country name, ISO2 code and ISO3 code are required");
      return;
    }

    for (const s of states) {
      if (!s.name.trim()) {
        setError("Every state needs a name (remove empty state rows)");
        return;
      }
      for (const c of s.cities) {
        if (!c.name.trim()) {
          setError(`Every city needs a name (state: ${s.name})`);
          return;
        }
      }
    }

    const payload = {
      ...clean(country),
      ...(states.length > 0 && {
        states: states.map((s) => ({
          ...clean({ ...s, cities: undefined }),
          ...(s.cities.length > 0 && { cities: s.cities.map(clean) }),
        })),
      }),
    };

    try {
      setSaving(true);
      await dispatch(createCountry({ data: payload })).unwrap();
      reset();
      onSuccess?.();
      onClose();
    } catch (err) {
      setError(
        typeof err === "string"
          ? err
          : err?.message || "Failed to create country",
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      onClose={reset}
      size="3xl"
      scrollBehavior="inside"
      isDismissable={!saving}
    >
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="text-base">Add Country</ModalHeader>

            <ModalBody className="gap-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <Input
                  size="sm"
                  isRequired
                  label="Country name"
                  value={country.name}
                  onValueChange={setCountryField("name")}
                />
                <Input
                  size="sm"
                  isRequired
                  label="ISO2 code"
                  maxLength={2}
                  value={country.iso2Code}
                  onValueChange={setCountryField("iso2Code")}
                />
                <Input
                  size="sm"
                  isRequired
                  label="ISO3 code"
                  maxLength={3}
                  value={country.iso3Code}
                  onValueChange={setCountryField("iso3Code")}
                />
                <Input
                  size="sm"
                  label="Phone code"
                  placeholder="+91"
                  value={country.phoneCode}
                  onValueChange={setCountryField("phoneCode")}
                />
                <Input
                  size="sm"
                  label="Currency code"
                  maxLength={3}
                  value={country.currencyCode}
                  onValueChange={setCountryField("currencyCode")}
                />
                <Input
                  size="sm"
                  label="Currency name"
                  value={country.currencyName}
                  onValueChange={setCountryField("currencyName")}
                />
                <Input
                  size="sm"
                  label="Default timezone"
                  placeholder="Asia/Kolkata"
                  value={country.defaultTimezone}
                  onValueChange={setCountryField("defaultTimezone")}
                />
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">States (optional)</span>
                <Button
                  size="sm"
                  variant="flat"
                  startContent={<Plus className="w-4 h-4" />}
                  onPress={addState}
                >
                  Add state
                </Button>
              </div>

              {states.map((s, si) => (
                <div
                  key={si}
                  className="rounded-lg border border-default-200 p-3 flex flex-col gap-2"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-5 gap-2 items-center">
                    <Input
                      size="sm"
                      isRequired
                      label="State name"
                      value={s.name}
                      onValueChange={(v) => setStateField(si, "name", v)}
                    />
                    <Input
                      size="sm"
                      label="State code"
                      value={s.stateCode}
                      onValueChange={(v) => setStateField(si, "stateCode", v)}
                    />
                    <Input
                      size="sm"
                      label="GST code"
                      maxLength={5}
                      value={s.gstCode}
                      onValueChange={(v) => setStateField(si, "gstCode", v)}
                    />
                    <Input
                      size="sm"
                      label="Timezone"
                      value={s.defaultTimezone}
                      onValueChange={(v) =>
                        setStateField(si, "defaultTimezone", v)
                      }
                    />
                    <Button
                      size="sm"
                      color="danger"
                      variant="light"
                      startContent={<Trash2 className="w-4 h-4" />}
                      onPress={() => removeState(si)}
                    >
                      Remove
                    </Button>
                  </div>

                  {s.cities.map((c, ci) => (
                    <div
                      key={ci}
                      className="grid grid-cols-1 sm:grid-cols-5 gap-2 items-center pl-4 border-l-2 border-default-200"
                    >
                      <Input
                        size="sm"
                        isRequired
                        label="City name"
                        value={c.name}
                        onValueChange={(v) => setCityField(si, ci, "name", v)}
                      />
                      <Input
                        size="sm"
                        label="City code"
                        value={c.cityCode}
                        onValueChange={(v) =>
                          setCityField(si, ci, "cityCode", v)
                        }
                      />
                      <Input
                        size="sm"
                        label="Postal code"
                        value={c.postalCode}
                        onValueChange={(v) =>
                          setCityField(si, ci, "postalCode", v)
                        }
                      />
                      <Input
                        size="sm"
                        label="Timezone"
                        value={c.timezone}
                        onValueChange={(v) =>
                          setCityField(si, ci, "timezone", v)
                        }
                      />
                      <Button
                        size="sm"
                        isIconOnly
                        color="danger"
                        variant="light"
                        onPress={() => removeCity(si, ci)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}

                  <Button
                    size="sm"
                    variant="light"
                    className="self-start"
                    startContent={<Plus className="w-4 h-4" />}
                    onPress={() => addCity(si)}
                  >
                    Add city
                  </Button>
                </div>
              ))}

              {error && <p className="text-danger text-sm">{error}</p>}
            </ModalBody>

            <ModalFooter>
              <Button variant="flat" onPress={onClose} isDisabled={saving}>
                Cancel
              </Button>
              <Button
                color="primary"
                isLoading={saving}
                onPress={() => handleSubmit(onClose)}
              >
                Create Country
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};

/* ---------------- Country list ---------------- */

const CountryData = () => {
  const { userId } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { countriesList, loading } = useSelector((state) => state.common);
  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  const [filterValue, setFilterValue] = useState("");

  const [visibleColumns, setVisibleColumns] = useState(
    new Set(INITIAL_VISIBLE_COLUMNS),
  );

  const [initialFilteration, setInitialFilteration] = useState({
    page: 1,
    size: 50,
  });

  useEffect(() => {
    dispatch(getAllCountries());
  }, [dispatch]);

  const headerColumns = useMemo(() => {
    if (visibleColumns === "all") {
      return columns;
    }

    return columns.filter((column) =>
      Array.from(visibleColumns).includes(column.uid),
    );
  }, [visibleColumns]);

  const filteredItems = useMemo(() => {
    let filteredData = [...(countriesList || [])];

    if (filterValue) {
      filteredData = filteredData.filter((item) =>
        Object.values(item || {}).some((value) =>
          String(value).toLowerCase().includes(filterValue.toLowerCase()),
        ),
      );
    }

    return filteredData;
  }, [countriesList, filterValue]);

  const pages = Math.ceil(filteredItems.length / initialFilteration.size) || 1;

  const items = useMemo(() => {
    const start = (initialFilteration.page - 1) * initialFilteration.size;

    const end = start + initialFilteration.size;

    return filteredItems.slice(start, end);
  }, [filteredItems, initialFilteration.page, initialFilteration.size]);

  const handleCountryClick = (country) => {
    if (!country?.name) {
      return;
    }

    navigate(
      `/erp/${userId}/settings/country/state/${encodeURIComponent(country.name)}`,
    );
  };

  const renderCell = React.useCallback((rowData, columnKey) => {
    switch (columnKey) {
      case "id":
        return <span>{rowData?.id}</span>;
      case "currencyCode":
        return <span>{rowData?.currencyCode ?? "-"}</span>;
      case "phoneCode":
        return <span>{rowData?.phoneCode ?? "-"}</span>;

      case "name":
        return (
          <Button
            variant="light"
            className="px-0 font-medium"
            onPress={() => handleCountryClick(rowData)}
          >
            {rowData?.name}
          </Button>
        );

      case "actions":
        return (
          <Button
            size="sm"
            color="primary"
            variant="flat"
            onPress={() => handleCountryClick(rowData)}
          >
            View States
          </Button>
        );

      default:
        return rowData?.[columnKey];
    }
  }, []);

  const onSearchChange = React.useCallback((value) => {
    setFilterValue(value);

    setInitialFilteration((prev) => ({
      ...prev,
      page: 1,
    }));
  }, []);

  const onClear = React.useCallback(() => {
    setFilterValue("");

    setInitialFilteration((prev) => ({
      ...prev,
      page: 1,
    }));
  }, []);

  const onRowsPerPageChange = React.useCallback((e) => {
    setInitialFilteration((prev) => ({
      ...prev,
      size: Number(e.target.value),
      page: 1,
    }));
  }, []);

  const topContent = useMemo(() => {
    return (
      <div className="flex flex-col gap-2">
        <div className="flex justify-between gap-2 items-center flex-wrap">
          <Input
            isClearable
            size="sm"
            className="w-full sm:max-w-[280px]"
            classNames={{ inputWrapper: "h-8 min-h-8" }}
            placeholder="Search country..."
            startContent={<Search className="w-4 h-4 text-default-400" />}
            value={filterValue}
            onClear={onClear}
            onValueChange={onSearchChange}
          />

          <div className="flex gap-1.5 flex-wrap">
            <Button
              size="sm"
              color="primary"
              startContent={<Plus className="w-4 h-4" />}
              onPress={onOpen}
            >
              Add Country
            </Button>

            <Dropdown>
              <DropdownTrigger className="hidden sm:flex">
                <Button
                  size="sm"
                  variant="flat"
                  endContent={<ChevronDown className="w-4 h-4" />}
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
                    {column.name}
                  </DropdownItem>
                ))}
              </DropdownMenu>
            </Dropdown>
          </div>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-default-400 text-[12.5px]">
            Total {filteredItems.length} countries
          </span>

          <label className="flex items-center gap-1 text-default-400 text-[12.5px]">
            Rows per page:
            <select
              className="bg-transparent outline-hidden text-default-400 text-[12.5px] cursor-pointer"
              onChange={onRowsPerPageChange}
              value={initialFilteration.size}
            >
              <option value="5">5</option>
              <option value="10">10</option>
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
    onClear,
    onSearchChange,
    filteredItems.length,
    onRowsPerPageChange,
    initialFilteration.size,
    onOpen,
  ]);

  const bottomContent = useMemo(() => {
    return (
      <div className="py-1.5 px-1 flex justify-between items-center">
        <span className="w-[30%] text-[12.5px] text-default-400">
          Page {initialFilteration.page} of {pages}
        </span>

        <Pagination
          isCompact
          showControls
          color="primary"
          page={initialFilteration.page}
          total={pages}
          onChange={(page) =>
            setInitialFilteration((prev) => ({
              ...prev,
              page,
            }))
          }
        />

        <div className="hidden sm:flex w-[30%] justify-end gap-2">
          <Button
            isDisabled={initialFilteration.page <= 1}
            size="sm"
            variant="flat"
            onPress={() =>
              setInitialFilteration((prev) => ({
                ...prev,
                page: prev.page - 1,
              }))
            }
          >
            Previous
          </Button>

          <Button
            isDisabled={initialFilteration.page >= pages}
            size="sm"
            variant="flat"
            onPress={() =>
              setInitialFilteration((prev) => ({
                ...prev,
                page: prev.page + 1,
              }))
            }
          >
            Next
          </Button>
        </div>
      </div>
    );
  }, [initialFilteration.page, pages]);

  return (
    <div className="flex flex-col gap-2">
      <h1 className="font-sans text-lg font-semibold mb-2 shrink-0">
        Country List
      </h1>

      <Table
        aria-label="Country table"
        isHeaderSticky
        removeWrapper={false}
        bottomContent={bottomContent}
        bottomContentPlacement="outside"
        topContent={topContent}
        topContentPlacement="outside"
        classNames={{
          base: "gap-2.5",
          wrapper:
            "max-h-[calc(100vh-320px)] w-full overflow-y-auto rounded-lg border border-gray-200 dark:border-white/10 shadow-none p-0",
          table: "w-full",
          thead: "[&>tr]:first:rounded-none",
          th: "h-8 py-0 text-[11.5px] tracking-wide bg-gray-50 dark:bg-neutral-900 text-default-500 first:rounded-none last:rounded-none border-b border-gray-200 dark:border-white/10",
          td: "py-1.5 text-[12.5px]",
        }}
      >
        <TableHeader columns={headerColumns}>
          {(column) => (
            <TableColumn
              key={column.uid}
              align={column.uid === "actions" ? "center" : "start"}
            >
              {column.name}
            </TableColumn>
          )}
        </TableHeader>

        <TableBody
          items={items}
          emptyContent="No countries found"
          isLoading={loading === "pending"}
          loadingContent="Loading countries..."
        >
          {(item) => (
            <TableRow key={item?.id}>
              {(columnKey) => (
                <TableCell>{renderCell(item, columnKey)}</TableCell>
              )}
            </TableRow>
          )}
        </TableBody>
      </Table>

      <AddCountryModal
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        onSuccess={() => dispatch(getAllCountries())}
      />
    </div>
  );
};

export default CountryData;
