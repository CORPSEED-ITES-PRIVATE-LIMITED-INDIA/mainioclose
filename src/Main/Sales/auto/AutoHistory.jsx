import React, { Suspense, useCallback, useEffect, useState } from "react";
import CommonTable from "../../../components/CommonTable";
import TableScalaton from "../../../components/TableScalaton";
import { Button, Flex, Input, Typography } from "antd";
import { CSVLink } from "react-csv";
import { Icon } from "@iconify/react";
import MainHeading from "../../../components/design/MainHeading";
import { BTN_ICON_HEIGHT, BTN_ICON_WIDTH } from "../../../components/Constants";
import OverFlowText from "../../../components/OverFlowText";
import dayjs from "dayjs";
import { useDispatch, useSelector } from "react-redux";
import {
  getAllAutoHistoryForExport,
  getAllAutoHistoryList,
  getAllAutoHistroryCount,
} from "../../../Toolkit/Slices/LeadSlice";
import { useParams } from "react-router-dom";
import LeadsDetailsMainPage from "../Leads/LeadsDetailsMainPage";
const { Text } = Typography;

const AutoHistory = () => {
  const dispatch = useDispatch();
  const { userid } = useParams();
  const autoList = useSelector((state) => state.leads.autoList);
  const autoHistoryExportList = useSelector(
    (state) => state.leads.autoHistoryExportList
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

  useEffect(() => {
    dispatch(getAllAutoHistoryList(paginationData));
    dispatch(getAllAutoHistroryCount());
    dispatch(getAllAutoHistoryForExport());
  }, [dispatch]);

  const handlePagination = useCallback(
    (dataPage, size) => {
      dispatch(getAllAutoHistoryList({ page: dataPage, size }));
      setPaginationData({ size: size, page: dataPage });
    },
    [dispatch, userid]
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
      // render: (_, data) => <Text>{data?.leadName}</Text>,
      render: (_, data) => (
        <LeadsDetailsMainPage leadId={data?.leadId} data={data}>
          {data?.leadName}
        </LeadsDetailsMainPage>
      ),
    },
    {
      dataIndex: "clientEmail",
      title: "Client email",
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
    {
      dataIndex: "paId",
      title: "Previous assignee id",
      render: (_, data) => <Text>{data?.paId}</Text>,
    },
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
      title: "Status",
      dataIndex: "status",
      render: (_, data) => <OverFlowText>{data?.status?.name}</OverFlowText>,
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
    "Lead name": row?.leadName,
    Status: row?.status?.name,
    "Client name": row?.clientName,
    "Client Email": row?.clientEmail,
    "Mobile no.": row?.mobileNo,
    "Previous Assignee person": row?.paName,
    "Previous Assignee email": row?.paEmail,
    "Current Assignee person": row?.currName,
    "Current Assignee email": row?.currEmail,
    "Created Date": dayjs(row?.createDate).format("YYYY-MM-DD"),
  }));

  const headers = [
    "Id",
    "Lead name",
    "Status",
    "Client name",
    "Client Email",
    "Mobile no.",
    "Previous Assignee person",
    "Previous Assignee email",
    "Current Assignee person",
    "Current Assignee email",
    "Created Date",
  ];

  return (
    <div className="lead-module small-box-padding">
      <div className="create-user-box">
        <MainHeading data={`History`} />
      </div>
      <Flex justify="space-between" align="center" className="marginBottom8px">
        <Input
          style={{ width: "25%" }}
          value={searchText}
          size="small"
          onChange={handleSearch}
          placeholder="search"
          prefix={<Icon icon="fluent:search-24-regular" />}
        />
        <Flex align="center" gap={2}>
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
