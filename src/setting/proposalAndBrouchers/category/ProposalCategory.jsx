import {
  Button,
  Chip,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Pagination,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
  useDisclosure,
  addToast,
} from "@heroui/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import * as z from "zod";
import { useDispatch, useSelector } from "react-redux";
import { Link, useParams } from "react-router-dom";
import { ChevronDown, FileText, Plus, Search } from "lucide-react";
import {
  createMenuCategory,
  getAllMenus,
} from "../../../toolkit/slices/settingSlice.js";
import FileUploader from "../../../components/FileUploader.jsx";
import PreviewComponent from "../../../components/PreviewComponent.jsx";

const columns = [
  { name: "CATEGORY", uid: "name", sortable: true },
  { name: "BROCHURE", uid: "brochure" },
  { name: "FILE SIZE", uid: "fileSize", sortable: true },
  { name: "UPLOADED AT", uid: "uploadedAt", sortable: true },
  { name: "STATUS", uid: "status", sortable: true },
];

const INITIAL_VISIBLE_COLUMNS = ["name", "brochure", "uploadedAt", "status"];

const formSchema = z.object({
  name: z.string().trim().min(1, "Please enter category name"),
  brochure: z.object({
    filePath: z.string().trim().min(1, "Please upload brochure file"),
    fileName: z.string().trim().min(1, "Please enter brochure file name"),
    contentType: z.string().trim().min(1, "Please enter content type"),
    fileSize: z.coerce.number().min(0, "File size cannot be negative"),
    description: z.string().optional(),
  }),
});

const defaultValues = {
  name: "",
  brochure: {
    filePath: "",
    fileName: "",
    contentType: "",
    fileSize: 0,
    description: "",
  },
};

function capitalize(s) {
  return s ? s.charAt(0).toUpperCase() + s.slice(1).toLowerCase() : "";
}

