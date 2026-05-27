import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import {
  addToast,
  Button,
  Card,
  CardBody,
  CardHeader,
  Chip,
  Divider,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Select,
  SelectItem,
  Textarea,
} from "@heroui/react";
import {
  CheckCircle2,
  FileText,
  FolderTree,
  Layers3,
  Plus,
  RefreshCcw,
  Save,
  Settings2,
  UploadCloud,
} from "lucide-react";

import {
  addBrochureToExistingSolution,
  getAllMenus,
} from "../../toolkit/slices/settingSlice.js";

import NewTextEditor from "../../components/NewTextEditor";
import FileUploader from "../../components/FileUploader";

const initialForm = {
  menuId: "",
  categoryId: "",
  subCategoryId: "",
  serviceDetailsBody: "<p></p>",
  brochurePath: "",
  brochureMeta: null,
  brochureDescription: "",
};

const getSelectedKey = (keys) => {
  if (!keys || keys === "all") return "";

  const selected = Array.from(keys)[0];

  return selected ? String(selected) : "";
};

const getMenuList = (menuList) => {
  if (Array.isArray(menuList)) return menuList;
  if (Array.isArray(menuList?.content)) return menuList.content;
  if (Array.isArray(menuList?.data)) return menuList.data;
  if (Array.isArray(menuList?.response)) return menuList.response;
  if (Array.isArray(menuList?.result)) return menuList.result;

  return [];
};

const getName = (item) => {
  return (
    item?.name ||
    item?.title ||
    item?.menuName ||
    item?.categoryName ||
    item?.subCategoryName ||
    item?.label ||
    "---"
  );
};

const getCategories = (menu) => {
  if (Array.isArray(menu?.categories)) return menu.categories;
  if (Array.isArray(menu?.categoryList)) return menu.categoryList;
  if (Array.isArray(menu?.allCategories)) return menu.allCategories;
  if (Array.isArray(menu?.children)) return menu.children;

  return [];
};

const getSubCategories = (category) => {
  if (Array.isArray(category?.subCategories)) return category.subCategories;
  if (Array.isArray(category?.subCategoryList)) return category.subCategoryList;
  if (Array.isArray(category?.subcategories)) return category.subcategories;
  if (Array.isArray(category?.children)) return category.children;

  return [];
};

const getFileNameFromUrl = (url = "") => {
  if (!url || typeof url !== "string") return "Uploaded brochure";

  try {
    const cleanUrl = url.split("?")[0].split("#")[0];
    const fileName = cleanUrl.split("/").pop();

    return decodeURIComponent(fileName || "Uploaded brochure");
  } catch {
    return "Uploaded brochure";
  }
};

const getErrorMessage = (error) => {
  if (!error) return "Something went wrong. Please try again.";

  if (typeof error === "string") return error;

  return (
    error?.response?.data?.message ||
    error?.data?.message ||
    error?.message ||
    "Something went wrong. Please try again."
  );
};

const getBrochurePayload = (formData) => {
  const finalPath = formData.brochureMeta?.filePath || formData.brochurePath;

  return {
    filePath: finalPath || "",
    fileName:
      formData.brochureMeta?.fileName ||
      (finalPath ? getFileNameFromUrl(finalPath) : ""),
    contentType:
      formData.brochureMeta?.contentType || "application/octet-stream",
    fileSize: Number(formData.brochureMeta?.fileSize || 0),
    description: formData.brochureDescription?.trim() || "",
  };
};

const InfoTile = ({ icon, label, value }) => {
  return (
    <div className="rounded-2xl border border-default-200 bg-default-50 p-4">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-background text-primary shadow-sm">
          {icon}
        </div>

        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wide text-default-400">
            {label}
          </p>
          <p className="mt-1 truncate text-sm font-bold text-default-900">
            {value || "Not selected"}
          </p>
        </div>
      </div>
    </div>
  );
};

