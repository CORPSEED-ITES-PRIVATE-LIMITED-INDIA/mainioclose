import { useState, useMemo, useRef, useEffect, useCallback } from "react";
import { Select, SelectItem, Input } from "@heroui/react";
import { ChevronDownIcon } from "lucide-react";

const NewSelect = ({
  data,
  selectionMode,
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
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedKeys, setSelectedKeys] = useState(
    Array.isArray(value)
      ? value
      : typeof value === "string"
      ? [value]
      : new Set()
  );
  const [triggerWidth, setTriggerWidth] = useState(null);
  const [filteredData, setFilteredData] = useState([]);
  const triggerRef = useRef(null);
  const inputRef = useRef(null);

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
        setFilteredData(filter);
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

  return (
    <div className="w-full">
      <Select
        errorMessage={errorMessage}
        isRequired={isRequired}
        name={name}
        value={value}
        isVirtualized={isVirtualized}
        isClearable={isClearable}
        selectionMode={selectionMode}
        items={filteredData}
        label={label}
        labelPlacement={labelPlacement}
        selectedKeys={selectedKeys}
        onSelectionChange={(keys) => {
          setSelectedKeys(keys);
          setSearchQuery("");
        }}
        onChange={(e) => onChange(e.target.value)}
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
                <div key={item.key} className="flex items-center gap-2">
                  <div className="flex flex-col">
                    <span>{item.data?.[labelKey]}</span>
                  </div>
                </div>
              ))}
            </div>
          );
        }}
      >
        {(data) => {
          return (
            <SelectItem key={data?.[valueKey]} textValue={data?.[labelKey]}>
              <div className="flex flex-col">
                <span className="text-small">{data?.[labelKey]}</span>
              </div>
            </SelectItem>
          );
        }}
      </Select>
    </div>
  );
};

export default NewSelect;
