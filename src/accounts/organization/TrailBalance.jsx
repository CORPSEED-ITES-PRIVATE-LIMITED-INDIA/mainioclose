import { useCallback, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getAllTrailBalance } from "../../toolkit/slices/organizationSlice";
import {
  DateRangePicker,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
} from "@heroui/react";
import { inrCurrency } from "../../common";
import { parseDate } from "@internationalized/date";
import dayjs from "dayjs";

const TrailBalance = () => {
  const dispatch = useDispatch();
  const today = dayjs().format("YYYY-MM-DD");
  const twoMonthsAgo = dayjs().subtract(2, "month").format("YYYY-MM-DD");
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
        <DateRangePicker
          showMonthAndYearPickers
          label="Date range"
          className="w-[35%]"
          value={{
            start: parseDate(dateRange?.startDate),
            end: parseDate(dateRange?.endDate),
          }}
          onChange={(value) => {
            const formattedStart = value.start
              ? `${value.start.year}-${String(value.start.month).padStart(2, "0")}-${String(value.start.day).padStart(2, "0")}`
              : null;
            const formattedEnd = value.end
              ? `${value.end.year}-${String(value.end.month).padStart(2, "0")}-${String(value.end.day).padStart(2, "0")}`
              : null;
            setDateRange({
              startDate: formattedStart,
              endDate: formattedEnd,
            });
          }}
        />
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
