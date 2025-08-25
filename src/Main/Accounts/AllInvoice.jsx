import { Drawer, Flex, Input, Typography } from "antd";
import React, { useEffect, useState } from "react";
import CommonTable from "../../components/CommonTable";
import { useDispatch, useSelector } from "react-redux";
import { getAllInvoice } from "../../Toolkit/Slices/AccountSlice";
import { Link, useParams } from "react-router-dom";
import { Icon } from "@iconify/react";
import dayjs from "dayjs";
import ViewEstimate from "./estimate/ViewEstimate";
import { getEstimateByLeadId } from "../../Toolkit/Slices/LeadSlice";
const { Text } = Typography;

const AllInvoice = () => {
  const dispatch = useDispatch();
  const { userid } = useParams();
  const allInvoiceList = useSelector((state) => state.account.allInvoiceList);
  const [filteredData, setFilteredData] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [openDrawer, setOpenDrawer] = useState(false);

  useEffect(() => {
    if (userid) {
      dispatch(getAllInvoice(userid));
    }
  }, [userid,dispatch]);

  useEffect(() => {
    setFilteredData(allInvoiceList);
  }, [allInvoiceList]);

  const handleViewEstimate = (value) => {
    dispatch(getEstimateByLeadId(value?.leadId));
    setOpenDrawer(true);
  };

  const columns = [
    {
      dataIndex: "id",
      title: "Id",
      width: 50,
      fixed:'left'
    },
    {
      dataIndex: "productName",
      title: "Product name",
      render: (_, data) => (
        <Link className="link-heading" onClick={() => handleViewEstimate(data)}>
          {data?.productName}
        </Link>
      ),
      fixed:'left'
    },
    {
      dataIndex: "createDate",
      title: "Created date",
      render: (info) => dayjs(info).format("DD-MM-YYYY hh:mm a"),
    },
    {
      dataIndex: "panNo",
      title: "Pan number",
    },
    {
      dataIndex: "gstNo",
      title: "GST number",
    },
    {
      dataIndex: "orderNumber",
      title: "Order number",
    },
    {
      dataIndex: "purchaseDate",
      title: "Purchase date",
      render: (info) => dayjs(info).format("DD-MM-YYYY hh:mm a"),
    },
    {
      dataIndex: "professionalFees",
      title: "Professional Fee",
    },
    {
      dataIndex: "professionalCode",
      title: "Professional code",
    },
    {
      dataIndex: "profesionalGst",
      title: "Professional gst%",
    },
    {
      dataIndex: "serviceCharge",
      title: "Service fees",
    },
    {
      dataIndex: "serviceCode",
      title: "Service code",
    },
    {
      dataIndex: "serviceGst",
      title: "Service gst%",
    },
    {
      dataIndex: "otherFees",
      title: "Other fees",
    },
    {
      dataIndex: "otherCode",
      title: "Other code",
    },
    {
      dataIndex: "otherGst",
      title: "Other gst%",
    },
    {
      dataIndex: "totalAmount",
      title: "Total amount",
    },
  ];

  const handleSearch = (e) => {
    const value = e.target.value.trim();
    setSearchText(value);
    const filtered = allInvoiceList?.filter((item) =>
      Object.values(item)?.some((val) =>
        String(val)?.toLowerCase()?.includes(value?.toLowerCase())
      )
    );
    setFilteredData(filtered);
  };

  return (
    <>
      <Flex vertical>
        <Flex className="vouchers-header">
          <Text className="heading-text">Invoice list</Text>
        </Flex>
        <Flex
          justify="space-between"
          align="center"
          className="vouchers-header"
        >
          <Input
            prefix={<Icon icon="fluent:search-24-regular" />}
            value={searchText}
            onChange={handleSearch}
            placeholder="search"
            style={{ width: "25%" }}
          />
        </Flex>
        <CommonTable
          data={filteredData}
          columns={columns}
          scroll={{ y: "70vh", x: 2500 }}
        />
      </Flex>
      <Drawer
        open={openDrawer}
        onClose={() => setOpenDrawer(false)}
        width={"60%"}
        closeIcon={null}
      >
        <ViewEstimate invoice={true}    />
      </Drawer>
    </>
  );
};

export default AllInvoice;
