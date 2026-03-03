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
  Tooltip,
  useDisclosure,
} from "@heroui/react";
import { ChevronDown, EllipsisVertical, Info, Search } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useParams } from "react-router-dom";
import { getAllCompaniesForApprovals } from "../toolkit/slices/accountSlice";
import {
  approvedCompanyInAccount,
  approvedCompanyInLeads,
} from "../toolkit/slices/companySlice";

const columns = [
  { name: "ID", uid: "companyId" },
  { name: "COMPANY", uid: "companyName", sortable: true },
  { name: "INDUSTRY", uid: "industryName" },
  { name: "PAN NUMBER", uid: "panNo" },
  { name: "STATUS", uid: "status" },
  { name: "ASSIGNEE", uid: "assignee" },
  { name: "PRIMARY ADDRESS", uid: "address" },
  { name: "SECONDARY ADDRESS", uid: "secondaryAddress" },
  { name: "ACTIONS", uid: "actions" },
];

function capitalize(s) {
  return s ? s.charAt(0).toUpperCase() + s.slice(1).toLowerCase() : "";
}

const INITIAL_VISIBLE_COLUMNS = [
  "companyId",
  "companyName",
  "gstNo",
  "industryName",
  "panNo",
  "status",
  "assignee",
  "address",
  "actions",
];

