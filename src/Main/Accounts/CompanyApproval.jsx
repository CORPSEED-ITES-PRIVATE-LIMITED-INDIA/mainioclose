import React, { useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getAllUsers } from "../../Toolkit/Slices/UsersSlice";
import { getAllContactDetails } from "../../Toolkit/Slices/LeadSlice";
import OverFlowText from "../../components/OverFlowText";
import ColComp from "../../components/small/ColComp";
import { Button, Flex, Input, notification, Select, Typography } from "antd";
import TableOutlet from "../../components/design/TableOutlet";
import MainHeading from "../../components/design/MainHeading";
import CommonTable from "../../components/CommonTable";
import { useParams } from "react-router-dom";
import {
  getAllCompaniesForApprovals,
  updateApprovalCompany,
} from "../../Toolkit/Slices/CompanySlice";
import { Icon } from "@iconify/react";
const { Text } = Typography;

const CompanyApproval = () => {
  const dispatch = useDispatch();
  const { userid } = useParams();
  const approvalCompanyList = useSelector(
    (state) => state.company.approvalCompanyList
  );
  const currentRoles = useSelector((state) => state?.auth?.roles);
  const currentUserDetail = useSelector(
    (state) => state.auth.getDepartmentDetail
  );
  const adminRole = currentRoles.includes("ADMIN");
  const [selectedFilter, setSelectedFilter] = useState("initiated");
  const [paginationData, setPaginationData] = useState({
    page: 1,
    size: 50,
  });
  const [searchText, setSearchText] = useState("");
  const [filteredData, setFilteredData] = useState([]);

  useEffect(() => {
    setFilteredData(approvalCompanyList);
  }, [approvalCompanyList]);

  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchText(value);
    const filtered = approvalCompanyList?.filter((item) =>
      Object.values(item)?.some((val) =>
        String(val)?.toLowerCase()?.includes(value?.toLowerCase())
      )
    );
    setFilteredData(filtered);
  };

  useEffect(() => {
    dispatch(getAllUsers());
    dispatch(getAllContactDetails());
  }, [dispatch]);

  useEffect(() => {
    dispatch(
      getAllCompaniesForApprovals({
        userId: userid,
        status: selectedFilter,
        page: paginationData?.page,
        size: paginationData?.size,
      })
    );
  }, [dispatch, selectedFilter, userid]);

  const handlePagination = useCallback(
    (dataPage, size) => {
      dispatch(
        getAllCompaniesForApprovals({
          userId: userid,
          status: selectedFilter,
          page: dataPage,
          size: size,
        })
      );
      setPaginationData({ size: size, page: dataPage });
    },
    [userid, selectedFilter, dispatch]
  );

  const columns = [
    {
      title: "Id",
      dataIndex: "companyId",
      fixed: "left",
      width: 80,
    },
    {
      title: "Company name",
      dataIndex: "companyName",
      fixed: "left",
      render: (_, value) => <OverFlowText>{value?.companyName}</OverFlowText>,
    },
    {
      title: "Gst type",
      dataIndex: "gstType",
      render: (_, data) => <ColComp data={data?.gstType} />,
    },
    {
      title: "Gst no.",
      dataIndex: "gstNo",
      render: (_, data) => <ColComp data={data?.gstNo} />,
    },
    {
      title: "Company age",
      dataIndex: "companyAge",
      render: (_, data) => <ColComp data={data?.age} />,
    },

    {
      title: "Assignee",
      dataIndex: "assignee",
    },
    {
      title: "Address",
      dataIndex: "address",
      render: (_, value) => <OverFlowText>{value?.address}</OverFlowText>,
    },
    {
      title: "City",
      dataIndex: "city",
      render: (_, data) => <ColComp data={data?.city} />,
    },
    {
      title: "State",
      dataIndex: "state",
      render: (_, data) => <ColComp data={data?.state} />,
    },
    {
      title: "Country",
      dataIndex: "country",
      render: (_, data) => <ColComp data={data?.country} />,
    },
    {
      title: "Secondary address",
      dataIndex: "secAddress",
      render: (_, value) => <OverFlowText>{value?.secAddress}</OverFlowText>,
    },
    {
      title: "Secondary city",
      dataIndex: "secCity",
      render: (_, data) => <ColComp data={data?.secCity} />,
    },
    {
      title: "Secondary state",
      dataIndex: "secState",
      render: (_, data) => <ColComp data={data?.secState} />,
    },
    {
      title: "Secondary sountry",
      dataIndex: "seCountry",
      render: (_, data) => <ColComp data={data?.seCountry} />,
    },

    {
      title: "Approved / Disapproved",
      dataIndex: "status",
      render: (_, value) => {
        return (
          <Flex gap={2}>
            <Button
              size="small"
              disabled={value?.status === "approved"}
              onClick={() => {
                dispatch(
                  updateApprovalCompany({
                    userId: userid,
                    companyId: value?.companyId,
                    status: "approved",
                  })
                )
                  .then((resp) => {
                    if (resp.meta.requestStatus === "fulfilled") {
                      notification.success({
                        message: "Company approved successfully !.",
                      });
                    } else {
                      notification.error({
                        message: "Something went wrong !.",
                      });
                    }
                  })
                  .catch(() =>
                    notification.error({
                      message: "Something went wrong !.",
                    })
                  );
              }}
            >
              Approved
            </Button>
            <Button
              size="small"
              disabled={value?.status === "disApproved"}
              onClick={() => {
                dispatch(
                  updateApprovalCompany({
                    userId: userid,
                    companyId: value?.companyId,
                    status: "disApproved",
                  })
                )
                  .then((resp) => {
                    if (resp.meta.requestStatus === "fulfilled") {
                      notification.success({
                        message: "Company disapproved successfully !.",
                      });
                      dispatch(
                        getAllCompaniesForApprovals({
                          userId: userid,
                          status: selectedFilter,
                          page: paginationData?.page,
                          size: paginationData?.size,
                        })
                      );
                    } else {
                      notification.error({
                        message: "Something went wrong !.",
                      });
                    }
                  })
                  .catch(() =>
                    notification.error({
                      message: "Something went wrong !.",
                    })
                  );
              }}
            >
              Disapproved
            </Button>
          </Flex>
        );
      },
    },
  ];
  return (
    <TableOutlet>
      <div className="create-user-box">
        <MainHeading data={"Company approvals"} />
      </div>
      <Flex vertical>
        <Flex gap={8} className="marginBottom8px">
          <Input
            prefix={<Icon icon="fluent:search-24-regular" />}
            value={searchText}
            size="small"
            onChange={handleSearch}
            placeholder="search"
            style={{ width: "25%" }}
          />
          <Select
            style={{ width: "20%" }}
            showSearch
            value={selectedFilter}
            options={[
              { label: "Initiated", value: "initiated" },
              { label: "Approved", value: "approved" },
              { label: "Disapproved", value: "disapproved" },
            ]}
            onChange={(e) => {
              setSelectedFilter(e);
              setPaginationData({
                page: 1,
                size: 50,
              });
            }}
          />
        </Flex>
        <CommonTable
          data={filteredData}
          columns={columns}
          scroll={{ x: 2800, y: "67vh" }}
          rowSelection={true}
          page={paginationData?.page}
          pageSize={paginationData?.size}
          rowKey={(record) => record?.companyId}
          pagination={true}
          totalCount={approvalCompanyList?.[0]?.total}
          handlePagination={handlePagination}
        />
      </Flex>
    </TableOutlet>
  );
};

export default CompanyApproval;
