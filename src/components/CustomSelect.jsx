import React, { useState, useMemo, useRef } from 'react';
import {  Popover, PopoverTrigger, PopoverContent } from '@heroui/react';
import { Input } from '@heroui/react';
import { ChevronDownIcon } from 'lucide-react';

const SearchableSelect = ({ options, placeholder = "Type to search..." }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedKey, setSelectedKey] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const triggerRef = useRef(null);

  // Filter options based on search query
  const filteredOptions = useMemo(() => {
    if (!searchQuery) return options;
    return options.filter(option =>
      option.label.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery, options]);

  return (
    <div className="w-full max-w-xs">
      <Popover
        isOpen={isOpen}
        onOpenChange={(open) => setIsOpen(open)}
        placement="bottom"
        classNames={{
          content: "p-0 rounded-medium",
        }}
        // Match popover width to trigger width
        style={{ width: triggerRef.current?.offsetWidth }}
      >
        <PopoverTrigger>
          <div
            ref={triggerRef}
            className="w-full border-small px-3 py-2 rounded-medium border-default-200 cursor-pointer flex justify-between items-center bg-white"
            onClick={() => setIsOpen(true)}
          >
            <span>
              {selectedKey
                ? options.find((option) => option.value === selectedKey)?.label || placeholder
                : placeholder}
            </span>
            <ChevronDownIcon className="w-5 h-5 text-default-500" />
          </div>
        </PopoverTrigger>
        <PopoverContent>
          <div className="w-full p-2">
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={placeholder}
              className="mb-2"
              aria-label="Search options"
              classNames={{
                input: "bg-transparent",
                innerWrapper: "bg-transparent",
              }}
            />
            <div className="max-h-60 overflow-y-auto">
              {filteredOptions.length > 0 ? (
                filteredOptions.map((option) => (
                  <div
                    key={option.value}
                    className="px-2 py-1 hover:bg-default-100 cursor-pointer rounded"
                    onClick={() => {
                      setSelectedKey(option.value);
                      setSearchQuery('');
                      setIsOpen(false);
                    }}
                  >
                    {option.label}
                  </div>
                ))
              ) : (
                <div className="px-2 py-1 text-default-500">
                  No options found
                </div>
              )}
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};

// Example usage
const CustomSelect = () => {
  const sampleOptions = [
    { label: 'Apple', value: 'apple' },
    { label: 'Banana', value: 'banana' },
    { label: 'Orange', value: 'orange' },
    { label: 'Grape', value: 'grape' },
    { label: 'Mango', value: 'mango' },
  ];

  return (
    <div className="p-4">
      <h1 className="text-2xl mb-4">Searchable Select Component</h1>
      <SearchableSelect options={sampleOptions} />
    </div>
  );
};

export default CustomSelect;