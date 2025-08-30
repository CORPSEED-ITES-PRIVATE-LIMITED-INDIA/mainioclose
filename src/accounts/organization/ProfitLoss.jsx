import React, { useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  getAllLossList,
  getAllProfitList,
} from "../../toolkit/slices/organizationSlice";
import {
  DateRangePicker,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
} from "@heroui/react";
import { inrCurrency } from "../../common";
import dayjs from "dayjs";
import { parseDate, toCalendarDate } from "@internationalized/date";

const ProfitLoss = () => {
  const dispatch = useDispatch();
  const today = dayjs().format("YYYY-MM-DD");
  const twoMonthsAgo = dayjs().subtract(2, "month").format("YYYY-MM-DD");
  const profitDetail = useSelector((state) => state.organization.profitDetail);
  const profitList = useSelector(
    (state) => state.organization.profitDetail?.data
  );
  const lossDetail = useSelector((state) => state.organization.lossDetail);
  const lossList = useSelector((state) => state.organization.lossDetail?.data);
  const [dateRange, setDateRange] = useState({
    startDate: twoMonthsAgo,
    endDate: today,
  });

  const [dateRange2, setDateRange2] = useState({
    startDate: twoMonthsAgo,
    endDate: today,
  });

  useEffect(() => {
    dispatch(getAllProfitList(dateRange));
  }, [dispatch, dateRange]);

  useEffect(() => {
    dispatch(getAllLossList(dateRange2));
  }, [dispatch, dateRange2]);

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
    <div className="grid grid-cols-2 gap-2">
      <div className="flex flex-col gap-2 p-2">
        <div className="flex justify-between items-center">
          <h1 className="font-medium text-2xl">Loss</h1>
          <DateRangePicker
            showMonthAndYearPickers
            label="Date range"
            className="w-[35%]"
            value={{
              start: parseDate(dateRange2?.startDate),
              end: parseDate(dateRange2?.endDate),
            }}
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

        <Table
          bottomContent={
            <div className="flex flex-col gap-2">
              <Divider />
              <div className="flex justify-between w-[85%] px-3">
                <div>Gross profit</div>
                <div>{inrCurrency(lossDetail?.grossProfit)}</div>
              </div>
              <div className="flex justify-between w-[85%] px-3">
                <div>Indirect expences</div>
                <div>{inrCurrency(lossDetail?.indirectExpenses)}</div>
              </div>
              <div className="flex justify-between w-[85%] px-3">
                <div>Total sale</div>
                <div>{inrCurrency(lossDetail?.totalSale)}</div>
              </div>
              <div className="flex justify-between w-[85%] px-3">
                <div>Net profit</div>
                <div>{inrCurrency(lossDetail?.nettProfit)}</div>
              </div>
            </div>
          }
        >
          <TableHeader columns={columns}>
            {(column) => (
              <TableColumn key={column.key}>{column.label}</TableColumn>
            )}
          </TableHeader>
          <TableBody items={lossList || []}>
            {(item) => (
              <TableRow key={`${item.groupName}loss`}>
                {(columnKey) => (
                  <TableCell>{renderCell(item, columnKey)}</TableCell>
                )}
              </TableRow>
            )}
            {/* <TableRow>
              <TableCell></TableCell>
              <TableCell></TableCell>
              <TableCell></TableCell>
              <TableCell></TableCell>
            </TableRow> */}
          </TableBody>
        </Table>
      </div>
      <div className="flex flex-col gap-2 p-2">
        <div className="flex justify-between items-center">
          <h1 className="font-medium text-2xl">Profit</h1>
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
          bottomContent={
            <div className="flex flex-col gap-2">
              <Divider />
              <div className="flex justify-between w-[85%] px-3">
                <div>Gross profit</div>
                <div>{inrCurrency(profitDetail?.grossProfit)}</div>
              </div>
              <div className="flex justify-between w-[85%] px-3">
                <div>Total sum</div>
                <div>{inrCurrency(profitDetail?.totalSum)}</div>
              </div>
            </div>
          }
        >
          <TableHeader columns={columns}>
            {(column) => (
              <TableColumn key={column.key}>{column.label}</TableColumn>
            )}
          </TableHeader>
          <TableBody items={profitList || []}>
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
    </div>
  );
};

export default ProfitLoss;
