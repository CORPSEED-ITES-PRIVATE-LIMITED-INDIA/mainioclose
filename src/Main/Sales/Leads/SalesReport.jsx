import React, { Suspense, useCallback, useEffect, useState } from "react";
import CommonTable from "../../../components/CommonTable";
import TableScalaton from "../../../components/TableScalaton";
import {
  Button,
  DatePicker,
  Drawer,
  Flex,
  Input,
  notification,
  Select,
  Typography,
} from "antd";
import { CSVLink } from "react-csv";
import { Icon } from "@iconify/react";
import MainHeading from "../../../components/design/MainHeading";
import { BTN_ICON_HEIGHT, BTN_ICON_WIDTH } from "../../../components/Constants";
import OverFlowText from "../../../components/OverFlowText";
import dayjs from "dayjs";
import { useDispatch, useSelector } from "react-redux";
import {
  getAllAutoHistoryList,
  getAllLeadUser,
  getAllStatusData,
  getSaleReportByFilter,
  getSaleReportByFilterCount,
  getSalesReportByFilterForExport,
} from "../../../Toolkit/Slices/LeadSlice";
import { useParams } from "react-router-dom";
import LeadsDetailsMainPage from "../Leads/LeadsDetailsMainPage";
import { rangePresets } from "../../Common/Commons";
import { getAllDepartment } from "../../../Toolkit/Slices/SettingSlice";
const { Text } = Typography;
const { RangePicker } = DatePicker;

