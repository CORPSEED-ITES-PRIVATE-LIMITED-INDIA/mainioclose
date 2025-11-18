import React, { useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  getProfitLossDetail,
} from "../../toolkit/slices/organizationSlice";
import {
  Button,
  DateRangePicker,
} from "@heroui/react";
import { inrCurrency } from "../../common";
import dayjs from "dayjs";
import { parseZonedDateTime } from "@internationalized/date";
import { CSVLink } from "react-csv";
import { FileUp } from "lucide-react";
import { useMediaQuery } from "react-responsive";

const ProfitLoss = () => {
  const dispatch = useDispatch();
  const today = dayjs().format("YYYY-MM-DDTHH:mm");
  const twoMonthsAgo = dayjs().subtract(2, "month").format("YYYY-MM-DDTHH:mm");
  const profitLossDetail = useSelector(
    (state) => state.organization.profitLossDetail
  );
  const lossList = useSelector((state) => state.organization.lossDetail?.data);

  const [dateRange2, setDateRange2] = useState({
    startDate: twoMonthsAgo,
    endDate: today,
  });

  const isMedium = useMediaQuery({ minWidth: 768, maxWidth: 1535 });
  const isLarge = useMediaQuery({ minWidth: 1536 });

  const exportData = (lossList || [])?.map((row) => ({
    "Group name": row?.groupName,
    "Total credit": row?.totalCredit,
    "Total debit": row?.totalDebit,
    "Total amount": row?.totalAmount,
  }));

  const headers = ["Group name", "Total credit", "Total debit", "Total amount"];

  useEffect(() => {
    dispatch(getProfitLossDetail(dateRange2));
  }, [dispatch, dateRange2]);

  return (
    <>
      <div className="flex justify-between items-center px-2">
        <h1 className="font-medium text-xl">Profit/Loss</h1>
        <div className="flex items-center gap-2">
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
      <div className="w-full bg-white p-4 rounded-lg">
        <div className="border border-gray-300 rounded-lg overflow-hidden">
          <div className="max-h-[72vh] overflow-y-auto">
            <table className="w-full border-collapse">
              <thead className="bg-gray-100 sticky top-0 z-10 border-b border-gray-300">
                <tr className="text-left text-gray-700 font-semibold">
                  <th className="py-2 px-3 border-r border-gray-300">Title</th>
                  <th className="py-2 px-3 text-center border-r border-gray-300">
                    Previous Amount
                  </th>
                  <th className="py-2 px-3 text-center">Current Amount</th>
                </tr>
              </thead>

              <tbody>
                {profitLossDetail?.data?.map((item, index) => (
                  <React.Fragment key={index}>
                    {"data" in item ? (
                      <tr>
                        <td
                          colSpan="3"
                          className="pt-6 pb-2 px-3 font-bold text-lg text-gray-900 bg-white"
                        >
                          {item.title}
                        </td>
                      </tr>
                    ) : (
                      <tr className="hover:bg-gray-50 transition">
                        <td className="py-2 px-3 text-gray-900">
                          {item.title}
                        </td>
                        <td className="py-2 px-3 text-center text-gray-700">
                          {inrCurrency(item.prevAmount)}
                        </td>
                        <td className="py-2 px-3 text-center text-gray-700">
                          {inrCurrency(item.currentAmount)}
                        </td>
                      </tr>
                    )}
                    {"data" in item &&
                      item?.data?.map((child, cIdx) => (
                        <tr
                          key={`${index}-${cIdx}`}
                          className="hover:bg-gray-50 transition"
                        >
                          <td className="py-2 pl-8 pr-3 text-gray-700">
                            {child.title}
                          </td>
                          <td className="py-2 px-3 text-center text-gray-600">
                            {inrCurrency(child.prevAmount)}
                          </td>
                          <td className="py-2 px-3 text-center text-gray-600">
                            {inrCurrency(child.currentAmount)}
                          </td>
                        </tr>
                      ))}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
};

export default ProfitLoss;
