import { useRef, useState, useEffect } from "react";
import { api } from "../httpRequest";

const SingleFileUploader = ({ value, onChange, label, isRequired = false,errorMessage }) => {
  const dropRef = useRef(null);
  const fileInputRef = useRef(null);
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState("idle");

  const allowedTypes = [
    "image/png",
    "image/jpeg",
    "image/jpg",
    "image/gif",
    "application/pdf",
    "text/plain",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ];

  const uploadFile = async (selectedFile) => {
    setStatus("uploading");
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
        setStatus("success");
        onChange(url); // Call onChange with the uploaded URL
      } else {
        console.warn("Unexpected response structure:", response?.data);
        setStatus("error");
      }
    } catch (error) {
      console.error("Upload failed for", error);
      setStatus("error");
    }
  };

  const handleFile = (selectedFiles) => {
    const selectedFile = selectedFiles[0];
    if (selectedFile && allowedTypes.includes(selectedFile.type)) {
      setFile(selectedFile);
      uploadFile(selectedFile);
    } else {
      setStatus("error");
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

  const handleClickDropZone = (e) => {
    if (!file || status !== "success") {
      fileInputRef.current.click();
    }
  };

  const handleClearFile = () => {
    setFile(null);
    onChange(null); // Clear the URL via onChange
    setStatus("idle");
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
      />

      <div
        ref={dropRef}
        onClick={handleClickDropZone}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`w-full min-h-[52px] border-2 rounded-lg mt-1 border-gray-600 dark:text-white flex flex-col items-start justify-center px-2 cursor-pointer  transition-colors ${
          file && status === "success" ? "cursor-not-allowed opacity-70" : ""
        }`}
      >
        {label && (
          <p className="text-sm text-gray-400">
            {label}
            {isRequired && <span className="text-red-500">*</span>}
          </p>
        )}
        <div className="flex items-center gap-2">
          <button
            type="button"
            className={`bg-blue-500 text-white text-tiny  px-2 py-[3px] rounded hover:bg-blue-600 ${
              file && status === "success" ? "hidden" : ""
            }`}
            onClick={(e) => {
              e.stopPropagation();
              fileInputRef.current.click();
            }}
          >
            Choose
          </button>
          <p className="text-tiny text-gray-400">
            {file && status === "success"
              ? "File uploaded. Click to replace."
              : "or Drag & Drop File Here, or Paste"}
          </p>
        </div>
      </div>
      {
        errorMessage &&  <p className="text-red-500 text-xs">{errorMessage} </p>
      }

      {file && (
        <div className="mt-4 flex items-center gap-2">
          <p
            className={`${
              status === "success" ? "text-green-600" : "text-gray-800"
            } text-tiny`}
          >
            {file.name} ({Math.round(file.size / 1024)} KB)
            {status === "success" && value && (
              <>
                {" "}
                –{" "}
                <a
                  href={value}
                  className="underline"
                  target="_blank"
                  rel="noreferrer"
                >
                  View
                </a>
              </>
            )}
            {status === "uploading" && " – Uploading..."}
            {status === "error" && " – Failed"}
          </p>
          {file && (
            <button
              type="button"
              onClick={handleClearFile}
              className="text-red-500 text-tiny hover:text-red-700"
            >
              Clear
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default SingleFileUploader;