const CompanyApprovals = () => {
  const { userId } = useParams();
  const dispatch = useDispatch();
  const { isOpen, onOpen, onClose, onOpenChange } = useDisclosure();
  const count = useSelector(
    (state) => state.account.approvalCompanyList?.length,
  );
  const data = useSelector((state) => state.account.approvalCompanyList);
  const [filterValue, setFilterValue] = useState("");
  const [selectedKeys, setSelectedKeys] = useState(new Set([]));
  const [visibleColumns, setVisibleColumns] = useState(
    new Set(INITIAL_VISIBLE_COLUMNS),
  );
  const [sortDescriptor, setSortDescriptor] = useState({
    column: "age",
    direction: "ascending",
  });
  const [filteration, setFilteration] = useState({
    userId: userId,
    page: 1,
    size: 50,
    status: "ALL",
  });

  const [statusData, setStatusData] = useState({
    approve: null,
    remark: "",
    companyId: null,
  });

  const hasSearchFilter = Boolean(filterValue);

  useEffect(() => {
    dispatch(getAllCompaniesForApprovals(filteration));
  }, [dispatch, filteration]);

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

  const pages = Math.ceil(count / filteration?.size) || 1;

  const sortedItems = useMemo(() => {
    return [...filteredItems].sort((a, b) => {
      const first = a[sortDescriptor.column];
      const second = b[sortDescriptor.column];
      const cmp = first < second ? -1 : first > second ? 1 : 0;

      return sortDescriptor.direction === "descending" ? -cmp : cmp;
    });
  }, [sortDescriptor, filteredItems]);

  const handleChangeCompanyStatus = () => {
    dispatch(
      approvedCompanyInLeads({
        companyId: statusData?.companyId,
        reviewedBy: userId,
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
            approvedCompanyInAccount({
              companyId: statusData?.companyId,
              reviewedBy: userId,
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
                  color: "success",
                });
                onClose();
                dispatch(getAllCompaniesForApprovals(filteration));
              } else {
                addToast({ title: res.payload.data.message, color: "danger" });
              }
            })
            .catch((err) => {
              addToast({
                title: "Something went wrong in accounts",
                color: "danger",
              });
            });
        } else {
          addToast({ title: resp.payload.data.message, color: "danger" });
        }
      })
      .catch(() => {
        addToast({
          title: "Something went wrong in accounts",
          color: "danger",
        });
      });
  };

  const renderCell = useCallback((rowData, columnKey) => {
    switch (columnKey) {
      case "companyName":
        return (
          <div className="flex items-start gap-2">
            <div className="flex flex-col">
              <Link
                to={`${rowData?.companyId}/units`}
                className="font-medium capitalize"
              >
                {rowData?.companyName || "-"}
              </Link>
              <p className="font-normal text-xs text-gray-400">
                Age : {rowData?.age || "-"}
              </p>
            </div>
          </div>
        );

      case "industryName":
        return (
          rowData?.industryName && (
            <div className="flex justify-between">
              {rowData?.industryName}{" "}
              <Tooltip
                content={
                  <div className="w-full">
                    <div className="grid grid-cols-[150px_20px_1fr] gap-y-2 text-sm">
                      <div className="text-gray-600">Industry name</div>
                      <div className="text-gray-600 text-center">:</div>
                      <div className="text-gray-900 font-medium">
                        {rowData?.industryName}
                      </div>

                      <div className="text-gray-600">Category</div>
                      <div className="text-gray-600 text-center">:</div>
                      <div className="text-gray-900 font-medium">
                        {rowData?.subIndustryName}
                      </div>

                      <div className="text-gray-600">Subcategory</div>
                      <div className="text-gray-600 text-center">:</div>
                      <div className="text-gray-900 font-medium">
                        {rowData?.subSubIndustryName}
                      </div>

                      <div className="text-gray-600">Business activity</div>
                      <div className="text-gray-600 text-center">:</div>
                      <div className="text-gray-900 font-medium">
                        {rowData?.industryName}
                      </div>
                    </div>
                  </div>
                }
              >
                <Info className="w-3 h-3" />
              </Tooltip>
            </div>
          )
        );

      case "panNo":
        return <div className="flex flex-col">{rowData?.panNo}</div>;
      case "status":
        return (
          <div className="flex flex-col">
            <Chip
              size="sm"
              className="text-tiny capitalize"
              variant="flat"
              color={
                rowData?.onboardingStatus === "APPROVED"
                  ? "success"
                  : rowData?.onboardingStatus === "DISAPPROVED"
                    ? "danger"
                    : "secondary"
              }
            >
              {rowData?.onboardingStatus}
            </Chip>
          </div>
        );

      case "assignee":
        return (
          <div className="flex flex-col">
            <span className="font-normal">{rowData?.assigneeName || "-"}</span>
          </div>
        );
      case "address":
        return rowData?.address ? (
          <div className="flex flex-col">
            <span className="font-normal">{rowData?.address || "-"}</span>
            <span className="text-sm text-gray-400">
              {[rowData?.city, rowData?.state, rowData?.country].join(",")}
            </span>
          </div>
        ) : (
          "-"
        );
      case "secondaryAddress":
        return rowData?.secAddress ? (
          <div className="flex flex-col">
            <span className="font-normal">{rowData?.secAddress || "-"}</span>
            <div className="flex items-center gap-1">
              {" "}
              <span className="text-gray-400">{rowData?.secCity || "-"}</span>,
              <span className="text-gray-400">{rowData?.secState || "-"}</span>,
            </div>
            <div className="flex items-center gap-1">
              <span className="text-gray-400 text-tiny">
                {rowData?.seCountry || "-"}
              </span>
            </div>
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
                    companyId: rowData?.companyId,
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
                    companyId: rowData?.companyId,
                  }));
                }}
              >
                Disapproved
              </DropdownItem>
            </DropdownMenu>
          </Dropdown>
        );
      default:
        return rowData[columnKey] || "-";
    }
  }, []);

  const onNextPage = useCallback(() => {
    if (filteration?.page < pages) {
      setFilteration((prev) => ({ ...prev, page: prev.page + 1 }));
    }
  }, [filteration, pages]);

  const onPreviousPage = useCallback(() => {
    if (filteration?.page > 1) {
      setFilteration((prev) => ({ ...prev, page: prev.page - 1 }));
    }
  }, [filteration]);

  const onRowsPerPageChange = useCallback((e) => {
    setFilteration((prev) => ({
      ...prev,
      size: Number(e.target.value),
      page: 1,
    }));
  }, []);

  const onSearchChange = useCallback((value) => {
    if (value) {
      setFilterValue(value);
      setFilteration((prev) => ({ ...prev, page: 1 }));
    } else {
      setFilterValue("");
    }
  }, []);

  const onClear = useCallback(() => {
    setFilterValue("");
    setFilteration((prev) => ({ ...prev, page: 1 }));
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
                  {filteration?.status}
                </Button>
              </DropdownTrigger>
              <DropdownMenu
                disallowEmptySelection
                aria-label="Table Columns"
                selectionMode="single"
                selectedKeys={[filteration.status]}
                onSelectionChange={(selectedKeys) => {
                  const selected = Array.from(selectedKeys)[0];
                  setFilteration((prev) => ({
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
            Total {count} companies for approvals
          </span>
          <label className="flex items-center text-default-400 text-small">
            Rows per page:
            <select
              className="bg-transparent outline-hidden text-default-400 text-small"
              onChange={onRowsPerPageChange}
              value={filteration?.size}
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
    filteration?.status,
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
          page={filteration?.page}
          total={pages}
          onChange={(e) => {
            setFilteration((prev) => ({ ...prev, page: e }));
            if (e > filteration?.page) {
              dispatch(getAllNewCompanies({ ...filteration, page: e }));
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
  }, [selectedKeys, count, filteration, pages, hasSearchFilter]);

  return (
    <>
      <h1 className="font-sans text-2xl font-medium mb-1">
        Companies for approvals
      </h1>
      <Table
        isHeaderSticky
        aria-label="Example table with custom cells, pagination and sorting"
        bottomContent={bottomContent}
        bottomContentPlacement="outside"
        classNames={{
          wrapper: "2xl:max-h-[68vh] md:max-h-[62vh] w-full",
          table: "w-full",
        }}
        // selectedKeys={selectedKeys}
        // selectionMode="multiple"
        sortDescriptor={sortDescriptor}
        topContent={topContent}
        topContentPlacement="outside"
        // onSelectionChange={setSelectedKeys}
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
            <TableRow key={item.companyId}>
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

export default CompanyApprovals;
