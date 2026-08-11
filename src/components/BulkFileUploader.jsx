import { useRef, useState, useEffect } from "react";
import { addToast, Chip } from "@heroui/react";
import { UploadCloud, FileText, CheckCircle2, XCircle } from "lucide-react";
import { api } from "../httpRequest";

const BulkFileUploader = ({ setFiles, files, leadData }) => {
  const dropRef = useRef(null);
  const fileInputRef = useRef(null);

  const allowedTypes = [
    "image/png",
    "image/jpeg",
    "image/jpg",
    "image/gif",
    "application/pdf",
    "text/plain",
    "image/webp",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "text/csv",
    "application/csv",
  ];

  const dragActiveClasses = [
    "border-primary",
    "bg-primary-50",
    "dark:bg-primary-900/30",
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
        },
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
          response?.data,
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
      prev.map((f) => (f.id === id ? { ...f, status, url } : f)),
    );
  };

  const handleFiles = (selectedFiles) => {
    const validFiles = Array.from(selectedFiles).filter((file) =>
      allowedTypes.includes(file.type),
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
    if (
      leadData?.proposalStatus === "APPROVED" ||
      leadData?.proposalStatus === "INITIATED"
    ) {
      addToast({
        title: "RESTRICTED",
        description:
          "You are not required perform any action before approval or initiation of proposal.",
        color: "danger",
      });
      return;
    }
    handleFiles(e.target.files);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    if (
      leadData?.proposalStatus === "APPROVED" ||
      leadData?.proposalStatus === "INITIATED"
    ) {
      addToast({
        title: "RESTRICTED",
        description:
          "You are not required perform any action before approval or initiation of proposal.",
        color: "danger",
      });
      return;
    }
    handleFiles(e.dataTransfer.files);
    dropRef.current.classList.remove(...dragActiveClasses);
  };

  const handlePaste = (e) => {
    if (e.clipboardData?.files?.length) {
      handleFiles(e.clipboardData.files);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    if (
      leadData?.proposalStatus === "APPROVED" ||
      leadData?.proposalStatus === "INITIATED"
    ) {
      addToast({
        title: "RESTRICTED",
        description:
          "You are not required perform any action before approval or initiation of proposal.",
        color: "danger",
      });
      return;
    }
    dropRef.current.classList.add(...dragActiveClasses);
  };

  const handleDragLeave = () => {
    if (
      leadData?.proposalStatus === "APPROVED" ||
      leadData?.proposalStatus === "INITIATED"
    ) {
      addToast({
        title: "RESTRICTED",
        description:
          "You are not required perform any action before approval or initiation of proposal.",
        color: "danger",
      });
      return;
    }
    dropRef.current.classList.remove(...dragActiveClasses);
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
        className="w-full h-[150px] border-2 border-dashed rounded-lg mt-3 border-slate-300 dark:border-slate-600 dark:text-white flex flex-col items-center justify-center gap-1.5 cursor-pointer bg-inherit hover:border-primary hover:bg-primary-50/60 dark:hover:bg-primary-900/20 transition-colors duration-150 text-center px-4"
      >
        <UploadCloud className="w-7 h-7 text-slate-400 dark:text-slate-500" />
        <p className="text-sm font-medium text-slate-700 dark:text-slate-200">
          Drag & drop files here, click to choose, or paste with Ctrl+V
        </p>
        <p className="text-[11px] text-slate-400 dark:text-slate-500">
          PDF, DOC, XLS, CSV, TXT, PNG, JPG, GIF, WEBP
        </p>
      </div>

      <div className="mt-4">
        <p className="text-sm font-semibold mb-2">Uploaded Files</p>

        {(!files || files.length === 0) && (
          <p className="text-xs text-slate-400 dark:text-slate-500">
            No files uploaded yet.
          </p>
        )}

        {files?.length > 0 && (
          <ul className="flex flex-col gap-2">
            {files.map((fileObj) => (
              <li
                key={fileObj?.id}
                className="flex items-center gap-3 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/40 px-3 py-2"
              >
                <FileText className="w-5 h-5 shrink-0 text-slate-400 dark:text-slate-500" />

                <div className="flex flex-col min-w-0 flex-1">
                  <span
                    className="text-sm text-slate-800 dark:text-slate-100 truncate"
                    title={fileObj?.file?.name}
                  >
                    {fileObj?.file?.name}
                  </span>
                  <span className="text-[11px] text-slate-400 dark:text-slate-500">
                    {Math.round(fileObj?.file?.size / 1024)} KB
                  </span>
                </div>

                <div className="shrink-0">
                  {fileObj?.status === "pending" && (
                    <Chip
                      size="sm"
                      variant="flat"
                      color="warning"
                      className="text-[11px]"
                      startContent={
                        <span className="ml-1.5 h-3 w-3 animate-spin rounded-full border-2 border-warning-400 border-t-transparent" />
                      }
                    >
                      Uploading...
                    </Chip>
                  )}

                  {fileObj?.status === "success" && fileObj?.url && (
                    <a
                      href={fileObj.url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 rounded-full bg-success-50 dark:bg-success-900/30 px-2.5 py-1 text-[11px] font-medium text-success-600 dark:text-success-400 hover:underline"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      View
                    </a>
                  )}

                  {fileObj?.status === "error" && (
                    <Chip
                      size="sm"
                      variant="flat"
                      color="danger"
                      className="text-[11px]"
                      startContent={<XCircle className="w-3.5 h-3.5" />}
                    >
                      Failed
                    </Chip>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default BulkFileUploader;
