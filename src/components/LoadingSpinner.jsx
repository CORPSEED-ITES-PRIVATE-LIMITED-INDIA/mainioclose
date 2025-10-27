import { Spinner } from "@heroui/react";

const LoadingSpinner = ({color,labelColor}) => {
  return (
    <div className="fixed inset-0 flex items-center justify-center backdrop-blur-xs bg-black/20 z-[9999]">
      <Spinner
        color={color || "primary"}
        label="Loading ..."
        labelColor={labelColor || "primary"}
        classNames={{ label: "text-2xl font-medium" }}
      />
    </div>
  );
};

export default LoadingSpinner;
