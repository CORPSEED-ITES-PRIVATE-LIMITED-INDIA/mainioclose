import { CartesianGrid, Line, LineChart, XAxis } from "recharts";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import dayjs from "dayjs";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "../../components/ui/chart";
import NewSelect from "../../components/NewSelect";
import { parseZonedDateTime } from "@internationalized/date";
import {
  Button,
  DateRangePicker,
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@heroui/react";
import { ListFilter } from "lucide-react";
import { getNameAndEmailById } from "../../common";
import { getAllRevenueDataMonthWise } from "../../toolkit/slices/dashboardSlice";
export const description = "A line chart";
const chartData = [
  { month: "January", desktop: 186 },
  { month: "February", desktop: 305 },
  { month: "March", desktop: 237 },
  { month: "April", desktop: 73 },
  { month: "May", desktop: 209 },
  { month: "June", desktop: 214 },
];
const chartConfig = {
  desktop: {
    label: "Desktop",
    color: "var(--chart-1)",
  },
};

const RevenueChart = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const today = dayjs().format("YYYY-MM-DDTHH:mm");
  const sixMonthsAgo = dayjs().subtract(12, "month").format("YYYY-MM-DDTHH:mm");
  const dashboardUsers = useSelector((state) => state.dashboard.dashboardUsers);
  const data = useSelector((state) => state.dashboard.revenueDataList);
  const [revenueDataFilter, setRevenueDataFilter] = useState({
    toDate: sixMonthsAgo,
    fromDate: today,
    filter: "",
    currentUserId: userId,
    userId: userId,
  });

  useEffect(() => {
    dispatch(getAllRevenueDataMonthWise(revenueDataFilter));
  }, [dispatch, revenueDataFilter]);

  const revenueData = data?.map((item) => ({
    name: dayjs(item?.name).format("MMM"),
    value:item?.value,
  }));

  console.log("revenueData",revenueData)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex justify-between items-center w-full">
          <div className="flex flex-col gap-1">
            <h2 className="font-medium">Revenue </h2>
            <p className="text-default-500 text-xs">
              {dayjs(revenueDataFilter?.toDate).format("MMM YY")} -{" "}
              {dayjs(revenueDataFilter?.fromDate).format("MMM YY")}
            </p>
          </div>
          <div className="flex gap-1">
            <div>
              <p className="text-sm font-medium">
                {
                  getNameAndEmailById(dashboardUsers, revenueDataFilter?.userId)
                    ?.name
                }
              </p>
              <p className="text-xs text-muted-foreground">
                {
                  getNameAndEmailById(dashboardUsers, revenueDataFilter?.userId)
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
                    value={revenueDataFilter?.userId}
                    onChange={(e) =>
                      setRevenueDataFilter((prev) => ({
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
                        `${revenueDataFilter?.toDate}[Asia/kolkata]`
                      ),
                      end: parseZonedDateTime(
                        `${revenueDataFilter?.fromDate}[Asia/kolkata]`
                      ),
                    }}
                    onChange={(value) => {
                      const formattedStart = value.start
                        ? `${value.start.year}-${String(value.start.month).padStart(2, "0")}-${String(value.start.day).padStart(2, "0")}T${String(value.start.hour).padStart(2, "0")}:${String(value.start.minute).padStart(2, "0")}`
                        : null;
                      const formattedEnd = value.end
                        ? `${value.end.year}-${String(value.end.month).padStart(2, "0")}-${String(value.end.day).padStart(2, "0")}T${String(value.end.hour).padStart(2, "0")}:${String(value.end.minute).padStart(2, "0")}`
                        : null;
                      setRevenueDataFilter((prev) => ({
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
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <LineChart
            accessibilityLayer
            data={revenueData}
            margin={{
              left: 12,
              right: 12,
            }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="name"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) => value.slice(0, 3)}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Line
              dataKey="value"
              type="natural"
              stroke="var(--color-desktop)"
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};

export default RevenueChart;
