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
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "../../components/ui/chart";
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts";
import { useDispatch, useSelector } from "react-redux";
import dayjs from "dayjs";
import { useNavigate, useParams } from "react-router-dom";
import { getLeadsDataByMonth } from "../../toolkit/slices/dashboardSlice";

const chartConfig = {
  desktop: {
    label: "Desktop",
    color: "var(--chart-1)",
  },
};

const LeadDataChart = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const today = dayjs().format("YYYY-MM-DDTHH:mm");
  const sixMonthsAgo = dayjs().subtract(11, "month").format("YYYY-MM-DDTHH:mm");
  const dashboardUsers = useSelector((state) => state.dashboard.dashboardUsers);
  const leadsData = useSelector((state) => state.dashboard.leadDataMonthWise);

  const [leadDataFilter, setLeadDataFilter] = useState({
    toDate: sixMonthsAgo,
    fromDate: today,
    filter: "",
    currentUserId: userId,
    userId: null,
  });

  useEffect(() => {
    dispatch(getLeadsDataByMonth(leadDataFilter));
  }, [dispatch, leadDataFilter]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex justify-between items-center w-full">
          <div className="flex flex-col gap-1">
            <h2 className="font-medium">Leads Data</h2>
            <p className="text-default-500 text-xs">
              {dayjs(leadDataFilter?.toDate).format("MMM YY")} -{" "}
              {dayjs(leadDataFilter?.fromDate).format("MMM YY")}
            </p>
          </div>
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
                    hideTimeZone
                    label="Date range"
                    value={{
                      start: parseZonedDateTime(
                        `${leadDataFilter?.toDate}[Asia/kolkata]`
                      ),
                      end: parseZonedDateTime(
                        `${leadDataFilter?.fromDate}[Asia/kolkata]`
                      ),
                    }}
                    onChange={(value) => {
                      const formattedStart = value.start
                        ? `${value.start.year}-${String(value.start.month).padStart(2, "0")}-${String(value.start.day).padStart(2, "0")}T${String(value.start.hour).padStart(2, "0")}:${String(value.start.minute).padStart(2, "0")}`
                        : null;
                      const formattedEnd = value.end
                        ? `${value.end.year}-${String(value.end.month).padStart(2, "0")}-${String(value.end.day).padStart(2, "0")}T${String(value.end.hour).padStart(2, "0")}:${String(value.end.minute).padStart(2, "0")}`
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
      </CardHeader>

      <CardContent>
        <ChartContainer config={chartConfig}>
          <BarChart
            accessibilityLayer
            data={leadsData}
            onClick={(e) => {
              const inputDate = dayjs(e.activeLabel);
              const month = inputDate.format("YYYY-MM");
              navigate(`${month}/leadData`);
            }}
          >
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
    </Card>
  );
};

export default LeadDataChart;
