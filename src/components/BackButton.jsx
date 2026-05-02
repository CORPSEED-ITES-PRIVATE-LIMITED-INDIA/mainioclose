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
      className={`inline-flex items-center gap-2 rounded-full  px-3 py-1 text-sm font-semibold text-black dark:text-white shadow-sm transition-all duration-300 hover:bg-blue-700 hover:shadow-md`}
    >
      <ArrowLeft size={16} />
      Back
    </button>
  );
}