const ProductServiceDetails = () => {
  const dispatch = useDispatch();
  const { solutionId } = useParams();

  const menuList = useSelector((state) => state.setting.menuList);
  const menus = useMemo(() => getMenuList(menuList), [menuList]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploaderKey, setUploaderKey] = useState(1);
  const [formData, setFormData] = useState(initialForm);
  const [fieldErrors, setFieldErrors] = useState({});
  const [savedDetails, setSavedDetails] = useState(null);

  useEffect(() => {
    dispatch(getAllMenus());
  }, [dispatch]);

  const selectedMenu = useMemo(() => {
    return menus.find((menu) => String(menu?.id) === String(formData.menuId));
  }, [menus, formData.menuId]);

  const categories = useMemo(() => {
    return getCategories(selectedMenu);
  }, [selectedMenu]);

  const selectedCategory = useMemo(() => {
    return categories.find(
      (category) => String(category?.id) === String(formData.categoryId),
    );
  }, [categories, formData.categoryId]);

  const subCategories = useMemo(() => {
    return getSubCategories(selectedCategory);
  }, [selectedCategory]);

  const selectedSubCategory = useMemo(() => {
    return subCategories.find(
      (subCategory) =>
        String(subCategory?.id) === String(formData.subCategoryId),
    );
  }, [subCategories, formData.subCategoryId]);

  const payloadPreview = useMemo(() => {
    return {
      menuId: formData.menuId || null,
      menuName: selectedMenu ? getName(selectedMenu) : "",
      categoryId: formData.categoryId || null,
      categoryName: selectedCategory ? getName(selectedCategory) : "",
      subCategoryId: formData.subCategoryId || null,
      subCategoryName: selectedSubCategory ? getName(selectedSubCategory) : "",
      serviceDetailsBody: formData.serviceDetailsBody || "<p></p>",
      brochure: getBrochurePayload(formData),
    };
  }, [formData, selectedMenu, selectedCategory, selectedSubCategory]);

  const resetForm = () => {
    setFormData(initialForm);
    setFieldErrors({});
    setUploaderKey((prev) => prev + 1);
  };

  const validateForm = () => {
    const errors = {};

    if (!solutionId) {
      errors.solutionId = "Solution ID is missing from URL.";
    }

    if (!formData.menuId) {
      errors.menuId = "Please select menu.";
    }

    if (!formData.categoryId) {
      errors.categoryId = "Please select category.";
    }

    if (!formData.subCategoryId) {
      errors.subCategoryId = "Please select subcategory.";
    }

    setFieldErrors(errors);

    return Object.keys(errors).length === 0;
  };

  const handleMenuChange = (keys) => {
    const selected = getSelectedKey(keys);

    setFormData((prev) => ({
      ...prev,
      menuId: selected,
      categoryId: "",
      subCategoryId: "",
      brochurePath: "",
      brochureMeta: null,
      brochureDescription: "",
    }));

    setUploaderKey((prev) => prev + 1);

    setFieldErrors((prev) => ({
      ...prev,
      menuId: "",
      categoryId: "",
      subCategoryId: "",
      brochure: "",
    }));
  };

  const handleCategoryChange = (keys) => {
    const selected = getSelectedKey(keys);

    setFormData((prev) => ({
      ...prev,
      categoryId: selected,
      subCategoryId: "",
      brochurePath: "",
      brochureMeta: null,
      brochureDescription: "",
    }));

    setUploaderKey((prev) => prev + 1);

    setFieldErrors((prev) => ({
      ...prev,
      categoryId: "",
      subCategoryId: "",
      brochure: "",
    }));
  };

  const handleSubCategoryChange = (keys) => {
    const selected = getSelectedKey(keys);

    setFormData((prev) => ({
      ...prev,
      subCategoryId: selected,
      brochurePath: "",
      brochureMeta: null,
      brochureDescription: "",
    }));

    setUploaderKey((prev) => prev + 1);

    setFieldErrors((prev) => ({
      ...prev,
      subCategoryId: "",
      brochure: "",
    }));
  };

  const handleEditorChange = (value) => {
    setFormData((prev) => ({
      ...prev,
      serviceDetailsBody: value,
    }));
  };

  const handleUploadSuccess = (uploadedFile) => {
    setFormData((prev) => ({
      ...prev,
      brochureMeta: uploadedFile,
    }));

    setFieldErrors((prev) => ({
      ...prev,
      brochure: "",
    }));
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    const payload = {
      serviceDetailsBody: formData.serviceDetailsBody || "<p></p>",
      brochure: getBrochurePayload(formData),
    };

    try {
      setIsSubmitting(true);
      console.log("SubID:", formData.subCategoryId);
      console.log("SolID:", solutionId);
      console.log("Payload:", payload);
      await dispatch(
        addBrochureToExistingSolution({
          solutionId,
          subCategoryId: formData.subCategoryId,
          payload,
        }),
      ).unwrap();

      const finalSavedData = {
        menuId: formData.menuId,
        menuName: getName(selectedMenu),
        categoryId: formData.categoryId,
        categoryName: getName(selectedCategory),
        subCategoryId: formData.subCategoryId,
        subCategoryName: getName(selectedSubCategory),
        ...payload,
      };

      setSavedDetails(finalSavedData);
      setIsModalOpen(false);
      setFieldErrors({});

      addToast({
        title: "Service details saved",
        description: "Service details have been submitted successfully.",
        color: "success",
      });

      dispatch(getAllMenus());
    } catch (error) {
      addToast({
        title: "Something went wrong!",
        description: getErrorMessage(error),
        color: "danger",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const isSaveDisabled =
    isUploading || isSubmitting || !formData.subCategoryId || !solutionId;

  return (
    <div className="flex h-full min-h-0 overflow-hidden bg-default-50 px-4 py-4 sm:px-6 lg:px-8">
      <div className="mx-auto flex h-full min-h-0 w-full max-w-7xl flex-col gap-4 overflow-hidden">
        <div className="flex shrink-0 flex-col justify-between gap-4 rounded-3xl border border-default-200 bg-background p-5 shadow-sm sm:flex-row sm:items-center">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl font-bold text-default-900 sm:text-2xl">
                Service Details
              </h1>

              <Chip color="primary" variant="flat" size="sm">
                Menu Mapping
              </Chip>
            </div>

            <p className="mt-1 max-w-2xl text-sm leading-6 text-default-500">
              Select Menu, Category and Subcategory, then add optional service
              details and brochure.
            </p>

            {!solutionId && (
              <p className="mt-2 text-xs font-medium text-danger">
                Solution ID is missing from URL.
              </p>
            )}
          </div>

          <Button
            color="primary"
            startContent={<Plus size={17} />}
            onPress={() => setIsModalOpen(true)}
            className="font-semibold"
          >
            Add Service Details
          </Button>
        </div>

        {/* {savedDetails ? (
          <Card className="flex max-h-full flex-1 overflow-clip border border-default-200 bg-background shadow-sm">
            <CardHeader className="flex shrink-0 flex-col items-start justify-between gap-4 px-5 pb-3 pt-5 sm:flex-row sm:items-center">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-success-50 text-success">
                  <CheckCircle2 size={22} />
                </div>

                <div>
                  <h2 className="text-base font-bold text-default-900">
                    Saved Service Details
                  </h2>
                  <p className="text-xs text-default-500">
                    Current selected mapping, editor body and brochure data.
                  </p>
                </div>
              </div>

              <Button
                size="sm"
                variant="flat"
                color="primary"
                startContent={<Settings2 size={15} />}
                onPress={() => setIsModalOpen(true)}
              >
                Update Details
              </Button>
            </CardHeader>

            <Divider />

            <CardBody className="flex min-h-0 flex-1 flex-col gap-5 overflow-auto p-5">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <InfoTile
                  icon={<FolderTree size={18} />}
                  label="Menu"
                  value={savedDetails.menuName}
                />

                <InfoTile
                  icon={<Layers3 size={18} />}
                  label="Category"
                  value={savedDetails.categoryName}
                />

                <InfoTile
                  icon={<FileText size={18} />}
                  label="Subcategory"
                  value={savedDetails.subCategoryName}
                />
              </div>

              <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
                <div className="rounded-2xl border border-default-200 bg-default-50 p-4">
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-bold text-default-900">
                        Service Detail Content
                      </p>
                      <p className="text-xs text-default-500">
                        Optional rich text content.
                      </p>
                    </div>
                  </div>

                  <div
                    className="rounded-xl border border-default-200 bg-background p-4 text-sm leading-6 text-default-700"
                    dangerouslySetInnerHTML={{
                      __html: savedDetails.serviceDetailsBody || "<p></p>",
                    }}
                  />
                </div>

                <div className="rounded-2xl border border-default-200 bg-default-50 p-4">
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-bold text-default-900">
                        Brochure Details
                      </p>
                      <p className="text-xs text-default-500">
                        Uploaded file metadata.
                      </p>
                    </div>

                    <Chip size="sm" variant="flat" color="primary">
                      Brochure
                    </Chip>
                  </div>

                  <div className="space-y-3 rounded-xl border border-default-200 bg-background p-4 text-sm">
                    <p className="break-words">
                      <span className="font-semibold text-default-900">
                        File Name:
                      </span>{" "}
                      {savedDetails.brochure?.fileName || "Not uploaded"}
                    </p>

                    <p className="break-words">
                      <span className="font-semibold text-default-900">
                        Content Type:
                      </span>{" "}
                      {savedDetails.brochure?.contentType || "---"}
                    </p>

                    <p>
                      <span className="font-semibold text-default-900">
                        File Size:
                      </span>{" "}
                      {savedDetails.brochure?.fileSize || 0} bytes
                    </p>

                    <p className="break-words">
                      <span className="font-semibold text-default-900">
                        Description:
                      </span>{" "}
                      {savedDetails.brochure?.description || "---"}
                    </p>

                    {savedDetails.brochure?.filePath && (
                      <a
                        href={savedDetails.brochure.filePath}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex text-sm font-semibold text-primary underline"
                      >
                        View Brochure
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </CardBody>
          </Card>
        ) :
         ( */}
        <Card className="flex min-h-0 flex-1 overflow-hidden border border-dashed border-default-300 bg-background/80 shadow-sm">
          <CardBody className="flex min-h-0 flex-1 flex-col items-center justify-center gap-4 overflow-hidden p-6 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-primary-50 text-primary">
              <FolderTree size={30} />
            </div>

            <div>
              <h2 className="text-lg font-bold text-default-900">
                No service details added yet
              </h2>
              <p className="mt-1 max-w-md text-sm leading-6 text-default-500">
                Click below to select Menu, Category and Subcategory, then add
                optional content and brochure.
              </p>
            </div>

            <Button
              color="primary"
              startContent={<Plus size={17} />}
              onPress={() => setIsModalOpen(true)}
            >
              Add Service Details
            </Button>
          </CardBody>
        </Card>
        {/* )} */}

        <Modal
          isOpen={isModalOpen}
          onOpenChange={setIsModalOpen}
          size="full"
          scrollBehavior="inside"
          backdrop="blur"
          isDismissable={false}
          classNames={{
            wrapper: "!items-stretch !justify-stretch p-0",
            base: "m-0 h-dvh max-h-dvh w-screen max-w-none rounded-none",
            body: "min-h-0 overflow-hidden p-0",
          }}
        >
          <ModalContent className="flex h-dvh max-h-dvh flex-col overflow-hidden rounded-none">
            {(onClose) => (
              <>
                <ModalHeader className="shrink-0 border-b border-default-200 px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary-50 text-primary">
                      <FolderTree size={22} />
                    </div>

                    <div>
                      <h2 className="text-lg font-bold text-default-900">
                        Add Service Details
                      </h2>
                      <p className="text-sm font-normal text-default-500">
                        Select Menu, Category and Subcategory. Brochure and body
                        are optional.
                      </p>
                    </div>
                  </div>
                </ModalHeader>

                <ModalBody className="min-h-0 flex-1 overflow-hidden p-0">
                  <div className="h-full min-h-0 overflow-y-auto overflow-x-hidden p-6">
                    <div className="flex flex-col gap-6">
                      <div className="rounded-2xl border border-default-200 bg-default-50 p-4">
                        <div className="mb-4 flex items-center justify-between gap-3">
                          <div>
                            <p className="text-sm font-bold text-default-900">
                              Service Mapping
                            </p>
                          </div>

                          <Chip color="primary" variant="flat" size="sm">
                            Required
                          </Chip>
                        </div>

                        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                          <Select
                            isRequired
                            label="Menu"
                            labelPlacement="outside"
                            placeholder="Select menu"
                            selectedKeys={
                              formData.menuId ? [formData.menuId] : []
                            }
                            onSelectionChange={handleMenuChange}
                            errorMessage={fieldErrors.menuId}
                            isInvalid={Boolean(fieldErrors.menuId)}
                            variant="bordered"
                            classNames={{
                              trigger: "rounded-xl bg-background",
                            }}
                          >
                            {menus.map((menu) => (
                              <SelectItem key={String(menu?.id)}>
                                {getName(menu)}
                              </SelectItem>
                            ))}
                          </Select>

                          <Select
                            isRequired
                            label="Category"
                            labelPlacement="outside"
                            placeholder={
                              formData.menuId
                                ? "Select category"
                                : "Select menu first"
                            }
                            selectedKeys={
                              formData.categoryId ? [formData.categoryId] : []
                            }
                            onSelectionChange={handleCategoryChange}
                            errorMessage={fieldErrors.categoryId}
                            isInvalid={Boolean(fieldErrors.categoryId)}
                            isDisabled={
                              !formData.menuId || categories.length === 0
                            }
                            variant="bordered"
                            classNames={{
                              trigger: "rounded-xl bg-background",
                            }}
                          >
                            {categories.map((category) => (
                              <SelectItem key={String(category?.id)}>
                                {getName(category)}
                              </SelectItem>
                            ))}
                          </Select>

                          <Select
                            isRequired
                            label="Subcategory"
                            labelPlacement="outside"
                            placeholder={
                              formData.categoryId
                                ? "Select subcategory"
                                : "Select category first"
                            }
                            selectedKeys={
                              formData.subCategoryId
                                ? [formData.subCategoryId]
                                : []
                            }
                            onSelectionChange={handleSubCategoryChange}
                            errorMessage={fieldErrors.subCategoryId}
                            isInvalid={Boolean(fieldErrors.subCategoryId)}
                            isDisabled={
                              !formData.categoryId || subCategories.length === 0
                            }
                            variant="bordered"
                            classNames={{
                              trigger: "rounded-xl bg-background",
                            }}
                          >
                            {subCategories.map((subCategory) => (
                              <SelectItem key={String(subCategory?.id)}>
                                {getName(subCategory)}
                              </SelectItem>
                            ))}
                          </Select>
                        </div>
                      </div>

                      {formData.subCategoryId && (
                        <div className="rounded-2xl border border-default-200 bg-background shadow-sm">
                          <div className="flex items-center justify-between gap-3 border-b border-default-200 px-4 py-3">
                            <div>
                              <p className="text-sm font-bold text-default-900">
                                Brochure
                              </p>
                              <p className="text-xs text-default-500">
                                Optional file upload for the selected
                                subcategory.
                              </p>
                            </div>

                            <Chip color="default" variant="flat" size="sm">
                              Optional
                            </Chip>
                          </div>

                          <div className="grid grid-cols-1 gap-4 p-4 lg:grid-cols-2">
                            <div>
                              <p className="text-sm text-default-900">
                                Upload a File
                              </p>
                              <FileUploader
                                key={uploaderKey}
                                value={formData.brochurePath}
                                onChange={(value) => {
                                  setFormData((prev) => ({
                                    ...prev,
                                    brochurePath: value,
                                    brochureMeta: value
                                      ? prev.brochureMeta
                                      : null,
                                  }));

                                  setFieldErrors((prev) => ({
                                    ...prev,
                                    brochure: "",
                                  }));
                                }}
                                label="Brochure File"
                                uploadingType="single"
                                placeholder="or Drag & Drop Brochure Here, or Paste"
                                errorMessage={fieldErrors.brochure}
                                onUploadSuccess={handleUploadSuccess}
                                onUploadingChange={setIsUploading}
                              />
                            </div>

                            <Textarea
                              label="Brochure Description"
                              labelPlacement="outside"
                              placeholder="Enter brochure description"
                              value={formData.brochureDescription}
                              onValueChange={(value) => {
                                setFormData((prev) => ({
                                  ...prev,
                                  brochureDescription: value,
                                }));
                              }}
                              variant="bordered"
                              minRows={4}
                              classNames={{
                                inputWrapper: "rounded-xl bg-background",
                              }}
                            />
                          </div>
                        </div>
                      )}

                      <div className="rounded-2xl border border-default-200 bg-background shadow-sm">
                        <div className="flex items-center justify-between gap-3 border-b border-default-200 px-4 py-3">
                          <div>
                            <p className="text-sm font-bold text-default-900">
                              Mail Body
                            </p>
                          </div>
                        </div>

                        <div className="p-4">
                          <NewTextEditor
                            data={formData.serviceDetailsBody}
                            onChange={handleEditorChange}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </ModalBody>

                <ModalFooter className="shrink-0 border-t border-default-200 px-6 py-4">
                  <Button
                    variant="flat"
                    color="default"
                    startContent={<RefreshCcw size={16} />}
                    onPress={resetForm}
                    isDisabled={isUploading || isSubmitting}
                  >
                    Reset
                  </Button>

                  <Button
                    variant="flat"
                    color="danger"
                    onPress={() => {
                      setFieldErrors({});
                      setIsModalOpen(false);
                      onClose();
                    }}
                    isDisabled={isUploading || isSubmitting}
                  >
                    Cancel
                  </Button>

                  <Button
                    color="primary"
                    startContent={
                      !isUploading && !isSubmitting ? <Save size={16} /> : null
                    }
                    onPress={handleSubmit}
                    isLoading={isUploading || isSubmitting}
                    isDisabled={isSaveDisabled}
                  >
                    {isUploading
                      ? "Uploading..."
                      : isSubmitting
                        ? "Submitting..."
                        : "Submit"}
                  </Button>
                </ModalFooter>
              </>
            )}
          </ModalContent>
        </Modal>
      </div>
    </div>
  );
};

export default ProductServiceDetails;
