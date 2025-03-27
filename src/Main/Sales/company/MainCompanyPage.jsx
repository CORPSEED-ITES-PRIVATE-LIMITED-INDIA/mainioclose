import React, { lazy, Suspense, useCallback, useEffect, useState } from "react";
import TableOutlet from "../../../components/design/TableOutlet";
import MainHeading from "../../../components/design/MainHeading";
import { useDispatch, useSelector } from "react-redux";
import {
  exportAllCompanyData,
  getCompanyAction,
  getHandleSearchCompanies,
  searchCompany,
  updateCompanyAssignee,
  updateCompanyName,
  updateMultiCompanyAssignee,
  updateMultiTempCompanyAssignee,
} from "../../../Toolkit/Slices/CompanySlice";
import TableScalaton from "../../../components/TableScalaton";
import SomethingWrong from "../../../components/usefulThings/SomethingWrong";
import ColComp from "../../../components/small/ColComp";
import { useParams } from "react-router-dom";
import { getAllLeadUser } from "../../../Toolkit/Slices/LeadSlice";
import {
  Button,
  Checkbox,
  Divider,
  Dropdown,
  Flex,
  Form,
  Input,
  Modal,
  notification,
  Popover,
  Select,
  Space,
  Tag,
  Tooltip,
  Typography,
} from "antd";
import OverFlowText from "../../../components/OverFlowText";
import { Icon } from "@iconify/react";
import { getHighestPriorityRole } from "../../Common/Commons";
import { BTN_ICON_HEIGHT, BTN_ICON_WIDTH } from "../../../components/Constants";
import CompanyHistory from "./CompanyHistory";
import { CSVLink } from "react-csv";
const CommonTable = lazy(() => import("../../../components/CommonTable"));
const { Search } = Input;
const { Text } = Typography;

