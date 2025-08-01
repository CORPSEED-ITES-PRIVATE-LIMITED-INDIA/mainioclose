import { useState, useMemo, useRef, useEffect, useCallback } from "react";
import { Select, SelectItem, Input } from "@heroui/react";
import { ChevronDownIcon } from "lucide-react";

const NewSelect = ({
  data = [], // Default to empty array
  selectionMode = "single", // Default to single selection
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
}) => {
  // Initialize selectedKeys based on selectionMode and value prop
  const [selectedKeys, setSelectedKeys] = useState(() => {
    if (selectionMode === "multiple") {
      return Array.isArray(value) ? value : [];
    }
    return typeof value === "string" && value ? value : "";
  });

  const [searchQuery, setSearchQuery] = useState("");
  const [triggerWidth, setTriggerWidth] = useState(null);
  const [filteredData, setFilteredData] = useState([]);
  const triggerRef = useRef(null);
  const inputRef = useRef(null);

  // Update trigger width for dropdown alignment
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

  // Sync filteredData with data prop
  useEffect(() => {
    setFilteredData(data);
  }, [data]);

  // Focus input when filteredData changes
  useEffect(() => {
    if (filteredData.length > 0 && inputRef.current) {
      inputRef.current.focus();
    }
  }, [filteredData]);

  // Handle search query
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

  // Memoized top content (search input)
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

  // Handle selection change
  const handleSelectionChange = (keys) => {
    let selectedValue;

    if (selectionMode === "multiple") {
      if (keys === "all") {
        selectedValue = data
          .map((item) => String(item[valueKey]))
          .filter((key) => key !== "");
      } else {
        selectedValue = [...keys].filter((key) => key !== "");
      }
    } else {
      // For single selection, take the first key or empty string
      selectedValue = keys.size > 0 ? [...keys][0] : "";
    }

    // Update state
    setSelectedKeys(selectedValue);
    setSearchQuery("");

    // Call parent onChange with the appropriate format
    if (onChange) {
      onChange(selectedValue);
    }
  };

  // Convert selectedKeys to Set for Select component
  const selectKeys =
    selectionMode === "multiple"
      ? new Set(selectedKeys)
      : new Set([selectedKeys].filter(Boolean));

  console.log("Selected Keys (internal):", selectedKeys);
  console.log("Select Keys (for Select component):", selectKeys);

  return (
    <div className="w-full">
      <Select
        errorMessage={errorMessage}
        isRequired={isRequired}
        name={name}
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
        selectorIcon={<ChevronDownIcon className="w-5 h-5 text-default-500" />}
        ref={triggerRef}
        listboxProps={{
          topContent: topContent,
          emptyContent: "No data found",
        }}
        renderValue={(items) => {
          if (!items.length)
            return <span className="text-default-400">Select data</span>;
          return (
            <div className="flex flex-wrap gap-2">
              {items.map((item) => (
                <div
                  key={item.key}
                  className="flex items-center gap-2 selectable-text"
                >
                  <div className="flex flex-col">
                    <span>{item.data?.[labelKey]}</span>
                  </div>
                </div>
              ))}
            </div>
          );
        }}
      >
        {(data) => (
          <SelectItem key={data?.[valueKey]} textValue={data?.[labelKey]}>
            <div className="flex flex-col">
              <span className="text-small">{data?.[labelKey]}</span>
            </div>
          </SelectItem>
        )}
      </Select>
    </div>
  );
};

export default NewSelect;
