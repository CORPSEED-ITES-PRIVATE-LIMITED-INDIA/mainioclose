import React, { useEffect, useState } from "react";
import MainHeading from "../../../components/design/MainHeading";
import { useDispatch, useSelector } from "react-redux";
import { Link, useParams } from "react-router-dom";
import { Button, Form, Input, Modal, notification } from "antd";
import {
  createProductCategory,
  getAllProductCategoryById,
} from "../../../Toolkit/Slices/ProductSlice";
import CommonTable from "../../../components/CommonTable";
import { Icon } from "@iconify/react";

const ProductCategory = () => {
  const dispatch = useDispatch();
  const { userid, productId, arrangementId } = useParams();
  const [form] = Form.useForm();
  const productCategoryList = useSelector(
    (state) => state.product.productCategoryList
  );
  const [openModal, setOpenModal] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [filteredData, setFilteredData] = useState([]);

  useEffect(() => {
    dispatch(getAllProductCategoryById(arrangementId));
  }, [dispatch, arrangementId]);

  useEffect(() => {
    setFilteredData(productCategoryList);
  }, [productCategoryList]);

  const handleSearch = (e) => {
    const value = e.target.value.trim();
    setSearchText(value);
    const filtered = productCategoryList?.filter((item) =>
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
    },
    {
      dataIndex: "name",
      title: "Name",
      render: (_, records) => (
        <Link
          className="link-heading"
          to={`/erp/${userid}/setting/erpSetting/products/${productId}/arrangement/${arrangementId}/productCategory/${records?.id}`}
        >
          {records?.name}
        </Link>
      ),
    },
  ];

  const handleFinish = (values) => {
    dispatch(
      createProductCategory({ ...values, businessArrangmentId: arrangementId })
    )
      .then((resp) => {
        if (resp.meta.requestStatus === "fulfilled") {
          notification.success({
            message: "Product category created successfully",
          });
          setOpenModal(false);
          form.resetFields()
          dispatch(getAllProductCategoryById(arrangementId));
        } else {
          notification.error({ message: "Something went wrong!." });
        }
      })
      .catch(() => notification.error({ message: "Something went wrong!." }));
  };

  return (
    <>
      <MainHeading data={`Product category`} />
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
      <CommonTable columns={columns} data={filteredData} scroll={{ y: "72vh" }} />

      <Modal
        title="Add product category"
        centered
        open={openModal}
        onCancel={() => setOpenModal(false)}
        onClose={() => setOpenModal(false)}
        onOk={() => form.submit()}
        okText="Submit"
      >
        <Form layout="vertical" form={form} onFinish={handleFinish}>
          <Form.Item
            label="Product category name"
            name="name"
            rules={[
              {
                required: true,
                message: "please enter the product category name",
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

export default ProductCategory;
