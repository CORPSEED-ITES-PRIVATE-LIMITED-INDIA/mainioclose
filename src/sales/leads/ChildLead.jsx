import React, { useCallback, useEffect, useState } from "react";
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
  Chip,
  useDisclosure,
  addToast,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@heroui/react";
import { ChevronDown, Plus, Search } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import {
  addLeadChild,
  checkPlantSetUpData,
  getSingleLeadDataByLeadId,
} from "../../toolkit/slices/leadSlice";
import NewSelect from "../../components/NewSelect";
import StatusDisplay from "../../components/StatusDisplay";
import { getAllSlugList } from "../../toolkit/slices/settingSlice";

export const columns = [
  { name: "ID", uid: "childId" },
  { name: "LEAD NAME", uid: "childLeadName", sortable: true },
  { name: "ASSIGNEE", uid: "childAssigneeName" },
  { name: "ASSIGNEE EMAIL", uid: "childAssigneeEmail" },
];

export function capitalize(s) {
  return s ? s.charAt(0).toUpperCase() + s.slice(1).toLowerCase() : "";
}

const INITIAL_VISIBLE_COLUMNS = [
  "childId",
  "childLeadName",
  "childAssigneeName",
  "childAssigneeEmail",
];

const ChildLead = () => {
  const dispatch = useDispatch();
  const { leadId, userId } = useParams();
  const { onClose, onOpen, isOpen, onOpenChange } = useDisclosure();
  const data = useSelector((state) => state.leads.singleLeadData?.childLead);
  const count = useSelector(
    (state) => state.leads.singleLeadData?.childLead?.length,
  );
  const leadData = useSelector((state) => state.leads.singleLeadData);
  const plantSetupData = useSelector((state) => state.leads.plantSetupDetail);
  const slugList = useSelector((state) => state.setting.slugList);
  const [filterValue, setFilterValue] = React.useState("");
  const [selectedKeys, setSelectedKeys] = React.useState(new Set([]));
  const [visibleColumns, setVisibleColumns] = React.useState(
    new Set(INITIAL_VISIBLE_COLUMNS),
  );
  const [selectedItem, setSelectedItem] = useState([]);
  const [rowsPerPage, setRowsPerPage] = React.useState(50);
  const [sortDescriptor, setSortDescriptor] = React.useState({
    column: "age",
    direction: "ascending",
  });
  const [page, setPage] = React.useState(1);
  const hasSearchFilter = Boolean(filterValue);

  useEffect(() => {
    dispatch(getAllSlugList());
    dispatch(getSingleLeadDataByLeadId({ leadId, userId })).then((resp) => {
      if (resp.meta.requestStatus === "fulfilled") {
        const temp = resp.payload;
        if (temp?.originalName) {
          dispatch(checkPlantSetUpData(temp?.originalName));
        }
      }
    });
  }, [dispatch]);

  const headerColumns = React.useMemo(() => {
    if (visibleColumns === "all") return columns;

    return columns.filter((column) =>
      Array.from(visibleColumns).includes(column.uid),
    );
  }, [visibleColumns]);

  const filteredItems = React.useMemo(() => {
    let filteredUsers = [...(data || [])];
    if (hasSearchFilter) {
      filteredUsers = filteredUsers.filter((item) =>
        Object.values(item)?.some((val) =>
          String(val)?.toLowerCase()?.includes(filterValue?.toLowerCase()),
        ),
      );
    }
    return filteredUsers;
  }, [data, filterValue]);

  const pages = Math.ceil(count / rowsPerPage) || 1;

  const items = React.useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    const end = start + rowsPerPage;

    return filteredItems.slice(start, end);
  }, [page, filteredItems, rowsPerPage]);

  const sortedItems = React.useMemo(() => {
    return [...items].sort((a, b) => {
      const first = a[sortDescriptor.column];
      const second = b[sortDescriptor.column];
      const cmp = first < second ? -1 : first > second ? 1 : 0;

      return sortDescriptor.direction === "descending" ? -cmp : cmp;
    });
  }, [sortDescriptor, items]);

  const handleAddChildLead = useCallback(() => {
    dispatch(
      addLeadChild({
        leadId: leadId,
        serviceName: selectedItem,
      }),
    )
      .then((resp) => {
        if (resp.meta.requestStatus === "fulfilled") {
          addToast({
            title: "Child lead added successfully !.",
            color: "success",
          });
          setSelectedItem([]);
          dispatch(getSingleLeadDataByLeadId({ leadId, userId }));
          onClose();
        } else {
          addToast({ message: "Something went wrong !.", color: "danger" });
        }
      })
      .catch(() =>
        addToast({ message: "Something went wrong !.", color: "danger" }),
      );
  }, [leadId, selectedItem, dispatch]);

  const renderCell = React.useCallback((rowData, columnKey) => {
    const cellValue = rowData[columnKey];
    switch (columnKey) {
      case "childLeadName":
        return <span className="font-medium">{rowData?.childLeadName}</span>;
      default:
        return cellValue;
    }
  }, []);

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
    return (
      <div className="flex flex-col gap-4">
        <div className="flex justify-between gap-3 items-end">
          <Input
            isClearable
            className="w-full sm:max-w-[35%]"
            placeholder="Search..."
            startContent={<Search />}
            value={filterValue}
            onClear={() => onClear()}
            onValueChange={onSearchChange}
          />
          <div className="flex gap-3">
            <Button color="primary" onPress={onOpen} endContent={<Plus />}>
              Add
            </Button>
            <Dropdown>
              <DropdownTrigger>
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
            Total {count} lead tasks
          </span>
          <label className="flex items-center text-default-400 text-small">
            Rows per page:
            <select
              className="bg-transparent outline-hidden text-default-400 text-small"
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
    onSearchChange,
    hasSearchFilter,
    count,
  ]);

  const bottomContent = React.useMemo(() => {
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
  }, [selectedKeys, page, pages, count]);

  return (
    <>
      {
        // plantSetupData
        true ? (
          <>
            <h1 className="font-sans text-2xl font-medium mb-1">
              Child lead list
            </h1>
            <Table
              isHeaderSticky
              aria-label="Example table with custom cells, pagination and sorting"
              bottomContent={bottomContent}
              bottomContentPlacement="outside"
              classNames={{
                wrapper: "2xl:max-h-[55vh] md:max-h-[50vh] w-full",
                table: "w-full",
              }}
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
                  <TableRow key={item.childId}>
                    {(columnKey) => (
                      <TableCell>{renderCell(item, columnKey)}</TableCell>
                    )}
                  </TableRow>
                )}
              </TableBody>
            </Table>
            <Modal
              isDismissable={false}
              isKeyboardDismissDisabled={true}
              isOpen={isOpen}
              onOpenChange={onOpenChange}
              placement="top-center"
            >
              <ModalContent>
                {(onClose) => (
                  <>
                    <ModalHeader className="flex flex-col gap-1">
                      Add child leads
                    </ModalHeader>
                    <ModalBody>
                      <NewSelect
                        data={slugList}
                        labelKey={"name"}
                        valueKey={"name"}
                        label={"Select child lead"}
                        selectionMode="multiple"
                        value={selectedItem}
                        onChange={(e) => {
                          setSelectedItem(e);
                        }}
                      />
                      <ModalFooter className="w-full flex justify-end">
                        <Button onPress={onClose}>Cancel</Button>
                        <Button color="primary" onPress={handleAddChildLead}>
                          Submit
                        </Button>
                      </ModalFooter>
                    </ModalBody>
                  </>
                )}
              </ModalContent>
            </Modal>
          </>
        ) : (
          <StatusDisplay
            type="notfound"
            message="Sorry, this lead is not a parent lead."
          />
        )
      }
    </>
  );
};

export default ChildLead;
