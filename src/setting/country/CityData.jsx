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
  getAllCitiesByStateName,
  getAllStatesByCountryName,
  addCity,
} from "../../toolkit/slices/commonSlice";

const columns = [
  { name: "#", uid: "id" },
  { name: "CITY", uid: "name" },
];

const INITIAL_VISIBLE_COLUMNS = ["id", "name"];

/* ---------------- Add City modal (same file) ---------------- */

const emptyCity = { name: "", cityCode: "", postalCode: "", timezone: "" };

// drop blank optional strings so backend gets them as missing instead of ""
const clean = (obj) =>
  Object.fromEntries(
    Object.entries(obj).filter(([, v]) => typeof v !== "string" || v.trim()),
  );

const AddCityModal = ({
  isOpen,
  onOpenChange,
  stateId,
  stateName,
  onSuccess,
}) => {
  const dispatch = useDispatch();

  const [cities, setCities] = useState([{ ...emptyCity }]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const reset = () => {
    setCities([{ ...emptyCity }]);
    setError("");
  };

  const setCityField = (ci, key, value) =>
    setCities((prev) =>
      prev.map((c, i) => (i === ci ? { ...c, [key]: value } : c)),
    );

  const addRow = () => setCities((prev) => [...prev, { ...emptyCity }]);
  const removeRow = (ci) =>
    setCities((prev) => prev.filter((_, i) => i !== ci));

  const handleSubmit = async (onClose) => {
    setError("");

    if (!stateId) {
      setError("State id not found");
      return;
    }

    if (cities.length === 0) {
      setError("Add at least one city");
      return;
    }

    if (cities.some((c) => !c.name.trim())) {
      setError("Every city needs a name (remove empty rows)");
      return;
    }

    // backend expects a plain array of cities
    const payload = cities.map(clean);

    try {
      setSaving(true);
      await dispatch(addCity({ stateId, data: payload })).unwrap();
      reset();
      onSuccess?.();
      onClose();
    } catch (err) {
      setError(
        typeof err === "string" ? err : err?.message || "Failed to add cities",
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
              Add Cities to {stateName}
            </ModalHeader>

            <ModalBody className="gap-3">
              {cities.map((c, ci) => (
                <div
                  key={ci}
                  className="grid grid-cols-1 sm:grid-cols-5 gap-2 items-center"
                >
                  <Input
                    size="sm"
                    isRequired
                    label="City name"
                    value={c.name}
                    onValueChange={(v) => setCityField(ci, "name", v)}
                  />
                  <Input
                    size="sm"
                    label="City code"
                    value={c.cityCode}
                    onValueChange={(v) => setCityField(ci, "cityCode", v)}
                  />
                  <Input
                    size="sm"
                    label="Postal code"
                    value={c.postalCode}
                    onValueChange={(v) => setCityField(ci, "postalCode", v)}
                  />
                  <Input
                    size="sm"
                    label="Timezone"
                    value={c.timezone}
                    onValueChange={(v) => setCityField(ci, "timezone", v)}
                  />
                  <Button
                    size="sm"
                    color="danger"
                    variant="light"
                    isDisabled={cities.length === 1}
                    startContent={<Trash2 className="w-4 h-4" />}
                    onPress={() => removeRow(ci)}
                  >
                    Remove
                  </Button>
                </div>
              ))}

              <Button
                size="sm"
                variant="flat"
                className="self-start"
                startContent={<Plus className="w-4 h-4" />}
                onPress={addRow}
              >
                Add another city
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
                Save Cities
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};

/* ---------------- City list ---------------- */

const CityData = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { countryName, stateName } = useParams();

  const decodedCountryName = decodeURIComponent(countryName || "");

  const decodedStateName = decodeURIComponent(stateName || "");

  const { citiesList, statesList, loading } = useSelector(
    (state) => state.common,
  );
  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  // stateId: from states list (matched by name), else from loaded cities
  const stateId = useMemo(() => {
    const fromStates = (statesList || []).find(
      (s) => s?.name?.toLowerCase() === decodedStateName.toLowerCase(),
    )?.id;
    if (fromStates) return fromStates;

    return (citiesList || []).find((c) => c?.stateId)?.stateId;
  }, [statesList, citiesList, decodedStateName]);

  const [filterValue, setFilterValue] = useState("");

  const [visibleColumns, setVisibleColumns] = useState(
    new Set(INITIAL_VISIBLE_COLUMNS),
  );

  const [initialFilteration, setInitialFilteration] = useState({
    page: 1,
    size: 10,
  });

  useEffect(() => {
    if (decodedStateName) {
      dispatch(getAllCitiesByStateName(decodedStateName));
    }
  }, [dispatch, decodedStateName]);

  // needed to resolve stateId (also works when the state has no cities yet)
  useEffect(() => {
    if (decodedCountryName) {
      dispatch(getAllStatesByCountryName(decodedCountryName));
    }
  }, [dispatch, decodedCountryName]);

  const headerColumns = useMemo(() => {
    if (visibleColumns === "all") {
      return columns;
    }

    return columns.filter((column) =>
      Array.from(visibleColumns).includes(column.uid),
    );
  }, [visibleColumns]);

  const filteredItems = useMemo(() => {
    let filteredData = [...(citiesList || [])];

    if (filterValue) {
      filteredData = filteredData.filter((item) =>
        Object.values(item || {}).some((value) =>
          String(value).toLowerCase().includes(filterValue.toLowerCase()),
        ),
      );
    }

    return filteredData;
  }, [citiesList, filterValue]);

  const pages = Math.ceil(filteredItems.length / initialFilteration.size) || 1;

  const items = useMemo(() => {
    const start = (initialFilteration.page - 1) * initialFilteration.size;

    const end = start + initialFilteration.size;

    return filteredItems.slice(start, end);
  }, [filteredItems, initialFilteration.page, initialFilteration.size]);

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
            placeholder="Search city..."
            startContent={<Search className="w-4 h-4 text-default-400" />}
            value={filterValue}
            onClear={onClear}
            onValueChange={onSearchChange}
          />

          <div className="flex gap-1.5 flex-wrap">
            <Button
              size="sm"
              color="primary"
              isDisabled={!stateId}
              startContent={<Plus className="w-4 h-4" />}
              onPress={onOpen}
            >
              Add City
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
            Total {filteredItems.length} cities
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
    decodedCountryName,
    onOpen,
    stateId,
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
          City List
        </h1>

        <p className="text-default-500 text-[12.5px]">
          Country: {decodedCountryName}
        </p>

        <p className="text-default-500 text-[12.5px]">
          State: {decodedStateName}
        </p>
      </div>

      <Table
        aria-label="City table"
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
            <TableColumn key={column.uid} align="start">
              {column.name}
            </TableColumn>
          )}
        </TableHeader>

        <TableBody
          items={items}
          emptyContent="No cities found"
          isLoading={loading === "pending"}
          loadingContent="Loading cities..."
        >
          {(item) => (
            <TableRow key={item?.id}>
              {(columnKey) => (
                <TableCell>
                  {columnKey === "id" ? item?.id : item?.name}
                </TableCell>
              )}
            </TableRow>
          )}
        </TableBody>
      </Table>

      <AddCityModal
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        stateId={stateId}
        stateName={decodedStateName}
        onSuccess={() => dispatch(getAllCitiesByStateName(decodedStateName))}
      />
    </div>
  );
};

export default CityData;
