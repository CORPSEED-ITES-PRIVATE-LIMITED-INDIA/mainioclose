import React, { Suspense, useCallback, useEffect, useState } from "react";
import "./LeadsModule.scss";
import { Link, useParams } from "react-router-dom";
import LeadCreateModel from "../../../Model/LeadCreateModel";
import { useDispatch, useSelector } from "react-redux";
import TableScalaton from "../../../components/TableScalaton";
import { CSVLink } from "react-csv";
import {
  deleteMultipleLeads,
  getAllLeadCount,
  getAllLeadsByFilter,
  getAllLeadsForExport,
  getAllStatusData,
  getLeadNotificationCount,
  handleDeleteSingleLead,
  handleFlagByQualityTeam,
  handleLeadassignedToSamePerson,
  importLeadsSheet,
  multiAssignedLeads,
  searchLeads,
  updateAssigneeInLeadModule,
  updateHelper,
} from "../../../Toolkit/Slices/LeadSlice";
import MainHeading from "../../../components/design/MainHeading";
import {
  Button,
  DatePicker,
  Drawer,
  Dropdown,
  Flex,
  Input,
  Menu,
  notification,
  Popconfirm,
  Popover,
  Select,
  Spin,
  Tag,
  Tooltip,
  Typography,
  Upload,
} from "antd";
import { Icon } from "@iconify/react";
import CompanyFormModal from "../../Accounts/CompanyFormModal";
import OverFlowText from "../../../components/OverFlowText";
import { BTN_ICON_HEIGHT, BTN_ICON_WIDTH } from "../../../components/Constants";
import {
  playErrorSound,
  playSuccessSound,
  rangePresets,
} from "../../Common/Commons";
import LeadsDetailsMainPage from "./LeadsDetailsMainPage";
import dayjs from "dayjs";
import AllNotificationPage from "./AllNotificationPage";
import { leadSource } from "../../../data/FakeData";
import { getAllUrlList } from "../../../Toolkit/Slices/LeadUrlSlice";
const { Text, Title } = Typography;
const { Search } = Input;
const { RangePicker } = DatePicker;

const CommonTable = React.lazy(() => import(`../../../components/CommonTable`));

