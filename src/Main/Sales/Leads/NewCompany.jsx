import { Flex, Input, notification, Select, Typography } from "antd";
import React, { useCallback, useEffect, useState } from "react";
import { Icon } from "@iconify/react";
import CommonTable from "../../../components/CommonTable";
import OverFlowText from "../../../components/OverFlowText";
import {
  getAllLeadUser,
  getAllNewCompanies,
} from "../../../Toolkit/Slices/LeadSlice";
import { useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { getHighestPriorityRole } from "../../Common/Commons";
import ColComp from "../../../components/small/ColComp";
import CompanyHistory from "../company/CompanyHistory";
import {
  getCompanyAction,
  updateCompanyAssignee,
} from "../../../Toolkit/Slices/CompanySlice";
import { getAllUsers } from "../../../Toolkit/Slices/UsersSlice";
import MainHeading from "../../../components/design/MainHeading";
const { Text } = Typography;

const NewCompany = () => {
  const { userid } = useParams();
  const dispatch = useDispatch();
  const allUsers = useSelector((state) => state.user.allUsers);
  const leadUserNew = useSelector((state) => state.leads.getAllLeadUserData);
  const newCompaniesList = useSelector((state) => state.leads.newCompaniesList);
  const currentRoles = useSelector((state) => state?.auth?.roles);
  const [searchText, setSearchText] = useState("");
  const [filteredData, setFilteredData] = useState([]);
  const [filterUserId, setFilterUserId] = useState("");
  const [typeStatus, setTypeStatus] = useState("all");
  const [rating, setRating] = useState("Gold");
  const [paginationData, setPaginationData] = useState({
    page: 1,
    size: 50,
  });

  useEffect(() => {
    dispatch(getAllUsers());
  }, [dispatch]);

  useEffect(() => {
    dispatch(getAllLeadUser(userid));
  }, [userid, dispatch]);

  useEffect(() => {
    setFilteredData(newCompaniesList);
  }, [newCompaniesList]);

  useEffect(() => {
    dispatch(
      getAllNewCompanies({
        userId: userid,
        page: paginationData?.page,
        size: paginationData?.size,
        type: typeStatus,
        filterUserId,
        rating,
      })
    );
  }, [dispatch, userid]);

  const handlePagination = useCallback(
    (dataPage, size) => {
      dispatch(
        getAllNewCompanies({
          userId: userid,
          page: dataPage,
          size: size,
          filterUserId: filterUserId,
        })
      );
      setPaginationData({ size: size, page: dataPage });
    },
    [userid, dispatch, filterUserId]
  );

  const filterCompanyBasedOnUser = useCallback(
    (x, e) => {
      if (e) {
        dispatch(
          getAllNewCompanies({
            userId: userid,
            page: paginationData?.page,
            size: paginationData?.size,
            type: x === "type" ? e : typeStatus,
            filterUserId: x === "user" ? e : filterUserId,
            rating: x === "rating" ? e : rating,
          })
        );
        if (x === "user") {
          setFilterUserId(e);
        } else if (x === "rating") {
          setRating(e);
        } else {
          setTypeStatus(e);
        }
      }
    },
    [paginationData, dispatch, filterUserId, typeStatus]
  );

  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchText(value);
    const filtered = newCompaniesList?.filter((item) =>
      Object.values(item)?.some((val) =>
        String(val)?.toLowerCase()?.includes(value?.toLowerCase())
      )
    );
    setFilteredData(filtered);
  };

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
              getAllNewCompanies({
                userId: userid,
                page: paginationData?.page,
                size: paginationData?.size,
                filterUserId,
                rating
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
    [dispatch, paginationData, filterUserId]
  );

  const columns = [
    {
      dataIndex: "companyId",
      title: "Id",
      fixed: "left",
      width: 80,
    },
    {
      dataIndex: "companyName",
      title: "Company name",
      fixed: "left",
      render: (_, props) => (
        <OverFlowText
          linkText={true}
          to={
            props?.consultantOrCompany
              ? `/erp/${userid}/sales/newcompanies/${props?.companyId}/newConsultantCompanies`
              : `/erp/${userid}/sales/newcompanies/${props?.companyId}/newCompaniesUnit`
          }
        >
          {props?.companyName}
        </OverFlowText>
      ),
    },
    {
      dataIndex: "consultantOrCompany",
      title: "Company type",
      render: (info) => (info ? <Text>Consultant</Text> : <Text>Company</Text>),
    },
    {
      dataIndex: "age",
      title: "Company age",
    },
    {
      dataIndex: "assignee",
      title: "Assignee",
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
    {
      dataIndex: "History",
      title: "Company history",
      render: (_, props) => <CompanyHistory companyId={props.companyId} />,
    },
  ];

  return (
    <>
      <Flex vertical>
        <Flex className="vouchers-header">
          <MainHeading data={`New companies`} />
        </Flex>

        <Flex
          justify="space-between"
          align="center"
          className="marginBottom8px"
        >
          <Flex gap={8} style={{ width: "30%" }}>
            <Input
              prefix={<Icon icon="fluent:search-24-regular" />}
              value={searchText}
              onChange={handleSearch}
              placeholder="search"
            />
            <Select
              style={{ width: "40%" }}
              options={[
                { label: "All", value: "all" },
                { label: "Company", value: "company" },
                { label: "Consultant", value: "consultant" },
              ]}
              value={typeStatus}
              onChange={(e) => filterCompanyBasedOnUser("type", e)}
            />
            <Select
              style={{ width: "40%" }}
              options={[
                { label: "All", value: "all" },
                { label: "Gold", value: "Gold" },
                { label: "Silver", value: "Silver" },
                { label: "Bronze", value: "Bronze" },
              ]}
              value={rating}
              onChange={(e) => filterCompanyBasedOnUser("rating", e)}
            />
          </Flex>
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
              onChange={(e) => filterCompanyBasedOnUser("user", e)}
              onClear={() => {
                dispatch(
                  getAllNewCompanies({
                    userId: userid,
                    page: paginationData?.page,
                    size: paginationData?.size,
                    type: typeStatus,
                    filterUserId: "",
                    rating
                  })
                );
                setFilterUserId("");
              }}
            />
          )}
        </Flex>
        <CommonTable
          data={filteredData}
          columns={columns}
          scroll={{ y: "69vh", x: 2000 }}
          rowKey={(record) => record?.companyId}
          pagination={true}
          page={paginationData?.page}
          pageSize={paginationData?.size}
          totalCount={newCompaniesList?.[0]?.total}
          handlePagination={handlePagination}
        />
      </Flex>
    </>
  );
};

export default NewCompany;
