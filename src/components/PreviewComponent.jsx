import {
  Button,
  Chip,
  Modal,
  ModalBody,
  ModalContent,
  ModalHeader,
  Spinner,
  Tooltip,
} from "@heroui/react";
import {
  AlertCircle,
  Check,
  Clipboard,
  ExternalLink,
  File,
  FileArchive,
  FileAudio,
  FileImage,
  FileText,
  FileVideo,
  Info,
  Maximize2,
  RefreshCcw,
  RotateCw,
  X,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";

const IMAGE_EXTENSIONS = ["jpg", "jpeg", "png", "gif", "webp", "svg", "bmp"];
const PDF_EXTENSIONS = ["pdf"];
const VIDEO_EXTENSIONS = ["mp4", "webm", "ogg", "mov", "mkv", "avi"];
const AUDIO_EXTENSIONS = ["mp3", "wav", "ogg", "m4a", "aac"];

const TEXT_EXTENSIONS = [
  "txt",
  "csv",
  "json",
  "xml",
  "html",
  "css",
  "js",
  "jsx",
  "ts",
  "tsx",
  "md",
  "log",
];

const OFFICE_EXTENSIONS = [
  "doc",
  "docx",
  "xls",
  "xlsx",
  "ppt",
  "pptx",
  "odt",
  "ods",
  "odp",
];

const ARCHIVE_EXTENSIONS = ["zip", "rar", "7z", "tar", "gz"];

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
const roundZoom = (value) => Number(value.toFixed(2));

const getFileNameFromUrl = (fileUrl = "") => {
  if (!fileUrl || typeof fileUrl !== "string") return "Untitled file";

  try {
    const cleanUrl = fileUrl.split("?")[0].split("#")[0];
    const fileName = cleanUrl.split("/").pop();

    return decodeURIComponent(fileName || "Untitled file");
  } catch {
    return "Untitled file";
  }
};

const getFileExtension = (fileName = "", fileUrl = "") => {
  const source = fileName || getFileNameFromUrl(fileUrl);
  const cleanSource = source.split("?")[0].split("#")[0];

  if (!cleanSource.includes(".")) return "";

  return cleanSource.split(".").pop()?.toLowerCase() || "";
};

const formatFileSize = (bytes) => {
  const size = Number(bytes || 0);

  if (!size || size <= 0) return "";

  const units = ["B", "KB", "MB", "GB"];
  let value = size;
  let index = 0;

  while (value >= 1024 && index < units.length - 1) {
    value = value / 1024;
    index += 1;
  }

  return `${value.toFixed(value >= 10 ? 0 : 1)} ${units[index]}`;
};

const getPreviewType = ({ contentType = "", extension = "" }) => {
  const type = contentType.toLowerCase();

  if (type.startsWith("image/") || IMAGE_EXTENSIONS.includes(extension)) {
    return "image";
  }

  if (type === "application/pdf" || PDF_EXTENSIONS.includes(extension)) {
    return "pdf";
  }

  if (type.startsWith("video/") || VIDEO_EXTENSIONS.includes(extension)) {
    return "video";
  }

  if (type.startsWith("audio/") || AUDIO_EXTENSIONS.includes(extension)) {
    return "audio";
  }

  if (type.startsWith("text/") || TEXT_EXTENSIONS.includes(extension)) {
    return "text";
  }

  if (
    type.includes("word") ||
    type.includes("excel") ||
    type.includes("spreadsheet") ||
    type.includes("powerpoint") ||
    type.includes("presentation") ||
    OFFICE_EXTENSIONS.includes(extension)
  ) {
    return "office";
  }

  if (ARCHIVE_EXTENSIONS.includes(extension)) {
    return "archive";
  }

  return "unknown";
};

const getTypeLabel = (previewType) => {
  switch (previewType) {
    case "image":
      return "Image";
    case "pdf":
      return "PDF";
    case "video":
      return "Video";
    case "audio":
      return "Audio";
    case "text":
      return "Text";
    case "office":
      return "Office Document";
    case "archive":
      return "Archive";
    default:
      return "File";
  }
};

const getTypeIcon = (previewType, size = 18) => {
  switch (previewType) {
    case "image":
      return <FileImage size={size} />;
    case "pdf":
      return <FileText size={size} />;
    case "video":
      return <FileVideo size={size} />;
    case "audio":
      return <FileAudio size={size} />;
    case "text":
      return <FileText size={size} />;
    case "archive":
      return <FileArchive size={size} />;
    default:
      return <File size={size} />;
  }
};

const appendPdfViewerOptions = (url) => {
  if (!url) return "";

  const cleanUrl = url.split("#")[0];

  return `${cleanUrl}#toolbar=0&navpanes=0&scrollbar=1&view=FitH`;
};

const getOfficeViewerUrl = (url) => {
  if (!url) return "";

  return `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(
    url,
  )}`;
};

const getDirectFileUrl = ({ file, fileUrl, url }) => {
  return (
    fileUrl ||
    url ||
    file?.filePath ||
    file?.fileUrl ||
    file?.url ||
    file?.path ||
    file?.brochureBook ||
    file?.brochure ||
    ""
  );
};

const ToolbarButton = ({ tooltip, children, className = "", ...props }) => {
  return (
    <Tooltip content={tooltip}>
      <Button
        isIconOnly
        size="sm"
        variant="flat"
        className={`h-9 w-9 min-w-9 rounded-xl border border-default-200 bg-background text-default-600 shadow-sm hover:bg-default-100 ${className}`}
        {...props}
      >
        {children}
      </Button>
    </Tooltip>
  );
};

const DetailRow = ({ label, value }) => {
  if (!value) return null;

  return (
    <div className="rounded-xl border border-default-200 bg-default-50 px-4 py-3">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-default-400">
        {label}
      </p>
      <p className="mt-1 break-words text-sm font-medium text-default-800">
        {value}
      </p>
    </div>
  );
};

const PreviewEmptyState = ({ title = "No file selected", message }) => {
  return (
    <div className="flex h-full min-h-[360px] flex-col items-center justify-center gap-3 bg-default-50 p-8 text-center">
      <div className="rounded-2xl border border-default-200 bg-background p-4 text-default-400 shadow-sm">
        <AlertCircle size={34} />
      </div>

      <div>
        <p className="text-base font-semibold text-default-800">{title}</p>
        <p className="mt-1 text-sm text-default-500">
          {message || "A valid file URL is required to show preview."}
        </p>
      </div>
    </div>
  );
};

const PreviewComponent = ({
  isOpen = false,
  onOpenChange = () => {},

  file,
  fileUrl,
  url,
  fileName,
  contentType,
  fileSize,
  description,

  title = "File Preview",
  modalSize = "full",

  allowOpenNewTab = true,
  allowCopyLink = true,
  useOfficeViewer = true,

  showDetailsPanelDefault = false,

  isDismissable = false,
  isKeyboardDismissDisabled = false,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [hasPreviewError, setHasPreviewError] = useState(false);
  const [imageZoom, setImageZoom] = useState(1);
  const [imageRotation, setImageRotation] = useState(0);
  const [imageFitMode, setImageFitMode] = useState("fit");
  const [showDetailsPanel, setShowDetailsPanel] = useState(
    showDetailsPanelDefault,
  );
  const [linkCopied, setLinkCopied] = useState(false);

  const resolvedUrl = useMemo(() => {
    return getDirectFileUrl({ file, fileUrl, url });
  }, [file, fileUrl, url]);

  const resolvedFileName = useMemo(() => {
    return (
      fileName ||
      file?.fileName ||
      file?.name ||
      file?.originalName ||
      getFileNameFromUrl(resolvedUrl)
    );
  }, [file, fileName, resolvedUrl]);

  const resolvedContentType = useMemo(() => {
    return contentType || file?.contentType || file?.mimeType || "";
  }, [contentType, file]);

  const resolvedDescription = useMemo(() => {
    return description || file?.description || "";
  }, [description, file]);

  const resolvedFileSize = useMemo(() => {
    return fileSize ?? file?.fileSize ?? file?.size ?? 0;
  }, [fileSize, file]);

  const extension = useMemo(() => {
    return getFileExtension(resolvedFileName, resolvedUrl);
  }, [resolvedFileName, resolvedUrl]);

  const previewType = useMemo(() => {
    return getPreviewType({
      contentType: resolvedContentType,
      extension,
    });
  }, [resolvedContentType, extension]);

  const previewSrc = useMemo(() => {
    if (!resolvedUrl) return "";

    if (previewType === "pdf") {
      return appendPdfViewerOptions(resolvedUrl);
    }

    if (previewType === "office" && useOfficeViewer) {
      return getOfficeViewerUrl(resolvedUrl);
    }

    return resolvedUrl;
  }, [resolvedUrl, previewType, useOfficeViewer]);

  const typeLabel = getTypeLabel(previewType);
  const formattedSize = formatFileSize(resolvedFileSize);
  const showImageTools = previewType === "image" && Boolean(resolvedUrl);

  const zoomIn = useCallback(() => {
    setImageZoom((prev) => roundZoom(clamp(prev + 0.1, 0.25, 5)));
  }, []);

  const zoomOut = useCallback(() => {
    setImageZoom((prev) => roundZoom(clamp(prev - 0.1, 0.25, 5)));
  }, []);

  const resetImage = useCallback(() => {
    setImageZoom(1);
    setImageRotation(0);
    setImageFitMode("fit");
  }, []);

  const rotateImage = useCallback(() => {
    setImageRotation((prev) => (prev + 90) % 360);
  }, []);

  const setActualSize = useCallback(() => {
    setImageFitMode("actual");
    setImageZoom(1);
  }, []);

  const setFitToScreen = useCallback(() => {
    setImageFitMode("fit");
    setImageZoom(1);
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    setHasPreviewError(false);
    setLinkCopied(false);
    setImageZoom(1);
    setImageRotation(0);
    setImageFitMode("fit");
    setShowDetailsPanel(showDetailsPanelDefault);

    if (
      previewType === "image" ||
      previewType === "pdf" ||
      previewType === "text" ||
      previewType === "office"
    ) {
      setIsLoading(Boolean(resolvedUrl));
    } else {
      setIsLoading(false);
    }
  }, [isOpen, resolvedUrl, previewType, showDetailsPanelDefault]);

  useEffect(() => {
    if (!isOpen || previewType !== "image") return;

    const handleKeyDown = (event) => {
      const tagName = event.target?.tagName;

      if (tagName === "INPUT" || tagName === "TEXTAREA") return;

      if (event.key === "+" || event.key === "=") {
        event.preventDefault();
        zoomIn();
      }

      if (event.key === "-") {
        event.preventDefault();
        zoomOut();
      }

      if (event.key === "0") {
        event.preventDefault();
        resetImage();
      }

      if (event.key.toLowerCase() === "r") {
        event.preventDefault();
        rotateImage();
      }

      if (event.key.toLowerCase() === "f") {
        event.preventDefault();
        setFitToScreen();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    isOpen,
    previewType,
    zoomIn,
    zoomOut,
    resetImage,
    rotateImage,
    setFitToScreen,
  ]);

  const handleOpenNewTab = () => {
    if (!resolvedUrl) return;

    window.open(resolvedUrl, "_blank", "noopener,noreferrer");
  };

  const handleCopyLink = async () => {
    if (!resolvedUrl) return;

    try {
      await navigator.clipboard.writeText(resolvedUrl);
      setLinkCopied(true);

      window.setTimeout(() => {
        setLinkCopied(false);
      }, 1400);
    } catch {
      setLinkCopied(false);
    }
  };

  const handleImageWheel = (event) => {
    if (!event.ctrlKey && !event.metaKey) return;

    event.preventDefault();

    if (event.deltaY < 0) {
      zoomIn();
    } else {
      zoomOut();
    }
  };

  const renderLoadingOverlay = () => {
    if (!isLoading) return null;

    return (
      <div className="absolute inset-0 z-20 flex items-center justify-center bg-background/70 backdrop-blur-sm">
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-default-200 bg-background px-6 py-5 shadow-xl">
          <Spinner size="md" />
          <p className="text-sm font-medium text-default-500">
            Loading preview...
          </p>
        </div>
      </div>
    );
  };

  const renderImageToolbar = (extraClassName = "") => {
    if (!showImageTools) return null;

    return (
      <div
        className={`flex items-center gap-1 rounded-2xl border border-default-200 bg-background/95 p-1 shadow-md backdrop-blur-md ${extraClassName}`}
      >
        <ToolbarButton tooltip="Zoom out" onPress={zoomOut}>
          <ZoomOut size={16} />
        </ToolbarButton>

        <Chip size="sm" variant="flat" className="min-w-[62px] justify-center">
          {Math.round(imageZoom * 100)}%
        </Chip>

        <ToolbarButton tooltip="Zoom in" onPress={zoomIn}>
          <ZoomIn size={16} />
        </ToolbarButton>

        <ToolbarButton tooltip="Rotate" onPress={rotateImage}>
          <RotateCw size={16} />
        </ToolbarButton>

        <ToolbarButton tooltip="Fit to screen" onPress={setFitToScreen}>
          <Maximize2 size={16} />
        </ToolbarButton>

        <Tooltip content="Actual size">
          <Button
            size="sm"
            variant="flat"
            className="h-9 rounded-xl border border-default-200 bg-background px-3 text-xs font-semibold"
            onPress={setActualSize}
          >
            1:1
          </Button>
        </Tooltip>

        <ToolbarButton tooltip="Reset" onPress={resetImage}>
          <RefreshCcw size={16} />
        </ToolbarButton>
      </div>
    );
  };

  const renderImagePreview = () => {
    return (
      <div className="relative h-full w-full overflow-hidden bg-[#09090b]">
        {renderLoadingOverlay()}

        <div
          className={
            imageFitMode === "fit"
              ? "flex h-full w-full items-center justify-center overflow-hidden p-4"
              : "h-full w-full overflow-auto overscroll-contain p-6"
          }
          onWheel={handleImageWheel}
        >
          <img
            src={resolvedUrl}
            alt={resolvedFileName}
            draggable={false}
            className="select-none object-contain transition-transform duration-200 ease-out"
            style={{
              maxWidth: imageFitMode === "fit" ? "100%" : "none",
              maxHeight: imageFitMode === "fit" ? "100%" : "none",
              width: "auto",
              height: "auto",
              transform: `scale(${imageZoom}) rotate(${imageRotation}deg)`,
              transformOrigin: "center center",
            }}
            onLoad={() => setIsLoading(false)}
            onError={() => {
              setIsLoading(false);
              setHasPreviewError(true);
            }}
            onDoubleClick={() => {
              if (imageZoom === 1) {
                setImageZoom(2);
                setImageFitMode("actual");
              } else {
                setImageZoom(1);
                setImageFitMode("fit");
              }
            }}
          />
        </div>

        <div className="pointer-events-none absolute bottom-4 left-4 hidden rounded-xl bg-black/50 px-3 py-2 text-xs text-white/80 backdrop-blur-md md:block">
          Double click image to toggle zoom
        </div>

        <div className="absolute bottom-4 left-1/2 z-30 -translate-x-1/2 lg:hidden">
          {renderImageToolbar()}
        </div>
      </div>
    );
  };

  const renderPdfPreview = () => {
    return (
      <div className="relative h-full w-full overflow-hidden bg-default-100">
        {renderLoadingOverlay()}

        <iframe
          title={resolvedFileName}
          src={previewSrc}
          className="h-full w-full border-0 bg-white"
          referrerPolicy="no-referrer"
          onLoad={() => setIsLoading(false)}
        />
      </div>
    );
  };

  const renderVideoPreview = () => {
    return (
      <div className="flex h-full w-full items-center justify-center overflow-hidden bg-black p-4">
        <video
          src={resolvedUrl}
          controls
          controlsList="nodownload"
          className="max-h-full max-w-full rounded-xl"
          onError={() => setHasPreviewError(true)}
        >
          Your browser does not support video preview.
        </video>
      </div>
    );
  };

  const renderAudioPreview = () => {
    return (
      <div className="flex h-full w-full items-center justify-center overflow-hidden bg-default-50 p-8">
        <div className="w-full max-w-2xl rounded-3xl border border-default-200 bg-background p-8 shadow-sm">
          <div className="mb-5 flex items-center gap-4">
            <div className="rounded-2xl bg-primary-50 p-4 text-primary">
              <FileAudio size={34} />
            </div>

            <div className="min-w-0">
              <p className="truncate text-base font-semibold text-default-800">
                {resolvedFileName}
              </p>
              <p className="text-sm text-default-400">
                Audio preview available
              </p>
            </div>
          </div>

          <audio
            src={resolvedUrl}
            controls
            controlsList="nodownload"
            className="w-full"
            onError={() => setHasPreviewError(true)}
          >
            Your browser does not support audio preview.
          </audio>
        </div>
      </div>
    );
  };

  const renderTextPreview = () => {
    return (
      <div className="relative h-full w-full overflow-hidden bg-default-50">
        {renderLoadingOverlay()}

        <iframe
          title={resolvedFileName}
          src={previewSrc}
          className="h-full w-full border-0 bg-white"
          onLoad={() => setIsLoading(false)}
        />
      </div>
    );
  };

  const renderOfficePreview = () => {
    if (!useOfficeViewer) {
      return renderUnsupportedPreview(
        "Office preview is disabled for this component instance.",
      );
    }

    return (
      <div className="relative h-full w-full overflow-hidden bg-default-100">
        {renderLoadingOverlay()}

        <iframe
          title={resolvedFileName}
          src={previewSrc}
          className="h-full w-full border-0 bg-white"
          onLoad={() => setIsLoading(false)}
        />
      </div>
    );
  };

  const renderUnsupportedPreview = (
    message = "Preview is not available for this file type.",
  ) => {
    return (
      <div className="flex h-full w-full items-center justify-center overflow-hidden bg-default-50 p-8">
        <div className="max-w-lg rounded-3xl border border-default-200 bg-background p-8 text-center shadow-sm">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-default-100 text-default-500">
            {getTypeIcon(previewType, 34)}
          </div>

          <p className="text-lg font-semibold text-default-800">
            Preview unavailable
          </p>

          <p className="mt-2 text-sm leading-6 text-default-500">{message}</p>
        </div>
      </div>
    );
  };

  const renderPreviewBody = () => {
    if (!resolvedUrl) {
      return <PreviewEmptyState />;
    }

    if (hasPreviewError) {
      return (
        <PreviewEmptyState
          title="Unable to load preview"
          message="The file could not be loaded in the browser."
        />
      );
    }

    switch (previewType) {
      case "image":
        return renderImagePreview();

      case "pdf":
        return renderPdfPreview();

      case "video":
        return renderVideoPreview();

      case "audio":
        return renderAudioPreview();

      case "text":
        return renderTextPreview();

      case "office":
        return renderOfficePreview();

      case "archive":
        return renderUnsupportedPreview(
          "Archive files cannot be previewed directly.",
        );

      default:
        return renderUnsupportedPreview(
          "This file type may not support browser preview.",
        );
    }
  };

  const renderDetailsPanel = () => {
    if (!showDetailsPanel) return null;

    return (
      <aside className="fixed right-0 top-[72px] z-40 h-[calc(100dvh-72px)] w-[min(380px,100vw)] border-l border-default-200 bg-background shadow-2xl lg:static lg:h-full lg:shadow-none">
        <div className="flex h-full flex-col">
          <div className="flex h-16 shrink-0 items-center justify-between border-b border-default-200 px-4">
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-default-900">
                File details
              </p>
              <p className="text-xs text-default-400">
                Basic information about this preview
              </p>
            </div>

            <Button
              isIconOnly
              size="sm"
              variant="light"
              className="rounded-xl"
              onPress={() => setShowDetailsPanel(false)}
            >
              <X size={17} />
            </Button>
          </div>

          <div className="flex-1 space-y-3 overflow-y-auto p-4">
            <DetailRow label="Name" value={resolvedFileName} />
            <DetailRow label="Type" value={typeLabel} />
            <DetailRow
              label="Extension"
              value={extension ? `.${extension}` : ""}
            />
            <DetailRow label="Size" value={formattedSize} />
            <DetailRow label="Content Type" value={resolvedContentType} />
            <DetailRow label="Description" value={resolvedDescription} />

            {resolvedUrl && (
              <div className="rounded-xl border border-default-200 bg-default-50 p-3">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-default-400">
                  File URL
                </p>

                <p className="mt-1 max-h-32 overflow-y-auto break-all text-xs text-default-600">
                  {resolvedUrl}
                </p>

                {allowCopyLink && (
                  <Button
                    size="sm"
                    variant="flat"
                    className="mt-3 rounded-xl"
                    startContent={
                      linkCopied ? <Check size={15} /> : <Clipboard size={15} />
                    }
                    onPress={handleCopyLink}
                  >
                    {linkCopied ? "Copied" : "Copy link"}
                  </Button>
                )}
              </div>
            )}

            {previewType === "office" && (
              <div className="rounded-xl border border-warning-200 bg-warning-50 p-3 text-xs leading-5 text-warning-700">
                Office preview uses Microsoft Office viewer. The file URL must
                be accessible for the viewer to load it.
              </div>
            )}
          </div>
        </div>
      </aside>
    );
  };

  return (
    <Modal
      size={modalSize}
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      placement="center"
      scrollBehavior="inside"
      hideCloseButton
      isDismissable={isDismissable}
      isKeyboardDismissDisabled={isKeyboardDismissDisabled}
      classNames={{
        wrapper: "p-0 overflow-hidden",
        base: "m-0 h-[100dvh] max-h-[100dvh] w-screen max-w-none overflow-hidden rounded-none bg-background shadow-none",
        header:
          "h-[72px] min-h-[72px] border-b border-default-200 bg-background/95 px-4 py-0 backdrop-blur-md",
        body: "h-[calc(100dvh-72px)] overflow-hidden p-0",
        backdrop: "bg-black/70",
      }}
    >
      <ModalContent>
        {(modalClose) => (
          <>
            <ModalHeader>
              <div className="flex h-full w-full min-w-0 items-center justify-between gap-3">
                <div className="flex min-w-0 items-center gap-3 overflow-hidden">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-default-200 bg-default-50 text-default-700">
                    {getTypeIcon(previewType, 21)}
                  </div>

                  <div className="min-w-0 overflow-hidden">
                    <div className="flex min-w-0 items-center gap-2">
                      <p className="truncate text-sm font-semibold text-default-900 sm:text-base">
                        {title}
                      </p>

                      <Chip
                        size="sm"
                        variant="flat"
                        color="primary"
                        className="hidden shrink-0 sm:flex"
                      >
                        {typeLabel}
                      </Chip>
                    </div>

                    <p className="mt-0.5 max-w-[48vw] truncate text-xs font-normal text-default-500 sm:text-sm">
                      {resolvedFileName}
                    </p>
                  </div>
                </div>

                {showImageTools && (
                  <div className="hidden shrink-0 xl:block">
                    {renderImageToolbar()}
                  </div>
                )}

                <div className="flex shrink-0 items-center gap-1">
                  {allowCopyLink && (
                    <ToolbarButton
                      tooltip={linkCopied ? "Copied" : "Copy link"}
                      isDisabled={!resolvedUrl}
                      onPress={handleCopyLink}
                    >
                      {linkCopied ? (
                        <Check size={16} />
                      ) : (
                        <Clipboard size={16} />
                      )}
                    </ToolbarButton>
                  )}

                  {allowOpenNewTab && (
                    <ToolbarButton
                      tooltip="Open in new tab"
                      isDisabled={!resolvedUrl}
                      onPress={handleOpenNewTab}
                    >
                      <ExternalLink size={16} />
                    </ToolbarButton>
                  )}

                  <ToolbarButton
                    tooltip="File details"
                    onPress={() => setShowDetailsPanel((prev) => !prev)}
                  >
                    <Info size={16} />
                  </ToolbarButton>

                  <Button
                    isIconOnly
                    size="sm"
                    color="danger"
                    variant="flat"
                    className="h-9 w-9 min-w-9 rounded-xl"
                    onPress={modalClose}
                  >
                    <X size={17} />
                  </Button>
                </div>
              </div>
            </ModalHeader>

            <ModalBody>
              <div className="flex h-full w-full overflow-hidden bg-default-50">
                <main className="min-w-0 flex-1 overflow-hidden">
                  {renderPreviewBody()}
                </main>

                {renderDetailsPanel()}
              </div>
            </ModalBody>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};

export default PreviewComponent;
