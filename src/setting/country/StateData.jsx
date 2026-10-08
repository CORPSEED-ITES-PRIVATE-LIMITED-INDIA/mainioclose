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
import { ArrowLeft, ChevronDown, Search, Plus, Trash2 } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import {
  getAllStatesByCountryName,
  getAllCountries,
  addState,
} from "../../toolkit/slices/commonSlice";

const columns = [
  { name: "#", uid: "id" },
  { name: "STATE CODE", uid: "stateCode" },
  { name: "GST CODE", uid: "gstCode" },
  { name: "STATE", uid: "name" },
  { name: "ACTIONS", uid: "actions" },
];

const INITIAL_VISIBLE_COLUMNS = [
  "id",
  "stateCode",
  "gstCode",
  "name",
  "actions",
];

/* ---------------- Add State modal (same file) ---------------- */

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

const AddStateModal = ({
  isOpen,
  onOpenChange,
  countryId,
  countryName,
  onSuccess,
}) => {
  const dispatch = useDispatch();

  const [states, setStates] = useState([{ ...emptyState }]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const reset = () => {
    setStates([{ ...emptyState }]);
    setError("");
  };

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

  const addStateRow = () => setStates((prev) => [...prev, { ...emptyState }]);
  const removeStateRow = (si) =>
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

    if (!countryId) {
      setError("Country id not found");
      return;
    }

    if (states.length === 0) {
      setError("Add at least one state");
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

    // backend expects a plain array of states
    const payload = states.map((s) => ({
      ...clean({ ...s, cities: undefined }),
      ...(s.cities.length > 0 && { cities: s.cities.map(clean) }),
    }));

    try {
      setSaving(true);
      await dispatch(addState({ countryId, data: payload })).unwrap();
      reset();
      onSuccess?.();
      onClose();
    } catch (err) {
      setError(
        typeof err === "string" ? err : err?.message || "Failed to add states",
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
            <ModalHeader className="text-base">
              Add States to {countryName}
            </ModalHeader>

            <ModalBody className="gap-4">
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
                      isDisabled={states.length === 1}
                      startContent={<Trash2 className="w-4 h-4" />}
                      onPress={() => removeStateRow(si)}
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
                    Add city (optional)
                  </Button>
                </div>
              ))}

              <Button
                size="sm"
                variant="flat"
                className="self-start"
                startContent={<Plus className="w-4 h-4" />}
                onPress={addStateRow}
              >
                Add another state
              </Button>

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
                Save States
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};

/* ---------------- State list ---------------- */

const StateData = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { countryName, userId } = useParams();

  const decodedCountryName = decodeURIComponent(countryName || "");

  const { statesList, countriesList, loading } = useSelector(
    (state) => state.common,
  );
  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  // countryId: from loaded states, else from the countries list by name
  const countryId = useMemo(() => {
    const fromState = statesList?.find((s) => s?.countryId)?.countryId;
    if (fromState) return fromState;

    return (countriesList || []).find(
      (c) => c?.name?.toLowerCase() === decodedCountryName.toLowerCase(),
    )?.id;
  }, [statesList, countriesList, decodedCountryName]);

  const [filterValue, setFilterValue] = useState("");

  const [visibleColumns, setVisibleColumns] = useState(
    new Set(INITIAL_VISIBLE_COLUMNS),
  );

  const [initialFilteration, setInitialFilteration] = useState({
    page: 1,
    size: 10,
  });

  useEffect(() => {
    if (decodedCountryName) {
      dispatch(getAllStatesByCountryName(decodedCountryName));
    }
  }, [dispatch, decodedCountryName]);

  // needed only as a fallback when the country has no states yet
  useEffect(() => {
    if (!countriesList || countriesList.length === 0) {
      dispatch(getAllCountries());
    }
  }, [dispatch, countriesList]);

  const headerColumns = useMemo(() => {
    if (visibleColumns === "all") {
      return columns;
    }

    return columns.filter((column) =>
      Array.from(visibleColumns).includes(column.uid),
    );
  }, [visibleColumns]);

  const filteredItems = useMemo(() => {
    let filteredData = [...(statesList || [])];

    if (filterValue) {
      filteredData = filteredData.filter((item) =>
        Object.values(item || {}).some((value) =>
          String(value).toLowerCase().includes(filterValue.toLowerCase()),
        ),
      );
    }

    return filteredData;
  }, [statesList, filterValue]);

  const pages = Math.ceil(filteredItems.length / initialFilteration.size) || 1;

  const items = useMemo(() => {
    const start = (initialFilteration.page - 1) * initialFilteration.size;

    const end = start + initialFilteration.size;

    return filteredItems.slice(start, end);
  }, [filteredItems, initialFilteration.page, initialFilteration.size]);

  const handleStateClick = (state) => {
    if (!state?.name) {
      return;
    }

    navigate(
      `/erp/${userId}/settings/country/state/${encodeURIComponent(
        decodedCountryName,
      )}/city/${encodeURIComponent(state.name)}`,
    );
  };

  const renderCell = React.useCallback(
    (rowData, columnKey) => {
      switch (columnKey) {
        case "id":
          return <span>{rowData?.id}</span>;

        case "stateCode":
          return <span>{rowData?.stateCode}</span>;

        case "gstCode":
          return <span>{rowData?.gstCode ?? "-"}</span>;

        case "name":
          return (
            <Button
              variant="light"
              className="px-0 font-medium"
              onPress={() => handleStateClick(rowData)}
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
              onPress={() => handleStateClick(rowData)}
            >
              View Cities
            </Button>
          );

        default:
          return rowData?.[columnKey];
      }
    },
    [decodedCountryName],
  );

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
            placeholder="Search state..."
            startContent={<Search className="w-4 h-4 text-default-400" />}
            value={filterValue}
            onClear={onClear}
            onValueChange={onSearchChange}
          />

          <div className="flex gap-1.5 flex-wrap">
            <Button
              size="sm"
              color="primary"
              isDisabled={!countryId}
              startContent={<Plus className="w-4 h-4" />}
              onPress={onOpen}
            >
              Add State
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
            Total {filteredItems.length} states
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
    navigate,
    onOpen,
    countryId,
    filteredItems.length,
    onRowsPerPageChange,
    initialFilteration.size,
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
      <div>
        <h1 className="font-sans text-lg font-semibold mb-2 shrink-0">
          State List
        </h1>

        <p className="text-default-500 text-[12.5px]">
          Country: {decodedCountryName}
        </p>
      </div>

      <Table
        aria-label="State table"
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
          emptyContent="No states found"
          isLoading={loading === "pending"}
          loadingContent="Loading states..."
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

      <AddStateModal
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        countryId={countryId}
        countryName={decodedCountryName}
        onSuccess={() =>
          dispatch(getAllStatesByCountryName(decodedCountryName))
        }
      />
    </div>
  );
};

export default StateData;