const formatDate = (value) => {
  if (!value) return "---";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "---";

  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const formatFileSize = (bytes) => {
  if (!bytes || bytes <= 0) return "0 KB";

  const units = ["B", "KB", "MB", "GB"];
  let size = bytes;
  let index = 0;

  while (size >= 1024 && index < units.length - 1) {
    size = size / 1024;
    index++;
  }

  return `${size.toFixed(size >= 10 ? 0 : 1)} ${units[index]}`;
};

const buildPayload = (values) => {
  return {
    name: values.name?.trim(),
    brochure: {
      filePath: values.brochure.filePath?.trim(),
      fileName: values.brochure.fileName?.trim(),
      contentType: values.brochure.contentType?.trim(),
      fileSize: Number(values.brochure.fileSize || 0),
      description: values.brochure.description?.trim() || "",
    },
  };
};

const CategoryFormFields = ({ control, setValue, onUploadingChange }) => {
  const handleBrochureUploadSuccess = (fileMeta) => {
    setValue("brochure.filePath", fileMeta?.filePath || "", {
      shouldValidate: true,
      shouldDirty: true,
    });

    setValue("brochure.fileName", fileMeta?.fileName || "", {
      shouldValidate: true,
      shouldDirty: true,
    });

    setValue("brochure.contentType", fileMeta?.contentType || "", {
      shouldValidate: true,
      shouldDirty: true,
    });

    setValue("brochure.fileSize", Number(fileMeta?.fileSize || 0), {
      shouldValidate: true,
      shouldDirty: true,
    });
  };

  return (
    <div className="grid max-h-[60vh] grid-cols-1 gap-4 overflow-auto p-2 md:grid-cols-2">
      <Controller
        name="name"
        control={control}
        render={({ field, fieldState: { error } }) => (
          <Input
            isRequired
            label="Category Name"
            placeholder="Enter category name"
            errorMessage={error?.message}
            isInvalid={!!error}
            value={field.value || ""}
            onChange={(e) => field.onChange(e.target.value)}
          />
        )}
      />
      <Controller
        name="brochure.filePath"
        control={control}
        className=""
        render={({ field, fieldState: { error } }) => (
          <FileUploader
            isRequired
            label="Brochure File Path"
            placeholder="Upload brochure file"
            errorMessage={error?.message}
            isInvalid={!!error}
            value={field.value || ""}
            onChange={(value) => field.onChange(value || "")}
            onUploadSuccess={handleBrochureUploadSuccess}
            onUploadingChange={onUploadingChange}
          />
        )}
      />
      <div className="col-span-2">
        <Controller
          name="brochure.description"
          control={control}
          render={({ field, fieldState: { error } }) => (
            <Input
              label="Description"
              placeholder="Enter brochure description"
              errorMessage={error?.message}
              isInvalid={!!error}
              value={field.value || ""}
              onChange={(e) => field.onChange(e.target.value)}
            />
          )}
        />
      </div>
    </div>
  );
};

const ProposalCategory = () => {
  const dispatch = useDispatch();
  const { menuId } = useParams();

  const {
    isOpen: isAddOpen,
    onOpen: onAddOpen,
    onClose: onAddClose,
    onOpenChange: onAddOpenChange,
  } = useDisclosure();

  const {
    control: addControl,
    handleSubmit: handleAddSubmit,
    reset: resetAddForm,
    setValue: setAddValue,
  } = useForm({
    resolver: zodResolver(formSchema),
    defaultValues,
  });

  const {
    isOpen: isPreviewOpen,
    onOpen: onPreviewOpen,
    onOpenChange: onPreviewOpenChange,
  } = useDisclosure();

  const [previewFile, setPreviewFile] = useState(null);
  const [isAddUploading, setIsAddUploading] = useState(false);

  const openPreview = (file) => {
    if (!file?.filePath && !file?.url && !file?.fileUrl) {
      addToast({
        title: "No file found",
        description: "This record does not have a valid file URL.",
        color: "warning",
      });
      return;
    }

    setPreviewFile(file);
    onPreviewOpen();
  };

  const data = useSelector((state) => {
    const menuList = state.setting.menuList;

    if (Array.isArray(menuList)) return menuList;
    if (Array.isArray(menuList?.content)) return menuList.content;
    if (Array.isArray(menuList?.data)) return menuList.data;

    return [];
  });

  const selectedMenu = useMemo(() => {
    return data.find((menu) => String(menu.id) === String(menuId));
  }, [data, menuId]);

  const tableData = useMemo(() => {
    return (selectedMenu?.categories || []).map((category, index) => ({
      rowId: `category-${category?.id}-${index}`,
      id: category?.id,
      name: category?.name || "---",
      brochure: category?.brochure,
      originalData: category,
    }));
  }, [selectedMenu]);

  const [filterValue, setFilterValue] = useState("");
  const [visibleColumns, setVisibleColumns] = useState(
    new Set(INITIAL_VISIBLE_COLUMNS),
  );
  const [selectedKeys, setSelectedKeys] = useState(new Set([]));
  const [sortDescriptor, setSortDescriptor] = useState({
    column: "name",
    direction: "ascending",
  });
  const [filteration, setFilteration] = useState({
    page: 1,
    size: 50,
  });

  useEffect(() => {
    dispatch(getAllMenus());
  }, [dispatch]);

  const openAddCategoryModal = useCallback(() => {
    resetAddForm(defaultValues);
    setIsAddUploading(false);
    onAddOpen();
  }, [onAddOpen, resetAddForm]);

  const onAddSubmit = async (values) => {
    if (isAddUploading) {
      addToast({
        title: "Upload in progress",
        description: "Please wait until the brochure upload is completed.",
        color: "warning",
      });
      return;
    }

    const payload = buildPayload(values);

    try {
      await dispatch(
        createMenuCategory({
          menuId,
          payload,
        }),
      ).unwrap();

      addToast({
        title: "Category added successfully",
        color: "success",
      });

      onAddClose();
      resetAddForm(defaultValues);
      setIsAddUploading(false);
      dispatch(getAllMenus());
    } catch (error) {
      addToast({
        title: "Something went wrong!",
        description:
          typeof error === "string" ? error : "Unable to add category.",
        color: "danger",
      });
    }
  };

  const headerColumns = useMemo(() => {
    if (visibleColumns === "all") return columns;

    return columns.filter((column) =>
      Array.from(visibleColumns).includes(column.uid),
    );
  }, [visibleColumns]);

  const filteredItems = useMemo(() => {
    let filteredData = [...tableData];

    if (filterValue) {
      const search = filterValue.toLowerCase();

      filteredData = filteredData.filter((item) => {
        return (
          item?.name?.toLowerCase().includes(search) ||
          item?.brochure?.fileName?.toLowerCase().includes(search) ||
          item?.brochure?.description?.toLowerCase().includes(search) ||
          item?.brochure?.contentType?.toLowerCase().includes(search)
        );
      });
    }

    return filteredData;
  }, [tableData, filterValue]);

  const pages = Math.ceil(filteredItems.length / filteration.size) || 1;

  const items = useMemo(() => {
    const start = (filteration.page - 1) * filteration.size;
    const end = start + filteration.size;

    return filteredItems.slice(start, end);
  }, [filteredItems, filteration]);

  const sortedItems = useMemo(() => {
    return [...items].sort((a, b) => {
      let first;
      let second;

      switch (sortDescriptor.column) {
        case "fileSize":
          first = a?.brochure?.fileSize || 0;
          second = b?.brochure?.fileSize || 0;
          break;

        case "uploadedAt":
          first = new Date(a?.brochure?.uploadedAt || 0).getTime();
          second = new Date(b?.brochure?.uploadedAt || 0).getTime();
          break;

        case "status":
          first = a?.brochure?.isActive ? 1 : 0;
          second = b?.brochure?.isActive ? 1 : 0;
          break;

        default:
          first = a?.[sortDescriptor.column] || "";
          second = b?.[sortDescriptor.column] || "";
      }

      const cmp = first < second ? -1 : first > second ? 1 : 0;

      return sortDescriptor.direction === "descending" ? -cmp : cmp;
    });
  }, [items, sortDescriptor]);

  const renderCell = useCallback(
    (rowData, columnKey) => {
      const brochure = rowData?.brochure;

      switch (columnKey) {
        case "name":
          return (
            <Link to={`${rowData.id}/subcategory`} className="flex flex-col">
              <span className="font-medium text-primary hover:underline">
                {rowData?.name || "---"}
              </span>

              <span className="text-xs text-default-400">
                ID: {rowData?.id ?? "---"}
              </span>
            </Link>
          );

        case "brochure":
          return brochure ? (
            <button
              type="button"
              onClick={() => openPreview(brochure)}
              className="flex max-w-[320px] items-start gap-2 text-left"
            >
              <div className="rounded-lg bg-primary-50 p-1.5 text-primary">
                <FileText size={16} />
              </div>

              <div className="flex min-w-0 flex-col">
                <span className="max-w-[260px] truncate text-sm font-medium text-default-900 hover:text-primary hover:underline">
                  {brochure?.fileName || "---"}
                </span>

                <span className="max-w-[260px] truncate text-xs text-default-400">
                  {brochure?.description || brochure?.contentType || "---"}
                </span>
              </div>
            </button>
          ) : (
            <span className="text-sm text-default-400">No brochure</span>
          );

        case "fileSize":
          return (
            <span className="text-sm text-default-500">
              {formatFileSize(brochure?.fileSize)}
            </span>
          );

        case "uploadedAt":
          return (
            <span className="text-sm text-default-500">
              {formatDate(brochure?.uploadedAt)}
            </span>
          );

        case "status":
          if (!brochure) {
            return (
              <Chip size="sm" variant="flat" color="default">
                No Brochure
              </Chip>
            );
          }

          return (
            <Chip
              size="sm"
              variant="flat"
              color={brochure?.isActive ? "success" : "danger"}
            >
              {brochure?.isActive ? "Active" : "Inactive"}
            </Chip>
          );

        default:
          return rowData[columnKey] || "-";
      }
    },
    [openPreview],
  );

  const topContent = useMemo(() => {
    return (
      <div className="flex flex-col gap-4">
        <div className="flex items-end justify-between gap-3">
          <Input
            isClearable
            className="w-full sm:max-w-[35%]"
            placeholder="Search category, brochure..."
            startContent={<Search size={18} />}
            value={filterValue}
            onClear={() => {
              setFilterValue("");
              setFilteration((prev) => ({ ...prev, page: 1 }));
            }}
            onValueChange={(value) => {
              setFilterValue(value || "");
              setFilteration((prev) => ({ ...prev, page: 1 }));
            }}
          />

          <div className="flex gap-3">
            <Dropdown>
              <DropdownTrigger className="hidden sm:flex">
                <Button endContent={<ChevronDown size={18} />} variant="flat">
                  Columns
                </Button>
              </DropdownTrigger>

              <DropdownMenu
                disallowEmptySelection
                aria-label="Table Columns"
                closeOnSelect={false}
                selectedKeys={visibleColumns}
                selectionMode="multiple"
                onSelectionChange={setVisibleColumns}
              >
                {columns.map((column) => (
                  <DropdownItem key={column.uid} className="capitalize">
                    {capitalize(column.name)}
                  </DropdownItem>
                ))}
              </DropdownMenu>
            </Dropdown>

            <Button
              color="primary"
              onPress={openAddCategoryModal}
              endContent={<Plus size={18} />}
            >
              Add Category
            </Button>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-small text-default-400">
            Total {filteredItems.length} categories
          </span>

          <label className="flex items-center text-small text-default-400">
            Rows per page:
            <select
              className="bg-transparent text-small text-default-400 outline-none"
              value={filteration.size}
              onChange={(e) => {
                setFilteration({
                  page: 1,
                  size: Number(e.target.value),
                });
              }}
            >
              <option value="5">5</option>
              <option value="15">15</option>
              <option value="25">25</option>
              <option value="50">50</option>
            </select>
          </label>
        </div>
      </div>
    );
  }, [
    filterValue,
    visibleColumns,
    filteredItems.length,
    filteration.size,
    openAddCategoryModal,
  ]);

  const bottomContent = useMemo(() => {
    return (
      <div className="flex items-center justify-between px-2 py-2">
        <span className="w-[30%] text-small text-default-400">
          {selectedKeys === "all"
            ? "All items selected"
            : `${selectedKeys.size} of ${filteredItems.length} selected`}
        </span>

        <Pagination
          isCompact
          showControls
          showShadow
          color="primary"
          page={filteration.page}
          total={pages}
          onChange={(page) => {
            setFilteration((prev) => ({ ...prev, page }));
          }}
        />

        <div className="hidden w-[30%] justify-end gap-2 sm:flex">
          <Button
            isDisabled={filteration.page <= 1}
            size="sm"
            variant="flat"
            onPress={() => {
              if (filteration.page > 1) {
                setFilteration((prev) => ({
                  ...prev,
                  page: prev.page - 1,
                }));
              }
            }}
          >
            Previous
          </Button>

          <Button
            isDisabled={filteration.page >= pages}
            size="sm"
            variant="flat"
            onPress={() => {
              if (filteration.page < pages) {
                setFilteration((prev) => ({
                  ...prev,
                  page: prev.page + 1,
                }));
              }
            }}
          >
            Next
          </Button>
        </div>
      </div>
    );
  }, [selectedKeys, filteredItems.length, filteration.page, pages]);

  return (
    <>
      <h1 className="font-sans text-lg font-semibold mb-2 shrink-0">
        Proposal Menu Categories
      </h1>

      <Table
        isHeaderSticky
        aria-label="Proposal category table"
        bottomContent={bottomContent}
        bottomContentPlacement="outside"
        classNames={{
          wrapper: "2xl:max-h-[65vh] md:max-h-[60vh] w-full",
        }}
        selectedKeys={selectedKeys}
        selectionMode="multiple"
        sortDescriptor={sortDescriptor}
        topContent={topContent}
        topContentPlacement="outside"
        onSelectionChange={setSelectedKeys}
        onSortChange={setSortDescriptor}
      >
        <TableHeader columns={headerColumns}>
          {(column) => (
            <TableColumn
              key={column.uid}
              align="start"
              allowsSorting={column.sortable}
            >
              {column.name}
            </TableColumn>
          )}
        </TableHeader>

        <TableBody emptyContent="No category found" items={sortedItems}>
          {(item) => (
            <TableRow key={item.rowId}>
              {(columnKey) => (
                <TableCell>{renderCell(item, columnKey)}</TableCell>
              )}
            </TableRow>
          )}
        </TableBody>
      </Table>

      <Modal
        size="3xl"
        isDismissable={false}
        isKeyboardDismissDisabled={true}
        isOpen={isAddOpen}
        onOpenChange={onAddOpenChange}
        placement="top-center"
      >
        <ModalContent>
          {(modalClose) => (
            <>
              <ModalHeader>Add Category</ModalHeader>

              <ModalBody>
                <form
                  onSubmit={handleAddSubmit(onAddSubmit)}
                  className="flex flex-col gap-4"
                >
                  <CategoryFormFields
                    control={addControl}
                    setValue={setAddValue}
                    onUploadingChange={setIsAddUploading}
                  />

                  <ModalFooter className="flex justify-end">
                    <Button
                      type="button"
                      variant="flat"
                      onPress={() => {
                        resetAddForm(defaultValues);
                        setIsAddUploading(false);
                        modalClose();
                      }}
                    >
                      Cancel
                    </Button>

                    <Button
                      color="primary"
                      type="submit"
                      isLoading={isAddUploading}
                      isDisabled={isAddUploading}
                    >
                      {isAddUploading ? "Uploading..." : "Submit"}
                    </Button>
                  </ModalFooter>
                </form>
              </ModalBody>
            </>
          )}
        </ModalContent>
      </Modal>

      <PreviewComponent
        isOpen={isPreviewOpen}
        onOpenChange={(open) => {
          if (!open) {
            setPreviewFile(null);
          }

          onPreviewOpenChange(open);
        }}
        file={previewFile}
        title="View Brochure"
        modalSize="5xl"
        previewHeight="78vh"
      />
    </>
  );
};

export default ProposalCategory;
