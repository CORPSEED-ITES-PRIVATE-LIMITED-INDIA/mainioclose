import React, { useEffect, useState } from "react";
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
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "../../components/ui/chart";
import { Pie, PieChart } from "recharts";
import { useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { getLeadsDistributionStatusWise } from "../../toolkit/slices/dashboardSlice";


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

const LeadStatusChart = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const dashboardUsers = useSelector((state) => state.dashboard.dashboardUsers);
  const data = useSelector((state) => state.dashboard.leadStatusWiseData?.data);
  const today = dayjs().format("YYYY-MM-DDTHH:mm");
  const sixMonthsAgo = dayjs().subtract(6, "month").format("YYYY-MM-DDTHH:mm");
  const [statusLeadDataFilter, setStatusLeadDataFilter] = useState({
    toDate: sixMonthsAgo,
    fromDate: today,
    filter: "",
    currentUserId: userId,
    userId: userId,
  });

  useEffect(() => {
    dispatch(getLeadsDistributionStatusWise(statusLeadDataFilter));
  }, [dispatch, statusLeadDataFilter]);

  const formattedData = data?.map((item) => ({
    ...item,
    fill: statusChartConfig[item.key]?.color || "var(--default-color)",
  }));

  return (
    <Card className="flex flex-col">
      <CardHeader className="items-center pb-0">
        <CardTitle className="flex justify-between items-center w-full">
          <div className="flex flex-col gap-1">
            <h2 className="font-medium">Status</h2>
            <p className="text-default-500 text-xs">
              {dayjs(statusLeadDataFilter?.toDate).format("MMM YY")} -{" "}
              {dayjs(statusLeadDataFilter?.fromDate).format("MMM YY")}
            </p>
          </div>
          <div className="flex gap-1">
            <div>
              <p className="text-sm font-medium">
                {
                  getNameAndEmailById(
                    dashboardUsers,
                    statusLeadDataFilter?.userId
                  )?.name
                }
              </p>
              <p className="text-xs text-muted-foreground">
                {
                  getNameAndEmailById(
                    dashboardUsers,
                    statusLeadDataFilter?.userId
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
                    value={statusLeadDataFilter?.userId}
                    onChange={(e) =>
                      setStatusLeadDataFilter((prev) => ({
                        ...prev,
                        userId: e,
                      }))
                    }
                  />
                  <DateRangePicker
                    hideTimeZone
                    visibleMonths={2}
                    size="md"
                    label="Date range"
                    value={{
                      start: parseZonedDateTime(
                        `${statusLeadDataFilter?.toDate}[Asia/kolkata]`
                      ),
                      end: parseZonedDateTime(
                        `${statusLeadDataFilter?.fromDate}[Asia/kolkata]`
                      ),
                    }}
                    onChange={(value) => {
                      const formattedStart = value.start
                        ? `${value.start.year}-${String(value.start.month).padStart(2, "0")}-${String(value.start.day).padStart(2, "0")}T${String(value.start.hour).padStart(2, "0")}:${String(value.start.minute).padStart(2, "0")}`
                        : null;
                      const formattedEnd = value.end
                        ? `${value.end.year}-${String(value.end.month).padStart(2, "0")}-${String(value.end.day).padStart(2, "0")}T${String(value.end.hour).padStart(2, "0")}:${String(value.end.minute).padStart(2, "0")}`
                        : null;
                      setStatusLeadDataFilter((prev) => ({
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
      <CardContent className="flex-1 pb-0">
        <ChartContainer
          config={statusChartConfig}
          className="mx-auto aspect-square max-h-[300px]"
        >
          <PieChart>
            <ChartTooltip
              content={<ChartTooltipContent nameKey="key" hideLabel />}
            />
            <Pie data={formattedData} dataKey="value" />
            <ChartLegend
              content={<ChartLegendContent nameKey="key" />}
              className="flex flex-wrap gap-2"
            />
          </PieChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};

export default LeadStatusChart;
