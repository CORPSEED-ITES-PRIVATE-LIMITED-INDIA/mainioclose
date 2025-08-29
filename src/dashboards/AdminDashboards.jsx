import React, { useEffect, useState } from "react";
import { ListFilter, TrendingUp } from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  LabelList,
  XAxis,
} from "recharts";
import { PieChart, Pie, Cell, Legend } from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "../components/ui/chart";
import { useDispatch, useSelector } from "react-redux";
import {
  getConversionReport,
  getDashboardUsersByHeirarchy,
  getLeadsDataByMonth,
} from "../toolkit/slices/dashboardSlice";
import { useParams } from "react-router-dom";
import NewSelect from "../components/NewSelect";
import {
  Button,
  DateRangePicker,
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@heroui/react";
import { CalendarDate } from "@internationalized/date";
import dayjs from "dayjs";
import { getNameAndEmailById } from "../common";

export const description = "A bar chart";

const chartConfig = {
  desktop: {
    label: "Desktop",
    color: "var(--chart-1)",
  },
};

const pieChartData = [
  { browser: "chrome", visitors: 275, fill: "var(--color-chrome)" },
  { browser: "safari", visitors: 200, fill: "var(--color-safari)" },
  { browser: "firefox", visitors: 187, fill: "var(--color-firefox)" },
  { browser: "edge", visitors: 173, fill: "var(--color-edge)" },
  { browser: "other", visitors: 90, fill: "var(--color-other)" },
];
const pieChartConfig = {
  visitors: {
    label: "Visitors",
  },
  chrome: {
    label: "Chrome",
    color: "var(--chart-1)",
  },
  safari: {
    label: "Safari",
    color: "var(--chart-2)",
  },
  firefox: {
    label: "Firefox",
    color: "var(--chart-3)",
  },
  edge: {
    label: "Edge",
    color: "var(--chart-4)",
  },
  other: {
    label: "Other",
    color: "var(--chart-5)",
  },
};

const areaChartData = [
  { month: "January", desktop: 186 },
  { month: "February", desktop: 305 },
  { month: "March", desktop: 237 },
  { month: "April", desktop: 73 },
  { month: "May", desktop: 209 },
  { month: "June", desktop: 214 },
];
const areaChartConfig = {
  desktop: {
    label: "Desktop",
    color: "var(--chart-1)",
  },
};

const barChartConfig = {
  desktop: {
    label: "Desktop",
    color: "var(--chart-1)",
  },
  mobile: {
    label: "Mobile",
    color: "var(--chart-2)",
  },
};

const AdminDashboards = () => {
  const dispatch = useDispatch();
  const { userId } = useParams();
  const today = dayjs();
  const sixMonthsAgo = dayjs().subtract(6, "month");
  const leadsData = useSelector((state) => state.dashboard.leadDataMonthWise);
  const conversionData = useSelector(
    (state) => state.dashboard.conversionReport
  );
  const dashboardUsers = useSelector((state) => state.dashboard.dashboardUsers);
  const [leadDataFilter, setLeadDataFilter] = useState({
    toDate: sixMonthsAgo.toDate(),
    fromDate: today.toDate(),
    filter: "",
    currentUserId: userId,
    userId: userId,
  });
  const [convertedLeadDataFilter, setConvertedLeadDataFilter] = useState({
    toDate: sixMonthsAgo.toDate(),
    fromDate: today.toDate(),
    filter: "",
    currentUserId: userId,
    userId: userId,
  });

  useEffect(() => {
    dispatch(getLeadsDataByMonth(leadDataFilter));
  }, [leadDataFilter, dispatch]);

  useEffect(() => {
    dispatch(getConversionReport(convertedLeadDataFilter));
  }, [dispatch, convertedLeadDataFilter]);

  useEffect(() => {
    dispatch(getDashboardUsersByHeirarchy(userId));
  }, [dispatch]);

  const toCalendarDate = (dateString) => {
    if (!dateString) return null;
    const d = dayjs(dateString, "YYYY-MM-DD");
    return new CalendarDate(d.year(), d.month() + 1, d.date());
  };

  return (
    <div className="grid grid-cols-2 gap-4 max-h-[85vh] overflow-auto">
      <Card>
        <CardHeader>
          <CardTitle className="flex justify-between items-center w-full">
            Leads Data Chart{" "}
            <div className="flex gap-1">
              <div>
                <p className="text-sm font-medium">
                  {
                    getNameAndEmailById(dashboardUsers, leadDataFilter?.userId)
                      ?.name
                  }
                </p>
                <p className="text-xs text-muted-foreground">
                  {
                    getNameAndEmailById(dashboardUsers, leadDataFilter?.userId)
                      ?.email
                  }
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
                      value={leadDataFilter?.userId}
                      onChange={(e) =>
                        setLeadDataFilter((prev) => ({ ...prev, userId: e }))
                      }
                    />
                    <DateRangePicker
                      showMonthAndYearPickers
                      label="Date range"
                      value={{
                        start: toCalendarDate(leadDataFilter?.toDate),
                        end: toCalendarDate(leadDataFilter?.fromDate),
                      }}
                      onChange={(value) => {
                        const formattedStart = value.start
                          ? `${value.start.year}-${String(value.start.month).padStart(2, "0")}-${String(value.start.day).padStart(2, "0")}`
                          : null;
                        const formattedEnd = value.end
                          ? `${value.end.year}-${String(value.end.month).padStart(2, "0")}-${String(value.end.day).padStart(2, "0")}`
                          : null;
                        setLeadDataFilter((prev) => ({
                          ...prev,
                          toDate: formattedStart,
                          fromDate: formattedEnd,
                        }));
                      }}
                    />
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          </CardTitle>
          <CardDescription>
            {dayjs(leadDataFilter?.toDate).format("MMMM YYYY")} -{" "}
            {dayjs(leadDataFilter?.fromDate).format("MMMM YYYY")}
          </CardDescription>
        </CardHeader>

        <CardContent>
          <ChartContainer config={chartConfig}>
            <BarChart accessibilityLayer data={leadsData}>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="name"
                tickLine={false}
                tickMargin={10}
                axisLine={false}
                tickFormatter={(value) => dayjs(value).format("MMM")}
              />
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent hideLabel />}
              />
              <Bar dataKey="value" fill="var(--color-desktop)" radius={8} />
            </BarChart>
          </ChartContainer>
        </CardContent>
        <CardFooter className="flex-col items-start gap-2 text-sm">
          <div className="flex gap-2 leading-none font-medium">
            Trending up by 5.2% this month <TrendingUp className="h-4 w-4" />
          </div>
          <div className="text-muted-foreground leading-none">
            Showing total visitors for the last 6 months
          </div>
        </CardFooter>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle className="flex justify-between items-center w-full">
            Converted Leads Data Chart{" "}
            <div className="flex gap-1">
              <div>
                <p className="text-sm font-medium">
                  {
                    getNameAndEmailById(
                      dashboardUsers,
                      convertedLeadDataFilter?.userId
                    )?.name
                  }
                </p>
                <p className="text-xs text-muted-foreground">
                  {
                    getNameAndEmailById(
                      dashboardUsers,
                      convertedLeadDataFilter?.userId
                    )?.email
                  }
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
                      value={convertedLeadDataFilter?.userId}
                      onChange={(e) =>
                        setConvertedLeadDataFilter((prev) => ({
                          ...prev,
                          userId: e,
                        }))
                      }
                    />
                    <DateRangePicker
                      showMonthAndYearPickers
                      label="Date range"
                      value={{
                        start: toCalendarDate(convertedLeadDataFilter?.toDate),
                        end: toCalendarDate(convertedLeadDataFilter?.fromDate),
                      }}
                      onChange={(value) => {
                        const formattedStart = value.start
                          ? `${value.start.year}-${String(value.start.month).padStart(2, "0")}-${String(value.start.day).padStart(2, "0")}`
                          : null;
                        const formattedEnd = value.end
                          ? `${value.end.year}-${String(value.end.month).padStart(2, "0")}-${String(value.end.day).padStart(2, "0")}`
                          : null;
                        setConvertedLeadDataFilter((prev) => ({
                          ...prev,
                          toDate: formattedStart,
                          fromDate: formattedEnd,
                        }));
                      }}
                    />
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          </CardTitle>
          <CardDescription>
            {dayjs(leadDataFilter?.toDate).format("MMMM YYYY")} -{" "}
            {dayjs(leadDataFilter?.fromDate).format("MMMM YYYY")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={areaChartConfig}>
            <AreaChart
              accessibilityLayer
              data={areaChartData}
              margin={{
                left: 12,
                right: 12,
              }}
            >
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="month"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tickFormatter={(value) => value.slice(0, 3)}
              />
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent indicator="line" />}
              />
              <Area
                dataKey="desktop"
                type="natural"
                fill="var(--color-desktop)"
                fillOpacity={0.4}
                stroke="var(--color-desktop)"
              />
            </AreaChart>
          </ChartContainer>
        </CardContent>
        <CardFooter>
          <div className="flex w-full items-start gap-2 text-sm">
            <div className="grid gap-2">
              <div className="flex items-center gap-2 leading-none font-medium">
                Trending up by 5.2% this month{" "}
                <TrendingUp className="h-4 w-4" />
              </div>
              <div className="text-muted-foreground flex items-center gap-2 leading-none">
                January - June 2024
              </div>
            </div>
          </div>
        </CardFooter>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle className="flex justify-between items-center w-full">
            Projects Data Chart{" "}
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
                    value={leadDataFilter?.userId}
                    onChange={(e) =>
                      setLeadDataFilter((prev) => ({ ...prev, userId: e }))
                    }
                  />
                  <DateRangePicker
                    showMonthAndYearPickers
                    label="Date range"
                    value={{
                      start: toCalendarDate(convertedLeadDataFilter?.toDate),
                      end: toCalendarDate(convertedLeadDataFilter?.fromDate),
                    }}
                    onChange={(value) => {
                      const formattedStart = value.start
                        ? `${value.start.year}-${String(value.start.month).padStart(2, "0")}-${String(value.start.day).padStart(2, "0")}`
                        : null;
                      const formattedEnd = value.end
                        ? `${value.end.year}-${String(value.end.month).padStart(2, "0")}-${String(value.end.day).padStart(2, "0")}`
                        : null;
                      setConvertedLeadDataFilter((prev) => ({
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
          <CardDescription>
            {dayjs(leadDataFilter?.toDate).format("MMMM YYYY")} -{" "}
            {dayjs(leadDataFilter?.fromDate).format("MMMM YYYY")}
          </CardDescription>
        </CardHeader>

        <CardContent>
          <ChartContainer config={chartConfig}>
            <BarChart accessibilityLayer data={[]}>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="name"
                tickLine={false}
                tickMargin={10}
                axisLine={false}
                tickFormatter={(value) => dayjs(value).format("MMM")}
              />
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent hideLabel />}
              />
              <Bar dataKey="value" fill="var(--color-desktop)" radius={8} />
            </BarChart>
          </ChartContainer>
        </CardContent>
        <CardFooter className="flex-col items-start gap-2 text-sm">
          <div className="flex gap-2 leading-none font-medium">
            Trending up by 5.2% this month <TrendingUp className="h-4 w-4" />
          </div>
          <div className="text-muted-foreground leading-none">
            Showing total visitors for the last 6 months
          </div>
        </CardFooter>
      </Card>
      <Card className="flex flex-col">
        <CardHeader>
          <CardTitle className="flex justify-between items-center w-full">
            Status Conversion
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
                    value={leadDataFilter?.userId}
                    onChange={(e) =>
                      setLeadDataFilter((prev) => ({ ...prev, userId: e }))
                    }
                  />
                  <DateRangePicker
                    showMonthAndYearPickers
                    label="Date range"
                    value={{
                      start: toCalendarDate(convertedLeadDataFilter?.toDate),
                      end: toCalendarDate(convertedLeadDataFilter?.fromDate),
                    }}
                    onChange={(value) => {
                      const formattedStart = value.start
                        ? `${value.start.year}-${String(value.start.month).padStart(2, "0")}-${String(value.start.day).padStart(2, "0")}`
                        : null;
                      const formattedEnd = value.end
                        ? `${value.end.year}-${String(value.end.month).padStart(2, "0")}-${String(value.end.day).padStart(2, "0")}`
                        : null;
                      setConvertedLeadDataFilter((prev) => ({
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
          <CardDescription>
            {dayjs(leadDataFilter?.toDate).format("MMMM YYYY")} -{" "}
            {dayjs(leadDataFilter?.fromDate).format("MMMM YYYY")}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex-1 pb-0">
          <ChartContainer
            config={pieChartConfig}
            className="[&_.recharts-text]:fill-background mx-auto aspect-square max-h-[250px]"
          >
            <PieChart>
              <CartesianGrid vertical={false} />
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    nameKey="value"
                    labelKey="value"
                    hideLabel
                  />
                }
              />
              <Pie
                data={conversionData?.map((item, idx) => ({
                  ...item,
                  value: (idx + 1 + item.value) * 6,
                  fill: pieChartData[idx]?.fill,
                }))}
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
        <CardFooter className="flex-col gap-2 text-sm">
          <div className="flex items-center gap-2 leading-none font-medium">
            Trending up by 5.2% this month <TrendingUp className="h-4 w-4" />
          </div>
          <div className="text-muted-foreground leading-none">
            Showing total visitors for the last 6 months
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

export default AdminDashboards;
