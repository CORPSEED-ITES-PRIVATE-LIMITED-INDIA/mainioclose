import {
  addToast,
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
} from "@heroui/react";
import { EllipsisVertical, Search } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  getAllUserMailConfigs,
  updateUserMailConfig,
} from "../toolkit/slices/commonSlice";

const columns = [
  { name: "USER", uid: "userName" },
  { name: "USER EMAIL", uid: "userEmail" },
  { name: "FROM EMAIL", uid: "fromEmail" },
  { name: "FROM NAME", uid: "fromName" },
  { name: "SMTP HOST", uid: "smtpHost" },
  { name: "SMTP PORT", uid: "smtpPort" },
  { name: "STATUS", uid: "active" },
  { name: "ACTIONS", uid: "actions" },
];

const UserMailConfig = () => {
  const dispatch = useDispatch();

  const data = useSelector((state) => state.common.userMailConfigs || []);

  const updateModal = useDisclosure();

  const [filterValue, setFilterValue] = useState("");
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState({
    userId: "",
    fromEmail: "",
    fromName: "",
    smtpHost: "smtppro.zoho.in",
    smtpPort: 465,
    smtpUsername: "",
    smtpPassword: "",
    authEnabled: true,
    starttlsEnabled: true,
    active: true,
  });

  useEffect(() => {
    dispatch(getAllUserMailConfigs());
  }, [dispatch]);

  const filteredItems = useMemo(() => {
    let items = [...data];

    if (filterValue) {
      items = items.filter((item) =>
        Object.values(item).some((value) =>
          String(value || "")
            .toLowerCase()
            .includes(filterValue.toLowerCase()),
        ),
      );
    }

    return items;
  }, [data, filterValue]);

  const pages = Math.ceil(filteredItems.length / rowsPerPage) || 1;

  const paginatedItems = useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    return filteredItems.slice(start, start + rowsPerPage);
  }, [filteredItems, page, rowsPerPage]);

  const handleChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const openUpdateModal = (rowData) => {
    setFormData({
      userId: rowData?.userId || "",
      fromEmail: rowData?.fromEmail || "",
      fromName: rowData?.fromName || "",
      smtpHost: rowData?.smtpHost || "smtppro.zoho.in",
      smtpPort: rowData?.smtpPort || 465,
      smtpUsername: rowData?.smtpUsername || "",
      smtpPassword: "",
      authEnabled: rowData?.authEnabled ?? true,
      starttlsEnabled: rowData?.starttlsEnabled ?? true,
      active: rowData?.active ?? true,
    });

    setShowPassword(false);
    updateModal.onOpen();
  };

  const handleUpdate = () => {
    const payload = {
      fromEmail: formData.fromEmail,
      fromName: formData.fromName,
      smtpHost: formData.smtpHost,
      smtpPort: Number(formData.smtpPort),
      smtpUsername: formData.smtpUsername,
      smtpPassword: formData.smtpPassword,
      authEnabled: formData.authEnabled,
      starttlsEnabled: formData.starttlsEnabled,
      active: formData.active,
    };

    dispatch(updateUserMailConfig({ userId: formData.userId, payload }))
      .then((resp) => {
        if (resp.meta.requestStatus === "fulfilled") {
          addToast({
            title: "Mail configuration updated successfully!",
            color: "success",
          });

          updateModal.onClose();
          dispatch(getAllUserMailConfigs());
        } else {
          addToast({
            title: "Something went wrong while updating mail config!",
            color: "danger",
          });
        }
      })
      .catch(() => {
        addToast({
          title: "Something went wrong while updating mail config!",
          color: "danger",
        });
      });
  };

  const onPreviousPage = useCallback(() => {
    setPage((prev) => Math.max(1, prev - 1));
  }, []);

  const onNextPage = useCallback(() => {
    setPage((prev) => Math.min(pages, prev + 1));
  }, [pages]);

  const renderCell = useCallback((rowData, columnKey) => {
    switch (columnKey) {
      case "userName":
        return (
          <span className="font-semibold">{rowData?.userName || "-"}</span>
        );

      case "userEmail":
        return <span>{rowData?.userEmail || "-"}</span>;

      case "fromEmail":
        return <span>{rowData?.fromEmail || "-"}</span>;

      case "fromName":
        return <span>{rowData?.fromName || "-"}</span>;

      case "smtpHost":
        return <span>{rowData?.smtpHost || "-"}</span>;

      case "smtpPort":
        return <span>{rowData?.smtpPort || "-"}</span>;

      case "active":
        return (
          <Chip color={rowData?.active ? "success" : "danger"} variant="flat">
            {rowData?.active ? "Active" : "Inactive"}
          </Chip>
        );

      case "actions":
        return (
          <div className="flex justify-center">
            <Dropdown>
              <DropdownTrigger>
                <Button isIconOnly size="sm" variant="light">
                  <EllipsisVertical />
                </Button>
              </DropdownTrigger>
              <DropdownMenu>
                <DropdownItem
                  key="update"
                  onPress={() => openUpdateModal(rowData)}
                >
                  Update
                </DropdownItem>
              </DropdownMenu>
            </Dropdown>
          </div>
        );

      default:
        return rowData[columnKey] || "-";
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
            placeholder="Search mail config..."
            startContent={<Search className="w-4 h-4 text-default-400" />}
            value={filterValue}
            onClear={() => {
              setFilterValue("");
              setPage(1);
            }}
            onValueChange={(value) => {
              setFilterValue(value);
              setPage(1);
            }}
          />
        </div>

        <div className="flex justify-between items-center">
          <span className="text-default-400 text-[12.5px]">
            Total {filteredItems.length} configs
          </span>

          <label className="flex items-center gap-1 text-default-400 text-[12.5px]">
            Rows per page:
            <select
              className="bg-transparent outline-hidden text-default-400 text-[12.5px] cursor-pointer"
              value={rowsPerPage}
              onChange={(e) => {
                setRowsPerPage(Number(e.target.value));
                setPage(1);
              }}
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
  }, [filterValue, rowsPerPage, filteredItems.length]);

  const bottomContent = useMemo(() => {
    return (
      <div className="py-1.5 px-1 flex justify-between items-center">
        <span className="w-[30%] text-[12.5px] text-default-400">
          Page {page} of {pages}
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
  }, [page, pages, onPreviousPage, onNextPage]);

  return (
    <div className="flex flex-col gap-2">
      <h1 className="font-sans text-lg font-semibold mb-2 shrink-0">
        User Mail Configurations
      </h1>

      <Table
        isHeaderSticky
        removeWrapper={false}
        aria-label="User mail configuration table"
        bottomContent={bottomContent}
        bottomContentPlacement="outside"
        topContent={topContent}
        topContentPlacement="outside"
        classNames={{
          base: "gap-2.5",
          wrapper:
            "max-h-[calc(100vh-320px)] w-full overflow-y-auto rounded-lg border border-gray-200 dark:border-white/10 shadow-none p-0",
          table: "w-full",
          thead: "[&>tr]:first:rounded-none",
          th: "h-8 py-0 text-[11.5px] tracking-wide bg-gray-50 dark:bg-neutral-900 text-default-500 first:rounded-none last:rounded-none border-b border-gray-200 dark:border-white/10",
          td: "py-1.5 text-[12.5px]",
        }}
      >
        <TableHeader columns={columns}>
          {(column) => (
            <TableColumn
              key={column.uid}
              align={column.uid === "actions" ? "center" : "start"}
            >
              {column.name}
            </TableColumn>
          )}
        </TableHeader>

        <TableBody
          emptyContent="No mail configuration found"
          items={paginatedItems}
        >
          {(item) => (
            <TableRow key={item.id}>
              {(columnKey) => (
                <TableCell>{renderCell(item, columnKey)}</TableCell>
              )}
            </TableRow>
          )}
        </TableBody>
      </Table>

      <Modal
        isOpen={updateModal.isOpen}
        onOpenChange={updateModal.onOpenChange}
        backdrop="blur"
        size="3xl"
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                Update Mail Configuration
              </ModalHeader>

              <ModalBody>
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="User ID"
                    value={String(formData.userId)}
                    isReadOnly
                  />

                  <Input
                    label="From Name"
                    value={formData.fromName}
                    onValueChange={(value) => handleChange("fromName", value)}
                  />

                  <Input
                    label="From Email"
                    value={formData.fromEmail}
                    onValueChange={(value) => handleChange("fromEmail", value)}
                  />

                  <Input
                    label="SMTP Username"
                    value={formData.smtpUsername}
                    onValueChange={(value) =>
                      handleChange("smtpUsername", value)
                    }
                  />

                  <Input
                    label="SMTP Host"
                    value={formData.smtpHost}
                    onValueChange={(value) => handleChange("smtpHost", value)}
                  />

                  <Input
                    label="SMTP Port"
                    type="number"
                    value={String(formData.smtpPort)}
                    onValueChange={(value) => handleChange("smtpPort", value)}
                  />

                  <Input
                    label="SMTP Password"
                    type={showPassword ? "text" : "password"}
                    value={formData.smtpPassword}
                    onValueChange={(value) =>
                      handleChange("smtpPassword", value)
                    }
                    endContent={
                      <button
                        type="button"
                        className="text-sm text-primary font-medium"
                        onClick={() => setShowPassword((prev) => !prev)}
                      >
                        {showPassword ? "Hide" : "Show"}
                      </button>
                    }
                  />

                  <div className="flex flex-col gap-3 mt-2">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={formData.authEnabled}
                        onChange={(e) =>
                          handleChange("authEnabled", e.target.checked)
                        }
                      />
                      Auth Enabled
                    </label>

                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={formData.starttlsEnabled}
                        onChange={(e) =>
                          handleChange("starttlsEnabled", e.target.checked)
                        }
                      />
                      STARTTLS Enabled
                    </label>

                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={formData.active}
                        onChange={(e) =>
                          handleChange("active", e.target.checked)
                        }
                      />
                      Active
                    </label>
                  </div>
                </div>
              </ModalBody>

              <ModalFooter>
                <Button variant="light" onPress={onClose}>
                  Cancel
                </Button>
                <Button color="primary" onPress={handleUpdate}>
                  Update Configuration
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
};

export default UserMailConfig;
