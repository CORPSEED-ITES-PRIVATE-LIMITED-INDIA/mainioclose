import { useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getAllTrailBalance } from "../../toolkit/slices/organizationSlice";
import {
  Button,
  DateRangePicker,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
} from "@heroui/react";
import { inrCurrency } from "../../common";
import { parseZonedDateTime } from "@internationalized/date";
import dayjs from "dayjs";
import { CSVLink } from "react-csv";
import { FileUp } from "lucide-react";

const TrailBalance = () => {
  const dispatch = useDispatch();
  const today = dayjs().format("YYYY-MM-DDTHH:mm");
  const twoMonthsAgo = dayjs().subtract(2, "month").format("YYYY-MM-DDTHH:mm");
  const trailBalanceList = useSelector(
    (state) => state.organization.trailBalanceList
  );
  const [dateRange, setDateRange] = useState({
    startDate: twoMonthsAgo,
    endDate: today,
  });

  useEffect(() => {
    dispatch(getAllTrailBalance(dateRange));
  }, [dispatch, dateRange]);

  const exportData = (trailBalanceList || [])?.map((row) => ({
    "Group name": row?.groupName,
    "Total credit": row?.totalCredit,
    "Total debit": row?.totalDebit,
    "Total amount": row?.totalAmount,
  }));
  const headers = ["Group name", "Total credit", "Total debit", "Total amount"];

  const columns = [
    {
      key: "groupName",
      label: "GROUP NAME",
    },
    {
      key: "totalCredit",
      label: "TOTAL CREDIT",
    },
    {
      key: "totalDebit",
      label: "TOTAL DEBIT",
    },
    {
      key: "totalAmount",
      label: "TOTAL AMOUNT",
    },
  ];

  const renderCell = useCallback((rowData, columnKey) => {
    switch (columnKey) {
      case "groupName":
        return (
          <div className="flex flex-col">
            <p className="font-medium">{rowData?.groupName || "-"}</p>
          </div>
        );

      case "totalCredit":
        return (
          <div className="flex flex-col gap-1">
            <span className="font-normal">
              {inrCurrency(rowData.totalCredit) || "-"}
            </span>
          </div>
        );
      case "totalDebit":
        return (
          <div className="flex flex-col gap-1">
            <span className="font-normal">
              {inrCurrency(rowData.totalDebit) || "-"}
            </span>
          </div>
        );
      case "totalAmount":
        return (
          <div className="flex flex-col gap-1">
            <span className="font-normal">
              {inrCurrency(rowData.totalAmount) || "-"}
            </span>
          </div>
        );
      default:
        return rowData[columnKey] || "-";
    }
  }, []);

  return (
    <div className="flex flex-col gap-2 p-2">
      <div className="flex justify-between items-center">
        <h1 className="font-medium text-2xl">Trail balance</h1>
        <div className="flex gap-2 items-center">
          <DateRangePicker
            hideTimeZone
            visibleMonths={2}
           size="md"
            value={{
              start: parseZonedDateTime(
                `${dateRange?.startDate}[Asia/kolkata]`
              ),
              end: parseZonedDateTime(`${dateRange?.endDate}[Asia/kolkata]`),
            }}
            onChange={(value) => {
              const formattedStart = value.start
                ? `${value.start.year}-${String(value.start.month).padStart(2, "0")}-${String(value.start.day).padStart(2, "0")}T${String(value.start.hour).padStart(2, "0")}:${String(value.start.minute).padStart(2, "0")}`
                : null;
              const formattedEnd = value.end
                ? `${value.end.year}-${String(value.end.month).padStart(2, "0")}-${String(value.end.day).padStart(2, "0")}T${String(value.end.hour).padStart(2, "0")}:${String(value.end.minute).padStart(2, "0")}`
                : null;
              setDateRange({
                startDate: formattedStart,
                endDate: formattedEnd,
              });
            }}
          />
          <CSVLink
            className="text-white"
            data={exportData}
            headers={headers}
            filename={"trail-balance.csv"}
          >
            <Button size="sm" isIconOnly>
              <FileUp className="h-4 w-4" />
            </Button>
          </CSVLink>
        </div>
      </div>
      <Table
        classNames={{
          wrapper: "max-h-[65vh]",
        }}
      >
        <TableHeader columns={columns}>
          {(column) => (
            <TableColumn key={column.key}>{column.label}</TableColumn>
          )}
        </TableHeader>
        <TableBody items={trailBalanceList || []}>
          {(item) => (
            <TableRow key={`${item.groupName}trailBalance`}>
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

export default TrailBalance;