const SalesReport = () => {
  const dispatch = useDispatch();
  const { userid } = useParams();
  const autoList = useSelector((state) => state.leads.salesReportList);
  const autoHistoryExportList = useSelector(
    (state) => state.leads.salesReportListForExport
  );
  const leadUserNew = useSelector((state) => state.leads.getAllLeadUserData);
  const autoExportLoading = useSelector(
    (state) => state.leads.autoExportLoading
  );
  const salesReportCount = useSelector(
    (state) => state.leads.salesReportCount
  );
  const [searchText, setSearchText] = useState("");
  const [filteredData, setFilteredData] = useState([]);
  const [filterDrawer, setFilterDrawer] = useState(false);
  const [paginationData, setPaginationData] = useState({
    page: 1,
    size: 50,
  });
  const [dateFilter, setDateFilter] = useState({
    toDate: "",
    fromDate: "",
    departmentId: null,
    assigneeIds: [],
  });

  useEffect(() => {
    dispatch(getAllLeadUser(userid));
    dispatch(getAllStatusData());
    dispatch(getAllDepartment());
  }, [dispatch]);

  useEffect(() => {
    dispatch(getSaleReportByFilter({ ...paginationData, data: dateFilter }));
    dispatch(getSaleReportByFilterCount(dateFilter));
    dispatch(getSalesReportByFilterForExport(dateFilter));
  }, [dispatch]);

  const handlePagination = useCallback(
    (dataPage, size) => {
      dispatch(getSaleReportByFilter({ size: size, page: dataPage, data: dateFilter }));
      setPaginationData({ size: size, page: dataPage });
    },
    [dispatch, userid, dateFilter]
  );

  useEffect(() => {
    setFilteredData(autoList);
  }, [autoList]);

  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchText(value);
    const filtered = autoList?.filter((item) =>
      Object.values(item)?.some((val) =>
        String(val)?.toLowerCase()?.includes(value?.toLowerCase())
      )
    );
    setFilteredData(filtered);
  };

  const columns = [
    {
      dataIndex: "id",
      title: "Id",
      fixed: "left",
      width: 80,
    },
    {
      dataIndex: "leadId",
      title: "Lead id",
      fixed: "left",
      width: 80,
      render: (_, data) => <Text>{data?.leadId}</Text>,
    },
    {
      dataIndex: "leadname",
      title: "Lead name",
      fixed: "left",
      render: (_, data) => (
        <LeadsDetailsMainPage leadId={data?.leadId} data={data}>
          {data?.leadOriginalName}
        </LeadsDetailsMainPage>
      ),
    },
    {
      dataIndex: "manual",
      title: "Manual",
      render: (data) => (data ? "Manual" : "Auto"),
    },
    {
      dataIndex: "assignee",
      title: "Assignee name",
      render: (_, data) => <Text>{data?.currName}</Text>,
    },
    {
      title: "Status",
      dataIndex: "status",
      render: (_, data) => <OverFlowText>{data?.status}</OverFlowText>,
    },
    {
      title: "Reopen by",
      dataIndex: "reopenBy",
      render: (_, data) => (
        <OverFlowText>{data?.reopenBy?"True":"False"}</OverFlowText>
      ),
    },
    {
      title: "Assigned date",
      dataIndex: "assignDate",
      render: (_, data) => (
        <Text>{dayjs(data?.assignDate).format("DD-MM-YYYY HH:mm ")}</Text>
      ),
    },
  ];

  const exportData = autoHistoryExportList?.map((row) => ({
    Id: row?.id,
    "Lead Id": row?.leadId,
    "Lead name": row?.leadOriginalName,
    Status: row?.status,
    Manual: row?.manual ? "Manual" : "Auto",
    "Current Assignee person": row?.currName,
    "Current Assignee email": row?.currEmail,
    "Created Date": dayjs(row?.assignDate).format("YYYY-MM-DD"),
    "Reopen by": row?.reopenBy?"True":"False",
  }));

  const headers = [
    "Id",
    "Lead Id",
    "Lead name",
    "Status",
    "Manual",
    "Current Assignee person",
    "Current Assignee email",
    "Created Date",
    "Reopen by"
  ];

  const handleApplyFilter = () => {
    dispatch(getSaleReportByFilter({ ...paginationData, data: dateFilter }));
    dispatch(getSaleReportByFilterCount(dateFilter));
    dispatch(getSalesReportByFilterForExport(dateFilter))
      .then((resp) => {
        if (resp.meta.requestStatus === "fulfilled") {
          notification.success({ message: "Data is ready to export" });
        } else {
          notification.error({ message: "Something went wrong !." });
        }
      })
      .catch((err) =>
        notification.error({ message: "Something went wrong !." })
      );
  };

  const handleResetFilter = () => {
    dispatch(
      getSaleReportByFilter({
        ...paginationData,
        data: {
          toDate: "",
          fromDate: "",
          departmentId: "",
          assignType: "",
          statusIds: [],
          assigneeIds: [],
        },
      })
    );
    dispatch(getSaleReportByFilterCount(dateFilter));
  };

  return (
    <div className="lead-module small-box-padding">
      <div className="create-user-box">
        <MainHeading data={`Sales report`} />
      </div>
      <Flex justify="space-between" align="center" className="marginBottom8px">
        <Flex gap={8} align="center">
          <Input
            style={{ width: "200px" }}
            value={searchText}
            onChange={handleSearch}
            placeholder="search"
            prefix={<Icon icon="fluent:search-24-regular" />}
          />

          <Select
            allowClear
            style={{ width: "200px" }}
            placeholder="Select department"
            value={dateFilter?.departmentId}
            options={[
              { label: "Sales", value: 2 },
              { label: "Quality", value: 3 },
            ]}
            onClear={() => {
              setDateFilter((prev) => ({ ...prev, departmentId: null }));
              dispatch(
                getSaleReportByFilter({
                  ...paginationData,
                  data: { ...dateFilter, departmentId: null },
                })
              );
              dispatch(getSaleReportByFilterCount(dateFilter));
              dispatch(getSalesReportByFilterForExport(dateFilter));
            }}
            onChange={(e) => {
              setDateFilter((prev) => ({ ...prev, departmentId: e }));
              dispatch(
                getAllAutoHistoryList({
                  ...paginationData,
                  data: { ...dateFilter, departmentId: e },
                })
              );
              dispatch(getSaleReportByFilterCount(dateFilter));
              dispatch(getSalesReportByFilterForExport(dateFilter));
            }}
          />
        </Flex>
        <Flex align="center" gap={2}>
          <Button
            loading={autoExportLoading === "pending"}
            onClick={() => setFilterDrawer(true)}
          >
            <Icon icon="fluent:filter-12-regular" width="12" height="12" />{" "}
            Filter
          </Button>
          <CSVLink
            className="text-white"
            data={exportData}
            headers={headers}
            filename={"history.csv"}
          >
            <Button >
              <Icon
                icon="fluent:arrow-upload-16-filled"
                height={BTN_ICON_HEIGHT}
                width={BTN_ICON_WIDTH}
              />{" "}
              Export
            </Button>
          </CSVLink>
        </Flex>
      </Flex>

      <div className="table-arrow">
        <Suspense fallback={<TableScalaton />}>
          <CommonTable
            data={filteredData}
            columns={columns}
            scroll={{ y: "70vh", x: 800 }}
            rowKey={(record) => record?.id}
            page={paginationData?.page}
            pageSize={paginationData?.size}
            pagination={true}
            totalCount={salesReportCount}
            handlePagination={handlePagination}
          />
        </Suspense>
      </div>

      <Drawer
        title="Filter"
        open={filterDrawer}
        onClose={() => setFilterDrawer(false)}
        width={"50%"}
      >
        <div className="main-filter-container">
          <Flex vertical gap={8}>
            <Text>Select assignee </Text>
            <Select
              mode="multiple"
              maxTagCount="responsive"
              allowClear
              showSearch
              style={{ width: "100%" }}
              value={dateFilter?.assigneeIds}
              placeholder="Select assignee"
              onChange={(e) =>
                setDateFilter((prev) => ({
                  ...prev,
                  assigneeIds: e,
                }))
              }
              options={
                leadUserNew?.length > 0
                  ? leadUserNew?.map((item) => ({
                      label: item?.fullName,
                      value: item?.id,
                    }))
                  : []
              }
              filterOption={(input, option) =>
                option.label.toLowerCase().includes(input.toLowerCase())
              }
            />
          </Flex>

          <Flex vertical gap={8}>
            <Text>Date range </Text>
            <RangePicker
              showTime={{ format: "HH:mm" }}
              placement="bottomRight"
              format="YYYY-MM-DD HH:mm"
              presets={rangePresets}
              value={[
                dateFilter?.toDate ? dayjs(dateFilter?.toDate) : "",
                dateFilter?.fromDate ? dayjs(dateFilter?.fromDate) : "",
              ]}
              disabledDate={(current) =>
                current && current > dayjs().endOf("day")
              }
              onChange={(dates, dateStrings) => {
                if (dates) {
                  setDateFilter((prev) => ({
                    ...prev,
                    toDate: dateStrings[0],
                    fromDate: dateStrings[1],
                  }));
                } else {
                  setDateFilter((prev) => ({
                    ...prev,
                    toDate: "",
                    fromDate: "",
                  }));
                }
              }}
            />
          </Flex>
        </div>

        <Flex gap={8}>
          <Button onClick={handleResetFilter}>Reset filter</Button>
          <Button type="primary" onClick={handleApplyFilter}>
            Apply filter
          </Button>
        </Flex>
      </Drawer>
    </div>
  );
};

export default SalesReport;
