import {
  addToast,
  Button,
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
  Tooltip,
  useDisclosure,
} from "@heroui/react";
import { ChevronDown, EllipsisVertical, Search } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useParams } from "react-router-dom";
import {
  getAllProposalByUserIdForManager,
  getAllPropsalListCount,
  proposalApprovalByManager,
} from "../../toolkit/slices/leadSlice";
import dayjs from "dayjs";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import * as z from "zod";
import LoadingSpinner from "../../components/LoadingSpinner";

const columns = [
  { name: "ID", uid: "id" },
  { name: "DATE", uid: "date" },
  { name: "PROPOSAL NO.", uid: "proposalNumber" },
  { name: "SOLUTION NAME", uid: "solutionName" },
  { name: "CREATED BY", uid: "createdBy" },
  { name: "EMAIL TO", uid: "mailTo" },
  { name: "EMAIL BY", uid: "createdByEmail" },
  { name: "BROCHURES", uid: "brochures" },
  { name: "STATUS", uid: "status" },
  { name: "ACTIONS", uid: "actions" },
];

function capitalize(s) {
  return s ? s.charAt(0).toUpperCase() + s.slice(1).toLowerCase() : "";
}

const INITIAL_VISIBLE_COLUMNS = [
  "id",
  "date",
  "proposalNumber",
  "createdBy",
  "solutionName",
  "mailTo",
  "brochures",
  "status",
  "actions",
];

const formSchema = z.object({
  comment: z.string().min(1, "Please enter the comment"),
});

const defaultValues = {
  comment: "",
};

