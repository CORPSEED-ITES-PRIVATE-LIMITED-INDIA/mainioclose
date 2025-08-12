import { useRef, useState, useEffect } from "react";
import { api } from "../httpRequest";

const BulkFileUploader = ({setFiles,files}) => {
  const dropRef = useRef(null);
  const fileInputRef = useRef(null);

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

  const uploadSingleFile = async (fileObj) => {
    const formData = new FormData();
    formData.append("file", fileObj.file);

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

      const fileUrl = response?.data;
      if (
        fileUrl &&
        typeof fileUrl === "string" &&
        fileUrl.startsWith("http")
      ) {
        updateFileStatus(fileObj.id, "success", fileUrl);
      } else {
        console.warn(
          "Upload succeeded but unexpected response:",
          response?.data
        );
        updateFileStatus(fileObj.id, "error");
      }
    } catch (error) {
      console.error("Upload failed for", fileObj.file.name, error);
      updateFileStatus(fileObj.id, "error");
    }
  };

  const updateFileStatus = (id, status, url = "") => {
    setFiles((prev) =>
      prev.map((f) => (f.id === id ? { ...f, status, url } : f))
    );
  };

  const handleFiles = (selectedFiles) => {
    const validFiles = Array.from(selectedFiles).filter((file) =>
      allowedTypes.includes(file.type)
    );

    validFiles.forEach((file) => {
      const id = `${file.name}-${file.lastModified}`;
      const alreadyExists = files.some((f) => f.id === id);
      if (alreadyExists) return;

      const fileObj = { id, file, status: "pending", url: "" };
      setFiles((prev) => [...prev, fileObj]);
      uploadSingleFile(fileObj);
    });
  };

  const handleFileInputChange = (e) => {
    handleFiles(e.target.files);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    handleFiles(e.dataTransfer.files);
    dropRef.current.classList.remove("highlight");
  };

  const handlePaste = (e) => {
    if (e.clipboardData?.files?.length) {
      handleFiles(e.clipboardData.files);
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
    fileInputRef.current.click();
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
        multiple
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
        className="w-full h-[150px] border-2 border-dashed rounded-lg mt-3 border-slate-300 dark:text-white flex items-center justify-center cursor-pointer bg-inherit transition-colors"
      >
        Drag & Drop Files Here, Click to Choose, or Paste with Ctrl+V
      </div>

      <div className="mt-4">
        <h4 className="font-semibold">Uploaded Files:</h4>
        <ul className="list-disc list-inside">
          {files.map((fileObj) => (
            <li
              key={fileObj.id}
              className={`${
                fileObj.status === "success"
                  ? "text-green-600"
                  : fileObj.status === "error"
                  ? "text-red-600"
                  : "text-gray-800"
              }`}
            >
              {fileObj.file.name} ({Math.round(fileObj.file.size / 1024)} KB)
              {fileObj.status === "success" && fileObj.url && (
                <>
                  {" "}
                  –{" "}
                  <a
                    href={fileObj.url}
                    className="underline"
                    target="_blank"
                    rel="noreferrer"
                  >
                    View
                  </a>
                </>
              )}
              {fileObj.status === "pending" && " – Uploading..."}
              {fileObj.status === "error" && " – Failed"}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default BulkFileUploader;
