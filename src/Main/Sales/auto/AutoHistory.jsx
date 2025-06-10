import React, { Suspense, useCallback, useEffect, useState } from "react";
import CommonTable from "../../../components/CommonTable";
import TableScalaton from "../../../components/TableScalaton";
import {
  Button,
  DatePicker,
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
  getAllAutoHistoryForExport,
  getAllAutoHistoryForExportByDate,
  getAllAutoHistoryList,
  getAllAutoHistroryCount,
} from "../../../Toolkit/Slices/LeadSlice";
import { useParams } from "react-router-dom";
import LeadsDetailsMainPage from "../Leads/LeadsDetailsMainPage";
import { rangePresets } from "../../Common/Commons";
const { Text } = Typography;
const { RangePicker } = DatePicker;

const AutoHistory = () => {
  const dispatch = useDispatch();
  const { userid } = useParams();
  const autoList = useSelector((state) => state.leads.autoList);
  const autoHistoryExportList = useSelector(
    (state) => state.leads.autoHistoryExportList
  );
  const autoExportLoading = useSelector(
    (state) => state.leads.autoExportLoading
  );
  const totalAutoListCount = useSelector(
    (state) => state.leads.totalAutoListCount
  );
  const [searchText, setSearchText] = useState("");
  const [filteredData, setFilteredData] = useState([]);
  const [paginationData, setPaginationData] = useState({
    page: 1,
    size: 50,
  });
  const [dateFilter, setDateFilter] = useState({
    toDate: "",
    fromDate: "",
    departmentId: "",
  });


  useEffect(() => {
    dispatch(getAllAutoHistoryList({ ...paginationData, data: dateFilter }));
    dispatch(getAllAutoHistroryCount());
  }, [dispatch, dateFilter]);

  const handlePagination = useCallback(
    (dataPage, size) => {
      dispatch(getAllAutoHistoryList({ page: dataPage, size, data: dateFilter }));
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
      render: (data) => data ? 'Manual' : 'Auto'
    },

    {
      dataIndex: "mobileNo",
      title: "Client mobile",
    },
    {
      dataIndex: "assignee",
      title: "Assignee name",
      render: (_, data) => <Text>{data?.currName}</Text>,
    },
    {
      dataIndex: "email",
      title: "Assignee email",
      render: (_, data) => <Text>{data?.currEmail}</Text>,
    },
    // {
    //   dataIndex: "paId",
    //   title: "Previous assignee id",
    //   render: (_, data) => <Text>{data?.paId}</Text>,
    // },
    {
      dataIndex: "paName",
      title: "Previous assignee name",
      render: (_, data) => <Text>{data?.paName}</Text>,
    },
    {
      dataIndex: "previousemail",
      title: "Previous assignee email",
      render: (_, data) => <Text>{data?.paEmail}</Text>,
    },
    {
      dataIndex: "clientEmail",
      title: "Client email",
    },
    {
      title: "Status",
      dataIndex: "status",
      render: (_, data) => <OverFlowText>{data?.status}</OverFlowText>,
    },
    {
      title: "Assigned date",
      dataIndex: "assignDate",
      render: (_, data) => (
        <Text>{dayjs(data?.assignDate).format("DD-MM-YYYY")}</Text>
      ),
    },
    // {
    //   title: "Created date",
    //   dataIndex: "createDate",
    //   render: (_, data) => (
    //     <Text>{dayjs(data?.createDate).format("DD-MM-YYYY")}</Text>
    //   ),
    // },
    // {
    //   title: "Last updated date",
    //   dataIndex: "lastUpdated",
    //   render: (_, data) => (
    //     <Text>{dayjs(data?.lastUpdated).format("DD-MM-YYYY")}</Text>
    //   ),
    // },
  ];

  const exportData = autoHistoryExportList?.map((row) => ({
    Id: row?.id,
    "Lead name": row?.leadOriginalName,
    Status: row?.status,
    Manual: row?.manual?'Manual':'Auto',
    "Client name": row?.clientName,
    "Client Email": row?.clientEmail,
    "Mobile no.": row?.mobileNo,
    "Previous Assignee person": row?.paName,
    "Previous Assignee email": row?.paEmail,
    "Current Assignee person": row?.currName,
    "Current Assignee email": row?.currEmail,
    "Created Date": dayjs(row?.assignDate).format("YYYY-MM-DD"),
  }));

  const headers = [
    "Id",
    "Lead name",
    "Status",
    "Manual",
    "Client name",
    "Client Email",
    "Mobile no.",
    "Previous Assignee person",
    "Previous Assignee email",
    "Current Assignee person",
    "Current Assignee email",
    "Created Date",
  ];

  const handleApplyFilter = () => {
    dispatch(getAllAutoHistoryForExportByDate(dateFilter))
      .then((resp) => {
        if (resp.meta.requestStatus === "fulfilled") {
          notification.success({ message: "Date is ready to export" });
        } else {
          notification.error({ message: "Something went wrong !." });
        }
      })
      .catch((err) =>
        notification.error({ message: "Something went wrong !." })
      );
  };

  return (
    <div className="lead-module small-box-padding">
      <div className="create-user-box">
        <MainHeading data={`Auto history`} />
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
            style={{ width: "200px" }}
            placeholder='Select department'
            value={dateFilter?.departmentId}
            options={[
              { label: "Sales", value: 2 },
              { label: "Quality", value: 3 },
            ]}
            onChange={(e) =>
              setDateFilter((prev) => ({ ...prev, departmentId: e }))
            }
          />
        </Flex>
        <Flex align="center" gap={2}>
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
              }
            }}
          />
          <Button
            loading={autoExportLoading === "pending"}
            onClick={handleApplyFilter}
          >
            Apply filter
          </Button>
          <CSVLink
            className="text-white"
            data={exportData}
            headers={headers}
            filename={"history.csv"}
          >
            <Button disabled={autoExportLoading !== "success"}>
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
            scroll={{ y: "70vh", x: 1800 }}
            rowKey={(record) => record?.id}
            page={paginationData?.page}
            pageSize={paginationData?.size}
            pagination={true}
            totalCount={totalAutoListCount}
            handlePagination={handlePagination}
          />
        </Suspense>
      </div>
    </div>
  );
};

export default AutoHistory;
