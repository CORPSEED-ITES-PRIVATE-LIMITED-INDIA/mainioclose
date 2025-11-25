import React, { useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  getAllInFlowList,
  getAllOutFlowList,
} from "../../toolkit/slices/organizationSlice";
import {
  Button,
  DateRangePicker,
  Popover,
  PopoverContent,
  PopoverTrigger,
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
import { FileUp, ListFilter } from "lucide-react";
import { useMediaQuery } from "react-responsive";

const CashFlow = () => {
  const dispatch = useDispatch();
  const today = dayjs().format("YYYY-MM-DDTHH:mm");
  const twoMonthsAgo = dayjs().subtract(2, "month").format("YYYY-MM-DDTHH:mm");
  const inFlowList = useSelector((state) => state.organization.inFlowList);
  const outFlowList = useSelector((state) => state.organization.outFlowList);
  const cashInOutFlowDetail = useSelector((state) => state.organization.cashInOutFlowDetail);
  const [dateRange, setDateRange] = useState({
    startDate: twoMonthsAgo,
    endDate: today,
  });

  const [dateRange2, setDateRange2] = useState({
    startDate: twoMonthsAgo,
    endDate: today,
  });

  const isMedium = useMediaQuery({ minWidth: 768, maxWidth: 1535 });
  const isLarge = useMediaQuery({ minWidth: 1536 });

  useEffect(() => {
    dispatch(getAllInFlowList(dateRange));
  }, [dispatch, dateRange]);

  useEffect(() => {
    dispatch(getAllOutFlowList(dateRange2));
  }, [dispatch, dateRange2]);

  const exportData = (inFlowList || [])?.map((row) => ({
    "Group name": row?.groupName,
    "Total credit": row?.totalCredit,
    "Total debit": row?.totalDebit,
    "Total amount": row?.totalAmount,
  }));
  const headers = ["Group name", "Total credit", "Total debit", "Total amount"];

  const exportData2 = (outFlowList || [])?.map((row) => ({
    "Group name": row?.groupName,
    "Total credit": row?.totalCredit,
    "Total debit": row?.totalDebit,
    "Total amount": row?.totalAmount,
  }));
  const headers2 = [
    "Group name",
    "Total credit",
    "Total debit",
    "Total amount",
  ];

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

  const [view, setView] = useState("vertical");

  const inflow = [
    { label: "Loans (Liability)", value: 56830.0 },
    { label: "Current Liabilities", value: 14848752.68 },
    { label: "Current Assets", value: 197305599.88 },
    { label: "Suspense A/c", value: 746074.61 },
    { label: "Direct Expenses", value: 158230.2 },
    { label: "Indirect Expenses", value: 59515.49 },
  ];

  const outflow = [
    { label: "Loans (Liability)", value: 263490.0 },
    { label: "Current Liabilities", value: 184825983.17 },
    { label: "Current Assets", value: 8973589.63 },
    { label: "Suspense A/c", value: 118700.12 },
    { label: "Sales Accounts", value: 9650.0 },
    { label: "Direct Expenses", value: 7919262.55 },
    { label: "Indirect Expenses", value: 3016984.85 },
  ];

  const companyName = "Corpseed Ites Private Limited.";
  const reportPeriod = "1-Apr-24 to 31-Dec-25";

  return (
    <div className="w-full">
      <div className="flex gap-4 mb-6 justify-center">
        <button
          onClick={() => setView("vertical")}
          className={`px-4 py-2 rounded-md font-semibold border ${
            view === "vertical"
              ? "bg-blue-600 text-white border-blue-600"
              : "bg-white text-gray-700 border-gray-300"
          }`}
        >
          Vertical View
        </button>

        <button
          onClick={() => setView("horizontal")}
          className={`px-4 py-2 rounded-md font-semibold border ${
            view === "horizontal"
              ? "bg-blue-600 text-white border-blue-600"
              : "bg-white text-gray-700 border-gray-300"
          }`}
        >
          Horizontal View
        </button>

        <div className="flex gap-2 items-center">
          <Popover size={isMedium ? "sm" : isLarge ? "md" : ""} showArrow>
            <PopoverTrigger>
              <Button
                variant="flat"
                endContent={<ListFilter />}
                size={isMedium ? "sm" : isLarge ? "md" : ""}
              >
                Filter
              </Button>
            </PopoverTrigger>
            <PopoverContent>
              {(titleProps) => (
                <div className="px-1 py-2">
                  <h3 className="my-1 font-medium text-lg" {...titleProps}>
                    Filter
                  </h3>
                  <div className="flex flex-col gap-2">
                    <DateRangePicker
                      hideTimeZone
                      visibleMonths={2}
                      size={isMedium ? "sm" : isLarge ? "md" : ""}
                      popoverProps={{
                        size: isMedium ? "sm" : isLarge ? "md" : "",
                        placement: isMedium ? "right" : isLarge ? "bottom" : "",
                      }}
                      value={{
                        start: parseZonedDateTime(
                          `${dateRange?.startDate}[Asia/kolkata]`
                        ),
                        end: parseZonedDateTime(
                          `${dateRange?.endDate}[Asia/kolkata]`
                        ),
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
                  </div>
                </div>
              )}
            </PopoverContent>
          </Popover>

          <CSVLink
            className="text-white"
            data={exportData}
            headers={headers}
            filename={"cashflow.csv"}
          >
            <Button size="sm" isIconOnly>
              <FileUp className="h-4 w-4" />
            </Button>
          </CSVLink>
        </div>
      </div>

      {view === "vertical" && (
        <div className="bg-white p-6 shadow-lg rounded-lg max-h-[65vh] overflow-auto">
          <div className="bg-white">
            <h1 className="text-3xl font-bold text-gray-900 text-center">
              {companyName}
            </h1>

            <p className="text-center text-gray-600 text-sm">
              Cash Flow Statement
            </p>

            <p className="text-center text-gray-700 font-medium mt-1">
              Reporting Period: {reportPeriod}
            </p>
          </div>

          <h2 className="text-lg font-bold mb-3 underline">Inflow of Cash :</h2>

          <table className="w-full text-sm mb-6">
            <tbody>
              {inflow.map((item, i) => (
                <tr key={i} className="border-b">
                  <td className="py-2 font-medium">{item.label}</td>
                  <td className="py-2 text-right">{inrCurrency(item.value)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <h2 className="text-lg font-bold mt-6 mb-3 underline">
            Outflow of Cash :
          </h2>

          <table className="w-full text-sm">
            <tbody>
              {outflow.map((item, i) => (
                <tr key={i} className="border-b">
                  <td className="py-2 font-medium">{item.label}</td>
                  <td className="py-2 text-right">{inrCurrency(item.value)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {view === "horizontal" && (
        <div className="flex flex-col max-h-[65vh] overflow-auto  shadow-lg rounded-lg bg-white">
          <div className="py-3">
            <h1 className="text-3xl font-bold text-gray-900 text-center">
              {companyName}
            </h1>

            <p className="text-center text-gray-600 text-sm">
              Cash Flow Statement
            </p>

            <p className="text-center text-gray-700 font-medium mt-1">
              Reporting Period: {reportPeriod}
            </p>
          </div>
          <div className="grid grid-cols-2">
            {/* Inflow */}
            <div className="p-6">
              <h2 className="text-lg font-bold mb-3 underline">
                Inflow of Cash :
              </h2>
              <table className="w-full text-sm">
                <tbody>
                  {inflow.map((item, i) => (
                    <tr key={i} className="border-b">
                      <td className="py-2 font-medium">{item.label}</td>
                      <td className="py-2 text-right">
                        {inrCurrency(item.value)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="p-6">
              <h2 className="text-lg font-bold mb-3 underline">
                Outflow of Cash :
              </h2>
              <table className="w-full text-sm">
                <tbody>
                  {outflow.map((item, i) => (
                    <tr key={i} className="border-b">
                      <td className="py-2 font-medium">{item.label}</td>
                      <td className="py-2 text-right">
                        {inrCurrency(item.value)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CashFlow;

{/* <div className="grid grid-cols-2 gap-2">
  <div className="flex flex-col gap-2 p-2">
    <div className="flex justify-between items-center">
      <h1 className="font-medium text-xl">In flow</h1>
      <div className="flex gap-2 items-center">
        <Popover size={isMedium ? "sm" : isLarge ? "md" : ""} showArrow>
          <PopoverTrigger>
            <Button
              variant="flat"
              endContent={<ListFilter />}
              size={isMedium ? "sm" : isLarge ? "md" : ""}
            >
              Filter
            </Button>
          </PopoverTrigger>
          <PopoverContent>
            {(titleProps) => (
              <div className="px-1 py-2">
                <h3 className="my-1 font-medium text-lg" {...titleProps}>
                  Filter
                </h3>
                <div className="flex flex-col gap-2">
                  <DateRangePicker
                    hideTimeZone
                    visibleMonths={2}
                    size={isMedium ? "sm" : isLarge ? "md" : ""}
                    popoverProps={{
                      size: isMedium ? "sm" : isLarge ? "md" : "",
                      placement: isMedium ? "right" : isLarge ? "bottom" : "",
                    }}
                    value={{
                      start: parseZonedDateTime(
                        `${dateRange?.startDate}[Asia/kolkata]`
                      ),
                      end: parseZonedDateTime(
                        `${dateRange?.endDate}[Asia/kolkata]`
                      ),
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
                </div>
              </div>
            )}
          </PopoverContent>
        </Popover>

        <CSVLink
          className="text-white"
          data={exportData}
          headers={headers}
          filename={"inflow.csv"}
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
        {(column) => <TableColumn key={column.key}>{column.label}</TableColumn>}
      </TableHeader>
      <TableBody items={inFlowList || []}>
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
      <h1 className="font-medium text-xl">Out flow</h1>
      <div className="flex gap-2 items-center">
        <Popover size={isMedium ? "sm" : isLarge ? "md" : ""} showArrow>
          <PopoverTrigger>
            <Button
              variant="flat"
              endContent={<ListFilter />}
              size={isMedium ? "sm" : isLarge ? "md" : ""}
            >
              Filter
            </Button>
          </PopoverTrigger>
          <PopoverContent>
            {(titleProps) => (
              <div className="px-1 py-2">
                <h3 className="my-1 font-medium text-lg" {...titleProps}>
                  Filter
                </h3>
                <div className="flex flex-col gap-2">
                  <DateRangePicker
                    hideTimeZone
                    visibleMonths={2}
                    size={isMedium ? "sm" : isLarge ? "md" : ""}
                    popoverProps={{
                      size: isMedium ? "sm" : isLarge ? "md" : "",
                      placement: isMedium ? "right" : isLarge ? "bottom" : "",
                    }}
                    value={{
                      start: parseZonedDateTime(
                        `${dateRange2?.startDate}[Asia/kolkata]`
                      ),
                      end: parseZonedDateTime(
                        `${dateRange2?.endDate}[Asia/kolkata]`
                      ),
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
                </div>
              </div>
            )}
          </PopoverContent>
        </Popover>

        <CSVLink
          className="text-white"
          data={exportData2}
          headers={headers2}
          filename={"outflow.csv"}
        >
          <Button size="sm" isIconOnly>
            <FileUp className="h-4 w-4" />
          </Button>
        </CSVLink>
      </div>
    </div>

    <Table>
      <TableHeader columns={columns}>
        {(column) => <TableColumn key={column.key}>{column.label}</TableColumn>}
      </TableHeader>
      <TableBody items={outFlowList || []}>
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
</div>; */}
