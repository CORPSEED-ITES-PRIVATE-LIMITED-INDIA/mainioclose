import { useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  getAllBalanceSheetAssets,
  getAllBalanceSheetLiabilities,
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

const BalanceSheet = () => {
  const dispatch = useDispatch();
  const today = dayjs().format("YYYY-MM-DDTHH:mm");
  const twoMonthsAgo = dayjs().subtract(2, "month").format("YYYY-MM-DDTHH:mm");
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

  const isMedium = useMediaQuery({ minWidth: 768, maxWidth: 1535 });
  const isLarge = useMediaQuery({ minWidth: 1536 });

  useEffect(() => {
    dispatch(getAllBalanceSheetLiabilities(dateRange));
  }, [dispatch, dateRange]);

  useEffect(() => {
    dispatch(getAllBalanceSheetAssets(dateRange2));
  }, [dispatch, dateRange2]);

  const exportData = (balanceSheetAssetsList?.data || [])?.map((row) => ({
    "Group name": row?.groupName,
    "Total credit": row?.totalCredit,
    "Total debit": row?.totalDebit,
    "Total amount": row?.totalAmount,
  }));
  const headers = ["Group name", "Total credit", "Total debit", "Total amount"];

  const exportData2 = (balanceSheetLiabilitiesList?.data || [])?.map((row) => ({
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

  return (
    <div className="grid grid-cols-2 gap-2">
      <div className="flex flex-col gap-2 p-2">
        <div className="flex justify-between items-center">
          <h1 className="font-medium text-xl">Liabilities</h1>
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
                          placement: isMedium
                            ? "right"
                            : isLarge
                              ? "bottom"
                              : "",
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
              filename={"liabilities.csv"}
            >
              <Button size="sm" isIconOnly>
                <FileUp className="h-4 w-4" />
              </Button>
            </CSVLink>
          </div>
        </div>
        <div>
          <h3 className="font-medium text-md">
            Total amount :{" "}
            {inrCurrency(balanceSheetLiabilitiesList?.totalPrice)}
          </h3>
        </div>
        <Table
          classNames={{
            wrapper: "max-h-[60vh]",
          }}
        >
          <TableHeader columns={columns}>
            {(column) => (
              <TableColumn key={column.key}>{column.label}</TableColumn>
            )}
          </TableHeader>
          <TableBody items={balanceSheetLiabilitiesList?.data || []}>
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
          <h1 className="font-medium text-xl">Assets</h1>
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
                          placement: isMedium
                            ? "right"
                            : isLarge
                              ? "bottom"
                              : "",
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
              filename={"assets.csv"}
            >
              <Button size="sm" isIconOnly>
                <FileUp className="h-4 w-4" />
              </Button>
            </CSVLink>
          </div>
        </div>
        <h3 className="font-medium text-md">
          Total amount : {inrCurrency(balanceSheetAssetsList?.totalPrice)}
        </h3>
        <Table>
          <TableHeader columns={columns}>
            {(column) => (
              <TableColumn key={column.key}>{column.label}</TableColumn>
            )}
          </TableHeader>
          <TableBody items={balanceSheetAssetsList?.data || []}>
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