const AllProposal = () => {
  const { userId } = useParams();
  const dispatch = useDispatch();
  const { isOpen, onOpen, onOpenChange, onClose } = useDisclosure();
  const proposalModal = useDisclosure();
  const count = useSelector((state) => state.leads.proposalCount);
  const data = useSelector((state) => state.leads.proposalList);
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
    id: userId,
    page: 1,
    size: 50,
    status: "initiated",
  });
  const [updateStatusData, setUpdateStatusData] = useState({
    proposalId: null,
    status: null,
    userId,
    comment: "",
  });
  const [proposalData, setProposalData] = useState("");
  const [loading, setLoading] = useState("");
  const [confirmApproveModal, setConfirmApproveModal] = useState({
    isOpen: false,
    rowData: null,
  });

  const hasSearchFilter = Boolean(filterValue);

  useEffect(() => {
    dispatch(getAllProposalByUserIdForManager(filteration));
    dispatch(getAllPropsalListCount(userId));
  }, [dispatch, filteration]);

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: zodResolver(formSchema),
    defaultValues,
  });

  const headerColumns = useMemo(() => {
    if (visibleColumns === "all") return columns;

    return columns.filter((column) =>
      Array.from(visibleColumns).includes(column.uid),
    );
  }, [visibleColumns]);

  const filteredItems = useMemo(() => {
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

  const pages = Math.ceil(count / filteration?.size) || 1;

  const items = useMemo(() => {
    const start = (filteration?.page - 1) * filteration?.size;
    const end = start + filteration?.size;

    return filteredItems.slice(start, end);
  }, [filteration, filteredItems]);

  const sortedItems = useMemo(() => {
    return [...items].sort((a, b) => {
      const first = a[sortDescriptor.column];
      const second = b[sortDescriptor.column];
      const cmp = first < second ? -1 : first > second ? 1 : 0;

      return sortDescriptor.direction === "descending" ? -cmp : cmp;
    });
  }, [sortDescriptor, items]);

  const handleActionsClick = (e, rowData) => {
    if (e === "view") {
      setProposalData(rowData?.template);
      proposalModal.onOpen();
      return;
    } else {
      if (
        e === "APPROVED" &&
        (rowData?.status === "REJECTED" || rowData?.status === "CANCELLED")
      ) {
        setConfirmApproveModal({
          isOpen: true,
          rowData,
        });
        return;
      }
      setUpdateStatusData((prev) => ({
        ...prev,
        proposalId: rowData?.id,
        status: e,
      }));
      onOpen();
    }
  };

  const handleConfirmRejectedToApproved = () => {
    setUpdateStatusData((prev) => ({
      ...prev,
      proposalId: confirmApproveModal?.rowData?.id,
      status: "APPROVED",
    }));

    setConfirmApproveModal({
      isOpen: false,
      rowData: null,
    });

    onOpen();
  };

  const handleChangeStatus = (values) => {
    setLoading("pending");
    dispatch(
      proposalApprovalByManager({
        ...updateStatusData,
        comment: values?.comment,
      }),
    )
      .then((resp) => {
        if (resp.meta.requestStatus === "fulfilled") {
          dispatch(getAllProposalByUserIdForManager(filteration));
          if (updateStatusData.status === "APPROVED") {
            addToast({
              title: `Success`,
              description: "Proposal approved successfully and sent to client.",
              color: "success",
            });
          } else {
            addToast({
              title: `Proposal disapproved successfully.`,
              description: "Proposal disapproved successfully.",
              color: "success",
            });
          }
          setLoading("success");
          setUpdateStatusData({
            proposalId: null,
            status: null,
            userId,
            comment: "",
          });
          reset(defaultValues);
          onClose();
        } else {
          setLoading("error");
          addToast({ title: "Something went wrong", color: "danger" });
        }
      })
      .catch((err) => {
        setLoading("error");
        addToast({ title: "Something went wrong", color: "danger" });
      });
  };

  const renderCell = useCallback((rowData, columnKey) => {
    switch (columnKey) {
      case "solutionName":
        return (
          <div className="flex items-start gap-2">
            <div className="flex flex-col">
              <p className="font-normal">{rowData?.solutionName || "-"}</p>
            </div>
          </div>
        );
      case "createdBy":
        return (
          <div className="flex items-start gap-2">
            <div className="flex flex-col">
              <p className="font-normal">{rowData?.createdByName || "-"}</p>
            </div>
          </div>
        );

      case "date":
        return (
          <p className="font-normal text-xs capitalize">
            {dayjs(rowData?.createDate).format("YYYY-MM-DD") || "-"}
          </p>
        );
      case "proposalNumber":
        return (
          <p className="font-normal text-xs capitalize">
            {rowData?.proposalNumber || "-"}
          </p>
        );
      case "mailTo":
        return (
          <div className="flex flex-col">
            <span className="font-normal">
              {rowData.mailTo?.join(" , ") || "-"}
            </span>
          </div>
        );
      case "createdByEmail":
        return (
          <div className="flex flex-col">
            <span className="font-normal">{rowData.createdByEmail || "-"}</span>
          </div>
        );
      case "status":
        return (
          <div className="flex flex-col">
            <span className="font-normal capitalize">
              {rowData?.status === "CANCELLED" || rowData?.status === "REJECTED"
                ? "REJECTED"
                : rowData?.status || "-"}
            </span>
          </div>
        );
      case "brochures":
        return (
          <div className="flex gap-0.5">
            {rowData?.brochureBook?.map((item) => (
              <Tooltip key={item?.id} content={item?.name}>
                <Link
                  to={item?.brochureBook}
                  className="inline-block max-w-[120px] bg-blue-300 rounded-lg py-0.5 px-2 truncate whitespace-nowrap overflow-hidden"
                >
                  {item?.name}
                </Link>
              </Tooltip>
            ))}
          </div>
        );
      case "actions":
        return (
          <div className="relative flex justify-center items-center gap-2">
            <Dropdown>
              <DropdownTrigger>
                <Button isIconOnly size="sm" variant="light">
                  <EllipsisVertical className="text-default-300" />
                </Button>
              </DropdownTrigger>
              <DropdownMenu
                selectionMode="single"
                selectedKeys={[rowData?.status]}
                onSelectionChange={(e) => {
                  let key = Array.from(e)[0];
                  handleActionsClick(key, rowData);
                }}
              >
                <DropdownItem key="view">View</DropdownItem>

                {rowData?.status === "INITIATED" ? (
                  <DropdownItem key="APPROVED">APPROVED</DropdownItem>
                ) : null}
                {rowData?.status === "INITIATED" ? (
                  <DropdownItem key="REJECTED">REJECTED</DropdownItem>
                ) : null}
              </DropdownMenu>
            </Dropdown>
          </div>
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
                <Button endContent={<ChevronDown />} variant="flat">
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
                {[
                  { label: "ALL", uid: "all" },
                  { label: "INITIATED", uid: "initiated" },
                  { label: "APPROVED", uid: "approved" },
                  { label: "REJECTED", uid: "rejected" },
                ].map((status) => (
                  <DropdownItem key={status.uid} className="capitalize">
                    {capitalize(status.label)}
                  </DropdownItem>
                ))}
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
            Total {count} proposal
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
    filteration,
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
      {loading === "pending" && <LoadingSpinner />}
      <h1 className="font-sans text-2xl font-medium mb-1">All proposal</h1>
      <Table
        isHeaderSticky
        aria-label="Example table with custom cells, pagination and sorting"
        bottomContent={bottomContent}
        bottomContentPlacement="outside"
        classNames={{
          wrapper: "max-h-[68vh] w-full",
          table: "w-full",
        }}
        selectedKeys={selectedKeys}
        // selectionMode="multiple"
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
            <TableRow key={item.leadId}>
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
              <ModalHeader>Update status</ModalHeader>
              <ModalBody>
                <form
                  onSubmit={handleSubmit(handleChangeStatus)}
                  className="flex flex-col gap-4"
                >
                  <div className="max-h-[60vh] overflow-auto px-2">
                    <Controller
                      name="comment"
                      control={control}
                      render={({ field }) => (
                        <Input
                          label="Comment"
                          isRequired
                          value={field.value}
                          onChange={field.onChange}
                          errorMessage={"please enter comment"}
                          isInvalid={!!errors.comment}
                        />
                      )}
                    />
                  </div>

                  <ModalFooter className="flex justify-end">
                    <Button onPress={onClose}>Cancel</Button>
                    <Button color="primary" type="submit">
                      Submit
                    </Button>
                  </ModalFooter>
                </form>
              </ModalBody>
            </>
          )}
        </ModalContent>
      </Modal>
      <Modal
        size="full"
        isDismissable={false}
        isKeyboardDismissDisabled={true}
        isOpen={proposalModal.isOpen}
        onOpenChange={proposalModal.onOpenChange}
        placement="top-center"
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="text-xl font-semibold border-b pb-3">
                Propsal
              </ModalHeader>

              <ModalBody>
                <div
                  className="preview-container max-h-screen overflow-auto p-6 bg-white rounded-xl shadow-lg mx-auto w-full max-w-4xl"
                  dangerouslySetInnerHTML={{ __html: proposalData }}
                />
              </ModalBody>
            </>
          )}
        </ModalContent>
      </Modal>

      <Modal
        isDismissable={false}
        isKeyboardDismissDisabled={true}
        isOpen={confirmApproveModal.isOpen}
        onOpenChange={(open) => {
          if (!open) {
            setConfirmApproveModal({
              isOpen: false,
              rowData: null,
            });
          }
        }}
        placement="top-center"
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader>Confirm Approval</ModalHeader>

              <ModalBody>
                <p className="text-sm text-default-600">
                  This proposal is currently rejected . Are you sure you want to
                  approve it?
                </p>
              </ModalBody>

              <ModalFooter>
                <Button
                  variant="flat"
                  onPress={() => {
                    setConfirmApproveModal({
                      isOpen: false,
                      rowData: null,
                    });
                    onClose();
                  }}
                >
                  Cancel
                </Button>

                <Button
                  color="primary"
                  onPress={handleConfirmRejectedToApproved}
                >
                  Yes, Approve
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
};

export default AllProposal;
