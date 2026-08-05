import React, { useEffect } from "react";
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Input,
  Button,
  DropdownTrigger,
  Dropdown,
  DropdownMenu,
  DropdownItem,
  Pagination,
  User,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  addToast,
} from "@heroui/react";
import { ChevronDown, Search, Pencil, Trash2, Plus } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { Controller, useForm } from "react-hook-form";
import { useParams } from "react-router-dom";

import {
  getAllUserMappedWithProduct,
  getGroupedUserMappedWithProduct,
  createUserProductMapping,
  updateUserProductMapping,
  deleteUserProductMapping,
} from "../../toolkit/slices/operationSlice";

import NewSelect from "../../components/NewSelect";
import { getAllUsers } from "../../toolkit/slices/commonSlice";
import { getAllSolutionsByUserId } from "../../toolkit/slices/productSlice";

export function capitalize(s) {
  return s ? s.charAt(0).toUpperCase() + s.slice(1).toLowerCase() : "";
}

const VIEW_OPTIONS = [
  { key: "list", label: "List" },
  { key: "user", label: "User" },
  { key: "product", label: "Product" },
  { key: "rating", label: "Rating" },
];

const TABLE_COLUMNS = {
  list: [
    { name: "USER", uid: "userName" },
    { name: "PRODUCT", uid: "productName" },
    { name: "RATING", uid: "rating" },
    { name: "ACTIONS", uid: "actions" },
  ],

  user: [
    { name: "USER", uid: "userName" },
    { name: "PRODUCTS", uid: "products" },
    { name: "TOTAL PRODUCTS", uid: "totalProducts" },
  ],

  product: [
    { name: "PRODUCT", uid: "productName" },
    { name: "USERS", uid: "users" },
    { name: "TOTAL USERS", uid: "totalUsers" },
  ],

  rating: [
    { name: "RATING", uid: "rating" },
    { name: "MAPPINGS", uid: "mappings" },
    { name: "TOTAL MAPPINGS", uid: "totalMappings" },
  ],
};

const INITIAL_VISIBLE_COLUMNS_BY_VIEW = {
  list: ["userName", "productName", "rating", "actions"],
  user: ["userName", "products", "totalProducts"],
  product: ["productName", "users", "totalUsers"],
  rating: ["rating", "mappings", "totalMappings"],
};

const ratingOptions = Array.from({ length: 10 }, (_, index) => ({
  id: index + 1,
  name: `${index + 1}`,
}));

