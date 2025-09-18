import React, { useEffect, useState } from "react";
import "./Graph.scss";
import { Card, Col, DatePicker, Divider, Flex, Row, Typography } from "antd";
import { Icon } from "@iconify/react";
import { useDispatch, useSelector } from "react-redux";
import {
  getLeadCategoryWise,
  getLeadsDataByMonth,
  getLeadsDistributionStatusWise,
  getTotalLeadCountForGraph,
  getTotalProjectCounts,
  projectMontWiseDataForGraph,
  totalCompanyForGraph,
  totalUserCount,
} from "../../Toolkit/Slices/DasboardSlice";
import { Area, Column, Pie } from "@ant-design/plots";
import dayjs from "dayjs";
import { rangePresets } from "../Common/Commons";
import { useParams } from "react-router-dom";
const { RangePicker } = DatePicker;
const { Text } = Typography;

const GraphMainPage = () => {
  const dispatch = useDispatch();
  const { userid } = useParams();
  const totalLeadCount = useSelector(
    (state) => state.dashboard.totalLeadCountForGraph
  );
  const totalProjectCount = useSelector(
    (state) => state.dashboard.totalProjectCountForGraph
  );
  const leadData = useSelector((state) => state.dashboard.leadDataMonthWise);
  const userCount = useSelector(
    (state) => state.dashboard.totalUserCountForGraph
  );
  const companyCount = useSelector(
    (state) => state.dashboard.totalCompanyForGraph
  );

  const leadCountCategoryWise = useSelector(
    (state) => state.dashboard.leadDataCategoryWise
  );

  const projectData = useSelector(
    (state) => state.dashboard.projectDataForGraph
  );
  const leadDataStatus = useSelector(
    (state) => state.dashboard.leadStatusWiseData
  );

  const [leadMonthDate, setLeadMonthData] = useState({
    toDate: dayjs().subtract(1, "year").format("YYYY-MM-DD"),
    fromDate: dayjs().format("YYYY-MM-DD"),
    currentUserId: userid,
    userId: userid,
  });

  const [leadCategoryDate, setLeadCategoryDate] = useState({
    toDate: dayjs().subtract(1, "year").format("YYYY-MM-DD"),
    fromDate: dayjs().format("YYYY-MM-DD"),
  });

  const [leadStatusDate, setLeadStatusDate] = useState({
    toDate: dayjs().subtract(1, "year").format("YYYY-MM-DD"),
    fromDate: dayjs().format("YYYY-MM-DD"),
  });

  const [projectsDate, setProjectDates] = useState({
    toDate: dayjs().subtract(1, "year").format("YYYY-MM-DD"),
    fromDate: dayjs().format("YYYY-MM-DD"),
    currentUserId: userid,
    userId: userid,
  });

  useEffect(() => {
    dispatch(getTotalLeadCountForGraph());
    dispatch(getTotalProjectCounts());
    dispatch(getLeadsDataByMonth(leadMonthDate));
    dispatch(getLeadCategoryWise(leadCategoryDate));
    dispatch(totalUserCount());
    dispatch(totalCompanyForGraph());
    dispatch(projectMontWiseDataForGraph(projectsDate));
    dispatch(getLeadsDistributionStatusWise(leadStatusDate));
  }, [dispatch]);

  const config = {
    data: leadData?.length > 0 ? leadData : [],
    height: 300,
    xField: (data) => dayjs(data?.name).format("MMM YYYY"),
    yField: "value",
    style: {
      fill: ({ type }) => {
        return "#99ffff";
      },
    },
    tooltip: {
      title: (data) => dayjs(data?.name).format("MMM YYYY"),
    },
    legend: false,
  };

  const pieConfig = {
    data:
      leadCountCategoryWise?.data?.length > 0
        ? leadCountCategoryWise?.data
        : [],
    angleField: "value",
    colorField: "key",
    innerRadius: 0.6,
    height: 300,
    marginTop: 25,
    label: {
      text: "value",
      position: "outside",
      labelSpacing: 50,
      style: {
        fontWeight: "bold",
      },
      transform: [{ type: "overlapHide" }],
    },
    legend: {
      color: {
        title: false,
        position: "right",
        rowPadding: 5,
      },
    },
    annotations: [
      {
        type: "text",
        style: {
          text: `Total lead counts \n ${leadCountCategoryWise?.totalCount}`,
          x: "50%",
          y: "50%",
          textAlign: "center",
          fontSize: 14,
          fontStyle: "bold",
        },
        tooltip: false,
      },
    ],
  };

  const pieConfigforLeadStatus = {
    data: leadDataStatus?.data?.length > 0 ? leadDataStatus?.data : [],
    angleField: "value",
    colorField: "key",
    innerRadius: 0.5,
    height: 300,
    marginTop: 50,
    label: {
      text: "value",
      position: "outside",
      textAlign: "center",
      style: {
        fontWeight: "bold",
      },
      transform: [{ type: "overlapHide" }],
    },
    legend: {
      color: {
        title: false,
        position: "right",
        rowPadding: 5,
      },
    },
    tooltip: {
      title: (d) => d.key,
    },
    annotations: [
      {
        type: "text",
        style: {
          text: `Total lead status \n ${leadDataStatus?.totalCount}`,
          x: "50%",
          y: "50%",
          textAlign: "center",
          fontSize: 14,
          fontStyle: "bold",
        },
        tooltip: false,
      },
    ],
  };

  const areaConfig = {
    data: projectData?.length > 0 ? projectData : [],
    xField: (d) => dayjs(d?.name).format("MMM"),
    yField: "value",
    height: 350,
    style: {
      fill: "linear-gradient(-90deg, lightgreen 5%, darkgreen 100%)",
    },
    axis: {
      y: { labelFormatter: "~s" },
    },
    tooltip: {
      title: (data) => dayjs(data?.name).format("MMM YYYY"),
    },
    line: {
      style: {
        stroke: "darkgreen",
        strokeWidth: 2,
      },
    },
  };

  const onLeadRangeChange = (dates, dateStrings) => {
    if (dates) {
      dispatch(
        getLeadsDataByMonth({
          toDate: dateStrings[0],
          fromDate: dateStrings[1],
        })
      );
      setLeadMonthData((prev) => ({
        ...prev,
        toDate: dateStrings[0],
        fromDate: dateStrings[1],
      }));
    } else {
      dispatch(
        getLeadsDataByMonth({
          toDate: null,
          fromDate: null,
        })
      );
      setLeadMonthData((prev) => ({
        ...prev,
        toDate: null,
        fromDate: null,
      }));
    }
  };

  const onLeadCategoryRangeChange = (dates, dateStrings) => {
    if (dates) {
      dispatch(
        getLeadCategoryWise({
          toDate: dateStrings[0],
          fromDate: dateStrings[1],
        })
      );
      setLeadCategoryDate((prev) => ({
        ...prev,
        toDate: dateStrings[0],
        fromDate: dateStrings[1],
      }));
    } else {
      dispatch(
        getLeadCategoryWise({
          toDate: null,
          fromDate: null,
        })
      );
      setLeadCategoryDate((prev) => ({
        ...prev,
        toDate: null,
        fromDate: null,
      }));
    }
  };

  const onLeadStatusRangeChange = (dates, dateStrings) => {
    if (dates) {
      dispatch(
        getLeadsDistributionStatusWise({
          toDate: dateStrings[0],
          fromDate: dateStrings[1],
        })
      );
      setLeadStatusDate((prev) => ({
        ...prev,
        toDate: dateStrings[0],
        fromDate: dateStrings[1],
      }));
    } else {
      dispatch(
        getLeadsDistributionStatusWise({
          toDate: null,
          fromDate: null,
        })
      );
      setLeadStatusDate((prev) => ({
        ...prev,
        toDate: null,
        fromDate: null,
      }));
    }
  };

  const onProjectRangeChange = (dates, dateStrings) => {
    if (dates) {
      dispatch(
        projectMontWiseDataForGraph({
          toDate: dateStrings[0],
          fromDate: dateStrings[1],
        })
      );
      setProjectDates((prev) => ({
        ...prev,
        toDate: dateStrings[0],
        fromDate: dateStrings[1],
      }));
    } else {
      dispatch(
        projectMontWiseDataForGraph({
          toDate: null,
          fromDate: null,
        })
      );
      setProjectDates((prev) => ({
        ...prev,
        toDate: null,
        fromDate: null,
      }));
    }
  };

  return (
    <div className="main-graph-container">
      <Row>
        <Col span={5}>
          <Card className="graph-card-1">
            <Flex justify="space-between">
              <Flex vertical>
                <Text className="card-text">Total leads : </Text>
                <Text className="card-text-result">{totalLeadCount}</Text>
              </Flex>
              <Flex>
                <Icon
                  icon="fluent:chart-person-24-regular"
                  height={32}
                  width={32}
                />
              </Flex>
            </Flex>
          </Card>
        </Col>
        <Col span={1} />
        <Col span={5}>
          <Card className="graph-card-2">
            <Flex justify="space-between">
              <Flex vertical>
                <Text className="card-text">Total users : </Text>
                <Text className="card-text-result">{userCount}</Text>
              </Flex>
              <Flex>
                <Icon icon="fluent:person-24-regular" height={32} width={32} />
              </Flex>
            </Flex>
          </Card>
        </Col>
        <Col span={1} />
        <Col span={5}>
          <Card className="graph-card-3">
            <Flex justify="space-between">
              <Flex vertical>
                <Text className="card-text">Total projects : </Text>
                <Text className="card-text-result">{totalProjectCount}</Text>
              </Flex>
              <Flex>
                <Icon icon="fluent:album-24-regular" height={32} width={32} />
              </Flex>
            </Flex>
          </Card>
        </Col>
        <Col span={1} />
        <Col span={5}>
          <Card className="graph-card-4">
            <Flex justify="space-between">
              <Flex vertical>
                <Text className="card-text">Total company : </Text>
                <Text className="card-text-result">{companyCount}</Text>
              </Flex>
              <Flex>
                <Icon
                  icon="fluent:building-desktop-24-regular"
                  height={32}
                  width={32}
                />
              </Flex>
            </Flex>
          </Card>
        </Col>
      </Row>

      <Flex gap={24}>
        <Card className="lead-graph-card-column">
          <Flex justify="space-between">
            <Text className="card-title-text">Leads data </Text>
            <RangePicker
              size="small"
              showTime={{ format: "HH:mm" }}
              format="YYYY-MM-DD HH:mm"
              presets={rangePresets}
              value={[
                leadMonthDate?.toDate ? dayjs(leadMonthDate?.toDate) : "",
                leadMonthDate?.fromDate ? dayjs(leadMonthDate?.fromDate) : "",
              ]}
              disabledDate={(current) =>
                current && current > dayjs().endOf("day")
              }
              onChange={onLeadRangeChange}
            />
          </Flex>
          <Column {...config} />
        </Card>
        <Card className="lead-graph-card-pie">
          <Flex justify="space-between">
            <Text className="card-title-text">Leads distribution status </Text>
            <RangePicker
              size="small"
              showTime={{ format: "HH:mm" }}
              format="YYYY-MM-DD HH:mm"
              presets={rangePresets}
              value={[
                leadStatusDate?.toDate ? dayjs(leadStatusDate?.toDate) : "",
                leadStatusDate?.fromDate ? dayjs(leadStatusDate?.fromDate) : "",
              ]}
              disabledDate={(current) =>
                current && current > dayjs().endOf("day")
              }
              onChange={onLeadStatusRangeChange}
            />
          </Flex>
          <Pie {...pieConfigforLeadStatus} />
        </Card>
      </Flex>

      <Flex gap={24}>
        <Card className="lead-graph-card-area">
          <Flex justify="space-between">
            <Text className="card-title-text">Leads </Text>
            <RangePicker
              size="small"
              showTime={{ format: "HH:mm" }}
              format="YYYY-MM-DD HH:mm"
              presets={rangePresets}
              value={[
                leadCategoryDate?.toDate ? dayjs(leadCategoryDate?.toDate) : "",
                leadCategoryDate?.fromDate
                  ? dayjs(leadCategoryDate?.fromDate)
                  : "",
              ]}
              disabledDate={(current) =>
                current && current > dayjs().endOf("day")
              }
              onChange={onLeadCategoryRangeChange}
            />
          </Flex>
          <Pie {...pieConfig} />
          <Flex align="center" justify="space-between">
            <Flex vertical align="center">
              <Text type="secondary" style={{ fontSize: "16px" }}>
                Corpseed website
              </Text>

              {leadCountCategoryWise?.data?.map((obj) =>
                obj.key === "Corpseed Website" ? (
                  <Text style={{ fontSize: "18px" }} strong>
                    {obj.value}
                  </Text>
                ) : (
                  ""
                )
              )}
            </Flex>
            <Divider type="vertical" />
            <Flex vertical align="center">
              <Text type="secondary" style={{ fontSize: "16px" }}>
                Ivr
              </Text>

              {leadCountCategoryWise?.data?.map((obj) =>
                obj.key === "Ivr" ? (
                  <Text style={{ fontSize: "18px" }} strong>
                    {obj?.value}
                  </Text>
                ) : (
                  ""
                )
              )}
            </Flex>
            <Divider type="vertical" />
            <Flex vertical align="center">
              <Text type="secondary" style={{ fontSize: "16px" }}>
                Reopen by Quality
              </Text>

              {leadCountCategoryWise?.data?.map((obj) =>
                obj.key === "Reopen By Quality" ? (
                  <Text style={{ fontSize: "18px" }} strong>
                    {obj.value}
                  </Text>
                ) : (
                  ""
                )
              )}
            </Flex>
          </Flex>
        </Card>
        <Card className="lead-graph-card-pie">
          <Flex justify="space-between">
            <Text className="card-title-text">Projects data</Text>
            <RangePicker
              size="small"
              showTime={{ format: "HH:mm" }}
              format="YYYY-MM-DD HH:mm"
              presets={rangePresets}
              value={[
                projectsDate?.toDate ? dayjs(projectsDate?.toDate) : "",
                projectsDate?.fromDate ? dayjs(projectsDate?.fromDate) : "",
              ]}
              disabledDate={(current) =>
                current && current > dayjs().endOf("day")
              }
              onChange={onProjectRangeChange}
            />
          </Flex>
          <Area {...areaConfig} />
        </Card>
      </Flex>
    </div>
  );
};

export default GraphMainPage;