const MainCompanyPage = () => {
  const dispatch = useDispatch();
  const { userid } = useParams();
  const [form] = Form.useForm();
  const [companyForm] = Form.useForm();
  const currUser = useSelector((prev) => prev?.auth?.currentUser);
  const leadUserNew = useSelector((state) => state.leads.getAllLeadUserData);
  const currentRoles = useSelector((state) => state?.auth?.roles);
  const allUsers = useSelector((state) => state.user.allUsers);
  const { allCompnay, loadingCompany, errorCompany } = useSelector(
    (prev) => prev?.company
  );
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [exportedData, setExportedData] = useState([]);
  const [assigneeId, setAssigneeId] = useState(null);
  const [assignedProcessing, setAssignedProcessing] = useState("");
  const [tempAssigneeId, setTempAssigneeId] = useState(null);
  const [paginationData, setPaginationData] = useState({
    page: 1,
    size: 50,
  });
  const [openModal, setOpenModal] = useState(false)
  const [filterUserId, setFilterUserId] = useState("");
  const [openPopover, setOpenPopover] = useState(false);
  const [updatedData, setUpdatedData] = useState(null)
  const [searchDetail, setSearchDetail] = useState({
    type: "name",
    userId: userid,
    searchNameAndGSt: "",
  });

  useEffect(() => {
    dispatch(
      getCompanyAction({
        id: currUser?.id,
        page: paginationData?.page,
        size: paginationData?.size,
        filterUserId,
      })
    );
  }, [dispatch, currUser]);

  useEffect(() => {
    dispatch(getAllLeadUser(userid));
  }, [userid, dispatch]);

  const onSelectChange = (newSelectedRowKeys, rowsData) => {
    setSelectedRowKeys(newSelectedRowKeys);
  };

  const onSearchLead = (e, b) => {
    dispatch(searchCompany({ inputText: e, userId: userid }));
    if (!b) {
      dispatch(searchCompany({ inputText: "", userId: userid }));
    }
  };

  const handleSearchCompany = () => {
    dispatch(getHandleSearchCompanies(searchDetail));
  };

  const handlePagination = useCallback(
    (dataPage, size) => {
      dispatch(
        getCompanyAction({
          id: currUser?.id,
          page: dataPage,
          size: size,
          filterUserId: filterUserId,
        })
      );
      setPaginationData({ size: size, page: dataPage });
    },
    [currUser, dispatch, filterUserId]
  );

  const handleUpdateAssignee = useCallback(
    (assigneeId, companyId) => {
      let data = {
        companyId: companyId,
        assigneeId: assigneeId,
        currentUserId: userid,
      };
      dispatch(updateCompanyAssignee(data))
        .then((response) => {
          if (response.meta.requestStatus === "fulfilled") {
            notification.success({
              message: "Assignee is updated successfully",
            });
            dispatch(
              getCompanyAction({
                id: currUser?.id,
                page: paginationData?.page,
                size: paginationData?.size,
                filterUserId,
              })
            );
          } else {
            notification.error({ message: "Something went wrong !." });
          }
        })
        .catch(() => {
          notification.error({ message: "Something went wrong !." });
        });
    },
    [dispatch, currUser, paginationData, filterUserId]
  );

  const filterCompanyBasedOnUser = useCallback(
    (filterUserId) => {
      if (filterUserId) {
        dispatch(
          getCompanyAction({
            id: currUser?.id,
            page: paginationData?.page,
            size: paginationData?.size,
            filterUserId,
          })
        );
        setFilterUserId(filterUserId);
      }
    },
    [paginationData, dispatch, currUser]
  );


  const handleUpdate = (value) => {
    companyForm.setFieldsValue({ name: value?.companyName })
    setUpdatedData(value)
    setOpenModal(true)
  }

  const handleUpdateCompanyName = (values) => {
    dispatch(updateCompanyName({ companyId: updatedData?.companyId, ...values })).then((res) => {
      if (res.meta.requestStatus === 'fulfilled') {
        notification.success({ message: 'Company name updated successfully !.' })
        companyForm.resetFields()
        setUpdatedData(null)
        setOpenModal(false)
        dispatch(
          getCompanyAction({
            id: currUser?.id,
            page: paginationData?.page,
            size: paginationData?.size,
            filterUserId,
          })
        );
      } else {
        notification.error({ message: 'Something went wrong !.' })
      }
    }).catch(() => notification.error({ message: 'Something went wrong !.' }))
  }

  const columns = [
    {
      dataIndex: "companyId",
      title: "Id",
      fixed: "left",
      width: 80,
      checked: true,
    },
    {
      dataIndex: "companyName",
      title: "Company name",
      fixed: "left",
      checked: true,
      render: (_, props) => (
        <OverFlowText linkText={true} to={`${props?.companyId}/details`}>
          {props?.companyName}
        </OverFlowText>
      ),
    },
    {
      dataIndex: "assignee",
      title: "Assignee",
      checked: true,
      render: (_, props) =>
        getHighestPriorityRole(currentRoles) === "ADMIN" ? (
          <Select
            size="small"
            showSearch
            style={{ width: "100%" }}
            value={props?.assigneeId}
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
            onChange={(e) => handleUpdateAssignee(e, props?.companyId)}
          />
        ) : (
          <ColComp data={props?.assignee?.fullName} />
        ),
    },
    {
      dataIndex: "gstNo",
      title: "GST number",
      checked: false,
      render: (_, props) => <ColComp data={props?.gstNo} />,
    },
    {
      dataIndex: "gstType",
      title: "GST type",
      checked: false,
      render: (_, props) => <ColComp data={props?.gstType} />,
    },

    ...(getHighestPriorityRole(currentRoles) === "ADMIN"
      ? [
        {
          dataIndex: "clientContactEmail",
          title: "Client email",
        },
        {
          dataIndex: "clientContactNo",
          title: "Client contact",
        },
      ]
      : []),
    {
      dataIndex: "city",
      title: "City",
      checked: false,
      render: (_, props) => <ColComp data={props?.city} />,
    },
    {
      dataIndex: "state",
      title: "State",
      checked: false,
      render: (_, props) => <ColComp data={props?.state} />,
    },

    {
      dataIndex: "country",
      title: "Country",
      checked: false,
      render: (_, props) => <ColComp data={props?.country} />,
    },
    {
      dataIndex: "secAddress",
      title: "Secondary address",
      checked: false,
      render: (_, props) => <OverFlowText>{props?.secAddress}</OverFlowText>,
    },
    {
      dataIndex: "secCity",
      title: "Secondary city",
      checked: false,
      render: (_, props) => <ColComp data={props?.secCity} />,
    },
    {
      dataIndex: "secState",
      title: "Secondary state",
      checked: false,
      render: (_, props) => <ColComp data={props?.secState} />,
    },
    {
      dataIndex: "seCountry",
      title: "Secondary country",
      checked: false,
      render: (_, props) => <ColComp data={props?.seCountry} />,
    },
    ...(getHighestPriorityRole(currentRoles) === "ADMIN" ? ([
      {
        dataIndex: "update",
        title: "Update company name",
        render: (_, props) => <Button onClick={() => handleUpdate(props)}>Edit</Button>
      }
    ]) : []),

    {
      dataIndex: "History",
      title: "Company history",
      checked: false,
      render: (_, props) => <CompanyHistory companyId={props.companyId} />,
    },
  ];

  const updateMultiAssigneeForCompanies = useCallback(() => {
    setAssignedProcessing("pending");
    dispatch(
      updateMultiCompanyAssignee({
        companyId: selectedRowKeys,
        currentUserId: userid,
        assigneeId: assigneeId,
      })
    )
      .then((resp) => {
        if (resp.meta.requestStatus === "fulfilled") {
          setAssignedProcessing("success");
          notification.success({
            message: "Companies assigned to user successfully",
          });
          dispatch(
            getCompanyAction({
              id: currUser?.id,
              page: paginationData?.page,
              size: paginationData?.size,
              filterUserId,
            })
          );
          setSelectedRowKeys([]);
          setAssigneeId(null);
        } else {
          setAssignedProcessing("error");
          notification.error({ message: "Something went wrong !." });
        }
      })
      .catch(() => {
        setAssignedProcessing("error");
        notification.error({ message: "Something went wrong !." });
      });
  }, [selectedRowKeys, assigneeId, dispatch, userid, currUser, filterUserId]);

  const updateMultiTempAssigneeForCompanies = useCallback(() => {
    setAssignedProcessing("pending");
    dispatch(
      updateMultiTempCompanyAssignee({
        companyId: selectedRowKeys,
        currentUserId: userid,
        assigneeId: tempAssigneeId,
      })
    )
      .then((resp) => {
        if (resp.meta.requestStatus === "fulfilled") {
          setAssignedProcessing("success");
          notification.success({
            message: "Companies assigned to user successfully",
          });
          dispatch(
            getCompanyAction({
              id: currUser?.id,
              page: paginationData?.page,
              size: paginationData?.size,
              filterUserId,
            })
          );
          setSelectedRowKeys([]);
          setTempAssigneeId(null);
        } else {
          setAssignedProcessing("error");
          notification.error({ message: "Something went wrong !." });
        }
      })
      .catch(() => {
        setAssignedProcessing("error");
        notification.error({ message: "Something went wrong !." });
      });
  }, [
    selectedRowKeys,
    tempAssigneeId,
    dispatch,
    userid,
    currUser,
    filterUserId,
  ]);

  const headers = [
    "Id",
    "Company name",
    "Assignee",
    "GST number",
    "GST type",
    "Contact no.",
    "Email",
    "Address",
    "City",
    "State",
    "Country",
    "Secondary address",
    "Secondary city",
    "Secondary state",
    "Secondary country",
  ];

  const handleExportData = useCallback(
    (values) => {
      dispatch(
        exportAllCompanyData({
          userId: userid,
          filterUserId:
            values?.filterUserId === "all" ? "" : values?.filterUserId,
        })
      ).then((resp) => {
        if (resp.meta.requestStatus === "fulfilled") {
          const data = resp?.payload;
          if (data?.length > 0) {
            const exportedRecord = data?.map((item) => ({
              Id: item?.companyId,
              "Company name": item?.companyName,
              Assignee: item?.assignee,
              "GST number": item?.gstNo,
              "GST type": item?.gstType,
              "Contact no.": item?.clientContactNo,
              Email: item?.clientContactEmail,
              Address: item?.address,
              City: item?.city,
              State: item?.state,
              Country: item?.country,
              "Secondary address": item?.secAddress,
              "Secondary city": item?.secCity,
              "Secondary state": item?.secState,
              "Secondary country": item?.seCountry,
            }));

            setExportedData(exportedRecord);
            form.resetFields();
            setOpenPopover(false);
          }
        }
      });
    },
    [userid, filterUserId, dispatch, form]
  );

  return (
    <TableOutlet>
      <MainHeading
        data={`All company (${allCompnay?.[0]?.total === undefined ? 0 : allCompnay?.[0]?.total
          })`}
      />
      <Flex justify="space-between" align="center">
        <div className="flex-verti-center-hori-start mt-2">
          <Space.Compact>
            <Input
              placeholder="Search"
              value={searchDetail?.searchNameAndGSt}
              allowClear
              onClear={() =>
                dispatch(
                  getCompanyAction({
                    id: currUser?.id,
                    page: paginationData?.page,
                    size: paginationData?.size,
                    filterUserId,
                  })
                )
              }
              prefix={<Icon icon="fluent:search-24-regular" />}
              onChange={(e) =>
                setSearchDetail((prev) => ({
                  ...prev,
                  searchNameAndGSt: e.target.value,
                }))
              }
              onPressEnter={handleSearchCompany}
            />
            <Select
              value={searchDetail?.type}
              options={[
                { label: "Name", value: "name" },
                { label: "Email", value: "email" },
                { label: "GST no.", value: "gstNo" },
                { label: "Contact no.", value: "contactNo" },
              ]}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleSearchCompany();
                }
              }}
              onChange={(e) =>
                setSearchDetail((prev) => ({ ...prev, type: e }))
              }
            />
          </Space.Compact>

          {getHighestPriorityRole(currentRoles) === "ADMIN" && (
            <Select
              showSearch
              allowClear
              style={{ width: "250px" }}
              placeholder="Filter out companies"
              value={filterUserId === "" ? null : filterUserId}
              options={
                allUsers?.length > 0
                  ? allUsers?.map((item) => ({
                    label: item?.fullName,
                    value: item?.id,
                  }))
                  : []
              }
              filterOption={(input, option) =>
                option.label.toLowerCase().includes(input.toLowerCase())
              }
              onChange={filterCompanyBasedOnUser}
              onClear={() =>
                dispatch(
                  getCompanyAction({
                    id: currUser?.id,
                    page: paginationData?.page,
                    size: paginationData?.size,
                    filterUserId: "",
                  })
                )
              }
            />
          )}
        </div>
        {getHighestPriorityRole(currentRoles) === "ADMIN" && (
          <Flex gap={4}>
            <Popover
              open={openPopover}
              onOpenChange={(e) => setOpenPopover(e)}
              trigger={"click"}
              placement="bottomLeft"
              overlayStyle={{ width: 400 }}
              content={
                <Form layout="vertical" form={form} onFinish={handleExportData}>
                  <Form.Item
                    label="Select user"
                    name="filterUserId"
                    rules={[{ required: true, message: "please select user" }]}
                  >
                    <Select
                      showSearch
                      allowClear
                      options={
                        allUsers?.length > 0
                          ? [{ fullName: "All", id: "all" }, ...allUsers]?.map(
                            (item) => ({
                              label: item?.fullName,
                              value: item?.id,
                            })
                          )
                          : []
                      }
                      filterOption={(input, option) =>
                        option.label.toLowerCase().includes(input.toLowerCase())
                      }
                    />
                  </Form.Item>
                  <Form.Item>
                    <Button htmlType="submit" type="primary">
                      Submit
                    </Button>
                  </Form.Item>
                </Form>
              }
            >
              <Button size="small">
                <Icon
                  icon="fluent:filter-24-filled"
                  height={BTN_ICON_HEIGHT}
                  width={BTN_ICON_WIDTH}
                />
                Filter export
              </Button>
            </Popover>

            <CSVLink
              className="text-white"
              data={exportedData}
              headers={headers}
              filename={"companies.csv"}
            >
              <Button size="small">
                <Icon
                  icon="fluent:arrow-upload-16-filled"
                  height={BTN_ICON_HEIGHT}
                  width={BTN_ICON_WIDTH}
                />
                Export
              </Button>
            </CSVLink>
          </Flex>
        )}
      </Flex>
      <div className="mt-3">
        <Suspense fallback={<TableScalaton />}>
          <CommonTable
            data={allCompnay}
            columns={columns}
            scroll={{ x: 2000, y: "63vh" }}
            rowSelection={true}
            onRowSelection={onSelectChange}
            selectedRowKeys={selectedRowKeys}
            rowKey={(record) => record?.companyId}
            pagination={true}
            page={paginationData?.page}
            pageSize={paginationData?.size}
            totalCount={allCompnay?.[0]?.total}
            handlePagination={handlePagination}
            footerContent={
              <div className={`bottom-line`}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    gap: 12,
                  }}
                >
                  <Flex gap={8}>
                    <Select
                      showSearch
                      allowClear
                      size="small"
                      style={{ width: 200 }}
                      value={assigneeId}
                      placeholder="select user"
                      options={
                        leadUserNew?.length > 0
                          ? leadUserNew?.map((ele) => ({
                            label: ele?.fullName,
                            value: ele?.id,
                          }))
                          : []
                      }
                      onChange={(e) => setAssigneeId(e)}
                      onClear={() => setAssigneeId(null)}
                      filterOption={(input, option) =>
                        option.label.toLowerCase().includes(input.toLowerCase())
                      }
                    />
                    <Button
                      type="primary"
                      disabled={
                        selectedRowKeys?.length === 0 && !assigneeId
                          ? true
                          : false
                      }
                      onClick={updateMultiAssigneeForCompanies}
                      size="small"
                    >
                      {assignedProcessing === "pending" ? "Loading..." : "Send"}
                    </Button>
                  </Flex>
                  <Flex gap={8}>
                    <Select
                      showSearch
                      allowClear
                      size="small"
                      style={{ width: 200 }}
                      value={tempAssigneeId}
                      placeholder="select temporary user"
                      options={
                        leadUserNew?.length > 0
                          ? leadUserNew?.map((ele) => ({
                            label: ele?.fullName,
                            value: ele?.id,
                          }))
                          : []
                      }
                      onChange={(e) => setTempAssigneeId(e)}
                      onClear={() => setTempAssigneeId(null)}
                      filterOption={(input, option) =>
                        option.label.toLowerCase().includes(input.toLowerCase())
                      }
                    />
                    <Button
                      type="primary"
                      disabled={
                        selectedRowKeys?.length === 0 && !assigneeId
                          ? true
                          : false
                      }
                      onClick={updateMultiTempAssigneeForCompanies}
                      size="small"
                    >
                      {assignedProcessing === "pending"
                        ? "Loading..."
                        : "Update temp assignee"}
                    </Button>
                  </Flex>
                  <Text>Selected rows: {selectedRowKeys?.length}</Text>
                </div>
              </div>
            }
          />
        </Suspense>
        <Modal open={openModal} onCancel={() => setOpenModal(false)} onClose={() => setOpenModal(false)} onOk={() => companyForm.submit()} okText='Submit' >
          <Form form={companyForm} layout='vertical' onFinish={handleUpdateCompanyName} >
            <Form.Item label='Company name' name='name' rules={[{ required: true, message: 'please enter company name ' }]}>
              <Input />
            </Form.Item>
          </Form>
        </Modal>
      </div>
    </TableOutlet>
  );
};

export default MainCompanyPage;