const UserMapWithProduct = () => {
  const dispatch = useDispatch();
  const { userId } = useParams();

  const {
    isOpen: isFormOpen,
    onOpen: onFormOpen,
    onOpenChange: onFormOpenChange,
    onClose: onFormClose,
  } = useDisclosure();

  const {
    isOpen: isDeleteOpen,
    onOpen: onDeleteOpen,
    onOpenChange: onDeleteOpenChange,
    onClose: onDeleteClose,
  } = useDisclosure();

  const listApiData = useSelector(
    (state) => state.operation.userMappedWithProductList,
  );

  const loading = useSelector(
    (state) => state.operation.userProductMappingLoading,
  );

  const allLeadUser = useSelector(
    (state) => state?.leads?.usersList || state?.common?.usersList,
  );

  const solutionList = useSelector(
    (state) => state.product.solutionListByUserId,
  );

  const authUserId = useSelector((state) => state?.auth?.user?.id);

  const loginUserId =
    Number(userId) ||
    Number(authUserId) ||
    Number(JSON.parse(localStorage.getItem("user") || "{}")?.id);

  const [groupedApiData, setGroupedApiData] = React.useState([]);
  const [groupedLoading, setGroupedLoading] = React.useState(false);

  const [editId, setEditId] = React.useState(null);
  const [deleteId, setDeleteId] = React.useState(null);

  const [filterValue, setFilterValue] = React.useState("");
  const [selectedKeys, setSelectedKeys] = React.useState(new Set([]));

  const [viewMode, setViewMode] = React.useState("list");

  const [visibleColumns, setVisibleColumns] = React.useState(
    new Set(INITIAL_VISIBLE_COLUMNS_BY_VIEW.list),
  );

  const [rowsPerPage, setRowsPerPage] = React.useState(50);
  const [sortDescriptor, setSortDescriptor] = React.useState({
    column: "userName",
    direction: "ascending",
  });
  const [page, setPage] = React.useState(1);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      userId: "",
      productId: "",
      rating: "",
    },
  });

  const hasSearchFilter = Boolean(filterValue);
  const isTableLoading = loading === "pending" || groupedLoading;

  const activeListData = React.useMemo(() => {
    return (listApiData || []).filter((item) => !item?.deleted);
  }, [listApiData]);

  const getCompositeKey = React.useCallback((item) => {
    return `${Number(item?.userId)}-${Number(item?.productId)}-${Number(
      item?.rating,
    )}`;
  }, []);

  const listMapByUserProductRating = React.useMemo(() => {
    const map = new Map();

    activeListData.forEach((item) => {
      map.set(getCompositeKey(item), item);
    });

    return map;
  }, [activeListData, getCompositeKey]);

  const fetchListData = React.useCallback(() => {
    dispatch(getAllUserMappedWithProduct());
  }, [dispatch]);

  const fetchGroupedData = React.useCallback(
    async (selectedGroupBy = "user") => {
      if (selectedGroupBy === "list") return;

      try {
        setGroupedLoading(true);

        const response = await dispatch(
          getGroupedUserMappedWithProduct(selectedGroupBy),
        ).unwrap();

        setGroupedApiData(Array.isArray(response) ? response : []);
      } catch (error) {
        setGroupedApiData([]);

        addToast({
          title: "Error",
          description:
            error?.message ||
            error?.response?.data?.message ||
            "Failed to fetch grouped user product mappings",
          color: "danger",
        });
      } finally {
        setGroupedLoading(false);
      }
    },
    [dispatch],
  );

  useEffect(() => {
    fetchListData();
    dispatch(getAllUsers());

    if (loginUserId) {
      dispatch(getAllSolutionsByUserId(loginUserId));
    }
  }, [dispatch, fetchListData, loginUserId]);

  useEffect(() => {
    if (viewMode !== "list") {
      fetchGroupedData(viewMode);
    }
  }, [fetchGroupedData, viewMode]);

  useEffect(() => {
    setVisibleColumns(new Set(INITIAL_VISIBLE_COLUMNS_BY_VIEW[viewMode]));
    setFilterValue("");
    setPage(1);
  }, [viewMode]);

  const userOptions = React.useMemo(() => {
    return (allLeadUser || []).map((user) => ({
      ...user,
      fullName:
        user.fullName ||
        user.userName ||
        user.name ||
        `${user.firstName || ""} ${user.lastName || ""}`.trim() ||
        user.email ||
        "NA",
    }));
  }, [allLeadUser]);

  const productOptions = React.useMemo(() => {
    return (solutionList || []).map((item) => ({
      ...item,
      productLabel: item.name || item.solutionName || item.productName || "NA",
    }));
  }, [solutionList]);

  const activeColumns = React.useMemo(() => {
    return TABLE_COLUMNS[viewMode] || TABLE_COLUMNS.list;
  }, [viewMode]);

  const headerColumns = React.useMemo(() => {
    if (visibleColumns === "all") return activeColumns;

    return activeColumns.filter((column) =>
      Array.from(visibleColumns).includes(column.uid),
    );
  }, [visibleColumns, activeColumns]);

  const getListRecordForGroupedItem = React.useCallback(
    (item) => {
      if (!item) return null;

      const exactRecord = listMapByUserProductRating.get(getCompositeKey(item));

      if (exactRecord) return exactRecord;

      return activeListData.find(
        (record) =>
          Number(record?.userId) === Number(item?.userId) &&
          Number(record?.productId) === Number(item?.productId),
      );
    },
    [activeListData, getCompositeKey, listMapByUserProductRating],
  );

  const getItemWithListId = React.useCallback(
    (item) => {
      const listRecord = getListRecordForGroupedItem(item);

      return {
        ...item,
        id: listRecord?.id,
        createdBy: listRecord?.createdBy,
        updatedBy: listRecord?.updatedBy,
        createdDate: listRecord?.createdDate,
        updatedDate: listRecord?.updatedDate,
        deleted: listRecord?.deleted,
      };
    },
    [getListRecordForGroupedItem],
  );

  const tableData = React.useMemo(() => {
    if (viewMode === "list") {
      return activeListData;
    }

    if (viewMode === "user") {
      return (groupedApiData || []).map((user) => ({
        ...user,
        products: (user?.products || []).map((product) =>
          getItemWithListId({
            userId: user?.userId,
            userName: user?.userName,
            productId: product?.productId,
            productName: product?.productName,
            rating: product?.rating,
          }),
        ),
      }));
    }

    if (viewMode === "product") {
      return (groupedApiData || []).map((product) => ({
        ...product,
        users: (product?.users || []).map((user) =>
          getItemWithListId({
            userId: user?.userId,
            userName: user?.userName,
            productId: product?.productId,
            productName: product?.productName,
            rating: user?.rating,
          }),
        ),
      }));
    }

    if (viewMode === "rating") {
      return (groupedApiData || []).map((ratingGroup) => ({
        ...ratingGroup,
        mappings: (ratingGroup?.mappings || []).map((mapping) =>
          getItemWithListId({
            userId: mapping?.userId,
            userName: mapping?.userName,
            productId: mapping?.productId,
            productName: mapping?.productName,
            rating: ratingGroup?.rating,
          }),
        ),
      }));
    }

    return activeListData;
  }, [viewMode, activeListData, groupedApiData, getItemWithListId]);

  const handleViewModeChange = React.useCallback((keys) => {
    const selectedValue = Array.from(keys)?.[0];

    if (!selectedValue) return;

    setViewMode(selectedValue);
    setFilterValue("");
    setPage(1);
  }, []);

  const getSearchText = React.useCallback(
    (item) => {
      if (viewMode === "list") {
        return [
          item?.id,
          item?.userId,
          item?.userName,
          item?.productId,
          item?.productName,
          item?.rating,
        ]
          .filter(Boolean)
          .join(" ");
      }

      if (viewMode === "user") {
        return [
          item?.userName,
          item?.userId,
          ...(item?.products || []).flatMap((product) => [
            product?.productName,
            product?.productId,
            product?.rating,
          ]),
        ]
          .filter(Boolean)
          .join(" ");
      }

      if (viewMode === "product") {
        return [
          item?.productName,
          item?.productId,
          ...(item?.users || []).flatMap((user) => [
            user?.userName,
            user?.userId,
            user?.rating,
          ]),
        ]
          .filter(Boolean)
          .join(" ");
      }

      if (viewMode === "rating") {
        return [
          item?.rating,
          ...(item?.mappings || []).flatMap((mapping) => [
            mapping?.userName,
            mapping?.userId,
            mapping?.productName,
            mapping?.productId,
          ]),
        ]
          .filter(Boolean)
          .join(" ");
      }

      return "";
    },
    [viewMode],
  );

  const filteredItems = React.useMemo(() => {
    let filteredData = [...(tableData || [])];

    if (hasSearchFilter) {
      filteredData = filteredData.filter((item) =>
        getSearchText(item).toLowerCase().includes(filterValue.toLowerCase()),
      );
    }

    return filteredData;
  }, [tableData, filterValue, hasSearchFilter, getSearchText]);

  const count = filteredItems.length;
  const pages = Math.ceil(count / rowsPerPage) || 1;

  const items = React.useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    const end = start + rowsPerPage;

    return filteredItems.slice(start, end);
  }, [page, filteredItems, rowsPerPage]);

  const sortedItems = React.useMemo(() => {
    return [...items];
  }, [sortDescriptor, items]);

  const getErrorMessage = (error) => {
    if (!error) return "Something went wrong";

    if (typeof error === "string") return error;

    return (
      error?.message ||
      error?.error ||
      error?.errorMessage ||
      error?.details ||
      error?.response?.data?.message ||
      "Something went wrong"
    );
  };

  const normalizeIds = (value) => {
    if (!value) return [];

    if (Array.isArray(value)) {
      return value.map(Number);
    }

    if (value instanceof Set) {
      return Array.from(value).map(Number);
    }

    return [Number(value)];
  };

  const buildPayload = (formData) => {
    return {
      userIds: [Number(formData.userId)],
      productIds: normalizeIds(formData.productId),
      rating: Number(formData.rating),
      createdBy: Number(loginUserId),
      updatedBy: Number(loginUserId),
    };
  };

  const refreshList = React.useCallback(() => {
    fetchListData();

    if (viewMode !== "list") {
      fetchGroupedData(viewMode);
    }
  }, [fetchListData, fetchGroupedData, viewMode]);

  const handleOpenCreateModal = React.useCallback(() => {
    setEditId(null);

    reset({
      userId: "",
      productId: "",
      rating: "",
    });

    onFormOpen();
  }, [reset, onFormOpen]);

  const handleEditMapping = React.useCallback(
    (mapping) => {
      if (!mapping?.id) {
        addToast({
          title: "Error",
          description: "Mapping id not found from list API.",
          color: "danger",
        });
        return;
      }

      setEditId(mapping.id);

      reset({
        userId: mapping.userId || "",
        productId: mapping.productId ? [mapping.productId] : [],
        rating: mapping.rating || "",
      });

      onFormOpen();
    },
    [reset, onFormOpen],
  );

  const handleCloseFormModal = React.useCallback(() => {
    setEditId(null);

    reset({
      userId: "",
      productId: "",
      rating: "",
    });

    onFormClose();
  }, [reset, onFormClose]);

  const onSubmit = async (formData) => {
    const payload = buildPayload(formData);

    if (editId) {
      dispatch(updateUserProductMapping({ id: editId, payload }))
        .then((res) => {
          if (res.meta.requestStatus === "fulfilled") {
            addToast({
              title: "Success",
              description: "User product mapping updated successfully",
              color: "success",
            });

            handleCloseFormModal();
            refreshList();
          } else {
            addToast({
              title: "Error",
              description:
                res.payload?.message || "Failed to update user product mapping",
              color: "danger",
            });
          }
        })
        .catch(() => {
          addToast({
            title: "Error",
            description: "Something went wrong !.",
            color: "danger",
          });
        });

      return;
    }

    dispatch(createUserProductMapping(payload))
      .then((resp) => {
        if (resp.meta.requestStatus === "fulfilled") {
          addToast({
            title: "Success",
            description: "User product mapping created successfully",
            color: "success",
          });

          handleCloseFormModal();
          refreshList();
        } else {
          addToast({
            title: "Error",
            description:
              resp.payload?.message || "Failed to create user product mapping",
            color: "danger",
          });
        }
      })
      .catch(() => {
        addToast({
          title: "Error",
          description: "Something went wrong !.",
          color: "danger",
        });
      });
  };

  const handleOpenDeleteModal = React.useCallback(
    (mapping) => {
      if (!mapping?.id) {
        addToast({
          title: "Error",
          description: "Mapping id not found from list API.",
          color: "danger",
        });
        return;
      }

      setDeleteId(mapping.id);
      onDeleteOpen();
    },
    [onDeleteOpen],
  );

  const handleConfirmDelete = async () => {
    if (!deleteId) return;

    try {
      await dispatch(deleteUserProductMapping(deleteId)).unwrap();

      addToast({
        title: "Deleted",
        description: "User product mapping deleted successfully",
        color: "success",
      });

      setDeleteId(null);
      onDeleteClose();
      refreshList();
    } catch (error) {
      addToast({
        title: "Error",
        description: getErrorMessage(error),
        color: "danger",
      });
    }
  };

  const handleCancelDelete = React.useCallback(() => {
    setDeleteId(null);
    onDeleteClose();
  }, [onDeleteClose]);

  const renderList = React.useCallback((list = [], renderItem) => {
    if (!list?.length) return "NA";

    return (
      <div className="flex max-w-[620px] flex-wrap gap-2">
        {list.map((item, index) => (
          <div
            key={`${item?.id || item?.userId || item?.productId || index}`}
            className="rounded-lg bg-default-100 px-3 py-1 text-xs text-default-700"
          >
            {renderItem(item)}
          </div>
        ))}
      </div>
    );
  }, []);

  const getMappingsForActions = React.useCallback(
    (rowData) => {
      if (viewMode === "list") {
        return rowData ? [rowData] : [];
      }

      if (viewMode === "user") {
        return rowData?.products || [];
      }

      if (viewMode === "product") {
        return rowData?.users || [];
      }

      if (viewMode === "rating") {
        return rowData?.mappings || [];
      }

      return [];
    },
    [viewMode],
  );

  const renderCell = React.useCallback(
    (rowData, columnKey) => {
      switch (columnKey) {
        case "userName":
          return (
            <User
              name={rowData?.userName || "NA"}
              description={rowData?.userId ? `ID: ${rowData.userId}` : ""}
            />
          );

        case "productName":
          return (
            <div>
              <p className="text-[12.5px] font-medium text-foreground">
                {rowData?.productName || "NA"}
              </p>

              {rowData?.productId && (
                <p className="text-[11.5px] text-default-500">
                  ID: {rowData.productId}
                </p>
              )}
            </div>
          );

        case "products":
          return renderList(rowData?.products, (product) => (
            <>
              <span className="font-medium">
                {product?.productName || "NA"}
              </span>
              <span className="text-default-500">
                {" "}
                • Rating: {product?.rating || "NA"}
              </span>
            </>
          ));

        case "users":
          return renderList(rowData?.users, (user) => (
            <>
              <span className="font-medium">{user?.userName || "NA"}</span>
              <span className="text-default-500">
                {" "}
                • Rating: {user?.rating || "NA"}
              </span>
            </>
          ));

        case "rating":
          return (
            <span className="rounded-lg bg-primary/10 px-3 py-1 text-[12.5px] font-semibold text-primary">
              {rowData?.rating || "NA"}
            </span>
          );

        case "mappings":
          return renderList(rowData?.mappings, (mapping) => (
            <>
              <span className="font-medium">{mapping?.userName || "NA"}</span>
              <span className="text-default-500">
                {" "}
                • {mapping?.productName || "NA"}
              </span>
            </>
          ));

        case "totalProducts":
          return rowData?.products?.length || 0;

        case "totalUsers":
          return rowData?.users?.length || 0;

        case "totalMappings":
          return rowData?.mappings?.length || 0;

        case "actions": {
          const mappings = getMappingsForActions(rowData);

          if (!mappings.length) return "NA";

          if (viewMode === "list") {
            const mapping = mappings[0];

            return (
              <div className="flex items-center gap-2">
                <Button
                  isIconOnly
                  size="sm"
                  variant="flat"
                  color="primary"
                  onPress={() => handleEditMapping(mapping)}
                >
                  <Pencil size={15} />
                </Button>

                <Button
                  isIconOnly
                  size="sm"
                  variant="flat"
                  color="danger"
                  onPress={() => handleOpenDeleteModal(mapping)}
                >
                  <Trash2 size={15} />
                </Button>
              </div>
            );
          }

          return (
            <div className="flex max-w-[460px] flex-col gap-2">
              {mappings.map((mapping, index) => (
                <div
                  key={`${mapping?.id || index}`}
                  className="flex items-center justify-between gap-3 rounded-lg border border-default-200 bg-default-50 px-3 py-2"
                >
                  <div className="min-w-0">
                    <p className="truncate text-xs font-medium text-default-700">
                      {mapping?.userName || "NA"}
                    </p>

                    <p className="truncate text-xs text-default-500">
                      {mapping?.productName || "NA"} • Rating:{" "}
                      {mapping?.rating || rowData?.rating || "NA"}
                    </p>
                  </div>

                  <div className="flex shrink-0 items-center gap-2">
                    <Button
                      isIconOnly
                      size="sm"
                      variant="flat"
                      color="primary"
                      onPress={() => handleEditMapping(mapping)}
                    >
                      <Pencil size={15} />
                    </Button>

                    <Button
                      isIconOnly
                      size="sm"
                      variant="flat"
                      color="danger"
                      onPress={() => handleOpenDeleteModal(mapping)}
                    >
                      <Trash2 size={15} />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          );
        }

        default:
          return rowData?.[columnKey] || "NA";
      }
    },
    [
      viewMode,
      renderList,
      getMappingsForActions,
      handleEditMapping,
      handleOpenDeleteModal,
    ],
  );

  const getRowKey = React.useCallback(
    (item, index) => {
      if (viewMode === "list") return `mapping-${item?.id || index}`;
      if (viewMode === "user") return `user-${item?.userId || index}`;
      if (viewMode === "product") return `product-${item?.productId || index}`;
      if (viewMode === "rating") return `rating-${item?.rating || index}`;

      return index;
    },
    [viewMode],
  );

  const onNextPage = React.useCallback(() => {
    if (page < pages) {
      setPage(page + 1);
    }
  }, [page, pages]);

  const onPreviousPage = React.useCallback(() => {
    if (page > 1) {
      setPage(page - 1);
    }
  }, [page]);

  const onRowsPerPageChange = React.useCallback((e) => {
    setRowsPerPage(Number(e.target.value));
    setPage(1);
  }, []);

  const onSearchChange = React.useCallback((value) => {
    if (value) {
      setFilterValue(value);
      setPage(1);
    } else {
      setFilterValue("");
    }
  }, []);

  const onClear = React.useCallback(() => {
    setFilterValue("");
    setPage(1);
  }, []);

  const topContent = React.useMemo(() => {
    const selectedViewLabel =
      VIEW_OPTIONS.find((item) => item.key === viewMode)?.label || "List";

    return (
      <div className="flex flex-col gap-2">
        <div className="flex justify-between gap-2 items-center flex-wrap">
          <Input
            isClearable
            size="sm"
            className="w-full sm:max-w-[280px]"
            classNames={{ inputWrapper: "h-8 min-h-8" }}
            placeholder="Search ..."
            startContent={<Search className="w-4 h-4 text-default-400" />}
            value={filterValue}
            onClear={onClear}
            onValueChange={onSearchChange}
          />

          <div className="flex gap-1.5 flex-wrap">
            <Button
              size="sm"
              color="primary"
              startContent={<Plus className="w-3.5 h-3.5" />}
              onPress={handleOpenCreateModal}
            >
              Add Mapping
            </Button>

            <Dropdown>
              <DropdownTrigger>
                <Button
                  size="sm"
                  variant="flat"
                  endContent={<ChevronDown className="w-3.5 h-3.5" />}
                >
                  View: {selectedViewLabel}
                </Button>
              </DropdownTrigger>

              <DropdownMenu
                disallowEmptySelection
                aria-label="View Mode"
                selectionMode="single"
                selectedKeys={new Set([viewMode])}
                onSelectionChange={handleViewModeChange}
              >
                {VIEW_OPTIONS.map((item) => (
                  <DropdownItem key={item.key}>{item.label}</DropdownItem>
                ))}
              </DropdownMenu>
            </Dropdown>

            <Dropdown>
              <DropdownTrigger>
                <Button
                  size="sm"
                  variant="flat"
                  endContent={<ChevronDown className="w-3.5 h-3.5" />}
                >
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
                {activeColumns.map((column) => (
                  <DropdownItem key={column.uid} className="capitalize">
                    {capitalize(column.name)}
                  </DropdownItem>
                ))}
              </DropdownMenu>
            </Dropdown>
          </div>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-default-400 text-[12.5px]">
            Total {count} {viewMode === "list" ? "records" : "grouped records"}
          </span>

          <label className="flex items-center gap-1 text-default-400 text-[12.5px]">
            Rows per page:
            <select
              className="bg-transparent outline-hidden text-default-400 text-[12.5px] cursor-pointer"
              onChange={onRowsPerPageChange}
              value={rowsPerPage}
            >
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
    onRowsPerPageChange,
    count,
    onSearchChange,
    onClear,
    rowsPerPage,
    viewMode,
    activeColumns,
    handleViewModeChange,
    handleOpenCreateModal,
  ]);

  const bottomContent = React.useMemo(() => {
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
          page={page}
          total={pages}
          onChange={setPage}
        />

        <div className="hidden sm:flex w-[30%] justify-end gap-2">
          <Button
            isDisabled={pages === 1}
            size="sm"
            variant="flat"
            onPress={onPreviousPage}
          >
            Previous
          </Button>

          <Button
            isDisabled={pages === 1}
            size="sm"
            variant="flat"
            onPress={onNextPage}
          >
            Next
          </Button>
        </div>
      </div>
    );
  }, [selectedKeys, count, page, pages, onPreviousPage, onNextPage]);

  return (
    <div className="flex flex-col gap-2">
      <h1 className="font-sans text-lg font-semibold mb-2 shrink-0">
        User's product mapped list
      </h1>

      <Table
        isHeaderSticky
        removeWrapper={false}
        aria-label="User product mapping table"
        bottomContent={bottomContent}
        bottomContentPlacement="outside"
        classNames={{
          base: "gap-2.5",
          wrapper:
            "max-h-[calc(100vh-280px)] w-full overflow-y-auto rounded-lg border border-gray-200 dark:border-white/10 shadow-none p-0",
          table: "w-full",
          thead: "[&>tr]:first:rounded-none",
          th: "h-8 py-0 text-[11.5px] tracking-wide bg-gray-50 dark:bg-neutral-900 text-default-500 first:rounded-none last:rounded-none border-b border-gray-200 dark:border-white/10",
          td: "py-1.5 text-[12.5px]",
        }}
        sortDescriptor={sortDescriptor}
        topContent={topContent}
        topContentPlacement="outside"
        onSelectionChange={setSelectedKeys}
        onSortChange={setSortDescriptor}
      >
        <TableHeader columns={headerColumns}>
          {(column) => (
            <TableColumn key={column.uid} allowsSorting={column.sortable}>
              {column.name}
            </TableColumn>
          )}
        </TableHeader>

        <TableBody
          emptyContent={isTableLoading ? "Loading..." : "No data found"}
          items={sortedItems}
        >
          {(item) => (
            <TableRow
              key={getRowKey(item, sortedItems.indexOf(item))}
              className="border-y-1 border-gray-100"
            >
              {(columnKey) => (
                <TableCell>{renderCell(item, columnKey)}</TableCell>
              )}
            </TableRow>
          )}
        </TableBody>
      </Table>

      <Modal
        isOpen={isFormOpen}
        onOpenChange={onFormOpenChange}
        placement="center"
        size="2xl"
      >
        <ModalContent>
          {() => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                {editId
                  ? "Update User Product Mapping"
                  : "Create User Product Mapping"}
              </ModalHeader>

              <form onSubmit={handleSubmit(onSubmit)}>
                <ModalBody>
                  <div className="grid grid-cols-1 gap-4">
                    <Controller
                      name="userId"
                      control={control}
                      rules={{ required: "please select assignee" }}
                      render={({ field }) => (
                        <NewSelect
                          isRequired
                          data={userOptions || []}
                          label="Select assignee"
                          name="userId"
                          labelKey="fullName"
                          valueKey="id"
                          value={field.value}
                          onChange={(selectedValue) => {
                            field.onChange(selectedValue);
                          }}
                          isInvalid={!!errors.userId}
                          errorMessage={errors.userId?.message}
                        />
                      )}
                    />

                    <Controller
                      name="productId"
                      control={control}
                      rules={{ required: "please select service" }}
                      render={({ field }) => (
                        <NewSelect
                          isRequired
                          selectionMode="multiple"
                          data={productOptions || []}
                          label="Select service"
                          name="productId"
                          labelKey="productLabel"
                          valueKey="id"
                          value={field.value}
                          onChange={(selectedValue) => {
                            field.onChange(selectedValue);
                          }}
                          isInvalid={!!errors.productId}
                          errorMessage={errors.productId?.message}
                        />
                      )}
                    />

                    <Controller
                      name="rating"
                      control={control}
                      rules={{ required: "please select rating" }}
                      render={({ field }) => (
                        <NewSelect
                          isRequired
                          data={ratingOptions}
                          label="Select rating"
                          name="rating"
                          labelKey="name"
                          valueKey="id"
                          value={field.value}
                          onChange={(selectedValue) => {
                            field.onChange(selectedValue);
                          }}
                          isInvalid={!!errors.rating}
                          errorMessage={errors.rating?.message}
                        />
                      )}
                    />
                  </div>
                </ModalBody>

                <ModalFooter>
                  <Button
                    type="button"
                    variant="flat"
                    color="danger"
                    onPress={handleCloseFormModal}
                  >
                    Cancel
                  </Button>

                  <Button
                    color="primary"
                    type="submit"
                    isLoading={loading === "pending"}
                  >
                    {editId ? "Update" : "Create"}
                  </Button>
                </ModalFooter>
              </form>
            </>
          )}
        </ModalContent>
      </Modal>

      <Modal
        isOpen={isDeleteOpen}
        onOpenChange={onDeleteOpenChange}
        placement="center"
        size="md"
      >
        <ModalContent>
          {() => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                Confirm Delete
              </ModalHeader>

              <ModalBody>
                <p className="text-sm text-default-600">
                  Are you sure you want to delete this user product mapping?
                  This action cannot be undone.
                </p>
              </ModalBody>

              <ModalFooter>
                <Button variant="flat" onPress={handleCancelDelete}>
                  Cancel
                </Button>

                <Button
                  color="danger"
                  onPress={handleConfirmDelete}
                  isLoading={loading === "pending"}
                >
                  Delete
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
};

export default UserMapWithProduct;
