import React, { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import {
  Button,
  DateRangePicker,
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@heroui/react";
import { ListFilter } from "lucide-react";
import NewSelect from "../../components/NewSelect";
import dayjs from "dayjs";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "../../components/ui/chart";
import { CartesianGrid, LabelList, Pie, PieChart } from "recharts";
import { useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { parseZonedDateTime } from "@internationalized/date";
import { getConversionReport } from "../../toolkit/slices/dashboardSlice";

const pieChartData = [
  { browser: "chrome", visitors: 275, fill: "var(--color-chrome)" },
  { browser: "safari", visitors: 200, fill: "var(--color-safari)" },
  { browser: "firefox", visitors: 187, fill: "var(--color-firefox)" },
  { browser: "edge", visitors: 173, fill: "var(--color-edge)" },
  { browser: "other", visitors: 90, fill: "var(--color-other)" },
];
const statusChartConfig = {
  Key: {
    label: "Key",
  },
  New: {
    label: "New",
    color: "var(--chart-1)",
  },
  "Follow Up": {
    label: "Follow Up",
    color: "var(--chart-2)",
  },
  "Proposal Sent": {
    label: "Proposal Sent",
    color: "var(--chart-3)",
  },
  "Hot Leads": {
    label: "Hot Leads",
    color: "var(--chart-4)",
  },
  "Awaiting Documents": {
    label: "Awaiting Documents",
    color: "var(--chart-4)",
  },
  "Awaiting Payment": {
    label: "Awaiting Payment",
    color: "var(--chart-5)",
  },
  "Bad Fit": {
    label: "Bad Fit",
    color: "var(--chart-6)",
  },
};

const ConversionStatus = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const today = dayjs().format("YYYY-MM-DDTHH:mm");
  const sixMonthsAgo = dayjs().subtract(6, "month").format("YYYY-MM-DDTHH:mm");
  const dashboardUsers = useSelector((state) => state.dashboard.dashboardUsers);
  const conversionData = useSelector(
    (state) => state.dashboard.conversionReport
  );
  const [statusConversionDataFilter, setstatusConversionDataFilter] = useState({
    toDate: sixMonthsAgo,
    fromDate: today,
    filter: "",
    currentUserId: userId,
    userId: userId,
  });

  useEffect(()=>{
    dispatch(getConversionReport(statusConversionDataFilter))
  },[dispatch])


    const formattedData = conversionData?.map((item) => ({
    ...item,
    fill: statusChartConfig[item.key]?.color || "var(--default-color)",
  }));


  return (
    <Card className="flex flex-col">
      <CardHeader>
        <CardTitle className="flex justify-between items-center w-full">
          <div className="flex flex-col gap-1">
            <h2 className="font-medium">Status Conversion </h2>
            <p className="text-default-500 text-xs">
              {dayjs(statusConversionDataFilter?.toDate).format("MMM YY")} -{" "}
              {dayjs(statusConversionDataFilter?.fromDate).format("MMM YY")}
            </p>
          </div>
          <Popover placement="bottom-end" showArrow={true}>
            <PopoverTrigger children>
              <Button size="sm" variant="light" isIconOnly>
                <ListFilter />
              </Button>
            </PopoverTrigger>
            <PopoverContent>
              <div className="flex flex-col gap-2">
                <NewSelect
                  label={"Users"}
                  data={dashboardUsers}
                  labelKey={"name"}
                  valueKey={"id"}
                  value={statusConversionDataFilter?.userId}
                  onChange={(e) =>
                    setstatusConversionDataFilter((prev) => ({
                      ...prev,
                      userId: e,
                    }))
                  }
                />
                <DateRangePicker
                  showMonthAndYearPickers
                  hideTimeZone
                  label="Date range"
                  value={{
                    start: parseZonedDateTime(
                      `${statusConversionDataFilter?.toDate}[Asia/kolkata]`
                    ),
                    end: parseZonedDateTime(
                      `${statusConversionDataFilter?.fromDate}[Asia/kolkata]`
                    ),
                  }}
                  onChange={(value) => {
                    const formattedStart = value.start
                      ? `${value.start.year}-${String(value.start.month).padStart(2, "0")}-${String(value.start.day).padStart(2, "0")}T${String(value.start.hour).padStart(2, "0")}:${String(value.start.minute).padStart(2, "0")}`
                      : null;
                    const formattedEnd = value.end
                      ? `${value.end.year}-${String(value.end.month).padStart(2, "0")}-${String(value.end.day).padStart(2, "0")}T${String(value.end.hour).padStart(2, "0")}:${String(value.end.minute).padStart(2, "0")}`
                      : null;
                    setstatusConversionDataFilter((prev) => ({
                      ...prev,
                      toDate: formattedStart,
                      fromDate: formattedEnd,
                    }));
                  }}
                />
              </div>
            </PopoverContent>
          </Popover>
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <ChartContainer
          config={statusChartConfig}
          className="mx-auto aspect-square max-h-[300px]"
        >
          <PieChart>
            <CartesianGrid vertical={false} />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  nameKey="key"
                  hideLabel
                />
              }
            />
            <Pie
              data={formattedData}
              dataKey="value"
            >
              <LabelList
                dataKey="key"
                className="fill-background"
                stroke="none"
                fontSize={12}
                formatter={(value) => value}
              />
            </Pie>
          </PieChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};

export default ConversionStatus;
