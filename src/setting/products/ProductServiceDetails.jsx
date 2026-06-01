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
  UploadCloud,
} from "lucide-react";

import {
  addBrochureToExistingSolution,
  getAllMenus,
  getServiceBrouchersServiceDetailBySolutionId,
} from "../../toolkit/slices/settingSlice.js";

import NewTextEditor from "../../components/NewTextEditor";
import FileUploader from "../../components/FileUploader";

const initialForm = {
  menuId: "",
  categoryId: "",
  subCategoryId: "",
  emailBody: "<p></p>",
  emailSubject: "",
  scopeOfWork: "<p></p>",
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

const getName = (item) =>
  item?.name ||
  item?.title ||
  item?.menuName ||
  item?.categoryName ||
  item?.subCategoryName ||
  item?.label ||
  "---";

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
    return decodeURIComponent(cleanUrl.split("/").pop() || "Uploaded brochure");
  } catch {
    return "Uploaded brochure";
  }
};

const getErrorMessage = (error) =>
  typeof error === "string"
    ? error
    : error?.response?.data?.message ||
      error?.data?.message ||
      error?.message ||
      "Something went wrong. Please try again.";

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

const InfoTile = ({ icon, label, value }) => (
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

const ProductServiceDetails = () => {
  const dispatch = useDispatch();
  const { solutionId } = useParams();

  const menuList = useSelector((state) => state.setting.menuList);
  const serviceBrouchersDetail = useSelector(
    (state) => state.setting.serviceBrouchersDetail,
  );

  const menus = useMemo(() => getMenuList(menuList), [menuList]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploaderKey, setUploaderKey] = useState(1);
  const [formData, setFormData] = useState(initialForm);
  const [fieldErrors, setFieldErrors] = useState({});

  useEffect(() => {
    dispatch(getAllMenus());

    if (solutionId) {
      dispatch(getServiceBrouchersServiceDetailBySolutionId(solutionId));
    }
  }, [dispatch, solutionId]);

  useEffect(() => {
    if (!serviceBrouchersDetail) return;

    const brochure = serviceBrouchersDetail?.solution?.brochure;
    const emailTemplate = serviceBrouchersDetail?.solution?.emailTemplate;

    setFormData({
      menuId: serviceBrouchersDetail?.menu?.id
        ? String(serviceBrouchersDetail.menu.id)
        : "",
      categoryId: serviceBrouchersDetail?.menuCategory?.id
        ? String(serviceBrouchersDetail.menuCategory.id)
        : "",
      subCategoryId: serviceBrouchersDetail?.subCategory?.id
        ? String(serviceBrouchersDetail.subCategory.id)
        : "",
      emailBody: emailTemplate?.emailBody || "<p></p>",
      emailSubject: emailTemplate?.emailSubject || "",
      scopeOfWork: emailTemplate?.scopeOfWork || "<p></p>",
      brochurePath: brochure?.filePath || "",
      brochureMeta: brochure || null,
      brochureDescription: brochure?.description || "",
    });

    setUploaderKey((prev) => prev + 1);
  }, [serviceBrouchersDetail]);

  const selectedMenu = useMemo(
    () => menus.find((menu) => String(menu?.id) === String(formData.menuId)),
    [menus, formData.menuId],
  );

  const categories = useMemo(() => getCategories(selectedMenu), [selectedMenu]);

  const selectedCategory = useMemo(
    () =>
      categories.find(
        (category) => String(category?.id) === String(formData.categoryId),
      ),
    [categories, formData.categoryId],
  );

  const subCategories = useMemo(
    () => getSubCategories(selectedCategory),
    [selectedCategory],
  );

  const selectedSubCategory = useMemo(
    () =>
      subCategories.find(
        (subCategory) =>
          String(subCategory?.id) === String(formData.subCategoryId),
      ),
    [subCategories, formData.subCategoryId],
  );

  const resetForm = () => {
    setFormData(initialForm);
    setFieldErrors({});
    setUploaderKey((prev) => prev + 1);
  };

  const validateForm = () => {
    const errors = {};

    if (!solutionId) errors.solutionId = "Solution ID is missing from URL.";
    if (!formData.menuId) errors.menuId = "Please select menu.";
    if (!formData.categoryId) errors.categoryId = "Please select category.";
    if (!formData.subCategoryId)
      errors.subCategoryId = "Please select subcategory.";

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

  const handleSubmit = async () => {
    if (!validateForm()) return;

    const payload = {
      brochure: getBrochurePayload(formData),
      emailTemplateRequestDto: {
        emailBody: formData.emailBody || "<p></p>",
        emailSubject: formData.emailSubject || "",
        scopeOfWork: formData.scopeOfWork || "<p></p>",
      },
    };

    try {
      setIsSubmitting(true);

      await dispatch(
        addBrochureToExistingSolution({
          solutionId,
          subCategoryId: formData.subCategoryId,
          payload,
        }),
      ).unwrap();

      addToast({
        title: "Service details saved",
        description: "Service details have been submitted successfully.",
        color: "success",
      });

      setIsModalOpen(false);
      setFieldErrors({});

      dispatch(getServiceBrouchersServiceDetailBySolutionId(solutionId));
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
    <div className="flex h-[calc(100dvh-80px)] min-h-0 overflow-hidden bg-default-50 px-4 py-4 sm:px-6 lg:px-8">
      <div className="mx-auto flex h-full min-h-0 w-full max-w-7xl flex-col gap-4 overflow-hidden">
        <div className="shrink-0 rounded-3xl border border-default-200 bg-background p-5 shadow-sm">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
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
              Add / Update Service Details
            </Button>
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden pr-1">
          <div className="flex flex-col gap-4 pb-4">
            <Card className="border border-default-200 bg-background shadow-sm">
              <CardHeader className="flex flex-col items-start gap-1 px-5 py-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary-50 text-primary">
                    <FileText size={22} />
                  </div>

                  <div>
                    <h2 className="text-base font-bold text-default-900">
                      Current Service Brochure Details
                    </h2>
                    <p className="text-sm text-default-500">
                      Existing mapping and brochure information for this
                      solution.
                    </p>
                  </div>
                </div>
              </CardHeader>

              <Divider />

              <CardBody className="space-y-5 p-5">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                  <InfoTile
                    icon={<FolderTree size={18} />}
                    label="Menu"
                    value={getName(serviceBrouchersDetail?.menu)}
                  />

                  <InfoTile
                    icon={<Layers3 size={18} />}
                    label="Category"
                    value={getName(serviceBrouchersDetail?.menuCategory)}
                  />

                  <InfoTile
                    icon={<FileText size={18} />}
                    label="Subcategory"
                    value={getName(serviceBrouchersDetail?.subCategory)}
                  />

                  <InfoTile
                    icon={<CheckCircle2 size={18} />}
                    label="Solution"
                    value={serviceBrouchersDetail?.solution?.name}
                  />
                </div>

                <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                  <div className="rounded-2xl border border-default-200 bg-default-50 p-4">
                    <div className="mb-3 flex items-center justify-between">
                      <div>
                        <p className="text-sm font-bold text-default-900">
                          Brochure
                        </p>
                        <p className="text-xs text-default-500">
                          Uploaded brochure details
                        </p>
                      </div>

                      <Chip
                        size="sm"
                        variant="flat"
                        color={
                          serviceBrouchersDetail?.solution?.brochure
                            ? "success"
                            : "default"
                        }
                      >
                        {serviceBrouchersDetail?.solution?.brochure
                          ? "Available"
                          : "Not Added"}
                      </Chip>
                    </div>

                    {serviceBrouchersDetail?.solution?.brochure ? (
                      <div className="space-y-2 rounded-xl bg-background p-4 text-sm">
                        <p className="break-words">
                          <span className="font-semibold">File Name:</span>{" "}
                          {serviceBrouchersDetail.solution.brochure.fileName ||
                            "---"}
                        </p>

                        <p className="break-words">
                          <span className="font-semibold">Description:</span>{" "}
                          {serviceBrouchersDetail.solution.brochure
                            .description || "---"}
                        </p>

                        {serviceBrouchersDetail.solution.brochure.filePath && (
                          <a
                            href={
                              serviceBrouchersDetail.solution.brochure.filePath
                            }
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex font-semibold text-primary underline"
                          >
                            View Brochure
                          </a>
                        )}
                      </div>
                    ) : (
                      <div className="rounded-xl border border-dashed border-default-300 bg-background p-5 text-center">
                        <UploadCloud
                          className="mx-auto text-default-400"
                          size={28}
                        />
                        <p className="mt-2 text-sm font-semibold text-default-700">
                          No brochure uploaded yet
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="rounded-2xl border border-default-200 bg-default-50 p-4">
                    <div className="mb-3 flex items-center justify-between">
                      <div>
                        <p className="text-sm font-bold text-default-900">
                          Email Template
                        </p>
                        <p className="text-xs text-default-500">
                          Mail body and scope of work
                        </p>
                      </div>

                      <Chip
                        size="sm"
                        variant="flat"
                        color={
                          serviceBrouchersDetail?.solution?.emailTemplate
                            ? "success"
                            : "default"
                        }
                      >
                        {serviceBrouchersDetail?.solution?.emailTemplate
                          ? "Available"
                          : "Not Added"}
                      </Chip>
                    </div>

                    {serviceBrouchersDetail?.solution?.emailTemplate ? (
                      <div className="space-y-4 rounded-xl bg-background p-4 text-sm">
                        <p>
                          <span className="font-semibold">Subject:</span>{" "}
                          {serviceBrouchersDetail.solution.emailTemplate
                            .emailSubject || "---"}
                        </p>

                        <div>
                          <p className="mb-1 font-semibold">Mail Body:</p>
                          <div
                            className="prose max-w-none text-default-700"
                            dangerouslySetInnerHTML={{
                              __html:
                                serviceBrouchersDetail.solution.emailTemplate
                                  .emailBody || "<p>No email body added.</p>",
                            }}
                          />
                        </div>

                        <div>
                          <p className="mb-1 font-semibold">Scope of Work:</p>
                          <div
                            className="prose max-w-none text-default-700"
                            dangerouslySetInnerHTML={{
                              __html:
                                serviceBrouchersDetail.solution.emailTemplate
                                  .scopeOfWork ||
                                "<p>No scope of work added.</p>",
                            }}
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="rounded-xl border border-dashed border-default-300 bg-background p-5 text-center">
                        <FileText
                          className="mx-auto text-default-400"
                          size={28}
                        />
                        <p className="mt-2 text-sm font-semibold text-default-700">
                          No email template added yet
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </CardBody>
            </Card>
          </div>
        </div>

        <Modal
          isOpen={isModalOpen}
          onOpenChange={setIsModalOpen}
          size="full"
          scrollBehavior="inside"
          backdrop="blur"
          isDismissable={false}
          classNames={{
            wrapper: "!items-stretch !justify-stretch p-0 overflow-hidden",
            base: "m-0 h-dvh max-h-dvh w-screen max-w-none rounded-none overflow-hidden",
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
                        Add / Update Service Details
                      </h2>
                      <p className="text-sm font-normal text-default-500">
                        Fields are pre-filled from existing solution details.
                      </p>
                    </div>
                  </div>
                </ModalHeader>

                <ModalBody className="min-h-0 flex-1 overflow-hidden p-0">
                  <div className="h-full min-h-0 overflow-y-auto overflow-x-hidden p-6">
                    <div className="flex flex-col gap-6">
                      <div className="rounded-2xl border border-default-200 bg-default-50 p-4">
                        <div className="mb-4 flex items-center justify-between gap-3">
                          <p className="text-sm font-bold text-default-900">
                            Service Mapping
                          </p>

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
                              formData.menuId
                                ? new Set([formData.menuId])
                                : new Set([])
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
                              formData.categoryId
                                ? new Set([formData.categoryId])
                                : new Set([])
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
                                ? new Set([formData.subCategoryId])
                                : new Set([])
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
                              <p className="mb-2 text-sm text-default-900">
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
                                onUploadSuccess={(uploadedFile) => {
                                  setFormData((prev) => ({
                                    ...prev,
                                    brochureMeta: uploadedFile,
                                    brochurePath:
                                      uploadedFile?.filePath ||
                                      prev.brochurePath,
                                  }));

                                  setFieldErrors((prev) => ({
                                    ...prev,
                                    brochure: "",
                                  }));
                                }}
                                onUploadingChange={setIsUploading}
                              />

                              {formData.brochurePath && (
                                <a
                                  href={formData.brochurePath}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="mt-2 inline-flex text-sm font-semibold text-primary underline"
                                >
                                  View current brochure
                                </a>
                              )}
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
                        <div className="border-b border-default-200 px-4 py-3">
                          <p className="text-sm font-bold text-default-900">
                            Mail Body
                          </p>
                        </div>

                        <div className="p-4">
                          <NewTextEditor
                            data={formData.emailBody}
                            onChange={(value) =>
                              setFormData((prev) => ({
                                ...prev,
                                emailBody: value,
                              }))
                            }
                          />
                        </div>
                      </div>

                      <div className="rounded-2xl border border-default-200 bg-background shadow-sm">
                        <div className="border-b border-default-200 px-4 py-3">
                          <p className="text-sm font-bold text-default-900">
                            Scope of Work
                          </p>
                        </div>

                        <div className="p-4">
                          <NewTextEditor
                            data={formData.scopeOfWork}
                            onChange={(value) =>
                              setFormData((prev) => ({
                                ...prev,
                                scopeOfWork: value,
                              }))
                            }
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
