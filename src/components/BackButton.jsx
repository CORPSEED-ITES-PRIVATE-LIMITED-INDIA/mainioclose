import { ArrowLeft } from "lucide-react";

export default function BackButton({ fallback }) {
  const handleBack = () => {
    if (window.history.length > 2) {
      window.history.back();
    } else {
      window.location.href = fallback;
    }
  };

  return (
    <button
      type="button"
      onClick={handleBack}
      className={`inline-flex items-center gap-2 rounded-full  px-3 py-1 text-sm font-semibold bg-gray-300 outline-gray-200 text-gray-600 dark:text-white dark:bg-gray-700 shadow-sm transition-all duration-300 hover:bg-gray-200 hover:outline-gray-200 hover:shadow-md cursor-pointer`}
    >
      <ArrowLeft size={16} />
    </button>
  );
}