const LeadsModule = () => {
  const { userid } = useParams();
  const dispatch = useDispatch();
  const allLeadData = useSelector((state) => state.leads.allLeads);
  const leadUserNew = useSelector((state) => state.leads.getAllLeadUserData);
  const getAllStatus = useSelector((state) => state.leads.getAllStatus);
  const leadresponseStatus = useSelector(
    (state) => state.leads.leadresponseStatus
  );
  const notificationCount = useSelector(
    (state) => state.leads.notificationCount
  );
  const currentUserDetail = useSelector(
    (state) => state.auth.getDepartmentDetail
  );
  const totalCount = useSelector((state) => state.leads.totalCount);
  const allLeadsForExport = useSelector(
    (state) => state.leads.allLeadsForExport
  );
  const [multibtn, setMultibtn] = useState("");
  const [leadDelLoading, setLeadDelLoading] = useState("");
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [uploadedFile, setUploadedFile] = useState(null);
  const allLeadUrl = useSelector((prev) => prev?.leadurls.allUrlList);
  const [openNotificationDrawer, setOpenNotificationDrawer] = useState(false);
  const onSelectChange = (newSelectedRowKeys, rowsData) => {
    setSelectedRowKeys(newSelectedRowKeys);
  };

  const [allMultiFilterData, setAllMultiFilterData] = useState({
    userId: Number(userid),
    userIdFilter: [],
    statusId: [1],
    toDate: "",
    fromDate: "",
    updatedToDate: "",
    updatedfromDate: "",
    originalName: null,
    updatedById: null,
    source: [],
    contactMobileNo: null,
    contactEmail: null,
    sortBy: "id",
    page: 1,
    size: 50,
  });

  const [assignedLeadInfo, setAssignedLeadInfo] = useState({
    statusId: null,
    assigneId: null,
  });
  const [filterDrawer, setFilterDrawer] = useState(false);

  useEffect(() => {
    dispatch(getAllLeadsByFilter(allMultiFilterData));
    dispatch(getAllLeadCount(allMultiFilterData));
    dispatch(getAllLeadsForExport(allMultiFilterData));
  }, [dispatch]);

  useEffect(() => {
    dispatch(getAllStatusData());
  }, [dispatch]);

  const handlePagination = useCallback(
    (dataPage, size) => {
      dispatch(
        getAllLeadsByFilter({ ...allMultiFilterData, page: dataPage, size })
      );
      setAllMultiFilterData((prev) => ({ ...prev, page: dataPage, size }));
    },
    [allMultiFilterData, dispatch]
  );

  const handleDeleteMutipleLeads = useCallback(() => {
    let obj = {
      leadId: selectedRowKeys,
      updatedById: Number(userid),
    };
    setLeadDelLoading("pending");
    dispatch(deleteMultipleLeads(obj))
      .then((response) => {
        if (response?.meta?.requestStatus === "fulfilled") {
          notification.success({ message: "Leads deleted successfully" });
          // playSuccessSound()
          dispatch(getAllLeadsByFilter(allMultiFilterData));
          setLeadDelLoading("success");
          setSelectedRowKeys([]);
        } else {
          setLeadDelLoading("rejected");
          notification.error({ message: "Something went wrong !." });
          // playErrorSound()
        }
      })
      .catch(() => {
        setLeadDelLoading("rejected");
        notification.error({ message: "Something went wrong !." });
        // playErrorSound()
      });
  }, [selectedRowKeys, userid, dispatch, allMultiFilterData]);

  const currentUserRoles = useSelector((state) => state?.auth?.roles);
  const adminRole = currentUserRoles.includes("ADMIN");
  const allUsers = useSelector((state) => state.user.allUsers);

  const exportData = allLeadsForExport?.map((row) => ({
    Id: row?.id,
    "Lead name": row?.leadName,
    "Missed task": row?.missedTaskName,
    Frequency: row?.count,
    Status: row?.status,
    "Client name": row?.clientName,
    Email: row?.clientEmail,
    "Mobile no.": row?.clientMobNo,
    "Assignee person": row?.assigneeName,
    "Assignee email": row?.assigneeEmail,
    "Created by": row?.createdBy,
    Source: row?.source,
    Industry: row?.industry,
    "Sub industry": row?.subIndustry,
    Category: row?.subSubIndustry,
    "Business activity": row?.industryData,
    Address: row?.address,
    Country: row?.country,
    State: row?.state,
    City: row?.city,
    "Pin code": row?.pincode,
    "Updated By": row?.updatedBy,
    "Reopen By": row?.reopenBy,
    "Reopen By Quality": row?.isReopenByQuality,
    "Created Date": dayjs(row?.createDate).format("YYYY-MM-DD"),
  }));

  const headers = [
    "Id",
    "Lead name",
    "Missed task",
    "Frequency",
    "Status",
    "Client name",
    "Email",
    "Mobile no.",
    "Assignee person",
    "Assignee email",
    "Created by",
    "Helper",
    "Source",
    "Industry",
    "Sub industry",
    "Category",
    "Business activity",
    "Address",
    "Country",
    "State",
    "City",
    "Pin code",
    "Updated By",
    "Reopen By",
    "Reopen By Quality",
    "Created Date",
  ];

  const handleHelperChange = useCallback(
    (id, leadId) => {
      let temp = {
        leadId: leadId,
        userId: id,
      };
      dispatch(updateHelper(temp))
        .then((response) => {
          if (response?.meta?.requestStatus === "fulfilled") {
            notification.success({ message: "Helper updated successfully" });
            // playSuccessSound()
            dispatch(getAllLeadsByFilter(allMultiFilterData));
          } else {
            notification.error({ message: "Something went wrong !." });
            // playErrorSound()
          }
        })
        .catch(() => {
          notification.error({ message: "Something went wrong !." });
          // playErrorSound()
        });
    },
    [dispatch, allMultiFilterData]
  );

  const handleUpdateAssignee = useCallback(
    (id, leadId) => {
      let data = {
        leadId: leadId,
        id: id,
        userid: userid,
      };
      dispatch(updateAssigneeInLeadModule(data))
        .then((response) => {
          if (response.meta.requestStatus === "fulfilled") {
            notification.success({
              message: "Assignee is updated successfully.",
            });
            // playSuccessSound()
            dispatch(getAllLeadsByFilter(allMultiFilterData));
          } else {
            notification.error({ message: "Something went wrong !." });
            // playErrorSound()
          }
        })
        .catch(() => {
          notification.error({ message: "Something went wrong !." });
          // playErrorSound()
        });
    },
    [userid, allMultiFilterData, dispatch]
  );

  const leadDeleteResponse = useCallback(
    (id) => {
      let obj = {
        id,
        userid,
      };
      dispatch(handleDeleteSingleLead(obj))
        .then((response) => {
          if (response.meta.requestStatus === "fulfilled") {
            notification.success({ message: "Lead deleted successfully." });
            // playSuccessSound()
            dispatch(getAllLeadsByFilter(allMultiFilterData));
          } else {
            notification.error({ message: "Something went wrong !." });
            // playErrorSound()
          }
        })
        .catch(() => {
          notification.error({ message: "Something went wrong !." });
          // playErrorSound()
        });
    },
    [userid, dispatch, allMultiFilterData]
  );

  const leadAssignedToSame = (id) => {
    dispatch(handleLeadassignedToSamePerson(id))
      .then((response) => {
        if (response.meta.requestStatus === "fulfilled") {
          notification.success({
            message: "Lead assigned to same person successfully",
          });
          // playSuccessSound()
          dispatch(getAllLeadsByFilter(allMultiFilterData));
        } else {
          notification.error({ message: "Something went wrong !." });
          // playErrorSound()
        }
      })
      .catch(() => {
        notification.error({ message: "Something went wrong !." });
        // playErrorSound()
      });
  };

  const handleFlag = useCallback(
    (data) => {
      dispatch(
        handleFlagByQualityTeam({
          currentUerId: userid,
          leadId: data?.id,
          isMarked: data?.reopenByQuality ? false : true,
        })
      )
        .then((resp) => {
          if (resp.meta.requestStatus === "fulfilled") {
            notification.success({
              message: "Lead status updated successfully",
            });
            dispatch(getAllLeadsByFilter(allMultiFilterData));
          } else {
            notification.error({ message: "Something went wrong !." });
          }
        })
        .catch(() =>
          notification.error({ message: "Something went wrong !." })
        );
    },
    [dispatch, userid, allMultiFilterData]
  );

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
          {currentUserDetail?.department === "Quality Team" && (
            <Button size="small" type="text" onClick={() => handleFlag(data)}>
              <Icon
                icon="fluent:flag-24-filled"
                color={data?.reopenByQuality ? "red" : ""}
              />
            </Button>
          )}
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
        <LeadsDetailsMainPage
          allMultiFilterData={allMultiFilterData}
          setSearchText={setSearchText}
          leadId={data?.id}
          data={data}
        >
          {data?.originalName ? data?.originalName : data?.leadName}
        </LeadsDetailsMainPage>
      ),
    },
    {
      title: "Lead freq.",
      dataIndex: "count",
    },
    ...(adminRole
      ? [
          {
            title: "Mobile no.",
            dataIndex: "mobileNo",
            checked: true,
          },
        ]
      : []),
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
    ...(adminRole
      ? [
          {
            title: "Email",
            dataIndex: "email",
            checked: true,
            render: (_, record) => <OverFlowText>{record?.email}</OverFlowText>,
          },
        ]
      : []),
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

    ...(currentUserDetail?.department !== "Sales"
      ? [
          {
            title: "Change assignee",
            dataIndex: "assignee",
            checked: false,
            render: (_, data) => (
              <Select
                showSearch
                size="small"
                style={{ width: "100%" }}
                value={adminRole ? data?.assignee?.id : ""}
                placeholder="select assignee"
                options={
                  leadUserNew?.map((ele) => ({
                    label: ele?.fullName,
                    value: ele?.id,
                  })) || []
                }
                filterOption={(input, option) =>
                  option.label.toLowerCase().includes(input.toLowerCase())
                }
                onChange={(e) => handleUpdateAssignee(e, data?.id)}
              />
            ),
          },
        ]
      : []),

    ...(adminRole
      ? [
          {
            title: "Helper",
            dataIndex: "helper",
            checked: true,
            render: (_, data) => (
              <Select
                showSearch
                size="small"
                value={data?.helper ? data?.helpUser?.id : ""}
                style={{ width: "100%" }}
                options={
                  [
                    { label: "NA", value: "" },
                    ...allUsers?.map((item) => ({
                      label: item?.fullName,
                      value: item?.id,
                    })),
                  ] || []
                }
                filterOption={(input, option) =>
                  option.label.toLowerCase().includes(input.toLowerCase())
                }
                onChange={(e) => handleHelperChange(e, data?.id)}
              />
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
            title: "Create project",
            dataIndex: "project",
            checked: false,
            render: (_, data) => <CompanyFormModal data={data} />,
          },
          {
            title: "Lead assigned",
            dataIndex: "assignedSame",
            checked: false,
            render: (_, data) => (
              <Button size="small" onClick={() => leadAssignedToSame(data?.id)}>
                To same{" "}
              </Button>
            ),
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
          {
            dataIndex: "action",
            title: "Action",
            checked: false,
            render: (_, data) => (
              <Popconfirm
                title="Delete the lead"
                description="Are you sure to delete this lead ?."
                onConfirm={() => leadDeleteResponse(data?.id)}
                okText="Yes"
                cancelText="No"
              >
                <Button size="small" danger>
                  <Icon
                    icon="fluent:delete-20-regular"
                    height={18}
                    width={18}
                  />
                  Delete
                </Button>
              </Popconfirm>
            ),
          },
        ]
      : []),
  ];

  const handleMultipleAssignedLeads = useCallback(() => {
    let obj = {
      leadIds: selectedRowKeys,
      updatedById: userid,
      ...assignedLeadInfo,
    };
    setMultibtn("pending");
    dispatch(multiAssignedLeads(obj))
      .then((response) => {
        if (response?.meta?.requestStatus === "fulfilled") {
          notification.success({ message: "Leads assigned successfully ." });
          // playSuccessSound()
          dispatch(getAllLeadsByFilter(allMultiFilterData));
          setMultibtn("success");
          setSelectedRowKeys([]);
          setAssignedLeadInfo({
            statusId: null,
            assigneId: null,
          });
        } else {
          notification.error({ message: "Something went wrong !." });
          // playErrorSound()
          setMultibtn("rejected");
        }
      })
      .catch(() => {
        notification.error({ message: "Something went wrong !." });
        // playErrorSound()
        setMultibtn("rejected");
      });
  }, [dispatch, selectedRowKeys, userid, assignedLeadInfo, allMultiFilterData]);

  useEffect(() => {
    const notifcationApi = setInterval(() => {
      dispatch(getLeadNotificationCount(userid)).then((resp) => {
        if (resp.meta.requestStatus === "fulfilled") {
          // playSuccessSound()
        }
      });
    }, 1 * 60 * 1000);
    dispatch(getLeadNotificationCount(userid)).then((resp) => {
      if (resp.meta.requestStatus === "fulfilled") {
        // playSuccessSound()
      }
    });
    return () => clearInterval(notifcationApi);
  }, [userid, dispatch]);

  const onSearchLead = (e, b, c) => {
    if (e) {
      setSearchText(e);
      dispatch(searchLeads({ input: e, id: userid }));
    }
    if (!b) {
      // dispatch(searchLeads({ input: "", id: userid }))
      setSearchText("");
      dispatch(getAllLeadsByFilter(allMultiFilterData));
    }
  };

  const props = {
    name: "file",
    multiple: true,
    action: "/leadService/api/v1/upload/uploadimageToFileSystem",
    onChange(info) {
      setUploadedFile(info?.file?.response);
    },
    onDrop(e) {},
  };

  const handleUploadFile = useCallback(() => {
    if (uploadedFile) {
      dispatch(importLeadsSheet(uploadedFile))
        .then((resp) => {
          if (resp.meta.requestStatus === "fulfilled") {
            notification.success({ message: "File uploaded successfully !." });
          } else {
            notification.error({ message: "Something wemt wrong !." });
          }
        })
        .catch(() =>
          notification.error({ message: "Something wemt wrong !." })
        );
    }
  }, [dispatch, uploadedFile]);

  const handleApplyFilter = useCallback(() => {
    setSelectedRowKeys([]);
    dispatch(getAllLeadsByFilter(allMultiFilterData));
    dispatch(getAllLeadsForExport(allMultiFilterData));
    dispatch(getAllLeadCount(allMultiFilterData));
    setFilterDrawer(false);
  }, [allMultiFilterData, dispatch]);

  const handleResetFilter = useCallback(() => {
    dispatch(
      getAllLeadsByFilter({
        userId: Number(userid),
        userIdFilter: [],
        statusId: [1],
        toDate: "",
        fromDate: "",
        page: 1,
        size: 50,
      })
    );
    dispatch(
      getAllLeadsForExport({
        userId: Number(userid),
        userIdFilter: [],
        statusId: [1],
        toDate: "",
        fromDate: "",
        page: 1,
        size: 50,
      })
    );
    dispatch(
      getAllLeadCount({
        userId: Number(userid),
        userIdFilter: [],
        statusId: [1],
        toDate: "",
        fromDate: "",
        page: 1,
        size: 50,
      })
    );
  }, [dispatch, userid]);

  const handleSort = (sortBy, sortDirection) => {
    const updatedData = { ...allMultiFilterData, sortBy, sortDirection };

    setAllMultiFilterData(updatedData);

    dispatch(getAllLeadsByFilter(updatedData));
    dispatch(getAllLeadsForExport(updatedData));
    dispatch(getAllLeadCount(updatedData));
  };

  const sortFields = [
    { key: "id", label: "Id" },
    { key: "createdDate", label: "Created date" },
    { key: "updatedDate", label: "Updated date" },
  ];

  const menu = (
    <Menu>
      {sortFields.map(({ key, label }) => (
        <Menu.Item
          key={key}
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Flex gap={8} align="center">
            {" "}
            <span>{label}</span>
            <span style={{ display: "flex", gap: 8 }}>
              <Tooltip title="Sort Ascending">
                <Icon
                  icon="fluent:arrow-sort-up-24-filled"
                  style={{
                    fontSize: 18,
                    color:
                      allMultiFilterData.sortBy === key &&
                      allMultiFilterData.sortDirection === "asc"
                        ? "#1677ff"
                        : "#aaa",
                    cursor: "pointer",
                  }}
                  onClick={(e) => {
                    e.domEvent?.stopPropagation?.(); // prevent triggering Menu.Item
                    handleSort(key, "asc");
                  }}
                />
              </Tooltip>
              <Tooltip title="Sort Descending">
                <Icon
                  icon="fluent:arrow-sort-down-24-filled"
                  style={{
                    fontSize: 18,
                    color:
                      allMultiFilterData.sortBy === key &&
                      allMultiFilterData.sortDirection === "desc"
                        ? "#1677ff"
                        : "#aaa",
                    cursor: "pointer",
                  }}
                  onClick={(e) => {
                    e.domEvent?.stopPropagation?.();
                    handleSort(key, "desc");
                  }}
                />
              </Tooltip>
            </span>
          </Flex>
        </Menu.Item>
      ))}
    </Menu>
  );

  return (
    <div className="lead-module small-box-padding">
      <div className="create-user-box">
        <MainHeading data={`Leads (${totalCount})`} />
      </div>
      <Flex justify="space-between" align="center" className="marginBottom8px">
        <Search
          placeholder="Search"
          allowClear
          value={searchText}
          onSearch={onSearchLead}
          onChange={(e) => {
            setSearchText(e.target.value);
            if (!e.target.value && !e.target.value.trim()) {
              dispatch(getAllLeadsByFilter(allMultiFilterData));
              setSearchText("");
            }
          }}
          enterButton="search"
          style={{ width: "20%" }}
          prefix={<Icon icon="fluent:search-24-regular" />}
        />
        <Flex align="center" gap={2}>
          <Link to={`allTask`}>
            <Button type="primary">All tasks</Button>
          </Link>
          {adminRole && (
            <CSVLink
              className="text-white"
              data={exportData}
              headers={headers}
              filename={"exported_data.csv"}
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
          )}

          <Dropdown overlay={menu} trigger={["click"]}>
            <Button>
              <Icon
                icon="fluent:arrow-sort-down-lines-24-filled"
                width="18"
                height="18"
              />
              Sort
            </Button>
          </Dropdown>

          <Button
            onClick={() => {
              setFilterDrawer(true);
              dispatch(getAllUrlList());
            }}
          >
            Filter data
          </Button>

          {adminRole && (
            <Popover
              trigger={"click"}
              overlayInnerStyle={{ minWidth: 200 }}
              placement="bottomRight"
              content={
                <Flex vertical gap={24}>
                  <Flex vertical gap={8}>
                    <Title level={5}>Upload csv file or excel sheet </Title>
                    <Upload {...props}>
                      <Button>
                        <Icon
                          icon="fluent:attach-16-regular"
                          width="16"
                          height="16"
                        />
                        Attach
                      </Button>
                    </Upload>
                  </Flex>
                  <Button type="primary" onClick={handleUploadFile}>
                    Submit
                  </Button>
                </Flex>
              }
            >
              <Button className="mr-2">
                {" "}
                <Icon
                  icon="fluent:arrow-download-16-filled"
                  height={BTN_ICON_HEIGHT}
                  width={BTN_ICON_WIDTH}
                />{" "}
                Import
              </Button>
            </Popover>
          )}

          <LeadCreateModel allMultiFilterData={allMultiFilterData} />
          <Button
            type="default"
            onClick={() => setOpenNotificationDrawer(true)}
          >
            Notification{" "}
            <div className="bell-box">
              <span className="bell-count">{notificationCount}</span>
              <Icon icon="fluent:alert-24-regular" width="24" height="24" />
            </div>
          </Button>
        </Flex>
      </Flex>

      <div className="table-arrow">
        <Suspense fallback={<TableScalaton />}>
          <Spin
            size="large"
            spinning={leadresponseStatus === "pending" ? true : false}
          >
            <CommonTable
              data={allLeadData}
              columns={columns}
              scroll={{ y: "70vh", x: adminRole ? 3500 : 2500 }}
              rowSelection={true}
              onRowSelection={onSelectChange}
              selectedRowKeys={selectedRowKeys}
              rowClassName={(record) => (!record.view ? "light-gray-row" : "")}
              rowKey={(record) => record?.id}
              pagination={true}
              page={allMultiFilterData?.page}
              pageSize={allMultiFilterData?.size}
              totalCount={totalCount}
              handlePagination={handlePagination}
              footerContent={
                adminRole ? (
                  <div className={`bottom-line`}>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "center",
                        gap: 12,
                      }}
                    >
                      <Popconfirm
                        title="Delete the leads"
                        description="Are you sure to delete these leads ?."
                        okText="Yes"
                        cancelText="No"
                        onConfirm={handleDeleteMutipleLeads}
                      >
                        <Button
                          danger
                          disabled={
                            selectedRowKeys?.length === 0 ? true : false
                          }
                        >
                          {leadDelLoading === "pending"
                            ? "Please wait..."
                            : "Delete"}
                        </Button>
                      </Popconfirm>

                      <Select
                        allowClear
                        showSearch
                        value={assignedLeadInfo?.statusId}
                        style={{ width: 200 }}
                        placeholder="Select status"
                        options={
                          getAllStatus?.length > 0
                            ? getAllStatus?.map((item) => ({
                                label: item?.name,
                                value: item?.id,
                              }))
                            : []
                        }
                        onChange={(e) =>
                          setAssignedLeadInfo((prev) => ({
                            ...prev,
                            statusId: e,
                          }))
                        }
                        filterOption={(input, option) =>
                          option.label
                            .toLowerCase()
                            .includes(input.toLowerCase())
                        }
                      />
                    </div>
                    <div>
                      <Select
                        showSearch
                        allowClear
                        value={assignedLeadInfo?.assigneId}
                        style={{ width: 200 }}
                        placeholder="select user"
                        options={
                          leadUserNew?.length > 0
                            ? leadUserNew?.map((ele) => ({
                                label: ele?.fullName,
                                value: ele?.id,
                              }))
                            : []
                        }
                        onChange={(e) =>
                          setAssignedLeadInfo((prev) => ({
                            ...prev,
                            assigneId: e,
                          }))
                        }
                        filterOption={(input, option) =>
                          option.label
                            .toLowerCase()
                            .includes(input.toLowerCase())
                        }
                      />
                    </div>
                    <div>
                      <Button
                        type="primary"
                        disabled={selectedRowKeys?.length === 0 ? true : false}
                        onClick={handleMultipleAssignedLeads}
                      >
                        {multibtn === "pending" ? "Loading..." : "Send"}
                      </Button>
                    </div>
                    {/* <Text>Selected rows: {selectedRowKeys?.length}</Text> */}
                  </div>
                ) : (
                  ""
                )
              }
            />
          </Spin>
        </Suspense>
      </div>
      <Drawer
        open={openNotificationDrawer}
        onClose={() => setOpenNotificationDrawer(false)}
        closeIcon={false}
        width={"80%"}
      >
        <AllNotificationPage />
      </Drawer>

      <Drawer
        title="Filter"
        open={filterDrawer}
        onClose={() => setFilterDrawer(false)}
        width={"50%"}
      >
        <div className="main-filter-container">
          {adminRole && (
            <Flex vertical gap={8}>
              <Text>User </Text>
              <Select
                mode="multiple"
                maxTagCount="responsive"
                allowClear
                showSearch
                style={{ width: "100%" }}
                value={allMultiFilterData?.userIdFilter}
                placeholder="Select users"
                onChange={(e) =>
                  setAllMultiFilterData((prev) => ({
                    ...prev,
                    userIdFilter: e,
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
          )}
          {adminRole && (
            <Flex vertical gap={8}>
              <Text>Updated by </Text>
              <Select
                showSearch
                style={{ width: "100%" }}
                value={allMultiFilterData?.updatedById}
                placeholder="Select users"
                onChange={(e) =>
                  setAllMultiFilterData((prev) => ({
                    ...prev,
                    updatedById: e,
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
          )}

          <Flex vertical gap={8}>
            <Text>Created date </Text>
            <RangePicker
              showTime={{ format: "HH:mm" }}
              placement="bottomRight"
              format="YYYY-MM-DD HH:mm"
              presets={rangePresets}
              value={[
                allMultiFilterData?.toDate
                  ? dayjs(allMultiFilterData?.toDate)
                  : "",
                allMultiFilterData?.fromDate
                  ? dayjs(allMultiFilterData?.fromDate)
                  : "",
              ]}
              disabledDate={(current) =>
                current && current > dayjs().endOf("day")
              }
              onChange={(dates, dateStrings) => {
                if (dates) {
                  setAllMultiFilterData((prev) => ({
                    ...prev,
                    toDate: dateStrings[0],
                    fromDate: dateStrings[1],
                  }));
                } else {
                  setAllMultiFilterData((prev) => ({
                    ...prev,
                    toDate: "",
                    fromDate: "",
                  }));
                }
              }}
            />
          </Flex>

          <Flex vertical gap={8}>
            <Text>Status </Text>
            <Select
              mode="multiple"
              maxTagCount="responsive"
              style={{ width: "100%" }}
              value={allMultiFilterData?.statusId}
              allowClear
              showSearch
              placeholder="Select Status"
              options={
                getAllStatus?.length > 0
                  ? getAllStatus?.map((item) => ({
                      label: item?.name,
                      value: item?.id,
                    }))
                  : []
              }
              onChange={(e) =>
                setAllMultiFilterData((prev) => ({ ...prev, statusId: e }))
              }
              filterOption={(input, option) =>
                option.label.toLowerCase().includes(input.toLowerCase())
              }
            />
          </Flex>

          <Flex vertical gap={8}>
            <Text>Upated date </Text>
            <RangePicker
              showTime={{ format: "HH:mm" }}
              placement="bottomRight"
              format="YYYY-MM-DD HH:mm"
              presets={rangePresets}
              value={[
                allMultiFilterData?.updatedToDate
                  ? dayjs(allMultiFilterData?.updatedToDate)
                  : "",
                allMultiFilterData?.updatedfromDate
                  ? dayjs(allMultiFilterData?.updatedfromDate)
                  : "",
              ]}
              disabledDate={(current) =>
                current && current > dayjs().endOf("day")
              }
              onChange={(dates, dateStrings) => {
                if (dates) {
                  setAllMultiFilterData((prev) => ({
                    ...prev,
                    updatedToDate: dateStrings[0],
                    updatedfromDate: dateStrings[1],
                  }));
                } else {
                  setAllMultiFilterData((prev) => ({
                    ...prev,
                    updatedToDate: "",
                    updatedfromDate: "",
                  }));
                }
              }}
            />
          </Flex>
          <Flex vertical gap={8}>
            <Text>Source </Text>
            <Select
              mode="multiple"
              maxTagCount="responsive"
              placeholder="Select source"
              showSearch
              allowClear
              value={allMultiFilterData?.source}
              options={
                leadSource?.map((item) => ({
                  label: item,
                  value: item,
                })) || []
              }
              filterOption={(input, option) =>
                option.label.toLowerCase().includes(input.toLowerCase())
              }
              onChange={(e) =>
                setAllMultiFilterData((prev) => ({
                  ...prev,
                  source: e,
                }))
              }
            />
          </Flex>
          <Flex vertical gap={8}>
            <Text>Service </Text>
            <Select
              showSearch
              allowClear
              options={allLeadUrl?.map((item) => ({
                label: item?.urlsName,
                value: item?.urlsName,
              }))}
              value={allMultiFilterData?.originalName}
              onChange={(e) =>
                setAllMultiFilterData((prev) => ({
                  ...prev,
                  originalName: e,
                }))
              }
              // filterOption={(input, option) =>
              //   option.label.toLowerCase().includes(input.toLowerCase())
              // }
            />
          </Flex>

          <Flex vertical gap={8}>
            <Text>Mobile no.</Text>
            <Input
              value={allMultiFilterData?.contactMobileNo}
              onChange={(e) =>
                setAllMultiFilterData((prev) => ({
                  ...prev,
                  contactMobileNo: e.target.value,
                }))
              }
            />
          </Flex>

          <Flex vertical gap={8}>
            <Text>Email</Text>
            <Input
              value={allMultiFilterData?.contactEmail}
              onChange={(e) =>
                setAllMultiFilterData((prev) => ({
                  ...prev,
                  contactEmail: e.target.value,
                }))
              }
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

export default LeadsModule;
