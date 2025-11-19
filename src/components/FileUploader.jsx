import { useRef, useState, useEffect } from "react";
import { api } from "../httpRequest";

const FileUploader = ({
  value,
  onChange,
  label,
  isRequired = false,
  errorMessage,
  uploadingType = "single",
}) => {
  const dropRef = useRef(null);
  const fileInputRef = useRef(null);
  const [files, setFiles] = useState([]);
  const [statuses, setStatuses] = useState({}); // Track status for each file

const allowedTypes = [
  "image/png",
  "image/jpeg",
  "image/jpg",
  "image/gif",
  "application/pdf",
  "text/plain",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",  // .xls
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // .xlsx
];


  const uploadFile = async (selectedFile, index) => {
    setStatuses((prev) => ({ ...prev, [index]: "uploading" }));
    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      const response = await api.post(
        "/leadService/api/v1/upload/uploadimageToFileSystem",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      const url = response?.data;
      if (response?.status === 200 && url) {
        setStatuses((prev) => ({ ...prev, [index]: "success" }));
        // Update the value array with the new URL
        onChange(uploadingType === "multiple" ? [...(value || []), url] : url);
      } else {
        console.warn("Unexpected response structure:", response?.data);
        setStatuses((prev) => ({ ...prev, [index]: "error" }));
      }
    } catch (error) {
      console.error("Upload failed for", selectedFile.name, error);
      setStatuses((prev) => ({ ...prev, [index]: "error" }));
    }
  };

  const handleFile = (selectedFiles) => {
    const newFiles = Array.from(selectedFiles).filter((file) =>
      allowedTypes.includes(file.type)
    );

    if (newFiles.length === 0) {
      setStatuses((prev) => ({ ...prev, [files.length]: "error" }));
      return;
    }

    if (uploadingType === "multiple") {
      setFiles((prev) => [...prev, ...newFiles]);
      newFiles.forEach((file, index) => {
        uploadFile(file, files.length + index);
      });
    } else {
      setFiles([newFiles[0]]);
      uploadFile(newFiles[0], 0);
    }
  };

  const handleFileInputChange = (e) => {
    if (e.target.files.length) {
      handleFile(e.target.files);
      e.target.value = null;
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files.length) {
      handleFile(e.dataTransfer.files);
    }
    dropRef.current.classList.remove("highlight");
  };

  const handlePaste = (e) => {
    if (e.clipboardData?.files?.length) {
      handleFile(e.clipboardData.files);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    dropRef.current.classList.add("highlight");
  };

  const handleDragLeave = () => {
    dropRef.current.classList.remove("highlight");
  };

  const handleClickDropZone = () => {
    if (
      uploadingType !== "multiple" &&
      files.length > 0 &&
      statuses[0] === "success"
    ) {
      return; // Prevent clicking if single file is already uploaded successfully
    }
    fileInputRef.current.click();
  };

  const handleClearFile = (index) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
    setStatuses((prev) => {
      const newStatuses = { ...prev };
      delete newStatuses[index];
      // Reindex statuses
      const reindexedStatuses = {};
      Object.keys(newStatuses)
        .sort()
        .forEach((key, i) => {
          reindexedStatuses[i] = newStatuses[key];
        });
      return reindexedStatuses;
    });
    // Update value by removing the URL at the specific index
    if (uploadingType === "multiple") {
      const newValue = (value || []).filter((_, i) => i !== index);
      onChange(newValue.length > 0 ? newValue : []);
    } else {
      onChange(null);
    }
  };

  useEffect(() => {
    document.addEventListener("paste", handlePaste);
    return () => {
      document.removeEventListener("paste", handlePaste);
    };
  }, []);

  return (
    <div className="w-full">
      <input
        type="file"
        ref={fileInputRef}
        accept={allowedTypes.join(",")}
        style={{ display: "none" }}
        onChange={handleFileInputChange}
        multiple={uploadingType === "multiple"}
      />

      <div
        ref={dropRef}
        onClick={handleClickDropZone}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`w-full min-h-[52px] border-2 rounded-lg mt-1 border-gray-600 dark:text-white flex flex-col items-start justify-center px-2 cursor-pointer transition-colors ${
          uploadingType !== "multiple" &&
          files.length > 0 &&
          statuses[0] === "success"
            ? "cursor-not-allowed opacity-70"
            : ""
        }`}
      >
        {label && (
          <p className="text-sm">
            {label}
            {isRequired && <span className="text-red-500">*</span>}
          </p>
        )}
        <div className="flex items-center gap-2">
          <button
            type="button"
            className={`bg-blue-500 text-white text-tiny px-2 py-[3px] rounded hover:bg-blue-600 ${
              uploadingType !== "multiple" &&
              files.length > 0 &&
              statuses[0] === "success"
                ? "hidden"
                : ""
            }`}
            onClick={(e) => {
              e.stopPropagation();
              fileInputRef.current.click();
            }}
          >
            Choose
          </button>
          <p className="text-tiny text-gray-400">
            {uploadingType === "multiple" &&
            files.length > 0 &&
            Object.values(statuses).includes("success")
              ? "Files uploaded. Add more or replace."
              : uploadingType === "multiple"
                ? "or Drag & Drop Files Here, or Paste"
                : files.length > 0 && statuses[0] === "success"
                  ? "File uploaded. Click to replace."
                  : "or Drag & Drop File Here, or Paste"}
          </p>
        </div>
      </div>
      {errorMessage && <p className="text-red-500 text-xs">{errorMessage}</p>}

      {files.length > 0 && (
        <div className="mt-4 flex flex-col gap-2">
          {files.map((file, index) => (
            <div key={index} className="flex items-center gap-2">
              <p
                className={`${
                  statuses[index] === "success"
                    ? "text-green-600"
                    : "text-gray-800"
                } text-tiny`}
              >
                {file.name} ({Math.round(file.size / 1024)} KB)
                {statuses[index] === "success" && value?.[index] && (
                  <>
                    {" "}
                    –{" "}
                    <a
                      href={value[index]}
                      className="underline"
                      target="_blank"
                      rel="noreferrer"
                    >
                      View
                    </a>
                  </>
                )}
                {statuses[index] === "uploading" && " – Uploading..."}
                {statuses[index] === "error" && " – Failed"}
              </p>
              <button
                type="button"
                onClick={() => handleClearFile(index)}
                className="text-red-500 text-tiny hover:text-red-700"
              >
                Clear
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FileUploader;
