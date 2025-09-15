import React, { useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  getAllLossList,
  getAllProfitList,
} from "../../toolkit/slices/organizationSlice";
import {
  Button,
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
import { parseZonedDateTime } from "@internationalized/date";
import { CSVLink } from "react-csv";
import { FileUp } from "lucide-react";

const ProfitLoss = () => {
  const dispatch = useDispatch();
  const today = dayjs().format("YYYY-MM-DDTHH:mm");
  const twoMonthsAgo = dayjs().subtract(2, "month").format("YYYY-MM-DDTHH:mm");
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

  const exportData = (lossList || [])?.map((row) => ({
    "Group name": row?.groupName,
    "Total credit": row?.totalCredit,
    "Total debit": row?.totalDebit,
    "Total amount": row?.totalAmount,
  }));

  const headers = ["Group name", "Total credit", "Total debit", "Total amount"];

  const exportData2 = (profitList || [])?.map((row) => ({
    "Group name": row?.groupName,
    "Total credit": row?.totalCredit,
    "Total debit": row?.totalDebit,
    "Total amount": row?.totalAmount,
  }));

  const headers2 = ["Group name", "Total credit", "Total debit", "Total amount"];

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
          <div className="flex gap-2 items-center">
            <DateRangePicker
              hideTimeZone
              visibleMonths={2}
              size="md"
              value={{
                start: parseZonedDateTime(
                  `${dateRange2?.startDate}[Asia/kolkata]`
                ),
                end: parseZonedDateTime(`${dateRange2?.endDate}[Asia/kolkata]`),
              }}
              onChange={(value) => {
                const formattedStart = value.start
                  ? `${value.start.year}-${String(value.start.month).padStart(2, "0")}-${String(value.start.day).padStart(2, "0")}T${String(value.start.hour).padStart(2, "0")}:${String(value.start.minute).padStart(2, "0")}`
                  : null;
                const formattedEnd = value.end
                  ? `${value.end.year}-${String(value.end.month).padStart(2, "0")}-${String(value.end.day).padStart(2, "0")}T${String(value.end.hour).padStart(2, "0")}:${String(value.end.minute).padStart(2, "0")}`
                  : null;
                setDateRange2({
                  startDate: formattedStart,
                  endDate: formattedEnd,
                });
              }}
            />
            <CSVLink
              className="text-white"
              data={exportData}
              headers={headers}
              filename={"loss.csv"}
            >
              <Button size="sm" isIconOnly>
                <FileUp className="h-4 w-4" />
              </Button>
            </CSVLink>
          </div>
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
              data={exportData2}
              headers={headers2}
              filename={"profit.csv"}
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
