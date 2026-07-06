import { useEffect, useRef, useState } from "react";
import { api } from "../httpRequest";

const allowedTypes = [
  "image/png",
  "image/jpeg",
  "image/jpg",
  "image/gif",
  "image/webp",
  "application/pdf",
  "text/plain",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "text/csv",
  "application/csv",
];

const extractUploadedUrl = (responseData) => {
  if (!responseData) return "";

  if (typeof responseData === "string") return responseData;

  return (
    responseData?.filePath ||
    responseData?.url ||
    responseData?.fileUrl ||
    responseData?.path ||
    responseData?.data ||
    ""
  );
};

const getFileMeta = (selectedFile, filePath) => {
  return {
    filePath,
    fileName: selectedFile?.name || "",
    contentType: selectedFile?.type || "application/octet-stream",
    fileSize: Number(selectedFile?.size || 0),
    description: "",
  };
};

const FileUploader = ({
  value,
  onChange,
  onUploadSuccess,
  onUploadingChange,
  label,
  placeholder,
  isRequired = false,
  errorMessage,
  uploadingType = "single",
}) => {
  const dropRef = useRef(null);
  const fileInputRef = useRef(null);

  const [files, setFiles] = useState([]);
  const [statuses, setStatuses] = useState({});

  useEffect(() => {
    const isUploading = Object.values(statuses).includes("uploading");
    onUploadingChange?.(isUploading);
  }, [statuses, onUploadingChange]);

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
        },
      );

      const uploadedUrl = extractUploadedUrl(response?.data);

      if (response?.status === 200 && uploadedUrl) {
        const uploadedMeta = getFileMeta(selectedFile, uploadedUrl);

        setStatuses((prev) => ({ ...prev, [index]: "success" }));

        if (uploadingType === "multiple") {
          const nextValue = [
            ...(Array.isArray(value) ? value : []),
            uploadedUrl,
          ];
          onChange?.(nextValue);
        } else {
          onChange?.(uploadedUrl);
        }

        onUploadSuccess?.(uploadedMeta, index);
      } else {
        console.warn("Unexpected response structure:", response?.data);
        setStatuses((prev) => ({ ...prev, [index]: "error" }));
      }
    } catch (error) {
      console.error("Upload failed for", selectedFile?.name, error);
      setStatuses((prev) => ({ ...prev, [index]: "error" }));
    }
  };

  const handleFile = (selectedFiles) => {
    const selectedFileList = Array.from(selectedFiles || []);

    const validFiles = selectedFileList.filter((file) => {
      return !file?.type || allowedTypes.includes(file.type);
    });

    if (validFiles.length === 0) {
      setStatuses((prev) => ({ ...prev, [files.length]: "error" }));
      return;
    }

    if (uploadingType === "multiple") {
      const startIndex = files.length;

      setFiles((prev) => [...prev, ...validFiles]);

      validFiles.forEach((file, fileIndex) => {
        uploadFile(file, startIndex + fileIndex);
      });
    } else {
      setFiles([validFiles[0]]);
      setStatuses({});
      uploadFile(validFiles[0], 0);
    }
  };

  const handleFileInputChange = (event) => {
    if (event.target.files?.length) {
      handleFile(event.target.files);
      event.target.value = "";
    }
  };

  const handleDrop = (event) => {
    event.preventDefault();

    if (event.dataTransfer.files?.length) {
      handleFile(event.dataTransfer.files);
    }

    dropRef.current?.classList.remove("highlight");
  };

  const handlePaste = (event) => {
    if (event.clipboardData?.files?.length) {
      handleFile(event.clipboardData.files);
    }
  };

  const handleDragOver = (event) => {
    event.preventDefault();
    dropRef.current?.classList.add("highlight");
  };

  const handleDragLeave = () => {
    dropRef.current?.classList.remove("highlight");
  };

  const handleClickDropZone = () => {
    fileInputRef.current?.click();
  };

  const handleClearFile = (index) => {
    setFiles((prev) => prev.filter((_, fileIndex) => fileIndex !== index));

    setStatuses((prev) => {
      const nextStatuses = { ...prev };
      delete nextStatuses[index];

      const reindexedStatuses = {};
      Object.keys(nextStatuses)
        .sort((a, b) => Number(a) - Number(b))
        .forEach((key, newIndex) => {
          reindexedStatuses[newIndex] = nextStatuses[key];
        });

      return reindexedStatuses;
    });

    if (uploadingType === "multiple") {
      const nextValue = (Array.isArray(value) ? value : []).filter(
        (_, valueIndex) => valueIndex !== index,
      );

      onChange?.(nextValue.length > 0 ? nextValue : []);
    } else {
      onChange?.("");
      onUploadSuccess?.({
        filePath: "",
        fileName: "",
        contentType: "",
        fileSize: 0,
        description: "",
      });
    }
  };

  useEffect(() => {
    document.addEventListener("paste", handlePaste);

    return () => {
      document.removeEventListener("paste", handlePaste);
    };
  });

  const hasSingleUploadedFile =
    uploadingType !== "multiple" &&
    files?.length > 0 &&
    statuses[0] === "success";

  const helperText =
    placeholder ||
    (uploadingType === "multiple"
      ? "Drag & drop files here, paste, or choose files"
      : "Drag & drop file here, paste, or choose file");

  return (
    <div className="w-full">
      <input
        type="file"
        ref={fileInputRef}
        accept={allowedTypes.join(",")}
        className="hidden"
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
        className={`mt-1 flex min-h-[76px] w-full cursor-pointer flex-col justify-center rounded-xl border border-dashed px-3 py-2 transition-colors ${
          errorMessage
            ? "border-danger text-danger"
            : "border-default-300 text-default-700 hover:border-primary"
        }`}
      >
        {label && (
          <p className="mb-1 text-sm font-medium">
            {label}
            {isRequired && <span className="text-danger">*</span>}
          </p>
        )}

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            className="rounded-md bg-primary px-3 py-1 text-xs font-medium text-white hover:bg-primary-600"
            onClick={(event) => {
              event.stopPropagation();
              fileInputRef.current?.click();
            }}
          >
            {hasSingleUploadedFile ? "Replace" : "Choose"}
          </button>

          <p className="text-xs text-default-500">{helperText}</p>
        </div>
      </div>

      {errorMessage && (
        <p className="mt-1 text-xs text-danger">{errorMessage}</p>
      )}

      {files.length > 0 && (
        <div className="mt-3 flex flex-col gap-2">
          {files.map((file, index) => {
            const fileUrl =
              uploadingType === "multiple" ? value?.[index] : value;

            return (
              <div
                key={`${file?.name}-${index}`}
                className="flex items-center justify-between gap-3 rounded-lg border border-default-200 px-3 py-2"
              >
                <div className="min-w-0">
                  <p
                    className={`truncate text-xs font-medium ${
                      statuses[index] === "success"
                        ? "text-success"
                        : statuses[index] === "error"
                          ? "text-danger"
                          : "text-default-700"
                    }`}
                  >
                    {file?.name} ({Math.round((file?.size || 0) / 1024)} KB)
                  </p>

                  <p className="text-[11px] text-default-400">
                    {statuses[index] === "uploading" && "Uploading..."}
                    {statuses[index] === "success" && "Uploaded successfully"}
                    {statuses[index] === "error" && "Upload failed"}
                  </p>
                </div>

                <div className="flex shrink-0 items-center gap-2">
                  {statuses[index] === "success" && fileUrl && (
                    <a
                      href={fileUrl}
                      className="text-xs font-medium text-primary underline"
                      target="_blank"
                      rel="noreferrer"
                      onClick={(event) => event.stopPropagation()}
                    >
                      View
                    </a>
                  )}

                  <button
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation();
                      handleClearFile(index);
                    }}
                    className="text-xs font-medium text-danger hover:text-danger-600"
                  >
                    Clear
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default FileUploader;
