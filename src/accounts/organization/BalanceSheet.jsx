import { useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  getAllBalanceSheetAssets,
  getAllBalanceSheetLiabilities,
} from "../../toolkit/slices/organizationSlice";
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
import dayjs from "dayjs";
import { parseDate } from "@internationalized/date";

const BalanceSheet = () => {
  const dispatch = useDispatch();
  const today = dayjs().format("YYYY-MM-DD");
  const twoMonthsAgo = dayjs().subtract(2, "month").format("YYYY-MM-DD");
  const balanceSheetLiabilitiesList = useSelector(
    (state) => state.organization.balanceSheetLiabilitiesList
  );
  const balanceSheetAssetsList = useSelector(
    (state) => state.organization.balanceSheetAssetsList
  );
  const [dateRange, setDateRange] = useState({
    startDate: twoMonthsAgo,
    endDate: today,
  });

  const [dateRange2, setDateRange2] = useState({
    startDate: twoMonthsAgo,
    endDate: today,
  });

  useEffect(() => {
    dispatch(getAllBalanceSheetLiabilities(dateRange));
  }, [dispatch,dateRange]);

  useEffect(() => {
    dispatch(getAllBalanceSheetAssets(dateRange2));
  }, [dispatch,dateRange2]);

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


  console.log('sdahgskjgskjgg',dateRange2)


  return (
    <div className="grid grid-cols-2 gap-2">
      <div className="flex flex-col gap-2 p-2">
        <div className="flex justify-between items-center">
          <h1 className="font-medium text-2xl">Liabilities</h1>
          <DateRangePicker
            showMonthAndYearPickers
            label="Date range"
            value={{
              start: parseDate(dateRange?.startDate),
              end: parseDate(dateRange?.endDate),
            }}
            className="w-[35%]"
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
          <TableBody items={balanceSheetLiabilitiesList || []}>
            {(item) => (
              <TableRow key={`${item.groupName}profit`}>
                {(columnKey) => (
                  <TableCell>{renderCell(item, columnKey)}</TableCell>
                )}
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex flex-col gap-2 p-2">
        <div className="flex justify-between items-center">
          <h1 className="font-medium text-2xl">Assets</h1>
          <DateRangePicker
            showMonthAndYearPickers
            label="Date range"
            value={{
              start: parseDate(dateRange2?.startDate),
              end: parseDate(dateRange2?.endDate),
            }}
            className="w-[35%]"
            onChange={(value) => {
              const formattedStart = value.start
                ? `${value.start.year}-${String(value.start.month).padStart(2, "0")}-${String(value.start.day).padStart(2, "0")}`
                : null;
              const formattedEnd = value.end
                ? `${value.end.year}-${String(value.end.month).padStart(2, "0")}-${String(value.end.day).padStart(2, "0")}`
                : null;
              setDateRange2({
                startDate: formattedStart,
                endDate: formattedEnd,
              });
            }}
          />
        </div>
        <Table>
          <TableHeader columns={columns}>
            {(column) => (
              <TableColumn key={column.key}>{column.label}</TableColumn>
            )}
          </TableHeader>
          <TableBody items={balanceSheetAssetsList || []}>
            {(item) => (
              <TableRow key={`${item.groupName}loss`}>
                {(columnKey) => (
                  <TableCell>{renderCell(item, columnKey)}</TableCell>
                )}
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default BalanceSheet;
