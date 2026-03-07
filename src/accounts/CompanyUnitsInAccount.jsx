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
  Textarea,
  useDisclosure,
} from "@heroui/react";
import { ChevronDown, EllipsisVertical, Plus, Search } from "lucide-react";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useParams } from "react-router-dom";
import {
  approvedCompanyUnitsInAccount,
  approvedCompanyUnitsInLeads,
  getGstListByCompanyIdInAccounts,
} from "../toolkit/slices/companySlice";

const columns = [
  { name: "ID", uid: "unitId" },
  { name: "UNIT NAME", uid: "name" },
  { name: "STATE NAME", uid: "state" },
  { name: "STATUS", uid: "status" },
  { name: "GST NUMBER", uid: "gstNo" },
  { name: "ADDRESS", uid: "address" },
  { name: "ACTIONS", uid: "actions" },
];

function capitalize(s) {
  return s ? s.charAt(0).toUpperCase() + s.slice(1).toLowerCase() : "";
}

const INITIAL_VISIBLE_COLUMNS = [
  "unitId",
  "name",
  "state",
  "status",
  "gstNo",
  "address",
  "actions",
];

const CompanyUnitsInAccount = () => {
  const { userId, companyId } = useParams();
  const dispatch = useDispatch();
  const { isOpen, onOpen, onClose, onOpenChange } = useDisclosure();
  const count = useSelector(
    (state) => state.company.companyUnitListForAccounts?.length,
  );
  const data = useSelector((state) => state.company.companyUnitListForAccounts);
  const [filterValue, setFilterValue] = useState("");
  const [selectedKeys, setSelectedKeys] = useState(new Set([]));
  const [visibleColumns, setVisibleColumns] = useState(
    new Set(INITIAL_VISIBLE_COLUMNS),
  );
  const [sortDescriptor, setSortDescriptor] = useState({
    column: "age",
    direction: "ascending",
  });
  const [companyFilteration, setCompanyFilteration] = useState({
    userId: userId,
    page: 1,
    size: 50,
    status: "ALL",
    companyId,
  });

  const [statusData, setStatusData] = useState({
    approve: null,
    remark: "",
    unitId: null,
  });

  const hasSearchFilter = Boolean(filterValue);

  useEffect(() => {
    dispatch(getGstListByCompanyIdInAccounts(companyFilteration));
  }, [dispatch, companyId, companyFilteration]);

  const headerColumns = useMemo(() => {
    if (visibleColumns === "all") return columns;

    return columns.filter((column) =>
      Array.from(visibleColumns).includes(column.uid),
    );
  }, [visibleColumns]);

  const filteredItems = useMemo(() => {
    let filteredUsers = [...(data || [])];

    if (hasSearchFilter) {
      filteredUsers = filteredUsers?.filter((item) =>
        Object.values(item)?.some((val) =>
          String(val)?.toLowerCase()?.includes(filterValue?.toLowerCase()),
        ),
      );
    }
    return filteredUsers;
  }, [data, filterValue]);

  const pages = Math.ceil(count / companyFilteration?.size) || 1;

  const items = useMemo(() => {
    const start = (companyFilteration?.page - 1) * companyFilteration?.size;
    const end = start + companyFilteration?.size;

    return filteredItems.slice(start, end);
  }, [companyFilteration, filteredItems]);

  const sortedItems = useMemo(() => {
    return [...items].sort((a, b) => {
      const first = a[sortDescriptor.column];
      const second = b[sortDescriptor.column];
      const cmp = first < second ? -1 : first > second ? 1 : 0;

      return sortDescriptor.direction === "descending" ? -cmp : cmp;
    });
  }, [sortDescriptor, items]);

  const handleChangeCompanyStatus = () => {
    dispatch(
      approvedCompanyUnitsInLeads({
        companyId: companyId,
        reviewedBy: userId,
        unitId: statusData?.unitId,
        data: { approve: statusData?.approve, remark: statusData?.remark },
      }),
    )
      .then((resp) => {
        if (resp.meta.requestStatus === "fulfilled") {
          addToast({
            title: "Company status updated successfully in leads !.",
            color: "success",
          });
          dispatch(
            approvedCompanyUnitsInAccount({
              companyId: companyId,
              reviewedBy: userId,
              unitId: statusData?.unitId,
              data: {
                approve: statusData?.approve,
                remark: statusData?.remark,
              },
            }),
          )
            .then((res) => {
              if (res.meta.requestStatus === "fulfilled") {
                addToast({
                  title: "Company status updated successfully in accounts !.",
                });
                onClose();
                dispatch(getGstListByCompanyIdInAccounts(companyFilteration));
              } else {
                addToast({ title: res.payload.data.message, color: "danger" });
              }
            })
            .catch((err) =>
              addToast({
                title: "Something went wrong in accounts",
                color: "danger",
              }),
            );
        } else {
          addToast({ title: resp.payload.data.message, color: "danger" });
        }
      })
      .catch(() =>
        addToast({
          title: "Something went wrong in accounts",
          color: "danger",
        }),
      );
  };

  const renderCell = useCallback((company, columnKey) => {
    switch (columnKey) {
      case "name":
        return (
          <div className="flex items-start gap-2">
            <div className="flex flex-col">
              <p>{company?.unitName || "-"}</p>
            </div>
          </div>
        );

      case "state":
        return (
          <div className="flex items-start gap-2">
            <div className="flex flex-col">{company?.state || "-"}</div>
          </div>
        );
      case "status":
        return (
          <div className="flex items-start gap-2">
            <Chip size="sm">{company?.onboardingStatus || "-"}</Chip>
          </div>
        );

      case "gstNo":
        return (
          <div className="flex flex-col">
            <span className="font-normal">{company.gstNo || "-"}</span>
          </div>
        );
      case "address":
        return company?.addressLine1 ? (
          <div className="flex flex-col">
            <span className="font-normal">{company?.addressLine1 || "-"}</span>
            <span className="text-sm text-gray-400">
              {[
                company?.city,
                company?.state,
                company?.country,
                company?.pinCode,
              ].join(",")}
            </span>
          </div>
        ) : (
          "-"
        );
      case "actions":
        return (
          <Dropdown showArrow>
            <DropdownTrigger>
              <Button size="sm" isIconOnly variant="light">
                <EllipsisVertical />
              </Button>
            </DropdownTrigger>
            <DropdownMenu>
              <DropdownItem
                onPress={() => {
                  onOpen();
                  setStatusData((pre) => ({
                    ...pre,
                    approve: true,
                    unitId: company?.unitId,
                  }));
                }}
              >
                Approved
              </DropdownItem>
              <DropdownItem
                onPress={() => {
                  onOpen();
                  setStatusData((pre) => ({
                    ...pre,
                    approve: false,
                    unitId: company?.unitId,
                  }));
                }}
              >
                Disapproved
              </DropdownItem>
            </DropdownMenu>
          </Dropdown>
        );
      default:
        return company[columnKey] || "-";
    }
  }, []);

  const onNextPage = useCallback(() => {
    if (companyFilteration?.page < pages) {
      setCompanyFilteration((prev) => ({ ...prev, page: prev.page + 1 }));
    }
  }, [companyFilteration, pages]);

  const onPreviousPage = useCallback(() => {
    if (companyFilteration?.page > 1) {
      setCompanyFilteration((prev) => ({ ...prev, page: prev.page - 1 }));
    }
  }, [companyFilteration]);

  const onRowsPerPageChange = useCallback((e) => {
    setCompanyFilteration((prev) => ({
      ...prev,
      size: Number(e.target.value),
      page: 1,
    }));
  }, []);

  const onSearchChange = useCallback((value) => {
    if (value) {
      setFilterValue(value);
      setCompanyFilteration((prev) => ({ ...prev, page: 1 }));
    } else {
      setFilterValue("");
    }
  }, []);

  const onClear = useCallback(() => {
    setFilterValue("");
    setCompanyFilteration((prev) => ({ ...prev, page: 1 }));
  }, []);

  const topContent = useMemo(() => {
    return (
      <div className="flex flex-col gap-4">
        <div className="flex justify-between gap-3 items-end">
          <Input
            isClearable
            className="w-full sm:max-w-[35%]"
            placeholder="Search by name..."
            startContent={<Search />}
            value={filterValue}
            onClear={() => onClear()}
            onValueChange={onSearchChange}
          />
          <div className="flex gap-3">
            <Dropdown>
              <DropdownTrigger className="hidden sm:flex">
                <Button
                  endContent={<ChevronDown />}
                  variant="flat"
                  className="capitalize"
                >
                  {companyFilteration?.status}
                </Button>
              </DropdownTrigger>
              <DropdownMenu
                disallowEmptySelection
                aria-label="Table Columns"
                selectionMode="single"
                selectedKeys={[companyFilteration.status]}
                onSelectionChange={(selectedKeys) => {
                  const selected = Array.from(selectedKeys)[0];
                  setCompanyFilteration((prev) => ({
                    ...prev,
                    status: selected || prev.status,
                  }));
                }}
              >
                <DropdownItem key="ALL">ALL</DropdownItem>
                <DropdownItem key="INITIATED">INITIATED</DropdownItem>
                {/* <DropdownItem key="MINIMAL">MINIMAL</DropdownItem> */}
                <DropdownItem key="APPROVED">APPROVED</DropdownItem>
                <DropdownItem key="DISAPPROVED">DISAPPROVED</DropdownItem>
              </DropdownMenu>
            </Dropdown>
            <Dropdown>
              <DropdownTrigger className="hidden sm:flex">
                <Button endContent={<ChevronDown />} variant="flat">
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
          </div>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-default-400 text-small">
            Total {count} GST units
          </span>
          <label className="flex items-center text-default-400 text-small">
            Rows per page:
            <select
              className="bg-transparent outline-hidden text-default-400 text-small"
              onChange={onRowsPerPageChange}
              value={companyFilteration?.size}
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
    onRowsPerPageChange,
    data.length,
    onSearchChange,
    hasSearchFilter,
    companyFilteration?.status,
  ]);

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
          page={companyFilteration?.page}
          total={pages}
          onChange={(e) => {
            setCompanyFilteration((prev) => ({ ...prev, page: e }));
            if (e > companyFilteration?.page) {
              dispatch(getAllNewCompanies({ ...companyFilteration, page: e }));
            }
          }}
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
  }, [selectedKeys, count, companyFilteration, pages, hasSearchFilter]);

  return (
    <>
      <h1 className="font-sans text-2xl font-medium mb-1">Unit list</h1>
      <Table
        isHeaderSticky
        aria-label="Example table with custom cells, pagination and sorting"
        bottomContent={bottomContent}
        bottomContentPlacement="outside"
        classNames={{
          wrapper: "2xl:max-h-[68vh] md:max-h-[62vh] w-full",
          table: "w-full",
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
              align={column.uid === "actions" ? "center" : "start"}
              allowsSorting={column.sortable}
            >
              {column.name}
            </TableColumn>
          )}
        </TableHeader>
        <TableBody emptyContent={"No data found"} items={sortedItems}>
          {(item) => (
            <TableRow key={item.unitId}>
              {(columnKey) => (
                <TableCell>{renderCell(item, columnKey)}</TableCell>
              )}
            </TableRow>
          )}
        </TableBody>
      </Table>
      <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                Updated status{" "}
                {statusData?.approve ? "Approved" : "Disapproved"}
              </ModalHeader>
              <ModalBody>
                <Textarea
                  label="Remark"
                  isRequired
                  value={statusData.remark}
                  onChange={(e) =>
                    setStatusData((prev) => ({
                      ...prev,
                      remark: e.target.value,
                    }))
                  }
                />
              </ModalBody>
              <ModalFooter>
                <Button variant="light" onPress={onClose}>
                  Close
                </Button>
                <Button
                  color="primary"
                  isDisabled={statusData.remark === ""}
                  onPress={handleChangeCompanyStatus}
                >
                  Submit
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
};

export default CompanyUnitsInAccount;
