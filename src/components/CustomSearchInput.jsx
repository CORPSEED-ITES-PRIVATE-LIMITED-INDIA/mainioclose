import { Button, Input } from "@heroui/react";
import { useEffect, useRef, useState } from "react";

const CustomSearchInput = ({
  onChange,
  onSelect,
  value,
  isButton,
  buttonText,
  onButtonClick
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const inputRef = useRef(null);
  const dropdownRef = useRef(null);
  const [inputWidth, setInputWidth] = useState("100%");

  // Sample company data for search results
  const companies = [
    "Apple Inc.",
    "Microsoft Corporation",
    "Google LLC",
    "Amazon",
    "Tesla",
    "Meta Platforms",
    "Netflix",
    "Adobe",
    "Salesforce",
    "Intel",
  ];

  const filteredCompanies = companies.filter((company) =>
    company.toLowerCase().includes(value?.toLowerCase())
  );

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target) &&
        !inputRef.current.contains(event.target)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const updateWidth = () => {
      if (inputRef.current) {
        setInputWidth(inputRef.current.offsetWidth);
      }
    };

    updateWidth();
    window.addEventListener("resize", updateWidth);
    return () => window.removeEventListener("resize", updateWidth);
  }, []);

  return (
    <div className="relative w-full">
      <Input
        ref={inputRef}
        label="Company"
        placeholder="Search for company"
        variant="bordered"
        className="w-full"
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
          setIsOpen(true);
        }}
        onFocus={() => setIsOpen(true)}
      />
      {isOpen && (
        <div
          ref={dropdownRef}
          className="absolute z-10 mt-1 w-full border rounded-md shadow-lg"
          style={{ width: inputWidth }}
        >
          <div className="max-h-[160px] overflow-y-auto px-2 py-1">
            {filteredCompanies.length > 0 ? (
              filteredCompanies.map((company, index) => (
                <div
                  key={index}
                  className="px-4 py-2 text-tiny cursor-pointer transition-colors rounded-lg hover:bg-slate-400 dark:hover:text-black"
                  onClick={() => {
                    onSelect(company);
                    setIsOpen(false);
                  }}
                >
                  {company}
                </div>
              ))
            ) : (
              <div className="px-4 py-2 text-gray-400">No results found</div>
            )}
          </div>
          {isButton && (
            <div className="sticky bottom-0 w-full flex justify-center items-center p-2 ">
              <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white" onPress={onButtonClick}  >
                {buttonText}
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CustomSearchInput;