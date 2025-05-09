import React, { useEffect, useState } from "react";
import MainHeading from "../../../components/design/MainHeading";
import { Button, Form, Input, Modal, notification } from "antd";
import CommonTable from "../../../components/CommonTable";
import { useDispatch, useSelector } from "react-redux";
import { Link, useParams } from "react-router-dom";
import { Icon } from "@iconify/react";
import {
  createBusinessArrangement,
  getAllBusinessArrangement,
  updateBusinessArrangement,
} from "../../../Toolkit/Slices/ProductSlice";

const BusinessArrangement = () => {
  const dispatch = useDispatch();
  const { userid, productId } = useParams();
  const [form] = Form.useForm();
  const businessArrangementList = useSelector(
    (state) => state.product.businessArrangementList
  );
  const [openModal, setOpenModal] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [filteredData, setFilteredData] = useState([]);
  const [editData, setEditData] = useState(null);

  useEffect(() => {
    dispatch(getAllBusinessArrangement(productId));
  }, [dispatch, productId]);

  useEffect(() => {
    setFilteredData(businessArrangementList);
  }, [businessArrangementList]);

  const handleSearch = (e) => {
    const value = e.target.value.trim();
    setSearchText(value);
    const filtered = businessArrangementList?.filter((item) =>
      Object.values(item)?.some((val) =>
        String(val)?.toLowerCase()?.includes(value?.toLowerCase())
      )
    );
    setFilteredData(filtered);
  };

  const handleEdit = (value) => {
    form.setFieldsValue({ name: value?.name });
    setEditData(value);
    setOpenModal(true);
  };

  const columns = [
    {
      dataIndex: "id",
      title: "Id",
    },
    {
      dataIndex: "name",
      title: "Name",
      render: (_, records) => (
        <Link
          className="link-heading"
          to={`/erp/${userid}/setting/erpSetting/products/${productId}/arrangement/${records?.id}/productCategory`}
        >
          {records?.name}
        </Link>
      ),
    },
    {
      dataIndex: "edit",
      title: "Edit",
      render: (_, records) => (
        <Button size="small" onClick={() => handleEdit(records)}>
          Edit
        </Button>
      ),
    },
  ];

  const handleFinish = (values) => {
    if (editData) {
      dispatch(
        updateBusinessArrangement({
          ...values,
          productId: productId,
          id: editData?.id,
        })
      )
        .then((resp) => {
          if (resp.meta.requestStatus === "fulfilled") {
            notification.success({
              message: "Business arrangement updated successfully",
            });
            setOpenModal(false);
            form.resetFields();
            setEditData(null);
            dispatch(getAllBusinessArrangement(productId));
          } else {
            notification.error({ message: "Something went wrong!." });
          }
        })
        .catch(() => notification.error({ message: "Something went wrong!." }));
    } else {
      dispatch(createBusinessArrangement({ ...values, productId: productId }))
        .then((resp) => {
          if (resp.meta.requestStatus === "fulfilled") {
            notification.success({
              message: "Business arrangement created successfully",
            });
            setOpenModal(false);
            form.resetFields();
            dispatch(getAllBusinessArrangement(productId));
          } else {
            notification.error({ message: "Something went wrong!." });
          }
        })
        .catch(() => notification.error({ message: "Something went wrong!." }));
    }
  };

  return (
    <>
      <MainHeading data={`Business arrangement`} />
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          margin: "12px 0px",
        }}
      >
        <Input
          value={searchText}
          onChange={handleSearch}
          style={{ width: "25%" }}
          placeholder="search"
          prefix={<Icon icon="fluent:search-24-regular" />}
        />
        <Button type="primary" size="small" onClick={() => setOpenModal(true)}>
          Add business arrangement
        </Button>
      </div>
      <CommonTable
        columns={columns}
        data={filteredData}
        scroll={{ y: "72vh" }}
      />

      <Modal
        title="Add business arrangement"
        centered
        open={openModal}
        onCancel={() => setOpenModal(false)}
        onClose={() => setOpenModal(false)}
        onOk={() => form.submit()}
        okText="Submit"
      >
        <Form layout="vertical" form={form} onFinish={handleFinish}>
          <Form.Item
            label="Business arrangement name"
            name="name"
            rules={[
              {
                required: true,
                message: "please enter the business arrangement name",
              },
            ]}
          >
            <Input />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default BusinessArrangement;
