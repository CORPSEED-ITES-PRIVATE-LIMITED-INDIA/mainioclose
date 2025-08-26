import React, { useEffect, useState } from "react";
import OverFlowText from "../../components/OverFlowText";
import { useDispatch, useSelector } from "react-redux";
import { searchIvrLeads } from "../../Toolkit/Slices/IvrSlice";
import { useParams } from "react-router-dom";
import { Flex, Input, Tag, Typography } from "antd";
import { Icon } from "@iconify/react";
import MainHeading from "../../components/design/MainHeading";
import CommonTable from "../../components/CommonTable";
const { Text } = Typography;
const { Search } = Input;

const LeadSearchInQuality = () => {
  const dispatch = useDispatch();
  const { userid } = useParams();
  const data = useSelector((state) => state.ivr.leadSearchList);
  const [searchText, setSearchText] = useState("");

  const onSearchLead = (e, b, c) => {
    if (e) {
      setSearchText(e);
      dispatch(searchIvrLeads({ input: e, id: userid }));
    }
    if (!b) {
      setSearchText("");
      dispatch(searchIvrLeads({ input: e, id: userid }));
    }
  };

  const columns = [
    {
      dataIndex: "sno",
      title: "S no.",
      fixed: "left",
      width: 80,
      checked: true,
      render: (y, data, idx) => (
        <Flex justify="space-between" align="center">
          <Text>{idx + 1}</Text>
        </Flex>
      ),
    },
    {
      dataIndex: "id",
      title: "Id",
      fixed: "left",
      width: 80,
      checked: true,
    },
    {
      dataIndex: "leadName",
      title: "Lead name",
      fixed: "left",
      checked: true,
      width: 250,
      sorter: (a, b) => {
        const nameA = a.leadName.toLowerCase();
        const nameB = b.leadName.toLowerCase();
        if (nameA < nameB) return -1;
        if (nameA > nameB) return 1;
        return 0;
      },
      render: (_, data) => (
        <Text>{data?.originalName ? data?.originalName : data?.leadName}</Text>
      ),
    },
    {
      title: "Lead freq.",
      dataIndex: "count",
    },

    {
      title: "Mobile no.",
      dataIndex: "mobileNo",
      checked: true,
    },

    {
      title: "Missed task",
      dataIndex: "missedTaskDate",
      checked: true,
      render: (_, data) => {
        const taskStatus = data?.missedTaskStatus;
        const taskName = data?.missedTaskName;
        const taskDate = new Date(data?.missedTaskDate).toLocaleDateString();
        const hours = new Date(data?.missedTaskDate).getHours();
        const minutes = new Date(data?.missedTaskDate).getMinutes();
        const taskCreated = data?.missedTaskCretedBy;
        return taskName !== null ? (
          <OverFlowText type={taskName !== null ? "danger" : ""}>
            {taskStatus} - {taskCreated} - {taskName} | {taskDate} {hours}:
            {minutes}
          </OverFlowText>
        ) : (
          <Text>NA</Text>
        );
      },
    },
    {
      title: "Status",
      dataIndex: "status",
      checked: true,
      render: (_, data) => (
        <Text type={data?.status?.name ? "success" : ""}>
          {data?.status?.name ? data?.status?.name : "NA"}
        </Text>
      ),
    },
    {
      title: "Client name",
      dataIndex: "name",
      checked: true,
      sorter: (a, b) => {
        const nameA = a.clients[0]?.name?.toLowerCase();
        const nameB = b.clients[0]?.name?.toLowerCase();
        if (nameA < nameB) return -1;
        if (nameA > nameB) return 1;
        return 0;
      },
      render: (_, data) => (
        <OverFlowText>
          {data?.clients[0]?.name ? data?.clients[0]?.name : "NA"}
        </OverFlowText>
      ),
    },

    {
      title: "Email",
      dataIndex: "email",
      checked: true,
      render: (_, record) => <OverFlowText>{record?.email}</OverFlowText>,
    },

    {
      title: "Assignee person",
      dataIndex: "assigneeName",
      checked: true,
      render: (_, data) => (
        <OverFlowText>{data?.assignee?.fullName}</OverFlowText>
      ),
    },

    {
      title: "Date",
      dataIndex: "createDate",
      checked: true,
      render: (_, data) => (
        <Text>{new Date(data?.createDate).toLocaleDateString()}</Text>
      ),
    },

    {
      title: "Created by",
      dataIndex: "createdBy",
      checked: true,
      render: (_, data) => (
        <OverFlowText>{data?.createdBy?.fullName}</OverFlowText>
      ),
    },
    {
      title: "Source",
      dataIndex: "source",
      checked: true,
      render: (_, data) => <OverFlowText>{data?.source}</OverFlowText>,
    },
    {
      title: "Industry",
      dataIndex: "industries",
      checked: false,
      render: (data) => data?.name,
    },
    {
      title: "Sub industry",
      dataIndex: "subIndustry",
      checked: false,
      render: (data) => data?.name,
    },
    {
      title: "Category",
      dataIndex: "subsubIndustry",
      checked: false,
      render: (data) => data?.name,
    },
    {
      title: "Business activity",
      dataIndex: "industriesData",
      checked: false,
      render: (data) =>
        data?.map((item) => (
          <Tag key={`activity${item?.name}`}>{item?.name}</Tag>
        )),
    },
    {
      title: "Address",
      dataIndex: "address",
      checked: false,
    },
    {
      title: "Country",
      dataIndex: "country",
      checked: false,
    },
    {
      title: "State",
      dataIndex: "state",
      checked: false,
    },
    {
      title: "City",
      dataIndex: "city",
      checked: false,
    },
    {
      title: "Pin code",
      dataIndex: "pinCode",
      checked: false,
    },
  ];
  return (
    <>
      <div className="create-user-box">
        <MainHeading data={"Leads search"} />
      </div>
      <div className="flex-verti-center-hori-start mt-2">
        <Search
          placeholder="Search"
          allowClear
          value={searchText}
          onSearch={onSearchLead}
          onChange={(e) => {
            setSearchText(e.target.value);
            if (!e.target.value && !e.target.value.trim()) {
              dispatch(searchIvrLeads({ input: e, id: userid }));
              setSearchText("");
            }
          }}
          enterButton="search"
          style={{ width: "30%", marginBottom: "8px" }}
          prefix={<Icon icon="fluent:search-24-regular" />}
        />
      </div>
      <CommonTable
        data={data}
        columns={columns}
        scroll={{ y: "70vh", x: 3000 }}
        rowClassName={(record) => (!record.view ? "light-gray-row" : "")}
        rowKey={(record) => record?.id}
      />
    </>
  );
};

export default LeadSearchInQuality;
