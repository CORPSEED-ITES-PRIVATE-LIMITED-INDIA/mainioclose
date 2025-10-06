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
  getKeyValue,
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
import { ListFilter } from "lucide-react";
import NewSelect from "../../components/NewSelect";
import { parseZonedDateTime } from "@internationalized/date";
import dayjs from "dayjs";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "../../components/ui/chart";
import {
  Bar,
  BarChart,
  CartesianGrid,
  LabelList,
  XAxis,
  YAxis,
} from "recharts";
import { useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { getTopSellLeadsData } from "../../toolkit/slices/dashboardSlice";
import { getNameAndEmailById } from "../../common";

const chartConfig = {
  desktop: {
    label: "Desktop",
    color: "var(--chart-1)",
  },
};

const TopSellLeads = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const today = dayjs().format("YYYY-MM-DDTHH:mm");
  const sixMonthsAgo = dayjs().subtract(6, "month").format("YYYY-MM-DDTHH:mm");
  const dashboardUsers = useSelector((state) => state.dashboard.dashboardUsers);
  const topSellLeadsList = useSelector(
    (state) => state.dashboard.topSellLeadsList
  );

  const [topSellLeadsFilter, setTopSellLeadsFilter] = useState({
    toDate: sixMonthsAgo,
    fromDate: today,
    filter: "",
    currentUserId: userId,
    userId: null,
  });

  useEffect(() => {
    dispatch(getTopSellLeadsData(topSellLeadsFilter));
  }, [dispatch, topSellLeadsFilter]);


  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex justify-between items-center w-full">
          <div className="flex flex-col gap-1">
            <h2 className="font-medium">Top sell leads </h2>
            <p className="text-default-500 text-xs">
              {dayjs(topSellLeadsFilter?.toDate).format("MMM YY")} -{" "}
              {dayjs(topSellLeadsFilter?.fromDate).format("MMM YY")}
            </p>
          </div>
          <div className="flex gap-1">
            <div>
              <p className="text-sm font-medium">
                {
                  getNameAndEmailById(
                    dashboardUsers,
                    topSellLeadsFilter?.userId
                  )?.name
                }
              </p>
              <p className="text-xs text-muted-foreground">
                {
                  getNameAndEmailById(
                    dashboardUsers,
                    topSellLeadsFilter?.userId
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
                    value={topSellLeadsFilter?.userId}
                    onChange={(e) =>
                      setTopSellLeadsFilter((prev) => ({
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
                        `${topSellLeadsFilter?.toDate}[Asia/kolkata]`
                      ),
                      end: parseZonedDateTime(
                        `${topSellLeadsFilter?.fromDate}[Asia/kolkata]`
                      ),
                    }}
                    onChange={(value) => {
                      const formattedStart = value.start
                        ? `${value.start.year}-${String(value.start.month).padStart(2, "0")}-${String(value.start.day).padStart(2, "0")}T${String(value.start.hour).padStart(2, "0")}:${String(value.start.minute).padStart(2, "0")}`
                        : null;
                      const formattedEnd = value.end
                        ? `${value.end.year}-${String(value.end.month).padStart(2, "0")}-${String(value.end.day).padStart(2, "0")}T${String(value.end.hour).padStart(2, "0")}:${String(value.end.minute).padStart(2, "0")}`
                        : null;
                      setTopSellLeadsFilter((prev) => ({
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
        <Table
          isHeaderSticky
          aria-label="Example table with dynamic content"
          classNames={{
            wrapper: "max-h-[300px]",
          }}
        >
          <TableHeader
            columns={[
              {
                key: "key",
                label: "SERVICE",
              },
              {
                key: "Value",
                label: "VALUE",
              },
            ]}
          >
            {(column) => (
              <TableColumn key={column.key}>{column.label}</TableColumn>
            )}
          </TableHeader>
          <TableBody items={topSellLeadsList?.slice(0, 10)}>
            {(item) => (
              <TableRow key={item.key}>
                {(columnKey) => (
                  <TableCell>{getKeyValue(item, columnKey)}</TableCell>
                )}
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default TopSellLeads;
