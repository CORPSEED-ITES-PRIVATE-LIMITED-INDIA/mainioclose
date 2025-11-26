import { useState, useMemo, useRef, useEffect, useCallback } from "react";
import { Select, SelectItem, Input } from "@heroui/react";
import { ChevronDownIcon } from "lucide-react";

const NewSelect = ({
  data = [],
  selectionMode = "single",
  labelPlacement,
  label,
  name,
  onChange,
  isRequired,
  valueKey,
  labelKey,
  isClearable = false,
  isVirtualized,
  value,
  errorMessage,
  size,
  placeholder,
  isDisabled,
  onItemSelect = () => {},
}) => {
  const [selectedKeys, setSelectedKeys] = useState(() => {
    if (selectionMode === "multiple") {
      return Array.isArray(value) ? value.map(String) : [];
    }
    return typeof value === "string" && value ? value : "";
  });

  const [searchQuery, setSearchQuery] = useState("");
  const [triggerWidth, setTriggerWidth] = useState(null);
  const [filteredData, setFilteredData] = useState(data);
  const triggerRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (selectionMode === "multiple") {
      setSelectedKeys(Array.isArray(value) ? value.map(String) : []);
    } else {
      setSelectedKeys(typeof value === "string" && value ? value : "");
    }
  }, [value, selectionMode]);

  useEffect(() => {
    const updateWidth = () => {
      if (triggerRef.current) {
        setTriggerWidth(triggerRef.current.offsetWidth);
      }
    };
    updateWidth();
    window.addEventListener("resize", updateWidth);
    return () => window.removeEventListener("resize", updateWidth);
  }, []);

  useEffect(() => {
    setFilteredData(data);
  }, [data]);

  useEffect(() => {
    if (filteredData.length > 0 && inputRef.current) {
      inputRef.current.focus();
    }
  }, [filteredData]);

  const handleSearchQuery = useCallback(
    (e) => {
      setSearchQuery(e);
      if (!e) {
        setFilteredData(data);
      } else {
        const filter = data?.filter((user) =>
          user?.[labelKey]?.toLowerCase()?.includes(e?.toLowerCase())
        );
        setFilteredData(filter || []);
      }
    },
    [data, labelKey]
  );

  const topContent = useMemo(
    () => (
      <div className="sticky top-0 z-10">
        <Input
          ref={inputRef}
          value={searchQuery}
          onChange={(e) => handleSearchQuery(e.target.value)}
          placeholder="Search ..."
          className="mb-2"
          aria-label="Search data"
          variant="bordered"
          onClick={(e) => e.stopPropagation()}
        />
      </div>
    ),
    [searchQuery, handleSearchQuery]
  );

  const handleSelectionChange = useCallback(
    (keys) => {
      let selectedValue;

      if (selectionMode === "multiple") {
        if (keys === "all") {
          selectedValue = data
            .map((item) => String(item[valueKey]))
            .filter((key) => key !== "");
        } else {
          selectedValue = [...keys].map(String).filter((key) => key !== "");
        }
      } else {
        selectedValue = keys.size > 0 ? String([...keys][0]) : "";
      }

      setSelectedKeys(selectedValue);
      setSearchQuery("");

      if (onChange) {
        onChange(selectedValue);
      }
    },
    [onChange, selectionMode, data, valueKey]
  );

  const selectKeys =
    selectionMode === "multiple"
      ? new Set(selectedKeys.map(String))
      : new Set([selectedKeys].filter(Boolean));

  return (
    <div className="w-full">
      <Select
        size={size}
        isDisabled={isDisabled}
        errorMessage={errorMessage}
        isRequired={isRequired}
        name={name}
        placeholder={placeholder}
        isVirtualized={isVirtualized}
        isClearable={isClearable}
        selectionMode={selectionMode}
        items={filteredData}
        label={label}
        labelPlacement={labelPlacement}
        selectedKeys={selectKeys}
        onSelectionChange={handleSelectionChange}
        disallowEmptySelection={false}
        aria-label="Searchable select"
        classNames={{
          trigger: "max-h-[150px] overflow-y-auto",
        }}
        selectorIcon={<ChevronDownIcon className="w-5 h-5 text-default-500" />}
        ref={triggerRef}
        listboxProps={{
          topContent: topContent,
          emptyContent: "No data found",
        }}
        renderValue={(items) => {
          if (!items.length) {
            return <span className="text-default-400">Select data</span>;
          }

          return (
            <div className="flex flex-wrap gap-2 mt-4">
              {items.map((item) => {
                return (
                  <div
                    key={item?.key}
                    className="flex items-center gap-2 selectable-text"
                  >
                    <span className="text-sm flex flex-wrap py-0.5">
                      {item?.data?.[labelKey] || "Unknown"}
                    </span>
                  </div>
                );
              })}
            </div>
          );
        }}
      >
        {(item) => (
          <SelectItem
            key={String(item[valueKey])}
            textValue={item?.[labelKey]}
            onPress={() => {
              if (onItemSelect) {
                onItemSelect(item);
              }
            }}
          >
            <div className="flex flex-col flex-wrap text-small my-0.5 w-full">
              {item?.[labelKey] || "Unknown"}
            </div>
          </SelectItem>
        )}
      </Select>
    </div>
  );
};

export default NewSelect;
