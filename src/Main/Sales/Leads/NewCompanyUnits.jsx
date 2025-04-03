import { Drawer, Flex, Input, Typography } from "antd";
import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import CommonTable from "../../../components/CommonTable";
import { useDispatch, useSelector } from "react-redux";
import ColComp from "../../../components/small/ColComp";
import OverFlowText from "../../../components/OverFlowText";
import { Icon } from "@iconify/react";
import NewCompanyDetailsPage from "./NewCompanyDetailsPage";
import {
  getCompanyByUnitId,
  getCompanyUnitsByStateAndCompanyId,
} from "../../../Toolkit/Slices/LeadSlice";
import {
  getCompanyLeadsAction,
  getCompanyProjectAction,
} from "../../../Toolkit/Slices/CompanySlice";
import AddCompanyInGstAndUnit from "./AddCompanyInGstAndUnit";
import MainHeading from "../../../components/design/MainHeading";
const { Text } = Typography;

const NewCompanyUnits = () => {
  const dispatch = useDispatch();
  const { state, companyId } = useParams();
  const companyUnitList = useSelector((state) => state.leads.companyUnitList);
  const [openDrawer, setOpenDrawer] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [filteredData, setFilteredData] = useState([]);

  useEffect(() => {
    dispatch(
      getCompanyUnitsByStateAndCompanyId({
        companyId: companyId,
        state: state,
      })
    );
  }, [dispatch,companyId,state]);

  useEffect(() => {
    setFilteredData(companyUnitList);
  }, [companyUnitList]);

  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchText(value);
    const filtered = companyUnitList?.filter((item) =>
      Object.values(item)?.some((val) =>
        String(val)?.toLowerCase()?.includes(value?.toLowerCase())
      )
    );
    setFilteredData(filtered);
  };

  const handleOnCLick = (data) => {
    dispatch(getCompanyByUnitId(data?.companyId));
    dispatch(getCompanyProjectAction({ id: data?.companyId }));
    dispatch(getCompanyLeadsAction({ id: data?.companyId }));
    setOpenDrawer(true);
  };

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
        <Link className="link-heading" onClick={() => handleOnCLick(props)}>
          {props?.companyName}
        </Link>
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
  ];
  return (
    <>
      <Flex vertical gap={12}>
        <Flex className="vouchers-header">
          <MainHeading data={`New company units`} />
        </Flex>

        <Flex
          justify="space-between"
          align="center"
          className="vouchers-header"
        >
          <Input
            prefix={<Icon icon="fluent:search-24-regular" />}
            value={searchText}
            size="small"
            onChange={handleSearch}
            placeholder="search"
            style={{ width: "25%" }}
          />
          <AddCompanyInGstAndUnit />
        </Flex>
        <CommonTable
          data={filteredData}
          columns={columns}
          scroll={{ y: "69vh" }}
          rowKey={(record) => record?.parentCompanyId}
        />
      </Flex>

      <Drawer
        open={openDrawer}
        onClose={() => setOpenDrawer(false)}
        closeIcon={false}
        width={"70%"}
      >
        <NewCompanyDetailsPage />
      </Drawer>
    </>
  );
};

export default NewCompanyUnits;
