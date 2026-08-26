import {
  Button,
  Chip,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
  Form,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Pagination,
  Select,
  SelectItem,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
  Textarea,
  Tooltip,
  useDisclosure,
  addToast,
} from "@heroui/react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Ban,
  Calendar,
  EllipsisVertical,
  Eye,
  Mail,
  MapPin,
  Pencil,
  Phone,
  Plus,
  Search,
  Trash2,
} from "lucide-react";
import { useParams } from "react-router-dom";
import LoadingSpinner from "../components/LoadingSpinner";
import { Select as AntSelect } from "antd";
import {
  getAllCitiesByStateName,
  getAllCountries,
  getAllStatesByCountryName,
} from "../toolkit/slices/commonSlice";
import {
  createRestrictionForVendor,
  createVendor,
  deleteVendor,
  getAllVendors,
  updateVendor,
} from "../toolkit/slices/vendorsSlice";
import { allowOnlyNumbers, formatGSTInput, formatPANInput } from "../common";
import FileUploader from "../components/FileUploader.jsx";
const columns = [
  { name: "ID", uid: "id", sortable: true },
  // { name: "VENDOR CODE", uid: "vendorCode", sortable: true },
  { name: "VENDOR NAME", uid: "name", sortable: true },
  { name: "CONTACT", uid: "contact" },
  { name: "GST / PAN", uid: "taxDetail" },
  { name: "SERVICES", uid: "mappedProducts" }, // NEW
  { name: "STATUS", uid: "status" },
  // { name: "VERIFIED", uid: "verified" },
  { name: "ACTIONS", uid: "actions" },
];

const gstRegistrationTypeOptions = [
  { label: "Registered", value: "REGISTERED" },
  { label: "Unregistered", value: "UNREGISTERED" },
  { label: "SEZ", value: "SEZ" },
  { label: "International", value: "INTERNATIONAL" },
];

const restrictionTypeOptions = [
  { label: "Suspension", value: "SUSPENSION" },
  { label: "Blacklisted", value: "BLACKLISTED" },
];

const vendorStatusOptions = [
  { label: "Prospective", value: "PROSPECTIVE" },
  { label: "Onboarding", value: "ONBOARDING" },
  { label: "Active", value: "ACTIVE" },
  { label: "Inactive", value: "INACTIVE" },
  { label: "Blacklisted", value: "BLACKLISTED" },
  { label: "Suspended", value: "SUSPENDED" },
];

const GST_REGEX = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/;

const GST_STATE_CODES = {
  "jammu & kashmir": ["01"],
  "jammu and kashmir": ["01"],
  "himachal pradesh": ["02"],
  punjab: ["03"],
  chandigarh: ["04"],
  uttarakhand: ["05"],
  haryana: ["06"],
  delhi: ["07"],
  rajasthan: ["08"],
  "uttar pradesh": ["09"],
  bihar: ["10"],
  sikkim: ["11"],
  "arunachal pradesh": ["12"],
  nagaland: ["13"],
  manipur: ["14"],
  mizoram: ["15"],
  tripura: ["16"],
  meghalaya: ["17"],
  assam: ["18"],
  "west bengal": ["19"],
  jharkhand: ["20"],
  odisha: ["21"],
  orissa: ["21"],
  chhattisgarh: ["22"],
  "madhya pradesh": ["23"],
  gujarat: ["24"],
  "dadra & nagar haveli and daman & diu": ["26"],
  "dadra and nagar haveli and daman and diu": ["26"],
  "dadra & nagar haveli and daman and diu": ["26"],
  maharashtra: ["27"],
  "andhra pradesh": ["28", "37"],
  "andhra pradesh (legacy code – before bifurcation)": ["28"],
  "andhra pradesh (legacy code - before bifurcation)": ["28"],
  "andhra pradesh (current)": ["37"],
  karnataka: ["29"],
  goa: ["30"],
  lakshadweep: ["31"],
  kerala: ["32"],
  "tamil nadu": ["33"],
  puducherry: ["34"],
  pondicherry: ["34"],
  "andaman & nicobar islands": ["35"],
  "andaman and nicobar islands": ["35"],
  telangana: ["36"],
  ladakh: ["38"],
  "other territory": ["97"],
  "other territory (special gst registration)": ["97"],
  "other country": ["99"],
  "other country (for specified foreign gst registrations)": ["99"],
};

const normalizeStateName = (value = "") =>
  value.trim().toLowerCase().replace(/\s+/g, " ");

const initialVendorForm = {
  name: "",
  description: "",
  email: "",
  mobile: "",
  gstRegistrationType: "",
  gstNumber: "",
  panNumber: "",
  status: "Active",
  verified: "true",
  fullAddress: "",
  country: "",
  state: "",
  city: "",
};

const initialRestrictionForm = {
  restrictionType: "",
  reason: "",
  restrictionStartDate: "",
  restrictionEndDate: "",
  attachmentUrl: "",
};

const toNumberOrNull = (value) => {
  if (
    value === undefined ||
    value === null ||
    value === "" ||
    value === "undefined"
  ) {
    return null;
  }

  const numberValue = Number(value);
  return Number.isNaN(numberValue) ? null : numberValue;
};

const getErrorMessage = (error, fallbackMessage) => {
  if (typeof error === "string") return error;

  return (
    error?.message ||
    error?.error ||
    error?.details ||
    error?.data?.message ||
    fallbackMessage
  );
};

