import  { Suspense, useCallback, useEffect, useState } from "react";
import CommonTable from "../../../components/CommonTable";
import TableScalaton from "../../../components/TableScalaton";
import {
  Button,
  DatePicker,
  Drawer,
  Flex,
  Input,
  Select,
  Typography,
} from "antd";
import { CSVLink } from "react-csv";
import { Icon } from "@iconify/react";
import MainHeading from "../../../components/design/MainHeading";
import { BTN_ICON_HEIGHT, BTN_ICON_WIDTH } from "../../../components/Constants";
import dayjs from "dayjs";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { rangePresets } from "../../Common/Commons";
import { getAllLeadUser, getAutomationLeads, getQualityLeadsReport } from "../../../Toolkit/Slices/LeadSlice";
const { Text } = Typography;
const { RangePicker } = DatePicker;

const QualityLeadReport = () => {
  const dispatch = useDispatch();
  const { userid } = useParams();
  const data = useSelector((state) => state.leads.qualityReportList);
  const leadUserNew = useSelector((state) => state.leads.getAllLeadUserData);
  const [searchText, setSearchText] = useState("");
  const [filteredData, setFilteredData] = useState([]);
  const [filterDrawer, setFilterDrawer] = useState(false);
  const [paginationData, setPaginationData] = useState({
    page: 1,
    size: 50,
  });
  const [dateFilter, setDateFilter] = useState({
    userIds: [],
    toDate: null,
    fromDate: null,
    currentUserId: userid,
  });

  useEffect(() => {
    dispatch(getAllLeadUser(userid));
  }, [dispatch]);


  useEffect(() => {
    dispatch(getQualityLeadsReport(dateFilter));
  }, [dispatch]);

  const handlePagination = useCallback(
    (dataPage, size) => {
      setPaginationData({ size: size, page: dataPage });
    },
    [dispatch, userid, dateFilter]
  );

  useEffect(() => {
    setFilteredData(data);
  }, [data]);

  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchText(value);
    const filtered = data?.filter((item) =>
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
      dataIndex: "name",
      title: "Name",
      fixed: "left",
    },
    {
      dataIndex: "email",
      title: "Email",
    },

    {
      dataIndex: "percentage",
      title: "Percentage",
    },
    {
      dataIndex: "statusNew",
      title: "New status",
    },
    {
      dataIndex: "statusDealLost",
      title: "Deal lost status",
    },
    {
      dataIndex: "statusBadFit",
      title: "BadFit status",
    },
    {
      dataIndex: "statusMoveOn",
      title: "Move on status",
    },
  ];

  const exportData = data?.map((row) => ({
    Id: row?.id,
    Name: row?.name,
    Email: row?.email,
    Percentage: row?.percentage,
    "New status": row?.statusNew,
    "Deal lost status": row?.statusDealLost,
    "BadFit status": row?.statusBadFit,
    "Move on status": row?.statusMoveOn,
  }));

  const headers = [
    "Id",
    "Name",
    "Email",
    "Percentage",
    "New status",
    "Deal won status",
    "BadFit status",
    "Move on status",
  ];

  const handleApplyFilter = () => {
    dispatch(getQualityLeadsReport(dateFilter));
  };

  const handleResetFilter = () => {
    dispatch(
      getQualityLeadsReport({
        userIds: [],
        toDate: "",
        fromDate: "",
        currentUserId: userid,
      })
    );
  };

  return (
    <div className="lead-module small-box-padding">
      <div className="create-user-box">
        <MainHeading data={`Quality report list`} />
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

        </Flex>
        <Flex align="center" gap={2}>
          <Button onClick={() => setFilterDrawer(true)}>
            <Icon icon="fluent:filter-12-regular" width="12" height="12" />{" "}
            Filter
          </Button>
          <CSVLink
            className="text-white"
            data={exportData}
            headers={headers}
            filename={"history.csv"}
          >
            <Button>
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
            scroll={{ y: "70vh", x: 1200 }}
            rowKey={(record) => record?.id}
            page={paginationData?.page}
            pageSize={paginationData?.size}
            pagination={true}
            totalCount={data?.length}
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
              value={dateFilter?.userIds}
              placeholder="Select assignee"
              onChange={(e) =>
                setDateFilter((prev) => ({
                  ...prev,
                  userIds: e,
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
            <Text>Select date range </Text>
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

export default QualityLeadReport;
