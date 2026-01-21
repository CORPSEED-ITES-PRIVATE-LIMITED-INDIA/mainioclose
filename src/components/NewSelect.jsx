import React, {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  memo,
} from "react";
import { ChevronDownIcon, X } from "lucide-react";

const cx = (...arr) => arr.filter(Boolean).join(" ");
const clamp = (n, min, max) => Math.max(min, Math.min(max, n));

const safeArray = (v) => (Array.isArray(v) ? v : []);
const safeStr = (v) => {
  if (v === null || v === undefined) return "";
  return String(v);
};

const OptionRow = memo(function OptionRow({
  id,
  active,
  selected,
  onMouseEnter,
  onClick,
  label,
}) {
  return (
    <div
      id={id}
      role="option"
      aria-selected={selected}
      tabIndex={-1}
      onMouseEnter={onMouseEnter}
      onMouseDown={(e) => e.preventDefault()} // keep focus stable
      onClick={onClick}
      className={cx(
        "px-3 py-2 text-sm leading-5",
        "whitespace-normal break-words",
        "cursor-pointer select-none",
        active ? "bg-gray-100" : "",
        selected ? "font-medium" : "font-normal"
      )}
    >
      {label}
    </div>
  );
});

export default function NewSelect({
  data = [],
  selectionMode = "single", // "single" | "multiple"
  label,
  name,
  valueKey = "id",
  labelKey = "name",
  placeholder = "Select...",
  value, // string | number | array
  onChange, // (val) => void
  onItemSelect = () => {},
  isDisabled = false,
  isClearable = true,
  maxMenuHeight = 280,
  className = "",
}) {
  const uid = useId();

  // ✅ ensure data is ALWAYS an array
  const safeData = useMemo(() => safeArray(data), [data]);

  const rootRef = useRef(null);
  const inputRef = useRef(null);
  const menuRef = useRef(null);

  const isMultiple = selectionMode === "multiple";

  const [selected, setSelected] = useState(() => {
    if (isMultiple) return Array.isArray(value) ? value.map(safeStr) : [];
    return value !== "" && value != null ? safeStr(value) : "";
  });

  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);

  // ✅ sync external value safely
  useEffect(() => {
    if (isMultiple) {
      setSelected(Array.isArray(value) ? value.map(safeStr) : []);
    } else {
      setSelected(value !== "" && value != null ? safeStr(value) : "");
    }
  }, [value, isMultiple]);

  // ✅ filtered list safe
  const filtered = useMemo(() => {
    const q = safeStr(query).trim().toLowerCase();
    if (!q) return safeData;

    return safeData.filter((item) => {
      const labelVal = item?.[labelKey];
      return safeStr(labelVal).toLowerCase().includes(q);
    });
  }, [safeData, query, labelKey]);

  // ✅ map for labels, safe against missing keys/items
  const labelByKey = useMemo(() => {
    const m = new Map();
    for (const item of safeData) {
      const k = safeStr(item?.[valueKey]);
      if (!k) continue;
      m.set(k, safeStr(item?.[labelKey]) || k);
    }
    return m;
  }, [safeData, valueKey, labelKey]);

  const selectedSet = useMemo(() => {
    const arr = isMultiple ? safeArray(selected) : selected ? [selected] : [];
    return new Set(arr.map(safeStr).filter(Boolean));
  }, [selected, isMultiple]);

  const close = useCallback(() => {
    setOpen(false);
    setQuery("");
  }, []);

  const openMenu = useCallback(() => {
    if (isDisabled) return;
    setOpen(true);
  }, [isDisabled]);

  // focus input on open
  useEffect(() => {
    if (!open) return;
    const t = setTimeout(() => {
      inputRef.current?.focus?.();
      inputRef.current?.select?.();
    }, 0);
    return () => clearTimeout(t);
  }, [open]);

  // reset activeIndex when list changes
  useEffect(() => {
    if (!open) return;
    setActiveIndex(0);
  }, [open, query, filtered.length]);

  // close outside click
  useEffect(() => {
    if (!open) return;

    const onDocDown = (e) => {
      const root = rootRef.current;
      if (!root) return;
      if (!root.contains(e.target)) close();
    };

    document.addEventListener("mousedown", onDocDown);
    return () => document.removeEventListener("mousedown", onDocDown);
  }, [open, close]);

  // ✅ prevent page scroll + keyboard nav (capture)
  useEffect(() => {
    if (!open) return;

    const onKey = (e) => {
      const key = e.key;
      const root = rootRef.current;

      if (!root) return;
      if (!root.contains(document.activeElement)) return;

      if (
        key !== "ArrowDown" &&
        key !== "ArrowUp" &&
        key !== "Enter" &&
        key !== "Escape"
      ) {
        return;
      }

      e.preventDefault();
      e.stopPropagation();

      if (key === "Escape") {
        close();
        return;
      }

      if (!filtered.length) return;

      if (key === "ArrowDown") {
        setActiveIndex((idx) => clamp(idx + 1, 0, filtered.length - 1));
        return;
      }

      if (key === "ArrowUp") {
        setActiveIndex((idx) => clamp(idx - 1, 0, filtered.length - 1));
        return;
      }

      // Enter
      const item = filtered[activeIndex];
      if (!item) return;

      const k = safeStr(item?.[valueKey]);
      if (!k) return;

      if (isMultiple) {
        setSelected((prev) => {
          const prevArr = safeArray(prev).map(safeStr).filter(Boolean);
          const next = new Set(prevArr);
          if (next.has(k)) next.delete(k);
          else next.add(k);
          const out = Array.from(next);
          onChange?.(out);
          return out;
        });
      } else {
        setSelected(k);
        onChange?.(k);
        close();
      }

      onItemSelect?.(item);
    };

    document.addEventListener("keydown", onKey, true);
    return () => document.removeEventListener("keydown", onKey, true);
  }, [open, filtered, activeIndex, isMultiple, valueKey, onChange, close, onItemSelect]);

  // scroll active into view
  useEffect(() => {
    if (!open) return;
    const menu = menuRef.current;
    if (!menu) return;

    const el = menu.querySelector(`[data-idx="${activeIndex}"]`);
    el?.scrollIntoView?.({ block: "nearest" });
  }, [activeIndex, open]);

  const toggleItem = useCallback(
    (item) => {
      const k = safeStr(item?.[valueKey]);
      if (!k) return;

      if (isMultiple) {
        setSelected((prev) => {
          const prevArr = safeArray(prev).map(safeStr).filter(Boolean);
          const next = new Set(prevArr);
          if (next.has(k)) next.delete(k);
          else next.add(k);
          const out = Array.from(next);
          onChange?.(out);
          return out;
        });
      } else {
        setSelected(k);
        onChange?.(k);
        close();
      }

      onItemSelect?.(item);
    },
    [isMultiple, valueKey, onChange, close, onItemSelect]
  );

  const clear = useCallback(
    (e) => {
      e.stopPropagation();
      if (isMultiple) {
        setSelected([]);
        onChange?.([]);
      } else {
        setSelected("");
        onChange?.("");
      }
      setQuery("");
      inputRef.current?.focus?.();
    },
    [isMultiple, onChange]
  );

  const display = useMemo(() => {
    if (isMultiple) {
      const arr = safeArray(selected).map(safeStr).filter(Boolean);
      if (!arr.length) return "";
      return arr
        .map((k) => labelByKey.get(k) || k)
        .filter(Boolean)
        .join(", ");
    }
    if (!selected) return "";
    return labelByKey.get(safeStr(selected)) || safeStr(selected);
  }, [selected, isMultiple, labelByKey]);

  const hasValue = isMultiple ? safeArray(selected).length > 0 : !!selected;

  return (
    <div ref={rootRef} className={cx("w-full", className)}>
      {label ? (
        <label className="mb-1 block text-sm font-medium text-gray-700">
          {label}
        </label>
      ) : null}

      {/* Trigger */}
      <div
        role="combobox"
        aria-expanded={open}
        aria-controls={`menu-${uid}`}
        onClick={() => (open ? close() : openMenu())}
        className={cx(
          "flex items-center gap-2 rounded-md border px-3 py-2 bg-white",
          "border-gray-300 hover:border-gray-400",
          open ? "border-gray-400" : "",
          isDisabled ? "opacity-60 cursor-not-allowed" : "cursor-pointer"
        )}
      >
        <div className="min-w-0 flex-1">
          {display ? (
            <div className="text-sm text-gray-900 truncate">{display}</div>
          ) : (
            <div className="text-sm text-gray-400">{placeholder}</div>
          )}
        </div>

        {isClearable && !isDisabled && hasValue ? (
          <button
            type="button"
            onClick={clear}
            className="p-1 rounded hover:bg-gray-100"
            style={{ cursor: "pointer" }}
            aria-label="Clear selection"
          >
            <X className="h-4 w-4 text-gray-500" />
          </button>
        ) : null}

        <ChevronDownIcon className="h-5 w-5 text-gray-500" />
        <input
          type="hidden"
          name={name}
          value={isMultiple ? safeArray(selected).join(",") : safeStr(selected)}
        />
      </div>

      {/* Dropdown */}
      {open ? (
        <div className="mt-2 rounded-md border border-gray-200 bg-white shadow-lg overflow-hidden">
          {/* Search */}
          <div className="p-2 border-b border-gray-100 bg-white">
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search..."
              className={cx(
                "w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm",
                "outline-none focus:border-gray-400 focus:ring-0"
              )}
            />
          </div>

          {/* List */}
          <div
            id={`menu-${uid}`}
            ref={menuRef}
            role="listbox"
            aria-multiselectable={isMultiple || undefined}
            style={{ maxHeight: maxMenuHeight }}
            className="overflow-y-auto overscroll-contain"
          >
            {filtered.length === 0 ? (
              <div className="px-3 py-3 text-sm text-gray-500">No data found</div>
            ) : (
              filtered.map((item, idx) => {
                // ✅ safe key fallback if valueKey missing
                const k = safeStr(item?.[valueKey]) || `idx-${idx}`;
                const labelText = safeStr(item?.[labelKey]) || "Unknown";
                const isSel = selectedSet.has(k);
                const active = idx === activeIndex;

                return (
                  <div key={k} data-idx={idx}>
                    <OptionRow
                      id={`opt-${uid}-${idx}`}
                      active={active}
                      selected={isSel}
                      label={labelText}
                      onMouseEnter={() => setActiveIndex(idx)}
                      onClick={() => toggleItem(item)}
                    />
                  </div>
                );
              })
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