const Vendors = () => {
  const dispatch = useDispatch();
  const { userId } = useParams();

  const vendorModal = useDisclosure();
  const deleteModal = useDisclosure();
  const restrictModal = useDisclosure();
  const viewModal = useDisclosure();

  const vendorList = useSelector((state) => state.vendors.vendorList);
  const loading = useSelector((state) => state.vendors.loading);
  const createLoading = useSelector((state) => state.vendors.createLoading);
  const updateLoading = useSelector((state) => state.vendors.updateLoading);
  const deleteLoading = useSelector((state) => state.vendors.deleteLoading);
  // NOTE: add `restrictLoading` to the vendors slice's initial state and
  // handle pending/fulfilled/rejected of createRestrictionForVendor there,
  // the same way createLoading/updateLoading/deleteLoading are handled.
  const restrictLoading = useSelector((state) => state.vendors.restrictLoading);

  const countryList = useSelector((state) => state.common.countriesList || []);
  const statesList = useSelector((state) => state.common.statesList || []);
  const citiesList = useSelector((state) => state.common.citiesList || []);

  const data = Array.isArray(vendorList)
    ? vendorList
    : vendorList?.content || [];

  const [filterValue, setFilterValue] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [selectedKeys, setSelectedKeys] = useState(new Set([]));
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [modalMode, setModalMode] = useState("create");
  const [vendorForm, setVendorForm] = useState(initialVendorForm);
  const [restrictionForm, setRestrictionForm] = useState(
    initialRestrictionForm,
  );

  const [sortDescriptor, setSortDescriptor] = useState({
    column: "id",
    direction: "descending",
  });

  const [pagination, setPagination] = useState({
    page: 1,
    size: 50,
  });

  const [isAttachmentUploading, setIsAttachmentUploading] = useState(false);

  const auditUserId = toNumberOrNull(userId);

  const refetchVendors = useCallback(
    (search = "") => {
      dispatch(
        getAllVendors({
          userId,
          page: pagination.page,
          size: pagination.size,
          search: search,
          status: statusFilter !== "ALL" ? statusFilter : undefined,
        }),
      );
    },
    [dispatch, pagination.page, pagination.size, statusFilter],
  );

  useEffect(() => {
    refetchVendors();
  }, [refetchVendors]);

  useEffect(() => {
    dispatch(getAllCountries());
  }, [dispatch]);

  const resetForm = () => {
    setVendorForm(initialVendorForm);
    setSelectedVendor(null);
    setModalMode("create");
  };

  const resetRestrictionForm = () => {
    setRestrictionForm(initialRestrictionForm);
    setIsAttachmentUploading(false);
  };

  const handleInputChange = (field, value) => {
    setVendorForm((prev) => {
      const updatedForm = {
        ...prev,
        [field]: value,
      };

      if (field === "gstRegistrationType") {
        if (value !== "REGISTERED" && value !== "SEZ") {
          updatedForm.gstNumber = "";
        }

        updatedForm.state = "";
        updatedForm.city = "";

        if (value === "INTERNATIONAL") {
          updatedForm.country = "";
        } else if (value) {
          updatedForm.country = "India";
          dispatch(getAllStatesByCountryName("India"));
        } else {
          updatedForm.country = "";
        }
      }

      return updatedForm;
    });
  };

  const handleRestrictionInputChange = (field, value) => {
    setRestrictionForm((prev) => {
      const updated = {
        ...prev,
        [field]: value,
      };

      // restrictionStartDate / restrictionEndDate only apply to SUSPENSION
      if (field === "restrictionType" && value !== "SUSPENSION") {
        updated.restrictionStartDate = "";
        updated.restrictionEndDate = "";
      }

      return updated;
    });
  };

  const handleCountryChange = (value) => {
    setVendorForm((prev) => ({
      ...prev,
      country: value || "",
      state: "",
      city: "",
    }));

    if (value) {
      dispatch(getAllStatesByCountryName(value));
    }
  };

  const handleStateChange = (value) => {
    setVendorForm((prev) => ({
      ...prev,
      state: value || "",
      city: "",
    }));

    if (value) {
      dispatch(getAllCitiesByStateName(value));
    }
  };

  const openCreateModal = () => {
    resetForm();
    setModalMode("create");
    vendorModal.onOpen();
  };

  const openEditModal = (vendor) => {
    setSelectedVendor(vendor);
    setModalMode("edit");

    setVendorForm({
      name: vendor?.name || "",
      description: vendor?.description || "",
      email: vendor?.email || "",
      mobile: vendor?.mobile || "",
      gstRegistrationType: vendor?.gstRegistrationType || "",
      gstNumber: vendor?.gstNumber || "",
      panNumber: vendor?.panNumber || "",
      status: vendor?.status || "Active",
      verified: String(Boolean(vendor?.verified)),
      fullAddress: vendor?.fullAddress || "",
      country: vendor?.country || vendor?.Country || "",
      state: vendor?.state || "",
      city: vendor?.city || "",
    });

    const existingCountry = vendor?.country || vendor?.Country || "";
    if (existingCountry) {
      dispatch(getAllStatesByCountryName(existingCountry));
    }

    if (vendor?.state) {
      dispatch(getAllCitiesByStateName(vendor.state));
    }

    vendorModal.onOpen();
  };

  const openDeleteModal = (vendor) => {
    setSelectedVendor(vendor);
    deleteModal.onOpen();
  };

  const openRestrictModal = (vendor) => {
    setSelectedVendor(vendor);
    resetRestrictionForm();
    restrictModal.onOpen();
  };

  const openViewModal = (vendor) => {
    setSelectedVendor(vendor);
    viewModal.onOpen();
  };

  const validateVendorForm = () => {
    if (!auditUserId) {
      addToast({
        title: "User ID is missing",
        description: "Please check route params. userId cannot be undefined.",
        color: "danger",
      });
      return false;
    }

    if (!vendorForm.name.trim()) {
      addToast({
        title: "Vendor name is required",
        color: "danger",
      });
      return false;
    }

    if (!vendorForm.email.trim()) {
      addToast({
        title: "Email is required",
        color: "danger",
      });
      return false;
    }

    if (!vendorForm.mobile.trim()) {
      addToast({
        title: "Mobile number is required",
        color: "danger",
      });
      return false;
    }

    if (!vendorForm.gstRegistrationType) {
      addToast({
        title: "GST registration type is required",
        color: "danger",
      });
      return false;
    }

    const isGstNumberRequired =
      vendorForm.gstRegistrationType === "REGISTERED" ||
      vendorForm.gstRegistrationType === "SEZ";

    if (isGstNumberRequired && !vendorForm.gstNumber.trim()) {
      addToast({
        title: "GST number is required",
        description: "GST number is mandatory for Registered and SEZ vendors.",
        color: "danger",
      });
      return false;
    }

    if (isGstNumberRequired) {
      const formattedGstNumber = vendorForm.gstNumber.trim().toUpperCase();

      if (!GST_REGEX.test(formattedGstNumber)) {
        addToast({
          title: "Invalid GST number",
          description: "Enter a valid 15-character GST number.",
          color: "danger",
        });
        return false;
      }

      const stateName = normalizeStateName(vendorForm.state);
      const allowedStateGstCodes = GST_STATE_CODES[stateName] || [];
      const enteredGstCode = formattedGstNumber.substring(0, 2);

      if (allowedStateGstCodes.length === 0) {
        addToast({
          title: "GST state code is unavailable",
          description: `GST code is not configured for ${vendorForm.state}.`,
          color: "danger",
        });
        return false;
      }

      if (!allowedStateGstCodes.includes(enteredGstCode)) {
        addToast({
          title: "GST number does not match selected state",
          description: `${vendorForm.state} GST code is ${allowedStateGstCodes.join(
            " or ",
          )}, but the entered GST number starts with ${enteredGstCode}.`,
          color: "danger",
        });
        return false;
      }
    }

    if (!vendorForm.panNumber.trim()) {
      addToast({
        title: "PAN number is required",
        color: "danger",
      });
      return false;
    }

    if (!vendorForm.fullAddress.trim()) {
      addToast({
        title: "Full address is required",
        color: "danger",
      });
      return false;
    }

    if (!vendorForm.country) {
      addToast({
        title: "Country is required",
        color: "danger",
      });
      return false;
    }

    if (!vendorForm.state) {
      addToast({
        title: "State is required",
        color: "danger",
      });
      return false;
    }

    if (!vendorForm.city) {
      addToast({
        title: "City is required",
        color: "danger",
      });
      return false;
    }

    return true;
  };

  const validateRestrictionForm = () => {
    if (!auditUserId) {
      addToast({
        title: "User ID is missing",
        description: "Please check route params. userId cannot be undefined.",
        color: "danger",
      });
      return false;
    }

    if (!toNumberOrNull(selectedVendor?.id)) {
      addToast({
        title: "Vendor ID is missing",
        color: "danger",
      });
      return false;
    }

    if (!restrictionForm.restrictionType) {
      addToast({
        title: "Restriction type is required",
        color: "danger",
      });
      return false;
    }

    if (!restrictionForm.reason.trim()) {
      addToast({
        title: "Reason is required",
        color: "danger",
      });
      return false;
    }

    if (restrictionForm.restrictionType === "SUSPENSION") {
      if (!restrictionForm.restrictionStartDate) {
        addToast({
          title: "Restriction start date is required",
          description: "Start date is mandatory for suspension.",
          color: "danger",
        });
        return false;
      }

      if (!restrictionForm.restrictionEndDate) {
        addToast({
          title: "Restriction end date is required",
          description: "End date is mandatory for suspension.",
          color: "danger",
        });
        return false;
      }

      if (
        new Date(restrictionForm.restrictionEndDate) <
        new Date(restrictionForm.restrictionStartDate)
      ) {
        addToast({
          title: "Invalid restriction period",
          description: "End date cannot be before start date.",
          color: "danger",
        });
        return false;
      }
    }

    return true;
  };

  const buildVendorPayload = () => {
    return {
      name: vendorForm.name.trim(),
      description: vendorForm.description.trim(),
      email: vendorForm.email.trim(),
      mobile: vendorForm.mobile.trim(),
      gstRegistrationType: vendorForm.gstRegistrationType || null,
      gstNumber:
        vendorForm.gstRegistrationType === "REGISTERED" ||
        vendorForm.gstRegistrationType === "SEZ"
          ? vendorForm.gstNumber.trim().toUpperCase()
          : null,
      panNumber: vendorForm.panNumber.trim().toUpperCase(),
      status: "ACTIVE",
      createdBy:
        modalMode === "edit"
          ? toNumberOrNull(selectedVendor?.createdBy) || auditUserId
          : auditUserId,
      updatedBy: auditUserId,
      verified: vendorForm.verified === "true",
      fullAddress: vendorForm.fullAddress.trim(),
      country: vendorForm.country,
      state: vendorForm.state,
      city: vendorForm.city,
    };
  };

  const buildRestrictionPayload = (vendorId) => {
    const isSuspension = restrictionForm.restrictionType === "SUSPENSION";

    return {
      vendorId,
      restrictionType: restrictionForm.restrictionType,
      reason: restrictionForm.reason.trim(),
      restrictionStartDate: isSuspension
        ? restrictionForm.restrictionStartDate
        : null,
      restrictionEndDate: isSuspension
        ? restrictionForm.restrictionEndDate
        : null,
      attachmentUrl: restrictionForm.attachmentUrl.trim() || null,
    };
  };

  const handleSubmitVendor = async (e) => {
    e.preventDefault();

    if (!validateVendorForm()) return;

    const payload = buildVendorPayload();

    try {
      if (modalMode === "edit") {
        const vendorId = toNumberOrNull(selectedVendor?.id);

        if (!vendorId) {
          addToast({
            title: "Vendor ID is missing",
            color: "danger",
          });
          return;
        }

        await dispatch(
          updateVendor({
            id: vendorId,
            data: payload,
            userId: auditUserId,
          }),
        ).unwrap();

        addToast({
          title: "SUCCESS",
          description: "Vendor updated successfully",
          color: "success",
        });
      } else {
        await dispatch(
          createVendor({
            data: payload,
            userId: auditUserId,
          }),
        ).unwrap();

        addToast({
          title: "SUCCESS",
          description: "Vendor created successfully !.",
          color: "success",
        });
      }

      resetForm();
      vendorModal.onClose();
      refetchVendors();
    } catch (error) {
      addToast({
        title:
          modalMode === "edit"
            ? "Failed to update vendor"
            : "Failed to create vendor",
        description: getErrorMessage(
          error,
          "Please check vendor details and try again.",
        ),
        color: "danger",
      });
    }
  };

  const handleDeleteVendor = async () => {
    const vendorId = toNumberOrNull(selectedVendor?.id);

    if (!auditUserId) {
      addToast({
        title: "User ID is missing",
        color: "danger",
      });
      return;
    }

    if (!vendorId) {
      addToast({
        title: "Vendor ID is missing",
        color: "danger",
      });
      return;
    }

    try {
      await dispatch(
        deleteVendor({
          id: vendorId,
          userId: auditUserId,
        }),
      ).unwrap();

      addToast({
        title: "Vendor deleted successfully",
        color: "success",
      });

      deleteModal.onClose();
      setSelectedVendor(null);
      refetchVendors();
    } catch (error) {
      addToast({
        title: "Failed to delete vendor",
        description: getErrorMessage(
          error,
          "Please try again after some time.",
        ),
        color: "danger",
      });
    }
  };

  const handleSubmitRestriction = async (e) => {
    e.preventDefault();

    if (!validateRestrictionForm()) return;

    const vendorId = toNumberOrNull(selectedVendor?.id);
    const payload = buildRestrictionPayload(vendorId);

    try {
      await dispatch(
        createRestrictionForVendor({
          id: vendorId,
          userId: auditUserId,
          data: payload,
        }),
      ).unwrap();

      addToast({
        title: "SUCCESS",
        description:
          restrictionForm.restrictionType === "SUSPENSION"
            ? "Vendor suspension Initiated"
            : "Vendor blacklist Initiated",
        color: "success",
      });

      resetRestrictionForm();
      setSelectedVendor(null);
      restrictModal.onClose();
      refetchVendors();
    } catch (error) {
      addToast({
        title: "Failed to restrict vendor",
        description: getErrorMessage(
          error,
          "Please try again after some time.",
        ),
        color: "danger",
      });
    }
  };

  const filteredItems = useMemo(() => {
    const search = filterValue.trim().toLowerCase();

    if (!search) return data;

    return data.filter((item) => {
      return (
        item?.name?.toLowerCase().includes(search) ||
        item?.email?.toLowerCase().includes(search) ||
        item?.mobile?.toLowerCase().includes(search) ||
        item?.gstNumber?.toLowerCase().includes(search) ||
        item?.panNumber?.toLowerCase().includes(search) ||
        item?.status?.toLowerCase().includes(search)
      );
    });
  }, [data, filterValue]);

  const count = filteredItems.length;
  const pages = Math.ceil(count / pagination.size) || 1;

  const paginatedItems = useMemo(() => {
    const start = (pagination.page - 1) * pagination.size;
    const end = start + pagination.size;

    return filteredItems.slice(start, end);
  }, [filteredItems, pagination.page, pagination.size]);

  const sortedItems = useMemo(() => {
    return [...paginatedItems].sort((a, b) => {
      const firstValue = a?.[sortDescriptor.column] ?? "";
      const secondValue = b?.[sortDescriptor.column] ?? "";

      const first =
        typeof firstValue === "string" ? firstValue.toLowerCase() : firstValue;

      const second =
        typeof secondValue === "string"
          ? secondValue.toLowerCase()
          : secondValue;

      const cmp = first < second ? -1 : first > second ? 1 : 0;

      return sortDescriptor.direction === "descending" ? -cmp : cmp;
    });
  }, [paginatedItems, sortDescriptor]);

  const onSearchChange = useCallback((value) => {
    setFilterValue(value || "");
    setPagination((prev) => ({
      ...prev,
      page: 1,
    }));
    refetchVendors();
  }, []);

  const onStatusFilterChange = useCallback((keys) => {
    const selected = Array.from(keys)[0] || "ALL";
    setStatusFilter(selected);
    setPagination((prev) => ({
      ...prev,
      page: 1,
    }));
  }, []);

  const onClear = useCallback(() => {
    setFilterValue("");
    setPagination((prev) => ({
      ...prev,
      page: 1,
    }));
  }, []);

  const onRowsPerPageChange = useCallback((e) => {
    setPagination((prev) => ({
      ...prev,
      size: Number(e.target.value),
      page: 1,
    }));
  }, []);

  const onNextPage = useCallback(() => {
    if (pagination.page < pages) {
      setPagination((prev) => ({
        ...prev,
        page: prev.page + 1,
      }));
    }
  }, [pagination.page, pages]);

  const onPreviousPage = useCallback(() => {
    if (pagination.page > 1) {
      setPagination((prev) => ({
        ...prev,
        page: prev.page - 1,
      }));
    }
  }, [pagination.page]);

  const renderCell = useCallback((rowData, columnKey) => {
    switch (columnKey) {
      case "id":
        return (
          <span className="text-sm font-medium text-foreground">
            {rowData?.id || "-"}
          </span>
        );

      // case "vendorCode":
      //   return (
      //     <div className="flex flex-col">
      //       <span className="font-semibold text-foreground">
      //         {rowData?.vendorCode || "-"}
      //       </span>
      //       <span className="line-clamp-1 text-xs text-default-400">
      //         {rowData?.description || "No description"}
      //       </span>
      //     </div>
      //   );

      case "name":
        return (
          <span className="font-medium text-foreground">
            {rowData?.name || "-"}
          </span>
        );

      case "contact":
        return (
          <div className="flex flex-col">
            <span className="text-sm text-foreground">
              {rowData?.email || "-"}
            </span>
            <span className="text-xs text-default-400">
              {rowData?.mobile || "-"}
            </span>
          </div>
        );

      case "taxDetail":
        return (
          <div className="flex flex-col">
            <span className="text-sm text-foreground">
              GST: {rowData?.gstNumber || "-"}
            </span>
            <span className="text-xs text-default-400">
              PAN: {rowData?.panNumber || "-"}
            </span>
          </div>
        );

      case "mappedProducts": {
        const products = Array.isArray(rowData?.mappedProducts)
          ? rowData.mappedProducts
          : [];

        if (!products.length) {
          return <span className="text-xs text-default-400">No Services</span>;
        }

        const primaryProduct = products[0];
        const extraCount = products.length - 1;

        return (
          <Tooltip
            placement="left"
            className="max-w-[280px]"
            content={
              <div className="py-1">
                <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-default-500">
                  Mapped Services ({products.length})
                </p>

                <div className="flex flex-col gap-1.5">
                  {products.map((product) => {
                    const isLive =
                      product?.mappingActive && product?.productActive;

                    return (
                      <div
                        key={product?.productId}
                        className="flex items-center justify-between gap-3"
                      >
                        <span className="truncate text-xs text-foreground">
                          {product?.productName || "-"}
                        </span>

                        <span
                          className={`h-1.5 w-1.5 shrink-0 rounded-full ${
                            isLive ? "bg-success" : "bg-default-300"
                          }`}
                          title={isLive ? "Active mapping" : "Inactive mapping"}
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
            }
          >
            <div className="flex w-fit max-w-[180px] cursor-default items-center gap-1.5 rounded-full border border-default-200 bg-default-50 px-2.5 py-1">
              <span className="truncate text-xs font-medium text-foreground">
                {primaryProduct?.productName || "-"}
              </span>

              {extraCount > 0 && (
                <span className="shrink-0 text-[10px] font-semibold text-default-500">
                  +{extraCount}
                </span>
              )}
            </div>
          </Tooltip>
        );
      }

      case "status":
        return (
          <Chip
            size="sm"
            color={
              rowData?.status?.toUpperCase() === "ACTIVE"
                ? "success"
                : rowData?.status?.toUpperCase() === "ONBOARDING"
                  ? "warning"
                  : "danger"
            }
            variant="flat"
          >
            {rowData?.status || "-"}
          </Chip>
        );

      // case "verified":
      //   return (
      //     <Chip
      //       size="sm"
      //       color={rowData?.verified ? "success" : "warning"}
      //       variant="flat"
      //     >
      //       {rowData?.verified ? "Verified" : "Not Verified"}
      //     </Chip>
      //   );

      case "actions": {
        const isActive = rowData?.status?.toUpperCase() === "ACTIVE";

        return (
          <div className="flex items-center justify-center gap-2">
            <Dropdown>
              <DropdownTrigger>
                <Button isIconOnly size="sm" variant="light">
                  <EllipsisVertical className="h-4 w-4" />
                </Button>
              </DropdownTrigger>

              <DropdownMenu aria-label="Vendor actions">
                <DropdownItem
                  key="view"
                  startContent={<Eye className="h-4 w-4" />}
                  onPress={() => openViewModal(rowData)}
                >
                  View Vendor
                </DropdownItem>

                {!isActive ? (
                  <DropdownItem
                    key="edit"
                    startContent={<Pencil className="h-4 w-4" />}
                    onPress={() => openEditModal(rowData)}
                  >
                    Edit Vendor
                  </DropdownItem>
                ) : null}

                {isActive ? (
                  <DropdownItem
                    key="restrict"
                    className="text-warning"
                    color="warning"
                    startContent={<Ban className="h-4 w-4" />}
                    onPress={() => openRestrictModal(rowData)}
                  >
                    Restrict Vendor
                  </DropdownItem>
                ) : null}

                {!isActive ? (
                  <DropdownItem
                    key="delete"
                    className="text-danger"
                    color="danger"
                    startContent={<Trash2 className="h-4 w-4" />}
                    onPress={() => openDeleteModal(rowData)}
                  >
                    Delete Vendor
                  </DropdownItem>
                ) : null}
              </DropdownMenu>
            </Dropdown>
          </div>
        );
      }

      default:
        return rowData?.[columnKey] || "-";
    }
  }, []);

  const topContent = useMemo(() => {
    return (
      <div className="flex flex-col gap-2">
        <div className="flex justify-between gap-2 items-center flex-wrap">
          <Input
            isClearable
            size="sm"
            className="w-full sm:max-w-[280px]"
            classNames={{ inputWrapper: "h-8 min-h-8" }}
            placeholder="Search vendors..."
            startContent={<Search className="w-4 h-4 text-default-400" />}
            value={filterValue}
            onClear={onClear}
            onValueChange={onSearchChange}
          />

          <div className="flex gap-1.5 flex-wrap">
            <Select
              size="sm"
              className="w-full sm:w-[180px]"
              classNames={{ trigger: "h-8 min-h-8" }}
              label="Status"
              placeholder="Filter by status"
              selectedKeys={new Set([statusFilter])}
              onSelectionChange={onStatusFilterChange}
            >
              <SelectItem key="ALL">All</SelectItem>
              {vendorStatusOptions.map((option) => (
                <SelectItem key={option.value}>{option.label}</SelectItem>
              ))}
            </Select>
            <Button
              size="sm"
              color="primary"
              startContent={<Plus className="w-4 h-4" />}
              onPress={openCreateModal}
            >
              Add Vendor
            </Button>
          </div>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-default-400 text-[12.5px]">
            Total {count} vendors
          </span>

          <label className="flex items-center gap-1 text-default-400 text-[12.5px]">
            Rows per page:
            <select
              className="bg-transparent outline-hidden text-default-400 text-[12.5px] cursor-pointer"
              onChange={onRowsPerPageChange}
              value={pagination.size}
            >
              <option value="5">5</option>
              <option value="10">10</option>
              <option value="25">25</option>
              <option value="50">50</option>
            </select>
          </label>
        </div>
      </div>
    );
  }, [
    count,
    filterValue,
    onClear,
    onRowsPerPageChange,
    onSearchChange,
    onStatusFilterChange,
    pagination.size,
    statusFilter,
  ]);

  const bottomContent = useMemo(() => {
    return (
      <div className="py-1.5 px-1 flex justify-between items-center">
        <span className="w-[30%] text-[12.5px] text-default-400">
          {selectedKeys === "all"
            ? "All items selected"
            : `${selectedKeys.size} of ${count} selected`}
        </span>

        <Pagination
          isCompact
          showControls
          color="primary"
          page={pagination.page}
          total={pages}
          onChange={(page) => {
            setPagination((prev) => ({
              ...prev,
              page,
            }));
          }}
        />

        <div className="hidden sm:flex w-[30%] justify-end gap-2">
          <Button
            isDisabled={pagination.page === 1}
            size="sm"
            variant="flat"
            onPress={onPreviousPage}
          >
            Previous
          </Button>

          <Button
            isDisabled={pagination.page === pages}
            size="sm"
            variant="flat"
            onPress={onNextPage}
          >
            Next
          </Button>
        </div>
      </div>
    );
  }, [selectedKeys, count, pagination.page, pages, onPreviousPage, onNextPage]);

  const isSubmitLoading =
    createLoading === "pending" || updateLoading === "pending";

  return (
    <div className="flex flex-col gap-2">
      <h1 className="font-sans text-lg font-semibold mb-2 shrink-0">
        Vendors List
      </h1>

      {loading === "pending" && <LoadingSpinner />}

      <Table
        isHeaderSticky
        removeWrapper={false}
        aria-label="Vendors table"
        bottomContent={bottomContent}
        bottomContentPlacement="outside"
        classNames={{
          base: "gap-2.5",
          wrapper:
            "max-h-[calc(100vh-320px)] w-full overflow-y-auto rounded-lg border border-gray-200 dark:border-white/10 shadow-none p-0",
          table: "w-full",
          thead: "[&>tr]:first:rounded-none",
          th: "h-8 py-0 text-[11.5px] tracking-wide bg-gray-50 dark:bg-neutral-900 text-default-500 first:rounded-none last:rounded-none border-b border-gray-200 dark:border-white/10",
          td: "py-1.5 text-[12.5px]",
        }}
        selectedKeys={selectedKeys}
        // selectionMode="multiple"
        sortDescriptor={sortDescriptor}
        topContent={topContent}
        topContentPlacement="outside"
        onSelectionChange={setSelectedKeys}
        onSortChange={setSortDescriptor}
      >
        <TableHeader columns={columns}>
          {(column) => (
            <TableColumn
              key={column.uid}
              align={column.uid === "actions" ? "center" : "start"}
              allowsSorting={column.sortable}
            >
              {column.name}
            </TableColumn>
          )}
        </TableHeader>

        <TableBody emptyContent="No vendors found" items={sortedItems}>
          {(item) => (
            <TableRow key={item.id || item.vendorCode}>
              {(columnKey) => (
                <TableCell>{renderCell(item, columnKey)}</TableCell>
              )}
            </TableRow>
          )}
        </TableBody>
      </Table>

      <Modal
        isOpen={vendorModal.isOpen}
        onOpenChange={vendorModal.onOpenChange}
        size="4xl"
        scrollBehavior="inside"
        isDismissable={false}
      >
        <ModalContent>
          {(modalClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1 border-b border-default-200">
                <span className="text-xl font-semibold">
                  {modalMode === "edit" ? "Update Vendor" : "Create New Vendor"}
                </span>
                <span className="text-sm font-normal text-default-500">
                  {modalMode === "edit"
                    ? "Update vendor details as per operation vendor master."
                    : "Fill vendor details as per operation vendor master."}
                </span>
              </ModalHeader>

              <ModalBody className="py-5">
                <Form className="w-full" onSubmit={handleSubmitVendor}>
                  <div className="grid w-full grid-cols-1 gap-4 md:grid-cols-2">
                    <Input
                      isRequired
                      label="Vendor Name"
                      name="name"
                      placeholder="Enter vendor company name"
                      value={vendorForm.name}
                      onValueChange={(value) =>
                        handleInputChange("name", value)
                      }
                    />

                    <Input
                      isRequired
                      type="email"
                      label="Email"
                      name="email"
                      placeholder="vendor@example.com"
                      value={vendorForm.email}
                      onValueChange={(value) =>
                        handleInputChange("email", value)
                      }
                    />

                    <Input
                      isRequired
                      label="Mobile"
                      name="mobile"
                      placeholder="Enter mobile number"
                      value={vendorForm.mobile}
                      onValueChange={(value) =>
                        handleInputChange("mobile", allowOnlyNumbers(value))
                      }
                    />

                    <Select
                      label="GST Registration Type"
                      name="gstRegistrationType"
                      placeholder="Select GST registration type"
                      selectedKeys={
                        vendorForm.gstRegistrationType
                          ? new Set([vendorForm.gstRegistrationType])
                          : new Set([])
                      }
                      onSelectionChange={(keys) => {
                        const selected = Array.from(keys)[0] || "";

                        handleInputChange("gstRegistrationType", selected);
                      }}
                    >
                      <SelectItem key="REGISTERED">Registered</SelectItem>
                      <SelectItem key="UNREGISTERED">Unregistered</SelectItem>
                      <SelectItem key="SEZ">SEZ</SelectItem>
                      <SelectItem key="INTERNATIONAL">International</SelectItem>
                    </Select>

                    <Input
                      isRequired={
                        vendorForm.gstRegistrationType === "REGISTERED" ||
                        vendorForm.gstRegistrationType === "SEZ"
                      }
                      label="GST Number"
                      name="gstNumber"
                      placeholder="Enter GST Number"
                      value={vendorForm.gstNumber}
                      maxLength={15}
                      onValueChange={(value) =>
                        handleInputChange("gstNumber", formatGSTInput(value))
                      }
                    />

                    <Input
                      isRequired
                      label="PAN Number"
                      name="panNumber"
                      placeholder="Enter PAN number"
                      value={vendorForm.panNumber}
                      onValueChange={(value) =>
                        handleInputChange("panNumber", formatPANInput(value))
                      }
                    />

                    <Select
                      isRequired
                      label="Verified"
                      name="verified"
                      selectedKeys={new Set([vendorForm.verified])}
                      onSelectionChange={(keys) => {
                        const selected = Array.from(keys)[0];

                        handleInputChange("verified", selected);
                      }}
                    >
                      <SelectItem key="true">Verified</SelectItem>
                      <SelectItem key="false">Not Verified</SelectItem>
                    </Select>

                    <Textarea
                      isRequired
                      className="md:col-span-2"
                      label="Full Address"
                      name="fullAddress"
                      placeholder="Enter complete vendor address"
                      minRows={2}
                      value={vendorForm.fullAddress}
                      onValueChange={(value) =>
                        handleInputChange("fullAddress", value)
                      }
                    />

                    <div className="flex flex-col gap-1">
                      <label className="text-sm font-medium text-default-700">
                        Country <span className="text-danger">*</span>
                      </label>
                      <AntSelect
                        showSearch
                        allowClear={
                          vendorForm.gstRegistrationType === "INTERNATIONAL"
                        }
                        className="w-full"
                        placeholder="Select Country"
                        value={vendorForm.country || undefined}
                        options={
                          vendorForm.gstRegistrationType === "INTERNATIONAL"
                            ? countryList.filter(
                                (country) =>
                                  country?.name?.toLowerCase() !== "india",
                              )
                            : countryList
                        }
                        fieldNames={{ label: "name", value: "name" }}
                        optionFilterProp="name"
                        disabled={
                          Boolean(vendorForm.gstRegistrationType) &&
                          vendorForm.gstRegistrationType !== "INTERNATIONAL"
                        }
                        onChange={handleCountryChange}
                      />
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="text-sm font-medium text-default-700">
                        State <span className="text-danger">*</span>
                      </label>
                      <AntSelect
                        showSearch
                        allowClear
                        className="w-full"
                        placeholder="Select State"
                        value={vendorForm.state || undefined}
                        options={statesList}
                        fieldNames={{ label: "name", value: "name" }}
                        optionFilterProp="name"
                        disabled={!vendorForm.country}
                        onChange={handleStateChange}
                      />
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="text-sm font-medium text-default-700">
                        City <span className="text-danger">*</span>
                      </label>
                      <AntSelect
                        showSearch
                        allowClear
                        className="w-full"
                        placeholder="Select City"
                        value={vendorForm.city || undefined}
                        options={citiesList}
                        fieldNames={{ label: "name", value: "name" }}
                        optionFilterProp="name"
                        disabled={!vendorForm.state}
                        onChange={(value) =>
                          handleInputChange("city", value || "")
                        }
                      />
                    </div>
                    <Textarea
                      className="md:col-span-2"
                      label="Description"
                      name="description"
                      placeholder="Enter vendor description"
                      minRows={3}
                      value={vendorForm.description}
                      onValueChange={(value) =>
                        handleInputChange("description", value)
                      }
                    />
                  </div>

                  <ModalFooter className="mt-4 flex w-full justify-end gap-2 border-t border-default-200 px-0 pt-4">
                    <Button
                      variant="flat"
                      onPress={() => {
                        resetForm();
                        modalClose();
                      }}
                    >
                      Cancel
                    </Button>

                    <Button
                      color="primary"
                      type="submit"
                      isLoading={isSubmitLoading}
                    >
                      {modalMode === "edit" ? "Update Vendor" : "Create Vendor"}
                    </Button>
                  </ModalFooter>
                </Form>
              </ModalBody>
            </>
          )}
        </ModalContent>
      </Modal>

      <Modal
        isOpen={deleteModal.isOpen}
        onOpenChange={deleteModal.onOpenChange}
        size="md"
        isDismissable={false}
      >
        <ModalContent>
          {(modalClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                Delete Vendor
              </ModalHeader>

              <ModalBody>
                <p className="text-sm text-default-600">
                  Are you sure you want to delete this vendor?
                </p>

                <div className="rounded-lg border border-danger-100 bg-danger-50 p-3">
                  <p className="font-semibold text-danger">
                    {selectedVendor?.name || "-"}
                  </p>
                  <p className="text-xs text-danger-600">
                    Vendor Code: {selectedVendor?.vendorCode || "-"}
                  </p>
                </div>
              </ModalBody>

              <ModalFooter>
                <Button
                  variant="flat"
                  onPress={() => {
                    setSelectedVendor(null);
                    modalClose();
                  }}
                >
                  Cancel
                </Button>

                <Button
                  color="danger"
                  isLoading={deleteLoading === "pending"}
                  onPress={handleDeleteVendor}
                >
                  Delete
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      <Modal
        isOpen={restrictModal.isOpen}
        onOpenChange={restrictModal.onOpenChange}
        size="lg"
        scrollBehavior="inside"
        isDismissable={false}
      >
        <ModalContent>
          {(modalClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1 border-b border-default-200">
                <span className="text-xl font-semibold">Restrict Vendor</span>
                <span className="text-sm font-normal text-default-500">
                  Suspend or blacklist{" "}
                  <span className="font-medium text-foreground">
                    {selectedVendor?.name || "this vendor"}
                  </span>
                  .
                </span>
              </ModalHeader>

              <ModalBody className="py-5">
                <Form className="w-full" onSubmit={handleSubmitRestriction}>
                  <div className="grid w-full grid-cols-1 gap-4 md:grid-cols-2">
                    <Select
                      isRequired
                      className="md:col-span-2"
                      label="Restriction Type"
                      name="restrictionType"
                      placeholder="Select restriction type"
                      selectedKeys={
                        restrictionForm.restrictionType
                          ? new Set([restrictionForm.restrictionType])
                          : new Set([])
                      }
                      onSelectionChange={(keys) => {
                        const selected = Array.from(keys)[0] || "";

                        handleRestrictionInputChange(
                          "restrictionType",
                          selected,
                        );
                      }}
                    >
                      <SelectItem key="SUSPENSION">Suspension</SelectItem>
                      <SelectItem key="BLACKLIST">Blacklisted</SelectItem>
                    </Select>

                    {restrictionForm.restrictionType === "SUSPENSION" ? (
                      <>
                        <Input
                          isRequired
                          type="date"
                          label="Restriction Start Date"
                          name="restrictionStartDate"
                          value={restrictionForm.restrictionStartDate}
                          onValueChange={(value) =>
                            handleRestrictionInputChange(
                              "restrictionStartDate",
                              value,
                            )
                          }
                        />

                        <Input
                          isRequired
                          type="date"
                          label="Restriction End Date"
                          name="restrictionEndDate"
                          value={restrictionForm.restrictionEndDate}
                          onValueChange={(value) =>
                            handleRestrictionInputChange(
                              "restrictionEndDate",
                              value,
                            )
                          }
                        />
                      </>
                    ) : null}

                    <Textarea
                      isRequired
                      className="md:col-span-2"
                      label="Reason"
                      name="reason"
                      placeholder="Enter reason for restriction"
                      minRows={3}
                      value={restrictionForm.reason}
                      onValueChange={(value) =>
                        handleRestrictionInputChange("reason", value)
                      }
                    />

                    <div className="md:col-span-2">
                      <FileUploader
                        label="Attachment"
                        placeholder="Drag & drop supporting document here, paste, or choose file"
                        value={restrictionForm.attachmentUrl}
                        onChange={(uploadedUrl) =>
                          handleRestrictionInputChange(
                            "attachmentUrl",
                            uploadedUrl,
                          )
                        }
                        onUploadingChange={setIsAttachmentUploading}
                        uploadingType="single"
                      />
                    </div>
                  </div>

                  <ModalFooter className="mt-4 flex w-full justify-end gap-2 border-t border-default-200 px-0 pt-4">
                    <Button
                      variant="flat"
                      onPress={() => {
                        resetRestrictionForm();
                        setSelectedVendor(null);
                        modalClose();
                      }}
                    >
                      Cancel
                    </Button>

                    <Button
                      color="warning"
                      type="submit"
                      isLoading={restrictLoading === "pending"}
                      isDisabled={isAttachmentUploading}
                    >
                      {restrictionForm.restrictionType === "BLACKLISTED"
                        ? "Blacklist Vendor"
                        : "Restrict Vendor"}
                    </Button>
                  </ModalFooter>
                </Form>
              </ModalBody>
            </>
          )}
        </ModalContent>
      </Modal>
      <Modal
        isOpen={viewModal.isOpen}
        onOpenChange={viewModal.onOpenChange}
        size="2xl"
        scrollBehavior="inside"
      >
        <ModalContent>
          {(modalClose) => (
            <>
              <ModalHeader className="flex flex-col gap-0 border-b border-default-200 bg-gradient-to-r from-default-50 to-transparent px-6 py-5">
                <div className="flex w-full items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary-100 text-lg font-bold text-primary-600">
                      {(selectedVendor?.name || "-")
                        .split(" ")
                        .filter(Boolean)
                        .slice(0, 2)
                        .map((word) => word[0]?.toUpperCase())
                        .join("")}
                    </div>

                    <div>
                      <p className="text-lg font-bold leading-tight text-foreground">
                        {selectedVendor?.name || "Vendor Details"}
                      </p>
                      <p className="text-xs font-medium text-default-400">
                        Vendor ID&nbsp;
                        <span className="font-semibold text-default-600">
                          #{selectedVendor?.id ?? "-"}
                        </span>
                      </p>
                    </div>
                  </div>

                  <Chip
                    size="sm"
                    radius="sm"
                    variant="solid"
                    color={
                      selectedVendor?.status?.toUpperCase() === "ACTIVE"
                        ? "success"
                        : selectedVendor?.status?.toUpperCase() === "ONBOARDING"
                          ? "warning"
                          : "danger"
                    }
                    className="font-semibold tracking-wide"
                  >
                    {selectedVendor?.status || "-"}
                  </Chip>
                </div>
              </ModalHeader>

              <ModalBody className="gap-4 bg-default-50/40 px-6 py-5">
                {/* Contact */}
                <div className="rounded-xl border border-default-200 bg-white p-4 shadow-sm">
                  <div className="mb-3 flex items-center gap-2">
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-100">
                      <Mail className="h-3.5 w-3.5 text-blue-600" />
                    </div>
                    <p className="text-xs font-bold uppercase tracking-wider text-default-500">
                      Contact Information
                    </p>
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <p className="text-[11px] font-medium uppercase tracking-wide text-default-400">
                        Email Address
                      </p>
                      <p className="mt-0.5 text-sm font-semibold text-foreground">
                        {selectedVendor?.email || "-"}
                      </p>
                    </div>
                    <div>
                      <p className="text-[11px] font-medium uppercase tracking-wide text-default-400">
                        Mobile Number
                      </p>
                      <p className="mt-0.5 text-sm font-semibold text-foreground">
                        {selectedVendor?.mobile || "-"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Tax Details */}
                <div className="rounded-xl border border-default-200 bg-white p-4 shadow-sm">
                  <div className="mb-3 flex items-center gap-2">
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-purple-100">
                      <span className="text-xs font-bold text-purple-600">
                        ₹
                      </span>
                    </div>
                    <p className="text-xs font-bold uppercase tracking-wider text-default-500">
                      Tax &amp; Registration Details
                    </p>
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <div>
                      <p className="text-[11px] font-medium uppercase tracking-wide text-default-400">
                        GST Registration Type
                      </p>
                      <p className="mt-0.5 text-sm font-semibold text-foreground">
                        {selectedVendor?.gstRegistrationType || "-"}
                      </p>
                    </div>
                    <div>
                      <p className="text-[11px] font-medium uppercase tracking-wide text-default-400">
                        GST Number
                      </p>
                      <p className="mt-0.5 font-mono text-sm font-semibold tracking-wide text-foreground">
                        {selectedVendor?.gstNumber || "-"}
                      </p>
                    </div>
                    <div>
                      <p className="text-[11px] font-medium uppercase tracking-wide text-default-400">
                        PAN Number
                      </p>
                      <p className="mt-0.5 font-mono text-sm font-semibold tracking-wide text-foreground">
                        {selectedVendor?.panNumber || "-"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Address */}
                <div className="rounded-xl border border-default-200 bg-white p-4 shadow-sm">
                  <div className="mb-3 flex items-center gap-2">
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-orange-100">
                      <MapPin className="h-3.5 w-3.5 text-orange-600" />
                    </div>
                    <p className="text-xs font-bold uppercase tracking-wider text-default-500">
                      Registered Address
                    </p>
                  </div>

                  <p className="text-sm font-semibold text-foreground">
                    {selectedVendor?.fullAddress || "-"}
                  </p>
                  <p className="mt-1 text-xs font-medium text-default-500">
                    {[
                      selectedVendor?.city,
                      selectedVendor?.state,
                      selectedVendor?.country,
                    ]
                      .filter(Boolean)
                      .join(", ") || "-"}
                  </p>
                </div>

                {/* Mapped Services */}
                <div className="rounded-xl border border-default-200 bg-white p-4 shadow-sm">
                  <div className="mb-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-100">
                        <span className="text-xs font-bold text-emerald-600">
                          {Array.isArray(selectedVendor?.mappedProducts)
                            ? selectedVendor.mappedProducts.length
                            : 0}
                        </span>
                      </div>
                      <p className="text-xs font-bold uppercase tracking-wider text-default-500">
                        Mapped Services
                      </p>
                    </div>
                  </div>

                  {Array.isArray(selectedVendor?.mappedProducts) &&
                  selectedVendor.mappedProducts.length > 0 ? (
                    <div className="flex flex-col gap-2">
                      {selectedVendor.mappedProducts.map((product) => {
                        const isLive =
                          product?.mappingActive && product?.productActive;

                        return (
                          <div
                            key={product?.productId}
                            className="flex items-center justify-between rounded-lg border border-default-100 bg-default-50 px-3 py-2"
                          >
                            <span className="text-sm font-semibold text-foreground">
                              {product?.productName || "-"}
                            </span>
                            <Chip
                              size="sm"
                              radius="sm"
                              variant="flat"
                              color={isLive ? "success" : "default"}
                              className="font-semibold"
                            >
                              {isLive ? "Active" : "Inactive"}
                            </Chip>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-xs font-medium text-default-400">
                      No services mapped
                    </p>
                  )}
                </div>

                {/* Description */}
                {selectedVendor?.description ? (
                  <div className="rounded-xl border border-default-200 bg-white p-4 shadow-sm">
                    <p className="mb-2 text-xs font-bold uppercase tracking-wider text-default-500">
                      Description
                    </p>
                    <p className="text-sm leading-relaxed text-foreground">
                      {selectedVendor.description}
                    </p>
                  </div>
                ) : null}

                {/* Audit trail */}
                <div className="grid grid-cols-1 gap-3 rounded-xl border border-default-200 bg-default-100/60 p-4 sm:grid-cols-2">
                  <div className="flex items-start gap-2">
                    <Calendar className="mt-0.5 h-4 w-4 text-default-400" />
                    <div>
                      <p className="text-[11px] font-medium uppercase tracking-wide text-default-400">
                        Created On
                      </p>
                      <p className="mt-0.5 text-xs font-semibold text-foreground">
                        {selectedVendor?.createdDate
                          ? new Date(
                              selectedVendor.createdDate,
                            ).toLocaleString()
                          : "-"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2">
                    <Calendar className="mt-0.5 h-4 w-4 text-default-400" />
                    <div>
                      <p className="text-[11px] font-medium uppercase tracking-wide text-default-400">
                        Last Updated
                      </p>
                      <p className="mt-0.5 text-xs font-semibold text-foreground">
                        {selectedVendor?.updatedDate
                          ? new Date(
                              selectedVendor.updatedDate,
                            ).toLocaleString()
                          : "-"}
                      </p>
                    </div>
                  </div>
                </div>
              </ModalBody>

              <ModalFooter className="border-t border-default-200 bg-white px-6 py-4">
                <Button
                  variant="flat"
                  onPress={() => {
                    setSelectedVendor(null);
                    modalClose();
                  }}
                >
                  Close
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
};

export default Vendors;
