import React, { useCallback, useEffect, useMemo, useState } from "react";
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
  useDisclosure,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Textarea,
  addToast,
} from "@heroui/react";
import { ChevronDown, EllipsisVertical, Plus, Search } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import {
  addApplicantType,
  getApplicantTypeList,
  editApplicantType,
  deleteApplicantType,
} from "../../toolkit/slices/settingSlice";

export const columns = [
  { name: "ID", uid: "id", sortable: true },
  { name: "NAME", uid: "name" },
  { name: "DESCRIPTION", uid: "description" },
  { name: "ACTIONS", uid: "actions" },
];

export function capitalize(s) {
  return s ? s.charAt(0).toUpperCase() + s.slice(1).toLowerCase() : "";
}

const INITIAL_VISIBLE_COLUMNS = ["id", "name", "description", "actions"];

const ApplicantTypes = () => {
  const dispatch = useDispatch();
  const { isOpen, onClose, onOpen, onOpenChange } = useDisclosure();
  const modal = useDisclosure();

  const data = useSelector((state) => state.setting.applicantTypeList);
  const count = data?.length || 0;

  const [filterValue, setFilterValue] = useState("");
  const [selectedKeys, setSelectedKeys] = useState(new Set([]));
  const [visibleColumns, setVisibleColumns] = useState(
    new Set(INITIAL_VISIBLE_COLUMNS),
  );

  const [rowsPerPage, setRowsPerPage] = useState(50);
  const [sortDescriptor, setSortDescriptor] = useState({
    column: "id",
    direction: "ascending",
  });
  const [page, setPage] = useState(1);

  const [isEdit, setIsEdit] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
  });

  const [deleteId, setDeleteId] = useState(null);

  useEffect(() => {
    dispatch(getApplicantTypeList({ page, size: rowsPerPage }));
  }, [dispatch, page, rowsPerPage]);

  const headerColumns = useMemo(() => {
    if (visibleColumns === "all") return columns;
    return columns.filter((column) =>
      Array.from(visibleColumns).includes(column.uid),
    );
  }, [visibleColumns]);

  const filteredItems = useMemo(() => {
    if (!filterValue) return data || [];
    return (data || []).filter((item) =>
      item.name.toLowerCase().includes(filterValue.toLowerCase()),
    );
  }, [data, filterValue]);

  const pages = Math.ceil(count / rowsPerPage) || 1;

  const items = useMemo(() => {
    return filteredItems.slice((page - 1) * rowsPerPage, page * rowsPerPage);
  }, [filteredItems, page, rowsPerPage]);

  const sortedItems = useMemo(() => {
    return [...items].sort((a, b) => {
      const first = a[sortDescriptor.column];
      const second = b[sortDescriptor.column];
      const cmp = first < second ? -1 : first > second ? 1 : 0;
      return sortDescriptor.direction === "descending" ? -cmp : cmp;
    });
  }, [items, sortDescriptor]);

  const handleEdit = (item) => {
    setIsEdit(item.id);
    setFormData({
      name: item.name,
      description: item.description,
    });
    onOpen();
  };

  const handleSubmit = () => {
    if (!formData.name || !formData.description) {
      addToast({ title: "All fields required", color: "danger" });
      return;
    }

    if (isEdit) {
      dispatch(editApplicantType({ id: isEdit, ...formData }))
        .then((resp) => {
          if (resp.meta.requestStatus === "fulfilled") {
            addToast({ title: "Updated successfully", color: "success" });
            onClose();
            setIsEdit(null);
            setFormData({ name: "", description: "" });
            dispatch(getApplicantTypeList({ page, size: rowsPerPage }));
          }
        })
        .catch(() =>
          addToast({ title: "Something went wrong", color: "danger" }),
        );
    } else {
      dispatch(addApplicantType(formData))
        .then((resp) => {
          if (resp.meta.requestStatus === "fulfilled") {
            addToast({ title: "Created successfully", color: "success" });
            onClose();
            setFormData({ name: "", description: "" });
            dispatch(getApplicantTypeList({ page, size: rowsPerPage }));
          }
        })
        .catch(() =>
          addToast({ title: "Something went wrong", color: "danger" }),
        );
    }
  };

  const handleDelete = () => {
    dispatch(deleteApplicantType(deleteId))
      .then((resp) => {
        console.log("FrontEnd Check", resp)
        if (resp.meta.requestStatus === "fulfilled") {
          addToast({
            title: "Applicant deleted successfully !.",
            color: "success",
          });
          modal.onOpenChange(false);
          setDeleteId(null);
          dispatch(getApplicantTypeList({ page, size: rowsPerPage }));
        } else {
          addToast({ title: resp.payload.data.errorCode, description: resp.payload.data.message, color: "danger" });
        }
      })
      .catch(() =>
        addToast({ title: "Something went wrong !.", color: "danger" }),
      );
  };

  const renderCell = useCallback((rowData, columnKey) => {
    switch (columnKey) {
      case "actions":
        return (
          <Dropdown>
            <DropdownTrigger>
              <Button isIconOnly size="sm" variant="light">
                <EllipsisVertical />
              </Button>
            </DropdownTrigger>
            <DropdownMenu>
              <DropdownItem onClick={() => handleEdit(rowData)}>
                Edit
              </DropdownItem>
              <DropdownItem
                color="danger"
                onClick={() => {
                  modal.onOpen();
                  setDeleteId(rowData.id);
                }}
              >
                Delete
              </DropdownItem>
            </DropdownMenu>
          </Dropdown>
        );
      default:
        return rowData[columnKey];
    }
  }, []);

  const onNextPage = useCallback(() => {
    if (page < pages) setPage(page + 1);
  }, [page, pages]);

  const onPreviousPage = useCallback(() => {
    if (page > 1) setPage(page - 1);
  }, [page]);

  const onRowsPerPageChange = useCallback((e) => {
    setRowsPerPage(Number(e.target.value));
    setPage(1);
  }, []);

  const topContent = useMemo(() => {
    return (
      <div className="flex flex-col gap-4">
        <div className="flex justify-between gap-3 items-end">
          <Input
            isClearable
            className="w-full sm:max-w-[35%]"
            placeholder="Search ..."
            startContent={<Search />}
            value={filterValue}
            onClear={() => setFilterValue("")}
            onValueChange={setFilterValue}
          />
          <div className="flex gap-3">
            <Dropdown>
              <DropdownTrigger className="hidden sm:flex">
                <Button
                  endContent={<ChevronDown className="text-small" />}
                  variant="flat"
                >
                  Columns
                </Button>
              </DropdownTrigger>
              <DropdownMenu
                disallowEmptySelection
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
              onPress={() => {
                setIsEdit(null);
                setFormData({ name: "", description: "" });
                onOpen();
              }}
              endContent={<Plus />}
            >
              Add New
            </Button>
          </div>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-default-400 text-small">
            Total {count} items
          </span>
          <label className="flex items-center text-default-400 text-small">
            Rows per page:
            <select
              className="bg-transparent outline-hidden text-default-400 text-small"
              onChange={onRowsPerPageChange}
            >
              <option value="15">15</option>
              <option value="25">25</option>
              <option value="50">50</option>
            </select>
          </label>
        </div>
      </div>
    );
  }, [filterValue, visibleColumns, count]);

  const bottomContent = useMemo(() => {
    return (
      <div className="py-2 px-2 flex justify-between items-center">
        <span className="w-[30%] text-small text-default-400">
          {selectedKeys === "all"
            ? "All items selected"
            : `${selectedKeys.size} of ${count} selected`}
        </span>

        <Pagination
          isCompact
          showControls
          showShadow
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
  }, [selectedKeys, count, page, pages]);

  return (
    <>
      <h1 className="font-semibold text-2xl mb-2">Applicant list</h1>

      <Table
        isHeaderSticky
        classNames={{ wrapper: "max-h-[60vh]" }}
        sortDescriptor={sortDescriptor}
        onSortChange={setSortDescriptor}
        topContent={topContent}
        bottomContent={bottomContent}
        bottomContentPlacement="outside"
        topContentPlacement="outside"
        onSelectionChange={setSelectedKeys}
      >
        <TableHeader columns={headerColumns}>
          {(column) => (
            <TableColumn key={column.uid}>{column.name}</TableColumn>
          )}
        </TableHeader>

        <TableBody items={sortedItems || []}>
          {(item) => (
            <TableRow key={item.id}>
              {(columnKey) => (
                <TableCell>{renderCell(item, columnKey)}</TableCell>
              )}
            </TableRow>
          )}
        </TableBody>
      </Table>

      <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
        <ModalContent>
          <ModalHeader>
            {isEdit ? "Edit applicant type" : "Add applicant type"}
          </ModalHeader>

          <ModalBody>
            <Input
              label="Name"
              isRequired
              errorMessage="Please enter Name"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
            />

            <Textarea
              label="Description"
              isRequired
              errorMessage="Please enter Description"
              value={formData.description}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  description: e.target.value,
                })
              }
            />
          </ModalBody>

          <ModalFooter>
            <Button onPress={onClose}>Cancel</Button>
            <Button color="primary" onPress={handleSubmit}>
              Submit
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <Modal
        isOpen={modal.isOpen}
        backdrop="blur"
        onOpenChange={modal.onOpenChange}
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader>Delete</ModalHeader>
              <ModalBody>Are you sure to delete the item ?</ModalBody>
              <ModalFooter>
                <Button variant="light" onPress={onClose}>
                  Cancel
                </Button>
                <Button color="danger" onPress={handleDelete}>
                  Delete
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
};

export default ApplicantTypes;
