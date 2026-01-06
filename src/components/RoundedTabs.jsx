const RoundedTabs = ({
  tabs = [],
  value,
  onChange,
  className = "",
  buttonClassName = "",
}) => {
  return (
    <div className={`flex flex-wrap gap-2 border-b pb-3 ${className}`}>
      {tabs?.length > 0 &&
        tabs?.map((tab) => {
          const isActive = value === tab.id;

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onChange(tab.id)}
              className={`
              px-4 py-1.5 min-h-[32px]
              text-sm font-medium rounded-full
              border
              transition-colors transition-transform duration-200 ease-in-out
              cursor-pointer
              ${
                isActive
                  ? "bg-primary text-white border-primary shadow-sm scale-[1.02]"
                  : "bg-white text-gray-600 border-gray-300 hover:bg-gray-100"
              }
              ${buttonClassName}
            `}
            >
              {tab.label}
            </button>
          );
        })}
    </div>
  );
};

export default RoundedTabs;
