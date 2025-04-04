import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getGstDetailsByCompanyId } from "../../../Toolkit/Slices/LeadSlice";
import { Link, useParams } from "react-router-dom";
import {
  Button,
  Flex,
  Form,
  Input,
  Modal,
  notification,
} from "antd";
import { Icon } from "@iconify/react";
import CommonTable from "../../../components/CommonTable";
import AddCompanyInGstAndUnit from "./AddCompanyInGstAndUnit";
import { addConsultantInGST } from "../../../Toolkit/Slices/CompanySlice";
import MainHeading from "../../../components/design/MainHeading";

const CompanyDetailPage = () => {
  const dispatch = useDispatch();
  const [form] = Form.useForm();
  const { userid, companyId } = useParams();
  const companyGstDetailList = useSelector(
    (state) => state.leads.companyGstDetailList
  );
  const [searchText, setSearchText] = useState("");
  const [filteredData, setFilteredData] = useState([]);
  const [openModal, setOpenModal] = useState(false);

  useEffect(() => {
    dispatch(getGstDetailsByCompanyId(companyId));
  }, [dispatch, companyId]);

  useEffect(() => {
    setFilteredData(companyGstDetailList);
  }, [companyGstDetailList]);

  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchText(value);
    const filtered = companyGstDetailList?.filter((item) =>
      Object.values(item)?.some((val) =>
        String(val)?.toLowerCase()?.includes(value?.toLowerCase())
      )
    );
    setFilteredData(filtered);
  };

  const columns = [
    {
      dataIndex: "parentCompanyId",
      title: "Id",
      fixed: "left",
      width: 80,
    },
    {
      dataIndex: "state",
      title: "State",
      render: (_, props) => (
        <Link
          className="link-heading"
          to={`/erp/${userid}/sales/newcompanies/${companyId}/details/${props?.state}/companyUnit`}
        >
          {props?.state}
        </Link>
      ),
    },

    {
      dataIndex: "gstNo",
      title: "GST number",
    },
  ];

  const handleFinish = (values) => {
    values.companyId = companyId;
    dispatch(addConsultantInGST(values))
      .then((resp) => {
        if (resp.meta.requestStatus === "fulfilled") {
          notification.success({ message: "Consultant added successfully !." });
          setOpenModal(false);
          form.resetFields();
        } else {
          notification.error({ message: "Something went wrong !." });
        }
      })
      .catch((err) =>
        notification.error({ message: "Something went wrong !." })
      );
  };

  return (
    <>
      <Flex vertical gap={12}>
        <Flex className="vouchers-header">
          <MainHeading data={`Gst list`} />
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
          <Flex gap={8}>
            {/* <Button type="primary" onClick={() => setOpenModal(true)}>
              Add consultant
            </Button> */}
            <AddCompanyInGstAndUnit gstField={true} />
          </Flex>
        </Flex>
        <CommonTable
          data={filteredData}
          columns={columns}
          scroll={{ y: "69vh" }}
          rowKey={(record) => record?.parentCompanyId}
        />
      </Flex>
      <Modal
        title="Add consultant"
        open={openModal}
        onClose={() => setOpenModal(false)}
        onCancel={() => setOpenModal(false)}
        okText="Submit"
        onOk={() => form.submit()}
      >
        <Form layout="vertical" onFinish={handleFinish} form={form}>
          <Form.Item
            label="Name"
            name="name"
            rules={[{ required: true, message: "please enter your name" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item label="Contact" name="originalContact">
            <Input />
          </Form.Item>
          <Form.Item
            label="Email"
            name="originalEmail"
            rules={[{ type: "email" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item label="Address" name="address">
            <Input.TextArea />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default CompanyDetailPage;
