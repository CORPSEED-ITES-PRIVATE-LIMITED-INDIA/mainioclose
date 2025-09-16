import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { getNameAndEmailById } from "../../common";
import {
  Button,
  DateRangePicker,
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@heroui/react";
import { ListFilter } from "lucide-react";
import NewSelect from "../../components/NewSelect";
import { parseZonedDateTime } from "@internationalized/date";
import dayjs from "dayjs";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "../../components/ui/chart";
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";
import { useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useState } from "react";

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

const ConvertedLeadsDataChart = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const dashboardUsers = useSelector((state) => state.dashboard.dashboardUsers);
  const today = dayjs().format("YYYY-MM-DDTHH:mm");
  const sixMonthsAgo = dayjs().subtract(6, "month").format("YYYY-MM-DDTHH:mm");

  const [convertedLeadDataFilter, setConvertedLeadDataFilter] = useState({
    toDate: sixMonthsAgo,
    fromDate: today,
    filter: "",
    currentUserId: userId,
    userId: userId,
  });


  

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex justify-between items-center w-full">
          <div className="flex flex-col gap-1">
            <h2 className="font-medium">Converted Leads</h2>
            <p className="text-default-500 text-xs">
              {dayjs(convertedLeadDataFilter?.toDate).format("MMM YY")} -{" "}
              {dayjs(convertedLeadDataFilter?.fromDate).format("MMM YY")}
            </p>
          </div>
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
                    hideTimeZone
                    label="Date range"
                    value={{
                      start: parseZonedDateTime(
                        `${convertedLeadDataFilter?.toDate}[Asia/kolkata]`
                      ),
                      end: parseZonedDateTime(
                        `${convertedLeadDataFilter?.fromDate}[Asia/kolkata]`
                      ),
                    }}
                    onChange={(value) => {
                      const formattedStart = value.start
                        ? `${value.start.year}-${String(value.start.month).padStart(2, "0")}-${String(value.start.day).padStart(2, "0")}T${String(value.start.hour).padStart(2, "0")}:${String(value.start.minute).padStart(2, "0")}`
                        : null;
                      const formattedEnd = value.end
                        ? `${value.end.year}-${String(value.end.month).padStart(2, "0")}-${String(value.end.day).padStart(2, "0")}T${String(value.end.hour).padStart(2, "0")}:${String(value.end.minute).padStart(2, "0")}`
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
    </Card>
  );
};

export default ConvertedLeadsDataChart;
