import {
  Button,
  Chip,
  Pagination,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
} from "@heroui/react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useParams } from "react-router-dom";
import dayjs from "dayjs";
import {
  getRejectedLeads,
  handleViewHistory,
} from "../toolkit/slices/leadSlice";

const columns = [
  { name: "LEAD NAME", uid: "leadName" },
  { name: "CONTACT", uid: "contact" },
  { name: "STATUS", uid: "status" },
  { name: "ASSIGNEE", uid: "assignee" },
  { name: "SOURCE", uid: "source" },
  { name: "UPDATED BY", uid: "updatedBy" },
];

const RejectedLeads = () => {
  const dispatch = useDispatch();
  const { userId } = useParams();
  const data = useSelector((state) => state.leads.rejectedLeads) || [];
  const count = useSelector((state) => state.leads.rejectedLeadsCount) || 0;
  const [paginationData, setPaginationData] = useState({ page: 1, size: 25 });

  useEffect(() => {
    dispatch(getRejectedLeads(paginationData));
  }, [dispatch, paginationData]);

  const pages = Math.ceil(count / paginationData.size) || 1;
  const leadBasePath = `/erp/${userId}/quality/rejectedLeads`;

  const renderCell = useCallback(
    (lead, columnKey) => {
      switch (columnKey) {
        case "leadName":
          return (
            <div className="flex flex-col min-w-0">
              <Link
                to={`${leadBasePath}/${lead?.id}/leadDetail`}
                className="font-semibold text-[12.5px] truncate"
                onClick={() =>
                  dispatch(handleViewHistory({ leadId: lead?.id, userId }))
                }
              >
                {lead?.originalName || lead?.leadName || "-"}
              </Link>
              <span className="text-[11.5px] text-default-500">
                {lead?.createDate
                  ? dayjs(lead.createDate).format("DD-MM-YYYY")
                  : "-"}
              </span>
            </div>
          );
        case "contact":
          return (
            <div className="flex flex-col min-w-0">
              <span className="font-normal text-[12.5px]">
                {lead?.name || "-"}
              </span>
              {lead?.email && (
                <span className="text-default-500 text-[11.5px] truncate">
                  {lead.email}
                </span>
              )}
              {lead?.mobileNo && (
                <span className="text-default-500 text-[11.5px]">
                  {lead.mobileNo}
                </span>
              )}
            </div>
          );
        case "status":
          return (
            <Chip
              className="capitalize"
              color="primary"
              size="sm"
              variant="flat"
            >
              {lead?.status?.name || "Unknown"}
            </Chip>
          );
        case "assignee":
          return (
            <div className="flex flex-col min-w-0">
              <span className="font-semibold text-[12.5px] truncate">
                {lead?.assignee?.fullName || "-"}
              </span>
              <span className="text-[11.5px] text-default-500 truncate">
                {lead?.assignee?.email || "-"}
              </span>
            </div>
          );
        case "source":
          return <p className="text-[12.5px]">{lead?.source || "-"}</p>;
        case "updatedBy":
          return (
            <div className="flex flex-col gap-0.5">
              <span className="font-normal text-[12.5px]">
                {lead?.updatedBy?.fullName || "-"}
              </span>
              <span className="font-normal text-[11.5px] text-default-500">
                {lead?.updatedDate
                  ? dayjs(lead.updatedDate).format("DD-MM-YYYY")
                  : "-"}
              </span>
            </div>
          );
        default:
          return lead?.[columnKey] || "-";
      }
    },
    [dispatch, leadBasePath, userId],
  );

  const topContent = useMemo(
    () => (
      <div className="flex justify-between items-center">
        <span className="text-default-400 text-[12.5px]">
          Total {count} leads
        </span>
        <label className="flex items-center gap-1 text-default-400 text-[12.5px]">
          Rows per page:
          <select
            className="bg-transparent outline-none text-default-400 text-[12.5px] cursor-pointer"
            value={paginationData.size}
            onChange={(e) =>
              setPaginationData({ page: 1, size: Number(e.target.value) })
            }
          >
            <option value="10">10</option>
            <option value="25">25</option>
            <option value="50">50</option>
          </select>
        </label>
      </div>
    ),
    [count, paginationData.size],
  );

  const bottomContent = useMemo(
    () => (
      <div className="py-1.5 px-1 flex justify-between items-center">
        <span className="w-[30%]" />
        <Pagination
          isCompact
          showControls
          color="primary"
          page={paginationData.page}
          total={pages}
          onChange={(page) => setPaginationData((prev) => ({ ...prev, page }))}
        />
        <div className="hidden sm:flex w-[30%] justify-end gap-2">
          <Button
            isDisabled={paginationData.page <= 1}
            size="sm"
            variant="flat"
            onPress={() =>
              setPaginationData((prev) => ({ ...prev, page: prev.page - 1 }))
            }
          >
            Previous
          </Button>
          <Button
            isDisabled={paginationData.page >= pages}
            size="sm"
            variant="flat"
            onPress={() =>
              setPaginationData((prev) => ({ ...prev, page: prev.page + 1 }))
            }
          >
            Next
          </Button>
        </div>
      </div>
    ),
    [paginationData, pages],
  );

  return (
    <div className="flex flex-col gap-2">
      <h1 className="font-sans text-lg font-semibold mb-2 shrink-0">
        Rejected leads
      </h1>
      <Table
        isHeaderSticky
        removeWrapper={false}
        aria-label="Rejected leads"
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
        topContent={topContent}
        topContentPlacement="outside"
      >
        <TableHeader columns={columns}>
          {(column) => (
            <TableColumn key={column.uid}>{column.name}</TableColumn>
          )}
        </TableHeader>
        <TableBody emptyContent="No rejected leads found" items={data}>
          {(item) => (
            <TableRow key={item.id}>
              {(columnKey) => (
                <TableCell>{renderCell(item, columnKey)}</TableCell>
              )}
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default RejectedLeads;
