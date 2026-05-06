import { useState, useMemo, useRef, useEffect, useCallback, memo } from "react";
import { Select, SelectItem, Input } from "@heroui/react";
import { ChevronDownIcon } from "lucide-react";

const NewSelect = ({
  className,
  data = [],
  selectionMode = "single",
  labelPlacement,
  label,
  name,
  onChange,
  isRequired = false,
  valueKey = "id",
  labelKey,
  isClearable = false,
  isVirtualized = true,
  value,
  errorMessage,
  isInvalid = false,
  size,
  placeholder,
  isDisabled,
  onItemSelect = () => {},
  endContent = null,
  isOpen = null,
  onOpenChange = () => {},
  variant,
}) => {
  const isControlled = isOpen !== null && isOpen !== undefined;

  const normalizedData = useMemo(() => {
    return (data || [])
      .filter(
        (item) =>
          item?.[labelKey] &&
          String(item[labelKey]).trim() !== "" &&
          item?.[valueKey] !== undefined &&
          item?.[valueKey] !== null,
      )
      .map((item) => ({
        ...item,
        __selectKey: String(item[valueKey]),
      }));
  }, [data, labelKey, valueKey]);

  const getKeysFromValue = useCallback(
    (val) => {
      if (selectionMode === "multiple") {
        if (!Array.isArray(val)) return [];

        return val
          .map((v) => {
            const matched = normalizedData.find(
              (item) => String(item[valueKey]) === String(v),
            );
            return matched?.__selectKey;
          })
          .filter(Boolean);
      }

      if (val === undefined || val === null || val === "") return "";

      const matched = normalizedData.find(
        (item) => String(item[valueKey]) === String(val),
      );

      return matched?.__selectKey || "";
    },
    [normalizedData, selectionMode, valueKey],
  );

  const [selectedKeys, setSelectedKeys] = useState(() =>
    getKeysFromValue(value),
  );

  const [searchQuery, setSearchQuery] = useState("");
  const [filteredData, setFilteredData] = useState(normalizedData);

  const triggerRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    setSelectedKeys(getKeysFromValue(value));
  }, [value, getKeysFromValue]);

  useEffect(() => {
    setFilteredData(normalizedData);
  }, [normalizedData]);

  const handleSearchQuery = useCallback(
    (query) => {
      setSearchQuery(query);

      let result = [];

      if (!query) {
        result = [...normalizedData];
      } else {
        result = normalizedData.filter((item) =>
          String(item?.[labelKey] || "")
            .toLowerCase()
            .includes(query.toLowerCase()),
        );
      }

      result.sort((a, b) =>
        String(a[labelKey]).localeCompare(String(b[labelKey]), undefined, {
          sensitivity: "base",
          numeric: true,
        }),
      );

      setFilteredData(result);
    },
    [normalizedData, labelKey],
  );

  const topContent = useMemo(
    () => (
      <div className="sticky top-0 z-10 bg-white p-1">
        <Input
          ref={inputRef}
          value={searchQuery}
          onChange={(e) => handleSearchQuery(e.target.value)}
          placeholder="Search ..."
          aria-label="Search data"
          variant="bordered"
          onClick={(e) => e.stopPropagation()}
          onKeyDown={(e) => e.stopPropagation()}
        />
      </div>
    ),
    [searchQuery, handleSearchQuery],
  );

  const handleSelectionChange = useCallback(
    (keys) => {
      let selectedKeyValue;
      let selectedValue;

      if (selectionMode === "multiple") {
        selectedKeyValue =
          keys === "all"
            ? filteredData.map((item) => item.__selectKey)
            : Array.from(keys);

        const selectedItems = normalizedData.filter((item) =>
          selectedKeyValue.includes(item.__selectKey),
        );

        selectedValue = selectedItems.map((item) => item[valueKey]);

        setSelectedKeys(selectedKeyValue);
        onItemSelect(selectedItems);
        onChange?.(selectedValue);
      } else {
        selectedKeyValue = keys.size > 0 ? String(Array.from(keys)[0]) : "";

        const selectedItem = normalizedData.find(
          (item) => item.__selectKey === selectedKeyValue,
        );

        selectedValue = selectedItem ? selectedItem[valueKey] : "";

        setSelectedKeys(selectedKeyValue);
        onItemSelect(selectedItem || null);
        onChange?.(selectedValue);
      }

      setSearchQuery("");

      if (triggerRef.current) {
        triggerRef.current.blur();
      }

      if (document.activeElement instanceof HTMLElement) {
        document.activeElement.blur();
      }
    },
    [
      selectionMode,
      filteredData,
      normalizedData,
      valueKey,
      onItemSelect,
      onChange,
    ],
  );

  const selectKeys =
    selectionMode === "multiple"
      ? new Set(Array.isArray(selectedKeys) ? selectedKeys : [])
      : new Set(selectedKeys ? [selectedKeys] : []);

  const hiddenInputValue =
    selectionMode === "multiple"
      ? Array.isArray(value)
        ? value.join(",")
        : ""
      : (value ?? "");

  return (
    <div className="w-full">
      {name && <input type="hidden" name={name} value={hiddenInputValue} />}

      <Select
        size={size}
        {...(isControlled ? { isOpen, onOpenChange } : {})}
        endContent={endContent}
        isDisabled={isDisabled}
        errorMessage={isInvalid ? errorMessage : undefined}
        isInvalid={isInvalid}
        isRequired={isRequired}
        placeholder={placeholder}
        isVirtualized={isVirtualized}
        itemHeight={52}
        maxListboxHeight={300}
        isClearable={isClearable}
        selectionMode={selectionMode}
        items={filteredData}
        label={label}
        variant={variant}
        labelPlacement={labelPlacement}
        selectedKeys={selectKeys}
        onSelectionChange={handleSelectionChange}
        disallowEmptySelection={false}
        aria-label={typeof label === "string" ? label : "Searchable select"}
        className={className}
        classNames={{
          trigger: "min-h-[56px] max-h-[150px] overflow-y-auto",
          value: "text-sm truncate",
          listbox: "p-2 gap-1",
          popoverContent: "p-0",
        }}
        selectorIcon={<ChevronDownIcon className="w-5 h-5 text-default-500" />}
        ref={triggerRef}
        listboxProps={{
          topContent,
          emptyContent: "No data found",
          itemClasses: {
            base: "h-[52px] px-3 py-2 rounded-lg data-[hover=true]:bg-default-100 data-[selectable=true]:focus:bg-default-100",
            title: "text-sm leading-5",
          },
        }}
        renderValue={(items) => {
          if (!items.length) {
            return (
              <span className="text-default-400">
                {placeholder || "Select data"}
              </span>
            );
          }

          if (selectionMode === "multiple") {
            return (
              <span className="text-sm truncate">
                {items.map((i) => i?.data?.[labelKey]).join(", ")}
              </span>
            );
          }

          return (
            <span className="text-sm truncate">
              {items[0]?.data?.[labelKey]}
            </span>
          );
        }}
      >
        {(item) => (
          <SelectItem
            key={item.__selectKey}
            textValue={String(item?.[labelKey] || "Unknown")}
          >
            <span
              title={String(item?.[labelKey] || "Unknown")}
              className="block text-sm leading-5 line-clamp-2 break-words"
            >
              {item?.[labelKey] || "Unknown"}
            </span>
          </SelectItem>
        )}
      </Select>
    </div>
  );
};

export default memo(NewSelect);
